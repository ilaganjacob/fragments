// tests/unit/get.test.js

const request = require('supertest');
const logger = require('../../src/logger');

const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

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
    const email = 'user1@email.com';
    const hashedEmail = hash(email); // Hash the email

    const fragment1 = new Fragment({
      ownerId: hashedEmail,
      type: 'text/plain',
      size: 11,
    });

    await fragment1.save();
    await fragment1.setData(Buffer.from('Hello World'));

    const fragment2 = new Fragment({
      ownerId: hashedEmail,
      type: 'text/plain',
      size: 5,
    });

    await fragment2.save();
    await fragment2.setData(Buffer.from('Test'));

    // Retrieve fragments
    const res = await request(app).get('/v1/fragments').auth(email, 'password1').expect(200);

    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toBe(2);

    // Verify the fragment IDs for both fragments is the same
    expect(res.body.fragments).toContain(fragment1.id);
    expect(res.body.fragments).toContain(fragment2.id);
  });
});

describe('GET /v1/fragments Edge Cases', () => {
  const email = 'user1@email.com';
  const hashedEmail = hash(email);

  beforeEach(async () => {
    // Ensure a clean slate for each test
    const existingFragments = await Fragment.byUser(hashedEmail);
    for (const fragmentId of existingFragments) {
      await Fragment.delete(hashedEmail, fragmentId);
    }
  });

  test('returns empty array when no fragments exist', async () => {
    const res = await request(app).get('/v1/fragments').auth(email, 'password1').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual([]);
  });

  test('handles multiple fragments', async () => {
    // Create multiple fragments
    const fragmentPromises = Array(5)
      .fill()
      .map((_, index) => {
        const fragment = new Fragment({
          ownerId: hashedEmail,
          type: 'text/plain',
          size: index + 1,
        });
        return fragment.save().then(() => fragment.setData(Buffer.from(`Fragment ${index + 1}`)));
      });

    await Promise.all(fragmentPromises);

    const res = await request(app).get('/v1/fragments').auth(email, 'password1').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.fragments.length).toBe(5);
  });
});
describe('GET /v1/fragments Coverage Tests', () => {
  // Mock logger to test error logging paths
  const mockErrorLog = jest.spyOn(logger, 'error').mockImplementation();
  const mockWarnLog = jest.spyOn(logger, 'warn').mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('handles internal server error during fragment retrieval', async () => {
    // Temporarily mock Fragment.byUser to throw an error
    const originalByUser = Fragment.byUser;
    Fragment.byUser = jest.fn().mockRejectedValue(new Error('Database connection failed'));

    try {
      const email = 'user1@email.com';
      const res = await request(app).get('/v1/fragments').auth(email, 'password1').expect(500);

      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe(500);
      expect(res.body.error.message).toBe('Internal Server Error');

      // Verify error was logged
      expect(mockErrorLog).toHaveBeenCalled();
      expect(mockWarnLog).toHaveBeenCalled();
    } finally {
      // Restore the original method
      Fragment.byUser = originalByUser;
    }
  });

  test('logs warning when fragment retrieval fails', async () => {
    // Temporarily mock Fragment.byUser to throw an error
    const originalByUser = Fragment.byUser;
    Fragment.byUser = jest.fn().mockRejectedValue(new Error('Unexpected error'));

    try {
      const email = 'user1@email.com';
      await request(app).get('/v1/fragments').auth(email, 'password1').expect(500);

      // Verify error logging
      expect(mockErrorLog).toHaveBeenCalled();
      expect(mockWarnLog).toHaveBeenCalled();
    } finally {
      // Restore the original method
      Fragment.byUser = originalByUser;
    }
  });
});
