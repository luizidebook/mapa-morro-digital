import { eventBus } from "../../core/eventBus.js";

describe("EventBus", () => {
  test("Deve registrar e disparar eventos", () => {
    const callback = jest.fn();
    eventBus.subscribe("test-event", callback);

    eventBus.publish("test-event", { data: 123 });
    expect(callback).toHaveBeenCalledWith({ data: 123 });
  });

  test("Deve permitir múltiplos ouvintes para o mesmo evento", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    eventBus.subscribe("test-event", callback1);
    eventBus.subscribe("test-event", callback2);

    eventBus.publish("test-event", { data: 456 });
    expect(callback1).toHaveBeenCalledWith({ data: 456 });
    expect(callback2).toHaveBeenCalledWith({ data: 456 });
  });

  test("Não deve disparar eventos para ouvintes não registrados", () => {
    const callback = jest.fn();
    eventBus.publish("unregistered-event", { data: 789 });
    expect(callback).not.toHaveBeenCalled();
  });
});
