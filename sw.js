// 오프라인용 서비스 워커: 페이지는 인터넷 우선(3초) → 안 되면 저장본, 나머지는 저장본 우선
const V='v2-'+new URL(self.registration.scope).pathname;const CORE=['./','./index.html','./app.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function timeout(ms){return new Promise((_,rj)=>setTimeout(rj,ms))}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  const page=r.mode==='navigate'||/\.html$|\/$/.test(u.pathname)&&u.origin===location.origin;
  if(page){e.respondWith((async()=>{const c=await caches.open(V);
    try{const res=await Promise.race([fetch(r.url,{cache:'no-cache',credentials:'same-origin'}),timeout(4000)]);if(res&&res.ok){c.put(u.origin+u.pathname,res.clone())}return res}
    catch(err){return (await c.match(u.origin+u.pathname))||(await c.match('./app.html'))||Response.error()}})());return}
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r);const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);return hit||net}))}
});
