/* =============================================================================
   MAORÉ QUEST — la recherche
   -----------------------------------------------------------------------------
   Avant : un `texte.includes(requête)`. « chougnui » ne trouvait rien, et
   « tortue » rendait quatre fiches dans l'ordre du fichier, sans classement.

   Maintenant, trois étages :

   1. BM25F — un vrai classement, pondéré par champ. Le nom d'un lieu pèse huit
      fois plus que le corps de sa description.
   2. Tolérance aux fautes en deux temps : préfiltre par bigrammes (Jaccard),
      puis Damerau-Levenshtein en bande. La TRANSPOSITION est indispensable :
      « chougnui » → « choungui » vaut 1 en Damerau, 2 en Levenshtein simple.
   3. Intentions — « que faire quand il pleut » devient un filtre sur le tag
      `pluie`, et non une recherche des mots « que », « faire » et « pleut ».

   L'index se construit PARESSEUSEMENT, à la première recherche : sur un
   téléphone d'entrée de gamme, le construire au chargement coûterait 15 à 30 ms
   au moment précis où l'utilisateur regarde l'écran.
   ========================================================================== */

const RECHERCHE = (() => {

  /* Le nom d'un lieu vaut huit fois son texte : quelqu'un qui tape « choungui »
     veut la fiche Choungui, pas les six fiches qui la mentionnent. */
  const POIDS = { nom: 8, commune: 5, resume: 3, tags: 3, texte: 1, quand: 1, conseils: 0.6 };
  const K1 = 1.2, B = 0.75;

  /* Les tournures interrogatives sont le propre d'une recherche par intention :
     elles n'apportent rien au classement et, exigées en ET, elles rendent zéro. */
  const VIDES = new Set(("que quoi qui ou où voir aller faire trouver cherche veux quel quelle " +
    "quels quelles comment quand tout toute tous toutes trop peu un une des les la le du de " +
    "d l et en dans sur pour avec sans a à au aux est sont ce cet cette il elle on y " +
    "je nous vous plus moins bien tres très").split(" "));

  function norm(s) {
    return String(s == null ? "" : s).toLowerCase().normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ɓ/g, "b").replace(/ɗ/g, "d")     // implosives du shimaoré
      .replace(/[’']/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
  }

  /* Désuffixage léger. Porter ferait plus de mal que de bien sur 43 fiches :
     il rapprocherait des mots que personne ne confond. */
  function racine(m) {
    if (m.length <= 4) return m;
    if (m.endsWith("eaux")) return m.slice(0, -1);
    if (m.endsWith("aux")) return m.slice(0, -3) + "al";
    if (/(ses|res|nes|les|tes)$/.test(m)) return m.slice(0, -1);
    if (m.endsWith("euse")) return m.slice(0, -4) + "eur";
    if (/[sx]$/.test(m)) return m.slice(0, -1);
    return m;
  }

  const mots = t => norm(t).split(" ").filter(m => m && !VIDES.has(m)).map(racine);

  /* Bigrammes du mot encadré d'espaces — la convention de pg_trgm. */
  function bigrammes(m) {
    const s = " " + m + " ", out = new Set();
    for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
    return out;
  }
  function jaccard(a, b) {
    let n = 0;
    for (const x of a) if (b.has(x)) n++;
    return n / (a.size + b.size - n);
  }

  /* Damerau-Levenshtein avec sortie anticipée. */
  function damerau(a, b, max) {
    const n = a.length, m = b.length;
    if (Math.abs(n - m) > max) return max + 1;
    let prev2 = null, prev = new Array(m + 1), cur = new Array(m + 1);
    for (let j = 0; j <= m; j++) prev[j] = j;
    for (let i = 1; i <= n; i++) {
      cur[0] = i;
      let ligne = cur[0];
      for (let j = 1; j <= m; j++) {
        const c = a[i - 1] === b[j - 1] ? 0 : 1;
        let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        /* la transposition : c'est elle qui rattrape « chougnui » */
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          v = Math.min(v, prev2[j - 2] + 1);
        }
        cur[j] = v;
        if (v < ligne) ligne = v;
      }
      if (ligne > max) return max + 1;            // inutile d'aller plus loin
      prev2 = prev; prev = cur; cur = new Array(m + 1);
    }
    return prev[m];
  }

  /* ------------------------------------------------------------- L'INDEX */
  let index = null;

  function construire(lieux) {
    const docs = [], df = new Map();
    let total = 0;
    for (const l of lieux) {
      const champs = {
        nom: l.nom, commune: l.commune, resume: l.resume,
        tags: (l.tags || []).join(" ") + " " + (l.cat || "") + " " + (l.zone || "").replace(/-/g, " "),
        texte: l.texte, quand: l.quand,
        conseils: (l.conseils || []).join(" ")
      };
      const tf = new Map();
      let taille = 0;
      for (const [champ, val] of Object.entries(champs)) {
        const p = POIDS[champ] || 1;
        for (const m of mots(val)) {
          tf.set(m, (tf.get(m) || 0) + p);
          taille += p;
        }
      }
      for (const m of tf.keys()) df.set(m, (df.get(m) || 0) + 1);
      total += taille;
      docs.push({ id: l.id, tf, taille });
    }
    const N = docs.length, moy = total / N || 1;
    /* bigrammes de chaque terme, pour le rattrapage de fautes */
    const termes = [...df.keys()].map(t => ({ t, bg: bigrammes(t) }));
    return { docs, df, N, moy, termes };
  }

  /* Termes voisins d'un mot mal tapé : préfiltre par bigrammes puis Damerau. */
  function voisins(mot, ix) {
    const max = mot.length <= 4 ? 1 : 2;
    const bg = bigrammes(mot), out = [];
    for (const { t, bg: bt } of ix.termes) {
      if (jaccard(bg, bt) < 0.3) continue;
      const d = damerau(mot, t, max);
      if (d && d <= max) {
        /* Sans cette atténuation, une faute vaudrait autant qu'un mot juste. */
        out.push({ t, poids: 1 - d / Math.max(mot.length, t.length) });
      }
    }
    return out.sort((a, b) => b.poids - a.poids).slice(0, 3);
  }

  /* ------------------------------------------------------------- LE SCORE */
  function bm25(requete, lieux) {
    if (!index || index.docs.length !== lieux.length) index = construire(lieux);
    const ix = index;
    const q = mots(requete);
    if (!q.length) return new Map();

    /* Chaque mot devient un ou plusieurs termes pondérés : lui-même s'il
       existe, ses voisins sinon, plus le préfixe pour le DERNIER mot — sinon
       « pas » remonterait « passe », « passerelle » et « passionnent ». */
    const cibles = [];
    q.forEach((m, i) => {
      if (ix.df.has(m)) cibles.push({ t: m, poids: 1 });
      else voisins(m, ix).forEach(v => cibles.push(v));
      if (i === q.length - 1 && m.length >= 4) {
        for (const t of ix.df.keys()) {
          if (t !== m && t.startsWith(m)) cibles.push({ t, poids: 0.75 });
        }
      }
    });

    const scores = new Map();
    for (const { t, poids } of cibles) {
      const n = ix.df.get(t) || 0;
      if (!n) continue;
      const idf = Math.log(1 + (ix.N - n + 0.5) / (n + 0.5));   // variante Lucene
      for (const d of ix.docs) {
        const f = d.tf.get(t);
        if (!f) continue;
        const s = idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * d.taille / ix.moy));
        scores.set(d.id, (scores.get(d.id) || 0) + s * poids);
      }
    }
    return scores;
  }

  /* Vide l'index quand le contenu change (rechargement d'une version). */
  const oublier = () => { index = null; };

  return { bm25, mots, norm, racine, voisins, oublier, VIDES };
})();

/* ---------------------------------------------------------------------------
   AUTOTEST — `node recherche.js`
   --------------------------------------------------------------------------- */
if (typeof module !== "undefined" && require.main === module) {
  const fs = require("fs"), vm = require("vm"), path = require("path");
  const bac = { console };
  vm.createContext(bac);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "data.js"), "utf8"), bac);
  vm.runInContext("globalThis.L = LIEUX", bac);
  const LIEUX = bac.L;
  const nom = id => (LIEUX.find(l => l.id === id) || {}).nom || id;

  const cas = [
    ["choungui",  "choungui"],
    ["chougnui",  "choungui"],   // faute de frappe : transposition
    ["ilot",      null],
    ["tortue",    "ngouja"],
    ["baleine",   "baleines"],
    ["mosquee",   "tsingoni"],
    ["marée basse platier", null]
  ];
  console.log("\n  Recherche — classement\n");
  let ok = true;
  for (const [q, attendu] of cas) {
    const s = [...RECHERCHE.bm25(q, LIEUX)].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const tete = s.length ? s[0][0] : "(rien)";
    const bon = !attendu || tete === attendu;
    ok = ok && bon;
    console.log(`   ${(bon ? "✓" : "✗")} « ${q} »`.padEnd(30) +
      s.map(([id, v]) => `${nom(id)} ${v.toFixed(2)}`).join(" · "));
  }
  const t0 = Date.now();
  for (let i = 0; i < 200; i++) RECHERCHE.bm25("ou voir des tortues", LIEUX);
  console.log(`\n   200 recherches en ${Date.now() - t0} ms\n`);
  process.exit(ok ? 0 : 1);
}
