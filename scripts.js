// ======================
// scripts.js COMPLETO - Revisado e com todas as melhorias aplicadas
// ======================

//NOVAS FUNÇÔES IMPLEMENTADAS PARA TESTE--------------------------------------------------
function getDetailedInstructionText(step, lang = 'pt') {
  if (!step) return "Sem instrução";

  const baseText = step.text || getGeneralText("continueStraight", lang);
  const wayName = step.streetName || step.wayName || "";
  const dist = step.distance ? `${step.distance}m` : "";

  // Combine o texto base com preposições/traduções
  // Supondo que você tenha `getGeneralText("on", lang)` => "na" / "on" / "en"
  let detailedText = baseText;

  if (wayName) {
    detailedText += ` ${getGeneralText("on", lang) || "na"} ${wayName}`;
  }
  if (dist) {
    detailedText += ` (${dist})`;
  }

  return detailedText;
}

/**
 * Atualiza o estado global de navegação de forma centralizada.
 * @function updateNavigationState
 * @param {Object} newState - Objeto contendo as chaves que deseja atualizar em navigationState.
 * @returns {void}
 *
 * APLICA MELHORIAS:
 * - Centraliza manipulação de estado (3.1)
 * - Logs padronizados (6.1)
 * - Documentação clara (1.2)
 */
function updateNavigationState(newState) {
  if (typeof newState !== 'object' || newState === null) {
    console.error("[updateNavigationState] Estado inválido fornecido:", newState);
    return;
  }

  Object.assign(navigationState, newState);
  console.log("[updateNavigationState] Estado atualizado:", newState);
}

/************************************************************************************
 * 1) mapORSInstruction: Função auxiliar que mapeia a string bruta da ORS
 *    para as chaves do seu dicionário OSM (head_north, turn_left, etc.)
 ************************************************************************************/
function mapORSInstruction(rawInstruction) {
  if (!rawInstruction) {
    console.warn("[mapORSInstruction] Instrução inválida ou vazia. Retornando 'unknown'.");
    return "unknown";
  }

  const text = rawInstruction.toLowerCase();

  // Podemos agrupar e organizar melhor para manter o código limpo:
  if (text.includes("head north"))       return "head_north";
  if (text.includes("head south"))       return "head_south";
  if (text.includes("head east"))        return "head_east";
  if (text.includes("head west"))        return "head_west";

  if (text.includes("turn left"))        return "turn_left";
  if (text.includes("turn right"))       return "turn_right";

  if (text.includes("sharp left"))       return "turn_sharp_left";
  if (text.includes("sharp right"))      return "turn_sharp_right";
  if (text.includes("slight left"))      return "turn_slight_left";
  if (text.includes("slight right"))     return "turn_slight_right";

  if (text.includes("continue straight"))return "continue_straight";
  if (text.includes("keep left"))        return "keep_left";
  if (text.includes("keep right"))       return "keep_right";
  if (text.includes("u-turn"))           return "u_turn";

  // Tratamento especial para rotatórias
  if (text.includes("roundabout")) {
    if (text.includes("enter")) return "enter_roundabout";
    if (text.includes("exit"))  return "exit_roundabout";
    // Obs: Se existirem outros termos como "at the roundabout", expanda aqui.
  }

  if (text.includes("ferry"))            return "ferry";
  if (text.includes("end of the road"))  return "end_of_road";
  if (text.includes("arrive"))           return "arrive_destination";

  // Caso não tenha encontrado nada:
  console.warn(`[mapORSInstruction] Instrução não reconhecida: "${rawInstruction}". Retornando 'unknown'.`);
  return "unknown";
}




function getGeneralText(key, lang = 'pt') {
  const translationsData = {
    pt: {
      // NOVAS CHAVES ADICIONADAS OU AJUSTADAS
      title: "Morro de São Paulo Digital",              // <title data-i18n="title">
      chooseLanguage: "Escolha seu idioma:",            // data-i18n="chooseLanguage"
      tourist_spots: "Pontos Turísticos",               // data-i18n="tourist_spots" (botão)
      tours: "Passeios",                                // data-i18n="tours"
      beaches: "Praias",                                // data-i18n="beaches"
      parties: "Festas",                                // data-i18n="parties"
      restaurants: "Restaurantes",                      // data-i18n="restaurants"
      inns: "Pousadas",                                 // data-i18n="inns"
      shops: "Lojas",                                   // data-i18n="shops"
      emergencies: "Emergências",                       // data-i18n="emergencies"
      cancel_navigation: "Cancelar Navegação",          // data-i18n="cancel_navigation"
      start_route: "Iniciar Rota",                      // data-i18n="start_route"
      route_summary_title: "Resumo da Rota",            // data-i18n="route_summary_title"
      route_distance: "Distância:",                     // data-i18n="route_distance"
      route_eta: "Tempo Estimado:",                     // data-i18n="route_eta"
      instructions_title: "Instruções de Navegação",    // data-i18n="instructions_title"

      // Chaves já existentes (mantidas e/ou conferidas com o checklist)
      close_modal: "X",
      close_modal_carousel:"X",
      close_menu: "Fechar Menu",
      offlineTitle: "Modo Offline",
      offlineMsg: "Você está offline. Algumas funcionalidades podem não estar disponíveis.",
      offRoute: "Você saiu da rota. Recalculando...",
      routeError: "Erro",
      noInstructions: "Nenhuma instrução disponível.",
      destinationReached: "Destino alcançado.",
      complete: "completo",
      recalculatingRoute: "Recalculando rota...",
      createRouteError: "Erro ao criar rota. Por favor, tente novamente.",
      pathDrawnSuccess: "Nova rota desenhada com sucesso.",
      navigationStarted: "Navegação iniciada.",
      arrivedAtDestination: "Você chegou ao seu destino!",
      loadingResources: "Carregando recursos necessários...",
      loadingResourcesFail: "Falha ao carregar recursos. Tente novamente.",
      selectDestinationFirst: "Por favor, selecione um destino primeiro.",
      routeNotFoundAPI: "Nenhuma rota encontrada pela API (features vazias).",
      failedToPlotRoute: "Falha ao plotar rota no mapa.",
      userOffRoad: "Você saiu da estrada!",
      trackingError: "Falha no rastreamento de localização. Verifique permissões.",
      checkingDeviation: "Verificando possível desvio de rota...",
      multiRouteFail: "Falha ao plotar rota com múltiplos destinos.",
      userIsIdle: "Você está parado. Deseja continuar ou recalcular a rota?",
      partnerCheckin: "Você chegou em {partnerName}! Ganhou um Drink e 10 pontos!",
      routeRecalculatedOk: "Rota recalculada com sucesso.",
      routeDeviated: "Você desviou da rota. Recalculando...",
      invalidDestination: "Destino inválido. Por favor, selecione outro.",
      obstacleDetected: "Obstáculo detectado à frente. Ajustando rota.",
      routeDataError: "Erro ao carregar dados da rota.",
      noRoutePreview: "Nenhuma rota disponível para pré-visualização.",
      routePreviewActivated: "Pré-visualização da rota ativada.",
      navEnded: "Navegação encerrada.",
      navPaused: "Navegação pausada.",
      navResumed: "Navegação retomada.",
      getRouteInstructions: "Iniciando obtenção de instruções de rota...",
      instructionsMissing: "Instruções ausentes ou não encontradas.",
      pleaseSelectDestination: "Por favor, selecione um destino antes de iniciar a rota.",
      noCarouselImages: "Nenhuma imagem disponível para o carrossel.",
      searchError: "Ocorreu um erro na busca.",
      confirmRoute: "Confirme sua rota.",
      noLocationPermission: "Permissão de localização negada.",
      waitingForRoute: "Aguardando rota.",
      adjustPosition: "Ajuste sua posição para uma rua próxima.",
      errorTitle: "Erro",
      errorCloseButton: "Fechar",
      offlineModeButton: "Entendido",
      assistantModalClose: "Fechar Assistente",
      welcomeTitle: "BEM-VINDO!",
      welcomeSubtitle: "Escolha seu idioma:",
      dicasMenu: "Dicas",
      zoomIn: "Aumentar Zoom",
      zoomOut: "Diminuir Zoom",
      pesquisar: "Pesquisar",
      sobreMenu: "Sobre",
      closeSideMenu: "Fechar Menu",
      submenu_touristSpots: "Pontos Turísticos",
      submenu_tours: "Passeios",
      submenu_beaches: "Praias",
      submenu_nightlife: "Vida Noturna",
      submenu_restaurants: "Restaurantes",
      submenu_inns: "Pousadas",
      submenu_shops: "Lojas",
      submenu_emergencies: "Emergências",
      submenu_tips: "Dicas",
      submenu_about: "Sobre",
      submenu_education: "Educação",
      tutorialBtn: "Iniciar Tutorial",
      pontosTuristicosBtn: "Pontos Turísticos",
      passeiosBtn: "Passeios",
      praiasBtn: "Praias",
      festasBtn: "Festas",
      restaurantesBtn: "Restaurantes",
      pousadasBtn: "Pousadas",
      lojasBtn: "Lojas",
      emergenciasBtn: "Emergências",
      fotosBtn: "Fotos",
      comoChegarBtn: "Como Chegar",
      reservarMesaBtn: "Reservar Mesa",
      ligarBtn: "Ligar",
      reservarQuartoBtn: "Reservar Quarto",
      reservarCadeirasBtn: "Reservar Cadeiras",
      comprarIngressoBtn: "Comprar Ingresso",
      reservarPasseioBtn: "Reservar Passeio",
      enviarBtn: "Enviar",
      acessarSiteBtn: "Acessar Site",
      iniciarNavegacaoBtn: "Iniciar Navegação",
      pararNavegacaoBtn: "Parar Navegação",
      acessarMenuBtn: "Acessar Menu",
      iniciarRotaBtn: "Iniciar Rota",
      cancelarNavegacaoBtn: "Cancelar Navegação",
      pausarBtn: "Pausar",
      back: "Voltar",
      navigate_manually: "Navegar Manualmente",
      carouselModalClose: "Fechar",
      carouselTitle: "Galeria de Imagens",
      nextSlide: "Próximo Slide",
      prevSlide: "Slide Anterior",
      routeSummaryTitle: "Resumo da Rota",
      routeDistance: "Distância:",
      routeETA: "Tempo Estimado:",
      instructionsTitle: "Instruções de Navegação",
      stepExample1: "Siga em frente por 200 metros.",
      stepExample2: "Vire à esquerda em 50 metros.",
      toggle_instructions: "Minimizar Instruções",
      progressLabel: "Progresso:",
      languageChanged: "Idioma alterado para: {lang}",
      tutorialStart: "Iniciar",
      tutorialEnd: "Encerrar Tutorial",
      tutorialYes: "Sim",
      tutorialNo: "Não",
      tutorialSend: "Enviar",
      showItinerary: "Ver Roteiro",
      generateNewItinerary: "Gerar outro Roteiro",
      changePreferences: "Alterar Preferências",
      welcome: "Bem-vindo ao nosso site!",
      youAreHere: "Você está aqui!",
      pousadasMessage: "Encontre as melhores pousadas para sua estadia.",
      touristSpotsMessage: "Descubra os pontos turísticos mais populares.",
      beachesMessage: "Explore as praias mais belas de Morro de São Paulo.",
      toursMessage: "Veja passeios disponíveis e opções de reserva.",
      restaurantsMessage: "Descubra os melhores restaurantes da região.",
      partiesMessage: "Saiba sobre festas e eventos disponíveis.",
      shopsMessage: "Encontre lojas locais para suas compras.",
      emergenciesMessage: "Informações úteis para situações de emergência.",
      createItinerary: "Criar Roteiro",
      aboutMore: "Fotos",
      createRoute: "Como Chegar",
      reserveTable: "Reservar Mesa",
      accessWebsite: "Site",
      reserveRoom: "Reservar Quarto",
      reserveChairs: "Reservar Cadeiras",
      buyTicket: "Comprar Ingresso",
      reserveTour: "Reservar Passeio",
      viewItinerary: "Ver Roteiro",
      navigationStarted_pt: "Navegação iniciada.",
      turnLeft: "Vire à esquerda",
      turnRight: "Vire à direita",
      continueStraight: "Continue em frente",
      assistant_title: "Assistente Virtual",
      assistant_text: "Como posso ajudar você hoje?",
      send_audio: "Enviar Áudio",
      how_to_get_there: "Como Chegar",
      pause: "Pausar",
      partner_checkin: "Você chegou a um parceiro! Aproveite suas recompensas!",
      marketing_popup: "Reserve agora e ganhe desconto!",
      mapInitialized: "Mapa inicializado com sucesso.",
      loaderFail: "Erro ao carregar recursos.",
      routePlotted: "Rota plotada com sucesso.",
      noInstructionsAvailable: "Nenhuma instrução disponível.",
      calculatingRoute: "Calculando rota...",
      routeNotFound: "Nenhuma rota foi encontrada!",
      locationUnavailable: "Localização não disponível.",
      fetchingInstructionsError: "Erro ao buscar instruções de navegação.",
      access_menu: "Acessar Menu",
      startNavigation: "Iniciar Navegação",
      minutes: "minutos",

      // ================================
      // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
      // ================================
      head_north: "Siga para o norte",
      head_south: "Siga para o sul",
      head_east: "Siga para o leste",
      head_west: "Siga para o oeste",
      turn_sharp_left: "Vire acentuadamente à esquerda",
      turn_sharp_right: "Vire acentuadamente à direita",
      turn_slight_left: "Vire levemente à esquerda",
      turn_slight_right: "Vire levemente à direita",
      turn_left: "Vire à esquerda",
      turn_right: "Vire à direita",
      continue_straight: "Continue em frente",
      keep_left: "Mantenha-se à esquerda",
      keep_right: "Mantenha-se à direita",
      u_turn: "Faça um retorno",
      enter_roundabout: "Entre na rotatória",
      exit_roundabout: "Saia da rotatória",
      ferry: "Atravesse via balsa",
      end_of_road: "Vá até o fim da via",
      arrive_destination: "Você chegou ao destino final"
    },

    en: {
      // NEW KEYS ADDED OR ADJUSTED
      title: "Morro de São Paulo Digital",
      chooseLanguage: "Choose your language:",
      tourist_spots: "Tourist Spots",
      tours: "Tours",
      beaches: "Beaches",
      parties: "Parties",
      restaurants: "Restaurants",
      inns: "Inns",
      shops: "Shops",
      emergencies: "Emergencies",
      cancel_navigation: "Stop Navigation",
      start_route: "Start Route",
      route_summary_title: "Route Summary",
      route_distance: "Distance:",
      route_eta: "Estimated Time:",
      instructions_title: "Navigation Instructions",

      // Existing keys (verified/renamed to match HTML)
      close_modal: "X",
      close_modal_carousel:"X",
      close_menu: "Close Menu",
      offlineTitle: "Offline Mode",
      offlineMsg: "You are offline. Some features may not be available.",
      offRoute: "You are off route. Recalculating...",
      routeError: "Error",
      noInstructions: "No instructions available.",
      destinationReached: "Destination reached.",
      complete: "complete",
      recalculatingRoute: "Recalculating route...",
      createRouteError: "Error creating route. Please try again.",
      pathDrawnSuccess: "New route drawn successfully.",
      navigationStarted: "Navigation started.",
      arrivedAtDestination: "You have arrived at your destination!",
      loadingResources: "Loading necessary resources...",
      loadingResourcesFail: "Failed to load resources. Please try again.",
      selectDestinationFirst: "Please select a destination first.",
      routeNotFoundAPI: "No route found by the API (empty features).",
      failedToPlotRoute: "Failed to plot route on the map.",
      userOffRoad: "You left the road!",
      trackingError: "Failed to track location. Check permissions.",
      checkingDeviation: "Checking for possible route deviation...",
      multiRouteFail: "Failed to plot route with multiple waypoints.",
      userIsIdle: "You are stopped. Continue or recalculate the route?",
      partnerCheckin: "You arrived at {partnerName}! Enjoy your drink and +10 points!",
      routeRecalculatedOk: "Route successfully recalculated.",
      routeDeviated: "You are off route. Recalculating...",
      invalidDestination: "Invalid destination. Please select another.",
      obstacleDetected: "Obstacle detected ahead. Adjusting route.",
      routeDataError: "Error loading route data.",
      noRoutePreview: "No route available for preview.",
      routePreviewActivated: "Route preview activated.",
      navEnded: "Navigation ended.",
      navPaused: "Navigation paused.",
      navResumed: "Navigation resumed.",
      getRouteInstructions: "Retrieving route instructions...",
      instructionsMissing: "Missing instructions or not found.",
      pleaseSelectDestination: "Please select a destination before starting the route.",
      noCarouselImages: "No images available for the carousel.",
      searchError: "An error occurred during the search.",
      confirmRoute: "Confirm your route.",
      noLocationPermission: "Location permission denied.",
      waitingForRoute: "Waiting for route.",
      adjustPosition: "Adjust your position to a nearby road.",
      errorTitle: "Error",
      errorCloseButton: "Close",
      offlineModeButton: "Understood",
      assistantModalClose: "Close Assistant",
      welcomeTitle: "WELCOME!",
      welcomeSubtitle: "Choose your language:",
      dicasMenu: "Tips",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      pesquisar: "Search",
      sobreMenu: "About",
      closeSideMenu: "Close Menu",
      submenu_touristSpots: "Tourist Spots",
      submenu_tours: "Tours",
      submenu_beaches: "Beaches",
      submenu_nightlife: "Nightlife",
      submenu_restaurants: "Restaurants",
      submenu_inns: "Inns",
      submenu_shops: "Shops",
      submenu_emergencies: "Emergencies",
      submenu_tips: "Tips",
      submenu_about: "About",
      submenu_education: "Education",
      tutorialBtn: "Start Tutorial",
      pontosTuristicosBtn: "Tourist Spots",
      passeiosBtn: "Tours",
      praiasBtn: "Beaches",
      festasBtn: "Parties",
      restaurantesBtn: "Restaurants",
      pousadasBtn: "Inns",
      lojasBtn: "Shops",
      emergenciasBtn: "Emergencies",
      fotosBtn: "Photos",
      comoChegarBtn: "How to Get There",
      reservarMesaBtn: "Reserve Table",
      ligarBtn: "Call",
      reservarQuartoBtn: "Reserve Room",
      reservarCadeirasBtn: "Reserve Chairs",
      comprarIngressoBtn: "Buy Ticket",
      reservarPasseioBtn: "Reserve Tour",
      enviarBtn: "Send",
      acessarSiteBtn: "Access Site",
      iniciarNavegacaoBtn: "Start Navigation",
      pararNavegacaoBtn: "Stop Navigation",
      acessarMenuBtn: "Access Menu",
      iniciarRotaBtn: "Start Route",
      cancelarNavegacaoBtn: "Cancel Navigation",
      pausarBtn: "Pause",
      back: "Back",
      navigate_manually: "Navigate Manually",
      carouselModalClose: "Close",
      carouselTitle: "Image Gallery",
      nextSlide: "Next Slide",
      prevSlide: "Previous Slide",
      routeSummaryTitle: "Route Summary",
      routeDistance: "Distance:",
      routeETA: "Estimated Time:",
      instructionsTitle: "Navigation Instructions",
      stepExample1: "Go straight for 200 meters.",
      stepExample2: "Turn left in 50 meters.",
      toggle_instructions: "Minimize Instructions",
      progressLabel: "Progress:",
      languageChanged: "Language changed to: {lang}",
      tutorialStart: "Start",
      tutorialEnd: "End Tutorial",
      tutorialYes: "Yes",
      tutorialNo: "No",
      tutorialSend: "Send",
      showItinerary: "View Itinerary",
      generateNewItinerary: "Generate New Itinerary",
      changePreferences: "Change Preferences",
      welcome: "Welcome to our site!",
      youAreHere: "You are here!",
      pousadasMessage: "Find the best inns for your stay.",
      touristSpotsMessage: "Discover the most popular tourist spots.",
      beachesMessage: "Explore the most beautiful beaches of Morro de São Paulo.",
      toursMessage: "Check available tours and booking options.",
      restaurantsMessage: "Discover the best restaurants in the region.",
      partiesMessage: "Learn about available parties and events.",
      shopsMessage: "Find local stores for your shopping.",
      emergenciesMessage: "Useful information for emergency situations.",
      createItinerary: "Create Itinerary",
      aboutMore: "Photos",
      createRoute: "How to Get There",
      reserveTable: "Reserve Table",
      accessWebsite: "Website",
      reserveRoom: "Reserve Room",
      reserveChairs: "Reserve Chairs",
      buyTicket: "Buy Ticket",
      reserveTour: "Reserve Tour",
      viewItinerary: "View Itinerary",
      navigationStarted_en: "Navigation started.",
      turnLeft: "Turn left",
      turnRight: "Turn right",
      continueStraight: "Continue straight",
      assistant_title: "Virtual Assistant",
      assistant_text: "How can I help you today?",
      send_audio: "Send Audio",
      how_to_get_there: "How to Get There",
      pause: "Pause",
      partner_checkin: "You arrived at a partner! Enjoy your rewards!",
      marketing_popup: "Book now and get a discount!",
      mapInitialized: "Map initialized successfully.",
      loaderFail: "Failed to load resources.",
      routePlotted: "Route plotted successfully.",
      noInstructionsAvailable: "No instructions available.",
      calculatingRoute: "Calculating route...",
      routeNotFound: "No route found!",
      locationUnavailable: "Location not available.",
      fetchingInstructionsError: "Error fetching route instructions.",
      access_menu: "Access Menu",
      startNavigation: "Start Navigation",
      minutes: "minutes",

      // ================================
      // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
      // ================================
      head_north: "Head north",
      head_south: "Head south",
      head_east: "Head east",
      head_west: "Head west",
      turn_sharp_left: "Turn sharply left",
      turn_sharp_right: "Turn sharply right",
      turn_slight_left: "Turn slightly left",
      turn_slight_right: "Turn slightly right",
      turn_left: "Turn left",
      turn_right: "Turn right",
      continue_straight: "Continue straight",
      keep_left: "Keep left",
      keep_right: "Keep right",
      u_turn: "Make a U-turn",
      enter_roundabout: "Enter the roundabout",
      exit_roundabout: "Exit the roundabout",
      ferry: "Take the ferry",
      end_of_road: "Follow the road to the end",
      arrive_destination: "You have arrived at your final destination"
    },

    es: {
      // ========== CHAVES ADICIONADAS OU AJUSTADAS PARA ESPANHOL ==========
      title: "Morro de São Paulo Digital",
      chooseLanguage: "Elige tu idioma:",
      tourist_spots: "Lugares Turísticos",
      tours: "Paseos",
      beaches: "Playas",
      parties: "Fiestas",
      restaurants: "Restaurantes",
      inns: "Posadas",
      shops: "Tiendas",
      emergencies: "Emergencias",
      cancel_navigation: "Cancelar Navegación",
      start_route: "Iniciar Ruta",
      route_summary_title: "Resumen de la Ruta",
      route_distance: "Distancia:",
      route_eta: "Tiempo Estimado:",
      instructions_title: "Instrucciones de Navegación",

      // ========== CHAVES JÁ EXISTENTES (traduzidas para o Espanhol) ==========
      close_modal: "X",
      close_modal_carousel:"X",
      close_menu: "Cerrar Menú",
      offlineTitle: "Modo Offline",
      offlineMsg: "Estás offline. Algunas funciones pueden no estar disponibles.",
      offRoute: "Has salido de la ruta. Recalculando...",
      routeError: "Error al crear la ruta.",
      noInstructions: "Ninguna instrucción disponible.",
      destinationReached: "Destino alcanzado.",
      complete: "completo",
      recalculatingRoute: "Recalculando ruta...",
      createRouteError: "Error al crear la ruta. Por favor, intenta de nuevo.",
      pathDrawnSuccess: "Nueva ruta dibujada con éxito.",
      navigationStarted: "Navegación iniciada.",
      arrivedAtDestination: "¡Has llegado a tu destino!",
      loadingResources: "Cargando recursos necesarios...",
      loadingResourcesFail: "Error al cargar recursos. Intenta nuevamente.",
      selectDestinationFirst: "Por favor, selecciona un destino primero.",
      routeNotFoundAPI: "La API no ha encontrado ninguna ruta (features vacías).",
      failedToPlotRoute: "No se pudo trazar la ruta en el mapa.",
      userOffRoad: "¡Te has salido de la carretera!",
      trackingError: "Fallo en el rastreo de ubicación. Verifica permisos.",
      checkingDeviation: "Verificando posible desvío de ruta...",
      multiRouteFail: "No se pudo trazar ruta con varios destinos.",
      userIsIdle: "Estás detenido. ¿Continuar o recalcular la ruta?",
      partnerCheckin: "¡Has llegado a {partnerName}! ¡Disfruta de tu bebida y 10 puntos!",
      routeRecalculatedOk: "Ruta recalculada con éxito.",
      routeDeviated: "Te has desviado de la ruta. Recalculando...",
      invalidDestination: "Destino inválido. Por favor, selecciona otro.",
      obstacleDetected: "Se detectó un obstáculo por delante. Ajustando la ruta.",
      routeDataError: "Error al cargar datos de la ruta.",
      noRoutePreview: "No hay ninguna ruta disponible para previsualizar.",
      routePreviewActivated: "Previsualización de la ruta activada.",
      navEnded: "Navegación finalizada.",
      navPaused: "Navegación pausada.",
      navResumed: "Navegación reanudada.",
      getRouteInstructions: "Obteniendo instrucciones de la ruta...",
      instructionsMissing: "Faltan instrucciones o no se han encontrado.",
      pleaseSelectDestination: "Por favor, selecciona un destino antes de iniciar la ruta.",
      noCarouselImages: "No hay imágenes disponibles para el carrusel.",
      searchError: "Ocurrió un error durante la búsqueda.",
      confirmRoute: "Confirma tu ruta.",
      noLocationPermission: "Permiso de ubicación denegado.",
      waitingForRoute: "Esperando la ruta.",
      adjustPosition: "Ajusta tu posición a una carretera cercana.",
      errorTitle: "Error",
      errorCloseButton: "Cerrar",
      offlineModeButton: "Entendido",
      assistantModalClose: "Cerrar Asistente",
      welcomeTitle: "¡BIENVENIDO!",
      welcomeSubtitle: "Elige tu idioma:",
      dicasMenu: "Consejos",
      zoomIn: "Acercar Zoom",
      zoomOut: "Alejar Zoom",
      pesquisar: "Buscar",
      sobreMenu: "Acerca de",
      closeSideMenu: "Cerrar Menú",
      submenu_touristSpots: "Lugares Turísticos",
      submenu_tours: "Paseos",
      submenu_beaches: "Playas",
      submenu_nightlife: "Vida Nocturna",
      submenu_restaurants: "Restaurantes",
      submenu_inns: "Posadas",
      submenu_shops: "Tiendas",
      submenu_emergencies: "Emergencias",
      submenu_tips: "Consejos",
      submenu_about: "Acerca de",
      submenu_education: "Educación",
      tutorialBtn: "Iniciar Tutorial",
      pontosTuristicosBtn: "Lugares Turísticos",
      passeiosBtn: "Paseos",
      praiasBtn: "Playas",
      fiestasBtn: "Fiestas",
      restaurantesBtn: "Restaurantes",
      pousadasBtn: "Posadas",
      lojasBtn: "Tiendas",
      emergenciasBtn: "Emergencias",
      fotosBtn: "Fotos",
      comoChegarBtn: "Cómo Llegar",
      reservarMesaBtn: "Reservar Mesa",
      ligarBtn: "Llamar",
      reservarQuartoBtn: "Reservar Habitación",
      reservarCadeirasBtn: "Reservar Sillas",
      comprarIngressoBtn: "Comprar Entrada",
      reservarPasseioBtn: "Reservar Paseo",
      enviarBtn: "Enviar",
      acessarSiteBtn: "Acceder al Sitio",
      iniciarNavegacaoBtn: "Iniciar Navegación",
      pararNavegacaoBtn: "Parar Navegación",
      acessarMenuBtn: "Acceder al Menú",
      iniciarRotaBtn: "Iniciar Ruta",
      cancelarNavegacaoBtn: "Cancelar Navegación",
      pausarBtn: "Pausar",
      back: "Volver",
      navigate_manually: "Navegar Manualmente",
      carouselModalClose: "Cerrar",
      carouselTitle: "Galería de Imágenes",
      nextSlide: "Siguiente Diapositiva",
      prevSlide: "Diapositiva Anterior",
      routeSummaryTitle: "Resumen de la Ruta",
      routeDistance: "Distancia:",
      routeETA: "Tiempo Estimado:",
      instructionsTitle: "Instrucciones de Navegación",
      stepExample1: "Continúa recto por 200 metros.",
      stepExample2: "Gira a la izquierda en 50 metros.",
      toggle_instructions: "Minimizar Instrucciones",
      progressLabel: "Progreso:",
      languageChanged: "Idioma cambiado a: {lang}",
      tutorialStart: "Iniciar",
      tutorialEnd: "Finalizar Tutorial",
      tutorialYes: "Sí",
      tutorialNo: "No",
      tutorialSend: "Enviar",
      showItinerary: "Ver Itinerario",
      generateNewItinerary: "Generar otro Itinerario",
      changePreferences: "Cambiar Preferencias",
      welcome: "¡Bienvenido a nuestro sitio!",
      youAreHere: "¡Estás aquí!",
      pousadasMessage: "Encuentra las mejores posadas para tu estancia.",
      touristSpotsMessage: "Descubre los lugares turísticos más populares.",
      beachesMessage: "Explora las playas más hermosas de Morro de São Paulo.",
      toursMessage: "Ve paseos disponibles y opciones de reserva.",
      restaurantsMessage: "Descubre los mejores restaurantes de la región.",
      partiesMessage: "Entérate de las fiestas y eventos disponibles.",
      shopsMessage: "Encuentra tiendas locales para tus compras.",
      emergenciesMessage: "Información útil para situaciones de emergencia.",
      createItinerary: "Crear Itinerario",
      aboutMore: "Fotos",
      createRoute: "Cómo Llegar",
      reserveTable: "Reservar Mesa",
      accessWebsite: "Sitio Web",
      reserveRoom: "Reservar Habitación",
      reserveChairs: "Reservar Sillas",
      buyTicket: "Comprar Entrada",
      reserveTour: "Reservar Paseo",
      viewItinerary: "Ver Itinerario",
      navigationStarted_pt: "Navegación iniciada.",
      turnLeft: "Gira a la izquierda",
      turnRight: "Gira a la derecha",
      continueStraight: "Continúa recto",
      assistant_title: "Asistente Virtual",
      assistant_text: "¿En qué puedo ayudarte hoy?",
      send_audio: "Enviar Audio",
      how_to_get_there: "Cómo Llegar",
      pause: "Pausar",
      partner_checkin: "¡Has llegado a un socio! ¡Disfruta tus recompensas!",
      marketing_popup: "¡Reserva ahora y obtén un descuento!",
      mapInitialized: "Mapa inicializado con éxito.",
      loaderFail: "Error al cargar recursos.",
      routePlotted: "Ruta trazada con éxito.",
      noInstructionsAvailable: "Ninguna instrucción disponible.",
      calculatingRoute: "Calculando ruta...",
      routeNotFound: "¡No se encontró ninguna ruta!",
      locationUnavailable: "Ubicación no disponible.",
      fetchingInstructionsError: "Error al buscar instrucciones de navegación.",
      access_menu: "Acceder al Menú",
      startNavigation: "Iniciar Navegación",
      minutes: "minutos",

      // ================================
      // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
      // ================================
      head_north: "Dirígete hacia el norte",
      head_south: "Dirígete hacia el sur",
      head_east: "Dirígete hacia el este",
      head_west: "Dirígete hacia el oeste",
      turn_sharp_left: "Gira bruscamente a la izquierda",
      turn_sharp_right: "Gira bruscamente a la derecha",
      turn_slight_left: "Gira levemente a la izquierda",
      turn_slight_right: "Gira levemente a la derecha",
      turn_left: "Gira a la izquierda",
      turn_right: "Gira a la derecha",
      continue_straight: "Continúa recto",
      keep_left: "Mantente a la izquierda",
      keep_right: "Mantente a la derecha",
      u_turn: "Haz un giro en U",
      enter_roundabout: "Entra a la rotonda",
      exit_roundabout: "Sal de la rotonda",
      ferry: "Cruza en ferry",
      end_of_road: "Sigue hasta el final de la vía",
      arrive_destination: "Has llegado a tu destino final"
    },

    he: {
      // ========== CHAVES ADICIONADAS OU AJUSTADAS PARA HEBRAICO ==========
      title: "מורו דה סאו פאולו דיגיטלי",
      chooseLanguage: "בחר את השפה שלך:",
      tourist_spots: "אתרי תיירות",
      tours: "סיורים",
      beaches: "חופים",
      parties: "מסיבות",
      restaurants: "מסעדות",
      inns: "אכסניות",
      shops: "חנויות",
      emergencies: "חירום",
      cancel_navigation: "בטל ניווט",
      start_route: "התחל מסלול",
      route_summary_title: "סיכום המסלול",
      route_distance: "מרחק:",
      route_eta: "זמן משוער:",
      instructions_title: "הוראות ניווט",

      // ========== CHAVES JÁ EXISTENTES (traduzidas para o Hebraico) ==========
      close_modal: "X",
      close_modal_carousel:"X",
      close_menu: "סגור תפריט",
      offlineTitle: "מצב לא מקוון",
      offlineMsg: "אתה במצב לא מקוון. חלק מהפונקציות עשויות להיות לא זמינות.",
      offRoute: "יצאת מהמסלול. מחשב מחדש...",
      routeError: "שגיאה ביצירת המסלול.",
      noInstructions: "אין הוראות זמינות.",
      destinationReached: "הגעת ליעד.",
      complete: "הושלם",
      recalculatingRoute: "מחשב מסלול מחדש...",
      createRouteError: "שגיאה ביצירת המסלול. אנא נסה שוב.",
      pathDrawnSuccess: "מסלול חדש הוצג בהצלחה.",
      navigationStarted: "ניווט התחיל.",
      arrivedAtDestination: "הגעת ליעד שלך!",
      loadingResources: "טוען משאבים נחוצים...",
      loadingResourcesFail: "נכשל בטעינת משאבים. אנא נסה שוב.",
      selectDestinationFirst: "אנא בחר יעד קודם.",
      routeNotFoundAPI: "לא נמצאה מסלול על ידי ה-API (אין נתונים).",
      failedToPlotRoute: "נכשל בניסיון לצייר את המסלול במפה.",
      userOffRoad: "יצאת מהכביש!",
      trackingError: "נכשל במעקב המיקום. בדוק הרשאות.",
      checkingDeviation: "בודק אפשרות לסטייה מהמסלול...",
      multiRouteFail: "נכשל לייצר מסלול מרובה עצירות.",
      userIsIdle: "אתה עומד במקום. האם להמשיך או לחשב מחדש את המסלול?",
      partnerCheckin: "הגעת ל-{partnerName}! קבל משקה ועוד 10 נקודות!",
      routeRecalculatedOk: "המסלול חושב מחדש בהצלחה.",
      routeDeviated: "סטית מהמסלול. מחשב מחדש...",
      invalidDestination: "יעד לא תקין. אנא בחר אחר.",
      obstacleDetected: "זוהה מכשול מלפנים. מתאים את המסלול.",
      routeDataError: "שגיאה בטעינת נתוני המסלול.",
      noRoutePreview: "אין מסלול זמין לתצוגה מקדימה.",
      routePreviewActivated: "תצוגה מקדימה הופעלה.",
      navEnded: "ניווט הסתיים.",
      navPaused: "ניווט הופסק.",
      navResumed: "ניווט חודש.",
      getRouteInstructions: "מקבל הוראות ניווט...",
      instructionsMissing: "הוראות חסרות או לא נמצאו.",
      pleaseSelectDestination: "אנא בחר יעד לפני תחילת הניווט.",
      noCarouselImages: "אין תמונות זמינות לצפייה.",
      searchError: "אירעה שגיאה בחיפוש.",
      confirmRoute: "אשר את המסלול שלך.",
      noLocationPermission: "הרשאת מיקום נדחתה.",
      waitingForRoute: "ממתין למסלול.",
      adjustPosition: "התאם את המיקום שלך לרחוב סמוך.",
      errorTitle: "שגיאה",
      errorCloseButton: "סגור",
      offlineModeButton: "הבנתי",
      assistantModalClose: "סגור עוזר",
      welcomeTitle: "ברוך הבא!",
      welcomeSubtitle: "בחר את השפה שלך:",
      dicasMenu: "טיפים",
      zoomIn: "הגדל תצוגה",
      zoomOut: "הקטן תצוגה",
      pesquisar: "חיפוש",
      sobreMenu: "אודות",
      closeSideMenu: "סגור תפריט",
      submenu_touristSpots: "אתרי תיירות",
      submenu_tours: "סיורים",
      submenu_beaches: "חופים",
      submenu_nightlife: "חיי לילה",
      submenu_restaurants: "מסעדות",
      submenu_inns: "אכסניות",
      submenu_shops: "חנויות",
      submenu_emergencies: "חירום",
      submenu_tips: "טיפים",
      submenu_about: "אודות",
      submenu_education: "חינוך",
      tutorialBtn: "התחל הדרכה",
      pontosTuristicosBtn: "אתרי תיירות",
      passeiosBtn: "סיורים",
      praiasBtn: "חופים",
      festasBtn: "מסיבות",
      restaurantesBtn: "מסעדות",
      pousadasBtn: "אכסניות",
      lojasBtn: "חנויות",
      emergenciasBtn: "חירום",
      fotosBtn: "תמונות",
      comoChegarBtn: "איך להגיע",
      reservarMesaBtn: "הזמן שולחן",
      ligarBtn: "התקשר",
      reservarQuartoBtn: "הזמן חדר",
      reservarCadeirasBtn: "הזמן כיסאות",
      comprarIngressoBtn: "קנה כרטיס",
      reservarPasseioBtn: "הזמן סיור",
      enviarBtn: "שלח",
      acessarSiteBtn: "כניסה לאתר",
      iniciarNavegacaoBtn: "התחל ניווט",
      pararNavegacaoBtn: "עצור ניווט",
      acessarMenuBtn: "כניסה לתפריט",
      iniciarRotaBtn: "התחל מסלול",
      cancelarNavegacaoBtn: "בטל ניווט",
      pausarBtn: "השהה",
      back: "חזור",
      navigate_manually: "ניווט ידני",
      carouselModalClose: "סגור",
      carouselTitle: "גלריית תמונות",
      nextSlide: "שקופית הבאה",
      prevSlide: "שקופית קודמת",
      routeSummaryTitle: "סיכום המסלול",
      routeDistance: "מרחק:",
      routeETA: "זמן משוער:",
      instructionsTitle: "הוראות ניווט",
      stepExample1: "המשך ישר ל-200 מטרים.",
      stepExample2: "פנה שמאלה בעוד 50 מטרים.",
      toggle_instructions: "הקטן הוראות",
      progressLabel: "התקדמות:",
      languageChanged: "השפה הוחלפה ל: {lang}",
      tutorialStart: "ההתחלה",
      tutorialEnd: "סיים הדרכה",
      tutorialYes: "כן",
      tutorialNo: "לא",
      tutorialSend: "שלח",
      showItinerary: "הצג מסלול",
      generateNewItinerary: "צור מסלול חדש",
      changePreferences: "שנה העדפות",
      welcome: "ברוך הבא לאתר שלנו!",
      youAreHere: "אתה כאן!",
      pousadasMessage: "מצא את האכסניות הטובות ביותר לשהותך.",
      touristSpotsMessage: "גלה את האתרים התיירותיים הפופולריים ביותר.",
      beachesMessage: "גלה את החופים היפים ביותר במורו דה סאו פאולו.",
      toursMessage: "בדוק סיורים זמינים ואפשרויות הזמנה.",
      restaurantsMessage: "גלה את המסעדות הטובות ביותר באזור.",
      partiesMessage: "בדוק מסיבות ואירועים זמינים.",
      shopsMessage: "מצא חנויות מקומיות לקניות.",
      emergenciesMessage: "מידע מועיל למקרי חירום.",
      createItinerary: "צור מסלול",
      aboutMore: "תמונות",
      createRoute: "איך להגיע",
      reserveTable: "הזמן שולחן",
      accessWebsite: "אתר",
      reserveRoom: "הזמן חדר",
      reserveChairs: "הזמן כיסאות",
      buyTicket: "קנה כרטיס",
      reserveTour: "הזמן סיור",
      viewItinerary: "הצג מסלול",
      navigationStarted_pt: "ניווט התחיל.",
      turnLeft: "פנה שמאלה",
      turnRight: "פנה ימינה",
      continueStraight: "המשך ישר",
      assistant_title: "עוזר וירטואלי",
      assistant_text: "איך אני יכול לעזור לך היום?",
      send_audio: "שלח אודיו",
      how_to_get_there: "איך להגיע",
      pause: "השהה",
      partner_checkin: "הגעת לשותף! תהנה מהמתנות שלך!",
      marketing_popup: "הזמן עכשיו וקבל הנחה!",
      mapInitialized: "המפה הופעלה בהצלחה.",
      loaderFail: "שגיאה בטעינת המשאבים.",
      routePlotted: "המסלול שורטט בהצלחה.",
      noInstructionsAvailable: "אין הוראות זמינות.",
      calculatingRoute: "מחשב מסלול...",
      routeNotFound: "לא נמצאה מסלול!",
      locationUnavailable: "המיקום אינו זמין.",
      fetchingInstructionsError: "שגיאה בקבלת הוראות ניווט.",
      access_menu: "כניסה לתפריט",
      startNavigation: "התחל ניווט",
      minutes: "דקות",

      // ================================
      // NOVAS CHAVES PARA SUPORTE A INSTRUÇÕES OSM
      // ================================
      head_north: "התחל צפונה",
      head_south: "התחל דרומה",
      head_east: "התחל מזרחה",
      head_west: "התחל מערבה",
      turn_sharp_left: "פנה בחדות שמאלה",
      turn_sharp_right: "פנה בחדות ימינה",
      turn_slight_left: "פנה קלות שמאלה",
      turn_slight_right: "פנה קלות ימינה",
      turn_left: "פנה שמאלה ",
      turn_right: "פנה ימינה ",
      continue_straight: "המשך ישר ",
      keep_left: "הישאר בצד שמאל",
      keep_right: "הישאר בצד ימין",
      u_turn: "בצע פניית פרסה",
      enter_roundabout: "היכנס לכיכר",
      exit_roundabout: "צא מהכיכר",
      ferry: "חצה במעבורת",
      end_of_road: "סע עד סוף הדרך",
      arrive_destination: "הגעת ליעד שלך"
    }
  };

// Checa se o idioma realmente existe no objeto de traduções
  if (!translationsData[lang]) {
    console.warn(`[getGeneralText] Idioma '${lang}' não encontrado. Fazendo fallback para 'pt'.`);
    lang = 'pt'; 
  }

  // Se a chave existir no idioma atual
  if (translationsData[lang][key]) {
    return translationsData[lang][key];
  } 
  // Caso não encontre a chave, mas exista em 'pt'
  else if (translationsData['pt'][key]) {
    console.warn(`[getGeneralText] Chave '${key}' ausente em '${lang}', mas existe em 'pt'. Usando fallback 'pt'.`);
    return translationsData['pt'][key];
  }

  // Se não encontrou a chave em nenhum lugar
  console.warn(`[getGeneralText] Chave '${key}' não encontrada em nenhum idioma. Retornando aviso.`);
  return `⚠️ ${key}`;
}



////////////////////////////////////////////
// Exemplo de função para inicializar esse estado
////////////////////////////////////////////
/**
 * Reinicializa e configura o estado global de navegação, incluindo camadas no mapa
 * e reinício de variáveis de controle. Garante também que o idioma atual seja salvo.
 * @function initNavigationState
 * @returns {void}
 *
 * CHECKLIST APLICADO:
 * - Documentação clara (1.2): docstring descrevendo parâmetros e retorno.
 * - Logs padronizados (6.1).
 * - Armazenamento de idioma no estado (se necessário).
 */
function initNavigationState() {
  console.log("[initNavigationState] Iniciando reinicialização do estado de navegação...");

  // Verifica se já existe a camada de marcadores para rota; caso não, cria e adiciona no mapa
  if (!navigationState.routeMarkersLayer) {
    navigationState.routeMarkersLayer = L.layerGroup().addTo(map);
    console.log("[initNavigationState] Criado 'routeMarkersLayer' para a rota no mapa.");
  }

  // Reset de flags de navegação
  navigationState.isActive = false;
  navigationState.isPaused = false;
  navigationState.watchId = null;
  navigationState.currentStepIndex = 0;
  navigationState.instructions = [];
  navigationState.selectedDestination = null;

  // Se precisar manter idioma dentro do navigationState (opcional):
  // navigationState.lang = selectedLanguage || 'pt'; 
  // console.log("[initNavigationState] Idioma atual definido em navigationState:", navigationState.lang);

  // Se existir uma rota previamente plotada, removemos do mapa
  if (navigationState.currentRouteLayer) {
    map.removeLayer(navigationState.currentRouteLayer);
    navigationState.currentRouteLayer = null;
    console.log("[initNavigationState] Rota anterior removida do mapa.");
  }

  console.log("[initNavigationState] Estado de navegação reiniciado com sucesso.");
}



  function esconderModalInstruções() {
    const modal = document.getElementById('navigation-instructions');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Função para fechar o modal
  function closeCarouselModal() {
    const carouselModal = document.getElementById('carousel-modal');
    if (carouselModal) {
      carouselModal.style.display = 'none';
    }
  }

  // Adiciona um listener de clique ao botão X para fechar
  const carouselCloseBtn = document.getElementById('carousel-modal-close');
  if (carouselCloseBtn) {
    carouselCloseBtn.addEventListener('click', closeCarouselModal);
  }

function restoreFeatureUI(feature) {
    console.log("Restaurando interface para a feature:", feature);

    // 1) Esconde qualquer controle ou modal que não serve agora
    hideAllControlButtons();
    closeCarouselModal();

    // 2) Obtemos o destino selecionado anteriormente (ex.: selectedDestination)
    if (!selectedDestination || !selectedDestination.lat || !selectedDestination.lon) {
        console.warn("Nenhum destino previamente selecionado. Abortando restoreFeatureUI.");
        return;
    }

    // 3) Ajustamos o mapa para esse destino usando a função REAPROVEITADA
    adjustMapWithLocation(
      selectedDestination.lat,
      selectedDestination.lon,
      selectedDestination.name,
      selectedDestination.description,
      15,            // zoom (pode ajustar se quiser)
      -10             // offsetYPercent (pode ajustar se quiser)
    );

    // (Opcional) Se quiser dar um feedback ao usuário:
    showNotification(
      `Último destino: ${selectedDestination.name || ''} restaurado no mapa.`,
      'info'
    );

    // 4) Exibe os botões/submenu correspondentes à feature
    switch (feature) {
      case 'pontos-turisticos':
          showControlButtonsTouristSpots();
          break;

      case 'passeios':
          showControlButtonsTour();
          break;

      case 'praias':
          showControlButtonsBeaches();
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

      default:
          // Se não precisa mais nada, apenas não faz nada aqui
          break;
    }
}

// (Opcional) Exemplo de função que avança step, caso o usuário fique perto do step atual
function handleNextInstructionIfClose(lat, lon) {
    // Lógica simples de proximidade p/ a instrução atual
    const step = instructions[currentStepIndex];
    if (!step) return; // sem instruções ou chegamos ao final

    const distToStep = calculateDistance(lat, lon, step.lat, step.lon);
    if (distToStep < 15) { 
        currentStepIndex++;
        console.log(`Passando para a próxima instrução. Index: ${currentStepIndex}`);
        updateInstructionModal(instructions, currentStepIndex, selectedLanguage);
    }
}

async function plotRouteOnMapMultiWaypoints(startLat, startLon, waypointsArray = [], profile = 'foot-walking') {
    try {
        // Montar a query para múltiplos waypoints na API do OpenRouteService
        // Exemplo: start => waypoint1 => waypoint2 => ... => final
        // Formato esperado: 
        //  coordinates: [[lonStart, latStart], [lonW1, latW1], ..., [lonFinal, latFinal]]
        
        const coordinates = [
            [startLon, startLat], 
            ...waypointsArray.map(wp => [wp.lon, wp.lat])
        ];

        const url = `https://api.openrouteservice.org/v2/directions/${profile}`;
        
        // Body da requisição para rotas complexas
        const bodyPayload = {
            coordinates,     // array de [lon, lat]
            instructions: true,
            optimize_waypoints: false // se quiser otimizar a ordem, setar true
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyPayload)
        });

        if (!response.ok) {
            console.error("Erro ao obter rota complexa. Status:", response.status);
            // Tratar erros específicos, ex.: 429, 503, etc.
            showNotification(`Erro da API (código ${response.status}).`, "error");
            return null;
        }

        const routeData = await response.json();

        // Extração das coordenadas
        const routeCoords = routeData.features[0].geometry.coordinates;
        const latLngs = routeCoords.map(([lon, lat]) => [lat, lon]);

        // Preparar mapa para nova rota
        prepareMapForNewRoute();

        // Criar polyline
        window.currentRoute = L.polyline(latLngs, {
            color: 'blue',
            weight: 6,
            dashArray: '10, 5'
        }).addTo(map);

        map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });

        // (Opcional) Adicionar setas nas linhas, se quiser
        addDirectionArrows(latLngs);
        
        return routeData;

    } catch (error) {
        console.error("Erro ao plotar rota complexa:", error);
        showNotification("Falha ao plotar rota com múltiplos destinos.", "error");
        return null;
    }
}



// ----------------------------------------------------------------------------------------------

// ======================
// ÍNDICE DE FUNÇÕES - ESTRUTURA ORGANIZADA
// ======================
// ID / Nome da função / Descrição / Número da linha no arquivo
// ============================================================================================

// ========== INICIALIZAÇÃO E CONFIGURAÇÃO (Funções 1 - 5) ==========
// 1.  loadResources               - Carrega recursos essenciais............................. 190
// 2.  setLanguage                 - Define o idioma do site.................................. 220
// 3.  updateInterfaceLanguage     - Atualiza textos da interface............................. 256
// 4.  initializeMap               - Inicializa o mapa interativo............................. 325
// 5.  getTileLayer                - Obtém camadas visuais do mapa............................ 373

// ========== MAPEAMENTO E LOCALIZAÇÃO (Funções 6 - 15) ==========
// 6.  setupEventListeners         - Configura eventos de clique e interação.................. 383
// 7.  getCurrentLocation          - Obtém a localização atual do usuário..................... 663
// 8.  useCurrentLocation          - Centraliza o mapa na posição do usuário.................. 697
// 9.  startPositionTracking       - Inicia rastreamento de localização em tempo real......... 707
// 10. updateMapWithUserLocation   - Atualiza o mapa com a localização do usuário............. 728
// 11. detectMotion                - Detecta movimento do usuário para recalibrar o mapa...... 743
// 12. adjustMapWithLocationUser   - Ajusta o mapa para a localização do usuário.............. 753
// 13. centerMapOnUser             - Centraliza o mapa automaticamente......................... 761
// 14. adjustMapZoomBySpeed        - Ajusta o zoom com base na velocidade...................... 770
// 15. adjustMapWithLocation       - Ajusta a posição do mapa conforme dados de GPS........... 777

// ========== NAVEGAÇÃO E ROTAS (Funções 16 - 28) ==========
// 16. clearCurrentRoute           - Limpa a rota ativa do mapa................................817
// 17. clearMarkers                - Remove todos os marcadores do mapa........................827
// 18. plotRouteOnMap              - Plota a rota no mapa com base em destinos.................836
// 19. calculateDistance           - Calcula a distância entre pontos..........................872
// 20. getLocationWithTimeout      - Obtém localização com tempo limite........................887
// 21. clearAllMarkers             - Remove todos os marcadores visíveis.......................904
// 22. startNavigation             - Inicia o processo de navegação............................918
// 23. updateNavigationProgressBar - Atualiza a barra de progresso da rota.....................1004
// 24. monitorUserState            - Monitora o estado do usuário..............................1014
// 25. trackUserMovement           - Rastreia o movimento do usuário...........................1042
// 26. fallbackToSensorNavigation  - Alterna para navegação por sensores.......................1103
// 27. alertGPSFailure             - Alerta falhas na localização GPS..........................1109
// 28. forceOfflineMode            - Força modo offline........................................1115

// ========== FEEDBACK E INTERFACE (Funções 29 - 31) ==========
// 29. handleUserIdleState         - Garante que a interface responda à inatividade........... 1122
// 30. showNotification            - Exibe notificações e alertas ao usuário.................. 1135
// 31. triggerHapticFeedback       - Fornece feedback tátil................................... 1173

// ========== REVALIDAÇÃO E OBSTÁCULOS (Funções 32 - 42) ==========
// 32. updateRealTimeNavigation    - Atualiza a navegação em tempo real (turn-by-turn)........ 1185
// 33. recalculateRoute            - Recalcula a rota em caso de desvios...................... 1214
// 34. notifyDeviation             - Notifica desvios na rota................................. 1248
// 35. validateDestination         - Valida se o destino é alcançável......................... 1263
// 36. handleRecalculation         - Gerencia recalculo automático de rota.................... 1283
// 37. notifyRouteDeviation        - Emite alertas de desvios................................. 1293
// 38. notifyNextInstruction       - Mostra a próxima instrução de navegação.................. 1299
// 39. shouldRecalculateRoute      - Verifica se a rota precisa ser recalculada............... 1308
// 40. analyzeRouteForObstacles    - Analisa rotas para detectar obstáculos................... 1326
// 41. validateRouteData           - Garante que a rota possui dados válidos.................. 1342
// 42. startRoutePreview           - Exibe pré-visualização de rotas.......................... 1358

// ========== CONTROLE DE NAVEGAÇÃO E UI (Funções 43 - 69) ==========
// 43. endNavigation               - Finaliza a navegação..................................... 1382
// 44. finalizeRouteOnArrival      - Conclui rota ao chegar ao destino........................ 1477
// 45. pauseNavigation             - Pausa a navegação........................................ 1483
// 46. continueNavigation          - Retoma a navegação pausada............................... 1490
// 47. toggleNavigationPause       - Alterna entre pausar/continuar navegação................. 1497
// 48. showWelcomeMessage          - Exibe mensagem de boas-vindas............................ 1505
// 49. showNavigationBar           - Mostra a barra de navegação.............................. 1516
// 50. displayRouteSummary         - Mostra um resumo da rota..................................1526
// 51. highlightCriticalInstruction- Destaca instruções importantes............................1538
// 52. hideAllControls             - Esconde todos os botões de controle...................... 1549
// 53. showRoutePreview            - Ativa a visualização de rotas............................ 1561
// 54. hideRoutePreview            - Oculta a visualização de rotas........................... 1587
// 55. addDirectionArrows          - Adiciona setas indicando direções........................ 1602
// 56. showUserLocationPopup       - Exibe um popup com a localização do usuário.............. 1618
// 57. displayStartNavigationButton- Exibe o botão para iniciar a navegação................... 1631
// 58. displayStepByStepInstructions-Exibe instruções de navegação passo a passo...............1669
// 59. fetchNextThreeInstructions  - Busca as próximas três instruções da rota................ 1699
// 60. enqueueInstruction          - Adiciona instrução à fila de navegação................... 1706
// 61. cacheTranslatedInstructions - Armazena instruções traduzidas no cache.................. 1719
// 62. generateRouteSummary        - Gera resumo detalhado da rota............................ 1727
// 63. updateInstructionModal      - Atualiza o modal de instruções........................... 1741
// 64. toggleModals                - Alterna entre abrir e fechar modais...................... 1809
// 65. showModal                   - Exibe um modal de informações............................ 1817
// 66. closeCarouselModal          - Fecha o modal do carrossel............................... 1826
// 67. closeAssistantModal         - Fecha o modal do assistente virtual...................... 1833
// 68. animateInstructionChange    - Anima a troca de instruções na interface................. 1842
// 69. handleSubmenuButtonsTouristSpots - Gerencia submenu de pontos turísticos............... 1850

// ========== SUBMENUS E BOTÕES DE CONTROLE (Funções 70 - 80) ==========
// 70. handleSubmenuButtonsTours   - Gerencia submenu de tours................................ 1860
// 71. handleSubmenuButtonsBeaches - Gerencia submenu de praias............................... 1869
// 72. handleSubmenuButtonsRestaurants- Gerencia submenu de restaurantes...................... 1876
// 73. handleSubmenuButtonsShops   - Gerencia submenu de lojas................................ 1883
// 74. handleSubmenuButtonsEmergencies- Gerencia submenu de emergências....................... 1890
// 75. handleSubmenuButtonsEducation- Lida com submenu de educação............................ 1897
// 76. handleSubmenuButtonsInns    - Lida com submenu de pousadas............................. 1904
// 77. handleSubmenuButtonsTips    - Gerencia submenu de dicas................................ 1911
// 78. showControlButtonsTouristSpots- Exibe botões de controle para pontos turísticos........ 1919
// 79. showControlButtonsTour      - Exibe botões de controle para tours...................... 1943
// 80. showControlButtonsBeaches   - Exibe botões de controle para praias..................... 1961

// ========== VOZ E INTERAÇÃO (Funções 81 - 91) ==========
// 81. showControlButtonsNightlife - Exibe botões de controle para eventos noturnos...........1985
// 82. showControlButtonsRestaurants-Exibe botões de controle para restaurantes...............2000
// 83. showControlButtonsShops     - Exibe botões de controle para lojas......................2019
// 84. showControlButtonsEmergencies-Exibe botões de controle para emergências................2036
// 85. showControlButtonsTips      - Exibe botões de controle específicos para dicas..........2052
// 86. startVoiceRecognition       - Inicia o reconhecimento de voz...........................2074
// 87. visualizeVoiceCapture       - Exibe visualmente a captura de voz.......................2093
// 88. interpretCommand            - Interpreta comandos de voz...............................2106
// 89. confirmCommandFeedback      - Confirma o comando de voz reconhecido....................2121
// 90. confirmAudioCommand         - Confirma a execução do comando de áudio..................2126
// 91. detectPOI                   - Detecta pontos de interesse (POI) próximos...............2132

// ========== CACHE E PERSISTÊNCIA (Funções 92 - 99) ==========
// 92. validatePOIResults          - Valida os pontos de interesse encontrados................2141
// 93. displayPOIInAR              - Exibe pontos de interesse em realidade aumentada.........2152
// 94. integrateMultimodalRoute    - Integra rotas multimodais................................2165
// 95. retryVoiceRecognition       - Reexecuta reconhecimento de voz..........................2171
// 96. cancelVoiceRecognition      - Cancela o reconhecimento de voz..........................2176
// 97. cachePOIs                   - Armazena pontos de interesse no cache....................2181
// 98. forcePOICacheRefresh        - Força a atualização do cache de POIs.....................2200
// 99. loadDestinationsFromCache   - Carrega destinos salvos do cache........................2209

// ========== TUTORIAL E ASSISTENTE VIRTUAL (Funções 100 - 108) ==========
// 100. saveNavigationState         - Salva o estado atual de navegação........................2225
// 101. restoreNavigationState      - Restaura o estado de navegação salvo.....................2236
// 102. saveStateToServiceWorker    - Salva o estado no Service Worker.........................2247
// 103. autoRestoreState            - Restaura automaticamente o estado de navegação...........2258
// 104. restoreState                - Restaura o estado geral do sistema.......................2271
// 105. startTutorial               - Inicia o tutorial interativo.............................2312
// 106. endTutorial                 - Finaliza o tutorial interativo...........................2326
// 107. nextTutorialStep            - Avança para o próximo passo do tutorial..................2335
// 108. previousTutorialStep        - Volta ao passo anterior do tutorial......................2348

// ========== ROTA E INTERAÇÃO (Funções 109 - 117) ==========
// 109. showTutorialStep            - Exibe o conteúdo de um passo específico..................2360
// 110. removeExistingHighlights    - Remove destaques visuais existentes......................2386
// 111. updateAssistantModalContent - Atualiza o conteúdo do modal de assistência..............2394
// 112. tutorialSteps               - Array de passos do tutorial..............................2409
// 113. storeAndProceed             - Armazena dados e avança no tutorial......................2461
// 114. generateInterestSteps       - Gera passos do tutorial com base em interesses...........2473
// 115. addInteractiveArrowsOnRoute - Adiciona setas interativas ao longo da rota..............2533
// 116. animateMapToLocation        - Anima o mapa para centralizar em um ponto................2572
// 117. calculateETA                - Calcula o tempo estimado de chegada......................2586

// ========== CRIAÇÃO E PERSONALIZAÇÃO DE ROTAS (Funções 118 - 126) ==========
// 118. checkAchievements           - Verifica e exibe conquistas durante a navegação..........2604
// 119. checkIfUserIdle            - Checa se o usuário está inativo...........................2612
// 120. checkIfUserIsOnRoad        - Verifica se o usuário está na estrada.....................2647
// 121. clearElement               - Remove um elemento específico da interface................2683
// 122. clearNavigationState       - Limpa o estado atual da navegação.........................2691
// 123. closeSideMenu              - Fecha o menu lateral......................................2700
// 124. collectInterestData        - Coleta dados de interesse do usuário......................2711
// 125. handleRouteDeviation       - Recalcula a rota se o usuário sair da trajetória..........2716
// 126. createRouteToDestination   - Cria uma rota até o destino final.........................2744

// ========== EXIBIÇÃO DE INTERESSES E LOCAIS (Funções 127 - 136) ==========
// 127. createRoute                - Inicia a criação de rota até o destino selecionado.......2810
// 128. customIcon                 - Cria ícones personalizados para mapas....................2838
// 129. customizeOSMPopup          - Personaliza popups do OpenStreetMap......................2852
// 130. debouncedUpdate            - Atualiza com debounce para evitar chamadas múltiplas.....2890
// 131. destroyCarousel            - Remove carrosséis de imagens.............................2907
// 132. determineUserState         - Determina o estado do usuário............................2923
// 133. displayCustomAbout         - Exibe a seção personalizada de "Sobre"...................2933
// 134. displayCustomBeaches       - Exibe lista de praias personalizadas.....................2981
// 135. displayCustomEducation     - Exibe locais educacionais................................2999
// 136. displayCustomEmergencies   - Exibe locais para emergências............................3043

// ========== INTEGRAÇÃO COM MAPAS E DADOS OSM (Funções 137 - 147) ==========
// 137. displayCustomInns          - Exibe pousadas personalizadas (modificado c/ marketing)..3078
// 138. displayCustomItems         - Exibe itens personalizados...............................3090
// 139. displayCustomNightlife     - Exibe locais de vida noturna.............................3140
// 140. displayCustomRestaurants   - Exibe restaurantes personalizados........................3151
// 141. displayCustomShops         - Exibe lojas personalizadas...............................3163
// 142. displayCustomTips          - Exibe dicas e recomendações..............................3175
// 143. displayCustomTouristSpots  - Exibe pontos turísticos personalizados...................3208
// 144. displayCustomTours         - Exibe tours personalizados...............................3223
// 145. displayOSMData             - Exibe dados do OpenStreetMap no mapa.....................3257
// 146. drawPath                   - Desenha um caminho personalizado no mapa.................3336
// 147. enableDarkMode             - Ativa o modo escuro do mapa e interface..................3383

// ========== GERENCIAMENTO DE DADOS E LOCALSTORAGE (Funções 148 - 157) ==========
// 148. showNearbyPOIs             - Mostra pontos de interesse próximos......................3411
// 149. adjustMapZoomBySpeed       - Ajusta o zoom de acordo com velocidade (EcoMode).........3427
// 150. enrichInstructionsWithOSM  - Enriquecer instruções com dados do OSM...................3441
// 151. fetchOSMData               - Busca dados de POIs no OpenStreetMap.....................3467
// 152. fetchRouteInstructions     - Obtém instruções de rota a partir do OSM.................3486
// 153. finalizeRouteMarkers       - Adiciona marcadores finais na rota.......................3521
// 154. generateItineraryFromAnswers- Cria itinerário baseado em respostas do usuário.........3543
// 155. getAvailableActivities     - Lista atividades disponíveis na região...................3556
// 156. getDirectionIcon           - Obtém ícone direcional de instrução......................3584
// 157. getImagesForLocation       - Busca imagens para exibição de um local..................3596

// ========== DESVIOS, ERROS E SITUAÇÕES ESPECIAIS (Funções 158 - 166) ==========
// 158. getLocalStorageItem        - Obtém item específico do localStorage.....................3822
// 159. getNavigationText          - Obtém texto de navegação para instruções.................3838
// 160. getSelectedDestination     - Obtém o destino selecionado...............................3845
// 161. getUrlsForLocation         - Obtém URLs relacionadas a um local.......................3860
// 162. giveVoiceFeedback          - Fornece feedback por voz durante navegação...............3918
// 163. handleFeatureSelection     - Lida com seleção de recursos do mapa.....................3928
// 164. handleNextInstruction      - Avança para a próxima instrução..........................3978
// 165. handleReservation          - Gerencia reservas e agendamentos.........................3994
// 166. handleRouteDeviation       - Lida com desvios inesperados da rota.....................4022

// ========== CONTROLE DE INTERFACE, MODAIS E GESTÃO VISUAL (Funções 167 - 176) ==========
// 167. handleRouteDeviationOffline - Lida com desvios no modo offline........................4042
// 168. handleSpecialScenarios      - Lida com cenários especiais durante a rota...............4048
// 169. handleSubmenuButtonClick    - Gatilho para botões de submenu...........................4060
// 170. handleSubmenuButtons        - Gerencia botões gerais de submenu.......................4078
// 171. handleUserState             - Gerencia estado geral do usuário........................4130
// 172. hideAllButtons              - Oculta todos os botões da interface.....................4142
// 173. hideAllControlButtons       - Oculta botões de controle específicos...................4155
// 174. hideAssistantModal          - Esconde o modal do assistente virtual...................4166
// 175. hideControlButtons          - Oculta botões de controle temporariamente...............4173
// 176. hideNavigationBar           - Oculta a barra de navegação.............................4184

// ========== GESTÃO DE SUBMENUS, DADOS E ERROS (Funções 177 - 187) ==========
// 177. hideRouteSummary            - Oculta o resumo de rota.................................4193
// 178. highlightElement            - Destaca elementos na interface..........................4202
// 179. initializeNavigation        - Inicializa a navegação após reset.......................4215
// 180. isUserOnStreet              - Verifica se o usuário está em uma rua...................4233
// 181. loadOfflineInstructions     - Carrega instruções offline..............................4257
// 182. loadSearchHistory           - Carrega histórico de busca..............................4269
// 183. loadSubMenu                 - Carrega dados do submenu................................4291
// 184. mapGeolocationError         - Lida com erros de geolocalização........................4331
// 185. notifyDirectionChange       - Notifica mudanças de direção durante a navegação........4349
// 186. notifyUserOffRoute          - Alerta quando o usuário sai da rota.....................4370
// 187. openDestinationWebsite      - Abre o site do destino selecionado......................4395

// ========== GERENCIAMENTO DE PERMISSÕES, CACHE E ITINERÁRIOS (Funções 188 - 197) ==========
// 188. performControlAction        - Executa ação de controle solicitada.....................4406
// 189. prepareMapForNewRoute       - Prepara o mapa para uma nova rota.......................4458
// 190. provideContinuousAssistance - Fornece assistência contínua durante a navegação........4465
// 191. removeFloatingMenuHighlights- Remove destaques do menu flutuante......................4474
// 192. removeLocalStorageItem      - Remove item específico do localStorage..................4482
// 193. renderItinerary             - Renderiza itinerário do usuário.........................4491
// 194. requestLocationPermission   - Solicita permissão de localização.......................4513
// 195. saveDestinationToCache      - Salva destino no cache..................................4537
// 196. saveRouteToHistory          - Salva rota no histórico.................................4549
// 197. saveSearchQueryToHistory    - Salva consulta de pesquisa no histórico.................4559

// ========== EXIBIÇÃO DE BOTÕES E CONTROLE VISUAL (Funções 198 - 207) ==========
// 198. searchAssistance            - Realiza busca assistida.................................4575
// 199. searchLocation              - Realiza busca de localização............................4586
// 200. selectDestination           - Seleciona um destino da busca...........................4911
// 201. sendDestinationToServiceWorker - Envia destino ao Service Worker......................4917
// 202. setLocalStorageItem         - Define item específico no localStorage..................4925
// 203. setSelectedDestination      - Define o destino selecionado............................4934
// 204. showButtons                 - Exibe botões na interface...............................4963
// 205. showMenuButtons             - Exibe botões do menu principal..........................4977
// 206. showStartRouteButton        - Exibe botão para iniciar a rota.........................4993
// 207. startCarousel               - Inicia carrossel de imagens/informações................5012

// ========== FINALIZAÇÃO E GESTÃO DE ROTAS (Funções 208 - 217) ==========
// 208. startInteractiveRoute       - Inicia rota interativa..................................5058 (MODIFICADA C/ GAMIFICAÇÃO)
// 209. startRouteCreation          - Inicia processo de criação de rota......................5122
// 210. stopPositionTracking        - Encerra rastreamento de localização.....................5165
// 211. toggleDarkMode              - Alterna entre modo escuro e claro.......................5172
// 212. toggleMenu                  - Alterna visibilidade do menu principal..................5180
// 213. toggleNavigationInstructions- Alterna exibição de instruções de navegação.............5195
// 214. toggleRouteSummary          - Alterna a exibição do resumo de rota....................5205
// 215. translateInstruction        - Traduz instrução de navegação...........................5212
// 216. translatePageContent        - Traduz conteúdo completo da página......................5218
// 217. updateInstructionsOnProgress- Atualiza instruções conforme progresso..................5227

// ========== ATUALIZAÇÕES E GESTÃO DE INSTRUÇÕES (Funções 218 - 225) ==========
// 218. updateNavigationControls    - Atualiza botões de controle durante navegação...........5244
// 219. updateNavigationInstructions- Atualiza as instruções de navegação.....................5266
// 220. updateNavigationProgress    - Atualiza o progresso da navegação.......................5294
// 221. updateProgressBar           - Atualiza barra de progresso.............................5305
// 222. updateUserMarker            - Atualiza marcador do usuário no mapa....................5316
// 223. updateUserPositionOnRoute   - Atualiza posição do usuário na rota.....................5329
// 224. validateSelectedDestination - Valida destino selecionado..............................5353
// 225. visualizeRouteOnPreview     - Visualiza rota na pré-visualização......................5366

// ========== FINALIZAÇÃO DE INTERFACE E MAPA (Funções 226 - 230) ==========
// 226. zoomToSelectedArea          - Aplica zoom à área selecionada..........................5396
// 227. recenterMapOnUser           - Recentraliza mapa na posição do usuário.................5409
// 228. clearMapLayers              - Remove camadas visuais do mapa..........................5422
// 229. resetMapView                - Restaura a visualização original do mapa................5436
// 230. navigationTexts             - Objeto com textos de navegação por idioma...............5450

// 231. validateTranslations        - Valida se há traduções ausentes........................5507
// 232. applyLanguage               - Aplica traduções e idioma selecionado..................5520
// 233. awardPointsToUser           - Credita pontos ao usuário (gamificação)................5532 (NOVO)
// 234. addArrowToMap               - Insere uma “seta” (ícone) no mapa......................5543

// ABAIXO SEGUE A LÓGICA DE TODAS AS 100+ FUNÇÕES IMPLEMENTADAS
// ======================

// ====================================================================
// VARIÁVEIS GLOBAIS
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeMap();         // Configura o mapa
        loadResources();         // Carrega recursos (mockado)
        showWelcomeMessage();    // Ativa o assistente virtual (boas-vindas/idiomas)
        setupEventListeners();   // Configura os eventos principais
        initializeTutorialListeners();
        setupSubmenuClickListeners();

        // Swiper (Carrossel)
        var swiper = new Swiper('.swiper-container', {
            slidesPerView: 1,
            spaceBetween: 10,
            loop: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            autoplay: { delay: 2500, disableOnInteraction: false },
            breakpoints: {
                640: { slidesPerView: 1, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 40 }
            }
        });

    } catch (error) {
        console.error('Erro durante a inicialização:', error);
    }
});

// Variáveis Globais
let map; 
let currentSubMenu = null; 
let currentLocation = null; 
let selectedLanguage = getLocalStorageItem('preferredLanguage', 'pt'); 
let currentStep = null; 
let tutorialIsActive = false; 
let searchHistory = []; 
let achievements = []; 
let favorites = []; 
let routingControl = null; 
let speechSynthesisUtterance = null; 
let voices = []; 
let selectedDestination = {}; 
let markers = []; 
let currentMarker = null; 
let swiperInstance = null; 
let watchId = null;
let selectedProfile = 'foot-walking'; 
let userLocationMarker = null;
let userCurrentLocation = null; 
let currentRouteData = null;
let isNavigationActive = false;
let isnavigationPaused = false;
let currentRouteSteps = []; 
let navigationWatchId = null; 
let currentRoute = null; 
let userMarker = null; 
let destinationMarker = null; 
let cachedLocation = null; 
let locationPermissionGranted = false; 
let instructions = [];
let lastRecalculationTime = 0;
let userLocation = null;
let lastDeviationTime = 0;
let currentStepIndex = 0;
let lastSelectedFeature = null;



/************************************************************************************/
/*                               CONSTANTES                               */
/************************************************************************************/

/************************************************************
 *  ESTADO GLOBAL DE NAVEGAÇÃO (EXEMPLO)
 ************************************************************/
const navigationState = {
  isActive: false,       // Indica se a navegação está ativa
  isPaused: false,       // Indica se a navegação está pausada
  watchId: null,         // watchPosition ID do geolocation
  currentStepIndex: 0,   // Índice do passo/instrução atual
  instructions: [],      // Array de instruções da rota (ex.: turn-by-turn)
  selectedDestination: null, // Objeto com { lat, lon, name, ...}
  currentRouteLayer: null,   // Referência à rota plotada no mapa (Polyline ou Leaflet layer)
  routeMarkersLayer: null,   // Camada de marcadores específica para a rota
  // Opcional: armazenar aqui também track de caminhos, histórico, etc.
};

const notificationContainer = document.getElementById("notification-container");
const navigationInstructionsContainer = document.getElementById("route-summary");
const progressBar = document.getElementById("progress-bar");

const apiKey = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
const OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

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

// ====================================================================
// GAMIFICAÇÃO BÁSICA - Exemplo de check-in em parceiro
// ====================================================================
const TOCA_DO_MORCEGO_COORDS = { lat: -13.3782, lon: -38.9140 }; // Ajuste se necessário
const PARTNER_CHECKIN_RADIUS = 50; // Distância para "chegar"

// Verifica se chegou perto do parceiro e dispara recompensas
function checkNearbyPartners(userLat, userLon) {
    const distanceToToca = calculateDistance(userLat, userLon, TOCA_DO_MORCEGO_COORDS.lat, TOCA_DO_MORCEGO_COORDS.lon);
    if (distanceToToca < PARTNER_CHECKIN_RADIUS) {
        handleUserArrivalAtPartner("Toca do Morcego");
    }
    // No futuro, inclua outros parceiros aqui
}

// Ao chegar num parceiro, exibe pop-up e dá pontos
function handleUserArrivalAtPartner(partnerName) {
    let visitedPartners = JSON.parse(localStorage.getItem('visitedPartners') || '[]');
    if (visitedPartners.includes(partnerName)) {
        return; 
    }
    visitedPartners.push(partnerName);
    localStorage.setItem('visitedPartners', JSON.stringify(visitedPartners));

    // Exemplo: awarding points
    awardPointsToUser(partnerName, 10);
    showNotification(`Você chegou em ${partnerName}! Ganhou um Drink e 10 pontos!`, 'success');
}


// ====================================================================
// TRADUÇÕES
// ====================================================================

// 1. loadResources - Carrega recursos essenciais com callback e tratamento de erro
async function loadResources(callback) {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";

  try {
    // Mensagem traduzida
    showNotification(getGeneralText("loadingResources", selectedLanguage), "info");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (loader) loader.style.display = "none";
    console.log(getGeneralText("complete", selectedLanguage));

    if (callback && typeof callback === 'function') {
      callback();
    }
  } catch (error) {
    if (loader) loader.style.display = "none";

    console.error(getGeneralText("loadingResourcesFail", selectedLanguage), error);
    showNotification(
      getGeneralText("loadingResourcesFail", selectedLanguage),
      "error"
    );
  }
}




// ====================================================================
// 2. setLanguage
// ====================================================================

function setLanguage(lang) {
  try {
    const availableLanguages = ["pt", "en", "es", "he"];
    const defaultLanguage = "pt";

    if (!availableLanguages.includes(lang)) {
      console.warn(
        `${getGeneralText("languageChanged", defaultLanguage)} => ${defaultLanguage}`
      );
      lang = defaultLanguage;
    }

    localStorage.setItem("preferredLanguage", lang);
    selectedLanguage = lang;

    // Traduz tudo
    translatePageContent(lang);

    const welcomeModal = document.getElementById("welcome-modal");
    if (welcomeModal) {
      welcomeModal.style.display = "none";
    }

    // Notificação de idioma alterado
    const msg = getGeneralText("languageChanged", lang).replace("{lang}", lang);
    showNotification(msg, "success");

    console.log(`Idioma definido para: ${lang}`);
    // opcionalmente iniciar tutorial
    showTutorialStep("start-tutorial");
  } catch (error) {
    console.error(getGeneralText("routeError", selectedLanguage), error);
    showNotification(getGeneralText("routeError", selectedLanguage), "error");
  }
}




// ====================================================================
// 3. updateInterfaceLanguage
// ====================================================================
function updateInterfaceLanguage(lang) {
  const elementsToTranslate = document.querySelectorAll("[data-i18n]");
  let missingTranslations = 0;

  elementsToTranslate.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    let translation = getGeneralText(key, lang);

    if (translation.startsWith("⚠️")) {
      missingTranslations++;
      console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
    }

    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      element.placeholder = translation;
    } else if (element.hasAttribute("title")) {
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



// ====================================================================
// 4. initializeMap
// ====================================================================
function initializeMap() {
  if (map) {
    console.warn("Mapa já está inicializado."); // se quiser traduzir logs também, use getGeneralText
    return;
  }

  console.log(getGeneralText("mapInitialized", selectedLanguage)); 
  const tileLayers = {
    streets: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }),
    satellite: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri",
        maxZoom: 19,
      }
    ),
  };

  map = L.map("map", {
    layers: [tileLayers.streets],
    zoomControl: false,
    maxZoom: 19,
    minZoom: 3,
  }).setView([-13.378, -38.918], 14);

  L.control.layers(tileLayers).addTo(map);
}


// ====================================================================
// 5. getTileLayer (exemplo de fallback - não alterado)
// ====================================================================
function getTileLayer() {
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
    });
}

// ======================
// MAPEAMENTO E LOCALIZAÇÃO (Funções 6 - 16)
// ======================

// 6. setupEventListeners - Configura eventos de clique e interação
// Inclui eventos para botões, menus e outras interações
function setupEventListeners() {
    const modal = document.getElementById('assistant-modal');
    const floatingMenu = document.getElementById('floating-menu');
    const createItineraryBtn = document.getElementById('create-itinerary-btn');
    const startCreateRouteBtn = document.getElementById('create-route-btn');
    const searchBtn = document.querySelector('.menu-btn[data-feature="pesquisar"]');
    const ensinoBtn = document.querySelector('.menu-btn[data-feature="ensino"]');
    const carouselModalClose = document.getElementById('carousel-modal-close');
    const aboutMoreBtn = document.getElementById('about-more-btn');
    const menuToggle = document.getElementById('menu-btn');
    const buyTicketBtn = document.getElementById('buy-ticket-btn');
    const tourBtn = document.getElementById('tour-btn');
    const navigationBtn = document.getElementById('navigation-start');


const closeModal = document.querySelector('.close-btn'); // Seleciona o botão de fechar
if (closeModal) {
    closeModal.addEventListener('click', closeAssistantModal); // Associa o evento de clique à função
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

    if (buyTicketBtn) {
        buyTicketBtn.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(selectedDestination.url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }

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

// Configura o evento de mudança de idioma com integração ao tutorial do assistente
document.querySelectorAll('.lang-btn').forEach(button => {
    button.addEventListener('click', () => {
        const lang = button.dataset.lang;
        
        // Define o idioma globalmente
        setLanguage(lang);
        updateInterfaceLanguage(lang);
        
        // Fecha o modal de boas-vindas
        document.getElementById('welcome-modal').style.display = 'none';
        
        // Exibe o modal do assistente e revela botões
        const assistantModal = document.getElementById('assistant-modal');
        const sendAudioBtn = document.getElementById('send-audio-btn');
        const navigateManualBtn = document.getElementById('navigate-manually-btn');

        if (assistantModal && sendAudioBtn && navigateManualBtn) {
            assistantModal.style.display = 'block';  // Exibe o modal

            // Revela os botões existentes
            sendAudioBtn.style.display = 'block';
            navigateManualBtn.style.display = 'block';

            // Adiciona eventos aos botões
            sendAudioBtn.addEventListener('click', () => {
                startVoiceRecognition();  // Inicia reconhecimento de voz
                assistantModal.style.display = 'none';  // Fecha o modal
            });

            navigateManualBtn.addEventListener('click', () => {
                showTutorialStep('ask-interest');  // Inicia o tutorial manual
                assistantModal.style.display = 'none';
            });
        }

        console.log(`Idioma alterado para: ${lang}`);
    });
});

// Evento de clique para iniciar navegação
// Mantém ou confirma o listener do "start-navigation-button":
    const startNavigationBtn = document.getElementById("start-navigation-button");
    if (startNavigationBtn) {
      startNavigationBtn.addEventListener("click", () => {
        console.log("✅ Botão 'start-navigation-button' clicado!");
        startNavigation();
      });
    }

// Evento para botões do menu flutuante
document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
    btn.addEventListener('click', (event) => {
        const feature = btn.getAttribute('data-feature');
        console.log(`Feature selected: ${feature}`);
        handleFeatureSelection(feature);
        closeCarouselModal();
        removeExistingHighlights();
        removeFloatingMenuHighlights();
        removeExistingHighlights();
        event.stopPropagation();
        if (tutorialIsActive && tutorialSteps[currentStep].step === feature) {
            nextTutorialStep();
        }
    });
});


// Evento para botões de controle
document.querySelectorAll('.control-btn[data-feature]').forEach(btn => {
    btn.addEventListener('click', (event) => {
        const feature = btn.getAttribute('data-feature');
        console.log(`Control button feature selected: ${feature}`);
        handleFeatureSelection(feature);
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

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(error => {
            console.error('Erro ao registrar o Service Worker:', error);
        });

    // Recuperar o estado ao carregar a página
    navigator.serviceWorker.ready.then(() => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                action: 'getState',
            });
        }
    });

    // Ouvir mensagens do Service Worker
    navigator.serviceWorker.onmessage = event => {
        const { action, payload } = event.data;

        if (action === 'stateRestored') {
            restoreState(payload);
        } else if (action === 'positionUpdate') {
            updateUserPositionOnMap(payload);
        }
    };
}


    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchLocation();
            closeSideMenu();
            if (tutorialIsActive && tutorialSteps[currentStep].step === 'pesquisar') {
                nextTutorialStep();
            }
        });
    }

if (startCreateRouteBtn) {
    startCreateRouteBtn.addEventListener('click', () => {
        startRouteCreation();
    });
}

    if (noBtn) {
        noBtn.addEventListener('click', () => {
            hideControlButtons();
        });
    }

    if (carouselModalClose) {
        carouselModalClose.addEventListener('click', closeCarouselModal);
    }


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

        } if (tutorialSendBtn) {
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

// 7. getCurrentLocation - Obtém a localização atual do usuário - Linha 34
async function getCurrentLocation(options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }) {
  if (!("geolocation" in navigator)) {
    showNotification("Geolocalização não suportada pelo seu navegador.", "error");
    return null;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } catch (error) {
    console.error("Erro ao obter geolocalização:", error);
    let errorMessage = "Não foi possível obter sua localização.";
    if (error.code === error.PERMISSION_DENIED) {
      errorMessage = "Permissão de localização negada.";
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      errorMessage = "Localização indisponível.";
    } else if (error.code === error.TIMEOUT) {
      errorMessage = "Tempo limite excedido para obter sua localização.";
    }
    showNotification(errorMessage, "error");
    return null;
  }
}


// 8. useCurrentLocation - Centraliza o mapa na posição do usuário
async function useCurrentLocation() {
  try {
    userLocation = await getCurrentLocation(); // Forçando atualização sempre
    if (!userLocation) return;
    centerMapOnUser(userLocation.latitude, userLocation.longitude);
    console.log("Mapa centralizado na localização atual.");
  } catch (error) {
    console.error("Falha ao usar a localização atual:", error);
  }
}


// 9. startPositionTracking - Rastreia localização em tempo real
function startPositionTracking() {
  if (!navigator.geolocation) {
    showNotification("Geolocalização não está disponível no seu navegador.", "error");
    return null;
  }

  window.positionWatcher = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const isOnRoad = await checkIfUserIsOnRoad(latitude, longitude);
        if (!isOnRoad) {
          showNotification("Você saiu da estrada!", "warning");
        }
        userLocation = { latitude, longitude }; // Atualiza userLocation global
        updateMapWithUserLocation();
      } catch (err) {
        console.error("Erro ao processar localização:", err);
      }
    },
    (error) => {
      console.error("Falha no rastreamento de localização:", error);
      showNotification("Falha no rastreamento de localização. Verifique permissões.", "error");
    },
    { enableHighAccuracy: true }
  );

  return window.positionWatcher;
}


// 10. updateMapWithUserLocation - Atualiza o mapa com a localização do usuário - Linha 46
function updateMapWithUserLocation(zoomLevel = 15) {
  if (!userLocation || !map) {
    console.error("Localização do usuário ou mapa indisponível.");
    return;
  }

  centerMapOnUser(userLocation.latitude, userLocation.longitude, zoomLevel);
  console.log("Mapa atualizado para a localização do usuário.");
}


// 11. detectMotion - Detecta movimento do usuário para recalibrar o mapa - Linha 50
function detectMotion() {
    if ('DeviceMotionEvent' in window) {
        window.addEventListener('devicemotion', (event) => {
            if (event.acceleration.x > 5 || event.acceleration.y > 5) {
                console.log('Movimento detectado!');
            }
        });
    }
}

// 12. adjustMapWithLocationUser - Ajusta o mapa para a localização do usuário - Linha 54
function adjustMapWithLocationUser(lat, lon) {
    map.setView([lat, lon], 15);
    const marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(translations[selectedLanguage].youAreHere || "Você está aqui!")
        .openPopup();
    markers.push(marker);
}

// 13. centerMapOnUser - Centraliza o mapa automaticamente - Linha 58
function centerMapOnUser(lat, lon) {
    if (map) {
        map.setView([lat, lon], 15);
    }
}

// 14. adjustMapZoomBySpeed - Ajusta o zoom com base na velocidade - Linha 62
function adjustMapZoomBySpeed(speed) {
  if (!map) return;
  
  let newZoom;
  if (speed < 3) {
    newZoom = 17; // Caminhada lenta
  } else if (speed < 8) {
    newZoom = 15; // Caminhada rápida / jogging
  } else if (speed < 15) {
    newZoom = 13; // Bicicleta ou veículo lento
  } else {
    newZoom = 11; // Carro mais rápido
  }

  map.setZoom(newZoom);
  showNotification(`Zoom ajustado de acordo com velocidade: ~${speed.toFixed(1)} m/s.`, "info");
}


// 15. adjustMapWithLocation - Ajusta a posição do mapa conforme dados de GPS - Linha 66
function adjustMapWithLocation(
  lat, 
  lon, 
  name = "", 
  description = "", 
  zoom = 15, 
  offsetYPercent = 10,
  shouldClearMarkers = true
) {
  try {
    if (shouldClearMarkers) clearMarkers();

    const marker = L.marker([lat, lon]).addTo(map)
      .bindPopup(`<b>${name}</b><br>${description || "Localização selecionada"}`)
      .openPopup();

    markers.push(marker);

    const mapSize = map.getSize();
    const offsetY = (mapSize.y * Math.min(offsetYPercent, 100)) / 100;
    const projectedPoint = map.project([lat, lon], zoom).subtract([0, offsetY]);
    const adjustedLatLng = map.unproject(projectedPoint, zoom);

    map.setView(adjustedLatLng, zoom, { animate: true, pan: { duration: 0.5 } });
    console.log(`Mapa ajustado para (${lat}, ${lon}) com zoom ${zoom}.`);
  } catch (error) {
    console.error("Erro ao ajustar o mapa:", error);
  }
}


// ======================
// NAVEGAÇÃO E ROTAS (Funções 16 - 28)
// ======================

// 16. clearCurrentRoute - Limpa a rota ativa do mapa - Linha 74
function clearCurrentRoute() {
  if (window.currentRoute) {
    map.removeLayer(window.currentRoute);
    window.currentRoute = null;
    console.log("Rota atual removida do mapa.");
  } else {
    console.log("Nenhuma rota estava ativa para ser removida.");
  }
}


// 17. clearMarkers - Remove todos os marcadores do mapa - Linha 78

function clearMarkers(filterFn) {
  if (typeof filterFn === "function") {
    markers = markers.filter(marker => {
      if (filterFn(marker)) {
        map.removeLayer(marker);
        return false;
      }
      return true;
    });
  } else {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
  }
  console.log("Marcadores removidos (com ou sem filtro).");
}


// 18. plotRouteOnMap - Plota a rota no mapa com base em destinos
// 18. plotRouteOnMap - Plota a rota no mapa com base em destinos
async function plotRouteOnMap(startLat, startLon, destLat, destLon) {
  const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${startLon},${startLat}&end=${destLon},${destLat}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(getGeneralText("routeError", selectedLanguage));
    }

    const routeData = await response.json();
    if (!routeData.features || routeData.features.length === 0) {
      throw new Error(getGeneralText("routeNotFoundAPI", selectedLanguage));
    }

    const coordinates = routeData.features[0].geometry.coordinates.map(
      ([lon, lat]) => [lat, lon]
    );

    prepareMapForNewRoute();

    // Criamos a Polyline sem chamar a função addDirectionArrows()
    window.currentRoute = L.polyline(coordinates, {
      color: "blue",
      weight: 6,
      dashArray: "10, 5",
    }).addTo(map);

    // Ajusta o mapa para mostrar bem toda a rota
    map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });

    console.log(getGeneralText("pathDrawnSuccess", selectedLanguage));
    return routeData;
  } catch (error) {
    console.error(error.message);
    showNotification(
      getGeneralText("failedToPlotRoute", selectedLanguage),
      "error"
    );
    return null;
  }
}



// 19. calculateDistance - Calcula a distância entre dois pontos
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // raio da Terra em km
  const dLat = (Number(lat2) - Number(lat1)) * (Math.PI / 180);
  const dLon = (Number(lon2) - Number(lon1)) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(Number(lat1) * (Math.PI / 180)) *
      Math.cos(Number(lat2) * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // retorna em metros
}


// 20. getLocationWithTimeout - Obtém localização com tempo limite - Linha 90
function getLocationWithTimeout(timeout = 10000) {
    return new Promise((resolve, reject) => {
        let timer = setTimeout(() => {
            reject(new Error("⚠️ Timeout ao tentar obter localização."));
        }, timeout);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timer);
                const { latitude, longitude } = position.coords;
                resolve({ latitude, longitude });
            },
            (error) => {
                clearTimeout(timer);
                reject(error);
            },
            { enableHighAccuracy: true }
        );
    });
}

// 21. clearAllMarkers - Remove todos os marcadores visíveis do mapa - Linha 94
function clearAllMarkers() {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    console.log("Todos os marcadores foram removidos.");
}

// 22. startNavigation - Inicia a navegação até o destino
 async function startNavigation() {
  console.log("▶️ [startNavigation] Iniciando processo de navegação...");

  try {
    // 1) Valida se o objeto selectedDestination tem lat/lon
    if (!validateDestination(selectedDestination)) {
      return; 
    }

    // 2) Tenta obter a localização atual do usuário (ou pega do global userLocation)
    if (!userLocation) {
      userLocation = await getCurrentLocation();
      if (!userLocation) {
        showNotification(getGeneralText("locationUnavailable", selectedLanguage), "error");
        return;
      }
    }

    // 3) Limpa rota anterior do mapa e notifica início da navegação
    clearCurrentRoute();
    showNotification(getGeneralText("navigationStarted", selectedLanguage), "success");

    // 4) Busca instruções de rota (já traduzidas, pois passamos `selectedLanguage`)
    const routeInstructions = await fetchRouteInstructions(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon,
      selectedLanguage
    );

    if (!routeInstructions || routeInstructions.length === 0) {
      showNotification(getGeneralText("noInstructions", selectedLanguage), "error");
      return;
    }

    // 5) Atualiza barra de progresso e exibe as primeiras instruções no modal
    progressBar.style.width = "0%";
    progressBar.textContent = `0% ${getGeneralText("complete", selectedLanguage)}`;
    updateInstructionModal(routeInstructions, 0, selectedLanguage);

    // 6) Plota a rota no mapa
    const routeData = await plotRouteOnMap(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon
    );
    if (!routeData) {
      showNotification(getGeneralText("routeError", selectedLanguage), "error");
      return;
    }

    // 7) Marca a navegação como ativa e inicializa watchers
    updateNavigationState({ instructions, currentStepIndex: 0 });
    console.log("[startNavigation] Instruções de rota recebidas:", instructions.length);


    // 8) (Opcional) Salva rota no histórico, se quiser:
    // saveRouteToHistory(routeData); 

    // 9) Inicia rastreamento do usuário (substituindo trackUserMovement())
    window.positionWatcher = navigator.geolocation.watchPosition(
      (position) => {
        // a) Se pausou, ignora updates
        if (isNavigationPaused) {
          console.log("[startNavigation] Navegação pausada — ignorando updates de posição.");
          return;
        }

        // b) Pega coords do user e atualiza
        const { latitude, longitude } = position.coords;
        userLocation = { latitude, longitude };

        // c) Gamificação: confere se chegou perto de algum parceiro 
        //    (ex.: Toca do Morcego)
        checkNearbyPartners(latitude, longitude);

        // d) Verifica se chegou no destino final
        const distanceToDest = calculateDistance(latitude, longitude, selectedDestination.lat, selectedDestination.lon);
        if (distanceToDest <= 25) {
          console.log("✅ Usuário chegou ao destino!");
          showNotification(getGeneralText("arrivedAtDestination", selectedLanguage), "success");
          endNavigation();
          return;
        }

        // e) Atualiza a navegação em tempo real (mostra instruções, lida c/ desvio etc.)
        updateRealTimeNavigation(
          latitude,
          longitude,
          routeInstructions,             // array de instruções
          selectedDestination.lat,
          selectedDestination.lon,
          selectedLanguage
        );

        // f) Se quiser uma lógica de "avançar step" quando perto do step atual:
        handleNextInstructionIfClose?.(latitude, longitude);

      },
      (error) => {
        console.error("[startNavigation] Erro no rastreamento:", error);
        showNotification(getGeneralText("trackingError", selectedLanguage), "error");
      },
      { enableHighAccuracy: true }
    );

    // 10) Exibe a barra de navegação
    showNavigationBar();

    // 11) Exibe notificação final de “navegação iniciada”
    showNotification(getGeneralText("navigationStarted", selectedLanguage), "info");
    console.log("[startNavigation] Navegação iniciada com sucesso.");
    
  } catch (error) {
    console.error("❌ [startNavigation] Erro ao iniciar navegação:", error);
    showNotification(getGeneralText("routeError", selectedLanguage), "error");
  }
}


// 23. updateNavigationProgressBar - Atualiza barra de progresso da rota - Linha 102
function updateNavigationProgressBar(progress) {
  const progressBar = document.getElementById("navigationProgressBar");
  if (!progressBar) return;

  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", progress.toString());
  console.log(`Progresso: ${progress}%`);
}


// 24. monitorUserState - Monitora o estado do usuário (parado, em movimento)
let userStateInterval = null;

function monitorUserState() {
  const watchId = startPositionTracking();

  userStateInterval = setInterval(() => {
    if (userLocation && selectedDestination?.lat && selectedDestination?.lon) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        selectedDestination.lat,
        selectedDestination.lon
      );

      if (distance > 2000) {
        console.warn("Possível desvio detectado. Recalculando rota...");
        showNotification("Verificando possível desvio de rota...", "warning");
        recalculateRoute(
          userLocation.latitude,
          userLocation.longitude,
          selectedDestination.lat,
          selectedDestination.lon
        );
      }
    }
  }, 5000); // checa a cada 5s
}


// 25. trackUserMovement - MODIFICADA: gamificação checkNearbyPartners
// ====================================================================
function trackUserMovement(destLat, destLon, routeInstructions, lang = selectedLanguage) {
  if (window.positionWatcher !== undefined) {
    console.warn("Já existe um watchPosition ativo. Evitando criação duplicada.");
    return;
  }

  isNavigationActive = true;
  instructions = routeInstructions;
  currentStepIndex = 0;

  window.positionWatcher = navigator.geolocation.watchPosition(
    (position) => {
      if (isNavigationPaused) {
        console.log("Navegação está pausada. Ignorando updates de posição.");
        return;
      }
      const { latitude, longitude } = position.coords;
      userLocation = { latitude, longitude };

      const distanceToDestination = calculateDistance(latitude, longitude, destLat, destLon);
      if (distanceToDestination <= 25) {
        console.log("Usuário chegou ao destino!");
        showNotification("Você chegou ao seu destino!", "success");
        endNavigation();
        return;
      }

      updateRealTimeNavigation(
        latitude,
        longitude,
        instructions,
        destLat,
        destLon,
        lang
      );

      handleNextInstructionIfClose?.(latitude, longitude); // se existir
    },
    (error) => {
      console.error("Erro no rastreamento de localização:", error);
      showNotification("Erro ao rastrear o usuário.", "error");
    },
    { enableHighAccuracy: true }
  );
}



// 26. fallbackToSensorNavigation - Ativa fallback se o GPS falhar
function fallbackToSensorNavigation() {
  showNotification("GPS indisponível. Ativando sensores de movimento...", "info");
  detectMotion(); // assume que detectMotion() existe
  console.log("Fallback para navegação por sensores ativado.");
}


// 27. alertGPSFailure - Alerta falha no GPS - Linha 118
function alertGPSFailure(error) {
  console.error("Falha no GPS:", error);
  showNotification("Falha no GPS. Tentando usar sensores de movimento...", "warning");
  fallbackToSensorNavigation();
}


// 28. forceOfflineMode - Ativa modo offline ao perder conexão - Linha 122
function forceOfflineMode() {
  console.warn("Conexão perdida. Iniciando modo offline.");
  showNotification("Modo offline ativado. Dados em cache serão utilizados.", "warning");
  loadDestinationsFromCache();
}


// ======================
// FEEDBACK E INTERFACE (Funções 29 - 31)
// ======================

// 29. handleUserIdleState - Detecta inatividade do usuário e pausa a navegação - Linha 126
function handleUserIdleState(lastLocation, currentLocation) {
    const distanceMoved = calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        currentLocation.latitude,
        currentLocation.longitude
    );

    if (distanceMoved < 5) {
        showNotification("Você está parado. Deseja continuar ou recalcular a rota?", "info");
    }
}

// 30. showNotification - Exibe notificações e alertas ao usuário - Linha 130
function showNotification(message, type = "info", duration = 3000) {
  if (tutorialIsActive) {
    duration = 5000;
  }

  const container = document.getElementById("notification-container");
  if (!container) {
    console.warn("❌ Container de notificações não encontrado.");
    return;
  }

  const iconMap = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `<span>${iconMap[type] || "ℹ️"}</span> ${message}`;

  container.appendChild(notification);

  if (type === "error" || type === "warning") {
    triggerHapticFeedback("recalculating");
  }

  setTimeout(() => notification.remove(), duration);
}


// 31. triggerHapticFeedback - Fornece vibração durante alertas ou navegação - Linha 134
/**
 * Gera feedback tátil (vibração) no dispositivo, se suportado.
 * @function triggerHapticFeedback
 * @param {string} [type="short"] - Tipo de vibração (por ex. "short", "long", "double").
 * @returns {void}
 *
 * APLICA MELHORIAS:
 * - Feedback visual/auditivo (2.1)
 * - Logs padronizados (6.1)
 */
function triggerHapticFeedback(type = "short") {
  if (!navigator.vibrate) {
    console.warn("[triggerHapticFeedback] Vibração não suportada neste dispositivo.");
    return;
  }

  switch(type) {
    case "long":
      navigator.vibrate([300, 100, 300]);
      break;
    case "double":
      navigator.vibrate([100, 50, 100, 50, 100]);
      break;
    default:
      // "short"
      navigator.vibrate(100);
      break;
  }

  console.log(`[triggerHapticFeedback] Vibração do tipo "${type}" executada.`);
}


// ======================
// REVALIDAÇÃO E OBSTÁCULOS (Funções 32 - 42)
// ======================

// 32. updateRealTimeNavigation - Atualiza a navegação em tempo real (turn-by-turn)
/**
 * Atualiza a navegação em tempo real, enriquecendo cada passo com detalhes sobre rua, praça ou outro logradouro.
 * @function updateRealTimeNavigation
 * @param {number} userLat - Latitude atual do usuário.
 * @param {number} userLon - Longitude atual do usuário.
 * @param {Object[]} instructions - Lista de instruções de navegação (cada objeto deve ter lat, lon, text, streetName...).
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} [lang='pt'] - Idioma desejado (pt, en, etc.).
 * @returns {void}
 *
 * CHECKLIST APLICADO:
 * - (6.1) Logs e notificações padronizados.
 * - (2.2) Efeito visual na troca de instrução (chamando animateInstructionChange()).
 * - (3.2) Se o usuário se afastar muito do destino, considerar recálculo (threshold).
 * - (1.2) Documentação clara para a função.
 * - (1.1) Separar lógica de DOM e cálculo (usamos calculateDistance para a parte de distância; showNotification e updateInstructionModal para UI).
 */
function updateRealTimeNavigation(
  userLat,
  userLon,
  instructions,
  destLat,
  destLon,
  lang = 'pt'
) {
  // 1) Verifica se há instruções
  if (!instructions || instructions.length === 0) {
    console.warn("[updateRealTimeNavigation] Nenhuma instrução para processar.");
    return;
  }

  // 2) Identifica a instrução atual a partir do estado global
  const currentStepIndex = navigationState.currentStepIndex;
  const currentStep = instructions[currentStepIndex];
  if (!currentStep) {
    console.log("[updateRealTimeNavigation] Fim das instruções ou índice fora de alcance.");
    return;
  }

  // 3) Calcula a distância até o step atual
  const distToStep = calculateDistance(
    userLat,
    userLon,
    currentStep.lat,
    currentStep.lon
  );

  // 4) Se estiver perto o suficiente, avança para a próxima instrução
  if (distToStep < 15) {
    // Avança índice
    navigationState.currentStepIndex++;

    // Efeito visual de animação (2.2)
    if (typeof animateInstructionChange === "function") {
      animateInstructionChange();
    }

    // Caso exista próximo passo, mostramos instrução detalhada
    const nextIndex = navigationState.currentStepIndex;
    const nextStep = instructions[nextIndex];
    if (nextStep) {
      const nextStepDetail = getDetailedInstructionText(nextStep, lang);
      showNotification(
        `[updateRealTimeNavigation] ${getGeneralText("instructionsTitle", lang)}: ${nextStepDetail}`,
        "info",
        3000
      );
      updateInstructionModal(instructions, nextIndex, lang);
    } else {
      // Não há mais passos (fim)
      showNotification(getGeneralText("destinationReached", lang), "success", 4000);
      console.log("[updateRealTimeNavigation] Todas as instruções concluídas.");
    }
  }

  // 5) Verifica distância até o destino para detectar possível desvio (3.2)
  const distToDest = calculateDistance(userLat, userLon, destLat, destLon);
  if (distToDest > 2000) {
    console.warn(
      `[updateRealTimeNavigation] Distância ao destino (~${distToDest.toFixed(
        0
      )}m) excedeu o threshold. Possível desvio.`
    );
    showNotification(getGeneralText("offRoute", lang), "warning", 5000);

    // Se quiser, podemos chamar recálculo automático ou exibir popup para confirmar
    // recalculateRoute(userLat, userLon, destLat, destLon, lang);
  }
}




// 33. recalculateRoute - Recalcula a rota ao detectar desvios
/**
 * Recalcula a rota quando o usuário desvia do caminho ou solicita uma rota alternativa.
 * @async
 * @function recalculateRoute
 * @param {number} userLat - Latitude atual do usuário.
 * @param {number} userLon - Longitude atual do usuário.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} [lang='pt'] - Idioma de exibição (ex.: 'pt', 'en').
 * @returns {Promise<void>}
 *
 * CHECKLIST DE MELHORIAS APLICADO:
 * - (3.2) Exibe distância do caminho original.
 * - (9.3) Oferece botões para aceitar ou ignorar o recálculo.
 * - (6.1) Logs padronizados e docstrings claras.
 */
async function recalculateRoute(userLat, userLon, destLat, destLon, lang = 'pt') {
  console.log("[recalculateRoute] Iniciando recálculo de rota...");

  try {
    // Distância ao destino (por exemplo, para exibir no popup)
    const distToDest = calculateDistance(userLat, userLon, destLat, destLon);
    console.log(`[recalculateRoute] Distância ao destino: ~${distToDest.toFixed(1)}m.`);

    // Exibe um modal ou notificação pedindo confirmação:
    // “Você se afastou aproximadamente X metros. Deseja recalcular a rota?”
    const confirmMsg = `
      ${getGeneralText("routeDeviated", lang)} 
      (~${Math.round(distToDest)}m).
      ${getGeneralText("confirmRoute", lang)}
    `;
    showNotification(confirmMsg, "warning", 10000);

    // Cria elementos de “Aceitar” / “Ignorar” para o usuário
    const recalcPopup = document.createElement("div");
    recalcPopup.className = "recalc-popup";

    recalcPopup.innerHTML = `
      <div class="recalc-popup-content">
        <h3>${getGeneralText("routeDeviated", lang)}</h3>
        <p>${getGeneralText("checkingDeviation", lang)} (~${Math.round(distToDest)}m)</p>
        <button id="accept-recalc">${getGeneralText("tutorialYes", lang) || "Sim"}</button>
        <button id="ignore-recalc">${getGeneralText("tutorialNo", lang) || "Não"}</button>
      </div>
    `;

    document.body.appendChild(recalcPopup);

    const acceptBtn = document.getElementById("accept-recalc");
    const ignoreBtn = document.getElementById("ignore-recalc");

    // Listener: caso o usuário aceite o recálculo
    acceptBtn.addEventListener("click", async () => {
      console.log("[recalculateRoute] Usuário aceitou recálculo da rota.");
      document.body.removeChild(recalcPopup);

      // 1) Obter novas instruções
      const instructions = await fetchRouteInstructions(userLat, userLon, destLat, destLon, lang);
      if (!instructions || !instructions.length) {
        console.warn("[recalculateRoute] Sem instruções na nova rota.");
        showNotification(getGeneralText("routeError", lang), "error");
        return;
      }

      // 2) Limpar a rota anterior do mapa
      clearCurrentRoute?.();
      // 3) Plota a nova rota
      await plotRouteOnMap(userLat, userLon, destLat, destLon);
      // 4) Atualiza o estado de navegação
      updateNavigationState({ 
        instructions, 
        currentStepIndex: 0 
      });

      showNotification(getGeneralText("routeRecalculatedOk", lang), "success");
      console.log("[recalculateRoute] Rota recalculada com sucesso.");
    });

    // Listener: caso o usuário ignore o recálculo
    ignoreBtn.addEventListener("click", () => {
      console.log("[recalculateRoute] Usuário ignorou recálculo. Mantendo rota anterior.");
      document.body.removeChild(recalcPopup);
      // Só exibimos alguma mensagem e mantemos a rota antiga
      showNotification(getGeneralText("userIsIdle", lang) || "Continue na rota atual.", "info", 4000);
    });

  } catch (error) {
    console.error("[recalculateRoute] Erro ao recalcular rota:", error);
    showNotification(getGeneralText("createRouteError", lang), "error");
  }
}




// 34. notifyDeviation - Notifica quando o usuário desvia da rota
function notifyDeviation() {
    showNotification('Você desviou da rota. Recalculando...', 'warning');
    // Vamos usar userLocation e selectedDestination, se disponíveis
    if (userLocation && selectedDestination && selectedDestination.lat && selectedDestination.lon) {
        recalculateRoute(
            userLocation.latitude,
            userLocation.longitude,
            selectedDestination.lat,
            selectedDestination.lon
        );
    } else {
        console.error("Não foi possível recalcular rota (coords indisponíveis).");
    }
}


// 35. validateDestination - Valida se o destino tem lat/lon
function validateDestination(destination = selectedDestination) {
    if (!destination || !destination.lat || !destination.lon) {
        showNotification('Destino inválido. Por favor, selecione outro.', 'error');
        return false;
    }
    // Se quiser, checar name:
    if (!destination.name) {
        console.warn('Destino selecionado, mas sem nome. Prosseguindo mesmo assim...');
    }

    console.log(`Destino válido: ${destination.name || 'Sem nome'}`);
    return true;
}


// 36. handleRecalculation - Lida com recalculo automático de rota - Linha 154
function handleRecalculation() {
    const userIdle = checkIfUserIdle();
    if (userIdle) {
        pauseNavigation();
    } else {
        recalculateRoute();
    }
    console.log('Recalculo de rota acionado.');
}

// 37. notifyRouteDeviation - Emite alerta de desvio de rota - Linha 158
function notifyRouteDeviation() {
    showNotification('Você está fora da rota. Ajuste seu caminho.', 'warning');
}

// 38. notifyNextInstruction - Exibe a próxima instrução de navegação - Linha 162
function notifyNextInstruction(instruction) {
  // Exemplo: usando showNotification
  showNotification(`Próxima instrução: ${instruction}`, "info");
  console.log(`Instrução exibida: ${instruction}`);
}


// 39. shouldRecalculateRoute - Verifica se a rota precisa ser recalculada (ex. via user input ou heurísticas)
function shouldRecalculateRoute() {
    // Em vez de rely em detectMotion() como boolean, podemos apenas checar alguma condição:
    if (userLocation && selectedDestination) {
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            selectedDestination.lat,
            selectedDestination.lon
        );
        // Se a distância for muito maior do que o esperado, consideramos que desviou
        if (distance > 2000) {
            console.log('Desvio grande detectado. Chama notifyDeviation().');
            notifyDeviation();
        }
    } else {
        console.warn('Não há dados de userLocation ou selectedDestination para verificar desvio.');
    }
    console.log('Verificação de recalculo de rota concluída.');
}

// 40. analyzeRouteForObstacles - Analisa a rota para detectar obstáculos (placeholder)
function analyzeRouteForObstacles(route) {
    if (!route || !route.features || !route.features[0]) {
        console.error("Dados de rota inválidos para analisar obstáculos.");
        return;
    }

    // Exemplo fictício: se a rota tiver uma property route.features[0].properties.warnings
    const warnings = route.features[0].properties?.warnings || [];
    if (warnings.length > 0) {
        showNotification('Obstáculo detectado à frente. Ajustando rota.', 'warning');
        // recalculateRoute(...) se necessário
    } else {
        console.log('Nenhum obstáculo detectado na rota (warnings vazio).');
    }
}


// 41. validateRouteData - Garante que a rota possui dados válidos (ORS)
function validateRouteData(routeData) {
    if (!routeData || !routeData.features || routeData.features.length === 0) {
        showNotification('Erro ao carregar dados da rota.', 'error');
        return false;
    }

    const coords = routeData.features[0].geometry.coordinates;
    if (!coords || coords.length === 0) {
        showNotification('Rota sem coordenadas.', 'error');
        return false;
    }

    console.log('Dados de rota válidos (features/coordinates).');
    return true;
}


// 42. startRoutePreview - Exibe uma pré-visualização da rota antes de iniciar
function startRoutePreview() {
    if (!currentRouteData) {
        showNotification("Nenhuma rota disponível para pré-visualização.", "error");
        return;
    }
    // Exibe o resumo e o botão
    displayRouteSummary(currentRouteData);
    showNotification("Pré-visualização da rota ativada.", "info");
    displayStartNavigationButton();
}


// ======================
// CONTROLE DE NAVEGAÇÃO E UI (Funções 43 - 69)
// ======================


// 43. endNavigation - Finaliza a navegação
function endNavigation() {
  isNavigationActive = false;
  isNavigationPaused = false;
  if (window.positionWatcher !== undefined) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = undefined;
  }
  if (userStateInterval !== null) {
    clearInterval(userStateInterval);
    userStateInterval = null;
  }
  clearCurrentRoute();
  clearAllMarkers();
  esconderModalInstruções();
  hideRouteSummary();
  hideAllControlButtons();
  initNavigationState();
  restoreFeatureUI(lastSelectedFeature);

  // Se não usa "lastSelectedFeature", pode comentar:
  // if (lastSelectedFeature) restoreFeatureUI(lastSelectedFeature);

  showNotification(getGeneralText("navEnded", selectedLanguage), "info");
  console.log(getGeneralText("navEnded", selectedLanguage));
}

// 44. finalizeRouteOnArrival - Conclui a rota ao chegar ao destino - Linha 186
function finalizeRouteOnArrival() {
    showNotification('Você chegou ao seu destino.', 'success');
    endNavigation();
}

// 45. pauseNavigation - Pausa a navegação em progresso - Linha 190
function pauseNavigation() {
  if (!isNavigationActive) {
    console.warn("Navegação não está ativa para ser pausada.");
    return;
  }

  isNavigationPaused = true;
  if (window.positionWatcher !== undefined) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = undefined;
  }

  showNotification("Navegação pausada.", "info");
  console.log("Navegação pausada.");
}


// 46. continueNavigation - Retoma a navegação pausada - Linha 194
function continueNavigation() {
  if (!isNavigationActive) {
    console.warn("Nenhuma navegação ativa para continuar.");
    return;
  }
  if (!isNavigationPaused) {
    console.warn("Navegação já está em andamento.");
    return;
  }

  isNavigationPaused = false;
  // Se quisermos retomar o tracking exato, podemos chamar trackUserMovement de novo
  if (selectedDestination?.lat && selectedDestination?.lon && instructions?.length) {
    trackUserMovement(
      selectedDestination.lat,
      selectedDestination.lon,
      instructions,
      selectedLanguage
    );
  }

  showNotification("Navegação retomada.", "success");
  console.log("Navegação retomada.");
}

// 47. toggleNavigationPause - Alterna entre pausar/continuar navegação - Linha 198
function toggleNavigationPause() {
  if (!isNavigationPaused) {
    pauseNavigation();
  } else {
    continueNavigation();
  }
  console.log("Estado de navegação alternado.");
}


// 48. showWelcomeMessage - Exibe a mensagem de boas-vindas na interface
function showWelcomeMessage() {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;

    modal.style.display = 'block';
    // Exemplo: habilitar botões de idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.style.pointerEvents = 'auto';
    });
}


// 49. showNavigationBar - Mostra a barra de navegação - Linha 206
function showNavigationBar() {
    const navBar = document.getElementById('navigation-bar');
    if (navBar) {
        navBar.style.display = 'block';
        console.log('Barra de navegação exibida.');
    }
}

// 50. displayRouteSummary - Exibe o resumo da rota no painel lateral
function displayRouteSummary(routeData, lang = selectedLanguage) {
  const summary = routeData.features[0].properties.summary;
  const etaMinutes = Math.round(summary.duration / 60);
  const distanceKm = (summary.distance / 1000).toFixed(2);

  // Texto do Resumo e rótulos (traduzidos)
  const routeSummaryTitle   = getGeneralText("route_summary_title", lang);
  const routeDistanceLabel  = getGeneralText("route_distance",     lang); 
  const routeEtaLabel       = getGeneralText("route_eta",          lang);
  const minutesTxt          = getGeneralText("minutes",            lang);

  // Monta HTML com as traduções
  const summaryHTML = `
    <div class="route-summary">
        <h3>${routeSummaryTitle}</h3>
        <p>🛣️ ${routeDistanceLabel} <strong>${distanceKm} km</strong></p>
        <p>⏱️ ${routeEtaLabel} <strong>${etaMinutes} ${minutesTxt}</strong></p>
    </div>
  `;

  const summaryContainer = document.getElementById("route-summary");
  if (summaryContainer) {
    summaryContainer.innerHTML = summaryHTML;
    summaryContainer.style.display = "block";
  }
}




// 51. highlightCriticalInstruction - Destaca uma instrução crítica - Linha 214
function highlightCriticalInstruction(instruction) {
    const instructionElement = document.getElementById('instruction');
    if (instructionElement) {
        instructionElement.innerHTML = `<strong>${instruction}</strong>`;
        console.log(`Instrução destacada: ${instruction}`);
    }
}

// 52. hideAllControls - Esconde todos os controles de navegação - Linha 218
function hideAllControls(hideInstructions = false) {
  // Exemplo: seleciona todos .control-btn e coloca display: none
  const controlButtons = document.querySelectorAll(".control-btn");
  controlButtons.forEach(btn => {
    btn.style.display = "none";
  });

  console.log("Botões de controle ocultados.");

  if (hideInstructions) {
    const instructionsModal = document.getElementById("navigation-instructions");
    if (instructionsModal) {
      instructionsModal.classList.add("hidden");
      console.log("Modal de instruções também ocultado.");
    }
  }
}


// 53. showRoutePreview - Exibe a pré-visualização da rota - Linha 222
function showRoutePreview(routeData) {
    const summaryContainer = document.getElementById("route-preview");
    if (!summaryContainer) {
        console.error("Elemento de pré-visualização não encontrado.");
        return;
    }

    const summary = routeData.features[0]?.properties?.summary;
    if (!summary) {
        console.error("Resumo da rota indisponível.");
        return;
    }

    const distance = (summary.distance / 1000).toFixed(2);
    const eta = Math.round(summary.duration / 60);

    summaryContainer.innerHTML = `
        <div class="route-preview-header">
            <h3>Resumo da Rota</h3>
            <p>Distância: ${distance} km</p>
            <p>Tempo estimado: ${eta} minutos</p>
        </div>
        <div class="route-preview-icons">
            <span>🚶</span>
            <span>➡️</span>
            <span>🏁</span>
        </div>
    `;

    summaryContainer.classList.remove("hidden");
}

// 54. hideRoutePreview - Esconde a pré-visualização da rota - Linha 226
function hideRoutePreview() {
    const previewContainer = document.getElementById("route-preview");
    if (!previewContainer) {
        console.error("Elemento #route-preview não encontrado.");
        return;
    }

    previewContainer.classList.add("hidden");
    previewContainer.innerHTML = "";
    console.log("Pré-visualização da rota escondida com sucesso.");
}

// 55. addDirectionArrows - Adiciona setas de direção no mapa
function addDirectionArrows(coordinates) {
    // coordinates deve ser um array do tipo [[lat, lon], [lat, lon], ...]
    coordinates.forEach(point => {
        addArrowToMap(point);
    });
    console.log('Setas de direção adicionadas ao mapa.');
}

// 56. showUserLocationPopup - Mostra a localização do usuário em um popup - Linha 234
// Cria um Popup na localização do usuário
function showUserLocationPopup(lat, lon) {
    const timestamp = new Date().toLocaleString(selectedLanguage || "pt-BR");
    const message = translations[selectedLanguage]?.youAreHere || "Você está aqui!";
    
    L.popup()
        .setLatLng([lat, lon])
        .setContent(`
            <strong>${message}</strong><br>
            Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}<br>
            ${translations[selectedLanguage]?.timestamp || "Horário"}: ${timestamp}
        `)
        .openOn(map);

    console.log("Popup da localização do usuário exibido.");
}

// 57. displayStartNavigationButton - Exibe botões de navegação e tutorial
function displayStartNavigationButton() {
    const startNavButton = document.getElementById("start-navigation-button");
    const endNavButton = document.getElementById("navigation-end-btn");
    const tutorialMenuButton = document.getElementById("tutorial-menu-btn");

    if (!startNavButton || !endNavButton || !tutorialMenuButton) {
        console.error("Um ou mais botões não foram encontrados.");
        return;
    }

    // Exibe apenas os botões necessários
    hideAllControls(); 
    startNavButton.style.display = "block";
    tutorialMenuButton.style.display = "block";
    endNavButton.style.display = "none";

    // Evento para iniciar navegação
    startNavButton.addEventListener("click", () => {
        if (!isNavigationActive) {
            startNavigation();
            isNavigationActive = true;
            startNavButton.style.display = "none";
            endNavButton.style.display = "block";
            hideRouteSummary();
        }
    });

    // Evento para encerrar navegação
    endNavButton.addEventListener("click", () => {
        endNavigation();
        isNavigationActive = false;
        startNavButton.style.display = "none";
        endNavButton.style.display = "none";
    });
}

// 58. displayStepByStepInstructions - Mostra 3 instruções passo a passo
function displayStepByStepInstructions(instructions, currentStepIndex = 0, lang = 'pt') {
  const container = document.getElementById("navigation-instructions");
  if (!container) {
    console.error("Elemento #navigation-instructions não encontrado.");
    return;
  }

  container.innerHTML = ""; // Limpa instruções anteriores

  // Exemplo: pega 3 instruções a partir do currentStepIndex
  const stepsToShow = instructions.slice(currentStepIndex, currentStepIndex + 3);
  stepsToShow.forEach((step, idx) => {
    const stepLangText = translateInstruction(step.text, lang);
    const li = document.createElement("li");
    li.className = idx === 0 ? "active-instruction" : "pending-instruction";
    li.innerHTML = `
      <span class="direction-arrow">${getDirectionIcon(step.text)}</span>
      ${stepLangText} (${step.distance} m)
    `;
    container.appendChild(li);
  });

  container.classList.remove("hidden");
  console.log("✅ Instruções passo a passo exibidas no modal.");
}


// 59. fetchNextThreeInstructions - Retorna as próximas três instruções - Linha 246
function fetchNextThreeInstructions(route) {
    return route.instructions.slice(0, 3);
}

// 60. enqueueInstruction - Enfileira uma nova instrução na UI - Linha 250
function enqueueInstruction(instruction) {
    const queue = document.getElementById('instruction-queue');
    if (queue) {
        const newInstruction = document.createElement('li');
        newInstruction.textContent = instruction;
        queue.appendChild(newInstruction);
        console.log('Instrução adicionada à fila.');
    }
}

// 61. cacheTranslatedInstructions - Salva instruções traduzidas no cache - Linha 254
function cacheTranslatedInstructions(instructions) {
    localStorage.setItem('translatedInstructions', JSON.stringify(instructions));
    console.log('Instruções traduzidas salvas em cache.');
}

// 62. generateRouteSummary - Gera um resumo textual da rota - Linha 258
function generateRouteSummary(instructions) {
    const summaryContainer = document.getElementById("route-summary");
    if (!summaryContainer) {
        console.error("Elemento de resumo não encontrado.");
        return;
    }

    summaryContainer.innerHTML = instructions
        .map(
            (step) => `
            <li>
                <span>${getDirectionIcon(step.text)}</span>
                ${step.text} (${step.distance} metros)
            </li>
        `
        )
        .join("");

    summaryContainer.classList.remove("hidden");
}

// 63. updateInstructionModal - Atualiza o modal de instruções - Linha 262
function updateInstructionModal(instructions, currentStepIndex, lang = "pt") {
  const container = document.getElementById("navigation-instructions");
  const pb = document.getElementById("progress-bar");
  if (!container) {
    console.error("❌ " + getGeneralText("instructionsMissing", lang));
    return;
  }

  container.innerHTML = "";  // limpa o conteúdo anterior

  // Exibir apenas 3 passos (opcional) a partir do currentStepIndex
  for (let i = currentStepIndex; i < currentStepIndex + 3 && i < instructions.length; i++) {
    const step = instructions[i];
    const li = document.createElement("li");
    li.className = (i === currentStepIndex)
      ? "instruction-step active-instruction"
      : "instruction-step pending-instruction";

    // Se contiver algo crítico, ex.: "turn left"
    // (já está traduzido, mas podemos ver se inclui "esquerda", "direita", etc.)
    if (step.text.toLowerCase().includes("esquerda")) {
      li.classList.add("critical-instruction");
    }

    // Montagem do HTML
    li.innerHTML = `
      <span class="direction-arrow">${getDirectionIcon(step.text)}</span>
      ${step.text} (${step.distance} m)
      ${
        step.enrichedInfo
          ? `<div class="enriched-info">🛈 ${step.enrichedInfo}</div>`
          : ""
      }
    `;
    container.appendChild(li);
  }

  // Atualizar barra de progresso
  const progressPercentage = ((currentStepIndex + 1) / instructions.length) * 100;
  if (pb) {
    pb.style.width = `${progressPercentage}%`;
    pb.textContent = `${progressPercentage.toFixed(1)}% ${getGeneralText("complete", lang)}`;
  }

  container.classList.remove("hidden");
  console.log("✅ " + getGeneralText("instructionsTitle", lang) + " (Index:", currentStepIndex, ")");
}

// 64. toggleModals - Alterna a visibilidade de modais - Linha 266
function toggleModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    });
    console.log('Modais alternados.');
}

// 65. showModal - Exibe um modal com mensagem personalizada - Linha 270
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block'; // Exibe o modal
    } else {
        console.error(`Modal com ID ${modalId} não encontrado.`);
    }
}

// 66. closeCarouselModal - Fecha o modal do carrossel - Linha 274
function closeCarouselModal() {
    const carouselModal = document.getElementById('carousel-modal');
    if (carouselModal) {
        carouselModal.style.display = 'none';
    }
}

// 67. closeAssistantModal - Fecha o modal do assistente - Linha 278
function closeAssistantModal() {
    const modal = document.getElementById('assistant-modal'); // Seleciona o modal pelo ID
    if (modal) {
        modal.style.display = 'none'; // Define o display como 'none' para ocultar o modal
        console.log('Modal do assistente fechado.'); // Log para depuração
    } else {
        console.error('Modal do assistente não encontrado.'); // Log de erro caso o modal não exista
    }
}

// 68. animateInstructionChange - Anima a troca de instruções na UI - Linha 282
function animateInstructionChange() {
    const activeStep = document.querySelector(".instruction-step.active-instruction");
    if (activeStep) {
        activeStep.classList.add("fade-in");
        setTimeout(() => activeStep.classList.remove("fade-in"), 300);
    }
}

// 69. handleSubmenuButtonsTouristSpots - Gerencia submenu de pontos turísticos - Linha 286
function handleSubmenuButtonsTouristSpots(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTouristSpots);
}


// ====================== 
// SUBMENUS E BOTÕES DE CONTROLE (Funções 70 - 80)
// ======================



// 70. handleSubmenuButtonsTour - Alterna submenu de tours - Linha 290
function handleSubmenuButtonsTours(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsBeaches);
}

// 71. handleSubmenuButtonsBeaches - Alterna submenu de praias - Linha 294
function handleSubmenuButtonsBeaches(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsBeaches);
}

// 72. handleSubmenuButtonsRestaurants - Alterna submenu de restaurantes - Linha 298
function handleSubmenuButtonsRestaurants(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsRestaurants);
}

// 73. handleSubmenuButtonsShops - Alterna submenu de lojas - Linha 302
function handleSubmenuButtonsShops(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsShops);
}

// 74. handleSubmenuButtonsEmergencies - Alterna submenu de emergências - Linha 306
function handleSubmenuButtonsEmergencies(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsEmergencies);
}

// 75. handleSubmenuButtonsEducation - Ativa submenu de educação
function handleSubmenuButtonsEducation(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsEducation);
}

// 76. handleSubmenuButtonsInns - Ativa submenu de pousadas
function handleSubmenuButtonsInns(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsInns);
}

// 77. handleSubmenuButtonsTips - Ativa submenu de dicas
function handleSubmenuButtonsTips(lat, lon, name, description) {
    handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTips);
}

// 78. showControlButtonsTouristSpots - Exibe botões de controle de pontos turísticos
function showControlButtonsTouristSpots() {
    // Primeiro, oculta todos os botões para evitar sobreposições
    hideAllControlButtons();

    // Em seguida, fecha o modal do assistente se estiver aberto
    closeAssistantModal();

    // Selecionamos cada botão pelos IDs e, se existir, exibimos
    const createRouteBtn    = document.getElementById('create-route-btn');
    const aboutMoreBtn      = document.getElementById('about-more-btn');
    const tutorialMenuBtn   = document.getElementById('tutorial-menu-btn');

    if (createRouteBtn)    createRouteBtn.style.display    = 'flex';
    if (aboutMoreBtn)      aboutMoreBtn.style.display      = 'flex';
    if (tutorialMenuBtn)   tutorialMenuBtn.style.display   = 'flex';

    console.log("Botões específicos para Pontos Turísticos exibidos com sucesso.");
}

// 79. showControlButtonsTour - Exibe botões de controle de tours
function showControlButtonsTour() {
    hideAllControlButtons();  // Garante que não haja sobreposição
    closeAssistantModal();    // Fecha o modal do assistente, se aberto

    const tourBtn          = document.getElementById('tour-btn');
    const createRouteBtn   = document.getElementById('create-route-btn');
    const aboutMoreBtn     = document.getElementById('about-more-btn');
    const tutorialMenuBtn  = document.getElementById('tutorial-menu-btn');

    if (tourBtn)           tourBtn.style.display           = 'flex';
    if (createRouteBtn)    createRouteBtn.style.display    = 'flex';
    if (aboutMoreBtn)      aboutMoreBtn.style.display      = 'flex';
    if (tutorialMenuBtn)   tutorialMenuBtn.style.display   = 'flex';

    console.log("Botões específicos para Tours exibidos com sucesso.");
}

// 80. showControlButtonsBeaches - Exibe botões de controle de praias
function showControlButtonsBeaches() {
    hideAllControlButtons();
    closeAssistantModal();

    // Observação: a função original definia "reserve-chairs-btn" como 'none'
    // caso queira exibir esse botão, basta remover ou ajustar conforme necessidade
    const reserveChairsBtn  = document.getElementById('reserve-chairs-btn');
    const createRouteBtn    = document.getElementById('create-route-btn');
    const aboutMoreBtn      = document.getElementById('about-more-btn');
    const tutorialMenuBtn   = document.getElementById('tutorial-menu-btn');

    if (reserveChairsBtn)  reserveChairsBtn.style.display  = 'none';
    if (createRouteBtn)    createRouteBtn.style.display    = 'flex';
    if (aboutMoreBtn)      aboutMoreBtn.style.display      = 'flex';
    if (tutorialMenuBtn)   tutorialMenuBtn.style.display   = 'flex';

    console.log("Botões específicos para Praias exibidos com sucesso.");
}

// 81. showControlButtonsNightlife - Exibe botões de controle específicos para eventos noturnos
function showControlButtonsNightlife() {
    hideAllControlButtons();
    closeAssistantModal();

    const createRouteBtn    = document.getElementById('create-route-btn');
    const aboutMoreBtn      = document.getElementById('about-more-btn');
    const tutorialMenuBtn   = document.getElementById('tutorial-menu-btn');
    const buyTicketBtn      = document.getElementById('buy-ticket-btn');

    if (createRouteBtn)    createRouteBtn.style.display    = 'flex';
    if (aboutMoreBtn)      aboutMoreBtn.style.display      = 'flex';
    if (tutorialMenuBtn)   tutorialMenuBtn.style.display   = 'flex';
    if (buyTicketBtn)      buyTicketBtn.style.display      = 'flex';

    console.log("Botões específicos para Vida Noturna (Nightlife) exibidos com sucesso.");
}

// 82. showControlButtonsRestaurants - Exibe botões de controle de restaurantes
function showControlButtonsRestaurants() {
    hideAllControlButtons();
    closeAssistantModal();

    const createRouteBtn         = document.getElementById('create-route-btn');
    const aboutMoreBtn           = document.getElementById('about-more-btn');
    const tutorialMenuBtn        = document.getElementById('tutorial-menu-btn');
    const reserveRestaurantsBtn  = document.getElementById('reserve-restaurants-btn');

    if (createRouteBtn)         createRouteBtn.style.display         = 'flex';
    if (aboutMoreBtn)           aboutMoreBtn.style.display           = 'flex';
    if (tutorialMenuBtn)        tutorialMenuBtn.style.display        = 'flex';
    if (reserveRestaurantsBtn)  reserveRestaurantsBtn.style.display  = 'flex';

    console.log("Botões específicos para Restaurantes exibidos com sucesso.");
}


// 83. showControlButtonsShops - Exibe botões de controle de lojas
function showControlButtonsShops() {
    hideAllControlButtons();
    closeAssistantModal();

    const createRouteBtn       = document.getElementById('create-route-btn');
    const aboutMoreBtn         = document.getElementById('about-more-btn');
    const speakAttendentBtn    = document.getElementById('speak-attendent-btn');
    const tutorialMenuBtn      = document.getElementById('tutorial-menu-btn');

    if (createRouteBtn)       createRouteBtn.style.display       = 'flex';
    if (aboutMoreBtn)         aboutMoreBtn.style.display         = 'flex';
    if (speakAttendentBtn)    speakAttendentBtn.style.display    = 'flex';
    if (tutorialMenuBtn)      tutorialMenuBtn.style.display      = 'flex';

    console.log("Botões específicos para Lojas exibidos com sucesso.");
}


// 84. showControlButtonsEmergencies - Exibe botões de controle de emergências
function showControlButtonsEmergencies() {
    hideAllControlButtons();
    closeAssistantModal();

    const createRouteBtn  = document.getElementById('create-route-btn');
    const aboutMoreBtn    = document.getElementById('about-more-btn');
    const callBtn         = document.getElementById('call-btn');
    const tutorialMenuBtn = document.getElementById('tutorial-menu-btn');

    if (createRouteBtn)  createRouteBtn.style.display  = 'flex';
    if (aboutMoreBtn)    aboutMoreBtn.style.display    = 'flex';
    if (callBtn)         callBtn.style.display         = 'flex';
    if (tutorialMenuBtn) tutorialMenuBtn.style.display = 'flex';

    console.log("Botões específicos para Emergências exibidos com sucesso.");
}

// 85. showControlButtonsTips - Exibe botões de controle específicos para dicas
function showControlButtonsTips() {
    hideAllControlButtons();
    closeAssistantModal();

    // No código original, 'about-more-btn' ficava como 'none'
    const aboutMoreBtn      = document.getElementById('about-more-btn');
    const tutorialMenuBtn   = document.getElementById('tutorial-menu-btn');

    if (aboutMoreBtn)      aboutMoreBtn.style.display      = 'none';
    if (tutorialMenuBtn)   tutorialMenuBtn.style.display   = 'flex';

    console.log("Botões específicos para Dicas exibidos com sucesso.");
}

function showControlButtonsInns() {
    hideAllControlButtons();
    closeAssistantModal();

    // Observação: a função original definia "reserve-chairs-btn" como 'none'
    // caso queira exibir esse botão, basta remover ou ajustar conforme necessidade
    const reserveInnsBtn  = document.getElementById('reserve-inns-btn');
    const createRouteBtn    = document.getElementById('create-route-btn');
    const aboutMoreBtn      = document.getElementById('about-more-btn');
    const tutorialMenuBtn   = document.getElementById('tutorial-menu-btn');

    if (reserveInnsBtn)  reserveInnsBtn.style.display  = 'none';
    if (createRouteBtn)    createRouteBtn.style.display    = 'flex';
    if (aboutMoreBtn)      aboutMoreBtn.style.display      = 'flex';
    if (tutorialMenuBtn)   tutorialMenuBtn.style.display   = 'flex';

    console.log("Botões específicos para Praias exibidos com sucesso.");
}

// ======================
// VOZ E INTERAÇÃO (Funções 81 - 91)
// ======================

// 81. startVoiceRecognition - Inicia reconhecimento de voz - Linha 334
function startVoiceRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = selectedLanguage || 'pt-BR';
    recognition.start();

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        interpretCommand(command);
        console.log('Comando reconhecido:', command);
    };

    recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        showNotification('Erro ao processar comando de voz.', 'error');
    };
}

// 82. visualizeVoiceCapture - Visualiza captação de voz (animação do ícone) - Linha 338
function visualizeVoiceCapture() {
    const micIcon = document.getElementById('mic-icon');
    if (micIcon) {
        micIcon.classList.add('listening');
        setTimeout(() => {
            micIcon.classList.remove('listening');
        }, 3000);
        console.log('Visualização de captação de voz ativada.');
    }
}

// 83. interpretCommand - Interpreta o comando de voz recebido - Linha 342
function interpretCommand(command) {
    command = command.toLowerCase();

    if (command.includes('praia')) {
        handleSubmenuButtonsBeaches();
    } else if (command.includes('restaurante')) {
        handleSubmenuButtonsRestaurants();
    } else if (command.includes('tour')) {
        handleSubmenuButtonsTour();
    } else {
        showNotification('Comando não reconhecido. Tente novamente.', 'warning');
    }
}

// 84. confirmCommandFeedback - Fornece feedback sobre o comando recebido - Linha 346
function confirmCommandFeedback(command) {
    showNotification(`Você disse: ${command}`, 'info');
}

// 85. confirmAudioCommand - Confirma execução do comando de voz - Linha 350
function confirmAudioCommand() {
    showNotification('Comando recebido. Processando...');
    visualizeVoiceCapture();
}

// 86. detectPOI - Detecta pontos de interesse próximos - Linha 354
function detectPOI() {
    const poiList = ['Praia do Encanto', 'Restaurante Raízes', 'Museu Histórico'];
    displayPOIInAR(poiList);
    console.log('POIs detectados:', poiList);
}

// 87. validatePOIResults - Valida resultados de POIs detectados - Linha 358
function validatePOIResults(poiList) {
    return poiList && poiList.length > 0 ? poiList : ['Nenhum ponto encontrado.'];
}

// 88. displayPOIInAR - Exibe pontos de interesse em AR (Realidade Aumentada) - Linha 362
function displayPOIInAR(poiList) {
    const arContainer = document.getElementById('ar-container');
    if (arContainer) {
        arContainer.innerHTML = '';
        poiList.forEach(poi => {
            const div = document.createElement('div');
            div.className = 'ar-item';
            div.textContent = poi;
            arContainer.appendChild(div);
        });
        console.log('POIs exibidos em AR:', poiList);
    }
}

// 89. integrateMultimodalRoute - Integra rotas de diferentes modais - Linha 366
function integrateMultimodalRoute() {
    showNotification('Integrando diferentes rotas...');
    recalculateRoute();
}

// 90. retryVoiceRecognition - Recomeça o reconhecimento de voz após erro - Linha 370
function retryVoiceRecognition() {
    showNotification('Tentando reconhecimento de voz novamente...');
    startVoiceRecognition();
}

// 91. cancelVoiceRecognition - Cancela o reconhecimento de voz em andamento - Linha 374
function cancelVoiceRecognition() {
    showNotification('Reconhecimento de voz cancelado.');
}

// ======================
// CACHE E PERSISTÊNCIA (Funções 92 - 99)
// ======================

// 93. cachePOIs - Armazena pontos de interesse no cache local - Linha 374
function cachePOIs(poiList) {
    if (!poiList || poiList.length === 0) {
        showNotification('Nenhum ponto de interesse para salvar.', 'warning');
        return;
    }

    localStorage.setItem('cachedPOIs', JSON.stringify(poiList));
    showNotification('Pontos de interesse salvos em cache.', 'success');
    console.log('POIs armazenados:', poiList);
}

// 94. forcePOICacheRefresh - Força atualização do cache de POIs - Linha 378
function forcePOICacheRefresh() {
    localStorage.removeItem('cachedPOIs');
    showNotification('Cache de POIs atualizado.', 'success');
    detectPOI();
}

// 95. loadDestinationsFromCache - Carrega destinos salvos do cache - Linha 382
function loadDestinationsFromCache(callback) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            command: 'loadDestinations',
        });
        navigator.serviceWorker.onmessage = (event) => {
            if (event.data.command === 'destinationsLoaded') {
                callback(event.data.data);
            }
        };
    } else {
        console.error('Service worker não está ativo.');
    }
}

// 96. saveNavigationState - Salva o estado atual de navegação - Linha 386
function saveNavigationState(state) {
    if (!state) {
        console.warn('Nenhum estado de navegação para salvar.');
        return;
    }
    
    sessionStorage.setItem('navState', JSON.stringify(state));
    showNotification('Estado de navegação salvo.', 'success');
    console.log('Estado salvo:', state);
}

// 97. restoreNavigationState - Restaura o estado de navegação salvo - Linha 390
function restoreNavigationState() {
    const state = sessionStorage.getItem('navState');
    if (state) {
        const navState = JSON.parse(state);
        startNavigation(navState);
        showNotification('Estado de navegação restaurado.', 'info');
    } else {
        showNotification('Nenhum estado de navegação encontrado.', 'warning');
    }
}

// 98. saveStateToServiceWorker - Salva estado de navegação no Service Worker - Linha 394
function saveStateToServiceWorker() {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            action: 'saveState',
            payload: {
                userPosition,
                selectedDestination,
                instructions: currentInstructions,
            },
        });
    } else {
        console.error('Service Worker não está ativo.');
    }
}

// 99. autoRestoreState - Restaura automaticamente estado salvo do Service Worker - Linha 398
function autoRestoreState() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'RESTORE_STATE'
        });
        console.log('Tentando restaurar estado automaticamente.');
    } else {
        showNotification('Service Worker não disponível para restauração automática.', 'warning');
    }
}

// 100. restoreState - Restaura estado completo do sistema - Linha 402
function restoreState(state) {
    if (!state) {
        console.log('Nenhum estado para restaurar.');
        return;
    }

    console.log('Restaurando estado:', state);

    // Restaura o destino selecionado
    if (state.selectedDestination) {
        selectedDestination = state.selectedDestination;
        adjustMapWithLocation();
    }

    // Restaura as instruções da rota
    if (state.instructions) {
        displayStepByStepInstructions(state.instructions, 0);
    }

    // Restaura a localização do usuário
    if (state.userPosition) {
        updateUserPositionOnMap(state.userPosition);
    }

    document.getElementById("continue-navigation-btn").addEventListener("click", () => {
    navigator.serviceWorker.controller.postMessage({ action: 'getState' });
    document.getElementById("recovery-modal").classList.add("hidden");
});

document.getElementById("start-new-navigation-btn").addEventListener("click", () => {
    clearNavigationState();
    document.getElementById("recovery-modal").classList.add("hidden");
});

}

// ========== TUTORIAL E ASSISTENTE VIRTUAL (Funções 100 - 108) ==========  

// 100. startTutorial - Inicia o tutorial interativo
function startTutorial() {
    tutorialIsActive = true;
    currentStep = 0; // começa do passo 0
    showTutorialStep('start-tutorial'); // exibe a primeiríssima tela
}


// 102. Finaliza o tutorial
// Limpa o estado e notifica o usuário
function endTutorial() {
    tutorialIsActive = false;
    currentStep = null;
    hideAllControlButtons(); // Oculta os botões do tutorial
    hideAssistantModal();
}

// 103. Função para avançar para o próximo passo do tutorial
function nextTutorialStep() {
    if (currentStep < tutorialSteps.length - 1) {
        currentStep++;
        showTutorialStep(tutorialSteps[currentStep].step); // Mostra o próximo passo
    } else {
        endTutorial(); // Finaliza o tutorial se for o último passo
    }
}

// 104. Retrocede para o passo anterior do tutorial
function previousTutorialStep(currentStep) {
    const currentIndex = tutorialSteps.findIndex(step => step.step === currentStep);
    if (currentIndex > 0) {
        const previousStep = tutorialSteps[currentIndex - 1];
        showTutorialStep(previousStep.step);
    }
}

// 105. showTutorialStep - Exibe o conteúdo de um passo específico do tutorial
function showTutorialStep(step) {
    const stepConfig = tutorialSteps.find(s => s.step === step);
    if (!stepConfig) {
        console.error(`Passo ${step} não encontrado.`);
        return;
    }

    const { message, action } = stepConfig;

    // Atualiza o modal do assistente com a mensagem no idioma certo
    updateAssistantModalContent(step, message[selectedLanguage]);
    hideAllControlButtons();   // para evitar poluição da tela
    hideRouteSummary();
    hideRoutePreview();

    if (action) action(); // executa a ação atrelada a este passo
}


// 106. Remove destaques
function removeExistingHighlights() {
    document.querySelectorAll('.arrow-highlight').forEach(el => el.remove());
    document.querySelectorAll('.circle-highlight').forEach(el => el.remove());
}

// 107. Atualiza o conteúdo do modal de assistência
// Adapta o texto e os elementos exibidos para o contexto atual
function updateAssistantModalContent(step, content) {
    const modalContent = document.querySelector('#assistant-modal .modal-content');
    if (!modalContent) {
        console.error('Elemento de conteúdo do modal não encontrado.');
        return;
   
    } else {
        // Atualiza o conteúdo padrão para outros passos
        modalContent.innerHTML = `<p>${content}</p>`;
    }

    // Exibe o modal
    document.getElementById('assistant-modal').style.display = 'block';

}

// Passos do tutorial
const tutorialSteps = [
    {
        step: 'start-tutorial',
        message: {
            pt: "Sua aventura inesquecível em Morro de São Paulo começa aqui!",
            es: "¡Tu aventura inolvidable en Morro de São Paulo comienza aquí!",
            en: "Your unforgettable adventure in Morro de São Paulo starts here!",
            he: "ההרפתקה הבלתי נשכחת שלך במורו דה סאו פאולו מתחילה כאן!"
        },
        action: () => {
            showButtons(['tutorial-iniciar-btn']);
        }
    },
    {
        step: 'ask-interest',
        message: {
            pt: "O que você está procurando em Morro de São Paulo? Escolha uma das opções abaixo.",
            es: "¿Qué estás buscando en Morro de São Paulo? Elige una de las opciones a continuación.",
            en: "What are you looking for in Morro de São Paulo? Choose one of the options below.",
            he: "מה אתה מחפש במורו דה סאו פאולו? בחר אחת מהאפשרויות הבאות."
        },
        action: () => {
            showButtons(['pontos-turisticos-btn', 'passeios-btn', 'praias-btn', 'festas-btn', 'restaurantes-btn', 'pousadas-btn', 'lojas-btn', 'emergencias-btn']);
            clearAllMarkers();
            closeSideMenu();
        }
    },
    ...generateInterestSteps(),
    {
        step: 'end-tutorial',
        message: {
            pt: "Parabéns! Você concluiu o tutorial! Aproveite para explorar todas as funcionalidades disponíveis.",
            es: "¡Felicidades! Has completado el tutorial. Disfruta explorando todas las funciones disponibles.",
            en: "Congratulations! You have completed the tutorial! Enjoy exploring all the available features.",
            he: "מזל טוב! סיימת את המדריך! תהנה מחקר כל התכונות הזמינות."
        },
        action: () => {
            showButtons(['tutorial-end-btn']);
        }
    }
];


// 108. Função para armazenar respostas e prosseguir para o próximo passo
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

// 109. Gera os passos personalizados com base nos interesses e adiciona o passo "submenu-example"
function generateInterestSteps() {
    const interests = [
        { 
            id: 'pousadas', 
            label: "Pousadas", 
            message: {
                pt: "Encontre as melhores pousadas para sua estadia.",
                es: "Encuentra las mejores posadas para tu estadía.",
                en: "Find the best inns for your stay.",
                he: "מצא את הפוסאדות הטובות ביותר לשהותך."
            }
        },
        { 
            id: 'pontos-turisticos', 
            label: "Pontos Turísticos", 
            message: {
                pt: "Descubra os pontos turísticos mais populares.",
                es: "Descubre los puntos turísticos más populares.",
                en: "Discover the most popular tourist attractions.",
                he: "גלה את האטרקציות התיירותיות הפופולריות ביותר."
            }
        },
        { 
            id: 'praias', 
            label: "Praias", 
            message: {
                pt: "Explore as praias mais belas de Morro de São Paulo.",
                es: "Explora las playas más hermosas de Morro de São Paulo.",
                en: "Explore the most beautiful beaches of Morro de São Paulo.",
                he: "גלה את החופים היפים ביותר במורו דה סאו פאולו."
            }
        },
        { 
            id: 'passeios', 
            label: "Passeios", 
            message: {
                pt: "Veja passeios disponíveis e opções de reserva.",
                es: "Consulta los paseos disponibles y las opciones de reserva.",
                en: "See available tours and booking options.",
                he: "צפה בטיולים זמינים ואפשרויות הזמנה."
            }
        },
        { 
            id: 'restaurantes', 
            label: "Restaurantes", 
            message: {
                pt: "Descubra os melhores restaurantes da região.",
                es: "Descubre los mejores restaurantes de la región.",
                en: "Discover the best restaurants in the area.",
                he: "גלה את המסעדות הטובות ביותר באזור."
            }
        },
        { 
            id: 'festas', 
            label: "Festas", 
            message: {
                pt: "Saiba sobre festas e eventos disponíveis.",
                es: "Infórmate sobre fiestas y eventos disponibles.",
                en: "Learn about available parties and events.",
                he: "גלה מסיבות ואירועים זמינים."
            }
        },
        { 
            id: 'lojas', 
            label: "Lojas", 
            message: {
                pt: "Encontre lojas locais para suas compras.",
                es: "Encuentra tiendas locales para tus compras.",
                en: "Find local shops for your purchases.",
                he: "מצא חנויות מקומיות לקניות שלך."
            }
        },
        { 
            id: 'emergencias', 
            label: "Emergências", 
            message: {
                pt: "Informações úteis para situações de emergência.",
                es: "Información útil para situaciones de emergencia.",
                en: "Useful information for emergency situations.",
                he: "מידע שימושי למצבי חירום."
            }
        }
    ];

    // Mapeia os interesses e adiciona o passo "submenu-example"
    const steps = interests.flatMap(interest => [
        {
            step: interest.id,
            element: `.menu-btn[data-feature="${interest.id}"]`,
            message: interest.message,
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
                es: "Elige una opción del submenú para continuar.",
                en: "Choose an option from the submenu to proceed.",
                he: "בחר אפשרות מתפריט המשנה כדי להמשיך."
            },
            action: () => {
                const submenu = document.querySelector('.submenu');
                if (submenu) {
                    submenu.style.display = 'block'; // Exibe o submenu
                }
                setupSubmenuListeners();
                endTutorial(); // Configura os listeners para fechar o modal
            }
        }
    ]);

    return steps;
}

// ========== ROTA E INTERAÇÃO (Funções 109 - 117) ==========  

// 109. addInteractiveArrowsOnRoute - Adiciona setas interativas ao longo da rota
function addInteractiveArrowsOnRoute(route) {
    if (!map || !route || route.length < 2) {
        console.error('Mapa não inicializado ou rota inválida.');
        return;
    }

    // Remove setas existentes, se houver
    if (window.routeArrows) {
        map.removeLayer(window.routeArrows);
    }

    // Cria decorador para desenhar setas ao longo da rota
    const arrowDecorator = L.polylineDecorator(
        L.polyline(route, { color: 'transparent' }).addTo(map), {
            patterns: [
                {
                    offset: '10%',   // Espaçamento inicial
                    repeat: '30px',  // Repetição das setas ao longo da rota
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        polygon: false,
                        pathOptions: { stroke: true, color: '#007bff', weight: 2 }
                    })
                }
            ]
        }
    );

    // Adiciona ao mapa e armazena referência
    window.routeArrows = arrowDecorator.addTo(map);

    console.log('Setas interativas adicionadas à rota.');
}

// 110. animateMapToLocation - Move o mapa com animação suave até a localização
function animateMapToLocation(lat, lon, zoom = 15) {
    if (!map) {
        console.error("Mapa não inicializado.");
        return;
    }
    map.flyTo([lat, lon], zoom, {
        animate: true,
        duration: 1.5 // Duração da animação em segundos
    });
    console.log(`Mapa animado para localização: [${lat}, ${lon}] com zoom ${zoom}`);
}

// 111. calculateETA - Estima o tempo de chegada com base na distância e velocidade média
function calculateETA(lat1, lon1, lat2, lon2, averageSpeed = 50) {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);  // Distância em metros
    if (distance <= 0 || averageSpeed <= 0) {
        console.warn("Distância ou velocidade inválida para cálculo de ETA.");
        return "N/A";
    }

    const timeInHours = distance / 1000 / averageSpeed;  // Tempo em horas
    const timeInMinutes = Math.round(timeInHours * 60);  // Converte para minutos

    console.log(`ETA calculado: ${timeInMinutes} minutos para ${distance / 1000} km.`);
    return `${timeInMinutes} min`;
}


// 112. Verifica conquistas baseadas no histórico do usuário
function checkAchievements() {
    if (searchHistory.includes('praias') && searchHistory.includes('restaurantes')) {
        showNotification('Você desbloqueou a conquista: Explorador Urbano!', 'success');
    }
}

// 113. checkIfUserIdle - Verifica se o usuário está inativo com base em interações
function checkIfUserIdle(timeout = 300000) {  // 5 minutos
    let idleTimer;

    const resetTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            showNotification('Você está inativo. Navegação pausada automaticamente.', 'warning');
            pauseNavigation();
        }, timeout);
    };

    // Reseta o timer em qualquer evento de interação
    ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        window.addEventListener(event, resetTimer);
    });

    // Inicia o timer ao carregar
    resetTimer();
    console.log('Monitoramento de inatividade iniciado.');
}


// 114. checkIfUserIsOnRoad - Verifica se o usuário está em uma estrada usando Reverse Geocoding
async function checkIfUserIsOnRoad() {
    try {
        const location = await getCurrentLocation();
        const { latitude, longitude } = location;

        // Faz uma requisição à API do OpenStreetMap para obter informações do local
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();

        // Verifica se o tipo de local é "road" (rua ou estrada)
        if (data && data.address && data.address.road) {
            console.log('Usuário está em uma estrada:', data.address.road);
            return true;
        } else {
            console.log('Usuário não está em uma estrada.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar se o usuário está na estrada:', error);
        showNotification('Falha ao detectar localização atual.', 'error');
        return false;
    }
}

// 115. Remove todos os filhos de um elemento
// Útil para limpar listas, submenus ou contêineres dinâmicos
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
} 

// 116. Limpa o estado atual da navegação
function clearNavigationState() {
    console.log("Limpando estado global da navegação...");

    if (window.navigationWatchId) {
        navigator.geolocation.clearWatch(window.navigationWatchId);
        window.navigationWatchId = null;
    }

    window.currentRoute = null;
    window.userLocationMarker = null;
    window.markers = [];

    console.log("Estado da navegação limpo.");
}

// 117. closeSideMenu Fecha o menu lateral
function closeSideMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = 'none';
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    restoreModalAndControlsStyles();
    currentSubMenu = null;
}


// 118. collectInterestData - Coleta dados de interesse do usuário
function collectInterestData() {
    console.log('Collecting interest data to create a custom route...');
}

//119. Recalcula a rota se o usuário sair da trajetória original
async function handleRouteDeviation(userLat, userLon, destLat, destLon, lang = selectedLanguage) {
    try {
        showNotification(getGeneralText("recalculatingRoute", lang), "warning");
        giveVoiceFeedback(getGeneralText("offRoute", lang));

        const instructions = await fetchRouteInstructions(userLat, userLon, destLat, destLon, lang);

        if (instructions.length === 0) {
            showNotification(getGeneralText("routeError", lang), "error");
            return;
        }

        updateInstructionModal(instructions, 0, lang);
        drawPath(userLat, userLon, instructions, lang);
        startPositionTracking((updatedLocation) => {
            updateRealTimeNavigation(
                updatedLocation.latitude,
                updatedLocation.longitude,
                instructions,
                destLat,
                destLon,
                lang
            );
        });

        console.log("✅ Rota recalculada com sucesso.");
    } catch (error) {
        console.error("Erro ao recalcular rota:", error.message);
        showNotification(getGeneralText("fetchingInstructionsError", lang), "error");
    }
}

// 116. checkIfUserIsOnRoad - Verifica se o usuário está em uma estrada
async function checkIfUserIsOnRoad(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.address && data.address.road) {
            console.log(`Usuário está na estrada: ${data.address.road}`);
            return true;
        } else {
            console.log("Usuário fora da estrada.");
            return false;
        }
    } catch (error) {
        console.error("Erro ao verificar se o usuário está na estrada:", error);
        return false;
    }
}

// 119. createRouteToDestination - Cria rota até um destino no mapa
async function createRouteToDestination(lat, lon, lang = selectedLanguage) {
    if (!userCurrentLocation) {
        showNotification(getGeneralText("locationUnavailable", lang), "error");
        return null;
    }

    try {
        // Prepara o mapa para uma nova rota
        prepareMapForNewRoute();
        showNotification(getGeneralText("calculatingRoute", lang), "info", 3000);

        // Traça a rota e obtém dados da API
        const routeData = await plotRouteOnMap(
            userCurrentLocation.latitude,
            userCurrentLocation.longitude,
            lat,
            lon
        );

        if (!routeData) {
            showNotification(getGeneralText("routeNotFound", lang), "error");
            return null;
        }

        // Busca instruções de navegação
        const instructions = await fetchRouteInstructions(
            userCurrentLocation.latitude,
            userCurrentLocation.longitude,
            lat,
            lon,
            lang
        );

        if (!instructions || instructions.length === 0) {
            showNotification(getGeneralText("noInstructionsAvailable", lang), "error");
            return null;
        }

        // Atualiza o modal com as instruções da rota
        updateInstructionModal(instructions, 0, lang);
        drawPath(userCurrentLocation.latitude, userCurrentLocation.longitude, instructions, lang);

        // Iniciar o rastreamento do movimento do usuário
        trackUserMovement((location) => {
            updateRealTimeNavigation(
                location.latitude,
                location.longitude,
                instructions,
                lat,
                lon,
                lang
            );
        });

        // Notificação de sucesso
        showNotification(getGeneralText("routePlotted", lang), "success");
        return { routeData, instructions };
    } catch (error) {
        console.error(getGeneralText("createRouteError", lang), error.message);
        showNotification(getGeneralText("createRouteError", lang), "error");
        return null;
    }
}

//119.1 Função para iniciar a criação de rota até o destino selecionado
async function createRoute(userLocation) {
    try {
        validateDestination();

        const routeData = await plotRouteOnMap(
            userLocation.latitude,
            userLocation.longitude,
            selectedDestination.lat,
            selectedDestination.lon
        );

        if (!routeData) {
            showNotification("Erro ao calcular rota. Tente novamente.", "error");
            return null;
        }

        // Finaliza marcadores e exibe o resumo da rota
        finalizeRouteMarkers(userLocation.latitude, userLocation.longitude, selectedDestination);
        displayRouteSummary(routeData);

        return routeData;
    } catch (error) {
        console.error("Erro ao criar rota:", error);
        showNotification("Erro ao criar rota. Verifique sua conexão e tente novamente.", "error");
        return null;
    }
}

// 120. customIcon - Cria ícones personalizados para navegação
function customIcon() {
    return L.icon({
        iconUrl: "images/user-icon.png",
        iconSize: [25, 25],
        iconAnchor: [12, 12],
    });
}

// 121. customizeOSMPopup - Personaliza o popup dos marcadores do OSM
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

// 122. debouncedUpdate - Evita múltiplas chamadas repetidas de uma função
function debouncedUpdate(userLat, userLon, destLat, destLon, debounceTime = 1000) {
    if (!userLat || !userLon || !destLat || !destLon) {
        console.error("Coordenadas inválidas fornecidas para atualização.");
        return;
    }

    if (gpsUpdateTimeout) clearTimeout(gpsUpdateTimeout);

    gpsUpdateTimeout = setTimeout(() => {
        updateUserPositionOnRoute(userLat, userLon, destLat, destLon);
        console.log("Atualização da posição do usuário concluída após debounce.");
    }, debounceTime);
}

// 123. destroyCarousel - Remove o carrossel de imagens do DOM
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


// 124. determineUserState - Determina o estado atual do usuário (em movimento ou parado)
function determineUserState(currentLocation, previousLocation) {
    const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        previousLocation.latitude,
        previousLocation.longitude
    );

    if (distance < 5) return "stopped"; // Usuário parado
    if (distance > 100) return "off-route"; // Fora da rota
    return "moving"; // Em movimento
}

// 125. displayCustomAbout - Exibe informações personalizadas sobre o local
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

    // Limpa o submenu e cria botões para cada item
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

        // Configura o evento de clique para cada botão
        btn.onclick = () => {
            handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], 'sobre');
        };
        subMenu.appendChild(btn);

        // Adiciona marcadores no mapa para cada item
        const marker = L.marker([item.lat, item.lon]).addTo(map).bindPopup(`<b>${item.name}</b><br>${item.description}`);
        markers.push(marker);
    });
}

// 126. displayCustomBeaches - Mostra praias na interface do usuário
function displayCustomBeaches() {
    fetchOSMData(queries['beaches-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'beaches-submenu', 'praias');
        }
    });
}

// ========== EXIBIÇÃO DE INTERESSES E LOCAIS (Funções 127 - 136) ==========  

// 127. displayCustomEducation - Exibe pontos educacionais
function displayCustomEducation() {
    const educationItems = [
        { name: "Iniciar Tutorial", lat: -13.3766787, lon: -38.9172057, description: "Comece aqui para aprender a usar o site." },
        { name: "Planejar Viagem com IA", lat: -13.3766787, lon: -38.9172057, description: "Planeje sua viagem com a ajuda de inteligência artificial." },
        { name: "Falar com IA", lat: -13.3766787, lon: -38.9172057, description: "Converse com nosso assistente virtual." },
        { name: "Falar com Suporte", lat: -13.3766787, lon: -38.9172057, description: "Entre em contato com o suporte." },
        { name: "Configurações", lat: -13.3766787, lon: -38.9172057, description: "Ajuste as configurações do site." }
    ];

    // Verifica se o submenu existe
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

        // Configura o evento de clique para cada botão
        btn.onclick = () => {
            handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], 'ensino');
        };
        subMenu.appendChild(btn);

        // Adiciona marcadores no mapa para cada item
        const marker = L.marker([item.lat, item.lon]).addTo(map).bindPopup(`<b>${item.name}</b><br>${item.description}`);
        markers.push(marker);
    });
}

// 128. displayCustomEmergencies - Exibe informações de emergência
function displayCustomEmergencies() {
    const emergencies = [
        { name: "Ambulância", lat: -13.3773, lon: -38.9171, description: "Serviço de ambulância disponível 24 horas para emergências. Contate pelo número: +55 75-99894-5017." },
        { name: "Unidade de Saúde", lat: -13.3773, lon: -38.9171, description: "Unidade de saúde local oferecendo cuidados médicos essenciais. Contato: +55 75-3652-1798." },
        { name: "Polícia Civil", lat: -13.3775, lon: -38.9150, description: "Delegacia da Polícia Civil pronta para assisti-lo em situações de emergência e segurança. Contato: +55 75-3652-1645." },
        { name: "Polícia Militar", lat: -13.3775, lon: -38.9150, description: "Posto da Polícia Militar disponível para garantir a sua segurança. Contato: +55 75-99925-0856." }
    ];

    // Criação de itens e marcadores para o submenu
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

// 129. displayCustomInns - Exibe informações de pousadas na interface
function displayCustomInns() {
    fetchOSMData(queries['inns-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'inns-submenu', 'pousadas');
        }
    });
}

// 130. displayCustomItems - Mostra itens personalizados
function displayCustomItems(items, subMenuId, feature) {
    // 1. Limpa o conteúdo atual do submenu
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = '';

    // 2. Itera sobre os itens e cria botões dinamicamente
    items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'submenu-item submenu-button';
        btn.textContent = item.name;
        btn.setAttribute('data-lat', item.lat); // Latitude do item
        btn.setAttribute('data-lon', item.lon); // Longitude do item
        btn.setAttribute('data-name', item.name); // Nome do item
        btn.setAttribute('data-description', item.description); // Descrição do item
        btn.setAttribute('data-feature', feature); // Funcionalidade associada
        btn.setAttribute('data-destination', item.name); // Destino do item

        // 3. Configura o evento de clique para o botão
        btn.onclick = () => {
            handleSubmenuButtons(
                item.lat, // Latitude
                item.lon, // Longitude
                item.name, // Nome
                item.description, // Descrição
                [], // Outros dados adicionais
                feature // Funcionalidade
            );
        };

        subMenu.appendChild(btn); // Adiciona o botão ao submenu

        // 4. Adiciona marcadores ao mapa e configura o pop-up
        const marker = L.marker([item.lat, item.lon]).addTo(map)
            .bindPopup(`<b>${item.name}</b><br>${item.description}`);
        markers.push(marker); // Armazena o marcador na lista global
    });
}

// 131. displayCustomNightlife - Exibe opções de vida noturna
function displayCustomNightlife() {
    fetchOSMData(queries['nightlife-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'nightlife-submenu', 'festas');
        }
    });
}

// 132. displayCustomRestaurants - Exibe lista de restaurantes personalizados
function displayCustomRestaurants() {
    fetchOSMData(queries['restaurants-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'restaurants-submenu', 'restaurantes');
        }
    });
}

// 133. displayCustomShops - Mostra lojas personalizadas
function displayCustomShops() {
    fetchOSMData(queries['shops-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'shops-submenu', 'lojas');
        }
    });
}

// 134. displayCustomTips - Mostra dicas personalizadas
function displayCustomTips() {
    const tips = [
        { name: "Melhores Pontos Turísticos", lat: -13.3766787, lon: -38.9172057, description: "Explore os pontos turísticos mais icônicos de Morro de São Paulo." },
        { name: "Melhores Passeios", lat: -13.3766787, lon: -38.9172057, description: "Descubra os passeios mais recomendados." },
        { name: "Melhores Praias", lat: -13.3766787, lon: -38.9172057, description: "Saiba quais são as praias mais populares." },
        { name: "Melhores Restaurantes", lat: -13.3766787, lon: -38.9172057, description: "Conheça os melhores lugares para comer." },
        { name: "Melhores Pousadas", lat: -13.3766787, lon: -38.9172057, description: "Encontre as melhores opções de pousadas." },
        { name: "Melhores Lojas", lat: -13.3766787, lon: -38.9172057, description: "Descubra as melhores lojas para suas compras." }
    ];

    // Limpa o submenu e cria botões para cada dica
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

        // Configura o evento de clique para cada botão
        btn.onclick = () => {
            handleSubmenuButtons(tip.lat, tip.lon, tip.name, tip.description, [], 'dicas');
        };
        subMenu.appendChild(btn);

        // Adiciona marcadores no mapa para cada dica
        const marker = L.marker([tip.lat, tip.lon]).addTo(map).bindPopup(`<b>${tip.name}</b><br>${tip.description}`);
        markers.push(marker);
    });
}

// 135. displayCustomTouristSpots - Exibe pontos turísticos personalizados
function displayCustomTouristSpots() {
    fetchOSMData(queries['touristSpots-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'touristSpots-submenu', 'pontos-turisticos');
        }
        hideAllButtons();
    });
}

// 136. displayCustomTours - Exibe passeios personalizados
function displayCustomTours() {
    const tours = [
        {
            name: "Passeio de lancha Volta a Ilha de Tinharé",
            lat: -13.3837729,
            lon: -38.9085360,
            description: "Desfrute de um emocionante passeio de lancha ao redor da Ilha de Tinharé. Veja paisagens deslumbrantes e descubra segredos escondidos desta bela ilha."
        },
        {
            name: "Passeio de Quadriciclo para Garapuá",
            lat: -13.3827765,
            lon: -38.9105500,
            description: "Aventure-se em um emocionante passeio de quadriciclo até a pitoresca vila de Garapuá. Aproveite o caminho cheio de adrenalina e as paisagens naturais de tirar o fôlego."
        },
        {
            name: "Passeio 4X4 para Garapuá",
            lat: -13.3808638,
            lon: -38.9127107,
            description: "Embarque em uma viagem emocionante de 4x4 até Garapuá. Desfrute de uma experiência off-road única com vistas espetaculares e muita diversão."
        },
        {
            name: "Passeio de Barco para Gamboa",
            lat: -13.3766536,
            lon: -38.9186205,
            description: "Relaxe em um agradável passeio de barco até Gamboa. Desfrute da tranquilidade do mar e da beleza natural ao longo do caminho."
        }
    ];

    // Passa os dados dos passeios para a função genérica `displayCustomItems`
    displayCustomItems(tours, 'tours-submenu', 'passeios');
}


// ========== INTEGRAÇÃO COM MAPAS E DADOS OSM (Funções 137 - 147) ==========  

// 137. displayOSMData - Exibe dados do OpenStreetMap
function displayOSMData(data, subMenuId, feature) {
    // 1. Limpa o conteúdo atual do submenu
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = '';

    // 2. Itera sobre os elementos recebidos do OSM e cria botões dinamicamente
    data.elements.forEach(element => {
        if (element.type === 'node' && element.tags.name) { // Verifica se o elemento é um nó válido com nome
            const btn = document.createElement('button'); // Cria botão para o item
            btn.className = 'submenu-item submenu-button';
            btn.textContent = element.tags.name; // Define o texto do botão como o nome do elemento
            btn.setAttribute('data-destination', element.tags.name); // Define atributo para uso posterior

            // Define a descrição do item
            const description = element.tags.description || 'Descrição não disponível';

            // 3. Configura evento de clique para o botão
            btn.onclick = () => {
                handleSubmenuButtons(
                    element.lat, // Latitude do elemento
                    element.lon, // Longitude do elemento
                    element.tags.name, // Nome do elemento
                    description, // Descrição do elemento
                    element.tags.images || [], // Imagens (se disponíveis)
                    feature // Funcionalidade associada
                );
            };

            subMenu.appendChild(btn); // Adiciona o botão ao submenu

            // 4. Adiciona marcador no mapa e configura pop-up com informações do item
            const marker = L.marker([element.lat, element.lon]).addTo(map)
                .bindPopup(`<b>${element.tags.name}</b><br>${description}`);
            markers.push(marker); // Salva o marcador na lista global
        }
    });

    // 5. Configura eventos adicionais para botões do submenu
    document.querySelectorAll('.submenu-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const destination = this.getAttribute('data-destination'); // Obtém o destino associado ao botão
            console.log(`Destination selected: ${destination}`);

            // Exibe o conteúdo do destino selecionado
            showDestinationContent(destination);

        });
    });
}

// 138. drawPath - Desenha um caminho no mapa
function drawPath(userLat, userLon, instructions) {
    try {
        // Remove rota anterior
        if (window.navigationPath) {
            map.removeLayer(window.navigationPath);
        }

        // Mapeia coordenadas das instruções
        const latLngs = instructions.map(step => [step.lat, step.lon]);
        latLngs.unshift([userLat, userLon]);  // Adiciona a posição atual como ponto inicial

        // Desenha nova linha de rota
        window.navigationPath = L.polyline(latLngs, {
            color: "blue",
            weight: 6,
            dashArray: "10, 5"
        }).addTo(map);

        // Adiciona setas decorativas na linha
        addInteractiveArrowsOnRoute();

        // Ajusta o mapa para exibir a nova rota
        map.fitBounds(window.navigationPath.getBounds(), { padding: [50, 50] });

        console.log("🗺️ Nova rota desenhada no mapa.");
    } catch (error) {
        console.error("❌ Erro ao desenhar rota no mapa:", error.message);
        showNotification("Erro ao exibir a nova rota no mapa.", "error");
    }
}


// 139. enableDarkMode - Ativa o modo escuro na interface
function enableDarkMode() {
    document.body.classList.add('dark-mode');
    showNotification('Modo escuro ativado.', 'info');
}

// 140. enableEcoMode - Ativa o modo econômico
function showNearbyPOIs() {
    const poiRequest = fetchPOIs(currentRouteData);
    poiRequest.then((pois) => {
        pois.forEach((poi) => {
            L.marker([poi.lat, poi.lon])
                .addTo(map)
                .bindPopup(`📍 ${poi.name}`);
        });
        console.log("POIs adicionados ao mapa.");
    }).catch(() => {
        console.warn("Nenhum POI encontrado.");
    });
}

// 141. enableEcoModeTracking - Monitora o modo econômico
function adjustMapZoomBySpeed(speed) {
    let zoomLevel;

    if (speed < 5) {
        zoomLevel = 17;  // Caminhada lenta
    } else if (speed < 15) {
        zoomLevel = 15;  // Caminhada rápida ou bicicleta
    } else {
        zoomLevel = 13;  // Veículo rápido
    }

    map.setZoom(zoomLevel);
    showNotification(`🔍 Zoom ajustado para ${zoomLevel}.`, "info");
    console.log(`🔍 Zoom ajustado para: ${zoomLevel} com velocidade de ${speed} m/s.`);
}

// 142. enrichInstructionsWithOSM - Enriquece instruções de navegação com dados OSM
async function enrichInstructionsWithOSM(instructions, lang = 'pt') {
  try {
    const enrichedInstructions = await Promise.all(
      instructions.map(async (step) => {
        // Exemplo: fetchPOIs() retorna um array de POIs a 200m daquele ponto
        const pois = await fetchPOIs(step.lat, step.lon); 
        if (pois && pois.length > 0) {
          // Monta string “3 POIs próximos” – e traduz
          const extraMsg = getGeneralText("pois_nearby", lang).replace("{count}", pois.length);
          step.enrichedInfo = extraMsg; 
        }
        return step;
      })
    );
    return enrichedInstructions;
  } catch (error) {
    console.error("Erro ao enriquecer instruções com OSM:", error.message);
    return instructions; // fallback
  }
}



// 143. fetchOSMData - Busca dados do OpenStreetMap
async function fetchOSMData(query) {
  try {
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await fetch(overpassUrl);
    if (!response.ok) {
      console.error('Erro ao buscar dados OSM:', response.statusText);
      return null;
    }

    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      console.warn('Nenhum dado OSM encontrado para a query.');
      return null;
    }

    console.log(`fetchOSMData: retornado ${data.elements.length} elementos.`);
    return data;
  } catch (error) {
    console.error('Erro geral ao buscar dados do Overpass-API:', error);
    return null;
  }
}


// 144. fetchRouteInstructions - Busca instruções de rota
async function fetchRouteInstructions(startLat, startLon, destLat, destLon, lang = 'pt') {
  try {
    // Corrigindo a URL: agora com "&end=destLon,destLat" (antes estava invertido).
    const apiUrl = 
      `https://api.openrouteservice.org/v2/directions/foot-walking` +
      `?api_key=${apiKey}` +
      `&start=${startLon},${startLat}` +
      `&end=${destLon},${destLat}` +
      `&instructions=true` +
      `&language=${lang}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error("fetchRouteInstructions: Erro da API:", response.statusText);
      return null;
    }

    const data = await response.json();
    // Normalmente: data.features[0].properties.segments[0].steps
    const steps = data?.features?.[0]?.properties?.segments?.[0]?.steps;
    if (!steps || steps.length === 0) {
      console.warn(getGeneralText("noInstructionsAvailable", lang));
      return [];
    }

    // Montamos o array final de instruções
    const instructions = steps.map((step, index) => {
      // Identificamos o index de coords no array geometry.coordinates
      const coordsIndex = step.way_points[0];
      const [lon, lat] = data.features[0].geometry.coordinates[coordsIndex];

      // "rawInstruction" do ORS, ex. "Head north on Main Street"
      const rawInstruction = step.instruction || "";
      // Mapeia para uma chave do dicionário OSM (ex. "head_north", "turn_left", etc.)
      const mappedKey = mapORSInstruction(rawInstruction);
      // Agora sim chamamos getGeneralText usando a "chave" (ex. "head_north")
      const translatedInstruction = getGeneralText(mappedKey, lang);

      return {
        id: index + 1,
        raw: rawInstruction,          // (opcional, se quiser guardar)
        text: translatedInstruction,  // Texto já traduzido
        distance: Math.round(step.distance),
        lat,
        lon
      };
    });

    console.log(`fetchRouteInstructions: obtidas ${instructions.length} instruções para '${lang}'.`);
    return instructions;
  } catch (error) {
    console.error(getGeneralText("fetchingInstructionsError", lang), error);
    return [];
  }
}



// 145. finalizeRouteMarkers - Finaliza e exibe marcadores na rota
function finalizeRouteMarkers(userLat, userLon, destination) {
    // Add the initial marker and save it globally
    window.initialMarker = L.marker([userLat, userLon])
        .addTo(map)
        .bindPopup("📍 Ponto de Partida")
        .openPopup();

    // Add the destination marker
    L.marker([destination.lat, destination.lon])
        .addTo(map)
        .bindPopup(`🏁 Destino: ${destination.name || "Destino"}`)
        .openPopup();

    console.log("Marcadores de rota finalizados.");
}

// 146. generateItineraryFromAnswers - Retorna um objeto contendo os destinos sugeridos
function generateItineraryFromAnswers(answers) {
    const itinerary = answers.map(answer => ({
        name: `Visite ${answer}`,
        description: `Informações sobre ${answer}`,
        lat: -13.41 + Math.random() * 0.01, // Simulação de coordenadas
        lon: -38.91 + Math.random() * 0.01
    }));
    return itinerary;
}

// 147. getAvailableActivities
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

// ========== GERENCIAMENTO DE DADOS E LOCALSTORAGE (Funções 148 - 157) ==========  

// 148. getDirectionIcon - Retorna ícone de direção
function getDirectionIcon(direction) {
    const icons = {
        left: '⬅️',
        right: '➡️',
        forward: '⬆️',
        back: '⬇️'
    };
    return icons[direction] || '⬆️';  // Ícone padrão (seguir em frente)
}

// 149. getImagesForLocation - Busca imagens para um local
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

// 150. getLocalStorageItem - Recupera item do localStorage
function getLocalStorageItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Erro ao obter item do localStorage (${key}):`, error);
        return defaultValue;
    }
}

// 151. getNavigationText - Gera texto de navegação
function getNavigationText(instruction) {
    return `${instruction.step}. ${instruction.description}`;
}

// 152. getSelectedDestination - Retorna o destino selecionado
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

// 153. getUrlsForLocation - Obtém URLs para um local
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

// 154. giveVoiceFeedback - Feedback de voz durante navegação
function giveVoiceFeedback(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'pt-BR';
    window.speechSynthesis.speak(speech);
    console.log('Feedback de voz:', message);
}

// 155. handleFeatureSelection - Gerencia seleção de funcionalidades
function handleFeatureSelection(feature) {
	    // Salva globalmente a feature clicada
    lastSelectedFeature = feature;
    // 1. Define os mapeamentos entre funcionalidades e IDs de submenus
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

    // 2. Obtém o ID do submenu correspondente à funcionalidade selecionada
    const subMenuId = featureMappings[feature];

    if (!subMenuId) {
        // Exibe erro no console se a funcionalidade não for reconhecida
        console.error(`Feature não reconhecida: ${feature}`);
        return;
    }

    console.log(`Feature selecionada: ${feature}, Submenu ID: ${subMenuId}`);

    // 3. Oculta todos os submenus atualmente visíveis
    document.querySelectorAll('#menu .submenu').forEach(subMenu => {
        subMenu.style.display = 'none';
    });

    // Limpa os marcadores do mapa
    clearMarkers();

    // 4. Verifica se o submenu já está ativo
    if (currentSubMenu === subMenuId) {
        // Se o submenu já estiver ativo, oculta o menu e redefine o estado
        document.getElementById('menu').style.display = 'none';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        currentSubMenu = null;
    } else {
        // Carrega o submenu associado à funcionalidade
        loadSubMenu(subMenuId, feature);

        // Verifica se a funcionalidade está no contexto do tutorial
        if (tutorialIsActive && tutorialSteps[currentStep].step === 'ask-interest') {
            // Avança para o próximo passo do tutorial após carregar o submenu
            nextTutorialStep();
        }

        // Exibe o menu e ajusta os estados visuais dos botões do menu
        document.getElementById('menu').style.display = 'block';
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.add('inactive')); // Torna todos os botões inativos
        const activeButton = document.querySelector(`.menu-btn[data-feature="${feature}"]`);
        if (activeButton) {
            activeButton.classList.remove('inactive'); // Remove estado inativo do botão atual
            activeButton.classList.add('active'); // Torna o botão atual ativo
        }

        // Atualiza o estado global com o submenu ativo
        currentSubMenu = subMenuId;
    }
}

// 156. handleNextInstruction - Avança para próxima instrução
function handleNextInstruction(userLat, userLon, instructions, destLat, destLon) {
    const nextStep = instructions[0];
    const distanceToNext = calculateDistance(userLat, userLon, nextStep.lat, nextStep.lon);

    console.log(`Distância até próxima instrução: ${distanceToNext} metros`);

    if (distanceToNext < 10) {
        instructions.shift(); // Remove a instrução concluída
        displayStepByStepInstructions(instructions, 0);
        giveVoiceFeedback(instructions[0]?.text || "Siga em frente.");
    }
}


// 157. handleReservation - Processa reserva para destino selecionado
function handleReservation(buttonId, url) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => {
            if (selectedDestination && selectedDestination.url) {
                openDestinationWebsite(url);
            } else {
                alert('Por favor, selecione um destino primeiro.');
            }
        });
    }
}

// Initialize reservations
handleReservation('reserve-chairs-btn', 'url-to-destination');
handleReservation('reserve-inns-btn', 'url-to-destination');
handleReservation('reserve-restaurants-btn', 'url-to-destination');

// ========== DESVIOS, ERROS E SITUAÇÕES ESPECIAIS (Funções 158 - 166) ==========  

// 158. handleRouteDeviation - Lida com desvios de rota
function handleRouteDeviation(userLat, userLon) {
    const distanceFromRoute = calculateDistance(userLat, userLon, currentRouteData.start.lat, currentRouteData.start.lon);
    
    if (distanceFromRoute > 50) {
        showNotification("⚠️ Fora da rota. Recalculando...", "warning");
        triggerHapticFeedback("recalculating");
        startRouteCreation();  // Recalcula com base na nova localização
    }
}

// 159. handleRouteDeviationOffline - Lida com desvios de rota offline
function handleRouteDeviationOffline() {
    showNotification('Sem conexão. Ajuste manual da rota necessário.', 'warning');
}

// 160. handleSpecialScenarios - Lida com condições especiais
function handleSpecialScenarios(userLat, userLon, instructions) {
    const distanceToNext = calculateDistance(userLat, userLon, instructions[0].lat, instructions[0].lon);

    if (distanceToNext < 10) {
        showNotification("Você chegou a um ponto crítico. Verifique a instrução.", "info");
    }

    const isUserIdle = checkIfUserIdle();
    if (isUserIdle) {
        showNotification("Você está parado. Deseja recalcular a rota?", "info");
    }
}

// 161. handleSubmenuButtonClick - Lida com cliques nos botões do submenu
function handleSubmenuButtonClick(lat, lon, name, description, controlButtonsFn) {
    // Atualiza o estado global do destino
    selectedDestination = { lat, lon, name, description };

    // Ajusta o mapa
    adjustMapWithLocation(lat, lon, name);

    // Notificação
    giveVoiceFeedback(`Destino ${name} selecionado com sucesso.`);
}

// 162. handleSubmenuButtons - Gerencia as interações do submenu com base na localização e funcionalidade selecionada
function handleSubmenuButtons(lat, lon, name, description, images, feature) {
    // 1. Obtém URLs adicionais relacionados ao local
    const url = getUrlsForLocation(name);

    // 2. Limpa os marcadores existentes no mapa e ajusta para a localização selecionada
    clearMarkers();
    adjustMapWithLocation(lat, lon, name, description, 15, -10);


    // 3. Atualiza o estado global e salva o destino selecionado no cache
    selectedDestination = { name, description, lat, lon, images, feature, url };
    saveDestinationToCache(selectedDestination)
        .then(() => {
    
    // 4. Envia o destino para o Service Worker e limpa rotas atuais
            sendDestinationToServiceWorker(selectedDestination);
            clearCurrentRoute();
        })
        .catch(error => {
            console.error('Erro ao salvar destino no cache:', error);
        });

    // 5. Exibe botões de controle específicos com base na funcionalidade
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
        // 7. Funcionalidade não reconhecida: Exibe botões genéricos
        default:
            showControlButtons();
            break;
    }
}

// 166. handleUserState - Determina o estado atual do usuário
function handleUserState() {
    determineUserState();
    if (userIsIdle) {
        showNotification('Você está inativo. Navegação pausada.', 'warning');
        pauseNavigation();
    }
}

// ========== CONTROLE DE INTERFACE, MODAIS E GESTÃO VISUAL (Funções 167 - 176) ==========  

// 167. hideAllButtons - Oculta todos os botões com a classe `.control-btn` na página
function hideAllButtons() {
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(button => button.style.display = 'none');
}

// 168. hideAllControlButtons - Oculta botões de controle
// ==================================
// FUNÇÃO MELHORADA: hideAllControlButtons()
// ==================================
function hideAllControlButtons() {
    // Seleciona todos os botões de controle (se usam a classe .control-btn)
    const controlButtons = document.querySelectorAll(".control-btn");

    // Define "display: none" para cada um
    controlButtons.forEach((button) => {
        button.style.display = "none";
    });

    console.log("Todos os botões de controle foram ocultados.");
}

// 169. hideAssistantModal - Remove o modal do assistente
function hideAssistantModal() {
    const modal = document.getElementById('assistant-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 170. hideControlButtons - Oculta botões de controle
function hideControlButtons() {
    const buttonsToHide = [
        'buy-ticket-btn', 'tour-btn', 'reserve-restaurants-btn', 'reserve-inns-btn',
        'speak-attendent-btn', 'call-btn', 'navigation-start'
    ];
    buttonsToHide.forEach(id => {
        const button = document.getElementById(id);
        if (button) button.style.display = 'none';
    });
}

// 171. hideNavigationBar - Oculta a barra de navegação
function hideNavigationBar() {
    const navBar = document.getElementById('navigation-bar');
    if (navBar) {
        navBar.style.display = 'none';
        console.log('Barra de navegação oculta.');
    }
}

// 172. hideRouteSummary - Oculta o modal de resumo da rota
function hideRouteSummary() {
    const summaryContainer = document.getElementById("route-summary");
    const previewContainer = document.getElementById("route-preview");

    if (summaryContainer) {
        summaryContainer.style.display = "none"; // Oculta o container do resumo
        summaryContainer.innerHTML = ""; // Limpa o conteúdo para economizar memória
    }

    if (previewContainer) {
        previewContainer.classList.remove("show"); // Remove a classe de exibição
        previewContainer.classList.add("hidden"); // Adiciona a classe de ocultação
        previewContainer.innerHTML = ""; // Limpa o conteúdo
    }

    console.log("Resumo da rota ocultado com sucesso.");
}

// 173. highlightElement - Destaca elemento visualmente
function highlightElement(element) {
    element.classList.add('highlight');
    setTimeout(() => {
        element.classList.remove('highlight');
    }, 3000);
    console.log(`Elemento destacado: ${element.id || element.className}`);
}

// 174. initializeNavigation - Inicializa a navegação após reset
function initializeNavigation() {
    const startButton = document.getElementById("start-navigation-button");
    const endButton = document.getElementById("end-navigation-button");

    if (!startButton || !endButton) {
        console.error("Botões de navegação não encontrados.");
        return;
    }

    // Iniciar Navegação
    startButton.addEventListener("click", async () => {
        console.log("Botão de iniciar navegação clicado.");
        await startNavigation();
    });

    // Encerrar Navegação
    endButton.addEventListener("click", () => {
        console.log("Botão de encerrar navegação clicado.");
        endNavigation();
    });
}

// 175. isUserOnStreet - Verifica se o usuário está em uma rua
async function isUserOnStreet(lat, lon) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error("Erro ao verificar localização na OSM:", response.statusText);
            return false;
        }

        const data = await response.json();
        if (data.address && data.address.road) {
            console.log("Usuário está em uma rua:", data.address.road);
            return true;
        }

        console.warn("Usuário não está em uma rua.");
        return false;
    } catch (error) {
        console.error("Erro ao verificar localização na OSM:", error);
        return false;
    }
}

// 176. loadOfflineInstructions - Carrega instruções de navegação offline
function loadOfflineInstructions() {
    const cachedInstructions = localStorage.getItem('offlineInstructions');
    if (cachedInstructions) {
        return JSON.parse(cachedInstructions);
    } else {
        console.warn('Nenhuma instrução offline encontrada.');
        return [];
    }
}

// ========== GESTÃO DE SUBMENUS, DADOS E ERROS (Funções 177 - 187) ==========  

// 177. loadSearchHistory - Carrega o histórico de buscas do usuário
function loadSearchHistory() {
    const history = getLocalStorageItem('searchHistory', []);
    searchHistory = history; // Atualiza a variável global

    const historyContainer = document.getElementById('search-history-container');
    if (historyContainer) {
        historyContainer.innerHTML = ''; // Limpa o histórico atual

        history.forEach(query => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = query;
            historyContainer.appendChild(historyItem); // Adiciona o item ao histórico
        });
    }
}

// 178. loadSubMenu - Carrega conteúdo do submenu
function loadSubMenu(subMenuId, feature) {
    // 1. Verifica se o submenu existe
    const subMenu = document.getElementById(subMenuId);
    if (!subMenu) {
        console.error(`Submenu não encontrado: ${subMenuId}`);
        return;
    }

    console.log(`Carregando submenu: ${subMenuId} para a feature: ${feature}`);

    // 2. Exibe o submenu
    subMenu.style.display = 'block';

    // 3. Seleciona a funcionalidade específica para exibição
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
            // 4. Lida com funcionalidades não reconhecidas
            console.error(`Feature não reconhecida ao carregar submenu: ${feature}`);
            break;
    }
}

// 179. mapGeolocationError - Lida com erros de geolocalização
function mapGeolocationError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return "Permissão de localização negada pelo usuário.";
        case error.POSITION_UNAVAILABLE:
            return "Informação de localização indisponível.";
        case error.TIMEOUT:
            return "Tempo limite excedido ao tentar obter a localização.";
        default:
            return "Ocorreu um erro desconhecido ao tentar acessar sua localização.";
    }
}

// 180. notifyDirectionChange - Feedback visual ao detectar mudanças de direção
function notifyDirectionChange(instruction) {
    const directionModal = document.getElementById("direction-modal");
    if (!directionModal) {
        console.error("Elemento #direction-modal não encontrado.");
        return;
    }

    const directionIcon = getDirectionIcon(instruction.text);
    const directionText = instruction.text || "Mudança de direção desconhecida.";

    directionModal.querySelector(".direction-icon").textContent = directionIcon;
    directionModal.querySelector(".direction-text").textContent = directionText;

    directionModal.classList.remove("hidden");

    // Oculta o modal após 5 segundos
    setTimeout(() => {
        directionModal.classList.add("hidden");
    }, 5000);
}

// 181. notifyUserOffRoute - Notifica usuário fora da rota
function notifyUserOffRoute() {
    const instructionsContainer = document.getElementById("navigation-instructions");
    if (!instructionsContainer) {
        console.error("Modal de instruções não encontrado.");
        return;
    }

    instructionsContainer.innerHTML = `
        <li class="instruction-step active-instruction">
            <span class="direction-arrow">⚠️</span> Você saiu da rota. Deseja recalcular?
        </li>
        <div class="deviation-controls">
            <button id="recalculate-route-btn" class="btn-action">Recalcular Rota</button>
            <button id="ignore-route-btn" class="btn-secondary">Ignorar</button>
        </div>
    `;
    instructionsContainer.style.display = "block";

    document.getElementById("recalculate-route-btn").addEventListener("click", async () => {
        const { latitude, longitude } = userCurrentLocation;
        await recalculateRoute(latitude, longitude, selectedDestination.lat, selectedDestination.lon);
    });

    document.getElementById("ignore-route-btn").addEventListener("click", () => {
        console.log("Usuário escolheu ignorar o recálculo.");
        toggleNavigationInstructions(true); // Retorna para as instruções normais
    });

    console.log("Notificação de desvio exibida.");
}

// 182. openDestinationWebsite - Abre site do destino selecionado
function openDestinationWebsite(url) {
    window.open(url, '_blank');
}

// 183. performControlAction - Executa ação de controle
function performControlAction(action) {
    switch (action) {
        case 'next':
            nextTutorialStep(currentStep); // Avança para o próximo passo do tutorial
            break;
        case 'previous':
            previousTutorialStep(currentStep); // Volta para o passo anterior
            break;
        case 'finish':
            endTutorial(); // Finaliza o tutorial
            break;
        case 'start-tutorial':
            initializeTutorial(); // Inicia o tutorial
            break;
        case 'menu-toggle':
            const floatingMenu = document.getElementById('floating-menu');
            floatingMenu.classList.toggle('hidden'); // Mostra ou esconde o menu flutuante
            break;
        case 'pontos-turisticos':
            storeAndProceed('pontos-turisticos'); // Navega para pontos turísticos
            break;
        case 'passeios':
            storeAndProceed('passeios'); // Navega para passeios
            break;
        case 'praias':
            storeAndProceed('praias'); // Navega para praias
            break;
        case 'festas':
            storeAndProceed('festas'); // Navega para festas
            break;
        case 'restaurantes':
            storeAndProceed('restaurantes'); // Navega para restaurantes
            break;
        case 'pousadas':
            storeAndProceed('pousadas'); // Navega para pousadas
            break;
        case 'lojas':
            storeAndProceed('lojas'); // Navega para lojas
            break;
        case 'emergencias':
            storeAndProceed('emergencias'); // Navega para emergências
            break;
        case 'reserve-chairs':
            alert('Reserva de cadeiras iniciada.'); // Inicia a reserva de cadeiras
            break;
        case 'buy-ticket':
            alert('Compra de ingresso iniciada.'); // Inicia a compra de ingressos
            break;
        case 'create-route':
            startRouteCreation();
             // Cria rota para o destino
            break;
        case 'access-site':
            accessSite(); // Acessa o site
            break;
        case 'tutorial-send':
            nextTutorialStep(); // Envia resposta no tutorial
            break;
        case 'tutorial-menu':
            showTutorialStep('ask-interest'); // Mostra o menu do tutorial
            break;
        case 'start-navigation-button':
           startNavigation(); // Inicia a navegação
            break;
        case 'navigation-end':
            endNavigation(); // Finaliza a navegação
            break;
        default:
            console.error(`Ação não reconhecida: ${action}`);
    }
}

// 184. prepareMapForNewRoute - Prepara o mapa para nova rota
function prepareMapForNewRoute() {
    clearMarkers();
    clearCurrentRoute();
    console.log('Mapa pronto para nova rota.');
}

// 185. provideContinuousAssistance - Assistência contínua durante navegação
function provideContinuousAssistance() {
    setInterval(() => {
        updateNavigationInstructions();
        monitorUserState();
    }, 10000); // A cada 10 segundos
    console.log('Assistência contínua ativada.');
}

// 186. removeFloatingMenuHighlights - Remove destaques do menu flutuante
function removeFloatingMenuHighlights() {
    document.querySelectorAll('.floating-menu .highlight').forEach(el => el.classList.remove('highlight'));
    console.log('Destaques do menu flutuante removidos.');
}

// 187. removeLocalStorageItem - Remove item do armazenamento local
function removeLocalStorageItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Erro ao remover item do localStorage (${key}):`, error);
    }
}



// ========== GERENCIAMENTO DE PERMISSÕES, CACHE E ITINERÁRIOS (Funções 188 - 197) ==========  

// 188. renderItinerary - Renderiza o itinerário na interface
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

// 189. requestLocationPermission - Solicita permissão de localização
/**
 * Solicita permissão de geolocalização ao usuário e retorna status.
 * @async
 * @function requestLocationPermission
 * @param {string} [lang='pt'] - Idioma para as notificações (ex.: 'en', 'pt').
 * @returns {Promise<boolean>} - Retorna true se a permissão foi concedida, false se negada.
 *
 * APLICA MELHORIAS:
 * - Docstrings (1.2)
 * - Logs padronizados e notificação de erro (6.1)
 * - i18n (7.1) usando getGeneralText()
 */
async function requestLocationPermission(lang = 'pt') {
  console.log("[requestLocationPermission] Checando permissão de localização...");
  
  if (!navigator.geolocation) {
    console.error("[requestLocationPermission] Geolocalização não suportada pelo navegador.");
    showNotification(getGeneralText("geolocationUnsupported", lang) || "Geolocation not supported.", "error");
    return false;
  }

  // Tenta obter a posição rapidamente para ver se há bloqueio
  try {
    await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        (err) => reject(err),
        { timeout: 3000 }  // Tenta rápido só para ver se é permitido
      );
    });
    console.log("[requestLocationPermission] Permissão de localização concedida.");
    return true;
  } catch (err) {
    console.warn("[requestLocationPermission] Permissão negada ou tempo limite excedido.", err);
    showNotification(getGeneralText("noLocationPermission", lang) || "Location permission denied.", "warning");
    return false;
  }
}


// 190. saveDestinationToCache - Salva destino no cache
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

// 191. saveRouteToHistory - Salva rota no histórico
function saveRouteToHistory(route) {
    const history = JSON.parse(localStorage.getItem('routeHistory')) || [];
    history.push(route);
    localStorage.setItem('routeHistory', JSON.stringify(history));
    console.log('Rota salva no histórico.');
}

// 192. saveSearchQueryToHistory - Salva consulta de pesquisa no histórico
function saveSearchQueryToHistory(query) {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory.push(query);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    console.log('Consulta de pesquisa salva no histórico.');
}

// 193. searchAssistance - Busca informações simuladas para assistência
function searchAssistance(query) {
    const fakeDatabase = [
        { name: 'Informação A', description: 'Descrição A' },
        { name: 'Informação B', description: 'Descrição B' }
    ];

    return fakeDatabase.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
}

// 194. searchLocation - Realiza busca de localização
function searchLocation() {const apiKey = OPENROUTESERVICE_API_KEY; // ou sua const

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

// 195. selectDestination - Seleciona destino para navegação
function selectDestination(destination) {
    selectedDestination = destination;
    console.log('Destino selecionado:', destination);
}
// 196. sendDestinationToServiceWorker - Envia destino ao Service Worker
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

// 197. setLocalStorageItem - Define item no armazenamento local
function setLocalStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Erro ao salvar item no localStorage (${key}):`, error);
    }
}

// ========== EXIBIÇÃO DE BOTÕES E CONTROLE VISUAL (Funções 198 - 207) ==========  

// 198. setSelectedDestination - Define destino selecionado
function setSelectedDestination(lat, lon, name = "Destino") {
    if (!lat || !lon) {
        console.error("Coordenadas inválidas para o destino:", { lat, lon });
        showNotification("Erro: coordenadas do destino são inválidas. Por favor, tente novamente.", "error");
        return;
    }

    selectedDestination = { lat, lon, name };
    console.log("Destino selecionado:", selectedDestination);

    // Notifica o usuário sobre a seleção do destino
    showNotification(`Destino "${name}" selecionado com sucesso!`, "success");
    giveVoiceFeedback(`Destino ${name} foi selecionado. Criando rota agora.`);

    // Inicia a criação da rota
    createRouteToDestination(lat, lon);
}

// 199. showButtons - Exibe botões na interface
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

// 205. showMenuButtons - Exibe botões do menu
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

// 106. showNearbyPOIs - Exibe pontos de interesse próximos
function showNearbyPOIs(poiList) {
    poiList.forEach(poi => {
        const marker = L.marker([poi.lat, poi.lon]).addTo(map)
            .bindPopup(`<b>${poi.name}</b>`)
            .openPopup();
        markers.push(marker);
    });
    console.log('Pontos de interesse próximos exibidos:', poiList);
}

// 207. showStartRouteButton - Exibe botão de iniciar rota
function showStartRouteButton() {
    const startRouteBtn = document.getElementById('start-route-btn');
    if (startRouteBtn) {
        startRouteBtn.style.display = 'block';
    }
    console.log('Botão de iniciar rota exibido.');
}

// ========== FINALIZAÇÃO E GESTÃO DE ROTAS (Funções 208 - 217) ==========  

// 208. startCarousel - Inicia carrossel de imagens
function startCarousel(locationName) {
    const images = getImagesForLocation(locationName);

    if (!images || images.length === 0) {
        alert('Nenhuma imagem disponível para o carrossel.');
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

    showModal('carousel-modal'); // Mostra o modal do carrossel

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
    });
}

// 209. startInteractiveRoute - Inicia rota interativa


// 210. startRouteCreation - Criação de nova rota
async function startRouteCreation() {
    try {
        validateDestination();  // Verifica destino válido

        const userLocation = await getCurrentLocation();  // Localização do usuário
        const routeData = await createRoute(userLocation);  // Criação de rota com base na localização

        if (!routeData) {
            showNotification(translations[selectedLanguage].routeError, "error");
            triggerHapticFeedback("recalculating");
            return;
        }

        currentRouteData = routeData;  // Armazena rota atual
        startRoutePreview();
    } catch (error) {
        console.error("❌ Erro ao iniciar criação de rota:", error.message);
        showNotification(translations[selectedLanguage].routeError, "error");
    }
}

// 211. stopPositionTracking - Interrompe rastreamento de posição
function stopPositionTracking() {
    if (navigator.geolocation && positionWatcher) {
        navigator.geolocation.clearWatch(positionWatcher);
        positionWatcher = null;
        console.log('Rastreamento de posição interrompido.');
    }
}

// 212. toggleDarkMode - Alterna modo escuro
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    map.getContainer().classList.toggle('dark-map');
    showNotification('Modo escuro alternado.');
}

// 213. toggleMenu - Alterna menu lateral
function toggleMenu() {
  const menu = document.getElementById('menu');
  if (menu.style.display === 'block') {
    menu.style.display = 'none';
  } else {
    menu.style.display = 'block';
  }
}

function closeSideMenu() {
  const menu = document.getElementById('menu');
  menu.style.display = 'none';
  currentSubMenu = null; // se você usar essa variável
}

// Se antes você tinha algo como:
// menuToggle.style.display = 'none';
// retire esse trecho para não ocultar o ícone hamburguer.


// 214. toggleNavigationInstructions - Alterna instruções de navegação
function toggleNavigationInstructions() {
  const instructionsModal = document.getElementById("navigation-instructions");
  if (!instructionsModal) {
    console.warn("Não há modal de instruções (navigation-instructions) para togglear.");
    return;
  }
  instructionsModal.classList.toggle("hidden");
  const isHidden = instructionsModal.classList.contains("hidden");
  showNotification(
    isHidden ? "Instruções ocultadas." : "Instruções exibidas.",
    "info"
  );
}


// 215. toggleRouteSummary - Alterna resumo da rota
function toggleRouteSummary() {
    const modal = document.getElementById('route-summary-modal');
    modal.classList.toggle('hidden');
}

// 216. translateInstruction - Tradução de instruções
function translateInstruction(instruction, lang = 'pt') {
  // Exemplo simples: mapeia alguns termos
  const dictionary = {
    pt: {
      "Turn right": "Vire à direita",
      "Turn left": "Vire à esquerda",
      "Continue straight": "Continue em frente"
      // etc.
    },
    en: {
      "Vire à direita": "Turn right",
      "Vire à esquerda": "Turn left",
      "Continue em frente": "Continue straight"
    }
    // Acrescente dicionário para cada idioma
  };

  if (!dictionary[lang]) {
    // Se não há dicionário para este lang, retorna a instrução original
    return instruction;
  }

  // Tenta bater com alguma chave do dicionário
  const translation = dictionary[lang][instruction];
  return translation || instruction;
}


// 217. translatePageContent - Tradução do conteúdo da página
function translatePageContent(lang) {
  const elementsToTranslate = document.querySelectorAll('[data-i18n]');
  let missingTranslations = 0;

  elementsToTranslate.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getGeneralText(key, lang);

    // Se a tradução começa com "⚠️", significa que não foi encontrada
    if (translation.startsWith('⚠️')) {
      missingTranslations++;
      console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
    }

    // Se for input ou textarea, altera o placeholder
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    }
    // Se tiver atributo title, atualiza
    else if (element.hasAttribute('title')) {
      element.title = translation;
    }
    // Caso contrário, atualiza o textContent
    else {
      element.textContent = translation;
    }
  });

  if (missingTranslations > 0) {
    console.warn(`Total de traduções ausentes: ${missingTranslations}`);
  } else {
    console.log(`Traduções aplicadas com sucesso para o idioma: ${lang}`);
  }
}


// ========== ATUALIZAÇÕES E GESTÃO DE INSTRUÇÕES (Funções 218 - 225) ==========  

// 218. updateInstructionsOnProgress - Atualiza instruções de progresso
function updateInstructionsOnProgress(step) {
    const instructionList = document.getElementById('instruction-list');
    if (instructionList) {
        instructionList.innerHTML = step.instructions.map(inst => `<li>${inst}</li>`).join('');
        console.log('Instruções atualizadas:', step.instructions);
    }
}

// 219. updateNavigationControls - Atualiza controles de navegação
function updateNavigationControls(isPaused) {
    const startNavButton = document.getElementById("start-navigation-button");
    const pauseNavButton = document.getElementById("pause-navigation-button");
    const continueNavButton = document.getElementById("continue-navigation-button");

    if (!startNavButton || !pauseNavButton || !continueNavButton) {
        console.error("Botões de controle não encontrados.");
        return;
    }

    if (isPaused) {
        startNavButton.style.display = "none";
        pauseNavButton.style.display = "none";
        continueNavButton.style.display = "block";
    } else {
        startNavButton.style.display = "none";
        pauseNavButton.style.display = "block";
        continueNavButton.style.display = "none";
    }

    console.log(`Controles atualizados: Navegação ${isPaused ? "pausada" : "ativa"}.`);
}

// 220. updateNavigationInstructions - Atualiza instruções de navegação
function updateNavigationInstructions(
  userLat, 
  userLon, 
  instructions, 
  currentStepIndex, 
  lang = 'pt'
) {
  if (!instructions || instructions.length === 0) {
    console.warn(getGeneralText("noInstructions", lang));
    return;
  }

  const step = instructions[currentStepIndex];
  if (!step) {
    // Se não há mais passos, possivelmente chegou ao destino
    showNotification(getGeneralText("destinationReached", lang), "success");
    console.log("Usuário completou todas as instruções.");
    return;
  }

  // Verifica distância até a próxima instrução
  const distToStep = calculateDistance(userLat, userLon, step.lat, step.lon);
  if (distToStep < 10) {
    // Usuário cumpriu essa instrução => avança
    currentStepIndex++;
    console.log("✅ Avançando para a próxima instrução (index = ", currentStepIndex, ").");
    updateInstructionModal(instructions, currentStepIndex, lang);
  }
}


// 221. updateNavigationProgress - Atualiza progresso da navegação
function updateNavigationProgress(progress) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        console.log(`Progresso atualizado para: ${progress}%`);
    }
}

// 222. updateProgressBar - Atualiza barra de progresso
function updateProgressBar(selector, progress) {
    const bar = document.querySelector(selector);
    if (bar) {
        bar.style.width = `${progress}%`;
        console.log('Barra de progresso atualizada.');
    }
}

// 223. updateUserMarker - Atualiza marcador do usuário
function updateUserMarker(lat, lon) {
    if (!window.userLocationMarker) {
        window.userLocationMarker = L.marker([lat, lon], { icon: customIcon() }).addTo(map);
    } else {
        window.userLocationMarker.setLatLng([lat, lon]);
    }

    map.setView([lat, lon], 16); // Ajusta o zoom para a posição do usuário
    console.log("📍 Posição do usuário atualizada no mapa.");
}

// 224. updateUserPositionOnRoute - Atualiza posição do usuário na rota
function updateUserPositionOnRoute(userLat, userLon, destLat, destLon) {
    const distance = calculateDistance(userLat, userLon, destLat, destLon);

    if (distance === null) {
        showNotification("Erro ao calcular a distância. Verifique os dados.", "error");
        return;
    }

    console.log(`Distância do usuário ao destino: ${distance} metros.`);

    // Recalcula apenas se o usuário estiver fora do buffer e após 5 segundos
    const now = Date.now();
    if (distance > 100 && now - lastRecalculationTime > 5000) {
        console.log("Usuário fora da rota. Iniciando recalculo...");
        showNotification("Recalculando a rota devido a desvio...", "info");
        createRouteToDestination(destLat, destLon);
        lastRecalculationTime = now;
    }

    if (distance < 50) {
        console.log("Usuário chegou ao destino.");
        endNavigation();
    }
}

// 225. validateSelectedDestination - Valida destino selecionado
function validateSelectedDestination() {
    if (!selectedDestination || !selectedDestination.lat || !selectedDestination.lon) {
        showNotification('Por favor, selecione um destino válido.', 'error');
        giveVoiceFeedback('Nenhum destino válido selecionado.');
        return false;
    }
    return true;
}

// ========== FINALIZAÇÃO DE INTERFACE E MAPA (Funções 226 - 230) ==========  

// 226. visualizeRouteOnPreview - Visualiza rota na pré-visualização
function visualizeRouteOnPreview(route) {
    if (!route || route.waypoints.length === 0) {
        showNotification('Nenhuma rota disponível para visualização.', 'warning');
        return;
    }

    clearCurrentRoute();  // Limpa a rota atual
    route.waypoints.forEach(point => {
        const marker = L.marker([point.lat, point.lon]).addTo(map)
            .bindPopup(`Parada: ${point.name}`);
        markers.push(marker);
    });

    const routeLine = L.polyline(route.waypoints.map(p => [p.lat, p.lon]), {
        color: 'blue',
        weight: 4
    }).addTo(map);

    map.fitBounds(routeLine.getBounds());
    console.log('Pré-visualização da rota ativada.');
}

// 227. zoomToSelectedArea - Aplica zoom à área selecionada
function zoomToSelectedArea(bounds) {
    if (!bounds || !bounds.isValid()) {
        console.error('Limites inválidos para aplicar zoom.');
        return;
    }
    map.fitBounds(bounds);
    console.log('Zoom aplicado à área selecionada.');
}

// 228. recenterMapOnUser - Recentraliza o mapa na posição do usuário
function recenterMapOnUser() {
    if (!userMarker) {
        showNotification('Localização do usuário não disponível.', 'warning');
        return;
    }

    const userLatLng = userMarker.getLatLng();
    map.setView(userLatLng, 15);  // Nível de zoom 15
    console.log('Mapa recentralizado na localização do usuário.');
}

// 229. clearMapLayers - Remove camadas visuais do mapa
function clearMapLayers() {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon) {
            map.removeLayer(layer);
        }
    });

    markers = [];  // Limpa o array de marcadores
    console.log('Todas as camadas visuais foram removidas do mapa.');
}

// 230. resetMapView - Restaura a visualização original do mapa
function resetMapView() {
    const defaultView = {
        lat: -13.4125,
        lon: -38.9131,
        zoom: 13
    };
    
    map.setView([defaultView.lat, defaultView.lon], defaultView.zoom);
    console.log('Visualização do mapa restaurada para o estado inicial.');
}

const navigationTexts = {
    en: {
        straight: "Continue straight for {distance} meters.",
        turnLeft: "Turn left in {distance} meters.",
        turnRight: "Turn right in {distance} meters.",
        slightLeft: "Take a slight left in {distance} meters.",
        slightRight: "Take a slight right in {distance} meters.",
        uTurn: "Make a U-turn in {distance} meters.",
        prepareLeft: "Prepare to turn left.",
        prepareRight: "Prepare to turn right.",
        offRoute: "You are off route. Recalculating...",
        arrived: "You have arrived at your destination.",
        closeToTurn: "You are close to your turn. Turn {direction} now.",
        unknown: "Unknown instruction. Please follow the map.",
    },
    pt: {
        straight: "Siga em frente por {distance} metros.",
        turnLeft: "Vire à esquerda em {distance} metros.",
        turnRight: "Vire à direita em {distance} metros.",
        slightLeft: "Vire levemente à esquerda em {distance} metros.",
        slightRight: "Vire levemente à direita em {distance} metros.",
        uTurn: "Faça um retorno em {distance} metros.",
        prepareLeft: "Prepare-se para virar à esquerda.",
        prepareRight: "Prepare-se para virar à direita.",
        offRoute: "Você saiu da rota. Recalculando...",
        arrived: "Você chegou ao seu destino.",
        closeToTurn: "Você está próximo de virar. Vire {direction} agora.",
        unknown: "Instrução desconhecida. Siga o mapa.",
    },
    es: {
        straight: "Continúe recto por {distance} metros.",
        turnLeft: "Gire a la izquierda en {distance} metros.",
        turnRight: "Gire a la derecha en {distance} metros.",
        slightLeft: "Gire ligeramente a la izquierda en {distance} metros.",
        slightRight: "Gire ligeramente a la derecha en {distance} metros.",
        uTurn: "Dé una vuelta en U en {distance} metros.",
        prepareLeft: "Prepárese para girar a la izquierda.",
        prepareRight: "Prepárese para girar a la derecha.",
        offRoute: "Está fuera de la ruta. Recalculando...",
        arrived: "Ha llegado a su destino.",
        closeToTurn: "Está cerca de girar. Gire {direction} ahora.",
        unknown: "Instrucción desconocida. Por favor siga el mapa.",
    },
    he: {
        straight: "המשך ישר למשך {distance} מטרים.",
        turnLeft: "פנה שמאלה בעוד {distance} מטרים.",
        turnRight: "פנה ימינה בעוד {distance} מטרים.",
        slightLeft: "פנה קלות שמאלה בעוד {distance} מטרים.",
        slightRight: "פנה קלות ימינה בעוד {distance} מטרים.",
        uTurn: "בצע פניית פרסה בעוד {distance} מטרים.",
        prepareLeft: "התכונן לפנות שמאלה.",
        prepareRight: "התכונן לפנות ימינה.",
        offRoute: "אתה מחוץ למסלול. מחשב מחדש...",
        arrived: "הגעת ליעד שלך.",
        closeToTurn: "אתה קרוב לפנייה. פנה {direction} עכשיו.",
        unknown: "הוראה לא ידועה. אנא עקוב אחרי המפה.",
    },
};

// 231. validateTranslations
function validateTranslations(lang) {
  // Bem parecido com updateInterfaceLanguage, mas sem alterar a UI, apenas valida
  const elementsToTranslate = document.querySelectorAll('[data-i18n]');
  let missingKeys = [];

  elementsToTranslate.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getGeneralText(key, lang);
    if (translation.startsWith('⚠️')) {
      missingKeys.push(key);
    }
  });

  if (missingKeys.length > 0) {
    console.warn('Chaves sem tradução para o idioma', lang, ':', missingKeys);
  } else {
    console.log('Todas as chaves possuem tradução em', lang);
  }
}

/**
 * cacheTranslatedInstructions
 * Armazena localmente as instruções já traduzidas (opcional).
 */
function cacheTranslatedInstructions(instructions) {
  localStorage.setItem('translatedInstructions', JSON.stringify(instructions));
  console.log('Instruções traduzidas salvas em cache local.');
}


// 232. applyLanguage
function applyLanguage(lang) {
  validateTranslations(lang);
  updateInterfaceLanguage(lang);
  console.log(`Idioma aplicado: ${lang}`);
}


// 233. awardPoinawardPointsToUser              -
function awardPointsToUser(partnerName, points) {
    let currentPoints = parseInt(localStorage.getItem('userPoints') || '0');
    currentPoints += points;
    localStorage.setItem('userPoints', currentPoints);
    showNotification(`Você ganhou ${points} ponto(s) em ${partnerName}!`, 'success', 5000);
    console.log(`Pontos totais do usuário: ${currentPoints}`);
}

// 233.1. showMarketingPopup
function showMarketingPopup(message) {
    showNotification(message, 'info', 8000);
}

// 234. addArrowToMap
function addArrowToMap(coordinate) {
    // coordinate: [lat, lon]
    // Exemplo: adiciona um pequeno ícone de seta no local
    const arrowIcon = L.divIcon({
        className: 'direction-arrow-icon',
        html: '➡️', // ou qualquer outro char/elemento
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
    L.marker(coordinate, { icon: arrowIcon }).addTo(map);
}

// Oculta todos os botões com a classe `.control-btn` na página
function hideAllButtons() {
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(button => button.style.display = 'none');
}