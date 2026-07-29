# Procedure Developer Guide

## Architecture

JSON Schema 2020-12 contracts define procedures, stable steps, requirements, templates, executions, deviations, lessons, proposals, library items and relationships. Runtime modules are dependency-free IIFEs, use an injected saved-state adapter and preserve unknown fields. The storage key and schema remain unchanged.

Lifecycle transitions require explicit actions and reasons. Approved versions are immutable. Step graphs use deterministic sequences, explicit branch targets, bounded intentional loops and reachable hold/emergency/rollback nodes. Execution state pins the exact version; checkpoint, deviation and revision histories are append-only.

Technical Library indexes and owner overlays are derived/read-only. Import must reject scripts, unsafe HTML, prototype-pollution keys, duplicate IDs, broken branches and invalid cycles; preview conflicts before confirmation.

## Testing

From Windows PowerShell:

```powershell
node --check app/assets/js/app-v4.js
Get-ChildItem app/assets/js/procedure-*.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem scripts/validate-*.js | ForEach-Object { node --check $_.FullName }
node scripts/validate-procedures.js
node scripts/validate-procedure-library.js
node scripts/validate-procedure-executions.js
node scripts/validate-technical-library.js
node scripts/validate-knowledge-relationships.js
node --test tests/*.test.js
```

Never fabricate technical content, approve/verify automatically, mutate Digital Twin/System Graph reference data, upload owner data, interpret evidence binaries or erase revision history.
