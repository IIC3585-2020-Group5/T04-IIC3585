var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = ['http://localhost:8069/pwa/', 'http://localhost:8000/posts/', 'index.js'];

self.addEventListener('install', function (event) { // Perform install steps
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
    }));
});


// self.addEventListener("activate", function(event) {
// event.waitUntil(self.clients.claim());
// });


self.addEventListener('fetch', function (event) { // console.log(event.request)

    if (event.request.method != 'POST') {
        event.respondWith(async function () {
            try {
                const cache = await caches.open(CACHE_NAME);
                const networkResponse = await fetch(event.request);
                event.waitUntil(cache.put(event.request, networkResponse.clone()));
                return networkResponse;
            } catch (err) {
                return caches.match(event.request);
            }
        }());
    }
    
});
