const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const ROOT=path.resolve(__dirname,"..");
const APP=path.join(ROOT,"app");
const read=file=>fs.readFileSync(path.join(ROOT,file),"utf8");

test("release candidate routes and static route links are complete",()=>{
  const html=read("app/index.html"),screens=[...html.matchAll(/data-screen="([^"]+)"/g)].map(match=>match[1]),links=[...html.matchAll(/data-route="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(screens).size,screens.length,"Duplicate data-screen route found");
  assert.ok(screens.includes("health"),"Application health route is missing");
  for(const route of links)assert.ok(screens.includes(route),`Static link targets missing route: ${route}`);
});

test("HTML identifiers and local shell assets are valid",()=>{
  const html=read("app/index.html"),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,"Duplicate HTML id found");
  const assets=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match=>match[1].split("?")[0]).filter(value=>value&&!value.startsWith("#")&&!value.startsWith("data:")&&!/^[a-z]+:/i.test(value));
  for(const asset of assets)assert.ok(fs.existsSync(path.join(APP,asset)),`Missing HTML asset: app/${asset}`);
});

test("manifest contains valid icons and screenshots",()=>{
  const manifest=JSON.parse(read("app/manifest.webmanifest"));
  for(const field of ["name","short_name","start_url","display","icons","screenshots"])assert.ok(manifest[field],`Manifest field missing: ${field}`);
  assert.ok(manifest.icons.length>=2,"Manifest requires application icons");assert.ok(manifest.screenshots.length>=2,"Manifest requires wide and narrow screenshots");
  for(const item of [...manifest.icons,...manifest.screenshots])assert.ok(fs.existsSync(path.join(APP,item.src)),`Manifest asset missing: ${item.src}`);
  assert.ok(manifest.screenshots.some(item=>item.form_factor==="wide"));assert.ok(manifest.screenshots.some(item=>item.form_factor==="narrow"));
});

test("service worker offline shell is version-consistent and complete",()=>{
  const worker=read("app/service-worker.js"),match=worker.match(/const CORE=(\[[\s\S]*?\]);/);assert.ok(match,"Service worker CORE list missing");
  const core=vm.runInNewContext(match[1]);assert.ok(core.includes("./index.html"));assert.ok(core.includes("./manifest.webmanifest"));assert.match(worker,/v15-4-0-change-planning/);
  for(const entry of core){const clean=entry.split("?")[0].replace(/^\.\//,"");if(!clean)continue;assert.ok(fs.existsSync(path.join(APP,clean)),`Offline shell asset missing: app/${clean}`)}
  assert.match(worker,/CACHE_PREFIX/);assert.match(worker,/REBUILD_CACHE/);assert.match(worker,/request\.url/);
});

test("release version, storage and fallback remain consistent",()=>{
  const html=read("app/index.html"),fallback=read("app/404.html"),source=read("app/assets/js/app-v4.js"),build=JSON.parse(read("app/data/build.json"));
  assert.equal(html,fallback);assert.match(html,/Knaus Companion 15\.4\.0/);assert.match(source,/const APP_VERSION="15\.4\.0"/);assert.equal(build.version,"15.4.0");assert.match(source,/const STORE_KEY="knaus-ultimate-v1"/);assert.match(source,/DEFAULT_STATE=\{schemaVersion:2/);
});
