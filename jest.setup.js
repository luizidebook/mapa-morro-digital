jest.mock("../../i18n/language.js", () => ({
  translate: (key) => key, // Mock implementation
}));
