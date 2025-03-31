import { showNotification } from '../ui/notifications.js';
import { getGeneralText } from '../ui/texts.js';
import { selectedLanguage } from './varGlobals.js';

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

/* setLanguage - Define e salva o idioma selecionado */
export function setLanguage(lang) {
  try {
    const availableLanguages = ['pt', 'en', 'es', 'he'];
    const defaultLanguage = 'pt';

    if (!availableLanguages.includes(lang)) {
      console.warn(
        `${getGeneralText('languageChanged', defaultLanguage)} => ${defaultLanguage}`
      );
      lang = defaultLanguage;
    }

    localStorage.setItem('preferredLanguage', lang);
    selectedLanguage = lang;

    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal) {
      welcomeModal.style.display = 'none';
    }

    console.log(`Idioma definido para: ${lang}`);
  } catch (error) {
    console.error(getGeneralText('routeError', selectedLanguage), error);
    showNotification(getGeneralText('routeError', selectedLanguage), 'error');
  }
}

/* updateInterfaceLanguage - Atualiza os textos da interface conforme o idioma */
export function updateInterfaceLanguage(lang) {
  const elementsToTranslate = document.querySelectorAll('[data-i18n]');
  let missingTranslations = 0;

  elementsToTranslate.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    let translation = getGeneralText(key, lang);

    if (!translation || translation.startsWith('⚠️')) {
      missingTranslations++;
      console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
      translation = key; // Usa a chave original se não houver tradução
    }

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else if (element.hasAttribute('title')) {
      element.title = translation;
    } else {
      element.textContent = translation;
    }
  });

  if (missingTranslations > 0) {
    console.warn(`Total de traduções ausentes: ${missingTranslations}`);
  } else {
    console.log(`Traduções aplicadas com sucesso para o idioma: ${lang}`);
  }
}

// 1. loadResources - Carrega recursos iniciais (imagens, textos, etc.) */
export async function loadResources(callback) {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'block';
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (loader) loader.style.display = 'none';
    console.log('Recursos carregados com sucesso!');
    if (typeof callback === 'function') callback();
  } catch (error) {
    if (loader) loader.style.display = 'none';
    console.error('Falha ao carregar recursos:', error);
  }
}

/**
 * ValidateTranslations - Verifica se todas as chaves de tradução estão definidas.
 */
export function validateTranslations(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  const missingKeys = [];
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translation = getGeneralText(key, lang);
    if (translation.startsWith('⚠️')) {
      missingKeys.push(key);
    }
  });
  if (missingKeys.length > 0) {
    console.warn(
      `validateTranslations: Faltam traduções para ${lang}:`,
      missingKeys
    );
  } else {
    console.log(
      `validateTranslations: Todas as traduções definidas para ${lang}.`
    );
  }
}

/* applyLanguage - Aplica o idioma na interface e valida as traduções */
export function applyLanguage(lang) {
  validateTranslations(lang);
  updateInterfaceLanguage(lang);
  console.log(`applyLanguage: Idioma aplicado: ${lang}`);
}
