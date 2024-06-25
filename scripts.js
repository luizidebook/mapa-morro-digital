let map;
let currentLocation;
let routingControl;
let tutorialStep = 0;
let selectedLanguage = 'pt';

// Tradução dos textos
const translations = {
    pt: {
        welcome: "Bem-vindo ao Morro Digital! Você gostaria de iniciar o tutorial que te ensinará todas as funcionalidades do site?",
        selectLanguage: "Selecione um idioma:",
        locationPermission: "Permissão de Localização",
        locationPermissionText: "Precisamos de sua permissão para acessar sua localização:",
        allow: "Permitir",
        createItinerary: "Você deseja criar um roteiro de atividades em Morro de São Paulo personalizado para suas preferências?",
        name: "Nome:",
        origin: "De onde você é?",
        firstVisit: "É a primeira vez que visita Morro de São Paulo?",
        activitiesDone: "Quais atividades já realizou em Morro?",
        visitedPlaces: "Quais pontos turísticos já visitou?",
        visitedBeaches: "Quais praias já conheceu?",
        toursDone: "Já realizou algum passeio em Morro? Se sim, qual?",
        attendedParties: "Já foi em alguma festa em Morro? Se sim, qual?",
        preferredParties: "Quais as opções de festas disponíveis são mais do seu agrado?",
        preferredCuisine: "Qual o tipo de gastronomia tem mais interesse em experimentar?",
        locationPreference: "Tem preferência por local próximo à vila ou às praias?",
        budget: "Atualmente, qual é o valor que você tem disponível para utilizar?",
        stayDuration: "Quantos dias você ficará em Morro de São Paulo?",
        submit: "Enviar",
        feedback: "Enviar Feedback",
        feedbackPlaceholder: "Deixe seu feedback aqui...",
        submitFeedback: "Enviar Feedback",
        tutorialStep1: "Bem-vindo ao tutorial! Clique em próximo para continuar.",
        tutorialStep2: "Aqui você pode ver o mapa de Morro de São Paulo.",
        tutorialStep3: "Use o menu lateral para navegar entre as categorias.",
        tutorialStep4: "Clique em 'Planejar Viagem' para criar um roteiro personalizado.",
        tutorialStep5: "Você pode enviar feedback clicando no botão correspondente.",
        tutorialStep6: "Você deseja criar um roteiro de atividades em Morro de São Paulo personalizado para suas preferências?",
        searchPlaceholder: "Pesquisar...",
        searchButton: "Pesquisar",
        loading: "Carregando...",
        voiceFeedback: "Feedback por Voz",
        tutorialComplete: "Tutorial completo!",
        shareFacebook: "Facebook",
        shareTwitter: "Twitter",
        shareInstagram: "Instagram",
        thankYou: "Obrigado pelo seu feedback! Um novo roteiro será gerado com base no seu feedback.",
        start: "Começar",
        yes: "Sim",
        no: "Não",
        next: "Avançar",
        prev: "Voltar",
        end: "Encerrar Tutorial",
        menu: "Menu",
        planTrip: "📅",
        voiceRec: "🎤",
        message: "💬",
        search: "🔍",
        touristSpots: "Pontos Turísticos",
        tours: "Passeios",
        beaches: "Praias",
        nightlife: "Vida Noturna",
        restaurants: "Restaurantes",
        inns: "Pousadas",
        pointsOfInterest: "Pontos de Interesse",
        history: "História",
        gastronomy: "Gastronomia",
        shopping: "Compras",
        emergencies: "Emergências"
    },
    es: {
        welcome: "¡¡Bienvenidos a Morro Digital! ¿Te gustaría comenzar el tutorial que te enseñará todas las características del sitio?",
        selectLanguage: "Seleccione un idioma:",
        locationPermission: "Permiso de ubicación",
        locationPermissionText: "Necesitamos su permiso para acceder a su ubicación:",
        allow: "Permitir",
        createItinerary: "¿Quieres crear un itinerario de actividades en Morro de São Paulo personalizado según tus preferencias?",
        name: "Nombre:",
        origin: "¿De dónde eres?",
        firstVisit: "¿Es la primera vez que visita Morro de São Paulo?",
        activitiesDone: "¿Qué actividades has realizado en Morro?",
        visitedPlaces: "¿Qué puntos turísticos has visitado?",
        visitedBeaches: "¿Qué playas has conocido?",
        toursDone: "¿Has realizado algún tour en Morro? Si es así, ¿cuál?",
        attendedParties: "¿Has asistido a alguna fiesta en Morro? Si es así, ¿cuál?",
        preferredParties: "¿Qué opciones de fiestas disponibles son de tu agrado?",
        preferredCuisine: "¿Qué tipo de gastronomía te interesa probar?",
        locationPreference: "¿Prefieres un lugar cerca del pueblo o de las playas?",
        budget: "¿Cuál es el presupuesto disponible para usar?",
        stayDuration: "¿Cuántos días te quedarás en Morro de São Paulo?",
        submit: "Enviar",
        feedback: "Enviar Comentarios",
        feedbackPlaceholder: "Deja tus comentarios aquí...",
        submitFeedback: "Enviar Comentarios",
        tutorialStep1: "¡Bienvenido al tutorial! Haga clic en siguiente para continuar.",
        tutorialStep2: "Aquí puedes ver el mapa de Morro de São Paulo.",
        tutorialStep3: "Utiliza el menú lateral para navegar entre las categorías.",
        tutorialStep4: "Haz clic en 'Planificar Viaje' para crear un itinerario personalizado.",
        tutorialStep5: "Puedes enviar comentarios haciendo clic en el botón correspondiente.",
        tutorialStep6: "¿Quieres crear un itinerario de actividades en Morro de São Paulo personalizado según tus preferencias?",
        searchPlaceholder: "Buscar...",
        searchButton: "Buscar",
        loading: "Cargando...",
        voiceFeedback: "Comentarios por Voz",
        tutorialComplete: "¡Tutorial completo!",
        shareFacebook: "Facebook",
        shareTwitter: "Twitter",
        shareInstagram: "Instagram",
        thankYou: "Gracias por tus comentarios! Se generará un nuevo itinerario basado en tus comentarios.",
        start: "Comenzar",
        yes: "Sí",
        no: "No",
        next: "Avanzar",
        prev: "Atrás",
        end: "Finalizar Tutorial",
        menu: "Menú",
        planTrip: "📅",
        voiceRec: "🎤",
        message: "💬",
        search: "🔍",
        touristSpots: "Puntos Turísticos",
        tours: "Tours",
        beaches: "Playas",
        nightlife: "Vida Nocturna",
        restaurants: "Restaurantes",
        inns: "Posadas",
        pointsOfInterest: "Puntos de Interés",
        history: "Historia",
        gastronomy: "Gastronomía",
        shopping: "Compras",
        emergencies: "Emergencias"
    },
    en: {
        welcome: "Welcome to Morro Digital! Would you like to start the tutorial that will teach you all the site's features?",
        selectLanguage: "Select a language:",
        locationPermission: "Location Permission",
        locationPermissionText: "We need your permission to access your location:",
        allow: "Allow",
        createItinerary: "Do you want to create an itinerary of activities in Morro de São Paulo personalized to your preferences?",
        name: "Name:",
        origin: "Where are you from?",
        firstVisit: "Is this your first time visiting Morro de São Paulo?",
        activitiesDone: "What activities have you done in Morro?",
        visitedPlaces: "Which tourist spots have you visited?",
        visitedBeaches: "Which beaches have you visited?",
        toursDone: "Have you done any tours in Morro? If yes, which one?",
        attendedParties: "Have you attended any parties in Morro? If yes, which one?",
        preferredParties: "Which available party options are to your liking?",
        preferredCuisine: "What type of cuisine are you interested in trying?",
        locationPreference: "Do you prefer a location near the village or the beaches?",
        budget: "What is your available budget to use?",
        stayDuration: "How many days will you stay in Morro de São Paulo?",
        submit: "Submit",
        feedback: "Submit Feedback",
        feedbackPlaceholder: "Leave your feedback here...",
        submitFeedback: "Submit Feedback",
        tutorialStep1: "Welcome to the tutorial! Click next to continue.",
        tutorialStep2: "Here you can see the map of Morro de São Paulo.",
        tutorialStep3: "Use the side menu to navigate between categories.",
        tutorialStep4: "Click 'Plan Trip' to create a personalized itinerary.",
        tutorialStep5: "You can send feedback by clicking the corresponding button.",
        tutorialStep6: "Do you want to create an itinerary of activities in Morro de São Paulo personalized to your preferences?",
        searchPlaceholder: "Search...",
        searchButton: "Search",
        loading: "Loading...",
        voiceFeedback: "Voice Feedback",
        tutorialComplete: "Tutorial complete!",
        shareFacebook: "Facebook",
        shareTwitter: "Twitter",
        shareInstagram: "Instagram",
        thankYou: "Thank you for your feedback! A new itinerary will be generated based on your feedback.",
        start: "Start",
        yes: "Yes",
        no: "No",
        next: "Next",
        prev: "Back",
        end: "End Tutorial",
        menu: "Menu",
        planTrip: "📅",
        voiceRec: "🎤",
        message: "💬",
        search: "🔍",
        touristSpots: "Tourist Spots",
        tours: "Tours",
        beaches: "Beaches",
        nightlife: "Nightlife",
        restaurants: "Restaurants",
        inns: "Inns",
        pointsOfInterest: "Points of Interest",
        history: "History",
        gastronomy: "Gastronomy",
        shopping: "Shopping",
        emergencies: "Emergencies"
    },
    he: {
        welcome: "ברוכים הבאים למורו דיגיטל! האם תרצה להתחיל את המדריך שילמד אותך את כל תכונות האתר?",
        selectLanguage: "בחר שפה:",
        locationPermission: "אישור מיקום",
        locationPermissionText: "אנו צריכים את אישורך כדי לגשת למיקומך:",
        allow: "אפשר",
        createItinerary: "צהאם אתה רוצה ליצור מסלול פעילויות במורו דה סאו פאולו בהתאמה אישית להעדפותיך?",
        name: "שם:",
        origin: "מאיפה אתה?",
        firstVisit: "האם זו הפעם הראשונה שלך במורו דה סאו פאולו?",
        activitiesDone: "אילו פעילויות עשית במורו?",
        visitedPlaces: "אילו אתרים תיירותיים ביקרת?",
        visitedBeaches: "אילו חופים ביקרת?",
        toursDone: "האם עשית סיורים במורו? אם כן, איזה?",
        attendedParties: "האם השתתפת במסיבות במורו? אם כן, איזה?",
        preferredParties: "אילו אפשרויות מסיבות הן לטעמך?",
        preferredCuisine: "איזה סוג אוכל אתה מעוניין לנסות?",
        locationPreference: "האם אתה מעדיף מקום קרוב לכפר או לחופים?",
        budget: "מה התקציב הזמין שלך?",
        stayDuration: "כמה ימים תשהה במורו דה סאו פאולו?",
        submit: "שלח",
        feedback: "שלח משוב",
        feedbackPlaceholder: "השאר את המשוב שלך כאן...",
        submitFeedback: "שלח משוב",
        tutorialStep1: "ברוך הבא למדריך! לחץ על הבא כדי להמשיך.",
        tutorialStep2: "כאן תוכל לראות את מפת מורו דה סאו פאולו.",
        tutorialStep3: "השתמש בתפריט הצד כדי לנווט בין הקטגוריות.",
        tutorialStep4: "לחץ על 'תכנן טיול' כדי ליצור מסלול מותאם אישית.",
        tutorialStep5: "תוכל לשלוח משוב בלחיצה על הכפתור המתאים.",
        tutorialStep6: "צהאם אתה רוצה ליצור מסלול פעילויות במורו דה סאו פאולו בהתאמה אישית להעדפותיך?",
        searchPlaceholder: "חפש...",
        searchButton: "חפש",
        loading: "טוען...",
        voiceFeedback: "משוב קולי",
        tutorialComplete: "המדריך הושלם!",
        shareFacebook: "פייסבוק",
        shareTwitter: "טוויטר",
        shareInstagram: "אינסטגרם",
        thankYou: "תודה על המשוב שלך! מסלול חדש ייווצר בהתבסס על המשוב שלך.",
        start: "התחל",
        yes: "כן",
        no: "לא",
        next: "הבא",
        prev: "הקודם",
        end: "סיים הדרכה",
        menu: "תפריט",
        planTrip: "📅",
        voiceRec: "🎤",
        message: "💬",
        search: "🔍",
        touristSpots: "אתרי תיירות",
        tours: "סיורים",
        beaches: "חופים",
        nightlife: "חיי לילה",
        restaurants: "מסעדות",
        inns: "אכסניות",
        pointsOfInterest: "נקודות עניין",
        history: "היסטוריה",
        gastronomy: "גסטרונומיה",
        shopping: "קניות",
        emergencies: "חירום"
    }
};


// Função para traduzir o conteúdo do site
function selectLanguage(lang) {
    selectedLanguage = lang;
    document.querySelectorAll('[data-translate]').forEach(el => {
        el.innerText = translations[lang][el.getAttribute('data-translate')] || el.innerText;
    });
    closeModal('welcome-modal');
    openModal('location-permission-modal');
}

// Função para solicitar permissão de localização
function requestLocationPermission() {
    navigator.geolocation.getCurrentPosition(position => {
        currentLocation = position.coords;
        initializeMap();
        closeModal('location-permission-modal');
        startTutorial();
    }, error => {
        alert('Não foi possível obter sua localização.');
    });
}

// Inicializa o mapa com a localização do usuário
function initializeMap() {
    map = L.map('map').setView([-13.375, -38.915], 15); // Coordenadas de Morro de São Paulo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    document.getElementById('loading-indicator').style.display = 'none';
}

// Inicia o tutorial interativo
const tutorialSteps = [
    { element: '#map', message: { pt: "Este é o mapa interativo de Morro de São Paulo.", en: "This is the interactive map of Morro de São Paulo.", es: "Este es el mapa interactivo de Morro de São Paulo.", he: "זהו המפה האינטראקטיבית של מורו דה סאו פאולו." } },
    { element: '#menu-toggle-btn', message: { pt: "Clique no botão 'Menu' para acessar as categorias.", en: "Click the 'Menu' button to access the categories.", es: "Haz clic en el botón 'Menú' para acceder a las categorías.", he: "לחץ על כפתור 'תפריט' כדי לגשת לקטגוריות." } },
    { element: '#plan-trip-btn', message: { pt: "Clique no botão 'Planejar Viagem' para criar um roteiro.", en: "Click the 'Plan Trip' button to create a route.", es: "Haz clic en el botón 'Planear Viaje' para crear una ruta.", he: "לחץ על כפתור 'תכנן טיול' כדי ליצור מסלול." } },
    { element: '#voice-rec-btn', message: { pt: "Clique no botão '🎤' para iniciar o reconhecimento de voz.", en: "Click the '🎤' button to start voice recognition.", es: "Haz clic en el botón '🎤' para iniciar el reconocimiento de voz.", he: "לחץ על כפתור '🎤' כדי להתחיל זיהוי קול." } },
    { element: '#message-toggle-btn', message: { pt: "Clique no botão '💬' para abrir a caixa de mensagens.", en: "Click the '💬' button to open the message box.", es: "Haz clic en el botón '💬' para abrir el cuadro de mensajes.", he: "לחץ על כפתור '💬' כדי לפתוח את תיבת ההודעות." } },
    { element: '#search-toggle-btn', message: { pt: "Clique no botão '🔍' para abrir a barra de pesquisa.", en: "Click the '🔍' button to open the search bar.", es: "Haz clic en el botón '🔍' para abrir la barra de búsqueda.", he: "לחץ על כפתור '🔍' כדי לפתוח את סרגל החיפוש." } },
    { element: null, message: { pt: "Você deseja criar um roteiro de atividades em Morro de São Paulo personalizado para suas preferências?", en: "Do you want to create an itinerary of activities in Morro de São Paulo personalized to your preferences?", es: "¿Quieres crear un itinerario de actividades en Morro de São Paulo personalizado según tus preferencias?", he: "צהאם אתה רוצה ליצור מסלול פעילויות במורו דה סאו פאולו בהתאמה אישית להעדפותיך?" } }
];

let currentStep = 0;

function showTutorialStep(step) {
    const { element, message } = tutorialSteps[step];
    const targetElement = element ? document.querySelector(element) : null;
    const tutorialOverlay = document.querySelector('#tutorial-overlay');
    const tutorialMessage = document.querySelector('#tutorial-message');

    // Atualizar a mensagem do tutorial
    tutorialMessage.innerText = message[selectedLanguage];

    // Remover overlays anteriores
    const previousOverlays = document.querySelectorAll('.highlight-overlay');
    previousOverlays.forEach(overlay => overlay.remove());

    if (element) {
        // Adicionar novo overlay de destaque
        const rect = targetElement.getBoundingClientRect();
        const highlightOverlay = document.createElement('div');
        highlightOverlay.className = 'highlight-overlay';
        highlightOverlay.style.position = 'absolute';
        highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
        highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
        highlightOverlay.style.width = `${rect.width}px`;
        highlightOverlay.style.height = `${rect.height}px`;
        highlightOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        highlightOverlay.style.zIndex = '10000';
        document.body.appendChild(highlightOverlay);
    }

    tutorialOverlay.style.display = 'block';

    // Mostrar ou ocultar os botões de navegação conforme necessário
    document.querySelector('#tutorial-prev-btn').style.display = step > 0 ? 'inline-block' : 'none';
    document.querySelector('#tutorial-next-btn').style.display = step < tutorialSteps.length - 1 ? 'inline-block' : 'none';
    document.querySelector('#tutorial-end-btn').style.display = step === tutorialSteps.length - 1 ? 'inline-block' : 'none';
    document.querySelector('#tutorial-create-itinerary-btn').style.display = step === tutorialSteps.length - 1 ? 'inline-block' : 'none';

    document.querySelector('#tutorial-start-btn').style.display = 'none';
    document.querySelector('#tutorial-yes-btn').style.display = 'none';
    document.querySelector('#tutorial-no-btn').style.display = 'none';
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
    showWelcomeModal();
}

function endTutorial() {
    document.querySelector('#tutorial-overlay').style.display = 'none';
    const overlayElements = document.querySelectorAll('.highlight-overlay');
    overlayElements.forEach(element => element.remove());

    alert(translations[selectedLanguage].tutorialComplete);
}

function showWelcomeModal() {
    const welcomeModal = document.createElement('div');
    welcomeModal.className = 'tutorial-modal';
    welcomeModal.innerHTML = `
        <div class="tutorial-modal-content">
            <p>${translations[selectedLanguage].welcome}</p>
            <button id="start-tutorial-btn">${translations[selectedLanguage].start}</button>
        </div>
    `;
    document.body.appendChild(welcomeModal);

    document.querySelector('#start-tutorial-btn').addEventListener('click', () => {
        welcomeModal.remove();
        showConfirmationModal();
    });
}

function showConfirmationModal() {
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'tutorial-modal';
    confirmationModal.innerHTML = `
        <div class="tutorial-modal-content">
            <p>${translations[selectedLanguage].createItinerary}</p>
            <button id="confirm-tutorial-btn">${translations[selectedLanguage].yes}</button>
            <button id="decline-tutorial-btn">${translations[selectedLanguage].no}</button>
        </div>
    `;
    document.body.appendChild(confirmationModal);

    document.querySelector('#confirm-tutorial-btn').addEventListener('click', () => {
        confirmationModal.remove();
        nextTutorialStep();
    });

    document.querySelector('#decline-tutorial-btn').addEventListener('click', () => {
        confirmationModal.remove();
        endTutorial();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#next-tutorial-btn').addEventListener('click', nextTutorialStep);
    document.querySelector('#prev-tutorial-btn').addEventListener('click', previousTutorialStep);
    document.querySelector('#end-tutorial-btn').addEventListener('click', endTutorial);
    document.querySelector('#tutorial-create-itinerary-btn').addEventListener('click', endTutorial);
    // Inicia o tutorial com o idioma padrão
    selectLanguage('pt');
    startTutorial();
});

// Função para buscar dados da OpenStreetMap
async function fetchOSMData(query) {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados da OSM:', error);
    }
}

// Função para exibir os dados da OpenStreetMap
function displayOSMData(data, subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = ''; // Limpa o submenu antes de adicionar os novos elementos
    data.elements.forEach(element => {
        if (element.type === 'node' && element.tags.name) {
            // Adiciona apenas se houver um nome
            const btn = document.createElement('button');
            btn.className = 'submenu-btn';
            btn.textContent = element.tags.name;
            btn.onclick = () => showInfo(element.tags.name, [element.lat, element.lon]);
            subMenu.appendChild(btn);
        }
    });
}

// Exibe informações sobre o local selecionado
function showInfo(name, coordinates) {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'block';

    const info = translations[selectedLanguage][name.toLowerCase().replace(/\s+/g, '')] || `Informações detalhadas sobre ${name}`;
    messageBox.innerHTML = `<p>${info}</p>`;
    speakText(info);

    if (coordinates) {
        showRoute(coordinates);
    }
}

// Exibe a rota até o destino selecionado
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
            serviceUrl: 'https://router.project-osrm.org/route/v1/',
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

// Função para carregar o submenu com dados da OSM
function loadSubMenu(subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.style.display = 'block';

    const queries = {
        'touristSpots-submenu': '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
        'tours-submenu': '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
        'beaches-submenu': '[out:json];node["natural"="beach"](around:10000,-13.376,-38.913);out body;',
        'nightlife-submenu': '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
        'restaurants-submenu': '[out:json];node["amenity"="restaurant"](around:10000,-13.376,-38.913);out body;',
        'inns-submenu': '[out:json];node["tourism"="hotel"](around:10000,-13.376,-38.913);out body;'
    };

    fetchOSMData(queries[subMenuId]).then(data => displayOSMData(data, subMenuId));
}

// Função para iniciar o reconhecimento de voz
function startVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = selectedLanguage === 'pt' ? 'pt-BR' : selectedLanguage;
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

// Função para lidar com comandos de voz
function handleVoiceCommand(command) {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('mapa')) {
        toggleMenu();
    } else if (lowerCommand.includes('história')) {
        showInfo('História de Morro de São Paulo');
    } else if (lowerCommand.includes('praias')) {
        loadSubMenu('praiasSubMenu');
    } else if (lowerCommand.includes('pontos turísticos')) {
        loadSubMenu('pontosTuristicosSubMenu');
    } else {
        alert(`Comando de voz não reconhecido: ${command}`);
    }
}


function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function handleMenuClick(subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.style.display = subMenu.style.display === 'none' ? 'block' : 'none';
}

// Função para exibir e ocultar modais
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Função para exibir mensagens de texto
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLanguage === 'pt' ? 'pt-BR' : selectedLanguage;
        speechSynthesis.speak(utterance);
    } else {
        console.warn('API de síntese de voz não suportada neste navegador.');
    }
}

// Função para alternar a visibilidade da caixa de pesquisa
function toggleSearch() {
    const searchBox = document.getElementById('search-box');
    searchBox.style.display = searchBox.style.display === 'none' ? 'block' : 'none';
}

// Função para buscar locais no mapa
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


// Função para exibir resultados de pesquisa
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

// Inicializa o mapa e mostra o modal de boas-vindas ao carregar a página
window.addEventListener('load', () => {
    openModal('welcome-modal');
});

// Funções para compartilhar nas redes sociais
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Confira o Morro Digital!');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnInstagram() {
    alert('Compartilhamento no Instagram não é suportado diretamente. Por favor, copie o link e cole no seu Instagram.');
}

// Função para gerenciar recompensas do usuário
function manageRewards() {
    // Exemplo de lógica para gerenciar recompensas
    let rewards = localStorage.getItem('rewards') || 0;
    rewards++;
    localStorage.setItem('rewards', rewards);
    alert(`Você ganhou uma recompensa! Total de recompensas: ${rewards}`);
}

// Função para usar recompensas
function useRewards() {
    let rewards = localStorage.getItem('rewards') || 0;
    if (rewards > 0) {
        rewards--;
        localStorage.setItem('rewards', rewards);
        alert(`Você usou uma recompensa! Total de recompensas restantes: ${rewards}`);
    } else {
        alert('Você não tem recompensas suficientes.');
    }
}

// Adicionando botões de recompensas no menu
document.getElementById('menu').innerHTML += `
    <button class="menu-btn" onclick="manageRewards()">Ganhar Recompensa</button>
    <button class="menu-btn" onclick="useRewards()">Usar Recompensa</button>
`;

// Função para buscar a previsão do tempo
function fetchWeather() {
    const apiKey = 'YOUR_WEATHER_API_KEY';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&units=metric&lang=${selectedLanguage}&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Erro ao buscar a previsão do tempo:', error);
        });
}

// Função para exibir a previsão do tempo
function displayWeather(data) {
    const weatherBox = document.getElementById('weather-box');
    const weatherContent = document.getElementById('weather-content');
    weatherContent.innerHTML = `
        <p>${data.weather[0].description}</p>
        <p>Temperatura: ${data.main.temp}°C</p>
        <p>Umidade: ${data.main.humidity}%</p>
        <p>Vento: ${data.wind.speed} m/s</p>
    `;
    weatherBox.style.display = 'block';
}

// Chama a função fetchWeather após inicializar o mapa
function initializeMap() {
    map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    document.getElementById('loading-indicator').style.display = 'none';

    // Buscar a previsão do tempo
    fetchWeather();
}

// Função para buscar eventos locais
function fetchEvents() {
    const apiKey = 'YOUR_EVENTS_API_KEY';
    const url = `https://api.eventservice.com/events?location=Morro+de+São+Paulo&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayEvents(data);
        })
        .catch(error => {
            console.error('Erro ao buscar eventos locais:', error);
        });
}

// Função para exibir eventos locais
function displayEvents(data) {
    const eventsBox = document.getElementById('events-box');
    const eventsContent = document.getElementById('events-content');
    eventsContent.innerHTML = data.events.map(event => `
        <p>${event.name}</p>
        <p>${event.date}</p>
        <p>${event.location}</p>
    `).join('');
    eventsBox.style.display = 'block';
}

// Chama a função fetchEvents após inicializar o mapa
function initializeMap() {
    map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    document.getElementById('loading-indicator').style.display = 'none';

    // Buscar a previsão do tempo
    fetchWeather();

    // Buscar eventos locais
    fetchEvents();
}

// Função para buscar restaurantes
function fetchRestaurants() {
    const apiKey = 'YOUR_RESTAURANT_API_KEY';
    const url = `https://api.restaurantservice.com/restaurants?location=Morro+de+São+Paulo&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayRestaurants(data);
        })
        .catch(error => {
            console.error('Erro ao buscar restaurantes:', error);
        });
}

// Função para exibir restaurantes
function displayRestaurants(data) {
    const restaurantBox = document.getElementById('restaurant-reservation-box');
    const restaurantContent = document.getElementById('restaurant-reservation-content');
    restaurantContent.innerHTML = data.restaurants.map(restaurant => `
        <p>${restaurant.name}</p>
        <p>${restaurant.address}</p>
        <button onclick="makeReservation('${restaurant.id}')">Reservar</button>
    `).join('');
    restaurantBox.style.display = 'block';
}

// Função para fazer uma reserva
function makeReservation(restaurantId) {
    const apiKey = 'YOUR_RESTAURANT_API_KEY';
    const url = `https://api.restaurantservice.com/reservations?restaurant_id=${restaurantId}&apikey=${apiKey}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: 'USER_ID',
            date: 'RESERVATION_DATE',
            time: 'RESERVATION_TIME',
            guests: 'NUMBER_OF_GUESTS'
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Reserva feita com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao fazer a reserva:', error);
    });
}

// Chama a função fetchRestaurants após inicializar o mapa
function initializeMap() {
    map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    document.getElementById('loading-indicator').style.display = 'none';

    // Buscar a previsão do tempo
    fetchWeather();

    // Buscar eventos locais
    fetchEvents();

    // Buscar restaurantes
    fetchRestaurants();
}

// Função para buscar hotéis
function fetchHotels() {
    const apiKey = 'YOUR_HOTEL_API_KEY';
    const url = `https://api.hotelservice.com/hotels?location=Morro+de+São+Paulo&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayHotels(data);
        })
        .catch(error => {
            console.error('Erro ao buscar hotéis:', error);
        });
}

// Função para exibir hotéis
function displayHotels(data) {
    const hotelBox = document.getElementById('hotel-reservation-box');
    const hotelContent = document.getElementById('hotel-reservation-content');
    hotelContent.innerHTML = data.hotels.map(hotel => `
        <p>${hotel.name}</p>
        <p>${hotel.address}</p>
        <button onclick="makeHotelReservation('${hotel.id}')">Reservar</button>
    `).join('');
    hotelBox.style.display = 'block';
}

// Função para fazer uma reserva de hotel
function makeHotelReservation(hotelId) {
    const apiKey = 'YOUR_HOTEL_API_KEY';
    const url = `https://api.hotelservice.com/reservations?hotel_id=${hotelId}&apikey=${apiKey}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: 'USER_ID',
            check_in: 'CHECK_IN_DATE',
            check_out: 'CHECK_OUT_DATE',
            guests: 'NUMBER_OF_GUESTS'
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Reserva feita com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao fazer a reserva:', error);
    });
}

// Chama a função fetchHotels após inicializar o mapa
function initializeMap() {
    map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    document.getElementById('loading-indicator').style.display = 'none';

    // Buscar a previsão do tempo
    fetchWeather();

    // Buscar eventos locais
    fetchEvents();

    // Buscar restaurantes
    fetchRestaurants();

    // Buscar hotéis
    fetchHotels();
}

// Função para enviar feedback
function sendFeedback(event) {
    event.preventDefault();
    const feedbackText = document.getElementById('feedback-text').value;

    if (feedbackText.trim() === '') {
        alert('Por favor, preencha o campo de feedback.');
        return;
    }

    const apiKey = 'YOUR_FEEDBACK_API_KEY';
    const url = `https://api.feedbackservice.com/feedback?apikey=${apiKey}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: 'USER_ID',
            feedback: feedbackText
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Feedback enviado com sucesso!');
        document.getElementById('feedback-form').reset();
        document.getElementById('feedback-box').style.display = 'none';
    })
    .catch(error => {
        console.error('Erro ao enviar feedback:', error);
    });
}

// Adiciona evento de envio ao formulário de feedback
document.getElementById('feedback-form').addEventListener('submit', sendFeedback);

// Função para alternar a visibilidade da caixa de feedback
function toggleFeedback() {
    const feedbackBox = document.getElementById('feedback-box');
    feedbackBox.style.display = feedbackBox.style.display === 'none' ? 'block' : 'none';
}

// Adiciona botão para abrir a caixa de feedback
const feedbackButton = document.createElement('button');
feedbackButton.id = 'feedback-toggle-btn';
feedbackButton.innerText = 'Feedback';
feedbackButton.onclick = toggleFeedback;
document.body.appendChild(feedbackButton);

// Estilo para o botão de feedback
const feedbackButtonStyle = document.createElement('style');
feedbackButtonStyle.innerHTML = document.head.appendChild(feedbackButtonStyle);

// Função para buscar recompensas do usuário
function fetchRewards() {
    const apiKey = 'YOUR_REWARDS_API_KEY';
    const url = `https://api.rewardsservice.com/rewards?user_id=USER_ID&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayRewards(data);
        })
        .catch(error => {
            console.error('Erro ao buscar recompensas:', error);
        });
}

// Função para exibir recompensas do usuário
function displayRewards(data) {
    const rewardsBox = document.getElementById('rewards-box');
    const rewardsContent = document.getElementById('rewards-content');
    rewardsContent.innerHTML = data.rewards.map(reward => `
        <p>${reward.description}</p>
        <p>Pontos: ${reward.points}</p>
    `).join('');
    rewardsBox.style.display = 'block';
}

// Chama a função fetchRewards após inicializar o mapa
function initializeMap() {
    map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    document.getElementById('loading-indicator').style.display = 'none';

    // Buscar a previsão do tempo
    fetchWeather();

    // Buscar eventos locais
    fetchEvents();

    // Buscar restaurantes
    fetchRestaurants();

    // Buscar hotéis
    fetchHotels();

    // Buscar recompensas
    fetchRewards();
}

// Função para buscar conquistas do usuário
function fetchAchievements() {
    const apiKey = 'YOUR_ACHIEVEMENTS_API_KEY';
    const url = `https://api.achievementsservice.com/achievements?user_id=USER_ID&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayAchievements(data);
        })
        .catch(error => {
            console.error('Erro ao buscar conquistas:', error);
        });
}

// Função para exibir conquistas do usuário
function displayAchievements(data) {
    const achievementsBox = document.getElementById('achievements-box');
    const achievementsContent = document.getElementById('achievements-content');
    achievementsContent.innerHTML = data.achievements.map(achievement => `
        <p>${achievement.description}</p>
        <p>Data: ${achievement.date}</p>
    `).join('');
    achievementsBox.style.display = 'block';
}

// Chama a função fetchAchievements após inicializar o mapa
function initializeMap() {
    map = L.map('map').setView([currentLocation.latitude, currentLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();

    document.getElementById('loading-indicator').style.display = 'none';

    // Buscar a previsão do tempo
    fetchWeather();

    // Buscar eventos locais
    fetchEvents();

    // Buscar restaurantes
    fetchRestaurants();

    // Buscar hotéis
    fetchHotels();

    // Buscar recompensas
    fetchRewards();

    // Buscar conquistas
    fetchAchievements();
}