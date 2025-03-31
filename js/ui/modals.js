// Importações necessárias

/**
 * Exibe o modal do assistente virtual (assistant-modal).
 * @param {string} message - Mensagem a ser exibida no modal.
 */
export function showAssistantModal(message) {
  const assistantModal = document.getElementById('assistant-modal');
  const assistantMessage = document.getElementById('assistant-message');

  if (!assistantModal || !assistantMessage) {
    console.error('Elementos do modal do assistente não encontrados.');
    return;
  }

  // Define a mensagem no modal
  assistantMessage.textContent = message;

  // Exibe o modal
  assistantModal.style.display = 'block';

  console.log('Modal do assistente exibido com a mensagem:', message);
}

/**
 * Oculta o modal do assistente virtual (assistant-modal).
 */
export function hideAssistantModal() {
  const assistantModal = document.getElementById('assistant-modal');

  if (!assistantModal) {
    console.error('Elemento do modal do assistente não encontrado.');
    return;
  }

  // Oculta o modal
  assistantModal.style.display = 'none';

  console.log('Modal do assistente ocultado.');
}

// Função: Alterna a visibilidade de modais
export function toggleModals(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.warn(`Modal com ID '${modalId}' não encontrado.`);
    return;
  }
  const isVisible = modal.style.display === 'block';
  modal.style.display = isVisible ? 'none' : 'block';
  console.log(`Modal '${modalId}' ${isVisible ? 'ocultado' : 'exibido'}.`);
}

// Função: Exibe um modal específico
export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.warn(`Modal com ID '${modalId}' não encontrado.`);
    return;
  }
  modal.style.display = 'block';
  console.log(`Modal '${modalId}' exibido.`);
}

// Função: Fecha o modal do carrossel
export function closeCarouselModal() {
  const modal = document.getElementById('carousel-modal');
  if (!modal) {
    console.warn('Modal do carrossel não encontrado.');
    return;
  }
  modal.style.display = 'none';
  console.log('Modal do carrossel fechado.');
}

// Função: Fecha o modal do assistente
export function closeAssistantModal() {
  const modal = document.getElementById('assistant-modal');
  if (!modal) {
    console.warn('Modal do assistente não encontrado.');
    return;
  }
  modal.style.display = 'none';
  console.log('Modal do assistente fechado.');
}

// Função: Anima a troca de instruções no modal
export function animateInstructionChange(instructionText) {
  const instructionElement = document.getElementById('instruction-text');
  if (!instructionElement) {
    console.warn('Elemento de instrução não encontrado.');
    return;
  }
  instructionElement.classList.add('fade-out');
  setTimeout(() => {
    instructionElement.textContent = instructionText;
    instructionElement.classList.remove('fade-out');
    instructionElement.classList.add('fade-in');
    setTimeout(() => {
      instructionElement.classList.remove('fade-in');
    }, 500);
  }, 500);
  console.log('Animação de troca de instrução concluída.');
}

// Função: Atualiza o conteúdo do modal do assistente
export function updateAssistantModalContent(step, message) {
  const modal = document.getElementById('assistant-modal');
  if (modal) {
    modal.textContent = message;
    modal.style.display = 'block';
  } else {
    console.error('Modal do assistente não encontrado.');
  }
}

/**
 * Oculta o modal de boas-vindas (welcome-modal).
 */
export function hideWelcomeModal() {
  const welcomeModal = document.getElementById('welcome-modal');

  if (!welcomeModal) {
    console.error('Elemento welcome-modal não encontrado.');
    return;
  }

  // Oculta o modal
  welcomeModal.style.display = 'none';

  console.log('Modal de boas-vindas ocultado.');
}
