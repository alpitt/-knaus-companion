const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "app", "data", "kb_manifest.json");
const SCHEMA_PATH = path.join(ROOT, "app", "data", "kb_manifest.schema.json");
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));

const REQUIRED_RECORD_FIELDS = [
  "id",
  "edition",
  "sequence",
  "title",
  "revision",
  "status",
  "source",
  "provenance",
  "checksum",
  "contentPath",
  "createdAt",
  "updatedAt",
];
const ID_PATTERN = /^(KB-(00[1-9]|0[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|250)|KB2-(00[1-9]|01[0-9]|02[0-5]))$/;
const CHECKSUM_PATTERN = /^sha256:[a-f0-9]{64}$/;
const STATUSES = new Set(["draft", "verified", "approved", "deprecated", "superseded"]);

function validateRecords(records, { checkContentFiles = true } = {}) {
  const errors = [];
  const ids = records.map((record) => record.id);
  const idSet = new Set(ids);
  if (idSet.size !== ids.length) errors.push("duplicate KB identifiers");

  for (const record of records) {
    for (const field of REQUIRED_RECORD_FIELDS) {
      if (record[field] === undefined || record[field] === null || record[field] === "") {
        errors.push(`${record.id || "record"}: missing required field ${field}`);
      }
    }
    if (!ID_PATTERN.test(record.id || "")) errors.push(`${record.id || "record"}: invalid ID format`);
    if (!Number.isInteger(record.sequence)) errors.push(`${record.id || "record"}: missing or invalid sequence number`);
    if (!['first', 'second'].includes(record.edition)) errors.push(`${record.id || "record"}: invalid edition`);
    if (record.edition === "first" && (!Number.isInteger(record.sequence) || record.sequence < 1 || record.sequence > 250)) {
      errors.push(`${record.id || "record"}: First Edition sequence out of range`);
    }
    if (record.edition === "second" && (!Number.isInteger(record.sequence) || record.sequence < 1 || record.sequence > 25)) {
      errors.push(`${record.id || "record"}: Second Edition sequence out of range`);
    }
    if (record.edition === "first" && record.id && !record.id.startsWith("KB-")) errors.push(`${record.id}: edition does not match ID`);
    if (record.edition === "second" && record.id && !record.id.startsWith("KB2-")) errors.push(`${record.id}: edition does not match ID`);
    if (!STATUSES.has(record.status)) errors.push(`${record.id || "record"}: invalid status`);
    if (!CHECKSUM_PATTERN.test(record.checksum || "")) errors.push(`${record.id || "record"}: invalid checksum format`);

    for (const relatedId of record.relatedKbIds || []) {
      if (!ID_PATTERN.test(relatedId) || !idSet.has(relatedId) || relatedId === record.id) {
        errors.push(`${record.id}: invalid related KB reference ${relatedId}`);
      }
    }
    if (record.supersededBy !== undefined && record.supersededBy !== null) {
      if (!ID_PATTERN.test(record.supersededBy) || !idSet.has(record.supersededBy) || record.supersededBy === record.id) {
        errors.push(`${record.id}: invalid superseded-by reference ${record.supersededBy}`);
      }
    }
    for (const chapter of record.relatedChapterIds || []) {
      if (!Number.isInteger(chapter) || chapter < 1 || chapter > 44) errors.push(`${record.id}: invalid chapter reference ${chapter}`);
    }
    for (const page of record.relatedManualPages || []) {
      if (!Number.isInteger(page) || page < 1 || page > 286) errors.push(`${record.id}: invalid manual page reference ${page}`);
    }
    if (checkContentFiles && record.contentPath) {
      const resolved = path.resolve(ROOT, record.contentPath);
      const contentRoot = path.resolve(ROOT, "app", "data", "kb-content");
      if (!resolved.startsWith(`${contentRoot}${path.sep}`) || !fs.existsSync(resolved)) {
        errors.push(`${record.id}: missing or invalid content file ${record.contentPath}`);
      }
    }
  }

  for (const edition of ["first", "second"]) {
    const sequences = records.filter((record) => record.edition === edition).map((record) => record.sequence);
    if (new Set(sequences).size !== sequences.length) errors.push(`duplicate sequence numbers in ${edition} edition`);
  }
  return errors;
}

function validRecord(overrides = {}) {
  return {
    id: "KB-001",
    edition: "first",
    sequence: 1,
    title: "Validated record",
    revision: "1.0",
    status: "approved",
    source: "Canonical source",
    provenance: {
      origin: "Owner-supplied Canon",
      method: "Controlled import",
      verifiedBy: "Content reviewer",
      verifiedAt: "2026-07-27T00:00:00Z",
    },
    checksum: `sha256:${"a".repeat(64)}`,
    contentPath: "app/data/kb-content/KB-001.json",
    createdAt: "2026-07-27T00:00:00Z",
    updatedAt: "2026-07-27T00:00:00Z",
    ...overrides,
  };
}

test("Engineering Canon schema is a draft 2020-12 manifest contract", () => {
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.ok(schema.$defs?.record, "Schema must define an Engineering Canon record");
  assert.deepEqual(schema.$defs.record.required, REQUIRED_RECORD_FIELDS);
  assert.deepEqual(schema.$defs.record.properties.status.enum, [...STATUSES]);
  for (const property of [
    "revisionHistory",
    "relatedKbIds",
    "relatedChapterIds",
    "relatedManualPages",
    "tags",
    "evidenceClassification",
    "confidenceLevel",
    "supersededBy",
  ]) {
    assert.ok(schema.$defs.record.properties[property], `Schema is missing optional governance field ${property}`);
  }
});

test("initial manifest declares the complete expected Canon and no fabricated records", () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.match(manifest.generatedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/);
  assert.equal(manifest.expectedFirstEditionCount, 250);
  assert.equal(manifest.expectedSecondEditionCount, 25);
  assert.ok(Array.isArray(manifest.records), "Manifest records must be an array");
  assert.equal(manifest.records.length, 0, "Sprint 1 must not contain placeholder KB records");
  console.info("Engineering Canon source content has not yet been imported. Expected 275 records; found 0.");
});

test("all current and future manifest records satisfy the local contract", () => {
  assert.deepEqual(validateRecords(manifest.records), []);
});

test("validator detects duplicate IDs and duplicate edition sequences", () => {
  const records = [validRecord(), validRecord({ title: "Duplicate" })];
  const errors = validateRecords(records, { checkContentFiles: false });
  assert.ok(errors.includes("duplicate KB identifiers"));
  assert.ok(errors.includes("duplicate sequence numbers in first edition"));
});

test("validator detects invalid IDs, missing sequences and checksum errors", () => {
  const errors = validateRecords([validRecord({ id: "KB-999", sequence: undefined, checksum: "bad" })], { checkContentFiles: false });
  assert.ok(errors.some((error) => error.includes("invalid ID format")));
  assert.ok(errors.some((error) => error.includes("missing or invalid sequence number")));
  assert.ok(errors.some((error) => error.includes("invalid checksum format")));
});

test("validator detects missing content files and unsafe content paths", () => {
  const errors = validateRecords([validRecord()]);
  assert.ok(errors.some((error) => error.includes("missing or invalid content file")));
  const unsafe = validateRecords([validRecord({ contentPath: "../outside.json" })]);
  assert.ok(unsafe.some((error) => error.includes("missing or invalid content file")));
});

test("validator detects invalid KB, chapter and manual-page relationships", () => {
  const errors = validateRecords([
    validRecord({ relatedKbIds: ["KB-002"], relatedChapterIds: [45], relatedManualPages: [287], supersededBy: "KB2-001" }),
  ], { checkContentFiles: false });
  assert.ok(errors.some((error) => error.includes("invalid related KB reference KB-002")));
  assert.ok(errors.some((error) => error.includes("invalid superseded-by reference KB2-001")));
  assert.ok(errors.some((error) => error.includes("invalid chapter reference 45")));
  assert.ok(errors.some((error) => error.includes("invalid manual page reference 287")));
});
