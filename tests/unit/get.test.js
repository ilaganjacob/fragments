// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const { listFragments } = require('../../src/model/data');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users with no fragments returns an empty array', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toBe(0);
  });

  test('authenticated user can retrieve their fragments', async () => {
    const ownerId = 'user1@email.com';

    const fragment1 = new Fragment({
      ownerId,
      type: 'text/plain',
      size: 11,
    });

    await fragment1.save();
    await fragment1.setData(Buffer.from('Hello World'));

    const fragment2 = new Fragment({
      ownerId,
      type: 'text/plain',
      size: 5,
    });

    await fragment2.save();
    await fragment2.setData(Buffer.from('Test'));

    // Retrieve fragments
    const res = await request(app)
      .get('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toBe(2);

    // Verify the fragment IDs for both fragments is the same
    expect(res.body.fragments).toContain(fragment1.id);
    expect(res.body.fragments).toContain(fragment2.id);
  });
});
