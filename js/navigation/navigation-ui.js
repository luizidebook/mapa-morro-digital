import { appState } from "../core/state.js";
import { eventBus, EVENT_TYPES } from "../core/eventBus.js";
import { translate, getDirectionText } from "../i18n/language.js";
import { formatDistance, formatDuration } from "../utils/geo.js";
import { estimateArrivalTime } from "./route.js";
import {
  isNavigationActive,
  isNavigationPaused,
  getNavigationProgress,
} from "./navigation-state.js";

/**
 * Módulo de UI de Navegação
 * Responsável por gerenciar a interface relacionada à navegação
 */

/**
 * Inicializa a interface de navegação
 */
export function initNavigationUI() {
  // Subscrever aos eventos relevantes
  subscribeToEvents();
}

/**
 * Subscreve aos eventos relacionados à navegação
 */
function subscribeToEvents() {
  // Evento de navegação iniciada
  eventBus.subscribe(EVENT_TYPES.NAVIGATION_STARTED, () => {
    showNavigationPanel();
  });

  // Evento de navegação encerrada
  eventBus.subscribe(EVENT_TYPES.NAVIGATION_ENDED, () => {
    hideNavigationPanel();
  });

  // Evento de atualização de passo
  eventBus.subscribe(EVENT_TYPES.NAVIGATION_STEP_CHANGED, (data) => {
    updateInstructionDisplay(
      appState.get("route.current")?.instructions,
      data.index
    );
  });

  // Evento de progresso atualizado
  eventBus.subscribe(EVENT_TYPES.NAVIGATION_PROGRESS_UPDATED, (data) => {
    updateNavigationProgress(data.progress);
  });

  // Evento de necessidade de atualização da exibição de instruções
  eventBus.subscribe(EVENT_TYPES.INSTRUCTION_DISPLAY_UPDATE_NEEDED, (data) => {
    updateInstructionDisplay(data.instructions, data.currentIndex);
  });
}

/**
 * Exibe o painel de navegação
 */
export function showNavigationPanel() {
  // Obter ou criar o container do painel de navegação
  let navigationPanel = document.getElementById("navigation-panel");

  if (!navigationPanel) {
    navigationPanel = createNavigationPanel();
    document.body.appendChild(navigationPanel);
  }

  // Mostrar o painel
  navigationPanel.classList.add("active");

  // Atualizar com as informações iniciais
  updateNavigationInfo();

  // Iniciar atualizações periódicas
  startPeriodicUpdates();
}

/**
 * Cria o painel de navegação
 * @returns {HTMLElement} Elemento DOM do painel
 */
function createNavigationPanel() {
  const panel = document.createElement("div");
  panel.id = "navigation-panel";
  panel.className = "navigation-panel";

  // Estrutura interna do painel
  panel.innerHTML = `
    <div class="nav-header">
      <button id="nav-close-btn" class="nav-close-btn" aria-label="${translate(
        "close"
      )}">
        <i class="fas fa-times"></i>
      </button>
      <div class="nav-title">${translate("navigation")}</div>
      <button id="nav-toggle-btn" class="nav-toggle-btn" aria-label="${translate(
        "minimize"
      )}">
        <i class="fas fa-chevron-down"></i>
      </button>
    </div>
    
    <div class="nav-info">
      <div class="nav-progress-container">
        <div class="nav-progress-bar">
          <div class="nav-progress-fill" style="width: 0%"></div>
        </div>
        <div class="nav-eta">
          <i class="fas fa-clock"></i>
          <span id="nav-eta-text">--:--</span>
        </div>
      </div>
      
      <div class="nav-distance">
        <i class="fas fa-road"></i>
        <span id="nav-remaining-distance">-- km</span>
      </div>
    </div>
    
    <div class="nav-instructions">
      <div class="nav-current-instruction">
        <div class="instruction-icon">
          <i class="fas fa-arrow-right"></i>
        </div>
        <div class="instruction-text" id="current-instruction-text">
          ${translate("starting-navigation")}
        </div>
      </div>
      
      <div class="nav-next-instruction">
        <div class="instruction-preface">${translate("then")}</div>
        <div class="instruction-text" id="next-instruction-text">
          ${translate("loading-next-instruction")}
        </div>
      </div>
    </div>
    
    <div class="nav-controls">
      <button id="nav-previous-btn" class="nav-control-btn" aria-label="${translate(
        "previous-step"
      )}">
        <i class="fas fa-step-backward"></i>
      </button>
      <button id="nav-pause-btn" class="nav-control-btn" aria-label="${translate(
        "pause"
      )}">
        <i class="fas fa-pause"></i>
      </button>
      <button id="nav-next-btn" class="nav-control-btn" aria-label="${translate(
        "next-step"
      )}">
        <i class="fas fa-step-forward"></i>
      </button>
    </div>
  `;

  // Adicionar event listeners
  setTimeout(() => {
    // Botão de fechar navegação
    const closeBtn = panel.querySelector("#nav-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        // Importar sob demanda para evitar dependência circular
        const navigationState = require("./navigation-state.js");
        navigationState.stopNavigation();
      });
    }

    // Botão de minimizar/expandir
    const toggleBtn = panel.querySelector("#nav-toggle-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        panel.classList.toggle("minimized");
        toggleBtn.querySelector("i").classList.toggle("fa-chevron-down");
        toggleBtn.querySelector("i").classList.toggle("fa-chevron-up");
      });
    }

    // Botão de pausar/retomar
    const pauseBtn = panel.querySelector("#nav-pause-btn");
    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        const navigationState = require("./navigation-state.js");
        const isPaused = navigationState.isNavigationPaused();
        navigationState.pauseNavigation(!isPaused);

        // Atualizar ícone
        pauseBtn.innerHTML = `<i class="fas fa-${
          isPaused ? "pause" : "play"
        }"></i>`;
        pauseBtn.setAttribute(
          "aria-label",
          translate(isPaused ? "pause" : "resume")
        );
      });
    }

    // Botão de passo anterior
    const prevBtn = panel.querySelector("#nav-previous-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const { prevInstructionStep } = require("./route.js");
        prevInstructionStep();
      });
    }

    // Botão de próximo passo
    const nextBtn = panel.querySelector("#nav-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const { nextInstructionStep } = require("./route.js");
        nextInstructionStep();
      });
    }
  }, 0);

  return panel;
}

/**
 * Esconde o painel de navegação
 */
export function hideNavigationPanel() {
  const navigationPanel = document.getElementById("navigation-panel");

  if (navigationPanel) {
    navigationPanel.classList.remove("active");

    // Opcional: remover completamente após animação
    setTimeout(() => {
      if (navigationPanel.parentNode) {
        navigationPanel.parentNode.removeChild(navigationPanel);
      }
    }, 300);
  }

  // Parar atualizações periódicas
  stopPeriodicUpdates();
}

/**
 * Atualiza a exibição de instruções
 * @param {Array} instructions - Array de instruções
 * @param {number} currentIndex - Índice da instrução atual
 */
export function updateInstructionDisplay(instructions, currentIndex) {
  if (!instructions || !instructions.length) return;

  // Garantir que o índice é válido
  currentIndex = Math.max(0, Math.min(currentIndex, instructions.length - 1));

  // Obter elementos
  const currentInstructionEl = document.getElementById(
    "current-instruction-text"
  );
  const nextInstructionEl = document.getElementById("next-instruction-text");
  const instructionIconEl = document.querySelector(".instruction-icon i");

  if (!currentInstructionEl) return;

  // Obter a instrução atual
  const currentStep = instructions[currentIndex];
  currentInstructionEl.textContent = currentStep.text;

  // Atualizar ícone baseado no tipo de manobra
  if (instructionIconEl) {
    const iconClass = getManeuverIcon(currentStep.maneuver || currentStep.type);
    instructionIconEl.className = iconClass;
  }

  // Atualizar próxima instrução se houver
  if (nextInstructionEl) {
    if (currentIndex < instructions.length - 1) {
      const nextStep = instructions[currentIndex + 1];
      nextInstructionEl.textContent = nextStep.text;
      nextInstructionEl.parentElement.style.display = "block";
    } else {
      // Não há próxima instrução (último passo)
      nextInstructionEl.textContent = translate("you-will-arrive");
      nextInstructionEl.parentElement.style.display = "block";
    }
  }

  // Atualizar informações de distância e tempo
  updateNavigationInfo();
}

/**
 * Inicia atualizações periódicas de informações de navegação
 */
function startPeriodicUpdates() {
  // Parar qualquer intervalo existente
  stopPeriodicUpdates();

  // Definir o intervalo para atualizar a cada 5 segundos
  window.navUpdateInterval = setInterval(() => {
    if (isNavigationActive()) {
      updateNavigationInfo();
    } else {
      stopPeriodicUpdates();
    }
  }, 5000);
}

/**
 * Para as atualizações periódicas
 */
function stopPeriodicUpdates() {
  if (window.navUpdateInterval) {
    clearInterval(window.navUpdateInterval);
    window.navUpdateInterval = null;
  }
}

/**
 * Atualiza as informações de navegação (ETA, distância)
 */
function updateNavigationInfo() {
  // Verificar se a navegação está ativa
  if (!isNavigationActive()) return;

  // Obter elementos
  const etaEl = document.getElementById("nav-eta-text");
  const distanceEl = document.getElementById("nav-remaining-distance");

  if (!etaEl || !distanceEl) return;

  // Obter dados da rota
  const route = appState.get("route.current");
  const progress = getNavigationProgress();

  if (!route) return;

  // Calcular distância restante
  const totalDistance = route.distance;
  const remainingDistance = totalDistance * (1 - progress);

  // Atualizar elemento de distância
  const language = appState.get("language.selected") || "pt";
  distanceEl.textContent = formatDistance(remainingDistance, language);

  // Calcular ETA
  const { time, remainingMinutes } = estimateArrivalTime(route, progress);

  // Atualizar elemento de ETA
  if (time) {
    const formattedTime = time.toLocaleTimeString(
      language === "en" ? "en-US" : "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    // Decidir formato com base no tempo restante
    if (remainingMinutes > 90) {
      // Mais de 1h30: mostrar horário de chegada
      etaEl.textContent = `${translate("arrive-at")} ${formattedTime}`;
    } else {
      // Menos de 1h30: mostrar minutos restantes
      etaEl.textContent = `${remainingMinutes} ${translate("minutes")}`;
    }
  } else {
    etaEl.textContent = "--:--";
  }
}

/**
 * Atualiza o indicador de progresso da navegação
 * @param {number} progress - Progresso da navegação (0-1)
 */
function updateNavigationProgress(progress) {
  const progressFill = document.querySelector(".nav-progress-fill");

  if (progressFill) {
    const percentage = Math.min(100, Math.max(0, progress * 100));
    progressFill.style.width = `${percentage}%`;
  }

  // Atualizar também outras informações
  updateNavigationInfo();
}

/**
 * Obtém o ícone para um tipo de manobra
 * @param {string} maneuver - Tipo de manobra
 * @returns {string} Classe CSS do ícone
 */
function getManeuverIcon(maneuver) {
  const icons = {
    "turn-left": "fas fa-arrow-left",
    "turn-right": "fas fa-arrow-right",
    "turn-slight-left": "fas fa-arrow-left fa-rotate-45",
    "turn-slight-right": "fas fa-arrow-right fa-rotate-315",
    "turn-sharp-left": "fas fa-arrow-left fa-rotate-315",
    "turn-sharp-right": "fas fa-arrow-right fa-rotate-45",
    continue: "fas fa-arrow-up",
    depart: "fas fa-play",
    arrive: "fas fa-flag-checkered",
    roundabout: "fas fa-sync-alt",
    "keep-left": "fas fa-share fa-flip-horizontal",
    "keep-right": "fas fa-share",
    uturn: "fas fa-undo",
  };

  // Lidar com string com formato "turn left" (separado por espaço)
  if (maneuver && maneuver.includes(" ")) {
    const [action, direction] = maneuver.split(" ");
    const compound = `${action}-${direction}`;

    if (icons[compound]) {
      return icons[compound];
    }
  }

  return icons[maneuver] || "fas fa-arrow-right";
}

/**
 * Cria um modal de instruções de navegação
 * @param {Array} instructions - Instruções de navegação
 * @param {number} currentIndex - Índice da instrução atual
 * @param {string} [language='pt'] - Idioma atual
 */
export function updateInstructionModal(
  instructions,
  currentIndex,
  language = "pt"
) {
  if (!instructions || !instructions.length) return;

  // Verificar se o modal já existe
  let modal = document.getElementById("instruction-modal");

  // Criar modal se não existir
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "instruction-modal";
    modal.className = "instruction-modal";

    const modalContent = document.createElement("div");
    modalContent.className = "instruction-modal-content";

    const header = document.createElement("div");
    header.className = "instruction-modal-header";
    header.innerHTML = `
      <h3>${translate("navigation-instructions", language)}</h3>
      <button class="instruction-modal-close">×</button>
    `;

    const body = document.createElement("div");
    body.className = "instruction-modal-body";
    body.innerHTML = `<ul class="instruction-list"></ul>`;

    const footer = document.createElement("div");
    footer.className = "instruction-modal-footer";
    footer.innerHTML = `
      <button class="modal-prev-btn">${translate("previous", language)}</button>
      <button class="modal-next-btn">${translate("next", language)}</button>
    `;

    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    // Adicionar event listeners
    modal
      .querySelector(".instruction-modal-close")
      .addEventListener("click", () => {
        modal.classList.remove("visible");
      });

    modal.querySelector(".modal-prev-btn").addEventListener("click", () => {
      const { prevInstructionStep } = require("./route.js");
      prevInstructionStep();
    });

    modal.querySelector(".modal-next-btn").addEventListener("click", () => {
      const { nextInstructionStep } = require("./route.js");
      nextInstructionStep();
    });
  }

  // Preencher a lista de instruções
  const instructionList = modal.querySelector(".instruction-list");
  if (instructionList) {
    instructionList.innerHTML = "";

    instructions.forEach((instruction, index) => {
      const li = document.createElement("li");
      li.className = "instruction-item";
      if (index === currentIndex) {
        li.classList.add("current");
      }

      const icon = getManeuverIcon(instruction.maneuver || instruction.type);
      const distance = formatDistance(instruction.distance, language);

      li.innerHTML = `
        <div class="instruction-item-icon">
          <i class="${icon}"></i>
        </div>
        <div class="instruction-item-content">
          <div class="instruction-item-text">${instruction.text}</div>
          <div class="instruction-item-distance">${distance}</div>
        </div>
      `;

      // Permitir clicar na instrução para ir até ela
      li.addEventListener("click", () => {
        const { goToInstructionStep } = require("./route.js");
        goToInstructionStep(index);
      });

      instructionList.appendChild(li);
    });

    // Rolar para a instrução atual
    const currentItem = instructionList.querySelector(".current");
    if (currentItem) {
      setTimeout(() => {
        currentItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }

  // Mostrar o modal
  modal.classList.add("visible");
}

// Exportar funções
export default {
  initNavigationUI,
  showNavigationPanel,
  hideNavigationPanel,
  updateInstructionDisplay,
  updateInstructionModal,
};
