document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadResources();
    activateAssistant();
    setupEventListeners();
    showWelcomeMessage();
    initializeCarousel();
    loadSearchHistory();
    checkAchievements();
    loadFavorites();
});

let currentSubMenu = null;
let currentLocation = null;
let selectedLanguage = localStorage.getItem('preferredLanguage') || 'pt';
let currentStep = 0;
let tutorialIsActive = false;
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let achievements = JSON.parse(localStorage.getItem('achievements')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function setupEventListeners() {
    const modal = document.getElementById('assistant-modal');
    const closeModal = document.querySelector('.close-btn');
    const menuToggle = document.getElementById('menu-btn');
    const floatingMenu = document.getElementById('floating-menu');
    const tutorialBtn = document.getElementById('tutorial-btn');

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    menuToggle.addEventListener('click', () => {
        floatingMenu.classList.toggle('hidden');
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'menu-toggle') {
            nextTutorialStep();
        }
    });

    document.querySelector('.menu-btn.zoom-in').addEventListener('click', () => {
        map.zoomIn();
          closeSideMenu(); // Fechar menu lateral
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'zoom-in') {
            nextTutorialStep();
        }
    });

    document.querySelector('.menu-btn.zoom-out').addEventListener('click', () => {
        map.zoomOut();
           closeSideMenu(); // Fechar menu lateral
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'zoom-out') {
            nextTutorialStep();
        }
    });

    document.querySelector('.menu-btn.locate-user').addEventListener('click', () => {
        requestLocationPermission();
           closeSideMenu(); // Fechar menu lateral
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'locate-user') {
            nextTutorialStep();
        }
    });

    document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const feature = btn.getAttribute('data-feature');
               closeSideMenu(); // Fechar menu lateral
            handleFeatureSelection(feature);
            event.stopPropagation();

            if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
                nextTutorialStep();
            }
        });
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.getAttribute('data-lang'));
            document.getElementById('welcome-modal').style.display = 'none';
        });
    });

    tutorialBtn.addEventListener('click', () => {
        if (tutorialIsActive) {
            endTutorial();
        } else {
            showTutorialStep('start-tutorial');
        }
    });

    document.getElementById('tutorial-yes-btn').addEventListener('click', startTutorial);
    document.getElementById('tutorial-no-btn').addEventListener('click', endTutorial);
    document.getElementById('tutorial-next-btn').addEventListener('click', nextTutorialStep);
    document.getElementById('tutorial-prev-btn').addEventListener('click', previousTutorialStep);
    document.getElementById('tutorial-end-btn').addEventListener('click', endTutorial);
}

function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = 0;
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('visible');
    setTimeout(() => {
        modal.style.opacity = 1;
    }, 10);
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.opacity = 0;
    setTimeout(() => {
        modal.classList.remove('visible');
    }, 300);
}

function showInfoInSidebar(title, content) {
    const sidebar = document.getElementById('menu');
    const sidebarContent = sidebar.querySelector('.sidebar-content');

    sidebarContent.innerHTML = `
        <h2>${title}</h2>
        <p>${content}</p>
    `;

    sidebar.style.display = 'block';
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.add('inactive'));
    document.querySelector(`.menu-btn[data-feature="${title.toLowerCase()}"]`).classList.remove('inactive');
    document.querySelector(`.menu-btn[data-feature="${title.toLowerCase()}"]`).classList.add('active');
    currentSubMenu = `${title.toLowerCase()}-submenu`;
}

function highlightElement(element) {
    removeExistingHighlights();

    const rect = element.getBoundingClientRect();
    const circleHighlight = document.createElement('div');
    circleHighlight.className = 'circle-highlight';
    circleHighlight.style.position = 'absolute';
    circleHighlight.style.top = `${rect.top + window.scrollY}px`;
    circleHighlight.style.left = `${rect.left + window.scrollX}px`;
    circleHighlight.style.width = `${rect.width}px`;
    circleHighlight.style.height = `${rect.height}px`;
    circleHighlight.style.border = '2px solid red';
    circleHighlight.style.borderRadius = '50%';
    circleHighlight.style.zIndex = '999';

    document.body.appendChild(circleHighlight);
}

function removeExistingHighlights() {
    document.querySelectorAll('.circle-highlight').forEach(el => el.remove());
}

function showWelcomeMessage() {
    const modal = document.getElementById('welcome-modal');
    modal.style.display = 'block';
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.style.pointerEvents = 'auto';
        document.getElementById('tutorial-overlay').style.display = 'flex';
    });
}

function setLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    selectedLanguage = lang;
    translatePageContent(lang);
    document.getElementById('welcome-modal').style.display = 'none';
    showTutorialStep('start-tutorial');
}

function translatePageContent(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = translations[lang][key];
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

function activateAssistant() {
    showWelcomeMessage();
}

function requestLocationPermission() {
    const assistantModal = document.getElementById('assistant-modal');
    assistantModal.classList.add('location-permission');

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
            assistantModal.classList.remove('location-permission');
            if (tutorialIsActive && tutorialSteps[currentStep].step === 'locate-user') {
                nextTutorialStep();
            }
        }, () => {
            console.log(translations[selectedLanguage].locationPermissionDenied);
            assistantModal.classList.remove('location-permission');
        });
    } else {
        console.log(translations[selectedLanguage].geolocationNotSupported);
        assistantModal.classList.remove('location-permission');
    }
}

function adjustMapWithLocation(lat, lon) {
    map.setView([lat, lon], 16);
    L.marker([lat, lon]).addTo(map).bindPopup("Você está aqui!").openPopup();
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
        'sobre': 'about-submenu',
        'ensino': 'education-submenu'
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
            btn.onclick = () => createRouteTo(element.lat, element.lon);
            btn.oncontextmenu = (e) => {
                e.preventDefault();
                showInfoModal(element.tags.name, element.lat, element.lon, element.id);
            };
            subMenu.appendChild(btn);

            // Adicionar carrossel de imagens
            const carousel = document.createElement('div');
            carousel.className = 'carousel';
            // Adicionar imagens fictícias para o exemplo
            for (let i = 1; i <= 3; i++) {
                const img = document.createElement('img');
                img.src = `https://via.placeholder.com/300x200?text=Imagem+${i}`;
                img.className = 'carousel-item';
                carousel.appendChild(img);
            }
            subMenu.appendChild(carousel);
        }
    });
}

function showInfoModal(name, lat, lon, osmId) {
    const infoModal = document.getElementById('info-modal');
    const modalContent = infoModal.querySelector('.modal-content');

    modalContent.innerHTML = `
        <h2>${name}</h2>
        <p>${translations[selectedLanguage][name.toLowerCase().replace(/\s+/g, '')] || `${translations[selectedLanguage].detailedInfo} ${name}`}</p>
        <button id="highlight-create-route-btn" onclick="createRouteTo(${lat}, ${lon})">${translations[selectedLanguage].createRoute}</button>
        <button id="add-to-favorites-btn" onclick="addToFavorites('${name}', ${lat}, ${lon}, ${osmId})">${translations[selectedLanguage].addToFavorites}</button>
    `;

    infoModal.style.display = 'block';
}

function createRouteTo(lat, lon) {
    const apiKey = 'SPpJlh8xSR-sOCuXeGrXPSpjGK03T4J-qVLw9twXy7s';
    if (!currentLocation) {
        console.log(translations[selectedLanguage].locationNotAvailable);
        return;
    }

    showLoadingSpinner(true);

    fetch(`https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${currentLocation.longitude},${currentLocation.latitude}&end=${lon},${lat}`)
        .then(response => response.json())
        .then(data => {
            showLoadingSpinner(false);
            const coords = data.features[0].geometry.coordinates;
            const latlngs = coords.map(coord => [coord[1], coord[0]]);
            L.polyline(latlngs, { color: 'blue' }).addTo(map);
            map.fitBounds(L.polyline(latlngs).getBounds());
        })
        .catch(error => {
            showLoadingSpinner(false);
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

const tutorialSteps = [
    {
        step: 'start-tutorial',
        message: {
            pt: "Bem-vindo ao tutorial! Deseja iniciar o tutorial?",
            en: "Welcome to the tutorial! Do you want to start the tutorial?",
            es: "¡Bienvenido al tutorial! ¿Quieres comenzar el tutorial?",
            he: "ברוך הבא למדריך! האם אתה רוצה להתחיל במדריך?"
        },
        action: () => {
            document.getElementById('tutorial-no-btn').style.display = 'inline-block';
            document.getElementById('tutorial-yes-btn').style.display = 'inline-block';
        }
    },
    {
        step: 'menu-toggle',
        element: '#menu-btn',
        message: {
            pt: "Clique aqui para abrir o menu.",
            en: "Click here to open the menu.",
            es: "Haz clic aquí para abrir el menú.",
            he: "לחץ כאן כדי לפתוח את התפריט."
        },
        action: () => {
            const element = document.querySelector('#menu-btn');
            highlightElement(element);
        }
    },
    {
        step: 'pontos-turisticos',
        element: '.menu-btn[data-feature="pontos-turisticos"]',
        message: {
            pt: "Aqui você encontra pontos turísticos.",
            en: "Here you find tourist spots.",
            es: "Aquí encuentras puntos turísticos.",
            he: "כאן תמצאו נקודות תיירות."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="pontos-turisticos"]');
            highlightElement(element);
        }
    },
    {
        step: 'passeios',
        element: '.menu-btn[data-feature="passeios"]',
        message: {
            pt: "Aqui você encontra passeios disponíveis.",
            en: "Here you find available tours.",
            es: "Aquí encuentras paseos disponibles.",
            he: "כאן תמצאו סיורים זמינים."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="passeios"]');
            highlightElement(element);
        }
    },
    {
        step: 'praias',
        element: '.menu-btn[data-feature="praias"]',
        message: {
            pt: "Aqui você encontra as praias.",
            en: "Here you find the beaches.",
            es: "Aquí encuentras las playas.",
            he: "כאן תמצאו את החופים."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="praias"]');
            highlightElement(element);
        }
    },
    {
        step: 'festas',
        element: '.menu-btn[data-feature="festas"]',
        message: {
            pt: "Aqui você encontra festas e eventos.",
            en: "Here you find parties and events.",
            es: "Aquí encuentras fiestas y eventos.",
            he: "כאן תמצאו מסיבות ואירועים."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="festas"]');
            highlightElement(element);
        }
    },
    {
        step: 'restaurantes',
        element: '.menu-btn[data-feature="restaurantes"]',
        message: {
            pt: "Aqui você encontra os restaurantes.",
            en: "Here you find the restaurants.",
            es: "Aquí encuentras los restaurantes.",
            he: "כאן תמצאו את המסעדות."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="restaurantes"]');
            highlightElement(element);
        }
    },
    {
        step: 'pousadas',
        element: '.menu-btn[data-feature="pousadas"]',
        message: {
            pt: "Aqui você encontra as pousadas.",
            en: "Here you find the inns.",
            es: "Aquí encuentras las posadas.",
            he: "כאן תמצאו את האכסניות."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="pousadas"]');
            highlightElement(element);
        }
    },
    {
        step: 'lojas',
        element: '.menu-btn[data-feature="lojas"]',
        message: {
            pt: "Aqui você encontra as lojas.",
            en: "Here you find the shops.",
            es: "Aquí encuentras las tiendas.",
            he: "כאן תמצאו את החנויות."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="lojas"]');
            highlightElement(element);
        }
    },
    {
        step: 'emergencias',
        element: '.menu-btn[data-feature="emergencias"]',
        message: {
            pt: "Aqui você encontra informações de emergência.",
            en: "Here you find emergency information.",
            es: "Aquí encuentras información de emergencia.",
            he: "כאן תמצאו מידע חירום."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="emergencias"]');
            highlightElement(element);
        }
    },
    {
        step: 'dicas',
        element: '.menu-btn[data-feature="dicas"]',
        message: {
            pt: "Aqui você encontra dicas úteis.",
            en: "Here you find useful tips.",
            es: "Aquí encuentras consejos útiles.",
            he: "כאן תמצאו טיפים שימושיים."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="dicas"]');
            highlightElement(element);
        }
    },
    {
        step: 'zoom-in',
        element: '.menu-btn.zoom-in',
        message: {
            pt: "Use este botão para dar zoom in no mapa.",
            en: "Use this button to zoom in on the map.",
            es: "Usa este botón para acercar el mapa.",
            he: "השתמש בכפתור זה כדי להתקרב למפה."
        },
        action: () => {
            const element = document.querySelector('.menu-btn.zoom-in');
            highlightElement(element);
        }
    },
    {
        step: 'zoom-out',
        element: '.menu-btn.zoom-out',
        message: {
            pt: "Use este botão para dar zoom out no mapa.",
            en: "Use this button to zoom out on the map.",
            es: "Usa este botón para alejar el mapa.",
            he: "השתמש בכפתור זה כדי להתרחק מהמפה."
        },
        action: () => {
            const element = document.querySelector('.menu-btn.zoom-out');
            highlightElement(element);
        }
    },
    {
        step: 'locate-user',
        element: '.menu-btn.locate-user',
        message: {
            pt: "Use este botão para localizar sua posição no mapa.",
            en: "Use this button to locate your position on the map.",
            es: "Usa este botón para localizar tu posición en el mapa.",
            he: "השתמש בכפתור זה כדי לאתר את המיקום שלך במפה."
        },
        action: () => {
            const element = document.querySelector('.menu-btn.locate-user');
            highlightElement(element);
        }
    },
    {
        step: 'sobre',
        element: '.menu-btn[data-feature="sobre"]',
        message: {
            pt: "Aqui você encontra informações sobre a empresa Morro Digital.",
            en: "Here you find information about the company Morro Digital.",
            es: "Aquí encuentras información sobre la empresa Morro Digital.",
            he: "כאן תמצאו מידע על חברת Morro Digital."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="sobre"]');
            highlightElement(element);
        }
    },
    {
        step: 'ensino',
        element: '.menu-btn[data-feature="ensino"]',
        message: {
            pt: "Aqui você encontra informações de ensino.",
            en: "Here you find education information.",
            es: "Aquí encuentras información educativa.",
            he: "כאן תמצאו מידע חינוכי."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="ensino"]');
            highlightElement(element);
        }
    },
    {
        step: 'end-tutorial',
        message: {
            pt: "Obrigado por seguir o tutorial! Gostaria de repetir o tutorial?",
            en: "Thank you for following the tutorial! Would you like to repeat the tutorial?",
            es: "¡Gracias por seguir el tutorial! ¿Te gustaría repetir el tutorial?",
            he: "תודה על ההשתתפות במדריך! האם תרצה לחזור על המדריך?"
        },
        action: () => {
             document.getElementById('tutorial-yes-btn').style.display = 'inline-block';
            document.getElementById('tutorial-no-btn').style.display = 'inline-block';
        }
    }
];

function showTutorialStep(step) {
    const { element, message, action } = tutorialSteps.find(s => s.step === step);
    const targetElement = element ? document.querySelector(element) : null;

    updateAssistantModalContent(`<p>${message[selectedLanguage]}</p>`);

    // Verifica se é o primeiro passo do tutorial
    if (step === 'start-tutorial') {
        // Exibe os botões "Sim" e "Não"
        document.querySelector('.control-buttons').style.display = 'block';
    } else {
        // Oculta os botões "Sim" e "Não"
        document.querySelector('.control-buttons').style.display = 'none';
    }

    if (targetElement) {
        highlightElement(targetElement);
    }

    if (action) {
        action();
    }
}

function hideAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    modal.style.display = 'none';
}


function nextTutorialStep() {
    if (currentStep < tutorialSteps.length - 1) {
        currentStep++;
        showTutorialStep(tutorialSteps[currentStep].step);
        updateProgressBar(currentStep, tutorialSteps.length);
    } else {
        endTutorial();
    }
}

function previousTutorialStep() {
    if (currentStep > 0) {
        currentStep--;
        showTutorialStep(tutorialSteps[currentStep].step);
    }
}

function startTutorial() {
    currentStep = 1;
    tutorialIsActive = true;
    showTutorialStep(tutorialSteps[currentStep].step);
    document.getElementById('tutorial-overlay').style.display = 'flex';
}

function endTutorial() {
    document.getElementById('tutorial-overlay').style.display = 'none';
    tutorialIsActive = false;
    removeExistingHighlights();
    document.querySelector('.control-buttons').style.display = 'none';
    hideAssistantModal();
}

function updateProgressBar(current, total) {
    const progressBar = document.getElementById('tutorial-progress-bar');
    progressBar.style.width = `${(current / total) * 100}%`;
}

// Funções adicionadas

function initializeCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentItemIndex = 0;

    setInterval(() => {
        carouselItems[currentItemIndex].classList.remove('active');
        currentItemIndex = (currentItemIndex + 1) % carouselItems.length;
        carouselItems[currentItemIndex].classList.add('active');
    }, 3000);
}

function addInteractiveMarker(lat, lon, message) {
    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<b>${message}</b>`).openPopup();
    marker.on('click', () => {
        showNotification('Você clicou em um marcador!', 'info');
    });
}

function loadSearchHistory() {
    const searchHistoryContainer = document.getElementById('searchResults');
    searchHistoryContainer.innerHTML = '';

    searchHistory.forEach(search => {
        const searchItem = document.createElement('div');
        searchItem.textContent = search;
        searchItem.addEventListener('click', () => {
            performSearch(search);
        });
        searchHistoryContainer.appendChild(searchItem);
    });
}

function saveSearchQuery(query) {
    searchHistory.push(query);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    loadSearchHistory();
}

function performSearch(query) {
    console.log(`Buscando por: ${query}`);
    showLoadingSpinner(true);

    setTimeout(() => {
        showLoadingSpinner(false);
        showNotification(`Resultados da busca por: ${query}`, 'info');
        saveSearchQuery(query);
    }, 2000);
}

function checkAchievements() {
    console.log('Verificando conquistas...');
    achievements.forEach(achievement => {
        showNotification(`Conquista desbloqueada: ${achievement}`, 'success');
    });
}

function addAchievement(achievement) {
    achievements.push(achievement);
    localStorage.setItem('achievements', JSON.stringify(achievements));
    checkAchievements();
}

function showLoadingSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) {
        spinner.style.display = 'block';
    } else {
        spinner.style.display = 'none';
    }
}

function addToFavorites(name, lat, lon, osmId) {
    const favorite = { name, lat, lon, osmId };
    favorites.push(favorite);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showNotification(`Adicionado aos favoritos: ${name}`, 'success');
    loadFavorites();
}

function loadFavorites() {
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = '';

    favorites.forEach(favorite => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `<b>${favorite.name}</b><br>Latitude: ${favorite.lat}<br>Longitude: ${favorite.lon}`;
        favoriteItem.onclick = () => {
            map.setView([favorite.lat, favorite.lon], 16);
        };
        favoritesContainer.appendChild(favoriteItem);
    });
}

function showRoteiroAndPrice(roteiro, totalPrice) {
    const modalContent = document.querySelector('#info-modal .modal-content');
    modalContent.innerHTML = `
        <h2>Roteiro Personalizado</h2>
        <ul>
            ${roteiro.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <p>Total: ${totalPrice}</p>
        <button onclick="purchaseRoteiro()">Comprar</button>
    `;
    showModal('info-modal');
}

function purchaseRoteiro() {
    console.log('Compra realizada com sucesso!');
    showNotification('Compra realizada com sucesso!', 'success');
    hideModal('info-modal');
}

function collectInterestData() {
    const questionnaireModal = document.getElementById('questionnaire-modal');
    questionnaireModal.style.display = 'block';
}

function generateRoteiroFromInterests(interests) {
    const roteiro = interests.map(interest => `<li>${interest}</li>`); // Exemplo simplificado de geração de roteiro com base nos interesses
    const totalPrice = interests.length * 50; // Exemplo simplificado de cálculo de preço total
    showRoteiroAndPrice(roteiro, totalPrice);
}

document.getElementById('questionnaire-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const interests = Array.from(new FormData(this).entries()).map(entry => entry[1]);
    generateRoteiroFromInterests(interests);
    hideModal('questionnaire-modal');
});

function nextQuestion() {
    console.log('Próxima pergunta');
}

function previousQuestion() {
    console.log('Pergunta anterior');
}

function closeSideMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = 'none';
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    currentSubMenu = null;
}

function showCarouselInAssistantModal(name) {
    const assistantModal = document.getElementById('assistant-modal');
    const modalContent = assistantModal.querySelector('.modal-content');

    modalContent.innerHTML = `
        <h2>${name}</h2>
        <div class="carousel">
            <img src="https://via.placeholder.com/300x200?text=Imagem+1" class="carousel-item">
            <img src="https://via.placeholder.com/300x200?text=Imagem+2" class="carousel-item">
            <img src="https://via.placeholder.com/300x200?text=Imagem+3" class="carousel-item">
        </div>
    `;

    assistantModal.style.display = 'block';

    // Inicializa o carrossel
    initializeCarousel();
}

function initializeCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentItemIndex = 0;

    setInterval(() => {
        carouselItems[currentItemIndex].classList.remove('active');
        currentItemIndex = (currentItemIndex + 1) % carouselItems.length;
        carouselItems[currentItemIndex].classList.add('active');
    }, 3000);
}

