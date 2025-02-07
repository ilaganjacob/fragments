const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

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

  // Retrieve an existing fragment
  test('retrieve an existing fragment', async () => {
    const ownerId = 'user1@email.com';

    const fragment = new Fragment({
      ownerId,
      type: 'text/plain',
      size: 11,
    });

    await fragment.save();
    await fragment.setData(Buffer.from('Hello World'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1')
      .expect(200);

    // Verify the response
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeTruthy();
    expect(res.body.fragment.id).toBe(fragment.id);
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(11);
  });

  test("cannot retrieve another user's fragment", async () => {
    const user1Id = 'user1@email.com';

    const fragment = new Fragment({
      ownerId: user1Id,
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
});
