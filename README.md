# Trois Prises ⚾

Application web progressive (PWA) en JavaScript / HTML / CSS purs pour **compter les lancers** de tes lanceurs de baseball — balles, prises, balles en jeu et total de lancers — par équipe et par partie. Tout en **français québécois**, données **stockées localement** seulement (aucun serveur).

> *« Trois Prises »* — le décompte du lanceur. Palette inspirée des **Expos de Montréal** (bleu royal, rouge, crème).

## Fonctionnalités

- **Équipes** — créer, modifier, supprimer (CRUD).
- **Joueurs** — CRUD par équipe, avec **numéro** et **position** (Lanceur, Receveur, Arrêt-court, etc.).
- **Parties** — CRUD par équipe (date, adversaire, lieu, notes).
- **Compteur de lancers** — le coach entre chaque lancer (Prise / Balle / Balle en jeu), avec *annuler le dernier* et *réinitialiser*.
- **Statistiques** — par partie, par joueur, et cumul **saison** pour toute l’équipe (lancers, prises, balles, en jeu, % de prises).
- **Sauvegarde / Import** — export/import JSON pour ne rien perdre.
- **Hors-ligne** — fonctionne sans connexion (service worker), installable sur l’écran d’accueil.

## Déploiement sur GitHub Pages

1. Pousser ces fichiers à la racine d’un dépôt (ou dans `/docs`).
2. Dans **Settings → Pages**, choisir la branche (`main`) et le dossier racine.
3. Visiter `https://<utilisateur>.github.io/<dépôt>/`.

Tous les chemins sont **relatifs** (`./…`), donc l’app fonctionne sous un sous-dossier. Un fichier `.nojekyll` est inclus.

## Mises à jour (versioning)

- Le numéro de version vit dans deux constantes : `APP_VERSION` ([js/app.js](js/app.js)) et `CACHE_VERSION` ([sw.js](sw.js)).
- **À chaque déploiement, incrémente `CACHE_VERSION`** (ex. `v1.0.0` → `v1.0.1`).
- Le nouveau service worker pré-cache la nouvelle version ; à l’`activate`, les anciens caches sont supprimés.
- L’app détecte le nouveau SW et affiche **« Mise à jour disponible — touche pour rafraîchir »**. Un touché applique la mise à jour et recharge.

## Développement local

Servir le dossier (le service worker exige `http://`, pas `file://`) :

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Coquille de l’app |
| `css/styles.css` | Styles + palette |
| `js/app.js` | Logique, routage, stockage, stats |
| `sw.js` | Service worker (cache + versioning) |
| `manifest.webmanifest` | Manifeste PWA |
| `icons/` | Icônes SVG (normale + maskable) |
