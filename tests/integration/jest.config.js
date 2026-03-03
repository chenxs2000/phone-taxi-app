module.exports = {
  displayName: 'Integration Tests',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['js', 'json'],
  roots: ['<rootDir>'],
  testTimeout: 30000,
  verbose: true,
};
