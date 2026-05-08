import { useEffect, useMemo, useRef, useState } from 'react';
import Sigma from 'sigma';
import { NodeCircleProgram } from 'sigma/rendering';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { useVault } from '@/stores/vault';
import { useTheme } from '@/stores/theme';
import { resolveWikilink } from '@/lib/markdown';
import { Maximize2, Compass, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Read a `--c-*` CSS variable (stored as "R G B" triples) and return an `rgb(...)` color
 *  Sigma can ingest. We re-read these on every render that depends on the theme so
 *  switching theme/mode repaints the graph correctly. */
function readVar(name: string, fallback = '0 0 0'): string {
  const triple = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  return `rgb(${triple})`;
}

function readVarRgba(name: string, alpha: number, fallback = '0 0 0'): string {
  const triple = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const [r, g, b] = triple.split(/\s+/);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Look at the actual `--c-bg` luminance, not the user-facing `mode`. Carbon's "light" mode
 *  is intentionally a charcoal background, so we can't trust mode alone to pick a palette. */
function isBgDark(): boolean {
  const triple = getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim();
  if (!triple) return false;
  const [r, g, b] = triple.split(/\s+/).map(Number);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}

// Categorical palettes — saturated mid-darks for light themes, soft pastels for dark themes.
const PALETTE_LIGHT = [
  '#4f6cc9', // indigo
  '#0e8aa8', // teal
  '#c25d2a', // burnt orange
  '#3a8c4a', // forest
  '#b53a72', // rose
  '#6845b3', // violet
  '#a87211', // mustard
  '#1a8c79', // deep mint
  '#b73838', // crimson
  '#52607a', // slate
];

const PALETTE_DARK = [
  '#7c8cff',
  '#7cd4ff',
  '#f0a868',
  '#9ee493',
  '#ff9ec5',
  '#c8a8ff',
  '#ffd166',
  '#7ee0c4',
  '#ff8a7a',
  '#a8b3d1',
];

function buildFolderColors(folderKeys: string[], bgIsDark: boolean): Map<string, string> {
  const palette = bgIsDark ? PALETTE_DARK : PALETTE_LIGHT;
  // Sort so the assignment is deterministic across renders, with `/` (root) pinned first.
  const sorted = [...new Set(folderKeys)].sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });
  const out = new Map<string, string>();
  sorted.forEach((key, i) => out.set(key, palette[i % palette.length]));
  return out;
}

export function GraphView() {
  const files = useVault((s) => s.files);
  const openFile = useVault((s) => s.openFile);
  const setView = useVault((s) => s.setView);
  const activeFile = useVault((s) => s.activeFile);
  const themeKey = useTheme((s) => s.theme);
  const themeMode = useTheme((s) => s.mode);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [localMode, setLocalMode] = useState(false);

  const { nodeCount, edgeCount } = useMemo(() => {
    let edges = 0;
    const filesArr = [...files.values()];
    for (const f of filesArr) {
      for (const link of f.links) {
        const r = resolveWikilink(link, filesArr);
        if (r) edges++;
      }
    }
    return { nodeCount: filesArr.length, edgeCount: edges };
  }, [files]);

  // Per-folder color map — deterministic, no hash collisions. Re-keyed on themeKey/themeMode
  // so theme switches re-pick the appropriate palette via bg-luminance detection.
  const folderColors = useMemo(() => {
    const keys: string[] = [];
    for (const f of files.values()) {
      const top = f.rel.split('/')[0];
      keys.push(f.rel.includes('/') ? top : '/');
    }
    return buildFolderColors(keys, isBgDark());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, themeMode, themeKey]);

  // Folder legend (top folders only)
  const folderLegend = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of files.values()) {
      const top = f.rel.split('/')[0];
      const key = f.rel.includes('/') ? top : '/';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key, count]) => ({ key, label: key === '/' ? 'root' : key, count, color: folderColors.get(key) ?? PALETTE_LIGHT[0] }));
  }, [files, folderColors]);

  useEffect(() => {
    if (!containerRef.current) return;
    const filesArr = [...files.values()];
    if (filesArr.length === 0) return;

    // Build the full graph
    const graph = new Graph({ multi: false, type: 'undirected' });

    const degree = new Map<string, number>();
    const edges: [string, string][] = [];
    for (const f of filesArr) {
      degree.set(f.rel, degree.get(f.rel) ?? 0);
      for (const link of f.links) {
        const r = resolveWikilink(link, filesArr);
        if (r && r !== f.rel) {
          const a = f.rel < r ? f.rel : r;
          const b = f.rel < r ? r : f.rel;
          edges.push([a, b]);
          degree.set(a, (degree.get(a) ?? 0) + 1);
          degree.set(b, (degree.get(b) ?? 0) + 1);
        }
      }
    }

    for (const f of filesArr) {
      const d = degree.get(f.rel) ?? 0;
      const top = f.rel.split('/')[0];
      const folderKey = f.rel.includes('/') ? top : '/';
      graph.addNode(f.rel, {
        label: f.title || f.name,
        x: Math.random(),
        y: Math.random(),
        size: 5 + Math.min(d, 12) * 0.9,
        color: folderColors.get(folderKey) ?? PALETTE_LIGHT[0],
        folderKey,
      });
    }
    const seen = new Set<string>();
    for (const [a, b] of edges) {
      const k = `${a}::${b}`;
      if (seen.has(k)) continue;
      seen.add(k);
      try {
        // Don't set per-edge color — let the theme-aware defaultEdgeColor win.
        graph.addEdge(a, b, { size: 1 });
      } catch {
        /* dup edge, ignore */
      }
    }

    // Local mode: drop everything outside neighborhood of activeFile
    if (localMode && activeFile && graph.hasNode(activeFile)) {
      const keep = new Set<string>([activeFile, ...graph.neighbors(activeFile)]);
      // include 2nd-degree?
      for (const n of graph.neighbors(activeFile)) {
        for (const m of graph.neighbors(n)) keep.add(m);
      }
      for (const n of graph.nodes()) {
        if (!keep.has(n)) graph.dropNode(n);
      }
    }

    if (graph.order === 0) return;

    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, { iterations: 200, settings });

    // Read theme colors so labels/edges/fades stay legible on every palette + mode.
    const inkColor = readVar('--c-text');
    const accentColor = readVar('--c-accent');
    const bgIsDark = isBgDark();
    // Edges: on dark canvases pull --c-text (cream/white) at ~55% alpha so lines read clearly
    // without dominating. On light canvases use the subtler --c-text-subtle since dark-on-cream
    // is already high contrast and full alpha would feel harsh.
    const edgeColor = bgIsDark ? readVarRgba('--c-text', 0.55) : readVar('--c-text-subtle');
    const edgeFadeColor = bgIsDark ? readVarRgba('--c-text', 0.18) : readVarRgba('--c-text-subtle', 0.35);
    // Faded node tone — keeps recessive nodes visible without being prominent.
    const nodeFadeColor = bgIsDark ? readVarRgba('--c-text', 0.35) : readVar('--c-text-subtle');
    // Label pill: invert against the canvas so labels POP. Dark canvas → light pill + dark
    // text; light canvas → keep the subtle elevated-bg card style (dark-on-cream is already
    // high contrast and full inversion would be too aggressive).
    const labelBgColor = bgIsDark ? readVar('--c-text') : readVar('--c-bg-elevated');
    const labelTextColor = bgIsDark ? readVar('--c-bg') : readVar('--c-text');
    const labelBorderColor = readVar('--c-border');

    function drawPillLabel(
      context: CanvasRenderingContext2D,
      label: string,
      nodeX: number,
      nodeY: number,
      nodeSize: number,
      fontSize: number,
      fontFamily: string,
      fontWeight: string | number,
      withBorder: boolean,
    ) {
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      const w = context.measureText(label).width;
      const padX = 6;
      const padY = 3;
      const x = nodeX + nodeSize + 4;
      const y = nodeY - fontSize / 2 - padY;
      const h = fontSize + padY * 2;
      const r = h / 2;
      context.beginPath();
      context.moveTo(x + r, y);
      context.lineTo(x + w + padX * 2 - r, y);
      context.quadraticCurveTo(x + w + padX * 2, y, x + w + padX * 2, y + r);
      context.lineTo(x + w + padX * 2, y + h - r);
      context.quadraticCurveTo(x + w + padX * 2, y + h, x + w + padX * 2 - r, y + h);
      context.lineTo(x + r, y + h);
      context.quadraticCurveTo(x, y + h, x, y + h - r);
      context.lineTo(x, y + r);
      context.quadraticCurveTo(x, y, x + r, y);
      context.closePath();
      context.fillStyle = labelBgColor;
      context.fill();
      if (withBorder) {
        context.strokeStyle = labelBorderColor;
        context.lineWidth = 1;
        context.stroke();
      }
      context.fillStyle = labelTextColor;
      context.fillText(label, x + padX, y + fontSize + padY - 3);
    }

    const renderer = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      defaultNodeType: 'circle',
      nodeProgramClasses: { circle: NodeCircleProgram },
      labelColor: { color: inkColor },
      labelSize: 12,
      labelWeight: '500',
      labelDensity: 1,
      labelGridCellSize: 90,
      labelRenderedSizeThreshold: 0,
      defaultEdgeColor: edgeColor,
      minCameraRatio: 0.1,
      maxCameraRatio: 10,
      defaultDrawNodeLabel: (context, data, settings) => {
        if (!data.label || typeof data.label !== 'string') return;
        drawPillLabel(
          context,
          data.label,
          data.x,
          data.y,
          data.size,
          settings.labelSize,
          settings.labelFont,
          settings.labelWeight,
          false,
        );
      },
      defaultDrawNodeHover: (context, data, settings) => {
        if (!data.label || typeof data.label !== 'string') return;
        drawPillLabel(
          context,
          data.label,
          data.x,
          data.y,
          data.size,
          settings.labelSize,
          settings.labelFont,
          settings.labelWeight,
          true,
        );
      },
    });

    sigmaRef.current = renderer;

    let hovered: string | null = null;

    const computeHighlightSet = (n: string): Set<string> => {
      const set = new Set<string>([n]);
      for (const nb of graph.neighbors(n)) set.add(nb);
      return set;
    };

    renderer.setSetting('nodeReducer', (node, data) => {
      if (!hovered) {
        return data;
      }
      const highlight = computeHighlightSet(hovered);
      if (highlight.has(node)) return { ...data, zIndex: 1 };
      return { ...data, color: nodeFadeColor, label: '', zIndex: 0 };
    });
    renderer.setSetting('edgeReducer', (edge, data) => {
      if (!hovered) return data;
      const [s, t] = graph.extremities(edge);
      if (s === hovered || t === hovered) return { ...data, color: accentColor, size: 1.6 };
      return { ...data, color: edgeFadeColor };
    });

    renderer.on('clickNode', ({ node }) => {
      openFile(node);
      setView('editor');
    });
    renderer.on('enterNode', ({ node }) => {
      hovered = node;
      setHover(node);
      containerRef.current!.style.cursor = 'pointer';
      renderer.refresh({ skipIndexation: true });
    });
    renderer.on('leaveNode', () => {
      hovered = null;
      setHover(null);
      containerRef.current!.style.cursor = 'default';
      renderer.refresh({ skipIndexation: true });
    });

    // ---- Manual node drag ----
    let dragNode: string | null = null;
    let isDragging = false;
    renderer.on('downNode', (e) => {
      isDragging = true;
      dragNode = e.node;
      graph.setNodeAttribute(dragNode, 'highlighted', true);
    });
    renderer.getMouseCaptor().on('mousemovebody', (e) => {
      if (!isDragging || !dragNode) return;
      const pos = renderer.viewportToGraph(e);
      graph.setNodeAttribute(dragNode, 'x', pos.x);
      graph.setNodeAttribute(dragNode, 'y', pos.y);
      e.preventSigmaDefault();
      e.original.preventDefault();
      e.original.stopPropagation();
    });
    const stopDrag = () => {
      if (dragNode) graph.removeNodeAttribute(dragNode, 'highlighted');
      isDragging = false;
      dragNode = null;
    };
    renderer.getMouseCaptor().on('mouseup', stopDrag);
    renderer.getMouseCaptor().on('mouseleave', stopDrag);

    // Settle FA2 a few extra frames for smoothness
    let frame = 0;
    const tick = () => {
      if (!isDragging) {
        forceAtlas2.assign(graph, { iterations: 1, settings });
      }
      renderer.refresh({ skipIndexation: false });
      frame++;
      if (frame < 80) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    return () => {
      renderer.kill();
      sigmaRef.current = null;
    };
  }, [files, folderColors, activeFile, localMode, openFile, setView, themeKey, themeMode]);

  return (
    <div className="relative w-full h-full bg-bg">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
        <div className="px-3 py-2 rounded-lg bg-bg-elevated/80 backdrop-blur border border-border font-mono text-[10.5px] uppercase tracking-[0.08em] flex items-center gap-2">
          <span className="text-text-muted">{nodeCount} notes · {edgeCount} links</span>
        </div>
        {folderLegend.length > 1 && (
          <div className="px-3 py-2 rounded-lg bg-bg-elevated/80 backdrop-blur border border-border text-xs">
            <div className="text-[10px] uppercase tracking-wider text-text-subtle mb-1">Folders</div>
            <div className="flex flex-col gap-1">
              {folderLegend.map(({ key, label, count, color }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-text-muted truncate max-w-[140px]">{label}</span>
                  <span className="text-text-subtle">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {hover && (
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-md bg-bg-elevated border border-border text-xs text-text pointer-events-none">
          {files.get(hover)?.title || hover}
        </div>
      )}

      <div className="absolute top-3 right-3 flex gap-2">
        <button
          disabled={!activeFile}
          onClick={() => setLocalMode((v) => !v)}
          className={cn(
            'p-2 rounded-md backdrop-blur border transition-colors',
            localMode
              ? 'bg-accent/20 border-accent/50 text-accent'
              : 'bg-bg-elevated/80 border-border text-text-muted hover:text-text hover:bg-bg-hover',
            !activeFile && 'opacity-40 cursor-not-allowed'
          )}
          title={localMode ? 'Show full graph' : 'Show local graph (active note neighborhood)'}
        >
          {localMode ? <Compass size={14} /> : <Globe size={14} />}
        </button>
        <button
          onClick={() => sigmaRef.current?.getCamera().animatedReset()}
          className="p-2 rounded-md bg-bg-elevated/80 backdrop-blur border border-border text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
          title="Reset view"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {nodeCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="font-serif text-[18px] font-semibold text-text mb-1">No connections yet.</div>
            <div className="font-serif text-[13px] text-text-muted">
              Link notes with <span className="font-mono text-text">[[brackets]]</span> to see them appear here.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
