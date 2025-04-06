// Criar módulo interface.js para gerenciar a interface do assistente

export function createAssistantInterface(config) {
  const { onUserInput, onToggleVoice, onClose, onOpen, initialState } = config;
  let isVisible = initialState === 'visible';
  let isListening = false;

  // Container principal do assistente
  let assistantContainer = null;
  let assistantIcon = null;
  let assistantPanel = null;
  let messagesList = null;
  let inputField = null;

  // Inicializar a interface do assistente
  function initInterface() {
    // Verificar se já existe um container
    const existingContainer = document.getElementById('digital-assistant');
    if (existingContainer) {
      assistantContainer = existingContainer;
    } else {
      // Criar container principal
      assistantContainer = document.createElement('div');
      assistantContainer.id = 'digital-assistant';
      assistantContainer.className = 'assistant-container';

      // Estrutura HTML básica
      assistantContainer.innerHTML = `
        <div id="assistant-toggle" class="assistant-icon" aria-label="Assistente Virtual">
          <i class="fas fa-robot"></i>
        </div>
        <div id="assistant-dialog" class="assistant-panel">
          <div class="assistant-header">
            <h3 id="assistant-title">Assistente Morro Digital</h3>
            <div class="assistant-controls">
              <button id="assistant-minimize-btn" class="assistant-btn" aria-label="Minimizar">
                <i class="fas fa-minus"></i>
              </button>
              <button id="close-assistant-dialog" class="assistant-btn" aria-label="Fechar">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div id="assistant-messages" class="assistant-messages">
            <ul class="messages-list"></ul>
          </div>
          <div class="assistant-input">
            <input id="assistant-input-field" type="text" placeholder="Pergunte algo sobre Morro de São Paulo..." />
            <button id="assistant-send-btn" class="assistant-btn send-btn" aria-label="Enviar">
              <i class="fas fa-paper-plane"></i>
            </button>
            <button id="assistant-voice-btn" class="assistant-btn voice-btn" aria-label="Entrada de voz">
              <i class="fas fa-microphone"></i>
            </button>
          </div>
          <div class="assistant-suggestions">
            <button class="suggestion-btn">Praias próximas</button>
            <button class="suggestion-btn">Onde comer?</button>
            <button class="suggestion-btn">Passeios recomendados</button>
          </div>
        </div>
      `;

      // Adicionar ao DOM
      document.body.appendChild(assistantContainer);
    }

    // Capturar referências dos elementos
    assistantIcon = assistantContainer.querySelector('#assistant-toggle');
    assistantPanel = assistantContainer.querySelector('#assistant-dialog');
    messagesList = assistantContainer.querySelector('.messages-list');
    inputField = assistantContainer.querySelector('#assistant-input-field');

    // Configurar eventos da interface
    setupEvents();

    // Configurar visibilidade inicial
    if (isVisible) {
      assistantPanel.classList.remove('hidden');
    } else {
      assistantPanel.classList.add('hidden');
    }

    // Adicionar classe para suporte mobile
    assistantContainer.classList.add('mobile-friendly');

    console.log('Assistente: Interface inicializada');
  }

  // Configurar eventos da interface
  function setupEvents() {
    // Botão de toggle/ícone do assistente
    assistantIcon.addEventListener('click', () => {
      toggleAssistant();
    });

    // Botão de fechar
    const closeBtn = assistantContainer.querySelector(
      '#close-assistant-dialog'
    );
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        hideAssistant();
      });
    }

    // Botão de minimizar
    const minimizeBtn = assistantContainer.querySelector(
      '#assistant-minimize-btn'
    );
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        hideAssistant();
      });
    }

    // Campo de input e botão de envio
    const sendBtn = assistantContainer.querySelector('#assistant-send-btn');
    if (sendBtn && inputField) {
      // Envio por clique no botão
      sendBtn.addEventListener('click', () => {
        const text = inputField.value.trim();
        if (text) {
          addMessage(text, 'user');
          onUserInput(text, 'text');
          inputField.value = '';
        }
      });

      // Envio por Enter
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const text = inputField.value.trim();
          if (text) {
            addMessage(text, 'user');
            onUserInput(text, 'text');
            inputField.value = '';
          }
        }
      });
    }

    // Botão de voz
    const voiceBtn = assistantContainer.querySelector('#assistant-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        const newState = onToggleVoice();
        setListening(newState);
      });
    }

    // Botões de sugestão
    const suggestionBtns =
      assistantContainer.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.trim();
        addMessage(text, 'user');
        onUserInput(text, 'suggestion');
      });
    });
  }

  // Adicionar mensagem à lista
  function addMessage(text, sender) {
    // Buscar a lista de mensagens mais robusta
    const messagesList =
      document.querySelector('.messages-list') ||
      document.querySelector('#assistant-messages ul') ||
      document.querySelector('#assistant-messages');

    if (!messagesList) {
      console.error('Assistente: Lista de mensagens não encontrada');

      // Criar o elemento se não existir
      const assistantMessages =
        document.querySelector('#assistant-messages') ||
        document.querySelector('.assistant-messages');

      if (assistantMessages) {
        // Tentar criar a lista se o container existir
        const newList = document.createElement('ul');
        newList.className = 'messages-list';
        assistantMessages.appendChild(newList);

        // Usar a nova lista
        addMessage(text, sender);
        return;
      }

      console.error(
        'Assistente: Container de mensagens não encontrado, impossível mostrar mensagem'
      );
      return;
    }

    // Resto do código permanece igual
    const messageItem = document.createElement('li');
    messageItem.className = `message ${sender}-message`;

    const avatar =
      sender === 'user'
        ? '<div class="avatar user-avatar"><i class="fas fa-user"></i></div>'
        : '<div class="avatar assistant-avatar"><i class="fas fa-robot"></i></div>';

    messageItem.innerHTML = `
      ${avatar}
      <div class="message-bubble">
        <div class="message-text">${text}</div>
        <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `;

    messagesList.appendChild(messageItem);
    messagesList.scrollTop = messagesList.scrollHeight;
  }

  // Mostrar assistente
  function showAssistant() {
    // Implementação que não chama o assistente de volta
    _showAssistant();
  }

  // Método interno que realiza as operações DOM
  function _showAssistant() {
    // Buscar todos os seletores possíveis para maior robustez
    const containers = document.querySelectorAll(
      '.digital-assistant, #digital-assistant'
    );
    const dialogs = document.querySelectorAll(
      '.assistant-dialog, #assistant-dialog, .assistant-panel, #assistant-panel'
    );

    containers.forEach((container) => container.classList.remove('hidden'));
    dialogs.forEach((dialog) => dialog.classList.remove('hidden'));

    isVisible = true;
  }

  // Ocultar assistente
  function hideAssistant() {
    if (!assistantPanel) return;

    assistantPanel.classList.add('hidden');
    assistantContainer.classList.remove('active');
    isVisible = false;

    // Disparar evento
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  // Alternar visibilidade
  function toggleAssistant() {
    if (isVisible) {
      hideAssistant();
    } else {
      showAssistant();
    }
  }

  // Atualizar sugestões
  function updateSuggestions(suggestions) {
    const suggestionsContainer = assistantContainer.querySelector(
      '.assistant-suggestions'
    );
    if (!suggestionsContainer) return;

    // Limpar sugestões atuais
    suggestionsContainer.innerHTML = '';

    // Adicionar novas sugestões
    suggestions.forEach((suggestion) => {
      const button = document.createElement('button');
      button.className = 'suggestion-btn';
      button.textContent = suggestion;
      button.addEventListener('click', () => {
        addMessage(suggestion, 'user');
        onUserInput(suggestion, 'suggestion');
      });

      suggestionsContainer.appendChild(button);
    });
  }

  // Definir estado de escuta
  function setListening(listening) {
    isListening = listening;

    const voiceBtn = assistantContainer.querySelector('#assistant-voice-btn i');
    if (voiceBtn) {
      if (listening) {
        voiceBtn.className = 'fas fa-microphone-alt';
        voiceBtn.parentElement.classList.add('listening');
      } else {
        voiceBtn.className = 'fas fa-microphone';
        voiceBtn.parentElement.classList.remove('listening');
      }
    }
  }

  // Exibir notificação
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `assistant-notification ${type}`;
    notification.textContent = message;

    assistantContainer.appendChild(notification);

    // Remover após 5 segundos
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        assistantContainer.removeChild(notification);
      }, 500);
    }, 5000);
  }

  // Inicializar a interface
  initInterface();

  // Retornar API pública
  return {
    addMessage,
    showAssistant,
    hideAssistant,
    toggleAssistant,
    updateSuggestions,
    setListening,
    showNotification,
    _showAssistant, // Expor método interno para uso pelo assistente.js
  };
}
