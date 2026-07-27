"use strict";
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),SCHEMA_PATH=path.join(ROOT,"app/data/digital_twin.schema.json"),DATA_PATH=path.join(ROOT,"app/data/digital_twin.json");
const ID=/^[a-z][a-z0-9]*(?::[a-z0-9][a-z0-9-]*)+$/,DATES=/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?$/;
const LIFECYCLES=new Set(["draft","active","maintenance","inactive","archived"]),CONFIDENCE=new Set(["confirmed","high","medium","low","unknown"]),CLASSIFICATIONS=new Set(["manufacturer","official-manual","owner-observation","measurement","photograph","service-record","invoice","inspection","inferred","estimated","unknown"]),RELATIONSHIPS=new Set(["contains","installed-in","powered-by","protected-by","connected-to","feeds","drains-to","supplied-by","controlled-by","monitored-by","documented-by","photographed-by","maintained-by","replaced-by","modified-by","related-to"]);
const arrays=["identity","systems","components","relationships","modifications","measurements","maintenance","faults","evidence","documents","photographs"];
function validateTwin(twin,{checkFiles=false}={}){
  const errors=[];const add=(where,message)=>errors.push(`app/data/digital_twin.json ${where}: ${message}`);
  if(!twin||typeof twin!=="object"||Array.isArray(twin))return["app/data/digital_twin.json: top level must be an object"];
  for(const field of ["schemaVersion","twinId","vehicleId","title","lifecycleState","createdAt","updatedAt","identity","systems","components","relationships","evidence"])if(twin[field]===undefined)add(field,"required field is missing");
  if(twin.schemaVersion!==1)add("schemaVersion","must be 1");if(!LIFECYCLES.has(twin.lifecycleState))add("lifecycleState",`invalid value ${twin.lifecycleState}`);
  for(const field of ["createdAt","updatedAt"])if(!DATES.test(twin[field]||"")||Number.isNaN(Date.parse(twin[field])))add(field,"invalid ISO date");
  for(const name of arrays)if(twin[name]!==undefined&&!Array.isArray(twin[name]))add(name,"must be an array");
  const collections=arrays.flatMap(name=>(Array.isArray(twin[name])?twin[name]:[]).map((entity,index)=>({entity,where:`${name}[${index}]`,collection:name})));
  const ids=new Set([twin.twinId,twin.vehicleId].filter(Boolean)),duplicates=new Set();
  for(const {entity,where} of collections){if(!entity||typeof entity!=="object"){add(where,"must be an object");continue}if(!ID.test(entity.id||""))add(`${where}.id`,"invalid stable identifier");if(ids.has(entity.id))duplicates.add(entity.id);ids.add(entity.id)}
  duplicates.forEach(id=>add("ids",`duplicate identifier ${id}`));
  const systemIds=new Set((twin.systems||[]).map(x=>x.id)),componentIds=new Set((twin.components||[]).map(x=>x.id)),evidenceIds=new Set((twin.evidence||[]).map(x=>x.id));
  for(const [i,fact] of (twin.identity||[]).entries()){if(!CONFIDENCE.has(fact.confidence))add(`identity[${i}].confidence`,"invalid confidence");checkEvidence(fact,`identity[${i}]`)}
  for(const [i,system] of (twin.systems||[]).entries()){if(!CONFIDENCE.has(system.confidence))add(`systems[${i}].confidence`,"invalid confidence");checkEvidence(system,`systems[${i}]`)}
  for(const [i,component] of (twin.components||[]).entries()){if(!systemIds.has(component.systemId))add(`components[${i}].systemId`,`missing system ${component.systemId}`);if(!CONFIDENCE.has(component.confidence))add(`components[${i}].confidence`,"invalid confidence");checkEvidence(component,`components[${i}]`)}
  const equivalents=new Set(),relatedComponents=new Set();
  for(const [i,rel] of (twin.relationships||[]).entries()){const where=`relationships[${i}]`;if(!RELATIONSHIPS.has(rel.type))add(`${where}.type`,`invalid relationship type ${rel.type}`);if(!ids.has(rel.sourceId))add(`${where}.sourceId`,`missing endpoint ${rel.sourceId}`);if(!ids.has(rel.targetId))add(`${where}.targetId`,`missing endpoint ${rel.targetId}`);if(rel.sourceId===rel.targetId&&rel.allowSelfReference!==true)add(where,"self-reference is not allowed");const key=[rel.sourceId,rel.type,rel.targetId,rel.direction].join("|");if(equivalents.has(key))add(where,"duplicate equivalent relationship");equivalents.add(key);if(componentIds.has(rel.sourceId))relatedComponents.add(rel.sourceId);if(componentIds.has(rel.targetId))relatedComponents.add(rel.targetId);checkEvidence(rel,where)}
  for(const id of componentIds)if(!relatedComponents.has(id))add("components",`orphaned component ${id}`);
  for(const [i,evidence] of (twin.evidence||[]).entries()){if(!CLASSIFICATIONS.has(evidence.classification))add(`evidence[${i}].classification`,"invalid evidence classification");if(!CONFIDENCE.has(evidence.confidence))add(`evidence[${i}].confidence`,"invalid confidence");if(evidence.date&&(!DATES.test(evidence.date)||Number.isNaN(Date.parse(evidence.date))))add(`evidence[${i}].date`,"invalid date");for(const ref of evidence.linkedEntityIds||[])if(!ids.has(ref))add(`evidence[${i}].linkedEntityIds`,`missing entity ${ref}`)}
  for(const name of ["modifications","measurements"])(twin[name]||[]).forEach((entity,i)=>{if(entity.systemId&&!systemIds.has(entity.systemId))add(`${name}[${i}].systemId`,`missing system ${entity.systemId}`);checkEvidence(entity,`${name}[${i}]`)});
  for(const name of ["documents","photographs"])(twin[name]||[]).forEach((ref,i)=>{if(!ref.path||ref.path.includes(".."))add(`${name}[${i}].path`,"invalid static path");else if(checkFiles&&!fs.existsSync(path.join(ROOT,"app",...ref.path.split("/"))))add(`${name}[${i}].path`,`missing static file ${ref.path}`)});
  function checkEvidence(entity,where){for(const ref of entity.evidenceRefs||[])if(!evidenceIds.has(ref))add(`${where}.evidenceRefs`,`missing evidence ${ref}`)}
  return errors;
}
function loadAndValidate(){JSON.parse(fs.readFileSync(SCHEMA_PATH,"utf8"));const twin=JSON.parse(fs.readFileSync(DATA_PATH,"utf8")),errors=validateTwin(twin,{checkFiles:true});if(errors.length)throw new Error(`Digital Twin validation failed:\n- ${errors.join("\n- ")}`);return twin}
function main(){try{const twin=loadAndValidate();console.info(`Digital Twin valid: ${twin.systems.length} systems, ${twin.components.length} components, ${twin.relationships.length} relationships, ${twin.evidence.length} evidence records.`)}catch(error){console.error(error.message);process.exitCode=1}}
if(require.main===module)main();
module.exports={ID,DATES,LIFECYCLES,CONFIDENCE,CLASSIFICATIONS,RELATIONSHIPS,validateTwin,loadAndValidate,main};
