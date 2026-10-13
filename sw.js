// Cuadre: abre rápido y sin internet. Siempre intenta la versión nueva primero.
const C='cuadre-v2';
const BASE=['./','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(BASE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const guardar=(r,res)=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}return res};
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  // Letras de Google: se guardan la primera vez y luego se usan sin internet
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>guardar(r,res))));return}
  if(u.origin!==location.origin)return;
  // La app: intenta la versión nueva; si no hay internet (o tarda más de 4 segundos al abrir), usa la guardada
  const red=fetch(r).then(res=>guardar(r,res));
  const copia=()=>caches.match(r,{ignoreSearch:r.mode==='navigate'}).then(m=>m||caches.match('./'));
  if(r.mode==='navigate'){
    e.respondWith(new Promise(ok=>{let listo=false;const t=setTimeout(()=>copia().then(m=>{if(m&&!listo){listo=true;ok(m)}}),4000);
      red.then(res=>{if(!listo){listo=true;clearTimeout(t);ok(res)}}).catch(()=>copia().then(m=>{if(!listo){listo=true;clearTimeout(t);ok(m||Response.error())}}))}));
    return;
  }
  e.respondWith(red.catch(()=>copia()));
});
