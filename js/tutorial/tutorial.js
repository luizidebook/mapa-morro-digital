/**
 * Inicia o tutorial e notifica o assistente virtual
 */
export function startTutorial() {
  // Código existente...

  // Notificar o assistente que o tutorial começou
  if (window.assistantApi) {
    console.log('Notificando assistente sobre início do tutorial');
    // Armazenar a última etapa do tutorial para o assistente acompanhar
    window.currentTutorialStep = 1;
  }

  // Mostrar primeira etapa
  // ...
}

/**
 * Avança para a próxima etapa do tutorial
 */
export function nextTutorialStep() {
  // Código existente...

  // Atualizar estado global para o assistente
  window.currentTutorialStep = currentStep;

  // Se for a última etapa, notificar o assistente
  if (isLastStep) {
    if (
      window.assistantApi &&
      typeof window.assistantApi.sendMessage === 'function'
    ) {
      // Enviar mensagem interna para indicar que o tutorial terminou
      setTimeout(() => {
        // Usando um canal interno para não mostrar ao usuário
        if (typeof window.assistantApi.handleInternalEvent === 'function') {
          window.assistantApi.handleInternalEvent('tutorial_completed');
        }
      }, 1000);
    }
  }
}
