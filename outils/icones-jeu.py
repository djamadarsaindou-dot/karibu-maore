# -*- coding: utf-8 -*-
"""
Fabrique les icônes PNG de l'application, en dessinant la VRAIE forme de Mayotte
à partir de la géométrie de carte.js.

Pourquoi des PNG alors que le manifeste avait déjà des SVG : un manifeste qui ne
déclare que du SVG en « sizes: any » ne suffit pas. Android peut échouer à
fabriquer le WebAPK, et iOS ne sait pas lire un SVG en apple-touch-icon — il met
alors une capture grise de la page sur l'écran d'accueil. C'est l'image que
l'utilisateur voit tous les jours : c'est le détail le plus rentable du projet.

Trois tailles, plus une version « maskable » dont le motif tient dans la zone
sûre de 80 % pour survivre aux masques ronds d'Android.
"""
import io, json, math, os, re
from PIL import Image, ImageDraw

SRC = r"C:\Users\djama\Documents\Karibu-Maore\carte.js"
DST = r"C:\Users\djama\Documents\Karibu-Maore"

PASSE   = (10, 58, 87)      # #0a3a57 — le bleu des passes
PLATIER = (29, 169, 162)    # #1da9a2 — le turquoise du platier
SABLE   = (244, 237, 226)   # #f4ede2 — le sable blanc corallien
YLANG   = (196, 182, 62)    # #c4b63e — l'ylang mûr

def anneaux(d):
    """« M x y L x y … Z » -> listes de points."""
    out = []
    for bout in d.split("M"):
        if not bout.strip():
            continue
        nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", bout)]
        pts = list(zip(nums[0::2], nums[1::2]))
        if len(pts) >= 3:
            out.append(pts)
    return out

def dessiner(taille, marge, recif_visible=True):
    """Rend l'île centrée, à `marge` près, sur un carré de `taille` px."""
    S = taille * 4                                    # 4x pour l'anticrénelage
    im = Image.new("RGB", (S, S), PASSE)
    dr = ImageDraw.Draw(im)

    src = io.open(SRC, encoding="utf-8").read()
    carte = json.loads(re.search(r"const CARTE = (\{.*\});", src, re.S).group(1))
    terre = anneaux(carte["terre"])
    recif = anneaux(carte["recif"])

    xs = [p[0] for a in terre for p in a]; ys = [p[1] for a in terre for p in a]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    # l'île est haute et étroite : c'est la hauteur qui commande l'échelle
    ech = (S * (1 - 2 * marge)) / max(maxx - minx, maxy - miny)
    dx = (S - (maxx - minx) * ech) / 2 - minx * ech
    dy = (S - (maxy - miny) * ech) / 2 - miny * ech
    vers = lambda p: (p[0] * ech + dx, p[1] * ech + dy)

    # Le récif, en arrière-plan. Sous 128 px il devient du bruit : on ne garde
    # alors que l'île, qui reste reconnaissable même en 32 px dans un onglet.
    if recif_visible:
        for a in recif:
            if len(a) > 6:
                dr.line([vers(p) for p in a], fill=PLATIER,
                        width=max(3, S // 300), joint="curve")

    # l'île — les petits anneaux sont des îlots, on les garde
    for a in sorted(terre, key=len, reverse=True):
        dr.polygon([vers(p) for p in a], fill=SABLE)

    return im.resize((taille, taille), Image.LANCZOS)

def coins_arrondis(im, rayon_ratio=0.2237):
    """Le rayon d'iOS : 22,37 % du côté."""
    S = im.size[0] * 4
    grand = im.resize((S, S), Image.LANCZOS)
    masque = Image.new("L", (S, S), 0)
    ImageDraw.Draw(masque).rounded_rectangle([0, 0, S - 1, S - 1],
                                             radius=int(S * rayon_ratio), fill=255)
    sortie = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sortie.paste(grand, (0, 0), masque)
    return sortie.resize(im.size, Image.LANCZOS)

def main():
    sorties = []

    # — icônes carrées, pour le manifeste (Android arrondit lui-même) —
    for t in (192, 512):
        im = dessiner(t, marge=0.10, recif_visible=(t >= 256))
        p = os.path.join(DST, f"icone-{t}.png")
        im.save(p, "PNG", optimize=True)
        sorties.append((f"icone-{t}.png", os.path.getsize(p)))

    # — maskable : le motif tient dans la zone sûre de 80 % —
    im = dessiner(512, marge=0.24, recif_visible=False)
    p = os.path.join(DST, "icone-maskable-512.png")
    im.save(p, "PNG", optimize=True)
    sorties.append(("icone-maskable-512.png", os.path.getsize(p)))

    # — apple-touch-icon : iOS n'arrondit que si l'image est carrée et opaque —
    im = dessiner(180, marge=0.10, recif_visible=False)
    p = os.path.join(DST, "apple-touch-icon.png")
    im.save(p, "PNG", optimize=True)
    sorties.append(("apple-touch-icon.png", os.path.getsize(p)))

    # — favicon 32, pour l'onglet —
    im = dessiner(32, marge=0.04, recif_visible=False)
    p = os.path.join(DST, "favicon-32.png")
    im.save(p, "PNG", optimize=True)
    sorties.append(("favicon-32.png", os.path.getsize(p)))

    for nom, poids in sorties:
        print(f"  {nom:<26} {poids/1024:6.1f} Ko")
    print(f"\n  total {sum(p for _, p in sorties)/1024:.1f} Ko")

if __name__ == "__main__":
    main()
