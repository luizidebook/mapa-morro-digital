/**
 * Assistente Virtual - Ponto de entrada único
 * Este arquivo coordena a inicialização de todos os componentes do assistente
 */

import { initializeAssistantModel } from './model.js';
import { initializeAssistantView } from './view.js';
import { initializeAssistantController } from './controller.js';

/**
 * Inicializa o assistente virtual com todos os seus componentes
 * @param {Object} map - Instância do mapa Leaflet
 * @param {Object} options - Opções de configuração
 * @returns {Object} API pública do assistente
 */
export function initializeAssistant(map = null, options = {}) {
  console.log('🤖 Inicializando sistema integrado do assistente virtual...');

  try {
    // Verificar inicialização anterior para evitar duplicação
    if (window.assistantInitialized) {
      console.log(
        '⚠️ Assistente já inicializado, retornando instância existente.'
      );
      return window.assistantApi;
    }

    // Inicializar o modelo (gerenciamento de estado)
    const model = initializeAssistantModel(map, options);

    // Inicializar a visualização (interface do usuário)
    const view = initializeAssistantView(model);

    // Inicializar o controlador (lógica de processamento)
    const controller = initializeAssistantController(model, view);

    // Criar API pública
    const publicApi = createPublicApi(model, view, controller);

    // Armazenar referência global
    window.assistantApi = publicApi;
    window.assistantInitialized = true;

    console.log('✅ Sistema do assistente inicializado com sucesso!');
    return publicApi;
  } catch (error) {
    console.error('❌ Erro ao inicializar assistente:', error);

    // API de fallback para evitar erros cascata
    return {
      showAssistant: () => false,
      hideAssistant: () => false,
      sendMessage: () => false,
      isActive: () => false,
      getState: () => ({}),
      notifyOpened: () => false,
      startVoiceInput: () => false,
    };
  }
}

/**
 * Cria a API pública do assistente
 * @param {Object} model - Modelo do assistente
 * @param {Object} view - Visualização do assistente
 * @param {Object} controller - Controlador do assistente
 * @returns {Object} API pública
 */
function createPublicApi(model, view, controller) {
  return {
    /**
     * Mostra o assistente virtual
     */
    showAssistant: function () {
      return view.showAssistant();
    },

    /**
     * Oculta o assistente
     */
    hideAssistant: function () {
      return view.hideAssistant();
    },

    /**
     * Envia uma mensagem para o assistente
     * @param {string} message - Mensagem a ser enviada
     */
    sendMessage: function (message) {
      return controller.processUserMessage(message);
    },

    /**
     * Inicia reconhecimento de voz
     */
    startVoiceInput: function () {
      return controller.startVoiceRecognition();
    },

    /**
     * Notifica que o assistente foi aberto
     */
    notifyOpened: function () {
      controller.handleAssistantOpened();
      return true;
    },

    /**
     * Verifica se o assistente está ativo
     */
    isActive: function () {
      return model.getState().isActive;
    },

    /**
     * Retorna o estado atual do assistente
     */
    getState: function () {
      return model.getState();
    },

    /**
     * Configura o assistente com novas opções
     * @param {Object} newOptions - Novas opções
     */
    configure: function (newOptions) {
      return model.updateOptions(newOptions);
    },

    /**
     * Limpa o histórico de mensagens
     */
    clearHistory: function () {
      return model.clearMessageHistory();
    },
  };
}
