import { getImagesForLocation } from '../ui/carousel.js';

/**
 * Exibe galeria de imagens para um local específico
 * @param {string} poiId - ID do ponto de interesse
 * @param {Object} options - Opções de exibição
 * @returns {boolean} - Sucesso ou falha
 */
export function showGallery(poiId, options = {}) {
  try {
    // Importar startCarousel apenas quando necessário
    return import('../ui/carousel.js')
      .then((module) => {
        if (typeof module.startCarousel !== 'function') {
          throw new Error(
            'Função startCarousel não encontrada no módulo carousel'
          );
        }

        // Obter detalhes do local para obter o nome correto
        const locationName = getLocationName(poiId);

        // Iniciar o carrossel
        module.startCarousel(locationName);

        // Registrar interação
        logUserInteraction('gallery_view', {
          poiId: poiId,
          name: locationName,
        });

        return true;
      })
      .catch((error) => {
        console.error('Erro ao exibir galeria:', error);
        return false;
      });
  } catch (error) {
    console.error('Erro ao mostrar galeria:', error);
    return false;
  }
}

/**
 * Pré-carrega imagens para uma lista de locais
 * @param {string|Array} locations - ID do local ou lista de IDs
 * @returns {boolean} - Sucesso ou falha
 */
export function preloadImages(locations) {
  try {
    // Se for string, converter para array
    const locationArray =
      typeof locations === 'string' ? [locations] : locations;

    // Verificar se a função getImagesForLocation está disponível
    if (typeof getImagesForLocation !== 'function') {
      console.warn('Função getImagesForLocation não disponível');
      return false;
    }

    // Para cada local, carregar as imagens em segundo plano
    locationArray.forEach((locationId) => {
      const locationName = getLocationName(locationId);

      // Obter URLs das imagens
      const imageUrls = getImagesForLocation(locationName);

      // Pré-carregar imagens
      if (imageUrls && imageUrls.length > 0) {
        console.log(
          `Pré-carregando ${imageUrls.length} imagens para ${locationName}`
        );
        imageUrls.forEach((url) => {
          const img = new Image();
          img.src = url;
        });
      }
    });

    return true;
  } catch (error) {
    console.error('Erro ao pré-carregar imagens:', error);
    return false;
  }
}

/**
 * Obtém o nome formatado de um local a partir de seu ID
 * @param {string} poiId - ID do ponto de interesse
 * @returns {string} - Nome formatado do local
 */
function getLocationName(poiId) {
  // Verificar se temos a API de conteúdo disponível
  if (window.assistantBridge && window.assistantBridge.content) {
    const details = window.assistantBridge.content.getDetails(poiId);
    if (details && details.name) {
      return details.name;
    }
  }

  // Fallback: converter o ID em um nome legível
  return poiId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Registra interação do usuário para análise
 * @param {string} actionType - Tipo de ação
 * @param {Object} data - Dados associados
 */
function logUserInteraction(actionType, data = {}) {
  try {
    // Verificar se o sistema de analytics existe
    if (window.assistantBridge && window.assistantBridge.analytics) {
      window.assistantBridge.analytics.logInteraction(actionType, data);
    } else {
      // Fallback para registro no console
      console.log(`Interação: ${actionType}`, data);
    }
  } catch (error) {
    console.error('Erro ao registrar interação:', error);
  }
}
