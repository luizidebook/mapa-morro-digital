import * as mapCore from '../js/map/map-core.js';
import * as theme from '../js/ui/theme.js';
import * as eventListeners from '../js/core/event-listeners.js';

jest.mock('../js/map/map-core.js', () => ({
  initializeMap: jest.fn(),
  loadResources: jest.fn(),
  showWelcomeMessage: jest.fn(),
}));

jest.mock('../js/ui/theme.js', () => ({
  autoAdjustTheme: jest.fn(),
}));

jest.mock('../js/core/event-listeners.js', () => ({
  setupEventListeners: jest.fn(),
}));

describe('scripts.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Deve chamar todas as funções de inicialização corretamente', () => {
    // Simula o evento DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Verifica se as funções foram chamadas
    expect(mapCore.initializeMap).toHaveBeenCalled();
    expect(mapCore.loadResources).toHaveBeenCalled();
    expect(mapCore.showWelcomeMessage).toHaveBeenCalled();
    expect(eventListeners.setupEventListeners).toHaveBeenCalled();
    expect(theme.autoAdjustTheme).toHaveBeenCalled();
  });

  test('Deve capturar e exibir erros durante a inicialização', () => {
    // Simula um erro em uma das funções
    mapCore.initializeMap.mockImplementation(() => {
      throw new Error('Erro simulado');
    });

    // Espiona o console.error
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Simula o evento DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Verifica se o erro foi capturado e exibido
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro durante a inicialização:',
      expect.any(Error)
    );

    // Restaura o console.error
    consoleErrorSpy.mockRestore();
  });
});
