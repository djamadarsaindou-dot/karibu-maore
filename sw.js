/* =============================================================================
   Service worker — c'est lui qui fait que l'appli s'ouvre sans réseau.
   -----------------------------------------------------------------------------
   STRATÉGIE : cache d'abord, revalidation en arrière-plan.

   Pourquoi pas « réseau d'abord », qui semble plus prudent ? Parce qu'à Mayotte
   le cas dominant n'est pas « pas de réseau » — là, la requête échoue vite — mais
   « réseau dégradé » : la connexion s'établit et les paquets n'arrivent jamais.
   fetch() n'a aucun délai d'expiration : le navigateur peut attendre deux minutes
   avant d'abandonner. L'utilisateur qui sort son téléphone sur la plage regarderait
   un écran vide alors que toute l'île est déjà sur son appareil.
   Le contenu est versionné à la main (APP.version) et ne change pas en cours de
   session : la fraîcheur à la seconde n'a aucune importance ici.

   PROTECTION CONTRE LES PORTAILS CAPTIFS. Un hotspot (hôtel, aéroport, borne
   publique) répond 200 avec sa page de connexion pour N'IMPORTE QUELLE URL,
   y compris app.js et data.js. Sans garde-fou, ces pages HTML écrasent les vrais
   fichiers dans le cache et l'application devient définitivement inutilisable
   hors connexion. On ne met donc en cache que ce qui est manifestement légitime :
   réponse 200, même origine, et type de contenu conforme à l'extension.
   ========================================================================== */

const CACHE = "karibu-maore-v16";
const CACHE_PHOTOS = "karibu-maore-photos-v1";

const FICHIERS = [
  "./", "./index.html", "./style.css",
  "./data.js", "./data-resa.js", "./photos.js", "./carte.js", "./carte-vue.js", "./contours.js", "./recherche.js", "./intentions.js", "./astro.js", "./hijri.js", "./marees.js", "./ui.js", "./app.js",
  "./manifest.webmanifest", "./icone.svg", "./icone-masque.svg",
  "./icone-192.png", "./icone-512.png", "./icone-maskable-512.png",
  "./apple-touch-icon.png", "./favicon-32.png",
  /* Les polices sont précachées : sans elles l'application s'ouvrirait dans
     une police de repli au premier lancement hors connexion, et la mise en
     page sauterait au chargement suivant. 63 Ko à deux. */
  "./assets/fonts/karibu-sans.woff2", "./assets/fonts/youngserif.woff2"
];

/* Une réponse mérite-t-elle d'être mise en cache ? */
function fiable(requete, reponse) {
  if (!reponse || !reponse.ok || reponse.type !== "basic") return false;
  let url;
  try { url = new URL(requete.url); } catch { return false; }
  if (url.origin !== self.location.origin) return false;

  /* Le contrôle qui attrape les portails captifs : une page de connexion est du
     HTML, et elle sera servie à la place d'un .js ou d'un .css. */
  const type = (reponse.headers.get("content-type") || "").toLowerCase();
  if (/\.js$/.test(url.pathname)  && !/javascript|ecmascript/.test(type)) return false;
  if (/\.css$/.test(url.pathname) && !/text\/css/.test(type)) return false;
  if (/\.webmanifest$/.test(url.pathname) && !/json|manifest/.test(type)) return false;
  if (/\.(webp|png|jpe?g|svg)$/.test(url.pathname) && !/^image\//.test(type)) return false;
  if (/\.woff2$/.test(url.pathname) && !/font|octet-stream/.test(type)) return false;
  return true;
}

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(
        ks.filter(k => k !== CACHE && k !== CACHE_PHOTOS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (!req.url.startsWith(self.location.origin)) return;   // rien à faire des liens externes

  /* Les photographies ne changent jamais : cache d'abord, téléchargées une seule
     fois, et JAMAIS préchargées — inutile d'imposer 1,4 Mo à quelqu'un qui ouvre
     l'application pour la première fois. */
  if (req.url.includes("/photos/")) {
    e.respondWith(
      caches.open(CACHE_PHOTOS).then(c =>
        c.match(req).then(cached => cached || fetch(req).then(r => {
          if (fiable(req, r)) c.put(req, r.clone());
          return r;
        }).catch(() => cached)))
    );
    return;
  }

  /* Tout le reste : on sert le cache immédiatement, et on rafraîchit derrière. */
  e.respondWith(
    caches.match(req).then(cached => {
      const reseau = fetch(req).then(r => {
        if (fiable(req, r)) {
          const copie = r.clone();
          caches.open(CACHE).then(c => c.put(req, copie));
        }
        return r;
      }).catch(() => cached);

      if (cached) return cached;                 // instantané, même sans réseau
      return reseau.then(r => r || caches.match("./index.html"));
    })
  );
});

/* Permet à la page de demander l'activation immédiate d'une nouvelle version
   (bouton « Recharger » du bandeau de mise à jour). */
self.addEventListener("message", e => {
  if (e.data === "activer-maintenant") self.skipWaiting();
});
