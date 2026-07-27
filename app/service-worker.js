const CACHE_PREFIX='knaus-companion-';
const CACHE=`${CACHE_PREFIX}v15-1-0-owner-records`;
const CORE=['./','./index.html','./manifest.webmanifest','./assets/css/app-v4.css?v=15.1.0-owner-records','./assets/js/kb-corpus.js?v=15.1.0-owner-records','./assets/js/digital-twin.js?v=15.1.0-owner-records','./assets/js/digital-twin-adapter.js?v=15.1.0-owner-records','./assets/js/digital-twin-owner-overlay.js?v=15.1.0-owner-records','./assets/js/reasoning-safety.js?v=15.1.0-owner-records','./assets/js/record-history.js?v=15.1.0-owner-records','./assets/js/evidence-links.js?v=15.1.0-owner-records','./assets/js/owner-records.js?v=15.1.0-owner-records','./assets/js/owner-record-ui.js?v=15.1.0-owner-records','./assets/js/local-reasoning.js?v=15.1.0-owner-records','./assets/js/guided-diagnostics.js?v=15.1.0-owner-records','./assets/js/app-v4.js?v=15.1.0-owner-records','./data/build.json','./data/owner_records.schema.json','./data/kb_manifest.json','./data/kb_index.json','./data/digital_twin.json','./data/digital_twin.schema.json','./data/reasoning.json','./data/reasoning_index.json','./data/vehicle_config_schema.json','./data/touring_operations.json','./data/packing_templates.json','./data/maintenance_tasks.json','./data/parts_inventory.json','./assets/photos/vehicle_photo_01.jpg','./assets/photos/vehicle_photo_02.jpg','./assets/photos/vehicle_photo_03.jpg','./assets/photos/vehicle_photo_04.jpg','./assets/photos/vehicle_photo_05.jpg','./assets/photos/vehicle_photo_06.jpg'];
async function rebuildCache(){await caches.delete(CACHE);const cache=await caches.open(CACHE);await cache.addAll(CORE)}
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();if(event.data?.type==='REBUILD_CACHE')event.waitUntil(rebuildCache().then(()=>event.ports[0]?.postMessage({ok:true})).catch(()=>event.ports[0]?.postMessage({ok:false})))});
self.addEventListener('install',event=>event.waitUntil(rebuildCache().then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy))}return response}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>caches.match('./index.html'))));
});
