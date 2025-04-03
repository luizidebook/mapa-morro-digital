/**
 * Sistema de Assistente Virtual para Morro de São Paulo Digital
 * @version 1.0.0
 */

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
      isVisible: false,
      hasGreeted: false,
      isTyping: false,
      visitCount: 0,
      lastLocation: null,
      firstTimeVisitor: true,
      awaitingFirstTimeResponse: false,
      currentContext: 'general',
      selectedLanguage: 'pt',
      markers: [],
      conversations: [],
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
}

// Inicializar sistema de estado
const assistantStateManager = new AssistantState();

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
    addMessageToUI(step.message, step.type, step.requireInteraction);

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
const conversationFlow = new ConversationFlow();

/**
 * Ponto único de inicialização do assistente
 * Deve ser chamado apenas uma vez no carregamento da página
 * @param {Object} map - Instância do mapa Leaflet (opcional)
 * @returns {Object} - API pública do assistente
 */
/**
 * Ponto único de inicialização do assistente
 * @param {Object} map - Instância do mapa Leaflet (opcional)
 * @param {Object} options - Opções de configuração
 * @returns {Object} - API pública do assistente
 */
export function initializeAssistant(map = null, options = {}) {
  console.log('Inicializando assistente virtual...');

  // Verificar inicialização anterior para evitar duplicação
  if (window.assistantInitialized) {
    console.log(
      'Assistente já foi inicializado anteriormente, usando instância existente'
    );
    return window.assistantApi || createAssistantAPI();
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
  };

  // Criar API do assistente
  const api = createAssistantAPI();
  window.assistantApi = api;

  // Marcar como inicializado
  window.assistantInitialized = true;

  // Configurar a UI
  try {
    setupAssistantUI();
  } catch (error) {
    console.warn('Configuração da UI do assistente adiada devido a: ', error);
  }

  return api;
}

/**
 * Cria a API pública do assistente
 * @returns {Object} API do assistente
 */
export function createAssistantAPI() {
  return {
    /**
     * Mostra o assistente virtual
     */
    showAssistant: function () {
      try {
        const assistantButton = document.getElementById(
          'digital-assistant-button'
        );
        const assistantContainer = document.getElementById(
          'digital-assistant-container'
        );

        if (assistantButton) {
          assistantButton.style.display = '';
          assistantButton.classList.remove('hidden');
        }

        if (assistantContainer) {
          assistantContainer.style.display = '';
          assistantContainer.classList.remove('hidden');
        }

        window.assistantState.isActive = true;
        console.log('Assistente mostrado com sucesso');
        return true;
      } catch (error) {
        console.error('Erro ao mostrar assistente:', error);
        return false;
      }
    },

    /**
     * Oculta o assistente
     */
    hideAssistant: function () {
      try {
        const assistantButton = document.getElementById(
          'digital-assistant-button'
        );
        const assistantContainer = document.getElementById(
          'digital-assistant-container'
        );

        if (assistantButton) {
          assistantButton.style.display = 'none';
          assistantButton.classList.add('hidden');
        }

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
      // Aqui seria o processamento da mensagem
      return true;
    },

    /**
     * Verifica se o assistente está ativo
     */
    isActive: function () {
      return window.assistantState.isActive;
    },

    /**
     * Retorna o estado atual do assistente
     */
    getState: function () {
      return { ...window.assistantState };
    },
  };
}

/**
 * Configura a interface do usuário do assistente
 */
function setupAssistantUI() {
  // Verificar se os elementos existem no DOM
  const assistantButton = document.getElementById('digital-assistant-button');
  const assistantContainer = document.getElementById(
    'digital-assistant-container'
  );

  if (!assistantButton || !assistantContainer) {
    console.warn(
      '⚠️ Elementos do assistente não encontrados. A UI será configurada mais tarde.'
    );
    return false;
  }

  // Inicialmente ocultar os elementos
  assistantButton.style.display = 'none';
  assistantButton.classList.add('hidden');

  assistantContainer.style.display = 'none';
  assistantContainer.classList.add('hidden');

  console.log('🎨 Interface do assistente configurada');
  return true;
}

/**
 * Configura os event listeners do assistente
 */
export function setupEventListeners() {
  try {
    // Configurar eventos somente se o DOM contiver os elementos necessários
    const assistantButton = document.getElementById('digital-assistant-button');
    if (!assistantButton) {
      console.warn(
        '⚠️ Botão do assistente não encontrado. Eventos não configurados.'
      );
      return false;
    }

    // Adicionar evento de clique no botão do assistente
    assistantButton.addEventListener('click', function () {
      const assistantContainer = document.getElementById(
        'digital-assistant-container'
      );
      if (assistantContainer) {
        const isHidden = assistantContainer.classList.contains('hidden');
        if (isHidden) {
          assistantContainer.style.display = '';
          assistantContainer.classList.remove('hidden');
        } else {
          assistantContainer.style.display = 'none';
          assistantContainer.classList.add('hidden');
        }
      }
    });

    console.log('🔄 Event listeners do assistente configurados');
    return true;
  } catch (error) {
    console.error(
      '❌ Erro ao configurar event listeners do assistente:',
      error
    );
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
    return;
  }

  console.log('Iniciando animação do assistente...');

  // Remover classe hidden
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

  // Após terminar a animação, mostrar diálogo se for a primeira vez
  setTimeout(() => {
    if (!assistantStateManager.get('hasGreeted')) {
      console.log('Primeira interação, mostrando saudação...');
      const assistantDialog = document.getElementById('assistant-dialog');

      if (assistantDialog) {
        assistantDialog.classList.remove('hidden');
        showGreeting(localEscolhido);
        assistantStateManager.set('hasGreeted', true);
      }
    }
  }, 3500); // Duração da animação - 3.5s
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
  saveAssistantState();

  return localEscolhido;
}

/**
 * Configura todos os listeners de eventos do assistente
 */
function setupEventListeners() {
  // Elementos do assistente
  const assistantToggle = document.getElementById('assistant-toggle');
  const assistantDialog = document.getElementById('assistant-dialog');
  const closeBtn = document.getElementById('close-assistant-dialog');
  const sendBtn = document.getElementById('assistant-send');
  const voiceBtn = document.getElementById('assistant-voice-input');
  const textInput = document.getElementById('assistant-text-input');

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

  // Tornar o assistente arrastável
  makeAssistantDraggable();
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

/**
 * Mostra opções para resposta de primeira visita
 */
function showFirstTimeOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar contêiner de botões
  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';
  choicesElement.innerHTML = `
    <button class="assistant-choice-btn" data-choice="sim">Sim, primeira vez</button>
    <button class="assistant-choice-btn" data-choice="nao">Já estive aqui antes</button>
  `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.assistant-choice-btn');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      handleFirstTimeResponse(escolha);
    });
  });
}

/**
 * Processa a resposta do usuário sobre primeira vez
 * @param {string} resposta - Sim ou não
 */
function handleFirstTimeResponse(resposta) {
  if (!assistantStateManager.get('awaitingFirstTimeResponse')) return;

  assistantStateManager.set('awaitingFirstTimeResponse', false);

  // Atualizar estado
  if (resposta === 'nao') {
    assistantStateManager.set('firstTimeVisitor', false);
    saveAssistantState();
  }

  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();

    let mensagemResposta;
    if (resposta === 'sim') {
      mensagemResposta =
        'Que incrível! Você vai adorar conhecer o Morro! Posso te ajudar com sugestões de roteiros e informações importantes para quem está aqui pela primeira vez. Do que você mais gosta: praias, festas, gastronomia ou trilhas?';
    } else {
      mensagemResposta =
        'Ah, então você já conhece as maravilhas do Morro! Sempre bom voltar, não é? Quer saber sobre alguma novidade ou precisa de informações específicas sobre algum local?';
    }

    addMessageToUI(mensagemResposta, 'assistant');

    // Mostrar opções de tópicos após um delay
    setTimeout(() => {
      showTopicOptions(resposta);
    }, 500);
  }, 1500);
}

/**
 * Mostra opções de tópicos para o usuário escolher
 * @param {string} resposta - Resposta anterior do usuário
 */
function showTopicOptions(resposta) {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar contêiner de botões
  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';

  if (resposta === 'sim') {
    // Opções para primeira visita
    choicesElement.innerHTML = `
      <button class="assistant-choice-btn" data-choice="praias">Praias</button>
      <button class="assistant-choice-btn" data-choice="festas">Festas</button>
      <button class="assistant-choice-btn" data-choice="gastronomia">Gastronomia</button>
      <button class="assistant-choice-btn" data-choice="trilhas">Trilhas</button>
    `;
  } else {
    // Opções para quem já conhece
    choicesElement.innerHTML = `
      <button class="assistant-choice-btn" data-choice="novidades">Novidades</button>
      <button class="assistant-choice-btn" data-choice="eventos">Eventos atuais</button>
      <button class="assistant-choice-btn" data-choice="melhores_lugares">Melhores lugares</button>
      <button class="assistant-choice-btn" data-choice="off_beaten">Fora do circuito</button>
    `;
  }

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.assistant-choice-btn');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      handleTopicSelection(escolha);
    });
  });
}

/**
 * Processa seleção de tópico do usuário
 * @param {string} escolha - Tópico escolhido
 */
function handleTopicSelection(escolha) {
  let mensagemResposta = '';

  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();

    // Gerar resposta com base na escolha
    switch (escolha) {
      // Respostas para primeira vez
      case 'praias':
        mensagemResposta = {
          text: 'Morro tem 5 praias principais, cada uma com seu charme! A Primeira é ótima para surf, a Segunda é a mais animada com bares e restaurantes, a Terceira tem águas calmas perfeitas para banho, a Quarta é mais tranquila e a Quinta é quase deserta. Quer que eu mostre a Segunda Praia no mapa?',
          action: {
            type: 'show_location',
            name: 'Segunda Praia',
            coordinates: { lat: -13.3825, lng: -38.9138 },
          },
        };
        break;
      case 'festas':
        mensagemResposta =
          'A vida noturna em Morro é animada! Os principais points são os bares da Segunda Praia, que têm festas todas as noites. No verão, rolam festas na praia e há boates como o Pulso e o Toca do Morcego. Quer mais detalhes sobre algum lugar específico?';
        break;
      case 'gastronomia':
        mensagemResposta =
          'A gastronomia aqui é incrível! Você encontra desde frutos do mar fresquíssimos até pratos internacionais. Não deixe de provar a moqueca baiana e o acarajé! Recomendo o restaurante Sambass na Terceira Praia e o Pasta & Vino para comida italiana. Alguma preferência específica?';
        break;
      case 'trilhas':
        mensagemResposta =
          'As trilhas de Morro são espetaculares! A mais famosa é a trilha até a Ponta do Morro, passando pelo Farol e Toca do Morcego, com vistas incríveis. Há também trilhas para as praias mais isoladas como Gamboa e Garapuá. Use tênis e leve bastante água!';
        break;

      // Respostas para retornantes
      case 'novidades':
        mensagemResposta =
          'Temos algumas novidades! Foi inaugurado o novo deck de observação na Quinta Praia, há um novo sistema de trilhas ecológicas na reserva, e agora temos passeios noturnos para observação de tartarugas (na temporada). O que te interessa mais?';
        break;
      case 'eventos':
        mensagemResposta =
          'Neste momento temos o Festival Gastronômico acontecendo na Vila, com pratos especiais em vários restaurantes. No próximo fim de semana teremos música ao vivo na Praça Central. Quer que eu te indique algum restaurante participante?';
        break;
      case 'melhores_lugares':
        mensagemResposta =
          'Os lugares mais bem avaliados atualmente são o restaurante Sambass na Terceira Praia, a Pousada Natureza na Segunda Praia, e os passeios de lancha até Cairú estão com avaliações excelentes. Quer saber mais sobre algum deles?';
        break;
      case 'off_beaten':
        mensagemResposta =
          'Para quem já conhece o básico, recomendo conhecer a praia de Garapuá (de barco), a Gamboa do Morro (travessia de barco ou caminhada na maré baixa), e a cachoeira da Fonte Grande. São lugares menos turísticos e muito especiais!';
        break;
      default:
        mensagemResposta =
          'Desculpe, não entendi sua escolha. Pode me dizer de outra forma o que você gostaria de saber sobre Morro de São Paulo?';
    }

    addMessageToUI(mensagemResposta, 'assistant');
  }, 1500);
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
    addMessageToUI(
      'Desculpe, seu navegador não suporta reconhecimento de voz. Por favor, digite sua pergunta.',
      'assistant'
    );
    return;
  }

  addMessageToUI('Estou ouvindo...', 'assistant');

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const speechText = event.results[0][0].transcript;
    console.log('Texto reconhecido:', speechText);

    // Mostrar o que foi entendido
    showUserMessage(speechText);

    // Processar a mensagem
    setTimeout(() => {
      processUserMessage(speechText);
    }, 500);
  };

  recognition.onerror = (event) => {
    console.error(`Erro de reconhecimento: ${event.error}`);
    addMessageToUI(
      'Desculpe, não consegui entender. Pode tentar novamente ou digitar sua pergunta?',
      'assistant'
    );
  };

  recognition.start();
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
  conversationFlow.addStep(message, 'user', false);

  // Mostrar indicador de digitação
  showTypingIndicator();

  // Processar a mensagem após um pequeno delay
  setTimeout(() => {
    removeTypingIndicator();

    // Processa a mensagem do usuário
    const response = processUserMessage(message);

    // Adiciona a resposta ao fluxo
    if (typeof response === 'object' && response.action) {
      // Mensagem com ação - aguardar interação do usuário
      conversationFlow.addStep(response, 'assistant', true, () => {
        // Executar a ação após interação
        if (
          response.action.type === 'show_location' &&
          response.action.coordinates
        ) {
          showLocationOnMap(response.action.coordinates, response.action.name);
        }
      });
    } else {
      // Mensagem simples - não requer interação
      conversationFlow.addStep(response, 'assistant', false);

      // Verificar se devemos mostrar opções adicionais
      // Se a resposta menciona praias, mostrar opções de praias
      if (
        (typeof response === 'string' &&
          response.toLowerCase().includes('praia')) ||
        (typeof response === 'object' &&
          response.text &&
          response.text.toLowerCase().includes('praia'))
      ) {
        setTimeout(showBeachOptions, 500);
      }
      // Se a resposta menciona comida, mostrar opções de comida
      else if (
        (typeof response === 'string' &&
          (response.toLowerCase().includes('restaurante') ||
            response.toLowerCase().includes('comida'))) ||
        (typeof response === 'object' &&
          response.text &&
          (response.text.toLowerCase().includes('restaurante') ||
            response.text.toLowerCase().includes('comida')))
      ) {
        setTimeout(showFoodOptions, 500);
      }
    }
  }, 1000);
}

/**
 * Processa a mensagem do usuário e gera resposta
 * @param {string} text - Texto da mensagem
 */
function processUserMessage(text) {
  const lowerText = text.toLowerCase();

  // Mostrar indicador de digitação
  showTypingIndicator();

  // Calcular tempo de resposta proporcional ao tamanho da mensagem
  const responseTime = Math.min(1200 + text.length * 30, 3000);

  setTimeout(() => {
    removeTypingIndicator();

    // Verificar contexto atual
    if (assistantStateManager.get('currentContext') !== 'general') {
      // Processar mensagem baseada no contexto
      const contextResponse = processContextualMessage(
        text,
        assistantStateManager.get('currentContext')
      );
      addMessageToUI(contextResponse, 'assistant');

      // Mostrar opções relacionadas, se aplicável
      if (assistantStateManager.get('currentContext') === 'food') {
        setTimeout(showFoodOptions, 500);
      }
      return;
    }

    // Processar mensagem geral
    let response;

    // Verificar se está perguntando sobre locais específicos
    if (lowerText.includes('segunda praia')) {
      response = {
        text: 'A Segunda Praia é o coração de Morro de São Paulo! Tem águas calmas, bares, restaurantes e muita agitação. É perfeita para quem quer curtir a praia com estrutura completa e boa vida noturna.',
        action: {
          type: 'show_location',
          name: 'Segunda Praia',
          coordinates: { lat: -13.3825, lng: -38.9138 },
        },
      };
    } else if (lowerText.includes('terceira praia')) {
      response = {
        text: 'A Terceira Praia tem águas tranquilas e cristalinas, perfeitas para banho! É mais familiar e relaxante, com excelentes pousadas e restaurantes. Daqui saem muitos barcos para passeios.',
        action: {
          type: 'show_location',
          name: 'Terceira Praia',
          coordinates: { lat: -13.3865, lng: -38.9088 },
        },
      };
    } else if (
      lowerText.includes('comida') ||
      lowerText.includes('restaurante') ||
      lowerText.includes('comer')
    ) {
      response =
        'Morro de São Paulo tem uma gastronomia incrível! Você prefere frutos do mar, comida regional baiana ou culinária internacional?';
      assistantStateManager.set('currentContext', 'food');
    } else {
      // Resposta padrão
      response = getSimpleResponse(text);
    }

    addMessageToUI(response, 'assistant');

    // Mostrar botões de sugestão após a resposta
    if (
      lowerText.includes('praia') ||
      (typeof response === 'string' && response.toLowerCase().includes('praia'))
    ) {
      setTimeout(showBeachOptions, 500);
    }
  }, responseTime);
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
      }
      return 'Há opções para todos os gostos em Morro de São Paulo. Você prefere frutos do mar, comida regional baiana ou culinária internacional?';

    // Adicione outros contextos conforme necessário
    default:
      // Reset para contexto geral
      assistantStateManager.set('currentContext', 'general');
      return processUserMessage(message); // Processa como mensagem geral
  }
}

/**
 * Mostra opções de comida
 */
function showFoodOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';
  choicesElement.innerHTML = `
    <button class="assistant-choice-btn" data-choice="frutos_do_mar">Frutos do Mar</button>
    <button class="assistant-choice-btn" data-choice="baiana">Comida Baiana</button>
    <button class="assistant-choice-btn" data-choice="internacional">Internacional</button>
  `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.assistant-choice-btn');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      sendMessage(
        `Quero saber sobre restaurantes de ${escolha.replace('_', ' ')}`
      );
    });
  });
}

/**
 * Mostra opções de praias
 */
function showBeachOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';
  choicesElement.innerHTML = `
    <button class="assistant-choice-btn" data-choice="primeira_praia">Primeira Praia</button>
    <button class="assistant-choice-btn" data-choice="segunda_praia">Segunda Praia</button>
    <button class="assistant-choice-btn" data-choice="terceira_praia">Terceira Praia</button>
    <button class="assistant-choice-btn" data-choice="quarta_praia">Quarta Praia</button>
  `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.assistant-choice-btn');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      sendMessage(`Me fale sobre a ${escolha.replace('_', ' ')}`);
    });
  });
}

/**
 * Gera uma resposta simples com base no texto
 * @param {string} text - Texto da mensagem
 * @returns {string} - Resposta simples
 */
function getSimpleResponse(text) {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes('olá') ||
    lowerText.includes('oi') ||
    lowerText.includes('ola')
  ) {
    return 'Olá! Como posso ajudar você a explorar Morro de São Paulo?';
  } else if (lowerText.includes('primeira praia')) {
    return 'A Primeira Praia é a mais próxima da Vila e ótima para surfistas! Tem ondas fortes e é menos indicada para banho. É uma praia pequena, com uma vista linda para o Farol e alguns estabelecimentos.';
  } else if (lowerText.includes('segunda praia')) {
    return 'A Segunda Praia é o coração da vida social em Morro! Tem águas mais calmas, muitos restaurantes, bares e hotéis. Durante o dia é movimentada e à noite se transforma no centro da vida noturna!';
  } else if (lowerText.includes('terceira praia')) {
    return 'A Terceira Praia tem águas tranquilas e cristalinas, perfeitas para banho! É mais familiar e relaxante, com excelentes pousadas e restaurantes.';
  } else if (lowerText.includes('quarta praia')) {
    return 'A Quarta Praia é extensa e mais deserta, ideal para quem busca tranquilidade! Tem piscinas naturais na maré baixa e é ótima para longas caminhadas.';
  } else if (lowerText.includes('praias')) {
    return 'Morro de São Paulo tem 5 praias principais: Primeira (para surf), Segunda (mais movimentada), Terceira (águas calmas), Quarta (tranquila e extensa) e Quinta (quase deserta). Cada uma tem seu próprio charme! Quer detalhes sobre alguma específica?';
  } else if (lowerText.includes('clima') || lowerText.includes('tempo')) {
    return 'Hoje o clima está ensolarado, com temperatura máxima de 29°C. A previsão para os próximos dias continua boa, com baixa chance de chuva. Perfeito para curtir as praias!';
  } else if (
    lowerText.includes('hotel') ||
    lowerText.includes('pousada') ||
    lowerText.includes('dormir')
  ) {
    return 'Em Morro temos opções para todos os bolsos! Pousadas econômicas como Porto do Zimbo na Vila, pousadas medianas como Pousada Natureza na Segunda Praia, e opções de luxo como a Villa dos Corais na Terceira Praia.';
  } else if (lowerText.includes('chegar') || lowerText.includes('como ir')) {
    return 'Para chegar a Morro de São Paulo, você precisa ir até Salvador ou Valença. De Salvador, pegue um catamarã (2h15) ou lancha rápida (1h45). De Valença, são apenas 30 minutos de lancha.';
  } else if (
    lowerText.includes('festa') ||
    lowerText.includes('balada') ||
    lowerText.includes('noite')
  ) {
    return 'A vida noturna de Morro é animada! Na Segunda Praia, os bares como Toca do Morcego e Pulso têm festas todas as noites. Na temporada, acontecem festas na praia com DJs famosos.';
  } else if (lowerText.includes('passeio') || lowerText.includes('tour')) {
    return 'Os passeios mais populares são: Volta à Ilha (visita às praias de barco), Cairu e Boipeba (ilhas vizinhas), Piscinas Naturais (na maré baixa) e Gamboa (praia vizinha). Quer detalhes sobre algum deles?';
  } else if (lowerText.includes('toca do morcego')) {
    return 'A Toca do Morcego é um ponto turístico incrível! É uma caverna natural na encosta entre o Farol e a Primeira Praia, com uma vista panorâmica espetacular! Perfeito para fotos e para assistir ao pôr do sol.';
  } else if (lowerText.includes('farol')) {
    return 'O Farol é um dos pontos mais altos da ilha, oferecendo uma vista 360° espetacular! É ideal para ver o nascer e o pôr do sol. A trilha para chegar lá é um pouco íngreme, mas vale cada gota de suor!';
  } else {
    return 'Estou aqui para ajudar com informações sobre Morro de São Paulo! Posso falar sobre praias, restaurantes, hospedagem, passeios, vida noturna ou como chegar. O que você gostaria de saber?';
  }
}

/**
 * Integração aprimorada com o mapa
 * @param {Object} coordinates - Coordenadas {lat, lng}
 * @param {string} name - Nome do local
 * @param {Object} options - Opções adicionais (ícone, zoom, etc)
 */
function showLocationOnMap(coordinates, name, options = {}) {
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    console.error('Coordenadas inválidas:', coordinates);
    return;
  }

  try {
    // Opções padrão
    const defaults = {
      zoom: 16,
      icon: null,
      showPopup: true,
      panTo: true,
      animation: true,
    };

    // Mesclar opções
    const settings = { ...defaults, ...options };

    // Verificar se existe uma referência global ao mapa
    const mapInstance = window.map;

    if (mapInstance) {
      console.log(`Mostrando localização no mapa: ${name}`);

      // Remover marcadores anteriores do assistente se necessário
      if (assistantStateManager.get('markers') && settings.clearPrevious) {
        assistantStateManager.get('markers').forEach((marker) => {
          mapInstance.removeLayer(marker);
        });
        assistantStateManager.set('markers', []);
      }

      // Inicializar array de marcadores se não existir
      if (!assistantStateManager.get('markers')) {
        assistantStateManager.set('markers', []);
      }

      // Movimentar o mapa para a localização
      if (settings.panTo) {
        mapInstance.setView([coordinates.lat, coordinates.lng], settings.zoom);
      }

      // Verificar se temos o Leaflet disponível
      if (window.L) {
        let markerIcon = settings.icon;

        // Criar ícone personalizado se não fornecido
        if (!markerIcon) {
          markerIcon = window.L.divIcon({
            className: 'assistant-marker',
            html: `<div class="marker-pin"></div><span>${name.charAt(0)}</span>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
          });
        }

        // Criar marcador
        const marker = window.L.marker([coordinates.lat, coordinates.lng], {
          icon: markerIcon,
        }).addTo(mapInstance);

        // Adicionar popup se necessário
        if (settings.showPopup) {
          marker.bindPopup(name).openPopup();
        }

        // Adicionar animação se necessário
        if (settings.animation) {
          marker._icon.classList.add('marker-bounce');
          setTimeout(() => {
            if (marker._icon) {
              marker._icon.classList.remove('marker-bounce');
            }
          }, 2000);
        }

        // Armazenar referência ao marcador
        assistantStateManager.set('markers', [
          ...assistantStateManager.get('markers'),
          marker,
        ]);

        return marker;
      }
    } else {
      console.warn(
        'Nenhuma instância de mapa disponível para mostrar localização'
      );
    }
  } catch (error) {
    console.error('Erro ao mostrar localização no mapa:', error);
  }
}

/**
 * Mostra uma localização no mapa
 * @param {Object} coordinates - Coordenadas {lat, lng}
 * @param {string} name - Nome do local
 */
function showLocationOnMap(coordinates, name) {
  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    console.error('Coordenadas inválidas:', coordinates);
    return;
  }

  try {
    // Verificar se existe função global
    if (typeof window.showLocationOnMap === 'function') {
      window.showLocationOnMap(coordinates.lat, coordinates.lng, name);
      console.log(
        `Mostrando no mapa: ${name} (${coordinates.lat}, ${coordinates.lng})`
      );
      return;
    }

    // Verificar se temos acesso ao mapa do Leaflet
    if (window.map) {
      window.map.setView([coordinates.lat, coordinates.lng], 16);

      // Criar marcador
      if (window.L) {
        const marker = window.L.marker([coordinates.lat, coordinates.lng])
          .addTo(window.map)
          .bindPopup(name)
          .openPopup();

        console.log(`Marcador adicionado: ${name}`);
      }
      return;
    }

    console.warn(
      'Nenhum método de mapa disponível, exibindo apenas coordenadas:',
      coordinates
    );
  } catch (error) {
    console.error('Erro ao mostrar localização:', error);
  }
}

/**
 * Torna o assistente arrastável pelo botão
 */
function makeAssistantDraggable() {
  const digitalAssistant = document.getElementById('digital-assistant');
  const handle = document.getElementById('assistant-toggle');

  if (!digitalAssistant || !handle) return;

  let isDragging = false;
  let initialX, initialY, offsetX, offsetY;

  handle.addEventListener('mousedown', startDrag);
  handle.addEventListener('touchstart', startDrag, { passive: false });

  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  function startDrag(e) {
    e.preventDefault();

    if (e.type === 'touchstart') {
      initialX = e.touches[0].clientX;
      initialY = e.touches[0].clientY;
    } else {
      initialX = e.clientX;
      initialY = e.clientY;
    }

    const rect = digitalAssistant.getBoundingClientRect();
    offsetX = initialX - rect.left;
    offsetY = initialY - rect.top;

    isDragging = true;
    digitalAssistant.classList.add('movable');
    digitalAssistant.classList.add('dragging');
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

    // Limitar às bordas da tela
    const maxLeft = window.innerWidth - digitalAssistant.offsetWidth;
    const maxTop = window.innerHeight - digitalAssistant.offsetHeight;

    const boundedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const boundedTop = Math.max(0, Math.min(newTop, maxTop));

    // Aplicar posição
    digitalAssistant.style.left = `${boundedLeft}px`;
    digitalAssistant.style.top = `${boundedTop}px`;
    digitalAssistant.style.transform = 'none'; // Remover transform para evitar conflitos
    digitalAssistant.style.position = 'fixed';
    digitalAssistant.style.bottom = 'auto';
  }

  function endDrag() {
    if (!isDragging) return;

    isDragging = false;
    digitalAssistant.classList.remove('dragging');

    // Delay antes de remover a classe
    setTimeout(() => {
      digitalAssistant.classList.remove('movable');
    }, 300);
  }
}

// Evento para centralizar o assistente quando a janela é redimensionada
window.addEventListener('resize', () => {
  const digitalAssistant = document.getElementById('digital-assistant');
  if (digitalAssistant && !digitalAssistant.classList.contains('movable')) {
    ensureCorrectPosition(digitalAssistant);
  }
});
