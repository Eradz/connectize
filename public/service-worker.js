const CACHE_NAME = "connectize-cache-v1";
const OFFLINE_URL = "/offline.html";

const assetsToCache = [
  "/",
  "/index.html",
  OFFLINE_URL,
  "/styles.css",
  "/logo192.png",
  "/logo512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
  if (navigator.onLine) {
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return fetch(event.request)
            .then((response) => {
              cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => caches.match(event.request));
        })
      );
      console.log(
        "Caching request: ",
        event.request.url,
        " with cache name ",
        CACHE_NAME
      );
      
    }
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
