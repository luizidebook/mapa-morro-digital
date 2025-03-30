//  1. onDOMContentLoaded       - Executado quando o DOM carrega (busca parâmetros iniciais)*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    initializeMap();
    loadResources();
    showWelcomeMessage();
    setupEventListeners();
    autoAdjustTheme();
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
  }
});

// function registerServiceWorker() {
/*  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('Service Worker registrado com sucesso!'))
      .catch((error) =>
        console.error('Erro ao registrar o Service Worker:', error)
      );
  } else {
    console.warn('Service Workers não são suportados neste navegador.');
  }
}
 */
