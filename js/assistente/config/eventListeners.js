import {
  toggleAssistantDialog,
  hideAssistantDialog,
} from '../dialog/dialog.js';
import { sendMessage } from '../dialog/message/message.js'; // Adicionar esta importação crucial
import { handleVoiceInput } from '../voice/voice.js';
import { makeAssistantDraggable } from './config.js';

/**
 * Configura todos os listeners de eventos do assistente
 */
export function setupEventListeners() {
  console.log('Configurando event listeners do assistente...');

  // Verificar se o DOM está pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      configureListeners();
    });
  } else {
    // DOM já está pronto
    configureListeners();
  }
}

/**
 * Função que realmente configura os listeners depois que o DOM está pronto
 */
function configureListeners() {
  // Elementos do assistente
  let assistantToggle = document.getElementById('assistant-toggle');
  const assistantDialog = document.getElementById('assistant-dialog');
  const closeBtn = document.getElementById('close-assistant-dialog');
  const sendBtn = document.getElementById('assistant-send');
  const voiceBtn = document.getElementById('assistant-voice-input');
  const textInput = document.getElementById('assistant-text-input');

  // Verificar elementos críticos de forma mais robusta
  if (!assistantToggle) {
    console.warn(
      'Botão de toggle do assistente não encontrado, verificando alternativas...'
    );
    // Verificar alternativas ou criar dinamicamente
    const alternativeToggle = document.querySelector('.assistant-toggle-btn');
    if (alternativeToggle) {
      console.log('Alternativa para botão de toggle encontrada, usando...');
      assistantToggle = alternativeToggle;
    } else {
      console.warn('Nenhuma alternativa encontrada para o botão de toggle');
      // Não retornar false aqui para permitir que o resto da configuração continue
    }
  }

  if (!assistantDialog) {
    console.error('Diálogo do assistente não encontrado!');
    // Não retorne false para permitir que o resto da inicialização continue
  }

  // Configurar apenas os elementos que existem
  if (assistantToggle) {
    assistantToggle.addEventListener('click', () => {
      console.log('Botão do assistente clicado');
      if (typeof toggleAssistantDialog === 'function') {
        toggleAssistantDialog();
      }
    });
  }

  // Botão para fechar o diálogo
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      console.log('Botão fechar clicado');
      if (typeof hideAssistantDialog === 'function') {
        hideAssistantDialog();
      }
    });
  }

  // Botão de envio de mensagem
  if (sendBtn && textInput) {
    sendBtn.addEventListener('click', () => {
      const message = textInput.value.trim();
      if (message && typeof sendMessage === 'function') {
        sendMessage(message);
        textInput.value = '';
      }
    });
  }

  // Envio de mensagem com Enter
  if (textInput) {
    textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const message = textInput.value.trim();
        if (message && typeof sendMessage === 'function') {
          sendMessage(message);
          textInput.value = '';
        }
      }
    });
  }

  // Botão de entrada de voz
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (typeof handleVoiceInput === 'function') {
        handleVoiceInput();
      }
    });
  }

  // Tornar o assistente arrastável se a função existir
  if (typeof makeAssistantDraggable === 'function') {
    makeAssistantDraggable();
  } else {
    console.warn('Função makeAssistantDraggable não encontrada');
  }

  console.log('Event listeners do assistente configurados com sucesso');
}
