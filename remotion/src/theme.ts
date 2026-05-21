// Mirrors the Carbon · dark palette from src/stores/theme.ts so the video reads as
// "this is the SideNotes app." Keep in sync if Carbon changes.

export const COLORS = {
  bg: '#0a0a0c',
  bgElevated: '#121214',
  bgHover: '#1a1a1d',
  text: '#fafafa',
  textMuted: '#88888c',
  textSubtle: '#56565a',
  border: '#222226',
  borderSubtle: '#1a1a1c',
  accent: '#c4b1ff',
  accentSubtle: '#2a1f4a',
  accentInk: '#d8c8ff',
  tag: '#86efac',
  tagSoft: '#14322a',
  link: '#7dd3fc',
};

export const FONTS = {
  // System fallbacks only — keeps Remotion's headless bundler from needing the same
  // @fontsource installs as the app.
  serif: '"Source Serif 4", "Iowan Old Style", Georgia, serif',
  sans: '-apple-system, BlinkMacSystemFont, system-ui, "Inter", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace',
};
