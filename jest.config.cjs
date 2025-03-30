module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/js'], // Define o diretório raiz para os testes
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: ['js/**/*.js'],
  verbose: true,
};
