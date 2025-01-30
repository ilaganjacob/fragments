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
});
