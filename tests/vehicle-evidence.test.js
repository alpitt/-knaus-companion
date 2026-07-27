const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const source=fs.readFileSync("app/assets/js/app-v4.js","utf8");
const html=fs.readFileSync("app/index.html","utf8");
const css=fs.readFileSync("app/assets/css/app-v4.css","utf8");

function extract(start,end){const from=source.indexOf(start),to=source.indexOf(end,from);assert.ok(from>=0&&to>from,`extract ${start}`);return source.slice(from,to)}
const modelSource=[
  extract("const EVIDENCE_STATUSES=","const DEFAULT_STATE="),
  extract("const DEFAULT_STATE=","const DATA="),
  extract("function normaliseEvidence(","function loadState()"),
  extract("function vehicleEvidenceAnswer(","function renderResults("),
  extract("function parseBackupText(","async function restoreBackup(")
].join("\n");
const context={};vm.runInNewContext(`${modelSource}\nthis.api={EVIDENCE_STATUSES,VEHICLE_EVIDENCE_BASELINE,DEFAULT_STATE,normaliseEvidence,evidenceValue,migrateEvidenceState,synchroniseProfileEvidence,parseBackupText,vehicleEvidenceAnswer}`,context);
const {EVIDENCE_STATUSES,normaliseEvidence,migrateEvidenceState,synchroniseProfileEvidence,parseBackupText,vehicleEvidenceAnswer}=context.api;

test("status values and confidence order are exact",()=>{
  assert.deepEqual(Object.keys(EVIDENCE_STATUSES),["owner-confirmed","photograph-confirmed","plate-confirmed","manual-reference","estimated","unknown"]);
  assert.deepEqual(Object.entries(EVIDENCE_STATUSES).sort((a,b)=>a[1].priority-b[1].priority).map(([key])=>key),["plate-confirmed","owner-confirmed","photograph-confirmed","manual-reference","estimated","unknown"]);
  assert.deepEqual(Object.values(EVIDENCE_STATUSES).map(item=>item.label),["Owner confirmed","Confirmed from photograph","Confirmed from vehicle plate","Manufacturer manual reference","Estimated","Unknown"]);
});

test("schema v1 primitives migrate non-destructively and idempotently",()=>{
  const old={vehicleProfile:{make:"Custom make",model:"Custom model"},vehicleConfiguration:{charger:"Legacy charger",year:2008},logs:[{id:"keep-me"}],faults:[{id:"fault-1"}]};
  const migrated=migrateEvidenceState(old),again=migrateEvidenceState(migrated);
  assert.equal(migrated.schemaVersion,2);assert.equal(migrated.vehicleConfiguration.charger.value,"Legacy charger");assert.equal(migrated.vehicleConfiguration.charger.status,"unknown");assert.equal(migrated.vehicleConfiguration.year.value,2008);assert.equal(migrated.vehicleConfiguration.make.value,"Custom make");assert.deepEqual(migrated.logs,old.logs);assert.deepEqual(migrated.faults,old.faults);assert.deepEqual(again.vehicleConfiguration,migrated.vehicleConfiguration);
});

test("all evidence metadata survives normalisation and reload migration",()=>{
  for(const status of Object.keys(EVIDENCE_STATUSES)){
    const evidence=normaliseEvidence({value:"Test value",status,source:"Test source",lastVerified:"2026-07-26",notes:"Test notes"});
    const migrated=migrateEvidenceState({schemaVersion:2,vehicleConfiguration:{test:evidence}}).vehicleConfiguration.test;
    assert.deepEqual(migrated,evidence);assert.equal(migrated.status,status);
  }
});

test("baseline values are evidence-aware and never replace existing values",()=>{
  const state=migrateEvidenceState({vehicleConfiguration:{charger:"Owner charger"}});
  assert.equal(state.vehicleConfiguration.charger.value,"Owner charger");assert.equal(state.vehicleConfiguration.charger.status,"unknown");
  assert.equal(state.vehicleConfiguration.heating.value,"Truma Trumatic C 4002");assert.equal(state.vehicleConfiguration.heating.status,"photograph-confirmed");
  assert.equal(state.vehicleConfiguration.fridge.status,"unknown");
});

test("schema v1 and v2 backups restore while invalid JSON is rejected",()=>{
  const v1=parseBackupText(JSON.stringify({state:{vehicleConfiguration:{engine:"Legacy engine"},logs:[{id:"v1-log"}]}}));
  const v2=parseBackupText(JSON.stringify({schemaVersion:2,state:{schemaVersion:2,vehicleConfiguration:{engine:{value:"Verified engine",status:"plate-confirmed",source:"Engine plate",lastVerified:"2026-07-26",notes:""}},logs:[{id:"v2-log"}]}}));
  assert.equal(v1.vehicleConfiguration.engine.value,"Legacy engine");assert.equal(v1.vehicleConfiguration.engine.status,"unknown");assert.equal(v1.logs[0].id,"v1-log");
  assert.equal(v2.vehicleConfiguration.engine.status,"plate-confirmed");assert.equal(v2.vehicleConfiguration.engine.source,"Engine plate");assert.equal(v2.logs[0].id,"v2-log");
  assert.throws(()=>parseBackupText("not json"),/Backup could not be read/);assert.throws(()=>parseBackupText("[]"),/structure is invalid/);
});

test("assistant distinguishes confirmed, estimated, unknown and manual evidence",()=>{
  const field={label:"Charger"},answer=status=>vehicleEvidenceAnswer({field,evidence:{value:"Example",status,source:"Evidence source",notes:"Confirm from plate"}});
  assert.match(answer("photograph-confirmed"),/confirmed from photograph/);assert.match(answer("estimated"),/estimated/);assert.match(answer("unknown"),/recorded as Example, but its evidence status is unknown/);assert.match(vehicleEvidenceAnswer({field,evidence:{value:"",status:"unknown"}}),/currently unknown/);assert.match(answer("manual-reference"),/does not confirm the equipment fitted/);
});

test("profile edits update lower-confidence evidence but preserve plate evidence",()=>{
  const configuration={make:{value:"Old make",status:"unknown"},model:{value:"Plate model",status:"plate-confirmed",source:"Build plate"}},profile={make:"New make",model:"Profile model",year:2009};
  const next=synchroniseProfileEvidence(configuration,profile,"2026-07-26");assert.equal(next.make.value,"New make");assert.equal(next.make.status,"owner-confirmed");assert.equal(next.make.lastVerified,"2026-07-26");assert.equal(next.model.value,"Plate model");assert.equal(next.model.status,"plate-confirmed");assert.equal(next.year.value,2009);
});

test("production integrations retain compatibility controls",()=>{
  assert.match(source,/const STORE_KEY="knaus-ultimate-v1"/);assert.match(source,/schemaVersion:2/);assert.match(source,/state:\{\.\.\.state,schemaVersion:2\}/);assert.match(source,/const safetyCopy=state/);assert.match(source,/function vehicleEvidenceAnswer\(/);assert.match(source,/function evidenceBadge\(/);
  assert.match(html,/Version 14\.2\.0/);for(const route of ["home","manuals","maintenance","diagnostics","workshop","heating","refrigeration","touring","vehicle","compliance","emergency","seasonal","settings"])assert.match(html,new RegExp(`data-screen="${route}"`));assert.match(source,/DATA\.chapters\.forEach/);assert.match(source,/DATA\.pages\.forEach/);assert.match(css,/@media\(max-width:620px\).*configuration-evidence-editor/s);assert.match(css,/\.evidence-badge/);
});

test("electrical digital twin reuses registry evidence and exports connections",()=>{
  assert.match(source,/const ELECTRICAL_EVIDENCE_FIELDS=Object\.freeze/);for(const mapping of ['"calira-evs":"charger"','vb06:"mainFuseBox"','vb04:"auxFuseBox"','"leisure-battery":"leisureBattery"'])assert.match(source,new RegExp(mapping));assert.match(source,/function electricalComponentEvidence\(component\).*configurationEvidence\(registryField\)/);assert.match(source,/function electricalEvidenceData\(/);assert.match(source,/connections:DATA\.electricalRelations/);assert.match(source,/function exportElectricalEvidence\(/);assert.match(html,/id="exportElectricalEvidence"/);assert.match(css,/\.electrical-evidence-context/);
});

test("electrical measurements persist through state, search and evidence export",()=>{
  assert.match(source,/electricalMeasurements:\[\]/);assert.match(source,/function saveElectricalMeasurement\(/);assert.match(source,/function deleteElectricalMeasurement\(/);assert.match(source,/measurements:\[\.\.\.\(state\.electricalMeasurements\|\|\[\]\)\]/);assert.match(source,/type:"electrical measurement"/);assert.match(html,/id="electricalMeasurementForm"/);assert.match(html,/id="electricalMeasurementComponent"/);assert.match(css,/\.electrical-measurement-form/);
  assert.match(css,/\.electrical-measurement-form>div\{grid-column:1\/-1/);assert.match(css,/\.electrical-measurement-notes\{grid-column:1\/6/);assert.match(css,/@media\(max-width:1100px\).*electrical-measurement-form>button\{grid-column:1\/-1\}/s);
  assert.match(source,/function electricalMeasurementKind\(/);assert.match(source,/function renderElectricalMeasurementInsights\(/);assert.match(html,/id="electricalMeasurementInsights"/);assert.match(html,/id="electricalMeasurementFilters"/);assert.match(css,/\.electrical-measurement-history/);
  assert.match(source,/function filteredElectricalMeasurements\(/);assert.match(source,/function exportElectricalMeasurementsCsv\(/);assert.match(source,/knaus-electrical-measurements-/);assert.match(html,/id="exportElectricalMeasurements"/);
  assert.match(source,/function electricalReportHtml\(/);assert.match(source,/function printElectricalReport\(/);assert.match(source,/Component evidence/);assert.match(source,/Documented connections/);assert.match(source,/Measurement evidence/);assert.match(html,/id="printElectricalReport"/);
});
