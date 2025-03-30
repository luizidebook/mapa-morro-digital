import { hideAllControlButtons } from './buttons.js'; // Verifique o local correto
import { closeAssistantModal } from './modals.js'; // Certifique-se de que está exportado corretamente

// Função: Oculta todos os botões de controle
export function hideAllControlButtons() {
  const buttons = document.querySelectorAll('.control-btn');
  buttons.forEach((button) => {
    button.style.display = 'none';
  });
  console.log('Todos os botões de controle foram ocultados.');
}

/**
 * 1. showControlButtonsTouristSpots - Exibe controles específicos para pontos turísticos.
 */
export function showControlButtonsTouristSpots() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para pontos turísticos exibidos.');
}

/**
 * 2. showControlButtonsTour - Exibe controles específicos para tours.
 */
export function showControlButtonsTour() {
  hideAllControlButtons();
  closeAssistantModal();
  const tourBtn = document.getElementById('tour-btn');
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (tourBtn) tourBtn.style.display = 'flex';
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para tours exibidos.');
}

/**
 * 3. showControlButtonsBeaches - Exibe controles específicos para praias.
 */
export function showControlButtonsBeaches() {
  hideAllControlButtons();
  closeAssistantModal();
  const reserveChairsBtn = document.getElementById('reserve-chairs-btn');
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (reserveChairsBtn) reserveChairsBtn.style.display = 'none';
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para praias exibidos.');
}

/**
 * 4. showControlButtonsNightlife - Exibe controles específicos para vida noturna.
 */
export function showControlButtonsNightlife() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  const buyTicketBtn = document.getElementById('buy-ticket-btn');
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  if (buyTicketBtn) buyTicketBtn.style.display = 'flex';
  console.log('Controles para vida noturna exibidos.');
}

/**
 * 5. showControlButtonsRestaurants - Exibe controles específicos para restaurantes.
 */
export function showControlButtonsRestaurants() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  const reserveRestaurantsBtn = document.getElementById(
    'reserve-restaurants-btn'
  );
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  if (reserveRestaurantsBtn) reserveRestaurantsBtn.style.display = 'flex';
  console.log('Controles para restaurantes exibidos.');
}

/**
 * 6. showControlButtonsShops - Exibe controles específicos para lojas.
 */
export function showControlButtonsShops() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const speakAttendentBtn = document.getElementById('speak-attendent-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (speakAttendentBtn) speakAttendentBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para lojas exibidos.');
}

/**
 * 7. showControlButtonsEmergencies - Exibe controles específicos para emergências.
 */
export function showControlButtonsEmergencies() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const callBtn = document.getElementById('call-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (callBtn) callBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para emergências exibidos.');
}

/**
 * 8. showControlButtonsTips - Exibe controles específicos para dicas.
 */
export function showControlButtonsTips() {
  hideAllControlButtons();
  closeAssistantModal();
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'none';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para dicas exibidos.');
}

/**
 * 9. showControlButtonsInns - Exibe controles específicos para pousadas.
 */
export function showControlButtonsInns() {
  hideAllControlButtons();
  closeAssistantModal();
  const reserveInnsBtn = document.getElementById('reserve-inns-btn');
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (reserveInnsBtn) reserveInnsBtn.style.display = 'none';
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para pousadas exibidos.');
}

/**
 * 10. showControlButtonsEducation - Exibe controles específicos para ensino.
 */
export function showControlButtonsEducation() {
  hideAllControlButtons();
  closeAssistantModal();
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para pousadas exibidos.');
}

/**
 * 11. showMenuButtons - Exibe os botões do menu lateral.
 */
export function showMenuButtons() {
  const menuButtons = document.querySelectorAll('.menu-btn');
  menuButtons.forEach((btn) => btn.classList.remove('hidden'));
  const menuToggle = document.getElementById('menu-btn');
  if (menuToggle) menuToggle.classList.remove('hidden');
  const floatingMenu = document.getElementById('floating-menu');
  if (floatingMenu) floatingMenu.classList.remove('hidden');
  console.log('showMenuButtons: Botões do menu exibidos.');
}

/**
 * 12. showButtons - Exibe um grupo de botões com base em seus IDs.
 */
export function showButtons(buttonIds) {
  const allButtons = document.querySelectorAll('.control-buttons button');
  allButtons.forEach((button) => (button.style.display = 'none'));

  buttonIds.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.style.display = 'inline-block';
    }
  });
}

/**
 * openDestinationWebsite
 *    Abre a URL de um destino em nova aba.
 */
export function openDestinationWebsite(url) {
  window.open(url, '_blank');
}
