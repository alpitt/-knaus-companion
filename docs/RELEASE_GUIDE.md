# Knaus Companion release guide

## Installation and updating

Knaus Companion is a static progressive web application published from `app/` by GitHub Pages. Merge only a reviewed release branch into `main`; the existing Pages workflow validates and publishes the site. Open the published site while online after an update, wait for the new service worker to activate, then refresh once. The Application Health screen reports the installed version and cache state.

## Offline use

Visit every essential area once while online. The core shell, Engineering Canon contract, Digital Twin, local reasoning data and key vehicle reference data are pre-cached. Manual page images load on demand and a page not previously opened may be unavailable offline. If the cache is missing or stale, open **Application health** and choose **Rebuild cache** while connected. **Clear cache** removes application files only; it does not erase saved vehicle records.

## Backup and restore

Open **Settings, backup & recovery** and export a JSON backup before every release or major data edit. The summary shows the schema and local-record count. Restore accepts schema-version-1 and schema-version-2 backups, previews key record counts, asks for confirmation, and leaves current data unchanged when parsing or migration fails. Store exported files somewhere separate from the browser profile.

## Digital Twin, Engineering Canon and Assistant

The Digital Twin describes repository and owner-supported vehicle facts; unknown and estimated values remain explicit. Engineering Canon displays only governed records listed by its manifest—an empty corpus is valid until canonical source content is supplied. The Assistant works locally, ranks repository evidence, cites its sources and refuses unsafe instructions. It is guidance, not a substitute for the manufacturer manual or a qualified technician.

## Troubleshooting

- Wrong version: refresh, then rebuild the cache from Application Health.
- Blank/offline screen: reconnect, clear the app cache, and reload.
- Missing manual page offline: reconnect and open that page once.
- Restore rejected: confirm the file is an unedited Knaus Companion JSON backup using schema 1 or 2.
- Persistent failure: export a backup, record the Health screen status, browser/version and failing route, then report the issue.

## Known limitations

Data remains local to the current browser profile. There is no cloud synchronisation, OBD integration, external AI, predictive maintenance, or imported Engineering Canon handbook content. Cache status is browser-reported and does not prove every on-demand manual image is present.

## Release checklist

1. Confirm a clean dedicated branch and export a production backup.
2. Run every deterministic builder and validator.
3. Run `node --test tests/*.test.js` and browser smoke tests at desktop, tablet and mobile sizes.
4. Verify offline startup, search, Assistant, Canon, Digital Twin, manual reader, Workshop, backup/restore and print preview.
5. Review the diff, push the branch, review CI, then merge through normal change control.

