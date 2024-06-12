// scripts.js
let map;
let currentLocation;
let routingControl;
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
    'Sobre: Clique para saber mais sobre Morro Digital.'
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

function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function handleMenuClick(subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.style.display = subMenu.style.display === 'none' ? 'block' : 'none';
}

navigator.geolocation.getCurrentPosition(async function(position) {
    currentLocation = position.coords;

    map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    document.getElementById('loading').style.display = 'none';

    initMenuOptions();
    showInitialTutorialOptions();
}, function() {
    document.getElementById('loading').innerHTML = 'Não foi possível obter sua localização.';
});

async function fetchOSMData(query) {
    const url = `https://overpass-api.de/api/interpreter?data=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function displayOSMData(data, subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = ''; // Limpa o submenu antes de adicionar os novos elementos
    data.elements.forEach(element => {
        if (element.type === 'node' && element.tags.name) { // Adiciona apenas se houver um nome
            const btn = document.createElement('button');
            btn.className = 'submenu-btn';
            btn.textContent = element.tags.name;
            btn.onclick = () => showInfo(element.tags.name, [element.lat, element.lon]);
            subMenu.appendChild(btn);
        }
    });
}

function initMenuOptions() {
    const queries = {
        pontosTuristicosSubMenu: `[out:json];node["tourism"="attraction"](around:5000,-13.376,-38.913);out body;`,
        passeiosSubMenu: `[out:json];node["tourism"="information"](around:5000,-13.376,-38.913);out body;`,
        praiasSubMenu: `[out:json];node["natural"="beach"](around:5000,-13.376,-38.913);out body;`,
        vidaNoturnaSubMenu: `[out:json];node["amenity"="nightclub"](around:5000,-13.376,-38.913);out body;`,
        restaurantesSubMenu: `[out:json];node["amenity"="restaurant"](around:5000,-13.376,-38.913);out body;`,
                pousadasSubMenu: `[out:json];node["tourism"="hotel"](around:5000,-13.376,-38.913);out body;`,
        lojasSubMenu: `[out:json];node["shop"](around:5000,-13.376,-38.913);out body;`
    };

    for (const [subMenuId, query] of Object.entries(queries)) {
        fetchOSMData(query).then(data => displayOSMData(data, subMenuId));
    }
}

function showInitialTutorialOptions() {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'block';
    messageBox.innerHTML = `
        <p>Bem-vindo ao Morro Digital! Você gostaria de iniciar o tutorial que te ensinará todas as funcionalidades do site?</p>
        <button onclick="startTutorial()">Iniciar o Tutorial</button>
        <button onclick="closeTutorial()">Fechar o Tutorial</button>
    `;
}

function startTutorial() {
    tutorialStep = 0;
    nextTutorialStep();
}

function nextTutorialStep() {
    const messageBox = document.getElementById('message-box');
    if (tutorialStep < tutorialSteps.length) {
        messageBox.innerHTML = `<p>${tutorialSteps[tutorialStep]}</p><button onclick="nextTutorialStep()">Próximo</button>`;
        speakText(tutorialSteps[tutorialStep]);
        tutorialStep++;
    } else {
        messageBox.style.display = 'none';
    }
}

function closeTutorial() {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'none';
}

function showInfo(name, coordinates) {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'block';

    const info = infoTexts[name.toLowerCase().replace(/\s+/g, '')] || `Informações detalhadas sobre ${name}`;
    messageBox.innerHTML = `<p>${info}</p>`;
    speakText(info);

    if (coordinates) {
        showRoute(coordinates);
    }
}

function showRoute(destination) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(currentLocation.latitude, currentLocation.longitude),
            L.latLng(destination[0], destination[1])
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'foot'
        }),
        geocoder: L.Control.Geocoder.nominatim(),
        createMarker: function() { return null; },
        routeWhileDragging: true,
        lineOptions: {
            styles: [{ color: 'blue', opacity: 1, weight: 5 }]
        }
    }).addTo(map);
}

function createPersonalizedRoute() {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'block';
    messageBox.innerHTML = `
        <p>Por favor, selecione suas preferências para criar um roteiro personalizado:</p>
        <form id="route-form">
            <label>
                <input type="checkbox" name="preferences" value="praias"> Praias
            </label>
            <label>
                <input type="checkbox" name="preferences" value="pontosTuristicos"> Pontos Turísticos
            </label>
            <label>
                <input type="checkbox" name="preferences" value="passeios"> Passeios
            </label>
            <label>
                <input type="checkbox" name="preferences" value="vidaNoturna"> Vida Noturna
            </label>
            <label>
                <input type="checkbox" name="preferences" value="restaurantes"> Restaurantes
            </label>
            <label>
                <input type="checkbox" name="preferences" value="pousadas"> Pousadas
            </label>
            <label>
                <input type="checkbox" name="preferences" value="lojas"> Lojas
            </label>
            <button type="button" onclick="generatePersonalizedRoute()">Criar Roteiro</button>
        </form>
    `;
}

function generatePersonalizedRoute() {
    const form = document.getElementById('route-form');
    const selectedPreferences = Array.from(form.elements['preferences'])
        .filter(input => input.checked)
        .map(input => input.value);

    const queries = {
        praias: `[out:json];node["natural"="beach"](around:5000,-13.376,-38.913);out body;`,
        pontosTuristicos: `[out:json];node["tourism"="attraction"](around:5000,-13.376,-38.913);out body;`,
        passeios: `[out:json];node["tourism"="information"](around:5000,-13.376,-38.913);out body;`,
        vidaNoturna: `[out:json];node["amenity"="nightclub"](around:5000,-13.376,-38.913);out body;`,
        restaurantes: `[out:json];node["amenity"="restaurant"](around:5000,-13.376,-38.913);out body;`,
        pousadas: `[out:json];node["tourism"="hotel"](around:5000,-13.376,-38.913);out body;`,
        lojas: `[out:json];node["shop"](around:5000,-13.376,-38.913);out body;`
    };

    const requests = selectedPreferences.map(pref => fetchOSMData(queries[pref]));

    Promise.all(requests).then(responses => {
        const allData = responses.flatMap(data => data.elements);
        const filteredData = allData.filter((item, index, self) => 
            index === self.findIndex((t) => (
                t.id === item.id
            ))
        );

        displayOSMData({ elements: filteredData }, 'routeResults');
    });
}

function toggleSearch() {
    const searchBox = document.getElementById('search-box');
    searchBox.style.display = searchBox.style.display === 'none' ? 'block' : 'none';
}

function searchMap() {
    const query = document.getElementById('search-input').value;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&viewbox=-38.92,-13.37,-38.89,-13.38&bounded=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const searchResults = data.map(place => ({
                name: place.display_name,
                lat: place.lat,
                lon: place.lon
            }));
            displaySearchResults(searchResults);
        });
}

function displaySearchResults(results) {
    const subMenu = document.getElementById('searchResults');
    subMenu.innerHTML = ''; // Limpa o submenu antes de adicionar os novos elementos
    results.forEach(result => {
        const btn = document.createElement('button');
        btn.className = 'submenu-btn';
        btn.textContent = result.name;
        btn.onclick = () => showInfo(result.name, [result.lat, result.lon]);
        subMenu.appendChild(btn);
    });
}

function savePreferences() {
    const selectedPreferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked'))
        .map(input => input.value);
    localStorage.setItem('preferences', JSON.stringify(selectedPreferences));
}

function loadPreferences() {
    const savedPreferences = JSON.parse(localStorage.getItem('preferences'));
    if (savedPreferences) {
        savedPreferences.forEach(pref => {
            document.querySelector(`input[name="preferences"][value="${pref}"]`).checked = true;
        });
    }
}

window.addEventListener('load', loadPreferences);
document.getElementById('route-form').addEventListener('change', savePreferences);

function sendRecommendation() {
    const preferences = JSON.parse(localStorage.getItem('preferences')) || [];
    // Simulate sending preferences to server for recommendations
    console.log('Enviando preferências para recomendações:', preferences);
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'block';
    messageBox.innerHTML = '<p>Suas preferências foram enviadas para recomendação!</p>';
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        speechSynthesis.speak(utterance);
    } else {
        console.warn('API de síntese de voz não suportada neste navegador.');
    }
}

function startVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            handleVoiceCommand(transcript);
        };

        recognition.onerror = function(event) {
            console.error('Erro no reconhecimento de voz:', event.error);
        };

        recognition.onend = function() {
            console.log('Reconhecimento de voz encerrado.');
        };

        recognition.start();
    } else {
        alert('API de reconhecimento de voz não suportada neste navegador.');
    }
}

function handleVoiceCommand(command) {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('mapa')) {
        toggleMenu();
    } else if (lowerCommand.includes('história')) {
        showMessage('historia');
    } else if (lowerCommand.includes('praias')) {
        handleMenuClick('praiasSubMenu');
    } else if (lowerCommand.includes('pontos turísticos')) {
        handleMenuClick('pontosTuristicosSubMenu');
    } else {
        alert(`Comando de voz não reconhecido: ${command}`);
    }
}

function openGuide() {
    document.getElementById('guide-modal').style.display = 'block';
}

function openTranslation() {
    document.getElementById('translation-modal').style.display = 'block';
}

function openReservations() {
    document.getElementById('reservation-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function askGuide() {
    const question = document.getElementById('guide-input').value;
    const responseBox = document.getElementById('guide-response');
    // Simulate a guide response
    const response = `Aqui está a resposta para sua pergunta sobre "${question}" em Morro de São Paulo.`;
    responseBox.innerHTML = `<p>${response}</p>`;
    speakText(response);
}

function translatePage() {
    const lang = document.getElementById('language-select').value;
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translations[lang][key];
    });
    speakText('Página traduzida com sucesso.');
}

const translations = {
    en: {
        'menu': 'Menu',
        'historia': 'History of Morro',
        'pontosTuristicos': 'Tourist Attractions',
        'passeios': 'Tours',
        'praias': 'Beaches',
        'vidaNoturna': 'Nightlife',
        'restaurantes': 'Restaurants',
        'pousadas': 'Lodgings',
        'lojas': 'Shops',
        'dicas': 'Tips',
        'emergencias': 'Emergencies',
        'sobre': 'About',
        'personalizedRoute': 'Personalized Route',
        'guide': 'Interactive Guide',
        'translation': 'Translation',
        'reservations': 'Reservations'
    },
    es: {
        'menu': 'Menú',
        'historia': 'Historia de Morro',
        'pontosTuristicos': 'Atracciones turísticas',
        'passeios': 'Tours',
        'praias': 'Playas',
        'vidaNoturna': 'Vida nocturna',
        'restaurantes': 'Restaurantes',
        'pousadas': 'Alojamientos',
        'lojas': 'Tiendas',
        'dicas': 'Consejos',
        'emergencias': 'Emergencias',
        'sobre': 'Acerca de',
        'personalizedRoute': 'Ruta personalizada',
        'guide': 'Guía interactiva',
        'translation': 'Traducción',
        'reservations': 'Reservas'
    }
};

async function makeReservation() {
    const form = document.getElementById('reservation-form');
    const formData = new FormData(form);
    const reservationData = {
        name: formData.get('name'),
        email: formData.get('email'),
        date: formData.get('date'),
        time: formData.get('time'),
        type: formData.get('type')
    };

    // Simulate sending reservation data to the server
    console.log('Enviando dados da reserva:', reservationData);

    // Simulate reservation confirmation
    const responseBox = document.getElementById('reservation-response');
    responseBox.innerHTML = `<p>Reserva confirmada para ${reservationData.name} em ${reservationData.date} às ${reservationData.time} para ${reservationData.type}.</p>`;
    speakText('Reserva confirmada com sucesso.');

    // Integrate with payment system (simulation)
    await processPayment(reservationData);
}

async function processPayment(reservationData) {
    // Simulate payment processing
    console.log('Processando pagamento para:', reservationData);
    const paymentSuccess = true; // Simulating a successful payment

    if (paymentSuccess) {
        console.log('Pagamento confirmado para:', reservationData);
        const responseBox = document.getElementById('reservation-response');
        responseBox.innerHTML += `<p>Pagamento confirmado para a reserva de ${reservationData.type}.</p>`;
        speakText('Pagamento confirmado com sucesso.');
    } else {
        console.error('Erro no processamento do pagamento para:', reservationData);
        const responseBox = document.getElementById('reservation-response');
        responseBox.innerHTML += `<p>Erro no processamento do pagamento. Tente novamente.</p>`;
        speakText('Erro no processamento do pagamento. Tente novamente.');
    }
}

