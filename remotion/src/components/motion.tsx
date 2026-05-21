import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../theme';
import React from 'react';

/** Word-by-word typewriter that reveals each token with a soft fade + lift. */
export function MotionText({
  text,
  delay = 0,
  perWord = 4,
  size = 64,
  weight = 600,
  font = FONTS.serif,
  color = COLORS.text,
  letterSpacing = -1,
  lineHeight = 1.1,
  maxWidth,
}: {
  text: string;
  delay?: number;
  perWord?: number;
  size?: number;
  weight?: number;
  font?: string;
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;
  maxWidth?: number;
}) {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${size * 0.22}px`,
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing,
        lineHeight,
        maxWidth,
      }}
    >
      {words.map((w, i) => {
        const t = frame - delay - i * perWord;
        const opacity = interpolate(t, [0, 8], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
        const y = interpolate(t, [0, 14], [12, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
        return (
          <span key={i} style={{ display: 'inline-block', opacity, transform: `translateY(${y}px)` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
}

/** Caret-led typewriter for code-like single-line strings. */
export function TypeLine({
  text,
  delay = 0,
  cps = 38,
  font = FONTS.mono,
  size = 22,
  color = COLORS.text,
}: {
  text: string;
  delay?: number;
  cps?: number;
  font?: string;
  size?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - delay);
  const charsPerFrame = cps / fps;
  const shown = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const caretOn = Math.floor(frame / 15) % 2 === 0;
  return (
    <span style={{ fontFamily: font, fontSize: size, color, whiteSpace: 'pre' }}>
      {text.slice(0, shown)}
      <span style={{ opacity: caretOn ? 1 : 0, color: COLORS.accent }}>▍</span>
    </span>
  );
}

/** Card that pops in with a small spring. */
export function PopCard({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 140, mass: 0.7 },
  });
  return (
    <div
      style={{
        transform: `translateY(${(1 - s) * 24}px) scale(${0.96 + s * 0.04})`,
        opacity: interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Top-of-section label, monospace eyebrow. */
export function Eyebrow({ text, delay = 0 }: { text: string; delay?: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 16,
        letterSpacing: 4,
        textTransform: 'uppercase',
        color: COLORS.accent,
        opacity,
        marginBottom: 28,
      }}
    >
      {text}
    </div>
  );
}

/** Background grid that breathes slightly — adds depth without screenshots. */
export function GridBackdrop() {
  const frame = useCurrentFrame();
  const breathe = 0.04 + Math.sin(frame / 90) * 0.02;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: COLORS.bg,
        backgroundImage: `
          radial-gradient(circle at 18% 22%, rgba(196, 177, 255, ${breathe}) 0px, transparent 380px),
          radial-gradient(circle at 82% 78%, rgba(125, 211, 252, ${breathe * 0.7}) 0px, transparent 360px),
          linear-gradient(to right, ${COLORS.borderSubtle} 1px, transparent 1px),
          linear-gradient(to bottom, ${COLORS.borderSubtle} 1px, transparent 1px)
        `,
        backgroundSize: 'auto, auto, 56px 56px, 56px 56px',
      }}
    />
  );
}

/** Fades the whole composition slightly at section boundaries to soften cuts. */
export function CrossFade({ children, hold }: { children: React.ReactNode; hold: number }) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [hold - 8, hold], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);
  return <div style={{ opacity, width: '100%', height: '100%' }}>{children}</div>;
}
