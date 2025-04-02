// showRouteSummary.js
//  * @param {Object} userLocation - A localização atual do usuário.
// * @returns {Promise<Object>} - Dados da rota criada (incluindo polyline).

import { showNotification } from '../../ui/notifications.js';
import { currentRouteData } from '../../route/route.js';
import { displayRouteSummary } from '../../ui/routeSummary.js';
/**
 * 1. showRouteSummary
 * Exibe a pré-visualização da rota antes de iniciar a navegação. */
export function showRouteSummary() {
  if (!currentRouteData) {
    showNotification('Nenhuma rota disponível para pré-visualização.', 'error');
    return;
  }
  // Exibe o resumo
  displayRouteSummary(currentRouteData);
}
