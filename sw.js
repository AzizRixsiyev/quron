const C = "qso-web-v2.8";
const FILES = ["./", "index.html", "style.css", "app.js", "data.js", "uzdict.js", "qdata.js", "tajweed.js", "indopak.js", "morph.js",
  "tr_uzbek_sadiq.js", "tr_uzbek_mansour.js", "tr_uzbek_rwwad.js", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png",
  "amiri-quran.woff2", "madina-qmh.woff2", "oldmadina-qmh.woff2", "indopak-qmh.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== "qso-audio").map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.origin === location.origin) { e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request))); return; }
});
