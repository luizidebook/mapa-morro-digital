/**
 * Assistente Virtual - Camada de Visualização
 * Gerencia a renderização e interação com a interface do assistente
 */

import { showNotification } from '../ui/notifications.js';

/**
 * Inicializa a visualização do assistente
 * @param {Object} model - Modelo do assistente
 * @returns {Object} - API de visualização
 */
export function initializeAssistantView(model) {
  console.log('🎨 Inicializando visualização do assistente...');

  // Cache de elementos do DOM
  const domElements = {};

  /**
   * Obtém elemento do DOM (com cache)
   * @param {string} id - ID do elemento
   * @returns {HTMLElement} - Elemento do DOM
   */
  function getElement(id) {
    if (!domElements[id]) {
      domElements[id] = document.getElementById(id);
    }
    return domElements[id];
  }

  /**
   * Verifica se a estrutura necessária existe no DOM
   * @returns {boolean} - Indica se estrutura existe
   */
  function checkRequiredStructure() {
    const requiredIds = [
      'digital-assistant',
      'assistant-toggle',
      'assistant-dialog',
      'assistant-messages',
      'assistant-input-field',
      'assistant-send-btn',
    ];

    const missingElements = requiredIds.filter((id) => !getElement(id));

    if (missingElements.length > 0) {
      console.warn(
        '⚠️ Estrutura incompleta do assistente. Elementos faltando:',
        missingElements
      );
      return false;
    }

    return true;
  }

  /**
   * Mostra o assistente
   * @returns {boolean} - Indica se operação foi bem-sucedida
   */
  function showAssistant() {
    try {
      const container = getElement('digital-assistant');
      const toggle = getElement('assistant-toggle');

      if (!container) {
        console.warn('⚠️ Container do assistente não encontrado');
        return false;
      }

      // Mostrar container principal
      container.style.display = '';
      container.classList.remove('hidden');

      // Verificar se é primeira exibição
      const state = model.getState();
      if (!state.isVisible) {
        // Adicionar classe para animação de entrada
        container.classList.add('assistant-enter');

        // Remover classe após animação
        setTimeout(() => {
          container.classList.remove('assistant-enter');
        }, 800);

        // Atualizar estado
        model.updateState({ isVisible: true, isActive: true });
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao mostrar assistente:', error);
      return false;
    }
  }

  /**
   * Oculta o assistente
   * @returns {boolean} - Indica se operação foi bem-sucedida
   */
  function hideAssistant() {
    try {
      const container = getElement('digital-assistant');

      if (!container) return false;

      container.style.display = 'none';
      container.classList.add('hidden');

      // Atualizar estado
      model.updateState({ isActive: false });

      return true;
    } catch (error) {
      console.error('❌ Erro ao ocultar assistente:', error);
      return false;
    }
  }

  /**
   * Mostra o diálogo do assistente
   * @returns {boolean} - Indica se operação foi bem-sucedida
   */
  function showAssistantDialog() {
    try {
      const dialog = getElement('assistant-dialog');

      if (!dialog) return false;

      dialog.classList.remove('hidden');

      // Focar no campo de entrada
      const inputField = getElement('assistant-input-field');
      if (inputField) {
        setTimeout(() => inputField.focus(), 300);
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao mostrar diálogo do assistente:', error);
      return false;
    }
  }

  /**
   * Oculta o diálogo do assistente
   * @returns {boolean} - Indica se operação foi bem-sucedida
   */
  function hideAssistantDialog() {
    try {
      const dialog = getElement('assistant-dialog');

      if (!dialog) return false;

      dialog.classList.add('hidden');

      return true;
    } catch (error) {
      console.error('❌ Erro ao ocultar diálogo do assistente:', error);
      return false;
    }
  }

  /**
   * Adiciona uma mensagem ao DOM
   * @param {string} text - Texto da mensagem
   * @param {string} role - Papel (user/assistant)
   * @param {Object} options - Opções adicionais
   * @returns {HTMLElement} - Elemento criado
   */
  function addMessageToDOM(text, role, options = {}) {
    try {
      const messagesContainer = getElement('assistant-messages');

      if (!messagesContainer) {
        console.warn('⚠️ Container de mensagens não encontrado');
        return null;
      }

      // Criar elemento de mensagem
      const messageElement = document.createElement('div');
      messageElement.className = `assistant-message ${role}-message`;

      // Adicionar id para referência
      if (options.id) {
        messageElement.dataset.messageId = options.id;
      }

      // Adicionar conteúdo
      messageElement.textContent = text;

      // Se houver botões de ação
      if (options.actions && Array.isArray(options.actions)) {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'message-actions';

        options.actions.forEach((action) => {
          const button = document.createElement('button');
          button.className = 'action-button';
          button.textContent = action.text;
          button.onclick = action.handler;
          actionsContainer.appendChild(button);
        });

        messageElement.appendChild(actionsContainer);
      }

      // Adicionar ao container
      messagesContainer.appendChild(messageElement);

      // Rolar para o final
      scrollMessagesToBottom();

      return messageElement;
    } catch (error) {
      console.error('❌ Erro ao adicionar mensagem ao DOM:', error);
      return null;
    }
  }

  /**
   * Rola a área de mensagens para o final
   */
  function scrollMessagesToBottom() {
    const messagesContainer = getElement('assistant-messages');

    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * Mostra indicador de digitação
   * @returns {HTMLElement} - Elemento do indicador
   */
  function showTypingIndicator() {
    try {
      const messagesContainer = getElement('assistant-messages');

      if (!messagesContainer) return null;

      // Verificar se já existe
      let indicator = document.querySelector('.typing-indicator');

      if (!indicator) {
        // Criar indicador
        indicator = document.createElement('div');
        indicator.className = 'typing-indicator assistant-message';

        // Adicionar pontos de animação
        for (let i = 0; i < 3; i++) {
          const dot = document.createElement('span');
          indicator.appendChild(dot);
        }

        // Adicionar ao container
        messagesContainer.appendChild(indicator);

        // Rolar para o final
        scrollMessagesToBottom();

        // Atualizar estado
        model.updateState({ isTyping: true });
      }

      return indicator;
    } catch (error) {
      console.error('❌ Erro ao mostrar indicador de digitação:', error);
      return null;
    }
  }

  /**
   * Oculta indicador de digitação
   */
  function hideTypingIndicator() {
    try {
      const indicator = document.querySelector('.typing-indicator');

      if (indicator) {
        indicator.remove();
      }

      // Atualizar estado
      model.updateState({ isTyping: false });
    } catch (error) {
      console.error('❌ Erro ao ocultar indicador de digitação:', error);
    }
  }

  /**
   * Mostra indicador de escuta
   * @returns {HTMLElement} - Elemento do indicador
   */
  function showListeningIndicator() {
    try {
      const inputContainer = document.querySelector('.assistant-input');

      if (!inputContainer) return null;

      // Verificar se já existe
      let indicator = document.querySelector('.listening-indicator');

      if (!indicator) {
        // Criar indicador
        indicator = document.createElement('div');
        indicator.className = 'listening-indicator';
        indicator.textContent = '🎤 Escutando...';

        // Adicionar ao container
        inputContainer.prepend(indicator);

        // Atualizar estado
        model.updateState({ isListening: true });
      }

      return indicator;
    } catch (error) {
      console.error('❌ Erro ao mostrar indicador de escuta:', error);
      return null;
    }
  }

  /**
   * Oculta indicador de escuta
   */
  function hideListeningIndicator() {
    try {
      const indicator = document.querySelector('.listening-indicator');

      if (indicator) {
        indicator.remove();
      }

      // Atualizar estado
      model.updateState({ isListening: false });
    } catch (error) {
      console.error('❌ Erro ao ocultar indicador de escuta:', error);
    }
  }

  /**
   * Renderiza o histórico de mensagens
   */
  function renderMessageHistory() {
    try {
      const messagesContainer = getElement('assistant-messages');

      if (!messagesContainer) return false;

      // Limpar container
      messagesContainer.innerHTML = '';

      // Obter histórico
      const { history } = model.getState();

      // Renderizar cada mensagem
      history.forEach((message) => {
        addMessageToDOM(message.text, message.role, { id: message.id });
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao renderizar histórico de mensagens:', error);
      return false;
    }
  }

  /**
   * Configura os event listeners
   */
  function setupEventListeners(controller) {
    try {
      // Botão toggle
      const toggleButton = getElement('assistant-toggle');
      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          const dialog = getElement('assistant-dialog');

          if (dialog.classList.contains('hidden')) {
            showAssistantDialog();
            controller.handleAssistantOpened();
          } else {
            hideAssistantDialog();
          }
        });
      }

      // Botão fechar
      const closeButton = getElement('close-assistant-dialog');
      if (closeButton) {
        closeButton.addEventListener('click', hideAssistantDialog);
      }

      // Botão enviar
      const sendButton = getElement('assistant-send-btn');
      const inputField = getElement('assistant-input-field');

      if (sendButton && inputField) {
        // Função de envio
        const sendMessage = () => {
          const message = inputField.value.trim();

          if (message) {
            controller.processUserMessage(message);
            inputField.value = '';
          }
        };

        // Botão enviar
        sendButton.addEventListener('click', sendMessage);

        // Tecla Enter
        inputField.addEventListener('keypress', (event) => {
          if (event.key === 'Enter') {
            sendMessage();
          }
        });
      }

      // Botão voz
      const voiceButton = getElement('assistant-voice-btn');
      if (voiceButton) {
        voiceButton.addEventListener('click', () => {
          controller.startVoiceRecognition();
        });
      }

      console.log('✅ Event listeners do assistente configurados');
      return true;
    } catch (error) {
      console.error(
        '❌ Erro ao configurar event listeners do assistente:',
        error
      );
      return false;
    }
  }

  // Verificar estrutura HTML necessária
  const structureExists = checkRequiredStructure();

  if (!structureExists) {
    showNotification(
      'Estrutura HTML incompleta para o assistente. Verifique o console.',
      'warning'
    );
  }

  // Retornar API de visualização
  return {
    showAssistant,
    hideAssistant,
    showAssistantDialog,
    hideAssistantDialog,
    addMessageToDOM,
    showTypingIndicator,
    hideTypingIndicator,
    showListeningIndicator,
    hideListeningIndicator,
    renderMessageHistory,
    setupEventListeners,
    structureExists,
  };
}
