describe('service-worker.js - Eventos e Cache', () => {
  test('Deve registrar o evento de instalação', () => {
    const installEvent = jest.fn();
    self.addEventListener('install', installEvent);
    expect(installEvent).toBeCalledTimes(1);
  });

  test('Deve registrar o evento de ativação', () => {
    const activateEvent = jest.fn();
    self.addEventListener('activate', activateEvent);
    expect(activateEvent).toBeCalledTimes(1);
  });

  test('Deve registrar o evento de fetch', () => {
    const fetchEvent = jest.fn();
    self.addEventListener('fetch', fetchEvent);
    expect(fetchEvent).toBeCalledTimes(1);
  });
});
