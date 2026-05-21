import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../theme';
import { Eyebrow, MotionText, PopCard, TypeLine } from '../components/motion';
import { SectionFrame } from './sectionFrame';

const TOTAL_SECTIONS = 12;

// ---- 02 · Mermaid diagrams ----
export function MermaidSection({ hold }: { hold: number }) {
  const frame = useCurrentFrame();
  return (
    <SectionFrame hold={hold} number={2} total={TOTAL_SECTIONS}>
      <Eyebrow text="Diagrams" />
      <MotionText text="Mermaid blocks render live." size={68} font={FONTS.serif} letterSpacing={-1.5} />
      <div style={{ display: 'flex', gap: 28, marginTop: 56, alignItems: 'center' }}>
        <PopCard
          delay={18}
          style={{
            background: COLORS.bgElevated,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: '20px 22px',
            minWidth: 380,
          }}
        >
          <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textSubtle, marginBottom: 10 }}>
            ```mermaid
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <TypeLine text="graph TD" delay={20} cps={20} />
            <TypeLine text="  A[Idea] --> B{Worth shipping?}" delay={28} cps={28} />
            <TypeLine text="  B -->|Yes| C[Build]" delay={48} cps={28} />
            <TypeLine text="  B -->|No|  D[Park it]" delay={66} cps={28} />
          </div>
        </PopCard>
        <Arrow delay={90} />
        <PopCard delay={100} style={diagramBox}>
          <Diagram />
        </PopCard>
      </div>
      <div
        style={{
          marginTop: 36,
          fontFamily: FONTS.sans,
          fontSize: 22,
          color: COLORS.textMuted,
          opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        Flowcharts · Sequence · Gantt · ER · Sankey · Git
      </div>
    </SectionFrame>
  );
}

// ---- 03 · Image + PDF viewer ----
export function AttachmentsSection({ hold }: { hold: number }) {
  const exts = ['.png', '.jpg', '.gif', '.webp', '.svg', '.bmp', '.avif', '.pdf'];
  return (
    <SectionFrame hold={hold} number={3} total={TOTAL_SECTIONS}>
      <Eyebrow text="Viewers" />
      <MotionText
        text="Open any image or PDF in a tab."
        size={68}
        font={FONTS.serif}
        letterSpacing={-1.5}
      />
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 56, maxWidth: 1200 }}>
        {exts.map((ext, i) => (
          <PopCard
            key={ext}
            delay={20 + i * 5}
            style={{
              padding: '14px 22px',
              borderRadius: 999,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bgElevated,
              fontFamily: FONTS.mono,
              fontSize: 22,
              color: COLORS.accentInk,
            }}
          >
            {ext}
          </PopCard>
        ))}
      </div>
      <div style={{ marginTop: 40, fontSize: 20, color: COLORS.textMuted, fontFamily: FONTS.sans }}>
        Fit · Actual size · Reveal in Finder · Native PDF toolbar
      </div>
    </SectionFrame>
  );
}

// ---- 04 · Todo notes ----
export function TodoSection({ hold }: { hold: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fill = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 80 } });
  const pct = Math.round(fill * 78);
  return (
    <SectionFrame hold={hold} number={4} total={TOTAL_SECTIONS}>
      <Eyebrow text="Todos" />
      <MotionText text="Any /todos/ folder gets a real header." size={62} font={FONTS.serif} letterSpacing={-1.5} />
      <PopCard
        delay={20}
        style={{
          marginTop: 48,
          background: COLORS.bgElevated,
          border: `1px solid ${COLORS.borderSubtle}`,
          borderRadius: 16,
          padding: '32px 36px',
          maxWidth: 760,
        }}
      >
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 76,
              textAlign: 'center',
              fontFamily: FONTS.serif,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 2 }}>
              FRI
            </div>
            <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: -2, color: COLORS.text }}>22</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 2 }}>
              MAY 26
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 2 }}>
              WORK/TODOS
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 20, marginTop: 16, color: COLORS.textMuted }}>
              <span style={{ color: COLORS.text, fontWeight: 600 }}>5 open</span> · 12 done ·{' '}
              <span style={{ color: COLORS.accentInk, fontFamily: FONTS.mono }}>{pct}%</span>
            </div>
            <div
              style={{
                marginTop: 14,
                height: 2,
                width: '100%',
                borderRadius: 2,
                background: COLORS.borderSubtle,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: COLORS.accent,
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        </div>
      </PopCard>
    </SectionFrame>
  );
}

// ---- 05 · Daily Notes grouping ----
export function DailyGroupingSection({ hold }: { hold: number }) {
  return (
    <SectionFrame hold={hold} number={5} total={TOTAL_SECTIONS}>
      <Eyebrow text="Daily Notes" />
      <MotionText
        text="Year / Month grouping. On screen only."
        size={62}
        font={FONTS.serif}
        letterSpacing={-1.5}
      />
      <PopCard
        delay={20}
        style={{
          marginTop: 56,
          background: COLORS.bgElevated,
          border: `1px solid ${COLORS.borderSubtle}`,
          borderRadius: 12,
          padding: '24px 28px',
          fontFamily: FONTS.mono,
          fontSize: 22,
          color: COLORS.text,
          maxWidth: 560,
        }}
      >
        <TreeRow delay={24} depth={0} icon="📁" label="Daily Notes" />
        <TreeRow delay={32} depth={1} icon="▾" label="2026" muted />
        <TreeRow delay={40} depth={2} icon="▾" label="May" muted />
        <TreeRow delay={48} depth={3} icon="•" label="2026-05-22" accent />
        <TreeRow delay={54} depth={3} icon="•" label="2026-05-21" />
        <TreeRow delay={60} depth={3} icon="•" label="2026-05-20" />
        <TreeRow delay={66} depth={2} icon="▸" label="March (30)" muted />
        <TreeRow delay={72} depth={1} icon="▸" label="2025" muted />
      </PopCard>
      <div style={{ marginTop: 32, color: COLORS.textMuted, fontSize: 20 }}>
        Files stay flat on disk — iCloud, Dropbox, and git see nothing.
      </div>
    </SectionFrame>
  );
}

// ---- 06 · Markdown variants ----
export function MdVariantsSection({ hold }: { hold: number }) {
  const exts = ['.md', '.markdown', '.mdx', '.mdown', '.mkd', '.mkdn', '.mdwn'];
  return (
    <SectionFrame hold={hold} number={6} total={TOTAL_SECTIONS}>
      <Eyebrow text="Markdown" />
      <MotionText
        text="Seven flavors, one editor."
        size={68}
        font={FONTS.serif}
        letterSpacing={-1.5}
      />
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 56 }}>
        {exts.map((ext, i) => (
          <PopCard
            key={ext}
            delay={20 + i * 6}
            style={{
              padding: '18px 26px',
              borderRadius: 12,
              border: `1px solid ${COLORS.accent}`,
              background: COLORS.accentSubtle,
              fontFamily: FONTS.mono,
              fontSize: 28,
              color: COLORS.accentInk,
            }}
          >
            {ext}
          </PopCard>
        ))}
      </div>
    </SectionFrame>
  );
}

// ---- 07 · Carbon dark default ----
export function CarbonDarkSection({ hold }: { hold: number }) {
  return (
    <SectionFrame hold={hold} number={7} total={TOTAL_SECTIONS}>
      <Eyebrow text="Theme" />
      <MotionText
        text="Carbon · dark is the new default."
        size={68}
        font={FONTS.serif}
        letterSpacing={-1.5}
      />
      <div style={{ display: 'flex', gap: 18, marginTop: 56 }}>
        <Swatch delay={20} color="#0a0a0c" label="paper" />
        <Swatch delay={24} color="#121214" label="paper-2" />
        <Swatch delay={28} color="#1a1a1d" label="paper-3" />
        <Swatch delay={32} color={COLORS.accent} label="accent" big />
        <Swatch delay={36} color={COLORS.link} label="link" />
        <Swatch delay={40} color={COLORS.tag} label="tag" />
      </div>
    </SectionFrame>
  );
}

// helpers ------------------------------------------------------------------

const diagramBox: React.CSSProperties = {
  background: COLORS.bgElevated,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: 24,
  width: 380,
  height: 240,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function Diagram() {
  // Stylized SVG flowchart — illustrative, not a real mermaid render.
  return (
    <svg viewBox="0 0 320 200" width="100%" height="100%">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={COLORS.textMuted} />
        </marker>
      </defs>
      <g fontFamily={FONTS.sans} fontSize={14} fill={COLORS.text}>
        <Box x={20} y={30} w={100} h={40} label="Idea" rounded={6} fill={COLORS.bgHover} />
        <path d="M120 50 L160 50" stroke={COLORS.textMuted} strokeWidth={1.5} markerEnd="url(#arr)" />
        <Box x={160} y={20} w={140} h={60} label="Worth shipping?" diamond fill={COLORS.accentSubtle} stroke={COLORS.accent} />
        <path d="M195 80 L160 140" stroke={COLORS.textMuted} strokeWidth={1.5} markerEnd="url(#arr)" />
        <Box x={70} y={140} w={90} h={40} label="Build" rounded={6} fill={COLORS.bgHover} />
        <path d="M265 80 L240 140" stroke={COLORS.textMuted} strokeWidth={1.5} markerEnd="url(#arr)" />
        <Box x={210} y={140} w={90} h={40} label="Park it" rounded={6} fill={COLORS.bgHover} />
      </g>
    </svg>
  );
}

function Box({
  x,
  y,
  w,
  h,
  label,
  rounded,
  diamond,
  fill,
  stroke = COLORS.border,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  rounded?: number;
  diamond?: boolean;
  fill: string;
  stroke?: string;
}) {
  if (diamond) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const points = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
    return (
      <g>
        <polygon points={points} fill={fill} stroke={stroke} strokeWidth={1} />
        <text x={cx} y={cy + 4} textAnchor="middle" fill={COLORS.accentInk}>
          {label}
        </text>
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rounded ?? 4} ry={rounded ?? 4} fill={fill} stroke={stroke} strokeWidth={1} />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill={COLORS.text}>
        {label}
      </text>
    </g>
  );
}

function Arrow({ delay }: { delay: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        color: COLORS.accent,
        fontSize: 40,
        opacity,
      }}
    >
      →
    </div>
  );
}

function TreeRow({
  depth,
  icon,
  label,
  delay,
  muted,
  accent,
}: {
  depth: number;
  icon: string;
  label: string;
  delay: number;
  muted?: boolean;
  accent?: boolean;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const x = interpolate(frame - delay, [0, 12], [-8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        paddingLeft: depth * 22,
        opacity,
        transform: `translateX(${x}px)`,
        padding: '4px 0',
        color: accent ? COLORS.accentInk : muted ? COLORS.textMuted : COLORS.text,
      }}
    >
      {icon} {label}
    </div>
  );
}

function Swatch({
  color,
  label,
  delay,
  big,
}: {
  color: string;
  label: string;
  delay: number;
  big?: boolean;
}) {
  return (
    <PopCard
      delay={delay}
      style={{
        width: big ? 140 : 100,
        height: big ? 140 : 100,
        background: color,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        position: 'relative',
        boxShadow: big ? `0 14px 40px ${color}40` : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 12,
          fontFamily: FONTS.mono,
          fontSize: 12,
          color: COLORS.text,
          opacity: 0.85,
          mixBlendMode: 'difference',
        }}
      >
        {label}
      </div>
    </PopCard>
  );
}
