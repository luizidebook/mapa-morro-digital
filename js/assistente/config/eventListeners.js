import {
  toggleAssistantDialog,
  hideAssistantDialog,
} from '../dialog/dialog.js';
import { sendMessage } from '../dialog/message/message.js'; // Adicionar esta importação crucial
import { handleVoiceInput } from '../voice/voice.js';
import { makeAssistantDraggable } from './config.js';

/**
 * Configura os event listeners do assistente
 */
export function setupEventListeners(config) {
  const {
    stateManager,
    interfaceManager,
    dialogManager,
    voiceManager,
    mapIntegration,
  } = config;

  // Listener para mudança de idioma
  window.addEventListener('languageChanged', (event) => {
    const newLanguage = event.detail.language;
    console.log(`Evento de mudança de idioma detectado: ${newLanguage}`);

    // Atualizar idioma no assistente
    stateManager.setLanguage(newLanguage);
    dialogManager.setLanguage(newLanguage);
    voiceManager.setLanguage(newLanguage);

    // Notificar o usuário
    interfaceManager.updateAssistantMessage(
      `Idioma alterado para ${getLanguageName(newLanguage)}`
    );
  });

  // Listener para eventos de navegação
  window.addEventListener('navigationStarted', () => {
    stateManager.updateMapState({ isNavigating: true });
    dialogManager.processSystemMessage('navigation_started');
  });

  window.addEventListener('navigationEnded', () => {
    stateManager.updateMapState({ isNavigating: false });
    dialogManager.processSystemMessage('navigation_ended');
  });

  // Listener para alertas de clima
  window.addEventListener('weatherAlert', (event) => {
    const condition = event.detail.condition;
    dialogManager.processSystemMessage('weather_alert', { condition });
  });

  // Listener para chegada ao destino
  window.addEventListener('destinationReached', (event) => {
    const location = event.detail.location;
    dialogManager.processSystemMessage('location_reached', { location });
  });

  // Listener para eventos do mapa
  window.addEventListener('mapClickedFeature', (event) => {
    const feature = event.detail.feature;
    stateManager.setActiveFeature(feature.type);

    // Proativamente oferecer informações
    if (stateManager.getCurrentState().userPreferences.proactiveMode) {
      dialogManager.processSystemMessage('feature_selected', { feature });
    }
  });

  // Listener para atualizações da localização do usuário
  window.addEventListener('userLocationUpdated', (event) => {
    const userLocation = event.detail.location;
    stateManager.updateMapState({ userLocation });

    // Se estiver em modo proativo, verificar lugares interessantes por perto
    if (stateManager.getCurrentState().userPreferences.proactiveMode) {
      checkNearbyInterestingPlaces(userLocation);
    }
  });

  // Delegação de ações do UI para o assistente
  document.querySelectorAll('.menu-btn[data-feature]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const feature = btn.getAttribute('data-feature');

      // Se o assistente estiver disponível, delegar a ação
      if (window.assistantApi) {
        window.assistantApi.handleFeatureSelection(feature);
        event.stopPropagation();
      } else {
        // Fallback para comportamento original
        handleFeatureSelection(feature);
      }
    });
  });

  /**
   * Verifica lugares interessantes próximos à localização do usuário
   */
  function checkNearbyInterestingPlaces(userLocation) {
    // Implementação simulada para exemplificar
    // Em um sistema real, faria uma consulta ao banco de dados ou API

    // Exemplo: após 20 segundos, simular detecção de um lugar próximo
    setTimeout(() => {
      if (Math.random() > 0.7) {
        // 30% de chance para não ser invasivo demais
        dialogManager.processSystemMessage('nearby_place', {
          placeName: 'Segunda Praia',
          distance: '150m',
        });
      }
    }, 20000);
  }

  /**
   * Retorna o nome do idioma com base no código
   */
  function getLanguageName(langCode) {
    const languages = {
      'pt-BR': 'Português',
      'en-US': 'English',
      'es-ES': 'Español',
      'fr-FR': 'Français',
      'de-DE': 'Deutsch',
    };

    return languages[langCode] || langCode;
  }

  console.log('Event listeners do assistente configurados');
}
