/* =============================================================================
   KARIBU MAORÉ — logique de l'application
   Statique, sans framework, sans build. Rendu par chaînes, routage par hash,
   événements par délégation (aucun gestionnaire en ligne dans le HTML).
   ========================================================================== */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const MOIS  = ["janvier","février","mars","avril","mai","juin","juillet","août",
               "septembre","octobre","novembre","décembre"];
const JOURS = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];

/* ------------------------------------------------------------- 1. STOCKAGE
   En navigation privée, avec les données de site bloquées, ou après une éviction
   de stockage, l'écriture échoue silencieusement. Avaler cette erreur reviendrait
   à dire « c'est enregistré » à quelqu'un qui perdra son carnet en fermant
   l'application. On sonde donc une fois au démarrage, et l'appli le dit. */
const Store = {
  dispo: true,
  get(k, def) { try { const v = localStorage.getItem("km_" + k); return v === null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) {
    try { localStorage.setItem("km_" + k, JSON.stringify(v)); return true; }
    catch { Store.dispo = false; return false; }
  },
  sonder() {
    try {
      localStorage.setItem("km_sonde", "1");
      const ok = localStorage.getItem("km_sonde") === "1";
      localStorage.removeItem("km_sonde");
      Store.dispo = ok;
    } catch { Store.dispo = false; }
    return Store.dispo;
  }
};
let favoris  = Store.get("favoris", []);
let demandes = Store.get("demandes", []);
let filtres  = { cat: null, zone: null, budget: null, tag: null, q: "" };

/* ------------------------------------------------------------ 2. RACCOURCIS */
const cat     = id => CATEGORIES.find(c => c.id === id) || { id, nom: id, ico: "info", sh: "" };
const lieu    = id => LIEUX.find(l => l.id === id);
const presta  = id => PRESTATAIRES.find(p => p.id === id);
const esc     = s => String(s ?? "").replace(/[&<>"']/g, c =>
                  ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const attr    = s => esc(s).replace(/\s+/g, " ");
const cap     = s => s.charAt(0).toUpperCase() + s.slice(1);
/* « ilot » doit trouver « îlot », « ngouja » doit trouver « N'Gouja » */
const dateFr  = iso => { const d = new Date(iso);
  return isNaN(d) ? String(iso) : `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`; };
const sansAccent = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’]/g, " ");
const euro    = n => n === 0 ? "Gratuit" : ["", "Petit budget", "Budget moyen", "Budget élevé"][n];
const euroC   = n => n === 0 ? "gratuit" : "€".repeat(n);
const dureeTxt= h => h >= 24 ? "Plusieurs jours" : h < 2 ? "1 h environ" : h + " h";
const mapLien = l => "https://www.google.com/maps/search/?api=1&query=" +
                  encodeURIComponent(l.nom + ", " + l.commune + ", Mayotte");
const ico     = (n, c) => UI.icone(n, c);

/* Le numéro de contact est-il encore celui d'exemple ? Tant que c'est le cas,
   on n'ouvre jamais WhatsApp : un numéro factice peut très bien appartenir à
   quelqu'un, et lui envoyer des demandes de réservation serait indélicat. */
const contactPret = () => /^\d{9,15}$/.test(APP.contactWhatsApp) &&
                          !/^2626390{6}$/.test(APP.contactWhatsApp);

function ouvrirWhatsApp(numero, texte) {
  if (!numero || (numero === APP.contactWhatsApp && !contactPret())) {
    const msg = "Le contact de l'application n'est pas encore activé.\n\n" +
                "Votre message a été préparé ci-dessous : copiez-le et envoyez-le par le moyen " +
                "de votre choix.\n\n" + texte;
    navigator.clipboard?.writeText(texte).catch(() => {});
    feuille({
      titre: "Contact pas encore activé",
      texte: "Votre message est prêt et copié. Envoyez-le par le moyen de votre choix.",
      texteLong: texte,
      actions: [{ libelle: "Copier à nouveau",
                  faire: () => navigator.clipboard?.writeText(texte).catch(() => {}) }]
    });
    return false;
  }
  window.open("https://wa.me/" + numero + "?text=" + encodeURIComponent(texte), "_blank", "noopener");
  return true;
}

/* Heure locale de Mayotte (UTC+3) quel que soit le fuseau de l'appareil */
function maintenant() {
  const n = new Date();
  return new Date(n.getTime() + (MAREES.FUSEAU * 60 + n.getTimezoneOffset()) * 60000);
}
const enSaison = (l, m) => !l.saison.length || l.saison.includes(m);

function annoncer(txt) { const a = $("#annonce"); if (a) a.textContent = txt; }

/* --------------------------------------------------------- 3. COMPOSANTS */
function carteLieu(l) {
  const c = cat(l.cat);
  const fav = favoris.includes(l.id);
  /* Un seul élément cliquable pour la navigation (le titre), dont la zone
     sensible est étendue à toute la carte par CSS. Le cœur reste un bouton
     distinct au-dessus : pas d'interactif imbriqué dans un autre. */
  return `
  <article class="fiche-carte">
    <div class="fiche-carte__art">
      ${UI.illustration(l.id, l.cat, { indice: l.nom + " " + l.resume })}
      <span class="fiche-carte__cat">${ico(c.ico)} ${esc(c.nom)}</span>
      <button class="coeur" data-action="favori" data-id="${l.id}" aria-pressed="${fav}"
              aria-label="${fav ? "Retirer" : "Ajouter"} ${attr(l.nom)} ${fav ? "du" : "au"} carnet">
        ${ico("coeur")}
      </button>
    </div>
    <div class="fiche-carte__corps">
      <h3 class="fiche-carte__titre"><button class="fiche-carte__lien"
        data-action="aller" data-route="/lieu/${l.id}">${esc(l.nom)}</button></h3>
      <p class="fiche-carte__lieu">${ico("epingle")} ${esc(l.commune)}</p>
      <p class="fiche-carte__res">${esc(l.resume)}</p>
      <div class="fiche-carte__meta">
        <span class="puce">${dureeTxt(l.duree)}</span>
        <span class="puce">${euroC(l.budget)}</span>
        ${l.maree ? `<span class="puce puce--maree">marée ${l.maree}</span>` : ""}
        ${l.tags.includes("famille")     ? `<span class="puce puce--ok">famille</span>` : ""}
        ${l.tags.includes("sansVoiture") ? `<span class="puce">sans voiture</span>` : ""}
        ${l.presta.length ? `<span class="puce puce--or">réservable</span>` : ""}
        ${l.etat && ETATS[l.etat] && l.etat !== "ouvert"
          ? `<span class="puce ${ETATS[l.etat].cls}">${esc(ETATS[l.etat].txt)}</span>` : ""}
      </div>
    </div>
  </article>`;
}

function note(type, contenu, icone = "info") {
  return `<div class="note note--${type} note--pile">${ico(icone)}<div>${contenu}</div></div>`;
}

function pied() {
  return `<footer class="pied">
    <strong>${esc(APP.nom)}</strong> · version ${esc(APP.version)} · contenu du ${esc(APP.maj)}<br>
    Fonctionne hors connexion. Marées calculées à bord — vérifiez l'annuaire du Shom
    avant une sortie.<br>
    <a href="#/infos">Infos pratiques</a> · <a href="#/lexique">Shimaoré</a> ·
    <a href="#/apropos">À propos &amp; sources</a>
  </footer>`;
}

/* ----------------------------------------------------- 4. VUE : AUJOURD'HUI */
function vueAccueil() {
  const now = maintenant();
  const mois = now.getMonth() + 1, h = now.getHours();
  const etat = MAREES.etatMaintenant(new Date());
  const phase = MAREES.phaseLune(now);
  const vives = phase.vives;

  const salut = h < 5 ? "Il est tard." : h < 11 ? "Bonjour !" : h < 14 ? "Bon appétit."
              : h < 17 ? "Bon après-midi." : h < 20 ? "Bonne soirée." : "Bonne nuit.";
  const soir = h >= 17 || h < 5;
  const suite = soir ? "Voici pour demain matin." : "Voici ce qui colle avec maintenant.";

  /* Ordre figé pour la journée : sans ça, mettre une fiche en favori la ferait
     remonter et les cartes bougeraient sous le doigt. */
  const cleJour = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${soir ? "s" : "j"}`;
  if (_ordreSuggestions.cle !== cleJour) {
    _ordreSuggestions.cle = cleJour;
    _ordreSuggestions.ids = classer(LIEUX, now, soir).slice(0, 4).map(l => l.id);
  }
  const suggestions = _ordreSuggestions.ids.map(lieu).filter(Boolean);

  const dateJour = new Date().toISOString().slice(0, 10);
  const evJour = EVENEMENTS.filter(e => (!e.perime || e.perime >= dateJour)
                                     && actifMaintenant(e, now));

  const prochaine = etat.evts.find(e => e.brut > h + now.getMinutes() / 60) || etat.evts[0];

  return `
  <section class="heros apparait">
    ${UI.ile("heros__ile")}
    <p class="heros__jour">${cap(JOURS[now.getDay()])} ${now.getDate()} ${MOIS[now.getMonth()]} ·
      ${String(h).padStart(2,"0")} h ${String(now.getMinutes()).padStart(2,"0")} à Mayotte</p>
    <h1 class="heros__salut">${salut} ${suite}</h1>
    <div class="heros__stats">
      <div class="stat">
        <span class="stat__cle">Marée</span>
        <span class="stat__val">${esc(etat.sens)}</span>
        <span class="stat__sous">${etat.hauteur} m maintenant${prochaine
          ? ` · ${prochaine.type} à ${esc(prochaine.heure)}` : ""}</span>
      </div>
      <div class="stat">
        <span class="stat__cle">Marnage</span>
        <span class="stat__val">${etat.indic ? etat.indic.marnage + " m" : "—"}</span>
        <span class="stat__sous">${etat.indic ? esc(etat.indic.regime) : ""}</span>
      </div>
      <div class="stat">
        <span class="stat__cle">Soleil</span>
        ${(() => {
          const s = jourSolaire(), m = h * 60 + now.getMinutes() / 60 * 0;
          const mn = h * 60;
          /* Avant le lever, l'information utile est l'heure du lever — pas
             « il reste 17 h de jour » à une heure du matin. */
          if (mn < s.lever) return `<span class="stat__val">${SOLEIL.min2h(s.lever)}</span>
            <span class="stat__sous">lever du soleil</span>`;
          if (mn > s.civil) return `<span class="stat__val">${SOLEIL.min2h(s.lever)}</span>
            <span class="stat__sous">lever demain · nuit noire</span>`;
          const r = (s.civil - mn) / 60;
          const reste = r > 1 ? `encore ${Math.floor(r)} h ${String(Math.round((r % 1) * 60)).padStart(2, "0")} de jour`
                     : r > .1 ? `plus que ${Math.round(r * 60)} min de jour`
                     : "la nuit tombe";
          const doree = mn >= s.doreeDebut - 45 && mn <= s.coucher
            ? ` · dorée ${SOLEIL.min2h(s.doreeDebut)}` : "";
          return `<span class="stat__val">${SOLEIL.min2h(s.coucher)}</span>
            <span class="stat__sous">${reste}${doree}</span>`;
        })()}
      </div>
      <div class="stat">
        <span class="stat__cle">Saison</span>
        <span class="stat__val">${mois >= 5 && mois <= 10 ? "sèche" : "des pluies"}</span>
        <span class="stat__sous">${mois >= 7 && mois <= 10 ? "baleines dans le lagon" : "chaud et humide"}</span>
      </div>
    </div>
  </section>

  ${blocSansOmbre()}
  ${blocUV()}

  <section class="section">
    <h2 class="section__titre">Aujourd'hui <span class="oeil">${suggestions.length} idées</span></h2>
    <p class="section__note">Choisies selon l'heure, la marée estimée et la saison.</p>
    <div class="grille">${suggestions.map(carteLieu).join("")}</div>
    <button class="btn btn--discret" data-action="aller" data-route="/explorer"
      style="margin-top:var(--s3)">Voir les ${LIEUX.length} activités ${ico("fleche", "pivote")}</button>
  </section>

  <section class="section">
    <h2 class="section__titre">La marée du jour</h2>
    <p class="section__note">Calculée sur votre appareil, sans réseau. Hauteurs en mètres
      au-dessus du zéro des cartes marines.</p>
    <div class="bloc">
      ${UI.courbeMaree(etat.evts, h + now.getMinutes() / 60, null, mareeDuJour().profil)}
      <div class="rangs" style="margin-top:var(--s3)">
        ${etat.evts.map(e => `<div class="rang">
          <span class="rang__cle">${e.type === "haute" ? "Pleine mer" : "Basse mer"}</span>
          <span class="rang__val"><b>${esc(e.heure)}</b> · ${e.hauteur} m
            <small>hauteur comptée depuis le zéro des cartes marines</small></span>
        </div>`).join("")}
      </div>
      ${etat.indic ? `<p class="champ__aide" style="margin-top:var(--s3)">
        Marnage du jour <b>${etat.indic.marnage} m</b> (${esc(etat.indic.regime)}) ·
        plus basse mer à <b>${etat.indic.plusBasse} m</b>${etat.indic.platierDecouvert
          ? " — les platiers seront largement découverts" : ""}.
        Les deux basses mers du jour n'ont pas la même hauteur : c'est l'inégalité diurne,
        propre à Mayotte.</p>` : ""}
      ${(() => { const r = MAREES.remontee(new Date(), 2);
        return r ? note("attention", `<b>Pêche à pied :</b> deux heures après la basse mer de
          ${esc(r.basseMer.heure)}, l'eau sera déjà remontée de <b>${r.gagne} cm</b>.
          C'est ce chiffre-là qui compte, pas l'heure de l'étale.`, "vagues") : ""; })()}
      ${note("attention", `Prédiction <b>astronomique</b> : elle ignore la météo, et une dépression
        ou un vent d'afflux peut faire monter l'eau au-delà. Avant une sortie bateau, un îlot ou une
        marche sur le platier, vérifiez
        <a href="https://maree.shom.fr/harbor/DZAOUDZI" target="_blank" rel="noopener">l'annuaire du
        Shom</a>.`, "alerte")}
    </div>
  </section>

  ${evJour.length ? `
  <section class="section">
    <h2 class="section__titre">En ce moment sur l'île</h2>
    <div class="rangs">
      ${evJour.map(e => `
        <${e.lien ? "button" : "div"} class="rang${e.lien ? "" : " etape--fixe"}"
          ${e.lien ? `data-action="aller" data-route="/lieu/${e.lien}"` : ""}>
          <span class="rang__cle">${e.type === "recurrent" ? cap(JOURS[e.jour]) : "En cours"}</span>
          <span class="rang__val">${esc(e.nom)}<small>${esc(e.texte)}</small></span>
        </${e.lien ? "button" : "div"}>`).join("")}
    </div>
  </section>` : ""}

  <section class="section">
    <h2 class="section__titre">Par envie</h2>
    <div class="tuiles">
      ${CATEGORIES.map(c => {
        const n = LIEUX.filter(l => l.cat === c.id).length;
        return `<button class="tuile" data-action="aller" data-route="/explorer?cat=${c.id}">
          <span class="tuile__icone" aria-hidden="true">${ico(c.ico)}</span>
          <span class="tuile__nom">${esc(c.nom)}</span>
          ${c.sh ? `<span class="tuile__sh" lang="swb">${esc(c.sh)}</span>` : ""}
          <span class="tuile__nb">${n} fiche${n > 1 ? "s" : ""}</span>
        </button>`;
      }).join("")}
    </div>
  </section>

  <section class="section">
    <h2 class="section__titre">Avant de partir</h2>
    <div class="rangs">
      <button class="rang" data-action="aller" data-route="/infos">
        <span class="rang__cle">Pratique</span>
        <span class="rang__val">Infos essentielles<small>Transports, argent, santé, sécurité, usages, marées</small></span>
      </button>
      <button class="rang" data-action="aller" data-route="/lexique">
        <span class="rang__cle">Shimaoré</span>
        <span class="rang__val">Parler à l'accueil<small>Vingt mots qui changent tout</small></span>
      </button>
      <button class="rang" data-action="aller" data-route="/agenda">
        <span class="rang__cle">L'année</span>
        <span class="rang__val">Le calendrier mahorais<small>Baleines, mariages, mangues, saison des pluies</small></span>
      </button>
      <button class="rang" data-action="aller" data-route="/apropos">
        <span class="rang__cle">À propos</span>
        <span class="rang__val">D'où vient l'information<small>Sources, limites, comment signaler une erreur</small></span>
      </button>
    </div>
  </section>
  ${pied()}`;
}

/* score de pertinence d'une fiche à un instant donné */
/* Le calcul de marée somme 28 ondes par minute de la journée. Le refaire à
   chaque rendu, c'est ~125 000 cosinus sur le fil principal d'un téléphone
   d'entrée de gamme. On le garde en mémoire pour la journée en cours. */
/* Le soleil du jour, calculé une fois : classer() l'interroge pour chacune des
   43 fiches, et journee() enchaîne dix résolutions d'événement. */
const _cacheSoleil = { cle: "", v: null };
function jourSolaire(date) {
  const d = date || new Date();
  const L = SOLEIL.local(d), cle = `${L.a}-${L.m}-${L.j}`;
  if (_cacheSoleil.cle !== cle) { _cacheSoleil.cle = cle; _cacheSoleil.v = SOLEIL.journee(d); }
  return _cacheSoleil.v;
}

const _cacheMaree = new Map();
function mareeDuJour() {
  const L = MAREES.local(new Date());
  const cle = `${L.annee}-${L.mois}-${L.jour}`;
  if (!_cacheMaree.has(cle)) {
    _cacheMaree.set(cle, { profil: MAREES.profil(new Date()) });
    if (_cacheMaree.size > 3) _cacheMaree.delete(_cacheMaree.keys().next().value);
  }
  return _cacheMaree.get(cle);
}

function classer(liste, now, soir) {
  const mois = now.getMonth() + 1, h = now.getHours();
  const etat = MAREES.etatMaintenant(new Date());
  return liste
    .filter(l => enSaison(l, mois) && l.cat !== "pratique")
    .map(l => {
      let s = 0;
      if (!soir) {
        if (l.maree && etat.proche === l.maree) s += 5;
        else if (l.maree && etat.proche && etat.proche !== l.maree) s -= 4;
      }
      if (l.saison.includes(mois)) s += 3;
      const href = soir ? 7 : h;
      if (href < 9 && /matin|aube|lever/i.test(l.quand)) s += 3;
      // L'heure dorée dure ici 28 à 31 minutes, pas une heure : on la calcule.
      if (!soir && h * 60 >= jourSolaire().doreeDebut - 90 &&
          /coucher|fin d'après-midi|soir/i.test(l.quand)) s += 3;
      // Ce qu'il reste de jour utile, au crépuscule civil et non à « 18 h ».
      const restant = soir ? 11 : Math.max(0, jourSolaire().civil / 60 - h);
      if (l.duree > restant) s -= 6;
      if (favoris.includes(l.id)) s += 2;
      s += (UI.graine(l.id + now.getDate()) % 100) / 100;   // rotation douce d'un jour à l'autre
      return { l, s };
    })
    .sort((a, b) => b.s - a.s)
    .map(x => x.l);
}

function actifMaintenant(e, now) {
  const m = now.getMonth() + 1;
  if (e.type === "recurrent") return e.jour === now.getDay();
  if (e.type === "saison") return e.debut <= e.fin ? (m >= e.debut && m <= e.fin) : (m >= e.debut || m <= e.fin);
  return false;
}

/* -------------------------------------------------------- 5. VUE : EXPLORER */

/* La liste des lieux qui passent les filtres et la recherche, CLASSÉE.

   La règle de pondération est le cœur du sujet : quand une intention a mordu,
   les mots libres restants ne pèsent qu'un quart. Sans elle, « une rando pas
   trop dure avec les enfants » remonte « Le voulé du samedi soir » en tête,
   parce que le mot rare « dure » figure dans sa description et que sa
   contribution BM25 écrase le bonus de catégorie. */
function listeFiltree() {
  const dur = l => {
    if (filtres.cat && l.cat !== filtres.cat) return false;
    if (filtres.zone && l.zone !== filtres.zone) return false;
    if (filtres.budget === "gratuit" && l.budget !== 0) return false;
    if (filtres.tag && !l.tags.includes(filtres.tag)) return false;
    return true;
  };
  const base = LIEUX.filter(dur);
  const q = (filtres.q || "").trim();
  if (!q) return base;

  const it = INTENTIONS.lire(q);
  const f = it.filtres;
  const etatMaree = f.maree ? MAREES.etatMaintenant(new Date()) : null;

  const passe = l => {
    if (f.tags && !f.tags.every(t => l.tags.includes(t))) return false;
    if (f.zone && l.zone !== f.zone) return false;
    if (f.budget !== undefined && l.budget !== f.budget) return false;
    if (f.budgetMax !== undefined && l.budget > f.budgetMax) return false;
    if (f.budgetMin !== undefined && l.budget < f.budgetMin) return false;
    if (f.reservable && !l.presta.length) return false;
    if (f.dureeMax !== undefined && l.duree > f.dureeMax) return false;
    if (f.dureeMin !== undefined && l.duree < f.dureeMin) return false;
    if (f.maree && l.maree && l.maree !== f.maree) return false;
    if (f.saison && l.saison.length && !l.saison.includes(maintenant().getMonth() + 1)) return false;
    return true;
  };
  let candidats = base.filter(passe);
  /* Un filtre qui ne laisse rien vaut mieux desserré que vide : on retire la
     contrainte de tags, la plus sévère, plutôt que de rendre un écran blanc. */
  if (!candidats.length && f.tags) {
    candidats = base.filter(l => f.tags.some(t => l.tags.includes(t)));
  }
  if (!candidats.length) candidats = base;

  const requete = [it.reste, ...it.mots].filter(Boolean).join(" ");
  const brut = requete ? RECHERCHE.bm25(requete, LIEUX) : new Map();
  const haut = Math.max(1e-9, ...[...brut.values()]);
  const aRegle = it.touches.length > 0;

  return candidats
    .map(l => {
      const bn = (brut.get(l.id) || 0) / haut;
      let s = (aRegle ? 0.25 : 1) * bn;
      if (it.bonus.cat === l.cat) s += 0.30;
      if (it.bonus.nord && l.gps[0] > -12.78) s += 0.15;
      if (it.bonus.sud && l.gps[0] < -12.85) s += 0.15;
      if (etatMaree && l.maree && etatMaree.proche === l.maree) s += 0.35;
      s += (l.vedette || 0) * 0.02;              // départage les ex æquo
      return { l, s };
    })
    .sort((a, b) => b.s - a.s || LIEUX.indexOf(a.l) - LIEUX.indexOf(b.l))
    .map(x => x.l);
}

/* Mise à jour SANS reconstruire la page.
   Reconstruire tout #vue remettrait les rangées de puces à zéro : la puce qu'on
   vient d'activer sortirait de l'écran par la droite, et l'utilisateur — en plein
   soleil — la retoucherait pour la désactiver. On met donc à jour les puces sur
   place et on ne remplace que la grille et le compteur. */
function majListe() {
  const grille = $(".grille");
  if (!grille) return rendre(true);          // on n'est pas sur Explorer

  $$(".filtre").forEach(b => {
    const c = b.dataset.champ, v = b.dataset.val;
    b.setAttribute("aria-pressed", String(v ? filtres[c] === v : !filtres[c]));
  });

  const liste = listeFiltree();
  grille.innerHTML = liste.map(carteLieu).join("");
  grille.classList.toggle("grille--vide", !liste.length);

  const compteur = $(".oeil");
  if (compteur) compteur.textContent = `${liste.length} sur ${LIEUX.length}`;

  const actifs = ["cat","zone","budget","tag"].filter(k => filtres[k]).length + (filtres.q ? 1 : 0);
  const reset = $("[data-action='reset-filtres']");
  if (reset) {
    reset.hidden = !actifs;
    if (actifs) reset.innerHTML = `${ico("croix")} Enlever les filtres (${actifs})`;
  }

  /* L'état des filtres devient partageable et survit au rechargement, sans
     empiler d'entrée dans l'historique (sinon le bouton retour ferait défiler
     les filtres un par un). */
  const qs = ["cat","zone","budget","tag"].filter(k => filtres[k])
    .map(k => k + "=" + encodeURIComponent(filtres[k])).join("&");
  history.replaceState(history.state, "", "#/explorer" + (qs ? "?" + qs : ""));

  annoncer(`${liste.length} proposition${liste.length > 1 ? "s" : ""}.`);
}

function vueExplorer(params) {
  /* On ne lit les paramètres d'URL qu'en ARRIVANT sur Explorer. Les relire à
     chaque rendu réimposerait la catégorie et rendrait les puces inopérantes :
     on toucherait « Tout » sans effet, et il n'y aurait aucune sortie visible. */
  if (!derniereRoute.startsWith("/explorer")) {
    filtres.cat    = params.get("cat")    || filtres.cat;
    filtres.zone   = params.get("zone")   || filtres.zone;
    filtres.budget = params.get("budget") || filtres.budget;
    filtres.tag    = params.get("tag")    || filtres.tag;
  }
  const now = maintenant(), mois = now.getMonth() + 1;

  const liste = listeFiltree();

  const horsSaison = liste.filter(l => !enSaison(l, mois)).length;
  const actifs = ["cat","zone","budget","tag"].filter(k => filtres[k]).length + (filtres.q ? 1 : 0);

  /* `html` : le libellé contient déjà une icône SVG, on ne l'échappe pas. */
  const bouton = (label, champ, val, html) => `
    <button class="filtre" data-action="filtre" data-champ="${champ}" data-val="${val}"
      aria-pressed="${filtres[champ] === val}">${html ? label : esc(label)}</button>`;

  return `
  <section class="section">
    <h2 class="section__titre">Explorer
      <span class="oeil">${liste.length} sur ${LIEUX.length}</span></h2>
    ${filtres.q ? `<p class="section__note">Recherche : « ${esc(filtres.q)} »</p>` : ""}
  </section>

  <div class="filtres" role="group" aria-label="Filtrer par catégorie">
    <button class="filtre" data-action="filtre" data-champ="cat" data-val=""
      aria-pressed="${!filtres.cat}">Tout</button>
    ${CATEGORIES.map(c => bouton(ico(c.ico) + " " + c.nom, "cat", c.id, true)).join("")}
  </div>
  <div class="filtres" role="group" aria-label="Autres filtres">
    ${bouton("Grande-Terre", "zone", "grande-terre")}
    ${bouton("Petite-Terre", "zone", "petite-terre")}
    ${bouton("Lagon", "zone", "lagon")}
    ${bouton("Gratuit", "budget", "gratuit")}
    ${bouton("Avec enfants", "tag", "famille")}
    ${bouton("Sans voiture", "tag", "sansVoiture")}
    ${bouton("Sportif", "tag", "sportif")}
    ${bouton("Il pleut", "tag", "pluie")}
    ${bouton("À l'ombre", "tag", "ombre")}
  </div>
  <button class="btn btn--discret" data-action="reset-filtres" ${actifs ? "" : "hidden"}>
    ${ico("croix")} Enlever les filtres (${actifs})</button>

  ${filtres.q && liste.length ? (() => {
      const it = INTENTIONS.lire(filtres.q);
      return it.touches.length ? `<p class="section__note lu-comme">${ico("valide")}
        Lu comme : ${it.touches.map(t => `<b>${esc(t)}</b>`).join(" + ")}</p>` : "";
    })() : ""}

  ${liste.length ? `<div class="grille" style="margin-top:var(--s3)">${liste.map(carteLieu).join("")}</div>`
    : `<div class="vide">${ico("loupe")}
       <p>Rien avec ces filtres.<br>Essayez d'en enlever un.</p>
       <button class="btn btn--secondaire" data-action="reset-filtres">Tout réafficher</button></div>`}

  ${!filtres.q && !actifs ? `
  <section class="section">
    <h2 class="section__titre">On cherche quoi ?</h2>
    <p class="section__note">Tapez comme vous parlez : l'application comprend.</p>
    <div class="filtres filtres--suggestions">
      ${["que faire quand il pleut", "avec les enfants sans voiture", "où voir des tortues",
         "une rando pas trop dure", "gratuit ce week-end", "pêche à pied"]
        .map(q => `<button class="filtre" data-action="suggestion" data-q="${attr(q)}">
          ${ico("loupe")} ${esc(q)}</button>`).join("")}
    </div>
  </section>` : ""}

  ${horsSaison ? `<p class="section__note" style="margin-top:var(--s4)">
    ${horsSaison} proposition${horsSaison > 1 ? "s" : ""} ${horsSaison > 1 ? "sont" : "est"} hors
    de sa meilleure saison en ${MOIS[mois - 1]} : la fiche vous le dira.</p>` : ""}
  ${pied()}`;
}


/* ------------------------------------------------------------ VUE : CARTE
   L'île entière, dessinée hors ligne. Toucher un point ouvre un aperçu en bas
   d'écran ; le toucher à nouveau ouvre la fiche. L'attribution OpenStreetMap
   est affichée en permanence : c'est une obligation de l'ODbL. */
let carteSel = null;

function vueCarte(params) {
  if (params.get("lieu")) carteSel = params.get("lieu");
  const catActive = params.get("cat") || filtres.cat;
  const liste = catActive ? LIEUX.filter(l => l.cat === catActive) : LIEUX;
  const sel = carteSel && liste.find(l => l.id === carteSel) ? lieu(carteSel) : null;

  return `
  <section class="section section--serree">
    <h2 class="section__titre">La carte</h2>
    <p class="section__note">${liste.length} lieu${liste.length > 1 ? "x" : ""} sur l'île.
      Touchez un point pour l'aperçu.</p>
  </section>

  <div class="filtres" role="group" aria-label="Filtrer la carte par catégorie">
    <button class="filtre" data-action="carte-cat" data-val=""
      aria-pressed="${!catActive}">Tout</button>
    ${CATEGORIES.map(c => `<button class="filtre" data-action="carte-cat" data-val="${c.id}"
      aria-pressed="${catActive === c.id}">${ico(c.ico)} ${esc(c.nom)}</button>`).join("")}
  </div>

  <div class="carte-cadre">
    ${CarteVue.rendre(liste, { selection: sel ? sel.id : null })}
    <div class="carte__cmd">
      <button class="icone-btn" data-action="carte-zoom" data-f="1.6" aria-label="Zoomer">${ico("plus")}</button>
      <button class="icone-btn" data-action="carte-zoom" data-f="0.625" aria-label="Dézoomer">${ico("moins")}</button>
      <button class="icone-btn" data-action="carte-moi" aria-label="Me situer sur la carte">${ico("epingle")}</button>
      <button class="icone-btn" data-action="carte-recadrer" aria-label="Voir toute l'île">${ico("boussole")}</button>
    </div>
    <p class="carte__credit">Fond de carte : contours IGN ·
      récif © les contributeurs d'<a href="https://www.openstreetmap.org/copyright"
      target="_blank" rel="noopener">OpenStreetMap</a></p>
  </div>

  ${sel ? `
  <div class="carte-apercu apparait">
    <div class="carte-apercu__art">${UI.illustration(sel.id, sel.cat, { indice: sel.nom + " " + sel.resume })}</div>
    <div class="carte-apercu__txt">
      <h3>${esc(sel.nom)}</h3>
      <p>${ico("epingle")} ${esc(sel.commune)}</p>
      <p class="carte-apercu__res">${esc(sel.resume)}</p>
    </div>
    <button class="btn" data-action="aller" data-route="/lieu/${sel.id}">Ouvrir la fiche</button>
  </div>` : `
  <p class="section__note" style="text-align:center;margin-top:var(--s4)">
    Aucun lieu sélectionné.</p>`}
  ${pied()}`;
}

/* ------------------------------------------------------------ 6. VUE : FICHE */
function vueLieu(id) {
  const l = lieu(id);
  if (!l) return vueIntrouvable();
  const c = cat(l.cat);
  const now = maintenant(), mois = now.getMonth() + 1;
  const hDec = now.getHours() + now.getMinutes() / 60;
  const etat = MAREES.etatMaintenant(new Date());
  const saisonOk = enSaison(l, mois);
  const mareeOk = !l.maree || etat.proche === l.maree;
  /* etat.evts ne contient que les étales DU JOUR : le soir, la dernière est
     passée et la fiche n'affichait plus aucune heure. On regarde alors demain. */
  let prochaineBonne = l.maree ? etat.evts.find(e => e.type === l.maree && e.brut > hDec) : null;
  let demain = false;
  if (l.maree && !prochaineBonne) {
    const ev = MAREES.duJour(new Date(Date.now() + 864e5)).find(e => e.type === l.maree);
    if (ev) { prochaineBonne = ev; demain = true; }
  }
  /* La fenêtre utile est de ± 1 h 30 autour de l'étale — c'est ce que dessine la
     courbe en vert. Annoncer une heure à la minute laisserait croire à un
     rendez-vous qui n'existe pas. */
  const creneau = prochaineBonne
    ? `${MAREES.fmt((prochaineBonne.brut - 1.5 + 24) % 24)} → ${MAREES.fmt((prochaineBonne.brut + 1.5) % 24)}`
    : null;
  const fav = favoris.includes(l.id);

  /* La ligne de verdict : la seule chose qu'on veut lire sans défiler. */
  const verdict = !saisonOk
      ? { t: `Pas la saison — à privilégier en ${l.saison.map(m => MOIS[m-1]).join(", ")}`, k: "attention" }
    : l.maree && !mareeOk
      ? { t: creneau ? `Pas maintenant — créneau ${demain ? "demain" : "aujourd'hui"} ${creneau}`
                     : `Pas maintenant — marée ${esc(etat.sens)}`, k: "attention" }
    : l.etat === "ferme" ? { t: "Fermé actuellement", k: "danger" }
    : { t: "On peut y aller maintenant", k: "ok" };

  return `
  <button class="retour" data-action="retour">${ico("fleche")} Retour</button>

  <article class="fiche">
    <header class="fiche__entete">
      <div class="fiche__art">${UI.illustration(l.id, l.cat, { haut: true, prioritaire: true, indice: l.nom + " " + l.resume })}</div>
      <span class="fiche__cat">${ico(c.ico)} ${esc(c.nom)}</span>
    </header>
    <h1 class="fiche__titre">${esc(l.nom)}</h1>
    <p class="fiche__sous">${ico("epingle")} ${esc(l.commune)} · ${esc(zoneNom(l.zone))}</p>

    <div class="fiche__puces">
      <span class="puce">${dureeTxt(l.duree)}</span>
      <span class="puce">${euroC(l.budget)}</span>
      ${l.maree ? `<span class="puce puce--maree">marée ${l.maree}</span>` : ""}
      ${l.tags.includes("famille")     ? `<span class="puce puce--ok">famille</span>` : ""}
      ${l.tags.includes("sansVoiture") ? `<span class="puce">sans voiture</span>` : ""}
      ${l.tags.includes("sportif")     ? `<span class="puce">sportif</span>` : ""}
      ${l.presta.length ? `<span class="puce puce--or">réservable</span>` : ""}
    </div>

    <p class="verdict verdict--${verdict.k}">${ico(verdict.k === "ok" ? "valide" : "alerte")}
      ${esc(verdict.t)}</p>

    ${l.etat && l.etat !== "ouvert" && ETATS[l.etat] ? note(l.etat === "ferme" ? "danger" : "attention",
      `<b>${esc(ETATS[l.etat].txt)}</b>${l.verifie ? ` — relevé le ${dateFr(l.verifie)}` : ""}.
       Confirmez par téléphone avant de faire la route.`, "alerte") : ""}

    <div class="bloc"><p>${esc(l.texte)}</p></div>

    <div class="bloc">
      <h2 class="bloc__titre">${ico("horloge")} Quand y aller</h2>
      <p>${esc(l.quand)}</p>
      ${UI.saison(l.saison, mois)}
      <p class="champ__aide" style="margin-top:var(--s2)">
        ${l.saison.length ? "Mois surlignés : la meilleure période." : "Intéressant toute l'année."}
        Le mois en cours est encadré.</p>
    </div>

    ${l.maree ? `
    <div class="bloc">
      <h2 class="bloc__titre">${ico("vagues")} La marée aujourd'hui</h2>
      ${UI.courbeMaree(etat.evts, hDec, l.maree, mareeDuJour().profil)}
      <p class="champ__aide">Les zones vertes sont les créneaux favorables (± 1 h 30 autour de la
        marée ${l.maree}). Hauteurs en mètres au-dessus du zéro des cartes marines.
        ${etat.indic ? `Marnage du jour : <b>${etat.indic.marnage} m</b> (${esc(etat.indic.regime)}).` : ""}</p>
    </div>` : ""}

    <div class="bloc">
      <h2 class="bloc__titre">${ico("etoile")} Ce que les gens d'ici disent</h2>
      <ul class="liste-conseils">${l.conseils.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    </div>

    <div class="bloc">
      <h2 class="bloc__titre">${ico("message")} Réserver</h2>
      ${l.presta.length ? `
        ${l.presta.map(pid => {
          const p = presta(pid); if (!p) return "";
          return `<div style="margin-bottom:var(--s3)">
            <div style="display:flex;gap:var(--s2);align-items:center;flex-wrap:wrap">
              <b>${esc(p.nom)}</b>
              <span class="puce">${esc(p.type)}</span>
              ${p.verifie ? `<span class="puce puce--ok">contact vérifié</span>`
                          : `<span class="puce puce--alerte">contact à confirmer</span>`}
            </div>
            <p class="champ__aide">${esc(p.offre)}</p>
          </div>`;
        }).join("")}
        <button class="btn" data-action="aller" data-route="/resa/${l.id}">
          ${ico("message")} Préparer une demande</button>`
      : `<p class="champ__aide" style="margin:0">Rien à réserver : c'est libre et gratuit.
         Il suffit d'y aller — en respectant les conseils ci-dessus.</p>`}
    </div>

    ${l.tags.includes("soir") ? blocNuit() : ""}

    ${/* Le soleil ne se rappelle qu'aux fiches où l'on reste dehors sans
          ombre : plage, lagon, sentier. Le mettre partout le rendrait
          invisible, ce qui est la manière la plus sûre de ne pas prévenir. */
      ["plage", "mer"].includes(l.cat) || l.tags.includes("sportif")
        ? blocUV(true) : ""}

    ${l.cat !== "pratique" ? blocSecours() : ""}

    ${blocSources(l)}

    <div class="btns">
      <a class="btn btn--secondaire" href="${mapLien(l)}" target="_blank" rel="noopener">
        ${ico("epingle")} Ouvrir dans le plan ${ico("sortir")}</a>
      <button class="btn btn--secondaire" data-action="favori" data-id="${l.id}" aria-pressed="${fav}">
        ${ico("coeur")} ${fav ? "Retirer de mon carnet" : "Ajouter à mon carnet"}</button>
      <button class="btn btn--secondaire" data-action="partager" data-id="${l.id}">
        ${ico("partager")} Partager</button>
      <button class="btn btn--discret" data-action="signaler" data-id="${l.id}">
        ${ico("drapeau")} Signaler une erreur ou une fermeture</button>
    </div>
  </article>
  ${pied()}`;
}

const zoneNom = z => ({ "grande-terre": "Grande-Terre", "petite-terre": "Petite-Terre", "lagon": "Dans le lagon" }[z] || z);

/* Traçabilité : une fiche peut porter ses sources et sa date de vérification.
   Une information touristique à Mayotte vieillit vite — depuis Chido, un lieu
   peut avoir fermé entre deux séjours. Dire d'où vient l'info et quand elle a
   été vérifiée vaut mieux que de la présenter comme intemporelle. */
const ETATS = {
  ouvert:       { txt: "Ouvert",              cls: "puce--ok" },
  "a-confirmer":{ txt: "État à confirmer",    cls: "puce--alerte" },
  ferme:        { txt: "Fermé actuellement",  cls: "puce--alerte" },
  modifie:      { txt: "Accès modifié",       cls: "puce--or" }
};

function blocSources(l) {
  if (!l.sources?.length && !l.verifie) return "";
  const d = l.verifie ? new Date(l.verifie + "T12:00:00") : null;
  return `<div class="bloc">
    <h2 class="bloc__titre">${ico("livre")} D'où vient cette information</h2>
    ${d && !isNaN(d) ? `<p class="champ__aide" style="margin-top:0">
      Dernière vérification le ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}.
      ${l.etat && ETATS[l.etat] ? `État relevé : <b>${esc(ETATS[l.etat].txt.toLowerCase())}</b>.` : ""}</p>` : ""}
    ${l.sources?.length ? `<ul class="liste-conseils">
      ${l.sources.map(s => `<li><a href="${esc(s.u)}" target="_blank" rel="noopener">
        ${esc(s.t)} ${ico("sortir")}</a></li>`).join("")}
    </ul>` : ""}
    <p class="champ__aide">Une information périmée ? ${
      `<button class="btn btn--discret" style="width:auto;display:inline-flex;min-height:0;padding:.15rem .3rem"
        data-action="signaler" data-id="${l.id}">signalez-la</button>`}</p>
  </div>`;
}

/* -------------------------------------------------- 7. VUE : RÉSERVATION */
function vueResa(id) {
  const l = lieu(id);
  if (!l) return vueIntrouvable();
  const now = maintenant();
  const demain = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  return `
  <button class="retour" data-action="retour">${ico("fleche")} Retour</button>
  <section class="section">
    <h2 class="section__titre">Préparer une demande</h2>
    <p class="section__note">${esc(l.nom)} · ${esc(l.commune)}</p>
  </section>

  <div class="bloc">
    ${!l.presta.length ? note("attention",
      `Aucun prestataire n'est encore référencé pour cette activité. Votre message partira
       à la rédaction de l'application, qui vous orientera.`, "info") : ""}
    <div class="champ" ${!l.presta.length ? 'hidden' : ''}>
      <label for="r-presta">Prestataire</label>
      <select id="r-presta">
        ${l.presta.map(pid => { const p = presta(pid); return p
          ? `<option value="${p.id}">${esc(p.nom)}${p.verifie ? "" : " — contact à confirmer"}</option>` : ""; }).join("")}
      </select>
    </div>
    <div class="champ"><label for="r-date">Date souhaitée</label>
      <input id="r-date" type="date" value="${demain}"></div>
    <div class="champ"><label for="r-nb">Nombre de personnes</label>
      <input id="r-nb" type="number" min="1" max="60" value="2"></div>
    <div class="champ"><label for="r-nom">Votre nom</label>
      <input id="r-nom" type="text" placeholder="Prénom Nom" autocomplete="name"></div>
    <div class="champ"><label for="r-msg">Précisions (facultatif)</label>
      <textarea id="r-msg" placeholder="Enfants de 6 et 9 ans, on loge à Mamoudzou, souples sur l'horaire…"></textarea></div>

    <div class="btns">
      <button class="btn btn--wa" data-action="resa" data-mode="wa" data-id="${l.id}">
        ${ico("message")} Ouvrir WhatsApp avec le message</button>
      <button class="btn btn--secondaire" data-action="resa" data-mode="copie" data-id="${l.id}">
        ${ico("copie")} Copier le message</button>
    </div>

    ${note("ok", `Rien ne part vers un serveur : le message est simplement rédigé pour vous, puis
      envoyé depuis votre propre WhatsApp. La demande est notée dans votre carnet, sur cet appareil.`,
      "valide")}
    ${l.maree ? note("attention", `Cette sortie dépend de la marée ${l.maree} : c'est le prestataire
      qui fixera l'heure. Le message le précise déjà.`, "vagues") : ""}
  </div>
  ${pied()}`;
}

function messageResa(l) {
  const p = presta($("#r-presta")?.value);
  const date = $("#r-date")?.value || "";
  const nb   = $("#r-nb")?.value || "1";
  const nom  = ($("#r-nom")?.value || "").trim();
  const msg  = ($("#r-msg")?.value || "").trim();
  const d = date ? new Date(date + "T12:00:00") : null;
  const dateFr = d && !isNaN(d) ? `${d.getDate()} ${MOIS[d.getMonth()]}` : "(date à préciser)";

  let t = `Bonjour, je vous contacte via l'application Karibu Maoré.\n\n`;
  t += `Je souhaiterais réserver : ${l.nom}\n`;
  t += `Date souhaitée : ${dateFr}\n`;
  t += `Nombre de personnes : ${nb}\n`;
  if (nom) t += `Nom : ${nom}\n`;
  if (msg) t += `\n${msg}\n`;
  if (l.maree) t += `\n(Je sais que cette sortie dépend de la marée ${l.maree} : je m'adapte à l'horaire que vous proposerez.)\n`;
  t += `\nMerci d'avance. Marahaba !`;
  return { texte: t, p, dateFr, nb };
}

async function envoyerResa(id, mode) {
  const l = lieu(id);
  const { texte, p, dateFr, nb } = messageResa(l);

  demandes = [{ id: Date.now(), lieu: l.id, presta: p ? p.id : null, date: dateFr, nb, etat: "préparée" }, ...demandes].slice(0, 40);
  Store.set("demandes", demandes);

  if (mode === "copie") {
    try { await navigator.clipboard.writeText(texte); annoncer("Message copié.");
          feuille({ titre: "Message copié", texte: "Collez-le dans WhatsApp, un SMS ou un mail.", texteLong: texte }); }
    catch { feuille({ titre: "Votre message", texteLong: texte }); }
    return go("/carnet");
  }
  const direct = p && p.verifie && p.tel;
  const numero = direct ? p.tel : APP.contactWhatsApp;
  const entete = direct ? "" :
    `[Le contact direct de ce prestataire n'est pas encore vérifié dans l'application — message adressé à la rédaction de Karibu Maoré.]\n\n`;
  ouvrirWhatsApp(numero, entete + texte);
  go("/carnet");
}

/* ------------------------------------------------------ 8. VUE : JOURNÉES */
function vueItineraires() {
  return `
  <section class="section">
    <h2 class="section__titre">Journées toutes prêtes</h2>
    <p class="section__note">Des enchaînements qui tiennent debout : distances réalistes,
      marées cohérentes, et de l'ombre au bon moment.</p>
  </section>
  <div class="grille">
    ${ITINERAIRES.map(i => `
      <article class="fiche-carte">
        <div class="fiche-carte__art">${UI.vignette(i.id, categorieItineraire(i), { indice: i.nom })}
          <span class="fiche-carte__cat">${ico(i.ico || "carte")} ${esc(i.duree)}</span></div>
        <div class="fiche-carte__corps">
          <h3 class="fiche-carte__titre"><button class="fiche-carte__lien"
            data-action="aller" data-route="/itineraire/${i.id}">${esc(i.nom)}</button></h3>
          <p class="fiche-carte__res">${esc(i.pour)}</p>
          <div class="fiche-carte__meta">
            <span class="puce">${i.etapes.length} étapes</span>
            <span class="puce">${esc(i.duree)}</span>
          </div>
        </div>
      </article>`).join("")}
  </div>
  ${pied()}`;
}

function categorieItineraire(i) {
  const cats = i.etapes.map(e => lieu(e.lieu)?.cat).filter(Boolean);
  return cats.sort((a, b) =>
    cats.filter(c => c === b).length - cats.filter(c => c === a).length)[0] || "pratique";
}

function vueItineraire(id) {
  const i = ITINERAIRES.find(x => x.id === id);
  if (!i) return vueIntrouvable();
  const total = i.etapes.reduce((n, e) => n + (lieu(e.lieu)?.duree || 0), 0);
  return `
  <button class="retour" data-action="retour">${ico("fleche")} Retour</button>
  <section class="section">
    <h2 class="section__titre">${esc(i.nom)}</h2>
    <p class="section__note">${esc(i.pour)} · ${esc(i.duree)}${total ? ` · environ ${total} h d'activités` : ""}</p>
  </section>
  <div class="bloc">
    <div class="parcours">
      ${i.etapes.map(e => {
        const l = lieu(e.lieu);
        return `<${l ? "button" : "div"} class="etape${l ? "" : " etape--fixe"}"
          ${l ? `data-action="aller" data-route="/lieu/${l.id}"` : ""}>
          <span class="etape__h">${esc(e.h)}</span>
          <span class="etape__quoi">${esc(e.quoi)}</span>
          ${l ? `<span class="etape__ou">${ico("epingle")} ${esc(l.nom)} · ${esc(l.commune)}</span>` : ""}
        </${l ? "button" : "div"}>`;
      }).join("")}
    </div>
  </div>
  ${note("attention", `<b>Le conseil de l'itinéraire :</b> ${esc(i.note)}`, "info")}
  <button class="btn btn--secondaire" data-action="ajouter-itineraire" data-id="${i.id}">
    ${ico("coeur")} Ajouter toutes les étapes à mon carnet</button>
  ${pied()}`;
}

/* -------------------------------------------------------- 9. VUE : AGENDA */
function vueAgenda() {
  /* Une date figée dans le code devient un mensonge le jour où elle passe.
     Tout événement portant `perime` disparaît de lui-même à cette date : si
     personne ne met l'application à jour pendant deux ans, elle se taira au
     lieu d'annoncer un festival qui n'a plus lieu. */
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const vivant = e => !e.perime || e.perime >= aujourdhui;
  const now = maintenant(), mois = now.getMonth() + 1;
  const periode = e => e.type === "recurrent" ? "Chaque " + JOURS[e.jour]
    : e.type === "saison" ? `${cap(MOIS[e.debut - 1])} → ${MOIS[e.fin - 1]}` : esc(e.date);
  const tri = EVENEMENTS.filter(vivant).sort((a, b) => (actifMaintenant(b, now) ? 1 : 0) - (actifMaintenant(a, now) ? 1 : 0));

  return `
  <section class="section">
    <h2 class="section__titre">L'année mahoraise</h2>
    <p class="section__note">Ce qui rythme l'île : les saisons, les marchés, les mariages,
      les baleines. On est en ${MOIS[mois - 1]}.</p>
  </section>
  <div class="grille">
    ${tri.map(e => {
      const encours = actifMaintenant(e, now);
      return `<article class="fiche-carte">
        <div class="fiche-carte__art">${UI.vignette(e.id, e.lien ? (lieu(e.lien)?.cat || "pratique") : "pratique", { indice: e.nom })}
          <span class="fiche-carte__cat">${esc(periode(e))}</span></div>
        <div class="fiche-carte__corps">
          <h3 class="fiche-carte__titre">${e.lien
            ? `<button class="fiche-carte__lien" data-action="aller" data-route="/lieu/${e.lien}">${esc(e.nom)}</button>`
            : esc(e.nom)}</h3>
          <p class="fiche-carte__lieu">${ico("epingle")} ${esc(e.lieu)}${e.heure ? " · " + esc(e.heure) : ""}</p>
          <p class="fiche-carte__res">${esc(e.texte)}</p>
          <div class="fiche-carte__meta">
            ${encours ? `<span class="puce puce--ok">en ce moment</span>` : `<span class="puce">à venir</span>`}
          </div>
        </div>
      </article>`;
    }).join("")}
  </div>
  ${note("attention", `Cet agenda donne les <b>rythmes</b> de l'année, pas la programmation
    des associations. Les dates précises des fêtes religieuses et des mariages se demandent
    au village ou à la mairie.`, "info")}
  ${pied()}`;
}

/* -------------------------------------------------------- 10. VUE : CARNET */
function vueCarnet() {
  const favs = favoris.map(lieu).filter(Boolean);
  const heures = favs.reduce((n, l) => n + l.duree, 0);
  return `
  <section class="section">
    <h2 class="section__titre">Mon carnet <span class="oeil">${favs.length} envie${favs.length > 1 ? "s" : ""}</span></h2>
    ${favs.length ? `<p class="section__note">Environ ${heures} h d'activités en tout.
      Tout est enregistré sur cet appareil, sans compte.</p>` : ""}
  </section>

  ${favs.length ? `<div class="grille">${favs.map(carteLieu).join("")}</div>
    <div class="btns" style="margin-top:var(--s4)">
      <button class="btn btn--secondaire" data-action="imprimer">${ico("imprimer")} Imprimer mon carnet</button>
    </div>`
    : `<div class="vide">${ico("sac")}
        <p>Votre carnet est vide.<br>Touchez le cœur sur une fiche pour l'ajouter ici.</p>
        <button class="btn btn--secondaire" data-action="aller" data-route="/explorer">Explorer les activités</button>
      </div>`}

  <section class="section">
    <h2 class="section__titre">Mes demandes</h2>
    ${demandes.length ? `<div class="rangs">
      ${demandes.map(d => { const l = lieu(d.lieu), p = d.presta ? presta(d.presta) : null;
        return `<div class="rang">
          <span class="rang__cle">${esc(d.date)}</span>
          <span class="rang__val">${l ? esc(l.nom) : "—"} · ${esc(d.nb)} pers.
            <small>${p ? esc(p.nom) : "prestataire non précisé"} — ${esc(d.etat)}</small></span>
        </div>`; }).join("")}
      </div>
      <button class="btn btn--discret" data-action="vider-demandes">${ico("croix")} Effacer l'historique</button>`
      : `<p class="section__note">Aucune demande préparée pour l'instant.</p>`}
  </section>

  <section class="section">
    <h2 class="section__titre">Vous êtes prestataire ?</h2>
    <div class="bloc">
      <p>Bateau, guide, artisan, gargote, association : votre activité peut apparaître dans
        l'application, avec votre vrai numéro et votre accord. C'est gratuit.</p>
      <button class="btn" data-action="aller" data-route="/pro">${ico("plus")} Inscrire mon activité</button>
    </div>
  </section>
  ${pied()}`;
}

/* ------------------------------------------------------- 11. VUE : PRO */
function vuePro() {
  return `
  <button class="retour" data-action="retour">${ico("fleche")} Retour</button>
  <section class="section">
    <h2 class="section__titre">Inscrire mon activité</h2>
    <p class="section__note">Gratuit. Aucune commission. Vous restez maître de votre numéro.</p>
  </section>
  <div class="bloc">
    <div class="champ"><label for="p-nom">Nom de l'activité</label><input id="p-nom" type="text"></div>
    <div class="champ"><label for="p-type">Type</label>
      <select id="p-type">
        <option>Sortie bateau</option><option>Plongée</option>
        <option>Nautique (kayak, kite, paddle)</option><option>Guide / randonnée</option>
        <option>Restauration</option><option>Artisanat</option><option>Hébergement</option>
        <option>Association culturelle</option><option>Autre</option>
      </select></div>
    <div class="champ"><label for="p-commune">Commune</label><input id="p-commune" type="text"></div>
    <div class="champ"><label for="p-tel">Numéro WhatsApp</label>
      <input id="p-tel" type="tel" placeholder="0639 XX XX XX" autocomplete="tel">
      <p class="champ__aide">Publié seulement après votre accord explicite.</p></div>
    <div class="champ"><label for="p-offre">Ce que vous proposez</label><textarea id="p-offre"></textarea></div>
    <button class="btn btn--wa" data-action="envoyer-pro">${ico("message")} Envoyer ma fiche</button>
    ${note("ok", `Ce formulaire n'envoie rien tout seul : il prépare un message que vous
      nous transmettez depuis votre propre WhatsApp.`, "valide")}
  </div>
  ${pied()}`;
}

function envoyerPro() {
  const g = i => ($("#p-" + i)?.value || "").trim();
  if (!g("nom")) { feuille({ titre: "Il manque le nom", texte: "Indiquez au moins le nom de votre activité." }); return; }
  const t = `Nouvelle inscription prestataire — Karibu Maoré\n\n` +
    `Activité : ${g("nom")}\nType : ${$("#p-type").value}\nCommune : ${g("commune")}\n` +
    `WhatsApp : ${g("tel")}\n\nOffre :\n${g("offre")}\n\n` +
    `J'accepte que ces informations soient publiées dans l'application.`;
  ouvrirWhatsApp(APP.contactWhatsApp, t);
}

/* --------------------------------------------- 12. VUES : INFOS, LEXIQUE… */
function vueInfos() {
  return `
  <section class="section">
    <h2 class="section__titre">Infos pratiques</h2>
    <p class="section__note">Le minimum à savoir avant de bouger. Chaque bloc porte ses sources ;
      les mentions « à confirmer » signalent ce que la recherche n'a pas pu établir.</p>
  </section>
  ${INFOS.map(i => `<div class="bloc">
    <h3 class="bloc__titre">${ico(i.attention ? "alerte" : "info")} ${esc(i.titre)}</h3>
    <p>${esc(i.txt)}</p>
    ${i.src?.length ? `<p class="champ__aide" style="margin-top:var(--s3)">Sources :
      ${i.src.map(s => `<a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a>`).join(" · ")}</p>` : ""}
  </div>`).join("")}
  ${pied()}`;
}

function vueSecours() {
  return `
  <button class="retour" data-action="retour">${ico("fleche")} Retour</button>
  <section class="section">
    <h2 class="section__titre">Secours et alerte</h2>
    <p class="section__note">À lire une fois, tranquillement, avant d'en avoir besoin.</p>
  </section>

  <div class="bloc">
    <h3 class="bloc__titre">${ico("alerte")} Numéros d'urgence</h3>
    <div class="rangs">
      ${SECOURS.numeros.map(n => `<a class="rang" href="tel:${esc(n.n)}">
        <span class="rang__cle" style="font-size:var(--fs-md)">${esc(n.n)}</span>
        <span class="rang__val">${esc(n.q)}</span></a>`).join("")}
    </div>
    <p class="champ__aide" style="margin-top:var(--s3)">${esc(SECOURS.note)}</p>
  </div>

  <div class="bloc">
    <h3 class="bloc__titre">${ico("vagues")} Alerte cyclonique — les cinq niveaux</h3>
    <div class="parcours">
      ${SECOURS.cyclone.map(c => `<div class="etape" style="cursor:default">
        <span class="etape__h">${esc(c.n)}</span>
        <span class="etape__quoi">${esc(c.d)}</span>
        <span class="etape__ou" style="display:block;line-height:1.5">${esc(c.t)}</span>
      </div>`).join("")}
    </div>
  </div>

  <div class="bloc">
    <h3 class="bloc__titre">${ico("info")} Séisme et tsunami</h3>
    <p>${esc(SECOURS.seisme)}</p>
  </div>

  <div class="bloc">
    <h3 class="bloc__titre">${ico("sortir")} À consulter le jour même</h3>
    <div class="btns">
      ${SECOURS.liens.map(l => `<a class="btn btn--secondaire" href="${esc(l.u)}"
        target="_blank" rel="noopener">${esc(l.t)} ${ico("sortir")}</a>`).join("")}
    </div>
  </div>

  ${note("attention", `Ces numéros sont les numéros nationaux français. Leur pertinence
    opérationnelle à Mayotte reste à faire valider auprès de la préfecture avant la mise en ligne
    publique de l'application.`, "alerte")}
  ${pied()}`;
}

/* La nuit, pour les fiches qui se vivent après le coucher du soleil.

   On annonce l'obscurité de la plage — jamais la ponte. La corrélation entre
   ponte et lune est débattue, et l'application y perdrait exactement la
   crédibilité que lui donnent ses sources de terrain. */
/* ====================== LE SOLEIL QUI BRÛLE ===============================
   L'information la plus utile de toute l'application, et la moins connue.
   Sous cette latitude l'indice UV dépasse 11 — « extrême » au sens de l'OMS —
   la moitié des jours de l'année, et il est déjà à 8 à dix heures du matin.
   Quelqu'un qui arrive de métropole applique ses réflexes de métropole et
   brûle avant le déjeuner.

   ON DIT TOUJOURS « CIEL CLAIR ». Ce nombre est un calcul de géométrie
   solaire et d'ozone, pas une mesure : un ciel couvert peut le diviser par
   deux. Présenter un calcul comme un relevé serait pire que se taire. La
   mention n'est donc jamais escamotée, même faute de place.

   RECOUPEMENT. Darwin, en Australie, est à 12,3° S — la latitude de Mayotte
   à un dixième de degré près. Les relevés de l'ARPANSA y donnent des maxima
   d'été entre 11 et 15. Le modèle rend 14,8 par ciel parfaitement clair en
   février et 8,8 en juin : l'enveloppe est la bonne, les jours nuageux
   occupant le bas de la fourchette mesurée. */
const UV_BANDES = [
  { max: 3,   nom: "faible",    fond: "#2f7d47" },
  { max: 6,   nom: "modéré",    fond: "#c4b63e" },
  { max: 8,   nom: "fort",      fond: "#d97a20" },
  { max: 11,  nom: "très fort", fond: "#b3341f" },
  { max: 16,  nom: "extrême",   fond: "#6b3fa0" }
];

function blocUV(compact = false) {
  const d = new Date();
  const h = SOLEIL.position(d).hauteur;
  const s = jourSolaire();
  const mn = SOLEIL.local(d).h * 60;

  /* TROIS SITUATIONS, ET LES CONFONDRE DONNE DES ÂNERIES. Sous l'horizon
     avant midi solaire, la journée est devant : c'est le maximum d'AUJOURD'HUI
     qui intéresse. Sous l'horizon après, elle est finie : c'est celui de
     DEMAIN. Et un soleil levé mais encore bas ne se dit pas « couché » — un
     premier jet le faisait, et l'application annonçait la nuit à 6 h 42. */
  const demain = new Date(d.getTime() + 86400000);
  const couche = h <= 0;
  const veille = couche && mn < s.midi;
  const mx = SOLEIL.uvMax(couche && !veille ? demain : d);
  const val = couche ? mx.indice : SOLEIL.uv(d).indice;
  const p = SOLEIL.uvPalier(val);

  const pos = Math.max(0, Math.min(100, val / 16 * 100));
  const largeurs = UV_BANDES.map((b, i) =>
    ((b.max - (i ? UV_BANDES[i - 1].max : 0)) / 16 * 100).toFixed(2));
  const affiche = val < 10 ? val.toFixed(1) : String(Math.round(val));
  const pic = `${mx.indice < 10 ? mx.indice.toFixed(1) : Math.round(mx.indice)} vers ${SOLEIL.min2h(SOLEIL.journee(couche && !veille ? demain : d).midi)}`;

  const titre = couche ? (veille ? "Indice UV du jour" : "Indice UV de demain") : "Indice UV";
  const phrase = veille
    ? `Le soleil se lève à ${SOLEIL.min2h(s.lever)}. Le maximum du jour atteindra <b>${pic}</b>, par ciel clair.`
    : couche
      ? `Le soleil est couché. Demain, le maximum atteindra <b>${pic}</b>, par ciel clair.`
      : p.minutes
        ? `Une peau claire non protégée rougit en <b>${p.minutes} minutes</b> environ. Maximum du jour : ${pic}.`
        : mn > s.midi
          /* L'après-midi, « le maximum SERA de » est faux : il est derrière.
             Le temps du verbe est la seule chose qui distingue une phrase
             juste d'une phrase qui trahit qu'on n'a pas regardé l'heure. */
          ? `Le soleil descend, l'ultraviolet retombe. Le maximum du jour était de ${pic}.`
          : `Le soleil est encore bas — rien à craindre dans l'immédiat. Le maximum du jour sera de ${pic}.`;

  return `
  <section class="section section--serree">
    <div class="uv uv--${p.cle}">
      <div class="uv__tete">
        <span class="uv__cle">${ico("soleil")} ${titre}</span>
        <span class="uv__mot">${p.mot}</span>
        <span class="uv__val">${affiche}</span>
      </div>
      <div class="uv__jauge" role="img"
        aria-label="Indice UV ${affiche} sur 16, niveau ${p.mot}, calculé par ciel clair">
        ${UV_BANDES.map((b, i) => `<i style="width:${largeurs[i]}%;background:${b.fond}"></i>`).join("")}
        <span class="uv__curseur" style="left:${pos.toFixed(1)}%"></span>
      </div>
      <p class="uv__dit">${phrase}</p>
      <p class="uv__clair">Calculé pour un <b>ciel clair</b> — ce n'est pas une mesure.
        Les nuages peuvent le diviser par deux, et le sable comme l'eau vous renvoient
        en plus ce qui vient d'en haut.${compact ? "" : `
        <button class="lien-nu" data-action="uv-detail">Comment c'est calculé</button>`}</p>
    </div>
  </section>`;
}

/* ======================== LE JOUR SANS OMBRE ==============================
   Deux fois l'an le soleil passe au zénith et les ombres disparaissent sous
   les pieds. Ça se voit, ça se photographie, et personne ne le sait. On ne
   l'annonce que dans les dix jours qui précèdent : une curiosité annoncée
   six mois à l'avance n'est plus une curiosité, c'est du remplissage. */
function blocSansOmbre() {
  const d = new Date();
  const L = SOLEIL.local(d);
  const jours = [...SOLEIL.joursSansOmbre(L.a), ...SOLEIL.joursSansOmbre(L.a + 1)];
  const auj = Date.UTC(L.a, L.m - 1, L.j);
  let prochain = null, ecart = 1e9;
  for (const j of jours) {
    const K = SOLEIL.local(j.quand);
    const t = Date.UTC(K.a, K.m - 1, K.j);
    const dj = Math.round((t - auj) / 86400000);
    if (dj >= 0 && dj < ecart) { ecart = dj; prochain = { ...j, dj, K }; }
  }
  if (!prochain || prochain.dj > 10) return "";
  const quand = prochain.dj === 0 ? "aujourd'hui"
              : prochain.dj === 1 ? "demain"
              : `dans ${prochain.dj} jours`;
  return `
  <section class="section section--serree">
    <div class="ombre-nulle">
      <h3>${ico("soleil")} Le jour sans ombre, ${quand}</h3>
      <p>Le ${prochain.K.j} ${MOIS_LONG[prochain.K.m]} à <b>${SOLEIL.min2h(prochain.midi)}</b>,
        le soleil sera à ${prochain.hauteur.toFixed(1)}° au-dessus de l'horizon :
        à la verticale, ou tout comme. Posez une bouteille debout sur une dalle —
        elle n'aura plus d'ombre. Mayotte est dans les tropiques ; c'est pour ça
        que ça arrive ici deux fois par an, et jamais à La Réunion.</p>
      <p class="ombre-nulle__note">Calculé pour la latitude de Mamoudzou. À la pointe
        sud, c'est la veille.</p>
    </div>
  </section>`;
}

const MOIS_LONG = ["", "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function blocNuit() {
  const d = new Date();
  const s = jourSolaire();
  const lc = LUNE.leverCoucher(d, SOLEIL.LAT, SOLEIL.LON, SOLEIL.TZ);
  const ph = LUNE.phase(d);
  const pct = Math.round(ph.eclairee * 100);

  /* Comparer des heures de lever et de coucher qui enjambent minuit est une
     source d'erreur : une pleine lune levée à 18 h 13 et couchée à 6 h 06
     éclaire toute la nuit, alors qu'un simple « coucher < début de nuit »
     conclurait l'inverse. On échantillonne donc la hauteur réelle de la Lune
     pendant la nuit noire, ce qui ne peut pas se tromper. */
  const L = SOLEIL.local(d);
  const minuit = new Date(Date.UTC(L.a, L.m - 1, L.j, 0, 0, 0) - SOLEIL.TZ * 3600000);
  let hautes = 0, mesures = 0;
  for (let mn = s.nuit; mn < s.aubeNuit + 1440; mn += 20) {
    const t = new Date(minuit.getTime() + mn * 60000);
    if (LUNE.hauteur(t, SOLEIL.LAT, SOLEIL.LON) > 0) hautes++;
    mesures++;
  }
  const partEclairee = mesures ? hautes / mesures : 0;
  /* Sombre si la Lune est fine, ou si elle passe la plus grande partie de la
     nuit sous l'horizon. */
  const sombre = pct < 25 || partEclairee < 0.35;

  return `<div class="bloc">
    <h2 class="bloc__titre">${ico("lune")} La nuit prochaine</h2>
    <p><b>Lune éclairée à ${pct} %</b>${lc.lever != null ? ` · levée à ${SOLEIL.min2h(lc.lever)}` : ""}${
      lc.coucher != null ? ` · couchée à ${SOLEIL.min2h(lc.coucher)}` : ""}.
      Nuit noire de ${SOLEIL.min2h(s.nuit)} à ${SOLEIL.min2h(s.aubeNuit)}.</p>
    <p class="champ__aide">${sombre
      ? "La plage sera <b>sombre</b> : la Lune est absente ou fine pendant la nuit noire."
      : `La plage sera <b>éclairée par la Lune</b> pendant ${Math.round(partEclairee * 100)} %
         de la nuit noire : on y voit sans lampe, et on est vu.`}
      Calculé sur votre appareil, sans réseau.</p>
  </div>`;
}

/* rappel compact, affiché au bas de chaque fiche d'activité */
function blocSecours() {
  return `<div class="bloc">
    <h2 class="bloc__titre">${ico("alerte")} En cas de problème</h2>
    <p style="margin-bottom:var(--s3)"><b>112</b> partout · <b>15</b> SAMU · <b>18</b> pompiers ·
      <b>196</b> ou VHF 16 en mer. Le réseau mobile n'est pas garanti sur les sentiers :
      prévenez quelqu'un de votre itinéraire et de votre heure de retour.</p>
    <button class="btn btn--secondaire" data-action="aller" data-route="/secours">
      ${ico("info")} Alerte cyclonique, séisme, tous les numéros</button>
  </div>`;
}

function vueLexique() {
  return `
  <section class="section">
    <h2 class="section__titre">Parler shimaoré</h2>
    <p class="section__note">Deux mots suffisent à changer complètement l'accueil qu'on vous fait.
      La prononciation est indicative, en lecture française.</p>
  </section>
  <div class="bloc">
    <div class="rangs">
      ${LEXIQUE.map(m => `<div class="rang rang--empile">
        <span class="rang__cle">${esc(m.sh)}</span>
        <span class="rang__val">${esc(m.fr)}
          <small>${m.pr ? "se dit « " + esc(m.pr) + " »" : ""}${m.pr && m.note ? " · " : ""}${esc(m.note)}</small></span>
      </div>`).join("")}
    </div>
  </div>

  ${note("attention", `Le ɓ et le ɗ notent des consonnes implosives, souvent simplifiées en b et d
    dans l'usage courant. Cette liste a été recoupée sur une base lexicographique locale, mais chaque
    entrée reste <b>à faire valider par un locuteur</b> : un Mahorais vous corrigera avec plaisir,
    et ça fait toujours une conversation.`, "livre")}

  <section class="section">
    <h2 class="section__titre">Les mots des fiches</h2>
    <p class="section__note">Le vocabulaire culturel, écrit correctement.</p>
  </section>
  <div class="bloc">
    <div class="rangs">
      ${MOTS_CULTURE.map(m => `<div class="rang rang--empile">
        <span class="rang__cle">${esc(m.m)}</span>
        <span class="rang__val">${esc(m.s)}</span>
      </div>`).join("")}
    </div>
  </div>
  ${pied()}`;
}

function vueAPropos() {
  return `
  <button class="retour" data-action="retour">${ico("fleche")} Retour</button>
  <section class="section">
    <h2 class="section__titre">À propos</h2>
  </section>
  <div class="bloc">
    <h3 class="bloc__titre">${ico("info")} Ce qu'est cette application</h3>
    <p>Un carnet de l'île, pour les visiteurs comme pour les Mahorais. Il fonctionne
      <b>entièrement hors connexion</b> : tout le contenu est embarqué dans l'application.</p>
    <p>Aucun compte, aucun serveur, aucune donnée envoyée. Vos favoris et vos demandes restent
      sur votre appareil. Les réservations passent par votre propre WhatsApp.</p>
  </div>
  <div class="bloc">
    <h3 class="bloc__titre">${ico("vagues")} Les marées</h3>
    <p>Les hauteurs et les horaires sont <b>calculés sur votre appareil</b> par un modèle
      harmonique à 28 ondes, à partir des constantes du marégraphe de Dzaoudzi (série ouverte en
      1963). Le contrôle du 1<sup>er</sup> juillet 2026 retrouve l'annuaire officiel à
      <b>5 minutes et 3 centimètres près</b>.</p>
    <p>C'est une prédiction <b>astronomique</b> : elle ignore la météo, et une dépression ou un vent
      d'afflux peut faire monter l'eau au-delà. Elle ne remplace pas
      <a href="https://maree.shom.fr/harbor/DZAOUDZI" target="_blank" rel="noopener">l'annuaire du
      Shom</a>. À noter : le marégraphe de Dzaoudzi n'émet plus depuis le passage de Chido, le
      14 décembre 2024 — personne ne dispose de hauteur observée en temps réel à Mayotte.</p>
    <p>Il n'y a volontairement <b>pas de coefficient de marée</b> : c'est une convention
      métropolitaine calculée à partir de Brest, que le Shom ne fournit pas outre-mer. On affiche
      à la place le marnage du jour et la hauteur des basses mers, qui disent vraiment si le
      platier sera découvert.</p>
    <p class="champ__aide">Constantes harmoniques : <a href="https://doi.pangaea.de/10.1594/PANGAEA.951610"
      target="_blank" rel="noopener">TICON-3</a>, Hart-Davis, Dettmering &amp; Seitz (2022),
      licence CC BY 4.0. Niveaux de référence : <a href="https://www.data.gouv.fr/datasets/references-altimetriques-maritimes"
      target="_blank" rel="noopener">Références Altimétriques Maritimes du Shom</a>,
      Licence Ouverte Etalab 2.0.</p>
  </div>
  <div class="bloc">
    <h3 class="bloc__titre">${ico("alerte")} Les limites</h3>
    <p>Le cyclone Chido (décembre 2024) a modifié beaucoup de choses : des lieux ont fermé,
      des accès ont changé. Confirmez toujours par téléphone avant de faire une heure de route.</p>
    <p>Les prestataires ne sont publiés qu'avec leur accord. Tant qu'un contact n'est pas
      vérifié, l'application vous le dit et transmet votre demande à la rédaction.</p>
  </div>
  <div class="bloc">
    <h3 class="bloc__titre">${ico("livre")} Où vérifier par vous-même</h3>
    <div class="rangs">
      ${ORGANISMES.map(o => `<a class="rang rang--empile" href="${esc(o.u)}" target="_blank" rel="noopener">
        <span class="rang__cle" style="min-width:9rem">${esc(o.n)}</span>
        <span class="rang__val">${esc(o.r)}</span></a>`).join("")}
    </div>
  </div>

  ${invite ? `<div class="bloc">
    <h3 class="bloc__titre">${ico("plus")} Installer l'application</h3>
    <p>Installée sur l'écran d'accueil, elle s'ouvre en plein écran et fonctionne sans réseau.</p>
    <button class="btn" data-action="installer">${ico("plus")} Ajouter à l'écran d'accueil</button>
  </div>` : ""}
  ${!contactPret() ? note("attention", `<b>Version de démonstration.</b> Le contact de
    l'application n'est pas encore activé : les demandes de réservation sont préparées puis
    affichées à l'écran, mais rien n'est envoyé. Écrivez plutôt à l'adresse ci-dessous.`,
    "info") : ""}

  <div class="bloc">
    <h3 class="bloc__titre">${ico("boussole")} Réglages</h3>
    <div class="rangs">
      <button class="rang" data-action="bascule-anim">
        <span class="rang__cle">Animations</span>
        <span class="rang__val">${Store.get("anim", "on") === "off" ? "Désactivées" : "Activées"}
          <small>Les écrans glissent d'une vue à l'autre. À couper si l'appareil rame,
          ou si le mouvement vous gêne.</small></span>
      </button>
    </div>
  </div>

  <div class="btns">
    <button class="btn" data-action="aller" data-route="/secours">
      ${ico("alerte")} Secours, alerte cyclonique, séisme</button>
    <button class="btn btn--secondaire" data-action="signaler" data-id="">
      ${ico("drapeau")} Signaler une erreur</button>
    <a class="btn btn--discret" href="mailto:${esc(APP.contactMail)}">${ico("message")} Écrire un mail</a>
  </div>
  ${pied()}`;
}

/* Chrome propose l'installation via cet événement ; on ne l'impose pas, on
   range simplement le bouton dans « À propos ». */
let invite = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault(); invite = e;
  if (location.hash.startsWith("#/apropos")) rendre(true);
});
async function installer() {
  if (!invite) return;
  invite.prompt();
  await invite.userChoice;
  invite = null; rendre(true);
}

function vueIntrouvable() {
  return `<div class="vide">${ico("boussole")}
    <p>Cette page n'existe pas.</p>
    <button class="btn btn--secondaire" data-action="aller" data-route="/">Revenir à l'accueil</button></div>`;
}

/* ------------------------------------------------------------ 13. ACTIONS */
function basculeFav(id, silencieux) {
  const dedans = favoris.includes(id);
  favoris = dedans ? favoris.filter(x => x !== id) : [...favoris, id];
  const ecrit = Store.set("favoris", favoris);

  /* On ne re-rend PAS la page : sur l'accueil, le score de favori remonterait la
     carte dans le classement et les cartes sauteraient sous le doigt. On met à
     jour uniquement les boutons qui portent cet identifiant. */
  const l = lieu(id);
  $$(`[data-action="favori"][data-id="${id}"]`).forEach(b => {
    b.setAttribute("aria-pressed", String(!dedans));
    if (l) b.setAttribute("aria-label",
      `${dedans ? "Ajouter" : "Retirer"} ${l.nom} ${dedans ? "au" : "du"} carnet`);
  });
  if (typeof majPastille === "function") majPastille();

  if (silencieux) return;
  annoncer(dedans ? "Retiré du carnet." : "Ajouté au carnet.");

  /* Sur la page Carnet, la carte doit vraiment disparaître : là, on re-rend. */
  if (derniereRoute.startsWith("/carnet")) rendre(true);

  if (!ecrit && !Store.prevenu) {
    Store.prevenu = true;
    feuille({ titre: "Rien ne sera enregistré",
      texte: "Cet appareil n'enregistre rien (navigation privée ou stockage bloqué). "
           + "Votre carnet disparaîtra en fermant l'application." });
  }
}

function ajouterItineraire(id) {
  const i = ITINERAIRES.find(x => x.id === id); if (!i) return;
  let n = 0;
  i.etapes.forEach(e => { if (lieu(e.lieu) && !favoris.includes(e.lieu)) { favoris.push(e.lieu); n++; } });
  Store.set("favoris", favoris);
  annoncer(`${n} étape(s) ajoutée(s) au carnet.`);
  feuille({ titre: n ? "Ajouté au carnet" : "Déjà dans votre carnet",
    texte: n ? `${n} étape${n > 1 ? "s ajoutées" : " ajoutée"}.` : "Toutes les étapes y étaient déjà." });
  majPastille();
}

async function partager(id) {
  const l = lieu(id); if (!l) return;
  const donnees = {
    title: l.nom + " — Karibu Maoré",
    text: `${l.nom} (${l.commune}) : ${l.resume}`,
    url: location.href
  };
  /* AbortError = l'utilisateur a fermé la feuille de partage, c'est normal.
     Toute autre erreur signifie que RIEN n'est parti : on ne peut pas laisser
     croire le contraire, on retombe sur la copie. */
  if (navigator.share) {
    try { await navigator.share(donnees); return; }
    catch (e) { if (e && e.name === "AbortError") return; }
  }
  try {
    await navigator.clipboard.writeText(`${donnees.text}\n${donnees.url}`);
    feuille({ titre: "Copié", texte: "Prêt à coller dans WhatsApp ou un message." });
  } catch {
    feuille({ titre: "À partager", texteLong: `${donnees.text}\n${donnees.url}` });
  }
}

function signaler(id) {
  const l = id ? lieu(id) : null;
  const t = `Signalement — Karibu Maoré\n\n` +
    (l ? `Fiche : ${l.nom} (${l.commune})\n\n` : "") +
    `Ce qui ne va pas :\n`;
  ouvrirWhatsApp(APP.contactWhatsApp, t);
}

function viderDemandes() {
  feuille({ titre: "Effacer l'historique ?",
    texte: "Toutes les demandes enregistrées sur cet appareil seront supprimées.",
    actions: [{ libelle: "Effacer", faire: () => { demandes = []; Store.set("demandes", demandes); rendre(true); } }] });
  return;
  demandes = []; Store.set("demandes", demandes); rendre(true);
}

/* ------------------------------------------------------------ 14. ROUTAGE */
let _serie = (history.state && history.state.n) || 0;
function go(route) {
  _serie += 1;
  history.pushState({ n: _serie }, "", "#" + route);
  rendreSur();
}

/* On mémorise où l'utilisateur en était dans chaque liste : revenir d'une fiche
   vers Explorer en étant renvoyé tout en haut est le défaut le plus agaçant
   d'une appli de ce type. */
const positions = new Map();
/* À quelle section appartient chaque sous-écran, pour que l'onglet
   correspondant reste allumé quand on y descend. */
const PARENT = { lieu:"/explorer", resa:"/explorer", itineraire:"/itineraires",
                 secours:"/", infos:"/", lexique:"/", apropos:"/", pro:"/carnet",
                 credits:"/" };
let derniereRoute = "";
const _ordreSuggestions = { cle: "", ids: [] };
let derniereVue = "";

function rendre(sansScroll) {
  const brut = location.hash.slice(1) || "/";
  const [chemin, qs] = brut.split("?");
  const params = new URLSearchParams(qs || "");
  const seg = chemin.split("/").filter(Boolean);
  const vue = $("#vue");

  let html, titre = "Karibu Maoré";
  switch (seg[0]) {
    case undefined:     html = vueAccueil();            titre = "Aujourd'hui"; break;
    case "explorer":    html = vueExplorer(params);     titre = "Explorer"; break;
    case "carte":       html = vueCarte(params);        titre = "La carte"; break;
    case "lieu":        html = vueLieu(seg[1]);         titre = lieu(seg[1])?.nom || "Fiche"; break;
    case "resa":        html = vueResa(seg[1]);         titre = "Réserver"; break;
    case "itineraires": html = vueItineraires();        titre = "Journées"; break;
    case "itineraire":  html = vueItineraire(seg[1]);   titre = "Journée"; break;
    case "agenda":      html = vueAgenda();             titre = "Agenda"; break;
    case "carnet":      html = vueCarnet();             titre = "Mon carnet"; break;
    case "pro":         html = vuePro();                titre = "Espace prestataire"; break;
    case "infos":       html = vueInfos();              titre = "Infos pratiques"; break;
    case "lexique":     html = vueLexique();            titre = "Shimaoré"; break;
    case "apropos":     html = vueAPropos();            titre = "À propos"; break;
    case "secours":     html = vueSecours();            titre = "Secours et alerte"; break;
    default:            html = vueIntrouvable();        titre = "Page inconnue";
  }

  /* On relève la position AVANT de remplacer le contenu : à cet instant la page
     est encore celle qu'on quitte. Ne dépend d'aucun événement « scroll », qui
     n'est pas émis partout de façon fiable. */
  if (derniereRoute && derniereRoute !== brut) positions.set(derniereRoute, window.scrollY);

  vue.innerHTML = html;
  document.title = titre + " — Karibu Maoré";

  $$(".onglet").forEach(a => {
    const racine = PARENT[seg[0]] || ("/" + (seg[0] || ""));
    const actif = a.dataset.r === racine;
    if (actif) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  majPastille();

  const nouvelleVue = seg[0] || "/";
  if (!sansScroll && nouvelleVue !== derniereVue) {
    const retrouve = positions.get(brut);
    window.scrollTo({ top: retrouve || 0, behavior: "auto" });
    vue.focus({ preventScroll: true });
    if (!retrouve) annoncer(titre);
  }
  derniereVue = nouvelleVue;
  derniereRoute = brut;
  document.body.dataset.vue = seg[0] || "accueil";
  majBarreFiche(seg[0] === "lieu" ? seg[1] : null);
  if (seg[0] === "carte") { const c = $(".carte-cadre"); if (c) CarteVue.brancher(c); }
}

function majPastille() {
  const o = $$(".onglet").find(a => a.dataset.r === "/carnet"); if (!o) return;
  o.querySelector(".onglet__pastille")?.remove();
  if (favoris.length) {
    const b = document.createElement("span");
    b.className = "onglet__pastille"; b.textContent = favoris.length > 9 ? "9+" : favoris.length;
    o.appendChild(b);
  }
}

/* --------------------------------------------------------- 15. ÉVÉNEMENTS */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action;
  if (a === "aller")             { e.preventDefault(); go(el.dataset.route); }
  else if (a === "favori")       { e.preventDefault(); e.stopPropagation(); basculeFav(el.dataset.id); }
  else if (a === "retour")       { (history.state && history.state.n > 0) ? history.back()
                                     : go(PARENT[(location.hash.slice(2).split("/")[0])] || "/"); }
  else if (a === "carte-point") { const id = el.dataset.id;
                                   if (carteSel === id) { go("/lieu/" + id); }
                                   else { carteSel = id; rendre(true); } }
  else if (a === "bascule-anim") { const v = Store.get("anim", "on") === "off" ? "on" : "off";
                                   Store.set("anim", v);
                                   document.documentElement.dataset.anim = v;
                                   annoncer(v === "off" ? "Animations désactivées." : "Animations activées.");
                                   rendre(true); }
  else if (a === "suggestion") { filtres.q = el.dataset.q; const c = $("#q");
                                  if (c) c.value = filtres.q; rendre(true); }
  else if (a === "uv-detail") { feuille({ titre: "D'où sort ce nombre",
      texte: "Il est calculé, pas mesuré, et calculé pour un ciel parfaitement clair.",
      /* Les paragraphes sont un tableau : ecrire un saut de ligne dans un
         litteral traverse trop d'outils pour rester fiable. */
      texteLong: [
        "L'indice part de la hauteur du soleil sur l'horizon, elle-même calculée par " +
        "les formules solaires de la NOAA — les mêmes qui donnent l'heure du lever à la " +
        "seconde près. Plus le soleil est haut, moins son rayonnement traverse " +
        "d'atmosphère, et la relation n'est pas proportionnelle : elle suit une " +
        "puissance 2,42.",
        "S'y ajoute la couche d'ozone, qui est le vrai filtre. Sous les tropiques elle " +
        "est plus mince qu'ailleurs — environ 260 unités Dobson contre 300 en référence " +
        "— ce qui laisse passer près de 20 % d'ultraviolet en plus. C'est la raison " +
        "pour laquelle on brûle plus vite ici qu'à une même hauteur de soleil en Europe.",
        "Ce que le calcul ne fait pas : il ne connaît pas les nuages, qui peuvent " +
        "diviser l'indice par deux ; il ne compte pas le sable clair ni la surface de " +
        "l'eau, qui vous renvoient une part de ce qui descend et augmentent donc la " +
        "dose reçue sans changer l'indice. L'altitude ajouterait 4 % au sommet du " +
        "Bénara : c'est négligé.",
        "Recoupement. Darwin, en Australie, est à 12,3° de latitude sud — celle de " +
        "Mayotte à un dixième de degré près. Les relevés officiels y donnent des " +
        "maxima d'été entre 11 et 15. Le calcul rend ici 14,8 par ciel parfaitement " +
        "clair en février et 8,8 en juin : la fourchette est la bonne, les jours " +
        "nuageux occupant le bas de ce qui se mesure.",
        "Précision honnête : à un point d'indice près, par ciel clair. C'est assez " +
        "pour la seule décision qui compte — se couvrir, ou non."
      ].join(String.fromCharCode(10, 10)) }); }
  else if (a === "carte-zoom")  { CarteVue.zoomer(parseFloat(el.dataset.f)); }
  else if (a === "carte-recadrer") { CarteVue.recadrer(); }
  else if (a === "carte-moi")   {
      annoncer("Recherche de votre position…");
      CarteVue.situer(r => {
        if (r.erreur === "refus") feuille({ titre: "Position refusée",
          texte: "Vous pouvez l'autoriser dans les réglages du navigateur. " +
                 "L'application n'envoie votre position nulle part : elle sert seulement " +
                 "à vous placer sur la carte." });
        else if (r.erreur) feuille({ titre: "Position introuvable",
          texte: "Le téléphone n'a pas réussi à se situer. Sous les arbres ou en intérieur, " +
                 "c'est fréquent." });
        else if (!r.dans) feuille({ titre: "Vous n'êtes pas à Mayotte",
          texte: "La carte ne couvre que l'île. Elle vous attendra." });
        else annoncer("Vous êtes sur la carte.");
      });
    }
  else if (a === "carte-cat")   { filtres.cat = el.dataset.val || null; carteSel = null; rendre(true); }
  else if (a === "filtre")       { const c = el.dataset.champ, v = el.dataset.val;
                                   filtres[c] = (!v || filtres[c] === v) ? null : v; majListe(); }
  else if (a === "reset-filtres"){ filtres = { cat:null, zone:null, budget:null, tag:null, q:"" };
                                   $("#q").value = ""; majListe(); }
  else if (a === "resa")         { envoyerResa(el.dataset.id, el.dataset.mode); }
  else if (a === "envoyer-pro")  { envoyerPro(); }
  else if (a === "partager")     { partager(el.dataset.id); }
  else if (a === "signaler")     { signaler(el.dataset.id); }
  else if (a === "vider-demandes"){ viderDemandes(); }
  else if (a === "imprimer")     { window.print(); }
  else if (a === "ajouter-itineraire") { ajouterItineraire(el.dataset.id); }
  else if (a === "installer")    { installer(); }
});

/* recherche */
const champQ = $("#q");
const panneau = $("#recherche");
$("#btn-recherche").addEventListener("click", () => {
  const ouvert = panneau.hidden;
  panneau.hidden = !ouvert;
  $("#btn-recherche").setAttribute("aria-expanded", String(ouvert));
  if (ouvert) champQ.focus();
  else if (filtres.q) { filtres.q = ""; champQ.value = ""; rendre(true); }
});
$("#btn-vider").addEventListener("click", () => {
  champQ.value = ""; filtres.q = ""; champQ.focus(); rendre(true);
});
let tempo;
champQ.addEventListener("input", e => {
  clearTimeout(tempo);
  tempo = setTimeout(() => {
    filtres.q = e.target.value;
    if (!location.hash.startsWith("#/explorer")) go("/explorer"); else rendre(true);
  }, 160);
});
$("#marque").addEventListener("click", () => go("/"));

window.addEventListener("hashchange", () => rendreSur());

/* ------------------------------------------------------------- FEUILLE
   Remplace alert() et confirm(). Le texte est sélectionnable et défilable,
   les boutons font 48 px et vivent dans le tiers bas de l'écran. */
function feuille({ titre, texte, texteLong, actions = [] }) {
  const d = $("#feuille");
  if (!d) { alert(texte || texteLong || titre); return Promise.resolve(false); }
  return new Promise(resolve => {
    d.innerHTML = `
      <form method="dialog" class="feuille__corps">
        <h2 class="feuille__titre" id="feuille-titre">${esc(titre)}</h2>
        ${texte ? `<p class="feuille__txt">${esc(texte)}</p>` : ""}
        ${texteLong ? `<textarea class="feuille__zone" readonly rows="7">${esc(texteLong)}</textarea>` : ""}
        <div class="feuille__actions">
          ${actions.map((a, i) => `<button value="${i}"
            class="btn ${a.style === "secondaire" ? "btn--secondaire" : ""}">${esc(a.libelle)}</button>`).join("")}
          <button value="fermer" class="btn btn--secondaire">Fermer</button>
        </div>
      </form>`;
    d.addEventListener("close", function fin() {
      d.removeEventListener("close", fin);
      const i = parseInt(d.returnValue, 10);
      if (!isNaN(i) && actions[i]) { actions[i].faire?.(); resolve(true); } else resolve(false);
    });
    d.showModal();
  });
}

/* La barre d'action de la fiche vit hors de #vue : elle n'est donc pas
   reconstruite à chaque rendu, et elle reste sous le pouce en permanence. */
function majBarreFiche(id) {
  const barre = $("#barre-fiche");
  if (!barre) return;
  const l = id ? lieu(id) : null;
  if (!l) { barre.innerHTML = ""; return; }
  const fav = favoris.includes(l.id);
  barre.innerHTML = `
    ${l.presta.length
      ? `<button class="btn" data-action="aller" data-route="/resa/${l.id}">
           ${ico("message")} Réserver</button>`
      : `<a class="btn" href="${mapLien(l)}" target="_blank" rel="noopener">
           ${ico("epingle")} Y aller</a>`}
    <button class="icone-btn" data-action="favori" data-id="${l.id}" aria-pressed="${fav}"
      aria-label="${fav ? "Retirer" : "Ajouter"} ${attr(l.nom)} ${fav ? "du" : "au"} carnet">
      ${ico("coeur")}</button>
    <button class="icone-btn" data-action="partager" data-id="${l.id}"
      aria-label="Partager ${attr(l.nom)}">${ico("partager")}</button>`;
}

/* ------------------------------------------------------ FILET DE SÉCURITÉ
   Si un fichier n'a pas chargé (téléchargement tronqué, cache empoisonné par un
   portail captif), rendre() lève une exception et l'utilisateur se retrouve
   devant une application qui a l'air installée — barre d'onglets comprise — mais
   dont le contenu est vide, sans un mot d'explication. Il conclut qu'elle est
   cassée et la désinstalle. On lui donne au minimum une explication et une
   sortie : le bouton « Réinstaller le contenu » est la SEULE façon de réparer un
   cache empoisonné depuis l'intérieur de l'application. */
function panne(err) {
  const v = $("#vue");
  if (!v) return;
  v.innerHTML = `
    <section class="section">
      <h2 class="section__titre">Le carnet n'a pas pu se charger</h2>
      <p class="section__note">Une partie de l'application manque à l'appel. C'est en général
        un téléchargement interrompu, ou un réseau Wi-Fi qui a renvoyé sa page de connexion
        à la place des fichiers.</p>
    </section>
    <div class="bloc">
      <p style="margin-bottom:var(--s3)"><code>${esc(String(err && err.message || err || ""))}</code></p>
      <div class="btns">
        <button class="btn" data-action="recharger">Réessayer</button>
        <button class="btn btn--secondaire" data-action="reinstaller">Réinstaller le contenu</button>
      </div>
      <p class="champ__aide" style="margin-top:var(--s3)">« Réinstaller » vide le contenu mis en
        mémoire et le retélécharge. Vos favoris ne sont pas effacés.</p>
    </div>`;
}

function rendreSur() {
  /* La transition de vue native est ce qui distingue le plus nettement une
     application d'une page web : l'écran glisse au lieu d'être remplacé.
     Repli automatique et complet si le navigateur ne la connaît pas, si
     l'utilisateur a demandé moins d'animations, ou si l'interrupteur des
     réglages est sur « sobre ». */
  const anime = document.startViewTransition
    && !matchMedia("(prefers-reduced-motion: reduce)").matches
    && document.documentElement.dataset.anim !== "off";
  if (!anime) { try { rendre(); } catch (e) { console.error(e); panne(e); } return; }
  try {
    document.startViewTransition(() => {
      try { rendre(); } catch (e) { console.error(e); panne(e); }
    });
  } catch (e) { try { rendre(); } catch (e2) { console.error(e2); panne(e2); } }
}

/* attrape aussi l'échec de chargement d'un <script> lui-même */
window.addEventListener("error", e => {
  if (e.target && e.target.tagName === "SCRIPT") panne(new Error("Fichier manquant : " + e.target.src));
});

document.addEventListener("click", e => {
  const b = e.target.closest("[data-action='recharger'],[data-action='reinstaller']");
  if (!b) return;
  if (b.dataset.action === "recharger") return location.reload();
  Promise.resolve()
    .then(() => caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))))
    .then(() => navigator.serviceWorker?.getRegistrations()
      .then(rs => Promise.all(rs.map(r => r.unregister()))))
    .catch(() => {})
    .then(() => location.reload(true));
});
window.addEventListener("scroll", () => {
  $("#topbar").dataset.defile = window.scrollY > 8 ? "oui" : "non";
}, { passive: true });

/* --------------------------------------------------------- 16. DÉMARRAGE */
$("#km-defs").innerHTML = UI.claustra();
$("#logo-slot").innerHTML = UI.logo();
$("#btn-recherche").innerHTML = UI.icone("loupe");
$("#loupe-slot").innerHTML = UI.icone("loupe");
$("#btn-vider").innerHTML = UI.icone("croix");
const ICONES_ONGLETS = ["accueil", "boussole", "livre", "carte", "sac"];
$$(".onglet .ico").forEach((s, i) => { s.innerHTML = UI.icone(ICONES_ONGLETS[i]); });

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.addEventListener("popstate", () => rendreSur());
Store.sonder();
/* L'interrupteur des animations survit au rechargement. */
document.documentElement.dataset.anim = Store.get("anim", "on");
Store.set("ouvertures", Store.get("ouvertures", 0) + 1);
rendreSur();
/* On laisse l'utilisateur arriver avant de lui proposer quoi que ce soit. */
setTimeout(bandeauInstall, 4000);

/* ------------------------------------------------------- 17. HORS CONNEXION */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(reg => {
      /* Une nouvelle version est prête : on ne recharge pas d'autorité — quelqu'un
         est peut-être en train de lire une fiche sur la plage. On propose. */
      reg.addEventListener("updatefound", () => {
        const neuf = reg.installing;
        if (!neuf) return;
        neuf.addEventListener("statechange", () => {
          if (neuf.state === "installed" && navigator.serviceWorker.controller) bandeauMaj(reg);
        });
      });
    }).catch(() => {});

    let rechargement = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (rechargement) return;
      rechargement = true;
      location.reload();
    });
  });
}

/* L'invitation à installer.

   Sur Android, le navigateur propose lui-même l'installation par
   `beforeinstallprompt` : on capte l'événement et on l'offre au bon moment.
   Sur iOS cet événement n'existe pas — il faut expliquer le geste, et c'est la
   seule façon d'y arriver. On n'affiche rien avant la troisième ouverture :
   proposer d'installer à quelqu'un qui découvre l'application est le meilleur
   moyen de le faire fuir. */
let _promptInstall = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); _promptInstall = e; });

function peutProposerInstall() {
  const deja = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (deja || Store.get("install-refuse", false)) return false;
  const n = Store.get("ouvertures", 0);
  return n >= 3;
}

function bandeauInstall() {
  if ($("#install") || !peutProposerInstall()) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!_promptInstall && !ios) return;
  const d = document.createElement("div");
  d.id = "install";
  d.className = "bandeau-maj bandeau-install";
  d.innerHTML = ios
    ? `<span>Installer sur l'écran d'accueil : touchez <b>Partager</b>, puis
       <b>« Sur l'écran d'accueil »</b>. L'application marchera alors sans réseau.</span>
       <button class="btn btn--mini" data-i="non">Plus tard</button>`
    : `<span>Installer Karibu Maoré sur votre téléphone ? Elle marchera sans réseau.</span>
       <button class="btn btn--mini" data-i="oui">Installer</button>
       <button class="btn btn--mini btn--fantome" data-i="non">Plus tard</button>`;
  d.addEventListener("click", e => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    if (b.dataset.i === "oui" && _promptInstall) { _promptInstall.prompt(); _promptInstall = null; }
    else Store.set("install-refuse", true);
    d.remove();
  });
  document.body.appendChild(d);
}

function bandeauMaj(reg) {
  if ($("#maj")) return;
  const d = document.createElement("div");
  d.id = "maj";
  d.className = "bandeau-maj";
  d.innerHTML = `<span>Une nouvelle version du carnet est prête.</span>
    <button class="btn btn--mini">Recharger</button>`;
  d.querySelector("button").addEventListener("click", () => {
    reg.waiting?.postMessage("activer-maintenant");
    setTimeout(() => location.reload(), 300);
  });
  document.body.appendChild(d);
}
function etatReseau() {
  let b = $("#hors-ligne");
  if (!navigator.onLine && !b) {
    b = document.createElement("div");
    b.id = "hors-ligne"; b.className = "hors-ligne";
    b.innerHTML = UI.icone("vagues") + "<span>Hors connexion — tout reste consultable</span>";
    document.body.appendChild(b);
  } else if (navigator.onLine && b) b.remove();
}
window.addEventListener("online", etatReseau);
window.addEventListener("offline", etatReseau);
etatReseau();
