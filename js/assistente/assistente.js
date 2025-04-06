import { setupDialogManager } from './dialog/dialog.js';
import { setupVoiceRecognition } from './voice/voice.js';
import { createAssistantInterface } from './interface/interface.js';
import { setupMapIntegration } from './integration/map-control.js';
import { setupStateManager } from './state/state.js';
import { updateAssistantUITexts } from './language/translations.js';
import { EnhancedVoiceSystem } from './voice/enhancedVoice.js';

// assistente.js - Ponto de entrada do módulo do assistente
export function initializeAssistant(map, options = {}) {
  // Configurações padrão mescladas com opções fornecidas
  const config = {
    language: options.language || 'pt',
    autoShow: options.autoShow !== undefined ? options.autoShow : false,
    enableVoice: options.enableVoice !== undefined ? options.enableVoice : true,
    proactiveMode:
      options.proactiveMode !== undefined ? options.proactiveMode : true,
    followUser: options.followUser !== undefined ? options.followUser : false,
  };

  // Verifica se o mapa foi fornecido
  if (!map) {
    console.error('Assistente: O mapa não foi fornecido');
    return null;
  }

  console.log('Assistente: Iniciando configuração', config);

  // 1. Inicializar interface visual do assistente
  const assistantUI = createAssistantInterface({
    onUserInput: handleUserInput,
    onToggleVoice: toggleVoiceRecognition,
    onClose: hideAssistant,
    onOpen: showAssistant,
    initialState: config.autoShow ? 'visible' : 'hidden',
  });

  // 2. Configurar gerenciador de estado
  const stateManager = setupStateManager(config);

  // Configurar suporte RTL para o idioma atual
  setupRTLSupport(config.language);

  // Garantir que a interface seja traduzida no idioma correto
  updateAssistantUITexts(config.language);

  // 3. Configurar gerenciador de diálogo
  const dialogManager = setupDialogManager({
    language: config.language,
    stateManager: stateManager,
    onResponse: handleAssistantResponse,
  });

  // 4. Configurar integração com o mapa
  const mapIntegration = setupMapIntegration(map, {
    stateManager: stateManager,
    language: config.language,
  });

  // 5. Configurar reconhecimento de voz se habilitado
  let voiceRecognition = null;
  if (config.enableVoice) {
    try {
      voiceRecognition = setupVoiceRecognition({
        language: config.language,
        onResult: handleUserInput,
        onError: handleVoiceError,
      });
    } catch (error) {
      console.warn('Assistente: Reconhecimento de voz não disponível', error);
    }
  }

  // Inicializar sistema de voz aprimorado
  let voiceSystem = null;

  async function initializeVoiceSystem() {
    try {
      // Criar uma única instância do sistema de voz aprimorado
      const enhancedVoice = new EnhancedVoiceSystem({
        preferredVoiceProvider: 'native',
        fallbackChain: ['native', 'google', 'responsive'],
        useCache: true,
        preloadCommonPhrases: true,
        useBlobUrl: false, // Usar método alternativo para evitar erros de CORS
      });

      // Aguardar o carregamento inicial das vozes
      await enhancedVoice.loadVoices();

      console.log('Sistema de voz inicializado com sucesso');
      return enhancedVoice;
    } catch (error) {
      console.error('Erro ao inicializar sistema de voz:', error);

      // Criar uma implementação simplificada para fallback
      return {
        setLanguage: (lang) =>
          console.log(`[Fallback] Idioma definido: ${lang}`),
        speak: (text) => {
          console.log(`[Fallback] Texto para falar: ${text}`);
          // Implementar feedback visual já que a síntese falhou
          showTextFeedback(text);
          return Promise.resolve(false);
        },
        stop: () => console.log('[Fallback] Parou a fala'),
      };
    }
  }

  // Função auxiliar para feedback visual quando a síntese falha completamente
  function showTextFeedback(text) {
    // Remover feedback existente
    const existingFeedback = document.getElementById('tts-text-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.id = 'tts-text-feedback';
    feedback.className = 'tts-text-feedback';
    feedback.textContent = text;

    // Adicionar à interface
    document.body.appendChild(feedback);

    // Animar entrada
    setTimeout(() => {
      feedback.classList.add('visible');
    }, 10);

    // Remover após um tempo
    setTimeout(
      () => {
        feedback.classList.remove('visible');
        setTimeout(() => {
          feedback.remove();
        }, 300);
      },
      Math.max(2000, text.length * 40)
    ); // Tempo proporcional ao tamanho do texto
  }

  // Implementação das funções ausentes
  function showAssistant() {
    console.log('Assistente: Exibindo interface');

    // Evitar recursão verificando o estado atual
    if (stateManager.get('isVisible') === true) {
      console.log('Assistente: Interface já está visível');
      return;
    }

    // Primeiro atualizar o estado
    stateManager.set('isVisible', true);

    // Use querySelectorAll para encontrar todos os elementos possíveis
    const assistantElements = document.querySelectorAll(
      '.digital-assistant, #digital-assistant'
    );
    const dialogElements = document.querySelectorAll(
      '.assistant-dialog, #assistant-dialog, .assistant-panel, #assistant-panel'
    );

    // Remover classe 'hidden' de todos os elementos encontrados
    assistantElements.forEach((el) => el.classList.remove('hidden'));
    dialogElements.forEach((el) => el.classList.remove('hidden'));

    // Garantir que o assistantUI também seja notificado (sem criar um loop)
    if (assistantUI && typeof assistantUI._showAssistant === 'function') {
      assistantUI._showAssistant();
    }
  }

  function hideAssistant() {
    console.log('Assistente: Ocultando interface');
    assistantUI.hideAssistant();
    stateManager.set('isVisible', false);
  }

  function toggleAssistant() {
    if (stateManager.get('isVisible')) {
      hideAssistant();
    } else {
      showAssistant();
    }
  }

  async function speakMessage(text) {
    if (!config.enableVoice || !text) return false;

    // Inicializar o sistema de voz se ainda não estiver pronto
    if (!voiceSystem) {
      voiceSystem = await initializeVoiceSystem();
    }

    // Verificar novamente após inicialização
    if (!voiceSystem) {
      console.warn('Sistema de voz não inicializado. Usando fallback visual.');
      showTextFeedback(text);
      return false;
    }

    // Tentar sintetizar a fala com tratamento de erros abrangente
    try {
      // Cancelar qualquer fala anterior para evitar sobreposição
      voiceSystem.stop();

      // Aguardar a conclusão da síntese com timeout para evitar bloqueio
      const speakPromise = voiceSystem.speak(text, {
        language: config.language,
      });

      // Adicionar timeout para o caso da promessa nunca resolver
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na síntese de voz')), 10000);
      });

      // Usar a primeira promessa que resolver/rejeitar
      const result = await Promise.race([speakPromise, timeoutPromise]);

      // Se falhar e não mostrar feedback visual, mostrar com nossa implementação
      if (!result) {
        showTextFeedback(text);
      }

      return result;
    } catch (error) {
      console.error('Erro ao sintetizar voz:', error);

      // Implementar feedback visual como fallback
      showTextFeedback(text);

      return false;
    }
  }

  function toggleVoiceRecognition() {
    if (!voiceRecognition) {
      console.warn('Assistente: Reconhecimento de voz não disponível');
      return false;
    }

    const isListening = voiceRecognition.isListening();
    if (isListening) {
      voiceRecognition.stop();
    } else {
      voiceRecognition.start();
    }
    return !isListening;
  }

  function handleVoiceError(error) {
    console.error('Assistente: Erro no reconhecimento de voz', error);
    assistantUI.setListening(false);
    showNotification(
      'Erro no reconhecimento de voz. Tente novamente.',
      'error'
    );
  }

  function showNotification(message, type = 'info') {
    // Implementação básica de notificação
    console.log(`Assistente [${type}]: ${message}`);

    // Se a UI tiver método para exibir notificações, usar
    if (assistantUI.showNotification) {
      assistantUI.showNotification(message, type);
    }
  }

  function setupProactiveMode(map, stateManager, dialogManager) {
    if (!config.proactiveMode) return;

    console.log('Assistente: Modo proativo ativado');

    // Verificar localização a cada 2 minutos para oferecer sugestões
    const checkInterval = 2 * 60 * 1000; // 2 minutos

    const intervalId = setInterval(() => {
      if (!stateManager.get('isVisible')) {
        // Oferece sugestões apenas se o assistente não estiver visível
        const userLocation = stateManager.get('location');
        if (userLocation) {
          checkNearbyAttractions(userLocation);
        }
      }
    }, checkInterval);

    // Armazenar o ID do intervalo para poder cancelá-lo posteriormente
    stateManager.set('proactiveIntervalId', intervalId);
  }

  function checkNearbyAttractions(userLocation) {
    // Implementação básica - oferecer sugestões com base na localização
    mapIntegration
      .findNearbyAttractions(userLocation, 500)
      .then((attractions) => {
        if (attractions && attractions.length > 0) {
          // Mostrar uma sugestão proativa
          const attraction = attractions[0];
          showAssistant();
          dialogManager.processSystemMessage('attraction_nearby', {
            name: attraction.name,
            distance: attraction.distance,
          });
        }
      })
      .catch((error) => {
        console.warn('Erro ao buscar atrações próximas:', error);
      });
  }

  // 6. Mostrar assistente se autoShow estiver habilitado
  if (config.autoShow) {
    showAssistant();
    // Exibir mensagem de boas-vindas após breve pausa
    setTimeout(() => {
      dialogManager.processSystemMessage('welcome');
    }, 500);
  }

  // 7. Iniciar modo proativo se habilitado
  if (config.proactiveMode) {
    setupProactiveMode(map, stateManager, dialogManager);
  }

  // Funções internas para processamento de entrada/saída
  function handleUserInput(text, inputType = 'text') {
    // Processar entrada do usuário via dialogManager
    console.log(`Assistente: Entrada recebida [${inputType}]`, text);
    dialogManager.processInput(text, inputType);
  }

  function handleAssistantResponse(response) {
    // Exibir resposta na interface
    console.log('Assistente: Enviando resposta', response);
    assistantUI.addMessage(response.text, 'assistant');

    // Executar ação se presente na resposta
    if (response.action) {
      executeAction(response.action);
    }

    // Sintetizar voz se habilitado e response.shouldSpeak é true
    if (config.enableVoice && response.shouldSpeak) {
      speakMessage(response.text);
    }
  }

  function executeAction(action) {
    console.log('Assistente: Executando ação', action);

    // Validar a ação antes de prosseguir
    if (!action || !action.type) {
      console.error('Assistente: Ação inválida', action);
      return;
    }

    try {
      // Executar ação com base no tipo
      switch (action.type) {
        case 'SHOW_LOCATION':
          if (!mapIntegration) {
            throw new Error('Integração com mapa não disponível');
          }
          mapIntegration.showLocation(action.payload);
          break;

        case 'CREATE_ROUTE':
          if (!mapIntegration) {
            throw new Error('Integração com mapa não disponível');
          }
          mapIntegration.createRoute(action.payload);
          break;

        case 'SHOW_CATEGORY':
          if (!mapIntegration) {
            throw new Error('Integração com mapa não disponível');
          }

          // Log detalhado para debug
          console.log('Assistente: Exibindo categoria', action.payload);

          // Verificar se categoria existe nos dados locais como fallback
          if (action.payload && !mapIntegration.showCategory(action.payload)) {
            // Se showCategory falhar e retornar false, mostrar mensagem
            assistantUI.addMessage(
              `Desculpe, não consegui encontrar informações sobre ${action.payload}.`,
              'assistant'
            );
          }
          break;

        default:
          console.warn('Assistente: Tipo de ação desconhecido', action.type);
      }
    } catch (error) {
      console.error('Assistente: Erro ao executar ação', error);
      // Mostrar erro ao usuário
      assistantUI.addMessage(
        'Desculpe, houve um problema ao executar essa ação. Tente novamente.',
        'assistant'
      );
    }
  }

  function showWithWelcome() {
    showAssistant();
    dialogManager.processSystemMessage('welcome');
    stateManager.markWelcomeAsShown();
  }

  // Adicionar esta função à API pública do assistente
  function reset() {
    try {
      console.log('Assistente: Reiniciando...');

      // 1. Ocultar assistente
      hideAssistant();

      // 2. Cancelar síntese de voz
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // 3. Parar reconhecimento de voz
      if (voiceRecognition) {
        voiceRecognition.stop();
      }

      // 4. Resetar estado do assistente
      stateManager.reset();

      // 5. Reconfigurar interface com o idioma atual
      updateAssistantUITexts(config.language);

      // 6. Verificar elementos da interface e corrigir visibilidade
      const assistant = document.querySelector('#digital-assistant');
      if (assistant) {
        // Remover quaisquer estilos inline que possam estar causando problemas
        assistant.style.cssText = '';

        // Garantir posicionamento correto
        if (config.language === 'he') {
          assistant.classList.add('rtl-language');
          assistant.style.direction = 'rtl';

          // Para idiomas RTL, fixar posição à esquerda
          assistant.style.left = '20px';
          assistant.style.right = 'auto';
        } else {
          assistant.classList.remove('rtl-language');
          assistant.style.direction = 'ltr';

          // Para idiomas LTR, fixar posição à direita
          assistant.style.right = '20px';
          assistant.style.left = 'auto';
        }

        // Ajustar posição vertical se necessário
        assistant.style.bottom = '80px';
        assistant.style.top = 'auto';
      }

      // 7. Mostrar assistente novamente após reinicialização
      setTimeout(() => {
        showAssistant();
        dialogManager.processSystemMessage('welcome');
      }, 500);

      return true;
    } catch (error) {
      console.error('Erro ao reiniciar assistente:', error);
      return false;
    }
  }

  // Inicializar sistema de voz durante a inicialização do assistente
  if (config.enableVoice) {
    initializeVoiceSystem().then((success) => {
      if (success) {
        console.log('Sistema avançado de voz inicializado com sucesso');

        // Pré-carregar algumas frases comuns para melhorar a responsividade
        if (voiceSystem) {
          const langCode =
            config.language === 'he'
              ? 'he-IL'
              : config.language === 'pt'
                ? 'pt-BR'
                : config.language === 'es'
                  ? 'es-ES'
                  : 'en-US';
          voiceSystem.preloadCommonPhrases(langCode);
        }
      }
    });
  }

  // Retornar API pública do assistente
  console.log('Assistente: Configuração concluída, API disponível');
  return {
    // Métodos para controle externo
    show: showAssistant,
    hide: hideAssistant,
    toggle: toggleAssistant,
    speak: speakMessage,
    processMessage: (text) => dialogManager.processInput(text),
    showWithWelcome,
    setLanguage: (lang) => {
      console.log('Assistente: Alterando idioma para', lang);

      // Atualizar o idioma no estado
      stateManager.set('language', lang);

      // Configurar suporte RTL para o idioma
      const isRTL = setupRTLSupport(lang);

      // Atualizar o reconhecimento de voz
      if (voiceRecognition) voiceRecognition.setLanguage(lang);

      // IMPORTANTE: Atualizar o gerenciador de diálogo com o novo idioma
      if (dialogManager && typeof dialogManager.setLanguage === 'function') {
        dialogManager.setLanguage(lang);

        // Após atualizar o idioma, reprocessar mensagem de boas-vindas se necessário
        if (stateManager.get('isVisible')) {
          dialogManager.processSystemMessage('welcome');
        }
      }

      // Atualizar os textos da interface
      updateAssistantUITexts(lang);

      // Atualizar o sistema de voz
      if (voiceSystem) {
        voiceSystem.setLanguage(lang);
      }

      // Exibir mensagem informativa
      if (assistantUI && typeof assistantUI.addMessage === 'function') {
        const languageNames = {
          pt: 'Português',
          en: 'English',
          es: 'Español',
          he: 'עברית',
        };

        const message =
          getAssistantText('language_changed_to', lang) +
          ' ' +
          (languageNames[lang] || lang);

        assistantUI.addMessage(message, 'assistant');
      }

      return true;
    },
    // Métodos para integração com o fluxo existente
    handleFeatureSelection: (feature) =>
      mapIntegration.handleFeatureSelection(feature),
    createRoute: (destination) => mapIntegration.createRoute(destination),
    startNavigation: mapIntegration.startNavigation,
    cancelNavigation: mapIntegration.cancelNavigation,
    reset,
  };
}

/**
 * Configura suporte para idiomas da direita para a esquerda (RTL) como o Hebraico
 * @param {string} language - Código do idioma atual
 * @returns {boolean} - true se o idioma for RTL
 */
function setupRTLSupport(language) {
  // Lista completa de idiomas RTL
  const rtlLanguages = ['he', 'ar', 'fa', 'ur', 'yi', 'dv'];

  // Verificar se o idioma é RTL
  const isRTL = rtlLanguages.includes(language);

  // Configurar atributo dir no HTML para suporte RTL
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

  // Adicionar/remover classe RTL do body
  document.body.classList.toggle('rtl-language', isRTL);

  // Aplicar classe RTL a todos os elementos do assistente
  const assistantElements = document.querySelectorAll(
    '.digital-assistant, #digital-assistant, .assistant-dialog, #assistant-dialog, ' +
      '.assistant-panel, #assistant-panel, #assistant-messages, .assistant-messages, ' +
      '.assistant-input, .message-bubble, .tts-text-feedback'
  );

  assistantElements.forEach((el) => {
    if (el) {
      el.classList.toggle('rtl-language', isRTL);
      el.style.direction = isRTL ? 'rtl' : 'ltr';
    }
  });

  console.log(
    `Assistente: Suporte RTL ${isRTL ? 'ativado' : 'desativado'} para o idioma ${language}`
  );

  return isRTL;
}
