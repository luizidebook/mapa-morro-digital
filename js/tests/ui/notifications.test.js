import { showNotification } from "../../ui/notifications.js";
jest.mock("../../i18n/language.js", () => ({
  translate: (key) => key, // Mock implementation
}));

describe("Notifications", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="notification-container"></div>';
  });

  test("Deve exibir uma notificação", () => {
    showNotification("Teste de notificação", "info", 3000);

    const notification = document.querySelector(".notification");
    expect(notification).not.toBeNull();
    expect(notification.textContent).toContain("Teste de notificação");
    expect(notification.classList.contains("info")).toBe(true);
  });

  test("Deve remover a notificação após o tempo especificado", () => {
    jest.useFakeTimers();
    showNotification("Teste de notificação", "info", 3000);

    const notification = document.querySelector(".notification");
    expect(notification).not.toBeNull();

    jest.advanceTimersByTime(3000);
    expect(document.querySelector(".notification")).toBeNull();
  });
});
