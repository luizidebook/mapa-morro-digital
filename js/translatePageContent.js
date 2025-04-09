<<<<<<< HEAD
// 📁 translatePageContent.js – Tradução dinâmica da interface

let currentLang = "pt";
let translations = {};

/**
 * Carrega o arquivo de tradução com base no idioma e aplica à página.
 * @param {string} lang - Código do idioma (ex: 'pt', 'en', 'es', 'he').
 */
export async function translatePageContent(lang = "pt") {
  currentLang = lang;

  try {
    // Carrega o arquivo de tradução correspondente
    const response = await fetch(`./i18n/${lang}.json`);
    if (!response.ok) throw new Error("Falha ao carregar traduções.");

    translations = await response.json();

    applyTranslations();
  } catch (err) {
    console.warn(
      `Tradução não disponível para "${lang}". Usando português como padrão.`
    );
    if (lang !== "pt") translatePageContent("pt");
  }
}

/**
 * Aplica as traduções na página com base no atributo [data-i18n]
 */
function applyTranslations() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = translations[key];
    if (translation) {
      el.textContent = translation;
    }
  });
}

/**
 * Função utilitária opcional para obter traduções diretamente via código
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  return translations[key] || key;
}
=======
// 📁 translatePageContent.js – Tradução dinâmica da interface

let currentLang = "pt";
let translations = {};

/**
 * Carrega o arquivo de tradução com base no idioma e aplica à página.
 * @param {string} lang - Código do idioma (ex: 'pt', 'en', 'es', 'he').
 */
export async function translatePageContent(lang = "pt") {
  currentLang = lang;

  try {
    // Carrega o arquivo de tradução correspondente
    const response = await fetch(`./i18n/${lang}.json`);
    if (!response.ok) throw new Error("Falha ao carregar traduções.");

    translations = await response.json();

    applyTranslations();
  } catch (err) {
    console.warn(
      `Tradução não disponível para "${lang}". Usando português como padrão.`
    );
    if (lang !== "pt") translatePageContent("pt");
  }
}

/**
 * Aplica as traduções na página com base no atributo [data-i18n]
 */
function applyTranslations() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = translations[key];
    if (translation) {
      el.textContent = translation;
    }
  });
}

/**
 * Função utilitária opcional para obter traduções diretamente via código
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  return translations[key] || key;
}
>>>>>>> 3042ef7feaa3fb8bf5361238a6a3dcf175d9c2a1
