/**
 * Sistema de informações de clima e maré para o Mapa Morro Digital
 */

// Dados simulados para clima - em um sistema real, seria conectado a uma API
const weatherData = {
  current: {
    temp: 28,
    condition: 'sunny', // sunny, cloudy, rainy, stormy
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

/**
 * Exibe o widget de clima no canto superior direito do mapa
 */
export function showWeatherWidget() {
  // Criar o elemento do widget
  const weatherWidget = document.createElement('div');
  weatherWidget.id = 'weather-widget';
  weatherWidget.className = 'weather-widget';

  // Preencher com dados atuais
  const currentWeather = weatherData.current;
  weatherWidget.innerHTML = `
    <div class="weather-current">
      <div class="weather-icon ${currentWeather.condition}"></div>
      <div class="weather-temp">${currentWeather.temp}°C</div>
    </div>
    <div class="weather-details">
      <div class="weather-humidity">Umidade: ${currentWeather.humidity}%</div>
      <div class="weather-wind">Vento: ${currentWeather.wind} km/h</div>
    </div>
  `;

  // Adicionar ao mapa
  const mapContainer = document.getElementById('map-container');
  if (mapContainer) {
    mapContainer.appendChild(weatherWidget);
  }

  // Adicionar evento de clique para mostrar previsão completa
  weatherWidget.addEventListener('click', showFullForecast);
}

/**
 * Mostra a previsão completa ao clicar no widget
 */
function showFullForecast() {
  // Criar o modal de previsão
  const forecastModal = document.createElement('div');
  forecastModal.id = 'forecast-modal';
  forecastModal.className = 'weather-forecast-modal';

  // Criar o conteúdo do modal
  let forecastHTML = `
    <div class="forecast-header">
      <h3>Previsão para Morro de São Paulo</h3>
      <button class="forecast-close-btn">&times;</button>
    </div>
    <div class="forecast-content">
  `;

  // Adicionar previsão para cada dia
  weatherData.forecast.forEach((day) => {
    const date = new Date(day.date);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
    });

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
      <h4>Tabela de Marés</h4>
      <div class="tide-today">
  `;

  // Adicionar marés do dia atual
  const todayTides = tideData[0];
  todayTides.times.forEach((tide) => {
    forecastHTML += `
      <div class="tide-time">
        <span class="tide-hour">${tide.time}</span>
        <span class="tide-type">${tide.type === 'high' ? 'Alta' : 'Baixa'}</span>
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
}

/**
 * Mostra a previsão matinal como notificação
 */
export function showMorningForecast() {
  const today = weatherData.forecast[0];
  const notification = {
    title: 'Bom dia! ☀️ Previsão de hoje',
    message: `Hoje teremos máxima de ${today.high}°C, mínima de ${today.low}°C. 
              Clima ${getConditionText(today.condition)}.`,
    type: 'info',
    duration: 10000,
  };

  showNotification(
    notification.title,
    notification.message,
    notification.type,
    notification.duration
  );
}

/**
 * Verifica a tabela de marés e mostra notificações relevantes
 */
export function checkTideSchedule() {
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
      timeMessage = `${hoursToTide}h e ${minsToTide}min`;
    } else {
      timeMessage = `${minsToTide} minutos`;
    }

    const notification = {
      title: `Alerta de Maré ${nextTide.type === 'high' ? 'Alta' : 'Baixa'}`,
      message: `Próxima maré ${nextTide.type === 'high' ? 'alta' : 'baixa'} em ${timeMessage} (${nextTide.time}). 
                Nível previsto: ${nextTide.level}m.`,
      type: 'info',
      duration: 8000,
    };

    showNotification(
      notification.title,
      notification.message,
      notification.type,
      notification.duration
    );
  }
}

/**
 * Converte condição de clima para texto em português
 */
function getConditionText(condition) {
  const conditions = {
    sunny: 'ensolarado',
    'partly-cloudy': 'parcialmente nublado',
    cloudy: 'nublado',
    rainy: 'chuvoso',
    stormy: 'tempestuoso',
  };

  return conditions[condition] || condition;
}

/**
 * Mostra uma notificação na interface
 */
function showNotification(title, message, type = 'info', duration = 5000) {
  // Verificar se a função já existe no escopo global
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type, duration);
    return;
  }

  // Implementação própria caso a função global não exista
  const container =
    document.getElementById('notification-container') ||
    createNotificationContainer();

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;

  notification.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
    <button class="notification-close">&times;</button>
  `;

  container.appendChild(notification);

  // Adicionar evento de fechar
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    container.removeChild(notification);
  });

  // Auto remover após duração especificada
  setTimeout(() => {
    if (notification.parentNode === container) {
      container.removeChild(notification);
    }
  }, duration);
}

/**
 * Cria container de notificações se não existir
 */
function createNotificationContainer() {
  const container = document.createElement('div');
  container.id = 'notification-container';
  container.className = 'notification-container';
  document.body.appendChild(container);
  return container;
}
