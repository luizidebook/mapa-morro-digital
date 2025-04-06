/**
 * Sistema de logs para o assistente
 */

// Nível de log atual (0: nenhum, 1: erros, 2: avisos, 3: info, 4: debug)
let logLevel = 4;

// Cores para console
const colors = {
  error: 'color: #ff0000;',
  warn: 'color: #ff9900;',
  info: 'color: #0099ff;',
  debug: 'color: #999999;',
  success: 'color: #00cc00;',
};

// Formatar mensagem de log
function formatMessage(message, data = null) {
  if (data) {
    if (typeof data === 'object') {
      try {
        // Clonar dados para evitar alterações
        return `${message} ${JSON.stringify(data)}`;
      } catch (e) {
        return `${message} [Objeto não serializável]`;
      }
    }
    return `${message} ${data}`;
  }
  return message;
}

// Funções de log
export const logger = {
  setLevel(level) {
    logLevel = level;
  },

  error(message, data = null) {
    if (logLevel >= 1) {
      console.error('%c[ERRO] ' + formatMessage(message, data), colors.error);
    }
  },

  warn(message, data = null) {
    if (logLevel >= 2) {
      console.warn('%c[AVISO] ' + formatMessage(message, data), colors.warn);
    }
  },

  info(message, data = null) {
    if (logLevel >= 3) {
      console.info('%c[INFO] ' + formatMessage(message, data), colors.info);
    }
  },

  debug(message, data = null) {
    if (logLevel >= 4) {
      console.log('%c[DEBUG] ' + formatMessage(message, data), colors.debug);
    }
  },

  success(message, data = null) {
    if (logLevel >= 3) {
      console.log(
        '%c[SUCESSO] ' + formatMessage(message, data),
        colors.success
      );
    }
  },
};

export default logger;
