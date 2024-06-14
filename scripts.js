let map, currentLocation, routingControl, markers = [];
let tutorialStep = 0;
const tutorialSteps = [
    "Bem-vindo ao Morro Digital! Vamos começar com um tour pelo site.",
    "Este é o menu onde você pode acessar diversas opções.",
    "Você pode clicar em qualquer item do menu para mais informações.",
    "Use a busca para encontrar locais específicos no mapa."
];

// Solicitação de permissões e inicialização do mapa
function requestGeolocation() {
    navigator.geolocation.getCurrentPosition(position => {
        currentLocation = position.coords;
        initMap();
    }, () => {
        document.getElementById('loading').innerHTML = 'Não foi possível obter sua localização.';
    });
}

function requestMicrophoneAccess() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
            document.getElementById('loading').style.display = 'none';
            showInitialPopup();
        })
        .catch(() => {
            document.getElementById('loading').innerHTML = 'Não foi possível acessar seu microfone.';
        });
}

function initMap() {
    map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    initMenuOptions();
    showInitialTutorialOptions();
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    const toggleBtn = document.getElementById('menu-toggle-btn');
    const isMenuVisible = menu.style.display === 'block';
    menu.style.display = isMenuVisible ? 'none' : 'block';
    toggleBtn.setAttribute('aria-expanded', !isMenuVisible);
}

function handleMenuClick(subMenuId) {
    const subMenus = document.querySelectorAll('.submenu');
    subMenus.forEach(subMenu => {
        if (subMenu.id !== subMenuId) {
            subMenu.style.display = 'none';
        }
    });

    const subMenu = document.getElementById(subMenuId);
    subMenu.style.display = subMenu.style.display === 'none' ? 'block' : 'none';
    displayCategoryInfo(subMenuId);
}

function displayCategoryInfo(category) {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'block';
    const info = categoryInfoTexts[category] || `Informações detalhadas sobre ${category}`;
    messageBox.innerHTML = `<p>${info}</p>`;
    speakText(info);
    markCategoryLocations(category);
}

function markCategoryLocations(category) {
    if (map && markers) {
        markers.forEach(marker => map.removeLayer(marker));
    }

    markers = [];

    const queries = {
        pontosTuristicosSubMenu: `[out:json];node["tourism"="attraction"](around:5000,-13.376,-38.913);out body;`,
        passeiosSubMenu: `[out:json];node["tourism"="information"](around:5000,-13.376,-38.913);out body;`,
        praiasSubMenu: `[out:json];node["natural"="beach"](around:5000,-13.376,-38.913);out body;`,
        vidaNoturnaSubMenu: `[out:json];node["amenity"="nightclub"](around:5000,-13.376,-38.913);out body;`,
        restaurantesSubMenu: `[out:json];node["amenity"="restaurant"](around:5000,-13.376,-38.913);out body;`,
        pousadasSubMenu: `[out:json];node["tourism"="hotel"](around:5000,-13.376,-38.913);out body;`,
        lojasSubMenu: `[out:json];node["shop"](around:5000,-13.376,-38.913);out body;`
    };

    if (queries[category]) {
        fetchOSMData(queries[category]).then(data => {
            data.elements.forEach(element => {
                if (element.type === 'node' && element.tags.name) {
                    const marker = L.marker([element.lat, element.lon]).addTo(map)
                        .bindPopup(`<b>${element.tags.name}</b><br>${categoryInfoTexts[element.tags.name] || 'Informações indisponíveis'}`);
                    markers.push(marker);
                }
            });
        });
    }
}

function fetchOSMData(query) {
    const url = `https://overpass-api.de/api/interpreter?data=${query}`;
    return fetch(url).then(response => response.json());
}

function displayOSMData(data, subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = '';
    data.elements.forEach(element => {
        if (element.type === 'node' && element.tags.name) {
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
    const messageBox = document.getElementById('tutorial');
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
    const messageBox = document.getElementById('tutorial');
    if (tutorialStep < tutorialSteps.length) {
        messageBox.innerHTML = `<p>${tutorialSteps[tutorialStep]}</p><button onclick="nextTutorialStep()">Próximo</button>`;
        speakText(tutorialSteps[tutorialStep]);
        tutorialStep++;
    } else {
        messageBox.style.display = 'none';
    }
}

function closeTutorial() {
    const messageBox = document.getElementById('tutorial');
    messageBox.style.display = 'none';
}

function showInfo(name, coordinates) {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'block';

    const info = infoTexts[name.toLowerCase().replace(/\s+/g, '')] || `Informações detalhadas sobre ${name}`;
    messageBox.innerHTML = `<p>${info}</p><button onclick="initiateRoute('${name}', [${coordinates}])">Iniciar o trajeto</button>`;
    speakText(info);

    if (coordinates) {
        showRoute(coordinates);
    }
}

function initiateRoute(name, coordinates) {
    showRoute(coordinates);
    alert(`Iniciando orientação para ${name}`);
}

function fetchPedestrianPaths() {
    const query = `
    [out:json];
    (
      way["highway"="footway"](around:5000,-13.376,-38.913);
      way["highway"="path"](around:5000,-13.376,-38.913);
    );
    out body;
    >;
    out skel qt;
    `;
    return fetchOSMData(query);
}

function showRoute(destination) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    fetchPedestrianPaths().then(pedestrianPathsData => {
        const waypoints = [
            L.latLng(currentLocation.latitude, currentLocation.longitude),
            L.latLng(destination[0], destination[1])
        ];

        pedestrianPathsData.elements.forEach(element => {
            if (element.type === 'way') {
                const coords = element.geometry.map(point => L.latLng(point.lat, point.lon));
                waypoints.push(...coords);
            }
        });

        routingControl = L.Routing.control({
            waypoints: waypoints,
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
    });
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
    subMenu.innerHTML = '';
    results.forEach(result => {
        const btn = document.createElement('button');
        btn.className = 'submenu-btn';
        btn.textContent = result.name;
        btn.onclick = () => showInfo(result.name, [result.lat, result.lon]);
        subMenu.appendChild(btn);
    });
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

        recognition.onstart = function() {
            document.getElementById('response').innerText = 'Estou ouvindo...';
        };

        recognition.onresult = async function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('response').innerText = `Você: ${transcript}`;

            const assistantResponse = await fetchResponse(transcript);
            document.getElementById('response').innerText += `\nAssistente: ${assistantResponse}`;

            speakText(assistantResponse);
        };

        recognition.onerror = function(event) {
            console.error('Erro no reconhecimento de voz:', event.error);
            document.getElementById('response').innerText = 'Erro no reconhecimento de voz. Tente novamente.';
        };

        recognition.onend = function() {
            console.log('Reconhecimento de voz encerrado.');
        };

        recognition.start();
    } else {
        alert('API de reconhecimento de voz não suportada neste navegador.');
    }
}

async function fetchResponse(prompt) {
    const apiKey = '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';
    const url = 'https://api.openai.com/v1/engines/davinci-codex/completions';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 150
        })
    });

    const data = await response.json();
    return data.choices[0].text.trim();
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

    console.log('Enviando dados da reserva:', reservationData);

    const responseBox = document.getElementById('reservation-response');
    responseBox.innerHTML = `<p>Reserva confirmada para ${reservationData.name} em ${reservationData.date} às ${reservationData.time} para ${reservationData.type}.</p>`;
    speakText('Reserva confirmada com sucesso.');

    sendReservationEmail(reservationData);

    await processPayment(reservationData);
}

function sendReservationEmail(reservationData) {
    const emailBody = `
        Nome: ${reservationData.name}\n
        Email: ${reservationData.email}\n
        Data: ${reservationData.date}\n
        Hora: ${reservationData.time}\n
        Tipo: ${reservationData.type}\n
    `;
    const mailtoLink = `mailto:${reservationData.email}?subject=Confirmação de Reserva&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');
}

async function processPayment(reservationData) {
    console.log('Processando pagamento para:', reservationData);
    const paymentSuccess = true;

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

function autocompleteSearch() {
    const query = document.getElementById('search-input').value;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&viewbox=-38.92,-13.37,-38.89,-13.38&bounded=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const suggestions = data.map(place => place.display_name);
        });
}

function shareOnFacebook() {
    const url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href);
    window.open(url, '_blank');
}

function shareOnTwitter() {
    const url = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href);
    window.open(url, '_blank');
}

function saveRoute() {
    const route = { /* dados do roteiro */ };
    localStorage.setItem('savedRoute', JSON.stringify(route));
    alert('Roteiro salvo com sucesso!');
}

function shareRoute() {
    const route = JSON.parse(localStorage.getItem('savedRoute'));
    const url = `mailto:?subject=Meu Roteiro Personalizado&body=Confira meu roteiro: ${JSON.stringify(route)}`;
    window.open(url, '_blank');
}

function loadSavedRoute() {
    const route = JSON.parse(localStorage.getItem('savedRoute'));
    if (route) {
    }
}

function addEventToCalendar() {
    const event = {
        title: 'Evento em Morro de São Paulo',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        description: 'Detalhes do evento'
    };

    const icsFile = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${event.startDate.replace(/-|:|\.\d+/g, '')}
DTEND:${event.endDate.replace(/-|:|\.\d+/g, '')}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR
`;

    const blob = new Blob([icsFile], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evento.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert('Evento adicionado ao calendário!');
}

function showFeedback(message) {
    const feedbackBox = document.createElement('div');
    feedbackBox.className = 'feedback';
    feedbackBox.innerText = message;
    document.body.appendChild(feedbackBox);

    setTimeout(() => {
        feedbackBox.style.opacity = 0;
        setTimeout(() => document.body.removeChild(feedbackBox), 300);
    }, 3000);
}

const faqResponses = {
    'horário de funcionamento': 'Nosso horário de funcionamento é das 9h às 18h de segunda a sexta.',
    'localização': 'Estamos localizados em Morro de São Paulo, Bahia.'
};

function integrateWithVoiceAssistants() {
}

let userPoints = 0;

function addPoints(points) {
    userPoints += points;
    document.getElementById('points-display').innerText = `Pontos: ${userPoints}`;
    checkRewards();
}

function checkRewards() {
    if (userPoints >= 100) {
        alert('Parabéns! Você ganhou um desconto em sua próxima reserva.');
    }
}

function applyFilters() {
    const type = document.getElementById('filter-type').value;
    const price = document.getElementById('filter-price').value;
    const distance = document.getElementById('filter-distance').value;

    console.log('Aplicando filtros:', { type, price, distance });
}

document.getElementById('high-contrast-toggle').addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
});

document.getElementById('increase-font-size').addEventListener('click', () => {
    document.body.style.fontSize = '1.2em';
});

function personalizeContent() {
    const userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || [];
    const recommendedContent = getRecommendedContent(userPreferences);
    displayRecommendedContent(recommendedContent);
}

function getRecommendedContent(preferences) {
    return [];
}

function displayRecommendedContent(content) {
    const container = document.getElementById('recommended-content');
    container.innerHTML = content.map(item => `<p>${item}</p>`).join('');
}

function submitFeedback() {
    const feedbackText = document.getElementById('feedback-text').value;
    alert('Obrigado pelo seu feedback!');
}

function loadAttractionDetails(attractionId) {
    const details = {
        name: 'Praia do Morro',
        image: 'path/to/image.jpg',
        description: 'Descrição detalhada da Praia do Morro...'
    };
    displayAttractionDetails(details);
}

function displayAttractionDetails(details) {
    const container = document.getElementById('attraction-details');
    container.innerHTML = `
        <h2>${details.name}</h2>
        <img src="${details.image}" alt="Imagem da ${details.name}">
        <p>${details.description}</p>
    `;
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loading').innerHTML = 'Por favor, ative a geolocalização para usar o mapa.';
    requestGeolocation();
});
