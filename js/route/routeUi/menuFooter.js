// showMenuFooter.js
//  * @param {Object} userLocation - A localização atual do usuário.

/**
 * Exibe ou oculta os botões do rodapé com base nos IDs fornecidos.
 *
 * @param {Array<string>} buttonsToShow - IDs dos botões que devem ser exibidos.
 */
export function showMenuFooter(buttonsToShow = []) {
  console.log(
    '[showMenuFooter] Exibindo menu footer com botões:',
    buttonsToShow
  );

  const footer = document.getElementById('menu-footer');
  if (!footer) {
    console.error('[showMenuFooter] Elemento do rodapé não encontrado.');
    return;
  }

  footer.classList.remove('hidden');
  footer.style.display = 'block';

  const buttons = footer.querySelectorAll('.footer-btn');
  buttons.forEach((btn) => {
    if (buttonsToShow.includes(btn.id)) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  });

  console.log('[showMenuFooter] Menu footer atualizado.');
}
