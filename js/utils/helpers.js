/**
 * Módulo de funções auxiliares gerais
 * Contém utilitários usados por vários módulos da aplicação
 */

/**
 * Atrasa a execução de uma função (debounce)
 * Útil para evitar múltiplas chamadas em eventos frequentes (ex: resize, scroll)
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @param {boolean} immediate - Se true, executa imediatamente na primeira chamada
 * @returns {Function} Função com debounce
 */
export function debounce(func, wait, immediate = false) {
  let timeout;

  return function executedFunction(...args) {
    const context = this;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

/**
 * Limita a taxa de execução de uma função (throttle)
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite mínimo entre execuções em ms
 * @returns {Function} Função com throttle
 */
export function throttle(func, limit) {
  let inThrottle;
  let lastFunc;
  let lastRan;

  return function (...args) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);

      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Gera um identificador único
 * @param {string} [prefix] - Prefixo opcional para o ID
 * @returns {string} ID único
 */
export function generateId(prefix = "") {
  return prefix + Math.random().toString(36).substr(2, 9);
}

/**
 * Aplica suavização a um valor (smooth)
 * Útil para suavizar movimentos, evitando saltos bruscos
 * @param {number} currentValue - Valor atual
 * @param {number} newValue - Novo valor
 * @param {number} alpha - Fator de suavização (0-1, menor = mais suave)
 * @returns {number} Valor suavizado
 */
export function smoothValue(currentValue, newValue, alpha = 0.2) {
  if (currentValue === null || currentValue === undefined) {
    return newValue;
  }
  return currentValue + alpha * (newValue - currentValue);
}

/**
 * Aplica suavização a um objeto de coordenadas
 * @param {Object} currentCoord - Coordenada atual {lat, lon}
 * @param {Object} newCoord - Nova coordenada {lat, lon}
 * @param {number} alpha - Fator de suavização (0-1)
 * @returns {Object} Coordenada suavizada
 */
export function smoothCoordinate(currentCoord, newCoord, alpha = 0.2) {
  if (!currentCoord || !newCoord) {
    return newCoord;
  }

  return {
    lat: smoothValue(currentCoord.lat, newCoord.lat, alpha),
    lon: smoothValue(currentCoord.lon, newCoord.lon, alpha),
  };
}

/**
 * Calcula a média móvel de um array de valores
 * @param {Array<number>} values - Array de valores
 * @param {number} windowSize - Tamanho da janela de média
 * @returns {number} Média móvel
 */
export function movingAverage(values, windowSize = 5) {
  if (!values || values.length === 0) return 0;

  const window = values.slice(-windowSize);
  const sum = window.reduce((acc, val) => acc + val, 0);
  return sum / window.length;
}

/**
 * Formata data e hora
 * @param {Date|number} date - Data (objeto Date ou timestamp)
 * @param {string} [format='short'] - Formato ('short', 'long', 'time')
 * @param {string} [locale='pt-BR'] - Localidade para formatação
 * @returns {string} Data formatada
 */
export function formatDateTime(date, format = "short", locale = "pt-BR") {
  const dateObj = date instanceof Date ? date : new Date(date);

  const options = {
    short: { dateStyle: "short", timeStyle: "short" },
    long: { dateStyle: "long", timeStyle: "medium" },
    time: { timeStyle: "short" },
  };

  return new Intl.DateTimeFormat(
    locale,
    options[format] || options.short
  ).format(dateObj);
}

/**
 * Valida se um objeto tem todas as propriedades esperadas
 * @param {Object} obj - Objeto a ser validado
 * @param {Array<string>} requiredProps - Array de propriedades obrigatórias
 * @returns {boolean} true se o objeto é válido
 */
export function validateObject(obj, requiredProps) {
  if (!obj || typeof obj !== "object") return false;

  return requiredProps.every((prop) => {
    const props = prop.split(".");
    let value = obj;

    for (const p of props) {
      if (value === undefined || value === null) return false;
      value = value[p];
    }

    return value !== undefined && value !== null;
  });
}

/**
 * Escapa caracteres especiais HTML
 * @param {string} text - Texto a ser escapado
 * @returns {string} Texto escapado
 */
export function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Detecta se o dispositivo está em modo offline
 * @returns {boolean} true se offline
 */
export function isOffline() {
  return !navigator.onLine;
}

/**
 * Detecta se a aplicação está rodando como PWA (instalada)
 * @returns {boolean} true se PWA
 */
export function isPWA() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

/**
 * Detecta se o dispositivo é móvel
 * @returns {boolean} true se mobile
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Extrai parâmetros de query string
 * @param {string} [url] - URL (usa window.location se não fornecida)
 * @returns {Object} Objeto com parâmetros
 */
export function getQueryParams(url) {
  const urlObj = new URL(url || window.location.href);
  const params = {};

  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value;
  }

  return params;
}

// Exportar funções
export default {
  debounce,
  throttle,
  generateId,
  smoothValue,
  smoothCoordinate,
  movingAverage,
  formatDateTime,
  validateObject,
  escapeHTML,
  isOffline,
  isPWA,
  isMobile,
  getQueryParams,
};
