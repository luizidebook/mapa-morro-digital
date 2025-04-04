let state = {};

export function initializeState() {
  state = {
    /* ...initial state... */
  };
}

export function updateState(updates) {
  state = { ...state, ...updates };
}

export function getState() {
  return state;
}
