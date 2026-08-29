/* ============================================================
   MAORÉ QUEST — base de contenu
   Ce fichier est le SEUL à modifier pour mettre à jour l'appli.
   Aucun build, aucun npm : on édite, on enregistre, on pousse.
   ------------------------------------------------------------
   Champs d'une fiche :
   id        identifiant unique (ne jamais le changer : les favoris s'y réfèrent)
   nom       nom affiché
   cat       nature | plage | mer | culture | food | famille | pratique
   commune   commune / lieu-dit
   zone      grande-terre | petite-terre | lagon
   resume    une phrase, ce que c'est
   texte     description longue
   quand     meilleur moment (saison, marée, heure)
   duree     en heures (nombre) — pour construire les journées
   budget    0 gratuit · 1 petit · 2 moyen · 3 élevé
   maree     'basse' | 'haute' | null  → l'appli avertit si ça ne colle pas
   saison    liste de mois (1-12) où c'est au top ; [] = toute l'année
   tags      famille, sportif, sansVoiture, ombre, pluie (OK sous la pluie)
   presta    liste d'ids de prestataires (voir PRESTATAIRES) ; [] = pas de résa
   gps       [lat, lon] APPROXIMATIF — sert au tri « près de moi », pas au GPS
   ============================================================ */

const APP = {
  nom: "Maoré Quest",
  baseline: "Tout ce qu'il y a à faire à Mayotte — et comment le réserver",
  version: "1.0.0",
  maj: "2026-08-28",
  // Numéro de contact, format international sans + ni espaces (0639 40 69 48)
  url: "https://djamadarsaindou-dot.github.io/karibu-maore/",
  contactWhatsApp: "262639406948",
  contactMail: "djamadar.saindou@gmail.com"
};

/* Les catégories portent un nom shimaoré quand il en existe un ATTESTÉ.
   La règle : le shimaoré nomme ce qui existe à Mayotte, le français conduit
   l'action. Un mot n'est repris que s'il est confirmé — on ne forge pas de
   vocabulaire. « sh » vide = pas de terme validé, le français suffit.
   Pièges évités : « shanza » n'est pas « village » (c'est la cour privée
   d'une famille), « banga » désigne aussi l'habitat précaire, et « fady »
   est malgache, pas shimaoré. */
const CATEGORIES = [
  { id: "nature",   nom: "Nature & rando",       sh: "Mlima",    ico: "montagne",  fr: "les reliefs" },
  { id: "plage",    nom: "Plages & îlots",       sh: "Mutsanga", ico: "plage",     fr: "le sable" },
  { id: "mer",      nom: "Lagon & sorties mer",  sh: "Bahari",   ico: "vagues",    fr: "la mer" },
  { id: "culture",  nom: "Culture & patrimoine", sh: "",         ico: "mosquee",   fr: "" },
  { id: "food",     nom: "Manger mahorais",      sh: "",         ico: "couverts",  fr: "" },
  { id: "famille",  nom: "Avec des enfants",     sh: "",         ico: "gens",      fr: "" },
  { id: "pratique", nom: "Se déplacer",          sh: "",         ico: "boussole",  fr: "" }
];

const LIEUX = [
  /* ---------------------- NATURE & RANDO ---------------------- */
  {
    id: "choungui", nom: "Mont Choungui", cat: "nature", commune: "Kani-Kéli", zone: "grande-terre",
    resume: "Le piton emblématique de Mayotte, 594 m, vue à 360° sur le lagon.",
    texte: "Un ancien dôme volcanique qui se dresse tout seul au sud de l'île. La montée est courte mais très raide sur la fin : ça grimpe à quatre pattes dans les racines. En haut, on voit la double barrière de corail, la baie de Bouéni et, par temps clair, les autres îles de l'archipel.",
    quand: "Tôt le matin (départ avant 7 h) ou en fin d'après-midi. Éviter après de fortes pluies : la terre rouge devient une patinoire.",
    duree: 3, budget: 0, maree: null, saison: [5,6,7,8,9,10],
    tags: ["sportif", "groupe"],
    vedette: 2,
    conseils: [
      "Cotation : DIFFICILE. Environ 1,2 km depuis le parking (343 m) pour à peu près 250 m de dénivelé, très raide et continu, avec des sections où l'on progresse à quatre pattes en s'aidant des racines. Déconseillé aux jeunes enfants et aux personnes sujettes au vertige.",
      "La descente est plus redoutable que la montée : terrain érodé, extrêmement glissant par temps de pluie.",
      "2 litres d'eau par personne minimum. Depuis Chido, il y a beaucoup moins d'ombre qu'avant.",
      "Marchez en groupe et n'emportez pas d'objets de valeur : en juillet 2021, onze randonneurs ont été dépouillés par des individus armés à 50 m du début du sentier. Ne laissez rien de visible dans la voiture.",
      "État du sentier à vérifier avant de partir auprès de l'office de tourisme : de nombreux cheminements sont encore en cours de réouverture depuis le cyclone."
    ],
    presta: ["guide-rando"], gps: [-12.9667, 45.1333],
    verifie: "2026-08-25", etat: "a-confirmer",
    sources: [
      { t: "Mont Choungui — altitude et description", u: "https://fr.wikipedia.org/wiki/Mont_Choungui" },
      { t: "Mayotte Hebdo — agression de randonneurs (2021)", u: "https://mayottehebdo.com/actualite/insecurite/28487/" }
    ]
  },
  {
    id: "benara", nom: "Mont Bénara", cat: "nature", commune: "Ouangani / Chirongui", zone: "grande-terre",
    resume: "Le point culminant de l'île (660 m), dans la forêt humide.",
    texte: "Moins spectaculaire que Choungui côté panorama, mais bien plus riche : forêt relique, fougères arborescentes, oiseaux endémiques. C'est la randonnée « nature » de l'île.",
    quand: "Saison sèche. Le sommet est souvent dans les nuages en saison des pluies.",
    duree: 4, budget: 0, maree: null, saison: [5,6,7,8,9,10,11],
    tags: ["sportif", "ombre", "groupe"],
    vedette: 1,
    conseils: [
      "Sentier peu balisé par endroits : y aller accompagné ou avec une trace GPS téléchargée à l'avance.",
      "Anti-moustiques obligatoire en forêt."
    ],
    presta: ["guide-rando"], gps: [-12.8833, 45.1500]
  },
  {
    id: "dziani", nom: "Lac Dziani Dzaha", cat: "nature", commune: "Dzaoudzi-Labattoir", zone: "petite-terre",
    resume: "Un lac de cratère vert émeraude, unique au monde par sa chimie.",
    texte: "Ce lac salé au fond d'un cratère doit sa couleur à des micro-organismes qui passionnent les chercheurs : le milieu ressemblerait à celui des océans primitifs. Le tour du cratère par la crête offre le lac d'un côté et l'océan de l'autre.",
    quand: "Lever du soleil : la couleur est la plus franche et il ne fait pas encore 35°.",
    duree: 2, budget: 0, maree: null, saison: [],
    tags: ["famille", "sansVoiture", "soir"],
    vedette: 2,
    conseils: [
      "On ne se baigne pas dans le Dziani, et il est demandé de ne pas s'approcher de l'eau. Lac salé et alcalin (pH 9 à 9,5), anoxique dès 1,5 m de profondeur, sédiments qui produisent du méthane, une fosse de 18 m, aucune surveillance et aucun accès rapide des secours.",
      "C'est un site sacré, où se déroulent des cérémonies traditionnelles. Restez sur le sentier de crête, ne descendez pas vers l'eau, ne photographiez pas une cérémonie sans autorisation.",
      "Pour se baigner en Petite-Terre : les plages de Moya et de Papani, à côté.",
      "Accessible à pied depuis Labattoir : faisable sans voiture en descendant de la barge.",
      "Tour complet de la crête : environ 1 h, en grande partie à découvert."
    ],
    presta: [], gps: [-12.7717, 45.2900],
    verifie: "2026-08-25", etat: "ouvert",
    sources: [
      { t: "Mayotte Tourisme — le lac Dziani", u: "https://www.mayotte-tourisme.com/explorez/naturellement-sauvage/les-incontournables/le-mystique-lac-dziani/" },
      { t: "Planet-Terre (ENS Lyon) — écosystème du Dziani Dzaha", u: "https://planet-terre.ens-lyon.fr/ressource/ecosysteme-Dziani-Dzaha.xml" }
    ]
  },
  {
    id: "saziley", nom: "Sentier de la pointe Saziley", cat: "nature", commune: "Bandrélé / Dapani", zone: "grande-terre",
    resume: "Le plus beau sentier côtier de l'île, entre plages désertes et forêt sèche.",
    texte: "Une succession de criques où les tortues vertes viennent pondre la nuit. Le sentier longe la côte sud-est. C'est aussi un des rares endroits où l'on croise des makis en liberté au petit matin.",
    quand: "Le matin. La ponte, elle, se passe de nuit.",
    duree: 5, budget: 0, maree: null, saison: [5,6,7,8,9,10],
    tags: ["sportif", "soir", "groupe"],
    vedette: 1,
    conseils: [
      "La nuit sur une plage de ponte : pas de lampe, pas de flash, pas d'écran de téléphone, vêtements sombres. Ne marchez pas sur le haut de plage, où sont enfouis les nids. La fréquentation nocturne est réglementée : n'y allez pas sans encadrement par une structure agréée, et renseignez-vous auprès de la Direction de l'environnement du Conseil départemental.",
      "Le braconnage est la première cause de mortalité des tortues à Mayotte : environ 350 animaux tués par an, soit au moins 10 % des femelles venues pondre. Signalez une carcasse ou un nid pillé plutôt que d'intervenir vous-même.",
      "Le site comporte des zones sacrées et des fady (interdits coutumiers), notamment autour du « cœur de ziara » marqué par deux baobabs. Ne vous écartez pas des sentiers et ne prélevez rien.",
      "Longue randonnée exposée : partir tôt, beaucoup d'eau, et ne pas partir seul.",
      "457 hectares protégés, une vingtaine de kilomètres de sentiers, une dizaine de plages de ponte."
    ],
    presta: ["guide-rando", "asso-nature"], gps: [-12.9800, 45.1900],
    verifie: "2026-08-25", etat: "a-confirmer",
    sources: [
      { t: "Conservatoire du littoral — pointes et plages de Saziley et Charifou", u: "https://www.conservatoire-du-littoral.fr/siteLittoral/564/28-pointes-et-plages-de-saziley-et-charifou-976_mayotte.htm" },
      { t: "Oulanga Na Nyamba — le braconnage à Mayotte", u: "https://oulangananyamba.com/le-braconnage-a-mayotte/" }
    ]
  },
  {
    id: "soulou", nom: "Cascade de Soulou", cat: "nature", commune: "Tsingoni", zone: "grande-terre",
    resume: "Une cascade qui tombe directement sur la plage, face au lagon.",
    texte: "Curiosité rare : le ruisseau saute la falaise et arrive sur le sable. En saison des pluies le débit est spectaculaire ; en saison sèche il ne reste parfois qu'un filet.",
    quand: "Après la saison des pluies (mars-mai) : du débit ET de la lumière.",
    duree: 2, budget: 0, maree: "basse", saison: [3,4,5,6],
    tags: ["famille", "ombre"],
    vedette: 1,
    conseils: [
      "Ne vous douchez pas sous la cascade et n'avalez pas cette eau. La leptospirose circule à Mayotte — 121 cas au 24 avril 2026, dont 4 réanimations — et s'attrape par contact avec l'eau douce souillée par l'urine de rongeurs. Jamais d'immersion si vous avez une plaie, même minime.",
      "À marée très haute, la chute tombe dans la mer et non sur la plage : consultez l'horaire de marée avant de venir.",
      "Site isolé : ne pas y aller seul et ne rien laisser dans la voiture."
    ],
    presta: [], gps: [-12.8000, 45.0700],
    verifie: "2026-08-25", etat: "a-confirmer",
    sources: [
      { t: "Santé publique France — bulletin Mayotte du 24/04/2026", u: "https://www.santepubliquefrance.fr/regions-et-territoires/ocean-indien" }
    ]
  },
  {
    id: "padza", nom: "Les padzas", cat: "nature", commune: "Dapani / Chiconi", zone: "grande-terre",
    resume: "Des « badlands » de terre rouge nue, paysage lunaire ocre.",
    texte: "Les padzas sont des zones où la latérite a été mise à nu par l'érosion. Le contraste entre l'ocre vif, le vert autour et le bleu du lagon en fait le décor le plus photogénique de l'île — surtout au coucher du soleil.",
    quand: "1 h avant le coucher du soleil : la lumière rasante fait flamber le rouge.",
    duree: 2, budget: 0, maree: null, saison: [],
    tags: ["famille", "soir"],
    vedette: 1,
    conseils: [
      "Chaussures qu'on accepte de salir : la latérite tache définitivement.",
      "Ne pas rouler sur les padzas, ça aggrave l'érosion."
    ],
    presta: [], gps: [-12.9400, 45.1600]
  },
  {
    id: "coconi-jardin", nom: "Jardin botanique de Coconi", cat: "nature", commune: "Ouangani", zone: "grande-terre",
    resume: "Toutes les plantes de l'île expliquées, à l'ombre, au calme.",
    texte: "Le jardin du lycée agricole rassemble les cultures qui font Mayotte : ylang-ylang, vanille, cannelle, poivre, arbres fruitiers. Parfait pour comprendre ce qu'on mange et ce qu'on sent partout sur l'île.",
    quand: "Toute l'année, aux horaires d'ouverture — à vérifier avant de monter, ils varient.",
    duree: 2, budget: 1, maree: null, saison: [],
    tags: ["famille", "ombre", "pluie", "pmr"],
    vedette: 1,
    conseils: ["Se combine avec le marché de Coconi le mercredi matin, juste à côté."],
    presta: [], gps: [-12.8300, 45.1400]
  },
  {
    id: "mangrove", nom: "Mangrove et vasières", cat: "nature", commune: "Chirongui / Tsingoni", zone: "grande-terre",
    resume: "La forêt qui pousse dans l'eau salée — en kayak ou à pied.",
    texte: "Les palétuviers filtrent l'eau, retiennent la terre et abritent crabes, hérons et alevins. À marée haute on y circule en kayak ; à marée basse on marche sur les passerelles et on observe les crabes violonistes.",
    quand: "Kayak à marée haute, observation à marée basse.",
    duree: 3, budget: 2, maree: "haute", saison: [],
    tags: ["famille", "ombre", "groupe"],
    vedette: 1,
    conseils: [
      "Manches longues : les moustiques de mangrove piquent aussi en journée, et le paludisme connaît une reprise de transmission locale.",
      "Environ 80 % des palétuviers ont été défoliés par Chido : la mangrove que vous verrez n'est pas celle des photos d'avant 2024."
    ],
    presta: ["kayak"], gps: [-12.9200, 45.1300]
  },
  {
    id: "makis", nom: "Voir les makis", cat: "famille", commune: "Coconi / Combani / Saziley", zone: "grande-terre",
    resume: "Le komba, lémurien de Mayotte, en liberté au petit matin.",
    texte: "Le maki brun — komba en shimaoré — vit partout où il reste des arbres fruitiers. On les voit facilement autour de Coconi, à Combani et sur la pointe Saziley, souvent en famille avec les petits accrochés au dos. Contrairement à ce qu'on lit souvent, ce n'est pas une espèce endémique : introduit de Madagascar, il est aujourd'hui naturalisé et figure même dans la base des espèces envahissantes d'outre-mer.",
    quand: "Tôt le matin ou en fin d'après-midi, quand ils descendent manger.",
    duree: 1, budget: 0, maree: null, saison: [],
    tags: ["famille", "ombre"],
    vedette: 1,
    conseils: [
      "Ne les nourrissez jamais. Le nourrissage les habitue à l'homme, les rend dépendants, les pousse à piller jardins et cultures, et crée des conflits avec les agriculteurs. Depuis Chido, ils ont perdu habitat et ressources : raison de plus pour ne pas interférer.",
      "Ne pas capturer, détenir ni perturber : l'espèce est protégée.",
      "Pas de photo de près, pas de selfie. Gardez vos sacs fermés, ils sont très habiles."
    ],
    presta: [], gps: [-12.8300, 45.1400],
    verifie: "2026-08-25", etat: "ouvert",
    sources: [
      { t: "Espèces envahissantes outre-mer — Eulemur fulvus", u: "https://especes-envahissantes-outremer.fr/especes_envahissante/eulemur-fulvus/" },
      { t: "INPN — fiche espèce", u: "https://inpn.mnhn.fr/espece/cd_nom/418673" }
    ]
  },

  /* ---------------------- PLAGES & ÎLOTS ---------------------- */
  {
    id: "ngouja", nom: "Plage de N'Gouja", cat: "plage", commune: "Kani-Kéli", zone: "grande-terre",
    resume: "Nager avec les tortues vertes à quelques mètres du bord.",
    texte: "LA plage carte postale de Mayotte : cocotiers penchés, sable clair et surtout un herbier où les tortues vertes broutent toute la journée. On les voit avec un simple masque, sans bateau, sans palmes.",
    quand: "À marée montante ou haute : les tortues remontent avec l'eau et l'herbier devient accessible.",
    duree: 4, budget: 1, maree: "haute", saison: [],
    tags: ["famille", "ombre"],
    vedette: 2,
    conseils: [
      "3 mètres minimum à la nage, et jamais entre la tortue et la surface : elle doit pouvoir remonter respirer. Ne nagez pas au-dessus d'une tortue qui broute, ne la suivez pas, ne l'encerclez pas — restez en retrait et laissez venir.",
      "Ne pas toucher, ne pas piétiner les herbiers. Les tortues marines sont des espèces protégées à Mayotte : les toucher, les capturer ou les perturber est interdit.",
      "Pour un couple en accouplement : 50 mètres en bateau, et approche sous-marine interdite.",
      "Chaussures de récif, et un lycra plutôt que de la crème : on reste une heure dans l'eau sans s'en rendre compte, le dos brûle.",
      "Accès et conditions à confirmer par téléphone avant de faire la route : l'état d'ouverture du site après Chido n'a pas pu être vérifié."
    ],
    presta: ["hotel-ngouja"], gps: [-12.9700, 45.0900],
    verifie: "2026-08-25", etat: "a-confirmer",
    sources: [
      { t: "Parc naturel marin — quand j'observe", u: "https://parc-marin-mayotte.fr/editorial/quand-jobserve" },
      { t: "Oulanga Na Nyamba — comment les observer", u: "https://oulangananyamba.com/les-tortues/comment-les-observer/" }
    ]
  },
  {
    id: "moya", nom: "Plages de Moya", cat: "plage", commune: "Dzaoudzi-Labattoir", zone: "petite-terre",
    resume: "Deux criques encaissées dans un ancien cratère, côté océan.",
    texte: "Moya 1 et Moya 2, séparées par un promontoire. Sable clair, eau limpide, et un tombant à quelques brasses du bord qui en fait un des meilleurs spots de palmes-masque-tuba accessibles à pied.",
    quand: "Le matin. L'après-midi, la houle peut lever.",
    duree: 4, budget: 0, maree: null, saison: [],
    tags: ["famille", "sansVoiture"],
    vedette: 2,
    conseils: [
      "Attention au courant qui sort de la baie quand la mer est formée.",
      "Escalier raide pour descendre : compliqué avec une poussette."
    ],
    presta: [], gps: [-12.7833, 45.2933]
  },
  {
    id: "sakouli", nom: "Plage de Sakouli", cat: "plage", commune: "Bandrélé", zone: "grande-terre",
    resume: "Grande plage familiale, ombragée, avec un platier à explorer.",
    texte: "Une des plages les plus fréquentées le week-end par les familles mahoraises. Sable, filaos pour l'ombre, et à marée basse un immense platier corallien où l'on trouve oursins, poulpes et bénitiers.",
    quand: "Week-end pour l'ambiance, semaine pour le calme.",
    duree: 4, budget: 0, maree: "basse", saison: [],
    tags: ["famille", "ombre", "pmr", "groupe"],
    vedette: 2,
    conseils: [
      "Chaussures d'eau indispensables sur le platier : oursins et corail mort coupent.",
      "Le dimanche après-midi, c'est le rendez-vous familial : ambiance garantie, calme non."
    ],
    presta: [], gps: [-12.9083, 45.1667]
  },
  {
    id: "trevani", nom: "Plage de Trévani", cat: "plage", commune: "Koungou", zone: "grande-terre",
    resume: "La plage la plus proche de Mamoudzou, sable et cocotiers.",
    texte: "Au nord de Mamoudzou, une longue plage facile d'accès qui dépanne pour une fin de journée sans faire une heure de route.",
    quand: "Fin d'après-midi en semaine.",
    duree: 2, budget: 0, maree: null, saison: [],
    tags: ["famille", "ombre", "pmr"],
    conseils: ["Se renseigner sur l'ambiance du secteur avant d'y aller en soirée."],
    presta: [], gps: [-12.7400, 45.2000]
  },
  {
    id: "badamiers", nom: "Baie des Badamiers", cat: "plage", commune: "Dzaoudzi-Labattoir", zone: "petite-terre",
    resume: "La baie plate des sports de glisse : kite, wing, paddle.",
    texte: "Une immense baie peu profonde protégée par la digue. Quand l'alizé rentre, c'est le spot de kitesurf et de wingfoil de l'île, avec un plan d'eau lisse et sans danger.",
    quand: "Saison des alizés (mai à octobre), l'après-midi quand le vent monte.",
    duree: 3, budget: 2, maree: "haute", saison: [5,6,7,8,9,10],
    tags: ["sportif", "sansVoiture", "groupe"],
    vedette: 1,
    conseils: [
      "À marée basse la baie se vide : plus assez d'eau pour naviguer.",
      "Accessible à pied depuis la barge : l'activité idéale sans voiture."
    ],
    presta: ["kite"], gps: [-12.7850, 45.2750]
  },
  {
    id: "papani", nom: "Plage de Papani", cat: "plage", commune: "Dzaoudzi-Labattoir", zone: "petite-terre",
    resume: "Petite crique tranquille, à côté de Moya.",
    texte: "Moins connue que sa voisine, souvent presque vide en semaine. Bon plan pour une baignade rapide entre deux barges.",
    quand: "Toute la journée, ombre limitée.",
    duree: 2, budget: 0, maree: null, saison: [],
    tags: ["sansVoiture"],
    conseils: ["Pas de commerce à proximité : venir avec son eau."],
    presta: [], gps: [-12.7780, 45.2950]
  },
  {
    id: "ilot-sable", nom: "Îlot de sable blanc", cat: "plage", commune: "Bandrélé / Bouéni", zone: "lagon",
    resume: "Un banc de sable pur qui sort de l'eau à marée basse, en plein lagon.",
    texte: "L'image que tout le monde ramène de Mayotte : un croissant de sable blanc au milieu du bleu, sans un arbre, sans rien. Il apparaît à marée descendante et disparaît complètement à marée haute. Autour, du snorkeling parmi les meilleurs du lagon.",
    quand: "IMPÉRATIF : autour de la marée basse. Le prestataire cale la sortie sur l'horaire des marées, pas sur le vôtre.",
    duree: 5, budget: 3, maree: "basse", saison: [],
    tags: ["famille", "groupe"],
    vedette: 2,
    conseils: [
      "Zéro ombre sur l'îlot : chapeau, lycra, crème — et de l'eau en quantité.",
      "Crème solaire minérale (sans oxybenzone) : on est au-dessus du corail.",
      "Ne rien laisser sur l'îlot, même une épluchure : à marée haute tout part au lagon.",
      "Réserver plusieurs jours à l'avance : les créneaux compatibles avec la marée sont rares.",
      "De décembre à mai, aucun débarquement sur les îlots de reproduction des oiseaux marins — c'est justement la période où l'on cherche un îlot pour pique-niquer."
    ],
    presta: ["bateau-sud", "bateau-nord"], gps: [-12.9300, 45.1400]
  },
  {
    id: "ilot-bouzi", nom: "Îlot Bouzi", cat: "plage", commune: "Mamoudzou", zone: "lagon",
    resume: "L'îlot boisé juste en face de Mamoudzou, quinze minutes de bateau.",
    texte: "Le plus accessible des îlots : on le voit depuis le front de mer de Mamoudzou. Petite plage, sentier, makis, et un tombant sympa côté large.",
    quand: "Toute l'année. Idéal pour une demi-journée quand on n'a pas le temps d'aller loin.",
    duree: 4, budget: 2, maree: null, saison: [],
    tags: ["famille", "groupe"],
    vedette: 1,
    conseils: ["Les makis de l'îlot volent la nourriture : sacs fermés."],
    presta: ["bateau-mamoudzou"], gps: [-12.8000, 45.2500]
  },
  {
    id: "mtsamboro", nom: "Îlot Mtsamboro & les Choizil", cat: "plage", commune: "Mtsamboro", zone: "lagon",
    resume: "Le nord sauvage : îlots, falaises et eau translucide.",
    texte: "L'archipel du nord, avec l'îlot Mtsamboro et les Choizil. Plages désertes, fonds spectaculaires, très peu de monde en semaine.",
    quand: "Saison sèche, mer calme.",
    duree: 6, budget: 3, maree: null, saison: [5,6,7,8,9,10],
    tags: ["groupe"],
    vedette: 1,
    conseils: ["Journée complète : partir tôt du nord pour ne pas rentrer de nuit."],
    presta: ["bateau-nord"], gps: [-12.6600, 45.0700]
  },

  /* ---------------------- LAGON & SORTIES MER ---------------------- */
  {
    id: "baleines", nom: "Observation des baleines à bosse", cat: "mer", commune: "Tout le lagon", zone: "lagon",
    resume: "Les baleines viennent mettre bas dans le lagon de juillet à octobre.",
    texte: "Chaque hiver austral, les baleines à bosse remontent du canal du Mozambique pour mettre bas et allaiter dans les eaux chaudes du lagon. On voit les souffles, les sauts, et souvent une mère avec son baleineau. C'est l'événement naturel majeur de l'année à Mayotte.",
    quand: "De juillet à octobre, avec un pic entre fin août et début septembre ; des arrivées sont possibles dès juin. Le matin, quand la mer est encore lisse.",
    duree: 4, budget: 3, maree: null, saison: [7,8,9,10],
    tags: ["famille", "groupe"],
    vedette: 2,
    conseils: [
      "Interdiction légale : on n'approche pas un cétacé à moins de 100 mètres, et dans cette zone la mise à l'eau est proscrite — on reste à bord. La règle vaut partout dans les eaux de Mayotte, couvertes en totalité par le Parc naturel marin.",
      "Il n'existe pas de « nage avec les baleines » banalisée à Mayotte : au-delà des 100 m, le Parc déconseille formellement la mise à l'eau. Une étude qu'il cite mesure 63 % d'évitement des baleines quand il y a mise à l'eau, contre 8 % sans. Un opérateur qui vous promet de nager avec, c'est le signal qu'il ne faut pas monter à bord.",
      "Ne demandez pas au pilote de couper le moteur : dans la zone des 300 m, la consigne est au contraire de le maintenir en marche, à 5 nœuds, en route parallèle — un bateau silencieux devient imprévisible pour l'animal.",
      "Elles ne se nourrissent pas pendant leur séjour et vivent sur leurs réserves : le dérangement leur coûte cher. 60 % des groupes rencontrés ici sont une mère et son baleineau, contre 20 % au niveau mondial.",
      "Aucun opérateur sérieux ne garantit de voir des baleines. Mal de mer : traitement 1 h AVANT d'embarquer, pas quand ça tangue.",
      "Vos photos servent : l'application TsiÔno du Parc permet d'identifier les individus d'une année sur l'autre. Animal échoué ou blessé : réseau REMMAT au 06 39 69 41 41 (signalement, pas secours)."
    ],
    presta: ["bateau-sud", "bateau-nord", "bateau-mamoudzou"], gps: [-12.9000, 45.0500],
    verifie: "2026-08-25", etat: "ouvert",
    sources: [
      { t: "Parc naturel marin — quand j'observe", u: "https://parc-marin-mayotte.fr/editorial/quand-jobserve" },
      { t: "Arrêté du 1er juillet 2011 modifié (mammifères marins protégés)", u: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000024396902" }
    ]
  },
  {
    id: "dauphins", nom: "Dauphins du lagon", cat: "mer", commune: "Passes et baies du sud", zone: "lagon",
    resume: "Grands dauphins et dauphins à long bec, visibles toute l'année.",
    texte: "Plusieurs espèces fréquentent les passes. Les dauphins à long bec se reposent en groupes serrés le matin dans les baies : c'est le moment où on les approche le plus facilement — et celui où il ne faut surtout pas les déranger.",
    quand: "Toute l'année, tôt le matin.",
    duree: 4, budget: 3, maree: null, saison: [],
    tags: ["famille", "groupe"],
    vedette: 1,
    conseils: [
      "Les dauphins sont des cétacés : la règle des 100 mètres leur est applicable, toute l'année. Méfiez-vous de toute offre commerciale vendant « la nage avec les dauphins ».",
      "Le dauphin à long bec se repose et socialise en journée le long de la barrière, et chasse la nuit : un groupe croisé en journée près de la barrière est très probablement en phase de repos.",
      "Bon opérateur : deux navires au maximum dans la zone des 300 m, 5 nœuds, moteur maintenu en marche, approche par le côté en route parallèle — jamais par l'avant ni par l'arrière."
    ],
    presta: ["bateau-sud"], gps: [-12.9200, 45.0600],
    verifie: "2026-08-25", etat: "ouvert",
    sources: [{ t: "Parc naturel marin — les dauphins", u: "https://parc-marin-mayotte.fr/editorial/les-dauphins" }]
  },
  {
    id: "passe-en-s", nom: "Plongée à la Passe en S", cat: "mer", commune: "Nord du lagon", zone: "lagon",
    resume: "Un des sites de plongée les plus réputés de l'océan Indien.",
    texte: "Une passe en forme de S dans la barrière de corail, balayée par les courants qui apportent la vie : tortues, raies, requins de récif, bancs de carangues, et une couverture corallienne remarquable. Plusieurs spots de niveaux différents, du baptême à la plongée dérivante.",
    quand: "Toute l'année ; visibilité souvent meilleure en saison sèche.",
    duree: 5, budget: 3, maree: null, saison: [],
    tags: ["sportif", "groupe"],
    vedette: 2,
    conseils: [
      "Son nom shimaoré est Longogori. Comme toutes les passes, elle canalise des courants de marée puissants : c'est ce qui fait sa richesse, et c'est ce qui interdit d'y nager sans encadrement.",
      "Le niveau requis dépend du courant du jour : c'est le club qui décide, pas vous.",
      "Certificat médical et carnet de plongée à emporter depuis la métropole.",
      "Pas d'avion dans les 24 h après une plongée — attention au jour du retour."
    ],
    presta: ["club-plongee"], gps: [-12.6500, 45.0600],
    verifie: "2026-08-25", etat: "a-confirmer",
    sources: [{ t: "Mayotte Tourisme", u: "https://www.mayotte-tourisme.com" }]
  },
  {
    id: "snorkeling", nom: "Palmes-masque-tuba sur le platier", cat: "mer", commune: "Toute l'île", zone: "lagon",
    resume: "Le lagon se visite gratuitement, depuis le bord.",
    texte: "Pas besoin de bateau : à N'Gouja, Saziley, Moya ou Sakouli, le récif commence à quelques mètres de la plage. Poissons-clowns, poissons-perroquets, murènes, bénitiers géants et tortues.",
    quand: "Marée haute ou montante, mer calme, milieu de matinée pour la lumière.",
    duree: 2, budget: 0, maree: "haute", saison: [],
    tags: ["famille"],
    vedette: 2,
    conseils: [
      "Ne posez jamais le pied, la main ni l'ancre sur du corail vivant : après le blanchissement et Chido, la mortalité corallienne cumulée atteint 66 % et les colonies survivantes sont précieuses.",
      "Un lycra anti-UV vaut mieux que toute la crème du monde. Si vous mettez de la crème, qu'elle soit minérale : les filtres chimiques nuisent à la photosynthèse du corail, et la mention commerciale « reef-safe » ne correspond à aucun label officiel.",
      "Chaussures de récif : les coupures sur le corail s'infectent vite sous les tropiques.",
      "Toujours à deux, jamais seul, et surveillez la marée descendante qui crée du courant vers les passes. Ne nagez pas dans les passes ni dans les chenaux.",
      "Ne touchez rien, ne retournez pas les pierres, ne ramassez pas de coquillage vivant : poisson-pierre, poisson-scorpion, raies à dard et cônes sont venimeux. En cas de piqûre, appelez le 15."
    ],
    presta: [], gps: [-12.9700, 45.0900],
    verifie: "2026-08-25", etat: "ouvert",
    sources: [{ t: "Parc naturel marin de Mayotte", u: "https://parc-marin-mayotte.fr" }]
  },
  {
    id: "kayak", nom: "Kayak & paddle dans le lagon", cat: "mer", commune: "Bouéni / Chirongui / Petite-Terre", zone: "lagon",
    resume: "Silencieux, à ras de l'eau, dans la mangrove ou vers les îlots.",
    texte: "Le meilleur moyen d'approcher la mangrove et les oiseaux sans les faire fuir. Certains prestataires proposent des sorties au lever du soleil ou à la pleine lune.",
    quand: "Marée haute pour la mangrove, tôt le matin pour le plan d'eau lisse.",
    duree: 3, budget: 2, maree: "haute", saison: [],
    tags: ["famille", "sportif", "groupe"],
    vedette: 1,
    conseils: ["Sac étanche pour le téléphone, et une lanière : le fond du lagon est plein de téléphones."],
    presta: ["kayak"], gps: [-12.9100, 45.1200]
  },
  {
    id: "peche", nom: "Sortie pêche au gros", cat: "mer", commune: "Départ Mamoudzou / Bouéni", zone: "lagon",
    resume: "Thon, wahoo, marlin : le canal du Mozambique est poissonneux.",
    texte: "Sorties à la traîne au-delà de la barrière, ou pêche au jig sur les tombants. Certains prestataires font cuisiner la prise au retour.",
    quand: "Toute l'année, mer plus maniable en saison sèche.",
    duree: 6, budget: 3, maree: null, saison: [],
    tags: ["sportif", "groupe"],
    conseils: [
      "Demandez AVANT qui garde le poisson : ça se négocie bien avant, et très mal après.",
      "La pêche au poulpe est fermée chaque année, en principe du 1er avril au 15 juin, par arrêté préfectoral — professionnels comme particuliers, capture, achat, vente et détention comprises. Vérifiez l'arrêté en vigueur avant la saison."
    ],
    presta: ["peche"], gps: [-12.8000, 45.2400],
    verifie: "2026-08-25", etat: "ouvert",
    sources: [{ t: "Parc naturel marin — fermeture de la pêche au poulpe", u: "https://parc-marin-mayotte.fr/actualites/du-1er-avril-au-15-juin-un-moment-cle-pour-les-poulpes-mayotte" }]
  },
  {
    id: "tour-ile", nom: "Le tour de l'île en bateau", cat: "mer", commune: "Lagon", zone: "lagon",
    resume: "Deux jours pour faire le tour de Mayotte par la mer.",
    texte: "Format plus rare, souvent en petit groupe : on longe la côte, on dort dans un village ou sur un îlot, on traverse les passes. La vision la plus complète de l'île.",
    quand: "Saison sèche uniquement.",
    duree: 24, budget: 3, maree: null, saison: [6,7,8,9,10],
    tags: ["sportif", "groupe"],
    conseils: ["Se cale des semaines à l'avance et dépend fortement de la météo."],
    presta: ["bateau-nord"], gps: [-12.8000, 45.1000]
  },
  {
    id: "kite", nom: "Kitesurf & wingfoil", cat: "mer", commune: "Badamiers", zone: "petite-terre",
    resume: "Plan d'eau plat et alizé régulier de mai à octobre.",
    texte: "La baie des Badamiers est un lagon fermé, peu profond, sans vague : conditions idéales pour apprendre. Écoles sur place avec matériel.",
    quand: "Mai à octobre, l'après-midi.",
    duree: 3, budget: 3, maree: "haute", saison: [5,6,7,8,9,10],
    tags: ["sportif", "sansVoiture"],
    conseils: ["Vérifier la marée : sans eau, pas de session."],
    presta: ["kite"], gps: [-12.7850, 45.2750]
  },

  /* ---------------------- CULTURE & PATRIMOINE ---------------------- */
  {
    id: "muma", nom: "Musée de Mayotte (MuMA)", cat: "culture", commune: "Dzaoudzi", zone: "petite-terre",
    resume: "Histoire, peuplement et culture de l'île, en une heure.",
    texte: "Le musée raconte le peuplement de l'archipel, les sultanats, l'arrivée de l'islam, la colonisation, le choix de rester français. À faire EN DÉBUT de séjour : tout le reste devient plus lisible ensuite.",
    quand: "Vérifier les horaires avant de traverser en barge.",
    duree: 2, budget: 1, maree: null, saison: [],
    tags: ["famille", "sansVoiture", "pluie", "ombre", "pmr"],
    vedette: 2,
    conseils: ["À combiner avec le rocher de Dzaoudzi et Moya dans la même journée en Petite-Terre."],
    presta: [], gps: [-12.7869, 45.2589]
  },
  {
    id: "tsingoni", nom: "Mosquée de Tsingoni", cat: "culture", commune: "Tsingoni", zone: "grande-terre",
    resume: "La plus ancienne mosquée encore en activité de France (XVIe siècle).",
    texte: "Fondée en 1538 selon l'inscription de son mihrab, c'est un monument historique et un lieu de culte toujours actif, au cœur de l'ancienne capitale du sultanat.",
    quand: "En dehors des heures de prière, et jamais le vendredi midi.",
    duree: 1, budget: 0, maree: null, saison: [],
    tags: ["sansVoiture", "pluie", "ombre", "pmr"],
    vedette: 1,
    conseils: [
      "C'est un lieu de culte avant d'être un site touristique : demander avant d'entrer ou de photographier.",
      "Tenue couvrante (épaules et genoux) pour tout le monde, foulard pour les femmes."
    ],
    presta: [], gps: [-12.7900, 45.1000]
  },
  {
    id: "marche-mamoudzou", nom: "Marché couvert de Mamoudzou", cat: "culture", commune: "Mamoudzou", zone: "grande-terre",
    resume: "Fruits, épices, poissons, et le vrai bain de foule mahorais.",
    texte: "Le cœur commerçant de l'île : mangues, fruits à pain, ambrevades, curcuma frais, brèdes, poissons du matin. C'est là qu'on apprend le nom des choses et qu'on goûte avant d'acheter.",
    quand: "Le matin, avant 10 h — après, il fait chaud et les meilleurs produits sont partis.",
    duree: 2, budget: 1, maree: null, saison: [],
    tags: ["sansVoiture", "pluie", "ombre", "pmr", "famille"],
    vedette: 2,
    sansLieu: true,
    conseils: [
      "Espèces, petites coupures. Peu de terminaux de carte.",
      "Sac devant soi, téléphone rangé — marché dense, pas plus risqué qu'ailleurs mais peu indulgent.",
      "Un bonjour en shimaoré (« Jéjé ? ») change complètement l'accueil."
    ],
    presta: [], gps: [-12.7806, 45.2278]
  },
  {
    id: "marche-coconi", nom: "Marché paysan de Coconi", cat: "culture", commune: "Ouangani", zone: "grande-terre",
    resume: "Le marché des producteurs, le mercredi matin.",
    texte: "Plus petit et plus agricole que celui de Mamoudzou : légumes du centre de l'île, plants, miel, confitures, vanille. Ambiance nettement plus calme.",
    quand: "Mercredi matin.",
    duree: 2, budget: 1, maree: null, saison: [],
    tags: ["famille", "pluie", "ombre"],
    vedette: 1,
    conseils: ["Se combine parfaitement avec le jardin botanique juste à côté."],
    presta: [], gps: [-12.8300, 45.1400]
  },
  {
    id: "ylang", nom: "Distillerie d'ylang-ylang", cat: "culture", commune: "Combani / Ouangani / Bandrélé", zone: "grande-terre",
    resume: "L'odeur emblématique de Mayotte, de la fleur à l'essence.",
    texte: "Visite d'une plantation et d'un alambic : cueillette au petit matin, distillation à la vapeur, séparation des qualités (extra, première, deuxième…). Les parfums des grandes maisons partent d'ici.",
    quand: "Le matin, pendant la distillation. La cueillette se fait à l'aube.",
    duree: 2, budget: 1, maree: null, saison: [],
    tags: ["famille", "ombre", "pluie", "groupe"],
    vedette: 1,
    conseils: [
      "Prévenir à l'avance : la distillation ne tourne pas tous les jours.",
      "Acheter l'huile essentielle sur place plutôt qu'à l'aéroport : moins cher et traçable."
    ],
    presta: ["ylang"], gps: [-12.7833, 45.1333]
  },
  {
    id: "potieres", nom: "Les potières de Bandrélé", cat: "culture", commune: "Bandrélé", zone: "grande-terre",
    resume: "Une poterie façonnée sans tour, cuite à ciel ouvert, transmise entre femmes.",
    texte: "Un savoir-faire ancien encore vivant : l'argile est travaillée à la main, les pots séchés au soleil puis cuits dans un feu de bois. Démonstration et vente au village.",
    quand: "Sur rendez-vous, via l'association du village.",
    duree: 2, budget: 1, maree: null, saison: [],
    tags: ["famille", "ombre", "pluie", "groupe", "pmr"],
    vedette: 1,
    conseils: ["Demander avant de filmer les femmes au travail — la réponse est souvent oui, mais on demande."],
    presta: ["potieres"], gps: [-12.9000, 45.1900]
  },
  /* Le mourengué est le seul spectacle de l'île qui ne soit pas un spectacle.
     Il n'est pas programmé, il n'est pas encadré, il est contesté, et
     plusieurs communes l'ont interdit après des débordements. Une fiche qui
     l'annoncerait comme une attraction serait fausse deux fois : sur ce que
     c'est, et sur la possibilité d'en voir. Elle dit donc les deux. */
  {
    id: "mourengue",
    nom: "Le mourengué, les soirs de ramadan",
    cat: "culture",
    commune: "Places de village",
    zone: "grande-terre",
    resume: "Le combat traditionnel mahorais, sur la place, après la rupture du jeûne.",
    texte: "Deux adversaires, un cercle de spectateurs, des tambours, et des coups portés " +
           "pieds et poings nus. Le mourengué — moringue ailleurs dans l'océan Indien — se " +
           "danse autant qu'il se bat : l'esquive et le rythme comptent plus que la force. " +
           "Il se pratique surtout pendant les nuits du ramadan, quand les places de village " +
           "se remplissent après la rupture du jeûne, et les femmes y combattent aussi. " +
           "C'est une pratique vivante et disputée : plusieurs communes l'ont interdite après " +
           "des débordements, et le débat sur son encadrement n'est pas clos.",
    quand: "Les soirs du ramadan, après le coucher du soleil. Rien n'est programmé.",
    duree: 2,
    budget: 0,
    maree: null,
    saison: [],
    tags: ["soir", "groupe", "sansVoiture"],
    vedette: 1,
    conseils: [
      "Ça ne s'annonce pas et ça ne se réserve pas : ça se sait dans le village le jour même. Demandez sur place, poliment, plutôt que de chercher un horaire.",
      "On regarde, on ne filme pas sans demander, et on ne se met pas au premier rang du cercle : la place est aux gens du village.",
      "Plusieurs communes l'ont interdit. Si les gendarmes sont là, la soirée s'arrête — n'insistez pas.",
      "Pendant le ramadan, ne mangez pas et ne buvez pas en public la journée. Ce n'est pas la loi, c'est la moindre des politesses."
    ],
    presta: [],
    gps: [-12.7806, 45.2278],
    sansLieu: true,
    sources: [
      { t: "France 24, Les Observateurs — le moringué féminin pendant le ramadan à Mayotte",
        u: "https://observers.france24.com/fr/20170609-france-mayotte-moringue-sport-combat-femmes-battent-foule-ramadan-tradition" },
      { t: "Mayotte Hebdo — « Le moringué, un art martial de plus en plus décrié »",
        u: "https://www.mayottehebdo.com/actualite/sport/le-moringue-un-art-martial-de-plus-en-plus-decrie/" }
    ]
  },
  {
    id: "debaa", nom: "Debaa, mbiwi et wadaha", cat: "culture", commune: "Villages", zone: "grande-terre",
    resume: "Les danses chantées mahoraises — le vrai spectacle de l'île.",
    texte: "Le debaa est un chant soufi dansé par les femmes, en tenue brodée, avec un balancement des bras et des mains d'une précision folle. Le mbiwi se danse avec deux baguettes de bambou frappées ; le wadaha est la danse du pilon. Ça se pratique lors des mariages, des fêtes de village et des grandes occasions.",
    quand: "Souvent le week-end, très fréquent en saison des mariages (juillet-septembre).",
    duree: 3, budget: 0, maree: null, saison: [7,8,9],
    tags: ["famille", "soir", "groupe"],
    vedette: 2,
    conseils: [
      "Ce ne sont pas des spectacles pour touristes : on assiste à une fête, on y est invité. Se renseigner auprès d'une association ou de la mairie.",
      "Tenue correcte, et on demande avant de filmer."
    ],
    presta: ["asso-culture"], gps: [-12.8000, 45.1500]
  },
  {
    id: "manzaraka", nom: "Assister à un manzaraka (grand mariage)", cat: "culture", commune: "Villages", zone: "grande-terre",
    resume: "Le mariage traditionnel mahorais : cortège, or, musique, tout le village.",
    texte: "Le manzaraka est le cortège qui accompagne le marié chez la mariée, au son des chants et des tambours, dans une débauche de couleurs et de bijoux. C'est l'événement social majeur de la vie mahoraise, et la saison sèche en est remplie.",
    quand: "Saison sèche, surtout de juillet à septembre, le samedi.",
    duree: 4, budget: 0, maree: null, saison: [7,8,9],
    tags: ["famille", "soir", "groupe"],
    vedette: 1,
    conseils: [
      "On n'y va pas sans être invité — mais l'invitation vient vite si on connaît quelqu'un du village.",
      "Prévoir une tenue habillée : les Mahorais se mettent sur leur trente-et-un."
    ],
    presta: [], gps: [-12.8000, 45.1500]
  },
  {
    id: "rocher", nom: "Rocher de Dzaoudzi & boulevard des Crabes", cat: "culture", commune: "Dzaoudzi", zone: "petite-terre",
    resume: "L'ancien poste colonial, la digue, la vue sur Mamoudzou.",
    texte: "Le Rocher, relié à Petite-Terre par le boulevard des Crabes, garde l'architecture de l'ancienne capitale. Balade tranquille avec le lagon des deux côtés, à faire au coucher du soleil.",
    quand: "Fin d'après-midi.",
    duree: 2, budget: 0, maree: null, saison: [],
    tags: ["famille", "sansVoiture", "soir", "pmr"],
    vedette: 1,
    conseils: ["Se fait à pied depuis la barge, aucune voiture nécessaire."],
    presta: [], gps: [-12.7869, 45.2589]
  },

  /* ---------------------- MANGER MAHORAIS ---------------------- */
  {
    id: "voule", nom: "Le voulé du samedi soir", cat: "food", commune: "Plages", zone: "grande-terre",
    resume: "Le barbecue de plage : poisson grillé, feu de bois, musique.",
    texte: "L'institution du week-end mahorais. On s'installe sur la plage en fin d'après-midi, on grille du poisson ou de la viande, on mange des bananes et du manioc braisés, et ça dure jusque tard. Certains restaurants de plage organisent des voulés ouverts à tous.",
    quand: "Samedi en fin d'après-midi.",
    duree: 4, budget: 2, maree: null, saison: [],
    tags: ["famille", "soir", "groupe"],
    vedette: 2,
    conseils: [
      "Se prévient dans la journée pour que le poisson soit acheté.",
      "Prévoir une lampe : il n'y a aucun éclairage sur les plages, et le crépuscule est court sous ces latitudes — l'appli vous donne l'heure exacte du coucher et ce qu'il reste de jour."
    ],
    presta: ["resto-plage"], gps: [-12.9083, 45.1667]
  },
  {
    id: "mataba", nom: "Goûter le mataba et le poulet coco", cat: "food", commune: "Toute l'île", zone: "grande-terre",
    resume: "Les deux plats qu'il faut avoir mangés avant de repartir.",
    texte: "Le mataba, ce sont des feuilles de manioc pilées longuement, cuisinées au lait de coco, souvent avec du poisson salé ou de la viande. Le poulet au coco, plus doux, se sert avec du riz et des achards. On mange ça dans les gargotes de bord de route pour quelques euros.",
    quand: "Le midi, dans les gargotes ouvertes en semaine.",
    duree: 1, budget: 1, maree: null, saison: [],
    tags: ["famille", "pluie", "ombre", "pmr"],
    vedette: 2,
    sansLieu: true,
    conseils: [
      "Espèces obligatoires dans la plupart des gargotes.",
      "Pendant le Ramadan, presque tout est fermé la journée et ouvre après la rupture du jeûne : anticiper."
    ],
    presta: ["gargote"], gps: [-12.7806, 45.2278]
  },
  {
    id: "brochetti", nom: "Les brochetti du bord de route", cat: "food", commune: "Mamoudzou et villages", zone: "grande-terre",
    resume: "Brochettes grillées au charbon, le soir, au coin de la rue.",
    texte: "Le street food mahorais : brochettes de zébu ou de poulet, servies avec du piment et du pain. Un ou deux euros, cuit devant vous.",
    quand: "En soirée, à partir de 18 h.",
    duree: 1, budget: 1, maree: null, saison: [],
    tags: ["sansVoiture", "soir", "pmr"],
    vedette: 1,
    sansLieu: true,
    conseils: ["Choisir un stand où ça tourne : le turnover, c'est la fraîcheur."],
    presta: [], gps: [-12.7806, 45.2278]
  },
  {
    id: "mkatra", nom: "Mkatra foutra & thé au gingembre", cat: "food", commune: "Toute l'île", zone: "grande-terre",
    resume: "Le petit-déjeuner mahorais : galette moelleuse et thé épicé.",
    texte: "Le mkatra foutra est une galette de farine légèrement sucrée, cuite à la poêle, moelleuse à l'intérieur. Avec un thé au gingembre bien fort, c'est le petit-déjeuner local.",
    quand: "Le matin, dans les boutiques de village.",
    duree: 1, budget: 1, maree: null, saison: [],
    tags: ["famille", "pluie", "ombre", "pmr", "sansVoiture"],
    vedette: 1,
    sansLieu: true,
    conseils: ["Se trouve aussi lors des fêtes et des mariages, en version maison nettement meilleure."],
    presta: [], gps: [-12.7806, 45.2278]
  },
  {
    id: "atelier-cuisine", nom: "Atelier de cuisine mahoraise", cat: "food", commune: "Sur demande", zone: "grande-terre",
    resume: "Apprendre à piler le mataba et à monter un curry coco.",
    texte: "Des associations et des particuliers proposent des ateliers chez eux : marché le matin, cuisine ensuite, repas partagé. La meilleure porte d'entrée dans la vie quotidienne de l'île.",
    quand: "Sur réservation, souvent le week-end.",
    duree: 4, budget: 2, maree: null, saison: [],
    tags: ["famille", "pluie", "ombre", "groupe", "pmr"],
    vedette: 1,
    sansLieu: true,
    conseils: ["Prévenir des allergies et des interdits alimentaires au moment de réserver."],
    presta: ["atelier-cuisine"], gps: [-12.7806, 45.2278]
  },

  /* ---------------------- PRATIQUE ---------------------- */
  {
    id: "barge", nom: "La barge Mamoudzou ↔ Dzaoudzi", cat: "pratique", commune: "Mamoudzou / Dzaoudzi", zone: "grande-terre",
    resume: "Le trajet quotidien de l'île — et une mini-croisière pour presque rien.",
    texte: "La barge relie Grande-Terre et Petite-Terre en une vingtaine de minutes. Piétons et véhicules. C'est le meilleur point de vue sur Mamoudzou et le lagon, et un condensé de la vie mahoraise.",
    quand: "Rotations fréquentes en journée, plus espacées le soir et le week-end. Vérifier les horaires du jour.",
    duree: 1, budget: 1, maree: null, saison: [],
    tags: ["famille", "sansVoiture", "pluie", "pmr"],
    vedette: 1,
    sansLieu: true,
    conseils: [
      "Aux heures de pointe (7 h et 16 h), c'est bondé : décaler d'une heure.",
      "En voiture, la file d'attente peut être très longue : partir large avant un avion."
    ],
    presta: [], gps: [-12.7806, 45.2278]
  },
  {
    id: "louer-voiture", nom: "Louer une voiture", cat: "pratique", commune: "Mamoudzou / aéroport", zone: "grande-terre",
    resume: "Quasi indispensable pour sortir de Mamoudzou — et à réserver très tôt.",
    texte: "Le parc de location est petit et souvent saturé. Sans voiture, on reste dépendant des taxis collectifs, qui desservent bien les villages mais aux horaires de la vie locale, pas de ceux des visiteurs.",
    quand: "Réserver dès les billets d'avion pris.",
    duree: 1, budget: 3, maree: null, saison: [],
    tags: [],
    sansLieu: true,
    conseils: [
      "Ne jamais rien laisser de visible dans l'habitacle, nulle part, même cinq minutes.",
      "Éviter de rouler la nuit hors des axes principaux : routes étroites et non éclairées.",
      "Faire le plein à la moitié : les stations sont rares dans le sud."
    ],
    presta: [], gps: [-12.7806, 45.2278]
  },
  {
    id: "taxi", nom: "Taxis collectifs", cat: "pratique", commune: "Toute l'île", zone: "grande-terre",
    resume: "Le vrai réseau de transport de l'île, pas cher, de village en village.",
    texte: "Des véhicules qui partent quand ils sont pleins, depuis les gares routières et les places de village. Tarif fixe selon la destination. Efficace, économique, et une expérience en soi.",
    quand: "En journée. Se raréfient nettement en fin d'après-midi.",
    duree: 1, budget: 1, maree: null, saison: [],
    tags: ["sansVoiture", "pluie"],
    sansLieu: true,
    conseils: [
      "Espèces, appoint apprécié.",
      "Annoncer sa destination avant de monter.",
      "Le dernier retour part tôt : ne pas se retrouver coincé dans le sud à 17 h."
    ],
    presta: [], gps: [-12.7806, 45.2278]
  }
];
