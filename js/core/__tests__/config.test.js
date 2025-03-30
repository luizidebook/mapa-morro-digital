import {
  loadResources,
  showWelcomeMessage,
  setLanguage,
  updateInterfaceLanguage,
} from '../config.js';

describe('config.js', () => {
  beforeEach(() => {
    // Limpa o DOM antes de cada teste
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('loadResources deve exibir e ocultar o loader corretamente', () => {
    // Configura o DOM
    document.body.innerHTML = '<div id="loader" style="display: none;"></div>';
    const loader = document.getElementById('loader');

    // Mock do callback
    const mockCallback = jest.fn();

    // Executa a função
    loadResources(mockCallback);

    // Verifica se o loader foi exibido
    expect(loader.style.display).toBe('block');

    // Simula o término do carregamento
    jest.runAllTimers();

    // Verifica se o loader foi ocultado
    expect(loader.style.display).toBe('none');

    // Verifica se o callback foi chamado
    expect(mockCallback).toHaveBeenCalled();
  });

  test('showWelcomeMessage deve exibir o modal de boas-vindas e habilitar os botões de idioma', () => {
    // Configura o DOM
    document.body.innerHTML = `
      <div id="welcome-modal" style="display: none;"></div>
      <button class="lang-btn" style="pointer-events: none;"></button>
      <button class="lang-btn" style="pointer-events: none;"></button>
    `;
    const modal = document.getElementById('welcome-modal');
    const langButtons = document.querySelectorAll('.lang-btn');

    // Executa a função
    showWelcomeMessage();

    // Verifica se o modal foi exibido
    expect(modal.style.display).toBe('block');

    // Verifica se os botões de idioma foram habilitados
    langButtons.forEach((btn) => {
      expect(btn.style.pointerEvents).toBe('auto');
    });
  });

  test('setLanguage deve definir e salvar o idioma corretamente', () => {
    // Mock do localStorage
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    // Executa a função com um idioma válido
    setLanguage('en');
    expect(setItemSpy).toHaveBeenCalledWith('preferredLanguage', 'en');
    expect(console.log).toHaveBeenCalledWith('Idioma definido para: en');

    // Executa a função com um idioma inválido
    setLanguage('invalid-lang');
    expect(setItemSpy).toHaveBeenCalledWith('preferredLanguage', 'pt');
    expect(console.warn).toHaveBeenCalledWith(
      'Idioma inválido. Revertendo para o padrão: pt'
    );

    // Restaura o mock
    setItemSpy.mockRestore();
  });

  test('updateInterfaceLanguage deve atualizar os textos da interface corretamente', () => {
    // Mock do DOM
    document.body.innerHTML = `
      <div data-i18n="welcome"></div>
      <input data-i18n="placeholder" placeholder="">
    `;

    // Mock da função getGeneralText
    const mockGetGeneralText = jest.fn((key, lang) => {
      const translations = {
        welcome: { en: 'Welcome', pt: 'Bem-vindo' },
        placeholder: { en: 'Enter text', pt: 'Digite o texto' },
      };
      return translations[key]?.[lang] || `⚠️ Missing translation for ${key}`;
    });
    global.getGeneralText = mockGetGeneralText;

    // Executa a função
    updateInterfaceLanguage('en');

    // Verifica se os textos foram atualizados
    const welcomeElement = document.querySelector('[data-i18n="welcome"]');
    const placeholderElement = document.querySelector(
      '[data-i18n="placeholder"]'
    );

    expect(welcomeElement.textContent).toBe('Welcome');
    expect(placeholderElement.placeholder).toBe('Enter text');

    // Verifica se a função getGeneralText foi chamada corretamente
    expect(mockGetGeneralText).toHaveBeenCalledWith('welcome', 'en');
    expect(mockGetGeneralText).toHaveBeenCalledWith('placeholder', 'en');
  });

  test('updateInterfaceLanguage deve exibir avisos para traduções ausentes', () => {
    // Mock do DOM
    document.body.innerHTML = `
      <div data-i18n="missing-key"></div>
    `;

    // Mock da função getGeneralText
    const mockGetGeneralText = jest.fn(() => '⚠️ Missing translation');
    global.getGeneralText = mockGetGeneralText;

    // Espiona o console.warn
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    // Executa a função
    updateInterfaceLanguage('en');

    // Verifica se o aviso foi exibido
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Tradução ausente para: 'missing-key' em 'en'."
    );

    // Restaura o mock
    consoleWarnSpy.mockRestore();
  });
});
