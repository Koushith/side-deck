import React from 'react';
import { GridBackdrop, CrossFade } from '../components/motion';
import { COLORS, FONTS } from '../theme';

/** Common chrome: backdrop, padding, version watermark. Every section sits inside. */
export function SectionFrame({
  children,
  hold,
  number,
  total,
}: {
  children: React.ReactNode;
  hold: number;
  number: number;
  total: number;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: FONTS.sans,
      }}
    >
      <GridBackdrop />
      <CrossFade hold={hold}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            padding: '120px 140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      </CrossFade>
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: 140,
          right: 140,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: FONTS.mono,
          fontSize: 13,
          letterSpacing: 1.5,
          color: COLORS.textSubtle,
          textTransform: 'uppercase',
        }}
      >
        <span>SideNotes · v0.3.0</span>
        <span>
          {String(number).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
