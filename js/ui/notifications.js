// Importações necessárias
import { getGeneralText } from '../i18n/language.js';
import { navigationState, selectedLanguage } from '../core/varGlobals.js';

// Função: Exibe uma notificação para o usuário
export function showNotification(message, type = 'info', duration = 3000) {
  const notificationContainer = document.getElementById(
    'notification-container'
  );
  if (!notificationContainer) {
    console.error(
      'Contêiner de notificações (#notification-container) não encontrado.'
    );
    return;
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  notificationContainer.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, duration);
}

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
