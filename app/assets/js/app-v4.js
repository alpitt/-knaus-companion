
const APP_VERSION="11.2.0";
const STORE_KEY="knaus-ultimate-v1";
const DEFAULT_STATE={theme:"light",logs:[],maintenance:{},departure:{},touringProgress:{},seasonalProgress:{},seasonalPlans:{},seasonalSupplies:{},seasonalCustomTasks:[],seasonalCycles:[],workshopSteps:{},activeWorkshopSession:null,workshopSessions:[],trips:[],expenses:[],savedCampsites:[],packingLists:[],payloadPlan:{},ownershipBudget:{},ownershipCommitments:[],complianceRequirements:[],emergencyContacts:[],emergencyIncidents:[],emergencyReadiness:{},emergencyDrills:[],emergencyEquipment:[],emergencyNotes:"",vehicleProfile:{make:"Knaus",model:"Sun Traveller"},vehicleConfiguration:{},vehicleDocuments:[],upgradeProjects:[],vehiclePhotoNotes:{},partsStock:{},currentMileage:0,faults:[],inventory:[],assistantHistory:[],manualBookmarks:[],manualOcrVisible:false,diagnosticReports:[]};

const SEASONAL_CHECKLISTS=[
  {id:"storage",title:"Storage preparation",detail:"Secure, clean and protect the vehicle before a period off the road.",supplies:[["cleaners","Interior-safe cleaning supplies"],["moisture","Moisture control and ventilation aids"],["battery","Battery charger or maintenance equipment"],["security","Keys, covers and security equipment"]],items:[["clean","Clean interior, remove food and leave ventilation paths open","bodywork"],["battery","Charge batteries and choose a safe maintenance or isolation strategy","electrical"],["water","Drain fresh, waste and hot-water systems as conditions require","water"],["gas","Close gas cylinders and confirm appliances are off","gas"],["security","Remove valuables, secure keys and confirm storage access","vehicle"]]},
  {id:"winter",title:"Winterisation",detail:"Protect water, energy and body systems from frost and prolonged cold.",supplies:[["drain","Drain hoses, plugs and collection container"],["frost","Approved frost-protection materials where specified"],["battery","Battery maintenance and terminal-care supplies"],["seals","Seal cleaner and suitable treatment"]],items:[["frost","Fully drain vulnerable water circuits and open drain points","water"],["heater","Follow heater and boiler frost-protection guidance","water"],["battery","Check battery charge, terminals and low-temperature strategy","electrical"],["seals","Clean and inspect rooflights, doors, windows and exterior seals","vehicle"],["tyres","Set tyre pressures and reduce prolonged load concentration","maintenance"]]},
  {id:"reactivate",title:"Seasonal reactivation",detail:"Return each system to service in a controlled, observable sequence.",supplies:[["water","Fresh-water flushing and sanitising supplies"],["tests","Torch, pressure gauge and basic test equipment"],["gas","Approved leak-detection solution"],["service","Replacement consumables and service fluids"]],items:[["inspect","Walk around and inspect for leaks, pests, damage and tyre condition","vehicle"],["power","Reconnect and test 12 V and mains systems safely","electrical"],["water","Close drains, refill, flush and inspect the water system","water"],["gas","Reconnect gas, leak-check appropriately and test appliances","gas"],["departure","Complete maintenance and departure checks before travel","touring"]]}
];

const EMERGENCY_READINESS_ITEMS=[
  {id:"identity",title:"Vehicle identity confirmed",detail:"Registration, VIN and vehicle details are available."},
  {id:"contacts",title:"Assistance contacts checked",detail:"Recovery, insurer and trusted contacts are current."},
  {id:"isolation",title:"Isolation points understood",detail:"Gas, electrical and water shut-off locations are known."},
  {id:"extinguisher",title:"Fire equipment ready",detail:"Extinguisher and fire blanket are accessible and in date."},
  {id:"first-aid",title:"First-aid kit stocked",detail:"Kit is accessible, complete and within expiry dates."},
  {id:"warning",title:"Roadside warning equipment ready",detail:"Hi-vis clothing, warning triangle and torch are accessible."},
  {id:"recovery",title:"Recovery access confirmed",detail:"Tow points, keys and roadside policy details can be reached."},
  {id:"notes",title:"Emergency notes reviewed",detail:"Medical, access and responder notes are current."}
];

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
let workshopWakeLock=null;
let activeWorkshopReportId=null;
let workshopHistoryFilter="all";
let ownershipCostPeriod="all";
let ownershipTrendYear=new Date().getFullYear();
let editingOwnershipCommitmentId=null;
let activeOwnershipLedgerId=null;
let editingOwnershipPaymentId=null;
let ownershipCalendarFilter="all";
let complianceFilter="all";
let editingComplianceRequirementId=null;
let activeComplianceEvidenceId=null;
let editingEmergencyContactId=null;
let editingEmergencyIncidentId=null;
let activeEmergencyIncidentReportId=null;
let activeEmergencyIncidentUpdateId=null;
let editingEmergencyDrillId=null;
let editingEmergencyEquipmentId=null;
let activeSeasonalMode="storage";
let seasonalCustomTaskFilter="all";

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
  if(id!=="workshop"&&workshopWakeLock)releaseWorkshopWakeLock();
  $$(".screen").forEach(s=>s.classList.toggle("active",s.dataset.screen===id));
  $$("[data-route]").forEach(b=>b.classList.toggle("active",b.dataset.route===id));
  if(id==="home")renderHome();
  if(id==="vehicle")renderVehicle();
  if(id==="workshop")renderWorkshop();
  if(id==="compliance")renderCompliance();
  if(id==="emergency")renderEmergency();
  if(id==="seasonal")renderSeasonal();
  $("#content").focus({preventScroll:true});scrollTo(0,0);closeDrawer();
}
function openDrawer(){$("#drawer").classList.add("open");$("#drawer").setAttribute("aria-hidden","false");$("#scrim").hidden=false;$("#menuButton").setAttribute("aria-expanded","true")}
function closeDrawer(){$("#drawer").classList.remove("open");$("#drawer").setAttribute("aria-hidden","true");$("#scrim").hidden=true;$("#menuButton").setAttribute("aria-expanded","false")}
function applyTheme(){document.documentElement.dataset.theme=state.theme==="dark"?"dark":"light"}

const NAV=[
  ["home","Home","⌂"],["assistant","Assistant","✦"],["search","Search","⌕"],["manuals","Manuals & chapters","▤"],
  ["maintenance","Service & maintenance","⚙"],["compliance","Compliance centre","🛡"],["emergency","Emergency centre","☎"],["seasonal","Seasonal care","❄"],["diagnostics","Diagnostics","✓"],["electrical","Electrical system","⚡"],["fuses","Fuse finder","▥"],["water","Water system","💧"],["gas","Gas system","🔥"],["workshop","Workshop mode","🛠"],["touring","Touring","➜"],["vehicle","My motorhome","▣"],["settings","Settings","⋯"]
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
  ownershipBudgetMetrics().filter(item=>item.budget>0&&item.spent>item.budget).forEach(item=>alerts.push({priority:2,kind:"warning",icon:"💶",title:`${item.source} budget exceeded`,detail:`€${(item.spent-item.budget).toFixed(2)} over the annual allowance`,route:"vehicle"}));
  ownershipForecastMetrics().filter(item=>item.budget>0&&item.spent<=item.budget&&item.projected>item.budget).forEach(item=>alerts.push({priority:3,kind:"warning",icon:"📈",title:`${item.source} spend is trending over budget`,detail:`Projected €${item.projected.toFixed(2)} by year end`,route:"vehicle"}));
  (state.ownershipCommitments||[]).filter(item=>item.active!==false&&item.nextDue).forEach(item=>{const days=Math.ceil((new Date(`${item.nextDue}T23:59:59`)-new Date())/86400000);if(days<0)alerts.push({priority:1,kind:"urgent",icon:"📅",title:`${item.title} payment overdue`,detail:`Due ${formatTripDate(item.nextDue)}`,route:"vehicle"});else if(days<=30)alerts.push({priority:2,kind:"warning",icon:"📅",title:`${item.title} payment due soon`,detail:`€${Number(item.amount||0).toFixed(2)} due ${formatTripDate(item.nextDue)}`,route:"vehicle"})});
  (state.complianceRequirements||[]).filter(item=>item.active!==false).forEach(item=>{const status=complianceRequirementStatus(item);if(status.status==="action")alerts.push({priority:1,kind:"urgent",icon:"🛡",title:`${item.title} expired`,detail:status.label,route:"compliance"});else if(status.status==="due")alerts.push({priority:2,kind:"warning",icon:"🛡",title:`${item.title} due soon`,detail:status.label,route:"compliance"})});
  (state.emergencyIncidents||[]).filter(item=>item.status!=="resolved").forEach(item=>alerts.push({priority:["critical","high"].includes(item.severity)?1:2,kind:["critical","high"].includes(item.severity)?"urgent":"warning",icon:"🚨",title:item.title,detail:`${item.severity} ${item.category} • ${item.status}`,route:"emergency"}));
  (state.emergencyDrills||[]).filter(item=>item.nextReview&&item.nextReview<new Date().toISOString().slice(0,10)).forEach(item=>alerts.push({priority:item.outcome==="action"?1:2,kind:item.outcome==="action"?"urgent":"warning",icon:"🧯",title:`${item.scenario} drill review overdue`,detail:`Review was due ${formatTripDate(item.nextReview)}`,route:"emergency"}));
  (state.emergencyEquipment||[]).map(item=>({item,status:emergencyEquipmentStatus(item)})).filter(entry=>entry.status.status!=="ready").forEach(({item,status})=>alerts.push({priority:status.status==="replace"?1:2,kind:status.status==="replace"?"urgent":"warning",icon:"🧯",title:`${item.name} ${status.label.toLowerCase()}`,detail:item.expiry?`Expiry ${formatTripDate(item.expiry)}`:(item.location||item.type),route:"emergency"}));
  (state.emergencyContacts||[]).filter(item=>item.nextReview&&item.nextReview<new Date().toISOString().slice(0,10)).forEach(item=>alerts.push({priority:item.primary?1:2,kind:item.primary?"urgent":"warning",icon:"☎",title:`Verify ${item.name}`,detail:`Emergency contact review was due ${formatTripDate(item.nextReview)}`,route:"emergency"}));
  SEASONAL_CHECKLISTS.forEach(list=>{const plan=state.seasonalPlans?.[list.id],tasks=seasonalModeTasks(list),done=tasks.filter(item=>item.complete).length;if(plan?.targetDate&&plan.targetDate<new Date().toISOString().slice(0,10)&&done<tasks.length)alerts.push({priority:2,kind:"warning",icon:"❄",title:`${list.title} overdue`,detail:`${done}/${tasks.length} tasks complete • target ${formatTripDate(plan.targetDate)}`,route:"seasonal",seasonalMode:list.id})});
  (state.seasonalCustomTasks||[]).filter(item=>item.dueDate&&!item.complete).forEach(item=>{const days=Math.ceil((new Date(`${item.dueDate}T23:59:59`)-new Date())/86400000),level=item.priority||"normal",alertPriority=level==="critical"?1:level==="high"?2:3;if(days<0)alerts.push({priority:1,kind:"urgent",icon:"❄",title:`${item.title} overdue`,detail:`${level} priority • ${item.mode} • due ${formatTripDate(item.dueDate)}`,route:"seasonal",seasonalMode:item.mode});else if(days<=14)alerts.push({priority:alertPriority,kind:level==="critical"?"urgent":"warning",icon:"❄",title:`${item.title} due soon`,detail:`${level} priority • ${item.mode} • due ${formatTripDate(item.dueDate)}`,route:"seasonal",seasonalMode:item.mode})});
  (state.upgradeProjects||[]).filter(project=>project.status!=="complete").forEach(project=>{
    if(project.status==="blocked")alerts.push({priority:2,kind:"warning",icon:"🧱",title:`${project.title} is blocked`,detail:"Review the upgrade plan and next action",route:"vehicle"});
    else if(Number(project.budget)>0&&Number(project.spent)>Number(project.budget))alerts.push({priority:2,kind:"warning",icon:"💶",title:`${project.title} is over budget`,detail:`€${(Number(project.spent)-Number(project.budget)).toFixed(2)} over plan`,route:"vehicle"});
  });
  (DATA.partsInventory||[]).forEach(part=>{const stock=partStock(part);if(stock.quantity<stock.target)alerts.push({priority:2,kind:"warning",icon:"📦",title:`${part.name} low`,detail:`${stock.quantity} onboard; target ${stock.target}`,route:"vehicle"})});
  return alerts.sort((a,b)=>a.priority-b.priority||a.title.localeCompare(b.title));
}
function renderDashboard(){
  const alerts=dashboardAlerts();
  $("#operationsAlerts").innerHTML=alerts.length?alerts.slice(0,8).map(alert=>`<button class="dashboard-alert ${alert.kind}" data-route="${alert.route}"${alert.seasonalMode?` data-seasonal-alert-mode="${alert.seasonalMode}"`:""}><span aria-hidden="true">${alert.icon}</span><span><strong>${esc(alert.title)}</strong><small>${esc(alert.detail)}</small></span><b aria-hidden="true">→</b></button>`).join(""):'<div class="dashboard-clear"><span aria-hidden="true">✓</span><div><strong>No active alerts</strong><p>Maintenance, documents, faults and packing allowances are clear.</p></div></div>';
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
    moduleCard("compliance","🛡","Compliance","Documents, scheduled care and readiness"),
    moduleCard("emergency","☎","Emergency centre","Vehicle identity, isolation and assistance"),
    moduleCard("seasonal","❄","Seasonal care","Storage, winterisation and reactivation"),
    moduleCard("workshop","🛠️","Workshop mode","Safe sequence and hands-on shortcuts"),
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
  if(state.activeWorkshopSession)docs.push({type:"workshop session",title:state.activeWorkshopSession.title||"Active workshop session",text:JSON.stringify(state.activeWorkshopSession),raw:state.activeWorkshopSession});
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
function complianceRequirementStatus(item){
  const due=item.expiry||(item.lastCompleted&&Number(item.intervalMonths)?addMonths(item.lastCompleted,Number(item.intervalMonths)):null);if(!due)return {status:"baseline",label:"Completion or expiry needed",due:null};const today=new Date(`${new Date().toISOString().slice(0,10)}T00:00:00Z`),days=Math.ceil((new Date(`${due}T00:00:00Z`)-today)/86400000);if(days<0)return {status:"action",label:`Expired ${Math.abs(days)} days ago`,due};if(days<=30)return {status:"due",label:days===0?"Due today":`Due in ${days} days`,due};return {status:"current",label:`Current for ${days} days`,due};
}
function complianceEntries(){
  const documents=(state.vehicleDocuments||[]).map(document=>{const status=vehicleDocumentStatus(document),mapped=status.status==="expired"?"action":status.status==="expiring"?"due":"current";return {id:document.id,source:"Document",title:document.type||"Vehicle document",detail:[status.label,document.provider,document.reference].filter(Boolean).join(" • "),date:document.expiry||"",status:mapped,statusLabel:mapped==="action"?"Expired":mapped==="due"?"Due soon":status.status==="no-expiry"?"Reference":"Current",route:"vehicle",icon:"📄"}});
  const maintenance=(DATA.maintenanceTasks||[]).map(maintenanceTaskStatus).map(item=>{const mapped=item.status==="overdue"?"action":item.status==="soon"?"due":item.status==="baseline"?"baseline":"current";return {id:item.task.id,source:"Maintenance",title:item.task.name||item.task.title,detail:item.dueDate?`${item.label} • ${formatTripDate(item.dueDate)}`:item.dueMileage!==null?`${item.label} • ${Number(item.dueMileage).toLocaleString()} km`:item.label,date:item.dueDate||"",status:mapped,statusLabel:mapped==="action"?"Overdue":mapped==="due"?"Due soon":mapped==="baseline"?"Baseline needed":"Current",route:"maintenance",icon:"🔧"}});
  const requirements=(state.complianceRequirements||[]).filter(item=>item.active!==false).map(item=>{const status=complianceRequirementStatus(item);return {id:item.id,source:"Requirement",title:item.title,detail:[status.label,item.category,item.authority,item.reference].filter(Boolean).join(" • "),date:status.due||"",status:status.status,statusLabel:status.status==="action"?"Expired":status.status==="due"?"Due soon":status.status==="baseline"?"Baseline needed":"Current",route:"compliance",icon:"🛡"}});
  const order={action:0,due:1,baseline:2,current:3};
  return [...documents,...maintenance,...requirements].sort((a,b)=>order[a.status]-order[b.status]||String(a.date||"9999").localeCompare(String(b.date||"9999"))||a.title.localeCompare(b.title));
}
function complianceSnapshot(){
  const entries=complianceEntries(),counts={action:entries.filter(item=>item.status==="action").length,due:entries.filter(item=>item.status==="due").length,current:entries.filter(item=>item.status==="current").length,baseline:entries.filter(item=>item.status==="baseline").length},ready=counts.current+counts.due,score=entries.length?Math.round(ready/entries.length*100):100;
  return {app:"Knaus Companion",version:APP_VERSION,generatedAt:new Date().toISOString(),score,counts,entries,requirements:state.complianceRequirements||[]};
}
function renderCompliance(){
  const snapshot=complianceSnapshot(),visible=snapshot.entries.filter(item=>complianceFilter==="all"||item.status===complianceFilter),filters=[["all","All"],["action","Action needed"],["due","Due soon"],["baseline","Baseline needed"],["current","Current"]];
  $("#complianceSummary").innerHTML=[[snapshot.counts.action,"Action needed"],[snapshot.counts.due,"Due soon"],[snapshot.counts.baseline,"Baselines"],[snapshot.counts.current,"Current"]].map(([value,label])=>`<article class="stat-card"><strong>${value}</strong><span>${label}</span></article>`).join("");$("#complianceScore").textContent=`${snapshot.score}%`;$("#complianceScoreDetail").textContent=snapshot.entries.length?`${snapshot.counts.current+snapshot.counts.due} of ${snapshot.entries.length} tracked items are current or still within their due window.`:"Add documents and maintenance baselines to begin tracking.";$("#complianceScoreBar").style.width=`${snapshot.score}%`;$("#complianceFilters").innerHTML=filters.map(([id,label])=>`<button class="chip ${complianceFilter===id?"active":""}" data-compliance-filter="${id}">${label}</button>`).join("");$("#complianceQueue").innerHTML=visible.length?visible.map(item=>item.source==="Requirement"?`<article class="panel compliance-card status-${item.status}"><span class="compliance-icon">${item.icon}</span><span><small>${esc(item.source)} • ${esc(item.statusLabel)}</small><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p></span><span class="compliance-actions"><button class="primary-btn" data-compliance-evidence-open="${item.id}">Evidence (${((state.complianceRequirements||[]).find(entry=>entry.id===item.id)?.completions||[]).length})</button><button class="secondary-btn" data-compliance-requirement-edit="${item.id}">Edit</button><button class="danger-btn" data-compliance-requirement-delete="${item.id}">Delete</button></span></article>`:`<button class="panel compliance-card status-${item.status}" data-route="${item.route}"><span class="compliance-icon">${item.icon}</span><span><small>${esc(item.source)} • ${esc(item.statusLabel)}</small><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p></span><b>→</b></button>`).join(""):'<article class="panel compliance-empty"><strong>No items in this view</strong><p>Try another filter or add the relevant vehicle records.</p></article>';
  renderComplianceTimeline();
}
function complianceCalendarEvents(){
  const today=new Date(`${new Date().toISOString().slice(0,10)}T00:00:00Z`),end=new Date(today);end.setUTCFullYear(end.getUTCFullYear()+1);return complianceEntries().filter(item=>item.date).map(item=>({...item,type:item.source.toLowerCase()})).filter(item=>new Date(`${item.date}T00:00:00Z`)<=end);
}
function renderComplianceTimeline(){
  const events=complianceCalendarEvents(),today=new Date().toISOString().slice(0,10),groups=new Map();events.forEach(item=>{const key=item.date<today?"overdue":item.date.slice(0,7);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)});$("#complianceTimeline").innerHTML=groups.size?[...groups].map(([key,items])=>`<section class="compliance-timeline-group ${key==="overdue"?"overdue":""}"><h3>${key==="overdue"?"Overdue":new Date(`${key}-01T00:00:00Z`).toLocaleDateString(undefined,{month:"long",year:"numeric",timeZone:"UTC"})}</h3><div>${items.map(item=>`<button data-route="${item.route}"><span>${item.icon}</span><span><strong>${esc(item.title)}</strong><small>${esc(formatTripDate(item.date))} • ${esc(item.source)} • ${esc(item.statusLabel)}</small></span><b>→</b></button>`).join("")}</div></section>`).join(""):'<article class="panel compliance-empty"><strong>No dated compliance events</strong><p>Add expiry dates, maintenance baselines or recurring requirements to build the timeline.</p></article>';
}
function exportComplianceCalendar(){
  const today=new Date().toISOString().slice(0,10),events=complianceCalendarEvents().filter(item=>item.date>=today),escapeIcs=value=>String(value||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;"),stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""),lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Knaus Companion//Compliance Calendar//EN","CALSCALE:GREGORIAN",...events.flatMap(item=>["BEGIN:VEVENT",`UID:${escapeIcs(`compliance-${item.type}-${item.id}-${item.date}@knaus-companion`)}`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${item.date.replace(/-/g,"")}`,`SUMMARY:${escapeIcs(item.title)}`,`DESCRIPTION:${escapeIcs(`${item.source}: ${item.detail}`)}`,"END:VEVENT"]),"END:VCALENDAR"],blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-compliance-calendar-${today}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(`${events.length} compliance events exported`);
}
function exportComplianceSnapshot(){const snapshot=complianceSnapshot(),blob=new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-compliance-snapshot-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Compliance audit snapshot exported")}
function complianceReportData(){
  const snapshot=complianceSnapshot(),profile=state.vehicleProfile||{};return {...snapshot,vehicle:{make:profile.make||"Knaus",model:profile.model||"Sun Traveller",year:profile.year||"",registration:profile.registration||"",vin:profile.vin||"",mileage:Number(state.currentMileage)||0}};
}
function complianceReportHtml(actions=true){
  const report=complianceReportData(),requirements=report.requirements||[];
  return `<article class="compliance-report"><div class="diagnostic-meta"><span>${esc(report.vehicle.make)} ${esc(report.vehicle.model)}</span>${report.vehicle.registration?`<span>${esc(report.vehicle.registration)}</span>`:""}${report.vehicle.vin?`<span>VIN ${esc(report.vehicle.vin)}</span>`:""}<span>${Number(report.vehicle.mileage).toLocaleString()} km</span><span>Generated ${esc(formatTripDate(report.generatedAt.slice(0,10)))}</span></div><section><h3>Readiness summary</h3><div class="compliance-report-summary"><div><strong>${report.score}%</strong><span>Readiness</span></div><div><strong>${report.counts.action}</strong><span>Action needed</span></div><div><strong>${report.counts.due}</strong><span>Due soon</span></div><div><strong>${report.counts.baseline}</strong><span>Baselines</span></div><div><strong>${report.counts.current}</strong><span>Current</span></div></div></section><section><h3>Tracked compliance items</h3><table><thead><tr><th>Source</th><th>Item</th><th>Status</th><th>Due / detail</th></tr></thead><tbody>${report.entries.map(item=>`<tr><td>${esc(item.source)}</td><td>${esc(item.title)}</td><td>${esc(item.statusLabel)}</td><td>${esc(item.detail)}</td></tr>`).join("")}</tbody></table></section><section><h3>Requirement evidence history</h3>${requirements.length?requirements.map(item=>`<article class="compliance-report-requirement"><h4>${esc(item.title)}</h4><p>${esc([item.category,item.authority,item.reference].filter(Boolean).join(" • ")||"No reference details")}</p>${(item.completions||[]).length?`<table><thead><tr><th>Completed</th><th>Valid until</th><th>Provider</th><th>Evidence</th></tr></thead><tbody>${[...item.completions].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(entry=>`<tr><td>${esc(formatTripDate(entry.date))}</td><td>${entry.validUntil?esc(formatTripDate(entry.validUntil)):"—"}</td><td>${esc(entry.provider||"—")}</td><td>${esc([entry.reference,entry.notes].filter(Boolean).join(" • ")||"—")}</td></tr>`).join("")}</tbody></table>`:"<p>No completion evidence recorded.</p>"}</article>`).join(""):"<p>No owner-defined requirements recorded.</p>"}</section>${actions?'<div class="diagnostic-actions"><button class="primary-btn" data-compliance-report-print>Print report</button><button class="secondary-btn" data-compliance-report-export>Export JSON</button></div>':""}</article>`;
}
function openComplianceReport(){showDialog("Compliance report","Vehicle compliance audit",complianceReportHtml(),true)}
function exportComplianceReport(){const report=complianceReportData(),blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-compliance-report-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Compliance report exported")}
function printComplianceReport(){const report=complianceReportData(),popup=window.open("","_blank","width=980,height=760");if(!popup){toast("Allow pop-ups to print this report");return}popup.document.write(`<!doctype html><html><head><title>Knaus compliance report</title><style>body{font:14px system-ui;max-width:980px;margin:28px auto;padding:0 20px;color:#172033}h1{margin-bottom:4px}.meta{color:#526071}section{margin:24px 0}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px;border:1px solid #ccd3dc;vertical-align:top}.diagnostic-meta,.compliance-report-summary{display:flex;gap:10px;flex-wrap:wrap}.diagnostic-meta span,.compliance-report-summary div{padding:8px;background:#eef2f6;border-radius:8px}.compliance-report-summary div{display:grid;min-width:110px}.compliance-report-requirement{break-inside:avoid;margin:18px 0}@media print{body{margin:0}}</style></head><body><h1>${esc(report.vehicle.make)} ${esc(report.vehicle.model)}</h1><p class="meta">Knaus Companion compliance report</p>${complianceReportHtml(false)}</body></html>`);popup.document.close();popup.focus();setTimeout(()=>popup.print(),200)}
function openComplianceRequirementEditor(id=null){
  editingComplianceRequirementId=id;const item=(state.complianceRequirements||[]).find(entry=>entry.id===id)||{};$("#complianceRequirementDialogTitle").textContent=id?"Edit requirement":"Add requirement";$("#complianceRequirementTitle").value=item.title||"";$("#complianceRequirementCategory").value=item.category||"Statutory test";$("#complianceRequirementAuthority").value=item.authority||"";$("#complianceRequirementInterval").value=item.intervalMonths??"";$("#complianceRequirementCompleted").value=item.lastCompleted||"";$("#complianceRequirementExpiry").value=item.expiry||"";$("#complianceRequirementReference").value=item.reference||"";$("#complianceRequirementActive").checked=item.active!==false;$("#complianceRequirementNotes").value=item.notes||"";const dialog=$("#complianceRequirementDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeComplianceRequirementEditor(){const dialog=$("#complianceRequirementDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingComplianceRequirementId=null}
function saveComplianceRequirement(event){event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.complianceRequirements||[]).find(item=>item.id===editingComplianceRequirementId),item={id:existing?.id||`requirement-${Date.now()}`,title:values.title.trim(),category:values.category,authority:values.authority.trim(),intervalMonths:Number(values.intervalMonths)||0,lastCompleted:values.lastCompleted,expiry:values.expiry,reference:values.reference.trim(),active:values.active==="on",notes:values.notes.trim(),completions:existing?.completions||[],createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};state.complianceRequirements=existing?state.complianceRequirements.map(entry=>entry.id===existing.id?item:entry):[item,...(state.complianceRequirements||[])];saveState();closeComplianceRequirementEditor();renderCompliance();renderHome();toast(existing?"Requirement updated":"Requirement added")}
function deleteComplianceRequirement(id){const item=(state.complianceRequirements||[]).find(entry=>entry.id===id);if(!item||!confirm(`Delete compliance requirement “${item.title}”?`))return;state.complianceRequirements=state.complianceRequirements.filter(entry=>entry.id!==id);saveState();renderCompliance();renderHome();toast("Requirement deleted")}
function activeComplianceRequirement(){return (state.complianceRequirements||[]).find(item=>item.id===activeComplianceEvidenceId)}
function renderComplianceEvidence(){
  const item=activeComplianceRequirement();if(!item)return;const entries=[...(item.completions||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date))),latest=entries[0];$("#complianceEvidenceTitle").textContent=item.title;$("#complianceEvidenceSummary").innerHTML=[[entries.length,"Evidence records"],[latest?formatTripDate(latest.date):"None","Last completed"],[item.expiry?formatTripDate(item.expiry):"Not set","Current expiry"]].map(([value,label])=>`<article class="stat-card"><strong>${esc(value)}</strong><span>${label}</span></article>`).join("");$("#complianceEvidenceList").innerHTML=entries.length?entries.map(entry=>`<article class="compliance-evidence-row"><div><strong>${esc(formatTripDate(entry.date))}</strong><span>${entry.validUntil?`Valid until ${esc(formatTripDate(entry.validUntil))}`:"No explicit expiry"}</span><small>${esc([entry.provider,entry.reference,entry.notes].filter(Boolean).join(" • ")||"No additional evidence details")}</small></div><button class="danger-btn" data-compliance-evidence-delete="${entry.id}">Delete</button></article>`).join(""):'<div class="compliance-evidence-empty"><strong>No completion evidence recorded</strong><p>Use the form below after an inspection, test or renewal.</p></div>';
}
function openComplianceEvidence(id){activeComplianceEvidenceId=id;const item=activeComplianceRequirement();if(!item)return;$("#complianceEvidenceDate").value=new Date().toISOString().slice(0,10);$("#complianceEvidenceValidUntil").value="";$("#complianceEvidenceProvider").value=item.authority||"";$("#complianceEvidenceReference").value="";$("#complianceEvidenceNotes").value="";renderComplianceEvidence();const dialog=$("#complianceEvidenceDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}
function closeComplianceEvidence(){const dialog=$("#complianceEvidenceDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");activeComplianceEvidenceId=null}
function saveComplianceEvidence(event){event.preventDefault();const item=activeComplianceRequirement();if(!item)return;const values=Object.fromEntries(new FormData(event.currentTarget)),entry={id:`evidence-${Date.now()}`,date:values.date,validUntil:values.validUntil,provider:values.provider.trim(),reference:values.reference.trim(),notes:values.notes.trim(),createdAt:new Date().toISOString()};item.completions=[entry,...(item.completions||[])];item.lastCompleted=entry.date;item.expiry=entry.validUntil||(item.intervalMonths?addMonths(entry.date,item.intervalMonths):"");if(entry.reference)item.reference=entry.reference;if(entry.provider)item.authority=entry.provider;item.updatedAt=new Date().toISOString();saveState();event.currentTarget.reset();$("#complianceEvidenceDate").value=new Date().toISOString().slice(0,10);renderComplianceEvidence();renderCompliance();renderHome();toast("Compliance evidence recorded")}
function deleteComplianceEvidence(id){const item=activeComplianceRequirement(),entry=(item?.completions||[]).find(record=>record.id===id);if(!item||!entry||!confirm(`Delete evidence recorded ${formatTripDate(entry.date)}?`))return;item.completions=item.completions.filter(record=>record.id!==id);const latest=[...item.completions].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0];item.lastCompleted=latest?.date||"";item.expiry=latest?.validUntil||(latest&&item.intervalMonths?addMonths(latest.date,item.intervalMonths):"");item.reference=latest?.reference||"";item.updatedAt=new Date().toISOString();saveState();renderComplianceEvidence();renderCompliance();renderHome();toast("Compliance evidence deleted")}
function emergencyEquipmentStatus(item){if(item.condition==="replace")return{status:"replace",label:"Replace"};if(item.condition==="service")return{status:"service",label:"Service needed"};if(!item.expiry)return{status:"ready",label:"Ready"};const days=Math.ceil((new Date(`${item.expiry}T23:59:59`)-new Date())/86400000);if(days<0)return{status:"replace",label:"Expired"};if(days<=30)return{status:"service",label:`Expires in ${days} days`};return{status:"ready",label:"Ready"}}
function emergencyCalendarEvents(){const today=new Date(`${new Date().toISOString().slice(0,10)}T00:00:00Z`),end=new Date(today);end.setUTCFullYear(end.getUTCFullYear()+1);return [...(state.emergencyDrills||[]).filter(item=>item.nextReview).map(item=>({id:item.id,type:"drill",date:item.nextReview,title:`${item.scenario} drill review`,detail:item.lessons||"Review the drill outcome and repeat the scenario.",icon:"🧯"})),...(state.emergencyEquipment||[]).filter(item=>item.expiry).map(item=>({id:item.id,type:"equipment",date:item.expiry,title:`${item.name} expiry`,detail:`${item.type}${item.location?` • ${item.location}`:""}`,icon:"🛡"})),...(state.emergencyContacts||[]).filter(item=>item.nextReview).map(item=>({id:item.id,type:"contact",date:item.nextReview,title:`Verify ${item.name}`,detail:`${item.role}${item.reference?` • ${item.reference}`:""}`,icon:"☎"}))].filter(item=>new Date(`${item.date}T00:00:00Z`)<=end).sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title))}
function renderEmergencyCalendar(){const events=emergencyCalendarEvents(),today=new Date().toISOString().slice(0,10),groups=new Map();events.forEach(item=>{const key=item.date<today?"overdue":item.date.slice(0,7);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)});$("#emergencyCalendar").innerHTML=groups.size?[...groups].map(([key,items])=>`<section class="emergency-calendar-group ${key==="overdue"?"overdue":""}"><h3>${key==="overdue"?"Overdue":new Date(`${key}-01T00:00:00Z`).toLocaleDateString(undefined,{month:"long",year:"numeric",timeZone:"UTC"})}</h3><div>${items.map(item=>`<button ${item.type==="drill"?`data-emergency-drill-edit="${item.id}"`:item.type==="contact"?`data-emergency-contact-edit="${item.id}"`:`data-emergency-equipment-edit="${item.id}"`}><span>${item.icon}</span><span><strong>${esc(item.title)}</strong><small>${esc(formatTripDate(item.date))} • ${esc(item.detail)}</small></span><b>→</b></button>`).join("")}</div></section>`).join(""):'<article class="panel emergency-empty"><strong>No dated emergency events</strong><p>Add contact reviews, drill reviews or equipment expiry dates to build the calendar.</p></article>'}
function exportEmergencyCalendar(){const today=new Date().toISOString().slice(0,10),events=emergencyCalendarEvents().filter(item=>item.date>=today),escapeIcs=value=>String(value||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;"),stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""),lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Knaus Companion//Emergency Calendar//EN","CALSCALE:GREGORIAN",...events.flatMap(item=>["BEGIN:VEVENT",`UID:${escapeIcs(`emergency-${item.type}-${item.id}-${item.date}@knaus-companion`)}`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${item.date.replace(/-/g,"")}`,`SUMMARY:${escapeIcs(item.title)}`,`DESCRIPTION:${escapeIcs(item.detail)}`,"END:VEVENT"]),"END:VCALENDAR"],blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-emergency-calendar-${today}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(`${events.length} emergency events exported`)}
function renderEmergency(){
  const profile=state.vehicleProfile||{},contacts=[...(state.emergencyContacts||[])].sort((a,b)=>Number(b.primary)-Number(a.primary)||a.name.localeCompare(b.name)),incidents=[...(state.emergencyIncidents||[])].sort((a,b)=>String(b.occurredAt).localeCompare(String(a.occurredAt))),openIncidents=incidents.filter(item=>item.status!=="resolved").length,openFaults=(state.faults||[]).filter(item=>!["fixed","closed"].includes(String(item.status||"").toLowerCase())).length;
  const readiness=state.emergencyReadiness||{},readyCount=EMERGENCY_READINESS_ITEMS.filter(item=>readiness[item.id]).length,readyPercent=Math.round(readyCount/EMERGENCY_READINESS_ITEMS.length*100);
  $("#emergencySummary").innerHTML=[[`${readyPercent}%`,"Emergency ready"],[contacts.length,"Saved contacts"],[openIncidents,"Open incidents"],[openFaults,"Open faults"]].map(([value,label])=>`<article class="stat-card"><strong>${esc(value)}</strong><span>${label}</span></article>`).join("");
  $("#emergencyReadinessScore").textContent=`${readyPercent}%`;
  $("#emergencyReadinessBar").style.width=`${readyPercent}%`;
  $("#emergencyReadinessStatus").textContent=readyPercent===100?"Emergency preparation checklist complete.":`${readyCount} of ${EMERGENCY_READINESS_ITEMS.length} checks complete. Review before travel.`;
  $("#emergencyReadinessChecklist").innerHTML=EMERGENCY_READINESS_ITEMS.map(item=>`<button type="button" class="emergency-readiness-item ${readiness[item.id]?"complete":""}" role="checkbox" aria-checked="${Boolean(readiness[item.id])}" data-emergency-readiness="${item.id}"><span>${readiness[item.id]?"✓":""}</span><span><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small></span></button>`).join("");
  const drills=[...(state.emergencyDrills||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  $("#emergencyDrills").innerHTML=drills.length?drills.map(item=>`<article class="panel emergency-drill-card outcome-${item.outcome}"><div><span>${esc(item.outcome.replace("-"," "))}</span><h3>${esc(item.scenario)}</h3><p>${esc(formatTripDate(item.date))} • ${Number(item.durationMinutes)||0} min${item.participants?` • ${esc(item.participants)}`:""}</p></div><div><p>${esc(item.actions)}</p>${item.lessons?`<small><strong>Lessons:</strong> ${esc(item.lessons)}</small>`:""}${item.nextReview?`<small><strong>Next review:</strong> ${esc(formatTripDate(item.nextReview))}</small>`:""}</div><div><button class="secondary-btn" data-emergency-drill-edit="${item.id}">Edit</button><button class="danger-btn" data-emergency-drill-delete="${item.id}">Delete</button></div></article>`).join(""):'<article class="panel emergency-empty"><strong>No drills recorded</strong><p>Practise isolation, evacuation and roadside procedures, then record lessons here.</p></article>';
  const equipment=[...(state.emergencyEquipment||[])].sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name));
  $("#emergencyEquipment").innerHTML=equipment.length?equipment.map(item=>{const status=emergencyEquipmentStatus(item);return `<article class="panel emergency-equipment-card status-${status.status}"><div><span>${esc(status.label)}</span><h3>${esc(item.name)}</h3><p>${esc(item.type)}${item.location?` • ${esc(item.location)}`:""}</p></div><dl><div><dt>Last checked</dt><dd>${item.lastChecked?esc(formatTripDate(item.lastChecked)):"Not recorded"}</dd></div><div><dt>Expiry</dt><dd>${item.expiry?esc(formatTripDate(item.expiry)):"Not set"}</dd></div></dl>${item.notes?`<p>${esc(item.notes)}</p>`:""}<div><button class="secondary-btn" data-emergency-equipment-edit="${item.id}">Edit</button><button class="danger-btn" data-emergency-equipment-delete="${item.id}">Delete</button></div></article>`}).join(""):'<article class="panel emergency-empty"><strong>No safety equipment recorded</strong><p>Add extinguishers, alarms, first-aid and roadside warning equipment.</p></article>';
  renderEmergencyCalendar();
  $("#emergencyIdentity").innerHTML=`<div><span class="eyebrow">Vehicle identity</span><h2>${esc(profile.make||"Knaus")} ${esc(profile.model||"Sun Traveller")}</h2><p>Keep these details ready for recovery, insurance or emergency responders.</p></div><dl><div><dt>Registration</dt><dd>${esc(profile.registration||"Not recorded")}</dd></div><div><dt>VIN</dt><dd>${esc(profile.vin||"Not recorded")}</dd></div><div><dt>Year</dt><dd>${esc(profile.year||"Not recorded")}</dd></div><div><dt>Mileage</dt><dd>${Number(state.currentMileage||0).toLocaleString()} km</dd></div></dl>`;
  const guides=[["gas","🔥","Gas supply","If it is safe to approach, extinguish flames, ventilate and close cylinder valves. Leave immediately if gas is strongly suspected."],["electrical","⚡","Electrical supply","If safe, disconnect the external hook-up before isolating onboard 12 V power. Do not touch damaged or wet electrical equipment."],["water","💧","Water supply","Switch off the water pump and isolate the supply if a leak is causing damage. Keep water away from electrical equipment."],["diagnostics","⚠️","Fault guidance","Use saved faults and guided checks only after immediate danger has passed and the vehicle is secure."]];
  $("#emergencyIsolation").innerHTML=guides.map(([route,icon,title,detail])=>`<button class="panel emergency-isolation-card" data-route="${route}"><span>${icon}</span><span><strong>${title}</strong><small>${detail}</small></span><b>→</b></button>`).join("");
  $("#emergencyContacts").innerHTML=contacts.length?contacts.map(item=>{const tel=String(item.phone||"").replace(/[^\d+*#]/g,""),reviewOverdue=item.nextReview&&item.nextReview<new Date().toISOString().slice(0,10);return `<article class="panel emergency-contact-card ${item.primary?"primary":""} ${reviewOverdue?"review-overdue":""}"><div><span>${item.primary?"Primary • ":""}${esc(item.role)}${reviewOverdue?" • Review overdue":""}</span><h3>${esc(item.name)}</h3><p>${esc(item.phone)}${item.reference?` • ${esc(item.reference)}`:""}</p>${item.lastVerified?`<small>Verified ${esc(formatTripDate(item.lastVerified))}${item.nextReview?` • Review ${esc(formatTripDate(item.nextReview))}`:""}</small>`:""}${item.notes?`<small>${esc(item.notes)}</small>`:""}</div><div><a class="primary-btn" href="tel:${esc(tel)}">Call</a><button class="secondary-btn" data-emergency-contact-edit="${item.id}">Edit</button><button class="danger-btn" data-emergency-contact-delete="${item.id}">Delete</button></div></article>`}).join(""):'<article class="panel emergency-empty"><strong>No assistance contacts saved</strong><p>Add your insurer, roadside provider, recovery service and trusted personal contacts.</p></article>';
  $("#emergencyIncidents").innerHTML=incidents.length?incidents.map(item=>`<article class="panel emergency-incident-card severity-${item.severity} status-${item.status}"><div><span>${esc(item.status)} • ${esc(item.severity)}</span><h3>${esc(item.title)}</h3><p>${esc(item.category)} • ${esc(new Date(item.occurredAt).toLocaleString())}${item.location?` • ${esc(item.location)}`:""}</p><small>${(item.updates||[]).length} timeline update${(item.updates||[]).length===1?"":"s"}</small></div><div class="emergency-incident-detail"><p><strong>Actions:</strong> ${esc(item.actions)}</p>${item.contacted?`<p><strong>Contacted:</strong> ${esc(item.contacted)}</p>`:""}${item.followUp?`<p><strong>Follow-up:</strong> ${esc(item.followUp)}</p>`:""}</div><div><button class="primary-btn" data-emergency-incident-update="${item.id}">Add update</button><button class="secondary-btn" data-emergency-incident-report="${item.id}">Report</button><button class="secondary-btn" data-emergency-incident-edit="${item.id}">Edit</button><button class="danger-btn" data-emergency-incident-delete="${item.id}">Delete</button></div></article>`).join(""):'<article class="panel emergency-empty"><strong>No incidents recorded</strong><p>Emergency, breakdown and recovery records will appear here.</p></article>';
  $("#emergencyNotes").value=state.emergencyNotes||"";
}
function openEmergencyContactEditor(id=null){editingEmergencyContactId=id;const item=(state.emergencyContacts||[]).find(entry=>entry.id===id)||{};$("#emergencyContactDialogTitle").textContent=id?"Edit contact":"Add contact";$("#emergencyContactName").value=item.name||"";$("#emergencyContactRole").value=item.role||"Roadside assistance";$("#emergencyContactPhone").value=item.phone||"";$("#emergencyContactReference").value=item.reference||"";$("#emergencyContactVerified").value=item.lastVerified||"";$("#emergencyContactReview").value=item.nextReview||"";$("#emergencyContactNotes").value=item.notes||"";$("#emergencyContactPrimary").checked=Boolean(item.primary);const dialog=$("#emergencyContactDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}
function closeEmergencyContactEditor(){const dialog=$("#emergencyContactDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingEmergencyContactId=null}
function saveEmergencyContact(event){event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.emergencyContacts||[]).find(item=>item.id===editingEmergencyContactId),item={id:existing?.id||`emergency-${Date.now()}`,name:values.name.trim(),role:values.role,phone:values.phone.trim(),reference:values.reference.trim(),lastVerified:values.lastVerified,nextReview:values.nextReview,notes:values.notes.trim(),primary:values.primary==="on",createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};state.emergencyContacts=existing?state.emergencyContacts.map(entry=>entry.id===existing.id?item:entry):[item,...(state.emergencyContacts||[])];saveState();closeEmergencyContactEditor();renderEmergency();renderHome();toast(existing?"Emergency contact updated":"Emergency contact added")}
function deleteEmergencyContact(id){const item=(state.emergencyContacts||[]).find(entry=>entry.id===id);if(!item||!confirm(`Delete emergency contact “${item.name}”?`))return;state.emergencyContacts=state.emergencyContacts.filter(entry=>entry.id!==id);saveState();renderEmergency();toast("Emergency contact deleted")}
function openEmergencyDrillEditor(id=null){editingEmergencyDrillId=id;const item=(state.emergencyDrills||[]).find(entry=>entry.id===id)||{};$("#emergencyDrillDialogTitle").textContent=id?"Edit drill":"Record drill";$("#emergencyDrillDate").value=item.date||new Date().toISOString().slice(0,10);$("#emergencyDrillScenario").value=item.scenario||"Gas isolation";$("#emergencyDrillParticipants").value=item.participants||"";$("#emergencyDrillDuration").value=item.durationMinutes??"";$("#emergencyDrillOutcome").value=item.outcome||"ready";$("#emergencyDrillNextReview").value=item.nextReview||"";$("#emergencyDrillActions").value=item.actions||"";$("#emergencyDrillLessons").value=item.lessons||"";const dialog=$("#emergencyDrillDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}
function closeEmergencyDrillEditor(){const dialog=$("#emergencyDrillDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingEmergencyDrillId=null}
function saveEmergencyDrill(event){event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.emergencyDrills||[]).find(item=>item.id===editingEmergencyDrillId),item={id:existing?.id||`emergency-drill-${Date.now()}`,date:values.date,scenario:values.scenario,participants:values.participants.trim(),durationMinutes:values.durationMinutes===""?null:Number(values.durationMinutes),outcome:values.outcome,nextReview:values.nextReview,actions:values.actions.trim(),lessons:values.lessons.trim(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};state.emergencyDrills=existing?state.emergencyDrills.map(entry=>entry.id===existing.id?item:entry):[item,...(state.emergencyDrills||[])];saveState();closeEmergencyDrillEditor();renderEmergency();renderHome();toast(existing?"Emergency drill updated":"Emergency drill recorded")}
function deleteEmergencyDrill(id){const item=(state.emergencyDrills||[]).find(entry=>entry.id===id);if(!item||!confirm(`Delete ${item.scenario} drill?`))return;state.emergencyDrills=state.emergencyDrills.filter(entry=>entry.id!==id);saveState();renderEmergency();renderHome();toast("Emergency drill deleted")}
function openEmergencyEquipmentEditor(id=null){editingEmergencyEquipmentId=id;const item=(state.emergencyEquipment||[]).find(entry=>entry.id===id)||{};$("#emergencyEquipmentDialogTitle").textContent=id?"Edit equipment":"Add equipment";$("#emergencyEquipmentType").value=item.type||"Fire extinguisher";$("#emergencyEquipmentName").value=item.name||"";$("#emergencyEquipmentLocation").value=item.location||"";$("#emergencyEquipmentChecked").value=item.lastChecked||"";$("#emergencyEquipmentExpiry").value=item.expiry||"";$("#emergencyEquipmentCondition").value=item.condition||"ready";$("#emergencyEquipmentNotes").value=item.notes||"";const dialog=$("#emergencyEquipmentDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}
function closeEmergencyEquipmentEditor(){const dialog=$("#emergencyEquipmentDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingEmergencyEquipmentId=null}
function saveEmergencyEquipment(event){event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.emergencyEquipment||[]).find(item=>item.id===editingEmergencyEquipmentId),item={id:existing?.id||`emergency-equipment-${Date.now()}`,type:values.type,name:values.name.trim(),location:values.location.trim(),lastChecked:values.lastChecked,expiry:values.expiry,condition:values.condition,notes:values.notes.trim(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};state.emergencyEquipment=existing?state.emergencyEquipment.map(entry=>entry.id===existing.id?item:entry):[item,...(state.emergencyEquipment||[])];saveState();closeEmergencyEquipmentEditor();renderEmergency();renderHome();toast(existing?"Safety equipment updated":"Safety equipment added")}
function deleteEmergencyEquipment(id){const item=(state.emergencyEquipment||[]).find(entry=>entry.id===id);if(!item||!confirm(`Delete ${item.name}?`))return;state.emergencyEquipment=state.emergencyEquipment.filter(entry=>entry.id!==id);saveState();renderEmergency();renderHome();toast("Safety equipment deleted")}
function openEmergencyIncidentEditor(id=null){editingEmergencyIncidentId=id;const item=(state.emergencyIncidents||[]).find(entry=>entry.id===id)||{};$("#emergencyIncidentDialogTitle").textContent=id?"Edit incident":"Record incident";$("#emergencyIncidentTitle").value=item.title||"";$("#emergencyIncidentOccurred").value=item.occurredAt||new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);$("#emergencyIncidentLocation").value=item.location||"";$("#emergencyIncidentCategory").value=item.category||"Breakdown";$("#emergencyIncidentSeverity").value=item.severity||"medium";$("#emergencyIncidentStatus").value=item.status||"open";$("#emergencyIncidentContacted").value=item.contacted||"";$("#emergencyIncidentActions").value=item.actions||"";$("#emergencyIncidentFollowUp").value=item.followUp||"";const dialog=$("#emergencyIncidentDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}
function closeEmergencyIncidentEditor(){const dialog=$("#emergencyIncidentDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingEmergencyIncidentId=null}
function saveEmergencyIncident(event){event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.emergencyIncidents||[]).find(item=>item.id===editingEmergencyIncidentId),item={id:existing?.id||`incident-${Date.now()}`,title:values.title.trim(),occurredAt:values.occurredAt,location:values.location.trim(),category:values.category,severity:values.severity,status:values.status,contacted:values.contacted.trim(),actions:values.actions.trim(),followUp:values.followUp.trim(),updates:existing?.updates||[],createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};state.emergencyIncidents=existing?state.emergencyIncidents.map(entry=>entry.id===existing.id?item:entry):[item,...(state.emergencyIncidents||[])];saveState();closeEmergencyIncidentEditor();renderEmergency();renderHome();toast(existing?"Incident updated":"Incident recorded")}
function deleteEmergencyIncident(id){const item=(state.emergencyIncidents||[]).find(entry=>entry.id===id);if(!item||!confirm(`Delete incident “${item.title}”?`))return;state.emergencyIncidents=state.emergencyIncidents.filter(entry=>entry.id!==id);saveState();renderEmergency();renderHome();toast("Incident deleted")}
function openEmergencyIncidentUpdate(id){activeEmergencyIncidentUpdateId=id;const item=(state.emergencyIncidents||[]).find(entry=>entry.id===id);if(!item)return;$("#emergencyIncidentUpdateTitle").textContent=`Update ${item.title}`;$("#emergencyIncidentUpdateOccurred").value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);$("#emergencyIncidentUpdateType").value="Action";$("#emergencyIncidentUpdateStatus").value=item.status||"open";$("#emergencyIncidentUpdateBy").value="";$("#emergencyIncidentUpdateNotes").value="";const dialog=$("#emergencyIncidentUpdateDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","")}
function closeEmergencyIncidentUpdate(){const dialog=$("#emergencyIncidentUpdateDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");activeEmergencyIncidentUpdateId=null}
function saveEmergencyIncidentUpdate(event){event.preventDefault();const item=(state.emergencyIncidents||[]).find(entry=>entry.id===activeEmergencyIncidentUpdateId);if(!item)return;const values=Object.fromEntries(new FormData(event.currentTarget)),update={id:`incident-update-${Date.now()}`,occurredAt:values.occurredAt,type:values.type,status:values.status,recordedBy:values.recordedBy.trim(),notes:values.notes.trim(),createdAt:new Date().toISOString()};item.updates=[...(item.updates||[]),update];item.status=update.status;item.updatedAt=update.createdAt;saveState();closeEmergencyIncidentUpdate();renderEmergency();renderHome();toast("Incident timeline updated")}
function deleteEmergencyIncidentUpdate(incidentId,updateId){const item=(state.emergencyIncidents||[]).find(entry=>entry.id===incidentId),update=(item?.updates||[]).find(entry=>entry.id===updateId);if(!item||!update||!confirm("Delete this incident timeline update?"))return;item.updates=item.updates.filter(entry=>entry.id!==updateId);item.updatedAt=new Date().toISOString();saveState();renderEmergency();openEmergencyIncidentReport(incidentId);toast("Timeline update deleted")}
function emergencyIncidentReportData(){const incident=(state.emergencyIncidents||[]).find(item=>item.id===activeEmergencyIncidentReportId),profile=state.vehicleProfile||{};return incident?{app:"Knaus Companion",version:APP_VERSION,exportedAt:new Date().toISOString(),vehicle:{make:profile.make||"Knaus",model:profile.model||"Sun Traveller",registration:profile.registration||"",vin:profile.vin||"",mileage:Number(state.currentMileage)||0},incident}:null}
function emergencyIncidentReportHtml(actions=true){const report=emergencyIncidentReportData();if(!report)return"";const item=report.incident,updates=[...(item.updates||[])].sort((a,b)=>String(a.occurredAt).localeCompare(String(b.occurredAt)));return `<article class="emergency-incident-report"><div class="diagnostic-meta"><span>${esc(item.category)}</span><span>${esc(item.severity)} severity</span><span>${esc(item.status)}</span><span>${esc(new Date(item.occurredAt).toLocaleString())}</span>${item.location?`<span>${esc(item.location)}</span>`:""}</div><section><h3>Vehicle</h3><dl class="component-facts"><div><dt>Vehicle</dt><dd>${esc(report.vehicle.make)} ${esc(report.vehicle.model)}</dd></div><div><dt>Registration</dt><dd>${esc(report.vehicle.registration||"Not recorded")}</dd></div><div><dt>VIN</dt><dd>${esc(report.vehicle.vin||"Not recorded")}</dd></div><div><dt>Mileage</dt><dd>${report.vehicle.mileage.toLocaleString()} km</dd></div></dl></section><section><h3>Actions taken</h3><p>${esc(item.actions)}</p></section><section><h3>Assistance</h3><p>${esc(item.contacted||"No assistance contact recorded")}</p></section><section><h3>Follow-up</h3><p>${esc(item.followUp||"No follow-up recorded")}</p></section><section><h3>Incident timeline</h3><div class="emergency-incident-timeline">${updates.length?updates.map(update=>`<article><time>${esc(new Date(update.occurredAt).toLocaleString())}</time><div><strong>${esc(update.type)} • ${esc(update.status)}</strong>${update.recordedBy?`<small>Recorded by ${esc(update.recordedBy)}</small>`:""}<p>${esc(update.notes)}</p></div>${actions?`<button class="danger-btn" data-emergency-incident-update-delete="${update.id}" data-incident-id="${item.id}">Delete</button>`:""}</article>`).join(""):"<p>No timeline updates recorded.</p>"}</div></section>${actions?`<div class="diagnostic-actions"><button class="primary-btn" data-emergency-incident-update="${item.id}">Add update</button><button class="primary-btn" data-emergency-incident-report-print>Print report</button><button class="secondary-btn" data-emergency-incident-report-export>Export JSON</button></div>`:""}</article>`}
function openEmergencyIncidentReport(id){activeEmergencyIncidentReportId=id;const item=(state.emergencyIncidents||[]).find(entry=>entry.id===id);if(item)showDialog("Incident report",item.title,emergencyIncidentReportHtml(),true)}
function exportEmergencyIncidentReport(){const report=emergencyIncidentReportData();if(!report)return;const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-incident-${report.incident.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Incident report exported")}
function printEmergencyIncidentReport(){const report=emergencyIncidentReportData();if(!report)return;const popup=window.open("","_blank","width=900,height=700");if(!popup){toast("Allow pop-ups to print this report");return}popup.document.write(`<!doctype html><html><head><title>${esc(report.incident.title)}</title><style>body{font:15px system-ui;max-width:900px;margin:30px auto;padding:0 20px;color:#172033}h1{margin-bottom:4px}.meta{color:#526071}section{margin:24px 0}.diagnostic-meta{display:flex;gap:8px;flex-wrap:wrap}.diagnostic-meta span,.component-facts div{padding:8px;background:#eef2f6;border-radius:8px}.component-facts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.component-facts dt{color:#526071}.component-facts dd{margin:3px 0 0;font-weight:700}</style></head><body><h1>${esc(report.incident.title)}</h1><p class="meta">Knaus Companion emergency incident report</p>${emergencyIncidentReportHtml(false)}</body></html>`);popup.document.close();popup.focus();setTimeout(()=>popup.print(),200)}
function saveEmergencyNotes(){state.emergencyNotes=$("#emergencyNotes").value.trim();saveState();toast("Emergency notes saved")}
function toggleEmergencyReadiness(id){if(!EMERGENCY_READINESS_ITEMS.some(item=>item.id===id))return;state.emergencyReadiness={...(state.emergencyReadiness||{}),[id]:!state.emergencyReadiness?.[id]};saveState();renderEmergency();toast(state.emergencyReadiness[id]?"Readiness check complete":"Readiness check reopened")}
function emergencyHandoffData(){
  const profile=state.vehicleProfile||{},readiness=state.emergencyReadiness||{},readinessItems=EMERGENCY_READINESS_ITEMS.map(item=>({...item,complete:Boolean(readiness[item.id])})),readyCount=readinessItems.filter(item=>item.complete).length;
  return {app:"Knaus Companion",version:APP_VERSION,generatedAt:new Date().toISOString(),vehicle:{make:profile.make||"Knaus",model:profile.model||"Sun Traveller",year:profile.year||"",registration:profile.registration||"",vin:profile.vin||"",baseVehicle:profile.baseVehicle||"",mileage:Number(state.currentMileage)||0},readiness:{score:Math.round(readyCount/readinessItems.length*100),complete:readyCount,total:readinessItems.length,items:readinessItems},contacts:[...(state.emergencyContacts||[])].sort((a,b)=>Number(b.primary)-Number(a.primary)||a.name.localeCompare(b.name)),openIncidents:[...(state.emergencyIncidents||[])].filter(item=>item.status!=="resolved").sort((a,b)=>String(b.occurredAt).localeCompare(String(a.occurredAt))),recentDrills:[...(state.emergencyDrills||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,5),equipment:[...(state.emergencyEquipment||[])].map(item=>({...item,status:emergencyEquipmentStatus(item)})),emergencyNotes:state.emergencyNotes||""};
}
function emergencyHandoffHtml(actions=true){
  const report=emergencyHandoffData(),vehicle=report.vehicle;
  return `<article class="emergency-handoff"><div class="diagnostic-meta"><span>${esc(vehicle.make)} ${esc(vehicle.model)}</span>${vehicle.registration?`<span>${esc(vehicle.registration)}</span>`:""}${vehicle.vin?`<span>VIN ${esc(vehicle.vin)}</span>`:""}<span>${vehicle.mileage.toLocaleString()} km</span><span>Generated ${esc(new Date(report.generatedAt).toLocaleString())}</span></div><section><h3>Vehicle identity</h3><dl class="component-facts"><div><dt>Vehicle</dt><dd>${esc([vehicle.year,vehicle.make,vehicle.model].filter(Boolean).join(" "))}</dd></div><div><dt>Base vehicle</dt><dd>${esc(vehicle.baseVehicle||"Not recorded")}</dd></div><div><dt>Registration</dt><dd>${esc(vehicle.registration||"Not recorded")}</dd></div><div><dt>VIN</dt><dd>${esc(vehicle.vin||"Not recorded")}</dd></div></dl></section><section><h3>Emergency readiness — ${report.readiness.score}%</h3><div class="emergency-handoff-readiness">${report.readiness.items.map(item=>`<span class="${item.complete?"complete":""}">${item.complete?"✓":"○"} ${esc(item.title)}</span>`).join("")}</div></section><section><h3>Assistance contacts</h3>${report.contacts.length?`<table><thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Reference</th></tr></thead><tbody>${report.contacts.map(item=>`<tr><td>${esc(item.name)}${item.primary?" • Primary":""}</td><td>${esc(item.role)}</td><td>${esc(item.phone)}</td><td>${esc(item.reference||"—")}</td></tr>`).join("")}</tbody></table>`:"<p>No emergency contacts recorded.</p>"}</section><section><h3>Open incidents</h3>${report.openIncidents.length?`<table><thead><tr><th>Incident</th><th>When / where</th><th>Severity</th><th>Latest action</th></tr></thead><tbody>${report.openIncidents.map(item=>`<tr><td>${esc(item.title)}<br><small>${esc(item.category)} • ${esc(item.status)}</small></td><td>${esc(new Date(item.occurredAt).toLocaleString())}${item.location?`<br>${esc(item.location)}`:""}</td><td>${esc(item.severity)}</td><td>${esc(item.updates?.at(-1)?.notes||item.actions)}</td></tr>`).join("")}</tbody></table>`:"<p>No open incidents.</p>"}</section><section><h3>Recent emergency drills</h3>${report.recentDrills.length?`<table><thead><tr><th>Date</th><th>Scenario</th><th>Outcome</th><th>Next review</th></tr></thead><tbody>${report.recentDrills.map(item=>`<tr><td>${esc(formatTripDate(item.date))}</td><td>${esc(item.scenario)}</td><td>${esc(item.outcome)}</td><td>${item.nextReview?esc(formatTripDate(item.nextReview)):"—"}</td></tr>`).join("")}</tbody></table>`:"<p>No emergency drills recorded.</p>"}</section><section><h3>Emergency notes</h3><p>${esc(report.emergencyNotes||"No emergency notes recorded.")}</p></section>${actions?'<div class="diagnostic-actions"><button class="primary-btn" data-emergency-handoff-print>Print handoff</button><button class="secondary-btn" data-emergency-handoff-export>Export JSON</button></div>':""}</article>`;
}
function openEmergencyHandoff(){showDialog("Emergency handoff","Responder and recovery pack",emergencyHandoffHtml(),true)}
function exportEmergencyHandoff(){const report=emergencyHandoffData(),blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-emergency-handoff-${report.generatedAt.slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Emergency handoff exported")}
function printEmergencyHandoff(){const report=emergencyHandoffData(),popup=window.open("","_blank","width=1000,height=760");if(!popup){toast("Allow pop-ups to print this handoff");return}popup.document.write(`<!doctype html><html><head><title>Knaus emergency handoff</title><style>body{font:14px system-ui;max-width:1000px;margin:28px auto;padding:0 20px;color:#172033}h1{margin-bottom:4px}.meta{color:#526071}section{margin:22px 0}.diagnostic-meta,.emergency-handoff-readiness{display:flex;gap:7px;flex-wrap:wrap}.diagnostic-meta span,.emergency-handoff-readiness span,.component-facts div{padding:8px;background:#eef2f6;border-radius:8px}.emergency-handoff-readiness .complete{background:#dcfce7}.component-facts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.component-facts dt{color:#526071}.component-facts dd{margin:3px 0 0;font-weight:700}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #cad2dc;text-align:left;vertical-align:top}th{background:#eef2f6}section>p{white-space:pre-wrap}</style></head><body><h1>Emergency handoff</h1><p class="meta">Knaus Companion responder and recovery pack</p>${emergencyHandoffHtml(false)}</body></html>`);popup.document.close();popup.focus();setTimeout(()=>popup.print(),200)}
function renderSeasonal(){const mode=SEASONAL_CHECKLISTS.find(item=>item.id===activeSeasonalMode)||SEASONAL_CHECKLISTS[0],progress=state.seasonalProgress||{},plan=state.seasonalPlans?.[mode.id]||{},supplies=state.seasonalSupplies||{},modeDone=mode.items.filter(([id])=>progress[`${mode.id}:${id}`]).length,supplyDone=mode.supplies.filter(([id])=>supplies[`${mode.id}:${id}`]).length,percent=Math.round(modeDone/mode.items.length*100);$("#seasonalSummary").innerHTML=SEASONAL_CHECKLISTS.map(list=>{const done=list.items.filter(([id])=>progress[`${list.id}:${id}`]).length;return `<article class="stat-card"><strong>${done}/${list.items.length}</strong><span>${esc(list.title)}</span></article>`}).join("");$("#seasonalModes").innerHTML=SEASONAL_CHECKLISTS.map(list=>`<button class="chip ${list.id===mode.id?"active":""}" data-seasonal-mode="${list.id}">${esc(list.title)}</button>`).join("");$("#seasonalTitle").textContent=mode.title;$("#seasonalDetail").textContent=mode.detail;$("#seasonalScore").textContent=`${percent}%`;$("#seasonalBar").style.width=`${percent}%`;$("#archiveSeasonalCycle").disabled=modeDone<mode.items.length;$("#seasonalPlanTarget").value=plan.targetDate||"";$("#seasonalPlanNotes").value=plan.notes||"";$("#seasonalChecklist").innerHTML=mode.items.map(([id,title,route])=>{const complete=Boolean(progress[`${mode.id}:${id}`]);return `<article class="panel seasonal-item ${complete?"complete":""}"><button class="seasonal-check" data-seasonal-check="${mode.id}:${id}" role="checkbox" aria-checked="${complete}"><span>${complete?"✓":""}</span><strong>${esc(title)}</strong></button><button class="secondary-btn" data-route="${route}">Open guidance</button></article>`}).join("");$("#seasonalSuppliesTitle").textContent=`${mode.title} supplies`;$("#seasonalSuppliesScore").textContent=`${supplyDone}/${mode.supplies.length} ready`;$("#seasonalSupplies").innerHTML=mode.supplies.map(([id,title])=>{const ready=Boolean(supplies[`${mode.id}:${id}`]);return `<button class="panel seasonal-supply ${ready?"ready":""}" data-seasonal-supply="${mode.id}:${id}" role="checkbox" aria-checked="${ready}"><span>${ready?"✓":""}</span><strong>${esc(title)}</strong></button>`}).join("");renderSeasonalCustomTasks();renderSeasonalCalendar();renderSeasonalHistory()}
function toggleSeasonalCheck(key){state.seasonalProgress={...(state.seasonalProgress||{}),[key]:!state.seasonalProgress?.[key]};saveState();renderSeasonal();toast(state.seasonalProgress[key]?"Seasonal check complete":"Seasonal check reopened")}
function toggleSeasonalSupply(key){state.seasonalSupplies={...(state.seasonalSupplies||{}),[key]:!state.seasonalSupplies?.[key]};saveState();renderSeasonal();toast(state.seasonalSupplies[key]?"Seasonal supply ready":"Seasonal supply needed")}
function seasonalPriorityRank(value){return{critical:0,high:1,normal:2}[value]??2}
function renderSeasonalCustomTasks(){const allTasks=(state.seasonalCustomTasks||[]).filter(item=>item.mode===activeSeasonalMode).sort((a,b)=>seasonalPriorityRank(a.priority)-seasonalPriorityRank(b.priority)||String(a.dueDate||"9999").localeCompare(String(b.dueDate||"9999"))),today=new Date().toISOString().slice(0,10),dueLimit=new Date(Date.now()+14*86400000).toISOString().slice(0,10),matches={all:()=>true,open:item=>!item.complete,due:item=>!item.complete&&Boolean(item.dueDate)&&item.dueDate<=dueLimit,priority:item=>!item.complete&&["high","critical"].includes(item.priority),complete:item=>item.complete},tasks=allTasks.filter(matches[seasonalCustomTaskFilter]||matches.all),filters=[["all","All"],["open","Open"],["due","Due"],["priority","High priority"],["complete","Complete"]];$("#seasonalCustomTaskFilters").innerHTML=filters.map(([id,label])=>`<button class="chip ${seasonalCustomTaskFilter===id?"active":""}" data-seasonal-custom-filter="${id}">${label} <span>${allTasks.filter(matches[id]).length}</span></button>`).join("");$("#seasonalCustomTaskCount").textContent=`Showing ${tasks.length} of ${allTasks.length}`;$("#seasonalCustomTasks").innerHTML=tasks.length?tasks.map(item=>`<article class="panel seasonal-item priority-${item.priority||"normal"} ${item.complete?"complete":""} ${item.dueDate&&item.dueDate<today&&!item.complete?"overdue":""}"><button class="seasonal-check" data-seasonal-custom-toggle="${item.id}" role="checkbox" aria-checked="${Boolean(item.complete)}"><span>${item.complete?"✓":""}</span><strong>${esc(item.title)}<small>${esc(item.priority||"normal")} priority${item.dueDate?` • Due ${esc(formatTripDate(item.dueDate))}`:""}</small></strong></button><div><button class="secondary-btn" data-route="${item.route}">Guidance</button><button class="secondary-btn" data-seasonal-custom-edit="${item.id}">Edit</button><button class="danger-btn" data-seasonal-custom-delete="${item.id}">Delete</button></div></article>`).join(""):`<article class="panel"><p>${allTasks.length?"No custom tasks match this filter.":"No custom tasks for this seasonal mode."}</p></article>`}
function resetSeasonalCustomTaskForm(){const form=$("#seasonalCustomTaskForm");form.reset();$("#seasonalCustomTaskId").value="";$("#seasonalCustomTaskSubmitLabel").textContent="Add task";$("#cancelSeasonalCustomTaskEdit").hidden=true}
function editSeasonalCustomTask(id){const item=(state.seasonalCustomTasks||[]).find(entry=>entry.id===id);if(!item)return;$("#seasonalCustomTaskId").value=item.id;$("#seasonalCustomTaskTitle").value=item.title;$("#seasonalCustomTaskRoute").value=item.route;$("#seasonalCustomTaskPriority").value=item.priority||"normal";$("#seasonalCustomTaskDueDate").value=item.dueDate||"";$("#seasonalCustomTaskSubmitLabel").textContent="Save changes";$("#cancelSeasonalCustomTaskEdit").hidden=false;$("#seasonalCustomTaskTitle").focus()}
function saveSeasonalCustomTask(event){event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),title=values.title.trim(),existing=(state.seasonalCustomTasks||[]).find(item=>item.id===values.id);if(existing){state.seasonalCustomTasks=state.seasonalCustomTasks.map(item=>item.id===values.id?{...item,title,route:values.route,priority:values.priority||"normal",dueDate:values.dueDate||"",updatedAt:new Date().toISOString()}:item)}else{const item={id:`seasonal-custom-${Date.now()}`,mode:activeSeasonalMode,title,route:values.route,priority:values.priority||"normal",dueDate:values.dueDate||"",complete:false,createdAt:new Date().toISOString()};state.seasonalCustomTasks=[item,...(state.seasonalCustomTasks||[])]}saveState();resetSeasonalCustomTaskForm();renderSeasonal();toast(existing?"Custom seasonal task updated":"Custom seasonal task added")}
function toggleSeasonalCustomTask(id){state.seasonalCustomTasks=(state.seasonalCustomTasks||[]).map(item=>item.id===id?{...item,complete:!item.complete,updatedAt:new Date().toISOString()}:item);saveState();renderSeasonal()}
function deleteSeasonalCustomTask(id){const item=(state.seasonalCustomTasks||[]).find(entry=>entry.id===id);if(!item||!confirm(`Delete custom task “${item.title}”?`))return;state.seasonalCustomTasks=state.seasonalCustomTasks.filter(entry=>entry.id!==id);if($("#seasonalCustomTaskId").value===id)resetSeasonalCustomTaskForm();saveState();renderSeasonal();toast("Custom seasonal task deleted")}
function saveSeasonalPlan(event){event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));state.seasonalPlans={...(state.seasonalPlans||{}),[activeSeasonalMode]:{targetDate:values.targetDate,notes:values.notes.trim(),updatedAt:new Date().toISOString()}};saveState();renderSeasonal();renderHome();toast("Seasonal plan saved")}
function seasonalCalendarEvents(){const plans=SEASONAL_CHECKLISTS.map(list=>{const plan=state.seasonalPlans?.[list.id];if(!plan?.targetDate)return null;const tasks=seasonalModeTasks(list),done=tasks.filter(item=>item.complete).length;return{id:list.id,mode:list.id,date:plan.targetDate,title:list.title,detail:`${done}/${tasks.length} tasks complete${plan.notes?` • ${plan.notes}`:""}`,complete:done===tasks.length}}).filter(Boolean),custom=(state.seasonalCustomTasks||[]).filter(item=>item.dueDate).map(item=>({id:`${item.mode}-${item.id}`,mode:item.mode,date:item.dueDate,title:item.title,detail:`${item.priority||"normal"} priority • custom ${item.mode} task`,complete:Boolean(item.complete),taskId:item.id}));return [...plans,...custom].sort((a,b)=>a.date.localeCompare(b.date))}
function renderSeasonalCalendar(){const events=seasonalCalendarEvents(),today=new Date().toISOString().slice(0,10);$("#seasonalCalendar").innerHTML=events.length?events.map(item=>`<button class="panel seasonal-calendar-event ${item.date<today&&!item.complete?"overdue":""} ${item.complete?"complete":""}" data-seasonal-mode="${item.mode}"><span>${item.complete?"✓":"❄"}</span><span><strong>${esc(item.title)}</strong><small>${esc(formatTripDate(item.date))} • ${esc(item.detail)}</small></span><b>→</b></button>`).join(""):'<article class="panel"><p>Add a target date or custom task due date to build this calendar.</p></article>'}
function exportSeasonalCalendar(){const today=new Date().toISOString().slice(0,10),events=seasonalCalendarEvents().filter(item=>item.date>=today&&!item.complete),escapeIcs=value=>String(value||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;"),stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""),lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Knaus Companion//Seasonal Calendar//EN","CALSCALE:GREGORIAN",...events.flatMap(item=>["BEGIN:VEVENT",`UID:seasonal-${item.id}-${item.date}@knaus-companion`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${item.date.replace(/-/g,"")}`,`SUMMARY:${escapeIcs(item.title)}`,`DESCRIPTION:${escapeIcs(item.detail)}`,"END:VEVENT"]),"END:VCALENDAR"],blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-seasonal-calendar-${today}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(`${events.length} seasonal events exported`)}
function renderSeasonalHistory(){const cycles=[...(state.seasonalCycles||[])].sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt)));$("#seasonalHistory").innerHTML=cycles.length?cycles.map(item=>`<article class="panel seasonal-history-card"><span>✓</span><div><strong>${esc(item.title)}</strong><small>Completed ${esc(new Date(item.completedAt).toLocaleString())}${item.targetDate?` • Target ${esc(formatTripDate(item.targetDate))}`:""}</small>${item.notes?`<p>${esc(item.notes)}</p>`:""}</div></article>`).join(""):'<article class="panel"><p>Archived completed seasonal cycles will appear here.</p></article>'}
function archiveSeasonalCycle(){const mode=SEASONAL_CHECKLISTS.find(item=>item.id===activeSeasonalMode),done=mode?.items.filter(([id])=>state.seasonalProgress?.[`${mode.id}:${id}`]).length||0;if(!mode||done<mode.items.length)return;const plan=state.seasonalPlans?.[mode.id]||{};if(!confirm(`Archive the completed ${mode.title} cycle and reset its checklist?`))return;state.seasonalCycles=[{id:`seasonal-cycle-${Date.now()}`,mode:mode.id,title:mode.title,targetDate:plan.targetDate||"",notes:plan.notes||"",completedAt:new Date().toISOString(),items:mode.items.map(([id,title])=>({id,title,complete:true}))},...(state.seasonalCycles||[])];const progress={...(state.seasonalProgress||{})};mode.items.forEach(([id])=>delete progress[`${mode.id}:${id}`]);state.seasonalProgress=progress;state.seasonalPlans={...(state.seasonalPlans||{}),[mode.id]:{targetDate:"",notes:"",updatedAt:new Date().toISOString()}};saveState();renderSeasonal();renderHome();toast("Seasonal cycle archived")}
function seasonalReportData(){const profile=state.vehicleProfile||{},modes=SEASONAL_CHECKLISTS.map(list=>{const plan=state.seasonalPlans?.[list.id]||{},items=list.items.map(([id,title,route])=>({id,title,route,complete:Boolean(state.seasonalProgress?.[`${list.id}:${id}`])})),supplies=list.supplies.map(([id,title])=>({id,title,ready:Boolean(state.seasonalSupplies?.[`${list.id}:${id}`])})),done=items.filter(item=>item.complete).length;return{id:list.id,title:list.title,detail:list.detail,targetDate:plan.targetDate||"",notes:plan.notes||"",complete:done,total:items.length,score:Math.round(done/items.length*100),items,supplies}});return{app:"Knaus Companion",version:APP_VERSION,generatedAt:new Date().toISOString(),vehicle:{make:profile.make||"Knaus",model:profile.model||"Sun Traveller",registration:profile.registration||"",vin:profile.vin||"",mileage:Number(state.currentMileage)||0},modes,completedCycles:[...(state.seasonalCycles||[])].sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt)))}}
function seasonalReportHtml(actions=true){const report=seasonalReportData();return `<article class="seasonal-report"><div class="diagnostic-meta"><span>${esc(report.vehicle.make)} ${esc(report.vehicle.model)}</span>${report.vehicle.registration?`<span>${esc(report.vehicle.registration)}</span>`:""}<span>${report.vehicle.mileage.toLocaleString()} km</span><span>Generated ${esc(new Date(report.generatedAt).toLocaleString())}</span></div><section><h3>Current seasonal plans</h3><table><thead><tr><th>Mode</th><th>Progress</th><th>Target</th><th>Notes</th></tr></thead><tbody>${report.modes.map(item=>`<tr><td>${esc(item.title)}</td><td>${item.complete}/${item.total} • ${item.score}%</td><td>${item.targetDate?esc(formatTripDate(item.targetDate)):"—"}</td><td>${esc(item.notes||"—")}</td></tr>`).join("")}</tbody></table></section>${report.modes.map(mode=>`<section><h3>${esc(mode.title)} checklist</h3><ul>${mode.items.map(item=>`<li>${item.complete?"✓":"○"} ${esc(item.title)}</li>`).join("")}</ul></section>`).join("")}<section><h3>Completed cycle history</h3>${report.completedCycles.length?`<table><thead><tr><th>Completed</th><th>Cycle</th><th>Target</th><th>Notes</th></tr></thead><tbody>${report.completedCycles.map(item=>`<tr><td>${esc(new Date(item.completedAt).toLocaleString())}</td><td>${esc(item.title)}</td><td>${item.targetDate?esc(formatTripDate(item.targetDate)):"—"}</td><td>${esc(item.notes||"—")}</td></tr>`).join("")}</tbody></table>`:"<p>No completed cycles archived.</p>"}</section>${actions?'<div class="diagnostic-actions"><button class="primary-btn" data-seasonal-report-print>Print report</button><button class="secondary-btn" data-seasonal-report-export>Export JSON</button></div>':""}</article>`}
function openSeasonalReport(){showDialog("Seasonal care report","Plans, progress and completed cycles",seasonalReportHtml(),true)}
function exportSeasonalReport(){const report=seasonalReportData(),blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-seasonal-report-${report.generatedAt.slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Seasonal report exported")}
function printSeasonalReport(){const popup=window.open("","_blank","width=1000,height=760");if(!popup){toast("Allow pop-ups to print this report");return}popup.document.write(`<!doctype html><html><head><title>Knaus seasonal care report</title><style>body{font:14px system-ui;max-width:1000px;margin:28px auto;padding:0 20px;color:#172033}section{margin:22px 0}.diagnostic-meta{display:flex;gap:7px;flex-wrap:wrap}.diagnostic-meta span{padding:8px;background:#eef2f6;border-radius:8px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #cad2dc;text-align:left;vertical-align:top}th{background:#eef2f6}ul{padding-left:20px}</style></head><body><h1>Seasonal care report</h1>${seasonalReportHtml(false)}</body></html>`);popup.document.close();popup.focus();setTimeout(()=>popup.print(),200)}

// v10.7 promotes owner-defined tasks into progress, archives and reports.
function seasonalModeTasks(mode){
  const standard=mode.items.map(([id,title,route])=>({id,title,route,complete:Boolean(state.seasonalProgress?.[`${mode.id}:${id}`]),custom:false}));
  const custom=(state.seasonalCustomTasks||[]).filter(item=>item.mode===mode.id).map(item=>({...item,custom:true,complete:Boolean(item.complete)}));
  return [...standard,...custom];
}
function renderSeasonal(){
  const mode=SEASONAL_CHECKLISTS.find(item=>item.id===activeSeasonalMode)||SEASONAL_CHECKLISTS[0],progress=state.seasonalProgress||{},plan=state.seasonalPlans?.[mode.id]||{},supplies=state.seasonalSupplies||{},modeTasks=seasonalModeTasks(mode),modeDone=modeTasks.filter(item=>item.complete).length,supplyDone=mode.supplies.filter(([id])=>supplies[`${mode.id}:${id}`]).length,percent=Math.round(modeDone/modeTasks.length*100);
  $("#seasonalSummary").innerHTML=SEASONAL_CHECKLISTS.map(list=>{const tasks=seasonalModeTasks(list),done=tasks.filter(item=>item.complete).length;return `<article class="stat-card"><strong>${done}/${tasks.length}</strong><span>${esc(list.title)}</span></article>`}).join("");
  $("#seasonalModes").innerHTML=SEASONAL_CHECKLISTS.map(list=>`<button class="chip ${list.id===mode.id?"active":""}" data-seasonal-mode="${list.id}">${esc(list.title)}</button>`).join("");
  $("#seasonalTitle").textContent=mode.title;$("#seasonalDetail").textContent=mode.detail;$("#seasonalScore").textContent=`${percent}%`;$("#seasonalBar").style.width=`${percent}%`;$("#archiveSeasonalCycle").disabled=modeDone<modeTasks.length;$("#seasonalPlanTarget").value=plan.targetDate||"";$("#seasonalPlanNotes").value=plan.notes||"";
  $("#seasonalChecklist").innerHTML=mode.items.map(([id,title,route])=>{const complete=Boolean(progress[`${mode.id}:${id}`]);return `<article class="panel seasonal-item ${complete?"complete":""}"><button class="seasonal-check" data-seasonal-check="${mode.id}:${id}" role="checkbox" aria-checked="${complete}"><span>${complete?"✓":""}</span><strong>${esc(title)}</strong></button><button class="secondary-btn" data-route="${route}">Open guidance</button></article>`}).join("");
  $("#seasonalSuppliesTitle").textContent=`${mode.title} supplies`;$("#seasonalSuppliesScore").textContent=`${supplyDone}/${mode.supplies.length} ready`;$("#seasonalSupplies").innerHTML=mode.supplies.map(([id,title])=>{const ready=Boolean(supplies[`${mode.id}:${id}`]);return `<button class="panel seasonal-supply ${ready?"ready":""}" data-seasonal-supply="${mode.id}:${id}" role="checkbox" aria-checked="${ready}"><span>${ready?"✓":""}</span><strong>${esc(title)}</strong></button>`}).join("");
  renderSeasonalCustomTasks();renderSeasonalCalendar();renderSeasonalHistory();
}
function archiveSeasonalCycle(){
  const mode=SEASONAL_CHECKLISTS.find(item=>item.id===activeSeasonalMode),items=mode?seasonalModeTasks(mode):[],done=items.filter(item=>item.complete).length;
  if(!mode||done<items.length)return;
  const plan=state.seasonalPlans?.[mode.id]||{};if(!confirm(`Archive the completed ${mode.title} cycle and reset its checklist?`))return;
  state.seasonalCycles=[{id:`seasonal-cycle-${Date.now()}`,mode:mode.id,title:mode.title,targetDate:plan.targetDate||"",notes:plan.notes||"",completedAt:new Date().toISOString(),items:items.map(item=>({id:item.id,title:item.title,priority:item.priority||"normal",dueDate:item.dueDate||"",complete:true,custom:item.custom}))},...(state.seasonalCycles||[])];
  const progress={...(state.seasonalProgress||{})};mode.items.forEach(([id])=>delete progress[`${mode.id}:${id}`]);state.seasonalProgress=progress;
  state.seasonalCustomTasks=(state.seasonalCustomTasks||[]).map(item=>item.mode===mode.id?{...item,complete:false,updatedAt:new Date().toISOString()}:item);
  state.seasonalPlans={...(state.seasonalPlans||{}),[mode.id]:{targetDate:"",notes:"",updatedAt:new Date().toISOString()}};saveState();renderSeasonal();renderHome();toast("Seasonal cycle archived");
}
function seasonalReportData(){
  const profile=state.vehicleProfile||{},modes=SEASONAL_CHECKLISTS.map(list=>{const plan=state.seasonalPlans?.[list.id]||{},items=seasonalModeTasks(list),supplies=list.supplies.map(([id,title])=>({id,title,ready:Boolean(state.seasonalSupplies?.[`${list.id}:${id}`])})),done=items.filter(item=>item.complete).length;return{id:list.id,title:list.title,detail:list.detail,targetDate:plan.targetDate||"",notes:plan.notes||"",complete:done,total:items.length,score:Math.round(done/items.length*100),items,supplies}});
  return{app:"Knaus Companion",version:APP_VERSION,generatedAt:new Date().toISOString(),vehicle:{make:profile.make||"Knaus",model:profile.model||"Sun Traveller",registration:profile.registration||"",vin:profile.vin||"",mileage:Number(state.currentMileage)||0},modes,completedCycles:[...(state.seasonalCycles||[])].sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt)))};
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
function ownershipCostEntries(period=ownershipCostPeriod){
  const entries=[
    ...(state.logs||[]).filter(item=>Number(item.cost)>0).map(item=>({date:item.date||item.createdAt,source:"Service",title:item.title||"Service record",amount:Number(item.cost),detail:item.provider||"Service history"})),
    ...(state.expenses||[]).filter(item=>Number(item.amount)>0).map(item=>({date:item.date||item.createdAt,source:"Touring",title:item.vendor||String(item.type||"Touring expense").replace(/^./,letter=>letter.toUpperCase()),amount:Number(item.amount),detail:String(item.type||"expense")})),
    ...(state.upgradeProjects||[]).filter(item=>Number(item.spent)>0).map(item=>({date:item.updatedAt||item.targetDate||item.createdAt,source:"Upgrades",title:item.title||"Upgrade project",amount:Number(item.spent),detail:item.status||"project"})),
    ...(state.ownershipCommitments||[]).flatMap(item=>(item.payments||[]).filter(payment=>Number(payment.amount)>0).map(payment=>({date:payment.date,source:"Fixed",title:item.title||item.type||"Ownership commitment",amount:Number(payment.amount),detail:item.provider||item.type||"recurring cost"})))
  ],now=new Date(),cutoff=period==="30d"?new Date(now.getTime()-30*86400000):period==="12m"?new Date(Date.UTC(now.getUTCFullYear()-1,now.getUTCMonth(),now.getUTCDate())):null;
  return entries.filter(item=>!cutoff||new Date(item.date)>=cutoff).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function ownershipBudgetMetrics(){
  const year=String(new Date().getFullYear()),entries=ownershipCostEntries("all").filter(item=>String(item.date||"").slice(0,4)===year),budget=state.ownershipBudget||{};
  return [["Service","service"],["Touring","touring"],["Upgrades","upgrades"],["Fixed","fixed"]].map(([source,key])=>({source,key,budget:Number(budget[key])||0,spent:entries.filter(item=>item.source===source).reduce((sum,item)=>sum+item.amount,0)}));
}
function ownershipForecastMetrics(){
  const now=new Date(),year=now.getFullYear(),start=new Date(year,0,1),end=new Date(year+1,0,1),day=86400000,elapsedDays=Math.max(1,Math.ceil((now-start)/day)),totalDays=Math.round((end-start)/day),remainingMonths=Math.max(1,(end-now)/(day*30.4375));
  return ownershipBudgetMetrics().map(item=>{const projected=item.spent/elapsedDays*totalDays,variance=item.budget-projected,monthlyAllowance=Math.max(0,item.budget-item.spent)/remainingMonths;return {...item,projected,variance,monthlyAllowance,elapsedDays,totalDays}});
}
function ownershipTrendMetrics(){
  const entries=ownershipCostEntries("all"),currentYear=new Date().getFullYear(),sources=["Service","Touring","Upgrades","Fixed"],available=[...new Set([currentYear,...entries.map(item=>Number(String(item.date||"").slice(0,4))).filter(year=>year>2000&&year<=currentYear)])].sort((a,b)=>b-a).slice(0,5);
  if(!available.includes(ownershipTrendYear))ownershipTrendYear=available[0]||currentYear;
  const yearSummary=year=>{const yearEntries=entries.filter(item=>Number(String(item.date||"").slice(0,4))===year),totals=Object.fromEntries(sources.map(source=>[source,yearEntries.filter(item=>item.source===source).reduce((sum,item)=>sum+item.amount,0)]));return {year,entries:yearEntries,totals,total:Object.values(totals).reduce((sum,value)=>sum+value,0)}};
  const years=available.map(yearSummary),selected=yearSummary(ownershipTrendYear),previous=yearSummary(ownershipTrendYear-1),months=ownershipTrendYear===currentYear?new Date().getMonth()+1:12,largest=sources.reduce((best,source)=>selected.totals[source]>selected.totals[best]?source:best,sources[0]);
  return {years,selected,previous,months,average:selected.total/months,largest:selected.total?largest:"None",delta:previous.total?(selected.total-previous.total)/previous.total*100:null};
}
function renderOwnershipCosts(){
  const entries=ownershipCostEntries(),sources=["Service","Touring","Upgrades","Fixed"],totals=Object.fromEntries(sources.map(source=>[source,entries.filter(item=>item.source===source).reduce((sum,item)=>sum+item.amount,0)])),total=entries.reduce((sum,item)=>sum+item.amount,0);
  $("#ownershipCostSummary").innerHTML=[[`€${total.toFixed(2)}`,"Recorded total"],[`€${totals.Service.toFixed(2)}`,"Service"],[`€${totals.Touring.toFixed(2)}`,"Touring"],[`€${totals.Upgrades.toFixed(2)}`,"Upgrades"],[`€${totals.Fixed.toFixed(2)}`,"Fixed costs"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  const budgetMetrics=ownershipBudgetMetrics();
  $("#ownershipBudgetProgress").innerHTML=budgetMetrics.map(item=>{const percent=item.budget?item.spent/item.budget*100:0,over=item.budget&&item.spent>item.budget;return `<article class="panel ownership-budget-card ${over?"over":""}"><div><span>${esc(item.source)} annual budget</span><strong>${item.budget?`€${item.spent.toFixed(2)} / €${item.budget.toFixed(2)}`:"Not set"}</strong></div><div class="touring-progress-bar"><span style="width:${Math.min(100,percent)}%"></span></div><small>${item.budget?over?`€${(item.spent-item.budget).toFixed(2)} over budget`:`€${(item.budget-item.spent).toFixed(2)} remaining`:`€${item.spent.toFixed(2)} recorded this year`}</small></article>`}).join("")+(state.ownershipBudget?.notes?`<p class="ownership-budget-notes"><strong>Budget notes:</strong> ${esc(state.ownershipBudget.notes)}</p>`:"");
  const forecasts=ownershipForecastMetrics(),configured=forecasts.filter(item=>item.budget>0);
  $("#ownershipForecast").innerHTML=configured.length?`<div class="ownership-forecast-head"><div><span class="eyebrow">Year-end forecast</span><h3>Current spending pace</h3></div><small>Projected from ${forecasts[0].elapsedDays} days of recorded costs</small></div>${configured.map(item=>{const trendingOver=item.projected>item.budget;return `<article class="panel ownership-forecast-card ${trendingOver?"over":""}"><div><span>${esc(item.source)}</span><strong>€${item.projected.toFixed(2)}</strong><small>projected year-end spend</small></div><dl><div><dt>Budget variance</dt><dd>${item.variance>=0?`€${item.variance.toFixed(2)} under`:`€${Math.abs(item.variance).toFixed(2)} over`}</dd></div><div><dt>Monthly allowance left</dt><dd>€${item.monthlyAllowance.toFixed(2)}</dd></div></dl></article>`}).join("")}`:"";
  const trends=ownershipTrendMetrics(),trendMax=Math.max(1,...trends.years.map(item=>item.total));
  $("#ownershipTrends").innerHTML=`<div class="ownership-trend-head"><div><span class="eyebrow">Ownership trends</span><h3>Annual cost review</h3></div><div class="chips" aria-label="Select ownership cost year">${trends.years.map(item=>`<button class="chip ${item.year===ownershipTrendYear?"active":""}" data-ownership-trend-year="${item.year}">${item.year}</button>`).join("")}</div></div><div class="ownership-trend-layout"><article class="panel ownership-year-chart"><h4>Five-year recorded spend</h4>${[...trends.years].reverse().map(item=>`<button class="${item.year===ownershipTrendYear?"active":""}" data-ownership-trend-year="${item.year}"><span>${item.year}</span><i><b style="width:${item.total/trendMax*100}%"></b></i><strong>€${item.total.toFixed(2)}</strong></button>`).join("")}</article><article class="panel ownership-year-review"><h4>${ownershipTrendYear} at a glance</h4><div class="ownership-review-stats"><div><span>Total</span><strong>€${trends.selected.total.toFixed(2)}</strong></div><div><span>Monthly average</span><strong>€${trends.average.toFixed(2)}</strong></div><div><span>Largest category</span><strong>${esc(trends.largest)}</strong></div><div><span>Year-on-year</span><strong>${trends.delta===null?"No comparison":`${trends.delta>=0?"+":""}${trends.delta.toFixed(1)}%`}</strong></div></div>${sources.map(source=>`<div class="ownership-review-source"><span>${source}</span><strong>€${trends.selected.totals[source].toFixed(2)}</strong></div>`).join("")}</article></div>`;
  renderOwnershipCommitments();
  renderOwnershipCalendar();
  $("#ownershipCostFilters").innerHTML=[["all","All time"],["12m","Last 12 months"],["30d","Last 30 days"]].map(([id,label])=>`<button class="chip ${ownershipCostPeriod===id?"active":""}" data-ownership-cost-period="${id}">${label}</button>`).join("");
  const max=Math.max(1,...Object.values(totals));
  $("#ownershipCostInsights").innerHTML=`<article class="panel ownership-source-card"><h3>Spend by source</h3>${sources.map(source=>`<div class="ownership-source-row"><span>${source}</span><div><i style="width:${totals[source]/max*100}%"></i></div><strong>€${totals[source].toFixed(2)}</strong></div>`).join("")}<p>Totals reflect recorded entries, not bank transactions. Check for duplicates across modules.</p></article><article class="panel ownership-recent-card"><h3>Recent recorded costs</h3>${entries.length?entries.slice(0,8).map(item=>`<div><span><strong>${esc(item.title)}</strong><small>${esc(item.source)} • ${esc(formatTripDate(String(item.date).slice(0,10)))}</small></span><b>€${item.amount.toFixed(2)}</b></div>`).join(""):"<p>No costs recorded for this period.</p>"}</article>`;
}
function exportOwnershipCostCsv(){
  const quote=value=>`"${String(value??"").replace(/"/g,'""')}"`,rows=ownershipCostEntries().map(item=>[String(item.date||"").slice(0,10),item.source,item.title,item.detail,item.amount.toFixed(2)]),csv=[["Date","Source","Title","Detail","Amount EUR"],...rows].map(row=>row.map(quote).join(",")).join("\r\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-ownership-costs-${ownershipCostPeriod}-${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Ownership costs exported");
}
function exportOwnershipAnnualReview(){
  const trends=ownershipTrendMetrics(),quote=value=>`"${String(value??"").replace(/"/g,'""')}"`,months=Array.from({length:12},(_,index)=>String(index+1).padStart(2,"0")),sources=["Service","Touring","Upgrades","Fixed"],rows=months.map(month=>{const matches=trends.selected.entries.filter(item=>String(item.date||"").slice(5,7)===month),totals=sources.map(source=>matches.filter(item=>item.source===source).reduce((sum,item)=>sum+item.amount,0));return [`${ownershipTrendYear}-${month}`,...totals,totals.reduce((sum,value)=>sum+value,0)]}),csv=[["Ownership annual review",ownershipTrendYear],["Recorded total",trends.selected.total.toFixed(2)],["Monthly average",trends.average.toFixed(2)],["Year-on-year change",trends.delta===null?"":`${trends.delta.toFixed(1)}%`],[],["Month",...sources,"Total"],...rows].map(row=>row.map(quote).join(",")).join("\r\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-ownership-review-${ownershipTrendYear}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(`${ownershipTrendYear} annual review exported`);
}
function ownershipCommitmentStatus(item){
  if(item.active===false)return {label:"Paused",kind:"paused",days:null};
  const days=item.nextDue?Math.ceil((new Date(`${item.nextDue}T23:59:59`)-new Date())/86400000):null;
  if(days===null)return {label:"No due date",kind:"paused",days};
  if(days<0)return {label:`${Math.abs(days)} days overdue`,kind:"overdue",days};
  if(days===0)return {label:"Due today",kind:"due",days};
  if(days<=30)return {label:`Due in ${days} days`,kind:"due",days};
  return {label:`Due ${formatTripDate(item.nextDue)}`,kind:"clear",days};
}
function renderOwnershipCommitments(){
  const commitments=[...(state.ownershipCommitments||[])].sort((a,b)=>(a.active===false)-(b.active===false)||String(a.nextDue||"").localeCompare(String(b.nextDue||""))),annualValue=commitments.filter(item=>item.active!==false).reduce((sum,item)=>sum+Number(item.amount||0)*({monthly:12,quarterly:4,annual:1}[item.frequency]||1),0);
  $("#ownershipCommitments").innerHTML=`<div class="ownership-commitment-head"><div><span class="eyebrow">Fixed commitments</span><h3>Recurring ownership costs</h3><p>Record each payment to include it in budgets, forecasts and annual trends.</p></div><div><strong>€${annualValue.toFixed(2)}</strong><small>active annualised value</small><button class="primary-btn" data-ownership-commitment-add>Add commitment</button></div></div><div class="ownership-commitment-list">${commitments.length?commitments.map(item=>{const status=ownershipCommitmentStatus(item),payments=item.payments||[],last=[...payments].sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0],paid=payments.reduce((sum,payment)=>sum+Number(payment.amount||0),0);return `<article class="panel ownership-commitment-card ${status.kind}"><div><span class="commitment-status">${esc(status.label)}</span><h4>${esc(item.title)}</h4><p>${esc(item.type)}${item.provider?` • ${esc(item.provider)}`:""} • ${esc(item.frequency)}</p></div><dl><div><dt>Payment</dt><dd>€${Number(item.amount||0).toFixed(2)}</dd></div><div><dt>Next due</dt><dd>${item.nextDue?esc(formatTripDate(item.nextDue)):"Not set"}</dd></div><div><dt>Last paid</dt><dd>${last?esc(formatTripDate(last.date)):"Not recorded"}</dd></div><div><dt>Ledger total</dt><dd>€${paid.toFixed(2)}</dd></div></dl><div class="ownership-commitment-actions"><button class="secondary-btn" data-ownership-ledger-open="${item.id}">History (${payments.length})</button><button class="secondary-btn" data-ownership-commitment-edit="${item.id}">Edit</button>${item.active===false?"":`<button class="primary-btn" data-ownership-commitment-paid="${item.id}">Record payment</button>`}<button class="danger-btn" data-ownership-commitment-delete="${item.id}">Delete</button></div></article>`}).join(""):'<article class="panel ownership-commitment-empty"><h4>No fixed commitments recorded</h4><p>Add insurance, tax, storage, finance or membership costs and track each payment offline.</p></article>'}</div>`;
}
function openOwnershipCommitmentEditor(id=null){
  editingOwnershipCommitmentId=id;const item=(state.ownershipCommitments||[]).find(entry=>entry.id===id)||{};$("#ownershipCommitmentDialogTitle").textContent=id?"Edit recurring cost":"Add recurring cost";$("#ownershipCommitmentTitle").value=item.title||"";$("#ownershipCommitmentType").value=item.type||"Insurance";$("#ownershipCommitmentProvider").value=item.provider||"";$("#ownershipCommitmentAmount").value=item.amount??"";$("#ownershipCommitmentFrequency").value=item.frequency||"annual";$("#ownershipCommitmentNextDue").value=item.nextDue||"";$("#ownershipCommitmentActive").checked=item.active!==false;$("#ownershipCommitmentNotes").value=item.notes||"";const dialog=$("#ownershipCommitmentDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeOwnershipCommitmentEditor(){const dialog=$("#ownershipCommitmentDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");editingOwnershipCommitmentId=null}
function saveOwnershipCommitment(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(state.ownershipCommitments||[]).find(item=>item.id===editingOwnershipCommitmentId),item={id:existing?.id||`commitment-${Date.now()}`,title:values.title.trim(),type:values.type,provider:values.provider.trim(),amount:Number(values.amount)||0,frequency:values.frequency,nextDue:values.nextDue,active:values.active==="on",notes:values.notes.trim(),payments:existing?.payments||[],createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};state.ownershipCommitments=existing?state.ownershipCommitments.map(entry=>entry.id===existing.id?item:entry):[item,...(state.ownershipCommitments||[])];saveState();closeOwnershipCommitmentEditor();renderOwnershipCosts();renderHome();toast(existing?"Commitment updated":"Commitment added");
}
function nextCommitmentDue(date,frequency){
  const due=new Date(`${date}T12:00:00`),today=new Date();do{if(frequency==="monthly")due.setMonth(due.getMonth()+1);else if(frequency==="quarterly")due.setMonth(due.getMonth()+3);else due.setFullYear(due.getFullYear()+1)}while(due<=today);return `${due.getFullYear()}-${String(due.getMonth()+1).padStart(2,"0")}-${String(due.getDate()).padStart(2,"0")}`;
}
function recordOwnershipCommitmentPayment(id){
  const item=(state.ownershipCommitments||[]).find(entry=>entry.id===id);if(!item||!confirm(`Record €${Number(item.amount||0).toFixed(2)} paid for “${item.title}” today?`))return;item.payments=[...(item.payments||[]),{id:`payment-${Date.now()}`,date:new Date().toISOString().slice(0,10),amount:Number(item.amount)||0}];item.nextDue=nextCommitmentDue(item.nextDue||new Date().toISOString().slice(0,10),item.frequency);item.updatedAt=new Date().toISOString();saveState();renderOwnershipCosts();renderHome();toast("Payment recorded and next due date advanced");
}
function deleteOwnershipCommitment(id){const item=(state.ownershipCommitments||[]).find(entry=>entry.id===id);if(!item||!confirm(`Delete “${item.title}” and its payment history?`))return;state.ownershipCommitments=state.ownershipCommitments.filter(entry=>entry.id!==id);saveState();renderOwnershipCosts();renderHome();toast("Commitment deleted")}
function activeOwnershipCommitment(){return (state.ownershipCommitments||[]).find(item=>item.id===activeOwnershipLedgerId)}
function resetOwnershipPaymentForm(){
  editingOwnershipPaymentId=null;const item=activeOwnershipCommitment();$("#ownershipPaymentFormTitle").textContent="Add historical payment";$("#ownershipPaymentDate").value=new Date().toISOString().slice(0,10);$("#ownershipPaymentAmount").value=item?.amount??"";$("#ownershipPaymentNotes").value="";
}
function renderOwnershipLedger(){
  const item=activeOwnershipCommitment();if(!item)return;const payments=[...(item.payments||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date))),total=payments.reduce((sum,payment)=>sum+Number(payment.amount||0),0),year=String(new Date().getFullYear()),yearTotal=payments.filter(payment=>String(payment.date||"").startsWith(year)).reduce((sum,payment)=>sum+Number(payment.amount||0),0);$("#ownershipLedgerTitle").textContent=item.title;$("#ownershipLedgerSummary").innerHTML=[[payments.length,"Payments"],[`€${total.toFixed(2)}`,"Ledger total"],[`€${yearTotal.toFixed(2)}`,`${year} paid`],[item.nextDue?formatTripDate(item.nextDue):"Not set","Next due"]].map(([value,label])=>`<article class="stat-card"><strong>${esc(value)}</strong><span>${esc(label)}</span></article>`).join("");$("#ownershipLedgerList").innerHTML=payments.length?payments.map(payment=>`<article class="ownership-payment-row"><div><strong>€${Number(payment.amount||0).toFixed(2)}</strong><span>${esc(formatTripDate(payment.date))}</span>${payment.notes?`<small>${esc(payment.notes)}</small>`:""}</div><div><button class="secondary-btn" data-ownership-payment-edit="${payment.id}">Edit</button><button class="danger-btn" data-ownership-payment-delete="${payment.id}">Delete</button></div></article>`).join(""):'<div class="ownership-ledger-empty"><strong>No payments recorded</strong><p>Add a historical payment below or use Record payment from the commitment card.</p></div>';
}
function openOwnershipLedger(id){
  activeOwnershipLedgerId=id;resetOwnershipPaymentForm();renderOwnershipLedger();const dialog=$("#ownershipLedgerDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeOwnershipLedger(){const dialog=$("#ownershipLedgerDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");activeOwnershipLedgerId=null;editingOwnershipPaymentId=null}
function editOwnershipPayment(id){
  const payment=(activeOwnershipCommitment()?.payments||[]).find(item=>item.id===id);if(!payment)return;editingOwnershipPaymentId=id;$("#ownershipPaymentFormTitle").textContent="Correct payment";$("#ownershipPaymentDate").value=payment.date||"";$("#ownershipPaymentAmount").value=payment.amount??"";$("#ownershipPaymentNotes").value=payment.notes||"";$("#ownershipPaymentForm").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function saveOwnershipPayment(event){
  event.preventDefault();const item=activeOwnershipCommitment();if(!item)return;const values=Object.fromEntries(new FormData(event.currentTarget)),existing=(item.payments||[]).find(payment=>payment.id===editingOwnershipPaymentId),payment={id:existing?.id||`payment-${Date.now()}`,date:values.date,amount:Number(values.amount)||0,notes:values.notes.trim(),createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};item.payments=existing?item.payments.map(entry=>entry.id===existing.id?payment:entry):[...(item.payments||[]),payment];item.updatedAt=new Date().toISOString();saveState();resetOwnershipPaymentForm();renderOwnershipLedger();renderOwnershipCosts();renderHome();toast(existing?"Payment corrected":"Historical payment added");
}
function deleteOwnershipPayment(id){
  const item=activeOwnershipCommitment(),payment=(item?.payments||[]).find(entry=>entry.id===id);if(!item||!payment||!confirm(`Delete the €${Number(payment.amount||0).toFixed(2)} payment from ${formatTripDate(payment.date)}?`))return;item.payments=item.payments.filter(entry=>entry.id!==id);item.updatedAt=new Date().toISOString();saveState();resetOwnershipPaymentForm();renderOwnershipLedger();renderOwnershipCosts();renderHome();toast("Payment deleted");
}
function ownershipCalendarEvents(){
  const today=new Date(`${new Date().toISOString().slice(0,10)}T00:00:00Z`),end=new Date(today);end.setUTCFullYear(end.getUTCFullYear()+1);
  return [
    ...(state.ownershipCommitments||[]).filter(item=>item.active!==false&&item.nextDue).map(item=>({id:item.id,type:"commitments",date:item.nextDue,title:item.title,detail:`€${Number(item.amount||0).toFixed(2)} ${item.frequency} payment${item.provider?` • ${item.provider}`:""}`,route:"vehicle",icon:"💶"})),
    ...(state.vehicleDocuments||[]).filter(item=>item.expiry).map(item=>({id:item.id,type:"documents",date:item.expiry,title:`${item.type||"Vehicle document"} expires`,detail:item.provider||item.reference||"Review renewal details",route:"vehicle",icon:"📄"})),
    ...(DATA.maintenanceTasks||[]).map(maintenanceTaskStatus).filter(item=>item.dueDate).map(item=>({id:item.task.id,type:"maintenance",date:item.dueDate,title:item.task.name,detail:item.dueMileage?`Also due at ${Number(item.dueMileage).toLocaleString()} km`:"Scheduled maintenance",route:"maintenance",icon:"🔧"}))
  ].filter(item=>{const date=new Date(`${item.date}T00:00:00Z`);return date<today||date<=end}).sort((a,b)=>String(a.date).localeCompare(String(b.date))||a.title.localeCompare(b.title));
}
function renderOwnershipCalendar(){
  const all=ownershipCalendarEvents(),events=all.filter(item=>ownershipCalendarFilter==="all"||item.type===ownershipCalendarFilter),today=new Date().toISOString().slice(0,10),groups=new Map();events.forEach(item=>{const key=item.date<today?"overdue":item.date.slice(0,7);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)});const labels={all:"All",commitments:"Payments",documents:"Documents",maintenance:"Maintenance"};
  $("#ownershipCalendar").innerHTML=`<div class="ownership-calendar-head"><div><span class="eyebrow">Ownership calendar</span><h3>Next 12 months</h3><p>Payments, renewals and scheduled work in one timeline.</p></div><div class="chips" aria-label="Filter ownership calendar">${Object.entries(labels).map(([id,label])=>`<button class="chip ${ownershipCalendarFilter===id?"active":""}" data-ownership-calendar-filter="${id}">${label}</button>`).join("")}</div></div><div class="ownership-calendar-groups">${groups.size?[...groups].map(([key,items])=>`<section class="ownership-calendar-group ${key==="overdue"?"overdue":""}"><h4>${key==="overdue"?"Overdue":new Date(`${key}-01T00:00:00Z`).toLocaleDateString(undefined,{month:"long",year:"numeric",timeZone:"UTC"})}</h4><div>${items.map(item=>`<button class="ownership-calendar-event" data-route="${item.route}"><span>${item.icon}</span><span><strong>${esc(item.title)}</strong><small>${esc(formatTripDate(item.date))} • ${esc(item.detail)}</small></span><b>→</b></button>`).join("")}</div></section>`).join(""):'<article class="panel ownership-calendar-empty"><strong>No events in this view</strong><p>Add commitments, document expiry dates or service baselines to build the calendar.</p></article>'}</div>`;
}
function exportOwnershipCalendar(){
  const events=ownershipCalendarEvents().filter(item=>item.date>=new Date().toISOString().slice(0,10)),escapeIcs=value=>String(value||"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;"),stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""),lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Knaus Companion//Ownership Calendar//EN","CALSCALE:GREGORIAN",...events.flatMap(item=>["BEGIN:VEVENT",`UID:${escapeIcs(`${item.type}-${item.id}-${item.date}@knaus-companion`)}`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${item.date.replace(/-/g,"")}`,`SUMMARY:${escapeIcs(item.title)}`,`DESCRIPTION:${escapeIcs(item.detail)}`,"END:VEVENT"]),"END:VCALENDAR"],blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-ownership-calendar-${new Date().toISOString().slice(0,10)}.ics`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(`${events.length} calendar events exported`);
}
function ownershipReportData(){
  const year=new Date().getFullYear(),profile=state.vehicleProfile||{},budgets=ownershipBudgetMetrics(),forecasts=ownershipForecastMetrics(),commitments=(state.ownershipCommitments||[]).map(item=>({...item,paymentCount:(item.payments||[]).length,paidTotal:(item.payments||[]).reduce((sum,payment)=>sum+Number(payment.amount||0),0)})),today=new Date().toISOString().slice(0,10),calendar=ownershipCalendarEvents().filter(item=>item.date>=today).slice(0,12);
  return {app:"Knaus Companion",version:APP_VERSION,generatedAt:new Date().toISOString(),year,vehicle:{make:profile.make||"Knaus",model:profile.model||"Sun Traveller",year:profile.year||"",registration:profile.registration||"",vin:profile.vin||"",mileage:Number(state.currentMileage)||0},costs:budgets.map(item=>{const forecast=forecasts.find(entry=>entry.source===item.source);return {...item,projected:forecast?.projected||0,variance:forecast?.variance||0}}),commitments,calendar,recordCounts:{service:(state.logs||[]).length,touringExpenses:(state.expenses||[]).length,upgrades:(state.upgradeProjects||[]).length,documents:(state.vehicleDocuments||[]).length,commitments:commitments.length,payments:commitments.reduce((sum,item)=>sum+item.paymentCount,0)}};
}
function ownershipReportHtml(actions=true){
  const report=ownershipReportData(),total=report.costs.reduce((sum,item)=>sum+item.spent,0),budget=report.costs.reduce((sum,item)=>sum+item.budget,0),projected=report.costs.reduce((sum,item)=>sum+item.projected,0);
  return `<article class="ownership-report"><div class="diagnostic-meta"><span>${esc(report.vehicle.make)} ${esc(report.vehicle.model)}</span>${report.vehicle.year?`<span>${esc(report.vehicle.year)}</span>`:""}${report.vehicle.registration?`<span>${esc(report.vehicle.registration)}</span>`:""}<span>${Number(report.vehicle.mileage).toLocaleString()} km</span><span>Generated ${esc(formatTripDate(report.generatedAt.slice(0,10)))}</span></div><section><h3>${report.year} ownership summary</h3><div class="ownership-report-summary"><div><span>Recorded spend</span><strong>€${total.toFixed(2)}</strong></div><div><span>Annual budget</span><strong>€${budget.toFixed(2)}</strong></div><div><span>Year-end forecast</span><strong>€${projected.toFixed(2)}</strong></div><div><span>Active commitments</span><strong>${report.commitments.filter(item=>item.active!==false).length}</strong></div></div></section><section><h3>Costs, budgets and forecasts</h3><table><thead><tr><th>Category</th><th>Recorded</th><th>Budget</th><th>Projected</th><th>Forecast variance</th></tr></thead><tbody>${report.costs.map(item=>`<tr><td>${esc(item.source)}</td><td>€${item.spent.toFixed(2)}</td><td>${item.budget?`€${item.budget.toFixed(2)}`:"—"}</td><td>€${item.projected.toFixed(2)}</td><td>${item.budget?`${item.variance>=0?"€"+item.variance.toFixed(2)+" under":"€"+Math.abs(item.variance).toFixed(2)+" over"}`:"—"}</td></tr>`).join("")}</tbody></table></section><section><h3>Fixed commitments</h3>${report.commitments.length?`<table><thead><tr><th>Commitment</th><th>Frequency</th><th>Payment</th><th>Next due</th><th>Ledger</th></tr></thead><tbody>${report.commitments.map(item=>`<tr><td>${esc(item.title)}${item.provider?`<br><small>${esc(item.provider)}</small>`:""}</td><td>${esc(item.frequency)}</td><td>€${Number(item.amount||0).toFixed(2)}</td><td>${item.nextDue?esc(formatTripDate(item.nextDue)):"—"}</td><td>${item.paymentCount} payments • €${item.paidTotal.toFixed(2)}</td></tr>`).join("")}</tbody></table>`:"<p>No fixed commitments recorded.</p>"}</section><section><h3>Upcoming ownership calendar</h3>${report.calendar.length?`<ul>${report.calendar.map(item=>`<li><strong>${esc(formatTripDate(item.date))} — ${esc(item.title)}</strong><br><small>${esc(item.detail)}</small></li>`).join("")}</ul>`:"<p>No upcoming calendar events.</p>"}</section><section><h3>Offline record inventory</h3><div class="ownership-report-counts">${Object.entries(report.recordCounts).map(([key,value])=>`<span><strong>${value}</strong> ${esc(key.replace(/([A-Z])/g," $1").toLowerCase())}</span>`).join("")}</div></section>${actions?'<div class="diagnostic-actions"><button class="primary-btn" data-ownership-report-print>Print report</button><button class="secondary-btn" data-ownership-report-export>Export JSON</button></div>':""}</article>`;
}
function openOwnershipReport(){showDialog("Ownership report",`${new Date().getFullYear()} vehicle summary`,ownershipReportHtml(),true)}
function exportOwnershipReport(){const report=ownershipReportData(),blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-ownership-report-${report.year}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Ownership report exported")}
function printOwnershipReport(){const report=ownershipReportData(),popup=window.open("","_blank","width=980,height=760");if(!popup){toast("Allow pop-ups to print this report");return}popup.document.write(`<!doctype html><html><head><title>Knaus ownership report ${report.year}</title><style>body{font:14px system-ui;max-width:980px;margin:28px auto;padding:0 20px;color:#172033}h1{margin-bottom:4px}.meta{color:#526071}section{margin:24px 0}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px;border:1px solid #ccd3dc;vertical-align:top}.diagnostic-meta,.ownership-report-summary,.ownership-report-counts{display:flex;gap:10px;flex-wrap:wrap}.diagnostic-meta span,.ownership-report-summary div,.ownership-report-counts span{padding:8px;background:#eef2f6;border-radius:8px}.ownership-report-summary div{display:grid;min-width:150px}li{margin:8px 0}@media print{body{margin:0}}</style></head><body><h1>${esc(report.vehicle.make)} ${esc(report.vehicle.model)}</h1><p class="meta">Knaus Companion ownership report</p>${ownershipReportHtml(false)}</body></html>`);popup.document.close();popup.focus();setTimeout(()=>popup.print(),200)}
function openOwnershipBudgetEditor(){
  const budget=state.ownershipBudget||{};$("#ownershipBudgetService").value=budget.service??"";$("#ownershipBudgetTouring").value=budget.touring??"";$("#ownershipBudgetUpgrades").value=budget.upgrades??"";$("#ownershipBudgetFixed").value=budget.fixed??"";$("#ownershipBudgetNotes").value=budget.notes||"";const dialog=$("#ownershipBudgetDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeOwnershipBudgetEditor(){const dialog=$("#ownershipBudgetDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open")}
function saveOwnershipBudget(event){event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));state.ownershipBudget={service:Number(values.service)||0,touring:Number(values.touring)||0,upgrades:Number(values.upgrades)||0,fixed:Number(values.fixed)||0,notes:values.notes.trim(),updatedAt:new Date().toISOString()};saveState();closeOwnershipBudgetEditor();renderOwnershipCosts();renderHome();toast("Annual ownership budget saved")}
function renderVehicle(){
  renderVehicleRecords();
  renderOwnershipCosts();
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
const WORKSHOP_STEPS=[
  "Park securely, apply the handbrake and prevent unintended vehicle movement",
  "Identify the exact component, circuit or pipework before disconnecting anything",
  "Disconnect 230 V hook-up and verify mains isolation where electrical work is involved",
  "Isolate the relevant 12 V supply, battery or fuse before disturbing wiring",
  "Shut off LPG at the cylinder for work near gas appliances or pipework",
  "Photograph labels, connectors and routing before removal",
  "Use the correct replacement rating, specification and approved test method",
  "Restore guards and supplies, test the complete operating sequence, then record the result"
];
function workshopMeasurementsHtml(session){
  const readings=session.measurements||[];
  return `<section class="workshop-measurements"><div class="workshop-measurements-head"><h3>Measurements</h3><button class="secondary-btn" data-workshop-measurement-add>Add reading</button></div>${readings.length?readings.map(item=>`<article><div><strong>${esc(item.label)}</strong><span>${esc(item.value)}${item.unit?` ${esc(item.unit)}`:""}</span></div><small>${esc([item.location,item.notes].filter(Boolean).join(" • ")||"No test-point notes")}</small><button class="icon-btn" data-workshop-measurement-delete="${esc(item.id)}" aria-label="Delete ${esc(item.label)}">×</button></article>`).join(""):'<p class="workshop-measurement-empty">No readings recorded for this job.</p>'}</section>`;
}
function workshopPartsHtml(session){
  const used=session.partsUsed||[],shortages=workshopPartsShortages(session);
  return `<section class="workshop-measurements workshop-parts-used"><div class="workshop-measurements-head"><h3>Parts used</h3><button class="secondary-btn" data-workshop-part-add>Add part</button></div>${shortages.length?`<div class="packing-warning"><strong>Insufficient stock.</strong><span>${esc(shortages.map(item=>`${item.name}: need ${item.requested}, have ${item.available}`).join("; "))}</span></div>`:""}${used.length?used.map(item=>{const part=DATA.partsInventory.find(entry=>entry.id===item.partId);return `<article><div><strong>${esc(part?.name||item.name||"Stock item")}</strong><span>× ${Number(item.quantity)||0}</span></div><small>${esc(item.notes||part?.notes||"No usage notes")}</small><button class="icon-btn" data-workshop-part-delete="${esc(item.id)}" aria-label="Remove ${esc(part?.name||"part")}">×</button></article>`}).join(""):'<p class="workshop-measurement-empty">No stock items reserved for this job.</p>'}</section>`;
}
function workshopPartsShortages(session){
  return (session.partsUsed||[]).map(item=>{const part=DATA.partsInventory.find(entry=>entry.id===item.partId),available=part?partStock(part).quantity:0;return {name:part?.name||item.name||"Unknown part",requested:Number(item.quantity)||0,available}}).filter(item=>item.requested>item.available);
}
function renderWorkshop(){
  const complete=WORKSHOP_STEPS.filter((_,index)=>state.workshopSteps?.[index]).length;
  $("#workshopSummary").innerHTML=[[state.activeWorkshopSession?"Active":"None","Workshop job"],[complete,`of ${WORKSHOP_STEPS.length} safety steps`],[`${Math.round(complete/WORKSHOP_STEPS.length*100)}%`,"Sequence complete"],[(state.workshopSessions||[]).length,"Completed sessions"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  $("#workshopSystemButtons").innerHTML=[["electrical","⚡","Electrical"],["fuses","▥","Fuses"],["water","💧","Water"],["gas","🔥","Gas"],["diagnostics","🧰","Diagnostics"],["vehicle","📦","Parts & vehicle"]].map(([route,icon,label])=>`<button class="workshop-button" data-route="${route}"><span>${icon}</span><strong>${label}</strong></button>`).join("");
  $("#workshopSteps").innerHTML=WORKSHOP_STEPS.map((step,index)=>{const checked=Boolean(state.workshopSteps?.[index]);return `<button class="workshop-step ${checked?"complete":""}" data-workshop-step="${index}" role="checkbox" aria-checked="${checked}"><span>${checked?"✓":index+1}</span><strong>${esc(step)}</strong></button>`}).join("");
  const session=state.activeWorkshopSession,history=(state.workshopSessions||[]).slice(0,3);
  $("#workshopSession").innerHTML=session?`<span class="meta">Active workshop job</span><h2>${esc(session.title)}</h2><div class="diagnostic-meta"><span>${vehicleSystemIcon(session.system)} ${esc(session.system)}</span><span>Started ${esc(new Date(session.startedAt).toLocaleString())}</span>${session.mileage!==null?`<span>${Number(session.mileage).toLocaleString()} km</span>`:""}</div>${session.notes?`<p class="workshop-session-notes">${esc(session.notes)}</p>`:""}${workshopMeasurementsHtml(session)}${workshopPartsHtml(session)}<div class="workshop-session-actions"><button class="secondary-btn" data-workshop-session-edit>Edit notes</button><button class="primary-btn" data-workshop-session-finish>Finish & log service</button><button class="danger-btn" data-workshop-session-discard>Discard</button></div>`:`<span class="meta">Workshop sessions</span><h2>Document the job</h2><p>Start a session before work, keep findings with it and finish into service history.</p><button class="primary-btn workshop-session-start" data-workshop-session-start>Start workshop job</button>${history.length?`<div class="workshop-session-history"><h3>Recent sessions</h3>${history.map(item=>`<button data-workshop-report="${esc(item.id)}"><strong>${esc(item.title)}</strong><small>${esc(formatTripDate(item.completedAt.slice(0,10)))} • ${Number(item.durationMinutes)||0} min • ${(item.measurements||[]).length} readings • ${(item.partsUsed||[]).reduce((sum,part)=>sum+(Number(part.quantity)||0),0)} parts</small><span aria-hidden="true">→</span></button>`).join("")}</div>`:""}`;
  renderWorkshopHistory();
}
function workshopHistorySearchText(session){
  const partNames=(session.partsUsed||[]).map(item=>DATA.partsInventory.find(part=>part.id===item.partId)?.name||item.name||"");
  return [session.title,session.system,session.outcome,session.summary,session.notes,...(session.measurements||[]).flatMap(item=>[item.label,item.value,item.unit,item.location,item.notes]),...partNames].join(" ").toLowerCase();
}
function renderWorkshopHistory(){
  const sessions=state.workshopSessions||[],minutes=sessions.reduce((sum,item)=>sum+(Number(item.durationMinutes)||0),0),cost=sessions.reduce((sum,item)=>sum+(Number(item.cost)||0),0);
  $("#workshopHistorySummary").innerHTML=[[sessions.length,"Completed jobs"],[`${Math.floor(minutes/60)}h ${minutes%60}m`,"Workshop time"],[`€${cost.toFixed(2)}`,"Recorded cost"],[sessions.filter(item=>item.outcome==="follow-up").length,"Need follow-up"]].map(([v,l])=>`<article class="stat-card"><strong>${esc(v)}</strong><span>${esc(l)}</span></article>`).join("");
  const filters=[["all","All"],["resolved","Resolved"],["monitoring","Monitoring"],["follow-up","Follow-up"]];
  $("#workshopHistoryFilters").innerHTML=filters.map(([id,label])=>`<button class="chip ${workshopHistoryFilter===id?"active":""}" data-workshop-history-filter="${id}">${label}</button>`).join("");
  const query=($("#workshopHistorySearch")?.value||"").trim().toLowerCase(),visible=sessions.filter(item=>(workshopHistoryFilter==="all"||item.outcome===workshopHistoryFilter)&&(!query||workshopHistorySearchText(item).includes(query)));
  $("#workshopHistoryList").innerHTML=visible.length?visible.map(item=>`<button class="panel workshop-history-card outcome-${esc(item.outcome||"recorded")}" data-workshop-report="${esc(item.id)}"><div><span class="maintenance-status">${esc(item.outcome||"recorded")}</span><h3>${esc(item.title)}</h3><p>${vehicleSystemIcon(item.system)} ${esc(item.system||"vehicle")} • ${esc(formatTripDate(item.completedAt.slice(0,10)))}</p></div><div class="workshop-history-metrics"><span><strong>${Number(item.durationMinutes)||0}</strong> min</span><span><strong>${(item.measurements||[]).length}</strong> readings</span><span><strong>${(item.partsUsed||[]).reduce((sum,part)=>sum+(Number(part.quantity)||0),0)}</strong> parts</span>${item.cost!==null&&item.cost!==undefined?`<span><strong>€${Number(item.cost).toFixed(2)}</strong> cost</span>`:""}</div><b aria-hidden="true">→</b></button>`).join(""):'<article class="panel trip-empty"><h3>No workshop sessions match</h3><p>Change the outcome filter or search text.</p></article>';
}
function openWorkshopSessionEditor(){
  const session=state.activeWorkshopSession||{};
  $("#workshopSessionDialogTitle").textContent=state.activeWorkshopSession?"Update workshop job":"Start a workshop job";$("#workshopSessionTitle").value=session.title||"";$("#workshopSessionSystem").value=session.system||"vehicle";$("#workshopSessionMileage").value=session.mileage??state.currentMileage??"";$("#workshopSessionNotes").value=session.notes||"";
  const dialog=$("#workshopSessionDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");setTimeout(()=>$("#workshopSessionTitle").focus(),0);
}
function closeWorkshopSessionEditor(){const dialog=$("#workshopSessionDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open")}
function saveWorkshopSession(event){
  event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget)),existing=state.activeWorkshopSession;
  state.activeWorkshopSession={id:existing?.id||`workshop-${Date.now()}`,title:values.title.trim(),system:values.system,mileage:values.mileage===""?null:Number(values.mileage),notes:values.notes.trim(),measurements:existing?.measurements||[],partsUsed:existing?.partsUsed||[],startedAt:existing?.startedAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
  saveState();closeWorkshopSessionEditor();renderWorkshop();renderHome();toast(existing?"Workshop job updated":"Workshop job started");
}
function finishWorkshopSession(){
  const session=state.activeWorkshopSession;if(!session)return;
  const shortages=workshopPartsShortages(session);if(shortages.length){toast("Restock or reduce reserved parts before finishing");return}
  $("#workshopOutcomeForm").reset();$("#workshopOutcomeSummary").value=session.notes||"";const dialog=$("#workshopOutcomeDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");setTimeout(()=>$("#workshopOutcomeSummary").focus(),0);
}
function closeWorkshopOutcome(){const dialog=$("#workshopOutcomeDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open")}
function completeWorkshopSession(event){
  event.preventDefault();const session=state.activeWorkshopSession;if(!session)return;const values=Object.fromEntries(new FormData(event.currentTarget));
  const completedAt=new Date().toISOString(),durationMinutes=Math.max(1,Math.round((new Date(completedAt)-new Date(session.startedAt))/60000)),stepsComplete=WORKSHOP_STEPS.filter((_,index)=>state.workshopSteps?.[index]).length;
  const outcome=values.outcome,summary=values.summary.trim(),cost=values.cost===""?null:Number(values.cost);
  const completed={...session,completedAt,durationMinutes,stepsComplete,outcome,summary,cost};
  state.workshopSessions=[completed,...(state.workshopSessions||[])].slice(0,100);
  const measurementNotes=(session.measurements||[]).length?`Measurements:\n${session.measurements.map(item=>`• ${item.label}: ${item.value}${item.unit?` ${item.unit}`:""}${item.location?` at ${item.location}`:""}${item.notes?` — ${item.notes}`:""}`).join("\n")}`:"";
  const partNotes=(session.partsUsed||[]).length?`Parts used:\n${session.partsUsed.map(item=>{const part=DATA.partsInventory.find(entry=>entry.id===item.partId);return `• ${part?.name||item.name}: ${item.quantity}${item.notes?` — ${item.notes}`:""}`}).join("\n")}`:"";
  (session.partsUsed||[]).forEach(item=>{const part=DATA.partsInventory.find(entry=>entry.id===item.partId);if(!part)return;const stock=partStock(part);stock.quantity-=Number(item.quantity)||0;stock.updatedAt=completedAt;state.partsStock={...(state.partsStock||{}),[part.id]:stock}});
  state.logs=[{id:`service-${Date.now()}`,taskId:"",title:session.title,date:completedAt.slice(0,10),mileage:session.mileage,provider:"Owner — Workshop Mode",cost,notes:[`${session.system} workshop session • ${durationMinutes} min • ${stepsComplete}/${WORKSHOP_STEPS.length} safety steps • Outcome: ${outcome}`,session.notes,`Final findings:\n${summary}`,measurementNotes,partNotes].filter(Boolean).join("\n\n"),createdAt:completedAt,workshopSessionId:session.id},...(state.logs||[])];
  if(values.createFault==="yes")state.faults=[{id:`fault-${Date.now()}`,title:session.title,system:session.system,severity:"medium",status:"open",date:completedAt.slice(0,10),mileage:session.mileage,location:"",symptoms:summary,resolution:"Follow up from Workshop Mode session",createdAt:completedAt,updatedAt:completedAt,workshopSessionId:session.id},...(state.faults||[])];
  if(session.mileage!==null&&session.mileage>(Number(state.currentMileage)||0))state.currentMileage=session.mileage;
  state.activeWorkshopSession=null;state.workshopSteps={};saveState();closeWorkshopOutcome();renderWorkshop();renderMaintenance();renderPartsStock();renderDiagnostics();renderHome();toast(values.createFault==="yes"?"Session completed and follow-up fault created":"Workshop session added to service history");
}
function discardWorkshopSession(){const session=state.activeWorkshopSession;if(!session||!confirm(`Discard “${session.title}” without creating a service record?`))return;state.activeWorkshopSession=null;saveState();renderWorkshop();renderHome();toast("Workshop session discarded")}
function openWorkshopMeasurementEditor(){
  if(!state.activeWorkshopSession)return;$("#workshopMeasurementForm").reset();const dialog=$("#workshopMeasurementDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");setTimeout(()=>$("#workshopMeasurementLabel").focus(),0);
}
function closeWorkshopMeasurementEditor(){const dialog=$("#workshopMeasurementDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open")}
function saveWorkshopMeasurement(event){
  event.preventDefault();const session=state.activeWorkshopSession;if(!session)return;const values=Object.fromEntries(new FormData(event.currentTarget));
  const reading={id:`reading-${Date.now()}`,label:values.label.trim(),value:values.value.trim(),unit:values.unit.trim(),location:values.location.trim(),notes:values.notes.trim(),createdAt:new Date().toISOString()};
  session.measurements=[reading,...(session.measurements||[])];session.updatedAt=new Date().toISOString();saveState();closeWorkshopMeasurementEditor();renderWorkshop();toast("Workshop reading saved");
}
function deleteWorkshopMeasurement(id){const session=state.activeWorkshopSession,item=session?.measurements?.find(reading=>reading.id===id);if(!item||!confirm(`Delete reading “${item.label}”?`))return;session.measurements=session.measurements.filter(reading=>reading.id!==id);session.updatedAt=new Date().toISOString();saveState();renderWorkshop();toast("Workshop reading deleted")}
function openWorkshopPartEditor(){
  if(!state.activeWorkshopSession)return;
  $("#workshopPartId").innerHTML=DATA.partsInventory.map(part=>{const stock=partStock(part);return `<option value="${esc(part.id)}">${esc(part.name)} — ${stock.quantity} onboard</option>`}).join("");$("#workshopPartQuantity").value=1;$("#workshopPartNotes").value="";
  const dialog=$("#workshopPartDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function closeWorkshopPartEditor(){const dialog=$("#workshopPartDialog");if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open")}
function saveWorkshopPart(event){
  event.preventDefault();const session=state.activeWorkshopSession;if(!session)return;const values=Object.fromEntries(new FormData(event.currentTarget)),quantity=Math.max(1,Number(values.quantity)||1),existing=(session.partsUsed||[]).find(item=>item.partId===values.partId);
  if(existing){existing.quantity+=quantity;existing.notes=[existing.notes,values.notes.trim()].filter(Boolean).join("; ")}else{session.partsUsed=[{id:`used-${Date.now()}`,partId:values.partId,quantity,notes:values.notes.trim(),createdAt:new Date().toISOString()},...(session.partsUsed||[])]}
  session.updatedAt=new Date().toISOString();saveState();closeWorkshopPartEditor();renderWorkshop();toast("Part reserved for this job");
}
function deleteWorkshopPart(id){const session=state.activeWorkshopSession,item=session?.partsUsed?.find(entry=>entry.id===id);if(!item)return;session.partsUsed=session.partsUsed.filter(entry=>entry.id!==id);session.updatedAt=new Date().toISOString();saveState();renderWorkshop();toast("Part removed from job")}
function workshopReportHtml(session,actions=true){
  const measurements=(session.measurements||[]),parts=(session.partsUsed||[]);
  return `<article class="workshop-report"><div class="diagnostic-meta"><span>${vehicleSystemIcon(session.system)} ${esc(session.system)}</span><span>${esc(formatTripDate(session.completedAt.slice(0,10)))}</span><span>${Number(session.durationMinutes)||0} minutes</span>${session.mileage!==null?`<span>${Number(session.mileage).toLocaleString()} km</span>`:""}<span>${Number(session.stepsComplete)||0}/${WORKSHOP_STEPS.length} safety steps</span>${session.outcome?`<span>Outcome: ${esc(session.outcome)}</span>`:""}${session.cost!==null&&session.cost!==undefined?`<span>€${Number(session.cost).toFixed(2)}</span>`:""}</div>${session.summary?`<section class="workshop-outcome"><h3>Final findings</h3><p>${esc(session.summary)}</p></section>`:""}${session.notes?`<section><h3>Working notes</h3><p>${esc(session.notes)}</p></section>`:""}<section><h3>Measurements</h3>${measurements.length?`<table><thead><tr><th>Reading</th><th>Value</th><th>Test point</th><th>Notes</th></tr></thead><tbody>${measurements.map(item=>`<tr><td>${esc(item.label)}</td><td>${esc(item.value)}${item.unit?` ${esc(item.unit)}`:""}</td><td>${esc(item.location||"—")}</td><td>${esc(item.notes||"—")}</td></tr>`).join("")}</tbody></table>`:"<p>No measurements recorded.</p>"}</section><section><h3>Parts used</h3>${parts.length?`<ul>${parts.map(item=>{const part=DATA.partsInventory.find(entry=>entry.id===item.partId);return `<li><strong>${esc(part?.name||item.name||"Stock item")} × ${Number(item.quantity)||0}</strong>${item.notes?` — ${esc(item.notes)}`:""}</li>`}).join("")}</ul>`:"<p>No parts recorded.</p>"}</section>${actions?'<div class="diagnostic-actions"><button class="primary-btn" data-workshop-report-print>Print report</button><button class="secondary-btn" data-workshop-report-export>Export JSON</button></div>':""}</article>`;
}
function openWorkshopReport(id){const session=(state.workshopSessions||[]).find(item=>item.id===id);if(!session)return;activeWorkshopReportId=id;showDialog("Workshop report",session.title,workshopReportHtml(session),true)}
function exportWorkshopReport(){const session=(state.workshopSessions||[]).find(item=>item.id===activeWorkshopReportId);if(!session)return;const blob=new Blob([JSON.stringify({app:"Knaus Companion",version:APP_VERSION,exportedAt:new Date().toISOString(),workshopSession:session},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`knaus-workshop-${session.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast("Workshop report exported")}
function printWorkshopReport(){const session=(state.workshopSessions||[]).find(item=>item.id===activeWorkshopReportId);if(!session)return;const popup=window.open("","_blank","width=900,height=700");if(!popup){toast("Allow pop-ups to print this report");return}popup.document.write(`<!doctype html><html><head><title>${esc(session.title)}</title><style>body{font:15px system-ui;max-width:900px;margin:30px auto;padding:0 20px;color:#172033}h1{margin-bottom:4px}.meta{color:#526071}section{margin:24px 0}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px;border:1px solid #ccd3dc;vertical-align:top}</style></head><body><h1>${esc(session.title)}</h1><p class="meta">Knaus Companion workshop report</p>${workshopReportHtml(session,false)}</body></html>`);popup.document.close();popup.focus();setTimeout(()=>popup.print(),200)}
async function requestWorkshopWakeLock(){
  if(!("wakeLock" in navigator)){$("#workshopWakeLock").checked=false;$("#workshopWakeStatus").textContent="Screen wake lock is not supported by this browser.";toast("Wake lock is not supported here");return}
  try{workshopWakeLock=await navigator.wakeLock.request("screen");document.body.classList.add("workshop-mode-active");$("#workshopWakeStatus").textContent="Screen wake lock is active while Workshop Mode remains open.";workshopWakeLock.addEventListener("release",()=>{workshopWakeLock=null;document.body.classList.remove("workshop-mode-active")},{once:true})}catch{$("#workshopWakeLock").checked=false;$("#workshopWakeStatus").textContent="Screen wake lock could not be activated.";toast("Could not keep the screen awake")}
}
async function releaseWorkshopWakeLock(){
  if(workshopWakeLock)await workshopWakeLock.release();workshopWakeLock=null;document.body.classList.remove("workshop-mode-active");
  if($("#workshopWakeLock"))$("#workshopWakeLock").checked=false;
  if($("#workshopWakeStatus"))$("#workshopWakeStatus").textContent="Screen wake lock is off.";
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
  applyTheme();renderNav();renderHome();renderAssistant();renderLibrary();renderMaintenance();renderCompliance();renderEmergency();renderSeasonal();renderDiagnostics();renderTouring();renderVehicle();renderElectrical();renderFuses();renderWater();renderGas();renderWorkshop();renderSettings();
  $("#diagnosticSearch")?.addEventListener("input",renderDiagnostics);
  $("#fuseSearch")?.addEventListener("input",renderFuses);
  setActiveRoute(NAV.some(x=>x[0]===route())?route():"home");
}
document.addEventListener("click",e=>{
  const routeButton=e.target.closest("[data-route]");if(routeButton){e.preventDefault();if(routeButton.dataset.seasonalAlertMode)activeSeasonalMode=routeButton.dataset.seasonalAlertMode;navigate(routeButton.dataset.route)}
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
  const workshopStep=e.target.closest("[data-workshop-step]");if(workshopStep){const index=Number(workshopStep.dataset.workshopStep);state.workshopSteps={...(state.workshopSteps||{}),[index]:!state.workshopSteps?.[index]};saveState();renderWorkshop()}
  if(e.target.closest("[data-workshop-session-start],[data-workshop-session-edit]"))openWorkshopSessionEditor();
  if(e.target.closest("[data-workshop-session-cancel]"))closeWorkshopSessionEditor();
  if(e.target.closest("[data-workshop-session-finish]"))finishWorkshopSession();
  if(e.target.closest("[data-workshop-session-discard]"))discardWorkshopSession();
  if(e.target.closest("[data-workshop-outcome-cancel]"))closeWorkshopOutcome();
  if(e.target.closest("[data-workshop-measurement-add]"))openWorkshopMeasurementEditor();
  if(e.target.closest("[data-workshop-measurement-cancel]"))closeWorkshopMeasurementEditor();
  const workshopMeasurementDelete=e.target.closest("[data-workshop-measurement-delete]");if(workshopMeasurementDelete)deleteWorkshopMeasurement(workshopMeasurementDelete.dataset.workshopMeasurementDelete);
  if(e.target.closest("[data-workshop-part-add]"))openWorkshopPartEditor();
  if(e.target.closest("[data-workshop-part-cancel]"))closeWorkshopPartEditor();
  const workshopPartDelete=e.target.closest("[data-workshop-part-delete]");if(workshopPartDelete)deleteWorkshopPart(workshopPartDelete.dataset.workshopPartDelete);
  const workshopReport=e.target.closest("[data-workshop-report]");if(workshopReport)openWorkshopReport(workshopReport.dataset.workshopReport);
  if(e.target.closest("[data-workshop-report-export]"))exportWorkshopReport();
  if(e.target.closest("[data-workshop-report-print]"))printWorkshopReport();
  if(e.target.closest("[data-ownership-report-export]"))exportOwnershipReport();
  if(e.target.closest("[data-ownership-report-print]"))printOwnershipReport();
  if(e.target.closest("[data-compliance-report-export]"))exportComplianceReport();
  if(e.target.closest("[data-compliance-report-print]"))printComplianceReport();
  const workshopHistoryFilterButton=e.target.closest("[data-workshop-history-filter]");if(workshopHistoryFilterButton){workshopHistoryFilter=workshopHistoryFilterButton.dataset.workshopHistoryFilter;renderWorkshopHistory()}
  const vehicleViewButton=e.target.closest("[data-vehicle-view]");if(vehicleViewButton){vehicleMapView=vehicleViewButton.dataset.vehicleView;const first=DATA.vehicleExplorer.find(x=>x.view===vehicleMapView);if(first)activeVehicleHotspot=first.id;renderVehicleMap()}
  const vehicleHotspot=e.target.closest("[data-vehicle-hotspot]");if(vehicleHotspot){activeVehicleHotspot=vehicleHotspot.dataset.vehicleHotspot;renderVehicleMap()}
  const ownershipPeriodButton=e.target.closest("[data-ownership-cost-period]");if(ownershipPeriodButton){ownershipCostPeriod=ownershipPeriodButton.dataset.ownershipCostPeriod;renderOwnershipCosts()}
  const ownershipTrendButton=e.target.closest("[data-ownership-trend-year]");if(ownershipTrendButton){ownershipTrendYear=Number(ownershipTrendButton.dataset.ownershipTrendYear);renderOwnershipCosts()}
  const calendarFilterButton=e.target.closest("[data-ownership-calendar-filter]");if(calendarFilterButton){ownershipCalendarFilter=calendarFilterButton.dataset.ownershipCalendarFilter;renderOwnershipCalendar()}
  const complianceFilterButton=e.target.closest("[data-compliance-filter]");if(complianceFilterButton){complianceFilter=complianceFilterButton.dataset.complianceFilter;renderCompliance()}
  const seasonalModeButton=e.target.closest("[data-seasonal-mode]");if(seasonalModeButton){activeSeasonalMode=seasonalModeButton.dataset.seasonalMode;resetSeasonalCustomTaskForm();renderSeasonal()}
  const seasonalCheck=e.target.closest("[data-seasonal-check]");if(seasonalCheck)toggleSeasonalCheck(seasonalCheck.dataset.seasonalCheck);
  const seasonalSupply=e.target.closest("[data-seasonal-supply]");if(seasonalSupply)toggleSeasonalSupply(seasonalSupply.dataset.seasonalSupply);
  const seasonalCustomFilter=e.target.closest("[data-seasonal-custom-filter]");if(seasonalCustomFilter){seasonalCustomTaskFilter=seasonalCustomFilter.dataset.seasonalCustomFilter;renderSeasonalCustomTasks()}
  const seasonalCustomToggle=e.target.closest("[data-seasonal-custom-toggle]");if(seasonalCustomToggle)toggleSeasonalCustomTask(seasonalCustomToggle.dataset.seasonalCustomToggle);
  const seasonalCustomEdit=e.target.closest("[data-seasonal-custom-edit]");if(seasonalCustomEdit)editSeasonalCustomTask(seasonalCustomEdit.dataset.seasonalCustomEdit);
  const seasonalCustomDelete=e.target.closest("[data-seasonal-custom-delete]");if(seasonalCustomDelete)deleteSeasonalCustomTask(seasonalCustomDelete.dataset.seasonalCustomDelete);
  if(e.target.closest("[data-compliance-requirement-cancel]"))closeComplianceRequirementEditor();
  const requirementEdit=e.target.closest("[data-compliance-requirement-edit]");if(requirementEdit)openComplianceRequirementEditor(requirementEdit.dataset.complianceRequirementEdit);
  const requirementDelete=e.target.closest("[data-compliance-requirement-delete]");if(requirementDelete)deleteComplianceRequirement(requirementDelete.dataset.complianceRequirementDelete);
  const evidenceOpen=e.target.closest("[data-compliance-evidence-open]");if(evidenceOpen)openComplianceEvidence(evidenceOpen.dataset.complianceEvidenceOpen);
  if(e.target.closest("[data-compliance-evidence-cancel]"))closeComplianceEvidence();
  const evidenceDelete=e.target.closest("[data-compliance-evidence-delete]");if(evidenceDelete)deleteComplianceEvidence(evidenceDelete.dataset.complianceEvidenceDelete);
  if(e.target.closest("[data-emergency-contact-cancel]"))closeEmergencyContactEditor();
  const emergencyEdit=e.target.closest("[data-emergency-contact-edit]");if(emergencyEdit)openEmergencyContactEditor(emergencyEdit.dataset.emergencyContactEdit);
  const emergencyDelete=e.target.closest("[data-emergency-contact-delete]");if(emergencyDelete)deleteEmergencyContact(emergencyDelete.dataset.emergencyContactDelete);
  const readinessToggle=e.target.closest("[data-emergency-readiness]");if(readinessToggle)toggleEmergencyReadiness(readinessToggle.dataset.emergencyReadiness);
  if(e.target.closest("[data-emergency-drill-cancel]"))closeEmergencyDrillEditor();
  const drillEdit=e.target.closest("[data-emergency-drill-edit]");if(drillEdit)openEmergencyDrillEditor(drillEdit.dataset.emergencyDrillEdit);
  const drillDelete=e.target.closest("[data-emergency-drill-delete]");if(drillDelete)deleteEmergencyDrill(drillDelete.dataset.emergencyDrillDelete);
  if(e.target.closest("[data-emergency-equipment-cancel]"))closeEmergencyEquipmentEditor();
  const equipmentEdit=e.target.closest("[data-emergency-equipment-edit]");if(equipmentEdit)openEmergencyEquipmentEditor(equipmentEdit.dataset.emergencyEquipmentEdit);
  const equipmentDelete=e.target.closest("[data-emergency-equipment-delete]");if(equipmentDelete)deleteEmergencyEquipment(equipmentDelete.dataset.emergencyEquipmentDelete);
  if(e.target.closest("[data-emergency-incident-cancel]"))closeEmergencyIncidentEditor();
  const incidentEdit=e.target.closest("[data-emergency-incident-edit]");if(incidentEdit)openEmergencyIncidentEditor(incidentEdit.dataset.emergencyIncidentEdit);
  const incidentDelete=e.target.closest("[data-emergency-incident-delete]");if(incidentDelete)deleteEmergencyIncident(incidentDelete.dataset.emergencyIncidentDelete);
  if(e.target.closest("[data-emergency-incident-update-cancel]"))closeEmergencyIncidentUpdate();
  const incidentUpdate=e.target.closest("[data-emergency-incident-update]");if(incidentUpdate){closeDetail();openEmergencyIncidentUpdate(incidentUpdate.dataset.emergencyIncidentUpdate)}
  const incidentUpdateDelete=e.target.closest("[data-emergency-incident-update-delete]");if(incidentUpdateDelete)deleteEmergencyIncidentUpdate(incidentUpdateDelete.dataset.incidentId,incidentUpdateDelete.dataset.emergencyIncidentUpdateDelete);
  const incidentReport=e.target.closest("[data-emergency-incident-report]");if(incidentReport)openEmergencyIncidentReport(incidentReport.dataset.emergencyIncidentReport);
  if(e.target.closest("[data-emergency-incident-report-export]"))exportEmergencyIncidentReport();
  if(e.target.closest("[data-emergency-incident-report-print]"))printEmergencyIncidentReport();
  if(e.target.closest("[data-emergency-handoff-export]"))exportEmergencyHandoff();
  if(e.target.closest("[data-emergency-handoff-print]"))printEmergencyHandoff();
  if(e.target.closest("[data-seasonal-report-export]"))exportSeasonalReport();
  if(e.target.closest("[data-seasonal-report-print]"))printSeasonalReport();
  if(e.target.closest("[data-ownership-budget-cancel]"))closeOwnershipBudgetEditor();
  if(e.target.closest("[data-ownership-commitment-add]"))openOwnershipCommitmentEditor();
  if(e.target.closest("[data-ownership-commitment-cancel]"))closeOwnershipCommitmentEditor();
  if(e.target.closest("[data-ownership-ledger-cancel]"))closeOwnershipLedger();
  const ledgerOpen=e.target.closest("[data-ownership-ledger-open]");if(ledgerOpen)openOwnershipLedger(ledgerOpen.dataset.ownershipLedgerOpen);
  const commitmentEdit=e.target.closest("[data-ownership-commitment-edit]");if(commitmentEdit)openOwnershipCommitmentEditor(commitmentEdit.dataset.ownershipCommitmentEdit);
  const commitmentPaid=e.target.closest("[data-ownership-commitment-paid]");if(commitmentPaid)recordOwnershipCommitmentPayment(commitmentPaid.dataset.ownershipCommitmentPaid);
  const commitmentDelete=e.target.closest("[data-ownership-commitment-delete]");if(commitmentDelete)deleteOwnershipCommitment(commitmentDelete.dataset.ownershipCommitmentDelete);
  const paymentEdit=e.target.closest("[data-ownership-payment-edit]");if(paymentEdit)editOwnershipPayment(paymentEdit.dataset.ownershipPaymentEdit);
  const paymentDelete=e.target.closest("[data-ownership-payment-delete]");if(paymentDelete)deleteOwnershipPayment(paymentDelete.dataset.ownershipPaymentDelete);
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
$("#workshopWakeLock").addEventListener("change",e=>e.target.checked?requestWorkshopWakeLock():releaseWorkshopWakeLock());
$("#resetWorkshopSteps").onclick=()=>{state.workshopSteps={};saveState();renderWorkshop();toast("Workshop sequence reset")};
$("#workshopSessionForm").addEventListener("submit",saveWorkshopSession);
$("#workshopMeasurementForm").addEventListener("submit",saveWorkshopMeasurement);
$("#workshopPartForm").addEventListener("submit",saveWorkshopPart);
$("#workshopOutcomeForm").addEventListener("submit",completeWorkshopSession);
$("#workshopOutcomeStatus").addEventListener("change",e=>{$("#workshopOutcomeFault").checked=e.target.value==="follow-up"});
$("#workshopHistorySearch").addEventListener("input",renderWorkshopHistory);
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
$("#exportOwnershipCosts").onclick=exportOwnershipCostCsv;
$("#exportOwnershipAnnualReview").onclick=exportOwnershipAnnualReview;
$("#exportOwnershipCalendar").onclick=exportOwnershipCalendar;
$("#openOwnershipReport").onclick=openOwnershipReport;
$("#exportComplianceSnapshot").onclick=exportComplianceSnapshot;
$("#openComplianceReport").onclick=openComplianceReport;
$("#exportComplianceCalendar").onclick=exportComplianceCalendar;
$("#addEmergencyContact").onclick=()=>openEmergencyContactEditor();
$("#emergencyContactForm").addEventListener("submit",saveEmergencyContact);
$("#addEmergencyIncident").onclick=()=>openEmergencyIncidentEditor();
$("#emergencyIncidentForm").addEventListener("submit",saveEmergencyIncident);
$("#emergencyIncidentUpdateForm").addEventListener("submit",saveEmergencyIncidentUpdate);
$("#addEmergencyDrill").onclick=()=>openEmergencyDrillEditor();
$("#emergencyDrillForm").addEventListener("submit",saveEmergencyDrill);
$("#addEmergencyEquipment").onclick=()=>openEmergencyEquipmentEditor();
$("#emergencyEquipmentForm").addEventListener("submit",saveEmergencyEquipment);
$("#exportEmergencyCalendar").onclick=exportEmergencyCalendar;
$("#seasonalPlanForm").addEventListener("submit",saveSeasonalPlan);
$("#exportSeasonalCalendar").onclick=exportSeasonalCalendar;
$("#archiveSeasonalCycle").onclick=archiveSeasonalCycle;
$("#openSeasonalReport").onclick=openSeasonalReport;
$("#exportSeasonalReport").onclick=exportSeasonalReport;
$("#seasonalCustomTaskForm").addEventListener("submit",saveSeasonalCustomTask);
$("#cancelSeasonalCustomTaskEdit").onclick=resetSeasonalCustomTaskForm;
$("#openEmergencyHandoff").onclick=openEmergencyHandoff;
$("#exportEmergencyHandoff").onclick=exportEmergencyHandoff;
$("#saveEmergencyNotes").onclick=saveEmergencyNotes;
$("#addComplianceRequirement").onclick=()=>openComplianceRequirementEditor();
$("#complianceRequirementForm").addEventListener("submit",saveComplianceRequirement);
$("#complianceEvidenceForm").addEventListener("submit",saveComplianceEvidence);
$("#editOwnershipBudget").onclick=openOwnershipBudgetEditor;
$("#ownershipBudgetForm").addEventListener("submit",saveOwnershipBudget);
$("#ownershipCommitmentForm").addEventListener("submit",saveOwnershipCommitment);
$("#ownershipPaymentForm").addEventListener("submit",saveOwnershipPayment);
$("#ownershipPaymentReset").onclick=resetOwnershipPaymentForm;
$("#inventorySearch").addEventListener("input",renderVehicleRecords);
$("#photoSearch").addEventListener("input",renderVehiclePhotos);
$("#partsSearch").addEventListener("input",renderPartsStock);
$("#addFault").onclick=()=>openFaultEditor();
$("#faultForm").addEventListener("submit",saveFault);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeDrawer();closeDetail();closeTripEditor();closeExpenseEditor();closeCampsiteEditor();closePackingListEditor();closePackingItemEditor();closePayloadEditor();closeWorkshopSessionEditor();closeWorkshopMeasurementEditor();closeWorkshopPartEditor();closeWorkshopOutcome();closeOwnershipBudgetEditor();closeOwnershipCommitmentEditor();closeOwnershipLedger();closeComplianceRequirementEditor();closeComplianceEvidence();closeEmergencyContactEditor();closeEmergencyIncidentEditor();closeEmergencyIncidentUpdate();closeEmergencyDrillEditor();closeEmergencyEquipmentEditor();closeServiceRecord();closeVehicleProfileEditor();closeConfigurationEditor();closeVehicleDocumentEditor();closeInventoryEditor();closeFaultEditor();closeUpgradeEditor();closeVehiclePhoto();closePartEditor()}});
$("#closeDetail").onclick=closeDetail;
$("#detailDialog").addEventListener("click",e=>{if(e.target===$("#detailDialog"))closeDetail()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&$("#workshopWakeLock")?.checked&&!workshopWakeLock)requestWorkshopWakeLock()});

init().catch(err=>{
  console.error(err);
  document.body.innerHTML=`<main style="padding:30px;font-family:system-ui"><h1>Knaus Companion could not start</h1><p>${esc(err.message)}</p><button onclick="location.reload()">Reload</button></main>`;
});
