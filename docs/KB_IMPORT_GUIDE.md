# Engineering Canon import guide

Use this procedure for every controlled Engineering Canon batch.

1. Obtain the canonical source and permission to use it.
2. Assign or confirm the permanent `KB-###` or `KB2-###` identifier.
3. Convert the source into structured JSON conforming to `app/data/kb_content.schema.json` without inventing missing text.
4. Record complete provenance, evidence classification, confidence and review state.
5. Calculate the SHA-256 checksum of the final content file bytes and store it as `sha256:<64 lowercase hexadecimal characters>`.
6. Add the matching record to `app/data/kb_manifest.json` with the canonical edition path.
7. Run `node scripts/build-kb-index.js` and review the generated index diff.
8. Run syntax checks and `node --test tests/*.test.js`.
9. Serve `app/` locally and review the rendered document, links, search, mobile layout and offline reload.
10. Commit the reviewed records as a small, controlled batch with its manifest and generated-index changes.

## Conflict rules

- Never overwrite an existing approved record silently.
- Never reuse an identifier.
- Never change provenance without revision history.
- Never mark content approved without review.
- Never fabricate missing source text.
- Never infer that existing chapters are equivalent to KB records without an explicit traceability decision.

A source conflict must remain visible to reviewers. Create an explicit revision or superseding relationship, retain provenance for both positions, and obtain approval before changing the active record.
