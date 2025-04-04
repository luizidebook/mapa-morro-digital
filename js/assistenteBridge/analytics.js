/**
 * Analytics para o Assistente
 * Este módulo fornece funções para registrar e analisar interações do usuário
 * com o assistente virtual, permitindo melhorar a experiência com o tempo.
 * Versão: 1.0.0
 */

// Armazenamento local de eventos para análise
let analyticsEvents = [];
const STORAGE_KEY = 'assistantAnalyticsData';

/**
 * Registra uma interação do usuário para análise
 * @param {string} type - Tipo de interação
 * @param {Object} data - Dados da interação
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
export function logInteraction(type, data = {}) {
  try {
    // Criar evento de análise
    const event = {
      type,
      data,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
    };

    // Adicionar à lista local
    analyticsEvents.push(event);

    // Limitar tamanho da lista
    if (analyticsEvents.length > 1000) {
      analyticsEvents = analyticsEvents.slice(-1000);
    }

    // Persistir eventos periodicamente (a cada 10 eventos)
    if (analyticsEvents.length % 10 === 0) {
      persistAnalyticsData();
    }

    // Enviar para análise externa se disponível
    if (typeof window.trackEvent === 'function') {
      window.trackEvent(type, data);
    }

    return true;
  } catch (error) {
    console.error('Erro ao registrar interação para análise:', error);
    return false;
  }
}

/**
 * Obtém o ID da sessão atual
 * @returns {string} ID da sessão
 */
function getSessionId() {
  if (!window.currentSessionId) {
    window.currentSessionId = generateSessionId();
  }
  return window.currentSessionId;
}

/**
 * Gera um ID único para a sessão
 * @returns {string} ID da sessão
 */
function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Registra as preferências do usuário
 * @param {Object} preferences - Preferências do usuário
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
export function recordUserPreferences(preferences) {
  try {
    // Armazenar preferências atualizadas
    localStorage.setItem(
      'assistantUserPreferences',
      JSON.stringify(preferences)
    );

    // Registrar evento
    logInteraction('preferenceUpdate', preferences);

    return true;
  } catch (error) {
    console.error('Erro ao registrar preferências do usuário:', error);
    return false;
  }
}

/**
 * Obtém as preferências do usuário
 * @returns {Object} Preferências do usuário
 */
export function getUserPreferences() {
  try {
    const preferencesJson = localStorage.getItem('assistantUserPreferences');
    return preferencesJson ? JSON.parse(preferencesJson) : {};
  } catch (error) {
    console.error('Erro ao obter preferências do usuário:', error);
    return {};
  }
}

/**
 * Registra um feedback do usuário
 * @param {string} messageId - ID da mensagem relacionada (opcional)
 * @param {string} feedbackType - Tipo de feedback ('positive', 'negative', etc)
 * @param {string} comment - Comentário do usuário (opcional)
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
export function recordFeedback(messageId, feedbackType, comment = '') {
  try {
    const feedback = {
      messageId,
      feedbackType,
      comment,
      timestamp: new Date().toISOString(),
    };

    // Registrar evento
    logInteraction('feedback', feedback);

    // Armazenar feedback
    const feedbacks = getFeedbacks();
    feedbacks.push(feedback);
    localStorage.setItem('assistantFeedbacks', JSON.stringify(feedbacks));

    return true;
  } catch (error) {
    console.error('Erro ao registrar feedback:', error);
    return false;
  }
}

/**
 * Obtém os feedbacks registrados
 * @returns {Array} Lista de feedbacks
 */
export function getFeedbacks() {
  try {
    const feedbacksJson = localStorage.getItem('assistantFeedbacks');
    return feedbacksJson ? JSON.parse(feedbacksJson) : [];
  } catch (error) {
    console.error('Erro ao obter feedbacks:', error);
    return [];
  }
}

/**
 * Carrega dados de analytics armazenados
 */
export function loadAnalyticsData() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      analyticsEvents = JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Erro ao carregar dados de analytics:', error);
  }
}

/**
 * Persiste dados de analytics
 */
function persistAnalyticsData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analyticsEvents));
  } catch (error) {
    console.error('Erro ao persistir dados de analytics:', error);
  }
}

/**
 * Gera relatório de uso para análise
 * @param {Object} options - Opções de filtragem e formato
 * @returns {Object} Relatório com estatísticas de uso
 */
export function generateUsageReport(options = {}) {
  try {
    // Filtrar eventos por período se especificado
    let events = analyticsEvents;

    if (options.startDate) {
      events = events.filter(
        (event) => new Date(event.timestamp) >= new Date(options.startDate)
      );
    }

    if (options.endDate) {
      events = events.filter(
        (event) => new Date(event.timestamp) <= new Date(options.endDate)
      );
    }

    // Contar eventos por tipo
    const eventsByType = {};
    events.forEach((event) => {
      if (!eventsByType[event.type]) {
        eventsByType[event.type] = 0;
      }
      eventsByType[event.type]++;
    });

    // Calcular tempos de sessão
    const sessionDurations = calculateSessionDurations(events);

    // Compilar relatório
    return {
      totalEvents: events.length,
      eventsByType,
      uniqueSessions: countUniqueSessions(events),
      averageSessionDuration: calculateAverageSessionDuration(sessionDurations),
      topSearches: getTopSearches(events),
      topCategories: getTopCategories(events),
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erro ao gerar relatório de uso:', error);
    return { error: 'Falha ao gerar relatório' };
  }
}

/**
 * Calcula a duração das sessões
 * @param {Array} events - Lista de eventos
 * @returns {Object} Mapa de durações por sessão
 */
function calculateSessionDurations(events) {
  const sessionMap = {};

  events.forEach((event) => {
    if (!sessionMap[event.sessionId]) {
      sessionMap[event.sessionId] = {
        firstEvent: new Date(event.timestamp),
        lastEvent: new Date(event.timestamp),
      };
    } else {
      const eventTime = new Date(event.timestamp);
      if (eventTime < sessionMap[event.sessionId].firstEvent) {
        sessionMap[event.sessionId].firstEvent = eventTime;
      }
      if (eventTime > sessionMap[event.sessionId].lastEvent) {
        sessionMap[event.sessionId].lastEvent = eventTime;
      }
    }
  });

  // Calcular durações
  const durations = {};
  for (const [sessionId, session] of Object.entries(sessionMap)) {
    durations[sessionId] = session.lastEvent - session.firstEvent;
  }

  return durations;
}

/**
 * Conta o número de sessões únicas
 * @param {Array} events - Lista de eventos
 * @returns {number} Número de sessões
 */
function countUniqueSessions(events) {
  const sessions = new Set();
  events.forEach((event) => {
    if (event.sessionId) {
      sessions.add(event.sessionId);
    }
  });
  return sessions.size;
}

/**
 * Calcula a duração média das sessões
 * @param {Object} sessionDurations - Mapa de durações por sessão
 * @returns {number} Duração média em milissegundos
 */
function calculateAverageSessionDuration(sessionDurations) {
  const durations = Object.values(sessionDurations);
  if (durations.length === 0) return 0;

  const sum = durations.reduce((acc, duration) => acc + duration, 0);
  return sum / durations.length;
}

/**
 * Obtém as buscas mais frequentes
 * @param {Array} events - Lista de eventos
 * @returns {Array} Top 10 buscas mais frequentes
 */
function getTopSearches(events) {
  const searches = {};

  events.forEach((event) => {
    if (event.type === 'search' && event.data && event.data.query) {
      const query = event.data.query.toLowerCase().trim();
      if (!searches[query]) {
        searches[query] = 0;
      }
      searches[query]++;
    }
  });

  // Converter para array e ordenar
  return Object.entries(searches)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Obtém as categorias mais acessadas
 * @param {Array} events - Lista de eventos
 * @returns {Array} Top 5 categorias mais acessadas
 */
function getTopCategories(events) {
  const categories = {};

  events.forEach((event) => {
    if (
      (event.type === 'viewCategory' || event.type === 'searchCategory') &&
      event.data &&
      event.data.category
    ) {
      const category = event.data.category.toLowerCase();
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
    }
  });

  // Converter para array e ordenar
  return Object.entries(categories)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Inicializar carregando dados armazenados
loadAnalyticsData();
