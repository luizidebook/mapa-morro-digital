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
  console.log('Iniciando aplicação...');

  try {
    initializeMap();
  } catch (error) {
    console.error('Erro ao inicializar o mapa:', error);
  }

  try {
    showWelcomeMessage();
  } catch (error) {
    console.error('Erro ao exibir mensagem de boas-vindas:', error);
  }

  try {
    setupEventListeners();
  } catch (error) {
    console.error('Erro ao configurar ouvintes de eventos:', error);
  }

  try {
    autoAdjustTheme();
  } catch (error) {
    console.error('Erro ao ajustar o tema:', error);
  }

  console.log('Aplicação inicializada com sucesso!');
}

<script nomodule>
  alert('Seu navegador não suporta ES Modules. Atualize para continuar.');
</script>;
