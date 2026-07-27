"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "app", "data", "kb_manifest.json");
const INDEX_PATH = path.join(ROOT, "app", "data", "kb_index.json");
const ID_PATTERN = /^(KB-(00[1-9]|0[1-9]\d|1\d{2}|2[0-4]\d|250)|KB2-(00[1-9]|01\d|02[0-5]))$/;
const CHECKSUM_PATTERN = /^sha256:[a-f0-9]{64}$/;

function editionFor(id) { return id.startsWith("KB2-") ? "second-edition" : "first-edition"; }
function expectedContentPath(record) { return `app/corpus/${editionFor(record.id)}/${record.id}.json`; }
function sha256(buffer) { return `sha256:${crypto.createHash("sha256").update(buffer).digest("hex")}`; }
function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values)]; }
function fail(errors, message) { errors.push(message); }

function validateDocument(document, record, ids) {
  const errors = [];
  for (const key of ["id", "edition", "sequence", "title", "revision", "status", "summary", "purpose", "difficulty", "appliesTo", "sections", "relatedKB", "relatedChapters", "relatedManualPages", "tags", "evidence", "provenance", "createdAt", "updatedAt"]) {
    if (document[key] === undefined) fail(errors, `${record.id}: content is missing ${key}`);
  }
  if (document.id !== record.id || document.edition !== record.edition || document.sequence !== record.sequence) fail(errors, `${record.id}: manifest/content identity mismatch`);
  if (!Array.isArray(document.sections) || !document.sections.length) fail(errors, `${record.id}: at least one section is required`);
  asArray(document.relatedManualPages).forEach(page => { if (!Number.isInteger(page) || page < 1 || page > 286) fail(errors, `${record.id}: invalid manual page ${page}`); });
  asArray(document.relatedChapters).forEach(chapter => { if (!Number.isInteger(chapter) || chapter < 1 || chapter > 44) fail(errors, `${record.id}: invalid chapter ${chapter}`); });
  asArray(document.relatedKB).forEach(ref => {
    const relatedId = typeof ref === "string" ? ref : ref?.id;
    const allowedMissing = Boolean(ref && typeof ref === "object" && (ref.external || ref.pending));
    if (!ID_PATTERN.test(relatedId || "")) fail(errors, `${record.id}: invalid related KB reference ${relatedId || "(missing)"}`);
    else if (!allowedMissing && !ids.has(relatedId)) fail(errors, `${record.id}: missing related KB record ${relatedId}`);
  });
  const unsafe = /<(script|iframe|object|embed)\b|\bon\w+\s*=|javascript\s*:/i;
  asArray(document.sections).forEach((section, index) => {
    if (!section || typeof section !== "object" || !section.id || !section.heading || !Array.isArray(section.content)) fail(errors, `${record.id}: invalid section ${index + 1}`);
    asArray(section?.content).forEach(block => { const value=block?.value??block?.content;if (typeof value === "string" && unsafe.test(value)) fail(errors, `${record.id}: unsafe content in section ${section.id || index + 1}`); });
  });
  return errors;
}

function validateManifest(manifest, readFile = fs.readFileSync) {
  const errors = [];
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return ["Manifest must be an object"];
  if (manifest.schemaVersion !== 1) fail(errors, "Manifest schemaVersion must be 1");
  if (manifest.expectedFirstEditionCount !== 250 || manifest.expectedSecondEditionCount !== 25) fail(errors, "Manifest expected counts must be 250 and 25");
  if (!Array.isArray(manifest.records)) return [...errors, "Manifest records must be an array"];
  const ids = new Set(manifest.records.map(record => record?.id).filter(Boolean));
  if (ids.size !== manifest.records.length) fail(errors, "Manifest contains duplicate IDs");
  const editionSequences = new Set();
  for (const record of manifest.records) {
    if (!record || !ID_PATTERN.test(record.id || "")) { fail(errors, `Invalid KB ID: ${record?.id || "(missing)"}`); continue; }
    const expectedEdition = editionFor(record.id);
    if (record.edition !== expectedEdition) fail(errors, `${record.id}: edition must be ${expectedEdition}`);
    const expectedSequence = Number(record.id.split("-")[1]);
    if (record.sequence !== expectedSequence) fail(errors, `${record.id}: sequence must be ${expectedSequence}`);
    const sequenceKey = `${record.edition}:${record.sequence}`;
    if (editionSequences.has(sequenceKey)) fail(errors, `${record.id}: duplicate sequence ${record.sequence} in ${record.edition}`);
    editionSequences.add(sequenceKey);
    if (!CHECKSUM_PATTERN.test(record.checksum || "")) fail(errors, `${record.id}: invalid checksum`);
    const canonicalPath = expectedContentPath(record);
    if (record.contentPath !== canonicalPath) fail(errors, `${record.id}: contentPath must be ${canonicalPath}`);
    asArray(record.relatedManualPages).forEach(page => { if (!Number.isInteger(page) || page < 1 || page > 286) fail(errors, `${record.id}: invalid manual page ${page}`); });
    asArray(record.relatedChapterIds).forEach(chapter => { const number = Number(String(chapter).replace(/^0*/, "")); if (!Number.isInteger(number) || number < 1 || number > 44) fail(errors, `${record.id}: invalid chapter ${chapter}`); });
    asArray(record.relatedKbIds).forEach(id => { if (!ID_PATTERN.test(id) || !ids.has(id)) fail(errors, `${record.id}: invalid or missing related KB ${id}`); });
    const absolutePath = path.join(ROOT, ...canonicalPath.split("/"));
    let raw;
    try { raw = readFile(absolutePath); } catch { fail(errors, `${record.id}: missing content file ${canonicalPath}`); continue; }
    if (sha256(raw) !== record.checksum) fail(errors, `${record.id}: checksum does not match ${canonicalPath}`);
    try { errors.push(...validateDocument(JSON.parse(raw.toString("utf8")), record, ids)); }
    catch { fail(errors, `${record.id}: content file is not valid JSON`); }
  }
  return errors;
}

function buildIndex(manifest, readFile = fs.readFileSync) {
  const records = manifest.records.map(record => {
    const raw = readFile(path.join(ROOT, ...record.contentPath.split("/")));
    const document = JSON.parse(raw.toString("utf8"));
    const sectionHeadings = document.sections.map(section => section.heading);
    const sectionText = document.sections.flatMap(section => [section.heading, ...section.content.map(block => block.value || block.content || ""), ...section.warnings, ...section.notes]);
    const text = [record.id, document.title, document.summary, document.purpose, ...document.tags, ...sectionText].join(" ");
    return { id: record.id, edition: record.edition, sequence: record.sequence, title: document.title, revision: record.revision, status: record.status, summary: document.summary, purpose: document.purpose, tags: unique(document.tags), sectionHeadings, searchText: text.toLowerCase(), relatedChapterCount: document.relatedChapters.length, relatedManualPageCount: document.relatedManualPages.length, contentPath: record.contentPath, evidenceClassification: record.evidenceClassification, confidenceLevel: record.confidenceLevel, updatedAt: record.updatedAt };
  }).sort((a, b) => a.edition.localeCompare(b.edition) || a.sequence - b.sequence || a.id.localeCompare(b.id));
  return { schemaVersion: 1, generatedAt: manifest.generatedAt, expectedRecordCount: 275, availableRecordCount: records.length, firstEditionCount: records.filter(r => r.edition === "first-edition").length, secondEditionCount: records.filter(r => r.edition === "second-edition").length, records };
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const errors = validateManifest(manifest);
  if (errors.length) throw new Error(`Engineering Canon validation failed:\n- ${errors.join("\n- ")}`);
  const index = buildIndex(manifest);
  fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  if (!manifest.records.length) console.info("Engineering Canon source content has not yet been imported. Expected 275 records; found 0.");
  else console.info(`Engineering Canon index generated: ${index.availableRecordCount} records.`);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { ID_PATTERN, CHECKSUM_PATTERN, editionFor, expectedContentPath, sha256, validateDocument, validateManifest, buildIndex, main };
