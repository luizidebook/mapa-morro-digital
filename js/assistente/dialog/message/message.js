/**
 * Módulo de mensagens do assistente virtual
 * Responsável por exibir e processar mensagens da conversa
 */

// Importações necessárias
import { assistantStateManager } from '../../state/state.js';
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

  // Verificar se o container existe
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) {
    console.error('Container de mensagens não encontrado');
    return false;
  }

  // Limpar mensagens existentes
  messagesContainer.innerHTML = '';

  // Mostrar indicador de digitação
  showTypingIndicator();

  // Obter idioma atual - PRIORIZAR o estado do assistente
  let currentLanguage;
  if (
    assistantStateManager &&
    typeof assistantStateManager.get === 'function'
  ) {
    currentLanguage = assistantStateManager.get('selectedLanguage');
  }

  // Fallback para localStorage
  if (!currentLanguage) {
    currentLanguage = localStorage.getItem('preferredLanguage') || 'pt';
  }

  console.log(`Exibindo boas-vindas no idioma: ${currentLanguage}`);

  try {
    // Obter texto de boas-vindas
    const welcomeText = getAssistantText('welcome', currentLanguage);

    // Exibir mensagem após delay
    setTimeout(() => {
      try {
        removeTypingIndicator();
        addMessageToUI(welcomeText, 'assistant');

        // Tentar falar a mensagem
        if (
          window.assistantApi &&
          typeof window.assistantApi.speak === 'function'
        ) {
          window.assistantApi.speak(welcomeText);
        }
      } catch (innerError) {
        console.error('Erro ao exibir mensagem de boas-vindas:', innerError);
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
    return false;
  }
}

/**
 * Processa a mensagem do usuário e gera resposta
 * @param {string} text - Texto da mensagem
 */
function processUserMessage(text) {
  const lowerText = text.toLowerCase();
  // Obter o idioma atual
  const currentLanguage = localStorage.getItem('preferredLanguage') || 'pt';

  // Mostrar indicador de digitação
  showTypingIndicator();

  // Calcular tempo de resposta proporcional ao tamanho da mensagem
  const responseTime = Math.min(1200 + text.length * 30, 3000);

  setTimeout(() => {
    removeTypingIndicator();

    // Verificar contexto atual
    if (assistantStateManager.get('currentContext') !== 'general') {
      // Processar mensagem baseada no contexto
      const contextResponse = processContextualMessage(
        text,
        assistantStateManager.get('currentContext'),
        currentLanguage
      );
      addMessageToUI(contextResponse, 'assistant');

      // Mostrar opções relacionadas, se aplicável
      if (assistantStateManager.get('currentContext') === 'food') {
        setTimeout(() => showFoodOptions(currentLanguage), 500);
      }
      return;
    }

    // Processar mensagem geral
    let response;

    // Verificar se está perguntando sobre locais específicos
    if (lowerText.includes('segunda praia')) {
      response = {
        text:
          getAssistantText('second_beach', currentLanguage) ||
          'A Segunda Praia é o coração de Morro de São Paulo! Tem águas calmas, bares, restaurantes e muita agitação. É perfeita para quem quer curtir a praia com estrutura completa e boa vida noturna.',
        action: {
          type: 'show_location',
          name:
            getAssistantText('second_beach_name', currentLanguage) ||
            'Segunda Praia',
          coordinates: { lat: -13.3825, lng: -38.9138 },
        },
      };
    } else if (lowerText.includes('terceira praia')) {
      response = {
        text:
          getAssistantText('third_beach', currentLanguage) ||
          'A Terceira Praia tem águas tranquilas e cristalinas, perfeitas para banho! É mais familiar e relaxante, com excelentes pousadas e restaurantes. Daqui saem muitos barcos para passeios.',
        action: {
          type: 'show_location',
          name:
            getAssistantText('third_beach_name', currentLanguage) ||
            'Terceira Praia',
          coordinates: { lat: -13.3865, lng: -38.9088 },
        },
      };
    } else if (
      lowerText.includes('comida') ||
      lowerText.includes('restaurante') ||
      lowerText.includes('comer') ||
      lowerText.includes('food') ||
      lowerText.includes('restaurant') ||
      lowerText.includes('eat')
    ) {
      response =
        getAssistantText('food_options', currentLanguage) ||
        'Morro de São Paulo tem uma gastronomia incrível! Você prefere frutos do mar, comida regional baiana ou culinária internacional?';
      assistantStateManager.set('currentContext', 'food');
    } else {
      // Resposta padrão
      response = getSimpleResponse(text, currentLanguage);
    }

    addMessageToUI(response, 'assistant');

    // Mostrar botões de sugestão após a resposta
    if (
      lowerText.includes('praia') ||
      lowerText.includes('beach') ||
      lowerText.includes('playa') ||
      lowerText.includes('חוף') ||
      (typeof response === 'string' &&
        (response.toLowerCase().includes('praia') ||
          response.toLowerCase().includes('beach') ||
          response.toLowerCase().includes('playa') ||
          response.includes('חוף')))
    ) {
      setTimeout(() => showBeachOptions(currentLanguage), 500);
    }
  }, responseTime);
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

  // Contexto de alimentação/gastronomia
  if (context === 'food') {
    // Restaurantes de frutos do mar
    if (
      lowerText.includes(getAssistantText('seafood', language).toLowerCase())
    ) {
      return (
        getAssistantText('seafood_response', language) ||
        'Os melhores restaurantes de frutos do mar são o Sambass na Terceira Praia e o Ponto do Marisco na Segunda Praia. Ambos têm pratos frescos e deliciosos, com destaque para a moqueca de camarão e lagosta grelhada.'
      );
    }
    // Comida baiana
    else if (
      lowerText.includes(
        getAssistantText('bahian_food', language).toLowerCase()
      )
    ) {
      return (
        getAssistantText('bahian_food_response', language) ||
        'Para comida baiana autêntica, recomendo o Maria Mata Fome e o Dendê & Cia. O acarajé da Dora na praça central é imperdível! Experimente também o vatapá e o bobó de camarão.'
      );
    }
    // Culinária internacional
    else if (
      lowerText.includes(
        getAssistantText('international_food', language).toLowerCase()
      )
    ) {
      return (
        getAssistantText('international_food_response', language) ||
        'Para culinária internacional, o Pasta & Vino serve autêntica comida italiana, o Namastê tem ótimas opções vegetarianas e indianas, e o Café das Artes oferece pratos mediterrâneos deliciosos.'
      );
    }
    // Resposta genérica para comida
    else {
      assistantStateManager.set('currentContext', 'general');
      return (
        getAssistantText('general_food_response', language) ||
        'Morro de São Paulo tem opções gastronômicas para todos os gostos. Há restaurantes na vila e em todas as praias. Os preços variam bastante, mas a qualidade geralmente é boa. Alguma culinária específica que você procura?'
      );
    }
  }

  // Adicionar mais contextos conforme necessário

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
