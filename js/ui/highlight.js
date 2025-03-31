/**
 * highlightElement - Adiciona destaque visual a um elemento do DOM
 *
 * @param {HTMLElement|string} element - Elemento a ser destacado ou seletor CSS
 * @param {Object} options - Opções de personalização
 * @param {string} options.type - Tipo de destaque: 'circle' (padrão), 'pulse', 'arrow', 'outline'
 * @param {string} options.color - Cor do destaque (padrão: '#ff9800')
 * @param {string} options.position - Posição da seta: 'top', 'right', 'bottom', 'left' (padrão: 'top')
 * @param {number} options.padding - Espaço adicional ao redor do elemento em pixels (padrão: 10)
 * @param {boolean} options.scrollIntoView - Se deve rolar a página para mostrar o elemento (padrão: true)
 * @param {number} options.animationDuration - Duração da animação em segundos (padrão: 1.5)
 *
 * Esta função:
 * 1. Remove quaisquer destaques existentes
 * 2. Encontra o elemento a ser destacado (se for um seletor)
 * 3. Cria elementos visuais (círculo, seta) com base nas opções
 * 4. Posiciona os elementos de destaque corretamente
 * 5. Adiciona classes para animação
 * 6. Controla o scroll para garantir que o elemento esteja visível
 */
export function highlightElement(element, options = {}) {
  // REMOVER DESTAQUES EXISTENTES NO INÍCIO DA FUNÇÃO
  removeExistingHighlights();

  // Verificar se é o modal (com verificação dupla)
  const isModalCheck =
    (typeof element === 'string' &&
      (element === '#assistant-modal' ||
        element.includes('assistant-modal'))) ||
    (element && element.id === 'assistant-modal') ||
    (element && element.closest && element.closest('#assistant-modal'));

  if (isModalCheck && !options.forceModalHighlight) {
    console.log('PROTEÇÃO: Evitando destaque para assistant-modal');
    return;
  }

  // Converter para elemento DOM se for string
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }

  // Verificar se o elemento existe
  if (!element) {
    console.error('highlightElement: Elemento não encontrado.');
    return;
  }

  // PROTEÇÃO PARA O MODAL E SEUS FILHOS - ADICIONE ESTE BLOCO
  if (
    (element.id === 'assistant-modal' || element.closest('#assistant-modal')) &&
    !options.forceModalHighlight
  ) {
    console.log('Pulando destaque para o modal do assistente ou seus filhos');
    return;
  }

  // Proteção especial para o mapa - não alteramos suas dimensões
  const isMap = element.id === 'map';

  // Caso seja o mapa, usamos uma abordagem diferente
  if (isMap && !options.forceDefaultHighlight) {
    // Criar um overlay que não afeta dimensões
    const mapOverlay = document.createElement('div');
    mapOverlay.className = 'map-highlight-overlay';
    mapOverlay.style.position = 'absolute';
    mapOverlay.style.top = '0';
    mapOverlay.style.left = '0';
    mapOverlay.style.width = '100%';
    mapOverlay.style.height = '100%';
    mapOverlay.style.border = `2px solid ${options.color || '#ff0000'}`;
    mapOverlay.style.boxShadow = `0 0 10px ${options.color || '#ff0000'}`;
    mapOverlay.style.pointerEvents = 'none';
    mapOverlay.style.zIndex = '99';

    element.style.position = element.style.position || 'relative';
    element.appendChild(mapOverlay);

    return;
  }

  // Configurações padrão
  const config = {
    type: options.type || 'circle',
    color: options.color || '#ff9800',
    position: options.position || 'top',
    padding: options.padding || 10,
    scrollIntoView: options.scrollIntoView !== false,
    animationDuration: options.animationDuration || 1.5,
    zIndex: options.zIndex || 99,
    showArrow: options.showArrow !== false,
  };

  console.log(
    `Destacando elemento: ${element.id || element.className || 'desconhecido'}`
  );

  // Obter posição do elemento na página
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  // Adicionar classe ao elemento para indicar que está sendo destacado
  element.classList.add('tutorial-highlighted');

  // Detectar se a opção exactFit está habilitada
  if (options.exactFit) {
    createExactFitHighlight(element, rect, scrollTop, scrollLeft, config);
  } else {
    // Criar destaque conforme o tipo especificado
    switch (config.type) {
      case 'circle':
        createCircleHighlight(element, rect, scrollTop, scrollLeft, config);
        break;
      case 'pulse':
        createPulseHighlight(element, rect, scrollTop, scrollLeft, config);
        break;
      case 'outline':
        createOutlineHighlight(element, rect, scrollTop, scrollLeft, config);
        break;
      default:
        createCircleHighlight(element, rect, scrollTop, scrollLeft, config);
    }
  }

  // Criar seta apontando para o elemento (opcional)
  if (config.showArrow) {
    createArrowHighlight(element, rect, scrollTop, scrollLeft, config);
  }

  // Adicionar CSS para animação
  addHighlightStyleSheet();
}

/**
 * Cria um destaque circular ao redor do elemento
 */
export function createCircleHighlight(
  element,
  rect,
  scrollTop,
  scrollLeft,
  config
) {
  const highlight = document.createElement('div');
  highlight.className = 'circle-highlight';

  // Definir posição e tamanho
  highlight.style.position = 'absolute';
  highlight.style.width = `${rect.width + config.padding * 2}px`;
  highlight.style.height = `${rect.height + config.padding * 2}px`;
  highlight.style.top = `${rect.top + scrollTop - config.padding}px`;
  highlight.style.left = `${rect.left + scrollLeft - config.padding}px`;
  highlight.style.borderRadius = '50%'; // Círculo completo
  highlight.style.border = `2px solid ${config.color}`;
  highlight.style.boxShadow = `0 0 10px ${config.color}, 0 0 20px ${config.color}`;
  highlight.style.zIndex = config.zIndex;
  highlight.style.animation = `pulse ${config.animationDuration}s infinite alternate`;
  highlight.style.pointerEvents = 'none'; // Permite clicar através do destaque

  document.body.appendChild(highlight);
}

/**
 * Cria um destaque pulsante ao redor do elemento
 */
export function createPulseHighlight(
  element,
  rect,
  scrollTop,
  scrollLeft,
  config
) {
  const highlight = document.createElement('div');
  highlight.className = 'pulse-highlight';

  // Definir posição e tamanho
  highlight.style.position = 'absolute';
  highlight.style.width = `${rect.width + config.padding * 2}px`;
  highlight.style.height = `${rect.height + config.padding * 2}px`;
  highlight.style.top = `${rect.top + scrollTop - config.padding}px`;
  highlight.style.left = `${rect.left + scrollLeft - config.padding}px`;
  highlight.style.borderRadius = '8px'; // Bordas arredondadas
  highlight.style.background = `rgba(255, 152, 0, 0.1)`;
  highlight.style.border = `2px solid ${config.color}`;
  highlight.style.zIndex = config.zIndex;
  highlight.style.animation = `pulse ${config.animationDuration}s infinite`;
  highlight.style.pointerEvents = 'none';

  document.body.appendChild(highlight);
}

/**
 * Cria um destaque de contorno ao redor do elemento
 */
export function createOutlineHighlight(
  element,
  rect,
  scrollTop,
  scrollLeft,
  config
) {
  const highlight = document.createElement('div');
  highlight.className = 'outline-highlight';

  // Definir posição e tamanho
  highlight.style.position = 'absolute';
  highlight.style.width = `${rect.width + config.padding * 2}px`;
  highlight.style.height = `${rect.height + config.padding * 2}px`;
  highlight.style.top = `${rect.top + scrollTop - config.padding}px`;
  highlight.style.left = `${rect.left + scrollLeft - config.padding}px`;
  // Obter borderRadius do elemento e aplicar
  const elementStyle = window.getComputedStyle(element);
  highlight.style.borderRadius = elementStyle.borderRadius;
  highlight.style.border = `2px solid ${config.color}`;
  highlight.style.boxShadow = `0 0 8px ${config.color}`;
  highlight.style.zIndex = config.zIndex;
  highlight.style.animation = `glow ${config.animationDuration}s infinite alternate`;
  highlight.style.pointerEvents = 'none';

  document.body.appendChild(highlight);
}

/**
 * Cria uma seta apontando para o elemento
 */
export function createArrowHighlight(
  element,
  rect,
  scrollTop,
  scrollLeft,
  config
) {
  const arrow = document.createElement('div');
  arrow.className = 'arrow-highlight';

  // Tamanho da seta
  const arrowSize = 30;

  // Definir posição básica da seta
  arrow.style.position = 'absolute';
  arrow.style.width = `${arrowSize}px`;
  arrow.style.height = `${arrowSize}px`;
  arrow.style.zIndex = config.zIndex;
  arrow.style.pointerEvents = 'none';

  // Criar um SVG para a seta
  arrow.innerHTML = `<svg viewBox="0 0 24 24" width="${arrowSize}" height="${arrowSize}">
      <path fill="${config.color}" d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"/>
    </svg>`;

  // Posicionar a seta de acordo com a posição especificada
  switch (config.position) {
    case 'top':
      arrow.style.transform = 'rotate(180deg)';
      arrow.style.top = `${rect.top + scrollTop - arrowSize - 10}px`;
      arrow.style.left = `${rect.left + scrollLeft + rect.width / 2 - arrowSize / 2}px`;
      break;
    case 'right':
      arrow.style.transform = 'rotate(270deg)';
      arrow.style.top = `${rect.top + scrollTop + rect.height / 2 - arrowSize / 2}px`;
      arrow.style.left = `${rect.left + scrollLeft + rect.width + 10}px`;
      break;
    case 'bottom':
      arrow.style.transform = 'rotate(0deg)';
      arrow.style.top = `${rect.top + scrollTop + rect.height + 10}px`;
      arrow.style.left = `${rect.left + scrollLeft + rect.width / 2 - arrowSize / 2}px`;
      break;
    case 'left':
      arrow.style.transform = 'rotate(90deg)';
      arrow.style.top = `${rect.top + scrollTop + rect.height / 2 - arrowSize / 2}px`;
      arrow.style.left = `${rect.left + scrollLeft - arrowSize - 10}px`;
      break;
  }

  // Adicionar animação de bounce
  arrow.style.animation = `bounce ${config.animationDuration}s infinite`;

  document.body.appendChild(arrow);
}

/**
 * Adiciona estilos CSS para animações de destaque
 */
export function addHighlightStyleSheet() {
  // Verifica se já existe o estilo
  if (document.getElementById('highlight-styles')) return;

  const styleSheet = document.createElement('style');
  styleSheet.id = 'highlight-styles';
  styleSheet.innerHTML = `
      @keyframes pulse {
        0% { opacity: 0.6; transform: scale(1); }
        100% { opacity: 1; transform: scale(1.05); }
      }
      
      @keyframes glow {
        0% { box-shadow: 0 0 5px #ff9800; }
        100% { box-shadow: 0 0 15px #ff9800, 0 0 20px #ff9800; }
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(var(--rotate, 0deg)); }
        40% { transform: translateY(-10px) rotate(var(--rotate, 0deg)); }
        60% { transform: translateY(-5px) rotate(var(--rotate, 0deg)); }
      }
      
      .tutorial-highlighted {
        z-index: 10000;
        position: relative;
      }
      
      .circle-highlight, .pulse-highlight, .outline-highlight {
        pointer-events: none;
        box-sizing: border-box;
      }
    `;

  document.head.appendChild(styleSheet);
}

/**
 * removeExistingHighlights - Remove todos os destaques existentes
 */
export function removeExistingHighlights() {
  // Remove elementos de destaque
  document
    .querySelectorAll(
      '.circle-highlight, .pulse-highlight, .outline-highlight, .arrow-highlight'
    )
    .forEach((el) => {
      el.remove();
    });

  // Remove classe de destaque dos elementos
  document.querySelectorAll('.tutorial-highlighted').forEach((el) => {
    el.classList.remove('tutorial-highlighted');
  });

  console.log('removeExistingHighlights: Destaques visuais removidos.');
}

/**
 * Garante que o destaque se ajuste exatamente às dimensões do elemento
 * @param {HTMLElement} element - Elemento a ser destacado
 * @param {Object} rect - Dimensões do elemento
 * @param {Object} config - Configuração do destaque
 * @returns {HTMLElement} - O elemento de destaque criado
 */
export function createExactFitHighlight(
  element,
  rect,
  scrollTop,
  scrollLeft,
  config
) {
  const highlight = document.createElement('div');
  highlight.className = 'exact-highlight';

  // Usar as dimensões exatas do elemento
  highlight.style.width = `${config.width || rect.width}px`;
  highlight.style.height = `${config.height || rect.height}px`;

  // Posicionar exatamente onde o elemento está
  highlight.style.top = `${rect.top + scrollTop}px`;
  highlight.style.left = `${rect.left + scrollLeft}px`;

  // Garantir visibilidade acima de tudo
  highlight.style.zIndex = config.zIndex || 99;

  // Adicionar borda e fundo semi-transparente
  highlight.style.border = `2px solid ${config.color || '#ff0000'}`;
  highlight.style.backgroundColor = `${config.color || '#ff0000'}20`; // 20 = 12.5% de opacidade
  highlight.style.boxShadow = `0 0 10px ${config.color || '#ff0000'}`;

  // Animação pulsante
  highlight.style.animation = `pulse-exact ${config.animationDuration || 1.5}s infinite`;

  // Adicionar ao DOM
  document.body.appendChild(highlight);

  // Adicionar estilo para animação
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes pulse-exact {
      0% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.02); opacity: 1; }
      100% { transform: scale(1); opacity: 0.7; }
    }
  `;
  document.head.appendChild(style);

  return highlight;
}

/**
 * Exemplo de como usar a função highlightElement:
 *
 * // Destaque básico (círculo)
 * highlightElement(document.getElementById('menu-btn'));
 *
 * // Destaque pulsante com seta
 * highlightElement('.menu-btn', {
 *   type: 'pulse',
 *   position: 'right',
 *   color: '#2196F3'
 * });
 *
 * // Destaque de contorno
 * highlightElement(document.querySelector('#map'), {
 *   type: 'outline',
 *   padding: 5,
 *   showArrow: false
 * });
 */
