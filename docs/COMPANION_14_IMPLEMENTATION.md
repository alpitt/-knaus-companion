# Companion 14 implementation programme

## Verified baseline

Sprint 1 begins from the verified production baseline:

- Production version: 13.12.0
- Production branch: `main`
- Production source: `app/`
- Architecture: static dependency-free PWA using vanilla HTML, CSS and JavaScript
- Hosting: GitHub Pages
- Browser storage key: `knaus-ultimate-v1`
- Saved-state schema: version 2
- Preserved content: 44 Companion chapters, 286 official manual pages and the original manufacturer PDF

The existing `.github/workflows/deploy-pages.yml` remains the sole deployment workflow and is outside Sprint 1 change scope.

## Purpose of Sprint 1

Sprint 1 establishes validation and content governance before Engineering Canon content is imported or production behavior changes. It adds:

- pull-request and Sprint-branch validation that never deploys;
- executable repository-integrity tests;
- a JSON Schema contract for Engineering Canon records;
- an intentionally empty Canon manifest recording the expected 275 entries;
- strict future-record validation using Node built-in modules;
- an evidence-based inventory of currently unreferenced data files.

Sprint 1 does not import Canon records, change the visible application, alter offline behavior, change browser data, or refactor production files.

## Validation architecture

`.github/workflows/validate.yml` runs on pull requests targeting `main` and pushes to `companion-14-sprint-1-validation`. It uses Node.js 24 LTS, checks production JavaScript syntax and executes every `tests/*.test.js` file individually with clear failure annotations. It has read-only repository permissions and contains no Pages or deployment steps.

`tests/repository-integrity.test.js` protects the current production package:

- required production files;
- JavaScript syntax;
- all `app/data` JSON files;
- chapter structure and the complete 01–44 sequence;
- manual index uniqueness and the complete 001–286 image sequence;
- chapter-to-manual references;
- electrical, water and gas component relationships;
- byte parity between `index.html` and `404.html`;
- application version consistency;
- storage key and saved-state schema compatibility.

`tests/kb-manifest.test.js` protects the Engineering Canon contract and validates current or future manifest records without third-party packages. An empty manifest is valid and emits an informational message rather than a failure.

## Engineering Canon import strategy

1. Obtain the canonical First Edition and Second Edition source material from an identified owner or custodian.
2. Preserve the supplied source unchanged outside the generated application records.
3. Inventory every expected identifier before importing content:
   - First Edition: `KB-001` through `KB-250`.
   - Second Edition: `KB2-001` through `KB2-025`.
4. Calculate a SHA-256 checksum for each canonical source record.
5. Capture provenance and approval information before transforming content.
6. Import a small reviewable batch into `app/data/kb-content/`.
7. Add records to `app/data/kb_manifest.json` only when their content files exist.
8. Run all validation locally and through pull-request CI.
9. Review conflicts with existing Companion chapters explicitly; never resolve them by silent replacement.

## Rules for future KB imports

- Do not fabricate missing records, titles, sources, dates, checksums or approvals.
- IDs and sequences must match the edition ranges exactly.
- One ID and one sequence per edition are permitted.
- Every manifest record must point to an existing content file.
- Every related KB identifier must exist in the same validated manifest.
- Manual-page references must be between 1 and 286.
- Chapter references must be between 1 and 44.
- Content paths must stay beneath `app/data/kb-content/`.
- Store SHA-256 checksums as `sha256:` followed by 64 lowercase hexadecimal characters.
- Preserve prior revisions in `revisionHistory`.
- Use `supersededBy` rather than deleting or overwriting superseded records.
- Partial imports must be internally complete and valid even before all 275 records arrive.

## Required provenance fields

Every Canon record requires:

- `source`: human-readable source or document reference;
- `provenance.origin`: where the content came from;
- `provenance.method`: how it was acquired and transformed;
- `provenance.verifiedBy`: accountable reviewer or authority;
- `provenance.verifiedAt`: ISO 8601 verification time;
- `checksum`: checksum of the approved canonical content;
- `createdAt` and `updatedAt`: record lifecycle timestamps.

Evidence classification and confidence must be recorded when applicable. Manufacturer manual references must not be represented as confirmed fitted-equipment evidence.

## Duplicate and conflict handling

- Duplicate IDs or edition sequences fail validation.
- Conflicting source versions remain separate revisions until a reviewer approves one.
- A newer revision does not erase the prior checksum or provenance.
- A deprecated record remains addressable and is marked `deprecated`.
- A replaced record is marked `superseded` and points to its approved successor.
- Conflicts between Canon content and an existing Companion chapter must be documented in review notes and resolved through an explicit mapping or additive correction.

## Content approval lifecycle

The allowed lifecycle is:

1. `draft` — imported or authored but not verified.
2. `verified` — source, checksum and provenance checked.
3. `approved` — accepted for production use by the designated content authority.
4. `deprecated` — retained for traceability but no longer recommended.
5. `superseded` — replaced by another identified record.

Only approved records should be surfaced as authoritative Canon guidance in the production application. Verification and approval must be explicit actions, not consequences of import.

## Preventing silent replacement of existing chapters

- Existing files under `app/chapters/` are preserved during Canon import.
- Canon content is stored separately under `app/data/kb-content/`.
- Relationships to existing chapters use `relatedChapterIds`.
- A proposed chapter replacement requires its own reviewed migration, before-and-after content comparison and compatibility test.
- Import tooling must fail when a target content file already exists with a different checksum unless an explicit revision operation is requested.

## Recommended Sprint 2 scope

Sprint 2 should inventory and stage the supplied canonical Engineering Canon source without changing application behavior:

1. Receive and checksum the authoritative KB-001–KB-250 and KB2-001–KB2-025 source files.
2. Produce a source inventory showing present, missing and duplicate identifiers.
3. Define the canonical content-file schema beneath `app/data/kb-content/`.
4. Import a small representative batch only after provenance review.
5. Validate relationships and generate a chapter-equivalence report.

Sprint 2 should not expose Canon content in the UI until completeness, provenance and approval rules are demonstrated.

## Local validation on Windows PowerShell

Run from the repository root:

```powershell
git status --short --branch
node --check app/assets/js/app-v4.js
node --test tests/*.test.js
```

To run each test file separately, matching the GitHub validation workflow:

```powershell
$testFiles = Get-ChildItem tests -Filter *.test.js | Sort-Object Name
foreach ($testFile in $testFiles) {
    Write-Host "Running $($testFile.FullName)"
    node --test $testFile.FullName
    if ($LASTEXITCODE -ne 0) { throw "Validation failed: $($testFile.Name)" }
}
```

To parse every data JSON file independently:

```powershell
Get-ChildItem app/data -Filter *.json | ForEach-Object {
    try {
        Get-Content $_.FullName -Raw | ConvertFrom-Json | Out-Null
        Write-Host "Valid JSON: $($_.Name)"
    } catch {
        throw "Invalid JSON: $($_.FullName)"
    }
}
```

Before committing, confirm protected production files and the Pages deployment workflow have not changed:

```powershell
git diff --exit-code main -- .github/workflows/deploy-pages.yml app/index.html app/404.html app/assets/js/app-v4.js app/assets/css/app-v4.css app/service-worker.js
git status --short --branch
```

## Sprint 2: Engineering Corpus architecture

Sprint 2 introduces the content contract and application surface without importing canonical handbook text. First Edition documents belong at `app/corpus/first-edition/KB-001.json` through `KB-250.json`; Second Edition documents belong at `app/corpus/second-edition/KB2-001.json` through `KB2-025.json`.

The manifest is the governed inventory: it records identity, revision, approval state, provenance, checksum and canonical content path. The generated index is a deterministic, derived search asset containing only presentation and search metadata. It must never be edited as the source of truth. Each content file must satisfy `app/data/kb_content.schema.json`; executable markup and unsafe paths are rejected.

`scripts/build-kb-index.js` validates manifest/content identity, edition paths, SHA-256 checksums, uniqueness and cross-references before replacing the index. Search uses the generated static index. The browser runtime fetches individual content only when opened; the service worker precaches the manifest, index and loader, then runtime-caches opened documents through the existing fetch strategy. It does not precache 275 future files.

### First real import prerequisites

Obtain authoritative source text and review authority before import. Convert only traceable source material, capture provenance and confidence, calculate the checksum from the final JSON bytes, add the manifest record, generate the index, run every test, and visually review the result. Conflicts create a reviewed revision; they never silently replace approved records or existing Companion chapters. Follow `docs/KB_IMPORT_GUIDE.md` for the controlled sequence.

No canonical Engineering Canon content was imported or fabricated in Sprint 2. The empty manifest is deliberate.

### Sprint 2 validation on Windows PowerShell

```powershell
node --check app/assets/js/app-v4.js
node --check app/assets/js/kb-corpus.js
node --check scripts/build-kb-index.js
node scripts/build-kb-index.js
node --test tests/*.test.js
git status --short --branch
```

## Sprint 3: Digital Twin foundation

Sprint 3 adds a read-only integration layer for the currently documented vehicle state. `app/data/digital_twin.schema.json` defines identity facts, systems, components, typed relationships, evidence, static references and optional operational collections. `app/data/digital_twin.json` contains only facts already represented by repository data; it deliberately identifies incomplete systems and the exact model as unknown.

Stable colon-delimited identifiers separate entity families such as `system:electrical`, `component:calira-evs`, `relationship:evs-vb06` and `evidence:vehicle-reference`. Facts retain scalar values and link to evidence by identifier, avoiding unnecessary scalar wrappers. Evidence records distinguish provenance classification from confidence. Inferred or estimated evidence cannot become confirmed merely through display or adapter mapping.

`digital-twin.js` validates and loads the static reference, provides lookup, filtering, traversal, search and statistics, and exposes a deliberate read-only API. `digital-twin-adapter.js` clones the reference Twin and maps existing schema-version-2 vehicle configuration into a runtime view. It never changes local storage, backup structure or source state and reports unmapped fields, missing targets and evidence/confidence distributions.

The `#digital-twin` route shows overview, identity, system coverage, components, relationships, evidence, data quality and existing-feature links. Global search identifies matching results as Digital Twin entries. The service worker precaches only the schema, reference document and two runtime scripts; user-generated records remain solely in the existing application state.

Known limitations: the Twin is deliberately partial and read-only, does not yet write user observations back to the model, does not claim precise water/gas/heating/refrigeration/safety equipment, and provides no telemetry, AI or external synchronization. Sprint 4 should add a controlled evidence-linking workflow for existing user records without changing storage schema or reference facts.

## Sprint 4: deterministic local reasoning

Sprint 4 builds a local evidence index from chapters, manual OCR, the empty-or-populated Canon index, Digital Twin, diagnostics, maintenance, component relationships and vehicle configuration definitions. The generated index is stable, checksum-protected and contains normalized source text rather than invented repair instructions.

`local-reasoning.js` normalizes queries, detects supported intents, extracts identifiers, systems, measurements and symptoms, retrieves evidence, applies explainable ranking weights and builds a fixed answer contract. Every answer includes confidence, safety class, unknowns, next checks, sources and a trace. Confidence cannot exceed selected evidence.

`reasoning-safety.js` performs deterministic emergency, gas, fire, electrical, vehicle-safety and water/electrical checks before presentation. `guided-diagnostics.js` asks one documented question at a time, records session history, reports ranked possibilities rather than diagnoses, and stops on safety or insufficient evidence.

Processing is entirely in-browser. No external request, model, API key or remote embedding service is used. Concise assistant history reuses the existing optional schema-version-2 `assistantHistory` collection and remains limited to 20 entries; no migration or backup change is required. The evidence index and engines are cached for offline use.

Known limitations include lexical rather than semantic retrieval, incomplete static Canon content, and no autonomous repair decisions. Sprint 5 should add controlled evaluation fixtures and evidence-linking improvements, not cloud AI or predictive maintenance.

## Sprint 6: owner records and vehicle history

Sprint 6 adds a local-only owner-record architecture for observations, faults, maintenance, repairs, modifications, inspections, measurements, workshop jobs, part replacements, services, document notes and photograph notes. The additive collections remain in saved-state schema 2 under the unchanged `knaus-ultimate-v1` key; schema-1 and schema-2 backup migration remains intact.

`owner-records.js` validates immutable read/write operations and stable IDs. `record-history.js` records append-only revisions for creation, updates, lifecycle changes, links, archive, restore, import and migration. `evidence-links.js` references evidence without copying files. Faults keep suspected and confirmed causes separate; maintenance recurrence uses only explicit saved intervals; measurements preserve entered units; modifications never rewrite repository Twin facts.

The `#records` editor, `#timeline` view and print/export/import tools make vehicle history usable offline. `digital-twin-owner-overlay.js` combines local history with a cloned reference Twin at runtime. The Assistant receives private records at runtime only, preserves confidence, distinguishes archived history and never mutates records automatically. Backup previews and Application Health include owner-record, evidence, reference, history and storage quality metrics.

Privacy is structural: there are no uploads, analytics, telemetry, API keys or external services, and no private owner data enters generated repository JSON. Known limitations are lexical search, a deliberately partial reference Twin, on-demand manual page caching and browser-storage capacity. Sprint 7 should focus on acceptance testing and careful UX refinements for record linking and lifecycle forms, without adding connectivity or automated diagnosis.

## Sprint 7: Evidence Library

Sprint 7 separates evidence metadata from binary storage. Metadata remains in schema-version-2 saved state; binary files remain local in IndexedDB database `knaus-companion-evidence` version 1. A central allowlist applies file-size, extension and magic-byte checks, while local SHA-256 checksums support duplicate detection. Evidence supports review, verification, supersede, archive, restore, append-only revisions and owner-record or Digital Twin links.

The assistant receives metadata-only runtime records and cannot interpret attachments. JSON backups preserve metadata but not IndexedDB binary bodies, so important files require separate export. No analytics, upload, OCR, image recognition or remote preview service exists. Known limitations include native-browser preview variability and the outstanding full cross-device manual matrix. Sprint 8 may add the deterministic Interactive Systems Explorer after acceptance validation.
