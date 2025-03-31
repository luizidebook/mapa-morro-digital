import { getGeneralText } from '../ui/texts.js';

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
    // Lista de idiomas suportados pela aplicação
    const availableLanguages = ['pt', 'en', 'es', 'he'];
    const defaultLanguage = 'pt'; // Idioma padrão caso o selecionado não esteja disponível

    // Valida se o idioma está na lista de disponíveis
    if (!availableLanguages.includes(lang)) {
      console.warn(
        `${getGeneralText('languageChanged', defaultLanguage)} => ${defaultLanguage}`
      );
      lang = defaultLanguage; // Usa o idioma padrão se o solicitado não for suportado
    }

    // Salva a preferência para uso futuro
    localStorage.setItem('preferredLanguage', lang);

    // Substitua esta linha:
    // globals.selectedLanguage = lang;  // Atualiza a variável global

    // Pela chamada da função:
    setSelectedLanguage(lang); // Atualiza a variável global

    // Traduz todos os elementos da interface
    translateInterface(lang);

    // Fecha o modal de boas-vindas após seleção de idioma
    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal) {
      welcomeModal.style.display = 'none';
    }

    console.log(`Idioma definido para: ${lang}`); // Log de confirmação
  } catch (error) {
    // Tratamento de erros durante o processo
    console.error('Erro ao definir idioma:', error);

    // Se possível, use o texto traduzido para mensagem de erro
    try {
      console.error(
        getGeneralText('routeError', globals.selectedLanguage),
        error
      );
    } catch (e) {
      // Se houver erro ao obter texto traduzido, usa mensagem genérica
      console.error('Erro ao definir idioma', error);
    }
  }
}

/**
 * translateInterface - Função unificada para traduzir toda a interface
 * @param {string} lang - Código do idioma para tradução (pt, en, es, he)
 * @param {boolean} [logDetails=false] - Se deve registrar detalhes da tradução no console
 * @returns {number} - Número de elementos traduzidos
 *
 * Esta função substitui tanto translatePageContent quanto updateInterfaceLanguage,
 * unificando a lógica de tradução da interface.
 */
export function translateInterface(lang, logDetails = false) {
  // Seleciona todos os elementos que precisam ser traduzidos
  const elements = document.querySelectorAll('[data-i18n]');
  let missingCount = 0; // Contador de traduções ausentes
  let translatedCount = 0; // Contador de elementos traduzidos

  if (logDetails) {
    console.log(
      `Traduzindo ${elements.length} elementos para o idioma: ${lang}`
    );
  }

  // Itera sobre cada elemento para aplicar a tradução
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n'); // Obtém a chave de tradução
    const translation = getGeneralText(key, lang); // Obtém o texto traduzido

    // Verifica se a tradução está ausente
    if (!translation || translation === key || translation.startsWith('⚠️')) {
      missingCount++;
      if (logDetails) {
        console.warn(`Tradução ausente para: '${key}' em '${lang}'.`);
      }
    } else {
      translatedCount++;
    }

    // Aplica a tradução conforme o tipo de elemento
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = translation; // Para campos de entrada, define o placeholder
    } else if (el.hasAttribute('title')) {
      el.title = translation; // Para elementos com título, atualiza o atributo title
    } else {
      el.textContent = translation; // Para elementos de texto padrão, atualiza o conteúdo
    }
  });

  // Registra informações sobre o processo de tradução
  if (missingCount > 0) {
    console.warn(
      `Tradução: ${missingCount} traduções ausentes de ${elements.length} elementos.`
    );
  } else if (elements.length > 0) {
    console.log(
      `Tradução: Interface traduzida com sucesso para ${lang} (${elements.length} elementos).`
    );
  } else {
    console.warn(
      `Tradução: Nenhum elemento encontrado para traduzir (data-i18n).`
    );
  }

  return translatedCount;
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
