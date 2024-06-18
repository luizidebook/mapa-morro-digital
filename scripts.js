let map;
let routingControl;
let pedestrianPaths = [];
let informalPaths = [];
let tutorialStep = 0;
const tutorialSteps = [
    'Bem-vindo ao Morro Digital! Este tutorial irá guiá-lo através das funcionalidades do site.',
    'Primeiro, veja o mapa interativo que mostra sua localização atual e permite explorar a área ao redor.',
    'Use o botão ☰ Menu para abrir e fechar o menu.',
    'No menu, você pode acessar informações sobre História de Morro, Pontos Turísticos, Passeios, Praias, Vida Noturna, Restaurantes, Pousadas, Lojas, Dicas, Emergências e Sobre.',
    'Clique em qualquer item do menu para obter mais informações na caixa de mensagens.',
    'História de Morro: Clique para aprender sobre a rica história de Morro de São Paulo.',
    'Pontos Turísticos: Clique para explorar os pontos turísticos populares.',
    'Passeios: Clique para ver as opções de passeios disponíveis.',
    'Praias: Clique para descobrir as belas praias da região.',
    'Vida Noturna: Clique para conhecer os melhores locais para curtir a noite.',
    'Restaurantes: Clique para ver os melhores restaurantes da área.',
    'Pousadas: Clique para encontrar opções de hospedagem.',
    'Lojas: Clique para encontrar lojas e locais para comprar lembranças.',
    'Dicas: Clique para obter dicas úteis sobre Morro de São Paulo.',
    'Emergências: Clique para ver contatos de emergência importantes.',
    'Sobre: Clique para saber mais sobre a Morro Digital.'
];

const infoTexts = {
    historia: 'Conheça a rica história de Morro de São Paulo...',
    pontosTuristicos: 'Descubra os pontos turísticos imperdíveis de Morro de São Paulo...',
    passeios: 'Aproveite os melhores passeios em Morro de São Paulo...',
    praias: 'Morro de São Paulo é famoso por suas praias paradisíacas...',
    vidaNoturna: 'A vida noturna em Morro de São Paulo é vibrante e diversificada...',
    restaurantes: 'Experimente a gastronomia de Morro de São Paulo...',
    pousadas: 'Encontre as melhores opções de hospedagem em Morro de São Paulo...',
    lojas: 'Explore as lojas de Morro de São Paulo...',
    dicas: 'Confira dicas úteis para aproveitar ao máximo sua estadia...',
    emergencias: 'Encontre informações importantes de contatos de emergência...',
    sobre: 'Saiba mais sobre a Morro Digital...'
};

const queries = {
    pontosTuristicosSubMenu: `[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;`,
    passeiosSubMenu: `[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;`,
    praiasSubMenu: `[out:json];node["natural"="beach"](around:10000,-13.376,-38.913);out body;`,
    vidaNoturnaSubMenu: `[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;`,
    restaurantesSubMenu: `[out:json];node["amenity"="restaurant"](around:10000,-13.376,-38.913);out body;`,
    pousadasSubMenu: `[out:json];node["tourism"="hotel"](around:10000,-13.376,-38.913);out body;`,
    lojasSubMenu: `[out:json];node["shop"](around:10000,-13.376,-38.913);out body;`
};

const pedestrianQuery = `
[out:json];
(
  way["highway"="footway"](around:10000,-13.376,-38.913);
  way["highway"="path"](around:10000,-13.376,-38.913);
);
out body;
>;;
out skel qt;
`;

function initMap() {
    map = L.map('map').setView([-13.377778, -38.9125], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
    L.marker([-13.377778, -38.9125]).addTo(map)
        .bindPopup('<b>Morro de São Paulo</b><br>Um lugar incrível!')
        .openPopup();
    fetchOSMData(pedestrianQuery).then(data => {
        pedestrianPaths = data.elements.filter(element => element.type === 'way' && element.tags.highway === 'footway');
        informalPaths = data.elements.filter(element => element.type === 'way' && element.tags.highway === 'path');
    });
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

function toggleSubMenu(subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.style.display = (subMenu.style.display === 'block') ? 'none' : 'block';
}

function startVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.onstart = () => showNotification('Reconhecimento de voz iniciado!');
        recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            showNotification('Você disse: ' + result);
            document.getElementById('search-input').value = result;
            searchMap();
        };
        recognition.start();
    } else {
        showNotification('Seu navegador não suporta reconhecimento de voz.');
    }
}

function toggleMessage() {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = (messageBox.style.display === 'block') ? 'none' : 'block';
}

function toggleSearch() {
    const searchBox = document.getElementById('search-box');
    searchBox.style.display = (searchBox.style.display === 'block') ? 'none' : 'block';
}

function searchMap() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    searchResults.style.display = 'none';
    loadingIndicator.style.display = 'block';

    const pointsOfInterest = [
        { name: 'Farol do Morro', lat: -13.375, lng: -38.917 },
        { name: 'Praia de Gamboa', lat: -13.367, lng: -38.911 },
        { name: 'Igreja Nossa Senhora da Luz', lat: -13.379, lng: -38.914 },
        { name: 'Forte de Morro de São Paulo', lat: -13.379, lng: -38.914 },
        { name: 'Fonte Grande', lat: -13.379, lng: -38.914 }
    ];

    setTimeout(() => {
        searchResults.innerHTML = '';
        pointsOfInterest.forEach(point => {
            if (point.name.toLowerCase().includes(searchTerm)) {
                const resultItem = document.createElement('div');
                resultItem.textContent = point.name;
                resultItem.onclick = () => {
                    map.setView([point.lat, point.lng], 15);
                    L.popup()
                        .setLatLng([point.lat, point.lng])
                        .setContent(point.name)
                        .openOn(map);
                    showDetailModal(point.name, 'Detalhes sobre ' + point.name);
                };
                searchResults.appendChild(resultItem);
            }
        });

        if (searchResults.innerHTML === '') {
            searchResults.innerHTML = 'Nenhum resultado encontrado.';
        }

        loadingIndicator.style.display = 'none';
        searchResults.style.display = 'block';
    }, 1000); // Simulação de tempo de carregamento
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

function showDetailModal(title, content) {
    const detailContent = document.getElementById('detail-content');
    detailContent.innerHTML = `<h2>${title}</h2><p>${content}</p>`;
    const detailModal = document.getElementById('detail-modal');
    detailModal.style.display = 'block';
}

function translatePage(language) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translations[language][key];
    });
}

const translations = {
    pt: {
        welcome: 'Bem-vindo ao Morro Digital! Selecione um idioma:',
        searchPlaceholder: 'Pesquisar...',
        searchButton: 'Pesquisar',
        menuToggle: '☰ Menu',
        voiceRec: '🎤',
        messageToggle: '💬',
        searchToggle: '🔍'
    },
    en: {
        welcome: 'Welcome to Morro Digital! Select a language:',
        searchPlaceholder: 'Search...',
        searchButton: 'Search',
        menuToggle: '☰ Menu',
        voiceRec: '🎤',
        messageToggle: '💬',
        searchToggle: '🔍'
    },
    es: {
        welcome: '¡Bienvenido a Morro Digital! Seleccione un idioma:',
        searchPlaceholder: 'Buscar...',
        searchButton: 'Buscar',
        menuToggle: '☰ Menú',
        voiceRec: '🎤',
        messageToggle: '💬',
        searchToggle: '🔍'
    },
    he: {
        welcome: 'ברוכים הבאים ל-Morro Digital! בחר שפה:',
        searchPlaceholder: 'חפש...',
        searchButton: 'חפש',
        menuToggle: '☰ תפריט',
        voiceRec: '🎤',
        messageToggle: '💬',
        searchToggle: '🔍'
    }
};

function handleMenuClick(subMenuId) {
    const subMenus = document.querySelectorAll('.submenu');
    subMenus.forEach(subMenu => subMenu.style.display = 'none');
    const subMenu = document.getElementById(subMenuId);
    if (subMenu) {
        subMenu.style.display = 'block';
        document.getElementById('message-box').innerText = infoTexts[subMenuId.replace('SubMenu', '')];
        toggleMessage();
    }
}

function loadSubMenu(subMenuId) {
    const subMenus = document.querySelectorAll('.submenu');
    subMenus.forEach(subMenu => subMenu.style.display = 'none');
    const subMenu = document.getElementById(subMenuId);
    const contentDiv = document.getElementById(subMenuId.replace('SubMenu', 'Content'));

    if (contentDiv.innerHTML === '') {
        fetchOSMData(queries[subMenuId], contentDiv);
    }

    if (subMenu) {
        subMenu.style.display = 'block';
    }
}

function fetchOSMData(query, container) {
    fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
    })
    .then(response => response.json())
    .then(data => {
        displayOSMData(data, container);
    })
    .catch(error => console.error('Error fetching OSM data:', error));
}

function displayOSMData(data, container) {
    container.innerHTML = '';

    data.elements.forEach(element => {
        const name = element.tags.name || 'Unnamed';
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = name;
        btn.onclick = () => {
            const latLng = element.type === 'node' ? [element.lat, element.lon] : [element.bounds.minlat, element.bounds.minlon];
            map.setView(latLng, 15);
            if (routingControl) {
                map.removeControl(routingControl);
            }
            routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(-13.377778, -38.9125),
                    L.latLng(latLng[0], latLng[1])
                ],
                routeWhileDragging: true,
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1',
                    profile: 'foot'
                })
            }).addTo(map);
            showDetailModal(name, `Detalhes sobre ${name}`);
        };
        container.appendChild(btn);
    });
}

function startTutorial() {
    showNotification(tutorialSteps[tutorialStep]);
    tutorialStep++;
    if (tutorialStep < tutorialSteps.length) {
        setTimeout(startTutorial, 5000);
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function shareOnFacebook() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + window.location.href, '_blank');
}

function shareOnTwitter() {
    window.open('https://twitter.com/intent/tweet?url=' + window.location.href, '_blank');
}

function shareOnInstagram() {
    showNotification('Compartilhar no Instagram não é suportado diretamente. Por favor, copie o link e cole no seu Instagram.');
}

function trackUsage(action) {
    console.log('Ação rastreada:', action);
    // Implementar lógica para enviar dados de rastreamento para um servidor
}

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    startTutorial();
    trackUsage('page_load');
    document.getElementById('menu-toggle-btn').addEventListener('click', () => trackUsage('toggle_menu'));
    document.getElementById('voice-rec-btn').addEventListener('click', () => trackUsage('start_voice_recognition'));
    document.getElementById('message-toggle-btn').addEventListener('click', () => trackUsage('toggle_message'));
    document.getElementById('search-toggle-btn').addEventListener('click', () => trackUsage('toggle_search'));
    initMenuOptions();
});
