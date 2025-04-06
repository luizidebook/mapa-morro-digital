/**
 * Configura suporte a idiomas RTL (Right-to-Left) como Hebraico e Árabe
 * @param {string} language - Código do idioma atual
 */
export function setupRTLSupport(language) {
  const rtlLanguages = ['he', 'ar'];
  const isRTL = rtlLanguages.includes(language);

  // Configurar direção do documento
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

  // Adicionar ou remover classe global
  if (isRTL) {
    document.body.classList.add('rtl-language');
  } else {
    document.body.classList.remove('rtl-language');
  }

  // Atualizar elementos específicos do assistente
  const assistantElements = document.querySelectorAll(
    '.digital-assistant, #digital-assistant'
  );
  const dialogElements = document.querySelectorAll(
    '.assistant-dialog, #assistant-dialog'
  );
  const messageElements = document.querySelectorAll(
    '.assistant-messages, #assistant-messages'
  );

  // Função para aplicar RTL a um conjunto de elementos
  const applyRTL = (elements) => {
    elements.forEach((el) => {
      if (isRTL) {
        el.classList.add('rtl-language');
        el.style.direction = 'rtl';
      } else {
        el.classList.remove('rtl-language');
        el.style.direction = 'ltr';
      }
    });
  };

  // Aplicar RTL aos elementos do assistente
  applyRTL(assistantElements);
  applyRTL(dialogElements);
  applyRTL(messageElements);

  // Lógica adicional para mensagens existentes
  const messageTexts = document.querySelectorAll('.message-text');
  applyRTL(messageTexts);

  console.log(
    `Suporte a RTL ${isRTL ? 'ativado' : 'desativado'} para idioma: ${language}`
  );

  return isRTL;
}
