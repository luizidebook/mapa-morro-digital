/**
 * Sistema unificado de vozes para o assistente virtual
 * Combina múltiplas fontes de síntese de voz para maior disponibilidade
 */

// Configurações globais
const SPEECH_TIMEOUT = 5000; // 5 segundos de timeout para operações de voz

// Sistema de Web Speech API nativa
const webSpeechVoices = {
  available: false,
  voices: [],

  getVoices: async () => {
    if (!('speechSynthesis' in window)) return [];

    // Espera as vozes carregarem com timeout
    if (speechSynthesis.getVoices().length === 0) {
      try {
        await Promise.race([
          new Promise((resolve) => {
            speechSynthesis.onvoiceschanged = resolve;
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout loading voices')), 3000)
          ),
        ]);
      } catch (e) {
        console.warn(
          'Timeout esperando vozes do navegador. Usando vozes disponíveis.'
        );
      }
    }

    const voices = speechSynthesis.getVoices();
    webSpeechVoices.voices = voices;
    webSpeechVoices.available = voices.length > 0;

    return voices;
  },

  speak: (text, lang, voiceId, rate, pitch, onStart, onEnd, onError) => {
    if (!('speechSynthesis' in window)) {
      if (onError) onError(new Error('SpeechSynthesis API não suportada'));
      return false;
    }

    try {
      // Cancelar qualquer fala em andamento
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate || 1;
      utterance.pitch = pitch || 1;

      // Encontrar a voz específica pelo ID
      if (voiceId) {
        const selectedVoice = webSpeechVoices.voices.find(
          (v) => v.voiceURI === voiceId || v.name === voiceId
        );
        if (selectedVoice) utterance.voice = selectedVoice;
      }

      // Workaround para bugs do Chrome com SpeechSynthesis
      const timeoutId = setTimeout(() => {
        speechSynthesis.pause();
        speechSynthesis.resume();
      }, 10000);

      // Callbacks de eventos
      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        clearTimeout(timeoutId);
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        clearTimeout(timeoutId);
        console.error('Erro na síntese de voz:', event);
        if (onError) onError(event);
      };

      speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Erro ao usar Web Speech API:', error);
      if (onError) onError(error);
      return false;
    }
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  },
};

// Sistema alternativo baseado em Google TTS
const googleTTS = {
  available: true,

  generateSpeechURL: function (text, lang = 'en') {
    // URL da API não oficial do Google Translate TTS
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  },

  speak: function (text, lang, rate, pitch, onStart, onEnd, onError) {
    try {
      // Limitar o texto devido às restrições da API
      const maxLength = 200;
      const chunks = [];

      if (text.length > maxLength) {
        // Dividir em chunks menores
        let remaining = text;
        while (remaining.length > 0) {
          // Encontrar um bom ponto para cortar (espaço, ponto, vírgula)
          let cutIndex = Math.min(maxLength, remaining.length);

          if (cutIndex < remaining.length) {
            const spaceIndex = remaining.lastIndexOf(' ', cutIndex);
            const periodIndex = remaining.lastIndexOf('.', cutIndex);
            const commaIndex = remaining.lastIndexOf(',', cutIndex);

            cutIndex = Math.max(
              spaceIndex !== -1 ? spaceIndex : 0,
              periodIndex !== -1 ? periodIndex + 1 : 0,
              commaIndex !== -1 ? commaIndex + 1 : 0
            );

            if (cutIndex <= 0) cutIndex = Math.min(maxLength, remaining.length);
          }

          chunks.push(remaining.substring(0, cutIndex).trim());
          remaining = remaining.substring(cutIndex).trim();
        }
      } else {
        chunks.push(text);
      }

      // Reproduzir o primeiro chunk e configurar uma cadeia para os outros
      if (chunks.length > 0) {
        let currentChunk = 0;

        const playNextChunk = () => {
          if (currentChunk >= chunks.length) {
            if (onEnd) onEnd();
            return;
          }

          const audio = new Audio();
          audio.src = this.generateSpeechURL(chunks[currentChunk], lang);

          // Apenas para o primeiro chunk
          if (currentChunk === 0 && onStart) onStart();

          audio.onended = () => {
            currentChunk++;
            playNextChunk();
          };

          audio.onerror = (e) => {
            console.error('Erro ao reproduzir chunk de áudio', e);
            currentChunk++;
            playNextChunk();
          };

          audio.play().catch((e) => {
            console.error('Erro ao iniciar playback', e);
            if (onError) onError(e);
          });
        };

        playNextChunk();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao usar Google TTS:', error);
      if (onError) onError(error);
      return false;
    }
  },

  stop: function () {
    // Encontrar e parar todos os elementos de áudio
    document.querySelectorAll('audio').forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  },
};

// Gerenciador principal que unifica os sistemas de voz
const voiceSystem = {
  initialized: false,
  currentVoice: null,
  currentLanguage: 'pt',
  rate: 1,
  pitch: 1,

  // Mapeamento de vozes preferidas por idioma
  preferredVoices: {
    pt: [
      'Google português do Brasil',
      'Microsoft Daniel',
      'Brazilian Portuguese Female',
    ],
    en: ['Google US English', 'Microsoft Mark', 'US English Female'],
    es: ['Google español', 'Microsoft Helena', 'Spanish Female'],
    he: ['Google עברית', 'Hebrew Female'],
  },

  /**
   * Inicializa o sistema de voz
   */
  init: async function () {
    if (this.initialized) return true;

    console.log('Inicializando sistema de voz...');

    try {
      // Carregar vozes do navegador
      await webSpeechVoices.getVoices();

      // Carregar configurações salvas
      this.loadUserPreferences();

      // Marcar como inicializado
      this.initialized = true;

      console.log(
        `Sistema de voz inicializado com ${webSpeechVoices.voices.length} vozes nativas`
      );
      return true;
    } catch (error) {
      console.error('Erro ao inicializar sistema de voz:', error);
      return false;
    }
  },

  /**
   * Retorna todas as vozes disponíveis
   */
  getAvailableVoices: function (language = null) {
    // Obter vozes da Web Speech API
    const voices = webSpeechVoices.voices.map((v) => ({
      id: v.voiceURI,
      name: v.name,
      lang: v.lang,
      source: 'native',
      default: v.default,
    }));

    // Adicionar vozes alternativas/fallback (Google TTS)
    const alternativeVoices = [
      {
        id: 'google_pt',
        name: 'Google Português',
        lang: 'pt',
        source: 'google',
      },
      { id: 'google_en', name: 'Google English', lang: 'en', source: 'google' },
      { id: 'google_es', name: 'Google Español', lang: 'es', source: 'google' },
      { id: 'google_he', name: 'Google עברית', lang: 'he', source: 'google' },
    ];

    const allVoices = [...voices, ...alternativeVoices];

    // Filtrar por idioma se especificado
    if (language) {
      const langPrefix = language.toLowerCase().split('-')[0];
      return allVoices.filter((voice) => {
        const voiceLang = voice.lang.toLowerCase().split('-')[0];
        return voiceLang === langPrefix;
      });
    }

    return allVoices;
  },

  /**
   * Reproduz texto com a voz selecionada
   */
  speak: function (text, language = null, voiceId = null) {
    if (!text) return false;

    // Inicializar se necessário
    if (!this.initialized) {
      console.warn('Sistema de voz não inicializado. Inicializando agora...');
      this.init().then(() => this.speak(text, language, voiceId));
      return false;
    }

    const lang = language || this.currentLanguage;
    const voice = voiceId || this.getVoiceForLanguage(lang);

    console.log(
      `Tentando sintetizar voz para: ${text} Idioma: ${lang} Voz: ${voice}`
    );

    // Indicadores visuais
    const onStart = () => {
      const speaking = document.createElement('div');
      speaking.id = 'assistant-speaking';
      speaking.className = 'assistant-speaking';
      speaking.innerHTML =
        '<div class="speaking-indicator"><span></span><span></span><span></span></div>';

      const assistantDialog = document.querySelector(
        '#assistant-dialog, .assistant-panel'
      );
      if (assistantDialog) {
        assistantDialog.appendChild(speaking);
        assistantDialog.classList.add('is-speaking');
      }

      document.dispatchEvent(new CustomEvent('assistant:speaking:start'));
    };

    const onEnd = () => {
      const speaking = document.getElementById('assistant-speaking');
      if (speaking) speaking.remove();

      const assistantDialog = document.querySelector(
        '#assistant-dialog, .assistant-panel'
      );
      if (assistantDialog) {
        assistantDialog.classList.remove('is-speaking');
      }

      document.dispatchEvent(new CustomEvent('assistant:speaking:end'));
    };

    const onError = (err) => {
      console.error('Erro na síntese de voz:', err);
      onEnd(); // Limpar indicadores
    };

    // Verificar se é uma voz nativa ou alternativa
    if (voice && voice.startsWith('google_')) {
      // Usar Google TTS
      const ttsLang = voice.replace('google_', '');
      return googleTTS.speak(
        text,
        ttsLang,
        this.rate,
        this.pitch,
        onStart,
        onEnd,
        onError
      );
    }

    // Tentar com Web Speech API
    const success = webSpeechVoices.speak(
      text,
      lang,
      voice,
      this.rate,
      this.pitch,
      onStart,
      onEnd,
      (err) => {
        console.warn('Falha na síntese nativa. Tentando alternativa:', err);

        // Fallback para Google TTS
        googleTTS.speak(
          text,
          lang,
          this.rate,
          this.pitch,
          onStart,
          onEnd,
          onError
        );
      }
    );

    return success;
  },

  /**
   * Método específico para falar em hebraico (com mais fallbacks)
   */
  speakHebrew: function (text) {
    console.log('Usando método especializado para hebraico:', text);

    // Status para UI
    const onStart = () => {
      const speaking = document.createElement('div');
      speaking.id = 'assistant-speaking';
      speaking.className = 'assistant-speaking';
      speaking.innerHTML =
        '<div class="speaking-indicator"><span></span><span></span><span></span></div>';

      const assistantDialog = document.querySelector(
        '#assistant-dialog, .assistant-panel'
      );
      if (assistantDialog) {
        assistantDialog.appendChild(speaking);
        assistantDialog.classList.add('is-speaking');
      }

      document.dispatchEvent(new CustomEvent('assistant:speaking:start'));
    };

    const onEnd = () => {
      const speaking = document.getElementById('assistant-speaking');
      if (speaking) speaking.remove();

      const assistantDialog = document.querySelector(
        '#assistant-dialog, .assistant-panel'
      );
      if (assistantDialog) {
        assistantDialog.classList.remove('is-speaking');
      }

      document.dispatchEvent(new CustomEvent('assistant:speaking:end'));
    };

    const onError = (err) => {
      console.error('Erro na síntese de voz para hebraico:', err);
      onEnd(); // Limpar indicadores
    };

    // Tentar diretamente com Google TTS
    return googleTTS.speak(
      text,
      'he',
      this.rate,
      this.pitch,
      onStart,
      onEnd,
      onError
    );
  },

  /**
   * Para qualquer síntese de voz em andamento
   */
  stop: function () {
    webSpeechVoices.stop();
    googleTTS.stop();
  },

  /**
   * Define o idioma atual
   */
  setLanguage: function (language) {
    if (!language) return;

    this.currentLanguage = language;
    console.log(`Idioma do sistema de voz alterado para: ${language}`);

    // Selecionar voz apropriada para o idioma
    this.currentVoice = this.getVoiceForLanguage(language);
  },

  /**
   * Seleciona a melhor voz disponível para o idioma
   */
  getVoiceForLanguage: function (language) {
    // Verificar se há uma preferência salva
    const savedVoice = localStorage.getItem(`voice_preference_${language}`);
    if (savedVoice) return savedVoice;

    // Obter lista de vozes para o idioma
    const langVoices = this.getAvailableVoices(language);

    // Se não houver vozes para este idioma, usar Google TTS
    if (langVoices.length === 0) {
      return `google_${language.split('-')[0]}`;
    }

    // Verificar lista de vozes preferidas
    const preferredList = this.preferredVoices[language.split('-')[0]] || [];

    // Procurar na lista de preferidas
    for (const preferred of preferredList) {
      const match = langVoices.find(
        (v) => v.name.includes(preferred) || v.id.includes(preferred)
      );
      if (match) return match.id;
    }

    // Usar a primeira disponível
    return langVoices[0].id;
  },

  /**
   * Salva preferências de voz
   */
  saveVoicePreference: function (language, voiceId) {
    this.currentVoice = voiceId;
    localStorage.setItem(`voice_preference_${language}`, voiceId);
    console.log(`Preferência de voz salva: ${language} = ${voiceId}`);
  },

  /**
   * Salva configurações de taxa e tom
   */
  saveRateAndPitch: function (rate, pitch) {
    this.rate = rate;
    this.pitch = pitch;
    localStorage.setItem('voice_rate', rate);
    localStorage.setItem('voice_pitch', pitch);
    console.log(`Configurações de voz salvas: rate=${rate}, pitch=${pitch}`);
  },

  /**
   * Carrega preferências do usuário
   */
  loadUserPreferences: function () {
    // Carregar idioma
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }

    // Carregar voz
    const savedVoice = localStorage.getItem(
      `voice_preference_${this.currentLanguage}`
    );
    if (savedVoice) {
      this.currentVoice = savedVoice;
    } else {
      this.currentVoice = this.getVoiceForLanguage(this.currentLanguage);
    }

    // Carregar rate e pitch
    const savedRate = localStorage.getItem('voice_rate');
    if (savedRate) {
      this.rate = parseFloat(savedRate);
    }

    const savedPitch = localStorage.getItem('voice_pitch');
    if (savedPitch) {
      this.pitch = parseFloat(savedPitch);
    }

    console.log(
      `Preferências de voz carregadas: idioma=${this.currentLanguage}, voz=${this.currentVoice}, rate=${this.rate}, pitch=${this.pitch}`
    );
  },
};

export default voiceSystem;
