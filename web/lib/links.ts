// Single source of truth for download links and external URLs the landing
// page references. Bump VERSION when a new release ships — every download
// button updates automatically.

export const REPO_URL = 'https://github.com/Koushith/side-deck';
export const ISSUES_URL = `${REPO_URL}/issues`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const LATEST_RELEASE_URL = `${RELEASES_URL}/latest`;

export const VERSION = '0.1.0';

/** GitHub auto-redirects `/releases/latest/download/<asset>` to whichever
 *  asset under the latest tag has that exact filename. Names match the
 *  electron-builder `artifactName` template in the app's package.json:
 *  `Side-${version}-${os}-${arch}.${ext}` (NSIS uses Side-Setup-…). */
const BASE = `${RELEASES_URL}/latest/download`;

export const DOWNLOADS = {
  macArm: `${BASE}/Side-${VERSION}-mac-arm64.dmg`,
  macIntel: `${BASE}/Side-${VERSION}-mac-x64.dmg`,
  windows: `${BASE}/Side-Setup-${VERSION}-x64.exe`,
  windowsArm: `${BASE}/Side-Setup-${VERSION}-arm64.exe`,
  linux: `${BASE}/Side-${VERSION}-linux-x86_64.AppImage`,
  linuxArm: `${BASE}/Side-${VERSION}-linux-arm64.AppImage`,
};
