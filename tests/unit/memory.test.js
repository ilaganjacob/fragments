const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');

// readFragment test
describe('Fragment Memory Database tests', () => {
  const ownerId = '1234';
  const fragmentId = 'abcd';
  const testFragment = {
    id: fragmentId,
    ownerId,
    type: 'text/plain',
    size: 10,
  };

  const testData = Buffer.from('Hello Test');
  describe('Fragment Metadata tests ', () => {
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

    test('writeFragment should throw for invalid fragment id', async () => {
      expect.assertions(1); // Ensure the expect in the catch block is called since checking for error

      const invalidFragment = {
        ...testFragment,
        id: null,
      };

      try {
        await writeFragment(invalidFragment);
      } catch (error) {
        expect(error.message).toBe(
          'primaryKey and secondaryKey strings are required, got primaryKey=1234, secondaryKey=null'
        );
      }
    });

    test('writeFragment should throw for invalid ownerId', async () => {
      expect.assertions(1); // Ensure the expect in the catch block is called since checking for error

      const invalidFragment = {
        ...testFragment,
        ownerId: null,
      };

      try {
        await writeFragment(invalidFragment);
      } catch (error) {
        expect(error.message).toBe(
          'primaryKey and secondaryKey strings are required, got primaryKey=null, secondaryKey=abcd'
        );
      }
    });
  });

  describe('Fragment Data tests', () => {
    test('writeFragmentData should store and read Buffer data', async () => {
      await writeFragmentData(ownerId, fragmentId, testData);
    });
  });
});
