import { appState } from "../core/state.js";
import { eventBus, EVENT_TYPES } from "../core/eventBus.js";
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  STORAGE_CONFIG,
} from "../core/config.js";
import { translations, directionTranslations } from "./translations.js";

/**
 * Módulo de gerenciamento de idiomas
 * Fornece funções para traduzir a interface e gerenciar o idioma selecionado
 */

/**
 * Define o idioma ativo da aplicação
 * @param {string} lang - Código do idioma (pt, en, es, he)
 */
export function setLanguage(lang) {
  // Verificar se o idioma é suportado
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    console.warn(
      `Idioma "${lang}" não suportado. Usando idioma padrão "${DEFAULT_LANGUAGE}".`
    );
    lang = DEFAULT_LANGUAGE;
  }

  // Atualizar o estado da aplicação
  appState.set("language.selected", lang);

  // Configurar direção do texto (RTL para hebraico)
  if (lang === "he") {
    appState.set("language.direction", "rtl");
    document.documentElement.setAttribute("dir", "rtl");
    document.body.classList.add("rtl");
  } else {
    appState.set("language.direction", "ltr");
    document.documentElement.setAttribute("dir", "ltr");
    document.body.classList.remove("rtl");
  }

  // Salvar a preferência do usuário no localStorage
  localStorage.setItem(STORAGE_CONFIG.KEYS.LANGUAGE, lang);

  // Publicar evento de mudança de idioma
  eventBus.publish(EVENT_TYPES.LANGUAGE_CHANGED, { language: lang });

  return lang;
}

/**
 * Carrega o idioma preferido do usuário do localStorage ou usa o padrão
 * @returns {string} Código do idioma
 */
export function loadPreferredLanguage() {
  const storedLang = localStorage.getItem(STORAGE_CONFIG.KEYS.LANGUAGE);
  return setLanguage(storedLang || DEFAULT_LANGUAGE);
}

/**
 * Obtém uma tradução pelo identificador
 * @param {string} key - Identificador da string (ex: 'welcome-title')
 * @param {string} [lang] - Código do idioma (usa o idioma ativo se não fornecido)
 * @returns {string} Texto traduzido ou a própria chave se não encontrada
 */
export function translate(key, lang = null) {
  const activeLang =
    lang || appState.get("language.selected") || DEFAULT_LANGUAGE;

  if (translations[key] && translations[key][activeLang]) {
    return translations[key][activeLang];
  }

  // Fallback para inglês se a tradução não existir no idioma especificado
  if (translations[key] && translations[key]["en"]) {
    console.warn(
      `Tradução não encontrada para "${key}" em "${activeLang}". Usando inglês.`
    );
    return translations[key]["en"];
  }

  // Se não encontrar a chave, retornar a própria chave
  console.warn(`Chave de tradução não encontrada: "${key}"`);
  return key;
}

/**
 * Obtém uma tradução para uma direção de navegação
 * @param {string} maneuver - Tipo de manobra (ex: 'turn-left', 'continue')
 * @param {string} [lang] - Código do idioma (usa o idioma ativo se não fornecido)
 * @returns {string} Texto traduzido para a direção
 */
export function getDirectionText(maneuver, lang = null) {
  const activeLang =
    lang || appState.get("language.selected") || DEFAULT_LANGUAGE;

  // Processar manobras compostas (ex: "turn left")
  if (maneuver && maneuver.includes(" ")) {
    const [action, direction] = maneuver.split(" ");

    if (
      directionTranslations[action] &&
      directionTranslations[action][direction]
    ) {
      return directionTranslations[action][direction][activeLang] || maneuver;
    }
  }

  // Manobras simples (ex: "continue", "depart")
  if (directionTranslations[maneuver]) {
    return directionTranslations[maneuver][activeLang] || maneuver;
  }

  return maneuver;
}

/**
 * Atualiza todos os elementos da interface com o idioma ativo
 * Busca elementos com o atributo data-i18n e atualiza seu conteúdo
 */
export function updateInterfaceLanguage() {
  const lang = appState.get("language.selected") || DEFAULT_LANGUAGE;

  // Atualizar elementos com data-i18n
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (key) {
      element.textContent = translate(key, lang);
    }
  });

  // Atualizar placeholders em inputs
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    if (key) {
      element.setAttribute("placeholder", translate(key, lang));
    }
  });

  // Atualizar títulos em buttons
  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const key = element.getAttribute("data-i18n-title");
    if (key) {
      element.setAttribute("title", translate(key, lang));
    }
  });
}

// Subscrever ao evento de mudança de idioma para atualizar a interface
eventBus.subscribe(EVENT_TYPES.LANGUAGE_CHANGED, () => {
  updateInterfaceLanguage();
});

// Exportar funções principais
export default {
  setLanguage,
  loadPreferredLanguage,
  translate,
  getDirectionText,
  updateInterfaceLanguage,
};
