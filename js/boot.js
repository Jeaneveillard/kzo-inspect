/** Détection file:// et erreurs de chargement des modules */
(function bootCheck() {
  const filePanel = document.getElementById('boot-file-warning');
  const errorPanel = document.getElementById('boot-error');
  const loading = document.getElementById('boot-loading');

  function showLoadError(msg) {
    if (errorPanel) {
      errorPanel.hidden = false;
      const pre = errorPanel.querySelector('.boot-error__detail');
      if (pre && msg) pre.textContent = msg;
    }
    if (loading) loading.hidden = true;
  }

  // Le blocage file:// a été retiré pour permettre l'exécution en local
  // if (location.protocol === 'file:') { ... }

  window.addEventListener('error', (e) => {
    if (e.message) showLoadError(e.message);
  });

  window.addEventListener('unhandledrejection', (e) => {
    const msg = e.reason?.message || String(e.reason || '');
    if (msg) showLoadError(msg);
  });

  window.__kzoInspectReady = () => {
    if (loading) loading.hidden = true;
    if (filePanel) filePanel.hidden = true;
    if (errorPanel) {
      errorPanel.hidden = true;
      const pre = errorPanel.querySelector('.boot-error__detail');
      if (pre) pre.textContent = '';
    }
  };

  setTimeout(() => {
    if (window.__kzoInspectBooted) return;
    const main = document.getElementById('main-content');
    const hasApp =
      main &&
      (main.querySelector('.hero, .page-header, .empty-state, .inspect-header, #form-profile') ||
        main.textContent.trim().length > 80);
    if (!hasApp) {
      showLoadError(
        'L\'application n\'a pas démarré. Essayez d\'abord Ctrl+F5 (ou Cmd+Shift+R sur Mac) pour vider le cache. Si le problème persiste, fermez l\'onglet, relancez « Lancer KZO Inspect.bat » (ou .command), puis rouvrez http://127.0.0.1:8775.',
      );
    }
  }, 8000);
})();
