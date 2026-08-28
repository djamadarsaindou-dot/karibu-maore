/* =============================================================================
   KARIBU MAORÉ — bibliothèque visuelle
   -----------------------------------------------------------------------------
   L'appli doit fonctionner hors connexion et rester légère : pas une seule image
   bitmap, pas une seule police externe. Tout ce qui est illustré ici est du SVG
   généré à la volée, de façon DÉTERMINISTE : une fiche donnée aura toujours
   exactement la même vignette, sur tous les appareils et à chaque ouverture.
   ========================================================================== */

const UI = (() => {

  /* ---------------------------------------------------------------- ICÔNES
     Dessinées sur une grille 24, tracées au trait. Taille par défaut 1em pour
     qu'une icône glissée dans un texte ne prenne jamais toute la place.      */
  /* Tracés repris de Lucide (ISC), Tabler (MIT) et Simple Icons (CC0).
     Grille 24, trait 2, bouts et jonctions ronds — la géométrie native de
     Lucide, qui est exactement celle qu'attend icone(). Les crédits
     obligatoires sont dans LICENCES.md. */
  const D = {
    accueil:     { d: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /> <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />' },  // lucide/house
    loupe:       { d: '<path d="m21 21-4.34-4.34" /> <circle cx="11" cy="11" r="8" />' },  // lucide/search
    boussole:    { d: '<circle cx="12" cy="12" r="10" /> <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />' },  // lucide/compass
    carte:       { d: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" /> <path d="M15 5.764v15" /> <path d="M9 3.236v15" />' },  // lucide/map
    sac:         { d: '<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /> <path d="M8 10h8" /> <path d="M8 18h8" /> <path d="M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6" /> <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />' },  // lucide/backpack
    agenda:      { d: '<path d="M8 2v3" /> <path d="M16 2v3" /> <rect x="3" y="3" width="18" height="18" rx="2" /> <path d="M3 9h18" /> <path d="M8 13h.01" /> <path d="M12 13h.01" /> <path d="M16 13h.01" /> <path d="M8 17h.01" /> <path d="M12 17h.01" /> <path d="M16 17h.01" />' },  // lucide/calendar-days
    coeur:       { d: '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />' },  // lucide/heart
    partager:    { d: '<circle cx="18" cy="5" r="3" /> <circle cx="6" cy="12" r="3" /> <circle cx="18" cy="19" r="3" /> <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /> <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />' },  // lucide/share-2
    sortir:      { d: '<path d="M15 3h6v6" /> <path d="M10 14 21 3" /> <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />' },  // lucide/external-link
    fleche:      { d: '<path d="m15 18-6-6 6-6" />' },  // lucide/chevron-left
    croix:       { d: '<path d="M18 6 6 18" /> <path d="m6 6 12 12" />' },  // lucide/x
    moins:       { d: '<path d="M5 12h14" />' },  // lucide/minus
    plus:        { d: '<path d="M5 12h14" /> <path d="M12 5v14" />' },  // lucide/plus
    copie:       { d: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2" /> <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />' },  // lucide/copy
    imprimer:    { d: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /> <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" /> <rect x="6" y="14" width="12" height="8" rx="1" />' },  // lucide/printer
    drapeau:     { d: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" />' },  // lucide/flag
    message:     { d: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />' },  // lucide/message-circle
    whatsapp:    { d: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>', plein:true },  // simple/whatsapp
    telephone:   { d: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />' },  // lucide/phone
    info:        { d: '<circle cx="12" cy="12" r="10" /> <path d="M12 16v-4" /> <path d="M12 8h.01" />' },  // lucide/info
    alerte:      { d: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /> <path d="M12 9v4" /> <path d="M12 17h.01" />' },  // lucide/triangle-alert
    valide:      { d: '<circle cx="12" cy="12" r="10" /> <path d="m9 12 2 2 4-4" />' },  // lucide/circle-check
    etoile:      { d: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />' },  // lucide/star
    horloge:     { d: '<circle cx="12" cy="12" r="10" /> <path d="M12 6v6l4 2" />' },  // lucide/clock
    livre:       { d: '<path d="M12 5v16" /> <path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />' },  // lucide/book-open
    gens:        { d: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /> <path d="M16 3.128a4 4 0 0 1 0 7.744" /> <path d="M22 21v-2a4 4 0 0 0-3-3.87" /> <circle cx="9" cy="7" r="4" />' },  // lucide/users
    epingle:     { d: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /> <circle cx="12" cy="10" r="3" />' },  // lucide/map-pin
    vagues:      { d: '<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0" /> <path d="M2 19q2.5 2 5 0t5 0 5 0 5 0" /> <path d="M2 5q2.5 2 5 0t5 0 5 0 5 0" />' },  // lucide/waves-horizontal
    goutte:      { d: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />' },  // lucide/droplet
    soleil:      { d: '<circle cx="12" cy="12" r="4" /> <path d="M12 2v2" /> <path d="M12 20v2" /> <path d="m4.93 4.93 1.41 1.41" /> <path d="m17.66 17.66 1.41 1.41" /> <path d="M2 12h2" /> <path d="M20 12h2" /> <path d="m6.34 17.66-1.41 1.41" /> <path d="m19.07 4.93-1.41 1.41" />' },  // lucide/sun
    lune:        { d: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />' },  // lucide/moon
    feuille:     { d: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /> <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />' },  // lucide/leaf
    montagne:    { d: '<path d="m8 3 4 8 5-5 5 15H2L8 3z" />' },  // lucide/mountain
    palmier:     { d: '<path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4" /> <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3" /> <path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35" /> <path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14" />' },  // lucide/tree-palm
    poisson:     { d: '<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" /> <path d="M18 12v.5" /> <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" /> <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" /> <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" /> <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" />' },  // lucide/fish
    voilier:     { d: '<path d="M10 2v15" /> <path d="M7 22a4 4 0 0 1-4-4 1 1 0 0 1 1-1h16a1 1 0 0 1 1 1 4 4 0 0 1-4 4z" /> <path d="M9.159 2.46a1 1 0 0 1 1.521-.193l9.977 8.98A1 1 0 0 1 20 13H4a1 1 0 0 1-.824-1.567z" />' },  // lucide/sailboat
    empreintes:  { d: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" /> <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" /> <path d="M16 17h4" /> <path d="M4 13h4" />' },  // lucide/footprints
    plage:       { d: '<path d="M17.553 16.75a7.5 7.5 0 0 0 -10.606 0" /> <path d="M18 3.804a6 6 0 0 0 -8.196 2.196l10.392 6a6 6 0 0 0 -2.196 -8.196" /> <path d="M16.732 10c1.658 -2.87 2.225 -5.644 1.268 -6.196c-.957 -.552 -3.075 1.326 -4.732 4.196" /> <path d="M15 9l-3 5.196" /> <path d="M3 19.25a2.4 2.4 0 0 1 1 -.25a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 1 .25" />' },  // tabler/beach
    mosquee:     { d: '<path d="M3 21h7v-2a2 2 0 1 1 4 0v2h7" /> <path d="M4 21v-10" /> <path d="M20 21v-10" /> <path d="M4 16h3v-3h10v3h3" /> <path d="M17 13a5 5 0 0 0 -10 0" /> <path d="M21 10.5c0 -.329 -.077 -.653 -.224 -.947l-.776 -1.553l-.776 1.553a2.118 2.118 0 0 0 -.224 .947a.5 .5 0 0 0 .5 .5h1a.5 .5 0 0 0 .5 -.5" /> <path d="M5 10.5c0 -.329 -.077 -.653 -.224 -.947l-.776 -1.553l-.776 1.553a2.118 2.118 0 0 0 -.224 .947a.5 .5 0 0 0 .5 .5h1a.5 .5 0 0 0 .5 -.5" /> <path d="M12 2a2 2 0 1 0 2 2" /> <path d="M12 6v2" />' },  // tabler/building-mosque
    couverts:    { d: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /> <path d="M7 2v20" /> <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />' },  // lucide/utensils
    voiture:     { d: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /> <circle cx="7" cy="17" r="2" /> <path d="M9 17h6" /> <circle cx="17" cy="17" r="2" />' },  // lucide/car
    bus:         { d: '<path d="M8 6v6" /> <path d="M15 6v6" /> <path d="M2 12h19.6" /> <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" /> <circle cx="7" cy="18" r="2" /> <path d="M9 18h5" /> <circle cx="16" cy="18" r="2" />' },  // lucide/bus
    appareil:    { d: '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" /> <circle cx="12" cy="13" r="3" />' },  // lucide/camera
    vent:        { d: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2" /> <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" /> <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />' },  // lucide/wind
  };


  function icone(nom, cls = "") {
    const e = D[nom] || D.info;
    if (e.plein) {
      return `<svg class="i${cls ? " " + cls : ""}" width="1em" height="1em" viewBox="0 0 24 24"
        fill="currentColor" stroke="none" aria-hidden="true" focusable="false">${e.d}</svg>`;
    }
    const d = e.d;
    return `<svg class="i${cls ? " " + cls : ""}" width="1em" height="1em" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  }

  /* ------------------------------------------------------- ALÉA DÉTERMINISTE */
  function graine(txt) {
    let h = 2166136261;
    for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function dé(seed) {
    let s = (seed || 1) >>> 0;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; };
  }

  /* --------------------------------------------------------------- PALETTES
     Trois ambiances par catégorie (matin clair, plein jour, fin de journée) :
     deux fiches voisines ne se ressemblent jamais tout à fait.               */
  const PAL = {
    nature: [
      { ciel:["#e4f4e7","#b6dfc4"], astre:"#f6d06a", loin:"#8ccBa4", moyen:"#4f9d75", pres:"#2b6b4d", detail:"#1d4d38" },
      { ciel:["#dff0ef","#9fd3cf"], astre:"#ffe08a", loin:"#79c0a8", moyen:"#3f9377", pres:"#215c50", detail:"#173f38" },
      { ciel:["#fdefd9","#f0c9a0"], astre:"#f79c42", loin:"#c9a670", moyen:"#7f8f5c", pres:"#4a5f3d", detail:"#33452b" }
    ],
    plage: [
      { ciel:["#eaf7fc","#b6e3f3"], astre:"#ffdf9a", loin:"#7fd3e0", moyen:"#2fa7bd", pres:"#f2e2c4", detail:"#8a6b3f" },
      { ciel:["#e6f6f6","#98d9d6"], astre:"#fff0b8", loin:"#5cc6cd", moyen:"#1d8fa5", pres:"#ecdcbd", detail:"#7a5c36" },
      { ciel:["#ffeedd","#ffc79a"], astre:"#ff8a4a", loin:"#e8a37f", moyen:"#b96a55", pres:"#f3ddb9", detail:"#6d4a2c" }
    ],
    mer: [
      { ciel:["#dcefF8","#8ec6e2"], astre:"#ffe9ad", loin:"#3a90b8", moyen:"#1c6b93", pres:"#0e4a6d", detail:"#f2fbff" },
      { ciel:["#e8f4fa","#a9d8ea"], astre:"#fff3c4", loin:"#4fa6c4", moyen:"#26789c", pres:"#144f70", detail:"#eefaff" },
      { ciel:["#fde9d8","#f0b184"], astre:"#ff7a3d", loin:"#c97f7a", moyen:"#7a5a78", pres:"#33395c", detail:"#ffe9d0" }
    ],
    culture: [
      { ciel:["#f1e9f8","#c9b1e4"], astre:"#ffe08a", loin:"#a288cc", moyen:"#6a4f9c", pres:"#41306a", detail:"#f6f0ff" },
      { ciel:["#eef0fa","#b9c0e6"], astre:"#ffeaa8", loin:"#8f9bd0", moyen:"#5a63a6", pres:"#343a6f", detail:"#f4f6ff" },
      { ciel:["#fdefdf","#f2c896"], astre:"#f59a3c", loin:"#c99a72", moyen:"#8d6448", pres:"#4f3a2e", detail:"#fff3e2" }
    ],
    food: [
      { ciel:["#fdf0de","#f6cc9f"], astre:"#ff9f4a", loin:"#e8b36a", moyen:"#c8703a", pres:"#8f4a24", detail:"#fff6e8" },
      { ciel:["#fdeee9","#f2b8a4"], astre:"#ff7a5c", loin:"#dd9a7a", moyen:"#b0563c", pres:"#6f3221", detail:"#fff2ec" },
      { ciel:["#f6f2e0","#ddd39c"], astre:"#e8c34a", loin:"#c4b673", moyen:"#8d7f3f", pres:"#544b21", detail:"#fbf8ea" }
    ],
    famille: [
      { ciel:["#fdeaf0","#f6c2d3"], astre:"#ffd07a", loin:"#e894ac", moyen:"#c96486", pres:"#8e3f5a", detail:"#fff0f5" },
      { ciel:["#eef6ea","#c2e0b8"], astre:"#ffd98e", loin:"#9ac98a", moyen:"#5e9a58", pres:"#37633a", detail:"#f2fbef" },
      { ciel:["#eaf1f8","#bcd0e6"], astre:"#ffe6a8", loin:"#8fa8c9", moyen:"#5c749b", pres:"#374a68", detail:"#f2f7ff" }
    ],
    pratique: [
      { ciel:["#eaf0f3","#bacdd7"], astre:"#f2e6c4", loin:"#93aab6", moyen:"#63808f", pres:"#3f5a69", detail:"#f4f9fb" },
      { ciel:["#eef2ef","#c3d2c8"], astre:"#f0e8c8", loin:"#9db4a6", moyen:"#688271", pres:"#3f5749", detail:"#f6faf7" },
      { ciel:["#fbeee2","#e0bfa1"], astre:"#f0a05c", loin:"#bd9a80", moyen:"#8a6a55", pres:"#4f3c31", detail:"#fff4e9" }
    ]
  };

  /* ------------------------------------------------------------- PRIMITIVES */
  function onde(y, amp, phase, w, h) {
    const n = 4, dx = w / n;
    let d = `M0 ${(y + Math.sin(phase) * amp).toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const x1 = (i + 1) * dx;
      const y0 = y + Math.sin(phase + i * 1.7) * amp;
      const y1 = y + Math.sin(phase + (i + 1) * 1.7) * amp;
      d += ` C ${(i * dx + dx / 3).toFixed(1)} ${y0.toFixed(1)}, ${(x1 - dx / 3).toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d + ` L ${w} ${h} L 0 ${h} Z`;
  }
  const pic = (x, base, haut, larg) =>
    `M${(x - larg).toFixed(1)} ${base.toFixed(1)} L${x.toFixed(1)} ${(base - haut).toFixed(1)} L${(x + larg).toFixed(1)} ${base.toFixed(1)} Z`;

  function oiseaux(r, w, h, n) {
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = 30 + r() * (w - 90), y = 18 + r() * (h * .28), t = 3 + r() * 3;
      s += `<path d="M${x} ${y} q${t} ${-t} ${t * 2} 0 q${t} ${-t} ${t * 2} 0"/>`;
    }
    return `<g fill="none" stroke="currentColor" stroke-width="1.4" opacity=".35"
      stroke-linecap="round">${s}</g>`;
  }
  function astre(p, r, w, h) {
    const gauche = r() < .5;
    const cx = gauche ? 42 + r() * 26 : w - 42 - r() * 26;
    const cy = 26 + r() * 16, rad = 11 + r() * 7;
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}"
      fill="${p.astre}" opacity=".92"/>`;
  }
  function cocotier(x, sol, sens, p, ech = 1) {
    const t = 46 * ech;
    return `<g transform="translate(${x} ${sol})">
      <path d="M0 0 q${-6 * sens * ech} ${-t * .6} ${8 * sens * ech} ${-t}"
        fill="none" stroke="${p.detail}" stroke-width="${3.4 * ech}" stroke-linecap="round"/>
      <g transform="translate(${8 * sens * ech} ${-t})" fill="#2f8f5b">
        <path d="M0 0 q-22 -10 -30 2 q16 -4 30 2z"/><path d="M0 0 q22 -10 30 2 q-16 -4 -30 2z"/>
        <path d="M0 0 q-6 -22 -22 -24 q12 10 20 26z"/><path d="M0 0 q10 -20 26 -20 q-14 8 -22 24z"/>
        <circle cx="0" cy="2" r="3" fill="${p.astre}"/>
      </g></g>`;
  }

  /* ------------------------------------------------ SCÈNES PAR CATÉGORIE */
  const SCENES = {
    nature(p, r, w, h, v) {
      /* variante 1 : le plan d'eau — lac de cratère, retenue, mangrove.
         Le cratère se lit à la double couronne autour de l'eau. */
      if (v === 1) {
        const cx = w * .5 + (r() - .5) * 30, cy = h * .66;
        return `${astre(p, r, w, h)}
          <path d="${onde(h * .46, 5, r() * 6, w, h)}" fill="${p.loin}" opacity=".55"/>
          <path d="M${(cx - 130).toFixed(0)} ${(cy + 26).toFixed(0)}
                   q40 -62 130 -62 q90 0 130 62z" fill="${p.moyen}" opacity=".95"/>
          <ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="86" ry="30" fill="${p.pres}" opacity=".55"/>
          <ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="76" ry="25" fill="#2f8f5b"/>
          <ellipse cx="${cx.toFixed(0)}" cy="${(cy - 2).toFixed(0)}" rx="60" ry="18"
            fill="${p.astre}" opacity=".22"/>
          <path d="${onde(h * .90, 3, 3 + r() * 3, w, h)}" fill="${p.detail}" opacity=".9"/>
          <g color="${p.pres}">${oiseaux(r, w, h, 3)}</g>`;
      }
      /* variante 3 : la chute d'eau qui tombe de la falaise jusqu'à la mer */
      if (v === 3) {
        const fx = w * .58 + (r() - .5) * 40, mer = h * .78;
        return `${astre(p, r, w, h)}
          <path d="${onde(h * .52, 4, r() * 6, w, h)}" fill="${p.loin}" opacity=".5"/>
          <path d="M0 ${h} L0 ${(h * .34).toFixed(0)} q${(fx * .5).toFixed(0)} -14 ${fx.toFixed(0)} 6
                   L${fx.toFixed(0)} ${mer.toFixed(0)} L0 ${mer.toFixed(0)} Z" fill="${p.moyen}"/>
          <path d="M0 ${(h * .40).toFixed(0)} q${(fx * .5).toFixed(0)} -14 ${fx.toFixed(0)} 8
                   L${fx.toFixed(0)} ${(h * .52).toFixed(0)} q-${(fx * .5).toFixed(0)} -8 -${fx.toFixed(0)} 4 Z"
                fill="${p.pres}" opacity=".65"/>
          <g fill="#eaf7fb" opacity=".92">
            <path d="M${(fx - 13).toFixed(0)} ${(h * .40).toFixed(0)} h26 l6 ${(mer - h * .40).toFixed(0)} h-38z"/>
          </g>
          <g fill="#ffffff" opacity=".55">
            <ellipse cx="${fx.toFixed(0)}" cy="${mer.toFixed(0)}" rx="26" ry="7"/></g>
          <path d="${onde(mer, 3, 3 + r() * 3, w, h)}" fill="${p.detail}" opacity=".85"/>
          <g color="${p.pres}">${oiseaux(r, w, h, 2)}</g>`;
      }
      const sol = h * .82;
      const n = 2 + Math.floor(r() * 2);
      let monts = "";
      for (let i = 0; i < n; i++) {
        const x = 60 + (i * (w - 130)) / Math.max(1, n - 1) + (r() - .5) * 26;
        const haut = h * (.30 + r() * .26), larg = 42 + r() * 28;
        monts += `<path d="${pic(x, sol + 6, haut, larg)}" fill="${i % 2 ? p.moyen : p.pres}"
          opacity="${(0.82 + i * .06).toFixed(2)}"/>`;
        monts += `<path d="M${x} ${(sol + 6 - haut).toFixed(1)} L${(x + larg).toFixed(1)} ${(sol + 6).toFixed(1)} L${(x + larg * .25).toFixed(1)} ${(sol + 6).toFixed(1)} Z"
          fill="#000" opacity=".10"/>`;
      }
      return `${astre(p, r, w, h)}
        <path d="${onde(h * .58, 5, r() * 6, w, h)}" fill="${p.loin}" opacity=".5"/>
        ${monts}
        <path d="${onde(sol + 4, 3, 2 + r() * 4, w, h)}" fill="${p.detail}" opacity=".9"/>
        ${v === 2 ? `<g fill="${p.detail}" opacity=".55">
            <path d="M18 ${h} q3 -18 -3 -30 q10 6 8 18 q6 -10 14 -12 q-8 8 -10 24z"/></g>`
          : `<g fill="${p.moyen}" opacity=".5"><ellipse cx="${(w - 34).toFixed(0)}" cy="${(h - 8).toFixed(0)}" rx="26" ry="9"/></g>`}
        <g color="${p.pres}">${oiseaux(r, w, h, 2 + Math.floor(r() * 2))}</g>`;
    },

    plage(p, r, w, h, v) {
      /* variante 2 : le banc de sable au milieu du lagon — pas de plage, pas
         d'arbre, juste un croissant clair posé sur l'eau. */
      if (v === 2) {
        const cx = w * .5 + (r() - .5) * 40, cy = h * .62;
        return `${astre(p, r, w, h)}
          <path d="${onde(h * .34, 2, r() * 6, w, h)}" fill="${p.loin}" opacity=".8"/>
          <path d="${onde(h * .50, 3, 2 + r() * 4, w, h)}" fill="${p.moyen}" opacity=".9"/>
          <g>
            <ellipse cx="${cx.toFixed(0)}" cy="${(cy + 4).toFixed(0)}" rx="86" ry="17"
              fill="${p.loin}" opacity=".5"/>
            <path d="M${(cx - 74).toFixed(0)} ${cy.toFixed(0)}
                     q74 -26 148 0 q-74 16 -148 0z" fill="${p.pres}"/>
            <path d="M${(cx - 52) .toFixed(0)} ${(cy - 2).toFixed(0)} q52 -14 104 0"
              fill="none" stroke="#fff" stroke-width="2" opacity=".45"/>
          </g>
          <path d="${onde(h * .84, 4, 4 + r() * 3, w, h)}" fill="${p.moyen}" opacity=".75"/>
          <g stroke="#fff" stroke-width="1.5" opacity=".35" fill="none" stroke-linecap="round">
            <path d="M30 ${(h * .92).toFixed(0)} q14 -6 28 0 M${(w - 74).toFixed(0)} ${(h * .90).toFixed(0)} q14 -6 28 0"/></g>
          <g color="${p.detail}">${oiseaux(r, w, h, 3)}</g>`;
      }
      const horizon = h * .40 + r() * 8;
      const sable = h * .70 + r() * 6;
      const ilot = r() < .5
        ? `<path d="M${(w * .62).toFixed(0)} ${horizon.toFixed(1)} q14 -12 28 0z" fill="${p.moyen}" opacity=".65"/>` : "";
      return `${astre(p, r, w, h)}
        ${ilot}
        <path d="${onde(horizon, 2, r() * 6, w, h)}" fill="${p.loin}" opacity=".85"/>
        <path d="${onde(horizon + 16, 3, 1 + r() * 5, w, h)}" fill="${p.moyen}" opacity=".9"/>
        <path d="${onde(sable, 4, 3 + r() * 4, w, h)}" fill="${p.pres}"/>
        <g stroke="${p.detail}" stroke-width="1.5" opacity=".25" fill="none" stroke-linecap="round">
          <path d="M20 ${(sable + 14).toFixed(0)} q16 -6 32 0 M120 ${(sable + 22).toFixed(0)} q16 -6 32 0
                   M230 ${(sable + 12).toFixed(0)} q16 -6 32 0"/></g>
        ${v === 0 ? cocotier(52 + r() * 20, h - 4, -1, p, .95) : ""}
        ${v === 1 ? cocotier(w - 60 - r() * 20, h - 4, 1, p, .85) + cocotier(46, h - 2, -1, p, .65) : ""}
        <g color="${p.detail}">${oiseaux(r, w, h, 2)}</g>`;
    },

    mer(p, r, w, h, v) {
      const horizon = h * .34;
      const cx = 96 + r() * 110;
      const sujets = [
        /* queue de baleine */
        `<g fill="${p.pres}"><path d="M${cx} ${h * .66} q18 -8 28 -30 q5 18 -7 28 q12 -3 19 -14 q-3 24 -25 24 q-18 0 -15 -8z"/></g>`,
        /* aileron + souffle */
        `<g fill="${p.pres}"><path d="M${cx} ${h * .64} q6 -26 22 -32 q-4 20 -6 32z"/>
          <ellipse cx="${cx + 6}" cy="${h * .66}" rx="34" ry="6" opacity=".5"/></g>
         <g stroke="${p.detail}" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round">
          <path d="M${cx + 30} ${h * .5} q4 -14 12 -18 M${cx + 34} ${h * .5} q10 -10 20 -10"/></g>`,
        /* petite barque */
        `<g fill="${p.pres}"><path d="M${cx - 30} ${h * .60} h60 l-10 12 h-40z"/>
          <path d="M${cx} ${h * .60} v-26 l20 22z" fill="${p.detail}" opacity=".9"/></g>`
      ];
      return `${astre(p, r, w, h)}
        <path d="${onde(horizon, 2, r() * 6, w, h)}" fill="${p.loin}" opacity=".55"/>
        <path d="${onde(h * .52, 4, 2 + r() * 5, w, h)}" fill="${p.moyen}" opacity=".85"/>
        ${sujets[v]}
        <path d="${onde(h * .76, 5, 4 + r() * 4, w, h)}" fill="${p.pres}"/>
        <g stroke="${p.detail}" stroke-width="1.6" opacity=".35" fill="none" stroke-linecap="round">
          <path d="M26 ${(h * .88).toFixed(0)} q12 -6 24 0 M${(w - 70).toFixed(0)} ${(h * .84).toFixed(0)} q12 -6 24 0"/></g>`;
    },

    culture(p, r, w, h, v) {
      const cx = w * .5 + (r() - .5) * 70;
      const sol = h * .86;
      const bati = v === 0
        ? `<rect x="${cx - 46}" y="${h * .52}" width="92" height="${sol - h * .52}" rx="4" fill="${p.pres}"/>
           <path d="M${cx - 30} ${h * .52} a30 26 0 0 1 60 0z" fill="${p.pres}"/>
           <circle cx="${cx}" cy="${h * .24}" r="5" fill="${p.astre}"/>
           <rect x="${cx + 42}" y="${h * .34}" width="12" height="${sol - h * .34}" rx="3" fill="${p.moyen}"/>
           <circle cx="${cx + 48}" cy="${h * .32}" r="6.5" fill="${p.moyen}"/>`
        : v === 1
        /* la fête : une rangée de silhouettes, bras levés — debaa, mbiwi,
           manzaraka. Des arcades toutes seules ressemblaient à des pierres. */
        ? `<g fill="${p.pres}">
             ${[0, 1, 2, 3].map(i => {
               const x = cx - 60 + i * 40, ht = 34 + (i % 2) * 8;
               return `<g opacity="${(1 - i * .06).toFixed(2)}">
                 <path d="M${x - 12} ${sol} v-${ht} a12 ${ht * .45} 0 0 1 24 0 v${ht}z"/>
                 <circle cx="${x}" cy="${sol - ht - 9}" r="8"/>
                 <path d="M${x - 11} ${sol - ht + 4} q-14 -10 -18 -24" fill="none"
                   stroke="${p.pres}" stroke-width="4.5" stroke-linecap="round"/>
                 <path d="M${x + 11} ${sol - ht + 4} q14 -10 18 -24" fill="none"
                   stroke="${p.pres}" stroke-width="4.5" stroke-linecap="round"/>
               </g>`;
             }).join("")}
           </g>`
        : `<g fill="${p.pres}">
             <path d="M${cx - 40} ${sol} v-46 h80 v46z"/>
             <path d="M${cx - 52} ${h * .40} h104 l-12 14 h-80z" fill="${p.moyen}"/>
           </g>`;
      return `${astre(p, r, w, h)}
        <path d="${onde(h * .70, 3, r() * 6, w, h)}" fill="${p.loin}" opacity=".45"/>
        ${bati}
        <g fill="${p.detail}" opacity=".9">
          <path d="M${cx - 24} ${sol} v-20 a9 9 0 0 1 18 0 v20z"/>
          <path d="M${cx + 8} ${sol} v-20 a9 9 0 0 1 18 0 v20z"/></g>
        <path d="${onde(sol + 2, 2, 3, w, h)}" fill="${p.moyen}" opacity=".9"/>
        <g stroke="${p.moyen}" stroke-width="1.4" opacity=".45" fill="none">
          <path d="M16 26 l6 6 -6 6 -6 -6z M${(w - 26).toFixed(0)} 64 l5 5 -5 5 -5 -5z"/></g>`;
    },

    food(p, r, w, h, v) {
      const cx = w / 2 + (r() - .5) * 46, plan = h * .70;
      const sujet = v === 0
        ? `<path d="M${cx - 48} ${h * .50} h96 a48 34 0 0 1 -96 0z" fill="${p.moyen}"/>
           <ellipse cx="${cx}" cy="${h * .50}" rx="48" ry="7" fill="${p.pres}"/>`
        : v === 1
        ? `<g fill="${p.pres}"><rect x="${cx - 52}" y="${h * .52}" width="104" height="12" rx="5"/></g>
           <g stroke="${p.detail}" stroke-width="3.4" stroke-linecap="round">
             ${[0, 1, 2].map(i => `<path d="M${cx - 34 + i * 34} ${h * .52} v-26"/>`).join("")}
           </g>
           <g fill="${p.astre}">${[0, 1, 2].map(i =>
             `<circle cx="${cx - 34 + i * 34}" cy="${h * .34}" r="7"/>
              <circle cx="${cx - 34 + i * 34}" cy="${h * .46}" r="7"/>`).join("")}</g>`
        : `<g fill="${p.moyen}"><circle cx="${cx - 22}" cy="${h * .52}" r="18"/>
             <circle cx="${cx + 14}" cy="${h * .50}" r="22"/></g>
           <g fill="${p.pres}"><path d="M${cx - 22} ${h * .34} q6 -10 -2 -16 M${cx + 14} ${h * .28} q7 -10 -2 -16"
             fill="none" stroke="${p.pres}" stroke-width="2.4" stroke-linecap="round"/></g>`;
      return `<path d="${onde(h * .52, 3, r() * 6, w, h)}" fill="${p.loin}" opacity=".35"/>
        ${sujet}
        <rect x="0" y="${plan}" width="${w}" height="${h - plan}" fill="${p.pres}" opacity=".9"/>
        <g fill="${p.astre}" opacity=".85">
          <circle cx="${(cx - 76).toFixed(0)}" cy="${(plan + 16).toFixed(0)}" r="6"/>
          <circle cx="${(cx + 82).toFixed(0)}" cy="${(plan + 12).toFixed(0)}" r="5"/>
          <circle cx="${(cx + 62).toFixed(0)}" cy="${(plan + 24).toFixed(0)}" r="4"/></g>`;
    },

    famille(p, r, w, h, v) {
      const cx = 110 + r() * 80, sol = h * .84;
      const sujet = v === 2
        ? `<g fill="${p.pres}">
             <ellipse cx="${cx}" cy="${sol - 16}" rx="30" ry="20"/>
             <circle cx="${cx + 30}" cy="${sol - 24}" r="8"/>
             <path d="M${cx - 26} ${sol - 4} l-10 10 M${cx + 18} ${sol - 2} l10 10"
               stroke="${p.pres}" stroke-width="6" stroke-linecap="round"/></g>
           <g fill="${p.detail}" opacity=".5"><ellipse cx="${cx}" cy="${sol - 16}" rx="18" ry="11"/></g>`
        : `<g fill="${p.pres}">
             <circle cx="${cx}" cy="${sol - 30}" r="15"/>
             <path d="M${cx - 13} ${sol - 36} l-6 -12 12 4z M${cx + 13} ${sol - 36} l6 -12 -12 4z"/>
             <path d="M${cx - 10} ${sol - 16} q10 16 20 0 q10 18 -10 22 q-20 -4 -10 -22z"/>
             <circle cx="${cx + 36}" cy="${sol - 20}" r="10"/>
             <path d="M${cx + 28} ${sol - 25} l-4 -9 9 3z M${cx + 44} ${sol - 25} l4 -9 -9 3z"/></g>
           <g fill="${p.detail}"><circle cx="${cx - 5}" cy="${sol - 32}" r="2.4"/>
             <circle cx="${cx + 5}" cy="${sol - 32}" r="2.4"/></g>`;
      return `${astre(p, r, w, h)}
        <path d="${onde(h * .56, 4, r() * 6, w, h)}" fill="${p.loin}" opacity=".5"/>
        <path d="${onde(h * .74, 3, 2 + r() * 4, w, h)}" fill="${p.moyen}" opacity=".75"/>
        ${sujet}
        <path d="${onde(sol + 8, 2, 4, w, h)}" fill="${p.pres}" opacity=".85"/>`;
    },

    pratique(p, r, w, h, v) {
      const cx = w / 2, ligne = h * .68;
      const sujet = v === 1
        ? `<g fill="${p.pres}"><path d="M${cx - 66} ${ligne} h132 l-18 22 h-96z"/>
             <rect x="${cx - 38}" y="${ligne - 30}" width="76" height="30" rx="4"/></g>
           <g fill="${p.detail}">${[0, 1, 2].map(i =>
             `<rect x="${cx - 30 + i * 24}" y="${ligne - 24}" width="17" height="13" rx="2"/>`).join("")}</g>`
        : v === 2
        ? `<g stroke="${p.pres}" stroke-width="7" stroke-linecap="round" fill="none">
             <path d="M${cx} ${h} v-${h * .42}"/></g>
           <g fill="${p.pres}">
             <path d="M${cx} ${h * .40} h64 l-12 12 h-52z"/>
             <path d="M${cx} ${h * .56} h-58 l12 12 h46z" opacity=".8"/></g>`
        : `<g fill="${p.pres}">
             <path d="M0 ${h * .78} q${w * .5} -22 ${w} 0 v${h} h-${w}z"/></g>
           <g stroke="${p.detail}" stroke-width="3.4" stroke-dasharray="14 12" opacity=".8" fill="none">
             <path d="M0 ${h * .89} q${w * .5} -22 ${w} 0"/></g>`;
      return `${astre(p, r, w, h)}
        <path d="${onde(h * .48, 3, r() * 6, w, h)}" fill="${p.loin}" opacity=".45"/>
        <path d="${onde(h * .60, 3, 2 + r() * 4, w, h)}" fill="${p.moyen}" opacity=".6"/>
        ${sujet}`;
    }
  };

  /* ----------------------------------------------------- CHOIX DE LA SCÈNE
     La variante est d'abord choisie sur le SENS de la fiche (une queue de
     baleine pour les baleines, une terre ocre pour les padzas), et seulement
     à défaut sur le hachage de l'identifiant.                               */
  /* [expression, variante de scène, palette imposée (facultatif)] */
  const INDICES = {
    nature:   [[/lac|dziani|barrage|retenue|mangrove/i, 1], [/cascade|chute/i, 3],
               [/padza|terre rouge/i, 2, 2], [/mont|pic|sommet|sentier|randonn|forêt|foret/i, 0]],
    plage:    [[/îlot|ilot|sable blanc|banc de sable/i, 2], [/badamiers|baie|kite|digue/i, 1],
               [/plage|mtsanga|crique/i, 0]],
    mer:      [[/baleine|dauphin|cétacé|cetace/i, 0], [/plong|snorkel|masque|passe|récif|recif/i, 1],
               [/pêche|peche|bateau|tour|kayak|paddle|kite/i, 2]],
    culture:  [[/mosqu|musée|musee/i, 0], [/march|distiller|ylang/i, 2],
               [/danse|mariage|poter|debaa|manzaraka/i, 1]],
    food:     [[/brochett|voul|grill/i, 1], [/mkatra|thé au|galette|petit-déj/i, 2],
               [/mataba|poulet|atelier|cuisine/i, 0]],
    famille:  [[/maki|lémur|lemur/i, 0], [/tortue/i, 2], [/enfant|famille/i, 1]],
    pratique: [[/barge|bateau|traversée|traversee/i, 1], [/taxi|voiture|route|circuler/i, 0], [/./, 2]]
  };
  /* La SCÈNE vient du sens de la fiche ; la PALETTE vient de son identifiant.
     Sans cette séparation, toutes les randonnées auraient exactement la même
     couleur — c'est ce qui rendait les cartes indiscernables. */
  function variante(famille, indice, id) {
    let v = null, pal = null;
    for (const [re, sc, p] of (INDICES[famille] || [])) {
      if (indice && re.test(indice)) { v = sc; if (p !== undefined) pal = p; break; }
    }
    if (v === null) v = graine(id) % 3;
    if (pal === null) pal = graine(id + "·palette") % PAL[famille].length;
    return { v, pal };
  }


  /* ---------------------------------------------------------- LA TRAME
     Claustra — inspirée des parpaings ajourés et des garde-corps des façades
     mahoraises contemporaines (DAC Mayotte / ministère de la Culture,
     « Patrimoine du XXe siècle. Une architecture mahoraise »).
     On écrit « inspiré des claustras », jamais « motif traditionnel » : il
     n'existe aucun corpus normé, ce sont des modèles industriels et des
     variations locales.
     Deux losanges imbriqués, EN TRAITS DROITS UNIQUEMENT : aucun arc, aucune
     niche, aucune forme d'arche, pour qu'aucune lecture de mihrab ne soit
     possible. Le mihrab indique la direction de la prière ; ce n'est pas une
     forme disponible. Opacité 5 à 7 %, jamais au-delà : au-delà c'est un décor. */
  function claustra() {
    return `<svg width="0" height="0" aria-hidden="true" focusable="false"
      style="position:absolute"><defs>
      <pattern id="km-claustra" width="48" height="48" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="miter">
          <path d="M24 0 L48 24 L24 48 L0 24 Z"/>
          <path d="M24 13 L35 24 L24 35 L13 24 Z"/>
          <path d="M0 0 L6 6 M48 0 L42 6 M0 48 L6 42 M48 48 L42 42"/>
        </g>
      </pattern></defs></svg>`;
  }

  /* ----------------------------------------------------------- LE SCEAU
     Le double arc inégal : la double barrière récifale, que moins d'une
     dizaine de sites au monde possèdent. Ce n'est PAS un motif répété — c'est
     un sceau, une fois par écran au maximum. */
  function sceau(cls = "") {
    return `<svg class="sceau${cls ? " " + cls : ""}" viewBox="0 0 120 40"
      aria-hidden="true" focusable="false" fill="none" stroke="currentColor"
      stroke-linecap="round">
      <path d="M4 33 C 34 5, 86 5, 116 33" stroke-width="3"/>
      <path d="M20 36 C 44 21, 76 21, 100 36" stroke-width="1.5" opacity=".7"/>
    </svg>`;
  }

  /* ------------------------------------------------------------- CARTOUCHE
     Ce qui s'affiche sur une fiche qui n'a pas de photographie.

     D'OÙ ÇA VIENT. Un aplat de la couleur de la catégorie, parcouru de lignes
     gravées parallèles, décalées et fondues. Le vocabulaire est repris du
     DÉCOR D'INCISIONS ET DE STRIES de la poterie traditionnelle de Mayotte,
     inscrite à l'inventaire national du patrimoine culturel immatériel (2024).

     POURQUOI C'EST DÉFENDABLE. On ne cite aucun motif : on reprend un PROCÉDÉ
     de décor — inciser, strier — que la fiche officielle décrit effectivement,
     là où elle ne décrit aucun répertoire de motifs nommés. Il n'y a ici ni
     visage, ni symbole religieux, ni forme d'arche. Le profil est dérivé d'un
     hachage du nom de la fiche : unique, stable, reproductible.

     CE QU'ON NE FAIT PAS. Aucune trame dérivée du m'sindzano. Le geste existe
     et il est documenté, mais il n'appartient pas à un corpus : il appartient
     aux femmes qui l'inventent. La seule façon propre serait de commander la
     trame à une praticienne mahoraise, de la rémunérer et de la créditer
     nommément. Tant que cette commande n'a pas eu lieu, la case reste vide.  */

  const CARTOUCHE = {
    mer:      { fond: "#0a3a57", trait: "#1da9a2", sceau: true  },
    plage:    { fond: "#0a3a57", trait: "#1da9a2", sceau: true  },
    nature:   { fond: "#2f5d3a", trait: "#c4b63e", sceau: false },
    culture:  { fond: "#241f1d", trait: "#c4b63e", sceau: false },
    food:     { fond: "#a9502b", trait: "#f4ede2", sceau: false },
    famille:  { fond: "#a9502b", trait: "#f4ede2", sceau: false },
    pratique: { fond: "#f4ede2", trait: "#5e5a51", sceau: false }
  };

  /* Profil déterministe : même nom de fiche → même gravure, pour toujours. */
  function profilGrave(cle, points = 9, larg = 320, base = 96, amp = 15) {
    let h = graine(cle), d = "";
    const pas = larg / (points - 1);
    for (let i = 0; i < points; i++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff;      // générateur reproductible
      const y = base + ((h % 2001) / 1000 - 1) * amp; // ± amp autour de la ligne
      d += (i ? " L" : "M") + Math.round(-8 + i * pas * 1.05) + " " + Math.round(y);
    }
    return d;
  }

  function cartouche(id, categorie, opt = {}) {
    const h = opt.haut ? 160 : 140;
    const c = CARTOUCHE[categorie] || CARTOUCHE.pratique;
    const p = profilGrave(id + "|" + categorie);
    /* Sept strates au maximum, jamais animées : un cartouche doit se lire
       comme une matière, pas comme une infographie. */
    const strates = [.95, .8, .65, .5, .36, .24, .14]
      .map((o, i) => `<g opacity="${o}" transform="translate(0,${i * 11})"><path d="${p}"/></g>`)
      .join("");
    /* Le sceau du double arc — la double barrière récifale — n'apparaît que
       sur les fiches du lagon, et une seule fois. */
    const sceau = c.sceau ? `
      <g transform="translate(250,18) scale(.42)" fill="none" stroke="#c4b63e" stroke-linecap="round">
        <path d="M4 33 C 34 5, 86 5, 116 33" stroke-width="4"/>
        <path d="M20 36 C 44 21, 76 21, 100 36" stroke-width="2.5" opacity=".7"/>
      </g>` : "";
    return `<svg class="cartouche" viewBox="0 0 320 ${h}" preserveAspectRatio="xMidYMid slice"
      aria-hidden="true" focusable="false">
      <rect width="320" height="${h}" fill="${c.fond}"/>
      <rect width="320" height="${h}" fill="url(#km-claustra)" color="${c.trait}" opacity=".07"/>
      <g fill="none" stroke="${c.trait}" stroke-width="1.5" stroke-linejoin="round"
         transform="translate(0,${opt.haut ? 0 : -12})">${strates}</g>${sceau}
    </svg>`;
  }

  /* Compatibilité : l'ancien nom reste appelé par les journées et l'agenda. */
  const vignette = cartouche;


  /* --------------------------------------------------------------- CARTE
     La carte de Mayotte, dessinée à partir de la géométrie embarquée dans
     carte.js. Aucune tuile, aucune requête : l'île entière pèse 56 Ko et
     s'affiche hors connexion, ce qu'aucune carte à tuiles ne sait faire.

     Sept fiches partagent des coordonnées avec une autre (l'atelier cuisine et
     le marché sont au même endroit) : on décale les doublons en spirale pour
     qu'aucun point n'en cache un autre.                                      */

  function projeter(lat, lon) {
    const k = Math.cos(CARTE.lat0 * Math.PI / 180);
    return {
      x: ((lon - CARTE.lon0) * k - CARTE.minx) * CARTE.ech,
      y: (-(lat - CARTE.lat0) - CARTE.miny) * CARTE.ech
    };
  }

  /* Décale les points qui se superposent, en spirale, pour qu'ils restent
     tous cliquables. */
  function eclater(points) {
    const vus = new Map();
    return points.map(p => {
      const cle = Math.round(p.x / 6) + "|" + Math.round(p.y / 6);
      const n = vus.get(cle) || 0;
      vus.set(cle, n + 1);
      if (!n) return p;
      const a = n * 2.4, r = 9 + n * 3;
      return { ...p, x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r, decale: true };
    });
  }

  function carte(lieux, opt = {}) {
    const sel = opt.selection;
    const pts = eclater(lieux.map(l => ({ ...projeter(l.gps[0], l.gps[1]), l })));

    const marques = pts.map(p => {
      const actif = sel === p.l.id;
      const c = CARTOUCHE[p.l.cat] || CARTOUCHE.pratique;
      return `<g class="pt${actif ? " pt--actif" : ""}" data-action="carte-point" data-id="${p.l.id}"
        transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})" role="button" tabindex="0"
        aria-label="${(p.l.nom + ", " + p.l.commune).replace(/"/g, "&quot;")}">
        <circle class="pt__halo" r="${actif ? 26 : 0}"/>
        <circle class="pt__zone" r="20" fill="transparent"/>
        <circle class="pt__rond" r="${actif ? 11 : 7.5}" fill="${c.fond}"/>
        <circle class="pt__coeur" r="${actif ? 4 : 2.8}" fill="${c.trait}"/>
      </g>`;
    }).join("");

    return `<svg class="carte" viewBox="${CARTE.viewBox}" role="img"
      aria-label="Carte de Mayotte avec ${lieux.length} lieux">
      <rect class="carte__mer" x="-40" y="-40" width="1080" height="1420"/>
      <path class="carte__recif" d="${CARTE.recif}"/>
      <path class="carte__terre" d="${CARTE.terre}"/>
      <g class="carte__points">${marques}</g>
    </svg>`;
  }

  /* ------------------------------------------------------- COURBE DE MARÉE
     `profil` (facultatif) est la vraie courbe calculée par le moteur
     harmonique : [{t: heures locales, h: mètres}]. À défaut, on retombe sur
     une interpolation en cosinus entre les étales. */
  function courbeMaree(evts, heureCourante, mareeRequise, profil) {
    if (!evts || !evts.length) return "";
    const W = 320, H = 150, mg = 16, hautCourbe = 38, base = 82, amp = 30;
    const x = t => mg + (t / 24) * (W - mg * 2);

    let y;
    if (profil && profil.length) {
      const hs = profil.map(p => p.h);
      const hMin = Math.min(...hs), hMax = Math.max(...hs);
      const etendue = Math.max(0.4, hMax - hMin);
      y = t => {
        const i = Math.min(profil.length - 1, Math.max(0, Math.round(t / 24 * (profil.length - 1))));
        return base + amp - ((profil[i].h - hMin) / etendue) * (2 * amp);
      };
    } else {
      y = t => base - hauteur(t, evts) * amp;
    }

    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * 24;
      pts.push([x(t), y(t)]);
    }
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const aire = d + ` L ${x(24).toFixed(1)} ${base + amp + 8} L ${x(0).toFixed(1)} ${base + amp + 8} Z`;

    const fenetres = mareeRequise ? evts.filter(e => e.type === mareeRequise).map(e =>
      `<rect x="${x(Math.max(0, e.brut - 1.5)).toFixed(1)}" y="${hautCourbe - 6}"
        width="${(x(Math.min(24, e.brut + 1.5)) - x(Math.max(0, e.brut - 1.5))).toFixed(1)}"
        height="${base + amp + 14 - hautCourbe}" fill="var(--vert)" opacity=".14" rx="5"/>`).join("") : "";

    const reperes = evts.map(e => {
      const px = x(e.brut), haute = e.type === "haute";
      const py = y(e.brut);
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.4"
          fill="${haute ? "var(--platier-grave)" : "var(--signature)"}" stroke="var(--surface)" stroke-width="1.5"/>
        <text x="${px.toFixed(1)}" y="${(py + (haute ? -11 : 18)).toFixed(1)}" text-anchor="middle"
          font-size="12.5" font-weight="700" fill="${haute ? "var(--txt-haute)" : "var(--txt-basse)"}"
          >${e.heure.replace(" h ", ":")}</text>
        ${e.hauteur != null ? `<text x="${px.toFixed(1)}" y="${(py + (haute ? -24 : 31)).toFixed(1)}"
          text-anchor="middle" font-size="10.5" fill="var(--muted)">${e.hauteur.toFixed(2)} m</text>` : ""}`;
    }).join("");

    const axe = [0, 12, 24].map(t =>
      `<line x1="${x(t).toFixed(1)}" y1="${base + amp + 8}" x2="${x(t).toFixed(1)}" y2="${base + amp + 12}"
         stroke="var(--line-fort)" stroke-width="1"/>
       <text x="${x(t).toFixed(1)}" y="${H - 3}" text-anchor="middle" font-size="11"
         fill="var(--muted)">${t} h</text>`).join("");

    const xn = x(heureCourante), yn = y(heureCourante);

    return `<svg class="maree-graph" viewBox="0 0 ${W} ${H}" role="img"
      aria-label="Marée du jour : ${evts.map(e => (e.type === "haute" ? "pleine mer" : "basse mer") +
        " à " + e.heure.replace(" h ", " heures ") +
        (e.hauteur != null ? ", " + e.hauteur.toFixed(2).replace(".", ",") + " mètre" : "")).join(" ; ")}">
      ${fenetres}
      <path d="${aire}" fill="var(--platier)" opacity=".12"/>
      <line x1="${mg}" y1="${base}" x2="${W - mg}" y2="${base}" stroke="var(--line-fort)"
        stroke-width="1" stroke-dasharray="3 5" opacity=".6"/>
      <path d="${d}" fill="none" stroke="var(--platier-grave)" stroke-width="2.6"
        stroke-linecap="round" stroke-linejoin="round"/>
      ${reperes}
      <line x1="${xn.toFixed(1)}" y1="${hautCourbe - 6}" x2="${xn.toFixed(1)}" y2="${base + amp + 8}"
        stroke="var(--chaud)" stroke-width="1.6" stroke-dasharray="2 3"/>
      <circle cx="${xn.toFixed(1)}" cy="${yn.toFixed(1)}" r="5" fill="var(--chaud)"
        stroke="var(--surface)" stroke-width="2.2"/>
      <text x="${Math.min(W - mg - 2, Math.max(mg + 2, xn)).toFixed(1)}" y="${hautCourbe - 13}"
        text-anchor="${xn > W * .72 ? "end" : xn < W * .28 ? "start" : "middle"}"
        font-size="11.5" font-weight="700" fill="var(--chaud)">maintenant</text>
      <line x1="${mg}" y1="${base + amp + 8}" x2="${W - mg}" y2="${base + amp + 8}"
        stroke="var(--line-fort)" stroke-width="1"/>
      ${axe}
    </svg>`;
  }

  /* hauteur relative (-1 → +1), interpolée en cosinus entre deux étales */
  function hauteur(t, evts) {
    const demi = 6.2;
    let av = null, ap = null;
    for (const e of evts) { if (e.brut <= t) av = e; if (e.brut > t && !ap) ap = e; }
    if (!av) av = { brut: (ap ? ap.brut : 0) - demi, type: ap && ap.type === "haute" ? "basse" : "haute" };
    if (!ap) ap = { brut: av.brut + demi, type: av.type === "haute" ? "basse" : "haute" };
    const frac = Math.min(1, Math.max(0, (t - av.brut) / ((ap.brut - av.brut) || 1)));
    return (av.type === "haute" ? 1 : -1) * Math.cos(Math.PI * frac);
  }

  /* ------------------------------------------------------- BANDEAU SAISONS */
  const M12 = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const MOISN = ["janvier","février","mars","avril","mai","juin","juillet","août",
                 "septembre","octobre","novembre","décembre"];
  function saison(mois, moisCourant) {
    const toute = !mois || !mois.length;
    const label = toute ? "Intéressant toute l'année"
      : "Mois recommandés : " + mois.map(m => MOISN[m - 1]).join(", ");
    return `<div class="saison" role="img" aria-label="${label}">
      ${M12.map((l, i) => `<span class="saison__m"
        data-on="${!toute && mois.includes(i + 1) ? "oui" : "non"}"
        data-now="${i + 1 === moisCourant ? "oui" : "non"}">${l}</span>`).join("")}
    </div>`;
  }

  /* ---------------------------------------------------------------- L'ÎLE
     Silhouette volontairement schématique : motif décoratif, jamais un support
     de navigation. Les fiches renvoient vers un vrai plan.                   */
  function ile(cls = "") {
    return `<svg viewBox="0 0 200 260" class="${cls}" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M96 18c10 8 20 20 20 34 8 8 14 14 12 26 6 10 14 16 10 28 4 8 8 14 6 24
        4 12 6 22 0 32-4 12-12 20-24 28-8 8-16 14-24 12-10-4-18-12-16-24-10-8-16-16-12-28
        -8-8-12-16-8-28-8-8-12-18-6-28-6-10-8-20 0-30 4-12 12-22 22-30 6-8 12-14 20-16z"/>
      <ellipse cx="162" cy="112" rx="17" ry="22" fill="currentColor"/>
      <circle cx="176" cy="140" r="6" fill="currentColor"/>
    </svg>`;
  }

  /* ------------------------------------------------------------------ LOGO */
  function logo() {
    return `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs><linearGradient id="lgk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3ec2ce"/><stop offset="1" stop-color="#0a626c"/>
      </linearGradient></defs>
      <rect width="48" height="48" rx="13" fill="url(#lgk)"/>
      <circle cx="24" cy="27" r="16" fill="none" stroke="#a9f0f4" stroke-width="1.5" opacity=".45"/>
      <path fill="#f7f1e3" d="M19 11c3 2 5.5 5 5.5 8.5 3 3 5 6 4 9-1 4-4 7-8 8-3 1-6-1-6-5
        -3-3-4-6-2-9-2-3-2-6 1-8 1-2 3-3.5 5.5-3.5z"/>
      <circle cx="34" cy="19" r="5" fill="#f7f1e3"/>
      <circle cx="34" cy="19" r="2.1" fill="#e8a317"/>
    </svg>`;
  }

  /* ---------------------------------------------------------- ILLUSTRATION
     Une vraie photographie quand on en a une qui montre VRAIMENT le lieu,
     l'illustration générée sinon. La vignette SVG reste dessinée derrière la
     photo : elle sert de fond pendant le chargement, et il n'y a donc jamais
     de rectangle vide, même hors connexion.
     La photo n'est jamais préchargée : `loading="lazy"` la laisse arriver
     quand elle entre à l'écran, ce qui évite de payer 40 fiches de photos
     sur une connexion mahoraise.                                            */
  function illustration(id, categorie, opt = {}) {
    const fond = vignette(id, categorie, opt);
    const p = typeof PHOTOS !== "undefined" ? PHOTOS[id] : null;
    if (!p) return `<div class="illus illus--dessin">${fond}</div>`;
    const alt = (p.d || "").replace(/"/g, "&quot;");
    return `<div class="illus illus--photo">
      <div class="illus__fond">${fond}</div>
      <img src="photos/${p.f}" alt="${alt}" loading="${opt.prioritaire ? "eager" : "lazy"}"
           decoding="async" width="${p.w || 1200}" height="${p.h || 800}">
      ${opt.credit === false ? "" : `<button class="illus__credit" data-action="credits"
        aria-label="Crédits de cette photographie : ${(p.a || "auteur inconnu").replace(/"/g, "")}, ${
          (p.l || "").replace(/"/g, "")}. Ouvrir la page des crédits.">© ${
        (p.a || "inconnu").replace(/"/g, "")} · ${p.l || ""}</button>`}
    </div>`;
  }

  return { icone, cartouche, vignette, illustration, courbeMaree, saison, ile, logo,
           graine, claustra, sceau, carte, projeter, CARTOUCHE };
})();
