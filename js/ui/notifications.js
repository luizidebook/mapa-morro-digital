import { appState } from "../core/state.js";
import { eventBus, EVENT_TYPES } from "../core/eventBus.js";
import { UI_CONFIG } from "../core/config.js";
import { translate } from "../i18n/language.js";
import { escapeHTML } from "../utils/helpers.js";

/**
 * Módulo de notificações
 * Gerencia a exibição de mensagens para o usuário
 */

// Contador para garantir IDs únicos para as notificações
export let notificationCounter = 0;

// Lista para controlar notificações ativas
export const activeNotifications = [];

/**
 * Exibe uma notificação na interface
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de notificação: 'success', 'error', 'warning', 'info'
 * @param {number} [duration=3000] - Duração em ms
 */
export function showNotification(message, type, duration = 3000) {
  const container = document.getElementById("notification-container");
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => {
    container.removeChild(notification); // Certifique-se de que o elemento é removido
  }, duration);
}

/**
 * Fecha uma notificação específica
 * @param {string} notificationId - ID da notificação
 */
export function closeNotification(notificationId) {
  const notification = document.getElementById(notificationId);
  if (!notification) return;

  // Iniciar animação de saída
  notification.classList.remove("show");
  notification.classList.add("hide");

  // Remover da DOM após animação
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }

    // Remover da lista de notificações ativas
    const index = activeNotifications.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      const notificationInfo = activeNotifications[index];

      // Limpar timeout se existir
      if (notificationInfo.timeoutId) {
        clearTimeout(notificationInfo.timeoutId);
      }

      activeNotifications.splice(index, 1);
    }
  }, 300); // Tempo da animação de saída
}

/**
 * Fecha todas as notificações ativas
 */
export function closeAllNotifications() {
  // Criar cópia para evitar problemas ao modificar o array durante a iteração
  const notificationsToClose = [...activeNotifications];

  notificationsToClose.forEach((notification) => {
    closeNotification(notification.id);
  });
}

/**
 * Substitui texto em uma notificação existente
 * @param {string} notificationId - ID da notificação
 * @param {string} newMessage - Nova mensagem
 * @param {boolean} [translate=true] - Se true, busca tradução para a mensagem
 */
export function updateNotificationText(
  notificationId,
  newMessage,
  shouldTranslate = true
) {
  const notification = document.getElementById(notificationId);
  if (!notification) return;

  const displayMessage = shouldTranslate ? translate(newMessage) : newMessage;
  const messageElement = notification.querySelector(".notification-message");

  if (messageElement) {
    messageElement.textContent = displayMessage;

    // Atualizar a mensagem na lista de notificações ativas
    const notificationInfo = activeNotifications.find(
      (n) => n.id === notificationId
    );
    if (notificationInfo) {
      notificationInfo.message = displayMessage;
    }
  }
}

/**
 * Exibe uma notificação de erro
 * @param {string} message - Mensagem de erro
 * @param {number} [duration=5000] - Duração em ms
 * @returns {string} ID da notificação
 */
export function showError(message, duration = UI_CONFIG.TIMEOUTS.NOTIFICATION) {
  return showNotification(message, "error", duration);
}

/**
 * Exibe uma notificação de sucesso
 * @param {string} message - Mensagem de sucesso
 * @param {number} [duration=5000] - Duração em ms
 * @returns {string} ID da notificação
 */
export function showSuccess(
  message,
  duration = UI_CONFIG.TIMEOUTS.NOTIFICATION
) {
  return showNotification(message, "success", duration);
}

/**
 * Exibe uma notificação de aviso
 * @param {string} message - Mensagem de aviso
 * @param {number} [duration=5000] - Duração em ms
 * @returns {string} ID da notificação
 */
export function showWarning(
  message,
  duration = UI_CONFIG.TIMEOUTS.NOTIFICATION
) {
  return showNotification(message, "warning", duration);
}

/**
 * Exibe uma notificação de informação
 * @param {string} message - Mensagem informativa
 * @param {number} [duration=5000] - Duração em ms
 * @returns {string} ID da notificação
 */
export function showInfo(message, duration = UI_CONFIG.TIMEOUTS.NOTIFICATION) {
  return showNotification(message, "info", duration);
}

/**
 * Exibe uma notificação offline
 * Usado quando o app detecta que está offline
 */
export function showOfflineNotification() {
  // Verificar se já existe uma notificação offline ativa
  const existingOffline = activeNotifications.find(
    (n) => n.message === translate("offline-mode")
  );

  if (!existingOffline) {
    return showNotification("offline-mode", "warning", 10000);
  }

  return null;
}

/**
 * Limita o número máximo de notificações visíveis
 * Remove as mais antigas quando necessário
 * @param {number} [maxVisible=3] - Número máximo de notificações visíveis
 */
function enforceMaxVisibleNotifications(maxVisible = 3) {
  if (activeNotifications.length <= maxVisible) return;

  // Ordenar por timestamp (mais antigas primeiro)
  const sortedNotifications = [...activeNotifications].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  // Fechar as notificações mais antigas que excedem o limite
  const toClose = sortedNotifications.slice(
    0,
    activeNotifications.length - maxVisible
  );

  toClose.forEach((notification) => {
    closeNotification(notification.id);
  });
}

/**
 * Obtém o ícone para o tipo de notificação
 * @param {string} type - Tipo de notificação
 * @returns {string} Ícone HTML
 */
function getIconForType(type) {
  switch (type) {
    case "success":
      return '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
    case "error":
      return '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>';
    case "warning":
      return '<svg viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 15h-2v-2h2v2zm0-4h-2V9h2v4z"/></svg>';
    case "info":
    default:
      return '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
  }
}

// Subscrever a eventos de estado
eventBus.subscribe(EVENT_TYPES.STATE_CHANGED, (changeData) => {
  // Mostrar notificação quando mudar para modo offline
  if (changeData.path === "network.online" && changeData.newValue === false) {
    showOfflineNotification();
  }
});

// Exportar funções
export default {
  showNotification,
  closeNotification,
  closeAllNotifications,
  updateNotificationText,
  showError,
  showSuccess,
  showWarning,
  showInfo,
  showOfflineNotification,
};
