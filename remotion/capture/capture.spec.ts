// Playwright capture rig for the SideNotes Electron app.
//
// Plays through a scripted demo on a *throwaway vault* and writes a screen recording
// to remotion/public/captures/. Remotion compositions can then `<OffthreadVideo>` from
// /captures/foo.webm to layer real app footage into the release video.
//
// This file is intentionally an opt-in step — the v0.3.0 typography video renders
// without it. Run `npm run capture` only when you want fresh footage.
//
// Setup once:
//   1. `npm run build && npm run package:mac` in the repo root to get a packaged app.
//   2. Point ELECTRON_APP_PATH below at the built binary (or rely on the default dev path).
//   3. `npm run capture`

import { _electron as electron, expect, test } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

const CAPTURE_DIR = path.resolve(__dirname, '../public/captures');

// Default: launch via the local dev build's main entry. Override with ELECTRON_APP_PATH
// when targeting a packaged binary.
const ELECTRON_MAIN =
  process.env.ELECTRON_APP_PATH ??
  path.resolve(__dirname, '../../dist-electron/main.js');

test.beforeAll(async () => {
  await fs.mkdir(CAPTURE_DIR, { recursive: true });
});

test('drive the SideNotes demo', async () => {
  // Use a throwaway temp directory as the vault so we never touch the user's notes.
  const tmpVault = await fs.mkdtemp(path.join(os.tmpdir(), 'sidenotes-capture-'));
  await fs.mkdir(path.join(tmpVault, 'Daily Notes'), { recursive: true });
  // Seed a couple of demo files so the sidebar isn't empty.
  await fs.writeFile(
    path.join(tmpVault, 'Daily Notes', '2026-05-22.md'),
    '# 2026-05-22\n\n- [ ] Ship release video\n- [x] Update changelog\n'
  );

  const app = await electron.launch({
    args: [ELECTRON_MAIN],
    env: {
      ...process.env,
      SIDENOTES_AUTO_OPEN_VAULT: tmpVault,
      NODE_ENV: 'production',
    },
    recordVideo: { dir: CAPTURE_DIR, size: { width: 1920, height: 1080 } },
  });

  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  // Give the app a beat to finish boot animation.
  await window.waitForTimeout(1500);

  // ---- Scripted demo: each beat becomes a clip Remotion can crop into. ----
  // Beat 1: open command palette
  await window.keyboard.press('Meta+K');
  await window.waitForTimeout(800);
  await window.keyboard.press('Escape');
  await window.waitForTimeout(400);

  // Beat 2: open today's daily note
  await window.keyboard.press('Meta+D');
  await window.waitForTimeout(1200);

  // Beat 3: type a few words and tick a task
  await window.keyboard.type('Shipping the v0.3.0 video today.', { delay: 30 });
  await window.waitForTimeout(800);

  // Beat 4: open a todo file via slash menu if it exists in the seeded vault
  // (no-op-safe if not present)
  await window.keyboard.press('Escape');
  await window.waitForTimeout(400);

  // ---- end demo ----
  await app.close();

  // Sanity check: the recording should exist.
  const files = await fs.readdir(CAPTURE_DIR);
  expect(files.some((f) => f.endsWith('.webm'))).toBeTruthy();
});
