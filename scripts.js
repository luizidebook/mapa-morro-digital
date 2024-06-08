let map;
const searchCache = {};

document.addEventListener('DOMContentLoaded', function () {
    initialize();
});

function initialize() {
    map = L.map('map').setView([-13.385, -38.916], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            map.setView([userLat, userLon], 13);
            L.marker([userLat, userLon]).addTo(map).bindPopup('Sua localização').openPopup();
        });
    }
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function toggleInfoPanel() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.style.display = infoPanel.style.display === 'none' ? 'block' : 'none';
}

function toggleRouteSummary() {
    const routeSummary = document.getElementById('route-summary');
    routeSummary.style.display = routeSummary.style.display === 'none' ? 'block' : 'none';
}

function toggleTutorialPanel() {
    const tutorialPanel = document.getElementById('tutorial-panel');
    tutorialPanel.style.display = tutorialPanel.style.display === 'none' ? 'block' : 'none';
}

function showPanel(panel) {
    const infoContent = document.getElementById('info-content');
    let content = '';
    switch (panel) {
        case 'create-itinerary':
            content = generateItineraryForm();
            break;
        case 'search-map':
            content = generateSearchMapForm();
            break;
        case 'points-of-interest':
            content = generatePointsOfInterest();
            break;
        case 'tours':
            content = generateTours();
            break;
        case 'beaches':
            content = generateBeaches();
            break;
        case 'events':
            content = generateEvents();
            break;
        case 'restaurants':
            content = generateRestaurants();
            break;
        case 'accommodations':
            content = generateAccommodations();
            break;
        case 'shops':
            content = generateShops();
            break;
        case 'tips':
            content = generateTips();
            break;
        case 'emergencies':
            content = generateEmergencies();
            break;
    }
    infoContent.innerHTML = content;
    toggleInfoPanel();
}

function generateItineraryForm() {
    return `
        <h3>Criar Roteiros Personalizados</h3>
        <form id="itinerary-form">
            <div class="form-group">
                <label for="name">Nome</label>
                <input type="text" class="form-control" id="name" required>
            </div>
            <div class="form-group">
                <label for="location">De onde você é?</label>
                <input type="text" class="form-control" id="location" required>
            </div>
            <div class="form-group">
                <label for="visit">Primeira vez em Morro de São Paulo?</label>
                <select class="form-control" id="visit" required>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                </select>
            </div>
            <div class="form-group">
                <label for="activities">Quais atividades você já realizou em Morro?</label>
                <input type="text" class="form-control" id="activities">
            </div>
            <div class="form-group">
                <label for="preferences">Preferências de atividades</label>
                <input type="text" class="form-control" id="preferences">
            </div>
            <div class="form-group">
                <label for="budget">Orçamento disponível</label>
                <input type="number" class="form-control" id="budget" required>
            </div>
            <button type="button" class="btn btn-primary" onclick="createItinerary()">Criar Roteiro</button>
        </form>
    `;
}

function generateSearchMapForm() {
    return `
        <h3>Buscar no Mapa</h3>
        <div class="form-group">
            <input type="text" class="form-control" id="search-input" placeholder="Digite aqui...">
        </div>
        <button class="btn btn-primary" onclick="searchMap()">Pesquisar</button>
        <div id="search-results" class="mt-3"></div>
    `;
}

function generatePointsOfInterest() {
    return `
        <h3>Pontos de Interesse</h3>
        <ul>
            <li onclick="showLocationDetails('Toca do Morcego')">Toca do Morcego</li>
            <li onclick="showLocationDetails('Igreja Nossa Senhora da Luz')">Igreja Nossa Senhora da Luz</li>
            <li onclick="showLocationDetails('Praça Aureliano')">Praça Aureliano</li>
            <li onclick="showLocationDetails('Farol do Morro')">Farol do Morro</li>
            <li onclick="showLocationDetails('Fortaleza de Tapirandú')">Fortaleza de Tapirandú</li>
            <li onclick="showLocationDetails('Paredão da Argila')">Paredão da Argila</li>
        </ul>
    `;
}

function generateTours() {
    return `
        <h3>Passeios</h3>
        <ul>
            <li onclick="showTourDetails('Volta à Ilha')">Volta à Ilha</li>
            <li onclick="showTourDetails('Quadriciclo para Garapuá')">Quadriciclo para Garapuá</li>
            <li onclick="showTourDetails('4X4 para Garapuá')">4X4 para Garapuá</li>
            <li onclick="showTourDetails('Lancha para Gamboa')">Lancha para Gamboa</li>
        </ul>
    `;
}

function generateBeaches() {
    return `
        <h3>Praias</h3>
        <ul>
            <li onclick="showBeachDetails('Primeira Praia')">Primeira Praia</li>
            <li onclick="showBeachDetails('Segunda Praia')">Segunda Praia</li>
            <li onclick="showBeachDetails('Terceira Praia')">Terceira Praia</li>
            <li onclick="showBeachDetails('Quarta Praia')">Quarta Praia</li>
            <li onclick="showBeachDetails('Praia da Gamboa')">Praia da Gamboa</li>
        </ul>
    `;
}

function generateEvents() {
    return `
        <h3>Eventos</h3>
        <ul>
            <li onclick="showEventDetails('Pôr do Sol na Toca do Morcego')">Pôr do Sol na Toca do Morcego</li>
            <li onclick="showEventDetails('Samba na Toca do Morcego')">Samba na Toca do Morcego</li>
            <li onclick="showEventDetails('Festa Sextou na Toca')">Festa Sextou na Toca</li>
        </ul>
    `;
}

function generateRestaurants() {
    return `
        <h3>Restaurantes</h3>
        <ul>
            <li onclick="showRestaurantDetails('Sambass Café')">Sambass Café</li>
            <li onclick="showRestaurantDetails('Budda Beach')">Budda Beach</
            <li onclick="showRestaurantDetails('Funny')">Funny</li>
        </ul>
    `;
}

function generateAccommodations() {
    return `
        <h3>Hospedagem</h3>
        <ul>
            <li onclick="showAccommodationDetails('Pousada X')">Pousada X</li>
            <li onclick="showAccommodationDetails('Hotel Y')">Hotel Y</li>
            <li onclick="showAccommodationDetails('Hostel Z')">Hostel Z</li>
        </ul>
    `;
}

function generateShops() {
    return `
        <h3>Lojas</h3>
        <ul>
            <li onclick="showShopDetails('Eco Store')">Eco Store</li>
        </ul>
    `;
}

function generateTips() {
    return `
        <h3>Dicas</h3>
        <ul>
            <li onclick="showTipDetails('Segurança')">Segurança</li>
            <li onclick="showTipDetails('Saúde')">Saúde</li>
            <li onclick="showTipDetails('Lazer')">Lazer</li>
        </ul>
    `;
}

function generateEmergencies() {
    return `
        <h3>Emergências</h3>
        <ul>
            <li>Ambulância: 75-99894-5017</li>
            <li>Unidade Básica de Saúde: 75-3652-1798</li>
            <li>Polícia Civil: 75-3652-1645</li>
            <li>Polícia Militar: 75-99925-0856</li>
        </ul>
    `;
}

function searchMap() {
    const query = document.getElementById('search-input').value;
    if (searchCache[query]) {
        displaySearchResults(searchCache[query]);
    } else {
        axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1`)
            .then(response => {
                const results = response.data;
                searchCache[query] = results;
                displaySearchResults(results);
            });
    }
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = result.display_name;
        li.onclick = () => {
            map.setView([result.lat, result.lon], 15);
            addMarker(result.lat, result.lon, result.display_name);
        };
        searchResults.appendChild(li);
    });
}

function addMarker(lat, lon, description) {
    L.marker([lat, lon]).addTo(map).bindPopup(description).openPopup();
}

function showLocationDetails(location) {
    const details = getLocationDetails(location);
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = details;
    toggleInfoPanel();
}

function showTourDetails(tour) {
    const details = getTourDetails(tour);
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = details;
    toggleInfoPanel();
}

function showBeachDetails(beach) {
    const details = getBeachDetails(beach);
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = details;
    toggleInfoPanel();
}

function showEventDetails(event) {
    const details = getEventDetails(event);
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = details;
    toggleInfoPanel();
}

function showRestaurantDetails(restaurant) {
    const details = getRestaurantDetails(restaurant);
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = details;
    toggleInfoPanel();
}

function showAccommodationDetails(accommodation) {
    const details = getAccommodationDetails(accommodation);
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = details;
    toggleInfoPanel();
}

function showShopDetails(shop) {
    const details = getShopDetails(shop);
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = details;
    toggleInfoPanel();
}

function showTipDetails(tip) {
    const details = getTipDetails(tip);
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = details;
    toggleInfoPanel();
}

function getLocationDetails(location) {
    const details = {
        'Toca do Morcego': '<h3>Toca do Morcego</h3><p>Detalhes sobre a Toca do Morcego...</p>',
        'Igreja Nossa Senhora da Luz': '<h3>Igreja Nossa Senhora da Luz</h3><p>Detalhes sobre a Igreja Nossa Senhora da Luz...</p>',
        'Praça Aureliano': '<h3>Praça Aureliano</h3><p>Detalhes sobre a Praça Aureliano...</p>',
        'Farol do Morro': '<h3>Farol do Morro</h3><p>Detalhes sobre o Farol do Morro...</p>',
        'Fortaleza de Tapirandú': '<h3>Fortaleza de Tapirandú</h3><p>Detalhes sobre a Fortaleza de Tapirandú...</p>',
        'Paredão da Argila': '<h3>Paredão da Argila</h3><p>Detalhes sobre o Paredão da Argila...</p>',
    };
    return details[location] || '<p>Detalhes não encontrados.</p>';
}

function getTourDetails(tour) {
    const details = {
        'Volta à Ilha': '<h3>Volta à Ilha</h3><p>Detalhes sobre o passeio Volta à Ilha...</p>',
        'Quadriciclo para Garapuá': '<h3>Quadriciclo para Garapuá</h3><p>Detalhes sobre o passeio de Quadriciclo para Garapuá...</p>',
        '4X4 para Garapuá': '<h3>4X4 para Garapuá</h3><p>Detalhes sobre o passeio de 4X4 para Garapuá...</p>',
        'Lancha para Gamboa': '<h3>Lancha para Gamboa</h3><p>Detalhes sobre o passeio de Lancha para Gamboa...</p>',
    };
    return details[tour] || '<p>Detalhes não encontrados.</p>';
}

function getBeachDetails(beach) {
    const details = {
        'Primeira Praia': '<h3>Primeira Praia</h3><p>Detalhes sobre a Primeira Praia...</p>',
        'Segunda Praia': '<h3>Segunda Praia</h3><p>Detalhes sobre a Segunda Praia...</p>',
        'Terceira Praia': '<h3>Terceira Praia</h3><p>Detalhes sobre a Terceira Praia...</p>',
        'Quarta Praia': '<h3>Quarta Praia</h3><p>Detalhes sobre a Quarta Praia...</p>',
        'Praia da Gamboa': '<h3>Praia da Gamboa</h3><p>Detalhes sobre a Praia da Gamboa...</p>',
    };
    return details[beach] || '<p>Detalhes não encontrados.</p>';
}

function getEventDetails(event) {
    const details = {
        'Pôr do Sol na Toca do Morcego': '<h3>Pôr do Sol na Toca do Morcego</h3><p>Detalhes sobre o evento Pôr do Sol na Toca do Morcego...</p>',
        'Samba na Toca do Morcego': '<h3>Samba na Toca do Morcego</h3><p>Detalhes sobre o evento Samba na Toca do Morcego...</p>',
        'Festa Sextou na Toca': '<h3>Festa Sextou na Toca</h3><p>Detalhes sobre a Festa Sextou na Toca...</p>',
    };
    return details[event] || '<p>Detalhes não encontrados.</p>';
}

function getRestaurantDetails(restaurant) {
    const details = {
        'Sambass Café': '<h3>Sambass Café</h3><p>Detalhes sobre o Sambass Café...</p>',
        'Budda Beach': '<h3>Budda Beach</h3><p>Detalhes sobre o Budda Beach...</p>',
        'Funny': '<h3>Funny</h3><p>Detalhes sobre o Funny...</p>',
    };
    return details[restaurant] || '<p>Detalhes não encontrados.</p>';
}

function getAccommodationDetails(accommodation) {
    const details = {
        'Pousada X': '<h3>Pousada X</h3><p>Detalhes sobre a Pousada X...</p>',
        'Hotel Y': '<h3>Hotel Y</h3><p>Detalhes sobre o Hotel Y...</p>',
        'Hostel Z': '<h3>Hostel Z</h3><p>Detalhes sobre o Hostel Z...</p>',
    };
    return details[accommodation] || '<p>Detalhes não encontrados.</p>';
}

function getShopDetails(shop) {
    const details = {
        'Eco Store': '<h3>Eco Store</h3><p>Detalhes sobre a Eco Store...</p>',
    };
    return details[shop] || '<p>Detalhes não encontrados.</p>';
}

function getTipDetails(tip) {
    const details = {
        'Segurança': '<h3>Segurança</h3><p>Dicas de segurança em Morro de São Paulo...</p>',
        'Saúde': '<h3>Saúde</h3><p>Dicas de saúde em Morro de São Paulo...</p>',
        'Lazer': '<h3>Lazer</h3><p>Dicas de lazer em Morro de São Paulo...</p>',
    };
    return details[tip] || '<p>Detalhes não encontrados.</p>';
}

function createItinerary() {
    const name = document.getElementById('name').value;
    const location = document.getElementById('location').value;
    const visit = document.getElementById('visit').value;
    const activities = document.getElementById('activities').value;
    const preferences = document.getElementById('preferences').value;
    const budget = document.getElementById('budget').value;

    const itinerary = {
        name,
        location,
        visit,
        activities,
        preferences,
        budget
    };

    displayItinerary(itinerary);
}

function displayItinerary(itinerary) {
    const content = `
        <h3>Roteiro Personalizado para ${itinerary.name}</h3>
        <p>Local de Origem: ${itinerary.location}</p>
        <p>Primeira vez em Morro de São Paulo: ${itinerary.visit}</p>
        <p>Atividades já realizadas: ${itinerary.activities}</p>
        <p>Preferências: ${itinerary.preferences}</p>
        <p>Orçamento disponível: R$${itinerary.budget}</p>
    `;
    document.getElementById('route-content').innerHTML = content;
    toggleRouteSummary();
}
