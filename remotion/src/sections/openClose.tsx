import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { COLORS, FONTS } from '../theme';
import { GridBackdrop, MotionText } from '../components/motion';

/** Intro: brand mark + version */
export function Intro({ hold }: { hold: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const markIn = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const fadeOut = interpolate(frame, [hold - 10, hold], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: COLORS.bg,
        opacity: fadeOut,
      }}
    >
      <GridBackdrop />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 20,
            background: COLORS.text,
            color: COLORS.bg,
            display: 'grid',
            placeItems: 'center',
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 56,
            transform: `scale(${0.7 + markIn * 0.3})`,
            opacity: markIn,
            boxShadow: '0 30px 80px rgba(196, 177, 255, 0.15)',
          }}
        >
          S
        </div>
        <MotionText
          text="SideNotes"
          delay={10}
          size={84}
          weight={600}
          font={FONTS.serif}
          letterSpacing={-2}
        />
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: COLORS.accent,
            opacity: interpolate(frame, [24, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          v0.3.0 · what's new
        </div>
      </div>
    </div>
  );
}

/** Outro: download CTA */
export function Outro({ hold }: { hold: number }) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [hold - 12, hold], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: COLORS.bg,
        opacity: Math.min(fadeIn, fadeOut),
      }}
    >
      <GridBackdrop />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
        }}
      >
        <MotionText
          text="Update or grab v0.3.0"
          delay={0}
          size={72}
          font={FONTS.serif}
          letterSpacing={-1.5}
        />
        <div
          style={{
            display: 'flex',
            gap: 18,
            marginTop: 24,
            opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          <Badge label="sidenotes.me" />
          <Badge label="github.com/Koushith/side-deck" muted />
        </div>
      </div>
    </div>
  );
}

function Badge({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span
      style={{
        fontFamily: FONTS.mono,
        fontSize: 18,
        padding: '10px 18px',
        borderRadius: 999,
        border: `1px solid ${muted ? COLORS.border : COLORS.accent}`,
        color: muted ? COLORS.textMuted : COLORS.accentInk,
        background: muted ? 'transparent' : COLORS.accentSubtle,
      }}
    >
      {label}
    </span>
  );
}
