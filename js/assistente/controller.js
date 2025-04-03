/**
 * Assistente Virtual - Camada de Controlador
 * Gerencia a lógica de processamento e comunicação entre modelo e visualização
 */

import { showNotification } from '../ui/notifications.js';
import { selectedLanguage } from '../core/config.js';

/**
 * Inicializa o controlador do assistente
 * @param {Object} model - Modelo do assistente
 * @param {Object} view - Visualização do assistente
 * @returns {Object} - API do controlador
 */
export function initializeAssistantController(model, view) {
  console.log('🧠 Inicializando controlador do assistente...');

  // Configurar event listeners da visualização
  view.setupEventListeners({
    handleAssistantOpened,
    processUserMessage,
    startVoiceRecognition,
  });

  /**
   * Processa a mensagem enviada pelo usuário
   * @param {string} message - Mensagem do usuário
   * @returns {boolean} - Indica se processamento foi bem-sucedido
   */
  function processUserMessage(message) {
    if (!message || typeof message !== 'string') {
      console.warn('⚠️ Mensagem inválida');
      return false;
    }

    try {
      console.log('📨 Processando mensagem do usuário:', message);

      // Adicionar mensagem ao modelo e ao DOM
      const userMessage = model.addMessage(message, 'user');
      view.addMessageToDOM(message, 'user', { id: userMessage.id });

      // Mostrar indicador de digitação
      view.showTypingIndicator();

      // Processar a mensagem (simulação de delay de processamento)
      setTimeout(
        () => {
          // Ocultar indicador
          view.hideTypingIndicator();

          // Gerar resposta
          const response = generateResponse(message);

          // Adicionar resposta ao modelo e ao DOM
          const assistantMessage = model.addMessage(
            response.text,
            'assistant',
            response.metadata
          );
          view.addMessageToDOM(response.text, 'assistant', {
            id: assistantMessage.id,
            actions: response.actions,
          });
        },
        800 + Math.random() * 800
      ); // Delay entre 800ms e 1600ms

      return true;
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      view.hideTypingIndicator();
      showNotification('Erro ao processar sua mensagem', 'error');
      return false;
    }
  }

  /**
   * Gera resposta para mensagem do usuário
   * @param {string} message - Mensagem do usuário
   * @returns {Object} - Resposta gerada
   */
  function generateResponse(message) {
    // Normalizar mensagem para comparação
    const normalizedMessage = message.toLowerCase().trim();

    // Verificar palavras-chave e contexto
    const state = model.getState();
    const context = state.context;

    // Objeto base de resposta
    let response = {
      text: '',
      metadata: { contextId: context.currentContext || 'general' },
      actions: [],
    };

    // Resposta baseada em palavras-chave
    if (
      normalizedMessage.includes('praia') ||
      normalizedMessage.includes('beach')
    ) {
      response.text =
        'Morro de São Paulo tem 5 praias principais, numeradas de 1 a 5. A Segunda Praia é a mais movimentada com bares e restaurantes. A Quarta Praia é mais tranquila e ótima para relaxar.';
      response.metadata.contextId = 'beaches';
      response.actions = [
        {
          text: 'Ver Segunda Praia',
          handler: () => showLocationOnMap('segunda-praia'),
        },
        {
          text: 'Ver Quarta Praia',
          handler: () => showLocationOnMap('quarta-praia'),
        },
      ];
    } else if (
      normalizedMessage.includes('restaurante') ||
      normalizedMessage.includes('comer') ||
      normalizedMessage.includes('restaurant')
    ) {
      response.text =
        'Você encontrará ótimos restaurantes na Segunda Praia e no centro da vila. A culinária local tem foco em frutos do mar frescos.';
      response.metadata.contextId = 'restaurants';
      response.actions = [
        {
          text: 'Ver restaurantes',
          handler: () => showLocationOnMap('restaurants'),
        },
      ];
    } else if (
      normalizedMessage.includes('hotel') ||
      normalizedMessage.includes('pousada') ||
      normalizedMessage.includes('hosped') ||
      normalizedMessage.includes('stay')
    ) {
      response.text =
        'Morro de São Paulo oferece opções de hospedagem para todos os orçamentos, desde hostels até pousadas de luxo. A maioria fica na Segunda e Terceira Praias.';
      response.metadata.contextId = 'accommodation';
      response.actions = [
        {
          text: 'Ver hospedagens',
          handler: () => showLocationOnMap('hotels'),
        },
      ];
    } else if (
      normalizedMessage.includes('transporte') ||
      normalizedMessage.includes('chegar') ||
      normalizedMessage.includes('get to')
    ) {
      response.text =
        'Para chegar a Morro de São Paulo, você pode pegar um catamarã saindo de Salvador (2h) ou vir de carro até Valença e depois de barco (45min). Não há carros na ilha, exceto veículos de serviço.';
      response.metadata.contextId = 'transportation';
    } else if (
      normalizedMessage.includes('mapa') ||
      normalizedMessage.includes('map') ||
      normalizedMessage.includes('onde') ||
      normalizedMessage.includes('localiz')
    ) {
      response.text =
        'Você pode navegar pelo mapa para explorar Morro de São Paulo. Use os filtros no menu para encontrar pontos específicos.';
      response.metadata.contextId = 'navigation';
      response.actions = [
        {
          text: 'Ver pontos turísticos',
          handler: () => showLocationOnMap('attractions'),
        },
      ];
    } else if (
      normalizedMessage.includes('obrigad') ||
      normalizedMessage.includes('thank')
    ) {
      response.text =
        'Por nada! Estou aqui para ajudar. Há mais alguma coisa que você gostaria de saber?';
      response.metadata.contextId = 'gratitude';
    } else if (
      normalizedMessage.includes('olá') ||
      normalizedMessage.includes('oi') ||
      normalizedMessage.includes('hello') ||
      normalizedMessage.includes('hi')
    ) {
      response.text =
        'Olá! Como posso ajudar você a explorar Morro de São Paulo hoje?';
      response.metadata.contextId = 'greeting';
    } else {
      // Resposta genérica
      response.text =
        'Posso ajudar com informações sobre praias, restaurantes, hospedagem e atrações em Morro de São Paulo. O que você gostaria de saber?';
      response.actions = [
        {
          text: 'Praias',
          handler: () => processUserMessage('Fale sobre as praias'),
        },
        {
          text: 'Onde comer',
          handler: () =>
            processUserMessage('Quais são os melhores restaurantes?'),
        },
        {
          text: 'Atrações',
          handler: () =>
            processUserMessage('O que fazer em Morro de São Paulo?'),
        },
      ];
    }

    return response;
  }

  /**
   * Mostra localização no mapa
   * @param {string} locationKey - Chave da localização
   */
  function showLocationOnMap(locationKey) {
    try {
      const { map } = model.getState();

      if (!map) {
        console.warn('⚠️ Mapa não disponível');
        showNotification('Mapa não disponível', 'warning');
        return false;
      }

      console.log('🗺️ Mostrando localização no mapa:', locationKey);

      // Coordenadas simuladas para demonstração
      const locations = {
        'segunda-praia': [-13.3837, -38.9129],
        'quarta-praia': [-13.3937, -38.9029],
        restaurants: [-13.3837, -38.9129],
        hotels: [-13.3867, -38.9109],
        attractions: [-13.3847, -38.9119],
      };

      const coordinates = locations[locationKey];

      if (coordinates) {
        // Centralizar mapa
        map.setView(coordinates, 16);

        // Criar marcador temporário
        const marker = L.marker(coordinates).addTo(map);
        marker.bindPopup(`<b>${locationKey}</b>`).openPopup();

        // Remover marcador após 10 segundos
        setTimeout(() => map.removeLayer(marker), 10000);

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao mostrar localização no mapa:', error);
      return false;
    }
  }

  /**
   * Inicia reconhecimento de voz
   * @returns {boolean} - Indica se inicialização foi bem-sucedida
   */
  function startVoiceRecognition() {
    try {
      console.log('🎤 Iniciando reconhecimento de voz...');

      // Verificar suporte do navegador
      if (
        !('webkitSpeechRecognition' in window) &&
        !('SpeechRecognition' in window)
      ) {
        console.warn('⚠️ Reconhecimento de voz não suportado neste navegador');
        showNotification(
          'Reconhecimento de voz não suportado neste navegador',
          'warning'
        );
        return false;
      }

      // Usar API de reconhecimento de voz
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configurar
      recognition.lang = selectedLanguage === 'pt' ? 'pt-BR' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      // Mostrar indicador de escuta
      view.showListeningIndicator();

      // Event handlers
      recognition.onstart = () => {
        console.log('🎤 Reconhecimento de voz iniciado');
        model.updateState({ isListening: true });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Texto reconhecido:', transcript);

        // Ocultar indicador
        view.hideListeningIndicator();

        // Processar mensagem
        processUserMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error('❌ Erro no reconhecimento de voz:', event.error);
        view.hideListeningIndicator();
        showNotification('Erro no reconhecimento de voz', 'error');
      };

      recognition.onend = () => {
        console.log('🎤 Reconhecimento de voz finalizado');
        view.hideListeningIndicator();
        model.updateState({ isListening: false });
      };

      // Iniciar reconhecimento
      recognition.start();

      return true;
    } catch (error) {
      console.error('❌ Erro ao iniciar reconhecimento de voz:', error);
      view.hideListeningIndicator();
      showNotification('Erro ao iniciar reconhecimento de voz', 'error');
      return false;
    }
  }

  /**
   * Manipula evento de abertura do assistente
   */
  function handleAssistantOpened() {
    console.log('👁️ Assistente aberto pelo usuário');

    const state = model.getState();

    // Se não houver histórico ou for a primeira interação, mostrar boas-vindas
    if (!state.hasGreeted || state.history.length === 0) {
      // Obter mensagem de boas-vindas
      const welcomeMessage = model.getAssistantMessage('greeting');
      const helpMessage = model.getAssistantMessage('help');

      // Adicionar mensagem ao modelo e ao DOM
      setTimeout(() => {
        const message1 = model.addMessage(welcomeMessage, 'assistant');
        view.addMessageToDOM(welcomeMessage, 'assistant', { id: message1.id });

        // Adicionar mensagem de ajuda após um pequeno delay
        setTimeout(() => {
          const message2 = model.addMessage(helpMessage, 'assistant');
          view.addMessageToDOM(helpMessage, 'assistant', {
            id: message2.id,
            actions: [
              {
                text: 'Praias',
                handler: () => processUserMessage('Fale sobre as praias'),
              },
              {
                text: 'Restaurantes',
                handler: () => processUserMessage('Quais são os restaurantes?'),
              },
              {
                text: 'Atrações',
                handler: () => processUserMessage('O que fazer aqui?'),
              },
            ],
          });
        }, 500);
      }, 300);

      // Atualizar estado
      model.updateState({ hasGreeted: true });
    }
  }

  // Retornar API do controlador
  return {
    processUserMessage,
    startVoiceRecognition,
    handleAssistantOpened,
    showLocationOnMap,
  };
}
