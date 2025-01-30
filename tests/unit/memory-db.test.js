const MemoryDB = require('../../src/model/data/memory/memory-db');

describe('memory-db', () => {
  let db;
  // Each test will get its own, empty database instance
  beforeEach(() => {
    db = new MemoryDB();
  });

  test('put() returns nothing', async () => {
    const result = await db.put('a', 'b', {});
    expect(result).toBe(undefined);
  });

  test('get() returns that we put() into the db', async () => {
    const data = { value: 123 };
    await db.put('a', 'b', data);
    const result = await db.get('a', 'b');
    expect(result).toEqual(data);
  });
});
