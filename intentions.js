/* =============================================================================
   MAORÉ QUEST — les intentions
   -----------------------------------------------------------------------------
   Ce que les gens tapent, ce ne sont pas des mots-clés : c'est « que faire
   quand il pleut », « avec les enfants », « sans voiture », « où voir des
   tortues ». Cette table traduit ces formulations en filtres et en bonus.

   DEUX EFFETS, ET LA DISTINCTION EST INDISPENSABLE
     f = filtre dur — on écarte ce qui ne colle pas
     b = bonus      — on remonte sans écarter
   Une catégorie n'est JAMAIS un filtre : quelqu'un qui tape « rando » ne veut
   pas qu'on lui cache la plage au bout du sentier.

   LECTURE EN « MAXIMAL MUNCH » : toujours la formulation la plus longue qui
   colle. C'est ce qui fait gagner « sans voiture » sur « voiture », et
   « demain matin » sur « demain ».

   SHIMAORÉ : seuls les mots déjà relus et publiés dans le LEXIQUE sont repris
   ici. Les autres attendent un locuteur, comme le prévoit l'en-tête du lexique.
   Et le dictionnaire local n'est jamais versé : ses licences l'interdisent.
   ========================================================================== */

const INTENTIONS = (() => {

  /* [formulations, effet] — l'ordre n'importe pas, le tri par longueur est fait
     à la construction. */
  const TABLE = [
    /* — météo — */
    [["il pleut", "quand il pleut", "sous la pluie", "mauvais temps", "jour de pluie",
      "temps pourri", "pluvieux", "orage", "au sec", "a l abri", "abri", "couvert",
      "vua", "kashikazi"], { f: { tags: ["pluie"] } }],
    [["il fait chaud", "trop chaud", "canicule", "a l ombre", "ombre", "au frais",
      "plein soleil", "jua"], { f: { tags: ["ombre"] } }],

    /* — public — */
    [["avec les enfants", "pour les enfants", "en famille", "avec des enfants",
      "enfant", "enfants", "bebe", "poussette", "ado"], { f: { tags: ["famille"] } }],
    [["poussette", "mobilite reduite", "fauteuil", "pmr", "accessible"], { f: { tags: ["pmr"] } }],
    [["sport", "du denivele", "ca grimpe", "rando sportive", "sportif", "transpirer",
      "trail", "difficile"], { f: { tags: ["sportif"] } }],
    [["sans voiture", "pas de voiture", "en bus", "a pied", "sans permis", "en barge",
      "transport en commun", "sans se deplacer"], { f: { tags: ["sansVoiture"] } }],
    [["le soir", "ce soir", "en soiree", "de nuit", "la nuit", "coucher de soleil",
      "apres le travail"], { f: { tags: ["soir"] } }],
    [["a plusieurs", "en groupe", "entre amis", "groupe", "bande"], { f: { tags: ["groupe"] } }],

    /* — argent : ne pas confondre « gratuit » et « pas cher » — */
    [["gratuit", "gratuite", "gratuits", "gratuites", "sans payer", "zero euro",
      "sans depenser", "gratuitement"], { f: { budget: 0 } }],
    [["pas cher", "bon marche", "petit budget", "fauche", "economique", "rahisi"],
      { f: { budgetMax: 1 } }],
    [["se faire plaisir", "luxe", "haut de gamme", "grand jeu"], { f: { budgetMin: 2 } }],
    [["reserver", "reservation", "avec un guide", "encadre", "prestataire", "club"],
      { f: { reservable: true } }],

    /* — catégories : bonus, jamais filtre — */
    [["rando", "randonnee", "marcher", "sentier", "montagne", "sommet", "point de vue",
      "panorama", "foret", "balade", "mulima", "milima"], { b: { cat: "nature" } }],
    [["plage", "sable", "bronzer", "se baigner", "baignade", "ilot", "banc de sable",
      "crique", "mutsanga", "mutsangani"], { b: { cat: "plage" } }],
    [["mer", "lagon", "bateau", "plongee", "masque et tuba", "pmt", "palmes", "kayak",
      "paddle", "recif", "barriere de corail", "bahari", "snorkeling"], { b: { cat: "mer" } }],
    [["culture", "musee", "patrimoine", "histoire", "mosquee", "ziara", "danse",
      "artisanat", "dago", "tradition"], { b: { cat: "culture" } }],
    [["manger", "restaurant", "resto", "cuisine", "voule", "brochette", "faim",
      "bazari", "marche", "gouter"], { b: { cat: "food" } }],
    [["se deplacer", "barge", "taxi", "location de voiture", "aeroport", "arriver",
      "transport"], { b: { cat: "pratique" } }],

    /* — faune : injectée comme TERME de recherche, pas comme bonus plat.
         Un bonus forfaitaire mettrait les quatre fiches « tortue » à égalité
         parfaite ; en injectant le mot, on obtient un vrai ordre. — */
    [["tortue", "tortues", "ponte", "nyamba"], { mot: "tortue" }],
    [["baleine", "baleines", "cetace"], { mot: "baleine" }],
    [["dauphin", "dauphins"], { mot: "dauphin" }],
    [["maki", "makis", "lemurien", "komba"], { mot: "maki" }],
    [["oiseau", "oiseaux", "ornitho"], { mot: "oiseau" }],
    [["poisson", "poissons", "corail", "fi"], { mot: "corail poisson" }],

    /* — zone — */
    [["petite terre", "pamandzi", "dzaoudzi", "labattoir"], { f: { zone: "petite-terre" } }],
    [["grande terre"], { f: { zone: "grande-terre" } }],
    [["dans le nord", "au nord", "nord"], { b: { nord: true } }],
    [["dans le sud", "au sud", "sud"], { b: { sud: true } }],

    /* — marée : branchée sur le moteur, donc toujours juste — */
    [["maree basse", "peche a pied", "platier", "decouvert", "basse mer"],
      { f: { maree: "basse" } }],
    [["maree haute", "pleine mer"], { f: { maree: "haute" } }],

    /* — durée — */
    [["une heure", "vite fait", "rapide", "pas longtemps"], { f: { dureeMax: 1.5 } }],
    [["demi journee", "une demi journee", "une matinee", "un apres midi"], { f: { dureeMax: 4 } }],
    [["la journee", "toute la journee", "journee entiere"], { f: { dureeMin: 4 } }],

    /* — temps — */
    [["aujourd hui", "maintenant", "leo", "tout de suite"], { f: { jour: 0 } }],
    [["demain", "meso", "demain matin"], { f: { jour: 1 } }],
    [["ce week end", "week end", "samedi", "dimanche"], { f: { weekend: true } }],
    [["en ce moment", "c est la saison", "de saison"], { f: { saison: true } }]
  ];

  /* Table aplatie, triée par longueur décroissante : la plus longue gagne. */
  const REGLES = TABLE
    .flatMap(([formes, effet]) => formes.map(f => ({ forme: f, effet, n: f.split(" ").length })))
    .sort((a, b) => b.forme.length - a.forme.length);

  /* Lit une requête et en extrait filtres, bonus, termes et mots restants. */
  function lire(requete) {
    let reste = " " + RECHERCHE.norm(requete) + " ";
    const f = {}, b = {}, motsInjectes = [];
    const touches = [];
    for (const r of REGLES) {
      const cible = " " + r.forme + " ";
      if (!reste.includes(cible)) continue;
      reste = reste.split(cible).join(" ");
      touches.push(r.forme);
      if (r.effet.f) {
        for (const [k, v] of Object.entries(r.effet.f)) {
          /* Les tags s'ajoutent : « avec les enfants sans voiture » en demande
             deux, et les écraser rendrait la moitié de la requête muette. */
          if (k === "tags") f.tags = [...new Set([...(f.tags || []), ...v])];
          else f[k] = v;
        }
      }
      if (r.effet.b) Object.assign(b, r.effet.b);
      if (r.effet.mot) motsInjectes.push(r.effet.mot);
    }
    return { filtres: f, bonus: b, mots: motsInjectes, touches, reste: reste.trim() };
  }

  return { lire, REGLES, TABLE };
})();

/* ---------------------------------------------------------------------------
   AUTOTEST — `node intentions.js`
   --------------------------------------------------------------------------- */
if (typeof module !== "undefined" && require.main === module) {
  const fs = require("fs"), vm = require("vm"), path = require("path");
  const bac = { console };
  vm.createContext(bac);
  for (const f of ["data.js", "recherche.js", "intentions.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, f), "utf8"), bac, { filename: f });
  }
  vm.runInContext("globalThis.I = INTENTIONS; globalThis.R = RECHERCHE", bac);
  const cas = [
    "que faire quand il pleut",
    "avec les enfants sans voiture",
    "ou voir des tortues",
    "une rando pas trop dure avec les enfants",
    "plage gratuite pour ce week end",
    "peche a pied"
  ];
  console.log("\n  Intentions\n");
  for (const q of cas) {
    const r = bac.I.lire(q);
    console.log(`   « ${q} »`);
    console.log(`      filtres ${JSON.stringify(r.filtres)} · bonus ${JSON.stringify(r.bonus)}` +
                (r.mots.length ? ` · mots ${r.mots.join(",")}` : "") +
                ` · reste « ${r.reste} »`);
  }
  console.log();
}
