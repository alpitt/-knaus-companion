# Change Planning Developer Guide

## Architecture and lifecycle

`change_plan.schema.json` defines the contract. `change-plans.js` provides local CRUD and lifecycle operations through the existing state adapter. IDs use `CP-` plus stable uppercase alphanumeric content. Status never advances automatically. Baseline, impact, readiness, calculations and graph overlay are separate deterministic modules with immutable outputs where practical.

Baseline snapshots include only referenced graph/twin entities and linked local evidence. Graph traversal reports direct and documented neighbours; missing relationships are unknown, never “no impact”. Impact severity controls ordering, while confidence remains bounded by source confidence. The readiness engine reports incomplete, needs-information/evidence/measurements, blocked, professional-review, ready-for-review, reviewed or approved-to-proceed states without claiming safety.

Calculations retain inputs, formula, units, rounding and limitations. They do not select cable sizes, fuse ratings or certify payload/axle compliance. Proposed graph overlays are runtime-only and leave `system_graph.json` and the Digital Twin untouched.

Checklists use explicit pending, complete, failed, waived or not-applicable states. Verification and plan-versus-actual comparison retain planned values. Owner Record conversion is explicit, limited to completed lifecycle states and protected from duplicate conversion.

## Persistence, import and privacy

Plans are an additive `changePlans` array in `knaus-ultimate-v1`; schema version remains 2, so no migration is required and old backups default to an empty array. Validate the entire imported array before state replacement. Reject unsafe HTML/script content and prototype-pollution keys. Plan records, evidence and measurements must never leave the device automatically.

## Local validation

```powershell
node --check app/assets/js/change-plans.js
node --check app/assets/js/change-impact.js
node --check scripts/validate-change-plans.js
node scripts/validate-change-plans.js
node --test tests/*.test.js
```

Fixtures under `tests/fixtures/change-plans/` cover valid drafts, lifecycle states, malformed references, relationship conflicts, checklist errors, unsafe text and plan-versus-actual records.

## Prohibited practices

- Never claim a plan is safe or certified.
- Never fabricate cable sizes, fuse ratings, measurements, weights, costs, parts or regulatory requirements.
- Never overwrite the reference Digital Twin or reference System Graph.
- Never convert proposed state into current state automatically.
- Never hide blockers, erase acknowledged risks, or treat missing data as no risk.
- Never upload plan data or silently overwrite plans.
- Never convert incomplete work into a completed Owner Record.
- Never bypass professional-review requirements.

