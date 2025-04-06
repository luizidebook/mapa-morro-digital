/**
 * Ferramenta de diagnóstico para verificar problemas no assistente
 */
export function runAssistantDiagnostics() {
  console.group('Diagnóstico do Assistente Virtual');

  // 1. Verificar idioma atual
  const currentLanguage = localStorage.getItem('preferredLanguage') || 'pt';
  console.log('Idioma atual:', currentLanguage);

  // 2. Verificar elementos da interface
  const assistantContainer = document.querySelector('#digital-assistant');
  const assistantDialog = document.querySelector('#assistant-dialog');
  const assistantMessages = document.querySelector('#assistant-messages');
  const assistantInput = document.querySelector('#assistant-input-field');

  console.log('Elementos da interface:', {
    container: assistantContainer ? 'Encontrado' : 'NÃO ENCONTRADO',
    dialog: assistantDialog ? 'Encontrado' : 'NÃO ENCONTRADO',
    messages: assistantMessages ? 'Encontrado' : 'NÃO ENCONTRADO',
    input: assistantInput ? 'Encontrado' : 'NÃO ENCONTRADO',
  });

  // 3. Verificar posicionamento
  if (assistantContainer) {
    const rect = assistantContainer.getBoundingClientRect();
    console.log('Posição do container:', {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    // Verificar se parte do assistente está fora da tela
    const isPartiallyOffscreen =
      rect.left < 0 ||
      rect.top < 0 ||
      rect.right > window.innerWidth ||
      rect.bottom > window.innerHeight;

    if (isPartiallyOffscreen) {
      console.warn('⚠️ Assistente está parcialmente fora da tela!');
    }
  }

  // 4. Verificar traduções
  import('../language/translations.js')
    .then((module) => {
      const { assistantTranslations, getAssistantText } = module;

      // Verificar chaves importantes para o idioma atual
      const keysToCheck = [
        'welcome',
        'ask_placeholder',
        'assistant_placeholder',
        'placeholder.ask',
        'assistant_title',
      ];

      console.log('Verificação de traduções:');
      keysToCheck.forEach((key) => {
        const translation = getAssistantText(key, currentLanguage);
        console.log(`- ${key}: ${translation}`);

        if (!translation || translation.startsWith('⚠️')) {
          console.warn(`⚠️ Tradução ausente: ${key}`);
        }
      });
    })
    .catch((err) => {
      console.error('Erro ao verificar traduções:', err);
    });

  // 5. Verificar síntese de voz
  const voices = window.speechSynthesis.getVoices();
  const langCode =
    currentLanguage === 'he'
      ? 'he'
      : currentLanguage === 'es'
        ? 'es'
        : currentLanguage === 'en'
          ? 'en'
          : 'pt';

  const languageVoices = voices.filter(
    (voice) =>
      voice.lang.startsWith(langCode) ||
      (currentLanguage === 'he' && voice.lang.includes('he'))
  );

  console.log(
    `Vozes para ${currentLanguage}:`,
    languageVoices.length > 0
      ? languageVoices.map((v) => `${v.name} (${v.lang})`)
      : 'Nenhuma voz específica encontrada'
  );

  console.groupEnd();

  return {
    fixAssistantPosition: function () {
      if (assistantContainer) {
        // Redefinir posição para valores seguros
        assistantContainer.style.position = 'fixed';
        assistantContainer.style.top = 'auto';
        assistantContainer.style.bottom = '80px';

        if (currentLanguage === 'he') {
          // Para RTL
          assistantContainer.style.right = 'auto';
          assistantContainer.style.left = '20px';
        } else {
          // Para LTR
          assistantContainer.style.left = 'auto';
          assistantContainer.style.right = '20px';
        }

        console.log('Posição do assistente ajustada.');
      }
    },
  };
}

// Para depuração na versão de desenvolvimento
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) {
  // Adicionar botão de diagnóstico no canto superior direito
  const diagButton = document.createElement('button');
  diagButton.textContent = '🛠️ Debug';
  diagButton.style.cssText =
    'position:fixed;top:10px;right:10px;z-index:9999;padding:5px;';
  diagButton.onclick = function () {
    const diagnostics = runAssistantDiagnostics();

    // Perguntar se deseja corrigir posicionamento
    if (confirm('Corrigir posicionamento do assistente?')) {
      diagnostics.fixAssistantPosition();
    }
  };

  document.body.appendChild(diagButton);
}
