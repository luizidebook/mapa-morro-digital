/* hideRouteFooter
 * Esconde o rodapé do resumo da rota.
 * Elemento: id="route-footer"
 */
export function hideRouteFooter() {
  const footer = document.getElementById('route-footer');
  if (footer) {
    footer.style.display = 'none';
    footer.classList.add('hidden');
    console.log('Rodapé de resumo da rota escondido.');
  } else {
    console.warn("Elemento 'route-footer' não encontrado.");
  }
}

/**
 * hideInstructionBanner
 * Esconde o banner de instruções.
 * Elemento: id="instruction-banner"
 */
export function hideInstructionBanner() {
  const banner = document.getElementById('instruction-banner');
  if (banner) {
    banner.style.display = 'none';
    banner.classList.add('hidden');
    console.log('Banner de instruções escondido.');
  } else {
    console.warn("Elemento 'instruction-banner' não encontrado.");
  }
}
