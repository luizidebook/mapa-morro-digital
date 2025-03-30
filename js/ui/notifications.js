// Função: Exibe uma notificação para o usuário
export function showNotification(message, type = 'info', duration = 3000) {
  const notificationContainer = document.getElementById(
    'notification-container'
  );
  if (!notificationContainer) {
    console.warn('Container de notificações não encontrado.');
    return;
  }

  // Cria o elemento da notificação
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Adiciona a notificação ao container
  notificationContainer.appendChild(notification);

  // Remove a notificação após o tempo especificado
  setTimeout(() => {
    notification.remove();
  }, duration);

  console.log(`Notificação exibida: ${message} (${type})`);
}
