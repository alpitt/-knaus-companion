# Workshop Jobs Guide

Workshop Jobs preserve a defined scope, starting condition, work history, evidence and outcome. They are local records, not professional certificates.

Create a draft directly or explicitly from a fault, maintenance item, Change Plan or inspection. Define scope and exclusions, affected systems/components, safety controls, hold points, parts, tools, steps, measurements and acceptance criteria. Capture the baseline before work. Missing facts remain unknown.

Use execution mode for one controlled job at a time. Starting, pausing, blocking and completing a step are explicit actions. A failed blocking step or hold point stops progression. Evidence, measurements, defects, deviations and additional work remain separate from the original scope. Additional work requires explicit acceptance.

Commissioning evaluates only recorded criteria and sourced/user-defined ranges. Owner acceptance is explicit and never replaces technical verification. Completion does not resolve faults, complete maintenance or update the Digital Twin automatically. Those actions require separate previews and confirmation.

Print job registers and packs without treating them as certificates. JSON backups include workshop metadata under schema version 2; evidence files remain in IndexedDB. Workshop identities and contact details are never collected automatically, and nothing is uploaded.

If a job is blocked, review safety controls, hold points, missing evidence, measurements and professional-review requirements. Invalid imports are rejected before current data changes.
