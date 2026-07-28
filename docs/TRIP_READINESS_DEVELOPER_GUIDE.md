# Trip readiness developer guide

The Sprint 11 runtime is dependency-free and exposed through `window.KnausTrips` plus focused lifecycle, baseline, readiness, checklist, planning, incident and overlay modules. Managed trip IDs use `TR-`; older touring records remain in the same `trips` array and are preserved untouched.

The storage schema stays at version 2. No migration is required because trip fields are an additive, tolerant extension. Read operations return clones, writes validate records, transitions require a reason, archive/delete are explicit, and revision history is append-only.

Run locally from PowerShell:

```powershell
node --check app/assets/js/app-v4.js
Get-ChildItem app/assets/js/trip*.js | ForEach-Object { node --check $_.FullName }
node scripts/validate-trips.js
node scripts/validate-trip-templates.js
node --test tests/*.test.js
```

Do not add inferred vehicle limits or external network calls. Reference Digital Twin and System Graph data must remain read-only; overlays derive state at runtime.
