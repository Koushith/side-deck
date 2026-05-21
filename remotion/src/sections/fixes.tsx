import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../theme';
import { Eyebrow, MotionText, PopCard, TypeLine } from '../components/motion';
import { SectionFrame } from './sectionFrame';

const TOTAL_SECTIONS = 12;

// ---- 08 · Watcher-safe writes (data loss fix) ----
export function WatcherSafeSection({ hold }: { hold: number }) {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [30, 50], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <SectionFrame hold={hold} number={8} total={TOTAL_SECTIONS}>
      <Eyebrow text="Critical fix" />
      <MotionText
        text="External edits no longer get clobbered."
        size={60}
        font={FONTS.serif}
        letterSpacing={-1.5}
      />
      <div style={{ display: 'flex', gap: 28, marginTop: 56, alignItems: 'center' }}>
        <PopCard delay={20} style={fixBox}>
          <Tag text="before" color={COLORS.textMuted} />
          <div style={{ position: 'relative', marginTop: 12, fontFamily: FONTS.mono, fontSize: 16, color: COLORS.text }}>
            iCloud writes → tab reopens stale → save clobbers
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                height: 2,
                width: `${strike}%`,
                background: '#ef4444',
                opacity: 0.85,
              }}
            />
          </div>
        </PopCard>
        <div style={{ fontFamily: FONTS.mono, fontSize: 32, color: COLORS.accent }}>→</div>
        <PopCard delay={50} style={{ ...fixBox, borderColor: COLORS.accent }}>
          <Tag text="after" color={COLORS.accentInk} />
          <div style={{ marginTop: 12, fontFamily: FONTS.mono, fontSize: 16, color: COLORS.text }}>
            watcher reloads + keeps unsaved local edits
          </div>
        </PopCard>
      </div>
    </SectionFrame>
  );
}

// ---- 09 · Themed dialogs ----
export function DialogsSection({ hold }: { hold: number }) {
  const frame = useCurrentFrame();
  const promptIn = spring({ frame: frame - 20, fps: 30, config: { damping: 16, stiffness: 120 } });
  return (
    <SectionFrame hold={hold} number={9} total={TOTAL_SECTIONS}>
      <Eyebrow text="Polish" />
      <MotionText
        text="Native prompts replaced. Themed dialogs."
        size={58}
        font={FONTS.serif}
        letterSpacing={-1.5}
      />
      <div
        style={{
          marginTop: 56,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${0.92 + promptIn * 0.08})`,
          opacity: promptIn,
        }}
      >
        <div
          style={{
            width: 460,
            background: COLORS.bgElevated,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: '20px 22px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600, color: COLORS.text }}>Rename</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
            work/todos/2026-05-22.md
          </div>
          <div
            style={{
              marginTop: 16,
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${COLORS.accent}`,
              fontFamily: FONTS.mono,
              fontSize: 15,
              color: COLORS.text,
            }}
          >
            <TypeLine text="2026-05-22-friday-recap" delay={40} cps={26} size={15} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <span
              style={{
                padding: '8px 14px',
                fontFamily: FONTS.sans,
                fontSize: 13,
                color: COLORS.textMuted,
              }}
            >
              Cancel
            </span>
            <span
              style={{
                padding: '8px 14px',
                fontFamily: FONTS.sans,
                fontSize: 13,
                background: COLORS.accent,
                color: COLORS.bg,
                borderRadius: 8,
              }}
            >
              Rename
            </span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 28, fontSize: 18, color: COLORS.textMuted, fontFamily: FONTS.sans }}>
        prompt() · confirm() · alert() — all swapped for themed UI + non-blocking toasts.
      </div>
    </SectionFrame>
  );
}

// ---- 10 · Live task counts ----
export function TaskCountsSection({ hold }: { hold: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 60 } });
  const open = Math.round(t * 4);
  const done = Math.round(t * 11);
  return (
    <SectionFrame hold={hold} number={10} total={TOTAL_SECTIONS}>
      <Eyebrow text="Live counts" />
      <MotionText
        text="Task counts update as you type."
        size={68}
        font={FONTS.serif}
        letterSpacing={-1.5}
      />
      <div
        style={{
          marginTop: 56,
          display: 'flex',
          gap: 24,
          fontFamily: FONTS.sans,
          fontSize: 32,
          color: COLORS.text,
        }}
      >
        <Counter label="open" value={open} />
        <span style={{ color: COLORS.textSubtle, alignSelf: 'center' }}>·</span>
        <Counter label="done" value={done} />
        <span style={{ color: COLORS.textSubtle, alignSelf: 'center' }}>·</span>
        <Counter label="%" value={done + open === 0 ? 0 : Math.round((done / (open + done)) * 100)} accent />
      </div>
      <div style={{ marginTop: 28, color: COLORS.textMuted, fontSize: 18 }}>
        Previously stuck at <span style={{ fontFamily: FONTS.mono }}>0 / 0</span> on file load. Now bound to the editor transaction stream.
      </div>
    </SectionFrame>
  );
}

// ---- 11 · Image path fallback ----
export function ImagePathsSection({ hold }: { hold: number }) {
  return (
    <SectionFrame hold={hold} number={11} total={TOTAL_SECTIONS}>
      <Eyebrow text="Vault://" />
      <MotionText
        text="Publish-site paths just work locally."
        size={58}
        font={FONTS.serif}
        letterSpacing={-1.5}
      />
      <div style={{ marginTop: 48, fontFamily: FONTS.mono, fontSize: 22, color: COLORS.text }}>
        <PopCard delay={20} style={pathRow}>
          <span style={{ color: COLORS.textMuted, marginRight: 12 }}>requested:</span>
          <TypeLine text="vault:///blog/2023-year-in-review/header.png" delay={24} cps={32} size={20} />
        </PopCard>
        <PopCard delay={70} style={{ ...pathRow, marginTop: 14, borderColor: COLORS.accent }}>
          <span style={{ color: COLORS.accentInk, marginRight: 12 }}>resolved:</span>
          <TypeLine
            text="blogs/images/2023-year-in-review/header.png"
            delay={74}
            cps={32}
            size={20}
            color={COLORS.text}
          />
        </PopCard>
      </div>
      <div style={{ marginTop: 28, color: COLORS.textMuted, fontSize: 18 }}>
        Falls back through <code style={{ fontFamily: FONTS.mono }}>blogs/images</code>, <code style={{ fontFamily: FONTS.mono }}>assets</code>, and the common <code style={{ fontFamily: FONTS.mono }}>{`<slug>`}</code> conventions.
      </div>
    </SectionFrame>
  );
}

// helpers ------------------------------------------------------------------

const fixBox: React.CSSProperties = {
  background: COLORS.bgElevated,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: '20px 22px',
  width: 380,
};

const pathRow: React.CSSProperties = {
  background: COLORS.bgElevated,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  padding: '14px 18px',
  display: 'flex',
  alignItems: 'center',
};

function Tag({ text, color }: { text: string; color: string }) {
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 2,
        color,
      }}
    >
      {text}
    </div>
  );
}

function Counter({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <span
      style={{
        fontFamily: FONTS.mono,
        color: accent ? COLORS.accentInk : COLORS.text,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value} <span style={{ color: COLORS.textMuted, fontSize: 22 }}>{label}</span>
    </span>
  );
}
