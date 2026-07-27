# Owner records developer guide

## Contract and persistence

`app/data/owner_records.schema.json` is a JSON Schema draft 2020-12 contract. `owner-records.js` stores additive `ownerRecords` and `evidenceLinks` arrays inside existing schema-version-2 state under `knaus-ultimate-v1`; no schema increment is needed. Reads are cloned, writes validate first, IDs are stable `OR-*` identifiers, unknown state fields are preserved and generated indexes never contain private records.

`record-history.js` creates append-only deterministic revisions. `evidence-links.js` links records to typed evidence without copying target files. `digital-twin-owner-overlay.js` produces an owner-state view while keeping reference Twin data read-only. Local reasoning receives owner records at runtime only. Measurements retain original units. Maintenance next-due values use saved completion values and explicit intervals only.

## Validation and fixtures

Non-production fixtures are under `tests/fixtures/owner-records/`. Run on Windows PowerShell:

```powershell
node --check app/assets/js/owner-records.js
node --check app/assets/js/record-history.js
node --check app/assets/js/evidence-links.js
node --check app/assets/js/digital-twin-owner-overlay.js
node --check scripts/validate-owner-records.js
node scripts/validate-owner-records.js
node --test tests/*.test.js
```

Imports must preview and validate every record and history block, report conflicts, and use skip, explicit replace or copy. A failing batch restores prior state. Backups remain schema 2; schema-1 and schema-2 backups remain supported.

## Prohibited practices

- Never overwrite owner data silently.
- Never convert an observation into a confirmed fact automatically.
- Never erase revision history.
- Never mutate reference Digital Twin data.
- Never store owner data in generated repository JSON.
- Never upload owner data.
- Never reuse stable record IDs.
- Never bypass validation.
- Never auto-resolve faults.
- Never fabricate dates, costs, parts or measurements.
