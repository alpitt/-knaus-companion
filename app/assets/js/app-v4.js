
const APP_VERSION="4.4.0";
const STORE_KEY="knaus-ultimate-v1";
const DEFAULT_STATE={theme:"light",logs:[],maintenance:{},departure:{},upgradeProjects:[],currentMileage:0,faults:[],inventory:[],assistantHistory:[],manualBookmarks:[],manualOcrVisible:false,diagnosticReports:[]};

const DATA={chapters:[],pages:[],diagnostics:[],maintenanceTasks:[],assistantPrompts:[],build:null,electrical:[],electricalRelations:[],water:[],waterRelations:[],gas:[],gasRelations:[],vehicleExplorer:[],campsites:[],touringChecks:[]};
let state=loadState();
let libraryMode="chapters";
let activeManualPage=1;
let activeChapterNumber=null;
let diagnosticFilter="all";
let activeDiagnosticSession=null;
let electricalFilter="all";
let activeElectricalComponent="calira-evs";
let waterFilter="all";
let activeWaterComponent="pump";
let gasFilter="all";
let activeGasComponent="gas-manifold";
let vehicleMapView="interior";
let activeVehicleHotspot="electrical-compartment";

function $(s,r=document){return r.querySelector(s)}
function $$(s,r=document){return [...r.querySelectorAll(s)]}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function sanitizeTrustedHtml(markup){
  const doc=new DOMParser().parseFromString(String(markup||""),"text/html");
  doc.querySelectorAll("script,iframe,object,embed,link,meta,style").forEach(n=>n.remove());
  doc.querySelectorAll("*").forEach(el=>{
    [...el.attributes].forEach(a=>{
      const name=a.name.toLowerCase();
      const value=String(a.value||"").trim().toLowerCase();
      if(name.startsWith("on")||name==="srcdoc"||((name==="href"||name==="src")&&value.startsWith("javascript:")))el.removeAttribute(a.name);
    });
  });
  return doc.body.innerHTML;
}
function padPage(n){return String(Number(n)||1).padStart(3,"0")}
function pageMeta(n){return DATA.pages.find(p=>Number(p.page)===Number(n))||{page:Number(n),title:`Official manual page ${n}`,text:""}}

function loadState(){try{return {...DEFAULT_STATE,...JSON.parse(localStorage.getItem(STORE_KEY)||"{}")}}catch{return {...DEFAULT_STATE}}}
function saveState(){localStorage.setItem(STORE_KEY,JSON.stringify(state))}
async function loadJSON(path,fallback=[]){try{const r=await fetch(path);if(!r.ok)throw new Error(path);return await r.json()}catch{return fallback}}
function toast(msg){const el=document.createElement("div");el.className="toast";el.textContent=msg;$("#toastHost").appendChild(el);setTimeout(()=>el.remove(),3500)}
function route(){return (location.hash.slice(1)||"home").split("/")[0]}
function navigate(id){location.hash=id}
function setActiveRoute(id){
  $$(".screen").forEach(s=>s.classList.toggle("active",s.dataset.screen===id));
  $$("[data-route]").forEach(b=>b.classList.toggle("active",b.dataset.route===id));
  $("#content").focus({preventScroll:true});scrollTo(0,0);closeDrawer();
}
function openDrawer(){$("#drawer").classList.add("open");$("#drawer").setAttribute("aria-hidden","false");$("#scrim").hidden=false;$("#menuButton").setAttribute("aria-expanded","true")}
function closeDrawer(){$("#drawer").classList.remove("open");$("#drawer").setAttribute("aria-hidden","true");$("#scrim").hidden=true;$("#menuButton").setAttribute("aria-expanded","false")}
function applyTheme(){document.documentElement.dataset.theme=state.theme==="dark"?"dark":"light"}

const NAV=[
  ["home","Home","⌂"],["assistant","Assistant","✦"],["search","Search","⌕"],["manuals","Manuals & chapters","▤"],
  ["maintenance","Service & maintenance","⚙"],["diagnostics","Diagnostics","✓"],["electrical","Electrical system","⚡"],["water","Water system","💧"],["gas","Gas system","🔥"],["touring","Touring","➜"],["vehicle","My motorhome","▣"],["settings","Settings","⋯"]
];
function renderNav(){
  $("#drawerNav").innerHTML=NAV.map(([id,label,icon])=>`<button data-route="${id}"><span>${icon}</span> ${label}</button>`).join("");
}
function moduleCard(id,icon,title,desc){return `<button class="module-card" data-route="${id}"><div class="icon">${icon}</div><h3>${title}</h3><p>${desc}</p></button>`}
function renderHome(){
  const openFaults=(state.faults||[]).filter(x=>!["fixed","closed"].includes(String(x.status||"").toLowerCase())).length;
  const services=(state.logs||[]).length;
  $("#statusGrid").innerHTML=[
    [APP_VERSION,"Current version"],[DATA.chapters.length||44,"Companion chapters"],[DATA.pages.length||286,"Manual pages"],[openFaults,"Open faults"],[services,"Service records"]
  ].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  $("#homeModules").innerHTML=[
    moduleCard("electrical","⚡","Electrical system","Trace 12 V, mains and planned upgrades"),
    moduleCard("water","💧","Water system","Follow fresh, hot and waste-water flow"),
    moduleCard("gas","🔥","Gas system","Trace supply, appliances and combustion safety"),
    moduleCard("vehicle","🚐","My motorhome","Systems, photos and upgrades"),
    moduleCard("manuals","📘","Manuals","Companion chapters and official pages"),
    moduleCard("diagnostics","🧰","Diagnostics","Guided checks for common problems"),
    moduleCard("maintenance","🔧","Maintenance","Tasks, service history and reminders"),
    moduleCard("touring","🗺️","Touring","Departure checks, campsites and packing"),
    moduleCard("settings","💾","Backup","Export, restore and recovery")
  ].join("");
}
function assistantIndex(){
  const docs=[];
  DATA.chapters.forEach(c=>docs.push({type:"chapter",title:`Chapter ${c.n}. ${c.title}`,text:`${c.title} ${c.summary||""}`,chapterNumber:c.n,raw:c}));
  DATA.pages.forEach(p=>docs.push({type:"manual",title:`Page ${p.page}. ${p.title||"Official manual"}`,text:p.text||"",page:Number(p.page),raw:p}));
  DATA.diagnostics.forEach(d=>docs.push({type:"diagnostic",title:d.title||"Diagnostic",text:JSON.stringify(d)}));
  DATA.maintenanceTasks.forEach(d=>docs.push({type:"maintenance",title:d.title||d.name||"Maintenance task",text:JSON.stringify(d)}));
  (state.logs||[]).forEach(d=>docs.push({type:"service record",title:d.title||d.category||"Service record",text:JSON.stringify(d)}));
  (state.faults||[]).forEach(d=>docs.push({type:"fault",title:d.title||"Fault record",text:JSON.stringify(d)}));
  return docs;
}
function searchDocs(q){
  const terms=q.toLowerCase().split(/\s+/).filter(x=>x.length>2);
  return assistantIndex().map(d=>{const hay=(d.title+" "+d.text).toLowerCase();return {...d,score:terms.reduce((n,t)=>n+(hay.includes(t)?1:0),0)}})
    .filter(d=>d.score>0).sort((a,b)=>b.score-a.score).slice(0,30);
}
function renderResults(target,items,empty="No matching results."){
  const root=$(target);
  if(!items.length){root.innerHTML=`<article class="panel"><p>${esc(empty)}</p></article>`;return}
  root.innerHTML=items.map((x,i)=>`<article class="result-card" data-result="${i}" tabindex="0" role="button"><span class="meta">${esc(x.type)}</span><h3>${esc(x.title)}</h3><p>${esc(String(x.text||"").slice(0,280))}</p><span class="open-hint">Tap to open</span></article>`).join("");
  root.querySelectorAll("[data-result]").forEach((el,i)=>{el.onclick=()=>openDetail(items[i]);el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(items[i])}}});
}
function renderAssistant(){
  const prompts=DATA.assistantPrompts.length?DATA.assistantPrompts:[
    {prompt:"Where is the boiler drain valve?"},{prompt:"What maintenance is due?"},{prompt:"Show open faults"},{prompt:"What should I check before leaving?"}
  ];
  $("#assistantPrompts").innerHTML=prompts.slice(0,8).map(p=>`<button class="chip" data-prompt="${esc(p.prompt)}">${esc(p.prompt)}</button>`).join("");
}
function askAssistant(){
  const q=$("#assistantInput").value.trim();if(!q)return;
  const results=searchDocs(q);renderResults("#assistantResults",results,"No strong local match was found.");
  state.assistantHistory.unshift({question:q,at:new Date().toISOString()});state.assistantHistory=state.assistantHistory.slice(0,20);saveState();
}
function renderLibrary(){
  const list=libraryMode==="chapters"
    ?DATA.chapters.map(c=>({type:"chapter",title:`Chapter ${c.n}. ${c.title}`,text:c.summary||"",chapterNumber:Number(c.n),raw:c}))
    :DATA.pages.map(p=>({type:"manual",title:`Page ${p.page}. ${p.title||"Official manual"}`,text:String(p.text||"").replace(/\s+/g," ").trim(),page:Number(p.page),raw:p}));
  renderResults("#libraryList",list);
}
function renderMaintenance(){
  const logs=state.logs||[];
  const tasks=DATA.maintenanceTasks||[];
  $("#maintenanceSummary").innerHTML=[
    [logs.length,"Service records"],[tasks.length,"Maintenance tasks"],[state.currentMileage||0,"Current km"]
  ].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  const items=logs.map(x=>({type:"service record",title:x.title||x.category||"Completed work",text:JSON.stringify(x)}));
  renderResults("#maintenanceList",items,"No service records have been added yet.");
}
function diagnosticSystems(){
  return [...new Set(DATA.diagnostics.flatMap(x=>Array.isArray(x.systems)?x.systems:[]).map(x=>String(x).toLowerCase()))].sort();
}
function diagnosticIcon(system){
  return ({electrical:"⚡",water:"💧",gas:"🔥",heating:"♨️",appliance:"🧊",body:"🚐",camera:"📷"}[String(system||"").toLowerCase()]||"🧰");
}
function renderDiagnostics(){
  const query=($("#diagnosticSearch")?.value||"").trim().toLowerCase();
  const systems=diagnosticSystems();
  $("#diagnosticFilters").innerHTML=[
    `<button class="chip ${diagnosticFilter==="all"?"active":""}" data-diagnostic-filter="all">All</button>`,
    ...systems.map(s=>`<button class="chip ${diagnosticFilter===s?"active":""}" data-diagnostic-filter="${esc(s)}">${diagnosticIcon(s)} ${esc(s[0].toUpperCase()+s.slice(1))}</button>`)
  ].join("");

  const filtered=DATA.diagnostics.filter(x=>{
    const matchesSystem=diagnosticFilter==="all"||(x.systems||[]).map(s=>String(s).toLowerCase()).includes(diagnosticFilter);
    const hay=[x.title,x.description,x.summary,(x.keywords||[]).join(" "),(x.systems||[]).join(" ")].join(" ").toLowerCase();
    return matchesSystem&&(!query||hay.includes(query));
  });

  $("#diagnosticSummary").innerHTML=[
    [DATA.diagnostics.length,"Guided diagnostics"],
    [systems.length,"Vehicle systems"],
    [(state.diagnosticReports||[]).length,"Saved reports"]
  ].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");

  if(!filtered.length){
    $("#diagnosticList").innerHTML=`<article class="panel"><h2>No matching diagnostic</h2><p>Try a broader symptom or choose All systems.</p></article>`;
    return;
  }

  $("#diagnosticList").innerHTML=filtered.map(x=>{
    const system=(x.systems||[])[0]||"vehicle";
    const safety=Array.isArray(x.safety)&&x.safety.length;
    return `<article class="diagnostic-card">
      <div class="diagnostic-card-icon" aria-hidden="true">${diagnosticIcon(system)}</div>
      <div class="diagnostic-card-body">
        <span class="meta">${esc((x.systems||["Vehicle"]).join(" • "))}</span>
        <h2>${esc(x.title||"Diagnostic")}</h2>
        <p>${esc(x.summary||x.description||`A guided ${x.steps?.length||0}-check decision tree.`)}</p>
        <div class="diagnostic-meta">
          ${x.difficulty?`<span>${esc(x.difficulty)}</span>`:""}
          ${x.time?`<span>${esc(x.time)}</span>`:""}
          <span>${x.steps?.length||0} checks</span>
          ${safety?`<span>Safety guidance</span>`:""}
        </div>
        <button class="primary-btn diagnostic-start" data-diagnostic-start="${esc(x.id)}">Start diagnosis</button>
      </div>
    </article>`;
  }).join("");
}
function renderTouring(){
  const cards=[
    ["departure","✅","Departure checks","Before leaving home or a campsite"],
    ["packing","🎒","Packing","Templates and essential equipment"],
    ["campsites","🏕️","Campsites","Saved campsite information"],
    ["travel-log","📝","Travel log","Record trips and useful notes"]
  ];
  $("#touringCards").innerHTML=cards.map(([id,icon,title,desc])=>`<button class="module-card" data-touring="${id}"><div class="icon">${icon}</div><h3>${title}</h3><p>${desc}</p></button>`).join("");
}

function detailList(title,items){
  if(!Array.isArray(items)||!items.length)return "";
  return `<section class="detail-section"><h3>${esc(title)}</h3><ol>${items.map(x=>`<li>${esc(typeof x==="string"?x:(x.step||x.text||x.title||x.name||JSON.stringify(x)))}</li>`).join("")}</ol></section>`;
}
function showDialog(type,title,html,wide=false){
  $("#detailType").textContent=type||"Details";
  $("#detailTitle").textContent=title||"Details";
  $("#detailBody").innerHTML=html||"<p>No additional details are available.</p>";
  $("#detailDialog").classList.toggle("reader-dialog",wide);
  const d=$("#detailDialog");
  if(d.open)return;
  if(typeof d.showModal==="function")d.showModal();else d.setAttribute("open","");
}
async function openChapter(number){
  const n=Number(number);
  activeChapterNumber=n;
  showDialog("Chapter",`Chapter ${n}`,'<div class="reader-loading">Loading complete chapter…</div>',true);
  const path=`chapters/${String(n).padStart(2,"0")}.json`;
  const chapter=await loadJSON(path,null);
  if(!chapter){
    $("#detailTitle").textContent=`Chapter ${n}`;
    $("#detailBody").innerHTML='<div class="data-warning">The complete chapter could not be loaded.</div>';
    return;
  }
  $("#detailTitle").textContent=`Chapter ${chapter.n}. ${chapter.title}`;
  const official=chapter.officialPage?`<button class="secondary-btn chapter-manual-link" data-manual-page="${Number(chapter.officialPage)}">Open official manual page ${Number(chapter.officialPage)}</button>`:"";
  $("#detailBody").innerHTML=`<div class="chapter-reader">
    <div class="chapter-summary">${esc(chapter.summary||"")}</div>
    ${official}
    <div class="chapter-content">${sanitizeTrustedHtml(chapter.content||"")}</div>
    <div class="reader-footer">
      <button class="secondary-btn" data-chapter-nav="${Math.max(1,n-1)}" ${n<=1?"disabled":""}>Previous chapter</button>
      <span>Chapter ${n} of ${DATA.chapters.length}</span>
      <button class="secondary-btn" data-chapter-nav="${Math.min(DATA.chapters.length,n+1)}" ${n>=DATA.chapters.length?"disabled":""}>Next chapter</button>
    </div>
  </div>`;
}
function manualReaderHtml(page){
  const p=pageMeta(page);
  const bookmarked=(state.manualBookmarks||[]).includes(Number(page));
  const cleanText=String(p.text||"").replace(/[\\u0000-\\u001f\\u007f]/g," ").replace(/\\s+\\n/g,"\\n").trim();
  return `<div class="manual-reader">
    <div class="manual-toolbar">
      <button class="secondary-btn" data-manual-nav="${Math.max(1,page-1)}" ${page<=1?"disabled":""}>‹ Previous</button>
      <label class="page-jump">Page <input id="manualPageInput" type="number" min="1" max="${DATA.pages.length}" value="${page}" inputmode="numeric"> of ${DATA.pages.length}</label>
      <button class="secondary-btn" data-manual-nav="${Math.min(DATA.pages.length,page+1)}" ${page>=DATA.pages.length?"disabled":""}>Next ›</button>
    </div>
    <div class="manual-actions">
      <button class="secondary-btn" id="manualZoomOut" aria-label="Zoom out">−</button>
      <button class="secondary-btn" id="manualZoomReset">Fit</button>
      <button class="secondary-btn" id="manualZoomIn" aria-label="Zoom in">+</button>
      <button class="secondary-btn" id="manualOcrToggle">${state.manualOcrVisible?"Hide":"Show"} OCR text</button>
      <button class="secondary-btn" id="manualBookmarkToggle">${bookmarked?"★ Bookmarked":"☆ Bookmark"}</button>
    </div>
    <div class="manual-page-stage" id="manualPageStage" aria-label="Manual page viewer. Pinch to zoom and drag to move.">
      <div class="manual-page-canvas" id="manualPageCanvas">
        <img id="manualPageImage" src="manual/pages/${padPage(page)}.jpg" alt="Official Knaus manual page ${page}" draggable="false">
      </div>
    </div>
    <p class="manual-gesture-hint">Pinch to zoom • Drag to move • Double-tap to zoom</p>
    <section class="manual-ocr" id="manualOcrPanel" ${state.manualOcrVisible?"":"hidden"}>
      <h3>${esc(p.title||`Official manual page ${page}`)}</h3>
      <pre>${esc(cleanText||"No OCR text is available for this page.")}</pre>
    </section>
    <div class="reader-footer">
      <button class="secondary-btn" data-manual-nav="${Math.max(1,page-1)}" ${page<=1?"disabled":""}>Previous page</button>
      <span>Official manual page ${page}</span>
      <button class="secondary-btn" data-manual-nav="${Math.min(DATA.pages.length,page+1)}" ${page>=DATA.pages.length?"disabled":""}>Next page</button>
    </div>
  </div>`;
}
function wireManualReader(){
  let scale=1;
  const minScale=1;
  const maxScale=4;
  const image=$("#manualPageImage");
  const stage=$("#manualPageStage");
  const canvas=$("#manualPageCanvas");
  const pointers=new Map();
  let baseWidth=0;
  let pinch=null;
  let drag=null;
  let lastTap=0;

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const fitWidth=()=>{
    const available=Math.max(240,stage.clientWidth-24);
    baseWidth=Math.min(900,available);
    canvas.style.width=`${baseWidth*scale}px`;
  };
  const applyScale=(next,anchor)=>{
    const oldScale=scale;
    scale=clamp(next,minScale,maxScale);
    const point=anchor||{x:stage.clientWidth/2,y:stage.clientHeight/2};
    const contentX=(stage.scrollLeft+point.x)/oldScale;
    const contentY=(stage.scrollTop+point.y)/oldScale;
    canvas.style.width=`${baseWidth*scale}px`;
    requestAnimationFrame(()=>{
      stage.scrollLeft=contentX*scale-point.x;
      stage.scrollTop=contentY*scale-point.y;
      stage.classList.toggle("zoomed",scale>1.01);
      $("#manualZoomReset").textContent=scale>1.01?`${Math.round(scale*100)}%`:"Fit";
    });
  };
  const resetView=()=>{
    scale=1;
    fitWidth();
    stage.scrollLeft=0;
    stage.scrollTop=0;
    stage.classList.remove("zoomed");
    $("#manualZoomReset").textContent="Fit";
  };
  const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

  image.addEventListener("load",resetView,{once:true});
  if(image.complete)resetView();

  $("#manualZoomIn").onclick=()=>applyScale(scale+.25);
  $("#manualZoomOut").onclick=()=>applyScale(scale-.25);
  $("#manualZoomReset").onclick=resetView;

  stage.addEventListener("pointerdown",e=>{
    if(e.pointerType==="mouse"&&e.button!==0)return;
    stage.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId,{x:e.clientX-stage.getBoundingClientRect().left,y:e.clientY-stage.getBoundingClientRect().top});
    if(pointers.size===1){
      drag={
        pointerId:e.pointerId,
        x:e.clientX,
        y:e.clientY,
        scrollLeft:stage.scrollLeft,
        scrollTop:stage.scrollTop
      };
    }else if(pointers.size===2){
      const [a,b]=[...pointers.values()];
      const mid=midpoint(a,b);
      pinch={
        distance:Math.max(1,distance(a,b)),
        scale,
        anchorX:(stage.scrollLeft+mid.x)/scale,
        anchorY:(stage.scrollTop+mid.y)/scale
      };
      drag=null;
    }
    e.preventDefault();
  });

  stage.addEventListener("pointermove",e=>{
    if(!pointers.has(e.pointerId))return;
    const rect=stage.getBoundingClientRect();
    pointers.set(e.pointerId,{x:e.clientX-rect.left,y:e.clientY-rect.top});
    if(pointers.size>=2&&pinch){
      const [a,b]=[...pointers.values()].slice(0,2);
      const mid=midpoint(a,b);
      const next=clamp(pinch.scale*(distance(a,b)/pinch.distance),minScale,maxScale);
      scale=next;
      canvas.style.width=`${baseWidth*scale}px`;
      stage.scrollLeft=pinch.anchorX*scale-mid.x;
      stage.scrollTop=pinch.anchorY*scale-mid.y;
      stage.classList.toggle("zoomed",scale>1.01);
      $("#manualZoomReset").textContent=scale>1.01?`${Math.round(scale*100)}%`:"Fit";
    }else if(pointers.size===1&&drag&&drag.pointerId===e.pointerId){
      stage.scrollLeft=drag.scrollLeft-(e.clientX-drag.x);
      stage.scrollTop=drag.scrollTop-(e.clientY-drag.y);
    }
    e.preventDefault();
  });

  const endPointer=e=>{
    pointers.delete(e.pointerId);
    if(pointers.size<2)pinch=null;
    if(pointers.size===1){
      const [id]=pointers.keys();
      const p=[...pointers.values()][0];
      drag={pointerId:id,x:p.x+stage.getBoundingClientRect().left,y:p.y+stage.getBoundingClientRect().top,scrollLeft:stage.scrollLeft,scrollTop:stage.scrollTop};
    }else if(pointers.size===0){
      drag=null;
    }
  };
  stage.addEventListener("pointerup",endPointer);
  stage.addEventListener("pointercancel",endPointer);
  stage.addEventListener("lostpointercapture",endPointer);

  stage.addEventListener("dblclick",e=>{
    const rect=stage.getBoundingClientRect();
    applyScale(scale>1.01?1:2,{x:e.clientX-rect.left,y:e.clientY-rect.top});
  });
  stage.addEventListener("pointerup",e=>{
    if(e.pointerType!=="touch")return;
    const now=Date.now();
    if(now-lastTap<320){
      const rect=stage.getBoundingClientRect();
      applyScale(scale>1.01?1:2,{x:e.clientX-rect.left,y:e.clientY-rect.top});
      lastTap=0;
    }else lastTap=now;
  });

  window.addEventListener("resize",()=>{
    const previous=baseWidth;
    fitWidth();
    if(previous&&scale>1)canvas.style.width=`${baseWidth*scale}px`;
  },{passive:true});

  $("#manualOcrToggle").onclick=()=>{
    state.manualOcrVisible=!state.manualOcrVisible;saveState();
    $("#manualOcrPanel").hidden=!state.manualOcrVisible;
    $("#manualOcrToggle").textContent=state.manualOcrVisible?"Hide OCR text":"Show OCR text";
  };
  $("#manualBookmarkToggle").onclick=()=>{
    const set=new Set(state.manualBookmarks||[]);
    set.has(activeManualPage)?set.delete(activeManualPage):set.add(activeManualPage);
    state.manualBookmarks=[...set].sort((a,b)=>a-b);saveState();
    $("#manualBookmarkToggle").textContent=set.has(activeManualPage)?"★ Bookmarked":"☆ Bookmark";
    toast(set.has(activeManualPage)?"Page bookmarked":"Bookmark removed");
  };
  $("#manualPageInput").addEventListener("change",e=>openManualPage(Math.max(1,Math.min(DATA.pages.length,Number(e.target.value)||1))));
  image.addEventListener("error",()=>{stage.innerHTML='<div class="data-warning">The scanned image for this page could not be loaded.</div>'},{once:true});
}
function openManualPage(page){
  activeManualPage=Math.max(1,Math.min(DATA.pages.length,Number(page)||1));
  const meta=pageMeta(activeManualPage);
  showDialog("Official manual",`Page ${activeManualPage}. ${meta.title||"Knaus manual"}`,manualReaderHtml(activeManualPage),true);
  wireManualReader();
}

function getDiagnostic(id){
  return DATA.diagnostics.find(x=>String(x.id)===String(id));
}
function diagnosticReferenceLinks(d){
  const chapter=d.chapter?`<button class="secondary-btn" data-chapter-nav="${Number(d.chapter)}">Open Companion chapter ${Number(d.chapter)}</button>`:"";
  const pages=(d.manualPages||[]).map(p=>`<button class="secondary-btn" data-manual-page="${Number(p)}">Manual page ${Number(p)}</button>`).join("");
  if(!chapter&&!pages)return "";
  return `<section class="diagnostic-reference"><h3>Related information</h3><div class="diagnostic-link-row">${chapter}${pages}</div></section>`;
}
function diagnosticIntroHtml(d){
  const safety=Array.isArray(d.safety)?d.safety:[];
  const tools=Array.isArray(d.tools||d.requiredTools)?(d.tools||d.requiredTools):[];
  const parts=Array.isArray(d.parts)?d.parts:[];
  return `<div class="diagnostic-engine">
    <div class="diagnostic-hero">
      <div class="diagnostic-hero-icon">${diagnosticIcon((d.systems||[])[0])}</div>
      <div>
        <span class="meta">${esc((d.systems||["Vehicle"]).join(" • "))}</span>
        <h3>${esc(d.title)}</h3>
        <p>${esc(d.summary||d.description||"Follow the checks in order. Stop whenever a safety concern is found.")}</p>
      </div>
    </div>
    <div class="diagnostic-meta">
      ${d.difficulty?`<span>Difficulty: ${esc(d.difficulty)}</span>`:""}
      ${d.time?`<span>Typical time: ${esc(d.time)}</span>`:""}
      <span>${d.steps?.length||0} checks</span>
    </div>
    ${safety.length?`<section class="diagnostic-safety"><h3>⚠ Safety first</h3><ul>${safety.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`:""}
    ${tools.length?`<section class="detail-section"><h3>Useful tools</h3><div class="diagnostic-tag-list">${tools.map(x=>`<span>${esc(x)}</span>`).join("")}</div></section>`:""}
    ${parts.length?`<section class="detail-section"><h3>Possible parts or consumables</h3><div class="diagnostic-tag-list">${parts.map(x=>`<span>${esc(x)}</span>`).join("")}</div></section>`:""}
    <div class="diagnostic-actions">
      <button class="primary-btn" data-diagnostic-begin="${esc(d.id)}">Begin guided checks</button>
      <button class="secondary-btn" data-diagnostic-cancel>Cancel</button>
    </div>
    ${diagnosticReferenceLinks(d)}
  </div>`;
}
function startDiagnostic(id){
  const d=getDiagnostic(id);
  if(!d)return toast("Diagnostic could not be loaded");
  activeDiagnosticSession={id:d.id,step:0,history:[],startedAt:new Date().toISOString(),outcome:null};
  showDialog("Guided diagnostic",d.title,diagnosticIntroHtml(d),true);
}
function beginDiagnostic(id){
  const d=getDiagnostic(id);
  if(!d)return;
  if(!activeDiagnosticSession||activeDiagnosticSession.id!==d.id){
    activeDiagnosticSession={id:d.id,step:0,history:[],startedAt:new Date().toISOString(),outcome:null};
  }
  renderDiagnosticStep();
}
function diagnosticTrailHtml(session,d){
  if(!session.history.length)return "";
  return `<details class="diagnostic-trail"><summary>Checks already answered (${session.history.length})</summary><ol>${
    session.history.map(h=>`<li><span>${esc(d.steps[h.step]?.q||"Check")}</span><strong>${h.answer==="yes"?"Yes":"No"}</strong></li>`).join("")
  }</ol></details>`;
}
function renderDiagnosticStep(){
  const session=activeDiagnosticSession;
  const d=session&&getDiagnostic(session.id);
  if(!d)return;
  const step=d.steps?.[session.step];
  if(!step){finishDiagnostic("The diagnostic data ended without a final result.");return}
  const progress=Math.round(((session.step+1)/Math.max(1,d.steps.length))*100);
  const html=`<div class="diagnostic-engine">
    <div class="diagnostic-progress-head">
      <span>Check ${session.step+1} of ${d.steps.length}</span>
      <strong>${progress}%</strong>
    </div>
    <div class="diagnostic-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
      <span style="width:${progress}%"></span>
    </div>
    <article class="diagnostic-question">
      <span class="meta">${esc((d.systems||["Vehicle"]).join(" • "))}</span>
      <h3>${esc(step.q||"Complete this check")}</h3>
      <p>Choose the answer that best matches what you can see or measure now.</p>
      <div class="diagnostic-answer-grid">
        <button class="diagnostic-answer yes" data-diagnostic-answer="yes"><span>✓</span><strong>Yes</strong></button>
        <button class="diagnostic-answer no" data-diagnostic-answer="no"><span>×</span><strong>No</strong></button>
      </div>
    </article>
    ${diagnosticTrailHtml(session,d)}
    <div class="diagnostic-actions">
      <button class="secondary-btn" data-diagnostic-back ${session.history.length?"":"disabled"}>← Back</button>
      <button class="secondary-btn" data-diagnostic-restart>Restart</button>
      <button class="secondary-btn" data-diagnostic-exit>Exit</button>
    </div>
  </div>`;
  showDialog("Guided diagnostic",d.title,html,true);
}
function answerDiagnostic(answer){
  const session=activeDiagnosticSession;
  const d=session&&getDiagnostic(session.id);
  const step=d?.steps?.[session.step];
  if(!step)return;
  const destination=step[answer];
  session.history.push({step:session.step,answer,question:step.q,at:new Date().toISOString()});
  if(Number.isInteger(destination)){
    session.step=destination;
    renderDiagnosticStep();
  }else{
    finishDiagnostic(String(destination||"No outcome was supplied."));
  }
}
function diagnosticNextActions(outcome){
  const lower=String(outcome).toLowerCase();
  if(/stop|competent|professional|service|technician|gas|230 v|mains/.test(lower)){
    return [
      "Do not bypass protective devices or continue repeated ignition attempts.",
      "Record what you observed and arrange competent testing where advised.",
      "Use the linked chapter and official-manual pages for identification only."
    ];
  }
  return [
    "Carry out the suggested correction, then test the system again.",
    "Use the correct fuse rating and approved replacement parts only.",
    "If the symptom returns, save this report and investigate the circuit or component under load."
  ];
}
function finishDiagnostic(outcome){
  const session=activeDiagnosticSession;
  const d=session&&getDiagnostic(session.id);
  if(!d)return;
  session.outcome=outcome;
  session.completedAt=new Date().toISOString();
  const path=session.history.map((h,i)=>`<li><span>${esc(d.steps[h.step]?.q||h.question)}</span><strong>${h.answer==="yes"?"Yes":"No"}</strong></li>`).join("");
  const html=`<div class="diagnostic-engine diagnostic-result">
    <div class="result-status">Likely result</div>
    <h3>${esc(outcome)}</h3>
    <p>This result is based on the answers supplied. Confirm with measurements where appropriate before replacing parts.</p>
    <section class="diagnostic-result-box">
      <h3>Recommended next actions</h3>
      <ol>${diagnosticNextActions(outcome).map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
    </section>
    <details class="diagnostic-trail" open>
      <summary>Your diagnostic path (${session.history.length} answers)</summary>
      <ol>${path}</ol>
    </details>
    ${diagnosticReferenceLinks(d)}
    <div class="diagnostic-actions">
      <button class="primary-btn" data-diagnostic-save>Save report</button>
      <button class="secondary-btn" data-diagnostic-fault>Add to fault log</button>
      <button class="secondary-btn" data-diagnostic-restart>Run again</button>
      <button class="secondary-btn" data-diagnostic-exit>Close</button>
    </div>
  </div>`;
  showDialog("Diagnostic result",d.title,html,true);
}
function backDiagnostic(){
  const session=activeDiagnosticSession;
  if(!session?.history.length)return;
  const previous=session.history.pop();
  session.step=previous.step;
  session.outcome=null;
  renderDiagnosticStep();
}
function restartDiagnostic(){
  const d=activeDiagnosticSession&&getDiagnostic(activeDiagnosticSession.id);
  if(d)startDiagnostic(d.id);
}
function diagnosticReportPayload(){
  const session=activeDiagnosticSession;
  const d=session&&getDiagnostic(session.id);
  if(!d||!session.outcome)return null;
  return {
    id:`diag-${Date.now()}`,
    diagnosticId:d.id,
    title:d.title,
    systems:d.systems||[],
    startedAt:session.startedAt,
    completedAt:session.completedAt||new Date().toISOString(),
    outcome:session.outcome,
    answers:session.history.map(h=>({question:d.steps[h.step]?.q||h.question,answer:h.answer})),
    chapter:d.chapter||null,
    manualPages:d.manualPages||[]
  };
}
function saveDiagnosticReport(){
  const report=diagnosticReportPayload();
  if(!report)return;
  state.diagnosticReports=state.diagnosticReports||[];
  state.diagnosticReports.unshift(report);
  state.diagnosticReports=state.diagnosticReports.slice(0,100);
  saveState();renderDiagnostics();toast("Diagnostic report saved");
}
function addDiagnosticToFaultLog(){
  const report=diagnosticReportPayload();
  if(!report)return;
  state.faults=state.faults||[];
  state.faults.unshift({
    id:`fault-${Date.now()}`,
    title:report.title,
    status:"open",
    createdAt:new Date().toISOString(),
    diagnosticOutcome:report.outcome,
    diagnosticReport:report
  });
  saveState();renderHome();toast("Added to open faults");
}
function openDetail(item){
  if(!item)return;
  if(item.type==="chapter"||item.chapterNumber){openChapter(item.chapterNumber||item.raw?.n);return}
  if(item.type==="manual"||item.page){openManualPage(item.page||item.raw?.page);return}
  $("#detailDialog").classList.remove("reader-dialog");
  $("#detailType").textContent=item.type||"Details";
  $("#detailTitle").textContent=item.title||"Details";
  let html="";
  if(item.type==="diagnostic"&&item.raw){
    startDiagnostic(item.raw.id);
    return;
  }else{
    const x=item.raw||{};
    html+=detailList("Items",x.steps||x.checks||x.campsites||[]);
    if(x.note)html+=`<p>${esc(x.note)}</p>`;
    if(!html&&item.text)html=`<p>${esc(item.text)}</p>`;
  }
  showDialog(item.type||"Details",item.title||"Details",html,false);
}
function closeDetail(){
  const d=$("#detailDialog");
  $("#detailDialog").classList.remove("reader-dialog");
  if(typeof d.close==="function"&&d.open)d.close();else d.removeAttribute("open");
}
function openTouringSection(id){
  const fallbackDeparture=[
    "External doors, lockers and windows secured","Hook-up cable disconnected and stored",
    "Water and waste caps secured","Aerial and satellite dish lowered","Steps, ramps and awning stored",
    "Gas appliances off for travel","Loose items secured inside","Tyres, lights and mirrors checked"
  ];
  const sections={
    departure:{type:"touring",title:"Departure checks",raw:{checks:DATA.touringChecks.length?DATA.touringChecks:fallbackDeparture}},
    packing:{type:"touring",title:"Packing essentials",raw:{checks:["Driving documents and insurance","Hook-up cable and adapters","Fresh-water hose and fittings","Levelling ramps","Basic tools and spare fuses","First-aid kit","Torch and batteries","Medication and chargers"]}},
    campsites:{type:"touring",title:"Saved campsites",raw:{campsites:DATA.campsites.length?DATA.campsites:["No campsites saved yet."]}},
    "travel-log":{type:"touring",title:"Travel log",raw:{note:"Travel-log editing will be added in the next touring upgrade. Existing touring data remains preserved."}}
  };
  openDetail(sections[id]);
}

function electricalView(component){
  const status=String(component.status||"").toLowerCase();
  const voltage=String(component.voltage||"").toLowerCase();
  if(status.includes("planned")||status.includes("recommended")||component.id.includes("future"))return "future";
  if(voltage.includes("230")||component.id==="hookup"||component.id==="consumer-unit")return "mains";
  return "12v";
}
function electricalComponents(){return DATA.electrical.filter(component=>electricalFilter==="all"||electricalView(component)===electricalFilter)}
function renderElectricalInspector(){
  const component=DATA.electrical.find(item=>item.id===activeElectricalComponent)||electricalComponents()[0];
  if(!component){$("#electricalInspector").innerHTML="<h2>Electrical data unavailable</h2><p>Reload the app while online to restore the installed reference data.</p>";return}
  activeElectricalComponent=component.id;
  const related=DATA.electricalRelations.filter(link=>link.from===component.id||link.to===component.id);
  const readings=component.normalReadings||[component.expected].filter(Boolean);
  $("#electricalInspector").innerHTML=`
    <span class="meta">${esc(component.category||"Electrical component")}</span><h2>${esc(component.name)}</h2>
    <div class="diagnostic-meta"><span>${esc(component.status||"Installed")}</span><span>${esc(component.voltage||"12 V DC")}</span></div>
    <p>${esc(component.purpose||"")}</p>
    <dl class="component-facts"><div><dt>Location</dt><dd>${esc(component.location||"Confirm on vehicle")}</dd></div><div><dt>Protection</dt><dd>${esc(component.fuses||"Confirm fitted protection")}</dd></div></dl>
    ${readings.length?`<section class="detail-section"><h3>Normal readings</h3><ul>${readings.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`:""}
    ${(component.tests||[]).length?`<section class="detail-section"><h3>Checks</h3><ol>${component.tests.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></section>`:""}
    ${related.length?`<section class="detail-section"><h3>Connected path</h3><ul>${related.map(link=>{const other=DATA.electrical.find(x=>x.id===(link.from===component.id?link.to:link.from));return `<li><strong>${esc(link.from===component.id?"To":"From")} ${esc(other?.name||"component")}</strong><br>${esc(link.label||link.type)}</li>`}).join("")}</ul></section>`:""}
    <div class="diagnostic-link-row">${(component.chapters||[]).map(n=>`<button class="secondary-btn" data-chapter-nav="${Number(n)}">Chapter ${Number(n)}</button>`).join("")}${(component.officialPages||[]).map(n=>`<button class="secondary-btn" data-manual-nav="${Number(n)}">Manual p. ${Number(n)}</button>`).join("")}</div>`;
}
function renderElectrical(){
  const filters=[["all","All paths"],["12v","12 V habitation"],["mains","230 V hook-up"],["future","Planned upgrades"]];
  $("#electricalFilters").innerHTML=filters.map(([id,label])=>`<button class="chip ${electricalFilter===id?"active":""}" data-electrical-filter="${id}">${label}</button>`).join("");
  const components=electricalComponents(),visibleIds=new Set(components.map(x=>x.id));
  const links=DATA.electricalRelations.filter(x=>visibleIds.has(x.from)&&visibleIds.has(x.to));
  $("#electricalSummary").innerHTML=[[components.length,"Components"],[links.length,"Visible connections"],[components.filter(x=>x.status==="Confirmed").length,"Confirmed items"]].map(([v,l])=>`<article class="stat-card"><strong>${v}</strong><span>${l}</span></article>`).join("");
  $("#electricalLegend").innerHTML=`<span><i class="legend-dot source"></i>Source / storage</span><span><i class="legend-dot distribution"></i>Distribution</span><span><i class="legend-dot load"></i>Load</span><span><i class="legend-dot future"></i>Planned</span>`;
  $("#electricalMap").innerHTML=components.map(component=>{
    const outgoing=links.filter(x=>x.from===component.id);
    const kind=electricalView(component)==="future"?"future":/(battery|hookup|alternator|anker)/.test(component.id)?"source":/(vb0|calira|consumer)/.test(component.id)?"distribution":"load";
    return `<article class="electrical-node ${kind} ${activeElectricalComponent===component.id?"active":""}"><button data-electrical-component="${esc(component.id)}" aria-pressed="${activeElectricalComponent===component.id}"><span class="meta">${esc(component.voltage||component.category)}</span><strong>${esc(component.name)}</strong><small>${esc(component.fuses||component.status||"")}</small></button>${outgoing.map(link=>{const target=DATA.electrical.find(x=>x.id===link.to);return `<button class="power-link" data-electrical-component="${esc(link.to)}"><span>${esc(link.label||link.type)}</span><b>→ ${esc(target?.name||link.to)}</b></button>`}).join("")}</article>`;
  }).join("")||`<article class="panel"><p>No components match this view.</p></article>`;
  renderElectricalInspector();
}

function waterView(component){
  if(["waste-tank","waste-valve"].includes(component.id))return "waste";
  if(["truma-boiler","frost-valve","hot-manifold"].includes(component.id))return "hot";
  if(component.id==="level-sensors")return "monitoring";
  return "fresh";
}
function waterComponents(){
  if(waterFilter==="all")return DATA.water;
  const shared=waterFilter==="hot"||waterFilter==="waste"?["kitchen-tap","bathroom-outlets"]:[];
  return DATA.water.filter(component=>waterView(component)===waterFilter||shared.includes(component.id));
}
function renderWaterInspector(){
  const component=DATA.water.find(item=>item.id===activeWaterComponent)||waterComponents()[0];
  if(!component){$("#waterInspector").innerHTML="<h2>Water data unavailable</h2><p>Reload the app while online to restore the installed reference data.</p>";return}
  activeWaterComponent=component.id;
  const related=DATA.waterRelations.filter(link=>link.from===component.id||link.to===component.id);
  $("#waterInspector").innerHTML=`<span class="meta">${esc(component.category||"Water component")}</span><h2>${esc(component.name)}</h2><div class="diagnostic-meta"><span>${esc(component.status||"Installed")}</span></div><p>${esc(component.purpose||"")}</p><dl class="component-facts"><div><dt>Location</dt><dd>${esc(component.location||"Confirm on vehicle")}</dd></div><div><dt>Operation</dt><dd>${esc(component.operation||"Inspect the fitted arrangement")}</dd></div></dl>${(component.tests||[]).length?`<section class="detail-section"><h3>Checks</h3><ol>${component.tests.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></section>`:""}${(component.maintenance||[]).length?`<section class="detail-section"><h3>Maintenance</h3><ul>${component.maintenance.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`:""}${related.length?`<section class="detail-section"><h3>Connected flow</h3><ul>${related.map(link=>{const other=DATA.water.find(x=>x.id===(link.from===component.id?link.to:link.from));return `<li><strong>${esc(link.from===component.id?"To":"From")} ${esc(other?.name||"component")}</strong><br>${esc(link.label||"connected")}</li>`}).join("")}</ul></section>`:""}<div class="diagnostic-link-row">${(component.chapters||[]).map(n=>`<button class="secondary-btn" data-chapter-nav="${Number(n)}">Chapter ${Number(n)}</button>`).join("")}${(component.officialPages||[]).map(n=>`<button class="secondary-btn" data-manual-nav="${Number(n)}">Manual p. ${Number(n)}</button>`).join("")}</div>`;
}
function renderWater(){
  const filters=[["all","All flow"],["fresh","Fresh & cold"],["hot","Hot water"],["waste","Waste water"],["monitoring","Monitoring"]];
  $("#waterFilters").innerHTML=filters.map(([id,label])=>`<button class="chip ${waterFilter===id?"active":""}" data-water-filter="${id}">${label}</button>`).join("");
  const components=waterComponents(),visibleIds=new Set(components.map(x=>x.id));
  const links=DATA.waterRelations.filter(x=>visibleIds.has(x.from)&&visibleIds.has(x.to));
  $("#waterSummary").innerHTML=[[components.length,"Components"],[links.length,"Visible connections"],[components.filter(x=>x.status==="Confirmed").length,"Confirmed items"]].map(([v,l])=>`<article class="stat-card"><strong>${v}</strong><span>${l}</span></article>`).join("");
  $("#waterLegend").innerHTML=`<span><i class="legend-dot water-source"></i>Storage / source</span><span><i class="legend-dot water-pressure"></i>Pressure / distribution</span><span><i class="legend-dot water-outlet"></i>Outlet</span><span><i class="legend-dot water-waste"></i>Waste / drain</span>`;
  $("#waterMap").innerHTML=components.map(component=>{
    const outgoing=links.filter(x=>x.from===component.id);
    const kind=/(tank|filler)/.test(component.id)&&component.id!=="waste-tank"?"water-source":/(pump|manifold|boiler)/.test(component.id)?"water-pressure":/(tap|outlets|flush)/.test(component.id)?"water-outlet":"water-waste";
    return `<article class="electrical-node water-node ${kind} ${activeWaterComponent===component.id?"active":""}"><button data-water-component="${esc(component.id)}" aria-pressed="${activeWaterComponent===component.id}"><span class="meta">${esc(component.category)}</span><strong>${esc(component.name)}</strong><small>${esc(component.operation||component.status||"")}</small></button>${outgoing.map(link=>{const target=DATA.water.find(x=>x.id===link.to);return `<button class="power-link" data-water-component="${esc(link.to)}"><span>${esc(link.label||"flows to")}</span><b>→ ${esc(target?.name||link.to)}</b></button>`}).join("")}</article>`;
  }).join("")||`<article class="panel"><p>No components match this view.</p></article>`;
  renderWaterInspector();
}

function gasView(component){
  if(["gas-locker","gas-cylinder","regulator","gas-manifold"].includes(component.id))return "supply";
  if(["truma-heater","warm-air-ducts","boiler-burner"].includes(component.id))return "heating";
  if(["hob","oven"].includes(component.id))return "cooking";
  if(component.id==="fridge-gas")return "fridge";
  return "safety";
}
function gasComponents(){
  if(gasFilter==="all")return DATA.gas;
  const shared=gasFilter==="heating"||gasFilter==="cooking"||gasFilter==="fridge"?["gas-manifold"]:[];
  return DATA.gas.filter(component=>gasView(component)===gasFilter||shared.includes(component.id));
}
function renderGasInspector(){
  const component=DATA.gas.find(item=>item.id===activeGasComponent)||gasComponents()[0];
  if(!component){$("#gasInspector").innerHTML="<h2>Gas data unavailable</h2><p>Reload the app while online to restore the installed reference data.</p>";return}
  activeGasComponent=component.id;
  const related=DATA.gasRelations.filter(link=>link.from===component.id||link.to===component.id);
  $("#gasInspector").innerHTML=`<span class="meta">${esc(component.category||"Gas component")}</span><h2>${esc(component.name)}</h2><div class="diagnostic-meta"><span>${esc(component.status||"Installed")}</span></div><p>${esc(component.purpose||"")}</p><div class="gas-caution"><strong>Safety boundary</strong><span>Visual and user-level checks only. Pressure, soundness, combustion and internal appliance work require a competent gas technician.</span></div><dl class="component-facts"><div><dt>Location</dt><dd>${esc(component.location||"Confirm on vehicle")}</dd></div><div><dt>Operation</dt><dd>${esc(component.operation||"Inspect the fitted arrangement")}</dd></div></dl>${(component.tests||[]).length?`<section class="detail-section"><h3>Safe checks</h3><ol>${component.tests.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></section>`:""}${(component.maintenance||[]).length?`<section class="detail-section"><h3>Maintenance</h3><ul>${component.maintenance.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`:""}${related.length?`<section class="detail-section"><h3>Connected path</h3><ul>${related.map(link=>{const other=DATA.gas.find(x=>x.id===(link.from===component.id?link.to:link.from));return `<li><strong>${esc(link.from===component.id?"To":"From")} ${esc(other?.name||"component")}</strong><br>${esc(link.label||"connected")}</li>`}).join("")}</ul></section>`:""}<div class="diagnostic-link-row">${(component.chapters||[]).map(n=>`<button class="secondary-btn" data-chapter-nav="${Number(n)}">Chapter ${Number(n)}</button>`).join("")}${(component.officialPages||[]).map(n=>`<button class="secondary-btn" data-manual-nav="${Number(n)}">Manual p. ${Number(n)}</button>`).join("")}</div>`;
}
function renderGas(){
  const filters=[["all","All paths"],["supply","LPG supply"],["heating","Heating & hot water"],["cooking","Cooking"],["fridge","Refrigerator"],["safety","Safety & flues"]];
  $("#gasFilters").innerHTML=filters.map(([id,label])=>`<button class="chip ${gasFilter===id?"active":""}" data-gas-filter="${id}">${label}</button>`).join("");
  const components=gasComponents(),visibleIds=new Set(components.map(x=>x.id));
  const links=DATA.gasRelations.filter(x=>visibleIds.has(x.from)&&visibleIds.has(x.to));
  $("#gasSummary").innerHTML=[[components.length,"Components"],[links.length,"Visible connections"],[components.filter(x=>x.status==="Installed").length,"Installed items"]].map(([v,l])=>`<article class="stat-card"><strong>${v}</strong><span>${l}</span></article>`).join("");
  $("#gasLegend").innerHTML=`<span><i class="legend-dot gas-supply"></i>Supply</span><span><i class="legend-dot gas-appliance"></i>Appliance</span><span><i class="legend-dot gas-exhaust"></i>Flue / airflow</span><span><i class="legend-dot gas-safety"></i>Safety</span>`;
  $("#gasMap").innerHTML=components.map(component=>{
    const outgoing=links.filter(x=>x.from===component.id);
    const view=gasView(component),kind=view==="supply"?"gas-supply":view==="safety"?component.id==="co-alarm"?"gas-safety":"gas-exhaust":"gas-appliance";
    return `<article class="electrical-node gas-node ${kind} ${activeGasComponent===component.id?"active":""}"><button data-gas-component="${esc(component.id)}" aria-pressed="${activeGasComponent===component.id}"><span class="meta">${esc(component.category)}</span><strong>${esc(component.name)}</strong><small>${esc(component.operation||component.status||"")}</small></button>${outgoing.map(link=>{const target=DATA.gas.find(x=>x.id===link.to);return `<button class="power-link" data-gas-component="${esc(link.to)}"><span>${esc(link.label||"supplies")}</span><b>→ ${esc(target?.name||link.to)}</b></button>`}).join("")}</article>`;
  }).join("")||`<article class="panel"><p>No components match this view.</p></article>`;
  renderGasInspector();
}

function renderVehicle(){
  $("#vehicleCards").innerHTML=[
    moduleCard("electrical","⚡","Interactive electrical","Trace supplies, protection and connected loads"),
    moduleCard("water","💧","Interactive water","Follow fresh, hot and waste-water flow"),
    moduleCard("gas","🔥","Interactive gas","Trace LPG supply and appliance branches"),
    moduleCard("manuals","📚","Documentation","Manuals, wiring notes and chapters"),
    moduleCard("maintenance","🛠️","Service history","Work completed and due"),
    moduleCard("diagnostics","⚠️","Faults & diagnostics","Known issues and guided checks"),
    moduleCard("search","🔎","Find a component","Search all installed vehicle information")
  ].join("");
  renderVehicleMap();
}
function vehicleSystemIcon(system){return ({electrical:"⚡",water:"💧",gas:"🔥",vehicle:"🚐"}[system]||"●")}
function renderVehicleMapInspector(){
  const spots=DATA.vehicleExplorer.filter(item=>item.view===vehicleMapView);
  const item=DATA.vehicleExplorer.find(x=>x.id===activeVehicleHotspot)||spots[0];
  if(!item){$("#vehicleMapInspector").innerHTML="<h2>Map data unavailable</h2>";return}
  activeVehicleHotspot=item.id;
  const systemRoute=["electrical","water","gas"].includes(item.system)?item.system:"";
  $("#vehicleMapInspector").innerHTML=`<span class="meta">${vehicleSystemIcon(item.system)} ${esc(item.system||"vehicle")}</span><h2>${esc(item.name)}</h2><h3>${esc(item.label||"")}</h3><p>${esc(item.description||"")}</p><div class="diagnostic-actions">${systemRoute?`<button class="primary-btn" data-route="${systemRoute}">Open ${esc(systemRoute)} system</button>`:""}</div><div class="diagnostic-link-row">${(item.chapters||[]).map(n=>`<button class="secondary-btn" data-chapter-nav="${Number(n)}">Chapter ${Number(n)}</button>`).join("")}${(item.manualPages||[]).map(n=>`<button class="secondary-btn" data-manual-nav="${Number(n)}">Manual p. ${Number(n)}</button>`).join("")}</div>`;
}
function renderVehicleMap(){
  const views=[["interior","Interior"],["exterior","Exterior"],["roof","Roof"]];
  $("#vehicleViewTabs").innerHTML=views.map(([id,label])=>`<button class="tab ${vehicleMapView===id?"active":""}" data-vehicle-view="${id}">${label}</button>`).join("");
  const spots=DATA.vehicleExplorer.filter(item=>item.view===vehicleMapView);
  $("#vehicleMapStage").innerHTML=`<div class="vehicle-outline ${vehicleMapView}" aria-hidden="true"><span class="vehicle-cab">CAB</span><span class="vehicle-view-label">${esc(vehicleMapView)} view</span></div>${spots.map(item=>`<button class="vehicle-hotspot system-${esc(item.system)} ${activeVehicleHotspot===item.id?"active":""}" style="--x:${Number(item.x)}%;--y:${Number(item.y)}%;--w:${Number(item.w)}%;--h:${Number(item.h)}%" data-vehicle-hotspot="${esc(item.id)}" aria-pressed="${activeVehicleHotspot===item.id}"><span>${vehicleSystemIcon(item.system)}</span><strong>${esc(item.name)}</strong></button>`).join("")}`;
  renderVehicleMapInspector();
}
function renderSettings(){
  const b=DATA.build||{};
  $("#buildInfo").innerHTML=`<p><strong>Version:</strong> ${esc(b.version||APP_VERSION)}</p><p><strong>Release:</strong> ${esc(b.releaseName||"Rebuilt application shell")}</p><p><strong>Build date:</strong> ${esc(b.buildDate||"2026-07-18")}</p><p><strong>Local records:</strong> ${(state.logs||[]).length}</p>`;
}
function exportBackup(){
  const payload={app:"Knaus Companion",version:APP_VERSION,exportedAt:new Date().toISOString(),state};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-companion-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
async function restoreBackup(file){
  const payload=JSON.parse(await file.text());const incoming=payload.state||payload;
  if(!incoming||typeof incoming!=="object")throw new Error("Invalid backup");
  state={...DEFAULT_STATE,...incoming};saveState();toast("Backup restored");setTimeout(()=>location.reload(),600);
}
async function clearCache(){
  if("serviceWorker" in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()))}
  if("caches" in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}
  toast("Cache cleared. Reloading…");setTimeout(()=>location.reload(),600);
}
async function init(){
  [
    DATA.chapters,DATA.pages,DATA.diagnostics,DATA.maintenanceTasks,DATA.assistantPrompts,DATA.build,
    DATA.electrical,DATA.electricalRelations,DATA.water,DATA.waterRelations,DATA.gas,DATA.gasRelations,DATA.vehicleExplorer,DATA.campsites,DATA.touringChecks
  ]=await Promise.all([
    loadJSON("data/chapters.json"),loadJSON("data/manual_pages.json"),loadJSON("data/smart_diagnostics.json"),
    loadJSON("data/maintenance_tasks.json"),loadJSON("data/assistant_prompts.json"),loadJSON("data/build.json",{}),
    loadJSON("data/electrical_components.json"),loadJSON("data/electrical_relations.json"),loadJSON("data/water_components.json"),loadJSON("data/water_relations.json"),loadJSON("data/gas_components.json"),loadJSON("data/gas_relations.json"),loadJSON("data/vehicle_explorer.json"),
    loadJSON("data/campsites.json"),loadJSON("data/touring_checklists.json")
  ]);
  applyTheme();renderNav();renderHome();renderAssistant();renderLibrary();renderMaintenance();renderDiagnostics();renderTouring();renderVehicle();renderElectrical();renderWater();renderGas();renderSettings();
  $("#diagnosticSearch")?.addEventListener("input",renderDiagnostics);
  setActiveRoute(NAV.some(x=>x[0]===route())?route():"home");
}
document.addEventListener("click",e=>{
  const routeButton=e.target.closest("[data-route]");if(routeButton){e.preventDefault();navigate(routeButton.dataset.route)}
  const prompt=e.target.closest("[data-prompt]");if(prompt){$("#assistantInput").value=prompt.dataset.prompt;askAssistant()}
  const tab=e.target.closest("[data-library]");if(tab){libraryMode=tab.dataset.library;$$(".tab").forEach(x=>x.classList.toggle("active",x===tab));renderLibrary()}
  const touring=e.target.closest("[data-touring]");if(touring)openTouringSection(touring.dataset.touring);
  const manual=e.target.closest("[data-manual-page],[data-manual-nav],[data-page]");if(manual)openManualPage(manual.dataset.manualPage||manual.dataset.manualNav||manual.dataset.page);
  const chapter=e.target.closest("[data-chapter-nav]");if(chapter)openChapter(chapter.dataset.chapterNav);
  const diagnosticStart=e.target.closest("[data-diagnostic-start]");if(diagnosticStart)startDiagnostic(diagnosticStart.dataset.diagnosticStart);
  const diagnosticBegin=e.target.closest("[data-diagnostic-begin]");if(diagnosticBegin)beginDiagnostic(diagnosticBegin.dataset.diagnosticBegin);
  const diagnosticAnswer=e.target.closest("[data-diagnostic-answer]");if(diagnosticAnswer)answerDiagnostic(diagnosticAnswer.dataset.diagnosticAnswer);
  const diagnosticFilterButton=e.target.closest("[data-diagnostic-filter]");if(diagnosticFilterButton){diagnosticFilter=diagnosticFilterButton.dataset.diagnosticFilter;renderDiagnostics()}
  const electricalFilterButton=e.target.closest("[data-electrical-filter]");if(electricalFilterButton){electricalFilter=electricalFilterButton.dataset.electricalFilter;const first=electricalComponents()[0];if(first)activeElectricalComponent=first.id;renderElectrical()}
  const electricalComponent=e.target.closest("[data-electrical-component]");if(electricalComponent){activeElectricalComponent=electricalComponent.dataset.electricalComponent;renderElectrical()}
  const waterFilterButton=e.target.closest("[data-water-filter]");if(waterFilterButton){waterFilter=waterFilterButton.dataset.waterFilter;const first=waterComponents()[0];if(first)activeWaterComponent=first.id;renderWater()}
  const waterComponent=e.target.closest("[data-water-component]");if(waterComponent){activeWaterComponent=waterComponent.dataset.waterComponent;renderWater()}
  const gasFilterButton=e.target.closest("[data-gas-filter]");if(gasFilterButton){gasFilter=gasFilterButton.dataset.gasFilter;const first=gasComponents()[0];if(first)activeGasComponent=first.id;renderGas()}
  const gasComponent=e.target.closest("[data-gas-component]");if(gasComponent){activeGasComponent=gasComponent.dataset.gasComponent;renderGas()}
  const vehicleViewButton=e.target.closest("[data-vehicle-view]");if(vehicleViewButton){vehicleMapView=vehicleViewButton.dataset.vehicleView;const first=DATA.vehicleExplorer.find(x=>x.view===vehicleMapView);if(first)activeVehicleHotspot=first.id;renderVehicleMap()}
  const vehicleHotspot=e.target.closest("[data-vehicle-hotspot]");if(vehicleHotspot){activeVehicleHotspot=vehicleHotspot.dataset.vehicleHotspot;renderVehicleMap()}
  if(e.target.closest("[data-diagnostic-back]"))backDiagnostic();
  if(e.target.closest("[data-diagnostic-restart]"))restartDiagnostic();
  if(e.target.closest("[data-diagnostic-save]"))saveDiagnosticReport();
  if(e.target.closest("[data-diagnostic-fault]"))addDiagnosticToFaultLog();
  if(e.target.closest("[data-diagnostic-exit],[data-diagnostic-cancel]"))closeDetail();
});
window.addEventListener("hashchange",()=>setActiveRoute(NAV.some(x=>x[0]===route())?route():"home"));
$("#menuButton").onclick=openDrawer;$("#closeDrawer").onclick=closeDrawer;$("#scrim").onclick=closeDrawer;
$("#themeButton").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";saveState();applyTheme()};
$("#assistantAsk").onclick=askAssistant;$("#assistantInput").addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")askAssistant()});
$("#runSearch").onclick=()=>renderResults("#searchResults",searchDocs($("#globalSearch").value));
$("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter")$("#runSearch").click()});
$("#addServiceRecord").onclick=()=>{
  const title=prompt("What work was completed?");if(!title)return;
  const mileage=prompt("Mileage (optional)","");
  state.logs.unshift({title,mileage,date:new Date().toISOString().slice(0,10)});saveState();renderMaintenance();renderHome();toast("Service record added");
};
$("#exportBackup").onclick=exportBackup;
$("#importBackup").onchange=async e=>{try{if(e.target.files[0])await restoreBackup(e.target.files[0])}catch(err){toast(err.message)}finally{e.target.value=""}};
$("#clearCache").onclick=clearCache;
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeDrawer();closeDetail()}});
$("#closeDetail").onclick=closeDetail;
$("#detailDialog").addEventListener("click",e=>{if(e.target===$("#detailDialog"))closeDetail()});

init().catch(err=>{
  console.error(err);
  document.body.innerHTML=`<main style="padding:30px;font-family:system-ui"><h1>Knaus Companion could not start</h1><p>${esc(err.message)}</p><button onclick="location.reload()">Reload</button></main>`;
});
