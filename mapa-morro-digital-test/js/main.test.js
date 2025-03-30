const { initializeMap } = require('./main');

test('should initialize map without throwing an error', () => {
    expect(() => {
        initializeMap();
    }).not.toThrow();
});