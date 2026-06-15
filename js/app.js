/* Trois Prises — compteur de lancers (PWA, vanilla JS) */
'use strict';

const APP_VERSION = '1.3.1';
const STORE_KEY = 'troisprises.db';
const LANG_KEY = 'troisprises.lang';

/* ------------------------------------------------------------------ */
/* Internationalisation (i18n) — français par défaut, anglais en option */
/* ------------------------------------------------------------------ */
const LANGS = ['fr', 'en'];

function loadLang() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v && LANGS.includes(v)) return v;
  } catch (e) { /* ignore */ }
  return 'fr';
}
function saveLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
}
let LANG = loadLang();

// Pluriel : règle simple « n > 1 », valable pour le français et l'anglais ici.
const plural = (n, sing, plur) => (n > 1 ? plur : sing);

const I18N = {
  fr: {
    settings: 'Réglages',
    language: 'Langue',
    languageSub: 'Choisis la langue de l’interface.',
    close: 'Fermer',
    footerNote: 'données locales seulement',
    back: 'Retour',

    // Liste des équipes
    myTeams: 'Mes équipes',
    myTeamsSub: 'Suis les lancers de tes lanceurs, partie par partie.',
    noTeams: 'Aucune équipe pour l’instant.<br>Crée ta première équipe pour commencer.',
    createTeam: '+ Créer une équipe',
    addTeam: 'Équipe',
    dataSection: 'Données',
    save: '⬇️ Sauvegarder',
    import: '⬆️ Importer',
    teamCounts: (nj, np) => `${nj} ${plural(nj, 'joueur', 'joueurs')} · ${np} ${plural(np, 'partie', 'parties')}`,

    // Onglets équipe
    tabPlayers: 'Joueurs',
    tabGames: 'Parties',
    tabSeason: 'Saison',

    // Onglet joueurs
    noPlayers: 'Aucun joueur.<br>Ajoute des joueurs et donne-leur une position.',
    addPlayerCta: '+ Ajouter un joueur',
    addPlayer: 'Joueur',
    teamSection: 'Équipe',
    editTeam: 'Modifier l’équipe',
    deleteTeam: 'Supprimer l’équipe',
    confirmDeleteTeam: (name) => `Supprimer « ${name} » et toutes ses données (joueurs et parties)? Action irréversible.`,
    teamDeleted: 'Équipe supprimée',

    // Onglet parties
    noGames: 'Aucune partie.<br>Crée une partie pour commencer à compter les lancers.',
    createGame: '+ Créer une partie',
    addGame: 'Partie',
    vs: (opp) => 'c. ' + opp,
    game: 'Partie',
    gameSub: (date, loc, n) => `${date}${loc ? ' · ' + loc : ''} · ${n} ${plural(n, 'lancer', 'lancers')}`,

    // Onglet saison
    seasonNeedsPlayers: 'Ajoute des joueurs pour voir les statistiques de la saison.',
    seasonSub: 'Cumul de tous les lancers de la saison.',
    colPlayer: 'Joueur',
    colGP: 'PJ',
    colPitches: 'Lancers',
    colStrikes: 'Prises',
    colBalls: 'Balles',
    colRunsShort: 'Pts acc.',
    colStrikePctShort: '% pr.',
    teamTotal: 'Total équipe',
    seasonHint: 'PJ = parties jouées (avec lancers) · % pr. = pourcentage de prises (prises sur total) · Pts acc. = points accordés (pas un lancer). Touche un joueur pour le détail.',

    // Détail joueur
    number: 'n<sup>o</sup>',
    seasonSection: 'Saison',
    pitches: 'Lancers',
    strikes: 'Prises',
    balls: 'Balles',
    runsAllowed: 'Pts accordés',
    strikePct: '% prises',
    games: 'Parties',
    perGame: 'Par partie',
    noPitchesPlayer: 'Aucun lancer enregistré pour ce joueur.',
    colStrikesShort: 'Pr.',
    colBallsShort: 'Ba.',
    colRuns: 'Pts',
    playerSection: 'Joueur',
    edit: 'Modifier',
    del: 'Supprimer',
    confirmDeletePlayer: (name) => `Supprimer ${name}? Ses statistiques seront retirées de toutes les parties.`,
    playerDeleted: 'Joueur supprimé',

    // Détail partie
    note: (n) => '📝 ' + n,
    pitchersHelp: 'Lanceurs — touche un joueur pour compter',
    noPlayersInTeam: 'Aucun joueur dans l’équipe.<br>Ajoute des joueurs d’abord.',
    pitcherLine: (c) => `${c.lancers} lancers · ${c.prise} pr. · ${c.balle} ba. · ${c.point} pts · ${c.pct}%`,
    noPitchesYet: 'Aucun lancer — touche pour commencer',
    gameSectionTitle: 'Partie',
    confirmDeleteGame: 'Supprimer cette partie et tous ses lancers? Action irréversible.',
    gameDeleted: 'Partie supprimée',

    // Compteur de lancers
    runsAndPct: (c) => `Points accordés : <b style="color:var(--rouge)">${c.point}</b> &nbsp;·&nbsp; % de prises : <b>${c.pct}%</b>`,
    btnStrike: 'Prise',
    btnBall: 'Balle',
    btnRuns: 'Points accordés',
    undoLast: '↩︎ Annuler le dernier',
    reset: 'Réinitialiser',
    lastPitches: 'Derniers lancers',
    noPitchesPrompt: 'Aucun lancer encore. Touche un bouton ci-dessus.',
    confirmReset: (name) => `Effacer tous les lancers de ${name} pour cette partie?`,
    counterReset: 'Compteur réinitialisé',

    // Confirmation générique
    confirmTitle: 'Confirmation',
    cancel: 'Annuler',
    deleteLabel: 'Supprimer',

    // Formulaire équipe
    newTeam: 'Nouvelle équipe',
    teamName: 'Nom de l’équipe',
    teamNamePlaceholder: 'Ex. : Les Castors de Longueuil',
    color: 'Couleur',
    create: 'Créer',
    saveAction: 'Enregistrer',
    needTeamName: 'Donne un nom à l’équipe',
    teamEdited: 'Équipe modifiée',
    teamCreated: 'Équipe créée',

    // Formulaire joueur
    editPlayer: 'Modifier le joueur',
    newPlayer: 'Nouveau joueur',
    playerName: 'Nom du joueur',
    playerNamePlaceholder: 'Ex. : Maxime Tremblay',
    numberLabel: 'Numéro',
    position: 'Position',
    positionHint: 'La position peut être changée en tout temps. Tout joueur peut être utilisé comme lanceur dans une partie.',
    add: 'Ajouter',
    needPlayerName: 'Donne un nom au joueur',
    playerEdited: 'Joueur modifié',
    playerAdded: 'Joueur ajouté',

    // Formulaire partie
    editGame: 'Modifier la partie',
    newGame: 'Nouvelle partie',
    date: 'Date',
    location: 'Lieu',
    locationPlaceholder: 'Domicile / Visiteur',
    opponent: 'Adversaire',
    opponentPlaceholder: 'Ex. : Les Aigles de Laval',
    notesOptional: 'Notes (facultatif)',
    notesPlaceholder: 'Météo, manche, etc.',
    gameEdited: 'Partie modifiée',
    gameCreated: 'Partie créée',

    // Sauvegarde / import
    saveFailed: 'Impossible de sauvegarder (stockage plein?)',
    saveDownloaded: 'Sauvegarde téléchargée',
    confirmImport: (n) => `Importer ${n} ${plural(n, 'équipe', 'équipes')}? Cela remplacera toutes les données actuelles.`,
    importAction: 'Importer',
    dataImported: 'Données importées',
    invalidFile: 'Fichier invalide',

    // Service worker
    updateAvailable: 'Mise à jour disponible — touche pour rafraîchir',
  },

  en: {
    settings: 'Settings',
    language: 'Language',
    languageSub: 'Choose the interface language.',
    close: 'Close',
    footerNote: 'local data only',
    back: 'Back',

    myTeams: 'My teams',
    myTeamsSub: 'Track your pitchers’ pitches, game by game.',
    noTeams: 'No teams yet.<br>Create your first team to get started.',
    createTeam: '+ Create a team',
    addTeam: 'Team',
    dataSection: 'Data',
    save: '⬇️ Backup',
    import: '⬆️ Import',
    teamCounts: (nj, np) => `${nj} ${plural(nj, 'player', 'players')} · ${np} ${plural(np, 'game', 'games')}`,

    tabPlayers: 'Players',
    tabGames: 'Games',
    tabSeason: 'Season',

    noPlayers: 'No players.<br>Add players and give them a position.',
    addPlayerCta: '+ Add a player',
    addPlayer: 'Player',
    teamSection: 'Team',
    editTeam: 'Edit team',
    deleteTeam: 'Delete team',
    confirmDeleteTeam: (name) => `Delete “${name}” and all its data (players and games)? This cannot be undone.`,
    teamDeleted: 'Team deleted',

    noGames: 'No games.<br>Create a game to start counting pitches.',
    createGame: '+ Create a game',
    addGame: 'Game',
    vs: (opp) => 'vs ' + opp,
    game: 'Game',
    gameSub: (date, loc, n) => `${date}${loc ? ' · ' + loc : ''} · ${n} ${plural(n, 'pitch', 'pitches')}`,

    seasonNeedsPlayers: 'Add players to see season statistics.',
    seasonSub: 'Totals for every pitch this season.',
    colPlayer: 'Player',
    colGP: 'GP',
    colPitches: 'Pitches',
    colStrikes: 'Strikes',
    colBalls: 'Balls',
    colRunsShort: 'Runs',
    colStrikePctShort: '% str.',
    teamTotal: 'Team total',
    seasonHint: 'GP = games played (with pitches) · % str. = strike percentage (strikes over total) · Runs = runs allowed (not a pitch). Tap a player for details.',

    number: 'no.',
    seasonSection: 'Season',
    pitches: 'Pitches',
    strikes: 'Strikes',
    balls: 'Balls',
    runsAllowed: 'Runs allowed',
    strikePct: '% strikes',
    games: 'Games',
    perGame: 'Per game',
    noPitchesPlayer: 'No pitches recorded for this player.',
    colStrikesShort: 'Str.',
    colBallsShort: 'Ba.',
    colRuns: 'Runs',
    playerSection: 'Player',
    edit: 'Edit',
    del: 'Delete',
    confirmDeletePlayer: (name) => `Delete ${name}? Their statistics will be removed from every game.`,
    playerDeleted: 'Player deleted',

    note: (n) => '📝 ' + n,
    pitchersHelp: 'Pitchers — tap a player to count',
    noPlayersInTeam: 'No players on the team.<br>Add players first.',
    pitcherLine: (c) => `${c.lancers} pitches · ${c.prise} str. · ${c.balle} ba. · ${c.point} runs · ${c.pct}%`,
    noPitchesYet: 'No pitches — tap to start',
    gameSectionTitle: 'Game',
    confirmDeleteGame: 'Delete this game and all its pitches? This cannot be undone.',
    gameDeleted: 'Game deleted',

    runsAndPct: (c) => `Runs allowed: <b style="color:var(--rouge)">${c.point}</b> &nbsp;·&nbsp; strike %: <b>${c.pct}%</b>`,
    btnStrike: 'Strike',
    btnBall: 'Ball',
    btnRuns: 'Runs allowed',
    undoLast: '↩︎ Undo last',
    reset: 'Reset',
    lastPitches: 'Recent pitches',
    noPitchesPrompt: 'No pitches yet. Tap a button above.',
    confirmReset: (name) => `Clear all of ${name}’s pitches for this game?`,
    counterReset: 'Counter reset',

    confirmTitle: 'Confirmation',
    cancel: 'Cancel',
    deleteLabel: 'Delete',

    newTeam: 'New team',
    teamName: 'Team name',
    teamNamePlaceholder: 'e.g. Longueuil Beavers',
    color: 'Colour',
    create: 'Create',
    saveAction: 'Save',
    needTeamName: 'Give the team a name',
    teamEdited: 'Team updated',
    teamCreated: 'Team created',

    editPlayer: 'Edit player',
    newPlayer: 'New player',
    playerName: 'Player name',
    playerNamePlaceholder: 'e.g. Maxime Tremblay',
    numberLabel: 'Number',
    position: 'Position',
    positionHint: 'The position can be changed any time. Any player can pitch in a game.',
    add: 'Add',
    needPlayerName: 'Give the player a name',
    playerEdited: 'Player updated',
    playerAdded: 'Player added',

    editGame: 'Edit game',
    newGame: 'New game',
    date: 'Date',
    location: 'Location',
    locationPlaceholder: 'Home / Away',
    opponent: 'Opponent',
    opponentPlaceholder: 'e.g. Laval Eagles',
    notesOptional: 'Notes (optional)',
    notesPlaceholder: 'Weather, inning, etc.',
    gameEdited: 'Game updated',
    gameCreated: 'Game created',

    saveFailed: 'Could not save (storage full?)',
    saveDownloaded: 'Backup downloaded',
    confirmImport: (n) => `Import ${n} ${plural(n, 'team', 'teams')}? This will replace all current data.`,
    importAction: 'Import',
    dataImported: 'Data imported',
    invalidFile: 'Invalid file',

    updateAvailable: 'Update available — tap to refresh',
  },
};

function t(key, ...args) {
  const dict = I18N[LANG] || I18N.fr;
  let v = dict[key];
  if (v === undefined) v = I18N.fr[key];
  if (v === undefined) return key;
  return typeof v === 'function' ? v(...args) : v;
}

/* ------------------------------------------------------------------ */
/* Positions de baseball (bilingue)                                    */
/* ------------------------------------------------------------------ */
const POSITIONS = [
  { code: 'L',  fr: 'Lanceur',          en: 'Pitcher' },
  { code: 'R',  fr: 'Receveur',         en: 'Catcher' },
  { code: 'B1', fr: 'Premier but',      en: 'First base' },
  { code: 'B2', fr: 'Deuxième but',     en: 'Second base' },
  { code: 'B3', fr: 'Troisième but',    en: 'Third base' },
  { code: 'AC', fr: 'Arrêt-court',      en: 'Shortstop' },
  { code: 'CG', fr: 'Champ gauche',     en: 'Left field' },
  { code: 'CC', fr: 'Champ centre',     en: 'Center field' },
  { code: 'CD', fr: 'Champ droit',      en: 'Right field' },
  { code: 'FD', fr: 'Frappeur désigné', en: 'Designated hitter' },
];
const posNom = (code) => {
  const p = POSITIONS.find(x => x.code === code);
  return p ? (p[LANG] || p.fr) : '';
};

const COULEURS = ['#0b2a6b', '#d8232a', '#2e8b57', '#c8922f', '#6a1b9a', '#00838f', '#e65100', '#37474f'];

/* ------------------------------------------------------------------ */
/* Stockage (localStorage)                                             */
/* ------------------------------------------------------------------ */
function loadDB() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { version: 1, teams: [] };
    const db = JSON.parse(raw);
    if (!db.teams) db.teams = [];
    return db;
  } catch (e) {
    console.error('Erreur de lecture des données', e);
    return { version: 1, teams: [] };
  }
}
function saveDB() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(DB));
  } catch (e) {
    toast(t('saveFailed'));
    console.error(e);
  }
}
let DB = loadDB();

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const getTeam = (tid) => DB.teams.find(t => t.id === tid);
const getPlayer = (team, pid) => team && (team.players || []).find(p => p.id === pid);
const getGame = (team, gid) => team && (team.games || []).find(g => g.id === gid);

/* ------------------------------------------------------------------ */
/* Calculs de stats de lancers                                         */
/* Le journal d'une partie : game.pitching[playerId] = ['prise','balle','point', ...] */
/* ------------------------------------------------------------------ */
function pitchLog(game, pid) {
  if (!game.pitching) game.pitching = {};
  if (!Array.isArray(game.pitching[pid])) game.pitching[pid] = [];
  return game.pitching[pid];
}
function countLog(arr) {
  const c = { balle: 0, prise: 0, point: 0 };
  for (const t of arr) if (c[t] !== undefined) c[t]++;
  const lancers = c.balle + c.prise;            // un point accordé n'est pas un lancer
  const prisesEff = c.prise;                     // prises dans la zone
  const pct = lancers ? Math.round((prisesEff / lancers) * 100) : 0;
  return { ...c, lancers, prisesEff, pct };
}
function seasonTotals(team, pid) {
  const all = [];
  let parties = 0;
  for (const g of team.games || []) {
    const arr = (g.pitching && g.pitching[pid]) || [];
    if (arr.length) { parties++; all.push(...arr); }
  }
  return { ...countLog(all), parties };
}

/* ------------------------------------------------------------------ */
/* Utilitaires UI                                                      */
/* ------------------------------------------------------------------ */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const view = document.getElementById('view');
const backBtn = document.getElementById('backBtn');
const settingsBtn = document.getElementById('settingsBtn');
const headerSpacer = document.getElementById('headerSpacer');
const modalHost = document.getElementById('modalHost');

let toastTimer = null;
function toast(msg, opts = {}) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (opts.tappable ? ' tappable' : '');
  t.onclick = opts.onTap || null;
  clearTimeout(toastTimer);
  if (!opts.sticky) {
    toastTimer = setTimeout(() => { t.className = 'toast'; t.onclick = null; }, opts.duration || 2600);
  }
}

function navigate(hash) { location.hash = hash; }

function fmtDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso + 'T00:00:00');
    const locale = LANG === 'en' ? 'en-CA' : 'fr-CA';
    return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return iso; }
}
function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const initials = (name) => (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

/* ------------------------------------------------------------------ */
/* Application de la langue (éléments hors vue principale)             */
/* ------------------------------------------------------------------ */
function applyLang() {
  document.documentElement.lang = LANG === 'en' ? 'en' : 'fr-CA';
  backBtn.setAttribute('aria-label', t('back'));
  settingsBtn.setAttribute('aria-label', t('settings'));
  const note = document.getElementById('footerNote');
  if (note) note.textContent = t('footerNote');
}

function setLang(lang) {
  if (!LANGS.includes(lang) || lang === LANG) return;
  LANG = lang;
  saveLang(lang);
  applyLang();
  render();
}

/* ------------------------------------------------------------------ */
/* Modale générique + formulaires                                      */
/* ------------------------------------------------------------------ */
function showModal(innerHTML, onMount) {
  modalHost.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="grabber"></div>${innerHTML}</div>`;
  modalHost.hidden = false;
  modalHost.onclick = (e) => { if (e.target === modalHost) closeModal(); };
  if (onMount) onMount(modalHost.querySelector('.modal'));
}
function closeModal() {
  modalHost.hidden = true;
  modalHost.innerHTML = '';
  modalHost.onclick = null;
}

function confirmDialog(message, onYes, yesLabel) {
  showModal(`
    <h2>${esc(t('confirmTitle'))}</h2>
    <p class="meta-line" style="font-size:1rem">${esc(message)}</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="annuler">${esc(t('cancel'))}</button>
      <button class="btn btn-rouge" data-act="ok">${esc(yesLabel || t('deleteLabel'))}</button>
    </div>`, (m) => {
    m.querySelector('[data-act="annuler"]').onclick = closeModal;
    m.querySelector('[data-act="ok"]').onclick = () => { closeModal(); onYes(); };
  });
}

/* --- Réglages (bottom sheet) --- */
function settingsSheet() {
  const langBtn = (code, label) =>
    `<button type="button" class="lang-btn${code === LANG ? ' sel' : ''}" data-lang="${code}">${label}</button>`;
  showModal(`
    <h2>${esc(t('settings'))}</h2>
    <div class="field">
      <label>${esc(t('language'))}</label>
      <div class="lang-grid">
        ${langBtn('fr', 'Français')}
        ${langBtn('en', 'English')}
      </div>
      <p class="hint">${esc(t('languageSub'))}</p>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" data-act="close">${esc(t('close'))}</button>
    </div>`, (m) => {
    m.querySelectorAll('.lang-btn').forEach(b => b.onclick = () => {
      setLang(b.dataset.lang);
      settingsSheet();   // reconstruit la feuille dans la nouvelle langue
    });
    m.querySelector('[data-act="close"]').onclick = closeModal;
  });
}

/* --- Équipe --- */
function teamForm(team) {
  const isEdit = !!team;
  const cur = team || { name: '', color: COULEURS[0] };
  showModal(`
    <h2>${isEdit ? esc(t('editTeam')) : esc(t('newTeam'))}</h2>
    <div class="field">
      <label for="f-name">${esc(t('teamName'))}</label>
      <input id="f-name" type="text" maxlength="40" placeholder="${esc(t('teamNamePlaceholder'))}" value="${esc(cur.name)}" />
    </div>
    <div class="field">
      <label>${esc(t('color'))}</label>
      ${colorPicker(cur.color)}
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="annuler">${esc(t('cancel'))}</button>
      <button class="btn btn-primary" data-act="ok">${isEdit ? esc(t('saveAction')) : esc(t('create'))}</button>
    </div>`, (m) => {
    let color = cur.color;
    m.querySelectorAll('.color-swatch').forEach(s => s.onclick = () => {
      m.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('sel'));
      s.classList.add('sel'); color = s.dataset.color;
    });
    m.querySelector('[data-act="annuler"]').onclick = closeModal;
    m.querySelector('[data-act="ok"]').onclick = () => {
      const name = m.querySelector('#f-name').value.trim();
      if (!name) { toast(t('needTeamName')); return; }
      if (isEdit) { team.name = name; team.color = color; }
      else { DB.teams.push({ id: uid(), name, color, players: [], games: [] }); }
      saveDB(); closeModal(); render();
      toast(isEdit ? t('teamEdited') : t('teamCreated'));
    };
    setTimeout(() => m.querySelector('#f-name').focus(), 100);
  });
}

function colorPicker(selected) {
  return `<div class="color-picker">` + COULEURS.map(c =>
    `<button type="button" class="color-swatch${c === selected ? ' sel' : ''}" data-color="${c}" style="background:${c}" aria-label="${esc(t('color'))}"></button>`
  ).join('') + `</div>`;
}

/* --- Joueur --- */
function playerForm(team, player) {
  const isEdit = !!player;
  const cur = player || { name: '', number: '', position: 'L' };
  showModal(`
    <h2>${isEdit ? esc(t('editPlayer')) : esc(t('newPlayer'))}</h2>
    <div class="field">
      <label for="f-pname">${esc(t('playerName'))}</label>
      <input id="f-pname" type="text" maxlength="40" placeholder="${esc(t('playerNamePlaceholder'))}" value="${esc(cur.name)}" />
    </div>
    <div class="field-row">
      <div class="field">
        <label for="f-num">${esc(t('numberLabel'))}</label>
        <input id="f-num" type="number" inputmode="numeric" min="0" max="99" placeholder="00" value="${esc(cur.number)}" />
      </div>
      <div class="field">
        <label for="f-pos">${esc(t('position'))}</label>
        <select id="f-pos">
          ${POSITIONS.map(p => `<option value="${p.code}"${p.code === cur.position ? ' selected' : ''}>${p.code} — ${esc(posNom(p.code))}</option>`).join('')}
        </select>
      </div>
    </div>
    <p class="hint">${esc(t('positionHint'))}</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="annuler">${esc(t('cancel'))}</button>
      <button class="btn btn-primary" data-act="ok">${isEdit ? esc(t('saveAction')) : esc(t('add'))}</button>
    </div>`, (m) => {
    m.querySelector('[data-act="annuler"]').onclick = closeModal;
    m.querySelector('[data-act="ok"]').onclick = () => {
      const name = m.querySelector('#f-pname').value.trim();
      if (!name) { toast(t('needPlayerName')); return; }
      const number = m.querySelector('#f-num').value.trim();
      const position = m.querySelector('#f-pos').value;
      if (isEdit) { player.name = name; player.number = number; player.position = position; }
      else { team.players.push({ id: uid(), name, number, position }); }
      saveDB(); closeModal(); render();
      toast(isEdit ? t('playerEdited') : t('playerAdded'));
    };
    setTimeout(() => m.querySelector('#f-pname').focus(), 100);
  });
}

/* --- Partie --- */
function gameForm(team, game) {
  const isEdit = !!game;
  const cur = game || { date: todayISO(), opponent: '', location: '', notes: '' };
  showModal(`
    <h2>${isEdit ? esc(t('editGame')) : esc(t('newGame'))}</h2>
    <div class="field-row">
      <div class="field">
        <label for="f-date">${esc(t('date'))}</label>
        <input id="f-date" type="date" value="${esc(cur.date)}" />
      </div>
      <div class="field">
        <label for="f-loc">${esc(t('location'))}</label>
        <input id="f-loc" type="text" maxlength="40" placeholder="${esc(t('locationPlaceholder'))}" value="${esc(cur.location)}" />
      </div>
    </div>
    <div class="field">
      <label for="f-opp">${esc(t('opponent'))}</label>
      <input id="f-opp" type="text" maxlength="40" placeholder="${esc(t('opponentPlaceholder'))}" value="${esc(cur.opponent)}" />
    </div>
    <div class="field">
      <label for="f-notes">${esc(t('notesOptional'))}</label>
      <textarea id="f-notes" rows="2" maxlength="200" placeholder="${esc(t('notesPlaceholder'))}">${esc(cur.notes)}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="annuler">${esc(t('cancel'))}</button>
      <button class="btn btn-primary" data-act="ok">${isEdit ? esc(t('saveAction')) : esc(t('create'))}</button>
    </div>`, (m) => {
    m.querySelector('[data-act="annuler"]').onclick = closeModal;
    m.querySelector('[data-act="ok"]').onclick = () => {
      const date = m.querySelector('#f-date').value || todayISO();
      const opponent = m.querySelector('#f-opp').value.trim();
      const location = m.querySelector('#f-loc').value.trim();
      const notes = m.querySelector('#f-notes').value.trim();
      if (isEdit) { Object.assign(game, { date, opponent, location, notes }); }
      else { team.games.push({ id: uid(), date, opponent, location, notes, pitching: {} }); }
      saveDB(); closeModal(); render();
      toast(isEdit ? t('gameEdited') : t('gameCreated'));
    };
  });
}

/* ------------------------------------------------------------------ */
/* Routage par hash                                                    */
/* ------------------------------------------------------------------ */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  return h.split('/').filter(Boolean);
}

function render() {
  DB = DB || loadDB();
  const seg = parseHash();
  window.scrollTo(0, 0);

  // Bouton réglages visible uniquement sur l'écran d'accueil.
  const atHome = seg.length === 0;
  settingsBtn.hidden = !atHome;
  headerSpacer.hidden = atHome;
  settingsBtn.onclick = atHome ? settingsSheet : null;

  if (atHome) { backBtn.hidden = true; return renderTeams(); }

  if (seg[0] === 'equipe') {
    const team = getTeam(seg[1]);
    if (!team) { navigate(''); return; }

    if (seg[2] === 'partie') {
      const game = getGame(team, seg[3]);
      if (!game) { navigate('#/equipe/' + team.id); return; }
      if (seg[4] === 'lanceur') {
        const pl = getPlayer(team, seg[5]);
        if (!pl) { navigate('#/equipe/' + team.id + '/partie/' + game.id); return; }
        backBtn.hidden = false;
        backBtn.onclick = () => navigate('#/equipe/' + team.id + '/partie/' + game.id);
        return renderPitchCounter(team, game, pl);
      }
      backBtn.hidden = false;
      backBtn.onclick = () => navigate('#/equipe/' + team.id);
      return renderGame(team, game);
    }

    if (seg[2] === 'joueur') {
      const pl = getPlayer(team, seg[3]);
      if (!pl) { navigate('#/equipe/' + team.id); return; }
      backBtn.hidden = false;
      backBtn.onclick = () => navigate('#/equipe/' + team.id);
      return renderPlayer(team, pl);
    }

    backBtn.hidden = false;
    backBtn.onclick = () => navigate('');
    return renderTeam(team, seg[2] || 'joueurs');
  }

  navigate('');
}

/* ------------------------------------------------------------------ */
/* Écran : liste des équipes                                           */
/* ------------------------------------------------------------------ */
function renderTeams() {
  let html = `<h2 class="page-title">${esc(t('myTeams'))}</h2>
    <p class="page-sub">${esc(t('myTeamsSub'))}</p>`;

  if (DB.teams.length === 0) {
    html += `<div class="empty">
      <span class="empty-emoji">⚾</span>
      <p>${t('noTeams')}</p>
      <button class="btn btn-primary" data-act="add-team">${esc(t('createTeam'))}</button>
    </div>`;
  } else {
    html += `<div class="card">`;
    for (const tm of DB.teams) {
      const nbJ = (tm.players || []).length;
      const nbP = (tm.games || []).length;
      html += `<button class="list-item" data-team="${tm.id}">
        <span class="team-dot" style="background:${tm.color}">${esc(initials(tm.name))}</span>
        <span class="li-main">
          <span class="li-title">${esc(tm.name)}</span>
          <span class="li-sub">${esc(t('teamCounts', nbJ, nbP))}</span>
        </span>
        <span class="li-chevron">›</span>
      </button>`;
    }
    html += `</div>`;
    html += `<div class="section-title">${esc(t('dataSection'))}</div>
      <div class="btn-row">
        <button class="btn btn-ghost btn-sm" data-act="export">${esc(t('save'))}</button>
        <button class="btn btn-ghost btn-sm" data-act="import">${esc(t('import'))}</button>
      </div>`;
  }

  html += `<button class="add-btn" data-act="add-team"><span class="plus">+</span> ${esc(t('addTeam'))}</button>`;
  view.innerHTML = html;

  view.querySelectorAll('[data-act="add-team"]').forEach(b => b.onclick = () => teamForm());
  view.querySelectorAll('[data-team]').forEach(b => b.onclick = () => navigate('#/equipe/' + b.dataset.team));
  const exp = view.querySelector('[data-act="export"]'); if (exp) exp.onclick = exportData;
  const imp = view.querySelector('[data-act="import"]'); if (imp) imp.onclick = importData;
}

/* ------------------------------------------------------------------ */
/* Écran : équipe (onglets Joueurs / Parties / Saison)                 */
/* ------------------------------------------------------------------ */
function renderTeam(team, tab) {
  const tabs = [['joueurs', t('tabPlayers')], ['parties', t('tabGames')], ['saison', t('tabSeason')]];
  let html = `<h2 class="page-title">${esc(team.name)}</h2>
    <p class="page-sub">${esc(t('teamCounts', (team.players || []).length, (team.games || []).length))}</p>
    <div class="tabs">` +
    tabs.map(([k, l]) => `<button class="tab${k === tab ? ' active' : ''}" data-tab="${k}">${esc(l)}</button>`).join('') +
    `</div><div id="tabBody"></div>`;
  view.innerHTML = html;
  view.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => navigate('#/equipe/' + team.id + '/' + b.dataset.tab));

  const body = view.querySelector('#tabBody');
  if (tab === 'joueurs') renderJoueursTab(team, body);
  else if (tab === 'parties') renderPartiesTab(team, body);
  else renderSaisonTab(team, body);
}

function renderJoueursTab(team, body) {
  const players = [...(team.players || [])].sort((a, b) => (Number(a.number) || 999) - (Number(b.number) || 999));
  let html = '';
  if (players.length === 0) {
    html = `<div class="empty"><span class="empty-emoji">🧢</span>
      <p>${t('noPlayers')}</p>
      <button class="btn btn-primary" data-act="add-player">${esc(t('addPlayerCta'))}</button></div>`;
  } else {
    html = `<div class="card">`;
    for (const p of players) {
      html += `<button class="list-item" data-player="${p.id}">
        <span class="badge" style="background:${team.color}">${esc(p.number || '–')}</span>
        <span class="li-main">
          <span class="li-title">${esc(p.name)}</span>
          <span class="li-sub"><span class="pos-tag">${p.position} · ${esc(posNom(p.position))}</span></span>
        </span>
        <span class="li-chevron">›</span>
      </button>`;
    }
    html += `</div>`;
  }
  html += `<button class="add-btn" data-act="add-player"><span class="plus">+</span> ${esc(t('addPlayer'))}</button>`;

  html += `<div class="danger-zone"><div class="section-title">${esc(t('teamSection'))}</div>
    <div class="btn-row">
      <button class="btn btn-ghost btn-sm" data-act="edit-team">${esc(t('editTeam'))}</button>
      <button class="btn btn-danger btn-sm" data-act="del-team">${esc(t('deleteTeam'))}</button>
    </div></div>`;

  body.innerHTML = html;
  body.querySelectorAll('[data-act="add-player"]').forEach(b => b.onclick = () => playerForm(team));
  body.querySelectorAll('[data-player]').forEach(b => b.onclick = () => navigate('#/equipe/' + team.id + '/joueur/' + b.dataset.player));
  body.querySelector('[data-act="edit-team"]').onclick = () => teamForm(team);
  body.querySelector('[data-act="del-team"]').onclick = () =>
    confirmDialog(t('confirmDeleteTeam', team.name), () => {
      DB.teams = DB.teams.filter(x => x.id !== team.id);
      saveDB(); navigate(''); toast(t('teamDeleted'));
    });
}

function renderPartiesTab(team, body) {
  const games = [...(team.games || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  let html = '';
  if (games.length === 0) {
    html = `<div class="empty"><span class="empty-emoji">🗓️</span>
      <p>${t('noGames')}</p>
      <button class="btn btn-primary" data-act="add-game">${esc(t('createGame'))}</button></div>`;
  } else {
    html = `<div class="card">`;
    for (const g of games) {
      const totalPitches = Object.values(g.pitching || {}).reduce((s, arr) => s + (arr ? arr.length : 0), 0);
      const titre = g.opponent ? t('vs', g.opponent) : t('game');
      html += `<button class="list-item" data-game="${g.id}">
        <span class="li-main">
          <span class="li-title">${esc(titre)}</span>
          <span class="li-sub">${esc(t('gameSub', fmtDate(g.date), g.location, totalPitches))}</span>
        </span>
        <span class="li-chevron">›</span>
      </button>`;
    }
    html += `</div>`;
  }
  html += `<button class="add-btn" data-act="add-game"><span class="plus">+</span> ${esc(t('addGame'))}</button>`;
  body.innerHTML = html;
  body.querySelectorAll('[data-act="add-game"]').forEach(b => b.onclick = () => gameForm(team));
  body.querySelectorAll('[data-game]').forEach(b => b.onclick = () => navigate('#/equipe/' + team.id + '/partie/' + b.dataset.game));
}

function renderSaisonTab(team, body) {
  const players = [...(team.players || [])].sort((a, b) => (Number(a.number) || 999) - (Number(b.number) || 999));
  if (players.length === 0) {
    body.innerHTML = `<div class="empty"><span class="empty-emoji">📊</span><p>${esc(t('seasonNeedsPlayers'))}</p></div>`;
    return;
  }
  const rows = players.map(p => ({ p, s: seasonTotals(team, p.id) }));
  const tot = rows.reduce((acc, { s }) => {
    acc.balle += s.balle; acc.prise += s.prise; acc.point += s.point; acc.lancers += s.lancers; return acc;
  }, { balle: 0, prise: 0, point: 0, lancers: 0 });
  const totPct = tot.lancers ? Math.round((tot.prise / tot.lancers) * 100) : 0;

  let html = `<p class="page-sub">${esc(t('seasonSub'))}</p>
    <div class="card table-wrap"><table class="stat-table">
    <thead><tr>
      <th>${esc(t('colPlayer'))}</th><th>${esc(t('colGP'))}</th><th>${esc(t('colPitches'))}</th><th>${esc(t('colStrikes'))}</th><th>${esc(t('colBalls'))}</th><th>${esc(t('colRunsShort'))}</th><th>${esc(t('colStrikePctShort'))}</th>
    </tr></thead><tbody>`;
  for (const { p, s } of rows) {
    html += `<tr data-player="${p.id}" style="cursor:pointer">
      <td>${esc(p.number ? '#' + p.number + ' ' : '')}${esc(p.name)}</td>
      <td>${s.parties}</td><td>${s.lancers}</td><td>${s.prise}</td><td>${s.balle}</td><td>${s.point}</td><td>${s.pct}%</td>
    </tr>`;
  }
  html += `<tr class="row-total"><td>${esc(t('teamTotal'))}</td><td></td><td>${tot.lancers}</td><td>${tot.prise}</td><td>${tot.balle}</td><td>${tot.point}</td><td>${totPct}%</td></tr>`;
  html += `</tbody></table></div>
    <p class="hint">${esc(t('seasonHint'))}</p>`;
  body.innerHTML = html;
  body.querySelectorAll('[data-player]').forEach(r => r.onclick = () => navigate('#/equipe/' + team.id + '/joueur/' + r.dataset.player));
}

/* ------------------------------------------------------------------ */
/* Écran : détail d'un joueur (stats par partie + saison)              */
/* ------------------------------------------------------------------ */
function renderPlayer(team, pl) {
  const s = seasonTotals(team, pl.id);
  const games = [...(team.games || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const played = games.filter(g => ((g.pitching && g.pitching[pl.id]) || []).length);

  let html = `<h2 class="page-title">${esc(pl.name)}</h2>
    <p class="page-sub"><span class="pos-tag">${pl.position} · ${esc(posNom(pl.position))}</span>${pl.number ? ' · ' + t('number') + ' ' + esc(pl.number) : ''}</p>

    <div class="section-title">${esc(t('seasonSection'))}</div>
    <div class="count-grid">
      <div class="count-card tot"><div class="cc-num">${s.lancers}</div><div class="cc-label">${esc(t('pitches'))}</div></div>
      <div class="count-card"><div class="cc-num">${s.prise}</div><div class="cc-label">${esc(t('strikes'))}</div></div>
      <div class="count-card"><div class="cc-num">${s.balle}</div><div class="cc-label">${esc(t('balls'))}</div></div>
    </div>
    <div class="count-grid">
      <div class="count-card"><div class="cc-num">${s.point}</div><div class="cc-label">${esc(t('runsAllowed'))}</div></div>
      <div class="count-card"><div class="cc-num">${s.pct}%</div><div class="cc-label">${esc(t('strikePct'))}</div></div>
      <div class="count-card"><div class="cc-num">${s.parties}</div><div class="cc-label">${esc(t('games'))}</div></div>
    </div>`;

  html += `<div class="section-title">${esc(t('perGame'))}</div>`;
  if (played.length === 0) {
    html += `<div class="empty" style="padding:24px"><p>${esc(t('noPitchesPlayer'))}</p></div>`;
  } else {
    html += `<div class="card table-wrap"><table class="stat-table">
      <thead><tr><th>${esc(t('game'))}</th><th>${esc(t('colPitches'))}</th><th>${esc(t('colStrikesShort'))}</th><th>${esc(t('colBallsShort'))}</th><th>${esc(t('colRuns'))}</th><th>${esc(t('colStrikePctShort'))}</th></tr></thead><tbody>`;
    for (const g of played) {
      const c = countLog(g.pitching[pl.id]);
      const titre = g.opponent ? t('vs', g.opponent) : t('game');
      html += `<tr data-game="${g.id}" style="cursor:pointer">
        <td>${esc(titre)}<br><span class="li-sub">${esc(fmtDate(g.date))}</span></td>
        <td>${c.lancers}</td><td>${c.prise}</td><td>${c.balle}</td><td>${c.point}</td><td>${c.pct}%</td>
      </tr>`;
    }
    html += `</tbody></table></div>`;
  }

  html += `<div class="danger-zone"><div class="section-title">${esc(t('playerSection'))}</div>
    <div class="btn-row">
      <button class="btn btn-ghost btn-sm" data-act="edit">${esc(t('edit'))}</button>
      <button class="btn btn-danger btn-sm" data-act="del">${esc(t('del'))}</button>
    </div></div>`;

  view.innerHTML = html;
  view.querySelectorAll('[data-game]').forEach(r => r.onclick = () => navigate('#/equipe/' + team.id + '/partie/' + r.dataset.game + '/lanceur/' + pl.id));
  view.querySelector('[data-act="edit"]').onclick = () => playerForm(team, pl);
  view.querySelector('[data-act="del"]').onclick = () =>
    confirmDialog(t('confirmDeletePlayer', pl.name), () => {
      team.players = team.players.filter(x => x.id !== pl.id);
      for (const g of team.games || []) { if (g.pitching) delete g.pitching[pl.id]; }
      saveDB(); navigate('#/equipe/' + team.id + '/joueurs'); toast(t('playerDeleted'));
    });
}

/* ------------------------------------------------------------------ */
/* Écran : détail d'une partie (choisir un lanceur)                    */
/* ------------------------------------------------------------------ */
function renderGame(team, game) {
  const players = [...(team.players || [])].sort((a, b) => (Number(a.number) || 999) - (Number(b.number) || 999));
  const titre = game.opponent ? t('vs', game.opponent) : t('game');

  let html = `<h2 class="page-title">${esc(titre)}</h2>
    <p class="page-sub">${esc(fmtDate(game.date))}${game.location ? ' · ' + esc(game.location) : ''}</p>`;
  if (game.notes) html += `<p class="meta-line">${esc(t('note', game.notes))}</p>`;

  html += `<div class="section-title">${esc(t('pitchersHelp'))}</div>`;

  if (players.length === 0) {
    html += `<div class="empty"><span class="empty-emoji">🧢</span><p>${t('noPlayersInTeam')}</p></div>`;
  } else {
    html += `<div class="card">`;
    for (const p of players) {
      const c = countLog((game.pitching && game.pitching[p.id]) || []);
      const sub = c.lancers ? t('pitcherLine', c) : t('noPitchesYet');
      html += `<button class="list-item" data-pitch="${p.id}">
        <span class="badge" style="background:${team.color}">${esc(p.number || '–')}</span>
        <span class="li-main">
          <span class="li-title">${esc(p.name)} <span class="pos-tag">${p.position}</span></span>
          <span class="li-sub">${esc(sub)}</span>
        </span>
        <span class="li-chevron">›</span>
      </button>`;
    }
    html += `</div>`;
  }

  html += `<div class="danger-zone"><div class="section-title">${esc(t('gameSectionTitle'))}</div>
    <div class="btn-row">
      <button class="btn btn-ghost btn-sm" data-act="edit-game">${esc(t('edit'))}</button>
      <button class="btn btn-danger btn-sm" data-act="del-game">${esc(t('del'))}</button>
    </div></div>`;

  view.innerHTML = html;
  view.querySelectorAll('[data-pitch]').forEach(b => b.onclick = () =>
    navigate('#/equipe/' + team.id + '/partie/' + game.id + '/lanceur/' + b.dataset.pitch));
  view.querySelector('[data-act="edit-game"]').onclick = () => gameForm(team, game);
  view.querySelector('[data-act="del-game"]').onclick = () =>
    confirmDialog(t('confirmDeleteGame'), () => {
      team.games = team.games.filter(x => x.id !== game.id);
      saveDB(); navigate('#/equipe/' + team.id + '/parties'); toast(t('gameDeleted'));
    });
}

/* ------------------------------------------------------------------ */
/* Écran : compteur de lancers                                         */
/* ------------------------------------------------------------------ */
function renderPitchCounter(team, game, pl) {
  const log = pitchLog(game, pl.id);
  const c = countLog(log);
  const titre = game.opponent ? t('vs', game.opponent) : t('game');

  const chipLabel = { prise: 'P', balle: 'B', point: 'PT' };
  const recent = log.filter(t => chipLabel[t]).slice(-24);  // ignore les anciens 'jeu'

  let html = `
    <div class="pitcher-banner">
      <div class="pb-name">${esc(pl.name)} <span class="pos-tag" style="background:rgba(255,255,255,.2);color:#fff;border-color:transparent">${pl.position}</span></div>
      <div class="pb-meta">${esc(titre)} · ${esc(fmtDate(game.date))}</div>
    </div>

    <div class="count-grid">
      <div class="count-card tot"><div class="cc-num" id="c-lancers">${c.lancers}</div><div class="cc-label">${esc(t('pitches'))}</div></div>
      <div class="count-card"><div class="cc-num" id="c-prise">${c.prise}</div><div class="cc-label">${esc(t('strikes'))}</div></div>
      <div class="count-card"><div class="cc-num" id="c-balle">${c.balle}</div><div class="cc-label">${esc(t('balls'))}</div></div>
    </div>

    <div class="pct-line">${t('runsAndPct', c)}</div>

    <div class="pitch-buttons">
      <button class="pitch-btn prise" data-add="prise">${esc(t('btnStrike'))}</button>
      <button class="pitch-btn balle" data-add="balle">${esc(t('btnBall'))}</button>
      <button class="pitch-btn point" data-add="point">${esc(t('btnRuns'))}</button>
    </div>

    <div class="btn-row">
      <button class="btn btn-ghost" data-act="undo" ${log.length ? '' : 'disabled style="opacity:.5"'}>${esc(t('undoLast'))}</button>
      <button class="btn btn-danger btn-sm" data-act="reset" ${log.length ? '' : 'disabled style="opacity:.5"'}>${esc(t('reset'))}</button>
    </div>

    <div class="section-title">${esc(t('lastPitches'))}</div>
    <div class="log-strip" id="logStrip">
      ${recent.length ? recent.map(tp => `<span class="log-chip ${tp}">${chipLabel[tp]}</span>`).join('') : `<span class="hint">${esc(t('noPitchesPrompt'))}</span>`}
    </div>
  `;
  view.innerHTML = html;

  const addPitch = (type) => {
    log.push(type);
    saveDB();
    refreshCounter(team, game, pl);
    if (navigator.vibrate) navigator.vibrate(12);
  };
  view.querySelectorAll('[data-add]').forEach(b => b.onclick = () => addPitch(b.dataset.add));
  view.querySelector('[data-act="undo"]').onclick = () => {
    if (!log.length) return;
    log.pop(); saveDB(); refreshCounter(team, game, pl);
  };
  view.querySelector('[data-act="reset"]').onclick = () => {
    if (!log.length) return;
    confirmDialog(t('confirmReset', pl.name), () => {
      game.pitching[pl.id] = [];
      saveDB(); refreshCounter(team, game, pl); toast(t('counterReset'));
    }, t('reset'));
  };
}

function refreshCounter(team, game, pl) {
  const log = pitchLog(game, pl.id);
  const c = countLog(log);
  const chipLabel = { prise: 'P', balle: 'B', point: 'PT' };
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('c-lancers', c.lancers); set('c-prise', c.prise); set('c-balle', c.balle);
  const pct = view.querySelector('.pct-line');
  if (pct) pct.innerHTML = t('runsAndPct', c);
  const strip = document.getElementById('logStrip');
  if (strip) {
    const recent = log.filter(tp => chipLabel[tp]).slice(-24);  // ignore les anciens 'jeu'
    strip.innerHTML = recent.length
      ? recent.map(tp => `<span class="log-chip ${tp}">${chipLabel[tp]}</span>`).join('')
      : `<span class="hint">${esc(t('noPitchesPrompt'))}</span>`;
  }
  const undo = view.querySelector('[data-act="undo"]');
  const reset = view.querySelector('[data-act="reset"]');
  [undo, reset].forEach(b => { if (b) { b.disabled = !log.length; b.style.opacity = log.length ? '' : '.5'; } });
}

/* ------------------------------------------------------------------ */
/* Sauvegarde / import (JSON)                                          */
/* ------------------------------------------------------------------ */
function exportData() {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trois-prises-' + todayISO() + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(t('saveDownloaded'));
}
function importData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'application/json,.json';
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.teams)) throw new Error('Format invalide');
        confirmDialog(t('confirmImport', data.teams.length), () => {
          DB = data; if (!DB.teams) DB.teams = [];
          saveDB(); navigate(''); render(); toast(t('dataImported'));
        }, t('importAction'));
      } catch (e) {
        toast(t('invalidFile'));
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ------------------------------------------------------------------ */
/* Démarrage + Service Worker                                          */
/* ------------------------------------------------------------------ */
document.getElementById('versionTag').textContent = 'v' + APP_VERSION;

applyLang();
window.addEventListener('hashchange', render);
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      // Détecte une nouvelle version en attente
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            toast(t('updateAvailable'), {
              sticky: true, tappable: true,
              onTap: () => { sw.postMessage({ type: 'SKIP_WAITING' }); },
            });
          }
        });
      });
    }).catch(err => console.warn('SW non enregistré', err));

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  });
}
