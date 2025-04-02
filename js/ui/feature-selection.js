import { map } from '../main.js';
import { markers } from '../core/varGlobals.js';
import { adjustMapWithLocation } from '../map/map.js';
import { clearMarkers } from '../map/map.js';
import { hideAllControlButtons } from './buttons.js';
import {
  saveDestinationToCache,
  sendDestinationToServiceWorker,
} from '../data/cache.js';
import { clearCurrentRoute } from '../ui/routeMarkers.js';
import { closeAssistantModal } from './modals.js';
import { getSelectedDestination } from '../data/cache.js';

// Variáveis de destino e localização do usuário
let selectedDestination = {}; // Objeto com as propriedades do destino (lat, lon, name, etc.)
// Variáveis para controle e exibição de marcadores e rota
let lastSelectedFeature = null; //
// Variáveis auxiliares de navegação e controle de UI
let currentSubMenu = null;
let currentStep = null;
let tutorialIsActive = false;

/**
 * 1. handleFeatureSelection
 *    Gerencia seleção de funcionalidades (ex.: praias, pontos turísticos).
 */
export function handleFeatureSelection(feature) {
  // Salva globalmente a feature clicada
  lastSelectedFeature = feature;
  // 1. Define os mapeamentos entre funcionalidades e IDs de submenus
  const featureMappings = {
    'pontos-turisticos': 'touristSpots-submenu',
    passeios: 'tours-submenu',
    praias: 'beaches-submenu',
    festas: 'nightlife-submenu',
    restaurantes: 'restaurants-submenu',
    pousadas: 'inns-submenu',
    lojas: 'shops-submenu',
    emergencias: 'emergencies-submenu',
    dicas: 'tips-submenu',
    sobre: 'about-submenu',
    ensino: 'education-submenu',
  };

  // 2. Obtém o ID do submenu correspondente à funcionalidade selecionada
  const subMenuId = featureMappings[feature];

  if (!subMenuId) {
    // Exibe erro no console se a funcionalidade não for reconhecida
    console.error(`Feature não reconhecida: ${feature}`);
    return;
  }

  console.log(`Feature selecionada: ${feature}, Submenu ID: ${subMenuId}`);

  // 3. Oculta todos os submenus atualmente visíveis
  document.querySelectorAll('#menu .submenu').forEach((subMenu) => {
    subMenu.style.display = 'none';
  });

  // Limpa os marcadores do mapa
  clearMarkers();

  // 4. Verifica se o submenu já está ativo
  if (currentSubMenu === subMenuId) {
    // Se o submenu já estiver ativo, oculta o menu e redefine o estado
    document.getElementById('menu').style.display = 'none';
    document
      .querySelectorAll('.menu-btn')
      .forEach((btn) => btn.classList.remove('active'));
    currentSubMenu = null;
  } else {
    // Carrega o submenu associado à funcionalidade
    loadSubMenu(subMenuId, feature);

    // Verifica se a funcionalidade está no contexto do tutorial
    if (
      tutorialIsActive &&
      tutorialSteps[currentStep].step === 'ask-interest'
    ) {
      // Avança para o próximo passo do tutorial após carregar o submenu
      nextTutorialStep();
    }

    // Exibe o menu e ajusta os estados visuais dos botões do menu
    document.getElementById('menu').style.display = 'block';
    document
      .querySelectorAll('.menu-btn')
      .forEach((btn) => btn.classList.add('inactive')); // Torna todos os botões inativos
    const activeButton = document.querySelector(
      `.menu-btn[data-feature="${feature}"]`
    );
    if (activeButton) {
      activeButton.classList.remove('inactive'); // Remove estado inativo do botão atual
      activeButton.classList.add('active'); // Torna o botão atual ativo
    }

    // Atualiza o estado global com o submenu ativo
    currentSubMenu = subMenuId;
  }
}

/**
 * 2. performControlAction
 *    Executa ações específicas de controle, conforme 'action' recebido.
 */
export function performControlAction(action) {
  switch (action) {
    case 'next':
      nextTutorialStep(currentStep);
      break;
    case 'previous':
      previousTutorialStep(currentStep);
      break;
    case 'finish':
      endTutorial();
      break;
    case 'start-tutorial':
      initializeTutorial();
      break;
    case 'menu-toggle':
      const floatingMenu = document.getElementById('floating-menu');
      floatingMenu.classList.toggle('hidden');
      break;
    case 'pontos-turisticos':
      storeAndProceed('pontos-turisticos');
      break;
    case 'passeios':
      storeAndProceed('passeios');
      break;
    case 'praias':
      storeAndProceed('praias');
      break;
    case 'festas':
      storeAndProceed('festas');
      break;
    case 'restaurantes':
      storeAndProceed('restaurantes');
      break;
    case 'pousadas':
      storeAndProceed('pousadas');
      break;
    case 'lojas':
      storeAndProceed('lojas');
      break;
    case 'emergencias':
      storeAndProceed('emergencias');
      break;
    case 'reserve-chairs':
      alert('Reserva de cadeiras iniciada.');
      break;
    case 'buy-ticket':
      alert('Compra de ingresso iniciada.');
      break;
    case 'create-route':
      startRouteCreation();
      break;
    case 'access-site':
      accessSite();
      break;
    case 'tutorial-send':
      nextTutorialStep();
      break;
    case 'tutorial-menu':
      showTutorialStep('ask-interest');
      break;
    case 'start-navigation-button':
      startNavigation();
      break;
    case 'navigation-end':
      endNavigation();
      break;
    default:
      console.error(`Ação não reconhecida: ${action}`);
  }
}

/**
 * 1. displayCustomAbout - Exibe informações personalizadas sobre "Sobre".
 */
export function displayCustomAbout() {
  const about = [
    {
      name: 'Missão',
      lat: -13.3766787,
      lon: -38.9172057,
      description:
        'Nossa missão é oferecer a melhor experiência aos visitantes.',
    },
    {
      name: 'Serviços',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Conheça todos os serviços que oferecemos.',
    },
    {
      name: 'Benefícios para Turistas',
      lat: -13.3766787,
      lon: -38.9172057,
      description:
        'Saiba como você pode se beneficiar ao visitar Morro de São Paulo.',
    },
    {
      name: 'Benefícios para Moradores',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Veja as vantagens para os moradores locais.',
    },
    {
      name: 'Benefícios para Pousadas',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Descubra como as pousadas locais podem se beneficiar.',
    },
    {
      name: 'Benefícios para Restaurantes',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Saiba mais sobre os benefícios para os restaurantes.',
    },
    {
      name: 'Benefícios para Agências de Turismo',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Veja como as agências de turismo podem se beneficiar.',
    },
    {
      name: 'Benefícios para Lojas e Comércios',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Descubra os benefícios para lojas e comércios.',
    },
    {
      name: 'Benefícios para Transportes',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Saiba mais sobre os benefícios para transportes.',
    },
    {
      name: 'Impacto em MSP',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Conheça o impacto do nosso projeto em Morro de São Paulo.',
    },
  ];

  const subMenu = document.getElementById('about-submenu');
  if (!subMenu) {
    console.error('Submenu "about-submenu" não encontrado.');
    return;
  }

  subMenu.innerHTML = '';
  about.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'submenu-item';
    btn.textContent = item.name;
    btn.setAttribute('data-lat', item.lat);
    btn.setAttribute('data-lon', item.lon);
    btn.setAttribute('data-name', item.name);
    btn.setAttribute('data-description', item.description);
    btn.setAttribute('data-feature', 'sobre');
    btn.setAttribute('data-destination', item.name);
    btn.onclick = () => {
      handleSubmenuButtons(
        item.lat,
        item.lon,
        item.name,
        item.description,
        [],
        'sobre'
      );
    };
    subMenu.appendChild(btn);

    const marker = L.marker([item.lat, item.lon])
      .addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.description}`);
    markers.push(marker);
  });

  console.log("Informações 'Sobre' exibidas no submenu.");
}

/**
 * 2. displayCustomBeaches - Exibe praias customizadas.
 */
function displayCustomBeaches() {
  fetchOSMData(queries['beaches-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'beaches-submenu', 'praias');
    }
  });
}

/**
 * 3. displayCustomEducation - Exibe dados educacionais customizados.
 */
function displayCustomEducation() {
  const educationItems = [
    {
      name: 'Iniciar Tutorial',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Comece aqui para aprender a usar o site.',
    },
    {
      name: 'Planejar Viagem com IA',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Planeje sua viagem com a ajuda de inteligência artificial.',
    },
    {
      name: 'Falar com IA',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Converse com nosso assistente virtual.',
    },
    {
      name: 'Falar com Suporte',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Entre em contato com o suporte.',
    },
    {
      name: 'Configurações',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Ajuste as configurações do site.',
    },
  ];

  const subMenu = document.getElementById('education-submenu');
  if (!subMenu) {
    console.error('Submenu "education-submenu" não encontrado.');
    return;
  }

  subMenu.innerHTML = '';
  educationItems.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'submenu-item';
    btn.textContent = item.name;
    btn.setAttribute('data-lat', item.lat);
    btn.setAttribute('data-lon', item.lon);
    btn.setAttribute('data-name', item.name);
    btn.setAttribute('data-description', item.description);
    btn.setAttribute('data-feature', 'ensino');
    btn.setAttribute('data-destination', item.name);
    btn.onclick = () => {
      handleSubmenuButtons(
        item.lat,
        item.lon,
        item.name,
        item.description,
        [],
        'ensino'
      );
    };
    subMenu.appendChild(btn);

    const marker = L.marker([item.lat, item.lon])
      .addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.description}`);
    markers.push(marker);
  });

  console.log('Dados educacionais customizados exibidos.');
}

/**
 * 4. displayCustomEmergencies - Exibe dados de emergência customizados.
 */
function displayCustomEmergencies() {
  const emergencies = [
    {
      name: 'Ambulância',
      lat: -13.3773,
      lon: -38.9171,
      description: 'Serviço de ambulância 24h. Contato: +55 75-99894-5017.',
    },
    {
      name: 'Unidade de Saúde',
      lat: -13.3773,
      lon: -38.9171,
      description: 'Unidade de saúde local. Contato: +55 75-3652-1798.',
    },
    {
      name: 'Polícia Civil',
      lat: -13.3775,
      lon: -38.915,
      description: 'Delegacia da Polícia Civil. Contato: +55 75-3652-1645.',
    },
    {
      name: 'Polícia Militar',
      lat: -13.3775,
      lon: -38.915,
      description: 'Posto da Polícia Militar. Contato: +55 75-99925-0856.',
    },
  ];
  const subMenu = document.getElementById('emergencies-submenu');
  subMenu.innerHTML = '';
  emergencies.forEach((emergency) => {
    const btn = document.createElement('button');
    btn.className = 'submenu-item';
    btn.textContent = emergency.name;
    btn.setAttribute('data-lat', emergency.lat);
    btn.setAttribute('data-lon', emergency.lon);
    btn.setAttribute('data-name', emergency.name);
    btn.setAttribute('data-description', emergency.description);
    btn.setAttribute('data-feature', 'emergencias');
    btn.setAttribute('data-destination', emergency.name);
    btn.onclick = () => {
      handleSubmenuButtons(
        emergency.lat,
        emergency.lon,
        emergency.name,
        emergency.description,
        [],
        'emergencias'
      );
    };
    subMenu.appendChild(btn);
    const marker = L.marker([emergency.lat, emergency.lon])
      .addTo(map)
      .bindPopup(`<b>${emergency.name}</b><br>${emergency.description}`);
    markers.push(marker);
  });
  console.log('Dados de emergência customizados exibidos.');
}

/**
 * 5. displayCustomInns - Exibe dados de pousadas customizados.
 */
function displayCustomInns() {
  fetchOSMData(queries['inns-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'inns-submenu', 'pousadas');
    }
  });
}

/**
 * 6. displayCustomItems - Exibe itens customizados com base em um array.
 */
export function displayCustomItems(items, subMenuId, feature) {
  const subMenu = document.getElementById(subMenuId);
  subMenu.innerHTML = '';
  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'submenu-item submenu-button';
    btn.textContent = item.name;
    btn.setAttribute('data-lat', item.lat);
    btn.setAttribute('data-lon', item.lon);
    btn.setAttribute('data-name', item.name);
    btn.setAttribute('data-description', item.description);
    btn.setAttribute('data-feature', feature);
    btn.setAttribute('data-destination', item.name);
    btn.onclick = () => {
      handleSubmenuButtons(
        item.lat,
        item.lon,
        item.name,
        item.description,
        [],
        feature
      );
    };
    subMenu.appendChild(btn);
    const marker = L.marker([item.lat, item.lon])
      .addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.description}`);
    markers.push(marker);
  });
  console.log(`Itens customizados para ${feature} exibidos.`);
}

/**
 * 7. displayCustomNightlife - Exibe dados de vida noturna customizados.
 */
function displayCustomNightlife() {
  fetchOSMData(queries['nightlife-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'nightlife-submenu', 'festas');
    }
  });
}

/**
 * 8. displayCustomRestaurants - Exibe dados de restaurantes customizados.
 */
function displayCustomRestaurants() {
  fetchOSMData(queries['restaurants-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'restaurants-submenu', 'restaurantes');
    }
  });
}

/**
 * 9. displayCustomShops - Exibe dados de lojas customizados.
 */
function displayCustomShops() {
  fetchOSMData(queries['shops-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'shops-submenu', 'lojas');
    }
  });
}

/**
 * 10. displayCustomTips - Exibe dados de dicas customizados.
 */
function displayCustomTips() {
  const tips = [
    {
      name: 'Melhores Pontos Turísticos',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Explore os pontos turísticos mais icônicos.',
    },
    {
      name: 'Melhores Passeios',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Descubra os passeios mais recomendados.',
    },
    {
      name: 'Melhores Praias',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Saiba quais são as praias mais populares.',
    },
    {
      name: 'Melhores Restaurantes',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Conheça os melhores lugares para comer.',
    },
    {
      name: 'Melhores Pousadas',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Encontre as melhores opções de pousadas.',
    },
    {
      name: 'Melhores Lojas',
      lat: -13.3766787,
      lon: -38.9172057,
      description: 'Descubra as melhores lojas para suas compras.',
    },
  ];
  const subMenu = document.getElementById('tips-submenu');
  subMenu.innerHTML = '';
  tips.forEach((tip) => {
    const btn = document.createElement('button');
    btn.className = 'submenu-item';
    btn.textContent = tip.name;
    btn.setAttribute('data-lat', tip.lat);
    btn.setAttribute('data-lon', tip.lon);
    btn.setAttribute('data-name', tip.name);
    btn.setAttribute('data-description', tip.description);
    btn.setAttribute('data-feature', 'dicas');
    btn.setAttribute('data-destination', tip.name);
    btn.onclick = () => {
      handleSubmenuButtons(
        tip.lat,
        tip.lon,
        tip.name,
        tip.description,
        [],
        'dicas'
      );
    };
    subMenu.appendChild(btn);
    const marker = L.marker([tip.lat, tip.lon])
      .addTo(map)
      .bindPopup(`<b>${tip.name}</b><br>${tip.description}`);
    markers.push(marker);
  });
  console.log('Dados de dicas customizados exibidos.');
}

/**
 * 11. displayCustomTouristSpots
 *    Exibe pontos turísticos (touristSpots-submenu) e esconde botões extras se desejar.
 */
function displayCustomTouristSpots() {
  fetchOSMData(queries['touristSpots-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'touristSpots-submenu', 'pontos-turisticos');
    }
    hideAllButtons();
  });
}

/**
 * 12. displayCustomTours
 *    Exibe passeios personalizados (tours-submenu).
 */
function displayCustomTours() {
  const tours = [
    {
      name: 'Passeio de lancha Volta a Ilha de Tinharé',
      lat: -13.3837729,
      lon: -38.908536,
      description:
        'Desfrute de um emocionante passeio de lancha ao redor da Ilha de Tinharé...',
    },
    {
      name: 'Passeio de Quadriciclo para Garapuá',
      lat: -13.3827765,
      lon: -38.91055,
      description:
        'Aventure-se em um passeio de quadriciclo até a vila de Garapuá...',
    },
    {
      name: 'Passeio 4X4 para Garapuá',
      lat: -13.3808638,
      lon: -38.9127107,
      description: 'Embarque em uma viagem emocionante de 4x4 até Garapuá...',
    },
    {
      name: 'Passeio de Barco para Gamboa',
      lat: -13.3766536,
      lon: -38.9186205,
      description: 'Relaxe em um agradável passeio de barco até Gamboa...',
    },
  ];

  displayCustomItems(tours, 'tours-submenu', 'passeios');
}

/**
 * Busca dados do OpenStreetMap usando a API Overpass
 * @param {string} query - Query Overpass para buscar dados
 * @returns {Promise<Object>} Dados retornados pela API
 */
/**
 * 1. fetchOSMData - Busca dados do OSM utilizando a Overpass API.
 */
export async function fetchOSMData(query) {
  try {
    // Monta URL para Overpass
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    console.log('[fetchOSMData] Iniciando busca no Overpass-API:', overpassUrl);

    // Faz a requisição
    const response = await fetch(overpassUrl);
    if (!response.ok) {
      console.error(
        '[fetchOSMData] HTTP Erro Overpass:',
        response.status,
        response.statusText
      );
      showNotification(
        'Erro ao buscar dados OSM. Verifique sua conexão.',
        'error'
      );
      return null;
    }

    // Tenta parsear JSON
    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      console.warn('[fetchOSMData] Nenhum dado encontrado (elements vazio).');
      showNotification('Nenhum dado OSM encontrado para esta busca.', 'info');
      return null;
    }

    console.log(
      `[fetchOSMData] Retornados ${data.elements.length} elementos do OSM.`
    );
    return data;
  } catch (error) {
    console.error('[fetchOSMData] Erro geral ao buscar dados do OSM:', error);
    showNotification(
      'Ocorreu um erro ao buscar dados no OSM (Overpass).',
      'error'
    );
    return null;
  }
}

/**
 * Exibe dados do OSM no mapa e interface
 * @param {Object} data - Dados retornados pela API Overpass
 * @param {string} subMenuId - ID do submenu
 * @param {string} feature - Tipo de feature
 */
function displayOSMData(data, subMenuId, feature) {
  // Limpa o conteúdo do submenu
  const subMenu = document.getElementById(subMenuId);
  subMenu.innerHTML = '';

  // Cria botões dinamicamente
  data.elements.forEach((element) => {
    if (element.type === 'node' && element.tags.name) {
      const btn = document.createElement('button');
      btn.className = 'submenu-item submenu-button';
      btn.textContent = element.tags.name;
      btn.setAttribute('data-destination', element.tags.name);

      const description =
        element.tags.description || 'Descrição não disponível';

      btn.onclick = () => {
        handleSubmenuButtons(
          element.lat,
          element.lon,
          element.tags.name,
          description,
          element.tags.images || [],
          feature
        );
      };

      subMenu.appendChild(btn);

      // Adiciona marcador
      const marker = L.marker([element.lat, element.lon])
        .addTo(map)
        .bindPopup(`<b>${element.tags.name}</b><br>${description}`);
      markers.push(marker);
    }
  });

  // Configura evento de clique
  document.querySelectorAll('.submenu-button').forEach((btn) => {
    btn.addEventListener('click', function () {
      const destination = this.getAttribute('data-destination');
      console.log(`Destination selected: ${destination}`);
    });
  });
}

// Exemplo de queries Overpass
const queries = {
  'touristSpots-submenu':
    '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
  'tours-submenu':
    '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
  'beaches-submenu':
    '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
  'nightlife-submenu':
    '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
  'restaurants-submenu':
    '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
  'inns-submenu':
    '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
  'shops-submenu':
    '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
  'emergencies-submenu':
    '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
  'tips-submenu':
    '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
  'about-submenu':
    '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
  'education-submenu':
    '[out:json];node["education"](around:10000,-13.376,-38.913);out body;',
};

function loadSubMenu(subMenuId, feature) {
  // 1. Verifica se o submenu existe
  const subMenu = document.getElementById(subMenuId);
  if (!subMenu) {
    console.error(`Submenu não encontrado: ${subMenuId}`);
    return;
  }

  console.log(`Carregando submenu: ${subMenuId} para a feature: ${feature}`);

  // 2. Exibe o submenu
  subMenu.style.display = 'block';

  // 3. Seleciona a funcionalidade específica para exibição
  switch (feature) {
    case 'pontos-turisticos':
      displayCustomTouristSpots();
      break;
    case 'passeios':
      displayCustomTours();
      break;
    case 'praias':
      displayCustomBeaches();
      break;
    case 'festas':
      displayCustomNightlife();
      break;
    case 'restaurantes':
      displayCustomRestaurants();
      break;
    case 'pousadas':
      displayCustomInns();
      break;
    case 'lojas':
      displayCustomShops();
      break;
    case 'emergencias':
      displayCustomEmergencies();
      break;
    case 'dicas':
      displayCustomTips();
      break;
    case 'sobre':
      displayCustomAbout();
      break;
    case 'ensino':
      displayCustomEducation();
      break;
    default:
      // 4. Lida com funcionalidades não reconhecidas
      console.error(`Feature não reconhecida ao carregar submenu: ${feature}`);
      break;
  }
}

/* 1. handleSubmenuButtonClick - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.
 */
export function handleSubmenuButtonClick(lat, lon, name, description) {
  if (!lat || !lon || !name) {
    console.error('Parâmetros inválidos para handleSubmenuButtonClick:', {
      lat,
      lon,
      name,
      description,
    });
    return;
  }

  selectedDestination = { lat, lon, name, description };

  adjustMapWithLocation(lat, lon, name);

  saveDestinationToLocalStorage(selectedDestination)
    .then(() => {
      console.log('Destino salvo no Local Storage com sucesso.');
    })
    .catch((error) => {
      console.error('Erro ao salvar destino no Local Storage:', error);
    });

  showNotification(`Destino ${name} selecionado com sucesso.`, 'info');
}

/**
 * 2. handleSubmenuButtonsTouristSpots - Gerencia submenu de pontos turísticos.
 */
export function handleSubmenuButtonsTouristSpots(lat, lon, name, description) {
  handleSubmenuButtonClick(
    lat,
    lon,
    name,
    description,
    showControlButtonsTouristSpots
  );
}

/**
 * 3. handleSubmenuButtonsTours - Gerencia submenu de tours.
 */
export function handleSubmenuButtonsTours(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTour);
}

/**
 * 4. handleSubmenuButtonsBeaches - Gerencia submenu de praias.
 */
export function handleSubmenuButtonsBeaches(lat, lon, name, description) {
  handleSubmenuButtonClick(
    lat,
    lon,
    name,
    description,
    showControlButtonsBeaches
  );
}

/**
 * 5. handleSubmenuButtonsRestaurants - Gerencia submenu de restaurantes.
 */
export function handleSubmenuButtonsRestaurants(lat, lon, name, description) {
  handleSubmenuButtonClick(
    lat,
    lon,
    name,
    description,
    showControlButtonsRestaurants
  );
}

/**
 * 6. handleSubmenuButtonsShops - Gerencia submenu de lojas.
 */
export function handleSubmenuButtonsShops(lat, lon, name, description) {
  handleSubmenuButtonClick(
    lat,
    lon,
    name,
    description,
    showControlButtonsShops
  );
}

/**
 * 7. handleSubmenuButtonsEmergencies - Gerencia submenu de emergências.
 */
export function handleSubmenuButtonsEmergencies(lat, lon, name, description) {
  handleSubmenuButtonClick(
    lat,
    lon,
    name,
    description,
    showControlButtonsEmergencies
  );
}

/**
 * 8. handleSubmenuButtonsEducation - Gerencia submenu de educação.
 */
export function handleSubmenuButtonsEducation(lat, lon, name, description) {
  handleSubmenuButtonClick(
    lat,
    lon,
    name,
    description,
    showControlButtonsEducation
  );
}

/**
 * 9. handleSubmenuButtonsInns - Gerencia submenu de pousadas.
 */
export function handleSubmenuButtonsInns(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsInns);
}

/**
 * 10. handleSubmenuButtonsTips - Gerencia submenu de dicas.
 */
export function handleSubmenuButtonsTips(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTips);
}

/**
 * 12. handleSubmenuButton - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.
 */

/**
 * 12. handleSubmenuButton - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.
 */

function handleSubmenuButtons(lat, lon, name, description, images, feature) {
  // 1. Obtém URLs adicionais relacionados ao local
  const url = getUrlsForLocation(name);

  // 2. Limpa os marcadores existentes no mapa e ajusta para a localização selecionada
  clearMarkers();
  adjustMapWithLocation(lat, lon, name, description, 15, -10);

  // 3. Atualiza o estado global e salva o destino selecionado no cache
  selectedDestination = { name, description, lat, lon, images, feature, url };
  saveDestinationToCache(selectedDestination)
    .then(() => {
      // 4. Envia o destino para o Service Worker e limpa rotas atuais
      sendDestinationToServiceWorker(selectedDestination);
      clearCurrentRoute();
    })
    .catch((error) => {
      console.error('Erro ao salvar destino no cache:', error);
    });

  // 5. Exibe botões de controle específicos com base na funcionalidade
  switch (feature) {
    case 'passeios':
      showControlButtonsTour();
      break;
    case 'festas':
      showControlButtonsNightlife();
      break;
    case 'restaurantes':
      showControlButtonsRestaurants();
      break;
    case 'pousadas':
      showControlButtonsInns();
      break;
    case 'lojas':
      showControlButtonsShops();
      break;
    case 'emergencias':
      showControlButtonsEmergencies();
      break;
    case 'dicas':
      showControlButtonsTips();
      break;
    case 'pontos-turisticos':
      showControlButtonsTouristSpots();
      break;
    case 'praias':
      showControlButtonsBeaches();
      break;
    case 'ensino':
      showControlButtonsEducation();
      break;
    // 7. Funcionalidade não reconhecida: Exibe botões genéricos
    default:
      showControlButtons();
      break;
  }
}

/**
 * 13. setupSubmenuClickListeners - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.

 */

export function setupSubmenuClickListeners() {
  document.querySelectorAll('.menu-btn[data-feature]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const feature = btn.getAttribute('data-feature');
      console.log(`Feature selected: ${feature}`);
      handleFeatureSelection(feature);
      closeCarouselModal();
      event.stopPropagation();
    });
  });
}

function handleSubmenuItemClick(feature, item) {
  console.log(`Item do submenu "${feature}" clicado: ${item.textContent}`);
  showNotification(`Você selecionou: ${item.textContent}`, 'info');

  const lat = item.getAttribute('data-lat');
  const lon = item.getAttribute('data-lon');
  if (lat && lon) {
    adjustMapWithLocation(lat, lon, item.textContent);
  }
}

/**
 * 1. showControlButtonsTouristSpots - Exibe controles específicos para pontos turísticos.
 */
export function showControlButtonsTouristSpots() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para pontos turísticos exibidos.');
}

/**
 * 2. showControlButtonsTour - Exibe controles específicos para tours.
 */
export function showControlButtonsTour() {
  hideAllControlButtons();
  closeAssistantModal();
  const tourBtn = document.getElementById('tour-btn');
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (tourBtn) tourBtn.style.display = 'flex';
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para tours exibidos.');
}

/**
 * 3. showControlButtonsBeaches - Exibe controles específicos para praias.
 */
export function showControlButtonsBeaches() {
  hideAllControlButtons();
  closeAssistantModal();
  const reserveChairsBtn = document.getElementById('reserve-chairs-btn');
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (reserveChairsBtn) reserveChairsBtn.style.display = 'none';
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para praias exibidos.');
}

/**
 * 4. showControlButtonsNightlife - Exibe controles específicos para vida noturna.
 */
export function showControlButtonsNightlife() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  const buyTicketBtn = document.getElementById('buy-ticket-btn');
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  if (buyTicketBtn) buyTicketBtn.style.display = 'flex';
  console.log('Controles para vida noturna exibidos.');
}

/**
 * 5. showControlButtonsRestaurants - Exibe controles específicos para restaurantes.
 */
export function showControlButtonsRestaurants() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  const reserveRestaurantsBtn = document.getElementById(
    'reserve-restaurants-btn'
  );
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  if (reserveRestaurantsBtn) reserveRestaurantsBtn.style.display = 'flex';
  console.log('Controles para restaurantes exibidos.');
}

/**
 * 6. showControlButtonsShops - Exibe controles específicos para lojas.
 */
export function showControlButtonsShops() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const speakAttendentBtn = document.getElementById('speak-attendent-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (speakAttendentBtn) speakAttendentBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para lojas exibidos.');
}

/**
 * 7. showControlButtonsEmergencies - Exibe controles específicos para emergências.
 */
export function showControlButtonsEmergencies() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const callBtn = document.getElementById('call-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (callBtn) callBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para emergências exibidos.');
}

/**
 * 8. showControlButtonsTips - Exibe controles específicos para dicas.
 */
export function showControlButtonsTips() {
  hideAllControlButtons();
  closeAssistantModal();
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'none';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para dicas exibidos.');
}

/**
 * 9. showControlButtonsInns - Exibe controles específicos para pousadas.
 */
export function showControlButtonsInns() {
  hideAllControlButtons();
  closeAssistantModal();
  const reserveInnsBtn = document.getElementById('reserve-inns-btn');
  const createRouteBtn = document.getElementById('create-route-btn');
  const aboutMoreBtn = document.getElementById('about-more-btn');
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (reserveInnsBtn) reserveInnsBtn.style.display = 'none';
  if (createRouteBtn) createRouteBtn.style.display = 'flex';
  if (aboutMoreBtn) aboutMoreBtn.style.display = 'flex';
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para pousadas exibidos.');
}

/**
 * 10. showControlButtonsEducation - Exibe controles específicos para ensino.
 */
export function showControlButtonsEducation() {
  hideAllControlButtons();
  closeAssistantModal();
  const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';
  console.log('Controles para pousadas exibidos.');
}

/**
 * 11. showMenuButtons - Exibe os botões do menu lateral.
 */
export function showMenuButtons() {
  const menuButtons = document.querySelectorAll('.menu-btn');
  menuButtons.forEach((btn) => btn.classList.remove('hidden'));
  const menuToggle = document.getElementById('menu-btn');
  if (menuToggle) menuToggle.classList.remove('hidden');
  const floatingMenu = document.getElementById('floating-menu');
  if (floatingMenu) floatingMenu.classList.remove('hidden');
  console.log('showMenuButtons: Botões do menu exibidos.');
}

/**
 * 12. showButtons - Exibe um grupo de botões com base em seus IDs.
 */
export function showButtons(buttonIds) {
  const allButtons = document.querySelectorAll('.control-buttons button');
  allButtons.forEach((button) => (button.style.display = 'none'));

  buttonIds.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.style.display = 'inline-block';
    }
  });
}

/**
 * openDestinationWebsite
 *    Abre a URL de um destino em nova aba.
 */
export function openDestinationWebsite(url) {
  window.open(url, '_blank');
}

/**
 * 8. getUrlsForLocation - Retorna a URL associada a um local.
 */
function getUrlsForLocation(locationName) {
  const urlDatabase = {
    // Festas
    'Toca do Morcego': 'https://www.tocadomorcego.com.br/',
    Pulsar: 'http://example.com/pulsar',
    'Mama Iate': 'http://example.com/mama_iate',
    'Teatro do Morro': 'http://example.com/teatro_do_morro',
    // Passeios
    'Passeio de lancha Volta a Ilha de Tinharé':
      'https://passeiosmorro.com.br/passeio-volta-a-ilha',
    'Passeio de Quadriciclo para Garapuá':
      'https://passeiosmorro.com.br/passeio-de-quadriciclo',
    'Passeio 4X4 para Garapuá': 'https://passeiosmorro.com.br/passeio-de-4x4',
    'Passeio de Barco para Gamboa':
      'https://passeiosmorro.com.br/passeio-de-barco',
    // Restaurantes
    'Morena Bela': 'http://example.com/morena_bela',
    Basílico: 'http://example.com/basilico',
    'Ki Massa': 'http://example.com/ki_massa',
    'Tempeiro Caseiro': 'http://example.com/tempeiro_caseiro',
    Bizu: 'http://example.com/bizu',
    'Pedra Sobre Pedra': 'http://example.com/pedra_sobre_pedra',
    'Forno a Lenha de Mercedes': 'http://example.com/forno_a_lenha',
    'Ponto G': 'http://example.com/ponto_g',
    'Ponto 9,99': 'http://example.com/ponto_999',
    Patricia: 'http://example.com/patricia',
    'dizi 10': 'http://example.com/dizi_10',
    Papoula: 'http://example.com/papoula',
    'Sabor da terra': 'http://example.com/sabor_da_terra',
    'Branco&Negro': 'http://example.com/branco_negro',
    'Six Club': 'http://example.com/six_club',
    'Santa Villa': 'http://example.com/santa_villa',
    'Recanto do Aviador': 'http://example.com/recanto_do_aviador',
    Sambass: 'https://www.sambass.com.br/',
    'Bar e Restaurante da Morena': 'http://example.com/bar_restaurante_morena',
    'Restaurante Alecrim': 'http://example.com/restaurante_alecrim',
    'Andina Cozinha Latina': 'http://example.com/andina_cozinha_latina',
    'Papoula Culinária Artesanal':
      'http://example.com/papoula_culinaria_artesanal',
    'Minha Louca Paixão': 'https://www.minhaloucapaixao.com.br/',
    'Café das Artes': 'http://example.com/cafe_das_artes',
    Canoa: 'http://example.com/canoa',
    'Restaurante do Francisco': 'http://example.com/restaurante_francisco',
    'La Tabla': 'http://example.com/la_tabla',
    'Santa Luzia': 'http://example.com/santa_luzia',
    'Chez Max': 'http://example.com/chez_max',
    'Barraca da Miriam': 'http://example.com/barraca_miriam',
    'O Casarão restaurante': 'http://example.com/casarao_restaurante',
    // Pousadas
    'Hotel Fazenda Parque Vila': 'http://example.com/hotel_fazenda_parque_vila',
    Guaiamu: 'http://example.com/guaiamu',
    'Pousada Fazenda Caeiras': 'https://pousadacaeira.com.br/',
    'Amendoeira Hotel': 'http://example.com/amendoeira_hotel',
    'Pousada Natureza': 'http://example.com/pousada_natureza',
    'Pousada dos Pássaros': 'http://example.com/pousada_dos_passaros',
    'Hotel Morro de São Paulo': 'http://example.com/hotel_morro_sao_paulo',
    'Uma Janela para o Sol': 'http://example.com/uma_janela_para_sol',
    Portaló: 'http://example.com/portalo',
    'Pérola do Morro': 'http://example.com/perola_do_morro',
    'Safira do Morro': 'http://example.com/safira_do_morro',
    'Xerife Hotel': 'http://example.com/xerife_hotel',
    'Ilha da Saudade': 'http://example.com/ilha_da_saudade',
    'Porto dos Milagres': 'http://example.com/porto_dos_milagres',
    Passarte: 'http://example.com/passarte',
    'Pousada da Praça': 'http://example.com/pousada_da_praca',
    'Pousada Colibri': 'http://example.com/pousada_colibri',
    'Pousada Porto de Cima': 'http://example.com/pousada_porto_de_cima',
    'Vila Guaiamu': 'http://example.com/vila_guaiamu',
    'Villa dos Corais pousada': 'http://example.com/villa_dos_corais',
    'Hotel Anima': 'http://example.com/hotel_anima',
    'Vila dos Orixás Boutique Hotel & Spa':
      'http://example.com/vila_dos_orixas',
    'Hotel Karapitangui': 'http://example.com/hotel_karapitangui',
    'Pousada Timbalada': 'http://example.com/pousada_timbalada',
    'Casa Celestino Residence': 'http://example.com/casa_celestino_residence',
    'Bahia Bacana Pousada': 'http://example.com/bahia_bacana_pousada',
    'Hotel Morro da Saudade': 'http://example.com/hotel_morro_da_saudade',
    'Bangalô dos sonhos': 'http://example.com/bangalo_dos_sonhos',
    'Cantinho da Josete': 'http://example.com/cantinho_da_josete',
    'Vila Morro do Sao Paulo': 'http://example.com/vila_morro_sao_paulo',
    'Casa Rossa': 'http://example.com/casa_rossa',
    'Village Paraíso Tropical': 'http://example.com/village_paraiso_tropical',
    // Lojas
    Absolute: 'http://example.com/absolute',
    'Local Brasil': 'http://example.com/local_brasil',
    'Super Zimbo': 'http://example.com/super_zimbo',
    'Mateus Esquadrais': 'http://example.com/mateus_esquadrais',
    'São Pedro Imobiliária': 'http://example.com/sao_pedro_imobiliaria',
    'Imóveis Brasil Bahia': 'http://example.com/imoveis_brasil_bahia',
    Coruja: 'http://example.com/coruja',
    'Zimbo Dive': 'http://example.com/zimbo_dive',
    Havaianas: 'http://example.com/havaianas',
    // Emergências
    Ambulância: 'http://example.com/ambulancia',
    'Unidade de Saúde': 'http://example.com/unidade_de_saude',
    'Polícia Civil': 'http://example.com/policia_civil',
    'Polícia Militar': 'http://example.com/policia_militar',
  };

  return urlDatabase[locationName] || null;
}
