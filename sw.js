const CACHE_NAME = "plimpt-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/og-image.png",
  "./styles/main.css",
  "./styles/themes.css",
  "./styles/crt.css",
  "./scripts/app.js",
  "./scripts/cache-bust.js",
  "./scripts/audio.js",
  "./scripts/effects.js",
  "./scripts/generator.js",
  "./scripts/i18n.js",
  "./scripts/models.js",
  "./scripts/storage.js",
  "./scripts/templates.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        clients.forEach((client) => {
          if (client.url) client.navigate(client.url);
        });
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isCode = [".html", ".css", ".js", ".webmanifest"].some((ext) => url.pathname.endsWith(ext)) || url.pathname.endsWith("/");

  if (isCode) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
    )
  );
});
