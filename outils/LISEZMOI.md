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
| `icones-app.py` | les icônes PNG de l'application, dessinées d'après `carte.js` | Pillow |
| `icones-jeu.py` | la table d'icônes de `ui.js`, depuis Lucide / Tabler / Simple Icons | aucune |
| `fabriquer.py` | les deux polices `.woff2` sous-ensemblées et renommées | fontTools, brotli |

## Refaire la carte

```bash
cd outils && curl -s -o communes.geojson "https://geo.api.gouv.fr/departements/976/communes?format=geojson&geometry=contour"
curl -s -X POST -d @recif.overpass "https://overpass-api.de/api/interpreter" -o osm.json
python carte.py
```

Les deux fichiers intermédiaires (`communes.geojson`, `osm.json`) ne sont pas
versés : ils pèsent 5 Mo et se retéléchargent en une commande.
