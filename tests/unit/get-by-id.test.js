// tests/unit/get-by-id.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

describe('GET /v1/fragments/:id tests', () => {
  // Authentication tests
  test('unauthenticated requests are denied', async () => {
    await request(app).get('/v1/fragments/123').expect(401);
  });

  test('incorrect credentials are denied', async () => {
    await request(app)
      .get('/v1/fragments/123')
      .auth('invalid@email.com', 'incorrect_pw')
      .expect(401);
  });

  // Fragment retrieval tests
  test('non-existent fragment returns 404', async () => {
    await request(app)
      .get('/v1/fragments/non-existent')
      .auth('user1@email.com', 'password1')
      .expect(404);
  });

  test("cannot retrieve another user's fragment", async () => {
    const user1Email = 'user1@email.com';
    const hashedUser1Email = hash(user1Email);

    const fragment = new Fragment({
      ownerId: hashedUser1Email,
      type: 'text/plain',
      size: 11,
    });

    await fragment.save();
    await fragment.setData(Buffer.from('Hello World'));

    // Try to retrieve as user2 (not allowed)
    await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('user2@email.com', 'password2')
      .expect(404);
  });

  test('retrieve existing text fragment returns raw data with correct type', async () => {
    const email = 'user1@email.com';
    const hashedEmail = hash(email);
    const testData = 'Hello World';

    const fragment = new Fragment({
      ownerId: hashedEmail,
      type: 'text/plain',
      size: testData.length,
    });

    await fragment.save();
    await fragment.setData(Buffer.from(testData));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth(email, 'password1')
      .expect(200)
      .expect('Content-Type', 'text/plain');

    // Compare the response body (Buffer) with our test data
    expect(res.text).toBe(testData);
  });
  // Add to tests/unit/get-by-id.test.js
  test('returns 415 for unsupported extension', async () => {
    await request(app)
      .get('/v1/fragments/non-existent-id.unsupported')
      .auth('user1@email.com', 'password1')
      .expect(415)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.error.message).toContain('Unsupported extension');
      });
  });
});
