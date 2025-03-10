// tests/unit/get-id-info.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

describe('GET /v1/fragments/:id/info tests', () => {
  // Authentication tests
  test('unauthenticated requests are denied', async () => {
    await request(app).get('/v1/fragments/123/info').expect(401);
  });

  test('incorrect credentials are denied', async () => {
    await request(app)
      .get('/v1/fragments/123/info')
      .auth('invalid@email.com', 'incorrect_pw')
      .expect(401);
  });

  // Fragment metadata retrieval tests
  test('non-existent fragment returns 404', async () => {
    await request(app)
      .get('/v1/fragments/non-existent/info')
      .auth('user1@email.com', 'password1')
      .expect(404);
  });

  test('retrieve existing fragment metadata', async () => {
    const email = 'user1@email.com';
    const hashedEmail = hash(email);
    const testData = 'Test fragment content';

    const fragment = new Fragment({
      ownerId: hashedEmail,
      type: 'text/plain',
      size: testData.length,
    });

    await fragment.save();
    await fragment.setData(Buffer.from(testData));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}/info`)
      .auth(email, 'password1')
      .expect(200);

    // Verify the metadata structure
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toHaveProperty('id', fragment.id);
    expect(res.body.fragment).toHaveProperty('ownerId', hashedEmail);
    expect(res.body.fragment).toHaveProperty('type', 'text/plain');
    expect(res.body.fragment).toHaveProperty('size', testData.length);
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment).toHaveProperty('updated');
  });
});
