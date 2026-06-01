import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useAI } from '@/stores/ai';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { AIProvider } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PROVIDER_LABEL: Record<AIProvider, string> = {
  ollama: 'Ollama',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  bedrock: 'Bedrock',
};

const PROVIDER_HINT: Record<AIProvider, string> = {
  ollama: 'Runs on your machine. Free, private. Pick from your installed models.',
  openai: 'OpenAI-compatible. Base URL is editable — works with OpenAI, Groq, OpenRouter, LM Studio, Together, and more.',
  anthropic: 'Native Anthropic Messages API. Bring your own key from console.anthropic.com.',
  bedrock: 'Claude on AWS Bedrock. Uses your IAM access key + secret. Requires Bedrock model access enabled in your AWS account.',
};

export function AISettings({ open, onClose }: Props) {
  const settings = useAI((s) => s.settings);
  const loadSettings = useAI((s) => s.loadSettings);
  const saveSettings = useAI((s) => s.saveSettings);

  const [provider, setProvider] = useState<AIProvider>('ollama');

  // Per-provider draft state. We track them all separately so toggling between
  // providers doesn't lose what the user just typed.
  const [ollamaBase, setOllamaBase] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);

  const [openaiBase, setOpenaiBase] = useState('https://api.openai.com/v1');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiHasKey, setOpenaiHasKey] = useState(false);

  const [anthropicBase, setAnthropicBase] = useState('https://api.anthropic.com');
  const [anthropicModel, setAnthropicModel] = useState('claude-sonnet-4-6');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [anthropicHasKey, setAnthropicHasKey] = useState(false);

  const [bedrockRegion, setBedrockRegion] = useState('us-east-1');
  const [bedrockModel, setBedrockModel] = useState('anthropic.claude-3-5-sonnet-20241022-v2:0');
  const [bedrockAccessKey, setBedrockAccessKey] = useState('');
  const [bedrockSecretKey, setBedrockSecretKey] = useState('');
  const [bedrockHasCreds, setBedrockHasCreds] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (open && !settings) loadSettings();
  }, [open, settings, loadSettings]);

  useEffect(() => {
    if (!settings) return;
    setProvider(settings.provider);
    setOllamaBase(settings.ollama.baseUrl);
    setOllamaModel(settings.ollama.model);
    setOpenaiBase(settings.openai.baseUrl);
    setOpenaiModel(settings.openai.model);
    setOpenaiHasKey(settings.openai.hasKey);
    setOpenaiKey('');
    setAnthropicBase(settings.anthropic.baseUrl);
    setAnthropicModel(settings.anthropic.model);
    setAnthropicHasKey(settings.anthropic.hasKey);
    setAnthropicKey('');
    setBedrockRegion(settings.bedrock.region);
    setBedrockModel(settings.bedrock.model);
    setBedrockHasCreds(settings.bedrock.hasCreds);
    setBedrockAccessKey('');
    setBedrockSecretKey('');
  }, [settings, open]);

  const refreshOllamaModels = async () => {
    setOllamaLoading(true);
    try {
      const list = await api.ai.listOllamaModels(ollamaBase);
      setOllamaModels(list);
      if (list.length && !list.includes(ollamaModel)) {
        setOllamaModel(list[0]);
      }
    } finally {
      setOllamaLoading(false);
    }
  };

  // Auto-fetch ollama models when the modal opens or when switching to Ollama.
  useEffect(() => {
    if (open && provider === 'ollama') refreshOllamaModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, provider, ollamaBase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onSave = async () => {
    setSaving(true);
    setSaveError(null);
    const saved = await saveSettings({
      provider,
      ollama: { baseUrl: ollamaBase, model: ollamaModel },
      openai: {
        baseUrl: openaiBase,
        model: openaiModel,
        // Only send apiKey if the user typed a new one — keeps existing stored key intact.
        ...(openaiKey ? { apiKey: openaiKey } : {}),
      },
      anthropic: {
        baseUrl: anthropicBase,
        model: anthropicModel,
        ...(anthropicKey ? { apiKey: anthropicKey } : {}),
      },
      bedrock: {
        region: bedrockRegion,
        model: bedrockModel,
        ...(bedrockAccessKey ? { accessKeyId: bedrockAccessKey } : {}),
        ...(bedrockSecretKey ? { secretAccessKey: bedrockSecretKey } : {}),
      },
    });
    setSaving(false);
    if (saved) onClose();
    else setSaveError('Failed to save. Check the terminal logs.');
  };

  const onClearKey = async (which: 'openai' | 'anthropic') => {
    setSaving(true);
    await saveSettings({ [which]: { apiKey: null } });
    setSaving(false);
    if (which === 'openai') {
      setOpenaiHasKey(false);
      setOpenaiKey('');
    } else {
      setAnthropicHasKey(false);
      setAnthropicKey('');
    }
  };

  const onClearBedrockCreds = async () => {
    setSaving(true);
    await saveSettings({ bedrock: { accessKeyId: null, secretAccessKey: null } });
    setSaving(false);
    setBedrockHasCreds(false);
    setBedrockAccessKey('');
    setBedrockSecretKey('');
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-[560px] max-w-[94vw] max-h-[88vh] overflow-y-auto rounded-xl border border-border bg-bg-elevated shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border-subtle">
          <h2 className="font-serif text-[15px] font-semibold text-text">AI settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-bg-hover"
          >
            <X size={14} />
          </button>
        </div>

        {/* Provider tabs */}
        <div className="px-5 pt-4 pb-2">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-text-subtle mb-2">
            Provider
          </div>
          <div className="flex gap-1 p-1 rounded-md bg-bg border border-border">
            {(['ollama', 'openai', 'anthropic', 'bedrock'] as AIProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={cn(
                  'flex-1 px-3 py-1.5 rounded text-[12.5px] transition-colors',
                  provider === p
                    ? 'bg-bg-elevated text-text font-medium shadow-sm'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {PROVIDER_LABEL[p]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] text-text-subtle leading-snug">{PROVIDER_HINT[provider]}</p>
        </div>

        {/* Provider-specific fields */}
        <div className="px-5 py-4 space-y-4 border-t border-border-subtle">
          {provider === 'ollama' && (
            <>
              <Field label="Base URL">
                <input
                  value={ollamaBase}
                  onChange={(e) => setOllamaBase(e.target.value)}
                  className={inputClass}
                  placeholder="http://localhost:11434"
                />
              </Field>
              <Field label="Model">
                <div className="flex gap-2">
                  {ollamaModels.length > 0 ? (
                    <select
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      className={cn(inputClass, 'flex-1')}
                    >
                      {!ollamaModels.includes(ollamaModel) && ollamaModel && (
                        <option value={ollamaModel}>{ollamaModel} (not installed)</option>
                      )}
                      {ollamaModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      placeholder="e.g. llama3.2, qwen2.5:7b"
                      className={cn(inputClass, 'flex-1')}
                    />
                  )}
                  <button
                    onClick={refreshOllamaModels}
                    disabled={ollamaLoading}
                    className="px-2.5 py-2 border border-border rounded-md text-text-muted hover:bg-bg-hover hover:text-text disabled:opacity-50 transition-colors"
                    title="Re-detect installed models"
                  >
                    <RefreshCw size={13} className={ollamaLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
                {ollamaModels.length === 0 && !ollamaLoading && (
                  <p className="mt-1.5 text-[11px] text-text-subtle">
                    Couldn't reach Ollama at <code>{ollamaBase}</code>. Make sure it's running
                    (<code>ollama serve</code>) and you have at least one model pulled.
                  </p>
                )}
              </Field>
            </>
          )}

          {provider === 'openai' && (
            <>
              <Field label="Base URL">
                <input
                  value={openaiBase}
                  onChange={(e) => setOpenaiBase(e.target.value)}
                  className={inputClass}
                  placeholder="https://api.openai.com/v1"
                />
              </Field>
              <Field label="Model">
                <input
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  className={inputClass}
                  placeholder="gpt-4o-mini"
                />
              </Field>
              <Field label="API key">
                <KeyInput
                  hasKey={openaiHasKey}
                  value={openaiKey}
                  onChange={setOpenaiKey}
                  onClear={() => onClearKey('openai')}
                  placeholder="sk-..."
                />
              </Field>
            </>
          )}

          {provider === 'anthropic' && (
            <>
              <Field label="Base URL">
                <input
                  value={anthropicBase}
                  onChange={(e) => setAnthropicBase(e.target.value)}
                  className={inputClass}
                  placeholder="https://api.anthropic.com"
                />
              </Field>
              <Field label="Model">
                <input
                  value={anthropicModel}
                  onChange={(e) => setAnthropicModel(e.target.value)}
                  className={inputClass}
                  placeholder="claude-sonnet-4-6"
                />
              </Field>
              <Field label="API key">
                <KeyInput
                  hasKey={anthropicHasKey}
                  value={anthropicKey}
                  onChange={setAnthropicKey}
                  onClear={() => onClearKey('anthropic')}
                  placeholder="sk-ant-..."
                />
              </Field>
            </>
          )}

          {provider === 'bedrock' && (
            <>
              <div className="grid grid-cols-[1fr_2fr] gap-3">
                <Field label="Region">
                  <input
                    value={bedrockRegion}
                    onChange={(e) => setBedrockRegion(e.target.value)}
                    className={inputClass}
                    placeholder="us-east-1"
                  />
                </Field>
                <Field label="Model ID">
                  <input
                    value={bedrockModel}
                    onChange={(e) => setBedrockModel(e.target.value)}
                    className={cn(inputClass, 'font-mono text-[11.5px]')}
                    placeholder="anthropic.claude-3-5-sonnet-20241022-v2:0"
                  />
                </Field>
              </div>
              <Field label="Access key ID">
                <KeyInput
                  hasKey={bedrockHasCreds}
                  value={bedrockAccessKey}
                  onChange={setBedrockAccessKey}
                  onClear={onClearBedrockCreds}
                  placeholder="AKIA…"
                  hideHelp
                />
              </Field>
              <Field label="Secret access key">
                <KeyInput
                  hasKey={bedrockHasCreds}
                  value={bedrockSecretKey}
                  onChange={setBedrockSecretKey}
                  onClear={onClearBedrockCreds}
                  placeholder="••••••••"
                />
              </Field>
              <p className="text-[11px] text-text-subtle leading-snug">
                Tip: create a dedicated IAM user with the <code>AmazonBedrockFullAccess</code> policy
                (or a tighter one limited to <code>bedrock:InvokeModelWithResponseStream</code>) and
                use its keys here.
              </p>
            </>
          )}
        </div>

        {saveError && (
          <div className="px-5 pb-2 text-[12px] text-red-500">{saveError}</div>
        )}

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[12.5px] rounded-md text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-1.5 text-[12.5px] font-medium rounded-md bg-accent text-bg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full px-2.5 py-2 text-[12.5px] rounded-md bg-bg border border-border outline-none focus:border-accent focus:ring-1 focus:ring-accent/30';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-text-subtle mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}

function KeyInput({
  hasKey,
  value,
  onChange,
  onClear,
  placeholder,
  hideHelp,
}: {
  hasKey: boolean;
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  placeholder: string;
  hideHelp?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hasKey ? '•••••••••• (saved, leave blank to keep)' : placeholder}
          className={cn(inputClass, 'flex-1 font-mono')}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={() => setShow((v) => !v)}
          type="button"
          className="px-2.5 py-2 text-[11px] border border-border rounded-md text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {hasKey && (
        <button
          onClick={onClear}
          type="button"
          className="text-[11px] text-red-500 hover:underline"
        >
          Clear saved key
        </button>
      )}
      {!hideHelp && (
        <p className="text-[10.5px] text-text-subtle leading-snug">
          Stored encrypted on disk via your OS keychain. Never sent anywhere except the configured endpoint.
        </p>
      )}
    </div>
  );
}
