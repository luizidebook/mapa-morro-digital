import * as constants from '../core/constants.js';
import * as state from '../core/state.js';
import * as mapCore from '../map-core.js';

jest.mock('../core/constants.js', () => ({
  TOCA_DO_MORCEGO_COORDS: { lat: -13.3782, lon: -38.914 },
}));

jest.mock('../core/state.js', () => ({
  map: null,
  markers: [],
}));

describe('map-core.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializeMap deve inicializar o mapa corretamente', () => {
    // Mock da função L.map
    const mockSetView = jest.fn();
    const mockMap = jest.fn(() => ({
      setView: mockSetView,
      addLayer: jest.fn(),
    }));
    global.L = {
      map: mockMap,
      tileLayer: jest.fn(() => ({})),
      control: { layers: jest.fn(() => ({ addTo: jest.fn() })) },
    };

    mapCore.initializeMap();

    expect(mockMap).toHaveBeenCalledWith('map', {
      layers: [expect.any(Object)],
      zoomControl: false,
      maxZoom: 19,
      minZoom: 3,
    });
    expect(mockSetView).toHaveBeenCalledWith([-13.378, -38.918], 14);
    expect(console.log).toHaveBeenCalledWith('Inicializando mapa...');
  });

  test('getTileLayer deve retornar uma camada de tiles', () => {
    const mockTileLayer = jest.fn();
    global.L = { tileLayer: mockTileLayer };

    mapCore.getTileLayer();

    expect(mockTileLayer).toHaveBeenCalledWith(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '© OpenStreetMap contributors' }
    );
  });

  test('resetMapView deve restaurar a visualização do mapa', () => {
    const mockSetView = jest.fn();
    state.mapInstance = { setView: mockSetView };

    mapCore.resetMapView();

    expect(mockSetView).toHaveBeenCalledWith([-13.4125, -38.9131], 13);
    expect(console.log).toHaveBeenCalledWith(
      'Visualização do mapa restaurada para o estado inicial.'
    );
  });

  test('adjustMapWithLocationUser deve ajustar o mapa para a localização do usuário', () => {
    const mockSetView = jest.fn();
    const mockAddTo = jest.fn(() => ({
      bindPopup: jest.fn(),
      openPopup: jest.fn(),
    }));
    const mockMarker = jest.fn(() => ({ addTo: mockAddTo }));
    global.L = { marker: mockMarker };
    state.map = { setView: mockSetView };
    state.markers = [];

    mapCore.adjustMapWithLocationUser(-13.3782, -38.914);

    expect(mockSetView).toHaveBeenCalledWith([-13.3782, -38.914], 21);
    expect(mockMarker).toHaveBeenCalledWith([-13.3782, -38.914]);
    expect(mockAddTo).toHaveBeenCalledWith(state.map);
    expect(state.markers.length).toBe(1);
  });

  test('clearMarkers deve remover marcadores do mapa', () => {
    const mockRemoveLayer = jest.fn();
    const mockEachLayer = jest.fn((callback) => {
      callback({ instanceof: jest.fn(() => true) });
    });
    state.mapInstance = {
      eachLayer: mockEachLayer,
      removeLayer: mockRemoveLayer,
    };

    mapCore.clearMarkers();

    expect(mockEachLayer).toHaveBeenCalled();
    expect(mockRemoveLayer).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Marcadores removidos do mapa.');
  });

  test('clearMapLayers deve remover todas as camadas do mapa, exceto as de tiles', () => {
    const mockRemoveLayer = jest.fn();
    const mockEachLayer = jest.fn((callback) => {
      callback({ instanceof: jest.fn(() => false) });
    });
    state.mapInstance = {
      eachLayer: mockEachLayer,
      removeLayer: mockRemoveLayer,
    };

    mapCore.clearMapLayers();

    expect(mockEachLayer).toHaveBeenCalled();
    expect(mockRemoveLayer).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      'Todas as camadas foram removidas do mapa.'
    );
  });

  test('zoomToSelectedArea deve aplicar zoom aos limites especificados', () => {
    const mockFitBounds = jest.fn();
    state.mapInstance = { fitBounds: mockFitBounds };

    const bounds = { northEast: [1, 1], southWest: [0, 0] };
    mapCore.zoomToSelectedArea(bounds);

    expect(mockFitBounds).toHaveBeenCalledWith(bounds);
    expect(console.log).toHaveBeenCalledWith(
      'Zoom aplicado aos limites especificados.'
    );
  });

  test('centerMapOnUser deve recentralizar o mapa na localização do usuário', () => {
    const mockSetView = jest.fn();
    state.mapInstance = { setView: mockSetView };

    mapCore.centerMapOnUser(-13.3782, -38.914, 15);

    expect(mockSetView).toHaveBeenCalledWith([-13.3782, -38.914], 15);
    expect(console.log).toHaveBeenCalledWith(
      'Mapa recentralizado no usuário: [-13.3782, -38.914]'
    );
  });
});
