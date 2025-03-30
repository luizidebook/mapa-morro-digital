import { getState } from "./sharedState.js";

/**
 * EventBus - Sistema de eventos para comunicação entre módulos
 *
 * Implementa o padrão Pub/Sub (Publisher/Subscriber) para permitir comunicação
 * desacoplada entre diferentes partes da aplicação.
 */
export const eventBus = {
  // Armazena eventos e seus callbacks
  events: {},

  /**
   * Inscreve uma função para ser chamada quando um evento específico for publicado
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função a ser chamada quando o evento ocorrer
   * @returns {Function} - Função para cancelar a inscrição
   */
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Retorna uma função para cancelar a inscrição
    return () => this.unsubscribe(event, callback);
  },

  /**
   * Publica um evento, chamando todos os callbacks inscritos
   * @param {string} event - Nome do evento
   * @param {any} data - Dados a serem passados para os callbacks
   */
  publish(event, data) {
    if (!this.events[event]) return;

    this.events[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(
          `Erro ao executar callback para o evento "${event}":`,
          error
        );
      }
    });
  },

  /**
   * Cancela a inscrição de um callback para um evento
   * @param {string} event - Nome do evento
   * @param {Function} callback - Callback a ser removido
   */
  unsubscribe(event, callback) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter((cb) => cb !== callback);

    // Se não houver mais callbacks, remove o evento
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  },

  /**
   * Remove todos os callbacks de um evento específico
   * @param {string} event - Nome do evento para limpar
   */
  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  },
};

// Exemplos de eventos que serão usados na aplicação
export const EVENT_TYPES = {
  // Eventos de navegação
  NAVIGATION_STARTED: "navigation:started",
  NAVIGATION_ENDED: "navigation:ended",
  NAVIGATION_PAUSED: "navigation:paused",
  NAVIGATION_RESUMED: "navigation:resumed",
  ROUTE_RECALCULATED: "route:recalculated",
  ROUTE_CREATED: "route:created",

  // Eventos de localização
  LOCATION_UPDATED: "location:updated",
  HEADING_UPDATED: "heading:updated",

  // Eventos de interface
  LANGUAGE_CHANGED: "language:changed",
  THEME_CHANGED: "theme:changed",

  // Eventos de estado
  STATE_CHANGED: "state:changed",

  // Eventos para POIs e destinos
  DESTINATION_SELECTED: "destination:selected",
  POI_DISPLAYED: "poi:displayed",

  // Eventos para notificações
  NOTIFICATION_SHOW: "notification:show",
};
