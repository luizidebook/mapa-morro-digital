// state.js - Gerenciador de estado do assistente
export function setupStateManager(initialConfig) {
  // Estado inicial do assistente
  const initialState = {
    // Estado da interface
    isVisible: initialConfig.autoShow || false,
    isActive: false,
    isTyping: false,

    // Configurações de usuário
    language: initialConfig.language || 'pt',
    voiceEnabled: initialConfig.enableVoice || true,
    volume: 0.8,

    // Estado do diálogo
    currentContext: 'general',
    lastResponse: null,
    firstTimeVisitor: true,
    welcomeShown: false,

    // Estado da navegação
    navigationActive: false,
    currentRoute: null,
    currentStep: 0,

    // Dados do usuário
    location: null,
    preferences: {
      categories: [],
      interests: [],
    },

    // Histórico
    recentSearches: [],
    visitedLocations: [],
  };

  // Clone do estado atual
  let currentState = { ...initialState };

  // Listeners para mudanças de estado
  const listeners = new Set();

  // Funções de gerenciamento
  return {
    // Obter valor atual de uma chave
    get: (key) => {
      return key ? currentState[key] : { ...currentState };
    },

    // Definir valor para uma chave
    set: (key, value) => {
      const oldValue = currentState[key];
      currentState[key] = value;

      // Notificar listeners
      if (oldValue !== value) {
        notifyListeners({ key, oldValue, newValue: value });
      }

      return true;
    },

    // Obter estado atual completo
    getCurrentState: () => {
      return { ...currentState };
    },

    // Resetar estado para valores iniciais
    reset: () => {
      currentState = { ...initialState };
      notifyListeners({ key: 'all', oldValue: null, newValue: null });
      return true;
    },

    // Adicionar listener para mudanças
    addListener: (callback) => {
      if (typeof callback === 'function') {
        listeners.add(callback);
        return true;
      }
      return false;
    },

    // Remover listener
    removeListener: (callback) => {
      return listeners.delete(callback);
    },

    // Funções específicas para estado do assistente
    markWelcomeAsShown: () => {
      currentState.welcomeShown = true;
      notifyListeners({ key: 'welcomeShown', oldValue: false, newValue: true });
      return true;
    },

    hasShownWelcome: () => {
      return currentState.welcomeShown;
    },

    // Salvar preferências do usuário
    savePreference: (category, value) => {
      if (!currentState.preferences[category]) {
        currentState.preferences[category] = [];
      }

      if (!currentState.preferences[category].includes(value)) {
        currentState.preferences[category].push(value);
        notifyListeners({
          key: `preferences.${category}`,
          oldValue: [...currentState.preferences[category]],
          newValue: currentState.preferences[category],
        });
      }

      return true;
    },

    // Salvar localização atual
    setUserLocation: (location) => {
      currentState.location = location;
      notifyListeners({
        key: 'location',
        oldValue: currentState.location,
        newValue: location,
      });
      return true;
    },
  };

  // Função auxiliar para notificar os listeners
  function notifyListeners(change) {
    listeners.forEach((listener) => {
      try {
        listener(change, currentState);
      } catch (error) {
        console.error('Erro ao notificar listener de estado:', error);
      }
    });
  }
}
