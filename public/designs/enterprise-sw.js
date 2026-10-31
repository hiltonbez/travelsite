// Service worker for the Enterprise design installed as an app (src/designs/enterprise/layout.tsx registers it).
// Pages: network first, each page's last copy when offline (the home page if that page was never opened). Hashed build files and pictures: cache first.
// TribeTravel's API is never cached: prices, chat and bookings are always live.
// Push: TribeTravel's "your quote is ready" alerts ({title, body, url}); tapping one opens the quote, or the app.
const CACHE = "sunset-app-v2";
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
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match(START))),
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

self.addEventListener("push", (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch {
    data = { body: e.data ? e.data.text() : "" };
  }
  e.waitUntil(
    self.registration.showNotification(data.title || "Sun-Set Travel", {
      body: data.body || "",
      icon: "/designs/app-icon-192.png",
      badge: "/designs/app-icon-192.png",
      data: { url: data.url || START },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || START;
  e.waitUntil(self.clients.openWindow(url));
});
