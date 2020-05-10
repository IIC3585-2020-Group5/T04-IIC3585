var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = ['http://localhost:8001', 'http://localhost:8000/posts/', 'index.js'];

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


self.addEventListener('push', event => {
    const options = {
      body: 'This notification was generated from a push!',
      icon: 'images/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {action: 'explore', title: 'Go to the site',
          icon: 'images/icons/icon-72x72.png'},
        {action: 'close', title: 'Close the notification',
          icon: 'images/icons/icon-72x72.png'},
      ]
    };
  
    event.waitUntil(
      self.registration.showNotification('Push Notification', options)
    );
  });
