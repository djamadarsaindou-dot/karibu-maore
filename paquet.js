/* =============================================================================
   KARIBU MAORÉ — assembleur de version partageable
   -----------------------------------------------------------------------------
       node paquet.js

   Fabrique « karibu-maore-partage.html » : un fichier unique, autonome, qui
   contient le style, les données et tout le code. Sert à envoyer l'appli à
   quelqu'un pour relecture (par lien, par mail, par WhatsApp) sans avoir à
   déployer un site.

   Ce que le fichier unique NE fait PAS, par construction :
   — pas de service worker (donc pas de mode hors connexion),
   — pas de manifeste (donc pas d'installation sur l'écran d'accueil).
   La vraie mise en ligne (GitHub Pages) garde ces deux fonctions.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const ici = f => path.join(__dirname, f);
const lire = f => fs.readFileSync(ici(f), "utf8");

let html = lire("index.html");

/* 1. le style en ligne */
html = html.replace(
  '<link rel="stylesheet" href="style.css">',
  "<style>\n" + lire("style.css") + "\n</style>"
);

/* 2. les scripts en ligne, dans l'ordre de dépendance.
   photos.js est neutralisé : le fichier unique n'embarque pas le dossier
   photos/ (1,4 Mo, impossible à envoyer par WhatsApp), et un <img> qui ne
   charge pas laisserait apparaître son texte de remplacement. On repart donc
   proprement sur les illustrations dessinées, qui sont déjà le repli prévu. */
const scripts = ["data.js", "data-resa.js", "photos.js", "carte.js", "carte-vue.js", "contours.js", "recherche.js", "intentions.js", "astro.js", "hijri.js", "marees.js", "ui.js", "app.js"];
for (const s of scripts) {
  html = html.replace(`<script src="${s}"></script>`, () => {
    let code = lire(s);
    if (s === "photos.js") code = code.replace(/const PHOTOS = \{[\s\S]*?\n\};/, "const PHOTOS = {};");
    return "<script>\n" + code + "\n</script>";
  });
}

/* 3. on retire ce qui exige des fichiers séparés */
html = html
  .replace('<link rel="manifest" href="manifest.webmanifest">\n', "")
  .replace(/<link rel="(icon|apple-touch-icon)"[^>]*>\n?/g, "")
  .replace(
    /if \("serviceWorker" in navigator\) \{[\s\S]*?\n\}/,
    "/* mode hors connexion désactivé dans la version en fichier unique */"
  );

/* 4. une bannière pour que le relecteur sache ce qu'il regarde */
const version = (lire("data.js").match(/version:\s*"([^"]+)"/) || [, "?"])[1];
html = html.replace("</head>",
  `  <meta name="robots" content="noindex">\n` +
  `  <!-- Version de relecture assemblée le ${new Date().toISOString().slice(0, 10)} ` +
  `(v${version}) — sans mode hors connexion ni installation. -->\n</head>`);

const sortie = "karibu-maore-partage.html";
fs.writeFileSync(ici(sortie), html, "utf8");

const ko = (fs.statSync(ici(sortie)).size / 1024).toFixed(0);
console.log(`\n  ✓ ${sortie} — ${ko} Ko, autonome`);
console.log(`    ${scripts.length} scripts + le style intégrés, aucune dépendance externe.`);

/* --------------------------------------------------------------------------
   Variante « artifact » : même contenu, mais sans <!doctype>, <html>, <head>
   ni <body> — l'hébergeur fournit lui-même cette enveloppe. Le <title> reste
   en tête du fichier : c'est lui qui nomme la page.
   -------------------------------------------------------------------------- */
const corps = html.match(/<body>([\s\S]*?)<\/body>/i)[1];
const style = "<style>\n" + lire("style.css") + "\n</style>";
/* Le titre nomme la page dans la galerie : on garde le nom seul, sans
   sous-titre explicatif — l'explication va dans la description au moment
   de la publication. */
const titre = "Karibu Maoré";
const fragment =
  `<title>${titre}</title>\n` +
  `<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n` +
  `<meta name="color-scheme" content="light dark">\n` +
  style + "\n" + corps.trim() + "\n";
fs.writeFileSync(ici("karibu-maore-artifact.html"), fragment, "utf8");
const ko2 = (fs.statSync(ici("karibu-maore-artifact.html")).size / 1024).toFixed(0);
console.log(`  ✓ karibu-maore-artifact.html — ${ko2} Ko, sans enveloppe HTML\n`);
