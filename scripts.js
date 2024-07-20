document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    loadResources();
    activateAssistant();
    setupEventListeners();
    showWelcomeMessage();
    adjustModalAndControls();
    initializeCarousel(); // Inicializa o carrossel
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
let selectedDestination = null; // Variável global para armazenar o destino selecionado
let markers = []; // Array para armazenar os marcadores
let currentCarouselIndex = 0;
let currentMarker = null; 
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
10. Se cobra una tarifa al llegar a Morro de São Paulo. La tarifa por uso del patrimonio del archipiélago - TUPA cuesta R$ 50 por persona. Los niños menores de 5 y las personas mayores de 60 están exentos de la tarifa. El pago se puede realizar en el momento del desembarque, a través de la aplicación TUPA o en el sitio web tupadigital.com.br. Durante la temporada alta o los fines de semana, recomendamos pagar la tarifa con anticipación para evitar filas.`
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
    const modal = document.getElementById('assistant-modal');
    const closeModal = document.querySelector('.close-btn');
    const menuToggle = document.getElementById('menu-btn');
    const floatingMenu = document.getElementById('floating-menu');
    const tutorialBtn = document.getElementById('tutorial-btn');
    const createItineraryBtn = document.getElementById('create-itinerary-btn');
    const createRouteBtn = document.getElementById('create-route-btn');
    const noBtn = document.getElementById('no-btn');
    const subMenuButtons = document.querySelectorAll('.submenu-button');

    // Oculta o botão de alternância do menu inicialmente
    menuToggle.style.display = 'none';

    subMenuButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const feature = button.getAttribute('data-feature');
            handleFeatureSelection(feature);
            adjustModalAndControls(); // Ajuste modal e controles ao abrir submenu
            event.stopPropagation();
        });
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        endTutorial();
    });

    menuToggle.addEventListener('click', () => {
        floatingMenu.classList.toggle('hidden');
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'menu-toggle') {
            nextTutorialStep();
        }
    });

    document.getElementById('about-more-btn').addEventListener('click', () => {
        if (selectedDestination) {
            showAssistantModalWithCarousel(selectedDestination.name, selectedDestination.description, selectedDestination.images);
        } else {
            alert("Por favor, selecione um destino primeiro.");
        }
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

    document.querySelector('.menu-btn[data-feature="pesquisar"]').addEventListener('click', () => {
        searchLocation();
        closeSideMenu();
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'pesquisar') {
            nextTutorialStep();
        }
    });

    document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const feature = btn.getAttribute('data-feature');
            handleFeatureSelection(feature);
            adjustModalAndControls();
            event.stopPropagation();
            if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
                nextTutorialStep();
            }
        });
    });

document.getElementById('create-route-btn').addEventListener('click', () => {
    if (selectedDestination) {
        createRouteTo(Destination); // Cria a rota para o destino selecionado
    } else {
        alert("Por favor, selecione um destino primeiro.");
    }
});


    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.getAttribute('data-lang'));
            document.getElementById('welcome-modal').style.display = 'none';
            requestLocationPermission().then(() => {
                loadSearchHistory();
                checkAchievements();
                loadFavorites();
            }).catch(error => {
                console.error("Erro ao atualizar localização:", error);
            });
        });
    });

tutorialBtn.addEventListener('click', () => {
    stopSpeaking(); // Parar a fala
    if (tutorialIsActive) {
        endTutorial();
    } else {
        showTutorialStep('start-tutorial');
    }
});

    document.getElementById('tutorial-yes-btn').addEventListener('click', () => {
    startTutorial();
});

document.getElementById('tutorial-no-btn').addEventListener('click', () => {
    stopSpeaking(); // Parar a fala
    endTutorial();
});
    
    createItineraryBtn.addEventListener('click', () => {
        endTutorial();
        closeSideMenu();
        collectInterestData();
    });
    document.getElementById('tutorial-next-btn').addEventListener('click', nextTutorialStep);
    document.getElementById('tutorial-prev-btn').addEventListener('click', previousTutorialStep);
    document.getElementById('tutorial-end-btn').addEventListener('click', endTutorial);

    document.querySelector('.menu-btn[data-feature="dicas"]').addEventListener('click', showTips);
    document.querySelector('.menu-btn[data-feature="ensino"]').addEventListener('click', showEducation);

    createRouteBtn.addEventListener('click', () => {
        if (selectedDestination) {
            createRouteTo(selectedDestination); // Cria a rota para o destino selecionado
        } else {
            alert("Por favor, selecione um destino primeiro.");
        }
        hideControlButtons();
    });

    noBtn.addEventListener('click', () => {
        hideControlButtons();
    });
}

// Função para ajustar o modal e a posição dos botões de controle
function restoreModalAndControlsStyles() {
    const modal = document.getElementById('assistant-modal');
    const controlButtons = document.querySelector('.control-buttons');
    const mapContainer = document.getElementById('map');

    Object.assign(modal.style, {
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        maxWidth: '600px',
        background: 'white',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        zIndex: '100000',
        textAlign: 'center'
    });

    Object.assign(controlButtons.style, {
        left: '50%',
    });

    Object.assign(mapContainer.style, {
        width: '100%',
        height: '100%'
    });

    // Redimensionar o mapa
    if (map) {
        map.invalidateSize();
    }
}

function adjustModalAndControls() {
    const modal = document.getElementById('assistant-modal');
    const sideMenu = document.querySelector('.menu');
    const controlButtons = document.querySelector('.control-buttons');
    const mapContainer = document.getElementById('map');

    if (!sideMenu.classList.contains('hidden')) {
        Object.assign(modal.style, {
            left: `40%`
        });

        Object.assign(controlButtons.style, {
        left: '40%',
    });
        Object.assign(mapContainer.style, {
            width: `75%`,
            height:'100%'
        });

        adjustModalStyles();
    } else {
        restoreModalAndControlsStyles();
    }

    // Redimensionar o mapa
    if (map) {
        map.invalidateSize();
    }
}

function adjustModalStyles() {
    const modal = document.getElementById('assistant-modal');
    const sideMenu = document.querySelector('.menu');

    if (!sideMenu.classList.contains('hidden')) {
        Object.assign(modal.style, {
            top: '40%',
            left: `37%`,
            transform: 'translate(-50%, -50%)',
            width: '60%',
            maxWidth: '600px',
            background: 'white',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '12px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            zIndex: '100000',
            textAlign: 'center'
        });
    } else {
        restoreModalAndControlsStyles();
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

function fetchOSMDescription(lat, lon) {
    const query = `[out:json];node(around:100,${lat},${lon})["description"];out body;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(descriptionData => {
            if (descriptionData.elements.length > 0 && descriptionData.elements[0].tags.description) {
                return descriptionData.elements[0].tags.description;
            } else {
                return 'Descrição não disponível';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar descrição do OSM:', error);
            return 'Descrição não disponível';
        });
}


function requestLocationPermission() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(position => {
            currentLocation = position.coords;
            adjustMapWithLocationUser(currentLocation.latitude, currentLocation.longitude);
            if (!tutorialIsActive) {
                showTutorialStep('start-tutorial');
            }
            resolve();
        }, error => {
            alert(translations[selectedLanguage].locationPermissionDenied);
            reject(error);
        });
    });
}

function adjustMapWithLocationUser(lat, lon, name) {
    map.setView([lat, lon], 14); // Zoom máximo
    const marker = L.marker([lat, lon]).addTo(map).bindPopup(name || translations[selectedLanguage].youAreHere).openPopup();
    map.panTo([lat, lon]);
     // Centraliza o mapa no ponto selecionado
}

function adjustMapWithLocation(lat, lon, name, description) {
    map.setView([lat, lon], 14); // Zoom máximo
    const marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${name}</b><br>${description}`).openPopup();
    markers.push(marker); // Adicionar o marcador à array markers
    map.panTo([lat, lon]); // Centraliza o mapa no ponto selecionado
}

function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}

function showUserLocationPopup(lat, lon) {
    L.popup()
        .setLatLng([lat, lon])
        .setContent(translations[selectedLanguage].youAreHere)
        .openOn(map);
}

function showModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'block';
}

function showMenuToggleButton() {
    const menuToggle = document.getElementById('menu-btn');
    menuToggle.style.display = 'block';
}

function toggleFloatingMenu() {
    const floatingMenu = document.getElementById('floating-menu');
    floatingMenu.classList.toggle('hidden');

    if (tutorialIsActive && tutorialSteps[currentStep].step === 'menu-toggle') {
        nextTutorialStep();
    }
}

function hideModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'none';
}

function addImagesToCarousel(location) {
    const images = getImagesForLocation(location); // Função para obter imagens do local
    const name = location.name;
    const description = location.description;

    showLocationDetailsInModal(name, description, images);
}

function getImagesForLocation(location) {
    // Função simulada para obter imagens com base no local
    // Em um caso real, você pode fazer uma chamada de API ou usar um banco de dados para obter essas imagens
    const imageDatabase = {
        'Toca do Morcego': [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
            'https://example.com/image3.jpg'
        ],
        'Farol do Morro': [
            'https://example.com/farol1.jpg',
            'https://example.com/farol2.jpg'
        ],
        // Adicione mais locais e imagens conforme necessário
    };

    return imageDatabase[location.name] || [];
}

function showAssistantModalWithCarousel(title, description, images) {
    const modal = document.getElementById('assistant-modal');
    const modalContent = modal.querySelector('.modal-content');
    const carousel = modalContent.querySelector('.carousel');

    // Limpa o conteúdo do carrossel
    carousel.innerHTML = '';

    // Adiciona imagens ao carrossel
    images.forEach((imgSrc, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        if (index === 0) {
            carouselItem.classList.add('active');
        }
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `${title} Image ${index + 1}`;
        carouselItem.appendChild(img);
        carousel.appendChild(carouselItem);
    });

    // Adiciona título e descrição ao modal
    const modalText = document.getElementById('assistant-modal-text');
    modalText.innerHTML = `
        <h2>${title}</h2>
        <p>${description}</p>
    `;

    // Exibe o modal
    modal.style.display = 'block';

    // Inicializa o carrossel
    initializeCarousel();
}



// Função para ocultar o modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Exemplo de chamada com dados estáticos (para teste)
const title = "Toca do Morcego";
const description = "Bem-vindo à Toca do Morcego, onde a magia do pôr do sol ganha vida e cria memórias inesquecíveis!";
const images = [
    "url_da_imagem1.jpg",
    "url_da_imagem2.jpg",
    "url_da_imagem3.jpg"
];

// Função para inicializar o carrossel
function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    const items = carousel.querySelectorAll('.carousel-item');
    const totalItems = items.length;
    let currentIndex = 0;

    function showItem(index) {
        items.forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) {
                item.classList.add('active');
            }
        });
    }

    function nextItem() {
        currentIndex = (currentIndex + 1) % totalItems;
        showItem(currentIndex);
    }

    function prevItem() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        showItem(currentIndex);
    }

    // Navegação automática a cada 3 segundos
    setInterval(nextItem, 3000);

    // Adicionar botões de navegação
    const prevButton = document.createElement('button');
    prevButton.classList.add('prev');
    prevButton.innerHTML = '&#10094;';
    prevButton.addEventListener('click', prevItem);
    carousel.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.classList.add('next');
    nextButton.innerHTML = '&#10095;';
    nextButton.addEventListener('click', nextItem);
    carousel.appendChild(nextButton);

    // Adicionar indicadores
    const indicators = document.createElement('div');
    indicators.classList.add('carousel-indicators');
    items.forEach((item, index) => {
        const indicator = document.createElement('button');
        indicator.addEventListener('click', () => {
            showItem(index);
            currentIndex = index;
        });
        indicators.appendChild(indicator);
    });
    carousel.appendChild(indicators);

    showItem(currentIndex);
}

// Função para ocultar o modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}




function highlightElement(element) {
    removeExistingHighlights();

    const rect = element.getBoundingClientRect();
    const circleHighlight = document.createElement('div');
    const arrowHighlight = document.createElement('div');

    circleHighlight.className = 'circle-highlight';
    circleHighlight.style.position = 'absolute';
    circleHighlight.style.top = `${rect.top + window.scrollY - 3}px`;
    circleHighlight.style.left = `${rect.left + window.scrollX - 3}px`;
    circleHighlight.style.width = `${rect.width}px`;
    circleHighlight.style.height = `${rect.height}px`;
    circleHighlight.style.border = '3px solid red';
    circleHighlight.style.borderRadius = '50%';
    circleHighlight.style.zIndex = '9999';

    arrowHighlight.className = 'arrow-highlight';
    arrowHighlight.style.position = 'absolute';
    arrowHighlight.style.top = `${rect.top + window.scrollY - 24}px`;
    arrowHighlight.style.left = `${rect.left + window.scrollX + rect.width / 2 - 15}px`;
    arrowHighlight.style.width = '0';
    arrowHighlight.style.height = '0';
    arrowHighlight.style.borderLeft = '15px solid transparent';
    arrowHighlight.style.borderRight = '15px solid transparent';
    arrowHighlight.style.zIndex = '999999';
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
    requestLocationPermission().then(() => {
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
    }).setView([-13.410, -38.913], 13);

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

function showUserLocationPopup(lat, lon) {
    L.popup()
        .setLatLng([lat, lon])
        .setContent(translations[selectedLanguage].youAreHere)
        .openOn(map);
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

    clearMarkers();

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

    if (subMenuId === 'tours-submenu') {
        displayCustomTours();
    } else if (subMenuId === 'emergencies-submenu') {
        displayCustomEmergencies();
    } else if (subMenuId === 'tips-submenu') {
        displayCustomTips();
    } else if (subMenuId === 'about-submenu') {
        displayCustomAbout();
    } else if (subMenuId === 'education-submenu') {
        displayCustomEducation();
    } else {
        fetchOSMData(queries[subMenuId]).then(data => {
            if (data) {
                displayOSMData(data, subMenuId);
            }
        });
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
            const description = element.tags.description || 'Descrição não disponível';
            btn.onclick = () => {
                clearMarkers(); // Limpar marcadores antes de adicionar um novo
                handleSubmenuButtonClick(element.lat, element.lon, element.tags.name, description, element.tags.images || []);
            };
            subMenu.appendChild(btn);

            const marker = L.marker([element.lat, element.lon]).addTo(map).bindPopup(`<b>${element.tags.name}</b><br>${description}`);
            markers.push(marker);
        }
    });
}




function displayCustomTours() {
    const tours = [
        { name: "Passeio de lancha Volta a Ilha de Tinharé", lat: -13.3837729, lon: -38.9085360, description: "Desfrute de um emocionante passeio de lancha ao redor da Ilha de Tinharé. Veja paisagens deslumbrantes e descubra segredos escondidos desta bela ilha.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Passeio de Quadriciclo para Garapuá", lat: -13.3827765, lon: -38.9105500, description: "Aventure-se em um emocionante passeio de quadriciclo até a pitoresca vila de Garapuá. Aproveite o caminho cheio de adrenalina e as paisagens naturais de tirar o fôlego.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Passeio 4X4 para Garapuá", lat: -13.3808638, lon: -38.9127107, description: "Embarque em uma viagem emocionante de 4x4 até Garapuá. Desfrute de uma experiência off-road única com vistas espetaculares e muita diversão.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Passeio de Barco para Gamboa", lat: -13.3766536, lon: -38.9186205, description: "Relaxe em um agradável passeio de barco até Gamboa. Desfrute da tranquilidade do mar e da beleza natural ao longo do caminho.", images: ["image1.jpg", "image2.jpg"] }
    ];

    const subMenu = document.getElementById('tours-submenu'); 
    subMenu.innerHTML = '';
    
    tours.forEach(tour => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = tour.name;
        btn.onclick = () => handleSubmenuButtonClick(tour.lat, tour.lon, tour.name, tour.description, tour.images);
        subMenu.appendChild(btn);

        const marker = L.marker([tour.lat, tour.lon]).addTo(map).bindPopup(tour.name, tour.description);
        markers.push(marker);
    });
}

function displayCustomEmergencies() {
    const emergencies = [
        { name: "Ambulância", lat: -13.3773, lon: -38.9171, description: "Serviço de ambulância disponível 24 horas para emergências. Contate pelo número: +55 75-99894-5017.", images: ["https://yandex.com/images/search?text=ambulância", "https://yandex.com/images/search?text=ambulância"] },
        { name: "Unidade de Saúde", lat: -13.3773300, lon: -38.9171, description: "Unidade de saúde local oferecendo cuidados médicos essenciais. Contato: +55 75-3652-1798.", images: ["https://yandex.com/images/search?text=unidade%20saúde", "https://yandex.com/images/search?text=unidade%20saúde"] },
        { name: "Polícia Civil", lat: -13.3775, lon: -38.9150414, description: "Delegacia da Polícia Civil pronta para assisti-lo em situações de emergência e segurança. Contato: +55 75-3652-1645.", images: ["https://yandex.com/images/search?text=polícia%20civil", "https://yandex.com/images/search?text=polícia%20civil"] },
        { name: "Polícia Militar", lat: -13.3775, lon: -38.9150, description: "Posto da Polícia Militar disponível para garantir a sua segurança. Contato: +55 75-99925-0856.", images: ["https://yandex.com/images/search?text=polícia%20militar", "https://yandex.com/images/search?text=polícia%20militar"] }
    ];

    const subMenu = document.getElementById('emergencies-submenu');
    subMenu.innerHTML = '';
    
    emergencies.forEach(emergency => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = emergency.name;
        btn.onclick = () => handleSubmenuButtonClick(emergency.lat, emergency.lon, emergency.name, emergency.description, emergency.images);
        subMenu.appendChild(btn);

        const marker = L.marker([emergency.lat, emergency.lon]).addTo(map).bindPopup(emergency.name, emergency.description);
        markers.push(marker);
    });
}

function displayCustomTips() {
    const tips = [
        { name: "Melhores Pontos Turísticos", lat: -13.3766787, lon: -38.9172057, description: "Explore os pontos turísticos mais icônicos de Morro de São Paulo. Descubra locais históricos, vistas panorâmicas e atrações imperdíveis que tornarão sua visita inesquecível.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Passeios", lat: -13.3766787, lon: -38.9172057, description: "Descubra os passeios mais recomendados para aproveitar ao máximo Morro de São Paulo. Inclui opções de aventura e relaxamento.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Praias", lat: -13.3766787, lon: -38.9172057, description: "Explore as praias mais bonitas e relaxantes. Encontre o lugar perfeito para desfrutar do sol, areia e mar.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Restaurantes", lat: -13.3766787, lon: -38.9172057, description: "Desfrute da gastronomia local nos melhores restaurantes. Delicie-se com pratos típicos e sabores únicos.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Pousadas", lat: -13.3766787, lon: -38.9172057, description: "Hospede-se nas melhores pousadas que combinam conforto e charme. Encontre o lugar perfeito para relaxar após um dia de aventuras.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Lojas", lat: -13.3766787, lon: -38.9172057, description: "Descubra as melhores lojas para compras. Encontre souvenirs únicos e produtos locais que você só encontrará aqui.", images: ["image1.jpg", "image2.jpg"] }
    ];

    const subMenu = document.getElementById('tips-submenu');
    subMenu.innerHTML = '';
    
    tips.forEach(tip => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = tip.name;
        btn.onclick = () => handleSubmenuButtonClick(tip.lat, tip.lon, tip.name, tip.description, tip.images);
        subMenu.appendChild(btn);

        const marker = L.marker([tip.lat, tip.lon]).addTo(map).bindPopup(tip.name, tip.description);
        markers.push(marker);
    });
}

function displayCustomEducation() {
    const education = [
        { name: "Iniciar Tutorial", lat: -13.3766787, lon: -38.9172057, description: "Comece seu tutorial para aprender a usar todas as ferramentas e recursos que oferecemos. Ideal para novos visitantes e usuários.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Planejar Viagem com IA", lat: -13.3766787, lon: -38.9172057, description: "Utilize a inteligência artificial para planejar sua viagem de forma personalizada e eficiente. Receba recomendações e dicas exclusivas.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Falar com IA", lat: -13.3766787, lon: -38.9172057, description: "Interaja com nossa inteligência artificial para obter informações, fazer perguntas e receber assistência em tempo real.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Falar com Suporte", lat: -13.3766787, lon: -38.9172057, description: "Precisa de ajuda? Fale com nosso suporte para resolver dúvidas e obter assistência rápida e eficiente.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Configurações", lat: -13.3766787, lon: -38.9172057, description: "Personalize sua experiência ajustando as configurações de acordo com suas preferências e necessidades.", images: ["image1.jpg", "image2.jpg"] }
    ];

    const subMenu = document.getElementById('education-submenu');
    subMenu.innerHTML = '';
    
    education.forEach(info => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = info.name;
        btn.onclick = () => {
            if (info.name === "Iniciar Tutorial") {
                hideSideMenuAndFloatingMenu();
                startTutorial();
            } else {
                handleSubmenuButtonClick(info.lat, info.lon, info.name, info.description, info.images);
            }
        };
        subMenu.appendChild(btn);

        const marker = L.marker([info.lat, info.lon]).addTo(map).bindPopup(info.name, info.description);
        markers.push(marker);
    });
}


function closeSideMenu() {
    const menu = document.getElementById('menu');
    if (menu) {
        menu.style.display = 'none';
    }
}

function hideFloatingMenu() {
    const floatingMenu = document.getElementById('floating-menu');
    if (floatingMenu) {
        floatingMenu.style.display = 'none';
    }
}


function displayCustomEducation() {
    const education = [
        { name: "Iniciar Tutorial", lat: -13.3766787, lon: -38.9172057, description: "Comece seu tutorial para aprender a usar todas as ferramentas e recursos que oferecemos. Ideal para novos visitantes e usuários.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Planejar Viagem com IA", lat: -13.3766787, lon: -38.9172057, description: "Utilize a inteligência artificial para planejar sua viagem de forma personalizada e eficiente. Receba recomendações e dicas exclusivas.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Falar com IA", lat: -13.3766787, lon: -38.9172057, description: "Interaja com nossa inteligência artificial para obter informações, fazer perguntas e receber assistência em tempo real.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Falar com Suporte", lat: -13.3766787, lon: -38.9172057, description: "Precisa de ajuda? Fale com nosso suporte para resolver dúvidas e obter assistência rápida e eficiente.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Configurações", lat: -13.3766787, lon: -38.9172057, description: "Personalize sua experiência ajustando as configurações de acordo com suas preferências e necessidades.", images: ["image1.jpg", "image2.jpg"] }
    ];

    const subMenu = document.getElementById('education-submenu');
    subMenu.innerHTML = '';
    
    education.forEach(info => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = info.name;
        btn.onclick = () => {
            if (info.name === "Iniciar Tutorial") {
                startTutorial();
            } else {
                handleSubmenuButtonClick(info.lat, info.lon, info.name, info.description, info.images);
            }
        };
        subMenu.appendChild(btn);

        const marker = L.marker([info.lat, info.lon]).addTo(map).bindPopup(info.name, info.description);
        markers.push(marker);
    });
}


function handleSubmenuButtonClick(lat, lon, name, description, images) {
    clearMarkers(); // Limpar marcadores antes de adicionar um novo
    adjustMapWithLocation(lat, lon, name, description);
    showControlButtons();
    const locationImages = getImagesForLocation(name); // Obtém as imagens com base no nome do local
    showLocationDetailsInModal(name, description, images); // Passe a array de imagens correta
    selectedDestination = name;
}


function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];

 }




function showLocationDetailsInModal(name, description, images) {
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    const carouselContainer = modalContent.querySelector('.carousel');
    
    // Limpar o carrossel existente
    carouselContainer.innerHTML = '';

    // Adicionar novas imagens ao carrossel
    images.forEach((image, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = `${name} Image ${index + 1}`;
        carouselItem.appendChild(imgElement);
        carouselContainer.appendChild(carouselItem);
    });

    // Adicionar título e descrição
    const infoContent = document.createElement('div');
    infoContent.innerHTML = `
        <h2>${name}</h2>
        <p>${description}</p>
    `;
    modalContent.appendChild(infoContent);
    showModal('assistant-modal');

    initializeCarousel();
}

function createRouteTo(destination) {
    if (routingControl) {
        map.removeControl(routingControl);
    }
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(currentLocation.latitude, currentLocation.longitude),
            L.latLng(destination.lat, destination.lon)
        ],
        routeWhileDragging: true,
        position: 'topleft',
        createMarker: function(i, waypoint, n) {
            const markerOptions = {
                draggable: false,
                icon: L.icon({
                    iconUrl: i === 0 ? 'start-icon.png' : 'end-icon.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            };
            return L.marker(waypoint.latLng, markerOptions).bindPopup(i === 0 ? 'Ponto de Partida' : 'Destino');
        },
        router: L.Routing.openrouteservice(OPENROUTESERVICE_API_KEY)
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
            pt: "Encontre as melhores pousadas para sua estadia em Morro de São Paulo. Clique em uma pousada para ver disponibilidade e preços.",
            en: "Find the best inns for your stay in Morro de São Paulo. Click on an inn to see availability and prices.",
            es: "Encuentra las mejores posadas para tu estadía en Morro de São Paulo. Haz clic en una posada para ver disponibilidad y precios.",
            he: "מצא את הפונדקים הטובים ביותר לשהותך במורו דה סאו פאולו. לחץ על פונדק כדי לראות זמינות ומחירים."
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
            pt: "Descubra as lojas locais de Morro de São Paulo. Clique em uma loja para ver os produtos oferecidos e a localização.",
            en: "Discover the local shops in Morro de São Paulo. Click on a shop to see the products offered and the location.",
            es: "Descubre las tiendas locales de Morro de São Paulo. Haz clic en una tienda para ver los productos ofrecidos y la ubicación.",
            he: "גלה את החנויות המקומיות במורו דה סאו פאולו. לחץ על חנות כדי לראות את המוצרים המוצעים והמיקום."
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
            pt: "Aqui você encontra informações importantes para situações de emergência em Morro de São Paulo, como hospitais e delegacias.",
            en: "Here you find important information for emergency situations in Morro de São Paulo, such as hospitals and police stations.",
            es: "Aquí encuentras información importante para situaciones de emergencia en Morro de São Paulo, como hospitales y comisarías.",
            he: "כאן תמצא מידע חשוב למצבי חירום במורו דה סאו פאולו, כגון בתי חולים ותחנות משטרה."
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
            pt: "Encontre dicas úteis para aproveitar ao máximo sua visita a Morro de São Paulo, incluindo sugestões de segurança e melhores práticas.",
            en: "Find useful tips to make the most of your visit to Morro de São Paulo, including safety suggestions and best practices.",
            es: "Encuentra consejos útiles para aprovechar al máximo tu visita a Morro de São Paulo, incluidas sugerencias de seguridad y mejores prácticas.",
            he: "מצא טיפים שימושיים למקסם את ביקורך במורו דה סאו פאולו, כולל הצעות בטיחות ונהלים מומלצים."
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
            pt: "Use este botão para aproximar a visualização do mapa e ver mais detalhes sobre a área exibida.",
            en: "Use this button to zoom in on the map and see more details about the displayed area.",
            es: "Usa este botón para acercar el mapa y ver más detalles sobre el área mostrada.",
            he: "השתמש בכפתור זה כדי להתקרב למפה ולראות פרטים נוספים על האזור המוצג."
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
            pt: "Use este botão para afastar a visualização do mapa e ter uma visão mais ampla da região.",
            en: "Use this button to zoom out on the map and get a broader view of the region.",
            es: "Usa este botón para alejar el mapa y tener una vista más amplia de la región.",
            he: "השתמש בכפתור זה כדי להתרחק מהמפה ולקבל מבט רחב יותר על האזור."
        },
        action: () => {
            const element = document.querySelector('.menu-btn.zoom-out');
            highlightElement(element);
        }
    },
    {
        step: 'pesquisar',
        element: '.menu-btn[data-feature="pesquisar"]',
        message: {
            pt: "Use este botão para buscar locais em Morro de São Paulo. Digite o nome do local que deseja buscar e clique em 'Buscar'.",
            en: "Use this button to search for locations in Morro de São Paulo. Enter the name of the location you want to search for and click 'Search'.",
            es: "Usa este botón para buscar lugares en Morro de São Paulo. Ingresa el nombre del lugar que deseas buscar y haz clic en 'Buscar'.",
            he: "השתמש בכפתור זה כדי לחפש מיקומים במורו דה סאו פאולו. הכנס את שם המיקום שברצונך לחפש ולחץ על 'חפש'."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="pesquisar"]');
            highlightElement(element);
        }
    },
    {
        step: 'sobre',
        element: '.menu-btn[data-feature="sobre"]',
        message: {
            pt: "Aqui você encontra informações sobre a Morro Digital, nossa missão e os serviços que oferecemos.",
            en: "Here you find information about Morro Digital, our mission, and the services we offer.",
            es: "Aquí encuentras información sobre Morro Digital, nuestra misión y los servicios que ofrecemos.",
            he: "כאן תמצא מידע על מורו דיגיטל, המשימה שלנו והשירותים שאנו מציעים."
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
            pt: "Aqui você encontra informações sobre opções de ensino e aprendizado disponíveis em Morro de São Paulo.",
            en: "Here you find information about education and learning options available in Morro de São Paulo.",
            es: "Aquí encuentras información sobre opciones de educación y aprendizaje disponibles en Morro de São Paulo.",
            he: "כאן תמצא מידע על אפשרויות חינוך ולמידה זמינות במורו דה סאו פאולו."
        },
        action: () => {
            const element = document.querySelector('.menu-btn[data-feature="ensino"]');
            highlightElement(element);
        }
    },
    {
            step: 'end-tutorial',
    message: {
        pt: "Parabéns! Você concluiu o tutorial! Você gostaria de criar um roteiro de atividades para se fazer em Morro de São Paulo personalizado de acordo com as suas preferências?",
        en: "Congratulations! You have completed the tutorial! Would you like to create a personalized activity itinerary for Morro de São Paulo based on your preferences?",
        es: "¡Felicitaciones! ¡Has completado el tutorial! ¿Te gustaría crear un itinerario de actividades personalizado para Morro de São Paulo según tus preferencias?",
        he: "מזל טוב! סיימת את המדריך! האם תרצה ליצור מסלול פעילויות מותאם אישית למורו דה סאו פאולו בהתבסס על ההעדפות שלך?"
    },
    action: () => {
        document.getElementById('tutorial-no-btn').style.display = 'inline-block';
        document.getElementById('tutorial-yes-btn').style.display = 'none';
        document.getElementById('create-itinerary-btn').style.display = 'inline-block';
        document.getElementById('create-route-btn').style.display = 'none';
    }
  }
];

function showTutorialStep(step) {
    const { element, message, action } = tutorialSteps.find(s => s.step === step);
    const targetElement = element ? document.querySelector(element) : null;

    updateAssistantModalContent(`<p>${message[selectedLanguage]}</p>`);
    speakText(message[selectedLanguage]);

    if (step === 'start-tutorial') {
        document.querySelector('.control-buttons').style.display = 'flex';
        document.querySelector('#tutorial-yes-btn').textContent = translations[selectedLanguage].yes;
        document.querySelector('#tutorial-no-btn').textContent = translations[selectedLanguage].no;

        // Oculta o botão de alternância do menu até o usuário clicar em "sim"
        const menuToggle = document.getElementById('menu-btn');
        menuToggle.style.display = 'none';
    } else if (step === 'menu-toggle') {
        const menuToggle = document.getElementById('menu-btn');
        menuToggle.style.display = 'block';
        highlightElement(menuToggle);
    } else if (step === 'end-tutorial') {
        document.querySelector('.control-buttons').style.display = 'flex';
    }

    if (targetElement) {
        highlightElement(targetElement);
    }

    if (action) {
        action();
    }
}

function hideSideMenuAndFloatingMenu() {
    const sideMenu = document.getElementById('menu');
    const floatingMenu = document.getElementById('floating-menu');
    if (sideMenu) sideMenu.style.display = 'none';
    if (floatingMenu) floatingMenu.classList.add('hidden');
}

function endTutorial() {
    tutorialIsActive = false;
    removeExistingHighlights();
    showMenuToggleButton();
    hideAssistantModal();
    closeSideMenu();

    const overlay = document.getElementById('tutorial-overlay');
    overlay.style.display = 'none';

    const controlButtons = document.querySelector('.control-buttons');
    controlButtons.style.display = 'none';

    // Reseta o progresso da barra de progresso
    const progressBar = document.getElementById('tutorial-progress-bar');
    progressBar.style.width = '0%';

    // Oculta botões específicos
    document.getElementById('tutorial-no-btn').style.display = 'none';
    document.getElementById('create-itinerary-btn').style.display = 'none';
    document.getElementById('tutorial-yes-btn').style.display = 'none';
    document.getElementById('tutorial-next-btn').style.display = 'none';
    document.getElementById('tutorial-prev-btn').style.display = 'none';
    document.getElementById('tutorial-end-btn').style.display = 'none';
    document.getElementById('create-route-btn').style.display = 'none';

    // Reseta a etapa atual do tutorial
    currentStep = 0;
}

function nextTutorialStep() {
    if (currentStep < tutorialSteps.length - 1) {
        currentStep++;
        showTutorialStep(tutorialSteps[currentStep].step);
        updateProgressBar(currentStep, tutorialSteps.length);
    } else {
        endTutorial(); // Encerra o tutorial corretamente
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
    hideFloatingMenu();
    closeSideMenu();
    showTutorialStep(tutorialSteps[currentStep].step);
    document.getElementById('tutorial-overlay').style.display = 'flex';
}

function hideAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    modal.style.display = 'none';
    showMenuToggleButton();
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

function closeSideMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = 'none';
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    currentSubMenu = null;
    restoreModalAndControlsStyles();
}

function searchLocation() {
    var searchQuery = prompt("Digite o local que deseja buscar em Morro de São Paulo:");
    if (searchQuery) {
        // Coordenadas aproximadas para a área de Morro de São Paulo
        const viewBox = '-38.926, -13.369, -38.895, -13.392'; // (lon_min, lat_min, lon_max, lat_max)
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewBox}&bounded=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Filtrar resultados para garantir que estejam dentro da área de Morro de São Paulo
                    const filteredData = data.filter(location => {
                        const lat = parseFloat(location.lat);
                        const lon = parseFloat(location.lon);
                        return lon >= -38.926 && lon <= -38.895 && lat >= -13.392 && lat <= -13.369;
                    });

                    if (filteredData.length > 0) {
                        var firstResult = filteredData[0];
                        var lat = firstResult.lat;
                        var lon = firstResult.lon;

                        // Remove o marcador anterior, se existir
                        if (currentMarker) {
                            map.removeLayer(currentMarker);
                        }

                        // Adiciona o novo marcador e atualiza o mapa
                        currentMarker = L.marker([lat, lon]).addTo(map).bindPopup(firstResult.display_name).openPopup();
                        map.setView([lat, lon], 14);
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


// Adicione estas funções ao seu código JavaScript para aplicar os estilos e ajustar o modal

// Função para ajustar o conteúdo do popup da OSM
function customizeOSMPopup(popup) {
    const popupContent = popup.getElement().querySelector('.leaflet-popup-content');
    popupContent.style.fontSize = '12px';
    popupContent.style.maxWidth = '200px'; // Reduz o tamanho máximo do modal

    const popupWrapper = popup.getElement().querySelector('.leaflet-popup-content-wrapper');
    popupWrapper.style.padding = '10px';

    const popupTipContainer = popup.getElement().querySelector('.leaflet-popup-tip-container');
    popupTipContainer.style.width = '20px';
    popupTipContainer.style.height = '10px';

    // Ajuste os botões
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

// Certifique-se de chamar a função customizeOSMPopup ao criar ou abrir um popup
L.marker([lat, lon]).addTo(map)
    .bindPopup(`<b>${name}</b><br>${description}`)
    .on('popupopen', function (e) {
        customizeOSMPopup(e.popup);
    });


function showControlButtons() {
    const controlButtons = document.querySelector('.control-buttons');
    document.getElementById('tutorial-no-btn').style.display = 'none';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-yes-btn').style.display = 'none';
    document.getElementById('create-itinerary-btn').style.display = 'none';
    document.getElementById('tutorial-next-btn').style.display = 'none';
    document.getElementById('tutorial-prev-btn').style.display = 'none';
    document.getElementById('tutorial-end-btn').style.display = 'none';
    controlButtons.style.display = 'flex';
}

function hideControlButtons() {
    const controlButtons = document.querySelector('.control-buttons');
    controlButtons.style.display = 'none';
}


function collectInterestData() {
    console.log('Collecting interest data to create a custom route...');
}
