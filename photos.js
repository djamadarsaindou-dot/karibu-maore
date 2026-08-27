/* =============================================================================
   KARIBU MAORÉ — photographies
   -----------------------------------------------------------------------------
   RÈGLE ABSOLUE : une photo ne figure ici que si elle montre VRAIMENT le lieu
   de la fiche. Une belle plage tropicale générique posée sur « N'Gouja » serait
   un mensonge — et le premier visiteur qui arrive sur place le verrait.
   Chaque entrée a donc été regardée avant d'être inscrite.

   Toutes les photos sont sous licence libre (CC0, domaine public, CC BY ou
   CC BY-SA). L'attribution est OBLIGATOIRE pour les licences BY et BY-SA :
   elle est affichée sur la fiche et sur la page « Crédits photo ».

   Les fiches absentes de cette liste gardent leur illustration SVG générée —
   c'est volontaire, et c'est mieux qu'une image approximative.

   Champs :
   f    fichier dans le dossier photos/
   a    auteur (tel que crédité sur Commons)
   l    licence
   u    URL de la page du fichier sur Wikimedia Commons
   d    ce que montre la photo (sert d'alternative textuelle)
   ========================================================================== */

const PHOTOS = {
  "baleines": {
    "f": "baleines.webp",
    "a": "DavidLorieux",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:20231004_-_Baleine_%C3%A0_bosse_-_David_Lorieux_-_Ceta%27Maore.jpg",
    "d": "Le dos d'une baleine à bosse à la surface",
    "w": 1000,
    "h": 666
  },
  "choungui": {
    "f": "choungui.webp",
    "a": "Frédéric Ducarme",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Choungui_nord.jpg",
    "d": "Le piton du mont Choungui vu depuis le nord",
    "w": 1000,
    "h": 750
  },
  "debaa": {
    "f": "debaa.webp",
    "a": "Bertrand Fanonnel / Eight Studio",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Danseuse_et_musicienne_de_debaa.jpg",
    "d": "Danseuse et musicienne de debaa",
    "w": 820,
    "h": 1228
  },
  "dziani": {
    "f": "dziani.webp",
    "a": "auteur non précisé",
    "l": "CC0",
    "u": "https://commons.wikimedia.org/wiki/File:Mayotte-indian-ocean-dziani-lake-landscape-496a6b54ac95062ba05d28389a3cadac.jpg",
    "d": "Le lac de cratère Dziani Dzaha, vert, entouré de végétation",
    "w": 820,
    "h": 549
  },
  "ilot-bouzi": {
    "f": "ilot-bouzi.webp",
    "a": "Frédéric Ducarme",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:%C3%8Elot_M%27Bouzi.jpg",
    "d": "L'îlot M'Bouzi, boisé, au milieu du lagon",
    "w": 1000,
    "h": 748
  },
  "ilot-sable": {
    "f": "ilot-sable.webp",
    "a": "Pipin~frwiki",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:%C3%8Elot_de_sable_blanc.JPG",
    "d": "Le banc de sable blanc émergé, au ras de l'eau du lagon",
    "w": 1000,
    "h": 666
  },
  "makis": {
    "f": "makis.webp",
    "a": "VillageHero from Ulm, Germany",
    "l": "CC BY-SA 2.0",
    "u": "https://commons.wikimedia.org/wiki/File:Daydreaming_Maki_(Jardin_Maor%C3%A9,_Mayotte)_(30578301194).jpg",
    "d": "Un maki brun sur une branche, à Mayotte",
    "w": 1000,
    "h": 750
  },
  "mangrove": {
    "f": "mangrove.webp",
    "a": "Lizot pierrick",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Mangrove_de_chirongui_%C3%A0_Mayotte.jpg",
    "d": "Les racines échasses de la mangrove de Chirongui",
    "w": 820,
    "h": 544
  },
  "mtsamboro": {
    "f": "mtsamboro.webp",
    "a": "Tanguy Nicolas",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Mtzamboro_Mayotte-TNicolas.jpg",
    "d": "La côte de Mtsamboro et les îlots du nord",
    "w": 1000,
    "h": 666
  },
  "muma": {
    "f": "muma.webp",
    "a": "Eight-Studio / Bertrand Fanonnel",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Le_MUMA_(Mus%C3%A9e_de_Mayotte).jpg",
    "d": "L'intérieur du musée de Mayotte et son squelette de baleine",
    "w": 1000,
    "h": 562
  },
  "papani": {
    "f": "papani.webp",
    "a": "mwanasimba from La Réunion",
    "l": "CC BY-SA 2.0",
    "u": "https://commons.wikimedia.org/wiki/File:Cliff_near_Papani_beach_(2850008285).jpg",
    "d": "La falaise et la plage de Papani",
    "w": 1000,
    "h": 750
  },
  "passe-en-s": {
    "f": "passe-en-s.webp",
    "a": "Frédéric Ducarme",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Passe_en_S.jpg",
    "d": "Le lagon vers la Passe en S",
    "w": 1000,
    "h": 750
  },
  "sakouli": {
    "f": "sakouli.webp",
    "a": "Frédéric Ducarme",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Sakouli_baobabs.jpg",
    "d": "La plage de Sakouli et ses baobabs",
    "w": 1000,
    "h": 729
  },
  "saziley": {
    "f": "saziley.webp",
    "a": "Frédéric Ducarme",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Plages_de_Saziley.jpg",
    "d": "Les eaux claires et le récif devant les plages de Saziley",
    "w": 1000,
    "h": 750
  },
  "snorkeling": {
    "f": "snorkeling.webp",
    "a": "Lizot pierrick",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Le_lagon_de_Mayotte.jpg",
    "d": "Le lagon de Mayotte, d'un calme de miroir",
    "w": 1000,
    "h": 664
  },
  "soulou": {
    "f": "soulou.webp",
    "a": "Plg56",
    "l": "CC BY-SA 3.0",
    "u": "https://commons.wikimedia.org/wiki/File:Cascade_de_Soulou.JPG",
    "d": "La cascade de Soulou tombant au bord de la plage",
    "w": 820,
    "h": 615
  },
  "tsingoni": {
    "f": "tsingoni.webp",
    "a": "Ornella Lamberti",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Tsingoni_minaret.jpg",
    "d": "Le minaret de la mosquée de Tsingoni",
    "w": 1000,
    "h": 1334
  },
  "ylang": {
    "f": "ylang.webp",
    "a": "Frédéric Ducarme",
    "l": "CC BY-SA 4.0",
    "u": "https://commons.wikimedia.org/wiki/File:Champ_d%27ylang-ylang_%C3%A0_Mayotte.jpg",
    "d": "Un champ d'ylang-ylang à Mayotte",
    "w": 820,
    "h": 615
  }
};

/* Licences et leur page de référence, pour créditer correctement */
const LICENCES = {
  "CC0":          "https://creativecommons.org/publicdomain/zero/1.0/deed.fr",
  "Public domain":"https://fr.wikipedia.org/wiki/Domaine_public",
  "CC BY 2.0":    "https://creativecommons.org/licenses/by/2.0/deed.fr",
  "CC BY 3.0":    "https://creativecommons.org/licenses/by/3.0/deed.fr",
  "CC BY 4.0":    "https://creativecommons.org/licenses/by/4.0/deed.fr",
  "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/deed.fr",
  "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/deed.fr",
  "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/deed.fr"
};

const photo = id => PHOTOS[id] || null;
const licenceUrl = l => LICENCES[l] || "https://commons.wikimedia.org";
