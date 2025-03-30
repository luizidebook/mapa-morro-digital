module.exports = {
  testEnvironment: 'jsdom', // Simula um ambiente de navegador
  roots: ['<rootDir>/js'], // Diretório onde os testes estão localizados
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest', // Transforma arquivos JS usando Babel
  },
  collectCoverage: true, // Gera relatório de cobertura de testes
  collectCoverageFrom: ['js/**/*.js'], // Arquivos para verificar cobertura
};
