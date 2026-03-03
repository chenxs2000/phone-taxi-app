module.exports = {
  name: 'integration-tests',
  displayName: 'Integration Tests',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    '../services/**/src/**/*.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/*.module.ts',
    '!**/*.interface.ts',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '^@app/(.*)$': '<rootDir>/../services/$1/src',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  testTimeout: 30000, // 30秒超时
  verbose: true,
};
