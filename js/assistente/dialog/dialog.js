/**
 * Sistema de fluxo de conversação com aguardo de interação
 */
import {
  showBeachOptions,
  addMessageToUI as originalAddMessageToUI,
  showTypingIndicator,
  removeTypingIndicator,
} from './message/message.js';
import { extractEntities } from '../nlp/entityExtractor.js';
import { getAssistantText } from '../language/translations.js';

export class ConversationFlow {
  constructor() {
    this.steps = [];
    this.currentStepIndex = -1;
    this.isWaitingForInteraction = false;

    // Inicializar callbacks
    if (!window.assistantCallbacks) {
      window.assistantCallbacks = {};
    }

    window.assistantCallbacks.onInteractionComplete = () => {
      this.isWaitingForInteraction = false;
      this.processNextStep();
    };
  }

  /**
   * Adiciona uma mensagem ao fluxo de conversação
   * @param {string|Object} message - Mensagem a ser exibida
   * @param {string} type - Tipo de mensagem ('user' ou 'assistant')
   * @param {boolean} requireInteraction - Se requer interação para continuar
   * @param {Function} callback - Função opcional a ser chamada após a mensagem
   */
  addStep(
    message,
    type = 'assistant',
    requireInteraction = false,
    callback = null
  ) {
    this.steps.push({
      message,
      type,
      requireInteraction,
      callback,
    });

    // Se for o primeiro passo, inicia o processo
    if (this.steps.length === 1 && this.currentStepIndex === -1) {
      this.processNextStep();
    }

    return this;
  }

  /**
   * Processa o próximo passo na conversação
   */
  processNextStep() {
    if (this.isWaitingForInteraction) {
      return; // Aguardando interação do usuário
    }

    this.currentStepIndex++;

    if (this.currentStepIndex >= this.steps.length) {
      console.log('Fluxo de conversação concluído');
      return;
    }

    const step = this.steps[this.currentStepIndex];

    // Exibir a mensagem
    addMessageToUI(step.message, step.type, step.requireInteraction);

    // Se requerer interação, marcar como aguardando
    if (step.requireInteraction) {
      this.isWaitingForInteraction = true;
    } else {
      // Caso contrário, agendar o próximo passo após um pequeno delay
      setTimeout(() => {
        // Executar callback se existir
        if (step.callback && typeof step.callback === 'function') {
          step.callback();
        }

        this.processNextStep();
      }, 2000); // Delay de 2 segundos entre mensagens
    }
  }

  /**
   * Reinicia o fluxo de conversação
   */
  reset() {
    this.currentStepIndex = -1;
    this.isWaitingForInteraction = false;
    this.steps = [];
  }
}

/**
 * Alterna a visibilidade do diálogo do assistente
 */
export function toggleAssistantDialog() {
  const assistantDialog = document.getElementById('assistant-dialog');
  if (!assistantDialog) {
    console.error('Elemento do diálogo do assistente não encontrado!');
    return false;
  }

  if (assistantDialog.classList.contains('hidden')) {
    // Se estiver oculto, mostrar
    assistantDialog.classList.remove('hidden');

    // Notificar que o assistente foi aberto se a API existir
    if (
      window.assistantApi &&
      typeof window.assistantApi.notifyOpened === 'function'
    ) {
      window.assistantApi.notifyOpened();
    }

    // Atualizar estado
    if (window.assistantStateManager) {
      window.assistantStateManager.set('isVisible', true);
      window.assistantStateManager.set('isActive', true);
    }

    console.log('Diálogo do assistente exibido');
  } else {
    // Se estiver visível, ocultar
    assistantDialog.classList.add('hidden');

    // Atualizar estado
    if (window.assistantStateManager) {
      window.assistantStateManager.set('isVisible', false);
      window.assistantStateManager.set('isActive', false);
    }

    console.log('Diálogo do assistente ocultado');
  }

  return true;
}

/**
 * Oculta o diálogo do assistente
 */
export function hideAssistantDialog() {
  const assistantDialog = document.getElementById('assistant-dialog');
  if (!assistantDialog) {
    console.error('Elemento do diálogo do assistente não encontrado!');
    return false;
  }

  assistantDialog.classList.add('hidden');

  // Atualizar estado
  if (window.assistantStateManager) {
    window.assistantStateManager.set('isVisible', false);
    window.assistantStateManager.set('isActive', false);
  }

  console.log('Diálogo do assistente ocultado');
  return true;
}

// Exporte as outras funções necessárias
export function saveAssistantState() {
  // Implementação da função
}

// Continue com as outras funções existentes em dialog.js

/**
 * Gera uma resposta simples com base no texto
 * @param {string} text - Texto da mensagem
 * @returns {string} - Resposta simples
 */
function getSimpleResponse(text) {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes('olá') ||
    lowerText.includes('oi') ||
    lowerText.includes('ola')
  ) {
    return 'Olá! Como posso ajudar você a explorar Morro de São Paulo?';
  } else if (lowerText.includes('primeira praia')) {
    return 'A Primeira Praia é a mais próxima da Vila e ótima para surfistas! Tem ondas fortes e é menos indicada para banho. É uma praia pequena, com uma vista linda para o Farol e alguns estabelecimentos.';
  } else if (lowerText.includes('segunda praia')) {
    return 'A Segunda Praia é o coração da vida social em Morro! Tem águas mais calmas, muitos restaurantes, bares e hotéis. Durante o dia é movimentada e à noite se transforma no centro da vida noturna!';
  } else if (lowerText.includes('terceira praia')) {
    return 'A Terceira Praia tem águas tranquilas e cristalinas, perfeitas para banho! É mais familiar e relaxante, com excelentes pousadas e restaurantes.';
  } else if (lowerText.includes('quarta praia')) {
    return 'A Quarta Praia é extensa e mais deserta, ideal para quem busca tranquilidade! Tem piscinas naturais na maré baixa e é ótima para longas caminhadas.';
  } else if (lowerText.includes('praias')) {
    return 'Morro de São Paulo tem 5 praias principais: Primeira (para surf), Segunda (mais movimentada), Terceira (águas calmas), Quarta (tranquila e extensa) e Quinta (quase deserta). Cada uma tem seu próprio charme! Quer detalhes sobre alguma específica?';
  } else if (lowerText.includes('clima') || lowerText.includes('tempo')) {
    return 'Hoje o clima está ensolarado, com temperatura máxima de 29°C. A previsão para os próximos dias continua boa, com baixa chance de chuva. Perfeito para curtir as praias!';
  } else if (
    lowerText.includes('hotel') ||
    lowerText.includes('pousada') ||
    lowerText.includes('dormir')
  ) {
    return 'Em Morro temos opções para todos os bolsos! Pousadas econômicas como Porto do Zimbo na Vila, pousadas medianas como Pousada Natureza na Segunda Praia, e opções de luxo como a Villa dos Corais na Terceira Praia.';
  } else if (lowerText.includes('chegar') || lowerText.includes('como ir')) {
    return 'Para chegar a Morro de São Paulo, você precisa ir até Salvador ou Valença. De Salvador, pegue um catamarã (2h15) ou lancha rápida (1h45). De Valença, são apenas 30 minutos de lancha.';
  } else if (
    lowerText.includes('festa') ||
    lowerText.includes('balada') ||
    lowerText.includes('noite')
  ) {
    return 'A vida noturna de Morro é animada! Na Segunda Praia, os bares como Toca do Morcego e Pulso têm festas todas as noites. Na temporada, acontecem festas na praia com DJs famosos.';
  } else if (lowerText.includes('passeio') || lowerText.includes('tour')) {
    return 'Os passeios mais populares são: Volta à Ilha (visita às praias de barco), Cairu e Boipeba (ilhas vizinhas), Piscinas Naturais (na maré baixa) e Gamboa (praia vizinha). Quer detalhes sobre algum deles?';
  } else if (lowerText.includes('toca do morcego')) {
    return 'A Toca do Morcego é um ponto turístico incrível! É uma caverna natural na encosta entre o Farol e a Primeira Praia, com uma vista panorâmica espetacular! Perfeito para fotos e para assistir ao pôr do sol.';
  } else if (lowerText.includes('farol')) {
    return 'O Farol é um dos pontos mais altos da ilha, oferecendo uma vista 360° espetacular! É ideal para ver o nascer e o pôr do sol. A trilha para chegar lá é um pouco íngreme, mas vale cada gota de suor!';
  } else {
    return 'Estou aqui para ajudar com informações sobre Morro de São Paulo! Posso falar sobre praias, restaurantes, hospedagem, passeios, vida noturna ou como chegar. O que você gostaria de saber?';
  }
}

/**
 * Mostra opções para resposta de primeira visita
 */
function showFirstTimeOptions() {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar contêiner de botões
  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';
  choicesElement.innerHTML = `
      <button class="assistant-choice-btn" data-choice="sim">Sim, primeira vez</button>
      <button class="assistant-choice-btn" data-choice="nao">Já estive aqui antes</button>
    `;

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.assistant-choice-btn');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      handleFirstTimeResponse(escolha);
    });
  });
}

/**
 * Processa a resposta do usuário sobre primeira vez
 * @param {string} resposta - Sim ou não
 */
function handleFirstTimeResponse(resposta) {
  if (!assistantStateManager.get('awaitingFirstTimeResponse')) return;

  assistantStateManager.set('awaitingFirstTimeResponse', false);

  // Atualizar estado
  if (resposta === 'nao') {
    assistantStateManager.set('firstTimeVisitor', false);
    saveAssistantState();
  }

  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();

    let mensagemResposta;
    if (resposta === 'sim') {
      mensagemResposta =
        'Que incrível! Você vai adorar conhecer o Morro! Posso te ajudar com sugestões de roteiros e informações importantes para quem está aqui pela primeira vez. Do que você mais gosta: praias, festas, gastronomia ou trilhas?';
    } else {
      mensagemResposta =
        'Ah, então você já conhece as maravilhas do Morro! Sempre bom voltar, não é? Quer saber sobre alguma novidade ou precisa de informações específicas sobre algum local?';
    }

    addMessageToUI(mensagemResposta, 'assistant');

    // Mostrar opções de tópicos após um delay
    setTimeout(() => {
      showTopicOptions(resposta);
    }, 500);
  }, 1500);
}

/**
 * Mostra opções de tópicos para o usuário escolher
 * @param {string} resposta - Resposta anterior do usuário
 */
function showTopicOptions(resposta) {
  const messagesContainer = document.getElementById('assistant-messages');
  if (!messagesContainer) return;

  // Criar contêiner de botões
  const choicesElement = document.createElement('div');
  choicesElement.className = 'assistant-choices';

  if (resposta === 'sim') {
    // Opções para primeira visita
    choicesElement.innerHTML = `
        <button class="assistant-choice-btn" data-choice="praias">Praias</button>
        <button class="assistant-choice-btn" data-choice="festas">Festas</button>
        <button class="assistant-choice-btn" data-choice="gastronomia">Gastronomia</button>
        <button class="assistant-choice-btn" data-choice="trilhas">Trilhas</button>
      `;
  } else {
    // Opções para quem já conhece
    choicesElement.innerHTML = `
        <button class="assistant-choice-btn" data-choice="novidades">Novidades</button>
        <button class="assistant-choice-btn" data-choice="eventos">Eventos atuais</button>
        <button class="assistant-choice-btn" data-choice="melhores_lugares">Melhores lugares</button>
        <button class="assistant-choice-btn" data-choice="off_beaten">Fora do circuito</button>
      `;
  }

  messagesContainer.appendChild(choicesElement);

  // Adicionar eventos aos botões
  const botoes = choicesElement.querySelectorAll('.assistant-choice-btn');
  botoes.forEach((botao) => {
    botao.addEventListener('click', (e) => {
      const escolha = e.target.getAttribute('data-choice');
      handleTopicSelection(escolha);
    });
  });
}

/**
 * Processa seleção de tópico do usuário
 * @param {string} escolha - Tópico escolhido
 */
function handleTopicSelection(escolha) {
  let mensagemResposta = '';

  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();

    // Gerar resposta com base na escolha
    switch (escolha) {
      // Respostas para primeira vez
      case 'praias':
        mensagemResposta = {
          text: 'Morro tem 5 praias principais, cada uma com seu charme! A Primeira é ótima para surf, a Segunda é a mais animada com bares e restaurantes, a Terceira tem águas calmas perfeitas para banho, a Quarta é mais tranquila e a Quinta é quase deserta. Quer que eu mostre a Segunda Praia no mapa?',
          action: {
            type: 'show_location',
            name: 'Segunda Praia',
            coordinates: { lat: -13.3825, lng: -38.9138 },
          },
        };
        break;
      case 'festas':
        mensagemResposta =
          'A vida noturna em Morro é animada! Os principais points são os bares da Segunda Praia, que têm festas todas as noites. No verão, rolam festas na praia e há boates como o Pulso e o Toca do Morcego. Quer mais detalhes sobre algum lugar específico?';
        break;
      case 'gastronomia':
        mensagemResposta =
          'A gastronomia aqui é incrível! Você encontra desde frutos do mar fresquíssimos até pratos internacionais. Não deixe de provar a moqueca baiana e o acarajé! Recomendo o restaurante Sambass na Terceira Praia e o Pasta & Vino para comida italiana. Alguma preferência específica?';
        break;
      case 'trilhas':
        mensagemResposta =
          'As trilhas de Morro são espetaculares! A mais famosa é a trilha até a Ponta do Morro, passando pelo Farol e Toca do Morcego, com vistas incríveis. Há também trilhas para as praias mais isoladas como Gamboa e Garapuá. Use tênis e leve bastante água!';
        break;

      // Respostas para retornantes
      case 'novidades':
        mensagemResposta =
          'Temos algumas novidades! Foi inaugurado o novo deck de observação na Quinta Praia, há um novo sistema de trilhas ecológicas na reserva, e agora temos passeios noturnos para observação de tartarugas (na temporada). O que te interessa mais?';
        break;
      case 'eventos':
        mensagemResposta =
          'Neste momento temos o Festival Gastronômico acontecendo na Vila, com pratos especiais em vários restaurantes. No próximo fim de semana teremos música ao vivo na Praça Central. Quer que eu te indique algum restaurante participante?';
        break;
      case 'melhores_lugares':
        mensagemResposta =
          'Os lugares mais bem avaliados atualmente são o restaurante Sambass na Terceira Praia, a Pousada Natureza na Segunda Praia, e os passeios de lancha até Cairú estão com avaliações excelentes. Quer saber mais sobre algum deles?';
        break;
      case 'off_beaten':
        mensagemResposta =
          'Para quem já conhece o básico, recomendo conhecer a praia de Garapuá (de barco), a Gamboa do Morro (travessia de barco ou caminhada na maré baixa), e a cachoeira da Fonte Grande. São lugares menos turísticos e muito especiais!';
        break;
      default:
        mensagemResposta =
          'Desculpe, não entendi sua escolha. Pode me dizer de outra forma o que você gostaria de saber sobre Morro de São Paulo?';
    }

    addMessageToUI(mensagemResposta, 'assistant');
  }, 1500);
}

/**
 * Adiciona um elemento de interface para a mensagem
 * Implementação temporária até resolver a importação circular
 */
function addMessageToUI(message, type, requireInteraction = false) {
  // Se a função estiver disponível em message.js, use essa
  import('./message/message.js')
    .then((module) => {
      if (typeof module.addMessageToUI === 'function') {
        module.addMessageToUI(message, type, requireInteraction);
      } else {
        console.error('Função addMessageToUI não encontrada em message.js');
        // Implementação fallback
        const messagesContainer = document.getElementById('assistant-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `assistant-message ${type}`;

        if (typeof message === 'object' && message.text) {
          messageElement.textContent = message.text;
        } else {
          messageElement.textContent = message;
        }

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    })
    .catch((error) => {
      console.error('Erro ao importar módulo de mensagens:', error);
    });
}

/**
 * Configura o gerenciador de diálogo do assistente
 */
export function setupDialogManager(config) {
  const { language, stateManager, onResponse } = config;
  let currentLanguage = language || 'pt';

  // Histórico de conversa
  const conversationHistory = [];

  // Intenções básicas
  const intentPatterns = {
    find_location: [
      {
        lang: 'pt',
        patterns: [
          'onde fica',
          'como chegar',
          'onde é',
          'localização de',
          'me mostre',
        ],
      },
      {
        lang: 'en',
        patterns: ['where is', 'how to get to', 'location of', 'show me'],
      },
      {
        lang: 'es',
        patterns: ['dónde está', 'cómo llegar a', 'ubicación de', 'muéstrame'],
      },
      {
        lang: 'he',
        patterns: [
          'איפה נמצא',
          'איך להגיע ל',
          'איפה זה',
          'מיקום של',
          'הראה לי',
        ],
      },
    ],
    create_route: [
      {
        lang: 'pt',
        patterns: [
          'crie uma rota',
          'traçar rota',
          'me leve até',
          'caminho para',
        ],
      },
      {
        lang: 'en',
        patterns: ['create a route', 'route to', 'take me to', 'path to'],
      },
      {
        lang: 'es',
        patterns: ['crear ruta', 'llévame a', 'ruta hacia', 'camino a'],
      },
      {
        lang: 'he',
        patterns: ['צור מסלול', 'סלול דרך', 'קח אותי ל', 'דרך אל'],
      },
    ],
    beach_info: [
      { lang: 'pt', patterns: ['praia', 'praias', 'melhor praia', 'areia'] },
      { lang: 'en', patterns: ['beach', 'beaches', 'best beach', 'sand'] },
      { lang: 'es', patterns: ['playa', 'playas', 'mejor playa', 'arena'] },
      {
        lang: 'he',
        patterns: ['חוף', 'חופים', 'החוף הטוב ביותר', 'חול'],
      },
    ],
    restaurant_info: [
      {
        lang: 'pt',
        patterns: ['restaurante', 'onde comer', 'comida', 'refeição'],
      },
      { lang: 'en', patterns: ['restaurant', 'where to eat', 'food', 'meal'] },
      {
        lang: 'es',
        patterns: ['restaurante', 'dónde comer', 'comida', 'alimentación'],
      },
      {
        lang: 'he',
        patterns: ['מסעדה', 'היכן לאכול', 'אוכל', 'ארוחה'],
      },
    ],
    tour_info: [
      {
        lang: 'pt',
        patterns: ['passeio', 'tour', 'excursão', 'visita guiada'],
      },
      {
        lang: 'en',
        patterns: ['tour', 'excursion', 'guided visit', 'sightseeing'],
      },
      { lang: 'es', patterns: ['paseo', 'tour', 'excursión', 'visita guiada'] },
      {
        lang: 'he',
        patterns: ['טיול', 'סיור', 'אטרקציה', 'סיור מודרך'],
      },
    ],
    help: [
      {
        lang: 'pt',
        patterns: ['ajuda', 'o que você faz', 'como funciona', 'me ajude'],
      },
      {
        lang: 'en',
        patterns: ['help', 'what do you do', 'how it works', 'help me'],
      },
      {
        lang: 'es',
        patterns: ['ayuda', 'qué haces', 'cómo funciona', 'ayúdame'],
      },
      {
        lang: 'he',
        patterns: ['עזרה', 'מה אתה עושה', 'איך זה עובד', 'עזור לי'],
      },
    ],
  };

  // Respostas padrão para mensagens do sistema
  const systemMessages = {
    welcome: {
      pt: 'Olá! Sou o assistente virtual de Morro de São Paulo. Como posso ajudar a tornar sua visita especial?',
      en: "Hello! I'm the Morro de São Paulo virtual assistant. How can I help make your visit special?",
      es: '¡Hola! Soy el asistente virtual de Morro de São Paulo. ¿Cómo puedo ayudar a hacer su visita especial?',
      he: 'שלום! אני העוזר הווירטואלי של מורו דה סאו פאולו. איך אני יכול לעזור?',
    },
    error: {
      pt: 'Desculpe, ocorreu um erro. Poderia tentar novamente?',
      en: 'Sorry, an error occurred. Could you try again?',
      es: 'Lo siento, ocurrió un error. ¿Podría intentarlo de nuevo?',
      he: 'מצטער, אירעה שגיאה. האם תוכל לנסות שוב?',
    },
    location_reached: {
      pt: 'Você chegou a {location}!',
      en: 'You have reached {location}!',
      es: '¡Has llegado a {location}!',
      he: 'הגעת אל {location}!',
    },
    attraction_nearby: {
      pt: 'Ei! Você está perto de {name}, a apenas {distance}m. Gostaria de saber mais?',
      en: 'Hey! You are near {name}, just {distance}m away. Would you like to know more?',
      es: '¡Oye! Estás cerca de {name}, a solo {distance}m. ¿Te gustaría saber más?',
      he: 'היי! אתה קרוב ל {name}, במרחק {distance}מ בלבד. האם תרצה לדעת עוד?',
    },
  };

  // Função para detectar intenção
  function detectIntent(text) {
    const normalizedText = text.toLowerCase();

    // Encontrar a intenção com melhor correspondência
    let bestIntent = 'general_info';
    let bestScore = 0;

    Object.entries(intentPatterns).forEach(([intent, langPatterns]) => {
      // Encontrar padrões para o idioma atual
      const languagePatterns =
        langPatterns.find((lp) => lp.lang === currentLanguage) ||
        langPatterns.find((lp) => lp.lang === 'pt'); // fallback para português

      if (!languagePatterns) return;

      languagePatterns.patterns.forEach((pattern) => {
        if (normalizedText.includes(pattern)) {
          const score = pattern.length / normalizedText.length;
          if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
          }
        }
      });
    });

    return { intent: bestIntent, confidence: bestScore };
  }

  // Função para extrair entidades (locais, etc.)
  function extractEntities(text) {
    // Implementação simples - na prática seria mais complexa
    const entities = {
      locations: [],
      time: null,
      date: null,
    };

    // Lista de locais conhecidos em Morro de São Paulo
    const knownLocations = [
      { name: 'primeira praia', aliases: ['praia 1', '1ª praia'] },
      { name: 'segunda praia', aliases: ['praia 2', '2ª praia'] },
      { name: 'terceira praia', aliases: ['praia 3', '3ª praia'] },
      { name: 'quarta praia', aliases: ['praia 4', '4ª praia'] },
      {
        name: 'quinta praia',
        aliases: ['praia 5', '5ª praia', 'praia do encanto'],
      },
      { name: 'farol', aliases: ['lighthouse'] },
      { name: 'fonte grande', aliases: ['great spring'] },
      { name: 'toca do morcego', aliases: ['bat cave'] },
    ];

    // Verificar se o texto menciona algum local conhecido
    const textLower = text.toLowerCase();
    knownLocations.forEach((location) => {
      if (textLower.includes(location.name.toLowerCase())) {
        entities.locations.push({ name: location.name });
      } else {
        // Verificar aliases
        location.aliases.some((alias) => {
          if (textLower.includes(alias.toLowerCase())) {
            entities.locations.push({ name: location.name });
            return true;
          }
          return false;
        });
      }
    });

    return entities;
  }

  // Função para gerar resposta
  function generateResponse(intent, entities, userMessage) {
    console.log('Assistente: Gerando resposta para intenção', intent, entities);

    switch (intent) {
      case 'find_location':
        if (entities.locations.length > 0) {
          const location = entities.locations[0].name;
          return {
            text: getTranslation(
              'findLocationResponse',
              currentLanguage
            ).replace('{location}', location),
            action: {
              type: 'SHOW_LOCATION',
              payload: location,
            },
            shouldSpeak: true,
          };
        } else {
          return {
            text: getTranslation('askLocationName', currentLanguage),
            shouldSpeak: true,
          };
        }

      case 'create_route':
        if (entities.locations.length > 0) {
          const location = entities.locations[0].name;
          return {
            text: getTranslation(
              'createRouteResponse',
              currentLanguage
            ).replace('{location}', location),
            action: {
              type: 'CREATE_ROUTE',
              payload: location,
            },
            shouldSpeak: true,
          };
        } else {
          return {
            text: getTranslation('askRouteDestination', currentLanguage),
            shouldSpeak: true,
          };
        }

      case 'beach_info':
        return {
          text: getTranslation('beachInfoResponse', currentLanguage),
          action: {
            type: 'SHOW_CATEGORY',
            payload: 'beaches',
          },
          shouldSpeak: true,
        };

      case 'restaurant_info':
        return {
          text: getTranslation('restaurantInfoResponse', currentLanguage),
          action: {
            type: 'SHOW_CATEGORY',
            payload: 'restaurants',
          },
          shouldSpeak: true,
        };

      case 'tour_info':
        return {
          text: getTranslation('tourInfoResponse', currentLanguage),
          action: {
            type: 'SHOW_CATEGORY',
            payload: 'tours',
          },
          shouldSpeak: true,
        };

      case 'help':
        return {
          text: getTranslation('helpResponse', currentLanguage),
          shouldSpeak: true,
        };

      default:
        // Intenção não reconhecida
        return {
          text: getTranslation('generalResponse', currentLanguage),
          shouldSpeak: true,
        };
    }
  }

  // Função para obter tradução
  function getTranslation(key, lang) {
    // Mapear chaves para textos traduzidos
    const translations = {
      findLocationResponse: {
        pt: 'Encontrei {location} no mapa. Veja os detalhes:',
        en: 'I found {location} on the map. See the details:',
        es: 'Encontré {location} en el mapa. Mira los detalles:',
      },
      askLocationName: {
        pt: 'Qual local você gostaria de encontrar?',
        en: 'Which place would you like to find?',
        es: '¿Qué lugar te gustaría encontrar?',
      },
      createRouteResponse: {
        pt: 'Criando rota para {location}. Posso iniciar a navegação quando estiver pronto.',
        en: "Creating route to {location}. I can start navigation when you're ready.",
        es: 'Creando ruta para {location}. Puedo iniciar la navegación cuando estés listo.',
      },
      askRouteDestination: {
        pt: 'Para onde você gostaria de ir?',
        en: 'Where would you like to go?',
        es: '¿Dónde te gustaría ir?',
      },
      beachInfoResponse: {
        pt: 'Morro de São Paulo tem 5 praias principais. A Primeira Praia é mais agitada, a Segunda tem muitos bares e restaurantes, a Terceira é mais tranquila, a Quarta é menos movimentada e a Quinta (Praia do Encanto) é a mais isolada. Qual delas gostaria de conhecer?',
        en: 'Morro de São Paulo has 5 main beaches. First Beach is busier, Second Beach has many bars and restaurants, Third Beach is calmer, Fourth Beach is less crowded, and Fifth Beach (Enchantment Beach) is the most isolated. Which one would you like to know?',
        es: 'Morro de São Paulo tiene 5 playas principales. La Primera Playa es más animada, la Segunda tiene muchos bares y restaurantes, la Tercera es más tranquila, la Cuarta es menos concurrida y la Quinta (Playa del Encanto) es la más aislada. ¿Cuál te gustaría conocer?',
      },
      restaurantInfoResponse: {
        pt: 'Morro de São Paulo oferece diversos restaurantes, de pratos típicos baianos a culinária internacional. Vou mostrar alguns dos mais populares no mapa.',
        en: "Morro de São Paulo offers various restaurants, from typical Bahian dishes to international cuisine. I'll show some of the most popular ones on the map.",
        es: 'Morro de São Paulo ofrece varios restaurantes, desde platos típicos bahianos hasta cocina internacional. Te mostraré algunos de los más populares en el mapa.',
      },
      tourInfoResponse: {
        pt: 'Existem diversos passeios disponíveis em Morro de São Paulo, como visitas às piscinas naturais, mergulho, passeio de barco, etc. Gostaria que eu mostrasse as opções?',
        en: 'There are several tours available in Morro de São Paulo, such as visits to natural pools, diving, boat trips, etc. Would you like me to show the options?',
        es: 'Hay varios recorridos disponibles en Morro de São Paulo, como visitas a piscinas naturales, buceo, paseos en barco, etc. ¿Te gustaría que te mostrara las opciones?',
      },
      helpResponse: {
        pt: 'Posso ajudar você a encontrar locais, criar rotas de navegação, fornecer informações sobre praias, restaurantes e passeios. Basta me dizer o que você procura!',
        en: "I can help you find places, create navigation routes, provide information about beaches, restaurants and tours. Just tell me what you're looking for!",
        es: '¡Puedo ayudarte a encontrar lugares, crear rutas de navegación, proporcionar información sobre playas, restaurantes y tours. Solo dime lo que buscas!',
      },
      generalResponse: {
        pt: 'Como posso ajudar você em Morro de São Paulo hoje?',
        en: 'How can I help you in Morro de São Paulo today?',
        es: '¿Cómo puedo ayudarte en Morro de São Paulo hoy?',
      },
    };

    // Buscar tradução para a chave e língua solicitadas
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }

    // Fallback para português se não encontrar
    if (translations[key] && translations[key]['pt']) {
      return translations[key]['pt'];
    }

    // Último recurso
    return `[Tradução não encontrada: ${key}]`;
  }

  // Função para processar mensagens do sistema
  function processSystemMessage(messageType, data = {}) {
    console.log(
      'Assistente: Processando mensagem do sistema',
      messageType,
      data
    );

    // Obter o idioma atual
    const currentLanguage = localStorage.getItem('preferredLanguage') || 'pt';

    // Criar resposta
    let response = null;

    // Buscar tradução diretamente do sistema de traduções
    if (messageType === 'welcome') {
      const welcomeText = getAssistantText('welcome', currentLanguage);
      if (welcomeText) {
        response = {
          text: welcomeText,
          shouldSpeak: true,
        };
      }
    } else if (messageType === 'location_reached') {
      // Obter texto base e substituir parâmetros
      let text = getAssistantText('location_reached', currentLanguage);

      // Substituir parâmetros se existirem
      if (text && data.location) {
        text = text.replace('{location}', data.location);
      }

      response = {
        text: text,
        shouldSpeak: true,
      };
    } else if (messageType === 'attraction_nearby') {
      // Similar para outras mensagens do sistema
      let text = getAssistantText('attraction_nearby', currentLanguage);

      if (text) {
        // Substituir múltiplos parâmetros
        Object.keys(data).forEach((key) => {
          text = text.replace(`{${key}}`, data[key]);
        });
      }

      response = {
        text: text,
        shouldSpeak: true,
      };
    }

    // Se não tiver resposta específica, usar resposta genérica
    if (!response) {
      response = {
        text:
          getAssistantText('generic_response_1', currentLanguage) ||
          'Como posso ajudar você em Morro de São Paulo hoje?',
        shouldSpeak: true,
      };
    }

    // Notificar sobre a resposta
    if (typeof onResponse === 'function') {
      onResponse(response);
    }

    return response;
  }

  // Função para processar entrada do usuário
  function processInput(text, inputType = 'text') {
    console.log('Assistente: Processando entrada do usuário', text, inputType);

    // Detectar intenção
    const { intent, confidence } = detectIntent(text);

    // Extrair entidades
    const entities = extractEntities(text);

    // Gerar resposta
    const response = generateResponse(intent, entities, text);

    // Adicionar ao histórico
    conversationHistory.push({
      text,
      sender: 'user',
      timestamp: new Date(),
      inputType,
    });

    conversationHistory.push({
      text: response.text,
      sender: 'assistant',
      timestamp: new Date(),
      intent,
      entities,
    });

    // Notificar sobre a resposta
    if (typeof onResponse === 'function') {
      onResponse(response);
    }

    return response;
  }

  // Atualizar idioma
  function setLanguage(lang) {
    currentLanguage = lang;
    console.log('Assistente: Idioma do diálogo alterado para', lang);
  }

  // API pública
  return {
    processInput,
    processSystemMessage,
    setLanguage,
    getConversationHistory: () => [...conversationHistory],
  };
}

// Classe auxiliar para mensagens
class Message {
  constructor(data) {
    this.text = data.text || '';
    this.sender = data.sender || 'user';
    this.timestamp = data.timestamp || new Date();
    this.intent = data.intent || null;
    this.entities = data.entities || null;
    this.inputType = data.inputType || 'text';
  }
}

// Função auxiliar para obter traduções
function getTranslation(key, language) {
  // Implementação do sistema de traduções
  // ...
}
