// saveAssistantState() - Salva o estado atual do assistente
//     const screenWidth = window.innerWidth;

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
export const assistantStateManager = new AssistantState();
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
    /**
     * Atualiza o idioma do assistente
     * @param {string} language - Código do idioma (pt, en, es, he)
     */
    setLanguage: function (language) {
      return updateAssistantLanguage(language);
    },

    /**
     * Fala o texto no idioma atual
     * @param {string} text - Texto para falar
     * @param {boolean} interrupt - Se deve interromper a fala atual
     */
    speak: function (text, interrupt = true) {
      return speakText(text, interrupt);
    },

    /**
     * Mostra o assistente com mensagem de boas-vindas no idioma atual
     */
    showWithWelcome: function () {
      // Mostrar assistente
      const assistantDialog = document.getElementById('assistant-dialog');
      if (assistantDialog) {
        assistantDialog.classList.remove('hidden');
      }

      // Verificar se a mensagem já foi mostrada
      if (window.welcomeMessageShown) {
        console.log('Mensagem de boas-vindas já foi exibida, pulando...');
        return true;
      }

      // Mostrar mensagem de boas-vindas
      import('../dialog/message/message.js').then((messageModule) => {
        if (typeof messageModule.showWelcomeMessage === 'function') {
          messageModule.showWelcomeMessage();
          window.welcomeMessageShown = true; // Marcar que a mensagem foi mostrada
        }
      });

      return true;
    },

    /**
     * Retorna o idioma atual do assistente
     */
    getCurrentLanguage: function () {
      return assistantStateManager.get('selectedLanguage') || 'pt';
    },
  };
}

/**
 * Garante que o assistente esteja corretamente posicionado
 * @param {HTMLElement} element - Elemento do assistente
 */
export function ensureCorrectPosition(element) {
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
export function escolherLocalAleatorio() {
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
 * Gerencia a tradução e configuração de idioma do assistente
 * Deve ser chamada quando o idioma é alterado
 * @param {string} language - Código do idioma (pt, en, es, he)
 */
export function updateAssistantLanguage(language = 'pt') {
  console.log(`Atualizando idioma do assistente para: ${language}`);

  try {
    // Verificar idioma
    const supportedLanguages = ['pt', 'en', 'es', 'he'];
    if (!supportedLanguages.includes(language)) {
      language = 'pt';
    }

    // Atualizar estado e salvar preferência
    assistantStateManager.set('selectedLanguage', language);
    localStorage.setItem('preferredLanguage', language);

    // Configurar voz (função existente)
    configureVoiceForLanguage(language);

    // Limpar conversa atual
    if (window.conversationFlow) {
      window.conversationFlow.reset();
    }

    // Obter referências aos elementos críticos
    const assistantDialog = document.getElementById('assistant-dialog');
    const messagesContainer = document.getElementById('assistant-messages');

    // Se os elementos não existirem, não tente atualizar
    if (!assistantDialog || !messagesContainer) {
      console.warn(
        'Elementos do assistente não encontrados para atualização de idioma'
      );
      return false;
    }

    // Se o diálogo estiver visível, atualizar a mensagem
    if (!assistantDialog.classList.contains('hidden')) {
      // Limpar mensagens existentes
      messagesContainer.innerHTML = '';

      // Importar módulo usando caminho ABSOLUTO para evitar erros
      import('/js/assistente/dialog/message/message.js')
        .then((module) => {
          if (typeof module.showWelcomeMessage === 'function') {
            module.showWelcomeMessage();
          } else {
            console.error('Função showWelcomeMessage não encontrada');
          }
        })
        .catch((error) => {
          console.error('Erro ao importar módulo message.js:', error);

          // Fallback: tente usar caminho relativo
          import('../dialog/message/message.js')
            .then((module) => {
              if (typeof module.showWelcomeMessage === 'function') {
                module.showWelcomeMessage();
              }
            })
            .catch((subError) => {
              console.error('Erro no fallback também:', subError);
            });
        });
    }

    // Atualizar textos da interface usando caminho ABSOLUTO
    import('/js/assistente/language/translations.js')
      .then((module) => {
        const { getAssistantText } = module;
        if (!getAssistantText) {
          throw new Error('Função getAssistantText não encontrada');
        }

        updateUIElements(getAssistantText, language);
      })
      .catch((error) => {
        console.error('Erro ao importar módulo translations.js:', error);

        // Fallback: tentar caminho relativo
        import('../language/translations.js')
          .then((module) => {
            const { getAssistantText } = module;
            if (getAssistantText) {
              updateUIElements(getAssistantText, language);
            }
          })
          .catch((subError) => {
            console.error('Erro no fallback também:', subError);
          });
      });

    return true;
  } catch (error) {
    console.error('Erro ao atualizar idioma do assistente:', error);
    return false;
  }
}

// Função auxiliar para atualizar elementos UI
function updateUIElements(getAssistantText, language) {
  // Elementos e chaves de tradução
  const elements = {
    'assistant-title': 'welcome',
    'assistant-input-field': 'hello',
    'assistant-send-btn': 'send',
    'assistant-voice-btn': 'voice_input',
    'close-assistant-dialog': 'close',
  };

  // Atualizar cada elemento
  for (const [elementId, textKey] of Object.entries(elements)) {
    const element = document.getElementById(elementId);
    if (!element) continue;

    if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
      element.placeholder = getAssistantText(textKey, language);
    } else if (element.tagName === 'BUTTON' && !element.textContent.trim()) {
      element.title = getAssistantText(textKey, language);
    } else {
      element.textContent = getAssistantText(textKey, language);
    }
  }

  console.log(`Textos da interface atualizados para: ${language}`);
}

/**
 * Configura a voz para síntese de fala baseada no idioma
 * @param {string} language - Código do idioma
 */
function configureVoiceForLanguage(language) {
  // Verificar se a API de síntese de fala está disponível
  if (!window.speechSynthesis) {
    console.warn('Síntese de fala não suportada neste navegador');
    return;
  }

  // Mapear idiomas para códigos de idioma da API de síntese de fala
  const langMap = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
    he: 'he-IL',
  };

  // Obter vozes disponíveis
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    // Em alguns navegadores, getVoices() pode ser assíncrono
    speechSynthesis.onvoiceschanged = () => {
      configureVoiceForLanguage(language);
    };
    return;
  }

  // Encontrar uma voz apropriada para o idioma
  const langCode = langMap[language] || 'pt-BR';
  let selectedVoice = voices.find((voice) => voice.lang === langCode);

  // Se não encontrar uma voz exata, procurar por uma que comece com o código do idioma
  if (!selectedVoice) {
    selectedVoice = voices.find((voice) => voice.lang.startsWith(language));
  }

  // Se ainda não encontrar, usar a primeira voz disponível
  if (!selectedVoice && voices.length > 0) {
    selectedVoice = voices[0];
  }

  // Salvar a voz selecionada no estado do assistente
  if (selectedVoice) {
    assistantStateManager.set('selectedVoice', selectedVoice);
    console.log(`Voz configurada para ${language}: ${selectedVoice.name}`);
  }
}

/**
 * Atualiza os textos da interface do assistente
 * @param {string} language - Código do idioma
 */
function updateAssistantUITexts(language) {
  try {
    // CORREÇÃO: Importar do arquivo de traduções do assistente em vez do language.js geral
    import('../language/translations.js')
      .then((module) => {
        const { getAssistantText } = module;
        if (!getAssistantText) {
          console.error(
            'Função getAssistantText não encontrada no módulo de traduções'
          );
          return;
        }

        // Atualizar textos dos elementos da interface
        const elements = {
          'assistant-title': 'welcome',
          'assistant-input-field': 'hello',
          'assistant-send-btn': 'send',
          'assistant-voice-btn': 'voice_input',
          'close-assistant-dialog': 'close',
        };

        // Atualizar cada elemento se existir
        for (const [elementId, textKey] of Object.entries(elements)) {
          const element = document.getElementById(elementId);
          if (element) {
            if (
              element.tagName === 'INPUT' &&
              element.hasAttribute('placeholder')
            ) {
              element.placeholder = getAssistantText(textKey, language);
            } else if (
              element.tagName === 'BUTTON' &&
              element.getAttribute('title') === null
            ) {
              // Se for um botão sem título, não modificar o conteúdo (apenas o título/tooltip)
              element.setAttribute(
                'title',
                getAssistantText(textKey, language)
              );
            } else {
              element.textContent = getAssistantText(textKey, language);
            }
          }
        }

        console.log(
          `Textos da interface do assistente atualizados para: ${language}`
        );
      })
      .catch((error) => {
        console.error('Erro ao importar módulo de traduções:', error);
      });
  } catch (error) {
    console.error('Erro ao atualizar textos da interface:', error);
  }
}

/**
 * Speak text in the selected language
 * @param {string} text - Text to speak
 * @param {boolean} interrupt - Whether to interrupt current speech
 */
export function speakText(text, interrupt = true) {
  // Verificar se a API de síntese de fala está disponível
  if (!window.speechSynthesis) {
    console.warn('Síntese de fala não suportada neste navegador');
    return false;
  }

  // Interromper fala atual se solicitado
  if (interrupt && speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  // Não falar se já estiver falando e interrupção não foi solicitada
  if (!interrupt && speechSynthesis.speaking) {
    return false;
  }

  // Criar utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Configurar voz baseada no idioma atual
  const selectedVoice = assistantStateManager.get('selectedVoice');
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  // Definir idioma baseado na configuração atual
  const language = assistantStateManager.get('selectedLanguage') || 'pt';
  const langMap = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
    he: 'he-IL',
  };
  utterance.lang = langMap[language] || 'pt-BR';

  // Configurar taxa de fala e volume
  utterance.rate = 1.0; // Normal
  utterance.pitch = 1.0; // Normal
  utterance.volume = 1.0; // Máximo

  // Falar o texto
  speechSynthesis.speak(utterance);

  return true;
}

/**
 * Mostra o assistente na interface
 */
function showAssistant() {
  try {
    // Mostrar container principal do assistente
    const assistantContainer = document.getElementById('digital-assistant');
    if (assistantContainer) {
      assistantContainer.style.display = '';
      assistantContainer.classList.remove('hidden');
      console.log('Container do assistente exibido');
    } else {
      console.error('Container do assistente não encontrado!');
    }

    // Mostrar diálogo do assistente
    const assistantDialog = document.getElementById('assistant-dialog');
    if (assistantDialog) {
      console.log('Removendo classe hidden do diálogo do assistente');
      assistantDialog.classList.remove('hidden');
    } else {
      console.error('Diálogo do assistente não encontrado!');
      return false;
    }

    // Atualizar estado
    assistantStateManager.set('isVisible', true);
    assistantStateManager.set('isActive', true);

    // Tentar mostrar mensagem de boas-vindas se não houver mensagens anteriores
    const messagesContainer = document.getElementById('assistant-messages');
    if (
      messagesContainer &&
      (!messagesContainer.hasChildNodes() ||
        messagesContainer.children.length === 0)
    ) {
      // Importar dinamicamente para evitar dependência circular
      import('../dialog/message/message.js').then((module) => {
        if (typeof module.showWelcomeMessage === 'function') {
          module.showWelcomeMessage();
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Erro ao mostrar assistente:', error);
    return false;
  }
}
