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

  // If the content type is unsupported, reject it
  // Using .htpasswd emails and passwords that are authenticated (system knows who they are) & authorized (system allows them to use this route)
  test('unsupported content type', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ message: 'Not Supported..' })
      .expect(415);
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
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('Hello World')
      .expect(201);

    // verify response structure
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(11);
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
