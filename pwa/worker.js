var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = ['http://localhost:8001', 'http://localhost:8000/posts/', 'index.js'];

self.addEventListener('install', function (event) { // Perform install steps
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
    }));
});


self.addEventListener("activate", function(event) {
  event.waitUntil(self.clients.claim());
  console.log("Claimed");
});


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
      body: event.data.text(),
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
      self.registration.showNotification('New Tweet!', options)
    );
  });

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const applicationServerPublicKey = urlB64ToUint8Array('BH458YSQN1ZNGL-pdj-0Bxt-MJiDUMUdZxlaB8H_MRYOPJHbdKCeZREusbolzK1OeVJM8KsVIWDQrb5xe5EKhDQ');


self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Subscription expired');
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationServerPublicKey })
    .then(function(subscription) {
      console.log('Subscribed after expiration', subscription.endpoint);
      return fetch('http://localhost:8000/notification/subscribe', {
        method: 'POST',
        body: JSON.stringify(subs)
      });
    })
  );
});