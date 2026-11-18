const CACHE_NAME = 'bibliokids-v1';
const assets = [
  'index.html',
  'registro.html',
  'dashboard.html',
  'livros.html',
  'alunos.html',
  'emprestimos.html',
  'administradores.html',
  'alterar-senha.html',
  'css/style.css',
  'js/auth.js',
  'js/app.js',
  'manifest.json'
];

// Instalação do Service Worker e cache dos arquivos estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Intercepta as requisições para servir o cache offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});