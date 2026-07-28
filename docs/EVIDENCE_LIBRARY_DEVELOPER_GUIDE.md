# Evidence Library developer guide

Metadata follows `app/data/evidence_library.schema.json` and is stored additively in `state.evidenceLibrary` under unchanged storage key `knaus-ultimate-v1` and schema version 2. Binary bodies use IndexedDB database `knaus-companion-evidence`, version 1, store `files`. Stable `EVD-…` IDs identify metadata; checksum-derived `EVF-…` keys deduplicate binary bodies.

`evidence-file-validation.js` centralises MIME types, extensions, magic bytes and limits: images 20 MB, PDF 50 MB, text/JSON/CSV 5 MB, preview 2 MB. SHA-256 is local. Matching checksum and size reuse the binary while permitting multiple references.

Metadata validates before persistence. Attachment stores and verifies the binary first; a failed metadata write removes only a newly created binary. Archive is preferred to deletion. Deletion and orphan cleanup require confirmation. Object URLs must be short-lived and revoked. Revision history uses the shared append-only history service. Digital Twin reference files remain immutable, and generated reasoning indexes never contain private evidence.

Windows PowerShell validation:

```powershell
node --check app/assets/js/evidence-storage.js
node --check app/assets/js/evidence-library.js
node --check app/assets/js/evidence-file-validation.js
node scripts/validate-evidence-library.js
node --test tests/*.test.js
```

Never upload evidence, silently delete it, claim missing files exist, treat an attachment as proof without review, interpret images automatically, use external document parsing, store large binaries in localStorage, execute imports, render untrusted HTML, overwrite conflicts, erase history, reuse IDs, or fabricate dates, totals or provenance.
