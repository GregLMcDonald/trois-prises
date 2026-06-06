/* Trois Prises — Service Worker
 * Versioning : à chaque déploiement, incrémente CACHE_VERSION.
 * L'événement `activate` supprime les anciens caches, donc l'app
 * récupère automatiquement les mises à jour. La page affiche une
 * invite « Mise à jour disponible » quand un nouveau SW est prêt.
 */
const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = 'trois-prises-' + CACHE_VERSION;

// Chemins relatifs pour fonctionner sous un sous-dossier GitHub Pages.
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => console.warn('Échec du pré-cache', err))
  );
  // Ne pas activer tout de suite : on attend la confirmation de l'utilisateur
  // (la page envoie SKIP_WAITING), sauf s'il n'y a pas encore de contrôleur.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k.startsWith('trois-prises-') && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Stratégie : « stale-while-revalidate » pour les requêtes GET de même origine.
// Réseau d'abord en repli, le cache assure le fonctionnement hors-ligne.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations : renvoyer index.html (app monopage) avec repli réseau.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
