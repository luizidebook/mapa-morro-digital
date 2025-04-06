export function detectUserLanguage() {
  const supportedLanguages = ['pt', 'en', 'es', 'he'];
  const defaultLanguage = 'pt';

  // Tenta obter idioma salvo
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  // Tenta obter idioma do navegador
  const browserLanguages = navigator.languages || [
    navigator.language || navigator.userLanguage,
  ];

  // Busca uma correspondência entre idiomas do navegador e suportados
  for (const lang of browserLanguages) {
    const shortLang = lang.split('-')[0];
    if (supportedLanguages.includes(shortLang)) {
      return shortLang;
    }
  }

  return defaultLanguage;
}
