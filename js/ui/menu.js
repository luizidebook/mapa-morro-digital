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

/**
 * Função para ocultar o menu lateral.
 */
/**
 * Função para ocultar o menu lateral com efeito de descida.
 */
export function hideMenu() {
  const menu = document.getElementById('menu');
  if (menu) {
    menu.classList.remove('show'); // Remove a classe que exibe o menu
    menu.classList.add('hidden'); // Adiciona a classe que oculta o menu
    console.log('[hideMenu] Menu ocultado com efeito de descida.');
  } else {
    console.warn('[hideMenu] Elemento com ID "menu" não encontrado.');
  }
}

/**
 * Função para exibir o menu lateral com efeito de subida.
 */
export function showMenu() {
  const menu = document.getElementById('menu');
  if (menu) {
    menu.classList.remove('hidden'); // Remove a classe que oculta o menu
    menu.classList.add('show'); // Adiciona a classe que exibe o menu
    console.log('[showMenu] Menu exibido com efeito de subida.');
  } else {
    console.warn('[showMenu] Elemento com ID "menu" não encontrado.');
  }
}
