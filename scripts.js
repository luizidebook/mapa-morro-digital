let map;
let currentLocation;
let routingControl;
let tutorialStep = 0;
let selectedLanguage = 'pt';

// Passos do tutorial em diferentes idiomas
const tutorialSteps = {
    pt: [
        'Bem-vindo ao Morro Digital! Este tutorial irá guiá-lo através das funcionalidades do site.',
        'Primeiro, veja o mapa interativo que mostra sua localização atual e permite explorar a área ao redor.',
        'Use o botão ☰ Menu para abrir e fechar o menu.',
        'No menu, você pode acessar informações sobre História de Morro, Pontos Turísticos, Passeios, Praias, Vida Noturna, Restaurantes, Pousadas.',
        'Clique em qualquer item do menu para obter mais informações na caixa de mensagens.',
        'Você pode planejar sua viagem utilizando o botão 📅 Planejar Viagem.'
    ],
    en: [
        'Welcome to Morro Digital! This tutorial will guide you through the site features.',
        'First, see the interactive map that shows your current location and allows you to explore the surrounding area.',
        'Use the ☰ Menu button to open and close the menu.',
        'In the menu, you can access information about the History of Morro, Tourist Spots, Tours, Beaches, Nightlife, Restaurants, Inns.',
        'Click on any menu item to get more information in the message box.',
        'You can plan your trip using the 📅 Plan Trip button.'
    ],
    es: [
        '¡Bienvenido a Morro Digital! Este tutorial le guiará a través de las funciones del sitio.',
        'Primero, vea el mapa interactivo que muestra su ubicación actual y le permite explorar el área circundante.',
        'Use el botón ☰ Menú para abrir y cerrar el menú.',
        'En el menú, puede acceder a información sobre la Historia de Morro, Lugares Turísticos, Excursiones, Playas, Vida Nocturna, Restaurantes, Posadas.',
        'Haga clic en cualquier elemento del menú para obtener más información en la caja de mensajes.',
        'Puede planear su viaje utilizando el botón 📅 Planear Viaje.'
    ],
    he: [
        'ברוך הבא ל-Morro Digital! מדריך זה ידריך אותך בתכונות האתר.',
        'ראשית, ראה את המפה האינטראקטיבית שמראה את המיקום הנוכחי שלך ומאפשרת לך לחקור את האזור שמסביב.',
        'השתמש בכפתור ☰ Menu לפתיחת וסגירת התפריט.',
        'בתפריט, תוכל לגשת למידע על ההיסטוריה של מורו, מקומות תיירותיים, סיורים, חופים, חיי לילה, מסעדות, בתי מלון.',
        'לחץ על כל פריט בתפריט כדי לקבל מידע נוסף בתיבת ההודעות.',
        'אתה יכול לתכנן את הטיול שלך באמצעות כפתור 📅 תכנון טיול.'
    ]
};

// Tradução dos textos
const translations = {
    en: {
        'Bem-vindo ao Morro Digital!': 'Welcome to Morro Digital!',
        'Selecione um idioma:': 'Select a language:',
        'Permissão de Localização': 'Location Permission',
        'Precisamos de sua permissão para acessar sua localização:': 'We need your permission to access your location:',
        'Permissão de Microfone': 'Microphone Permission',
        'Precisamos de sua permissão para acessar seu microfone:': 'We need your permission to access your microphone:',
        'História de Morro de São Paulo': 'History of Morro de São Paulo',
        'Conheça a rica história de Morro de São Paulo, uma ilha cheia de cultura e tradições...': 'Learn about the rich history of Morro de São Paulo, an island full of culture and traditions...',
        'Fundada no século XVI, Morro de São Paulo tem uma história fascinante que inclui invasões de piratas, construções coloniais e muito mais.': 'Founded in the 16th century, Morro de São Paulo has a fascinating history that includes pirate invasions, colonial buildings, and much more.'
    },
    es: {
        'Bem-vindo ao Morro Digital!': '¡Bienvenido a Morro Digital!',
        'Selecione um idioma:': 'Seleccione un idioma:',
        'Permissão de Localização': 'Permiso de Ubicación',
        'Precisamos de sua permissão para acessar sua localização:': 'Necesitamos su permiso para acceder a su ubicación:',
        'Permissão de Microfone': 'Permiso de Micrófono',
        'Precisamos de sua permissão para acessar seu microfone:': 'Necesitamos su permiso para acceder a su micrófono:',
        'História de Morro de São Paulo': 'Historia de Morro de São Paulo',
        'Conheça a rica história de Morro de São Paulo, uma ilha llena de cultura y tradiciones...': 'Conozca la rica historia de Morro de São Paulo, una isla llena de cultura y tradiciones...',
        'Fundada no século XVI, Morro de São Paulo tem uma história fascinante que inclui invasiones de piratas, construcciones coloniales y mucho más.': 'Fundada en el siglo XVI, Morro de São Paulo tiene una historia fascinante que incluye invasiones de piratas, construcciones coloniales y mucho más.'
    },
    he: {
        'Bem-vindo ao Morro Digital!': 'ברוך הבא ל-Morro Digital!',
        'Selecione um idioma:': 'בחר שפה:',
        'Permissão de Localização': 'הרשאת מיקום',
        'Precisamos de sua permissão para acessar sua localização:': 'אנו זקוקים להרשאתך כדי לגשת למיקומך:',
        'Permissão de Microfone': 'הרשאת מיקרופון',
        'Precisamos de sua permissão para acessar seu microfone:': 'אנו זקוקים להרשאתך כדי לגשת למיקרופון שלך:',
        'História de Morro de São Paulo': 'ההיסטוריה של מורו דה סאו פאולו',
        'Conheça a rica história de Morro de São Paulo, uma ilha cheia de cultura e tradições...': 'למד על ההיסטוריה העשירה של מורו דה סאו פאולו, אי מלא בתרבות ומסורות...',
        'Fundada no século XVI, Morro de São Paulo tem uma história fascinante que inclui פלישות פיראטים, מבנים קולוניאליים והרבה יותר.': 'נוסדה במאה ה-16, למורו דה סאו פאולו יש היסטוריה מרתקת הכוללת פלישות פיראטים, מבנים קולוניאליים והרבה יותר.'
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
        openModal('microphone-permission-modal');
    }, error => {
        alert('Não foi possível obter sua localização.');
    });
}

// Função para solicitar permissão de microfone
function requestMicrophonePermission() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = selectedLanguage === 'pt' ? 'pt-BR' : selectedLanguage;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = function() {
            closeModal('microphone-permission-modal');
            alert('Permissão de microfone concedida.');
            startTutorial();
        };

        recognition.onerror = function(event) {
            if (event.error === 'not-allowed') {
                alert('Permissão de microfone negada.');
            }
        };

        recognition.onend = function() {
            console.log('Reconhecimento de voz encerrado.');
        };

        recognition.start();
    } else {
        alert('API de reconhecimento de voz não suportada neste navegador.');
    }
}

// Inicializa o mapa com a localização do usuário
function initializeMap() {
    map = L.map('map').setView([-13.370273, -38.907545], 15); // Coordenadas de Morro de São Paulo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([-13.370273, -38.907545]).addTo(map)
        .bindPopup('Morro de São Paulo')
        .openPopup();

    document.getElementById('loading-indicator').style.display = 'none';
}

// Inicia o tutorial interativo
function startTutorial() {
    tutorialStep = 0;
    nextTutorialStep();
}

// Mostra o próximo passo do tutorial
function nextTutorialStep() {
    const messageBox = document.getElementById('message-box');
    if (tutorialStep < tutorialSteps[selectedLanguage].length) {
        messageBox.innerHTML = `<p>${tutorialSteps[selectedLanguage][tutorialStep]}</p><button onclick="nextTutorialStep()">Próximo</button>`;
        speakText(tutorialSteps[selectedLanguage][tutorialStep]);
        messageBox.style.display = 'block';
        tutorialStep++;
    } else {
        messageBox.style.display = 'none';
    }
}

// Fecha o tutorial
function closeTutorial() {
    const messageBox = document.getElementById('message-box');
    messageBox.style.display = 'none';
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

// Função para exibir o submenu e carregar dados da OSM
function loadSubMenu(subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.style.display = 'block';

    const queries = {
        pontosTuristicosSubMenu: '[out:json];node["tourism"="attraction"](around:10000,-13.370273,-38.907545);out body;',
        passeiosSubMenu: '[out:json];node["tourism"="information"](around:10000,-13.370273,-38.907545);out body;',
        praiasSubMenu: '[out:json];node["natural"="beach"](around:10000,-13.370273,-38.907545);out body;',
        vidaNoturnaSubMenu: '[out:json];node["amenity"="nightclub"](around:10000,-13.370273,-38.907545);out body;',
        restaurantesSubMenu: '[out:json];node["amenity"="restaurant"](around:10000,-13.370273,-38.907545);out body;',
        pousadasSubMenu: '[out:json];node["tourism"="hotel"](around:10000,-13.370273,-38.907545);out body;'
    };

    fetchOSMData(queries[subMenuId]).then(data => displayOSMData(data, subMenuId));
}

// Busca dados da OpenStreetMap
async function fetchOSMData(query) {
    const url = `https://overpass-api.de/api/interpreter?data=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Exibe os dados da OpenStreetMap
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
            serviceUrl: 'https://api.openrouteservice.org/v2/directions/foot-walking',
            profile: 'foot-walking',
            apiKey: '0XAI_Tzc3xqUoaaU_n7QYPgHAgd7bTSyuszQ2YjXSWQ'
        }),
        geocoder: L.Control.Geocoder.nominatim(),
        createMarker: function() { return null; },
        routeWhileDragging: true,
        lineOptions: {
            styles: [{ color: 'blue', opacity: 1, weight: 5 }]
        }
    }).addTo(map);
}

// Função para alternar a visibilidade do menu
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Função para alternar a visibilidade dos submenus
function toggleSubMenu(subMenuId) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.style.display = subMenu.style.display === 'none' ? 'block' : 'none';
}

// Função para alternar a visibilidade da caixa de pesquisa
function toggleSearch() {
    const searchBox = document.getElementById('search-box');
    searchBox.style.display = searchBox.style.display === 'none' ? 'block' : 'none';
}

// Função para buscar locais no mapa
function searchMap() {
    const query = document.getElementById('search-input').value;
    if (!query) {
        alert('Por favor, insira um termo de pesquisa.');
        return;
    }

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
        })
        .catch(error => {
            console.error('Erro na busca:', error);
            alert('Erro ao buscar locais. Tente novamente mais tarde.');
        });
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
            alert('Erro no reconhecimento de voz. Tente novamente.');
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

// Função para exibir e ocultar modais
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Inicializa o mapa e mostra o modal de boas-vindas ao carregar a página
window.addEventListener('load', () => {
    openModal('welcome-modal');
});

// Dados de perguntas e respostas para o planejamento de viagens
const questions = [
    "Qual é o seu nome?",
    "De onde você é? (Estado e cidade)",
    "É a primeira vez que visita o Morro de São Paulo?",
    "Quais atividades já realizou em Morro desde que chegou?",
    "Já visitou ou conhece a famosa Toca do Morcego?",
    "Quais pontos turísticos já visitou?",
    "Quais praias já conheceu?",
    "Já realizou algum passeio em Morro? Se sim, qual?",
    "Já foi a alguma festa em Morro? Quais as opções de festas disponíveis são mais do seu agrado?",
    "Qual o tipo de gastronomia tem mais interesse em experimentar?",
    "Tem preferência por local próximo à vila ou às praias?",
    "Atualmente, qual é o valor que você tem disponível para utilizar?",
    "Quantos dias pretende ficar em Morro de São Paulo?",
    "Prefere atividades mais tranquilas ou mais aventureiras?"
];

// Função para gerar o roteiro personalizado com base nas respostas do usuário
function generateItinerary(answers) {
    const [name, location, firstTime, activities, morcego, points, beaches, tour, party, cuisine, proximity, budget, days, preference] = answers;
    const totalDays = parseInt(days) || 3;

    const itinerary = {
        name: name,
        days: totalDays,
        activities: []
    };

    for (let i = 1; i <= totalDays; i++) {
        const dayPlan = { day: i, activities: [] };

        if (i === 1) {
            if (firstTime.toLowerCase() === 'sim') {
                dayPlan.activities.push("Visita à Toca do Morcego", "Passeio pelas praias principais");
            } else {
                dayPlan.activities.push("Passeio por pontos turísticos menos conhecidos", "Exploração das praias alternativas");
            }
        } else if (i === totalDays) {
            if (budget && parseInt(budget) > 1000) {
                dayPlan.activities.push("Passeio de barco pelas ilhas próximas", "Visita a uma pousada de luxo");
            } else {
                dayPlan.activities.push("Passeio de barco econômico", "Exploração de atrações gratuitas");
            }
        } else {
            if (party.toLowerCase() === 'sim') {
                dayPlan.activities.push("Festa noturna em Morro", "Jantar em um restaurante de gastronomia local");
            } else {
                dayPlan.activities.push("Tour histórico pelo centro de Morro de São Paulo", "Jantar em um restaurante de gastronomia local");
            }
        }

        if (preference.toLowerCase() === 'tranquilas') {
            dayPlan.activities.push("Visita a um spa", "Caminhada tranquila pela praia");
        } else {
            dayPlan.activities.push("Aventura de tirolesa", "Mergulho nas praias");
        }

        itinerary.activities.push(dayPlan);
    }

    return itinerary;
}

// Função para exibir o roteiro personalizado
function displayItinerary(itinerary) {
    const itineraryContent = document.getElementById('itinerary-content');
    itineraryContent.innerHTML = `<h2>Roteiro de ${itinerary.days} Dias para ${itinerary.name}</h2>`;

    itinerary.activities.forEach(dayPlan => {
        const dayDiv = document.createElement('div');
        dayDiv.innerHTML = `<h3>Dia ${dayPlan.day}</h3>`;
        dayPlan.activities.forEach(activity => {
            const activityItem = document.createElement('p');
            activityItem.textContent = activity;
            dayDiv.appendChild(activityItem);
        });
        itineraryContent.appendChild(dayDiv);
    });

    document.getElementById('itinerary-box').style.display = 'block';

    // Solicitar feedback após exibir o roteiro
    setTimeout(requestItineraryFeedback, 1000);
}

// Função para solicitar feedback do usuário sobre o roteiro
function requestItineraryFeedback() {
    const feedbackBox = document.getElementById('feedback-box');
    feedbackBox.innerHTML = `
        <h2>Feedback do Roteiro</h2>
        <p>O que você achou do roteiro?</p>
        <textarea id="feedback-input" rows="4" cols="50"></textarea>
        <button onclick="submitFeedback()">Enviar Feedback</button>
    `;
    feedbackBox.style.display = 'block';
}

// Função para enviar o feedback do usuário
function submitFeedback() {
    const feedbackInput = document.getElementById('feedback-input').value.trim();
    if (feedbackInput) {
        console.log('Feedback recebido:', feedbackInput);
        alert('Obrigado pelo seu feedback!');
        document.getElementById('feedback-box').style.display = 'none';
        adjustItinerary(feedbackInput);
    } else {
        alert('Por favor, insira seu feedback.');
    }
}

// Função para ajustar o roteiro com base no feedback do usuário
function adjustItinerary(feedback) {
    console.log('Ajustando o roteiro com base no feedback:', feedback);
    if (feedback.toLowerCase().includes('mais tempo na praia')) {
        itinerary.activities.forEach(dayPlan => {
            dayPlan.activities.push("Mais tempo de lazer na praia");
        });
    } else if (feedback.toLowerCase().includes('menos caminhadas')) {
        itinerary.activities.forEach(dayPlan => {
            dayPlan.activities = dayPlan.activities.filter(activity => !activity.toLowerCase().includes('caminhada'));
        });
    } else if (feedback.toLowerCase().includes('mais atividades culturais')) {
        itinerary.activities.forEach(dayPlan => {
            dayPlan.activities.push("Visita a museus e centros culturais");
        });
    } else if (feedback.toLowerCase().includes('mais aventura')) {
        itinerary.activities.forEach(dayPlan => {
            dayPlan.activities.push("Atividades de aventura, como trilhas e tirolesa");
        });
    }

    // Reexibir o roteiro ajustado
    displayItinerary(itinerary);
}

// Função para exibir o roteiro personalizado
function displayItinerary(itinerary) {
    const itineraryContent = document.getElementById('itinerary-content');
    itineraryContent.innerHTML = `<h2>Roteiro de ${itinerary.days} Dias para ${itinerary.name}</h2>`;

    itinerary.activities.forEach(dayPlan => {
        const dayDiv = document.createElement('div');
        dayDiv.innerHTML = `<h3>Dia ${dayPlan.day}</h3>`;
        dayPlan.activities.forEach(activity => {
            const activityItem = document.createElement('p');
            activityItem.textContent = activity;
            dayDiv.appendChild(activityItem);
        });
        itineraryContent.appendChild(dayDiv);
    });

    document.getElementById('itinerary-box').style.display = 'block';

    // Solicitar feedback após exibir o roteiro
    setTimeout(requestItineraryFeedback, 1000);

    // Adicionar botão de salvar roteiro
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar Roteiro';
    saveButton.onclick = () => saveItinerary(itinerary);
    itineraryContent.appendChild(saveButton);

    // Adicionar botão de compartilhar roteiro
    const shareButton = document.createElement('button');
    shareButton.textContent = 'Compartilhar Roteiro';
    shareButton.onclick = () => shareItinerary(itinerary);
    itineraryContent.appendChild(shareButton);
}

// Função para compartilhar o roteiro nas redes sociais
function shareItinerary(itinerary) {
    const itineraryText = `Roteiro de ${itinerary.days} Dias para ${itinerary.name}:\n`;
    itinerary.activities.forEach(dayPlan => {
        itineraryText += `\nDia ${dayPlan.day}:\n`;
        dayPlan.activities.forEach(activity => {
            itineraryText += `- ${activity}\n`;
        });
    });

    const shareText = encodeURIComponent(itineraryText);
    const shareUrl = encodeURIComponent(window.location.href);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
    window.open(twitterUrl, '_blank');
}

// Função para salvar o roteiro personalizado no localStorage
function saveItinerary(itinerary) {
    localStorage.setItem('savedItinerary', JSON.stringify(itinerary));
    alert('Roteiro salvo com sucesso!');
}

// Função para carregar o roteiro personalizado do localStorage
function loadItinerary() {
    const savedItinerary = localStorage.getItem('savedItinerary');
    if (savedItinerary) {
        const itinerary = JSON.parse(savedItinerary);
        displayItinerary(itinerary);
    } else {
        alert('Nenhum roteiro salvo encontrado.');
    }
}

// Função para iniciar o planejamento de viagens
function startTravelPlanning() {
    // Perguntas de planejamento de viagem
    let answers = [];
    for (let question of questions) {
        let answer = prompt(question);
        if (!answer) {
            alert('Por favor, responda todas as perguntas.');
            return;
        }
        answers.push(answer);
    }

    // Gerar e exibir o roteiro com base nas respostas
    const itinerary = generateItinerary(answers);
    displayItinerary(itinerary);

    // Opção para salvar o roteiro
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Salvar Roteiro';
    saveButton.onclick = () => saveItinerary(itinerary);
    document.getElementById('itinerary-content').appendChild(saveButton);
}

// Função para ajustar o roteiro com base no feedback do usuário
function adjustItinerary(feedback) {
    console.log('Ajustando o roteiro com base no feedback:', feedback);
    const feedbackLower = feedback.toLowerCase();
    if (feedbackLower.includes('mais tempo na praia')) {
        itinerary.activities.forEach(dayPlan => {
            dayPlan.activities.push("Mais tempo de lazer na praia");
        });
    } else if (feedbackLower.includes('menos caminhadas')) {
        itinerary.activities.forEach(dayPlan => {
            dayPlan.activities = dayPlan.activities.filter(activity => !activity.toLowerCase().includes('caminhada'));
        });
    } else if (feedbackLower.includes('mais atividades culturais')) {
        itinerary.activities.forEach(dayPlan => {
            dayPlan.activities.push("Visita a museus e centros culturais");
        });
    } else if (feedbackLower.includes('mais aventura')) {
        itinerary.activities.forEach(dayPlan => {
            dayPlan.activities.push("Atividades de aventura, como trilhas e tirolesa");
        });
    }

    // Reexibir o roteiro ajustado
    displayItinerary(itinerary);
}
