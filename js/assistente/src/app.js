/**
 * Sistema de Assistente Digital para Mapa Morro Digital
 * Este arquivo serve como ponto de entrada para o sistema de assistente.
 */

import {
  moveAssistant,
  moveAssistantToMapPoint,
  resetAssistantPosition,
  bounceAssistant,
} from './assistant-movement.js';

// Estado do assistente
const assistantState = {
  active: false,
  listening: false,
  currentContext: 'general',
  lastPoint: null,
  currentLocation: null,
};

// Referência ao mapa
let mapInstance = null;

/**
 * Inicializa o assistente virtual com a nova disposição
 * @param {Object} map - Instância do mapa Leaflet (opcional)
 */
export function initializeAssistant(map = null) {
  console.log('Assistente virtual inicializado');

  // Armazena a referência do mapa se fornecida
  if (map) {
    mapInstance = map;
  }

  // Configura handlers de interação
  setupEventListeners();

  // Garantir que o botão esteja na posição correta (inferior centralizado)
  positionAssistantElements();

  // Esconder o diálogo e o input inicialmente
  const assistantDialog = document.getElementById('assistant-dialog');
  const inputContainer = document.getElementById('assistant-input-container');

  if (assistantDialog) {
    assistantDialog.classList.add('hidden');
  }

  if (inputContainer) {
    inputContainer.classList.add('hidden');
  }

  // Exporta funções para uso global
  window.assistantApi = {
    sendMessage,
    startVoiceInput,
    setContext,
    showAtPoint: showAssistantAtPoint,
  };

  return {
    sendMessage,
    startVoiceInput,
    setContext,
    showAtPoint: showAssistantAtPoint,
  };
}

/**
 * Configura os ouvintes de eventos para o assistente
 */
function setupEventListeners() {
  const sendButton = document.getElementById('assistant-send');
  const textInput = document.getElementById('assistant-text-input');
  const assistantToggle = document.getElementById('assistant-toggle');
  const closeDialogBtn = document.getElementById('close-assistant-dialog');

  if (sendButton && textInput) {
    sendButton.addEventListener('click', () => {
      const message = textInput.value.trim();
      if (message) {
        sendMessage(message);
        textInput.value = '';
      }
    });

    textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const message = textInput.value.trim();
        if (message) {
          sendMessage(message);
          textInput.value = '';
        }
      }
    });
  }

  // Toggle para mostrar/esconder o diálogo e o input
  if (assistantToggle) {
    assistantToggle.addEventListener('click', () => {
      const assistantDialog = document.getElementById('assistant-dialog');
      const inputContainer = document.getElementById(
        'assistant-input-container'
      );

      if (assistantDialog) {
        // Toggle da visibilidade do diálogo
        if (assistantDialog.classList.contains('hidden')) {
          assistantDialog.classList.remove('hidden');
          if (inputContainer) inputContainer.classList.remove('hidden');
        } else {
          assistantDialog.classList.add('hidden');
          if (inputContainer) inputContainer.classList.add('hidden');
        }
      }
    });
  }

  // Botão para fechar diálogo
  if (closeDialogBtn) {
    closeDialogBtn.addEventListener('click', () => {
      const assistantDialog = document.getElementById('assistant-dialog');
      const inputContainer = document.getElementById(
        'assistant-input-container'
      );

      if (assistantDialog) {
        assistantDialog.classList.add('hidden');
      }

      if (inputContainer) {
        inputContainer.classList.add('hidden');
      }
    });
  }
}

/**
 * Faz um elemento arrastável
 * @param {HTMLElement} element - O elemento a ser feito arrastável
 */
function makeDraggable(element) {
  let isDragging = false;
  let offsetX, offsetY, initialX, initialY;

  // Botão do assistente como alça para arrastar
  const handle = document.getElementById('assistant-toggle');
  if (!handle) return;

  handle.addEventListener('mousedown', dragStart);
  handle.addEventListener('touchstart', dragStart, { passive: false });

  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('touchend', dragEnd);

  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });

  function dragStart(e) {
    e.preventDefault();
    if (e.type === 'touchstart') {
      initialX = e.touches[0].clientX;
      initialY = e.touches[0].clientY;
    } else {
      initialX = e.clientX;
      initialY = e.clientY;
    }

    const rect = element.getBoundingClientRect();
    offsetX = initialX - rect.left;
    offsetY = initialY - rect.top;

    isDragging = true;
    element.classList.add('movable');
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();

    let currentX, currentY;
    if (e.type === 'touchmove') {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    // Calcular nova posição
    const newLeft = currentX - offsetX;
    const newTop = currentY - offsetY;

    // Limitar às bordas da janela
    const maxLeft = window.innerWidth - element.offsetWidth;
    const maxTop = window.innerHeight - element.offsetHeight;

    const boundedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const boundedTop = Math.max(0, Math.min(newTop, maxTop));

    // Aplicar nova posição
    element.style.left = `${boundedLeft}px`;
    element.style.bottom = `${window.innerHeight - boundedTop - element.offsetHeight}px`;
    element.style.position = 'fixed';
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;

    // Remover classe de movimento após uma pequena pausa
    setTimeout(() => {
      element.classList.remove('movable');
    }, 300);
  }
}

/**
 * Mostra o assistente em um ponto específico no mapa
 * @param {Object} point - Coordenadas do ponto {lat, lng}
 * @param {string} message - Mensagem que o assistente deve exibir
 */
function showAssistantAtPoint(point, message) {
  if (!point || !point.lat || !point.lng) return;

  assistantState.lastPoint = point;

  // Centraliza o mapa no ponto
  if (mapInstance) {
    mapInstance.setView([point.lat, point.lng], 16);
  }

  // Exibe a mensagem
  if (message) {
    setTimeout(() => {
      addMessageToUI(message, 'assistant');

      // Garantir que o diálogo esteja visível
      const assistantDialog = document.getElementById('assistant-dialog');
      if (assistantDialog) {
        assistantDialog.classList.remove('hidden');
      }

      // Garantir que o input esteja visível
      const inputContainer = document.getElementById(
        'assistant-input-container'
      );
      if (inputContainer) {
        inputContainer.classList.remove('hidden');
      }
    }, 500);
  }
}

/**
 * Envia uma mensagem para o assistente
 * @param {string} message - Mensagem do usuário
 */
function sendMessage(message) {
  if (!message) return;

  // Adiciona mensagem do usuário à interface
  addMessageToUI(message, 'user');

  // Processa a mensagem e retorna uma resposta
  const response = processMessage(message);

  // Adiciona resposta do assistente à interface
  setTimeout(() => {
    addMessageToUI(response, 'assistant');

    // Se a resposta contém uma ação com coordenadas, move o assistente
    if (
      typeof response === 'object' &&
      response.action &&
      response.action.coordinates
    ) {
      moveAssistantToMapPoint(response.action.coordinates, mapInstance);
    }
  }, 500);
}

/**
 * Processa a mensagem do usuário e retorna uma resposta
 * @param {string} message - Mensagem do usuário
 * @returns {string|Object} Resposta do assistente (texto ou objeto com ação)
 */
function processMessage(message) {
  const lowerMessage = message.toLowerCase();

  // Verifica contexto atual para respostas específicas de contexto
  if (assistantState.currentContext !== 'general') {
    // Processamento baseado em contexto específico
    return processContextualMessage(
      lowerMessage,
      assistantState.currentContext
    );
  }

  // Respostas simples baseadas em palavras-chave (versão geral)
  if (lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
    return 'Olá! Como posso ajudar você hoje?';
  } else if (
    lowerMessage.includes('praias') ||
    lowerMessage.includes('praia')
  ) {
    assistantState.currentContext = 'beaches';
    return {
      text: 'Morro de São Paulo tem 5 praias principais numeradas de 1 a 5. A Primeira Praia é mais movimentada, enquanto a Quarta Praia é mais tranquila. Qual você gostaria de conhecer?',
      action: {
        type: 'show_category',
        category: 'beaches',
        coordinates: { lat: -13.3782, lng: -38.913 }, // Coordenadas centrais das praias
      },
    };
  } else if (
    lowerMessage.includes('restaurante') ||
    lowerMessage.includes('comer')
  ) {
    assistantState.currentContext = 'food';
    return {
      text: 'Há vários restaurantes excelentes em Morro de São Paulo, especialmente na Segunda Praia. Você prefere frutos do mar, comida regional ou internacional?',
      action: {
        type: 'show_category',
        category: 'restaurants',
        coordinates: { lat: -13.3773, lng: -38.9155 }, // Região de restaurantes
      },
    };
  } else if (
    lowerMessage.includes('como chegar') ||
    lowerMessage.includes('transporte')
  ) {
    return 'Você pode chegar a Morro de São Paulo de barco saindo de Salvador ou Valença. Não há acesso por estrada diretamente até o morro.';
  }

  // Informações sobre a maré
  else if (lowerMessage.includes('maré')) {
    return 'Hoje a maré está baixa pela manhã e alta à tarde. O melhor horário para caminhar pela praia é entre 8h e 11h.';
  }

  // Informações sobre o clima
  else if (lowerMessage.includes('clima') || lowerMessage.includes('tempo')) {
    return 'O clima hoje está ensolarado, com temperatura de 28°C. Perfeito para aproveitar as praias!';
  }

  // Resposta padrão
  return 'Posso ajudar você a descobrir as melhores atrações de Morro de São Paulo. Pergunte sobre praias, restaurantes, passeios ou hospedagem!';
}

/**
 * Processa mensagens baseadas em contexto específico
 * @param {string} message - Mensagem do usuário (em minúsculas)
 * @param {string} context - Contexto atual da conversa
 * @returns {string|Object} Resposta específica ao contexto
 */
function processContextualMessage(message, context) {
  const lowerMessage = message.toLowerCase();

  switch (context) {
    case 'food':
      // Melhorar detecção de intenção
      if (
        lowerMessage.includes('frutos do mar') ||
        lowerMessage.includes('peixe') ||
        lowerMessage.includes('camarão') ||
        lowerMessage.includes('seafood')
      ) {
        return {
          text: 'Para frutos do mar, recomendo o restaurante Sambass na Terceira Praia. Eles têm uma moqueca de camarão incrível e pratos de peixes frescos.',
          action: {
            type: 'show_location',
            name: 'Restaurante Sambass',
            coordinates: { lat: -13.3865, lng: -38.908 },
          },
        };
      }
      // Outros casos do contexto comida
      break;

    case 'beaches':
      // Melhorar processamento para praias
      break;

    // Outros contextos
  }

  // Reset para contexto geral se não encontrar correspondência
  return processMessage(message);
}

/**
 * Adiciona uma mensagem à interface do usuário
 * @param {string|Object} message - Conteúdo da mensagem (texto ou objeto com texto)
 * @param {string} type - Tipo de mensagem ('user' ou 'assistant')
 */
function addMessageToUI(message, type) {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Limpar mensagens anteriores - importante para mostrar apenas uma mensagem por vez
  messagesContainer.innerHTML = '';

  // Criar elemento de mensagem
  const messageElement = document.createElement('div');
  messageElement.classList.add('assistant-message');

  // Garantir padding adequado
  messageElement.style.padding = '10px';

  if (type === 'user') {
    messageElement.classList.add('user-message');
  }

  // Se for um objeto com propriedade text, usa esse texto
  const messageText = typeof message === 'object' ? message.text : message;
  messageElement.textContent = messageText;

  // Adicionar ao container
  messagesContainer.appendChild(messageElement);
}

/**
 * Inicia o reconhecimento de voz
 */
function startVoiceInput() {
  // Implementação básica - pode ser expandida para usar a Web Speech API
  console.log('Iniciando reconhecimento de voz...');

  if (
    !('webkitSpeechRecognition' in window) &&
    !('SpeechRecognition' in window)
  ) {
    addMessageToUI(
      'Seu navegador não suporta reconhecimento de voz.',
      'assistant'
    );
    return;
  }

  // Visualmente indica que está ouvindo
  addMessageToUI('Estou ouvindo...', 'assistant');
  assistantState.listening = true;

  // Implementação com Web Speech API
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    assistantState.listening = false;

    // Processa o comando de voz como uma mensagem de texto
    addMessageToUI(speechResult, 'user');

    // Pequeno delay para simular processamento
    setTimeout(() => {
      const response = processMessage(speechResult);
      addMessageToUI(response, 'assistant');

      // Se a resposta contém uma ação com coordenadas, move o assistente
      if (
        typeof response === 'object' &&
        response.action &&
        response.action.coordinates
      ) {
        moveAssistantToMapPoint(response.action.coordinates, mapInstance);
      }
    }, 500);
  };

  recognition.onerror = (event) => {
    assistantState.listening = false;
    console.error('Erro no reconhecimento de voz:', event.error);
    addMessageToUI(
      'Desculpe, não consegui entender. Pode tentar novamente?',
      'assistant'
    );
  };

  recognition.start();
}

/**
 * Define o contexto atual do assistente
 * @param {string} context - Novo contexto
 */
function setContext(context) {
  assistantState.currentContext = context;
  console.log(`Contexto do assistente definido para: ${context}`);
}

/**
 * Posiciona corretamente os elementos do assistente
 */
function positionAssistantElements() {
  // Posicionar o botão toggle na parte inferior centralizada
  const toggleButton = document.getElementById('assistant-toggle');
  const digitalAssistant = document.getElementById('digital-assistant');

  if (digitalAssistant) {
    digitalAssistant.style.position = 'fixed';
    digitalAssistant.style.bottom = '20px';
    digitalAssistant.style.top = 'auto';
    digitalAssistant.style.left = '50%';
    digitalAssistant.style.transform = 'translateX(-50%)';
  }

  // Posicionar o diálogo no topo centralizado
  const assistantDialog = document.getElementById('assistant-dialog');

  if (assistantDialog) {
    assistantDialog.style.position = 'fixed';
    assistantDialog.style.top = '20px';
    assistantDialog.style.bottom = 'auto';
    assistantDialog.style.left = '50%';
    assistantDialog.style.transform = 'translateX(-50%)';
  }

  // Posicionar o container de input acima do botão
  const inputContainer = document.getElementById('assistant-input-container');

  if (inputContainer) {
    inputContainer.style.position = 'fixed';
    inputContainer.style.bottom = '90px';
    inputContainer.style.top = 'auto';
    inputContainer.style.left = '50%';
    inputContainer.style.transform = 'translateX(-50%)';
  }
}

// Ajustar posição quando a janela for redimensionada
window.addEventListener('resize', positionAssistantElements);

// Chamar ao carregar a página
document.addEventListener('DOMContentLoaded', positionAssistantElements);
