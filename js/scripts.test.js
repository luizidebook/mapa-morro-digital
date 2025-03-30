import { setLanguage, updateInterfaceLanguage } from './core/config';
import { initializeMap, resetMapView } from './map/map-core';

describe('scripts.js - Dependências e Funcionalidades', () => {
  test('Deve definir o idioma corretamente', () => {
    expect(() => setLanguage('pt')).not.toThrow();
  });

  test('Deve atualizar a interface para o idioma definido', () => {
    expect(() => updateInterfaceLanguage('pt')).not.toThrow();
  });

  test('Deve inicializar o mapa corretamente', () => {
    const map = initializeMap();
    expect(map).not.toBeNull();
  });

  test('Deve redefinir a visualização do mapa', () => {
    expect(() => resetMapView()).not.toThrow();
  });
});
