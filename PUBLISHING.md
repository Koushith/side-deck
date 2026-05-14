# Publishing SideNotes

End-to-end notes for shipping SideNotes to the Mac App Store, Microsoft Store,
and direct download (DMG + NSIS). Stick to this doc when iterating on releases.

## Once, before any release

- [ ] Bump `version` in `package.json` (and tag the commit).
- [ ] Refresh screenshots if UI changed.
- [ ] Confirm `PRIVACY.md` and the hosted copy at `https://sidenotes.me/privacy`
      match.
- [ ] Run `npm run typecheck` and `npm run build`; the app must build clean
      with no console errors when launched from `dist/`.
- [ ] Verify the production CSP is intact (`electron/main.ts` —
      `default-src 'self'`, no remote `font-src` / `connect-src` hosts).

## Direct download — Mac DMG (Developer ID)

Required env vars (set in your shell or CI secret store; never commit):

| Variable | What |
|---|---|
| `CSC_LINK` or `CSC_NAME` | Developer ID Application cert (p12 or keychain name) |
| `CSC_KEY_PASSWORD` | Cert export password (if using p12) |
| `APPLE_ID` | Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from appleid.apple.com |
| `APPLE_TEAM_ID` | 10-char Team ID from `developer.apple.com/account` |

Then:

```
npm run package:mac
```

To enable notarization, flip `mac.notarize` in `package.json` from `false` to:
```json
"notarize": { "teamId": "${env.APPLE_TEAM_ID}" }
```
electron-builder will read `APPLE_ID` + `APPLE_APP_SPECIFIC_PASSWORD` from env
and submit to Apple's notary service automatically.

Output: `release/SideNotes-<version>-mac-<arch>.dmg` + `.zip`.

## Mac App Store (MAS)

> **Read this first.** SideNotes reads a user-chosen vault folder and watches
> it for changes. Under the MAS sandbox this requires **security-scoped
> bookmarks** — the bookmark must be persisted on vault selection and
> resolved on every launch. The current `chokidar`-on-arbitrary-path code
> needs adapting before the MAS build will pass review. Plan ~1 week of
> sandbox plumbing.

### One-time

1. Enroll in the Apple Developer Program.
2. In Apple Developer Portal:
   - Create App ID `com.koushith.sidenotes` with **App Sandbox** capability.
   - Generate `3rd Party Mac Developer Application` + `3rd Party Mac
     Developer Installer` certificates and download to your keychain.
   - Create a MAS provisioning profile for the App ID; download to
     `build/SideNotes.provisionprofile` (already referenced in
     `package.json` → `mas.provisioningProfile`).
3. In App Store Connect, create the Mac App with the same bundle ID and
   fill in all the metadata (description, screenshots ≥ 2560×1600,
   keywords, support URL, privacy URL).

### Build

```
npm run package:mac
```

The `mas` target in `build.mac.target` produces
`release/SideNotes-<version>-mac-<arch>.pkg`. Upload via Apple's **Transporter**
app (App Store → Mac).

### Entitlements

- `build/entitlements.mac.plist` — Developer ID / direct-DMG builds. Hardened
  runtime + V8 JIT + user-selected file access + Apple Events.
- `build/entitlements.mas.plist` — MAS builds. Adds `app-sandbox` and the
  `bookmarks.app-scope` entitlement. **Network client is intentionally off**.

## Microsoft Store (MSIX / APPX)

### One-time

1. Sign up for **Microsoft Partner Center** ($19 individual / $99 company).
2. Reserve the name `SideNotes`. Partner Center will give you three values
   you must paste into `package.json` → `build.appx`:
   - `identityName` (e.g. `12345Koushith.SideNotes`)
   - `publisher` (`CN=...` — the long publisher ID)
   - `publisherDisplayName` (your display name)
3. Optionally upload Store tile assets in `build/appx/` (44×44, 71×71,
   150×150, 310×150, 310×310, splash). `electron-builder` will auto-generate
   acceptable defaults from `build/icon.png` if missing.

### Build

On a Windows machine (or CI runner) — APPX cannot be produced from macOS:

```
npm run package:win
```

Output: `release/SideNotes-<version>-win-<arch>.appx`. Upload in Partner
Center → submit. First review is usually 24-48 hours.

## Direct download — Windows

The `nsis` target produces a per-user installer; the `portable` target
produces a single-EXE that runs without installation. Both work out of the
box and require no signing — though Windows SmartScreen will warn until the
EXE is signed with an EV code-signing cert or has accumulated reputation.

## Checklist — submission day

- [ ] `npm run typecheck` clean
- [ ] `npm run build` clean
- [ ] Production binary launches, vault folder picker works, no console errors
- [ ] DevTools is **not** auto-opening in the production build
- [ ] Privacy URL resolves
- [ ] Screenshots prepared (≥3 per platform, current UI)
- [ ] App Store Connect / Partner Center metadata reviewed
- [ ] Bundle ID matches across cert, profile, and config

## What is **deliberately** off in this app

- Auto-updater (Electron-builder publish) — `publish: null` in `package.json`.
- Telemetry, analytics, crash reporting — none of these exist in the codebase.
- Remote fonts — bundled via `@fontsource-variable/*`.
- Remote API calls — zero `connect-src` hosts in the production CSP.

That makes the privacy story trivial: "no network requests, ever."
