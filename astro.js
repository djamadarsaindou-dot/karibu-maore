/* =============================================================================
   KARIBU MAORÉ — le soleil, calculé à bord
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

  const min2h = mn => mn == null ? null
    : String(Math.floor(((mn % 1440) + 1440) % 1440 / 60)).padStart(2, "0") + " h " +
      String(Math.round(((mn % 1440) + 1440) % 1440 % 60)).padStart(2, "0");

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

  return { journee, position, midiSolaire, evenement, local, min2h, SEUILS, LAT, LON, TZ };
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

  const ok = pire <= 90;
  console.log(ok ? `  ✓ Conforme à la NOAA (écart max ${pire.toFixed(0)} s)\n`
                 : `  ✗ ÉCART ANORMAL : ${pire.toFixed(0)} s\n`);
  process.exit(ok ? 0 : 1);
}
