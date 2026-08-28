# Licences des ressources embarquées

Karibu Maoré n'appelle aucun service externe : tout ce qu'affiche l'application
est dans ce dépôt. Les ressources ci-dessous sont libres, et leurs licences
imposent de citer leurs auteurs. C'est l'objet de ce fichier.

---

## Polices

| Fichier | Origine | Licence | Auteur |
|---|---|---|---|
| `assets/fonts/karibu-sans.woff2` | **Inter** | [SIL Open Font License 1.1](assets/fonts/OFL-Inter.txt) | Rasmus Andersson |
| `assets/fonts/youngserif.woff2` | **Young Serif** | [SIL Open Font License 1.1](assets/fonts/OFL-YoungSerif.txt) | Uncut.wtf |

**Pourquoi « Karibu Sans » et pas « Inter ».** Le fichier livré est une version
modifiée d'Inter : axe optique instancié à 16, jeu de caractères réduit au
français, au shimaoré et à la ponctuation réellement utilisés. L'auteur d'Inter
déclare son nom comme réservé dans le README du projet. L'OFL impose alors de
renommer toute version modifiée — ce qui a été fait, table `name` comprise. Young
Serif n'a aucun nom réservé et garde le sien.

**Ce que couvre le sous-ensemble.** Latin de base et latin-1, œ Œ ç É À Ê Ÿ,
les capitales et minuscules à crochet **Ɓ ɓ Ɗ ɗ** du shimaoré, l'espace fine
insécable U+202F (obligatoire en typographie française devant `: ; ! ?`), les
guillemets français, le tiret cadratin, ↔ et − qui apparaissent dans le contenu.
Sur vingt polices inspectées dans leur table `cmap`, **seules trois possédaient
ɓ et ɗ** : Inter, Source Sans 3 et Noto Sans.

Young Serif ne les a pas — elle ne compose donc **que des titres français**.
Un mot shimaoré porte la classe `.sh`, qui force Karibu Sans.

Les fichiers se refabriquent avec `C:\pdtmp\ktypo\fabriquer.py` (fontTools +
brotli, aucun npm).

---

## Icônes

| Origine | Licence | Ce qui en vient |
|---|---|---|
| **[Lucide](https://lucide.dev)** | [ISC](https://github.com/lucide-icons/lucide/blob/main/LICENSE) — © Lucide Contributors | 40 icônes sur 43 |
| **[Tabler Icons](https://tabler.io/icons)** | MIT — © 2020-2026 Paweł Kuna | `building-mosque`, `beach` |
| **[Simple Icons](https://simpleicons.org)** | CC0 1.0 Universal | le glyphe WhatsApp |

Les tracés sont recopiés en clair dans `ui.js` (grille 24, trait 2, bouts ronds) :
aucun fichier ajouté, aucune requête réseau, environ 8 Ko de texte.

**Le glyphe WhatsApp** relève des règles de marque de Meta, pas de la licence de
Simple Icons. Son usage ici — un petit glyphe monochrome à côté d'un bouton
« Écrire sur WhatsApp » — est un usage **descriptif**, conforme : il n'implique
aucun partenariat, il n'est combiné à aucun autre logo, il n'est pas modifié et
il n'est pas l'élément dominant de la page.

---

## Photographies

Voir [CREDITS-PHOTOS.md](CREDITS-PHOTOS.md) — 18 photographies de Wikimedia
Commons, sous CC0 ou CC BY-SA. Le crédit est affiché sur chaque image dans
l'application, comme l'exigent ces licences.

---

## Marées

Constantes harmoniques du marégraphe de Dzaoudzi issues de la base **TICON-3**
(Hart-Davis, Dettmering & Seitz, 2022), [CC BY 4.0](https://doi.pangaea.de/10.1594/PANGAEA.951610).
Niveaux de référence des **Références Altimétriques Maritimes du Shom**, sous
Licence Ouverte Etalab 2.0.

Les tables d'horaires du Shom, elles, ne sont **pas** sous licence ouverte :
l'application calcule ses propres prédictions et cite le Shom comme référence
de validation, elle ne recopie rien.

---

## Identité visuelle

L'application n'emprunte **aucun motif traditionnel mahorais**, et c'est un
choix, pas un oubli.

La trame de fond est une abstraction en losanges **inspirée des claustras et
des garde-corps des façades mahoraises contemporaines**, documentés par la
publication *Patrimoine du XXᵉ siècle. Une architecture mahoraise* (DAC Mayotte
/ ministère de la Culture). Elle est faite de traits droits uniquement : aucun
arc, aucune niche, pour qu'aucune lecture de mihrab ne soit possible.

Les cartouches des fiches sans photographie reprennent un **procédé** de décor —
inciser, strier — décrit dans la fiche d'inventaire national du patrimoine
culturel immatériel consacrée à la poterie traditionnelle de Mayotte (2024).
Ils ne citent aucun motif nommé, parce qu'il n'en existe aucun répertoire publié.

**Aucune trame dérivée du m'sindzano n'a été produite.** Le geste est documenté,
mais il n'appartient pas à un corpus : il appartient aux femmes qui l'inventent.
La seule façon propre de l'intégrer serait de commander la trame à une
praticienne ou à une artiste mahoraise, de la rémunérer et de la créditer
nommément ici. Tant que cette commande n'a pas eu lieu, la place reste vide.

La palette évite délibérément le bleu, le rouge et le jaune du blason de Mayotte,
pour ne créer aucune confusion avec une communication institutionnelle.

---

## Carte

| Donnée | Source | Licence |
|---|---|---|
| Contours des 17 communes, trait de côte | [geo.api.gouv.fr](https://geo.api.gouv.fr) (contours IGN) | Licence Ouverte / Etalab 2.0 |
| Double barrière de corail | [OpenStreetMap](https://www.openstreetmap.org) via Overpass | **ODbL 1.0** |

L'attribution « © les contributeurs d'OpenStreetMap » est affichée **en permanence
sur la carte** dans l'application : c'est une obligation de l'ODbL, pas une politesse.

La carte est une œuvre produite (*Produced Work*) à partir de ces bases : un rendu
vectoriel simplifié, pas une redistribution de la base de données elle-même.

Fabriquée par `C:\pdtmp\kgeo\carte.py` — projection équirectangulaire corrigée par
cos(latitude), simplification de Douglas-Peucker. 56 Ko pour l'île entière, sans
une seule tuile : c'est la seule façon d'avoir une carte qui fonctionne vraiment
hors connexion.

---

## Relief

`contours.js` — courbes de niveau tous les 100 m, de 100 à 600 m.

| Donnée | Origine | Licence |
|---|---|---|
| Modèle d'élévation | **Copernicus DEM GLO-30**, tuile `S13_00_E045` | Licence Copernicus DEM — usage mondial, gratuit, y compris commercial, **attribution obligatoire** |

Crédit exigé, affiché sous la carte dès que le relief apparaît :
*© DLR e.V. 2010-2014 et © Airbus Defence and Space GmbH 2014-2018 pour le
COP-DEM, distribué par l'Agence spatiale européenne.*

**Ce qui est embarqué est une œuvre dérivée, pas le modèle.** Ce sont des
polylignes extraites par marching squares (`outils/relief.py`) puis simplifiées
par Douglas-Peucker à 0,55 pixel de la carte finale. Le modèle d'origine —
3 600 × 3 600 valeurs flottantes — n'est pas redistribué.

**GLO-30 est un modèle de surface, pas de terrain :** il inclut la canopée. Le
point culminant qu'il donne pour Mayotte est 654,9 m à 12,880 S / 45,162 E, ce
qui est bien le Mont Bénara, que l'IGN place à 660 m. À 100 m d'écart entre deux
courbes, la différence ne se voit pas ; elle interdit en revanche d'annoncer une
altitude au mètre près à partir de cette donnée, et l'application ne le fait pas.

**Le niveau 0 m est délibérément absent.** Le trait de côte vient déjà des
contours IGN des communes ; une courbe 0 issue d'un modèle de surface s'en
écarte par endroits de plusieurs dizaines de mètres, et deux traits presque
superposés se lisent comme un défaut d'affichage.

**Le fichier n'est pas chargé au démarrage.** 55 Ko pour une couche décorative
ne doivent pas peser sur la première ouverture : `contours.js` est demandé la
première fois qu'on dépasse le zoom 1,6. Le *service worker* le met malgré tout
en cache à l'installation, pour qu'il soit là hors connexion.

---

## Calculs solaires

`astro.js` implémente les séries de la **NOAA Solar Calculator** (domaine public),
d'après Jean Meeus, *Astronomical Algorithms*. Aucune donnée n'est embarquée :
tout est calculé sur l'appareil.

Précision vérifiée par l'autotest (`node astro.js`) contre les sorties de la NOAA
elle-même : **lever et coucher à la seconde**, midi solaire à 5 secondes.

> Ne pas contrôler contre sunrise-sunset.org ni les calendriers grand public :
> leur seuil effectif est −1,12° au lieu de −0,833°, ils dérivent d'une à deux
> minutes.

## Indice UV et jour sans ombre

Aucune donnée n'est reprise : les deux sont **calculés** à partir des mêmes
formules solaires que le lever et le coucher.

**L'indice UV** part de la forme usuelle `UVI = 12,5 · μ^2,42` (μ = cosinus de
l'angle zénithal), établie pour 300 unités Dobson d'ozone au niveau de la mer,
corrigée de la colonne d'ozone tropicale — environ 260 DU — par une loi de
puissance d'exposant 1,2, soit +18 %. C'est une formule d'usage courant, pas
une base de données : rien n'est recopié, il n'y a donc rien à créditer, mais
il y a tout à vérifier.

**Recoupement.** Darwin, en Australie, est à 12,3° de latitude sud, celle de
Mayotte à un dixième de degré près. Les relevés publiés de l'ARPANSA y donnent
des maxima d'été entre 11 et 15. Le calcul rend 14,8 par ciel parfaitement
clair en février et 8,8 en juin. L'enveloppe est la bonne — les jours nuageux
occupant le bas de ce qui se mesure.

**La mention « ciel clair » n'est jamais escamotée.** C'est un calcul, pas une
mesure : un ciel couvert peut diviser l'indice par deux. Afficher un calcul
comme un relevé serait pire que se taire.

**Le jour sans ombre** est le jour où la déclinaison du soleil, au midi solaire
local, croise la latitude du lieu. Il est cherché par balayage sur l'année en
cours et la suivante, sans aucune date en dur. À Mayotte, cela tombe vers le
14-15 février et vers le 26-28 octobre, et le jour exact dépend de l'endroit :
la pointe nord et la pointe sud ne sont pas au zénith le même jour. Les dates
qui circulent en ligne sont souvent fausses d'une semaine, quand elles ne
prêtent pas à La Réunion — qui est hors des tropiques — un phénomène qu'elle
ne connaît pas.

---

## Calculs lunaires

Série lunaire **ELP-2000/82**, Chapront-Touzé & Chapront (1983) ; tabulation
d'usage courant popularisée par J. Meeus, *Astronomical Algorithms*, ch. 47.

Ce qui est repris est une **compilation de coefficients** : les nombres eux-mêmes
ne relèvent pas du droit d'auteur, leur agencement peut en relever, d'où cette
citation de la source primaire.

Validation : l'autotest reproduit l'exemple 47.a de Meeus (12 avril 1992) à la
sixième décimale sur la longitude, la latitude et la parallaxe. C'est le meilleur
contrôle possible — il valide toute la série d'un coup.
