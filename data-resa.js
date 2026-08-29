/* ============================================================
   MAORÉ QUEST — prestataires, agenda, itinéraires, lexique
   ------------------------------------------------------------
   ⚠️ IMPORTANT — LIRE AVANT DE PUBLIER
   Aucun numéro de téléphone, aucun nom commercial n'a été inventé.
   Les prestataires ci-dessous sont des CATÉGORIES d'offre, avec le
   champ `tel: null` et `verifie: false`. Tant que `verifie` est faux,
   l'appli affiche « contact à confirmer » et bascule la demande de
   réservation vers le contact de la rédaction.
   Pour activer un prestataire :
     nom      → sa vraie raison sociale
     tel      → son numéro au format international sans + ni espaces
                (ex. Mayotte mobile 0639XXXXXX  →  "2626 39XXXXXX" sans espaces)
     verifie  → true, UNIQUEMENT après son accord écrit (RGPD + respect)
   ============================================================ */

const PRESTATAIRES = [
  { id: "bateau-sud",     nom: "Sortie bateau — secteur sud (Bouéni / Bandrélé)", type: "Bateau", tel: null, verifie: false,
    offre: "Îlot de sable blanc, baleines en saison, dauphins, snorkeling.", zone: "Sud" },
  { id: "bateau-nord",    nom: "Sortie bateau — secteur nord (Mtsamboro / Longoni)", type: "Bateau", tel: null, verifie: false,
    offre: "Îlots du nord, Choizil, baleines, tour de l'île.", zone: "Nord" },
  { id: "bateau-mamoudzou", nom: "Sortie bateau — départ Mamoudzou", type: "Bateau", tel: null, verifie: false,
    offre: "Îlot Bouzi, demi-journées lagon, coucher de soleil.", zone: "Centre" },
  { id: "club-plongee",   nom: "Club de plongée", type: "Plongée", tel: null, verifie: false,
    offre: "Baptêmes, explorations, Passe en S, formations.", zone: "Nord / Centre" },
  { id: "kayak",          nom: "Location kayak & paddle", type: "Nautique", tel: null, verifie: false,
    offre: "Mangrove, sorties encadrées, lever de soleil.", zone: "Sud / Petite-Terre" },
  { id: "kite",           nom: "École de kitesurf & wingfoil", type: "Nautique", tel: null, verifie: false,
    offre: "Cours, location, encadrement aux Badamiers.", zone: "Petite-Terre" },
  { id: "peche",          nom: "Pêche au gros", type: "Pêche", tel: null, verifie: false,
    offre: "Traîne, jig, journée ou demi-journée.", zone: "Centre / Sud" },
  { id: "guide-rando",    nom: "Guide de randonnée", type: "Terre", tel: null, verifie: false,
    offre: "Choungui, Bénara, Saziley, sorties nocturnes tortues.", zone: "Toute l'île" },
  { id: "ylang",          nom: "Distillerie d'ylang-ylang", type: "Visite", tel: null, verifie: false,
    offre: "Visite de plantation et d'alambic, vente sur place.", zone: "Centre" },
  { id: "potieres",       nom: "Association des potières", type: "Artisanat", tel: null, verifie: false,
    offre: "Démonstration, atelier, vente.", zone: "Sud" },
  { id: "asso-culture",   nom: "Association culturelle (debaa / mbiwi)", type: "Culture", tel: null, verifie: false,
    offre: "Rencontre, répétition ouverte, prestation sur demande.", zone: "Villages" },
  { id: "asso-nature",    nom: "Association de protection des tortues", type: "Nature", tel: null, verifie: false,
    offre: "Sorties nocturnes encadrées, sensibilisation.", zone: "Sud-est" },
  { id: "atelier-cuisine",nom: "Atelier de cuisine mahoraise", type: "Food", tel: null, verifie: false,
    offre: "Marché + cuisine + repas partagé.", zone: "Centre" },
  { id: "resto-plage",    nom: "Restaurant de plage (voulé)", type: "Food", tel: null, verifie: false,
    offre: "Voulé du week-end, poisson grillé, sur réservation.", zone: "Sud / Est" },
  { id: "gargote",        nom: "Gargote mahoraise", type: "Food", tel: null, verifie: false,
    offre: "Mataba, poulet coco, plat du jour le midi.", zone: "Toute l'île" },
  { id: "hotel-ngouja",   nom: "Accueil de la plage de N'Gouja", type: "Hébergement", tel: null, verifie: false,
    offre: "Accès plage à la journée, restauration, hébergement.", zone: "Sud" }
];

/* ------------------------------------------------------------
   AGENDA
   type: "recurrent" → jour de la semaine (0 = dimanche … 6 = samedi)
   type: "saison"    → période de l'année (mois de début / fin)
   type: "date"      → date fixe "AAAA-MM-JJ"
   ------------------------------------------------------------ */
const EVENEMENTS = [
  { id: "ev-marche-coconi", nom: "Marché paysan de Coconi", type: "recurrent", jour: 3,
    heure: "à partir de 7 h", lieu: "Coconi, Ouangani", lien: "marche-coconi",
    texte: "Producteurs du centre de l'île : légumes, plants, miel, vanille." },
  { id: "ev-voule", nom: "Voulé (barbecue de plage)", type: "recurrent", jour: 6,
    heure: "à partir de 16 h", lieu: "Plages du sud et de l'est", lien: "voule",
    texte: "L'institution du samedi. Prévenir le restaurant de plage dans la journée." },
  /* Une date précise deviendrait fausse dans un an. On donne la PÉRIODE
     habituelle, vérifiable, et on renvoie à l'organisateur pour le jour. */
  { id: "ev-milatsika", nom: "Festival Milatsika", type: "saison", debut: 10, fin: 10,
    heure: "un week-end, souvent mi-octobre", lieu: "Chiconi", lien: "debaa",
    texte: "Le grand rendez-vous musical de l'île depuis 2007 : musiques mahoraises, de "
         + "l'océan Indien et d'ailleurs, sur deux soirs. La vingtième édition est attendue "
         + "en 2026. Les dates exactes sont annoncées chaque année par l'association "
         + "organisatrice — elles ne sont pas dans cette application." },
  { id: "ev-manzaraka", nom: "Saison des manzaraka (grands mariages)", type: "saison", debut: 7, fin: 9,
    heure: "surtout le samedi", lieu: "Villages de toute l'île", lien: "manzaraka",
    texte: "Cortèges, debaa, mbiwi. Le meilleur moment culturel de l'année." },
  { id: "ev-baleines", nom: "Saison des baleines à bosse", type: "saison", debut: 7, fin: 10,
    heure: "sorties le matin", lieu: "Lagon", lien: "baleines",
    texte: "Pic en août-septembre. Réserver une à deux semaines à l'avance." },
  { id: "ev-tortues", nom: "Pontes de tortues vertes", type: "saison", debut: 1, fin: 12,
    heure: "de nuit", lieu: "Saziley, Charifou, plages du sud", lien: "saziley",
    texte: "Toute l'année avec des pics variables. Uniquement avec une association." },
  { id: "ev-pluies", nom: "Saison des pluies et des cyclones", type: "saison", debut: 11, fin: 4,
    heure: "", lieu: "Toute l'île", lien: null,
    texte: "Chaleur lourde, averses violentes, risque cyclonique. Surveiller les alertes de la préfecture et connaître le lieu d'abri le plus proche." },
  { id: "ev-seche", nom: "Saison sèche (kashkazi terminé, alizés)", type: "saison", debut: 5, fin: 10,
    heure: "", lieu: "Toute l'île", lien: null,
    texte: "La meilleure période pour venir : moins humide, mer plus maniable, mariages et baleines." },
  { id: "ev-mangues", nom: "Saison des mangues et des letchis", type: "saison", debut: 11, fin: 1,
    heure: "", lieu: "Marchés et bords de route", lien: "marche-mamoudzou",
    texte: "Les fruits tombent partout. Le moment le plus gourmand de l'année." }
];

/* ------------------------------------------------------------
   ITINÉRAIRES CLÉS EN MAIN
   ------------------------------------------------------------ */
const ITINERAIRES = [
  {
    id: "it-petite-terre", nom: "Une journée en Petite-Terre, sans voiture",
    pour: "Escale, week-end court, ou pas de location de voiture",
    duree: "1 journée", ico: "voilier",
    etapes: [
      { h: "6 h 30", lieu: "dziani",  quoi: "Lever de soleil sur le lac Dziani" },
      { h: "9 h 00", lieu: "muma",    quoi: "Musée de Mayotte, pour comprendre l'île" },
      { h: "12 h 00", lieu: "mataba", quoi: "Déjeuner mahorais à Labattoir" },
      { h: "14 h 00", lieu: "moya",   quoi: "Baignade et snorkeling à Moya" },
      { h: "17 h 00", lieu: "rocher", quoi: "Coucher de soleil sur le boulevard des Crabes" }
    ],
    note: "Tout se fait à pied ou en taxi. Rentrer en barge avant la nuit."
  },
  {
    id: "it-sud", nom: "Le grand sud en une journée",
    pour: "Ceux qui ont une voiture et veulent la carte postale",
    duree: "1 journée", ico: "voiture",
    etapes: [
      { h: "6 h 00", lieu: "choungui", quoi: "Montée du Mont Choungui à la fraîche" },
      { h: "10 h 00", lieu: "ngouja",  quoi: "Snorkeling avec les tortues à N'Gouja" },
      { h: "13 h 00", lieu: "mataba",  quoi: "Déjeuner à Kani-Kéli" },
      { h: "15 h 00", lieu: "padza",   quoi: "Les padzas, terre rouge" },
      { h: "17 h 00", lieu: "sakouli", quoi: "Fin de journée à Sakouli" }
    ],
    note: "Journée dense : caler N'Gouja sur la marée haute et adapter le reste autour."
  },
  {
    id: "it-lagon", nom: "Le lagon en grand",
    pour: "Le meilleur de Mayotte vu de l'eau",
    duree: "2 à 3 jours", ico: "poisson",
    etapes: [
      { h: "Jour 1", lieu: "ilot-sable", quoi: "Îlot de sable blanc, calé sur la marée basse" },
      { h: "Jour 2", lieu: "baleines",   quoi: "Sortie baleines le matin (juillet-octobre)" },
      { h: "Jour 2", lieu: "kayak",      quoi: "Mangrove en kayak à marée haute l'après-midi" },
      { h: "Jour 3", lieu: "passe-en-s", quoi: "Plongée ou snorkeling à la Passe en S" }
    ],
    note: "Tout dépend de la météo et des marées : réserver en premier, organiser le reste après."
  },
  {
    id: "it-culture", nom: "Immersion culturelle",
    pour: "Comprendre l'île plutôt que la photographier",
    duree: "2 jours", ico: "mosquee",
    etapes: [
      { h: "Jour 1 matin", lieu: "marche-mamoudzou", quoi: "Marché couvert de Mamoudzou" },
      { h: "Jour 1 midi",  lieu: "atelier-cuisine",  quoi: "Atelier de cuisine mahoraise" },
      { h: "Jour 1 soir",  lieu: "brochetti",        quoi: "Brochetti et vie de rue" },
      { h: "Jour 2 matin", lieu: "tsingoni",         quoi: "Mosquée de Tsingoni" },
      { h: "Jour 2 midi",  lieu: "ylang",            quoi: "Distillerie d'ylang-ylang" },
      { h: "Jour 2 aprem", lieu: "potieres",         quoi: "Potières de Bandrélé" }
    ],
    note: "Se cale bien un mercredi (marché de Coconi) ou un samedi (mariages)."
  },
  {
    id: "it-enfants", nom: "Avec des enfants",
    pour: "Des journées courtes, à l'ombre, sans marche interminable",
    duree: "3 jours", ico: "gens",
    etapes: [
      { h: "Jour 1", lieu: "sakouli",     quoi: "Plage de Sakouli et pêche à pied sur le platier" },
      { h: "Jour 2", lieu: "ngouja",      quoi: "Tortues à N'Gouja (masque et tuba dès 6 ans)" },
      { h: "Jour 2", lieu: "makis",       quoi: "Les makis en fin d'après-midi" },
      { h: "Jour 3", lieu: "coconi-jardin", quoi: "Jardin botanique de Coconi, à l'ombre" },
      { h: "Jour 3", lieu: "ilot-bouzi",  quoi: "Îlot Bouzi, courte traversée" }
    ],
    note: "Chapeau, lycra anti-UV, eau. La chaleur fatigue les enfants avant les parents."
  },
  {
    id: "it-week-end-local", nom: "Le week-end du Mahorais",
    pour: "Les habitants de l'île qui tournent en rond le samedi",
    duree: "1 week-end", ico: "plage",
    etapes: [
      { h: "Samedi matin", lieu: "marche-coconi", quoi: "Courses au marché paysan" },
      { h: "Samedi aprem", lieu: "voule",         quoi: "Voulé sur la plage avec la famille" },
      { h: "Dimanche matin", lieu: "benara",      quoi: "Randonnée au Bénara à la fraîche" },
      { h: "Dimanche midi",  lieu: "sakouli",     quoi: "Retrouvailles à Sakouli" }
    ],
    note: "Version locale : pas de bateau, pas de budget, juste le rythme de l'île."
  }
];

/* ------------------------------------------------------------
   SECOURS, ALERTE ET VIGILANCE
   Bloc rappelé sur chaque fiche d'activité et sur sa propre page.
   L'application envoie des gens en randonnée isolée et en mer :
   ne pas afficher de numéro de secours serait une faute.
   ⚠️ Numéros nationaux français — à faire valider par la préfecture
   avant la mise en ligne publique.
   ------------------------------------------------------------ */
const SECOURS = {
  numeros: [
    { n: "112", q: "Urgence européenne, depuis n'importe quel téléphone" },
    { n: "15",  q: "SAMU — urgence médicale" },
    { n: "18",  q: "Pompiers" },
    { n: "17",  q: "Police / gendarmerie" },
    { n: "114", q: "Par SMS, pour les personnes sourdes et malentendantes" },
    { n: "196", q: "Secours en mer (CROSS) — ou VHF canal 16" }
  ],
  note: "Le 06 39 69 41 41 est le numéro du réseau d'échouages REMMAT : c'est un numéro de " +
        "signalement d'animal marin échoué, pas un numéro de secours.",
  cyclone: [
    { n: "Pré-alerte jaune", d: "« je m'informe »",
      t: "Menace potentielle à plus de 24 h. Se tenir informé, éviter les randonnées en montagne " +
         "et les sorties en mer de plus de 24 h, vérifier ses réserves (conserves, eau, piles, " +
         "médicaments), repérer l'abri le plus proche, ne pas s'approcher du littoral en cas de forte houle." },
    { n: "Alerte orange", d: "« je me prépare »",
      t: "Danger dans les 24 h. Établissements scolaires et crèches fermés. Ranger ce qui peut " +
         "s'envoler, renforcer portes et fenêtres, constituer ses réserves. À partir de ce niveau : " +
         "aucune activité de pleine nature, aucune sortie en mer, aucune randonnée." },
    { n: "Alerte rouge", d: "« je me confine »",
      t: "Danger imminent. Le passage en alerte rouge est annoncé à l'avance, avec un préavis " +
         "d'environ 3 heures, pour vous permettre de rejoindre un abri AVANT son entrée en vigueur. " +
         "Une fois l'alerte rouge déclarée, ne sortez plus, en aucun cas, jusqu'à la levée officielle." },
    { n: "Alerte violette", d: "danger exceptionnel",
      t: "Le phénomène touche directement le territoire, les secours ne peuvent plus intervenir. " +
         "Confinement strict." },
    { n: "Phase de sauvegarde", d: "la menace s'éloigne",
      t: "Les dangers persistent : inondations, coulées de boue, lignes électriques à terre, routes " +
         "coupées, gués submergés, arbres tombés. Ne franchissez jamais un gué submergé, ne touchez " +
         "jamais un câble tombé. L'eau du robinet peut rester contaminée plus de 48 h après de fortes pluies." }
  ],
  seisme: "Mayotte connaît depuis 2018 une activité sismo-volcanique liée au volcan sous-marin " +
    "Fani Maoré, suivie par le REVOSIMA au niveau « veille scientifique renforcée » ; le dernier " +
    "séisme ressenti remonte au 20 juin 2025. En cas de secousse ressentie sur le littoral, " +
    "n'attendez aucune alerte : éloignez-vous de la mer et gagnez les hauteurs.",
  liens: [
    { t: "Vigilance Météo-France Mayotte", u: "https://vigilance.meteofrance.fr/fr/mayotte" },
    { t: "Préfecture de Mayotte", u: "https://www.mayotte.gouv.fr" },
    { t: "Suivi du volcan (REVOSIMA / IPGP)", u: "https://www.ipgp.fr/volcanoweb/mayotte" }
  ]
};

/* ------------------------------------------------------------
   LEXIQUE — shimaoré
   ⚠️ Liste volontairement COURTE. Elle a été recoupée sur une base
   lexicographique locale dont les licences ne permettent pas la
   rediffusion d'un extrait substantiel : on s'en tient aux mots
   d'usage courant, et chaque entrée reste à faire valider par un
   locuteur natif avant publication.
   Le ɓ et le ɗ notent des consonnes implosives, souvent simplifiées
   en b et d dans l'usage courant.
   ------------------------------------------------------------ */
const LEXIQUE = [
  { fr: "Bienvenue", sh: "kariɓu", pr: "ka-ri-bou",
    note: "Souvent écrit « karibu ». C'est le mot du nom de l'application." },
  { fr: "Bonjour / ça va ?", sh: "jeje ?", pr: "djé-djé",
    note: "Salutation courante et informelle. Variante : gege." },
  { fr: "Bonjour (marque de respect)", sh: "kwezi", pr: "koué-zi",
    note: "Envers les aînés notamment. On répond souvent « marahaɓa »." },
  { fr: "Merci", sh: "marahaɓa", pr: "ma-ra-ha-ba", note: "" },
  { fr: "Merci beaucoup", sh: "asanta", pr: "a-san-ta", note: "" },
  { fr: "Oui", sh: "ewa", pr: "é-oua", note: "" },
  { fr: "Non", sh: "ãhã", pr: "an-han", note: "Nasalisé." },
  { fr: "Au revoir", sh: "kwaheri", pr: "koua-hé-ri", note: "" },
  { fr: "Pardon, excusez-moi", sh: "soimahani", pr: "soï-ma-ha-ni", note: "" },
  { fr: "Ça va bien", sh: "fetre", pr: "fé-tré", note: "" },
  { fr: "Madame", sh: "ɓweni", pr: "bwé-ni", note: "Signifie aussi « femme ». Voir aussi ɓiɓi." },
  { fr: "Monsieur", sh: "ɓwana", pr: "bwa-na", note: "Signifie aussi « homme »." },
  { fr: "Ami, camarade", sh: "munyawe", pr: "mou-nya-wé", note: "Pluriel : wanyawe." },
  { fr: "Personne venue d'ailleurs", sh: "mzungu", pr: "m-zoun-gou",
    note: "Descriptif, pas une insulte. À connaître pour le comprendre." },
  { fr: "Quel est le prix ?", sh: "kima ya shitru ini trini ?", pr: "ki-ma ya chi-trou i-ni tri-ni",
    note: "Au marché. « thamani » et « kima » disent tous deux le prix." },
  { fr: "Pas cher", sh: "rahisi", pr: "ra-hi-si", note: "" },
  { fr: "L'eau", sh: "maji", pr: "ma-dji", note: "" },
  { fr: "La mer", sh: "ɓahari", pr: "ba-ha-ri", note: "" },
  { fr: "La plage", sh: "mutsanga", pr: "mou-tsan-ga",
    note: "« À la plage » : mutsangani. On retrouve le mot dans beaucoup de noms de lieux." },
  { fr: "Le poisson", sh: "fi", pr: "fi", note: "" },
  { fr: "Le marché", sh: "ɓazari", pr: "ba-za-ri", note: "" },
  { fr: "La maison", sh: "ɗago", pr: "da-go", note: "Aussi « nyumba ». Pluriel : malago." },
  { fr: "La montagne", sh: "mulima", pr: "mou-li-ma", note: "Pluriel : milima." },
  { fr: "Mayotte", sh: "Maore", pr: "ma-o-ré", note: "D'où « mahorais »." },
  { fr: "La tortue", sh: "nyamba", pr: "nyam-ba",
    note: "On le retrouve dans le nom de l'association Oulanga Na Nyamba." },
  { fr: "Le maki", sh: "komba", pr: "kom-ba", note: "Le nom local du lémurien." },
  { fr: "Le soleil", sh: "jua", pr: "djou-a", note: "" },
  { fr: "La pluie", sh: "vua", pr: "vou-a", note: "Saison des pluies : kashikazi." },
  { fr: "Aujourd'hui", sh: "leo", pr: "lé-o", note: "Demain : meso." },
  { fr: "Le matin", sh: "asuɓuhi", pr: "a-sou-bou-hi", note: "Le soir : ujoni. La nuit : uku." }
];

/* Mots de culture à écrire correctement dans les fiches — affichés en second
   temps sur la page du lexique. */
const MOTS_CULTURE = [
  { m: "harussi", s: "Le mariage traditionnel mahorais dans son ensemble. Ne dites pas « manzaraka » pour désigner le mariage entier." },
  { m: "manzaraka", s: "La dernière étape publique du harussi : le cortège qui accompagne le marié au domicile de l'épouse." },
  { m: "debaa", s: "Chant soufi et gestuelle, exclusivement féminin. Inscrit à l'inventaire du patrimoine culturel immatériel en 2025." },
  { m: "mbiwi", s: "Les baguettes de bambou, et l'art musical et chorégraphique féminin qu'elles accompagnent. Inscrit à l'inventaire en 2024." },
  { m: "wadaha", s: "La danse du pilon, féminine, autour d'un mortier et de trois pilons." },
  { m: "chigoma", s: "Pratique masculine aux tambours. On écrit aussi shigoma." },
  { m: "m'godro", s: "Genre musical populaire inspiré du salegy malgache. Ce n'est pas une danse cérémonielle." },
  { m: "mourengué", s: "Combat traditionnel debout, à mains nues. On écrit aussi moringué." },
  { m: "salouva", s: "La tenue féminine traditionnelle : une pièce de tissu nouée sous la poitrine. Un marqueur identitaire, jamais un déguisement." },
  { m: "kishali", s: "Le châle qui accompagne le salouva." },
  { m: "m'sindzano", s: "Masque de beauté en bois de santal râpé mélangé à de l'eau, porté au quotidien comme protection solaire et dessiné lors des fêtes." },
  { m: "fady", s: "Un interdit coutumier. Il y en a notamment sur le site de Saziley." },
  { m: "ziara", s: "Un lieu de vénération. Le « cœur de ziara » de Saziley est marqué par deux baobabs." }
];

/* ------------------------------------------------------------
   INFOS PRATIQUES
   Chaque bloc porte ses sources. « attention: true » met le bloc en
   avant. Les mentions [à confirmer] signalent une donnée que la
   recherche n'a PAS pu établir : ne pas la combler d'intuition.
   ------------------------------------------------------------ */
const INFOS = [
  {
    titre: "Venir à Mayotte en 2026",
    txt: "Le cyclone Chido a frappé l'île le matin du 14 décembre 2024 : catégorie 4, rafale record de " +
      "226 km/h à Pamandzi, le cyclone le plus intense depuis quatre-vingt-dix ans. En 2026, la " +
      "reconstruction structure encore la vie quotidienne. Côté nature : de 30 % à plus de 80 % des " +
      "arbres détruits selon les massifs, de nombreux sentiers impraticables, environ 80 % des " +
      "palétuviers défoliés. L'offre touristique se relève : environ 81 % des hébergements ont rouvert, " +
      "mais seulement 43 % des restaurants, et la capacité d'hébergement a baissé d'environ 20 %. " +
      "Venir à Mayotte aujourd'hui, c'est venir dans un territoire qui se reconstruit : adaptez vos " +
      "attentes, réservez à l'avance, et appelez pour confirmer — les informations en ligne sont " +
      "souvent périmées.",
    src: [{ t: "Préfecture — stratégie 2026-2031", u: "https://www.mayotte.gouv.fr" },
          { t: "INSEE — fréquentation touristique 2025", u: "https://www.insee.fr/fr/statistiques/fichier/9012828/my_cp_2026_inf_209.pdf" },
          { t: "ONF — un an après Chido", u: "https://www.onf.fr" }]
  },
  {
    titre: "Secours et alerte",
    attention: true,
    txt: "112 depuis n'importe quel téléphone · 15 SAMU · 18 pompiers · 17 police et gendarmerie · " +
      "114 par SMS pour les personnes sourdes et malentendantes · 196 ou VHF canal 16 pour les secours " +
      "en mer. Le réseau mobile n'est pas garanti partout sur les sentiers : prévenez quelqu'un de " +
      "votre itinéraire et de votre heure de retour, et téléchargez vos cartes avant de partir. " +
      "Le détail des niveaux d'alerte cyclonique et des consignes séisme se trouve sur la page Secours.",
    src: [{ t: "Vigilance Météo-France Mayotte", u: "https://vigilance.meteofrance.fr/fr/mayotte" }]
  },
  {
    titre: "Quand venir",
    txt: "La saison sèche, de mai à novembre, est la bonne période : moins humide, mer plus maniable, " +
      "baleines de juillet à octobre, mariages surtout de juillet à septembre. De décembre à avril, " +
      "les pluies rendent les sentiers glissants et dangereux. La saison cyclonique officielle du " +
      "sud-ouest de l'océan Indien court du 15 novembre au 30 avril, mais des phénomènes restent " +
      "possibles en dehors : la saison 2025-2026 a démarré dès le 16 juillet 2025.",
    src: [{ t: "Météo-France Mayotte — cyclones", u: "https://meteofrance.yt/fr/cyclone" }]
  },
  {
    titre: "Santé",
    attention: true,
    txt: "Le paludisme connaît une reprise de transmission locale : 309 cas depuis le 1er janvier 2026, " +
      "dont 68 acquis localement (bulletin du 7 août 2026). Le chikungunya a fait l'objet d'une " +
      "épidémie en 2025-2026, en décrue depuis le printemps ; la dengue circule également. " +
      "Protégez-vous jour et nuit : répulsif, vêtements couvrants, moustiquaire. Toute fièvre pendant " +
      "le séjour ou dans les mois qui suivent le retour impose une consultation rapide, en signalant " +
      "le séjour à Mayotte. La leptospirose circule aussi (121 cas au 24 avril 2026, dont 4 " +
      "réanimations) : elle s'attrape par contact avec l'eau douce ou la boue souillées par l'urine de " +
      "rongeurs — évitez de vous immerger en eau douce, ne marchez pas pieds nus après la pluie. " +
      "Cette application ne recommande aucun médicament ni aucun traitement préventif : voyez votre " +
      "médecin avant le départ. Ces chiffres sont datés — consultez le bulletin en cours.",
    src: [{ t: "Santé publique France — bulletins Mayotte", u: "https://www.santepubliquefrance.fr/regions-et-territoires/ocean-indien" },
          { t: "ARS Mayotte", u: "https://www.mayotte.ars.sante.fr" }]
  },
  {
    titre: "Baignade en mer",
    txt: "La quasi-totalité des plages ne sont pas surveillées : ne vous baignez pas seul, prévenez " +
      "quelqu'un, tenez compte de la marée et sortez de l'eau avant la fatigue. Les passes et les " +
      "chenaux canalisent des courants de marée puissants : n'y nagez pas. Le marnage est important — " +
      "une zone praticable à pied à marée basse peut devenir un piège à marée montante. Portez des " +
      "chaussures de récif : les coupures sur le corail s'infectent vite. Ne touchez rien, ne " +
      "retournez pas les pierres, ne ramassez pas les coquillages vivants (poisson-pierre, " +
      "poisson-scorpion, raies à dard, cônes) ; en cas de piqûre, appelez le 15. Aucun dispositif de " +
      "type réunionnais — filets, zones surveillées, arrêtés — n'existe à Mayotte ; nous ne publions " +
      "aucune consigne « risque requin », dans un sens comme dans l'autre, faute de source officielle " +
      "mahoraise. Évitez la baignade littorale après de fortes pluies.",
    src: [{ t: "Parc naturel marin de Mayotte", u: "https://parc-marin-mayotte.fr" }]
  },
  {
    titre: "Randonnée",
    txt: "Chido a détruit de 30 % à plus de 80 % des arbres selon les massifs ; toutes les forêts " +
      "publiques ont été touchées et de nombreux cheminements sont devenus impraticables. La " +
      "réouverture est progressive depuis 2025 : vérifiez l'état du sentier auprès de l'office de " +
      "tourisme avant chaque départ. Concrètement, il y a beaucoup moins d'ombre, le sol est plus " +
      "érodé et plus glissant, et des arbres restent instables. Deux litres d'eau par personne et par " +
      "demi-journée au minimum. Dès l'alerte orange cyclonique : aucune sortie. Ne partez pas seul sur " +
      "les tronçons isolés, prévenez quelqu'un, n'emportez pas d'objets de valeur et ne laissez rien " +
      "dans le véhicule — des vols et des agressions de randonneurs sont documentés sur les sites isolés.",
    src: [{ t: "ONF — un an après le cyclone Chido", u: "https://www.onf.fr" }]
  },
  {
    titre: "Respect des usages",
    txt: "Vous êtes chez des gens. Mayotte est un département français à très forte majorité musulmane, " +
      "où la vie s'organise autour du village, de la famille et de la mosquée. Épaules et genoux " +
      "couverts dans les villages, aux abords des mosquées, sur les marchés et lors des cérémonies — " +
      "pour tout le monde ; le maillot reste sur la plage. Les mosquées sont des lieux de culte en " +
      "activité, pas des monuments : demandez avant d'entrer ou de photographier, évitez les heures de " +
      "prière. Un debaa, un mbiwi, un wadaha, un manzaraka ne sont pas des spectacles pour visiteurs : " +
      "ce sont des cérémonies familiales et religieuses, auxquelles on assiste sur invitation. " +
      "Demandez toujours l'autorisation avant une photo ou une vidéo. Ne photographiez pas les " +
      "habitations détruites ni les personnes sinistrées. Ne prélevez ni coquillage, ni corail, ni " +
      "sable, et n'achetez aucun objet en écaille de tortue.",
    src: [{ t: "Mayotte Tourisme", u: "https://www.mayotte-tourisme.com" }]
  },
  {
    titre: "L'eau",
    txt: "Mayotte vit sous un régime de coupures tournantes : depuis le 15 juillet 2026, 30 heures " +
      "d'eau puis 42 heures de coupure. Les besoins quotidiens sont estimés à 47 500 m³ pour une " +
      "capacité de production plafonnée à 37 000 m³. Prévoyez des réserves, ne comptez pas sur l'eau " +
      "courante à toute heure, et acceptez que les établissements adaptent leurs services. Après de " +
      "fortes pluies, l'eau du robinet peut rester contaminée plus de 48 heures : préférez l'eau en " +
      "bouteille. C'est aussi une question de respect : l'eau est un sujet de tension quotidienne pour " +
      "les habitants. Ne la gaspillez pas.",
    src: [{ t: "Mayotte la 1ère — crise de l'eau", u: "https://la1ere.franceinfo.fr/mayotte" }]
  },
  {
    titre: "Sécurité",
    txt: "La délinquance reste très supérieure à la moyenne nationale, mais 2025 marque un recul global " +
      "d'environ 10 % : −6 % d'atteintes de proximité, −9 % de coups et blessures volontaires, −31 % de " +
      "violences crapuleuses et la quasi-disparition des « coupeurs de route ». Les cambriolages, eux, " +
      "sont en forte hausse. Concrètement, sans dramatiser : ne circulez pas seul la nuit dans les rues " +
      "désertes, ne laissez rien de visible dans un véhicule, n'emportez pas d'objets de valeur sur les " +
      "sites de randonnée isolés, marchez en groupe, et renseignez-vous localement avant de vous rendre " +
      "sur un site isolé. Barrages routiers et caillassages perturbent régulièrement la circulation : " +
      "consultez la situation du jour avant un déplacement long.",
    src: [{ t: "Rapport du Sénat n° 525 (2026)", u: "https://www.senat.fr/rap/r25-525/r25-52510.html" }]
  },
  {
    titre: "Se déplacer",
    txt: "L'aéroport est à Pamandzi, en Petite-Terre ; Mamoudzou, le chef-lieu, est en Grande-Terre. " +
      "Le passage se fait par la barge maritime entre Dzaoudzi-Labattoir et Mamoudzou : c'est le trajet " +
      "que fait tout visiteur arrivant par avion. Tarifs, horaires et fréquence de la barge, location de " +
      "véhicules, taxis collectifs, réseau de bus : [à confirmer] aucune source à jour n'a pu être " +
      "vérifiée pour 2026 — renseignez-vous auprès du Service des transports maritimes et des offices " +
      "de tourisme plutôt que de vous fier à une information en ligne. La circulation est régulièrement " +
      "perturbée ; évitez de rouler la nuit sur les axes isolés.",
    src: [{ t: "Rapport du Sénat n° 525 (2026)", u: "https://www.senat.fr/rap/r25-525/r25-52510.html" }]
  },
  {
    titre: "Argent",
    txt: "Mayotte est le 101e département français depuis le 31 mars 2011 : la monnaie est l'euro et le " +
      "droit français s'applique. Prévoyez des espèces — une partie de l'économie de proximité " +
      "(marchés, petits commerces, artisans) fonctionne en liquide. Répartition des distributeurs et " +
      "acceptation des cartes : [à confirmer], aucune source vérifiée.",
    src: []
  },
  {
    titre: "Les marées",
    txt: "Le marnage est important à Mayotte et la marée décide de presque tout : l'îlot de sable blanc " +
      "et les platiers à marée basse, les tortues et le snorkeling à marée haute, la mangrove en kayak " +
      "à marée haute. À la cascade de Soulou, à marée très haute, la chute tombe dans la mer et non sur " +
      "la plage. Les passes canalisent des courants puissants selon la marée. Les horaires affichés " +
      "dans cette application sont une estimation calculée sur votre appareil : consultez l'annuaire " +
      "officiel du SHOM avant toute sortie littorale.",
    src: [{ t: "Annuaire des marées du SHOM", u: "https://maree.shom.fr" }]
  },
  {
    titre: "Protéger le lagon",
    txt: "Ne marchez jamais sur le corail et ne posez ni pied, ni main, ni ancre sur du corail vivant : " +
      "après le blanchissement et Chido, la mortalité corallienne cumulée atteint 66 % et les colonies " +
      "survivantes sont précieuses. Le Parc naturel marin recommande les crèmes solaires minérales, les " +
      "filtres chimiques nuisant à la photosynthèse du corail — le plus fiable restant le lycra anti-UV. " +
      "Les mentions commerciales « reef-safe » ne correspondent à aucun label officiel. Le mouillage se " +
      "fait sur les bouées du Parc, dont beaucoup restent fragilisées par Chido : consultez leur état " +
      "avant chaque sortie. Une fermeture saisonnière de la pêche au poulpe s'applique chaque année, en " +
      "principe du 1er avril au 15 juin, professionnels comme particuliers.",
    src: [{ t: "Parc naturel marin — quand je navigue", u: "https://parc-marin-mayotte.fr/editorial/quand-je-navigue" },
          { t: "Parc naturel marin — bouées d'amarrage", u: "https://parc-marin-mayotte.fr/actualites/bouees-damarrage-vigilance-renforcee-et-conditions-dutilisation" }]
  }
];

/* ------------------------------------------------------------
   ORGANISMES CITABLES — vérifiés comme existants
   ------------------------------------------------------------ */
const ORGANISMES = [
  { n: "Parc naturel marin de Mayotte", r: "Réglementation d'approche de la faune, mouillages, état du lagon.",
    u: "https://parc-marin-mayotte.fr" },
  { n: "Mayotte Tourisme", r: "Sites, événements, contacts des offices de tourisme.",
    u: "https://www.mayotte-tourisme.com" },
  { n: "Oulanga Na Nyamba", r: "Protection des tortues marines, sorties encadrées d'observation de ponte.",
    u: "https://oulangananyamba.com" },
  { n: "Conservatoire du littoral", r: "Fiches détaillées des sites protégés (Saziley, cratère de Petite-Terre…).",
    u: "https://www.conservatoire-du-littoral.fr" },
  { n: "Météo-France Mayotte", r: "Vigilance cyclonique et bulletins.",
    u: "https://meteofrance.yt" },
  { n: "Préfecture de Mayotte", r: "Alertes, arrêtés, situation du jour.",
    u: "https://www.mayotte.gouv.fr" },
  { n: "Santé publique France — océan Indien", r: "Bulletins de surveillance sanitaire.",
    u: "https://www.santepubliquefrance.fr/regions-et-territoires/ocean-indien" },
  { n: "SHOM", r: "Annuaire officiel des marées.", u: "https://maree.shom.fr" },
  { n: "REVOSIMA / IPGP", r: "Suivi du volcan sous-marin Fani Maoré.",
    u: "https://www.ipgp.fr/volcanoweb/mayotte" }
];
