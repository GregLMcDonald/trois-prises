# Trois Prises ⚾ — Compteur de lancers de baseball gratuit / Free Baseball Pitch Counter

**Application web gratuite et hors-ligne pour compter les lancers de baseball** (prises, balles, points accordés) par lanceur, par équipe et par partie, avec statistiques de saison. Interface **bilingue (français / anglais)**, données **stockées localement** seulement (aucun compte, aucun serveur).

> **A free, offline baseball pitch counter (PWA).** Track strikes, balls and runs allowed per pitcher, team and game, with season stats. Bilingual French/English UI, no account, data stays on your device.

🔗 **Application en ligne / Live app : https://greglmcdonald.github.io/trois-prises/**

> *« Trois Prises »* — le décompte du lanceur. Palette inspirée des **Expos de Montréal** (bleu royal, rouge, crème).

## Fonctionnalités

- **Équipes** — créer, modifier, supprimer (CRUD).
- **Joueurs** — CRUD par équipe, avec **numéro** et **position** (Lanceur, Receveur, Arrêt-court, etc.).
- **Parties** — CRUD par équipe (date, adversaire, lieu, notes).
- **Compteur de lancers** — le coach entre chaque lancer (Prise / Balle / Points accordés), avec *annuler le dernier* et *réinitialiser*.
- **Statistiques** — par partie, par joueur, et cumul **saison** pour toute l’équipe (lancers, prises, balles, points accordés, % de prises).
- **Langue** — interface **bilingue français / anglais**, réglable depuis l’écran d’accueil (français par défaut).
- **Sauvegarde / Import** — export/import JSON pour ne rien perdre.
- **Hors-ligne** — fonctionne sans connexion (service worker), installable sur l’écran d’accueil.

## In English

**Trois Prises is a free baseball pitch counter** — a no-account, offline-first Progressive Web App for coaches. Tap to log each pitch as a **strike**, **ball**, or **runs allowed**, per pitcher, per team and per game, and see **season stats** (pitches, strikes, balls, runs, strike %). The interface is **bilingual (English / French)** — switch language from the settings sheet on the home screen. All data is stored **locally on your device** (nothing is sent to a server). Install it to your phone's home screen and use it offline at the field.

Built with plain JavaScript, HTML and CSS — no framework, no build step, no dependencies.

## Déploiement sur GitHub Pages

1. Pousser ces fichiers à la racine d’un dépôt (ou dans `/docs`).
2. Dans **Settings → Pages**, choisir la branche (`main`) et le dossier racine.
3. Visiter `https://<utilisateur>.github.io/<dépôt>/`.

Tous les chemins sont **relatifs** (`./…`), donc l’app fonctionne sous un sous-dossier. Un fichier `.nojekyll` est inclus.

## Découvrabilité (SEO)

L’app est **indexable** par Google et Bing (un site GitHub Pages est un site public ordinaire). Le `<head>` de [index.html](index.html) contient titre, description, mots-clés, balises Open Graph et des **données structurées JSON-LD** (application gratuite), le tout **bilingue FR/EN**, et un bloc `<noscript>` décrivant l’app pour les robots. Le balisage et ce README portent l’essentiel du référencement (l’app est une page unique rendue en JavaScript).

Étapes à faire **hors du code** pour être trouvable :

1. **Description + sujets du dépôt** — sur la page GitHub, ajoute une description et des *topics* : `baseball`, `pitch-counter`, `compteur-de-lancers`, `pwa`, `offline`, `sports`, `quebec`, `bilingual`.
2. **Google Search Console** et **Bing Webmaster Tools** — ajoute la propriété `https://greglmcdonald.github.io/trois-prises/` et **soumets le sitemap** [`sitemap.xml`](sitemap.xml). *(Note : un `robots.txt` placé dans ce dépôt de projet n’est pas lu par les robots — ils ne lisent que `greglmcdonald.github.io/robots.txt`, à la racine du domaine.)*
3. **Liens entrants** — le classement dépend surtout des liens. Partage l’URL (forums de baseball mineur, groupes de coachs, réseaux sociaux) pour amorcer l’indexation et le référencement.
4. **Image de partage** — l’`og:image` / `twitter:image` pointe maintenant vers `icons/icon-512.png` (carré), idéal pour la *carte Twitter `summary`*. Pour de plus grandes cartes (Facebook, LinkedIn), une image **paysage ~1200×630** donne un meilleur aperçu — ajoute-la et mets à jour `og:image`.

> Si tu utilises un **domaine personnalisé** plus tard, mets à jour les URL absolues (`canonical`, Open Graph, JSON-LD dans [index.html](index.html), et [sitemap.xml](sitemap.xml)).

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
| `icons/` | Icônes PNG (192×192, 512×512 — la 512 sert aussi de version *maskable* et d’image de partage) |
