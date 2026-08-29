/* =============================================================================
   MAORÉ QUEST — le soleil, calculé à bord
   -----------------------------------------------------------------------------
   POURQUOI CE FICHIER EXISTE. L'application codait « 18 h » en dur comme fin de
   journée. À Mayotte le coucher réel va de 17 h 39 fin mai à 18 h 33 fin
   janvier : le classement des suggestions se trompait donc de près d'une heure
   selon la saison, et la phrase « la nuit tombe d'un coup vers 18 h » n'était
   vraie qu'un mois par an.

   ALGORITHME. Séries NOAA (Meeus, Astronomical Algorithms), domaine public.
   Deux itérations : on recalcule l'équation du temps et la déclinaison à
   l'heure trouvée, ce qui ramène l'erreur sous la minute entre 1800 et 2100.
   Aucun ΔT n'est nécessaire à cette précision.

   CE QU'IL FAUT SAVOIR, ET QUE PERSONNE NE SAIT EN ARRIVANT :
   à cette latitude l'heure dorée dure 28 à 31 minutes, pas une heure, et
   l'heure bleue 8 à 9 minutes. Un visiteur qui arrive à Sakouli « pour l'heure
   dorée » avec des réflexes métropolitains a déjà tout raté.

   Contrôle intégré en bas de fichier : `node astro.js`.
   ========================================================================== */

const SOLEIL = (() => {

  /* Mamoudzou. L'île fait 30 km : l'écart d'un bout à l'autre est d'environ
     une minute sur le lever, ce qui ne justifie pas de calculer par lieu. */
  const LAT = -12.7814, LON = 45.2317, TZ = 3;

  const RAD = Math.PI / 180;
  const sin = d => Math.sin(d * RAD), cos = d => Math.cos(d * RAD);
  const asin = x => Math.asin(x) / RAD, acos = x => Math.acos(x) / RAD;
  const atan2 = (y, x) => Math.atan2(y, x) / RAD;

  /* Jour julien à 0 h TU pour une date civile */
  function jourJulien(a, m, j) {
    if (m <= 2) { a -= 1; m += 12; }
    const A = Math.floor(a / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (a + 4716)) + Math.floor(30.6001 * (m + 1)) + j + B - 1524.5;
  }

  /* Éléments solaires pour un siècle julien T */
  function elements(T) {
    const L0 = 280.46646 + T * (36000.76983 + 0.0003032 * T);
    const M  = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    const e  = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    const C  = sin(M)     * (1.914602 - T * (0.004817 + 0.000014 * T))
             + sin(2 * M) * (0.019993 - 0.000101 * T)
             + sin(3 * M) *  0.000289;
    const O  = 125.04 - 1934.136 * T;
    const lam = L0 + C - 0.00569 - 0.00478 * sin(O);
    const eps0 = 23 + (26 + ((21.448 - T * (46.815 + T * (0.00059 - T * 0.001813)))) / 60) / 60;
    const eps = eps0 + 0.00256 * cos(O);
    const decl = asin(sin(eps) * sin(lam));
    const y = Math.tan(eps / 2 * RAD) ** 2;
    const eqt = 4 * (y * Math.sin(2 * L0 * RAD)
              - 2 * e * Math.sin(M * RAD)
              + 4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD)
              - 0.5 * y * y * Math.sin(4 * L0 * RAD)
              - 1.25 * e * e * Math.sin(2 * M * RAD)) / RAD;
    return { decl, eqt };
  }

  /* Champs calendaires locaux (Mayotte est à UTC+3 toute l'année) */
  function local(date) {
    const d = new Date(date.getTime() + (TZ * 60 + date.getTimezoneOffset()) * 60000);
    return { a: d.getFullYear(), m: d.getMonth() + 1, j: d.getDate(),
             h: d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600 };
  }

  /* Minutes locales d'un événement solaire à la hauteur h0.
     `soir` : false pour le lever, true pour le coucher.
     Renvoie null quand l'événement n'a pas lieu (jamais à cette latitude). */
  function evenement(date, h0, soir) {
    const L = local(date);
    let T = (jourJulien(L.a, L.m, L.j) - TZ / 24 - 2451545) / 36525;
    let mn = null;
    for (let i = 0; i < 2; i++) {          // deux itérations suffisent
      const { decl, eqt } = elements(T);
      const c = (sin(h0) - sin(LAT) * sin(decl)) / (cos(LAT) * cos(decl));
      if (c < -1 || c > 1) return null;
      const H = acos(c);
      const midi = 720 - 4 * LON - eqt + 60 * TZ;
      mn = midi + (soir ? 4 * H : -4 * H);
      T = (jourJulien(L.a, L.m, L.j) - TZ / 24 + mn / 1440 - 2451545) / 36525;
    }
    return mn;
  }

  const midiSolaire = date => {
    const L = local(date);
    const T = (jourJulien(L.a, L.m, L.j) - TZ / 24 - 2451545) / 36525;
    return 720 - 4 * LON - elements(T).eqt + 60 * TZ;
  };

  /* Azimut et hauteur du soleil à un instant donné */
  function position(date) {
    const L = local(date);
    const T = (jourJulien(L.a, L.m, L.j) - TZ / 24 + L.h / 24 - 2451545) / 36525;
    const { decl, eqt } = elements(T);
    const vraiSolaire = (L.h * 60 + eqt + 4 * LON - 60 * TZ + 1440) % 1440;
    const H = vraiSolaire / 4 - 180;
    const hz = asin(sin(LAT) * sin(decl) + cos(LAT) * cos(decl) * cos(H));
    let az = atan2(-sin(H), cos(LAT) * Math.tan(decl * RAD) - sin(LAT) * cos(H));
    az = (az + 360) % 360;
    return { hauteur: hz, azimut: az, declinaison: decl };
  }

  /* Les seuils de hauteur qui définissent chaque moment de la journée */
  const SEUILS = { doree: 6, lever: -0.833, bleue: -4, civil: -6, nautique: -12, nuit: -18 };

  /* ON ARRONDIT LES MINUTES TOTALES, PUIS ON DÉCOUPE. L'inverse — plancher
     sur les heures, arrondi sur les minutes, chacun de son côté — produit
     « 11 h 60 » pour 719,7 minutes et « 23 h 60 » pour 1439,7. Le midi solaire
     tombant régulièrement à quelques dixièmes de 12 h, l'application affichait
     une heure qui n'existe pas plusieurs jours par mois. */
  const min2h = mn => {
    if (mn == null) return null;
    const t = ((Math.round(mn) % 1440) + 1440) % 1440;
    return String(Math.floor(t / 60)).padStart(2, "0") + " h " +
           String(t % 60).padStart(2, "0");
  };

  /* Toute la journée d'un coup, en minutes locales */
  function journee(date) {
    const e = (h0, soir) => evenement(date, h0, soir);
    return {
      lever:        e(SEUILS.lever, false),
      coucher:      e(SEUILS.lever, true),
      midi:         midiSolaire(date),
      doreeDebut:   e(SEUILS.doree, true),      // le soleil descend sous 6°
      doreeFin:     e(SEUILS.lever, true),      // ...jusqu'au coucher
      bleueFin:     e(SEUILS.bleue, true),
      civil:        e(SEUILS.civil, true),      // fin du jour utile
      nuit:         e(SEUILS.nuit, true),       // nuit astronomique
      aubeCivile:   e(SEUILS.civil, false),
      aubeNuit:     e(SEUILS.nuit, false)
    };
  }

  /* ===================== L'INDICE UV, PAR CIEL CLAIR =====================
     POURQUOI LE CALCULER. Sous les tropiques, l'indice UV dépasse 11 —
     « extrême » — plus de la moitié des jours de l'année, et il est déjà à 8
     à neuf heures du matin. Un touriste qui applique ses réflexes de
     métropole brûle avant midi. Aucune application hors ligne ne le dit.

     CE QUE C'EST, ET CE QUE CE N'EST PAS. C'est un calcul de CIEL CLAIR :
     géométrie solaire, ozone, altitude. Ce n'est PAS une mesure, et ce n'est
     pas une prévision — un ciel couvert peut le diviser par deux, un voile
     d'altitude à peine le réduire. L'affichage porte donc toujours la mention
     « ciel clair », sans exception : un nombre présenté comme une mesure
     serait pire que pas de nombre du tout.

     LA FORMULE. UVI = 12,5 · μ^2,42 est la forme usuelle pour 300 unités
     Dobson d'ozone au niveau de la mer (μ = cosinus de l'angle zénithal).
     Deux corrections comptent ici :
       · l'ozone. Sur la ceinture tropicale, la colonne tourne autour de 260 DU
         contre 300 de référence. La sensibilité de l'UV érythémal à l'ozone
         suit une loi de puissance d'exposant voisin de −1,2 : (300/260)^1,2,
         soit environ +18 %. La valeur varie de quelques pour cent au fil de
         l'année ; on ne la fait pas varier, parce qu'on ne la mesure pas.
       · l'altitude. Environ +6 % par 1 000 m. À Mayotte, le mont Bénara
         culmine à 660 m : au plus 4 %. On l'ignore, et on le dit.
     Le sable clair et l'eau renvoient une part du rayonnement, ce qui ajoute
     réellement à la dose reçue — mais l'indice UV se définit sur le
     rayonnement descendant. On ne le gonfle pas ; on le mentionne en conseil.

     PRÉCISION HONNÊTE. À ±1 point d'indice par ciel clair. C'est amplement
     assez pour la seule décision qui compte : se couvrir, ou non. */
  const OZONE = Math.pow(300 / 260, 1.2);      // ≈ 1,18 sous les tropiques

  function uv(date) {
    const h = position(date).hauteur;
    if (h <= 0) return { indice: 0, mu: 0 };
    const mu = sin(h);
    const i = 12.5 * Math.pow(mu, 2.42) * OZONE;
    return { indice: Math.round(i * 10) / 10, mu, hauteur: h };
  }

  /* Les paliers officiels de l'OMS. Le libellé « extrême » commence à 11. */
  function uvPalier(i) {
    if (i < 3)  return { cle: "faible",  mot: "faible",  minutes: null };
    if (i < 6)  return { cle: "modere",  mot: "modéré",  minutes: 45 };
    if (i < 8)  return { cle: "fort",    mot: "fort",    minutes: 25 };
    if (i < 11) return { cle: "tresfort",mot: "très fort", minutes: 15 };
    return          { cle: "extreme", mot: "extrême", minutes: 10 };
  }

  /* L'indice maximal du jour, atteint au midi solaire. */
  const uvMax = date => {
    const L = local(date);
    const base = Date.UTC(L.a, L.m - 1, L.j, 0, 0, 0) - TZ * 3600000;
    return uv(new Date(base + midiSolaire(date) * 60000));
  };

  /* ======================== LE JOUR SANS OMBRE ==========================
     Deux fois l'an, entre les tropiques, le soleil passe exactement au
     zénith : à midi solaire, une bouteille posée debout n'a plus d'ombre.
     Ce n'est pas une curiosité de calendrier, c'est visible à l'œil nu et
     ça se photographie.

     ON LE CALCULE, ON NE LE RECOPIE PAS. Les dates circulent en ligne, et
     elles sont souvent fausses d'une semaine — quand elles ne confondent pas
     Mayotte avec La Réunion, qui est hors des tropiques et n'en a jamais.
     Ici : on cherche le jour où la déclinaison du soleil, au midi solaire
     local, croise la latitude du lieu. Aucune table, aucune date en dur.

     À Mayotte, cela tombe vers le 14-15 février et vers le 26-28 octobre,
     et le jour exact dépend de l'endroit — la pointe nord et la pointe sud
     ne sont pas au zénith le même jour. */
  function joursSansOmbre(annee, lat = LAT) {
    const midiDe = t => {
      const d = new Date(t);
      const base = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0) - TZ * 3600000;
      return new Date(base + midiSolaire(new Date(base + 12 * 3600000)) * 60000);
    };
    const out = [];
    let prec = null;
    for (let t = Date.UTC(annee, 0, 1); t < Date.UTC(annee + 1, 0, 1); t += 86400000) {
      const inst = midiDe(t);
      const v = position(inst).declinaison - lat;
      if (prec && (prec.v < 0) !== (v < 0)) {
        const g = Math.abs(prec.v) < Math.abs(v) ? prec : { inst, v };
        const L = local(g.inst);
        out.push({ mois: L.m, jour: L.j, quand: g.inst,
                   hauteur: position(g.inst).hauteur,
                   midi: midiSolaire(g.inst) });
      }
      prec = { inst, v };
    }
    return out;
  }

  return { journee, position, midiSolaire, evenement, local, min2h, SEUILS,
           uv, uvMax, uvPalier, joursSansOmbre, LAT, LON, TZ };
})();


/* =============================================================================
   LA LUNE — série ELP-2000/82 tronquée
   -----------------------------------------------------------------------------
   POURQUOI. Une sortie nocturne sur une plage de ponte n'a rien à voir selon
   la lune : pleine lune, on y voit comme en plein jour ; lune couchée, on ne
   voit pas ses pieds. Aucune application ne donne ça hors ligne.

   CE QU'ON DIT, ET CE QU'ON NE DIT PAS. On annonce l'obscurité de la plage.
   Jamais la ponte : la corrélation entre ponte et lune est débattue, et
   l'application y perdrait exactement la crédibilité que lui donnent ses
   sources de terrain.

   SOURCE. Série lunaire ELP-2000/82, Chapront-Touzé & Chapront (1983) ;
   tabulation d'usage courant popularisée par J. Meeus, « Astronomical
   Algorithms », ch. 47. Ce qui est repris est une compilation de coefficients.

   PRÉCISION. ΔT est ignoré : 72 s en 2026, soit 3 s sur l'heure de lever.
   Lever et coucher à la minute. Validé par l'exemple 47.a de Meeus, qui
   contrôle toute la série d'un coup.
   ========================================================================== */

const LUNE = (() => {
  const RAD = Math.PI / 180;
  const sin = d => Math.sin(d * RAD), cos = d => Math.cos(d * RAD);
  const mod = (x, m) => ((x % m) + m) % m;

  /* Termes périodiques de Meeus, table 47.A : D, M, M′, F, Σl, Σr */
  const T47A = [
    [0,0,1,0,6288774,-20905355],[2,0,-1,0,1274027,-3699111],[2,0,0,0,658314,-2955968],
    [0,0,2,0,213618,-569925],[0,1,0,0,-185116,48888],[0,0,0,2,-114332,-3149],
    [2,0,-2,0,58793,246158],[2,-1,-1,0,57066,-152138],[2,0,1,0,53322,-170733],
    [2,-1,0,0,45758,-204586],[0,1,-1,0,-40923,-129620],[1,0,0,0,-34720,108743],
    [0,1,1,0,-30383,104755],[2,0,0,-2,15327,10321],[0,0,1,2,-12528,0],
    [0,0,1,-2,10980,79661],[4,0,-1,0,10675,-34782],[0,0,3,0,10034,-23210],
    [4,0,-2,0,8548,-21636],[2,1,-1,0,-7888,24208],[2,1,0,0,-6766,30824],
    [1,0,-1,0,-5163,-8379],[1,1,0,0,4987,-16675],[2,-1,1,0,4036,-12831],
    [2,0,2,0,3994,-10445],[4,0,0,0,3861,-11650],[2,0,-3,0,3665,14403],
    [0,1,-2,0,-2689,-7003],[2,0,-1,2,-2602,0],[2,-1,-2,0,2390,10056],
    [1,0,1,0,-2348,6322],[2,-2,0,0,2236,-9884],[0,1,2,0,-2120,5751],
    [0,2,0,0,-2069,0],[2,-2,-1,0,2048,-4950],[2,0,1,-2,-1773,4130],
    [2,0,0,2,-1595,0],[4,-1,-1,0,1215,-3958],[0,0,2,2,-1110,0],
    [3,0,-1,0,-892,3258],[2,1,1,0,-810,2616],[4,-1,-2,0,759,-1897],
    [0,2,-1,0,-713,-2117],[2,2,-1,0,-700,2354],[2,1,-2,0,691,0],
    [2,-1,0,-2,596,0],[4,0,1,0,549,-1423],[0,0,4,0,537,-1117],
    [4,-1,0,0,520,-1571],[1,0,-2,0,-487,-1739],[2,1,0,-2,-399,0],
    [0,0,2,-2,-381,-4421],[1,1,1,0,351,0],[3,0,-2,0,-340,0],
    [4,0,-3,0,330,0],[2,-1,2,0,327,0],[0,2,1,0,-323,1165],
    [1,1,-1,0,299,0],[2,0,3,0,294,0],[2,0,-1,-2,0,8752]
  ];
  /* Table 47.B : D, M, M′, F, Σb */
  const T47B = [
    [0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],
    [2,0,-1,1,55413],[2,0,-1,-1,46271],[2,0,0,1,32573],[0,0,2,1,17198],
    [2,0,1,-1,9266],[0,0,2,-1,8822],[2,-1,0,-1,8216],[2,0,-2,-1,4324],
    [2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],[2,-1,0,1,2211],
    [2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],
    [0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],
    [0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107],
    [4,0,0,-1,1021],[4,0,-1,1,833],[0,0,1,-3,777],[4,0,-2,1,671],
    [2,0,0,-3,607],[2,0,2,-1,596],[2,-1,1,-1,491],[2,0,-2,1,-451],
    [0,0,3,-1,439],[2,0,2,1,422],[2,0,-3,-1,421],[2,1,-1,1,-366],
    [2,1,0,1,-351],[4,0,0,1,331],[2,-1,1,1,315],[2,-2,0,-1,302],
    [0,0,1,3,-283],[2,1,1,-1,-229],[1,1,0,-1,223],[1,1,0,1,223],
    [0,1,-2,-1,-220],[2,1,-1,-1,-220],[1,0,1,1,-185],[2,-1,-2,-1,181],
    [0,1,2,1,-177],[4,0,-2,-1,176],[4,-1,-1,-1,166],[1,0,1,-1,-164],
    [4,0,1,-1,132],[1,0,-1,-1,-119],[4,-1,0,-1,115],[2,-2,0,1,107]
  ];

  /* Position géocentrique de la Lune pour un jour julien donné (TU). */
  function position(jd) {
    const T = (jd - 2451545) / 36525;
    const Lp = mod(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
                   + T ** 3 / 538841 - T ** 4 / 65194000, 360);
    const D  = mod(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
                   + T ** 3 / 545868 - T ** 4 / 113065000, 360);
    const M  = mod(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000, 360);
    const Mp = mod(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
                   + T ** 3 / 69699 - T ** 4 / 14712000, 360);
    const F  = mod(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T
                   - T ** 3 / 3526000 + T ** 4 / 863310000, 360);
    const A1 = mod(119.75 + 131.849 * T, 360);
    const A2 = mod(53.09 + 479264.290 * T, 360);
    const A3 = mod(313.45 + 481266.484 * T, 360);
    const E  = 1 - 0.002516 * T - 0.0000074 * T * T;

    let sl = 0, sr = 0, sb = 0;
    for (const [d, m, mp, f, l, r] of T47A) {
      const e = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
      const a = d * D + m * M + mp * Mp + f * F;
      sl += l * e * sin(a);
      sr += r * e * cos(a);
    }
    for (const [d, m, mp, f, b] of T47B) {
      const e = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E * E : 1;
      sb += b * e * sin(d * D + m * M + mp * Mp + f * F);
    }
    /* termes additifs */
    sl += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
    sb += -2235 * sin(Lp) + 382 * sin(A3) + 175 * sin(A1 - F) + 175 * sin(A1 + F)
        + 127 * sin(Lp - Mp) - 115 * sin(Lp + Mp);

    const lam = mod(Lp + sl / 1e6, 360);
    const bet = sb / 1e6;
    const dist = 385000.56 + sr / 1000;
    const par = Math.asin(6378.14 / dist) / RAD;

    /* équatoriales */
    const eps = 23.4392911 - 0.0130042 * T;
    const ar = mod(Math.atan2(sin(lam) * cos(eps) - Math.tan(bet * RAD) * sin(eps),
                              cos(lam)) / RAD, 360);
    const dec = Math.asin(sin(bet) * cos(eps) + cos(bet) * sin(eps) * sin(lam)) / RAD;
    return { lam, bet, dist, par, ar, dec, T, D, M, Mp };
  }

  /* Temps sidéral apparent de Greenwich, en degrés */
  function sideral(jd) {
    const T = (jd - 2451545) / 36525;
    return mod(280.46061837 + 360.98564736629 * (jd - 2451545)
               + 0.000387933 * T * T - T ** 3 / 38710000, 360);
  }

  const jdDepuis = date => date.getTime() / 86400000 + 2440587.5;

  /* Hauteur de la Lune au-dessus de l'horizon, en degrés */
  function hauteur(date, lat, lon) {
    const jd = jdDepuis(date);
    const p = position(jd);
    const H = mod(sideral(jd) + lon - p.ar, 360);
    return Math.asin(sin(lat) * sin(p.dec) + cos(lat) * cos(p.dec) * cos(H)) / RAD;
  }

  /* Lever et coucher du jour local, par balayage puis bissection.
     Le seuil est propre à la Lune : la parallaxe l'emporte sur la réfraction. */
  function leverCoucher(date, lat, lon, tz) {
    const L = SOLEIL.local(date);
    const base = Date.UTC(L.a, L.m - 1, L.j, 0, 0, 0) - tz * 3600000;
    const h0 = d => {
      const p = position(jdDepuis(d));
      return 0.7275 * p.par - 0.5667;
    };
    const f = t => hauteur(new Date(t), lat, lon) - h0(new Date(t));
    let lever = null, coucher = null, prec = f(base);
    for (let m = 10; m <= 1440; m += 10) {
      const t = base + m * 60000, v = f(t);
      if (prec < 0 && v >= 0 || prec >= 0 && v < 0) {
        let a = t - 600000, b = t;
        for (let i = 0; i < 40; i++) {
          const c = (a + b) / 2;
          (f(a) < 0) === (f(c) < 0) ? a = c : b = c;
        }
        const mn = ((a + b) / 2 - base) / 60000;
        if (prec < 0) { if (lever == null) lever = mn; }
        else if (coucher == null) coucher = mn;
      }
      prec = v;
    }
    return { lever, coucher };
  }

  /* Fraction éclairée du disque, de 0 (nouvelle) à 1 (pleine) */
  function phase(date) {
    const jd = jdDepuis(date);
    const p = position(jd);
    const T = p.T;
    /* longitude du Soleil, suffisante à cette précision */
    const L0 = mod(280.46646 + 36000.76983 * T, 360);
    const M = mod(357.52911 + 35999.05029 * T, 360);
    const C = 1.914602 * sin(M) + 0.019993 * sin(2 * M) + 0.000289 * sin(3 * M);
    const lamS = mod(L0 + C, 360);
    const R = 149598000 * (1.000001018 * (1 - 0.016708634 ** 2)
              / (1 + 0.016708634 * cos(M + C)));
    const psi = Math.acos(cos(p.bet) * cos(p.lam - lamS)) / RAD;
    const i = Math.atan2(R * sin(psi), p.dist - R * cos(psi)) / RAD;
    return { eclairee: (1 + cos(i)) / 2, age: mod(p.lam - lamS, 360) / 360 * 29.530588853 };
  }

  return { position, hauteur, leverCoucher, phase, sideral, jdDepuis };
})();

/* ---------------------------------------------------------------------------
   AUTOTEST — `node astro.js`. Silencieux dans le navigateur.
   Références : sorties de calcSunriseSet() et calcAzEl() de la NOAA elle-même.
   Ne PAS contrôler contre sunrise-sunset.org : leur seuil effectif est -1,12°
   au lieu de -0,833°, ils dérivent d'une à deux minutes.
   --------------------------------------------------------------------------- */
if (typeof module !== "undefined" && require.main === module) {
  const hms = mn => {
    const s = Math.round(mn * 60);
    return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
      .map(n => String(n).padStart(2, "0")).join(":");
  };
  const ref = new Date(Date.UTC(2026, 7, 11, 9, 0, 0));    // 11 août 2026, midi à Mayotte
  const j = SOLEIL.journee(ref);
  const attendu = { lever: 6 * 60 + 15 + 1 / 60, coucher: 17 * 60 + 53 + 45 / 60,
                    midi: 12 * 60 + 4 + 19 / 60 };

  console.log("\n  Soleil à Mamoudzou — 11 août 2026\n");
  let pire = 0;
  for (const [cle, att] of Object.entries(attendu)) {
    const ecart = Math.abs(j[cle] - att) * 60;
    pire = Math.max(pire, ecart);
    console.log(`   ${cle.padEnd(9)} ${hms(j[cle])}   (NOAA ${hms(att)} — écart ${ecart.toFixed(0)} s)`);
  }
  const dj = j.coucher - j.lever;
  console.log(`   durée     ${Math.floor(dj / 60)} h ${Math.round(dj % 60)} min`);

  const d28 = new Date(Date.UTC(2026, 7, 28, 9, 0, 0));
  const k = SOLEIL.journee(d28);
  console.log(`\n  28 août : dorée dès ${SOLEIL.min2h(k.doreeDebut)} · coucher ${SOLEIL.min2h(k.coucher)}` +
              ` · bleue jusqu'à ${SOLEIL.min2h(k.bleueFin)} · nuit noire ${SOLEIL.min2h(k.nuit)}`);
  console.log(`   l'heure dorée dure ${Math.round(k.coucher - k.doreeDebut)} minutes,` +
              ` l'heure bleue ${Math.round(k.bleueFin - k.coucher)} minutes\n`);

  /* Amplitude annuelle : c'est elle qui rendait le « 18 h » codé en dur faux. */
  let tot = null, tard = null;
  for (let n = 0; n < 365; n++) {
    const d = new Date(Date.UTC(2026, 0, 1, 9, 0, 0) + n * 86400000);
    const c = SOLEIL.journee(d).coucher;
    if (!tot || c < tot.v) tot = { v: c, d };
    if (!tard || c > tard.v) tard = { v: c, d };
  }
  const fr = d => d.toISOString().slice(0, 10);
  console.log(`  coucher le plus tôt   ${SOLEIL.min2h(tot.v)}  (${fr(tot.d)})`);
  console.log(`  coucher le plus tard  ${SOLEIL.min2h(tard.v)}  (${fr(tard.d)})`);
  console.log(`  amplitude sur l'année ${Math.round(tard.v - tot.v)} minutes\n`);

  /* — la Lune — exemple 47.a de Meeus : 12 avril 1992 à 0 h TD.
     Ce cas contrôle toute la série d'un coup. */
  console.log("\n  Lune — exemple 47.a de Meeus (12 avril 1992, 0 h)\n");
  const jdM = 2448724.5;
  const pm = LUNE.position(jdM);
  const attLune = { lam: 133.162655, bet: -3.229126, dist: 368409.7, par: 0.991990 };
  let luneOk = true;
  for (const [cle, att] of Object.entries(attLune)) {
    const v = pm[cle];
    const tol = cle === "dist" ? 2 : 0.01;
    const bon = Math.abs(v - att) <= tol;
    luneOk = luneOk && bon;
    console.log(`   ${(bon ? "✓" : "✗")} ${cle.padEnd(5)} ${v.toFixed(6).padStart(12)}` +
                `   (Meeus ${att})`);
  }
  const ph = LUNE.phase(new Date(Date.UTC(2026, 7, 28, 4, 20, 0)));
  console.log(`
   pleine lune du 28 août 2026 : éclairée à ${(ph.eclairee * 100).toFixed(1)} %`);
  const lc = LUNE.leverCoucher(new Date(Date.UTC(2026, 7, 8, 9, 0, 0)), SOLEIL.LAT, SOLEIL.LON, 3);
  console.log(`   8 août 2026 : lever ${SOLEIL.min2h(lc.lever)} · coucher ${SOLEIL.min2h(lc.coucher)}` +
              `   (référence 01 h 50 / 13 h 24)
`);

  /* LE FORMATAGE DES HEURES, verrouillé. Arrondir les minutes sans toucher aux
     heures écrivait « 11 h 60 » pour 719,7 minutes — et le midi solaire tombe
     à quelques dixièmes de midi plusieurs jours par mois, donc ça s'affichait
     vraiment. Le même piège dormait dans marees.js et dans la durée du jour. */
  const CAS_H = [[719.7, "12 h 00"], [719.4, "11 h 59"], [1439.7, "00 h 00"],
                 [0, "00 h 00"], [-0.3, "00 h 00"], [365.5, "06 h 06"], [1080, "18 h 00"]];
  let heuresOk = true;
  console.log(["", "  Formatage des heures"].join(String.fromCharCode(10)));
  for (const [v, attendu] of CAS_H) {
    const r = SOLEIL.min2h(v), bon = r === attendu;
    heuresOk = heuresOk && bon;
    if (!bon) console.log(`   ✗ SOLEIL.min2h(${v}) rend « ${r} » au lieu de « ${attendu} »`);
  }
  console.log(heuresOk ? "   ✓ 7 cas limites justes" + String.fromCharCode(10) : "");

  const ok = pire <= 90 && luneOk && heuresOk;
  /* Le verdict NOMME ce qui a lâché. Un premier jet annonçait « écart anormal :
     5 s » alors que c'était le formatage des heures qui échouait — un test qui
     ment sur sa cause fait perdre plus de temps qu'il n'en fait gagner. */
  if (ok) {
    console.log("  ✓ Conforme à la NOAA (écart max " + pire.toFixed(0) + " s)" + String.fromCharCode(10));
  } else {
    const quoi = [pire > 90 ? "soleil (" + pire.toFixed(0) + " s d'écart)" : null,
                  luneOk ? null : "lune",
                  heuresOk ? null : "formatage des heures"].filter(Boolean).join(", ");
    console.log("  ✗ ÉCHEC : " + quoi + String.fromCharCode(10));
  }
  process.exit(ok ? 0 : 1);
}
