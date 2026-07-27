# Digital Twin guide

## Purpose

The Digital Twin is a read-only integration and relationship layer for the motorhome’s currently documented state. It does not replace vehicle configuration, maintenance, faults, measurements, photographs, documents, chapters, the manufacturer manual or Engineering Canon.

## Data model and identifiers

The reference document is `app/data/digital_twin.json` and its contract is `app/data/digital_twin.schema.json`. Stable identifiers are lowercase colon-delimited values: `fact:*`, `system:*`, `component:*`, `relationship:*`, `evidence:*`, `document:*` and `photograph:*`. Never change an ID merely for presentation.

Facts keep a straightforward value and an `evidenceRefs` array. Components point to a system. Relationships connect existing entity IDs using an approved relationship type. Static document and photograph paths are relative to `app/`.

## Evidence and confidence

Every factual claim must cite existing evidence. Evidence classification describes the source kind; confidence describes how strongly it supports the claim. Manufacturer information or an official manual does not prove that equipment is fitted. Inferred and estimated values remain visibly uncertain. Unknown is valid and preferable to invention.

## Controlled changes

To add a system, assign a stable `system:*` ID, an honest status and confidence, evidence references and an existing route where appropriate. To add a component, confirm repository or owner evidence, assign it to an existing system and link evidence. To add a relationship, use existing endpoints, an approved type, direction, status, evidence and notes. Equivalent duplicates and unsupported self-references are rejected.

Evidence must be added before referencing it. Record source, classification, confidence, linked entities and provenance. Add a date only when it is supported.

## Validation on Windows PowerShell

```powershell
node --check app/assets/js/digital-twin.js
node --check app/assets/js/digital-twin-adapter.js
node --check scripts/validate-digital-twin.js
node scripts/validate-digital-twin.js
node --test tests/*.test.js
python -m http.server 8765 --directory app
```

Review `#digital-twin` at desktop and mobile sizes and verify offline reload before committing.

## Prohibited practices

- Never invent a vehicle fact.
- Never mark an inference as confirmed.
- Never remove provenance.
- Never reuse stable IDs.
- Never silently delete relationships.
- Never edit saved user data during reference-data loading.
- Never treat the Twin as complete while unknown values remain.
- Never copy user records into the static reference file.
- Never add remote services, telemetry or executable content to reference data.
