// Estrutura Geral do Site Morro Digital

// 1: Configurações Globais e Inicialização
// 2: Mapa e Localização
// 3: Interface do Usuário (UI)
// 4: Controle de Eventos e Botões
// 5: Gerenciamento de Submenus
// 6: Tutorial e Assistência
// 7: Traduções e Idiomas
// 8: Histórico e Cache
// 9: Gerenciamento de Destinos
// 10: Ferramentas Auxiliares

// ======================
// 1. Configurações Globais e Inicialização
// ======================

// Variáveis Globais
// Usadas em diferentes partes do aplicativo para gerenciar o estado e interações
let map; // Instância do mapa Leaflet
let currentSubMenu = null; // Submenu atualmente selecionado
let currentLocation = null; // Localização atual do usuário
let selectedLanguage = getLocalStorageItem('preferredLanguage', 'pt'); // Idioma selecionado
let currentStep = null; // Passo atual do tutorial
let tutorialIsActive = false; // Indica se o tutorial está ativo
let searchHistory = []; // Histórico de buscas do usuário
let achievements = []; // Conquistas acumuladas pelo usuário
let favorites = []; // Lista de favoritos do usuário
let routingControl = null; // Controle de rotas no mapa
let speechSynthesisUtterance = null; // Utterance para síntese de fala
let voices = []; // Lista de vozes disponíveis
let selectedDestination = {}; // Destino atualmente selecionado
let markers = []; // Lista de marcadores ativos no mapa
let currentMarker = null; // Marcador atual no mapa
let swiperInstance = null; // Instância ativa do carrossel
let watchId = null;
let selectedProfile = 'foot-walking'; // Perfil padrão de transporte
let userLocationMarker = null;
let userCurrentLocation = null; // Variável global para armazenar a localização do usuário
let currentRouteData = null;
let isNavigationActive = false;
let navigationPaused = false;
let currentRouteSteps = []; // Instruções passo a passo da rota
let navigationWatchId = null; // ID do watcher de geolocalização para navegação ativa
let currentRoute = null; // Camada atual da rota no mapa
let userMarker = null; // Marcador da posição atual do usuário
let destinationMarker = null; // Marcador do destino



// Constantes
const notificationContainer = document.getElementById("notification-container"); // Para notificações
const navigationInstructionsContainer = document.getElementById("navigation-instructions"); // Para instruções de navegação
const progressBar = document.getElementById("progress-bar"); // Barra de progresso

 // Chave da API OpenRouteService
const OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
// Objeto de traduções para suporte multilíngue
const translations = {
    pt: {
        welcome: "Bem-vindo ao nosso site!",
        youAreHere: "Você está aqui!",
        pousadasMessage: "Encontre as melhores pousadas para sua estadia.",
        touristSpotsMessage: "Descubra os pontos turísticos mais populares.",
        beachesMessage: "Explore as praias mais belas de Morro de São Paulo.",
        toursMessage: "Veja passeios disponíveis e opções de reserva.",
        restaurantsMessage: "Descubra os melhores restaurantes da região.",
        partiesMessage: "Saiba sobre festas e eventos disponíveis.",
        shopsMessage: "Encontre lojas locais para suas compras.",
        emergenciesMessage: "Informações úteis para situações de emergência.",
        tutorialStart: "Iniciar",
        tutorialYes: "Sim",
        tutorialNo: "Não",
        tutorialEnd: "Encerrar Tutorial",
        createItinerary: "Criar Roteiro",
        aboutMore: "Fotos",
        createRoute: "Como Chegar",
        reserveTable: "Reservar Mesa",
        accessWebsite: "Site",
        call: "Ligar",
        reserveRoom: "Reservar Quarto",
        reserveChairs: "Reservar Cadeiras",
        buyTicket: "Comprar Ingresso",
        reserveTour: "Reservar Passeio",
        send: "Enviar",
        viewItinerary: "Ver Roteiro",
        changePreferences: "Alterar Preferências",
        generateNewItinerary: "Gerar outro Roteiro",
        accessSite: "Acessar Site",
        accessMenu: "Acessar Menu",
        startNavigation: "Iniciar Navegação",
        navigationStarted: "Navegação iniciada.",
        recalculatingRoute: "Recalculando rota...",
        arrivedAtDestination: "Você chegou ao seu destino!",
        turnLeft: "Vire à esquerda",
        turnRight: "Vire à direita",
        continueStraight: "Continue em frente",
        destinationReached: "Destino alcançado.",
        routeError: "Erro ao criar rota.",
        noInstructions: "Nenhuma instrução disponível.",
        confirmRoute: "Confirme sua rota.",
        noLocationPermission: "Permissão de localização negada.",
        waitingForRoute: "Aguardando rota.",
        adjustPosition: "Ajuste sua posição para uma rua próxima.",
    },
    en: {
        welcome: "Welcome to our site!",
        youAreHere: "You are here!",
        pousadasMessage: "Find the best inns for your stay.",
        touristSpotsMessage: "Discover the most popular tourist spots.",
        beachesMessage: "Explore the most beautiful beaches of Morro de São Paulo.",
        toursMessage: "Check available tours and booking options.",
        restaurantsMessage: "Discover the best restaurants in the region.",
        partiesMessage: "Learn about available parties and events.",
        shopsMessage: "Find local stores for your shopping.",
        emergenciesMessage: "Useful information for emergency situations.",
        tutorialStart: "Start",
        tutorialYes: "Yes",
        tutorialNo: "No",
        tutorialEnd: "End Tutorial",
        createItinerary: "Create Itinerary",
        aboutMore: "Photos",
        createRoute: "How to Get There",
        reserveTable: "Reserve Table",
        accessWebsite: "Website",
        call: "Call",
        reserveRoom: "Reserve Room",
        reserveChairs: "Reserve Chairs",
        buyTicket: "Buy Ticket",
        reserveTour: "Reserve Tour",
        send: "Send",
        viewItinerary: "View Itinerary",
        changePreferences: "Change Preferences",
        generateNewItinerary: "Generate New Itinerary",
        accessSite: "Access Site",
        accessMenu: "Access Menu",
        startNavigation: "Start Navigation",
        navigationStarted: "Navigation started.",
        recalculatingRoute: "Recalculating route...",
        arrivedAtDestination: "You have arrived at your destination!",
        turnLeft: "Turn left",
        turnRight: "Turn right",
        continueStraight: "Continue straight",
        destinationReached: "Destination reached.",
        routeError: "Error creating route.",
        noInstructions: "No instructions available.",
        confirmRoute: "Confirm your route.",
        noLocationPermission: "Location permission denied.",
        waitingForRoute: "Waiting for route.",
        adjustPosition: "Adjust your position to a nearby road.",
    },
    es: {
        welcome: "¡Bienvenido a nuestro sitio!",
        youAreHere: "¡Estás aquí!",
        pousadasMessage: "Encuentra las mejores posadas para tu estancia.",
        touristSpotsMessage: "Descubre los puntos turísticos más populares.",
        beachesMessage: "Explora las playas más hermosas de Morro de São Paulo.",
        toursMessage: "Consulta los tours disponibles y opciones de reserva.",
        restaurantsMessage: "Descubre los mejores restaurantes de la región.",
        partiesMessage: "Infórmate sobre fiestas y eventos disponibles.",
        shopsMessage: "Encuentra tiendas locales para tus compras.",
        emergenciesMessage: "Información útil para situaciones de emergencia.",
        tutorialStart: "Iniciar",
        tutorialYes: "Sí",
        tutorialNo: "No",
        tutorialEnd: "Terminar Tutorial",
        createItinerary: "Crear Itinerario",
        aboutMore: "Fotos",
        createRoute: "Cómo Llegar",
        reserveTable: "Reservar Mesa",
        accessWebsite: "Sitio Web",
        call: "Llamar",
        reserveRoom: "Reservar Habitación",
        reserveChairs: "Reservar Sillas",
        buyTicket: "Comprar Boleto",
        reserveTour: "Reservar Tour",
        send: "Enviar",
        viewItinerary: "Ver Itinerario",
        changePreferences: "Cambiar Preferencias",
        generateNewItinerary: "Generar Nuevo Itinerario",
        accessSite: "Acceder al Sitio",
        accessMenu: "Acceder al Menú",
        startNavigation: "Iniciar Navegación",
        navigationStarted: "Navegación iniciada.",
        recalculatingRoute: "Recalculando ruta...",
        arrivedAtDestination: "¡Has llegado a tu destino!",
        turnLeft: "Gira a la izquierda",
        turnRight: "Gira a la derecha",
        continueStraight: "Continúa recto",
        destinationReached: "Destino alcanzado.",
        routeError: "Error al crear la ruta.",
        noInstructions: "No hay instrucciones disponibles.",
        confirmRoute: "Confirma tu ruta.",
        noLocationPermission: "Permiso de ubicación denegado.",
        waitingForRoute: "Esperando la ruta.",
        adjustPosition: "Ajusta tu posición a una carretera cercana.",
    },
    he: {
        welcome: "ברוך הבא לאתר שלנו!",
        youAreHere: "אתה כאן!",
        pousadasMessage: "מצא את הפוסאדות הטובות ביותר לשהותך.",
        touristSpotsMessage: "גלה את האטרקציות התיירותיות הפופולריות ביותר.",
        beachesMessage: "חקור את החופים היפים ביותר במורו דה סאו פאולו.",
        toursMessage: "בדוק סיורים זמינים ואפשרויות הזמנה.",
        restaurantsMessage: "גלה את המסעדות הטובות ביותר באזור.",
        partiesMessage: "למד על מסיבות ואירועים זמינים.",
        shopsMessage: "מצא חנויות מקומיות לקניות שלך.",
        emergenciesMessage: "מידע שימושי למצבי חירום.",
        tutorialStart: "התחל",
        tutorialYes: "כן",
        tutorialNo: "לא",
        tutorialEnd: "סיים את המדריך",
        createItinerary: "צור מסלול",
        aboutMore: "תמונות",
        createRoute: "איך להגיע",
        reserveTable: "הזמן שולחן",
        accessWebsite: "אתר אינטרנט",
        call: "התקשר",
        reserveRoom: "הזמן חדר",
        reserveChairs: "הזמן כסאות",
        buyTicket: "קנה כרטיס",
        reserveTour: "הזמן סיור",
        send: "שלח",
        viewItinerary: "הצג מסלול",
        changePreferences: "שנה העדפות",
        generateNewItinerary: "צור מסלול חדש",
        accessSite: "גש לאתר",
        accessMenu: "גש לתפריט",
        startNavigation: "התחל ניווט",
        navigationStarted: "ניווט התחיל.",
        recalculatingRoute: "מחשב מסלול מחדש...",
        arrivedAtDestination: "הגעת ליעד שלך!",
        turnLeft: "פנה שמאלה",
        turnRight: "פנה ימינה",
        continueStraight: "המשך ישר",
        destinationReached: "היעד הושג.",
        routeError: "שגיאה ביצירת המסלול.",
        noInstructions: "אין הוראות זמינות.",
        confirmRoute: "אשר את המסלול שלך.",
        noLocationPermission: "הגישה למיקום נדחתה.",
        waitingForRoute: "מחכה למסלול.",
        adjustPosition: "התאם את המיקום שלך לכביש קרוב.",
    },
};


// Lista de consultas e buscas realizadas
const queries = {
    'touristSpots-submenu': '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
    'tours-submenu': '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
    'beaches-submenu': '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
    'nightlife-submenu': '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
    'restaurants-submenu': '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
    'inns-submenu': '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
    'shops-submenu': '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
    'emergencies-submenu': '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
    'tips-submenu': '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
    'about-submenu': '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
    'education-submenu': '[out:json];node["education"](around:10000,-13.376,-38.913);out body;'
};

document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeMap(); // Configura o mapa
        loadResources(); // Carrega recursos como imagens e dados
        showWelcomeMessage(); // Ativa o assistente virtual
        setupEventListeners(); // Configura os eventos principais
        initializeTutorialListeners();
        setupSubmenuClickListeners();

        // Adicionando evento ao botão de iniciar rota
        const startRouteBtn = document.getElementById('start-route-btn');
        if (startRouteBtn) {
            startRouteBtn.addEventListener('click', () => {
                if (selectedDestination && selectedDestination.lat && selectedDestination.lon) {
                    startInteractiveRoute();
                } else {
                    alert("Por favor, selecione um destino antes de iniciar a rota.");
                }
            });
        }
    } catch (error) {
        console.error('Erro durante a inicialização:', error);
    }
});


// Função para carregar recursos adicionais necessários ao aplicativo
function loadResources() {
    console.log('Carregando recursos...');
    const resources = [
        'images/tourist_spot.jpg',
        'images/tour.jpg',
        'images/beach.jpg',
        'images/nightlife.jpg',
        'images/restaurant.jpg',
        'images/inn.jpg',
        'images/shop.jpg',
        'images/emergency.jpg',
        'images/tip.jpg',
        'images/about.jpg',
        'images/education.jpg'
    ];

    let resourcesLoaded = 0;
    const totalResources = resources.length;

    resources.forEach(resource => {
        const img = new Image();
        img.src = resource;
        img.onload = () => {
            resourcesLoaded++;
            console.log(`Recurso ${resource} carregado com sucesso.`);
            if (resourcesLoaded === totalResources) {
                console.log('Todos os recursos foram carregados com sucesso.');
            }
        };
        img.onerror = () => {
            console.error(`Erro ao carregar recurso ${resource}. Verifique se o caminho está correto e se o arquivo existe.`);
        };
    });
}

// Função para exibir a mensagem de boas vindas na interface
function showWelcomeMessage() {
    const modal = document.getElementById('welcome-modal');
    modal.style.display = 'block';
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.style.pointerEvents = 'auto';
    });
}

// Função para traduzir
function translate(key, params = {}, lang = "en") {
    let message = translations[lang][key] || key;
    Object.keys(params).forEach(param => {
        message = message.replace(`{${param}}`, params[param]);
    });
    return message;
}

// ======================
// 2. Mapa e Localização
// ======================

// Inicializa o mapa usando Leaflet
function initializeMap() {
    if (map) {
        console.warn("O mapa já está inicializado.");
        return;
    }

    console.log("Inicializando o mapa...");
    const tileLayers = {
        streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap Contributors'
        }),
        satellite: L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap France'
        })
    };

    map = L.map('map', {
        layers: [tileLayers.streets],
        zoomControl: false,
        maxZoom: 19,
        minZoom: 3
    }).setView([-13.378, -38.918], 14);

    L.control.layers(tileLayers).addTo(map);
    console.log("Mapa inicializado com sucesso.");
}


function getTileLayer() {
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
    });
}

async function requestLocationPermission() {
    if (!navigator.geolocation) {
        console.error("Geolocalização não é suportada pelo navegador.");
        showNotification("Seu navegador não suporta geolocalização.", "error");
        return null;
    }

    try {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    userCurrentLocation = { latitude, longitude }; // Salva a localização inicial
                    console.log("Localização inicial obtida:", userCurrentLocation);

                    adjustMapWithLocationUser(latitude, longitude);
                                        // Inicia o tutorial ou outro fluxo necessário
                    resolve(userCurrentLocation);
                },
                (error) => {
                    const errorMessage = mapGeolocationError(error);
                    console.error(errorMessage);
                    showNotification(errorMessage, "error");
                    reject(errorMessage);
                },
                { enableHighAccuracy: true }
            );
        });
    } catch (error) {
        console.error("Erro ao solicitar permissão de localização:", error);
        showNotification("Erro ao obter localização. Tente novamente.", "error");
        return null;
    }
}



// Ajusta o mapa para a localização atual do usuário
function adjustMapWithLocationUser(lat, lon) {
    map.setView([lat, lon], 15);
    const marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(translations[selectedLanguage].youAreHere || "Você está aqui!")
        .openPopup();
    markers.push(marker);
}



function adjustMapWithLocation(lat, lon, name = '', description = '', zoom = 15, offsetYPercent = 10) {
    try {
        // Remove marcadores antigos antes de adicionar um novo
        clearMarkers();

        // Adiciona um marcador no local especificado
        const marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${name}</b><br>${description || 'Localização selecionada'}`)
            .openPopup();

        // Adiciona o marcador à lista de marcadores para referência futura
        markers.push(marker);

        // Obtém o tamanho do mapa em pixels
        const mapSize = map.getSize();
        const mapHeight = mapSize.y;

        // Calcula o deslocamento vertical com base na porcentagem fornecida
        const offsetYPercentCapped = Math.min(offsetYPercent, 100); // Limita o deslocamento a um máximo de 100%
        const offsetY = (mapHeight * offsetYPercentCapped) / 100;

        // Projeta o ponto da localização no sistema de coordenadas da tela
        const projectedPoint = map.project([lat, lon], zoom);

        // Subtrai o deslocamento para reposicionar o ponto mais próximo ao topo
        const adjustedPoint = projectedPoint.subtract([0, offsetY]);

        // Converte o ponto ajustado de volta para coordenadas geográficas
        const adjustedLatLng = map.unproject(adjustedPoint, zoom);

        // Centraliza o mapa no ponto ajustado com animação
        map.setView(adjustedLatLng, zoom, {
            animate: true,
            pan: { duration: 0.5, easeLinearity: 0.8 }
        });

        console.log(`Mapa ajustado para: (${lat}, ${lon}) com zoom ${zoom} e deslocamento ${offsetYPercentCapped}%`);
    } catch (error) {
        console.error('Erro ao ajustar o mapa:', error);
    }
}

// Etapa 1: Configuração Inicial
function validateDestination() {
    if (!selectedDestination || !selectedDestination.lat || !selectedDestination.lon) {
        handleError("Destino inválido. Por favor, selecione um destino válido.");
        throw new Error("Destino inválido.");
    }
    showNotification("Destino validado com sucesso.", "info");
    console.log("Destino validado:", selectedDestination);
}


// Função para iniciar a criação de rota até o destino selecionado

// Cria a rota no mapa
async function createRoute(userLocation) {
    try {
        prepareMapForNewRoute();

        const routeData = await plotRouteOnMap(
            userLocation.latitude,
            userLocation.longitude,
            selectedDestination.lat,
            selectedDestination.lon
        );

        finalizeRouteMarkers(
            userLocation.latitude,
            userLocation.longitude,
            selectedDestination.lat,
            selectedDestination.lon
        );

        return routeData;
    } catch (error) {
        handleError("Erro ao criar a rota.", error);
        throw error;
    }
}


// Limpa o mapa antes de traçar uma nova rota
function prepareMapForNewRoute() {
    clearCurrentRoute();
    clearAllMarkers();
    console.log("Mapa preparado para nova rota.");
}



const apiKey = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3'; // Substitua pelo seu API Key do OpenRouteService

// Cria a rota para o destino usando a localização atual do usuário
async function createRouteToDestination(lat, lon) {
    if (!lat || !lon) {
        console.error(translations[selectedLanguage]?.invalidCoordinates || "Coordenadas inválidas fornecidas.");
        showNotification(translations[selectedLanguage]?.invalidCoordinates || "Erro: coordenadas inválidas.", "error");
        return false;
    }

    if (!userCurrentLocation) {
        console.error(translations[selectedLanguage]?.locationNotAvailable || "Localização do usuário não disponível.");
        showNotification(translations[selectedLanguage]?.locationNotAvailable || "Erro ao obter localização atual.", "error");
        return false;
    }

    try {
        const { latitude: startLat, longitude: startLon } = userCurrentLocation;

        console.log(translations[selectedLanguage]?.creatingRoute || `Criando rota de (${startLat}, ${startLon}) para (${lat}, ${lon}).`);
        const routeData = await plotRouteOnMap(startLat, startLon, lat, lon);

        if (!routeData) {
            console.error(translations[selectedLanguage]?.routeCreationError || "Erro ao criar a rota.");
            showNotification(translations[selectedLanguage]?.routeCreationError || "Erro ao criar a rota.", "error");
            return false;
        }

        const instructions = await fetchRouteInstructions(startLat, startLon, lat, lon);
        if (!instructions || instructions.length === 0) {
            console.error(translations[selectedLanguage]?.noInstructions || "Nenhuma instrução disponível.");
            showNotification(translations[selectedLanguage]?.noInstructions || "Nenhuma instrução disponível.", "error");
            return false;
        }

        console.log(translations[selectedLanguage]?.routeCreated || "Rota criada com sucesso.");
        return instructions;
    } catch (error) {
        console.error(translations[selectedLanguage]?.unexpectedError || "Erro inesperado ao criar a rota:", error);
        showNotification(translations[selectedLanguage]?.routeCreationError || "Erro ao criar a rota.", "error");
        return false;
    }
}




function showRoutePreview(routeData) {
    const summary = routeData?.features[0]?.properties?.summary;
    if (!summary) {
        showNotification("Não foi possível gerar o resumo da rota.", "error");
        return;
    }

    const eta = Math.round(summary.duration / 60);
    const distance = (summary.distance / 1000).toFixed(2);
    const previewHTML = `
        <h3>Resumo da Rota</h3>
        <p>Distância: ${distance} km</p>
        <p>Tempo Estimado: ${eta} minutos</p>
    `;
    const previewContainer = document.getElementById("route-preview");
    previewContainer.innerHTML = previewHTML;
    previewContainer.classList.remove("hidden");
    previewContainer.classList.add("show");
}

function hideRoutePreview() {
    const previewContainer = document.getElementById("route-preview");
    if (!previewContainer) {
        console.error("O contêiner de resumo da rota (#route-preview) não foi encontrado.");
        return;
    }

    // Limpa o conteúdo do contêiner e aplica classes para escondê-lo
    previewContainer.innerHTML = "";
    previewContainer.classList.add("hidden");
    previewContainer.classList.remove("show");

    console.log("Resumo da rota escondido com sucesso.");
}


function toggleNavigationPause() {
    const pauseButton = document.getElementById("pause-navigation-button");
    if (!pauseButton) return;

    if (isNavigationPaused) {
        isNavigationPaused = false;
        navigator.geolocation.watchPosition(...lastWatchPositionArgs);
        showNotification("Navegação retomada.", "info");
        pauseButton.textContent = "Pausar Navegação";
    } else {
        isNavigationPaused = true;
        navigator.geolocation.clearWatch(window.navigationWatchId);
        showNotification("Navegação pausada.", "warning");
        pauseButton.textContent = "Retomar Navegação";
    }
}


function notifyDeviation(currentLat, currentLon, routeCoordinates) {
    const distanceToRoute = routeCoordinates.reduce((minDist, coord) => {
        const dist = calculateDistance(currentLat, currentLon, coord[0], coord[1]);
        return Math.min(minDist, dist);
    }, Infinity);

    if (distanceToRoute > 100) {
        recalculateRoute(selectedDestination.lat, selectedDestination.lon);
    }
}




// Inicia o fluxo de criação da rota
async function startRouteCreation() {
    try {
        validateDestination(); // Verifica se o destino foi selecionado
        const userLocation = await getCurrentLocation(); // Obtém a localização do usuário
        const routeData = await createRoute(userLocation); // Cria a rota com base nos dados

        currentRouteData = routeData; // Armazena os dados da rota para navegação
        startRoutePreview(); // Inicia o modo de pré-visualização
    } catch (error) {
        handleError("Erro ao iniciar a criação da rota.", error);
    }
}


// Inicia a pré-visualização da rota
function startRoutePreview() {
    if (!currentRouteData) {
        handleError("Nenhuma rota disponível para pré-visualização.");
        return;
    }

    displayRouteSummary(currentRouteData); // Exibe o resumo da rota
    showNotification("Pré-visualização da rota ativada.", "info");
    displayStartNavigationButton(); // Adiciona botão de iniciar navegação
}


async function recalculateRoute(destLat, destLon, profile = "foot-walking") {
    const { latitude: userLat, longitude: userLon } = userCurrentLocation;

    showNotification(getNavigationText("offRoute"), "warning");
    giveVoiceFeedback(getNavigationText("offRoute"));

    try {
        await plotRouteOnMap(userLat, userLon, destLat, destLon, profile);
        showNotification(getNavigationText("routeRecalculated"), "info");
    } catch (error) {
        handleError(getNavigationText("recalculationError"), error);
    }
}




// Exibe botões de navegação e tutorial
function displayStartNavigationButton() {
    const startNavButton = document.getElementById("start-navigation-button");
    const endNavButton = document.getElementById("navigation-end-btn");
    const tutorialMenuButton = document.getElementById("tutorial-menu-btn");

    if (!startNavButton || !endNavButton || !tutorialMenuButton) {
        console.error("Um ou mais botões não foram encontrados.");
        return;
    }

    // Exibe apenas os botões necessários
    hideAllControls();
    startNavButton.style.display = "block";
    tutorialMenuButton.style.display = "block";
    endNavButton.style.display = "none";

    // Evento para iniciar navegação
    startNavButton.addEventListener("click", () => {
        if (!isNavigationActive) {
            startNavigation();
            isNavigationActive = true;
            startNavButton.style.display = "none";
            endNavButton.style.display = "block";
            hideRouteSummary();
        }
    });

    // Evento para encerrar navegação
    endNavButton.addEventListener("click", () => {
        endNavigation();
        isNavigationActive = false;
        startNavButton.style.display = "block";
        endNavButton.style.display = "none";
    });
}

// Oculta todos os controles no mapa
function hideAllControls() {
    const controlButtons = document.querySelectorAll(".control-btn");
    controlButtons.forEach((button) => {
        button.style.display = "none";
    });
}

function finalizeRouteMarkers(userLat, userLon, destLat, destLon) {
    L.marker([userLat, userLon]).addTo(map).bindPopup("🚶 Você está aqui!").openPopup();
    L.marker([destLat, destLon])
        .addTo(map)
        .bindPopup(`📍 Destino: ${selectedDestination.name || "Destino sem nome"}`)
        .openPopup();
}

// Inicia a navegação ativa
function startInteractiveNavigation() {
    isNavigationActive = true; // Ativa o modo de navegação
    if (!validateNavigationPrerequisites()) return;

    const { latitude: startLat, longitude: startLon } = userCurrentLocation;
    const { lat: destLat, lon: destLon } = selectedDestination;
    hideRouteSummary();

    trackUserMovement(destLat, destLon, instructions);
    showNotification("Navegação iniciada! Siga as instruções.", "success");
}



function validateNavigationPrerequisites() {
    if (!selectedDestination?.lat || !selectedDestination?.lon) {
        return handleError("Destino inválido. Verifique os dados e tente novamente.");
    }
    if (!window.currentRoute) {
        return handleError("Nenhuma rota disponível. Por favor, gere a rota primeiro.");
    }
    if (!userCurrentLocation) {
        return handleError("Localização do usuário não disponível. Tente novamente.");
    }
    return true;
}




function togglePreviewMode() {
    isPreviewMode = !isPreviewMode;

    if (isPreviewMode) {
        showNotification("Modo de pré-visualização ativado. Navegação desativada.", "info");
    } else {
        showNotification("Modo de navegação ativado. Acompanhamento em tempo real iniciado.", "success");
        startInteractiveNavigation();
    }
}

const navigationTexts = {
    en: {
        straight: "Continue straight for {distance} meters.",
        turnLeft: "Turn left in {distance} meters.",
        turnRight: "Turn right in {distance} meters.",
        slightLeft: "Take a slight left in {distance} meters.",
        slightRight: "Take a slight right in {distance} meters.",
        uTurn: "Make a U-turn in {distance} meters.",
        prepareLeft: "Prepare to turn left.",
        prepareRight: "Prepare to turn right.",
        offRoute: "You are off route. Recalculating...",
        arrived: "You have arrived at your destination.",
        closeToTurn: "You are close to your turn. Turn {direction} now.",
        unknown: "Unknown instruction. Please follow the map.",
    },
    pt: {
        straight: "Siga em frente por {distance} metros.",
        turnLeft: "Vire à esquerda em {distance} metros.",
        turnRight: "Vire à direita em {distance} metros.",
        slightLeft: "Vire levemente à esquerda em {distance} metros.",
        slightRight: "Vire levemente à direita em {distance} metros.",
        uTurn: "Faça um retorno em {distance} metros.",
        prepareLeft: "Prepare-se para virar à esquerda.",
        prepareRight: "Prepare-se para virar à direita.",
        offRoute: "Você saiu da rota. Recalculando...",
        arrived: "Você chegou ao seu destino.",
        closeToTurn: "Você está próximo de virar. Vire {direction} agora.",
        unknown: "Instrução desconhecida. Siga o mapa.",
    },
    // Outros idiomas podem ser adicionados aqui
};

// Função para gerar mensagens com base no texto e parâmetros
function getNavigationText(key, params = {}, lang = "en") {
    let message = navigationTexts[lang][key] || navigationTexts[lang].unknown;
    Object.keys(params).forEach(param => {
        message = message.replace(`{${param}}`, params[param]);
    });
    return message;
}

function generateRouteInstructions(routeData) {
    if (!routeData?.features?.length) {
        showNotification("Erro ao gerar instruções da rota.", "error");
        return [];
    }

    const steps = routeData.features[0].properties.segments[0]?.steps || [];
    return steps.map((step, index) => {
        const distance = Math.round(step.distance);
        const direction = step.instruction;
        return {
            index,
            text: `${getNavigationText("continue")} ${direction.toLowerCase()} ${getNavigationText("forDistance").replace("{distance}", distance)}`,
            distance,
        };
    });
}


function displayStepByStepInstructions(instruction) {
    const instructionContainer = document.getElementById("navigation-instructions");

    if (!instructionContainer) {
        console.error("Erro: Modal de instruções não encontrado.");
        showNotification("Erro ao exibir instruções. Contate o suporte.", "error");
        return;
    }

    if (!instruction || !instruction.text) {
        instructionContainer.innerHTML = `
            <div class="instruction-step">
                <p>Nenhuma instrução disponível no momento.</p>
            </div>
        `;
        instructionContainer.classList.add("hidden");
        return;
    }

    instructionContainer.innerHTML = `
        <div class="instruction-step">
            <span class="direction-arrow">${getDirectionIcon(instruction.text)}</span>
            ${instruction.text} (${instruction.distance} metros)
        </div>
    `;
    instructionContainer.classList.remove("hidden");

    console.log("Instrução exibida:", instruction.text);
}





function highlightCurrentInstruction(instructionIndex) {
    const instructionElements = document.querySelectorAll(".instruction-step");

    if (!instructionElements || instructionElements.length === 0) {
        console.warn("Nenhuma instrução encontrada para destacar.");
        return;
    }

    instructionElements.forEach((element, index) => {
        element.classList.toggle("active-instruction", index === instructionIndex);
    });

    console.log(`Instrução atual destacada: Passo ${instructionIndex + 1}`);
}




function notifyNextInstruction(instruction) {
    showNotification(instruction.text, "info");
    giveVoiceFeedback(instruction.text);
}

// Exibe o resumo da rota no painel lateral
function displayRouteSummary(routeData) {
    const summary = routeData.features[0].properties.summary;
    const etaMinutes = Math.round(summary.duration / 60);
    const distanceKm = (summary.distance / 1000).toFixed(2);

    const summaryHTML = `
        <div class="route-summary">
            <h3>Resumo da Rota</h3>
            <p>🛣️ Distância: <strong>${distanceKm} km</strong></p>
            <p>⏱️ Tempo estimado: <strong>${etaMinutes} minutos</strong></p>
        </div>
    `;

    const summaryContainer = document.getElementById("route-summary");
    if (summaryContainer) {
        summaryContainer.innerHTML = summaryHTML;
        summaryContainer.style.display = "block";
    }
}

// Função para ocultar o resumo da rota
function hideRouteSummary() {
    const summaryContainer = document.getElementById("route-summary");
    const previewContainer = document.getElementById("route-preview");

    if (summaryContainer) {
        summaryContainer.style.display = "none"; // Oculta o container do resumo
        summaryContainer.innerHTML = ""; // Limpa o conteúdo para economizar memória
    }

    if (previewContainer) {
        previewContainer.classList.remove("show"); // Remove a classe de exibição
        previewContainer.classList.add("hidden"); // Adiciona a classe de ocultação
        previewContainer.innerHTML = ""; // Limpa o conteúdo
    }

    console.log("Resumo da rota ocultado com sucesso.");
}


// Finaliza a navegação ao chegar ao destino
function finalizeRouteOnArrival(userLat, userLon, destLat, destLon) {
    const distanceToDestination = calculateDistance(userLat, userLon, destLat, destLon);

    if (distanceToDestination < 50) {
        showNotification("Você chegou ao destino!", "success");
        giveVoiceFeedback("Parabéns! Você chegou ao destino.");
        endNavigation();
    }
}



// Finaliza a navegação
function endNavigation() {
    if (window.navigationWatchId) {
        navigator.geolocation.clearWatch(window.navigationWatchId);
        window.navigationWatchId = null;
    }

    clearCurrentRoute();
    clearAllMarkers();
    hideNavigationBar();

    const instructionContainer = document.getElementById("navigation-instructions");
    if (instructionContainer) {
        instructionContainer.classList.add("hidden");
    }

    isNavigationActive = false;
    showNotification("Navegação concluída. Você chegou ao seu destino.", "success");
    console.log("Navegação finalizada.");
}





// Inicia a navegação com base na rota existente
async function startNavigation() {
    try {
        validateDestination(); // Valida o destino selecionado
        const { latitude: userLat, longitude: userLon } = await getCurrentLocation();
        const { lat: destLat, lon: destLon } = selectedDestination;

        const instructions = await fetchRouteInstructions(userLat, userLon, destLat, destLon);

        if (!instructions.length) {
            showNotification("Nenhuma instrução disponível.", "error");
            return;
        }

        currentInstructions = instructions; // Armazena as instruções globalmente
        displayStepByStepInstructions(currentInstructions); // Exibe a primeira instrução
        trackUserMovement(destLat, destLon, currentInstructions); // Inicia o rastreamento
        showNotification("Navegação iniciada.", "success");
    } catch (error) {
        console.error("Erro ao iniciar navegação:", error);
        showNotification("Erro ao iniciar a navegação.", "error");
    }
}


function addDirectionArrows(routeCoordinates) {
    if (!L.PolylineDecorator) {
        console.error("Biblioteca leaflet-polylinedecorator não está disponível.");
        return;
    }

    if (!routeCoordinates || routeCoordinates.length === 0) {
        console.error("Coordenadas da rota são inválidas.");
        return;
    }

    try {
        // Remove as decorações anteriores, se existirem
        if (window.routeDecorator) {
            map.removeLayer(window.routeDecorator);
        }

        // Cria a linha decorada com setas
        const polyline = L.polyline(routeCoordinates, { color: 'blue', weight: 5 }).addTo(map);

        // Configura as setas
        window.routeDecorator = L.polylineDecorator(polyline, {
            patterns: [
                { offset: 12, repeat: 25, symbol: L.Symbol.arrowHead({ pixelSize: 8, polygon: true, pathOptions: { color: 'blue' } }) }
            ]
        }).addTo(map);

        console.log("Setas de direção adicionadas à rota.");
    } catch (error) {
        console.error("Erro ao adicionar setas de direção:", error);
    }
}

// Obtém a localização atual do usuário
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocalização não suportada pelo navegador."));
            handleError("Seu navegador não suporta geolocalização.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                userCurrentLocation = { latitude, longitude };
                resolve(userCurrentLocation);
                console.log("Localização atual obtida:", userCurrentLocation);
            },
            (error) => {
                const errorMessage = getGeolocationErrorMessage(error);
                handleError(errorMessage);
                reject(new Error(errorMessage));
            },
            { enableHighAccuracy: true }
        );
    });
}


// Função para limpar a rota atual
function clearCurrentRoute() {
    if (window.currentRoute) {
        map.removeLayer(window.currentRoute);
        window.currentRoute = null;
    }
}


// Limpa todos os marcadores e camadas não essenciais do mapa
function clearAllMarkers() {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
}

// Inicia uma rota interativa do usuário até o destino selecionado
// A função:
// 1. Verifica se há um destino selecionado. Caso contrário, exibe um alerta.
// 2. Obtém a localização atual do usuário utilizando a função `getCurrentLocation`.
// 3. Plota a rota no mapa utilizando as coordenadas do usuário e do destino.
// 4. Adiciona um marcador personalizado na localização atual do usuário.
// 5. Ajusta o zoom do mapa para que a rota inteira seja exibida.
// 6. Ativa o rastreamento em tempo real da posição do usuário no mapa com `trackUserMovement`.

// Navegação interativa em tempo real
function startInteractiveRoute(userLat, userLon, destLat, destLon, instructions, profile = 'foot-walking') {
    console.log("Iniciando navegação interativa...");

    try {
        // Valida os parâmetros de entrada
        if (!validateCoordinates(userLat, userLon, destLat, destLon)) {
            throw new Error("Coordenadas inválidas fornecidas para navegação interativa.");
        }

        if (!Array.isArray(instructions) || instructions.length === 0) {
            throw new Error("Instruções de navegação inválidas ou vazias.");
        }

        if (!validateProfile(profile)) {
            throw new Error(`Perfil de transporte inválido: ${profile}`);
        }

        // Exibe uma notificação de início
        showNotification("Navegação interativa iniciada.", "info");

        // Exibe as instruções detalhadas na interface
        displayInteractiveTurnInstructions(instructions);

        // Configura o rastreamento do movimento do usuário em tempo real
        trackUserMovement(destLat, destLon, instructions);

        // Mostra a barra de navegação com o status inicial
        showNavigationBar("Navegação ativa");

        // Log do evento de início de navegação
        logEvent("StartInteractiveRoute", {
            userLat,
            userLon,
            destLat,
            destLon,
            profile,
        });

        console.log("Navegação interativa iniciada com sucesso.");
    } catch (error) {
        // Trata e registra qualquer erro ocorrido
        handleError("Erro ao iniciar navegação interativa.", error);
        logEvent("ErrorInteractiveRoute", { error: error.message });
    }
}

function displayInteractiveTurnInstructions(currentStep, remainingSteps) {
    highlightCurrentInstruction(currentStep.index);

    if (currentStep.distance < 50) {
        notifyNextInstruction(remainingSteps[0]);
    }
}

function updateInstructionsOnProgress(userLat, userLon, routeSteps) {
    const nextStep = routeSteps[0];
    const distanceToNext = calculateDistance(userLat, userLon, nextStep.lat, nextStep.lon);

    if (distanceToNext < 10) {
        routeSteps.shift(); // Remove o passo atual
        if (routeSteps.length) {
            notifyNextInstruction(routeSteps[0]); // Notifica o próximo passo
        } else {
            showNotification(getNavigationText("atDestination"), "success");
            endNavigation();
        }
    }
}

function validateRouteData(routeData) {
    if (!routeData || !routeData.features || routeData.features.length === 0) {
        console.error("Dados de rota inválidos fornecidos.");
        return false;
    }
    return true;
}


async function handleRecalculation(destLat, destLon, profile = "foot-walking") {
    console.log("Recalculando a rota devido a desvio...");
    try {
        const newInstructions = await createRouteToDestination(destLat, destLon, profile);
        if (!newInstructions) {
            showNotification("Erro ao recalcular a rota. Tente novamente.", "error");
            return [];
        }

        showNotification("Rota recalculada com sucesso.", "success");
        return newInstructions;
    } catch (error) {
        handleError("Erro ao recalcular a rota.", error);
        return [];
    }
}


function clearNavigationState() {
    console.log("Limpando estado global da navegação...");

    if (window.navigationWatchId) {
        navigator.geolocation.clearWatch(window.navigationWatchId);
        window.navigationWatchId = null;
    }

    window.currentRoute = null;
    window.userLocationMarker = null;
    window.markers = [];

    console.log("Estado da navegação limpo.");
}


// Obtém instruções detalhadas da rota a partir da API OpenRouteService
async function fetchRouteInstructions(startLat, startLon, destLat, destLon) {
    try {
        const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${startLon},${startLat}&end=${destLon},${destLat}&instructions=true`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Erro na API de instruções de rota.");
        }

        const routeData = await response.json();
        const instructions = routeData.features[0].properties.segments[0].steps.map((step) => ({
            text: step.instruction,
            distance: Math.round(step.distance),
            lat: step.way_points ? routeData.features[0].geometry.coordinates[step.way_points[0]][1] : null,
            lon: step.way_points ? routeData.features[0].geometry.coordinates[step.way_points[0]][0] : null,
        }));

        return instructions;
    } catch (error) {
        console.error("Erro ao buscar instruções de rota:", error);
        showNotification("Erro ao carregar as instruções da rota.", "error");
        return [];
    }
}





function getDirectionIcon(instructionText) {
    const directionMap = {
        "Turn left": "⬅️",
        "Turn right": "➡️",
        "Continue straight": "⬆️",
        "Arrive at your destination": "🏁",
    };

    return directionMap[instructionText] || "ℹ️"; // Ícone padrão para instruções desconhecidas
}





// Ativa o rastreamento em tempo real da localização do usuário no mapa
// A função:
// 1. Verifica se o navegador suporta a API de geolocalização.
// 2. Usa `navigator.geolocation.watchPosition` para rastrear a posição atual do usuário.
// 3. Atualiza o marcador do usuário com a nova posição no mapa.
// 4. Centraliza o mapa na posição do usuário com uma animação suave.
// 5. Trata erros de geolocalização, como permissões negadas ou timeout.


// Monitora a posição do usuário em tempo real e ajusta a navegação
function trackUserMovement(destLat, destLon, instructions) {
    if (!navigator.geolocation) {
        console.error("Geolocalização não suportada pelo navegador.");
        showNotification("Seu navegador não suporta geolocalização.", "error");
        return;
    }

    window.navigationWatchId = navigator.geolocation.watchPosition(
        (position) => {
            const { latitude: userLat, longitude: userLon } = position.coords;
            updateRealTimeNavigation(userLat, userLon, instructions);

            const distanceToDestination = calculateDistance(userLat, userLon, destLat, destLon);
            if (distanceToDestination < 50) {
                showNotification("Você chegou ao destino!", "success");
                endNavigation();
            }
        },
        (error) => {
            console.error("Erro ao rastrear posição:", error);
            showNotification("Erro ao rastrear posição.", "error");
        },
        { enableHighAccuracy: true }
    );
}








async function checkIfUserIsOnRoad(lat, lon) {
    try {
        const query = `[out:json];way(around:30,${lat},${lon})[highway];out;`;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        const response = await fetch(url);
        if (!response.ok) {
            console.error("Erro ao verificar se o usuário está em uma rua:", response.statusText);
            return false;
        }

        const data = await response.json();
        const isOnRoad = data.elements && data.elements.length > 0;

        console.log(
            isOnRoad
                ? "Usuário está em uma rua válida."
                : "Usuário não está em uma rua válida."
        );
        return isOnRoad;
    } catch (error) {
        console.error("Erro ao verificar rua no OpenStreetMap:", error);
        return false;
    }
}



function displaySingleInstruction(instruction) {
    const instructionContainer = document.getElementById("navigation-instructions");
    const instructionsList = document.getElementById("instructions-list");

    if (!instructionContainer || !instructionsList) {
        console.error("Modal de instruções não encontrado.");
        return;
    }

    instructionsList.innerHTML = ""; // Limpa as instruções anteriores

    if (!instruction || !instruction.text) {
        instructionsList.innerHTML = `<li>Nenhuma instrução disponível.</li>`;
        return;
    }

    const instructionElement = document.createElement("li");
    instructionElement.className = "instruction-step active-instruction";
    instructionElement.innerHTML = `
        <span class="direction-arrow">${getDirectionIcon(instruction.text)}</span>
        ${instruction.text} (${instruction.distance} metros)
    `;

    instructionsList.appendChild(instructionElement);
    console.log("Instrução exibida no modal:", instruction.text);
}





function translateInstruction(text) {
    const translations = {
        en: {
            "Turn left": "Vire à esquerda",
            "Turn right": "Vire à direita",
            "Continue straight": "Continue em frente",
            // Adicione mais traduções conforme necessário
        },
        pt: {
            "Turn left": "Vire à esquerda",
            "Turn right": "Vire à direita",
            "Continue straight": "Continue em frente",
        },
    };

    const selectedLanguage = getSelectedLanguage(); // Assume que há uma função que retorna o idioma selecionado
    return translations[selectedLanguage]?.[text] || text;
}


function updateRealTimeNavigation(userLat, userLon, routeInstructions) {
    if (!routeInstructions || routeInstructions.length === 0) {
        console.warn("Nenhuma instrução disponível para atualizar.");
        showNotification("Erro: Nenhuma instrução disponível.", "error");
        return;
    }

    const nextInstruction = routeInstructions[0];

    if (!nextInstruction || !nextInstruction.lat || !nextInstruction.lon) {
        console.error("Erro: Instrução inválida ou incompleta:", nextInstruction);
        showNotification("Erro ao processar instruções. Recalcule a rota.", "error");
        return;
    }

    const distanceToNext = calculateDistance(userLat, userLon, nextInstruction.lat, nextInstruction.lon);

    if (distanceToNext < 50) {
        routeInstructions.shift(); // Remove a instrução concluída
        displayStepByStepInstructions(routeInstructions[0]); // Atualiza o modal com a próxima instrução

        if (routeInstructions.length > 0) {
            notifyDirectionChange(routeInstructions[0].text); // Feedback ao usuário
        } else {
            showNotification("Você chegou ao destino!", "success");
            endNavigation();
        }
    } else {
        const message = `Próxima direção: ${nextInstruction.text} em ${distanceToNext} metros.`;
        showNotification(message, "info");
        console.log(message);
    }
}




function getDirectionIcon(instructionText) {
    const directionMap = {
        "Continue straight": "⬆️",
        "Turn left": "⬅️",
        "Turn right": "➡️",
        "Arrive at your destination": "🏁",
    };

    return directionMap[instructionText] || "ℹ️"; // Ícone padrão para instruções desconhecidas
}




function updateNavigationProgress(userLat, userLon, destLat, destLon) {
    const progressBar = document.getElementById("progress-bar");
    const distanceToDestination = calculateDistance(userLat, userLon, destLat, destLon);

    if (!progressBar) {
        console.error("Elemento de barra de progresso não encontrado.");
        return;
    }

    const progress = Math.max(0, 100 - (distanceToDestination / 1000) * 100);
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${distanceToDestination.toFixed(0)} metros restantes`;

    if (distanceToDestination < 50) {
        finalizeRouteOnArrival(userLat, userLon, destLat, destLon);
    }

    console.log(`Progresso atualizado: ${progress}% concluído.`);
}


async function isUserOnStreet(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error("Erro ao verificar localização na OSM:", response.statusText);
            return false;
        }

        const data = await response.json();
        if (data.address && data.address.road) {
            console.log("Usuário está em uma rua:", data.address.road);
            return true;
        }

        console.warn("Usuário não está em uma rua.");
        return false;
    } catch (error) {
        console.error("Erro ao verificar localização na OSM:", error);
        return false;
    }
}


// Fornece feedback de voz ao usuário
function giveVoiceFeedback(text) {
    if (!('speechSynthesis' in window)) {
        console.warn("Síntese de fala não suportada pelo navegador.");
        showNotification("Seu navegador não suporta síntese de fala.", "warning");
        return;
    }

    if (!text || typeof text !== 'string') {
        console.error("Texto inválido para síntese de fala:", text);
        return;
    }

    try {
        const utterance = new SpeechSynthesisUtterance(text);

        // Configurações da fala
        utterance.lang = 'pt-BR'; // Configura o idioma para português do Brasil
        utterance.rate = 1.0;    // Velocidade da fala (1.0 é normal)
        utterance.pitch = 1.0;   // Tom da fala
        utterance.volume = 1.0;  // Volume (0.0 a 1.0)

        utterance.onerror = (error) => {
            console.error("Erro na síntese de fala:", error);
            showNotification("Erro ao gerar áudio de navegação.", "error");
        };

        window.speechSynthesis.speak(utterance);
        console.log("Feedback de voz gerado com sucesso:", text);
    } catch (error) {
        console.error("Erro ao processar síntese de fala:", error);
        showNotification("Erro ao processar feedback de voz.", "error");
    }
}



function calculateETA(routeData) {
    if (!routeData || !routeData.features || routeData.features.length === 0) {
        console.error("Dados de rota inválidos fornecidos para cálculo de ETA.");
        return "ETA não disponível.";
    }

    const duration = routeData.features[0].properties.summary.duration; // Duração em segundos
    const eta = Math.round(duration / 60); // Converte para minutos

    console.log(`Tempo estimado de chegada (ETA): ${eta} minutos.`);
    return `Tempo estimado de chegada: ${eta} minutos.`;
}


function debouncedUpdate(userLat, userLon, destLat, destLon, debounceTime = 1000) {
    if (!userLat || !userLon || !destLat || !destLon) {
        console.error("Coordenadas inválidas fornecidas para atualização.");
        return;
    }

    if (gpsUpdateTimeout) clearTimeout(gpsUpdateTimeout);

    gpsUpdateTimeout = setTimeout(() => {
        updateUserPositionOnRoute(userLat, userLon, destLat, destLon);
        console.log("Atualização da posição do usuário concluída após debounce.");
    }, debounceTime);
}

// Oculta a barra de navegação
function hideNavigationBar() {
    const navBar = document.getElementById("navigation-bar");
    if (navBar) navBar.classList.add("hidden");
}



// Atualiza as instruções de navegação em tempo real
// Atualiza as instruções de navegação em tempo real
function updateNavigationInstructions(instructionKey, distance = null) {
    const navigationBar = document.getElementById("navigation-bar");
    const navigationInstructions = document.getElementById("navigation-instructions");

    if (!navigationBar || !navigationInstructions) {
        console.error("Elementos de navegação (#navigation-bar ou #navigation-instructions) não encontrados.");
        showNotification("Erro ao atualizar instruções de navegação. Contate o suporte.", "error");
        return;
    }

    if (!instructionKey || typeof instructionKey !== "string") {
        console.error("Chave de instrução inválida:", instructionKey);
        showNotification("Erro ao processar instruções de navegação.", "error");
        return;
    }

    try {
        // Localiza a instrução traduzida (caso existam traduções definidas)
        const instruction = translations[selectedLanguage]?.[instructionKey] || instructionKey;

        // Formata a instrução com a distância, se aplicável
        const displayText = distance
            ? `${instruction} por ${distance} metros`
            : instruction;

        // Atualiza o texto na barra de navegação
        navigationInstructions.innerHTML = `<p>${displayText}</p>`;
        navigationBar.classList.remove("hidden");

        console.log("Instruções de navegação atualizadas:", displayText);
    } catch (error) {
        console.error("Erro ao atualizar instruções de navegação:", error);
        showNotification("Erro ao renderizar instruções de navegação. Tente novamente.", "error");
    }
}




// Notifica o usuário sobre uma alteração na direção
function notifyDirectionChange(instruction) {
    if (!instruction || typeof instruction !== "string") {
        handleError("Instrução inválida para notificação.");
        return;
    }

    showNotification(`Próxima direção: ${instruction}`, "info", 5000);
    giveVoiceFeedback(instruction);
    console.log("Notificação de direção exibida:", instruction);
}








// Exibe uma notificação na interface do usuário
function showNotification(message, type = 'info', duration = 1000, persistent = false) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        console.error("Contêiner de notificações (#notification-container) não encontrado.");
        return;
    }

    if (!message || typeof message !== 'string') {
        console.error("Mensagem de notificação inválida:", message);
        return;
    }

    const iconMap = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };

    try {
        // Previne notificações duplicadas
        if (notificationContainer.lastElementChild?.textContent === message) {
            console.warn("Notificação duplicada detectada. Ignorada:", message);
            return;
        }

        const notification = document.createElement('div');
        const uniqueId = `notification-${Date.now()}`;

        notification.id = uniqueId;
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<span class="notification-icon">${iconMap[type] || 'ℹ️'}</span> ${message}`;

        // Configura atributos de acessibilidade
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');

        notificationContainer.appendChild(notification);
        console.log(`Notificação exibida (${type}):`, message);

        // Remove automaticamente a notificação
        if (!persistent) {
            setTimeout(() => {
                const elementToRemove = document.getElementById(uniqueId);
                if (elementToRemove) {
                    elementToRemove.remove();
                    console.log("Notificação removida:", message);
                }
            }, duration);
        }
    } catch (error) {
        console.error("Erro ao exibir notificação:", error);
    }
}



// Atualiza a posição do marcador do usuário
function clearMarkers() {
    if (markers.length === 0) {
        console.log('Nenhum marcador encontrado para limpar.');
        return;
    }

    markers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    markers = [];
    console.log('Todos os marcadores foram removidos do mapa.');
}

function updateUserMarker(lat, lon) {
    if (!userLocationMarker) {
        userLocationMarker = L.marker([lat, lon], {
            icon: L.icon({
                iconUrl: "images/user-icon.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            }),
        })
            .addTo(map)
            .bindPopup("Você está aqui!");
    } else {
        userLocationMarker.setLatLng([lat, lon]);
    }

    console.log(`Marcador do usuário atualizado para: (${lat}, ${lon}).`);
}



// Calcula a distância entre dois pontos
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1000); // Retorna em metros
}


let lastRecalculationTime = 0;

function updateUserPositionOnRoute(userLat, userLon, destLat, destLon) {
    const distance = calculateDistance(userLat, userLon, destLat, destLon);

    if (distance === null) {
        showNotification("Erro ao calcular a distância. Verifique os dados.", "error");
        return;
    }

    console.log(`Distância do usuário ao destino: ${distance} metros.`);

    // Recalcula apenas se o usuário estiver fora do buffer e após 5 segundos
    const now = Date.now();
    if (distance > 100 && now - lastRecalculationTime > 5000) {
        console.log("Usuário fora da rota. Iniciando recalculo...");
        showNotification("Recalculando a rota devido a desvio...", "info");
        createRouteToDestination(destLat, destLon);
        lastRecalculationTime = now;
    }

    if (distance < 50) {
        console.log("Usuário chegou ao destino.");
        showNotification("Você chegou ao destino!", "success");
        endNavigation();
    }
}



// Cria um Popup na localização do usuário
function showUserLocationPopup(lat, lon) {
    const timestamp = new Date().toLocaleString(selectedLanguage || "pt-BR");
    const message = translations[selectedLanguage]?.youAreHere || "Você está aqui!";
    
    L.popup()
        .setLatLng([lat, lon])
        .setContent(`
            <strong>${message}</strong><br>
            Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}<br>
            ${translations[selectedLanguage]?.timestamp || "Horário"}: ${timestamp}
        `)
        .openOn(map);

    console.log("Popup da localização do usuário exibido.");
}


// Exibe a barra de navegação
function showNavigationBar() {
    const navBar = document.getElementById("navigation-bar");
    if (!navBar) {
        handleError("Barra de navegação não encontrada.");
        return;
    }

    navBar.classList.remove("hidden");
    navBar.style.opacity = 1; // Garante visibilidade total
    console.log("Barra de navegação exibida.");
    showNotification("Barra de navegação ativada.", "info");
}


// Traça a rota usando a API OpenRouteService
async function plotRouteOnMap(startLat, startLon, destLat, destLon) {
    const profile = "foot-walking"; // Perfil fixo

    try {
        const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}&start=${startLon},${startLat}&end=${destLon},${destLat}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Erro na resposta da API OpenRouteService.");

        const routeData = await response.json();
        const coordinates = routeData.features[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);

        // Remove rota anterior, se existir
        if (window.currentRoute) {
            map.removeLayer(window.currentRoute);
        }

        // Traça a rota no mapa
        window.currentRoute = L.polyline(coordinates, { color: 'blue', weight: 5 }).addTo(map);
        map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });

        console.log("Rota traçada com sucesso.");
        showNotification("Rota traçada com sucesso!", "success");
        return routeData;
    } catch (error) {
        console.error("Erro ao traçar a rota:", error);
        showNotification("Erro ao traçar a rota. Tente novamente.", "error");
        throw error;
    }
}


// Busca dados do OpenStreetMap
// Faz uma requisição para obter informações baseadas em uma query
function fetchOSMData(query) {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (!data || !data.elements || data.elements.length === 0) {
                throw new Error('Dados inválidos retornados da API OSM');
            }
            return data;
        })
        .catch(error => {
            console.error('Erro ao buscar dados do OSM:', error);
            showNotification(translations[selectedLanguage].osmFetchError, 'error');
            return null;
        });
}

// Personaliza o pop-up de informações exibido no mapa
// Exibe informações adicionais ao clicar em um ponto no mapa
function customizeOSMPopup(marker, data) {
    const popupContent = `
        <b>${data.name}</b><br>
        ${data.description || 'Descrição não disponível.'}
    `;
    marker.bindPopup(popupContent).openPopup();
}

// ======================
// 3. Interface do Usuário (UI)
// ======================

// Exibe um modal específico baseado no ID fornecido
// Torna o modal visível para o usuário
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block'; // Exibe o modal
    } else {
        console.error(`Modal com ID ${modalId} não encontrado.`);
    }
}

// Função para remover o modal do assistente
function hideAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}


// Função para fechar o modal do assistente
function closeAssistantModal() {
    const modal = document.getElementById('assistant-modal'); // Seleciona o modal pelo ID
    if (modal) {
        modal.style.display = 'none'; // Define o display como 'none' para ocultar o modal
        console.log('Modal do assistente fechado.'); // Log para depuração
    } else {
        console.error('Modal do assistente não encontrado.'); // Log de erro caso o modal não exista
    }
}

// ======================
// Estilo e Ajustes de Modais
// ======================

// Ajusta o estilo de um modal específico
// Utilizado para centralizar ou aplicar alterações dinâmicas
// function adjustModalStyles(modal, type) {
//    if (type === 'assistant') {
//        Object.assign(modal.style, {
//          top: '40%',
//        left: '37%',
//            transform: 'translate(-50%, -50%)',
//          width: '70%',
//          maxWidth: '600px',
//          background: 'white',
//          padding: '20px',
//      });
//  } else if (type === 'carousel') {
//      Object.assign(modal.style, {
//          top: '40%',
//          left: '37%',
//          width: '70%',
//          height: '50%',
//      });
//  }
// }

// Ajusta o estilo de todos os modais e botões de controle
// Baseado na interface atual (e.g., visibilidade de menus laterais)
// function adjustModalAndControls() {
//    const assistantModal = document.getElementById('assistant-modal');
//    const carouselModal = document.getElementById('carousel-modal');
//    const sideMenu = document.querySelector('.menu');
//    const controlButtons = document.querySelector('.control-buttons');
//    const mapContainer = document.getElementById('map');
//
//    if (!sideMenu.classList.contains('hidden')) {
//        Object.assign(assistantModal.style, { left: '40%' });
//        Object.assign(controlButtons.style, { left: '40%' });
//        Object.assign(mapContainer.style, { width: '100%', height: '100%' });
//    } else {
//        restoreModalAndControlsStyles();
//    }

//    if (map) {
//        map.invalidateSize(); // Atualiza o tamanho do mapa após ajustes
//    }
// }

// Restaura o estilo padrão de modais e controles
// Reverte as alterações aplicadas dinamicamente
//function restoreModalAndControlsStyles() {
//  const assistantModal = document.getElementById('assistant-modal');
//  const controlButtons = document.querySelector('.control-buttons');
//  const mapContainer = document.getElementById('map');

//  Object.assign(assistantModal.style, {
//      left: '50%',
//      top: '50%',
//      transform: 'translate(-50%, -50%)',
//  });
//  Object.assign(controlButtons.style, { left: '50%' });
//  Object.assign(mapContainer.style, { width: '100%', height: '100%' });
// }

// ======================
// Funções do Carrossel
// ======================

// Inicializa o carrossel de imagens para um local específico
// Utiliza a biblioteca Swiper para configurar o carrossel
function startCarousel(locationName) {
    const images = getImagesForLocation(locationName);

    if (!images || images.length === 0) {
        alert('Nenhuma imagem disponível para o carrossel.');
        return;
    }

    const swiperWrapper = document.querySelector('.swiper-wrapper');
    swiperWrapper.innerHTML = ''; // Limpa imagens anteriores

    images.forEach((imageSrc) => {
        const swiperSlide = document.createElement('div');
        swiperSlide.className = 'swiper-slide';
        swiperSlide.innerHTML = `<img src="${imageSrc}" alt="${locationName}" style="width: 100%; height: 100%;">`;
        swiperWrapper.appendChild(swiperSlide);
    });

    showModal('carousel-modal'); // Mostra o modal do carrossel

    // Destruir instância do Swiper se existir
    if (swiperInstance) {
        swiperInstance.destroy(true, true);
    }

    // Inicializar nova instância do Swiper
    swiperInstance = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 10,
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
    });
}

// Destroi o carrossel e remove seus slides
function destroyCarousel() {
    if (swiperInstance) {
        swiperInstance.destroy(true, true);
        swiperInstance = null;
    }

    const swiperWrapper = document.querySelector('.swiper-wrapper');
    if (swiperWrapper) {
        swiperWrapper.innerHTML = ''; // Remove todos os slides
    }

    closeCarouselModal(); // Fecha o modal do carrossel
}

// Fecha o modal do carrossel
function closeCarouselModal() {
    const carouselModal = document.getElementById('carousel-modal');
    if (carouselModal) {
        carouselModal.style.display = 'none';
    }
}

// ======================
// 4. Controle de Eventos e Botões
// ======================

// Configura os eventos principais da interface do usuário
// Inclui eventos para botões, menus e outras interações
// Função para configurar os event listeners
function setupEventListeners() {
    const modal = document.getElementById('assistant-modal');
    const floatingMenu = document.getElementById('floating-menu');
    const tutorialBtn = document.getElementById('tutorial-btn');
    const createItineraryBtn = document.getElementById('create-itinerary-btn');
    const startCreateRouteBtn = document.getElementById('create-route-btn');
    const noBtn = document.getElementById('no-btn');
    const saveItineraryBtn = document.getElementById('save-itinerary-btn');
    const searchBtn = document.querySelector('.menu-btn[data-feature="pesquisar"]');
    const ensinoBtn = document.querySelector('.menu-btn[data-feature="ensino"]');
    const carouselModalClose = document.getElementById('carousel-modal-close');
    const aboutMoreBtn = document.getElementById('about-more-btn');
    const menuToggle = document.getElementById('menu-btn');
    const buyTicketBtn = document.getElementById('buy-ticket-btn');
    const tourBtn = document.getElementById('tour-btn');
    const navigationBtn = document.getElementById('navigation-start');


const closeModal = document.querySelector('.close-btn'); // Seleciona o botão de fechar
if (closeModal) {
    closeModal.addEventListener('click', closeAssistantModal); // Associa o evento de clique à função
}


    if (menuToggle) {
        menuToggle.style.display = 'none';
        menuToggle.addEventListener('click', () => {
            floatingMenu.classList.toggle('hidden');
            if (tutorialIsActive && tutorialSteps[currentStep].step === 'menu-toggle') {
                nextTutorialStep();
            }
        });
    }

    if (aboutMoreBtn) {
        aboutMoreBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.name) {
                startCarousel(selectedDestination.name);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    if (buyTicketBtn) {
        buyTicketBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    const reserveChairsBtn = document.getElementById('reserve-chairs-btn');
    if (reserveChairsBtn) {
    reserveChairsBtn.addEventListener('click', () => {
        if (selectedDestination && selectedDestination.url) {
            openDestinationWebsite(selectedDestination.url);
        } else {
            alert('Por favor, selecione um destino primeiro.');
        }
    });
}


    const reserveRestaurantsBtn = document.getElementById('reserve-restaurants-btn');
    if (reserveRestaurantsBtn) {
        reserveRestaurantsBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    const reserveInnsBtn = document.getElementById('reserve-inns-btn');
    if (reserveInnsBtn) {
        reserveInnsBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    const speakAttendentBtn = document.getElementById('speak-attendent-btn');
    if (speakAttendentBtn) {
        speakAttendentBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    const callBtn = document.getElementById('call-btn');
    if (callBtn) {
        callBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

        // Configura o evento de mudança de idioma
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.dataset.lang;
            setLanguage(lang); // Altera o idioma
            document.getElementById('welcome-modal').style.display = 'none';
            
        });
    });

    document.getElementById('start-route-btn').addEventListener('click', startInteractiveRoute);


// Evento para botões do menu flutuante
document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
    btn.addEventListener('click', (event) => {
        const feature = btn.getAttribute('data-feature');
        console.log(`Feature selected: ${feature}`);
        handleFeatureSelection(feature);
        adjustModalAndControls();
        closeCarouselModal();
        removeExistingHighlights();
        removeFloatingMenuHighlights();
        removeExistingHighlights();
        event.stopPropagation();
        if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
            nextTutorialStep();
        }
    });
});


// Evento para botões de controle
document.querySelectorAll('.control-btn[data-feature]').forEach(btn => {
    btn.addEventListener('click', (event) => {
        const feature = btn.getAttribute('data-feature');
        console.log(`Control button feature selected: ${feature}`);
        handleFeatureSelection(feature);
        event.stopPropagation();
        if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
            nextTutorialStep();
        }
    });
});



    document.querySelector('.menu-btn.zoom-in').addEventListener('click', () => {
        map.zoomIn();
        closeSideMenu();
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'zoom-in') {
            nextTutorialStep();
        }
    });


    document.querySelector('.menu-btn.zoom-out').addEventListener('click', () => {
        map.zoomOut();
        closeSideMenu();
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'zoom-out') {
            nextTutorialStep();
        }
    });

    // Registrar service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(() => {
        console.log('Service Worker registrado com sucesso.');
    });
}

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchLocation();
            closeSideMenu();
            if (tutorialIsActive && tutorialSteps[currentStep].step === 'pesquisar') {
                nextTutorialStep();
            }
        });
    }

if (startCreateRouteBtn) {
    startCreateRouteBtn.addEventListener('click', () => {
        startRouteCreation();
    });
}

    if (noBtn) {
        noBtn.addEventListener('click', () => {
            hideControlButtons();
        });
    }

    if (carouselModalClose) {
        carouselModalClose.addEventListener('click', closeCarouselModal);
    }


    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', () => {
            if (tutorialIsActive) {
                endTutorial();
            } else {
                showTutorialStep('start-tutorial');
            }
        });


    const tutorialYesBtn = document.getElementById('tutorial-yes-btn');
    const tutorialSiteYesBtn = document.getElementById('tutorial-site-yes-btn');
    const tutorialNoBtn = document.getElementById('tutorial-no-btn');
    const tutorialSendBtn = document.getElementById('tutorial-send-btn');
    const showItineraryBtn = document.getElementById('show-itinerary-btn');
    const generateNewItineraryBtn = document.getElementById('generate-new-itinerary-btn');
    const changePreferencesBtn = document.getElementById('change-preferences-btn');
    const accessSiteBtn = document.getElementById('access-site-btn');

        } if (tutorialSendBtn) {
        tutorialSendBtn.addEventListener('click', () => {
            nextTutorialStep();
        });
    }


    if (tutorialYesBtn) tutorialYesBtn.addEventListener('click', startTutorial);
    if (tutorialSiteYesBtn) tutorialYesBtn.addEventListener('click', startTutorial2);
    if (tutorialNoBtn) tutorialNoBtn.addEventListener('click', () => {
        stopSpeaking();
        endTutorial();
    });
    if (tutorialNextBtn) tutorialNextBtn.addEventListener('click', nextTutorialStep);
    if (tutorialPrevBtn) tutorialPrevBtn.addEventListener('click', previousTutorialStep);
    if (tutorialEndBtn) tutorialEndBtn.addEventListener('click', endTutorial);

    if (createItineraryBtn) {
        createItineraryBtn.addEventListener('click', () => {
            endTutorial();
            closeSideMenu();
            collectInterestData();
            destroyCarousel();
        });
    }



    document.querySelector('.menu-btn[data-feature="dicas"]').addEventListener('click', showTips);
    document.querySelector('.menu-btn[data-feature="ensino"]').addEventListener('click', showEducation);
}


// Oculta todos os botões de controle
// Itera sobre todos os botões dentro da classe `.control-buttons` e aplica `display: none`
function hideAllControlButtons() {
    const controlButtons = document.querySelectorAll('.control-btn');
    controlButtons.forEach(button => {
        button.style.display = 'none';
    });
    console.log('Todos os botões de controle foram ocultados.');
}

function showStartRouteButton() {
    const startRouteButton = document.getElementById('start-route-btn');
    if (startRouteButton) {
        startRouteButton.style.display = 'block';
        console.log('Botão de iniciar rota exibido.');
    } else {
        console.error('Botão #start-route-btn não encontrado.');
    }
}


// Função para exibir botões do menu lateral, toggle e o floating-menu
function showMenuButtons() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    const floatingMenu = document.querySelector('#floating-menu');

    // Exibe os botões do menu lateral
    menuButtons.forEach(button => {
        button.classList.remove('hidden');
    });

    // Exibe o botão de toggle do menu
    if (menuToggle) {
        menuToggle.classList.remove('hidden');
    }

    // Exibe o floating-menu
    if (floatingMenu) {
        floatingMenu.classList.remove('hidden');
    }


}

function hideControlButtons() {
    const buttonsToHide = [
        'tutorial-no-btn', 'tutorial-yes-btn', 'tutorial-send-btn', 'tutorial-site-yes-btn', 'tutorial-next-btn', 'tutorial-prev-btn',
        'tutorial-end-btn', 'create-itinerary-btn', 'create-route-btn', 'about-more-btn',
        'buy-ticket-btn', 'tour-btn', 'reserve-restaurants-btn', 'reserve-inns-btn',
        'speak-attendent-btn', 'call-btn', 'tutorial-menu-btn', 'navigation-start'
    ];
    buttonsToHide.forEach(id => {
        const button = document.getElementById(id);
        if (button) button.style.display = 'none';
    });
}


function toggleMenu() {
    const menu = document.getElementById('floating-menu');
    if (!menu) {
        console.error('Elemento de menu não encontrado.');
        return;
    }
    menu.classList.toggle('hidden');
}


// Exibe a seção geral de botões de controle
// Configura o estilo "flex" na classe `.control-buttons` para garantir sua visibilidade
function showControlButtons() {
    document.querySelector('start-navigation-button').style.display = 'flex';
    document.querySelector('tutorial-menu-btn').style.display = 'flex';
    document.querySelector('navigation-end-btn').style.display = 'flex';
}

// Oculta todos os botões com a classe `.control-btn` na página
function hideAllButtons() {
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(button => button.style.display = 'none');
}

// Função para remover destaques do menu flutuante
function removeFloatingMenuHighlights() {
    const floatingMenuButtons = document.querySelectorAll('.floating-menu .menu-btn');
    floatingMenuButtons.forEach(button => {
        button.classList.remove('highlight');
    });
}


// ======================
// Botões Específicos
// ======================

// Exibe os botões apropriados
function showButtons(buttonIds) {
    const allButtons = document.querySelectorAll('.control-buttons button');
    allButtons.forEach(button => button.style.display = 'none');

    buttonIds.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.style.display = 'inline-block';
        }
    });
}

// Exibe botões de controle específicos para pontos turísticos
// Inclui: criar rota, saiba mais, tutorial anterior
function showControlButtonsTouristSpots() {
    closeAssistantModal();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
}


// Exibe botões de controle específicos para passeios
// Inclui: criar rota, saiba mais, tutorial anterior
function showControlButtonsTour() {
    closeAssistantModal();
    document.getElementById('tour-btn').style.display = 'flex';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
}

// Exibe botões de controle específicos para praias
// Inclui: criar rota, saiba mais, tutorial anterior
// Exclui: reservar cadeiras
function showControlButtonsBeaches() {
    closeAssistantModal();
    document.getElementById('reserve-chairs-btn').style.display = 'none';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
}

// Exibe botões de controle específicos para eventos noturnos
// Inclui: criar rota, saiba mais, tutorial anterior, comprar ingresso
function showControlButtonsNightlife() {
    closeAssistantModal();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
    document.getElementById('buy-ticket-btn').style.display = 'flex';
}

// Exibe botões de controle específicos para restaurantes
// Inclui: criar rota, saiba mais, tutorial anterior, reservar restaurante
function showControlButtonsRestaurants() {
    closeAssistantModal();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
    document.getElementById('reserve-restaurants-btn').style.display = 'flex';
}

// Exibe botões de controle específicos para pousadas
// Inclui: criar rota, saiba mais, tutorial anterior, reservar pousada
function showControlButtonsInns() {
    closeAssistantModal();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
    document.getElementById('reserve-inns-btn').style.display = 'flex';
}

// Exibe botões de controle específicos para lojas
// Inclui: criar rota, saiba mais, tutorial anterior, falar com atendente
function showControlButtonsShops() {
    closeAssistantModal();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('speak-attendent-btn').style.display = 'flex';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
}

// Exibe botões de controle específicos para emergências
// Inclui: criar rota, saiba mais, tutorial anterior, ligar
function showControlButtonsEmergencies() {
    closeAssistantModal();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('call-btn').style.display = 'flex';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
}

// Exibe botões de controle específicos para dicas
// Inclui: saiba mais, tutorial anterior
function showControlButtonsTips() {
    closeAssistantModal();
    document.getElementById('about-more-btn').style.display = 'none';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
}

// Exibe botões de controle específicos para a seção de educação
// Inclui: tutorial anterior
// Exclui: criar rota, saiba mais
function showControlButtonsEducation() {
    closeAssistantModal();
    document.getElementById('create-route-btn').style.display = 'none';
    document.getElementById('about-more-btn').style.display = 'none';
    document.getElementById('tutorial-menu-btn').style.display = 'flex';
}

// ======================
// Funções Auxiliares para Ações de Botões
// ======================

// Executa uma ação específica vinculada a um botão de controle
function performControlAction(action) {
    switch (action) {
        case 'next':
            nextTutorialStep(currentStep); // Avança para o próximo passo do tutorial
            break;
        case 'previous':
            previousTutorialStep(currentStep); // Volta para o passo anterior
            break;
        case 'finish':
            endTutorial(); // Finaliza o tutorial
            break;
        case 'start-tutorial':
            initializeTutorial(); // Inicia o tutorial
            break;
        case 'menu-toggle':
            const floatingMenu = document.getElementById('floating-menu');
            floatingMenu.classList.toggle('hidden'); // Mostra ou esconde o menu flutuante
            break;
        case 'pontos-turisticos':
            storeAndProceed('pontos-turisticos'); // Navega para pontos turísticos
            break;
        case 'passeios':
            storeAndProceed('passeios'); // Navega para passeios
            break;
        case 'praias':
            storeAndProceed('praias'); // Navega para praias
            break;
        case 'festas':
            storeAndProceed('festas'); // Navega para festas
            break;
        case 'restaurantes':
            storeAndProceed('restaurantes'); // Navega para restaurantes
            break;
        case 'pousadas':
            storeAndProceed('pousadas'); // Navega para pousadas
            break;
        case 'lojas':
            storeAndProceed('lojas'); // Navega para lojas
            break;
        case 'emergencias':
            storeAndProceed('emergencias'); // Navega para emergências
            break;
        case 'reserve-chairs':
            alert('Reserva de cadeiras iniciada.'); // Inicia a reserva de cadeiras
            break;
        case 'buy-ticket':
            alert('Compra de ingresso iniciada.'); // Inicia a compra de ingressos
            break;
        case 'create-route':
            startCreateRoute();
             // Cria rota para o destino
            break;
        case 'access-site':
            accessSite(); // Acessa o site
            break;
        case 'tutorial-send':
            nextTutorialStep(); // Envia resposta no tutorial
            break;
        case 'tutorial-menu':
            showTutorialStep('ask-interest'); // Mostra o menu do tutorial
            break;
        case 'navigation-start':
            startNavigationFlow(); // Inicia a navegação
            break;
        case 'navigation-end':
            endNavigation(); // Finaliza a navegação
            break;
        default:
            console.error(`Ação não reconhecida: ${action}`);
    }
}

// Trata cliques nos botões de submenu e ajusta o mapa e a interface
// Parâmetros:
// - lat: Latitude do local selecionado.
// - lon: Longitude do local selecionado.
// - name: Nome do local selecionado.
// - description: Descrição do local selecionado.
// - controlButtonsFn: Função que exibe os botões de controle específicos para o submenu.
// A função:
// 1. Remove todos os marcadores existentes no mapa.
// 2. Ajusta a localização do mapa para o local selecionado.
// 3. Atualiza o destino selecionado no estado global e salva no cache do navegador.
// 4. Envia o destino para um Service Worker para sincronização.
// 5. Exibe os botões de controle associados ao submenu.
// 6. Obtém imagens relacionadas ao local e exibe detalhes em um modal.
// Função para ocultar o modal do assistente
function hideAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função principal para tratar cliques nos botões do submenu
// Função para lidar com o clique em um botão do submenu
function handleSubmenuButtonClick(lat, lon, name, description, controlButtonsFn) {
    // Atualiza o estado global do destino
    selectedDestination = { lat, lon, name, description };

    // Ajusta o mapa
    adjustMapWithLocation(lat, lon, name);

    // Notificação
    showNotification(`Destino selecionado: ${name}`, 'success');
    giveVoiceFeedback(`Destino ${name} selecionado com sucesso.`);
}


// Função para salvar o destino selecionado no cache
// Salvar destino no IndexedDB via service worker
function saveDestinationToCache(destination) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            command: 'saveDestination',
            data: destination,
        });
    } else {
        console.error('Service worker não está ativo.');
    }
}

// Carregar destinos do IndexedDB via service worker
function loadDestinationsFromCache(callback) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            command: 'loadDestinations',
        });
        navigator.serviceWorker.onmessage = (event) => {
            if (event.data.command === 'destinationsLoaded') {
                callback(event.data.data);
            }
        };
    } else {
        console.error('Service worker não está ativo.');
    }
}


// Funções específicas para cada submenu, todas ocultam o modal
function handleSubmenuButtonsTouristSpots(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTouristSpots);
}

function handleSubmenuButtonsTour(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTour);
}

function handleSubmenuButtonsBeaches(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsBeaches);
}

function handleSubmenuButtonsRestaurants(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsRestaurants);
}

function handleSubmenuButtonsShops(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsShops);
}

function handleSubmenuButtonsEmergencies(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsEmergencies);
}

function handleSubmenuButtonsTips(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTips);
}

function handleSubmenuButtonsInns(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsInns);
}

function handleSubmenuButtonsEducation(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsEducation);
}


// ======================
// 5. Gerenciamento de Submenus
// ======================

// Carrega e exibe o submenu correspondente a uma funcionalidade específica
// Parâmetros:
// - subMenuId: ID do elemento HTML onde o submenu será exibido.
// - feature: String que define qual funcionalidade será exibida no submenu (e.g., 'praias', 'restaurantes').
// A função:
// 1. Verifica se o elemento do submenu existe na página.
// 2. Exibe o submenu ao definir seu estilo como 'block'.
// 3. Usa um `switch` para determinar qual função específica chamar, com base no parâmetro `feature`.
// 4. Exibe um erro no console se o submenu ou a funcionalidade não forem reconhecidos.

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

// Gera dinamicamente os botões do submenu e adiciona marcadores no mapa
// Parâmetros:
// - items: Array de objetos contendo os detalhes de cada item a ser exibido no submenu (e.g., nome, lat, lon, descrição).
// - subMenuId: ID do elemento HTML onde os itens do submenu serão renderizados.
// - feature: String representando a funcionalidade associada ao submenu (e.g., 'praias', 'restaurantes').
// A função:
// 1. Limpa o conteúdo atual do submenu especificado.
// 2. Itera sobre os itens recebidos e cria botões dinamicamente com atributos personalizados.
// 3. Configura eventos de clique para os botões que destacam o item no mapa e executam funcionalidades associadas.
// 4. Adiciona marcadores ao mapa para cada item e vincula pop-ups contendo informações relevantes.

function displayCustomItems(items, subMenuId, feature) {
    // 1. Limpa o conteúdo atual do submenu
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = '';

    // 2. Itera sobre os itens e cria botões dinamicamente
    items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item submenu-button';
        btn.textContent = item.name;
        btn.setAttribute('data-lat', item.lat); // Latitude do item
        btn.setAttribute('data-lon', item.lon); // Longitude do item
        btn.setAttribute('data-name', item.name); // Nome do item
        btn.setAttribute('data-description', item.description); // Descrição do item
        btn.setAttribute('data-feature', feature); // Funcionalidade associada
        btn.setAttribute('data-destination', item.name); // Destino do item

        // 3. Configura o evento de clique para o botão
        btn.onclick = () => {
            handleSubmenuButtons(
                item.lat, // Latitude
                item.lon, // Longitude
                item.name, // Nome
                item.description, // Descrição
                [], // Outros dados adicionais
                feature // Funcionalidade
            );
        };

        subMenu.appendChild(btn); // Adiciona o botão ao submenu

        // 4. Adiciona marcadores ao mapa e configura o pop-up
        const marker = L.marker([item.lat, item.lon]).addTo(map)
            .bindPopup(`<b>${item.name}</b><br>${item.description}`);
        markers.push(marker); // Armazena o marcador na lista global
    });
}

// Gera dinamicamente os botões do submenu e adiciona marcadores no mapa
// Parâmetros:
// - data: Objeto contendo os elementos retornados pela API do OpenStreetMap, incluindo coordenadas e tags (e.g., nome, descrição).
// - subMenuId: ID do elemento HTML onde os itens do submenu serão renderizados.
// - feature: String representando a funcionalidade associada ao submenu (e.g., 'restaurants', 'beaches').
// A função:
// 1. Limpa o conteúdo atual do submenu especificado.
// 2. Itera sobre os elementos recebidos da API do OSM e cria botões dinamicamente para cada ponto com dados válidos (nome e coordenadas).
// 3. Configura eventos de clique nos botões para destacar o item no mapa e executar funcionalidades associadas.
// 4. Adiciona marcadores ao mapa para cada elemento do OSM e vincula pop-ups contendo informações relevantes.
// 5. Configura eventos adicionais para os botões de submenu que exibem conteúdo detalhado do destino selecionado e finalizam interações (e.g., encerram tutoriais).

function displayOSMData(data, subMenuId, feature) {
    // 1. Limpa o conteúdo atual do submenu
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = '';

    // 2. Itera sobre os elementos recebidos do OSM e cria botões dinamicamente
    data.elements.forEach(element => {
        if (element.type === 'node' && element.tags.name) { // Verifica se o elemento é um nó válido com nome
            const btn = document.createElement('button'); // Cria botão para o item
            btn.className = 'submenu-item submenu-button';
            btn.textContent = element.tags.name; // Define o texto do botão como o nome do elemento
            btn.setAttribute('data-destination', element.tags.name); // Define atributo para uso posterior

            // Define a descrição do item
            const description = element.tags.description || 'Descrição não disponível';

            // 3. Configura evento de clique para o botão
            btn.onclick = () => {
                handleSubmenuButtons(
                    element.lat, // Latitude do elemento
                    element.lon, // Longitude do elemento
                    element.tags.name, // Nome do elemento
                    description, // Descrição do elemento
                    element.tags.images || [], // Imagens (se disponíveis)
                    feature // Funcionalidade associada
                );
            };

            subMenu.appendChild(btn); // Adiciona o botão ao submenu

            // 4. Adiciona marcador no mapa e configura pop-up com informações do item
            const marker = L.marker([element.lat, element.lon]).addTo(map)
                .bindPopup(`<b>${element.tags.name}</b><br>${description}`);
            markers.push(marker); // Salva o marcador na lista global
        }
    });

    // 5. Configura eventos adicionais para botões do submenu
    document.querySelectorAll('.submenu-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const destination = this.getAttribute('data-destination'); // Obtém o destino associado ao botão
            console.log(`Destination selected: ${destination}`);

            // Exibe o conteúdo do destino selecionado
            showDestinationContent(destination);

        });
    });
}

// Gerencia a seleção de uma funcionalidade do menu e a exibição do submenu correspondente
// Parâmetros:
// - feature: String representando a funcionalidade selecionada (e.g., 'praias', 'restaurantes').
// A função:
// 1. Define os mapeamentos de funcionalidades para IDs de submenus.
// 2. Valida se a funcionalidade selecionada possui um submenu associado. Caso contrário, exibe um erro no console.
// 3. Oculta todos os submenus atualmente visíveis e limpa os marcadores do mapa.
// 4. Verifica se o submenu já está ativo:
//    - Se estiver ativo, fecha o menu e redefine o estado.
//    - Caso contrário, carrega o submenu associado, ajusta o estado visual dos botões do menu, e exibe o submenu correspondente.

function handleFeatureSelection(feature) {
    // 1. Define os mapeamentos entre funcionalidades e IDs de submenus
    const featureMappings = {
        'pontos-turisticos': 'touristSpots-submenu',
        'passeios': 'tours-submenu',
        'praias': 'beaches-submenu',
        'festas': 'nightlife-submenu',
        'restaurantes': 'restaurants-submenu',
        'pousadas': 'inns-submenu',
        'lojas': 'shops-submenu',
        'emergencias': 'emergencies-submenu',
        'dicas': 'tips-submenu',
        'sobre': 'about-submenu',
        'ensino': 'education-submenu',
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
    document.querySelectorAll('#menu .submenu').forEach(subMenu => {
        subMenu.style.display = 'none';
    });

    // Limpa os marcadores do mapa
    clearMarkers();

    // 4. Verifica se o submenu já está ativo
    if (currentSubMenu === subMenuId) {
        // Se o submenu já estiver ativo, oculta o menu e redefine o estado
        document.getElementById('menu').style.display = 'none';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        currentSubMenu = null;
    } else {
        // Carrega o submenu associado à funcionalidade
        loadSubMenu(subMenuId, feature);

        // Verifica se a funcionalidade está no contexto do tutorial
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'ask-interest') {
            // Avança para o próximo passo do tutorial após carregar o submenu
            nextTutorialStep();
        }

        // Exibe o menu e ajusta os estados visuais dos botões do menu
        document.getElementById('menu').style.display = 'block';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.add('inactive')); // Torna todos os botões inativos
        const activeButton = document.querySelector(`.menu-btn[data-feature="${feature}"]`);
        if (activeButton) {
            activeButton.classList.remove('inactive'); // Remove estado inativo do botão atual
            activeButton.classList.add('active'); // Torna o botão atual ativo
        }

        // Atualiza o estado global com o submenu ativo
        currentSubMenu = subMenuId;
    }
}



// ======================
// Submenus Específicos
// ======================

// Exibe uma lista de eventos de vida noturna no submenu "nightlife-submenu"
// Faz uma busca de dados personalizados utilizando a API OpenStreetMap via `fetchOSMData`
// Chama `displayOSMData` para exibir os itens e criar marcadores no mapa
function displayCustomNightlife() {
    fetchOSMData(queries['nightlife-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'nightlife-submenu', 'festas');
        }
    });
}

// Exibe uma lista de restaurantes no submenu "restaurants-submenu"
// Busca dados personalizados via API OpenStreetMap usando `fetchOSMData`
// Exibe os itens no submenu utilizando `displayOSMData`
function displayCustomRestaurants() {
    fetchOSMData(queries['restaurants-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'restaurants-submenu', 'restaurantes');
        }
    });
}

// Exibe pontos turísticos no submenu "touristSpots-submenu"
// Realiza uma busca de dados via API OpenStreetMap com a função `fetchOSMData`
// Chama `displayOSMData` para exibir os itens no submenu e adicionar marcadores
function displayCustomTouristSpots() {
    fetchOSMData(queries['touristSpots-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'touristSpots-submenu', 'pontos-turisticos');
        }
        hideAllButtons();
    });
}

// Exibe uma lista de praias no submenu "beaches-submenu"
// Busca dados utilizando a API OpenStreetMap com `fetchOSMData`
// Utiliza `displayOSMData` para exibir os itens e adicioná-los ao mapa
function displayCustomBeaches() {
    fetchOSMData(queries['beaches-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'beaches-submenu', 'praias');
        }
    });
}

// Exibe pousadas disponíveis no submenu "inns-submenu"
// Faz uma busca utilizando a API OpenStreetMap através de `fetchOSMData`
// Usa `displayOSMData` para exibir os itens e criar marcadores no mapa
function displayCustomInns() {
    fetchOSMData(queries['inns-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'inns-submenu', 'pousadas');
        }
    });
}

// Exibe lojas disponíveis no submenu "shops-submenu"
// Realiza uma busca utilizando `fetchOSMData` para obter dados personalizados
// Utiliza `displayOSMData` para renderizar os itens no submenu e adicioná-los ao mapa
function displayCustomShops() {
    fetchOSMData(queries['shops-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'shops-submenu', 'lojas');
        }
    });
}

// Exibe uma lista de passeios disponíveis no submenu "tours-submenu"
// Utiliza a função `displayCustomItems` para criar botões e adicionar marcadores no mapa
// A lista é pré-definida com detalhes dos passeios, incluindo nome, coordenadas e descrição
function displayCustomTours() {
    const tours = [
        {
            name: "Passeio de lancha Volta a Ilha de Tinharé",
            lat: -13.3837729,
            lon: -38.9085360,
            description: "Desfrute de um emocionante passeio de lancha ao redor da Ilha de Tinharé. Veja paisagens deslumbrantes e descubra segredos escondidos desta bela ilha."
        },
        {
            name: "Passeio de Quadriciclo para Garapuá",
            lat: -13.3827765,
            lon: -38.9105500,
            description: "Aventure-se em um emocionante passeio de quadriciclo até a pitoresca vila de Garapuá. Aproveite o caminho cheio de adrenalina e as paisagens naturais de tirar o fôlego."
        },
        {
            name: "Passeio 4X4 para Garapuá",
            lat: -13.3808638,
            lon: -38.9127107,
            description: "Embarque em uma viagem emocionante de 4x4 até Garapuá. Desfrute de uma experiência off-road única com vistas espetaculares e muita diversão."
        },
        {
            name: "Passeio de Barco para Gamboa",
            lat: -13.3766536,
            lon: -38.9186205,
            description: "Relaxe em um agradável passeio de barco até Gamboa. Desfrute da tranquilidade do mar e da beleza natural ao longo do caminho."
        }
    ];

    // Passa os dados dos passeios para a função genérica `displayCustomItems`
    displayCustomItems(tours, 'tours-submenu', 'passeios');
}


// Exibe uma lista de serviços de emergência no submenu "emergencies-submenu"
// Dados são pré-definidos, incluindo nome, coordenadas e descrição
// Para cada item, cria botões e adiciona marcadores no mapa
function displayCustomEmergencies() {
    const emergencies = [
        { name: "Ambulância", lat: -13.3773, lon: -38.9171, description: "Serviço de ambulância disponível 24 horas para emergências. Contate pelo número: +55 75-99894-5017." },
        { name: "Unidade de Saúde", lat: -13.3773, lon: -38.9171, description: "Unidade de saúde local oferecendo cuidados médicos essenciais. Contato: +55 75-3652-1798." },
        { name: "Polícia Civil", lat: -13.3775, lon: -38.9150, description: "Delegacia da Polícia Civil pronta para assisti-lo em situações de emergência e segurança. Contato: +55 75-3652-1645." },
        { name: "Polícia Militar", lat: -13.3775, lon: -38.9150, description: "Posto da Polícia Militar disponível para garantir a sua segurança. Contato: +55 75-99925-0856." }
    ];

    // Criação de itens e marcadores para o submenu
    const subMenu = document.getElementById('emergencies-submenu');
    subMenu.innerHTML = '';

    emergencies.forEach(emergency => {
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
            handleSubmenuButtons(emergency.lat, emergency.lon, emergency.name, emergency.description, [], 'emergencias');
        };
        subMenu.appendChild(btn);

        const marker = L.marker([emergency.lat, emergency.lon]).addTo(map).bindPopup(`<b>${emergency.name}</b><br>${emergency.description}`);
        markers.push(marker);
    });
}

// Exibe uma lista de dicas personalizadas no submenu "tips-submenu"
// As dicas incluem melhores pontos turísticos, passeios, praias, restaurantes, pousadas e lojas
// Cada dica é exibida como um botão no submenu, com marcadores adicionados ao mapa
function displayCustomTips() {
    const tips = [
        { name: "Melhores Pontos Turísticos", lat: -13.3766787, lon: -38.9172057, description: "Explore os pontos turísticos mais icônicos de Morro de São Paulo." },
        { name: "Melhores Passeios", lat: -13.3766787, lon: -38.9172057, description: "Descubra os passeios mais recomendados." },
        { name: "Melhores Praias", lat: -13.3766787, lon: -38.9172057, description: "Saiba quais são as praias mais populares." },
        { name: "Melhores Restaurantes", lat: -13.3766787, lon: -38.9172057, description: "Conheça os melhores lugares para comer." },
        { name: "Melhores Pousadas", lat: -13.3766787, lon: -38.9172057, description: "Encontre as melhores opções de pousadas." },
        { name: "Melhores Lojas", lat: -13.3766787, lon: -38.9172057, description: "Descubra as melhores lojas para suas compras." }
    ];

    // Limpa o submenu e cria botões para cada dica
    const subMenu = document.getElementById('tips-submenu');
    subMenu.innerHTML = '';

    tips.forEach(tip => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = tip.name;
        btn.setAttribute('data-lat', tip.lat);
        btn.setAttribute('data-lon', tip.lon);
        btn.setAttribute('data-name', tip.name);
        btn.setAttribute('data-description', tip.description);
        btn.setAttribute('data-feature', 'dicas');
        btn.setAttribute('data-destination', tip.name);

        // Configura o evento de clique para cada botão
        btn.onclick = () => {
            handleSubmenuButtons(tip.lat, tip.lon, tip.name, tip.description, [], 'dicas');
        };
        subMenu.appendChild(btn);

        // Adiciona marcadores no mapa para cada dica
        const marker = L.marker([tip.lat, tip.lon]).addTo(map).bindPopup(`<b>${tip.name}</b><br>${tip.description}`);
        markers.push(marker);
    });
}

// Exibe informações institucionais no submenu "about-submenu"
// Inclui missões, serviços, benefícios para diferentes públicos e o impacto do projeto
// Cria botões no submenu e adiciona marcadores no mapa para cada item
function displayCustomAbout() {
    const about = [
        { name: "Missão", lat: -13.3766787, lon: -38.9172057, description: "Nossa missão é oferecer a melhor experiência aos visitantes." },
        { name: "Serviços", lat: -13.3766787, lon: -38.9172057, description: "Conheça todos os serviços que oferecemos." },
        { name: "Benefícios para Turistas", lat: -13.3766787, lon: -38.9172057, description: "Saiba como você pode se beneficiar ao visitar Morro de São Paulo." },
        { name: "Benefícios para Moradores", lat: -13.3766787, lon: -38.9172057, description: "Veja as vantagens para os moradores locais." },
        { name: "Benefícios para Pousadas", lat: -13.3766787, lon: -38.9172057, description: "Descubra como as pousadas locais podem se beneficiar." },
        { name: "Benefícios para Restaurantes", lat: -13.3766787, lon: -38.9172057, description: "Saiba mais sobre os benefícios para os restaurantes." },
        { name: "Benefícios para Agências de Turismo", lat: -13.3766787, lon: -38.9172057, description: "Veja como as agências de turismo podem se beneficiar." },
        { name: "Benefícios para Lojas e Comércios", lat: -13.3766787, lon: -38.9172057, description: "Descubra os benefícios para lojas e comércios." },
        { name: "Benefícios para Transportes", lat: -13.3766787, lon: -38.9172057, description: "Saiba mais sobre os benefícios para transportes." },
        { name: "Impacto em MSP", lat: -13.3766787, lon: -38.9172057, description: "Conheça o impacto do nosso projeto em Morro de São Paulo." }
    ];

    // Limpa o submenu e cria botões para cada item
    const subMenu = document.getElementById('about-submenu');
    subMenu.innerHTML = '';

    about.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = item.name;
        btn.setAttribute('data-lat', item.lat);
        btn.setAttribute('data-lon', item.lon);
        btn.setAttribute('data-name', item.name);
        btn.setAttribute('data-description', item.description);
        btn.setAttribute('data-feature', 'sobre');
        btn.setAttribute('data-destination', item.name);

        // Configura o evento de clique para cada botão
        btn.onclick = () => {
            handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], 'sobre');
        };
        subMenu.appendChild(btn);

        // Adiciona marcadores no mapa para cada item
        const marker = L.marker([item.lat, item.lon]).addTo(map).bindPopup(`<b>${item.name}</b><br>${item.description}`);
        markers.push(marker);
    });
}

// Exibe itens educacionais no submenu "education-submenu"
// Inclui opções como iniciar tutorial, planejar viagens com IA e configurações do site
// Cada item é representado por um botão no submenu e por um marcador no mapa
function displayCustomEducation() {
    const educationItems = [
        { name: "Iniciar Tutorial", lat: -13.3766787, lon: -38.9172057, description: "Comece aqui para aprender a usar o site." },
        { name: "Planejar Viagem com IA", lat: -13.3766787, lon: -38.9172057, description: "Planeje sua viagem com a ajuda de inteligência artificial." },
        { name: "Falar com IA", lat: -13.3766787, lon: -38.9172057, description: "Converse com nosso assistente virtual." },
        { name: "Falar com Suporte", lat: -13.3766787, lon: -38.9172057, description: "Entre em contato com o suporte." },
        { name: "Configurações", lat: -13.3766787, lon: -38.9172057, description: "Ajuste as configurações do site." }
    ];

    // Verifica se o submenu existe
    const subMenu = document.getElementById('education-submenu');
    if (!subMenu) {
        console.error('Submenu education-submenu não encontrado.');
        return;
    }

    subMenu.innerHTML = '';

    educationItems.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = item.name;
        btn.setAttribute('data-lat', item.lat);
        btn.setAttribute('data-lon', item.lon);
        btn.setAttribute('data-name', item.name);
        btn.setAttribute('data-description', item.description);
        btn.setAttribute('data-feature', 'ensino');
        btn.setAttribute('data-destination', item.name);

        // Configura o evento de clique para cada botão
        btn.onclick = () => {
            handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], 'ensino');
        };
        subMenu.appendChild(btn);

        // Adiciona marcadores no mapa para cada item
        const marker = L.marker([item.lat, item.lon]).addTo(map).bindPopup(`<b>${item.name}</b><br>${item.description}`);
        markers.push(marker);
    });
}

// ======================
// Controle de Submenus
// ======================

// Gerencia as interações do submenu com base na localização e funcionalidade selecionada
// Parâmetros:
// - lat: Latitude do item selecionado.
// - lon: Longitude do item selecionado.
// - name: Nome do item selecionado.
// - description: Descrição do item selecionado.
// - images: Lista de URLs de imagens associadas ao item.
// - feature: Funcionalidade específica vinculada ao item (e.g., 'passeios', 'restaurantes').
// A função:
// 1. Obtém URLs de imagens adicionais relacionadas ao local.
// 2. Limpa os marcadores existentes no mapa e ajusta a visualização para o local selecionado.
// 3. Atualiza o estado global com o destino selecionado e o salva no cache.
// 4. Envia o destino para um Service Worker e limpa a rota atual, se existir.
// 5. Exibe o botão "Saiba mais".
// 6. Usa um `switch` para exibir botões de controle específicos com base na funcionalidade selecionada.
// 7. Garante que botões de controle gerais sejam exibidos para funcionalidades não reconhecidas.

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
        .catch(error => {
            console.error('Erro ao salvar destino no cache:', error);
        });

    // 5. Exibe o botão "Saiba mais"
    const aboutMoreBtn = document.getElementById('about-more-btn');
    if (aboutMoreBtn) {
        aboutMoreBtn.style.display = 'block';
    }

    // 6. Exibe botões de controle específicos com base na funcionalidade
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
            showControlButtons(navigationBtn);
            break;
    }
}

// ======================
// 6. Tutorial e Assistência
// ======================

// Inicia o tutorial
// Define o estado inicial e exibe o primeiro passo
function startTutorial() {
    tutorialIsActive = true;
    toggleTutorialMenuButton(); // Oculta o botão ao iniciar o tutorial
    showTutorialStep('start-tutorial');
}

// Finaliza o tutorial
// Limpa o estado e notifica o usuário
function endTutorial() {
    tutorialIsActive = false;
    currentStep = null;
    hideAllControlButtons(); // Oculta os botões do tutorial
    hideAssistantModal();
    showNotification('Tutorial concluído com sucesso!', 'success');
}

// Função para avançar para o próximo passo do tutorial
function nextTutorialStep() {
    if (currentStep < tutorialSteps.length - 1) {
        currentStep++;
        showTutorialStep(tutorialSteps[currentStep].step); // Mostra o próximo passo
    } else {
        endTutorial(); // Finaliza o tutorial se for o último passo
    }
}

// Retrocede para o passo anterior do tutorial
function previousTutorialStep(currentStep) {
    const currentIndex = tutorialSteps.findIndex(step => step.step === currentStep);
    if (currentIndex > 0) {
        const previousStep = tutorialSteps[currentIndex - 1];
        showTutorialStep(previousStep.step);
    }
}

// Exibe o conteúdo de um passo específico do tutorial
// Mostra a mensagem e executa a ação vinculada ao passo
function showTutorialStep(step) {
    const stepConfig = tutorialSteps.find(s => s.step === step);
    if (!stepConfig) {
        console.error(`Passo ${step} não encontrado.`);
        return;
    }

    const { message, action } = stepConfig;

    updateAssistantModalContent(step, message[selectedLanguage]);
    closeCarouselModal();
    hideAllControlButtons();
    hideRouteSummary();
    hideRoutePreview();

    if (action) action();
}

function removeExistingHighlights() {
    document.querySelectorAll('.arrow-highlight').forEach(el => el.remove());
    document.querySelectorAll('.circle-highlight').forEach(el => el.remove());
}

// Atualiza o conteúdo do modal de assistência
// Adapta o texto e os elementos exibidos para o contexto atual
function updateAssistantModalContent(step, content) {
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    if (!modalContent) {
        console.error('Elemento de conteúdo do modal não encontrado.');
        return;
   
    } else {
        // Atualiza o conteúdo padrão para outros passos
        modalContent.innerHTML = `<p>${content}</p>`;
    }

    // Exibe o modal
    document.getElementById('assistant-modal').style.display = 'block';

}

// Passos do tutorial
const tutorialSteps = [
    {
        step: 'start-tutorial',
        message: {
            pt: "Sua aventura inesquecível em Morro de São Paulo começa aqui!",
            es: "¡Tu aventura inolvidable en Morro de São Paulo comienza aquí!",
            en: "Your unforgettable adventure in Morro de São Paulo starts here!",
            he: "ההרפתקה הבלתי נשכחת שלך במורו דה סאו פאולו מתחילה כאן!"
        },
        action: () => {
            showButtons(['tutorial-iniciar-btn']);
        }
    },
    {
        step: 'ask-interest',
        message: {
            pt: "O que você está procurando em Morro de São Paulo? Escolha uma das opções abaixo.",
            es: "¿Qué estás buscando en Morro de São Paulo? Elige una de las opciones a continuación.",
            en: "What are you looking for in Morro de São Paulo? Choose one of the options below.",
            he: "מה אתה מחפש במורו דה סאו פאולו? בחר אחת מהאפשרויות הבאות."
        },
        action: () => {
            showButtons(['pontos-turisticos-btn', 'passeios-btn', 'praias-btn', 'festas-btn', 'restaurantes-btn', 'pousadas-btn', 'lojas-btn', 'emergencias-btn']);
            clearAllMarkers();
            closeSideMenu();
        }
    },
    ...generateInterestSteps(),
    {
        step: 'end-tutorial',
        message: {
            pt: "Parabéns! Você concluiu o tutorial! Aproveite para explorar todas as funcionalidades disponíveis.",
            es: "¡Felicidades! Has completado el tutorial. Disfruta explorando todas las funciones disponibles.",
            en: "Congratulations! You have completed the tutorial! Enjoy exploring all the available features.",
            he: "מזל טוב! סיימת את המדריך! תהנה מחקר כל התכונות הזמינות."
        },
        action: () => {
            showButtons(['tutorial-end-btn']);
        }
    }
];


// Função para armazenar respostas e prosseguir para o próximo passo
function storeAndProceed(interest) {
    localStorage.setItem('ask-interest', interest);
    const specificStep = tutorialSteps.find(s => s.step === interest);
    if (specificStep) {
        currentStep = tutorialSteps.indexOf(specificStep);
        showTutorialStep(specificStep.step);

    } else {
        console.error('Passo específico para o interesse não encontrado.');
    }
}

// Gera os passos personalizados com base nos interesses e adiciona o passo "submenu-example"
function generateInterestSteps() {
    const interests = [
        { 
            id: 'pousadas', 
            label: "Pousadas", 
            message: {
                pt: "Encontre as melhores pousadas para sua estadia.",
                es: "Encuentra las mejores posadas para tu estadía.",
                en: "Find the best inns for your stay.",
                he: "מצא את הפוסאדות הטובות ביותר לשהותך."
            }
        },
        { 
            id: 'pontos-turisticos', 
            label: "Pontos Turísticos", 
            message: {
                pt: "Descubra os pontos turísticos mais populares.",
                es: "Descubre los puntos turísticos más populares.",
                en: "Discover the most popular tourist attractions.",
                he: "גלה את האטרקציות התיירותיות הפופולריות ביותר."
            }
        },
        { 
            id: 'praias', 
            label: "Praias", 
            message: {
                pt: "Explore as praias mais belas de Morro de São Paulo.",
                es: "Explora las playas más hermosas de Morro de São Paulo.",
                en: "Explore the most beautiful beaches of Morro de São Paulo.",
                he: "גלה את החופים היפים ביותר במורו דה סאו פאולו."
            }
        },
        { 
            id: 'passeios', 
            label: "Passeios", 
            message: {
                pt: "Veja passeios disponíveis e opções de reserva.",
                es: "Consulta los paseos disponibles y las opciones de reserva.",
                en: "See available tours and booking options.",
                he: "צפה בטיולים זמינים ואפשרויות הזמנה."
            }
        },
        { 
            id: 'restaurantes', 
            label: "Restaurantes", 
            message: {
                pt: "Descubra os melhores restaurantes da região.",
                es: "Descubre los mejores restaurantes de la región.",
                en: "Discover the best restaurants in the area.",
                he: "גלה את המסעדות הטובות ביותר באזור."
            }
        },
        { 
            id: 'festas', 
            label: "Festas", 
            message: {
                pt: "Saiba sobre festas e eventos disponíveis.",
                es: "Infórmate sobre fiestas y eventos disponibles.",
                en: "Learn about available parties and events.",
                he: "גלה מסיבות ואירועים זמינים."
            }
        },
        { 
            id: 'lojas', 
            label: "Lojas", 
            message: {
                pt: "Encontre lojas locais para suas compras.",
                es: "Encuentra tiendas locales para tus compras.",
                en: "Find local shops for your purchases.",
                he: "מצא חנויות מקומיות לקניות שלך."
            }
        },
        { 
            id: 'emergencias', 
            label: "Emergências", 
            message: {
                pt: "Informações úteis para situações de emergência.",
                es: "Información útil para situaciones de emergencia.",
                en: "Useful information for emergency situations.",
                he: "מידע שימושי למצבי חירום."
            }
        }
    ];

    // Mapeia os interesses e adiciona o passo "submenu-example"
    const steps = interests.flatMap(interest => [
        {
            step: interest.id,
            element: `.menu-btn[data-feature="${interest.id}"]`,
            message: interest.message,
            action: () => {
                const element = document.querySelector(`.menu-btn[data-feature="${interest.id}"]`);
                if (element) {
                    highlightElement(element);
                } else {
                    console.error(`Elemento para ${interest.label} não encontrado.`);
                }
                showMenuButtons(); // Exibe os botões do menu lateral e toggle
            }
        },
        {
            step: 'submenu-example',
            message: {
                pt: "Escolha uma opção do submenu para continuar.",
                es: "Elige una opción del submenú para continuar.",
                en: "Choose an option from the submenu to proceed.",
                he: "בחר אפשרות מתפריט המשנה כדי להמשיך."
            },
            action: () => {
                const submenu = document.querySelector('.submenu');
                if (submenu) {
                    submenu.style.display = 'block'; // Exibe o submenu
                }
                setupSubmenuListeners();
                endTutorial(); // Configura os listeners para fechar o modal
            }
        }
    ]);

    return steps;
}

function updateProgressBar(current, total) {
    const progressBar = document.getElementById('tutorial-progress-bar');
    progressBar.style.width = `${(current / total) * 100}%`;
}

// ======================
// Assistência Contínua
// ======================

// Fornece assistência contínua baseada nas interações do usuário
// Simula uma busca de informações no banco de dados fictício
function provideContinuousAssistance(query) {
    const results = searchAssistance(query);
    if (results.length > 0) {
        showNotification('Resultados encontrados!', 'success');
    } else {
        showNotification('Nenhum resultado encontrado.', 'error');
    }
}

// Busca informações simuladas para a assistência
// Retorna dados filtrados de um banco de dados fictício
function searchAssistance(query) {
    const fakeDatabase = [
        { name: 'Informação A', description: 'Descrição A' },
        { name: 'Informação B', description: 'Descrição B' }
    ];

    return fakeDatabase.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
}

// ======================
// 7. Traduções e Idiomas
// ======================

// Define o idioma selecionado pelo usuário
// Salva no localStorage e aplica as traduções correspondentes
function setLanguage(lang) {
    try {
        // Salva o idioma selecionado no localStorage
        localStorage.setItem('preferredLanguage', lang);
        selectedLanguage = lang;

        // Aplica as traduções correspondentes
        translatePageContent(lang);

        // Esconde o modal de boas-vindas
        const welcomeModal = document.getElementById('welcome-modal');
        if (welcomeModal) {
            welcomeModal.style.display = 'none';
        }

    showTutorialStep('start-tutorial');
    } catch (error) {
        console.error("Erro ao definir o idioma:", error);
    }
}


// Aplica as traduções no conteúdo da página
// Substitui os textos nos elementos com base no idioma selecionado
// Aplica as traduções no conteúdo da página
function translatePageContent(lang) {
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');
    elementsToTranslate.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = translations[lang]?.[key];

        if (translation) {
            // Verifica se o elemento é um botão ou input
            if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
                element.value = translation; // Define o valor para inputs/buttons
            } else {
                element.textContent = translation; // Substitui o texto em outros elementos
            }
        } else {
            console.warn(`Tradução não encontrada para a chave: ${key} no idioma: ${lang}`);
        }
    });
}


// ======================
// 8. Histórico e Cache
// ======================

// Carrega o histórico de buscas do usuário a partir do localStorage
// Atualiza a interface com os termos de busca recentes
function loadSearchHistory() {
    const history = getLocalStorageItem('searchHistory', []);
    searchHistory = history; // Atualiza a variável global

    const historyContainer = document.getElementById('search-history-container');
    if (historyContainer) {
        historyContainer.innerHTML = ''; // Limpa o histórico atual

        history.forEach(query => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = query;
            historyContainer.appendChild(historyItem); // Adiciona o item ao histórico
        });
    }
}

// Salva uma nova busca no histórico do usuário
// Garante que o histórico tenha um tamanho máximo
function saveSearchQueryToHistory(query) {
    if (!query) return;

    const maxHistoryLength = 10; // Limite de itens no histórico
    searchHistory.unshift(query); // Adiciona a nova busca ao início

    if (searchHistory.length > maxHistoryLength) {
        searchHistory.pop(); // Remove o item mais antigo
    }

    setLocalStorageItem('searchHistory', searchHistory); // Atualiza no localStorage
}

// Verifica conquistas baseadas no histórico do usuário
// Simula a análise de padrões e exibe conquistas relevantes
function checkAchievements() {
    if (searchHistory.includes('praias') && searchHistory.includes('restaurantes')) {
        showNotification('Você desbloqueou a conquista: Explorador Urbano!', 'success');
    }
}

// ======================
// 9. Gerenciamento de Destinos
// ======================

// Seleciona um destino e atualiza o estado global
// Adiciona o destino aos favoritos ou configurações adicionais
// Função adicional para registrar a seleção do destino
function selectDestination(destination) {
    selectedDestination = destination;
    console.log('Destino selecionado:', destination);
}

// Salva o destino selecionado no localStorage
// Garante que o estado seja persistido
function saveDestinationToCache(destination) {
    return new Promise((resolve, reject) => {
        try {
            console.log('Saving Destination to Cache:', destination);
            localStorage.setItem('selectedDestination', JSON.stringify(destination));
            resolve();
        } catch (error) {
            console.error('Erro ao salvar destino no cache:', error);
            reject(new Error('Erro ao salvar destino no cache.'));
        }
    });
}

// Obtém o destino atualmente selecionado a partir do localStorage
function setSelectedDestination(lat, lon, name = "Destino") {
    if (!lat || !lon) {
        console.error("Coordenadas inválidas para o destino:", { lat, lon });
        showNotification("Erro: coordenadas do destino são inválidas. Por favor, tente novamente.", "error");
        return;
    }

    selectedDestination = { lat, lon, name };
    console.log("Destino selecionado:", selectedDestination);

    // Notifica o usuário sobre a seleção do destino
    showNotification(`Destino "${name}" selecionado com sucesso!`, "success");
    giveVoiceFeedback(`Destino ${name} foi selecionado. Criando rota agora.`);

    // Inicia a criação da rota
    createRouteToDestination(lat, lon);
}

function validateSelectedDestination() {
    if (!selectedDestination || !selectedDestination.lat || !selectedDestination.lon) {
        showNotification('Por favor, selecione um destino válido.', 'error');
        giveVoiceFeedback('Nenhum destino válido selecionado.');
        return false;
    }
    return true;
}


// Envia o destino selecionado para um Service Worker
// Utilizado para notificações push ou sincronização em segundo plano
function sendDestinationToServiceWorker(destination) {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SAVE_DESTINATION',
            payload: destination
        });
    } else {
        console.error('Service Worker controller not found.');
    }
}


// ======================
// 10. Ferramentas Auxiliares
// ======================

// Cria dinamicamente um elemento DOM com classes e atributos
// Utilizado para criar botões, contêineres, etc.
function createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag);
    classes.forEach(cls => element.classList.add(cls));
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
}

// Remove todos os filhos de um elemento
// Útil para limpar listas, submenus ou contêineres dinâmicos
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// Destaque visual para elementos do DOM
// Usado para chamar a atenção do usuário para uma parte da interface
// Função para destacar elementos
function highlightElement(element) {
    removeExistingHighlights();
    element.style.outline = '4px solid red';
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Remove destaques existentes
function removeExistingHighlights() {
    const highlightedElements = document.querySelectorAll('[style*="outline"]');
    highlightedElements.forEach(el => {
        el.style.outline = '';
    });
}


// Gera um itinerário com base nas respostas do usuário
// Retorna um objeto contendo os destinos sugeridos
function generateItineraryFromAnswers(answers) {
    const itinerary = answers.map(answer => ({
        name: `Visite ${answer}`,
        description: `Informações sobre ${answer}`,
        lat: -13.41 + Math.random() * 0.01, // Simulação de coordenadas
        lon: -38.91 + Math.random() * 0.01
    }));
    return itinerary;
}

// Obtém URLs de imagens para um local específico
// Usado no carrossel ou para exibição de detalhes
function getUrlsForLocation(locationName) {
    const imageDatabase = {
        'Restaurante A': ['images/restaurant_a_1.jpg', 'images/restaurant_a_2.jpg'],
        'Praia 1': ['images/beach_1_1.jpg', 'images/beach_1_2.jpg']
    };

    return imageDatabase[locationName] || [];
}

function getSelectedDestination() {
    return new Promise((resolve, reject) => {
        try {
            const destination = JSON.parse(localStorage.getItem('selectedDestination'));
            console.log('Retrieved Selected Destination:', destination);
            if (destination) {
                selectedDestination = destination;
                resolve(destination);
            } else {
                reject(new Error('No destination selected.'));
            }
        } catch (error) {
            console.error('Erro ao resgatar destino do cache:', error);
            reject(new Error('Erro ao resgatar destino do cache.'));
        }
    });
}

// Obtém um item do localStorage ou retorna um valor padrão
// Adiciona segurança ao uso de armazenamento local
function getLocalStorageItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Erro ao obter item do localStorage (${key}):`, error);
        return defaultValue;
    }
}

// Salva um item no localStorage
// Converte o valor para JSON antes de armazenar
function setLocalStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Erro ao salvar item no localStorage (${key}):`, error);
    }
}

// Remove um item do localStorage
function removeLocalStorageItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Erro ao remover item do localStorage (${key}):`, error);
    }
}

// Função para obter imagens para uma localização
function getImagesForLocation(locationName) {
    const basePath = 'Images/';

    const imageDatabase = {
        'Farol do Morro': [
            `${basePath}farol_do_morro1.jpg`,
            `${basePath}farol_do_morro2.jpg`,
            `${basePath}farol_do_morro3.jpg`
        ],
        'Toca do Morcego': [
            `${basePath}toca_do_morcego1.jpg`,
            `${basePath}toca_do_morcego2.jpg`,
            `${basePath}toca_do_morcego3.jpg`
        ],
        'Mirante da Tirolesa': [
            `${basePath}mirante_da_tirolesa1.jpg`,
            `${basePath}mirante_da_tirolesa2.jpg`,
            `${basePath}mirante_da_tirolesa3.jpg`
        ],
        'Fortaleza de Morro de São Paulo': [
            `${basePath}fortaleza_de_morro1.jpg`,
            `${basePath}fortaleza_de_morro2.jpg`,
            `${basePath}fortaleza_de_morro3.jpg`
        ],
        'Paredão da Argila': [
            `${basePath}paredao_da_argila1.jpg`,
            `${basePath}paredao_da_argila2.jpg`,
            `${basePath}paredao_da_argila3.jpg`
        ],
        'Passeio de lancha Volta a Ilha de Tinharé': [
            `${basePath}passeio_lancha_ilha_tinhare1.jpg`,
            `${basePath}passeio_lancha_ilha_tinhare2.jpg`,
            `${basePath}passeio_lancha_ilha_tinhare3.jpg`
        ],
        'Passeio de Quadriciclo para Garapuá': [
            `${basePath}passeio_quadriciclo_garapua1.jpg`,
            `${basePath}passeio_quadriciclo_garapua2.jpg`,
            `${basePath}passeio_quadriciclo_garapua3.jpg`
        ],
        'Passeio 4X4 para Garapuá': [
            `${basePath}passeio_4x4_garapua1.jpg`,
            `${basePath}passeio_4x4_garapua2.jpg`,
            `${basePath}passeio_4x4_garapua3.jpg`
        ],
        'Passeio de Barco para Gamboa': [
            `${basePath}passeio_barco_gamboa1.jpg`,
            `${basePath}passeio_barco_gamboa2.jpg`,
            `${basePath}passeio_barco_gamboa3.jpg`
        ],
        'Primeira Praia': [
            `${basePath}primeira_praia1.jpg`,
            `${basePath}primeira_praia2.jpg`,
            `${basePath}primeira_praia3.jpg`
        ],
        'Segunda Praia': [
            `${basePath}segunda_praia1.jpg`,
            `${basePath}segunda_praia2.jpg`,
            `${basePath}segunda_praia3.jpg`
        ],
        'Terceira Praia': [
            `${basePath}terceira_praia1.jpg`,
            `${basePath}terceira_praia2.jpg`,
            `${basePath}terceira_praia3.jpg`
        ],
        'Quarta Praia': [
            `${basePath}quarta_praia1.jpg`,
            `${basePath}quarta_praia2.jpg`,
            `${basePath}quarta_praia3.jpg`
        ],
        'Praia do Encanto': [
            `${basePath}praia_do_encanto1.jpg`,
            `${basePath}praia_do_encanto2.jpg`,
            `${basePath}praia_do_encanto3.jpg`
        ],
        'Praia do Pôrto': [
            `${basePath}praia_do_porto1.jpg`,
            `${basePath}praia_do_porto2.jpg`,
            `${basePath}praia_do_porto3.jpg`
        ],
        'Praia da Gamboa': [
            `${basePath}praia_da_gamboa1.jpg`,
            `${basePath}praia_da_gamboa2.jpg`,
            `${basePath}praia_da_gamboa3.jpg`
        ],
        'Toca do Morcego Festas': [
            `${basePath}toca_do_morcego_festas1.jpg`,
            `${basePath}toca_do_morcego_festas2.jpg`,
            `${basePath}toca_do_morcego_festas3.jpg`
        ],
        'One Love': [
            `${basePath}one_love1.jpg`,
            `${basePath}one_love2.jpg`,
            `${basePath}one_love3.jpg`
        ],
        'Pulsar': [
            `${basePath}pulsar1.jpg`,
            `${basePath}pulsar2.jpg`,
            `${basePath}pulsar3.jpg`
        ],
        'Mama Iate': [
            `${basePath}mama_iate1.jpg`,
            `${basePath}mama_iate2.jpg`,
            `${basePath}mama_iate3.jpg`
        ],
        'Teatro do Morro': [
            `${basePath}teatro_do_morro1.jpg`,
            `${basePath}teatro_do_morro2.jpg`,
            `${basePath}teatro_do_morro3.jpg`
        ],
        'Morena Bela': [
            `${basePath}morena_bela1.jpg`,
            `${basePath}morena_bela2.jpg`,
            `${basePath}morena_bela3.jpg`
        ],
        'Basílico': [
            `${basePath}basilico1.jpg`,
            `${basePath}basilico2.jpg`,
            `${basePath}basilico3.jpg`
        ],
        'Ki Massa': [
            `${basePath}ki_massa1.jpg`,
            `${basePath}ki_massa2.jpg`,
            `${basePath}ki_massa3.jpg`
        ],
        'Tempeiro Caseiro': [
            `${basePath}tempeiro_caseiro1.jpg`,
            `${basePath}tempeiro_caseiro2.jpg`,
            `${basePath}tempeiro_caseiro3.jpg`
        ],
        'Bizu': [
            `${basePath}bizu1.jpg`,
            `${basePath}bizu2.jpg`,
            `${basePath}bizu3.jpg`
        ],
        'Pedra Sobre Pedra': [
            `${basePath}pedra_sobre_pedra1.jpg`,
            `${basePath}pedra_sobre_pedra2.jpg`,
            `${basePath}pedra_sobre_pedra3.jpg`
        ],
        'Forno a Lenha de Mercedes': [
            `${basePath}forno_a_lenha1.jpg`,
            `${basePath}forno_a_lenha2.jpg`,
            `${basePath}forno_a_lenha3.jpg`
        ],
        'Ponto G': [
            `${basePath}ponto_g1.jpg`,
            `${basePath}ponto_g2.jpg`,
            `${basePath}ponto_g3.jpg`
        ],
        'Ponto 9,99': [
            `${basePath}ponto_9991.jpg`,
            `${basePath}ponto_9992.jpg`,
            `${basePath}ponto_9993.jpg`
        ],
        'Patricia': [
            `${basePath}patricia1.jpg`,
            `${basePath}patricia2.jpg`,
            `${basePath}patricia3.jpg`
        ],
        'dizi 10': [
            `${basePath}dizi_101.jpg`,
            `${basePath}dizi_102.jpg`,
            `${basePath}dizi_103.jpg`
        ],
        'Papoula': [
            `${basePath}papoula1.jpg`,
            `${basePath}papoula2.jpg`,
            `${basePath}papoula3.jpg`
        ],
        'Sabor da terra': [
            `${basePath}sabor_da_terra1.jpg`,
            `${basePath}sabor_da_terra2.jpg`,
            `${basePath}sabor_da_terra3.jpg`
        ],
        'Branco&Negro': [
            `${basePath}branco_negro1.jpg`,
            `${basePath}branco_negro2.jpg`,
            `${basePath}branco_negro3.jpg`
        ],
        'Six Club': [
            `${basePath}six_club1.jpg`,
            `${basePath}six_club2.jpg`,
            `${basePath}six_club3.jpg`
        ],
        'Santa Villa': [
            `${basePath}santa_villa1.jpg`,
            `${basePath}santa_villa2.jpg`,
            `${basePath}santa_villa3.jpg`
        ],
        'Recanto do Aviador': [
            `${basePath}recanto_do_aviador1.jpg`,
            `${basePath}recanto_do_aviador2.jpg`,
            `${basePath}recanto_do_aviador3.jpg`
        ],
        'Sambass': [
            `${basePath}sambass1.jpg`,
            `${basePath}sambass2.jpg`,
            `${basePath}sambass3.jpg`
        ],
        'Bar e Restaurante da Morena': [
            `${basePath}bar_restaurante_morena1.jpg`,
            `${basePath}bar_restaurante_morena2.jpg`,
            `${basePath}bar_restaurante_morena3.jpg`
        ],
        'Restaurante Alecrim': [
            `${basePath}restaurante_alecrim1.jpg`,
            `${basePath}restaurante_alecrim2.jpg`,
            `${basePath}restaurante_alecrim3.jpg`
        ],
        'Andina Cozinha Latina': [
            `${basePath}andina_cozinha_latina1.jpg`,
            `${basePath}andina_cozinha_latina2.jpg`,
            `${basePath}andina_cozinha_latina3.jpg`
        ],
        'Papoula Culinária Artesanal': [
            `${basePath}papoula_culinaria_artesanal1.jpg`,
            `${basePath}papoula_culinaria_artesanal2.jpg`,
            `${basePath}papoula_culinaria_artesanal3.jpg`
        ],
        'Minha Louca Paixão': [
            `${basePath}minha_louca_paixao1.jpg`,
            `${basePath}minha_louca_paixao2.jpg`,
            `${basePath}minha_louca_paixao3.jpg`
        ],
        'Café das Artes': [
            `${basePath}cafe_das_artes1.jpg`,
            `${basePath}cafe_das_artes2.jpg`,
            `${basePath}cafe_das_artes3.jpg`
        ],
        'Canoa': [
            `${basePath}canoa1.jpg`,
            `${basePath}canoa2.jpg`,
            `${basePath}canoa3.jpg`
        ],
        'Restaurante do Francisco': [
            `${basePath}restaurante_francisco1.jpg`,
            `${basePath}restaurante_francisco2.jpg`,
            `${basePath}restaurante_francisco3.jpg`
        ],
        'La Tabla': [
            `${basePath}la_tabla1.jpg`,
            `${basePath}la_tabla2.jpg`,
            `${basePath}la_tabla3.jpg`
        ],
        'Santa Luzia': [
            `${basePath}santa_luzia1.jpg`,
            `${basePath}santa_luzia2.jpg`,
            `${basePath}santa_luzia3.jpg`
        ],
        'Chez Max': [
            `${basePath}chez_max1.jpg`,
            `${basePath}chez_max2.jpg`,
            `${basePath}chez_max3.jpg`
        ],
        'Barraca da Miriam': [
            `${basePath}barraca_miriam1.jpg`,
            `${basePath}barraca_miriam2.jpg`,
            `${basePath}barraca_miriam3.jpg`
        ],
        'O Casarão restaurante': [
            `${basePath}casarao_restaurante1.jpg`,
            `${basePath}casarao_restaurante2.jpg`,
            `${basePath}casarao_restaurante3.jpg`
        ],
        'Hotel Fazenda Parque Vila': [
            `${basePath}hotel_fazenda_parque_vila1.jpg`,
            `${basePath}hotel_fazenda_parque_vila2.jpg`,
            `${basePath}hotel_fazenda_parque_vila3.jpg`
        ],
        'Guaiamu': [
            `${basePath}guaiamu1.jpg`,
            `${basePath}guaiamu2.jpg`,
            `${basePath}guaiamu3.jpg`
        ],
        'Pousada Fazenda Caeiras': [
            `${basePath}pousada_fazenda_caeiras1.jpg`,
            `${basePath}pousada_fazenda_caeiras2.jpg`,
            `${basePath}pousada_fazenda_caeiras3.jpg`
        ],
        'Amendoeira Hotel': [
            `${basePath}amendoeira_hotel1.jpg`,
            `${basePath}amendoeira_hotel2.jpg`,
            `${basePath}amendoeira_hotel3.jpg`
        ],
        'Pousada Natureza': [
            `${basePath}pousada_natureza1.jpg`,
            `${basePath}pousada_natureza2.jpg`,
            `${basePath}pousada_natureza3.jpg`
        ],
        'Pousada dos Pássaros': [
            `${basePath}pousada_dos_passaros1.jpg`,
            `${basePath}pousada_dos_passaros2.jpg`,
            `${basePath}pousada_dos_passaros3.jpg`
        ],
        'Hotel Morro de São Paulo': [
            `${basePath}hotel_morro_sao_paulo1.jpg`,
            `${basePath}hotel_morro_sao_paulo2.jpg`,
            `${basePath}hotel_morro_sao_paulo3.jpg`
        ],
        'Uma Janela para o Sol': [
            `${basePath}uma_janela_para_sol1.jpg`,
            `${basePath}uma_janela_para_sol2.jpg`,
            `${basePath}uma_janela_para_sol3.jpg`
        ],
        'Portaló': [
            `${basePath}portalo1.jpg`,
            `${basePath}portalo2.jpg`,
            `${basePath}portalo3.jpg`
        ],
        'Pérola do Morro': [
            `${basePath}perola_do_morro1.jpg`,
            `${basePath}perola_do_morro2.jpg`,
            `${basePath}perola_do_morro3.jpg`
        ],
        'Safira do Morro': [
            `${basePath}safira_do_morro1.jpg`,
            `${basePath}safira_do_morro2.jpg`,
            `${basePath}safira_do_morro3.jpg`
        ],
        'Xerife Hotel': [
            `${basePath}xerife_hotel1.jpg`,
            `${basePath}xerife_hotel2.jpg`,
            `${basePath}xerife_hotel3.jpg`
        ],
        'Ilha da Saudade': [
            `${basePath}ilha_da_saudade1.jpg`,
            `${basePath}ilha_da_saudade2.jpg`,
            `${basePath}ilha_da_saudade3.jpg`
        ],
        'Porto dos Milagres': [
            `${basePath}porto_dos_milagres1.jpg`,
            `${basePath}porto_dos_milagres2.jpg`,
            `${basePath}porto_dos_milagres3.jpg`
        ],
        'Passarte': [
            `${basePath}passarte1.jpg`,
            `${basePath}passarte2.jpg`,
            `${basePath}passarte3.jpg`
        ],
        'Pousada da Praça': [
            `${basePath}pousada_da_praca1.jpg`,
            `${basePath}pousada_da_praca2.jpg`,
            `${basePath}pousada_da_praca3.jpg`
        ],
        'Pousada Colibri': [
            `${basePath}pousada_colibri1.jpg`,
            `${basePath}pousada_colibri2.jpg`,
            `${basePath}pousada_colibri3.jpg`
        ],
        'Pousada Porto de Cima': [
            `${basePath}pousada_porto_de_cima1.jpg`,
            `${basePath}pousada_porto_de_cima2.jpg`,
            `${basePath}pousada_porto_de_cima3.jpg`
        ],
        'Vila Guaiamu': [
            `${basePath}vila_guaiamu1.jpg`,
            `${basePath}vila_guaiamu2.jpg`,
            `${basePath}vila_guaiamu3.jpg`
        ],
        'Villa dos Corais pousada': [
            `${basePath}villa_dos_corais1.jpg`,
            `${basePath}villa_dos_corais2.jpg`,
            `${basePath}villa_dos_corais3.jpg`
        ],
        'Hotel Anima': [
            `${basePath}hotel_anima1.jpg`,
            `${basePath}hotel_anima2.jpg`,
            `${basePath}hotel_anima3.jpg`
        ],
        'Vila dos Orixás Boutique Hotel & Spa': [
            `${basePath}vila_dos_orixas1.jpg`,
            `${basePath}vila_dos_orixas2.jpg`,
            `${basePath}vila_dos_orixas3.jpg`
        ],
        'Hotel Karapitangui': [
            `${basePath}hotel_karapitangui1.jpg`,
            `${basePath}hotel_karapitangui2.jpg`,
            `${basePath}hotel_karapitangui3.jpg`
        ],
        'Pousada Timbalada': [
            `${basePath}pousada_timbalada1.jpg`,
            `${basePath}pousada_timbalada2.jpg`,
            `${basePath}pousada_timbalada3.jpg`
        ],
        'Casa Celestino Residence': [
            `${basePath}casa_celestino_residence1.jpg`,
            `${basePath}casa_celestino_residence2.jpg`,
            `${basePath}casa_celestino_residence3.jpg`
        ],
        'Bahia Bacana Pousada': [
            `${basePath}bahia_bacana_pousada1.jpg`,
            `${basePath}bahia_bacana_pousada2.jpg`,
            `${basePath}bahia_bacana_pousada3.jpg`
        ],
        'Hotel Morro da Saudade': [
            `${basePath}hotel_morro_da_saudade1.jpg`,
            `${basePath}hotel_morro_da_saudade2.jpg`,
            `${basePath}hotel_morro_da_saudade3.jpg`
        ],
        'Bangalô dos sonhos': [
            `${basePath}bangalo_dos_sonhos1.jpg`,
            `${basePath}bangalo_dos_sonhos2.jpg`,
            `${basePath}bangalo_dos_sonhos3.jpg`
        ],
        'Cantinho da Josete': [
            `${basePath}cantinho_da_josete1.jpg`,
            `${basePath}cantinho_da_josete2.jpg`,
            `${basePath}cantinho_da_josete3.jpg`
        ],
        'Vila Morro do Sao Paulo': [
            `${basePath}vila_morro_sao_paulo1.jpg`,
            `${basePath}vila_morro_sao_paulo2.jpg`,
            `${basePath}vila_morro_sao_paulo3.jpg`
        ],
        'Casa Rossa': [
            `${basePath}casa_rossa1.jpg`,
            `${basePath}casa_rossa2.jpg`,
            `${basePath}casa_rossa3.jpg`
        ],
        'Village Paraíso Tropical': [
            `${basePath}village_paraiso_tropical1.jpg`,
            `${basePath}village_paraiso_tropical2.jpg`,
            `${basePath}village_paraiso_tropical3.jpg`
        ],
        'Absolute': [
            `${basePath}absolute1.jpg`,
            `${basePath}absolute2.jpg`,
            `${basePath}absolute3.jpg`
        ],
        'Local Brasil': [
            `${basePath}local_brasil1.jpg`,
            `${basePath}local_brasil2.jpg`,
            `${basePath}local_brasil3.jpg`
        ],
        'Super Zimbo': [
            `${basePath}super_zimbo1.jpg`,
            `${basePath}super_zimbo2.jpg`,
            `${basePath}super_zimbo3.jpg`
        ],
        'Mateus Esquadrais': [
            `${basePath}mateus_esquadrais1.jpg`,
            `${basePath}mateus_esquadrais2.jpg`,
            `${basePath}mateus_esquadrais3.jpg`
        ],
        'São Pedro Imobiliária': [
            `${basePath}sao_pedro_imobiliaria1.jpg`,
            `${basePath}sao_pedro_imobiliaria2.jpg`,
            `${basePath}sao_pedro_imobiliaria3.jpg`
        ],
        'Imóveis Brasil Bahia': [
            `${basePath}imoveis_brasil_bahia1.jpg`,
            `${basePath}imoveis_brasil_bahia2.jpg`,
            `${basePath}imoveis_brasil_bahia3.jpg`
        ],
        'Coruja': [
            `${basePath}coruja1.jpg`,
            `${basePath}coruja2.jpg`,
            `${basePath}coruja3.jpg`
        ],
        'Zimbo Dive': [
            `${basePath}zimbo_dive1.jpg`,
            `${basePath}zimbo_dive2.jpg`,
            `${basePath}zimbo_dive3.jpg`
        ],
        'Havaianas': [
            `${basePath}havaianas1.jpg`,
            `${basePath}havaianas2.jpg`,
            `${basePath}havaianas3.jpg`
        ],
        'Ambulância': [
            `${basePath}ambulancia1.jpg`,
            `${basePath}ambulancia2.jpg`,
            `${basePath}ambulancia3.jpg`
        ],
        'Unidade de Saúde': [
            `${basePath}unidade_de_saude1.jpg`,
            `${basePath}unidade_de_saude2.jpg`,
            `${basePath}unidade_de_saude3.jpg`
        ],
        'Polícia Civil': [
            `${basePath}policia_civil1.jpg`,
            `${basePath}policia_civil2.jpg`,
            `${basePath}policia_civil3.jpg`
        ],
        'Polícia Militar': [
            `${basePath}policia_militar1.jpg`,
            `${basePath}policia_militar2.jpg`,
            `${basePath}policia_militar3.jpg`
        ],
        'Melhores Pontos Turísticos': [
            `${basePath}melhores_pontos_turisticos1.jpg`,
            `${basePath}melhores_pontos_turisticos2.jpg`,
            `${basePath}melhores_pontos_turisticos3.jpg`
        ],
        'Melhores Passeios': [
            `${basePath}melhores_passeios1.jpg`,
            `${basePath}melhores_passeios2.jpg`,
            `${basePath}melhores_passeios3.jpg`
        ],
        'Melhores Praias': [
            `${basePath}melhores_praias1.jpg`,
            `${basePath}melhores_praias2.jpg`,
            `${basePath}melhores_praias3.jpg`
        ],
        'Melhores Restaurantes': [
            `${basePath}melhores_restaurantes1.jpg`,
            `${basePath}melhores_restaurantes2.jpg`,
            `${basePath}melhores_restaurantes3.jpg`
        ],
        'Melhores Pousadas': [
            `${basePath}melhores_pousadas1.jpg`,
            `${basePath}melhores_pousadas2.jpg`,
            `${basePath}melhores_pousadas3.jpg`
        ],
        'Melhores Lojas': [
            `${basePath}melhores_lojas1.jpg`,
            `${basePath}melhores_lojas2.jpg`,
            `${basePath}melhores_lojas3.jpg`
        ],
        'Missão': [
            `${basePath}missao1.jpg`,
            `${basePath}missao2.jpg`,
            `${basePath}missao3.jpg`
        ],
        'Serviços': [
            `${basePath}servicos1.jpg`,
            `${basePath}servicos2.jpg`,
            `${basePath}servicos3.jpg`
        ],
        'Benefícios para Turistas': [
            `${basePath}beneficios_turistas1.jpg`,
            `${basePath}beneficios_turistas2.jpg`,
            `${basePath}beneficios_turistas3.jpg`
        ],
        'Benefícios para Moradores': [
            `${basePath}beneficios_moradores1.jpg`,
            `${basePath}beneficios_moradores2.jpg`,
            `${basePath}beneficios_moradores3.jpg`
        ],
        'Benefícios para Pousadas': [
            `${basePath}beneficios_pousadas1.jpg`,
            `${basePath}beneficios_pousadas2.jpg`,
            `${basePath}beneficios_pousadas3.jpg`
        ],
        'Benefícios para Restaurantes': [
            `${basePath}beneficios_restaurantes1.jpg`,
            `${basePath}beneficios_restaurantes2.jpg`,
            `${basePath}beneficios_restaurantes3.jpg`
        ],
        'Benefícios para Agências de Turismo': [
            `${basePath}beneficios_agencias_turismo1.jpg`,
            `${basePath}beneficios_agencias_turismo2.jpg`,
            `${basePath}beneficios_agencias_turismo3.jpg`
        ],
        'Benefícios para Lojas e Comércios': [
            `${basePath}beneficios_lojas_comercios1.jpg`,
            `${basePath}beneficios_lojas_comercios2.jpg`,
            `${basePath}beneficios_lojas_comercios3.jpg`
        ],
        'Benefícios para Transportes': [
            `${basePath}beneficios_transportes1.jpg`,
            `${basePath}beneficios_transportes2.jpg`,
            `${basePath}beneficios_transportes3.jpg`
        ],
        'Impacto em MSP': [
            `${basePath}impacto_msp1.jpg`,
            `${basePath}impacto_msp2.jpg`,
            `${basePath}impacto_msp3.jpg`
        ],
        'Iniciar Tutorial': [
            `${basePath}iniciar_tutorial1.jpg`,
            `${basePath}iniciar_tutorial2.jpg`,
            `${basePath}iniciar_tutorial3.jpg`
        ],
        'Planejar Viagem com IA': [
            `${basePath}planejar_viagem_ia1.jpg`,
            `${basePath}planejar_viagem_ia2.jpg`,
            `${basePath}planejar_viagem_ia3.jpg`
        ],
        'Falar com IA': [
            `${basePath}falar_com_ia1.jpg`,
            `${basePath}falar_com_ia2.jpg`,
            `${basePath}falar_com_ia3.jpg`
        ],
        'Falar com Suporte': [
            `${basePath}falar_com_suporte1.jpg`,
            `${basePath}falar_com_suporte2.jpg`,
            `${basePath}falar_com_suporte3.jpg`
        ],
        'Configurações': [
            `${basePath}configuracoes1.jpg`,
            `${basePath}configuracoes2.jpg`,
            `${basePath}configuracoes3.jpg`
        ]
    };

    return imageDatabase[locationName] || [];
}

// Função para abrir a página do destino
function openDestinationWebsite(url) {
    window.open(url, '_blank');
}

// Função para obter URLs para um determinado destino
function getUrlsForLocation(locationName) {
    const urlDatabase = {
        // Festas
        'Toca do Morcego': 'https://www.tocadomorcego.com.br/',
        'Pulsar': 'http://example.com/pulsar',
        'Mama Iate': 'http://example.com/mama_iate',
        'Teatro do Morro': 'http://example.com/teatro_do_morro',
        // Passeios
        'Passeio de lancha Volta a Ilha de Tinharé': 'https://passeiosmorro.com.br/passeio-volta-a-ilha',
        'Passeio de Quadriciclo para Garapuá': 'https://passeiosmorro.com.br/passeio-de-quadriciclo',
        'Passeio 4X4 para Garapuá': 'https://passeiosmorro.com.br/passeio-de-4x4',
        'Passeio de Barco para Gamboa': 'https://passeiosmorro.com.br/passeio-de-barco',
        // Restaurantes
        'Morena Bela': 'http://example.com/morena_bela',
        'Basílico': 'http://example.com/basilico',
        'Ki Massa': 'http://example.com/ki_massa',
        'Tempeiro Caseiro': 'http://example.com/tempeiro_caseiro',
        'Bizu': 'http://example.com/bizu',
        'Pedra Sobre Pedra': 'http://example.com/pedra_sobre_pedra',
        'Forno a Lenha de Mercedes': 'http://example.com/forno_a_lenha',
        'Ponto G': 'http://example.com/ponto_g',
        'Ponto 9,99': 'http://example.com/ponto_999',
        'Patricia': 'http://example.com/patricia',
        'dizi 10': 'http://example.com/dizi_10',
        'Papoula': 'http://example.com/papoula',
        'Sabor da terra': 'http://example.com/sabor_da_terra',
        'Branco&Negro': 'http://example.com/branco_negro',
        'Six Club': 'http://example.com/six_club',
        'Santa Villa': 'http://example.com/santa_villa',
        'Recanto do Aviador': 'http://example.com/recanto_do_aviador',
        'Sambass': 'https://www.sambass.com.br/',
        'Bar e Restaurante da Morena': 'http://example.com/bar_restaurante_morena',
        'Restaurante Alecrim': 'http://example.com/restaurante_alecrim',
        'Andina Cozinha Latina': 'http://example.com/andina_cozinha_latina',
        'Papoula Culinária Artesanal': 'http://example.com/papoula_culinaria_artesanal',
        'Minha Louca Paixão': 'https://www.minhaloucapaixao.com.br/',
        'Café das Artes': 'http://example.com/cafe_das_artes',
        'Canoa': 'http://example.com/canoa',
        'Restaurante do Francisco': 'http://example.com/restaurante_francisco',
        'La Tabla': 'http://example.com/la_tabla',
        'Santa Luzia': 'http://example.com/santa_luzia',
        'Chez Max': 'http://example.com/chez_max',
        'Barraca da Miriam': 'http://example.com/barraca_miriam',
        'O Casarão restaurante': 'http://example.com/casarao_restaurante',
        // Pousadas
        'Hotel Fazenda Parque Vila': 'http://example.com/hotel_fazenda_parque_vila',
        'Guaiamu': 'http://example.com/guaiamu',
        'Pousada Fazenda Caeiras': 'https://pousadacaeira.com.br/',
        'Amendoeira Hotel': 'http://example.com/amendoeira_hotel',
        'Pousada Natureza': 'http://example.com/pousada_natureza',
        'Pousada dos Pássaros': 'http://example.com/pousada_dos_passaros',
        'Hotel Morro de São Paulo': 'http://example.com/hotel_morro_sao_paulo',
        'Uma Janela para o Sol': 'http://example.com/uma_janela_para_sol',
        'Portaló': 'http://example.com/portalo',
        'Pérola do Morro': 'http://example.com/perola_do_morro',
        'Safira do Morro': 'http://example.com/safira_do_morro',
        'Xerife Hotel': 'http://example.com/xerife_hotel',
        'Ilha da Saudade': 'http://example.com/ilha_da_saudade',
        'Porto dos Milagres': 'http://example.com/porto_dos_milagres',
        'Passarte': 'http://example.com/passarte',
        'Pousada da Praça': 'http://example.com/pousada_da_praca',
        'Pousada Colibri': 'http://example.com/pousada_colibri',
        'Pousada Porto de Cima': 'http://example.com/pousada_porto_de_cima',
        'Vila Guaiamu': 'http://example.com/vila_guaiamu',
        'Villa dos Corais pousada': 'http://example.com/villa_dos_corais',
        'Hotel Anima': 'http://example.com/hotel_anima',
        'Vila dos Orixás Boutique Hotel & Spa': 'http://example.com/vila_dos_orixas',
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
        'Absolute': 'http://example.com/absolute',
        'Local Brasil': 'http://example.com/local_brasil',
        'Super Zimbo': 'http://example.com/super_zimbo',
        'Mateus Esquadrais': 'http://example.com/mateus_esquadrais',
        'São Pedro Imobiliária': 'http://example.com/sao_pedro_imobiliaria',
        'Imóveis Brasil Bahia': 'http://example.com/imoveis_brasil_bahia',
        'Coruja': 'http://example.com/coruja',
        'Zimbo Dive': 'http://example.com/zimbo_dive',
        'Havaianas': 'http://example.com/havaianas',
        // Emergências
        'Ambulância': 'http://example.com/ambulancia',
        'Unidade de Saúde': 'http://example.com/unidade_de_saude',
        'Polícia Civil': 'http://example.com/policia_civil',
        'Polícia Militar': 'http://example.com/policia_militar',
    };

    return urlDatabase[locationName] || null;
}

function getAvailableActivities(itineraryData) {
    const allActivities = {
        touristSpots: [
            { name: 'Toca do Morcego', price: 40 },
            { name: 'Farol do Morro', price: 0 },
            { name: 'Mirante da Tirolesa', price: 20 },
            { name: 'Fortaleza de Morro de São Paulo', price: 0 },
            { name: 'Paredão da Argila', price: 0 }
        ],
        beaches: [
            { name: 'Primeira Praia', price: 0 },
            { name: 'Praia de Garapuá', price: 0 },
            { name: 'Praia do Pôrto', price: 0 },
            { name: 'Praia da Gamboa', price: 0 },
            { name: 'Segunda Praia', price: 50 },
            { name: 'Terceira Praia', price: 0 },
            { name: 'Quarta Praia', price: 0 },
            { name: 'Praia do Encanto', price: 0 }
        ],
        tours: [
            { name: 'Passeio de lancha Volta a Ilha de Tinharé', price: 250 },
            { name: 'Passeio de Quadriciclo para Garapuá', price: 500 },
            { name: 'Passeio 4X4 para Garapuá', price: 130 },
            { name: 'Passeio de Barco para Gamboa', price: 80 }
        ],
        parties: [
            { name: 'Festa Sextou na Toca', price: 80 }
        ]
    };

    return {
        touristSpots: allActivities.touristSpots.filter(spot => !itineraryData.visitedTouristSpots.includes(spot.name)),
        beaches: allActivities.beaches.filter(beach => !itineraryData.visitedBeaches.includes(beach.name)),
        tours: allActivities.tours.filter(tour => !itineraryData.completedTours.includes(tour.name)),
        parties: allActivities.parties
    };
}

function createDailyItinerary(availableActivities, daysAvailable) {
    const itinerary = [];
    const activitiesPerDay = Math.ceil(Object.values(availableActivities).flat().length / daysAvailable);

    for (let day = 1; day <= daysAvailable; day++) {
        const dailyActivities = [];

        if (availableActivities.touristSpots.length) {
            dailyActivities.push(availableActivities.touristSpots.shift());
        }

        if (availableActivities.beaches.length) {
            dailyActivities.push(availableActivities.beaches.shift());
        }

        if (availableActivities.tours.length) {
            dailyActivities.push(availableActivities.tours.shift());
        }

        if (availableActivities.parties.length && day === daysAvailable) {
            dailyActivities.push(availableActivities.parties.shift());
        }

        itinerary.push({ day, activities: dailyActivities });
    }

    return itinerary;
}

function renderItinerary(itinerary) {
    let itineraryHTML = '<div class="itinerary-tabs">';

    itinerary.forEach(dayPlan => {
        itineraryHTML += `<div class="itinerary-tab" id="day-${dayPlan.day}">
            <h3>Dia ${dayPlan.day}</h3>
            <ul>`;
        
        dayPlan.activities.forEach(activity => {
            itineraryHTML += `<li>${activity.name} - R$ ${activity.price}</li>`;
        });

        itineraryHTML += '</ul></div>';
    });

    itineraryHTML += '</div>';
    return itineraryHTML;
}

function updateProgress(route, userLat, userLon) {
    const totalDistance = route.summary.totalDistance; // Distância total da rota
    const remainingDistance = calculateDistance(userLat, userLon, route.waypoints[1].latLng.lat, route.waypoints[1].latLng.lng);

    const progressPercentage = ((totalDistance - remainingDistance) / totalDistance) * 100;

    console.log(`Progresso: ${progressPercentage.toFixed(2)}%`);
    document.getElementById('progress-bar').style.width = `${progressPercentage}%`;
}


function closeSideMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = 'none';
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    restoreModalAndControlsStyles();
    currentSubMenu = null;
}

function searchLocation() {
    const apiKey = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';

    const queries = {
        'restaurantes': '[out:json];node["amenity"="restaurant"](around:15000,-13.376,-38.913);out body;',
        'pousadas': '[out:json];node["tourism"="hotel"](around:15000,-13.376,-38.913);out body;',
        'lojas': '[out:json];node["shop"](around:15000,-13.376,-38.913);out body;',
        'praias': '[out:json];node["natural"="beach"](around:15000,-13.376,-38.913);out body;',
        'pontos turísticos': '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
        'passeios': '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
        'festas': '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
        'bares': '[out:json];node["amenity"="bar"](around:10000,-13.376,-38.913);out body;',
        'cafés': '[out:json];node["amenity"="cafe"](around:10000,-13.376,-38.913);out body;',
        'hospitais': '[out:json];node["amenity"="hospital"](around:10000,-13.376,-38.913);out body;',
        'farmácias': '[out:json];node["amenity"="pharmacy"](around:10000,-13.376,-38.913);out body;',
        'parques': '[out:json];node["leisure"="park"](around:10000,-13.376,-38.913);out body;',
        'postos de gasolina': '[out:json];node["amenity"="fuel"](around:10000,-13.376,-38.913);out body;',
        'banheiros públicos': '[out:json];node["amenity"="toilets"](around:10000,-13.376,-38.913);out body;',
        'caixas eletrônicos': '[out:json];node["amenity"="atm"](around:10000,-13.376,-38.913);out body;',
        'emergências': '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
        'dicas': '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
        'sobre': '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
        'educação': '[out:json];node["education"](around:10000,-13.376,-38.913);out body;'
    };

    const synonyms = {
        'restaurantes': ['restaurantes', 'restaurante', 'comida', 'alimentação', 'refeições', 'culinária', 'jantar', 'almoço', 'lanche', 'bistrô', 'churrascaria', 'lanchonete', 'restarante', 'restaurnte', 'restaurente', 'restaurantr', 'restaurnate', 'restauranta'],
        'pousadas': ['pousadas', 'pousada', 'hotéis', 'hotel', 'hospedagem', 'alojamento', 'hostel', 'residência', 'motel', 'resort', 'abrigo', 'estadia', 'albergue', 'pensão', 'inn', 'guesthouse', 'bed and breakfast', 'bnb', 'pousasa', 'pousda', 'pousda', 'pousdada'],
        'lojas': ['lojas', 'loja', 'comércio', 'shopping', 'mercado', 'boutique', 'armazém', 'supermercado', 'minimercado', 'quiosque', 'feira', 'bazaar', 'loj', 'lojs', 'lojinha', 'lojinhas', 'lojz', 'lojax'],
        'praias': ['praias', 'praia', 'litoral', 'costa', 'faixa de areia', 'beira-mar', 'orla', 'prais', 'praia', 'prai', 'preia', 'preias'],
        'pontos turísticos': ['pontos turísticos', 'turismo', 'atrações', 'sítios', 'marcos históricos', 'monumentos', 'locais históricos', 'museus', 'galerias', 'exposições', 'ponto turístico', 'ponto turístco', 'ponto turisico', 'pontus turisticus', 'pont turistic'],
        'passeios': ['passeios', 'excursões', 'tours', 'visitas', 'caminhadas', 'aventuras', 'trilhas', 'explorações', 'paseios', 'paseio', 'pasceios', 'paseio', 'paseis'],
        'festas': ['festas', 'festa', 'baladas', 'balada', 'vida noturna', 'discotecas', 'clubes noturnos', 'boate', 'clube', 'fest', 'festass', 'baladas', 'balad', 'baldas', 'festinh', 'festona', 'festinha', 'fesat', 'fetsas'],
        'bares': ['bares', 'bar', 'botecos', 'pubs', 'tabernas', 'cervejarias', 'choperias', 'barzinho', 'drinks', 'bar', 'bares', 'brs', 'barzinhos', 'barzinho', 'baress'],
        'cafés': ['cafés', 'café', 'cafeterias', 'bistrôs', 'casas de chá', 'confeitarias', 'docerias', 'cafe', 'caf', 'cafeta', 'cafett', 'cafetta', 'cafeti'],
        'hospitais': ['hospitais', 'hospital', 'saúde', 'clínicas', 'emergências', 'prontos-socorros', 'postos de saúde', 'centros médicos', 'hspital', 'hopital', 'hospial', 'hspitais', 'hsopitais', 'hospitalar', 'hospitai'],
        'farmácias': ['farmácias', 'farmácia', 'drogarias', 'apotecas', 'lojas de medicamentos', 'farmacia', 'fármacia', 'farmásia', 'farmci', 'farmcias', 'farmac', 'farmaci'],
        'parques': ['parques', 'parque', 'jardins', 'praças', 'áreas verdes', 'reserva natural', 'bosques', 'parques urbanos', 'parqe', 'parq', 'parcs', 'paques', 'park', 'parks', 'parqu'],
        'postos de gasolina': ['postos de gasolina', 'posto de gasolina', 'combustível', 'gasolina', 'abastecimento', 'serviços automotivos', 'postos de combustível', 'posto de combustivel', 'pstos de gasolina', 'post de gasolina', 'pstos', 'pstos de combustivel', 'pstos de gas'],
        'banheiros públicos': ['banheiros públicos', 'banheiro público', 'toaletes', 'sanitários', 'banheiros', 'WC', 'lavabos', 'toilets', 'banheiro publico', 'banhero público', 'banhero publico', 'banhero', 'banheir'],
        'caixas eletrônicos': ['caixas eletrônicos', 'caixa eletrônico', 'atm', 'banco', 'caixa', 'terminal bancário', 'caixa automático', 'saque', 'caixa eletronico', 'caxas eletronicas', 'caxa eletronica', 'caxas', 'caias eletronico', 'caias'],
        'emergências': ['emergências', 'emergência', 'polícia', 'hospital', 'serviços de emergência', 'socorro', 'urgências', 'emergencia', 'emergncia', 'emergancia', 'emergenci', 'emergencis', 'emrgencia', 'emrgencias'],
        'dicas': ['dicas', 'dica', 'conselhos', 'sugestões', 'recomendações', 'dics', 'dcias', 'dicas', 'dicaz', 'dicaa', 'dicassa'],
        'sobre': ['sobre', 'informações', 'detalhes', 'a respeito', 'informação', 'sbre', 'sore', 'sob', 'sobr', 'sobe'],
        'educação': ['educação', 'educacao', 'escolas', 'faculdades', 'universidades', 'instituições de ensino', 'cursos', 'aulas', 'treinamentos', 'aprendizagem', 'educaçao', 'educacão', 'eduacão', 'eduacao', 'educaç', 'educaç', 'educça']
    };

    var searchQuery = prompt("Digite o local que deseja buscar em Morro de São Paulo:");
    if (searchQuery) {
        const viewBox = '-38.926, -13.369, -38.895, -13.392';
        let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewBox}&bounded=1&key=${apiKey}`;
        
        fetch(nominatimUrl)
            .then(response => response.json())
            .then(data => {
                console.log("Data from Nominatim:", data);
                if (data && data.length > 0) {
                    const filteredData = data.filter(location => {
                        const lat = parseFloat(location.lat);
                        const lon = parseFloat(location.lon);
                        return lon >= -38.926 && lon <= -38.895 && lat >= -13.392 && lat <= -13.369;
                    });

                    console.log("Filtered data:", filteredData);

                    if (filteredData.length > 0) {
                        var firstResult = filteredData[0];
                        var lat = firstResult.lat;
                        var lon = firstResult.lon;

                        // Remove o marcador atual, se existir
                        if (currentMarker) {
                            map.removeLayer(currentMarker);
                        }

                        // Remove todos os marcadores antigos
                        markers.forEach(marker => map.removeLayer(marker));
                        markers = [];

                        // Adiciona um novo marcador para o resultado da pesquisa
                        currentMarker = L.marker([lat, lon]).addTo(map).bindPopup(firstResult.display_name).openPopup();
                        map.setView([lat, lon], 14);

                        // Determina o tipo de ponto de interesse a ser buscado
                        let queryKey = null;
                        searchQuery = searchQuery.toLowerCase();
                        for (const [key, value] of Object.entries(synonyms)) {
                            if (value.includes(searchQuery)) {
                                queryKey = key;
                                break;
                            }
                        }

                        console.log("Query key:", queryKey);

                        if (queryKey && queries[queryKey]) {
                            const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(queries[queryKey])}`;
                            fetch(overpassUrl)
                                .then(response => response.json())
                                .then(osmData => {
                                    console.log("Data from Overpass:", osmData);
                                    if (osmData && osmData.elements && osmData.elements.length > 0) {
                                        osmData.elements.forEach(element => {
                                            const name = element.tags.name || 'Sem nome';
                                            const description = element.tags.description || element.tags.amenity || element.tags.tourism || element.tags.natural || '';
                                            const marker = L.marker([element.lat, element.lon]).addTo(map)
                                                .bindPopup(`<b>${name}</b><br>${description}`).openPopup();
                                            markers.push(marker);
                                        });
                                    } else {
                                        alert(`Nenhum(a) ${searchQuery} encontrado(a) num raio de 1.5km.`);
                                    }
                                })
                                .catch(error => {
                                    console.error("Erro ao buscar dados do Overpass:", error);
                                    alert("Ocorreu um erro ao buscar pontos de interesse.");
                                });
                        } else {
                            alert(`Busca por "${searchQuery}" não é suportada. Tente buscar por restaurantes, pousadas, lojas, praias, ou outros pontos de interesse.`);
                        }
                    } else {
                        alert("Local não encontrado em Morro de São Paulo.");
                    }
                } else {
                    alert("Local não encontrado.");
                }
            })
            .catch(error => {
                console.error("Erro na busca:", error);
                alert("Ocorreu um erro na busca.");
            });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const queryParams = {
        bbox: {
            north: -13.3614,
            south: -13.3947,
            east: -38.8974,
            west: -38.9191
        },
        types: [
            { key: 'tourism', value: 'attraction' },
            { key: 'tourism', value: 'museum' },
            { key: 'tourism', value: 'viewpoint' },
            { key: 'amenity', value: 'restaurant' },
            { key: 'amenity', value: 'cafe' },
            { key: 'amenity', value: 'bar' },
            { key: 'amenity', value: 'pub' },
            { key: 'amenity', value: 'fast_food' },
            { key: 'amenity', value: 'hospital' },
            { key: 'amenity', value: 'police' },
            { key: 'amenity', value: 'pharmacy' },
            { key: 'natural', value: 'beach' },
            { key: 'leisure', value: 'park' },
            { key: 'leisure', value: 'garden' },
            { key: 'leisure', value: 'playground' },
            { key: 'historic', value: 'castle' },
            { key: 'historic', value: 'monument' },
            { key: 'historic', value: 'ruins' },
            { key: 'historic', value: 'memorial' },
            { key: 'shop', value: 'supermarket' },
            { key: 'shop', value: 'bakery' },
            { key: 'shop', value: 'clothes' },
            { key: 'shop', value: 'gift' },
            { key: 'shop', value: 'convenience' }
        ],
        radius: 15000
    };

    const results = await searchOSM(queryParams);
    console.log('Resultados da busca:', results);
});


function customizeOSMPopup(popup) {
    const popupContent = popup.getElement().querySelector('.leaflet-popup-content');
    popupContent.style.fontSize = '12px';
    popupContent.style.maxWidth = '200px'; 

    const popupWrapper = popup.getElement().querySelector('.leaflet-popup-content-wrapper');
    popupWrapper.style.padding = '10px';

    const popupTipContainer = popup.getElement().querySelector('.leaflet-popup-tip-container');
    popupTipContainer.style.width = '20px';
    popupTipContainer.style.height = '10px';

    const saibaMaisBtn = document.getElementById('saiba-mais');
    const comoChegarBtn = document.getElementById('como-chegar');
    if (saibaMaisBtn) {
        saibaMaisBtn.style.fontSize = '12px';
        saibaMaisBtn.style.padding = '5px 10px';
    }
    if (comoChegarBtn) {
        comoChegarBtn.style.fontSize = '12px';
        comoChegarBtn.style.padding = '5px 10px';
    }
}

L.marker([lat, lon]).addTo(map)
    .bindPopup(`<b>${name}</b><br>${description}`)
    .on('popupopen', function (e) {
        customizeOSMPopup(e.popup);
    });

function collectInterestData() {
    console.log('Collecting interest data to create a custom route...');
}


// Refactored function to handle reservations
function handleReservation(buttonId, url) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }
}

// Initialize reservations
handleReservation('reserve-chairs-btn', 'url-to-destination');
handleReservation('reserve-inns-btn', 'url-to-destination');
handleReservation('reserve-restaurants-btn', 'url-to-destination');
