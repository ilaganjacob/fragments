// tests/unit/auth-index.test.js
const fs = require('fs');
const path = require('path');

describe('Auth Index Configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('throws error when both Cognito and Basic Auth configs are present', () => {
    process.env.AWS_COGNITO_POOL_ID = 'test-pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';
    process.env.HTPASSWD_FILE = '/path/to/htpasswd';

    expect(() => {
      require('../../src/auth');
    }).toThrow('env contains configuration for both AWS Cognito and HTTP Basic Auth');
  });

  test('uses Cognito auth in production', () => {
    process.env.AWS_COGNITO_POOL_ID = 'test-pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';
    process.env.NODE_ENV = 'production';

    const auth = require('../../src/auth');
    expect(auth).toEqual(require('../../src/auth/cognito'));
  });

  test('uses Basic auth in non-production environment', () => {
    process.env.HTPASSWD_FILE = path.resolve(__dirname, '../../tests/.htpasswd');
    process.env.NODE_ENV = 'development';

    const auth = require('../../src/auth');
    expect(auth).toEqual(require('../../src/auth/basic-auth'));
  });

  test('throws error when no auth configuration is found', () => {
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;

    expect(() => {
      require('../../src/auth');
    }).toThrow('missing env vars: no authorization configuration found');
  });
});
