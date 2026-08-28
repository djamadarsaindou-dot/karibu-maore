/* =============================================================================
   KARIBU MAORÉ — la carte postale
   -----------------------------------------------------------------------------
   POURQUOI. Partager une fiche envoie aujourd'hui une ligne de texte et un
   lien. Dans une conversation WhatsApp, ça se perd entre deux messages. Une
   image se regarde, se retient, et se transmet toute seule — c'est la seule
   forme de bouche-à-oreille qui marche vraiment ici.

   CE QUE C'EST. Une image de 1 080 × 1 350 dessinée dans le navigateur, à
   l'instant du partage : la photo de la fiche si elle en a une, le nom du lieu,
   sa commune, et la silhouette de Mayotte avec un point à l'endroit exact.
   Aucun serveur, aucune requête. Elle marche hors connexion.

   LA SILHOUETTE VIENT DE `carte.js`. `Path2D` accepte directement l'attribut
   `d` d'un SVG : le même tracé sert donc à la carte de l'application et à la
   carte postale, sans le dupliquer ni le redessiner.

   LES POLICES. Il faut attendre `document.fonts.load` AVANT de dessiner :
   un canevas ne re-rend pas son texte quand la police arrive, contrairement au
   HTML. Sans cette attente, la carte postale sort en police système une fois
   sur deux — et on ne s'en aperçoit pas, parce qu'à la deuxième tentative la
   police est en cache.

   LE PARTAGE. `navigator.canShare({files})` dit si le téléphone accepte de
   partager un fichier. Quand il refuse — beaucoup d'ordinateurs de bureau —
   on ne fait pas semblant : on propose l'enregistrement.
   ========================================================================== */

const POSTALE = (() => {

  const L = 1080, H = 1350;
  const SABLE = "#f4ede2", BASALTE = "#241f1d", PASSE = "#0a3a57";
  const PLATIER = "#0f6f6b", YLANG = "#c4b63e", VASE = "#5e5a51";

  /* Une fois les polices chargées, on ne réattend plus : c'est instantané, mais
     `fonts.load` renvoie une promesse et l'oublier coûte un rendu raté. */
  let policesPretes = null;
  function attendrePolices() {
    if (policesPretes) return policesPretes;
    const f = document.fonts;
    policesPretes = !f ? Promise.resolve() : Promise.all([
      f.load('700 96px "Young Serif"'),
      f.load('650 34px "Karibu Sans"'),
      f.load('400 30px "Karibu Sans"')
    ]).catch(() => {});
    return policesPretes;
  }

  /* Assombrit une couleur hexadécimale d'un facteur. Sert au fond de repli :
     un dégradé doit rester dans la même famille, sinon il vire. */
  function assombrir(hex, f) {
    const n = parseInt(String(hex).slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * f);
    const g = Math.round(((n >> 8) & 255) * f);
    const b = Math.round((n & 255) * f);
    return `rgb(${r},${g},${b})`;
  }

  const image = src => new Promise(ok => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = () => ok(null);          // pas de photo : on dessine sans
    i.src = src;
  });

  /* Découpe « cover » : on remplit le cadre sans jamais déformer le sujet. */
  function couvrir(ctx, img, x, y, w, h) {
    const r = Math.max(w / img.width, h / img.height);
    const dw = img.width * r, dh = img.height * r;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.restore();
  }

  /* Coupe un texte à la largeur disponible, en mots, et rend les lignes. */
  function lignes(ctx, texte, large, max) {
    const mots = String(texte).split(/\s+/);
    const out = [];
    let cur = "";
    for (const m of mots) {
      const essai = cur ? cur + " " + m : m;
      if (ctx.measureText(essai).width > large && cur) { out.push(cur); cur = m; }
      else cur = essai;
      if (out.length === max) break;
    }
    if (cur && out.length < max) out.push(cur);
    if (out.length === max && mots.join(" ") !== out.join(" ")) {
      let d = out[max - 1];
      while (d && ctx.measureText(d + " …").width > large) d = d.slice(0, -1).trimEnd();
      out[max - 1] = d + " …";
    }
    return out;
  }

  /* La silhouette de l'île, à l'échelle voulue, avec un point sur le lieu. */
  function ile(ctx, x, y, taille, gps) {
    const vb = CARTE.viewBox.split(/\s+/).map(Number);
    const k = taille / vb[3];                    // on cale sur la HAUTEUR
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(15,111,107,.16)";
    ctx.strokeStyle = PLATIER; ctx.lineWidth = 2.4 / k; ctx.lineJoin = "round";
    const p = new Path2D(CARTE.terre);
    ctx.fill(p); ctx.stroke(p);
    if (gps) {
      const kk = Math.cos(CARTE.lat0 * Math.PI / 180);
      const px = ((gps[1] - CARTE.lon0) * kk - CARTE.minx) * CARTE.ech;
      const py = (-(gps[0] - CARTE.lat0) - CARTE.miny) * CARTE.ech;
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(px, py, 34 / k, 0, 7); ctx.fillStyle = "rgba(169,80,43,.22)"; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, 17 / k, 0, 7); ctx.fillStyle = "#a9502b"; ctx.fill();
      ctx.lineWidth = 6 / k; ctx.strokeStyle = SABLE; ctx.stroke();
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------ LE DESSIN */
  async function dessiner(l) {
    await attendrePolices();
    const c = document.createElement("canvas");
    c.width = L; c.height = H;
    const ctx = c.getContext("2d");

    ctx.fillStyle = SABLE;
    ctx.fillRect(0, 0, L, H);

    /* --- le haut : la photo, ou l'à-plat de la catégorie --- */
    const HP = 760;
    const p = typeof PHOTOS !== "undefined" ? PHOTOS[l.id] : null;
    const cat = (UI.CARTOUCHE && UI.CARTOUCHE[l.cat]) || { fond: PASSE, trait: PLATIER };
    let photo = null;
    if (p) photo = await image("photos/" + p.f);
    if (photo) {
      couvrir(ctx, photo, 0, 0, L, HP);
    } else {
      /* LE DÉGRADÉ VA DU FOND VERS UN FOND PLUS SOMBRE, jamais vers la couleur
         de trait. Un premier jet allait de la terre cuite vers le sable : la
         moitié basse de l'image devenait exactement la couleur du papier, la
         frontière disparaissait, et la carte postale paraissait délavée. */
      const g = ctx.createLinearGradient(0, 0, L * 0.6, HP);
      g.addColorStop(0, cat.fond);
      g.addColorStop(1, assombrir(cat.fond, 0.55));
      ctx.fillStyle = g; ctx.fillRect(0, 0, L, HP);
      /* La trame gravée : des traits droits, jamais un arc. Le choix est
         expliqué dans ui.js — aucune forme empruntée à un motif existant. */
      ctx.globalAlpha = 0.14; ctx.strokeStyle = cat.trait; ctx.lineWidth = 3;
      for (let i = -HP; i < L; i += 26) {
        ctx.beginPath(); ctx.moveTo(i, HP); ctx.lineTo(i + HP, 0); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    /* --- le nom --- */
    const M = 68;
    ctx.textBaseline = "alphabetic";
    const BOITE = L - M * 2;
    let taille = 92;
    /* On rétrécit tant que le titre déborde — en HAUTEUR (plus de deux lignes)
       ou en LARGEUR. Ne surveiller que le nombre de lignes ne suffit pas : un
       nom d'un seul mot long tient sur une ligne et sort quand même du cadre.
       « La barge Mamoudzou ↔ Dzaoudzi » sortait par la droite. */
    const trop = ls => ls.length > 2 ||
      ls.some(t => ctx.measureText(t).width > BOITE);
    ctx.font = `700 ${taille}px "Young Serif", Georgia, serif`;
    let ls = lignes(ctx, l.nom, BOITE, 3);
    while (trop(ls) && taille > 50) {
      taille -= 6;
      ctx.font = `700 ${taille}px "Young Serif", Georgia, serif`;
      ls = lignes(ctx, l.nom, BOITE, 3);
    }
    /* LE VOILE EST CALCULÉ SUR LE BLOC DE TEXTE, pas posé à une hauteur fixe.
       Avec une valeur en dur, la ligne de commune sortait par le haut du
       dégradé et se retrouvait en jaune clair sur la coque blanche de la
       barge — illisible. On mesure d'abord, on assombrit ensuite. */
    const hautTexte = HP - 56 - ls.length * (taille * 1.06) - 46;
    const v = ctx.createLinearGradient(0, hautTexte - 150, 0, HP);
    v.addColorStop(0, "rgba(18,24,28,0)");
    v.addColorStop(0.55, "rgba(18,24,28,.62)");
    v.addColorStop(1, "rgba(18,24,28,.88)");
    ctx.fillStyle = v; ctx.fillRect(0, hautTexte - 150, L, HP - hautTexte + 150);

    /* Une ombre portée en plus du voile. Le voile suffit dans 95 % des cas ;
       le reste, ce sont les photos qui ont un aplat très clair pile sous le
       texte — la coque blanche de la barge. Deux protections valent mieux
       qu'un pari sur la photo. */
    ctx.shadowColor = "rgba(10,14,18,.55)";
    ctx.shadowBlur = 14; ctx.shadowOffsetY = 2;

    ctx.fillStyle = "#fff";
    ctx.font = `700 ${taille}px "Young Serif", Georgia, serif`;
    let y = HP - 56 - (ls.length - 1) * (taille * 1.06);
    for (const t of ls) { ctx.fillText(t, M, y); y += taille * 1.06; }

    /* --- la commune, au-dessus du nom --- */
    ctx.font = '650 30px "Karibu Sans", system-ui, sans-serif';
    ctx.fillStyle = YLANG;
    /* La commune telle qu'elle est écrite dans la fiche, toujours. Un premier
       jet mettait « Partout à Mayotte » sur toutes les fiches `sansLieu` — et
       la barge, qui va de Mamoudzou à Dzaoudzi et nulle part ailleurs, se
       retrouvait annoncée partout. */
    const commune = String(l.commune || "Mayotte").toUpperCase();
    ctx.fillText(commune, M, HP - 56 - ls.length * (taille * 1.06) - 8);

    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    /* --- le bas : le résumé, l'île, la signature --- */
    ctx.fillStyle = BASALTE;
    ctx.font = '400 38px "Karibu Sans", system-ui, sans-serif';
    const res = lignes(ctx, l.resume, L - M * 2 - 300, 3);
    let yr = HP + 92;
    for (const t of res) { ctx.fillText(t, M, yr); yr += 52; }

    ile(ctx, L - 300, HP + 34, 300, l.sansLieu ? null : l.gps);

    /* Le filet et la signature */
    ctx.strokeStyle = "rgba(94,90,81,.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(M, H - 130); ctx.lineTo(L - M, H - 130); ctx.stroke();

    ctx.fillStyle = BASALTE;
    ctx.font = '650 34px "Karibu Sans", system-ui, sans-serif';
    ctx.fillText("Karibu Maoré", M, H - 74);
    ctx.fillStyle = VASE;
    ctx.font = '400 27px "Karibu Sans", system-ui, sans-serif';
    /* L'adresse publique, pas celle du navigateur : une carte postale
       fabriquée depuis un serveur local ne doit pas partir avec 127.0.0.1
       imprimé dessus. */
    const url = (APP.url || location.origin + location.pathname)
      .replace(/^https?:\/\//, "").replace(/\/$/, "");
    ctx.textAlign = "right";
    ctx.fillText(url, L - M, H - 74);
    ctx.textAlign = "left";

    /* JPEG, PAS PNG. Une carte postale est une photographie posée sur un fond :
       le PNG la rend sans perte et pèse 1,5 Mo, le JPEG à 90 % en fait 250 Ko
       sans différence visible à l'œil. Sur une connexion mahoraise, le premier
       ne part pas. Le fond crème et les aplats, eux, ne souffrent pas du JPEG —
       ils n'ont ni dégradé fin ni texte minuscule sur trame. */
    return new Promise(ok => c.toBlob(ok, "image/jpeg", 0.9));
  }

  /* Une réduction pour se relire : utile en développement, et c'est aussi ce
     qui sert d'aperçu dans la feuille. */
  async function apercu(l, large = 540) {
    const blob = await dessiner(l);
    const img = await image(URL.createObjectURL(blob));
    if (!img) return blob;
    const c = document.createElement("canvas");
    c.width = large; c.height = Math.round(large * H / L);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(img.src);
    return new Promise(ok => c.toBlob(ok, "image/jpeg", 0.72));
  }

  /* Rend un File prêt à partager, ou null si le dessin a échoué. */
  async function fichier(l) {
    try {
      const blob = await dessiner(l);
      if (!blob) return null;
      const nom = l.id.replace(/[^a-z0-9-]/g, "") + "-karibu-maore.jpg";
      return new File([blob], nom, { type: "image/jpeg" });
    } catch { return null; }
  }

  return { dessiner, apercu, fichier };
})();
