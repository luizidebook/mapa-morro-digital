// showMenuFooter.js
//  * @param {Object} userLocation - A localização atual do usuário.

/**
 * Exibe ou oculta os botões do rodapé com base nos IDs fornecidos.
 *
 * @param {Array<string>} buttonsToShow - IDs dos botões que devem ser exibidos.
 */
export function showMenuFooter(buttonsToShow = []) {
  // Seleciona todos os botões do rodapé
  const allButtons = document.querySelectorAll('#menu-footer .footer-btn');

  // Oculta todos os botões inicialmente
  allButtons.forEach((button) => {
    button.classList.add('hidden');
  });

  // Exibe apenas os botões especificados
  buttonsToShow.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.remove('hidden');
    }
  });

  // Exibe o rodapé se pelo menos um botão estiver visível
  const menuFooter = document.getElementById('menu-footer');
  if (buttonsToShow.length > 0) {
    menuFooter.classList.remove('hidden');
  } else {
    menuFooter.classList.add('hidden');
  }
}
