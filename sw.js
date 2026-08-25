/* Service worker — rend l'appli utilisable sans réseau.
   Stratégie : « network first » pour rester à jour quand il y a du réseau,
   repli sur le cache dès que ça coupe (ce qui arrive souvent à Mayotte). */

const CACHE = "karibu-maore-v4";
const FICHIERS = [
  "./", "./index.html", "./style.css",
  "./data.js", "./data-resa.js", "./marees.js", "./ui.js", "./app.js",
  "./manifest.webmanifest", "./icone.svg", "./icone-masque.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copie = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copie));
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
