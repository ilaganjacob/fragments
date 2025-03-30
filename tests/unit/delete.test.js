// tests/unit/delete.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

describe('DELETE /v1/fragments/:id', () => {
  // Test unauthenticated requests
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/123').expect(401));

  // Test deleting a fragment that exists
  test('authenticated users can delete their fragments', async () => {
    const email = 'user1@email.com';
    const password = 'password1';
    const hashedEmail = hash(email);

    // Create a test fragment
    const fragment = new Fragment({
      ownerId: hashedEmail,
      type: 'text/plain',
      size: 10,
    });
    await fragment.save();
    await fragment.setData(Buffer.from('Test Data'));

    // Delete the fragment
    const res = await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .auth(email, password)
      .expect(200);

    // Verify the response
    expect(res.body.status).toBe('ok');

    // Verify the fragment is gone by trying to get it
    await request(app).get(`/v1/fragments/${fragment.id}`).auth(email, password).expect(404);
  });

  // Test deleting a fragment that doesn't exist
  test('trying to delete a non-existent fragment returns 404', async () => {
    const res = await request(app)
      .delete('/v1/fragments/non-existent-id')
      .auth('user1@email.com', 'password1')
      .expect(404);

    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });

  // Test that a user cannot delete another user's fragments
  test('users cannot delete fragments belonging to other users', async () => {
    const email1 = 'user1@email.com';
    const email2 = 'user2@email.com';
    const password2 = 'password2';
    const hashedEmail1 = hash(email1);

    // Create a fragment for user1
    const fragment = new Fragment({
      ownerId: hashedEmail1,
      type: 'text/plain',
      size: 10,
    });
    await fragment.save();
    await fragment.setData(Buffer.from('Test Data'));

    // Try to delete it as user2
    await request(app).delete(`/v1/fragments/${fragment.id}`).auth(email2, password2).expect(404); // Should return 404 since user2 doesn't "see" user1's fragments
  });
});
