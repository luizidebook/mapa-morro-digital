/**
 * Arquivo de compatibilidade para garantir que chamadas antigas funcionem com o novo sistema
 * Este arquivo deve ser importado após a inicialização do assistente
 */

// Verificar se o assistente está disponível
if (!window.assistantApi) {
  console.warn(
    'API do assistente não disponível, impossível configurar compatibilidade'
  );
} else {
  console.log('Configurando camada de compatibilidade para o assistente');

  // Funções de compatibilidade para APIs antigas
  window.showAssistant = function () {
    console.log(
      'Chamada legada: showAssistant() - redirecionando para novo sistema'
    );
    if (typeof window.assistantApi.showAssistant === 'function') {
      return window.assistantApi.showAssistant();
    }
    return false;
  };

  window.hideAssistant = function () {
    console.log(
      'Chamada legada: hideAssistant() - redirecionando para novo sistema'
    );
    if (typeof window.assistantApi.hideAssistant === 'function') {
      return window.assistantApi.hideAssistant();
    }
    return false;
  };

  window.sendAssistantMessage = function (message) {
    console.log(
      'Chamada legada: sendAssistantMessage() - redirecionando para novo sistema'
    );
    if (typeof window.assistantApi.sendMessage === 'function') {
      return window.assistantApi.sendMessage(message);
    }
    return false;
  };

  // Adicionar outras funções de compatibilidade conforme necessário
}

// Exportar uma função de verificação para garantir que o arquivo foi carregado
export function isCompatibilityLayerActive() {
  return typeof window.showAssistant === 'function';
}
