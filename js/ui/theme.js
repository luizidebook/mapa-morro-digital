import { showNotification } from '../ui/notifications.js';

/**
 * Ajusta automaticamente o tema com base na hora do dia.
 * Se a hora atual estiver entre 18h e 6h, ativa o tema escuro.
 */
export function autoAdjustTheme() {
  const hour = new Date().getHours();
  const body = document.body;
  if (hour >= 18 || hour < 6) {
    // Ativa tema escuro
    if (!body.classList.contains('dark-theme')) {
      body.classList.add('dark-theme');
      showNotification('Tema escuro ativado automaticamente.', 'info');
    }
  } else {
    // Ativa tema claro
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      showNotification('Tema claro ativado automaticamente.', 'info');
    }
  }
}

/**
 * toggleDarkMode - Alterna o modo escuro.
 */
export function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  map.getContainer().classList.toggle('dark-map');
  showNotification('Modo escuro alternado.', 'info');
  console.log('toggleDarkMode: Alternância de modo escuro executada.');
}
