# Diagnostic developer guide

Sprint 15 uses draft-2020-12 schemas, stable `DG-` and `DS-` identifiers, the existing local state adapter, schema version 2, and `knaus-ultimate-v1`. Definitions, versions, sessions, node results, branches, observations, measurements, escalations, unresolved questions, causes, resolutions, deviations, and checkpoints are separate records. Approved versions are immutable and sessions pin snapshots. Branch evaluation is deterministic: ambiguity, unknown input, incompatible units, or missing criteria stops rather than guesses. Cycle, reachability, safety, import, and prototype-pollution checks are local. Technical Library and overlays are rebuildable read models; source records remain authoritative. Fixtures contain no private data.

Run locally in Windows PowerShell:

```powershell
node --check app/assets/js/app-v4.js
Get-ChildItem app/assets/js/diagnostic-*.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem scripts/validate-*.js | ForEach-Object { node $_.FullName }
node --test tests/*.test.js
```

Prohibited: generated diagnostics, branches, causes, repairs, criteria, values, units, tolerances, hazards, emergency instructions, manufacturer claims, probability scores, silent conversions, hidden writes, external calls, evidence interpretation, or silent import overwrite. Keep large lists batched, cache only derived in-memory indexes, avoid evidence binary loading, retain deterministic ordering, and validate large graphs in linear passes where practical.
