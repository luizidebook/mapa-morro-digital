import { ORS_API_KEY, NOMINATIM_URL, queries } from '../constants.js';

test('ORS_API_KEY deve ser uma string válida', () => {
  expect(typeof ORS_API_KEY).toBe('string');
  expect(ORS_API_KEY).toMatch(/^[a-z0-9]+$/i);
});

test('NOMINATIM_URL deve ser uma URL válida', () => {
  expect(NOMINATIM_URL).toMatch(/^https?:\/\/.+/);
});

test('queries deve conter chaves específicas', () => {
  expect(queries).toHaveProperty('touristSpots-submenu');
  expect(queries).toHaveProperty('beaches-submenu');
});
