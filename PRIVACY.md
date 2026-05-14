# SideNotes — Privacy Policy

_Last updated: 2026-05-14_

## Short version

SideNotes is local-first. It does not collect, transmit, or store any personal
information about you. Your notes never leave your device unless you explicitly
move them yourself.

## What stays on your device

- Every note, canvas, daily, attachment, and tag lives as a plain file on
  disk inside the vault folder you choose.
- App preferences (theme, vault path, recent vaults, pinned items) live in
  the OS's standard application-support directory for SideNotes.
- A small `.json` index file is maintained alongside your vault for fast
  search and links. It can be deleted at any time without losing data.

## What SideNotes does **not** do

- No telemetry, analytics, crash reporting, or error logging is sent anywhere.
- No account, login, or remote authentication.
- No cloud sync — if you want sync, point the vault folder at iCloud Drive,
  Dropbox, Syncthing, or any folder-level sync tool of your choice.
- No advertising or third-party SDKs.
- No reading or scanning of files outside your selected vault folder.

## Network activity

SideNotes makes **no outbound network requests** in normal use. Specifically:

- Fonts and assets are bundled inside the application — nothing is fetched
  from Google, CDNs, or any remote server at runtime.
- The Electron auto-updater is **disabled**.
- External hyperlinks (those clicked inside notes) open in your default
  browser; the request is made by the browser, not by SideNotes itself.

## Data controllers and rights

Because SideNotes never collects data, there is no controller, processor, or
storage location subject to GDPR, CCPA, or similar regulations. Your notes
are yours; deleting the vault folder deletes the data.

## Children

SideNotes does not knowingly collect any information from anyone, including
children under 13.

## Changes to this policy

If this policy ever changes, the updated version will appear at
`https://sidenotes.me/privacy` with a new "Last updated" date.

## Contact

Questions, concerns, or security reports: hello@sidenotes.me
