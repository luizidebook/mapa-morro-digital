module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Transforma arquivos JS e JSX usando o Babel
  },
  testEnvironment: 'jsdom', // Simula o ambiente do navegador
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  roots: ['<rootDir>'], // Define o diretório raiz para os testes
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'], // Padrões de arquivos de teste
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'], // Extensões reconhecidas
};
