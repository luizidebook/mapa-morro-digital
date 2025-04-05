/**
 * Sistema de Assistente Virtual para Morro de São Paulo Digital
 * @version 1.0.0
 */
// Importação das dependências
import { ConversationFlow } from './dialog/dialog.js';
import { setupEventListeners } from './config/eventListeners.js';
import { createAssistantAPI } from './state/state.js';
import {
  setConversationFlow,
  showWelcomeMessage,
} from './dialog/message/message.js';

/**
 * Ponto único de inicialização do assistente
 * Deve ser chamado apenas uma vez no carregamento da página
 * @param {Object} map - Instância do mapa Leaflet (opcional)
 * @param {boolean} showInitialMessage - Se deve mostrar mensagem inicial
 * @returns {Object} - API pública do assistente
 */
export function initializeAssistant(map = null, showInitialMessage = true) {
  console.log('Inicializando assistente virtual...');

  // Verificar inicialização anterior para evitar duplicação
  if (window.assistantInitialized) {
    console.log('Assistente já foi inicializado anteriormente, ignorando...');
    return window.assistantApi || createAssistantAPI();
  }

  // Configurar eventos
  setupEventListeners();

  // Criar API do assistente
  const api = createAssistantAPI();
  window.assistantApi = api;

  // Inicializar sistema de conversação
  const conversationFlowInstance = new ConversationFlow();
  window.conversationFlow = conversationFlowInstance;

  // Configurar instância no módulo de mensagens
  setConversationFlow(conversationFlowInstance);

  // Obter o idioma atual do usuário e configurar o assistente
  const userLanguage = localStorage.getItem('preferredLanguage') || 'pt';
  api.setLanguage(userLanguage);

  // Marcar como inicializado
  window.assistantInitialized = true;

  // Adicionar flag para controlar exibição da mensagem de boas-vindas
  window.welcomeMessageShown = false;

  console.log('Assistente inicializado com sucesso!');

  // NOVO: Exibir o assistente e mostrar mensagem de boas-vindas se solicitado
  if (showInitialMessage && !window.welcomeMessageShown) {
    // Verificar se o elemento do diálogo existe
    const assistantDialog = document.getElementById('assistant-dialog');

    if (!assistantDialog) {
      console.error(
        'Elemento do diálogo do assistente não encontrado! Verificando container...'
      );

      // Verificar se o container do assistente existe
      const assistantContainer = document.getElementById('digital-assistant');
      if (!assistantContainer) {
        console.error('Container do assistente não encontrado!');
        return api;
      }

      console.log(
        'Container do assistente encontrado, verificando visibilidade...'
      );

      // Garantir que o container esteja visível
      assistantContainer.style.display = '';
      assistantContainer.classList.remove('hidden');
    } else {
      // Mostrar interface do assistente
      console.log('Elemento do diálogo encontrado, exibindo...');
      assistantDialog.classList.remove('hidden');

      // Atualizar estado
      if (window.assistantStateManager) {
        window.assistantStateManager.set('isVisible', true);
        window.assistantStateManager.set('isActive', true);
      }

      // Exibir mensagem de boas-vindas com curto atraso para garantir que a UI esteja pronta
      setTimeout(() => {
        showWelcomeMessage();
        window.welcomeMessageShown = true; // Marcar que a mensagem foi mostrada
      }, 300);
    }
  }

  return api;
}
