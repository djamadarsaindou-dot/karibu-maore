# -*- coding: utf-8 -*-
"""
Fabrique les pages d'aperçu de partage, une par fiche : `l/<id>.html`.

LE PROBLÈME. L'application est une page unique dont la route est dans le
fragment (`#/lieu/choungui`). Un robot d'aperçu — WhatsApp, Facebook, Signal,
Slack, iMessage — n'exécute pas le JavaScript et NE REÇOIT MÊME PAS le
fragment : le serveur ne le voit jamais. Toutes les fiches partagées
affichaient donc rigoureusement le même aperçu, celui de l'accueil.

LA SOLUTION SUR UN HÉBERGEMENT STATIQUE. Une vraie page HTML par fiche, avec
ses balises Open Graph, qui renvoie l'humain vers l'application. Le robot lit
les balises ; la personne est redirigée. C'est la seule façon d'y arriver sans
serveur.

TROIS REDIRECTIONS, ET IL EN FAUT TROIS.
  1. `<script>` : instantané, invisible, et il remplace l'entrée d'historique
     au lieu d'en ajouter une — sinon le bouton « retour » revient sur la page
     d'aperçu, qui redirige à nouveau : l'utilisateur est piégé.
  2. `<meta http-equiv="refresh">` : pour les navigateurs sans JavaScript.
  3. Un lien visible : pour tout le reste, et pour les robots polis.

L'IMAGE. 1 200 × 630, le format que réclament les robots. La photo de la
fiche quand elle en a une, l'aplat gravé de sa catégorie sinon — les mêmes
couleurs que la carte postale, pour que ce soit reconnaissable.

CE QUI EST DÉLIBÉRÉMENT ABSENT : `og:image` en WebP. Le format est bien
supporté par les navigateurs, beaucoup moins par les robots d'aperçu. On écrit
du JPEG, qui n'a jamais posé de problème à personne.
"""
import io, os, json, subprocess, textwrap, html
from PIL import Image, ImageDraw, ImageFont

Image.MAX_IMAGE_PIXELS = None
BASE = r"C:\Users\djama\Documents\Karibu-Maore"
DST_HTML = os.path.join(BASE, "l")
DST_IMG = os.path.join(BASE, "og")
TTF = r"C:\pdtmp\kdem"

L, H = 1200, 630
SABLE = (244, 237, 226)
BASALTE = (36, 31, 24)
YLANG = (196, 182, 62)
VASE = (94, 90, 81)

CAT = {
    "mer":      ((10, 58, 87), (29, 169, 162)),
    "plage":    ((10, 58, 87), (29, 169, 162)),
    "nature":   ((47, 93, 58), (196, 182, 62)),
    "culture":  ((36, 31, 29), (196, 182, 62)),
    "food":     ((169, 80, 43), (244, 237, 226)),
    "famille":  ((169, 80, 43), (244, 237, 226)),
    "pratique": ((94, 90, 81), (244, 237, 226)),
}


def js(fichier, expr):
    """Lit une valeur d'un fichier JS via Node — pas de second analyseur à
    maintenir, et donc pas de dérive possible entre les deux."""
    src = ";".join(
        "vm.runInContext(fs.readFileSync(%s,'utf8'),b)" % json.dumps(os.path.join(BASE, f))
        for f in fichier)
    code = ("const fs=require('fs'),vm=require('vm');const b={};vm.createContext(b);"
            + src + ";vm.runInContext(\"globalThis.__o=" + expr + "\",b);"
            "process.stdout.write(JSON.stringify(b.__o));")
    out = subprocess.run(["node", "-e", code], capture_output=True, text=True,
                         encoding="utf-8", cwd=BASE)
    if out.returncode:
        raise RuntimeError(out.stderr)
    return json.loads(out.stdout)


def police(nom, taille):
    return ImageFont.truetype(os.path.join(TTF, nom + ".ttf"), taille)


def cmap(nom):
    """Les caractères que la police sait réellement dessiner."""
    from fontTools.ttLib import TTFont
    f = TTFont(os.path.join(TTF, nom + ".ttf"))
    jeu = set()
    for t in f["cmap"].tables:
        jeu |= set(t.cmap.keys())
    return jeu


# Le navigateur retombe sur une autre police quand un glyphe manque ; PIL, non :
# il dessine un carré vide. « La barge Mamoudzou ↔ Dzaoudzi » sortait avec un
# tofu au milieu du titre. On remplace donc par un équivalent qui EXISTE et qui
# dit la même chose — un tiret entre deux villes se lit comme un trajet.
REMPLACE = {"↔": "–", "→": "–", "↑": "^", "−": "-", " ": " ", "…": "..."}


def sur_mesure(texte, jeu):
    out = []
    for c in texte:
        if ord(c) in jeu:
            out.append(c)
        elif c in REMPLACE and all(ord(x) in jeu for x in REMPLACE[c]):
            out.append(REMPLACE[c])
        else:
            out.append(" ")
    return " ".join("".join(out).split())


def couper(d, texte, fonte, large, maxi):
    mots, out, cur = texte.split(), [], ""
    for m in mots:
        essai = (cur + " " + m).strip()
        if d.textlength(essai, font=fonte) > large and cur:
            out.append(cur); cur = m
        else:
            cur = essai
        if len(out) == maxi:
            break
    if cur and len(out) < maxi:
        out.append(cur)
    return out


def assombrir(c, f):
    return tuple(int(x * f) for x in c)


def image(l, photos):
    im = Image.new("RGB", (L, H), SABLE)
    p = photos.get(l["id"])
    fond, trait = CAT.get(l["cat"], CAT["pratique"])
    if p:
        src = Image.open(os.path.join(BASE, "photos", p["f"])).convert("RGB")
        r = max(L / src.width, H / src.height)
        src = src.resize((round(src.width * r), round(src.height * r)), Image.LANCZOS)
        im.paste(src, ((L - src.width) // 2, (H - src.height) // 2))
    else:
        # dégradé vers un fond PLUS SOMBRE, jamais vers la couleur de trait :
        # sinon le bas de l'image devient la couleur du papier et tout se délave
        bas = assombrir(fond, 0.55)
        d = ImageDraw.Draw(im)
        for y in range(H):
            t = y / H
            d.line([(0, y), (L, y)],
                   fill=tuple(round(fond[i] + (bas[i] - fond[i]) * t) for i in range(3)))
        trame = Image.new("RGBA", (L, H), (0, 0, 0, 0))
        dt = ImageDraw.Draw(trame)
        for x in range(-H, L, 26):
            dt.line([(x, H), (x + H, 0)], fill=trait + (34,), width=3)
        im = Image.alpha_composite(im.convert("RGBA"), trame).convert("RGB")

    # le voile qui garantit le texte, quelle que soit la photo
    voile = Image.new("RGBA", (L, H), (0, 0, 0, 0))
    dv = ImageDraw.Draw(voile)
    for y in range(H):
        t = max(0.0, (y - H * 0.35) / (H * 0.65))
        dv.line([(0, y), (L, y)], fill=(18, 24, 28, int(235 * t ** 1.4)))
    im = Image.alpha_composite(im.convert("RGBA"), voile).convert("RGB")

    d = ImageDraw.Draw(im)
    M = 62
    nom = sur_mesure(l["nom"], JEU_TITRE)
    f_titre = police("youngserif", 62)
    lignes = couper(d, nom, f_titre, L - 2 * M, 2)
    while lignes and max(d.textlength(t, font=f_titre) for t in lignes) > L - 2 * M and f_titre.size > 38:
        f_titre = police("youngserif", f_titre.size - 4)
        lignes = couper(d, nom, f_titre, L - 2 * M, 2)

    y = H - 140 - (len(lignes) - 1) * (f_titre.size + 8)
    f_com = police("karibu-sans", 24)
    d.text((M, y - 44), sur_mesure((l.get("commune") or "Mayotte").upper(), JEU_TEXTE),
           font=f_com, fill=YLANG)
    for t in lignes:
        d.text((M, y), t, font=f_titre, fill=(255, 255, 255))
        y += f_titre.size + 8

    f_res = police("karibu-sans", 26)
    res = couper(d, sur_mesure(l.get("resume", ""), JEU_TEXTE), f_res, L - 2 * M - 240, 1)
    if res:
        d.text((M, H - 66), res[0], font=f_res, fill=(226, 220, 210))
    f_sig = police("karibu-sans", 26)
    sig = "Maoré Quest"
    d.text((L - M - d.textlength(sig, font=f_sig), H - 66), sig, font=f_sig, fill=(255, 255, 255))
    return im


GABARIT = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titre} — Maoré Quest</title>
<link rel="canonical" href="{url}">
<meta name="description" content="{desc}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Maoré Quest">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{titre}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{titre}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{img}">
<meta name="robots" content="index, follow">
<!-- 1. le script : instantané, et il REMPLACE l'entrée d'historique. Sans
     `replace`, le bouton retour ramène ici, qui redirige de nouveau : piège. -->
<script>location.replace("../#/lieu/{id}");</script>
<!-- 2. le repli sans JavaScript -->
<meta http-equiv="refresh" content="0; url=../#/lieu/{id}">
<style>
  body{{margin:0;min-height:100vh;display:grid;place-items:center;
    background:#f4ede2;color:#241f1d;
    font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;padding:2rem}}
  main{{max-width:34rem;text-align:center}}
  h1{{font-size:1.6rem;margin:0 0 .5rem}}
  img{{max-width:100%;height:auto;border-radius:14px;margin-bottom:1.5rem}}
  a{{color:#0f6f6b}}
</style>
</head>
<body>
<main>
  <img src="../{imgrel}" alt="{alt}" width="1200" height="630">
  <h1>{titre}</h1>
  <p>{desc}</p>
  <!-- 3. et pour tout le reste, un lien qu'on voit -->
  <p><a href="../#/lieu/{id}">Ouvrir dans Maoré Quest</a></p>
</main>
</body>
</html>
"""


JEU_TITRE, JEU_TEXTE = None, None


def main():
    global JEU_TITRE, JEU_TEXTE
    JEU_TITRE = cmap("youngserif")
    JEU_TEXTE = cmap("karibu-sans")
    lieux = js(["data.js"], "LIEUX")
    photos = js(["photos.js"], "PHOTOS")
    app = js(["data.js"], "APP")
    racine = app["url"].rstrip("/")

    os.makedirs(DST_HTML, exist_ok=True)
    os.makedirs(DST_IMG, exist_ok=True)
    total = 0
    for l in lieux:
        img = image(l, photos)
        chemin = os.path.join(DST_IMG, l["id"] + ".jpg")
        img.save(chemin, "JPEG", quality=72, optimize=True, progressive=True)
        total += os.path.getsize(chemin)

        page = GABARIT.format(
            id=l["id"],
            titre=html.escape(l["nom"], quote=True),
            desc=html.escape(l.get("resume", ""), quote=True),
            alt=html.escape("%s, %s" % (l["nom"], l.get("commune", "Mayotte")), quote=True),
            url="%s/l/%s.html" % (racine, l["id"]),
            img="%s/og/%s.jpg" % (racine, l["id"]),
            imgrel="og/%s.jpg" % l["id"])
        io.open(os.path.join(DST_HTML, l["id"] + ".html"), "w",
                encoding="utf-8", newline="\n").write(page)

    print("  %d pages dans l/ et %d images dans og/ (%.0f Ko au total, %.0f Ko en moyenne)"
          % (len(lieux), len(lieux), total / 1024, total / 1024 / len(lieux)))


if __name__ == "__main__":
    main()
