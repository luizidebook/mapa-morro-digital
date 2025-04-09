// submenu.js – Gerenciamento de submenus por categoria

/* O que ele faz:
Usa fetchOSMData() (a ser implementado) para buscar dados da categoria.
Renderiza dinamicamente os itens de submenu.
Adiciona eventos de clique que mostram o local no mapa via showLocationOnMap().*/

import { fetchOSMData } from "./osm-service.js";
import { showLocationOnMap } from "./map-controls.js";
import { queries } from "./osm-service.js";

let submenuData = {};
let selectedFeature = null;

/**
 * Cria botões dinâmicos para cada query no submenu.
 */
export function createSubmenuButtons() {
  const container = document.getElementById("buttonGroup");
  if (!container) return console.error("Elemento #buttonGroup não encontrado.");

  // Limpa os botões existentes
  container.innerHTML = "";

  // Cria um botão para cada query
  Object.keys(queries).forEach((key) => {
    const button = document.createElement("button");
    button.className = "control-button";
    button.textContent = formatButtonLabel(key);
    button.addEventListener("click", () => loadSubMenu(key));
    container.appendChild(button);
  });

  container.classList.remove("hidden");
}

/**
 * Carrega os itens de submenu com base na query escolhida.
 * @param {string} queryKey - Chave da query (ex: 'beaches-submenu').
 */
export async function loadSubMenu(queryKey) {
  const container = document.getElementById("submenuContainer");
  if (!container) return console.error("Submenu container não encontrado.");

  container.innerHTML = "<p>Carregando...</p>";

  try {
    // Atualiza a feature selecionada
    selectedFeature = queryKey;

    // Busca dados da OSM
    const results = await fetchOSMData(queryKey);

    submenuData[queryKey] = results;
    renderSubmenuItems(container, results);
  } catch (err) {
    container.innerHTML = "<p>Erro ao carregar dados.</p>";
    console.error("Erro no submenu:", err);
  }
}

/**
 * Renderiza os itens da lista de submenu na interface.
 * @param {HTMLElement} container - Elemento que conterá os itens.
 * @param {Array} items - Lista de locais.
 */
function renderSubmenuItems(container, items) {
  container.innerHTML = "";
  const ul = document.createElement("ul");
  ul.className = "submenu-list";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="submenu-item-icon">
        <i class="fas fa-map-marker-alt"></i>
      </div>
      <div class="submenu-item-content">
        <div class="submenu-item-title">${item.name}</div>
        <div class="submenu-item-description">${item.tags?.description || "Sem descrição disponível"}</div>
      </div>
    `;
    li.dataset.index = index;
    li.classList.add("submenu-item");
    ul.appendChild(li);
  });

  container.appendChild(ul);

  // Remove a classe 'hidden' para exibir o submenu
  container.parentElement.classList.remove("hidden");

  setupSubmenuClickListeners(ul);
}

/**
 * Ativa os eventos de clique nos itens do submenu.
 * @param {HTMLElement} ul - Lista UL contendo os itens.
 */
function setupSubmenuClickListeners(ul) {
  ul.querySelectorAll(".submenu-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = item.dataset.index;
      handleSubmenuItemClick(index);
    });
  });
}

/**
 * Trata o clique em um item do submenu e exibe no mapa.
 * @param {number} index - Índice do item clicado.
 */
export function handleSubmenuItemClick(index) {
  const item = submenuData[selectedFeature]?.[index];
  if (!item) return;

  showLocationOnMap(item.name, item.lat, item.lon); // Mostra no mapa
  console.log("[Submenu] Local selecionado:", item.name);
}

/**
 * Formata o rótulo do botão com base na chave da query.
 * @param {string} key - Chave da query.
 * @returns {string} Rótulo formatado.
 */
function formatButtonLabel(key) {
  return key.replace("-submenu", "").replace(/-/g, " ").toUpperCase();
}
