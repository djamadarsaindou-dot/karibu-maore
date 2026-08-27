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
