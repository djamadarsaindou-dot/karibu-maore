# Karibu Maoré — mode d'emploi technique

Application web (PWA) qui répertorie ce qu'il y a à faire à Mayotte et prépare les demandes
de réservation. **Statique : aucun serveur, aucune base de données, aucun npm, aucun build.**
On édite un fichier, on enregistre, on pousse.

---

## Lancer en local

```bash
cd "C:/Users/djama/Documents/Karibu-Maore" && python -m http.server 8787
```

Puis ouvrir <http://127.0.0.1:8787>.

> Il faut passer par un petit serveur : en ouvrant `index.html` directement (`file://`),
> le mode hors connexion ne s'active pas.

---

## Les fichiers

| Fichier | Rôle | À éditer ? |
|---|---|---|
| `data.js` | **Le contenu** : les fiches de lieux et d'activités | ✅ tout le temps |
| `data-resa.js` | Prestataires, agenda, journées, lexique, infos pratiques | ✅ tout le temps |
| `index.html` | La coquille de l'appli (une trentaine de lignes) | rarement |
| `app.js` | La logique : routage, filtres, favoris, réservation, accessibilité | si nouvelle fonction |
| `ui.js` | **Les illustrations** : icônes, vignettes générées, courbe de marée | pour retoucher le dessin |
| `marees.js` | Le calcul de marée embarqué | pour la calibration (voir plus bas) |
| `style.css` | Le système de design : jetons de couleur, typographie, composants | au goût |
| `sw.js` | Le mode hors connexion | ⚠️ incrémenter `CACHE` à chaque mise à jour |
| `manifest.webmanifest`, `icone*.svg` | Installation sur l'écran d'accueil | rarement |
| `verifier.js` | Contrôle du contenu (`node verifier.js`) | jamais, on l'exécute |
| `paquet.js` | Assemble la version en fichier unique (`node paquet.js`) | jamais, on l'exécute |

Rien n'est minifié ni transpilé : ce que vous lisez est exactement ce que le navigateur exécute.

---

## Après chaque modification du contenu

```bash
cd "C:/Users/djama/Documents/Karibu-Maore" && node verifier.js
```

Il vérifie les identifiants en double, les renvois cassés (une journée qui pointe vers une
fiche supprimée), les catégories inconnues, les budgets hors échelle, les coordonnées hors
de Mayotte, le format des numéros de téléphone, les sources mal formées. Il sort en erreur
s'il trouve un problème bloquant — pratique si vous ajoutez un jour un contrôle avant
publication.

---

## Partager l'appli pour relecture

```bash
cd "C:/Users/djama/Documents/Karibu-Maore" && node paquet.js
```

Produit deux fichiers autonomes (environ 165 Ko chacun, tout est dedans) :

- `karibu-maore-partage.html` — un fichier HTML complet, qu'on peut envoyer par mail ou par
  WhatsApp : le destinataire l'ouvre et l'appli fonctionne.
- `karibu-maore-artifact.html` — le même contenu sans enveloppe `<html>`, format attendu
  pour publier une page hébergée sur claude.ai.

Ces versions **n'ont ni mode hors connexion ni installation sur l'écran d'accueil** (les deux
demandent des fichiers séparés servis en HTTPS). C'est normal : elles servent à faire relire,
pas à remplacer la mise en ligne.

---

## Les trois choses à faire AVANT de publier

### 1. Mettre le vrai numéro WhatsApp

Dans `data.js`, en haut :

```js
contactWhatsApp: "262639000000",   // ← à remplacer
```

Format international, **sans `+` ni espaces**. Un mobile mahorais `0639 12 34 56`
s'écrit `262639123456`. `node verifier.js` vous rappellera tant que c'est le numéro d'exemple.

### 2. Activer les prestataires réels

Dans `data-resa.js`, aucun nom ni numéro n'a été inventé : tous les prestataires sont des
**catégories** avec `tel: null` et `verifie: false`. Tant que `verifie` est faux, l'appli
affiche « contact à confirmer » et redirige la demande vers vous.

Pour activer une fiche, **après accord de la personne** :

```js
{ id: "bateau-sud", nom: "Le vrai nom de la société", type: "Bateau",
  tel: "262639XXXXXX", verifie: true, offre: "…", zone: "Sud" }
```

Ne publiez jamais un numéro sans accord : c'est une donnée personnelle, et sur une île de
374 km² une fiche non désirée se règle très vite en face à face.

### 3. Le calcul de marée — ce qu'il vaut, et ce qu'il ne faut pas en faire

`marees.js` est un **modèle harmonique à 28 ondes**, calculé sur l'appareil, sans réseau.
Les constantes sont celles du marégraphe de Dzaoudzi (station GLOSS n° 96, série ouverte le
16 octobre 1963), publiées dans la base **TICON-3** sous licence CC-BY-4.0. Les niveaux de
référence viennent des **Références Altimétriques Maritimes du Shom** (Licence Ouverte Etalab).

Un autotest est intégré :

```bash
cd "C:/Users/djama/Documents/Karibu-Maore" && node marees.js
```

Il compare la prédiction du 1er juillet 2026 à l'annuaire officiel : l'écart doit rester sous
6 minutes et 4 centimètres. S'il casse un jour, c'est que quelqu'un a touché aux constantes
ou aux corrections nodales.

Ce qu'il faut savoir avant d'y toucher :

- **Pas de coefficient de marée.** C'est une convention métropolitaine calculée à partir de
  Brest ; le Shom renvoie `---` pour les ports d'outre-mer. On affiche le marnage du jour et
  la hauteur des basses mers, qui disent vraiment si le platier sera découvert.
- **Toujours les quatre étales.** La marée mahoraise est semi-diurne *à inégalité diurne* :
  les deux basses mers d'une même journée diffèrent de 20 à 60 cm. Ne jamais écrire
  « la marée basse du jour » au singulier.
- **C'est une prédiction astronomique.** Elle ignore la météo : une dépression ou un vent
  d'afflux peut faire monter l'eau au-delà. Ne jamais la présenter comme un horaire officiel.
- **Une seule table pour toute l'île.** Dans le lagon, la marée ne varie que d'une dizaine de
  minutes d'un point à l'autre. Ce sont les *courants* qui changent tout — et eux, l'appli ne
  les prédit pas, volontairement : le modèle de référence lui-même se trompe jusqu'à une heure
  sur leur phase dans les passes larges.
- **Ne pas recopier les tables du Shom.** Elles sont consultables gratuitement mais ne sont pas
  sous licence ouverte. L'appli calcule ses propres prédictions et cite le Shom comme référence.

---

## Ajouter un lieu

Copier un bloc existant dans `data.js` et modifier. Le seul champ délicat est `id` :
il doit être unique et **ne jamais changer ensuite** (les favoris des utilisateurs s'y réfèrent).

```js
{
  id: "nouvelle-fiche", nom: "Nom affiché", cat: "nature", commune: "Bandrélé",
  zone: "grande-terre",              // grande-terre | petite-terre | lagon
  resume: "Une phrase.",             // 110 caractères maximum
  texte: "Le paragraphe de description.",
  quand: "Le meilleur moment.",
  duree: 3,                          // en heures
  budget: 1,                         // 0 gratuit · 1 petit · 2 moyen · 3 élevé
  maree: "basse",                    // "basse" | "haute" | null
  saison: [7,8,9],                   // mois où c'est au top ; [] = toute l'année
  tags: ["famille", "sansVoiture"],  // famille · sportif · sansVoiture · ombre · pluie
  conseils: ["Le vrai savoir local, une phrase par ligne."],
  presta: ["bateau-sud"],            // [] si rien à réserver
  gps: [-12.90, 45.19],              // approximatif, sert au tri, pas à la navigation

  // facultatif mais recommandé — affiché en bas de la fiche
  verifie: "2026-08-25",             // date de dernière vérification
  etat: "ouvert",                    // ouvert | a-confirmer | ferme | modifie
  sources: [{ t: "Nom de la source", u: "https://…" }]
}
```

Puis `node verifier.js`.

### Les illustrations se choisissent toutes seules

Il n'y a aucune photo : chaque fiche reçoit une vignette SVG générée par `ui.js`, toujours
identique pour un même identifiant. La **scène** est déduite du sens de la fiche (une queue
de baleine pour les baleines, un banc de sable pour l'îlot, une terre ocre pour les padzas),
la **palette** du hachage de l'identifiant — c'est ce qui évite que toutes les randonnées se
ressemblent. Pour forcer une scène, il suffit que le nom ou le résumé contienne le mot-clé :
voir la table `INDICES` en haut de `ui.js`.

---

## Mettre en ligne (GitHub Pages)

Même procédure que le site de la fédération de Doujani, le compte `gh` est déjà authentifié :

```bash
cd "C:/Users/djama/Documents/Karibu-Maore" && git init && git add -A && git commit -m "Karibu Maore v0.1" && gh repo create karibu-maore --public --source=. --push
```

Puis activer Pages sur la branche `main` dans les réglages du dépôt. Le site sera servi en
HTTPS, ce qui est **obligatoire** pour le mode hors connexion et l'installation sur l'écran
d'accueil.

Pour les mises à jour suivantes :

```bash
cd "C:/Users/djama/Documents/Karibu-Maore" && git add -A && git commit -m "maj contenu" && git push
```

---

## Voir le rendu sans ouvrir l'appli à la main

Le navigateur intégré à Claude Code ne compose pas d'images (pas de capture, pas d'événements
de défilement). Pour contrôler visuellement plusieurs écrans d'un coup, on passe par Chrome
en mode « headless » et une planche de contrôle qui charge l'appli dans des iframes à la
vraie largeur d'un téléphone :

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=2100,1420 --screenshot="C:/pdtmp/km/planche.png" --virtual-time-budget=6000 "http://127.0.0.1:8788/planche.html"
```

La planche est dans `C:\pdtmp\km\planche.html` (paramètres `e=` pour les routes, `n=` pour
les titres, `w=` pour la largeur). Chemin court volontaire : Chrome refuse d'écrire une
capture dans un chemin de plus de 260 caractères.

---

## Points de vigilance connus

- **Le mode hors connexion n'a pas pu être testé ici** : le navigateur intégré refuse
  d'enregistrer les service workers. Le fichier `sw.js` est standard et le serveur le
  délivre correctement — à vérifier une fois en ligne, avec Chrome sur Android : ouvrir le
  site, couper les données, recharger.
- **Cache agressif** : après chaque mise à jour, incrémenter `CACHE` dans `sw.js`, sinon
  les téléphones qui ont déjà installé l'appli garderont l'ancienne version.
- **Coordonnées GPS approximatives** : elles ne servent qu'au tri. Les liens « Ouvrir dans
  le plan » utilisent le **nom** du lieu, pas les coordonnées — c'est plus fiable.
- **Contenu à faire relire** : les fiches d'origine ont été écrites de mémoire. Tout ce qui
  touche aux horaires, aux tarifs et à l'état d'ouverture après Chido doit être vérifié
  avant publication. Les fiches qui portent un champ `sources` ont été recoupées ; les
  autres non.
