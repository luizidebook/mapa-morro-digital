import { showNotification } from '../../ui/notifications.js';
jest.mock('../../i18n/language.js', () => ({
  translate: (key) => key, // Mock implementation
}));

// This file is part of the MyApp project.
jest.mock('../../ui/notifications.js', () => ({
  showNotification: jest.fn(),
}));
