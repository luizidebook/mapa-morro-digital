module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/js'],
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: ['js/**/*.js'],
  verbose: true,
  // Ignorar source maps
  transformIgnorePatterns: ['node_modules/(?!(awesomplete)/)'],
};
