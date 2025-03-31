import { currentSubMenu } from '../core/varGlobals.js';
/**
 * 1. closeSideMenu
 *    Fecha o menu lateral #menu e reseta o currentSubMenu (se houver).
 */
export function closeSideMenu() {
  if (currentSubMenu) {
    currentSubMenu.classList.add('hidden'); // Esconde o submenu atual
    currentSubMenu = null; // Reseta o submenu atual
    console.log('Submenu fechado.');
  } else {
    console.warn('Nenhum submenu está aberto.');
  }
}
