# Les outils de préparation

Ces scripts tournent **une fois sur le poste**, hors de l'application. Ils
fabriquent des fichiers que le dépôt embarque ensuite. Aucun n'est nécessaire
pour faire tourner l'appli.

Ils sont versés ici parce que **l'ODbL l'exige** (§4.6) : quand on publie une
œuvre produite à partir d'une base sous ODbL, on doit dire comment on l'a
produite. C'est aussi ce qui rend le travail refaisable dans deux ans.

| Script | Fabrique | Dépendances |
|---|---|---|
| `carte.py` | `carte.js` — la géométrie de l'île | aucune (Python pur) |
| `recif.overpass` | la requête Overpass du récif et du trait de côte | — |
| `logo.py` | `marque.svg`, `logo.svg`, `logo-sombre.svg`, `marque.js` — la marque | Pillow, fontTools |
| `icones.py` | les icônes PNG, dessinées d'après `marque.js` | Pillow |
| `relief.py` | `contours.js` — les courbes de niveau, depuis le Copernicus DEM | Pillow, NumPy |
| `og.py` | les 44 pages `l/*.html` et les 44 images `og/*.jpg` de partage | Pillow, fontTools |
| `fabriquer.py` | les deux polices `.woff2` sous-ensemblées et renommées | fontTools, brotli |

**Supprimés en août 2026 :** `icones-app.py` et `icones-jeu.py`. Les deux
fichiers étaient devenus **identiques au caractère près** — un doublon qui
dormait là —, et tous deux redessinaient l'île de leur côté. Avec `UI.logo()`
qui en dessinait encore une troisième version à la main, cela faisait trois
dessins pour une seule marque, déjà divergents. Tout part maintenant de
`logo.py`, et rien d'autre ne dessine l'île.

## Refaire la carte

```bash
cd outils && curl -s -o communes.geojson "https://geo.api.gouv.fr/departements/976/communes?format=geojson&geometry=contour"
curl -s -X POST -d @recif.overpass "https://overpass-api.de/api/interpreter" -o osm.json
python carte.py
```

Les deux fichiers intermédiaires (`communes.geojson`, `osm.json`) ne sont pas
versés : ils pèsent 5 Mo et se retéléchargent en une commande.
