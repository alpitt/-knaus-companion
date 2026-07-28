# Maintenance Intelligence developer guide

Maintenance plans live in the additive `maintenancePlans` collection inside saved-state schema 2 under `knaus-ultimate-v1`. Campaigns, parts and consumables use separate additive collections. Existing static tasks, service logs and Owner Records remain unchanged.

Stable prefixes are `MP-`, `MC-`, `MPT-`, `MCO-` and `MW-`. Runtime modules expose immutable reads where practical, validate before persistence, retain append-only revisions and require explicit archive/delete/completion actions. Due state is derived separately from workflow status.

Date arithmetic uses UTC calendar dates and end-of-month clamping. Distance and usage calculations require explicit current values and preserve original units. Compound intervals expose their logic. Forecasts expose assumptions, missing inputs and confidence and must retain `forecast-not-failure-prediction`.

Dependencies are explicit; graph relationships never create them automatically. Campaign templates are generic. Completion records preserve incomplete work. Part replacement preserves both records. Warranty calculations use entered dates only. Vehicle-health weights are visible JSON configuration and blockers remain visible beside the score.

Run from PowerShell:

```powershell
Get-ChildItem app/assets/js/maintenance-*.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem scripts/validate-maintenance*.js | ForEach-Object { node $_.FullName }
node scripts/validate-vehicle-health.js
node --test tests/*.test.js
```

Never fabricate intervals, component life, history, completion dates, odometers, measurements, part/serial numbers or warranty terms. Never use machine learning, treat forecast as failure prediction, hide blockers behind a score, complete source records automatically, overwrite reference Twin/Graph data, upload owner data or silently replace imported records.
