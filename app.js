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

/* ------------------------------------------------------------- 1. STOCKAGE */
const Store = {
  get(k, def) { try { const v = localStorage.getItem("km_" + k); return v === null ? def : JSON.parse(v); } catch { return def; } },
  set(k, v) { try { localStorage.setItem("km_" + k, JSON.stringify(v)); } catch {} }
};
let favoris  = Store.get("favoris", []);
let demandes = Store.get("demandes", []);
let filtres  = { cat: null, zone: null, budget: null, tag: null, q: "" };

/* ------------------------------------------------------------ 2. RACCOURCIS */
const cat     = id => CATEGORIES.find(c => c.id === id) || { id, nom: id, emoji: "•" };
const lieu    = id => LIEUX.find(l => l.id === id);
const presta  = id => PRESTATAIRES.find(p => p.id === id);
const esc     = s => String(s ?? "").replace(/[&<>"']/g, c =>
                  ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const attr    = s => esc(s).replace(/\s+/g, " ");
const cap     = s => s.charAt(0).toUpperCase() + s.slice(1);
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
    alert(msg);
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
      ${UI.vignette(l.id, l.cat, { indice: l.nom + " " + l.resume })}
      <span class="fiche-carte__cat">${c.emoji} ${esc(c.nom)}</span>
    </div>
    <button class="coeur" data-action="favori" data-id="${l.id}" aria-pressed="${fav}"
            aria-label="${fav ? "Retirer" : "Ajouter"} ${attr(l.nom)} ${fav ? "du" : "au"} carnet">
      ${ico("coeur")}
    </button>
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

  const suggestions = classer(LIEUX, now, soir).slice(0, 4);

  const evJour = EVENEMENTS.filter(e => actifMaintenant(e, now));

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
        <span class="stat__cle">Marnage ${phase.emoji}</span>
        <span class="stat__val">${etat.indic ? etat.indic.marnage + " m" : "—"}</span>
        <span class="stat__sous">${etat.indic ? esc(etat.indic.regime) : ""}</span>
      </div>
      <div class="stat">
        <span class="stat__cle">Saison</span>
        <span class="stat__val">${mois >= 5 && mois <= 10 ? "sèche" : "des pluies"}</span>
        <span class="stat__sous">${mois >= 7 && mois <= 10 ? "baleines dans le lagon" : "chaud et humide"}</span>
      </div>
    </div>
  </section>

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
      ${UI.courbeMaree(etat.evts, h + now.getMinutes() / 60, null, MAREES.profil(new Date()))}
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
        <button class="rang" ${e.lien ? `data-action="aller" data-route="/lieu/${e.lien}"` : "disabled"}>
          <span class="rang__cle">${e.type === "recurrent" ? cap(JOURS[e.jour]) : "En cours"}</span>
          <span class="rang__val">${esc(e.nom)}<small>${esc(e.texte)}</small></span>
        </button>`).join("")}
    </div>
  </section>` : ""}

  <section class="section">
    <h2 class="section__titre">Par envie</h2>
    <div class="tuiles">
      ${CATEGORIES.map(c => {
        const n = LIEUX.filter(l => l.cat === c.id).length;
        return `<button class="tuile" data-action="aller" data-route="/explorer?cat=${c.id}">
          <span class="tuile__icone" aria-hidden="true" style="font-size:1.35rem">${c.emoji}</span>
          <span class="tuile__nom">${esc(c.nom)}</span>
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
      <button class="rang" data-action="aller" data-route="/apropos">
        <span class="rang__cle">À propos</span>
        <span class="rang__val">D'où vient l'information<small>Sources, limites, comment signaler une erreur</small></span>
      </button>
    </div>
  </section>
  ${pied()}`;
}

/* score de pertinence d'une fiche à un instant donné */
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
      if (!soir && h >= 16 && /coucher|fin d'après-midi|soir/i.test(l.quand)) s += 3;
      const restant = soir ? 11 : Math.max(0, 18 - h);
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
function vueExplorer(params) {
  if (params.get("cat")) filtres.cat = params.get("cat");
  const now = maintenant(), mois = now.getMonth() + 1;

  const liste = LIEUX.filter(l => {
    if (filtres.cat && l.cat !== filtres.cat) return false;
    if (filtres.zone && l.zone !== filtres.zone) return false;
    if (filtres.budget === "gratuit" && l.budget !== 0) return false;
    if (filtres.tag && !l.tags.includes(filtres.tag)) return false;
    if (filtres.q) {
      const t = (l.nom + " " + l.resume + " " + l.texte + " " + l.commune + " " +
                 l.tags.join(" ") + " " + l.quand).toLowerCase();
      if (!t.includes(filtres.q.toLowerCase().trim())) return false;
    }
    return true;
  });

  const horsSaison = liste.filter(l => !enSaison(l, mois)).length;
  const actifs = ["cat","zone","budget","tag"].filter(k => filtres[k]).length + (filtres.q ? 1 : 0);

  const bouton = (label, champ, val) => `
    <button class="filtre" data-action="filtre" data-champ="${champ}" data-val="${val}"
      aria-pressed="${filtres[champ] === val}">${esc(label)}</button>`;

  return `
  <section class="section">
    <h2 class="section__titre">Explorer
      <span class="oeil">${liste.length} sur ${LIEUX.length}</span></h2>
    ${filtres.q ? `<p class="section__note">Recherche : « ${esc(filtres.q)} »</p>` : ""}
  </section>

  <div class="filtres" role="group" aria-label="Filtrer par catégorie">
    <button class="filtre" data-action="filtre" data-champ="cat" data-val=""
      aria-pressed="${!filtres.cat}">Tout</button>
    ${CATEGORIES.map(c => bouton(c.emoji + " " + c.nom, "cat", c.id)).join("")}
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
  ${actifs ? `<button class="btn btn--discret" data-action="reset-filtres">
      ${ico("croix")} Enlever les filtres (${actifs})</button>` : ""}

  ${liste.length ? `<div class="grille" style="margin-top:var(--s3)">${liste.map(carteLieu).join("")}</div>`
    : `<div class="vide">${ico("loupe")}<p>Rien avec ces filtres.<br>Essayez d'en enlever un.</p>
       <button class="btn btn--secondaire" data-action="reset-filtres">Tout réafficher</button></div>`}

  ${horsSaison ? `<p class="section__note" style="margin-top:var(--s4)">
    ${horsSaison} proposition${horsSaison > 1 ? "s" : ""} ${horsSaison > 1 ? "sont" : "est"} hors
    de sa meilleure saison en ${MOIS[mois - 1]} : la fiche vous le dira.</p>` : ""}
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
  const prochaineBonne = l.maree ? etat.evts.find(e => e.type === l.maree && e.brut > hDec) : null;
  const fav = favoris.includes(l.id);

  return `
  <button class="retour" data-action="retour">${ico("fleche")} Retour</button>

  <article class="fiche">
    <header class="fiche__entete">
      <div class="fiche__art">${UI.vignette(l.id, l.cat, { haut: true, indice: l.nom + " " + l.resume })}</div>
      <span class="fiche__cat">${c.emoji} ${esc(c.nom)}</span>
    </header>
    <h1 class="fiche__titre">${esc(l.nom)}</h1>
    <p class="fiche__sous">${ico("epingle")} ${esc(l.commune)} · ${esc(zoneNom(l.zone))}</p>

    ${!saisonOk ? note("attention",
      `<b>Ce n'est pas la meilleure période.</b> À privilégier en
       ${l.saison.map(m => MOIS[m - 1]).join(", ")}.`, "agenda") : ""}
    ${l.maree && !mareeOk ? note("attention",
      `<b>Cette activité demande une marée ${l.maree}.</b> ` +
      (prochaineBonne
        ? `La marée est ${esc(etat.sens)} : la prochaine marée ${l.maree} est estimée vers <b>${esc(prochaineBonne.heure)}</b>.`
        : `La marée est ${esc(etat.sens)} en ce moment.`),
      "goutte") : ""}
    ${l.maree && mareeOk ? note("ok",
      `<b>La marée est bonne en ce moment</b> pour cette activité.`, "valide") : ""}

    <div class="bloc">
      <div class="faits">
        <div class="fait"><span class="fait__cle">Durée</span><span class="fait__val">${dureeTxt(l.duree)}</span></div>
        <div class="fait"><span class="fait__cle">Budget</span><span class="fait__val">${euro(l.budget)}</span></div>
        <div class="fait"><span class="fait__cle">Marée</span><span class="fait__val">${l.maree ? cap(l.maree) : "Indifférente"}</span></div>
        <div class="fait"><span class="fait__cle">Réservation</span><span class="fait__val">${l.presta.length ? "Oui" : "Libre"}</span></div>
      </div>
    </div>

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
      ${UI.courbeMaree(etat.evts, hDec, l.maree, MAREES.profil(new Date()))}
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
    try { await navigator.clipboard.writeText(texte); annoncer("Message copié."); alert("Message copié. Collez-le dans WhatsApp, un SMS ou un mail."); }
    catch { alert(texte); }
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
          <span class="fiche-carte__cat">${i.emoji} ${esc(i.duree)}</span></div>
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
    <h2 class="section__titre">${i.emoji} ${esc(i.nom)}</h2>
    <p class="section__note">${esc(i.pour)} · ${esc(i.duree)}${total ? ` · environ ${total} h d'activités` : ""}</p>
  </section>
  <div class="bloc">
    <div class="parcours">
      ${i.etapes.map(e => {
        const l = lieu(e.lieu);
        return `<button class="etape" ${l ? `data-action="aller" data-route="/lieu/${l.id}"` : "disabled"}>
          <span class="etape__h">${esc(e.h)}</span>
          <span class="etape__quoi">${esc(e.quoi)}</span>
          ${l ? `<span class="etape__ou">${ico("epingle")} ${esc(l.nom)} · ${esc(l.commune)}</span>` : ""}
        </button>`;
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
  const now = maintenant(), mois = now.getMonth() + 1;
  const periode = e => e.type === "recurrent" ? "Chaque " + JOURS[e.jour]
    : e.type === "saison" ? `${cap(MOIS[e.debut - 1])} → ${MOIS[e.fin - 1]}` : esc(e.date);
  const tri = [...EVENEMENTS].sort((a, b) => (actifMaintenant(b, now) ? 1 : 0) - (actifMaintenant(a, now) ? 1 : 0));

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
  if (!g("nom")) { alert("Indiquez au moins le nom de votre activité."); return; }
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
  Store.set("favoris", favoris);
  if (!silencieux) { annoncer(dedans ? "Retiré du carnet." : "Ajouté au carnet."); rendre(true); }
}

function ajouterItineraire(id) {
  const i = ITINERAIRES.find(x => x.id === id); if (!i) return;
  let n = 0;
  i.etapes.forEach(e => { if (lieu(e.lieu) && !favoris.includes(e.lieu)) { favoris.push(e.lieu); n++; } });
  Store.set("favoris", favoris);
  annoncer(`${n} étape(s) ajoutée(s) au carnet.`);
  alert(n ? `${n} étape${n > 1 ? "s ajoutées" : " ajoutée"} à votre carnet.` : "Tout était déjà dans votre carnet.");
  majPastille();
}

async function partager(id) {
  const l = lieu(id); if (!l) return;
  const donnees = {
    title: l.nom + " — Karibu Maoré",
    text: `${l.nom} (${l.commune}) : ${l.resume}`,
    url: location.href
  };
  if (navigator.share) { try { await navigator.share(donnees); return; } catch { return; } }
  try { await navigator.clipboard.writeText(`${donnees.text}\n${donnees.url}`); alert("Copié, prêt à coller."); }
  catch { alert(donnees.text); }
}

function signaler(id) {
  const l = id ? lieu(id) : null;
  const t = `Signalement — Karibu Maoré\n\n` +
    (l ? `Fiche : ${l.nom} (${l.commune})\n\n` : "") +
    `Ce qui ne va pas :\n`;
  ouvrirWhatsApp(APP.contactWhatsApp, t);
}

function viderDemandes() {
  if (!confirm("Effacer toutes les demandes enregistrées sur cet appareil ?")) return;
  demandes = []; Store.set("demandes", demandes); rendre(true);
}

/* ------------------------------------------------------------ 14. ROUTAGE */
function go(route) { location.hash = "#" + route; }

/* On mémorise où l'utilisateur en était dans chaque liste : revenir d'une fiche
   vers Explorer en étant renvoyé tout en haut est le défaut le plus agaçant
   d'une appli de ce type. */
const positions = new Map();
let derniereRoute = "";
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
  if (derniereRoute && derniereRoute !== chemin) positions.set(derniereRoute, window.scrollY);

  vue.innerHTML = html;
  document.title = titre + " — Karibu Maoré";

  $$(".onglet").forEach(a => {
    const actif = a.dataset.r === "/" + (seg[0] || "");
    if (actif) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  majPastille();

  const nouvelleVue = seg[0] || "/";
  if (!sansScroll && nouvelleVue !== derniereVue) {
    const retrouve = positions.get(chemin);
    window.scrollTo({ top: retrouve || 0, behavior: "auto" });
    vue.focus({ preventScroll: true });
    if (!retrouve) annoncer(titre);
  }
  derniereVue = nouvelleVue;
  derniereRoute = chemin;
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
  else if (a === "retour")       { history.length > 1 ? history.back() : go("/"); }
  else if (a === "filtre")       { const c = el.dataset.champ, v = el.dataset.val;
                                   filtres[c] = (!v || filtres[c] === v) ? null : v; rendre(true); }
  else if (a === "reset-filtres"){ filtres = { cat:null, zone:null, budget:null, tag:null, q:"" };
                                   $("#q").value = ""; rendre(true); }
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

window.addEventListener("hashchange", () => rendre());
window.addEventListener("scroll", () => {
  $("#topbar").dataset.defile = window.scrollY > 8 ? "oui" : "non";
}, { passive: true });

/* --------------------------------------------------------- 16. DÉMARRAGE */
$("#logo-slot").innerHTML = UI.logo();
$("#btn-recherche").innerHTML = UI.icone("loupe");
$("#loupe-slot").innerHTML = UI.icone("loupe");
$("#btn-vider").innerHTML = UI.icone("croix");
const ICONES_ONGLETS = ["accueil", "boussole", "carte", "agenda", "sac"];
$$(".onglet .ico").forEach((s, i) => { s.innerHTML = UI.icone(ICONES_ONGLETS[i]); });

rendre();

/* ------------------------------------------------------- 17. HORS CONNEXION */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
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
