const CACHE_NAME='voetupper-shell-v9';
const SHELL=[
  './',
  './index.html',
  './app.css?v=5',
  './hotfix.css?v=5',
  './product-v6.css?v=8',
  './network-es.css?v=10',
  './operational-import.css?v=1',
  './mobile-v7.css?v=8',
  './app.js?v=5',
  './import-team.js?v=2',
  './hotfix.js?v=5',
  './product-v6.js?v=8',
  './network-es.js?v=10',
  './operational-import.js?v=1',
  './operational-import-csv.js?v=1',
  './operational-import-review.js?v=1',
  './logo-192.png?v=10',
  './logo-512.png?v=10',
  './manifest.webmanifest?v=10',
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting()),
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim()),
  );
});

self.addEventListener('fetch',event=>{
  const {request}=event;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const isShell=request.mode==='navigate'||['script','style','manifest'].includes(request.destination);
  if(isShell){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
          }
          return response;
        })
        .catch(()=>caches.match(request).then(cached=>cached||caches.match('./index.html'))),
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      }
      return response;
    })),
  );
});
