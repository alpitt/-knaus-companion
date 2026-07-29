# Ownership Intelligence developer guide

## Architecture

Schemas are JSON Schema draft 2020-12. Authoritative records remain in saved state under `knaus-ultimate-v1`, schema version 2. New collections are additive: ownership profiles, costs, provenance links and explicit health snapshots. The event index is an in-memory, rebuildable read model keyed by source type, ID and revision; it is not authoritative backup data.

Costs preserve source values, currencies and amount types. Allocations are explicit and bounded. TCO groups by currency. Provenance validates endpoints and labels owner-confirmed versus deterministic derived links. Quality checks report issues without mutation. Imported unknown fields must survive round trips.

## Validation and local commands

```powershell
node --check app/assets/js/app-v4.js
Get-ChildItem app/assets/js/ownership-*.js | ForEach-Object { node --check $_.FullName }
node scripts/validate-ownership.js
node scripts/validate-ownership-costs.js
node scripts/validate-ownership-provenance.js
node scripts/validate-ownership-quality.js
node scripts/validate-vehicle-health-history.js
node --test tests/*.test.js
python -m http.server 8765 --directory app
```

## Prohibited practices

Never fabricate ownership history, cost, date, odometer, component identity, measurement or provenance link. Never infer causation from correlation or present recurring faults as a diagnosis. Never rate Workshops or create reliability scores. Never combine currencies, treat estimates as actuals, invent resale value or depreciation, or present TCO as audited accounts. Never call a health snapshot roadworthiness. Never auto-create source costs, merge duplicates, repair links, overwrite the Digital Twin/System Graph, upload owner data, erase revisions or silently overwrite imports.

## Performance and security

Cache only static code and schemas, not private state or generated reports. Derived indexes are invalidated and rebuilt deterministically. Escape user text, validate imports, reject unsafe keys, paginate long timelines, avoid binary evidence loads and release object URLs.
