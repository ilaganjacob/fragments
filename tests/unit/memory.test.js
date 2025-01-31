const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');

// readFragment test
describe('readFragment test ', () => {
  test('should return undefined for non-existent fragment', async () => {
    const result = await readFragment('abc', 'sss');
    expect(result).toBe(undefined);
  });

  test('should return the fragment after reading it', async () => {
    const testFragment = {};
  });
});
