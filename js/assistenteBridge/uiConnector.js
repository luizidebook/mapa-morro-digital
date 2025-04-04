/**
 * UI Connector do Assistente
 * Este módulo fornece funções para interagir com elementos da interface do usuário.
 * Versão: 1.0.0
 */

import { showNotification } from '../ui/notifications.js';

/**
 * Abre um painel específico na interface
 * @param {string} panelId - ID do painel a ser aberto
 * @param {Object} data - Dados a serem passados para o painel
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
export function openPanel(panelId, data = {}) {
  try {
    // Verificar se a função de abertura de painel está disponível
    if (typeof window.openUIPanel === 'function') {
      return window.openUIPanel(panelId, data);
    }

    // Implementação alternativa se a função global não existir
    console.log(`Abrindo painel: ${panelId}`, data);

    // Buscar o elemento do painel
    const panel = document.getElementById(panelId);
    if (!panel) {
      console.warn(`Painel não encontrado: ${panelId}`);
      return false;
    }

    // Mostrar o painel
    panel.style.display = 'block';

    // Disparar evento para informar que o painel foi aberto
    const openEvent = new CustomEvent('panelOpened', {
      detail: { panelId, data },
    });
    document.dispatchEvent(openEvent);

    return true;
  } catch (error) {
    console.error(`Erro ao abrir painel ${panelId}:`, error);
    return false;
  }
}

/**
 * Fecha um painel específico na interface
 * @param {string} panelId - ID do painel a ser fechado
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
export function closePanel(panelId) {
  try {
    // Verificar se a função de fechamento de painel está disponível
    if (typeof window.closeUIPanel === 'function') {
      return window.closeUIPanel(panelId);
    }

    // Implementação alternativa se a função global não existir
    console.log(`Fechando painel: ${panelId}`);

    // Buscar o elemento do painel
    const panel = document.getElementById(panelId);
    if (!panel) {
      console.warn(`Painel não encontrado: ${panelId}`);
      return false;
    }

    // Ocultar o painel
    panel.style.display = 'none';

    // Disparar evento para informar que o painel foi fechado
    const closeEvent = new CustomEvent('panelClosed', {
      detail: { panelId },
    });
    document.dispatchEvent(closeEvent);

    return true;
  } catch (error) {
    console.error(`Erro ao fechar painel ${panelId}:`, error);
    return false;
  }
}

/**
 * Aciona uma ação específica na interface
 * @param {string} actionName - Nome da ação a ser acionada
 * @param {Object} params - Parâmetros para a ação
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
export function triggerAction(actionName, params = {}) {
  try {
    console.log(`Acionando ação: ${actionName}`, params);

    // Mapear ações para funções específicas
    const actionMap = {
      showLocationInfo: (p) => showLocationInfo(p.locationId),
      openGallery: (p) => openGallery(p.locationName),
      showCategoryFilter: (p) => showCategoryFilter(p.category),
      toggleSidebar: () => toggleSidebar(),
      showSearchResults: (p) => showSearchResults(p.query, p.results),
    };

    // Verificar se a ação existe
    if (actionMap[actionName]) {
      return actionMap[actionName](params);
    }

    // Se não encontrou no mapa de ações, tentar função global
    if (typeof window[actionName] === 'function') {
      return window[actionName](params);
    }

    console.warn(`Ação não reconhecida: ${actionName}`);
    return false;
  } catch (error) {
    console.error(`Erro ao acionar ação ${actionName}:`, error);
    return false;
  }
}

/**
 * Mostra informações sobre um local na interface
 * @param {string} locationId - ID do local
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
function showLocationInfo(locationId) {
  try {
    console.log(`Mostrando informações do local: ${locationId}`);

    // Verificar se a função específica existe
    if (typeof window.showLocationDetails === 'function') {
      return window.showLocationDetails(locationId);
    }

    // Implementação alternativa
    openPanel('location-details-panel', { locationId });

    return true;
  } catch (error) {
    console.error('Erro ao mostrar informações do local:', error);
    return false;
  }
}

/**
 * Abre a galeria de imagens para um local
 * @param {string} locationName - Nome do local
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
function openGallery(locationName) {
  try {
    console.log(`Abrindo galeria para: ${locationName}`);

    // Verificar se a função específica existe
    if (typeof window.openPhotoGallery === 'function') {
      return window.openPhotoGallery(locationName);
    }

    // Implementação alternativa usando o módulo carousel
    if (typeof window.startCarousel === 'function') {
      return window.startCarousel(locationName);
    }

    showNotification(
      `Mostrando galeria de fotos para: ${locationName}`,
      'info'
    );
    return true;
  } catch (error) {
    console.error('Erro ao abrir galeria:', error);
    return false;
  }
}

/**
 * Mostra filtro por categoria no mapa
 * @param {string} category - Categoria a ser filtrada
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
function showCategoryFilter(category) {
  try {
    console.log(`Aplicando filtro de categoria: ${category}`);

    // Verificar se a função específica existe
    if (typeof window.filterMapByCategory === 'function') {
      return window.filterMapByCategory(category);
    }

    // Implementação alternativa
    showNotification(`Filtrando mapa para mostrar: ${category}`, 'info');

    return true;
  } catch (error) {
    console.error('Erro ao aplicar filtro de categoria:', error);
    return false;
  }
}

/**
 * Alterna visibilidade da barra lateral
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
function toggleSidebar() {
  try {
    console.log('Alternando visibilidade da barra lateral');

    // Verificar se a função específica existe
    if (typeof window.toggleMapSidebar === 'function') {
      return window.toggleMapSidebar();
    }

    // Implementação alternativa
    const sidebar =
      document.querySelector('.sidebar') ||
      document.getElementById('map-sidebar');

    if (sidebar) {
      sidebar.classList.toggle('collapsed');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao alternar barra lateral:', error);
    return false;
  }
}

/**
 * Mostra resultados de busca na interface
 * @param {string} query - Termo de busca
 * @param {Array} results - Resultados a serem exibidos
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
function showSearchResults(query, results) {
  try {
    console.log(`Mostrando resultados de busca para: ${query}`, results);

    // Verificar se a função específica existe
    if (typeof window.displaySearchResults === 'function') {
      return window.displaySearchResults(query, results);
    }

    // Implementação alternativa
    if (!results || results.length === 0) {
      showNotification(`Nenhum resultado encontrado para: ${query}`, 'info');
      return true;
    }

    showNotification(
      `Encontrados ${results.length} resultados para: ${query}`,
      'success'
    );

    // Abrir painel de resultados se existir
    openPanel('search-results-panel', { query, results });

    return true;
  } catch (error) {
    console.error('Erro ao mostrar resultados de busca:', error);
    return false;
  }
}
