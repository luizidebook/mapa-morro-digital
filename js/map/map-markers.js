import { handleSubmenuButtons } from '../ui/submenus.js';
import { fetchOSMData, displayOSMData, map, markers } from './map-core.js';
import { queries } from '../core/config.js';
import { hideAllButtons } from '../ui/buttons.js';

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
export function displayCustomBeaches() {
  fetchOSMData(queries['beaches-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'beaches-submenu', 'praias');
    }
  });
}

/**
 * 3. displayCustomEducation - Exibe dados educacionais customizados.
 */
export function displayCustomEducation() {
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
export function displayCustomEmergencies() {
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
export function displayCustomInns() {
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
export function displayCustomNightlife() {
  fetchOSMData(queries['nightlife-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'nightlife-submenu', 'festas');
    }
  });
}

/**
 * 8. displayCustomRestaurants - Exibe dados de restaurantes customizados.
 */
export function displayCustomRestaurants() {
  fetchOSMData(queries['restaurants-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'restaurants-submenu', 'restaurantes');
    }
  });
}

/**
 * 9. displayCustomShops - Exibe dados de lojas customizados.
 */
export function displayCustomShops() {
  fetchOSMData(queries['shops-submenu']).then((data) => {
    if (data) {
      displayOSMData(data, 'shops-submenu', 'lojas');
    }
  });
}

/**
 * 10. displayCustomTips - Exibe dados de dicas customizados.
 */
export function displayCustomTips() {
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
export function displayCustomTouristSpots() {
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
export function displayCustomTours() {
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
