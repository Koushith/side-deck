import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { COLORS, FONTS } from './theme';
import {
  Camera,
  HaloBackdrop,
  KenBurns,
  Reveal,
  SlowType,
  SoftFade,
} from './components/cinematic';
import { FolderCinematic } from './sections/folderCinematic';
import beatsData from '../public/captures/beats.json';

// ---- Timing ----------------------------------------------------------------
const FPS = 30;
const F = (s: number) => Math.round(s * FPS);

// Per-section frame budgets (~93s pure cinematic cut — no live capture).
const SLATE = F(4.5);          // intro slate
const FOLDER = F(11);          // folder flat creation centerpiece (tightened pacing)
const MERMAID = F(10);
const VIEWER = F(13);          // mock photo + PDF + staggered format chips
const TODOS = F(13);           // animated checklist
const RECAP = F(20);           // five before/after cards — 4s each so they breathe
const CHANGELOG = F(14);       // TL;DR — 4 cut frames covering full release notes
const OUTRO = F(9);            // privacy / platforms / byline

export function totalFramesCinematic(): number {
  return SLATE + FOLDER + MERMAID + VIEWER + TODOS + RECAP + CHANGELOG + OUTRO;
}

// Toggle music via env: `WITH_AUDIO=1 npm run render-cinematic`
// after dropping bg.mp3 into public/audio/. Default renders silent.
const HAS_AUDIO = (typeof process !== 'undefined' && process.env?.REMOTION_AUDIO === '1');

// ---- Sections -------------------------------------------------------------

function Slate() {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 30], [0.85, 1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <SoftFade durationFrames={SLATE} fadeOut={20}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: COLORS.bg }}>
        <HaloBackdrop />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              background: COLORS.text,
              color: COLORS.bg,
              borderRadius: 22,
              display: 'grid',
              placeItems: 'center',
              fontFamily: FONTS.serif,
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 68,
              transform: `scale(${scale})`,
              opacity,
              boxShadow: '0 40px 100px rgba(196, 177, 255, 0.18)',
            }}
          >
            S
          </div>
          <SlowType text="SideNotes" delay={20} cps={9} size={96} font={FONTS.serif} letterSpacing={-2.5} />
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              letterSpacing: 6,
              color: COLORS.accent,
              textTransform: 'uppercase',
              opacity: interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            v0.3.0 · what's new
          </div>
        </div>
      </div>
    </SoftFade>
  );
}

function MermaidScene() {
  const frame = useCurrentFrame();
  return (
    <SoftFade durationFrames={MERMAID}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: COLORS.bg }}>
        <HaloBackdrop />
        <KenBurns from={1} to={1.06} duration={MERMAID}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: '120px 140px',
              gap: 18,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 14,
                letterSpacing: 4,
                color: COLORS.accent,
                textTransform: 'uppercase',
                opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              Flowcharts
            </div>
            <SlowType
              text="Type a flowchart. See it drawn."
              delay={10}
              cps={20}
              size={72}
              font={FONTS.serif}
              letterSpacing={-1.8}
            />
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginTop: 36 }}>
              <Reveal delay={60} style={{ flex: 1 }}>
                <div
                  style={{
                    background: COLORS.bgElevated,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 12,
                    padding: 24,
                    fontFamily: FONTS.mono,
                    fontSize: 18,
                    lineHeight: 1.8,
                    color: COLORS.text,
                    minHeight: 220,
                  }}
                >
                  <div style={{ color: COLORS.textMuted, marginBottom: 8 }}>```mermaid</div>
                  <div><SlowType text="graph TD" delay={65} cps={14} size={18} font={FONTS.mono} color={COLORS.text} letterSpacing={0} /></div>
                  <div><SlowType text="  Idea --> Worth{Worth shipping?}" delay={85} cps={22} size={18} font={FONTS.mono} color={COLORS.text} letterSpacing={0} /></div>
                  <div><SlowType text="  Worth -->|Yes| Build" delay={130} cps={22} size={18} font={FONTS.mono} color={COLORS.text} letterSpacing={0} /></div>
                  <div><SlowType text="  Worth -->|No|  Park" delay={160} cps={22} size={18} font={FONTS.mono} color={COLORS.text} letterSpacing={0} /></div>
                  <div style={{ color: COLORS.textMuted, marginTop: 8 }}>```</div>
                </div>
              </Reveal>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  color: COLORS.accent,
                  fontSize: 42,
                  opacity: interpolate(frame, [190, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                }}
              >
                →
              </div>
              <Reveal delay={200} style={{ flex: 1 }}>
                <DiagramSVG />
              </Reveal>
            </div>
          </div>
        </KenBurns>
      </div>
    </SoftFade>
  );
}

function ViewerScene() {
  const frame = useCurrentFrame();
  // Two mock window frames slide in: a photo and a PDF. After both land,
  // the extension list fades in below as supporting evidence.
  return (
    <SoftFade durationFrames={VIEWER}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: COLORS.bg }}>
        <HaloBackdrop />
        <div style={{ position: 'absolute', inset: 0, padding: '100px 140px 80px 140px' }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 14, letterSpacing: 4, color: COLORS.accent, textTransform: 'uppercase' }}>
            Photos & PDFs
          </div>
          <div style={{ marginTop: 14 }}>
            <SlowType
              text="Open them right in the app."
              cps={22}
              size={64}
              font={FONTS.serif}
              letterSpacing={-1.6}
            />
          </div>

          {/* Two mock window frames side-by-side */}
          <div style={{ display: 'flex', gap: 32, marginTop: 56, alignItems: 'flex-start' }}>
            <MockPhotoFrame delay={50} />
            <MockPdfFrame delay={110} />
          </div>

          {/* Supported formats — animate one by one as a typed list */}
          <div style={{ marginTop: 44 }}>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                letterSpacing: 4,
                color: COLORS.accent,
                textTransform: 'uppercase',
                marginBottom: 16,
                opacity: interpolate(frame, [200, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}
            >
              Supported formats
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['.png', '.jpg', '.gif', '.webp', '.svg', '.bmp', '.avif', '.pdf'].map((ext, i) => {
                const start = 220 + i * 14;
                const op = interpolate(frame, [start, start + 12], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const y = interpolate(frame, [start, start + 16], [10, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const scale = interpolate(frame, [start, start + 12], [0.9, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                return (
                  <span
                    key={ext}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 999,
                      border: `1px solid ${ext === '.pdf' ? COLORS.accent : COLORS.border}`,
                      background: ext === '.pdf' ? COLORS.accentSubtle : COLORS.bgElevated,
                      fontFamily: FONTS.mono,
                      fontSize: 20,
                      color: ext === '.pdf' ? COLORS.accentInk : COLORS.text,
                      opacity: op,
                      transform: `translateY(${y}px) scale(${scale})`,
                    }}
                  >
                    {ext}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SoftFade>
  );
}

function MockPhotoFrame({ delay }: { delay: number }) {
  return (
    <Reveal delay={delay} y={20} style={{ flex: 1, maxWidth: 720 }}>
      <div
        style={{
          background: COLORS.bgElevated,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Tab strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderBottom: `1px solid ${COLORS.borderSubtle}`,
            background: COLORS.bg,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <Dot color="#ff5f57" />
            <Dot color="#febc2e" />
            <Dot color="#28c840" />
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted, marginLeft: 8 }}>
            travel-collage.png
          </div>
        </div>
        {/* Faux image — gradient + circles */}
        <div style={{ padding: 24 }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 10,
              background: `
                radial-gradient(circle at 30% 30%, #f5d0a9 0px, transparent 220px),
                radial-gradient(circle at 70% 60%, #c4b1ff 0px, transparent 240px),
                linear-gradient(135deg, #2c2c30 0%, #1a1a1d 100%)
              `,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 16,
                bottom: 14,
                fontFamily: FONTS.mono,
                fontSize: 11,
                color: COLORS.textSubtle,
              }}
            >
              1920 × 1080 · 1.4 MB
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: FONTS.sans,
              fontSize: 13,
              color: COLORS.textMuted,
              display: 'flex',
              gap: 16,
            }}
          >
            <span>Fit</span>
            <span>·</span>
            <span>Actual size</span>
            <span>·</span>
            <span>Reveal in Finder</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function MockPdfFrame({ delay }: { delay: number }) {
  return (
    <Reveal delay={delay} y={20} style={{ flex: 1, maxWidth: 540 }}>
      <div
        style={{
          background: COLORS.bgElevated,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderBottom: `1px solid ${COLORS.borderSubtle}`,
            background: COLORS.bg,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <Dot color="#ff5f57" />
            <Dot color="#febc2e" />
            <Dot color="#28c840" />
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted, marginLeft: 8 }}>
            spec-v0.3.pdf
          </div>
        </div>
        <div style={{ padding: 18, background: '#1f1f24' }}>
          {/* Faux PDF page */}
          <div
            style={{
              background: '#f5f1ec',
              color: '#1a1a1c',
              padding: '28px 26px',
              borderRadius: 4,
              fontFamily: FONTS.serif,
              boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
              minHeight: 280,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>SideNotes v0.3 Spec</div>
            <div style={{ height: 4, background: '#d9d2c4', borderRadius: 2, marginBottom: 14, width: '40%' }} />
            <div style={{ height: 4, background: '#d9d2c4', borderRadius: 2, marginBottom: 8 }} />
            <div style={{ height: 4, background: '#d9d2c4', borderRadius: 2, marginBottom: 8, width: '92%' }} />
            <div style={{ height: 4, background: '#d9d2c4', borderRadius: 2, marginBottom: 14, width: '78%' }} />
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>1. Architecture</div>
            <div style={{ height: 4, background: '#d9d2c4', borderRadius: 2, marginBottom: 6 }} />
            <div style={{ height: 4, background: '#d9d2c4', borderRadius: 2, marginBottom: 6, width: '88%' }} />
            <div style={{ height: 4, background: '#d9d2c4', borderRadius: 2, marginBottom: 6, width: '94%' }} />
            <div style={{ height: 4, background: '#d9d2c4', borderRadius: 2, marginBottom: 6, width: '70%' }} />
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: FONTS.mono,
              fontSize: 11,
              color: COLORS.textSubtle,
              textAlign: 'center',
            }}
          >
            Page 1 of 14 · Chromium PDF viewer
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{ width: 11, height: 11, borderRadius: 999, background: color, display: 'inline-block' }} />;
}

function TodosScene() {
  const frame = useCurrentFrame();
  // Five tasks. Ones at indices 0,2,4 tick on as the camera holds — animated check.
  const tasks: { label: string; checkAt: number | null; section?: string }[] = [
    { label: 'Cut v0.3.0 release video', checkAt: 130, section: 'Focus' },
    { label: 'Write the launch tweet', checkAt: null },
    { label: 'Push the site changelog', checkAt: 170 },
    { label: 'Reply to early testers', checkAt: null, section: 'Quick wins' },
    { label: 'Morning pages', checkAt: 210 },
  ];
  // Progress climbs as tasks tick — start at 12/17 (≈70%), end at 15/17 (≈88%).
  const checkedNow = tasks.filter((t) => t.checkAt !== null && frame >= (t.checkAt ?? Infinity)).length;
  const done = 12 + checkedNow;
  const open = 5 - checkedNow;
  const pct = Math.round((done / (done + open)) * 100);

  return (
    <SoftFade durationFrames={TODOS}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: COLORS.bg }}>
        <HaloBackdrop />
        <KenBurns from={1.04} to={1} duration={TODOS}>
          <div style={{ position: 'absolute', inset: 0, padding: '90px 140px 80px 140px' }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 14, letterSpacing: 4, color: COLORS.accent, textTransform: 'uppercase' }}>
              Daily checklists
            </div>
            <div style={{ marginTop: 14 }}>
              <SlowType
                text="Tick things off. Watch the bar fill."
                cps={20}
                size={60}
                font={FONTS.serif}
                letterSpacing={-1.5}
              />
            </div>
            <Reveal delay={36} y={30} style={{ marginTop: 36 }}>
              <div
                style={{
                  background: COLORS.bgElevated,
                  border: `1px solid ${COLORS.borderSubtle}`,
                  borderRadius: 18,
                  padding: '32px 36px 28px 36px',
                  maxWidth: 1000,
                  boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                }}
              >
                {/* Header row: date masthead + stats */}
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                  <div style={{ width: 80, textAlign: 'center', fontFamily: FONTS.serif }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 3 }}>FRI</div>
                    <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: -2, color: COLORS.text, lineHeight: 1 }}>22</div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 3 }}>MAY 26</div>
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 3 }}>
                      WORK/TODOS
                    </div>
                    <div style={{ marginTop: 12, fontFamily: FONTS.sans, fontSize: 19, color: COLORS.textMuted, fontVariantNumeric: 'tabular-nums' }}>
                      <span style={{ color: open > 0 ? COLORS.text : COLORS.textMuted, fontWeight: 600 }}>{open} open</span>
                      <span style={{ color: COLORS.textSubtle, margin: '0 8px' }}>·</span>
                      <span style={{ color: COLORS.text }}>{done} done</span>
                      <span style={{ color: COLORS.textSubtle, margin: '0 8px' }}>·</span>
                      <span style={{ color: COLORS.accentInk, fontFamily: FONTS.mono }}>{pct}%</span>
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        height: 3,
                        width: '100%',
                        background: COLORS.borderSubtle,
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: COLORS.accent,
                          opacity: 0.85,
                          transition: 'width 240ms ease',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist — appears under the header card with stagger */}
                <div style={{ marginTop: 24, paddingTop: 22, borderTop: `1px solid ${COLORS.borderSubtle}` }}>
                  {tasks.map((t, i) => {
                    const appear = 60 + i * 12;
                    const isChecked = t.checkAt !== null && frame >= (t.checkAt as number);
                    const rowOpacity = interpolate(frame, [appear, appear + 14], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    });
                    const rowY = interpolate(frame, [appear, appear + 18], [10, 0], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    });
                    return (
                      <div key={i} style={{ opacity: rowOpacity, transform: `translateY(${rowY}px)` }}>
                        {t.section && (
                          <div
                            style={{
                              fontFamily: FONTS.serif,
                              fontSize: 15,
                              color: COLORS.textMuted,
                              marginTop: i === 0 ? 0 : 14,
                              marginBottom: 8,
                              fontWeight: 600,
                            }}
                          >
                            {t.section}
                          </div>
                        )}
                        <CheckRow label={t.label} checked={isChecked} checkAt={t.checkAt} frame={frame} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </KenBurns>
      </div>
    </SoftFade>
  );
}

function CheckRow({
  label,
  checked,
  checkAt,
  frame,
}: {
  label: string;
  checked: boolean;
  checkAt: number | null;
  frame: number;
}) {
  // Small "pop" right when the box gets checked.
  const sincePop = checkAt !== null ? frame - checkAt : -Infinity;
  const pop = sincePop >= 0 && sincePop < 12 ? 1 + Math.sin((sincePop / 12) * Math.PI) * 0.18 : 1;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0', fontFamily: FONTS.serif }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          border: `1.5px solid ${checked ? COLORS.accent : COLORS.textMuted}`,
          background: checked ? COLORS.accent : 'transparent',
          display: 'grid',
          placeItems: 'center',
          transform: `scale(${pop})`,
          transition: 'background-color 200ms ease, border-color 200ms ease',
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={COLORS.bg} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-12" />
          </svg>
        )}
      </div>
      <div
        style={{
          fontSize: 20,
          color: checked ? COLORS.textMuted : COLORS.text,
          textDecoration: checked ? 'line-through' : 'none',
          textDecorationColor: COLORS.textMuted,
          transition: 'color 200ms ease',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// (Live capture + pre-roll + per-beat labels were removed when the live segment
// was dropped from the composition. The Playwright capture rig still exists if
// you want to wire footage back in.)

function RecapMontage() {
  // Each beat is a literal Before / After pair so the value reads in 2 seconds.
  // Copy is plain English — no jargon ("modal", "resolve", "watcher", etc.).
  const beats: Array<{
    eyebrow: string;
    visual: 'safety' | 'dialog' | 'image' | 'counts' | 'theme';
  }> = [
    { eyebrow: 'Your notes stay safe', visual: 'safety' },
    { eyebrow: 'Friendlier popups', visual: 'dialog' },
    { eyebrow: 'Pictures just show up', visual: 'image' },
    { eyebrow: 'Counts update live', visual: 'counts' },
    { eyebrow: 'Easy on the eyes', visual: 'theme' },
  ];
  const each = Math.floor(RECAP / beats.length);
  return (
    <SoftFade durationFrames={RECAP}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: COLORS.bg, overflow: 'hidden' }}>
        <HaloBackdrop />
        {beats.map((b, i) => (
          <Sequence key={i} from={i * each} durationInFrames={each}>
            <BeforeAfterCard {...b} duration={each} />
          </Sequence>
        ))}
      </div>
    </SoftFade>
  );
}

function BeforeAfterCard({
  eyebrow,
  visual,
  duration,
}: {
  eyebrow: string;
  visual: 'safety' | 'dialog' | 'image' | 'counts' | 'theme';
  duration: number;
}) {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const outOp = interpolate(frame, [duration - 18, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(inOp, outOp);
  // "After" fades in clearly after Before so the eye lands on Before, reads it,
  // then registers the arrow + After.
  const beforeOp = interpolate(frame, [6, 26], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const arrowOp = interpolate(frame, [38, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const afterOp = interpolate(frame, [54, 84], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: 'absolute', inset: 0, padding: '90px 140px', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 15,
            letterSpacing: 5,
            color: COLORS.accent,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
          <div style={{ opacity: beforeOp, flex: 1 }}>
            <SidePanel kind="before" visual={visual} />
          </div>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 56,
              color: COLORS.accent,
              opacity: arrowOp,
              flexShrink: 0,
            }}
          >
            →
          </div>
          <div style={{ opacity: afterOp, flex: 1 }}>
            <SidePanel kind="after" visual={visual} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function SidePanel({
  kind,
  visual,
}: {
  kind: 'before' | 'after';
  visual: 'safety' | 'dialog' | 'image' | 'counts' | 'theme';
}) {
  const label = kind === 'before' ? 'Before' : 'After';
  const labelColor = kind === 'before' ? '#ef4444' : COLORS.tag;
  const borderColor = kind === 'before' ? `${COLORS.border}` : COLORS.tag;
  return (
    <div
      style={{
        background: COLORS.bgElevated,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: '24px 26px',
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontFamily: FONTS.mono, fontSize: 12, letterSpacing: 3, color: labelColor, textTransform: 'uppercase', marginBottom: 18 }}>
        {label}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {visual === 'safety' && (kind === 'before' ? <SafetyBefore /> : <SafetyAfter />)}
        {visual === 'dialog' && (kind === 'before' ? <DialogBefore /> : <DialogAfter />)}
        {visual === 'image' && (kind === 'before' ? <ImageBefore /> : <ImageAfter />)}
        {visual === 'counts' && (kind === 'before' ? <CountsBefore /> : <CountsAfter />)}
        {visual === 'theme' && (kind === 'before' ? <ThemeBefore /> : <ThemeAfter />)}
      </div>
    </div>
  );
}

// ---- Before/After sketches (plain English only) ---------------------------

function SafetyBefore() {
  return (
    <div style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.text, lineHeight: 1.5 }}>
      You edit a note on your phone.
      <br />
      Open it on Mac — <span style={{ color: '#ef4444' }}>your edits are gone.</span>
    </div>
  );
}
function SafetyAfter() {
  return (
    <div style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.text, lineHeight: 1.5 }}>
      You edit a note on your phone.
      <br />
      Open it on Mac — <span style={{ color: COLORS.tag }}>everything's there.</span>
    </div>
  );
}

function DialogBefore() {
  // Faux Chromium system confirm
  return (
    <div
      style={{
        width: '100%',
        background: '#3a3a3c',
        border: '1px solid #555',
        borderRadius: 8,
        padding: '18px 20px',
        color: '#fafafa',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8 }}>localhost:5173 says</div>
      <div style={{ fontSize: 15, marginBottom: 18 }}>Are you sure you want to delete?</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <span style={{ padding: '6px 14px', background: '#5a5a5c', borderRadius: 4, fontSize: 13 }}>Cancel</span>
        <span style={{ padding: '6px 14px', background: '#0a84ff', borderRadius: 4, fontSize: 13 }}>OK</span>
      </div>
    </div>
  );
}
function DialogAfter() {
  return (
    <div
      style={{
        width: '100%',
        background: COLORS.bgElevated,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: '20px 22px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600, color: COLORS.text }}>Move "2025" to trash?</div>
      <div style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>
        You can restore it from the system trash.
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <span style={{ padding: '8px 14px', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.textMuted }}>Cancel</span>
        <span style={{ padding: '8px 14px', fontFamily: FONTS.sans, fontSize: 13, background: '#ef4444', color: '#fff', borderRadius: 8 }}>
          Move to Trash
        </span>
      </div>
    </div>
  );
}

function ImageBefore() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          aspectRatio: '16 / 9',
          background: '#1a1a1d',
          border: `1px dashed ${COLORS.border}`,
          borderRadius: 8,
          display: 'grid',
          placeItems: 'center',
          color: '#ef4444',
          fontFamily: FONTS.mono,
          fontSize: 18,
        }}
      >
        🖼 image not found
      </div>
      <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textSubtle }}>blog/cover.png</div>
    </div>
  );
}
function ImageAfter() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          aspectRatio: '16 / 9',
          borderRadius: 8,
          background: `
            radial-gradient(circle at 30% 30%, #f5d0a9 0px, transparent 220px),
            radial-gradient(circle at 70% 60%, ${COLORS.accent} 0px, transparent 240px),
            linear-gradient(135deg, #2c2c30 0%, #1a1a1d 100%)
          `,
          border: `1px solid ${COLORS.tag}`,
        }}
      />
      <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.tag }}>blog/cover.png</div>
    </div>
  );
}

function CountsBefore() {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <CountTile label="words" value="0" muted />
      <CountTile label="open" value="0" muted />
      <CountTile label="done" value="0" muted />
    </div>
  );
}
function CountsAfter() {
  const frame = useCurrentFrame();
  const words = Math.floor(interpolate(frame - 28, [0, 60], [0, 412], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const open = Math.max(0, 4 - Math.floor(interpolate(frame - 28, [0, 60], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
  const done = 8 + (4 - open);
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <CountTile label="words" value={words.toLocaleString()} />
      <CountTile label="open" value={String(open)} />
      <CountTile label="done" value={String(done)} accent />
      <CountTile label="streak" value="12 days" link />
    </div>
  );
}

function CountTile({
  label,
  value,
  muted,
  accent,
  link,
}: {
  label: string;
  value: string;
  muted?: boolean;
  accent?: boolean;
  link?: boolean;
}) {
  const color = link ? COLORS.link : accent ? COLORS.accentInk : muted ? COLORS.textSubtle : COLORS.text;
  return (
    <div
      style={{
        padding: '12px 16px',
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        minWidth: 96,
      }}
    >
      <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textSubtle, letterSpacing: 2, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ marginTop: 2, fontFamily: FONTS.mono, fontSize: 22, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

function ThemeBefore() {
  // Light "paper" sample window
  return (
    <div
      style={{
        width: '100%',
        background: '#f7f3ec',
        color: '#1f1d1a',
        borderRadius: 10,
        padding: '20px 22px',
        fontFamily: FONTS.serif,
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Daily journal</div>
      <div style={{ height: 4, background: '#e0d9c8', borderRadius: 2, marginBottom: 8 }} />
      <div style={{ height: 4, background: '#e0d9c8', borderRadius: 2, marginBottom: 8, width: '84%' }} />
      <div style={{ height: 4, background: '#e0d9c8', borderRadius: 2, marginBottom: 8, width: '64%' }} />
      <div
        style={{
          marginTop: 14,
          padding: '8px 12px',
          background: '#c4623a',
          color: '#fff',
          borderRadius: 6,
          fontFamily: FONTS.mono,
          fontSize: 12,
          display: 'inline-block',
        }}
      >
        accent
      </div>
    </div>
  );
}
function ThemeAfter() {
  return (
    <div
      style={{
        width: '100%',
        background: '#0a0a0c',
        color: '#fafafa',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: '20px 22px',
        fontFamily: FONTS.serif,
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Daily journal</div>
      <div style={{ height: 4, background: COLORS.border, borderRadius: 2, marginBottom: 8 }} />
      <div style={{ height: 4, background: COLORS.border, borderRadius: 2, marginBottom: 8, width: '84%' }} />
      <div style={{ height: 4, background: COLORS.border, borderRadius: 2, marginBottom: 8, width: '64%' }} />
      <div
        style={{
          marginTop: 14,
          padding: '8px 12px',
          background: COLORS.accent,
          color: COLORS.bg,
          borderRadius: 6,
          fontFamily: FONTS.mono,
          fontSize: 12,
          display: 'inline-block',
        }}
      >
        accent
      </div>
    </div>
  );
}

// ---- Changelog TL;DR --------------------------------------------------------
// Four cuts so nothing has to squeeze into one frame. Each page reuses the
// changelog copy from the website / WhatsNew modal verbatim.

const CL_HEADER_F = F(2.8);
const CL_NEW_F = F(3.8);
const CL_FIXED_F = F(4.6);
const CL_REMOVED_F = F(2.8);

const CHANGELOG_NEW = [
  'Mermaid diagrams — flowcharts, sequence, gantt and more render live in ```mermaid blocks',
  'Image + PDF viewer — click any attachment to open it in a tab (PDFs use Chromium\'s built-in viewer)',
  'Todo notes — /todos/ files get a dedicated header with progress, task counts, Add task',
  'Daily notes auto-group by Year / Month in the sidebar — purely visual, files stay flat on disk',
  'Markdown variants — .markdown, .mdx, .mdown, .mkd, .mkdn, .mdwn all index and open',
  'Carbon · dark is the new default theme on fresh installs',
];

const CHANGELOG_FIXED = [
  'External edits no longer get silently overwritten — editor reloads on change, preserves unsaved work on conflict',
  'Rename, new note, new folder, new canvas and link dialogs no longer crash (window.prompt is disabled in Electron)',
  'Native confirm() / alert() swapped for themed in-app dialogs and a non-blocking toast',
  'Right-click rename preserves the original extension instead of forcing .md (canvas/mdx/markdown work)',
  'Tab strip updates after rename; stale tabs pointing at deleted files close themselves',
  'Task checkbox color follows the active theme accent (was a hardcoded blue)',
  'Daily-note + todo task counts no longer stuck at 0 on file load',
  'vault:// resolver finds attachments at common publish-site paths (blog/<slug>/foo.png → blogs/images/<slug>/foo.png)',
  'Custom-styled checkboxes replace the heavy native OS chrome inside task lists',
];

const CHANGELOG_REMOVED = [
  'Placeholder "Add weather / Add meetings / Add reading" chips on daily notes — replaced with live Words / Tasks / Streak counters',
];

function ChangelogScroll() {
  let offset = 0;
  const next = (f: number) => {
    const from = offset;
    offset += f;
    return from;
  };
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: COLORS.bg }}>
      <HaloBackdrop />
      <Sequence from={next(CL_HEADER_F)} durationInFrames={CL_HEADER_F} name="cl-header">
        <ChangelogHeader duration={CL_HEADER_F} />
      </Sequence>
      <Sequence from={next(CL_NEW_F)} durationInFrames={CL_NEW_F} name="cl-new">
        <ChangelogPage
          label="New"
          tone={COLORS.tag}
          items={CHANGELOG_NEW}
          duration={CL_NEW_F}
        />
      </Sequence>
      <Sequence from={next(CL_FIXED_F)} durationInFrames={CL_FIXED_F} name="cl-fixed">
        <ChangelogPage
          label="Fixed"
          tone={COLORS.link}
          items={CHANGELOG_FIXED}
          duration={CL_FIXED_F}
        />
      </Sequence>
      <Sequence from={next(CL_REMOVED_F)} durationInFrames={CL_REMOVED_F} name="cl-removed">
        <ChangelogPage
          label="Removed"
          tone={COLORS.textMuted}
          items={CHANGELOG_REMOVED}
          duration={CL_REMOVED_F}
        />
      </Sequence>
    </div>
  );
}

function ChangelogHeader({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const outOp = interpolate(frame, [duration - 14, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(inOp, outOp);
  return (
    <AbsoluteFill style={{ opacity, padding: '120px 160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Version row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 22 }}>
        <span style={{ fontFamily: FONTS.serif, fontSize: 72, fontWeight: 600, letterSpacing: -2, color: COLORS.text }}>
          v0.3.0
        </span>
        <span style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.textMuted, letterSpacing: 2 }}>
          May 2026
        </span>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: 999,
            background: COLORS.accent,
            color: COLORS.bg,
            fontFamily: FONTS.mono,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Latest
        </span>
      </div>
      {/* Highlight */}
      <div
        style={{
          fontFamily: FONTS.serif,
          fontStyle: 'italic',
          fontSize: 32,
          lineHeight: 1.35,
          color: COLORS.textMuted,
          maxWidth: 1400,
          opacity: interpolate(frame, [16, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        Mermaid diagrams, image + PDF viewer, todo notes with progress, virtual Year /
        Month grouping for daily notes, and a hard fix for an external-edit data-loss
        path.
      </div>
      <div
        style={{
          marginTop: 28,
          fontFamily: FONTS.mono,
          fontSize: 13,
          letterSpacing: 5,
          color: COLORS.accent,
          textTransform: 'uppercase',
          opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        ─── TL;DR ───
      </div>
    </AbsoluteFill>
  );
}

function ChangelogPage({
  label,
  tone,
  items,
  duration,
}: {
  label: string;
  tone: string;
  items: string[];
  duration: number;
}) {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const outOp = interpolate(frame, [duration - 14, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(inOp, outOp);
  // Per-item stagger so the list reveals like a typed list.
  const perItem = Math.max(6, Math.min(14, Math.floor((duration - 30) / Math.max(items.length, 1))));
  // Auto-fit type size: longer lists shrink slightly so 9 items still read.
  const itemFontSize = items.length >= 8 ? 19 : items.length >= 5 ? 22 : 26;
  const lineHeight = items.length >= 8 ? 1.45 : 1.5;
  return (
    <AbsoluteFill style={{ opacity, padding: '90px 140px', display: 'flex', flexDirection: 'column' }}>
      {/* Section label, big */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 26 }}>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 13,
            letterSpacing: 5,
            color: tone,
            textTransform: 'uppercase',
          }}
        >
          v0.3.0
        </span>
        <span style={{ fontFamily: FONTS.serif, fontSize: 56, fontWeight: 600, color: COLORS.text, letterSpacing: -1.5 }}>
          {label}
        </span>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 14,
            color: COLORS.textMuted,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          ({items.length})
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: items.length >= 8 ? 10 : 14, flex: 1 }}>
        {items.map((text, i) => {
          const start = 14 + i * perItem;
          const itemOp = interpolate(frame, [start, start + 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const itemX = interpolate(frame, [start, start + 14], [-6, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                opacity: itemOp,
                transform: `translateX(${itemX}px)`,
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: tone,
                  borderRadius: 999,
                  marginTop: itemFontSize * 0.55,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: itemFontSize,
                  lineHeight,
                  color: COLORS.text,
                  maxWidth: 1500,
                }}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ----------------------------------------------------------------------------

function Outro() {
  const frame = useCurrentFrame();
  return (
    <SoftFade durationFrames={OUTRO}>
      <div style={{ position: 'relative', width: '100%', height: '100%', background: COLORS.bg }}>
        <HaloBackdrop />
        <KenBurns from={1} to={1.04} duration={OUTRO}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 17,
                letterSpacing: 6,
                color: COLORS.accent,
                textTransform: 'uppercase',
                opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              Quietly handcrafted
            </div>
            <SlowType
              text="sidenotes.me"
              delay={20}
              cps={11}
              size={108}
              font={FONTS.serif}
              letterSpacing={-2.5}
              color={COLORS.accentInk}
            />
            <div
              style={{
                marginTop: 18,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                justifyContent: 'center',
                opacity: interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}
            >
              <OutroPill icon="🔒" label="Privacy first" tone="accent" />
              <OutroPill icon="🍎" label="Mac" />
              <OutroPill icon="◧" label="Windows" />
              <OutroPill icon="🐧" label="Linux" />
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: FONTS.serif,
                fontSize: 22,
                color: COLORS.textMuted,
                opacity: interpolate(frame, [130, 170], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}
            >
              Built with care by <span style={{ color: COLORS.text, fontStyle: 'italic' }}>Koushith</span>
            </div>
            <div
              style={{
                marginTop: 4,
                fontFamily: FONTS.mono,
                fontSize: 13,
                letterSpacing: 3,
                color: COLORS.textSubtle,
                textTransform: 'uppercase',
                opacity: interpolate(frame, [180, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}
            >
              Your notes never leave your device
            </div>
          </div>
        </KenBurns>
      </div>
    </SoftFade>
  );
}

function OutroPill({ icon, label, tone }: { icon: string; label: string; tone?: 'accent' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 18px',
        borderRadius: 999,
        border: `1px solid ${tone === 'accent' ? COLORS.accent : COLORS.border}`,
        background: tone === 'accent' ? COLORS.accentSubtle : COLORS.bgElevated,
        fontFamily: FONTS.mono,
        fontSize: 16,
        color: tone === 'accent' ? COLORS.accentInk : COLORS.text,
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </span>
  );
}

// SVG used in the Mermaid scene
function DiagramSVG() {
  return (
    <div
      style={{
        background: COLORS.bgElevated,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 24,
        minHeight: 220,
      }}
    >
      <svg viewBox="0 0 380 220" width="100%" height="100%">
        <defs>
          <marker id="arr-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={COLORS.textMuted} />
          </marker>
        </defs>
        <g fontFamily={FONTS.sans} fontSize={14} fill={COLORS.text}>
          <rect x={20} y={40} width={110} height={44} rx={8} fill={COLORS.bgHover} stroke={COLORS.border} />
          <text x={75} y={67} textAnchor="middle">Idea</text>
          <path d="M130 62 L170 62" stroke={COLORS.textMuted} strokeWidth={1.4} markerEnd="url(#arr-c)" />
          <polygon
            points="240,32 320,62 240,92 160,62"
            fill={COLORS.accentSubtle}
            stroke={COLORS.accent}
            strokeWidth={1.4}
          />
          <text x={240} y={66} textAnchor="middle" fill={COLORS.accentInk}>Worth shipping?</text>
          <path d="M210 90 L150 160" stroke={COLORS.textMuted} strokeWidth={1.4} markerEnd="url(#arr-c)" />
          <rect x={80} y={150} width={110} height={44} rx={8} fill={COLORS.bgHover} stroke={COLORS.border} />
          <text x={135} y={177} textAnchor="middle">Build</text>
          <path d="M270 90 L320 160" stroke={COLORS.textMuted} strokeWidth={1.4} markerEnd="url(#arr-c)" />
          <rect x={250} y={150} width={110} height={44} rx={8} fill={COLORS.bgHover} stroke={COLORS.border} />
          <text x={305} y={177} textAnchor="middle">Park</text>
        </g>
      </svg>
    </div>
  );
}

// ---- Main composition ------------------------------------------------------
export function V030Cinematic() {
  let offset = 0;
  const push = (frames: number) => {
    const from = offset;
    offset += frames;
    return from;
  };
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {HAS_AUDIO && (
        <Audio src={staticFile('audio/bg.mp3')} volume={0.45} />
      )}
      <Sequence from={push(SLATE)} durationInFrames={SLATE}><Slate /></Sequence>
      <Sequence from={push(FOLDER)} durationInFrames={FOLDER}><FolderCinematic durationFrames={FOLDER} /></Sequence>
      <Sequence from={push(MERMAID)} durationInFrames={MERMAID}><MermaidScene /></Sequence>
      <Sequence from={push(VIEWER)} durationInFrames={VIEWER}><ViewerScene /></Sequence>
      <Sequence from={push(TODOS)} durationInFrames={TODOS}><TodosScene /></Sequence>
      <Sequence from={push(RECAP)} durationInFrames={RECAP}><RecapMontage /></Sequence>
      <Sequence from={push(CHANGELOG)} durationInFrames={CHANGELOG}><ChangelogScroll /></Sequence>
      <Sequence from={push(OUTRO)} durationInFrames={OUTRO}><Outro /></Sequence>
    </AbsoluteFill>
  );
}
