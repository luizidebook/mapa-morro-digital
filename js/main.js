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
import { setupEventListeners } from './core/event-listeners.js';
import { autoAdjustTheme } from './core/config.js';

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
/**
 * Inicializa o mapa Leaflet e configura as camadas.
 */
let map; // Variável global para o mapa

export function initializeMap() {
  if (map) {
    console.warn('Mapa já inicializado.');
    return;
  }

  console.log('Inicializando mapa...');

  // Define as camadas de tiles
  const tileLayers = {
    streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }),
  };

  // Cria o mapa com uma visão inicial
  map = L.map('map', {
    layers: [tileLayers.streets],
    zoomControl: true,
    maxZoom: 19,
    minZoom: 3,
  }).setView([-13.378, -38.918], 14);

  console.log('Mapa inicializado com sucesso.');
}

export { map }; // Exporta a variável `map` para ser usada em outros módulos

/**
 * Retorna a camada de tiles para o mapa.
 * @returns {Object} Camada de tiles Leaflet.
 */
export function getTileLayer() {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  });
}

//showWelcomeMessage - Exibe a mensagem de boas-vindas e habilita os botões de idioma.
// Função: Exibe a mensagem de boas-vindas e habilita os botões de idioma
export function showWelcomeMessage() {
  const modal = document.getElementById('welcome-modal');
  if (!modal) return;
  modal.style.display = 'block';
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.style.pointerEvents = 'auto';
  });
  console.log('Mensagem de boas-vindas exibida.');
}
