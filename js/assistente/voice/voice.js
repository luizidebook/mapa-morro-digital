/**
 * Processa entrada de voz
 */
export function handleVoiceInput() {
  console.log('Entrada de voz solicitada');

  if (
    !('webkitSpeechRecognition' in window) &&
    !('SpeechRecognition' in window)
  ) {
    addMessageToUI(
      'Desculpe, seu navegador não suporta reconhecimento de voz. Por favor, digite sua pergunta.',
      'assistant'
    );
    return;
  }

  addMessageToUI('Estou ouvindo...', 'assistant');

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const speechText = event.results[0][0].transcript;
    console.log('Texto reconhecido:', speechText);

    // Mostrar o que foi entendido
    showUserMessage(speechText);

    // Processar a mensagem
    setTimeout(() => {
      processUserMessage(speechText);
    }, 500);
  };

  recognition.onerror = (event) => {
    console.error(`Erro de reconhecimento: ${event.error}`);
    addMessageToUI(
      'Desculpe, não consegui entender. Pode tentar novamente ou digitar sua pergunta?',
      'assistant'
    );
  };

  recognition.start();
}
