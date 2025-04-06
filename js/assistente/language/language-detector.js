/**
 * Detecta o idioma preferido do usuário com base na navegação ou SO
 * @returns {string} Código do idioma detectado
 */
export function detectUserPreferredLanguage() {
  // Ordem de verificação:
  // 1. Local Storage (preferência já salva)
  // 2. Navegador (navigator.language)
  // 3. HTML lang attribute
  // 4. Default (pt)

  // Verificar localStorage
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage) {
    return normalizeLanguageCode(savedLanguage);
  }

  // Verificar navegador
  if (navigator.language) {
    return normalizeLanguageCode(navigator.language);
  }

  // Verificar HTML
  const htmlLang = document.documentElement.getAttribute('lang');
  if (htmlLang) {
    return normalizeLanguageCode(htmlLang);
  }

  // Default
  return 'pt';
}

/**
 * Normaliza o código de idioma para o formato usado no sistema
 * @param {string} langCode - Código de idioma (ex: pt-BR, en-US)
 * @returns {string} - Código normalizado (ex: pt, en)
 */
function normalizeLanguageCode(langCode) {
  const supportedLanguages = ['pt', 'en', 'es', 'he', 'ar'];

  // Se o código contém hífen (ex: pt-BR), pegar só a primeira parte
  const baseCode = langCode.split('-')[0].toLowerCase();

  // Verificar se o idioma base é suportado
  if (supportedLanguages.includes(baseCode)) {
    return baseCode;
  }

  // Fallback para português
  return 'pt';
}
