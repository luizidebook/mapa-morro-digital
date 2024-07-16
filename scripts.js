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

// Modificação do setupEventListeners para chamar showAssistantModal nos cliques dos botões
function setupEventListeners() {
    const modal = document.getElementById('assistant-modal');
    const closeModal = document.querySelector('.close-btn');
    const menuToggle = document.getElementById('menu-btn');
    const floatingMenu = document.getElementById('floating-menu');
    const tutorialBtn = document.getElementById('tutorial-btn');
    const createItineraryBtn = document.getElementById('create-itinerary-btn');

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
            event.stopPropagation();

            let title, description, images;
            switch (feature) {
                case 'pontos-turisticos':
                    title = "Pontos Turísticos";
                    description = "Explore os pontos turísticos mais populares de Morro de São Paulo.";
                    images = [
                        "url-to-image1.jpg", 
                        "url-to-image2.jpg", 
                        "url-to-image3.jpg"
                    ];
                    break;
                case 'passeios':
                    title = "Passeios";
                    description = "Descubra os passeios disponíveis em Morro de São Paulo.";
                    images = [
                        "url-to-image4.jpg", 
                        "url-to-image5.jpg", 
                        "url-to-image6.jpg"
                    ];
                    break;
                case 'praias':
                    title = "Praias";
                    description = "Encontre as melhores praias de Morro de São Paulo.";
                    images = [
                        "url-to-image7.jpg", 
                        "url-to-image8.jpg", 
                        "url-to-image9.jpg"
                    ];
                    break;
                case 'festas':
                    title = "Festas e Eventos";
                    description = "Veja as festas e eventos acontecendo em Morro de São Paulo.";
                    images = [
                        "url-to-image10.jpg", 
                        "url-to-image11.jpg", 
                        "url-to-image12.jpg"
                    ];
                    break;
                case 'restaurantes':
                    title = "Restaurantes";
                    description = "Descubra os melhores restaurantes de Morro de São Paulo.";
                    images = [
                        "url-to-image13.jpg", 
                        "url-to-image14.jpg", 
                        "url-to-image15.jpg"
                    ];
                    break;
                case 'pousadas':
                    title = "Pousadas";
                    description = "Encontre as melhores pousadas para sua estadia em Morro de São Paulo.";
                    images = [
                        "url-to-image16.jpg", 
                        "url-to-image17.jpg", 
                        "url-to-image18.jpg"
                    ];
                    break;
                case 'lojas':
                    title = "Lojas";
                    description = "Descubra as lojas locais de Morro de São Paulo.";
                    images = [
                        "url-to-image19.jpg", 
                        "url-to-image20.jpg", 
                        "url-to-image21.jpg"
                    ];
                    break;
                case 'emergencias':
                    title = "Emergências";
                    description = "Informações importantes para situações de emergência.";
                    images = [
                        "url-to-image22.jpg", 
                        "url-to-image23.jpg", 
                        "url-to-image24.jpg"
                    ];
                    break;
                case 'dicas':
                    title = "Dicas";
                    description = "Dicas úteis para aproveitar ao máximo sua visita a Morro de São Paulo.";
                    images = [
                        "url-to-image25.jpg", 
                        "url-to-image26.jpg", 
                        "url-to-image27.jpg"
                    ];
                    break;
                case 'sobre':
                    title = "Sobre";
                    description = "Informações sobre a Morro Digital, nossa missão e serviços.";
                    images = [
                        "url-to-image28.jpg", 
                        "url-to-image29.jpg", 
                        "url-to-image30.jpg"
                    ];
                    break;
                case 'ensino':
                    title = "Ensino";
                    description = "Informações sobre opções de ensino disponíveis em Morro de São Paulo.";
                    images = [
                        "url-to-image31.jpg", 
                        "url-to-image32.jpg", 
                        "url-to-image33.jpg"
                    ];
                    break;
                default:
                    title = "Título do Modal";
                    description = "Descrição detalhada sobre o tópico selecionado.";
                    images = ["url-to-default-image1.jpg", "url-to-default-image2.jpg"];
                    break;
            }

            showAssistantModal(title, description, images);

            if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
                nextTutorialStep();
            }
        });
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
        closeSideMenu();
        collectInterestData();
    });
    document.getElementById('tutorial-next-btn').addEventListener('click', nextTutorialStep);
    document.getElementById('tutorial-prev-btn').addEventListener('click', previousTutorialStep);
    document.getElementById('tutorial-end-btn').addEventListener('click', endTutorial);

    document.querySelector('.menu-btn[data-feature="dicas"]').addEventListener('click', showTips);
    document.querySelector('.menu-btn[data-feature="ensino"]').addEventListener('click', showEducation);
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

// Função para mostrar o modal do assistente com as informações
function showAssistantModal(title, description, images) {
    const modal = document.getElementById('assistant-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Cria o conteúdo do modal
    let content = `
        <h2>${title}</h2>
        <p>${description}</p>
        <div class="carousel">
            ${images.map((img, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${img}" alt="${title} Image ${index + 1}">
                </div>
            `).join('')}
        </div>
    `;
    
    modalContent.innerHTML = content;
    modal.style.display = 'block';
    
    initializeCarousel();
}

// Função para carregar imagens do Yandex
async function loadImagesFromYandex(query) {
    const url = `https://yandex.com/images/search?text=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const imageElements = doc.querySelectorAll('.serp-item__thumb');
    const imageUrls = Array.from(imageElements).slice(0, 10).map(el => el.src);
    return imageUrls;
}

// Função para inicializar o carrossel de imagens
function initializeCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentItemIndex = 0;

    setInterval(() => {
        carouselItems[currentItemIndex].classList.remove('active');
        currentItemIndex = (currentItemIndex + 1) % carouselItems.length;
        carouselItems[currentItemIndex].classList.add('active');
    }, 3000);
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
            btn.onclick = () => handleSubmenuButtonClick(element.lat, element.lon, element.tags.name, element.tags.description || 'Descrição não disponível', element.tags.images || []);
            subMenu.appendChild(btn);
        }
    });
}

function displayCustomTours() {
    const tours = [
        { name: "Passeio de lancha Volta a Ilha de Tinharé", lat: -13.3800, lon: -38.9100, description: "Desfrute de um emocionante passeio de lancha ao redor da Ilha de Tinharé. Veja paisagens deslumbrantes e descubra segredos escondidos desta bela ilha.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Passeio de Quadriciclo para Garapuá", lat: -13.3600, lon: -38.9400, description: "Aventure-se em um emocionante passeio de quadriciclo até a pitoresca vila de Garapuá. Aproveite o caminho cheio de adrenalina e as paisagens naturais de tirar o fôlego.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Passeio 4X4 para Garapuá", lat: -13.3500, lon: -38.9500, description: "Embarque em uma viagem emocionante de 4x4 até Garapuá. Desfrute de uma experiência off-road única com vistas espetaculares e muita diversão.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Passeio de Barco para Gamboa", lat: -13.3700, lon: -38.9000, description: "Relaxe em um agradável passeio de barco até Gamboa. Desfrute da tranquilidade do mar e da beleza natural ao longo do caminho.", images: ["image1.jpg", "image2.jpg"] }
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
        { name: "Ambulância", lat: -13.3800, lon: -38.9100, description: "Serviço de ambulância disponível 24 horas para emergências. Contate pelo número: +55 75-99894-5017.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Unidade de Saúde", lat: -13.3600, lon: -38.9400, description: "Unidade de saúde local oferecendo cuidados médicos essenciais. Contato: +55 75-3652-1798.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Polícia Civil", lat: -13.3500, lon: -38.9500, description: "Delegacia da Polícia Civil pronta para assisti-lo em situações de emergência e segurança. Contato: +55 75-3652-1645.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Polícia Militar", lat: -13.3700, lon: -38.9000, description: "Posto da Polícia Militar disponível para garantir a sua segurança. Contato: +55 75-99925-0856.", images: ["image1.jpg", "image2.jpg"] }
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
        { name: "Melhores Pontos Turísticos", lat: -13.3700, lon: -38.9000, description: "Explore os pontos turísticos mais icônicos de Morro de São Paulo. Descubra locais históricos, vistas panorâmicas e atrações imperdíveis que tornarão sua visita inesquecível.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Passeios", lat: -13.3600, lon: -38.9400, description: "Descubra os passeios mais recomendados para aproveitar ao máximo Morro de São Paulo. Inclui opções de aventura e relaxamento.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Praias", lat: -13.3500, lon: -38.9500, description: "Explore as praias mais bonitas e relaxantes. Encontre o lugar perfeito para desfrutar do sol, areia e mar.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Restaurantes", lat: -13.3800, lon: -38.9100, description: "Desfrute da gastronomia local nos melhores restaurantes. Delicie-se com pratos típicos e sabores únicos.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Pousadas", lat: -13.3700, lon: -38.9000, description: "Hospede-se nas melhores pousadas que combinam conforto e charme. Encontre o lugar perfeito para relaxar após um dia de aventuras.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Melhores Lojas", lat: -13.3600, lon: -38.9400, description: "Descubra as melhores lojas para compras. Encontre souvenirs únicos e produtos locais que você só encontrará aqui.", images: ["image1.jpg", "image2.jpg"] }
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
        { name: "Missão", lat: -13.3700, lon: -38.9000, description: "Nossa missão é proporcionar a melhor experiência possível para os visitantes de Morro de São Paulo, destacando suas belezas naturais e culturais.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Serviços", lat: -13.3600, lon: -38.9400, description: "Oferecemos uma ampla gama de serviços para tornar sua estadia mais confortável e agradável, desde guias turísticos até serviços de emergência.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Turistas", lat: -13.3500, lon: -38.9500, description: "Aproveite ao máximo sua visita com nossos benefícios exclusivos para turistas, incluindo descontos em passeios e restaurantes.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Moradores", lat: -13.3800, lon: -38.9100, description: "Moradores de Morro de São Paulo têm acesso a uma série de benefícios, como programas de fidelidade e descontos especiais.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Pousadas", lat: -13.3700, lon: -38.9000, description: "Parcerias com pousadas locais garantem vantagens e descontos para os hóspedes, promovendo uma estadia confortável e econômica.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Restaurantes", lat: -13.3600, lon: -38.9400, description: "Restaurantes parceiros oferecem experiências gastronômicas inesquecíveis com descontos e menus exclusivos para nossos visitantes.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Agências de Turismo", lat: -13.3500, lon: -38.9500, description: "Agências de turismo têm acesso a ferramentas e recursos que facilitam a organização de passeios e atividades para os visitantes.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Lojas e Comércios", lat: -13.3800, lon: -38.9100, description: "Lojas e comércios locais oferecem produtos e serviços exclusivos com descontos para visitantes de Morro de São Paulo.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Benefícios para Transportes", lat: -13.3700, lon: -38.9000, description: "Facilite seu deslocamento com serviços de transporte confiáveis e acessíveis disponíveis para turistas e moradores.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Impacto em MSP", lat: -13.3600, lon: -38.9400, description: "Entenda o impacto positivo de nossas ações e serviços em Morro de São Paulo e como estamos contribuindo para a comunidade local.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Impacto na Bahia", lat: -13.3500, lon: -38.9500, description: "Saiba mais sobre como estamos promovendo o turismo e o desenvolvimento sustentável na Bahia.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Impacto no Brasil", lat: -13.3800, lon: -38.9100, description: "Nosso trabalho está ajudando a fortalecer o turismo e a economia em todo o Brasil. Descubra mais sobre nossos projetos nacionais.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Impacto no Mundo", lat: -13.3700, lon: -38.9000, description: "Veja como estamos levando o nome de Morro de São Paulo e do Brasil para o mundo, promovendo o turismo internacional.", images: ["image1.jpg", "image2.jpg"] }
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
        { name: "Iniciar Tutorial", lat: -13.3800, lon: -38.9100, description: "Comece seu tutorial para aprender a usar todas as ferramentas e recursos que oferecemos. Ideal para novos visitantes e usuários.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Planejar Viagem com IA", lat: -13.3600, lon: -38.9400, description: "Utilize a inteligência artificial para planejar sua viagem de forma personalizada e eficiente. Receba recomendações e dicas exclusivas.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Falar com IA", lat: -13.3500, lon: -38.9500, description: "Interaja com nossa inteligência artificial para obter informações, fazer perguntas e receber assistência em tempo real.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Falar com Suporte", lat: -13.3700, lon: -38.9000, description: "Precisa de ajuda? Fale com nosso suporte para resolver dúvidas e obter assistência rápida e eficiente.", images: ["image1.jpg", "image2.jpg"] },
        { name: "Configurações", lat: -13.3700, lon: -38.9000, description: "Personalize sua experiência ajustando as configurações de acordo com suas preferências e necessidades.", images: ["image1.jpg", "image2.jpg"] }
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
    createRouteTo([lat, lon]);
    showLocationDetailsInModal(name, description, images);
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

function showRouteModal(steps) {
    const routeModal = document.getElementById('route-modal');
    const routeStepsContainer = document.getElementById('route-steps');
    routeStepsContainer.innerHTML = ''; // Limpa o conteúdo anterior

    steps.forEach(step => {
        const stepElement = document.createElement('div');
        stepElement.className = 'route-step';
        stepElement.innerHTML = `<strong>${step.instruction}</strong><br>${step.distance} metros, ${step.duration} segundos`;
        routeStepsContainer.appendChild(stepElement);
    });

    routeModal.style.display = 'block';
}

function hideRouteModal() {
    document.getElementById('route-modal').style.display = 'none';
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
        position: 'topleft',
        showAlternatives: true,
        lineOptions: {
            styles: [{color: 'blue', opacity: 1, weight: 5}]
        },
        createMarker: function(i, waypoint, n) {
            var markerOptions = {
                draggable: true,
                icon: L.icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            };
            return L.marker(waypoint.latLng, markerOptions);
        },
        addWaypoints: false
    }).addTo(map);
}

function showLocationInfoModal(name) {
    const modalContent = `
        <h2>${name}</h2>
        <div class="carousel">
            <div class="carousel-item active"><img src="path/to/image1.jpg" alt="${name} image 1"></div>
            <div class="carousel-item"><img src="path/to/image2.jpg" alt="${name} image 2"></div>
            <div class="carousel-item"><img src="path/to/image3.jpg" alt="${name} image 3"></div>
        </div>
        <p>${translations[selectedLanguage].detailedInfo} ${name}</p>
    `;
    updateAssistantModalContent(modalContent);
    initializeCarousel();
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
            document.getElementById('create-itinerary-btn').style.display = 'inline-block';
            document.getElementById('tutorial-yes-btn').style.display = 'none';
            document.getElementById('tutorial-next-btn').style.display = 'none';
            document.getElementById('tutorial-prev-btn').style.display = 'none';
            document.getElementById('tutorial-end-btn').style.display = 'none';
        }
    },
];

function showTutorialStep(step) {
    const { element, message, action } = tutorialSteps.find(s => s.step === step);
    const targetElement = element ? document.querySelector(element) : null;

    updateAssistantModalContent(`<p>${message[selectedLanguage]}</p>`);
    speakText(message[selectedLanguage]);

    if (step === 'start-tutorial' || step === 'end-tutorial') {
        document.querySelector('.control-buttons').style.display = 'block';
        document.querySelector('#tutorial-yes-btn').textContent = translations[selectedLanguage].yes;
        document.querySelector('#tutorial-no-btn').textContent = translations[selectedLanguage].no;
    } else {
        document.querySelector('.control-buttons').style.display = 'none';
    }

    if (targetElement) {
        highlightElement(targetElement);
    }

    if (action) {
        action();
    }
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

function hideAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    modal.style.display = 'none';
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
}

function searchLocation() {
    // Exemplo básico de pesquisa por localização usando OSM Nominatim API
    var searchQuery = prompt("Digite o local que deseja buscar:");
    if (searchQuery) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    var firstResult = data[0];
                    var lat = firstResult.lat;
                    var lon = firstResult.lon;
                    map.setView([lat, lon], 14); // Centraliza o mapa no resultado da busca
                    L.marker([lat, lon]).addTo(map).bindPopup(firstResult.display_name).openPopup();
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
