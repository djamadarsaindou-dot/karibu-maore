/* =============================================================================
   MAORÉ QUEST — vérificateur de contenu
   -----------------------------------------------------------------------------
   À lancer après chaque modification de data.js ou data-resa.js :

       node verifier.js

   Il ne corrige rien : il dit ce qui cloche. Comme le contenu s'édite à la main
   et qu'il n'y a ni build ni tests, c'est le seul filet de sécurité entre une
   faute de frappe et une fiche cassée sur le téléphone de quelqu'un.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

/* Les fichiers de données déclarent des `const` : en contexte isolé, ces liaisons
   ne deviennent pas des propriétés de l'objet global. On les exporte donc
   explicitement, dans la même portée que les déclarations. */
const bac = { console };
vm.createContext(bac);
const source = ["data.js", "data-resa.js"]
  .map(f => fs.readFileSync(path.join(__dirname, f), "utf8")).join("\n") +
  "\n;Object.assign(globalThis, {APP, CATEGORIES, LIEUX, PRESTATAIRES, EVENEMENTS," +
  " ITINERAIRES, LEXIQUE, INFOS});";
vm.runInContext(source, bac, { filename: "donnees" });
const { APP, CATEGORIES, LIEUX, PRESTATAIRES, EVENEMENTS, ITINERAIRES, LEXIQUE, INFOS } = bac;

const erreurs = [], alertes = [], infos = [];
const E = m => erreurs.push(m);
const A = m => alertes.push(m);

const CATS  = new Set(CATEGORIES.map(c => c.id));
const ZONES = new Set(["grande-terre", "petite-terre", "lagon"]);
const TAGS  = new Set(["famille", "sportif", "sansVoiture", "ombre", "pluie", "soir", "groupe", "pmr"]);
const ETATS = new Set(["ouvert", "a-confirmer", "ferme", "modifie"]);
const IDS_P = new Set(PRESTATAIRES.map(p => p.id));

/* ------------------------------------------------------------------ LIEUX */
const vus = new Set();
for (const l of LIEUX) {
  const où = `LIEU « ${l.nom || l.id || "?"} »`;
  if (!l.id) { E(`${où} : identifiant manquant`); continue; }
  if (vus.has(l.id)) E(`${où} : identifiant en double « ${l.id} » (les favoris s'y réfèrent)`);
  vus.add(l.id);
  if (!/^[a-z0-9-]+$/.test(l.id)) E(`${où} : identifiant « ${l.id} » — minuscules, chiffres et tirets uniquement`);

  for (const champ of ["nom", "cat", "commune", "zone", "resume", "texte", "quand"])
    if (!l[champ]) E(`${où} : champ « ${champ} » manquant`);

  if (l.cat && !CATS.has(l.cat))   E(`${où} : catégorie inconnue « ${l.cat} »`);
  if (l.zone && !ZONES.has(l.zone)) E(`${où} : zone inconnue « ${l.zone} »`);
  if (typeof l.duree !== "number" || l.duree <= 0) E(`${où} : durée invalide (${l.duree})`);
  if (![0, 1, 2, 3].includes(l.budget)) E(`${où} : budget hors échelle 0-3 (${l.budget})`);
  if (l.maree && !["basse", "haute"].includes(l.maree)) E(`${où} : marée « ${l.maree} » (attendu basse ou haute)`);
  if (!Array.isArray(l.saison)) E(`${où} : saison doit être un tableau`);
  else for (const m of l.saison) if (!Number.isInteger(m) || m < 1 || m > 12) E(`${où} : mois invalide « ${m} »`);
  if (!Array.isArray(l.tags)) E(`${où} : tags doit être un tableau`);
  else for (const t of l.tags) if (!TAGS.has(t)) A(`${où} : tag inhabituel « ${t} » (connus : ${[...TAGS].join(", ")})`);
  if (!Array.isArray(l.conseils) || !l.conseils.length) A(`${où} : aucun conseil de terrain — c'est ce qui fait la valeur de la fiche`);
  if (!Array.isArray(l.presta)) E(`${où} : presta doit être un tableau`);
  else for (const p of l.presta) if (!IDS_P.has(p)) E(`${où} : prestataire inconnu « ${p} »`);

  if (!Array.isArray(l.gps) || l.gps.length !== 2) E(`${où} : gps attendu sous la forme [lat, lon]`);
  else {
    const [la, lo] = l.gps;
    if (la > -12.5 || la < -13.1 || lo < 44.9 || lo > 45.4)
      A(`${où} : coordonnées hors de Mayotte (${la}, ${lo})`);
  }
  if (l.etat && !ETATS.has(l.etat)) E(`${où} : état inconnu « ${l.etat} » (${[...ETATS].join(", ")})`);
  if (l.verifie && !/^\d{4}-\d{2}-\d{2}$/.test(l.verifie)) E(`${où} : date de vérification « ${l.verifie} » (attendu AAAA-MM-JJ)`);
  if (l.sources) {
    if (!Array.isArray(l.sources)) E(`${où} : sources doit être un tableau`);
    else l.sources.forEach((s, i) => {
      if (!s || !s.t || !s.u) E(`${où} : source ${i + 1} incomplète (attendu {t, u})`);
      else if (!/^https?:\/\//.test(s.u)) E(`${où} : source ${i + 1} — URL invalide « ${s.u} »`);
    });
  }
  if (l.resume && l.resume.length > 110) A(`${où} : résumé long (${l.resume.length} car.) — il est tronqué visuellement au-delà`);
  if (l.texte && l.texte.length < 80) A(`${où} : description très courte (${l.texte.length} car.)`);
}

/* ----------------------------------------------------------- PRESTATAIRES */
const vusP = new Set();
for (const p of PRESTATAIRES) {
  const où = `PRESTATAIRE « ${p.nom || p.id} »`;
  if (vusP.has(p.id)) E(`${où} : identifiant en double « ${p.id} »`);
  vusP.add(p.id);
  if (p.verifie && !p.tel) E(`${où} : marqué vérifié mais sans numéro`);
  if (p.tel && !/^\d{9,15}$/.test(p.tel))
    E(`${où} : numéro « ${p.tel} » — format international attendu, sans + ni espaces (ex. 262639123456)`);
  if (p.tel && !p.verifie) A(`${où} : numéro renseigné mais « verifie » est faux — il ne sera pas utilisé`);
  if (!LIEUX.some(l => l.presta.includes(p.id))) A(`${où} : rattaché à aucune fiche`);
}

/* -------------------------------------------------------------- ITINÉRAIRES */
for (const i of ITINERAIRES) {
  const où = `JOURNÉE « ${i.nom} »`;
  if (!i.etapes?.length) E(`${où} : aucune étape`);
  for (const e of i.etapes || []) {
    if (!vus.has(e.lieu)) E(`${où} : étape « ${e.quoi} » pointe vers une fiche inconnue « ${e.lieu} »`);
    if (!e.h || !e.quoi) E(`${où} : étape incomplète (h et quoi obligatoires)`);
  }
  const zones = new Set((i.etapes || []).map(e => bac.LIEUX.find(l => l.id === e.lieu)?.zone).filter(Boolean));
  if (zones.has("grande-terre") && zones.has("petite-terre") && !/barge|petite-terre/i.test(i.nom + i.note))
    A(`${où} : mélange Grande-Terre et Petite-Terre sans mentionner la barge — le trajet est sous-estimé`);
}

/* ------------------------------------------------------------------ AGENDA */
for (const e of EVENEMENTS) {
  const où = `ÉVÉNEMENT « ${e.nom} »`;
  if (e.lien && !vus.has(e.lien)) E(`${où} : lien vers une fiche inconnue « ${e.lien} »`);
  if (e.type === "recurrent" && !Number.isInteger(e.jour)) E(`${où} : jour de la semaine manquant (0 = dimanche)`);
  if (e.type === "saison" && (!e.debut || !e.fin)) E(`${où} : période incomplète`);
  if (!["recurrent", "saison", "date"].includes(e.type)) E(`${où} : type « ${e.type} » inconnu`);
}

/* -------------------------------------------------------------- APP & DIVERS */
if (/^2626390{6}$/.test(APP.contactWhatsApp))
  A(`APP : le numéro WhatsApp est encore le numéro d'exemple — à remplacer avant publication`);
if (!/^\d{9,15}$/.test(APP.contactWhatsApp))
  E(`APP : contactWhatsApp « ${APP.contactWhatsApp} » — format international sans + ni espaces`);
if (!LEXIQUE.length) A(`LEXIQUE vide`);
if (!INFOS.length) A(`INFOS vides`);

/* ===================== LE NOM DE L'APPLICATION ============================
   Le nom vit dans APP.nom, et tout le code s'y réfère. Deux fichiers ne
   PEUVENT PAS le lire : index.html et le manifeste sont analysés avant que le
   moindre script ne tourne. Ils gardent donc une copie littérale — et une
   copie non surveillée finit toujours par diverger. Celle-ci l'est.

   L'adresse publique, le nom de la police et la clé du cache gardent
   volontairement l'ancien nom : ce sont des identifiants techniques que
   personne ne lit, et les changer casserait des liens déjà partagés ou
   obligerait à refabriquer la police sous sa notice OFL. */
{
  const fs = require("fs"), path = require("path");
  const nom = APP.nom;
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const man = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.webmanifest"), "utf8"));

  if (!html.includes("<title>" + nom)) E(`index.html : le <title> ne commence pas par « ${nom} »`);
  const marque = html.match(/id="marque"[\s\S]*?<span>([^<]+)<\/span>/);
  if (marque && marque[1].trim() !== nom) {
    E(`index.html : l'en-tête affiche « ${marque[1].trim() }» au lieu de « ${nom} »`);
  }
  const apple = html.match(/apple-mobile-web-app-title" content="([^"]*)"/);
  if (apple && apple[1] !== nom) E(`index.html : apple-mobile-web-app-title = « ${apple[1]} »`);
  if (man.short_name !== nom) E(`manifest : short_name = « ${man.short_name} » au lieu de « ${nom} »`);
  if (!man.name.startsWith(nom)) E(`manifest : name = « ${man.name} » ne commence pas par « ${nom} »`);
  infos.push(`nom de l'application : « ${nom} » — index.html et manifeste concordent`);
}

/* ================= LES PAGES D'APERÇU DE PARTAGE ==========================
   Elles sont fabriquées par outils/og.py à partir de data.js. Rien ne les
   régénère automatiquement : une fiche ajoutée sans relancer le script
   partirait avec un lien mort. Ce contrôle est là pour ça, et il bloque.

   On vérifie aussi les ORPHELINES : une fiche renommée laisse derrière elle
   une page qui redirige vers un identifiant qui n'existe plus, et l'aperçu
   continue de circuler dans les conversations longtemps après. */
{
  const fs = require("fs"), path = require("path");
  const ici = __dirname;
  const dirHtml = path.join(ici, "l"), dirImg = path.join(ici, "og");
  const lu = d => fs.existsSync(d) ? fs.readdirSync(d) : null;
  const pages = lu(dirHtml), images = lu(dirImg);

  if (!pages || !images) {
    A("dossiers l/ et og/ absents — lancer `python outils/og.py`");
  } else {
    const attendus = new Set(LIEUX.map(l => l.id));
    for (const l of LIEUX) {
      if (!pages.includes(l.id + ".html")) E(`page d'aperçu manquante : l/${l.id}.html`);
      if (!images.includes(l.id + ".jpg")) E(`image d'aperçu manquante : og/${l.id}.jpg`);
    }
    for (const f of pages) {
      const id = f.replace(/\.html$/, "");
      if (!attendus.has(id)) E(`page d'aperçu orpheline : l/${f} (aucune fiche « ${id} »)`);
    }
    for (const f of images) {
      const id = f.replace(/\.jpg$/, "");
      if (!attendus.has(id)) E(`image d'aperçu orpheline : og/${f}`);
    }
    /* Le contenu doit suivre la fiche, pas seulement exister. */
    for (const l of LIEUX.slice(0, 400)) {
      const p = path.join(dirHtml, l.id + ".html");
      if (!fs.existsSync(p)) continue;
      const t = fs.readFileSync(p, "utf8");
      const m = t.match(/<meta property="og:title" content="([^"]*)"/);
      /* On DÉCODE avant de comparer plutôt que de ré-encoder : le générateur
         échappe l'apostrophe en &#x27;, ce qui est parfaitement légal dans un
         attribut, et une comparaison naïve criait au faux positif sur les
         trois fiches qui en portent une. */
      const decoder = x => x.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      if (m && decoder(m[1]) !== l.nom) {
        E(`l/${l.id}.html annonce « ${decoder(m[1])} » au lieu de « ${l.nom} » — relancer outils/og.py`);
      }
      if (!t.includes(`../#/lieu/${l.id}`)) E(`l/${l.id}.html ne redirige pas vers sa fiche`);
    }
    infos.push(`${pages.length} pages d'aperçu de partage, ${images.length} images`);
  }
}

/* ------------------------------------------------------------------ BILAN */
const nonVerifies = PRESTATAIRES.filter(p => !p.verifie).length;
const sansSource  = LIEUX.filter(l => !l.sources?.length).length;
infos.push(`${LIEUX.length} fiches · ${PRESTATAIRES.length} prestataires (${nonVerifies} non vérifiés) · ` +
           `${ITINERAIRES.length} journées · ${EVENEMENTS.length} entrées d'agenda · ${LEXIQUE.length} mots`);
infos.push(`${sansSource} fiche(s) sans source citée`);

const couleur = (c, t) => process.stdout.isTTY ? `\x1b[${c}m${t}\x1b[0m` : t;
console.log("\n" + couleur(36, `— ${APP.nom.toUpperCase()} · vérification du contenu —`));
infos.forEach(i => console.log("  " + i));
if (alertes.length) {
  console.log("\n" + couleur(33, `${alertes.length} point(s) d'attention`));
  alertes.forEach(a => console.log("  · " + a));
}
if (erreurs.length) {
  console.log("\n" + couleur(31, `${erreurs.length} ERREUR(S) — à corriger avant de publier`));
  erreurs.forEach(e => console.log("  ✗ " + e));
} else {
  console.log("\n" + couleur(32, "Aucune erreur bloquante."));
}
console.log("");
process.exit(erreurs.length ? 1 : 0);
