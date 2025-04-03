/**
 * Widgets da interface do usuário para o Mapa Morro Digital
 * Arquivo: js/ui/widgets.js
 *
 * Este módulo contém widgets como:
 * - Widget de clima
 * - Tabela de marés
 * - Outros widgets que possam ser adicionados no futuro
 */

import { showNotification } from './notifications.js';
import { selectedLanguage } from '../core/varGlobals.js';

// Dados simulados para clima - em um sistema real, seria conectado a uma API
const weatherData = {
  current: {
    temp: 28,
    condition: 'sunny', // sunny, partly-cloudy, cloudy, rainy, stormy
    humidity: 65,
    wind: 15,
  },
  forecast: [
    { date: '2025-04-02', high: 29, low: 23, condition: 'sunny' },
    { date: '2025-04-03', high: 28, low: 22, condition: 'partly-cloudy' },
    { date: '2025-04-04', high: 27, low: 22, condition: 'rainy' },
    { date: '2025-04-05', high: 26, low: 21, condition: 'rainy' },
    { date: '2025-04-06', high: 28, low: 22, condition: 'partly-cloudy' },
  ],
};

// Dados simulados para tabela de marés - em um sistema real, seria conectado a uma API
const tideData = [
  {
    date: '2025-04-02',
    times: [
      { time: '03:45', level: 0.3, type: 'low' },
      { time: '09:15', level: 2.1, type: 'high' },
      { time: '15:30', level: 0.4, type: 'low' },
      { time: '21:45', level: 2.0, type: 'high' },
    ],
  },
  {
    date: '2025-04-03',
    times: [
      { time: '04:15', level: 0.4, type: 'low' },
      { time: '10:00', level: 2.0, type: 'high' },
      { time: '16:15', level: 0.5, type: 'low' },
      { time: '22:30', level: 1.9, type: 'high' },
    ],
  },
];

// Objeto para armazenar referências a todos os widgets ativos
const activeWidgets = {
  weather: null,
  tide: null,
  // Outros widgets futuros podem ser adicionados aqui
};

/**
 * Inicializa e configura widgets de clima e outros widgets informativos
 */
export function initializeWeatherWidgets() {
  console.log('Inicializando widgets de clima...');

  // Obter referência ao elemento do widget
  const weatherWidget = document.getElementById('weather-widget');

  // Se o widget não existir, registrar aviso e sair
  if (!weatherWidget) {
    console.warn('Widget de clima não encontrado no DOM');
    return;
  }

  // Garantir que o widget comece oculto
  weatherWidget.style.display = 'none';
  weatherWidget.classList.add('hidden');

  // Preencher com dados de clima simulados
  updateWeatherData(weatherWidget);

  // Configurar atualização periódica (a cada 15 minutos)
  setInterval(() => updateWeatherData(weatherWidget), 15 * 60 * 1000);

  console.log('Widget de clima inicializado');
}

/**
 * Atualiza os dados do widget de clima com os dados mais recentes
 * @param {HTMLElement} widget - Elemento do widget de clima
 */
function updateWeatherData(widget) {
  try {
    // Em uma implementação real, aqui faria uma requisição a uma API de clima
    // Para este exemplo, usando dados simulados
    const weatherData = {
      temperature: '28°C',
      condition: 'sunny', // Possíveis valores: sunny, partly-cloudy, cloudy, rainy, thunderstorm
      humidity: '75%',
      wind: '15 km/h',
    };

    // Atualizar elementos do widget com os dados
    const tempElement = widget.querySelector('.weather-temp');
    const conditionElement = widget.querySelector('.weather-icon');
    const humidityElement = widget.querySelector('.weather-humidity');
    const windElement = widget.querySelector('.weather-wind');

    if (tempElement) tempElement.textContent = weatherData.temperature;
    if (conditionElement) {
      // Remover todas as classes de condição anteriores
      conditionElement.classList.remove(
        'sunny',
        'partly-cloudy',
        'cloudy',
        'rainy',
        'thunderstorm'
      );
      // Adicionar a classe de condição atual
      conditionElement.classList.add(weatherData.condition);
    }
    if (humidityElement) humidityElement.textContent = weatherData.humidity;
    if (windElement) windElement.textContent = weatherData.wind;

    console.log('Dados de clima atualizados:', weatherData);
  } catch (error) {
    console.error('Erro ao atualizar dados de clima:', error);
  }
}

/**
 * Configura atualizações periódicas dos widgets
 */
function setupPeriodicUpdates() {
  // Atualizar dados de clima a cada 30 minutos
  setInterval(updateWeatherData, 30 * 60 * 1000);

  // Verificar tabela de marés a cada 15 minutos
  setInterval(checkTideSchedule, 15 * 60 * 1000);
}

/**
 * Exibe o widget de clima no canto superior direito do mapa
 */
export function showWeatherWidget() {
  try {
    // Obter o elemento do widget existente
    let weatherWidget = document.getElementById('weather-widget');

    // Se o widget não existir, criá-lo
    if (!weatherWidget) {
      weatherWidget = document.createElement('div');
      weatherWidget.id = 'weather-widget';
      weatherWidget.className = 'weather-widget';

      // Criar a estrutura interna do widget
      weatherWidget.innerHTML = `
        <div class="weather-current">
          <div class="weather-icon"></div>
          <div class="weather-temp"></div>
        </div>
        <div class="weather-details">
          <div class="weather-humidity"></div>
          <div class="weather-wind"></div>
        </div>
      `;

      // Adicionar ao mapa
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        mapContainer.appendChild(weatherWidget);
      } else {
        // Se não encontrar o map-container, adicionar ao body
        document.body.appendChild(weatherWidget);
      }
    }

    // Preencher com dados atuais
    const currentWeather = weatherData.current;

    // Atualizar classes e conteúdo
    const iconElement = weatherWidget.querySelector('.weather-icon');
    if (iconElement) {
      // Remover classes de condição anteriores
      iconElement.classList.remove(
        'sunny',
        'partly-cloudy',
        'cloudy',
        'rainy',
        'stormy'
      );
      // Adicionar classe da condição atual
      iconElement.classList.add(currentWeather.condition);
    }

    const tempElement = weatherWidget.querySelector('.weather-temp');
    if (tempElement) {
      tempElement.textContent = `${currentWeather.temp}°C`;
    }

    const humidityElement = weatherWidget.querySelector('.weather-humidity');
    if (humidityElement) {
      humidityElement.textContent =
        getTranslatedText('humidity', selectedLanguage) +
        `: ${currentWeather.humidity}%`;
    }

    const windElement = weatherWidget.querySelector('.weather-wind');
    if (windElement) {
      windElement.textContent =
        getTranslatedText('wind', selectedLanguage) +
        `: ${currentWeather.wind} km/h`;
    }

    // Remover classe hidden para mostrar o widget
    weatherWidget.classList.remove('hidden');

    // Adicionar evento de clique para mostrar previsão completa
    weatherWidget.addEventListener('click', showFullForecast);

    // Armazenar referência ao widget
    activeWidgets.weather = weatherWidget;

    return weatherWidget;
  } catch (error) {
    console.error('Erro ao mostrar widget de clima:', error);
    return null;
  }
}

/**
 * Mostra a previsão completa ao clicar no widget
 */
export function showFullForecast() {
  try {
    // Verificar se já existe um modal aberto e removê-lo
    const existingModal = document.getElementById('forecast-modal');
    if (existingModal) {
      document.body.removeChild(existingModal);
      return;
    }

    // Criar o modal de previsão
    const forecastModal = document.createElement('div');
    forecastModal.id = 'forecast-modal';
    forecastModal.className = 'weather-forecast-modal';

    // Criar o conteúdo do modal
    let forecastHTML = `
      <div class="forecast-header">
        <h3>${getTranslatedText('forecastTitle', selectedLanguage)}</h3>
        <button class="forecast-close-btn">&times;</button>
      </div>
      <div class="forecast-content">
    `;

    // Adicionar previsão para cada dia
    weatherData.forecast.forEach((day) => {
      const date = new Date(day.date);
      const formattedDate = date.toLocaleDateString(
        getLocaleForLanguage(selectedLanguage),
        {
          weekday: 'short',
          day: 'numeric',
        }
      );

      forecastHTML += `
        <div class="forecast-day">
          <div class="forecast-date">${formattedDate}</div>
          <div class="forecast-icon ${day.condition}"></div>
          <div class="forecast-temps">${day.high}° / ${day.low}°</div>
        </div>
      `;
    });

    // Adicionar informações de marés
    forecastHTML += `
      <div class="tide-section">
        <h4>${getTranslatedText('tideTable', selectedLanguage)}</h4>
        <div class="tide-today">
    `;

    // Adicionar marés do dia atual
    const todayTides = tideData[0];
    todayTides.times.forEach((tide) => {
      forecastHTML += `
        <div class="tide-time">
          <span class="tide-hour">${tide.time}</span>
          <span class="tide-type">${tide.type === 'high' ? getTranslatedText('highTide', selectedLanguage) : getTranslatedText('lowTide', selectedLanguage)}</span>
          <span class="tide-level">${tide.level}m</span>
        </div>
      `;
    });

    forecastHTML += `
        </div>
      </div>
    </div>
    `;

    // Finalizar HTML
    forecastModal.innerHTML = forecastHTML;

    // Adicionar ao corpo do documento
    document.body.appendChild(forecastModal);

    // Configurar botão de fechar
    const closeBtn = forecastModal.querySelector('.forecast-close-btn');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(forecastModal);
    });

    // Fechar ao clicar fora do modal
    document.addEventListener('click', function closeModalOnOutsideClick(e) {
      if (
        e.target !== forecastModal &&
        !forecastModal.contains(e.target) &&
        e.target !== document.getElementById('weather-widget')
      ) {
        document.body.removeChild(forecastModal);
        document.removeEventListener('click', closeModalOnOutsideClick);
      }
    });
  } catch (error) {
    console.error('Erro ao mostrar previsão completa:', error);
  }
}

/**
 * Mostra a previsão matinal como notificação
 */
export function showMorningForecast() {
  try {
    const today = weatherData.forecast[0];

    const title = getTranslatedText('goodMorning', selectedLanguage);
    const message = `${getTranslatedText('todayForecast', selectedLanguage)} ${today.high}°C, 
                    ${getTranslatedText('min', selectedLanguage)} ${today.low}°C. 
                    ${getTranslatedText('weather', selectedLanguage)} ${getConditionText(today.condition, selectedLanguage)}.`;

    showNotification(title, message, 'info', 10000);
  } catch (error) {
    console.error('Erro ao mostrar previsão matinal:', error);
  }
}

/**
 * Verifica a tabela de marés e mostra notificações relevantes
 */
export function checkTideSchedule() {
  try {
    // Obter hora atual
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Converter para formato de comparação
    const currentTimeValue = currentHour * 60 + currentMinute;

    // Verifica as marés do dia
    const todayTides = tideData[0].times;

    // Encontrar a próxima maré
    let nextTide = null;
    let minutesToNextTide = Infinity;

    todayTides.forEach((tide) => {
      const [hours, minutes] = tide.time.split(':').map(Number);
      const tideTimeValue = hours * 60 + minutes;

      // Calcular diferença (em minutos)
      let diff = tideTimeValue - currentTimeValue;
      if (diff < 0) diff += 24 * 60; // Se for no dia seguinte

      if (diff < minutesToNextTide) {
        minutesToNextTide = diff;
        nextTide = tide;
      }
    });

    // Se a próxima maré estiver a menos de 60 minutos, mostrar notificação
    if (minutesToNextTide <= 60 && nextTide) {
      const hoursToTide = Math.floor(minutesToNextTide / 60);
      const minsToTide = minutesToNextTide % 60;
      let timeMessage = '';

      if (hoursToTide > 0) {
        timeMessage = `${hoursToTide}${getTranslatedText('hours', selectedLanguage)} ${getTranslatedText('and', selectedLanguage)} ${minsToTide}${getTranslatedText('minutes', selectedLanguage)}`;
      } else {
        timeMessage = `${minsToTide} ${getTranslatedText('minutes', selectedLanguage)}`;
      }

      const title = `${getTranslatedText('tideAlert', selectedLanguage)} ${nextTide.type === 'high' ? getTranslatedText('highTide', selectedLanguage) : getTranslatedText('lowTide', selectedLanguage)}`;
      const message = `${getTranslatedText('nextTide', selectedLanguage)} ${nextTide.type === 'high' ? getTranslatedText('highTide', selectedLanguage) : getTranslatedText('lowTide', selectedLanguage)} ${getTranslatedText('in', selectedLanguage)} ${timeMessage} (${nextTide.time}). 
                      ${getTranslatedText('predictedLevel', selectedLanguage)}: ${nextTide.level}m.`;

      showNotification(title, message, 'info', 8000);
    }
  } catch (error) {
    console.error('Erro ao verificar tabela de marés:', error);
  }
}

/**
 * Converte condição de clima para texto no idioma atual
 */
function getConditionText(condition, language = selectedLanguage) {
  const translations = {
    pt: {
      sunny: 'ensolarado',
      'partly-cloudy': 'parcialmente nublado',
      cloudy: 'nublado',
      rainy: 'chuvoso',
      stormy: 'tempestuoso',
    },
    en: {
      sunny: 'sunny',
      'partly-cloudy': 'partly cloudy',
      cloudy: 'cloudy',
      rainy: 'rainy',
      stormy: 'stormy',
    },
    es: {
      sunny: 'soleado',
      'partly-cloudy': 'parcialmente nublado',
      cloudy: 'nublado',
      rainy: 'lluvioso',
      stormy: 'tormentoso',
    },
    he: {
      sunny: 'שמשי',
      'partly-cloudy': 'מעונן חלקית',
      cloudy: 'מעונן',
      rainy: 'גשום',
      stormy: 'סוער',
    },
  };

  // Verificar se o idioma e a condição existem
  if (translations[language] && translations[language][condition]) {
    return translations[language][condition];
  }

  // Fallback para português
  if (translations.pt && translations.pt[condition]) {
    return translations.pt[condition];
  }

  return condition;
}

/**
 * Obtém o código de localidade para formatação de data/hora baseado no idioma
 */
function getLocaleForLanguage(language) {
  const localeMap = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
    he: 'he-IL',
  };

  return localeMap[language] || 'pt-BR';
}

/**
 * Obtém textos traduzidos para widgets
 */
function getTranslatedText(key, language = selectedLanguage) {
  const translations = {
    pt: {
      humidity: 'Umidade',
      wind: 'Vento',
      forecastTitle: 'Previsão para Morro de São Paulo',
      tideTable: 'Tabela de Marés',
      highTide: 'Alta',
      lowTide: 'Baixa',
      goodMorning: 'Bom dia! ☀️ Previsão de hoje',
      todayForecast: 'Hoje teremos máxima de',
      min: 'mínima de',
      weather: 'Clima',
      tideAlert: 'Alerta de Maré',
      nextTide: 'Próxima maré',
      in: 'em',
      predictedLevel: 'Nível previsto',
      hours: 'h',
      minutes: 'min',
      and: 'e',
    },
    en: {
      humidity: 'Humidity',
      wind: 'Wind',
      forecastTitle: 'Forecast for Morro de São Paulo',
      tideTable: 'Tide Table',
      highTide: 'High',
      lowTide: 'Low',
      goodMorning: "Good morning! ☀️ Today's forecast",
      todayForecast: "Today we'll have a high of",
      min: 'low of',
      weather: 'Weather',
      tideAlert: 'Tide Alert',
      nextTide: 'Next tide',
      in: 'in',
      predictedLevel: 'Predicted level',
      hours: 'h',
      minutes: 'min',
      and: 'and',
    },
    es: {
      humidity: 'Humedad',
      wind: 'Viento',
      forecastTitle: 'Pronóstico para Morro de São Paulo',
      tideTable: 'Tabla de Mareas',
      highTide: 'Alta',
      lowTide: 'Baja',
      goodMorning: '¡Buenos días! ☀️ Pronóstico de hoy',
      todayForecast: 'Hoy tendremos máxima de',
      min: 'mínima de',
      weather: 'Clima',
      tideAlert: 'Alerta de Marea',
      nextTide: 'Próxima marea',
      in: 'en',
      predictedLevel: 'Nivel previsto',
      hours: 'h',
      minutes: 'min',
      and: 'y',
    },
    he: {
      humidity: 'לחות',
      wind: 'רוח',
      forecastTitle: 'תחזית עבור מורו דה סאו פאולו',
      tideTable: 'טבלת גאות ושפל',
      highTide: 'גאות',
      lowTide: 'שפל',
      goodMorning: 'בוקר טוב! ☀️ תחזית להיום',
      todayForecast: 'היום יהיה לנו מקסימום של',
      min: 'מינימום של',
      weather: 'מזג אוויר',
      tideAlert: 'התראת גאות',
      nextTide: 'גאות הבאה',
      in: 'ב',
      predictedLevel: 'רמה צפויה',
      hours: 'ש',
      minutes: 'דק',
      and: 'ו',
    },
  };

  // Verificar se o idioma e a chave existem
  if (translations[language] && translations[language][key]) {
    return translations[language][key];
  }

  // Fallback para português
  if (translations.pt && translations.pt[key]) {
    return translations.pt[key];
  }

  return key;
}
