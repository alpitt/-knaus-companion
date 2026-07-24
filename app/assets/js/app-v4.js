
const APP_VERSION="5.9.0";
const STORE_KEY="knaus-ultimate-v1";
const DEFAULT_STATE={theme:"light",logs:[],maintenance:{},departure:{},touringProgress:{},trips:[],expenses:[],savedCampsites:[],packingLists:[],payloadPlan:{},vehicleProfile:{make:"Knaus",model:"Sun Traveller"},vehicleConfiguration:{},vehicleDocuments:[],upgradeProjects:[],vehiclePhotoNotes:{},partsStock:{},currentMileage:0,faults:[],inventory:[],assistantHistory:[],manualBookmarks:[],manualOcrVisible:false,diagnosticReports:[]};

const VEHICLE_PHOTOS=[
  {id:"photo-01",file:"vehicle_photo_01.jpg",title:"Calira VB06-1 and EVS installation",location:"Electrical compartment",tags:"electrical fuse distribution charger wiring VB06-1 EVS 30/20"},
  {id:"photo-02",file:"vehicle_photo_02.jpg",title:"Calira EVS 30/20 wiring and labels",location:"Electrical compartment",tags:"electrical charger power supply connectors cable routes"},
  {id:"photo-03",file:"vehicle_photo_03.jpg",title:"Calira VB04 auxiliary fuse box",location:"Under passenger seat",tags:"electrical fuse D+ heating permanent supply VB04"},
  {id:"photo-04",file:"vehicle_photo_04.jpg",title:"Passenger-seat equipment location",location:"Under passenger seat",tags:"electrical seat base control module installation access"},
  {id:"photo-05",file:"vehicle_photo_05.jpg",title:"Seat-base control module and cabling",location:"Under passenger seat",tags:"electrical control module wiring connector access"},
  {id:"photo-06",file:"vehicle_photo_06.jpg",title:"Calira EVS 30/20 identification",location:"Electrical compartment",tags:"electrical charger label model EVS 30/20 identification"}
];

const DATA={chapters:[],pages:[],diagnostics:[],maintenanceTasks:[],assistantPrompts:[],build:null,electrical:[],electricalRelations:[],fuses:[],water:[],waterRelations:[],gas:[],gasRelations:[],vehicleExplorer:[],vehicleConfigSchema:null,partsInventory:[],campsites:[],touringChecks:[],touringOperations:null,packingTemplates:null};
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
let fuseBoxFilter="all";
let activeFuseIndex=0;
let activeTouringStage="departure";
let editingTripId=null;
let editingCampsiteId=null;
let activePackingListId=null;
let editingPackingItemId=null;
let maintenanceFilter="all";
let editingVehicleDocumentId=null;
let editingInventoryId=null;
let faultFilter="active";
let editingFaultId=null;
let upgradeFilter="active";
let editingUpgradeId=null;
let activeVehiclePhotoId=null;
let partsFilter="all";
let activePartId=null;
let expenseFilter="all";
let expensePeriod="all";
let editingExpenseId=null;
let activeConfigurationSection="identity";

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
  if(id==="home")renderHome();
  $("#content").focus({preventScroll:true});scrollTo(0,0);closeDrawer();
}
function openDrawer(){$("#drawer").classList.add("open");$("#drawer").setAttribute("aria-hidden","false");$("#scrim").hidden=false;$("#menuButton").setAttribute("aria-expanded","true")}
function closeDrawer(){$("#drawer").classList.remove("open");$("#drawer").setAttribute("aria-hidden","true");$("#scrim").hidden=true;$("#menuButton").setAttribute("aria-expanded","false")}
function applyTheme(){document.documentElement.dataset.theme=state.theme==="dark"?"dark":"light"}

const NAV=[
  ["home","Home","⌂"],["assistant","Assistant","✦"],["search","Search","⌕"],["manuals","Manuals & chapters","▤"],
  ["maintenance","Service & maintenance","⚙"],["diagnostics","Diagnostics","✓"],["electrical","Electrical system","⚡"],["fuses","Fuse finder","▥"],["water","Water system","💧"],["gas","Gas system","🔥"],["touring","Touring","➜"],["vehicle","My motorhome","▣"],["settings","Settings","⋯"]
];
function renderNav(){
  $("#drawerNav").innerHTML=NAV.map(([id,label,icon])=>`<button data-route="${id}"><span>${icon}</span> ${label}</button>`).join("");
}
function moduleCard(id,icon,title,desc){return `<button class="module-card" data-route="${id}"><div class="icon">${icon}</div><h3>${title}</h3><p>${desc}</p></button>`}
function dashboardAlerts(){
  const alerts=[];
  (DATA.maintenanceTasks||[]).map(maintenanceTaskStatus).forEach(item=>{
    if(item.status==="overdue")alerts.push({priority:1,kind:"urgent",icon:"🔧",title:`${item.task.name} overdue`,detail:item.dueDate?`Due ${formatTripDate(item.dueDate)}`:`Due at ${Number(item.dueMileage).toLocaleString()} km`,route:"maintenance"});
    else if(item.status==="soon")alerts.push({priority:2,kind:"warning",icon:"🔧",title:`${item.task.name} due soon`,detail:item.dueDate?`Due ${formatTripDate(item.dueDate)}`:`Due at ${Number(item.dueMileage).toLocaleString()} km`,route:"maintenance"});
  });
  (state.vehicleDocuments||[]).forEach(document=>{
    const status=vehicleDocumentStatus(document);
    if(status.status==="expired")alerts.push({priority:1,kind:"urgent",icon:"📄",title:`${document.type} expired`,detail:document.expiry?formatTripDate(document.expiry):status.label,route:"vehicle"});
    else if(status.status==="expiring")alerts.push({priority:2,kind:"warning",icon:"📄",title:`${document.type} expires soon`,detail:document.expiry?formatTripDate(document.expiry):status.label,route:"vehicle"});
  });
  (state.faults||[]).filter(fault=>!["fixed","closed"].includes(String(fault.status||"").toLowerCase())).forEach(fault=>alerts.push({priority:1,kind:"urgent",icon:"⚠️",title:fault.title||"Open vehicle fault",detail:fault.diagnosticOutcome||"Review the saved fault record",route:"diagnostics"}));
  (state.packingLists||[]).forEach(list=>{const metrics=packingListMetrics(list),limit=Number(list.weightLimit)||0;if(limit&&metrics.total>limit)alerts.push({priority:2,kind:"warning",icon:"🎒",title:`${list.title} exceeds allowance`,detail:`${(metrics.total-limit).toFixed(1)} kg over its packing allowance`,route:"touring"})});
  const payload=payloadMetrics();if(payload.mam&&payload.emptyMass&&payload.remaining<0)alerts.push({priority:1,kind:"urgent",icon:"⚖️",title:"Estimated travelling mass exceeds MAM",detail:`${Math.abs(payload.remaining).toFixed(1)} kg over the entered limit`,route:"touring"});
  (state.upgradeProjects||[]).filter(project=>project.status!=="complete").forEach(project=>{
    if(project.status==="blocked")alerts.push({priority:2,kind:"warning",icon:"🧱",title:`${project.title} is blocked`,detail:"Review the upgrade plan and next action",route:"vehicle"});
    else if(Number(project.budget)>0&&Number(project.spent)>Number(project.budget))alerts.push({priority:2,kind:"warning",icon:"💶",title:`${project.title} is over budget`,detail:`€${(Number(project.spent)-Number(project.budget)).toFixed(2)} over plan`,route:"vehicle"});
  });
  (DATA.partsInventory||[]).forEach(part=>{const stock=partStock(part);if(stock.quantity<stock.target)alerts.push({priority:2,kind:"warning",icon:"📦",title:`${part.name} low`,detail:`${stock.quantity} onboard; target ${stock.target}`,route:"vehicle"})});
  return alerts.sort((a,b)=>a.priority-b.priority||a.title.localeCompare(b.title));
}
function renderDashboard(){
  const alerts=dashboardAlerts();
  $("#operationsAlerts").innerHTML=alerts.length?alerts.slice(0,8).map(alert=>`<button class="dashboard-alert ${alert.kind}" data-route="${alert.route}"><span aria-hidden="true">${alert.icon}</span><span><strong>${esc(alert.title)}</strong><small>${esc(alert.detail)}</small></span><b aria-hidden="true">→</b></button>`).join(""):'<div class="dashboard-clear"><span aria-hidden="true">✓</span><div><strong>No active alerts</strong><p>Maintenance, documents, faults and packing allowances are clear.</p></div></div>';
  const touringLists=DATA.touringOperations?.lists||[],touringTotal=touringLists.reduce((sum,list)=>sum+list.items.length,0),touringDone=touringLists.reduce((sum,list)=>sum+list.items.filter(item=>state.touringProgress?.[`${list.id}:${item.id}`]).length,0);
  const maintenance=(DATA.maintenanceTasks||[]).map(maintenanceTaskStatus),maintenanceClear=!maintenance.some(item=>item.status==="overdue");
  const documentsClear=!(state.vehicleDocuments||[]).some(document=>["expired","expiring"].includes(vehicleDocumentStatus(document).status));
  const packing=state.packingLists?.[0],packingMetrics=packing?packingListMetrics(packing):null,packingReady=packingMetrics?packingMetrics.totalCount>0&&packingMetrics.packedCount===packingMetrics.totalCount:null;
  const payload=payloadMetrics(),payloadReady=payload.mam>0&&payload.emptyMass>0&&payload.remaining>=0;
  const checks=[
    {label:"Journey checks",value:touringTotal?`${touringDone}/${touringTotal}`:"Not loaded",done:touringTotal>0&&touringDone===touringTotal,route:"touring"},
    {label:"Maintenance",value:maintenanceClear?"No overdue tasks":"Overdue work",done:maintenanceClear,route:"maintenance"},
    {label:"Vehicle documents",value:documentsClear?"No expiry alerts":"Needs attention",done:documentsClear,route:"vehicle"},
    {label:"Packing",value:packingMetrics?`${packingMetrics.packedCount}/${packingMetrics.totalCount} packed`:"No active list",done:packingReady===true,route:"touring"},
    {label:"Payload",value:payload.mam&&payload.emptyMass?(payload.remaining>=0?`${payload.remaining.toFixed(1)} kg margin`:`${Math.abs(payload.remaining).toFixed(1)} kg over MAM`):"Loading plan not set",done:payloadReady,route:"touring"}
  ];
  $("#readinessChecks").innerHTML=checks.map(check=>`<button class="readiness-row ${check.done?"ready":""}" data-route="${check.route}"><span>${check.done?"✓":"!"}</span><strong>${esc(check.label)}</strong><small>${esc(check.value)}</small></button>`).join("");
  const activity=[
    ...(state.logs||[]).map(item=>({date:item.date||item.createdAt,icon:"🔧",title:item.title||"Service record",type:"Service",route:"maintenance"})),
    ...(state.trips||[]).map(item=>({date:item.startDate||item.createdAt,icon:"🗺️",title:item.title||item.destination||"Touring trip",type:"Trip",route:"touring"})),
    ...(state.expenses||[]).map(item=>({date:item.date||item.createdAt,icon:"💶",title:item.vendor||`${item.type||"Touring"} expense`,type:"Expense",route:"touring"})),
    ...(state.diagnosticReports||[]).map(item=>({date:item.completedAt||item.createdAt,icon:"🧰",title:item.title||"Diagnostic report",type:"Diagnostic",route:"diagnostics"})),
    ...(state.vehicleDocuments||[]).map(item=>({date:item.updatedAt||item.createdAt,icon:"📄",title:item.type||"Vehicle document",type:"Document",route:"vehicle"})),
    ...(state.upgradeProjects||[]).map(item=>({date:item.updatedAt||item.createdAt,icon:"🛠️",title:item.title||"Upgrade project",type:"Upgrade",route:"vehicle"}))
  ].filter(item=>item.date).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,6);
  $("#recentActivity").innerHTML=activity.length?activity.map(item=>`<button class="panel activity-card" data-route="${item.route}"><span aria-hidden="true">${item.icon}</span><span><small>${esc(item.type)} • ${esc(formatTripDate(String(item.date).slice(0,10)))}</small><strong>${esc(item.title)}</strong></span><b aria-hidden="true">→</b></button>`).join(""):'<article class="panel"><p>No recorded activity yet. Completed service, trips, diagnostics and document updates will appear here.</p></article>';
}
function renderHome(){
  const openFaults=(state.faults||[]).filter(x=>!["fixed","closed"].includes(String(x.status||"").toLowerCase())).length;
  const services=(state.logs||[]).length;
  const alertCount=dashboardAlerts().length;
  $("#statusGrid").innerHTML=[
    [APP_VERSION,"Current version"],[alertCount,"Needs attention"],[openFaults,"Open faults"],[services,"Service records"],[(state.trips||[]).length,"Trips recorded"]
  ].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  renderDashboard();
  $("#homeModules").innerHTML=[
    moduleCard("electrical","⚡","Electrical system","Trace 12 V, mains and planned upgrades"),
    moduleCard("fuses","▥","Fuse finder","Identify Calira fuses and protected circuits"),
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
  if(Object.values(state.vehicleProfile||{}).some(Boolean))docs.push({type:"vehicle",title:`${state.vehicleProfile.make||""} ${state.vehicleProfile.model||"Vehicle details"}`.trim(),text:JSON.stringify(state.vehicleProfile),raw:state.vehicleProfile});
  if(Object.values(state.vehicleConfiguration||{}).some(Boolean))docs.push({type:"vehicle configuration",title:"Installed systems and specifications",text:JSON.stringify(state.vehicleConfiguration),raw:state.vehicleConfiguration});
  (state.vehicleDocuments||[]).forEach(d=>docs.push({type:"vehicle document",title:d.type||"Vehicle document",text:JSON.stringify(d),raw:d}));
  (state.inventory||[]).forEach(d=>docs.push({type:"inventory",title:d.name||"Onboard item",text:JSON.stringify(d),raw:d}));
  (state.upgradeProjects||[]).forEach(d=>docs.push({type:"upgrade project",title:d.title||"Upgrade project",text:JSON.stringify(d),raw:d}));
  VEHICLE_PHOTOS.forEach(photo=>{const note=state.vehiclePhotoNotes?.[photo.id]||{};docs.push({type:"vehicle photo",title:note.title||photo.title,text:`${photo.location} ${photo.tags} ${note.location||""} ${note.notes||""}`,raw:photo})});
  (DATA.partsInventory||[]).forEach(part=>docs.push({type:"parts stock",title:part.name,text:JSON.stringify({...part,...partStock(part)}),raw:part}));
  (state.trips||[]).forEach(d=>docs.push({type:"trip",title:d.title||d.destination||"Touring trip",text:JSON.stringify(d),raw:d}));
  (state.expenses||[]).forEach(d=>docs.push({type:"touring expense",title:d.vendor||`${d.type||"Touring"} expense`,text:JSON.stringify(d),raw:d}));
  (state.savedCampsites||[]).forEach(d=>docs.push({type:"campsite",title:d.name||"Saved campsite",text:JSON.stringify(d),raw:d}));
  (state.packingLists||[]).forEach(d=>docs.push({type:"packing list",title:d.title||"Packing list",text:JSON.stringify(d),raw:d}));
  if(Object.values(state.payloadPlan||{}).some(Boolean))docs.push({type:"payload plan",title:"Payload and travelling mass plan",text:JSON.stringify(state.payloadPlan),raw:state.payloadPlan});
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
  const scheduled=tasks.map(task=>maintenanceTaskStatus(task));
  const counts={overdue:scheduled.filter(item=>item.status==="overdue").length,soon:scheduled.filter(item=>item.status==="soon").length,baseline:scheduled.filter(item=>item.status==="baseline").length};
  $("#maintenanceSummary").innerHTML=[
    [counts.overdue,"Overdue"],[counts.soon,"Due soon"],[logs.length,"Service records"],[state.currentMileage||0,"Current km"]
  ].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  $("#maintenanceMileage").value=state.currentMileage||"";
  const filters=[["all","All"],["overdue","Overdue"],["soon","Due soon"],["upcoming","Upcoming"],["baseline","Set baseline"]];
  $("#maintenanceFilters").innerHTML=filters.map(([id,label])=>`<button class="chip ${maintenanceFilter===id?"active":""}" data-maintenance-filter="${id}">${label}</button>`).join("");
  const visible=scheduled.filter(item=>maintenanceFilter==="all"||item.status===maintenanceFilter);
  $("#maintenanceList").innerHTML=visible.length?visible.map(item=>{
    const task=item.task;
    return `<article class="panel maintenance-card status-${item.status}">
      <div class="maintenance-card-head"><div><span class="maintenance-status">${esc(item.label)}</span><h2>${esc(task.name||task.title)}</h2><p>${esc(task.category||task.system||"Vehicle")}</p></div><span aria-hidden="true">${diagnosticIcon(task.system)}</span></div>
      <div class="maintenance-due">${item.dueDate?`<div><span>Due date</span><strong>${esc(formatTripDate(item.dueDate))}</strong></div>`:""}${item.dueMileage!==null?`<div><span>Due mileage</span><strong>${item.dueMileage.toLocaleString()} km</strong></div>`:""}${item.status==="baseline"?'<div><span>Schedule</span><strong>Complete once to start</strong></div>':""}</div>
      <p class="maintenance-interval">${esc(maintenanceInterval(task))}</p>
      <div class="trip-card-actions"><button class="primary-btn" data-maintenance-complete="${esc(task.id)}">Record completion</button>${task.chapter?`<button class="secondary-btn" data-chapter-nav="${Number(task.chapter)}">Chapter ${Number(task.chapter)}</button>`:""}</div>
    </article>`;
  }).join(""):'<article class="panel"><h2>No tasks in this view</h2><p>Choose another status filter.</p></article>';
  $("#serviceHistory").innerHTML=logs.length?logs.map((record,index)=>`<button class="panel service-record" data-service-record="${index}"><span class="meta">${esc(formatTripDate(record.date))}${record.mileage!==null&&record.mileage!==undefined&&record.mileage!==""?` • ${Number(record.mileage).toLocaleString()} km`:""}</span><strong>${esc(record.title||"Completed work")}</strong><span>${esc(record.provider||"Provider not recorded")}</span></button>`).join(""):'<article class="panel"><p>No service records have been added yet.</p></article>';
}
function addMonths(dateValue,months){
  const date=new Date(`${dateValue}T00:00:00Z`),day=date.getUTCDate();
  date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+Number(months));const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(day,last));
  return date.toISOString().slice(0,10);
}
function maintenanceInterval(task){
  const parts=[];if(Number(task.intervalMonths))parts.push(`every ${Number(task.intervalMonths)} months`);if(Number(task.intervalKm))parts.push(`every ${Number(task.intervalKm).toLocaleString()} km`);
  return parts.length?parts.join(" or "):"Inspect as required";
}
function maintenanceTaskStatus(task){
  const record=(state.logs||[]).filter(item=>item.taskId===task.id).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0];
  if(!record)return {task,status:"baseline",label:"Baseline needed",dueDate:null,dueMileage:null};
  const dueDate=Number(task.intervalMonths)&&record.date?addMonths(record.date,task.intervalMonths):null;
  const mileage=record.mileage===""||record.mileage===null||record.mileage===undefined?null:Number(record.mileage);
  const dueMileage=Number(task.intervalKm)&&mileage!==null?mileage+Number(task.intervalKm):null;
  const today=new Date(`${new Date().toISOString().slice(0,10)}T00:00:00Z`);
  const days=dueDate?Math.ceil((new Date(`${dueDate}T00:00:00Z`)-today)/86400000):null;
  const km=dueMileage!==null?dueMileage-(Number(state.currentMileage)||0):null;
  if((days!==null&&days<0)||(km!==null&&km<0))return {task,status:"overdue",label:"Overdue",dueDate,dueMileage};
  if((days!==null&&days<=30)||(km!==null&&km<=1000))return {task,status:"soon",label:"Due soon",dueDate,dueMileage};
  return {task,status:"upcoming",label:"Upcoming",dueDate,dueMileage};
}
function openServiceRecord(taskId=""){
  const task=DATA.maintenanceTasks.find(item=>item.id===taskId);
  $("#serviceRecordDialogTitle").textContent=task?"Record task completion":"Add service record";
  $("#serviceTaskId").value=task?.id||"";
  $("#serviceTitle").value=task?.name||"";
  $("#serviceDate").value=new Date().toISOString().slice(0,10);
  $("#serviceMileage").value=state.currentMileage||"";
  $("#serviceProvider").value="";$("#serviceCost").value="";$("#serviceNotes").value="";
  const dialog=$("#serviceRecordDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
  setTimeout(()=>$("#serviceTitle").focus(),0);
}
function closeServiceRecord(){
  const dialog=$("#serviceRecordDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");
}
function saveServiceRecord(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));
  const mileage=values.mileage===""?null:Number(values.mileage),cost=values.cost===""?null:Number(values.cost);
  const record={id:`service-${Date.now()}`,taskId:values.taskId||"",title:values.title.trim(),date:values.date,mileage,provider:values.provider.trim(),cost,notes:values.notes.trim(),createdAt:new Date().toISOString()};
  state.logs=[record,...(state.logs||[])];if(mileage!==null&&mileage>(Number(state.currentMileage)||0))state.currentMileage=mileage;
  saveState();closeServiceRecord();renderMaintenance();renderHome();toast("Service record saved");
}
function openServiceRecordDetail(index){
  const record=(state.logs||[])[Number(index)];if(!record)return;
  const task=DATA.maintenanceTasks.find(item=>item.id===record.taskId);
  showDialog("Service record",record.title,`<div class="diagnostic-meta"><span>${esc(formatTripDate(record.date))}</span>${record.mileage!==null&&record.mileage!==undefined&&record.mileage!==""?`<span>${Number(record.mileage).toLocaleString()} km</span>`:""}${record.cost!==null&&record.cost!==undefined&&record.cost!==""?`<span>€${Number(record.cost).toFixed(2)}</span>`:""}</div><dl class="component-facts"><div><dt>Provider</dt><dd>${esc(record.provider||"Not recorded")}</dd></div><div><dt>Schedule</dt><dd>${esc(task?maintenanceInterval(task):"General service record")}</dd></div></dl>${record.notes?`<section class="detail-section"><h3>Notes</h3><p>${esc(record.notes)}</p></section>`:""}${task?.chapter?`<div class="diagnostic-link-row"><button class="secondary-btn" data-chapter-nav="${Number(task.chapter)}">Chapter ${Number(task.chapter)}</button></div>`:""}`);
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
  renderFaultLog();

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
function renderFaultLog(){
  const faults=state.faults||[],active=faults.filter(item=>!["fixed","closed"].includes(String(item.status||"open").toLowerCase()));
  $("#faultSummary").innerHTML=[[active.length,"Active faults"],[active.filter(item=>["critical","high"].includes(item.severity)).length,"High priority"],[faults.filter(item=>["fixed","closed"].includes(item.status)).length,"Resolved"]].map(([v,l])=>`<article class="stat-card"><strong>${v}</strong><span>${l}</span></article>`).join("");
  const filters=[["active","Active"],["open","Open"],["monitoring","Monitoring"],["fixed","Fixed"],["closed","Closed"],["all","All"]];
  $("#faultFilters").innerHTML=filters.map(([id,label])=>`<button class="chip ${faultFilter===id?"active":""}" data-fault-filter="${id}">${label}</button>`).join("");
  const visible=faults.filter(item=>faultFilter==="all"||(faultFilter==="active"?!["fixed","closed"].includes(item.status||"open"):(item.status||"open")===faultFilter));
  $("#faultList").innerHTML=visible.length?visible.map(item=>`<article class="panel fault-card severity-${esc(item.severity||"medium")} status-${esc(item.status||"open")}">
    <div class="fault-card-head"><div><span class="maintenance-status">${esc(item.status||"open")}</span><h3>${esc(item.title||"Vehicle fault")}</h3><p>${diagnosticIcon(item.system||(item.diagnosticReport?.systems||[])[0])} ${esc(item.system||(item.diagnosticReport?.systems||[])[0]||"vehicle")} • ${esc(item.severity||"medium")} severity</p></div><span class="fault-date">${esc(formatTripDate((item.date||item.createdAt||new Date().toISOString()).slice(0,10)))}</span></div>
    ${item.symptoms||item.diagnosticOutcome?`<p class="fault-symptoms">${esc(item.symptoms||item.diagnosticOutcome)}</p>`:""}
    ${item.resolution?`<div class="fault-resolution"><strong>Resolution / next action</strong><span>${esc(item.resolution)}</span></div>`:""}
    <div class="diagnostic-meta">${item.location?`<span>${esc(item.location)}</span>`:""}${item.mileage!==null&&item.mileage!==undefined?`<span>${Number(item.mileage).toLocaleString()} km</span>`:""}${item.diagnosticReport?'<span>Linked diagnostic</span>':""}</div>
    <div class="trip-card-actions"><button class="secondary-btn" data-fault-edit="${esc(item.id)}">Edit</button>${["fixed","closed"].includes(item.status)?`<button class="secondary-btn" data-fault-status="${esc(item.id)}" data-status="open">Reopen</button>`:`<button class="primary-btn" data-fault-status="${esc(item.id)}" data-status="fixed">Mark fixed</button>`}<button class="danger-btn" data-fault-delete="${esc(item.id)}">Delete</button></div>
  </article>`).join(""):'<article class="panel trip-empty"><span aria-hidden="true">✓</span><h3>No faults in this view</h3><p>Add an issue manually or save one from a guided diagnostic.</p></article>';
}
function openFaultEditor(id=null){
  editingFaultId=id;const item=(state.faults||[]).find(entry=>entry.id===id)||{};
  $("#faultDialogTitle").textContent=id?"Edit fault":"Add fault";$("#faultTitle").value=item.title||"";$("#faultSystem").value=item.system||(item.diagnosticReport?.systems||[])[0]||"vehicle";$("#faultSeverity").value=item.severity||"medium";$("#faultStatus").value=item.status||"open";$("#faultDate").value=(item.date||item.createdAt||new Date().toISOString()).slice(0,10);$("#faultMileage").value=item.mileage??state.currentMileage??"";$("#faultLocation").value=item.location||"";$("#faultSymptoms").value=item.symptoms||item.diagnosticOutcome||"";$("#faultResolution").value=item.resolution||"";
  const dialog=$("#faultDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeFaultEditor(){const dialog=$("#faultDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingFaultId=null}
function saveFault(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.faults||[]).find(item=>item.id===editingFaultId),resolved=["fixed","closed"].includes(values.status);
  const item={...existing,id:existing?.id||`fault-${Date.now()}`,title:values.title.trim(),system:values.system,severity:values.severity,status:values.status,date:values.date,mileage:values.mileage===""?null:Number(values.mileage),location:values.location.trim(),symptoms:values.symptoms.trim(),resolution:values.resolution.trim(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),resolvedAt:resolved?(existing?.resolvedAt||new Date().toISOString()):null};
  state.faults=existing?state.faults.map(entry=>entry.id===existing.id?item:entry):[item,...(state.faults||[])];saveState();closeFaultEditor();renderDiagnostics();renderHome();toast(existing?"Fault updated":"Fault added");
}
function setFaultStatus(id,status){const item=(state.faults||[]).find(entry=>entry.id===id);if(!item)return;item.status=status;item.updatedAt=new Date().toISOString();item.resolvedAt=["fixed","closed"].includes(status)?new Date().toISOString():null;saveState();renderDiagnostics();renderHome();toast(status==="fixed"?"Fault marked fixed":"Fault reopened")}
function deleteFault(id){const item=(state.faults||[]).find(entry=>entry.id===id);if(!item||!confirm(`Delete “${item.title}”? This cannot be undone.`))return;state.faults=state.faults.filter(entry=>entry.id!==id);saveState();renderDiagnostics();renderHome();toast("Fault deleted")}
function renderTouring(){
  const lists=DATA.touringOperations?.lists||[];
  const stage=lists.find(x=>x.id===activeTouringStage)||lists[0];
  if(stage)activeTouringStage=stage.id;
  const total=lists.reduce((sum,list)=>sum+list.items.length,0);
  const completed=lists.reduce((sum,list)=>sum+list.items.filter(item=>state.touringProgress?.[`${list.id}:${item.id}`]).length,0);
  const stageDone=stage?stage.items.filter(item=>state.touringProgress?.[`${stage.id}:${item.id}`]).length:0;
  $("#touringProgress").innerHTML=[
    [completed,`of ${total} journey checks`],
    [lists.filter(list=>list.items.every(item=>state.touringProgress?.[`${list.id}:${item.id}`])).length,`of ${lists.length} stages complete`],
    [total?`${Math.round(completed/total*100)}%`:"0%","Overall progress"]
  ].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  $("#touringStageTabs").innerHTML=lists.map(list=>{
    const done=list.items.filter(item=>state.touringProgress?.[`${list.id}:${item.id}`]).length;
    return `<button class="tab ${activeTouringStage===list.id?"active":""}" data-touring-stage="${esc(list.id)}">${esc(list.icon)} ${esc(list.title)} <span>${done}/${list.items.length}</span></button>`;
  }).join("");
  if(stage){
    $("#touringChecklist").innerHTML=`<div class="touring-checklist-head"><span class="meta">${esc(stage.icon)} Journey stage</span><h2>${esc(stage.title)}</h2><p>${esc(stage.description)}</p><div class="touring-progress-bar"><span style="width:${stage.items.length?stageDone/stage.items.length*100:0}%"></span></div></div><div class="touring-check-items">${stage.items.map((item,index)=>{
      const checked=Boolean(state.touringProgress?.[`${stage.id}:${item.id}`]);
      return `<button class="touring-check ${checked?"complete":""}" data-touring-check="${esc(item.id)}" role="checkbox" aria-checked="${checked}"><span class="touring-check-box">${checked?"✓":index+1}</span><span>${esc(item.text)}</span></button>`;
    }).join("")}</div>`;
    $("#touringStageInfo").innerHTML=`<span class="meta">Stage progress</span><h2>${stageDone} of ${stage.items.length}</h2><p>${stageDone===stage.items.length?"Stage complete. Review once more immediately before acting.":"Progress is saved automatically on this device."}</p><div class="diagnostic-actions"><button class="danger-btn" data-touring-reset="${esc(stage.id)}">Reset this stage</button>${(stage.manualPages||[]).map(n=>`<button class="secondary-btn" data-manual-nav="${Number(n)}">Manual p. ${Number(n)}</button>`).join("")}</div>`;
  }else{
    $("#touringChecklist").innerHTML="<h2>Touring checklist unavailable</h2>";
    $("#touringStageInfo").innerHTML="<p>Reload while online to restore the installed touring data.</p>";
  }
  const cards=[
    ["packing","🎒","Packing","Templates and essential equipment"],
    ["campsites","🏕️","Campsites","Saved campsite information"],
    ["travel-log","📝","Travel log","Record trips and useful notes"]
  ];
  $("#touringCards").innerHTML=cards.map(([id,icon,title,desc])=>`<button class="module-card" data-touring="${id}"><div class="icon">${icon}</div><h3>${title}</h3><p>${desc}</p></button>`).join("");
  renderTravelJournal();
  renderExpenses();
  renderCampsites();
  renderPacking();
}

function tripMetrics(trip){
  const start=trip.startDate?new Date(`${trip.startDate}T00:00:00Z`):null;
  const end=trip.endDate?new Date(`${trip.endDate}T00:00:00Z`):null;
  const nights=start&&end&&end>=start?Math.round((end-start)/86400000):0;
  const startMileage=Number(trip.startMileage),endMileage=Number(trip.endMileage);
  const distance=Number.isFinite(startMileage)&&Number.isFinite(endMileage)&&endMileage>=startMileage?endMileage-startMileage:0;
  return {nights,distance};
}
function formatTripDate(value){
  if(!value)return "Date not set";
  return new Intl.DateTimeFormat(undefined,{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(`${value}T00:00:00Z`));
}
function renderTravelJournal(){
  const trips=[...(state.trips||[])].sort((a,b)=>String(b.startDate||"").localeCompare(String(a.startDate||"")));
  const totals=trips.reduce((sum,trip)=>{const m=tripMetrics(trip);sum.nights+=m.nights;sum.distance+=m.distance;return sum},{nights:0,distance:0});
  $("#tripSummary").innerHTML=[[trips.length,"Trips recorded"],[totals.nights,"Nights away"],[`${totals.distance} km`,"Distance recorded"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  if(!trips.length){
    $("#tripList").innerHTML='<article class="panel trip-empty"><span aria-hidden="true">📝</span><h3>No trips recorded yet</h3><p>Add the first journey to build an offline touring history.</p><button class="primary-btn" data-trip-add>Add first trip</button></article>';
    return;
  }
  $("#tripList").innerHTML=trips.map(trip=>{
    const metrics=tripMetrics(trip);
    return `<article class="panel trip-card">
      <div class="trip-card-head"><div><span class="meta">${esc(formatTripDate(trip.startDate))} – ${esc(formatTripDate(trip.endDate))}</span><h3>${esc(trip.title||"Touring trip")}</h3><p>${esc(trip.destination||"Destination not recorded")}</p></div><span class="trip-distance">${metrics.distance} km</span></div>
      <div class="diagnostic-meta"><span>${metrics.nights} ${metrics.nights===1?"night":"nights"}</span>${trip.campsite?`<span>🏕️ ${esc(trip.campsite)}</span>`:""}</div>
      ${trip.notes?`<p class="trip-notes">${esc(trip.notes)}</p>`:""}
      <div class="trip-card-actions"><button class="secondary-btn" data-trip-edit="${esc(trip.id)}">Edit</button><button class="danger-btn" data-trip-delete="${esc(trip.id)}">Delete</button></div>
    </article>`;
  }).join("");
}
function openTripEditor(id=null){
  editingTripId=id;
  const trip=(state.trips||[]).find(item=>item.id===id)||{};
  $("#tripDialogTitle").textContent=id?"Edit trip":"Add trip";
  $("#tripTitle").value=trip.title||"";
  $("#tripDestination").value=trip.destination||"";
  $("#tripStartDate").value=trip.startDate||new Date().toISOString().slice(0,10);
  $("#tripEndDate").value=trip.endDate||trip.startDate||new Date().toISOString().slice(0,10);
  $("#tripStartMileage").value=trip.startMileage??"";
  $("#tripEndMileage").value=trip.endMileage??"";
  $("#tripCampsite").value=trip.campsite||"";
  $("#tripNotes").value=trip.notes||"";
  const dialog=$("#tripDialog");
  if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
  setTimeout(()=>$("#tripTitle").focus(),0);
}
function closeTripEditor(){
  const dialog=$("#tripDialog");
  if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");
  editingTripId=null;
}
function saveTrip(event){
  event.preventDefault();
  const values=Object.fromEntries(new FormData(event.currentTarget));
  if(values.endDate<values.startDate){toast("End date must be on or after the start date");return}
  const startMileage=values.startMileage===""?null:Number(values.startMileage);
  const endMileage=values.endMileage===""?null:Number(values.endMileage);
  if(startMileage!==null&&endMileage!==null&&endMileage<startMileage){toast("End mileage must be at least the start mileage");return}
  const existing=(state.trips||[]).find(item=>item.id===editingTripId);
  const trip={id:existing?.id||`trip-${Date.now()}`,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),title:values.title.trim(),destination:values.destination.trim(),startDate:values.startDate,endDate:values.endDate,startMileage,endMileage,campsite:values.campsite.trim(),notes:values.notes.trim()};
  state.trips=existing?(state.trips||[]).map(item=>item.id===existing.id?trip:item):[trip,...(state.trips||[])];
  saveState();closeTripEditor();renderTouring();toast(existing?"Trip updated":"Trip added");
}
function deleteTrip(id){
  const trip=(state.trips||[]).find(item=>item.id===id);
  if(!trip||!confirm(`Delete “${trip.title||"this trip"}”? This cannot be undone.`))return;
  state.trips=state.trips.filter(item=>item.id!==id);saveState();renderTouring();toast("Trip deleted");
}
function expenseIcon(type){return ({fuel:"⛽",campsite:"🏕️",toll:"🛣️",ferry:"⛴️",supplies:"🛒",service:"🔧",other:"💶"}[type]||"💶")}
function expensesForPeriod(){
  const expenses=[...(state.expenses||[])],now=new Date(),cutoff=expensePeriod==="30d"?new Date(now.getTime()-30*86400000):expensePeriod==="12m"?new Date(Date.UTC(now.getUTCFullYear()-1,now.getUTCMonth(),now.getUTCDate())):null;
  return expenses.filter(item=>!cutoff||new Date(`${item.date}T23:59:59Z`)>=cutoff).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
}
function renderExpenses(){
  const expenses=expensesForPeriod(),fuel=expenses.filter(item=>item.type==="fuel"),total=expenses.reduce((sum,item)=>sum+(Number(item.amount)||0),0),litres=fuel.reduce((sum,item)=>sum+(Number(item.litres)||0),0);
  $("#expenseSummary").innerHTML=[[expenses.length,"Entries"],[`€${total.toFixed(2)}`,"Total spend"],[`${litres.toFixed(1)} L`,"Fuel recorded"],[fuel.length?`€${fuel.reduce((sum,item)=>sum+(Number(item.amount)||0),0).toFixed(2)}`:"€0.00","Fuel spend"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  const periods=[["all","All time"],["12m","Last 12 months"],["30d","Last 30 days"]];
  $("#expensePeriodFilters").innerHTML=periods.map(([id,label])=>`<button class="chip ${expensePeriod===id?"active":""}" data-expense-period="${id}">${label}</button>`).join("");
  const types=[["all","All"],["fuel","Fuel"],["campsite","Campsites"],["toll","Tolls"],["ferry","Ferries"],["supplies","Supplies"],["service","Service"],["other","Other"]];
  $("#expenseFilters").innerHTML=types.map(([id,label])=>`<button class="chip ${expenseFilter===id?"active":""}" data-expense-filter="${id}">${label}</button>`).join("");
  const categoryTotals=types.slice(1).map(([id,label])=>({id,label,total:expenses.filter(item=>item.type===id).reduce((sum,item)=>sum+(Number(item.amount)||0),0)})).filter(item=>item.total>0).sort((a,b)=>b.total-a.total);
  const tripCosts=(state.trips||[]).map(trip=>{const entries=expenses.filter(item=>item.tripId===trip.id),cost=entries.reduce((sum,item)=>sum+(Number(item.amount)||0),0),fuelLitres=entries.filter(item=>item.type==="fuel").reduce((sum,item)=>sum+(Number(item.litres)||0),0),distance=tripMetrics(trip).distance;return {trip,cost,fuelLitres,distance}}).filter(item=>item.cost>0).sort((a,b)=>b.cost-a.cost);
  $("#expenseInsights").innerHTML=`<article class="panel cost-breakdown"><h3>Spend by category</h3>${categoryTotals.length?categoryTotals.map(item=>`<div class="cost-row"><span>${expenseIcon(item.id)} ${esc(item.label)}</span><div><i style="width:${total?Math.max(2,item.total/total*100):0}%"></i></div><strong>€${item.total.toFixed(2)}</strong></div>`).join(""):"<p>No category data for this period.</p>"}</article><article class="panel trip-costs"><h3>Cost by trip</h3>${tripCosts.length?tripCosts.slice(0,8).map(item=>`<div class="trip-cost-row"><span><strong>${esc(item.trip.title||item.trip.destination||"Touring trip")}</strong><small>${item.distance?`${item.distance.toLocaleString()} km • €${(item.cost/item.distance).toFixed(2)}/km`:"Distance not recorded"}${item.distance&&item.fuelLitres?` • ${(item.fuelLitres/item.distance*100).toFixed(1)} L/100 km`:""}</small></span><b>€${item.cost.toFixed(2)}</b></div>`).join(""):"<p>Link expenses to trips to compare journey costs.</p>"}</article>`;
  const visible=expenses.filter(item=>expenseFilter==="all"||item.type===expenseFilter);
  $("#expenseList").innerHTML=visible.length?visible.map(item=>{const trip=(state.trips||[]).find(entry=>entry.id===item.tripId);return `<article class="panel expense-card">
    <span class="expense-icon">${expenseIcon(item.type)}</span><div><span class="meta">${esc(formatTripDate(item.date))} • ${esc(item.type)}</span><strong>${esc(item.vendor||"Touring expense")}</strong><small>${trip?`Trip: ${esc(trip.title||trip.destination)}`:"No linked trip"}${item.litres?` • ${Number(item.litres).toFixed(1)} L`:""}${item.mileage!==null&&item.mileage!==undefined&&item.mileage!==""?` • ${Number(item.mileage).toLocaleString()} km`:""}</small>${item.notes?`<p>${esc(item.notes)}</p>`:""}</div><strong class="expense-amount">€${(Number(item.amount)||0).toFixed(2)}</strong><div class="expense-actions"><button class="secondary-btn" data-expense-edit="${esc(item.id)}">Edit</button><button class="danger-btn" data-expense-delete="${esc(item.id)}">Delete</button></div>
  </article>`}).join(""):'<article class="panel trip-empty"><p>No touring expenses match this view.</p><button class="primary-btn" data-expense-add>Add first expense</button></article>';
}
function exportExpenseCsv(){
  const quote=value=>`"${String(value??"").replace(/"/g,'""')}"`,header=["Date","Type","Amount EUR","Trip","Litres","Mileage km","Vendor","Notes"],rows=expensesForPeriod().map(item=>{const trip=(state.trips||[]).find(entry=>entry.id===item.tripId);return [item.date,item.type,Number(item.amount||0).toFixed(2),trip?.title||trip?.destination||"",item.litres??"",item.mileage??"",item.vendor||"",item.notes||""]});
  const blob=new Blob([[header,...rows].map(row=>row.map(quote).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-touring-expenses-${expensePeriod}-${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Expense CSV exported");
}
function openExpenseEditor(id=null){
  editingExpenseId=id;const item=(state.expenses||[]).find(entry=>entry.id===id)||{};$("#expenseDialogTitle").textContent=id?"Edit expense":"Add expense";$("#expenseDate").value=item.date||new Date().toISOString().slice(0,10);$("#expenseType").value=item.type||"fuel";$("#expenseAmount").value=item.amount??"";$("#expenseTrip").innerHTML='<option value="">No linked trip</option>'+(state.trips||[]).map(trip=>`<option value="${esc(trip.id)}">${esc(trip.title||trip.destination||"Touring trip")}</option>`).join("");$("#expenseTrip").value=item.tripId||"";$("#expenseLitres").value=item.litres??"";$("#expenseMileage").value=item.mileage??state.currentMileage??"";$("#expenseVendor").value=item.vendor||"";$("#expenseNotes").value=item.notes||"";const dialog=$("#expenseDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");setTimeout(()=>$("#expenseAmount").focus(),0);
}
function closeExpenseEditor(){const dialog=$("#expenseDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingExpenseId=null}
function saveExpense(event){event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.expenses||[]).find(item=>item.id===editingExpenseId);const expense={id:existing?.id||`expense-${Date.now()}`,date:values.date,type:values.type,amount:Number(values.amount)||0,tripId:values.tripId||"",litres:values.litres===""?null:Number(values.litres),mileage:values.mileage===""?null:Number(values.mileage),vendor:values.vendor.trim(),notes:values.notes.trim(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};state.expenses=existing?state.expenses.map(item=>item.id===existing.id?expense:item):[expense,...(state.expenses||[])];saveState();closeExpenseEditor();renderExpenses();renderHome();toast(existing?"Expense updated":"Expense added")}
function deleteExpense(id){const item=(state.expenses||[]).find(entry=>entry.id===id);if(!item||!confirm("Delete this expense?"))return;state.expenses=state.expenses.filter(entry=>entry.id!==id);saveState();renderExpenses();renderHome();toast("Expense deleted")}
function packingId(prefix){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}
function packingWeight(item){return (Number(item.quantity)||0)*(Number(item.unitWeight)||0)}
function packingListMetrics(list){
  const total=list.items.reduce((sum,item)=>sum+packingWeight(item),0);
  const packed=list.items.filter(item=>item.packed);
  return {total,packedWeight:packed.reduce((sum,item)=>sum+packingWeight(item),0),packedCount:packed.length,totalCount:list.items.length};
}
function payloadNumber(value){const match=String(value??"").replace(/,/g,"").match(/\d+(?:\.\d+)?/);return match?Number(match[0]):0}
function payloadMetrics(){
  const plan=state.payloadPlan||{},list=(state.packingLists||[]).find(item=>item.id===plan.packingListId);
  const packing=list?packingListMetrics(list).total:0,mam=payloadNumber(plan.mam)||(payloadNumber(state.vehicleConfiguration?.mam)||Number(state.vehicleProfile?.maxMass)||0);
  const emptyMass=payloadNumber(plan.emptyMass),occupants=payloadNumber(plan.occupants),water=payloadNumber(plan.waterLitres),fuel=payloadNumber(plan.fuelLitres)*.84,gas=payloadNumber(plan.gasKg),accessories=payloadNumber(plan.accessoriesKg);
  const load=occupants+water+fuel+gas+accessories+packing,travellingMass=emptyMass+load;
  return {plan,list,mam,emptyMass,occupants,water,fuel,gas,accessories,packing,load,travellingMass,remaining:mam?mam-travellingMass:null};
}
function renderPayloadPlanner(){
  const m=payloadMetrics(),complete=m.mam>0&&m.emptyMass>0,status=!complete?"Setup required":m.remaining<0?"Over MAM":m.remaining<50?"Low margin":"Within estimate";
  $("#payloadSummary").innerHTML=[[m.mam?`${m.mam.toFixed(0)} kg`:"Not set","Maximum authorised mass"],[`${m.load.toFixed(1)} kg`,"Estimated added load"],[m.emptyMass?`${m.travellingMass.toFixed(1)} kg`:"Not available","Estimated travelling mass"],[complete?`${Math.abs(m.remaining).toFixed(1)} kg`:"—",complete?(m.remaining<0?"Over limit":"Remaining margin"):"Set masses first"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  const rows=[["Occupants & pets",m.occupants],["Fresh water",m.water],["Diesel (0.84 kg/L)",m.fuel],["Gas cylinders",m.gas],["Permanent accessories",m.accessories],[m.list?`Packing: ${m.list.title}`:"Packing list",m.packing]];
  $("#payloadBreakdown").innerHTML=`<article class="panel payload-card ${complete&&m.remaining<0?"over":""}"><div class="payload-head"><div><span class="maintenance-status">${esc(status)}</span><h3>Loading breakdown</h3></div><strong>${m.load.toFixed(1)} kg</strong></div><div class="payload-rows">${rows.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${value.toFixed(1)} kg</strong></div>`).join("")}</div>${m.plan.notes?`<p class="trip-notes">${esc(m.plan.notes)}</p>`:""}</article><article class="panel payload-guidance"><h3>Use this as a planning estimate</h3><p>Confirm the vehicle’s plated MAM and obtain actual total and axle weights at a weighbridge. Do not rely on catalogue mass or this estimate for legal compliance.</p><div class="diagnostic-link-row"><button class="secondary-btn" data-manual-nav="183">Manual tyre table</button><button class="secondary-btn" data-manual-nav="193">Manual payload section</button><button class="secondary-btn" data-manual-nav="195">Payload formula</button><button class="secondary-btn" data-manual-nav="273">Departure checklist</button><button class="secondary-btn" data-chapter-nav="26">Chapter 26</button></div></article>`;
}
function openPayloadEditor(){
  const m=payloadMetrics(),plan=state.payloadPlan||{};
  $("#payloadMam").value=plan.mam||m.mam||"";$("#payloadEmptyMass").value=plan.emptyMass||"";$("#payloadOccupants").value=plan.occupants??0;$("#payloadWater").value=plan.waterLitres??0;$("#payloadFuel").value=plan.fuelLitres??0;$("#payloadGas").value=plan.gasKg??0;$("#payloadAccessories").value=plan.accessoriesKg??0;$("#payloadNotes").value=plan.notes||"";
  $("#payloadPackingList").innerHTML='<option value="">No packing list</option>'+(state.packingLists||[]).map(list=>`<option value="${esc(list.id)}">${esc(list.title)} — ${packingListMetrics(list).total.toFixed(1)} kg</option>`).join("");$("#payloadPackingList").value=plan.packingListId||activePackingListId||"";
  const dialog=$("#payloadDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closePayloadEditor(){const dialog=$("#payloadDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open")}
function savePayloadPlan(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));
  state.payloadPlan={mam:Number(values.mam)||0,emptyMass:Number(values.emptyMass)||0,occupants:Number(values.occupants)||0,waterLitres:Number(values.waterLitres)||0,fuelLitres:Number(values.fuelLitres)||0,gasKg:Number(values.gasKg)||0,accessoriesKg:Number(values.accessoriesKg)||0,packingListId:values.packingListId||"",notes:values.notes.trim(),updatedAt:new Date().toISOString()};
  saveState();closePayloadEditor();renderPayloadPlanner();renderHome();toast("Loading plan saved");
}
function renderPacking(){
  const lists=state.packingLists||[];
  renderPayloadPlanner();
  if(!lists.some(list=>list.id===activePackingListId))activePackingListId=lists[0]?.id||null;
  const active=lists.find(list=>list.id===activePackingListId);
  const allItems=lists.flatMap(list=>list.items||[]);
  const packedItems=allItems.filter(item=>item.packed);
  $("#packingSummary").innerHTML=[[lists.length,"Packing lists"],[packedItems.length,`of ${allItems.length} items packed`],[`${lists.reduce((sum,list)=>sum+packingListMetrics(list).total,0).toFixed(1)} kg`,"Estimated across lists"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  $("#packingLists").innerHTML=lists.length?`<span class="meta">Your lists</span><div class="packing-list-buttons">${lists.map(list=>{const m=packingListMetrics(list);return `<button class="${list.id===activePackingListId?"active":""}" data-packing-list="${esc(list.id)}"><strong>${esc(list.title)}</strong><span>${m.packedCount}/${m.totalCount} packed</span></button>`}).join("")}</div>`:'<div class="trip-empty"><span aria-hidden="true">🎒</span><h3>No packing lists</h3><p>Create a blank list or start from a reusable template.</p><button class="primary-btn" data-packing-add>Create first list</button></div>';
  if(!active){
    $("#packingDetail").innerHTML='<div class="trip-empty"><h3>Ready for the next trip</h3><p>Use a template to create an offline packing list with weight estimates.</p></div>';
    return;
  }
  const metrics=packingListMetrics(active),limit=Number(active.weightLimit)||0;
  const trip=(state.trips||[]).find(item=>item.id===active.tripId);
  const categories=[...new Set(active.items.map(item=>item.category||"Other"))];
  $("#packingDetail").innerHTML=`<div class="packing-head">
    <div><span class="meta">${trip?`Trip: ${esc(trip.title)}`:"Reusable packing list"}</span><h3>${esc(active.title)}</h3></div>
    <div class="packing-actions"><button class="secondary-btn" data-packing-duplicate="${esc(active.id)}">Duplicate</button><button class="danger-btn" data-packing-delete="${esc(active.id)}">Delete list</button></div>
  </div>
  <div class="packing-progress"><div><strong>${metrics.packedCount} of ${metrics.totalCount} packed</strong><span>${metrics.packedWeight.toFixed(1)} of ${metrics.total.toFixed(1)} kg packed</span></div><div class="touring-progress-bar"><span style="width:${metrics.totalCount?metrics.packedCount/metrics.totalCount*100:0}%"></span></div></div>
  <div class="packing-weight ${limit&&metrics.total>limit?"over":""}"><span>Estimated packing weight</span><strong>${metrics.total.toFixed(1)} kg</strong><small>${limit?`${Math.abs(limit-metrics.total).toFixed(1)} kg ${metrics.total>limit?"over":"remaining from"} ${limit.toFixed(1)} kg allowance`:"No allowance set"}</small></div>
  ${limit&&metrics.total>limit?'<div class="packing-warning"><strong>Packing allowance exceeded.</strong><span>Review item quantities and confirm the vehicle’s actual available payload before travel.</span></div>':""}
  <div class="packing-category-list">${categories.map(category=>`<section><h4>${esc(category)}</h4>${active.items.filter(item=>(item.category||"Other")===category).map(item=>`<div class="packing-item ${item.packed?"packed":""}">
    <button class="packing-toggle" data-packing-toggle="${esc(item.id)}" role="checkbox" aria-checked="${Boolean(item.packed)}"><span>${item.packed?"✓":""}</span><strong>${esc(item.name)}</strong><small>${Number(item.quantity)} × ${Number(item.unitWeight).toFixed(1)} kg</small></button>
    <button class="icon-btn" data-packing-item-edit="${esc(item.id)}" aria-label="Edit ${esc(item.name)}">✎</button>
    <button class="icon-btn packing-remove" data-packing-item-delete="${esc(item.id)}" aria-label="Delete ${esc(item.name)}">×</button>
  </div>`).join("")}</section>`).join("")}</div>
  <button class="primary-btn packing-add-item" data-packing-item-add>Add item</button>`;
}
function openPackingListEditor(){
  $("#packingTemplate").innerHTML='<option value="">Blank list</option>'+((DATA.packingTemplates?.templates||[]).map(template=>`<option value="${esc(template.id)}">${esc(template.title)}</option>`).join(""));
  $("#packingTrip").innerHTML='<option value="">No trip</option>'+((state.trips||[]).map(trip=>`<option value="${esc(trip.id)}">${esc(trip.title||trip.destination)}</option>`).join(""));
  $("#packingListForm").reset();$("#packingWeightLimit").value="100";
  const dialog=$("#packingListDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
  setTimeout(()=>$("#packingListTitle").focus(),0);
}
function closePackingListEditor(){
  const dialog=$("#packingListDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");
}
function createPackingList(event){
  event.preventDefault();
  const values=Object.fromEntries(new FormData(event.currentTarget));
  const template=(DATA.packingTemplates?.templates||[]).find(item=>item.id===values.template);
  const list={id:packingId("packing"),title:values.title.trim(),tripId:values.tripId||"",weightLimit:Number(values.weightLimit)||0,createdAt:new Date().toISOString(),items:(template?.items||[]).map(item=>({...item,id:packingId("item"),packed:false}))};
  state.packingLists=[list,...(state.packingLists||[])];activePackingListId=list.id;saveState();closePackingListEditor();renderPacking();toast("Packing list created");
}
function openPackingItemEditor(id=null){
  const list=(state.packingLists||[]).find(item=>item.id===activePackingListId);if(!list)return;
  editingPackingItemId=id;
  const item=list.items.find(entry=>entry.id===id)||{};
  $("#packingItemDialogTitle").textContent=id?"Edit item":"Add item";
  $("#packingItemName").value=item.name||"";$("#packingItemCategory").value=item.category||"";$("#packingItemQuantity").value=item.quantity??1;$("#packingItemWeight").value=item.unitWeight??0;
  const dialog=$("#packingItemDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
  setTimeout(()=>$("#packingItemName").focus(),0);
}
function closePackingItemEditor(){
  const dialog=$("#packingItemDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingPackingItemId=null;
}
function savePackingItem(event){
  event.preventDefault();
  const list=(state.packingLists||[]).find(item=>item.id===activePackingListId);if(!list)return;
  const values=Object.fromEntries(new FormData(event.currentTarget)),existing=list.items.find(item=>item.id===editingPackingItemId);
  const item={id:existing?.id||packingId("item"),name:values.name.trim(),category:values.category.trim(),quantity:Number(values.quantity)||1,unitWeight:Number(values.unitWeight)||0,packed:Boolean(existing?.packed)};
  list.items=existing?list.items.map(entry=>entry.id===existing.id?item:entry):[...list.items,item];saveState();closePackingItemEditor();renderPacking();toast(existing?"Packing item updated":"Packing item added");
}
function duplicatePackingList(id){
  const source=(state.packingLists||[]).find(list=>list.id===id);if(!source)return;
  const copy={...source,id:packingId("packing"),title:`${source.title} copy`,tripId:"",createdAt:new Date().toISOString(),items:source.items.map(item=>({...item,id:packingId("item"),packed:false}))};
  state.packingLists=[copy,...state.packingLists];activePackingListId=copy.id;saveState();renderPacking();toast("Packing list duplicated");
}
function deletePackingList(id){
  const list=(state.packingLists||[]).find(item=>item.id===id);if(!list||!confirm(`Delete “${list.title}”? This cannot be undone.`))return;
  state.packingLists=state.packingLists.filter(item=>item.id!==id);activePackingListId=state.packingLists[0]?.id||null;saveState();renderPacking();toast("Packing list deleted");
}
function deletePackingItem(id){
  const list=(state.packingLists||[]).find(item=>item.id===activePackingListId),item=list?.items.find(entry=>entry.id===id);
  if(!item||!confirm(`Delete “${item.name}”?`))return;
  list.items=list.items.filter(entry=>entry.id!==id);saveState();renderPacking();toast("Packing item deleted");
}
function normaliseWebsite(value){
  const input=String(value||"").trim();
  if(!input)return "";
  try{const url=new URL(input);return ["http:","https:"].includes(url.protocol)?url.href:""}catch{return ""}
}
function renderCampsites(){
  const all=state.savedCampsites||[];
  const query=($("#campsiteSearch")?.value||"").trim().toLowerCase();
  const campsites=all.filter(site=>!query||[site.name,site.location,site.pitch,site.notes,...(site.facilities||[])].join(" ").toLowerCase().includes(query));
  $("#campsiteSummary").innerHTML=[[all.length,"Saved places"],[all.filter(site=>site.favourite).length,"Favourites"],[all.filter(site=>Number(site.rating)>=4).length,"Rated 4 stars or more"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  if(!campsites.length){
    $("#campsiteList").innerHTML=`<article class="panel trip-empty"><span aria-hidden="true">🏕️</span><h3>${all.length?"No matching campsite":"No campsites saved yet"}</h3><p>${all.length?"Try a broader search.":"Save useful stops so their details remain available offline."}</p>${all.length?"":'<button class="primary-btn" data-campsite-add>Add first campsite</button>'}</article>`;
    return;
  }
  $("#campsiteList").innerHTML=campsites.map(site=>{
    const website=normaliseWebsite(site.website);
    const map=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.location||site.name)}`;
    return `<article class="panel campsite-card">
      <div class="trip-card-head"><div><span class="meta">${site.favourite?"★ Favourite":"Saved campsite"}</span><h3>${esc(site.name)}</h3><p>${esc(site.location)}</p></div><span class="campsite-rating" aria-label="${Number(site.rating)||0} out of 5 stars">${site.rating?"★".repeat(Number(site.rating)):"Not rated"}</span></div>
      ${site.pitch?`<p><strong>Pitch or area:</strong> ${esc(site.pitch)}</p>`:""}
      ${(site.facilities||[]).length?`<div class="campsite-tags">${site.facilities.map(item=>`<span>${esc(item)}</span>`).join("")}</div>`:""}
      ${site.notes?`<p class="trip-notes">${esc(site.notes)}</p>`:""}
      <div class="campsite-links"><a class="secondary-btn" href="${esc(map)}" target="_blank" rel="noopener">Open map</a>${website?`<a class="secondary-btn" href="${esc(website)}" target="_blank" rel="noopener">Website</a>`:""}${site.phone?`<a class="secondary-btn" href="tel:${esc(site.phone.replace(/[^+\d]/g,""))}">Call</a>`:""}</div>
      <div class="trip-card-actions"><button class="secondary-btn" data-campsite-trip="${esc(site.id)}">Use for new trip</button><button class="secondary-btn" data-campsite-favourite="${esc(site.id)}">${site.favourite?"Remove favourite":"Favourite"}</button><button class="secondary-btn" data-campsite-edit="${esc(site.id)}">Edit</button><button class="danger-btn" data-campsite-delete="${esc(site.id)}">Delete</button></div>
    </article>`;
  }).join("");
}
function openCampsiteEditor(id=null){
  editingCampsiteId=id;
  const site=(state.savedCampsites||[]).find(item=>item.id===id)||{};
  $("#campsiteDialogTitle").textContent=id?"Edit campsite":"Add campsite";
  $("#campsiteName").value=site.name||"";
  $("#campsiteLocation").value=site.location||"";
  $("#campsitePitch").value=site.pitch||"";
  $("#campsiteRating").value=String(site.rating||0);
  $("#campsiteWebsite").value=site.website||"";
  $("#campsitePhone").value=site.phone||"";
  $("#campsiteNotes").value=site.notes||"";
  const selected=new Set(site.facilities||[]);
  $$('#campsiteForm input[name="facilities"]').forEach(input=>input.checked=selected.has(input.value));
  const dialog=$("#campsiteDialog");
  if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
  setTimeout(()=>$("#campsiteName").focus(),0);
}
function closeCampsiteEditor(){
  const dialog=$("#campsiteDialog");
  if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");
  editingCampsiteId=null;
}
function saveCampsite(event){
  event.preventDefault();
  const form=new FormData(event.currentTarget),values=Object.fromEntries(form);
  const website=normaliseWebsite(values.website);
  if(values.website.trim()&&!website){toast("Website must use http:// or https://");return}
  const existing=(state.savedCampsites||[]).find(item=>item.id===editingCampsiteId);
  const site={id:existing?.id||`campsite-${Date.now()}`,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),favourite:Boolean(existing?.favourite),name:values.name.trim(),location:values.location.trim(),pitch:values.pitch.trim(),rating:Number(values.rating)||0,website,phone:values.phone.trim(),facilities:form.getAll("facilities"),notes:values.notes.trim()};
  state.savedCampsites=existing?state.savedCampsites.map(item=>item.id===existing.id?site:item):[site,...state.savedCampsites];
  saveState();closeCampsiteEditor();renderCampsites();toast(existing?"Campsite updated":"Campsite added");
}
function deleteCampsite(id){
  const site=(state.savedCampsites||[]).find(item=>item.id===id);
  if(!site||!confirm(`Delete “${site.name||"this campsite"}”? This cannot be undone.`))return;
  state.savedCampsites=state.savedCampsites.filter(item=>item.id!==id);saveState();renderCampsites();toast("Campsite deleted");
}
function useCampsiteForTrip(id){
  const site=(state.savedCampsites||[]).find(item=>item.id===id);if(!site)return;
  openTripEditor();$("#tripCampsite").value=site.name;$("#tripDestination").value=site.location;toast("Campsite added to new trip");
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
    system:(report.systems||[])[0]||"vehicle",
    severity:"medium",
    status:"open",
    date:new Date().toISOString().slice(0,10),
    mileage:state.currentMileage||null,
    symptoms:report.outcome,
    resolution:"",
    createdAt:new Date().toISOString(),
    diagnosticOutcome:report.outcome,
    diagnosticReport:report
  });
  saveState();renderDiagnostics();renderHome();toast("Added to open faults");
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
    "travel-log":{type:"touring",title:"Touring journal",raw:{note:"Add, edit and review trip records in the Touring Journal below."}}
  };
  if(id==="packing"){closeDetail();$("#packingPlanner").scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="travel-log"){closeDetail();$("#tripJournal").scrollIntoView({behavior:"smooth",block:"start"});return}
  if(id==="campsites"){closeDetail();$("#campsitePlanner").scrollIntoView({behavior:"smooth",block:"start"});return}
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

function fuseSystem(fuse){
  const text=`${fuse.label} ${fuse.function}`.toLowerCase();
  if(text.includes("pump"))return "water";
  if(text.includes("heating"))return "gas";
  if(text.includes("refrigerator"))return "gas";
  return "electrical";
}
function renderFuseInspector(){
  const fuse=DATA.fuses[activeFuseIndex]||DATA.fuses[0];
  if(!fuse){$("#fuseInspector").innerHTML="<h2>Fuse data unavailable</h2>";return}
  const component=DATA.electrical.find(x=>x.id===fuse.component);
  const system=fuseSystem(fuse);
  $("#fuseInspector").innerHTML=`<span class="meta">${esc(fuse.box)} fuse</span><h2>${esc(fuse.label)}</h2><div class="fuse-rating-large">${esc(fuse.rating)}</div><p>${esc(fuse.function)}</p><div class="fuse-test"><h3>Safe test sequence</h3><ol><li>Switch off the affected load.</li><li>Confirm the fuse rating matches this record.</li><li>Test both fuse points with a suitable meter or test lamp.</li><li>Replace only with the same rating and type.</li><li>If it blows again, stop and investigate the circuit fault.</li></ol></div><div class="component-facts"><div><dt>Board location</dt><dd>${esc(component?.location||"Confirm from the vehicle map")}</dd></div><div><dt>Board</dt><dd>${esc(component?.name||fuse.box)}</dd></div></div><div class="diagnostic-actions"><button class="primary-btn" data-route="electrical" data-electrical-component="${esc(fuse.component)}">Open electrical board</button>${system!=="electrical"?`<button class="secondary-btn" data-route="${system}">Open ${esc(system)} system</button>`:""}<button class="secondary-btn" data-manual-nav="95">Manual p. 95</button><button class="secondary-btn" data-chapter-nav="15">Chapter 15</button></div>`;
}
function renderFuses(){
  const query=($("#fuseSearch")?.value||"").trim().toLowerCase();
  const boxes=[...new Set(DATA.fuses.map(x=>x.box))];
  $("#fuseBoxFilters").innerHTML=[["all","All boards"],...boxes.map(x=>[x,x])].map(([id,label])=>`<button class="chip ${fuseBoxFilter===id?"active":""}" data-fuse-box="${esc(id)}">${esc(label)}</button>`).join("");
  const indexed=DATA.fuses.map((fuse,index)=>({fuse,index})).filter(({fuse})=>(fuseBoxFilter==="all"||fuse.box===fuseBoxFilter)&&(!query||`${fuse.box} ${fuse.label} ${fuse.rating} ${fuse.function}`.toLowerCase().includes(query)));
  if(indexed.length&&!indexed.some(x=>x.index===activeFuseIndex))activeFuseIndex=indexed[0].index;
  $("#fuseSummary").innerHTML=[[DATA.fuses.length,"Documented fuses"],[boxes.length,"Fuse boards"],[indexed.length,"Shown"]].map(([v,l])=>`<article class="stat-card"><strong>${v}</strong><span>${l}</span></article>`).join("");
  $("#fuseBoards").innerHTML=boxes.map(box=>{
    const rows=indexed.filter(x=>x.fuse.box===box);if(!rows.length)return "";
    return `<article class="panel fuse-board"><div class="fuse-board-head"><span class="meta">Calira distribution</span><h2>${esc(box)}</h2></div><div class="fuse-slots">${rows.map(({fuse,index})=>`<button class="fuse-slot ${activeFuseIndex===index?"active":""}" data-fuse-index="${index}" aria-pressed="${activeFuseIndex===index}"><span class="fuse-amp amp-${esc(fuse.rating.replace(/[^0-9]/g,""))}">${esc(fuse.rating)}</span><span><strong>${esc(fuse.label)}</strong><small>${esc(fuse.function)}</small></span></button>`).join("")}</div></article>`;
  }).join("")||`<article class="panel"><h2>No matching fuse</h2><p>Try a circuit name, German label or rating.</p></article>`;
  renderFuseInspector();
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

function vehicleDocumentStatus(document){
  if(!document.expiry)return {status:"no-expiry",label:"No expiry"};
  const today=new Date(`${new Date().toISOString().slice(0,10)}T00:00:00Z`),expiry=new Date(`${document.expiry}T00:00:00Z`),days=Math.ceil((expiry-today)/86400000);
  if(days<0)return {status:"expired",label:`Expired ${Math.abs(days)} days ago`};
  if(days<=30)return {status:"expiring",label:`Expires in ${days} days`};
  return {status:"valid",label:`Valid for ${days} days`};
}
function configurationSections(){return (DATA.vehicleConfigSchema?.sections||[]).filter(section=>section.id!=="documents")}
function configurationProfileValue(id){
  const profile=state.vehicleProfile||{},key=id==="mam"?"maxMass":id;
  return ["registration","vin","make","model","year","baseVehicle","length","mam"].includes(id)?profile[key]??"":"";
}
function configurationValue(field){
  if(Object.prototype.hasOwnProperty.call(state.vehicleConfiguration||{},field.id))return state.vehicleConfiguration[field.id];
  const profileValue=configurationProfileValue(field.id);
  return profileValue!==""?profileValue:field.value??"";
}
function renderVehicleConfiguration(){
  const sections=configurationSections();
  if(!sections.length){$("#configurationFields").innerHTML='<article class="panel"><p>Configuration schema unavailable.</p></article>';return}
  let section=sections.find(item=>item.id===activeConfigurationSection)||sections[0];activeConfigurationSection=section.id;
  const allFields=sections.flatMap(item=>item.fields||[]),ownerValues=state.vehicleConfiguration||{};
  const recorded=allFields.filter(field=>Object.prototype.hasOwnProperty.call(ownerValues,field.id)&&String(ownerValues[field.id]).trim()).length;
  const references=allFields.filter(field=>!Object.prototype.hasOwnProperty.call(ownerValues,field.id)&&String(configurationValue(field)).trim()).length;
  $("#configurationSummary").innerHTML=[[sections.length,"System sections"],[allFields.length,"Configuration fields"],[recorded,"Owner confirmed"],[references,"Reference values"]].map(([v,l])=>`<article class="stat-card"><strong>${v}</strong><span>${l}</span></article>`).join("");
  $("#configurationSections").innerHTML=sections.map(item=>`<button class="chip ${item.id===section.id?"active":""}" data-configuration-section="${esc(item.id)}">${esc(item.title)}</button>`).join("");
  $("#configurationFields").innerHTML=(section.fields||[]).map(field=>{
    const value=configurationValue(field),confirmed=Object.prototype.hasOwnProperty.call(ownerValues,field.id)&&String(ownerValues[field.id]).trim();
    return `<article class="panel configuration-field ${confirmed?"confirmed":"reference"}"><span class="maintenance-status">${confirmed?"Owner confirmed":"Reference / unconfirmed"}</span><h3>${esc(field.label)}</h3><p>${esc(String(value).trim()||"Not recorded")}</p></article>`;
  }).join("");
  $("#editVehicleConfiguration").textContent=`Edit ${section.title}`;
}
function openConfigurationEditor(){
  const section=configurationSections().find(item=>item.id===activeConfigurationSection);if(!section)return;
  $("#configurationDialogTitle").textContent=`Edit ${section.title}`;
  $("#configurationFormFields").innerHTML=(section.fields||[]).map(field=>{
    const value=configurationValue(field),wide=field.type==="textarea"?" trip-field-wide":"";
    if(field.type==="select")return `<label class="trip-field${wide}">${esc(field.label)}<select name="${esc(field.id)}">${(field.options||[]).map(option=>`<option value="${esc(option)}" ${String(value)===String(option)?"selected":""}>${esc(option)}</option>`).join("")}</select></label>`;
    if(field.type==="textarea")return `<label class="trip-field${wide}">${esc(field.label)}<textarea name="${esc(field.id)}" maxlength="2000">${esc(value)}</textarea></label>`;
    return `<label class="trip-field${wide}">${esc(field.label)}<input name="${esc(field.id)}" type="${field.type==="number"?"number":"text"}" value="${esc(value)}" ${field.type==="number"?'step="any"':""} maxlength="180"></label>`;
  }).join("")+'<p class="configuration-help trip-field-wide">Saving marks entered values as owner confirmed. Clear a field to return it to its preserved reference value.</p><div class="trip-form-actions trip-field-wide"><button class="secondary-btn" type="button" data-configuration-cancel>Cancel</button><button class="primary-btn" type="submit">Save configuration</button></div>';
  const dialog=$("#configurationDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeConfigurationEditor(){const dialog=$("#configurationDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open")}
function saveVehicleConfiguration(event){
  event.preventDefault();const section=configurationSections().find(item=>item.id===activeConfigurationSection);if(!section)return;
  const values=Object.fromEntries(new FormData(event.currentTarget)),next={...(state.vehicleConfiguration||{})};
  (section.fields||[]).forEach(field=>{const value=String(values[field.id]??"").trim();if(value)next[field.id]=field.type==="number"?Number(value):value;else delete next[field.id]});
  state.vehicleConfiguration=next;
  if(section.id==="identity"){
    const profile={...(state.vehicleProfile||{})};
    ["registration","vin","make","model","year","baseVehicle","length"].forEach(key=>{if(Object.prototype.hasOwnProperty.call(next,key))profile[key]=next[key]});
    if(Object.prototype.hasOwnProperty.call(next,"mam"))profile.maxMass=next.mam;
    state.vehicleProfile=profile;
  }
  saveState();closeConfigurationEditor();renderVehicle();toast("Vehicle configuration saved");
}
function renderVehicleRecords(){
  const profile=state.vehicleProfile||{},documents=state.vehicleDocuments||[],inventory=state.inventory||[];
  const statuses=documents.map(vehicleDocumentStatus),alerts=statuses.filter(item=>["expired","expiring"].includes(item.status)).length;
  const profileFields=["registration","vin","make","model","year","baseVehicle","maxMass","length"],complete=profileFields.filter(key=>profile[key]).length;
  $("#vehicleRecordSummary").innerHTML=[[`${complete}/${profileFields.length}`,"Identity fields"],[documents.length,"Documents"],[alerts,"Expiry alerts"],[inventory.reduce((sum,item)=>sum+(Number(item.quantity)||0),0),"Inventory quantity"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  $("#vehicleProfile").innerHTML=`<div class="section-heading"><div><span class="eyebrow">Vehicle identity</span><h2>${esc([profile.make,profile.model].filter(Boolean).join(" ")||"Motorhome details")}</h2></div><button class="secondary-btn" data-vehicle-profile-edit>Edit</button></div><dl class="vehicle-profile-grid">
    <div><dt>Registration</dt><dd>${esc(profile.registration||"Not recorded")}</dd></div><div><dt>VIN</dt><dd>${esc(profile.vin||"Not recorded")}</dd></div>
    <div><dt>Model year</dt><dd>${esc(profile.year||"Not recorded")}</dd></div><div><dt>Base vehicle</dt><dd>${esc(profile.baseVehicle||"Not recorded")}</dd></div>
    <div><dt>Maximum mass</dt><dd>${profile.maxMass?`${Number(profile.maxMass).toLocaleString()} kg`:"Not recorded"}</dd></div><div><dt>Length</dt><dd>${profile.length?`${Number(profile.length).toFixed(2)} m`:"Not recorded"}</dd></div>
  </dl>`;
  $("#vehicleDocuments").innerHTML=documents.length?documents.map(document=>{const status=vehicleDocumentStatus(document);return `<article class="vehicle-document status-${status.status}"><div><span class="maintenance-status">${esc(status.label)}</span><strong>${esc(document.type)}</strong><small>${esc(document.provider||document.reference||"Reference not recorded")}</small></div><div class="vehicle-record-actions"><button class="secondary-btn" data-vehicle-document-edit="${esc(document.id)}">Edit</button><button class="danger-btn" data-vehicle-document-delete="${esc(document.id)}">Delete</button></div></article>`}).join(""):'<div class="trip-empty"><p>No vehicle documents recorded.</p><button class="primary-btn" data-vehicle-document-add>Add first document</button></div>';
  const query=($("#inventorySearch")?.value||"").trim().toLowerCase(),visible=inventory.filter(item=>!query||[item.name,item.category,item.location,item.notes].join(" ").toLowerCase().includes(query));
  $("#vehicleInventory").innerHTML=visible.length?visible.map(item=>`<article class="panel inventory-card"><span class="meta">${esc(item.category)}</span><h3>${esc(item.name)}</h3><p><strong>${Number(item.quantity)||0}</strong> onboard${item.location?` • ${esc(item.location)}`:""}</p>${item.notes?`<p class="trip-notes">${esc(item.notes)}</p>`:""}<div class="trip-card-actions"><button class="secondary-btn" data-inventory-edit="${esc(item.id)}">Edit</button><button class="danger-btn" data-inventory-delete="${esc(item.id)}">Delete</button></div></article>`).join(""):`<article class="panel trip-empty"><p>${inventory.length?"No matching inventory item.":"No onboard equipment recorded."}</p>${inventory.length?"":'<button class="primary-btn" data-inventory-add>Add first item</button>'}</article>`;
}
function openVehicleProfileEditor(){
  const profile=state.vehicleProfile||{};
  $("#vehicleRegistration").value=profile.registration||"";$("#vehicleVin").value=profile.vin||"";$("#vehicleMake").value=profile.make||"Knaus";$("#vehicleModel").value=profile.model||"Sun Traveller";$("#vehicleYear").value=profile.year||"";$("#vehicleBase").value=profile.baseVehicle||"";$("#vehicleMass").value=profile.maxMass||"";$("#vehicleLength").value=profile.length||"";
  const dialog=$("#vehicleProfileDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeVehicleProfileEditor(){const dialog=$("#vehicleProfileDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open")}
function saveVehicleProfile(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));
  state.vehicleProfile={registration:values.registration.trim(),vin:values.vin.trim(),make:values.make.trim(),model:values.model.trim(),year:values.year?Number(values.year):null,baseVehicle:values.baseVehicle.trim(),maxMass:values.maxMass?Number(values.maxMass):null,length:values.length?Number(values.length):null};
  saveState();closeVehicleProfileEditor();renderVehicle();toast("Vehicle details saved");
}
function openVehicleDocumentEditor(id=null){
  editingVehicleDocumentId=id;const document=(state.vehicleDocuments||[]).find(item=>item.id===id)||{};
  $("#vehicleDocumentDialogTitle").textContent=id?"Edit document":"Add document";$("#vehicleDocumentType").value=document.type||"";$("#vehicleDocumentReference").value=document.reference||"";$("#vehicleDocumentProvider").value=document.provider||"";$("#vehicleDocumentExpiry").value=document.expiry||"";$("#vehicleDocumentNotes").value=document.notes||"";
  const dialog=$("#vehicleDocumentDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeVehicleDocumentEditor(){const dialog=$("#vehicleDocumentDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingVehicleDocumentId=null}
function saveVehicleDocument(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.vehicleDocuments||[]).find(item=>item.id===editingVehicleDocumentId);
  const document={id:existing?.id||`document-${Date.now()}`,type:values.type.trim(),reference:values.reference.trim(),provider:values.provider.trim(),expiry:values.expiry,notes:values.notes.trim(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
  state.vehicleDocuments=existing?state.vehicleDocuments.map(item=>item.id===existing.id?document:item):[document,...(state.vehicleDocuments||[])];saveState();closeVehicleDocumentEditor();renderVehicle();toast(existing?"Document updated":"Document added");
}
function deleteVehicleDocument(id){const document=(state.vehicleDocuments||[]).find(item=>item.id===id);if(!document||!confirm(`Delete “${document.type}”? This cannot be undone.`))return;state.vehicleDocuments=state.vehicleDocuments.filter(item=>item.id!==id);saveState();renderVehicle();toast("Document deleted")}
function openInventoryEditor(id=null){
  editingInventoryId=id;const item=(state.inventory||[]).find(entry=>entry.id===id)||{};
  $("#inventoryDialogTitle").textContent=id?"Edit inventory item":"Add inventory item";$("#inventoryName").value=item.name||"";$("#inventoryCategory").value=item.category||"";$("#inventoryQuantity").value=item.quantity??1;$("#inventoryLocation").value=item.location||"";$("#inventoryNotes").value=item.notes||"";
  const dialog=$("#inventoryDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeInventoryEditor(){const dialog=$("#inventoryDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingInventoryId=null}
function saveInventoryItem(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.inventory||[]).find(item=>item.id===editingInventoryId);
  const item={id:existing?.id||`inventory-${Date.now()}`,name:values.name.trim(),category:values.category.trim(),quantity:Number(values.quantity)||1,location:values.location.trim(),notes:values.notes.trim(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
  state.inventory=existing?state.inventory.map(entry=>entry.id===existing.id?item:entry):[item,...(state.inventory||[])];saveState();closeInventoryEditor();renderVehicle();toast(existing?"Inventory updated":"Inventory item added");
}
function deleteInventoryItem(id){const item=(state.inventory||[]).find(entry=>entry.id===id);if(!item||!confirm(`Delete “${item.name}”?`))return;state.inventory=state.inventory.filter(entry=>entry.id!==id);saveState();renderVehicle();toast("Inventory item deleted")}
function renderVehiclePhotos(){
  const annotations=state.vehiclePhotoNotes||{},annotated=VEHICLE_PHOTOS.filter(photo=>{const note=annotations[photo.id];return note&&(note.title||note.location||note.notes)}).length,query=($("#photoSearch")?.value||"").trim().toLowerCase();
  $("#photoSummary").innerHTML=[[VEHICLE_PHOTOS.length,"Reference photos"],[annotated,"Annotated"],[VEHICLE_PHOTOS.length-annotated,"Original labels"]].map(([v,l])=>`<article class="stat-card"><strong>${v}</strong><span>${l}</span></article>`).join("");
  const visible=VEHICLE_PHOTOS.filter(photo=>{const note=annotations[photo.id]||{};return !query||[photo.title,photo.location,photo.tags,note.title,note.location,note.notes].join(" ").toLowerCase().includes(query)});
  $("#vehiclePhotos").innerHTML=visible.length?visible.map(photo=>{const note=annotations[photo.id]||{},title=note.title||photo.title,location=note.location||photo.location;return `<button class="panel photo-card" data-vehicle-photo="${esc(photo.id)}"><img src="assets/photos/${esc(photo.file)}" alt="${esc(title)}" loading="lazy"><span class="meta">${esc(location)}</span><strong>${esc(title)}</strong><small>${note.notes?esc(note.notes):"Open to inspect and annotate"}</small></button>`}).join(""):'<article class="panel trip-empty"><p>No reference photos match that search.</p></article>';
}
function openVehiclePhoto(id){
  const photo=VEHICLE_PHOTOS.find(item=>item.id===id);if(!photo)return;activeVehiclePhotoId=id;const note=state.vehiclePhotoNotes?.[id]||{};
  $("#photoDialogTitle").textContent=note.title||photo.title;$("#photoDialogImage").src=`assets/photos/${photo.file}`;$("#photoDialogImage").alt=note.title||photo.title;$("#photoTitle").value=note.title||photo.title;$("#photoLocation").value=note.location||photo.location;$("#photoNotes").value=note.notes||"";
  const dialog=$("#photoDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeVehiclePhoto(){const dialog=$("#photoDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");activeVehiclePhotoId=null}
function saveVehiclePhotoNote(event){
  event.preventDefault();const photo=VEHICLE_PHOTOS.find(item=>item.id===activeVehiclePhotoId);if(!photo)return;const values=Object.fromEntries(new FormData(event.currentTarget));
  state.vehiclePhotoNotes={...(state.vehiclePhotoNotes||{}),[photo.id]:{title:values.title.trim(),location:values.location.trim(),notes:values.notes.trim(),updatedAt:new Date().toISOString()}};
  saveState();closeVehiclePhoto();renderVehiclePhotos();toast("Photo annotation saved");
}
function partStock(part){const saved=state.partsStock?.[part.id]||{},baseline=Number(part.qty)||0;return {quantity:saved.quantity??baseline,target:saved.target??baseline,location:saved.location||"",notes:saved.notes||part.notes||"",updatedAt:saved.updatedAt||""}}
function renderPartsStock(){
  const parts=DATA.partsInventory||[],stocked=parts.map(part=>({part,stock:partStock(part)})),low=stocked.filter(item=>item.stock.quantity<item.stock.target),total=stocked.reduce((sum,item)=>sum+item.stock.quantity,0);
  $("#partsSummary").innerHTML=[[parts.length,"Stock lines"],[total,"Items onboard"],[low.length,"Low stock"],[stocked.filter(item=>item.stock.location).length,"Locations recorded"]].map(([v,l])=>`<article class="stat-card"><strong>${v}</strong><span>${l}</span></article>`).join("");
  const categories=["all","low",...[...new Set(parts.map(part=>String(part.category||"Other").toLowerCase()))]];
  $("#partsFilters").innerHTML=categories.map(id=>`<button class="chip ${partsFilter===id?"active":""}" data-parts-filter="${esc(id)}">${esc(id==="all"?"All":id==="low"?"Low stock":id)}</button>`).join("");
  const query=($("#partsSearch")?.value||"").trim().toLowerCase(),visible=stocked.filter(({part,stock})=>(partsFilter==="all"||(partsFilter==="low"?stock.quantity<stock.target:String(part.category).toLowerCase()===partsFilter))&&(!query||[part.name,part.category,part.system,part.notes,stock.location,stock.notes].join(" ").toLowerCase().includes(query)));
  $("#partsStock").innerHTML=visible.length?visible.map(({part,stock})=>`<article class="panel part-card ${stock.quantity<stock.target?"low-stock":""}">
    <div class="part-card-head"><div><span class="maintenance-status">${esc(part.category)}</span><h3>${esc(part.name)}</h3><p>${diagnosticIcon(part.system)} ${esc(part.system)}</p></div><strong class="part-quantity">${stock.quantity}<small>/ ${stock.target}</small></strong></div>
    <p>${esc(stock.notes||part.notes||"")}</p>${stock.location?`<span class="part-location">📍 ${esc(stock.location)}</span>`:""}
    <div class="part-actions"><button class="secondary-btn" data-part-adjust="${esc(part.id)}" data-delta="-1" ${stock.quantity<=0?"disabled":""}>Use one</button><button class="secondary-btn" data-part-adjust="${esc(part.id)}" data-delta="1">Add one</button><button class="primary-btn" data-part-edit="${esc(part.id)}">Details</button></div>
  </article>`).join(""):'<article class="panel trip-empty"><p>No stock items match this view.</p></article>';
}
function adjustPartStock(id,delta){const part=DATA.partsInventory.find(item=>item.id===id);if(!part)return;const stock=partStock(part);stock.quantity=Math.max(0,stock.quantity+Number(delta));stock.updatedAt=new Date().toISOString();state.partsStock={...(state.partsStock||{}),[id]:stock};saveState();renderPartsStock();renderHome();toast(delta>0?"Stock increased":"Stock usage recorded")}
function openPartEditor(id){const part=DATA.partsInventory.find(item=>item.id===id);if(!part)return;activePartId=id;const stock=partStock(part);$("#partDialogTitle").textContent=part.name;$("#partQuantity").value=stock.quantity;$("#partTarget").value=stock.target;$("#partLocation").value=stock.location;$("#partNotes").value=stock.notes;const dialog=$("#partDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}
function closePartEditor(){const dialog=$("#partDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");activePartId=null}
function savePartStock(event){event.preventDefault();const part=DATA.partsInventory.find(item=>item.id===activePartId);if(!part)return;const values=Object.fromEntries(new FormData(event.currentTarget));state.partsStock={...(state.partsStock||{}),[part.id]:{quantity:Math.max(0,Number(values.quantity)||0),target:Math.max(0,Number(values.target)||0),location:values.location.trim(),notes:values.notes.trim(),updatedAt:new Date().toISOString()}};saveState();closePartEditor();renderPartsStock();renderHome();toast("Parts stock updated")}
function renderUpgradeProjects(){
  const projects=state.upgradeProjects||[],active=projects.filter(item=>item.status!=="complete"),spent=projects.reduce((sum,item)=>sum+(Number(item.spent)||0),0),budget=projects.reduce((sum,item)=>sum+(Number(item.budget)||0),0);
  $("#upgradeSummary").innerHTML=[[active.length,"Active projects"],[projects.filter(item=>item.status==="blocked").length,"Blocked"],[`€${budget.toFixed(2)}`,"Total budget"],[`€${spent.toFixed(2)}`,"Total spent"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  const filters=[["active","Active"],["all","All"],["planned","Planned"],["ready","Ready"],["in-progress","In progress"],["blocked","Blocked"],["complete","Complete"]];
  $("#upgradeFilters").innerHTML=filters.map(([id,label])=>`<button class="chip ${upgradeFilter===id?"active":""}" data-upgrade-filter="${id}">${label}</button>`).join("");
  const visible=projects.filter(item=>upgradeFilter==="all"||(upgradeFilter==="active"?item.status!=="complete":item.status===upgradeFilter));
  $("#upgradeProjects").innerHTML=visible.length?visible.map(item=>{
    const over=Number(item.budget)>0&&Number(item.spent)>Number(item.budget),remaining=Math.max(0,(Number(item.budget)||0)-(Number(item.spent)||0));
    return `<article class="panel upgrade-card priority-${esc(item.priority||"medium")} status-${esc(item.status||"planned")}">
      <div class="upgrade-card-head"><div><span class="maintenance-status">${esc(String(item.status||"planned").replace("-"," "))}</span><h3>${esc(item.title)}</h3><p>${vehicleSystemIcon(item.system)} ${esc(item.system||"vehicle")} • ${esc(item.priority||"medium")} priority</p></div>${item.targetDate?`<span class="fault-date">Target ${esc(formatTripDate(item.targetDate))}</span>`:""}</div>
      <div class="upgrade-money"><div><span>Budget</span><strong>€${(Number(item.budget)||0).toFixed(2)}</strong></div><div><span>Spent</span><strong class="${over?"over-budget":""}">€${(Number(item.spent)||0).toFixed(2)}</strong></div><div><span>${over?"Over":"Remaining"}</span><strong>€${Math.abs(over?Number(item.spent)-Number(item.budget):remaining).toFixed(2)}</strong></div></div>
      ${item.notes?`<p class="upgrade-notes">${esc(item.notes)}</p>`:""}
      <div class="diagnostic-link-row">${item.chapter?`<button class="secondary-btn" data-chapter-nav="${Number(item.chapter)}">Chapter ${Number(item.chapter)}</button>`:""}${item.manualPage?`<button class="secondary-btn" data-manual-nav="${Number(item.manualPage)}">Manual p. ${Number(item.manualPage)}</button>`:""}</div>
      <div class="trip-card-actions"><button class="secondary-btn" data-upgrade-edit="${esc(item.id)}">Edit</button>${item.status!=="complete"?`<button class="primary-btn" data-upgrade-status="${esc(item.id)}" data-status="complete">Complete</button>`:`<button class="secondary-btn" data-upgrade-status="${esc(item.id)}" data-status="planned">Reopen</button>`}<button class="danger-btn" data-upgrade-delete="${esc(item.id)}">Delete</button></div>
    </article>`;
  }).join(""):'<article class="panel trip-empty"><p>No upgrade projects match this view.</p><button class="primary-btn" data-upgrade-add>Add first project</button></article>';
}
function openUpgradeEditor(id=null){
  editingUpgradeId=id;const item=(state.upgradeProjects||[]).find(entry=>entry.id===id)||{};
  $("#upgradeDialogTitle").textContent=id?"Edit project":"Add project";$("#upgradeTitle").value=item.title||"";$("#upgradeSystem").value=item.system||"electrical";$("#upgradePriority").value=item.priority||"medium";$("#upgradeStatus").value=item.status||"planned";$("#upgradeTargetDate").value=item.targetDate||"";$("#upgradeBudget").value=item.budget??"";$("#upgradeSpent").value=item.spent??"";$("#upgradeChapter").value=item.chapter||"";$("#upgradeManualPage").value=item.manualPage||"";$("#upgradeNotes").value=item.notes||"";
  const dialog=$("#upgradeDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");setTimeout(()=>$("#upgradeTitle").focus(),0);
}
function closeUpgradeEditor(){const dialog=$("#upgradeDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingUpgradeId=null}
function saveUpgradeProject(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.upgradeProjects||[]).find(item=>item.id===editingUpgradeId);
  const project={id:existing?.id||`upgrade-${Date.now()}`,title:values.title.trim(),system:values.system,priority:values.priority,status:values.status,targetDate:values.targetDate,budget:values.budget?Number(values.budget):0,spent:values.spent?Number(values.spent):0,chapter:values.chapter?Number(values.chapter):null,manualPage:values.manualPage?Number(values.manualPage):null,notes:values.notes.trim(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
  state.upgradeProjects=existing?state.upgradeProjects.map(item=>item.id===existing.id?project:item):[project,...(state.upgradeProjects||[])];saveState();closeUpgradeEditor();renderVehicle();renderHome();toast(existing?"Upgrade project updated":"Upgrade project added");
}
function setUpgradeStatus(id,status){const project=(state.upgradeProjects||[]).find(item=>item.id===id);if(!project)return;project.status=status;project.updatedAt=new Date().toISOString();saveState();renderVehicle();renderHome();toast(status==="complete"?"Project completed":"Project reopened")}
function deleteUpgradeProject(id){const project=(state.upgradeProjects||[]).find(item=>item.id===id);if(!project||!confirm(`Delete “${project.title}”?`))return;state.upgradeProjects=state.upgradeProjects.filter(item=>item.id!==id);saveState();renderVehicle();renderHome();toast("Upgrade project deleted")}
function renderVehicle(){
  renderVehicleRecords();
  renderVehicleConfiguration();
  renderVehiclePhotos();
  renderPartsStock();
  renderUpgradeProjects();
  $("#vehicleCards").innerHTML=[
    moduleCard("electrical","⚡","Interactive electrical","Trace supplies, protection and connected loads"),
    moduleCard("fuses","▥","Fuse & circuit finder","Locate VB06-1 and VB04 protection"),
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
    DATA.electrical,DATA.electricalRelations,DATA.fuses,DATA.water,DATA.waterRelations,DATA.gas,DATA.gasRelations,DATA.vehicleExplorer,DATA.vehicleConfigSchema,DATA.partsInventory,DATA.campsites,DATA.touringChecks,DATA.touringOperations,DATA.packingTemplates
  ]=await Promise.all([
    loadJSON("data/chapters.json"),loadJSON("data/manual_pages.json"),loadJSON("data/smart_diagnostics.json"),
    loadJSON("data/maintenance_tasks.json"),loadJSON("data/assistant_prompts.json"),loadJSON("data/build.json",{}),
    loadJSON("data/electrical_components.json"),loadJSON("data/electrical_relations.json"),loadJSON("data/fuses.json"),loadJSON("data/water_components.json"),loadJSON("data/water_relations.json"),loadJSON("data/gas_components.json"),loadJSON("data/gas_relations.json"),loadJSON("data/vehicle_explorer.json"),loadJSON("data/vehicle_config_schema.json",{}),loadJSON("data/parts_inventory.json"),
    loadJSON("data/campsites.json"),loadJSON("data/touring_checklists.json"),loadJSON("data/touring_operations.json",{}),loadJSON("data/packing_templates.json",{})
  ]);
  applyTheme();renderNav();renderHome();renderAssistant();renderLibrary();renderMaintenance();renderDiagnostics();renderTouring();renderVehicle();renderElectrical();renderFuses();renderWater();renderGas();renderSettings();
  $("#diagnosticSearch")?.addEventListener("input",renderDiagnostics);
  $("#fuseSearch")?.addEventListener("input",renderFuses);
  setActiveRoute(NAV.some(x=>x[0]===route())?route():"home");
}
document.addEventListener("click",e=>{
  const routeButton=e.target.closest("[data-route]");if(routeButton){e.preventDefault();navigate(routeButton.dataset.route)}
  const prompt=e.target.closest("[data-prompt]");if(prompt){$("#assistantInput").value=prompt.dataset.prompt;askAssistant()}
  const tab=e.target.closest("[data-library]");if(tab){libraryMode=tab.dataset.library;$$(".tab").forEach(x=>x.classList.toggle("active",x===tab));renderLibrary()}
  const touring=e.target.closest("[data-touring]");if(touring)openTouringSection(touring.dataset.touring);
  const touringStage=e.target.closest("[data-touring-stage]");if(touringStage){activeTouringStage=touringStage.dataset.touringStage;renderTouring()}
  const touringCheck=e.target.closest("[data-touring-check]");if(touringCheck){const key=`${activeTouringStage}:${touringCheck.dataset.touringCheck}`;state.touringProgress={...(state.touringProgress||{}),[key]:!state.touringProgress?.[key]};saveState();renderTouring()}
  const touringReset=e.target.closest("[data-touring-reset]");if(touringReset){const prefix=`${touringReset.dataset.touringReset}:`;state.touringProgress=Object.fromEntries(Object.entries(state.touringProgress||{}).filter(([key])=>!key.startsWith(prefix)));saveState();renderTouring();toast("Touring stage reset")}
  if(e.target.closest("[data-trip-add]"))openTripEditor();
  const tripEdit=e.target.closest("[data-trip-edit]");if(tripEdit)openTripEditor(tripEdit.dataset.tripEdit);
  const tripDelete=e.target.closest("[data-trip-delete]");if(tripDelete)deleteTrip(tripDelete.dataset.tripDelete);
  if(e.target.closest("[data-trip-cancel]"))closeTripEditor();
  if(e.target.closest("[data-expense-add]"))openExpenseEditor();
  const expenseFilterButton=e.target.closest("[data-expense-filter]");if(expenseFilterButton){expenseFilter=expenseFilterButton.dataset.expenseFilter;renderExpenses()}
  const expensePeriodButton=e.target.closest("[data-expense-period]");if(expensePeriodButton){expensePeriod=expensePeriodButton.dataset.expensePeriod;renderExpenses()}
  const expenseEdit=e.target.closest("[data-expense-edit]");if(expenseEdit)openExpenseEditor(expenseEdit.dataset.expenseEdit);
  const expenseDelete=e.target.closest("[data-expense-delete]");if(expenseDelete)deleteExpense(expenseDelete.dataset.expenseDelete);
  if(e.target.closest("[data-expense-cancel]"))closeExpenseEditor();
  if(e.target.closest("[data-campsite-add]"))openCampsiteEditor();
  const campsiteEdit=e.target.closest("[data-campsite-edit]");if(campsiteEdit)openCampsiteEditor(campsiteEdit.dataset.campsiteEdit);
  const campsiteDelete=e.target.closest("[data-campsite-delete]");if(campsiteDelete)deleteCampsite(campsiteDelete.dataset.campsiteDelete);
  const campsiteFavourite=e.target.closest("[data-campsite-favourite]");if(campsiteFavourite){const site=(state.savedCampsites||[]).find(item=>item.id===campsiteFavourite.dataset.campsiteFavourite);if(site){site.favourite=!site.favourite;saveState();renderCampsites()}}
  const campsiteTrip=e.target.closest("[data-campsite-trip]");if(campsiteTrip)useCampsiteForTrip(campsiteTrip.dataset.campsiteTrip);
  if(e.target.closest("[data-campsite-cancel]"))closeCampsiteEditor();
  if(e.target.closest("[data-packing-add]"))openPackingListEditor();
  const packingList=e.target.closest("[data-packing-list]");if(packingList){activePackingListId=packingList.dataset.packingList;renderPacking()}
  const packingToggle=e.target.closest("[data-packing-toggle]");if(packingToggle){const list=(state.packingLists||[]).find(item=>item.id===activePackingListId),item=list?.items.find(entry=>entry.id===packingToggle.dataset.packingToggle);if(item){item.packed=!item.packed;saveState();renderPacking()}}
  if(e.target.closest("[data-packing-item-add]"))openPackingItemEditor();
  const packingItemEdit=e.target.closest("[data-packing-item-edit]");if(packingItemEdit)openPackingItemEditor(packingItemEdit.dataset.packingItemEdit);
  const packingItemDelete=e.target.closest("[data-packing-item-delete]");if(packingItemDelete)deletePackingItem(packingItemDelete.dataset.packingItemDelete);
  const packingDuplicate=e.target.closest("[data-packing-duplicate]");if(packingDuplicate)duplicatePackingList(packingDuplicate.dataset.packingDuplicate);
  const packingDelete=e.target.closest("[data-packing-delete]");if(packingDelete)deletePackingList(packingDelete.dataset.packingDelete);
  if(e.target.closest("[data-packing-list-cancel]"))closePackingListEditor();
  if(e.target.closest("[data-packing-item-cancel]"))closePackingItemEditor();
  if(e.target.closest("[data-payload-cancel]"))closePayloadEditor();
  const manual=e.target.closest("[data-manual-page],[data-manual-nav],[data-page]");if(manual)openManualPage(manual.dataset.manualPage||manual.dataset.manualNav||manual.dataset.page);
  const chapter=e.target.closest("[data-chapter-nav]");if(chapter)openChapter(chapter.dataset.chapterNav);
  const diagnosticStart=e.target.closest("[data-diagnostic-start]");if(diagnosticStart)startDiagnostic(diagnosticStart.dataset.diagnosticStart);
  const diagnosticBegin=e.target.closest("[data-diagnostic-begin]");if(diagnosticBegin)beginDiagnostic(diagnosticBegin.dataset.diagnosticBegin);
  const diagnosticAnswer=e.target.closest("[data-diagnostic-answer]");if(diagnosticAnswer)answerDiagnostic(diagnosticAnswer.dataset.diagnosticAnswer);
  const diagnosticFilterButton=e.target.closest("[data-diagnostic-filter]");if(diagnosticFilterButton){diagnosticFilter=diagnosticFilterButton.dataset.diagnosticFilter;renderDiagnostics()}
  const faultFilterButton=e.target.closest("[data-fault-filter]");if(faultFilterButton){faultFilter=faultFilterButton.dataset.faultFilter;renderFaultLog()}
  const faultEdit=e.target.closest("[data-fault-edit]");if(faultEdit)openFaultEditor(faultEdit.dataset.faultEdit);
  const faultStatus=e.target.closest("[data-fault-status]");if(faultStatus)setFaultStatus(faultStatus.dataset.faultStatus,faultStatus.dataset.status);
  const faultDelete=e.target.closest("[data-fault-delete]");if(faultDelete)deleteFault(faultDelete.dataset.faultDelete);
  if(e.target.closest("[data-fault-cancel]"))closeFaultEditor();
  const maintenanceFilterButton=e.target.closest("[data-maintenance-filter]");if(maintenanceFilterButton){maintenanceFilter=maintenanceFilterButton.dataset.maintenanceFilter;renderMaintenance()}
  const maintenanceComplete=e.target.closest("[data-maintenance-complete]");if(maintenanceComplete)openServiceRecord(maintenanceComplete.dataset.maintenanceComplete);
  const serviceRecord=e.target.closest("[data-service-record]");if(serviceRecord)openServiceRecordDetail(serviceRecord.dataset.serviceRecord);
  if(e.target.closest("[data-service-cancel]"))closeServiceRecord();
  const electricalFilterButton=e.target.closest("[data-electrical-filter]");if(electricalFilterButton){electricalFilter=electricalFilterButton.dataset.electricalFilter;const first=electricalComponents()[0];if(first)activeElectricalComponent=first.id;renderElectrical()}
  const electricalComponent=e.target.closest("[data-electrical-component]");if(electricalComponent){activeElectricalComponent=electricalComponent.dataset.electricalComponent;renderElectrical()}
  const fuseBoxButton=e.target.closest("[data-fuse-box]");if(fuseBoxButton){fuseBoxFilter=fuseBoxButton.dataset.fuseBox;renderFuses()}
  const fuseButton=e.target.closest("[data-fuse-index]");if(fuseButton){activeFuseIndex=Number(fuseButton.dataset.fuseIndex);renderFuses()}
  const waterFilterButton=e.target.closest("[data-water-filter]");if(waterFilterButton){waterFilter=waterFilterButton.dataset.waterFilter;const first=waterComponents()[0];if(first)activeWaterComponent=first.id;renderWater()}
  const waterComponent=e.target.closest("[data-water-component]");if(waterComponent){activeWaterComponent=waterComponent.dataset.waterComponent;renderWater()}
  const gasFilterButton=e.target.closest("[data-gas-filter]");if(gasFilterButton){gasFilter=gasFilterButton.dataset.gasFilter;const first=gasComponents()[0];if(first)activeGasComponent=first.id;renderGas()}
  const gasComponent=e.target.closest("[data-gas-component]");if(gasComponent){activeGasComponent=gasComponent.dataset.gasComponent;renderGas()}
  const vehicleViewButton=e.target.closest("[data-vehicle-view]");if(vehicleViewButton){vehicleMapView=vehicleViewButton.dataset.vehicleView;const first=DATA.vehicleExplorer.find(x=>x.view===vehicleMapView);if(first)activeVehicleHotspot=first.id;renderVehicleMap()}
  const vehicleHotspot=e.target.closest("[data-vehicle-hotspot]");if(vehicleHotspot){activeVehicleHotspot=vehicleHotspot.dataset.vehicleHotspot;renderVehicleMap()}
  if(e.target.closest("[data-vehicle-profile-edit]"))openVehicleProfileEditor();
  if(e.target.closest("[data-vehicle-profile-cancel]"))closeVehicleProfileEditor();
  const configurationSection=e.target.closest("[data-configuration-section]");if(configurationSection){activeConfigurationSection=configurationSection.dataset.configurationSection;renderVehicleConfiguration()}
  if(e.target.closest("[data-configuration-cancel]"))closeConfigurationEditor();
  if(e.target.closest("[data-vehicle-document-add]"))openVehicleDocumentEditor();
  const vehicleDocumentEdit=e.target.closest("[data-vehicle-document-edit]");if(vehicleDocumentEdit)openVehicleDocumentEditor(vehicleDocumentEdit.dataset.vehicleDocumentEdit);
  const vehicleDocumentDelete=e.target.closest("[data-vehicle-document-delete]");if(vehicleDocumentDelete)deleteVehicleDocument(vehicleDocumentDelete.dataset.vehicleDocumentDelete);
  if(e.target.closest("[data-vehicle-document-cancel]"))closeVehicleDocumentEditor();
  if(e.target.closest("[data-inventory-add]"))openInventoryEditor();
  const inventoryEdit=e.target.closest("[data-inventory-edit]");if(inventoryEdit)openInventoryEditor(inventoryEdit.dataset.inventoryEdit);
  const inventoryDelete=e.target.closest("[data-inventory-delete]");if(inventoryDelete)deleteInventoryItem(inventoryDelete.dataset.inventoryDelete);
  if(e.target.closest("[data-inventory-cancel]"))closeInventoryEditor();
  const vehiclePhoto=e.target.closest("[data-vehicle-photo]");if(vehiclePhoto)openVehiclePhoto(vehiclePhoto.dataset.vehiclePhoto);
  if(e.target.closest("[data-photo-cancel]"))closeVehiclePhoto();
  const partsFilterButton=e.target.closest("[data-parts-filter]");if(partsFilterButton){partsFilter=partsFilterButton.dataset.partsFilter;renderPartsStock()}
  const partAdjust=e.target.closest("[data-part-adjust]");if(partAdjust)adjustPartStock(partAdjust.dataset.partAdjust,partAdjust.dataset.delta);
  const partEdit=e.target.closest("[data-part-edit]");if(partEdit)openPartEditor(partEdit.dataset.partEdit);
  if(e.target.closest("[data-part-cancel]"))closePartEditor();
  if(e.target.closest("[data-upgrade-add]"))openUpgradeEditor();
  const upgradeFilterButton=e.target.closest("[data-upgrade-filter]");if(upgradeFilterButton){upgradeFilter=upgradeFilterButton.dataset.upgradeFilter;renderUpgradeProjects()}
  const upgradeEdit=e.target.closest("[data-upgrade-edit]");if(upgradeEdit)openUpgradeEditor(upgradeEdit.dataset.upgradeEdit);
  const upgradeStatus=e.target.closest("[data-upgrade-status]");if(upgradeStatus)setUpgradeStatus(upgradeStatus.dataset.upgradeStatus,upgradeStatus.dataset.status);
  const upgradeDelete=e.target.closest("[data-upgrade-delete]");if(upgradeDelete)deleteUpgradeProject(upgradeDelete.dataset.upgradeDelete);
  if(e.target.closest("[data-upgrade-cancel]"))closeUpgradeEditor();
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
$("#addServiceRecord").onclick=()=>openServiceRecord();
$("#serviceRecordForm").addEventListener("submit",saveServiceRecord);
$("#saveMaintenanceMileage").onclick=()=>{const value=Number($("#maintenanceMileage").value);if(!Number.isFinite(value)||value<0){toast("Enter a valid mileage");return}state.currentMileage=Math.round(value);saveState();renderMaintenance();renderHome();toast("Mileage updated")};
$("#exportBackup").onclick=exportBackup;
$("#importBackup").onchange=async e=>{try{if(e.target.files[0])await restoreBackup(e.target.files[0])}catch(err){toast(err.message)}finally{e.target.value=""}};
$("#clearCache").onclick=clearCache;
$("#addTrip").onclick=()=>openTripEditor();
$("#tripForm").addEventListener("submit",saveTrip);
$("#addExpense").onclick=()=>openExpenseEditor();
$("#expenseForm").addEventListener("submit",saveExpense);
$("#exportExpenses").onclick=exportExpenseCsv;
$("#addCampsite").onclick=()=>openCampsiteEditor();
$("#campsiteForm").addEventListener("submit",saveCampsite);
$("#campsiteSearch").addEventListener("input",renderCampsites);
$("#addPackingList").onclick=openPackingListEditor;
$("#packingListForm").addEventListener("submit",createPackingList);
$("#packingItemForm").addEventListener("submit",savePackingItem);
$("#payloadForm").addEventListener("submit",savePayloadPlan);
$("#editPayloadPlan").onclick=openPayloadEditor;
$("#vehicleProfileForm").addEventListener("submit",saveVehicleProfile);
$("#configurationForm").addEventListener("submit",saveVehicleConfiguration);
$("#vehicleDocumentForm").addEventListener("submit",saveVehicleDocument);
$("#inventoryForm").addEventListener("submit",saveInventoryItem);
$("#upgradeForm").addEventListener("submit",saveUpgradeProject);
$("#photoForm").addEventListener("submit",saveVehiclePhotoNote);
$("#partForm").addEventListener("submit",savePartStock);
$("#addVehicleDocument").onclick=()=>openVehicleDocumentEditor();
$("#editVehicleConfiguration").onclick=openConfigurationEditor;
$("#addInventoryItem").onclick=()=>openInventoryEditor();
$("#addUpgradeProject").onclick=()=>openUpgradeEditor();
$("#inventorySearch").addEventListener("input",renderVehicleRecords);
$("#photoSearch").addEventListener("input",renderVehiclePhotos);
$("#partsSearch").addEventListener("input",renderPartsStock);
$("#addFault").onclick=()=>openFaultEditor();
$("#faultForm").addEventListener("submit",saveFault);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeDrawer();closeDetail();closeTripEditor();closeExpenseEditor();closeCampsiteEditor();closePackingListEditor();closePackingItemEditor();closePayloadEditor();closeServiceRecord();closeVehicleProfileEditor();closeConfigurationEditor();closeVehicleDocumentEditor();closeInventoryEditor();closeFaultEditor();closeUpgradeEditor();closeVehiclePhoto();closePartEditor()}});
$("#closeDetail").onclick=closeDetail;
$("#detailDialog").addEventListener("click",e=>{if(e.target===$("#detailDialog"))closeDetail()});

init().catch(err=>{
  console.error(err);
  document.body.innerHTML=`<main style="padding:30px;font-family:system-ui"><h1>Knaus Companion could not start</h1><p>${esc(err.message)}</p><button onclick="location.reload()">Reload</button></main>`;
});
