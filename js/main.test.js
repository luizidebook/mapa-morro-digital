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
    onDOMContentLoaded();

    expect(initializeMap).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled();
    expect(setupEventListeners).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
  });

  test('Deve capturar erros na inicialização do mapa e continuar o fluxo', () => {
    initializeMap.mockImplementation(() => {
      throw new Error('Erro ao inicializar o mapa');
    });

    expect(() => onDOMContentLoaded()).not.toThrow();

    expect(initializeMap).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled();
    expect(setupEventListeners).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
  });

  test('Deve capturar erros na exibição da mensagem de boas-vindas e continuar o fluxo', () => {
    showWelcomeMessage.mockImplementation(() => {
      throw new Error('Erro ao exibir mensagem de boas-vindas');
    });

    expect(() => onDOMContentLoaded()).not.toThrow();

    expect(initializeMap).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled();
    expect(setupEventListeners).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
  });

  test('Deve capturar erros na configuração de ouvintes de eventos e continuar o fluxo', () => {
    setupEventListeners.mockImplementation(() => {
      throw new Error('Erro ao configurar ouvintes de eventos');
    });

    expect(() => onDOMContentLoaded()).not.toThrow();

    expect(initializeMap).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled();
    expect(setupEventListeners).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
  });

  test('Deve capturar erros no ajuste do tema e continuar o fluxo', () => {
    autoAdjustTheme.mockImplementation(() => {
      throw new Error('Erro ao ajustar o tema');
    });

    expect(() => onDOMContentLoaded()).not.toThrow();

    expect(initializeMap).toHaveBeenCalled();
    expect(showWelcomeMessage).toHaveBeenCalled();
    expect(setupEventListeners).toHaveBeenCalled();
    expect(autoAdjustTheme).toHaveBeenCalled();
  });
});
