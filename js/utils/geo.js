/**
 * Módulo de utilitários geográficos
 * Contém funções para cálculos de distância, coordenadas e formatação
 */

// Raio da Terra em metros (valor aproximado)
const EARTH_RADIUS = 6371000;

/**
 * Converte graus para radianos
 * @param {number} degrees - Ângulo em graus
 * @returns {number} Ângulo em radianos
 */
export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Converte radianos para graus
 * @param {number} radians - Ângulo em radianos
 * @returns {number} Ângulo em graus
 */
export function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Calcula a distância em metros entre dois pontos usando a fórmula de Haversine
 * @param {number} lat1 - Latitude do ponto 1 em graus
 * @param {number} lon1 - Longitude do ponto 1 em graus
 * @param {number} lat2 - Latitude do ponto 2 em graus
 * @param {number} lon2 - Longitude do ponto 2 em graus
 * @returns {number} Distância em metros
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  // Converter coordenadas de graus para radianos
  const radLat1 = degreesToRadians(lat1);
  const radLon1 = degreesToRadians(lon1);
  const radLat2 = degreesToRadians(lat2);
  const radLon2 = degreesToRadians(lon2);

  // Diferenças de latitude e longitude
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;

  // Fórmula de Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distância em metros
  return EARTH_RADIUS * c;
}

/**
 * Calcula o rumo (bearing) entre dois pontos em graus
 * O rumo é o ângulo em relação ao norte, no sentido horário
 * @param {number} lat1 - Latitude do ponto 1 em graus
 * @param {number} lon1 - Longitude do ponto 1 em graus
 * @param {number} lat2 - Latitude do ponto 2 em graus
 * @param {number} lon2 - Longitude do ponto 2 em graus
 * @returns {number} Rumo em graus (0-360)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const radLat1 = degreesToRadians(lat1);
  const radLon1 = degreesToRadians(lon1);
  const radLat2 = degreesToRadians(lat2);
  const radLon2 = degreesToRadians(lon2);

  const y = Math.sin(radLon2 - radLon1) * Math.cos(radLat2);
  const x =
    Math.cos(radLat1) * Math.sin(radLat2) -
    Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(radLon2 - radLon1);

  let bearing = Math.atan2(y, x);
  bearing = radiansToDegrees(bearing);

  // Normalizar para 0-360
  return (bearing + 360) % 360;
}

/**
 * Calcula a distância de um ponto a uma linha (segmento de reta)
 * Útil para determinar o desvio do usuário em relação à rota
 * @param {Object} point - Ponto {lat, lon}
 * @param {Object} lineStart - Início da linha {lat, lon}
 * @param {Object} lineEnd - Fim da linha {lat, lon}
 * @returns {number} Distância em metros
 */
export function pointToLineDistance(point, lineStart, lineEnd) {
  // Caso especial: se os pontos de início e fim são praticamente os mesmos
  if (
    calculateDistance(lineStart.lat, lineStart.lon, lineEnd.lat, lineEnd.lon) <
    1
  ) {
    return calculateDistance(
      point.lat,
      point.lon,
      lineStart.lat,
      lineStart.lon
    );
  }

  // Calcular a projeção do ponto na linha
  const x = point.lat - lineStart.lat;
  const y = point.lon - lineStart.lon;
  const dx = lineEnd.lat - lineStart.lat;
  const dy = lineEnd.lon - lineStart.lon;

  // Comprimento quadrado da linha
  const lineLengthSquared = dx * dx + dy * dy;

  // Produto escalar dividido pelo comprimento quadrado da linha
  const t = Math.max(0, Math.min(1, (x * dx + y * dy) / lineLengthSquared));

  // Ponto projetado na linha
  const projectedPoint = {
    lat: lineStart.lat + t * dx,
    lon: lineStart.lon + t * dy,
  };

  // Calcular a distância entre o ponto original e o ponto projetado
  return calculateDistance(
    point.lat,
    point.lon,
    projectedPoint.lat,
    projectedPoint.lon
  );
}

/**
 * Calcula o ponto mais próximo em uma polilinha para uma posição dada
 * @param {Object} position - Posição do usuário {lat, lon}
 * @param {Array} polyline - Array de pontos {lat, lon}
 * @returns {Object} Objeto contendo o ponto mais próximo, índice e distância
 */
export function getClosestPointOnPolyline(position, polyline) {
  if (!polyline || !polyline.length) {
    return null;
  }

  let minDistance = Infinity;
  let closestPoint = null;
  let segmentIndex = 0;
  let result = {
    point: null,
    distance: Infinity,
    segmentIndex: 0,
    progress: 0,
  };

  // Iterar por todos os segmentos da polilinha
  for (let i = 0; i < polyline.length - 1; i++) {
    const start = polyline[i];
    const end = polyline[i + 1];

    const distance = pointToLineDistance(position, start, end);

    if (distance < minDistance) {
      minDistance = distance;
      segmentIndex = i;

      // Calcular o ponto mais próximo no segmento
      const x = position.lat - start.lat;
      const y = position.lon - start.lon;
      const dx = end.lat - start.lat;
      const dy = end.lon - start.lon;
      const lineLengthSquared = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, (x * dx + y * dy) / lineLengthSquared));

      closestPoint = {
        lat: start.lat + t * dx,
        lon: start.lon + t * dy,
        t: t, // Posição normalizada no segmento (0-1)
      };
    }
  }

  // Calcular progresso na rota (0-1)
  let distanceSoFar = 0;
  let totalDistance = 0;

  // Distância acumulada até o segmento atual
  for (let i = 0; i < segmentIndex; i++) {
    distanceSoFar += calculateDistance(
      polyline[i].lat,
      polyline[i].lon,
      polyline[i + 1].lat,
      polyline[i + 1].lon
    );
  }

  // Adicionar distância proporcional no segmento atual
  if (closestPoint && closestPoint.t) {
    const segmentLength = calculateDistance(
      polyline[segmentIndex].lat,
      polyline[segmentIndex].lon,
      polyline[segmentIndex + 1].lat,
      polyline[segmentIndex + 1].lon
    );
    distanceSoFar += segmentLength * closestPoint.t;
  }

  // Calcular distância total da rota
  for (let i = 0; i < polyline.length - 1; i++) {
    totalDistance += calculateDistance(
      polyline[i].lat,
      polyline[i].lon,
      polyline[i + 1].lat,
      polyline[i + 1].lon
    );
  }

  result = {
    point: closestPoint,
    distance: minDistance,
    segmentIndex: segmentIndex,
    progress: totalDistance > 0 ? distanceSoFar / totalDistance : 0,
  };

  return result;
}

/**
 * Formata uma distância para exibição
 * @param {number} meters - Distância em metros
 * @param {string} language - Código do idioma
 * @returns {string} Distância formatada (ex: "500 m" ou "2,5 km")
 */
export function formatDistance(meters, language = 'pt') {
  // Idiomas para formatação
  const formats = {
    pt: { decimal: ',', thousand: '.', km: 'km', m: 'm' },
    en: { decimal: '.', thousand: ',', km: 'km', m: 'm' },
    es: { decimal: ',', thousand: '.', km: 'km', m: 'm' },
    he: { decimal: '.', thousand: ',', km: 'ק"מ', m: "מ'" },
  };

  const format = formats[language] || formats.en;

  if (meters < 1000) {
    // Menos de 1 km: mostrar em metros
    return `${Math.round(meters)} ${format.m}`;
  } else {
    // Mais de 1 km: mostrar em quilômetros com 1 casa decimal
    const km = (meters / 1000).toFixed(1).replace('.', format.decimal);
    return `${km} ${format.km}`;
  }
}

/**
 * Formata um tempo em segundos para exibição
 * @param {number} seconds - Tempo em segundos
 * @param {string} language - Código do idioma
 * @returns {string} Tempo formatado (ex: "5 min" ou "2h 30min")
 */
export function formatDuration(seconds, language = 'pt') {
  // Textos por idioma
  const texts = {
    pt: { hour: 'h', hours: 'h', minute: 'min', minutes: 'min' },
    en: { hour: 'hr', hours: 'hrs', minute: 'min', minutes: 'mins' },
    es: { hour: 'h', hours: 'h', minute: 'min', minutes: 'min' },
    he: { hour: 'שעה', hours: 'שעות', minute: "דק'", minutes: "דק'" },
  };

  const text = texts[language] || texts.en;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    // Com horas
    const hourText = hours === 1 ? text.hour : text.hours;
    const minuteText = minutes === 1 ? text.minute : text.minutes;

    if (minutes > 0) {
      return `${hours}${hourText} ${minutes}${minuteText}`;
    } else {
      return `${hours}${hourText}`;
    }
  } else {
    // Só minutos
    const minuteText = minutes === 1 ? text.minute : text.minutes;
    return `${Math.max(1, minutes)}${minuteText}`;
  }
}

// Exportar funções
export default {
  calculateDistance,
  calculateBearing,
  pointToLineDistance,
  getClosestPointOnPolyline,
  formatDistance,
  formatDuration,
  degreesToRadians,
  radiansToDegrees,
};
