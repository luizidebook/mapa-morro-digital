export function validateTranslations() {
  const allKeys = new Set();
  const languages = Object.keys(assistantTranslations);

  // Coletar todas as chaves possíveis
  for (const lang of languages) {
    Object.keys(assistantTranslations[lang]).forEach((key) => allKeys.add(key));
  }

  // Verificar se todas as línguas têm todas as chaves
  const missingTranslations = {};

  for (const lang of languages) {
    const langMissing = [];
    for (const key of allKeys) {
      if (!assistantTranslations[lang][key]) {
        langMissing.push(key);
      }
    }

    if (langMissing.length > 0) {
      missingTranslations[lang] = langMissing;
    }
  }

  if (Object.keys(missingTranslations).length > 0) {
    console.warn('Traduções ausentes:', missingTranslations);
  } else {
    console.log('Todas as traduções estão completas!');
  }

  return missingTranslations;
}
