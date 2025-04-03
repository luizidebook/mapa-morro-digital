import { translatePageContent } from '../i18n/language.js';
import { map } from '../map/map.js';
import { showNotification } from '../ui/notifications.js';
import { getGeneralText } from '../i18n/language.js';

// Variáveis globais
export let selectedLanguage = 'pt'; // Alterado de const para let

/**
 * setLanguage - Define e salva o idioma selecionado
 * @param {string} lang - Código do idioma (pt, en, es, etc.)
 */
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

      // Mostrar elementos UI com um pequeno delay
      setTimeout(() => {
        // Mostrar o widget de tempo
        const weatherWidget = document.getElementById('weather-widget');
        if (weatherWidget) {
          weatherWidget.style.display = '';
          weatherWidget.classList.remove('hidden');
          console.log('Widget de tempo exibido');
        }

        // Mostrar o assistente usando a API global
        if (
          window.assistantApi &&
          typeof window.assistantApi.showAssistant === 'function'
        ) {
          window.assistantApi.showAssistant();
          console.log('Assistente virtual exibido via API');
        } else {
          // Fallback caso a API não esteja disponível
          const assistantContainer =
            document.getElementById('digital-assistant');
          if (assistantContainer) {
            assistantContainer.style.display = '';
            assistantContainer.classList.remove('hidden');

            // Mostrar dialog
            setTimeout(() => {
              const assistantDialog =
                document.getElementById('assistant-dialog');
              if (assistantDialog) {
                assistantDialog.classList.remove('hidden');
                // Tentar chamar a função de boas-vindas se existir
                if (typeof showWelcomeMessage === 'function') {
                  showWelcomeMessage();
                }
              }
            }, 1000);

            console.log('Container do assistente exibido (fallback)');
          }
        }
      }, 500);
    }

    // Atualizar idioma do assistente se estiver disponível
    if (window.assistantApi) {
      console.log('Atualizando idioma do assistente para:', lang);

      // Verificar se o assistente tem função para atualizar idioma
      if (typeof window.assistantApi.configure === 'function') {
        window.assistantApi.configure({ language: lang });
      }

      // Exibir assistente com a mensagem no novo idioma
      setTimeout(() => {
        console.log('Exibindo assistente após mudança de idioma');
        if (typeof window.assistantApi.showAssistant === 'function') {
          window.assistantApi.showAssistant();
        }
      }, 500);
    } else {
      console.warn(
        'Assistente não inicializado ainda, não foi possível atualizar o idioma'
      );
    }

    console.log(`Idioma definido para: ${lang}`);
    return true;
  } catch (error) {
    console.error(getGeneralText('routeError', selectedLanguage), error);
    showNotification(getGeneralText('routeError', selectedLanguage), 'error');
    return false;
  }
}

// Adicionar ao app.js ou expandir a função existente
function processMessage(message) {
  const lowerMessage = message.toLowerCase();

  // Expandir categorias de resposta

  // Categoria: Praias
  if (
    lowerMessage.includes('praia') ||
    lowerMessage.includes('praias') ||
    lowerMessage.includes('areia') ||
    lowerMessage.includes('mar')
  ) {
    return {
      text: 'Morro de São Paulo tem 5 praias numeradas. A Primeira Praia é próxima ao centro e tem agito, a Segunda é a mais animada com bares e restaurantes, a Terceira é tranquila e familiar, a Quarta é paradisíaca e a Quinta é mais deserta. Qual delas você gostaria de conhecer?',
      action: {
        type: 'show_poi_category',
        category: 'beaches',
      },
    };
  }

  // Categoria: Hospedagem
  else if (
    lowerMessage.includes('hotel') ||
    lowerMessage.includes('pousada') ||
    lowerMessage.includes('hospeda') ||
    lowerMessage.includes('ficar') ||
    lowerMessage.includes('dormir')
  ) {
    return {
      text: 'Existem ótimas opções de hospedagem em Morro de São Paulo! Você prefere ficar perto da agitação da Segunda Praia ou em locais mais tranquilos como a Terceira ou Quarta Praia?',
      action: {
        type: 'show_poi_category',
        category: 'inns',
      },
    };
  }

  // Categoria: Alimentação
  else if (
    lowerMessage.includes('comer') ||
    lowerMessage.includes('restaurante') ||
    lowerMessage.includes('comida') ||
    lowerMessage.includes('jantar') ||
    lowerMessage.includes('almoç')
  ) {
    return {
      text: 'Morro de São Paulo tem uma gastronomia incrível! Com frutos do mar frescos, comida baiana autêntica e opções internacionais. A Segunda Praia concentra vários restaurantes. Você prefere comida local ou algo específico?',
      action: {
        type: 'show_poi_category',
        category: 'restaurants',
      },
    };
  }

  // Categoria: Passeios
  else if (
    lowerMessage.includes('passeio') ||
    lowerMessage.includes('tour') ||
    lowerMessage.includes('visitar') ||
    lowerMessage.includes('conhecer')
  ) {
    return {
      text: 'Há várias opções de passeios! Os mais populares são o passeio de barco pelas ilhas, mergulho, visita à Gamboa e caminhada até o Farol. O que você prefere: aventura, natureza ou cultura?',
      action: {
        type: 'show_poi_category',
        category: 'tours',
      },
    };
  }

  // Categoria: Informações gerais
  else if (
    lowerMessage.includes('como chegar') ||
    lowerMessage.includes('transporte')
  ) {
    return {
      text: 'Para chegar a Morro de São Paulo, você pode pegar um catamarã ou lancha de Salvador (2h) ou de Valença (30min). Não há acesso por estrada diretamente até a vila, pois é uma ilha sem carros!',
    };
  }

  // Maré e clima
  else if (
    lowerMessage.includes('maré') ||
    lowerMessage.includes('clima') ||
    lowerMessage.includes('tempo') ||
    lowerMessage.includes('chuva')
  ) {
    // Aqui você poderia implementar uma API de clima/maré real em uma versão futura
    return {
      text: 'O clima em Morro de São Paulo é geralmente quente e ensolarado, com temperaturas entre 25°C e 30°C na maior parte do ano. A alta temporada vai de dezembro a março. Quer saber mais sobre a melhor época para visitar?',
    };
  }

  // Resposta default
  else {
    return {
      text: 'Estou aqui para ajudar você a descobrir o melhor de Morro de São Paulo! Posso sugerir praias, restaurantes, passeios ou hospedagens. O que você gostaria de saber?',
    };
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
