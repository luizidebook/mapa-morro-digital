/**
 * 1. displayRouteSummary - Exibe um resumo da rota no painel lateral.
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
