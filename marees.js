/* =============================================================================
   MARÉES À MAYOTTE — prédiction harmonique embarquée, sans réseau
   -----------------------------------------------------------------------------
   Ce module ne devine plus : il calcule.

   Constantes harmoniques du marégraphe de DZAOUDZI (-12,782 / 45,258), station
   GLOSS n° 96, série ouverte le 16 octobre 1963. Source : TICON-3
   (Hart-Davis, Dettmering & Seitz, 2022), licence CC-BY-4.0.
   Amplitudes en centimètres, G = retard de phase de Greenwich en degrés (UTC).

   Niveaux de référence : Shom, Références Altimétriques Maritimes,
   Licence Ouverte Etalab 2.0. Les hauteurs sont comptées en mètres au-dessus
   du ZÉRO HYDROGRAPHIQUE, qui se situe 1,779 m sous le zéro terrestre.

   CONTRÔLE (voir autotest en bas de fichier) — 1er juillet 2026 :
     calculé  PM 05:10 3,01 · BM 11:04 0,88 · PM 17:19 3,49 · BM 23:40 0,74
     annuaire PM 05:10 3,03 · BM 10:59 0,85 · PM 17:15 3,47 · BM 23:38 0,75
   soit ± 5 min et ± 3 cm. C'est une PRÉDICTION ASTRONOMIQUE : elle ignore la
   météo, et une dépression ou un vent d'afflux peut faire monter l'eau au-delà.
   Elle ne remplace pas l'annuaire officiel du Shom (maree.shom.fr).

   Le marégraphe de Dzaoudzi n'émet plus depuis le 14 décembre 2024 à 6 h 50 UTC,
   pendant le passage de Chido : aucune hauteur observée en temps réel n'existe
   pour Mayotte. Raison de plus pour calculer à bord.
   ========================================================================== */

const MAREES = (() => {

  const Z0 = 2.13;            // niveau moyen, en m au-dessus du zéro hydrographique
  const FUSEAU = 3;           // UTC+3 toute l'année, jamais d'heure d'été
  const ZH_VERS_TERRESTRE = -1.779;

  /* Repères du Shom (RAM) pour Dzaoudzi, en m/ZH — servent à qualifier la marée */
  const RAM = {
    PHMA: 4.30, PMVE: 3.70, PMME: 2.80, NM: 2.13,
    BMME: 1.45, BMVE: 0.50, PBMA: 0.08
  };

  /* [nom, amplitude cm, phase G °, nombres de Doodson, décalage °, groupe nodal] */
  const CST = [
    ["M2"  ,104.519, 27.176,[ 2, 0, 0, 0, 0, 0],   0,"m2"],
    ["S2"  , 53.564, 66.882,[ 2, 2,-2, 0, 0, 0],   0,"un"],
    ["N2"  , 18.992,  5.708,[ 2,-1, 0, 1, 0, 0],   0,"m2"],
    ["K2"  , 14.813, 62.840,[ 2, 2, 0, 0, 0, 0],   0,"k2"],
    ["K1"  , 13.842,  4.166,[ 1, 1, 0, 0, 0, 0], -90,"k1"],
    ["O1"  ,  8.798,  6.530,[ 1,-1, 0, 0, 0, 0],  90,"o1"],
    ["P1"  ,  4.224,  2.829,[ 1, 1,-2, 0, 0, 0],  90,"un"],
    ["Q1"  ,  2.066,354.251,[ 1,-2, 0, 1, 0, 0],  90,"o1"],
    ["NU2" ,  3.989,  7.920,[ 2,-1, 2,-1, 0, 0],   0,"m2"],
    ["L2"  ,  3.420, 43.831,[ 2, 1, 0,-1, 0, 0], 180,"m2"],
    ["T2"  ,  3.162, 64.327,[ 2, 2,-3, 0, 0, 1],   0,"un"],
    ["2N2" ,  1.894,329.522,[ 2,-2, 0, 2, 0, 0],   0,"m2"],
    ["MU2" ,  1.825, 12.860,[ 2,-2, 2, 0, 0, 0],   0,"m2"],
    ["LDA2",  1.112, 50.073,[ 2, 1,-2, 1, 0, 0], 180,"m2"],
    ["R2"  ,  0.604, 66.836,[ 2, 2,-1, 0, 0,-1], 180,"un"],
    ["S1"  ,  1.208,115.755,[ 1, 1,-1, 0, 0, 0],   0,"un"],
    ["J1"  ,  0.884, 11.173,[ 1, 2, 0,-1, 0, 0], -90,"j1"],
    ["OO1" ,  0.717, 15.164,[ 1, 3, 0, 0, 0, 0], -90,"oo1"],
    ["2Q1" ,  0.332,330.704,[ 1,-3, 0, 2, 0, 0],  90,"o1"],
    ["M4"  ,  0.848,238.786,[ 4, 0, 0, 0, 0, 0],   0,"m4"],
    ["MS4" ,  1.163,295.225,[ 4, 2,-2, 0, 0, 0],   0,"m2"],
    ["MN4" ,  0.163,235.251,[ 4,-1, 0, 1, 0, 0],   0,"m4"],
    ["M6"  ,  0.112,119.823,[ 6, 0, 0, 0, 0, 0],   0,"m6"],
    ["MM"  ,  0.967,  4.999,[ 0, 1, 0,-1, 0, 0],   0,"mm"],
    ["MF"  ,  1.215,  3.363,[ 0, 2, 0, 0, 0, 0],   0,"mf"],
    ["MSF" ,  0.409,199.957,[ 0, 2,-2, 0, 0, 0],   0,"un"],
    ["SA"  ,  5.801,358.678,[ 0, 0, 1, 0, 0,-1],   0,"un"],
    ["SSA" ,  2.108,116.124,[ 0, 0, 2, 0, 0, 0],   0,"un"]
  ];

  const DEG = Math.PI / 180;
  const mod360 = x => ((x % 360) + 360) % 360;

  function astro(date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const T = (jd - 2451545.0) / 36525.0;
    return {
      s:  mod360(218.3164477 + 481267.88123421 * T),  // longitude moyenne de la Lune
      h:  mod360(280.46646   +  36000.76983    * T),  // longitude moyenne du Soleil
      p:  mod360( 83.3532465 +   4069.0137287  * T),  // périgée lunaire
      N:  mod360(125.0445479 -   1934.1362891  * T),  // nœud ascendant
      p1: mod360(282.9384    +      1.7195     * T)   // périgée solaire
    };
  }

  /* corrections nodales : f sur l'amplitude, u sur la phase */
  function nodal(groupe, N) {
    const c = Math.cos(N * DEG), s = Math.sin(N * DEG);
    const fm = 1 - 0.037 * c, um = -2.14 * s;
    switch (groupe) {
      case "un":  return [1, 0];
      case "m2":  return [fm, um];
      case "k2":  return [1.024 + 0.286 * c, -17.74 * s];
      case "k1":  return [1.006 + 0.115 * c,  -8.86 * s];
      case "o1":  return [1.009 + 0.187 * c,  10.80 * s];
      case "j1":  return [1.013 + 0.168 * c,  -8.86 * s];
      case "oo1": return [1.029 + 0.416 * c, -17.74 * s];
      case "m4":  return [fm * fm, 2 * um];
      case "m6":  return [fm * fm * fm, 3 * um];
      case "mm":  return [1.000 - 0.130 * c, 0];
      case "mf":  return [1.043 + 0.414 * c, -23.74 * s];
      default:    return [1, 0];
    }
  }

  /* Hauteur d'eau en m/ZH à un instant donné (Date réelle, pas décalée) */
  function hauteur(date) {
    const a = astro(date);
    const T = 15 * (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) - 180;
    const tau = T + a.h - a.s;              // temps lunaire moyen à Greenwich
    let z = 0;
    for (const [, A, G, d, off, grp] of CST) {
      const V = d[0] * tau + d[1] * a.s + d[2] * a.h + d[3] * a.p + d[4] * a.N + d[5] * a.p1 + off;
      const [f, u] = nodal(grp, a.N);
      z += f * A * Math.cos((V + u - G) * DEG);
    }
    return Z0 + z / 100;
  }

  /* Champs calendaires de Mayotte pour un instant donné */
  function local(date) {
    const d = new Date(date.getTime() + (FUSEAU * 60 + date.getTimezoneOffset()) * 60000);
    return {
      annee: d.getFullYear(), mois: d.getMonth() + 1, jour: d.getDate(),
      h: d.getHours(), min: d.getMinutes(),
      heureDec: d.getHours() + d.getMinutes() / 60,
      jourSemaine: d.getDay(), date: d
    };
  }

  const fmt = h => {
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    const H = mm === 60 ? hh + 1 : hh, M = mm === 60 ? 0 : mm;
    return String(H).padStart(2, "0") + " h " + String(M).padStart(2, "0");
  };

  /* Pleines et basses mers du jour local, pas de 1 minute.
     À Mayotte la marée est semi-diurne À INÉGALITÉ DIURNE : les deux basses
     mers d'une même journée diffèrent de 20 à 60 cm. On rend donc toujours les
     quatre étales, jamais « la marée basse » au singulier. */
  function duJour(date) {
    const L = local(date);
    const debut = Date.UTC(L.annee, L.mois - 1, L.jour, 0, 0, 0) - FUSEAU * 3600000;
    const out = [];
    let hPrev = hauteur(new Date(debut - 60000));
    let hCur  = hauteur(new Date(debut));
    for (let m = 1; m <= 24 * 60; m++) {
      const hNext = hauteur(new Date(debut + m * 60000));
      if ((hCur > hPrev && hCur >= hNext) || (hCur < hPrev && hCur <= hNext)) {
        const dec = (m - 1) / 60;
        out.push({
          type: hCur > hPrev ? "haute" : "basse",
          brut: dec,
          heure: fmt(dec),
          hauteur: Math.round(hCur * 100) / 100
        });
      }
      hPrev = hCur; hCur = hNext;
    }
    return out;
  }

  /* Ce qu'on affiche à la place d'un coefficient de marée — qui n'existe pas
     outre-mer : le marnage du jour et la hauteur de la plus basse mer, seule
     information qui dise vraiment si le platier sera découvert. */
  function indicateurs(evts) {
    const pm = evts.filter(e => e.type === "haute").map(e => e.hauteur);
    const bm = evts.filter(e => e.type === "basse").map(e => e.hauteur);
    if (!pm.length || !bm.length) return null;
    const marnage = Math.max(...pm) - Math.min(...bm);
    return {
      marnage: Math.round(marnage * 100) / 100,
      plusHaute: Math.max(...pm),
      plusBasse: Math.min(...bm),
      regime: marnage >= 2.8 ? "vive-eau" : marnage <= 1.6 ? "morte-eau" : "marée moyenne",
      platierDecouvert: Math.min(...bm) <= 0.8
    };
  }

  /* État à l'instant présent */
  function etatMaintenant(date) {
    const L = local(date);
    const evts = duJour(date);
    const now = L.heureDec;
    let prochain = evts.find(e => e.brut > now);
    let precedent = [...evts].reverse().find(e => e.brut <= now);
    if (!prochain && evts.length) {
      const d = evts[evts.length - 1];
      prochain = { type: d.type === "haute" ? "basse" : "haute", brut: d.brut + 6.21,
                   heure: fmt((d.brut + 6.21) % 24), hauteur: null };
    }
    if (!precedent && evts.length) {
      const p = evts[0];
      precedent = { type: p.type === "haute" ? "basse" : "haute", brut: p.brut - 6.21, hauteur: null };
    }
    const sens = prochain ? (prochain.type === "haute" ? "montante" : "descendante") : "—";
    const proche = prochain && Math.abs(prochain.brut - now) < 1.5 ? prochain.type
                 : (precedent && Math.abs(now - precedent.brut) < 1.5 ? precedent.type : null);
    return {
      sens, prochain, precedent, proche, evts,
      hauteur: Math.round(hauteur(date) * 100) / 100,
      indic: indicateurs(evts),
      local: L
    };
  }

  /* Pour la pêche à pied : de combien l'eau sera remontée à telle heure après
     la basse mer. C'est ce chiffre-là qui compte, pas l'heure de l'étale. */
  function remontee(date, heuresApres) {
    const L = local(date);
    const evts = duJour(date);
    const bm = evts.filter(e => e.type === "basse").sort((a, b) => a.hauteur - b.hauteur)[0];
    if (!bm) return null;
    const t = Date.UTC(L.annee, L.mois - 1, L.jour, 0, 0, 0) - FUSEAU * 3600000
            + (bm.brut + heuresApres) * 3600000;
    const h = hauteur(new Date(t));
    return { basseMer: bm, apres: heuresApres, hauteur: Math.round(h * 100) / 100,
             gagne: Math.round((h - bm.hauteur) * 100) };
  }

  /* Profil de la journée, pour tracer la courbe : [{t (heures locales), h (m/ZH)}] */
  function profil(date, pasMinutes = 10) {
    const L = local(date);
    const debut = Date.UTC(L.annee, L.mois - 1, L.jour, 0, 0, 0) - FUSEAU * 3600000;
    const out = [];
    for (let m = 0; m <= 24 * 60; m += pasMinutes) {
      out.push({ t: m / 60, h: hauteur(new Date(debut + m * 60000)) });
    }
    return out;
  }

  /* Phase de la Lune — gardée pour l'illustration, plus pour qualifier la marée :
     le marnage calculé le fait mieux. */
  function phaseLune(date) {
    const a = astro(date);
    const age = mod360(a.s - a.h) / 360 * 29.530588853;
    if (age < 1.8 || age > 27.7) return { nom: "nouvelle lune", emoji: "🌑" };
    if (age < 5.5)  return { nom: "premier croissant", emoji: "🌒" };
    if (age < 9.2)  return { nom: "premier quartier",  emoji: "🌓" };
    if (age < 12.9) return { nom: "lune gibbeuse",     emoji: "🌔" };
    if (age < 16.6) return { nom: "pleine lune",       emoji: "🌕" };
    if (age < 20.3) return { nom: "lune gibbeuse",     emoji: "🌖" };
    if (age < 24)   return { nom: "dernier quartier",  emoji: "🌗" };
    return { nom: "dernier croissant", emoji: "🌘" };
  }

  return { duJour, etatMaintenant, indicateurs, remontee, hauteur, profil, phaseLune,
           local, fmt, FUSEAU, RAM, Z0, ZH_VERS_TERRESTRE };
})();

/* ---------------------------------------------------------------------------
   AUTOTEST — se lance sous Node (`node marees.js`), silencieux dans le navigateur.
   Il compare la prédiction du 1er juillet 2026 aux valeurs de contrôle relevées
   sur l'annuaire officiel. Si un jour ce test casse, c'est que quelqu'un a
   touché aux constantes ou aux corrections nodales.
   --------------------------------------------------------------------------- */
if (typeof module !== "undefined" && require.main === module) {
  const attendu = [
    { type: "haute", heure: "05 h 10", hauteur: 3.03 },
    { type: "basse", heure: "10 h 59", hauteur: 0.85 },
    { type: "haute", heure: "17 h 15", hauteur: 3.47 },
    { type: "basse", heure: "23 h 38", hauteur: 0.75 }
  ];
  const ref = new Date(Date.UTC(2026, 6, 1, 9, 0, 0));   // 12 h à Mayotte
  const calcule = MAREES.duJour(ref);
  const minutes = s => +s.slice(0, 2) * 60 + +s.slice(-2);
  let pire = { min: 0, cm: 0 };
  console.log("\n  Marées de Dzaoudzi — 1er juillet 2026\n");
  calcule.forEach((e, i) => {
    const a = attendu[i];
    if (!a) return;
    const dm = Math.abs(minutes(e.heure.replace(" h ", "")) - minutes(a.heure.replace(" h ", "")));
    const dc = Math.abs(Math.round((e.hauteur - a.hauteur) * 100));
    pire = { min: Math.max(pire.min, dm), cm: Math.max(pire.cm, dc) };
    console.log(`   ${e.type === "haute" ? "PM" : "BM"} ${e.heure}  ${e.hauteur.toFixed(2)} m` +
                `   (annuaire ${a.heure} ${a.hauteur.toFixed(2)} m — écart ${dm} min, ${dc} cm)`);
  });
  const ind = MAREES.indicateurs(calcule);
  console.log(`\n   Marnage du jour ${ind.marnage} m (${ind.regime})` +
              ` · plus basse mer ${ind.plusBasse} m/ZH\n`);
  const ok = pire.min <= 6 && pire.cm <= 4 && calcule.length === 4;
  console.log(ok ? `  ✓ Conforme à l'annuaire (écart max ${pire.min} min, ${pire.cm} cm)\n`
                 : `  ✗ ÉCART ANORMAL : ${pire.min} min, ${pire.cm} cm — vérifier les constantes\n`);
  process.exit(ok ? 0 : 1);
}
