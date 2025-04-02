// Language.js

import { showTutorialStep } from '../tutorial/tutorial.js';

/**
 * 1. translateInstruction - Traduz uma instrução usando um dicionário.
 */
export function translateInstruction(instruction, lang = 'pt') {
  const dictionary = {
    pt: {
      'Turn right': 'Vire à direita',
      'Turn left': 'Vire à esquerda',
      'Continue straight': 'Continue em frente',
    },
    en: {
      'Vire à direita': 'Turn right',
      'Vire à esquerda': 'Turn left',
      'Continue em frente': 'Continue straight',
    },
  };
  if (!dictionary[lang]) return instruction;
  return dictionary[lang][instruction] || instruction;
}

/**
 * 2. translatePageContent - Atualiza todos os textos da interface conforme o idioma.
 */
export function translatePageContent(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  let missingCount = 0;
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translation = getGeneralText(key, lang);
    if (translation.startsWith('⚠️')) {
      missingCount++;
      console.warn(
        `translatePageContent: Tradução ausente para "${key}" em ${lang}.`
      );
    }
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = translation;
    } else if (el.hasAttribute('title')) {
      el.title = translation;
    } else {
      el.textContent = translation;
    }
  });
  if (missingCount > 0) {
    console.warn(`translatePageContent: ${missingCount} traduções ausentes.`);
  } else {
    console.log(`translatePageContent: Interface traduzida para ${lang}.`);
  }
}

/**
 * 3. validateTranslations - Verifica se todas as chaves de tradução estão definidas.
 */
export function validateTranslations(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  const missingKeys = [];
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translation = getGeneralText(key, lang);
    if (translation.startsWith('⚠️')) {
      missingKeys.push(key);
    }
  });
  if (missingKeys.length > 0) {
    console.warn(
      `validateTranslations: Faltam traduções para ${lang}:`,
      missingKeys
    );
  } else {
    console.log(
      `validateTranslations: Todas as traduções definidas para ${lang}.`
    );
  }
}

/**
 * 4. applyLanguage - Aplica o idioma na interface e valida as traduções.
 */
export function applyLanguage(lang) {
  validateTranslations(lang);
  updateInterfaceLanguage(lang);
  console.log(`applyLanguage: Idioma aplicado: ${lang}`);
}
/**
 * 5. getGeneralText - Retorna o texto traduzido para uma chave e idioma.
 */
export function getGeneralText(key, lang = 'pt') {
  if (!translationsData[lang] || !translationsData[lang][key]) {
    console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
    return key; // Se não houver tradução, retorna a própria chave
  }
  return translationsData[lang][key];
}

/*
    7. updateInterfaceLanguage - Atualiza os textos da interface conforme o idioma */

export function updateInterfaceLanguage(lang) {
  const elementsToTranslate = document.querySelectorAll('[data-i18n]');
  let missingTranslations = 0;

  elementsToTranslate.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    let translation = getGeneralText(key, lang);

    if (!translation || translation.startsWith('⚠️')) {
      missingTranslations++;
      console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
      translation = key; // Usa a chave original se não houver tradução
    }

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else if (element.hasAttribute('title')) {
      element.title = translation;
    } else {
      element.textContent = translation;
    }
  });

  if (missingTranslations > 0) {
    console.warn(`Total de traduções ausentes: ${missingTranslations}`);
  } else {
    console.log(`Traduções aplicadas com sucesso para o idioma: ${lang}`);
  }
}

const translationsData = {
  pt: {
    // NOVAS CHAVES ADICIONADAS OU AJUSTADAS
    title: 'Morro de São Paulo Digital',
    chooseLanguage: 'Escolha seu idioma:',
    tourist_spots: 'Pontos Turísticos',
    tours: 'Passeios',
    beaches: 'Praias',
    parties: 'Festas',
    restaurants: 'Restaurantes',
    inns: 'Pousadas',
    shops: 'Lojas',
    emergencies: 'Emergências',
    cancel_navigation: 'Cancelar Navegação',
    start_route: 'Iniciar Rota',
    route_summary_title: 'Resumo da Rota',
    route_distance: 'Distância:',
    route_eta: 'Tempo Estimado:',
    instructions_title: 'Instruções de Navegação',
    call: 'Ligar', // Tradução adicionada
    reserveTable: 'Reservar Mesa', // Exemplo de outra tradução adicionada

    // Chaves já existentes
    close_modal: 'X',
    close_modal_carousel: 'X',
    close_menu: 'Fechar Menu',
    offlineTitle: 'Modo Offline',
    offlineMsg:
      'Você está offline. Algumas funcionalidades podem não estar disponíveis.',
    offRoute: 'Você saiu da rota. Recalculando...',
    routeError: 'Erro',
    noInstructions: 'Nenhuma instrução disponível.',
    destinationReached: 'Destino alcançado.',
    complete: 'completo',
    recalculatingRoute: 'Recalculando rota...',
    createRouteError: 'Erro ao criar rota. Por favor, tente novamente.',
    pathDrawnSuccess: 'Nova rota desenhada com sucesso.',
    navigationStarted: 'Navegação iniciada.',
    arrivedAtDestination: 'Você chegou ao seu destino!',
    loadingResources: 'Carregando recursos necessários...',
    loadingResourcesFail: 'Falha ao carregar recursos. Tente novamente.',
    selectDestinationFirst: 'Por favor, selecione um destino primeiro.',
    routeNotFoundAPI: 'Nenhuma rota encontrada pela API (features vazias).',
    failedToPlotRoute: 'Falha ao plotar rota no mapa.',
    userOffRoad: 'Você saiu da estrada!',
    trackingError:
      'Falha no rastreamento de localização. Verifique permissões.',
    checkingDeviation: 'Verificando possível desvio de rota...',
    multiRouteFail: 'Falha ao plotar rota com múltiplos destinos.',
    userIsIdle: 'Você está parado. Deseja continuar ou recalcular a rota?',
    partnerCheckin:
      'Você chegou em {partnerName}! Ganhou um Drink e 10 pontos!',
    routeRecalculatedOk: 'Rota recalculada com sucesso.',
    routeDeviated: 'Você desviou da rota. Recalculando...',
    invalidDestination: 'Destino inválido. Por favor, selecione outro.',
    obstacleDetected: 'Obstáculo detectado à frente. Ajustando rota.',
    routeDataError: 'Erro ao carregar dados da rota.',
    noRoutePreview: 'Nenhuma rota disponível para pré-visualização.',
    routePreviewActivated: 'Pré-visualização da rota ativada.',
    navEnded: 'Navegação encerrada.',
    navPaused: 'Navegação pausada.',
    navResumed: 'Navegação retomada.',
    getRouteInstructions: 'Iniciando obtenção de instruções de rota...',
    instructionsMissing: 'Instruções ausentes ou não encontradas.',
    pleaseSelectDestination:
      'Por favor, selecione um destino antes de iniciar a rota.',
    noCarouselImages: 'Nenhuma imagem disponível para o carrossel.',
    searchError: 'Ocorreu um erro na busca.',
    confirmRoute: 'Confirme sua rota.',
    noLocationPermission: 'Permissão de localização negada.',
    waitingForRoute: 'Aguardando rota.',
    adjustPosition: 'Ajuste sua posição para uma rua próxima.',
    errorTitle: 'Erro',
    errorCloseButton: 'Fechar',
    offlineModeButton: 'Entendido',
    assistantModalClose: 'Fechar Assistente',
    welcomeTitle: 'BEM-VINDO!',
    welcomeSubtitle: 'Escolha seu idioma:',
    dicasMenu: 'Dicas',
    zoomIn: 'Aumentar Zoom',
    zoomOut: 'Diminuir Zoom',
    pesquisar: 'Pesquisar',
    sobreMenu: 'Sobre',
    closeSideMenu: 'Fechar Menu',
    submenu_touristSpots: 'Pontos Turísticos',
    submenu_tours: 'Passeios',
    submenu_beaches: 'Praias',
    submenu_nightlife: 'Vida Noturna',
    submenu_restaurants: 'Restaurantes',
    submenu_inns: 'Pousadas',
    submenu_shops: 'Lojas',
    submenu_emergencies: 'Emergências',
    submenu_tips: 'Dicas',
    submenu_about: 'Sobre',
    submenu_education: 'Educação',
    tutorialBtn: 'Iniciar Tutorial',
    pontosTuristicosBtn: 'Pontos Turísticos',
    passeiosBtn: 'Passeios',
    praiasBtn: 'Praias',
    festasBtn: 'Festas',
    restaurantesBtn: 'Restaurantes',
    pousadasBtn: 'Pousadas',
    lojasBtn: 'Lojas',
    emergenciasBtn: 'Emergências',
    fotosBtn: 'Fotos',
    comoChegarBtn: 'Como Chegar',
    reservarMesaBtn: 'Reservar Mesa',
    ligarBtn: 'Ligar',
    reservarQuartoBtn: 'Reservar Quarto',
    reservarCadeirasBtn: 'Reservar Cadeiras',
    comprarIngressoBtn: 'Comprar Ingresso',
    reservarPasseioBtn: 'Reservar Passeio',
    enviarBtn: 'Enviar',
    acessarSiteBtn: 'Acessar Site',
    iniciarNavegacaoBtn: 'Iniciar Navegação',
    pararNavegacaoBtn: 'Parar Navegação',
    acessarMenuBtn: 'Acessar Menu',
    iniciarRotaBtn: 'Iniciar Rota',
    cancelarNavegacaoBtn: 'Cancelar Navegação',
    pausarBtn: 'Pausar',
    back: 'Voltar',
    navigate_manually: 'Navegar Manualmente',
    carouselModalClose: 'Fechar',
    carouselTitle: 'Galeria de Imagens',
    nextSlide: 'Próximo Slide',
    prevSlide: 'Slide Anterior',
    routeSummaryTitle: 'Resumo da Rota',
    routeDistance: 'Distância:',
    routeETA: 'Tempo Estimado:',
    instructionsTitle: 'Instruções de Navegação',
    stepExample1: 'Siga em frente por 200 metros.',
    stepExample2: 'Vire à esquerda em 50 metros.',
    toggle_instructions: 'Minimizar Instruções',
    progressLabel: 'Progresso:',
    languageChanged: 'Idioma alterado para: {lang}',
    tutorialStart: 'Iniciar',
    tutorialEnd: 'Encerrar Tutorial',
    tutorialYes: 'Sim',
    tutorialNo: 'Não',
    tutorialSend: 'Enviar',
    showItinerary: 'Ver Roteiro',
    generateNewItinerary: 'Gerar outro Roteiro',
    changePreferences: 'Alterar Preferências',
    welcome: 'Bem-vindo ao nosso site!',
    youAreHere: 'Você está aqui!',
    pousadasMessage: 'Encontre as melhores pousadas para sua estadia.',
    touristSpotsMessage: 'Descubra os pontos turísticos mais populares.',
    beachesMessage: 'Explore as praias mais belas de Morro de São Paulo.',
    toursMessage: 'Veja passeios disponíveis e opções de reserva.',
    restaurantsMessage: 'Descubra os melhores restaurantes da região.',
    partiesMessage: 'Saiba sobre festas e eventos disponíveis.',
    shopsMessage: 'Encontre lojas locais para suas compras.',
    emergenciesMessage: 'Informações úteis para situações de emergência.',
    createItinerary: 'Criar Roteiro',
    aboutMore: 'Fotos',
    createRoute: 'Como Chegar',
    reserveTable: 'Reservar Mesa',
    accessWebsite: 'Site',
    reserveRoom: 'Reservar Quarto',
    reserveChairs: 'Reservar Cadeiras',
    buyTicket: 'Comprar Ingresso',
    reserveTour: 'Reservar Passeio',
    viewItinerary: 'Ver Roteiro',
    navigationStarted_pt: 'Navegação iniciada.',
    turnLeft: 'Vire à esquerda',
    turnRight: 'Vire à direita',
    continueStraight: 'Continue em frente',
    assistant_title: 'Assistente Virtual',
    assistant_text: 'Como posso ajudar você hoje?',
    send_audio: 'Enviar Áudio',
    how_to_get_there: 'Como Chegar',
    pause: 'Pausar',
    partner_checkin: 'Você chegou a um parceiro! Aproveite suas recompensas!',
    marketing_popup: 'Reserve agora e ganhe desconto!',
    mapInitialized: 'Mapa inicializado com sucesso.',
    loaderFail: 'Erro ao carregar recursos.',
    routePlotted: 'Rota plotada com sucesso.',
    noInstructionsAvailable: 'Nenhuma instrução disponível.',
    calculatingRoute: 'Calculando rota...',
    routeNotFound: 'Nenhuma rota foi encontrada!',
    locationUnavailable: 'Localização não disponível.',
    fetchingInstructionsError: 'Erro ao buscar instruções de navegação.',
    access_menu: 'Acessar Menu',
    startNavigation: 'Iniciar Navegação',
    minutes: 'minutos',

    // ================================
    // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
    // ================================
    // Chaves de instruções OSM
    continue_straight: 'Siga em frente',
    continue_straight_on: 'Siga em frente na',
    turn_left: 'Vire à esquerda',
    turn_left_on: 'Vire à esquerda na',
    turn_right: 'Vire à direita',
    turn_right_on: 'Vire à direita na',
    head_north: 'Siga para o norte',
    head_north_on: 'Siga para o norte na',
    head_south: 'Siga para o sul',
    head_south_on: 'Siga para o sul na',
    head_east: 'Siga para o leste',
    head_east_on: 'Siga para o leste na',
    head_west: 'Siga para o oeste',
    head_west_on: 'Siga para o oeste na',
    head_northeast: 'Siga para o nordeste',
    head_northeast_on: 'Siga para o nordeste na',
    head_southeast: 'Siga para o sudeste',
    head_southeast_on: 'Siga para o sudeste na',
    head_southwest: 'Siga para o sudoeste',
    head_southwest_on: 'Siga para o sudoeste na',
    head_northwest: 'Siga para o noroeste',
    head_northwest_on: 'Siga para o noroeste na',
    arrive_destination: 'Você chegou ao destino final',
    // Outras chaves (mantidas ou adaptadas conforme necessidade)
    unknown: 'Instrução desconhecida',
  },

  en: {
    title: 'Morro de São Paulo Digital',
    chooseLanguage: 'Choose your language:',
    tourist_spots: 'Tourist Spots',
    tours: 'Tours',
    beaches: 'Beaches',
    parties: 'Parties',
    restaurants: 'Restaurants',
    inns: 'Inns',
    shops: 'Shops',
    emergencies: 'Emergencies',
    cancel_navigation: 'Stop Navigation',
    start_route: 'Start Route',
    route_summary_title: 'Route Summary',
    route_distance: 'Distance:',
    route_eta: 'Estimated Time:',
    instructions_title: 'Navigation Instructions',
    call: 'Call',
    reserveTable: 'Reserve Table',

    close_modal: 'X',
    close_modal_carousel: 'X',
    close_menu: 'Close Menu',
    offlineTitle: 'Offline Mode',
    offlineMsg: 'You are offline. Some features may not be available.',
    offRoute: 'You are off route. Recalculating...',
    routeError: 'Error',
    noInstructions: 'No instructions available.',
    destinationReached: 'Destination reached.',
    complete: 'complete',
    recalculatingRoute: 'Recalculating route...',
    createRouteError: 'Error creating route. Please try again.',
    pathDrawnSuccess: 'New route drawn successfully.',
    navigationStarted: 'Navigation started.',
    arrivedAtDestination: 'You have arrived at your destination!',
    loadingResources: 'Loading necessary resources...',
    loadingResourcesFail: 'Failed to load resources. Please try again.',
    selectDestinationFirst: 'Please select a destination first.',
    routeNotFoundAPI: 'No route found by the API (empty features).',
    failedToPlotRoute: 'Failed to plot route on the map.',
    userOffRoad: 'You left the road!',
    trackingError: 'Failed to track location. Check permissions.',
    checkingDeviation: 'Checking for possible route deviation...',
    multiRouteFail: 'Failed to plot route with multiple waypoints.',
    userIsIdle: 'You are stopped. Continue or recalculate the route?',
    partnerCheckin:
      'You arrived at {partnerName}! Enjoy your drink and +10 points!',
    routeRecalculatedOk: 'Route successfully recalculated.',
    routeDeviated: 'You are off route. Recalculating...',
    invalidDestination: 'Invalid destination. Please select another.',
    obstacleDetected: 'Obstacle detected ahead. Adjusting route.',
    routeDataError: 'Error loading route data.',
    noRoutePreview: 'No route available for preview.',
    routePreviewActivated: 'Route preview activated.',
    navEnded: 'Navigation ended.',
    navPaused: 'Navigation paused.',
    navResumed: 'Navigation resumed.',
    getRouteInstructions: 'Retrieving route instructions...',
    instructionsMissing: 'Missing instructions or not found.',
    pleaseSelectDestination:
      'Please select a destination before starting the route.',
    noCarouselImages: 'No images available for the carousel.',
    searchError: 'An error occurred during the search.',
    confirmRoute: 'Confirm your route.',
    noLocationPermission: 'Location permission denied.',
    waitingForRoute: 'Waiting for route.',
    adjustPosition: 'Adjust your position to a nearby road.',
    errorTitle: 'Error',
    errorCloseButton: 'Close',
    offlineModeButton: 'Understood',
    assistantModalClose: 'Close Assistant',
    welcomeTitle: 'WELCOME!',
    welcomeSubtitle: 'Choose your language:',
    dicasMenu: 'Tips',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    pesquisar: 'Search',
    sobreMenu: 'About',
    closeSideMenu: 'Close Menu',
    submenu_touristSpots: 'Tourist Spots',
    submenu_tours: 'Tours',
    submenu_beaches: 'Beaches',
    submenu_nightlife: 'Nightlife',
    submenu_restaurants: 'Restaurants',
    submenu_inns: 'Inns',
    submenu_shops: 'Shops',
    submenu_emergencies: 'Emergencies',
    submenu_tips: 'Tips',
    submenu_about: 'About',
    submenu_education: 'Education',
    tutorialBtn: 'Start Tutorial',
    pontosTuristicosBtn: 'Tourist Spots',
    passeiosBtn: 'Tours',
    praiasBtn: 'Beaches',
    festasBtn: 'Parties',
    restaurantesBtn: 'Restaurants',
    pousadasBtn: 'Inns',
    lojasBtn: 'Shops',
    emergenciasBtn: 'Emergencies',
    fotosBtn: 'Photos',
    comoChegarBtn: 'How to Get There',
    reservarMesaBtn: 'Reserve Table',
    ligarBtn: 'Call',
    reservarQuartoBtn: 'Reserve Room',
    reservarCadeirasBtn: 'Reserve Chairs',
    comprarIngressoBtn: 'Buy Ticket',
    reservarPasseioBtn: 'Reserve Tour',
    enviarBtn: 'Send',
    acessarSiteBtn: 'Access Site',
    iniciarNavegacaoBtn: 'Start Navigation',
    pararNavegacaoBtn: 'Stop Navigation',
    acessarMenuBtn: 'Access Menu',
    iniciarRotaBtn: 'Start Route',
    cancelarNavegacaoBtn: 'Cancel Navigation',
    pausarBtn: 'Pause',
    back: 'Back',
    navigate_manually: 'Navigate Manually',
    carouselModalClose: 'Close',
    carouselTitle: 'Image Gallery',
    nextSlide: 'Next Slide',
    prevSlide: 'Previous Slide',
    routeSummaryTitle: 'Route Summary',
    routeDistance: 'Distance:',
    routeETA: 'Estimated Time:',
    instructionsTitle: 'Navigation Instructions',
    stepExample1: 'Go straight for 200 meters.',
    stepExample2: 'Turn left in 50 meters.',
    toggle_instructions: 'Minimize Instructions',
    progressLabel: 'Progress:',
    languageChanged: 'Language changed to: {lang}',
    tutorialStart: 'Start',
    tutorialEnd: 'End Tutorial',
    tutorialYes: 'Yes',
    tutorialNo: 'No',
    tutorialSend: 'Send',
    showItinerary: 'View Itinerary',
    generateNewItinerary: 'Generate New Itinerary',
    changePreferences: 'Change Preferences',
    welcome: 'Welcome to our site!',
    youAreHere: 'You are here!',
    pousadasMessage: 'Find the best inns for your stay.',
    touristSpotsMessage: 'Discover the most popular tourist spots.',
    beachesMessage: 'Explore the most beautiful beaches of Morro de São Paulo.',
    toursMessage: 'Check available tours and booking options.',
    restaurantsMessage: 'Discover the best restaurants in the region.',
    partiesMessage: 'Learn about available parties and events.',
    shopsMessage: 'Find local stores for your shopping.',
    emergenciesMessage: 'Useful information for emergency situations.',
    createItinerary: 'Create Itinerary',
    aboutMore: 'Photos',
    createRoute: 'How to Get There',
    reserveTable: 'Reserve Table',
    accessWebsite: 'Website',
    reserveRoom: 'Reserve Room',
    reserveChairs: 'Reserve Chairs',
    buyTicket: 'Buy Ticket',
    reserveTour: 'Reserve Tour',
    viewItinerary: 'View Itinerary',
    navigationStarted_pt: 'Navigation started.',
    turnLeft: 'Turn left',
    turnRight: 'Turn right',
    continueStraight: 'Continue straight',
    assistant_title: 'Virtual Assistant',
    assistant_text: 'How can I help you today?',
    send_audio: 'Send Audio',
    how_to_get_there: 'How to Get There',
    pause: 'Pause',
    partner_checkin: 'You arrived at a partner! Enjoy your rewards!',
    marketing_popup: 'Book now and get a discount!',
    mapInitialized: 'Map initialized successfully.',
    loaderFail: 'Failed to load resources.',
    routePlotted: 'Route plotted successfully.',
    noInstructionsAvailable: 'No instructions available.',
    calculatingRoute: 'Calculating route...',
    routeNotFound: 'No route found!',
    locationUnavailable: 'Location not available.',
    fetchingInstructionsError: 'Error fetching route instructions.',
    access_menu: 'Access Menu',
    startNavigation: 'Start Navigation',
    minutes: 'minutes',

    // ================================
    // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
    // ================================
    // Chaves para instruções OSM
    continue_straight: 'Continue straight',
    continue_straight_on: 'Continue straight on',
    turn_left: 'Turn left',
    turn_left_on: 'Turn left on',
    turn_right: 'Turn right',
    turn_right_on: 'Turn right on',
    head_north: 'Head north',
    head_north_on: 'Head north on',
    head_south: 'Head south',
    head_south_on: 'Head south on',
    head_east: 'Head east',
    head_east_on: 'Head east on',
    head_west: 'Head west',
    head_west_on: 'Head west on',
    head_northeast: 'Head northeast',
    head_northeast_on: 'Head northeast on',
    head_southeast: 'Head southeast',
    head_southeast_on: 'Head southeast on',
    head_southwest: 'Head southwest',
    head_southwest_on: 'Head southwest on',
    head_northwest: 'Head northwest',
    head_northwest_on: 'Head northwest on',
    unknown: 'Unknown instruction',
  },

  es: {
    title: 'Morro de São Paulo Digital',
    chooseLanguage: 'Elige tu idioma:',
    tourist_spots: 'Lugares Turísticos',
    tours: 'Paseos',
    beaches: 'Playas',
    parties: 'Fiestas',
    restaurants: 'Restaurantes',
    inns: 'Posadas',
    shops: 'Tiendas',
    emergencies: 'Emergencias',
    cancel_navigation: 'Cancelar Navegación',
    start_route: 'Iniciar Ruta',
    route_summary_title: 'Resumen de la Ruta',
    route_distance: 'Distancia:',
    route_eta: 'Tiempo Estimado:',
    instructions_title: 'Instrucciones de Navegación',
    call: 'Llamar',
    reserveTable: 'Reservar Mesa',

    close_modal: 'X',
    close_modal_carousel: 'X',
    close_menu: 'Cerrar Menú',
    offlineTitle: 'Modo Offline',
    offlineMsg: 'Estás offline. Algunas funciones pueden no estar disponibles.',
    offRoute: 'Has salido de la ruta. Recalculando...',
    routeError: 'Error al crear la ruta.',
    noInstructions: 'Ninguna instrucción disponible.',
    destinationReached: 'Destino alcanzado.',
    complete: 'completo',
    recalculatingRoute: 'Recalculando ruta...',
    createRouteError: 'Error al crear la ruta. Por favor, intenta de nuevo.',
    pathDrawnSuccess: 'Nueva ruta dibujada con éxito.',
    navigationStarted: 'Navegación iniciada.',
    arrivedAtDestination: '¡Has llegado a tu destino!',
    loadingResources: 'Cargando recursos necesarios...',
    loadingResourcesFail: 'Error al cargar recursos. Intenta nuevamente.',
    selectDestinationFirst: 'Por favor, selecciona un destino primero.',
    routeNotFoundAPI: 'La API no ha encontrado ninguna ruta (features vacías).',
    failedToPlotRoute: 'No se pudo trazar la ruta en el mapa.',
    userOffRoad: '¡Te has salido de la carretera!',
    trackingError: 'Fallo en el rastreo de ubicación. Verifica permisos.',
    checkingDeviation: 'Verificando posible desvío de ruta...',
    multiRouteFail: 'No se pudo trazar ruta con varios destinos.',
    userIsIdle: 'Estás detenido. ¿Continuar o recalcular la ruta?',
    partnerCheckin:
      '¡Has llegado a {partnerName}! ¡Disfruta de tu bebida y 10 puntos!',
    routeRecalculatedOk: 'Ruta recalculada con éxito.',
    routeDeviated: 'Te has desviado de la ruta. Recalculando...',
    invalidDestination: 'Destino inválido. Por favor, selecciona otro.',
    obstacleDetected: 'Se detectó un obstáculo por delante. Ajustando la ruta.',
    routeDataError: 'Error al cargar datos de la ruta.',
    noRoutePreview: 'No hay ninguna ruta disponible para previsualizar.',
    routePreviewActivated: 'Previsualización de la ruta activada.',
    navEnded: 'Navegación finalizada.',
    navPaused: 'Navegación pausada.',
    navResumed: 'Navegación reanudada.',
    getRouteInstructions: 'Obteniendo instrucciones de la ruta...',
    instructionsMissing: 'Faltan instrucciones o no se han encontrado.',
    pleaseSelectDestination:
      'Por favor, selecciona un destino antes de iniciar la ruta.',
    noCarouselImages: 'No hay imágenes disponibles para el carrusel.',
    searchError: 'Ocurrió un error durante la búsqueda.',
    confirmRoute: 'Confirma tu ruta.',
    noLocationPermission: 'Permiso de ubicación denegado.',
    waitingForRoute: 'Esperando la ruta.',
    adjustPosition: 'Ajusta tu posición a una carretera cercana.',
    errorTitle: 'Error',
    errorCloseButton: 'Cerrar',
    offlineModeButton: 'Entendido',
    assistantModalClose: 'Cerrar Asistente',
    welcomeTitle: '¡BIENVENIDO!',
    welcomeSubtitle: 'Elige tu idioma:',
    dicasMenu: 'Consejos',
    zoomIn: 'Acercar Zoom',
    zoomOut: 'Alejar Zoom',
    pesquisar: 'Buscar',
    sobreMenu: 'Acerca de',
    closeSideMenu: 'Cerrar Menú',
    submenu_touristSpots: 'Lugares Turísticos',
    submenu_tours: 'Paseos',
    submenu_beaches: 'Playas',
    submenu_nightlife: 'Vida Nocturna',
    submenu_restaurants: 'Restaurantes',
    submenu_inns: 'Posadas',
    submenu_shops: 'Tiendas',
    submenu_emergencies: 'Emergencias',
    submenu_tips: 'Consejos',
    submenu_about: 'Acerca de',
    submenu_education: 'Educación',
    tutorialBtn: 'Iniciar Tutorial',
    pontosTuristicosBtn: 'Lugares Turísticos',
    passeiosBtn: 'Paseos',
    praiasBtn: 'Playas',
    fiestasBtn: 'Fiestas',
    restaurantesBtn: 'Restaurantes',
    pousadasBtn: 'Posadas',
    lojasBtn: 'Tiendas',
    emergenciasBtn: 'Emergencias',
    fotosBtn: 'Fotos',
    comoChegarBtn: 'Cómo Llegar',
    reservarMesaBtn: 'Reservar Mesa',
    ligarBtn: 'Llamar',
    reservarQuartoBtn: 'Reservar Habitación',
    reservarCadeirasBtn: 'Reservar Sillas',
    comprarIngressoBtn: 'Comprar Entrada',
    reservarPasseioBtn: 'Reservar Paseo',
    enviarBtn: 'Enviar',
    acessarSiteBtn: 'Acceder al Sitio',
    iniciarNavegacaoBtn: 'Iniciar Navegación',
    pararNavegacaoBtn: 'Parar Navegación',
    acessarMenuBtn: 'Acceder al Menú',
    iniciarRotaBtn: 'Iniciar Ruta',
    cancelarNavegacaoBtn: 'Cancelar Navegación',
    pausarBtn: 'Pausar',
    back: 'Volver',
    navigate_manually: 'Navegar Manualmente',
    carouselModalClose: 'Cerrar',
    carouselTitle: 'Galería de Imágenes',
    nextSlide: 'Siguiente Diapositiva',
    prevSlide: 'Diapositiva Anterior',
    routeSummaryTitle: 'Resumen de la Ruta',
    routeDistance: 'Distancia:',
    routeETA: 'Tiempo Estimado:',
    instructionsTitle: 'Instrucciones de Navegación',
    stepExample1: 'Continúa recto por 200 metros.',
    stepExample2: 'Gira a la izquierda en 50 metros.',
    toggle_instructions: 'Minimizar Instrucciones',
    progressLabel: 'Progreso:',
    languageChanged: 'Idioma cambiado a: {lang}',
    tutorialStart: 'Iniciar',
    tutorialEnd: 'Finalizar Tutorial',
    tutorialYes: 'Sí',
    tutorialNo: 'No',
    tutorialSend: 'Enviar',
    showItinerary: 'Ver Itinerario',
    generateNewItinerary: 'Generar otro Itinerario',
    changePreferences: 'Cambiar Preferencias',
    welcome: '¡Bienvenido a nuestro sitio!',
    youAreHere: '¡Estás aquí!',
    pousadasMessage: 'Encuentra las mejores posadas para tu estancia.',
    touristSpotsMessage: 'Descubre los lugares turísticos más populares.',
    beachesMessage: 'Explora las playas más hermosas de Morro de São Paulo.',
    toursMessage: 'Ve paseos disponibles y opciones de reserva.',
    restaurantsMessage: 'Descubre los mejores restaurantes de la región.',
    partiesMessage: 'Entérate de las fiestas y eventos disponibles.',
    shopsMessage: 'Encuentra tiendas locales para tus compras.',
    emergenciesMessage: 'Información útil para situaciones de emergencia.',
    createItinerary: 'Crear Itinerario',
    aboutMore: 'Fotos',
    createRoute: 'Cómo Llegar',
    reserveTable: 'Reservar Mesa',
    accessWebsite: 'Sitio Web',
    reserveRoom: 'Reservar Habitación',
    reserveChairs: 'Reservar Sillas',
    buyTicket: 'Comprar Entrada',
    reserveTour: 'Reservar Paseo',
    viewItinerary: 'Ver Itinerario',
    navigationStarted_pt: 'Navegación iniciada.',
    turnLeft: 'Gira a la izquierda',
    turnRight: 'Gira a la derecha',
    continueStraight: 'Continúa recto',
    assistant_title: 'Asistente Virtual',
    assistant_text: '¿En qué puedo ayudarte hoy?',
    send_audio: 'Enviar Audio',
    how_to_get_there: 'Cómo Llegar',
    pause: 'Pausar',
    partner_checkin: '¡Has llegado a un socio! ¡Disfruta tus recompensas!',
    marketing_popup: '¡Reserva ahora y obtén un descuento!',
    mapInitialized: 'Mapa inicializado con éxito.',
    loaderFail: 'Error al cargar recursos.',
    routePlotted: 'Ruta trazada con éxito.',
    noInstructionsAvailable: 'Ninguna instrucción disponible.',
    calculatingRoute: 'Calculando ruta...',
    routeNotFound: '¡No se encontró ninguna ruta!',
    locationUnavailable: 'Ubicación no disponible.',
    fetchingInstructionsError: 'Error al buscar instrucciones de navegación.',
    access_menu: 'Acceder al Menú',
    startNavigation: 'Iniciar Navegación',
    minutes: 'minutos',

    // ================================
    // NOVAS CHAVES PARA SUPORTE A INSTRUCCIONES OSM
    // ================================
    // Chaves para instruções OSM
    es: {
      continue_straight: 'Continúa recto',
      continue_straight_on: 'Continúa recto en',
      turn_left: 'Gira a la izquierda',
      turn_left_on: 'Gira a la izquierda en',
      turn_right: 'Gira a la derecha',
      turn_right_on: 'Gira a la derecha en',
      head_north: 'Dirígete hacia el norte',
      head_north_on: 'Dirígete hacia el norte en',
      head_south: 'Dirígete hacia el sur',
      head_south_on: 'Dirígete hacia el sur en',
      head_east: 'Dirígete hacia el este',
      head_east_on: 'Dirígete hacia el este en',
      head_west: 'Dirígete hacia el oeste',
      head_west_on: 'Dirígete hacia el oeste en',
      head_northeast: 'Dirígete hacia el noreste',
      head_northeast_on: 'Dirígete hacia el noreste en',
      head_southeast: 'Dirígete hacia el sureste',
      head_southeast_on: 'Dirígete hacia el sureste en',
      head_southwest: 'Dirígete hacia el suroeste',
      head_southwest_on: 'Dirígete hacia el suroeste en',
      head_northwest: 'Dirígete hacia el noroeste',
      head_northwest_on: 'Dirígete hacia el noroeste en',
      unknown: 'Instrucción desconocida',
    },

    he: {
      title: 'מורו דה סאו פאולו דיגיטלי',
      chooseLanguage: 'בחר את השפה שלך:',
      tourist_spots: 'אתרי תיירות',
      tours: 'סיורים',
      beaches: 'חופים',
      parties: 'מסיבות',
      restaurants: 'מסעדות',
      inns: 'אכסניות',
      shops: 'חנויות',
      emergencies: 'חירום',
      cancel_navigation: 'בטל ניווט',
      start_route: 'התחל מסלול',
      route_summary_title: 'סיכום המסלול',
      route_distance: 'מרחק:',
      route_eta: 'זמן משוער:',
      instructions_title: 'הוראות ניווט',
      call: 'התקשר',
      reserveTable: 'הזמן שולחן',

      close_modal: 'X',
      close_modal_carousel: 'X',
      close_menu: 'סגור תפריט',
      offlineTitle: 'מצב לא מקוון',
      offlineMsg: 'אתה במצב לא מקוון. חלק מהפונקציות עשויות להיות לא זמינות.',
      offRoute: 'יצאת מהמסלול. מחשב מחדש...',
      routeError: 'שגיאה ביצירת המסלול.',
      noInstructions: 'אין הוראות זמינות.',
      destinationReached: 'הגעת ליעד.',
      complete: 'הושלם',
      recalculatingRoute: 'מחשב מסלול מחדש...',
      createRouteError: 'שגיאה ביצירת המסלול. אנא נסה שוב.',
      pathDrawnSuccess: 'מסלול חדש הוצג בהצלחה.',
      navigationStarted: 'ניווט התחיל.',
      arrivedAtDestination: 'הגעת ליעד שלך!',
      loadingResources: 'טוען משאבים נחוצים...',
      loadingResourcesFail: 'נכשל בטעינת משאבים. אנא נסה שוב.',
      selectDestinationFirst: 'אנא בחר יעד קודם.',
      routeNotFoundAPI: 'לא נמצאה מסלול על ידי ה-API (אין נתונים).',
      failedToPlotRoute: 'נכשל בניסיון לצייר את המסלול במפה.',
      userOffRoad: 'יצאת מהכביש!',
      trackingError: 'נכשל במעקב המיקום. בדוק הרשאות.',
      checkingDeviation: 'בודק אפשרות לסטייה מהמסלול...',
      multiRouteFail: 'נכשל לייצר מסלול מרובה עצירות.',
      userIsIdle: 'אתה עומד במקום. האם להמשיך או לחשב מחדש את המסלול?',
      partnerCheckin: 'הגעת ל-{partnerName}! קבל משקה ועוד 10 נקודות!',
      routeRecalculatedOk: 'המסלול חושב מחדש בהצלחה.',
      routeDeviated: 'סטית מהמסלול. מחשב מחדש...',
      invalidDestination: 'יעד לא תקין. אנא בחר אחר.',
      obstacleDetected: 'זוהה מכשול מלפנים. מתאים את המסלול.',
      routeDataError: 'שגיאה בטעינת נתוני המסלול.',
      noRoutePreview: 'אין מסלול זמין לתצוגה מקדימה.',
      routePreviewActivated: 'תצוגה מקדימה הופעלה.',
      navEnded: 'ניווט הסתיים.',
      navPaused: 'ניווט הופסק.',
      navResumed: 'ניווט חודש.',
      getRouteInstructions: 'מקבל הוראות ניווט...',
      instructionsMissing: 'הוראות חסרות או לא נמצאו.',
      pleaseSelectDestination: 'אנא בחר יעד לפני תחילת הניווט.',
      noCarouselImages: 'אין תמונות זמינות לצפייה.',
      searchError: 'אירעה שגיאה בחיפוש.',
      confirmRoute: 'אשר את המסלול שלך.',
      noLocationPermission: 'הרשאת מיקום נדחתה.',
      waitingForRoute: 'ממתין למסלול.',
      adjustPosition: 'התאם את המיקום שלך לרחוב סמוך.',
      errorTitle: 'שגיאה',
      errorCloseButton: 'סגור',
      offlineModeButton: 'הבנתי',
      assistantModalClose: 'סגור עוזר',
      welcomeTitle: 'ברוך הבא!',
      welcomeSubtitle: 'בחר את השפה שלך:',
      dicasMenu: 'טיפים',
      zoomIn: 'הגדל תצוגה',
      zoomOut: 'הקטן תצוגה',
      pesquisar: 'חיפוש',
      sobreMenu: 'אודות',
      closeSideMenu: 'סגור תפריט',
      submenu_touristSpots: 'אתרי תיירות',
      submenu_tours: 'סיורים',
      submenu_beaches: 'חופים',
      submenu_nightlife: 'חיי לילה',
      submenu_restaurants: 'מסעדות',
      submenu_inns: 'אכסניות',
      submenu_shops: 'חנויות',
      submenu_emergencies: 'חירום',
      submenu_tips: 'טיפים',
      submenu_about: 'אודות',
      submenu_education: 'חינוך',
      tutorialBtn: 'התחל הדרכה',
      pontosTuristicosBtn: 'אתרי תיירות',
      passeiosBtn: 'סיורים',
      praiasBtn: 'חופים',
      festasBtn: 'מסיבות',
      restaurantesBtn: 'מסעדות',
      pousadasBtn: 'אכסניות',
      lojasBtn: 'חנויות',
      emergenciasBtn: 'חירום',
      fotosBtn: 'תמונות',
      comoChegarBtn: 'איך להגיע',
      reservarMesaBtn: 'הזמן שולחן',
      ligarBtn: 'התקשר',
      reservarQuartoBtn: 'הזמן חדר',
      reservarCadeirasBtn: 'הזמן כיסאות',
      comprarIngressoBtn: 'קנה כרטיס',
      reservarPasseioBtn: 'הזמן סיור',
      enviarBtn: 'שלח',
      acessarSiteBtn: 'כניסה לאתר',
      iniciarNavegacaoBtn: 'התחל ניווט',
      pararNavegacaoBtn: 'עצור ניווט',
      acessarMenuBtn: 'כניסה לתפריט',
      iniciarRotaBtn: 'התחל מסלול',
      cancelarNavegacaoBtn: 'בטל ניווט',
      pausarBtn: 'השהה',
      back: 'חזור',
      navigate_manually: 'ניווט ידני',
      carouselModalClose: 'סגור',
      carouselTitle: 'גלריית תמונות',
      nextSlide: 'שקופית הבאה',
      prevSlide: 'שקופית קודמת',
      routeSummaryTitle: 'סיכום המסלול',
      routeDistance: 'מרחק:',
      routeETA: 'זמן משוער:',
      instructionsTitle: 'הוראות ניווט',
      stepExample1: 'המשך ישר ל-200 מטרים.',
      stepExample2: 'פנה שמאלה בעוד 50 מטרים.',
      toggle_instructions: 'הקטן הוראות',
      progressLabel: 'התקדמות:',
      languageChanged: 'השפה הוחלפה ל: {lang}',
      tutorialStart: 'ההתחלה',
      tutorialEnd: 'סיים הדרכה',
      tutorialYes: 'כן',
      tutorialNo: 'לא',
      tutorialSend: 'שלח',
      showItinerary: 'הצג מסלול',
      generateNewItinerary: 'צור מסלול חדש',
      changePreferences: 'שנה העדפות',
      welcome: 'ברוך הבא לאתר שלנו!',
      youAreHere: 'אתה כאן!',
      pousadasMessage: 'מצא את האכסניות הטובות ביותר לשהותך.',
      touristSpotsMessage: 'גלה את האתרים התיירותיים הפופולריים ביותר.',
      beachesMessage: 'גלה את החופים היפים ביותר במורו דה סאו פאולו.',
      toursMessage: 'בדוק סיורים זמינים ואפשרויות הזמנה.',
      restaurantsMessage: 'גלה את המסעדות הטובות ביותר באזור.',
      partiesMessage: 'בדוק מסיבות ואירועים זמינים.',
      shopsMessage: 'מצא חנויות מקומיות לקניות.',
      emergenciesMessage: 'מידע מועיל למקרי חירום.',
      createItinerary: 'צור מסלול',
      aboutMore: 'תמונות',
      createRoute: 'איך להגיע',
      reserveTable: 'הזמן שולחן',
      accessWebsite: 'אתר',
      reserveRoom: 'הזמן חדר',
      reserveChairs: 'הזמן כיסאות',
      buyTicket: 'קנה כרטיס',
      reserveTour: 'הזמן סיור',
      viewItinerary: 'הצג מסלול',
      navigationStarted_pt: 'ניווט התחיל.',
      turnLeft: 'פנה שמאלה',
      turnRight: 'פנה ימינה',
      continueStraight: 'המשך ישר',
      assistant_title: 'עוזר וירטואלי',
      assistant_text: 'איך אני יכול לעזור לך היום?',
      send_audio: 'שלח אודיו',
      how_to_get_there: 'איך להגיע',
      pause: 'השהה',
      partner_checkin: 'הגעת לשותף! תהנה מהמתנות שלך!',
      marketing_popup: 'הזמן עכשיו וקבל הנחה!',
      mapInitialized: 'המפה הופעלה בהצלחה.',
      loaderFail: 'שגיאה בטעינת המשאבים.',
      routePlotted: 'המסלול שורטט בהצלחה.',
      noInstructionsAvailable: 'אין הוראות זמינות.',
      calculatingRoute: 'מחשב מסלול...',
      routeNotFound: 'לא נמצאה מסלול!',
      locationUnavailable: 'המיקום אינו זמין.',
      fetchingInstructionsError: 'שגיאה בקבלת הוראות ניווט.',
      access_menu: 'כניסה לתפריט',
      startNavigation: 'התחל ניווט',
      minutes: 'דקות',

      // ================================
      // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
      // ================================
      // Chaves para instruções OSM
      continue_straight: 'המשך ישר',
      continue_straight_on: 'המשך ישר על',
      turn_left: 'פנה שמאלה',
      turn_left_on: 'פנה שמאלה על',
      turn_right: 'פנה ימינה',
      turn_right_on: 'פנה ימינה על',
      head_north: 'התחל צפונה',
      head_north_on: 'התחל צפונה על',
      head_south: 'התחל דרומה',
      head_south_on: 'התחל דרומה על',
      head_east: 'התחל מזרחה',
      head_east_on: 'התחל מזרחה על',
      head_west: 'התחל מערבה',
      head_west_on: 'התחל מערבה על',
      head_northeast: 'התחל צפון-מזרח',
      head_northeast_on: 'התחל צפון-מזרח על',
      head_southeast: 'התחל דרום-מזרח',
      head_southeast_on: 'התחל דרום-מזרח על',
      head_southwest: 'התחל דרום-מערב',
      head_southwest_on: 'התחל דרום-מערב על',
      head_northwest: 'התחל צפון-מערב',
      head_northwest_on: 'התחל צפון-מערב על',
      unknown: 'הוראה לא ידועה',
    },
  },
};
