# -*- coding: utf-8 -*-
"""
Fabrique les courbes de niveau de Mayotte embarquées dans l'application.

SOURCE
  Copernicus DEM GLO-30, tuile S13_00_E045, produit par l'Agence spatiale
  européenne. Licence : gratuite, mondiale, non exclusive, réutilisation
  commerciale autorisée, ATTRIBUTION OBLIGATOIRE. Le crédit exact demandé par
  l'ESA est repris dans LICENCES.md et affiché sous la carte.

POURQUOI DES COURBES ET PAS UN OMBRAGE
  Un ombrage est une image : à 1 000 px de large il pèserait plusieurs centaines
  de kilo-octets, et il pixelliserait dès qu'on zoome. Les courbes sont du
  vectoriel : 30 Ko, nettes à toutes les échelles, et elles disent quelque chose
  de plus qu'une ombre — l'altitude, chiffrée.

  Elles n'apparaissent qu'à partir du zoom 1,6. À l'échelle de l'île entière
  elles noieraient la silhouette, qui est l'information principale.

CE QUI EST DÉLIBÉRÉMENT ÉCARTÉ
  Le niveau 0 m. La côte est déjà tracée par les contours IGN des communes, et
  une courbe de niveau 0 issue d'un modèle de surface s'en écarte de plusieurs
  dizaines de mètres par endroits : deux traits côte à côte, presque
  superposés, donnent l'impression d'un bug.

ATTENTION AU MODÈLE
  GLO-30 est un modèle de SURFACE (DSM), pas de terrain : il inclut la canopée.
  Sous la forêt du Mont Combani, cela ajoute quelques mètres. À un intervalle
  de 100 m entre courbes, c'est sans conséquence — mais il ne faut pas s'en
  servir pour annoncer une altitude au mètre près.
"""
import io, os, math, json
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

DEM = r"C:\pdtmp\kdem\dem.tif"
DST = r"C:\Users\djama\Documents\Karibu-Maore"

# calage identique à carte.py — toute divergence décalerait le relief de l'île
LAT0, LON0 = -12.82, 45.16
ECH   = 3641.211176024714
MINX  = -0.13813844455660998
MINY  = -0.1834100000000003

NIVEAUX = [100, 200, 300, 400, 500, 600]
EPS   = 0.55     # Douglas-Peucker, en pixels du viewBox final
MINI  = 14    # on jette les bouts de courbe trop courts pour se voir

# emprise de la tuile (coin haut-gauche, pas de pixel)
T_LAT, T_LON, PAS = -12.0, 45.0, 1.0 / 3600.0


def projeter(lon, lat):
    k = math.cos(math.radians(LAT0))
    x = ((lon - LON0) * k - MINX) * ECH
    y = (-(lat - LAT0) - MINY) * ECH
    return x, y


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


def lisser(a, n=2):
    """Moyenne 3x3 répétée. Sans elle, les courbes sortent en escalier : le
    modèle est quantifié, et marching squares rend cette quantification
    visible sous forme de créneaux réguliers, qui se lisent comme un défaut
    de tracé plutôt que comme du relief."""
    for _ in range(n):
        b = np.pad(a, 1, mode="edge")
        a = (b[:-2, :-2] + b[:-2, 1:-1] + b[:-2, 2:] +
             b[1:-1, :-2] + b[1:-1, 1:-1] + b[1:-1, 2:] +
             b[2:, :-2] + b[2:, 1:-1] + b[2:, 2:]) / 9.0
    return a


def marching(z, niveau):
    """Marching squares. Rend une liste de segments ((x1,y1),(x2,y2)) en
    coordonnées de grille (colonne, ligne), fractionnaires."""
    h, w = z.shape
    a = z[:-1, :-1]; b = z[:-1, 1:]; c = z[1:, 1:]; d = z[1:, :-1]
    #        a --- b
    #        |     |
    #        d --- c
    code = ((a > niveau).astype(np.uint8) * 8 + (b > niveau).astype(np.uint8) * 4 +
            (c > niveau).astype(np.uint8) * 2 + (d > niveau).astype(np.uint8))
    lignes, colonnes = np.nonzero((code > 0) & (code < 15))
    segs = []
    for i, j in zip(lignes.tolist(), colonnes.tolist()):
        va, vb, vc, vd = float(z[i, j]), float(z[i, j+1]), float(z[i+1, j+1]), float(z[i+1, j])

        def ip(v1, v2):                       # position du niveau entre deux sommets
            return 0.5 if v1 == v2 else (niveau - v1) / (v2 - v1)

        H = (j + ip(va, vb), i)               # arête haute
        B = (j + ip(vd, vc), i + 1)           # arête basse
        G = (j, i + ip(va, vd))               # arête gauche
        D = (j + 1, i + ip(vb, vc))           # arête droite
        k = int(code[i, j])
        if   k in (1, 14): segs.append((G, B))
        elif k in (2, 13): segs.append((B, D))
        elif k in (3, 12): segs.append((G, D))
        elif k in (4, 11): segs.append((H, D))
        elif k == 5:       segs += [(G, H), (B, D)]     # selle
        elif k in (6, 9):  segs.append((H, B))
        elif k in (7, 8):  segs.append((G, H))
        elif k == 10:      segs += [(G, B), (H, D)]     # selle
    return segs


def chainer(segs):
    """Recolle les segments en polylignes. Les extrémités sont arrondies au
    millième de pixel de grille : deux segments voisins produisent exactement
    la même valeur, l'arrondi ne sert qu'à rendre la clé hachable."""
    cle = lambda p: (round(p[0], 4), round(p[1], 4))
    voisins = {}
    for s in segs:
        for x, y in ((0, 1), (1, 0)):
            voisins.setdefault(cle(s[x]), []).append((cle(s[y]), s[y]))
    vus = set()
    lignes = []
    depart = list(voisins.keys())
    # on commence par les extrémités libres (un seul voisin), pour ne pas
    # couper une courbe ouverte en deux morceaux au milieu
    depart.sort(key=lambda k: len(voisins[k]))
    for d in depart:
        if d in vus or not voisins.get(d):
            continue
        ligne, cur = [d], d
        vus.add(cur)
        while True:
            suite = None
            for k, p in voisins.get(cur, []):
                if k not in vus:
                    suite = (k, p); break
            if not suite:
                break
            vus.add(suite[0])
            ligne.append(suite[0])
            cur = suite[0]
        if len(ligne) > 2:
            lignes.append(ligne)
    return lignes


def main():
    im = Image.open(DEM)
    z = np.asarray(im).astype(np.float32)

    # découpe sur l'emprise de l'île, avec une marge d'un dixième de degré
    l1, l2 = -13.001, -12.615          # latitudes (le sud de l'île frôle -13,00)
    o1, o2 = 45.015, 45.315
    r1 = int((T_LAT - l2) / PAS); r2 = int((T_LAT - l1) / PAS) + 1
    c1 = int((o1 - T_LON) / PAS); c2 = int((o2 - T_LON) / PAS) + 1
    r1, r2 = max(0, r1), min(z.shape[0], r2)
    c1, c2 = max(0, c1), min(z.shape[1], c2)
    z = z[r1:r2, c1:c2]

    haut = float(z.max())
    ih, ic = np.unravel_index(int(z.argmax()), z.shape)
    plat = T_LAT - (r1 + ih) * PAS
    plon = T_LON + (c1 + ic) * PAS
    print(f"  découpe {z.shape[1]}x{z.shape[0]} px")
    print(f"  point culminant du modèle : {haut:.1f} m à {plat:.4f}, {plon:.4f}")
    print(f"  (le Mont Bénara est donné à 660 m par l'IGN — le modèle inclut la canopée)")

    z = lisser(z, 2)

    bouts, npts, stats = [], 0, []
    for niv in NIVEAUX:
        segs = marching(z, niv)
        lignes = chainer(segs)
        gardees = 0
        for ligne in lignes:
            pts = []
            for cx, cy in ligne:
                lat = T_LAT - (r1 + cy) * PAS
                lon = T_LON + (c1 + cx) * PAS
                pts.append(projeter(lon, lat))
            pts = dp(pts, EPS)
            if len(pts) < 3:
                continue
            lg = sum(math.hypot(pts[i+1][0]-pts[i][0], pts[i+1][1]-pts[i][1])
                     for i in range(len(pts)-1))
            if lg < MINI:
                continue
            bouts.append("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts))
            npts += len(pts); gardees += 1
        stats.append((niv, gardees))
        print(f"  {niv:>4} m : {gardees} courbe(s)")

    d = "".join(bouts)
    js = (
        "/* =============================================================================\n"
        "   KARIBU MAORÉ — le relief\n"
        "   ---------------------------------------------------------------------------\n"
        "   Fabriqué par outils/relief.py. Ne pas éditer à la main.\n"
        "\n"
        "   Courbes de niveau tous les 100 m, dérivées du Copernicus DEM GLO-30\n"
        "   (© DLR e.V. 2010-2014 et © Airbus Defence and Space GmbH 2014-2018,\n"
        "   fourni sous la licence Copernicus DEM — attribution obligatoire).\n"
        "\n"
        "   Elles ne s'affichent qu'à partir du zoom 1,6 : à l'échelle de l'île\n"
        "   entière, elles noieraient la silhouette.\n"
        "   ========================================================================== */\n\n"
        "const CONTOURS = " + json.dumps(
            {"niveaux": NIVEAUX, "pas": 100, "d": d},
            ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    chemin = os.path.join(DST, "contours.js")
    io.open(chemin, "w", encoding="utf-8", newline="\n").write(js)
    print(f"\n  contours.js : {len(js)/1024:.1f} Ko, {npts} points")


if __name__ == "__main__":
    main()
