import { initializeMap, showWelcomeMessage } from '../js/map/map-core.js';
import { autoAdjustTheme } from '../js/ui/theme.js';
import { setupEventListeners } from '../js/core/event-listeners.js';

jest.mock('../js/map/map-core.js', () => ({
  initializeMap: jest.fn(),
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

  test('Deve executar o fluxo de inicialização corretamente quando o DOM é carregado', () => {
    // Simula o evento DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Verifica se as funções principais foram chamadas
    expect(initializeMap).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled();
    expect(setupEventListeners).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
  });

  test('Deve capturar e exibir erros durante a inicialização', () => {
    // Simula um erro em uma das funções
    initializeMap.mockImplementation(() => {
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
