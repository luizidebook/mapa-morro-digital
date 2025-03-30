module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true
};