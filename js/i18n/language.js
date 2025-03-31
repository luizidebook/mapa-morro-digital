// Language.js
import { getGeneralText } from '../ui/texts.js';

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
