/* Trois Prises — compteur de lancers (PWA, vanilla JS) */
'use strict';

const APP_VERSION = '1.0.1';
const STORE_KEY = 'troisprises.db';

/* ------------------------------------------------------------------ */
/* Positions de baseball (français québécois)                          */
/* ------------------------------------------------------------------ */
const POSITIONS = [
  { code: 'L',  nom: 'Lanceur' },
  { code: 'R',  nom: 'Receveur' },
  { code: 'B1', nom: 'Premier but' },
  { code: 'B2', nom: 'Deuxième but' },
  { code: 'B3', nom: 'Troisième but' },
  { code: 'AC', nom: 'Arrêt-court' },
  { code: 'CG', nom: 'Champ gauche' },
  { code: 'CC', nom: 'Champ centre' },
  { code: 'CD', nom: 'Champ droit' },
  { code: 'FD', nom: 'Frappeur désigné' },
];
const posNom = (code) => (POSITIONS.find(p => p.code === code) || {}).nom || '';

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
    toast('Impossible de sauvegarder (stockage plein?)');
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
/* Le journal d'une partie : game.pitching[playerId] = ['prise','balle','jeu', ...] */
/* ------------------------------------------------------------------ */
function pitchLog(game, pid) {
  if (!game.pitching) game.pitching = {};
  if (!Array.isArray(game.pitching[pid])) game.pitching[pid] = [];
  return game.pitching[pid];
}
function countLog(arr) {
  const c = { balle: 0, prise: 0, jeu: 0 };
  for (const t of arr) if (c[t] !== undefined) c[t]++;
  const lancers = c.balle + c.prise + c.jeu;
  const prisesEff = c.prise + c.jeu;            // prises + balles en jeu = lancers dans la zone
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
    return d.toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return iso; }
}
function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const initials = (name) => (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

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

function confirmDialog(message, onYes, yesLabel = 'Supprimer') {
  showModal(`
    <h2>Confirmation</h2>
    <p class="meta-line" style="font-size:1rem">${esc(message)}</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="annuler">Annuler</button>
      <button class="btn btn-rouge" data-act="ok">${esc(yesLabel)}</button>
    </div>`, (m) => {
    m.querySelector('[data-act="annuler"]').onclick = closeModal;
    m.querySelector('[data-act="ok"]').onclick = () => { closeModal(); onYes(); };
  });
}

function colorPicker(selected) {
  return `<div class="color-picker">` + COULEURS.map(c =>
    `<button type="button" class="color-swatch${c === selected ? ' sel' : ''}" data-color="${c}" style="background:${c}" aria-label="Couleur"></button>`
  ).join('') + `</div>`;
}

/* --- Équipe --- */
function teamForm(team) {
  const isEdit = !!team;
  const cur = team || { name: '', color: COULEURS[0] };
  showModal(`
    <h2>${isEdit ? 'Modifier l’équipe' : 'Nouvelle équipe'}</h2>
    <div class="field">
      <label for="f-name">Nom de l’équipe</label>
      <input id="f-name" type="text" maxlength="40" placeholder="Ex. : Les Castors de Longueuil" value="${esc(cur.name)}" />
    </div>
    <div class="field">
      <label>Couleur</label>
      ${colorPicker(cur.color)}
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="annuler">Annuler</button>
      <button class="btn btn-primary" data-act="ok">${isEdit ? 'Enregistrer' : 'Créer'}</button>
    </div>`, (m) => {
    let color = cur.color;
    m.querySelectorAll('.color-swatch').forEach(s => s.onclick = () => {
      m.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('sel'));
      s.classList.add('sel'); color = s.dataset.color;
    });
    m.querySelector('[data-act="annuler"]').onclick = closeModal;
    m.querySelector('[data-act="ok"]').onclick = () => {
      const name = m.querySelector('#f-name').value.trim();
      if (!name) { toast('Donne un nom à l’équipe'); return; }
      if (isEdit) { team.name = name; team.color = color; }
      else { DB.teams.push({ id: uid(), name, color, players: [], games: [] }); }
      saveDB(); closeModal(); render();
      toast(isEdit ? 'Équipe modifiée' : 'Équipe créée');
    };
    setTimeout(() => m.querySelector('#f-name').focus(), 100);
  });
}

/* --- Joueur --- */
function playerForm(team, player) {
  const isEdit = !!player;
  const cur = player || { name: '', number: '', position: 'L' };
  showModal(`
    <h2>${isEdit ? 'Modifier le joueur' : 'Nouveau joueur'}</h2>
    <div class="field">
      <label for="f-pname">Nom du joueur</label>
      <input id="f-pname" type="text" maxlength="40" placeholder="Ex. : Maxime Tremblay" value="${esc(cur.name)}" />
    </div>
    <div class="field-row">
      <div class="field">
        <label for="f-num">Numéro</label>
        <input id="f-num" type="number" inputmode="numeric" min="0" max="99" placeholder="00" value="${esc(cur.number)}" />
      </div>
      <div class="field">
        <label for="f-pos">Position</label>
        <select id="f-pos">
          ${POSITIONS.map(p => `<option value="${p.code}"${p.code === cur.position ? ' selected' : ''}>${p.code} — ${p.nom}</option>`).join('')}
        </select>
      </div>
    </div>
    <p class="hint">La position peut être changée en tout temps. Tout joueur peut être utilisé comme lanceur dans une partie.</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="annuler">Annuler</button>
      <button class="btn btn-primary" data-act="ok">${isEdit ? 'Enregistrer' : 'Ajouter'}</button>
    </div>`, (m) => {
    m.querySelector('[data-act="annuler"]').onclick = closeModal;
    m.querySelector('[data-act="ok"]').onclick = () => {
      const name = m.querySelector('#f-pname').value.trim();
      if (!name) { toast('Donne un nom au joueur'); return; }
      const number = m.querySelector('#f-num').value.trim();
      const position = m.querySelector('#f-pos').value;
      if (isEdit) { player.name = name; player.number = number; player.position = position; }
      else { team.players.push({ id: uid(), name, number, position }); }
      saveDB(); closeModal(); render();
      toast(isEdit ? 'Joueur modifié' : 'Joueur ajouté');
    };
    setTimeout(() => m.querySelector('#f-pname').focus(), 100);
  });
}

/* --- Partie --- */
function gameForm(team, game) {
  const isEdit = !!game;
  const cur = game || { date: todayISO(), opponent: '', location: '', notes: '' };
  showModal(`
    <h2>${isEdit ? 'Modifier la partie' : 'Nouvelle partie'}</h2>
    <div class="field-row">
      <div class="field">
        <label for="f-date">Date</label>
        <input id="f-date" type="date" value="${esc(cur.date)}" />
      </div>
      <div class="field">
        <label for="f-loc">Lieu</label>
        <input id="f-loc" type="text" maxlength="40" placeholder="Domicile / Visiteur" value="${esc(cur.location)}" />
      </div>
    </div>
    <div class="field">
      <label for="f-opp">Adversaire</label>
      <input id="f-opp" type="text" maxlength="40" placeholder="Ex. : Les Aigles de Laval" value="${esc(cur.opponent)}" />
    </div>
    <div class="field">
      <label for="f-notes">Notes (facultatif)</label>
      <textarea id="f-notes" rows="2" maxlength="200" placeholder="Météo, manche, etc.">${esc(cur.notes)}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" data-act="annuler">Annuler</button>
      <button class="btn btn-primary" data-act="ok">${isEdit ? 'Enregistrer' : 'Créer'}</button>
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
      toast(isEdit ? 'Partie modifiée' : 'Partie créée');
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

  if (seg.length === 0) { backBtn.hidden = true; return renderTeams(); }

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
  let html = `<h2 class="page-title">Mes équipes</h2>
    <p class="page-sub">Suis les lancers de tes lanceurs, partie par partie.</p>`;

  if (DB.teams.length === 0) {
    html += `<div class="empty">
      <span class="empty-emoji">⚾</span>
      <p>Aucune équipe pour l’instant.<br>Crée ta première équipe pour commencer.</p>
      <button class="btn btn-primary" data-act="add-team">+ Créer une équipe</button>
    </div>`;
  } else {
    html += `<div class="card">`;
    for (const t of DB.teams) {
      const nbJ = (t.players || []).length;
      const nbP = (t.games || []).length;
      html += `<button class="list-item" data-team="${t.id}">
        <span class="team-dot" style="background:${t.color}">${esc(initials(t.name))}</span>
        <span class="li-main">
          <span class="li-title">${esc(t.name)}</span>
          <span class="li-sub">${nbJ} joueur${nbJ > 1 ? 's' : ''} · ${nbP} partie${nbP > 1 ? 's' : ''}</span>
        </span>
        <span class="li-chevron">›</span>
      </button>`;
    }
    html += `</div>`;
    html += `<div class="section-title">Données</div>
      <div class="btn-row">
        <button class="btn btn-ghost btn-sm" data-act="export">⬇️ Sauvegarder</button>
        <button class="btn btn-ghost btn-sm" data-act="import">⬆️ Importer</button>
      </div>`;
  }

  html += `<button class="add-btn" data-act="add-team"><span class="plus">+</span> Équipe</button>`;
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
  const tabs = [['joueurs', 'Joueurs'], ['parties', 'Parties'], ['saison', 'Saison']];
  let html = `<h2 class="page-title">${esc(team.name)}</h2>
    <p class="page-sub">${(team.players || []).length} joueur(s) · ${(team.games || []).length} partie(s)</p>
    <div class="tabs">` +
    tabs.map(([k, l]) => `<button class="tab${k === tab ? ' active' : ''}" data-tab="${k}">${l}</button>`).join('') +
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
      <p>Aucun joueur.<br>Ajoute des joueurs et donne-leur une position.</p>
      <button class="btn btn-primary" data-act="add-player">+ Ajouter un joueur</button></div>`;
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
  html += `<button class="add-btn" data-act="add-player"><span class="plus">+</span> Joueur</button>`;

  html += `<div class="danger-zone"><div class="section-title">Équipe</div>
    <div class="btn-row">
      <button class="btn btn-ghost btn-sm" data-act="edit-team">Modifier l’équipe</button>
      <button class="btn btn-danger btn-sm" data-act="del-team">Supprimer l’équipe</button>
    </div></div>`;

  body.innerHTML = html;
  body.querySelectorAll('[data-act="add-player"]').forEach(b => b.onclick = () => playerForm(team));
  body.querySelectorAll('[data-player]').forEach(b => b.onclick = () => navigate('#/equipe/' + team.id + '/joueur/' + b.dataset.player));
  body.querySelector('[data-act="edit-team"]').onclick = () => teamForm(team);
  body.querySelector('[data-act="del-team"]').onclick = () =>
    confirmDialog(`Supprimer « ${team.name} » et toutes ses données (joueurs et parties)? Action irréversible.`, () => {
      DB.teams = DB.teams.filter(t => t.id !== team.id);
      saveDB(); navigate(''); toast('Équipe supprimée');
    });
}

function renderPartiesTab(team, body) {
  const games = [...(team.games || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  let html = '';
  if (games.length === 0) {
    html = `<div class="empty"><span class="empty-emoji">🗓️</span>
      <p>Aucune partie.<br>Crée une partie pour commencer à compter les lancers.</p>
      <button class="btn btn-primary" data-act="add-game">+ Créer une partie</button></div>`;
  } else {
    html = `<div class="card">`;
    for (const g of games) {
      const totalPitches = Object.values(g.pitching || {}).reduce((s, arr) => s + (arr ? arr.length : 0), 0);
      const titre = g.opponent ? ('c. ' + g.opponent) : 'Partie';
      html += `<button class="list-item" data-game="${g.id}">
        <span class="li-main">
          <span class="li-title">${esc(titre)}</span>
          <span class="li-sub">${esc(fmtDate(g.date))}${g.location ? ' · ' + esc(g.location) : ''} · ${totalPitches} lancer${totalPitches > 1 ? 's' : ''}</span>
        </span>
        <span class="li-chevron">›</span>
      </button>`;
    }
    html += `</div>`;
  }
  html += `<button class="add-btn" data-act="add-game"><span class="plus">+</span> Partie</button>`;
  body.innerHTML = html;
  body.querySelectorAll('[data-act="add-game"]').forEach(b => b.onclick = () => gameForm(team));
  body.querySelectorAll('[data-game]').forEach(b => b.onclick = () => navigate('#/equipe/' + team.id + '/partie/' + b.dataset.game));
}

function renderSaisonTab(team, body) {
  const players = [...(team.players || [])].sort((a, b) => (Number(a.number) || 999) - (Number(b.number) || 999));
  if (players.length === 0) {
    body.innerHTML = `<div class="empty"><span class="empty-emoji">📊</span><p>Ajoute des joueurs pour voir les statistiques de la saison.</p></div>`;
    return;
  }
  const rows = players.map(p => ({ p, s: seasonTotals(team, p.id) }));
  const tot = rows.reduce((acc, { s }) => {
    acc.balle += s.balle; acc.prise += s.prise; acc.jeu += s.jeu; acc.lancers += s.lancers; return acc;
  }, { balle: 0, prise: 0, jeu: 0, lancers: 0 });
  const totPct = tot.lancers ? Math.round(((tot.prise + tot.jeu) / tot.lancers) * 100) : 0;

  let html = `<p class="page-sub">Cumul de tous les lancers de la saison.</p>
    <div class="card table-wrap"><table class="stat-table">
    <thead><tr>
      <th>Joueur</th><th>PJ</th><th>Lancers</th><th>Prises</th><th>Balles</th><th>En jeu</th><th>% pr.</th>
    </tr></thead><tbody>`;
  for (const { p, s } of rows) {
    html += `<tr data-player="${p.id}" style="cursor:pointer">
      <td>${esc(p.number ? '#' + p.number + ' ' : '')}${esc(p.name)}</td>
      <td>${s.parties}</td><td>${s.lancers}</td><td>${s.prise}</td><td>${s.balle}</td><td>${s.jeu}</td><td>${s.pct}%</td>
    </tr>`;
  }
  html += `<tr class="row-total"><td>Total équipe</td><td></td><td>${tot.lancers}</td><td>${tot.prise}</td><td>${tot.balle}</td><td>${tot.jeu}</td><td>${totPct}%</td></tr>`;
  html += `</tbody></table></div>
    <p class="hint">PJ = parties jouées (avec lancers) · % pr. = pourcentage de prises (prises + balles en jeu sur total). Touche un joueur pour le détail.</p>`;
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
    <p class="page-sub"><span class="pos-tag">${pl.position} · ${esc(posNom(pl.position))}</span>${pl.number ? ' · n<sup>o</sup> ' + esc(pl.number) : ''}</p>

    <div class="section-title">Saison</div>
    <div class="count-grid">
      <div class="count-card tot"><div class="cc-num">${s.lancers}</div><div class="cc-label">Lancers</div></div>
      <div class="count-card"><div class="cc-num">${s.prise}</div><div class="cc-label">Prises</div></div>
      <div class="count-card"><div class="cc-num">${s.balle}</div><div class="cc-label">Balles</div></div>
    </div>
    <div class="count-grid">
      <div class="count-card"><div class="cc-num">${s.jeu}</div><div class="cc-label">En jeu</div></div>
      <div class="count-card"><div class="cc-num">${s.pct}%</div><div class="cc-label">% prises</div></div>
      <div class="count-card"><div class="cc-num">${s.parties}</div><div class="cc-label">Parties</div></div>
    </div>`;

  html += `<div class="section-title">Par partie</div>`;
  if (played.length === 0) {
    html += `<div class="empty" style="padding:24px"><p>Aucun lancer enregistré pour ce joueur.</p></div>`;
  } else {
    html += `<div class="card table-wrap"><table class="stat-table">
      <thead><tr><th>Partie</th><th>Lancers</th><th>Pr.</th><th>Ba.</th><th>Jeu</th><th>% pr.</th></tr></thead><tbody>`;
    for (const g of played) {
      const c = countLog(g.pitching[pl.id]);
      const titre = (g.opponent ? 'c. ' + g.opponent : 'Partie');
      html += `<tr data-game="${g.id}" style="cursor:pointer">
        <td>${esc(titre)}<br><span class="li-sub">${esc(fmtDate(g.date))}</span></td>
        <td>${c.lancers}</td><td>${c.prise}</td><td>${c.balle}</td><td>${c.jeu}</td><td>${c.pct}%</td>
      </tr>`;
    }
    html += `</tbody></table></div>`;
  }

  html += `<div class="danger-zone"><div class="section-title">Joueur</div>
    <div class="btn-row">
      <button class="btn btn-ghost btn-sm" data-act="edit">Modifier</button>
      <button class="btn btn-danger btn-sm" data-act="del">Supprimer</button>
    </div></div>`;

  view.innerHTML = html;
  view.querySelectorAll('[data-game]').forEach(r => r.onclick = () => navigate('#/equipe/' + team.id + '/partie/' + r.dataset.game + '/lanceur/' + pl.id));
  view.querySelector('[data-act="edit"]').onclick = () => playerForm(team, pl);
  view.querySelector('[data-act="del"]').onclick = () =>
    confirmDialog(`Supprimer ${pl.name}? Ses statistiques seront retirées de toutes les parties.`, () => {
      team.players = team.players.filter(x => x.id !== pl.id);
      for (const g of team.games || []) { if (g.pitching) delete g.pitching[pl.id]; }
      saveDB(); navigate('#/equipe/' + team.id + '/joueurs'); toast('Joueur supprimé');
    });
}

/* ------------------------------------------------------------------ */
/* Écran : détail d'une partie (choisir un lanceur)                    */
/* ------------------------------------------------------------------ */
function renderGame(team, game) {
  const players = [...(team.players || [])].sort((a, b) => (Number(a.number) || 999) - (Number(b.number) || 999));
  const titre = game.opponent ? ('c. ' + game.opponent) : 'Partie';

  let html = `<h2 class="page-title">${esc(titre)}</h2>
    <p class="page-sub">${esc(fmtDate(game.date))}${game.location ? ' · ' + esc(game.location) : ''}</p>`;
  if (game.notes) html += `<p class="meta-line">📝 ${esc(game.notes)}</p>`;

  html += `<div class="section-title">Lanceurs — touche un joueur pour compter</div>`;

  if (players.length === 0) {
    html += `<div class="empty"><span class="empty-emoji">🧢</span><p>Aucun joueur dans l’équipe.<br>Ajoute des joueurs d’abord.</p></div>`;
  } else {
    html += `<div class="card">`;
    for (const p of players) {
      const c = countLog((game.pitching && game.pitching[p.id]) || []);
      const sub = c.lancers
        ? `${c.lancers} lancers · ${c.prise} pr. · ${c.balle} ba. · ${c.jeu} jeu · ${c.pct}%`
        : 'Aucun lancer — touche pour commencer';
      html += `<button class="list-item" data-pitch="${p.id}">
        <span class="badge" style="background:${team.color}">${esc(p.number || '–')}</span>
        <span class="li-main">
          <span class="li-title">${esc(p.name)} <span class="pos-tag">${p.position}</span></span>
          <span class="li-sub">${sub}</span>
        </span>
        <span class="li-chevron">›</span>
      </button>`;
    }
    html += `</div>`;
  }

  html += `<div class="danger-zone"><div class="section-title">Partie</div>
    <div class="btn-row">
      <button class="btn btn-ghost btn-sm" data-act="edit-game">Modifier</button>
      <button class="btn btn-danger btn-sm" data-act="del-game">Supprimer</button>
    </div></div>`;

  view.innerHTML = html;
  view.querySelectorAll('[data-pitch]').forEach(b => b.onclick = () =>
    navigate('#/equipe/' + team.id + '/partie/' + game.id + '/lanceur/' + b.dataset.pitch));
  view.querySelector('[data-act="edit-game"]').onclick = () => gameForm(team, game);
  view.querySelector('[data-act="del-game"]').onclick = () =>
    confirmDialog(`Supprimer cette partie et tous ses lancers? Action irréversible.`, () => {
      team.games = team.games.filter(x => x.id !== game.id);
      saveDB(); navigate('#/equipe/' + team.id + '/parties'); toast('Partie supprimée');
    });
}

/* ------------------------------------------------------------------ */
/* Écran : compteur de lancers                                         */
/* ------------------------------------------------------------------ */
function renderPitchCounter(team, game, pl) {
  const log = pitchLog(game, pl.id);
  const c = countLog(log);
  const titre = game.opponent ? ('c. ' + game.opponent) : 'Partie';

  const recent = log.slice(-24);
  const chipLabel = { prise: 'P', balle: 'B', jeu: 'J' };

  let html = `
    <div class="pitcher-banner">
      <div class="pb-name">${esc(pl.name)} <span class="pos-tag" style="background:rgba(255,255,255,.2);color:#fff;border-color:transparent">${pl.position}</span></div>
      <div class="pb-meta">${esc(titre)} · ${esc(fmtDate(game.date))}</div>
    </div>

    <div class="count-grid">
      <div class="count-card tot"><div class="cc-num" id="c-lancers">${c.lancers}</div><div class="cc-label">Lancers</div></div>
      <div class="count-card"><div class="cc-num" id="c-prise">${c.prise}</div><div class="cc-label">Prises</div></div>
      <div class="count-card"><div class="cc-num" id="c-balle">${c.balle}</div><div class="cc-label">Balles</div></div>
    </div>

    <div class="pct-line">En jeu : <b style="color:var(--or)">${c.jeu}</b> &nbsp;·&nbsp; % de prises : <b>${c.pct}%</b></div>

    <div class="pitch-buttons">
      <button class="pitch-btn prise" data-add="prise">Prise<small>strike</small></button>
      <button class="pitch-btn balle" data-add="balle">Balle<small>ball</small></button>
      <button class="pitch-btn jeu" data-add="jeu">Balle en jeu<small>frappée en jeu</small></button>
    </div>

    <div class="btn-row">
      <button class="btn btn-ghost" data-act="undo" ${log.length ? '' : 'disabled style="opacity:.5"'}>↩︎ Annuler le dernier</button>
      <button class="btn btn-danger btn-sm" data-act="reset" ${log.length ? '' : 'disabled style="opacity:.5"'}>Réinitialiser</button>
    </div>

    <div class="section-title">Derniers lancers</div>
    <div class="log-strip" id="logStrip">
      ${recent.length ? recent.map(t => `<span class="log-chip ${t}">${chipLabel[t]}</span>`).join('') : '<span class="hint">Aucun lancer encore. Touche un bouton ci-dessus.</span>'}
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
    confirmDialog(`Effacer tous les lancers de ${pl.name} pour cette partie?`, () => {
      game.pitching[pl.id] = [];
      saveDB(); refreshCounter(team, game, pl); toast('Compteur réinitialisé');
    }, 'Réinitialiser');
  };
}

function refreshCounter(team, game, pl) {
  const log = pitchLog(game, pl.id);
  const c = countLog(log);
  const chipLabel = { prise: 'P', balle: 'B', jeu: 'J' };
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('c-lancers', c.lancers); set('c-prise', c.prise); set('c-balle', c.balle);
  const pct = view.querySelector('.pct-line');
  if (pct) pct.innerHTML = `En jeu : <b style="color:var(--or)">${c.jeu}</b> &nbsp;·&nbsp; % de prises : <b>${c.pct}%</b>`;
  const strip = document.getElementById('logStrip');
  if (strip) {
    const recent = log.slice(-24);
    strip.innerHTML = recent.length
      ? recent.map(t => `<span class="log-chip ${t}">${chipLabel[t]}</span>`).join('')
      : '<span class="hint">Aucun lancer encore. Touche un bouton ci-dessus.</span>';
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
  toast('Sauvegarde téléchargée');
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
        confirmDialog(`Importer ${data.teams.length} équipe(s)? Cela remplacera toutes les données actuelles.`, () => {
          DB = data; if (!DB.teams) DB.teams = [];
          saveDB(); navigate(''); render(); toast('Données importées');
        }, 'Importer');
      } catch (e) {
        toast('Fichier invalide');
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
            toast('Mise à jour disponible — touche pour rafraîchir', {
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
