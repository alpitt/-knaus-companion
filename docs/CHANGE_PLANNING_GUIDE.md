# Change Planning Guide

The Change Planner records proposed work without changing the reference Digital Twin or System Graph. It is a planning aid, not engineering approval or certification.

## Planning a change

Open **Change Planner**, create a draft, describe one bounded change, and select only affected system and component identifiers. Capture the baseline before assessing impact. Missing identifiers remain visible as unknowns. Run impact analysis to review direct and connected entities, existing faults, evidence gaps, measurement gaps and deterministic safety triggers.

Define evidence and measurements before work, then list parts, installation steps, verification steps and a practical rollback plan. Acknowledging an unknown records awareness; it does not confirm the fact. Plans involving mains electricity, LPG, structure, high-current loads or other safety triggers must retain the professional-review requirement.

## Completion and verification

Checklist completion does not imply safety approval. Record actual parts, values and results, then compare the plan with the outcome. Only explicitly completed, verified or partially completed plans can be converted to an Owner Record, and conversion requires a separate user action. The original plan remains available.

## Evidence, reports and backup

Link Evidence Library identifiers and Owner Record measurements rather than duplicating files. Print the plan register or an individual plan for review. JSON backups include plan metadata automatically under the existing schema-version-2 state. Files and plans stay local; no upload, analytics or external AI is used.

## Troubleshooting

- **Blocked:** inspect the safety impact and obtain the stated evidence or qualified review.
- **Needs evidence/measurements:** define what will prove the baseline and result.
- **Incomplete baseline:** correct missing system/component references or explicitly record the unknown.
- **Restore rejected:** the imported plan structure or references are invalid; current data remains unchanged.
