let state = {};

export function getState(key) {
  return key.split(".").reduce((acc, part) => acc && acc[part], state) || null;
}
