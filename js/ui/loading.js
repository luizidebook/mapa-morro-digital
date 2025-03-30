/**
 * showRouteLoadingIndicator
 * Adiciona um indicador de carregamento antes da rota ser traçada
 */
export function showRouteLoadingIndicator(timeout = 15000) {
  const loader = document.getElementById('route-loader');
  if (!loader) {
    console.error('Elemento do loader não encontrado no DOM.');
    return;
  }

  loader.style.display = 'block';
  console.log('[showRouteLoadingIndicator] Indicador de carregamento ativado.');

  // Define um timeout para evitar carregamento infinito
  navigationState.loadingTimeout = setTimeout(() => {
    hideRouteLoadingIndicator();

    // Notifica o usuário do erro
    showNotification(
      getGeneralText('routeLoadTimeout', selectedLanguage) ||
        'Tempo esgotado para carregar a rota. Por favor, tente novamente.',
      'error'
    );

    console.error(
      '[showRouteLoadingIndicator] Timeout: Falha ao carregar rota.'
    );

    // Oferece ação ao usuário: tentar novamente
    displayRetryRouteLoadOption();
  }, 15000); // timeout após 15 segundos
}

/**
 * hideRouteLoadingIndicator
 * Remove o indicador de carregamento antes da rota ser traçada
 */
export function hideRouteLoadingIndicator() {
  // Cancela timeout se existir
  if (navigationState.loadingTimeout) {
    clearTimeout(navigationState.loadingTimeout);
    navigationState.loadingTimeout = null;
  }

  const loader = document.getElementById('route-loader');
  if (loader) loader.style.display = 'none';

  console.log('Indicador de carregamento desativado.');
}
