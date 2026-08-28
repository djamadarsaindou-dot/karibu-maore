# -*- coding: utf-8 -*-
"""
Fabrique les deux polices embarquées de Karibu Maoré.

Chaîne : instanciation de l'axe optique → renommage → sous-ensemblement → woff2.

POURQUOI RENOMMER. Le fichier OFL d'Inter ne déclare pas de « Reserved Font
Name », mais son auteur l'affirme dans le README du projet. Un fichier modifié
versé dans un dépôt public sous le nom « Inter » serait une zone grise inutile :
renommer coûte douze lignes et ferme la question.

POURQUOI INSTANCIER opsz=16. L'axe optique d'Inter sert à resserrer les grands
titres — or les grands titres sont composés en Young Serif, donc la sans ne
dépasse jamais 20 px. L'axe ne sert plus à rien et coûte 21 Ko.

LES CARACTÈRES À NE PAS OUBLIER, vérifiés dans le contenu réel de l'appli :
  U+202F espace fine insécable — obligatoire en français devant : ; ! ? et
         dans les guillemets « … »
  U+0181 U+018A  Ɓ Ɗ capitales — sinon un titre en majuscules casse
  U+0253 U+0257  ɓ ɗ minuscules du shimaoré
  U+2194 ↔  « La barge Mamoudzou ↔ Dzaoudzi » (data.js)
  U+2212 −  « −6 % … −31 % » (data-resa.js)
Sans eux, le caractère bascule sur une police de repli AU MILIEU d'une ligne.
"""
import subprocess, sys, os
from fontTools.ttLib import TTFont

ICI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ICI, "fonts")
DST = r"C:\Users\djama\Documents\Karibu-Maore\assets\fonts"

UNICODES = ",".join([
    "U+0000-00FF",              # latin de base + latin-1 (accents français)
    "U+0131", "U+0152-0153",    # ı, Œ œ
    "U+0178", "U+014A-014B",    # Ÿ, Ŋ ŋ
    "U+0181", "U+018A",         # Ɓ Ɗ capitales
    "U+0253", "U+0257",         # ɓ ɗ shimaoré
    "U+02BC",                   # apostrophe modificative
    "U+2010-2015",              # tirets
    "U+2018-201A", "U+201C-201E",
    "U+2020", "U+2022", "U+2026",
    "U+202F",                   # espace fine insécable
    "U+2039-203A", "U+20AC",    # ‹ › €
    "U+2192", "U+2194",         # → ↔
    "U+2212",                   # − (moins typographique)
    "U+2713", "U+00D7",         # ✓ ×
])

FEATURES = "kern,liga,clig,calt,ccmp,mark,mkmk,locl,case,tnum,ss01,ss02,ss03"

def executer(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode:
        print(r.stdout[-1500:]); print(r.stderr[-1500:])
        raise SystemExit(f"échec : {' '.join(args[:4])}…")

def renommer(src, dst, famille, ancien):
    f = TTFont(src)
    for rec in f["name"].names:
        if rec.nameID in (1, 3, 4, 6, 16, 21):
            f["name"].setName(rec.toUnicode().replace(ancien, famille),
                              rec.nameID, rec.platformID, rec.platEncID, rec.langID)
    f.save(dst)

def ko(p): return f"{os.path.getsize(p)/1024:.1f} Ko"

def main():
    os.makedirs(DST, exist_ok=True)
    inter = os.path.join(SRC, "Inter[opsz,wght].ttf")
    tmp1 = os.path.join(ICI, "_opsz16.ttf")
    tmp2 = os.path.join(ICI, "_renomme.ttf")

    print("  1. instanciation de l'axe optique à 16…")
    executer([sys.executable, "-m", "fontTools.varLib.instancer", inter, "opsz=16", "-o", tmp1])

    print("  2. renommage en « Karibu Sans »…")
    renommer(tmp1, tmp2, "Karibu Sans", "Inter")

    print("  3. sous-ensemblement…")
    sortie = os.path.join(DST, "karibu-sans.woff2")
    executer([sys.executable, "-m", "fontTools.subset", tmp2,
              f"--output-file={sortie}", "--flavor=woff2", f"--unicodes={UNICODES}",
              f"--layout-features={FEATURES}", "--drop-tables+=DSIG",
              "--name-IDs=0,1,2,3,4,5,6,13,14", "--notdef-outline"])
    print(f"     karibu-sans.woff2  {ko(sortie)}")

    print("  4. Young Serif (titres français seulement)…")
    ys = os.path.join(DST, "youngserif.woff2")
    executer([sys.executable, "-m", "fontTools.subset",
              os.path.join(SRC, "YoungSerif-Regular.ttf"),
              f"--output-file={ys}", "--flavor=woff2",
              "--unicodes=U+0000-00FF,U+0152-0153,U+0178,U+2010-2015,U+2018-201A,"
              "U+201C-201E,U+2026,U+202F,U+2039-203A,U+20AC",
              "--layout-features=kern,liga,clig,calt,ccmp,mark,mkmk,locl,case",
              "--drop-tables+=DSIG", "--notdef-outline"])
    print(f"     youngserif.woff2   {ko(ys)}")

    for t in (tmp1, tmp2):
        if os.path.exists(t): os.remove(t)

    print("\n  — contrôle des glyphes —")
    for nom, chemin, requis in [
        ("Karibu Sans", sortie, {0x0253:"ɓ",0x0257:"ɗ",0x0181:"Ɓ",0x018A:"Ɗ",0x0152:"Œ",
                                 0x00E7:"ç",0x202F:"espace fine",0x2194:"↔",0x2212:"−",0x20AC:"€"}),
        ("Young Serif", ys,     {0x0152:"Œ",0x00E7:"ç",0x00C9:"É",0x202F:"espace fine"}),
    ]:
        cm = TTFont(chemin).getBestCmap()
        manque = [v for k, v in requis.items() if k not in cm]
        nom_interne = TTFont(chemin)["name"].getDebugName(1)
        etat = "tout est là" if not manque else "MANQUE " + " ".join(manque)
        print(f"  {nom:<12} {len(cm):>3} glyphes · nom interne « {nom_interne} » · {etat}")

    total = (os.path.getsize(sortie) + os.path.getsize(ys)) / 1024
    print(f"\n  total embarqué : {total:.1f} Ko (budget 150 Ko)")

if __name__ == "__main__":
    main()
