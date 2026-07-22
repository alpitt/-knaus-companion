
(function(){
  const params=new URLSearchParams(location.search);
  if(params.get("recover")==="1"){
    Promise.all([
      "serviceWorker" in navigator?navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))):Promise.resolve(),
      "caches" in window?caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))):Promise.resolve()
    ]).finally(()=>{
      params.delete("recover");
      const q=params.toString();
      location.replace(location.pathname+(q?"?"+q:"")+"#home");
    });
  }
})();


const qs=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];
const DATA={chapters:[],pages:[],pageFiles:[],vehicle:null,parts:[],troubleshooting:[],electrical:[],fuses:[],electricalDiagnostics:[],electricalRelations:[],electricalSymptoms:[],vehicleConfigSchema:null,water:[],waterRelations:[],waterDiagnostics:[],waterSymptoms:[],gas:[],gasRelations:[],gasDiagnostics:[],gasSymptoms:[],vehicleExplorer:[],maintenanceTasks:[],partsSeed:[],smartDiagnostics:[],assistantPrompts:[]};
const STORE="knaus-ultimate-v1"; const APP_VERSION="3.1.1";
let explorerView="interior",wakeLock=null;
let state={theme:"light",departure:{},annual:{},logs:[],upgrades:{},vehicleNotes:"",bookmarks:[],recent:[],vehicleConfig:{},workshopSteps:{},maintenance:{},currentMileage:0,faults:[],inventory:[],assistantHistory:[]};
try{state={...state,...JSON.parse(localStorage.getItem(STORE)||"{}")}}catch(e){}
const save=()=>localStorage.setItem(STORE,JSON.stringify(state));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function loadJSON(path){const r=await fetch(path);if(!r.ok)throw new Error(path);return r.json()}
async function init(){
  [DATA.chapters,DATA.pages,DATA.pageFiles,DATA.vehicle,DATA.parts,DATA.troubleshooting,DATA.electrical,DATA.fuses,DATA.electricalDiagnostics,DATA.electricalRelations,DATA.electricalSymptoms,DATA.vehicleConfigSchema,DATA.water,DATA.waterRelations,DATA.waterDiagnostics,DATA.waterSymptoms,DATA.gas,DATA.gasRelations,DATA.gasDiagnostics,DATA.gasSymptoms,DATA.vehicleExplorer,DATA.maintenanceTasks,DATA.partsSeed,DATA.smartDiagnostics,DATA.assistantPrompts]=await Promise.all([
    loadJSON("data/chapters.json"),loadJSON("data/manual_pages.json"),loadJSON("data/manual_page_files.json"),
    loadJSON("data/vehicle.json"),loadJSON("data/parts.json"),loadJSON("data/troubleshooting.json"),loadJSON("data/electrical_components.json"),loadJSON("data/fuses.json"),loadJSON("data/electrical_diagnostics.json"),loadJSON("data/electrical_relations.json"),loadJSON("data/electrical_symptoms.json"),loadJSON("data/vehicle_config_schema.json"),loadJSON("data/water_components.json"),loadJSON("data/water_relations.json"),loadJSON("data/water_diagnostics.json"),loadJSON("data/water_symptoms.json"),loadJSON("data/gas_components.json"),loadJSON("data/gas_relations.json"),loadJSON("data/gas_diagnostics.json"),loadJSON("data/gas_symptoms.json"),loadJSON("data/vehicle_explorer.json"),loadJSON("data/maintenance_tasks.json"),loadJSON("data/parts_inventory.json"),loadJSON("data/smart_diagnostics.json"),loadJSON("data/assistant_prompts.json")
  ]);
  renderChapters();renderVehicle();renderParts();renderTroubleshooting();renderPhotos();renderChecklists();renderLogs();renderUpgrades();renderBookmarks();renderRecent();renderElectrical();renderFuses();renderWiringExplorer();renderElectricalSearch();renderVehicleConfig();renderWater();renderWaterSearch();renderGas();renderGasSearch();renderVehicleExplorer();renderWorkshopMode();renderMaintenanceCentre();renderFaults();renderInventory();renderSmartDiagnostics();renderUnifiedAssistant();renderSystemHealth();applyTheme();await renderReleaseDashboard();
  route();
}
function show(id){
  const target=qs(`#${CSS.escape(id)}`);
  const safeId=target&&target.classList.contains("view")?id:"home";
  qsa(".view").forEach(v=>v.classList.toggle("active",v.id===safeId));
  qsa("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===safeId));
  const sidebar=qs("#sidebar");if(sidebar)sidebar.classList.remove("open");
  document.body.classList.remove("menu-open");
  scrollTo({top:0,left:0,behavior:"auto"});
}
document.addEventListener("click",event=>{
  const button=event.target.closest("[data-view],[data-target],[data-jump]");
  if(!button)return;
  const destination=button.dataset.view||button.dataset.target||button.dataset.jump;
  if(!destination)return;
  event.preventDefault();
  const normalized=destination.replace(/^#/,"");
  if(location.hash.slice(1)===normalized){route();}else{location.hash=normalized;}
});

function touchRecent(item){
  state.recent=(state.recent||[]).filter(x=>!(x.type===item.type&&x.id===item.id));
  state.recent.unshift({...item,viewedAt:new Date().toISOString()});
  state.recent=state.recent.slice(0,20);save();renderRecent();
}
function isBookmarked(type,id){return (state.bookmarks||[]).some(x=>x.type===type&&x.id===id)}
function toggleBookmark(item){
  state.bookmarks=state.bookmarks||[];
  const i=state.bookmarks.findIndex(x=>x.type===item.type&&x.id===item.id);
  if(i>=0)state.bookmarks.splice(i,1);else state.bookmarks.unshift(item);
  save();renderBookmarks();updateBookmarkButtons();
}
function updateBookmarkButtons(){
  const cb=qs("#bookmarkChapter");if(cb)cb.textContent=isBookmarked("chapter",currentChapter)?"Remove bookmark":"Bookmark";
  const mb=qs("#bookmarkManualPage");if(mb)mb.textContent=isBookmarked("manual",manualPage)?"Remove bookmark":"Bookmark page";
}
function renderBookmarks(){
  const items=state.bookmarks||[];const el=qs("#bookmarkList");if(!el)return;
  el.innerHTML=items.length?items.map((x,i)=>`<div class="bookmark-row"><div><strong>${esc(x.title)}</strong><p class="muted">${x.type==="chapter"?"Companion chapter":"Official manual page"}</p></div><div><button class="btn primary open-bookmark" data-i="${i}">Open</button> <button class="btn remove-bookmark" data-i="${i}">Remove</button></div></div>`).join(""):'<div class="card muted">No bookmarks yet.</div>';
  qsa(".open-bookmark").forEach(b=>b.addEventListener("click",()=>{const x=items[Number(b.dataset.i)];location.hash=x.type==="chapter"?`chapter/${x.id}`:`manual/${x.id}`}));
  qsa(".remove-bookmark").forEach(b=>b.addEventListener("click",()=>{state.bookmarks.splice(Number(b.dataset.i),1);save();renderBookmarks();updateBookmarkButtons()}));
}
function renderRecent(){
  const items=state.recent||[];const el=qs("#recentList");if(!el)return;
  el.innerHTML=items.length?items.map((x,i)=>`<div class="recent-row"><div><strong>${esc(x.title)}</strong><p class="muted">${x.type==="chapter"?"Companion chapter":"Official manual page"} · ${new Date(x.viewedAt).toLocaleString()}</p></div><button class="btn primary open-recent" data-i="${i}">Open</button></div>`).join(""):'<div class="card muted">No recent pages yet.</div>';
  qsa(".open-recent").forEach(b=>b.addEventListener("click",()=>{const x=items[Number(b.dataset.i)];location.hash=x.type==="chapter"?`chapter/${x.id}`:`manual/${x.id}`}));
}
async function renderReleaseDashboard(){
  const build=await loadJSON("data/build.json");
  const cards=[
    ["Version",build.version],
    ["Build date",build.buildDate],
    ["Companion chapters",build.counts.chapters],
    ["Official manual pages",build.counts.manualPages],
    ["Vehicle photos",build.counts.photos],
    ["Documents",build.counts.documents]
  ];
  qs("#releaseCards").innerHTML=cards.map(([k,v])=>`<div class="card"><div class="metric">${esc(v)}</div><strong>${esc(k)}</strong></div>`).join("");
  await runIntegrityChecks(build);
}
async function runIntegrityChecks(build){
  const checks=[];
  checks.push(["44 companion chapters",DATA.chapters.length===44,`${DATA.chapters.length} found`]);
  checks.push(["286 official manual pages",DATA.pageFiles.length===286,`${DATA.pageFiles.length} found`]);
  checks.push(["Manufacturer PDF available",await fetch("docs/Knaus_Sun_Traveller_Manufacturer_Manual.pdf",{method:"HEAD"}).then(r=>r.ok).catch(()=>false),""]);
  checks.push(["Build metadata loaded",build.version===APP_VERSION,`Build ${build.version}`]);
  const result=qs("#integrityResults");
  result.innerHTML=checks.map(([name,ok,detail])=>`<p><span class="${ok?"release-ok":"release-bad"}">${ok?"PASS":"FAIL"}</span> ${esc(name)} <span class="muted">${esc(detail)}</span></p>`).join("");
}

window.addEventListener("hashchange",route);
function route(){
  const raw=(location.hash.slice(1)||"home").trim();
  if(raw.startsWith("chapter/"))openChapter(Number(raw.split("/")[1]));
  else if(raw.startsWith("manual/"))openManual(Number(raw.split("/")[1]));
  else show(document.getElementById(raw)?raw:"home");
}
function renderChapters(filter=""){
  const q=filter.toLowerCase().trim();
  const rows=DATA.chapters.filter(c=>!q||(c.n+" "+c.title+" "+c.summary).toLowerCase().includes(q));
  qs("#chapterList").innerHTML=rows.map(c=>`<article class="chapter-row"><div class="chapter-number">${c.n}</div><div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p></div><button class="btn primary open-chapter" data-n="${c.n}">Open chapter</button></article>`).join("")||'<div class="card muted">No matching chapters.</div>';
  qsa(".open-chapter").forEach(b=>b.addEventListener("click",()=>location.hash=`chapter/${b.dataset.n}`));
}
let currentChapter=1;
async function openChapter(n){
  const meta=DATA.chapters.find(c=>c.n===n);if(!meta)return;
  currentChapter=n;const rec=await loadJSON(`chapters/${String(n).padStart(2,"0")}.json`);
  qs("#chapterTitle").textContent=`Chapter ${n}. ${meta.title}`;qs("#chapterSummary").textContent=meta.summary;
  qs("#chapterBody").innerHTML=rec.content;
  qs("#prevChapter").disabled=n===1;qs("#nextChapter").disabled=n===DATA.chapters.length;
  qsa("#chapterBody .open-official").forEach(b=>b.addEventListener("click",()=>location.hash=`manual/${b.dataset.page}`));
  qsa("#chapterBody img").forEach(img=>img.addEventListener("click",()=>zoomImage(img.src)));
  touchRecent({type:"chapter",id:n,title:`Chapter ${n}. ${meta.title}`});updateBookmarkButtons();show("chapter");
}
qs("#prevChapter").addEventListener("click",()=>location.hash=`chapter/${currentChapter-1}`);
qs("#nextChapter").addEventListener("click",()=>location.hash=`chapter/${currentChapter+1}`);
qs("#allChapters").addEventListener("click",()=>location.hash="chapters");
let manualPage=1,manualZoom=1;
function openManual(p){manualPage=Math.max(1,Math.min(DATA.pageFiles.length,p||1));show("manual");setManualPage(manualPage)}
function setManualPage(p){
  manualPage=Math.max(1,Math.min(DATA.pageFiles.length,Number(p)||1));
  const data=DATA.pages[manualPage-1]||{};
  qs("#pageInput").value=manualPage;qs("#pageTitle").textContent=`PDF page ${manualPage}. ${data.title||""}`;
  qs("#pageCount").textContent=`Page ${manualPage} of ${DATA.pageFiles.length}`;
  qs("#pageImage").src=`manual/pages/${DATA.pageFiles[manualPage-1]}`;touchRecent({type:"manual",id:manualPage,title:`Official manual page ${manualPage}`});qs("#pageImage").alt=`Official Knaus manual page ${manualPage}`;
  qs("#pageText").textContent=data.text||"";manualZoom=1;applyManualZoom();qs("#pageViewport").scrollTo(0,0);
  qs("#prevPage").disabled=manualPage===1;qs("#nextPage").disabled=manualPage===DATA.pageFiles.length;
}
function applyManualZoom(){qs("#pageImage").style.width=`${Math.round(manualZoom*100)}%`;qs("#zoomLabel").textContent=`${Math.round(manualZoom*100)}%`}
qs("#goPage").addEventListener("click",()=>setManualPage(qs("#pageInput").value));qs("#pageInput").addEventListener("keydown",e=>{if(e.key==="Enter")setManualPage(e.target.value)});
qs("#prevPage").addEventListener("click",()=>setManualPage(manualPage-1));qs("#nextPage").addEventListener("click",()=>setManualPage(manualPage+1));
qs("#zoomIn").addEventListener("click",()=>{manualZoom=Math.min(2.5,manualZoom+.25);applyManualZoom()});qs("#zoomOut").addEventListener("click",()=>{manualZoom=Math.max(.75,manualZoom-.25);applyManualZoom()});qs("#fitWidth").addEventListener("click",()=>{manualZoom=1;applyManualZoom()});
qs("#pageTop").addEventListener("click",()=>qs("#pageViewport").scrollTo({top:0,left:0,behavior:"smooth"}));
function renderVehicle(){
  qs("#vehicleTitle").textContent=`${DATA.vehicle.year} ${DATA.vehicle.name}`;
  qs("#vehicleCards").innerHTML=DATA.vehicle.confirmedEquipment.map(x=>`<div class="card"><strong>${esc(x.name)}</strong><p class="muted">${esc(x.category)}</p><p>${esc(x.status)}</p></div>`).join("");
  qs("#vehicleNotes").value=state.vehicleNotes||"";
}
qs("#saveVehicleNotes").addEventListener("click",()=>{state.vehicleNotes=qs("#vehicleNotes").value;save();alert("Vehicle notes saved.")});
function renderParts(filter=""){
 const q=filter.toLowerCase();const rows=DATA.parts.filter(x=>!q||Object.values(x).join(" ").toLowerCase().includes(q));
 qs("#partsBody").innerHTML=rows.map(x=>`<tr><td>${esc(x.system)}</td><td>${esc(x.part)}</td><td>${esc(x.status)}</td><td>${esc(x.notes)}</td></tr>`).join("");
}
qs("#partsSearch").addEventListener("input",e=>renderParts(e.target.value));
function renderTroubleshooting(){
 qs("#wizardSelect").innerHTML=DATA.troubleshooting.map(x=>`<option value="${x.id}">${esc(x.title)}</option>`).join("");
 qs("#startWizard").addEventListener("click",()=>startWizard(qs("#wizardSelect").value));startWizard(DATA.troubleshooting[0]?.id);
}
function startWizard(id){
 const flow=DATA.troubleshooting.find(x=>x.id===id);if(!flow)return;let index=0;
 const box=qs("#wizardBox");
 const step=()=>{
   const s=flow.steps[index];
   box.innerHTML=`<div class="wizard-step"><h2>${esc(flow.title)}</h2><p>${esc(s.q)}</p><div class="wizard-actions"><button class="btn primary" id="wizYes">Yes</button><button class="btn accent" id="wizNo">No</button><button class="btn" id="wizChapter">Open related chapter</button></div></div>`;
   qs("#wizChapter").addEventListener("click",()=>location.hash=`chapter/${flow.chapter}`);
   qs("#wizYes").addEventListener("click",()=>respond(s.yes));
   qs("#wizNo").addEventListener("click",()=>respond(s.no));
 };
 const respond=target=>{if(typeof target==="number"){index=target;step()}else box.innerHTML=`<div class="answer"><strong>Recommended next action</strong><p>${esc(target)}</p><button class="btn primary" id="wizAgain">Start again</button> <button class="btn" id="wizChapter">Open related chapter</button></div>`,qs("#wizAgain").addEventListener("click",()=>startWizard(id)),qs("#wizChapter").addEventListener("click",()=>location.hash=`chapter/${flow.chapter}`)};
 step();
}
function searchAll(q){
 q=q.trim().toLowerCase();location.hash="search";if(q.length<2){qs("#searchStatus").textContent="Enter two or more characters.";qs("#searchResults").innerHTML="";return}
 const words=q.split(/\s+/);const chapters=DATA.chapters.filter(c=>words.every(w=>(c.title+" "+c.summary).toLowerCase().includes(w))).slice(0,20);
 const manual=[];for(const p of DATA.pages){const low=(p.text||"").toLowerCase();if(words.every(w=>low.includes(w))){const at=Math.min(...words.map(w=>low.indexOf(w)).filter(x=>x>=0));manual.push({...p,snippet:(p.text||"").slice(Math.max(0,at-100),at+340)});if(manual.length>=30)break}}
 qs("#searchStatus").textContent=`${chapters.length} companion matches and ${manual.length} official manual matches.`;
 qs("#searchResults").innerHTML=(chapters.length?`<h2>Companion chapters</h2>${chapters.map(c=>`<div class="result"><strong>Chapter ${c.n}. ${esc(c.title)}</strong><p>${esc(c.summary)}</p><button class="btn primary result-ch" data-n="${c.n}">Open</button></div>`).join("")}`:"")+(manual.length?`<h2>Official manual pages</h2>${manual.map(p=>`<div class="result"><strong>PDF page ${p.page}. ${esc(p.title)}</strong><div class="snippet">${esc(p.snippet)}</div><button class="btn primary result-page" data-p="${p.page}">Open page</button></div>`).join("")}`:"")||'<div class="card muted">No matches.</div>';
 qsa(".result-ch").forEach(b=>b.addEventListener("click",()=>location.hash=`chapter/${b.dataset.n}`));qsa(".result-page").forEach(b=>b.addEventListener("click",()=>location.hash=`manual/${b.dataset.p}`));
}
qs("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter")searchAll(e.target.value)});
const dep=["Hook-up disconnected","Water hose disconnected","Waste valve closed","Windows and rooflights closed","Satellite dish lowered","Step retracted","Lockers locked","Rear camera secure","Interior secured","Final walk-around complete"];
const annual=["Roof and sealants inspected","Damp survey recorded","Gas system checked","RCD tested","Battery voltages recorded","VB04 and VB06 inspected","Water system sanitised","Boiler drain tested","Refrigerator serviced","Tyres and brakes inspected"];
function renderChecklist(kind,items,list,bar,label){
 const el=qs(list);el.innerHTML=items.map((x,i)=>`<label class="check"><input type="checkbox" data-i="${i}" ${state[kind][i]?"checked":""}><span>${esc(x)}</span></label>`).join("");
 qsa(`${list} input`).forEach(c=>c.addEventListener("change",()=>{state[kind][c.dataset.i]=c.checked;save();renderChecklist(kind,items,list,bar,label)}));
 const done=items.filter((_,i)=>state[kind][i]).length;qs(bar).style.width=`${done/items.length*100}%`;qs(label).textContent=`${done} of ${items.length} complete`;
}
function renderChecklists(){renderChecklist("departure",dep,"#departureList","#departureBar","#departureLabel");renderChecklist("annual",annual,"#annualList","#annualBar","#annualLabel")}
qs("#resetDeparture").addEventListener("click",()=>{state.departure={};save();renderChecklists()});qs("#resetAnnual").addEventListener("click",()=>{state.annual={};save();renderChecklists()});
function renderLogs(){qs("#logList").innerHTML=state.logs.length?state.logs.slice().reverse().map((x,r)=>{const i=state.logs.length-1-r;return `<div class="log"><strong>${esc(x.date)} · ${esc(x.category)}</strong><p class="muted">${x.mileage?esc(x.mileage)+" km · ":""}${esc(x.details)}</p><button class="btn delete-log" data-i="${i}">Delete</button></div>`}).join(""):'<p class="muted">No entries yet.</p>';qsa(".delete-log").forEach(b=>b.addEventListener("click",()=>{state.logs.splice(Number(b.dataset.i),1);save();renderLogs()}))}
qs("#addLog").addEventListener("click",()=>{const details=qs("#logDetails").value.trim();if(!details)return alert("Enter the work completed.");state.logs.push({date:qs("#logDate").value,mileage:qs("#logMileage").value,category:qs("#logCategory").value,details});qs("#logDetails").value="";save();renderLogs()});
const upgradeItems=[["smartshunt","Victron SmartShunt"],["lithium","LiFePO4 leisure battery"],["dcdc","DC-DC charger"],["solar","Roof solar"],["tap","Kitchen tap repair"],["safe","Under-seat safe"],["security","GPS and CCTV"],["internet","5G and Starlink"]];
function renderUpgrades(){qs("#upgradeGrid").innerHTML=upgradeItems.map(([id,name])=>`<div class="card"><strong>${esc(name)}</strong><label class="stack">Status<select data-id="${id}"><option>Planned</option><option>Researching</option><option>Inspecting</option><option>Ordered</option><option>Installed</option><option>Not required</option></select></label></div>`).join("");qsa("#upgradeGrid select").forEach(s=>{s.value=state.upgrades[s.dataset.id]||"Planned";s.addEventListener("change",()=>{state.upgrades[s.dataset.id]=s.value;save()})})}
function renderPhotos(){const photos=["vehicle_photo_01.jpg","vehicle_photo_02.jpg","vehicle_photo_03.jpg","vehicle_photo_04.jpg","vehicle_photo_05.jpg","vehicle_photo_06.jpg"].filter(Boolean);qs("#photoGrid").innerHTML=photos.map((p,i)=>`<div class="card photo-card"><img src="assets/photos/${p}" alt="Vehicle reference photograph ${i+1}"><p class="muted">Vehicle reference photograph ${i+1}</p></div>`).join("");qsa("#photoGrid img").forEach(i=>i.addEventListener("click",()=>zoomImage(i.src)))}
function zoomImage(src){qs("#modalImage").src=src;qs("#imageModal").classList.add("open")}
qs("#closeModal").addEventListener("click",()=>qs("#imageModal").classList.remove("open"));qs("#imageModal").addEventListener("click",e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove("open")});
function applyTheme(){document.documentElement.dataset.theme=state.theme==="dark"?"dark":""}
qs("#themeBtn").addEventListener("click",()=>{state.theme=state.theme==="dark"?"light":"dark";save();applyTheme()});qs("#printBtn").addEventListener("click",()=>print());
qs("#exportBtn").addEventListener("click",()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download="knaus-companion-data.json";a.click()});
qs("#importBtn").addEventListener("click",()=>qs("#importFile").click());qs("#importFile").addEventListener("change",async e=>{try{state={...state,...JSON.parse(await e.target.files[0].text())};save();location.reload()}catch(err){alert("Invalid backup file.")}});
qs("#menuBtn").addEventListener("click",()=>qs("#sidebar").classList.toggle("open"));
qs("#downloadManual").addEventListener("click",()=>{const a=document.createElement("a");a.href="docs/Knaus_Sun_Traveller_Manufacturer_Manual.pdf";a.download="Knaus_Sun_Traveller_Manufacturer_Manual.pdf";a.click()});
qs("#downloadOffline").addEventListener("click",async()=>{
 const btn=qs("#downloadOffline");btn.disabled=true;btn.textContent="Caching...";
 try{
   const urls=["index.html","assets/css/app.css","assets/js/app.js","data/chapters.json","data/manual_pages.json","data/manual_page_files.json","data/vehicle.json","data/parts.json","data/troubleshooting.json",
   ...DATA.chapters.map(c=>`chapters/${String(c.n).padStart(2,"0")}.json`),...DATA.pageFiles.map(f=>`manual/pages/${f}`),"docs/Knaus_Sun_Traveller_Manufacturer_Manual.pdf"];
   const cache=await caches.open("knaus-ultimate-offline-v1");let done=0;
   for(const u of urls){await cache.add(u);done++;btn.textContent=`Caching ${done}/${urls.length}`}
   btn.textContent="Offline pack ready";
 }catch(e){btn.textContent="Offline caching failed";alert("Use the app through HTTPS or the supplied local server, then try again.")}
 finally{setTimeout(()=>btn.disabled=false,1000)}
});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("service-worker.js");
init().catch(e=>{
  console.error(e);
  document.body.innerHTML=`<main class="startup-error"><div><span class="eyebrow">Knaus Companion v3.1.1</span><h1>The app could not finish loading</h1><p>Refresh the page once. If the problem continues, use the recovery link below to clear only this app's cached files.</p><pre>${esc(e.message)}</pre><p><a class="btn primary" href="?recover=1">Recover and reload</a></p></div></main>`;
});

qs("#bookmarkChapter").addEventListener("click",()=>{const meta=DATA.chapters.find(c=>c.n===currentChapter);toggleBookmark({type:"chapter",id:currentChapter,title:`Chapter ${currentChapter}. ${meta?.title||""}`})});
qs("#bookmarkManualPage").addEventListener("click",()=>toggleBookmark({type:"manual",id:manualPage,title:`Official manual page ${manualPage}`}));
qs("#runIntegrity").addEventListener("click",async()=>runIntegrityChecks(await loadJSON("data/build.json")));

function updateBottomNav(){const current=(location.hash.slice(1)||"home").split("/")[0];qsa(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===current))}

window.addEventListener("hashchange",updateBottomNav);
qs("#quickFab").addEventListener("click",()=>{qs("#quickSheet").classList.add("open");qs("#quickSheet").setAttribute("aria-hidden","false")});
qs("#closeQuickSheet").addEventListener("click",()=>{qs("#quickSheet").classList.remove("open");qs("#quickSheet").setAttribute("aria-hidden","true")});
qs("#quickSheet").addEventListener("click",e=>{if(e.target===e.currentTarget){e.currentTarget.classList.remove("open");e.currentTarget.setAttribute("aria-hidden","true")}});
qsa(".quick-action").forEach(b=>b.addEventListener("click",()=>{const sheet=qs("#quickSheet");if(sheet)sheet.classList.remove("open")}));
async function renderSafetyLock(){const baseline={chapters:44,manualPages:286,photos:6,documents:1};const build=await loadJSON("data/build.json");const checks=[["Companion chapters preserved",build.counts.chapters>=baseline.chapters,`${build.counts.chapters} / ${baseline.chapters}`],["Official manual pages preserved",build.counts.manualPages>=baseline.manualPages,`${build.counts.manualPages} / ${baseline.manualPages}`],["Vehicle photos preserved",build.counts.photos>=baseline.photos,`${build.counts.photos} / ${baseline.photos}`],["Manufacturer document preserved",build.counts.documents>=baseline.documents,`${build.counts.documents} / ${baseline.documents}`],["Build version matches",build.version===APP_VERSION,build.version]];const el=qs("#safetyLockResults");if(el)el.innerHTML=checks.map(([name,ok,detail])=>`<div class="safety-row"><div><strong>${esc(name)}</strong><div class="muted">${esc(detail)}</div></div><span class="${ok?"safety-pass":"safety-fail"}">${ok?"PASS":"BLOCK"}</span></div>`).join("")}
renderSafetyLock();updateBottomNav();

let currentElectricalComponent="";
function renderElectrical(){
  const el=qs("#electricalCards");if(!el)return;
  el.insertAdjacentHTML("beforebegin",`<div class="database-counts"><span>${DATA.electrical.length} components</span><span>${DATA.fuses.length} fuses</span><span>${DATA.electricalRelations.length} connections</span><span>${DATA.electricalSymptoms.length} indexed symptoms</span></div>`);el.innerHTML=DATA.electrical.map(c=>`<article class="card component-card"><span class="component-status">${esc(c.status)}</span><h2>${esc(c.name)}</h2><p class="muted">${esc(c.category)} · ${esc(c.location)}</p><p>${esc(c.purpose)}</p><button class="btn primary open-component" data-id="${esc(c.id)}">Open component</button></article>`).join("");
  qsa(".open-component,.system-node").forEach(b=>b.addEventListener("click",()=>openElectricalComponent(b.dataset.id||b.dataset.component)));
  const sel=qs("#electricalDiagSelect");sel.innerHTML=DATA.electricalDiagnostics.map(x=>`<option value="${x.id}">${esc(x.title)}</option>`).join("");
  qs("#startElectricalDiag").addEventListener("click",()=>startElectricalDiagnostic(sel.value));
}
function openElectricalComponent(id){
  const c=DATA.electrical.find(x=>x.id===id);if(!c)return;currentElectricalComponent=id;
  qs("#electricalComponentBody").innerHTML=`<article class="article"><span class="component-status">${esc(c.status)}</span><h1>${esc(c.name)}</h1><p class="lead">${esc(c.purpose)}</p><div class="component-meta"><div><strong>Location</strong><p>${esc(c.location)}</p></div><div><strong>Expected readings or behaviour</strong><p>${esc(c.expected)}</p></div><div><strong>Fuse protection</strong><p>${esc(c.fuses)}</p></div><div><strong>Upgrade compatibility</strong><p>${esc(c.upgrade)}</p></div></div><h2>Technical record</h2><div class="component-meta"><div><strong>Manufacturer</strong><p>${esc(c.manufacturer)}</p></div><div><strong>Model</strong><p>${esc(c.model)}</p></div><div><strong>Voltage</strong><p>${esc(c.voltage)}</p></div><div><strong>Relay or control</strong><p>${esc(c.relay)}</p></div></div><h2>Normal readings</h2><ul class="test-list">${(c.normalReadings||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul><h2>Wires and connectors</h2><div class="component-meta"><div><strong>Wires</strong><ul>${(c.wires||[]).map(x=>`<li>${esc(x)}</li>`).join("")||"<li>To be traced</li>"}</ul></div><div><strong>Connectors</strong><ul>${(c.connectors||[]).map(x=>`<li>${esc(x)}</li>`).join("")||"<li>To be confirmed</li>"}</ul></div></div><h2>Test procedure</h2><ol class="test-list">${c.tests.map(x=>`<li>${esc(x)}</li>`).join("")}</ol><h2>Common faults</h2><ul class="test-list">${(c.faults||[]).map(x=>`<li>${esc(x)}</li>`).join("")||"<li>No component-specific faults recorded yet.</li>"}</ul><h2>Maintenance</h2><ul class="test-list">${(c.maintenance||[]).map(x=>`<li>${esc(x)}</li>`).join("")||"<li>Inspect during annual electrical review.</li>"}</ul><h2>Replacement guidance</h2><p>${esc(c.replacement||"Confirm specification before ordering.")}</p><div class="tag-list">${(c.tags||[]).map(x=>`<span>${esc(x)}</span>`).join("")}</div><h2>Related companion chapters</h2><p>${c.chapters.map(n=>`<button class="btn component-chapter" data-n="${n}">Chapter ${n}</button>`).join(" ")}</p><h2>Official manual pages</h2><p>${c.officialPages.map(n=>`<button class="btn component-page" data-p="${n}">PDF page ${n}</button>`).join(" ")}</p></article>`;
  qsa(".component-chapter").forEach(b=>b.addEventListener("click",()=>location.hash=`chapter/${b.dataset.n}`));qsa(".component-page").forEach(b=>b.addEventListener("click",()=>location.hash=`manual/${b.dataset.p}`));
  show("electricalComponent");
}
qs("#backElectrical").addEventListener("click",()=>location.hash="electrical");
function startElectricalDiagnostic(id){
  const flow=DATA.electricalDiagnostics.find(x=>x.id===id);if(!flow)return;let index=0;const box=qs("#electricalDiagBox");
  const step=()=>{const s=flow.steps[index];box.innerHTML=`<div class="wizard-step"><h2>${esc(flow.title)}</h2><p>${esc(s.q)}</p><div class="wizard-actions"><button class="btn primary" id="edYes">Yes</button><button class="btn accent" id="edNo">No</button><button class="btn" id="edChapter">Open chapter ${flow.chapter}</button></div></div>`;qs("#edYes").onclick=()=>respond(s.yes);qs("#edNo").onclick=()=>respond(s.no);qs("#edChapter").onclick=()=>location.hash=`chapter/${flow.chapter}`};
  const respond=target=>{if(typeof target==="number"){index=target;step()}else{box.innerHTML=`<div class="answer"><strong>Recommended next action</strong><p>${esc(target)}</p><button class="btn primary" id="edRestart">Start again</button> <button class="btn" id="edChapter">Open related chapter</button></div>`;qs("#edRestart").onclick=()=>startElectricalDiagnostic(id);qs("#edChapter").onclick=()=>location.hash=`chapter/${flow.chapter}`}};
  step();
}
function renderFuses(filter=""){
  const q=filter.trim().toLowerCase();const rows=DATA.fuses.filter(f=>!q||Object.values(f).join(" ").toLowerCase().includes(q));const body=qs("#fuseBody");if(!body)return;
  body.innerHTML=rows.map(f=>`<tr><td>${esc(f.box)}</td><td>${esc(f.label)}</td><td class="fuse-rating">${esc(f.rating)}</td><td>${esc(f.function)}</td><td><button class="btn fuse-component" data-id="${esc(f.component)}">Component</button></td></tr>`).join("");
  qsa(".fuse-component").forEach(b=>b.addEventListener("click",()=>openElectricalComponent(b.dataset.id)));
}
qs("#fuseSearch").addEventListener("input",e=>renderFuses(e.target.value));

function componentName(id){return DATA.electrical.find(x=>x.id===id)?.name||id}
function renderWiringExplorer(){
  const sel=qs("#wiringStart");if(!sel)return;
  sel.innerHTML=DATA.electrical.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
  qs("#showWiring").addEventListener("click",()=>showConnections(sel.value));
  showConnections(DATA.electrical[0]?.id);
}
function showConnections(id){
  const rows=DATA.electricalRelations.filter(r=>r.from===id||r.to===id);
  qs("#wiringResults").innerHTML=rows.length?`<div class="connection-list">${rows.map(r=>`<div class="connection"><button class="btn wiring-component" data-id="${esc(r.from)}">${esc(componentName(r.from))}</button><div class="connection-arrow">${esc(r.label)} →</div><button class="btn wiring-component" data-id="${esc(r.to)}">${esc(componentName(r.to))}</button></div>`).join("")}</div>`:'<div class="card muted">No recorded connections for this component yet.</div>';
  qsa(".wiring-component").forEach(b=>b.addEventListener("click",()=>openElectricalComponent(b.dataset.id)));
}
function renderElectricalSearch(){
  const input=qs("#electricalSearchInput");if(!input)return;
  input.addEventListener("input",()=>searchElectrical(input.value));
}
function searchElectrical(query){
  const q=query.trim().toLowerCase(),out=qs("#electricalSearchResults");
  if(q.length<2){out.innerHTML='<div class="card muted">Enter two or more characters.</div>';return}
  const components=DATA.electrical.filter(c=>JSON.stringify(c).toLowerCase().includes(q));
  const fuses=DATA.fuses.filter(f=>JSON.stringify(f).toLowerCase().includes(q));
  const symptoms=DATA.electricalSymptoms.filter(s=>JSON.stringify(s).toLowerCase().includes(q));
  out.innerHTML=`<p class="muted">${components.length} components, ${fuses.length} fuses and ${symptoms.length} symptoms found.</p>`+
  components.map(c=>`<div class="electrical-result"><strong>${esc(c.name)}</strong><p>${esc(c.purpose)}</p><button class="btn primary electrical-open-component" data-id="${esc(c.id)}">Open component</button></div>`).join("")+
  fuses.map(f=>`<div class="electrical-result"><strong>${esc(f.box)} · ${esc(f.label)} · ${esc(f.rating)}</strong><p>${esc(f.function)}</p><button class="btn electrical-open-component" data-id="${esc(f.component)}">Open component</button></div>`).join("")+
  symptoms.map(s=>`<div class="electrical-result"><strong>Symptom: ${esc(s.symptom)}</strong><p>Related: ${s.components.map(componentName).map(esc).join(", ")}</p><button class="btn electrical-open-diagnostic" data-id="${esc(s.diagnostic)}">Start diagnostic</button></div>`).join("")||'<div class="card muted">No matches.</div>';
  qsa(".electrical-open-component").forEach(b=>b.addEventListener("click",()=>openElectricalComponent(b.dataset.id)));
  qsa(".electrical-open-diagnostic").forEach(b=>b.addEventListener("click",()=>{location.hash="electrical";setTimeout(()=>startElectricalDiagnostic(b.dataset.id),0)}));
}

function defaultVehicleConfig(){
  const values={};
  for(const section of DATA.vehicleConfigSchema.sections){
    for(const field of section.fields) values[field.id]=field.value??"";
  }
  return values;
}
function renderVehicleConfig(){
  if(!DATA.vehicleConfigSchema)return;
  state.vehicleConfig={...defaultVehicleConfig(),...(state.vehicleConfig||{})};
  const form=qs("#vehicleConfigForm");
  form.innerHTML=DATA.vehicleConfigSchema.sections.map(section=>`<section class="config-section"><h2>${esc(section.title)}</h2><div class="config-fields">${section.fields.map(field=>{
    const value=state.vehicleConfig[field.id]??"";
    if(field.type==="select")return `<label class="config-field">${esc(field.label)}<select class="control vehicle-config-input" data-field="${esc(field.id)}">${field.options.map(o=>`<option ${o===value?"selected":""}>${esc(o)}</option>`).join("")}</select></label>`;
    if(field.type==="textarea")return `<label class="config-field">${esc(field.label)}<textarea class="control vehicle-config-input" data-field="${esc(field.id)}">${esc(value)}</textarea></label>`;
    return `<label class="config-field">${esc(field.label)}<input class="control vehicle-config-input" data-field="${esc(field.id)}" type="${esc(field.type||"text")}" value="${esc(value)}"></label>`;
  }).join("")}</div></section>`).join("");
  qsa(".vehicle-config-input").forEach(el=>el.addEventListener("input",()=>{state.vehicleConfig[el.dataset.field]=el.value;renderVehicleConfigSummary()}));
  renderVehicleConfigSummary();
}
function renderVehicleConfigSummary(){
  const cfg=state.vehicleConfig||{};
  const completed=Object.values(cfg).filter(v=>String(v).trim()).length;
  const total=DATA.vehicleConfigSchema.sections.reduce((n,s)=>n+s.fields.length,0);
  const battery=cfg.leisureBattery||cfg.batteryChemistry||"Not recorded";
  const heater=cfg.heating||cfg.boiler||"Not recorded";
  qs("#vehicleConfigSummary").innerHTML=`<div class="card"><div class="config-status">Profile completion</div><div class="metric">${Math.round(completed/total*100)}%</div><p class="muted">${completed} of ${total} fields recorded</p></div><div class="card"><div class="config-status">Electrical</div><strong>${esc(battery)}</strong><p class="muted">${esc(cfg.charger||"Charger not recorded")}</p></div><div class="card"><div class="config-status">Heating</div><strong>${esc(heater)}</strong><p class="muted">${esc(cfg.frostControl||"Frost valve not recorded")}</p></div><div class="card"><div class="config-status">Base vehicle</div><strong>${esc(cfg.baseVehicle||"Not recorded")}</strong><p class="muted">${esc(cfg.engine||"Engine not recorded")}</p></div>`;
}
qs("#saveVehicleConfig").addEventListener("click",()=>{save();alert("Vehicle configuration saved.")});
qs("#exportVehicleConfig").addEventListener("click",()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({version:APP_VERSION,vehicleConfig:state.vehicleConfig},null,2)],{type:"application/json"}));a.download="knaus-vehicle-configuration.json";a.click()});
qs("#importVehicleConfig").addEventListener("click",()=>qs("#vehicleConfigFile").click());
qs("#vehicleConfigFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());state.vehicleConfig={...defaultVehicleConfig(),...(data.vehicleConfig||data)};save();renderVehicleConfig();alert("Vehicle configuration imported.")}catch(err){alert("Invalid configuration file.")}e.target.value=""});
qs("#resetVehicleConfig").addEventListener("click",()=>{if(confirm("Restore the vehicle configuration defaults?")){state.vehicleConfig=defaultVehicleConfig();save();renderVehicleConfig()}});

function waterName(id){return DATA.water.find(x=>x.id===id)?.name||id}
function renderWater(){
  const cards=qs("#waterCards");if(!cards)return;
  qs("#waterCounts").innerHTML=`<span>${DATA.water.length} components</span><span>${DATA.waterRelations.length} connections</span><span>${DATA.waterDiagnostics.length} diagnostics</span><span>${DATA.waterSymptoms.length} symptoms</span>`;
  cards.innerHTML=DATA.water.map(c=>`<article class="card water-card"><span class="component-status">${esc(c.status)}</span><h2>${esc(c.name)}</h2><p class="muted">${esc(c.category)} · ${esc(c.location)}</p><p>${esc(c.purpose)}</p><button class="btn primary open-water" data-id="${esc(c.id)}">Open component</button></article>`).join("");
  qsa(".open-water,.water-node").forEach(b=>b.addEventListener("click",()=>openWaterComponent(b.dataset.id||b.dataset.water)));
  const sel=qs("#waterDiagSelect");sel.innerHTML=DATA.waterDiagnostics.map(x=>`<option value="${esc(x.id)}">${esc(x.title)}</option>`).join("");
  qs("#startWaterDiag").addEventListener("click",()=>startWaterDiagnostic(sel.value));
}
function openWaterComponent(id){
  const c=DATA.water.find(x=>x.id===id);if(!c)return;
  const related=DATA.waterRelations.filter(r=>r.from===id||r.to===id);
  const history=id==="frost-valve"?"The rear or underside water discharge was previously traced to the frost-protection drain opening.":id==="kitchen-tap"?"The kitchen hot-water hose or mixer connection has a known leak history.":"";
  qs("#waterComponentBody").innerHTML=`<article class="article"><span class="component-status">${esc(c.status)}</span><h1>${esc(c.name)}</h1><p class="lead">${esc(c.purpose)}</p>${history?`<div class="known-history"><strong>Known vehicle history</strong><p>${esc(history)}</p></div>`:""}<div class="component-meta"><div><strong>Location</strong><p>${esc(c.location)}</p></div><div><strong>How it works</strong><p>${esc(c.operation)}</p></div></div><h2>Tests</h2><ol class="test-list">${c.tests.map(x=>`<li>${esc(x)}</li>`).join("")}</ol><h2>Common faults</h2><ul class="test-list">${c.faults.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><h2>Maintenance</h2><ul class="test-list">${c.maintenance.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><h2>Connected components</h2><div class="connection-list">${related.map(r=>`<div class="connection"><button class="btn water-link" data-id="${esc(r.from)}">${esc(waterName(r.from))}</button><div class="connection-arrow">${esc(r.label)} →</div><button class="btn water-link" data-id="${esc(r.to)}">${esc(waterName(r.to))}</button></div>`).join("")||"<p>No recorded connections.</p>"}</div><h2>Related chapters</h2><p>${c.chapters.map(n=>`<button class="btn water-chapter" data-n="${n}">Chapter ${n}</button>`).join(" ")}</p><h2>Official manual pages</h2><p>${c.officialPages.map(n=>`<button class="btn water-page" data-p="${n}">PDF page ${n}</button>`).join(" ")}</p><div class="tag-list">${c.tags.map(t=>`<span>${esc(t)}</span>`).join("")}</div></article>`;
  qsa(".water-link").forEach(b=>b.addEventListener("click",()=>openWaterComponent(b.dataset.id)));
  qsa(".water-chapter").forEach(b=>b.addEventListener("click",()=>location.hash=`chapter/${b.dataset.n}`));
  qsa(".water-page").forEach(b=>b.addEventListener("click",()=>location.hash=`manual/${b.dataset.p}`));
  show("waterComponent");
}
qs("#backWater").addEventListener("click",()=>location.hash="water");
function startWaterDiagnostic(id){
  const flow=DATA.waterDiagnostics.find(x=>x.id===id);if(!flow)return;let index=0;const box=qs("#waterDiagBox");
  const step=()=>{const s=flow.steps[index];box.innerHTML=`<div class="wizard-step"><h2>${esc(flow.title)}</h2><p>${esc(s.q)}</p><div class="wizard-actions"><button class="btn primary" id="wdYes">Yes</button><button class="btn accent" id="wdNo">No</button><button class="btn" id="wdChapter">Open chapter ${flow.chapter}</button></div></div>`;qs("#wdYes").onclick=()=>respond(s.yes);qs("#wdNo").onclick=()=>respond(s.no);qs("#wdChapter").onclick=()=>location.hash=`chapter/${flow.chapter}`};
  const respond=target=>{if(typeof target==="number"){index=target;step()}else{box.innerHTML=`<div class="answer"><strong>Recommended next action</strong><p>${esc(target)}</p><button class="btn primary" id="wdRestart">Start again</button> <button class="btn" id="wdChapter">Open related chapter</button></div>`;qs("#wdRestart").onclick=()=>startWaterDiagnostic(id);qs("#wdChapter").onclick=()=>location.hash=`chapter/${flow.chapter}`}};
  step();
}
function renderWaterSearch(){
  const input=qs("#waterSearchInput");if(!input)return;
  input.addEventListener("input",()=>searchWater(input.value));
}
function searchWater(query){
  const q=query.trim().toLowerCase(),out=qs("#waterSearchResults");
  if(q.length<2){out.innerHTML='<div class="card muted">Enter two or more characters.</div>';return}
  const comps=DATA.water.filter(c=>JSON.stringify(c).toLowerCase().includes(q));
  const symptoms=DATA.waterSymptoms.filter(s=>JSON.stringify(s).toLowerCase().includes(q));
  out.innerHTML=`<p class="muted">${comps.length} components and ${symptoms.length} symptoms found.</p>`+
  comps.map(c=>`<div class="water-result"><strong>${esc(c.name)}</strong><p>${esc(c.purpose)}</p><button class="btn primary water-open-result" data-id="${esc(c.id)}">Open component</button></div>`).join("")+
  symptoms.map(s=>`<div class="water-result"><strong>Symptom: ${esc(s.symptom)}</strong><p>${s.components.map(waterName).map(esc).join(", ")}</p><button class="btn water-diagnostic-result" data-id="${esc(s.diagnostic)}">Start diagnostic</button></div>`).join("")||'<div class="card muted">No matches.</div>';
  qsa(".water-open-result").forEach(b=>b.addEventListener("click",()=>openWaterComponent(b.dataset.id)));
  qsa(".water-diagnostic-result").forEach(b=>b.addEventListener("click",()=>{location.hash="water";setTimeout(()=>startWaterDiagnostic(b.dataset.id),0)}));
}

function gasName(id){return DATA.gas.find(x=>x.id===id)?.name||id}
function renderGas(){
  const cards=qs("#gasCards");if(!cards)return;
  qs("#gasCounts").innerHTML=`<span>${DATA.gas.length} components</span><span>${DATA.gasRelations.length} connections</span><span>${DATA.gasDiagnostics.length} diagnostics</span><span>${DATA.gasSymptoms.length} symptoms</span>`;
  cards.innerHTML=DATA.gas.map(c=>`<article class="card"><span class="component-status">${esc(c.status)}</span><h2>${esc(c.name)}</h2><p class="muted">${esc(c.category)} · ${esc(c.location)}</p><p>${esc(c.purpose)}</p><button class="btn primary open-gas" data-id="${esc(c.id)}">Open component</button></article>`).join("");
  qsa(".open-gas,.gas-node").forEach(b=>b.addEventListener("click",()=>openGasComponent(b.dataset.id||b.dataset.gas)));
  const sel=qs("#gasDiagSelect");sel.innerHTML=DATA.gasDiagnostics.map(x=>`<option value="${esc(x.id)}">${esc(x.title)}</option>`).join("");
  qs("#startGasDiag").addEventListener("click",()=>startGasDiagnostic(sel.value));
}
function openGasComponent(id){
  const c=DATA.gas.find(x=>x.id===id);if(!c)return;
  const related=DATA.gasRelations.filter(r=>r.from===id||r.to===id);
  const safety=["gas-locker","gas-cylinder","regulator","flue-system","co-alarm"].includes(id)?'<div class="safety-critical"><strong>Safety-critical system</strong><p>Close the cylinder and stop use if you smell gas, suspect a leak, see damaged pipework, or receive a carbon-monoxide warning.</p></div>':"";
  qs("#gasComponentBody").innerHTML=`<article class="article"><span class="component-status">${esc(c.status)}</span><h1>${esc(c.name)}</h1><p class="lead">${esc(c.purpose)}</p>${safety}<div class="component-meta"><div><strong>Location</strong><p>${esc(c.location)}</p></div><div><strong>How it works</strong><p>${esc(c.operation)}</p></div></div><h2>Tests</h2><ol class="test-list">${c.tests.map(x=>`<li>${esc(x)}</li>`).join("")}</ol><h2>Common faults</h2><ul class="test-list">${c.faults.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><h2>Maintenance</h2><ul class="test-list">${c.maintenance.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><h2>Connected components</h2><div class="connection-list">${related.map(r=>`<div class="connection"><button class="btn gas-link" data-id="${esc(r.from)}">${esc(gasName(r.from))}</button><div class="connection-arrow">${esc(r.label)} →</div><button class="btn gas-link" data-id="${esc(r.to)}">${esc(gasName(r.to))}</button></div>`).join("")||"<p>No recorded connections.</p>"}</div><h2>Related chapters</h2><p>${c.chapters.map(n=>`<button class="btn gas-chapter" data-n="${n}">Chapter ${n}</button>`).join(" ")}</p><h2>Official manual pages</h2><p>${c.officialPages.map(n=>`<button class="btn gas-page" data-p="${n}">PDF page ${n}</button>`).join(" ")}</p><div class="tag-list">${c.tags.map(t=>`<span>${esc(t)}</span>`).join("")}</div></article>`;
  qsa(".gas-link").forEach(b=>b.addEventListener("click",()=>openGasComponent(b.dataset.id)));
  qsa(".gas-chapter").forEach(b=>b.addEventListener("click",()=>location.hash=`chapter/${b.dataset.n}`));
  qsa(".gas-page").forEach(b=>b.addEventListener("click",()=>location.hash=`manual/${b.dataset.p}`));
  show("gasComponent");
}
qs("#backGas").addEventListener("click",()=>location.hash="gas");
function startGasDiagnostic(id){
  const flow=DATA.gasDiagnostics.find(x=>x.id===id);if(!flow)return;let index=0;const box=qs("#gasDiagBox");
  const step=()=>{const s=flow.steps[index];box.innerHTML=`<div class="wizard-step"><h2>${esc(flow.title)}</h2><p>${esc(s.q)}</p><div class="wizard-actions"><button class="btn primary" id="gdYes">Yes</button><button class="btn accent" id="gdNo">No</button><button class="btn" id="gdChapter">Open chapter ${flow.chapter}</button></div></div>`;qs("#gdYes").onclick=()=>respond(s.yes);qs("#gdNo").onclick=()=>respond(s.no);qs("#gdChapter").onclick=()=>location.hash=`chapter/${flow.chapter}`};
  const respond=target=>{if(typeof target==="number"){index=target;step()}else{box.innerHTML=`<div class="answer"><strong>Recommended next action</strong><p>${esc(target)}</p><button class="btn primary" id="gdRestart">Start again</button> <button class="btn" id="gdChapter">Open related chapter</button></div>`;qs("#gdRestart").onclick=()=>startGasDiagnostic(id);qs("#gdChapter").onclick=()=>location.hash=`chapter/${flow.chapter}`}};
  step();
}
function renderGasSearch(){const input=qs("#gasSearchInput");if(!input)return;input.addEventListener("input",()=>searchGas(input.value))}
function searchGas(query){
  const q=query.trim().toLowerCase(),out=qs("#gasSearchResults");
  if(q.length<2){out.innerHTML='<div class="card muted">Enter two or more characters.</div>';return}
  const comps=DATA.gas.filter(c=>JSON.stringify(c).toLowerCase().includes(q));
  const symptoms=DATA.gasSymptoms.filter(s=>JSON.stringify(s).toLowerCase().includes(q));
  out.innerHTML=`<p class="muted">${comps.length} components and ${symptoms.length} symptoms found.</p>`+
  comps.map(c=>`<div class="gas-result"><strong>${esc(c.name)}</strong><p>${esc(c.purpose)}</p><button class="btn primary gas-open-result" data-id="${esc(c.id)}">Open component</button></div>`).join("")+
  symptoms.map(s=>`<div class="gas-result"><strong>Symptom: ${esc(s.symptom)}</strong><p>${s.components.map(gasName).map(esc).join(", ")}</p><button class="btn gas-diagnostic-result" data-id="${esc(s.diagnostic)}">Start diagnostic</button></div>`).join("")||'<div class="card muted">No matches.</div>';
  qsa(".gas-open-result").forEach(b=>b.addEventListener("click",()=>openGasComponent(b.dataset.id)));
  qsa(".gas-diagnostic-result").forEach(b=>b.addEventListener("click",()=>{location.hash="gas";setTimeout(()=>startGasDiagnostic(b.dataset.id),0)}));
}


function renderVehicleExplorer(){
  qsa(".explorer-view-btn").forEach(b=>b.addEventListener("click",()=>{explorerView=b.dataset.explorerView;drawExplorer()}));
  drawExplorer();
}
function drawExplorer(){
  const outline=qs("#vehicleOutline"),spots=qs("#vehicleHotspots");
  if(!outline||!spots)return;
  outline.className=`vehicle-outline ${explorerView}`;
  qsa(".explorer-view-btn").forEach(b=>b.classList.toggle("primary",b.dataset.explorerView===explorerView));
  const zones=DATA.vehicleExplorer.filter(z=>z.view===explorerView);
  spots.innerHTML=zones.map(z=>`<button class="vehicle-hotspot" data-id="${esc(z.id)}" style="left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%">${esc(z.label)}</button>`).join("");
  qsa(".vehicle-hotspot").forEach(b=>b.addEventListener("click",()=>showExplorerZone(b.dataset.id)));
  qs("#explorerDetails").innerHTML=zones.map(z=>`<article class="card explorer-card"><strong>${esc(z.name)}</strong><p class="muted">${esc(z.description)}</p><button class="btn open-zone" data-id="${esc(z.id)}">Open</button></article>`).join("");
  qsa(".open-zone").forEach(b=>b.addEventListener("click",()=>showExplorerZone(b.dataset.id)));
}
function showExplorerZone(id){
  const z=DATA.vehicleExplorer.find(x=>x.id===id);if(!z)return;
  qsa(".vehicle-hotspot").forEach(b=>b.classList.toggle("active",b.dataset.id===id));
  qs("#explorerDetails").innerHTML=`<article class="article"><h2>${esc(z.name)}</h2><p class="lead">${esc(z.description)}</p><div class="component-meta"><div><strong>System</strong><p>${esc(z.system)}</p></div><div><strong>Linked item</strong><p>${esc(z.label)}</p></div></div><p>${z.component?`<button class="btn primary" id="openExplorerComponent">Open component</button>`:""} ${z.system==="electrical"?'<button class="btn" data-jump="electrical">Electrical workshop</button>':""} ${z.system==="water"?'<button class="btn" data-jump="water">Water system</button>':""} ${z.system==="gas"?'<button class="btn" data-jump="gas">Gas and heating</button>':""}</p><h3>Related chapters</h3><p>${z.chapters.map(n=>`<button class="btn explorer-chapter" data-n="${n}">Chapter ${n}</button>`).join(" ")}</p><h3>Official manual pages</h3><p>${z.manualPages.map(n=>`<button class="btn explorer-page" data-p="${n}">PDF page ${n}</button>`).join(" ")}</p></article>`;
  if(z.component){
    const btn=qs("#openExplorerComponent");
    btn.addEventListener("click",()=>{if(z.system==="electrical")openElectricalComponent(z.component);else if(z.system==="water")openWaterComponent(z.component);else if(z.system==="gas")openGasComponent(z.component)});
  }
  qsa("[data-jump]").forEach(b=>b.addEventListener("click",()=>location.hash=b.dataset.jump));
  qsa(".explorer-chapter").forEach(b=>b.addEventListener("click",()=>location.hash=`chapter/${b.dataset.n}`));
  qsa(".explorer-page").forEach(b=>b.addEventListener("click",()=>location.hash=`manual/${b.dataset.p}`));
}
function renderWorkshopMode(){
  qsa(".workshop-button").forEach(b=>b.addEventListener("click",()=>location.hash=b.dataset.view));
  const steps=["Identify the component","Isolate energy sources","Photograph before work","Complete the test or repair","Inspect connections","Restore supplies","Function test","Record the result"];
  qs("#workshopSteps").innerHTML=steps.map((s,i)=>`<label class="check"><input type="checkbox" class="workshop-step" data-i="${i}" ${state.workshopSteps[i]?"checked":""}><span>${esc(s)}</span></label>`).join("");
  qsa(".workshop-step").forEach(c=>c.addEventListener("change",()=>{state.workshopSteps[c.dataset.i]=c.checked;save()}));
}
qs("#resetWorkshopSteps").addEventListener("click",()=>{state.workshopSteps={};save();renderWorkshopMode()});
qs("#keepScreenAwake").addEventListener("change",async e=>{
  try{
    if(e.target.checked&&"wakeLock" in navigator){wakeLock=await navigator.wakeLock.request("screen");qs("#wakeStatus").textContent="Screen wake lock is active.";document.body.classList.add("workshop-mode-active")}
    else{if(wakeLock){await wakeLock.release();wakeLock=null}qs("#wakeStatus").textContent="Screen wake lock is off.";document.body.classList.remove("workshop-mode-active");e.target.checked=false}
  }catch(err){qs("#wakeStatus").textContent="Wake lock is unavailable in this browser.";e.target.checked=false}
});
document.addEventListener("visibilitychange",async()=>{if(document.visibilityState==="visible"&&qs("#keepScreenAwake")?.checked&&"wakeLock" in navigator){try{wakeLock=await navigator.wakeLock.request("screen")}catch(e){}}});

function addMonths(date,months){const d=new Date(date);d.setMonth(d.getMonth()+months);return d}
function daysUntil(date){return Math.ceil((new Date(date)-new Date())/86400000)}
function maintenanceStatus(task){
  const rec=state.maintenance[task.id]||{};
  let dueDate=rec.lastDate&&task.intervalMonths?addMonths(rec.lastDate,task.intervalMonths):null;
  let dueKm=rec.lastMileage!==undefined&&task.intervalKm?Number(rec.lastMileage)+task.intervalKm:null;
  const dateDays=dueDate?daysUntil(dueDate):null;
  const kmLeft=dueKm!==null?dueKm-Number(state.currentMileage||0):null;
  let status="Not set",cls="";
  if(dateDays!==null||kmLeft!==null){
    const overdue=(dateDays!==null&&dateDays<0)||(kmLeft!==null&&kmLeft<0);
    const soon=(dateDays!==null&&dateDays<=30)||(kmLeft!==null&&kmLeft<=1000);
    status=overdue?"Overdue":soon?"Due soon":"Current";cls=overdue?"due-overdue":soon?"due-soon":"due-ok";
  }
  return {status,cls,dueDate,dueKm,dateDays,kmLeft};
}
function renderMaintenanceCentre(){
  if(!state.inventory?.length)state.inventory=DATA.partsSeed.map(x=>({...x}));
  qs("#maintenanceMileage").value=state.currentMileage||"";
  const tasks=DATA.maintenanceTasks;
  const statuses=tasks.map(t=>maintenanceStatus(t));
  const overdue=statuses.filter(s=>s.status==="Overdue").length,dueSoon=statuses.filter(s=>s.status==="Due soon").length;
  const fixed=(state.faults||[]).filter(f=>f.status==="Fixed").length,open=(state.faults||[]).filter(f=>f.status!=="Fixed").length;
  qs("#maintenanceSummary").innerHTML=`<div class="card"><div class="metric">${overdue}</div><strong>Overdue tasks</strong></div><div class="card"><div class="metric">${dueSoon}</div><strong>Due soon</strong></div><div class="card"><div class="metric">${open}</div><strong>Open faults</strong></div><div class="card"><div class="metric">${fixed}</div><strong>Fixed faults</strong></div>`;
  const filter=qs("#maintenanceFilter").value;
  const rows=tasks.filter(t=>{const s=maintenanceStatus(t).status;return filter==="All"||filter==="Due"&&s==="Due soon"||filter==="Overdue"&&s==="Overdue"||filter==="Completed"&&state.maintenance[t.id]?.lastDate});
  qs("#maintenanceTaskList").innerHTML=rows.map(t=>{const rec=state.maintenance[t.id]||{},s=maintenanceStatus(t);return `<article class="maintenance-task"><div class="maintenance-head"><div><h2>${esc(t.name)}</h2><p class="muted">${esc(t.category)} · ${t.intervalMonths?`${t.intervalMonths} months`:""}${t.intervalKm?` · ${t.intervalKm.toLocaleString()} km`:""}</p></div><span class="due-pill ${s.cls}">${esc(s.status)}</span></div><div class="formgrid"><label>Last completed<input class="control task-date" type="date" data-id="${t.id}" value="${esc(rec.lastDate||"")}"></label><label>Mileage<input class="control task-mileage" type="number" data-id="${t.id}" value="${esc(rec.lastMileage??"")}"></label><label>Notes<input class="control task-notes" data-id="${t.id}" value="${esc(rec.notes||"")}"></label></div><p><button class="btn primary complete-task" data-id="${t.id}">Mark completed today</button> <button class="btn open-task-chapter" data-n="${t.chapter}">Open chapter ${t.chapter}</button></p>${s.dueDate?`<p class="muted">Date due: ${s.dueDate.toLocaleDateString()}${s.dueKm?` · Mileage due: ${s.dueKm.toLocaleString()} km`:""}</p>`:""}</article>`}).join("");
  qsa(".task-date,.task-mileage,.task-notes").forEach(el=>el.addEventListener("change",()=>{state.maintenance[el.dataset.id]=state.maintenance[el.dataset.id]||{};const key=el.classList.contains("task-date")?"lastDate":el.classList.contains("task-mileage")?"lastMileage":"notes";state.maintenance[el.dataset.id][key]=el.value;save();renderMaintenanceCentre()}));
  qsa(".complete-task").forEach(b=>b.addEventListener("click",()=>{state.maintenance[b.dataset.id]={...(state.maintenance[b.dataset.id]||{}),lastDate:new Date().toISOString().slice(0,10),lastMileage:Number(state.currentMileage||0)};save();renderMaintenanceCentre()}));
  qsa(".open-task-chapter").forEach(b=>b.addEventListener("click",()=>location.hash=`chapter/${b.dataset.n}`));
}
qs("#saveMaintenanceMileage").addEventListener("click",()=>{state.currentMileage=Number(qs("#maintenanceMileage").value||0);save();renderMaintenanceCentre()});
qs("#maintenanceFilter").addEventListener("change",renderMaintenanceCentre);
function renderFaults(){
  const list=qs("#faultList");if(!list)return;
  list.innerHTML=(state.faults||[]).length?state.faults.slice().reverse().map((f,r)=>{const i=state.faults.length-1-r;return `<article class="fault-card ${f.status==="Fixed"?"fault-fixed":"fault-open"}"><div class="maintenance-head"><div><h2>${esc(f.title)}</h2><p class="muted">${esc(f.system)} · ${esc(f.date)} · ${esc(f.status)}</p></div><button class="btn delete-fault" data-i="${i}">Delete</button></div><p><strong>Symptoms</strong><br>${esc(f.symptoms)}</p><p><strong>Diagnosis and repair</strong><br>${esc(f.repair||"Not recorded")}</p><p class="muted">${f.cost?`€${Number(f.cost).toFixed(2)} · `:""}${esc(f.time||"")}</p><select class="control fault-status-edit" data-i="${i}"><option ${f.status==="Open"?"selected":""}>Open</option><option ${f.status==="Monitoring"?"selected":""}>Monitoring</option><option ${f.status==="Fixed"?"selected":""}>Fixed</option><option ${f.status==="Recurring"?"selected":""}>Recurring</option></select></article>`}).join(""):'<div class="card muted">No faults recorded.</div>';
  qsa(".delete-fault").forEach(b=>b.addEventListener("click",()=>{state.faults.splice(Number(b.dataset.i),1);save();renderFaults();renderMaintenanceCentre()}));
  qsa(".fault-status-edit").forEach(s=>s.addEventListener("change",()=>{state.faults[Number(s.dataset.i)].status=s.value;save();renderFaults();renderMaintenanceCentre()}));
}
qs("#addFault").addEventListener("click",()=>{const title=qs("#faultTitle").value.trim();if(!title)return alert("Enter a fault title.");state.faults.push({title,system:qs("#faultSystem").value,status:qs("#faultStatus").value,date:qs("#faultDate").value||new Date().toISOString().slice(0,10),symptoms:qs("#faultSymptoms").value.trim(),repair:qs("#faultRepair").value.trim(),cost:qs("#faultCost").value,time:qs("#faultTime").value});save();["#faultTitle","#faultSymptoms","#faultRepair","#faultCost","#faultTime"].forEach(id=>qs(id).value="");renderFaults();renderMaintenanceCentre()});
function renderInventory(filter=""){
  if(!state.inventory?.length)state.inventory=DATA.partsSeed.map(x=>({...x}));
  const q=filter.toLowerCase();const rows=state.inventory.filter(p=>!q||JSON.stringify(p).toLowerCase().includes(q));
  qs("#inventoryBody").innerHTML=rows.map((p,i)=>`<tr><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td class="${Number(p.qty)<=1?"inventory-low":""}">${esc(p.qty)}</td><td>${esc(p.system)}</td><td>${esc(p.notes)}</td><td><button class="btn inventory-minus" data-id="${esc(p.id)}">-1</button> <button class="btn inventory-plus" data-id="${esc(p.id)}">+1</button> <button class="btn inventory-delete" data-id="${esc(p.id)}">Delete</button></td></tr>`).join("");
  qsa(".inventory-minus").forEach(b=>b.addEventListener("click",()=>{const p=state.inventory.find(x=>x.id===b.dataset.id);p.qty=Math.max(0,Number(p.qty)-1);save();renderInventory(qs("#partSearch").value)}));
  qsa(".inventory-plus").forEach(b=>b.addEventListener("click",()=>{const p=state.inventory.find(x=>x.id===b.dataset.id);p.qty=Number(p.qty)+1;save();renderInventory(qs("#partSearch").value)}));
  qsa(".inventory-delete").forEach(b=>b.addEventListener("click",()=>{state.inventory=state.inventory.filter(x=>x.id!==b.dataset.id);save();renderInventory(qs("#partSearch").value)}));
}
qs("#partSearch").addEventListener("input",e=>renderInventory(e.target.value));
qs("#addPart").addEventListener("click",()=>{const name=qs("#partName").value.trim();if(!name)return alert("Enter a part name.");state.inventory.push({id:`user-${Date.now()}`,name,category:qs("#partCategory").value.trim(),qty:Number(qs("#partQty").value||0),system:qs("#partSystem").value,notes:qs("#partNotes").value.trim()});save();["#partName","#partCategory","#partQty","#partNotes"].forEach(id=>qs(id).value="");renderInventory()});

function diagScore(d,q){
  const text=(d.title+" "+d.keywords.join(" ")+" "+d.systems.join(" ")).toLowerCase();
  const words=q.toLowerCase().split(/\s+/).filter(x=>x.length>1);
  return words.reduce((n,w)=>n+(text.includes(w)?1:0),0);
}
function renderSmartDiagnostics(){
  const btn=qs("#smartDiagSearch");if(!btn)return;
  btn.addEventListener("click",()=>searchSmartDiagnostics(qs("#smartDiagInput").value));
  qs("#smartDiagAll").addEventListener("click",()=>showDiagnosticCards(DATA.smartDiagnostics));
  qs("#smartDiagInput").addEventListener("keydown",e=>{if(e.key==="Enter")searchSmartDiagnostics(e.target.value)});
  showDiagnosticCards(DATA.smartDiagnostics.slice(0,6));
}
function searchSmartDiagnostics(query){
  const q=query.trim();
  if(q.length<2){showDiagnosticCards(DATA.smartDiagnostics);return}
  const ranked=DATA.smartDiagnostics.map(d=>({d,score:diagScore(d,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.d);
  showDiagnosticCards(ranked.length?ranked:DATA.smartDiagnostics);
}
function showDiagnosticCards(items){
  const box=qs("#smartDiagResults");
  box.innerHTML=items.map(d=>`<article class="card diag-card"><h2>${esc(d.title)}</h2><div class="diag-systems">${d.systems.map(s=>`<span>${esc(s)}</span>`).join("")}</div><p class="muted">${esc(d.difficulty)} · ${esc(d.time)}</p><p>${esc(d.keywords.slice(0,3).join(" · "))}</p><button class="btn primary start-smart-diag" data-id="${esc(d.id)}">Start diagnosis</button></article>`).join("");
  qsa(".start-smart-diag").forEach(b=>b.addEventListener("click",()=>startSmartDiagnostic(b.dataset.id)));
}
function startSmartDiagnostic(id){
  const d=DATA.smartDiagnostics.find(x=>x.id===id);if(!d)return;
  let stepIndex=0;
  const runner=qs("#smartDiagRunner");
  const matching=(state.faults||[]).filter(f=>diagScore(d,(f.title||"")+" "+(f.symptoms||""))>0);
  const header=()=>`<article class="article"><h2>${esc(d.title)}</h2><div class="diag-systems">${d.systems.map(s=>`<span>${esc(s)}</span>`).join("")}</div><p><strong>Difficulty:</strong> ${esc(d.difficulty)} · <strong>Time:</strong> ${esc(d.time)}</p><div class="diag-warning"><strong>Safety</strong><ul>${d.safety.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div class="component-meta"><div><strong>Tools</strong><p>${esc(d.tools.join(", "))}</p></div><div><strong>Likely parts</strong><p>${esc(d.parts.join(", "))}</p></div></div>${matching.length?`<div class="card history-match"><strong>Previous matching faults</strong><p>${matching.map(f=>esc(f.title+" — "+f.status)).join("<br>")}</p></div>`:""}</article>`;
  const draw=()=>{
    const s=d.steps[stepIndex];
    runner.innerHTML=header()+`<div class="diag-step"><p class="muted">Check ${stepIndex+1} of ${d.steps.length}</p><h2>${esc(s.q)}</h2><p><button class="btn primary" id="smartYes">Yes</button> <button class="btn accent" id="smartNo">No</button> <button class="btn" id="smartStop">Stop</button></p></div>`;
    qs("#smartYes").onclick=()=>respond(s.yes);
    qs("#smartNo").onclick=()=>respond(s.no);
    qs("#smartStop").onclick=()=>runner.innerHTML="";
    runner.scrollIntoView({behavior:"smooth",block:"start"});
  };
  const respond=target=>{
    if(typeof target==="number"){stepIndex=target;draw();return}
    runner.innerHTML=header()+`<div class="answer"><strong>Recommended next action</strong><p>${esc(target)}</p><div class="diag-links"><button class="btn primary" id="diagRestart">Start again</button><button class="btn" id="diagChapter">Chapter ${d.chapter}</button><button class="btn" id="diagManual">Manual page ${d.manualPages[0]}</button><button class="btn" id="diagExplorer">Vehicle explorer</button><button class="btn" id="diagFault">Record as fault</button></div></div>`;
    qs("#diagRestart").onclick=()=>startSmartDiagnostic(id);
    qs("#diagChapter").onclick=()=>location.hash=`chapter/${d.chapter}`;
    qs("#diagManual").onclick=()=>location.hash=`manual/${d.manualPages[0]}`;
    qs("#diagExplorer").onclick=()=>{location.hash="vehicleExplorer";setTimeout(()=>showExplorerZone(d.explorerZone),50)};
    qs("#diagFault").onclick=()=>{location.hash="faultTracker";setTimeout(()=>{qs("#faultTitle").value=d.title;qs("#faultSymptoms").value=qs("#smartDiagInput").value||d.keywords[0];qs("#faultRepair").value=target;},50)};
  };
  draw();
}


function assistantTokens(text){
  return String(text||"").toLowerCase().replace(/[^a-z0-9\s-]/g," ").split(/\s+/).filter(w=>w.length>2);
}
function assistantScore(text,tokens){
  const hay=String(text||"").toLowerCase();
  return tokens.reduce((score,t)=>score+(hay.includes(t)?(t.length>6?3:2):0),0);
}
function assistantIndex(){
  const docs=[];
  (DATA.chapters||[]).forEach(c=>docs.push({type:"chapter",id:c.n,title:`Chapter ${c.n}. ${c.title}`,text:`${c.title} ${c.summary}`,action:`chapter/${c.n}`}));
  (DATA.pages||[]).forEach((p,i)=>docs.push({type:"manual",id:i+1,title:`Official manual page ${i+1}`,text:typeof p==="string"?p:JSON.stringify(p),action:`manual/${i+1}`}));
  (DATA.smartDiagnostics||[]).forEach(d=>docs.push({type:"diagnostic",id:d.id,title:d.title,text:`${d.title} ${(d.keywords||[]).join(" ")} ${(d.systems||[]).join(" ")} ${(d.safety||[]).join(" ")} ${(d.tools||[]).join(" ")} ${(d.parts||[]).join(" ")}`,diagnostic:d}));
  (DATA.electrical||[]).forEach((x,i)=>docs.push({type:"component",id:`electrical-${i}`,title:x.name||x.title||"Electrical component",text:JSON.stringify(x),action:"electrical"}));
  (DATA.water||[]).forEach((x,i)=>docs.push({type:"component",id:`water-${i}`,title:x.name||x.title||"Water component",text:JSON.stringify(x),action:"water"}));
  (DATA.gas||[]).forEach((x,i)=>docs.push({type:"component",id:`gas-${i}`,title:x.name||x.title||"Gas or heating component",text:JSON.stringify(x),action:"gas"}));
  (DATA.maintenanceTasks||[]).forEach(x=>docs.push({type:"maintenance",id:x.id,title:x.title||x.name||"Maintenance task",text:JSON.stringify(x),action:"maintenanceCentre"}));
  (state.faults||[]).forEach((x,i)=>docs.push({type:"fault",id:i,title:x.title||"Recorded fault",text:JSON.stringify(x),action:"faultTracker"}));
  (state.logs||[]).forEach((x,i)=>docs.push({type:"history",id:i,title:`Service record: ${x.category||"work completed"}`,text:JSON.stringify(x),action:"service"}));
  (state.inventory||[]).forEach((x,i)=>docs.push({type:"inventory",id:i,title:x.name||"Inventory item",text:JSON.stringify(x),action:"partsInventory"}));
  return docs;
}
function assistantIntent(q){
  const s=q.toLowerCase();
  if(/ready|leave|depart|trip readiness|safe to travel/.test(s))return"readiness";
  if(/due|maintenance|service|overdue/.test(s))return"maintenance";
  if(/open fault|recurring fault|fault history|previous fault/.test(s))return"faults";
  if(/low stock|inventory|spare|part/.test(s))return"inventory";
  if(/where|location|find.*component|show me/.test(s))return"location";
  if(/why|not work|won't|doesn't|fault|problem|broken|stops|running continuously/.test(s))return"diagnostic";
  return"search";
}
function readinessSnapshot(){
  const faults=(state.faults||[]).filter(f=>!["fixed","closed"].includes(String(f.status||"").toLowerCase()));
  const low=(state.inventory||[]).filter(p=>Number(p.qty||p.quantity||0)<=Number(p.minimum||p.minQty||1));
  const overdue=Object.values(state.maintenance||{}).filter(x=>x&&x.status==="overdue").length;
  const departure=state.departure||{};
  const done=Object.values(departure).filter(Boolean).length, total=Math.max(Object.keys(departure).length,1);
  return {faults,low,overdue,done,total};
}
function assistantAnswerQuestion(question){
  const q=question.trim();
  if(!q)return;
  const intent=assistantIntent(q), tokens=assistantTokens(q), docs=assistantIndex();
  const ranked=docs.map(d=>({...d,score:assistantScore(`${d.title} ${d.text}`,tokens)})).filter(d=>d.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
  let summary="",special="";
  if(intent==="readiness"){
    const r=readinessSnapshot();
    const ready=r.faults.length===0&&r.overdue===0&&r.low.length===0;
    summary=ready?"No blocking issues were found in your saved records. Complete the physical departure checks before driving.":`Your saved records show ${r.faults.length} open fault(s), ${r.overdue} overdue maintenance item(s) and ${r.low.length} low-stock item(s). Review these before departure.`;
    special=`<div class="readiness-grid"><div class="readiness-item"><strong>${r.faults.length}</strong>Open faults</div><div class="readiness-item"><strong>${r.overdue}</strong>Overdue tasks</div><div class="readiness-item"><strong>${r.low.length}</strong>Low-stock parts</div><div class="readiness-item"><strong>${r.done}/${r.total}</strong>Departure checks</div></div>`;
  }else if(intent==="faults"){
    const open=(state.faults||[]).filter(f=>!["fixed","closed"].includes(String(f.status||"").toLowerCase()));
    summary=open.length?`I found ${open.length} unresolved fault record(s).`:"There are no unresolved faults in the local Fault Tracker.";
  }else if(intent==="inventory"){
    const low=(state.inventory||[]).filter(p=>Number(p.qty||p.quantity||0)<=Number(p.minimum||p.minQty||1));
    summary=low.length?`${low.length} inventory item(s) appear to be at or below their minimum quantity.`:"No low-stock item was identified from the quantities currently saved.";
  }else if(intent==="maintenance"){
    summary="I searched maintenance tasks, service records and related manual content. The strongest matches are listed below.";
  }else if(intent==="diagnostic"){
    const d=ranked.find(x=>x.type==="diagnostic");
    summary=d?`The closest guided diagnostic is “${d.title}”. Start it below and follow the safety warnings before testing.`:"I could not identify one exact guided diagnostic. Review the closest manual and component results below.";
  }else if(intent==="location"){
    summary="I searched component records, chapters and Vehicle Explorer references for the requested location.";
  }else{
    summary=ranked.length?`I found ${ranked.length} relevant local result(s) across the installed companion data.`:"No strong local match was found. Try including the appliance, symptom or system name.";
  }
  const results=ranked.map(r=>{
    let actions="";
    if(r.type==="diagnostic") actions=`<button class="btn primary assistant-open-diag" data-id="${esc(r.id)}">Start diagnostic</button>`;
    else if(r.action) actions=`<button class="btn primary assistant-open-link" data-link="${esc(r.action)}">Open</button>`;
    return `<div class="answer-result"><span class="answer-confidence">${esc(r.type)} · score ${r.score}</span><h3>${esc(r.title)}</h3><p>${esc(String(r.text).slice(0,220))}</p><div class="answer-actions">${actions}</div></div>`;
  }).join("");
  qs("#assistantAnswer").innerHTML=`<article class="card assistant-answer"><h2>Assistant response</h2><p class="answer-summary">${esc(summary)}</p>${special}<div class="answer-section"><h3>Relevant records and references</h3><div class="answer-list">${results||'<div class="answer-result">No matching records.</div>'}</div></div><p class="muted">This offline assistant uses the installed companion data and records stored on this device. Confirm safety-critical work with the appliance manual or a qualified technician.</p></article>`;
  qsa(".assistant-open-link").forEach(b=>b.onclick=()=>location.hash=b.dataset.link);
  qsa(".assistant-open-diag").forEach(b=>b.onclick=()=>{location.hash="smartDiagnostics";setTimeout(()=>startSmartDiagnostic(b.dataset.id),50)});
  state.assistantHistory=state.assistantHistory||[];
  state.assistantHistory.unshift({question:q,at:new Date().toISOString(),intent});
  state.assistantHistory=state.assistantHistory.slice(0,20);save();renderAssistantHistory();
}
function renderAssistantHistory(){
  const box=qs("#assistantHistory");if(!box)return;
  const rows=state.assistantHistory||[];
  box.innerHTML=rows.length?rows.map((h,i)=>`<div class="assistant-history-row"><div><strong>${esc(h.question)}</strong><div class="muted">${new Date(h.at).toLocaleString()}</div></div><button class="btn assistant-repeat" data-i="${i}">Ask again</button></div>`).join(""):'<p class="muted">No questions asked yet.</p>';
  qsa(".assistant-repeat").forEach(b=>b.onclick=()=>{const h=rows[Number(b.dataset.i)];qs("#assistantInput").value=h.question;assistantAnswerQuestion(h.question)});
}
function renderUnifiedAssistant(){
  const ask=qs("#assistantAsk");if(!ask)return;
  qs("#assistantPrompts").innerHTML=(DATA.assistantPrompts||[]).map(p=>`<button class="prompt-card assistant-prompt" data-prompt="${esc(p.prompt)}"><strong>${esc(p.title)}</strong><span>${esc(p.prompt)}</span></button>`).join("");
  qsa(".assistant-prompt").forEach(b=>b.onclick=()=>{qs("#assistantInput").value=b.dataset.prompt;assistantAnswerQuestion(b.dataset.prompt)});
  ask.onclick=()=>assistantAnswerQuestion(qs("#assistantInput").value);
  qs("#assistantInput").addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")assistantAnswerQuestion(e.target.value)});
  qs("#clearAssistantHistory").onclick=()=>{state.assistantHistory=[];save();renderAssistantHistory()};
  renderAssistantHistory();
}


const BACKUP_SCHEMA_VERSION=2;
function notify(message,type="info"){
  let stack=qs(".toast-stack");
  if(!stack){stack=document.createElement("div");stack.className="toast-stack";stack.setAttribute("aria-live","polite");document.body.appendChild(stack)}
  const el=document.createElement("div");el.className=`toast ${type}`;el.textContent=message;stack.appendChild(el);
  setTimeout(()=>el.remove(),4200);
}
window.addEventListener("error",e=>{console.error(e.error||e.message);notify("A screen error was contained. Your saved data was not changed.","error")});
window.addEventListener("unhandledrejection",e=>{console.error(e.reason);notify("A background operation failed safely.","error")});

function safeStateDefaults(){
  return {theme:"dark",logs:[],maintenance:{},departure:{},upgradeProjects:[],currentMileage:0,faults:[],inventory:[],assistantHistory:[]};
}
function validateLocalState(candidate){
  const errors=[],warnings=[];
  if(!candidate||typeof candidate!=="object"||Array.isArray(candidate))errors.push("Root data must be an object.");
  const s=candidate&&typeof candidate==="object"?candidate:{};
  ["logs","upgradeProjects","faults","inventory","assistantHistory"].forEach(k=>{if(!Array.isArray(s[k]))errors.push(`${k} must be a list.`)});
  ["maintenance","departure"].forEach(k=>{if(!s[k]||typeof s[k]!=="object"||Array.isArray(s[k]))errors.push(`${k} must be an object.`)});
  if(s.currentMileage!==undefined&&!Number.isFinite(Number(s.currentMileage)))warnings.push("Current mileage was not numeric.");
  if(s.theme!==undefined&&!["dark","light"].includes(s.theme))warnings.push("Theme preference was not recognised.");
  return {valid:errors.length===0,errors,warnings};
}
function repairState(candidate){
  const defaults=safeStateDefaults(), source=(candidate&&typeof candidate==="object"&&!Array.isArray(candidate))?candidate:{};
  const repaired={...defaults,...source};
  ["logs","upgradeProjects","faults","inventory","assistantHistory"].forEach(k=>{if(!Array.isArray(repaired[k]))repaired[k]=[]});
  ["maintenance","departure"].forEach(k=>{if(!repaired[k]||typeof repaired[k]!=="object"||Array.isArray(repaired[k]))repaired[k]={}});
  repaired.currentMileage=Number.isFinite(Number(repaired.currentMileage))?Number(repaired.currentMileage):0;
  repaired.theme=["dark","light"].includes(repaired.theme)?repaired.theme:"dark";
  return repaired;
}
function backupPayload(){
  return {
    app:"Knaus Companion Ultimate",
    appVersion:APP_VERSION,
    schemaVersion:BACKUP_SCHEMA_VERSION,
    exportedAt:new Date().toISOString(),
    state:repairState(state)
  };
}
function downloadJSON(filename,obj){
  const blob=new Blob([JSON.stringify(obj,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function stateCounts(s){
  return {
    service:Array.isArray(s.logs)?s.logs.length:0,
    faults:Array.isArray(s.faults)?s.faults.length:0,
    inventory:Array.isArray(s.inventory)?s.inventory.length:0,
    projects:Array.isArray(s.upgradeProjects)?s.upgradeProjects.length:0,
    questions:Array.isArray(s.assistantHistory)?s.assistantHistory.length:0
  };
}
async function runBuildIntegrity(){
  const summary=qs("#integritySummary"),box=qs("#integrityChecks");
  summary.textContent="Checking installed files…";box.innerHTML="";
  try{
    const manifest=await loadJSON("data/integrity.json");
    const checks=[];
    const chapterCount=(DATA.chapters||[]).length;
    const pageCount=(DATA.pages||[]).length;
    checks.push({label:"Companion chapters",ok:chapterCount>=Number(manifest.minimums?.chapters||44),value:`${chapterCount} loaded`});
    checks.push({label:"Manual pages",ok:pageCount>=Number(manifest.minimums?.manualPages||286),value:`${pageCount} loaded`});
    checks.push({label:"Assistant prompts",ok:(DATA.assistantPrompts||[]).length>=Number(manifest.minimums?.assistantPrompts||8),value:`${(DATA.assistantPrompts||[]).length} loaded`});
    for(const file of (manifest.requiredData||[])){
      let ok=false;try{const r=await fetch(file,{cache:"no-store"});ok=r.ok}catch(_){}
      checks.push({label:file,ok,value:ok?"available":"missing"});
    }
    const passed=checks.filter(x=>x.ok).length;
    summary.textContent=passed===checks.length?`All ${passed} integrity checks passed.`:`${passed} of ${checks.length} integrity checks passed.`;
    box.innerHTML=checks.map(c=>`<div class="health-check"><span>${esc(c.label)}</span><span class="${c.ok?"health-ok":"health-fail"}">${esc(c.value)}</span></div>`).join("");
    return passed===checks.length;
  }catch(err){
    summary.textContent="Integrity manifest could not be loaded.";
    box.innerHTML=`<div class="health-check"><span>Manifest</span><span class="health-fail">unavailable</span></div>`;
    return false;
  }
}
function renderLocalDataHealth(){
  const result=validateLocalState(state),counts=stateCounts(repairState(state));
  qs("#localDataSummary").textContent=result.valid?"Local data structure is healthy.":"Local data needs repair.";
  const checks=[
    {label:"Service records",value:counts.service},
    {label:"Fault records",value:counts.faults},
    {label:"Inventory items",value:counts.inventory},
    {label:"Upgrade projects",value:counts.projects},
    {label:"Assistant questions",value:counts.questions}
  ];
  qs("#localDataChecks").innerHTML=checks.map(c=>`<div class="health-check"><span>${esc(c.label)}</span><span class="health-ok">${c.value}</span></div>`).join("")+
  result.errors.map(e=>`<div class="health-check"><span>${esc(e)}</span><span class="health-fail">repair required</span></div>`).join("")+
  result.warnings.map(e=>`<div class="health-check"><span>${esc(e)}</span><span class="health-warn">warning</span></div>`).join("");
}
async function restoreBackupFile(file){
  const text=await file.text();let payload;
  try{payload=JSON.parse(text)}catch(_){throw new Error("The selected file is not valid JSON.")}
  const candidate=payload&&payload.state?payload.state:payload;
  const validation=validateLocalState(candidate);
  if(!validation.valid)throw new Error(`Backup validation failed: ${validation.errors.join(" ")}`);
  downloadJSON(`knaus-safety-backup-${new Date().toISOString().slice(0,10)}.json`,backupPayload());
  state=repairState(candidate);save();notify("Backup restored and validated.","success");setTimeout(()=>location.reload(),500);
}
function renderSystemHealth(){
  const run=qs("#runIntegrityCheck");if(!run)return;
  run.onclick=async()=>{const ok=await runBuildIntegrity();notify(ok?"Build integrity checks passed.":"One or more integrity checks failed.",ok?"success":"error")};
  qs("#repairLocalData").onclick=()=>{state=repairState(state);save();renderLocalDataHealth();notify("Safe defaults repaired without deleting valid records.","success")};
  qs("#exportFullBackup").onclick=()=>{downloadJSON(`knaus-companion-backup-v${APP_VERSION}-${new Date().toISOString().slice(0,10)}.json`,backupPayload());qs("#backupStatus").textContent="Verified backup exported.";notify("Backup exported.","success")};
  qs("#restoreFullBackup").onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{await restoreBackupFile(file)}catch(err){qs("#backupStatus").textContent=err.message;notify(err.message,"error")}finally{e.target.value=""}};
  qs("#resetPreferences").onclick=()=>{
    if(!confirm("Reset interface preferences? Your service records, faults and inventory will remain."))return;
    const keep={...state};keep.theme="dark";keep.assistantHistory=[];state=repairState(keep);save();notify("Interface preferences reset.","success");setTimeout(()=>location.reload(),400);
  };
  qs("#resetAllLocalData").onclick=()=>{
    if(!confirm("This will reset all locally stored app data. A safety backup will download first. Continue?"))return;
    downloadJSON(`knaus-before-reset-${new Date().toISOString().slice(0,10)}.json`,backupPayload());
    state=safeStateDefaults();save();notify("Local data reset.","success");setTimeout(()=>location.reload(),500);
  };
  renderLocalDataHealth();
  setTimeout(runBuildIntegrity,250);
}

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    const sidebar=qs("#sidebar");if(sidebar)sidebar.classList.remove("open");
    const sheet=qs("#quickSheet");if(sheet)sheet.classList.remove("open");
    document.body.classList.remove("menu-open");
  }
});
window.addEventListener("hashchange",()=>{
  const sidebar=qs("#sidebar");if(sidebar)sidebar.classList.remove("open");
  document.body.classList.remove("menu-open");
});
