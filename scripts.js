document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeMap();
        loadResources();
        activateAssistant();
        setupEventListeners();
        showWelcomeMessage();
        adjustModalAndControls();
        initializeCarousel(initialImages);
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

const OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
const initialImages = [];
const submenuItems = {
        'touristSpots-submenu': [
            { name: "Farol do Morro", lat: -13.377592, lon: -38.916947, description: "Um belo farol.", feature: "pontos-turisticos" },
            { name: "Toca do Morcego", lat: -13.379369, lon: -38.918018, description: "Um lugar com uma vista espetacular.", feature: "pontos-turisticos" },
            { name: "Mirante da Tirolesa", lat: -13.378458, lon: -38.915444, description: "Vista incrível do mar.", feature: "pontos-turisticos" },
            { name: "Fortaleza de Morro de São Paulo", lat: -13.381585, lon: -38.912945, description: "Uma antiga fortaleza.", feature: "pontos-turisticos" },
            { name: "Paredão da Argila", lat: -13.375169, lon: -38.911957, description: "Paredão de argila terapêutica.", feature: "pontos-turisticos" }
        ],
        'tours-submenu': [
            { name: "Passeio de lancha Volta a Ilha de Tinharé", lat: -13.377840, lon: -38.917669, description: "Passeio de lancha pela ilha.", feature: "passeios" },
            { name: "Passeio de Quadriciclo para Garapuá", lat: -13.385694, lon: -38.913456, description: "Aventura em quadriciclo.", feature: "passeios" },
            { name: "Passeio 4X4 para Garapuá", lat: -13.388446, lon: -38.911657, description: "Passeio off-road.", feature: "passeios" },
            { name: "Passeio de Barco para Gamboa", lat: -13.372316, lon: -38.914169, description: "Passeio de barco até Gamboa.", feature: "passeios" }
        ],
        'beaches-submenu': [
            { name: "Primeira Praia", lat: -13.375893, lon: -38.914387, description: "Praia popular e movimentada.", feature: "praias" },
            { name: "Segunda Praia", lat: -13.378251, lon: -38.913445, description: "Praia conhecida pelos bares e festas.", feature: "praias" },
            { name: "Terceira Praia", lat: -13.379945, lon: -38.912566, description: "Praia tranquila para relaxar.", feature: "praias" },
            { name: "Quarta Praia", lat: -13.382551, lon: -38.911271, description: "Praia extensa e calma.", feature: "praias" },
            { name: "Praia do Encanto", lat: -13.387453, lon: -38.911218, description: "Praia paradisíaca e isolada.", feature: "praias" },
            { name: "Praia do Pôrto", lat: -13.367801, lon: -38.907444, description: "Praia tranquila e bonita.", feature: "praias" },
            { name: "Praia da Gamboa", lat: -13.367801, lon: -38.906715, description: "Praia com argila terapêutica.", feature: "praias" }
        ],
        'nightlife-submenu': [
            { name: "Toca do Morcego Festas", lat: -13.379369, lon: -38.918018, description: "Festas com vista espetacular.", feature: "festas" },
            { name: "One Love", lat: -13.378303, lon: -38.915065, description: "Casa noturna famosa.", feature: "festas" },
            { name: "Pulsar", lat: -13.377407, lon: -38.913500, description: "Clube noturno popular.", feature: "festas" },
            { name: "Mama Iate", lat: -13.378888, lon: -38.918629, description: "Festas em um iate.", feature: "festas" },
            { name: "Teatro do Morro", lat: -13.378153, lon: -38.918537, description: "Eventos culturais e festas.", feature: "festas" }
        ],
        'restaurants-submenu': [
            { name: "Morena Bela", lat: -13.376934, lon: -38.917420, description: "Restaurante popular.", feature: "restaurantes" },
            { name: "Basílico", lat: -13.377748, lon: -38.915720, description: "Culinária italiana.", feature: "restaurantes" },
            { name: "Ki Massa", lat: -13.377934, lon: -38.916907, description: "Pizzaria tradicional.", feature: "restaurantes" },
            { name: "Tempeiro Caseiro", lat: -13.378394, lon: -38.914797, description: "Comida caseira.", feature: "restaurantes" },
            { name: "Bizu", lat: -13.378840, lon: -38.913592, description: "Restaurante e bar.", feature: "restaurantes" },
            { name: "Pedra Sobre Pedra", lat: -13.379196, lon: -38.912742, description: "Gastronomia regional.", feature: "restaurantes" },
            { name: "Forno a Lenha de Mercedes", lat: -13.379552, lon: -38.911778, description: "Pizzas artesanais.", feature: "restaurantes" },
            { name: "Ponto G", lat: -13.379891, lon: -38.910681, description: "Gourmet e bar.", feature: "restaurantes" },
            { name: "Ponto 9,99", lat: -13.380223, lon: -38.909765, description: "Lanches rápidos.", feature: "restaurantes" },
            { name: "Patricia", lat: -13.380567, lon: -38.908791, description: "Restaurante tradicional.", feature: "restaurantes" },
            { name: "dizi 10", lat: -13.380895, lon: -38.907832, description: "Comida variada.", feature: "restaurantes" },
            { name: "Papoula", lat: -13.381229, lon: -38.906853, description: "Culinária local.", feature: "restaurantes" },
            { name: "Sabor da terra", lat: -13.381557, lon: -38.905866, description: "Pratos regionais.", feature: "restaurantes" },
            { name: "Branco&Negro", lat: -13.381883, lon: -38.904890, description: "Bar e restaurante.", feature: "restaurantes" },
            { name: "Six Club", lat: -13.382206, lon: -38.903918, description: "Balada.", feature: "restaurantes" },
            { name: "Santa Villa", lat: -13.382526, lon: -38.902937, description: "Bar e restaurante.", feature: "restaurantes" },
            { name: "Recanto do Aviador", lat: -13.382842, lon: -38.901957, description: "Restaurante e bar.", feature: "restaurantes" },
            { name: "Sambass", lat: -13.383156, lon: -38.900979, description: "Restaurante e bar.", feature: "restaurantes" },
            { name: "Bar e Restaurante da Morena", lat: -13.383468, lon: -38.899996, description: "Comida caseira.", feature: "restaurantes" },
            { name: "Restaurante Alecrim", lat: -13.383776, lon: -38.899010, description: "Culinária variada.", feature: "restaurantes" },
            { name: "Andina Cozinha Latina", lat: -13.384081, lon: -38.898027, description: "Cozinha latina.", feature: "restaurantes" },
            { name: "Papoula Culinária Artesanal", lat: -13.384384, lon: -38.897046, description: "Culinária artesanal.", feature: "restaurantes" },
            { name: "Minha Louca Paixão", lat: -13.384683, lon: -38.896062, description: "Restaurante temático.", feature: "restaurantes" },
            { name: "Café das Artes", lat: -13.384980, lon: -38.895079, description: "Café charmoso com arte.", feature: "restaurantes" },
            { name: "Canoa", lat: -13.385262, lon: -38.894165, description: "Restaurante à beira-mar.", feature: "restaurantes" },
            { name: "Restaurante do Francisco", lat: -13.385548, lon: -38.893245, description: "Culinária local e frutos do mar.", feature: "restaurantes" },
            { name: "La Tabla", lat: -13.385834, lon: -38.892323, description: "Restaurante especializado em carnes.", feature: "restaurantes" },
            { name: "Santa Luzia", lat: -13.386119, lon: -38.891401, description: "Restaurante com pratos variados.", feature: "restaurantes" },
            { name: "Chez Max", lat: -13.386405, lon: -38.890481, description: "Restaurante francês.", feature: "restaurantes" },
            { name: "Barraca da Miriam", lat: -13.386692, lon: -38.889561, description: "Barraca de praia com petiscos.", feature: "restaurantes" },
            { name: "O Casarão restaurante", lat: -13.386978, lon: -38.888639, description: "Restaurante tradicional.", feature: "restaurantes" }
        ],
        'inns-submenu': [
            { name: "Chez Max", lat: -13.386405, lon: -38.890481, description: "Pousada charmosa.", feature: "pousadas" },
            { name: "Hotel Fazenda Parque Vila", lat: -13.387401, lon: -38.889420, description: "Hotel fazenda.", feature: "pousadas" },
            { name: "Guaiamu", lat: -13.388399, lon: -38.888439, description: "Pousada tranquila.", feature: "pousadas" },
            { name: "Pousada Fazenda Caeiras", lat: -13.389397, lon: -38.887459, description: "Pousada rural.", feature: "pousadas" },
            { name: "Amendoeira Hotel", lat: -13.390396, lon: -38.886479, description: "Hotel acolhedor.", feature: "pousadas" },
            { name: "Pousada Natureza", lat: -13.391395, lon: -38.885499, description: "Pousada ecológica.", feature: "pousadas" },
            { name: "Pousada dos Pássaros", lat: -13.392394, lon: -38.884519, description: "Pousada charmosa.", feature: "pousadas" },
            { name: "Hotel Morro de São Paulo", lat: -13.393392, lon: -38.883539, description: "Hotel confortável.", feature: "pousadas" },
            { name: "Uma Janela para o Sol", lat: -13.394391, lon: -38.882559, description: "Pousada com vistas deslumbrantes.", feature: "pousadas" },
            { name: "Portaló", lat: -13.395389, lon: -38.881579, description: "Hotel e restaurante.", feature: "pousadas" },
            { name: "Pérola do Morro", lat: -13.396388, lon: -38.880599, description: "Pousada moderna.", feature: "pousadas" },
            { name: "Safira do Morro", lat: -13.397387, lon: -38.879619, description: "Pousada elegante.", feature: "pousadas" },
            { name: "Xerife Hotel", lat: -13.398385, lon: -38.878639, description: "Hotel prático e econômico.", feature: "pousadas" },
            { name: "Ilha da Saudade", lat: -13.399384, lon: -38.877659, description: "Pousada com clima romântico.", feature: "pousadas" },
            { name: "Porto dos Milagres", lat: -13.400383, lon: -38.876679, description: "Pousada confortável.", feature: "pousadas" },
            { name: "Passarte", lat: -13.401381, lon: -38.875699, description: "Pousada artística.", feature: "pousadas" },
            { name: "Pousada da Praça", lat: -13.402380, lon: -38.874719, description: "Pousada central.", feature: "pousadas" },
            { name: "Pousada Colibri", lat: -13.403379, lon: -38.873739, description: "Pousada acolhedora.", feature: "pousadas" },
            { name: "Pousada Porto de Cima", lat: -13.404377, lon: -38.872759, description: "Pousada com estilo rústico.", feature: "pousadas" },
            { name: "Vila Guaiamu", lat: -13.405376, lon: -38.871779, description: "Pousada ecológica.", feature: "pousadas" },
            { name: "Villa dos Corais pousada", lat: -13.406374, lon: -38.870799, description: "Pousada de luxo.", feature: "pousadas" },
            { name: "Pousada Fazenda Caeira", lat: -13.407373, lon: -38.869819, description: "Pousada rural.", feature: "pousadas" },
            { name: "Hotel Anima", lat: -13.408372, lon: -38.868839, description: "Hotel boutique.", feature: "pousadas" },
            { name: "Vila dos Orixás Boutique Hotel & Spa", lat: -13.409370, lon: -38.867859, description: "Hotel spa.", feature: "pousadas" },
            { name: "Hotel Karapitangui", lat: -13.410369, lon: -38.866879, description: "Hotel confortável.", feature: "pousadas" },
            { name: "Pousada Timbalada", lat: -13.411368, lon: -38.865899, description: "Pousada charmosa.", feature: "pousadas" },
            { name: "Casa Celestino Residence", lat: -13.412366, lon: -38.864919, description: "Residência de férias.", feature: "pousadas" },
            { name: "Bahia Bacana Pousada", lat: -13.413365, lon: -38.863939, description: "Pousada moderna.", feature: "pousadas" },
            { name: "Ilha da Saudade", lat: -13.414364, lon: -38.862959, description: "Pousada com clima romântico.", feature: "pousadas" },
            { name: "Hotel Morro da Saudade", lat: -13.415362, lon: -38.861979, description: "Hotel acolhedor.", feature: "pousadas" },
            { name: "Bangalô dos sonhos", lat: -13.416361, lon: -38.860999, description: "Bangalô de luxo.", feature: "pousadas" },
            { name: "Cantinho da Josete", lat: -13.417360, lon: -38.860019, description: "Pousada familiar.", feature: "pousadas" },
            { name: "Vila Morro do Sao Paulo", lat: -13.418358, lon: -38.859039, description: "Vila charmosa.", feature: "pousadas" },
            { name: "Casa Rossa", lat: -13.419357, lon: -38.858059, description: "Casa de férias.", feature: "pousadas" },
            { name: "Village Paraíso Tropical", lat: -13.420356, lon: -38.857079, description: "Resort tropical.", feature: "pousadas" }
        ],
        'shops-submenu': [
            { name: "Absolute", lat: -13.421354, lon: -38.856099, description: "Loja de roupas.", feature: "lojas" },
            { name: "Local Brasil", lat: -13.422353, lon: -38.855119, description: "Produtos artesanais.", feature: "lojas" },
            { name: "Super Zimbo", lat: -13.423352, lon: -38.854139, description: "Supermercado.", feature: "lojas" },
                     { name: "Mateus Esquadrais", lat: -13.424350, lon: -38.853159, description: "Loja de materiais de construção.", feature: "lojas" },
            { name: "São Pedro Imobiliária", lat: -13.425349, lon: -38.852179, description: "Imobiliária.", feature: "lojas" },
            { name: "Imóveis Brasil Bahia", lat: -13.426348, lon: -38.851199, description: "Imobiliária.", feature: "lojas" },
            { name: "Coruja", lat: -13.427347, lon: -38.850219, description: "Loja de presentes.", feature: "lojas" },
            { name: "Zimbo Dive", lat: -13.428346, lon: -38.849239, description: "Loja de equipamentos de mergulho.", feature: "lojas" },
            { name: "Havaianas", lat: -13.429345, lon: -38.848259, description: "Loja de sandálias.", feature: "lojas" }
        ],
        'emergencies-submenu': [
            { name: "Ambulância", lat: -13.430344, lon: -38.847279, description: "Serviço de ambulância.", feature: "emergencias" },
            { name: "Unidade de Saúde", lat: -13.431343, lon: -38.846299, description: "Posto de saúde.", feature: "emergencias" },
            { name: "Polícia Civil", lat: -13.432342, lon: -38.845319, description: "Delegacia de Polícia Civil.", feature: "emergencias" },
            { name: "Polícia Militar", lat: -13.433341, lon: -38.844339, description: "Base da Polícia Militar.", feature: "emergencias" }
        ],
        'tips-submenu': [
            { name: "Melhores Pontos Turísticos", lat: -13.434340, lon: -38.843359, description: "Dicas dos melhores pontos turísticos.", feature: "dicas" },
            { name: "Melhores Passeios", lat: -13.435339, lon: -38.842379, description: "Dicas dos melhores passeios.", feature: "dicas" },
            { name: "Melhores Praias", lat: -13.436338, lon: -38.841399, description: "Dicas das melhores praias.", feature: "dicas" },
            { name: "Melhores Restaurantes", lat: -13.437337, lon: -38.840419, description: "Dicas dos melhores restaurantes.", feature: "dicas" },
            { name: "Melhores Pousadas", lat: -13.438336, lon: -38.839439, description: "Dicas das melhores pousadas.", feature: "dicas" },
            { name: "Melhores Lojas", lat: -13.439335, lon: -38.838459, description: "Dicas das melhores lojas.", feature: "dicas" }
        ],
        'about-submenu': [
            { name: "Missão", lat: -13.440334, lon: -38.837479, description: "Nossa missão.", feature: "sobre" },
            { name: "Serviços", lat: -13.441333, lon: -38.836499, description: "Nossos serviços.", feature: "sobre" },
            { name: "Benefícios para Turistas", lat: -13.442332, lon: -38.835519, description: "Benefícios oferecidos aos turistas.", feature: "sobre" },
            { name: "Benefícios para Moradores", lat: -13.443331, lon: -38.834539, description: "Benefícios oferecidos aos moradores.", feature: "sobre" },
            { name: "Benefícios para Pousadas", lat: -13.444330, lon: -38.833559, description: "Benefícios oferecidos às pousadas.", feature: "sobre" },
            { name: "Benefícios para Restaurantes", lat: -13.445329, lon: -38.832579, description: "Benefícios oferecidos aos restaurantes.", feature: "sobre" },
            { name: "Benefícios para Agências de Turismo", lat: -13.446328, lon: -38.831599, description: "Benefícios oferecidos às agências de turismo.", feature: "sobre" },
            { name: "Benefícios para Lojas e Comércios", lat: -13.447327, lon: -38.830619, description: "Benefícios oferecidos às lojas e comércios.", feature: "sobre" },
            { name: "Benefícios para Transportes", lat: -13.448326, lon: -38.829639, description: "Benefícios oferecidos aos transportes.", feature: "sobre" },
            { name: "Impacto em MSP", lat: -13.449325, lon: -38.828659, description: "Impacto do projeto em Morro de São Paulo.", feature: "sobre" }
        ],
        'education-submenu': [
            { name: "Iniciar Tutorial", lat: -13.450324, lon: -38.827679, description: "Comece aqui para aprender a usar o site.", feature: "educacao" },
            { name: "Planejar Viagem com IA", lat: -13.451323, lon: -38.826699, description: "Planeje sua viagem com a ajuda de inteligência artificial.", feature: "educacao" },
            { name: "Falar com IA", lat: -13.452322, lon: -38.825719, description: "Converse com nosso assistente virtual.", feature: "educacao" },
            { name: "Falar com Suporte", lat: -13.453321, lon: -38.824739, description: "Entre em contato com o suporte.", feature: "educacao" },
            { name: "Configurações", lat: -13.454320, lon: -38.823759, description: "Ajuste as configurações do site.", feature: "educacao" }
        ]
    };

    Object.keys(submenuItems).forEach(submenuId => {
    const submenuElement = document.getElementById(submenuId);
    if (submenuElement) {
        submenuItems[submenuId].forEach(item => {
            const button = document.createElement('button');
            button.className = 'submenu-button';
            button.setAttribute('data-lat', item.lat);
            button.setAttribute('data-lon', item.lon);
            button.setAttribute('data-name', item.name);
            button.setAttribute('data-description', item.description);
            button.setAttribute('data-feature', item.feature);
            button.setAttribute('data-destination', item.name);
            button.textContent = item.name;
            submenuElement.appendChild(button);
        });
    } else {
        console.warn(`Submenu element with id ${submenuId} not found`);
    }
});

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

    const aboutMoreBtn = document.getElementById('about-more-btn');
    if (aboutMoreBtn) {
        aboutMoreBtn.addEventListener('click', startCarousel);
    }

    if (createRouteBtn) {
        createRouteBtn.addEventListener('click', createRoute);
    }

    if (noBtn) {
        noBtn.addEventListener('click', () => {
            hideControlButtons();
        });
    }

    document.querySelectorAll('.submenu-button').forEach(btn => {
        btn.addEventListener('click', (event) => {
            closeSideMenu();
            hideAllControlButtons();
            handleDestinationSelection(btn);
            event.stopPropagation();
            if (tutorialIsActive && tutorialSteps[currentStep].step === 'destination-selection') {
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

    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', () => {
            stopSpeaking();
            if (tutorialIsActive) {
                endTutorial();
            } else {
                showTutorialStep('start-tutorial');
            }
        });
    }

    const tutorialYesBtn = document.getElementById('tutorial-yes-btn');
    const tutorialNoBtn = document.getElementById('tutorial-no-btn');
    const tutorialNextBtn = document.getElementById('tutorial-next-btn');
    const tutorialPrevBtn = document.getElementById('tutorial-prev-btn');
    const tutorialEndBtn = document.getElementById('tutorial-end-btn');

    if (tutorialYesBtn) tutorialYesBtn.addEventListener('click', startTutorial);
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
        });
    }

    const tipsBtn = document.querySelector('.menu-btn[data-feature="dicas"]');
    const educationBtn = document.querySelector('.menu-btn[data-feature="ensino"]');

    if (tipsBtn) tipsBtn.addEventListener('click', showTips);
    if (educationBtn) educationBtn.addEventListener('click', showEducation);
}


// Funções de Ajuste e Notificação

function hideControlButtons() {
    const buttonsToHide = [
        'tutorial-no-btn', 'tutorial-yes-btn', 'tutorial-next-btn', 'tutorial-prev-btn',
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
            height: '100%'
        });

        adjustModalStyles();
    } else {
        restoreModalAndControlsStyles();
    }

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
    map.setView([lat, lon], 14);
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    currentMarker = L.marker([lat, lon]).addTo(map).bindPopup(translations[selectedLanguage].youAreHere).openPopup();
    map.panTo([lat, lon]);
}

function adjustMapWithLocation(lat, lon, name, description) {
    map.setView([lat, lon], 14);
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

function showModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'block';
}

function showMenuToggleButton() {
    const menuToggle = document.getElementById('menu-btn');
    menuToggle.style.display = 'block';
}

function hideModal(id) {
    const modal = document.getElementById(id);
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
        'educacao': 'education-submenu'
    };

    const subMenuId = featureMappings[feature];

    if (!subMenuId) {
        console.error(`Feature não reconhecida: ${feature}`);
        return;
    }

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
    subMenu.style.display = 'block';

    switch (subMenuId) {
        case 'touristSpots-submenu':
            displayCustomTouristSpots();
            break;
        case 'beaches-submenu':
            displayCustomBeaches();
            break;
        case 'tours-submenu':
            displayCustomTours();
            break;
        case 'nightlife-submenu':
            displayCustomNightlife();
            break;
        case 'restaurants-submenu':
            displayCustomRestaurants();
            break;
        case 'inns-submenu':
            displayCustomInns();
            break;
        case 'shops-submenu':
            displayCustomShops();
            break;
        case 'tips-submenu':
            displayCustomTips();
            break;
        case 'emergencies-submenu':
            displayCustomEmergencies();
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
                    displayOSMData(data, subMenuId, feature);
                }
            });
            break;
    }
}

function handleSubmenuButtons(lat, lon, name, description, images, feature) {
    clearMarkers();
    adjustMapWithLocation(lat, lon, name, description);
    selectedDestination = { name, description, lat, lon, images, feature };
    saveDestinationToCache(selectedDestination).then(() => {
        sendDestinationToServiceWorker(selectedDestination);
    }).catch(error => {
        console.error('Erro ao salvar destino no cache:', error);
    });

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
        { name: "Passeio de lancha Volta a Ilha de Tinharé", lat: -13.379, lon: -38.918, description: "Desfrute de um emocionante passeio de lancha ao redor da Ilha de Tinharé." },
        { name: "Passeio de Quadriciclo para Garapuá", lat: -13.380, lon: -38.920, description: "Aventure-se em um emocionante passeio de quadriciclo até a pitoresca vila de Garapuá." },
        { name: "Passeio 4X4 para Garapuá", lat: -13.381, lon: -38.922, description: "Embarque em uma viagem emocionante de 4x4 até Garapuá." },
        { name: "Passeio de Barco para Gamboa", lat: -13.383, lon: -38.924, description: "Relaxe em um agradável passeio de barco até Gamboa." }
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
    const education = [
        { name: "Iniciar Tutorial", lat: -13.3766787, lon: -38.9172057, description: "Comece aqui para aprender a usar o site." },
        { name: "Planejar Viagem com IA", lat: -13.3766787, lon: -38.9172057, description: "Planeje sua viagem com a ajuda de inteligência artificial." },
        { name: "Falar com IA", lat: -13.3766787, lon: -38.9172057, description: "Converse com nosso assistente virtual." },
        { name: "Falar com Suporte", lat: -13.3766787, lon: -38.9172057, description: "Entre em contato com o suporte." },
        { name: "Configurações", lat: -13.3766787, lon: -38.9172057, description: "Ajuste as configurações do site." }
    ];

    const subMenu = document.getElementById('education-submenu');
    subMenu.innerHTML = '';

    education.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item';
        btn.textContent = item.name;
        btn.setAttribute('data-lat', item.lat);
        btn.setAttribute('data-lon', item.lon);
        btn.setAttribute('data-name', item.name);
        btn.setAttribute('data-description', item.description);
        btn.setAttribute('data-feature', 'educacao');
        btn.setAttribute('data-destination', item.name);
        btn.onclick = () => {
            handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], 'educacao');
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

function showControlButtons() {
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsTour() {
    hideAllControlButtons();
    document.getElementById('tour-btn').style.display = 'flex';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsNightlife() {
    hideAllControlButtons();
    document.getElementById('buy-ticket-btn').style.display = 'flex';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsRestaurants() {
    hideAllControlButtons();
    document.getElementById('reserve-restaurants-btn').style.display = 'flex';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsInns() {
    hideAllControlButtons();
    document.getElementById('reserve-inns-btn').style.display = 'flex';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsShops() {
    hideAllControlButtons();
    document.getElementById('speak-attendent-btn').style.display = 'flex';
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsTips() {
    hideAllControlButtons();
    document.getElementById('about-more-btn').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsEmergencies() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.getElementById('call-btn').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsTouristSpots() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'flex';
}

function showControlButtonsBeaches() {
    hideAllControlButtons();
    document.getElementById('create-route-btn').style.display = 'flex';
    document.getElementById('about-more-btn').style.display = 'flex';
    document.querySelector('.control-buttons').style.display = 'flex';
}

function hideAllControlButtons() {
    const controlButtons = document.querySelector('.control-buttons');
    const buttons = controlButtons.querySelectorAll('button');
    buttons.forEach(button => button.style.display = 'none');
}

function showAssistantModalWithCarousel() {
    initializeCarousel(images);
    document.getElementById('assistant-modal').style.display = 'block';
}

function startCarousel() {
    if (!selectedDestination || !selectedDestination.images || selectedDestination.images.length === 0) {
        alert('No images available for the carousel.');
        console.error('No images available for the carousel.');
        return;
    }
    const carouselContainer = document.getElementById('carousel-container');
    if (!carouselContainer) {
        console.error('Carousel container not found.');
        return;
    }
    carouselContainer.innerHTML = ''; // Clear previous images

    selectedDestination.images.forEach((imageSrc, index) => {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.className = 'carousel-image';
        if (index === 0) img.classList.add('active'); // Show the first image by default
        carouselContainer.appendChild(img);
    });

    showModal('assistant-modal');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Modal not found: ' + modalId);
    }
}


function showLocationDetailsInModal(name, description, images) {
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    modalContent.innerHTML = '';
    
    const titleElement = document.createElement('h2');
    titleElement.textContent = name;
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;
    
    modalContent.appendChild(titleElement);
    modalContent.appendChild(descriptionElement);
    
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel';
    
    images.forEach((image, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = `${name} Image ${index + 1}`;
        carouselItem.appendChild(imgElement);
        carouselContainer.appendChild(carouselItem);
    });
    
    modalContent.appendChild(carouselContainer);
    
    initializeCarousel(images);
}

function initializeCarousel(images) {
    const carouselContainer = document.getElementById('carousel-container');
    if (!carouselContainer) {
        console.error('Carousel container not found.');
        return;
    }
    carouselContainer.innerHTML = ''; // Clear previous images

    images.forEach((imageSrc, index) => {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.className = 'carousel-image';
        if (index === 0) img.classList.add('active'); // Show the first image by default
        carouselContainer.appendChild(img);
    });
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
        let currentLocation = await getCurrentLocation();
        if (currentLocation) {
            const { latitude, longitude } = currentLocation.coords;
            console.log(`Criando rota de (${latitude}, ${longitude}) para (${lat}, ${lon}) utilizando o perfil ${profile}`);
            await plotRouteOnMap(latitude, longitude, lat, lon, profile);
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


// Função para obter imagens para uma localização
function getImagesForLocation(locationName) {
    const imageDatabase = {
        'Toca do Morcego': [
            'https://img.freepik.com/free-photo/breathtaking-view-cliff-overlooking-ocean-morro-sao-paulo-bahia-brazil_181624-22279.jpg',
            'https://img.freepik.com/free-photo/beautiful-beach-cliffs-clear-sky-morro-sao-paulo-bahia-brazil_181624-22280.jpg',
            'https://img.freepik.com/free-photo/aerial-view-beach-cliffs-morro-sao-paulo-bahia-brazil_181624-22278.jpg'
        ],
        'Farol do Morro': [
            'https://img.freepik.com/free-photo/lighthouse-coastline-morro-sao-paulo-bahia-brazil_181624-22282.jpg',
            'https://img.freepik.com/free-photo/beautiful-lighthouse-sea-morro-sao-paulo-bahia-brazil_181624-22283.jpg',
            'https://img.freepik.com/free-photo/lighthouse-top-view-morro-sao-paulo-bahia-brazil_181624-22284.jpg'
        ],
        'Mirante da Tirolesa': [
            'https://img.freepik.com/free-photo/viewpoint-skyline-morro-sao-paulo-bahia-brazil_181624-22285.jpg',
            'https://img.freepik.com/free-photo/aerial-view-mirante-morro-sao-paulo-bahia-brazil_181624-22286.jpg',
            'https://img.freepik.com/free-photo/viewpoint-scenic-sunset-morro-sao-paulo-bahia-brazil_181624-22287.jpg'
        ],
        'Fortaleza de Morro de São Paulo': [
            'https://img.freepik.com/free-photo/fortress-seaside-morro-sao-paulo-bahia-brazil_181624-22288.jpg',
            'https://img.freepik.com/free-photo/ancient-fortress-ocean-morro-sao-paulo-bahia-brazil_181624-22289.jpg',
            'https://img.freepik.com/free-photo/fortress-aerial-view-morro-sao-paulo-bahia-brazil_181624-22290.jpg'
        ],
        'Paredão da Argila': [
            'https://img.freepik.com/free-photo/clay-wall-close-up-morro-sao-paulo-bahia-brazil_181624-22291.jpg',
            'https://img.freepik.com/free-photo/clay-wall-beach-morro-sao-paulo-bahia-brazil_181624-22292.jpg',
            'https://img.freepik.com/free-photo/clay-wall-seaside-morro-sao-paulo-bahia-brazil_181624-22293.jpg'
        ],
        'Passeio de lancha Volta a Ilha de Tinharé': [
            'https://img.freepik.com/free-photo/boat-tour-island-morro-sao-paulo-bahia-brazil_181624-22294.jpg',
            'https://img.freepik.com/free-photo/boat-trip-around-island-morro-sao-paulo-bahia-brazil_181624-22295.jpg',
            'https://img.freepik.com/free-photo/boat-tour-aerial-view-morro-sao-paulo-bahia-brazil_181624-22296.jpg'
        ],
        'Passeio de Quadriciclo para Garapuá': [
            'https://img.freepik.com/free-photo/quad-bike-tour-beach-morro-sao-paulo-bahia-brazil_181624-22297.jpg',
            'https://img.freepik.com/free-photo/quad-bike-ride-morro-sao-paulo-bahia-brazil_181624-22298.jpg',
            'https://img.freepik.com/free-photo/quad-bike-seaside-morro-sao-paulo-bahia-brazil_181624-22299.jpg'
        ],
        'Passeio 4X4 para Garapuá': [
            'https://img.freepik.com/free-photo/4x4-ride-beach-morro-sao-paulo-bahia-brazil_181624-22300.jpg',
            'https://img.freepik.com/free-photo/4x4-vehicle-seaside-morro-sao-paulo-bahia-brazil_181624-22301.jpg',
            'https://img.freepik.com/free-photo/4x4-ride-scenic-view-morro-sao-paulo-bahia-brazil_181624-22302.jpg'
        ],
        'Passeio de Barco para Gamboa': [
            'https://img.freepik.com/free-photo/boat-trip-gamboa-morro-sao-paulo-bahia-brazil_181624-22303.jpg',
            'https://img.freepik.com/free-photo/boat-tour-sunset-gamboa-morro-sao-paulo-bahia-brazil_181624-22304.jpg',
            'https://img.freepik.com/free-photo/boat-ride-gamboa-morro-sao-paulo-bahia-brazil_181624-22305.jpg'
        ],
        'Primeira Praia': [
            'https://example.com/primeirapraia1.jpg',
            'https://example.com/primeirapraia2.jpg',
            'https://example.com/primeirapraia3.jpg'
        ],
        'Praia do Pôrto': [
            'https://example.com/praiaporto1.jpg',
            'https://example.com/praiaporto2.jpg',
            'https://example.com/praiaporto3.jpg'
        ],
        'Praia da Gamboa': [
            'https://example.com/praiadagamboa1.jpg',
            'https://example.com/praiadagamboa2.jpg',
            'https://example.com/praiadagamboa3.jpg'
        ],
        'Segunda Praia': [
            'https://example.com/segundapraia1.jpg',
            'https://example.com/segundapraia2.jpg',
            'https://example.com/segundapraia3.jpg'
        ],
        'Toca do Morcego Festas': [
            'https://example.com/tocadomorcego1.jpg',
            'https://example.com/tocadomorcego2.jpg',
            'https://example.com/tocadomorcego3.jpg'
        ],
        'One Love': [
            'https://example.com/onelove1.jpg',
            'https://example.com/onelove2.jpg',
            'https://example.com/onelove3.jpg'
        ],
        'Pulsar': [
            'https://example.com/pulsar1.jpg',
            'https://example.com/pulsar2.jpg',
            'https://example.com/pulsar3.jpg'
        ],
        'Mama Iate': [
            'https://example.com/mamaiate1.jpg',
            'https://example.com/mamaiate2.jpg',
            'https://example.com/mamaiate3.jpg'
        ],
        'Teatro do Morro': [
            'https://example.com/teatrodomorro1.jpg',
            'https://example.com/teatrodomorro2.jpg',
            'https://example.com/teatrodomorro3.jpg'
        ],
        'Terceira Praia': [
            'https://example.com/terceirapraia1.jpg',
            'https://example.com/terceirapraia2.jpg',
            'https://example.com/terceirapraia3.jpg'
        ],
        'Quarta Praia': [
            'https://example.com/quartapraia1.jpg',
            'https://example.com/quartapraia2.jpg',
            'https://example.com/quartapraia3.jpg'
        ],
        'Praia do Encanto': [
            'https://example.com/praiadoencanto1.jpg',
            'https://example.com/praiadoencanto2.jpg',
            'https://example.com/praiadoencanto3.jpg'
        ],
        'Morena Bela': [
            'https://example.com/morenabela1.jpg',
            'https://example.com/morenabela2.jpg',
            'https://example.com/morenabela3.jpg'
        ],
        'Basílico': [
            'https://example.com/basilico1.jpg',
            'https://example.com/basilico2.jpg',
            'https://example.com/basilico3.jpg'
        ],
        'Ki Massa': [
            'https://example.com/kimassa1.jpg',
            'https://example.com/kimassa2.jpg',
            'https://example.com/kimassa3.jpg'
        ],
        'Tempeiro Caseiro': [
            'https://example.com/tempeirocaseiro1.jpg',
            'https://example.com/tempeirocaseiro2.jpg',
            'https://example.com/tempeirocaseiro3.jpg'
        ],
        'Bizu': [
            'https://example.com/bizu1.jpg',
            'https://example.com/bizu2.jpg',
            'https://example.com/bizu3.jpg'
        ],
        'Pedra Sobre Pedra': [
            'https://example.com/pedrasobrepedra1.jpg',
            'https://example.com/pedrasobrepedra2.jpg',
            'https://example.com/pedrasobrepedra3.jpg'
        ],
        'Forno a Lenha de Mercedes': [
            'https://example.com/fornoalenha1.jpg',
            'https://example.com/fornoalenha2.jpg',
            'https://example.com/fornoalenha3.jpg'
        ],
        'Ponto G': [
            'https://example.com/pontog1.jpg',
            'https://example.com/pontog2.jpg',
            'https://example.com/pontog3.jpg'
        ],
        'Ponto 9,99': [
            'https://example.com/ponto9991.jpg',
            'https://example.com/ponto9992.jpg',
            'https://example.com/ponto9993.jpg'
        ],
        'Patricia': [
            'https://example.com/patricia1.jpg',
            'https://example.com/patricia2.jpg',
            'https://example.com/patricia3.jpg'
        ],
        'dizi 10': [
            'https://example.com/dizi101.jpg',
            'https://example.com/dizi102.jpg',
            'https://example.com/dizi103.jpg'
        ],
        'Papoula': [
            'https://example.com/papoula1.jpg',
            'https://example.com/papoula2.jpg',
            'https://example.com/papoula3.jpg'
        ],
        'Sabor da terra': [
            'https://example.com/sabordaterr1.jpg',
            'https://example.com/sabordaterr2.jpg',
            'https://example.com/sabordaterr3.jpg'
        ],
        'Branco&Negro': [
            'https://example.com/branconegro1.jpg',
            'https://example.com/branconegro2.jpg',
            'https://example.com/branconegro3.jpg'
        ],
        'Six Club': [
            'https://example.com/sixclub1.jpg',
            'https://example.com/sixclub2.jpg',
            'https://example.com/sixclub3.jpg'
        ],
        'Santa Villa': [
            'https://example.com/santavilla1.jpg',
            'https://example.com/santavilla2.jpg',
            'https://example.com/santavilla3.jpg'
        ],
        'Recanto do Aviador': [
            'https://example.com/recantoaviador1.jpg',
            'https://example.com/recantoaviador2.jpg',
            'https://example.com/recantoaviador3.jpg'
        ],
        'Sambass': [
            'https://example.com/sambass1.jpg',
            'https://example.com/sambass2.jpg',
            'https://example.com/sambass3.jpg'
        ],
        'Bar e Restaurante da Morena': [
            'https://example.com/restaurante1.jpg',
            'https://example.com/restaurante2.jpg',
            'https://example.com/restaurante3.jpg'
        ],
        'Restaurante Alecrim': [
            'https://example.com/alecrim1.jpg',
            'https://example.com/alecrim2.jpg',
            'https://example.com/alecrim3.jpg'
        ],
        'Andina Cozinha Latina': [
            'https://example.com/andinacozinha1.jpg',
            'https://example.com/andinacozinha2.jpg',
            'https://example.com/andinacozinha3.jpg'
        ],
        'Papoula Culinária Artesanal': [
            'https://example.com/papoulaculinaria1.jpg',
            'https://example.com/papoulaculinaria2.jpg',
            'https://example.com/papoulaculinaria3.jpg'
        ],
        'Louca Paixão': [
            'https://example.com/loucapaixao1.jpg',
            'https://example.com/loucapaixao2.jpg',
            'https://example.com/loucapaixao3.jpg'
        ],
        'Café das Artes': [
            'https://example.com/cafedasartes1.jpg',
            'https://example.com/cafedasartes2.jpg',
            'https://example.com/cafedasartes3.jpg'
        ],
        'Canoa': [
            'https://example.com/canoa1.jpg',
            'https://example.com/canoa2.jpg',
            'https://example.com/canoa3.jpg'
        ],
        'Restaurante do Francisco': [
            'https://example.com/francisco1.jpg',
            'https://example.com/francisco2.jpg',
            'https://example.com/francisco3.jpg'
        ],
        'La Tabla': [
            'https://example.com/latabla1.jpg',
            'https://example.com/latabla2.jpg',
            'https://example.com/latabla3.jpg'
        ],
        'Santa Luzia': [
            'https://example.com/santaluzia1.jpg',
            'https://example.com/santaluzia2.jpg',
            'https://example.com/santaluzia3.jpg'
        ],
        'Chez Max': [
            'https://example.com/chezmax1.jpg',
            'https://example.com/chezmax2.jpg',
            'https://example.com/chezmax3.jpg'
        ],
        'Barraca da Miriam': [
            'https://example.com/barracamiriam1.jpg',
            'https://example.com/barracamiriam2.jpg',
            'https://example.com/barracamiriam3.jpg'
        ],
        'O Casarão restaurante': [
            'https://example.com/casaraorestaurante1.jpg',
            'https://example.com/casaraorestaurante2.jpg',
            'https://example.com/casaraorestaurante3.jpg'
        ],
        'Hotel Fazenda Parque Vila Guaiamu': [
            'https://example.com/hotelguaiamu1.jpg',
            'https://example.com/hotelguaiamu2.jpg',
            'https://example.com/hotelguaiamu3.jpg'
        ],
        'Pousada Fazenda Caeiras': [
            'https://example.com/fazendacaeiras1.jpg',
            'https://example.com/fazendacaeiras2.jpg',
            'https://example.com/fazendacaeiras3.jpg'
        ],
        'Amendoeira Hotel': [
            'https://example.com/amendoeira1.jpg',
            'https://example.com/amendoeira2.jpg',
            'https://example.com/amendoeira3.jpg'
        ],
        'Pousada Natureza': [
            'https://example.com/natureza1.jpg',
            'https://example.com/natureza2.jpg',
            'https://example.com/natureza3.jpg'
        ],
        'Pousada dos Pássaros': [
            'https://example.com/passaro1.jpg',
            'https://example.com/passaro2.jpg',
            'https://example.com/passaro3.jpg'
        ],
        'Hotel Morro de São Paulo': [
            'https://example.com/hotelmorrodsp1.jpg',
            'https://example.com/hotelmorrodsp2.jpg',
            'https://example.com/hotelmorrodsp3.jpg'
        ],
        'Uma Janela para o Sol': [
            'https://example.com/umajanelaparasol1.jpg',
            'https://example.com/umajanelaparasol2.jpg',
            'https://example.com/umajanelaparasol3.jpg'
        ],
        'Portaló': [
            'https://example.com/portalo1.jpg',
            'https://example.com/portalo2.jpg',
            'https://example.com/portalo3.jpg'
        ],
        'Pérola do Morro': [
            'https://example.com/peroladomorro1.jpg',
            'https://example.com/peroladomorro2.jpg',
            'https://example.com/peroladomorro3.jpg'
        ],
        'Safira do Morro': [
            'https://example.com/safiradomorro1.jpg',
            'https://example.com/safiradomorro2.jpg',
            'https://example.com/safiradomorro3.jpg'
        ],
        'Xerife Hotel': [
            'https://example.com/xerifehotel1.jpg',
            'https://example.com/xerifehotel2.jpg',
            'https://example.com/xerifehotel3.jpg'
        ],
        'Ilha da Saudade': [
            'https://example.com/ilhadsaudade1.jpg',
            'https://example.com/ilhadsaudade2.jpg',
            'https://example.com/ilhadsaudade3.jpg'
        ],
        'Porto dos Milagres': [
            'https://example.com/portodosmilagres1.jpg',
            'https://example.com/portodosmilagres2.jpg',
            'https://example.com/portodosmilagres3.jpg'
        ],
        'Passarte': [
            'https://example.com/passarte1.jpg',
            'https://example.com/passarte2.jpg',
            'https://example.com/passarte3.jpg'
        ],
        'Pousada da Praça': [
            'https://example.com/praca1.jpg',
            'https://example.com/praca2.jpg',
            'https://example.com/praca3.jpg'
        ],
        'Pousada Colibri': [
            'https://example.com/colibri1.jpg',
            'https://example.com/colibri2.jpg',
            'https://example.com/colibri3.jpg'
        ],
        'Pousada Porto de Cima': [
            'https://example.com/portodecima1.jpg',
            'https://example.com/portodecima2.jpg',
            'https://example.com/portodecima3.jpg'
        ],
        'Vila Guaiamu': [
            'https://example.com/vilaguaiamu1.jpg',
            'https://example.com/vilaguaiamu2.jpg',
            'https://example.com/vilaguaiamu3.jpg'
        ],
        'Villa dos Corais pousada': [
            'https://example.com/villadoscorais1.jpg',
            'https://example.com/villadoscorais2.jpg',
            'https://example.com/villadoscorais3.jpg'
        ],
        'Pousada Fazenda Caeira': [
            'https://example.com/fazendacaeira1.jpg',
            'https://example.com/fazendacaeira2.jpg',
            'https://example.com/fazendacaeira3.jpg'
        ],
        'Hotel Anima': [
            'https://example.com/hotelanima1.jpg',
            'https://example.com/hotelanima2.jpg',
            'https://example.com/hotelanima3.jpg'
        ],
        'Vila dos Orixás Boutique Hotel & Spa': [
            'https://example.com/vilaorixas1.jpg',
            'https://example.com/vilaorixas2.jpg',
            'https://example.com/vilaorixas3.jpg'
        ],
        'Hotel Karapitangui': [
            'https://example.com/karapitangui1.jpg',
            'https://example.com/karapitangui2.jpg',
            'https://example.com/karapitangui3.jpg'
        ],
        'Pousada Timbalada': [
            'https://example.com/timbalada1.jpg',
            'https://example.com/timbalada2.jpg',
            'https://example.com/timbalada3.jpg'
        ],
        'Casa Celestino Residence': [
            'https://example.com/celestino1.jpg',
            'https://example.com/celestino2.jpg',
            'https://example.com/celestino3.jpg'
        ],
        'Bahia Bacana Pousada': [
            'https://example.com/bahiabacana1.jpg',
            'https://example.com/bahiabacana2.jpg',
            'https://example.com/bahiabacana3.jpg'
        ],
        'Ilha da Saudade': [
            'https://example.com/ilhadsaudade1.jpg',
            'https://example.com/ilhadsaudade2.jpg',
            'https://example.com/ilhadsaudade3.jpg'
        ],
        'Hotel Morro da Saudade': [
            'https://example.com/morrodesaude1.jpg',
            'https://example.com/morrodesaude2.jpg',
            'https://example.com/morrodesaude3.jpg'
        ],
        'Bangalô dos sonhos': [
            'https://example.com/bangalodossonhos1.jpg',
            'https://example.com/bangalodossonhos2.jpg',
            'https://example.com/bangalodossonhos3.jpg'
        ],
        'Cantinho da Josete': [
            'https://example.com/cantinhojosete1.jpg',
            'https://example.com/cantinhojosete2.jpg',
            'https://example.com/cantinhojosete3.jpg'
        ],
        'Vila Morro do Sao Paulo': [
            'https://example.com/vilamorro1.jpg',
            'https://example.com/vilamorro2.jpg',
            'https://example.com/vilamorro3.jpg'
        ],
        'Casa Rossa': [
            'https://example.com/casarossa1.jpg',
            'https://example.com/casarossa2.jpg',
            'https://example.com/casarossa3.jpg'
        ],
        'Village Paraíso Tropical': [
            'https://example.com/villageparaiso1.jpg',
            'https://example.com/villageparaiso2.jpg',
            'https://example.com/villageparaiso3.jpg'
        ],
        'Absolute': [
            'https://example.com/absolute1.jpg',
            'https://example.com/absolute2.jpg',
            'https://example.com/absolute3.jpg'
        ],
        'Local Brasil': [
            'https://example.com/localbrasil1.jpg',
            'https://example.com/localbrasil2.jpg',
            'https://example.com/localbrasil3.jpg'
        ],
        'Super Zimbo': [
            'https://example.com/superzimbo1.jpg',
            'https://example.com/superzimbo2.jpg',
            'https://example.com/superzimbo3.jpg'
        ],
        'Mateus Esquadrais': [
            'https://example.com/mateusesquadrais1.jpg',
            'https://example.com/mateusesquadrais2.jpg',
            'https://example.com/mateusesquadrais3.jpg'
        ],
        'São Pedro Imobiliária': [
            'https://example.com/saopedro1.jpg',
            'https://example.com/saopedro2.jpg',
            'https://example.com/saopedro3.jpg'
        ],
        'Imóveis Brasil Bahia': [
            'https://example.com/brasilbahia1.jpg',
            'https://example.com/brasilbahia2.jpg',
            'https://example.com/brasilbahia3.jpg'
        ],
        'Coruja': [
            'https://example.com/coruja1.jpg',
            'https://example.com/coruja2.jpg',
            'https://example.com/coruja3.jpg'
        ],
        'Zimbo Dive': [
            'https://example.com/zimbo1.jpg',
            'https://example.com/zimbo2.jpg',
            'https://example.com/zimbo3.jpg'
        ],
        'Havaianas': [
            'https://example.com/havaianas1.jpg',
            'https://example.com/havaianas2.jpg',
            'https://example.com/havaianas3.jpg'
        ]
    };

    return imageDatabase[locationName] || [];
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
        document.getElementById('create-itinerary-btn').style.display = 'inline-block';
        document.getElementById('tutorial-yes-btn').style.display = 'none';
        document.getElementById('tutorial-next-btn').style.display = 'none';
        document.getElementById('tutorial-prev-btn').style.display = 'none';
        document.getElementById('tutorial-end-btn').style.display = 'none';
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

    const progressBar = document.getElementById('tutorial-progress-bar');
    progressBar.style.width = '0%';

    document.getElementById('tutorial-no-btn').style.display = 'none';
    document.getElementById('create-itinerary-btn').style.display = 'none';
    document.getElementById('tutorial-yes-btn').style.display = 'none';
    document.getElementById('tutorial-next-btn').style.display = 'none';
    document.getElementById('tutorial-prev-btn').style.display = 'none';
    document.getElementById('tutorial-end-btn').style.display = 'none';
    document.getElementById('create-route-btn').style.display = 'none';

    currentStep = 0;
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

function startTutorial2() {
    currentStep = 0;
    tutorialIsActive = true;
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

// Função para parar a síntese de fala
function stopSpeaking() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
}

// Função para iniciar a síntese de fala
function speakText(text) {
    // Primeiro, para qualquer fala em andamento
    stopSpeaking();
    
    // Cria um novo utterance com o texto fornecido
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'pt' ? 'pt-BR' : 
                     selectedLanguage === 'en' ? 'en-US' : 
                     selectedLanguage === 'es' ? 'es-ES' : 
                     'he-IL';

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

// Exemplo de uso
document.getElementById('stop-speaking-btn').addEventListener('click', stopSpeaking);

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
        const viewBox = '-38.926, -13.369, -38.895, -13.392';
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewBox}&bounded=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const filteredData = data.filter(location => {
                        const lat = parseFloat(location.lat);
                        const lon = parseFloat(location.lon);
                        return lon >= -38.926 && lon <= -38.895 && lat >= -13.392 && lat <= -13.369;
                    });

                    if (filteredData.length > 0) {
                        var firstResult = filteredData[0];
                        var lat = firstResult.lat;
                        var lon = firstResult.lon;

                        if (currentMarker) {
                            map.removeLayer(currentMarker);
                        }

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
