import { showNotification } from '../ui/notifications.js';

/**
 * toggleDarkMode - Alterna o modo escuro.
 */
export function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  map.getContainer().classList.toggle('dark-map');
  showNotification('Modo escuro alternado.', 'info');
  console.log('toggleDarkMode: Alternância de modo escuro executada.');
}
