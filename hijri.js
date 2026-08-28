/* =============================================================================
   KARIBU MAORÉ — le calendrier de l'hégire
   -----------------------------------------------------------------------------
   POURQUOI. C'est le calendrier qui gouverne réellement l'année à Mayotte.
   Pendant le ramadan, les horaires de travail changent, les restaurants
   ferment la journée, les places de village s'animent à la nuit tombée et le
   mourengué reprend. Un visiteur qui l'ignore ne comprend pas ce qu'il voit —
   ou pire, mange en public à midi devant des gens qui jeûnent.

   ON LE CALCULE, ON NE LE RECOPIE PAS. Les dates des fêtes musulmanes ne sont
   dans aucun fichier de l'application : elles sortent de la position réelle de
   la Lune. C'est la même exigence que pour les marées.

   COMMENT. Instant de la nouvelle lune par la série de Meeus, chapitre 49,
   avec ses vingt-cinq termes périodiques et ses quatorze corrections
   additionnelles. Le mois commence le LENDEMAIN du jour de la conjonction,
   heure de Mayotte.

   CE QUE ÇA VAUT — quatre repères annoncés par des autorités indépendantes,
   tous retrouvés au jour près :
     1 ramadan 1447    → 18 février 2026   (Grande Mosquée de Paris)
     1 chawwal 1447    → 20 mars 2026      (Fiqh Council of North America)
     1 ramadan 1446    → 1er mars 2025     (annoncé en France)
     10 dhou al-hijja 1446 → 6 juin 2025   (Aïd el-Kebir 2025)

   CE QUE ÇA NE VAUT PAS. Le début du mois est arrêté par l'OBSERVATION du
   croissant, pas par un calcul, et l'annonce est faite localement. Un jour
   d'écart est possible et il est fréquent. L'application écrit donc toujours
   « vers le », et renvoie à la mosquée pour la date qui fait foi. Une
   application qui trancherait à la place des autorités religieuses se
   tromperait sur le fond, même quand elle tombe juste sur la date.
   ========================================================================== */

const HIJRI = (() => {
  const RAD = Math.PI / 180;
  const sin = d => Math.sin(d * RAD);
  const TZ = 3;                                   // Mayotte, UTC+3 toute l'année

  /* Corrections périodiques de la nouvelle lune — Meeus, table 49.A */
  const P = [
    [-0.40720, "Mp",  0], [ 0.17241, "M",   1], [ 0.01608, "2Mp", 0],
    [ 0.01039, "2F",  0], [ 0.00739, "Mp-M",1], [-0.00514, "Mp+M",1],
    [ 0.00208, "2M",  2], [-0.00111, "Mp-2F",0],[-0.00057, "Mp+2F",0],
    [ 0.00056, "2Mp+M",1],[-0.00042, "3Mp", 0], [ 0.00042, "M+2F",1],
    [ 0.00038, "M-2F",1], [-0.00024, "2Mp-M",1],[-0.00017, "O",   0],
    [-0.00007, "Mp+2M",0],[ 0.00004, "2Mp-2F",0],[0.00004, "3M",  0],
    [ 0.00003, "Mp+M-2F",0],[0.00003,"2Mp+2F",0],[-0.00003,"Mp+M+2F",0],
    [ 0.00003, "Mp-M+2F",0],[-0.00002,"Mp-M-2F",0],[-0.00002,"3Mp+M",0],
    [ 0.00002, "4Mp", 0]
  ];

  /* Instant de la nouvelle lune numéro k, en jours juliens.
     k = 0 correspond à la nouvelle lune du 6 janvier 2000. */
  function nouvelleLune(k) {
    const T = k / 1236.85;
    let jd = 2451550.09766 + 29.530588861 * k
           + 0.00015437 * T * T - 0.000000150 * T ** 3 + 0.00000000073 * T ** 4;
    const E  = 1 - 0.002516 * T - 0.0000074 * T * T;
    const M  = 2.5534 + 29.10535670 * k - 0.0000014 * T * T - 0.00000011 * T ** 3;
    const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T
             + 0.00001238 * T ** 3 - 0.000000058 * T ** 4;
    const F  = 160.7108 + 390.67050284 * k - 0.0016118 * T * T
             - 0.00000227 * T ** 3 + 0.000000011 * T ** 4;
    const O  = 124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T ** 3;
    const ARG = {
      "Mp": Mp, "M": M, "2Mp": 2 * Mp, "2F": 2 * F, "Mp-M": Mp - M, "Mp+M": Mp + M,
      "2M": 2 * M, "Mp-2F": Mp - 2 * F, "Mp+2F": Mp + 2 * F, "2Mp+M": 2 * Mp + M,
      "3Mp": 3 * Mp, "M+2F": M + 2 * F, "M-2F": M - 2 * F, "2Mp-M": 2 * Mp - M,
      "O": O, "Mp+2M": Mp + 2 * M, "2Mp-2F": 2 * Mp - 2 * F, "3M": 3 * M,
      "Mp+M-2F": Mp + M - 2 * F, "2Mp+2F": 2 * Mp + 2 * F, "Mp+M+2F": Mp + M + 2 * F,
      "Mp-M+2F": Mp - M + 2 * F, "Mp-M-2F": Mp - M - 2 * F, "3Mp+M": 3 * Mp + M,
      "4Mp": 4 * Mp
    };
    for (const [c, cle, ordre] of P) {
      const e = ordre === 1 ? E : ordre === 2 ? E * E : 1;
      jd += c * e * sin(ARG[cle]);
    }
    /* Les quatorze corrections additionnelles, en centièmes de minute. */
    const A = [
      [299.77 +  0.107408 * k - 0.009173 * T * T, 0.000325],
      [251.88 +  0.016321 * k, 0.000165], [251.83 + 26.651886 * k, 0.000164],
      [349.42 + 36.412478 * k, 0.000126], [ 84.66 + 18.206239 * k, 0.000110],
      [141.74 + 53.303771 * k, 0.000062], [207.14 +  2.453732 * k, 0.000060],
      [154.84 +  7.306860 * k, 0.000056], [ 34.52 + 27.261239 * k, 0.000047],
      [207.19 +  0.121824 * k, 0.000042], [291.34 +  1.844379 * k, 0.000040],
      [161.72 + 24.198154 * k, 0.000037], [239.56 + 25.513099 * k, 0.000035],
      [331.55 +  3.592518 * k, 0.000023]
    ];
    for (const [a, c] of A) jd += c * sin(a);
    return jd;
  }

  const dateDeJJ = jj => new Date((jj - 2440587.5) * 86400000);

  /* Le mois commence le lendemain du jour de la conjonction, heure locale. */
  function debutLunaison(k) {
    const t = dateDeJJ(nouvelleLune(k));
    const l = new Date(t.getTime() + TZ * 3600000);
    return new Date(Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate() + 1));
  }

  /* Ancre calée sur une date annoncée, pas sur une formule : k = 323 donne le
     1er ramadan 1447, soit le 18 février 2026. Tout le reste s'en déduit,
     un mois lunaire valant exactement une lunaison. */
  const K0 = 323, AN0 = 1447, MOIS0 = 9;

  const MOIS = ["", "mouharram", "safar", "rabi al-awal", "rabi ath-thani",
    "joumada al-oula", "joumada ath-thania", "rajab", "chaabane", "ramadan",
    "chawwal", "dhou al-qi'da", "dhou al-hijja"];

  /* Premier jour (Gregorien, à minuit local) du mois `mois` de l'année `an`. */
  const debutMois = (an, mois) =>
    debutLunaison(K0 + (an - AN0) * 12 + (mois - MOIS0));

  const jourApres = (d, n) => new Date(d.getTime() + n * 86400000);

  /* Les trois repères que tout le monde connaît, pour une année de l'hégire. */
  function feteS(an) {
    const ramadan = debutMois(an, 9);
    const fitr    = debutMois(an, 10);
    const hijja   = debutMois(an, 12);
    return {
      an,
      ramadanDebut: ramadan,
      ramadanFin:   jourApres(fitr, -1),
      aidFitr:      fitr,
      aidKebir:     jourApres(hijja, 9),   // 10 dhou al-hijja
      arafat:       jourApres(hijja, 8)    // la veille
    };
  }

  /* Toutes les fêtes qui tombent dans une fenêtre de dates. On balaie trois
     années de l'hégire : elles glissent d'onze jours par an sur le calendrier
     grégorien, donc une année civile peut en toucher deux. */
  function entre(debut, fin) {
    const out = [];
    const anApprox = Math.round((debut.getUTCFullYear() - 622) * 1.03069);
    for (let a = anApprox - 1; a <= anApprox + 2; a++) {
      const f = feteS(a);
      const cas = [
        { cle: "ramadan", nom: "Ramadan", debut: f.ramadanDebut, fin: f.ramadanFin },
        { cle: "fitr",    nom: "Aïd el-Fitr", debut: f.aidFitr, fin: jourApres(f.aidFitr, 1) },
        { cle: "kebir",   nom: "Aïd el-Kebir", debut: f.aidKebir, fin: jourApres(f.aidKebir, 1) }
      ];
      for (const c of cas) if (c.fin >= debut && c.debut <= fin) out.push({ ...c, an: a });
    }
    return out.sort((x, y) => x.debut - y.debut);
  }

  /* Où en est-on aujourd'hui ? */
  function etat(date = new Date()) {
    const j = new Date(Date.UTC(
      ...(d => [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()])
        (new Date(date.getTime() + TZ * 3600000))));
    const f = entre(jourApres(j, -400), jourApres(j, 400));
    const encours = f.find(x => x.debut <= j && j <= x.fin) || null;
    const suivant = f.find(x => x.debut > j) || null;
    return { jour: j, encours, suivant, tous: f };
  }

  return { nouvelleLune, debutMois, feteS, entre, etat, MOIS, TZ };
})();

/* ---------------------------------------------------------------------------
   AUTOTEST — `node hijri.js`
   Quatre dates annoncées par des autorités indépendantes. Si l'une bouge,
   c'est que la série a été abîmée : ne pas publier.
   --------------------------------------------------------------------------- */
if (typeof module !== "undefined" && require.main === module) {
  const F = d => d.toISOString().slice(0, 10);
  const jp = (d, n) => new Date(d.getTime() + n * 86400000);
  const cas = [
    ["1 ramadan 1447",        F(HIJRI.debutMois(1447, 9)),            "2026-02-18", "Grande Mosquée de Paris"],
    ["1 chawwal 1447 (Fitr)", F(HIJRI.debutMois(1447, 10)),           "2026-03-20", "Fiqh Council of North America"],
    ["1 ramadan 1446",        F(HIJRI.debutMois(1446, 9)),            "2025-03-01", "annoncé en France"],
    ["10 dhou al-hijja 1446", F(jp(HIJRI.debutMois(1446, 12), 9)),    "2025-06-06", "Aïd el-Kebir 2025"]
  ];
  console.log("\n  Calendrier de l'hégire — contrôle sur des dates annoncées\n");
  let ok = true;
  for (const [nom, eu, attendu, src] of cas) {
    const bon = eu === attendu; ok = ok && bon;
    console.log(`   ${bon ? "✓" : "✗"} ${nom.padEnd(24)} ${eu}   attendu ${attendu}   (${src})`);
  }
  console.log("\n  Les cinq prochaines années à Mayotte\n");
  for (let a = 1447; a <= 1451; a++) {
    const f = HIJRI.feteS(a);
    console.log(`   ${a} AH   ramadan du ${F(f.ramadanDebut)} au ${F(f.ramadanFin)}` +
                `   ·   Aïd el-Fitr ${F(f.aidFitr)}   ·   Aïd el-Kebir ${F(f.aidKebir)}`);
  }
  const e = HIJRI.etat();
  console.log(`\n   Aujourd'hui : ${e.encours ? e.encours.nom : "hors fête"}` +
              `${e.suivant ? ` · prochaine : ${e.suivant.nom} vers le ${F(e.suivant.debut)}` : ""}\n`);
  process.exit(ok ? 0 : 1);
}
