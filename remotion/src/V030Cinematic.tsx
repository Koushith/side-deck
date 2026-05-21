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

// Per-section frame budgets (~75s pure cinematic cut — no live capture).
const SLATE = F(4.5);          // intro slate
const FOLDER = F(13);          // folder flat creation centerpiece
const MERMAID = F(10);
const VIEWER = F(12);          // mock photo + PDF preview frames
const TODOS = F(13);           // animated checklist
const RECAP = F(15);           // five fix beats with UI mocks
const OUTRO = F(7);

export function totalFramesCinematic(): number {
  return SLATE + FOLDER + MERMAID + VIEWER + TODOS + RECAP + OUTRO;
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

          {/* Supporting evidence: extension chips fade in last */}
          <div
            style={{
              marginTop: 48,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              opacity: interpolate(frame, [220, 260], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            {['.png', '.jpg', '.gif', '.webp', '.svg', '.bmp', '.avif', '.pdf'].map((ext) => (
              <span
                key={ext}
                style={{
                  padding: '10px 18px',
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bgElevated,
                  fontFamily: FONTS.mono,
                  fontSize: 18,
                  color: COLORS.textMuted,
                }}
              >
                {ext}
              </span>
            ))}
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

/** Pre-roll into the live capture: full-screen "See it in action." card. */
function LivePreRoll() {
  const frame = useCurrentFrame();
  return (
    <SoftFade durationFrames={LIVE_PAD}>
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
            gap: 26,
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
            Enough talk
          </div>
          <SlowType
            text="See it in action."
            delay={14}
            cps={9}
            size={100}
            font={FONTS.serif}
            letterSpacing={-2.4}
            align="center"
          />
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: 20,
              color: COLORS.textMuted,
              opacity: interpolate(frame, [50, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            Running on a real vault, captured live.
          </div>
        </div>
      </div>
    </SoftFade>
  );
}

function LiveCapture() {
  const frame = useCurrentFrame();
  const beats = beatsData as Array<{ id: string; label: string; startMs: number; endMs: number }>;
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile('captures/live-demo.webm')}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        muted
      />
      {/* Per-beat label overlay */}
      {beats.map((b) => {
        const fromF = Math.round((b.startMs / 1000) * FPS);
        const endF = Math.round((b.endMs / 1000) * FPS);
        const dur = Math.max(1, endF - fromF);
        const localFrame = frame - fromF;
        if (localFrame < 0 || localFrame > dur) return null;
        return <BeatLabel key={b.id} id={b.id} dur={dur} localFrame={localFrame} />;
      })}
      {/* Top-right watermark */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          right: 80,
          fontFamily: FONTS.mono,
          fontSize: 14,
          letterSpacing: 3,
          color: COLORS.textSubtle,
          textTransform: 'uppercase',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        }}
      >
        SideNotes · v0.3.0
      </div>
    </AbsoluteFill>
  );
}

const BEAT_COPY: Record<string, { eyebrow: string; headline: string; tone?: string }> = {
  hero: { eyebrow: 'Your vault', headline: 'Plain markdown on your Mac.' },
  today: { eyebrow: '12-day streak', headline: 'Yesterday rolls into today.', tone: 'link' },
  typing: { eyebrow: 'Live counts', headline: 'Words and tasks tick as you type.', tone: 'tag' },
  grouping: { eyebrow: 'Sidebar magic', headline: 'Year / Month grouping. Disk stays flat.' },
  todo: { eyebrow: 'Todo notes', headline: 'Progress chrome on every checklist.', tone: 'accent' },
  palette: { eyebrow: '⌘K', headline: 'Jump anywhere.' },
  graph: { eyebrow: 'Graph view', headline: 'Watch your notes connect.', tone: 'link' },
  outro: { eyebrow: 'v0.3.0', headline: 'Everything in one box.', tone: 'accent' },
};

function BeatLabel({ id, dur, localFrame }: { id: string; dur: number; localFrame: number }) {
  const meta = BEAT_COPY[id] ?? { eyebrow: id, headline: id };
  const fadeIn = interpolate(localFrame, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(localFrame, [dur - 14, dur], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(localFrame, [0, 20], [22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = Math.min(fadeIn, fadeOut);
  const toneColor =
    meta.tone === 'tag' ? COLORS.tag : meta.tone === 'link' ? COLORS.link : COLORS.accent;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, ${COLORS.bg}cc 0%, transparent 38%, transparent 62%, ${COLORS.bg}66 100%)`,
          opacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 80,
          bottom: 80,
          maxWidth: 1100,
          opacity,
          transform: `translateY(${y}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 15,
            letterSpacing: 4,
            color: toneColor,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          {meta.eyebrow}
        </div>
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: 60,
            fontWeight: 600,
            letterSpacing: -1.5,
            lineHeight: 1.05,
            color: COLORS.text,
            textShadow: '0 2px 18px rgba(0,0,0,0.55)',
          }}
        >
          {meta.headline}
        </div>
      </div>
    </AbsoluteFill>
  );
}

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
  const inOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const outOp = interpolate(frame, [duration - 14, duration], [1, 0], { extrapolateLeft: 'clamp' });
  const opacity = Math.min(inOp, outOp);
  // "After" fades in slightly delayed so the eye lands on Before first.
  const beforeOp = interpolate(frame, [4, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const afterOp = interpolate(frame, [28, 56], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const arrowOp = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

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
              Free download
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
                marginTop: 22,
                display: 'flex',
                gap: 22,
                fontFamily: FONTS.mono,
                fontSize: 18,
                color: COLORS.textMuted,
                opacity: interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}
            >
              <span>No sign-up</span>
              <span>·</span>
              <span>Runs offline</span>
              <span>·</span>
              <span>Just files on your Mac</span>
            </div>
          </div>
        </KenBurns>
      </div>
    </SoftFade>
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
      <Sequence from={push(OUTRO)} durationInFrames={OUTRO}><Outro /></Sequence>
    </AbsoluteFill>
  );
}
