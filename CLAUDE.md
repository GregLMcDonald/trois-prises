# CLAUDE.md

Guidance for working in this repository.

## What this is

**Trois Prises ⚾** is a baseball pitch-counter for coaches: tally strikes, balls and
runs allowed per pitcher, per game, per team. It's a **vanilla-JS Progressive Web App**
— no build step, no framework, no dependencies, no package.json. Data lives entirely in
the browser's `localStorage` (no server). Designed to be deployed statically to GitHub
Pages and installed to a phone's home screen, working offline.

## Files

| File | Role |
|---|---|
| `index.html` | App shell: header, `#view` mount point, `#modalHost`, footer. |
| `css/styles.css` | All styling + the Montréal-Expos-inspired palette (CSS variables in `:root`). |
| `js/app.js` | Everything: i18n, storage, hash router, rendering, stats, import/export. |
| `sw.js` | Service worker: precaches the app shell, versioned cache, update prompt. |
| `manifest.webmanifest` | PWA manifest. |
| `icons/` | SVG icons (normal + maskable). |

## Architecture (`js/app.js`)

It's a single-file app organized into labelled sections. Key pieces:

- **Storage** — `DB` is the in-memory state, loaded from `localStorage` key
  `troisprises.db` via `loadDB()` and persisted with `saveDB()` after every mutation.
  Shape: `{ version, teams: [{ id, name, color, players:[...], games:[...] }] }`. A game
  stores its pitch log as `game.pitching[playerId] = ['prise'|'balle'|'point', ...]`.
- **Routing** — hash-based. `parseHash()` splits `#/equipe/<id>/partie/<id>/lanceur/<id>`
  into segments; `render()` dispatches to the matching `renderX()` screen and manages the
  back button. There is no router library — just string segments.
- **Rendering** — each screen is a `renderX()` function that builds an HTML string,
  assigns it to `view.innerHTML`, then wires up `onclick` handlers by querying
  `data-*` attributes. Modals use `showModal()` / `closeModal()` (the bottom-sheet UI).
- **Stats** — `countLog()` derives counts from a pitch array (note: a `point` / run
  allowed is **not** counted as a pitch); `seasonTotals()` aggregates across games.

### Internationalization

The UI is bilingual: **French (default) and English**, chosen in the settings bottom
sheet (gear button, shown only on the home screen). Implementation:

- `LANG` holds the active language, persisted to `localStorage` key `troisprises.lang`.
- `I18N = { fr: {...}, en: {...} }` maps string keys to either literals or functions
  (for interpolation/pluralization). `t(key, ...args)` resolves the current language and
  falls back to French, then to the raw key.
- `posNom(code)` returns the localized baseball position name from `POSITIONS`.
- `setLang()` saves, calls `applyLang()` (updates `<html lang>`, footer note, aria
  labels) and re-renders. `fmtDate()` switches locale (`fr-CA` / `en-CA`).

**When adding or changing any user-facing text, add a key to BOTH `fr` and `en` in
`I18N` and reference it via `t('key')` — never hardcode display strings in `renderX()`.**
Always pass user/data text through `esc()` before interpolating into HTML.

## Conventions

- Internal identifiers (variable names, data keys like `prise`/`balle`/`point`, comments)
  are in French — match the surrounding code. Only **display strings** go through i18n.
- No external libraries. Keep it dependency-free and buildless.
- Mutations: change `DB`, call `saveDB()`, then re-render (`render()` or a targeted
  refresh like `refreshCounter()`).

## Versioning / deploying

Bump **both** on every deploy:

- `APP_VERSION` in `js/app.js` (shown in the footer).
- `CACHE_VERSION` in `sw.js` — this is what actually busts the offline cache. The
  `activate` handler deletes old caches; the page shows an "update available" prompt and
  reloads when the user taps it.

## Local development

Service workers require `http://`, not `file://`:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

There are no tests, linters, or build commands.
