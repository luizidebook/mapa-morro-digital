import { showNotification } from '../ui/notifications.js';

/**
 * toggleDarkMode - Alterna o modo escuro.
 */
export function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  if (window.map && window.map.getContainer) {
    window.map.getContainer().classList.toggle('dark-map');
  }

  // Atualizar a preferência de tema
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('preferredTheme', isDarkMode ? 'dark' : 'light');

  showNotification('Modo escuro alternado.', 'info');
  console.log('toggleDarkMode: Alternância de modo escuro executada.');
}

/**
 * Ajusta automaticamente o tema com base na hora do dia ou preferências do usuário
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.useSystemPreference - Se deve usar a preferência do sistema (padrão: true)
 * @param {boolean} options.useTimeOfDay - Se deve ajustar baseado na hora do dia (padrão: true)
 * @param {string} options.defaultTheme - Tema padrão caso não haja outras preferências ('light' ou 'dark')
 */
export function autoAdjustTheme(options = {}) {
  // Opções padrão
  const settings = {
    useSystemPreference: true,
    useTimeOfDay: true,
    defaultTheme: 'light',
    ...options,
  };

  let shouldUseDarkTheme = false;

  // 1. Verificar preferência salva do usuário
  const savedTheme = localStorage.getItem('preferredTheme');
  if (savedTheme) {
    console.log(`autoAdjustTheme: Usando tema salvo: ${savedTheme}`);
    shouldUseDarkTheme = savedTheme === 'dark';
  } else {
    // 2. Verificar preferência do sistema se habilitado
    if (settings.useSystemPreference) {
      const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      if (prefersDarkMode) {
        console.log('autoAdjustTheme: Sistema prefere modo escuro');
        shouldUseDarkTheme = true;
      }
    }

    // 3. Verificar hora do dia se habilitado e nenhuma preferência específica foi encontrada
    if (settings.useTimeOfDay && !savedTheme && !shouldUseDarkTheme) {
      const currentHour = new Date().getHours();

      // Modo escuro entre 19h e 5h
      if (currentHour >= 19 || currentHour < 5) {
        shouldUseDarkTheme = true;
        console.log(
          'autoAdjustTheme: Ativando modo escuro baseado na hora do dia (noite)'
        );
      } else {
        console.log(
          'autoAdjustTheme: Mantendo modo claro baseado na hora do dia (dia)'
        );
      }
    }
  }

  // Aplicar o tema apropriado
  if (shouldUseDarkTheme) {
    enableDarkMode();
  } else {
    enableLightMode();
  }
}

/**
 * Ativa o modo escuro
 */
function enableDarkMode() {
  document.body.classList.add('dark-mode');
  if (window.map && window.map.getContainer) {
    window.map.getContainer().classList.add('dark-map');
  }
  console.log('enableDarkMode: Modo escuro ativado');
}

/**
 * Ativa o modo claro
 */
function enableLightMode() {
  document.body.classList.remove('dark-mode');
  if (window.map && window.map.getContainer) {
    window.map.getContainer().classList.remove('dark-map');
  }
  console.log('enableLightMode: Modo claro ativado');
}

/**
 * Adiciona listener para mudanças na preferência do sistema
 */
export function setupThemeListener() {
  // Monitorar mudanças na preferência do sistema
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      // Apenas ajustar se o usuário não tiver uma preferência salva
      if (!localStorage.getItem('preferredTheme')) {
        if (e.matches) {
          enableDarkMode();
        } else {
          enableLightMode();
        }
      }
    });
}
