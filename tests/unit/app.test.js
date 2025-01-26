// test/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('404 test', () => {
  test('non-existent route attempt', () => request(app).get('/hellohi').expect(404));
});
