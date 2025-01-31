const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');

// readFragment test
describe('Fragment Metadata tests ', () => {
  const ownerId = '1234';
  const fragmentId = 'abcd';
  const testFragment = {
    id: fragmentId,
    ownerId,
    type: 'text/plain',
    size: 10,
  };
  test('writeFragment should store fragment metadata', async () => {
    // await because it returns a promise
    await writeFragment(testFragment);

    const result = await readFragment(ownerId, fragmentId);
    expect(result).toEqual(testFragment);
  });

  test('should return undefined for non-existent fragment', async () => {
    const result = await readFragment(ownerId, 'sss');
    expect(result).toBe(undefined);
  });

  test('writeFragment should throw for invalid keys', async () => {
    const invalidFragment = {
      ...testFragment,
      id: null,
    };
    await expect(writeFragment(invalidFragment)).rejects.toThrow();
  });
});

describe('Fragment data tests', () => {});
