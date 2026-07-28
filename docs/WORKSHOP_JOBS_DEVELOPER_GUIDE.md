# Workshop Jobs Developer Guide

## Architecture

`workshop_job.schema.json`, `inspection.schema.json` and `inspection_templates.schema.json` define local contracts. `workshop-jobs.js` and `inspections.js` persist additive `workshopJobs` and `inspections` arrays through the existing state adapter. Schema version remains 2 and the key remains `knaus-ultimate-v1`.

Lifecycle, readiness, checklists, defects, commissioning and owner overlays are deterministic modules. Transitions require reasons; completion and closure are never automatic. Baselines reuse the generic relevant-entity snapshot. Runtime overlays clone reference data and cannot overwrite the Digital Twin or System Graph.

Checklist waivers require reasons. Sourced steps retain references; owner-entered steps are labelled accordingly. Hold points cannot auto-release. Defects become faults only through explicit conversion. Acceptance ranges require a source or user-defined designation. A value without a range is recorded, not passed.

Imports must validate the entire payload, reject unsafe content and duplicate identifiers, preserve revisions and preview conflicts before replacement. Evidence is linked by identifier rather than duplicated. Derived histories are calculated in memory and list rendering is capped to controlled batches.

## Validation

```powershell
node --check app/assets/js/workshop-jobs.js
node --check app/assets/js/inspections.js
node scripts/validate-workshop-jobs.js
node scripts/validate-inspections.js
node --test tests/*.test.js
```

Never claim owner-entered work is professionally certified; use “safe” only with defined cited criteria; fabricate no procedures, ranges, measurements or part numbers; hide no defects; auto-release no hold point; auto-complete no job, fault or maintenance item; never convert planned work automatically; never overwrite reference datasets, upload workshop data, erase revisions or silently replace imports. Owner acceptance is not professional approval.
