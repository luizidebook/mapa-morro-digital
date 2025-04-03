/**
 * Funções para controlar o movimento e posicionamento do assistente virtual no mapa
 */

/**
 * Move o assistente para uma posição específica na tela
 * @param {number} x - Posição X na tela
 * @param {number} y - Posição Y na tela
 */
export function moveAssistant(x, y) {
  const assistantElement = document.getElementById('digital-assistant');
  if (!assistantElement) return;

  assistantElement.style.position = 'fixed';
  assistantElement.style.left = `${x}px`;
  assistantElement.style.top = `${y}px`;
  assistantElement.style.bottom = 'auto'; // Remove posicionamento bottom

  // Adiciona a classe para animar o movimento
  assistantElement.classList.add('movable');

  // Remove a classe após a animação
  setTimeout(() => {
    assistantElement.classList.remove('movable');
  }, 500);
}

/**
 * Move o assistente para um ponto específico no mapa
 * @param {Object} point - Coordenadas {lat, lng} onde o assistente deve aparecer
 * @param {Object} map - Instância do mapa Leaflet
 */
export function moveAssistantToMapPoint(point, map) {
  if (!point || !point.lat || !point.lng || !map) return;

  // Converte coordenadas do mapa para pixels na tela
  const pixelPoint = map.latLngToContainerPoint([point.lat, point.lng]);

  const assistantElement = document.getElementById('digital-assistant');
  if (!assistantElement) return;

  // Ajusta a posição para que o assistente fique próximo ao ponto, mas não sobre ele
  const assistantWidth = assistantElement.offsetWidth;
  const assistantHeight = assistantElement.offsetHeight;

  // Posiciona o assistente um pouco abaixo e à direita do ponto
  const offsetX = 20;
  const offsetY = 20;

  // Obtém a posição do mapa na página
  const mapContainer = map.getContainer();
  const mapRect = mapContainer.getBoundingClientRect();

  // Calcula posição absoluta na página
  const x = mapRect.left + pixelPoint.x + offsetX;
  const y = mapRect.top + pixelPoint.y + offsetY;

  // Move o assistente para a posição calculada
  moveAssistant(x, y);

  // Anima o assistente para chamar atenção
  bounceAssistant();
}

/**
 * Retorna o assistente para sua posição padrão no centro inferior da tela
 */
export function resetAssistantPosition() {
  const assistantElement = document.getElementById('digital-assistant');
  if (!assistantElement) return;

  // Calcula a posição centralizada (considerando o tamanho do elemento)
  const windowWidth = window.innerWidth;
  const elementWidth = assistantElement.offsetWidth;
  const leftPosition = (windowWidth - elementWidth) / 2;

  // Aplica a posição calculada
  assistantElement.style.position = 'fixed';
  assistantElement.style.left = `${leftPosition}px`;
  assistantElement.style.bottom = '20px';
  assistantElement.style.top = 'auto'; // Remove posicionamento top

  // Adiciona a classe para animar o movimento
  assistantElement.classList.add('movable');

  // Remove a classe após a animação
  setTimeout(() => {
    assistantElement.classList.remove('movable');
  }, 500);
}

/**
 * Faz o assistente saltar para chamar a atenção
 */
export function bounceAssistant() {
  const assistantElement = document.getElementById('digital-assistant');
  if (!assistantElement) return;

  // Primeiro remove a animação anterior (se houver)
  assistantElement.style.animation = 'none';

  // Força um reflow para que a nova animação seja aplicada
  void assistantElement.offsetWidth;

  // Aplica a animação de bounce
  assistantElement.style.animation = 'bounce-in 0.8s ease forwards';

  // Limpa a animação após completar
  setTimeout(() => {
    assistantElement.style.animation = 'none';
  }, 800);
}
