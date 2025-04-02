import { translatePageContent } from '../i18n/language.js';
import { map } from '../main.js';
import { showNotification } from '../ui/notifications.js';
import { startTutorial, showTutorialStep } from '../tutorial/tutorial.js';
import { getGeneralText } from '../i18n/language.js';

// No arquivo varGlobals.js
export let selectedLanguage = 'pt'; // Altere de const para let

/* setLanguage - Define e salva o idioma selecionado */
export function setLanguage(lang) {
  try {
    const availableLanguages = ['pt', 'en', 'es', 'he'];
    const defaultLanguage = 'pt';

    if (!availableLanguages.includes(lang)) {
      console.warn(
        `${getGeneralText('languageChanged', defaultLanguage)} => ${defaultLanguage}`
      );
      lang = defaultLanguage;
    }

    localStorage.setItem('preferredLanguage', lang);
    selectedLanguage = lang;

    // Traduz tudo
    translatePageContent(lang);

    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal) {
      welcomeModal.style.display = 'none';
    }

    console.log(`Idioma definido para: ${lang}`);
    // opcionalmente iniciar tutorial
    showTutorialStep('start-tutorial');
  } catch (error) {
    console.error(getGeneralText('routeError', selectedLanguage), error);
    showNotification(getGeneralText('routeError', selectedLanguage), 'error');
  }
}

/**
 * Ajusta automaticamente o tema com base na hora do dia.
 * Se a hora atual estiver entre 18h e 6h, ativa o tema escuro.
 */
export function autoAdjustTheme() {
  const hour = new Date().getHours();
  const body = document.body;
  if (hour >= 18 || hour < 6) {
    // Ativa tema escuro
    if (!body.classList.contains('dark-theme')) {
      body.classList.add('dark-theme');
      showNotification('Tema escuro ativado automaticamente.', 'info');
    }
  } else {
    // Ativa tema claro
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      showNotification('Tema claro ativado automaticamente.', 'info');
    }
  }
}

/**
 * Restaura a visualização original do mapa.
 */
export function resetMapView() {
  const defaultView = {
    lat: -13.4125,
    lon: -38.9131,
    zoom: 13,
  };

  if (map) {
    map.setView([defaultView.lat, defaultView.lon], defaultView.zoom);
    console.log('Visualização do mapa restaurada para o estado inicial.');
  }
}

/**
 * 6. restoreState - Restaura estado completo do sistema (geral).
 */
export function restoreState(state) {
  if (!state) {
    console.log('Nenhum estado para restaurar.');
    return;
  }

  console.log('Restaurando estado:', state);

  // Restaura o destino selecionado
  if (state.selectedDestination) {
    selectedDestination = state.selectedDestination;
    adjustMapWithLocation();
  }

  // Restaura as instruções da rota
  if (state.instructions) {
    displayStepByStepInstructions(state.instructions, 0);
  }

  // Restaura a localização do usuário
  if (state.userPosition) {
    updateUserPositionOnMap(state.userPosition);
  }

  document
    .getElementById('continue-navigation-btn')
    .addEventListener('click', () => {
      navigator.serviceWorker.controller.postMessage({ action: 'getState' });
      document.getElementById('recovery-modal').classList.add('hidden');
    });

  document
    .getElementById('start-new-navigation-btn')
    .addEventListener('click', () => {
      clearNavigationState();
      document.getElementById('recovery-modal').classList.add('hidden');
    });
}
