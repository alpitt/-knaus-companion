# Local Reasoning guide

## Purpose and architecture

Companion’s assistant is a deterministic local retrieval-and-ranking system, not a generic chatbot. `reasoning.json` defines intents, confidence, ranking and safety policy; `reasoning_index.json` is generated from repository evidence; the reasoning, safety and guided-diagnostic browser modules produce traceable answers without network calls.

Supported intents cover component identification, fuses, symptoms, systems, maintenance, measurements, documents, manual pages, chapters, Canon entries, Digital Twin entities, evidence, comparison and safety checks. Source priority is calculated rather than absolute: exact identifiers and titles lead, followed by vehicle-specific/confirmed evidence, Digital Twin relevance, manufacturer material, system/component matches and lexical terms.

Confidence is bounded by selected evidence. Keyword matches are relevance signals, never confirmed diagnoses. Gas, fire, carbon monoxide, exposed mains, protective-device bypass, brake/steering, fuel/oil, structure and water/electrical hazards activate warnings or escalation before detailed guidance.

Answers contain a concise evidence summary, confidence, safety classification, visible unknowns, next checks, follow-up question, sources and a collapsed score trace. Guided flows ask one question at a time and never create faults automatically.

## Controlled extension

Add an intent by adding weighted phrases to `reasoning.json` and tests. Add a source type only after updating the schema, builder, validator, routes and ranking tests. Add diagnostic flows in `guided-diagnostics.js` with a reason for every question, valid routes, safety-stop coverage and no unsupported causes.

Rebuild and validate on Windows PowerShell:

```powershell
node scripts/build-reasoning-index.js
node scripts/validate-reasoning.js
node --check app/assets/js/local-reasoning.js
node --check app/assets/js/reasoning-safety.js
node --check app/assets/js/guided-diagnostics.js
node --test tests/*.test.js
python -m http.server 8765 --directory app
```

## Prohibited practices

- Never add unsupported repair facts.
- Never hide uncertainty or raise confidence without evidence.
- Never bypass safety escalation.
- Never add external calls without explicit approval.
- Never expose private user data.
- Never treat keyword matches as confirmed diagnoses.
- Never fabricate citations.
- Never recommend unsafe live testing.
- Never recommend bypassing a fuse, interlock or protective device.
