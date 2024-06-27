document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadResources();
    activateAssistant();
    setupEventListeners();
    startTutorial();
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

document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = {
        pt: "Bem-vindo ao Morro Digital! Estamos aqui para te guiar em uma jornada incrível pelo Morro de São Paulo. Por favor, selecione o seu idioma preferido para começarmos.",
        en: "Welcome to Morro Digital! We are here to guide you on an amazing journey through Morro de São Paulo. Please select your preferred language to get started.",
        es: "¡Bienvenido a Morro Digital! Estamos aquí para guiarte en un viaje increíble por Morro de São Paulo. Por favor, selecciona tu idioma preferido para comenzar.",
        he: "ברוך הבא למורו דיגיטל! אנחנו כאן כדי להדריך אותך במסע מדהים דרך מורו דה סאו פאולו. אנא בחר את השפה המועדפת עליך כדי להתחיל."
    };

    document.getElementById('welcome-message').textContent = welcomeMessage[selectedLanguage];
    document.getElementById('welcome-modal').style.display = 'block';

    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', () => {
            const selectedLang = button.getAttribute('data-lang');
            localStorage.setItem('preferredLanguage', selectedLang);
            selectedLanguage = selectedLang;
            document.getElementById('welcome-modal').style.display = 'none';
            unblockUserInteraction('menuToggle');
            loadLanguageResources(selectedLang);
            startTutorial();
        });
    });
});

function loadLanguageResources(lang) {
    // Função para carregar os recursos do idioma selecionado
    // Implementação aqui...
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

function activateAssistant() {
    showWelcomeMessage();
}

function showWelcomeMessage() {
    const modal = document.getElementById('welcome-modal');
    modal.style.display = 'block';
}

function requestLocationPermission() {
    blockUserInteraction();
    const assistantModal = document.getElementById('assistant-modal');
    assistantModal.classList.add('location-permission'); // Adiciona a classe para ajustar a posição

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
            unblockUserInteraction();
            assistantModal.classList.remove('location-permission'); // Remove a classe após permissão
            nextTutorialStep();
            showLocationMessage(); // Avança para o próximo passo do tutorial
        }, () => {
            console.log(translations[selectedLanguage].locationPermissionDenied);
            unblockUserInteraction();
            assistantModal.classList.remove('location-permission'); // Remove a classe se a permissão for negada
        });
    } else {
        console.log(translations[selectedLanguage].geolocationNotSupported);
        unblockUserInteraction();
        assistantModal.classList.remove('location-permission'); // Remove a classe se a geolocalização não for suportada
    }
}



function adjustMapWithLocation(lat, lon) {
    map.setView([lat, lon], 16);
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

function updateAssistantModalContent(content) {
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    modalContent.innerHTML = content;
    document.getElementById('assistant-modal').style.display = 'block';
}

let currentStep = 0;

const tutorialSteps = [
    {
        element: null,
        message: {
            pt: "Olá! Eu sou seu assistente virtual. Estou aqui para te ajudar a explorar todas as funcionalidades deste site com amor e atenção. Vamos começar esta jornada juntos!",
            en: "Hello! I am your virtual assistant. I'm here to help you explore all the features of this site with love and care. Let's start this journey together!",
            es: "¡Hola! Soy tu asistente virtual. Estoy aquí para ayudarte a explorar todas las funcionalidades de este sitio con amor y cuidado. ¡Comencemos este viaje juntos!",
            he: "שלום! אני העוזר הווירטואלי שלך. אני כאן כדי לעזור לך לחקור את כל התכונות של אתר זה באהבה ובטיפול. בואו נתחיל את המסע הזה ביחד!"
        }
    },
    {
        element: '#tutorial-next-btn',
        message: {
            pt: "Este é o botão 'Avançar'. Clique aqui para ir para o próximo passo do tutorial. Vamos tentar juntos, clique no botão!",
            en: "This is the 'Next' button. Click here to go to the next step of the tutorial. Let's try it together, click the button!",
            es: "Este es el botón 'Siguiente'. Haz clic aquí para ir al siguiente paso del tutorial. ¡Intentémoslo juntos, haz clic en el botón!",
            he: "זהו כפתור 'הבא'. לחץ כאן כדי לעבור לשלב הבא של המדריך. בוא ננסה יחד, לחץ על הכפתור!"
        },
        highlight: true,
        action: () => addNextStepClickListener()
    },
    {
        element: '#tutorial-prev-btn',
        message: {
            pt: "Este é o botão 'Voltar'. Clique aqui para retornar ao passo anterior do tutorial. Vamos tentar, clique no botão!",
            en: "This is the 'Back' button. Click here to go back to the previous step of the tutorial. Let's try it, click the button!",
            es: "Este es el botón 'Atrás'. Haz clic aquí para volver al paso anterior del tutorial. ¡Intentémoslo, haz clic en el botón!",
            he: "זהו כפתור 'חזור'. לחץ כאן כדי לחזור לשלב הקודם של המדריך. בוא ננסה, לחץ על הכפתור!"
        },
        highlight: true,
        action: () => addPrevStepClickListener()
    },
    {
        element: '#tutorial-end-btn',
        message: {
            pt: "Este é o botão 'Encerrar Tutorial'. Clique aqui se você quiser encerrar o tutorial a qualquer momento. Vamos tentar, clique no botão!",
            en: "This is the 'End Tutorial' button. Click here if you want to end the tutorial at any time. Let's try it, click the button!",
            es: "Este es el botón 'Finalizar Tutorial'. Haz clic aquí si deseas finalizar el tutorial en cualquier momento. ¡Intentémoslo, haz clic en el botón!",
            he: "זהו כפתור 'סיום מדריך'. לחץ כאן אם ברצונך לסיים את המדריך בכל עת. בוא ננסה, לחץ על הכפתור!"
        },
        highlight: true,
        action: () => addEndTutorialClickListener()
    },
    {
        element: null,
        message: {
            pt: "Primeiro, precisamos da sua permissão para acessar sua localização atual. Isso nos ajudará a fornecer informações relevantes e personalizadas. Clique em 'Permitir' quando solicitado.",
            en: "First, we need your permission to access your current location. This will help us provide relevant and personalized information. Click 'Allow' when prompted.",
            es: "Primero, necesitamos tu permiso para acceder a tu ubicación actual. Esto nos ayudará a proporcionar información relevante y personalizada. Haz clic en 'Permitir' cuando se te solicite.",
            he: "ראשית, אנו זקוקים לאישור שלך לגשת למיקום הנוכחי שלך. זה יעזור לנו לספק מידע רלוונטי ומותאם אישית. לחץ על 'אפשר' כאשר תתבקש."
        },
        action: requestLocationPermission
    },
    {
        element: '#map',
        message: {
            pt: "Esta é a sua localização atual. Agora você pode explorar os pontos turísticos, praias, restaurantes e muito mais. Experimente clicar no mapa!",
            en: "This is your current location. Now you can explore tourist spots, beaches, restaurants, and more. Try clicking on the map!",
            es: "Esta es tu ubicación actual. Ahora puedes explorar los puntos turísticos, playas, restaurantes y más. ¡Intenta hacer clic en el mapa!",
            he: "זהו המיקום הנוכחי שלך. עכשיו אתה יכול לחקור אתרי תיירות, חופים, מסעדות ועוד. נסה ללחוץ על המפה!"
        },
        highlight: true,
        action: () => addMapClickListener()
    },
    {
        element: '#menu-btn',
        message: {
            pt: "Clique neste botão para abrir o menu flutuante. Aqui você pode acessar várias funcionalidades do site.",
            en: "Click this button to open the floating menu. Here you can access various site features.",
            es: "Haz clic en este botón para abrir el menú flutuante. Aquí puedes acceder a varias funciones del sitio.",
            he: "לחץ על כפתור זה כדי לפתוח את התפריט הצף. כאן תוכל לגשת לפונקציות שונות של האתר."
        },
        highlight: true,
        action: () => addMenuToggleClickListener()
    },
    {
        element: '.menu-btn[data-feature="pontos-turisticos"]',
        message: {
            pt: "Clique neste ícone para ver os pontos turísticos de Morro de São Paulo. Explore os lugares mais incríveis da região!",
            en: "Click this icon to see the tourist spots of Morro de São Paulo. Explore the most amazing places in the region!",
            es: "Haz clic en este icono para ver los puntos turísticos de Morro de São Paulo. ¡Explora los lugares más increíbles de la región!",
            he: "לחץ על סמל זה כדי לראות את נקודות התיירות של מורו דה סאו פאולו. חקור את המקומות המדהימים ביותר באזור!"
        },
        highlight: true,
        action: () => addFeatureClickListener('pontos-turisticos')
    },
    {
        element: '.menu-btn[data-feature="passeios"]',
        message: {
            pt: "Clique neste ícone para ver os passeios disponíveis. Descubra as melhores aventuras que você pode viver aqui!",
            en: "Click this icon to see the available tours. Discover the best adventures you can experience here!",
            es: "Haz clic en este icono para ver los tours disponibles. ¡Descubre las mejores aventuras que puedes vivir aquí!",
            he: "לחץ על סמל זה כדי לראות את הסיורים הזמינים. גלה את ההרפתקאות הטובות ביותר שאתה יכול לחוות כאן!"
        },
        highlight: true,
        action: () => addFeatureClickListener('passeios')
    },
    {
        element: '.menu-btn[data-feature="praias"]',
        message: {
            pt: "Clique neste ícone para ver as praias de Morro de São Paulo. Encontre os melhores locais para relaxar e se divertir!",
            en: "Click this icon to see the beaches of Morro de São Paulo. Find the best spots to relax and have fun!",
            es: "Haz clic en este icono para ver las playas de Morro de São Paulo. ¡Encuentra los mejores lugares para relajarte y divertirte!",
            he: "לחץ על סמל זה כדי לראות את החופים של מורו דה סאו פאולו. מצא את המקומות הטובים ביותר להירגע וליהנות!"
        },
        highlight: true,
        action: () => addFeatureClickListener('praias')
    },
    {
        element: '.menu-btn[data-feature="festas"]',
        message: {
            pt: "Clique neste ícone para ver as festas e eventos em Morro de São Paulo. Conheça as melhores baladas e shows!",
            en: "Click this icon to see the parties and events in Morro de São Paulo. Discover the best parties and shows!",
            es: "Haz clic en este icono para ver las fiestas y eventos en Morro de São Paulo. ¡Descubre las mejores fiestas y espectáculos!",
            he: "לחץ על סמל זה כדי לראות את המסיבות והאירועים במורו דה סאו פאולו. גלה את המסיבות והמופעים הטובים ביותר!"
        },
        highlight: true,
        action: () => addFeatureClickListener('festas')
    },
    {
        element: '.menu-btn[data-feature="restaurantes"]',
        message: {
            pt: "Clique neste ícone para ver os restaurantes da região. Delicie-se com a melhor gastronomia local!",
            en: "Click this icon to see the restaurants in the area. Enjoy the best local cuisine!",
            es: "Haz clic en este icono para ver los restaurantes de la región. ¡Disfruta de la mejor gastronomía local!",
            he: "לחץ על סמל זה כדי לראות את המסעדות באזור. תהנה מהמטבח המקומי הטוב ביותר!"
        },
        highlight: true,
        action: () => addFeatureClickListener('restaurantes')
    },
    {
        element: '.menu-btn[data-feature="pousadas"]',
        message: {
            pt: "Clique neste ícone para ver as pousadas disponíveis. Encontre o lugar perfeito para sua estadia!",
            en: "Click this icon to see the available inns. Find the perfect place for your stay!",
            es: "Haz clic en este icono para ver las posadas disponibles. ¡Encuentra el lugar perfecto para tu estadía!",
            he: "לחץ על סמל זה כדי לראות את הפונדקים הזמינים. מצא את המקום המושלם לשהותך!"
        },
        highlight: true,
        action: () => addFeatureClickListener('pousadas')
    },
    {
        element: '.menu-btn[data-feature="lojas"]',
        message: {
            pt: "Clique neste ícone para ver as lojas da região. Descubra as melhores lojas para suas compras!",
            en: "Click this icon to see the shops in the area. Discover the best stores for your shopping!",
            es: "Haz clic en este icono para ver las tiendas de la región. ¡Descubre las mejores tiendas para tus compras!",
            he: "לחץ על סמל זה כדי לראות את החנויות באזור. גלה את החנויות הטובות ביותר לקניות שלך!"
        },
        highlight: true,
        action: () => addFeatureClickListener('lojas')
    },
    {
        element: '.menu-btn[data-feature="emergencias"]',
        message: {
            pt: "Clique neste ícone para ver os contatos de emergência. Tenha sempre à mão os números úteis!",
            en: "Click this icon to see the emergency contacts. Always have the useful numbers at hand!",
            es: "Haz clic en este icono para ver los contactos de emergencia. ¡Ten siempre a mano los números útiles!",
            he: "לחץ על סמל זה כדי לראות את אנשי הקשר לשעת חירום. תמיד יש את המספרים השימושיים בהישג יד!"
        },
        highlight: true,
        action: () => addFeatureClickListener('emergencias')
    },
    {
        element: '.menu-btn[data-feature="dicas"]',
        message: {
            pt: "Clique neste ícone para ver dicas úteis sobre a região. Receba as melhores recomendações!",
            en: "Click this icon to see useful tips about the area. Get the best recommendations!",
            es: "Haz clic en este icono para ver consejos útiles sobre la región. ¡Obtén las mejores recomendaciones!",
            he: "לחץ על סמל זה כדי לראות טיפים שימושיים על האזור. קבל את ההמלצות הטובות ביותר!"
        },
        highlight: true,
        action: () => addFeatureClickListener('dicas')
    },
    {
        element: '.menu-btn.zoom-in',
        message: {
            pt: "Use este botão para dar zoom in no mapa. Experimente!",
            en: "Use this button to zoom in on the map. Try it!",
            es: "Usa este botón para acercar el mapa. ¡Inténtalo!",
            he: "השתמש בכפתור זה כדי להתקרב במפה. נסה את זה!"
        },
        highlight: true,
        action: () => addZoomClickListener('zoom-in')
    },
    {
        element: '.menu-btn.zoom-out',
        message: {
            pt: "Use este botão para dar zoom out no mapa. Experimente!",
            en: "Use this button to zoom out on the map. Try it!",
            es: "Usa este botón para alejar el mapa. ¡Inténtalo!",
            he: "השתמש בכפתור זה כדי להתרחק במפה. נסה את זה!"
        },
        highlight: true,
        action: () => addZoomClickListener('zoom-out')
    },
    {
        element: '.menu-btn.locate-user',
        message: {
            pt: "Use este botão para localizar sua posição atual no mapa. Experimente!",
            en: "Use this button to locate your current position on the map. Try it!",
            es: "Usa este botón para localizar tu posición actual en el mapa. ¡Inténtalo!",
            he: "השתמש בכפתור זה כדי לאתר את המיקום הנוכחי שלך במפה. נסה את זה!"
        },
        highlight: true,
        action: () => addLocateUserClickListener()
    },
    {
        element: '.menu-btn[data-feature="sobre"]',
        message: {
            pt: "Clique neste ícone para saber mais sobre o site. Conheça nossa história e propósito!",
            en: "Click this icon to learn more about the site. Learn about our history and purpose!",
            es: "Haz clic en este icono para saber más sobre el sitio. ¡Conoce nuestra historia y propósito!",
            he: "לחץ על סמל זה כדי ללמוד עוד על האתר. למד על ההיסטוריה והמטרה שלנו!"
        },
        highlight: true,
        action: () => addFeatureClickListener('sobre')
    },
    {
        element: '#create-route-btn',
        message: {
            pt: "Use este botão para criar uma rota até o local selecionado. Planeje seu caminho com facilidade!",
            en: "Use this button to create a route to the selected location. Plan your way easily!",
            es: "Usa este botón para crear una ruta al lugar seleccionado. ¡Planifica tu camino fácilmente!",
            he: "השתמש בכפתור זה כדי ליצור מסלול למיקום הנבחר. תכנן את דרכך בקלות!"
        },
        highlight: true,
        action: () => showCreateRouteButton()
    },
    {
        element: '#generate-itinerary-btn',
        message: {
            pt: "Use este botão para gerar um roteiro. Organize suas atividades e aproveite ao máximo!",
            en: "Use this button to generate an itinerary. Organize your activities and make the most of your time!",
            es: "Usa este botón para generar un itinerario. ¡Organiza tus actividades y aprovecha al máximo tu tiempo!",
            he: "השתמש בכפתור זה כדי ליצור מסלול. ארגן את הפעילויות שלך ותפיק את המרב מהזמן שלך!"
        },
        highlight: true,
        action: () => showGenerateItineraryButton()
    },
    {
        element: '#feedback-toggle-btn',
        message: {
            pt: "Clique aqui para enviar feedback sobre sua experiência no site. Sua opinião é muito importante para nós!",
            en: "Click here to submit feedback about your experience on the site. Your opinion is very important to us!",
            es: "Haz clic aquí para enviar comentarios sobre tu experiencia en el sitio. ¡Tu opinión es muy importante para nosotros!",
            he: "לחץ כאן כדי לשלוח משוב על החוויה שלך באתר. דעתך חשובה לנו מאוד!"
        },
        highlight: true,
        action: () => addFeedbackClickListener()
    },
    {
        element: null,
        message: {
            pt: "Tutorial completo! Você está pronto para explorar o Morro Digital. Se precisar de ajuda, clique no ícone de ajuda. Aproveite sua jornada!",
            en: "Tutorial complete! You are ready to explore Morro Digital. If you need help, click on the help icon. Enjoy your journey!",
            es: "¡Tutorial completo! Estás listo para explorar Morro Digital. Si necesitas ayuda, haz clic en el icono de ayuda. ¡Disfruta tu viaje!",
            he: "המדריך הושלם! אתה מוכן לחקור את מורו דיגיטל. אם אתה צריך עזרה, לחץ על סמל העזרה. תהנה מהמסע שלך!"
        }
    }
];

function showTutorialStep(step) {
    const { element, message, action, highlight } = tutorialSteps[step];
    const targetElement = element ? document.querySelector(element) : null;

    updateAssistantModalContent(`<p>${message[selectedLanguage]}</p>`);

    if (highlight && targetElement) {
        highlightElement(targetElement);
    }

    if (action) {
        action();
    }
}

function highlightElement(element) {
    const rect = element.getBoundingClientRect();
    const highlightOverlay = document.createElement('div');
    highlightOverlay.className = 'highlight-overlay';
    highlightOverlay.style.position = 'absolute';
    highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
    highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
    highlightOverlay.style.width = `${rect.width}px`;
    highlightOverlay.style.height = `${rect.height}px`;
    highlightOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    highlightOverlay.style.zIndex = '10';
    highlightOverlay.style.transition = 'background-color 0.5s ease';
    document.body.appendChild(highlightOverlay);
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

// Funções de interatividade para cada passo do tutorial
function addNextStepClickListener() {
    document.getElementById('tutorial-next-btn').addEventListener('click', nextTutorialStep, { once: true });
}

function addPrevStepClickListener() {
    document.getElementById('tutorial-prev-btn').addEventListener('click', previousTutorialStep, { once: true });
}

function addEndTutorialClickListener() {
    document.getElementById('tutorial-end-btn').addEventListener('click', endTutorial, { once: true });
}

function addMapClickListener() {
    document.getElementById('map').addEventListener('click', nextTutorialStep, { once: true });
}

function addMenuToggleClickListener() {
    document.getElementById('menu-btn').addEventListener('click', nextTutorialStep, { once: true });
}

function addFeatureClickListener(feature) {
    document.querySelector(`.menu-btn[data-feature="${feature}"]`).addEventListener('click', nextTutorialStep, { once: true });
}

function addZoomClickListener(zoomType) {
    document.querySelector(`.menu-btn.${zoomType}`).addEventListener('click', nextTutorialStep, { once: true });
}

function addLocateUserClickListener() {
    document.querySelector('.menu-btn.locate-user').addEventListener('click', nextTutorialStep, { once: true });
}

function showCreateRouteButton() {
    const createRouteBtn = document.getElementById('create-route-btn');
    createRouteBtn.style.display = 'block';
    createRouteBtn.addEventListener('click', nextTutorialStep, { once: true });
}

function showGenerateItineraryButton() {
    const generateItineraryBtn = document.getElementById('generate-itinerary-btn');
    generateItineraryBtn.style.display = 'block';
    generateItineraryBtn.addEventListener('click', nextTutorialStep, { once: true });
}

function addFeedbackClickListener() {
    document.getElementById('feedback-toggle-btn').addEventListener('click', nextTutorialStep, { once: true });
}

function blockUserInteraction() {
    document.body.classList.add('blocked');
}

function unblockUserInteraction() {
    document.body.classList.remove('blocked');
}

document.querySelector('#tutorial-next-btn').addEventListener('click', nextTutorialStep);
document.querySelector('#tutorial-prev-btn').addEventListener('click', previousTutorialStep);
document.querySelector('#tutorial-end-btn').addEventListener('click', endTutorial);

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
