/*
===================================================================================
ÍNDICE DE FUNÇÕES – ESTRUTURA ORGANIZADA
(Formato: Número dentro da seção / Nome da função / Descrição)
===================================================================================

SEÇÃO 1 – CONFIGURAÇÃO
  --- 1.1. Carregamento e Idioma ---
    1. loadResources            - Carrega recursos iniciais (imagens, textos, etc.)
    2. setLanguage              - Define e salva o idioma selecionado
    3. updateInterfaceLanguage  - Atualiza os textos da interface conforme o idioma

===================================================================================
SEÇÃO 2 – VARIÁVEIS GLOBAIS
    (Nenhuma função atribuída a esta seção)

===================================================================================
SEÇÃO 3 – EVENTOS (DOMContentLoaded, setupEventListeners)
  --- 3.1. Eventos do DOM ---
    1. onDOMContentLoaded       - Executado quando o DOM carrega (busca parâmetros iniciais)
    2. setupEventListeners       - Configura listeners de clique e outros eventos
    3. handleUserIdleState       - Detecta inatividade e oferece ação

===================================================================================
SEÇÃO 4 – PERMISSÕES
    1. requestLocationPermission - Solicita permissão de localização

===================================================================================
SEÇÃO 5 – CACHE, PERSISTÊNCIA & HISTÓRICO
  --- 5.1. Cache de POIs e Rota ---
    1. cacheRouteData           - Salva dados da rota no cache
    2. loadRouteFromCache       - Carrega rota do cache
  --- 5.2. Destinos, LocalStorage e Histórico ---
    1. loadDestinationsFromCache - Carrega destinos salvos do cache
    2. getLocalStorageItem       - Recupera item do localStorage
    3. setLocalStorageItem       - Define item no localStorage
    4. removeLocalStorageItem    - Remove item do localStorage
    5. saveDestinationToCache    - Salva o destino selecionado no cache
    6. saveRouteToHistory        - Salva rota no histórico
    7. saveSearchQueryToHistory  - Salva query de pesquisa no histórico
    8. loadOfflineInstructions   - Carrega instruções offline
    9. loadSearchHistory         - Carrega e exibe histórico de pesquisas

    /**
 * Abre (ou cria) o banco de dados IndexedDB para cache offline.
 * @returns {Promise<IDBDatabase>} Promise que resolve com a instância do banco de dados.
 */
function openOfflineCacheDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("OfflineCacheDB", 1);
    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.errorCode);
      reject(event.target.errorCode);
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("routes")) {
        db.createObjectStore("routes", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("destinations")) {
        db.createObjectStore("destinations", { keyPath: "id" });
      }
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

/**
 * Cacheia os dados da rota no IndexedDB.
 * @param {string} id - Identificador único para os dados (por exemplo, uma concatenação de coordenadas ou um hash).
 * @param {Object} routeData - Dados da rota a serem armazenados.
 * @returns {Promise<boolean>} Promise que resolve com true em caso de sucesso.
 */
async function cacheRouteDataOffline(id, routeData) {
  const db = await openOfflineCacheDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["routes"], "readwrite");
    const store = transaction.objectStore("routes");
    const request = store.put({ id, data: routeData, timestamp: Date.now() });
    request.onsuccess = () => {
      console.log("Route data cached offline.");
      resolve(true);
    };
    request.onerror = (event) => {
      console.error("Error caching route data:", event);
      reject(event);
    };
  });
}

/**
 * Recupera os dados de rota cacheados do IndexedDB.
 * @param {string} id - Identificador usado para armazenar os dados.
 * @returns {Promise<Object>} Promise que resolve com os dados cacheados ou undefined.
 */
async function getRouteDataOffline(id) {
  const db = await openOfflineCacheDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["routes"], "readonly");
    const store = transaction.objectStore("routes");
    const request = store.get(id);
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      console.error("Error retrieving route data:", event);
      reject(event);
    };
  });
}

/**
 * Realiza uma requisição fetch para obter dados e, em caso de falha, tenta utilizar dados cacheados.
 * @param {string} url - URL da requisição.
 * @param {string} cacheId - Identificador para armazenar ou recuperar os dados do cache.
 * @returns {Promise<Object>} Dados obtidos via rede ou do cache offline.
 */
async function fetchDataWithOfflineFallback(url, cacheId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    // Cacheia os dados para uso offline
    await cacheRouteDataOffline(cacheId, data);
    return data;
  } catch (error) {
    console.error("Fetch failed, trying offline cache:", error);
    const cached = await getRouteDataOffline(cacheId);
    if (cached && cached.data) {
      console.log("Using cached data.");
      return cached.data;
    } else {
      throw new Error("No offline data available");
    }
  }
}

/**
 * Ajusta a frequência de atualizações da interface com base na velocidade do usuário.
 * Se a velocidade for alta, retorna um intervalo maior para as atualizações.
 * @param {number} speed - Velocidade em m/s.
 * @returns {number} - Intervalo em milissegundos para a próxima atualização.
 */
function getUpdateIntervalBasedOnSpeed(speed) {
  // Exemplo simples: se a velocidade for superior a 5 m/s, aumenta o intervalo para 1000ms, caso contrário 500ms.
  return speed > 5 ? 1000 : 500;
}


/*

===================================================================================
SEÇÃO 6 – INICIALIZAÇÃO
  --- 6.1. Configuração de Mapa ---
    1. initializeMap            - Inicializa o mapa e configura camadas
    2. getTileLayer             - Retorna camada de tiles para o mapa

===================================================================================
SEÇÃO 7 – STATE (Persistência do Estado e Navegação)
    1. initNavigationState      - Reinicializa o estado global de navegação
    2. saveNavigationState      - Salva o estado de navegação
    3. restoreNavigationState   - Restaura o estado de navegação
    4. saveStateToServiceWorker - Envia estado ao Service Worker
    5. autoRestoreState         - Solicita restauração automática de estado
    6. restoreState             - Restaura o estado completo do sistema
    7. updateNavigationState    - Atualiza o objeto global de navegação
    8. sendDestinationToServiceWorker - Envia o destino selecionado ao Service Worker

===================================================================================
SEÇÃO 8 – MAPA (Visualização, Animação e Ajustes Avançados)
  --- 8.1. Visualização e Animação do Mapa ---
    1. resetMapView             - Restaura a visualização original do mapa
    2. adjustMapWithLocationUser - Centraliza o mapa no usuário com popup
    3. adjustMapWithLocation    - Ajusta o mapa para [lat,lon], com offset e zoom
    4. clearMarkers             - Remove marcadores do mapa
    5. restoreFeatureUI         - Restaura a interface para a feature anterior
    6. visualizeRouteOnPreview  - Exibe a rota na pré-visualização
    7. zoomToSelectedArea       - Aplica zoom aos limites (bounds)
    8. recenterMapOnUser        - Recentraliza o mapa no usuário
    9. clearMapLayers           - Remove todas as camadas de marcadores/linhas
    10. addArrowToMap           - Adiciona ícone de seta no mapa
    11. createCustomIcon        - Cria ícone personalizado para marcadores
  --- 8.2. Exibição de Dados Customizados e Ajustes Avançados ---
    1. displayCustomAbout       - Exibe informação “Sobre” customizada
    2. displayCustomBeaches     - Exibe praias customizadas
    3. displayCustomEducation   - Exibe dados educacionais customizados
    4. displayCustomEmergencies - Exibe dados de emergência customizados
    5. displayCustomInns        - Exibe dados de pousadas customizados
    6. displayCustomItems       - Exibe itens customizados
    7. displayCustomNightlife   - Exibe dados de vida noturna customizados
    8. displayCustomRestaurants - Exibe dados de restaurantes customizados
    9. displayCustomShops       - Exibe dados de lojas customizados
    10. displayCustomTips       - Exibe dicas customizadas
    11. displayCustomTouristSpots - Exibe pontos turísticos customizados
    12. displayCustomTours      - Exibe lista de passeios customizados
    13. showMarketingPopup      - Exibe popup de marketing avançado
  --- 8.3. Integração de Localização e Rotação ---
    1. initContinuousLocationTracking - Inicia o tracking contínuo da posição do usuário
    2. deviceOrientationHandler - Processa dados de orientação do dispositivo
    3. setFirstPersonView       - Ajusta o mapa para visualização em primeira pessoa
    4. setMapRotation           - Aplica rotação no mapa conforme heading
    5. animateMarker            - Anima a transição do marcador entre posições
  --- 8.4. Ajustes Avançados de Mapa & Visualização ---
    1. visualizeRouteOnPreview  - Exibe rota na pré-visualização
    2. zoomToSelectedArea       - Aplica zoom aos bounds
    3. recenterMapOnUser        - Recentraliza o mapa no usuário
    4. clearMapLayers           - Remove todas as camadas de marcadores/linhas
    5. addArrowToMap            - Adiciona ícone de seta no mapa
    6. clearRouteMarkers        - Remove marcadores de rota (origem/destino)

===================================================================================
SEÇÃO 9 – INTERAÇÃO NO MAPA OSM
  --- 9.1. Exibição e Controle de Instruções ---
    1. showInstructionsWithTooltip - Exibe instruções no mapa via tooltips
    2. showInstructionsOnMap       - Exibe instruções no mapa (popups/tooltips)
    3. goToInstructionStep         - Define um passo específico como atual
    4. nextInstructionStep         - Avança para a próxima instrução
    5. prevInstructionStep         - Retrocede para a instrução anterior
  --- 9.2. Rotas Alternativas e Ajustes ---
    1. showRouteAlternatives       - Exibe múltiplas rotas no mapa
    2. calculateETA                - Estima o tempo de chegada (ETA)
    3. handleNextInstructionIfClose - Avança o passo se o usuário estiver próximo
    4. customizeOSMPopup           - Personaliza o estilo e tamanho do popup Leaflet
  --- 9.3. Busca e exibe dados do OSM ---
    1. fetchOSMData               - Busca dados do OSM (Overpass)
    2. displayOSMData             - Exibe dados do OSM (Overpass) no formato adequado
  

===================================================================================
SEÇÃO 10 – LOCALIZAÇÃO & RASTREAMENTO
  --- 10.1. Obtenção da Localização ---
    1. getCurrentLocation         - Obtém a localização atual do usuário
    2. useCurrentLocation         - Centraliza o mapa na posição atual do usuário
  --- 10.2. Rastreamento Contínuo ---
    1. startPositionTracking      - Inicia o rastreamento contínuo da posição do usuário
    2. startUserTracking          - Controla o watchPosition do usuário
    3. updateMapWithUserLocation  - Atualiza o mapa com a localização do usuário
    4. detectMotion               - Detecta movimento do dispositivo (eventos de devicemotion)
  --- 10.3. Atualização de Marcadores ---
    1. centerMapOnUser            - Centraliza o mapa na localização do usuário
    2. updateUserMarker           - Cria/atualiza o marcador do usuário no mapa
    3. updateUserPositionOnRoute  - Atualiza a posição do usuário sobre a rota ativa
  --- 10.4. Finalização do Rastreamento ---
    1. stopPositionTracking       - Interrompe o rastreamento de posição (clearWatch)
    2. clearAllMarkers            - Remove todos os marcadores do mapa

===================================================================================
SEÇÃO 11 – CRIAÇÃO DE ROTAS
    1. startRouteCreation         - Inicia a criação de rota
    2. createRoute                - Inicia a criação da rota no mapa
    3. plotRouteOnMap             - Plota a rota no mapa usando a API ORS
    4. calculateDistance          - Calcula a distância (em metros) entre dois pontos (lat/lon)
    5. distanceToPolyline         - Calcula a menor distância entre um ponto e uma polilinha
    6. pointToSegmentDistance     - Calcula a distância de um ponto a um segmento
    7. clearCurrentRoute          - Remove a rota atual do mapa
    8. getClosestPointOnRoute     - Calcula o ponto mais próximo na rota
    9. computeBearing             - Calcula o rumo (bearing) entre dois pontos
    10. showRouteLoadingIndicator - Adiciona um indicador de carregamento antes da rota ser traçada  
    11. hideRouteLoadingIndicator - Remove o indicador de carregamento antes da rota ser traçada  
    12. fetchMultipleRouteOptions - Cria um sistema de múltiplas rotas e permitir que o usuário escolha
    13. applyRouteStyling         - Cria gradientes de cor e adicionar ícones personalizados.

===================================================================================
SEÇÃO 12 – NAVEGAÇÃO
  --- 12.1. Controle de Navegação ---
    1. startNavigation            - Inicia a navegação para o destino selecionado
    2. endNavigation              - Finaliza a navegação e limpa estados
    3. pauseNavigation            - Pausa a navegação
    4. toggleNavigationPause      - Alterna entre pausar e retomar a navegação
    5. updateRealTimeNavigation   - Atualiza instruções em tempo real
    6. adjustMapZoomBasedOnSpeed  - Cria um sistema de zoom dinâmico que ajusta o zoom com base na velocidade
    7. getRouteBearingForUser     - Calcula o rumo que o usuário deve seguir com base na rota
    8. clearUserMarker            - Remove o marcador do usuário e o círculo de precisão do mapa
  --- 12.2. Recalibração e Notificações ---
    1. recalculateRoute           - Recalcula a rota em caso de desvio
    2. notifyDeviation            - Notifica o usuário sobre desvio
    3. validateDestination        - Verifica se o destino possui coordenadas válidas
    4. handleRecalculation        - Lida com o recálculo automático
    5. highlightNextStepInMap     - Destaca visualmente o próximo passo no mapa
    6. notifyRouteDeviation       - Notifica desvio de rota
    7. notifyNextInstruction      - Exibe a próxima instrução de navegação
    8. shouldRecalculateRoute     - Verifica se é necessário recalcular a rota
    9. checkIfUserIdle            - Verifica se o usuário está inativo
  --- 12.3. Enriquecimento das Instruções ---
    1. validateRouteData          - Valida dados retornados pela API de rota
    2. startRoutePreview          - Exibe pré-visualização da rota
    3. drawPath                   - Desenha uma polyline com o caminho da rota
    4. enrichInstructionsWithOSM  - Enriquece instruções com dados adicionais do OSM
    5. fetchRouteInstructions     - Busca instruções de rota (turn-by-turn) via API ORS
    6. finalizeRouteMarkers       - Adiciona marcadores de origem/destino
    7. recalcRouteOnDeviation     - Recalcula a rota ao detectar desvio
    8. updateRouteFooter          - Atualiza o rodapé com distância/tempo
    9. updateInstructionBanner    - Atualiza o banner com a instrução atual
    10. updateNavigationInstructions - Lida com instruções em tempo real
    11. updateNavigationProgress   - Atualiza a barra de progresso
    12. updateRoutePreview         - Atualiza o container com pré-visualização de rota
  --- 12.4. Rotina de Navegação ---
    1. autoRotationAuto           - Inicia a rotação automática do mapa   
    2. stopRotationAuto           - Interrompe a rotação automática do mapa
    3. simulateNavigation         - Cria um modo de simulação, movendo o marcador pelo trajeto automaticamente 
  --- 12.5. Formatação, animação e Exibição de Instruções ---
    1. buildInstructionMessage    - Constrói mensagem curta a partir do texto bruto da instrução
    2. updateInstructionDisplay   - Atualiza e exibe a lista de instruções na interface
    3. mapORSInstruction          - Extrai dados da instrução bruta (manobra, local, preposição)
    4. animateMapToDestination    - Cria uma animação suave no mapa ao iniciar a navegação
    5. hideRouteFooter            - Esconde o rodapé do resumo da rota
    6. hideInstructionBanner      - Esconde o banner de instruções 

===================================================================================
SEÇÃO 13 – TUTORIAL & ASSISTENTE VIRTUAL
  --- 13.1. Fluxo do Tutorial ---
    1. startTutorial              - Inicia o tutorial interativo
    2. endTutorial                - Finaliza o tutorial
    3. nextTutorialStep           - Avança para o próximo passo do tutorial
    4. previousTutorialStep       - Retorna ao passo anterior
    5. showTutorialStep           - Exibe o conteúdo de um passo do tutorial
  --- 13.2. Armazenamento de Respostas e Interesses ---
    1. storeAndProceed            - Armazena resposta do usuário e prossegue
    2. generateInterestSteps      - Gera passos com base em interesses
    3. removeExistingHighlights   - Remove destaques visuais
  --- 13.3. Funções Adicionais de Tutorial & Assistente ---
    1. initializeTutorialListeners - Inicializa os listeners do tutorial
    2. setupSubmenuClickListeners   - Configura os cliques dos submenus
    3. showButtons                  - Exibe botões da interface do tutorial
    4. highlightElement             - Destaca visualmente um elemento

===================================================================================
SEÇÃO 14 – INTERFACE & CONTROLE VISUAL
  --- 14.1. Mensagens e Barras ---
    1. showWelcomeMessage         - Exibe a mensagem de boas-vindas e botões de idioma
    2. showNavigationBar          - Mostra a barra de navegação na interface
  --- 14.2. Resumo e Destaques ---
    1. displayRouteSummary        - Exibe um resumo da rota
    2. highlightCriticalInstruction - Destaca instrução crítica
  --- 14.3. Exibição/Ocultação de Controles ---
    1. hideAllControls            - Oculta todos os controles e botões
    2. showRoutePreview           - Exibe a pré-visualização da rota
    3. hideRoutePreview           - Oculta a pré-visualização da rota
  --- 14.4. Elementos Visuais no Mapa ---
    1. addDirectionArrows         - Adiciona setas de direção ao longo da rota
    2. showUserLocationPopup      - Exibe popup com “Você está aqui!”
  --- 14.5. Instruções e Modais ---
    1. displayStartNavigationButton - Mostra o botão para iniciar a navegação
    2. displayStepByStepInstructions - Lista de instruções roláveis
    3. fetchNextThreeInstructions  - Retorna as próximas três instruções
    4. enqueueInstruction          - Enfileira uma nova instrução
    5. updateInstructionModal      - Atualiza o modal de instruções
  --- 14.6. Modais e Animações ---
    1. toggleModals               - Alterna a visibilidade de modais
    2. showModal                  - Exibe um modal específico
    3. closeCarouselModal         - Fecha o modal do carrossel
    4. closeAssistantModal        - Fecha o modal do assistente
    5. animateInstructionChange   - Anima a troca de instruções
    6. updateAssistantModalContent - Atualiza o conteúdo do modal do assistente

===================================================================================
SEÇÃO 15 – CONTROLE DE MENU, BOTÕES & INTERFACE
  --- 15.1. Controle de Menu & Interface ---
    1. toggleNavigationInstructions - Alterna a visibilidade das instruções
    2. toggleRouteSummary         - Alterna a exibição do resumo de rota
    3. toggleMenu                 - Alterna a exibição do menu lateral
    4. hideAllButtons             - Oculta todos os botões de determinada classe
    5. hideAllControlButtons      - Oculta todos os botões de controle
    6. hideAssistantModal         - Fecha o modal do assistente
    7. hideControlButtons         - Oculta botões de controle específicos
    8. hideNavigationBar          - Oculta a barra de navegação
    9. hideRouteSummary           - Oculta o resumo da rota
    10. closeSideMenu             - Fecha o menu lateral
  --- 15.2. Controle de Botões ---
    1. showControlButtonsTouristSpots - Exibe botões de controle para pontos turísticos
    2. showControlButtonsTour     - Exibe botões de controle para passeios
    3. showControlButtonsBeaches  - Exibe botões de controle para praias
    4. showControlButtonsNightlife - Exibe botões de controle para vida noturna
    5. showControlButtonsRestaurants - Exibe botões de controle para restaurantes
    6. showControlButtonsShops      - Exibe botões de controle para lojas
    7. showControlButtonsEmergencies - Exibe botões de controle para emergências
    8. showControlButtonsTips       - Exibe botões de controle para dicas
    9. showControlButtonsInns       - Exibe botões de controle para pousadas
    10. showControlButtonsEducation - Exibe botões de controle para ensino
    11. showMenuButton              - Exibe os botões do menu lateral 
    12. showButtons                 - Exibe um grupo de botões com base em seus IDs.

===================================================================================
SEÇÃO 16 – SUBMENUS
    1. handleSubmenuButtonClick   - Lógica de clique em botões de submenu
    2. handleSubmenuButtonsTouristSpots - Gerencia submenu de pontos turísticos
    3. handleSubmenuButtonsTours  - Gerencia submenu de passeios
    4. handleSubmenuButtonsBeaches - Gerencia submenu de praias
    5. handleSubmenuButtonsRestaurants - Gerencia submenu de restaurantes
    6. handleSubmenuButtonsShops  - Gerencia submenu de lojas
    7. handleSubmenuButtonsEmergencies - Gerencia submenu de emergências
    8. handleSubmenuButtonsEducation - Gerencia submenu de educação
    9. handleSubmenuButtonsInns    - Gerencia submenu de pousadas
    10. handleSubmenuButtonsTips   - Gerencia submenu de dicas
    11. loadSubMenu               - Carrega conteúdo de submenu
    12. handleSubmenuButtons      -
    13. setupSubmenuClickListeners-     

===================================================================================
SEÇÃO 17 – TRADUÇÃO & INTERNACIONALIZAÇÃO
    1. translateInstruction       - Traduz uma instrução
    2. translatePageContent       - Atualiza todo texto conforme idioma
    3. validateTranslations       - Verifica se as chaves de tradução estão definidas
    4. applyLanguage              - Aplica o idioma em toda a interface
    5. getGeneralText             - Retorna texto traduzido para uma chave

===================================================================================
SEÇÃO 18 – VOZ & INTERAÇÃO
  --- 19.1. Reconhecimento e Feedback de Voz ---
    1. startVoiceRecognition      - Inicia o reconhecimento de voz
    2. visualizeVoiceCapture      - Efeito visual ao capturar voz
    3. interpretCommand           - Interpreta o comando de voz
    4. confirmCommandFeedback     - Fornece feedback textual do comando
    5. confirmAudioCommand        - Exibe mensagem de confirmação do comando
  --- 19.2. Integração com POIs e Multimodalidade ---
    1. detectPOI                  - Detecta pontos de interesse
    2. validatePOIResults         - Valida os resultados de POIs
    3. displayPOIInAR             - Exibe POIs em AR (Realidade Aumentada)
    4. integrateMultimodalRoute   - Integra rotas de diferentes modais
  --- 19.3. Gerenciamento do Reconhecimento de Voz ---
    1. retryVoiceRecognition      - Reinicia o reconhecimento de voz após erro
    2. cancelVoiceRecognition     - Cancela o reconhecimento de voz
  --- 19.4. Síntese de Voz ---
    1. giveVoiceFeedback          - Converte texto em áudio
    2. speakInstruction           - Fala a instrução via SpeechSynthesis

===================================================================================
SEÇÃO 19 – GAMIFICAÇÃO E MARKETING
    1. checkNearbyPartners        - Verifica se o usuário está próximo de parceiros
    2. handleUserArrivalAtPartner - Lida com a chegada do usuário no parceiro
    3. awardPointsToUser          - Concede pontos ao usuário
    4. handleReservation          - Processa a reserva do destino
    5. showMarketingPopup         - Exibe popup de marketing

===================================================================================
SEÇÃO 20 – NOTIFICAÇÕES
    1. showNotification           - Exibe uma notificação para o usuário

===================================================================================
FIM DO ÍNDICE DE FUNÇÕES
===================================================================================*/

/**===========================================================================
SEÇÃO 1 – CONFIGURAÇÃO
===========================================================================
  --- 1.1. Carregamento e Idioma ---

    1. loadResources - Carrega recursos iniciais (imagens, textos, etc.) */
    async function loadResources(callback) {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (loader) loader.style.display = "none";
    console.log("Recursos carregados com sucesso!");
    if (typeof callback === "function") callback();
  } catch (error) {
    if (loader) loader.style.display = "none";
    console.error("Falha ao carregar recursos:", error);
  }
} /*
    2. setLanguage - Define e salva o idioma selecionado */
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

    console.log(`Idioma definido para: ${lang}`);
    // opcionalmente iniciar tutorial
    showTutorialStep("start-tutorial");
  } catch (error) {
    console.error(getGeneralText("routeError", selectedLanguage), error);
    showNotification(getGeneralText("routeError", selectedLanguage), "error");
  }
} /*
    3. updateInterfaceLanguage - Atualiza os textos da interface conforme o idioma */

function updateInterfaceLanguage(lang) {
    const elementsToTranslate = document.querySelectorAll("[data-i18n]");
    let missingTranslations = 0;

    elementsToTranslate.forEach((element) => {
        const key = element.getAttribute("data-i18n");
        let translation = getGeneralText(key, lang);

        if (!translation || translation.startsWith("⚠️")) {
            missingTranslations++;
            console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
            translation = key; // Usa a chave original se não houver tradução
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

/*

/*===========================================================================
  SEÇÃO 2 – VARIÁVEIS GLOBAIS NECESSÁRIAS PARA O FLUXO DE NAVEGAÇÃO
===========================================================================*/

// Variáveis essenciais para a instância do mapa e configuração geral
let map;                                  // Instância do mapa (ex.: Leaflet)
let selectedLanguage = getLocalStorageItem('preferredLanguage', 'pt'); // Idioma selecionado (padrão 'pt')

// Variáveis de destino e localização do usuário
let selectedDestination = {};             // Objeto com as propriedades do destino (lat, lon, name, etc.)
let userLocation = null;                  // Última localização conhecida do usuário (atualizada pelo GPS)

// Variáveis para controle e exibição de marcadores e rota
let markers = [];                         // Array que armazena todos os marcadores adicionados ao mapa
let currentRoute = null;                  // Camada (polyline) da rota atual exibida no mapa
let userMarker = null;                    // Marcador que representa a posição atual do usuário
let destinationMarker = null;             // Marcador para o destino

// Variáveis auxiliares de navegação e controle de UI
let currentSubMenu = null;
let currentLocation = null;
let currentStep = null;
let tutorialIsActive = false;
let searchHistory = [];
let achievements = [];
let favorites = [];
let routingControl = null;
let speechSynthesisUtterance = null;
let voices = [];
let currentMarker = null;
let swiperInstance = null;
let selectedProfile = 'foot-walking';     // Perfil de rota padrão
let userLocationMarker = null;
let userCurrentLocation = null;
let currentRouteData = null;
let isNavigationActive = false;
let isnavigationPaused = false;
let currentRouteSteps = [];
let navigationWatchId = null;
let cachedLocation = null;
let locationPermissionGranted = false;
let instructions = [];
let lastRecalculationTime = 0;
let lastDeviationTime = 0;
let currentStepIndex = 0;
let debounceTimer = null;
let trackingActive = false;
let watchId = null;
let userPosition = null;

// Objeto global para armazenar o estado da navegação.
// Este objeto é utilizado para controlar flags, índices e buffers durante o fluxo.
const navigationState = {
  // Controle básico da navegação
  isActive: false,               // Indica se a navegação está ativa
  isPaused: false,               // Indica se a navegação está pausada
  watchId: null,                 // ID do watchPosition (se aplicável)
  currentStepIndex: 0,           // Índice do passo atual na rota
  instructions: [],              // Array de instruções (passos da rota)
  selectedDestination: null,     // Destino selecionado
  lang: 'pt',                    // Idioma atual

  // Propriedades para controle da rotação
  isRotationEnabled: true,       // Habilita ou desabilita a rotação automática
  quietMode: true,               // Se true, ativa o modo silencioso (atualizações menos frequentes)
  rotationInterval: 1000,        // Intervalo mínimo (em ms) entre atualizações de rotação
  speed: 0,                      // Velocidade atual do usuário em m/s (atualize conforme necessário)
  manualOverride: false,         // Se true, ignora rotações automáticas e usa manualAngle
  manualAngle: 0,                // Ângulo manual (em graus) a ser aplicado se manualOverride for true
  tilt: 10,                      // Inclinação (em graus) aplicada na visualização (ex.: para efeito 3D)
  rotationMode: "compass",       // Define o modo de rotação ("north-up" para fixo no norte ou "compass" para seguir o heading)
  headingBuffer: [],             // Buffer para armazenar leituras de heading e suavizar a rotação
  minRotationDelta: 2,           // Variação mínima (em graus) necessária para atualizar a rotação
  alpha: 0.2,                    // Fator de suavização (valor entre 0 e 1)
  currentHeading: 0,             // Último heading (em graus) aplicado na rotação
  lastRotationTime: 0            // Timestamp da última atualização de rotação (em ms)
};



// Variável global para o ID do watchPosition (armazenada na propriedade window.positionWatcher)
window.positionWatcher = null;

// Exemplo de contêineres do DOM
const notificationContainer = document.getElementById("notification-container");
const navigationInstructionsContainer = document.getElementById("route-summary");
const progressBar = document.getElementById("progress-bar");

// Exemplo de chaves e constantes:
const ORS_API_KEY = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
const apiKey = '5b3ce3597851110001cf62480e27ce5b5dcf4e75a9813468e027d0d3';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Exemplo de queries Overpass
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

// Exemplo de gamificação
const TOCA_DO_MORCEGO_COORDS = { lat: -13.3782, lon: -38.9140 };
const PARTNER_CHECKIN_RADIUS = 50; /*

===========================================================================
SEÇÃO 3 – EVENTOS (DOMContentLoaded, setupEventListeners)
===========================================================================
  --- 3.1. Eventos do DOM ---
    1. onDOMContentLoaded       - Executado quando o DOM carrega (busca parâmetros iniciais)*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    initializeMap();
    loadResources();
    showWelcomeMessage();
    setupEventListeners();
    autoAdjustTheme();
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
  }
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker registrado com sucesso!'))
      .catch(error => console.error('Erro ao registrar o Service Worker:', error));
  } else {
    console.warn("Service Workers não são suportados neste navegador.");
  }
}

// Certifique-se de rodar em um servidor local (ex.: http://localhost)
registerServiceWorker();

function fetchDirections(start, end, apiKey) {
  const url = `https://api.openrouteservice.org/v2/directions/foot-walking?start=${start}&end=${end}&key=${apiKey}&instructions=true`;
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} (${response.statusText})`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Dados recebidos da API:", data);
      // Processa os dados como necessário
    })
    .catch(error => {
      console.error("Erro ao obter direções:", error);
    });
}

// Exemplo de uso:
const start = "-38.917155,latitude_origem";
const end = "long_destino,latitude_destino";
fetchDirections(start, end, apiKey);
   
/**
 * 2. setupEventListeners - Configura os event listeners (já implementado em parte no DOMContentLoaded).
 */
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

    // Evento para o botão "start-navigation-btn"
const startNavigationRodapeBtn = document.getElementById('start-navigation-rodape-btn');
if (startNavigationRodapeBtn) {
  startNavigationRodapeBtn.addEventListener('click', () => {
    console.log("✅ Botão 'start-navigation-rodape-btn' clicado!");
    startNavigation();
  });
}


// Evento para o botão "menu-details-btn"
const menuDetailsBtn = document.getElementById("menu-details-btn");
if (menuDetailsBtn) {
  menuDetailsBtn.addEventListener("click", () => {
    console.log("✅ Botão 'menu-details-btn' clicado!");
    clearRouteMarkers();
    hideInstructionBanner();
    showTutorialStep('ask-interest'); // ou showTutorialStep('someStep') se for esse o caso
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

// Evento para o botão "cancel-route-btn"
const cancelRouteBtn = document.getElementById("cancel-route-btn");
if (cancelRouteBtn) {
  cancelRouteBtn.addEventListener("click", () => {
        console.log("✅ Botão 'cancel-route-btn' clicado!");
    // Finaliza a navegação, desfazendo todas as ações iniciadas pelo fluxo de startNavigation
    endNavigation();
    // Em seguida, restaura a interface para a última feature selecionada
    // (Utiliza a variável global 'lastSelectedFeature' que deve ter sido atualizada quando o usuário selecionou uma feature)

      restoreFeatureUI(Feature);
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


// Evento para botões do menu flutuante
document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
    btn.addEventListener('click', (event) => {
        const feature = btn.getAttribute('data-feature');
        console.log(`Feature selecionada: ${feature}`);
        handleFeatureSelection(feature);
        closeCarouselModal();
        event.stopPropagation();
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

    document.getElementById('carousel-modal-close').addEventListener('click', function() {
  const modal = document.getElementById('carousel-modal');
  if (modal) {
    modal.style.display = 'none';
  }
});


    

if (startCreateRouteBtn) {
    startCreateRouteBtn.addEventListener('click', () => {
        startRouteCreation();
    });
}


    if (carouselModalClose) {
        carouselModalClose.addEventListener('click', closeCarouselModal);
    }



    const tutorialYesBtn = document.getElementById('tutorial-yes-btn');
    const tutorialSiteYesBtn = document.getElementById('tutorial-site-yes-btn');
    const tutorialNoBtn = document.getElementById('tutorial-no-btn');
    const tutorialSendBtn = document.getElementById('tutorial-send-btn');
    const showItineraryBtn = document.getElementById('show-itinerary-btn');
    const generateNewItineraryBtn = document.getElementById('generate-new-itinerary-btn');
    const changePreferencesBtn = document.getElementById('change-preferences-btn');
    const accessSiteBtn = document.getElementById('access-site-btn');
  }

/**
 * 3. handleUserIdleState - Detecta inatividade e oferece ação.
 */
function handleUserIdleState(lastLocation, currentLocation) {
  const movedDistance = calculateDistance(
    lastLocation.latitude,
    lastLocation.longitude,
    currentLocation.latitude,
    currentLocation.longitude
  );
  if (movedDistance < 5) {
    showNotification("Você está inativo. Deseja recalcular a rota?", "info");
    console.log("handleUserIdleState: Usuário inativo detectado.");
  }
}

/**===========================================================================
SEÇÃO 4 – PERMISSÕES
===========================================================================
/**
 * 1. requestLocationPermission - Solicita permissão de geolocalização.
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
} /*

===========================================================================
SEÇÃO 5 – CACHE, PERSISTÊNCIA & HISTÓRICO
===========================================================================
  --- 5.1. Cache de POIs e Rota ---
/**
 * 1. cacheRouteData - Salva dados da rota (instruções e polyline) no cache local (localStorage).
 */
function cacheRouteData(routeInstructions, routeLatLngs) {
  if (typeof localStorage === "undefined") {
    console.warn("LocalStorage não está disponível.");
    return;
  }
  try {
    const data = {
      instructions: routeInstructions,
      route: routeLatLngs,
      timestamp: Date.now()
    };
    localStorage.setItem('cachedRoute', JSON.stringify(data));
    console.log("[cacheRouteData] Rota salva no cache local (localStorage).");
    showNotification("Rota salva em cache para uso offline.", "success");
  } catch (err) {
    console.error("[cacheRouteData] Erro ao salvar rota no cache:", err);
    showNotification(getGeneralText("routeDataError", navigationState.lang), "error");
  }
}

/*
 * 2. loadRouteFromCache - Carrega rota salva do cache (localStorage). */
function loadRouteFromCache() {
  if (typeof localStorage === "undefined") {
    console.warn("LocalStorage não está disponível.");
    return null;
  }
  try {
    const dataStr = localStorage.getItem('cachedRoute');
    if (!dataStr) {
      console.warn("[loadRouteFromCache] Nenhuma rota salva no cache.");
      return null;
    }
    const data = JSON.parse(dataStr);
    console.log("[loadRouteFromCache] Rota carregada do cache:", data);
    showNotification("Rota carregada do cache com sucesso.", "info");
    return data;
  } catch (err) {
    console.error("[loadRouteFromCache] Erro ao carregar rota do cache:", err);
    showNotification(getGeneralText("routeDataError", navigationState.lang), "error");
    return null;
  }
} /*

  --- 5.2. Destinos, LocalStorage e Histórico ---
 /**
 * 1. loadDestinationsFromCache - Carrega destinos salvos do cache (ou Service Worker). */
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
} /*

/**
 * 2. getLocalStorageItem - Recupera item do localStorage, parseando JSON.
 */
function getLocalStorageItem(key) {
  const item = localStorage.getItem(key);
  try {
    return JSON.parse(item); // Tenta converter o valor para JSON
  } catch (error) {
    console.error(`Erro ao analisar JSON para a chave ${key}:`, error);
    return item; // Retorna o valor bruto se não for JSON válido
  }
}

/**
 * 3. setLocalStorageItem - Define item no localStorage, convertendo para JSON.
 */
function setLocalStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value)); // Armazena o valor de forma segura como JSON
}

/**
 * 4. removeLocalStorageItem - Remove item do localStorage por chave.
 */
function removeLocalStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erro ao remover item do localStorage (${key}):`, error);
  }
}

/**
 * 5. saveDestinationToCache - Salva destino selecionado no cache local.
 */
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

/**
 * 6. saveRouteToHistory - Salva rota no histórico (localStorage).
 */
function saveRouteToHistory(route) {
  const historyStr = localStorage.getItem("routeHistory") || "[]";
  const history = JSON.parse(historyStr);
  history.push(route);
  localStorage.setItem("routeHistory", JSON.stringify(history));
  console.log("Rota salva no histórico (routeHistory).");
}

/**
 * 7. saveSearchQueryToHistory - Salva query de pesquisa no histórico.
 */
function saveSearchQueryToHistory(query) {
  const searchHistoryStr = localStorage.getItem("searchHistory") || "[]";
  const searchHistoryArr = JSON.parse(searchHistoryStr);
  searchHistoryArr.push(query);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
  console.log("Consulta de pesquisa salva no histórico:", query);
}

/**
 * 8. loadOfflineInstructions - Carrega instruções offline (ex.: localStorage).
 */
function loadOfflineInstructions() {
  const cachedInstr = localStorage.getItem("offlineInstructions");
  if (cachedInstr) {
    return JSON.parse(cachedInstr);
  } else {
    console.warn("Nenhuma instrução offline encontrada.");
    return [];
  }
}

/**
 * 9. loadSearchHistory
 *    Carrega o histórico de buscas do localStorage e exibe na interface.
 */
function loadSearchHistory() {
    const history = getLocalStorageItem('searchHistory', []);
    searchHistory = history; // Atualiza a variável global

    const historyContainer = document.getElementById('search-history-container');
    if (historyContainer) {
        historyContainer.innerHTML = '';
        history.forEach(query => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = query;
            historyContainer.appendChild(historyItem);
        });
    }
} /*

===========================================================================
SEÇÃO 6 – INICIALIZAÇÃO
===========================================================================
  --- 6.1. Configuração de Mapa ---

/**
 * 1. initializeMap
 * Inicializa o mapa e configura as camadas de tiles.
 */
function initializeMap() {
  if (map) {
    console.warn("Mapa já inicializado.");
    return;
  }
  console.log("Inicializando mapa...");

  // Define as camadas de tiles
  const tileLayers = {
    streets: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }),
    satellite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "© Esri",
      maxZoom: 19,
    }),
  };

  // Cria o mapa com uma visão inicial (esta posição será atualizada quando a localização do usuário for obtida)
  map = L.map("map", {
    layers: [tileLayers.streets],
    zoomControl: false,
    maxZoom: 19,
    minZoom: 3,
  }).setView([-13.378, -38.918], 14);

  // Adiciona o controle de camadas
  L.control.layers(tileLayers).addTo(map);

if (typeof RotationPlugin !== "undefined") {
  RotationPlugin.initialize();
} else {
  console.warn("Plugin de rotação não encontrado. Usando CSS para rotação.");
  // Código alternativo para rotação via CSS
}
}
/**
 * 2. getTileLayer
 *    Retorna uma camada de tiles (fallback).
 */
function getTileLayer() {
  return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  });
}

/**

===========================================================================
SEÇÃO 7 – STATE (Persistência do Estado e Navegação)
===========================================================================
/* 1. initNavigationState
 * Reinicializa o objeto global de navegação, limpando estados anteriores. */
function initNavigationState() {
  console.log("[initNavigationState] Reinicializando estado de navegação...");
  // Reseta flags e variáveis do objeto global navigationState
  navigationState.isActive = false;
  navigationState.isPaused = false;
  navigationState.watchId = null;
  navigationState.currentStepIndex = 0;
  navigationState.instructions = [];
  navigationState.selectedDestination = null;
  // Se já houver uma camada de rota ativa, remove-a do mapa
  if (navigationState.currentRouteLayer) {
    map.removeLayer(navigationState.currentRouteLayer);
    navigationState.currentRouteLayer = null;
  }
  console.log("[initNavigationState] Estado de navegação reinicializado.");
}



/**
 * 2. saveNavigationState - Salva o estado de navegação no sessionStorage (exemplo).
 */
function saveNavigationState(state) {
  if (!state) {
    console.warn("Nenhum estado de navegação para salvar.");
    return;
  }
  sessionStorage.setItem("navState", JSON.stringify(state));
  showNotification("Estado de navegação salvo.", "success");
  console.log("Estado salvo:", state);
}

/**
 * 3. restoreNavigationState - Restaura o estado de navegação salvo no sessionStorage.
 */
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

/**
 * 4. saveStateToServiceWorker - Salva estado de navegação no Service Worker.
 */
function saveStateToServiceWorker() {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
        console.warn("Service Worker não está ativo. Não foi possível salvar estado.");
        return;
    }

    navigator.serviceWorker.controller.postMessage({
        action: "saveState",
        payload: {
            userPosition,
            selectedDestination,
            instructions: currentRouteSteps,
        },
    });

    console.log("Estado salvo no Service Worker.");
}


/**
 * 5. autoRestoreState - Solicita ao Service Worker que restaure estado automaticamente.
 */
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

/**
 * 6. restoreState - Restaura estado completo do sistema (geral).
 */
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

} /*

/**
 * 7. updateNavigationState - Atualiza o objeto global navigationState (merge).
 */
function updateNavigationState(newState) {
  if (!newState || typeof newState !== "object") {
    console.error("updateNavigationState: newState inválido:", newState);
    return;
  }
  Object.assign(navigationState, newState);
  console.log("updateNavigationState: Estado atualizado:", navigationState);
}



/**
 * 7. sendDestinationToServiceWorker - envia os dados do destino para o service worker.
 */
function sendDestinationToServiceWorker(destination) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            action: 'saveDestination',
            payload: destination
        });
    }
}

/**

===========================================================================
SEÇÃO 8 – MAPA (Visualização, Animação e Ajustes Avançados)
===========================================================================
  --- 8.1. Visualização e Animação do Mapa ---
/**
 * 1. resetMapView
 *    Restaura a visualização original do mapa.
 */
function resetMapView() {
    const defaultView = {
        lat: -13.4125,
        lon: -38.9131,
        zoom: 13
    };
    
    map.setView([defaultView.lat, defaultView.lon], defaultView.zoom);
    console.log('Visualização do mapa restaurada para o estado inicial.');
} /*
 * 2. adjustMapWithLocationUser
 *    Centraliza o mapa na localização [lat, lon], adicionando um popup "Você está aqui!".
 */
function adjustMapWithLocationUser(lat, lon) {
    map.setView([lat, lon], 21);
    const marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(translations[selectedLanguage].youAreHere || "Você está aqui!")
        .openPopup();
    markers.push(marker);
}


/**
 * 3. adjustMapWithLocation
 *    Ajusta a posição do mapa conforme dados de GPS, definindo zoom, offset e limpando marcadores se desejado.
 */
function adjustMapWithLocation(lat, lon, name = '', description = '', zoom = 15, offsetYPercent = 10) {
    try {
        clearMarkers(); // Remove marcadores antigos

        // Adiciona marcador no local especificado
        const marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${name}</b><br>${description || 'Localização selecionada'}`)
            .openPopup();

        markers.push(marker); // Armazena marcador para referência futura

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

/**
 * 4. clearMarkers
/**
 * clearMarkers
 * Remove todos os marcadores do mapa.
 * Se uma função de filtro for fornecida, remove apenas os que satisfazem a condição.
 *
 * @param {Function} [filterFn] - Função para filtrar quais marcadores remover.
 */
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
  console.log("clearMarkers: Marcadores removidos (com ou sem filtro).");
}

/**
 * clearMapLayers
 * Remove todas as camadas visuais (marcadores, polylines, polígonos) do mapa.
 */
function clearMapLayers() {
  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon) {
      map.removeLayer(layer);
    }
  });
  console.log("clearMapLayers: Todas as camadas visuais removidas do mapa.");
}


/**
 * 5. restoreFeatureUI
 *    Restaura interface para a última feature selecionada, focando no destino atual.
 */
function restoreFeatureUI(feature) {
    console.log("Restaurando interface para a feature:", feature);

    hideAllControlButtons();
    closeCarouselModal();

    if (!selectedDestination || !selectedDestination.lat || !selectedDestination.lon) {
        console.warn("Nenhum destino previamente selecionado. Abortando restoreFeatureUI.");
        return;
    }

    adjustMapWithLocation(
      selectedDestination.lat,
      selectedDestination.lon,
      selectedDestination.name,
      selectedDestination.description,
      15,
      -10
    );

    showNotification(
      `Último destino: ${selectedDestination.name || ''} restaurado no mapa.`,
      'info'
    );

    switch (feature) {
      case 'pontos-turisticos':
          showControlButtonsTouristSpots();
          displayCustomTouristSpots();
          break;
      case 'passeios':
          showControlButtonsTour();
          displayCustomTours();
          break;
      case 'praias':
          showControlButtonsBeaches();
          displayCustomBeaches();
          break;         
      case 'festas':
          showControlButtonsNightlife();
          displayCustomNightlife();           
          break;
      case 'restaurantes':
          showControlButtonsRestaurants();
          displayCustomRestaurants();
          break;
      case 'pousadas':
          showControlButtonsInns();
          displayCustomInns();
          break;
      case 'lojas':
          showControlButtonsShops(); 
          displayCustomShops();
          break;
      case 'emergencias':
          showControlButtonsEmergencies(); 
          displayCustomEmergencies();
          break;
      case 'ensino':
          showControlButtonsEducation();
          displayCustomEducation();
          break;
      default:
          // sem ação
          break;
    }

    // ADICIONE AQUI: Reexibição do botão "menu"
    const menuElement = document.getElementById("menu");
    if (menuElement) {
      menuElement.style.display = "block";
      console.log("restoreFeatureUI: Botão 'menu' reexibido.");
    }
}


/**
 * 6. visualizeRouteOnPreview - Exibe a rota na pré-visualização.
 */
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

/**
 * 7. zoomToSelectedArea - Aplica zoom aos bounds fornecidos.
 */

/*
 * 8. centerMapOnUser - Recentraliza o mapa na localização do usuário.
 * Centraliza o mapa na posição fornecida.
 *
 * @param {number} lat - Latitude do usuário.
 * @param {number} lon - Longitude do usuário.
 * @param {number} [zoom=15] - Nível de zoom padrão. */
function centerMapOnUser(lat, lon, zoom = 19) {
  if (!map) {
    console.warn("[centerMapOnUser] Mapa não inicializado.");
    return;
  }
  map.setView([lat, lon], zoom);
  console.log("[centerMapOnUser] Mapa centralizado em:", lat, lon, "com zoom:", zoom);
} /*

 * 9. clearMapLayers - Remove todas as camadas visuais (marcadores, linhas, polígonos) do mapa. */
function clearMapLayers() {
  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon) {
      map.removeLayer(layer);
    }
  });
  console.log("clearMapLayers: Todas as camadas visuais removidas do mapa.");
} /*

 * 10. addArrowToMap - Adiciona um ícone de seta no mapa.
 * Adiciona um ícone de seta no mapa em uma coordenada específica.
 * @param {Array|Object} coordinate - Pode ser um array [lat, lon] ou um objeto {lat, lon}.
 */
function addArrowToMap(coordinate) {
  const arrowIcon = L.divIcon({
    className: "direction-arrow-icon",
    html: "➡️",
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  // Se coordinate for objeto, converte para array.
  const coords = Array.isArray(coordinate) ? coordinate : [coordinate.lat, coordinate.lon];
  L.marker(coords, { icon: arrowIcon }).addTo(map);
  console.log("addArrowToMap: Seta adicionada no mapa em", coords);
}
 /*

  --- 8.2. Exibição de Dados Customizados e Ajustes Avançados ---
/**
 * 1. displayCustomAbout - Exibe informações personalizadas sobre "Sobre".
 */
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
  const subMenu = document.getElementById("about-submenu");
  subMenu.innerHTML = "";
  about.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "submenu-item";
    btn.textContent = item.name;
    btn.setAttribute("data-lat", item.lat);
    btn.setAttribute("data-lon", item.lon);
    btn.setAttribute("data-name", item.name);
    btn.setAttribute("data-description", item.description);
    btn.setAttribute("data-feature", "sobre");
    btn.setAttribute("data-destination", item.name);
    btn.onclick = () => {
      handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], "sobre");
    };
    subMenu.appendChild(btn);
    const marker = L.marker([item.lat, item.lon]).addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.description}`);
    markers.push(marker);
  });
  console.log("Informações 'Sobre' exibidas no submenu.");
}

/**
 * 2. displayCustomBeaches - Exibe praias customizadas.
 */
function displayCustomBeaches() {
  fetchOSMData(queries["beaches-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "beaches-submenu", "praias");
    }
  });
}

/**
 * 3. displayCustomEducation - Exibe dados educacionais customizados.
 */
function displayCustomEducation() {
  const educationItems = [
    { name: "Iniciar Tutorial", lat: -13.3766787, lon: -38.9172057, description: "Comece aqui para aprender a usar o site." },
    { name: "Planejar Viagem com IA", lat: -13.3766787, lon: -38.9172057, description: "Planeje sua viagem com a ajuda de inteligência artificial." },
    { name: "Falar com IA", lat: -13.3766787, lon: -38.9172057, description: "Converse com nosso assistente virtual." },
    { name: "Falar com Suporte", lat: -13.3766787, lon: -38.9172057, description: "Entre em contato com o suporte." },
    { name: "Configurações", lat: -13.3766787, lon: -38.9172057, description: "Ajuste as configurações do site." }
  ];
  const subMenu = document.getElementById("education-submenu");
  if (!subMenu) {
    console.error("Submenu education-submenu não encontrado.");
    return;
  }
  subMenu.innerHTML = "";
  educationItems.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "submenu-item";
    btn.textContent = item.name;
    btn.setAttribute("data-lat", item.lat);
    btn.setAttribute("data-lon", item.lon);
    btn.setAttribute("data-name", item.name);
    btn.setAttribute("data-description", item.description);
    btn.setAttribute("data-feature", "ensino");
    btn.setAttribute("data-destination", item.name);
    btn.onclick = () => {
      handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], "ensino");
    };
    subMenu.appendChild(btn);
    const marker = L.marker([item.lat, item.lon]).addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.description}`);
    markers.push(marker);
  });
  console.log("Dados educacionais customizados exibidos.");
}

/**
 * 4. displayCustomEmergencies - Exibe dados de emergência customizados.
 */
function displayCustomEmergencies() {
  const emergencies = [
    { name: "Ambulância", lat: -13.3773, lon: -38.9171, description: "Serviço de ambulância 24h. Contato: +55 75-99894-5017." },
    { name: "Unidade de Saúde", lat: -13.3773, lon: -38.9171, description: "Unidade de saúde local. Contato: +55 75-3652-1798." },
    { name: "Polícia Civil", lat: -13.3775, lon: -38.9150, description: "Delegacia da Polícia Civil. Contato: +55 75-3652-1645." },
    { name: "Polícia Militar", lat: -13.3775, lon: -38.9150, description: "Posto da Polícia Militar. Contato: +55 75-99925-0856." }
  ];
  const subMenu = document.getElementById("emergencies-submenu");
  subMenu.innerHTML = "";
  emergencies.forEach(emergency => {
    const btn = document.createElement("button");
    btn.className = "submenu-item";
    btn.textContent = emergency.name;
    btn.setAttribute("data-lat", emergency.lat);
    btn.setAttribute("data-lon", emergency.lon);
    btn.setAttribute("data-name", emergency.name);
    btn.setAttribute("data-description", emergency.description);
    btn.setAttribute("data-feature", "emergencias");
    btn.setAttribute("data-destination", emergency.name);
    btn.onclick = () => {
      handleSubmenuButtons(emergency.lat, emergency.lon, emergency.name, emergency.description, [], "emergencias");
    };
    subMenu.appendChild(btn);
    const marker = L.marker([emergency.lat, emergency.lon]).addTo(map)
      .bindPopup(`<b>${emergency.name}</b><br>${emergency.description}`);
    markers.push(marker);
  });
  console.log("Dados de emergência customizados exibidos.");
}

/**
 * 5. displayCustomInns - Exibe dados de pousadas customizados.
 */
function displayCustomInns() {
  fetchOSMData(queries["inns-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "inns-submenu", "pousadas");
    }
  });
}

/**
 * 6. displayCustomItems - Exibe itens customizados com base em um array.
 */
function displayCustomItems(items, subMenuId, feature) {
  const subMenu = document.getElementById(subMenuId);
  subMenu.innerHTML = "";
  items.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "submenu-item submenu-button";
    btn.textContent = item.name;
    btn.setAttribute("data-lat", item.lat);
    btn.setAttribute("data-lon", item.lon);
    btn.setAttribute("data-name", item.name);
    btn.setAttribute("data-description", item.description);
    btn.setAttribute("data-feature", feature);
    btn.setAttribute("data-destination", item.name);
    btn.onclick = () => {
      handleSubmenuButtons(item.lat, item.lon, item.name, item.description, [], feature);
    };
    subMenu.appendChild(btn);
    const marker = L.marker([item.lat, item.lon]).addTo(map)
      .bindPopup(`<b>${item.name}</b><br>${item.description}`);
    markers.push(marker);
  });
  console.log(`Itens customizados para ${feature} exibidos.`);
}

/**
 * 7. displayCustomNightlife - Exibe dados de vida noturna customizados.
 */
function displayCustomNightlife() {
  fetchOSMData(queries["nightlife-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "nightlife-submenu", "festas");
    }
  });
}

/**
 * 8. displayCustomRestaurants - Exibe dados de restaurantes customizados.
 */
function displayCustomRestaurants() {
  fetchOSMData(queries["restaurants-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "restaurants-submenu", "restaurantes");
    }
  });
}

/**
 * 9. displayCustomShops - Exibe dados de lojas customizados.
 */
function displayCustomShops() {
  fetchOSMData(queries["shops-submenu"]).then(data => {
    if (data) {
      displayOSMData(data, "shops-submenu", "lojas");
    }
  });
}

/**
 * 10. displayCustomTips - Exibe dados de dicas customizados.
 */
function displayCustomTips() {
  const tips = [
    { name: "Melhores Pontos Turísticos", lat: -13.3766787, lon: -38.9172057, description: "Explore os pontos turísticos mais icônicos." },
    { name: "Melhores Passeios", lat: -13.3766787, lon: -38.9172057, description: "Descubra os passeios mais recomendados." },
    { name: "Melhores Praias", lat: -13.3766787, lon: -38.9172057, description: "Saiba quais são as praias mais populares." },
    { name: "Melhores Restaurantes", lat: -13.3766787, lon: -38.9172057, description: "Conheça os melhores lugares para comer." },
    { name: "Melhores Pousadas", lat: -13.3766787, lon: -38.9172057, description: "Encontre as melhores opções de pousadas." },
    { name: "Melhores Lojas", lat: -13.3766787, lon: -38.9172057, description: "Descubra as melhores lojas para suas compras." }
  ];
  const subMenu = document.getElementById("tips-submenu");
  subMenu.innerHTML = "";
  tips.forEach(tip => {
    const btn = document.createElement("button");
    btn.className = "submenu-item";
    btn.textContent = tip.name;
    btn.setAttribute("data-lat", tip.lat);
    btn.setAttribute("data-lon", tip.lon);
    btn.setAttribute("data-name", tip.name);
    btn.setAttribute("data-description", tip.description);
    btn.setAttribute("data-feature", "dicas");
    btn.setAttribute("data-destination", tip.name);
    btn.onclick = () => {
      handleSubmenuButtons(tip.lat, tip.lon, tip.name, tip.description, [], "dicas");
    };
    subMenu.appendChild(btn);
    const marker = L.marker([tip.lat, tip.lon]).addTo(map)
      .bindPopup(`<b>${tip.name}</b><br>${tip.description}`);
    markers.push(marker);
  });
  console.log("Dados de dicas customizados exibidos.");
}

/**
 * 11. displayCustomTouristSpots
 *    Exibe pontos turísticos (touristSpots-submenu) e esconde botões extras se desejar.
 */
function displayCustomTouristSpots() {
    fetchOSMData(queries['touristSpots-submenu']).then(data => {
        if (data) {
            displayOSMData(data, 'touristSpots-submenu', 'pontos-turisticos');
        }
        hideAllButtons();
    });
}

/**
 * 12. displayCustomTours
 *    Exibe passeios personalizados (tours-submenu).
 */
function displayCustomTours() {
    const tours = [
        {
            name: "Passeio de lancha Volta a Ilha de Tinharé",
            lat: -13.3837729,
            lon: -38.9085360,
            description: "Desfrute de um emocionante passeio de lancha ao redor da Ilha de Tinharé..."
        },
        {
            name: "Passeio de Quadriciclo para Garapuá",
            lat: -13.3827765,
            lon: -38.9105500,
            description: "Aventure-se em um passeio de quadriciclo até a vila de Garapuá..."
        },
        {
            name: "Passeio 4X4 para Garapuá",
            lat: -13.3808638,
            lon: -38.9127107,
            description: "Embarque em uma viagem emocionante de 4x4 até Garapuá..."
        },
        {
            name: "Passeio de Barco para Gamboa",
            lat: -13.3766536,
            lon: -38.9186205,
            description: "Relaxe em um agradável passeio de barco até Gamboa..."
        }
    ];

    displayCustomItems(tours, 'tours-submenu', 'passeios');
} /*

 * 13. showMarketingPopup - Exibe um popup de marketing com mensagem personalizada. */
/**
 * showMarketingPopup
 * Exibe um popup de marketing ou promoção para o usuário.
 *
 * @param {string} message - Mensagem de marketing a ser exibida.
 */
function showMarketingPopup(message) {
  showNotification(message, "info", 8000);
  console.log("showMarketingPopup: Popup de marketing exibido com a mensagem:", message);
}


/*  --- 8.3. Integração de Localização e Rotação ---
// Variável global para armazenar o ID do watchPosition */

let userLocationWatcherId = null;

/**
 * 1. initContinuousLocationTracking
/**
 * initContinuousLocationTracking
 * Inicia um watchPosition para atualizar continuamente a variável global userLocation.
 * Adiciona também o listener de orientação (deviceorientation) para atualizar a rotação do mapa.
 */
function initContinuousLocationTracking() {
  // Verifica se a geolocalização é suportada
  if (!("geolocation" in navigator)) {
    showNotification(getGeneralText("geolocationUnsupported", selectedLanguage) || "Geolocalização não suportada neste dispositivo.", "error");
    return;
  }

  // Se já houver um watcher ativo, limpa-o
  if (userLocationWatcherId !== null) {
    navigator.geolocation.clearWatch(userLocationWatcherId);
  }

  // Inicia o watchPosition para atualizar a localização do usuário
  userLocationWatcherId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      userLocation = { latitude, longitude, accuracy };
      // Atualiza o marcador do usuário; a rotação é atualizada separadamente via deviceOrientationHandler
      updateUserMarker(latitude, longitude, accuracy);
      console.log("initContinuousLocationTracking: Localização atualizada:", userLocation);
    },
    (error) => {
      console.error("initContinuousLocationTracking: Erro ao obter localização contínua:", error);
      // Define mensagem de erro específica com base no código do erro
      let message = getGeneralText("trackingError", selectedLanguage);
      if (error.code === error.PERMISSION_DENIED) {
        message = getGeneralText("noLocationPermission", selectedLanguage) || "Permissão de localização negada.";
      } else if (error.code === error.TIMEOUT) {
        message = getGeneralText("locationTimeout", selectedLanguage) || "Tempo limite para obtenção de localização excedido.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = getGeneralText("positionUnavailable", selectedLanguage) || "Posição indisponível.";
      }
      showNotification(message, "error");
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );

  // Adiciona o listener para orientação do dispositivo, se suportado
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", deviceOrientationHandler, true);
    console.log("initContinuousLocationTracking: Listener de orientação adicionado.");
  } else {
    console.warn("initContinuousLocationTracking: DeviceOrientationEvent não suportado.");
  }
  
  console.log("initContinuousLocationTracking: WatchPosition iniciado com ID", userLocationWatcherId);
}



/**
/* 2. deviceOrientationHandler */
/**
 * deviceOrientationHandler
 * Captura dados de orientação do dispositivo e atualiza a rotação do mapa.
 * - Se o dispositivo fornecer webkitCompassHeading (iOS), usa-o.
 * - Caso contrário, utiliza event.alpha (ajustando para 360 - alpha).
 * - Se não houver dados válidos, exibe um aviso.
 *
 * @param {DeviceOrientationEvent} event - Evento de orientação do dispositivo.
 */
function deviceOrientationHandler(event) {
  let heading;
  // Verifica se há suporte para webkitCompassHeading (iOS)
  if (event.webkitCompassHeading !== undefined) {
    heading = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    heading = 360 - event.alpha; // Ajusta para obter um ângulo "para frente"
  } else {
    console.warn("deviceOrientationHandler: Dados de orientação não disponíveis.");
    return;
  }
  
  // Atualiza a rotação do mapa com o novo heading.
  setMapRotation(heading);
  
  // Opcional: se desejar, atualize também o marcador do usuário.
  if (userLocation) {
    updateUserMarker(userLocation.latitude, userLocation.longitude, heading);
  }
  
  console.log("deviceOrientationHandler: Heading atualizado para", heading, "°.");
}


/**
 * 3. setFirstPersonView
 * Atualiza a visualização do mapa para modo first-person.
 * @param {Object} position - Objeto de posição retornado pelo watchPosition.
 */
/**
 * Ajusta a visualização do mapa para uma perspectiva de primeira pessoa.
 * Centraliza o mapa com zoom 18, posicionando o usuário na parte inferior para que o caminho apareça à frente.
 * @param {number} lat - Latitude do usuário.
 * @param {number} lon - Longitude do usuário.
 * @param {number} zoom - Nível de zoom desejado (fixo em 18).
 * @param {number} heading - Ângulo (em graus) para alinhar o mapa.
 */
function setFirstPersonView(lat, lon, zoom, heading) {
  const desiredZoom = zoom || 20;
  const mapSize = map.getSize();
  // Calcula o deslocamento: o usuário ficará aproximadamente 20% abaixo do centro (80% da tela para cima)
  const offsetY = mapSize.y * 0.2;
  const userPoint = map.project([lat, lon], desiredZoom);
  const adjustedPoint = L.point(userPoint.x, userPoint.y - offsetY);
  const newCenter = map.unproject(adjustedPoint, desiredZoom);
  map.setView(newCenter, desiredZoom, { animate: true, pan: { duration: 0.5 } });
  // Alinha a rotação do mapa com o heading do usuário
  setMapRotation(heading);
}


/**
 * 4. setMapRotation
 /**
 * Rotaciona a camada de tiles do mapa de acordo com o heading.
 * Utiliza suavização e verifica se a rotação está habilitada.
 *
 * @param {number} heading - Ângulo atual em graus fornecido pelo dispositivo.
 */
/**
 * Rotaciona a camada de tiles do mapa de acordo com o heading.
 * Aplica suavização e utiliza transform-origin centralizado para garantir a rotação a partir do centro.
 * @param {number} heading - Ângulo atual em graus.
 */
function setMapRotation(heading) {
  // Seleciona a camada de tiles do Leaflet
  const tileLayerElement = document.querySelector(".leaflet-tile-pane");
  if (!tileLayerElement) {
    console.warn("[setMapRotation] Camada de tiles não encontrada.");
    return;
  }
  // Se a navegação não estiver ativa ou a rotação estiver desabilitada, remove a rotação
  if (!navigationState.isActive || !navigationState.isRotationEnabled) {
    tileLayerElement.style.transform = "none";
    return;
  }
  const now = Date.now();
  // Se em modo quiet e a velocidade for baixa ou o intervalo não tiver passado, não atualiza
  if (navigationState.quietMode) {
    if (navigationState.speed < 0.5) return;
    if ((now - navigationState.lastRotationTime) < navigationState.rotationInterval) return;
  }
  // Se override manual estiver ativo, aplica o ângulo manual
  if (navigationState.manualOverride) {
    applyRotationTransform(navigationState.manualAngle, navigationState.tilt);
    navigationState.lastRotationTime = now;
    console.log("[setMapRotation] Rotação manual aplicada:", navigationState.manualAngle, "º");
    return;
  }
  if (heading == null || isNaN(heading)) {
    console.warn("[setMapRotation] Heading inválido => rotação não efetuada.");
    return;
  }
  // Ajusta o heading conforme o modo de rotação
  let desiredHeading = heading;
  if (navigationState.rotationMode === "north-up") {
    desiredHeading = 0;
  } else {
    desiredHeading = (desiredHeading < 0) ? ((desiredHeading % 360) + 360) : (desiredHeading % 360);
  }
  // Usa um buffer para suavizar as atualizações
  navigationState.headingBuffer.push(desiredHeading);
  if (navigationState.headingBuffer.length > 5) {
    navigationState.headingBuffer.shift();
  }
  const avgHeading = navigationState.headingBuffer.reduce((a, b) => a + b, 0) / navigationState.headingBuffer.length;
  const delta = Math.abs(avgHeading - navigationState.currentHeading);
  if (delta < navigationState.minRotationDelta) {
    return;
  }
  // Suaviza a rotação
  const smoothedHeading = navigationState.currentHeading + navigationState.alpha * (avgHeading - navigationState.currentHeading);
  navigationState.currentHeading = smoothedHeading;
  // Aplica o transform com origin centralizado
  tileLayerElement.style.transformOrigin = "50% 50%";
  applyRotationTransform(smoothedHeading, navigationState.tilt);
  navigationState.lastRotationTime = now;
  console.log(`[setMapRotation] Heading final = ${smoothedHeading.toFixed(1)}°, tilt = ${navigationState.tilt}`);
}




/**
 * applyRotationTransform(heading, tilt)
 * Aplica a transformação de rotação e tilt à camada de tiles do Leaflet.
 * Essa transformação não afeta os markers ou a posição real do mapa.
 */
function applyRotationTransform(heading, tilt) {
  const tileLayerElement = document.querySelector(".leaflet-tile-pane");
  if (tileLayerElement) {
    // Exemplo simples: rotação sem tilt (para adicionar tilt, seria necessário uma abordagem 3D)
    tileLayerElement.style.transform = `rotate(${heading}deg)`;
  }
}



/**

===========================================================================
SEÇÃO 9 – INTERAÇÃO NO MAPA OSM
===========================================================================
  --- 9.1. Exibição e Controle de Instruções ---
/**
 * 1. showInstructionsWithTooltip - Exibe instruções no mapa via tooltips permanentes.
 */
function showInstructionsWithTooltip(instructions, mapInstance) {
  if (!instructions || instructions.length === 0) {
    console.warn("showInstructionsWithTooltip: Nenhuma instrução para exibir.");
    return;
  }
  instructions.forEach(step => {
    const marker = L.marker([step.lat, step.lon]).addTo(mapInstance);
    marker.bindTooltip(`${step.text}`, {
      permanent: true,
      direction: "top",
      className: "my-custom-tooltip"
    }).openTooltip();
  });
  console.log("showInstructionsWithTooltip: Instruções exibidas no mapa.");
}

/**
 * 2. showInstructionsOnMap - Exibe instruções no mapa (popups/tooltips).
 */
function showInstructionsOnMap(instructions, mapInstance) {
  if (!instructions || instructions.length === 0) {
    console.warn("showInstructionsOnMap: Nenhuma instrução para exibir.");
    return;
  }
  instructions.forEach((step, index) => {
    const icon = L.divIcon({
      className: "instruction-marker-icon",
      html: "⚠️",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    const marker = L.marker([step.lat, step.lon], { icon: icon }).addTo(mapInstance);
    marker.bindPopup(`
      <strong>Passo ${index + 1}</strong><br>
      ${step.text}<br>
      (${step.distance}m)
    `);
  });
  console.log("showInstructionsOnMap: Instruções exibidas com popups.");
}

/**
 * 3. goToInstructionStep - Define um passo específico como atual.
 */
function goToInstructionStep(stepIndex) {
  if (!navigationState.instructions || navigationState.instructions.length === 0) {
    console.warn("goToInstructionStep: Nenhuma instrução definida.");
    return;
  }
  stepIndex = Math.max(0, Math.min(stepIndex, navigationState.instructions.length - 1));
  navigationState.currentStepIndex = stepIndex;
  const step = navigationState.instructions[stepIndex];
  if (step) {
    updateInstructionModal(navigationState.instructions, stepIndex, navigationState.lang);
    speakInstruction(step.text, navigationState.lang === "pt" ? "pt-BR" : "en-US");
    highlightNextStepInMap(step);
    console.log(`goToInstructionStep: Passo atualizado para ${stepIndex}.`);
  }
}

/**
 * 4. nextInstructionStep - Avança para a próxima instrução.
 */
function nextInstructionStep() {
  if (navigationState.currentStepIndex < navigationState.instructions.length - 1) {
    goToInstructionStep(navigationState.currentStepIndex + 1);
  } else {
    console.log("nextInstructionStep: Última instrução alcançada.");
    showNotification("Você chegou ao destino final!", "success");
  }
}

/**
 * 5. prevInstructionStep - Retrocede para a instrução anterior.
 */
function prevInstructionStep() {
  if (navigationState.currentStepIndex > 0) {
    goToInstructionStep(navigationState.currentStepIndex - 1);
  } else {
    console.log("prevInstructionStep: Você já está na primeira instrução.");
  }
}

/**
  --- 9.2. Rotas Alternativas e Ajustes ---
/**
 * 1. showRouteAlternatives - Exibe rotas alternativas no mapa.
 */
function showRouteAlternatives(routeDataArray) {
  clearCurrentRoute();
  const colors = ["blue", "green", "purple", "orange"];
  routeDataArray.forEach((routeData, index) => {
    const color = colors[index % colors.length];
    const polyline = L.polyline(routeData.routeCoords, {
      color: color,
      weight: 5,
      opacity: 0.8
    }).addTo(map);
    polyline.on("click", () => {
      console.log(`showRouteAlternatives: Rota ${index + 1} selecionada.`);
      // Ação opcional: iniciar navegação nessa rota.
    });
    polyline.bindPopup(`${routeData.label || ("Rota " + (index + 1))} - Dist: ${routeData.distance} km, ~${routeData.duration} min`);
  });
  const allPoints = routeDataArray.flatMap(r => r.routeCoords);
  const bounds = L.latLngBounds(allPoints);
  map.fitBounds(bounds, { padding: [50, 50] });
  console.log("showRouteAlternatives: Rotas alternativas exibidas.");
}

/**
 * 2. calculateETA - Estima tempo (minutos) baseado em distância e velocidade (km/h).
 */
function calculateETA(lat1, lon1, lat2, lon2, averageSpeed = 50) {
  const dist = calculateDistance(lat1, lon1, lat2, lon2);
  if (dist <= 0 || averageSpeed <= 0) {
    console.warn("calculateETA: Distância ou velocidade inválida.");
    return "N/A";
  }
  const hours = dist / 1000 / averageSpeed; // dist em km / speed (km/h)
  const minutes = Math.round(hours * 60);
  console.log(`calculateETA: ${minutes} min para ${dist / 1000} km.`);
  return `${minutes} min`;
}

// 3. handleNextInstructionIfClose - Avança step se usuário estiver próximo
function handleNextInstructionIfClose(lat, lon) {
  if (!navigationState.instructions || navigationState.instructions.length === 0) {
    console.warn("[handleNextInstructionIfClose] Nenhuma instrução para processar.");
    return;
  }

  const currentIndex = navigationState.currentStepIndex;
  const step = navigationState.instructions[currentIndex];
  if (!step || !step.lat || !step.lon) {
    console.warn("[handleNextInstructionIfClose] Passo atual inválido.");
    return;
  }

  const distToStep = calculateDistance(lat, lon, step.lat, step.lon);
  if (distToStep < 15) {
    navigationState.currentStepIndex++;
    console.log(`[handleNextInstructionIfClose] Avançando para passo ${navigationState.currentStepIndex} (~${distToStep.toFixed(1)}m).`);

    const nextStep = navigationState.instructions[navigationState.currentStepIndex];
    if (nextStep) {
      showNotification(nextStep.text, "info");
      updateInstructionModal(navigationState.instructions, navigationState.currentStepIndex, navigationState.lang);
      speakInstruction(nextStep.text, navigationState.lang === "pt" ? "pt-BR" : "en-US");
    } else {
      showNotification(getGeneralText("destinationReached", navigationState.lang), "success");
    }
  }
}

/**
 * 4. customizeOSMPopup
 *    Personaliza o popup do Leaflet para reduzir tamanho e ajustar estilos.
 */
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

/**
 * 5. fetchOSMData - Busca dados do OSM utilizando a Overpass API.
 */
async function fetchOSMData(query) {
    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.elements || data.elements.length === 0) {
            console.warn("Nenhum dado OSM encontrado.");
            return [];
        }

        return data.elements;

    } catch (error) {
        console.error("Erro ao buscar dados OSM:", error);
        return [];
    }
}


/**
 * 6. displayOSMData
 *    Exibe dados vindos do Overpass-API no submenu correspondente e cria marcadores no mapa.
 */
function displayOSMData(data, subMenuId, feature) {
    // Limpa o conteúdo do submenu
    const subMenu = document.getElementById(subMenuId);
    subMenu.innerHTML = '';

    // Cria botões dinamicamente
    data.elements.forEach(element => {
        if (element.type === 'node' && element.tags.name) {
            const btn = document.createElement('button');
            btn.className = 'submenu-item submenu-button';
            btn.textContent = element.tags.name;
            btn.setAttribute('data-destination', element.tags.name);

            const description = element.tags.description || 'Descrição não disponível';

            btn.onclick = () => {
                handleSubmenuButtons(
                    element.lat,
                    element.lon,
                    element.tags.name,
                    description,
                    element.tags.images || [],
                    feature
                );
            };

            subMenu.appendChild(btn);

            // Adiciona marcador
            const marker = L.marker([element.lat, element.lon])
                .addTo(map)
                .bindPopup(`<b>${element.tags.name}</b><br>${description}`);
            markers.push(marker);
        }
    });

    // Configura evento de clique
    document.querySelectorAll('.submenu-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const destination = this.getAttribute('data-destination');
            console.log(`Destination selected: ${destination}`);
            showDestinationContent(destination);
        });
    });
}

/**
 * Alterna o tema da interface entre claro e escuro.
 * Se o corpo do documento tiver a classe "dark-theme", remove-a; caso contrário, adiciona-a.
 */
function toggleTheme() {
  const body = document.body;
  if (body.classList.contains("dark-theme")) {
    body.classList.remove("dark-theme");
    showNotification("Tema claro ativado.", "info");
  } else {
    body.classList.add("dark-theme");
    showNotification("Tema escuro ativado.", "info");
  }
}

/**
 * Ajusta automaticamente o tema com base na hora do dia.
 * Se a hora atual estiver entre 18h e 6h, ativa o tema escuro.
 */
function autoAdjustTheme() {
  const hour = new Date().getHours();
  const body = document.body;
  if (hour >= 18 || hour < 6) {
    // Ativa tema escuro
    if (!body.classList.contains("dark-theme")) {
      body.classList.add("dark-theme");
      showNotification("Tema escuro ativado automaticamente.", "info");
    }
  } else {
    // Ativa tema claro
    if (body.classList.contains("dark-theme")) {
      body.classList.remove("dark-theme");
      showNotification("Tema claro ativado automaticamente.", "info");
    }
  }
}


/*

===========================================================================
SEÇÃO 10 – LOCALIZAÇÃO & RASTREAMENTO
===========================================================================
  --- 10.1. Obtenção da Localização ---
/**
 * 1. getCurrentLocation
 * getCurrentLocation
 * Obtém a localização atual do usuário uma única vez.
 * Em caso de sucesso, inicia o tracking contínuo e retorna a posição.
 *
 * @param {Object} [options] - Opções para getCurrentPosition.
 * @returns {Object|null} - Objeto com latitude, longitude e precisão ou null em caso de erro.
 */
async function getCurrentLocation(options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }) {
  console.log("[getCurrentLocation] Solicitando posição atual...");

  // Verifica se a API de geolocalização está disponível
  if (!("geolocation" in navigator)) {
    showNotification(getGeneralText("geolocationUnsupported", selectedLanguage) || "Geolocalização não suportada.", "error");
    return null;
  }

  try {
    // Solicita a posição atual
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    const { latitude, longitude, accuracy } = position.coords;
    userLocation = { latitude, longitude, accuracy };
    console.log("[getCurrentLocation] Localização obtida:", userLocation);

    // Inicia o tracking contínuo após obter a posição inicial
    initContinuousLocationTracking();

    return userLocation;
  } catch (error) {
    console.error("[getCurrentLocation] Erro:", error);
    // Define mensagem de erro específica com base no código do erro
    let message = getGeneralText("trackingError", selectedLanguage);
    if (error.code === error.PERMISSION_DENIED) {
      message = getGeneralText("noLocationPermission", selectedLanguage) || "Permissão de localização negada.";
    } else if (error.code === error.TIMEOUT) {
      message = getGeneralText("locationTimeout", selectedLanguage) || "Tempo limite para obtenção de localização excedido.";
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      message = getGeneralText("positionUnavailable", selectedLanguage) || "Posição indisponível.";
    }
    showNotification(message, "error");
    return null;
  }
}

/**
 * Atualiza o indicador visual de qualidade do sinal GPS.
 * Baseia-se no valor de "accuracy" (em metros) fornecido pelo GPS.
 * Espera que exista no HTML um elemento com id "gps-signal-indicator".
 * @param {number} accuracy - Valor da acurácia da posição, em metros.
 */
function updateGPSQualityIndicator(accuracy) {
  const indicator = document.getElementById("gps-signal-indicator");
  if (!indicator) return;

  let qualityText = "";
  let qualityClass = "";

  if (accuracy < 10) {
    qualityText = "Excelente";
    qualityClass = "excellent";
  } else if (accuracy < 30) {
    qualityText = "Boa";
    qualityClass = "good";
  } else if (accuracy < 100) {
    qualityText = "Média";
    qualityClass = "medium";
  } else {
    qualityText = "Ruim";
    qualityClass = "poor";
  }

  indicator.textContent = qualityText;
  indicator.className = qualityClass;
}


/**
 * 2. useCurrentLocation
 * Centraliza o mapa na posição atual do usuário.
 */
async function useCurrentLocation() {
  try {
    userLocation = await getCurrentLocation();
    if (!userLocation) return;
    centerMapOnUser(userLocation.latitude, userLocation.longitude);
    console.log("Mapa centralizado na localização do usuário.");
  } catch (error) {
    console.error("Erro em useCurrentLocation:", error);
  }
} /*

  --- 10.2. Rastreamento Contínuo ---
  /**
 * 1. startPositionTracking
 *     Inicia o rastreamento contínuo (watchPosition).
 */
function startPositionTracking(options = {}) {
  const { enableHighAccuracy = true, maximumAge = 10000, timeout = 15000 } = options;

  if (!trackingActive) {
    console.warn("[startPositionTracking] trackingActive=false, abortando...");
    return;
  }

  if (!("geolocation" in navigator)) {
    console.warn("[startPositionTracking] Geolocalização não suportada.");
    return;
  }

  if (watchId !== null) {
    console.log("[startPositionTracking] Limpando watch anterior.");
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      userPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
      console.log("[startPositionTracking] Posição atualizada:", userPosition);
    },
    (error) => {
      console.error("[startPositionTracking] Erro:", error);
      showNotification("Não foi possível obter localização.", "error");
      fallbackToSensorNavigation(); // Ativa fallback
    },
    { enableHighAccuracy, maximumAge, timeout }
  );

  console.log("[startPositionTracking] watchPosition iniciado. watchId =", watchId);
}

/**
 * 2. startUserTracking (Exemplo de stub)
 */
function startUserTracking() {
  console.log("Iniciando rastreamento do usuário...");
  trackingActive = true;
  startPositionTracking();
}

/**
 * 3. updateMapWithUserLocation
 *     Atualiza a visualização do mapa com a localização do usuário.
 */
function updateMapWithUserLocation(zoomLevel = 19) {
  if (!userLocation || !map) {
    console.warn("Localização ou mapa indisponível.");
    return;
  }
  map.setView([userLocation.latitude, userLocation.longitude], zoomLevel);
  console.log("Mapa atualizado para a localização do usuário, zoom:", zoomLevel);
}

/**
 * 4. detectMotion
 *     Detecta movimento do dispositivo (usando devicemotion).
 */
function detectMotion() {
  if ("DeviceMotionEvent" in window) {
    window.addEventListener("devicemotion", (event) => {
      const acc = event.acceleration;
      if (acc.x > 5 || acc.y > 5 || acc.z > 5) {
        console.log("Movimento brusco detectado!");
      }
    });
  } else {
    console.warn("DeviceMotionEvent não suportado.");
  }
} /*

  --- 10.3. Atualização de Marcadores ---

/**
 * 1. updateUserMarker
 /**
 * updateUserMarker(lat, lon, heading, accuracy, iconSize)
 * Atualiza ou cria o marker do usuário com animação e rotação.
 * A função atualiza a rotação do ícone e chama setMapRotation para sincronizar a camada de tiles.
 */
/**
 * Atualiza ou cria o marcador do usuário com animação e rotação.
 * Se o plugin Leaflet Rotated Marker estiver disponível, utiliza-o para definir a rotação.
 * Caso contrário, aplica a rotação via CSS com transform-origin centralizado.
 * @param {number} lat - Latitude atual.
 * @param {number} lon - Longitude atual.
 * @param {number} heading - Ângulo (em graus) de orientação.
 * @param {number} [accuracy] - Precisão da leitura do GPS (opcional).
 * @param {Array} [iconSize] - Tamanho do ícone do marcador (opcional).
 */
/**
 * Atualiza ou cria o marcador do usuário no mapa com rotação para que a seta aponte para o caminho.
 * Se o plugin Leaflet Rotated Marker estiver disponível, ele é usado; caso contrário, a rotação é aplicada via CSS.
 * @param {number} lat - Latitude atual do usuário.
 * @param {number} lon - Longitude atual do usuário.
 * @param {number} heading - Ângulo (em graus) de orientação (direção do movimento).
 * @param {number} [accuracy] - Precisão do GPS (opcional).
 */
function updateUserMarker(lat, lon, heading, accuracy) {
  console.log(`[updateUserMarker] Atualizando posição para (${lat}, ${lon}) com heading: ${heading}°`);
  
  // Se a acurácia estiver definida e for baixa (valor alto), podemos ajustar ou optar por uma atualização menos agressiva
  if (accuracy !== undefined && accuracy > 20) {
    console.log("[updateUserMarker] Precisão baixa (" + accuracy + "m), atualização pode ser menos agressiva.");
  }
  
  // Atualiza a posição e rotação se o marcador já existir
  if (window.userMarker) {
    window.userMarker.setLatLng([lat, lon]);
    if (typeof window.userMarker.setRotationAngle === "function") {
      window.userMarker.setRotationAngle(heading);
    } else if (window.userMarker._icon) {
      window.userMarker._icon.style.transformOrigin = "50% 50%";
      window.userMarker._icon.style.transform = `rotate(${heading}deg)`;
    }
  } else {
    // Cria o marcador com um ícone customizado (exemplo com Font Awesome)
    const iconHtml = '<i class="fas fa-location-arrow"></i>';
    window.userMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: 'user-marker',
        html: iconHtml,
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      }),
      rotationAngle: heading
    }).addTo(map);
  }
  
  // Atualiza (ou cria) o círculo de precisão, se accuracy estiver disponível
  if (accuracy !== undefined) {
    if (window.userAccuracyCircle) {
      window.userAccuracyCircle.setLatLng([lat, lon]);
      window.userAccuracyCircle.setRadius(accuracy);
    } else {
      window.userAccuracyCircle = L.circle([lat, lon], {
        radius: accuracy,
        className: 'gps-accuracy-circle'
      }).addTo(map);
    }
  }
}



// Variável global para armazenar a última posição suavizada
let smoothedPosition = null;
// Fator de suavização: ajuste entre 0 e 1 (valor menor = mais suavização)
const SMOOTHING_ALPHA = 0.2;

/**
 * Aplica suavização às coordenadas de geolocalização utilizando média móvel exponencial.
 * @param {Object} newCoord - Objeto contendo as coordenadas brutas { latitude, longitude, ... }.
 * @returns {Object} - Objeto com as coordenadas suavizadas.
 */
function applyCoordinateSmoothing(newCoord) {
  if (!newCoord || typeof newCoord.latitude !== 'number' || typeof newCoord.longitude !== 'number') {
    // Se as coordenadas não forem válidas, retorna a última posição conhecida
    return smoothedPosition;
  }
  
  if (smoothedPosition === null) {
    // Inicializa com a primeira leitura
    smoothedPosition = { ...newCoord };
  } else {
    // Atualiza a posição suavizada usando média móvel exponencial
    smoothedPosition.latitude = SMOOTHING_ALPHA * newCoord.latitude + (1 - SMOOTHING_ALPHA) * smoothedPosition.latitude;
    smoothedPosition.longitude = SMOOTHING_ALPHA * newCoord.longitude + (1 - SMOOTHING_ALPHA) * smoothedPosition.longitude;
  }
  return smoothedPosition;
}




/*

 * 3. updateUserPositionOnRoute
 *     Atualiza a posição do usuário na rota ativa.
 */
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
        createRoute(destLat, destLon);
        lastRecalculationTime = now;
    }
    if (distance < 50) {
        console.log("Usuário chegou ao destino.");
        endNavigation();
    }
} /*

  --- 10.4. Finalização do Rastreamento ---
/**
 * 1. stopPositionTracking
 *    Encerra o rastreamento de posição. */
function stopPositionTracking() {
  if (navigationWatchId !== null) {
    navigator.geolocation.clearWatch(navigationWatchId);
    navigationWatchId = null;
    console.log("Rastreamento encerrado.");
  }
  userCurrentLocation = null;
  trackingActive = false;
}

/**
 * 2. clearAllMarkers
 *    Remove todos os marcadores do mapa e limpa o array global. */
function clearAllMarkers() {
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];
  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }
  if (currentMarker) {
    map.removeLayer(currentMarker);
    currentMarker = null;
  }
  console.log("Todos os marcadores removidos.");
} /*

===========================================================================
SEÇÃO 11 – CRIAÇÃO DE ROTAS
===========================================================================
/**
 * 1. startRouteCreation - Inicia a criação de uma nova rota.
 */
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
        hideAllControlButtons();
        updateRouteFooter(routeData, selectedLanguage);
        closeSideMenu();
    } catch (error) {
        console.error("❌ Erro ao iniciar criação de rota:", error.message);
        showNotification(translations[selectedLanguage].routeError, "error");
    }
}

/**
 * 2. createRoute
 *    Exemplo de função async para criar rota a partir de userLocation até selectedDestination. */
async function createRoute(userLocation) {
    try {
        validateDestination();  // ou validateSelectedDestination()
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

        finalizeRouteMarkers(userLocation.latitude, userLocation.longitude, selectedDestination);
        return routeData;
    } catch (error) {
        console.error("Erro ao criar rota:", error);
        showNotification("Erro ao criar rota. Verifique sua conexão e tente novamente.", "error");
        return null;
    }
}

// validateSelectedDestination - Valida destino selecionado
function validateSelectedDestination() {
    if (!selectedDestination || !selectedDestination.lat || !selectedDestination.lon) {
        showNotification('Por favor, selecione um destino válido.', 'error');
        giveVoiceFeedback('Nenhum destino válido selecionado.');
        return false;
    }
    return true;
}

/**
 * 3. plotRouteOnMap
/**
 * plotRouteOnMap
 * Consulta a API OpenRouteService, obtém as coordenadas e plota a rota no mapa.
 * - Remove a rota anterior, se existir.
 * - Cria uma polyline e ajusta os limites do mapa.
 *
 * @param {number} startLat - Latitude de partida.
 * @param {number} startLon - Longitude de partida.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} [profile="foot-walking"] - Perfil de navegação.
 * @returns {Promise<Object|null>} - Dados da rota ou null em caso de erro.
 */
async function plotRouteOnMap(startLat, startLon, destLat, destLon, profile = "foot-walking") {
  const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}` +
    `&start=${startLon},${startLat}&end=${destLon},${destLat}&instructions=false`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[plotRouteOnMap] Erro ao obter rota:", response.status);
      return null;
    }
    const data = await response.json();
    // Extrai as coordenadas da rota e converte para formato [lat, lon]
    const coords = data.features[0].geometry.coordinates;
    const latLngs = coords.map(([lon, lat]) => [lat, lon]);
    // Se já houver uma rota traçada, remove-a
    if (window.currentRoute) {
      map.removeLayer(window.currentRoute);
    }
    // Cria e adiciona a polyline ao mapa
    window.currentRoute = L.polyline(latLngs, { color: "blue", weight: 5, dashArray: "10,5" }).addTo(map);
    // Ajusta o mapa para mostrar toda a rota
    map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });
    console.log("[plotRouteOnMap] Rota plotada com sucesso.");
    return data;
  } catch (error) {
    console.error("[plotRouteOnMap] Erro ao plotar rota:", error);
    return null;
  }
}



/**
 * 4. calculateDistance
 * Calcula a distância (em metros) entre dois pontos usando a fórmula de Haversine.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distância em metros.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Raio da Terra em metros
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
            Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * 5. distanceToPolyline
/**
 * Calcula a distância mínima entre um ponto e uma linha (polyline) definida por um array de pontos.
 * Cada ponto no array deve ter as propriedades {lat, lon}.
 * @param {Object} currentPos - Objeto com {lat, lon} representando a posição atual.
 * @param {Array} routePoints - Array de pontos representando a rota.
 * @returns {number} - Distância mínima em metros entre o ponto e a rota.
 */
function distanceToPolyline(currentPos, routePoints) {
  if (!routePoints || routePoints.length === 0) return Infinity;
  
  let minDistance = Infinity;
  for (let i = 0; i < routePoints.length - 1; i++) {
    const A = routePoints[i];
    const B = routePoints[i + 1];
    const dist = pointToSegmentDistance(currentPos, A, B);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}


/**
 * 6. pointToSegmentDistance
 *    Calcula a distância de um ponto a um segmento. */
/**
 * Calcula a distância de um ponto P à reta definida pelos pontos A e B.
 * @param {Object} P - Objeto com {lat, lon} representando o ponto.
 * @param {Object} A - Objeto com {lat, lon} representando o início do segmento.
 * @param {Object} B - Objeto com {lat, lon} representando o fim do segmento.
 * @returns {number} - Distância mínima em metros.
 */
function pointToSegmentDistance(P, A, B) {
  // Conversão de graus para radianos
  const toRad = (deg) => deg * Math.PI / 180;
  
  // Converter os pontos para uma aproximação local (equirectangular)
  const latA = toRad(A.lat), lonA = toRad(A.lon);
  const latB = toRad(B.lat), lonB = toRad(B.lon);
  const latP = toRad(P.lat), lonP = toRad(P.lon);
  
  // Aproximar coordenadas para uma projeção plana
  const xA = lonA * Math.cos(latA), yA = latA;
  const xB = lonB * Math.cos(latB), yB = latB;
  const xP = lonP * Math.cos(latP), yP = latP;
  
  const AtoP_x = xP - xA;
  const AtoP_y = yP - yA;
  const AtoB_x = xB - xA;
  const AtoB_y = yB - yA;
  
  const segmentLengthSq = AtoB_x * AtoB_x + AtoB_y * AtoB_y;
  let t = 0;
  if (segmentLengthSq !== 0) {
    t = (AtoP_x * AtoB_x + AtoP_y * AtoB_y) / segmentLengthSq;
    t = Math.max(0, Math.min(1, t));
  }
  
  const projX = xA + t * AtoB_x;
  const projY = yA + t * AtoB_y;
  
  const deltaX = xP - projX;
  const deltaY = yP - projY;
  const distanceRad = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Converter a distância radiana para metros
  const R = 6371000; // Raio da Terra em metros
  return distanceRad * R;
}


/**
 * 7. clearCurrentRoute /**
/**
 * clearCurrentRoute
 * Remove a rota atual (polyline) do mapa, se existir.
 */
function clearCurrentRoute() {
  if (window.currentRoute) {
    map.removeLayer(window.currentRoute);
    window.currentRoute = null;
    console.log("[clearCurrentRoute] Rota removida do mapa.");
  } else {
    console.log("[clearCurrentRoute] Nenhuma rota ativa para remover.");
  }
}


/**
 * 8. getClosestPointOnRoute
 * Para cada segmento da rota (definida por um array de {lat, lon}),
 * calcula a projeção do ponto do usuário sobre o segmento e retorna o
 * ponto de projeção, o índice do segmento e o fator de projeção (t).
 * @param {number} userLat - Latitude do usuário.
 * @param {number} userLon - Longitude do usuário.
 * @param {Array} routeCoordinates - Array de pontos {lat, lon}.
 * @returns {Object} { closestPoint: {lat, lon}, segmentIndex, t }
 */
function getClosestPointOnRoute(userLat, userLon, routeCoordinates) {
  let minDistance = Infinity;
  let bestProjection = null;
  let bestIndex = -1;
  let bestT = 0;

  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const A = routeCoordinates[i];
    const B = routeCoordinates[i+1];
    const dx = B.lon - A.lon;
    const dy = B.lat - A.lat;
    const magSq = dx * dx + dy * dy;
    // Se o segmento é um ponto único, pule
    if (magSq === 0) continue;
    
    // Fator de projeção t (pode estar fora do intervalo [0, 1])
    const t = ((userLon - A.lon) * dx + (userLat - A.lat) * dy) / magSq;
    // Projeção restrita ao segmento
    const tClamped = Math.max(0, Math.min(1, t));
    const projLon = A.lon + tClamped * dx;
    const projLat = A.lat + tClamped * dy;
    
    const d = calculateDistance(userLat, userLon, projLat, projLon);
    if (d < minDistance) {
      minDistance = d;
      bestProjection = { lat: projLat, lon: projLon };
      bestIndex = i;
      bestT = tClamped;
    }
  }
  
  return {
    closestPoint: bestProjection,
    segmentIndex: bestIndex,
    t: bestT
  };
}

/**
* 9. computeBearing
 * Calcula o rumo (bearing) entre dois pontos geográficos.
 * @param {number} lat1 - Latitude do ponto de partida.
 * @param {number} lon1 - Longitude do ponto de partida.
 * @param {number} lat2 - Latitude do ponto de destino.
 * @param {number} lon2 - Longitude do ponto de destino.
 * @returns {number} Rumo em graus (0-360).
 */
function computeBearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const dLon = (lon2 - lon1) * toRad;
  const y = Math.sin(dLon) * Math.cos(lat2 * toRad);
  const x = Math.cos(lat1 * toRad) * Math.sin(lat2 * toRad) -
            Math.sin(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * toDeg;
  return (bearing + 360) % 360;
}

/**
* 10. showRouteLoadingIndicator
 * Adiciona um indicador de carregamento antes da rota ser traçada
 */
function showRouteLoadingIndicator(timeout = 15000) {
  const loader = document.getElementById("route-loader");
  if (!loader) {
    console.error("Elemento do loader não encontrado no DOM.");
    return;
  }

  loader.style.display = "block";
  console.log("[showRouteLoadingIndicator] Indicador de carregamento ativado.");

  // Define um timeout para evitar carregamento infinito
  navigationState.loadingTimeout = setTimeout(() => {
    hideRouteLoadingIndicator();

    // Notifica o usuário do erro
    showNotification(getGeneralText("routeLoadTimeout", selectedLanguage) || 
      "Tempo esgotado para carregar a rota. Por favor, tente novamente.", "error");

    console.error("[showRouteLoadingIndicator] Timeout: Falha ao carregar rota.");

    // Oferece ação ao usuário: tentar novamente
    displayRetryRouteLoadOption();
    
  }, 15000); // timeout após 15 segundos
}


/**
* 11. hideRouteLoadingIndicator
 * Remove o indicador de carregamento antes da rota ser traçada
 */
function hideRouteLoadingIndicator() {
  // Cancela timeout se existir
  if (navigationState.loadingTimeout) {
    clearTimeout(navigationState.loadingTimeout);
    navigationState.loadingTimeout = null;
  }

  const loader = document.getElementById("route-loader");
  if (loader) loader.style.display = "none";

  console.log("Indicador de carregamento desativado.");
}


/**
* 12. fetchMultipleRouteOptions
/**
 * fetchMultipleRouteOptions
 * Obtém diferentes opções de rota para o trajeto, usando perfis variados.
 * - Para cada perfil (ex.: "foot-walking", "cycling-regular", "driving-car"),
 *   chama fetchRouteInstructions para obter as instruções correspondentes.
 *
 * @param {number} startLat - Latitude de partida.
 * @param {number} startLon - Longitude de partida.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @returns {Promise<Array>} - Array de objetos contendo o perfil e as instruções da rota.
 */
async function fetchMultipleRouteOptions(startLat, startLon, destLat, destLon) {
  const options = ["foot-walking", "cycling-regular", "driving-car"];
  let routes = [];
  // Para cada perfil (modo de transporte), obtém as instruções de rota
  for (const profile of options) {
    const routeData = await fetchRouteInstructions(startLat, startLon, destLat, destLon, selectedLanguage, 10000, true, profile);
    routes.push({ profile, routeData });
  }
  return routes;
}
 

/**
* 13. applyRouteStyling
 * Cria gradientes de cor e adicionar ícones personalizados
 */
function applyRouteStyling(routeLayer) {
    routeLayer.setStyle({
        color: "blue",
        weight: 5,
        dashArray: "10, 5"
    });

    routeLayer.on("mouseover", function () {
        this.setStyle({ color: "yellow" });
    });

    routeLayer.on("mouseout", function () {
        this.setStyle({ color: "blue" });
    });
}

/**
/*===========================================================================
SEÇÃO 12 – NAVEGAÇÃO
===========================================================================
  --- 12.1. Controle de Navegação ---
/**
 * 1. startNavigation.
/**
 * Inicia a navegação para o destino selecionado, configurando o fluxo completo:
 *  - Validação do destino e disponibilidade de localização;
 *  - Obtenção de múltiplas opções de rota e escolha pelo usuário;
 *  - Enriquecimento das instruções de rota (por exemplo, com dados do OSM);
 *  - Animação e plotagem da rota no mapa;
 *  - Configuração do monitoramento contínuo da posição do usuário.
 */
async function startNavigation() {
  // 1. Exibe o indicador de carregamento da rota.
  showRouteLoadingIndicator();

  // 2. Valida o destino selecionado.
  if (!validateDestination(selectedDestination)) {
    hideRouteLoadingIndicator();
    return;
  }

  // 3. Verifica se a localização do usuário está disponível.
  if (!userLocation) {
    showNotification("Localização não disponível. Permita o acesso à localização primeiro.", "error");
    hideRouteLoadingIndicator();
    return;
  }

  // 4. Inicializa o estado da navegação.
  initNavigationState();
  navigationState.isActive = true;
  navigationState.isPaused = false;
  navigationState.watchId = true;
  navigationState.currentStepIndex = 0;

  // 5. Obtém múltiplas opções de rota com base na posição do usuário e destino.
  let routeOptions = await fetchMultipleRouteOptions(
    userLocation.latitude,
    userLocation.longitude,
    selectedDestination.lat,
    selectedDestination.lon
  );
  if (!routeOptions || routeOptions.length === 0) {
    showNotification(getGeneralText("noInstructions", selectedLanguage), "error");
    hideRouteLoadingIndicator();
    return;
  }

  // 6. Permite que o usuário escolha a rota desejada dentre as opções.
  let selectedRoute = await promptUserToChooseRoute(routeOptions);
  if (!selectedRoute) {
    hideRouteLoadingIndicator();
    return;
  }

  // 7. Enriquece as instruções da rota com dados adicionais (ex.: POIs via OSM).
  let routeInstructions = await enrichInstructionsWithOSM(selectedRoute.routeData, selectedLanguage);
  navigationState.instructions = routeInstructions;

  // 8. Plota a rota escolhida no mapa e adiciona os marcadores de origem e destino.
  const routeData = await plotRouteOnMap(
    userLocation.latitude,
    userLocation.longitude,
    selectedDestination.lat,
    selectedDestination.lon
  );
  finalizeRouteMarkers(userLocation.latitude, userLocation.longitude, selectedDestination);

  // 9. Atualiza a interface: oculta resumo anterior, atualiza banner e rodapé, e fornece feedback de voz.
  hideRouteSummary();
  updateInstructionBanner(routeInstructions[0], selectedLanguage);
  updateRouteFooter(routeData, selectedLanguage);
  hideRouteLoadingIndicator();
  giveVoiceFeedback(getGeneralText("navigationStarted", selectedLanguage));

  // 10. Define a visualização de primeira pessoa:
  // Centraliza o mapa com zoom 18, reposicionando-o para que o caminho fique à frente.
  setFirstPersonView(userLocation.latitude, userLocation.longitude, 20, userLocation.heading || 0);

  // 11. Inicia o monitoramento contínuo da posição do usuário.
  window.positionWatcher = navigator.geolocation.watchPosition(
    (pos) => {
      if (navigationState.isPaused) return;

      // Extração das coordenadas brutas.
      const rawPosition = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
        timestamp: pos.timestamp
      };

      // Atualiza o indicador de qualidade do sinal GPS.
      updateGPSQualityIndicator(pos.coords.accuracy);

      // Aplica filtro de suavização (assumindo que applyCoordinateSmoothing esteja implementada).
      const smoothedCoord = applyCoordinateSmoothing(rawPosition);

      // Atualiza o marcador do usuário com a rotação correta.
      updateUserMarker(smoothedCoord.latitude, smoothedCoord.longitude, pos.coords.heading, pos.coords.accuracy);

      // Atualiza a visualização de primeira pessoa para manter o caminho à frente.
      setFirstPersonView(smoothedCoord.latitude, smoothedCoord.longitude, 20, pos.coords.heading);

      // Atualiza a navegação em tempo real.
      updateRealTimeNavigation(
        smoothedCoord.latitude,
        smoothedCoord.longitude,
        navigationState.instructions,
        selectedDestination.lat,
        selectedDestination.lon,
        selectedLanguage,
        pos.coords.heading
      );

      // Verifica se é necessário recalcular a rota (assumindo que routeData.points contenha os pontos da rota).
      if (routeData && routeData.points && shouldRecalculateRoute(smoothedCoord.latitude, smoothedCoord.longitude, routeData.points)) {
        notifyDeviation();
        recalculateRoute(
          smoothedCoord.latitude,
          smoothedCoord.longitude,
          selectedDestination.lat,
          selectedDestination.lon
        );
      }
    },
    (error) => {
      console.error("Erro no watchPosition:", error);
      showNotification(getGeneralText("trackingError", selectedLanguage), "error");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}




/**
 * autoRotationAuto
 * 
 * Atualiza a visualização do mapa para centralizar na localização atual do usuário e 
 * inicia o processo de rotação automática da camada de tiles.
 *
 * Fluxo:
 * 1. Verifica se a variável global userLocation está definida.
 * 2. Chama updateMapWithUserLocation para reposicionar o mapa com base nas coordenadas reais.
 * 3. Se a propriedade heading estiver disponível em userLocation, aplica a rotação inicial
 *    usando setMapRotation. Isso garante que, logo no início, o mapa seja rotacionado
 *    de acordo com o heading atual do usuário.
 * 4. Chama startRotationAuto para ativar os eventos de deviceorientation, permitindo
 *    que o mapa atualize continuamente a rotação com base nas leituras do dispositivo.
 */
function startRotationAuto() {
  console.log("[startRotationAuto] Tentando ativar rotação automática do mapa...");

  // Habilita a flag no navigationState (caso usemos em setMapRotation)
  if (navigationState) {
    navigationState.isRotationEnabled = true;
  }

  // Verifica se o dispositivo/navegador suportam DeviceOrientationEvent
  if (typeof DeviceOrientationEvent === "undefined") {
    console.warn("[startRotationAuto] 'DeviceOrientationEvent' não suportado.");
    showNotification("Rotação automática não suportada neste dispositivo.", "warning");
    return;
  }

  // iOS >= 13 precisa de permissão
  if (DeviceOrientationEvent.requestPermission && typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          console.log("[startRotationAuto] Permissão concedida para heading.");
          attachOrientationListener();
        } else {
          console.warn("[startRotationAuto] Permissão negada para heading.");
          showNotification("Rotação automática não autorizada.", "warning");
        }
      })
      .catch((err) => {
        console.error("[startRotationAuto] Erro ao solicitar permissão:", err);
        showNotification("Não foi possível ativar rotação automática.", "error");
      });
  } else {
    // Se não exigir permissão, adiciona o listener diretamente
    attachOrientationListener();
  }

function attachOrientationListener() {
    // Evita adicionar múltiplos listeners
    window.removeEventListener("deviceorientation", onDeviceOrientationChange, true);
    window.addEventListener("deviceorientation", onDeviceOrientationChange, true);
    console.log("[startRotationAuto] Evento 'deviceorientation' registrado com sucesso.");
  }

  function onDeviceOrientationChange(event) {
    const alpha = event.alpha; // tipicamente 0-360
    if (typeof alpha === "number" && !isNaN(alpha)) {
      // Ajusta rotação do mapa
      setMapRotation(alpha); 
    }
  }
}
/**

 * 2. stopRotationAuto
 * Desativa a rotação automática, remove listener e reseta a rotação do container se quiser.
*/
function stopRotationAuto() {
  // Marca no state
  if (navigationState) {
    navigationState.isRotationEnabled = false;
  }

  window.removeEventListener("deviceorientation", onDeviceOrientationChange, true);

  // Pode querer redefinir transform do map-container
  const mapContainer = document.getElementById("map-container");
  if (mapContainer) {
    mapContainer.style.transform = "rotate(0deg)";
    mapContainer.style.transition = "transform 0.3s ease-out";
  }

  console.log("[stopRotationAuto] Rotação automática desativada.");
}

/**
 * 2. endNavigation
 /**
 * endNavigation
 * Finaliza a navegação, limpando estados e parando o monitoramento.
 */
function endNavigation() {
    // 1) Finaliza e limpa tudo relativo à navegação
    isNavigationActive = false;
    isNavigationPaused = false;
    trackingActive = false; // Se houver uma flag global de rastreamento


    if (navigationWatchId !== null) {
        navigator.geolocation.clearWatch(navigationWatchId);
        navigationWatchId = null;
    }
    clearCurrentRoute();
    clearRouteMarkers();  // Remove marcadores de origem/destino e demais marcadores relacionados
    clearUserMarker();
    hideInstructionBanner();
    hideRouteFooter();
    hideRouteSummary();

    // 2) Agora restaura a interface com base na feature que o usuário estava usando
    if (lastSelectedFeature) {
        restoreFeatureUI(lastSelectedFeature);
    } else {
        // Se não tinha nada selecionado, volte para um estado genérico
        showMainCategories(); 
    }

      // 3) Exibe notificação de que a navegação foi encerrada
      showNotification(getGeneralText("navEnded", selectedLanguage), "info");



}

function showMainCategories() {
    hideAllControlButtons('start-navigation-button'); // garante que não haja botões duplicados
    
}

/**
 * 3. pauseNavigation
 *     Pausa a navegação.
 */
function pauseNavigation() {
  if (!navigationState.isActive) {
    console.warn("Navegação não está ativa para pausar.");
    return;
  }
  if (navigationState.isPaused) {
    console.log("Navegação já está pausada.");
    return;
  }
  navigationState.isPaused = true;
  if (window.positionWatcher) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = null;
  }
  showNotification(getGeneralText("navPaused", navigationState.lang), "info");
  console.log("Navegação pausada.");
}



/**
 * 4. toggleNavigationPause
 *     Alterna entre pausar e retomar a navegação. */
function toggleNavigationPause() {
  if (navigationState.isPaused) {
    navigationState.isPaused = false;
    showNotification(getGeneralText("navResumed", navigationState.lang), "success");
    if (navigationState.instructions && selectedDestination) {
      window.positionWatcher = navigator.geolocation.watchPosition(
        (pos) => {
          updateRealTimeNavigation(
            pos.coords.latitude,
            pos.coords.longitude,
            navigationState.instructions,
            selectedDestination.lat,
            selectedDestination.lon,
            navigationState.lang
          );
        },
        (err) => {
          console.error("Erro ao retomar watchPosition:", err);
          showNotification(getGeneralText("trackingError", navigationState.lang), "error");
        },
        { enableHighAccuracy: true }
      );
    }
    console.log("Navegação retomada.");
  } else {
    pauseNavigation();
  }
  console.log("toggleNavigationPause executado.");
}

/**
 * 5. updateRealTimeNavigation
 /**
 * updateRealTimeNavigation(lat, lon, instructions, destLat, destLon, lang, heading)
 * Atualiza a navegação em tempo real:
 * - Atualiza o marker do usuário com updateUserMarker.
 * - Reposiciona o mapa suavemente com panTo.
 * - Atualiza a interface (ex.: banner de instruções) com a instrução atual.
 */
function updateRealTimeNavigation(lat, lon, instructions, destLat, destLon, lang, heading) {
  // Atualiza ou cria o marcador do usuário com a nova posição e heading
  updateUserMarker(lat, lon, heading);
  // Se houver instruções disponíveis, atualiza o banner com a instrução atual
  if (instructions && instructions.length > 0) {
    const currentStepIndex = navigationState.currentStepIndex;
    const currentInstruction = instructions[currentStepIndex];
    if (currentInstruction) {
      updateInstructionBanner(currentInstruction, lang);
    }
  }
  // Centraliza o mapa na nova posição com uma animação suave (panTo)
  map.panTo([lat, lon], { animate: true, duration: 0.5 });
}




/**
* 6. adjustMapZoomBasedOnSpeed
 * Cria um sistema de zoom dinâmico que ajusta o zoom com base na velocidade.
 */
function adjustMapZoomBasedOnSpeed(speed) {
    let zoomLevel;

    if (speed < 5) {
        zoomLevel = 20; // Caminhando
    } else if (speed < 15) {
        zoomLevel = 16; // Bicicleta
    } else if (speed < 50) {
        zoomLevel = 14; // Carro
    } else {
        zoomLevel = 12; // Alta velocidade
    }

    map.setZoom(zoomLevel);
}


/**
* 7. getRouteBearingForUser
 * Calcula o rumo que o usuário deve seguir com base na rota.
 * Utiliza a projeção do ponto do usuário sobre a rota para identificar
 * o segmento e, a partir dele, determina o rumo em direção ao próximo ponto.
  * @param {number} userLat - Latitude do usuário.
 * @param {number} userLon - Longitude do usuário.
 * @param {Array} routeCoordinates - Array de pontos {lat, lon}.
 * @returns {number} Rumo (bearing) em graus.
 */
function getRouteBearingForUser(userLat, userLon, routeCoordinates) {
  if (!routeCoordinates || routeCoordinates.length < 2) return 0;
  
  const { closestPoint, segmentIndex } = getClosestPointOnRoute(userLat, userLon, routeCoordinates);
  
  // Se o usuário estiver no último segmento, use o último ponto
  const nextPoint = (segmentIndex < routeCoordinates.length - 1)
                      ? routeCoordinates[segmentIndex + 1]
                      : routeCoordinates[routeCoordinates.length - 1];
  
  return computeBearing(closestPoint.lat, closestPoint.lon, nextPoint.lat, nextPoint.lon);
}

/**
 * 8. clearUserMarker
 * Remove o marcador do usuário e o círculo de precisão do mapa,
 * desfazendo todas as alterações realizadas por updateUserMarker.
 * - Remove window.userMarker (se existir) e o retira do mapa.
 * - Remove window.userAccuracyCircle (se existir) e o retira do mapa.
 * - Limpa a variável window.lastPosition.
 */
function clearUserMarker() {
  // Remove o marcador do usuário, se existir
  if (window.userMarker) {
    map.removeLayer(window.userMarker);
    window.userMarker = null;
  }
  
  // Remove o círculo de precisão, se existir
  if (window.userAccuracyCircle) {
    map.removeLayer(window.userAccuracyCircle);
    window.userAccuracyCircle = null;
  }
  
  // Limpa a última posição armazenada
  window.lastPosition = null;
  
  console.log("clearUserMarker: Marcador do usuário e círculo de precisão removidos.");
}

/**

  --- 12.2. Recalibração e Notificações ---

/**
 * 1. recalculateRoute
 *     Recalcula a rota em caso de desvio. */
/**
 * Recalcula a rota com base na posição atual do usuário.
 * Atualiza as instruções, a rota no mapa e fornece feedback ao usuário.
 * @param {number} currentLat - Latitude atual do usuário.
 * @param {number} currentLon - Longitude atual do usuário.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 */
async function recalculateRoute(currentLat, currentLon, destLat, destLon) {
  lastRecalculationTime = Date.now();
  showRouteLoadingIndicator();
  
  // Busca novas opções de rota com base na posição atual e destino
  let newRouteOptions = await fetchMultipleRouteOptions(currentLat, currentLon, destLat, destLon);
  if (!newRouteOptions || newRouteOptions.length === 0) {
    showNotification(getGeneralText("noInstructions", selectedLanguage), "error");
    hideRouteLoadingIndicator();
    return;
  }
  
  // Permite que o usuário escolha a nova rota
  let newSelectedRoute = await promptUserToChooseRoute(newRouteOptions);
  if (!newSelectedRoute) {
    hideRouteLoadingIndicator();
    return;
  }
  
  // Enriquece as instruções da nova rota e atualiza o estado global
  let newRouteInstructions = await enrichInstructionsWithOSM(newSelectedRoute.routeData, selectedLanguage);
  navigationState.instructions = newRouteInstructions;
  
  // Plota a nova rota e finaliza os marcadores
  const newRouteData = await plotRouteOnMap(currentLat, currentLon, destLat, destLon);
  finalizeRouteMarkers(currentLat, currentLon, selectedDestination);
  
  // Atualiza a interface com a nova rota
  updateInstructionBanner(newRouteInstructions[0], selectedLanguage);
  updateRouteFooter(newRouteData, selectedLanguage);
  hideRouteLoadingIndicator();
  giveVoiceFeedback(getGeneralText("routeRecalculated", selectedLanguage) || "Rota recalculada.");
}


/**
 * 2. notifyDeviation
/**
 * notifyDeviation
 * Notifica o usuário sobre um desvio do trajeto e dispara o recálculo da rota.
 * Chama recalculateRoute com a flag bigDeviation.
 */
function notifyDeviation() {
  const lang = navigationState.lang || "pt";
  // Exibe uma notificação informando que o usuário desviou da rota
  showNotification(getGeneralText("routeDeviated", lang), "warning");
  // Se houver uma localização e destino válidos, chama recalculateRoute com a flag de desvio grande
  if (userLocation && selectedDestination) {
    recalculateRoute(
      userLocation.latitude,
      userLocation.longitude,
      selectedDestination.lat,
      selectedDestination.lon,
      { bigDeviation: true, lang }
    );
  }
  console.log("[notifyDeviation] Notificação de desvio enviada e recálculo iniciado.");
}



/**
 * 3. validateDestination
 * Verifica se o destino fornecido (ou o global selectedDestination) possui coordenadas válidas.
 * Agora também verifica os limites geográficos.
  * @param {Object} [destination=selectedDestination] - Objeto com as propriedades lat e lon.
 * @returns {boolean} - true se o destino for válido; false caso contrário. */
function validateDestination(destination = selectedDestination) {
  console.log("[validateDestination] Verificando destino...");
  
  if (!destination) {
    showNotification(getGeneralText("invalidDestination", navigationState.lang), "warning");
    console.warn("[validateDestination] Destino não fornecido.");
    return false;
  }
  
  const { lat, lon } = destination;
  if (
    typeof lat !== "number" ||
    typeof lon !== "number" ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    showNotification(getGeneralText("invalidDestination", navigationState.lang), "warning");
    console.warn("[validateDestination] Propriedades lat/lon inválidas:", destination);
    return false;
  }
  
  // Verifica limites: latitude entre -90 e 90; longitude entre -180 e 180
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    showNotification(getGeneralText("invalidDestination", navigationState.lang), "warning");
    console.warn("[validateDestination] Coordenadas fora dos limites:", destination);
    return false;
  }
  
  console.log("[validateDestination] Destino válido:", destination);
  return true;
}

/**
 * 4. handleRecalculation
 *     Lida com o recálculo automático da rota. */
function handleRecalculation() {
  if (checkIfUserIdle()) {
    pauseNavigation();
  } else {
    recalculateRoute(userLocation.latitude, userLocation.longitude, selectedDestination.lat, selectedDestination.lon);
  }
  console.log("handleRecalculation executado.");
}

/**
 * 5. highlightNextStepInMap
 *     Destaca visualmente o próximo passo da rota no mapa. */
function highlightNextStepInMap(step) {
  if (!step || !step.lat || !step.lon) {
    console.warn("Step inválido para destaque.");
    return;
  }
  if (window.nextStepMarker) {
    map.removeLayer(window.nextStepMarker);
    window.nextStepMarker = null;
  }
  const highlightIcon = L.divIcon({ className: "blinking-arrow" });
  window.nextStepMarker = L.marker([step.lat, step.lon], { icon: highlightIcon }).addTo(map);
  window.nextStepMarker.bindPopup(`Próximo passo: ${step.text}`).openPopup();
  console.log("Próximo passo destacado:", step.text);
}

/**
 * 6. notifyRouteDeviation
 *    Exibe notificação de que o usuário está fora da rota. */
function notifyRouteDeviation() {
  showNotification("Você está fora da rota. Ajuste seu caminho.", "warning");
}

/**
 * 7. notifyNextInstruction
 *    Exibe a próxima instrução de navegação. */
function notifyNextInstruction(instruction) {
  showNotification(`Próxima instrução: ${instruction}`, "info");
  console.log("Instrução notificada:", instruction);
}

/**
 * 8. shouldRecalculateRoute
/**
 * shouldRecalculateRoute
 * Verifica se o usuário se afastou do passo atual a ponto de necessitar um recálculo da rota.
 *
 * @param {number} userLat - Latitude atual do usuário.
 * @param {number} userLon - Longitude atual do usuário.
 * @param {Array} instructions - Array de instruções da rota.
 * @returns {boolean} - true se a distância até o passo atual for maior que 50 metros.
 */
// Variável global para controlar o tempo do último recálculo
// Defina o limiar de desvio (em metros) e o cooldown (em milissegundos)
const RECALCULATION_THRESHOLD = 10; // Exemplo: 10 metros
const RECALCULATION_COOLDOWN = 30000; // Exemplo: 30 segundos

/**
 * Verifica se é necessário recalcular a rota.
 * @param {number} currentLat - Latitude atual do usuário.
 * @param {number} currentLon - Longitude atual do usuário.
 * @param {Array} routePoints - Array de pontos representando a rota atual.
 * @returns {boolean} - Retorna true se o desvio for maior que o limiar e se passou o cooldown.
 */
function shouldRecalculateRoute(currentLat, currentLon, routePoints) {
  const now = Date.now();
  if (now - lastRecalculationTime < RECALCULATION_COOLDOWN) {
    return false;
  }
  const deviation = distanceToPolyline({ lat: currentLat, lon: currentLon }, routePoints);
  return deviation > RECALCULATION_THRESHOLD;
}




/**
 * 9. checkIfUserIdle
 *     Verifica se o usuário está inativo.
 *     (Stub: retorna false como exemplo.) */
function checkIfUserIdle(timeout = 300000) {
  // Exemplo: sempre retorna false
  return false;
}

/**
  --- 12.3. Enriquecimento das Instruções ---
/**
 * 1. validateRouteData
 *    Valida os dados retornados pela API de rota. */
function validateRouteData(routeData) {
  if (!routeData || !routeData.features || routeData.features.length === 0) {
    showNotification("Erro ao carregar dados da rota.", "error");
    return false;
  }
  const coords = routeData.features[0].geometry.coordinates;
  if (!coords || coords.length === 0) {
    showNotification("Rota sem coordenadas.", "error");
    return false;
  }
  console.log("Dados de rota validados.");
  return true;
}

/**
 * 2. startRoutePreview
 *     Exibe a pré-visualização da rota antes de iniciar a navegação. */
function startRoutePreview() {
    if (!currentRouteData) {
        showNotification("Nenhuma rota disponível para pré-visualização.", "error");
        return;
    }
    // Exibe o resumo e o botão
    displayRouteSummary(currentRouteData);
    displayStartNavigationButton();
}

/**
 * 3. drawPath
 *     Desenha uma polyline representando a rota no mapa. */
function drawPath(userLat, userLon, instructions, lang) {
  try {
    if (window.navigationPath) {
      map.removeLayer(window.navigationPath);
    }
    const latLngs = instructions.map(step => [step.lat, step.lon]);
    latLngs.unshift([userLat, userLon]);
    window.navigationPath = L.polyline(latLngs, {
      color: "blue",
      weight: 6,
      dashArray: "10, 5"
    }).addTo(map);
    addInteractiveArrowsOnRoute(latLngs);
    map.fitBounds(window.navigationPath.getBounds(), { padding: [50, 50] });
    console.log("Rota desenhada com sucesso.");
  } catch (error) {
    console.error("Erro ao desenhar rota:", error);
    showNotification(getGeneralText("failedToPlotRoute", lang), "error");
  }
}

/**
 * 4. enrichInstructionsWithOSM
/**
 * enrichInstructionsWithOSM
 * Enriquece as instruções com dados adicionais do OSM (por exemplo, POIs próximos).
 *
 * @param {Array} instructions - Array de instruções da rota.
 * @param {string} [lang='pt'] - Idioma para as mensagens.
 * @returns {Promise<Array>} - Array de instruções enriquecidas.
 */
async function enrichInstructionsWithOSM(instructions, lang = 'pt') {
  try {
    const enriched = await Promise.all(
      instructions.map(async (step) => {
        // Chama a função que simula a busca de POIs próximos
        const pois = await fakeFetchPOIsNearby(step.lat, step.lon);
        if (pois && pois.length > 0) {
          // Prepara a mensagem extra substituindo o {count} pela quantidade de POIs
          const extraMsg = getGeneralText("pois_nearby", lang)
            ? getGeneralText("pois_nearby", lang).replace("{count}", pois.length)
            : `Existem ${pois.length} POIs próximos.`;
          step.enrichedInfo = extraMsg;
        } else {
          step.enrichedInfo = null;
        }
        return step;
      })
    );
    console.log("[enrichInstructionsWithOSM] Instruções enriquecidas com dados do OSM/POIs.");
    return enriched;
  } catch (error) {
    console.error("[enrichInstructionsWithOSM] Erro ao enriquecer instruções:", error);
    return instructions;
  }
}


/**
 * fakeFetchPOIsNearby
 * Simula uma requisição assíncrona que retorna pontos de interesse próximos.
 */
async function fakeFetchPOIsNearby(lat, lon) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { name: "POI 1", lat: lat + 0.001, lon: lon + 0.001 },
        { name: "POI 2", lat: lat - 0.001, lon: lon - 0.001 }
      ]);
    }, 500);
  });
}

/**
 * 5. fetchRouteInstructions
 /**
 * fetchRouteInstructions
 * Busca instruções de rota (turn-by-turn) via API OpenRouteService.
 * - Monta a URL com os parâmetros fornecidos.
 * - Faz a requisição e mapeia os passos (steps) da rota.
 *
 * @param {number} startLat - Latitude de origem.
 * @param {number} startLon - Longitude de origem.
 * @param {number} destLat - Latitude do destino.
 * @param {number} destLon - Longitude do destino.
 * @param {string} [lang="pt"] - Idioma para as instruções.
 * @param {number} [timeoutMs=10000] - Timeout em ms para a requisição.
 * @param {boolean} [shouldEnrich=true] - Flag para indicar se instruções serão enriquecidas.
 * @param {string} [profile="foot-walking"] - Perfil de rota.
 * @returns {Promise<Array>} - Array de instruções formatadas.
 */
async function fetchRouteInstructions(
  startLat, startLon, destLat, destLon,
  lang = "pt", timeoutMs = 10000,
  shouldEnrich = true, profile = "foot-walking"
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Monta a URL para a API com os parâmetros necessários
    const url = `https://api.openrouteservice.org/v2/directions/${profile}?` +
      `start=${startLon},${startLat}&end=${destLon},${destLat}&language=${lang}` +
      `&api_key=${apiKey}&instructions=true`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) {
      showNotification(`Falha ao obter rota (status ${response.status})`, "error");
      return [];
    }
    const data = await response.json();
    // Extrai os passos (steps) e as coordenadas da rota
    const steps = data.features?.[0]?.properties?.segments?.[0]?.steps;
    const coords = data.features?.[0]?.geometry?.coordinates;
    if (!steps || !coords) {
      showNotification(getGeneralText("noInstructions", lang), "error");
      return [];
    }
    // Mapeia os passos para um formato mais simples, extraindo também dados via mapORSInstruction
    const finalSteps = steps.map((step, index) => {
      const coordIndex = step.way_points?.[0] ?? 0;
      const [lon, lat] = coords[coordIndex];
      const { maneuverKey, placeName } = mapORSInstruction(step.instruction);
      return {
        id: index + 1,
        raw: step.instruction,
        text: step.instruction,
        distance: Math.round(step.distance),
        lat,
        lon,
        maneuverKey,
        streetName: placeName
      };
    });
    return finalSteps;
  } catch (err) {
    clearTimeout(id);
    console.error("[fetchRouteInstructions] Erro ou timeout na requisição:", err);
    showNotification("Tempo excedido ou erro ao buscar rota. Tente novamente.", "error");
    return [];
  }
}




/**
 * 6. finalizeRouteMarkers
/**
 * finalizeRouteMarkers
 * Adiciona marcadores de origem e destino no mapa.
 *
 * @param {number} userLat - Latitude do ponto de origem.
 * @param {number} userLon - Longitude do ponto de origem.
 * @param {Object} destination - Objeto contendo lat, lon e (opcionalmente) o nome do destino.
 */
function finalizeRouteMarkers(userLat, userLon, destination) {
  // Adiciona um marcador no destino com um ícone de bandeira de chegada
  window.destRouteMarker = L.marker([destination.lat, destination.lon])
    .addTo(map)
    .bindPopup(`🏁${destination.name || "Destino"}`)
    .openPopup();
  console.log("[finalizeRouteMarkers] Marcadores de origem e destino adicionados.");
}
  

/**
 * 7. recalcRouteOnDeviation
 *     Recalcula a rota ao detectar que o usuário se desviou. */
async function recalcRouteOnDeviation(userLat, userLon, destLat, destLon) {
  console.log("Recalculando rota devido ao desvio...");
  if (currentRoute) {
    map.removeLayer(currentRoute);
    currentRoute = null;
  }
  const data = await plotRouteOnMap(userLat, userLon, destLat, destLon);
  if (!data) {
    console.warn("Falha ao recalcular rota (plot).");
    return;
  }
  const newInstructions = await fetchRouteInstructions(userLat, userLon, destLat, destLon, selectedLanguage);
  if (!newInstructions || newInstructions.length === 0) {
    console.warn("Instruções vazias após recalc.");
    return;
  }
  navigationState.instructions = newInstructions;
  navigationState.currentStepIndex = 0;
  navigationState.isPaused = false;
  updateInstructionBanner(newInstructions[0], selectedLanguage);
  console.log("Rota recalculada com sucesso.");
}

/**
 * 8. updateRouteFooter
/**
 * updateRouteFooter
 * Atualiza o rodapé da rota com informações de tempo estimado e distância.
 *
 * @param {Object} routeData - Dados da rota retornados pela API.
 * @param {string} [lang=selectedLanguage] - Código do idioma.
 */
function updateRouteFooter(routeData, lang = selectedLanguage) {
  if (!routeData || !routeData.features || routeData.features.length === 0) {
    console.warn("[updateRouteFooter] Dados de rota inválidos para atualização.");
    return;
  }
  // Extrai o resumo da rota com duração e distância
  const summary = routeData.features[0].properties.summary;
  const etaMinutes = Math.round(summary.duration / 60);
  const distanceKm = (summary.distance / 1000).toFixed(2);
  
  // Atualiza os elementos do DOM com o tempo e distância
  const routeTimeElem = document.getElementById("route-time");
  const routeDistanceElem = document.getElementById("route-distance");
  if (routeTimeElem) {
    routeTimeElem.textContent = `${etaMinutes} ${getGeneralText("minutes", lang)}`;
  }
  if (routeDistanceElem) {
    routeDistanceElem.textContent = `${distanceKm} km`;
  }
  
  const footer = document.getElementById("route-footer");
  if (footer) {
    footer.classList.remove("hidden");
    footer.style.display = "flex";
  }
  console.log("[updateRouteFooter] Rodapé atualizado: Tempo =", etaMinutes, "min; Distância =", distanceKm, "km.");
}



/**
 * 9. updateInstructionBanner
/**
 * updateInstructionBanner
 * Atualiza o banner de instruções exibido na interface.
 * - Formata a mensagem utilizando buildInstructionMessage e mapORSInstruction.
 * - Atualiza o ícone correspondente à manobra.
 *
 * @param {Object} instruction - Objeto contendo a instrução atual.
 * @param {string} [lang=selectedLanguage] - Código do idioma.
 */
function updateInstructionBanner(instruction, lang = selectedLanguage) {
  const banner = document.getElementById("instruction-banner");
  if (!banner) {
    console.error("updateInstructionBanner: Banner de instruções não encontrado (#instruction-banner).");
    return;
  }
  const arrowEl = document.getElementById("instruction-arrow");
  const mainEl = document.getElementById("instruction-main");

  let finalMessage = "";
  // Se a instrução possui um texto bruto, constrói a mensagem formatada
  if (instruction.raw) {
    finalMessage = buildInstructionMessage(instruction.raw, lang);
  } else {
    finalMessage = instruction.text || getGeneralText("unknown", lang);
  }
  // Extrai a manobra e o nome do local usando mapORSInstruction para obter o ícone
  const mapped = instruction.raw ? mapORSInstruction(instruction.raw) : { maneuverKey: "unknown" };
  const directionIcon = (typeof getDirectionIcon === "function")
    ? getDirectionIcon(mapped.maneuverKey)
    : "➡️";

  if (arrowEl) arrowEl.textContent = directionIcon;
  if (mainEl) mainEl.textContent = finalMessage;

  banner.classList.remove("hidden");
  banner.style.display = "flex";
  console.log("updateInstructionBanner: Banner atualizado com:", finalMessage);
}



/**
 * 10. updateNavigationInstructions
 *     Atualiza as instruções de navegação em tempo real conforme o usuário se move. */
function updateNavigationInstructions(userLat, userLon, instructions, destLat, destLon, lang = selectedLanguage) {
  if (!instructions || instructions.length === 0) {
    console.warn("Nenhuma instrução disponível para atualizar.");
    return;
  }
  const currentIndex = navigationState.currentStepIndex;
  const currentStep = instructions[currentIndex];
  if (!currentStep) {
    console.warn("Nenhum passo atual encontrado.");
    return;
  }
  const dist = calculateDistance(userLat, userLon, currentStep.lat, currentStep.lon);
  console.log(`Distância até a instrução atual: ${dist.toFixed(1)} m`);
  if (dist < 10) {
    navigationState.currentStepIndex++;
    if (navigationState.currentStepIndex < instructions.length) {
      const nextStep = instructions[navigationState.currentStepIndex];
      updateInstructionBanner(nextStep, lang);
      speakInstruction(nextStep.text, lang === "pt" ? "pt-BR" : "en-US");
    } else {
      showNotification(getGeneralText("destinationReached", lang), "success");
      endNavigation();
    }
  }
}

/**
 * 11. updateNavigationProgress
 *     Atualiza a barra de progresso da navegação. */
function updateNavigationProgress(progress) {
  const progressBar = document.getElementById("progress-bar");
  if (!progressBar) return;
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute("aria-valuenow", progress.toString());
  console.log(`Progresso atualizado: ${progress}%`);
}

/**
 * 12. updateRoutePreview
 *     Atualiza container com pré-visualização de rota */
 function updateRoutePreview(contentHTML) {
  const previewContainer = document.getElementById("route-preview");
  if (!previewContainer) {
    console.error("Container de pré-visualização não encontrado.");
    return;
  }
  previewContainer.innerHTML = contentHTML;
  previewContainer.classList.remove("hidden");
  previewContainer.style.display = "block";
  console.log("Pré-visualização da rota atualizada.");
}
/**

  --- 12.4. Rotina de Navegação ---

 * 1. startRotationAuto
 * @description Ativa a rotação automática do mapa, sincronizando com o heading (orientação)
 * do usuário, se suportado. Usa DeviceOrientationEvent, solicitando permissão em iOS.
*/
// Declare globalmente
// Função para anexar o listener de deviceorientation e iniciar a rotação automática
function startRotationAuto() {
  if (DeviceOrientationEvent.requestPermission && typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === "granted") {
          attachOrientationListener();
        } else {
          showNotification("Rotação automática não autorizada.", "warning");
        }
      })
      .catch(err => {
        showNotification("Não foi possível ativar rotação automática.", "error");
      });
  } else {
    attachOrientationListener();
  }

   function attachOrientationListener() {
    window.removeEventListener("deviceorientation", onDeviceOrientationChange, true);
    window.addEventListener("deviceorientation", onDeviceOrientationChange, true);
  }
}

// Função de callback para o evento deviceorientation
function onDeviceOrientationChange(event) {
  const alpha = event.alpha;
  if (typeof alpha === "number" && !isNaN(alpha)) {
    setMapRotation(alpha);
  }
}


/**
 * stopRotationAuto
 * Desativa a rotação automática do mapa removendo o listener de deviceorientation.
 * Também reseta a transformação CSS do container do mapa.
 */
function stopRotationAuto() {
  if (navigationState) {
    navigationState.isRotationEnabled = false;
  }
  window.removeEventListener("deviceorientation", onDeviceOrientationChange, true);
  
  // Em vez de alterar o container principal, remova a transformação da camada de tiles
  removeRotationFromTileLayer();
  
  console.log("stopRotationAuto: Rotação automática desativada.");
}



/**
  --- 12.5. Formatação e Exibição de Instruções ---

 * 1. buildInstructionMessage
 * Monta a mensagem final a partir da instrução bruta.
 */
function buildInstructionMessage(rawInstruction, lang = 'pt') {
  // Usa mapORSInstruction para extrair a chave da manobra e o nome do local
  const { maneuverKey, placeName } = mapORSInstruction(rawInstruction);
  // Se houver um local, utiliza a chave com sufixo "_on"
  if (placeName) {
    return getGeneralText(`${maneuverKey}_on`, lang) + " " + placeName;
  } else {
    return getGeneralText(maneuverKey, lang);
  }
}


/**
 * 2. updateInstructionDisplay
 * Atualiza e exibe a lista de instruções na interface.
 * Recebe um array de instruções brutas e o idioma selecionado.
 * O elemento com id "instructions-container" deve existir na página.
 */
function updateInstructionDisplay(rawInstructions, lang = 'pt') {
  const container = document.getElementById("instruction-banner");
  if (!container) {
    console.error("Elemento 'instruction-banner' não encontrado.");
    return;
  }
  // Limpa o conteúdo atual
  container.innerHTML = "";

  rawInstructions.forEach(instruction => {
    const message = buildInstructionMessage(instruction, lang);
    // Cria um elemento para cada instrução (por exemplo, um <li>)
    const li = document.createElement("li");
    li.textContent = message;
    container.appendChild(li);
  });
}


/**
 * 3. mapORSInstruction
 * Extrai da instrução bruta a manobra, a direção e o nome do local.
 */
function mapORSInstruction(rawInstruction) {
  let maneuverKey = "unknown";
  let placeName = "";
  let prepositionUsed = "";
  if (!rawInstruction) return { maneuverKey, placeName, prepositionUsed };

  const text = rawInstruction.toLowerCase();

  // Tenta identificar padrões de instrução como "head north", "turn left", etc.
  const headRegex = /^head\s+(north(?:\s*east|west)?|south(?:\s*east|west)?|east(?:\s*north|south)?|west(?:\s*north|south)?|northeast|southeast|southwest|northwest)/;
  const headMatch = text.match(headRegex);
  if (headMatch) {
    const direction = headMatch[1].replace(/\s+/g, "_");
    maneuverKey = `head_${direction}`;
  } else if (text.includes("turn sharp left")) {
    maneuverKey = "turn_sharp_left";
  } else if (text.includes("turn sharp right")) {
    maneuverKey = "turn_sharp_right";
  } else if (text.includes("turn slight left")) {
    maneuverKey = "turn_slight_left";
  } else if (text.includes("turn slight right")) {
    maneuverKey = "turn_slight_right";
  } else if (text.includes("turn left")) {
    maneuverKey = "turn_left";
  } else if (text.includes("turn right")) {
    maneuverKey = "turn_right";
  } else if (text.includes("continue straight")) {
    maneuverKey = "continue_straight";
  } else if (text.includes("keep left")) {
    maneuverKey = "keep_left";
  } else if (text.includes("keep right")) {
    maneuverKey = "keep_right";
  } else if (text.includes("u-turn")) {
    maneuverKey = "u_turn";
  } else if (text.includes("enter roundabout")) {
    maneuverKey = "enter_roundabout";
  } else if (text.includes("exit roundabout")) {
    maneuverKey = "exit_roundabout";
  } else if (text.includes("ferry")) {
    maneuverKey = "ferry";
  } else if (text.includes("end of road")) {
    maneuverKey = "end_of_road";
  }

  // Detecta a preposição (on, onto, in) e, se encontrada, extrai o nome do local
  const prepositionRegex = /\b(on|onto|in)\b/;
  const prepositionMatch = text.match(prepositionRegex);
  if (prepositionMatch) {
    prepositionUsed = prepositionMatch[1];
  }
  if (prepositionUsed) {
    const placeRegex = new RegExp(`\\b(?:${prepositionUsed})\\b\\s+(.+?)(?:[,\\.]|$)`, 'i');
    const placeMatch = rawInstruction.match(placeRegex);
    if (placeMatch && placeMatch[1]) {
      placeName = placeMatch[1].trim();
    }
  }
  return { maneuverKey, placeName, prepositionUsed };
}



/**

 * 4. animateMapToLocalizationUser
 /**
/**
 * animateMapToLocalizationUser(targetLat, targetLon)
 * Realiza uma animação suave para centralizar o mapa na localização do usuário.
 * A animação interpola entre o centro atual e a posição (targetLat, targetLon) durante 1 segundo.
 */
function animateMapToLocalizationUser(targetLat, targetLon) {
  const animationDuration = 1000; // duração em milissegundos
  const startCenter = map.getCenter();
  const startLat = startCenter.lat;
  const startLon = startCenter.lng;
  const startTime = performance.now();

  function animateFrame(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / animationDuration, 1); // Progresso de 0 a 1
    // Interpolação linear entre a posição atual e a posição alvo
    const interpolatedLat = startLat + (targetLat - startLat) * progress;
    const interpolatedLon = startLon + (targetLon - startLon) * progress;
    // Atualiza a vista do mapa sem animação nativa
    map.setView([interpolatedLat, interpolatedLon], map.getZoom(), { animate: false });
    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    }
  }
  requestAnimationFrame(animateFrame);
}




/**
 * promptUserToChooseRoute
 * Exibe uma interface gráfica (modal) para que o usuário escolha uma das rotas disponíveis.
 * Cria dinamicamente um modal com botões para cada opção de rota e aguarda a seleção do usuário.
 *
 * @param {Array} routeOptions - Array de objetos com { profile, routeData }.
 * @returns {Promise<Object|null>} - Retorna a opção escolhida ou null se cancelado.
 */
async function promptUserToChooseRoute(routeOptions) {
  return new Promise((resolve, reject) => {
    // Cria o overlay do modal para seleção de rota
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '9999';
    // Cria o container do modal com título e botões
    const modalContainer = document.createElement('div');
    modalContainer.style.backgroundColor = '#fff';
    modalContainer.style.padding = '20px';
    modalContainer.style.borderRadius = '8px';
    modalContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modalContainer.style.maxWidth = '400px';
    modalContainer.style.width = '80%';
    modalContainer.style.textAlign = 'center';
    const title = document.createElement('h3');
    title.textContent = 'Escolha uma opção de rota:';
    title.style.marginBottom = '20px';
    modalContainer.appendChild(title);
    // Para cada rota disponível, cria um botão
    routeOptions.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.textContent = `${index + 1}: ${option.profile}`;
      btn.style.margin = '10px';
      btn.style.padding = '10px 20px';
      btn.style.border = 'none';
      btn.style.borderRadius = '4px';
      btn.style.backgroundColor = '#007BFF';
      btn.style.color = '#fff';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        document.body.removeChild(modalOverlay);
        resolve(option);
      };
      modalContainer.appendChild(btn);
    });
    // Botão de cancelar a seleção
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.margin = '10px';
    cancelBtn.style.padding = '10px 20px';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.backgroundColor = '#dc3545';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => {
      document.body.removeChild(modalOverlay);
      resolve(null);
    };
    modalContainer.appendChild(cancelBtn);
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);
  });
}


/**

 * 5. hideRouteFooter
 * Esconde o rodapé do resumo da rota.
 * Elemento: id="route-footer"
 */
function hideRouteFooter() {
  const footer = document.getElementById("route-footer");
  if (footer) {
    footer.style.display = "none";
    footer.classList.add("hidden");
    console.log("Rodapé de resumo da rota escondido.");
  } else {
    console.warn("Elemento 'route-footer' não encontrado.");
  }
}

/**
 * 6. hideInstructionBanner
 * Esconde o banner de instruções.
 * Elemento: id="instruction-banner"
 */
function hideInstructionBanner() {
  const banner = document.getElementById("instruction-banner");
  if (banner) {
    banner.style.display = "none";
    banner.classList.add("hidden");
    console.log("Banner de instruções escondido.");
  } else {
    console.warn("Elemento 'instruction-banner' não encontrado.");
  }
}

/*===========================================================================
SEÇÃO 13 – TUTORIAL
===========================================================================
  --- 13.1. Fluxo do Tutorial ---
/**
 * 1. startTutorial - Inicia o tutorial interativo (definindo tutorialIsActive etc.)
 */
function startTutorial() {
  tutorialIsActive = true;
  currentStep = 0; // índice do passo inicial
  showTutorialStep("start-tutorial");
  console.log("startTutorial: Tutorial iniciado.");
}

/**
 * 2. endTutorial - Finaliza o tutorial, limpando estado e fechando modal.
 */
function endTutorial() {
  tutorialIsActive = false;
  currentStep = null;
  hideAllControlButtons();
  hideAssistantModal();
  console.log("endTutorial: Tutorial finalizado.");
}

/**
 * 3. nextTutorialStep - Avança para o próximo passo do tutorial.
 */
function nextTutorialStep() {
  if (currentStep < tutorialSteps.length - 1) {
    currentStep++;
    showTutorialStep(tutorialSteps[currentStep].step);
  } else {
    endTutorial();
  }
  console.log(`nextTutorialStep: Passo do tutorial definido para ${currentStep}.`);
}

/**
 * 4. previousTutorialStep - Retorna ao passo anterior do tutorial.
 */
function previousTutorialStep(currentStepId) {
  const idx = tutorialSteps.findIndex(s => s.step === currentStepId);
  if (idx > 0) {
    const previous = tutorialSteps[idx - 1];
    showTutorialStep(previous.step);
  }
  console.log("previousTutorialStep: Voltou um passo no tutorial.");
}

/**
 * 5. showTutorialStep - Exibe conteúdo de um passo específico do tutorial.
 */
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

/**
  --- 13.2. Armazenamento de Respostas e Interesses ---
 * 1. storeAndProceed - Armazena a resposta do usuário e chama showTutorialStep para o próximo passo. */
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

/**
 * 2. generateInterestSteps - Gera passos personalizados de interesse (tutorial). */
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

/**
 * 3. removeExistingHighlights - Remove destaques visuais (ex.: setas, círculos).
 */
function removeExistingHighlights() {
  document.querySelectorAll(".arrow-highlight").forEach(e => e.remove());
  document.querySelectorAll(".circle-highlight").forEach(e => e.remove());
  console.log("removeExistingHighlights: Destaques visuais removidos.");
}

/*===========================================================================
SEÇÃO 14 – INTERFACE & CONTROLE VISUAL
===========================================================================
  --- 14.1. Mensagens e Barras ---
/**
 * 1. showWelcomeMessage - Exibe a mensagem de boas-vindas e habilita os botões de idioma.
 */
function showWelcomeMessage() {
  const modal = document.getElementById("welcome-modal");
  if (!modal) return;
  modal.style.display = "block";
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.style.pointerEvents = "auto";
  });
  console.log("Mensagem de boas-vindas exibida.");
}

/**
 * 2. showNavigationBar - Mostra a barra de navegação na interface.
 */
function showNavigationBar() {
  const navBar = document.getElementById("navigation-bar");
  if (navBar) {
    navBar.style.display = "block";
    console.log("Barra de navegação exibida.");
  }
}

/**
  --- 14.2. Resumo e Destaques ---
/**
 * 1. displayRouteSummary - Exibe um resumo da rota no painel lateral.
 */
function displayRouteSummary(routeData, lang = selectedLanguage) {
  const summary = routeData.features[0].properties.summary;
  const etaMinutes = Math.round(summary.duration / 60);
  const distanceKm = (summary.distance / 1000).toFixed(2);

  const routeSummaryTitle = getGeneralText("route_summary_title", lang);
  const routeDistanceLabel = getGeneralText("route_distance", lang);
  const routeEtaLabel = getGeneralText("route_eta", lang);
  const minutesTxt = getGeneralText("minutes", lang);

  const summaryHTML = `
    <div class="route-summary">
      <h3>${routeSummaryTitle}</h3>
      <p id="route-distance">${routeDistanceLabel} <strong>${distanceKm} km</strong></p>
      <p id="route-eta">${routeEtaLabel} <strong>${etaMinutes} ${minutesTxt}</strong></p>
    </div>
  `;

  const summaryContainer = document.getElementById("route-summary");
  if (summaryContainer) {
    summaryContainer.innerHTML = summaryHTML;
    summaryContainer.classList.remove("hidden");
    summaryContainer.style.display = "block";
    console.log("Resumo da rota exibido.");
  }
}

/**
 * 2. highlightCriticalInstruction - Destaca uma instrução crítica na interface.
 */
function highlightCriticalInstruction(instruction) {
  const instructionElement = document.getElementById("instruction");
  if (instructionElement) {
    instructionElement.innerHTML = `<strong>${instruction}</strong>`;
    console.log("Instrução crítica destacada:", instruction);
  }
}

/**
  --- 14.3. Exibição/Ocultação de Controles ---
/**
 * 1. hideAllControls - Oculta todos os controles e botões da interface.
 */
function hideAllControls(hideInstructions = false) {
  const controlButtons = document.querySelectorAll(".control-btn");
  controlButtons.forEach(btn => {
    btn.style.display = "none";
  });
  console.log("Todos os controles ocultados.");
  if (hideInstructions) {
    const instructionsModal = document.getElementById("navigation-instructions");
    if (instructionsModal) {
      instructionsModal.classList.add("hidden");
      console.log("Modal de instruções também ocultado.");
    }
  }
}

/**
 * 2. showRoutePreview - Exibe a pré-visualização da rota.
 */
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
  console.log("Pré-visualização da rota exibida.");
}

/**
 * 3. hideRoutePreview - Oculta a pré-visualização da rota.
 */
function hideRoutePreview() {
  const previewContainer = document.getElementById("route-preview");
  if (!previewContainer) {
    console.error("Elemento #route-preview não encontrado.");
    return;
  }
  previewContainer.classList.add("hidden");
  previewContainer.innerHTML = "";
  console.log("Pré-visualização da rota oculta.");
}

/**
  --- 14.4. Elementos Visuais no Mapa ---
/**
 * 1. addDirectionArrows - Adiciona setas de direção no mapa.
 */
function addDirectionArrows(coordinates) {
  coordinates.forEach(point => {
    addArrowToMap(point);
  });
  console.log("Setas de direção adicionadas ao mapa.");
}

/**
 * 2. showUserLocationPopup - Exibe um popup com a localização do usuário.
 */
function showUserLocationPopup(lat, lon) {
  const timestamp = new Date().toLocaleString(selectedLanguage || "pt-BR");
  const message = getGeneralText("youAreHere", selectedLanguage) || "Você está aqui!";
  L.popup()
    .setLatLng([lat, lon])
    .setContent(`
      <strong>${message}</strong><br>
      Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}<br>
      Horário: ${timestamp}
    `)
    .openOn(map);
  console.log("Popup de localização do usuário exibido.");
}

/**
  --- 14.5. Instruções e Modais ---
/**
 * 1. displayStartNavigationButton - Exibe o botão para iniciar a navegação.
 */
function displayStartNavigationButton() {
  const startNavButton = document.getElementById("start-navigation-button");
  const endNavButton = document.getElementById("navigation-end-btn");
  const tutorialMenuButton = document.getElementById("tutorial-menu-btn");

  if (!startNavButton || !endNavButton || !tutorialMenuButton) {
    console.error("Um ou mais botões de navegação não foram encontrados.");
    return;
  }

  hideAllControls();
  startNavButton.style.display = "block";
  tutorialMenuButton.style.display = "block";
  endNavButton.style.display = "none";

  startNavButton.addEventListener("click", () => {
    if (!isNavigationActive) {
      startNavigation();
      isNavigationActive = true;
      startNavButton.style.display = "none";
      endNavButton.style.display = "block";
      hideRouteSummary();
    }
  });

  endNavButton.addEventListener("click", () => {
    endNavigation();
    isNavigationActive = false;
    startNavButton.style.display = "none";
    endNavButton.style.display = "none";
  });
  console.log("Botão para iniciar navegação exibido.");
}

/**
 * 2. displayStepByStepInstructions - Exibe uma lista rolável de instruções.
 */
function displayStepByStepInstructions(instructions, lang = "pt") {
  const container = document.getElementById("full-instructions-list");
  if (!container) {
    console.error("[displayStepByStepInstructions] #full-instructions-list não encontrado.");
    return;
  }

  container.innerHTML = ""; // Limpa
  if (!instructions || instructions.length === 0) {
    container.innerHTML = `<p>${getGeneralText("noInstructionsAvailable", lang)}</p>`;
    return;
  }

  instructions.forEach((step, idx) => {
    const detailText = getDetailedInstructionText(step, lang);
    const directionIcon = getDirectionIcon(step.maneuverKey);

    const li = document.createElement("li");
    li.innerHTML = `<span class="direction-arrow">${directionIcon}</span> ${detailText}`;
    container.appendChild(li);
  });

  container.classList.remove("hidden");
  console.log(`[displayStepByStepInstructions] Exibidas ${instructions.length} instruções.`);
}

/**
 *3. fetchNextThreeInstructions - Retorna as próximas três instruções.
 */
function fetchNextThreeInstructions(route) {
  return route.instructions.slice(0, 3);
}

/**
 * 4. enqueueInstruction - Adiciona uma nova instrução à fila.
 */
function enqueueInstruction(instruction) {
  const queue = document.getElementById("instruction-queue");
  if (queue) {
    const li = document.createElement("li");
    li.textContent = instruction;
    queue.appendChild(li);
    console.log("Instrução enfileirada:", instruction);
  }
}

/**
 * 5. updateInstructionModal - Atualiza o modal de instruções com a instrução atual.
 */
// Placeholder: se updateInstructionModal não estiver definida, implemente uma versão simples
function updateInstructionModal(instructions, currentIndex, lang) {
  console.log(`Modal atualizado para o passo ${currentIndex}: ${instructions[currentIndex].text}`);
  // Implemente a lógica para atualizar o modal de instruções
}

// Placeholder: se speakInstruction não estiver definida, implemente uma versão simples
function speakInstruction(text, voiceLang = "pt-BR") {
  if (!('speechSynthesis' in window)) {
    console.warn("speechSynthesis não suportado.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLang;
  window.speechSynthesis.speak(utterance);
}

// Placeholder: se highlightNextStepInMap não estiver definida, implemente uma versão simples
function highlightNextStepInMap(step) {
  if (!step || !step.lat || !step.lon) {
    console.warn("Step inválido para destacar.");
    return;
  }
  if (window.nextStepMarker) {
    map.removeLayer(window.nextStepMarker);
  }
  const highlightIcon = L.divIcon({ className: "blinking-arrow" });
  window.nextStepMarker = L.marker([step.lat, step.lon], { icon: highlightIcon }).addTo(map);
  window.nextStepMarker.bindPopup(`Próximo passo: ${step.text}`).openPopup();
}

/**
  --- 14.6. Modais e Animações ---
**
 * 1. toggleModals - Alterna a visibilidade de todos os modais.
 */
function toggleModals() {
  const modals = document.querySelectorAll(".modal");
  modals.forEach(modal => {
    modal.style.display = modal.style.display === "none" ? "block" : "none";
  });
  console.log("Modais alternados.");
}

/**
 * 2. showModal - Exibe um modal específico pelo ID.
 */
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    console.log(`Modal ${modalId} exibido.`);
  } else {
    console.error(`Modal com ID ${modalId} não encontrado.`);
  }
}

/**
 * 3. closeCarouselModal - Fecha o modal do carrossel.
 */
function closeCarouselModal() {
    const carouselModal = document.getElementById('carousel-modal');
    if (carouselModal) {
        carouselModal.style.display = 'none';
    }
}

/**
 * 4. closeAssistantModal - Fecha o modal do assistente.
 */
function closeAssistantModal() {
    const modal = document.getElementById('assistant-modal'); // Seleciona o modal pelo ID
    if (modal) {
        modal.style.display = 'none'; // Define o display como 'none' para ocultar o modal
        console.log('Modal do assistente fechado.'); // Log para depuração
    } else {
        console.error('Modal do assistente não encontrado.'); // Log de erro caso o modal não exista
    }
}

/**
 * 5. animateInstructionChange - Aplica animação na troca de instruções.
 */
function animateInstructionChange() {
  const activeStep = document.querySelector(".instruction-step.active-instruction");
  if (activeStep) {
    activeStep.classList.add("fade-in");
    setTimeout(() => activeStep.classList.remove("fade-in"), 300);
    console.log("Animação de troca de instrução aplicada.");
  }
}

/**
 * 6. updateAssistantModalContent - Atualiza o conteúdo do modal do assistente.
 */
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

/*

===========================================================================
SEÇÃO 15 – CONTROLE DE MENU, BOTÕES & INTERFACE
===========================================================================
  --- 15.1. Controle de Menu & Interface ---
/**
 * 1. toggleNavigationInstructions - Alterna a visibilidade do modal de instruções.
 */
function toggleNavigationInstructions() {
  const modal = document.getElementById("navigation-instructions");
  if (!modal) {
    console.warn("toggleNavigationInstructions: Modal não encontrado.");
    return;
  }
  modal.classList.toggle("hidden");
  const isHidden = modal.classList.contains("hidden");
  showNotification(isHidden ? "Instruções ocultadas." : "Instruções exibidas.", "info");
  console.log("toggleNavigationInstructions: Modal de instruções alternado.");
}

/**
 * 2. toggleRouteSummary - Alterna a exibição do resumo da rota.
 */
function toggleRouteSummary() {
  const summaryEl = document.getElementById("route-summary");
  if (!summaryEl) return;
  if (summaryEl.classList.contains("hidden")) {
    summaryEl.classList.remove("hidden");
    summaryEl.style.display = "block";
    showNotification("Resumo da rota exibido.", "info");
  } else {
    summaryEl.classList.add("hidden");
    summaryEl.style.display = "none";
    showNotification("Resumo da rota ocultado.", "info");
  }
  console.log("toggleRouteSummary: Resumo da rota alternado.");
}

/**
 * 3. toggleMenu - Alterna a exibição do menu lateral.
 */
function toggleMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;
  menu.style.display = menu.style.display === "block" ? "none" : "block";
  console.log("toggleMenu: Menu lateral alternado.");
}

/**
 * 4. hideAllButtons - Oculta todos os botões com a classe .control-btn.
 */
function hideAllButtons() {
  const buttons = document.querySelectorAll(".control-btn");
  buttons.forEach(btn => (btn.style.display = "none"));
  console.log("hideAllButtons: Todos os botões ocultados.");
}

/**
 * 5. hideAllControlButtons - Oculta todos os botões de controle.
 */
function hideAllControlButtons() {
  const controlButtons = document.querySelectorAll(".control-btn");
  controlButtons.forEach(btn => (btn.style.display = "none"));
  console.log("hideAllControlButtons: Botões de controle ocultados.");
}

/**
 * 6. hideAssistantModal - Fecha o modal do assistente.
 */
function hideAssistantModal() {
  const modal = document.getElementById("assistant-modal");
  if (modal) {
    modal.style.display = "none";
    console.log("hideAssistantModal: Modal do assistente fechado.");
  }
}

/**
 * 7. hideControlButtons - Oculta botões de controle específicos.
 */
function hideControlButtons() {
  const ids = ["buy-ticket-btn", "tour-btn", "reserve-restaurants-btn", "reserve-inns-btn", "speak-attendent-btn", "call-btn", "navigation-start"];
  ids.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.style.display = "none";
  });
  console.log("hideControlButtons: Botões específicos ocultados.");
}

/**
 * 8. hideNavigationBar - Oculta a barra de navegação.
 */
function hideNavigationBar() {
  const navBar = document.getElementById("navigation-bar");
  if (navBar) {
    navBar.style.display = "none";
    console.log("hideNavigationBar: Barra de navegação ocultada.");
  }
}

/**
 * 9. hideRouteSummary - Oculta o resumo da rota.
 */
function hideRouteSummary() {
  const summaryContainer = document.getElementById("route-summary");
  const previewContainer = document.getElementById("route-preview");
  if (summaryContainer) {
    summaryContainer.style.display = "none";
    summaryContainer.innerHTML = "";
  }
  if (previewContainer) {
    previewContainer.classList.add("hidden");
    previewContainer.innerHTML = "";
  }
  console.log("hideRouteSummary: Resumo da rota ocultado.");
}

/**
 * 10. closeSideMenu
 *    Fecha o menu lateral #menu e reseta o currentSubMenu (se houver).
 */
function closeSideMenu() {
  const menu = document.getElementById('menu');
  menu.style.display = 'none';
  currentSubMenu = null;
}

/**
  --- 15.2. Controle de Botões ---
/**
 * 1. showControlButtonsTouristSpots - Exibe controles específicos para pontos turísticos.
 */
function showControlButtonsTouristSpots() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para pontos turísticos exibidos.");
}

/**
 * 2. showControlButtonsTour - Exibe controles específicos para tours.
 */
function showControlButtonsTour() {
  hideAllControlButtons();
  closeAssistantModal();
  const tourBtn = document.getElementById("tour-btn");
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (tourBtn) tourBtn.style.display = "flex";
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para tours exibidos.");
}

/**
 * 3. showControlButtonsBeaches - Exibe controles específicos para praias.
 */
function showControlButtonsBeaches() {
  hideAllControlButtons();
  closeAssistantModal();
  const reserveChairsBtn = document.getElementById("reserve-chairs-btn");
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (reserveChairsBtn) reserveChairsBtn.style.display = "none";
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para praias exibidos.");
}

/**
 * 4. showControlButtonsNightlife - Exibe controles específicos para vida noturna.
 */
function showControlButtonsNightlife() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  const buyTicketBtn = document.getElementById("buy-ticket-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  if (buyTicketBtn) buyTicketBtn.style.display = "flex";
  console.log("Controles para vida noturna exibidos.");
}

/**
 * 5. showControlButtonsRestaurants - Exibe controles específicos para restaurantes.
 */
function showControlButtonsRestaurants() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  const reserveRestaurantsBtn = document.getElementById("reserve-restaurants-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  if (reserveRestaurantsBtn) reserveRestaurantsBtn.style.display = "flex";
  console.log("Controles para restaurantes exibidos.");
}

/**
 * 6. showControlButtonsShops - Exibe controles específicos para lojas.
 */
function showControlButtonsShops() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const speakAttendentBtn = document.getElementById("speak-attendent-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (speakAttendentBtn) speakAttendentBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para lojas exibidos.");
}

/**
 * 7. showControlButtonsEmergencies - Exibe controles específicos para emergências.
 */
function showControlButtonsEmergencies() {
  hideAllControlButtons();
  closeAssistantModal();
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const callBtn = document.getElementById("call-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (callBtn) callBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para emergências exibidos.");
}

/**
 * 8. showControlButtonsTips - Exibe controles específicos para dicas.
 */
function showControlButtonsTips() {
  hideAllControlButtons();
  closeAssistantModal();
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (aboutMoreBtn) aboutMoreBtn.style.display = "none";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para dicas exibidos.");
}

/**
 * 9. showControlButtonsInns - Exibe controles específicos para pousadas.
 */
function showControlButtonsInns() {
  hideAllControlButtons();
  closeAssistantModal();
  const reserveInnsBtn = document.getElementById("reserve-inns-btn");
  const createRouteBtn = document.getElementById("create-route-btn");
  const aboutMoreBtn = document.getElementById("about-more-btn");
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (reserveInnsBtn) reserveInnsBtn.style.display = "none";
  if (createRouteBtn) createRouteBtn.style.display = "flex";
  if (aboutMoreBtn) aboutMoreBtn.style.display = "flex";
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para pousadas exibidos.");
}

/**
 * 10. showControlButtonsEducation - Exibe controles específicos para ensino.
 */
function showControlButtonsEducation() {
  hideAllControlButtons();
  closeAssistantModal();
  const tutorialMenuBtn = document.getElementById("tutorial-menu-btn");
  if (tutorialMenuBtn) tutorialMenuBtn.style.display = "flex";
  console.log("Controles para pousadas exibidos.");
}

/**
 * 11. showMenuButtons - Exibe os botões do menu lateral.
 */
function showMenuButtons() {
  const menuButtons = document.querySelectorAll(".menu-btn");
  menuButtons.forEach(btn => btn.classList.remove("hidden"));
  const menuToggle = document.getElementById("menu-btn");
  if (menuToggle) menuToggle.classList.remove("hidden");
  const floatingMenu = document.getElementById("floating-menu");
  if (floatingMenu) floatingMenu.classList.remove("hidden");
  console.log("showMenuButtons: Botões do menu exibidos.");
}

/**
 * 12. showButtons - Exibe um grupo de botões com base em seus IDs.
 */
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

/*

===========================================================================
SEÇÃO 16 – SUBMENUS
===========================================================================
/**
 * 1. handleSubmenuButtonClick - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.
 */
function handleSubmenuButtonClick(lat, lon, name, description, controlButtonsFn) {
    // Atualiza o estado global do destino
    selectedDestination = { lat, lon, name, description };

    // Ajusta o mapa
    adjustMapWithLocation(lat, lon, name);

    // Notificação
    giveVoiceFeedback(`Destino ${name} selecionado com sucesso.`);
}

/**
 * 2. handleSubmenuButtonsTouristSpots - Gerencia submenu de pontos turísticos.
 */
function handleSubmenuButtonsTouristSpots(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTouristSpots);
}

/**
 * 3. handleSubmenuButtonsTours - Gerencia submenu de tours.
 */
function handleSubmenuButtonsTours(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTour);
}

/**
 * 4. handleSubmenuButtonsBeaches - Gerencia submenu de praias.
 */
function handleSubmenuButtonsBeaches(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsBeaches);
}

/**
 * 5. handleSubmenuButtonsRestaurants - Gerencia submenu de restaurantes.
 */
function handleSubmenuButtonsRestaurants(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsRestaurants);
}

/**
 * 6. handleSubmenuButtonsShops - Gerencia submenu de lojas.
 */
function handleSubmenuButtonsShops(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsShops);
}

/**
 * 7. handleSubmenuButtonsEmergencies - Gerencia submenu de emergências.
 */
function handleSubmenuButtonsEmergencies(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsEmergencies);
}

/**
 * 8. handleSubmenuButtonsEducation - Gerencia submenu de educação.
 */
function handleSubmenuButtonsEducation(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsEducation);
}

/**
 * 9. handleSubmenuButtonsInns - Gerencia submenu de pousadas.
 */
function handleSubmenuButtonsInns(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsInns);
}

/**
 * 10. handleSubmenuButtonsTips - Gerencia submenu de dicas.
 */
function handleSubmenuButtonsTips(lat, lon, name, description) {
  handleSubmenuButtonClick(lat, lon, name, description, showControlButtonsTips);
}

// 11. loadSubMenu - Carrega conteúdo do submenu
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

/**
 * 12. handleSubmenuButton - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.
 */

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

/**
 * 13. setupSubmenuClickListeners - Lida com cliques em botões de submenu.
 * Atualiza o destino global e executa uma função de controle.

 */function setupSubmenuClickListeners() {
    document.querySelectorAll('.menu-btn[data-feature]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const feature = btn.getAttribute('data-feature');
            console.log(`Feature selected: ${feature}`);
            handleFeatureSelection(feature);
            closeCarouselModal();
            event.stopPropagation();
        });
    });
}

/**

===========================================================================
SEÇÃO 17 – TRADUÇÃO & INTERNACIONALIZAÇÃO
===========================================================================
/**
 * 1. translateInstruction - Traduz uma instrução usando um dicionário.
 */
function translateInstruction(instruction, lang = "pt") {
  const dictionary = {
    pt: {
      "Turn right": "Vire à direita",
      "Turn left": "Vire à esquerda",
      "Continue straight": "Continue em frente"
    },
    en: {
      "Vire à direita": "Turn right",
      "Vire à esquerda": "Turn left",
      "Continue em frente": "Continue straight"
    }
  };
  if (!dictionary[lang]) return instruction;
  return dictionary[lang][instruction] || instruction;
}

/**
 * 2. translatePageContent - Atualiza todos os textos da interface conforme o idioma.
 */
function translatePageContent(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  let missingCount = 0;
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translation = getGeneralText(key, lang);
    if (translation.startsWith("⚠️")) {
      missingCount++;
      console.warn(`translatePageContent: Tradução ausente para "${key}" em ${lang}.`);
    }
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = translation;
    } else if (el.hasAttribute("title")) {
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
function validateTranslations(lang) {
  const elements = document.querySelectorAll("[data-i18n]");
  const missingKeys = [];
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translation = getGeneralText(key, lang);
    if (translation.startsWith("⚠️")) {
      missingKeys.push(key);
    }
  });
  if (missingKeys.length > 0) {
    console.warn(`validateTranslations: Faltam traduções para ${lang}:`, missingKeys);
  } else {
    console.log(`validateTranslations: Todas as traduções definidas para ${lang}.`);
  }
}

/**
 * 4. applyLanguage - Aplica o idioma na interface e valida as traduções.
 */
function applyLanguage(lang) {
  validateTranslations(lang);
  updateInterfaceLanguage(lang);
  console.log(`applyLanguage: Idioma aplicado: ${lang}`);
}
/**
 * 5. getGeneralText - Retorna o texto traduzido para uma chave e idioma.
 */
function getGeneralText(key, lang = 'pt') {
  if (!translationsData[lang] || !translationsData[lang][key]) {
    console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
    return key; // Se não houver tradução, retorna a própria chave
  }
  return translationsData[lang][key];
}

  const translationsData = {
    pt: {
      // NOVAS CHAVES ADICIONADAS OU AJUSTADAS
      title: "Morro de São Paulo Digital",
      chooseLanguage: "Escolha seu idioma:",
      tourist_spots: "Pontos Turísticos",
      tours: "Passeios",
      beaches: "Praias",
      parties: "Festas",
      restaurants: "Restaurantes",
      inns: "Pousadas",
      shops: "Lojas",
      emergencies: "Emergências",
      cancel_navigation: "Cancelar Navegação",
      start_route: "Iniciar Rota",
      route_summary_title: "Resumo da Rota",
      route_distance: "Distância:",
      route_eta: "Tempo Estimado:",
      instructions_title: "Instruções de Navegação",

      // Chaves já existentes
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
      // Chaves de instruções OSM
      continue_straight: "Siga em frente",
      continue_straight_on: "Siga em frente na",
      turn_left: "Vire à esquerda",
      turn_left_on: "Vire à esquerda na",
      turn_right: "Vire à direita",
      turn_right_on: "Vire à direita na",
      head_north: "Siga para o norte",
      head_north_on: "Siga para o norte na",
      head_south: "Siga para o sul",
      head_south_on: "Siga para o sul na",
      head_east: "Siga para o leste",
      head_east_on: "Siga para o leste na",
      head_west: "Siga para o oeste",
      head_west_on: "Siga para o oeste na",
      head_northeast: "Siga para o nordeste",
      head_northeast_on: "Siga para o nordeste na",
      head_southeast: "Siga para o sudeste",
      head_southeast_on: "Siga para o sudeste na",
      head_southwest: "Siga para o sudoeste",
      head_southwest_on: "Siga para o sudoeste na",
      head_northwest: "Siga para o noroeste",
      head_northwest_on: "Siga para o noroeste na",
      arrive_destination: "Você chegou ao destino final",
      // Outras chaves (mantidas ou adaptadas conforme necessidade)
      unknown: "Instrução desconhecida"
    },

    en: {
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
      navigationStarted_pt: "Navigation started.",
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
      // Chaves para instruções OSM
      continue_straight: "Continue straight",
      continue_straight_on: "Continue straight on",
      turn_left: "Turn left",
      turn_left_on: "Turn left on",
      turn_right: "Turn right",
      turn_right_on: "Turn right on",
      head_north: "Head north",
      head_north_on: "Head north on",
      head_south: "Head south",
      head_south_on: "Head south on",
      head_east: "Head east",
      head_east_on: "Head east on",
      head_west: "Head west",
      head_west_on: "Head west on",
      head_northeast: "Head northeast",
      head_northeast_on: "Head northeast on",
      head_southeast: "Head southeast",
      head_southeast_on: "Head southeast on",
      head_southwest: "Head southwest",
      head_southwest_on: "Head southwest on",
      head_northwest: "Head northwest",
      head_northwest_on: "Head northwest on",
      unknown: "Unknown instruction"
    },

    es: {
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
      // NOVAS CHAVES PARA SUPORTE A INSTRUCCIONES OSM
      // ================================
      // Chaves para instruções OSM
es: {
      continue_straight: "Continúa recto",
      continue_straight_on: "Continúa recto en",
      turn_left: "Gira a la izquierda",
      turn_left_on: "Gira a la izquierda en",
      turn_right: "Gira a la derecha",
      turn_right_on: "Gira a la derecha en",
      head_north: "Dirígete hacia el norte",
      head_north_on: "Dirígete hacia el norte en",
      head_south: "Dirígete hacia el sur",
      head_south_on: "Dirígete hacia el sur en",
      head_east: "Dirígete hacia el este",
      head_east_on: "Dirígete hacia el este en",
      head_west: "Dirígete hacia el oeste",
      head_west_on: "Dirígete hacia el oeste en",
      head_northeast: "Dirígete hacia el noreste",
      head_northeast_on: "Dirígete hacia el noreste en",
      head_southeast: "Dirígete hacia el sureste",
      head_southeast_on: "Dirígete hacia el sureste en",
      head_southwest: "Dirígete hacia el suroeste",
      head_southwest_on: "Dirígete hacia el suroeste en",
      head_northwest: "Dirígete hacia el noroeste",
      head_northwest_on: "Dirígete hacia el noroeste en",
      unknown: "Instrucción desconocida",
    },

    he: {
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
      // Chaves para instruções OSM
      continue_straight: "המשך ישר",
      continue_straight_on: "המשך ישר על",
      turn_left: "פנה שמאלה",
      turn_left_on: "פנה שמאלה על",
      turn_right: "פנה ימינה",
      turn_right_on: "פנה ימינה על",
      head_north: "התחל צפונה",
      head_north_on: "התחל צפונה על",
      head_south: "התחל דרומה",
      head_south_on: "התחל דרומה על",
      head_east: "התחל מזרחה",
      head_east_on: "התחל מזרחה על",
      head_west: "התחל מערבה",
      head_west_on: "התחל מערבה על",
      head_northeast: "התחל צפון-מזרח",
      head_northeast_on: "התחל צפון-מזרח על",
      head_southeast: "התחל דרום-מזרח",
      head_southeast_on: "התחל דרום-מזרח על",
      head_southwest: "התחל דרום-מערב",
      head_southwest_on: "התחל דרום-מערב על",
      head_northwest: "התחל צפון-מערב",
      head_northwest_on: "התחל צפון-מערב על",
      unknown: "הוראה לא ידועה",
    }
    }
  };

/*===========================================================================
SEÇÃO 18 – VOZ & INTERAÇÃO
===========================================================================
  --- 18.1. Reconhecimento e Feedback de Voz ---
/**
 * 1. startVoiceRecognition - Inicia o reconhecimento de voz
 * Define o idioma (selectedLanguage), inicia o SpeechRecognition e
 * chama interpretCommand ao receber resultado.
 */
/**
 * Inicia o reconhecimento de voz para capturar comandos do usuário.
 * Se o navegador não suportar a API, exibe uma notificação de erro.
 */
function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showNotification("Reconhecimento de voz não é suportado neste navegador.", "error");
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  // Define o idioma do reconhecimento com base no idioma selecionado
  if (selectedLanguage === 'en') {
    recognition.lang = 'en-US';
  } else if (selectedLanguage === 'pt') {
    recognition.lang = 'pt-BR';
  } else {
    recognition.lang = selectedLanguage;
  }
  
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  recognition.onresult = function(event) {
    const command = event.results[0][0].transcript.toLowerCase();
    processVoiceCommand(command);
  };
  
  recognition.onerror = function(event) {
    console.error("Erro no reconhecimento de voz:", event.error);
    showNotification("Erro no reconhecimento de voz: " + event.error, "error");
  };
  
  recognition.start();
}

/**
 * Processa o comando de voz reconhecido e executa a ação apropriada.
 * @param {string} command - Comando reconhecido do usuário.
 */
function processVoiceCommand(command) {
  // Exemplos de comandos: "pausar navegação", "retomar navegação", "recalcular rota"
  if (command.includes("pausar")) {
    navigationState.isPaused = true;
    giveVoiceFeedback("Navegação pausada.");
    showNotification("Navegação pausada.", "info");
  } else if (command.includes("retomar") || command.includes("continuar")) {
    navigationState.isPaused = false;
    giveVoiceFeedback("Navegação retomada.");
    showNotification("Navegação retomada.", "info");
  } else if (command.includes("recalcular")) {
    if (userLocation) {
      recalculateRoute(userLocation.latitude, userLocation.longitude, selectedDestination.lat, selectedDestination.lon);
      giveVoiceFeedback("Recalculando a rota.");
    } else {
      giveVoiceFeedback("Localização indisponível para recalcular a rota.");
    }
  } else {
    giveVoiceFeedback("Comando não reconhecido.");
  }
}

/**
 * 2. visualizeVoiceCapture - Efeito visual ao capturar voz (ex.: animação do ícone do microfone).
 */
function visualizeVoiceCapture() {
  const micIcon = document.getElementById("mic-icon");
  if (micIcon) {
    micIcon.classList.add("listening");
    setTimeout(() => {
      micIcon.classList.remove("listening");
    }, 3000);
  }
  console.log("Efeito de captação de voz ativado (visualizeVoiceCapture).");
}

/**
 * 3. interpretCommand - Interpreta o comando de voz reconhecido.
 * Exemplo simples: verifica se contém 'praia', 'restaurante', etc.
 */
function interpretCommand(command) {
  const lowerCmd = command.toLowerCase();
  if (lowerCmd.includes("praia")) {
    handleFeatureSelection("praias");
  } else if (lowerCmd.includes("restaurante")) {
    handleFeatureSelection("restaurantes");
  } else if (lowerCmd.includes("tour")) {
    handleFeatureSelection("passeios");
  } else {
    showNotification("Comando não reconhecido. Tente novamente.", "warning");
  }
  console.log(`interpretCommand: Comando de voz interpretado: "${command}"`);
}

/**
 * 4. confirmCommandFeedback - Feedback textual do comando recebido.
 */
function confirmCommandFeedback(command) {
  showNotification(`Você disse: ${command}`, "info");
  console.log("Feedback do comando de voz:", command);
}

/**
 * 5. confirmAudioCommand - Confirma execução do comando de voz e chama visualizeVoiceCapture.
 */
function confirmAudioCommand() {
  showNotification("Comando recebido. Processando...", "info");
  visualizeVoiceCapture();
  console.log("confirmAudioCommand: Comando de voz confirmado.");
}

/**
  --- 18.2. Integração com POIs e Multimodalidade ---
/**
 * 1. detectPOI - Detecta pontos de interesse próximos e exibe (ex.: via AR).
 */
function detectPOI() {
  // Exemplo: dados estáticos
  const poiList = ["Praia do Encanto", "Restaurante Raízes", "Museu Histórico"];
  displayPOIInAR(poiList);
  console.log("detectPOI: POIs detectados:", poiList);
}

/**
 * 2. validatePOIResults - Valida resultados dos POIs detectados.
 */
function validatePOIResults(poiList) {
  if (!poiList || poiList.length === 0) {
    return ["Nenhum ponto encontrado."];
  }
  return poiList;
}

/**
 * 3. displayPOIInAR - Exibe lista de POIs em AR (Realidade Aumentada).
 * Aqui é apenas um exemplo simples (colocando numa div #ar-container).
 */
function displayPOIInAR(poiList) {
  const arContainer = document.getElementById("ar-container");
  if (!arContainer) {
    console.warn("displayPOIInAR: #ar-container não encontrado.");
    return;
  }
  arContainer.innerHTML = "";
  poiList.forEach(poi => {
    const div = document.createElement("div");
    div.className = "ar-item";
    div.textContent = poi;
    arContainer.appendChild(div);
  });
  console.log("displayPOIInAR: POIs exibidos em AR:", poiList);
}

/**
 * 4. integrateMultimodalRoute - Integra diferentes modais de transporte.
 */
function integrateMultimodalRoute() {
  showNotification("Integrando diferentes rotas e modais...", "info");
  // Chamaria recalculateRoute ou outro fluxo
  console.log("integrateMultimodalRoute: Rota multimodal em implementação...");
}

/**
  --- 18.3. Gerenciamento do Reconhecimento de Voz ---
/**
 * 1. retryVoiceRecognition - Tenta novamente reconhecimento de voz após falha.
 */
function retryVoiceRecognition() {
  showNotification("Tentando reconhecimento de voz novamente...", "info");
  startVoiceRecognition();
  console.log("retryVoiceRecognition: Reiniciando SpeechRecognition.");
}

/**
 * 2. cancelVoiceRecognition - Cancela o reconhecimento de voz atual.
 * (Este exemplo não é detalhado pois a API SpeechRecognition não expõe cancel() direto,
 * mas podemos parar a instância.)
 */
function cancelVoiceRecognition() {
  showNotification("Reconhecimento de voz cancelado.", "info");
  console.log("cancelVoiceRecognition: Reconhecimento de voz interrompido.");
}

/**
  --- 18.4. Síntese de Voz ---
/**
 * 1. giveVoiceFeedback - Converte texto em áudio (exemplo simples).
/**
 * giveVoiceFeedback
 * Converte um texto em áudio usando SpeechSynthesis.
 *
 * @param {string} message - Mensagem a ser falada.
 */
/**
 * Fornece feedback de voz ao usuário utilizando a API SpeechSynthesis.
 * Ajusta dinamicamente os parâmetros (rate, pitch, volume) conforme o contexto.
 * @param {string} text - Texto a ser falado.
 */
function giveVoiceFeedback(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    // Define o idioma com base no idioma selecionado
    if (selectedLanguage === 'en') {
      utterance.lang = 'en-US';
    } else if (selectedLanguage === 'pt') {
      utterance.lang = 'pt-BR';
    } else {
      utterance.lang = selectedLanguage;
    }
    
    // Ajusta dinamicamente os parâmetros com base no conteúdo do texto
    // Exemplo: se a mensagem indicar urgência ou alerta, aumenta a velocidade e o pitch
    if (text.toLowerCase().includes("desvio") || text.toLowerCase().includes("alerta")) {
      utterance.rate = 1.2; 
      utterance.pitch = 1.1;
    } else {
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    }
    utterance.volume = 1.0; // Valor entre 0.0 e 1.0
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("SpeechSynthesis API não suportada neste navegador.");
  }
}



/**
 * 2. speakInstruction - Fala instrução via SpeechSynthesis.
/**
 * speakInstruction
 * Converte o texto da instrução em áudio usando SpeechSynthesis.
 *
 * @param {string} text - Texto da instrução.
 * @param {string} voiceLang - Código da língua para voz (ex.: "pt-BR" ou "en-US").
 */
function speakInstruction(text, voiceLang = "pt-BR") {
  if (!("speechSynthesis" in window)) {
    console.warn("[speakInstruction] API speechSynthesis não suportada.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLang;
  window.speechSynthesis.speak(utterance);
  console.log("[speakInstruction] Instrução falada:", text);
}
/*

===========================================================================
SEÇÃO 19 – OUTRAS FUNÇÕES (Utilitários, Gamificação, Feedback e Ajustes)
===========================================================================
  --- 19.1. Gamificação e Parcerias ---
/**
 * 1. checkNearbyPartners - Verifica se o usuário está próximo de parceiros.
 */
function checkNearbyPartners(userLat, userLon) {
  const distance = calculateDistance(
    userLat,
    userLon,
    TOCA_DO_MORCEGO_COORDS.lat,
    TOCA_DO_MORCEGO_COORDS.lon
  );
  console.log(`checkNearbyPartners: Distância até parceiro: ${distance} metros.`);
  return distance <= PARTNER_CHECKIN_RADIUS;
}

/**
 * 2. handleUserArrivalAtPartner - Lida com a chegada do usuário em um parceiro.
 */
function handleUserArrivalAtPartner(userLat, userLon) {
  if (checkNearbyPartners(userLat, userLon)) {
    showNotification("Você chegou ao parceiro! Ganhou um drink e 10 pontos!", "success");
    awardPointsToUser("Toca do Morcego", 10);
    console.log("handleUserArrivalAtPartner: Parceria concluída.");
  }
}

/**
 * 3. awardPointsToUser - Concede pontos ao usuário e atualiza no localStorage.
 */
function awardPointsToUser(partnerName, points) {
  let currentPoints = parseInt(localStorage.getItem("userPoints") || "0", 10);
  currentPoints += points;
  localStorage.setItem("userPoints", currentPoints);
  showNotification(`Ganhou ${points} ponto(s) em ${partnerName}! Total: ${currentPoints}`, "success");
  console.log("awardPointsToUser: Pontos atualizados:", currentPoints);
}

/**
  --- 19.2. Feedback Tátil e Monitoramento ---
/**
 * 1. triggerHapticFeedback - Gera feedback tátil (vibração) no dispositivo.
 */
function triggerHapticFeedback(type = "short") {
  if (!navigator.vibrate) {
    console.warn("triggerHapticFeedback: Vibração não suportada.");
    return;
  }
  let pattern;
  switch (type) {
    case "long":
      pattern = [300, 100, 300];
      break;
    case "double":
      pattern = [100, 50, 100, 50, 100];
      break;
    default:
      pattern = 100;
  }
  navigator.vibrate(pattern);
  console.log(`triggerHapticFeedback: Vibração tipo "${type}" executada.`);
}

/**
 * 2. monitorUserState - Monitora o estado do usuário (movimento/inatividade).
 */
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

/**
 * 3. trackUserMovement - Rastreia o movimento do usuário e atualiza a navegação.
 */
function trackUserMovement(destLat, destLon, routeInstructions, lang = selectedLanguage) {
    // 1. Se já existir um watcher ativo, não cria outro
    if (navigationWatchId !== null) {
        console.warn("Já existe um watchPosition ativo. Evitando criação duplicada.");
        return;
    }

    // 2. Define a flag de navegação ativa (se você não tiver setado ainda em startNavigation)
    isNavigationActive = true;
    instructions = routeInstructions;   // guarda internamente
    currentStepIndex = 0;              // reinicia índice de instruções, se necessário

    // 3. Cria o watchPosition para acompanhar o usuário
    navigationWatchId = navigator.geolocation.watchPosition(
        (position) => {
            // Checamos se a navegação está pausada
            if (isNavigationPaused) {
                // Se estiver pausada, não atualiza as instruções ou rota
                console.log("Navegação está pausada. Ignorando updates de posição.");
                return;
            }

            // Obtém coords do callback
            const { latitude, longitude } = position.coords;

            // Exemplo: se estiver fora do destino, atualizar lógica
            const distanceToDestination = calculateDistance(latitude, longitude, destLat, destLon);

            // Se chegou no destino (por exemplo, tolerância de 25m)
            if (distanceToDestination <= 25) {
                console.log("Usuário chegou ao destino!");
                showNotification("Você chegou ao seu destino!", "success");

                // Chamamos a finalização de navegação
                endNavigation(); 
                return;
            }

            // Se ainda está longe, podemos atualizar a navegação turn-by-turn
            // Função unificada que verifica desvios, etc.
            updateRealTimeNavigation(
                latitude, 
                longitude, 
                instructions, 
                destLat, 
                destLon,
                lang
            );

            // (opcional) avançar step se atingirmos certa proximidade do step atual
            handleNextInstructionIfClose(latitude, longitude);

        },
        (error) => {
            console.error("Erro no rastreamento de localização:", error);
            showNotification("Erro ao rastrear o usuário.", "error");
        },
        { enableHighAccuracy: true }
    );
}


/**
  --- 19.3. Alternativas e Notificações ---
/**
 * 1. fallbackToSensorNavigation - Ativa fallback se o GPS falhar.
 */
function fallbackToSensorNavigation() {
  console.warn("Fallback para navegação por sensores ativado.");
  // Implemente a lógica de fallback, por exemplo, diminuindo a frequência de atualizações
  // ou mostrando uma mensagem ao usuário.
  showNotification("Navegação por sensores ativada.", "info");
}

function enableEcoMode() {
  console.log("[enableEcoMode] Ativando modo economia...");

  if (window.positionWatcher) {
    navigator.geolocation.clearWatch(window.positionWatcher);
    window.positionWatcher = null;
  }

  window.positionWatcher = navigator.geolocation.watchPosition(
    (pos) => {
      if (navigationState.isPaused) return;
      // Aqui você pode atualizar a navegação em tempo real
      // Exemplo: updateRealTimeNavigation(pos);
    },
    (error) => {
      console.error("[enableEcoMode] watchPosition erro:", error);
      fallbackToSensorNavigation();
    },
    {
      enableHighAccuracy: false,
      maximumAge: 30000,
      timeout: 30000
    }
  );

  document.body.classList.add("eco-mode");
  showNotification("Modo ECO ativado: GPS menos frequente!", "info");
}


/**
 * 2. alertGPSFailure - Exibe alerta em caso de falha de localização.
 */
function alertGPSFailure(error) {
  console.error("alertGPSFailure: Falha no GPS:", error);
  showNotification("Falha no GPS. Tentando usar sensores de movimento...", "warning");
  fallbackToSensorNavigation();
}

/**
 * 3. forceOfflineMode - Ativa modo offline utilizando dados em cache.
 */
function forceOfflineMode() {
  console.warn("forceOfflineMode: Conexão perdida. Ativando modo offline.");
  showNotification("Modo offline ativado. Dados em cache serão utilizados.", "warning");
  loadDestinationsFromCache((data) => {
    console.log("forceOfflineMode: Destinos carregados do cache.", data);
  });
}
/**
  --- 19.4. Marketing & Reservas ---
/**
 * 1. handleReservation - Processa reserva do destino selecionado.
 */
function handleReservation(buttonId, url) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener("click", () => {
      if (selectedDestination && selectedDestination.url) {
        openDestinationWebsite(url);
      } else {
        alert("Por favor, selecione um destino primeiro.");
      }
    });
    console.log(`handleReservation: Listener configurado para o botão ${buttonId}.`);
  }
}

/**
 * 2. showMarketingPopup - Exibe um popup de marketing com mensagem personalizada.
 */
function showMarketingPopup(message) {
  showNotification(message, "info", 8000);
  console.log("showMarketingPopup: Popup de marketing exibido.");
}

/**
  --- 19.6. Utilitários & Helpers ---

/**
 * 1. buildInstructionMessage
 * Monta a mensagem final a partir da instrução bruta.
 */
function buildInstructionMessage(rawInstruction, lang = 'pt') {
  const { maneuverKey, placeName } = mapORSInstruction(rawInstruction);
  // Se há um local, utiliza a chave combinada com preposição
  if (placeName) {
    return getGeneralText(`${maneuverKey}_on`, lang) + " " + placeName;
  } else {
    return getGeneralText(maneuverKey, lang);
  }
}

/**
 * 2. clearRouteMarkers
/**
 * clearRouteMarkers
 * Remove marcadores de origem, destino e quaisquer marcadores relacionados à rota.
 */
function clearRouteMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  console.log("clearRouteMarkers: Todos os marcadores da rota foram removidos.");
}


/**
 * 3. clearElement - Remove todos os filhos de um elemento.
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  console.log("clearElement: Elemento limpo.");
}

/**
 * 4. updateInstructionsOnProgress - Atualiza as instruções conforme o progresso.
 */
function updateInstructionsOnProgress(step) {
  const instructionList = document.getElementById("instruction-list");
  if (instructionList) {
    instructionList.innerHTML = step.instructions.map(inst => `<li>${inst}</li>`).join("");
    console.log("updateInstructionsOnProgress: Instruções atualizadas.", step.instructions);
  }
}

/**
 * 5. updateNavigationControls - Atualiza os controles de navegação (botões).
 */
function updateNavigationControls(isPaused) {
  const startBtn = document.getElementById("start-navigation-button");
  const pauseBtn = document.getElementById("pause-navigation-button");
  const continueBtn = document.getElementById("continue-navigation-button");
  if (!startBtn || !pauseBtn || !continueBtn) {
    console.error("updateNavigationControls: Botões de navegação não encontrados.");
    return;
  }
  if (isPaused) {
    startBtn.style.display = "none";
    pauseBtn.style.display = "none";
    continueBtn.style.display = "block";
  } else {
    startBtn.style.display = "none";
    pauseBtn.style.display = "block";
    continueBtn.style.display = "none";
  }
  console.log(`updateNavigationControls: Navegação ${isPaused ? "pausada" : "ativa"}.`);
}

/**
 * 6. getNavigationText - Gera texto descritivo para uma instrução.
 */
function getNavigationText(instruction) {
  return `${instruction.step}. ${instruction.description}`;
}

/**
 * 7. getSelectedDestination - Retorna o destino selecionado do cache (localStorage).
 */
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

/**
 * 8. getUrlsForLocation - Retorna a URL associada a um local.
 */
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


/**
 * 9. searchLocation
 *    Realiza a busca de um local (via Nominatim) e, em seguida,
 *    obtém POIs correlatos via Overpass-API, usando sinônimos e queries definidas.
 */
function searchLocation() {
    const apiKey = OPENROUTESERVICE_API_KEY; // ou sua const

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
        'pousadas': ['pousadas', 'pousada', 'hotéis', 'hotel', 'hospedagem', 'alojamento', 'hostel', 'residência', 'motel', 'resort', 'abrigo', 'estadia', 'albergue', 'pensão', 'inn', 'guesthouse', 'bed and breakfast', 'bnb', 'pousasa', 'pousda', 'pousdada'],
        'lojas': ['lojas', 'loja', 'comércio', 'shopping', 'mercado', 'boutique', 'armazém', 'supermercado', 'minimercado', 'quiosque', 'feira', 'bazaar', 'loj', 'lojs', 'lojinha', 'lojinhas', 'lojz', 'lojax'],
        'praias': ['praias', 'praia', 'litoral', 'costa', 'faixa de areia', 'beira-mar', 'orla', 'prais', 'praia', 'prai', 'preia', 'preias'],
        'pontos turísticos': ['pontos turísticos', 'turismo', 'atrações', 'sítios', 'marcos históricos', 'monumentos', 'locais históricos', 'museus', 'galerias', 'exposições', 'ponto turístico', 'ponto turístco', 'ponto turisico', 'pontus turisticus', 'pont turistic'],
        'passeios': ['passeios', 'excursões', 'tours', 'visitas', 'caminhadas', 'aventuras', 'trilhas', 'explorações', 'paseios', 'paseio', 'pasceios', 'paseis'],
        'festas': ['festas', 'festa', 'baladas', 'balada', 'vida noturna', 'discotecas', 'clubes noturnos', 'boate', 'clube', 'fest', 'festass', 'baladas', 'balad', 'baldas', 'festinh', 'festona', 'fesat', 'fetsas'],
        'bares': ['bares', 'bar', 'botecos', 'pubs', 'tabernas', 'cervejarias', 'choperias', 'barzinho', 'drinks', 'bares', 'barzinhos', 'baress'],
        'cafés': ['cafés', 'café', 'cafeterias', 'bistrôs', 'casas de chá', 'confeitarias', 'docerias', 'cafe', 'caf', 'cafeta', 'cafett', 'cafetta', 'cafeti'],
        'hospitais': ['hospitais', 'hospital', 'saúde', 'clínicas', 'emergências', 'prontos-socorros', 'postos de saúde', 'centros médicos', 'hspital', 'hopital', 'hospial', 'hspitais', 'hsopitais', 'hospitalar', 'hospitai'],
        'farmácias': ['farmácias', 'farmácia', 'drogarias', 'apotecas', 'lojas de medicamentos', 'farmacia', 'fármacia', 'farmásia', 'farmci', 'farmacias', 'farmac', 'farmaci'],
        'parques': ['parques', 'parque', 'jardins', 'praças', 'áreas verdes', 'reserva natural', 'bosques', 'parques urbanos', 'parqe', 'parq', 'parcs', 'paques', 'park', 'parks', 'parqu'],
        'postos de gasolina': ['postos de gasolina', 'posto de gasolina', 'combustível', 'gasolina', 'abastecimento', 'serviços automotivos', 'postos de combustível', 'posto de combustivel', 'pstos de gasolina', 'post de gasolina', 'pstos', 'pstos de combustivel', 'pstos de gas'],
        'banheiros públicos': ['banheiros públicos', 'banheiro público', 'toaletes', 'sanitários', 'banheiros', 'WC', 'lavabos', 'toilets', 'banheiro publico', 'banhero público', 'banhero publico', 'banhero', 'banheir'],
        'caixas eletrônicos': ['caixas eletrônicos', 'caixa eletrônico', 'atm', 'banco', 'caixa', 'terminal bancário', 'caixa automático', 'saque', 'caixa eletronico', 'caxas eletronicas', 'caxa eletronica', 'caxas', 'caias eletronico', 'caias'],
        'emergências': ['emergências', 'emergência', 'polícia', 'hospital', 'serviços de emergência', 'socorro', 'urgências', 'emergencia', 'emergencia', 'emrgencia', 'emrgencias'],
        'dicas': ['dicas', 'dica', 'conselhos', 'sugestões', 'recomendações', 'dics', 'dcias', 'dicaz', 'dicaa', 'dicassa'],
        'sobre': ['sobre', 'informações', 'detalhes', 'a respeito', 'informação', 'sbre', 'sore', 'sob', 'sobr', 'sobe'],
        'educação': ['educação', 'educacao', 'escolas', 'faculdades', 'universidades', 'instituições de ensino', 'cursos', 'aulas', 'treinamentos', 'aprendizagem', 'educaçao', 'educacão', 'eduacão', 'eduacao', 'educaç', 'educça']
    };

    const searchQuery = prompt("Digite o local que deseja buscar em Morro de São Paulo:");
    if (searchQuery) {
        const viewBox = '-38.926, -13.369, -38.895, -13.392';
        let nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewBox}&bounded=1&key=${apiKey}`;

        fetch(nominatimUrl)
            .then(response => response.json())
            .then(data => {
                console.log("Data from Nominatim:", data);
                if (data && data.length > 0) {
                    // Filtra resultados apenas dentro do retângulo
                    const filteredData = data.filter(location => {
                        const lat = parseFloat(location.lat);
                        const lon = parseFloat(location.lon);
                        return lon >= -38.926 && lon <= -38.895 && lat >= -13.392 && lat <= -13.369;
                    });

                    console.log("Filtered data:", filteredData);

                    if (filteredData.length > 0) {
                        const firstResult = filteredData[0];
                        const lat = firstResult.lat;
                        const lon = firstResult.lon;

                        // Remove o marcador atual, se existir
                        if (currentMarker) {
                            map.removeLayer(currentMarker);
                        }

                        // Remove todos os marcadores antigos
                        markers.forEach(marker => map.removeLayer(marker));
                        markers = [];

                        // Adiciona um novo marcador para o resultado da pesquisa
                        currentMarker = L.marker([lat, lon])
                            .addTo(map)
                            .bindPopup(firstResult.display_name)
                            .openPopup();

                        map.setView([lat, lon], 14);

                        // Verifica se a busca corresponde a alguma categoria
                        let queryKey = null;
                        const lowerQuery = searchQuery.toLowerCase();
                        for (const [key, value] of Object.entries(synonyms)) {
                            if (value.includes(lowerQuery)) {
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
                                            const description =
                                                element.tags.description ||
                                                element.tags.amenity ||
                                                element.tags.tourism ||
                                                element.tags.natural ||
                                                '';
                                            const marker = L.marker([element.lat, element.lon]).addTo(map)
                                                .bindPopup(`<b>${name}</b><br>${description}`)
                                                .openPopup();
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

/**
 * 10. performControlAction
 *    Executa ações específicas de controle, conforme 'action' recebido.
 */
function performControlAction(action) {
    switch (action) {
        case 'next':
            nextTutorialStep(currentStep);
            break;
        case 'previous':
            previousTutorialStep(currentStep);
            break;
        case 'finish':
            endTutorial();
            break;
        case 'start-tutorial':
            initializeTutorial();
            break;
        case 'menu-toggle':
            const floatingMenu = document.getElementById('floating-menu');
            floatingMenu.classList.toggle('hidden');
            break;
        case 'pontos-turisticos':
            storeAndProceed('pontos-turisticos');
            break;
        case 'passeios':
            storeAndProceed('passeios');
            break;
        case 'praias':
            storeAndProceed('praias');
            break;
        case 'festas':
            storeAndProceed('festas');
            break;
        case 'restaurantes':
            storeAndProceed('restaurantes');
            break;
        case 'pousadas':
            storeAndProceed('pousadas');
            break;
        case 'lojas':
            storeAndProceed('lojas');
            break;
        case 'emergencias':
            storeAndProceed('emergencias');
            break;
        case 'reserve-chairs':
            alert('Reserva de cadeiras iniciada.');
            break;
        case 'buy-ticket':
            alert('Compra de ingresso iniciada.');
            break;
        case 'create-route':
            startRouteCreation();
            break;
        case 'access-site':
            accessSite(); 
            break;
        case 'tutorial-send':
            nextTutorialStep();
            break;
        case 'tutorial-menu':
            showTutorialStep('ask-interest');
            break;
        case 'start-navigation-button':
            startNavigation();
            break;
        case 'navigation-end':
            endNavigation();
            break;
        default:
            console.error(`Ação não reconhecida: ${action}`);
    }
}

/**
 * 11. openDestinationWebsite
 *    Abre a URL de um destino em nova aba.
 */
function openDestinationWebsite(url) {
    window.open(url, '_blank');
}

/**
 * 12. getImagesForLocation
 *    Retorna um array de URLs de imagens para um local (nome => lista de strings).
 */
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

/**
 * 13. getDirectionIcon
 *    Retorna o ícone (emoji) apropriado para uma manobra de navegação,
 *    ex.: turn_left => "⬅️".
 */
function getDirectionIcon(maneuverKey) {
  const iconMap = {
    head_north: "⬆️",
    head_south: "⬇️",
    head_east:  "➡️",
    head_west:  "⬅️",
    turn_left:  "⬅️",
    turn_right: "➡️",
    turn_sharp_left: "↰",
    turn_sharp_right: "↱",
    turn_slight_left: "↲",
    turn_slight_right: "↳",
    continue_straight: "⬆️",
    keep_left: "↰",
    keep_right:"↱",
    u_turn: "↩️",
    enter_roundabout: "🔄",
    exit_roundabout: "🔄",
    ferry: "⛴️",
    arrive_destination: "✅"
  };

  // Se a chave começar com "exit_roundabout_" adiciona número
  if (maneuverKey.startsWith("exit_roundabout_")) {
    const exitNum = maneuverKey.replace("exit_roundabout_", "");
    return `🔄${exitNum}`;
  }
  if (iconMap[maneuverKey]) {
    return iconMap[maneuverKey];
  }
  console.warn(`[getDirectionIcon] Manobra não reconhecida: "${maneuverKey}".`);
  return "⬆️"; // Retorna ícone padrão
}


/**
 * 14. handleFeatureSelection
 *    Gerencia seleção de funcionalidades (ex.: praias, pontos turísticos).
 */
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

/**
 * 15. startCarousel - Inicia o carrossel de imagens para um local.
 */
function startCarousel(locationName) {
  const images = getImagesForLocation(locationName);
  if (!images || images.length === 0) {
    alert("Nenhuma imagem disponível para o carrossel.");
    return;
  }
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  swiperWrapper.innerHTML = "";
  images.forEach(src => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.innerHTML = `<img src="${src}" alt="${locationName}" style="width: 100%; height: 100%;">`;
    swiperWrapper.appendChild(slide);
  });
  showModal("carousel-modal");
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
  }
  swiperInstance = new Swiper(".swiper-container", {
    slidesPerView: 1,
    spaceBetween: 10,
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: false
    }
  });
  console.log("startCarousel: Carrossel iniciado para", locationName);
}

/**
 * 16. toggleDarkMode - Alterna o modo escuro.
 */
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  map.getContainer().classList.toggle("dark-map");
  showNotification("Modo escuro alternado.", "info");
  console.log("toggleDarkMode: Alternância de modo escuro executada.");
}

/**
 * 17. fetchOSMData - Busca dados do OSM utilizando a Overpass API.
 */
async function fetchOSMData(query) {
  try {
    // Monta URL para Overpass
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    console.log("[fetchOSMData] Iniciando busca no Overpass-API:", overpassUrl);

    // Faz a requisição
    const response = await fetch(overpassUrl);
    if (!response.ok) {
      console.error("[fetchOSMData] HTTP Erro Overpass:", response.status, response.statusText);
      showNotification("Erro ao buscar dados OSM. Verifique sua conexão.", "error");
      return null;
    }

    // Tenta parsear JSON
    const data = await response.json();
    if (!data.elements || data.elements.length === 0) {
      console.warn("[fetchOSMData] Nenhum dado encontrado (elements vazio).");
      showNotification("Nenhum dado OSM encontrado para esta busca.", "info");
      return null;
    }

    console.log(`[fetchOSMData] Retornados ${data.elements.length} elementos do OSM.`);
    return data;
  } catch (error) {
    console.error("[fetchOSMData] Erro geral ao buscar dados do OSM:", error);
    showNotification("Ocorreu um erro ao buscar dados no OSM (Overpass).", "error");
    return null;
  }
}

/**
  --- 19.7. Assistência Contínua & Destaques ---
/**
 * 1. provideContinuousAssistance - Oferece assistência contínua ao usuário.
 */
function provideContinuousAssistance() {
  setInterval(() => {
    updateNavigationInstructions();
    monitorUserState();
  }, 10000);
  console.log("provideContinuousAssistance: Assistência contínua ativada.");
}

/**
 * 2. removeFloatingMenuHighlights - Remove destaques do menu flutuante.
 */
function removeFloatingMenuHighlights() {
  document.querySelectorAll(".floating-menu .highlight").forEach(el => el.classList.remove("highlight"));
  console.log("removeFloatingMenuHighlights: Destaques removidos.");
}

/**
  --- 19.8. Finalização, Limpeza & Ajustes ---
/**
 * 1. toggleNavigationInstructions - Alterna a exibição das instruções de navegação.
 */
function toggleNavigationInstructions() {
  const modal = document.getElementById("navigation-instructions");
  if (!modal) {
    console.warn("toggleNavigationInstructions: Modal de instruções não encontrado.");
    return;
  }
  modal.classList.toggle("hidden");
  const isHidden = modal.classList.contains("hidden");
  showNotification(isHidden ? "Instruções ocultadas." : "Instruções exibidas.", "info");
  console.log("toggleNavigationInstructions: Instruções alternadas.");
}

/**
 * 2. toggleRouteSummary - Alterna a visibilidade do resumo da rota.
 */
function toggleRouteSummary() {
  const summary = document.getElementById("route-summary");
  if (!summary) return;
  if (summary.classList.contains("hidden")) {
    summary.classList.remove("hidden");
    summary.style.display = "block";
    showNotification("Resumo da rota exibido.", "info");
  } else {
    summary.classList.add("hidden");
    summary.style.display = "none";
    showNotification("Resumo da rota ocultado.", "info");
  }
  console.log("toggleRouteSummary: Resumo da rota alternado.");
}

/**
 * 3. updateNavigationProgress - Atualiza a barra de progresso da navegação.
 */
function updateNavigationProgress(progress) {
  const bar = document.getElementById("navigationProgressBar");
  if (bar) {
    bar.style.width = `${progress}%`;
    console.log("updateNavigationProgress: Progresso atualizado para", progress, "%");
  }
}

/**
 * 4. updateProgressBar - Atualiza uma barra de progresso genérica.
 */
function updateProgressBar(selector, progress) {
  const bar = document.querySelector(selector);
  if (bar) {
    bar.style.width = `${progress}%`;
    console.log("updateProgressBar: Barra atualizada.");
  }
}

/**

===========================================================================
/**
 * showNotification
 * Exibe uma notificação para o usuário.
 *
/**
 * Exibe uma notificação acessível para o usuário.
 * @param {string} message - Mensagem a ser exibida.
 * @param {string} type - Tipo de notificação (ex.: "success", "error", "warning", "info").
 */
/**
 * Exibe uma notificação acessível para o usuário.
 * @param {string} message - Mensagem a ser exibida.
 * @param {string} type - Tipo de notificação (ex.: "success", "error", "warning", "info").
 */
function showNotification(message, type) {
  // Seleciona o container de notificações (certifique-se de que exista no HTML)
  const notificationContainer = document.getElementById("notification-container");
  if (!notificationContainer) return;

  // Cria um novo elemento de notificação
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "assertive");
  notification.textContent = message;

  // Adiciona a notificação ao container
  notificationContainer.appendChild(notification);

  // Remove a notificação após 5 segundos (com transição suave)
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      if (notification.parentNode === notificationContainer) {
        notificationContainer.removeChild(notification);
      }
    }, 500);
  }, 5000);
}


// Função para abrir o modal e direcionar o foco para ele
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    modal.focus(); // Garante que o foco vá para o modal
  }
}

// Função para fechar o modal e retornar o foco para um elemento específico, se necessário
function closeModal(modalId, returnFocusElementId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    if (returnFocusElementId) {
      document.getElementById(returnFocusElementId).focus();
    }
  }
}

// Exemplo de evento para fechar o modal com a tecla ESC
document.addEventListener('keydown', function(event) {
  const modal = document.querySelector('.modal[style*="display: block"]');
  if (modal && event.key === 'Escape') {
    modal.style.display = "none";
  }
});
