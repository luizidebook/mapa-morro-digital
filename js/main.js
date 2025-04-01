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
export let map;
export function initializeMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Elemento #map não encontrado no DOM.');
    showNotification(
      'Erro ao carregar o mapa. Elemento não encontrado.',
      'error'
    );
    return;
  }

  // Inicialização do mapa Leaflet
  map = L.map('map').setView([-13.3766787, -38.9172057], 13); // Coordenadas iniciais
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
}

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
