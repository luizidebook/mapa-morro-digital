document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadResources();
    activateAssistant();
    setupEventListeners();
    showWelcomeMessage();
});

let map;
let currentSubMenu;
let currentLocation;
let selectedLanguage = getLocalStorageItem('preferredLanguage', 'pt');
let currentStep = 0;
let tutorialIsActive = false;
let searchHistory = getLocalStorageItem('searchHistory', []);
let achievements = getLocalStorageItem('achievements', []);
let favorites = getLocalStorageItem('favorites', []);
let routingControl;
let speechSynthesisUtterance = new SpeechSynthesisUtterance();
let voices = [];

const OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';

const translations = {
    pt: {
        welcome: "Bem-vindo ao nosso site!",
        youAreHere: "Você está aqui!",
        locationPermissionDenied: "Permissão de localização negada.",
        geolocationNotSupported: "Geolocalização não é suportada por este navegador.",
        osmFetchError: "Erro ao buscar dados do OpenStreetMap.",
        detailedInfo: "Informação detalhada sobre",
        createRoute: "Criar Rota",
        addToFavorites: "Adicionar aos Favoritos",
        itinerarySaved: "Roteiro salvo com sucesso.",
        suggestGuidedTour: "Sugerir um tour guiado",
        startGuidedTour: "Iniciar tour guiado",
        showPointOfInterestInfo: "Mostrar informações do ponto de interesse",
        requestActivityParticipation: "Solicitar participação em atividades",
        submitFeedback: "Enviar feedback",
        feedbackSent: "Feedback enviado com sucesso.",
        purchase: "Comprar",
        purchaseSuccess: "Compra realizada com sucesso!",
        provideContinuousAssistance: "Fornecer assistência contínua",
        answerQuestions: "Responder perguntas",
        search: "Buscar",
        favorite: "Favorito",
        yes: "Sim",
        no: "Não",
        locationNotAvailable: "Localização não disponível",
        tipsContent: `Dicas finais de Morro de São Paulo
1. Caso viaje pelo mar, tente tomar alguns cuidados para evitar o enjoo na embarcação. Faça refeições leves antes de embarcar ou tome um remédio de enjoo, seguindo orientação médica;
2. Leve roupas leves, protetor solar e calçados confortáveis para caminhar. O clima por lá é quente e o astral descontraído, sem formalidades, com direito a roupas frescas e chinelo sempre no pé;
3. Procure também viajar com pouca bagagem para que o deslocamento até sua pousada seja mais fácil e sem complicações. Dê preferência para mochilas, que facilitam o transporte nas ruas de pedra e trechos de areia;
4. Ao desembarcar em Morro de São Paulo, você verá pessoas oferecendo para carregar suas malas. Esse serviço pode ser uma boa alternativa se você tiver malas pesadas, mas é sempre bom combinar o valor previamente e não depois do serviço;
5. Hoje em dia é possível pagar com cartão e pix diversos serviços em Morro de São Paulo, entretanto é sempre bom ter dinheiro em espécie para alguns gastos menores, em especial porque os caixas eletrônicos da ilha podem não funcionar. Sendo assim, leve dinheiro do continente e não conte com os caixas eletrônicos de Morro de São Paulo;
6. É comum falta de luz em Morro de São Paulo. Uma lanterna não será demais;
7. Prepare-se para caminhar… a maioria das atividades em Morro de São Paulo é feita a pé e há algumas ladeiras a vencer;
8. O serviço médico e as farmácias de Morro de São Paulo são bem limitadas. Leve todo medicamento que considerar necessário;
9. O sinal de celular funciona bem em Morro de São Paulo e é comum a oferta de Wi-Fi nas pousadas e restaurantes;
10. Há a cobrança de uma taxa na chegada a Morro de São Paulo. A tarifa por uso do patrimônio do arquipélago – TUPA tem custo de R$ 50 por pessoa. Crianças com menos de 5 anos e pessoas com mais de 60 anos estão isentas da taxa. O pagamento pode ser realizado na hora do desembarque, pelo aplicativo da TUPA ou pelo site tupadigital.com.br. Em período de alta temporada ou finais de semana, recomendamos o pagamento antecipado da taxa para evitar filas.`
    },
    en: {
        welcome: "Welcome to our site!",
        youAreHere: "You are here!",
        locationPermissionDenied: "Location permission denied.",
        geolocationNotSupported: "Geolocation is not supported by this browser.",
        osmFetchError: "Error fetching data from OpenStreetMap.",
        detailedInfo: "Detailed information about",
        createRoute: "Create Route",
        addToFavorites: "Add to Favorites",
        itinerarySaved: "Itinerary saved successfully.",
        suggestGuidedTour: "Suggest a guided tour",
        startGuidedTour: "Start guided tour",
        showPointOfInterestInfo: "Show point of interest information",
        requestActivityParticipation: "Request activity participation",
        submitFeedback: "Submit feedback",
        feedbackSent: "Feedback sent successfully.",
        purchase: "Purchase",
        purchaseSuccess: "Purchase completed successfully!",
        provideContinuousAssistance: "Provide continuous assistance",
        answerQuestions: "Answer questions",
        search: "Search",
        favorite: "Favorite",
        yes: "Yes",
        no: "No",
        locationNotAvailable: "Location not available",
        tipsContent: `Final tips for Morro de São Paulo
1. If you travel by sea, take some precautions to avoid seasickness. Eat light meals before boarding or take seasickness medication following medical advice;
2. Bring light clothes, sunscreen, and comfortable shoes for walking. The weather there is hot and the atmosphere is relaxed, with no formalities, allowing fresh clothes and flip-flops always on your feet;
3. Also, try to travel with little luggage to make it easier to move to your inn without complications. Prefer backpacks, which facilitate transportation on cobblestone streets and sandy sections;
4. Upon disembarking in Morro de São Paulo, you will see people offering to carry your bags. This service can be a good alternative if you have heavy bags, but it is always good to agree on the price beforehand and not after the service;
5. Nowadays, it is possible to pay with cards and pix for various services in Morro de São Paulo, but it is always good to have cash for some minor expenses, especially since the island's ATMs may not work. So, bring cash from the mainland and do not rely on Morro de São Paulo's ATMs;
6. Power outages are common in Morro de São Paulo. A flashlight will not be too much;
7. Be prepared to walk... most activities in Morro de São Paulo are done on foot and there are some hills to climb;
8. Medical services and pharmacies in Morro de São Paulo are very limited. Bring all the medication you consider necessary;
9. The cell phone signal works well in Morro de São Paulo and Wi-Fi is commonly offered in inns and restaurants;
10. There is a fee charged upon arrival in Morro de São Paulo. The fee for using the archipelago's heritage - TUPA costs R$ 50 per person. Children under 5 and people over 60 are exempt from the fee. Payment can be made at the time of disembarkation, through the TUPA app, or on the website tupadigital.com.br. During the high season or weekends, we recommend paying the fee in advance to avoid lines.`
    },
    es: {
        welcome: "¡Bienvenido a nuestro sitio!",
        youAreHere: "¡Estás aquí!",
        locationPermissionDenied: "Permiso de ubicación denegado.",
        geolocationNotSupported: "La geolocalización no es compatible con este navegador.",
        osmFetchError: "Error al obtener datos de OpenStreetMap.",
        detailedInfo: "Información detallada sobre",
        createRoute: "Crear ruta",
        addToFavorites: "Agregar a Favoritos",
        itinerarySaved: "Itinerario guardado con éxito.",
        suggestGuidedTour: "Sugerir un tour guiado",
        startGuidedTour: "Iniciar tour guiado",
        showPointOfInterestInfo: "Mostrar información del punto de interés",
        requestActivityParticipation: "Solicitar participación en actividades",
        submitFeedback: "Enviar comentarios",
        feedbackSent: "Comentarios enviados con éxito.",
        purchase: "Comprar",
        purchaseSuccess: "¡Compra realizada con éxito!",
        provideContinuousAssistance: "Proporcionar asistencia continua",
        answerQuestions: "Responder preguntas",
        search: "Buscar",
        favorite: "Favorito",
        yes: "Sí",
        no: "No",
        locationNotAvailable: "Ubicación no disponible",
        tipsContent: `Consejos finales para Morro de São Paulo
1. Si viajas por mar, toma algunas precauciones para evitar el mareo. Come comidas ligeras antes de embarcar o toma medicamentos para el mareo siguiendo el consejo médico;
2. Lleva ropa ligera, protector solar y zapatos cómodos para caminar. El clima allí es cálido y el ambiente relajado, sin formalidades, permitiendo ropa fresca y sandalias siempre en tus pies;
3. También, intenta viajar con poco equipaje para que sea más fácil moverte hasta tu posada sin complicaciones. Prefiere mochilas, que facilitan el transporte en calles empedradas y tramos de arena;
4. Al desembarcar en Morro de São Paulo, verás personas ofreciendo llevar tus maletas. Este servicio puede ser una buena alternativa si tienes maletas pesadas, pero siempre es bueno acordar el precio de antemano y no después del servicio;
5. Hoy en día es posible pagar con tarjetas y pix varios servicios en Morro de São Paulo, pero siempre es bueno tener efectivo para algunos gastos menores, especialmente porque los cajeros automáticos de la isla pueden no funcionar. Así que, lleva dinero del continente y no confíes en los cajeros automáticos de Morro de São Paulo;
6. Los cortes de luz son comunes en Morro de São Paulo. Una linterna no estará de más;
7. Prepárate para caminar... la mayoría de las actividades en Morro de São Paulo se realizan a pie y hay algunas colinas para subir;
8. Los servicios médicos y las farmacias en Morro de São Paulo son muy limitadas. Lleva toda la medicación que consideres necesaria;
9. La señal de celular funciona bien en Morro de São Paulo y es común que se ofrezca Wi-Fi en las posadas y restaurantes;
10. Se cobra una tarifa al llegar a Morro de São Paulo. La tarifa por uso del patrimonio del archipiélago - TUPA cuesta R$ 50 por persona. Los niños menores de 5 años y las personas mayores de 60 están exentos de la tarifa. El pago se puede realizar en el momento del desembarque, a través de la aplicación TUPA o en el sitio web tupadigital.com.br. Durante la temporada alta o los fines de semana, recomendamos pagar la tarifa con anticipación para evitar filas.`
    },
    he: {
        welcome: "ברוך הבא לאתר שלנו!",
        youAreHere: "אתה כאן!",
        locationPermissionDenied: "הרשאת מיקום נדחתה.",
        geolocationNotSupported: "דפדפן זה אינו תומך בגאולוקיישן.",
        osmFetchError: "שגיאה בשליפת נתונים מ-OpenStreetMap.",
        detailedInfo: "מידע מפורט על",
        createRoute: "צור מסלול",
        addToFavorites: "הוסף למועדפים",
        itinerarySaved: "המסלול נשמר בהצלחה.",
        suggestGuidedTour: "הצע סיור מודרך",
        startGuidedTour: "התחל סיור מודרך",
        showPointOfInterestInfo: "הצג מידע על נקודת עניין",
        requestActivityParticipation: "בקש השתתפות בפעילות",
        submitFeedback: "שלח משוב",
        feedbackSent: "המשוב נשלח בהצלחה.",
        purchase: "לִרְכּוֹשׁ",
        purchaseSuccess: "הרכישה הושלמה בהצלחה!",
        provideContinuousAssistance: "ספק סיוע רציף",
        answerQuestions: "ענה על שאלות",
        search: "לחפש",
        favorite: "מועדף",
        yes: "כן",
        no: "לא",
        locationNotAvailable: "מיקום לא זמין",
        tipsContent: `טיפים אחרונים למורו דה סאו פאולו
1. אם אתה נוסע דרך הים, נקט באמצעי זהירות כדי להימנע ממחלת ים. אכול ארוחות קלות לפני העלייה לסיפון או קח תרופות למחלת ים לפי עצת רופא;
2. הבא בגדים קלים, קרם הגנה ונעליים נוחות להליכה. מזג האוויר שם חם והאווירה רגועה, ללא פורמליות, המאפשרת בגדים קלילים וכפכפים תמיד על הרגליים;
3. כמו כן, נסה לנסוע עם מעט מזוודות כדי להקל על המעבר לפונדק שלך ללא סיבוכים. העדיפו תרמילים, שמקלים על ההובלה ברחובות מרוצפי אבן ובקטעי חול;
4. עם הירידה מהספינה במורו דה סאו פאולו, תראה אנשים שמציעים לשאת את התיקים שלך. שירות זה יכול להיות חלופה טובה אם יש לך תיקים כבדים, אבל תמיד כדאי להסכים על המחיר מראש ולא לאחר השירות;
5. כיום, ניתן לשלם בכרטיסים וב-Pix עבור שירותים שונים במורו דה סאו פאולו, אך תמיד כדאי להחזיק מזומן עבור כמה הוצאות קטנות, במיוחד מכיוון שכספומטים באי עלולים לא לפעול. לכן, הביאו מזומן מהיבשת ואל תסתמכו על כספומטים של מורו דה סאו פאולו;
6. הפסקות חשמל נפוצות במורו דה סאו פאולו. פנס לא יהיה יותר מדי;
7. היו מוכנים ללכת... רוב הפעילויות במורו דה סאו פאולו נעשות ברגל ויש כמה גבעות לטפס עליהן;
8. שירותים רפואיים ובתי מרקחת במורו דה סאו פאולו מוגבלים מאוד. הביאו את כל התרופות שאתם רואים לנכון;
9. קליטת הסלולר פועלת היטב במורו דה סאו פאולו ונפוץ להציע Wi-Fi בפונדקים ובמסעדות;
10. יש תשלום שנגבה עם ההגעה למורו דה סאו פאולו. האגרה על השימוש במורשת הארכיפלג - TUPA עולה 50 ריאל לאדם. ילדים מתחת לגיל 5 ואנשים מעל גיל 60 פטורים מהאגרה. ניתן לשלם בזמן הירידה, דרך אפליקציית TUPA או באתר tupadigital.com.br. בעונת השיא או בסופי שבוע, אנו ממליצים לשלם את האגרה מראש כדי להימנע מתורים.`
    }
};

const queries = {
    'touristSpots-submenu': '[out:json];node["tourism"="attraction"](around:10000,-13.376,-38.913);out body;',
    'tours-submenu': '[out:json];node["tourism"="information"](around:10000,-13.376,-38.913);out body;',
    'beaches-submenu': '[out:json];node["natural"="beach"](around:10000,-13.376,-38.913);out body;',
    'nightlife-submenu': '[out:json];node["amenity"="nightclub"](around:10000,-13.376,-38.913);out body;',
    'restaurants-submenu': '[out:json];node["amenity"="restaurant"](around:10000,-13.376,-38.913);out body;',
    'inns-submenu': '[out:json];node["tourism"="hotel"](around:10000,-13.376,-38.913);out body;',
    'shops-submenu': '[out:json];node["shop"](around:10000,-13.376,-38.913);out body;',
    'emergencies-submenu': '[out:json];node["amenity"~"hospital|police"](around:10000,-13.376,-38.913);out body;',
    'tips-submenu': '[out:json];node["tips"](around:10000,-13.376,-38.913);out body;',
    'about-submenu': '[out:json];node["about"](around:10000,-13.376,-38.913);out body;',
    'education-submenu': '[out:json];node["education"](around:10000,-13.376,-38.913);out body;'
};

function getLocalStorageItem(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error(`Erro ao obter ${key} do localStorage:`, error);
        return defaultValue;
    }
}

function setupEventListeners() {
    setupModalEventListeners();
    setupMenuEventListeners();
    setupLanguageEventListeners();
    setupTutorialEventListeners();
}

function setupModalEventListeners() {
    const modal = document.getElementById('assistant-modal');
    const closeModal = document.querySelector('.close-btn');
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

function setupMenuEventListeners() {
    const menuToggle = document.getElementById('menu-btn');
    const floatingMenu = document.getElementById('floating-menu');
    
    menuToggle.addEventListener('click', () => {
        floatingMenu.classList.toggle('hidden');
        handleTutorialStep('menu-toggle');
    });

    document.querySelector('.menu-btn.zoom-in').addEventListener('click', () => {
        map.zoomIn();
        closeSideMenu();
        handleTutorialStep('zoom-in');
    });

    document.querySelector('.menu-btn.zoom-out').addEventListener('click', () => {
        map.zoomOut();
        closeSideMenu();
        handleTutorialStep('zoom-out');
    });

    document.querySelector('.menu-btn.locate-user').addEventListener('click', async () => {
        try {
            await updateLocation();
            closeSideMenu();
            handleTutorialStep('locate-user');
        } catch (error) {
            console.error("Erro ao atualizar localização:", error);
        }
    });

    document.querySelectorAll('.menu-btn[data-feature]').forEach(button => {
        button.addEventListener('click', event => {
            const feature = button.getAttribute('data-feature');
            handleFeatureSelection(feature);
            event.stopPropagation();
            handleTutorialStep(feature);
        });
    });
}

function setupLanguageEventListeners() {
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', async () => {
            setLanguage(button.getAttribute('data-lang'));
            document.getElementById('welcome-modal').style.display = 'none';
            try {
                await updateLocation();
                loadSearchHistory();
                checkAchievements();
                loadFavorites();
            } catch (error) {
                console.error("Erro ao atualizar localização:", error);
            }
        });
    });
}

function setupTutorialEventListeners() {
        const tutorialBtn = document.getElementById('tutorial-btn');
        const createItineraryBtn = document.getElementById('create-itinerary-btn');

        tutorialBtn.addEventListener('click', () => {
            if (tutorialIsActive) {
                endTutorial();
            } else {
                showTutorialStep('start-tutorial');
            }
        });

        document.getElementById('tutorial-yes-btn').addEventListener('click', startTutorial);
        document.getElementById('tutorial-no-btn').addEventListener('click', endTutorial);
        createItineraryBtn.addEventListener('click', () => {
            endTutorial();
            collectInterestData();
        });
        document.getElementById('tutorial-next-btn').addEventListener('click', nextTutorialStep);
        document.getElementById('tutorial-prev-btn').addEventListener('click', previousTutorialStep);
        document.getElementById('tutorial-end-btn').addEventListener('click', endTutorial);

        document.querySelector('.menu-btn[data-feature="dicas"]').addEventListener('click', showTips);
        document.querySelector('.menu-btn[data-feature="ensino"]').addEventListener('click', showEducation);
    }


function handleTutorialStep(step) {
    if (tutorialIsActive && tutorialSteps[currentStep].step === step) {
        nextTutorialStep();
    }
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
    document.getElementById('tutorial-overlay').style.display = 'none';
    tutorialIsActive = false;
    removeExistingHighlights();
    document.querySelector('.control-buttons').style.display = 'none';
    hideAssistantModal();
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
    const arrowHighlight = document.createElement('div');

    circleHighlight.className = 'circle-highlight';
    circleHighlight.style.position = 'absolute';
    circleHighlight.style.top = `${rect.top + window.scrollY}px`;
    circleHighlight.style.left = `${rect.left + window.scrollX}px`;
    circleHighlight.style.width = `${rect.width}px`;
    circleHighlight.style.height = `${rect.height}px`;
    circleHighlight.style.border = '2px solid red';
    circleHighlight.style.borderRadius = '50%';
    circleHighlight.style.zIndex = '999';

    arrowHighlight.className = 'arrow-highlight';
    arrowHighlight.style.position = 'absolute';
    arrowHighlight.style.top = `${rect.top + window.scrollY - 20}px`;
    arrowHighlight.style.left = `${rect.left + window.scrollX + rect.width / 2 - 20}px`;
    arrowHighlight.style.width = '0';
    arrowHighlight.style.height = '0';
    arrowHighlight.style.borderLeft = '20px solid transparent';
    arrowHighlight.style.borderRight = '20px solid transparent';
    arrowHighlight.style.zIndex = '99999';
    arrowHighlight.style.animation = 'bounce 1s infinite';

    document.body.appendChild(circleHighlight);
    document.body.appendChild(arrowHighlight);
}

function removeExistingHighlights() {
    document.querySelectorAll('.arrow-highlight').forEach(el => el.remove());
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
    updateLocation().then(() => {
        loadSearchHistory();
        checkAchievements();
        loadFavorites();
    }).catch(error => {
        console.error("Erro ao atualizar localização:", error);
    });
}

function translatePageContent(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = translations[lang][key];
    });

    document.getElementById('tutorial-yes-btn').textContent = translations[lang].yes;
    document.getElementById('tutorial-no-btn').textContent = translations[lang].no;
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

function updateLocation() {
    return new Promise((resolve, reject) => {
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
                if (!tutorialIsActive) {
                    showTutorialStep('start-tutorial');
                }
                showLocationMessage();
                resolve();
            }, () => {
                console.log(translations[selectedLanguage].locationPermissionDenied);
                if (!tutorialIsActive) {
                    showTutorialStep('start-tutorial');
                }
                reject();
            });
        } else {
            console.log(translations[selectedLanguage].geolocationNotSupported);
            if (!tutorialIsActive) {
                showTutorialStep('start-tutorial');
            }
            reject();
        }
    });
}

function adjustMapWithLocation(lat, lon) {
    map.setView([lat, lon], 16);
    L.marker([lat, lon]).addTo(map)
        .bindPopup(translations[selectedLanguage].youAreHere)
        .openPopup();
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

    switch (subMenuId) {
        case 'tours-submenu':
            displayCustomTours();
            break;
        case 'emergencies-submenu':
            displayCustomEmergencies();
            break;
        case 'tips-submenu':
            displayCustomTips();
            break;
        case 'about-submenu':
            displayCustomAbout();
            break;
        case 'education-submenu':
            displayCustomEducation();
            break;
        default:
            fetchOSMData(queries[subMenuId]).then(data => {
                if (data) {
                    displayOSMData(data, subMenuId);
                }
            });
            break;
    }
}

async function fetchOSMData(query) {
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!data.elements) throw new Error('Invalid data format');
        return data;
    } catch (error) {
        console.error(translations[selectedLanguage].osmFetchError, error);
        showNotification(translations[selectedLanguage].osmFetchError, 'error');
        return null;
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
            btn.onclick = () => handleSubmenuButtonClick(element.lat, element.lon, element.tags.name, element.tags.description || 'Descrição não disponível', element.tags.images || []);
            subMenu.appendChild(btn);
        }
    });
}

function displayCustomTours() {
    const tours = [
        {
            name: "Passeio de Lancha Volta a Ilha de Tinharé",
            lat: -13.3800,
            lon: -38.9100,
            description: `O passeio Volta a Ilha é composto por 5 paradas, incluindo 2 piscinas naturais e 3 ilhas:
⏰ Saída às 10h e retorno a partir das 16:30.
1ª parada: Piscinas naturais de Garapuá - Águas cristalinas perfeitas para mergulhos superficiais, com bares flutuantes para drinks e petiscos. Permanência de 30 a 40 minutos.
2ª parada: Piscinas naturais de Moreré - Águas calcárias muito cristalinas, ideais para relaxar e observar peixes coloridos. Permanência de 30 a 40 minutos.
3ª parada: Ilha de Boipeba - Escolha entre Praia de Cueira (famoso restaurante do Guigo com lagostas artesanais) e Boca da Barra (vários restaurantes e acesso à vila). Tempo para almoço de 2 a 3 horas.
4ª parada: Canavieira - Bares flutuantes e ostras frescas. Banho de rio e drinks preparados pelos nativos.
5ª parada: Cidade de Cairu - Abastecimento da lancha e visita opcional ao convento de Santo Antônio. Permanência de 30 a 40 minutos.`,
            images: ["image1.jpg", "image2.jpg"]
        },
        {
            name: "Passeio de Quadriciclo para Garapuá",
            lat: -13.3600,
            lon: -38.9400,
            description: `⏱ Horário de saída: 09:30
📍 Local de saída: Terceira praia
1ª parada: Quarta praia
2ª parada: Praia de Garapuá
3ª parada: Praia do Encanto
4ª parada: Praia de Garapuá para almoço, finalizando com o pôr do sol no caminho.
📸 Passeio inclui fotos e guia.
⏱ Horário de retorno: 17:30`,
            images: ["image1.jpg", "image2.jpg"]
        },
        {
            name: "Passeio 4X4 para Garapuá",
            lat: -13.3500,
            lon: -38.9500,
            description: `⏰ Saída às 10:30, retorno a partir das 15:30
A Praia de Garapuá, também conhecida como Praia da Ferradura ou Caribe Brasileiro, é um passeio off-road feito por carros 4x4. Saída da Rua do Receptivo na Segunda Praia, com 2 paradas:
1ª parada: Praia do Encanto - Maior extensão de areia, praia preservada. Parada de 30 minutos.
2ª parada: Povoado de Garapuá - Antiga aldeia de pescadores com bares e restaurantes. Desfrute da praia, faça caminhadas com conforto e segurança. Opções de passeios a parte: trilhas, visitações nas piscinas naturais e no manguezal.`,
            images: ["image1.jpg", "image2.jpg"]
        },
        {
            name: "Passeio de Barco para Gamboa",
            lat: -13.3700,
            lon: -38.9000,
            description: `Saída: Terceira praia
Embarcação: Escuna
Horário de saída: 10:00
Roteiro:
1ª parada: Ilha do Caitá - Aproveite as piscinas naturais (melhor ponto de mergulho da região, área com vida marinha preservada).
2ª Parada: Forte Tapirandu - Praia da Argila.
3ª Parada: Praia de Gamboa - Parada para almoço (2 horas).
4ª parada: Banco de areia - Encontro de águas quentes, frias e mornas.
5ª parada: Ponta do Curral
Retorno para Morro às 17:30, com parada no cais para ver o pôr do sol.`,
            images: ["image1.jpg", "image2.jpg"]
        }
    ];

    const subMenu = document.getElementById('tours-submenu');
    subMenu.innerHTML = '';

    tours.forEach(tour => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = tour.name;
        btn.onclick = () => handleSubmenuButtonClick(tour.lat, tour.lon, tour.name, tour.description, tour.images);
        subMenu.appendChild(btn);
    });
}

function displayCustomEmergencies() {
    const emergencies = [
        { name: "Ambulância", lat: -13.3800, lon: -38.9100, description: "Serviço de ambulância: +55 75-99894-5017", images: ["image1.jpg", "image2.jpg"] },
        { name: "Unidade de Saúde", lat: -13.3600, lon: -38.9400, description: "Unidade de saúde local: +55 75-3652-1798", images: ["image1.jpg", "image2.jpg"] },
        { name: "Polícia Cívil", lat: -13.3500, lon: -38.9500, description: "Delegacia da Polícia Cívil: +55 75-3652-1645", images: ["image1.jpg", "image2.jpg"] },
        { name: "Polícia Militar", lat: -13.3700, lon: -38.9000, description: "Posto da Polícia Militar: +55 75-99925-0856", images: ["image1.jpg", "image2.jpg"] }
    ];

    const subMenu = document.getElementById('emergencies-submenu');
    subMenu.innerHTML = '';
    
    emergencies.forEach(emergency => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = emergency.name;
        btn.onclick = () => handleSubmenuButtonClick(emergency.lat, emergency.lon, emergency.name, emergency.description, emergency.images);
        subMenu.appendChild(btn);
    });
}

function displayCustomTips() {
    const tips = [
        { name: "Melhores Pontos Turísticos", lat: -13.3700, lon: -38.9000, description: "Descrição dos melhores pontos turísticos", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Passeios", lat: -13.3600, lon: -38.9400, description: "Descrição dos melhores passeios", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Praias", lat: -13.3500, lon: -38.9500, description: "Descrição das melhores praias", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Restaurantes", lat: -13.3800, lon: -38.9100, description: "Descrição dos melhores restaurantes", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Pousadas", lat: -13.3700, lon: -38.9000, description: "Descrição das melhores pousadas", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Lojas", lat: -13.3600, lon: -38.9400, description: "Descrição das melhores lojas", images: ["image1.jpg", "image2.jpg"] }
    ];

    const subMenu = document.getElementById('tips-submenu');
    subMenu.innerHTML = '';
    
    tips.forEach(tip => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = tip.name;
        btn.onclick = () => handleSubmenuButtonClick(tip.lat, tip.lon, tip.name, tip.description, tip.images);
        subMenu.appendChild(btn);
    });
}

function displayCustomAbout() {
    const about = [
        { name: "Missão", lat: -13.3700, lon: -38.9000, description: "A missão do projeto é promover o turismo e as atividades comerciais em Morro de São Paulo, conectando negócios locais com visitantes através de uma plataforma digital inovadora, oferecendo informações, promoções e uma visão abrangente do que a região tem a oferecer.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Serviços", lat: -13.3600, lon: -38.9400, description: "Oferecemos uma plataforma digital inovadora focada em promover o turismo e as atividades comerciais em Morro de São Paulo, conectando negócios locais com visitantes através de nosso site interativo e aplicativos móveis.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Turistas", lat: -13.3500, lon: -38.9500, description: "Os turistas se beneficiam de uma visão abrangente do que Morro de São Paulo tem a oferecer, com informações detalhadas sobre pontos turísticos, passeios, praias, restaurantes e muito mais.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Moradores", lat: -13.3800, lon: -38.9100, description: "Os moradores se beneficiam com a promoção de suas atividades comerciais e culturais, o que aumenta a visibilidade e as oportunidades de negócios na região.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Pousadas", lat: -13.3700, lon: -38.9000, description: "As pousadas têm maior visibilidade para potenciais hóspedes através de nossa plataforma, com informações detalhadas e opções de reserva.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Restaurantes", lat: -13.3600, lon: -38.9400, description: "Os restaurantes ganham maior exposição para visitantes, com detalhes sobre menus, horários de funcionamento e opções de reserva.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Agências de Turismo", lat: -13.3500, lon: -38.9500, description: "As agências de turismo podem promover seus passeios e pacotes, atraindo mais clientes através de uma plataforma digital interativa.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Lojas e Comércios", lat: -13.3800, lon: -38.9100, description: "As lojas e comércios locais se beneficiam da maior visibilidade para turistas e moradores, incentivando o comércio local.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Transportes", lat: -13.3700, lon: -38.9000, description: "Os serviços de transporte têm maior visibilidade e podem oferecer informações detalhadas sobre horários e rotas para os visitantes.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Impacto em MSP", lat: -13.3600, lon: -38.9400, description: "O impacto em Morro de São Paulo inclui a promoção do turismo sustentável, aumento do comércio local e melhorias na infraestrutura turística.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Impacto na Bahia", lat: -13.3500, lon: -38.9500, description: "Na Bahia, o projeto visa promover o estado como um destino turístico de destaque, aumentando a visibilidade e atraindo mais visitantes.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Impacto no Brasil", lat: -13.3800, lon: -38.9100, description: "Em nível nacional, o projeto promove Morro de São Paulo como um destino premium para eventos e turismo, contribuindo para o crescimento do setor.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Impacto no Mundo", lat: -13.3700, lon: -38.9000, description: "Globalmente, o projeto posiciona Morro de São Paulo como um destino turístico de renome, atraindo visitantes de diversas partes do mundo.", images: ["image1.jpg", "image2.jpg"] }
    ];

    const subMenu = document.getElementById('about-submenu');
    subMenu.innerHTML = '';
    
    about.forEach(info => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = info.name;
        btn.onclick = () => handleSubmenuButtonClick(info.lat, info.lon, info.name, info.description, info.images);
        subMenu.appendChild(btn);
    });
}

function displayCustomEducation() {
    const educationOptions = [
        { name: "Iniciar Tutorial", lat: -13.3800, lon: -38.9100, description: "Descrição do tutorial", images: ["image1.jpg", "image2.jpg"] },
        { name: "Planejar Viagem com IA", lat: -13.3600, lon: -38.9400, description: "Descrição do planejamento de viagem com IA", images: ["image1.jpg", "image2.jpg"] },
        { name: "Falar com IA", lat: -13.3500, lon: -38.9500, description: "Descrição do recurso de falar com IA", images: ["image1.jpg", "image2.jpg"] },
        { name: "Falar com Suporte", lat: -13.3700, lon: -38.9000, description: "Descrição do recurso de falar com suporte", images: ["image1.jpg", "image2.jpg"] },
        { name: "Configurações", lat: -13.3700, lon: -38.9000, description: "Descrição das configurações disponíveis", images: ["image1.jpg", "image2.jpg"] }
    ];

    const subMenu = document.getElementById('education-submenu');
    subMenu.innerHTML = '';
    
    educationOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = option.name;
        btn.onclick = () => handleSubmenuButtonClick(option.lat, option.lon, option.name, option.description, option.images);
        subMenu.appendChild(btn);
    });
}

function handleSubmenuButtonClick(lat, lon, name, description, images) {
    showLocationDetailsInModal(name, description, images);
    createRouteTo([lat, lon]);
}

function showLocationDetailsInModal(name, description, images) {
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    modalContent.innerHTML = `
        <h2>${name}</h2>
        <p>${description}</p>
        <div class="carousel">
            ${images.map((img, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${img}" alt="${name} Image ${index + 1}">
                </div>
            `).join('')}
        </div>
        <button id="close-menu-btn" class="close-menu-btn" onclick="hideModal('assistant-modal')">X</button>
    `;
    showModal('assistant-modal');

    document.getElementById('close-assistant-modal').addEventListener('click', () => {
        hideModal('assistant-modal');
    });

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

function createRouteTo(destination) {
    if (routingControl) {
        map.removeControl(routingControl);
    }
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(currentLocation.latitude, currentLocation.longitude),
            L.latLng(destination)
        ],
        routeWhileDragging: true,
        position: 'topleft'
    }).addTo(map);
}

function showInfoModal(title, content) {
    const infoModal = document.getElementById('info-modal');
    infoModal.querySelector('.modal-title').innerText = title;
    infoModal.querySelector('.modal-content').innerHTML = content;
    infoModal.style.display = 'block';
}

function showItineraryForm() {
    const formModal = document.getElementById('itinerary-form-modal');
    formModal.style.display = 'block';
}

function saveEditedItinerary() {
    const name = document.querySelector('input[name="name"]').value;
    const description = document.querySelector('textarea[name="description"]').value;
    console.log(translations[selectedLanguage].itinerarySaved, { name, description });
    hideModal('itinerary-form-modal');
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
    const url = window.location.href;
    let shareUrl;

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

function updateMapView(lat, lon, zoom) {
    map.setView([lat, lon], zoom);
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
            pt: "Olá, seja bem-vindo! Eu sou a inteligência artificial da Morro Digital e meu objetivo é te ajudar a viver todas as melhores experiências em Morro de São Paulo. Você gostaria de iniciar um tutorial que explique o passo a passo de como utilizar todas as ferramentas da Morro Digital?",
            en: "Hello, welcome! I am the artificial intelligence of Morro Digital, and my goal is to help you experience all the best that Morro de São Paulo has to offer. Would you like to start a tutorial that explains step-by-step how to use all the tools of Morro Digital?",
            es: "Hola, ¡bienvenido! Soy la inteligencia artificial de Morro Digital, y mi objetivo es ayudarte a vivir todas las mejores experiencias en Morro de São Paulo. ¿Te gustaría comenzar un tutorial que explique paso a paso cómo utilizar todas las herramientas de Morro Digital?",
            he: "שלום, ברוך הבא! אני הבינה המלאכותית של מורו דיגיטל, והמטרה שלי היא לעזור לך לחוות את כל החוויות הטובות ביותר במורו דה סאו פאולו. האם תרצה להתחיל מדריך שמסביר שלב אחר שלב כיצד להשתמש בכלי מורו דיגיטל?"
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
            pt: "Clique aqui para abrir o menu principal. Você pode usar este menu para acessar diferentes funcionalidades e informações sobre Morro de São Paulo.",
            en: "Click here to open the main menu. You can use this menu to access different features and information about Morro de São Paulo.",
            es: "Haz clic aquí para abrir el menú principal. Puedes usar este menú para acceder a diferentes funciones e información sobre Morro de São Paulo.",
            he: "לחץ כאן כדי לפתוח את התפריט הראשי. אתה יכול להשתמש בתפריט זה כדי לגשת לתכונות שונות ומידע על מורו דה סאו פאולו."
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
            pt: "Aqui você encontra uma lista dos pontos turísticos mais populares de Morro de São Paulo. Clique em qualquer item para ver mais detalhes e criar rotas.",
            en: "Here you find a list of the most popular tourist spots in Morro de São Paulo. Click on any item to see more details and create routes.",
            es: "Aquí encuentras una lista de los puntos turísticos más populares de Morro de São Paulo. Haz clic en cualquier elemento para ver más detalles y crear rutas.",
            he: "כאן תמצא רשימה של המקומות התיירותיים הפופולריים ביותר במורו דה סאו פאולו. לחץ על כל פריט כדי לראות פרטים נוספים וליצור מסלולים."
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
            pt: "Aqui você encontra diversos passeios disponíveis em Morro de São Paulo. Escolha um passeio para ver informações detalhadas e opções de reserva.",
            en: "Here you find various tours available in Morro de São Paulo. Choose a tour to see detailed information and booking options.",
            es: "Aquí encuentras varios paseos disponibles en Morro de São Paulo. Elige un paseo para ver información detallada y opciones de reserva.",
            he: "כאן תמצא סיורים שונים הזמינים במורו דה סאו פאולו. בחר סיור כדי לראות מידע מפורט ואפשרויות הזמנה."
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
            pt: "Encontre as melhores praias de Morro de São Paulo. Clique em uma praia para ver detalhes, fotos e dicas de visita.",
            en: "Find the best beaches in Morro de São Paulo. Click on a beach to see details, photos, and visit tips.",
            es: "Encuentra las mejores playas de Morro de São Paulo. Haz clic en una playa para ver detalles, fotos y consejos de visita.",
            he: "מצא את החופים הטובים ביותר במורו דה סאו פאולו. לחץ על חוף כדי לראות פרטים, תמונות וטיפים לביקור."
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
            pt: "Veja as festas e eventos acontecendo em Morro de São Paulo. Clique em um evento para mais informações e para adicionar ao seu calendário.",
            en: "See the parties and events happening in Morro de São Paulo. Click on an event for more information and to add it to your calendar.",
            es: "Ve las fiestas y eventos que suceden en Morro de São Paulo. Haz clic en un evento para más información y para agregarlo a tu calendario.",
            he: "ראה את המסיבות והאירועים המתרחשים במורו דה סאו פאולו. לחץ על אירוע למידע נוסף ולהוספתו ללוח השנה שלך."
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
            pt: "Descubra os melhores restaurantes de Morro de São Paulo. Clique em um restaurante para ver o menu, horários de funcionamento e fazer uma reserva.",
            en: "Discover the best restaurants in Morro de São Paulo. Click on a restaurant to see the menu, opening hours, and make a reservation.",
            es: "Descubre los mejores restaurantes de Morro de São Paulo. Haz clic en un restaurante para ver el menú, horarios de apertura y hacer una reserva.",
            he: "גלה את המסעדות הטובות ביותר במורו דה סאו פאולו. לחץ על מסעדה כדי לראות את התפריט, שעות הפתיחה ולהזמין מקום."
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
            pt: "Veja as pousadas disponíveis em Morro de São Paulo. Clique em uma pousada para ver detalhes, fotos e fazer uma reserva.",
            en: "See the inns available in Morro de São Paulo. Click on an inn to see details, photos, and make a reservation.",
            es: "Ve las posadas disponibles en Morro de São Paulo. Haz clic en una posada para ver detalles, fotos y hacer una reserva.",
            he: "ראה את האכסניות הזמינות במורו דה סאו פאולו. לחץ על אכסניה כדי לראות פרטים, תמונות ולהזמין מקום."
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
            pt: "Encontre as melhores lojas de Morro de São Paulo. Clique em uma loja para ver detalhes, produtos e horários de funcionamento.",
            en: "Find the best shops in Morro de São Paulo. Click on a shop to see details, products, and opening hours.",
            es: "Encuentra las mejores tiendas de Morro de São Paulo. Haz clic en una tienda para ver detalles, productos y horarios de apertura.",
            he: "מצא את החנויות הטובות ביותר במורו דה סאו פאולו. לחץ על חנות כדי לראות פרטים, מוצרים ושעות פתיחה."
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
            pt: "Veja informações importantes sobre emergências em Morro de São Paulo. Clique em uma opção para mais detalhes.",
            en: "See important emergency information in Morro de São Paulo. Click on an option for more details.",
            es: "Ve información importante sobre emergencias en Morro de São Paulo. Haz clic en una opción para más detalles.",
            he: "ראה מידע חשוב על חירום במורו דה סאו פאולו. לחץ על אפשרות לקבלת פרטים נוספים."
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
            pt: "Veja dicas úteis para aproveitar ao máximo sua visita a Morro de São Paulo. Clique em uma dica para mais informações.",
            en: "See useful tips to make the most of your visit to Morro de São Paulo. Click on a tip for more information.",
            es: "Ve consejos útiles para aprovechar al máximo tu visita a Morro de São Paulo. Haz clic en un consejo para más información.",
            he: "ראה טיפים שימושיים כדי להפיק את המרב מהביקור שלך במורו דה סאו פאולו. לחץ על טיפ לקבלת מידע נוסף."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="dicas"]');
            highlightElement(element);
        }
    },
    {
        step: 'sobre',
        element: '.menu-btn[data-feature="sobre"]',
        message: {
            pt: "Saiba mais sobre o projeto Morro Digital e como ele pode te ajudar a aproveitar ao máximo sua visita a Morro de São Paulo.",
            en: "Learn more about the Morro Digital project and how it can help you make the most of your visit to Morro de São Paulo.",
            es: "Conoce más sobre el proyecto Morro Digital y cómo puede ayudarte a aprovechar al máximo tu visita a Morro de São Paulo.",
            he: "למד עוד על פרויקט מורו דיגיטל וכיצד הוא יכול לעזור לך להפיק את המרב מהביקור שלך במורו דה סאו פאולו."
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
            pt: "Veja opções de aprendizado e treinamento disponíveis no Morro Digital. Clique em uma opção para mais detalhes.",
            en: "See learning and training options available at Morro Digital. Click on an option for more details.",
            es: "Ve opciones de aprendizaje y capacitación disponibles en Morro Digital. Haz clic en una opción para más detalles.",
            he: "ראה אפשרויות למידה והכשרה זמינות במורו דיגיטל. לחץ על אפשרות לקבלת פרטים נוספים."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="ensino"]');
            highlightElement(element);
        }
    },
    {
        step: 'zoom-in',
        element: '.menu-btn.zoom-in',
        message: {
            pt: "Use este botão para aumentar o zoom no mapa. Você pode ver mais detalhes sobre áreas específicas.",
            en: "Use this button to zoom in on the map. You can see more details about specific areas.",
            es: "Usa este botón para acercar el mapa. Puedes ver más detalles sobre áreas específicas.",
            he: "השתמש בלחצן זה כדי להגדיל את המפה. אתה יכול לראות פרטים נוספים על אזורים ספציפיים."
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
            pt: "Use este botão para diminuir o zoom no mapa. Você pode ver uma área mais ampla.",
            en: "Use this button to zoom out on the map. You can see a wider area.",
            es: "Usa este botón para alejar el mapa. Puedes ver una área más amplia.",
            he: "השתמש בלחצן זה כדי להקטין את המפה. אתה יכול לראות אזור רחב יותר."
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
            pt: "Use este botão para localizar sua posição atual no mapa. Isso pode ajudar você a se orientar em Morro de São Paulo.",
            en: "Use this button to locate your current position on the map. This can help you orient yourself in Morro de São Paulo.",
            es: "Usa este botón para localizar tu posición actual en el mapa. Esto puede ayudarte a orientarte en Morro de São Paulo.",
            he: "השתמש בלחצן זה כדי לאתר את המיקום הנוכחי שלך במפה. זה יכול לעזור לך להתמצא במורו דה סאו פאולו."
        },
        action: () => {
            const element = document.querySelector('.menu-btn.locate-user');
            highlightElement(element);
        }
    }
];

function showTutorialStep(step) {
    const stepData = tutorialSteps.find(s => s.step === step);
    if (!stepData) return;

    document.getElementById('assistant-modal').style.display = 'block';
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    modalContent.innerHTML = `
        <h2>${stepData.message[selectedLanguage]}</h2>
    `;

    if (stepData.element) {
        const element = document.querySelector(stepData.element);
        if (element) highlightElement(element);
    }

    document.querySelector('.control-buttons').style.display = 'block';
    tutorialIsActive = true;
}

function startTutorial() {
    currentStep = 1;
    showTutorialStep(tutorialSteps[currentStep].step);
}

function nextTutorialStep() {
    currentStep++;
    if (currentStep >= tutorialSteps.length) {
        endTutorial();
    } else {
        showTutorialStep(tutorialSteps[currentStep].step);
    }
}

function previousTutorialStep() {
    currentStep--;
    if (currentStep < 0) {
        endTutorial();
    } else {
        showTutorialStep(tutorialSteps[currentStep].step);
    }
}

function endTutorial() {
    currentStep = 0;
    hideModal('assistant-modal');
    tutorialIsActive = false;
}

function updateProgressBar(current, total) {
    const progressBar = document.getElementById('tutorial-progress-bar');
    progressBar.style.width = `${(current / total) * 100}%`;
}

function speakText(text) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'pt' ? 'pt-BR' : selectedLanguage === 'en' ? 'en-US' : selectedLanguage === 'es' ? 'es-ES' : 'he-IL';
    
    const voices = speechSynthesis.getVoices();
    const femaleVoices = voices.filter(voice => voice.lang.startsWith(utterance.lang) && voice.name.includes("Female"));
    if (femaleVoices.length > 0) {
        utterance.voice = femaleVoices[0];
    } else {
        const defaultVoices = voices.filter(voice => voice.lang.startsWith(utterance.lang));
        if (defaultVoices.length > 0) {
            utterance.voice = defaultVoices[0];
        }
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    speechSynthesis.speak(utterance);
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
        <button onclick="purchaseRoteiro()">${translations[selectedLanguage].purchase}</button>
    `;
    showModal('info-modal');
}

function purchaseRoteiro() {
    console.log(translations[selectedLanguage].purchaseSuccess);
    showNotification(translations[selectedLanguage].purchaseSuccess, 'success');
    hideModal('info-modal');
}

function generateRoteiroFromInterests(interests) {
    const roteiro = interests.map(interest => `<li>${interest}</li>`);
    const totalPrice = interests.length * 50;
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

document.getElementById('close-menu-btn').addEventListener('click', closeSideMenu);

function collectInterestData() {
    const interests = [
        'Praias', 'Pontos Turísticos', 'Passeios', 'Restaurantes', 'Vida Noturna'
    ];
    showQuestionnaireForm(interests);
}

function showQuestionnaireForm(interests) {
    const form = document.getElementById('questionnaire-form');
    const formContainer = document.getElementById('assistant-modal');
    form.innerHTML = interests.map(interest => `
        <label>
            <input type="checkbox" name="interests" value="${interest}">
            ${interest}
        </label>
    `).join('');
    formContainer.style.display = 'block';
}

function showTips() {
    const modal = document.getElementById('tips-modal');
    const modalContent = modal.querySelector('.modal-content');
    const tips = translations[selectedLanguage].tipsContent;
    
    modalContent.innerHTML = `<pre>${tips}</pre>`;
    modal.style.display = 'block';
}

function showAbout() {
    const modal = document.getElementById('about-modal');
    const modalContent = modal.querySelector('.modal-content');
    const about = translations[selectedLanguage].aboutContent;
    
    modalContent.innerHTML = `<pre>${about}</pre>`;
    modal.style.display = 'block';
}

function showEducation() {
    const modal = document.getElementById('education-modal');
    const modalContent = modal.querySelector('.modal-content');
    displayCustomEducation();
    modalContent.innerHTML = ''; // Limpa o conteúdo do modal
    modal.style.display = 'block';
}

