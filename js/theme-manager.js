// theme-manager.js - Gerenciamento de temas e modos claro/escuro

let currentTheme = "light";

/**
 * Inicializa o gerenciador de temas
 */
export function initThemeManager() {
  // Verifica preferência do usuário
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    setTheme("dark");
  }

  // Adiciona botão de troca de tema
  createThemeToggle();

  // Escuta mudanças nas preferências do sistema
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      setTheme(e.matches ? "dark" : "light");
    });
}

/**
 * Cria botão para alternar tema
 */
function createThemeToggle() {
  const themeToggle = document.createElement("button");
  themeToggle.className = "theme-toggle";
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  themeToggle.setAttribute("aria-label", "Alternar tema claro/escuro");

  document.querySelector("header").appendChild(themeToggle);

  themeToggle.addEventListener("click", () => {
    setTheme(currentTheme === "light" ? "dark" : "light");
  });
}

/**
 * Define o tema do aplicativo
 */
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  currentTheme = theme;

  // Atualiza o ícone do botão
  const themeToggle = document.querySelector(".theme-toggle i");
  if (themeToggle) {
    themeToggle.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  }

  // Atualiza os mapas se for tema escuro
  if (window.map) {
    if (theme === "dark") {
      window.L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap contributors, &copy; CARTO",
        }
      ).addTo(window.map);
    } else {
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(window.map);
    }
  }
}
