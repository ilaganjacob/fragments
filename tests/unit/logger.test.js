// tests/unit/logger.test.js
describe('Logger Configuration', () => {
  const originalEnv = process.env.LOG_LEVEL;

  afterEach(() => {
    // Restore the original LOG_LEVEL
    process.env.LOG_LEVEL = originalEnv;
    // Clear the module cache to force a fresh require
    jest.resetModules();
  });

  test('uses default log level when not specified', () => {
    delete process.env.LOG_LEVEL;
    const localLogger = require('../../src/logger');
    expect(localLogger.level).toBe('info');
  });

  test('uses specified log level from environment', () => {
    process.env.LOG_LEVEL = 'debug';
    const localLogger = require('../../src/logger');
    expect(localLogger.level).toBe('debug');
  });
});
