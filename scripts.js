// Correções no scripts.js
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadResources();
    loadLanguage();
    activateAssistant();
    setupEventListeners();
});

let currentSubMenu = null;
let currentLocation = null;
let selectedLanguage = localStorage.getItem('preferredLanguage') || 'pt';

function setupEventListeners() {
    const modal = document.getElementById('assistant-modal');
    const closeModal = document.querySelector('.close-btn');
    const menuToggle = document.getElementById('menu-btn');
    const floatingMenu = document.getElementById('floating-menu');

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    menuToggle.addEventListener('click', () => {
        floatingMenu.classList.toggle('hidden');
    });

    document.querySelector('.menu-btn.zoom-in').addEventListener('click', () => map.zoomIn());
    document.querySelector('.menu-btn.zoom-out').addEventListener('click', () => map.zoomOut());
    document.querySelector('.menu-btn.locate-user').addEventListener('click', requestLocationPermission);

    document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
        btn.addEventListener('click', () => handleFeatureSelection(btn.getAttribute('data-feature')));
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
    });
}

function initializeMap() {
    map = L.map('map', {
        zoomControl: false 
    }).setView([-13.376, -38.913], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function loadResources() {
    console.log('Recursos carregados.');
}

function loadLanguage() {
    const language = localStorage.getItem('preferredLanguage') || 'pt';
    translatePage(language);
    console.log(`Idioma carregado: ${language}`);
}

function translatePage(language) {
    document.querySelectorAll('[data-translate]').forEach(el => {
        el.innerText = translations[language][el.getAttribute('data-translate')] || el.innerText;
    });
}

function activateAssistant() {
    showWelcomeMessage();
    requestLanguageSelection();
}

function showWelcomeMessage() {
    const modal = document.getElementById('welcome-modal');
    modal.style.display = 'block';
}

function requestLanguageSelection() {
    const modalContent = document.querySelector('#welcome-modal .modal-content');
    modalContent.innerHTML = `
        <h2>${translations[selectedLanguage].selectLanguage}</h2>
        <div class="language-selection">
            <button class="lang-btn" data-lang="pt"><img src="images/brazil.png" alt="Brasil"></button>
            <button class="lang-btn" data-lang="es"><img src="images/spain.png" alt="Espanha"></button>
            <button class="lang-btn" data-lang="en"><img src="images/usa.png" alt="Estados Unidos"></button>
            <button class="lang-btn" data-lang="he"><img src="images/israel.png" alt="Israel"></button>
        </div>
        <label>
            <input type="checkbox" id="dont-show-again"> Não mostrar novamente
        </label>
    `;
}

function setLanguage(language) {
    localStorage.setItem('preferredLanguage', language);
    selectedLanguage = language;
    loadLanguage();
    document.getElementById('welcome-modal').style.display = 'none';
    startTutorial();
}

function requestLocationPermission() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            adjustMapWithLocation(currentLocation.latitude, currentLocation.longitude);
            L.popup()
                .setLatLng([currentLocation.latitude, currentLocation.longitude])
                .setContent(translations[selectedLanguage].youAreHere)
                .openOn(map);
        }, () => {
            console.log(translations[selectedLanguage].locationPermissionDenied);
        });
    } else {
        console.log(translations[selectedLanguage].geolocationNotSupported);
    }
}

function adjustMapWithLocation(lat, lon) {
    map.setView([lat, lon], 13);
}

function handleFeatureSelection(feature) {
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
        'sobre': 'about-submenu'
    };

    const subMenuId = featureMappings[feature];

    document.querySelectorAll('#menu .submenu').forEach(subMenu => {
        subMenu.style.display = 'none';
    });

    if (currentSubMenu === subMenuId) {
        document.getElementById('menu').style.display = 'none';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        currentSubMenu = null;
    } else {
        loadSubMenu(subMenuId);
        document.getElementById('menu').style.display = 'block';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.add('inactive'));
        document.querySelector(`.menu-btn[data-feature="${feature}"]`).classList.remove('inactive');
        document.querySelector(`.menu-btn[data-feature="${feature}"]`).classList.add('active');
        currentSubMenu = subMenuId;
    }
}

function loadSubMenu(subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.style.display = 'block';

    const queries = {
        'touristSpots-submenu': '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
        'tours-submenu': '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
        'beaches-submenu': '[out:json];node["natural"="beach"](around:10000,-13.376,-38.913);out body;',
        'nightlife-submenu': '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
        'restaurants-submenu': '[out:json];node["amenity"="restaurant"](around:10000,-13.376,-38.913);out body;',
        'inns-submenu': '[out:json];node["tourism"="hotel"](around:10000,-13.376,-38.913);out body;',
        'shops-submenu': '[out:json];node["shop"](around:10000,-13.376,-38.913);out body;'
    };

    fetchOSMData(queries[subMenuId]).then(data => displayOSMData(data, subMenuId));
}

async function fetchOSMData(query) {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(translations[selectedLanguage].osmFetchError, error);
    }
}

function displayOSMData(data, subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = ''; 
    data.elements.forEach(element => {
        if (element.type === 'node' && element.tags.name) {
            const btn = document.createElement('button');
            btn.className = 'submenu-item';
            btn.textContent = element.tags.name;
            btn.onclick = () => showInfo(element.tags.name, [element.lat, element.lon], element.id);
            subMenu.appendChild(btn);
        }
    });
}

function showInfo(name, coordinates, osmId) {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'none';

    const info = `${translations[selectedLanguage].detailedInfo} ${name}`;
    messageBox.innerHTML = `<p>${info}</p>`;

    if (coordinates) {
        showRoute(coordinates);
    }

    showInfoModal(name, coordinates, osmId);
}

function showInfoModal(name, coordinates, osmId) {
    const infoModal = document.getElementById('info-modal');
    const modalContent = infoModal.querySelector('.modal-content');

    modalContent.innerHTML = `
        <h2>${name}</h2>
        <p>${translations[selectedLanguage][name.toLowerCase().replace(/\s+/g, '')] || `${translations[selectedLanguage].detailedInfo} ${name}`}</p>
        <p><strong>${translations[selectedLanguage].createRoutePrompt}</strong></p>
        <button id="highlight-create-route-btn" onclick="createRouteTo(${coordinates[0]}, ${coordinates[1]})">${translations[selectedLanguage].createRoute}</button>
    `;

    const createRouteBtn = modalContent.querySelector('#highlight-create-route-btn');
    createRouteBtn.style.border = '2px solid red';
    createRouteBtn.style.padding = '10px';
    createRouteBtn.style.backgroundColor = 'white';
    createRouteBtn.style.color = 'red';

    infoModal.style.display = 'block';
}

function createRouteTo(lat, lon) {
    const apiKey = 'SPpJlh8xSR-sOCuXeGrXPSpjGK03T4J-qVLw9twXy7s';
    if (!currentLocation) {
        console.log(translations[selectedLanguage].locationNotAvailable);
        return;
    }

    fetch(`https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${currentLocation.longitude},${currentLocation.latitude}&end=${lon},${lat}`)
        .then(response => response.json())
        .then(data => {
            const coords = data.features[0].geometry.coordinates;
            const latlngs = coords.map(coord => [coord[1], coord[0]]);
            L.polyline(latlngs, {color: 'blue'}).addTo(map);
            map.fitBounds(L.polyline(latlngs).getBounds());
        })
        .catch(error => {
            console.error(translations[selectedLanguage].routeCreationError, error);
        });
}

function showItineraryForm() {
    const formModal = document.getElementById('itinerary-form-modal');
    formModal.style.display = 'block';
}

function saveEditedItinerary() {
    const name = document.querySelector('input[name="name"]').value;
    const description = document.querySelector('textarea[name="description"]').value;
    console.log(translations[selectedLanguage].itinerarySaved, { name, description });
    closeModal('itinerary-form-modal');
}

function suggestGuidedTour() {
    console.log(translations[selectedLanguage].suggestGuidedTour);
}

function startGuidedTour() {
    console.log(translations[selectedLanguage].startGuidedTour);
}

function showPointOfInterestInfo(point) {
    console.log(translations[selectedLanguage].showPointOfInterestInfo, point);
}

function conductSatisfactionSurvey() {
    const surveyModal = document.getElementById('survey-modal');
    surveyModal.style.display = 'block';
}

function requestActivityParticipation() {
    console.log(translations[selectedLanguage].requestActivityParticipation);
}

function requestFeedback() {
    const feedbackModal = document.getElementById('feedback-modal');
    feedbackModal.style.display = 'block';
}

function submitFeedback() {
    const feedback = document.querySelector('textarea[name="feedback"]').value;
    console.log(translations[selectedLanguage].submitFeedback, feedback);
    fetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ feedback }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
      .then(data => {
        console.log(translations[selectedLanguage].feedbackSent, data);
        const feedbackModal = document.getElementById('feedback-modal');
        feedbackModal.style.display = 'none';
      });
}

function shareOnSocialMedia(platform) {
    var url = window.location.href;
    var shareUrl;

    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        default:
            return;
    }

    window.open(shareUrl, '_blank');
}

function provideContinuousAssistance() {
    console.log(translations[selectedLanguage].provideContinuousAssistance);
}

function answerQuestions(question) {
    console.log(translations[selectedLanguage].answerQuestions, question);
}

function addMarkersToMap(locations) {
    locations.forEach(location => {
        L.marker([location.lat, location.lon]).addTo(map)
            .bindPopup(`<b>${location.name}</b><br>${location.description}`);
    });
}

function updateMapView(lat, lon, zoom) {
    map.setView([lat, lon], zoom);
}

function showInfoModal(title, content) {
    var infoModal = document.getElementById('info-modal');
    infoModal.querySelector('.modal-title').innerText = title;
    infoModal.querySelector('.modal-content').innerHTML = content;
    infoModal.style.display = 'block';
}

// Função para atualizar o conteúdo do modal do assistente
function updateAssistantModalContent(content) {
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    modalContent.innerHTML = content;
    document.getElementById('assistant-modal').style.display = 'block';
}

// Funções do Tutorial
const tutorialSteps = [
    {
        element: null,
        message: {
            pt: "Olá! Eu sou seu assistente virtual. Vou te ajudar a explorar todas as funcionalidades deste site. Vamos começar!",
            en: "Hello! I am your virtual assistant. I will help you explore all the features of this site. Let's start!",
            es: "¡Hola! Soy tu asistente virtual. Te ayudaré a explorar todas las funcionalidades de este sitio. ¡Vamos a empezar!",
            he: "שלום! אני העוזר הווירטואלי שלך. אני אעזור לך לחקור את כל הפונקציות של האתר הזה. בואו נתחיל!"
        }
    },
    {
        element: null,
        message: {
            pt: "Primeiro, precisamos da sua permissão para acessar sua localização atual. Isso nos ajudará a fornecer informações relevantes e personalizadas.",
            en: "First, we need your permission to access your current location. This will help us provide relevant and personalized information.",
            es: "Primero, necesitamos tu permiso para acceder a tu ubicación actual. Esto nos ayudará a proporcionar información relevante y personalizada.",
            he: "ראשית, אנו זקוקים לאישור שלך לגשת למיקום הנוכחי שלך. זה יעזור לנו לספק מידע רלוונטי ומותאם אישית."
        }
    },
    {
        element: '#map',
        message: {
            pt: "Este é o mapa. Aqui você pode ver e explorar os pontos turísticos, praias, restaurantes e muito mais.",
            en: "This is the map. Here you can see and explore tourist spots, beaches, restaurants, and more.",
            es: "Este es el mapa. Aquí puedes ver y explorar los puntos turísticos, playas, restaurantes y más.",
            he: "זו המפה. כאן תוכלו לראות ולחקור אתרי תיירות, חופים, מסעדות ועוד."
        }
    },
    {
        element: '#menu-toggle',
        message: {
            pt: "Este é o botão para abrir o menu flutuante. Clique nele para explorar as funcionalidades do site.",
            en: "This is the button to open the floating menu. Click it to explore the site's features.",
            es: "Este es el botón para abrir el menú flotante. Haz clic en él para explorar las funcionalidades del sitio.",
            he: "זהו הכפתור לפתיחת התפריט הצף. לחץ עליו כדי לחקור את הפונקציות של האתר."
        }
    },
    {
        element: '.menu-btn[data-feature="pontos-turisticos"]',
        message: {
            pt: "Clique neste ícone para ver os pontos turísticos de Morro de São Paulo.",
            en: "Click this icon to see the tourist spots of Morro de São Paulo.",
            es: "Haz clic en este icono para ver los puntos turísticos de Morro de São Paulo.",
            he: "לחץ על סמל זה כדי לראות את נקודות התיירות של מורו דה סאו פאולו."
        }
    },
    {
        element: '.menu-btn[data-feature="passeios"]',
        message: {
            pt: "Clique neste ícone para ver os passeios disponíveis.",
            en: "Click this icon to see the available tours.",
            es: "Haz clic en este icono para ver los tours disponibles.",
            he: "לחץ על סמל זה כדי לראות את הסיורים הזמינים."
        }
    },
    {
        element: '.menu-btn[data-feature="praias"]',
        message: {
            pt: "Clique neste ícone para ver as praias de Morro de São Paulo.",
            en: "Click this icon to see the beaches of Morro de São Paulo.",
            es: "Haz clic en este icono para ver las playas de Morro de São Paulo.",
            he: "לחץ על סמל זה כדי לראות את החופים של מורו דה סאו פאולו."
        }
    },
    {
        element: '.menu-btn[data-feature="restaurantes"]',
        message: {
            pt: "Clique neste ícone para ver os restaurantes da região.",
            en: "Click this icon to see the restaurants in the area.",
            es: "Haz clic en este icono para ver los restaurantes de la región.",
            he: "לחץ על סמל זה כדי לראות את המסעדות באזור."
        }
    },
    {
        element: '#create-route-btn',
        message: {
            pt: "Use este botão para criar uma rota até o local selecionado.",
            en: "Use this button to create a route to the selected location.",
            es: "Usa este botón para crear una ruta al lugar seleccionado.",
            he: "השתמש בכפתור זה כדי ליצור מסלול למיקום הנבחר."
        }
    },
    {
        element: '#feedback-toggle-btn',
        message: {
            pt: "Clique aqui para enviar feedback sobre sua experiência no site.",
            en: "Click here to submit feedback about your experience on the site.",
            es: "Haz clic aquí para enviar comentarios sobre tu experiencia en el sitio.",
            he: "לחץ כאן כדי לשלוח משוב על החוויה שלך באתר."
        }
    }
];

let currentStep = 0;

function showTutorialStep(step) {
    const { element, message } = tutorialSteps[step];
    const targetElement = element ? document.querySelector(element) : null;

    updateAssistantModalContent(`<p>${message[selectedLanguage]}</p>`);

    const previousOverlays = document.querySelectorAll('.highlight-overlay');
    previousOverlays.forEach(overlay => overlay.remove());

    if (element) {
        const rect = targetElement.getBoundingClientRect();
        const highlightOverlay = document.createElement('div');
        highlightOverlay.className = 'highlight-overlay';
        highlightOverlay.style.position = 'absolute';
        highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
        highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
        highlightOverlay.style.width = `${rect.width}px`;
        highlightOverlay.style.height = `${rect.height}px`;
        highlightOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        highlightOverlay.style.zIndex = '10';
        document.body.appendChild(highlightOverlay);
    }
}

function nextTutorialStep() {
    if (currentStep < tutorialSteps.length) {
        showTutorialStep(currentStep);
        currentStep++;
    } else {
        endTutorial();
    }
}

function previousTutorialStep() {
    if (currentStep > 0) {
        currentStep--;
        showTutorialStep(currentStep);
    }
}

function startTutorial() {
    currentStep = 0;
    showTutorialStep(currentStep);
}

function endTutorial() {
    document.querySelector('#tutorial-overlay').style.display = 'none';
    const overlayElements = document.querySelectorAll('.highlight-overlay');
    overlayElements.forEach(element => element.remove());

    alert(translations[selectedLanguage].tutorialComplete);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#tutorial-next-btn').addEventListener('click', nextTutorialStep);
    document.querySelector('#tutorial-prev-btn').addEventListener('click', previousTutorialStep);
    document.querySelector('#tutorial-end-btn').addEventListener('click', endTutorial);
    startTutorial();
});

const translations = {
    pt: {
        welcome: "Bem-vindo ao Morro Digital! Você gostaria de iniciar o tutorial que te ensinará todas as funcionalidades do site?",
        start: "Começar",
        tutorialComplete: "Tutorial completo!",
        selectLanguage: "Selecione seu idioma",
        locationPermissionDenied: "Permissão de localização negada.",
        geolocationNotSupported: "Geolocalização não é suportada por este navegador.",
        osmFetchError: "Erro ao buscar dados da OSM:",
        detailedInfo: "Informações detalhadas sobre",
        createRoutePrompt: "Para criar uma rota até este local, clique no botão 'Criar Rota' abaixo.",
        createRoute: "Criar Rota",
        itinerarySaved: "Roteiro salvo:",
        suggestGuidedTour: "Sugerir tour guiado.",
        startGuidedTour: "Iniciar tour guiado.",
        showPointOfInterestInfo: "Mostrar informações do ponto de interesse:",
        requestActivityParticipation: "Solicitar participação em atividades.",
        submitFeedback: "Enviar feedback:",
        feedbackSent: "Feedback enviado com sucesso:",
        provideContinuousAssistance: "Fornecer assistência contínua.",
        answerQuestions: "Responder pergunta:",
        youAreHere: "Você está aqui!",
        locationNotAvailable: "Localização atual não disponível.",
        routeCreationError: "Erro ao criar rota."
    },
    es: {
        welcome: "¡Bienvenidos a Morro Digital! ¿Te gustaría comenzar el tutorial que te enseñará todas las características del sitio?",
        start: "Comenzar",
        tutorialComplete: "¡Tutorial completo!",
        selectLanguage: "Seleccione su idioma",
        locationPermissionDenied: "Permiso de ubicación denegado.",
        geolocationNotSupported: "La geolocalización no es compatible con este navegador.",
        osmFetchError: "Error al buscar datos de OSM:",
        detailedInfo: "Información detallada sobre",
        createRoutePrompt: "Para crear una ruta hasta este lugar, haga clic en el botón 'Crear Ruta' a continuación.",
        createRoute: "Crear Ruta",
        itinerarySaved: "Itinerario guardado:",
        suggestGuidedTour: "Sugerir tour guiado.",
        startGuidedTour: "Iniciar tour guiado.",
        showPointOfInterestInfo: "Mostrar información del punto de interés:",
        requestActivityParticipation: "Solicitar participación en actividades.",
        submitFeedback: "Enviar comentarios:",
        feedbackSent: "Comentarios enviados con éxito:",
        provideContinuousAssistance: "Proporcionar asistencia continua.",
        answerQuestions: "Responder pregunta:",
        youAreHere: "¡Estás aquí!",
        locationNotAvailable: "Ubicación actual no disponible.",
        routeCreationError: "Error creando la ruta."
    },
    en: {
        welcome: "Welcome to Morro Digital! Would you like to start the tutorial that will teach you all the site's features?",
        start: "Start",
        tutorialComplete: "Tutorial complete!",
        selectLanguage: "Select your language",
        locationPermissionDenied: "Location permission denied.",
        geolocationNotSupported: "Geolocation is not supported by this browser.",
        osmFetchError: "Error fetching OSM data:",
        detailedInfo: "Detailed information about",
        createRoutePrompt: "To create a route to this location, click the 'Create Route' button below.",
        createRoute: "Create Route",
        itinerarySaved: "Itinerary saved:",
        suggestGuidedTour: "Suggest guided tour.",
        startGuidedTour: "Start guided tour.",
        showPointOfInterestInfo: "Show point of interest information:",
        requestActivityParticipation: "Request activity participation.",
        submitFeedback: "Submit feedback:",
        feedbackSent: "Feedback sent successfully:",
        provideContinuousAssistance: "Provide continuous assistance.",
        answerQuestions: "Answer question:",
        youAreHere: "You are here!",
        locationNotAvailable: "Current location not available.",
        routeCreationError: "Error creating route."
    },
    he: {
        welcome: "ברוכים הבאים למורו דיגיטל! האם תרצה להתחיל את המדריך שילמד אותך את כל תכונות האתר?",
        start: "התחל",
        tutorialComplete: "המדריך הושלם!",
        selectLanguage: "בחר את השפה שלך",
        locationPermissionDenied: "הרשאת מיקום נדחתה.",
        geolocationNotSupported: "מיקום גיאוגרפי אינו נתמך על ידי דפדפן זה.",
        osmFetchError: "שגיאה באחזור נתוני OSM:",
        detailedInfo: "מידע מפורט על",
        createRoutePrompt: "כדי ליצור מסלול למיקום זה, לחץ על כפתור 'צור מסלול' למטה.",
        createRoute: "צור מסלול",
        itinerarySaved: "מסלול נשמר:",
        suggestGuidedTour: "הצע סיור מודרך.",
        startGuidedTour: "התחל סיור מודרך.",
        showPointOfInterestInfo: "הצג מידע על נקודת עניין:",
        requestActivityParticipation: "בקש השתתפות בפעילויות.",
        submitFeedback: "שלח משוב:",
        feedbackSent: "משוב נשלח בהצלחה:",
        provideContinuousAssistance: "ספק סיוע מתמשך.",
        answerQuestions: "ענה על שאלה:",
        youAreHere: "אתה כאן!",
        locationNotAvailable: "המיקום הנוכחי לא זמין.",
        routeCreationError: "שגיאה ביצירת מסלול."
    }
};


document.getElementById('map').addEventListener('click', () => { if (currentStep === 2) nextTutorialStep(); });

document.querySelector('.menu-btn[data-feature="pontos-turisticos"]').addEventListener('click', () => { if (currentStep === 3) nextTutorialStep(); });

document.querySelector('.menu-btn[data-feature="passeios"]').addEventListener('click', () => { if (currentStep === 4) nextTutorialStep(); });

document.querySelector('.menu-btn[data-feature="praias"]').addEventListener('click', () => { if (currentStep === 5) nextTutorialStep(); });

document.querySelector('.menu-btn[data-feature="restaurantes"]').addEventListener('click', () => { if (currentStep === 6) nextTutorialStep(); });

document.getElementById('create-route-btn').addEventListener('click', () => { if (currentStep === 7) nextTutorialStep(); });

document.getElementById('feedback-toggle-btn').addEventListener('click', () => { if (currentStep === 8) nextTutorialStep(); });

window.addEventListener('resize', function() {
    const modal = document.querySelector('.modal');
    if (modal) {
        const windowHeight = window.innerHeight;
        const modalHeight = modal.offsetHeight;
        if (modalHeight > windowHeight) {
            modal.style.top = '10px';
            modal.style.transform = 'translateX(-50%)';
        } else {
            modal.style.top = '10%';
            modal.style.transform = 'translate(-50%, -10%)';
        }
    }
});

