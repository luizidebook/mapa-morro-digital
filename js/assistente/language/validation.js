/**
 * Validação de tradução para identificar chaves ausentes
 */
export function validateTranslations() {
  const allLanguages = Object.keys(assistantTranslations);
  const allKeys = new Set();
  const missingKeys = {};

  // Coletar todas as chaves de todos os idiomas
  allLanguages.forEach((lang) => {
    Object.keys(assistantTranslations[lang]).forEach((key) => {
      allKeys.add(key);
    });
  });

  // Verificar cada idioma para chaves ausentes
  allLanguages.forEach((lang) => {
    const langMissing = [];

    allKeys.forEach((key) => {
      if (!assistantTranslations[lang][key]) {
        langMissing.push(key);
      }
    });

    if (langMissing.length > 0) {
      missingKeys[lang] = langMissing;
    }
  });

  if (Object.keys(missingKeys).length > 0) {
    console.warn('Chaves de tradução ausentes:', missingKeys);
  } else {
    console.log('Todas as traduções estão completas!');
  }

  return missingKeys;
}
