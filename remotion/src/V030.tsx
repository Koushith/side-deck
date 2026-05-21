import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Intro, Outro } from './sections/openClose';
import {
  AttachmentsSection,
  CarbonDarkSection,
  DailyGroupingSection,
  MdVariantsSection,
  MermaidSection,
  TodoSection,
} from './sections/newFeatures';
import {
  DialogsSection,
  ImagePathsSection,
  TaskCountsSection,
  WatcherSafeSection,
} from './sections/fixes';
import { COLORS } from './theme';

/** Section running order. Each section gets the same `hold` (frames),
 *  driving total duration = `sections.length * holdFrames`. */
const SCRIPT: { key: string; hold: number; render: (hold: number) => JSX.Element }[] = [
  { key: 'intro',         hold: 130, render: (h) => <Intro hold={h} /> },
  { key: 'mermaid',       hold: 160, render: (h) => <MermaidSection hold={h} /> },
  { key: 'attachments',   hold: 150, render: (h) => <AttachmentsSection hold={h} /> },
  { key: 'todo',          hold: 160, render: (h) => <TodoSection hold={h} /> },
  { key: 'daily',         hold: 170, render: (h) => <DailyGroupingSection hold={h} /> },
  { key: 'md-variants',   hold: 140, render: (h) => <MdVariantsSection hold={h} /> },
  { key: 'carbon',        hold: 140, render: (h) => <CarbonDarkSection hold={h} /> },
  { key: 'watcher-safe',  hold: 170, render: (h) => <WatcherSafeSection hold={h} /> },
  { key: 'dialogs',       hold: 160, render: (h) => <DialogsSection hold={h} /> },
  { key: 'task-counts',   hold: 150, render: (h) => <TaskCountsSection hold={h} /> },
  { key: 'image-paths',   hold: 160, render: (h) => <ImagePathsSection hold={h} /> },
  { key: 'outro',         hold: 130, render: (h) => <Outro hold={h} /> },
];

export function totalFrames(): number {
  return SCRIPT.reduce((a, s) => a + s.hold, 0);
}

export function V030() {
  // Validate consistency at runtime (silent in render, errors in studio).
  useVideoConfig();
  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {SCRIPT.map((section) => {
        const seq = (
          <Sequence
            key={section.key}
            from={offset}
            durationInFrames={section.hold}
            name={section.key}
          >
            {section.render(section.hold)}
          </Sequence>
        );
        offset += section.hold;
        return seq;
      })}
    </AbsoluteFill>
  );
}

/** Vertical / Shorts variant — same composition, different canvas (9:16). */
export function V030Vertical() {
  return <V030 />;
}
