/**
 * Content Fetcher do Assistente
 * Este módulo fornece funções para buscar conteúdo e informações sobre locais.
 * Versão: 1.0.0
 */

import { startCarousel, getImagesForLocation } from '../ui/carousel.js';
import { showNotification } from '../ui/notifications.js';

/**
 * Banco de dados local de pontos de interesse (POIs)
 * Em produção, isso seria idealmente carregado de um arquivo JSON ou banco de dados
 */
const poisDatabase = {
  // Praias
  'primeira praia': {
    id: 'primeira-praia',
    name: 'Primeira Praia',
    category: 'praias',
    description:
      'A Primeira Praia é a porta de entrada de Morro de São Paulo, localizada logo após a Vila. Com águas calmas e cristalinas, é ideal para mergulho e para observar peixes coloridos. Por estar próxima à Vila, é uma das praias menos frequentadas, mas oferece uma excelente área para banho.',
    details: {
      características:
        'Praia pequena com águas calmas e cristalinas, ideal para mergulho',
      estrutura: 'Poucos quiosques e restaurantes',
      acesso: 'Fácil acesso pela Vila, cerca de 5 minutos a pé do centro',
      horário: 'Acessível 24h, melhor visitada durante o dia',
    },
    coordinates: { lat: -13.381, lng: -38.913 },
  },
  'segunda praia': {
    id: 'segunda-praia',
    name: 'Segunda Praia',
    category: 'praias',
    description:
      'A Segunda Praia é a mais movimentada de Morro de São Paulo, repleta de bares, restaurantes e hotéis. Com areias brancas e mar de águas claras e ondas moderadas, é o centro da vida noturna da ilha. Durante o dia, é animada com música e esportes na areia.',
    details: {
      características: 'Praia agitada com areias brancas e ondas moderadas',
      estrutura: 'Excelente estrutura com bares, restaurantes e hotéis',
      acesso: '10 minutos a pé da Vila, seguindo pela orla',
      horário: 'Movimentada 24h, especialmente animada à noite',
    },
    coordinates: { lat: -13.383, lng: -38.914 },
  },
  'terceira praia': {
    id: 'terceira-praia',
    name: 'Terceira Praia',
    category: 'praias',
    description:
      'A Terceira Praia oferece um equilíbrio perfeito entre estrutura e tranquilidade. Com águas mais calmas formando piscinas naturais na maré baixa, é ideal para famílias com crianças. Possui boas pousadas e restaurantes à beira-mar, mas mantém um ambiente mais relaxado que a Segunda Praia.',
    details: {
      características: 'Águas calmas com piscinas naturais na maré baixa',
      estrutura: 'Boa estrutura com pousadas e restaurantes de qualidade',
      acesso: '20 minutos a pé da Vila',
      horário: 'Acessível 24h, mais tranquila à noite',
    },
    coordinates: { lat: -13.385, lng: -38.915 },
  },
  'quarta praia': {
    id: 'quarta-praia',
    name: 'Quarta Praia',
    category: 'praias',
    description:
      'A Quarta Praia é a mais extensa e preservada das praias numeradas. Com longa faixa de areia e coqueiros, oferece um ambiente mais tranquilo e natural. É ideal para longas caminhadas e para quem busca mais sossego. Possui poucos estabelecimentos, mantendo seu charme rústico.',
    details: {
      características:
        'Praia extensa e preservada com coqueiros e águas claras',
      estrutura: 'Estrutura limitada, poucos estabelecimentos',
      acesso: '30 minutos a pé da Vila',
      horário: 'Acessível 24h, ideal para visitar durante o dia',
    },
    coordinates: { lat: -13.388, lng: -38.916 },
  },

  // Restaurantes
  'restaurante do gallo': {
    id: 'restaurante-do-gallo',
    name: 'Restaurante do Gallo',
    category: 'restaurantes',
    description:
      'O Restaurante do Gallo é um dos mais tradicionais da Segunda Praia, especializado em frutos do mar frescos. Com uma vista privilegiada para o mar, oferece um ambiente agradável e descontraído, ideal para almoços e jantares especiais.',
    details: {
      especialidade:
        'Frutos do mar, com destaque para moquecas e peixes grelhados',
      preços: 'R$70 a R$150 por pessoa',
      horário: '12h às 23h, todos os dias',
      localização: 'Segunda Praia, à beira-mar',
    },
    coordinates: { lat: -13.382, lng: -38.913 },
  },
  'dona carmô': {
    id: 'dona-carmo',
    name: 'Dona Carmô',
    category: 'restaurantes',
    description:
      'Localizado na Vila, o restaurante Dona Carmô é conhecido por servir autêntica comida baiana em um ambiente acolhedor e familiar. Ideal para quem quer experimentar os sabores tradicionais da região em porções generosas.',
    details: {
      especialidade:
        'Comida baiana tradicional, com destaque para acarajé e moqueca',
      preços: 'R$40 a R$90 por pessoa',
      horário: '11h às 22h, todos os dias',
      localização: 'Centro da Vila, próximo à Igreja',
    },
    coordinates: { lat: -13.38, lng: -38.912 },
  },

  // Hospedagem
  'pousada natureza': {
    id: 'pousada-natureza',
    name: 'Pousada Natureza',
    category: 'hospedagem',
    description:
      'A Pousada Natureza oferece acomodações simples e econômicas no centro da Vila. Ideal para viajantes que buscam praticidade e bom custo-benefício, com localização conveniente para explorar a ilha.',
    details: {
      classificação: '2 estrelas',
      preços: 'A partir de R$150 (baixa temporada) e R$250 (alta temporada)',
      serviços: 'Wi-Fi gratuito, café da manhã incluso',
      localização: 'Centro da Vila, 5 minutos a pé do cais',
    },
    coordinates: { lat: -13.38, lng: -38.912 },
  },
  'villa dos corais': {
    id: 'villa-dos-corais',
    name: 'Villa dos Corais',
    category: 'hospedagem',
    description:
      'O Villa dos Corais é um hotel de luxo localizado na Segunda Praia, oferecendo acomodações sofisticadas com vista para o mar. Com piscina, spa e restaurante próprio, é uma excelente opção para quem busca conforto e exclusividade.',
    details: {
      classificação: '4 estrelas',
      preços: 'A partir de R$800 (baixa temporada) e R$1500 (alta temporada)',
      serviços: 'Piscina, spa, restaurante, serviço de quarto, Wi-Fi',
      localização: 'Segunda Praia, à beira-mar',
    },
    coordinates: { lat: -13.384, lng: -38.914 },
  },

  // Atrações
  'farol do morro': {
    id: 'farol-do-morro',
    name: 'Farol do Morro',
    category: 'atrações',
    description:
      'O Farol do Morro oferece uma vista panorâmica espetacular de toda a ilha e do oceano. Construído em uma colina, o farol é acessível por uma trilha moderada e é um dos melhores lugares para assistir ao pôr do sol em Morro de São Paulo.',
    details: {
      atrativo: 'Vista panorâmica de 360° da ilha e oceano',
      acesso:
        'Trilha de dificuldade moderada, cerca de 20 minutos de caminhada',
      horário: 'Acessível do amanhecer ao anoitecer',
      dicas: 'Melhor horário para visita é no final da tarde para o pôr do sol',
    },
    coordinates: { lat: -13.376, lng: -38.919 },
  },
  'forte tapirandu': {
    id: 'forte-tapirandu',
    name: 'Forte Tapirandu',
    category: 'atrações',
    description:
      'O Forte Tapirandu, também conhecido como Forte de Morro de São Paulo, é uma construção histórica do século XVII que serviu para proteger a entrada da Baía de Todos os Santos. Hoje, suas ruínas bem preservadas são um importante ponto turístico e histórico da ilha.',
    details: {
      atrativo: 'Construção histórica com vista para o mar',
      acesso: 'Fácil acesso pela Vila, próximo ao cais',
      horário: 'Visitas das 9h às 17h',
      dicas:
        'Ótimo local para fotos e para aprender sobre a história da região',
    },
    coordinates: { lat: -13.379, lng: -38.91 },
  },

  // Passeios
  'piscina natural garapuá': {
    id: 'piscina-natural-garapua',
    name: 'Piscina Natural Garapuá',
    category: 'passeios',
    description:
      'O passeio à Piscina Natural de Garapuá é uma das excursões mais populares de Morro de São Paulo. Inclui visita à vila de pescadores de Garapuá e às incríveis piscinas naturais formadas por recifes de corais, com água cristalina e diversos peixes coloridos.',
    details: {
      duração: 'Dia inteiro (8h às 16h)',
      inclui: 'Transporte de barco, paradas para banho, almoço (opcional)',
      preço: 'R$120 a R$150 por pessoa',
      dicas: 'Levar protetor solar, água, dinheiro para almoço e snorkel',
    },
    coordinates: { lat: -13.415, lng: -38.9 },
  },
  'volta à ilha': {
    id: 'volta-a-ilha',
    name: 'Volta à Ilha',
    category: 'passeios',
    description:
      'O passeio de volta à ilha permite conhecer todas as praias de Morro de São Paulo por mar. Com duração aproximada de 4 horas, o barco contorna a ilha fazendo paradas para banho em pontos estratégicos, como a Piscina Natural e a Praia do Encanto.',
    details: {
      duração: '4 horas',
      inclui: 'Transporte de barco, paradas para banho',
      preço: 'R$70 a R$100 por pessoa',
      dicas: 'Melhor feito pela manhã quando o mar está mais calmo',
    },
    coordinates: { lat: -13.378, lng: -38.922 },
  },
};

/**
 * Obtém detalhes completos sobre um ponto de interesse específico
 * @param {string} poiId - ID ou nome do ponto de interesse
 * @returns {Object|null} Detalhes do ponto ou null se não encontrado
 */
export function getPoiDetails(poiId) {
  try {
    if (!poiId) return null;

    // Normalizar o ID
    const normalizedId = poiId.toLowerCase().trim();

    // Buscar diretamente pelo ID se existir
    if (poisDatabase[normalizedId]) {
      return { ...poisDatabase[normalizedId] };
    }

    // Se não encontrou pelo ID exato, busca por correspondência parcial
    for (const [key, poi] of Object.entries(poisDatabase)) {
      if (
        key.includes(normalizedId) ||
        poi.name.toLowerCase().includes(normalizedId) ||
        poi.id.toLowerCase().includes(normalizedId)
      ) {
        return { ...poi };
      }
    }

    console.warn(`POI não encontrado: ${poiId}`);
    return null;
  } catch (error) {
    console.error('Erro ao obter detalhes do POI:', error);
    return null;
  }
}

/**
 * Lista pontos de interesse por categoria
 * @param {string} category - Categoria a ser listada
 * @param {Object} options - Opções de filtragem
 * @returns {Array} Lista de POIs da categoria
 */
export function listPoiByCategory(category, options = {}) {
  try {
    if (!category) return [];

    // Normalizar categoria
    const normalizedCategory = category.toLowerCase().trim();

    // Filtrar POIs pela categoria
    const result = Object.values(poisDatabase).filter(
      (poi) => poi.category.toLowerCase() === normalizedCategory
    );

    // Aplicar filtros adicionais
    if (options.nameFilter) {
      const filter = options.nameFilter.toLowerCase();
      return result.filter(
        (poi) =>
          poi.name.toLowerCase().includes(filter) ||
          poi.description.toLowerCase().includes(filter)
      );
    }

    return result;
  } catch (error) {
    console.error('Erro ao listar POIs por categoria:', error);
    return [];
  }
}

/**
 * Busca pontos de interesse com base em texto
 * @param {string} searchText - Texto para busca
 * @param {Object} options - Opções de busca
 * @returns {Array} Resultados da busca
 */
export function searchPoi(searchText, options = {}) {
  try {
    if (!searchText) return [];

    // Normalizar texto de busca
    const normalizedSearch = searchText.toLowerCase().trim();

    // Opções padrão
    const defaultOptions = {
      maxResults: 10,
      categories: null, // todas as categorias
      includeDescription: true,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Filtrar por categorias se especificado
    let poiList = Object.values(poisDatabase);

    if (finalOptions.categories) {
      const categories = Array.isArray(finalOptions.categories)
        ? finalOptions.categories
        : [finalOptions.categories];

      poiList = poiList.filter((poi) =>
        categories.includes(poi.category.toLowerCase())
      );
    }

    // Buscar por correspondência
    const results = poiList.filter((poi) => {
      // Verificar nome
      if (poi.name.toLowerCase().includes(normalizedSearch)) {
        return true;
      }

      // Verificar ID
      if (poi.id.toLowerCase().includes(normalizedSearch)) {
        return true;
      }

      // Verificar descrição se habilitado
      if (
        finalOptions.includeDescription &&
        poi.description.toLowerCase().includes(normalizedSearch)
      ) {
        return true;
      }

      // Verificar detalhes se disponíveis
      if (poi.details) {
        return Object.values(poi.details).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(normalizedSearch)
        );
      }

      return false;
    });

    // Limitar número de resultados
    return results.slice(0, finalOptions.maxResults);
  } catch (error) {
    console.error('Erro ao buscar POIs:', error);
    return [];
  }
}

/**
 * Retorna informações formatadas sobre um ponto de interesse para o assistente
 * @param {string} poiId - ID ou nome do ponto de interesse
 * @returns {string} Texto formatado para o assistente
 */
export function getPoiInfoForAssistant(poiId) {
  try {
    const poi = getPoiDetails(poiId);

    if (!poi) {
      return `Desculpe, não encontrei informações sobre "${poiId}".`;
    }

    // Criar texto base com nome e descrição
    let infoText = `**${poi.name}**\n\n${poi.description}\n\n`;

    // Adicionar detalhes específicos por categoria
    if (poi.details) {
      infoText += '**Detalhes:**\n';

      for (const [key, value] of Object.entries(poi.details)) {
        // Capitalizar primeira letra da chave
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
        infoText += `- **${formattedKey}**: ${value}\n`;
      }
    }

    // Adicionar instrução sobre imagens
    infoText +=
      '\nPosso mostrar fotos deste local se você quiser. Basta pedir.';

    return infoText;
  } catch (error) {
    console.error(
      'Erro ao formatear informações do POI para o assistente:',
      error
    );
    return 'Desculpe, ocorreu um erro ao buscar as informações solicitadas.';
  }
}

/**
 * Exibe imagens de um local na interface
 * @param {string} locationName - Nome do local
 * @returns {boolean} Indica se a operação foi bem-sucedida
 */
export function showLocationImages(locationName) {
  try {
    if (!locationName) return false;

    // Chamar a função do módulo carousel
    return startCarousel(locationName);
  } catch (error) {
    console.error('Erro ao exibir imagens do local:', error);
    showNotification('Não foi possível exibir as imagens', 'error');
    return false;
  }
}

/**
 * Obtém URLs das imagens de um local
 * @param {string} locationName - Nome do local
 * @returns {Array} Lista de URLs das imagens
 */
export function getLocationImageUrls(locationName) {
  try {
    if (!locationName) return [];

    // Chamar a função do módulo carousel
    return getImagesForLocation(locationName) || [];
  } catch (error) {
    console.error('Erro ao obter URLs das imagens:', error);
    return [];
  }
}
