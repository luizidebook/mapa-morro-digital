let config = {};

export function initializeConfig(options) {
  config = { ...options };
}

export function getConfig() {
  return config;
}
