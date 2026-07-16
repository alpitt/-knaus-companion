# Knaus Companion Ultimate

GitHub Pages host for the preserved Knaus Companion Ultimate workshop application.

## Live version

The current live site remains on the `main` branch until Version 2.0.0 passes validation.

## Version 2.0.0 Foundation branch

Development branch: `release/v2.0.0-foundation`

New foundation features:

- Release dashboard
- Runtime integrity checks
- Bookmarks
- Recently viewed pages
- Version and build tracking
- Preserved service logs, checklists, vehicle notes and upgrade records

## Protected content checks

The deployment workflow refuses to publish unless the package contains:

- 44 companion workshop chapters
- 286 official Knaus manual page images
- The original manufacturer PDF
- Build metadata confirming the expected counts
- The modular application files and data

## Publish Version 2.0.0

Upload `Knaus_Companion_Ultimate_v2.0.0.zip` to the root of the `release/v2.0.0-foundation` branch. The branch workflow extracts and validates it.

After validation, merge the branch into `main` to replace the live version.

## Live site

`https://alpitt.github.io/-knaus-companion/`

## iPhone installation

Open the site in Safari, tap Share, then tap Add to Home Screen.
