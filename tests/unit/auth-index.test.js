// tests/unit/auth-index.test.js
describe('Auth Index Configuration', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore original environment variables
    process.env = { ...originalEnv };
  });

  test('throws error when both Cognito and Basic Auth configs are present', () => {
    process.env.AWS_COGNITO_POOL_ID = 'test-pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';
    process.env.HTPASSWD_FILE = '/path/to/htpasswd';

    expect(() => {
      require('../../src/auth');
    }).toThrow('env contains configuration for both AWS Cognito and HTTP Basic Auth');
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
