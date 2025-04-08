/**
 * Módulo de mensagens do assistente virtual
 * Responsável por exibir e processar mensagens da conversa
 */

// Importações necessárias
import { showLocationOnMap } from '../../integration/integration.js';
// Corrigir o caminho de importação do getAssistantText
import { getAssistantText } from '../../language/translations.js';

// Variável global para armazenar a instância
let conversationFlowInstance = null;

/**
 * Formata links em texto para HTML clicável
 * @param {string|Object} message - Mensagem a ser formatada
 * @returns {string} - Texto formatado com links HTML
 */
function formatLinks(message) {
  // Se a mensagem for um objeto (resposta com ação)
  if (typeof message === 'object' && message.text) {
    return message.text;
  }

  // Se for apenas texto
  const text = String(message);
  // Regex para identificar URLs no texto
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
}

/**
 * Configura a instância do conversationFlow
 * @param {Object} instance - Instância do ConversationFlow
 */
export function setConversationFlow(instance) {
  conversationFlowInstance = instance;
}

/**
 * Mostra a mensagem de boas-vindas
 */
export function showWelcomeMessage() {
  console.log('Exibindo mensagem de boas-vindas do assistente...');

  // Verificação única e confiável se a mensagem já foi mostrada
  // Usar estado do assistente como fonte única de verdade
  if (assistantStateManager.hasShownWelcome()) {
    console.log('Mensagem de boas-vindas já exibida anteriormente, ignorando.');
    return false;
  }

  // Verificar se o container existe
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) {
    console.error('Container de mensagens não encontrado');
    return false;
  }

  // Limpar mensagens existentes para garantir que não haja duplicatas
  messagesContainer.innerHTML = '';

  // Mostrar indicador de digitação
  showTypingIndicator();

  // Obter idioma atual - PRIORIZAR o estado do assistente
  const currentLanguage =
    assistantStateManager.get('selectedLanguage') ||
    localStorage.getItem('preferredLanguage') ||
    'pt';

  console.log(`Exibindo boas-vindas no idioma: ${currentLanguage}`);

  try {
    // Obter texto de boas-vindas
    const welcomeText = getAssistantText('welcome', currentLanguage);

    // Exibir mensagem após delay
    setTimeout(() => {
      removeTypingIndicator();

      // Verificar novamente se o container ainda existe
      const container = document.getElementById('assistant-messages');
      if (!container) return;

      // Adicionar mensagem à UI
      addMessageToUI(welcomeText, 'assistant');

      // IMPORTANTE: Marcar a mensagem como mostrada DEPOIS de exibi-la
      assistantStateManager.markWelcomeAsShown();
      window.welcomeMessageShown = true;

      // Tentar falar a mensagem
      if (
        window.assistantApi &&
        typeof window.assistantApi.speak === 'function'
      ) {
        window.assistantApi.speak(welcomeText);
      }
    }, 1500);

    return true;
  } catch (error) {
    console.error('Erro ao processar mensagem de boas-vindas:', error);

    // Recuperação em caso de erro - mostrar mensagem padrão
    removeTypingIndicator();
    const fallbackMessage =
      currentLanguage === 'en'
        ? "Hello! I'm your virtual assistant!"
        : 'Olá! Eu sou seu assistente virtual!';

    addMessageToUI(fallbackMessage, 'assistant');

    // Marcar mensagem como exibida mesmo no caso de erro
    assistantStateManager.markWelcomeAsShown();
    window.welcomeMessageShown = true;

    return false;
  }
}

/**
 * Processa a mensagem do usuário e gera resposta
 * @param {string} text - Texto da mensagem
 */
function processUserMessage(text) {
  // Importar módulos necessários
  import('../nlp/entityExtractor.js').then((nlpModule) => {
    const { extractEntities, detectIntent } = nlpModule;

    // Obter idioma atual
    const currentLanguage =
      assistantStateManager.get('selectedLanguage') || 'pt';

    // Extrair entidades e detectar intenção
    const entities = extractEntities(text, currentLanguage);
    const intent = detectIntent(text, currentLanguage);

    // Armazenar mensagem no histórico
    const conversations = assistantStateManager.get('conversations') || [];
    conversations.push({
      text,
      sender: 'user',
      timestamp: Date.now(),
      entities,
      intent,
    });

    // Limitar tamanho do histórico
    if (conversations.length > 10) {
      conversations.shift();
    }

    assistantStateManager.set('conversations', conversations);

    // Mostrar indicador de digitação
    showTypingIndicator();

    // Calcular tempo de resposta contextual
    const responseTime = determineResponseTime(text, intent);

    // Gerar resposta baseada na intenção e entidades
    setTimeout(() => {
      removeTypingIndicator();

      // Verificar se há contexto ativo
      const currentContext = assistantStateManager.get('currentContext');
      let response;

      if (currentContext !== 'general') {
        // Processar com base no contexto atual
        response = processContextualMessage(
          text,
          currentContext,
          currentLanguage
        );
      } else {
        // Processar com base na intenção detectada
        response = processIntentMessage(
          text,
          intent,
          entities,
          currentLanguage
        );
      }

      // Adicionar resposta à interface
      addMessageToUI(response, 'assistant');

      // Armazenar resposta no histórico
      conversations.push({
        text: typeof response === 'object' ? response.text : response,
        sender: 'assistant',
        timestamp: Date.now(),
        intent: intent,
      });
      assistantStateManager.set('conversations', conversations);

      // Mostrar botões de sugestão contextual se aplicável
      showSuggestionsByIntent(intent, entities, currentLanguage);
    }, responseTime);
  });
}

// Nova função para determinar o tempo de resposta
function determineResponseTime(text, intent) {
  // Responder mais rapidamente a saudações e agradecimentos
  if (intent === 'greeting' || intent === 'thanks' || intent === 'farewell') {
    return 800;
  }

  // Respostas mais lentas para perguntas complexas
  if (intent === 'location_info' || intent === 'general_question') {
    return Math.min(1500 + text.length * 20, 3000);
  }

  // Tempo padrão
  return Math.min(1200 + text.length * 15, 2500);
}

// Nova função para processar mensagens baseadas em intenção
function processIntentMessage(text, intent, entities, language) {
  switch (intent) {
    case 'greeting':
      return getAssistantText('greeting_response', language);

    case 'farewell':
      return (
        getAssistantText('farewell_response', language) ||
        'Até logo! Estou aqui se precisar de mais informações sobre Morro de São Paulo!'
      );

    case 'thanks':
      return getAssistantText('thanks_response', language);

    case 'location_info':
      if (entities.locations.length > 0) {
        const location = entities.locations[0];
        return processLocationInfo(location, language);
      }
      break;

    case 'food_info':
      // Definir contexto para alimentação
      assistantStateManager.set('currentContext', 'food');
      return getAssistantText('food_options', language);

    case 'accommodation_info':
      // Definir contexto para hospedagem
      assistantStateManager.set('currentContext', 'accommodation');
      return (
        getAssistantText('accommodation_options', language) ||
        'Morro de São Paulo tem opções de hospedagem para todos os gostos e bolsos. Você procura algo mais econômico, confortável ou luxuoso?'
      );

    case 'activity_info':
      // Definir contexto para atividades
      assistantStateManager.set('currentContext', 'activities');
      return (
        getAssistantText('activity_options', language) ||
        'Há muitas atividades em Morro de São Paulo! Você pode fazer passeios de barco, mergulho, caminhadas, ou apenas relaxar nas praias. O que você prefere?'
      );

    case 'weather_info':
      return getAssistantText('weather_response', language);

    case 'help':
      return (
        getAssistantText('help_response', language) ||
        'Posso ajudar com informações sobre praias, restaurantes, hospedagem, passeios, clima e muito mais em Morro de São Paulo. O que você gostaria de saber?'
      );

    case 'start_navigation':
      startNavigation();
      return 'Iniciando navegação para o destino selecionado.';

    case 'general_question':
    case 'general_chat':
    default:
      return getSimpleResponse(text, language);
  }
}

// Nova função para processar informações de locais
function processLocationInfo(location, language) {
  const locationMap = {
    'primeira praia': {
      text:
        getAssistantText('first_beach_info', language) ||
        'A Primeira Praia é a mais próxima do centro histórico, com águas agitadas, ideal para surf. Tem menos estrutura que as outras praias, mas é uma boa opção para quem quer ficar perto da vila.',
      coordinates: { lat: -13.3795, lng: -38.9157 },
    },
    'segunda praia': {
      text:
        getAssistantText('second_beach_info', language) ||
        'A Segunda Praia é o coração de Morro de São Paulo! Tem águas calmas, bares, restaurantes e muita agitação. É perfeita para quem quer curtir a praia com estrutura completa e boa vida noturna.',
      coordinates: { lat: -13.3825, lng: -38.9138 },
    },
    'terceira praia': {
      text:
        getAssistantText('third_beach_info', language) ||
        'A Terceira Praia tem águas tranquilas e cristalinas, perfeitas para banho! É mais familiar e relaxante, com excelentes pousadas e restaurantes. Daqui saem muitos barcos para passeios.',
      coordinates: { lat: -13.3865, lng: -38.9088 },
    },
    'quarta praia': {
      text:
        getAssistantText('fourth_beach_info', language) ||
        'A Quarta Praia é a mais extensa e tranquila. Suas águas são cristalinas com piscinas naturais na maré baixa. É ideal para quem busca relaxamento e contato com a natureza.',
      coordinates: { lat: -13.3915, lng: -38.9046 },
    },
    'quinta praia': {
      text:
        getAssistantText('fifth_beach_info', language) ||
        'A Quinta Praia, também conhecida como Praia do Encanto, é a mais preservada e deserta. Perfeita para quem busca privacidade e natureza intocada.',
      coordinates: { lat: -13.3975, lng: -38.899 },
    },
    // Adicionar mais locais...
  };

  // Verificar se o local é reconhecido
  if (locationMap[location.name]) {
    return {
      text: locationMap[location.name].text,
      action: {
        type: 'show_location',
        name: location.name,
        coordinates: locationMap[location.name].coordinates,
      },
    };
  }

  // Se o local não for reconhecido
  return (
    getAssistantText('unknown_location', language) ||
    `Não tenho informações específicas sobre ${location.name}, mas posso falar sobre as principais praias e pontos turísticos de Morro de São Paulo.`
  );
}

// Nova função para mostrar sugestões com base na intenção
function showSuggestionsByIntent(intent, entities, language) {
  switch (intent) {
    case 'location_info':
    case 'show_location':
      if (entities.locations.some((loc) => loc.type === 'beach')) {
        setTimeout(() => showBeachOptions(language), 500);
      }
      break;

    case 'food_info':
      setTimeout(() => showFoodOptions(language), 500);
      break;

    case 'accommodation_info':
      setTimeout(() => showAccommodationOptions(language), 500);
      break;

    case 'activity_info':
      setTimeout(() => showActivityOptions(language), 500);
      break;
  }
}

// Nova função para mostrar opções de atividades
function showActivityOptions(language = 'pt') {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';

  choicesElement.innerHTML = `
    <button class="assistant-choice-btn" data-choice="passeio_barco">${getAssistantText('boat_tour', language) || 'Passeio de Barco'}</button>
    <button class="assistant-choice-btn" data-choice="mergulho">${getAssistantText('diving', language) || 'Mergulho'}</button>
    <button class="assistant-choice-btn" data-choice="trilhas">${getAssistantText('trails', language) || 'Trilhas'}</button>
  `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos...
}

// Nova função para mostrar opções de hospedagem
function showAccommodationOptions(language = 'pt') {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';

  choicesElement.innerHTML = `
    <button class="assistant-choice-btn" data-choice="economico">${getAssistantText('budget', language) || 'Econômico'}</button>
    <button class="assistant-choice-btn" data-choice="conforto">${getAssistantText('comfort', language) || 'Confortável'}</button>
    <button class="assistant-choice-btn" data-choice="luxo">${getAssistantText('luxury', language) || 'Luxo'}</button>
  `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos...
}

/**
 * Mostra opções de comida
 * @param {string} language - Idioma atual
 */
function showFoodOptions(language = 'pt') {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';

  // Usar traduções para os botões
  const seafoodText = getAssistantText('seafood', language) || 'Frutos do Mar';
  const bahianText =
    getAssistantText('bahian_food', language) || 'Comida Baiana';
  const internationalText =
    getAssistantText('international_food', language) || 'Internacional';

  choicesElement.innerHTML = `
        <button class="assistant-choice-btn" data-choice="frutos_do_mar">${seafoodText}</button>
        <button class="assistant-choice-btn" data-choice="baiana">${bahianText}</button>
        <button class="assistant-choice-btn" data-choice="internacional">${internationalText}</button>
      `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.assistant-choice-btn');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      let mensagem;

      // Usar traduções para as mensagens de envio
      switch (escolha) {
        case 'frutos_do_mar':
          mensagem =
            getAssistantText('ask_seafood', language) ||
            `Quero saber sobre restaurantes de frutos do mar`;
          break;
        case 'baiana':
          mensagem =
            getAssistantText('ask_bahian', language) ||
            `Quero saber sobre restaurantes de comida baiana`;
          break;
        case 'internacional':
          mensagem =
            getAssistantText('ask_international', language) ||
            `Quero saber sobre restaurantes de comida internacional`;
          break;
      }

      sendMessage(mensagem);
    });
  });
}

/**
 * Mostra opções de praias
 * @param {string} language - Idioma atual
 */
export function showBeachOptions(language = 'pt') {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';

  // Usar traduções para os botões
  const firstBeachText =
    getAssistantText('first_beach_name', language) || 'Primeira Praia';
  const secondBeachText =
    getAssistantText('second_beach_name', language) || 'Segunda Praia';
  const thirdBeachText =
    getAssistantText('third_beach_name', language) || 'Terceira Praia';
  const fourthBeachText =
    getAssistantText('fourth_beach_name', language) || 'Quarta Praia';

  choicesElement.innerHTML = `
        <button class="assistant-choice-btn" data-choice="primeira_praia">${firstBeachText}</button>
        <button class="assistant-choice-btn" data-choice="segunda_praia">${secondBeachText}</button>
        <button class="assistant-choice-btn" data-choice="terceira_praia">${thirdBeachText}</button>
        <button class="assistant-choice-btn" data-choice="quarta_praia">${fourthBeachText}</button>
      `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.assistant-choice-btn');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      let mensagem;

      // Usar traduções para as mensagens de envio
      switch (escolha) {
        case 'primeira_praia':
          mensagem =
            getAssistantText('ask_first_beach', language) ||
            `Me fale sobre a primeira praia`;
          break;
        case 'segunda_praia':
          mensagem =
            getAssistantText('ask_second_beach', language) ||
            `Me fale sobre a segunda praia`;
          break;
        case 'terceira_praia':
          mensagem =
            getAssistantText('ask_third_beach', language) ||
            `Me fale sobre a terceira praia`;
          break;
        case 'quarta_praia':
          mensagem =
            getAssistantText('ask_fourth_beach', language) ||
            `Me fale sobre a quarta praia`;
          break;
      }

      sendMessage(mensagem);
    });
  });
}

/**
 * Obtém uma resposta simples para mensagens gerais com suporte multilíngue
 * @param {string} text - Texto da mensagem
 * @param {string} currentLanguage - Idioma atual
 * @returns {string} - Resposta simples
 */
function getSimpleResponse(text, currentLanguage = 'pt') {
  const lowerText = text.toLowerCase();

  // Verificar palavras-chave específicas no idioma atual usando o arquivo de traduções
  // Para cada palavra-chave, verificar se existe tradução no arquivo translations.js
  const greetings = ['greeting', 'hello', 'hi'];
  const timeGreetings = ['good_morning', 'good_afternoon', 'good_evening'];
  const keywords = [
    'hotel',
    'accommodation',
    'transport',
    'tour',
    'diving',
    'weather',
    'money',
    'wifi',
    'thanks',
  ];

  // Verificar saudações
  for (const greeting of greetings) {
    const keywordText = getAssistantText(
      greeting,
      currentLanguage
    )?.toLowerCase();
    if (keywordText && lowerText.includes(keywordText)) {
      return (
        getAssistantText(`${greeting}_response`, currentLanguage) ||
        getAssistantText('general_greeting', currentLanguage) ||
        'Olá! Como posso ajudar você a aproveitar Morro de São Paulo?'
      );
    }
  }

  // Verificar saudações por horário
  for (const timeGreeting of timeGreetings) {
    const keywordText = getAssistantText(
      timeGreeting,
      currentLanguage
    )?.toLowerCase();
    if (keywordText && lowerText.includes(keywordText)) {
      return (
        getAssistantText(`${timeGreeting}_response`, currentLanguage) ||
        getAssistantText('general_greeting', currentLanguage) ||
        'Olá! Como posso ajudar você a aproveitar Morro de São Paulo?'
      );
    }
  }

  // Verificar outras palavras-chave
  for (const keyword of keywords) {
    const keywordText = getAssistantText(
      keyword,
      currentLanguage
    )?.toLowerCase();
    if (keywordText && lowerText.includes(keywordText)) {
      return (
        getAssistantText(`${keyword}_response`, currentLanguage) ||
        getAssistantText('fallback_response', currentLanguage) ||
        `Desculpe, não tenho informações específicas sobre ${text}, mas posso ajudar com praias, restaurantes, hospedagem ou passeios em Morro de São Paulo.`
      );
    }
  }

  // Respostas genéricas se nenhuma palavra-chave for identificada
  const genericResponses = [
    getAssistantText('generic_response_1', currentLanguage) ||
      `Entendi sua mensagem sobre "${text}". Posso ajudar com informações sobre praias, restaurantes, hospedagem ou passeios em Morro de São Paulo.`,
    getAssistantText('generic_response_2', currentLanguage) ||
      `Obrigado por sua pergunta sobre "${text}". Para ajudar melhor, você poderia ser mais específico sobre o que deseja saber de Morro de São Paulo?`,
    getAssistantText('generic_response_3', currentLanguage) ||
      `Sobre "${text}", posso oferecer várias informações. Você está interessado em quais aspectos de Morro de São Paulo?`,
    getAssistantText('generic_response_4', currentLanguage) ||
      `Recebi sua mensagem sobre "${text}". Posso ajudar com dicas de praias, restaurantes, hospedagem ou atividades. O que prefere saber?`,
  ];

  // Retornar uma resposta genérica aleatória no idioma atual
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

/**
 * Adiciona uma mensagem à interface
 * @param {string|Object} message - Mensagem a ser adicionada
 * @param {string} sender - Remetente ('user' ou 'assistant')
 * @param {boolean} requireInteraction - Se requer interação
 */
export function addMessageToUI(
  message,
  sender = 'assistant',
  requireInteraction = false
) {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) {
    console.error('Container de mensagens não encontrado');
    return false;
  }

  // Criar elemento da mensagem
  const messageElement = document.createElement('div');
  messageElement.className = `assistant-message ${sender}`;

  // Processar texto ou objeto de resposta
  let messageText = '';
  let messageAction = null;

  if (typeof message === 'object' && message !== null) {
    // Se tem ação e texto
    if (message.text) {
      messageText = message.text;
    }

    // Se tem ação
    if (message.action) {
      messageAction = message.action;
    }
  } else {
    // Se for apenas texto
    messageText = String(message);
  }

  // Formatar links no texto
  messageText = formatLinks(messageText);

  // Adicionar texto à mensagem
  messageElement.innerHTML = `<div class="message-content">${messageText}</div>`;

  // Adicionar à interface
  messagesContainer.appendChild(messageElement);

  // Auto-scroll para a última mensagem
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Executar ação, se houver
  if (messageAction) {
    setTimeout(() => {
      executeMessageAction(messageAction);
    }, 500);
  }

  return true;
}

/**
 * Executa ação associada a uma mensagem
 * @param {Object} action - Ação a ser executada
 */
function executeMessageAction(action) {
  if (!action || !action.type) return;

  switch (action.type) {
    case 'show_location':
      if (action.coordinates && action.name) {
        showLocationOnMap(action.coordinates, action.name);
      }
      break;
    // Adicionar outros tipos de ação conforme necessário
  }
}

/**
 * Mostra indicador de digitação
 */
export function showTypingIndicator() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Remover indicador existente, se houver
  removeTypingIndicator();

  // Criar indicador de digitação
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';

  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Atualizar estado
  assistantStateManager.set('isTyping', true);
}

/**
 * Remove indicador de digitação
 */
export function removeTypingIndicator() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  const typingIndicator = messagesContainer.querySelector('.typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }

  // Atualizar estado
  assistantStateManager.set('isTyping', false);
}

/**
 * Processa mensagem contextual
 * @param {string} text - Texto da mensagem
 * @param {string} context - Contexto atual
 * @param {string} language - Idioma atual
 * @returns {string|Object} - Resposta ao usuário
 */
function processContextualMessage(text, context, language) {
  const lowerText = text.toLowerCase();

  // Obter o histórico de conversa para contexto
  const conversations = assistantStateManager.get('conversations') || [];

  // Contexto de alimentação/gastronomia
  if (context === 'food') {
    // Restaurantes de frutos do mar
    if (
      lowerText.includes(getAssistantText('seafood', language).toLowerCase())
    ) {
      // Adicionar resposta estruturada com ação para mostrar no mapa
      return {
        text:
          getAssistantText('seafood_response', language) ||
          'Os melhores restaurantes de frutos do mar são o Sambass na Terceira Praia e o Ponto do Marisco na Segunda Praia. Ambos têm pratos frescos e deliciosos, com destaque para a moqueca de camarão e lagosta grelhada.',
        action: {
          type: 'show_location',
          name: 'Sambass',
          coordinates: { lat: -13.3865, lng: -38.9088 },
        },
      };
    }
    // Adicionar mais opções de comida...
  }

  // Novo contexto: acomodações/hospedagem
  else if (context === 'accommodation') {
    if (
      lowerText.includes('barato') ||
      lowerText.includes('econômic') ||
      lowerText.includes('budget') ||
      lowerText.includes('cheap')
    ) {
      return {
        text:
          getAssistantText('budget_accommodation_response', language) ||
          'Para hospedagem econômica, recomendo a Pousada Bahia Inn na vila ou o Hostel Morro de São Paulo, ambos oferecem bom custo-benefício e estão bem localizados.',
        action: {
          type: 'show_poi_category',
          category: 'budget_inns',
        },
      };
    }
    // Adicionar mais opções de acomodação...
  }

  // Novo contexto: atividades/passeios
  else if (context === 'activities') {
    if (
      lowerText.includes('mergulho') ||
      lowerText.includes('diving') ||
      lowerText.includes('buceo')
    ) {
      return {
        text:
          getAssistantText('diving_response', language) ||
          'Há excelentes pontos para mergulho em Morro! A Piscina Natural é perfeita para snorkeling e é acessível mesmo para iniciantes. Para mergulho com cilindro, recomendo a Náutica Diving School na Segunda Praia.',
        action: {
          type: 'show_location',
          name: 'Piscina Natural',
          coordinates: { lat: -13.3841, lng: -38.9112 },
        },
      };
    }
    // Adicionar mais opções de atividades...
  }

  // Continuar com outros contextos...

  // Se não houver resposta específica, voltar ao contexto geral
  assistantStateManager.set('currentContext', 'general');
  return getSimpleResponse(text, language);
}

/**
 * Envia uma mensagem para o assistente
 * @param {string} message - Mensagem a ser enviada
 */
export function sendMessage(message) {
  if (!message) return;

  // Adicionar mensagem do usuário à interface
  addMessageToUI(message, 'user');

  // Obter o elemento de input e limpar
  const inputField = document.getElementById('assistant-input-field');
  if (inputField) {
    inputField.value = '';
  }

  // Processar mensagem
  processUserMessage(message);
}
