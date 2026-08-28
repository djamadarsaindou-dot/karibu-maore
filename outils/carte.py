# -*- coding: utf-8 -*-
"""
Fabrique la carte vectorielle de Mayotte embarquée dans l'application.

SOURCES
  Communes  : geo.api.gouv.fr (contours IGN) — Licence Ouverte / Etalab 2.0
  Récif et trait de côte : OpenStreetMap via Overpass — ODbL 1.0, attribution
              obligatoire (affichée sur la carte dans l'application)

PROJECTION
  Équirectangulaire corrigée par cos(latitude), centrée sur Mayotte. Sur une
  emprise de 30 km à 12,8° de latitude, la distorsion est de l'ordre du pixel :
  inutile de sortir Mercator, qui déformerait davantage en étirant les pôles.

SIMPLIFICATION
  Douglas-Peucker. L'epsilon est exprimé EN PIXELS de la carte finale, pas en
  degrés : c'est la seule façon de garantir qu'on ne verra pas la simplification
  à l'écran. 0,35 px conserve les découpes de baies et les passes du récif tout
  en divisant le poids par vingt.
"""
import json, io, math, os

ICI = os.path.dirname(os.path.abspath(__file__))
DST = r"C:\Users\djama\Documents\Karibu-Maore"

# emprise de travail (degrés) — un peu plus large que l'île pour garder le récif
LAT0, LON0 = -12.82, 45.16
LARGEUR = 1000.0          # unités du viewBox

def projeter(lon, lat):
    k = math.cos(math.radians(LAT0))
    return ((lon - LON0) * k, -(lat - LAT0))

def dp(points, eps):
    """Douglas-Peucker, itératif pour ne pas exploser la pile."""
    if len(points) < 3:
        return points
    garder = [False] * len(points)
    garder[0] = garder[-1] = True
    pile = [(0, len(points) - 1)]
    while pile:
        i, j = pile.pop()
        ax, ay = points[i]; bx, by = points[j]
        dx, dy = bx - ax, by - ay
        n2 = dx * dx + dy * dy
        pire, k = -1.0, -1
        for m in range(i + 1, j):
            px, py = points[m]
            if n2 == 0:
                d = math.hypot(px - ax, py - ay)
            else:
                t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / n2))
                d = math.hypot(px - (ax + t * dx), py - (ay + t * dy))
            if d > pire:
                pire, k = d, m
        if pire > eps and k > 0:
            garder[k] = True
            pile.append((i, k)); pile.append((k, j))
    return [p for p, g in zip(points, garder) if g]

def chemin(anneaux, eps, ferme=True, prec=0, mini=0):
    """Anneaux de coordonnées projetées -> attribut d d'un <path>."""
    bouts = []
    for a in anneaux:
        a = dp(a, eps)
        if len(a) < 2:
            continue
        # on jette les fragments trop courts pour se voir : ils pèsent autant
        # qu'un trait utile et ne font que du bruit visuel
        if mini:
            lg = sum(math.hypot(a[i+1][0]-a[i][0], a[i+1][1]-a[i][1]) for i in range(len(a)-1))
            if lg < mini:
                continue
        d = "M" + " L".join(f"{x:.{prec}f} {y:.{prec}f}" for x, y in a)
        bouts.append(d + ("Z" if ferme else ""))
    return "".join(bouts)

def main():
    # ---- 1. les communes, qui donnent la terre et les limites internes -----
    comm = json.load(io.open(os.path.join(ICI, "communes.geojson"), encoding="utf-8"))
    brut = []
    for f in comm["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            for anneau in poly:
                brut.append([(lon, lat) for lon, lat in anneau])

    # échelle : on cale l'emprise réelle sur la largeur voulue
    xs, ys = [], []
    for a in brut:
        for lon, lat in a:
            x, y = projeter(lon, lat); xs.append(x); ys.append(y)
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    ech = LARGEUR / (maxx - minx)
    hauteur = (maxy - miny) * ech

    def vers_ecran(a):
        out = []
        for lon, lat in a:
            x, y = projeter(lon, lat)
            out.append(((x - minx) * ech, (y - miny) * ech))
        return out

    EPS = 0.45   # pixels du viewBox
    anneaux_terre = [vers_ecran(a) for a in brut]
    d_terre = chemin(anneaux_terre, EPS)

    # ---- 2. le récif et le trait de côte, depuis OpenStreetMap -------------
    osm = json.load(io.open(os.path.join(ICI, "osm.json"), encoding="utf-8"))
    recif, cote = [], []
    for e in osm.get("elements", []):
        g = e.get("geometry")
        if not g:
            continue
        pts = [(p["lon"], p["lat"]) for p in g]
        (recif if e.get("tags", {}).get("natural") == "reef" else cote).append(pts)

    # Le récif est un trait de contexte, pas une donnée de navigation : on le
    # simplifie plus fort et on écarte les fragments de moins de 8 px.
    d_recif = chemin([vers_ecran(a) for a in recif], 1.1, ferme=False, mini=8)
    # Le trait de côte d'OpenStreetMap ferait doublon avec le contour des
    # communes, qui donne déjà la forme de l'île : on ne l'embarque pas.
    d_cote = ""

    # ---- 3. écriture ------------------------------------------------------
    carte = {
        "viewBox": f"0 0 {LARGEUR:.0f} {hauteur:.0f}",
        "lat0": LAT0, "lon0": LON0, "ech": ech, "minx": minx, "miny": miny,
        "terre": d_terre, "recif": d_recif, "cote": d_cote,
    }
    js = ("/* =============================================================================\n"
          "   KARIBU MAORÉ — géométrie de l'île\n"
          "   ---------------------------------------------------------------------------\n"
          "   Fabriqué par C:/pdtmp/kgeo/carte.py. Ne pas éditer à la main.\n"
          "\n"
          "   Communes : contours IGN via geo.api.gouv.fr — Licence Ouverte / Etalab 2.0\n"
          "   Récif et trait de côte : © les contributeurs d'OpenStreetMap, ODbL 1.0\n"
          "   L'attribution OpenStreetMap est affichée sur la carte dans l'application :\n"
          "   c'est une obligation de la licence, pas une politesse.\n"
          "\n"
          "   Projection équirectangulaire corrigée par cos(latitude), centrée sur\n"
          "   Mayotte. Contours simplifiés par Douglas-Peucker à 0,35 px du viewBox.\n"
          "   ========================================================================== */\n\n"
          "const CARTE = " + json.dumps(carte, ensure_ascii=False) + ";\n")
    chemin_js = os.path.join(DST, "carte.js")
    io.open(chemin_js, "w", encoding="utf-8").write(js)

    print(f"  viewBox     {carte['viewBox']}")
    print(f"  terre       {len(d_terre)//1024:>4} Ko   ({len(anneaux_terre)} anneaux)")
    print(f"  récif       {len(d_recif)//1024:>4} Ko   ({len(recif)} tronçons)")
    print(f"  côte        {len(d_cote)//1024:>4} Ko   ({len(cote)} tronçons)")
    print(f"  carte.js    {os.path.getsize(chemin_js)//1024:>4} Ko")

    # contrôle : un point connu doit tomber au bon endroit
    for nom, lon, lat in [("Mamoudzou", 45.2278, -12.7806), ("Choungui", 45.1333, -12.9667)]:
        x, y = projeter(lon, lat)
        print(f"  {nom:<12} x={(x-minx)*ech:7.1f}  y={(y-miny)*ech:7.1f}")

if __name__ == "__main__":
    main()
