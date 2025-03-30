import { initializeMap } from './map/map-core.js';
import { showWelcomeMessage } from './core/config.js';
import { setupEventListeners } from './core/event-listeners.js';
import { autoAdjustTheme } from './ui/theme.js';
import { onDOMContentLoaded } from './main.js';

// Mock das funções importadas
jest.mock('./map/map-core.js', () => ({
  initializeMap: jest.fn(),
}));

jest.mock('./core/config.js', () => ({
  showWelcomeMessage: jest.fn(),
}));

jest.mock('./core/event-listeners.js', () => ({
  setupEventListeners: jest.fn(),
}));

jest.mock('./ui/theme.js', () => ({
  autoAdjustTheme: jest.fn(),
}));

describe('Teste de inicialização do main.js', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpa os mocks antes de cada teste
  });

  test('Deve executar todas as funções de inicialização corretamente', () => {
    // Simula o evento DOMContentLoaded
    onDOMContentLoaded();

    // Verifica se cada função foi chamada
    expect(initializeMap).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled();
    expect(setupEventListeners).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
  });

  test('Deve capturar erros na inicialização do mapa', () => {
    // Simula um erro na função initializeMap
    initializeMap.mockImplementation(() => {
      throw new Error('Erro ao inicializar o mapa');
    });

    // Executa a função
    expect(() => onDOMContentLoaded()).not.toThrow();

    // Verifica se o erro foi tratado e as outras funções foram chamadas
    expect(initializeMap).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled(); // Deve continuar chamando as outras funções
    expect(setupEventListeners).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
  });

  test('Deve capturar erros na exibição da mensagem de boas-vindas', () => {
    // Simula um erro na função showWelcomeMessage
    showWelcomeMessage.mockImplementation(() => {
      throw new Error('Erro ao exibir mensagem de boas-vindas');
    });

    // Executa a função
    expect(() => onDOMContentLoaded()).not.toThrow();

    // Verifica se o erro foi tratado e as outras funções foram chamadas
    expect(initializeMap).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled();
    expect(setupEventListeners).toHaveBeenCalled(); // Deve continuar chamando as outras funções
    expect(autoAdjustTheme).toHaveBeenCalled();
  });
});
