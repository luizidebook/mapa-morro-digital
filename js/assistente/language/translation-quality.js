/**
 * Sistema de monitoramento da qualidade das traduções
 */
export class TranslationQualityMonitor {
  constructor() {
    this.missingTranslations = new Map();
    this.potentialErrors = new Map();
    this.enabled = true;
  }

  /**
   * Registra uma tradução ausente
   * @param {string} key - Chave de tradução
   * @param {string} language - Idioma
   */
  reportMissingTranslation(key, language) {
    if (!this.enabled) return;

    const langMap = this.missingTranslations.get(language) || new Set();
    langMap.add(key);
    this.missingTranslations.set(language, langMap);

    // Registrar no console para debug
    console.warn(`Tradução ausente: "${key}" para idioma "${language}"`);
  }

  /**
   * Gera relatório de qualidade das traduções
   * @returns {Object} Relatório
   */
  generateReport() {
    const report = {
      languages: {},
      summary: {
        totalMissing: 0,
        totalErrors: 0,
      },
    };

    // Processar traduções ausentes
    for (const [language, keys] of this.missingTranslations.entries()) {
      if (!report.languages[language]) {
        report.languages[language] = { missing: [], errors: [] };
      }

      report.languages[language].missing = Array.from(keys);
      report.summary.totalMissing += keys.size;
    }

    // Processar erros potenciais
    for (const [language, errors] of this.potentialErrors.entries()) {
      if (!report.languages[language]) {
        report.languages[language] = { missing: [], errors: [] };
      }

      report.languages[language].errors = Array.from(errors);
      report.summary.totalErrors += errors.size;
    }

    return report;
  }

  /**
   * Ativa ou desativa o monitoramento
   * @param {boolean} enabled - Estado
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Limpa os dados coletados
   */
  clear() {
    this.missingTranslations.clear();
    this.potentialErrors.clear();
  }
}

// Criar instância global
export const translationMonitor = new TranslationQualityMonitor();
