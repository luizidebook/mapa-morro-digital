import { setState, resetState } from "../../core/state.js";
import { getState } from "../../core/sharedState.js";

describe("State Management", () => {
  beforeEach(() => {
    resetState(); // Garante que o estado está limpo antes de cada teste
  });

  test("Deve definir e obter um valor no estado", () => {
    setState("user.location", { lat: 10, lon: 20 });
    const location = getState("user.location");
    expect(location).toEqual({ lat: 10, lon: 20 });
  });

  test("Deve retornar null para uma chave inexistente", () => {
    const value = getState("nonexistent.key");
    expect(value).toBeNull();
  });

  test("Deve resetar o estado para o valor inicial", () => {
    setState("user.location", { lat: 10, lon: 20 });
  });

  test("Should handle setting and getting deeply nested values", () => {
    setState("settings.theme.colors.primary", "#ffffff");
    expect(getState("settings.theme.colors.primary")).toBe("#ffffff");
    expect(getState("settings.theme.colors")).toEqual({ primary: "#ffffff" });
  });

  test("Should return null for partially missing paths", () => {
    setState("user.profile.name", "John Doe");
    expect(getState("user.profile.age")).toBeNull();
  });

  test("Should reset state and clear all values", () => {
    setState("user.profile.name", "John Doe");
    setState("settings.theme", "dark");
    resetState();
    expect(getState("user.profile.name")).toBeNull();
    expect(getState("settings.theme")).toBeNull();
  });

  test("Should overwrite existing values when setting a new value", () => {
    setState("user.profile.name", "John Doe");
    setState("user.profile.name", "Jane Doe");
    expect(getState("user.profile.name")).toBe("Jane Doe");
  });

  test("Should handle setting values with special characters in keys", () => {
    setState("config.special\\key", "specialValue");
    expect(getState("config.special\\key")).toBe("specialValue");
  });

  setState("user.settings", { theme: "light", notifications: true });
  expect(getState("user.settings")).toEqual({
    theme: "light",
    notifications: true,
  });
});

test("Deve definir valores em diferentes caminhos sem afetar outros", () => {
  setState("feature1.enabled", true);
  setState("feature2.enabled", false);

  expect(getState("feature1.enabled")).toBe(true);
  expect(getState("feature2.enabled")).toBe(false);
});

test("Deve lidar com chaves que usam notação de pontos nos nomes", () => {
  setState("config.special\\.key", "valor especial");
  expect(getState("config.special\\.key")).toBe("valor especial");
});

test("Deve devolver o valor definido como resultado da função", () => {
  const resultado = setState("retorno.teste", "valor retornado");
  expect(resultado).toBe("valor retornado");
});
