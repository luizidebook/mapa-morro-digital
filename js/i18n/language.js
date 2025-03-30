// Language.js
import { showNotification } from '../ui/notifications.js';
import { getGeneralText } from '../ui/texts.js';

let selectedLanguage = 'pt'; // Idioma padrão

/* setLanguage - Define e salva o idioma selecionado */
export function setLanguage(lang) {
  try {
    const availableLanguages = ['pt', 'en', 'es', 'he'];
    const defaultLanguage = 'pt';

    if (!availableLanguages.includes(lang)) {
      console.warn(
        `${getGeneralText(
          'languageChanged',
          defaultLanguage
        )} => ${defaultLanguage}`
      );
      lang = defaultLanguage;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLanguage', lang);
    }
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

/* translateInstruction - Traduz uma instrução usando um dicionário */
export function translateInstruction(instruction, lang = 'pt') {
  const dictionary = {
    pt: {
      'Turn right': 'Vire à direita',
      'Turn left': 'Vire à esquerda',
      'Continue straight': 'Continue em frente',
    },
    en: {
      'Vire à direita': 'Turn right',
      'Vire à esquerda': 'Turn left',
      'Continue em frente': 'Continue straight',
    },
  };
  if (!dictionary[lang]) return instruction;
  return dictionary[lang][instruction] || instruction;
}

/* validateTranslations - Verifica se todas as chaves de tradução estão definidas */
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
