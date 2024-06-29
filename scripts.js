document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadResources();
    activateAssistant();
    setupEventListeners();
    showWelcomeMessage();
    blockUserInteraction(); // Bloqueia a interação do usuário inicialmente
});

let currentSubMenu = null;
let currentLocation = null;
let selectedLanguage = localStorage.getItem('preferredLanguage') || 'pt';
let currentStep = 0;

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
    });

    document.querySelector('.menu-btn.zoom-in').addEventListener('click', () => map.zoomIn());
    document.querySelector('.menu-btn.zoom-out').addEventListener('click', () => map.zoomOut());
    document.querySelector('.menu-btn.locate-user').addEventListener('click', requestLocationPermission);

    document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
        btn.addEventListener('click', () => handleFeatureSelection(btn.getAttribute('data-feature')));
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.getAttribute('data-lang'));
            document.getElementById('welcome-modal').style.display = 'none'; // Esconde o modal de boas-vindas
            
        });
    });

    tutorialBtn.addEventListener('click', () => {
        startTutorial();
        document.getElementById('end-tutorial-message').style.display = 'none';
        document.querySelector('.circle-highlight').style.display = 'none';
        unblockUserInteraction(); // Desbloqueia a interação do usuário após a seleção do idioma
    });

    document.getElementById('tutorial-yes-btn').addEventListener('click', startTutorial);
    document.getElementById('tutorial-no-btn').addEventListener('click', endTutorial);
    document.getElementById('tutorial-next-btn').addEventListener('click', nextTutorialStep); // Evento para o botão "Próximo"
    document.getElementById('tutorial-prev-btn').addEventListener('click', previousTutorialStep);
    document.getElementById('tutorial-end-btn').addEventListener('click', endTutorial);
}

function blockUserInteraction() {
    document.body.classList.add('blocked');
    document.getElementById('tutorial-btn').style.pointerEvents = 'auto';
}

function unblockUserInteraction() {
    document.body.classList.remove('blocked');
}

function showEndTutorialMessage() {
    const sobreButton = document.querySelector('.menu-btn[data-feature="sobre"]');
    const endMessage = document.createElement('div');
    
    endMessage.id = 'end-tutorial-message';
    endMessage.innerHTML = `
        <p>Clique neste botão para abrir o Tutorial novamente</p>
        <span class="close-btn">&times;</span>
    `;
    
    document.body.appendChild(endMessage);

    positionMessage(endMessage, sobreButton);
    createCircleHighlight(sobreButton);

    endMessage.querySelector('.close-btn').addEventListener('click', () => {
        endMessage.style.display = 'none';
        document.querySelector('.circle-highlight').style.display = 'none';
        unblockUserInteraction();
    });

    // Reposiciona a mensagem e o círculo ao redimensionar a janela
    window.addEventListener('resize', () => {
        positionMessage(endMessage, sobreButton);
        positionCircleHighlight(sobreButton);
    });
}

function positionMessage(messageElement, targetElement) {
    const rect = targetElement.getBoundingClientRect();
    messageElement.style.left = `${rect.left - messageElement.offsetWidth - 10}px`;
    messageElement.style.top = `${rect.top}px`;
}

function createCircleHighlight(targetElement) {
    const circleHighlight = document.createElement('div');
    circleHighlight.className = 'circle-highlight';
    document.body.appendChild(circleHighlight);
    positionCircleHighlight(targetElement);
}

function positionCircleHighlight(targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const circleHighlight = document.querySelector('.circle-highlight');
    circleHighlight.style.width = `${rect.width}px`;
    circleHighlight.style.height = `${rect.height}px`;
    circleHighlight.style.left = `${rect.left + window.scrollX}px`;
    circleHighlight.style.top = `${rect.top + window.scrollY}px`;
}

function endTutorial() {
    const assistantModal = document.getElementById('assistant-modal');
    const controlButtons = document.querySelector('.control-buttons');
    const sobreButton = document.querySelector('.menu-btn[data-feature="sobre"]');

    // Esconde o modal com animação
    assistantModal.style.transition = 'all 1s ease';
    assistantModal.style.transform = 'translate(' + (sobreButton.getBoundingClientRect().left - assistantModal.getBoundingClientRect().left) + 'px, ' + (sobreButton.getBoundingClientRect().top - assistantModal.getBoundingClientRect().top) + 'px)';
    assistantModal.style.opacity = '0';
    
    // Esconde os botões de controle
    controlButtons.style.opacity = '0';
    controlButtons.style.transition = 'opacity 1s ease';

    setTimeout(() => {
        assistantModal.style.display = 'none';
        controlButtons.style.display = 'none';
        showEndTutorialMessage();
    }, 1000); // Tempo igual à duração da transição
}


function blockUserInteraction() {
    document.body.classList.add('blocked');
    document.getElementById('tutorial-btn').style.pointerEvents = 'auto';
}

function unblockUserInteraction() {
    document.body.classList.remove('blocked');
}

function showEndTutorialMessage() {
    const sobreButton = document.querySelector('.menu-btn[data-feature="sobre"]');
    const endMessage = document.createElement('div');
    
    endMessage.id = 'end-tutorial-message';
    endMessage.innerHTML = `
        <p>Clique neste botão para abrir o Tutorial novamente</p>
        <span class="close-btn">&times;</span>
    `;
    
    document.body.appendChild(endMessage);

    positionMessage(endMessage, sobreButton);
    createCircleHighlight(sobreButton);

    endMessage.querySelector('.close-btn').addEventListener('click', () => {
        endMessage.style.display = 'none';
        document.querySelector('.circle-highlight').style.display = 'none';
        unblockUserInteraction();
    });

    // Reposiciona a mensagem e o círculo ao redimensionar a janela
    window.addEventListener('resize', () => {
        positionMessage(endMessage, sobreButton);
        positionCircleHighlight(sobreButton);
    });
}

function positionMessage(messageElement, targetElement) {
    const rect = targetElement.getBoundingClientRect();
    messageElement.style.left = `${rect.left - messageElement.offsetWidth - 10}px`;
    messageElement.style.top = `${rect.top}px`;
}

function createCircleHighlight(targetElement) {
    const circleHighlight = document.createElement('div');
    circleHighlight.className = 'circle-highlight';
    document.body.appendChild(circleHighlight);
    positionCircleHighlight(targetElement);
}

function positionCircleHighlight(targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const circleHighlight = document.querySelector('.circle-highlight');
    circleHighlight.style.width = `${rect.width}px`;
    circleHighlight.style.height = `${rect.height}px`;
    circleHighlight.style.left = `${rect.left + window.scrollX}px`;
    circleHighlight.style.top = `${rect.top + window.scrollY}px`;
}

function endTutorial() {
    const assistantModal = document.getElementById('assistant-modal');
    const controlButtons = document.querySelector('.control-buttons');
    const sobreButton = document.querySelector('.menu-btn[data-feature="sobre"]');

    // Esconde o modal com animação
    assistantModal.style.transition = 'all 1s ease';
    assistantModal.style.transform = 'translate(' + (sobreButton.getBoundingClientRect().left - assistantModal.getBoundingClientRect().left) + 'px, ' + (sobreButton.getBoundingClientRect().top - assistantModal.getBoundingClientRect().top) + 'px)';
    assistantModal.style.opacity = '0';
    
    // Esconde os botões de controle
    controlButtons.style.opacity = '0';
    controlButtons.style.transition = 'opacity 1s ease';

    setTimeout(() => {
        assistantModal.style.display = 'none';
        controlButtons.style.display = 'none';
        showEndTutorialMessage();
    }, 1000); // Tempo igual à duração da transição
}


function closeBlockedOverlay() {
    const overlay = document.getElementById('blocked-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    unblockUserInteraction();
}

function showWelcomeMessage() {
    const modal = document.getElementById('welcome-modal');
    modal.style.display = 'block';
    // Mantém os botões de idioma clicáveis
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.style.pointerEvents = 'auto';
    });
}

function blockUserInteraction() {
    document.body.classList.add('blocked');
}

function unblockUserInteraction() {
    document.body.classList.remove('blocked');
}

function setLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    selectedLanguage = lang;
    translatePageContent(lang);
    unblockUserInteraction(); // Desbloqueia a interação do usuário após a seleção do idioma
    document.getElementById('welcome-modal').style.display = 'none'; // Esconde o modal de boas-vindas
    startTutorial(); // Inicia o tutorial após a seleção do idioma
}

function translatePageContent(lang) {
    // Função para traduzir o conteúdo da página
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
    blockUserInteraction();
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
            unblockUserInteraction();
            assistantModal.classList.remove('location-permission');
            nextTutorialStep();
            showLocationMessage();
        }, () => {
            console.log(translations[selectedLanguage].locationPermissionDenied);
            unblockUserInteraction();
            assistantModal.classList.remove('location-permission');
        });
    } else {
        console.log(translations[selectedLanguage].geolocationNotSupported);
        unblockUserInteraction();
        assistantModal.classList.remove('location-permission');
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

const tutorialSteps = [
    {
        element: null,
        message: {
            pt: "Seja Bem Vindo ao Morro de São Paulo Digital! Eu me chamo 'Sol' e sou a inteligência artificial da Morro Digital desenvolvida para te ajudar a explorar as maravilhas de Morro de São Paulo! Deseja que eu te ensine a como usar todas as funcionalidades do site?",
            en: "Welcome to Morro de São Paulo Digital! My name is 'Sol' and I am the artificial intelligence of Morro Digital developed to help you explore the wonders of Morro de São Paulo! Would you like me to teach you how to use all the site's features?",
            es: "¡Bienvenidos a Morro de São Paulo Digital! Mi nombre es 'Sol' y soy la inteligencia artificial de Morro Digital desarrollada para ayudarte a explorar las maravillas de Morro de São Paulo! ¿Te gustaría que te enseñe a usar todas las funciones del sitio?",
            he: "ברוכים הבאים למורו דיגיטל! שמי 'סול' ואני הבינה המלאכותית של מורו דיגיטל שנוצרה כדי לעזור לך לחקור את נפלאות מורו דה סאו פאולו! האם תרצה שאלמד אותך כיצד להשתמש בכל הפונקציות באתר?"
        },
        action: () => {
            document.getElementById('tutorial-yes-btn').style.display = 'inline-block';
            document.getElementById('tutorial-no-btn').style.display = 'inline-block';
        }
    },
    {
        step: 1,
        element: '#tutorial-next-btn',
        message: {
            pt: "Este é o botão 'Próximo'. Clique aqui para ir para o próximo passo do tutorial. Vamos tentar juntos, clique no botão!",
            en: "This is the 'Next' button. Click here to go to the next step of the tutorial. Let's try it together, click the button!",
            es: "Este es el botón 'Siguiente'. Haz clic aquí para ir al siguiente paso del tutorial. ¡Intentémoslo juntos, haz clic en el botón!",
            he: "זהו כפתור 'הבא'. לחץ כאן כדי לעבור לשלב הבא של המדריך. בוא ננסה יחד, לחץ על הכפתור!"
        },
        highlight: true,
        action: () => {
            document.getElementById('tutorial-yes-btn').style.display = 'none';
            document.getElementById('tutorial-no-btn').style.display = 'none';
            document.getElementById('tutorial-next-btn').style.display = 'inline-block';
            addNextStepClickListener();
        }
    },
    {
        step: 2,
        element: '#tutorial-prev-btn',
        message: {
            pt: "Este é o botão 'Voltar'. Clique aqui para retornar ao passo anterior do tutorial. Vamos tentar, clique no botão!",
            en: "This is the 'Back' button. Click here to go back to the previous step of the tutorial. Let's try it, click the button!",
            es: "Este es el botón 'Atrás'. Haz clic aquí para volver al paso anterior del tutorial. ¡Intentémoslo, haz clic en el botón!",
            he: "זהו כפתור 'חזור'. לחץ כאן כדי לחזור לשלב הקודם של המדריך. בוא ננסה, לחץ על הכפתור!"
        },
        highlight: true,
        action: () => {
            document.getElementById('tutorial-next-btn').style.display = 'inline-block';
            document.getElementById('tutorial-prev-btn').style.display = 'inline-block';
            addPrevStepClickListener();
        }
    },
    {
        step: 3,
        element: '#tutorial-end-btn',
        message: {
            pt: "Este é o botão 'Encerrar Tutorial'. Clique aqui se você quiser encerrar o tutorial a qualquer momento. Vamos tentar, clique no botão!",
            en: "This is the 'End Tutorial' button. Click here if you want to end the tutorial at any time. Let's try it, click the button!",
            es: "Este es el botón 'Finalizar Tutorial'. Haz clic aquí si deseas finalizar el tutorial en cualquier momento. ¡Intentémoslo, haz clic en el botón!",
            he: "זהו כפתור 'סיום מדריך'. לחץ כאן אם ברצונך לסיים את המדריך בכל עת. בוא ננסה, לחץ על הכפתור!"
        },
        highlight: true,
        action: () => {
            document.getElementById('tutorial-next-btn').style.display = 'inline-block';
            document.getElementById('tutorial-prev-btn').style.display = 'inline-block';
            document.getElementById('tutorial-end-btn').style.display = 'inline-block';
            addEndTutorialClickListener();
        }
    },
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
    highlightOverlay.style.zIndex = '9';
    highlightOverlay.style.transition = 'background-color 0.5s ease';
    document.body.appendChild(highlightOverlay);
}

function nextTutorialStep() {
    if (currentStep < tutorialSteps.length) {
        currentStep++;
        showTutorialStep(currentStep);
        updateProgressBar(currentStep, tutorialSteps.length);
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
    currentStep = 1;
    showTutorialStep(currentStep);
}

function unblockUserInteraction() {
    document.body.classList.remove('blocked');
}

function endTutorial() {
    const assistantModal = document.getElementById('assistant-modal');
    const controlButtons = document.querySelector('.control-buttons');
    const sobreButton = document.querySelector('.menu-btn[data-feature="sobre"]');
    closeBlockedOverlay(); // Garante que a sobreposição de bloqueio seja fechada

    // Esconde o modal com animação
    assistantModal.style.transition = 'all 1s ease';
    assistantModal.style.transform = 'translate(' + (sobreButton.getBoundingClientRect().left - assistantModal.getBoundingClientRect().left) + 'px, ' + (sobreButton.getBoundingClientRect().top - assistantModal.getBoundingClientRect().top) + 'px)';
    assistantModal.style.opacity = '0';
    
    // Esconde os botões de controle
    controlButtons.style.opacity = '0';
    controlButtons.style.transition = 'opacity 1s ease';

    setTimeout(() => {
        assistantModal.style.display = 'none';
        controlButtons.style.display = 'none';
        showEndTutorialMessage();
        unblockUserInteraction(); // Desbloqueia a interação do usuário
    }, 1000); // Tempo igual à duração da transição
}

function showEndTutorialMessage() {
    const sobreButton = document.querySelector('.menu-btn[data-feature="sobre"]');
    const endMessage = document.createElement('div');
    
    endMessage.id = 'end-tutorial-message';
    endMessage.innerHTML = `
        <p>Clique neste botão para abrir o Tutorial novamente</p>
        <div class="circle-highlight"></div>
    `;
    
    document.body.appendChild(endMessage);
    
    const circleHighlight = endMessage.querySelector('.circle-highlight');
    const rect = sobreButton.getBoundingClientRect();
    
    circleHighlight.style.position = 'absolute';
    circleHighlight.style.border = '2px solid red';
    circleHighlight.style.borderRadius = '50%';
    circleHighlight.style.width = rect.width + 'px';
    circleHighlight.style.height = rect.height + 'px';
    circleHighlight.style.left = rect.left + 'px';
    circleHighlight.style.top = rect.top + 'px';
}

function addNextStepClickListener() {
    document.getElementById('tutorial-next-btn').addEventListener('click', nextTutorialStep, { once: true });
}

function addPrevStepClickListener() {
    document.getElementById('tutorial-prev-btn').addEventListener('click', previousTutorialStep, { once: true });
}

function addEndTutorialClickListener() {
    document.getElementById('tutorial-end-btn').addEventListener('click', endTutorial, { once: true });
}

document.querySelector('#tutorial-next-btn').addEventListener('click', nextTutorialStep);
document.querySelector('#tutorial-prev-btn').addEventListener('click', previousTutorialStep);
document.querySelector('#tutorial-end-btn').addEventListener('click', endTutorial);

document.getElementById('map').addEventListener('click', () => { if (currentStep === 2) nextTutorialStep(); });

document.querySelector('.menu-btn[data-feature="pontos-turisticos"]').addEventListener('click', () => { if (currentStep === 3) nextTutorialStep(); });

function startTutorial() {
    currentStep = 1;
    document.getElementById('tutorial-yes-btn').style.display = 'none';
    document.getElementById('tutorial-no-btn').style.display = 'none';
    document.getElementById('tutorial-next-btn').style.display = 'inline-block';
    showTutorialStep(currentStep);
}

function showEndTutorialMessage() {
    const sobreButton = document.querySelector('.menu-btn[data-feature="sobre"]');
    const endMessage = document.createElement('div');
    
    endMessage.id = 'end-tutorial-message';
    endMessage.innerHTML = `
        <p>Clique neste botão para abrir o Tutorial novamente</p>
        <div class="circle-highlight"></div>
        <button class="close-btn">&times;</button>
    `;
    
    document.body.appendChild(endMessage);
    
    const circleHighlight = endMessage.querySelector('.circle-highlight');
    const rect = sobreButton.getBoundingClientRect();
    
    // Ajustando a posição da mensagem ao lado do botão "Sobre"
    endMessage.style.position = 'absolute';
    endMessage.style.bottom = '20%';
    endMessage.style.left = `${rect.left + window.scrollX}px`;
    
    // Ajustando a posição do círculo de destaque
    circleHighlight.style.position = 'absolute';
    circleHighlight.style.border = '2px solid red';
    circleHighlight.style.borderRadius = '50%';
    circleHighlight.style.width = '32px';
    circleHighlight.style.height = '32px';
    circleHighlight.style.left = '42%';
    circleHighlight.style.top = '50%';
    circleHighlight.style.transform = 'translateY(-50%)';
    circleHighlight.style.background = 'white';
    
    const closeButton = endMessage.querySelector('.close-btn');
    closeButton.addEventListener('click', () => {
        endMessage.style.display = 'none';
    });
}

function endTutorial() {
    const assistantModal = document.getElementById('assistant-modal');
    const controlButtons = document.querySelector('.control-buttons');
    const sobreButton = document.querySelector('.menu-btn[data-feature="sobre"]');

    // Esconde o modal com animação
    assistantModal.style.transition = 'all 1s ease';
    assistantModal.style.transform = 'translate(' + (sobreButton.getBoundingClientRect().left - assistantModal.getBoundingClientRect().left) + 'px, ' + (sobreButton.getBoundingClientRect().top - assistantModal.getBoundingClientRect().top) + 'px)';
    assistantModal.style.opacity = '0';
    
    // Esconde os botões de controle
    controlButtons.style.opacity = '0';
    controlButtons.style.transition = 'opacity 1s ease';

    setTimeout(() => {
        assistantModal.style.display = 'none';
        controlButtons.style.display = 'none';
        showEndTutorialMessage();
    }, 1000); // Tempo igual à duração da transição
}

function showEndTutorialMessage() {
    const sobreButton = document.querySelector('.menu-btn[data-feature="sobre"]');
    const endMessage = document.createElement('div');
    
    endMessage.id = 'end-tutorial-message';
    endMessage.innerHTML = `
        <p>Clique neste botão para abrir o Tutorial novamente</p>
        <span class="close-btn">&times;</span>
    `;
    
    document.body.appendChild(endMessage);

    positionMessage(endMessage, sobreButton);
    createCircleHighlight(sobreButton);

    endMessage.querySelector('.close-btn').addEventListener('click', () => {
        endMessage.style.display = 'none';
        document.querySelector('.circle-highlight').style.display = 'none';
    });

    // Reposiciona a mensagem e o círculo ao redimensionar a janela
    window.addEventListener('resize', () => {
        positionMessage(endMessage, sobreButton);
        positionCircleHighlight(sobreButton);
    });
}

function positionMessage(messageElement, targetElement) {
    const rect = targetElement.getBoundingClientRect();
    messageElement.style.left = `${rect.left - messageElement.offsetWidth - 10}px`;
    messageElement.style.top = `${rect.top}px`;
}

function createCircleHighlight(targetElement) {
    const circleHighlight = document.createElement('div');
    circleHighlight.className = 'circle-highlight';
    document.body.appendChild(circleHighlight);
    positionCircleHighlight(targetElement);
}

function positionCircleHighlight(targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const circleHighlight = document.querySelector('.circle-highlight');
    circleHighlight.style.width = `${rect.width}px`;
    circleHighlight.style.height = `${rect.height}px`;
    circleHighlight.style.left = `${rect.left + window.scrollX}px`;
    circleHighlight.style.top = `${rect.top + window.scrollY}px`;
}
