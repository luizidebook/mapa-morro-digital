/**
 * Assistente Virtual - Camada de Modelo
 * Gerencia o estado e dados do assistente
 */

import { getGeneralText } from '../i18n/language.js';
import { selectedLanguage } from '../core/config.js';

// Configurações padrão
const DEFAULT_OPTIONS = {
  autoShow: false,
  enableVoice: true,
  rememberHistory: true,
  maxHistoryLength: 50,
  defaultGreeting: true,
};

// Estado inicial
const INITIAL_STATE = {
  isActive: false,
  isVisible: false,
  isSpeaking: false,
  isListening: false,
  isTyping: false,
  hasGreeted: false,
  context: {},
  history: [],
  lastInteractionTime: null,
  map: null,
  initialized: false,
};

/**
 * Inicializa o modelo do assistente
 * @param {Object} map - Instância do mapa
 * @param {Object} userOptions - Opções do usuário
 * @returns {Object} - Modelo do assistente
 */
export function initializeAssistantModel(map = null, userOptions = {}) {
  console.log('📊 Inicializando modelo do assistente...');

  // Mesclar opções do usuário com padrões
  const options = { ...DEFAULT_OPTIONS, ...userOptions };

  // Criar estado inicial
  let state = { ...INITIAL_STATE, map };

  // Restaurar estado anterior se existe e opção ativada
  if (options.rememberHistory) {
    try {
      const savedState = localStorage.getItem('assistantState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Apenas restaurar itens seguros (não restaurar map ou handlers)
        state.history = parsedState.history || [];
        state.context = parsedState.context || {};
        state.hasGreeted = parsedState.hasGreeted || false;
        console.log('🔄 Estado anterior do assistente restaurado');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao restaurar estado do assistente:', error);
    }
  }

  /**
   * Salva o estado atual
   */
  function saveState() {
    if (!options.rememberHistory) return;

    try {
      const stateToPersist = {
        history: state.history,
        context: state.context,
        hasGreeted: state.hasGreeted,
      };
      localStorage.setItem('assistantState', JSON.stringify(stateToPersist));
    } catch (error) {
      console.warn('⚠️ Erro ao salvar estado do assistente:', error);
    }
  }

  /**
   * Atualiza o estado
   * @param {Object} newState - Novo estado parcial
   */
  function updateState(newState) {
    state = { ...state, ...newState };

    // Auto-salvar quando há alterações importantes
    if (newState.history || newState.context || newState.hasGreeted) {
      saveState();
    }

    return state;
  }

  /**
   * Adiciona mensagem ao histórico
   * @param {string} text - Texto da mensagem
   * @param {string} role - Papel (user/assistant)
   * @param {Object} metadata - Metadados adicionais
   */
  function addMessage(text, role, metadata = {}) {
    if (!text || !role) return null;

    const message = {
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      text,
      role,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    // Adicionar mensagem ao histórico
    const updatedHistory = [...state.history, message];

    // Limitar tamanho do histórico
    if (updatedHistory.length > options.maxHistoryLength) {
      updatedHistory.shift();
    }

    // Atualizar estado
    updateState({
      history: updatedHistory,
      lastInteractionTime: new Date(),
    });

    return message;
  }

  /**
   * Obtém mensagens para um determinado contexto
   * @param {string} contextId - ID do contexto (opcional)
   * @returns {Array} - Mensagens filtradas
   */
  function getMessages(contextId = null) {
    if (!contextId) return state.history;

    return state.history.filter(
      (message) => message.metadata && message.metadata.contextId === contextId
    );
  }

  /**
   * Atualiza opções do assistente
   * @param {Object} newOptions - Novas opções
   */
  function updateOptions(newOptions) {
    Object.assign(options, newOptions);
    return { ...options }; // Retorna cópia para evitar modificação direta
  }

  /**
   * Limpa histórico de mensagens
   */
  function clearMessageHistory() {
    updateState({ history: [] });
    return true;
  }

  /**
   * Obtém mensagem traduzida para o assistente
   * @param {string} key - Chave da mensagem
   * @param {Object} params - Parâmetros para substituição
   */
  function getAssistantMessage(key, params = {}) {
    try {
      // Tentar obter do sistema de idiomas
      const message = getGeneralText(key, selectedLanguage);
      if (message) {
        // Substituir parâmetros se existirem
        return Object.entries(params).reduce(
          (text, [param, value]) => text.replace(`{${param}}`, value),
          message
        );
      }

      // Fallbacks para mensagens comuns
      const fallbacks = {
        greeting: {
          pt: 'Olá! Como posso ajudar?',
          en: 'Hello! How can I help?',
          es: '¡Hola! ¿Cómo puedo ayudar?',
        },
        help: {
          pt: 'Posso fornecer informações sobre praias, restaurantes e atrações.',
          en: 'I can provide information about beaches, restaurants and attractions.',
          es: 'Puedo proporcionar información sobre playas, restaurantes y atracciones.',
        },
      };

      return (
        fallbacks[key]?.[selectedLanguage] || fallbacks[key]?.['pt'] || key
      );
    } catch (error) {
      console.warn('⚠️ Erro ao obter mensagem para o assistente:', error);
      return key;
    }
  }

  // Retornar API do modelo
  return {
    getState: () => ({ ...state }), // Retorna cópia para evitar modificação direta
    updateState,
    addMessage,
    getMessages,
    updateOptions,
    getOptions: () => ({ ...options }),
    clearMessageHistory,
    getAssistantMessage,
  };
}
