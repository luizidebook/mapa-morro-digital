/**
 * Sistema de Assistente Virtual para Morro de São Paulo Digital
 * Versão: 1.0.0
 * Este módulo implementa um assistente virtual interativo com suporte a múltiplos idiomas
 * e funcionalidades de conversação contextual.
 */

// Variáveis para armazenar funções importadas dinamicamente
let initializeBridge;
let selectedLanguage = 'pt'; // Valor padrão
let getGeneralText;

// Carregar dependências de forma dinâmica para evitar falhas de importação
Promise.all([
  import('../assistenteBridge/assistantBridge.js')
    .then((module) => {
      initializeBridge = module.initializeBridge;
      console.log('Módulo bridge carregado com sucesso');
    })
    .catch((error) => {
      console.warn('Não foi possível carregar o módulo bridge:', error);
    }),

  import('../core/config.js')
    .then((module) => {
      selectedLanguage = module.selectedLanguage || 'pt';
      console.log('Módulo de configuração carregado com sucesso');
    })
    .catch((error) => {
      console.warn(
        'Não foi possível carregar o módulo de configuração:',
        error
      );
    }),

  import('../i18n/language.js')
    .then((module) => {
      getGeneralText = module.getGeneralText;
      console.log('Módulo de idiomas carregado com sucesso');
    })
    .catch((error) => {
      console.warn('Não foi possível carregar o módulo de idiomas:', error);
    }),
])
  .then(() => {
    console.log('Carregamento de dependências do assistente concluído');
  })
  .catch((error) => {
    console.warn('Algumas dependências não puderam ser carregadas:', error);
  });

// Implementação de fallback para showNotification se não estiver disponível
function showNotificationFallback(message, type = 'info') {
  console.log(`Notification (${type}): ${message}`);

  try {
    // Verificar se já existe um contêiner de notificações
    let notificationContainer = document.getElementById(
      'notification-container'
    );

    // Criar container se não existir
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notification-container';
      notificationContainer.style.position = 'fixed';
      notificationContainer.style.top = '10px';
      notificationContainer.style.right = '10px';
      notificationContainer.style.zIndex = '10000';
      document.body.appendChild(notificationContainer);
    }

    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<p>${message}</p>`;

    // Estilizar notificação
    notification.style.backgroundColor =
      type === 'error'
        ? '#ff5252'
        : type === 'warning'
          ? '#ffab40'
          : type === 'success'
            ? '#4caf50'
            : '#2196f3';
    notification.style.color = '#fff';
    notification.style.padding = '12px 16px';
    notification.style.margin = '8px 0';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.transition = 'all 0.3s ease';

    // Adicionar ao container
    notificationContainer.appendChild(notification);

    // Remover após 5 segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();

        // Remover container se não tiver mais notificações
        if (notificationContainer.children.length === 0) {
          notificationContainer.remove();
        }
      }, 300);
    }, 5000);
  } catch (e) {
    console.error('Erro ao mostrar notificação fallback:', e);
  }
}

// Tentar importar showNotification, com fallback se falhar
let showNotification;
try {
  // Tentar importar a função original
  import('../ui/notifications.js')
    .then((module) => {
      showNotification = module.showNotification;
      console.log('Módulo de notificações carregado com sucesso');
    })
    .catch((error) => {
      console.warn(
        'Não foi possível importar o módulo de notificações, usando fallback:',
        error
      );
      showNotification = showNotificationFallback;
    });
} catch (e) {
  console.warn(
    'Erro ao importar notificações, usando implementação de fallback'
  );
  showNotification = showNotificationFallback;
}

// Definir fallback caso a importação falhe
const currentLanguage =
  typeof selectedLanguage !== 'undefined' ? selectedLanguage : 'pt';

// Verificar se as dependências estão disponíveis
function checkDependencies() {
  console.log('Verificando dependências do assistente...');

  // Adicionando explicitamente showNotification se ainda não estiver definido
  if (typeof showNotification !== 'function') {
    console.warn('Definindo showNotification como fallback');
    showNotification = showNotificationFallback;
  }

  // Verificar getGeneralText
  if (typeof getGeneralText !== 'function') {
    console.warn(
      'Função getGeneralText não encontrada. Funcionalidade de idiomas pode ser limitada.'
    );
  }

  return true;
}

// Verificar dependências ao inicializar
setTimeout(checkDependencies, 100);

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

    // Inicializar o bridge com a mesma instância do mapa
    if (typeof initializeBridge === 'function') {
      console.log('Inicializando bridge do assistente...');
      window.assistantBridge = initializeBridge(map);

      // Configurar manipulador para quando ponte for inicializada
      if (window.assistantBridge) {
        setupMapEventListeners();

        // Definir função auxiliar para mostrar recursos no mapa
        window.showMapFeature = function (featureType, options = {}) {
          try {
            if (!window.assistantBridge || !window.assistantBridge.map) {
              console.warn('Bridge não inicializado para mostrar recursos');
              return false;
            }

            switch (featureType) {
              case 'tour_agencies':
                return window.assistantBridge.map.addMarkersByCategory(
                  'agencias-turismo',
                  { highlight: true, zoom: options.zoom !== false }
                );
              case 'beaches':
                return window.assistantBridge.map.addMarkersByCategory(
                  'praias',
                  { highlight: true, zoom: options.zoom !== false }
                );
              case 'restaurants':
                return window.assistantBridge.map.addMarkersByCategory(
                  'restaurantes',
                  { highlight: true, zoom: options.zoom !== false }
                );
              case 'accommodations':
                return window.assistantBridge.map.addMarkersByCategory(
                  'hospedagem',
                  { highlight: true, zoom: options.zoom !== false }
                );
              case 'tours':
                return window.assistantBridge.map.addMarkersByCategory(
                  'passeios',
                  { highlight: true, zoom: options.zoom !== false }
                );
              default:
                console.warn(`Tipo de recurso desconhecido: ${featureType}`);
                return false;
            }
          } catch (error) {
            console.error('Erro ao mostrar recurso no mapa:', error);
            return false;
          }
        };
      }
    } else {
      console.warn('Bridge do assistente não encontrado ou não disponível');
    }

    // Configurar a UI
    const setupAndShow = () => {
      setupAssistantUI();

      // Determinar se deve mostrar o assistente automaticamente
      const shouldShowAutomatically = options.showAutomatically !== false;

      if (shouldShowAutomatically) {
        console.log(
          'Mostrando assistente automaticamente após inicialização...'
        );

        // Usar um pequeno delay para garantir que a UI esteja pronta
        setTimeout(() => {
          // Verificar se deve mostrar com animação ou de forma simples
          if (
            options.useAnimation !== false &&
            assistantStateManager.get('settings').showAnimations
          ) {
            showAssistantWithAnimation();
          } else {
            showAssistant();
          }

          // Verificar se há histórico de conversas
          const messagesContainer =
            document.getElementById('assistant-messages');
          if (
            messagesContainer &&
            (!messagesContainer.hasChildNodes() ||
              messagesContainer.children.length === 0)
          ) {
            // Mostrar mensagem de boas-vindas inicial
            showWelcomeMessage();
          }
        }, 500);
      }
    };

    // Executar setup e exibição se o DOM já estiver carregado
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      setupAndShow();
    } else {
      window.addEventListener('DOMContentLoaded', setupAndShow);
    }

    // Ao final da inicialização bem-sucedida, disparar evento
    const initEvent = new CustomEvent('AssistantInitialized', { detail: api });
    document.dispatchEvent(initEvent);

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
 * Mostra a mensagem de boas-vindas inicial do assistente
 * Essa função é chamada quando o assistente é aberto e o container de mensagens está vazio
 */
function showWelcomeMessage() {
  try {
    // Verificar o idioma atual
    const currentLanguage =
      assistantStateManager.get('selectedLanguage') || 'pt';
    const isFirstTime = assistantStateManager.get('firstTimeVisitor');

    // Obter a mensagem de boas-vindas apropriada
    const welcomeText = getWelcomeText(currentLanguage, isFirstTime);

    // Mostrar indicador de digitação para simular assistente pensando
    showTypingIndicator();

    // Após um pequeno delay, mostrar a mensagem de boas-vindas
    setTimeout(() => {
      hideTypingIndicator();

      // Adicionar mensagem ao DOM
      addMessageToDOM(welcomeText, 'assistant');

      // Adicionar ao histórico
      addMessageToHistory(welcomeText, 'assistant');

      // Se for primeiro acesso, mostrar botões de escolha
      if (assistantStateManager.get('firstTimeVisitor')) {
        setTimeout(showFirstTimeOptions, 500);

        // Atualizar estado para indicar que estamos esperando resposta
        assistantStateManager.set('awaitingFirstTimeResponse', true);
      } else {
        // Para usuários recorrentes, mostrar opções gerais após um delay
        setTimeout(() => {
          showMainOptions();
        }, 1000);
      }

      // Salvar estado para persistir o histórico
      assistantStateManager.save();
    }, 1000);

    return true;
  } catch (error) {
    console.error('Erro ao mostrar mensagem de boas-vindas:', error);
    return false;
  }
}

/**
 * Obtém o texto de boas-vindas apropriado com base no idioma e se é primeira visita
 * @param {string} language - Código do idioma (pt, en, es, he)
 * @param {boolean} isFirstTime - Se é primeira visita
 * @returns {string} - Texto de boas-vindas apropriado
 */
function getWelcomeText(language = 'pt', isFirstTime = true) {
  // Verificar se a função de tradução existe
  if (typeof getGeneralText === 'function') {
    try {
      // Tentar obter do sistema de tradução
      const key = isFirstTime
        ? 'assistant_welcome_first'
        : 'assistant_welcome_return';
      const text = getGeneralText(key, language);
      if (text && text !== key) return text;
    } catch (e) {
      console.warn('Erro ao obter texto traduzido:', e);
    }
  }

  // Textos de fallback para cada idioma
  const welcomeTexts = {
    pt: {
      first:
        'Olá! Seja bem-vindo a Morro de São Paulo! Sou seu assistente virtual e posso ajudar com informações sobre praias, restaurantes, hospedagem e atrações. É sua primeira vez aqui?',
      return:
        'Olá novamente! Que bom ver você de volta ao Morro de São Paulo! Como posso ajudar hoje?',
    },
    en: {
      first:
        "Hello! Welcome to Morro de São Paulo! I'm your virtual assistant and I can help with information about beaches, restaurants, accommodation and attractions. Is this your first time here?",
      return:
        "Hello again! It's good to see you back in Morro de São Paulo! How can I help you today?",
    },
    es: {
      first:
        '¡Hola! ¡Bienvenido a Morro de São Paulo! Soy tu asistente virtual y puedo ayudarte con información sobre playas, restaurantes, alojamiento y atracciones. ¿Es tu primera vez aquí?',
      return:
        '¡Hola de nuevo! ¡Es bueno verte de vuelta en Morro de São Paulo! ¿Cómo puedo ayudarte hoy?',
    },
    he: {
      first:
        'שלום! ברוך הבא למורו דה סאו פאולו! אני העוזר הווירטואלי שלך ואני יכול לעזור עם מידע על חופים, מסעדות, מקומות לינה ואטרקציות. האם זו הפעם הראשונה שלך כאן?',
      return:
        'שלום שוב! טוב לראות אותך חוזר למורו דה סאו פאולו! איך אני יכול לעזור לך היום?',
    },
  };

  // Usar o idioma solicitado ou PT como fallback
  const texts = welcomeTexts[language] || welcomeTexts.pt;
  return isFirstTime ? texts.first : texts.return;
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

      try {
        // Verificar se devemos mostrar a saudação
        const messagesContainer = document.getElementById('assistant-messages');

        if (!messagesContainer) {
          console.error('Container de mensagens não encontrado!');
          return false;
        }

        if (
          !messagesContainer.hasChildNodes() ||
          messagesContainer.children.length === 0
        ) {
          console.log('Container de mensagens vazio, mostrando boas-vindas');

          // Verificar se a função existe antes de chamar
          if (typeof showWelcomeMessage === 'function') {
            showWelcomeMessage();
          } else {
            // Fallback caso a função não exista
            console.warn(
              'Função showWelcomeMessage não encontrada, usando alternativa'
            );

            // Usar showGreeting com um local aleatório como alternativa
            const localEscolhido = escolherLocalAleatorio();
            showGreeting(localEscolhido);
          }
        } else {
          console.log('Container de mensagens já contém conteúdo');
        }

        return true;
      } catch (error) {
        console.error('Erro ao processar notifyOpened:', error);
        return false;
      }
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

    /**
     * Inicializa/reinicializa o assistente com parâmetros corretos
     */
    initialize: function () {
      console.log('Inicialização explícita do assistente');

      // Definir estado de inicialização
      assistantStateManager.set('initialized', true);

      // Atualizar objeto de compatibilidade
      if (window.assistantState) {
        window.assistantState.initialized = true;
      }

      // Persistir mudança no estado
      assistantStateManager.save();

      console.log('Assistente inicializado com sucesso');
      return true;
    },
  };
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
 * Configura evento de clique para o botão do assistente
 * Essa função é chamada após o carregamento do DOM
 */
function setupAssistantToggleButton() {
  try {
    const assistantToggle = document.getElementById('assistant-toggle');

    if (!assistantToggle) {
      console.error('❌ Botão de toggle do assistente não encontrado no DOM!');

      // Tentar novamente após um tempo, caso o botão seja adicionado dinamicamente
      setTimeout(setupAssistantToggleButton, 1000);
      return;
    }

    console.log(
      '🔄 Configurando evento de clique para o botão do assistente...'
    );

    // Remover eventos antigos, se existirem, para evitar duplicações
    assistantToggle.removeEventListener('click', toggleAssistantDialogHandler);

    // Adicionar novo evento de clique
    assistantToggle.addEventListener('click', toggleAssistantDialogHandler);

    console.log(
      '✅ Evento de clique para o botão do assistente configurado com sucesso'
    );
  } catch (error) {
    console.error(
      'Erro ao configurar evento de clique para o botão do assistente:',
      error
    );
  }
}

/**
 * Handler para o evento de clique no botão do assistente
 * Separado para facilitar a remoção do evento quando necessário
 */
function toggleAssistantDialogHandler() {
  console.log('🔔 Botão do assistente clicado');
  toggleAssistantDialog();
}

// Configurar o evento depois que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', setupAssistantToggleButton);

// Também configurar quando o assistente for inicializado
document.addEventListener('AssistantInitialized', () => {
  console.log('Evento de inicialização do assistente detectado');
  setupAssistantToggleButton();
});

// Garantir que o botão seja configurado mesmo se o DOM já estiver carregado
if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  setupAssistantToggleButton();
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
 * Processa e envia uma mensagem para o assistente
 * @param {string} message - Mensagem a ser processada
 * @returns {boolean} - Indica se a mensagem foi processada com sucesso
 */
function sendMessage(message) {
  try {
    // Validar input
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.warn('Tentativa de enviar mensagem vazia para o assistente');
      return false;
    }

    message = message.trim();
    console.log('Processando mensagem:', message);

    // Adicionar mensagem do usuário ao DOM e histórico
    addMessageToDOM(message, 'user');
    addMessageToHistory(message, 'user');

    // Mostrar indicador de digitação enquanto processa
    showTypingIndicator();

    // Verificar se estamos esperando resposta de primeira visita
    if (assistantStateManager.get('awaitingFirstTimeResponse')) {
      processFirstTimeResponse(message);
      return true;
    }

    // Processar palavras-chave conhecidas
    if (processKeywords(message)) {
      return true;
    }

    // Processar a mensagem semanticamente baseado em intenção
    processMessageIntent(message);

    return true;
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    hideTypingIndicator();

    // Resposta de fallback em caso de erro
    const errorMessage =
      'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    addMessageToDOM(errorMessage, 'assistant');
    addMessageToHistory(errorMessage, 'assistant');

    return false;
  }
}

/**
 * Processa a resposta do usuário sobre ser primeira visita
 * @param {string} message - Mensagem do usuário
 */
function processFirstTimeResponse(message) {
  // Normalizar para comparação
  const normalizedMsg = message.toLowerCase();

  // Verificar se a resposta parece ser "sim"
  const isPositive =
    normalizedMsg.includes('sim') ||
    normalizedMsg.includes('primeira') ||
    normalizedMsg.includes('yes') ||
    normalizedMsg.includes('first');

  // Remover indicador de digitação
  hideTypingIndicator();

  // Atualizar estado
  assistantStateManager.set('awaitingFirstTimeResponse', false);
  assistantStateManager.set('firstTimeVisitor', isPositive);

  // Tratar como se o usuário tivesse clicado no botão correspondente
  handleFirstVisitResponse(isPositive);
}

/**
 * Processa a intenção da mensagem quando não há palavras-chave
 * @param {string} message - Mensagem a ser processada
 */
function processMessageIntent(message) {
  // Aqui seria ideal usar um modelo de NLP para entender a intenção
  // Na ausência disso, usamos uma abordagem heurística simples

  setTimeout(() => {
    hideTypingIndicator();

    // Verificar cumprimentos
    if (isGreeting(message)) {
      const greetingResponse =
        'Olá! Como posso ajudar você a aproveitar Morro de São Paulo? Posso falar sobre praias, restaurantes, hospedagem ou passeios!';
      addMessageToDOM(greetingResponse, 'assistant');
      addMessageToHistory(greetingResponse, 'assistant');
      return;
    }

    // Resposta genérica quando não entendemos a intenção
    const genericResponse =
      'Entendi. Posso ajudar com informações sobre praias, restaurantes, hospedagem e passeios em Morro de São Paulo. O que você gostaria de saber?';
    addMessageToDOM(genericResponse, 'assistant');
    addMessageToHistory(genericResponse, 'assistant');

    // Mostrar opções para ajudar o usuário
    setTimeout(() => {
      const optionsMessage =
        'Você pode me perguntar, por exemplo:\n- Quais são as melhores praias?\n- Onde comer comida típica?\n- Onde ficar hospedado?\n- Quais passeios fazer?';
      addMessageToDOM(optionsMessage, 'assistant');
      addMessageToHistory(optionsMessage, 'assistant');
    }, 1000);
  }, 1500);
}

/**
 * Verifica se a mensagem é um cumprimento
 * @param {string} message - Mensagem a verificar
 * @returns {boolean} - Verdadeiro se for cumprimento
 */
function isGreeting(message) {
  const normalizedMsg = message.toLowerCase();
  const greetings = [
    'oi',
    'olá',
    'ola',
    'hello',
    'hi',
    'hey',
    'bom dia',
    'boa tarde',
    'boa noite',
    'good morning',
    'good afternoon',
    'good evening',
    'hola',
    'tudo bem',
    'como vai',
  ];

  return greetings.some((greeting) => normalizedMsg.includes(greeting));
}

/**
 * Processa pedido de informações sobre praias
 * @param {string} message - Mensagem normalizada do usuário
 */
function processBeachRequest(message) {
  // Identificar qual praia específica, se mencionada
  let specificBeach = null;
  const beaches = {
    primeira: 'Primeira Praia',
    segunda: 'Segunda Praia',
    terceira: 'Terceira Praia',
    quarta: 'Quarta Praia',
    'primeira praia': 'Primeira Praia',
    'segunda praia': 'Segunda Praia',
    'terceira praia': 'Terceira Praia',
    'quarta praia': 'Quarta Praia',
    first: 'Primeira Praia',
    second: 'Segunda Praia',
    third: 'Terceira Praia',
    fourth: 'Quarta Praia',
  };

  for (const [keyword, beachName] of Object.entries(beaches)) {
    if (message.includes(keyword)) {
      specificBeach = beachName;
      break;
    }
  }

  setTimeout(() => {
    hideTypingIndicator();

    // Usar o bridge para destacar as praias no mapa
    if (window.assistantBridge && window.assistantBridge.map) {
      if (specificBeach) {
        // Destacar praia específica mencionada
        window.assistantBridge.map.focusOn(
          specificBeach.toLowerCase().replace(/\s+/g, '-'),
          {
            zoom: 16,
            highlight: true,
          }
        );
      } else {
        // Destacar todas as praias
        window.assistantBridge.map.addMarkersByCategory('praias', {
          highlight: true,
          cluster: true,
        });
      }
    }

    if (specificBeach) {
      // Fornecer informações sobre a praia específica
      const beachInfo = getBeachInfo(specificBeach);
      addMessageToDOM(beachInfo, 'assistant');
      addMessageToHistory(beachInfo, 'assistant');

      // Mostrar opções para esta praia
      setTimeout(() => {
        showBeachOptions();
      }, 1000);
    } else {
      // Fornecer informações gerais sobre praias
      const beachesOverview =
        'Morro de São Paulo tem 4 praias principais numeradas, cada uma com seu charme especial. A Primeira Praia é próxima da vila, a Segunda Praia tem muita animação, a Terceira Praia é mais tranquila e a Quarta Praia é a mais preservada. Qual delas você gostaria de conhecer?';
      addMessageToDOM(beachesOverview, 'assistant');
      addMessageToHistory(beachesOverview, 'assistant');

      // Mostrar opções de praias
      setTimeout(() => {
        showBeachOptions();
      }, 1000);
    }
  }, 1500);
}

/**
 * Obtém informações sobre uma praia específica
 * @param {string} beachName - Nome da praia
 * @returns {string} - Informações sobre a praia
 */
function getBeachInfo(beachName) {
  // Verificar primeiro se temos dados detalhados do bridge
  if (window.assistantBridge && window.assistantBridge.content) {
    const beachId = beachName.toLowerCase().replace(/\s+/g, '-');
    const beachData = window.assistantBridge.content.getDetails(beachId);

    if (beachData) {
      // Usar dados do bridge se disponíveis
      return `${beachName}: ${beachData.description}\n\n${beachData.additionalInfo || ''}`;
    }
  }

  // Fallback para dados estáticos se o bridge não retornar informações
  const beachInfoMap = {
    'Primeira Praia':
      'A Primeira Praia é a mais próxima da vila e do píer. É pequena e com águas calmas, ótima para mergulho. Por ser próxima ao centro, é também a mais movimentada e tem menos estrutura de quiosques.',
    'Segunda Praia':
      'A Segunda Praia é a mais badalada de Morro de São Paulo. Aqui você encontra diversos bares, restaurantes e muita animação. É perfeita para quem gosta de agito, música e prática de esportes como altinha e vôlei.',
    'Terceira Praia':
      'A Terceira Praia tem águas calmas e mornas, ideal para famílias com crianças. Possui boa infraestrutura de restaurantes e pousadas, mas é mais tranquila que a Segunda Praia. Ótima para quem quer equilíbrio entre conforto e tranquilidade.',
    'Quarta Praia':
      'A Quarta Praia é a mais preservada e tranquila das praias numeradas. Com longa faixa de areia e piscinas naturais formadas na maré baixa, é perfeita para quem busca sossego e contato com a natureza. Tem menos estrutura, mas uma beleza natural impressionante.',
  };

  return (
    beachInfoMap[beachName] ||
    `Desculpe, não tenho informações detalhadas sobre ${beachName}.`
  );
}

/**
 * Mostra opções de praias para o usuário
 */
function showBeachOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Adicionar botões para cada praia
  const beaches = [
    'Primeira Praia',
    'Segunda Praia',
    'Terceira Praia',
    'Quarta Praia',
  ];

  beaches.forEach((beach) => {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.textContent = beach;
    button.onclick = () => {
      // Adicionar mensagem como se o usuário tivesse digitado
      addMessageToDOM(beach, 'user');
      addMessageToHistory(beach, 'user');

      // Remover os botões
      optionsContainer.remove();

      // Processar como uma solicitação sobre essa praia
      processBeachRequest(beach.toLowerCase());
    };

    optionsContainer.appendChild(button);
  });

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa pedido de informações sobre comida/restaurantes
 * @param {string} message - Mensagem normalizada do usuário
 */
function processFoodRequest(message) {
  setTimeout(() => {
    hideTypingIndicator();

    // Usar o bridge para destacar restaurantes no mapa
    if (window.assistantBridge && window.assistantBridge.map) {
      window.assistantBridge.map.addMarkersByCategory('restaurantes', {
        highlight: true,
        cluster: true,
      });
    }

    // Resposta sobre restaurantes
    const foodInfo =
      'Morro de São Paulo tem ótimas opções gastronômicas! Você encontra desde restaurantes requintados até opções mais simples e aconchegantes. A especialidade local são os frutos do mar, principalmente a moqueca baiana, mas também há ótimas opções de comida internacional.';
    addMessageToDOM(foodInfo, 'assistant');
    addMessageToHistory(foodInfo, 'assistant');

    // Mostrar opções de comida
    setTimeout(() => {
      showFoodOptions();
    }, 1000);
  }, 1500);
}

/**
 * Mostra opções de comida/restaurantes para o usuário
 */
function showFoodOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Adicionar botões para categorias de comida
  const foodCategories = [
    'Frutos do Mar',
    'Comida Baiana',
    'Comida Internacional',
    'Restaurantes na Praia',
  ];

  foodCategories.forEach((category) => {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.textContent = category;
    button.onclick = () => {
      // Adicionar mensagem como se o usuário tivesse digitado
      addMessageToDOM(`Me fale sobre ${category}`, 'user');
      addMessageToHistory(`Me fale sobre ${category}`, 'user');

      // Remover os botões
      optionsContainer.remove();

      // Processar solicitação sobre esta categoria
      processFoodCategoryRequest(category);
    };

    optionsContainer.appendChild(button);
  });

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa pedido de informações sobre categoria específica de comida
 * @param {string} category - Categoria de comida
 */
function processFoodCategoryRequest(category) {
  // Mostrar indicador de digitação
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();

    // Informações específicas para cada categoria
    let responseText = '';

    switch (category) {
      case 'Frutos do Mar':
        responseText =
          'Os frutos do mar são a especialidade de Morro de São Paulo! Você encontra moquecas deliciosas, lagostas, camarões, peixe grelhado fresco e outras delícias. Os restaurantes na Segunda e Terceira Praias são os mais recomendados para frutos do mar.';
        break;
      case 'Comida Baiana':
        responseText =
          'A culinária baiana é um dos destaques de Morro! Você pode experimentar acarajé, vatapá, caruru, moquecas, e outros pratos típicos. O tempero baiano é único, com dendê, pimenta e muito sabor!';
        break;
      case 'Comida Internacional':
        responseText =
          'Morro de São Paulo também tem boas opções de culinária internacional. Há restaurantes italianos, pizzarias, japoneses e até mesmo opções vegetarianas e veganas para atender a todos os gostos.';
        break;
      case 'Restaurantes na Praia':
        responseText =
          'Os restaurantes à beira-mar são uma experiência única em Morro! Na Segunda Praia, você encontra opções com música ao vivo e ambiente animado. Na Terceira Praia, há restaurantes mais tranquilos com vista para o mar. A maioria oferece mesas diretamente na areia.';
        break;
      default:
        responseText =
          'Vou te dar mais informações sobre restaurantes em Morro de São Paulo. A maioria se concentra na Segunda e Terceira Praias, com opções para todos os gostos e bolsos.';
    }

    // Adicionar resposta
    addMessageToDOM(responseText, 'assistant');
    addMessageToHistory(responseText, 'assistant');

    // Perguntar se quer recomendações específicas
    setTimeout(() => {
      const followupQuestion =
        'Gostaria de recomendações específicas de restaurantes em Morro de São Paulo?';
      addMessageToDOM(followupQuestion, 'assistant');
      addMessageToHistory(followupQuestion, 'assistant');

      // Mostrar botões de sim/não
      showYesNoOptions('restaurant_recommendations');
    }, 1000);
  }, 1500);
}

/**
 * Processa pedido de informações sobre hospedagem
 * @param {string} message - Mensagem normalizada do usuário
 */
function processAccommodationRequest(message) {
  setTimeout(() => {
    hideTypingIndicator();

    // Usar o bridge para destacar hospedagens no mapa
    if (window.assistantBridge && window.assistantBridge.map) {
      window.assistantBridge.map.addMarkersByCategory('hospedagem', {
        highlight: true,
        cluster: true,
      });
    }

    // Resposta sobre hospedagem
    const accommodationInfo =
      'Morro de São Paulo oferece hospedagem para todos os gostos e bolsos, desde albergues econômicos até pousadas e hotéis de luxo. A localização varia entre o centro da vila (mais próximo da vida noturna) e praias mais afastadas (mais tranquilas).';
    addMessageToDOM(accommodationInfo, 'assistant');
    addMessageToHistory(accommodationInfo, 'assistant');

    // Mostrar opções de hospedagem
    setTimeout(() => {
      showAccommodationOptions();
    }, 1000);
  }, 1500);
}

/**
 * Mostra opções de hospedagem para o usuário
 */
function showAccommodationOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Adicionar botões para tipos de hospedagem
  const accommodationTypes = [
    'Pousadas de Luxo',
    'Pousadas Econômicas',
    'Hostels',
    'Melhor Localização',
  ];

  accommodationTypes.forEach((type) => {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.textContent = type;
    button.onclick = () => {
      // Adicionar mensagem como se o usuário tivesse digitado
      addMessageToDOM(`Me fale sobre ${type}`, 'user');
      addMessageToHistory(`Me fale sobre ${type}`, 'user');

      // Remover os botões
      optionsContainer.remove();

      // Processar solicitação sobre este tipo de hospedagem
      processAccommodationTypeRequest(type);
    };

    optionsContainer.appendChild(button);
  });

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa pedido de informações sobre tipo específico de hospedagem
 * @param {string} type - Tipo de hospedagem
 */
function processAccommodationTypeRequest(type) {
  // Mostrar indicador de digitação
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();

    // Informações específicas para cada tipo
    let responseText = '';

    switch (type) {
      case 'Pousadas de Luxo':
        responseText =
          'Morro de São Paulo tem excelentes pousadas de luxo, principalmente na Terceira e Quarta Praias. Elas oferecem piscina, café da manhã gourmet, vistas deslumbrantes para o mar e serviço de primeira. Os preços variam de R$400 a R$1500 por noite, dependendo da temporada.';
        break;
      case 'Pousadas Econômicas':
        responseText =
          'Se você busca bom custo-benefício, há ótimas pousadas econômicas na vila e próximas à Segunda Praia. Elas oferecem conforto básico, boa localização e preços entre R$150 e R$300 por noite. Algumas incluem café da manhã.';
        break;
      case 'Hostels':
        responseText =
          'Os hostels de Morro são excelentes para quem viaja sozinho ou quer conhecer pessoas. Concentrados principalmente na vila, oferecem quartos compartilhados a partir de R$50 e quartos privativos a partir de R$120. Muitos têm ambiente descontraído e atividades em grupo.';
        break;
      case 'Melhor Localização':
        responseText =
          'A melhor localização depende do que você busca. Para vida noturna e agito, fique na Segunda Praia ou na vila. Para tranquilidade com boa estrutura, a Terceira Praia é ideal. Para isolamento e natureza, a Quarta Praia é perfeita, mas fica mais distante do centro.';
        break;
      default:
        responseText =
          'Além das opções tradicionais de hospedagem, Morro de São Paulo também conta com casas e apartamentos para aluguel por temporada, ideais para grupos e famílias que desejam mais privacidade e a possibilidade de cozinhar.';
    }

    // Adicionar resposta
    addMessageToDOM(responseText, 'assistant');
    addMessageToHistory(responseText, 'assistant');

    // Perguntar se quer ajuda para reservar
    setTimeout(() => {
      const followupQuestion =
        'Gostaria de saber como fazer reservas ou receber recomendações específicas de hospedagem?';
      addMessageToDOM(followupQuestion, 'assistant');
      addMessageToHistory(followupQuestion, 'assistant');

      // Mostrar botões de sim/não
      showYesNoOptions('accommodation_booking');
    }, 1000);
  }, 1500);
}

/**
 * Processa pedido de informações sobre passeios
 * @param {string} message - Mensagem normalizada do usuário
 */
function processTourRequest(message) {
  setTimeout(() => {
    hideTypingIndicator();

    // Usar o bridge para destacar pontos de passeios no mapa
    if (window.assistantBridge && window.assistantBridge.map) {
      window.assistantBridge.map.addMarkersByCategory('passeios', {
        highlight: true,
        cluster: true,
      });
    }

    // Resposta sobre passeios
    const tourInfo =
      'Morro de São Paulo oferece diversos passeios incríveis! Você pode fazer o passeio de volta à ilha, visitar a piscina natural de Garapuá, conhecer a Ilha de Boipeba, fazer trilhas até o Farol ou a Ponta do Morro, ou fazer um passeio de barco para observar golfinhos.';
    addMessageToDOM(tourInfo, 'assistant');
    addMessageToHistory(tourInfo, 'assistant');

    // Adicionar mais informações sobre os passeios
    setTimeout(() => {
      const moreInfo =
        'Os passeios mais populares são:\n- Volta à ilha (4 horas)\n- Piscina natural de Garapuá (dia inteiro)\n- Ilha de Boipeba (dia inteiro)\n- Trilha do Farol (2 horas)\n- Mergulho com snorkel (2-3 horas)';
      addMessageToDOM(moreInfo, 'assistant');
      addMessageToHistory(moreInfo, 'assistant');

      // Mostrar opções de passeios
      setTimeout(() => {
        showTourOptions();
      }, 1000);
    }, 2000);
  }, 1500);
}

/**
 * Mostra opções de passeios para o usuário
 */
function showTourOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Adicionar botões para tipos de passeios
  const tourTypes = [
    'Volta à ilha',
    'Piscina de Garapuá',
    'Ilha de Boipeba',
    'Trilha do Farol',
    'Mergulho',
  ];

  tourTypes.forEach((type) => {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.textContent = type;
    button.onclick = () => {
      // Adicionar mensagem como se o usuário tivesse digitado
      addMessageToDOM(`Me conte sobre o passeio: ${type}`, 'user');
      addMessageToHistory(`Me conte sobre o passeio: ${type}`, 'user');

      // Remover os botões
      optionsContainer.remove();

      // Processar solicitação sobre este tipo de passeio
      processTourTypeRequest(type);
    };

    optionsContainer.appendChild(button);
  });

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa pedido de informações sobre tipo específico de passeio
 * @param {string} type - Tipo de passeio
 */
function processTourTypeRequest(type) {
  // Mostrar indicador de digitação
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();

    // Informações específicas para cada tipo de passeio
    let responseText = '';

    switch (type) {
      case 'Volta à ilha':
        responseText =
          'O passeio de volta à ilha é um dos mais populares de Morro de São Paulo. Com duração aproximada de 4 horas, você conhece todas as praias da ilha em um barco. Há paradas para banho em águas cristalinas e pontos de interesse como a Piscina Natural e a Praia do Encanto. O passeio geralmente custa entre R$70 e R$100 por pessoa.';
        break;
      case 'Piscina de Garapuá':
        responseText =
          'O passeio para a Piscina Natural de Garapuá é um dos mais bonitos. Você visitará uma praia paradisíaca e a incrível piscina natural formada por recifes de corais. O passeio dura o dia inteiro, inclui almoço e custa aproximadamente R$120 a R$150 por pessoa. A água cristalina e os peixinhos coloridos tornam este passeio inesquecível.';
        break;
      case 'Ilha de Boipeba':
        responseText =
          'A excursão para a Ilha de Boipeba é perfeita para quem busca praias ainda mais desertas e preservadas. O passeio dura o dia inteiro, passando por várias praias e a vila de Boipeba. Custa entre R$130 e R$180 por pessoa, geralmente incluindo almoço. A ilha é menos turística e oferece uma experiência mais autêntica.';
        break;
      case 'Trilha do Farol':
        responseText =
          'A trilha até o Farol do Morro é uma ótima opção para quem gosta de caminhadas. Com duração aproximada de 2 horas (ida e volta), você será recompensado com uma vista panorâmica incrível de toda a ilha. A trilha tem dificuldade moderada e recomenda-se ir pela manhã ou final da tarde para evitar o calor intenso. É gratuita ou custa muito pouco se você contratar um guia.';
        break;
      case 'Mergulho':
        responseText =
          'Os passeios de mergulho com snorkel são uma excelente forma de conhecer a vida marinha local. Com duração de 2-3 horas, você visita pontos específicos ao redor da ilha com águas claras e abundância de peixes coloridos. O custo varia de R$80 a R$120, incluindo equipamento. Para mergulho com cilindro, existem operadoras certificadas na Segunda Praia.';
        break;
      default:
        responseText =
          'Além dos passeios mais populares, Morro de São Paulo também oferece passeios de caiaque, stand-up paddle, cavalo, quadriciclo e passeios noturnos de barco. Cada um proporciona uma perspectiva diferente deste paraíso.';
    }

    // Adicionar resposta
    addMessageToDOM(responseText, 'assistant');
    addMessageToHistory(responseText, 'assistant');

    // Perguntar se quer ajuda para reservar
    setTimeout(() => {
      const followupQuestion =
        'Gostaria de saber como reservar este passeio ou conhecer outras opções?';
      addMessageToDOM(followupQuestion, 'assistant');
      addMessageToHistory(followupQuestion, 'assistant');

      // Mostrar botões de opções
      showTourBookingOptions(type);
    }, 1000);
  }, 1500);
}

/**
 * Mostra opções para reserva de passeios
 * @param {string} tourType - Tipo de passeio
 */
function showTourBookingOptions(tourType) {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Botão para reservar
  const bookButton = document.createElement('button');
  bookButton.className = 'action-button';
  bookButton.textContent = 'Quero reservar';
  bookButton.onclick = () => {
    // Adicionar mensagem como se o usuário tivesse digitado
    addMessageToDOM('Quero reservar este passeio', 'user');
    addMessageToHistory('Quero reservar este passeio', 'user');

    // Remover os botões
    optionsContainer.remove();

    // Processar pedido de reserva
    processTourBookingRequest(tourType);
  };

  // Botão para ver mais opções
  const moreOptionsButton = document.createElement('button');
  moreOptionsButton.className = 'action-button';
  moreOptionsButton.textContent = 'Ver mais passeios';
  moreOptionsButton.onclick = () => {
    // Adicionar mensagem como se o usuário tivesse digitado
    addMessageToDOM('Quero ver mais opções de passeios', 'user');
    addMessageToHistory('Quero ver mais opções de passeios', 'user');

    // Remover os botões
    optionsContainer.remove();

    // Mostrar todas as opções novamente
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      showTourOptions();
    }, 1000);
  };

  // Botão para ver preços
  const pricesButton = document.createElement('button');
  pricesButton.className = 'action-button';
  pricesButton.textContent = 'Ver preços';
  pricesButton.onclick = () => {
    // Adicionar mensagem como se o usuário tivesse digitado
    addMessageToDOM('Qual o preço deste passeio?', 'user');
    addMessageToHistory('Qual o preço deste passeio?', 'user');

    // Remover os botões
    optionsContainer.remove();

    // Processar pedido de informação sobre preços
    processTourPriceRequest(tourType);
  };

  // Adicionar botões ao container
  optionsContainer.appendChild(bookButton);
  optionsContainer.appendChild(moreOptionsButton);
  optionsContainer.appendChild(pricesButton);

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa pedido de reserva de passeio
 * @param {string} tourType - Tipo de passeio
 */
function processTourBookingRequest(tourType) {
  // Mostrar indicador de digitação
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();

    // Resposta sobre como reservar
    const bookingInfo = `Para reservar o passeio "${tourType}", você tem várias opções:\n\n1. Reservar diretamente nas agências de turismo na Segunda Praia\n2. Pedir na recepção da sua pousada\n3. Reservar online através dos sites de parceiros\n\nDeseja que eu mostre no mapa onde ficam as principais agências de turismo?`;
    addMessageToDOM(bookingInfo, 'assistant');
    addMessageToHistory(bookingInfo, 'assistant');

    // Mostrar botões de sim/não para mostrar no mapa
    showYesNoOptions('show_tour_agencies_map');
  }, 1500);
}

/**
 * Processa pedido de informação sobre preços de passeio
 * @param {string} tourType - Tipo de passeio
 */
function processTourPriceRequest(tourType) {
  // Mostrar indicador de digitação
  showTypingIndicator();

  // Preços aproximados de cada passeio
  const prices = {
    'Volta à ilha': 'R$70 a R$100 por pessoa',
    'Piscina de Garapuá': 'R$120 a R$150 por pessoa (inclui almoço)',
    'Ilha de Boipeba': 'R$130 a R$180 por pessoa (geralmente inclui almoço)',
    'Trilha do Farol': 'Gratuito ou R$30 a R$50 com guia local',
    Mergulho:
      'R$80 a R$120 para snorkel, R$180 a R$250 para mergulho com cilindro',
  };

  setTimeout(() => {
    hideTypingIndicator();

    // Resposta com informações de preço
    const priceInfo = `O passeio "${tourType}" custa aproximadamente ${prices[tourType] || 'R$80 a R$150 por pessoa, dependendo da duração e inclusões'}.\n\nOs preços podem variar conforme a temporada (alta/baixa) e o tamanho do grupo. Geralmente é possível negociar descontos para grupos ou pacotes com múltiplos passeios.`;
    addMessageToDOM(priceInfo, 'assistant');
    addMessageToHistory(priceInfo, 'assistant');

    // Perguntar se o usuário quer reservar
    setTimeout(() => {
      const followupQuestion =
        'Gostaria de reservar este passeio ou ver outras opções?';
      addMessageToDOM(followupQuestion, 'assistant');
      addMessageToHistory(followupQuestion, 'assistant');

      // Mostrar botões para reserva ou mais opções
      showTourBookingOptions(tourType);
    }, 1000);
  }, 1500);
}

/**
 * Processa pedido de ajuda ou tutorial
 */
function processHelpRequest() {
  setTimeout(() => {
    hideTypingIndicator();

    // Resposta sobre ajuda
    const helpInfo =
      'Posso ajudar você a explorar Morro de São Paulo! Você pode me perguntar sobre:';
    addMessageToDOM(helpInfo, 'assistant');
    addMessageToHistory(helpInfo, 'assistant');

    // Lista de tópicos de ajuda
    setTimeout(() => {
      const topics =
        '1. Praias e pontos turísticos\n2. Restaurantes e gastronomia\n3. Hospedagem e acomodações\n4. Passeios e atividades\n5. Dicas práticas (transporte, clima, etc)\n6. Como usar o mapa interativo';
      addMessageToDOM(topics, 'assistant');
      addMessageToHistory(topics, 'assistant');

      // Mostrar botões para categorias de ajuda
      setTimeout(() => {
        showHelpOptions();
      }, 1000);
    }, 1000);
  }, 1500);
}

/**
 * Exibe galeria de imagens relacionadas ao local
 * @param {string} localName - Nome do local
 */
function showLocationGallery(localName) {
  try {
    // Verificar se a função existe
    if (typeof startCarousel === 'function') {
      startCarousel(localName);

      // Registrar interação
      if (window.assistantBridge && window.assistantBridge.analytics) {
        window.assistantBridge.analytics.logInteraction('gallery_view', {
          location: localName,
        });
      }

      return true;
    } else {
      console.warn('Função startCarousel não disponível');
      return false;
    }
  } catch (error) {
    console.error('Erro ao exibir galeria:', error);
    return false;
  }
}

/**
 * Mapeia termos mencionados pelo usuário para categorias específicas do mapa
 */
const categoryMapping = {
  // Praias
  praia: 'praias',
  praias: 'praias',
  mar: 'praias',
  areia: 'praias',

  // Restaurantes
  restaurante: 'restaurantes',
  restaurantes: 'restaurantes',
  comida: 'restaurantes',
  comer: 'restaurantes',
  jantar: 'restaurantes',
  almoçar: 'restaurantes',

  // Hospedagem
  hotel: 'hospedagem',
  hostel: 'hospedagem',
  pousada: 'hospedagem',
  hospedagem: 'hospedagem',
  ficar: 'hospedagem',
  dormir: 'hospedagem',

  // Passeios
  passeio: 'passeios',
  passeios: 'passeios',
  visitar: 'passeios',
  trilha: 'passeios',
  excursão: 'passeios',
  tour: 'passeios',

  // Transporte
  barco: 'transporte',
  lancha: 'transporte',
  táxi: 'transporte',
  transporte: 'transporte',

  // Serviços
  banco: 'servicos',
  caixa: 'servicos',
  farmácia: 'servicos',
  hospital: 'servicos',
  médico: 'servicos',
  serviço: 'servicos',
};

/**
 * Processa palavras-chave conhecidas na mensagem
 * @param {string} message - Mensagem a ser processada
 * @returns {boolean} - Se encontrou palavras-chave
 */
function processKeywords(message) {
  // Normalizar para minúsculas
  const normalizedMessage = message.toLowerCase();

  // Verificar se há menção a locais no mapa
  const mentionedCategories = new Set();

  // Encontrar todas as categorias mencionadas na mensagem
  for (const [term, category] of Object.entries(categoryMapping)) {
    if (normalizedMessage.includes(term)) {
      mentionedCategories.add(category);
    }
  }

  // Se encontrou categorias, usar o bridge para mostrar no mapa
  if (
    mentionedCategories.size > 0 &&
    window.assistantBridge &&
    window.assistantBridge.map
  ) {
    // Registrar no analytics
    if (window.assistantBridge.analytics) {
      window.assistantBridge.analytics.logInteraction('map_category_request', {
        categories: Array.from(mentionedCategories),
        message: normalizedMessage,
      });
    }

    // Para cada categoria mencionada, destacar no mapa
    mentionedCategories.forEach((category) => {
      window.assistantBridge.map.addMarkersByCategory(category, {
        highlight: true,
        cluster: true,
      });
    });
  }

  // Continuar com o processamento normal para respostas específicas

  // Verificar cumprimentos
  if (isGreeting(normalizedMessage)) {
    const greetingResponse =
      'Olá! Como posso ajudar você a aproveitar Morro de São Paulo? Posso falar sobre praias, restaurantes, hospedagem ou passeios!';
    addMessageToDOM(greetingResponse, 'assistant');
    addMessageToHistory(greetingResponse, 'assistant');
    return true;
  }

  // Verificar pedidos específicos
  if (
    normalizedMessage.includes('praia') ||
    normalizedMessage.includes('praias')
  ) {
    processBeachRequest(normalizedMessage);
    return true;
  }

  if (
    normalizedMessage.includes('restaurante') ||
    normalizedMessage.includes('comida') ||
    normalizedMessage.includes('comer')
  ) {
    processFoodRequest(normalizedMessage);
    return true;
  }

  if (
    normalizedMessage.includes('hotel') ||
    normalizedMessage.includes('pousada') ||
    normalizedMessage.includes('hosped')
  ) {
    processAccommodationRequest(normalizedMessage);
    return true;
  }

  if (
    normalizedMessage.includes('passeio') ||
    normalizedMessage.includes('tour') ||
    normalizedMessage.includes('visita')
  ) {
    processTourRequest(normalizedMessage);
    return true;
  }

  if (
    normalizedMessage.includes('ajuda') ||
    normalizedMessage.includes('tutorial') ||
    normalizedMessage.includes('como usar')
  ) {
    processHelpRequest();
    return true;
  }

  // Busca específica por locais
  if (window.assistantBridge && window.assistantBridge.content) {
    // Busca por locais específicos no conteúdo
    const searchResults = window.assistantBridge.content.search(
      normalizedMessage,
      {
        maxResults: 5,
        searchInCategories: [
          'praias',
          'restaurantes',
          'hospedagem',
          'passeios',
          'servicos',
        ],
      }
    );

    if (searchResults && searchResults.length > 0) {
      // Encontrou resultados específicos
      setTimeout(() => {
        hideTypingIndicator();

        const resultsMessage = `Encontrei alguns lugares que podem te interessar:`;
        addMessageToDOM(resultsMessage, 'assistant');
        addMessageToHistory(resultsMessage, 'assistant');

        // Exibir os resultados encontrados
        setTimeout(() => {
          const formattedResults = searchResults
            .map(
              (result) =>
                `- ${result.name} (${result.category}): ${result.description.substring(0, 100)}...`
            )
            .join('\n\n');
          addMessageToDOM(formattedResults, 'assistant');
          addMessageToHistory(formattedResults, 'assistant');

          // Destacar resultados no mapa
          window.assistantBridge.map.highlight(
            searchResults.map((result) => result.id),
            {
              zoom: searchResults.length === 1 ? 16 : 14,
            }
          );
        }, 500);
      }, 1000);

      return true;
    }
  }

  // Nenhuma palavra-chave conhecida encontrada
  return false;
}

/**
 * Mostra opções de categorias de ajuda
 */
function showHelpOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return false;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Adicionar botões para categorias de ajuda
  const helpCategories = [
    'Praias',
    'Gastronomia',
    'Hospedagem',
    'Passeios',
    'Dicas práticas',
    'Como usar o mapa',
  ];

  helpCategories.forEach((category) => {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.textContent = category;
    button.onclick = () => {
      // Adicionar mensagem como se o usuário tivesse digitado
      addMessageToDOM(`Preciso de ajuda com ${category}`, 'user');
      addMessageToHistory(`Preciso de ajuda com ${category}`, 'user');

      // Remover os botões
      optionsContainer.remove();

      // Processar categoria de ajuda específica
      processHelpCategoryRequest(category);
    };

    optionsContainer.appendChild(button);
  });

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa pedido de ajuda para categoria específica
 * @param {string} category - Categoria de ajuda
 */
function processHelpCategoryRequest(category) {
  // Mostrar indicador de digitação
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();

    let helpText = '';
    let nextAction = null;

    // Texto de ajuda específico para cada categoria
    switch (category) {
      case 'Praias':
        helpText =
          'Morro de São Paulo tem 4 praias principais numeradas sequencialmente (Primeira, Segunda, Terceira e Quarta). Cada uma tem características distintas:\n\n- Primeira Praia: Pequena, perto da vila, boa para mergulho\n- Segunda Praia: Animada, cheia de bares e restaurantes\n- Terceira Praia: Equilíbrio entre estrutura e tranquilidade\n- Quarta Praia: Mais deserta e preservada';
        nextAction = () => showBeachOptions();
        break;
      case 'Gastronomia':
        helpText =
          'A gastronomia de Morro de São Paulo é rica e variada. Frutos do mar são a especialidade local, com destaque para moquecas, peixe grelhado e camarão. Você encontra desde restaurantes requintados até opções mais simples e baratas. Na Segunda Praia, os restaurantes são mais animados, enquanto na Terceira são mais tranquilos.';
        nextAction = () => showFoodOptions();
        break;
      case 'Hospedagem':
        helpText =
          'Para hospedagem, Morro oferece opções que vão desde hostels econômicos (a partir de R$50) até pousadas de luxo (R$1500+). A melhor localização depende do que você busca: na vila ou Segunda Praia para quem quer agito, na Terceira para equilíbrio, e na Quarta para quem busca isolamento.';
        nextAction = () => showAccommodationOptions();
        break;
      case 'Passeios':
        helpText =
          'Há diversos passeios imperdíveis em Morro: volta à ilha, visita à piscina natural de Garapuá, excursão para Boipeba, trilha do Farol, e mergulho com snorkel. Os passeios custam entre R$70 e R$180 e podem ser reservados nas agências da Segunda Praia ou na recepção da sua pousada.';
        nextAction = () => showTourOptions();
        break;
      case 'Dicas práticas':
        helpText =
          'Dicas práticas para Morro de São Paulo:\n\n1. Não há carros na ilha, prepare-se para caminhar\n2. Leve dinheiro em espécie, nem todos os lugares aceitam cartão\n3. Use protetor solar e repelente\n4. Verifique a tabela de marés para passeios\n5. Leve calçados adequados para trilhas\n6. Fique atento ao horário do último barco de volta caso esteja em passeio';
        nextAction = () => showPracticalTipsOptions();
        break;
      case 'Como usar o mapa':
        helpText =
          "Para usar o mapa interativo:\n\n1. Toque nos ícones para ver informações sobre pontos de interesse\n2. Use os botões + e - para zoom\n3. Arraste para navegar pelo mapa\n4. Clique em 'Como Chegar' para traçar rotas\n5. Use o menu lateral para filtrar categorias\n6. Toque no botão de localização para centralizar no seu ponto atual";
        nextAction = () => startTutorial();
        break;
      default:
        helpText =
          'Posso te ajudar com informações sobre praias, gastronomia, hospedagem, passeios, dicas práticas e como usar o mapa. Por favor, escolha uma das opções para que eu possa dar informações mais específicas.';
        nextAction = () => showHelpOptions();
    }

    // Exibir texto de ajuda
    addMessageToDOM(helpText, 'assistant');
    addMessageToHistory(helpText, 'assistant');

    // Ação seguinte, se houver
    if (nextAction) {
      setTimeout(nextAction, 1000);
    }
  }, 1500);
}

/**
 * Mostra opções para dicas práticas
 */
function showPracticalTipsOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Adicionar botões para tipos de dicas práticas
  const tipTypes = ['Transporte', 'Clima', 'Dinheiro', 'Segurança', 'Saúde'];

  tipTypes.forEach((type) => {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.textContent = type;
    button.onclick = () => {
      // Adicionar mensagem como se o usuário tivesse digitado
      addMessageToDOM(`Dicas sobre ${type}`, 'user');
      addMessageToHistory(`Dicas sobre ${type}`, 'user');

      // Remover os botões
      optionsContainer.remove();

      // Processar pedido de dica específica
      processPracticalTipRequest(type);
    };

    optionsContainer.appendChild(button);
  });

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa pedido de dica prática específica
 * @param {string} tipType - Tipo de dica prática
 */
function processPracticalTipRequest(tipType) {
  // Mostrar indicador de digitação
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();

    // Informações específicas para cada tipo de dica
    let tipText = '';

    switch (tipType) {
      case 'Transporte':
        tipText =
          'Dicas de transporte para Morro de São Paulo:\n\n1. Não há carros na ilha, apenas tratores para transporte de bagagem\n2. Da vila até a Quarta Praia, são cerca de 30 minutos caminhando\n3. Para bagagens pesadas, há serviço de carregadores na chegada\n4. Entre Salvador e Morro, o trajeto mais rápido é o catamarã (2h15)\n5. Também é possível chegar via Valença, com travessia de balsa e lancha\n6. Reserve passagens de volta com antecedência em alta temporada';
        break;
      case 'Clima':
        tipText =
          'Sobre o clima em Morro de São Paulo:\n\n1. A temperatura média anual é de 25°C\n2. Alta temporada: dezembro a março e julho (mais quente e animado)\n3. Baixa temporada: abril a junho, agosto a novembro (mais tranquilo e preços menores)\n4. Temporada de chuvas: abril a junho (pode chover parte do dia, mas raramente o dia todo)\n5. Verifique a tabela de marés para planejar passeios e caminhadas na praia';
        break;
      case 'Dinheiro':
        tipText =
          'Dicas sobre dinheiro em Morro de São Paulo:\n\n1. Leve dinheiro em espécie, nem todos os lugares aceitam cartão\n2. Há poucos caixas eletrônicos na ilha e podem ficar sem dinheiro na alta temporada\n3. Estabelecimentos maiores aceitam cartões, mas alguns cobram taxa adicional\n4. Preços sobem consideravelmente durante a alta temporada (30-50% mais)\n5. Reserve um orçamento extra para passeios e atrações não planejadas\n6. Na baixa temporada, é possível negociar bons descontos';
        break;
      case 'Segurança':
        tipText =
          'Dicas de segurança em Morro de São Paulo:\n\n1. A ilha é geralmente segura, mas mantenha atenção normal\n2. Evite caminhar sozinho por trilhas desertas à noite\n3. Não deixe pertences sem supervisão na praia\n4. Guarde documentos e valores no cofre da pousada\n5. Cuidado com o mar em algumas praias que têm correntezas fortes\n6. Conheça a localização do posto médico (próximo ao campo de futebol na vila)';
        break;
      case 'Saúde':
        tipText =
          'Dicas de saúde para Morro de São Paulo:\n\n1. Use protetor solar (mínimo FPS 30) e reaplique frequentemente\n2. Hidrate-se bem, o clima é quente e úmido\n3. Use repelente, principalmente ao entardecer\n4. Há um posto de saúde na vila para emergências simples\n5. Casos mais graves são transferidos para Valença\n6. Traga medicamentos básicos (analgésicos, antialérgicos, etc)\n7. Verifique a procedência dos frutos do mar que consumir';
        break;
      default:
        tipText =
          'Além das dicas específicas, recomendo:\n\n1. Informe-se sobre horários de funcionamento de atrações\n2. Faça reservas antecipadas na alta temporada\n3. Respeite o meio ambiente e ajude a manter as praias limpas\n4. Não alimente animais silvestres\n5. Experimente a culinária local\n6. Participe da vida noturna na Segunda Praia';
    }

    // Exibir texto da dica
    addMessageToDOM(tipText, 'assistant');
    addMessageToHistory(tipText, 'assistant');

    // Perguntar se deseja mais dicas
    setTimeout(() => {
      const followupQuestion = 'Precisa de mais alguma dica específica?';
      addMessageToDOM(followupQuestion, 'assistant');
      addMessageToHistory(followupQuestion, 'assistant');

      // Mostrar botões para mais dicas ou outros assuntos
      showMoreTipsOptions();
    }, 1000);
  }, 1500);
}

/**
 * Mostra opções para mais dicas ou outros assuntos
 */
function showMoreTipsOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return false;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Botão para mais dicas
  const moreTipsButton = document.createElement('button');
  moreTipsButton.className = 'action-button';
  moreTipsButton.textContent = 'Mais dicas';
  moreTipsButton.onclick = () => {
    // Adicionar mensagem como se o usuário tivesse digitado
    addMessageToDOM('Sim, quero mais dicas', 'user');
    addMessageToHistory('Sim, quero mais dicas', 'user');

    // Remover os botões
    optionsContainer.remove();

    // Mostrar opções de dicas práticas
    showPracticalTipsOptions();
  };

  // Botão para outros assuntos
  const otherTopicsButton = document.createElement('button');
  otherTopicsButton.className = 'action-button';
  otherTopicsButton.textContent = 'Outros assuntos';
  otherTopicsButton.onclick = () => {
    // Adicionar mensagem como se o usuário tivesse digitado
    addMessageToDOM('Quero falar sobre outros assuntos', 'user');
    addMessageToHistory('Quero falar sobre outros assuntos', 'user');

    // Remover os botões
    optionsContainer.remove();

    // Mostrar indicador de digitação
    showTypingIndicator();

    setTimeout(() => {
      hideTypingIndicator();

      // Mostrar mensagem de transição
      const transitionMessage =
        'Claro! Posso ajudar com outros assuntos. Sobre o que você gostaria de saber?';
      addMessageToDOM(transitionMessage, 'assistant');
      addMessageToHistory(transitionMessage, 'assistant');

      // Mostrar opções principais
      setTimeout(() => {
        showMainOptions();
      }, 1000);
    }, 1500);
  };

  // Adicionar botões ao container
  optionsContainer.appendChild(moreTipsButton);
  optionsContainer.appendChild(otherTopicsButton);

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Mostra opções principais de interação
 */
function showMainOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return false;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Adicionar botões para principais categorias
  const mainCategories = [
    'Praias',
    'Restaurantes',
    'Hospedagem',
    'Passeios',
    'Dicas',
    'Mapa',
  ];

  mainCategories.forEach((category) => {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.textContent = category;
    button.onclick = () => {
      // Adicionar mensagem como se o usuário tivesse digitado
      addMessageToDOM(`Quero informações sobre ${category}`, 'user');
      addMessageToHistory(`Quero informações sobre ${category}`, 'user');

      // Remover os botões
      optionsContainer.remove();

      // Processar conforme a categoria
      switch (category) {
        case 'Praias':
          processBeachRequest('praias');
          break;
        case 'Restaurantes':
          processFoodRequest('restaurantes');
          break;
        case 'Hospedagem':
          processAccommodationRequest('hospedagem');
          break;
        case 'Passeios':
          processTourRequest('passeios');
          break;
        case 'Dicas':
          processHelpRequest();
          break;
        case 'Mapa':
          processMapRequest();
          break;
        default:
          processMessageIntent(`Informações sobre ${category}`);
      }
    };

    optionsContainer.appendChild(button);
  });

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa pedido de informações sobre o mapa
 */
function processMapRequest() {
  // Mostrar indicador de digitação
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();

    // Reset de marcadores no mapa para limpar visualização anterior
    if (window.assistantBridge && window.assistantBridge.map) {
      window.assistantBridge.map.clearHighlights();
    }

    // Informações sobre o mapa
    const mapInfo =
      'O mapa interativo de Morro de São Paulo permite que você explore a ilha facilmente. Você pode ver a localização de praias, restaurantes, pousadas, pontos turísticos e muito mais. Para usá-lo:';
    addMessageToDOM(mapInfo, 'assistant');
    addMessageToHistory(mapInfo, 'assistant');

    // Adicionar instruções de uso
    setTimeout(() => {
      const instructions =
        "1. Toque nos ícones para ver detalhes dos locais\n2. Use os botões + e - para aumentar/diminuir o zoom\n3. Deslize para navegar pelo mapa\n4. Use o menu lateral para filtrar por categorias\n5. Clique em 'Como Chegar' para traçar uma rota até o local escolhido\n6. Use o botão de localização para centralizar no seu ponto atual";
      addMessageToDOM(instructions, 'assistant');
      addMessageToHistory(instructions, 'assistant');

      // Oferecer tutorial
      setTimeout(() => {
        const offerTutorial =
          'Gostaria de iniciar um tutorial sobre como usar o mapa? Ou prefere que eu mostre alguma categoria específica no mapa?';
        addMessageToDOM(offerTutorial, 'assistant');
        addMessageToHistory(offerTutorial, 'assistant');

        // Mostrar opções específicas para o mapa
        showMapOptions();
      }, 1000);
    }, 1000);
  }, 1500);
}

/**
 * Mostra opções específicas para interação com o mapa
 */
function showMapOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return false;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Botão para tutorial do mapa
  const tutorialButton = document.createElement('button');
  tutorialButton.className = 'action-button';
  tutorialButton.textContent = 'Tutorial do Mapa';
  tutorialButton.onclick = () => {
    addMessageToDOM('Quero ver o tutorial do mapa', 'user');
    addMessageToHistory('Quero ver o tutorial do mapa', 'user');
    optionsContainer.remove();
    startTutorial();
  };

  // Botões para categorias principais
  const categories = [
    { name: 'Praias', value: 'praias' },
    { name: 'Restaurantes', value: 'restaurantes' },
    { name: 'Hospedagem', value: 'hospedagem' },
    { name: 'Passeios', value: 'passeios' },
  ];

  // Adicionar botão de tutorial
  optionsContainer.appendChild(tutorialButton);

  // Adicionar botões para cada categoria
  categories.forEach((category) => {
    const button = document.createElement('button');
    button.className = 'action-button';
    button.textContent = category.name;
    button.onclick = () => {
      addMessageToDOM(`Mostre ${category.name} no mapa`, 'user');
      addMessageToHistory(`Mostre ${category.name} no mapa`, 'user');
      optionsContainer.remove();

      if (window.assistantBridge && window.assistantBridge.map) {
        // Adicionar marcadores para a categoria
        window.assistantBridge.map.addMarkersByCategory(category.value, {
          highlight: true,
          cluster: true,
        });

        // Responder confirmando ação
        showTypingIndicator();
        setTimeout(() => {
          hideTypingIndicator();
          const confirmationMessage = `✓ Mostrando ${category.name.toLowerCase()} no mapa! Os marcadores estão em destaque.`;
          addMessageToDOM(confirmationMessage, 'assistant');
          addMessageToHistory(confirmationMessage, 'assistant');
        }, 1000);
      }
    };

    optionsContainer.appendChild(button);
  });

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Mostra botões de sim/não com contexto específico
 * @param {string} context - Contexto da pergunta
 */
function showYesNoOptions(context) {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return false;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Botão Sim
  const yesButton = document.createElement('button');
  yesButton.className = 'action-button';
  yesButton.textContent = 'Sim';
  yesButton.onclick = () => {
    // Adicionar mensagem como se o usuário tivesse digitado
    addMessageToDOM('Sim', 'user');
    addMessageToHistory('Sim', 'user');

    // Remover os botões
    optionsContainer.remove();

    // Processar resposta afirmativa conforme contexto
    processYesResponse(context);
  };

  // Botão Não
  const noButton = document.createElement('button');
  noButton.className = 'action-button';
  noButton.textContent = 'Não';
  noButton.onclick = () => {
    // Adicionar mensagem como se o usuário tivesse digitado
    addMessageToDOM('Não', 'user');
    addMessageToHistory('Não', 'user');

    // Remover os botões
    optionsContainer.remove();

    // Processar resposta negativa conforme contexto
    processNoResponse(context);
  };

  // Adicionar botões ao container
  optionsContainer.appendChild(yesButton);
  optionsContainer.appendChild(noButton);

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Processa resposta afirmativa conforme contexto
 * @param {string} context - Contexto da pergunta
 */
function processYesResponse(context) {
  // Mostrar indicador de digitação
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();

    // Processar conforme contexto
    switch (context) {
      case 'restaurant_recommendations':
        const restaurantRecommendations =
          'Ótimo! Aqui estão algumas recomendações de restaurantes em Morro de São Paulo:\n\n1. Restaurante do Gallo (Segunda Praia) - Ótimo para frutos do mar\n2. Dona Carmô (Vila) - Autêntica comida baiana\n3. O Beco (Vila) - Culinária italiana\n4. Sambass (Terceira Praia) - Ambiente à beira-mar com música ao vivo\n5. Restaurante da Pousada Minha Louca Paixão (Terceira Praia) - Gastronomia refinada com vista para o mar';
        addMessageToDOM(restaurantRecommendations, 'assistant');
        addMessageToHistory(restaurantRecommendations, 'assistant');
        break;

      case 'accommodation_booking':
        const bookingInfo =
          'Para fazer reservas de hospedagem, você tem várias opções:\n\n1. Sites como Booking.com, Airbnb e Hoteis.com oferecem várias opções\n2. Entrar em contato diretamente com as pousadas (geralmente consegue preços melhores)\n3. Agências de viagem que oferecem pacotes para Morro de São Paulo\n\nA melhor época para reservar é com 1-3 meses de antecedência, especialmente para alta temporada.';
        addMessageToDOM(bookingInfo, 'assistant');
        addMessageToHistory(bookingInfo, 'assistant');
        break;

      case 'show_tour_agencies_map':
        const mapPromise =
          'Vou mostrar no mapa as principais agências de turismo da Segunda Praia. Elas ficam concentradas próximo aos restaurantes principais.';
        addMessageToDOM(mapPromise, 'assistant');
        addMessageToHistory(mapPromise, 'assistant');

        // Simular ação de mostrar no mapa
        setTimeout(() => {
          const mapActionConfirmation =
            '✓ Pontos marcados no mapa! As agências estão destacadas com ícones azuis.';
          addMessageToDOM(mapActionConfirmation, 'assistant');
          addMessageToHistory(mapActionConfirmation, 'assistant');

          // Visualizar no mapa é uma ação externa, mas aqui estamos simulando
          if (typeof window.showMapFeature === 'function') {
            window.showMapFeature('tour_agencies');
          } else {
            console.log(
              'Função showMapFeature não disponível para mostrar agências no mapa'
            );
          }
        }, 1500);
        break;

      case 'start_map_tutorial':
        const tutorialStart =
          'Ótimo! Vou iniciar um tutorial sobre como usar o mapa interativo. Siga as instruções na tela.';
        addMessageToDOM(tutorialStart, 'assistant');
        addMessageToHistory(tutorialStart, 'assistant');

        // Iniciar tutorial
        startTutorial();
        break;

      default:
        const genericResponse =
          'Entendi que você está interessado! Vou te fornecer mais informações.';
        addMessageToDOM(genericResponse, 'assistant');
        addMessageToHistory(genericResponse, 'assistant');

        // Mostrar opções principais após resposta genérica
        setTimeout(() => {
          showMainOptions();
        }, 1000);
    }
  }, 1500);
}

/**
 * Processa resposta negativa conforme contexto
 * @param {string} context - Contexto da pergunta
 */
function processNoResponse(context) {
  // Mostrar indicador de digitação
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();

    // Processar conforme contexto
    switch (context) {
      case 'restaurant_recommendations':
        const foodResponse =
          'Sem problemas! Se precisar de recomendações de restaurantes mais tarde, é só me perguntar. Posso ajudar com outros assuntos?';
        addMessageToDOM(foodResponse, 'assistant');
        addMessageToHistory(foodResponse, 'assistant');

        // Mostrar opções principais
        setTimeout(() => {
          showMainOptions();
        }, 1000);
        break;

      case 'accommodation_booking':
        const accommodationResponse =
          'Tudo bem! Se decidir fazer uma reserva depois, estou à disposição para ajudar. Há algo mais que você gostaria de saber sobre hospedagem ou outros assuntos?';
        addMessageToDOM(accommodationResponse, 'assistant');
        addMessageToHistory(accommodationResponse, 'assistant');

        // Mostrar opções principais
        setTimeout(() => {
          showMainOptions();
        }, 1000);
        break;

      case 'show_tour_agencies_map':
        const agenciesResponse =
          'Sem problemas! As agências ficam principalmente na Segunda Praia, próximas aos restaurantes principais. Há algo mais que gostaria de saber sobre os passeios?';
        addMessageToDOM(agenciesResponse, 'assistant');
        addMessageToHistory(agenciesResponse, 'assistant');

        // Voltar para opções de passeios
        setTimeout(() => {
          showTourOptions();
        }, 1000);
        break;

      case 'start_map_tutorial':
        const tutorialResponse =
          'Sem problemas! Se precisar de ajuda com o mapa mais tarde, é só me perguntar. Posso ajudar com algo mais?';
        addMessageToDOM(tutorialResponse, 'assistant');
        addMessageToHistory(tutorialResponse, 'assistant');

        // Mostrar opções principais
        setTimeout(() => {
          showMainOptions();
        }, 1000);
        break;

      case 'map_tutorial_help':
        const helpResponse =
          'Sem problemas! Estou aqui para ajudar quando quiser explorar mais o mapa. O que você gostaria de conhecer em Morro de São Paulo?';
        addMessageToDOM(helpResponse, 'assistant');
        addMessageToHistory(helpResponse, 'assistant');

        // Mostrar opções principais
        setTimeout(() => {
          showMainOptions();
        }, 1000);
        break;

      default:
        const genericResponse =
          'Sem problemas! Estou aqui para ajudar quando precisar. Há algo mais em que eu possa ajudar?';
        addMessageToDOM(genericResponse, 'assistant');
        addMessageToHistory(genericResponse, 'assistant');

        // Mostrar opções principais
        setTimeout(() => {
          showMainOptions();
        }, 1000);
    }
  }, 1500);
}

/**
 * Adiciona uma mensagem ao DOM na interface do assistente
 * @param {string|Object} message - Mensagem a ser adicionada
 * @param {string} type - Tipo de mensagem ('user' ou 'assistant')
 * @param {boolean} isTemporary - Se a mensagem é temporária (como indicadores)
 */
function addMessageToDOM(message, type = 'assistant', isTemporary = false) {
  try {
    // Verificar se temos o container de mensagens
    const messagesContainer = document.getElementById('assistant-messages');
    if (!messagesContainer) {
      console.error('Container de mensagens não encontrado');
      return;
    }

    // Remover mensagens temporárias anteriores se necessário
    if (!isTemporary) {
      const tempMessages = messagesContainer.querySelectorAll('.temp-message');
      tempMessages.forEach((msg) => msg.remove());
    }

    // Converter objeto em string JSON formatada se for um objeto
    let messageText = message;
    if (typeof message === 'object') {
      try {
        messageText = JSON.stringify(message, null, 2);
      } catch (e) {
        messageText = 'Erro ao formatar objeto: ' + e.message;
      }
    }

    // Criar elemento de mensagem
    const messageElement = document.createElement('div');
    messageElement.className =
      type === 'user' ? 'user-message' : 'assistant-message';

    // Marcar como temporária se necessário
    if (isTemporary) {
      messageElement.classList.add('temp-message');
    }

    // Formatar links, se houver
    messageText = formatLinks(messageText);

    // Aplicar estilização adequada
    if (type === 'user') {
      messageElement.style.alignSelf = 'flex-end';
      messageElement.style.backgroundColor = '#0084ff';
      messageElement.style.color = 'white';
    } else {
      messageElement.style.alignSelf = 'flex-start';
      messageElement.style.backgroundColor = '#f1f0f0';
      messageElement.style.color = '#333';
    }

    // Estilização comum
    messageElement.style.padding = '10px 15px';
    messageElement.style.borderRadius = '18px';
    messageElement.style.margin = '5px 0';
    messageElement.style.maxWidth = '80%';
    messageElement.style.wordBreak = 'break-word';

    // Definir conteúdo HTML para preservar formatação e links
    messageElement.innerHTML = messageText;

    // Adicionar ao container
    messagesContainer.appendChild(messageElement);

    // Rolar para o final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Registrar no console
    console.log(`Mensagem do ${type}: ${messageText}`);

    return messageElement;
  } catch (error) {
    console.error('Erro ao adicionar mensagem ao DOM:', error);
    return null;
  }
}

/**
 * Formata texto para detectar e converter links em elementos clicáveis
 * @param {string} text - Texto a ser formatado
 * @returns {string} - Texto formatado com links HTML
 */
function formatLinks(text) {
  if (typeof text !== 'string') return text;

  // Regex para detectar URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Substituir URLs por links HTML
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #0366d6; text-decoration: underline;">${url}</a>`;
  });
}

/**
 * Adiciona uma mensagem ao histórico do assistente
 * @param {string|Object} message - Mensagem a ser adicionada
 * @param {string} type - Tipo de mensagem ('user' ou 'assistant')
 */
function addMessageToHistory(message, type = 'assistant') {
  try {
    // Obter histórico atual
    const history = assistantStateManager.get('history') || [];

    // Adicionar nova mensagem com timestamp
    history.push({
      message: message,
      type: type,
      timestamp: new Date().toISOString(),
    });

    // Limitar tamanho do histórico para evitar problemas de performance
    // Manter apenas as últimas 50 mensagens
    if (history.length > 50) {
      history.shift(); // Remove a mensagem mais antiga
    }

    // Atualizar estado
    assistantStateManager.set('history', history);

    // Atualizar timestamp da última interação
    assistantStateManager.set('lastInteractionTime', new Date());

    // Registrar no console apenas para debug
    console.log(`Mensagem adicionada ao histórico (${type})`);

    // Salvar estado apenas a cada 5 mensagens para não sobrecarregar o localStorage
    if (history.length % 5 === 0) {
      assistantStateManager.save();
    }
  } catch (error) {
    console.error('Erro ao adicionar mensagem ao histórico:', error);
  }
}

/**
 * Mostra indicador de digitação
 */
function showTypingIndicator() {
  try {
    const messagesContainer = document.getElementById('assistant-messages');
    if (!messagesContainer) return;

    // Remover indicador anterior se existir
    hideTypingIndicator();

    // Criar indicador
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';

    // Estilizar indicador
    typingIndicator.style.display = 'inline-block';
    typingIndicator.style.padding = '10px 15px';
    typingIndicator.style.backgroundColor = '#f1f1f1';
    typingIndicator.style.borderRadius = '15px';
    typingIndicator.style.margin = '5px 0';

    // Estilizar os pontos animados
    const dots = typingIndicator.querySelectorAll('span');
    dots.forEach((dot, index) => {
      dot.style.display = 'inline-block';
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = '#333';
      dot.style.margin = '0 3px';
      dot.style.animation = `typingAnimation 1.5s infinite ${index * 0.2}s`;
    });

    // Adicionar ao container
    messagesContainer.appendChild(typingIndicator);

    // Rolar para o final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Atualizar estado
    assistantStateManager.set('isTyping', true);
  } catch (error) {
    console.error('Erro ao mostrar indicador de digitação:', error);
  }
}

/**
 * Esconde indicador de digitação
 */
function hideTypingIndicator() {
  try {
    const typingIndicator = document.querySelector('.typing-indicator');

    if (typingIndicator) {
      typingIndicator.remove();
    }

    // Atualizar estado
    assistantStateManager.set('isTyping', false);
  } catch (error) {
    console.error('Erro ao esconder indicador de digitação:', error);
  }
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
    // Exibir mensagem de erro para o usuário
    addMessageToDOM(
      'Desculpe, tive um problema ao iniciar o tutorial. Vou ajudar você diretamente.',
      'assistant'
    );

    // Oferecer assistência direta
    setTimeout(() => {
      addMessageToDOM(
        'Posso responder suas perguntas sobre Morro de São Paulo. O que gostaria de saber?',
        'assistant'
      );
      addMessageToHistory(
        'Posso responder suas perguntas sobre Morro de São Paulo. O que gostaria de saber?',
        'assistant'
      );
    }, 1000);
  }
}

/**
 * Mostra tutorial interno simplificado
 */
function showInternalTutorial() {
  // Etapas do tutorial
  const tutorialSteps = [
    {
      message:
        'Seja bem-vindo ao tutorial do mapa de Morro de São Paulo! Vou mostrar como usar as principais funcionalidades.',
      delay: 2000,
    },
    {
      message:
        '1️⃣ Para navegar pelo mapa, basta arrastar com o dedo ou mouse. Para aumentar ou diminuir o zoom, use os botões + e - no canto superior direito.',
      delay: 3000,
    },
    {
      message:
        '2️⃣ Os ícones coloridos no mapa representam diferentes tipos de estabelecimentos e pontos de interesse:\n• 🔵 Azul - Praias e pontos turísticos\n• 🟢 Verde - Restaurantes\n• 🟠 Laranja - Hospedagem\n• 🟣 Roxo - Entretenimento e serviços',
      delay: 4000,
    },
    {
      message:
        "3️⃣ Toque em qualquer ícone para ver detalhes sobre o local. Uma janela de informações aparecerá com opções como 'Como Chegar', 'Fotos' e outras ações específicas.",
      delay: 3000,
    },
    {
      message:
        '4️⃣ Use o menu lateral (ícone ☰) para filtrar o que você quer ver no mapa. Você pode escolher mostrar apenas praias, restaurantes, hospedagem, etc.',
      delay: 3000,
    },
    {
      message:
        "5️⃣ Para traçar uma rota, toque em um ponto de interesse e selecione 'Como Chegar'. O mapa mostrará o melhor caminho a partir da sua localização atual.",
      delay: 3000,
    },
    {
      message:
        '6️⃣ O botão de localização (📍) centraliza o mapa na sua posição atual. Permita o acesso à sua localização quando solicitado para usar esta função.',
      delay: 3000,
    },
    {
      message:
        'Tutorial concluído! Agora você já sabe como usar o mapa interativo. Aproveite sua experiência em Morro de São Paulo! Há algo específico que você gostaria de encontrar no mapa?',
      delay: 2000,
    },
  ];

  // Iniciar exibição sequencial dos passos
  let stepIndex = 0;

  function showNextStep() {
    if (stepIndex < tutorialSteps.length) {
      const step = tutorialSteps[stepIndex];

      addMessageToDOM(step.message, 'assistant');
      addMessageToHistory(step.message, 'assistant');

      stepIndex++;

      if (stepIndex < tutorialSteps.length) {
        setTimeout(showNextStep, step.delay);
      } else {
        // Final do tutorial
        setTimeout(() => {
          showYesNoOptions('map_tutorial_help');
        }, step.delay);
      }
    }
  }

  // Iniciar o tutorial
  showNextStep();
}

/**
 * Processa entrada de voz
 * @returns {boolean} - Indica se o reconhecimento de voz foi inicializado com sucesso
 */
function handleVoiceInput() {
  // Verificar se o assistantStateManager existe e está inicializado
  if (!assistantStateManager) {
    console.error('Estado do assistente não inicializado');
    showNotification('Erro ao iniciar reconhecimento de voz', 'error');
    return false;
  }

  // Verificar suporte a reconhecimento de voz de forma mais robusta
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    console.error('API de reconhecimento de voz não suportada neste navegador');
    showNotification(
      'Seu navegador não suporta reconhecimento de voz',
      'error'
    );
    addMessageToDOM(
      'Desculpe, seu navegador não suporta reconhecimento de voz. Por favor, digite sua mensagem.',
      'assistant'
    );
    return false;
  }

  try {
    // Criar instância de reconhecimento de voz com verificação completa
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    if (!recognition) {
      throw new Error('Falha ao criar instância de reconhecimento de voz');
    }

    // Definir idioma com fallback seguro
    const userLanguage = assistantStateManager.get('selectedLanguage') || 'pt';

    // Mapear idioma para código de idioma apropriado para reconhecimento de voz
    const langMap = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
      he: 'he-IL',
    };

    recognition.lang = langMap[userLanguage] || 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    // Mostrar indicador visual de que o sistema está ouvindo
    showListeningIndicator();

    // Atualizar estado
    assistantStateManager.set('isListening', true);

    // Definir timeout de segurança caso o reconhecimento trave
    const recognitionTimeout = setTimeout(() => {
      if (assistantStateManager.get('isListening')) {
        recognition.stop();
        hideListeningIndicator();
        assistantStateManager.set('isListening', false);
        addMessageToDOM(
          'O tempo para reconhecimento de voz esgotou. Por favor, tente novamente.',
          'assistant'
        );
      }
    }, 10000); // 10 segundos de timeout

    // Evento quando o reconhecimento é finalizado com sucesso
    recognition.onresult = function (event) {
      clearTimeout(recognitionTimeout);

      // Verificar se temos resultados válidos
      if (
        event.results &&
        event.results.length > 0 &&
        event.results[0].length > 0
      ) {
        const speechResult = event.results[0][0].transcript;
        console.log('Texto reconhecido:', speechResult);

        // Esconder indicador de escuta
        hideListeningIndicator();
        assistantStateManager.set('isListening', false);

        // Processar o texto reconhecido se não estiver vazio
        if (speechResult && speechResult.trim()) {
          // Chamar sendMessage diretamente com o texto reconhecido
          // NÃO adicionar ao DOM aqui, deixar que sendMessage faça isso
          sendMessage(speechResult.trim());
        } else {
          addMessageToDOM(
            'Não consegui entender o que você disse. Pode tentar novamente?',
            'assistant'
          );
          addMessageToHistory(
            'Não consegui entender o que você disse. Pode tentar novamente?',
            'assistant'
          );
        }
      } else {
        hideListeningIndicator();
        assistantStateManager.set('isListening', false);
        addMessageToDOM(
          'Não consegui captar sua voz. Por favor, tente novamente.',
          'assistant'
        );
        addMessageToHistory(
          'Não consegui captar sua voz. Por favor, tente novamente.',
          'assistant'
        );
      }
    };

    // Tratar erros com mensagens claras para o usuário
    recognition.onerror = function (event) {
      clearTimeout(recognitionTimeout);
      console.error('Erro no reconhecimento de voz:', event.error);

      hideListeningIndicator();
      assistantStateManager.set('isListening', false);

      let errorMessage = 'Ocorreu um erro ao processar sua voz.';

      switch (event.error) {
        case 'no-speech':
          errorMessage =
            'Não detectei nenhuma fala. Por favor, verifique se seu microfone está funcionando e tente novamente.';
          break;
        case 'aborted':
          errorMessage = 'O reconhecimento de voz foi cancelado.';
          break;
        case 'audio-capture':
          errorMessage =
            'Não foi possível capturar áudio. Verifique se seu microfone está conectado e funcionando corretamente.';
          break;
        case 'not-allowed':
          errorMessage =
            'Permissão para usar o microfone foi negada. Por favor, permita o acesso ao microfone nas configurações do seu navegador.';
          break;
        case 'network':
          errorMessage =
            'Ocorreu um erro de rede. Verifique sua conexão com a internet.';
          break;
        case 'service-not-allowed':
          errorMessage =
            'O serviço de reconhecimento de voz não está disponível neste navegador ou dispositivo.';
          break;
        default:
          errorMessage = `Ocorreu um erro no reconhecimento de voz: ${event.error}`;
      }

      addMessageToDOM(errorMessage, 'assistant');
      addMessageToHistory(errorMessage, 'assistant');
    };

    // Evento quando o reconhecimento termina (com ou sem erro)
    recognition.onend = function () {
      clearTimeout(recognitionTimeout);

      // Garantir que o indicador de escuta seja removido
      hideListeningIndicator();
      assistantStateManager.set('isListening', false);

      console.log('Reconhecimento de voz finalizado');
    };

    // Iniciar reconhecimento com tratamento de exceções
    recognition.start();
    console.log('Reconhecimento de voz iniciado');

    // Indicar sucesso na inicialização
    return true;
  } catch (error) {
    console.error('Erro crítico ao iniciar o reconhecimento de voz:', error);

    // Garantir que o indicador seja removido em caso de erro
    hideListeningIndicator();
    assistantStateManager.set('isListening', false);

    // Informar o usuário sobre o erro
    addMessageToDOM(
      'Desculpe, houve um problema ao tentar reconhecer sua voz. Por favor, digite sua mensagem.',
      'assistant'
    );
    addMessageToHistory(
      'Desculpe, houve um problema ao tentar reconhecer sua voz. Por favor, digite sua mensagem.',
      'assistant'
    );

    return false;
  }
}

/**
 * Mostra indicador de escuta durante entrada de voz
 */
function showListeningIndicator() {
  try {
    const messagesContainer = document.getElementById('assistant-messages');
    if (!messagesContainer) return;

    // Criar indicador
    const listeningIndicator = document.createElement('div');
    listeningIndicator.className = 'listening-indicator';

    // Obter texto traduzido ou usar fallback
    const listeningText =
      typeof getGeneralText === 'function'
        ? getGeneralText(
            'assistant_listening',
            assistantStateManager.get('selectedLanguage')
          )
        : 'Escutando...';

    listeningIndicator.textContent = listeningText;

    // Estilizar indicador
    listeningIndicator.style.padding = '10px 15px';
    listeningIndicator.style.backgroundColor = '#e6f7ff';
    listeningIndicator.style.borderRadius = '15px';
    listeningIndicator.style.margin = '5px 0';
    listeningIndicator.style.color = '#0066cc';
    listeningIndicator.style.fontStyle = 'italic';

    // Adicionar ao container
    messagesContainer.appendChild(listeningIndicator);

    // Rolar para o final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    console.error('Erro ao mostrar indicador de escuta:', error);
  }
}

/**
 * Esconde indicador de escuta
 */
function hideListeningIndicator() {
  try {
    const listeningIndicator = document.querySelector('.listening-indicator');

    if (listeningIndicator) {
      listeningIndicator.remove();
    }
  } catch (error) {
    console.error('Erro ao esconder indicador de escuta:', error);
  }
}

/**
 * Configura escuta para eventos do mapa
 */
function setupMapEventListeners() {
  // Verificar se o sistema de eventos do bridge está disponível
  if (!window.assistantEvents) return;

  // Ouvir seleção de locais no mapa
  window.assistantEvents.on('mapLocationSelected', handleMapLocationSelection);
}

/**
 * Manipula evento de seleção de local no mapa
 * @param {Object} data - Dados do local selecionado
 */
function handleMapLocationSelection(data) {
  if (!data || !data.id) return;

  // Verificar se o assistente está visível
  if (!assistantStateManager.get('isVisible')) {
    // Se não estiver visível, mostrar
    showAssistant();
  }

  // Buscar informações detalhadas do local
  if (window.assistantBridge && window.assistantBridge.content) {
    const locationDetails = window.assistantBridge.content.getDetails(data.id);

    if (locationDetails) {
      // Adicionar mensagem informativa sobre o local selecionado
      setTimeout(() => {
        const message = `Você selecionou ${locationDetails.name}. Gostaria de mais informações sobre este local?`;
        addMessageToDOM(message, 'assistant');
        addMessageToHistory(message, 'assistant');

        // Mostrar opções para o local
        showLocationOptions(locationDetails);
      }, 500);
    }
  }
}

/**
 * Mostra opções para um local específico
 * @param {Object} location - Dados do local
 */
function showLocationOptions(location) {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return false;

  // Criar container para botões
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'message-actions';

  // Botão para detalhes
  const detailsButton = document.createElement('button');
  detailsButton.className = 'action-button';
  detailsButton.textContent = 'Ver Detalhes';
  detailsButton.onclick = () => {
    addMessageToDOM(`Quero saber mais sobre ${location.name}`, 'user');
    addMessageToHistory(`Quero saber mais sobre ${location.name}`, 'user');
    optionsContainer.remove();

    // Mostrar indicador de digitação
    showTypingIndicator();

    setTimeout(() => {
      hideTypingIndicator();

      // Mostrar descrição detalhada
      addMessageToDOM(location.description, 'assistant');
      addMessageToHistory(location.description, 'assistant');

      // Se houver informações adicionais, mostrar também
      if (location.additionalInfo) {
        setTimeout(() => {
          addMessageToDOM(location.additionalInfo, 'assistant');
          addMessageToHistory(location.additionalInfo, 'assistant');
        }, 1000);
      }
    }, 1500);
  };

  // Botão para fotos
  const photosButton = document.createElement('button');
  photosButton.className = 'action-button';
  photosButton.textContent = 'Ver Fotos';
  photosButton.onclick = () => {
    addMessageToDOM(`Quero ver fotos de ${location.name}`, 'user');
    addMessageToHistory(`Quero ver fotos de ${location.name}`, 'user');
    optionsContainer.remove();

    // Mostrar galeria de imagens
    if (window.assistantBridge && window.assistantBridge.media) {
      window.assistantBridge.media.showGallery(location.id);

      addMessageToDOM(
        `Aqui estão algumas fotos de ${location.name}. Espero que goste!`,
        'assistant'
      );
      addMessageToHistory(
        `Aqui estão algumas fotos de ${location.name}. Espero que goste!`,
        'assistant'
      );
    }
  };

  // Botão para como chegar
  const routeButton = document.createElement('button');
  routeButton.className = 'action-button';
  routeButton.textContent = 'Como Chegar';
  routeButton.onclick = () => {
    addMessageToDOM(`Como chegar em ${location.name}?`, 'user');
    addMessageToHistory(`Como chegar em ${location.name}?`, 'user');
    optionsContainer.remove();

    // Mostrar rota no mapa
    if (window.assistantBridge && window.assistantBridge.map) {
      window.assistantBridge.map.showRoute('currentLocation', location.id);

      addMessageToDOM(
        `Estou mostrando no mapa a melhor rota para chegar até ${location.name} a partir da sua localização atual.`,
        'assistant'
      );
      addMessageToHistory(
        `Estou mostrando no mapa a melhor rota para chegar até ${location.name} a partir da sua localização atual.`,
        'assistant'
      );
    }
  };

  // Adicionar botões
  optionsContainer.appendChild(detailsButton);
  optionsContainer.appendChild(photosButton);
  optionsContainer.appendChild(routeButton);

  // Adicionar ao DOM
  messagesContainer.appendChild(optionsContainer);

  // Rolar para o final
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Modificação que não interfere com a exportação
document.addEventListener('AssistantInitialized', () => {
  console.log('Evento de inicialização do assistente detectado');
  setupAssistantToggleButton();
});
