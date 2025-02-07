// tests/unit/post.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => {
    return request(app).post('/v1/fragments').expect(401);
  });

  // If the username & password do not exist, it should be forbidden
  test('nonexistent username and password combination', () => {
    return request(app).post('/v1/fragments').auth('invalid@email.com', 'invalidPass').expect(401);
  });
});
