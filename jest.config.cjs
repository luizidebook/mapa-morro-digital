module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'], // Define o diretório raiz para os testes
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: ['js/**/*.js'],
  verbose: true,
};
