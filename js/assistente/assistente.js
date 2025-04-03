/**
 * Sistema de Assistente Virtual para Morro de São Paulo Digital
 * Arquivo: js/assistente/assistente.js
 */

import { showNotification } from '../ui/notifications.js';
import { selectedLanguage } from '../core/config.js';
import { getGeneralText } from '../i18n/language.js';

/**
 * Ponto único de inicialização do assistente
 * @param {Object} map - Instância do mapa Leaflet (opcional)
 * @param {Object} options - Opções de configuração
 * @returns {Object} - API pública do assistente
 */
export function initializeAssistant(map = null, options = {}) {
  console.log('Inicializando assistente virtual...');

  try {
    // Verificar inicialização anterior para evitar duplicação
    if (window.assistantInitialized) {
      console.log(
        'Assistente já foi inicializado anteriormente, usando instância existente'
      );
      return window.assistantApi;
    }

    // Configurar sistema de estado
    window.assistantState = {
      isActive: false,
      isSpeaking: false,
      isListening: false,
      context: {},
      history: [],
      lastInteractionTime: null,
      initialized: false,
      map: map,
      hasGreeted: false,
    };

    // Criar API do assistente
    const api = createAssistantAPI();
    window.assistantApi = api;

    // Marcar como inicializado
    window.assistantInitialized = true;

    return api;
  } catch (error) {
    console.error('Erro ao inicializar assistente:', error);
    showNotification('Erro ao inicializar assistente virtual', 'error');

    // Retornar uma API vazia para evitar erros
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
 * @returns {Object} API do assistente
 */
function createAssistantAPI() {
  return {
    /**
     * Mostra o assistente virtual
     */
    showAssistant: function () {
      return showAssistant();
    },

    /**
     * Oculta o assistente
     */
    hideAssistant: function () {
      try {
        const assistantContainer = document.getElementById('digital-assistant');

        if (assistantContainer) {
          assistantContainer.style.display = 'none';
          assistantContainer.classList.add('hidden');
        }

        window.assistantState.isActive = false;
        return true;
      } catch (error) {
        console.error('Erro ao ocultar assistente:', error);
        return false;
      }
    },

    /**
     * Envia uma mensagem para o assistente
     * @param {string} message - Mensagem a ser enviada
     */
    sendMessage: function (message) {
      console.log('Mensagem enviada para o assistente:', message);

      // Adicionar mensagem do usuário ao DOM
      const messagesContainer = document.getElementById('assistant-messages');
      if (messagesContainer && message) {
        // Criar elemento para mensagem do usuário
        const messageElement = document.createElement('div');
        messageElement.className = 'assistant-message user-message';
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);

        // Simular resposta do assistente
        setTimeout(() => {
          const responseElement = document.createElement('div');
          responseElement.className = 'assistant-message';
          responseElement.textContent =
            'Esta é uma resposta de exemplo. Em uma implementação real, o assistente processaria sua mensagem e forneceria informações relevantes.';
          messagesContainer.appendChild(responseElement);

          // Scroll para o final
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);

        // Scroll para o final
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      return true;
    },

    /**
     * Notifica que o assistente foi aberto
     */
    notifyOpened: function () {
      console.log('Assistente aberto pelo usuário');

      // Se não houver histórico, mostrar mensagem de boas-vindas
      const messagesContainer = document.getElementById('assistant-messages');
      if (messagesContainer && !messagesContainer.hasChildNodes()) {
        showWelcomeMessage();
      }

      return true;
    },

    /**
     * Inicia entrada de voz
     */
    startVoiceInput: function () {
      console.log('Reconhecimento de voz não implementado');
      return false;
    },

    /**
     * Verifica se o assistente está ativo
     */
    isActive: function () {
      return window.assistantState?.isActive || false;
    },

    /**
     * Retorna o estado atual do assistente
     */
    getState: function () {
      return { ...window.assistantState };
    },
  };
}

// Adicionar esta função antes da função createAssistantAPI()

/**
 * Mostra o assistente virtual
 * @returns {boolean} - Indica se a operação foi bem-sucedida
 */
function showAssistant() {
  try {
    const assistantContainer = document.getElementById('digital-assistant');

    if (assistantContainer) {
      assistantContainer.style.display = '';
      assistantContainer.classList.remove('hidden');

      // Mostrar apenas o botão do assistente inicialmente
      const assistantToggle = document.getElementById('assistant-toggle');
      if (assistantToggle) {
        assistantToggle.style.display = '';
      }

      // Mostrar dialog com a primeira mensagem se for a primeira vez
      if (!window.assistantState.hasGreeted) {
        setTimeout(() => {
          const assistantDialog = document.getElementById('assistant-dialog');
          if (assistantDialog) {
            assistantDialog.classList.remove('hidden');
            showWelcomeMessage();
            window.assistantState.hasGreeted = true;
          }
        }, 1000); // Delay para melhor experiência do usuário
      }

      window.assistantState.isActive = true;
      console.log('Assistente mostrado com sucesso');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao mostrar assistente:', error);
    return false;
  }
}

/**
 * Processa mensagem do usuário
 * @param {string} message - Mensagem enviada pelo usuário
 */
function processUserMessage(message) {
  // Simulação simples de processamento
  console.log('Processando mensagem do usuário:', message);

  // Resposta baseada em palavras-chave simples
  let response = '';
  const messageLower = message.toLowerCase();

  if (messageLower.includes('clima')) {
    response = 'O clima em Morro de São Paulo está ensolarado hoje!';
  } else if (messageLower.includes('praia')) {
    response = 'Recomendo visitar a Segunda Praia, muito bonita!';
  } else if (
    messageLower.includes('restaurante') ||
    messageLower.includes('comer')
  ) {
    response = 'Há vários bons restaurantes na Segunda Praia.';
  } else if (
    messageLower.includes('hotel') ||
    messageLower.includes('pousada') ||
    messageLower.includes('hospedagem')
  ) {
    response =
      'Existem várias pousadas na ilha, com preços variados. A maioria se concentra na Segunda e Terceira Praias.';
  } else if (
    messageLower.includes('transporte') ||
    messageLower.includes('como chegar')
  ) {
    response =
      'Para chegar a Morro de São Paulo, você pode pegar um catamarã de Salvador ou vir de carro até Valença e depois de barco.';
  } else if (
    messageLower.includes('mapa') ||
    messageLower.includes('localização')
  ) {
    response =
      'Você pode ver as principais localizações navegando pelo mapa. Clique no menu para filtrar pontos de interesse.';
  } else {
    response =
      'Posso ajudá-lo a encontrar informações sobre Morro de São Paulo. Pergunte sobre praias, restaurantes, hospedagem ou atrações.';
  }

  return response;
}

/**
 * Adiciona mensagem ao histórico de chat
 * @param {string} message - Conteúdo da mensagem
 * @param {string} sender - Remetente ('user' ou 'assistant')
 */
function addMessageToHistory(message, sender) {
  if (!window.assistantState.history) {
    window.assistantState.history = [];
  }

  window.assistantState.history.push({
    message,
    sender,
    timestamp: new Date().toISOString(),
  });

  // Limitar o histórico a 50 mensagens
  if (window.assistantState.history.length > 50) {
    window.assistantState.history.shift();
  }
}

/**
 * Adiciona mensagem ao DOM
 * @param {string} message - Conteúdo da mensagem
 * @param {string} sender - Remetente ('user' ou 'assistant')
 */
function addMessageToDOM(message, sender) {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) {
    console.warn('Container de mensagens não encontrado');
    return;
  }

  // Criar elemento de mensagem
  const messageElement = document.createElement('div');
  messageElement.className = `assistant-message ${sender}-message`;

  // Definir conteúdo
  messageElement.textContent = message;

  // Adicionar ao container
  messagesContainer.appendChild(messageElement);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Mostra indicador de digitação
 */
function showTypingIndicator() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Verificar se já existe um indicador
  let typingIndicator = document.querySelector('.typing-indicator');

  if (!typingIndicator) {
    // Criar indicador
    typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator assistant-message';

    // Adicionar pontos de animação
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      typingIndicator.appendChild(dot);
    }

    // Adicionar ao container
    messagesContainer.appendChild(typingIndicator);

    // Rolar para o final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

/**
 * Oculta indicador de digitação
 */
function hideTypingIndicator() {
  const typingIndicator = document.querySelector('.typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

/**
 * Mostra indicador de escuta
 */
function showListeningIndicator() {
  const inputContainer = document.querySelector('.assistant-input');
  if (!inputContainer) return;

  // Verificar se já existe um indicador
  let listeningIndicator = document.querySelector('.listening-indicator');

  if (!listeningIndicator) {
    // Criar indicador
    listeningIndicator = document.createElement('div');
    listeningIndicator.className = 'listening-indicator';
    listeningIndicator.textContent = '🎤 Escutando...';

    // Adicionar antes do campo de input
    inputContainer.prepend(listeningIndicator);
  }
}

/**
 * Oculta indicador de escuta
 */
function hideListeningIndicator() {
  const listeningIndicator = document.querySelector('.listening-indicator');
  if (listeningIndicator) {
    listeningIndicator.remove();
  }
}

/**
 * Exibe mensagem de boas-vindas do assistente
 */
function showWelcomeMessage() {
  const currentLanguage = window.selectedLanguage || 'pt';

  // Textos padrão caso getGeneralText não esteja disponível
  const defaultWelcome =
    currentLanguage === 'pt'
      ? 'Olá! Sou o assistente virtual do Morro de São Paulo Digital. Como posso ajudar?'
      : "Hello! I'm the Morro de São Paulo Digital virtual assistant. How can I help?";

  const defaultHelp =
    currentLanguage === 'pt'
      ? 'Você pode me perguntar sobre praias, restaurantes, hospedagem e atrações.'
      : 'You can ask me about beaches, restaurants, accommodation and attractions.';

  // Tentar obter mensagens traduzidas, com fallback para padrão
  let welcomeMessage;
  let helpMessage;

  try {
    // Se a função getGeneralText estiver disponível
    if (typeof getGeneralText === 'function') {
      welcomeMessage =
        getGeneralText('assistant_welcome', currentLanguage) || defaultWelcome;
      helpMessage =
        getGeneralText('assistant_help', currentLanguage) || defaultHelp;
    } else {
      welcomeMessage = defaultWelcome;
      helpMessage = defaultHelp;
    }
  } catch (error) {
    console.warn('Erro ao obter textos traduzidos:', error);
    welcomeMessage = defaultWelcome;
    helpMessage = defaultHelp;
  }

  // Adicionar mensagens ao DOM
  const messagesContainer = document.getElementById('assistant-messages');
  if (messagesContainer) {
    // Criar elemento para mensagem de boas-vindas
    const welcomeElement = document.createElement('div');
    welcomeElement.className = 'assistant-message';
    welcomeElement.textContent = welcomeMessage;
    messagesContainer.appendChild(welcomeElement);

    // Adicionar mensagem de ajuda após um pequeno delay
    setTimeout(() => {
      const helpElement = document.createElement('div');
      helpElement.className = 'assistant-message';
      helpElement.textContent = helpMessage;
      messagesContainer.appendChild(helpElement);
    }, 500);
  }
}
