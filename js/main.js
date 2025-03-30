// -------------------------
// main.js – Ponto de entrada principal da aplicação
// -------------------------

/**
 * Este arquivo contém as funções principais para inicialização da aplicação:
 *
 * initializeMap - Responsável por criar e configurar a instância do mapa Leaflet
 * initializeAssistant - Inicializa o assistente virtual da aplicação
 * loadResources - Carrega recursos necessários como textos, imagens e configurações
 * autoAdjustTheme - Ajusta o tema da interface (claro/escuro) com base nas preferências do usuário
 * showWelcomeMessage - Exibe a mensagem de boas-vindas e seleção de idioma inicial
 */

// Importações do módulo core/config.js
import { initializeMap } from './map/map-core.js';
import { showWelcomeMessage } from './core/config.js';
import { setupEventListeners } from './core/event-listeners.js';
import { autoAdjustTheme } from './ui/theme.js';

/**
 * Evento DOMContentLoaded - Executado quando o DOM está totalmente carregado
 * Este é o ponto de entrada principal da aplicação, onde iniciamos todos os
 * componentes essenciais na ordem correta.
 */

document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

export function onDOMContentLoaded() {
  try {
    console.log('Iniciando aplicação...');

    // Inicializa o mapa Leaflet com as configurações padrão
    initializeMap();
    // Exibe a tela de boas-vindas com seleção de idioma
    showWelcomeMessage();
    // Configura todos os event listeners para interação do usuário
    setupEventListeners();
    // Ajusta o tema da interface (claro/escuro) com base nas preferências
    autoAdjustTheme();

    console.log('Aplicação inicializada com sucesso!');
  } catch (error) {
    // Captura e registra qualquer erro durante a inicialização
    console.error('Erro durante a inicialização:', error);

    // Exibe mensagem de erro ao usuário
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent =
      'Ocorreu um erro ao iniciar o aplicativo. Por favor, recarregue a página.';
    document.body.appendChild(errorMessage);
  }
}
