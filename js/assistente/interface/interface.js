/**
 * Módulo de interface do assistente virtual
 * Responsável pelos elementos visuais e interação com o usuário
 */

// Importações necessárias
import { ensureCorrectPosition } from '../state/state.js';
import {
  showTypingIndicator,
  removeTypingIndicator,
} from '../dialog/message/message.js';

/**
 * Configura a interface do assistente
 */
export function setupAssistantUI() {
  console.log('Configurando interface do assistente...');

  // Verificar se o elemento já existe
  if (document.getElementById('digital-assistant')) {
    console.log('Interface do assistente já configurada');
    return true;
  }

  try {
    // Criar elementos HTML necessários
    const assistantContainer = document.createElement('div');
    assistantContainer.id = 'digital-assistant';
    assistantContainer.className = 'digital-assistant hidden';

    // Estrutura básica do assistente
    assistantContainer.innerHTML = `
      <div id="assistant-toggle" class="assistant-toggle">
        <span>?</span>
      </div>
      <div id="assistant-dialog" class="assistant-dialog hidden">
        <div id="assistant-header-container" class="assistant-header-container">
          <div class="assistant-header">
            <div class="assistant-title">Assistente Virtual</div>
            <button id="close-assistant-dialog" class="close-assistant-dialog">×</button>
          </div>
        </div>
        <div class="assistant-body">
          <div id="assistant-messages" class="assistant-messages"></div>
        </div>
        <div id="assistant-input-container" class="assistant-input-container">
          <textarea id="assistant-text-input" class="assistant-text-input" 
                   placeholder="Digite sua mensagem..." rows="1"></textarea>
          <button id="assistant-voice-input" class="assistant-voice-input">
            <i class="fa fa-microphone"></i>
          </button>
          <button id="assistant-send" class="assistant-send">
            <i class="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

    // Adicionar ao DOM
    document.body.appendChild(assistantContainer);

    // Tornar o assistente arrastável
    makeAssistantDraggable();

    console.log('Interface do assistente configurada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao configurar interface do assistente:', error);
    return false;
  }
}

/**
 * Torna o assistente arrastável pelo usuário
 */
export function makeAssistantDraggable() {
  const assistantToggle = document.getElementById('assistant-toggle');
  const assistantDialog = document.getElementById('assistant-dialog');

  if (!assistantToggle || !assistantDialog) return false;

  let isDragging = false;
  let offsetX, offsetY;

  assistantToggle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - assistantToggle.getBoundingClientRect().left;
    offsetY = e.clientY - assistantToggle.getBoundingClientRect().top;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    const assistantContainer = document.getElementById('digital-assistant');
    assistantContainer.style.position = 'fixed';
    assistantContainer.style.left = `${x}px`;
    assistantContainer.style.top = `${y}px`;
    assistantContainer.style.transform = 'none';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      ensureCorrectPosition(document.getElementById('digital-assistant'));
    }
  });

  return true;
}

/**
 * Mostra o assistente
 */
export function showAssistant() {
  const assistantContainer = document.getElementById('digital-assistant');
  const assistantDialog = document.getElementById('assistant-dialog');

  if (!assistantContainer || !assistantDialog) {
    console.error('Elementos do assistente não encontrados');
    return false;
  }

  assistantContainer.classList.remove('hidden');
  assistantDialog.classList.remove('hidden');

  return true;
}

/**
 * Esconde o assistente
 */
export function hideAssistant() {
  const assistantContainer = document.getElementById('digital-assistant');

  if (!assistantContainer) {
    console.error('Elemento digital-assistant não encontrado');
    return false;
  }

  assistantContainer.classList.add('hidden');

  return true;
}

/**
 * Mostra o assistente com animação
 */
export function showAssistantWithAnimation() {
  // Implementar animação de entrada
  const assistantContainer = document.getElementById('digital-assistant');

  if (!assistantContainer) {
    console.error('Elemento digital-assistant não encontrado');
    return showAssistant(); // Fallback para exibição regular
  }

  assistantContainer.classList.remove('hidden');
  assistantContainer.classList.add('animate__animated', 'animate__bounceIn');

  setTimeout(() => {
    showAssistant();
    assistantContainer.classList.remove(
      'animate__animated',
      'animate__bounceIn'
    );
  }, 1000);

  return true;
}

/**
 * Alterna a visibilidade do diálogo do assistente
 */
export function toggleAssistantDialog() {
  const assistantDialog = document.getElementById('assistant-dialog');

  if (!assistantDialog) {
    console.error('Elemento do diálogo não encontrado!');
    return;
  }

  // Se estiver oculto, mostrar
  if (assistantDialog.classList.contains('hidden')) {
    assistantDialog.classList.remove('hidden');

    // Se primeira vez mostrando diálogo e não mostrou saudação ainda
    if (!assistantStateManager.get('hasGreeted')) {
      const localEscolhido = escolherLocalAleatorio();
      showGreeting(localEscolhido);
      assistantStateManager.set('hasGreeted', true);
    }
  } else {
    // Se visível, ocultar (permite fechar ao clicar no botão novamente)
    assistantDialog.classList.add('hidden');
  }
}

/**
 * Esconde o diálogo do assistente
 */
function hideAssistantDialog() {
  const assistantDialog = document.getElementById('assistant-dialog');

  if (!assistantDialog) return;

  assistantDialog.classList.add('hidden');
}

/**
 * Mostra a saudação inicial do assistente
 * @param {Object} local - Local de onde o assistente "saiu"
 */
function showGreeting(local) {
  // Escolher um contexto aleatório
  const contextoIndex = Math.floor(Math.random() * local.contextos.length);
  const contexto = local.contextos[contextoIndex];

  // Construir mensagem
  let mensagemBase;
  if (assistantStateManager.get('firstTimeVisitor')) {
    mensagemBase = `Olá! Seja bem-vindo a Morro de São Paulo! ${contexto} Morro é um paraíso com muitas praias paradisíacas e atividades para fazer. É a sua primeira vez em Morro de São Paulo?`;
    assistantStateManager.set('awaitingFirstTimeResponse', true);
  } else {
    mensagemBase = `Olá novamente! ${contexto} Legal te ver de volta a Morro de São Paulo! Precisa de ajuda para encontrar alguma coisa?`;
  }

  // Mostrar mensagem com efeito de digitação
  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();
    addMessageToUI(mensagemBase, 'assistant');

    // Se for primeiro acesso, mostrar botões de escolha
    if (assistantStateManager.get('firstTimeVisitor')) {
      setTimeout(showFirstTimeOptions, 500);
    }
  }, 1500);
}

/**
 * Exibe indicador de digitação para simular o assistente escrevendo
 */
function showTypingIndicator() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer || assistantStateManager.get('isTyping')) return;

  assistantStateManager.set('isTyping', true);

  // Limpar container
  messagesContainer.innerHTML = '';

  // Criar indicador de digitação
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'assistant-message typing-indicator';
  typingIndicator.innerHTML = '<span>•</span><span>•</span><span>•</span>';

  messagesContainer.appendChild(typingIndicator);
}

/**
 * Remove o indicador de digitação
 */
function removeTypingIndicator() {
  assistantStateManager.set('isTyping', false);

  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const typingIndicator = messagesContainer.querySelector('.typing-indicator');
  if (typingIndicator) {
    messagesContainer.removeChild(typingIndicator);
  }
}
