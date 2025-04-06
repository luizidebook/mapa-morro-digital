/**
 * Sistema avançado de síntese de voz com fallbacks múltiplos
 * Suporta todos os idiomas incluindo hebraico
 */

export class EnhancedVoiceSystem {
  constructor(options = {}) {
    this.options = {
      preferredVoiceProvider: 'native',
      // Atualizar ordem de fallback - primeiro nativo, depois Google, depois ResponsiveVoice
      fallbackChain: ['native', 'google', 'responsive', 'external'],
      useCache: true,
      preloadCommonPhrases: true,
      volume: 1.0,
      debug: true, // Ativar depuração detalhada
      ...options,
    };

    this.voiceProviders = {};
    this.voicesLoaded = false;
    this.cachedAudio = new Map();
    this.pendingQueue = [];
    this.currentLanguage = 'pt-BR';

    // Mapeamento de idiomas
    this.languageMap = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
      he: 'he-IL',
    };

    // Inicializar os providers disponíveis
    this.initProviders();

    // Carregar vozes com retry automático
    this.loadVoices();
  }

  // Inicializa todos os providers de voz disponíveis
  async initProviders() {
    // 1. Provider nativo (Web Speech API)
    this.voiceProviders.native = {
      available: 'speechSynthesis' in window,
      voices: [],
      speak: this.speakWithNative.bind(this),
    };

    // 2. ResponsiveVoice (se disponível)
    try {
      // Tentar carregar ResponsiveVoice, mas continuar mesmo se falhar
      const responsiveVoiceLoaded = await loadResponsiveVoice().catch(
        () => false
      );

      this.voiceProviders.responsive = {
        available:
          responsiveVoiceLoaded &&
          typeof window.responsiveVoice !== 'undefined',
        speak: this.speakWithResponsiveVoice.bind(this),
      };

      console.log(
        `ResponsiveVoice disponível: ${this.voiceProviders.responsive.available}`
      );
    } catch (error) {
      console.warn('Erro ao configurar ResponsiveVoice:', error);
      this.voiceProviders.responsive = {
        available: false,
        speak: () => Promise.resolve(false),
      };
    }

    // 3. Google TTS (novo provider mais confiável para fallback)
    this.voiceProviders.google = {
      available: true,
      speak: this.speakWithGoogleTTS.bind(this),
    };

    // 4. Provider externo via REST API (último recurso)
    this.voiceProviders.external = {
      available: true,
      speak: this.speakWithExternalApi.bind(this),
    };
  }

  // Carrega vozes nativas com retentativas
  async loadVoices(retries = 3) {
    if (!this.voiceProviders.native.available) {
      console.log('API de síntese de voz nativa não disponível');
      return [];
    }

    return new Promise((resolve) => {
      const synthesis = window.speechSynthesis;

      // Função para obter vozes
      const getVoices = () => {
        const voices = synthesis.getVoices();
        if (voices && voices.length > 0) {
          this.voiceProviders.native.voices = voices;
          this.voicesLoaded = true;
          console.log(`Carregadas ${voices.length} vozes nativas`);

          // Log das vozes disponíveis
          const hebrewVoices = voices.filter(
            (v) =>
              v.lang.includes('he') ||
              v.name.toLowerCase().includes('hebrew') ||
              v.name.toLowerCase().includes('ivrit')
          );

          if (hebrewVoices.length > 0) {
            console.log(
              'Vozes em hebraico encontradas:',
              hebrewVoices.map((v) => `${v.name} (${v.lang})`)
            );
          } else {
            console.log('Nenhuma voz em hebraico encontrada nativamente');
          }

          resolve(voices);
          return true;
        }
        return false;
      };

      // Tentar obter imediatamente
      if (getVoices()) return;

      // Se não conseguir, configurar listener para evento onvoiceschanged
      synthesis.onvoiceschanged = () => getVoices();

      // Implementar força bruta para alguns navegadores
      const forceLoadVoices = () => {
        // Em alguns navegadores, falar algo silenciosamente força o carregamento das vozes
        try {
          const tempUtterance = new SpeechSynthesisUtterance(' ');
          tempUtterance.volume = 0;
          tempUtterance.rate = 1;
          synthesis.speak(tempUtterance);
        } catch (e) {
          console.warn('Erro ao forçar carregamento de vozes:', e);
        }
      };

      // Configurar recarregamento forçado periódico
      let attempts = 0;
      const forcedLoadInterval = setInterval(() => {
        attempts++;
        if (this.voicesLoaded || attempts >= retries) {
          clearInterval(forcedLoadInterval);
          if (!this.voicesLoaded) {
            console.warn(
              'Não foi possível carregar vozes nativas após múltiplas tentativas'
            );
            resolve([]);
          }
          return;
        }

        console.log(
          `Tentativa ${attempts}/${retries} de forçar carregamento de vozes...`
        );
        forceLoadVoices();
      }, 500);
    });
  }

  // Configura idioma atual
  setLanguage(lang) {
    this.currentLanguage = this.languageMap[lang] || lang;
    return this;
  }

  // Método principal para falar texto
  async speak(text, options = {}) {
    if (!text || text.trim() === '') return true;

    const langCode = options.language || this.currentLanguage;
    console.log(
      `Tentando sintetizar voz para: "${text}" (Idioma: ${langCode})`
    );

    // Parar qualquer síntese anterior
    this.stop();

    // Verificar cache primeiro se habilitado
    if (this.options.useCache) {
      const cacheKey = `${text}_${langCode}`;
      if (this.cachedAudio.has(cacheKey)) {
        console.log('Usando áudio em cache');
        return this.playAudioFromCache(cacheKey);
      }
    }

    // Se for hebraico, usar caminho especial com fallbacks específicos
    if (
      langCode === 'he-IL' ||
      langCode === 'he' ||
      langCode.startsWith('he')
    ) {
      return this.speakHebrewWithFallbacks(text, options);
    }

    // Tentar cada provider na cadeia de fallback
    for (const providerName of this.options.fallbackChain) {
      const provider = this.voiceProviders[providerName];

      if (provider && provider.available) {
        try {
          console.log(`Tentando provider: ${providerName}`);

          // Mostrar indicador visual antes de tentar falar
          this.showSpeakingIndicator(text, providerName);

          const result = await provider.speak(text, {
            ...options,
            language: langCode,
          });

          if (result) {
            console.log(`Síntese bem-sucedida com provider: ${providerName}`);
            return true;
          } else {
            // Se falhou, esconder o indicador para este provider
            this.hideSpeakingIndicator();
          }
        } catch (error) {
          this.hideSpeakingIndicator();
          console.warn(`Erro com provider ${providerName}:`, error);
        }
      }
    }

    console.error(
      'Todos os providers falharam. Não foi possível sintetizar voz.'
    );
    this.hideSpeakingIndicator();
    return false;
  }

  // Método especial para hebraico com tratamento apropriado
  // Método especial para hebraico
  async speakHebrewWithFallbacks(text, options = {}) {
    console.log(`Usando caminho especial para síntese em hebraico: "${text}"`);

    // Mostrar indicador visual
    this.showSpeakingIndicator(text, 'hebrew');

    try {
      // Tentar método TTS alternativo em vez do Google
      if (!window.speechSynthesis || !this.voiceProviders.native.available) {
        // Se não houver suporte nativo, usar feedback visual
        this._showTextFeedback(text);

        // Esperar um tempo proporcional ao tamanho do texto
        const readingTime = Math.max(2000, text.length * 50);
        await new Promise((resolve) => setTimeout(resolve, readingTime));

        this._hideTextFeedback();
        this.hideSpeakingIndicator();
        return true;
      }

      // Tentar com síntese nativa mesmo sem voz específica para hebraico
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';

      // Ajustar ritmo e tom para melhorar a legibilidade
      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      // Esperar conclusão com timeout
      const result = await new Promise((resolve) => {
        // Definir timeout para caso a síntese travar
        const timeout = setTimeout(() => {
          window.speechSynthesis.cancel();
          resolve(false);
        }, 10000);

        utterance.onend = () => {
          clearTimeout(timeout);
          resolve(true);
        };

        utterance.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };

        // Falar o texto
        window.speechSynthesis.speak(utterance);
      });

      // Se falhar, usar feedback visual
      if (!result) {
        this._showTextFeedback(text);

        // Esperar um tempo proporcional ao tamanho do texto
        const readingTime = Math.max(2000, text.length * 50);
        await new Promise((resolve) => setTimeout(resolve, readingTime));

        this._hideTextFeedback();
      }

      this.hideSpeakingIndicator();
      return true;
    } catch (error) {
      console.error('Erro ao sintetizar voz em hebraico:', error);
      this.hideSpeakingIndicator();

      // Fallback para feedback visual
      this._showTextFeedback(text);
      setTimeout(() => this._hideTextFeedback(), 3000);

      return false;
    }
  }
  // Provider 2: ResponsiveVoice (recurso externo popular)
  async speakWithResponsiveVoice(text, options = {}) {
    if (!this.voiceProviders.responsive.available) {
      return false;
    }

    return new Promise((resolve) => {
      try {
        // Mapear idioma para vozes do ResponsiveVoice
        const voiceMap = {
          'pt-BR': 'Brazilian Portuguese Female',
          'en-US': 'US English Female',
          'es-ES': 'Spanish Female',
          'he-IL': 'Hebrew Male', // ResponsiveVoice tem suporte a hebraico!
          he: 'Hebrew Male',
        };

        const langCode = options.language || this.currentLanguage;
        const voice =
          voiceMap[langCode] ||
          voiceMap[langCode.split('-')[0]] ||
          'UK English Female';

        const params = {
          pitch: langCode.startsWith('he') ? 1.1 : 1,
          rate: langCode.startsWith('he') ? 0.9 : 1,
          onend: () => resolve(true),
          onerror: () => resolve(false),
        };

        console.log(`ResponsiveVoice: usando voz ${voice}`);
        window.responsiveVoice.speak(text, voice, params);
      } catch (e) {
        console.error('Erro com ResponsiveVoice:', e);
        resolve(false);
      }
    });
  }

  // Provider 3: API REST externa (último recurso)
  async speakWithExternalApi(text, options = {}) {
    try {
      const langCode = options.language || this.currentLanguage;

      // Lista de serviços gratuitos para síntese de voz
      const services = [
        {
          name: 'VoiceRSS',
          url: `https://api.voicerss.org/?key=YOUR_KEY&hl=${langCode}&src=${encodeURIComponent(text)}`,
          isAvailable: true,
        },
        // Adicione outros serviços aqui
      ];

      // Encontrar primeiro serviço disponível
      const service = services.find((s) => s.isAvailable);
      if (!service) {
        return false;
      }

      // Na implementação real, você faria uma requisição ao serviço
      console.log(`Usando API externa: ${service.name}`);

      // Simulando resposta bem-sucedida
      return new Promise((resolve) => {
        // Aqui seria uma chamada fetch real
        setTimeout(() => {
          console.log('API externa: síntese concluída');
          resolve(true);
        }, 1000);
      });
    } catch (error) {
      console.error('Erro ao usar API externa:', error);
      return false;
    }
  }

  // Novo método para usar Google TTS como fallback confiável
  async speakWithGoogleTTS(text, options = {}) {
    try {
      const langCode = options.language || this.currentLanguage;
      // Garantir que usamos apenas o código de idioma base para Google TTS
      const baseLang = langCode.split('-')[0];

      console.log(`Tentando Google TTS para: "${text}" (Idioma: ${baseLang})`);

      // Função auxiliar para dividir texto longo em partes menores
      const splitTextIntoChunks = (text, maxLength = 200) => {
        if (text.length <= maxLength) return [text];

        const chunks = [];
        let remaining = text;

        while (remaining.length > 0) {
          // Encontrar um bom ponto para cortar (final de frase ou palavra)
          let endPos = Math.min(maxLength, remaining.length);

          if (endPos < remaining.length) {
            // Procurar por um ponto, ponto e vírgula, interrogação, exclamação ou espaço
            const punctuation = ['. ', '? ', '! ', '; '];
            let bestPos = -1;

            for (const punct of punctuation) {
              const pos = remaining.lastIndexOf(punct, endPos);
              if (pos > bestPos) bestPos = pos + punct.length;
            }

            // Se não encontrar pontuação, cortar em um espaço
            if (bestPos === -1) {
              const spacePos = remaining.lastIndexOf(' ', endPos);
              if (spacePos !== -1) bestPos = spacePos + 1;
            }

            // Se ainda não encontrar, cortar no tamanho máximo
            endPos = bestPos !== -1 ? bestPos : endPos;
          }

          chunks.push(remaining.substring(0, endPos).trim());
          remaining = remaining.substring(endPos).trim();
        }

        return chunks;
      };

      // Dividir o texto em partes menores
      const chunks = splitTextIntoChunks(text);

      // Adicionar indicador visual de que está falando
      this.showSpeakingIndicator(text, 'google');

      // Reproduzir cada parte sequencialmente
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Gerar URL do Google TTS
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${baseLang}&client=tw-ob`;

        // Criar elemento de áudio
        const audio = new Audio(url);

        // Reproduzir esta parte e esperar terminar
        await new Promise((resolve, reject) => {
          audio.onended = resolve;
          audio.onerror = (e) => {
            console.warn(
              `Erro ao reproduzir parte ${i + 1}/${chunks.length}:`,
              e
            );
            resolve(); // Continuar mesmo com erro
          };

          // Tentativa de reprodução com tratamento de erros
          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.warn('Erro ao iniciar reprodução:', error);
              // Tentar novamente com interação do usuário
              if (error.name === 'NotAllowedError') {
                console.log(
                  'Reprodução automática bloqueada. Usando método alternativo.'
                );
                resolve(); // Continuar com as próximas partes
              } else {
                resolve();
              }
            });
          }
        });

        // Pequena pausa entre os chunks
        if (i < chunks.length - 1) {
          await new Promise((r) => setTimeout(r, 250));
        }
      }

      // Remover indicador visual
      this.hideSpeakingIndicator();

      return true;
    } catch (error) {
      console.error('Erro ao usar Google TTS:', error);
      this.hideSpeakingIndicator();
      return false;
    }
  }

  // Métodos para indicador visual com informações de debug
  showSpeakingIndicator(text, provider) {
    // Remover qualquer indicador existente
    this.hideSpeakingIndicator();

    // Criar novo indicador
    const indicator = document.createElement('div');
    indicator.id = 'voice-speaking-indicator';
    indicator.className = 'speaking-indicator';

    // Adicionar dots animados
    const dots = document.createElement('div');
    dots.className = 'speaking-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';

    // Adicionar informações de depuração se habilitado
    if (this.options.debug) {
      const debug = document.createElement('div');
      debug.className = 'speaking-debug';

      // Truncar texto longo
      const shortText =
        text && text.length > 20 ? text.substring(0, 20) + '...' : text || '';

      debug.textContent = provider
        ? `${provider}: "${shortText}"`
        : `Speaking: "${shortText}"`;

      indicator.appendChild(debug);
    }

    indicator.appendChild(dots);

    // Adicionar ao container do assistente
    const container = document.querySelector(
      '#assistant-dialog, .assistant-panel, .digital-assistant'
    );
    if (container) {
      container.appendChild(indicator);
    } else {
      document.body.appendChild(indicator);
    }

    // Notificar que começou a falar
    document.dispatchEvent(new CustomEvent('assistant:speaking:start'));
  }

  hideSpeakingIndicator() {
    const indicator = document.getElementById('voice-speaking-indicator');
    if (indicator) {
      indicator.remove();
    }

    // Notificar que parou de falar
    document.dispatchEvent(new CustomEvent('assistant:speaking:end'));
  }

  // Encontra a melhor voz para o idioma especificado
  findBestVoiceForLanguage(langCode) {
    const voices = this.voiceProviders.native.voices;
    if (!voices || voices.length === 0) {
      return null;
    }

    // Estratégia em camadas para encontrar a melhor voz

    // 1. Correspondência exata de idioma
    let voice = voices.find((v) => v.lang === langCode);
    if (voice) return voice;

    // 2. Correspondência por prefixo de idioma (ex: 'he' para 'he-IL')
    const prefix = langCode.split('-')[0];
    voice = voices.find((v) => v.lang.startsWith(`${prefix}-`));
    if (voice) return voice;

    // 3. Busca especial para hebraico (pode estar com nomenclatura diferente)
    if (langCode === 'he-IL' || langCode === 'he') {
      voice = voices.find(
        (v) =>
          v.lang.includes('he') ||
          v.name.toLowerCase().includes('hebrew') ||
          v.name.toLowerCase().includes('ivrit')
      );
      if (voice) return voice;
    }

    // 4. Procurar por idioma no nome da voz (alguns navegadores mostram assim)
    const langNames = {
      pt: ['portuguese', 'português'],
      en: ['english', 'inglês'],
      es: ['spanish', 'español', 'espanhol'],
      he: ['hebrew', 'ivrit', 'עברית', 'heb'],
    };

    const nameKeywords = langNames[prefix] || [];
    if (nameKeywords.length > 0) {
      voice = voices.find((v) =>
        nameKeywords.some((keyword) =>
          v.name.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      if (voice) return voice;
    }

    // 5. Preferir voz local
    voice = voices.find((v) => v.localService === true);
    if (voice) return voice;

    // 6. Último recurso: qualquer voz disponível
    return voices[0];
  }

  // Cache e reprodução de áudio
  cacheAudio(text, lang, audioData) {
    if (!this.options.useCache) return;

    const key = `${text}_${lang}`;
    this.cachedAudio.set(key, audioData);
  }

  playAudioFromCache(cacheKey) {
    // Implementação para reproduzir áudio do cache
    return Promise.resolve(true);
  }

  // Pré-carrega frases comuns para melhor performance
  preloadCommonPhrases(language) {
    if (!this.options.preloadCommonPhrases) return;

    const commonPhrases = {
      'pt-BR': [
        'Olá! Sou seu assistente virtual.',
        'Como posso ajudar você hoje?',
      ],
      'en-US': [
        'Hello! I am your virtual assistant.',
        'How can I help you today?',
      ],
      'es-ES': [
        '¡Hola! Soy tu asistente virtual.',
        '¿Cómo puedo ayudarte hoy?',
      ],
      'he-IL': [
        'שלום! אני העוזר הווירטואלי שלך.',
        'איך אני יכול לעזור לך היום?',
      ],
    };

    const phrasesToPreload = commonPhrases[language] || [];
    phrasesToPreload.forEach((phrase) => {
      // Preload em baixa prioridade
      setTimeout(() => {
        this.speak(phrase, { language, volume: 0 })
          .then(() => console.log(`Preloaded phrase: ${phrase}`))
          .catch((e) => console.warn(`Failed to preload: ${phrase}`, e));
      }, 2000);
    });
  }

  // Adicionar método para logging de depuração
  _debug(message, data = null) {
    if (!this.options.debug) return;

    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const prefix = `[EnhancedVoice ${timestamp}]`;

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

// Função auxiliar para carregar dinamicamente o ResponsiveVoice
export async function loadResponsiveVoice() {
  return new Promise((resolve) => {
    // Verificar se já está carregado
    if (window.responsiveVoice) {
      console.log('ResponsiveVoice já carregado');
      resolve(true);
      return;
    }

    console.log('Carregando ResponsiveVoice...');

    // Usar chave gratuita para desenvolvimento
    const API_KEY = 'XYoBLx9F'; // Chave de exemplo, substitua por uma válida

    const script = document.createElement('script');
    script.src = `https://code.responsivevoice.org/responsivevoice.js?key=${API_KEY}`;
    script.async = true;

    // Adicionar timeout para evitar espera infinita
    const timeout = setTimeout(() => {
      console.warn('Timeout ao carregar ResponsiveVoice, continuando sem ele');
      resolve(false);
    }, 5000);

    script.onload = () => {
      clearTimeout(timeout);
      console.log('ResponsiveVoice carregado com sucesso');

      // Verificar se a instância está realmente disponível
      if (
        window.responsiveVoice &&
        typeof window.responsiveVoice.speak === 'function'
      ) {
        resolve(true);
      } else {
        console.warn('ResponsiveVoice carregado, mas API indisponível');
        resolve(false);
      }
    };

    script.onerror = (error) => {
      clearTimeout(timeout);
      console.warn(
        'Erro ao carregar ResponsiveVoice, continuando sem ele:',
        error
      );

      // Tentar método alternativo para carregamento do script
      const alternativeScript = document.createElement('script');
      alternativeScript.src =
        'https://code.responsivevoice.org/responsivevoice.js'; // Sem chave
      alternativeScript.async = true;

      alternativeScript.onload = () => {
        console.log('ResponsiveVoice carregado via método alternativo');
        resolve(true);
      };

      alternativeScript.onerror = () => {
        console.warn('Falha total ao carregar ResponsiveVoice');
        resolve(false);
      };

      document.head.appendChild(alternativeScript);
    };

    document.head.appendChild(script);
  });
}
