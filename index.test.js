import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('index.html - Estrutura do DOM', () => {
  beforeAll(() => {
    document.documentElement.innerHTML = html.toString();
  });

  test('Deve conter o elemento do mapa', () => {
    const mapElement = document.getElementById('map');
    expect(mapElement).not.toBeNull();
  });

  test('Deve conter o script principal', () => {
    const script = document.querySelector('script[src="./js/scripts.js"]');
    expect(script).not.toBeNull();
  });

  test('Deve conter o contêiner de notificações', () => {
    const notificationContainer = document.getElementById(
      'notification-container'
    );
    expect(notificationContainer).not.toBeNull();
  });
});
