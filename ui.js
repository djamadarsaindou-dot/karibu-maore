/* =============================================================================
   KARIBU MAORÉ — bibliothèque visuelle
   -----------------------------------------------------------------------------
   L'appli doit fonctionner hors connexion et rester légère : pas une seule image
   bitmap, pas une seule police externe. Tout ce qui est illustré ici est du SVG
   généré à la volée, de façon DÉTERMINISTE : une fiche donnée aura toujours
   exactement la même vignette, sur tous les appareils et à chaque ouverture.
   ========================================================================== */

const UI = (() => {

  /* ---------------------------------------------------------------- ICÔNES
     Dessinées sur une grille 24, tracées au trait. Taille par défaut 1em pour
     qu'une icône glissée dans un texte ne prenne jamais toute la place.      */
  const D = {
    accueil:   '<path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    loupe:     '<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5 16.7 16.7"/>',
    coeur:     '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    epingle:   '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    horloge:   '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
    agenda:    '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    boussole:  '<circle cx="12" cy="12" r="9.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    vagues:    '<path d="M2 8.5c2.2-2 4.4-2 6.6 0s4.4 2 6.6 0 4.4-2 6.8 0"/><path d="M2 14c2.2-2 4.4-2 6.6 0s4.4 2 6.6 0 4.4-2 6.8 0"/><path d="M2 19.5c2.2-2 4.4-2 6.6 0s4.4 2 6.6 0 4.4-2 6.8 0"/>',
    soleil:    '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
    lune:      '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    alerte:    '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4.5"/><circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none"/>',
    info:      '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".8" fill="currentColor" stroke="none"/>',
    valide:    '<path d="M21.5 11.1V12a9.5 9.5 0 1 1-5.6-8.7"/><path d="m8.8 11.6 3 3 9-9"/>',
    message:   '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5a8.4 8.4 0 0 1-.9-3.9 8.5 8.5 0 0 1 8.4-9h.5a8.5 8.5 0 0 1 8 8z"/>',
    partager:  '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-4M8.6 13.4l6.8 4"/>',
    sortir:    '<path d="M18 13.5V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6.5"/><path d="M15 2h7v7M22 2 11 13"/>',
    fleche:    '<path d="M15 18 9 12l6-6"/>',
    croix:     '<path d="M18 6 6 18M6 6l12 12"/>',
    carte:     '<path d="M1 6 8 3l8 3 7-3v15l-7 3-8-3-7 3z"/><path d="M8 3v15M16 6v15"/>',
    livre:     '<path d="M2 4.5h6a3.5 3.5 0 0 1 3.5 3.5v12A2.6 2.6 0 0 0 9 18H2z"/><path d="M22 4.5h-6A3.5 3.5 0 0 0 12.5 8v12A2.6 2.6 0 0 1 15 18h7z"/>',
    sac:       '<rect x="3" y="7.5" width="18" height="13.5" rx="3"/><path d="M8 7.5V6a4 4 0 0 1 8 0v1.5M3 12.5h18"/>',
    gens:      '<path d="M16 20v-1.6a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="9" cy="7" r="3.4"/><path d="M22 20v-1.6a4 4 0 0 0-3-3.8"/><path d="M16.5 3.6a4 4 0 0 1 0 6.8"/>',
    goutte:    '<path d="M12 2.7 6.9 8.6a7 7 0 1 0 10.2 0z"/>',
    copie:     '<rect x="8.5" y="8.5" width="12.5" height="12.5" rx="2.5"/><path d="M5.5 15.5H4.5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    imprimer:  '<path d="M6 9V2.5h12V9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7.5" rx="1.5"/>',
    drapeau:   '<path d="M4 22V3.5M4 4.5h13l-2.5 4L17 12.5H4"/>',
    plus:      '<path d="M12 5v14M5 12h14"/>',
    etoile:    '<path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.6l6.5-.9z"/>',
    feuille:   '<path d="M11 20A7 7 0 0 1 4 13c0-6 6-9.5 16-10 0 10-4 17-9 17z"/><path d="M4.5 20.5c2-4 5-7 9.5-9.5"/>'
  };

  function icone(nom, cls = "") {
    const d = D[nom] || D.info;
    return `<svg class="i${cls ? " " + cls : ""}" width="1em" height="1em" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  }

  /* ------------------------------------------------------- ALÉA DÉTERMINISTE */
  function graine(txt) {
    let h = 2166136261;
    for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function dé(seed) {
    let s = (seed || 1) >>> 0;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; };
  }

  /* --------------------------------------------------------------- PALETTES
     Trois ambiances par catégorie (matin clair, plein jour, fin de journée) :
     deux fiches voisines ne se ressemblent jamais tout à fait.               */
  const PAL = {
    nature: [
      { ciel:["#e4f4e7","#b6dfc4"], astre:"#f6d06a", loin:"#8ccBa4", moyen:"#4f9d75", pres:"#2b6b4d", detail:"#1d4d38" },
      { ciel:["#dff0ef","#9fd3cf"], astre:"#ffe08a", loin:"#79c0a8", moyen:"#3f9377", pres:"#215c50", detail:"#173f38" },
      { ciel:["#fdefd9","#f0c9a0"], astre:"#f79c42", loin:"#c9a670", moyen:"#7f8f5c", pres:"#4a5f3d", detail:"#33452b" }
    ],
    plage: [
      { ciel:["#eaf7fc","#b6e3f3"], astre:"#ffdf9a", loin:"#7fd3e0", moyen:"#2fa7bd", pres:"#f2e2c4", detail:"#8a6b3f" },
      { ciel:["#e6f6f6","#98d9d6"], astre:"#fff0b8", loin:"#5cc6cd", moyen:"#1d8fa5", pres:"#ecdcbd", detail:"#7a5c36" },
      { ciel:["#ffeedd","#ffc79a"], astre:"#ff8a4a", loin:"#e8a37f", moyen:"#b96a55", pres:"#f3ddb9", detail:"#6d4a2c" }
    ],
    mer: [
      { ciel:["#dcefF8","#8ec6e2"], astre:"#ffe9ad", loin:"#3a90b8", moyen:"#1c6b93", pres:"#0e4a6d", detail:"#f2fbff" },
      { ciel:["#e8f4fa","#a9d8ea"], astre:"#fff3c4", loin:"#4fa6c4", moyen:"#26789c", pres:"#144f70", detail:"#eefaff" },
      { ciel:["#fde9d8","#f0b184"], astre:"#ff7a3d", loin:"#c97f7a", moyen:"#7a5a78", pres:"#33395c", detail:"#ffe9d0" }
    ],
    culture: [
      { ciel:["#f1e9f8","#c9b1e4"], astre:"#ffe08a", loin:"#a288cc", moyen:"#6a4f9c", pres:"#41306a", detail:"#f6f0ff" },
      { ciel:["#eef0fa","#b9c0e6"], astre:"#ffeaa8", loin:"#8f9bd0", moyen:"#5a63a6", pres:"#343a6f", detail:"#f4f6ff" },
      { ciel:["#fdefdf","#f2c896"], astre:"#f59a3c", loin:"#c99a72", moyen:"#8d6448", pres:"#4f3a2e", detail:"#fff3e2" }
    ],
    food: [
      { ciel:["#fdf0de","#f6cc9f"], astre:"#ff9f4a", loin:"#e8b36a", moyen:"#c8703a", pres:"#8f4a24", detail:"#fff6e8" },
      { ciel:["#fdeee9","#f2b8a4"], astre:"#ff7a5c", loin:"#dd9a7a", moyen:"#b0563c", pres:"#6f3221", detail:"#fff2ec" },
      { ciel:["#f6f2e0","#ddd39c"], astre:"#e8c34a", loin:"#c4b673", moyen:"#8d7f3f", pres:"#544b21", detail:"#fbf8ea" }
    ],
    famille: [
      { ciel:["#fdeaf0","#f6c2d3"], astre:"#ffd07a", loin:"#e894ac", moyen:"#c96486", pres:"#8e3f5a", detail:"#fff0f5" },
      { ciel:["#eef6ea","#c2e0b8"], astre:"#ffd98e", loin:"#9ac98a", moyen:"#5e9a58", pres:"#37633a", detail:"#f2fbef" },
      { ciel:["#eaf1f8","#bcd0e6"], astre:"#ffe6a8", loin:"#8fa8c9", moyen:"#5c749b", pres:"#374a68", detail:"#f2f7ff" }
    ],
    pratique: [
      { ciel:["#eaf0f3","#bacdd7"], astre:"#f2e6c4", loin:"#93aab6", moyen:"#63808f", pres:"#3f5a69", detail:"#f4f9fb" },
      { ciel:["#eef2ef","#c3d2c8"], astre:"#f0e8c8", loin:"#9db4a6", moyen:"#688271", pres:"#3f5749", detail:"#f6faf7" },
      { ciel:["#fbeee2","#e0bfa1"], astre:"#f0a05c", loin:"#bd9a80", moyen:"#8a6a55", pres:"#4f3c31", detail:"#fff4e9" }
    ]
  };

  /* ------------------------------------------------------------- PRIMITIVES */
  function onde(y, amp, phase, w, h) {
    const n = 4, dx = w / n;
    let d = `M0 ${(y + Math.sin(phase) * amp).toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const x1 = (i + 1) * dx;
      const y0 = y + Math.sin(phase + i * 1.7) * amp;
      const y1 = y + Math.sin(phase + (i + 1) * 1.7) * amp;
      d += ` C ${(i * dx + dx / 3).toFixed(1)} ${y0.toFixed(1)}, ${(x1 - dx / 3).toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d + ` L ${w} ${h} L 0 ${h} Z`;
  }
  const pic = (x, base, haut, larg) =>
    `M${(x - larg).toFixed(1)} ${base.toFixed(1)} L${x.toFixed(1)} ${(base - haut).toFixed(1)} L${(x + larg).toFixed(1)} ${base.toFixed(1)} Z`;

  function oiseaux(r, w, h, n) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = 30 + r() * (w - 90), y = 18 + r() * (h * .28), t = 3 + r() * 3;
      s += `<path d="M${x} ${y} q${t} ${-t} ${t * 2} 0 q${t} ${-t} ${t * 2} 0"/>`;
    }
    return `<g fill="none" stroke="currentColor" stroke-width="1.4" opacity=".35"
      stroke-linecap="round">${s}</g>`;
  }
  function astre(p, r, w, h) {
    const gauche = r() < .5;
    const cx = gauche ? 42 + r() * 26 : w - 42 - r() * 26;
    const cy = 26 + r() * 16, rad = 11 + r() * 7;
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}"
      fill="${p.astre}" opacity=".92"/>`;
  }
  function cocotier(x, sol, sens, p, ech = 1) {
    const t = 46 * ech;
    return `<g transform="translate(${x} ${sol})">
      <path d="M0 0 q${-6 * sens * ech} ${-t * .6} ${8 * sens * ech} ${-t}"
        fill="none" stroke="${p.detail}" stroke-width="${3.4 * ech}" stroke-linecap="round"/>
      <g transform="translate(${8 * sens * ech} ${-t})" fill="#2f8f5b">
        <path d="M0 0 q-22 -10 -30 2 q16 -4 30 2z"/><path d="M0 0 q22 -10 30 2 q-16 -4 -30 2z"/>
        <path d="M0 0 q-6 -22 -22 -24 q12 10 20 26z"/><path d="M0 0 q10 -20 26 -20 q-14 8 -22 24z"/>
        <circle cx="0" cy="2" r="3" fill="${p.astre}"/>
      </g></g>`;
  }

  /* ------------------------------------------------ SCÈNES PAR CATÉGORIE */
  const SCENES = {
    nature(p, r, w, h, v) {
      /* variante 1 : le plan d'eau — lac de cratère, retenue, mangrove.
         Le cratère se lit à la double couronne autour de l'eau. */
      if (v === 1) {
        const cx = w * .5 + (r() - .5) * 30, cy = h * .66;
        return `${astre(p, r, w, h)}
          <path d="${onde(h * .46, 5, r() * 6, w, h)}" fill="${p.loin}" opacity=".55"/>
          <path d="M${(cx - 130).toFixed(0)} ${(cy + 26).toFixed(0)}
                   q40 -62 130 -62 q90 0 130 62z" fill="${p.moyen}" opacity=".95"/>
          <ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="86" ry="30" fill="${p.pres}" opacity=".55"/>
          <ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="76" ry="25" fill="#2f8f5b"/>
          <ellipse cx="${cx.toFixed(0)}" cy="${(cy - 2).toFixed(0)}" rx="60" ry="18"
            fill="${p.astre}" opacity=".22"/>
          <path d="${onde(h * .90, 3, 3 + r() * 3, w, h)}" fill="${p.detail}" opacity=".9"/>
          <g color="${p.pres}">${oiseaux(r, w, h, 3)}</g>`;
      }
      /* variante 3 : la chute d'eau qui tombe de la falaise jusqu'à la mer */
      if (v === 3) {
        const fx = w * .58 + (r() - .5) * 40, mer = h * .78;
        return `${astre(p, r, w, h)}
          <path d="${onde(h * .52, 4, r() * 6, w, h)}" fill="${p.loin}" opacity=".5"/>
          <path d="M0 ${h} L0 ${(h * .34).toFixed(0)} q${(fx * .5).toFixed(0)} -14 ${fx.toFixed(0)} 6
                   L${fx.toFixed(0)} ${mer.toFixed(0)} L0 ${mer.toFixed(0)} Z" fill="${p.moyen}"/>
          <path d="M0 ${(h * .40).toFixed(0)} q${(fx * .5).toFixed(0)} -14 ${fx.toFixed(0)} 8
                   L${fx.toFixed(0)} ${(h * .52).toFixed(0)} q-${(fx * .5).toFixed(0)} -8 -${fx.toFixed(0)} 4 Z"
                fill="${p.pres}" opacity=".65"/>
          <g fill="#eaf7fb" opacity=".92">
            <path d="M${(fx - 13).toFixed(0)} ${(h * .40).toFixed(0)} h26 l6 ${(mer - h * .40).toFixed(0)} h-38z"/>
          </g>
          <g fill="#ffffff" opacity=".55">
            <ellipse cx="${fx.toFixed(0)}" cy="${mer.toFixed(0)}" rx="26" ry="7"/></g>
          <path d="${onde(mer, 3, 3 + r() * 3, w, h)}" fill="${p.detail}" opacity=".85"/>
          <g color="${p.pres}">${oiseaux(r, w, h, 2)}</g>`;
      }
      const sol = h * .82;
      const n = 2 + Math.floor(r() * 2);
      let monts = "";
      for (let i = 0; i < n; i++) {
        const x = 60 + (i * (w - 130)) / Math.max(1, n - 1) + (r() - .5) * 26;
        const haut = h * (.30 + r() * .26), larg = 42 + r() * 28;
        monts += `<path d="${pic(x, sol + 6, haut, larg)}" fill="${i % 2 ? p.moyen : p.pres}"
          opacity="${(0.82 + i * .06).toFixed(2)}"/>`;
        monts += `<path d="M${x} ${(sol + 6 - haut).toFixed(1)} L${(x + larg).toFixed(1)} ${(sol + 6).toFixed(1)} L${(x + larg * .25).toFixed(1)} ${(sol + 6).toFixed(1)} Z"
          fill="#000" opacity=".10"/>`;
      }
      return `${astre(p, r, w, h)}
        <path d="${onde(h * .58, 5, r() * 6, w, h)}" fill="${p.loin}" opacity=".5"/>
        ${monts}
        <path d="${onde(sol + 4, 3, 2 + r() * 4, w, h)}" fill="${p.detail}" opacity=".9"/>
        ${v === 2 ? `<g fill="${p.detail}" opacity=".55">
            <path d="M18 ${h} q3 -18 -3 -30 q10 6 8 18 q6 -10 14 -12 q-8 8 -10 24z"/></g>`
          : `<g fill="${p.moyen}" opacity=".5"><ellipse cx="${(w - 34).toFixed(0)}" cy="${(h - 8).toFixed(0)}" rx="26" ry="9"/></g>`}
        <g color="${p.pres}">${oiseaux(r, w, h, 2 + Math.floor(r() * 2))}</g>`;
    },

    plage(p, r, w, h, v) {
      /* variante 2 : le banc de sable au milieu du lagon — pas de plage, pas
         d'arbre, juste un croissant clair posé sur l'eau. */
      if (v === 2) {
        const cx = w * .5 + (r() - .5) * 40, cy = h * .62;
        return `${astre(p, r, w, h)}
          <path d="${onde(h * .34, 2, r() * 6, w, h)}" fill="${p.loin}" opacity=".8"/>
          <path d="${onde(h * .50, 3, 2 + r() * 4, w, h)}" fill="${p.moyen}" opacity=".9"/>
          <g>
            <ellipse cx="${cx.toFixed(0)}" cy="${(cy + 4).toFixed(0)}" rx="86" ry="17"
              fill="${p.loin}" opacity=".5"/>
            <path d="M${(cx - 74).toFixed(0)} ${cy.toFixed(0)}
                     q74 -26 148 0 q-74 16 -148 0z" fill="${p.pres}"/>
            <path d="M${(cx - 52) .toFixed(0)} ${(cy - 2).toFixed(0)} q52 -14 104 0"
              fill="none" stroke="#fff" stroke-width="2" opacity=".45"/>
          </g>
          <path d="${onde(h * .84, 4, 4 + r() * 3, w, h)}" fill="${p.moyen}" opacity=".75"/>
          <g stroke="#fff" stroke-width="1.5" opacity=".35" fill="none" stroke-linecap="round">
            <path d="M30 ${(h * .92).toFixed(0)} q14 -6 28 0 M${(w - 74).toFixed(0)} ${(h * .90).toFixed(0)} q14 -6 28 0"/></g>
          <g color="${p.detail}">${oiseaux(r, w, h, 3)}</g>`;
      }
      const horizon = h * .40 + r() * 8;
      const sable = h * .70 + r() * 6;
      const ilot = r() < .5
        ? `<path d="M${(w * .62).toFixed(0)} ${horizon.toFixed(1)} q14 -12 28 0z" fill="${p.moyen}" opacity=".65"/>` : "";
      return `${astre(p, r, w, h)}
        ${ilot}
        <path d="${onde(horizon, 2, r() * 6, w, h)}" fill="${p.loin}" opacity=".85"/>
        <path d="${onde(horizon + 16, 3, 1 + r() * 5, w, h)}" fill="${p.moyen}" opacity=".9"/>
        <path d="${onde(sable, 4, 3 + r() * 4, w, h)}" fill="${p.pres}"/>
        <g stroke="${p.detail}" stroke-width="1.5" opacity=".25" fill="none" stroke-linecap="round">
          <path d="M20 ${(sable + 14).toFixed(0)} q16 -6 32 0 M120 ${(sable + 22).toFixed(0)} q16 -6 32 0
                   M230 ${(sable + 12).toFixed(0)} q16 -6 32 0"/></g>
        ${v === 0 ? cocotier(52 + r() * 20, h - 4, -1, p, .95) : ""}
        ${v === 1 ? cocotier(w - 60 - r() * 20, h - 4, 1, p, .85) + cocotier(46, h - 2, -1, p, .65) : ""}
        <g color="${p.detail}">${oiseaux(r, w, h, 2)}</g>`;
    },

    mer(p, r, w, h, v) {
      const horizon = h * .34;
      const cx = 96 + r() * 110;
      const sujets = [
        /* queue de baleine */
        `<g fill="${p.pres}"><path d="M${cx} ${h * .66} q18 -8 28 -30 q5 18 -7 28 q12 -3 19 -14 q-3 24 -25 24 q-18 0 -15 -8z"/></g>`,
        /* aileron + souffle */
        `<g fill="${p.pres}"><path d="M${cx} ${h * .64} q6 -26 22 -32 q-4 20 -6 32z"/>
          <ellipse cx="${cx + 6}" cy="${h * .66}" rx="34" ry="6" opacity=".5"/></g>
         <g stroke="${p.detail}" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round">
          <path d="M${cx + 30} ${h * .5} q4 -14 12 -18 M${cx + 34} ${h * .5} q10 -10 20 -10"/></g>`,
        /* petite barque */
        `<g fill="${p.pres}"><path d="M${cx - 30} ${h * .60} h60 l-10 12 h-40z"/>
          <path d="M${cx} ${h * .60} v-26 l20 22z" fill="${p.detail}" opacity=".9"/></g>`
      ];
      return `${astre(p, r, w, h)}
        <path d="${onde(horizon, 2, r() * 6, w, h)}" fill="${p.loin}" opacity=".55"/>
        <path d="${onde(h * .52, 4, 2 + r() * 5, w, h)}" fill="${p.moyen}" opacity=".85"/>
        ${sujets[v]}
        <path d="${onde(h * .76, 5, 4 + r() * 4, w, h)}" fill="${p.pres}"/>
        <g stroke="${p.detail}" stroke-width="1.6" opacity=".35" fill="none" stroke-linecap="round">
          <path d="M26 ${(h * .88).toFixed(0)} q12 -6 24 0 M${(w - 70).toFixed(0)} ${(h * .84).toFixed(0)} q12 -6 24 0"/></g>`;
    },

    culture(p, r, w, h, v) {
      const cx = w * .5 + (r() - .5) * 70;
      const sol = h * .86;
      const bati = v === 0
        ? `<rect x="${cx - 46}" y="${h * .52}" width="92" height="${sol - h * .52}" rx="4" fill="${p.pres}"/>
           <path d="M${cx - 30} ${h * .52} a30 26 0 0 1 60 0z" fill="${p.pres}"/>
           <circle cx="${cx}" cy="${h * .24}" r="5" fill="${p.astre}"/>
           <rect x="${cx + 42}" y="${h * .34}" width="12" height="${sol - h * .34}" rx="3" fill="${p.moyen}"/>
           <circle cx="${cx + 48}" cy="${h * .32}" r="6.5" fill="${p.moyen}"/>`
        : v === 1
        /* la fête : une rangée de silhouettes, bras levés — debaa, mbiwi,
           manzaraka. Des arcades toutes seules ressemblaient à des pierres. */
        ? `<g fill="${p.pres}">
             ${[0, 1, 2, 3].map(i => {
               const x = cx - 60 + i * 40, ht = 34 + (i % 2) * 8;
               return `<g opacity="${(1 - i * .06).toFixed(2)}">
                 <path d="M${x - 12} ${sol} v-${ht} a12 ${ht * .45} 0 0 1 24 0 v${ht}z"/>
                 <circle cx="${x}" cy="${sol - ht - 9}" r="8"/>
                 <path d="M${x - 11} ${sol - ht + 4} q-14 -10 -18 -24" fill="none"
                   stroke="${p.pres}" stroke-width="4.5" stroke-linecap="round"/>
                 <path d="M${x + 11} ${sol - ht + 4} q14 -10 18 -24" fill="none"
                   stroke="${p.pres}" stroke-width="4.5" stroke-linecap="round"/>
               </g>`;
             }).join("")}
           </g>`
        : `<g fill="${p.pres}">
             <path d="M${cx - 40} ${sol} v-46 h80 v46z"/>
             <path d="M${cx - 52} ${h * .40} h104 l-12 14 h-80z" fill="${p.moyen}"/>
           </g>`;
      return `${astre(p, r, w, h)}
        <path d="${onde(h * .70, 3, r() * 6, w, h)}" fill="${p.loin}" opacity=".45"/>
        ${bati}
        <g fill="${p.detail}" opacity=".9">
          <path d="M${cx - 24} ${sol} v-20 a9 9 0 0 1 18 0 v20z"/>
          <path d="M${cx + 8} ${sol} v-20 a9 9 0 0 1 18 0 v20z"/></g>
        <path d="${onde(sol + 2, 2, 3, w, h)}" fill="${p.moyen}" opacity=".9"/>
        <g stroke="${p.moyen}" stroke-width="1.4" opacity=".45" fill="none">
          <path d="M16 26 l6 6 -6 6 -6 -6z M${(w - 26).toFixed(0)} 64 l5 5 -5 5 -5 -5z"/></g>`;
    },

    food(p, r, w, h, v) {
      const cx = w / 2 + (r() - .5) * 46, plan = h * .70;
      const sujet = v === 0
        ? `<path d="M${cx - 48} ${h * .50} h96 a48 34 0 0 1 -96 0z" fill="${p.moyen}"/>
           <ellipse cx="${cx}" cy="${h * .50}" rx="48" ry="7" fill="${p.pres}"/>`
        : v === 1
        ? `<g fill="${p.pres}"><rect x="${cx - 52}" y="${h * .52}" width="104" height="12" rx="5"/></g>
           <g stroke="${p.detail}" stroke-width="3.4" stroke-linecap="round">
             ${[0, 1, 2].map(i => `<path d="M${cx - 34 + i * 34} ${h * .52} v-26"/>`).join("")}
           </g>
           <g fill="${p.astre}">${[0, 1, 2].map(i =>
             `<circle cx="${cx - 34 + i * 34}" cy="${h * .34}" r="7"/>
              <circle cx="${cx - 34 + i * 34}" cy="${h * .46}" r="7"/>`).join("")}</g>`
        : `<g fill="${p.moyen}"><circle cx="${cx - 22}" cy="${h * .52}" r="18"/>
             <circle cx="${cx + 14}" cy="${h * .50}" r="22"/></g>
           <g fill="${p.pres}"><path d="M${cx - 22} ${h * .34} q6 -10 -2 -16 M${cx + 14} ${h * .28} q7 -10 -2 -16"
             fill="none" stroke="${p.pres}" stroke-width="2.4" stroke-linecap="round"/></g>`;
      return `<path d="${onde(h * .52, 3, r() * 6, w, h)}" fill="${p.loin}" opacity=".35"/>
        ${sujet}
        <rect x="0" y="${plan}" width="${w}" height="${h - plan}" fill="${p.pres}" opacity=".9"/>
        <g fill="${p.astre}" opacity=".85">
          <circle cx="${(cx - 76).toFixed(0)}" cy="${(plan + 16).toFixed(0)}" r="6"/>
          <circle cx="${(cx + 82).toFixed(0)}" cy="${(plan + 12).toFixed(0)}" r="5"/>
          <circle cx="${(cx + 62).toFixed(0)}" cy="${(plan + 24).toFixed(0)}" r="4"/></g>`;
    },

    famille(p, r, w, h, v) {
      const cx = 110 + r() * 80, sol = h * .84;
      const sujet = v === 2
        ? `<g fill="${p.pres}">
             <ellipse cx="${cx}" cy="${sol - 16}" rx="30" ry="20"/>
             <circle cx="${cx + 30}" cy="${sol - 24}" r="8"/>
             <path d="M${cx - 26} ${sol - 4} l-10 10 M${cx + 18} ${sol - 2} l10 10"
               stroke="${p.pres}" stroke-width="6" stroke-linecap="round"/></g>
           <g fill="${p.detail}" opacity=".5"><ellipse cx="${cx}" cy="${sol - 16}" rx="18" ry="11"/></g>`
        : `<g fill="${p.pres}">
             <circle cx="${cx}" cy="${sol - 30}" r="15"/>
             <path d="M${cx - 13} ${sol - 36} l-6 -12 12 4z M${cx + 13} ${sol - 36} l6 -12 -12 4z"/>
             <path d="M${cx - 10} ${sol - 16} q10 16 20 0 q10 18 -10 22 q-20 -4 -10 -22z"/>
             <circle cx="${cx + 36}" cy="${sol - 20}" r="10"/>
             <path d="M${cx + 28} ${sol - 25} l-4 -9 9 3z M${cx + 44} ${sol - 25} l4 -9 -9 3z"/></g>
           <g fill="${p.detail}"><circle cx="${cx - 5}" cy="${sol - 32}" r="2.4"/>
             <circle cx="${cx + 5}" cy="${sol - 32}" r="2.4"/></g>`;
      return `${astre(p, r, w, h)}
        <path d="${onde(h * .56, 4, r() * 6, w, h)}" fill="${p.loin}" opacity=".5"/>
        <path d="${onde(h * .74, 3, 2 + r() * 4, w, h)}" fill="${p.moyen}" opacity=".75"/>
        ${sujet}
        <path d="${onde(sol + 8, 2, 4, w, h)}" fill="${p.pres}" opacity=".85"/>`;
    },

    pratique(p, r, w, h, v) {
      const cx = w / 2, ligne = h * .68;
      const sujet = v === 1
        ? `<g fill="${p.pres}"><path d="M${cx - 66} ${ligne} h132 l-18 22 h-96z"/>
             <rect x="${cx - 38}" y="${ligne - 30}" width="76" height="30" rx="4"/></g>
           <g fill="${p.detail}">${[0, 1, 2].map(i =>
             `<rect x="${cx - 30 + i * 24}" y="${ligne - 24}" width="17" height="13" rx="2"/>`).join("")}</g>`
        : v === 2
        ? `<g stroke="${p.pres}" stroke-width="7" stroke-linecap="round" fill="none">
             <path d="M${cx} ${h} v-${h * .42}"/></g>
           <g fill="${p.pres}">
             <path d="M${cx} ${h * .40} h64 l-12 12 h-52z"/>
             <path d="M${cx} ${h * .56} h-58 l12 12 h46z" opacity=".8"/></g>`
        : `<g fill="${p.pres}">
             <path d="M0 ${h * .78} q${w * .5} -22 ${w} 0 v${h} h-${w}z"/></g>
           <g stroke="${p.detail}" stroke-width="3.4" stroke-dasharray="14 12" opacity=".8" fill="none">
             <path d="M0 ${h * .89} q${w * .5} -22 ${w} 0"/></g>`;
      return `${astre(p, r, w, h)}
        <path d="${onde(h * .48, 3, r() * 6, w, h)}" fill="${p.loin}" opacity=".45"/>
        <path d="${onde(h * .60, 3, 2 + r() * 4, w, h)}" fill="${p.moyen}" opacity=".6"/>
        ${sujet}`;
    }
  };

  /* ----------------------------------------------------- CHOIX DE LA SCÈNE
     La variante est d'abord choisie sur le SENS de la fiche (une queue de
     baleine pour les baleines, une terre ocre pour les padzas), et seulement
     à défaut sur le hachage de l'identifiant.                               */
  /* [expression, variante de scène, palette imposée (facultatif)] */
  const INDICES = {
    nature:   [[/lac|dziani|barrage|retenue|mangrove/i, 1], [/cascade|chute/i, 3],
               [/padza|terre rouge/i, 2, 2], [/mont|pic|sommet|sentier|randonn|forêt|foret/i, 0]],
    plage:    [[/îlot|ilot|sable blanc|banc de sable/i, 2], [/badamiers|baie|kite|digue/i, 1],
               [/plage|mtsanga|crique/i, 0]],
    mer:      [[/baleine|dauphin|cétacé|cetace/i, 0], [/plong|snorkel|masque|passe|récif|recif/i, 1],
               [/pêche|peche|bateau|tour|kayak|paddle|kite/i, 2]],
    culture:  [[/mosqu|musée|musee/i, 0], [/march|distiller|ylang/i, 2],
               [/danse|mariage|poter|debaa|manzaraka/i, 1]],
    food:     [[/brochett|voul|grill/i, 1], [/mkatra|thé au|galette|petit-déj/i, 2],
               [/mataba|poulet|atelier|cuisine/i, 0]],
    famille:  [[/maki|lémur|lemur/i, 0], [/tortue/i, 2], [/enfant|famille/i, 1]],
    pratique: [[/barge|bateau|traversée|traversee/i, 1], [/taxi|voiture|route|circuler/i, 0], [/./, 2]]
  };
  /* La SCÈNE vient du sens de la fiche ; la PALETTE vient de son identifiant.
     Sans cette séparation, toutes les randonnées auraient exactement la même
     couleur — c'est ce qui rendait les cartes indiscernables. */
  function variante(famille, indice, id) {
    let v = null, pal = null;
    for (const [re, sc, p] of (INDICES[famille] || [])) {
      if (indice && re.test(indice)) { v = sc; if (p !== undefined) pal = p; break; }
    }
    if (v === null) v = graine(id) % 3;
    if (pal === null) pal = graine(id + "·palette") % PAL[famille].length;
    return { v, pal };
  }

  /* -------------------------------------------------------------- VIGNETTE */
  function vignette(id, categorie, opt = {}) {
    const w = 320, h = opt.haut ? 160 : 140;
    const famille = PAL[categorie] ? categorie : "pratique";
    const r = dé(graine(id + "|" + famille));
    const { v, pal } = variante(famille, opt.indice, id);
    const p = PAL[famille][pal];
    const gid = "g" + graine(id + famille).toString(36);
    const scene = SCENES[famille](p, r, w, h, v);
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"
      aria-hidden="true" focusable="false" role="presentation">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.ciel[0]}"/><stop offset="1" stop-color="${p.ciel[1]}"/>
      </linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#${gid})"/>
      ${scene}
    </svg>`;
  }

  /* ------------------------------------------------------- COURBE DE MARÉE
     `profil` (facultatif) est la vraie courbe calculée par le moteur
     harmonique : [{t: heures locales, h: mètres}]. À défaut, on retombe sur
     une interpolation en cosinus entre les étales. */
  function courbeMaree(evts, heureCourante, mareeRequise, profil) {
    if (!evts || !evts.length) return "";
    const W = 320, H = 118, mg = 16, hautCourbe = 30, base = 62, amp = 26;
    const x = t => mg + (t / 24) * (W - mg * 2);

    let y;
    if (profil && profil.length) {
      const hs = profil.map(p => p.h);
      const hMin = Math.min(...hs), hMax = Math.max(...hs);
      const etendue = Math.max(0.4, hMax - hMin);
      y = t => {
        const i = Math.min(profil.length - 1, Math.max(0, Math.round(t / 24 * (profil.length - 1))));
        return base + amp - ((profil[i].h - hMin) / etendue) * (2 * amp);
      };
    } else {
      y = t => base - hauteur(t, evts) * amp;
    }

    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * 24;
      pts.push([x(t), y(t)]);
    }
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const aire = d + ` L ${x(24).toFixed(1)} ${base + amp + 8} L ${x(0).toFixed(1)} ${base + amp + 8} Z`;

    const fenetres = mareeRequise ? evts.filter(e => e.type === mareeRequise).map(e =>
      `<rect x="${x(Math.max(0, e.brut - 1.5)).toFixed(1)}" y="${hautCourbe - 6}"
        width="${(x(Math.min(24, e.brut + 1.5)) - x(Math.max(0, e.brut - 1.5))).toFixed(1)}"
        height="${base + amp + 14 - hautCourbe}" fill="var(--vert)" opacity=".14" rx="5"/>`).join("") : "";

    const reperes = evts.map(e => {
      const px = x(e.brut), haute = e.type === "haute";
      const py = y(e.brut);
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.4"
          fill="${haute ? "var(--lagon-500)" : "var(--ylang)"}" stroke="var(--surface)" stroke-width="1.5"/>
        <text x="${px.toFixed(1)}" y="${(py + (haute ? -10 : 16)).toFixed(1)}" text-anchor="middle"
          font-size="10" font-weight="700" fill="${haute ? "var(--txt-haute)" : "var(--txt-basse)"}"
          >${e.heure.replace(" h ", ":")}</text>
        ${e.hauteur != null ? `<text x="${px.toFixed(1)}" y="${(py + (haute ? -21 : 27)).toFixed(1)}"
          text-anchor="middle" font-size="8.5" fill="var(--muted)">${e.hauteur.toFixed(2)} m</text>` : ""}`;
    }).join("");

    const axe = [0, 6, 12, 18, 24].map(t =>
      `<line x1="${x(t).toFixed(1)}" y1="${base + amp + 8}" x2="${x(t).toFixed(1)}" y2="${base + amp + 12}"
         stroke="var(--line-fort)" stroke-width="1"/>
       <text x="${x(t).toFixed(1)}" y="${H - 3}" text-anchor="middle" font-size="9"
         fill="var(--muted)">${t} h</text>`).join("");

    const xn = x(heureCourante), yn = y(heureCourante);

    return `<svg class="maree-graph" viewBox="0 0 ${W} ${H}" role="img"
      aria-label="Courbe estimée de la marée sur les 24 heures">
      ${fenetres}
      <path d="${aire}" fill="var(--lagon-500)" opacity=".10"/>
      <line x1="${mg}" y1="${base}" x2="${W - mg}" y2="${base}" stroke="var(--line-fort)"
        stroke-width="1" stroke-dasharray="3 5" opacity=".6"/>
      <path d="${d}" fill="none" stroke="var(--lagon-500)" stroke-width="2.6"
        stroke-linecap="round" stroke-linejoin="round"/>
      ${reperes}
      <line x1="${xn.toFixed(1)}" y1="${hautCourbe - 6}" x2="${xn.toFixed(1)}" y2="${base + amp + 8}"
        stroke="var(--terre)" stroke-width="1.6" stroke-dasharray="2 3"/>
      <circle cx="${xn.toFixed(1)}" cy="${yn.toFixed(1)}" r="5" fill="var(--terre)"
        stroke="var(--surface)" stroke-width="2.2"/>
      <text x="${xn.toFixed(1)}" y="${hautCourbe - 11}" text-anchor="middle" font-size="9.5"
        font-weight="700" fill="var(--terre)">maintenant</text>
      <line x1="${mg}" y1="${base + amp + 8}" x2="${W - mg}" y2="${base + amp + 8}"
        stroke="var(--line-fort)" stroke-width="1"/>
      ${axe}
    </svg>`;
  }

  /* hauteur relative (-1 → +1), interpolée en cosinus entre deux étales */
  function hauteur(t, evts) {
    const demi = 6.2;
    let av = null, ap = null;
    for (const e of evts) { if (e.brut <= t) av = e; if (e.brut > t && !ap) ap = e; }
    if (!av) av = { brut: (ap ? ap.brut : 0) - demi, type: ap && ap.type === "haute" ? "basse" : "haute" };
    if (!ap) ap = { brut: av.brut + demi, type: av.type === "haute" ? "basse" : "haute" };
    const frac = Math.min(1, Math.max(0, (t - av.brut) / ((ap.brut - av.brut) || 1)));
    return (av.type === "haute" ? 1 : -1) * Math.cos(Math.PI * frac);
  }

  /* ------------------------------------------------------- BANDEAU SAISONS */
  const M12 = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const MOISN = ["janvier","février","mars","avril","mai","juin","juillet","août",
                 "septembre","octobre","novembre","décembre"];
  function saison(mois, moisCourant) {
    const toute = !mois || !mois.length;
    const label = toute ? "Intéressant toute l'année"
      : "Mois recommandés : " + mois.map(m => MOISN[m - 1]).join(", ");
    return `<div class="saison" role="img" aria-label="${label}">
      ${M12.map((l, i) => `<span class="saison__m"
        data-on="${!toute && mois.includes(i + 1) ? "oui" : "non"}"
        data-now="${i + 1 === moisCourant ? "oui" : "non"}">${l}</span>`).join("")}
    </div>`;
  }

  /* ---------------------------------------------------------------- L'ÎLE
     Silhouette volontairement schématique : motif décoratif, jamais un support
     de navigation. Les fiches renvoient vers un vrai plan.                   */
  function ile(cls = "") {
    return `<svg viewBox="0 0 200 260" class="${cls}" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M96 18c10 8 20 20 20 34 8 8 14 14 12 26 6 10 14 16 10 28 4 8 8 14 6 24
        4 12 6 22 0 32-4 12-12 20-24 28-8 8-16 14-24 12-10-4-18-12-16-24-10-8-16-16-12-28
        -8-8-12-16-8-28-8-8-12-18-6-28-6-10-8-20 0-30 4-12 12-22 22-30 6-8 12-14 20-16z"/>
      <ellipse cx="162" cy="112" rx="17" ry="22" fill="currentColor"/>
      <circle cx="176" cy="140" r="6" fill="currentColor"/>
    </svg>`;
  }

  /* ------------------------------------------------------------------ LOGO */
  function logo() {
    return `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs><linearGradient id="lgk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3ec2ce"/><stop offset="1" stop-color="#0a626c"/>
      </linearGradient></defs>
      <rect width="48" height="48" rx="13" fill="url(#lgk)"/>
      <circle cx="24" cy="27" r="16" fill="none" stroke="#a9f0f4" stroke-width="1.5" opacity=".45"/>
      <path fill="#f7f1e3" d="M19 11c3 2 5.5 5 5.5 8.5 3 3 5 6 4 9-1 4-4 7-8 8-3 1-6-1-6-5
        -3-3-4-6-2-9-2-3-2-6 1-8 1-2 3-3.5 5.5-3.5z"/>
      <circle cx="34" cy="19" r="5" fill="#f7f1e3"/>
      <circle cx="34" cy="19" r="2.1" fill="#e8a317"/>
    </svg>`;
  }

  return { icone, vignette, courbeMaree, saison, ile, logo, graine };
})();
