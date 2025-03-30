import {
  onDOMContentLoaded,
  setupEventListeners,
  handleUserIdleState,
} from '../event-listeners.js';
import { initializeMap } from '../../map/map-core.js';
import { loadResources } from '../config.js';
import { autoAdjustTheme } from '../../ui/theme.js';
import { endNavigation } from '../../navigation/navigation-control.js';
import { restoreFeatureUI } from '../../map/map-core.js';
import { showNotification } from '../../ui/notifications.js';
import { calculateDistance } from '../../navigation/route.js';

jest.mock('../../map/map-core.js', () => ({
  initializeMap: jest.fn(),
  restoreFeatureUI: jest.fn(),
}));

jest.mock('../config.js', () => ({
  loadResources: jest.fn(),
}));

jest.mock('../../ui/theme.js', () => ({
  autoAdjustTheme: jest.fn(),
}));

jest.mock('../../navigation/navigation-control.js', () => ({
  endNavigation: jest.fn(),
}));

jest.mock('../../ui/notifications.js', () => ({
  showNotification: jest.fn(),
}));

jest.mock('../../navigation/route.js', () => ({
  calculateDistance: jest.fn(() => 10),
}));

describe('event-listeners.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <button id="cancel-route-btn"></button>
      <button class="lang-btn" data-lang="en"></button>
      <button class="lang-btn" data-lang="pt"></button>
    `;
  });

  test('onDOMContentLoaded deve chamar as funções de inicialização corretamente', () => {
    // Simula o evento DOMContentLoaded
    onDOMContentLoaded();

    // Verifica se as funções foram chamadas
    expect(initializeMap).toHaveBeenCalled();
    expect(loadResources).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
    console.log('DOM completamente carregado e inicializado.');
  });

  test('setupEventListeners deve configurar os ouvintes de eventos corretamente', () => {
    setupEventListeners();

    // Simula o clique no botão "cancel-route-btn"
    const cancelRouteBtn = document.getElementById('cancel-route-btn');
    cancelRouteBtn.click();
    expect(endNavigation).toHaveBeenCalled();
    expect(restoreFeatureUI).toHaveBeenCalledWith('lastSelectedFeature');

    // Simula o clique nos botões de idioma
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach((button) => {
      button.click();
      expect(button.dataset.lang).toBeDefined();
    });
  });

  test('handleUserIdleState deve detectar inatividade corretamente', () => {
    const lastLocation = { latitude: -13.3782, longitude: -38.914 };
    const currentLocation = { latitude: -13.3782, longitude: -38.914 };

    handleUserIdleState(lastLocation, currentLocation);

    expect(calculateDistance).toHaveBeenCalledWith(
      lastLocation.latitude,
      lastLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );
    expect(showNotification).toHaveBeenCalledWith(
      'Você está inativo. Deseja recalcular a rota?',
      'info'
    );
  });
});
