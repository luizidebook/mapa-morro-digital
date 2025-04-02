// updateRouteFooter.js

import { getGeneralText } from '../core/varGlobals.js';
import { selectedLanguage } from '../core/varGlobals.js';
/**
 * 1. updateRouteFooter
 * Atualiza o rodapé da rota com informações de tempo estimado e distância.
 *
 * @param {Object} routeData - Dados da rota retornados pela API.
 * @param {string} [lang=selectedLanguage] - Código do idioma.
 */
export function updateRouteFooter(routeData, lang = selectedLanguage) {
  if (!routeData || !routeData.features || routeData.features.length === 0) {
    console.warn(
      '[updateRouteFooter] Dados de rota inválidos para atualização.'
    );
    return;
  }
  // Extrai o resumo da rota com duração e distância
  const summary = routeData.features[0].properties.summary;
  const etaMinutes = Math.round(summary.duration / 60);
  const distanceKm = (summary.distance / 1000).toFixed(2);

  // Atualiza os elementos do DOM com o tempo e distância
  const routeTimeElem = document.getElementById('route-time');
  const routeDistanceElem = document.getElementById('route-distance');
  if (routeTimeElem) {
    routeTimeElem.textContent = `${etaMinutes} ${getGeneralText('minutes', lang)}`;
  }
  if (routeDistanceElem) {
    routeDistanceElem.textContent = `${distanceKm} km`;
  }

  const footer = document.getElementById('route-footer');
  if (footer) {
    footer.classList.remove('hidden');
    footer.style.display = 'flex';
  }
  console.log(
    '[updateRouteFooter] Rodapé atualizado: Tempo =',
    etaMinutes,
    'min; Distância =',
    distanceKm,
    'km.'
  );
}
