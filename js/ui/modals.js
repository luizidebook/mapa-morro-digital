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
export function updateAssistantModalContent(content) {
  const modalContent = document.getElementById('assistant-content');
  if (!modalContent) {
    console.warn('Conteúdo do modal do assistente não encontrado.');
    return;
  }
  modalContent.innerHTML = content;
  console.log('Conteúdo do modal do assistente atualizado.');
}
