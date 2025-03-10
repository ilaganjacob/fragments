// tests/unit/post.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', async () => {
    await request(app).post('/v1/fragments').expect(401);
  });

  // If the username & password do not exist, it should be forbidden
  test('nonexistent username and password combination', async () => {
    await request(app).post('/v1/fragments').auth('invalid@email.com', 'invalidPass').expect(401);
  });

  test('JSON content type is now supported', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ message: 'Now Supported!' })
      .expect(201);
  });

  // If the request has no content-type, reject it
  test('missing content-type', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('Did not specify the content-type')
      .expect(415);
  });

  // meta test
  test('create a text/plain fragment successfully', async () => {
    const data = 'Hello World';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');

    // Check the fragment metadata
    const { fragment } = res.body;
    expect(fragment).toHaveProperty('id');
    expect(fragment).toHaveProperty('ownerId');
    expect(fragment).toHaveProperty('created');
    expect(fragment).toHaveProperty('updated');
    expect(fragment).toHaveProperty('type', 'text/plain');
    expect(fragment.size).toBe(data.length);

    // Check the Location header
    const location = res.headers.location;
    expect(location).toBeDefined();
    expect(location).toMatch(/^http:\/\/localhost:[\d]+\/v1\/fragments\/[-\w]+$/);
  });

  test('create valid fragment with empty content', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('')
      .expect(201);
  });
});
