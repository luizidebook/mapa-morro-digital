/**
 * Torna o assistente arrastável pelo botão
 */
export function makeAssistantDraggable() {
  const digitalAssistant = document.getElementById('digital-assistant');
  const handle = document.getElementById('assistant-toggle');

  if (!digitalAssistant || !handle) return;

  let isDragging = false;
  let initialX, initialY, offsetX, offsetY;

  handle.addEventListener('mousedown', startDrag);
  handle.addEventListener('touchstart', startDrag, { passive: false });

  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  function startDrag(e) {
    e.preventDefault();

    if (e.type === 'touchstart') {
      initialX = e.touches[0].clientX;
      initialY = e.touches[0].clientY;
    } else {
      initialX = e.clientX;
      initialY = e.clientY;
    }

    const rect = digitalAssistant.getBoundingClientRect();
    offsetX = initialX - rect.left;
    offsetY = initialY - rect.top;

    isDragging = true;
    digitalAssistant.classList.add('movable');
    digitalAssistant.classList.add('dragging');
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();

    let currentX, currentY;

    if (e.type === 'touchmove') {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else {
      currentX = e.clientX;
      currentY = e.clientY;
    }

    // Calcular nova posição
    const newLeft = currentX - offsetX;
    const newTop = currentY - offsetY;

    // Limitar às bordas da tela
    const maxLeft = window.innerWidth - digitalAssistant.offsetWidth;
    const maxTop = window.innerHeight - digitalAssistant.offsetHeight;

    const boundedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const boundedTop = Math.max(0, Math.min(newTop, maxTop));

    // Aplicar posição
    digitalAssistant.style.left = `${boundedLeft}px`;
    digitalAssistant.style.top = `${boundedTop}px`;
    digitalAssistant.style.transform = 'none'; // Remover transform para evitar conflitos
    digitalAssistant.style.position = 'fixed';
    digitalAssistant.style.bottom = 'auto';
  }

  function endDrag() {
    if (!isDragging) return;

    isDragging = false;
    digitalAssistant.classList.remove('dragging');

    // Delay antes de remover a classe
    setTimeout(() => {
      digitalAssistant.classList.remove('movable');
    }, 300);
  }
}
