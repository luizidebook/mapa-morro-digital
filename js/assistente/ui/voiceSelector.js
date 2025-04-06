/**
 * Componente de seleção de vozes para o assistente virtual
 */

import voiceSystem from '../voice/voiceSystem.js';
import { getAssistantText } from '../language/translations.js';

// Classe para gerenciar o seletor de vozes
export default class VoiceSelector {
  constructor() {
    this.initialized = false;
    this.voicesLoaded = false;
    this.currentLanguage = 'pt';
  }

  /**
   * Inicializa o seletor de vozes
   */
  async init(language = 'pt') {
    if (this.initialized) return;

    this.currentLanguage = language;

    try {
      // Garantir que o sistema de vozes está inicializado
      await voiceSystem.init();

      // Adicionar botão de configuração ao lado do botão de voz
      this.createVoiceSettingsButton();

      // Preparar o modal de seleção de vozes
      this.createVoiceSelectionModal();

      // Registrar event listeners
      this.registerEventListeners();

      this.initialized = true;

      // Se o idioma mudar, atualizar as vozes disponíveis
      document.addEventListener('language:changed', (e) => {
        this.updateVoiceOptions(e.detail?.language || 'pt');
      });

      console.log('VoiceSelector inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar VoiceSelector:', error);
    }
  }

  /**
   * Cria o botão de configurações de voz
   */
  createVoiceSettingsButton() {
    const voiceBtn = document.getElementById('assistant-voice-btn');
    if (!voiceBtn) {
      console.warn(
        'Botão de voz não encontrado para adicionar botão de configurações'
      );
      return;
    }

    // Verificar se o botão já existe
    if (document.getElementById('assistant-voice-settings-btn')) {
      return;
    }

    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'assistant-voice-settings-btn';
    settingsBtn.className = 'assistant-btn voice-settings-btn';
    settingsBtn.setAttribute(
      'aria-label',
      getAssistantText('voice_settings_button', this.currentLanguage)
    );
    settingsBtn.innerHTML = '<i class="fas fa-sliders-h"></i>';

    // Inserir após o botão de voz
    voiceBtn.parentNode.insertBefore(settingsBtn, voiceBtn.nextSibling);
  }

  /**
   * Cria o modal de seleção de vozes
   */
  createVoiceSelectionModal() {
    // Verificar se já existe
    if (document.getElementById('voice-settings-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'voice-settings-modal';
    modal.className = 'assistant-modal';

    // Buscar textos traduzidos
    const title =
      getAssistantText('voice_settings_title', this.currentLanguage) ||
      'Voice Settings';
    const selectVoice =
      getAssistantText('select_voice', this.currentLanguage) ||
      'Select a voice';
    const previewVoice =
      getAssistantText('preview_voice', this.currentLanguage) || 'Test voice';
    const speechRate =
      getAssistantText('speech_rate', this.currentLanguage) || 'Speech rate';
    const speechPitch =
      getAssistantText('speech_pitch', this.currentLanguage) || 'Voice pitch';
    const saveSettings =
      getAssistantText('save_settings', this.currentLanguage) ||
      'Save settings';

    // Estrutura do modal
    modal.innerHTML = `
      <div class="assistant-modal-content">
        <div class="assistant-modal-header">
          <h3>${title}</h3>
          <button class="assistant-modal-close">×</button>
        </div>
        <div class="assistant-modal-body">
          <div class="voice-settings-section">
            <label for="voice-selector">${selectVoice}</label>
            <select id="voice-selector" class="voice-selector">
              <option value="">Carregando vozes...</option>
            </select>
          </div>
          
          <div class="voice-preview-section">
            <button id="preview-voice-btn" class="assistant-btn preview-btn">
              <i class="fas fa-play"></i> ${previewVoice}
            </button>
          </div>
          
          <div class="voice-rate-section">
            <label for="voice-rate">${speechRate}</label>
            <input type="range" id="voice-rate" min="0.5" max="2" step="0.1" value="1">
            <span id="rate-value">1.0</span>
          </div>
          
          <div class="voice-pitch-section">
            <label for="voice-pitch">${speechPitch}</label>
            <input type="range" id="voice-pitch" min="0.5" max="2" step="0.1" value="1">
            <span id="pitch-value">1.0</span>
          </div>
        </div>
        <div class="assistant-modal-footer">
          <button id="save-voice-settings" class="assistant-btn primary-btn">
            ${saveSettings}
          </button>
        </div>
      </div>
    `;

    // Adicionar ao documento
    document.body.appendChild(modal);
  }

  /**
   * Registra os event listeners
   */
  registerEventListeners() {
    try {
      // Abrir modal de configurações
      const settingsBtn = document.getElementById(
        'assistant-voice-settings-btn'
      );
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () =>
          this.openVoiceSettingsModal()
        );
      }

      // Fechar modal
      const closeBtn = document.querySelector('.assistant-modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () =>
          this.closeVoiceSettingsModal()
        );
      }

      // Clicar fora do modal para fechar
      const modal = document.getElementById('voice-settings-modal');
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeVoiceSettingsModal();
          }
        });
      }

      // Ouvir mudanças no seletor de voz
      const voiceSelector = document.getElementById('voice-selector');
      if (voiceSelector) {
        voiceSelector.addEventListener('change', () => {
          const selectedVoice = voiceSelector.value;
          if (selectedVoice) {
            // Preview automático quando a voz muda
            this.previewVoice(selectedVoice);
          }
        });
      }

      // Botão de preview
      const previewBtn = document.getElementById('preview-voice-btn');
      if (previewBtn) {
        previewBtn.addEventListener('click', () => {
          const voiceSelector = document.getElementById('voice-selector');
          if (voiceSelector && voiceSelector.value) {
            this.previewVoice(voiceSelector.value);
          }
        });
      }

      // Salvar configurações
      const saveBtn = document.getElementById('save-voice-settings');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          this.saveVoiceSettings();
          this.closeVoiceSettingsModal();
        });
      }

      // Atualizar valores de rate e pitch
      const rateInput = document.getElementById('voice-rate');
      const rateValue = document.getElementById('rate-value');
      if (rateInput && rateValue) {
        rateInput.addEventListener('input', () => {
          rateValue.textContent = parseFloat(rateInput.value).toFixed(1);
        });
      }

      const pitchInput = document.getElementById('voice-pitch');
      const pitchValue = document.getElementById('pitch-value');
      if (pitchInput && pitchValue) {
        pitchInput.addEventListener('input', () => {
          pitchValue.textContent = parseFloat(pitchInput.value).toFixed(1);
        });
      }
    } catch (error) {
      console.error(
        'Erro ao registrar event listeners do VoiceSelector:',
        error
      );
    }
  }

  /**
   * Abre o modal de configurações de voz
   */
  openVoiceSettingsModal() {
    const modal = document.getElementById('voice-settings-modal');
    if (!modal) return;

    // Garantir que as vozes estão carregadas
    if (!this.voicesLoaded) {
      this.loadVoiceOptions();
    }

    // Selecionar a voz atual
    const voiceSelector = document.getElementById('voice-selector');
    if (voiceSelector) {
      const currentVoice = voiceSystem.currentVoice;
      if (
        currentVoice &&
        voiceSelector.querySelector(`option[value="${currentVoice}"]`)
      ) {
        voiceSelector.value = currentVoice;
      }
    }

    // Carregar preferências salvas
    this.loadSavedPreferences();

    modal.style.display = 'block';
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  /**
   * Fecha o modal de configurações de voz
   */
  closeVoiceSettingsModal() {
    const modal = document.getElementById('voice-settings-modal');
    if (!modal) return;

    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }

  /**
   * Carrega as opções de vozes disponíveis
   */
  async loadVoiceOptions() {
    if (this.voicesLoaded) return;

    try {
      await voiceSystem.init();

      const voiceSelector = document.getElementById('voice-selector');
      if (!voiceSelector) return;

      // Limpar opções atuais
      voiceSelector.innerHTML = '';

      // Obter vozes para o idioma atual
      const voices = voiceSystem.getAvailableVoices(this.currentLanguage);

      if (voices.length === 0) {
        // Se não houver vozes específicas, adicionar mensagem
        const option = document.createElement('option');
        option.value = '';
        option.textContent = `Nenhuma voz disponível para ${this.getLanguageName(this.currentLanguage)}`;
        voiceSelector.appendChild(option);

        // Adicionar a opção do Google TTS como fallback
        const googleOption = document.createElement('option');
        googleOption.value = `google_${this.currentLanguage.split('-')[0]}`;
        googleOption.textContent = `Google TTS (${this.getLanguageName(this.currentLanguage)})`;
        voiceSelector.appendChild(googleOption);
      } else {
        // Adicionar as vozes encontradas
        voices.forEach((voice) => {
          const option = document.createElement('option');
          option.value = voice.id;
          option.textContent = `${voice.name} ${voice.source === 'native' ? '(Sistema)' : '(Online)'}`;
          voiceSelector.appendChild(option);
        });
      }

      // Selecionar a voz atual
      const currentVoice = voiceSystem.currentVoice;
      if (currentVoice) {
        voiceSelector.value = currentVoice;
      }

      this.voicesLoaded = true;
    } catch (error) {
      console.error('Erro ao carregar opções de voz:', error);

      // Criar opção de fallback
      const voiceSelector = document.getElementById('voice-selector');
      if (voiceSelector) {
        voiceSelector.innerHTML = '';
        const option = document.createElement('option');
        option.value = `google_${this.currentLanguage.split('-')[0]}`;
        option.textContent = `Google TTS (${this.getLanguageName(this.currentLanguage)})`;
        voiceSelector.appendChild(option);
      }
    }
  }

  /**
   * Carrega preferências de voz salvas
   */
  loadSavedPreferences() {
    // Rate (velocidade)
    const savedRate = localStorage.getItem('voice_rate') || 1;
    const rateInput = document.getElementById('voice-rate');
    const rateValue = document.getElementById('rate-value');

    if (rateInput && rateValue) {
      rateInput.value = savedRate;
      rateValue.textContent = parseFloat(savedRate).toFixed(1);
    }

    // Pitch (tom)
    const savedPitch = localStorage.getItem('voice_pitch') || 1;
    const pitchInput = document.getElementById('voice-pitch');
    const pitchValue = document.getElementById('pitch-value');

    if (pitchInput && pitchValue) {
      pitchInput.value = savedPitch;
      pitchValue.textContent = parseFloat(savedPitch).toFixed(1);
    }
  }

  /**
   * Salva as configurações de voz
   */
  saveVoiceSettings() {
    try {
      const voiceSelector = document.getElementById('voice-selector');
      const rateInput = document.getElementById('voice-rate');
      const pitchInput = document.getElementById('voice-pitch');

      // Salvar voz
      if (voiceSelector && voiceSelector.value) {
        voiceSystem.saveVoicePreference(
          this.currentLanguage,
          voiceSelector.value
        );
      }

      // Salvar rate e pitch
      if (rateInput && pitchInput) {
        const rate = parseFloat(rateInput.value);
        const pitch = parseFloat(pitchInput.value);
        voiceSystem.saveRateAndPitch(rate, pitch);
      }

      // Notificar que as configurações foram salvas
      document.dispatchEvent(new CustomEvent('voice:settings:updated'));

      console.log('Configurações de voz salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações de voz:', error);
    }
  }

  /**
   * Faz um preview da voz selecionada
   */
  previewVoice(voiceId) {
    if (!voiceId) return;

    // Parar qualquer fala em andamento
    voiceSystem.stop();

    // Obter texto de exemplo no idioma atual
    const previewText =
      getAssistantText('voice_preview_text', this.currentLanguage) ||
      'Esta é uma amostra de como esta voz soará no assistente virtual.';

    // Reproduzir texto de exemplo
    voiceSystem.speak(previewText, this.currentLanguage, voiceId);
  }

  /**
   * Atualiza as opções de voz quando o idioma muda
   */
  updateVoiceOptions(language) {
    if (!language) return;

    this.currentLanguage = language;
    this.voicesLoaded = false;

    // Recarregar textos da interface
    try {
      const elements = {
        title: '.assistant-modal-header h3',
        selectVoice: 'label[for="voice-selector"]',
        previewVoice: '#preview-voice-btn',
        speechRate: 'label[for="voice-rate"]',
        speechPitch: 'label[for="voice-pitch"]',
        saveSettings: '#save-voice-settings',
      };

      for (const [key, selector] of Object.entries(elements)) {
        const element = document.querySelector(selector);
        if (!element) continue;

        const translationKey = {
          title: 'voice_settings_title',
          selectVoice: 'select_voice',
          previewVoice: 'preview_voice',
          speechRate: 'speech_rate',
          speechPitch: 'speech_pitch',
          saveSettings: 'save_settings',
        }[key];

        const translation = getAssistantText(translationKey, language);

        if (element.tagName === 'BUTTON' && element.querySelector('i')) {
          // Preservar o ícone
          const icon = element.querySelector('i').outerHTML;
          element.innerHTML = icon + ' ' + translation;
        } else {
          element.textContent = translation;
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar textos do seletor de voz:', error);
    }

    // Recarregar opções de voz
    this.loadVoiceOptions();
  }

  /**
   * Retorna o nome do idioma a partir do código
   */
  getLanguageName(langCode) {
    const langNames = {
      pt: 'Português',
      en: 'English',
      es: 'Español',
      he: 'עברית',
      fr: 'Français',
      de: 'Deutsch',
      it: 'Italiano',
      ru: 'Русский',
      ja: '日本語',
      ko: '한국어',
      zh: '中文',
    };

    const baseCode = langCode.split('-')[0].toLowerCase();
    return langNames[baseCode] || langCode;
  }
}
