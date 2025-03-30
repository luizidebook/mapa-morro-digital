import { showNotification } from './notifications.js';
import { startRouteCreation } from '../navigation/route.js';

// Função: Inicia o reconhecimento de voz
export function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    showNotification(
      'Reconhecimento de voz não suportado neste navegador.',
      'error'
    );
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    visualizeVoiceCapture(true);
    console.log('Reconhecimento de voz iniciado.');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    console.log('Comando reconhecido:', transcript);
    interpretCommand(transcript);
  };

  recognition.onerror = (event) => {
    console.error('Erro no reconhecimento de voz:', event.error);
    showNotification(
      'Erro no reconhecimento de voz. Tente novamente.',
      'error'
    );
  };

  recognition.onend = () => {
    visualizeVoiceCapture(false);
    console.log('Reconhecimento de voz finalizado.');
  };

  recognition.start();
}

// Função: Visualiza a captura de voz (efeito visual)
export function visualizeVoiceCapture(isActive) {
  const voiceIndicator = document.getElementById('voice-indicator');
  if (!voiceIndicator) {
    console.warn('Indicador de voz não encontrado.');
    return;
  }
  voiceIndicator.style.display = isActive ? 'block' : 'none';
  console.log(
    `Visualização de captura de voz: ${isActive ? 'ativa' : 'inativa'}.`
  );
}

// Função: Interpreta o comando de voz
export function interpretCommand(command) {
  if (command.toLowerCase().includes('iniciar rota')) {
    startRouteCreation();
    confirmCommandFeedback('Iniciando rota...');
  } else if (command.toLowerCase().includes('parar navegação')) {
    endNavigation();
    confirmCommandFeedback('Navegação encerrada.');
  } else {
    showNotification('Comando não reconhecido.', 'warning');
    console.warn('Comando não reconhecido:', command);
  }
}

// Função: Fornece feedback textual do comando
export function confirmCommandFeedback(message) {
  showNotification(message, 'info');
  console.log('Feedback do comando:', message);
}

// Função: Exibe mensagem de confirmação do comando
export function confirmAudioCommand(message) {
  giveVoiceFeedback(message);
  confirmCommandFeedback(message);
}

// Função: Detecta pontos de interesse (POIs)
export function detectPOI(query) {
  console.log('Detectando POIs para:', query);
  // Implementação de busca de POIs
}

// Função: Valida os resultados de POIs
export function validatePOIResults(results) {
  if (!results || results.length === 0) {
    showNotification('Nenhum ponto de interesse encontrado.', 'warning');
    return false;
  }
  console.log('Resultados de POIs validados:', results);
  return true;
}

// Função: Exibe POIs em realidade aumentada (AR)
export function displayPOIInAR(poi) {
  console.log('Exibindo POI em AR:', poi);
  // Implementação de exibição em AR
}

// Função: Integra rotas de diferentes modais
export function integrateMultimodalRoute(routes) {
  console.log('Integrando rotas multimodais:', routes);
  // Implementação de integração multimodal
}

// Função: Reinicia o reconhecimento de voz após erro
export function retryVoiceRecognition() {
  console.log('Reiniciando reconhecimento de voz...');
  startVoiceRecognition();
}

// Função: Cancela o reconhecimento de voz
export function cancelVoiceRecognition() {
  console.log('Reconhecimento de voz cancelado.');
  // Implementação de cancelamento
}

// Função: Converte texto em áudio
export function giveVoiceFeedback(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  speechSynthesis.speak(utterance);
  console.log('Feedback de voz fornecido:', text);
}

// Função: Fala a instrução via SpeechSynthesis
export function speakInstruction(instruction) {
  giveVoiceFeedback(instruction);
  console.log('Instrução falada:', instruction);
}
