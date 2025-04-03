import { selectedLanguage } from '../core/varGlobals.js';
import { setLanguage } from '../core/config.js';
import { showNotification } from '../ui/notifications.js';
import { texts } from '../i18n/texts.js';

// Função para definir o idioma selecionado
export function setUserLanguage(lang) {
  try {
    // Verificar se o idioma é suportado
    if (!texts[lang]) {
      console.warn(`Idioma não suportado: ${lang}, usando pt como fallback.`);
      lang = 'pt';
    }

    // Atualizar variável global
    setLanguage(lang);

    // Traduzir a página
    translatePageContent(lang);

    // Salvar a preferência do usuário
    localStorage.setItem('preferredLanguage', lang);

    // Notificar o usuário
    const message =
      texts[lang].languageChanged || `Idioma alterado para ${lang}`;
    showNotification(message, 'info');

    // NOVO: Mostrar o assistente após a seleção de idioma (com delay)
    setTimeout(() => {
      if (
        window.assistantApi &&
        typeof window.assistantApi.showAssistant === 'function'
      ) {
        window.assistantApi.showAssistant();
      } else {
        console.warn(
          'API do assistente não encontrada após seleção de idioma.'
        );
      }
    }, 1000);

    console.log(`Idioma alterado para: ${lang}`);
    return true;
  } catch (error) {
    console.error('Erro ao definir o idioma:', error);
    return false;
  }
}

// Função para traduzir elementos da página
export function translatePageContent(lang) {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (texts[lang] && texts[lang][key]) {
      element.textContent = texts[lang][key];
    } else {
      console.warn(
        `Tradução não encontrada para chave: ${key} no idioma: ${lang}`
      );
    }
  });

  // Definir atributo lang no html
  document.documentElement.lang = lang;
}

// Função para obter texto traduzido
export function getGeneralText(key, lang = selectedLanguage) {
  if (texts[lang] && texts[lang][key]) {
    return texts[lang][key];
  }

  // Fallback para português
  if (texts.pt && texts.pt[key]) {
    return texts.pt[key];
  }

  return key; // Retorna a própria chave se não encontrar tradução
}
