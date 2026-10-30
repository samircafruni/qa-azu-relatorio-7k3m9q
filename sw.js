const MIME={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json; charset=utf-8',css:'text/css; charset=utf-8',png:'image/png',webp:'image/webp',mp4:'video/mp4',webm:'video/webm',txt:'text/plain; charset=utf-8',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
let KEY=null,MAP=null;
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
function db(){return new Promise((r,j)=>{const q=indexedDB.open('qa',1);q.onupgradeneeded=()=>q.result.createObjectStore('k');q.onsuccess=()=>r(q.result);q.onerror=j})}
async function idb(op,v){const d=await db();return new Promise((r,j)=>{const t=d.transaction('k',op?'readwrite':'readonly').objectStore('k');const q=op?t.put(v,'key'):t.get('key');q.onsuccess=()=>r(q.result);q.onerror=j})}
const b64=s=>Uint8Array.from(atob(s.trim()),c=>c.charCodeAt(0));
const PK={};async function pack(id){if(!PK[id])PK[id]=fetch(new URL('x/'+id+'.txt',self.registration.scope)).then(r=>r.text()).then(t=>t.split('\n'));return PK[id]}
async function dec(url,t){if(t===undefined)t=await (await fetch(url,{cache:'no-store'})).text();const b=b64(t);
 return crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},KEY,b.slice(12))}
async function ready(){if(!KEY)KEY=await idb(false);if(!KEY)return false;
 if(!MAP)MAP=JSON.parse(new TextDecoder().decode(await dec(new URL('m.txt',self.registration.scope))));return true}
self.addEventListener('message',e=>{if(e.data&&e.data.key){KEY=e.data.key;MAP=null;e.waitUntil(idb(true,KEY).then(()=>e.source.postMessage('ok')))}});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url),base=new URL('app/',self.registration.scope).pathname;
 if(!u.pathname.startsWith(base))return;
 e.respondWith((async()=>{try{if(!await ready())return Response.redirect(self.registration.scope,302);
  const rel=decodeURIComponent(u.pathname.slice(base.length))||'relatorio.html';const id=MAP[rel];
  if(!id)return new Response('Não encontrado',{status:404});
  const buf=await dec(null,(await pack(id[0]))[id[1]]);const ext=rel.split('.').pop().toLowerCase();
  return new Response(buf,{headers:{'Content-Type':MIME[ext]||'application/octet-stream','Content-Length':buf.byteLength}})}
  catch(err){return new Response('Erro ao descriptografar: '+err,{status:500})}})())});
