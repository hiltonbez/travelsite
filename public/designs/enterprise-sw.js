// Service worker for the Enterprise design installed as an app (src/designs/enterprise.tsx registers it).
// Pages: network first, the last copy when offline. Hashed build files and pictures: cache first.
// TribeTravel's API is never cached: prices, chat and bookings are always live.
const CACHE = "sunset-app-v1";
const START = "/designs/enterprise";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add(START)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(START, copy));
          return res;
        })
        .catch(() => caches.match(START)),
    );
    return;
  }

  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/designs/")) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })),
    );
  }
});
