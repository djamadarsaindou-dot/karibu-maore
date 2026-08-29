# -*- coding: utf-8 -*-
"""
Fabrique les icônes PNG à partir de la MÊME silhouette que le logo.

POURQUOI CE FICHIER REMPLACE icones-app.py. L'ancien générateur redessinait
l'île de son côté, et `UI.logo()` en dessinait encore une troisième version, à
la main, qui ne ressemblait pas à Mayotte. Trois dessins pour une seule marque :
ils avaient déjà divergé. Tout part maintenant de `marque.js`, produit par
outils/logo.py.

POURQUOI DES PNG alors que le manifeste déclare aussi du SVG : un manifeste qui
ne déclare que du SVG en « sizes: any » ne suffit pas. Android peut échouer à
fabriquer le WebAPK, et iOS ne sait pas lire un SVG en apple-touch-icon — il met
alors une capture grise de la page sur l'écran d'accueil. C'est l'image que
l'utilisateur voit tous les jours.

LA VERSION « MASKABLE » est dessinée plus petite : Android peut rogner jusqu'à
un cercle, et tout ce qui sort de la zone sûre de 80 % disparaît.
"""
import io, json, os, re
from PIL import Image, ImageDraw

BASE = r"C:\Users\djama\Documents\Karibu-Maore"

PASSE   = (10, 58, 87)
PLATIER = (29, 169, 162)
SABLE   = (244, 237, 226)
YLANG   = (196, 182, 62)


def silhouette():
    s = io.open(os.path.join(BASE, "marque.js"), encoding="utf-8").read()
    d = json.loads(s[s.index("{"):s.rindex("}") + 1])["ile"]
    out = []
    for bout in d.split("M"):
        if not bout.strip():
            continue
        n = [float(x) for x in re.findall(r"-?\d+(?:\.\d+)?", bout)]
        p = list(zip(n[0::2], n[1::2]))
        if len(p) >= 3:
            out.append(p)
    return out


def vague(d, x, y, cote, ech, couleur):
    """La même vague que le SVG : trois bosses, tracées au polygone épais."""
    import math
    pts = []
    x0 = x + cote * 0.155
    larg = cote * 0.115 * 6
    for i in range(97):
        t = i / 96
        px = x0 + larg * t
        py = y + cote * 0.83 - math.sin(t * math.pi * 6) * cote * 0.031
        pts.append((px, py))
    d.line(pts, fill=couleur, width=max(2, int(cote * 0.052)), joint="curve")
    r = cote * 0.026
    for px, py in (pts[0], pts[-1]):
        d.ellipse([px - r, py - r, px + r, py + r], fill=couleur)


def dessiner(taille, part=0.56, coins=0.27, marge=0.0):
    """Le badge, à `taille` px. `marge` réserve la zone sûre des masques."""
    S = taille * 4                       # 4× pour l'anticrénelage
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * coins), fill=PASSE + (255,))

    util = S * (1 - 2 * marge)
    ox0 = S * marge
    E = part * util / 100.0
    ox = ox0 + util / 2 - 50 * E
    oy = ox0 + util * 0.11
    for anneau in silhouette():
        d.polygon([(ox + x * E, oy + y * E) for x, y in anneau], fill=SABLE + (255,))

    # le point sur Mamoudzou, aux mêmes coordonnées que le SVG
    mx, my = 70.8, 37.8
    for r, c in ((5.2, PASSE), (3.6, YLANG)):
        rr = r * E
        d.ellipse([ox + mx * E - rr, oy + my * E - rr,
                   ox + mx * E + rr, oy + my * E + rr], fill=c + (255,))

    vague(d, ox0, ox0, util, E, PLATIER + (255,))
    return im.resize((taille, taille), Image.LANCZOS)


def main():
    sorties = [
        ("icone-192.png", 192, 0.56, 0.27, 0.0),
        ("icone-512.png", 512, 0.56, 0.27, 0.0),
        # 10 % de marge : la zone sûre d'Android est un cercle de 80 % du côté
        ("icone-maskable-512.png", 512, 0.50, 0.5, 0.10),
        ("apple-touch-icon.png", 180, 0.56, 0.27, 0.0),
        ("favicon-32.png", 32, 0.60, 0.27, 0.0),
    ]
    for nom, t, part, coins, marge in sorties:
        im = dessiner(t, part, coins, marge)
        if nom.startswith("apple") or nom.startswith("icone-maskable"):
            # iOS et les masques n'aiment pas la transparence : fond plein
            fond = Image.new("RGBA", im.size, PASSE + (255,))
            fond.alpha_composite(im)
            im = fond
        chemin = os.path.join(BASE, nom)
        im.convert("RGBA").save(chemin)
        print("  %-26s %4d px  %4.0f Ko" % (nom, t, os.path.getsize(chemin) / 1024))


if __name__ == "__main__":
    main()
