import { navigationState } from '../state.js';

test('navigationState deve ter propriedades padrão', () => {
  expect(navigationState.isActive).toBe(false);
  expect(navigationState.isPaused).toBe(false);
  expect(navigationState.lang).toBe('pt');
});
