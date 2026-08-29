/* =============================================================================
   MAORÉ QUEST — la carte, vivante
   -----------------------------------------------------------------------------
   Zoom, déplacement, sélection, position de l'utilisateur. Aucune bibliothèque,
   aucune requête réseau, aucune tuile.

   LE PRINCIPE DE PERFORMANCE, ET IL EST TOUT : la viewBox ne bouge JAMAIS.
   Le zoom et le déplacement sont un `transform` posé sur un <g> englobant, donc
   composé par le processeur graphique. Réécrire la viewBox forcerait le
   navigateur à re-rastériser les 6 000 commandes de tracé de l'île à chaque
   image — 20 à 40 ms par image sur un téléphone d'entrée de gamme, autrement
   dit du saccadement.

   LA CONTRE-ÉCHELLE DES MARQUES : un point qui grossit avec le zoom devient une
   tache. Chaque marque porte donc un `scale(1/z)` qui annule le zoom du monde.

   LA POSITION N'EST JAMAIS DEMANDÉE AU DÉMARRAGE. Elle l'est quand on touche le
   bouton, et pas avant : une permission réclamée à l'ouverture est refusée, et
   elle ne se redemande pas.
   ========================================================================== */

const CarteVue = (() => {

  const K = Math.cos(CARTE.lat0 * Math.PI / 180);
  const VB = CARTE.viewBox.split(/\s+/).map(Number);
  const VBW = VB[2], VBH = VB[3];
  const ZMIN = 1, ZMAX = 8;

  let svg = null, monde = null, cadre = null;
  let z = 1, tx = 0, ty = 0;
  const doigts = new Map();
  let pincee = null, dernierAppui = 0, glisse = false;
  let moi = null;
  let auChoix = () => {};

  const projeter = (lat, lon) => ({
    x: ((lon - CARTE.lon0) * K - CARTE.minx) * CARTE.ech,
    y: (-(lat - CARTE.lat0) - CARTE.miny) * CARTE.ech
  });

  /* Bornes : on n'autorise pas à pousser l'île hors de l'écran. */
  function borner() {
    z = Math.min(ZMAX, Math.max(ZMIN, z));
    const marge = 0.25;                       // on tolère un quart d'écran de vide
    const maxX = VBW * (z - 1) / z + VBW * marge;
    const maxY = VBH * (z - 1) / z + VBH * marge;
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  }

  function appliquer() {
    if (!monde) return;
    borner();
    monde.setAttribute("transform", `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${z.toFixed(4)})`);
    /* Les marques annulent le zoom : sinon un point de 8 px en devient 64. */
    const inv = (1 / z).toFixed(4);
    for (const e of svg.querySelectorAll(".pt__ech")) e.setAttribute("transform", `scale(${inv})`);
    /* Le relief n'apparaît qu'en approchant : à l'échelle de l'île il
       encombre la silhouette. Et il n'est même pas TÉLÉCHARGÉ tant qu'on n'a
       pas zoomé — 55 Ko de courbes de niveau, pour une couche décorative, ne
       doivent pas peser sur la première ouverture de l'application. */
    if (z >= 1.6) chargerRelief();
    const rel = svg.querySelector(".carte__relief");
    if (rel) rel.style.opacity = z < 1.6 ? 0 : Math.min(0.55, (z - 1.6) * 0.6);
    if (cadre) cadre.dataset.zoom = z > 1.05 ? "oui" : "non";
  }

  /* ------------------------------------------------- LE RELIEF, À LA DEMANDE */
  let relief = "absent";

  function poserRelief() {
    const hote = svg && svg.querySelector(".carte__relief-hote");
    if (!hote || typeof CONTOURS === "undefined" || !CONTOURS.d) return;
    hote.innerHTML = `<path class="carte__relief" d="${CONTOURS.d}" aria-hidden="true"/>`;
    const c = cadre && cadre.querySelector(".carte__credit");
    /* L'attribution du modèle d'élévation n'apparaît qu'avec le relief : elle
       serait mensongère tant que rien n'en est affiché. */
    if (c && !c.dataset.dem) {
      c.dataset.dem = "1";
      c.insertAdjacentHTML("beforeend",
        " · relief : Copernicus DEM GLO-30 &copy;&nbsp;DLR&nbsp;e.V. et Airbus&nbsp;DS");
    }
    appliquer();
  }

  function chargerRelief() {
    if (relief !== "absent") return;
    if (typeof CONTOURS !== "undefined") { relief = "pret"; poserRelief(); return; }
    relief = "chargement";
    const s = document.createElement("script");
    s.src = "contours.js";
    s.onload  = () => { relief = "pret"; poserRelief(); };
    /* Hors ligne et sans cache, on ne montre simplement pas le relief : ce
       n'est pas une erreur à signaler, c'est une couche en moins. */
    s.onerror = () => { relief = "echec"; };
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------ LE RENDU */
  function marques(lieux, sel) {
    return lieux
      .filter(l => l.gps && !l.sansLieu)
      .map(l => {
        const p = projeter(l.gps[0], l.gps[1]);
        const actif = sel === l.id;
        const c = (UI.CARTOUCHE && UI.CARTOUCHE[l.cat]) || UI.CARTOUCHE.pratique;
        return `<g class="pt${actif ? " pt--actif" : ""}" data-action="carte-point" data-id="${l.id}"
          transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})" role="button" tabindex="0"
          aria-label="${(l.nom + ", " + l.commune).replace(/"/g, "&quot;")}">
          <g class="pt__ech">
            <circle class="pt__halo" r="${actif ? 26 : 0}"/>
            <circle class="pt__zone" r="20" fill="transparent"/>
            <circle class="pt__rond" r="${actif ? 11 : 7.5}" fill="${c.fond}"/>
            <circle class="pt__coeur" r="${actif ? 4 : 2.8}" fill="${c.trait}"/>
          </g></g>`;
      }).join("");
  }

  function rendre(lieux, opt = {}) {
    return `<svg class="carte" viewBox="${CARTE.viewBox}" role="img"
      aria-label="Carte de Mayotte, ${lieux.length} lieux. Deux doigts pour zoomer.">
      <rect class="carte__mer" x="${-VBW}" y="${-VBH}" width="${VBW * 3}" height="${VBH * 3}"/>
      <g class="monde">
        <path class="carte__recif" d="${CARTE.recif}"/>
        <path class="carte__terre" d="${CARTE.terre}"/>
        <g class="carte__relief-hote"></g>
        <g class="carte__moi"></g>
        <g class="carte__points">${marques(lieux, opt.selection)}</g>
      </g>
    </svg>`;
  }

  /* ------------------------------------------------------ LES GESTES */
  function versMonde(ev) {
    const r = svg.getBoundingClientRect();
    return { x: (ev.clientX - r.left) / r.width * VBW, y: (ev.clientY - r.top) / r.height * VBH };
  }

  function zoomerVers(px, py, facteur) {
    const avant = z;
    z = Math.min(ZMAX, Math.max(ZMIN, z * facteur));
    /* On garde le point sous le doigt à sa place : c'est ce qui fait qu'un
       zoom paraît naturel plutôt que téléporté. */
    const k = z / avant;
    tx = px - (px - tx) * k;
    ty = py - (py - ty) * k;
    appliquer();
  }

  function brancher(racine) {
    cadre = racine;
    svg = racine.querySelector(".carte");
    monde = racine.querySelector(".monde");
    if (!svg || !monde) return;
    z = 1; tx = 0; ty = 0; appliquer();

    svg.addEventListener("pointerdown", e => {
      doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      glisse = false;
      if (doigts.size === 2) {
        const [a, b] = [...doigts.values()];
        pincee = { d: Math.hypot(a.x - b.x, a.y - b.y) };
      }
      svg.setPointerCapture(e.pointerId);
    });

    svg.addEventListener("pointermove", e => {
      const p = doigts.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      if (Math.hypot(dx, dy) > 4) glisse = true;
      doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (doigts.size === 2 && pincee) {
        const [a, b] = [...doigts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const r = svg.getBoundingClientRect();
        const cx = ((a.x + b.x) / 2 - r.left) / r.width * VBW;
        const cy = ((a.y + b.y) / 2 - r.top) / r.height * VBH;
        if (pincee.d > 0) zoomerVers(cx, cy, d / pincee.d);
        pincee.d = d;
      } else if (doigts.size === 1 && z > 1.02) {
        /* À l'échelle 1 on ne déplace rien : le doigt appartient à la page,
           qui doit pouvoir défiler. Le CSS s'accorde là-dessus par
           `touch-action`, piloté par l'attribut data-zoom du cadre. */
        const r = svg.getBoundingClientRect();
        tx += dx / r.width * VBW;
        ty += dy / r.height * VBH;
        appliquer();
      }
    });

    const fin = e => {
      doigts.delete(e.pointerId);
      if (doigts.size < 2) pincee = null;
    };
    svg.addEventListener("pointerup", fin);
    svg.addEventListener("pointercancel", fin);

    /* Double appui : zoom vers l'endroit touché. */
    svg.addEventListener("pointerup", e => {
      const t = Date.now();
      if (!glisse && t - dernierAppui < 320) {
        const p = versMonde(e);
        zoomerVers(p.x, p.y, z > 3 ? 1 / (z) : 2.2);
        dernierAppui = 0;
      } else dernierAppui = t;
    });

    svg.addEventListener("wheel", e => {
      e.preventDefault();
      const p = versMonde(e);
      zoomerVers(p.x, p.y, e.deltaY < 0 ? 1.18 : 1 / 1.18);
    }, { passive: false });

    /* Un glissement ne doit pas ouvrir la fiche qui se trouvait sous le doigt. */
    svg.addEventListener("click", e => { if (glisse) { e.stopPropagation(); e.preventDefault(); } }, true);
  }

  /* ------------------------------------------------- LA POSITION */
  function situer(retour) {
    if (!navigator.geolocation) return retour({ erreur: "indisponible" });
    navigator.geolocation.getCurrentPosition(
      pos => {
        moi = { lat: pos.coords.latitude, lon: pos.coords.longitude, precision: pos.coords.accuracy };
        const g = svg && svg.querySelector(".carte__moi");
        /* Hors de l'emprise de la carte, on ne dessine rien : quelqu'un qui
           ouvre l'appli depuis la métropole ne doit pas voir un point collé
           au bord de l'île. */
        const dans = moi.lat > -13.05 && moi.lat < -12.60 && moi.lon > 44.98 && moi.lon < 45.35;
        if (g && dans) {
          const p = projeter(moi.lat, moi.lon);
          const r = Math.max(6, (moi.precision / 111320) * CARTE.ech * K);
          g.innerHTML = `<circle class="moi__precision" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}"/>
            <g class="pt__ech" transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})">
              <circle class="moi__point" r="8"/></g>`;
          /* On centre dessus, sans brusquerie. */
          z = Math.max(z, 2.5);
          tx = VBW / 2 - p.x * z; ty = VBH / 2 - p.y * z;
          appliquer();
        }
        retour({ moi, dans });
      },
      err => retour({ erreur: err.code === 1 ? "refus" : "echec" }),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  const zoomer = f => { zoomerVers(VBW / 2, VBH / 2, f); };
  const recadrer = () => { z = 1; tx = 0; ty = 0; appliquer(); };
  const distance = (a, b) => {           // en km, formule de Haversine
    const R = 6371, r = Math.PI / 180;
    const dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    const x = Math.sin(dLat / 2) ** 2
            + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  };

  return { rendre, brancher, situer, zoomer, recadrer, projeter, distance, chargerRelief,
           get position() { return moi; } };
})();
