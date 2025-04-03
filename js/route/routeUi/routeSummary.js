// routeSummary.js
//  * @param {Object} userLocation - A localização atual do usuário.
// * @returns {Promise<Object>} - Dados da rota criada (incluindo polyline).
import { getGeneralText } from '../../i18n/language.js';
import { showNotification } from '../../ui/notifications.js';
let currentRouteData = null;

//import { showNotification } from '../../ui/notifications.js';
// import { getGeneralText } from '../../i18n/language.js';
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

/**
 * 2. displayRouteSummary - Exibe um resumo da rota no painel lateral.
 */
export function displayRouteSummary(routeData, lang = selectedLanguage) {
  const summary = routeData.features[0].properties.summary;
  const etaMinutes = Math.round(summary.duration / 60);
  const distanceKm = (summary.distance / 1000).toFixed(2);

  const routeSummaryTitle = getGeneralText('route_summary_title', lang);
  const routeDistanceLabel = getGeneralText('route_distance', lang);
  const routeEtaLabel = getGeneralText('route_eta', lang);
  const minutesTxt = getGeneralText('minutes', lang);

  const summaryHTML = `
        <div class="route-summary">
          <h3>${routeSummaryTitle}</h3>
          <p id="route-distance">${routeDistanceLabel} <strong>${distanceKm} km</strong></p>
          <p id="route-eta">${routeEtaLabel} <strong>${etaMinutes} ${minutesTxt}</strong></p>
        </div>
      `;

  const summaryContainer = document.getElementById('route-summary');
  if (summaryContainer) {
    summaryContainer.innerHTML = summaryHTML;
    summaryContainer.classList.remove('hidden');
    summaryContainer.style.display = 'block';
    console.log('Resumo da rota exibido.');
  }
}
