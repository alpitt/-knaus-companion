# System graph guide

The repository graph is a read-only, deterministic projection of documented Digital Twin systems, components and relationships. Nodes carry type, confidence, provenance and optional evidence/manual/chapter/Canon references. Edges are typed and directional. A component `systemId` may produce a `member-of` edge; no missing cable, pipe, fuse or dependency is inferred.

To add a system or component, first document and validate it in the Digital Twin, then add the matching graph node and only relationships supported by an explicit source. Run `node scripts/validate-system-graph.js` and the full test suite. Unknown relationships remain absent or explicitly `unknown`; never fill visual gaps for appearance.
