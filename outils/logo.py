# -*- coding: utf-8 -*-
"""
Fabrique la marque et le logo de Maoré Quest à partir de la VRAIE forme de l'île.

LE PROBLÈME DE DÉPART. `carte.js` ne contient pas la silhouette de Mayotte : il
contient les dix-sept COMMUNES, cinquante anneaux qui se touchent. La silhouette
est leur union, et on n'a pas de bibliothèque de booléens polygonaux ici.

LA SOLUTION, ET ELLE RÉUTILISE DU CODE DÉJÀ ÉPROUVÉ. On peint les communes dans
un masque binaire, puis on retrace le contour par marching squares — exactement
l'algorithme qui sort les courbes de niveau dans relief.py. On garde les deux
plus grands contours : Grande-Terre et Petite-Terre. On simplifie très fort :
à 48 pixels, quarante points suffisent largement, et six mille en feraient une
tache noire.

POURQUOI PAS LE LOGO GÉNÉRÉ. Celui qui a été choisi dessine une île qui n'est
pas Mayotte — une forme approximative. Toute l'application est bâtie sur les
contours IGN réels ; mettre une île générique en couverture serait la seule
chose qu'elle ne se soit jamais permise. L'intention est gardée — le mot, l'île,
la vague — la forme est exacte, et le fichier est vectoriel, donc net à toutes
les tailles et libre de tout droit.

LE PALMIER EST TOMBÉ. C'est l'élément qui fait ressembler la marque à celle de
n'importe quelle destination tropicale. L'arc et la vague restent : ils sont
abstraits, ils tiennent en 48 pixels, et ils viennent du dessin d'origine.
"""
import io, os, re, math, subprocess, json

BASE = r"C:\Users\djama\Documents\Karibu-Maore"
NL = chr(10)

TTF = r"C:\pdtmp\kdem"          # les .ttf tirés des .woff2 du projet

PASSE   = "#0a3a57"
PLATIER = "#1da9a2"
SABLE   = "#f4ede2"
YLANG   = "#c4b63e"
BASALTE = "#241f1d"

TRANSFORME = None

G = 520          # résolution du masque : assez fine pour les passes, assez
                 # grossière pour ne pas ramener le bruit de la côte


def terre():
    out = subprocess.run(
        ["node", "-e",
         "const fs=require('fs'),vm=require('vm');const b={};vm.createContext(b);"
         "vm.runInContext(fs.readFileSync('carte.js','utf8')+';globalThis.__c=CARTE;',b);"
         "process.stdout.write(JSON.stringify({d:b.__c.terre,vb:b.__c.viewBox}))"],
        capture_output=True, text=True, encoding="utf-8", cwd=BASE, check=True)
    return json.loads(out.stdout)


def anneaux(d):
    out = []
    for bout in d.split("M"):
        if not bout.strip():
            continue
        n = [float(x) for x in re.findall(r"-?\d+(?:\.\d+)?", bout)]
        p = list(zip(n[0::2], n[1::2]))
        if len(p) >= 3:
            out.append(p)
    return out


def dp(points, eps):
    """Douglas-Peucker itératif."""
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
                dd = math.hypot(px - ax, py - ay)
            else:
                t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / n2))
                dd = math.hypot(px - (ax + t * dx), py - (ay + t * dy))
            if dd > pire:
                pire, k = dd, m
        if pire > eps and k > 0:
            garder[k] = True
            pile.append((i, k)); pile.append((k, j))
    return [p for p, g in zip(points, garder) if g]


def marching(masque, h, w):
    """Contours du masque binaire, en coordonnées de grille."""
    segs = []
    def val(i, j):
        return 1 if (0 <= i < h and 0 <= j < w and masque[i][j]) else 0
    for i in range(-1, h):
        for j in range(-1, w):
            a, b = val(i, j), val(i, j + 1)
            c, d = val(i + 1, j + 1), val(i + 1, j)
            k = a * 8 + b * 4 + c * 2 + d
            if k == 0 or k == 15:
                continue
            H = (j + 0.5, i);      B = (j + 0.5, i + 1)
            Ga = (j, i + 0.5);     D = (j + 1, i + 0.5)
            if   k in (1, 14): segs.append((Ga, B))
            elif k in (2, 13): segs.append((B, D))
            elif k in (3, 12): segs.append((Ga, D))
            elif k in (4, 11): segs.append((H, D))
            elif k == 5:       segs += [(Ga, H), (B, D)]
            elif k in (6, 9):  segs.append((H, B))
            elif k in (7, 8):  segs.append((Ga, H))
            elif k == 10:      segs += [(Ga, B), (H, D)]
    return segs


def chainer(segs):
    cle = lambda p: (round(p[0], 3), round(p[1], 3))
    voisins = {}
    for s in segs:
        voisins.setdefault(cle(s[0]), []).append(cle(s[1]))
        voisins.setdefault(cle(s[1]), []).append(cle(s[0]))
    vus, lignes = set(), []
    for depart in list(voisins):
        if depart in vus:
            continue
        ligne, cur = [depart], depart
        vus.add(cur)
        while True:
            suite = next((k for k in voisins.get(cur, []) if k not in vus), None)
            if not suite:
                break
            vus.add(suite); ligne.append(suite); cur = suite
        if len(ligne) > 8:
            lignes.append(ligne)
    return lignes


def silhouette():
    from PIL import Image, ImageDraw
    c = terre()
    vb = [float(x) for x in c["vb"].split()]
    W, H = vb[2], vb[3]
    ech = G / max(W, H)
    im = Image.new("1", (int(W * ech) + 2, int(H * ech) + 2), 0)
    d = ImageDraw.Draw(im)
    for a in anneaux(c["d"]):
        d.polygon([(x * ech, y * ech) for x, y in a], fill=1)
    px = im.load()
    w, h = im.size
    masque = [[px[j, i] for j in range(w)] for i in range(h)]

    lignes = chainer(marching(masque, h, w))
    lignes.sort(key=len, reverse=True)
    # GRANDE-TERRE ET PETITE-TERRE, RIEN D'AUTRE. Les deux îlots suivants
    # pèsent respectivement 15 et 5 unités d'aire sur 2 208 : à 48 pixels ce
    # sont deux poussières qui salissent la forme au lieu de la préciser.
    gardes = [l for l in lignes if len(l) > 40][:2]
    print("  contours retenus : " + ", ".join(str(len(l)) + " pts" for l in gardes))

    # normalisation dans un carré 0..100, en gardant les proportions
    tous = [p for l in gardes for p in l]
    xs = [p[0] for p in tous]; ys = [p[1] for p in tous]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    k = 100.0 / max(maxx - minx, maxy - miny)
    dx = (100 - (maxx - minx) * k) / 2
    dy = (100 - (maxy - miny) * k) / 2

    # ON CENTRE SUR LE CENTRE DE MASSE, PAS SUR LA BOÎTE ENGLOBANTE. Petite-Terre
    # est minuscule et très à l'est : elle tire la boîte vers la droite, et
    # Grande-Terre — qui est toute la masse visible — se retrouvait collée à
    # gauche avec un grand vide à droite. On corrige d'un demi-écart entre le
    # centre de la boîte et le barycentre des aires.
    def aire_et_centre(pts):
        a = cx = cy = 0.0
        for i in range(len(pts)):
            x0, y0 = pts[i]; x1, y1 = pts[(i + 1) % len(pts)]
            c = x0 * y1 - x1 * y0
            a += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c
        a *= 0.5
        return abs(a), (cx / (6 * a), cy / (6 * a)) if a else (0, 0)

    poids = [aire_et_centre([((x - minx) * k + dx, (y - miny) * k + dy) for x, y in l])
             for l in gardes]
    at = sum(a for a, _ in poids)
    bx = sum(a * c[0] for a, c in poids) / at
    by = sum(a * c[1] for a, c in poids) / at
    dx += (50 - bx) * 0.75
    dy += (50 - by) * 0.55
    print("  barycentre des terres : %.1f, %.1f  ->  recentrage %+.1f, %+.1f"
          % (bx, by, (50 - bx) * 0.75, (50 - by) * 0.55))

    # On garde la transformation pour pouvoir replacer un point GÉOGRAPHIQUE
    # dans le repère du logo — le point d'ylang marque Mamoudzou, pas un
    # emplacement décoratif choisi à l'œil.
    global TRANSFORME
    TRANSFORME = (minx, miny, k, dx, dy, ech)

    chemins = []
    total = 0
    for l in gardes:
        pts = [((x - minx) * k + dx, (y - miny) * k + dy) for x, y in l]
        # 1,2 au lieu de 0,55 : le premier jet gardait 187 points pour
        # Grande-Terre, illisibles sous 96 pixels et lourds partout.
        pts = dp(pts, 1.2)
        if len(pts) < 4:
            continue
        total += len(pts)
        chemins.append("M" + " ".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z")
    print("  %d points après simplification" % total)
    return "".join(chemins)


# ------------------------------------------------------------------ dessins
def point_geo(lat, lon):
    """Un point (lat, lon) dans le repère 0..100 du logo."""
    out = subprocess.run(
        ["node", "-e",
         "const fs=require('fs'),vm=require('vm');const b={};vm.createContext(b);"
         "vm.runInContext(fs.readFileSync('carte.js','utf8')+';globalThis.__c=CARTE;',b);"
         "const C=b.__c,k=Math.cos(C.lat0*Math.PI/180);"
         "process.stdout.write(JSON.stringify([((%f-C.lon0)*k-C.minx)*C.ech,"
         "(-(%f-C.lat0)-C.miny)*C.ech]))" % (lon, lat)],
        capture_output=True, text=True, encoding="utf-8", cwd=BASE, check=True)
    vx, vy = json.loads(out.stdout)
    minx, miny, k, dx, dy, ech = TRANSFORME
    return ((vx * ech - minx) * k + dx, (vy * ech - miny) * k + dy)


def texte_en_traces(mot, police, taille, x, y, espacement=0.0):
    """Le mot converti en TRACÉS. Un logo qui dépend d'une police installée
    n'est pas un logo : sur la machine de quelqu'un d'autre, il sort en Times.
    Ici les lettres deviennent de la géométrie, et le fichier se suffit."""
    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    f = TTFont(os.path.join(TTF, police + ".ttf"))
    upem = f["head"].unitsPerEm
    cmap = f.getBestCmap()
    gs = f.getGlyphSet()
    hmtx = f["hmtx"]
    ech = taille / upem
    bouts, plume_x = [], 0.0
    for c in mot:
        nom = cmap.get(ord(c))
        if nom is None:
            plume_x += taille * 0.4
            continue
        pen = SVGPathPen(gs)
        gs[nom].draw(pen)
        d = pen.getCommands()
        if d:
            bouts.append(f'<path d="{d}" transform="translate({x + plume_x:.2f} {y:.2f}) '
                         f'scale({ech:.5f} {-ech:.5f})"/>')
        plume_x += hmtx[nom][0] * ech + espacement
    return "".join(bouts), plume_x


def badge(ile, mamoudzou, cote, x=0, y=0, rayon=None):
    """LE BADGE, seule et unique définition de la marque. Le bloc horizontal
    la réutilise telle quelle : deux dessins séparés divergent toujours.

    LES PROPORTIONS, APRÈS DEUX ESSAIS RATÉS. Au premier jet l'île tenait un
    cinquième du côté et devenait une poussière ; au deuxième elle en tenait
    plus des trois cinquièmes et SORTAIT du carré — Mayotte y perdait ses deux
    pointes, c'est-à-dire précisément ce qui la rend reconnaissable. Elle en
    occupe maintenant 56 %, posée dans le tiers supérieur, la vague dessous.

    L'ARC A DISPARU DEPUIS LE PREMIER JET : posé au-dessus de l'île il se
    lisait comme l'anse d'un panier. Le jaune de l'ylang revient en un point
    sur Mamoudzou — ce qui dit quelque chose, tient à toutes les tailles, et
    reprend l'idée d'épingle du dessin choisi par Raika. """
    r = cote * 0.27 if rayon is None else rayon
    F = 0.56                                  # part du côté occupée par l'île
    E = F * cote / 100.0
    ox = x + cote / 2 - 50 * E
    oy = y + cote * 0.11
    mx, my = mamoudzou
    vy = y + cote * 0.83                      # la vague, sous l'île
    d = cote * 0.115
    return f'''<rect x="{x}" y="{y}" width="{cote}" height="{cote}" rx="{r:.1f}" fill="{PASSE}"/>
  <g transform="translate({ox:.2f} {oy:.2f}) scale({E:.4f})">
    <path d="{ile}" fill="{SABLE}"/>
    <circle cx="{mx:.1f}" cy="{my:.1f}" r="5.2" fill="{PASSE}"/>
    <circle cx="{mx:.1f}" cy="{my:.1f}" r="3.6" fill="{YLANG}"/>
  </g>
  <path d="M{x + cote*0.155:.2f} {vy:.2f}q{d/2:.2f} -{cote*0.062:.2f} {d:.2f} 0t{d:.2f} 0 {d:.2f} 0 {d:.2f} 0 {d:.2f} 0"
        fill="none" stroke="{PLATIER}" stroke-width="{cote*0.052:.2f}" stroke-linecap="round"/>'''


def marque(ile, mamoudzou, taille=48):
    return (f'<svg viewBox="0 0 {taille} {taille}" xmlns="http://www.w3.org/2000/svg"'
            f' role="img" aria-label="Maoré Quest">{NL}  '
            + badge(ile, mamoudzou, taille) + NL + "</svg>" + NL)


def lockup(ile, mamoudzou, sombre=False):
    """LE BLOC HORIZONTAL, lettres converties en TRACÉS. Un logo qui dépend
    d'une police installée n'est pas un logo : sur la machine de quelqu'un
    d'autre il sort en Times. Sur fond sombre le nom passe en sable — au
    deuxième jet il restait en basalte et disparaissait purement."""
    encre = SABLE if sombre else BASALTE
    maore, _ = texte_en_traces("Maoré", "youngserif", 30, 68, 42)
    quest, _ = texte_en_traces("QUEST", "karibu-sans", 13.5, 69, 60, espacement=3.2)
    return f'''<svg viewBox="0 0 246 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Maoré Quest">
  {badge(ile, mamoudzou, 48, x=4, y=12, rayon=13)}
  <g fill="{encre}">{maore}</g>
  <g fill="{PLATIER}">{quest}</g>
</svg>
'''


def main():
    print("Silhouette de Mayotte")
    ile = silhouette()
    print("  chaîne : %d caractères" % len(ile))

    mam = point_geo(-12.7806, 45.2278)          # Mamoudzou
    print("  Mamoudzou dans le repère du logo : %.1f, %.1f" % mam)

    io.open(os.path.join(BASE, "marque.svg"), "w", encoding="utf-8",
            newline=NL).write(marque(ile, mam))
    io.open(os.path.join(BASE, "logo.svg"), "w", encoding="utf-8",
            newline=NL).write(lockup(ile, mam))
    io.open(os.path.join(BASE, "logo-sombre.svg"), "w", encoding="utf-8",
            newline=NL).write(lockup(ile, mam, sombre=True))

    # la même silhouette, mise à disposition du code
    js = ("/* =============================================================================" + NL +
          "   MAORÉ QUEST — la silhouette de l'île, simplifiée pour la marque" + NL +
          "   ---------------------------------------------------------------------------" + NL +
          "   Fabriquée par outils/logo.py. Ne pas éditer à la main." + NL + NL +
          "   C'est la VRAIE forme de Mayotte, retracée depuis les contours IGN des" + NL +
          "   communes de carte.js puis simplifiée : quarante points au lieu de six" + NL +
          "   mille. À 48 pixels, la différence ne se voit pas ; le poids, si." + NL +
          "   ========================================================================== */" + NL + NL +
          "const MARQUE = " + json.dumps({"ile": ile}, ensure_ascii=False) + ";" + NL)
    io.open(os.path.join(BASE, "marque.js"), "w", encoding="utf-8", newline=NL).write(js)
    print("  marque.svg, logo.svg, logo-sombre.svg, marque.js écrits")


if __name__ == "__main__":
    main()
