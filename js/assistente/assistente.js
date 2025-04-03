/**
 * Sistema de Assistente Virtual para Morro de São Paulo Digital
 * Arquivo: js/assistente/assistente.js
 * Versão integrada com funcionalidades avançadas
 */

import { showNotification } from '../ui/notifications.js';
import { selectedLanguage } from '../core/config.js';
import { getGeneralText } from '../i18n/language.js';

// Pontos turísticos de onde o assistente pode "sair"
const LOCAIS_MORRO = [
  {
    nome: 'Segunda Praia',
    coords: { lat: -13.3825, lng: -38.9138 },
    classe: 'entrance-animation-praia-segunda',
    contextos: [
      'Eu estava aqui na Segunda Praia jogando uma altinha com a galera!',
      'Acabei de sair do mar na Segunda Praia, a água está uma delícia hoje!',
      'Estava curtindo o som na barraca da Segunda Praia, muito bom!',
    ],
  },
  {
    nome: 'Terceira Praia',
    coords: { lat: -13.3865, lng: -38.9088 },
    classe: 'entrance-animation-praia-terceira',
    contextos: [
      'Eu estava relaxando nas águas calmas da Terceira Praia!',
      'Acabei de tomar um açaí delicioso na Terceira Praia!',
      'Estava fazendo um passeio de caiaque na Terceira Praia, recomendo muito!',
    ],
  },
  {
    nome: 'Quarta Praia',
    coords: { lat: -13.3915, lng: -38.9046 },
    classe: 'entrance-animation-quarta-praia',
    contextos: [
      'Eu estava na Quarta Praia aproveitando aquela tranquilidade!',
      'Acabei de fazer um passeio de stand-up paddle na Quarta Praia, incrível!',
      'Estava admirando o coral na Quarta Praia, um verdadeiro paraíso natural!',
    ],
  },
  {
    nome: 'Toca do Morcego',
    coords: { lat: -13.3881, lng: -38.9123 },
    classe: 'entrance-animation-toca-morcego',
    contextos: [
      'Eu estava explorando a Toca do Morcego, que lugar incrível!',
      'Acabei de ver o pôr do sol na Toca do Morcego, uma vista de tirar o fôlego!',
      'Estava fazendo trilha até a Toca do Morcego, vale muito a pena o esforço!',
    ],
  },
  {
    nome: 'Farol',
    coords: { lat: -13.3762, lng: -38.9194 },
    classe: 'entrance-animation-farol',
    contextos: [
      'Eu estava apreciando a vista panorâmica lá do Farol!',
      'Acabei de fazer a trilha até o Farol, a vista é espetacular!',
      'Estava fotografando do alto do Farol, dá para ver toda a ilha de lá!',
    ],
  },
];

/**
 * Sistema de estado unificado com observadores
 */
class AssistantState {
  constructor() {
    this._state = {
      isActive: false,
      isVisible: false,
      hasGreeted: false,
      isTyping: false,
      isSpeaking: false,
      isListening: false,
      visitCount: 0,
      lastLocation: null,
      firstTimeVisitor: true,
      awaitingFirstTimeResponse: false,
      currentContext: 'general',
      selectedLanguage: selectedLanguage || 'pt',
      markers: [],
      conversations: [],
      history: [],
      lastInteractionTime: null,
      initialized: false,
      map: null,
      settings: {
        showAnimations: true,
        useVoice: true,
        autoShowAtPoints: true,
      },
    };

    this._observers = [];
  }

  /**
   * Obtém o valor de uma propriedade do estado
   * @param {string} key - Chave da propriedade
   * @param {*} defaultValue - Valor padrão caso a propriedade não exista
   * @returns {*} Valor da propriedade
   */
  get(key, defaultValue = null) {
    return key in this._state ? this._state[key] : defaultValue;
  }

  /**
   * Define o valor de uma propriedade do estado
   * @param {string} key - Chave da propriedade
   * @param {*} value - Novo valor
   * @param {boolean} notify - Se deve notificar observadores
   */
  set(key, value, notify = true) {
    const oldValue = this._state[key];
    this._state[key] = value;

    if (notify && oldValue !== value) {
      this._notifyObservers({ key, oldValue, newValue: value });
    }
  }

  /**
   * Atualiza múltiplas propriedades de uma vez
   * @param {Object} updates - Objeto com atualizações
   * @param {boolean} notify - Se deve notificar observadores
   */
  update(updates, notify = true) {
    const changes = {};

    for (const [key, value] of Object.entries(updates)) {
      const oldValue = this._state[key];

      if (oldValue !== value) {
        this._state[key] = value;
        changes[key] = { oldValue, newValue: value };
      }
    }

    if (notify && Object.keys(changes).length > 0) {
      this._notifyObservers(changes);
    }
  }

  /**
   * Adiciona um observador para mudanças de estado
   * @param {Function} callback - Função a ser chamada quando o estado mudar
   * @returns {Function} Função para remover o observador
   */
  observe(callback) {
    this._observers.push(callback);

    // Retornar função para remover observador
    return () => {
      this._observers = this._observers.filter(
        (observer) => observer !== callback
      );
    };
  }

  /**
   * Notifica todos os observadores sobre mudanças
   * @param {Object} changes - Mudanças ocorridas
   * @private
   */
  _notifyObservers(changes) {
    this._observers.forEach((observer) => {
      try {
        observer(changes, this._state);
      } catch (error) {
        console.error('Erro ao notificar observador:', error);
      }
    });
  }

  /**
   * Salva o estado no localStorage
   */
  save() {
    try {
      const persistentState = {
        visitCount: this._state.visitCount,
        lastLocation: this._state.lastLocation,
        firstTimeVisitor: this._state.firstTimeVisitor,
        selectedLanguage: this._state.selectedLanguage,
        settings: this._state.settings,
        hasGreeted: this._state.hasGreeted,
        history: this._state.history.slice(-20), // Salvar apenas as últimas 20 mensagens
      };

      localStorage.setItem(
        'morroDigitalAssistantState',
        JSON.stringify(persistentState)
      );
      console.log('Estado do assistente salvo com sucesso');
    } catch (error) {
      console.error('Erro ao salvar estado do assistente:', error);
    }
  }

  /**
   * Carrega o estado do localStorage
   */
  load() {
    try {
      const savedState = localStorage.getItem('morroDigitalAssistantState');

      if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Atualizar apenas propriedades persistentes
        this.update(
          {
            visitCount: parsedState.visitCount || 0,
            lastLocation: parsedState.lastLocation || null,
            firstTimeVisitor: parsedState.firstTimeVisitor !== false,
            selectedLanguage: parsedState.selectedLanguage || 'pt',
            hasGreeted: parsedState.hasGreeted || false,
            history: parsedState.history || [],
            settings: {
              ...this._state.settings,
              ...(parsedState.settings || {}),
            },
          },
          false
        );

        console.log('Estado do assistente carregado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao carregar estado do assistente:', error);
    }
  }

  /**
   * Incrementa a contagem de visitas
   */
  incrementVisitCount() {
    this.set('visitCount', this.get('visitCount') + 1);
    this.set('firstTimeVisitor', this.get('visitCount') === 1);
    this.save();
  }

  /**
   * Retorna todo o estado
   */
  getState() {
    return { ...this._state };
  }
}

/**
 * Sistema de fluxo de conversação com aguardo de interação
 */
class ConversationFlow {
  constructor() {
    this.steps = [];
    this.currentStepIndex = -1;
    this.isWaitingForInteraction = false;

    // Inicializar callbacks
    if (!window.assistantCallbacks) {
      window.assistantCallbacks = {};
    }

    window.assistantCallbacks.onInteractionComplete = () => {
      this.isWaitingForInteraction = false;
      this.processNextStep();
    };
  }

  /**
   * Adiciona uma mensagem ao fluxo de conversação
   * @param {string|Object} message - Mensagem a ser exibida
   * @param {string} type - Tipo de mensagem ('user' ou 'assistant')
   * @param {boolean} requireInteraction - Se requer interação para continuar
   * @param {Function} callback - Função opcional a ser chamada após a mensagem
   */
  addStep(
    message,
    type = 'assistant',
    requireInteraction = false,
    callback = null
  ) {
    this.steps.push({
      message,
      type,
      requireInteraction,
      callback,
    });

    // Se for o primeiro passo, inicia o processo
    if (this.steps.length === 1 && this.currentStepIndex === -1) {
      this.processNextStep();
    }

    return this;
  }

  /**
   * Processa o próximo passo na conversação
   */
  processNextStep() {
    if (this.isWaitingForInteraction) {
      return; // Aguardando interação do usuário
    }

    this.currentStepIndex++;

    if (this.currentStepIndex >= this.steps.length) {
      console.log('Fluxo de conversação concluído');
      return;
    }

    const step = this.steps[this.currentStepIndex];

    // Exibir a mensagem
    addMessageToDOM(step.message, step.type, step.requireInteraction);

    // Se requerer interação, marcar como aguardando
    if (step.requireInteraction) {
      this.isWaitingForInteraction = true;
    } else {
      // Caso contrário, agendar o próximo passo após um pequeno delay
      setTimeout(() => {
        // Executar callback se existir
        if (step.callback && typeof step.callback === 'function') {
          step.callback();
        }

        this.processNextStep();
      }, 2000); // Delay de 2 segundos entre mensagens
    }
  }

  /**
   * Reinicia o fluxo de conversação
   */
  reset() {
    this.currentStepIndex = -1;
    this.isWaitingForInteraction = false;
    this.steps = [];
  }
}

// Instância global do fluxo de conversação
let conversationFlow;
// Instância global do estado
let assistantStateManager;

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

    // Inicializar o gerenciador de estado
    assistantStateManager = new AssistantState();
    // Carregar estado anterior se existir
    assistantStateManager.load();
    // Definir referência ao mapa
    if (map) {
      assistantStateManager.set('map', map);
    }

    // Incrementar contagem de visitas
    assistantStateManager.incrementVisitCount();

    // Inicializar o fluxo de conversação
    conversationFlow = new ConversationFlow();

    // Configurar sistema de estado para compatibilidade
    window.assistantState = {
      isActive: assistantStateManager.get('isActive'),
      isSpeaking: assistantStateManager.get('isSpeaking'),
      isListening: assistantStateManager.get('isListening'),
      context: { currentContext: assistantStateManager.get('currentContext') },
      history: assistantStateManager.get('history'),
      lastInteractionTime: new Date(),
      initialized: true,
      map: map,
      hasGreeted: assistantStateManager.get('hasGreeted'),
      isFirstTimeVisitor: assistantStateManager.get('firstTimeVisitor'),
      awaitingFirstVisitResponse: assistantStateManager.get(
        'awaitingFirstTimeResponse'
      ),
    };

    // Criar API do assistente
    const api = createAssistantAPI();
    window.assistantApi = api;

    // Marcar como inicializado
    window.assistantInitialized = true;

    // Configurar a UI se o DOM já estiver carregado
    if (document.readyState === 'complete') {
      setupAssistantUI();
    } else {
      window.addEventListener('DOMContentLoaded', setupAssistantUI);
    }

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

        assistantStateManager.set('isActive', false);
        assistantStateManager.set('isVisible', false);
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
      sendMessage(message);
      return true;
    },

    /**
     * Notifica que o assistente foi aberto
     */
    notifyOpened: function () {
      console.log('Assistente aberto pelo usuário');

      // Verificar se devemos mostrar a saudação
      const messagesContainer = document.getElementById('assistant-messages');

      if (
        messagesContainer &&
        (!messagesContainer.hasChildNodes() ||
          messagesContainer.children.length === 0)
      ) {
        console.log('Container de mensagens vazio, mostrando boas-vindas');
        showWelcomeMessage();
      } else {
        console.log('Container de mensagens já contém conteúdo');
      }

      return true;
    },

    /**
     * Inicia entrada de voz
     */
    startVoiceInput: function () {
      return handleVoiceInput();
    },

    /**
     * Verifica se o assistente está ativo
     */
    isActive: function () {
      return assistantStateManager.get('isActive');
    },

    /**
     * Retorna o estado atual do assistente
     */
    getState: function () {
      return assistantStateManager.getState();
    },

    /**
     * Mostra o assistente com animação
     */
    showWithAnimation: function () {
      return showAssistantWithAnimation();
    },

    /**
     * Limpa o histórico de conversação
     */
    clearHistory: function () {
      assistantStateManager.update({ history: [] });
      assistantStateManager.save();
      const messagesContainer = document.getElementById('assistant-messages');
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
      }
      return true;
    },
  };
}

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

      // Atualizar estado
      assistantStateManager.set('isVisible', true);
      assistantStateManager.set('isActive', true);
      window.assistantState.isActive = true;

      // Mostrar dialog diretamente, sem esperar um clique no botão
      const assistantDialog = document.getElementById('assistant-dialog');
      if (assistantDialog) {
        assistantDialog.classList.remove('hidden');

        // Mostrar primeira mensagem apenas se não foi mostrada ainda
        if (!assistantStateManager.get('hasGreeted')) {
          showWelcomeMessage();
          assistantStateManager.set('hasGreeted', true);
          window.assistantState.hasGreeted = true;
        }
      }

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
 * Mostra o assistente com animação vindo de um local turístico
 */
function showAssistantWithAnimation() {
  const digitalAssistant = document.getElementById('digital-assistant');

  if (!digitalAssistant) {
    console.error('Elemento do assistente não encontrado!');
    return false;
  }

  console.log('Iniciando animação do assistente...');

  // Remover classe hidden e garantir visualização
  digitalAssistant.style.display = '';
  digitalAssistant.classList.remove('hidden');

  // Garantir posicionamento correto
  ensureCorrectPosition(digitalAssistant);

  // Escolher local aleatório
  const localEscolhido = escolherLocalAleatorio();
  console.log(`Assistente saindo de: ${localEscolhido.nome}`);

  // Remover classes anteriores de animação
  LOCAIS_MORRO.forEach((local) => {
    digitalAssistant.classList.remove(local.classe);
  });

  // Aplicar classe de animação correspondente ao local
  digitalAssistant.classList.add(localEscolhido.classe);

  // Atualizar estado
  assistantStateManager.set('isVisible', true);
  assistantStateManager.set('isActive', true);
  window.assistantState.isActive = true;

  // Após terminar a animação, mostrar diálogo se for a primeira vez
  setTimeout(() => {
    if (!assistantStateManager.get('hasGreeted')) {
      console.log('Primeira interação, mostrando saudação...');
      const assistantDialog = document.getElementById('assistant-dialog');

      if (assistantDialog) {
        assistantDialog.classList.remove('hidden');
        showGreeting(localEscolhido);
        assistantStateManager.set('hasGreeted', true);
        window.assistantState.hasGreeted = true;
      }
    }
  }, 3500); // Duração da animação - 3.5s

  return true;
}

/**
 * Garante que o assistente esteja corretamente posicionado
 * @param {HTMLElement} element - Elemento do assistente
 */
function ensureCorrectPosition(element) {
  if (!element) return;

  // Forçar posicionamento fixo no centro inferior
  element.style.position = 'fixed';
  element.style.bottom = '20px';
  element.style.left = '50%';
  element.style.transform = 'translateX(-50%)';
  element.style.zIndex = '9999';
}

/**
 * Escolhe um local aleatório para o assistente "sair",
 * evitando repetir o último local usado
 */
function escolherLocalAleatorio() {
  let localEscolhido;
  let tentativas = 0;
  const maxTentativas = 5;

  // Tentar encontrar local diferente do último
  do {
    const indiceAleatorio = Math.floor(Math.random() * LOCAIS_MORRO.length);
    localEscolhido = LOCAIS_MORRO[indiceAleatorio];
    tentativas++;
  } while (
    assistantStateManager.get('lastLocation') &&
    assistantStateManager.get('lastLocation') === localEscolhido.nome &&
    tentativas < maxTentativas
  );

  // Atualizar último local
  assistantStateManager.set('lastLocation', localEscolhido.nome);
  assistantStateManager.save();

  return localEscolhido;
}

/**
 * Processa mensagem do usuário
 * @param {string} message - Mensagem enviada pelo usuário
 */
function processUserMessage(message) {
  // Verificar mensagem vazia
  if (!message || typeof message !== 'string') {
    console.warn('Mensagem inválida para processamento');
    return '';
  }

  console.log('Processando mensagem do usuário:', message);

  // Resposta baseada em palavras-chave simples
  let response = '';
  const messageLower = message.toLowerCase();

  // Verificar contexto atual
  const currentContext = assistantStateManager.get('currentContext');
  if (currentContext !== 'general') {
    // Processar mensagem baseada no contexto
    const contextResponse = processContextualMessage(message, currentContext);
    return contextResponse;
  }

  // Processar mensagem geral
  if (messageLower.includes('clima')) {
    response =
      'O clima em Morro de São Paulo está ensolarado hoje! A temperatura é de aproximadamente 28°C, perfeito para curtir as praias.';
  } else if (messageLower.includes('praia')) {
    if (messageLower.includes('segunda')) {
      response = {
        text: 'A Segunda Praia é o coração de Morro de São Paulo! Tem águas calmas, bares, restaurantes e muita agitação. É perfeita para quem quer curtir a praia com estrutura completa e boa vida noturna.',
        action: {
          type: 'show_location',
          name: 'Segunda Praia',
          coordinates: { lat: -13.3825, lng: -38.9138 },
        },
      };
    } else if (messageLower.includes('terceira')) {
      response = {
        text: 'A Terceira Praia tem águas tranquilas e cristalinas, perfeitas para banho! É mais familiar e relaxante, com excelentes pousadas e restaurantes. Daqui saem muitos barcos para passeios.',
        action: {
          type: 'show_location',
          name: 'Terceira Praia',
          coordinates: { lat: -13.3865, lng: -38.9088 },
        },
      };
    } else if (messageLower.includes('quarta')) {
      response = {
        text: 'A Quarta Praia é extensa e mais deserta, ideal para quem busca tranquilidade! Tem piscinas naturais na maré baixa e é ótima para longas caminhadas.',
        action: {
          type: 'show_location',
          name: 'Quarta Praia',
          coordinates: { lat: -13.3915, lng: -38.9046 },
        },
      };
    } else {
      response =
        'Morro de São Paulo tem 5 praias principais, cada uma com seu charme! A Primeira é ótima para surf, a Segunda é a mais animada com bares e restaurantes, a Terceira tem águas calmas perfeitas para banho, a Quarta é mais tranquila e a Quinta é quase deserta. Qual delas você gostaria de conhecer?';
      // Definir contexto para praias
      assistantStateManager.set('currentContext', 'beaches');
    }
  } else if (
    messageLower.includes('restaurante') ||
    messageLower.includes('comer')
  ) {
    response =
      'Morro de São Paulo tem uma gastronomia incrível! Você prefere frutos do mar, comida regional baiana ou culinária internacional?';
    // Definir contexto para comida
    assistantStateManager.set('currentContext', 'food');
  } else if (
    messageLower.includes('hotel') ||
    messageLower.includes('pousada') ||
    messageLower.includes('hospedagem')
  ) {
    response =
      'Em Morro temos opções para todos os bolsos! Pousadas econômicas como Porto do Zimbo na Vila, pousadas medianas como Pousada Natureza na Segunda Praia, e opções de luxo como a Villa dos Corais na Terceira Praia. Qual tipo de hospedagem você procura?';
    // Definir contexto para hospedagem
    assistantStateManager.set('currentContext', 'accommodation');
  } else if (
    messageLower.includes('transporte') ||
    messageLower.includes('como chegar')
  ) {
    response =
      'Para chegar a Morro de São Paulo, você pode pegar um catamarã de Salvador (2h) ou vir de carro até Valença e depois de barco (45min). Não há carros na ilha, exceto veículos de serviço.';
  } else if (
    messageLower.includes('mapa') ||
    messageLower.includes('localização')
  ) {
    response =
      'Você pode ver as principais localizações navegando pelo mapa. Clique no menu para filtrar pontos de interesse. Gostaria que eu mostrasse algum lugar específico?';
  } else if (
    messageLower.includes('olá') ||
    messageLower.includes('oi') ||
    messageLower.includes('ola')
  ) {
    response = 'Olá! Como posso ajudar você a explorar Morro de São Paulo?';
  } else if (
    messageLower.includes('obrigado') ||
    messageLower.includes('obrigada') ||
    messageLower.includes('valeu')
  ) {
    response =
      'Por nada! Estou aqui para ajudar. Há mais alguma coisa que você gostaria de saber sobre Morro de São Paulo?';
  } else {
    response =
      'Posso ajudá-lo a encontrar informações sobre Morro de São Paulo. Pergunte sobre praias, restaurantes, hospedagem, transporte ou atrações. O que você gostaria de saber?';
  }

  return response;
}

/**
 * Processa mensagem baseada no contexto atual
 * @param {string} message - Mensagem do usuário
 * @param {string} context - Contexto atual
 * @returns {string|Object} - Resposta ao usuário
 */
function processContextualMessage(message, context) {
  const lowerMessage = message.toLowerCase();

  switch (context) {
    case 'food':
      if (
        lowerMessage.includes('frutos do mar') ||
        lowerMessage.includes('peixe') ||
        lowerMessage.includes('camarão')
      ) {
        return {
          text: 'Para frutos do mar, recomendo o restaurante Sambass na Terceira Praia. Eles têm uma moqueca de camarão incrível e pratos de peixes frescos. O Ponta do Morro na Segunda Praia também é excelente.',
          action: {
            type: 'show_location',
            name: 'Restaurante Sambass',
            coordinates: { lat: -13.3865, lng: -38.908 },
          },
        };
      } else if (
        lowerMessage.includes('regional') ||
        lowerMessage.includes('baiana')
      ) {
        return {
          text: 'Para comida baiana autêntica, visite o Restaurante Maria na Vila. O acarajé da Maria é famoso, assim como a moqueca e o bobó de camarão. Os preços são justos e o ambiente é charmoso.',
          action: {
            type: 'show_location',
            name: 'Restaurante Maria',
            coordinates: { lat: -13.3805, lng: -38.9125 },
          },
        };
      } else if (
        lowerMessage.includes('internacional') ||
        lowerMessage.includes('italia')
      ) {
        return {
          text: 'O restaurante "Pasta & Vino" oferece excelente comida italiana, enquanto o "Thai Cuisine" serve deliciosos pratos tailandeses com vista para o mar.',
          action: {
            type: 'show_location',
            name: 'Pasta & Vino',
            coordinates: { lat: -13.3775, lng: -38.9148 },
          },
        };
      } else {
        // Reset contexto se a mensagem não for clara
        assistantStateManager.set('currentContext', 'general');
        return 'Há opções para todos os gostos em Morro de São Paulo. Você prefere frutos do mar, comida regional baiana ou culinária internacional?';
      }

    case 'beaches':
      if (lowerMessage.includes('primeira')) {
        return {
          text: 'A Primeira Praia é a mais próxima da Vila e ótima para surfistas! Tem ondas fortes e é menos indicada para banho. É uma praia pequena, com uma vista linda para o Farol e alguns estabelecimentos.',
          action: {
            type: 'show_location',
            name: 'Primeira Praia',
            coordinates: { lat: -13.3795, lng: -38.9165 },
          },
        };
      } else if (lowerMessage.includes('segunda')) {
        return {
          text: 'A Segunda Praia é o coração da vida social em Morro! Tem águas mais calmas, muitos restaurantes, bares e hotéis. Durante o dia é movimentada e à noite se transforma no centro da vida noturna!',
          action: {
            type: 'show_location',
            name: 'Segunda Praia',
            coordinates: { lat: -13.3825, lng: -38.9138 },
          },
        };
      } else if (lowerMessage.includes('terceira')) {
        return {
          text: 'A Terceira Praia tem águas tranquilas e cristalinas, perfeitas para banho! É mais familiar e relaxante, com excelentes pousadas e restaurantes.',
          action: {
            type: 'show_location',
            name: 'Terceira Praia',
            coordinates: { lat: -13.3865, lng: -38.9088 },
          },
        };
      } else if (lowerMessage.includes('quarta')) {
        return {
          text: 'A Quarta Praia é extensa e mais deserta, ideal para quem busca tranquilidade! Tem piscinas naturais na maré baixa e é ótima para longas caminhadas.',
          action: {
            type: 'show_location',
            name: 'Quarta Praia',
            coordinates: { lat: -13.3915, lng: -38.9046 },
          },
        };
      } else if (lowerMessage.includes('quinta')) {
        return {
          text: 'A Quinta Praia (ou Praia do Encanto) é a mais isolada e preservada. É perfeita para quem busca completa tranquilidade. O mar é calmo com águas cristalinas. É necessário caminhar bastante para chegar lá, mas vale a pena!',
          action: {
            type: 'show_location',
            name: 'Quinta Praia',
            coordinates: { lat: -13.3965, lng: -38.9 },
          },
        };
      } else {
        // Reset contexto se a mensagem não for clara
        assistantStateManager.set('currentContext', 'general');
        return 'Morro de São Paulo tem 5 praias principais, numeradas de 1 a 5. Você pode escolher entre a Primeira (surf), Segunda (movimentada), Terceira (águas calmas), Quarta (tranquila) ou Quinta Praia (isolada).';
      }

    case 'accommodation':
      if (lowerMessage.includes('econôm') || lowerMessage.includes('barat')) {
        return 'Para opções econômicas, recomendo as pousadas na Vila como Porto do Zimbo ou Che Lagarto Hostel. Na alta temporada, reserve com antecedência pois lotam rapidamente.';
      } else if (
        lowerMessage.includes('média') ||
        lowerMessage.includes('intermediár')
      ) {
        return {
          text: 'Na faixa intermediária, a Pousada Natureza na Segunda Praia tem ótimo custo-benefício, assim como a Pousada Bahia Inn. Ambas oferecem café da manhã e estão bem localizadas.',
          action: {
            type: 'show_location',
            name: 'Pousada Natureza',
            coordinates: { lat: -13.3825, lng: -38.913 },
          },
        };
      } else if (lowerMessage.includes('luxo')) {
        return {
          text: 'Para hospedagem de luxo, a Villa dos Corais na Terceira Praia é excepcional. O Patachocas Beach Resort também oferece ótima estrutura com piscina e vista para o mar.',
          action: {
            type: 'show_location',
            name: 'Villa dos Corais',
            coordinates: { lat: -13.386, lng: -38.9075 },
          },
        };
      } else {
        // Reset contexto se a mensagem não for clara
        assistantStateManager.set('currentContext', 'general');
        return 'Morro de São Paulo oferece hospedagem para todos os perfis e bolsos. Você procura algo econômico, de categoria média ou de luxo?';
      }

    default:
      // Reset para contexto geral
      assistantStateManager.set('currentContext', 'general');
      return processUserMessage(message); // Processa como mensagem geral
  }
}

/**
 * Envia uma mensagem para o assistente
 * @param {string} message - Mensagem do usuário
 */
function sendMessage(message) {
  if (!message) return;

  // Limpar fluxo de conversação anterior
  conversationFlow.reset();

  // Adicionar mensagem do usuário
  addMessageToDOM(message, 'user');

  // Adicionar ao histórico
  addMessageToHistory(message, 'user');

  // Mostrar indicador de digitação
  showTypingIndicator();

  // Processar a mensagem após um pequeno delay
  setTimeout(
    () => {
      hideTypingIndicator();

      // Processa a mensagem do usuário
      const response = processUserMessage(message);

      // Verificar se a resposta tem ação associada
      if (typeof response === 'object' && response.action) {
        // Adicionar mensagem ao DOM
        addMessageToDOM(response.text, 'assistant');

        // Adicionar ao histórico
        addMessageToHistory(response.text, 'assistant');

        // Executar ação associada
        if (
          response.action.type === 'show_location' &&
          response.action.coordinates
        ) {
          setTimeout(() => {
            showLocationOnMap(
              response.action.coordinates,
              response.action.name
            );
          }, 1000);
        }
      } else {
        // Adicionar mensagem simples ao DOM
        addMessageToDOM(response, 'assistant');

        // Adicionar ao histórico
        addMessageToHistory(response, 'assistant');
      }

      // Mostrar opções de sugestão para alguns contextos
      const context = assistantStateManager.get('currentContext');
      if (context === 'food') {
        setTimeout(showFoodOptions, 500);
      } else if (context === 'beaches') {
        setTimeout(showBeachOptions, 500);
      } else if (context === 'accommodation') {
        setTimeout(showAccommodationOptions, 500);
      }

      // Salvar estado para persistir o histórico
      assistantStateManager.save();
    },
    1000 + Math.random() * 500
  ); // Delay variável entre 1000ms e 1500ms
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
    hideTypingIndicator();
    addMessageToDOM(mensagemBase, 'assistant');

    // Adicionar ao histórico
    addMessageToHistory(mensagemBase, 'assistant');

    // Se for primeiro acesso, mostrar botões de escolha
    if (assistantStateManager.get('firstTimeVisitor')) {
      setTimeout(showFirstTimeOptions, 500);
    }

    // Salvar estado para persistir o histórico
    assistantStateManager.save();
  }, 1500);
}

/**
 * Mostra opções para resposta de primeira visita
 */
function showFirstTimeOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar contêiner de botões
  const choicesElement = document.createElement('div');
  choicesElement.className = 'message-actions';

  // Botão "Sim"
  const yesButton = document.createElement('button');
  yesButton.className = 'action-button';
  yesButton.textContent = 'Sim, primeira vez';
  yesButton.onclick = () => handleFirstVisitResponse(true);

  // Botão "Não"
  const noButton = document.createElement('button');
  noButton.className = 'action-button';
  noButton.textContent = 'Não, já estive aqui';
  noButton.onclick = () => handleFirstVisitResponse(false);

  // Adicionar botões ao container
  choicesElement.appendChild(yesButton);
  choicesElement.appendChild(noButton);

  // Adicionar container ao DOM
  messagesContainer.appendChild(choicesElement);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Mostra opções de comida
 */
function showFoodOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const choicesElement = document.createElement('div');
  choicesElement.className = 'message-actions';
  choicesElement.innerHTML = `
    <button class="action-button" data-choice="frutos_do_mar">Frutos do Mar</button>
    <button class="action-button" data-choice="baiana">Comida Baiana</button>
    <button class="action-button" data-choice="internacional">Internacional</button>
  `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.action-button');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      sendMessage(
        `Quero saber sobre restaurantes de ${escolha.replace('_', ' ')}`
      );
    });
  });

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Mostra opções de praias
 */
function showBeachOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const choicesElement = document.createElement('div');
  choicesElement.className = 'message-actions';
  choicesElement.innerHTML = `
    <button class="action-button" data-choice="primeira_praia">Primeira Praia</button>
    <button class="action-button" data-choice="segunda_praia">Segunda Praia</button>
    <button class="action-button" data-choice="terceira_praia">Terceira Praia</button>
    <button class="action-button" data-choice="quarta_praia">Quarta Praia</button>
  `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.action-button');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      sendMessage(`Me fale sobre a ${escolha.replace('_', ' ')}`);
    });
  });

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Mostra opções de hospedagem
 */
function showAccommodationOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const choicesElement = document.createElement('div');
  choicesElement.className = 'message-actions';
  choicesElement.innerHTML = `
    <button class="action-button" data-choice="economica">Econômica</button>
    <button class="action-button" data-choice="media">Categoria Média</button>
    <button class="action-button" data-choice="luxo">Luxo</button>
  `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.action-button');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      sendMessage(`Quero hospedagem ${escolha}`);
    });
  });

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa a resposta do usuário sobre primeira visita
 * @param {boolean} isFirstVisit - Verdadeiro se primeira visita
 */
function handleFirstVisitResponse(isFirstVisit) {
  // Atualizar estado
  assistantStateManager.set('firstTimeVisitor', isFirstVisit);
  assistantStateManager.set('awaitingFirstTimeResponse', false);

  // Salvar estado no localStorage
  localStorage.setItem('morroDigitalAssistantGreeted', 'true');
  localStorage.setItem(
    'morroDigitalFirstTimeVisitor',
    isFirstVisit ? 'true' : 'false'
  );

  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Remover os botões de ação
  const actionButtons = messagesContainer.querySelector('.message-actions');
  if (actionButtons) {
    actionButtons.remove();
  }

  // Adicionar resposta personalizada e próximos passos
  const responseElement = document.createElement('div');
  responseElement.className = 'assistant-message';

  if (isFirstVisit) {
    responseElement.textContent =
      'Que bom ter você aqui pela primeira vez! Vou ajudar a conhecer os principais pontos turísticos. Gostaria de iniciar um tutorial rápido sobre como usar o mapa?';

    // Adicionar ao histórico
    addMessageToHistory(
      'Que bom ter você aqui pela primeira vez! Vou ajudar a conhecer os principais pontos turísticos. Gostaria de iniciar um tutorial rápido sobre como usar o mapa?',
      'assistant'
    );

    // Adicionar botões para tutorial
    setTimeout(() => {
      // Criar container para botões
      const tutorialButtonsContainer = document.createElement('div');
      tutorialButtonsContainer.className = 'message-actions';

      // Botão "Sim, mostrar tutorial"
      const tutorialYesButton = document.createElement('button');
      tutorialYesButton.className = 'action-button';
      tutorialYesButton.textContent = 'Sim, mostrar tutorial';
      tutorialYesButton.onclick = () => {
        // Iniciar tutorial
        startTutorial();

        // Adicionar confirmação
        const confirmationElement = document.createElement('div');
        confirmationElement.className = 'assistant-message';
        confirmationElement.textContent =
          'Ótimo! Vou te mostrar como usar o mapa interativo. Siga as instruções na tela.';
        messagesContainer.appendChild(confirmationElement);

        // Adicionar ao histórico
        addMessageToHistory(
          'Ótimo! Vou te mostrar como usar o mapa interativo. Siga as instruções na tela.',
          'assistant'
        );

        // Remover botões
        tutorialButtonsContainer.remove();

        // Rolar para o final
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      };

      // Botão "Não, explorar sozinho"
      const tutorialNoButton = document.createElement('button');
      tutorialNoButton.className = 'action-button';
      tutorialNoButton.textContent = 'Não, explorar sozinho';
      tutorialNoButton.onclick = () => {
        // Adicionar confirmação
        const confirmationElement = document.createElement('div');
        confirmationElement.className = 'assistant-message';
        confirmationElement.textContent =
          'Sem problemas! Estou aqui para ajudar quando precisar. Você pode me perguntar sobre praias, restaurantes, hospedagem e atrações a qualquer momento.';
        messagesContainer.appendChild(confirmationElement);

        // Adicionar ao histórico
        addMessageToHistory(
          'Sem problemas! Estou aqui para ajudar quando precisar. Você pode me perguntar sobre praias, restaurantes, hospedagem e atrações a qualquer momento.',
          'assistant'
        );

        // Remover botões
        tutorialButtonsContainer.remove();

        // Rolar para o final
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      };

      // Adicionar botões ao container
      tutorialButtonsContainer.appendChild(tutorialYesButton);
      tutorialButtonsContainer.appendChild(tutorialNoButton);

      // Adicionar container ao DOM
      messagesContainer.appendChild(tutorialButtonsContainer);

      // Rolar para o final
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);
  } else {
    responseElement.textContent =
      'Que bom ter você de volta! Como posso ajudar na sua visita a Morro de São Paulo?';

    // Adicionar ao histórico
    addMessageToHistory(
      'Que bom ter você de volta! Como posso ajudar na sua visita a Morro de São Paulo?',
      'assistant'
    );

    // Adicionar sugestões após um delay
    setTimeout(() => {
      const suggestionsElement = document.createElement('div');
      suggestionsElement.className = 'assistant-message';
      suggestionsElement.textContent =
        'Você pode me perguntar sobre praias, restaurantes, hospedagem e atrações.';
      messagesContainer.appendChild(suggestionsElement);

      // Adicionar ao histórico
      addMessageToHistory(
        'Você pode me perguntar sobre praias, restaurantes, hospedagem e atrações.',
        'assistant'
      );

      // Rolar para o final
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);
  }

  messagesContainer.appendChild(responseElement);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Salvar estado
  assistantStateManager.save();
}

/**
 * Inicia o tutorial interativo
 */
function startTutorial() {
  try {
    // Verificar se a função de tutorial externa existe
    if (typeof window.nextTutorialStep === 'function') {
      console.log('Iniciando tutorial integrado...');
      window.nextTutorialStep();
    } else {
      console.log(
        'Função de tutorial não encontrada, iniciando tutorial interno...'
      );
      // Implementar tutorial interno se a função externa não existir
      showInternalTutorial();
    }
  } catch (error) {
    console.error('Erro ao iniciar tutorial:', error);
  }
}

/**
 * Exibe um tutorial interno simplificado caso o sistema de tutorial principal não esteja disponível
 */
function showInternalTutorial() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Adicionar primeira dica do tutorial
  const tutorialStep1 = document.createElement('div');
  tutorialStep1.className = 'assistant-message tutorial-message';
  tutorialStep1.textContent =
    'Dica #1: Use os botões de zoom (+/-) para aproximar ou afastar o mapa.';
  messagesContainer.appendChild(tutorialStep1);

  // Adicionar ao histórico
  addMessageToHistory(
    'Dica #1: Use os botões de zoom (+/-) para aproximar ou afastar o mapa.',
    'assistant'
  );

  // Adicionar próximas dicas com intervalos
  setTimeout(() => {
    const tutorialStep2 = document.createElement('div');
    tutorialStep2.className = 'assistant-message tutorial-message';
    tutorialStep2.textContent =
      'Dica #2: Clique nos ícones do mapa para ver informações sobre pontos turísticos.';
    messagesContainer.appendChild(tutorialStep2);

    // Adicionar ao histórico
    addMessageToHistory(
      'Dica #2: Clique nos ícones do mapa para ver informações sobre pontos turísticos.',
      'assistant'
    );

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
      const tutorialStep3 = document.createElement('div');
      tutorialStep3.className = 'assistant-message tutorial-message';
      tutorialStep3.textContent =
        'Dica #3: Use o menu para filtrar diferentes tipos de atrações no mapa.';
      messagesContainer.appendChild(tutorialStep3);

      // Adicionar ao histórico
      addMessageToHistory(
        'Dica #3: Use o menu para filtrar diferentes tipos de atrações no mapa.',
        'assistant'
      );

      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      setTimeout(() => {
        const tutorialFinish = document.createElement('div');
        tutorialFinish.className = 'assistant-message';
        tutorialFinish.textContent =
          'Agora você está pronto para explorar Morro de São Paulo! Tem alguma pergunta específica?';
        messagesContainer.appendChild(tutorialFinish);

        // Adicionar ao histórico
        addMessageToHistory(
          'Agora você está pronto para explorar Morro de São Paulo! Tem alguma pergunta específica?',
          'assistant'
        );

        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Salvar estado
        assistantStateManager.save();
      }, 3000);
    }, 3000);
  }, 3000);
}

/**
 * Processa entrada de voz
 */
function handleVoiceInput() {
  console.log('Entrada de voz solicitada');

  if (
    !('webkitSpeechRecognition' in window) &&
    !('SpeechRecognition' in window)
  ) {
    addMessageToDOM(
      'Desculpe, seu navegador não suporta reconhecimento de voz. Por favor, digite sua pergunta.',
      'assistant'
    );
    return false;
  }

  addMessageToDOM('Estou ouvindo...', 'assistant', true);

  // Adicionar ao histórico
  addMessageToHistory('Estou ouvindo...', 'assistant');

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = selectedLanguage === 'pt' ? 'pt-BR' : 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const speechText = event.results[0][0].transcript;
    console.log('Texto reconhecido:', speechText);

    // Mostrar o que foi entendido
    addMessageToDOM(speechText, 'user');

    // Adicionar ao histórico
    addMessageToHistory(speechText, 'user');

    // Processar a mensagem
    setTimeout(() => {
      sendMessage(speechText);
    }, 500);
  };

  recognition.onerror = (event) => {
    console.error(`Erro de reconhecimento: ${event.error}`);
    addMessageToDOM(
      'Desculpe, não consegui entender. Pode tentar novamente ou digitar sua pergunta?',
      'assistant'
    );

    // Adicionar ao histórico
    addMessageToHistory(
      'Desculpe, não consegui entender. Pode tentar novamente ou digitar sua pergunta?',
      'assistant'
    );
  };

  recognition.start();

  // Mostrar indicador de escuta
  showListeningIndicator();

  // Atualizar estado
  assistantStateManager.set('isListening', true);

  return true;
}

/**
 * Configura a interface do usuário do assistente
 */
function setupAssistantUI() {
  try {
    // Verificar se o DOM está pronto
    if (
      document.readyState !== 'complete' &&
      document.readyState !== 'interactive'
    ) {
      console.log(
        'DOM não está pronto, agendando configuração da UI para mais tarde'
      );
      document.addEventListener('DOMContentLoaded', setupAssistantUI);
      return false;
    }

    // Verificar se os elementos existem no DOM
    const digitalAssistant = document.getElementById('digital-assistant');

    if (!digitalAssistant) {
      console.warn(
        '⚠️ Elemento principal do assistente não encontrado. A UI será configurada mais tarde.'
      );
      // Tentar novamente em 1 segundo
      setTimeout(setupAssistantUI, 1000);
      return false;
    }

    // Inicialmente ocultar o assistente
    digitalAssistant.style.display = 'none';
    digitalAssistant.classList.add('hidden');

    // Configurar event listeners
    setupEventListeners();

    // Configurar elementos arrastáveis
    makeAssistantDraggable();

    console.log('🎨 Interface do assistente configurada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao configurar a UI do assistente:', error);
    return false;
  }
}

/**
 * Configura os event listeners para o assistente
 */
function setupEventListeners() {
  // Elementos do assistente
  const assistantToggle = document.getElementById('assistant-toggle');
  const assistantDialog = document.getElementById('assistant-dialog');
  const closeBtn = document.getElementById('close-assistant-dialog');
  const sendBtn = document.getElementById('assistant-send-btn');
  const voiceBtn = document.getElementById('assistant-voice-btn');
  const textInput = document.getElementById('assistant-input-field');

  // Verificar elementos críticos
  if (!assistantToggle) {
    console.error('Botão de toggle do assistente não encontrado!');
    return;
  }

  // Botão toggle para abrir/fechar o diálogo
  assistantToggle.addEventListener('click', () => {
    console.log('Botão do assistente clicado');
    toggleAssistantDialog();
  });

  // Botão para fechar o diálogo
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      console.log('Botão fechar clicado');
      hideAssistantDialog();
    });
  }

  // Botão de envio de mensagem
  if (sendBtn && textInput) {
    sendBtn.addEventListener('click', () => {
      const message = textInput.value.trim();
      if (message) {
        sendMessage(message);
        textInput.value = '';
      }
    });
  }

  // Envio de mensagem com Enter
  if (textInput) {
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

  // Botão de entrada de voz
  if (voiceBtn) {
    voiceBtn.addEventListener('click', handleVoiceInput);
  }

  console.log('Event listeners do assistente configurados');
}

/**
 * Alterna a visibilidade do diálogo do assistente
 */
function toggleAssistantDialog() {
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
 * Mostra indicador de digitação
 */
function showTypingIndicator() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Verificar se já existe um indicador
  let typingIndicator = document.querySelector('.typing-indicator');

  if (!typingIndicator) {
    typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingIndicator);
  }

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Atualizar estado
  assistantStateManager.set('isTyping', true);
}

/**
 * Esconde indicador de digitação
 */
function hideTypingIndicator() {
  const typingIndicator = document.querySelector('.typing-indicator');

  if (typingIndicator) {
    typingIndicator.remove();
  }

  // Atualizar estado
  assistantStateManager.set('isTyping', false);
}

/**
 * Mostra indicador de escuta para entrada de voz
 */
function showListeningIndicator() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Verificar se já existe um indicador
  let listeningIndicator = document.querySelector('.listening-indicator');

  if (!listeningIndicator) {
    listeningIndicator = document.createElement('div');
    listeningIndicator.className = 'listening-indicator';
    listeningIndicator.innerHTML =
      '<div class="listening-pulse"></div>Ouvindo...';
    messagesContainer.appendChild(listeningIndicator);
  }

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Esconde indicador de escuta
 */
function hideListeningIndicator() {
  const listeningIndicator = document.querySelector('.listening-indicator');

  if (listeningIndicator) {
    listeningIndicator.remove();
  }

  // Atualizar estado
  assistantStateManager.set('isListening', false);
}

/**
 * Torna o assistente arrastável
 */
function makeAssistantDraggable() {
  const assistantContainer = document.getElementById('digital-assistant');
  const assistantToggle = document.getElementById('assistant-toggle');

  if (!assistantContainer || !assistantToggle) return;

  let offsetX,
    offsetY,
    isDragging = false;

  // Função para iniciar arrasto
  const startDrag = (e) => {
    // Apenas arrastar pelo botão de toggle, não pelo diálogo
    if (e.target !== assistantToggle && !assistantToggle.contains(e.target)) {
      return;
    }

    isDragging = true;

    // Obter posição inicial
    offsetX = e.clientX - assistantContainer.getBoundingClientRect().left;
    offsetY = e.clientY - assistantContainer.getBoundingClientRect().top;

    // Prevenir seleção de texto durante arrasto
    document.body.style.userSelect = 'none';
  };

  // Função para arrastar
  const drag = (e) => {
    if (!isDragging) return;

    // Atualizar posição
    assistantContainer.style.left = `${e.clientX - offsetX}px`;
    assistantContainer.style.top = `${e.clientY - offsetY}px`;
    assistantContainer.style.transform = 'none'; // Remover centralização
  };

  // Função para finalizar arrasto
  const endDrag = () => {
    isDragging = false;
    document.body.style.userSelect = '';
  };

  // Adicionar event listeners
  assistantToggle.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
}

/**
 * Verifica se o assistente deve ser mostrado em um ponto de interesse
 * @param {Object} coordinates - Coordenadas do ponto de interesse
 * @param {string} name - Nome do ponto
 */
function checkAutoShowAtPoint(coordinates, name) {
  // Verificar se a funcionalidade está ativada
  if (!assistantStateManager.get('settings').autoShowAtPoints) {
    return false;
  }

  // Verificar se o assistente já está ativo
  if (assistantStateManager.get('isActive')) {
    return false;
  }

  // Escolher uma chance aleatória de aparecer (50%)
  const shouldShow = Math.random() > 0.5;

  if (shouldShow) {
    console.log(`Mostrando assistente automaticamente em: ${name}`);

    // Definir local escolhido
    const localEscolhido =
      LOCAIS_MORRO.find(
        (local) =>
          local.nome === name ||
          (local.coords.lat.toFixed(4) === coordinates.lat.toFixed(4) &&
            local.coords.lng.toFixed(4) === coordinates.lng.toFixed(4))
      ) || LOCAIS_MORRO[0];

    // Mostrar com animação
    showAssistantWithAnimation();

    return true;
  }

  return false;
}

/**
 * Retorna a tradução adequada para mensagens do assistente
 * @param {string} key - Chave para tradução
 * @param {Object} params - Parâmetros para substituição na string traduzida
 * @returns {string} - Texto traduzido
 */
function getTranslation(key, params = {}) {
  const lang = assistantStateManager.get('selectedLanguage');

  // Verificar função do sistema de tradução
  if (typeof getGeneralText === 'function') {
    return getGeneralText(key, lang, params);
  }

  // Traduções padrão caso o sistema de i18n não esteja disponível
  const translations = {
    pt: {
      welcome: 'Olá, seja bem-vindo a Morro de São Paulo Digital!',
      first_visit: 'É sua primeira visita a Morro de São Paulo?',
      yes: 'Sim',
      no: 'Não',
      ask_help: 'Como posso ajudar você?',
      welcome_back: 'Bem-vindo de volta! Como posso ajudar hoje?',
    },
    en: {
      welcome: 'Hello, welcome to Digital Morro de São Paulo!',
      first_visit: 'Is this your first visit to Morro de São Paulo?',
      yes: 'Yes',
      no: 'No',
      ask_help: 'How can I help you?',
      welcome_back: 'Welcome back! How can I help you today?',
    },
  };

  // Verificar se temos a tradução para esta chave
  if (translations[lang] && translations[lang][key]) {
    let text = translations[lang][key];

    // Substituir parâmetros
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{${param}}`, value);
    }

    return text;
  }

  // Fallback para inglês
  if (translations.en[key]) {
    return translations.en[key];
  }

  // Fallback final: retornar a própria chave
  return key;
}
