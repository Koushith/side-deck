// Streaming AI providers. Lives in the main process so API keys never touch the
// renderer, and so we bypass the renderer's strict `connect-src 'self'` CSP. Each
// provider exposes the same `generate()` shape; the IPC layer pipes chunks back
// to the renderer via webContents.send.

import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

export type AIProvider = 'ollama' | 'openai' | 'anthropic' | 'bedrock';

export interface GenerateOptions {
  provider: AIProvider;
  model: string;
  baseUrl: string;
  apiKey?: string;
  /** Bedrock-only. */
  awsRegion?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  system: string;
  user: string;
  signal: AbortSignal;
  onChunk: (delta: string) => void;
}

export async function generate(opts: GenerateOptions): Promise<void> {
  switch (opts.provider) {
    case 'ollama':
      return generateOllama(opts);
    case 'openai':
      return generateOpenAI(opts);
    case 'anthropic':
      return generateAnthropic(opts);
    case 'bedrock':
      return generateBedrock(opts);
  }
}

/** List models available on a local Ollama server. Empty array on any failure
 *  (network, ollama not running, etc.) — caller decides how to surface. */
export async function listOllamaModels(baseUrl: string): Promise<string[]> {
  try {
    const res = await fetch(`${stripTrailingSlash(baseUrl)}/api/tags`);
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: { name: string }[] };
    return (data.models ?? []).map((m) => m.name);
  } catch {
    return [];
  }
}

// ---------- Ollama ----------
// Ollama returns NDJSON: each chunk is `{"response": "...", "done": false}`.
async function generateOllama(opts: GenerateOptions): Promise<void> {
  const res = await fetch(`${stripTrailingSlash(opts.baseUrl)}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: opts.signal,
    body: JSON.stringify({
      model: opts.model,
      stream: true,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
    }),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama ${res.status}: ${text || res.statusText}`);
  }
  await readNdjson(res.body, opts.signal, (obj) => {
    const o = obj as { message?: { content?: string } } | null;
    const delta = o?.message?.content ?? '';
    if (delta) opts.onChunk(delta);
  });
}

// ---------- OpenAI-compatible ----------
// Uses the chat/completions SSE format. Works for OpenAI, Groq, OpenRouter,
// Together, LM Studio, etc. Base URL must include the `/v1` suffix (default).
async function generateOpenAI(opts: GenerateOptions): Promise<void> {
  if (!opts.apiKey) throw new Error('OpenAI API key not configured.');
  const res = await fetch(`${stripTrailingSlash(opts.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    signal: opts.signal,
    body: JSON.stringify({
      model: opts.model,
      stream: true,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
    }),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI ${res.status}: ${text || res.statusText}`);
  }
  await readSSE(res.body, opts.signal, (data) => {
    if (data === '[DONE]') return;
    try {
      const obj = JSON.parse(data);
      const delta = obj?.choices?.[0]?.delta?.content ?? '';
      if (delta) opts.onChunk(delta);
    } catch {
      /* skip malformed line */
    }
  });
}

// ---------- Anthropic ----------
// Native Anthropic Messages streaming. Events come as SSE with `event:` + `data:`
// pairs. We only need the `content_block_delta` events.
async function generateAnthropic(opts: GenerateOptions): Promise<void> {
  if (!opts.apiKey) throw new Error('Anthropic API key not configured.');
  const res = await fetch(`${stripTrailingSlash(opts.baseUrl)}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: opts.signal,
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 4096,
      stream: true,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    }),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${text || res.statusText}`);
  }
  await readSSE(res.body, opts.signal, (data) => {
    try {
      const obj = JSON.parse(data);
      if (obj?.type === 'content_block_delta' && obj?.delta?.type === 'text_delta') {
        const delta = obj.delta.text as string;
        if (delta) opts.onChunk(delta);
      }
    } catch {
      /* skip */
    }
  });
}

// ---------- Bedrock (Claude on AWS) ----------
// Uses AWS SigV4 via the official SDK so we don't reinvent request signing. We
// only target Claude models on Bedrock — the body matches Anthropic's Messages
// API (just with `anthropic_version: bedrock-2023-05-31` instead of the header).
// Streaming arrives as AWS event-stream binary frames; the SDK decodes those and
// hands us back the same JSON event shape that native Anthropic emits.
async function generateBedrock(opts: GenerateOptions): Promise<void> {
  if (!opts.awsRegion) throw new Error('AWS region not configured.');
  if (!opts.awsAccessKeyId || !opts.awsSecretAccessKey) {
    throw new Error('AWS credentials not configured.');
  }

  const client = new BedrockRuntimeClient({
    region: opts.awsRegion,
    credentials: {
      accessKeyId: opts.awsAccessKeyId,
      secretAccessKey: opts.awsSecretAccessKey,
    },
  });

  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
  };

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: opts.model,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(JSON.stringify(body)),
  });

  const response = await client.send(command, { abortSignal: opts.signal });
  if (!response.body) throw new Error('Bedrock returned no body.');

  const decoder = new TextDecoder();
  for await (const event of response.body) {
    if (opts.signal.aborted) break;
    const bytes = event.chunk?.bytes;
    if (!bytes) continue;
    try {
      const obj = JSON.parse(decoder.decode(bytes));
      if (obj?.type === 'content_block_delta' && obj?.delta?.type === 'text_delta') {
        const delta = obj.delta.text as string;
        if (delta) opts.onChunk(delta);
      }
    } catch {
      /* skip */
    }
  }
}

// ---------- Stream parsers ----------

/** Read NDJSON: each newline-terminated line is a JSON object. */
async function readNdjson(
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  onLine: (obj: unknown) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (!signal.aborted) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line) continue;
      try {
        onLine(JSON.parse(line));
      } catch {
        /* skip */
      }
    }
  }
}

/** Read SSE: `data: <payload>\n\n` framed messages. Ignores comments and event-only lines. */
async function readSSE(
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  onData: (data: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (!signal.aborted) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    // SSE events are separated by a blank line (\n\n).
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const event = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of event.split('\n')) {
        if (line.startsWith('data:')) {
          onData(line.slice(5).trim());
        }
      }
    }
  }
}

function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, '');
}
