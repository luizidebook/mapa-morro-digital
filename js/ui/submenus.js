import { adjustMapWithLocation } from '../map/map-core.js';
import {
  displayCustomTouristSpots,
  displayCustomBeaches,
  displayCustomRestaurants,
  displayCustomShops,
} from '../map/map-markers.js';
import { giveVoiceFeedback } from '../ui/voice-control.js';
import {
  showControlButtonsTouristSpots,
  showControlButtonsTour,
  showControlButtonsBeaches,
  showControlButtonsRestaurants,
  showControlButtonsShops,
  showControlButtonsEmergencies,
  showControlButtonsEducation,
  showControlButtonsInns,
  showControlButtonsTips,
  showControlButtonsNightlife,
  showControlButtons,
} from '../ui/control-buttons.js';
import { clearMarkers } from '../map/map-markers.js';
import { saveDestinationToCache } from '../core/cache.js';
import { sendDestinationToServiceWorker } from '../core/service-worker.js';
import { clearCurrentRoute } from '../map/map-route.js';
import { getUrlsForLocation } from '../ui/carousel.js';
import { showDestinationContent } from '../ui/carousel.js';
import { closeCarouselModal } from '../ui/modals.js';
import { lastSelectedFeature } from '../core/state.js';

/**
 * 1. handleSubmenuButtonClick - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.
 */
export function handleSubmenuButtonClick(
  lat,
  lon,
  name,
  description,
  controlButtonsFn
) {
  // Atualiza o estado global do destino
  selectedDestination = { lat, lon, name, description };

  // Ajusta o mapa
  adjustMapWithLocation(lat, lon, name);

  // Notificação
  giveVoiceFeedback(`Destino ${name} selecionado com sucesso.`);
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

// 11. loadSubMenu - Carrega conteúdo do submenu
export function loadSubMenu(subMenuId, feature) {
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

/**
 * 12. handleSubmenuButton - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.
 */

export function handleSubmenuButtons(
  lat,
  lon,
  name,
  description,
  images,
  feature
) {
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

/**
 * displayOSMData
 * Exibe dados vindos do Overpass-API no submenu correspondente e cria marcadores no mapa.
 */
export function displayOSMData(data, subMenuId, feature) {
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
      showDestinationContent(destination);
    });
  });
}

/**
 * 14. handleFeatureSelection
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
