# Knaus Companion developer guide

## Architecture and directory structure

Knaus Companion is a dependency-free static PWA using vanilla HTML, CSS and JavaScript. `app/` is the deployable root; `app/index.html` and `app/404.html` must remain byte-for-byte identical. Production logic is in `app/assets/js/`, styling in `app/assets/css/`, governed JSON in `app/data/`, Companion chapters in `app/chapters/`, official manual images in `app/manual/pages/`, and the original PDF in `app/docs/`. Repository-only builders live in `scripts/`; Node built-in tests live in `tests/`.

State uses local storage key `knaus-ultimate-v1` and schema version 2. Never rename that key, discard user records, or mutate governed source data at runtime. Hash routes are declared in the central `NAV` list and must have a matching `data-screen` section.

## Coding standards

- Preserve offline operation, GitHub Pages paths and dependency-free execution.
- Make the smallest reversible change; do not introduce frameworks, bundlers or placeholder content.
- Escape user/content strings before HTML insertion and validate structured JSON before use.
- Keep status, evidence and ranking definitions central rather than duplicating them.
- Maintain keyboard operation, visible focus, accessible names, 44-pixel touch targets and responsive layouts.
- Keep `index.html` and `404.html` synchronized in every HTML change.

## Local validation (Windows PowerShell)

```powershell
git status --short --branch
node --check app/assets/js/app-v4.js
node --check app/service-worker.js
node scripts/build-kb-index.js
node scripts/validate-digital-twin.js
node scripts/build-reasoning-index.js
node scripts/validate-reasoning.js
node --test tests/*.test.js
python -m http.server 8765 --directory app
```

After starting the server, browse to `http://localhost:8765/`. Exercise all release-critical routes, browser offline mode, backup validation/confirmation and print preview. Builders are deterministic: a clean build must not leave unexpected diffs.

## Testing and validation

`tests/repository-integrity.test.js` protects content counts, schema/storage compatibility and production assets. Domain suites cover the Canon, Digital Twin, local reasoning, safety, diagnostics and vehicle evidence. `tests/release-candidate.test.js` checks routes, duplicate identifiers, manifest media, static assets, offline shell and release consistency. `.github/workflows/validate.yml` runs these checks on pull requests without deploying.

## Branch and release process

`main` is production. Start each scoped change from an up-to-date clean `main` or the approved programme branch, use a dedicated branch, commit logical checkpoints, and open a reviewed pull request. Update all version surfaces together: HTML title/visible version, `APP_VERSION`, `build.json`, service-worker cache/query versions, README and deployment validation. The Pages workflow remains the only publisher and runs only for `main`.

Before merge, follow `docs/RELEASE_GUIDE.md`, verify a clean deterministic build, inspect CI and record actual test evidence. Roll back by reverting the release merge on `main`; do not change the storage key or delete browser data.
