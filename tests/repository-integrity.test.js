const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "app");
const DATA = path.join(APP, "data");
const CHAPTERS = path.join(APP, "chapters");
const MANUAL_PAGES = path.join(APP, "manual", "pages");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function numberedFilename(number, width, extension) {
  return `${String(number).padStart(width, "0")}.${extension}`;
}

function versionTuple(version) {
  assert.match(version, /^\d+\.\d+\.\d+$/, `Invalid semantic version: ${version}`);
  return version.split(".").map(Number);
}

function compareVersions(left, right) {
  const a = versionTuple(left);
  const b = versionTuple(right);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

test("required production files exist", () => {
  const required = [
    "app/index.html",
    "app/404.html",
    "app/assets/js/app-v4.js",
    "app/assets/css/app-v4.css",
    "app/data/build.json",
    "app/data/manual_pages.json",
    "app/service-worker.js",
    "app/manifest.webmanifest",
    "app/docs/Knaus_Sun_Traveller_Manufacturer_Manual.pdf",
    ".github/workflows/deploy-pages.yml",
    "app/assets/js/kb-corpus.js",
    "app/data/kb_content.schema.json",
    "app/data/kb_index.json",
    "scripts/build-kb-index.js",
    "app/data/digital_twin.schema.json",
    "app/data/digital_twin.json",
    "app/assets/js/digital-twin.js",
    "app/assets/js/digital-twin-adapter.js",
    "scripts/validate-digital-twin.js",
    "app/data/reasoning.schema.json",
    "app/data/reasoning.json",
    "app/data/reasoning_index.json",
    "app/assets/js/local-reasoning.js",
    "app/assets/js/reasoning-safety.js",
    "app/assets/js/guided-diagnostics.js",
    "scripts/build-reasoning-index.js",
    "scripts/validate-reasoning.js",
    "app/data/owner_records.schema.json",
    "app/assets/js/owner-records.js",
    "app/assets/js/record-history.js",
    "app/assets/js/evidence-links.js",
    "app/assets/js/digital-twin-owner-overlay.js",
    "scripts/validate-owner-records.js",
    "app/data/evidence_library.schema.json",
    "app/assets/js/evidence-storage.js",
    "app/assets/js/evidence-library.js",
    "app/assets/js/evidence-file-validation.js",
    "app/assets/js/evidence-library-ui.js",
    "scripts/validate-evidence-library.js",
    "app/data/system_graph.schema.json",
    "app/data/system_graph.json",
    "app/assets/js/system-graph.js",
    "app/assets/js/system-explorer.js",
    "scripts/validate-system-graph.js",
    "app/data/change_plan.schema.json",
    "app/assets/js/change-plans.js",
    "app/assets/js/change-baseline.js",
    "app/assets/js/change-impact.js",
    "app/assets/js/change-readiness.js",
    "app/assets/js/change-calculations.js",
    "app/assets/js/change-graph-overlay.js",
    "app/assets/js/change-planner-ui.js",
    "scripts/validate-change-plans.js",
    "app/data/workshop_job.schema.json",
    "app/data/inspection.schema.json",
    "app/data/inspection_templates.schema.json",
    "app/data/inspection_templates.json",
    "app/assets/js/workshop-jobs.js",
    "app/assets/js/workshop-lifecycle.js",
    "app/assets/js/workshop-readiness.js",
    "app/assets/js/workshop-checklists.js",
    "app/assets/js/workshop-defects.js",
    "app/assets/js/workshop-commissioning.js",
    "app/assets/js/inspections.js",
    "app/assets/js/workshop-owner-overlay.js",
    "scripts/validate-workshop-jobs.js",
    "scripts/validate-inspections.js",
  ];
  for (const relativePath of required) {
    assert.ok(fs.existsSync(path.join(ROOT, relativePath)), `Required production file is missing: ${relativePath}`);
  }
});

test("Engineering Corpus manifest, index, files and routes agree", () => {
  const manifest = readJson("app/data/kb_manifest.json");
  const index = readJson("app/data/kb_index.json");
  assert.equal(index.expectedRecordCount, 275);
  assert.equal(index.availableRecordCount, index.records.length);
  assert.deepEqual(index.records.map(record => record.id), manifest.records.map(record => record.id));
  for (const record of index.records) assert.ok(fs.existsSync(path.join(ROOT, record.contentPath)), `Missing indexed content ${record.contentPath}`);
  const actual = ["first-edition", "second-edition"].flatMap(edition => fs.readdirSync(path.join(APP, "corpus", edition)).filter(name => name.endsWith(".json")).map(name => `app/corpus/${edition}/${name}`));
  assert.deepEqual(actual.sort(), manifest.records.map(record => record.contentPath).sort(), "Unexpected KB JSON files exist outside the manifest");
  const html = read("app/index.html");
  assert.match(html, /data-screen="canon"/);
  assert.match(html, /data-screen="manuals"/);
  assert.match(html, /data-library="chapters"/);
  assert.match(html, /data-library="manual"/);
});

test("Digital Twin assets, validation and route are present", () => {
  const validation = spawnSync(process.execPath, [path.join(ROOT, "scripts", "validate-digital-twin.js")], { encoding: "utf8" });
  assert.equal(validation.status, 0, `Digital Twin validation failed:\n${validation.stderr || validation.stdout}`);
  const twin = readJson("app/data/digital_twin.json");
  for (const collection of ["documents", "photographs"]) for (const reference of twin[collection] || []) assert.ok(fs.existsSync(path.join(APP, reference.path)), `Missing Digital Twin static file app/${reference.path}`);
  const html = read("app/index.html");
  assert.match(html, /data-screen="digital-twin"/);
  for (const route of ["home", "manuals", "canon", "vehicle", "electrical", "water", "gas", "heating", "refrigeration", "maintenance", "diagnostics", "workshop", "settings"]) assert.match(html, new RegExp(`data-screen="${route}"`));
});

test("local reasoning assets, assistant route and offline entries are present", () => {
  const validation = spawnSync(process.execPath, [path.join(ROOT, "scripts", "validate-reasoning.js")], { encoding: "utf8" });
  assert.equal(validation.status, 0, `Reasoning validation failed:\n${validation.stderr || validation.stdout}`);
  const html = read("app/index.html"), worker = read("app/service-worker.js");
  assert.match(html, /data-screen="assistant"/);
  for (const asset of ["reasoning-safety.js", "local-reasoning.js", "guided-diagnostics.js"]) { assert.match(html, new RegExp(asset.replace(".", "\\."))); assert.match(worker, new RegExp(asset.replace(".", "\\."))); }
  for (const data of ["reasoning.json", "reasoning_index.json"]) assert.match(worker, new RegExp(data.replace(".", "\\.")));
});

test("production JavaScript passes Node syntax checking", () => {
  const script = path.join(APP, "assets", "js", "app-v4.js");
  const result = spawnSync(process.execPath, ["--check", script], { encoding: "utf8" });
  assert.equal(result.status, 0, `app-v4.js syntax check failed:\n${result.stderr || result.stdout}`);
});

test("every app/data JSON file parses", () => {
  const files = fs.readdirSync(DATA).filter((name) => name.endsWith(".json")).sort();
  assert.ok(files.length > 0, "No JSON files were found under app/data");
  for (const filename of files) {
    assert.doesNotThrow(
      () => JSON.parse(fs.readFileSync(path.join(DATA, filename), "utf8")),
      `Invalid JSON in app/data/${filename}`,
    );
  }
});

test("all 44 numbered chapters exist and have the required structure", () => {
  const numbered = fs.readdirSync(CHAPTERS).filter((name) => /^\d{2}\.json$/.test(name)).sort();
  assert.equal(numbered.length, 44, `Expected exactly 44 numbered chapter files; found ${numbered.length}`);

  for (let number = 1; number <= 44; number += 1) {
    const filename = numberedFilename(number, 2, "json");
    assert.ok(numbered.includes(filename), `Missing chapter file app/chapters/${filename}`);
    const chapter = JSON.parse(fs.readFileSync(path.join(CHAPTERS, filename), "utf8"));
    assert.equal(chapter.n, number, `${filename} chapter number must match its filename`);
    for (const field of ["title", "summary", "officialReference", "content"]) {
      assert.equal(typeof chapter[field], "string", `${filename} requires string field ${field}`);
      assert.ok(chapter[field].trim(), `${filename} field ${field} must not be empty`);
    }
    assert.ok(Number.isInteger(chapter.officialPage), `${filename} officialPage must be an integer`);
    assert.ok(
      chapter.officialPage >= 1 && chapter.officialPage <= 286,
      `${filename} references invalid manual page ${chapter.officialPage}`,
    );
  }
});

test("manual index and all 286 uniquely named page images are complete", () => {
  const records = readJson("app/data/manual_pages.json");
  assert.ok(Array.isArray(records), "manual_pages.json must contain an array");
  assert.equal(records.length, 286, `Expected 286 indexed manual pages; found ${records.length}`);
  const pageNumbers = records.map((record) => record.page);
  assert.equal(new Set(pageNumbers).size, 286, "Manual page index contains duplicate page numbers");
  assert.deepEqual([...pageNumbers].sort((a, b) => a - b), Array.from({ length: 286 }, (_, index) => index + 1));

  const imageNames = fs.readdirSync(MANUAL_PAGES).filter((name) => /^\d{3}\.jpg$/i.test(name));
  assert.equal(imageNames.length, 286, `Expected 286 numbered manual images; found ${imageNames.length}`);
  assert.equal(
    new Set(imageNames.map((name) => name.toLowerCase())).size,
    imageNames.length,
    "Manual page image filenames are duplicated",
  );
  for (let page = 1; page <= 286; page += 1) {
    const filename = numberedFilename(page, 3, "jpg");
    assert.ok(imageNames.includes(filename), `Missing manual image app/manual/pages/${filename}`);
  }
});

test("every system relationship points to an existing component", () => {
  for (const system of ["electrical", "water", "gas"]) {
    const components = readJson(`app/data/${system}_components.json`);
    const relationships = readJson(`app/data/${system}_relations.json`);
    assert.ok(Array.isArray(components), `${system} components must be an array`);
    assert.ok(Array.isArray(relationships), `${system} relationships must be an array`);
    const ids = components.map((component) => component.id);
    assert.equal(new Set(ids).size, ids.length, `${system} component IDs must be unique`);
    for (const relationship of relationships) {
      assert.ok(ids.includes(relationship.from), `${system} relationship has unknown source ${relationship.from}`);
      assert.ok(ids.includes(relationship.to), `${system} relationship has unknown target ${relationship.to}`);
    }
  }
});

test("index and GitHub Pages fallback are byte-for-byte identical", () => {
  const index = fs.readFileSync(path.join(APP, "index.html"));
  const fallback = fs.readFileSync(path.join(APP, "404.html"));
  assert.ok(index.equals(fallback), "app/index.html and app/404.html differ");
});

test("production version is internally consistent and not older than 13.12.0", () => {
  const html = read("app/index.html");
  const source = read("app/assets/js/app-v4.js");
  const serviceWorker = read("app/service-worker.js");
  const build = readJson("app/data/build.json");
  const htmlTitleVersion = html.match(/<title>Knaus Companion (\d+\.\d+\.\d+)<\/title>/)?.[1];
  const htmlVisibleVersion = html.match(/<span>Version (\d+\.\d+\.\d+)<\/span>/)?.[1];
  const appVersion = source.match(/const APP_VERSION="(\d+\.\d+\.\d+)";/)?.[1];
  const serviceWorkerVersion = serviceWorker.match(/[?&]v=(\d+\.\d+\.\d+)-/)?.[1];
  assert.ok(htmlTitleVersion, "Version is missing from the page title");
  assert.equal(htmlVisibleVersion, htmlTitleVersion, "Visible HTML version differs from the title");
  assert.equal(appVersion, htmlTitleVersion, "APP_VERSION differs from HTML");
  assert.equal(build.version, htmlTitleVersion, "app/data/build.json version differs from HTML");
  assert.equal(serviceWorkerVersion, htmlTitleVersion, "Service-worker asset version differs from HTML");
  assert.ok(compareVersions(htmlTitleVersion, "13.12.0") >= 0, `Version ${htmlTitleVersion} is older than 13.12.0`);
});

test("storage key and saved-state schema remain compatible", () => {
  const source = read("app/assets/js/app-v4.js");
  const storageDeclarations = [...source.matchAll(/const STORE_KEY="([^"]+)";/g)].map((match) => match[1]);
  assert.deepEqual(storageDeclarations, ["knaus-ultimate-v1"], "The production storage key changed or is duplicated");
  const defaultSchema = source.match(/const DEFAULT_STATE=\{schemaVersion:(\d+),/)?.[1];
  assert.equal(defaultSchema, "2", "DEFAULT_STATE schema version must remain 2");
  assert.match(source, /schemaVersion:2/, "Schema version 2 migration/export support is missing");
});

test("change planning route, modules and offline shell are integrated",()=>{
  const html=read("app/index.html"),worker=read("app/service-worker.js"),source=read("app/assets/js/app-v4.js");
  assert.match(html,/data-screen="change-plans"/);
  assert.match(source,/changePlans:\[\]/);
  for(const asset of ["change-plans.js","change-baseline.js","change-impact.js","change-readiness.js","change-calculations.js","change-graph-overlay.js","change_plan.schema.json"]){assert.match(html+worker,new RegExp(asset.replace(".","\\.")),`${asset} is not integrated`) }
  assert.match(worker,/v20-0-0-diagnostics/);
});

test("workshop jobs inspections execution mode and offline shell are integrated",()=>{
  const html=read("app/index.html"),worker=read("app/service-worker.js"),source=read("app/assets/js/app-v4.js");
  for(const route of["workshop-jobs","workshop-job","inspections"])assert.match(html,new RegExp(`data-screen="${route}"`));
  assert.match(source,/workshopJobs:\[\],inspections:\[\]/);
  for(const asset of["workshop_job.schema.json","inspection.schema.json","inspection_templates.json","workshop-jobs.js","workshop-lifecycle.js","workshop-readiness.js","workshop-checklists.js","workshop-defects.js","workshop-commissioning.js","inspections.js","workshop-owner-overlay.js"]){assert.match(html+worker,new RegExp(asset.replace(".","\\.")),`${asset} is not integrated`)}
  assert.match(worker,/v20-0-0-diagnostics/);
});

test("maintenance intelligence schemas runtimes routes and offline assets are integrated",()=>{
  const required=["app/data/maintenance_plan.schema.json","app/data/maintenance_interval.schema.json","app/data/maintenance_forecast.schema.json","app/data/maintenance_campaign.schema.json","app/data/maintenance_part.schema.json","app/data/maintenance_consumable.schema.json","app/data/vehicle_health_rules.json","app/assets/js/maintenance-engine.js","app/assets/js/maintenance-lifecycle.js","app/assets/js/maintenance-due.js","app/assets/js/maintenance-recurring.js","app/assets/js/maintenance-forecast.js","app/assets/js/maintenance-campaigns.js","app/assets/js/maintenance-deferral.js","app/assets/js/maintenance-readiness.js","app/assets/js/maintenance-dependencies.js","app/assets/js/maintenance-completion.js","app/assets/js/maintenance-parts.js","app/assets/js/maintenance-consumables.js","app/assets/js/maintenance-warranty.js","app/assets/js/component-maintenance.js","app/assets/js/vehicle-health.js","app/assets/js/maintenance-owner-overlay.js"];
  for(const file of required)assert.ok(fs.existsSync(path.join(ROOT,file)),`${file} is missing`);
  const html=read("app/index.html"),worker=read("app/service-worker.js");
  for(const route of["maintenance-intelligence","maintenance-dashboard","maintenance-calendar"])assert.match(html,new RegExp(`data-screen="${route}"`));
  for(const file of required.filter(x=>x.startsWith("app/assets/js/")).map(x=>x.split("/").pop()))assert.match(worker,new RegExp(file.replace(".","\\.")));
});

test("owner-record runtime, routes and offline shell are integrated", () => {
  const html=read("app/index.html"),worker=read("app/service-worker.js"),source=read("app/assets/js/app-v4.js");
  for(const route of ["records","timeline","health"])assert.match(html,new RegExp(`data-screen="${route}"`));
  for(const asset of ["owner-records.js","record-history.js","evidence-links.js","digital-twin-owner-overlay.js","owner_records.schema.json"]){assert.match(worker,new RegExp(asset.replace(".","\\.")),`${asset} missing from offline shell`)}
  assert.match(source,/ownerRecords:\[\]/);assert.match(source,/evidenceLinks:\[\]/);assert.match(source,/KnausOwnerRecords/);assert.match(source,/KnausDigitalTwinOwnerOverlay/);
});
