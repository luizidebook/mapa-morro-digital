document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeMap();
        loadResources();
        activateAssistant();
        setupEventListeners();
        showWelcomeMessage();
        adjustModalAndControls();
        initializeTutorialListeners();
        setupSubmenuClickListeners();


        // Initialize Swiper after the page is fully loaded
        var swiper = new Swiper('.swiper-container', {
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
            breakpoints: {
                // when window width is >= 640px
                640: {
                    slidesPerView: 1,
                    spaceBetween: 20
                },
                // when window width is >= 768px
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                // when window width is >= 1024px
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 40
                }
            }
        });
    } catch (error) {
        console.error('Erro ao inicializar o aplicativo:', error);
    }
});

let map;
let currentSubMenu;
let currentLocation = null;
let selectedLanguage = getLocalStorageItem('preferredLanguage', 'pt');
let currentStep = 0;
let tutorialIsActive = false;
let searchHistory = getLocalStorageItem('searchHistory', []);
let achievements = getLocalStorageItem('achievements', []);
let favorites = getLocalStorageItem('favorites', []);
let routingControl = null;
let speechSynthesisUtterance = new SpeechSynthesisUtterance();
let voices = [];
let selectedDestination = {};
let markers = [];
let currentIndex = 0;
let currentMarker = null;
let swiperInstance = null;

const OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
const initialImages = [];
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

function getLocalStorageItem(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error(`Erro ao obter ${key} do localStorage:`, error);
        return defaultValue;
    }
}

// Função para configurar os event listeners
function setupEventListeners() {
    const modal = document.getElementById('assistant-modal');
    const closeModal = document.querySelector('.close-btn');
    const menuToggle = document.getElementById('menu-btn');
    const floatingMenu = document.getElementById('floating-menu');
    const tutorialBtn = document.getElementById('tutorial-btn');
    const createItineraryBtn = document.getElementById('create-itinerary-btn');
    const createRouteBtn = document.getElementById('create-route-btn');
    const noBtn = document.getElementById('no-btn');
    const saveItineraryBtn = document.getElementById('save-itinerary-btn');
    const aboutMoreBtn = document.getElementById('about-more-btn');
    const searchBtn = document.querySelector('.menu-btn[data-feature="pesquisar"]');
    const ensinoBtn = document.querySelector('.menu-btn[data-feature="ensino"]');
    const carouselModalClose = document.getElementById('carousel-modal-close');
   

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
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

    const buyTicketBtn = document.getElementById('buy-ticket-btn');
    if (buyTicketBtn) {
        buyTicketBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    const tourBtn = document.getElementById('tour-btn');
    if (tourBtn) {
        tourBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

    // Exemplo de listeners adicionais
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Menu button ${button.getAttribute('data-feature')} clicked.`);
        });
    });

    const floatingMenuButtons = document.querySelectorAll('#floating-menu .menu-btn');
    floatingMenuButtons.forEach(button => {
        button.addEventListener('click', () => {
            nextTutorialStep();
            console.log(`Floating menu button ${button.getAttribute('data-feature')} clicked.`);
        });
    });

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

    document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const feature = btn.getAttribute('data-feature');
            console.log(`Feature selected: ${feature}`);
            handleFeatureSelection(feature);
            adjustModalAndControls();
            closeCarouselModal();
            removeExistingHighlights();
            removeFloatingMenuHighlights();
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

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchLocation();
            closeSideMenu();
            if (tutorialIsActive && tutorialSteps[currentStep].step === 'pesquisar') {
                nextTutorialStep();
            }
        });
    }

    if (createRouteBtn) {
        createRouteBtn.addEventListener('click', createRoute);
    }

    if (noBtn) {
        noBtn.addEventListener('click', () => {
            hideControlButtons();
        });
    }

    if (carouselModalClose) {
        carouselModalClose.addEventListener('click', closeCarouselModal);
    }

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

        }if (tutorialSendBtn) {
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


// Funções de Ajuste e Notificação

function hideControlButtons() {
    const buttonsToHide = [
        'tutorial-no-btn', 'tutorial-yes-btn', 'tutorial-send-btn', 'tutorial-site-yes-btn', 'tutorial-next-btn', 'tutorial-prev-btn',
        'tutorial-end-btn', 'create-itinerary-btn', 'create-route-btn', 'about-more-btn',
        'buy-ticket-btn', 'tour-btn', 'reserve-restaurants-btn', 'reserve-inns-btn',
        'speak-attendent-btn', 'call-btn'
    ];
    buttonsToHide.forEach(id => {
        const button = document.getElementById(id);
        if (button) button.style.display = 'none';
    });
}

function restoreModalAndControlsStyles() {
    const assistantModal = document.getElementById('assistant-modal');
    const carouselModal = document.getElementById('carousel-modal');
    const controlButtons = document.querySelector('.control-buttons');
    const mapContainer = document.getElementById('map');

    Object.assign(assistantModal.style, {
        left: '45%',
        top: '45%',
        transform: 'translate(-50%, -50%)',
        width: '',
        maxWidth: '',
        background: '',
        padding: '',
        border: '',
        borderRadius: '',
        boxShadow: '',
        zIndex: '',
        textAlign: ''
    });

    Object.assign(carouselModal.style, {
        top: '35%',
        left: `48%`,
        transform: 'translate(-50%, -50%)',
        width: '70%',
        height: '50%',
        maxWidth: '600px',
        background: 'white',
        padding: '0px',
        border: '1px solid #ccc',
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        zIndex: '100000',
        textAlign: 'center'
    });

    Object.assign(controlButtons.style, {
        left: '49%',
    });

    Object.assign(mapContainer.style, {
        width: '100%',
        height: '100%'
    });
}

function adjustModalAndControls() {
    const assistantModal = document.getElementById('assistant-modal');
    const carouselModal = document.getElementById('carousel-modal');
    const sideMenu = document.querySelector('.menu');
    const controlButtons = document.querySelector('.control-buttons');
    const mapContainer = document.getElementById('map');

    if (!sideMenu.classList.contains('hidden')) {
        Object.assign(assistantModal.style, {
            left: `50%`
        });

        Object.assign(controlButtons.style, {
            left: '49%',
        });

        Object.assign(mapContainer.style, {
            width: `100%`,
            height: '100%'
        });

        // Ajuste o estilo do modal do assistente
        adjustModalStyles(assistantModal, 'assistant');
        // Ajuste o estilo do modal do carrossel
        adjustModalStyles(carouselModal, 'carousel');
    } else {
        restoreModalAndControlsStyles();
    }

    if (map) {
        map.invalidateSize();
    }
}

function adjustModalStyles(modal, type) {
    const sideMenu = document.querySelector('.menu');

    if (!sideMenu.classList.contains('hidden')) {
        if (type === 'assistant') {
            Object.assign(modal.style, {
                top: '40%',
                left: '45%',
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
        } else if (type === 'carousel') {
            Object.assign(modal.style, {
                top: '35%',
                left: '48%',
                transform: 'translate(-50%, -50%)',
                width: '70%',
                height: '50%',
                maxWidth: '600px',
                background: 'white',
                padding: '0px',
                border: '1px solid #ccc',
                borderRadius: '12px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                zIndex: '100000',
                textAlign: 'center'
            });
        }
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

function requestLocationPermission() {
 return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
        reject(new Error('Geolocalização não suportada.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(position => {
            currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            console.log('Current Location:', currentLocation);
            adjustMapWithLocationUser(currentLocation.latitude, currentLocation.longitude);
            if (!tutorialIsActive) {
                showTutorialStep('start-tutorial');
            }
            resolve(position);
        }, error => {
            currentLocation = { latitude: null, longitude: null };
            alert(translations[selectedLanguage].locationPermissionDenied);
            console.error('Location Permission Denied:', error);
            reject(error);
        });
    });
}

// Função específica para solicitar permissão de localização e criar a rota
function requestLocationPermissionCreateRoute() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}

function adjustMapWithLocationUser(lat, lon) {
    map.setView([lat, lon], 17);
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    currentMarker = L.marker([lat, lon]).addTo(map).bindPopup(translations[selectedLanguage].youAreHere).openPopup();
    map.panTo([lat, lon]);
}

function adjustMapWithLocation(lat, lon, name, description) {
    map.setView([lat, lon], 17);
    const marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${name}</b><br>${description}`).openPopup();
    markers.push(marker);
    map.panTo([lat, lon]);
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


function hideModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'none';
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

function loadSearchHistory() {
    try {
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
        if (searchHistory && Array.isArray(searchHistory)) {
            const historyList = document.getElementById('search-history-list');
            historyList.innerHTML = '';
            searchHistory.forEach(query => {
                const li = document.createElement('li');
                li.textContent = query;
                historyList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar histórico de busca:', error);
    }
}

function saveSearchQueryToHistory(query) {
    try {
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistory.push(query);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        loadSearchHistory();
    } catch (error) {
        console.error('Erro ao salvar consulta de busca no histórico:', error);
    }
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
        attribution: '&copy; Desenvolvido por Luiz Idebook'
    }).addTo(map);
}

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

function activateAssistant() {
    showWelcomeMessage();
}

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

function displayOSMData(data, subMenuId, feature) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = '';
    data.elements.forEach(element => {
        if (element.type === 'node' && element.tags.name) {
            const btn = document.createElement('button');
            btn.className = 'submenu-item submenu-button';
            btn.textContent = element.tags.name;
            btn.setAttribute('data-destination', element.tags.name);
            const description = element.tags.description || 'Descrição não disponível';
            btn.onclick = () => {
                handleSubmenuButtons(element.lat, element.lon, element.tags.name, description, element.tags.images || [], feature);
            };
            subMenu.appendChild(btn);

            const marker = L.marker([element.lat, element.lon]).addTo(map).bindPopup(`<b>${element.tags.name}</b><br>${description}`);
            markers.push(marker);
        }
    });

    document.querySelectorAll('.submenu-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const destination = this.getAttribute('data-destination');
            console.log(`Destination selected: ${destination}`);
            showDestinationContent(destination);
            removeExistingHighlights();
            removeFloatingMenuHighlights();
            endTutorial();
            closeCarouselModal();
        });
    });
}

function showDestinationModal(destination) {
    const modal = document.getElementById('destination-modal');
    const carousel = modal.querySelector('.carousel-inner');
    const favoriteButton = modal.querySelector('.favorite-btn');

    modal.querySelector('.modal-title').textContent = destination.name;
    modal.querySelector('.modal-body').textContent = destination.description;
    carousel.innerHTML = '';

    destination.images.forEach((image, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item${index === 0 ? ' active' : ''}`;
        carouselItem.innerHTML = `<img src="${image}" class="d-block w-100" alt="${destination.name}">`;
        carousel.appendChild(carouselItem);
    });

    favoriteButton.textContent = isFavorite(destination) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos';
    favoriteButton.onclick = () => {
        toggleFavorite(destination);
        favoriteButton.textContent = isFavorite(destination) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos';
    };

    modal.style.display = 'block';
}

function isFavorite(destination) {
    return favorites.some(fav => fav.name === destination.name);
}

function toggleFavorite(destination) {
    if (isFavorite(destination)) {
        favorites = favorites.filter(fav => fav.name !== destination.name);
    } else {
        favorites.push(destination);
    }
    setLocalStorageItem('favorites', favorites);
}

function hideDestinationModal() {
    const modal = document.getElementById('destination-modal');
    modal.style.display = 'none';
}


// Função adicional para registrar a seleção do destino
function selectDestination(destination) {
    selectedDestination = destination;
    console.log('Destino selecionado:', destination);
}

function showDestinationContent(destination) {
    getSelectedDestination().then(selectedDestination => {
        if (selectedDestination && selectedDestination.name === destination) {
            const destinationModal = document.getElementById('destination-modal');
            destinationModal.querySelector('.modal-title').textContent = selectedDestination.name;
            destinationModal.querySelector('.modal-body').textContent = selectedDestination.description;
            const carousel = destinationModal.querySelector('.carousel-inner');
            carousel.innerHTML = '';
            selectedDestination.images.forEach((image, index) => {
                const carouselItem = document.createElement('div');
                carouselItem.className = `carousel-item${index === 0 ? ' active' : ''}`;
                carouselItem.innerHTML = `<img src="${image}" class="d-block w-100" alt="${selectedDestination.name}">`;
                carousel.appendChild(carouselItem);
            });
            destinationModal.style.display = 'block';
        }
    }).catch(error => {
        console.error('Erro ao obter destino selecionado:', error);
    });
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
        'ensino': 'education-submenu',
    };

    const subMenuId = featureMappings[feature];

    if (!subMenuId) {
        console.error(`Feature não reconhecida: ${feature}`);
        return;
    }

    console.log(`Feature selecionada: ${feature}, Submenu ID: ${subMenuId}`);

    document.querySelectorAll('#menu .submenu').forEach(subMenu => {
        subMenu.style.display = 'none';
    });

    clearMarkers();

    if (currentSubMenu === subMenuId) {
        document.getElementById('menu').style.display = 'none';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        currentSubMenu = null;
    } else {
        loadSubMenu(subMenuId, feature);
        document.getElementById('menu').style.display = 'block';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.add('inactive'));
        document.querySelector(`.menu-btn[data-feature="${feature}"]`).classList.remove('inactive');
        document.querySelector(`.menu-btn[data-feature="${feature}"]`).classList.add('active');
        currentSubMenu = subMenuId;
    }
}



function loadSubMenu(subMenuId, feature) {
    const subMenu = document.getElementById(subMenuId);

    if (!subMenu) {
        console.error(`Submenu não encontrado: ${subMenuId}`);
        return;
    }

    console.log(`Carregando submenu: ${subMenuId} para a feature: ${feature}`);

    subMenu.style.display = 'block';

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
            console.error(`Feature não reconhecida ao carregar submenu: ${feature}`);
            break;
    }
}



function handleSubmenuButtons(lat, lon, name, description, images, feature) {
    const url = getUrlsForLocation(name);
    clearMarkers();
    adjustMapWithLocation(lat, lon, name, description);
    selectedDestination = { name, description, lat, lon, images, feature, url };
    saveDestinationToCache(selectedDestination).then(() => {
        sendDestinationToServiceWorker(selectedDestination);
        clearCurrentRoute();
    }).catch(error => {
        console.error('Erro ao salvar destino no cache:', error);
    });

    // Mostrar o botão "Saiba mais"
    const aboutMoreBtn = document.getElementById('about-more-btn');
    if (aboutMoreBtn) {
        aboutMoreBtn.style.display = 'block';
    }

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

        default:
            showControlButtons();
            break;
    }
}


function displayCustomItems(items, subMenuId, feature) {
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = '';

    items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item submenu-button';
        btn.textContent = item.name;
        btn.setAttribute('data-lat', item.lat);
        btn.setAttribute('data-lon', item.lon);
        btn.setAttribute('data-name', item.name);
        btn.setAttribute('data-description', item.description);
        btn.setAttribute('data-feature', feature);
        btn.setAttribute('data-destination', item.name);
        btn.onclick = () => {
            handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], feature);
        };
        subMenu.appendChild(btn);

        const marker = L.marker([item.lat, item.lon]).addTo(map).bindPopup(`<b>${item.name}</b><br>${item.description}`);
        markers.push(marker);
    });
}

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

function setSelectedDestination(destination) {
    console.log('Setting Selected Destination:', destination);
    selectedDestination = destination;
    saveDestinationToCache(selectedDestination).then(() => {
        sendDestinationToServiceWorker(selectedDestination);
    }).catch(error => {
        console.error('Erro ao salvar destino no cache:', error);
    });
}

function displayCustomTours() {
    const tours = [
        { name: "Passeio de lancha Volta a Ilha de Tinharé", lat: -13.3837729, lon: -38.9085360, description: "Desfrute de um emocionante passeio de lancha ao redor da Ilha de Tinharé. Veja paisagens deslumbrantes e descubra segredos escondidos desta bela ilha." },
        { name: "Passeio de Quadriciclo para Garapuá", lat: -13.3827765, lon: -38.9105500, description: "Aventure-se em um emocionante passeio de quadriciclo até a pitoresca vila de Garapuá. Aproveite o caminho cheio de adrenalina e as paisagens naturais de tirar o fôlego." },
        { name: "Passeio 4X4 para Garapuá", lat: -13.3808638, lon: -38.9127107, description: "Embarque em uma viagem emocionante de 4x4 até Garapuá. Desfrute de uma experiência off-road única com vistas espetaculares e muita diversão." },
        { name: "Passeio de Barco para Gamboa", lat: -13.3766536, lon: -38.9186205, description: "Relaxe em um agradável passeio de barco até Gamboa. Desfrute da tranquilidade do mar e da beleza natural ao longo do caminho." }
    ];
    displayCustomItems(tours, 'tours-submenu', 'passeios');
}

function displayCustomNightlife() {
    fetchOSMData(queries['nightlife-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'nightlife-submenu', 'festas');
        }
    });
}

function displayCustomRestaurants() {
    fetchOSMData(queries['restaurants-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'restaurants-submenu', 'restaurantes');
        }
    });
}

function displayCustomTouristSpots() {
    fetchOSMData(queries['touristSpots-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'touristSpots-submenu', 'pontos-turisticos');
        }
    });
}

function displayCustomBeaches() {
    fetchOSMData(queries['beaches-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'beaches-submenu', 'praias');
        }
    });
}

function displayCustomInns() {
    fetchOSMData(queries['inns-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'inns-submenu', 'pousadas');
        }
    });
}

function displayCustomShops() {
    fetchOSMData(queries['shops-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'shops-submenu', 'lojas');
        }
    });
}

function displayCustomEmergencies() {
    const emergencies = [
        { name: "Ambulância", lat: -13.3773, lon: -38.9171, description: "Serviço de ambulância disponível 24 horas para emergências. Contate pelo número: +55 75-99894-5017." },
        { name: "Unidade de Saúde", lat: -13.3773, lon: -38.9171, description: "Unidade de saúde local oferecendo cuidados médicos essenciais. Contato: +55 75-3652-1798." },
        { name: "Polícia Civil", lat: -13.3775, lon: -38.9150, description: "Delegacia da Polícia Civil pronta para assisti-lo em situações de emergência e segurança. Contato: +55 75-3652-1645." },
        { name: "Polícia Militar", lat: -13.3775, lon: -38.9150, description: "Posto da Polícia Militar disponível para garantir a sua segurança. Contato: +55 75-99925-0856." }
    ];

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

function displayCustomTips() {
    const tips = [
        { name: "Melhores Pontos Turísticos", lat: -13.3766787, lon: -38.9172057, description: "Explore os pontos turísticos mais icônicos de Morro de São Paulo." },
        { name: "Melhores Passeios", lat: -13.3766787, lon: -38.9172057, description: "Descubra os passeios mais recomendados." },
        { name: "Melhores Praias", lat: -13.3766787, lon: -38.9172057, description: "Saiba quais são as praias mais populares." },
        { name: "Melhores Restaurantes", lat: -13.3766787, lon: -38.9172057, description: "Conheça os melhores lugares para comer." },
        { name: "Melhores Pousadas", lat: -13.3766787, lon: -38.9172057, description: "Encontre as melhores opções de pousadas." },
        { name: "Melhores Lojas", lat: -13.3766787, lon: -38.9172057, description: "Descubra as melhores lojas para suas compras." }
    ];

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
        btn.onclick = () => {
            handleSubmenuButtons(tip.lat, tip.lon, tip.name, tip.description, [], 'dicas');
        };
        subMenu.appendChild(btn);

        const marker = L.marker([tip.lat, tip.lon]).addTo(map).bindPopup(`<b>${tip.name}</b><br>${tip.description}`);
        markers.push(marker);
    });
}

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
        btn.onclick = () => {
            handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], 'sobre');
        };
        subMenu.appendChild(btn);

        const marker = L.marker([item.lat, item.lon]).addTo(map).bindPopup(`<b>${item.name}</b><br>${item.description}`);
        markers.push(marker);
    });
}

function displayCustomEducation() {
    const educationItems = [
        { name: "Iniciar Tutorial", lat: -13.3766787, lon: -38.9172057, description: "Comece aqui para aprender a usar o site." },
        { name: "Planejar Viagem com IA", lat: -13.3766787, lon: -38.9172057, description: "Planeje sua viagem com a ajuda de inteligência artificial." },
        { name: "Falar com IA", lat: -13.3766787, lon: -38.9172057, description: "Converse com nosso assistente virtual." },
        { name: "Falar com Suporte", lat: -13.3766787, lon: -38.9172057, description: "Entre em contato com o suporte." },
        { name: "Configurações", lat: -13.3766787, lon: -38.9172057, description: "Ajuste as configurações do site." }
    ];

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
        btn.onclick = () => {
            handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], 'ensino');
        };
        subMenu.appendChild(btn);

        const marker = L.marker([item.lat, item.lon]).addTo(map).bindPopup(`<b>${item.name}</b><br>${item.description}`);
        markers.push(marker);
    });
}

// Função para tratar o clique nos botões de submenu e ajustar o mapa
function handleSubmenuButtonClick(lat, lon, name, description, controlButtonsFn) {
    clearMarkers();
    adjustMapWithLocation(lat, lon, name, description);
    selectedDestination = { name, lat, lon, description };
    saveDestinationToCache(selectedDestination).then(() => {
        sendDestinationToServiceWorker(selectedDestination);
    }).catch(error => {
        console.error('Erro ao salvar destino no cache:', error);
    });
    controlButtonsFn();
    const images = getImagesForLocation(name);
    showLocationDetailsInModal(name, description, images);
}

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

function showControlButtons() {
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsTour() {
    hideAllControlButtons();
    document.getElementById('tour-btn').style.display = 'flex';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';
}

function showControlButtonsNightlife() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';
    document.getElementById('buy-ticket-btn').style.display = 'flex';


}

function showControlButtonsRestaurants() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';
    document.getElementById('reserve-restaurants-btn').style.display = 'flex';

}

function showControlButtonsInns() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';
    document.getElementById('reserve-inns-btn').style.display = 'flex';
}

function showControlButtonsShops() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('speak-attendent-btn').style.display = 'flex';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';

}

function showControlButtonsTips() {
    hideAllControlButtons();
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';

}

function showControlButtonsEmergencies() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('call-btn').style.display = 'flex';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';

}

function showControlButtonsTouristSpots() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';

}

function showControlButtonsBeaches() {
    hideAllControlButtons();
    document.getElementById('reserve-chairs-btn').style.display = 'none';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';

}

function showControlButtonsEducation() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'none';
    document.getElementById('about-more-btn').style.display = 'none';
    document.getElementById('tutorial-prev-btn').style.display = 'flex';

}


function hideAllControlButtons() {
    const controlButtons = document.querySelector('.control-buttons');
    const buttons = controlButtons.querySelectorAll('button');
    buttons.forEach(button => button.style.display = 'none');
}

function hideAllButtons() {
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(button => button.style.display = 'none');
}

function showAssistantModalWithCarousel() {
    initializeCarousel(images);
    document.getElementById('assistant-modal').style.display = 'block';
}


// Função para iniciar o carrossel
function startCarousel(locationName) {
    const images = getImagesForLocation(locationName);

    if (!images || images.length === 0) {
        alert('No images available for the carousel.');
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

    showModal('carousel-modal');

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
        breakpoints: {
            640: {
                slidesPerView: 1,
                spaceBetween: 20
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 40
            }
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // Use flex to center the modal
    }
}

// Função para destruir o carrossel
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

// Função para fechar o modal do carrossel
function closeCarouselModal() {
    const carouselModal = document.getElementById('carousel-modal');
    if (carouselModal) {
        carouselModal.style.display = 'none';
    }
}


// Função para criar rota até o destino selecionado
function createRoute() {
    if (!selectedDestination) {
        alert('Por favor, selecione um destino primeiro.');
        return;
    }
    const { lat, lon } = selectedDestination;
    createRouteToDestination(lat, lon);
}

const apiKey = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3'; // Substitua pelo seu API Key do OpenRouteService

// Função para solicitar permissão de localização e criar a rota
async function createRouteToDestination(lat, lon, profile = 'foot-walking') {
    try {
        clearCurrentRoute(); // Limpar rota atual
        clearAllMarkers(); // Limpar todos os marcadores

        let currentLocation = await getCurrentLocation();
        if (currentLocation) {
            const { latitude, longitude } = currentLocation.coords;
            console.log(`Criando rota de (${latitude}, ${longitude}) para (${lat}, ${lon}) utilizando o perfil ${profile}`);

            // Adicionar marcador de localização atual do usuário
            const userMarker = L.marker([latitude, longitude]).addTo(map)
                .bindPopup("Você está aqui!")
                .openPopup();

            await plotRouteOnMap(latitude, longitude, lat, lon, profile);

            // Adicionar marcador de destino
            const destinationMarker = L.marker([lat, lon]).addTo(map)
                .bindPopup(selectedDestination.name)
                .openPopup();

            // Ajustar o mapa para mostrar a rota
            map.fitBounds(window.currentRoute.getBounds(), {
                padding: [50, 50]
            });
        }
    } catch (error) {
        console.error('Erro ao obter localização atual:', error);
    }
}

// Função para obter a localização atual do usuário
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject(new Error('Geolocalização não é suportada pelo seu navegador.'));
        }
    });
}

// Função para traçar a rota no mapa usando a API do OpenRouteService
async function plotRouteOnMap(startLat, startLon, destLat, destLon, profile) {
    try {
        const response = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}&start=${startLon},${startLat}&end=${destLon},${destLat}`);
        if (!response.ok) throw new Error('Falha ao obter a rota do OpenRouteService.');

        const routeData = await response.json();
        const coordinates = routeData.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

        if (window.currentRoute) {
            map.removeLayer(window.currentRoute);
        }

        window.currentRoute = L.polyline(coordinates, { color: 'blue' }).addTo(map);
        map.fitBounds(window.currentRoute.getBounds());
    } catch (error) {
        console.error('Erro ao traçar a rota no mapa:', error);
    }
}

// Função para limpar a rota atual
function clearCurrentRoute() {
    if (window.currentRoute) {
        map.removeLayer(window.currentRoute);
        window.currentRoute = null;
    }
}

// Função para limpar todos os marcadores do mapa
function clearAllMarkers() {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
}

let userLocationMarker = null;

async function startInteractiveRoute() {
    if (!selectedDestination) {
        alert('Por favor, selecione um destino primeiro.');
        return;
    }
    const { lat, lon } = selectedDestination;

    try {
        let currentLocation = await getCurrentLocation();
        if (currentLocation) {
            const { latitude, longitude } = currentLocation.coords;
            console.log(`Iniciando rota interativa de (${latitude}, ${longitude}) para (${lat}, ${lon})`);
            await plotRouteOnMap(latitude, longitude, lat, lon);

            if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
            }

            userLocationMarker = L.marker([latitude, longitude], {
                icon: L.icon({
                    iconUrl: 'path_to_user_icon.png', // Caminho para o ícone do usuário
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map).bindPopup("Você está aqui!");

            map.fitBounds(window.currentRoute.getBounds(), {
                padding: [50, 50]
            });

            trackUserMovement();
        }
    } catch (error) {
        console.error('Erro ao iniciar a rota interativa:', error);
    }
}

function trackUserMovement() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(position => {
            const { latitude, longitude } = position.coords;

            if (userLocationMarker) {
                userLocationMarker.setLatLng([latitude, longitude]);
                userLocationMarker.bindPopup("Você está aqui!").openPopup();
            }

            map.panTo([latitude, longitude], {
                animate: true,
                duration: 1
            });
        }, error => {
            console.error('Erro ao rastrear movimento do usuário:', error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    } else {
        console.error('Geolocalização não é suportada pelo seu navegador.');
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
    const form = document.getElementById('itinerary-form');
    const selectedActivities = Array.from(form.elements['activity-types'].selectedOptions).map(option => option.value);

    // Fetch OSM data based on selected activities
    const promises = selectedActivities.map(activity => fetchOSMData(queries[`${activity}-submenu`]));

    Promise.all(promises).then(results => {
        const itinerary = results.flat().map(result => result.elements).flat();
        saveItinerary(itinerary);
        showNotification(translations[selectedLanguage].itinerarySaved, 'success');
    }).catch(error => {
        console.error('Erro ao salvar o roteiro:', error);
        showNotification('Erro ao salvar o roteiro.', 'error');
    });
}

function saveItinerary(itinerary) {
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
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

// Atualiza o conteúdo do modal
function updateAssistantModalContent(step, content) {
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    if (!modalContent) {
        console.error('Elemento de conteúdo do modal não encontrado.');
        return;
    }

    // Verifica se o passo é 'ask-interest' para exibir a mensagem e os botões específicos
    if (step === 'ask-interest') {
        modalContent.innerHTML = `
            <p>${content}</p>
            <div id="interest-options" class="form-modal">
                <button class="menu-principal-btn" onclick="storeAndProceed('pousadas')">Pousadas</button>
                <button class="menu-principal-btn" onclick="storeAndProceed('pontos-turisticos')">Pontos Turísticos</button>
                <button class="menu-principal-btn" onclick="storeAndProceed('praias')">Praias</button>
                <button class="menu-principal-btn" onclick="storeAndProceed('passeios')">Passeios</button>
                <button class="menu-principal-btn" onclick="storeAndProceed('restaurantes')">Restaurantes</button>
                <button class="menu-principal-btn" onclick="storeAndProceed('festas')">Festas</button>
                <button class="menu-principal-btn" onclick="storeAndProceed('lojas')">Lojas</button>
                <button class="menu-principal-btn" onclick="storeAndProceed('emergencias')">Emergências</button>
            </div>
        `;
    } else {
        // Atualiza o conteúdo padrão para outros passos
        modalContent.innerHTML = `<p>${content}</p>`;
    }

    // Exibe o modal
    document.getElementById('assistant-modal').style.display = 'block';


}


// Função principal do tutorial
const tutorialSteps = [
    {
        step: 'start-tutorial',
        message: {
            pt: "Morro Digital é uma plataforma inovadora que oferece uma experiência digital completa para turistas em Morro de São Paulo.nterfaces interativas, assistentes virtuais e muito mais.",
            en: "[first name], we use advanced technology to improve the tourist experience by offering features like mapping and geolocation, interactive interfaces, virtual assistants, and more. Would you like to know more?",
       },
        action: () => {
            showButtons(['tutorial-next-btn']);
        }
    },
    {
        step: 'ask-interest',
        message: {
            pt: "O que você está procurando em Morro de São Paulo? Escolha uma das opções abaixo.",
            en: "What are you looking for in Morro de São Paulo? Choose one of the options below."
        },
        action: () => {
            hideControlButtons();
            removeExistingHighlights();            // Remove destaques do menu flutuante
            removeFloatingMenuHighlights();
            closeSideMenu();
            restoreModalAndControlsStyles();

        }
    },
    ...generateInterestSteps(),
    {
        step: 'end-tutorial',
        message: {
            pt: "Parabéns! Você concluiu o tutorial! Aproveite para explorar todas as funcionalidades disponíveis.",
            en: "Congratulations! You have completed the tutorial! Enjoy exploring all the available features."
        },
        action: () => {
            showButtons(['tutorial-end-btn']);
        }
    }
];

// Gera os passos personalizados com base nos interesses e adiciona o passo "submenu-example"
function generateInterestSteps() {
    const interests = [
        { id: 'pousadas', label: "Pousadas", message: "Encontre as melhores pousadas para sua estadia." },
        { id: 'pontos-turisticos', label: "Pontos Turísticos", message: "Descubra os pontos turísticos mais populares." },
        { id: 'praias', label: "Praias", message: "Explore as praias mais belas de Morro de São Paulo." },
        { id: 'passeios', label: "Passeios", message: "Veja passeios disponíveis e opções de reserva." },
        { id: 'restaurantes', label: "Restaurantes", message: "Descubra os melhores restaurantes da região." },
        { id: 'festas', label: "Festas", message: "Saiba sobre festas e eventos disponíveis." },
        { id: 'lojas', label: "Lojas", message: "Encontre lojas locais para suas compras." },
        { id: 'emergencias', label: "Emergências", message: "Informações úteis para situações de emergência." }
    ];

    // Mapeia os interesses e adiciona o passo "submenu-example"
    const steps = interests.flatMap(interest => [
        {
            step: interest.id,
            element: `.menu-btn[data-feature="${interest.id}"]`,
            message: {
                pt: interest.message,
                en: `Find the best ${interest.label.toLowerCase()} in Morro de São Paulo.`
            },
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
                en: "Choose an option from the submenu to proceed."
            },
            action: () => {
                const submenu = document.querySelector('.submenu');
                if (submenu) {
                    submenu.style.display = 'block'; // Exibe o submenu
                }
                setupSubmenuListeners(); // Configura os listeners para fechar o modal
            }
        }
    ]);

    return steps;
}

// Configura os listeners para fechar o modal ao clicar em submenus
function setupSubmenuListeners() {
    const submenuItems = document.querySelectorAll('.submenu-item');
    submenuItems.forEach(item => {
        item.addEventListener('click', () => {
            hideAssistantModal(); // Fecha o modal do assistente
        });
    });
}

// Função para remover destaques do menu flutuante
function removeFloatingMenuHighlights() {
    const floatingMenuButtons = document.querySelectorAll('.floating-menu .menu-btn');
    floatingMenuButtons.forEach(button => {
        button.classList.remove('highlight');
    });
}

// Função para remover o modal do assistente
function hideAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função para destacar elementos
function highlightElement(element) {
    removeExistingHighlights();
    element.style.outline = '6px solid red';
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Remove destaques existentes
function removeExistingHighlights() {
    const highlightedElements = document.querySelectorAll('[style*="outline"]');
    highlightedElements.forEach(el => {
        el.style.outline = '';
    });
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

// Função para exibir um passo do tutorial
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

    if (action) action();
}

// Função para fechar o modal do assistente ao clicar nos botões do submenu
function closeAssistantModalOnSubmenuClick() {
    const submenuButtons = document.querySelectorAll('.submenu-item');
    const assistantModal = document.getElementById('assistant-modal');

    submenuButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (assistantModal) {
                assistantModal.style.display = 'none'; // Fecha o modal
            }
        });
    });
}

function setupSubmenuListeners() {
    // Configure os listeners do submenu
    closeAssistantModalOnSubmenuClick();
}


// Atualiza o conteúdo do modal
// Configura os botões do floating-menu para avançar no tutorial
function setupFloatingMenuListeners() {
    const floatingMenuButtons = document.querySelectorAll('#floating-menu .menu-btn');

    floatingMenuButtons.forEach(button => {
        button.addEventListener('click', () => {
            nextTutorialStep(); // Avança para o próximo passo do tutorial
        });
    });
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

// Função para fechar o modal do assistente
function hideAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Inicializa os listeners
function initializeTutorialListeners() {
    setupFloatingMenuListeners(); // Configura os botões do floating-menu
    setupMenuListeners();         // Configura os botões do menu lateral
}

function previousTutorialStep() {
    if (currentStep > 0) {
        currentStep--;
        showTutorialStep(tutorialSteps[currentStep].step);
    }
}


// Função para exibir o botão 'tutorial-menu-btn' quando o tutorial estiver desativado
function toggleTutorialMenuButton() {
    const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');

    if (!tutorialIsActive) {
        // Exibe o botão se o tutorial não estiver ativo
        if (tutorialMenuBtn) {
            tutorialMenuBtn.style.display = 'inline-block';
        }
    } else {
        // Oculta o botão se o tutorial estiver ativo
        if (tutorialMenuBtn) {
            tutorialMenuBtn.style.display = 'none';
        }
    }
}

// Atualize onde o estado do tutorial muda
function startTutorial() {
    tutorialIsActive = true;
    toggleTutorialMenuButton(); // Oculta o botão ao iniciar o tutorial
    showTutorialStep('start-tutorial');
}

// Chama a função sempre que o estado do tutorial muda
function endTutorial() {
    tutorialIsActive = false;
    hideAssistantModal();
    toggleTutorialMenuButton(); // Exibe o botão após o término do tutorial
    console.log('Tutorial concluído.');
}

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

function updateProgressBar(current, total) {
    const progressBar = document.getElementById('tutorial-progress-bar');
    progressBar.style.width = `${(current / total) * 100}%`;
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
