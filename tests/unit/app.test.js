// tests/unit/app.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('App Error Handling', () => {
  test('handles 404 for non-existent routes', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found',
      },
    });
  });
});
