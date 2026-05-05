import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeResizer,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type NodeProps,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
  ConnectionLineType,
  MarkerType,
  useOnSelectionChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useVault } from '@/stores/vault';
import { api } from '@/lib/api';
import { joinPath, basenameNoExt } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { FileText, Plus, StickyNote, Type, Trash2, X } from 'lucide-react';

// ---- Canvas file format ----
interface CanvasFile { version: 1; nodes: CanvasNode[]; edges: CanvasEdge[] }
type CanvasNode =
  | { id: string; type: 'text'; x: number; y: number; width: number; height: number; text: string }
  | { id: string; type: 'file'; x: number; y: number; width: number; height: number; file: string };
interface CanvasEdge {
  id: string; fromNode: string; toNode: string;
  fromSide?: string; toSide?: string; label?: string;
}

const EMPTY: CanvasFile = { version: 1, nodes: [], edges: [] };
const EDGE_STYLE = { stroke: 'rgb(var(--c-accent))', strokeWidth: 1.5 };
const EDGE_DEFAULTS = {
  type: 'smoothstep',
  animated: false,
  style: EDGE_STYLE,
  markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(var(--c-accent))', width: 14, height: 14 },
};

interface Props { rel: string; vaultPath: string }

export function CanvasView(props: Props) {
  return <ReactFlowProvider><CanvasInner {...props} /></ReactFlowProvider>;
}

function CanvasInner({ rel, vaultPath }: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const saveTimer = useRef<number | null>(null);
  const flow = useReactFlow();

  useOnSelectionChange({
    onChange: ({ nodes: sn }) => setSelectedIds(sn.map((n) => n.id)),
  });

  // Load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await api.files.read(joinPath(vaultPath, rel));
        const data: CanvasFile = raw.trim() ? JSON.parse(raw) : EMPTY;
        if (cancelled) return;
        setNodes(canvasNodesToFlow(data.nodes));
        setEdges(canvasEdgesToFlow(data.edges));
        setLoaded(true);
        setTimeout(() => flow.fitView({ padding: 0.3, duration: 300 }), 50);
      } catch (err) {
        console.error('Failed to load canvas', err);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [rel, vaultPath, flow]);

  // Save
  const queueSave = useCallback((n: Node[], e: Edge[]) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        await api.files.write(joinPath(vaultPath, rel), JSON.stringify(
          { version: 1, nodes: flowNodesToCanvas(n), edges: flowEdgesToCanvas(e) } satisfies CanvasFile,
          null, 2
        ));
      } catch (err) { console.error('Failed to save canvas', err); }
    }, 350);
  }, [vaultPath, rel]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((cur) => {
      const next = applyNodeChanges(changes, cur);
      if (loaded) queueSave(next, edges);
      return next;
    });
  }, [edges, loaded, queueSave]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((cur) => {
      const next = applyEdgeChanges(changes, cur);
      if (loaded) queueSave(nodes, next);
      return next;
    });
  }, [nodes, loaded, queueSave]);

  const onConnect = useCallback((conn: Connection) => {
    setEdges((cur) => {
      const next = addEdge({ ...conn, ...EDGE_DEFAULTS }, cur);
      if (loaded) queueSave(nodes, next);
      return next;
    });
  }, [nodes, loaded, queueSave]);

  const onNodesDelete = useCallback((deleted: Node[]) => {
    const ids = new Set(deleted.map((n) => n.id));
    setEdges((cur) => {
      const next = cur.filter((e) => !ids.has(e.source) && !ids.has(e.target));
      queueSave(nodes.filter((n) => !ids.has(n.id)), next);
      return next;
    });
  }, [nodes, queueSave]);

  const updateNodeData = useCallback((id: string, patch: Record<string, unknown>) => {
    setNodes((cur) => {
      const next = cur.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n);
      queueSave(next, edges);
      return next;
    });
  }, [edges, queueSave]);

  const removeNode = useCallback((id: string) => {
    setNodes((cur) => {
      const next = cur.filter((n) => n.id !== id);
      setEdges((curEdges) => {
        const newEdges = curEdges.filter((e) => e.source !== id && e.target !== id);
        queueSave(next, newEdges);
        return newEdges;
      });
      return next;
    });
  }, [queueSave]);

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) return;
    setNodes((cur) => {
      const next = cur.filter((n) => !selectedIds.includes(n.id));
      setEdges((curEdges) => {
        const next2 = curEdges.filter((e) => !selectedIds.includes(e.source) && !selectedIds.includes(e.target));
        queueSave(next, next2);
        return next2;
      });
      return next;
    });
    setSelectedIds([]);
  }, [selectedIds, queueSave]);

  const addCard = useCallback((kind: 'text' | 'file', file?: string) => {
    const { x, y, zoom } = flow.getViewport();
    const cx = (window.innerWidth / 2 - x) / zoom;
    const cy = (window.innerHeight / 2 - y) / zoom;
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const node: Node = kind === 'text'
      ? { id, type: 'textCard', position: { x: cx - 130, y: cy - 70 }, data: { text: '' }, width: 260, height: 140 }
      : { id, type: 'fileCard', position: { x: cx - 150, y: cy - 80 }, data: { file }, width: 300, height: 160 };
    setNodes((cur) => { const next = [...cur, node]; queueSave(next, edges); return next; });
  }, [flow, edges, queueSave]);

  const nodeTypes = useMemo(() => ({
    textCard: (p: NodeProps) => (
      <TextCard {...p} onChange={(text) => updateNodeData(p.id, { text })} onRemove={() => removeNode(p.id)} />
    ),
    fileCard: (p: NodeProps) => <FileCard {...p} onRemove={() => removeNode(p.id)} />,
  }), [updateNodeData, removeNode]);

  const onDrop = useCallback((e: React.DragEvent) => {
    const fileRel = e.dataTransfer.getData('text/x-rel');
    if (!fileRel) return;
    e.preventDefault();
    const bounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const point = flow.screenToFlowPosition({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const node: Node = { id, type: 'fileCard', position: { x: point.x - 150, y: point.y - 80 }, data: { file: fileRel }, width: 300, height: 160 };
    setNodes((cur) => { const next = [...cur, node]; queueSave(next, edges); return next; });
  }, [flow, edges, queueSave]);

  return (
    <div
      className="relative w-full h-full"
      onDragOver={(e) => { if (e.dataTransfer.types.includes('text/x-rel')) e.preventDefault(); }}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        minZoom={0.1}
        maxZoom={3}
        defaultEdgeOptions={EDGE_DEFAULTS}
        connectionLineType={ConnectionLineType.SmoothStep}
        deleteKeyCode={['Delete', 'Backspace']}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Meta"
        elevateNodesOnSelect
      >
        <Background gap={24} size={1} color="rgb(var(--c-border) / 0.5)" />
        <Controls
          position="bottom-right"
          showInteractive={false}
          style={{ background: 'rgb(var(--c-bg-elevated))', border: '1px solid rgb(var(--c-border))', borderRadius: 8 }}
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => n.type === 'fileCard' ? 'rgb(var(--c-link))' : 'rgb(var(--c-accent))'}
          maskColor="rgb(var(--c-bg) / 0.7)"
          style={{ background: 'rgb(var(--c-bg-elevated))', border: '1px solid rgb(var(--c-border))', borderRadius: 8 }}
        />
      </ReactFlow>

      {/* Toolbar */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <button
          onClick={() => addCard('text')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated/95 backdrop-blur border border-border text-[12.5px] text-text-muted hover:text-text hover:bg-bg-hover transition-colors shadow-sm"
        >
          <Type size={12} />
          Text
        </button>
        <FileCardPicker onPick={(rel) => addCard('file', rel)} />
        {selectedIds.length > 0 && (
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated/95 backdrop-blur border border-border text-[12.5px] text-red-400 hover:bg-red-500/10 hover:border-red-400/40 transition-colors shadow-sm"
          >
            <Trash2 size={12} />
            Delete {selectedIds.length > 1 ? `${selectedIds.length} ` : ''}selected
          </button>
        )}
      </div>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-bg-elevated/80 backdrop-blur border border-border rounded-xl px-8 py-5">
            <div className="font-serif text-[15px] font-semibold text-text mb-1">Empty canvas</div>
            <div className="text-[12px] text-text-muted">
              Drop a note from the sidebar, or use the toolbar to add a card.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- TextCard ----
function TextCard({
  data, selected, onChange, onRemove,
}: NodeProps & { onChange: (s: string) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState((data.text as string) ?? '');
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setText((data.text as string) ?? ''); }, [data.text]);
  useEffect(() => { if (editing) taRef.current?.focus(); }, [editing]);

  function commit() {
    setEditing(false);
    onChange(text);
  }

  return (
    <div className={cn(
      'group w-full h-full flex flex-col rounded-xl bg-bg-elevated border shadow-md overflow-hidden transition-colors',
      selected ? 'border-accent/60 shadow-accent/10' : 'border-border hover:border-border-subtle'
    )}>
      <NodeResizer
        isVisible={selected}
        minWidth={160} minHeight={80}
        lineClassName="!border-accent/50"
        handleClassName="!w-2.5 !h-2.5 !rounded-sm !bg-bg-elevated !border !border-accent/60"
      />
      <CardHandles color="accent" />

      {/* Drag handle bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-bg cursor-grab active:cursor-grabbing shrink-0">
        <div className="flex items-center gap-1.5">
          <Type size={11} className="text-text-subtle" />
          <span className="text-[10px] uppercase tracking-wider text-text-subtle">Text</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-[10px] text-text-subtle hover:text-text px-1.5 py-0.5 rounded hover:bg-bg-hover nodrag"
            >
              Edit
            </button>
          )}
          <button onClick={onRemove} className="p-0.5 rounded text-text-subtle hover:text-red-400 nodrag" title="Delete">
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden nodrag" onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Escape') commit(); }}
            placeholder="Type something… (markdown supported)"
            className="w-full h-full bg-transparent outline-none p-3 text-[12.5px] text-text resize-none placeholder:text-text-subtle leading-relaxed"
          />
        ) : (
          <div className="w-full h-full overflow-hidden p-3 cursor-text select-none">
            {text ? (
              <MarkdownPreview text={text} />
            ) : (
              <span className="text-[12.5px] text-text-subtle italic">Double-click to edit…</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- FileCard ----
function FileCard({ data, selected, onRemove }: NodeProps & { onRemove: () => void }) {
  const fileRel = data.file as string;
  const file = useVault((s) => s.files.get(fileRel));
  const openFile = useVault((s) => s.openFile);
  const setView = useVault((s) => s.setView);
  const vaultPath = useVault((s) => s.vaultPath);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!vaultPath || !file) return;
    let cancelled = false;
    (async () => {
      try {
        const raw = await api.files.read(file.path);
        if (cancelled) return;
        const noFm = raw.replace(/^---\n[\s\S]*?\n---\n?/, '').replace(/^#+\s.*\n+/, '').trim();
        setPreview(noFm.slice(0, 400));
      } catch { /* skip */ }
    })();
    return () => { cancelled = true; };
  }, [vaultPath, file]);

  return (
    <div className={cn(
      'group w-full h-full flex flex-col rounded-xl bg-bg-elevated border shadow-md overflow-hidden transition-colors',
      selected ? 'border-link/60 shadow-link/10' : 'border-border hover:border-link/30'
    )}>
      <NodeResizer
        isVisible={selected}
        minWidth={180} minHeight={100}
        lineClassName="!border-link/50"
        handleClassName="!w-2.5 !h-2.5 !rounded-sm !bg-bg-elevated !border !border-link/60"
      />
      <CardHandles color="link" />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-bg shrink-0 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText size={11} className="text-link shrink-0" />
          <button
            onClick={() => { if (file) { openFile(file.rel); setView('editor'); } }}
            className="text-[12.5px] font-semibold text-text truncate hover:text-link transition-colors nodrag"
            title={fileRel}
          >
            {file?.title || basenameNoExt(fileRel)}
          </button>
        </div>
        <button
          onClick={onRemove}
          className="p-0.5 rounded text-text-subtle hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity nodrag"
          title="Remove from canvas"
        >
          <X size={11} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-3">
        {file ? (
          preview
            ? <MarkdownPreview text={preview} className="text-text-muted" />
            : <span className="text-[12px] italic text-text-subtle">empty note</span>
        ) : (
          <span className="text-[12px] italic text-tag">missing: {fileRel}</span>
        )}
      </div>
    </div>
  );
}

// ---- Handles ----
function CardHandles({ color }: { color: 'accent' | 'link' }) {
  const base = 'transition-opacity !w-2 !h-2 !border-0 opacity-0 group-hover:opacity-100';
  const cls = color === 'accent' ? `${base} !bg-accent` : `${base} !bg-link`;
  return (
    <>
      <Handle id="top" type="source" position={Position.Top} className={cls} />
      <Handle id="top" type="target" position={Position.Top} className={cls} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="right" type="source" position={Position.Right} className={cls} />
      <Handle id="right" type="target" position={Position.Right} className={cls} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={cls} />
      <Handle id="bottom" type="target" position={Position.Bottom} className={cls} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="left" type="target" position={Position.Left} className={cls} />
      <Handle id="left" type="source" position={Position.Left} className={cls} style={{ opacity: 0, pointerEvents: 'none' }} />
    </>
  );
}

// ---- Markdown renderer (inline, no deps) ----
function MarkdownPreview({ text, className }: { text: string; className?: string }) {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const hm = line.match(/^(#{1,6})\s+(.*)/);
    if (hm) {
      const lvl = hm[1].length;
      nodes.push(
        <div key={i} className={cn('font-serif font-semibold text-text truncate', lvl === 1 ? 'text-[14px]' : 'text-[12.5px]')}>
          {inlineMarkdown(hm[2])}
        </div>
      );
      i++; continue;
    }
    const bm = line.match(/^[-*+]\s+(.*)/);
    if (bm) {
      nodes.push(
        <div key={i} className="flex items-start gap-1.5 text-[12px] leading-snug">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-text-subtle shrink-0" />
          <span>{inlineMarkdown(bm[1])}</span>
        </div>
      );
      i++; continue;
    }
    const om = line.match(/^\d+\.\s+(.*)/);
    if (om) {
      const num = line.match(/^(\d+)/)?.[1] ?? '1';
      nodes.push(
        <div key={i} className="flex items-start gap-1.5 text-[12px] leading-snug">
          <span className="text-text-subtle shrink-0 font-mono text-[10px] mt-0.5">{num}.</span>
          <span>{inlineMarkdown(om[1])}</span>
        </div>
      );
      i++; continue;
    }
    if (!line.trim()) {
      if (nodes.length > 0) nodes.push(<div key={i} className="h-1.5" />);
      i++; continue;
    }
    nodes.push(
      <p key={i} className="text-[12px] leading-relaxed">
        {inlineMarkdown(line)}
      </p>
    );
    i++;
  }
  return <div className={cn('space-y-0.5 overflow-hidden', className)}>{nodes}</div>;
}

function inlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[\[[^\]\n|]+(?:\|[^\]\n]+)?\]\])/g);
  return parts.map((part, i) => {
    if (/^\*\*.*\*\*$/.test(part))
      return <strong key={i} className="font-semibold text-text">{part.slice(2, -2)}</strong>;
    if (/^\*.*\*$/.test(part))
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    if (/^`.*`$/.test(part))
      return <code key={i} className="font-mono text-[10.5px] bg-bg px-1 py-px rounded">{part.slice(1, -1)}</code>;
    if (/^\[\[.*\]\]$/.test(part)) {
      const inner = part.slice(2, -2);
      const display = inner.includes('|') ? inner.split('|')[1] : inner;
      return <span key={i} className="text-link font-medium">{display}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ---- Note picker dropdown ----
function FileCardPicker({ onPick }: { onPick: (rel: string) => void }) {
  const files = useVault((s) => s.files);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const matches = useMemo(() => {
    const arr = [...files.values()].filter((f) => !f.rel.endsWith('.canvas'));
    const query = q.trim().toLowerCase();
    if (!query) return arr.sort((a, b) => b.mtime - a.mtime).slice(0, 10);
    return arr.filter((f) => (f.title || f.name).toLowerCase().includes(query)).slice(0, 10);
  }, [files, q]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated/95 backdrop-blur border border-border text-[12.5px] text-text-muted hover:text-text hover:bg-bg-hover transition-colors shadow-sm"
      >
        <StickyNote size={12} />
        Note
        <Plus size={10} className="text-text-subtle" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-border bg-bg-elevated shadow-2xl py-1 z-50" onMouseLeave={() => setOpen(false)}>
          <input
            autoFocus
            placeholder="Search notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-transparent outline-none px-3 py-2 text-[12.5px] border-b border-border placeholder:text-text-subtle"
          />
          <div className="max-h-64 overflow-y-auto">
            {matches.length === 0
              ? <div className="px-3 py-3 text-xs text-text-subtle">No notes</div>
              : matches.map((f) => (
                <button
                  key={f.rel}
                  onClick={() => { onPick(f.rel); setOpen(false); setQ(''); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-hover"
                >
                  <FileText size={12} className="text-text-subtle shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-text truncate">{f.title || f.name}</div>
                    <div className="text-[10.5px] text-text-subtle truncate">{f.rel}</div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Conversions ----
function canvasNodesToFlow(nodes: CanvasNode[]): Node[] {
  return nodes.map((n) => {
    const base: Node = { id: n.id, position: { x: n.x, y: n.y }, width: n.width, height: n.height, data: {} };
    return n.type === 'text'
      ? { ...base, type: 'textCard', data: { text: n.text } }
      : { ...base, type: 'fileCard', data: { file: n.file } };
  });
}

function canvasEdgesToFlow(edges: CanvasEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id, source: e.fromNode, target: e.toNode,
    sourceHandle: e.fromSide, targetHandle: e.toSide,
    label: e.label, ...EDGE_DEFAULTS,
  }));
}

function flowNodesToCanvas(nodes: Node[]): CanvasNode[] {
  return nodes.map((n) => {
    const w = (n.width as number) ?? (n.style?.width as number) ?? 260;
    const h = (n.height as number) ?? (n.style?.height as number) ?? 140;
    if (n.type === 'fileCard') {
      return { id: n.id, type: 'file', x: n.position.x, y: n.position.y, width: w, height: h, file: (n.data.file as string) ?? '' };
    }
    return { id: n.id, type: 'text', x: n.position.x, y: n.position.y, width: w, height: h, text: (n.data.text as string) ?? '' };
  });
}

function flowEdgesToCanvas(edges: Edge[]): CanvasEdge[] {
  return edges.map((e) => ({
    id: e.id, fromNode: e.source, toNode: e.target,
    fromSide: e.sourceHandle ?? undefined, toSide: e.targetHandle ?? undefined,
    label: typeof e.label === 'string' ? e.label : undefined,
  }));
}
