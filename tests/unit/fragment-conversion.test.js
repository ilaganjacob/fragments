// tests/unit/fragment-conversion.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

describe('Fragment conversion tests', () => {
  const email = 'user1@email.com';
  const hashedEmail = hash(email);

  test('converting markdown fragment to HTML', async () => {
    // Create a markdown fragment
    const markdownContent = '# Heading\n\nThis is **bold** text';
    const fragment = new Fragment({
      ownerId: hashedEmail,
      type: 'text/markdown',
      size: markdownContent.length,
    });

    await fragment.save();
    await fragment.setData(Buffer.from(markdownContent));

    // Request the fragment as HTML
    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.html`)
      .auth(email, 'password1')
      .expect(200)
      .expect('Content-Type', 'text/html');

    expect(res.text).toContain('<h1>Heading</h1>');
    expect(res.text).toContain('<strong>bold</strong>');
  });

  test('non-existent fragment returns 404 even with extension', async () => {
    await request(app)
      .get('/v1/fragments/non-existent-id.html')
      .auth(email, 'password1')
      .expect(404);
  });
});
