import { initializeMap, showWelcomeMessage } from '../js/map/map-core.js';
import { autoAdjustTheme } from '../ui/theme.js';
import { setupEventListeners } from '../core/event-listeners.js';
import { loadResources } from '../core/config.js';

jest.mock('../js/map/map-core.js', () => ({
  initializeMap: jest.fn(),
  showWelcomeMessage: jest.fn(),
}));

jest.mock('../ui/theme.js', () => ({
  autoAdjustTheme: jest.fn(),
}));

jest.mock('../core/event-listeners.js', () => ({
  setupEventListeners: jest.fn(),
}));

jest.mock('../core/config.js', () => ({
  loadResources: jest.fn(),
}));

describe('scripts.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Deve executar o fluxo de inicialização corretamente', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(initializeMap).toHaveBeenCalled();
    expect(loadResources).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled();
    expect(setupEventListeners).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
  });

  test('Deve capturar e exibir erros durante a inicialização', () => {
    initializeMap.mockImplementation(() => {
      throw new Error('Erro simulado');
    });

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro durante a inicialização:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
