const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');

// readFragment test
describe('readFragment test ', () => {
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

    const result = await readFragment(testFragment);
    expect(result).toEqual(testFragment);
  });

  test('should return undefined for non-existent fragment', async () => {
    const result = await readFragment('abc', 'sss');
    expect(result).toBe(undefined);
  });

  test('should return the fragment after reading it', async () => {
    const testFragment = {
      id: '123',
    };
  });
});
