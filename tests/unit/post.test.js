// tests/unit/post.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => {
    request(app).post('/v1/fragments').expect(401);
  });
});
