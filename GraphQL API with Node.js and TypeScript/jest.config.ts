/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',
  // The test environment that will be used for testing
  testEnvironment: 'node',
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src'],
  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.test.ts'],
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/schema.ts',
    '!src/__tests__/**',
    '!src/generated/**',
    '!src/server.ts',
  ],
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['text', 'lcov', 'html'],
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
};

export default config;
