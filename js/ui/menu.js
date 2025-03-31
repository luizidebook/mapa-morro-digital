/**
 * 1. closeSideMenu
 *    Fecha o menu lateral #menu e reseta o currentSubMenu (se houver).
 */
export function closeSideMenu() {
  const menu = document.getElementById('menu');
  menu.style.display = 'none';
  currentSubMenu = null;
}
