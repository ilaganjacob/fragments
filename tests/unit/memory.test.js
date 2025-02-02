const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');

// readFragment test

const testData = Buffer.from('Hello Test');
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
  const ownerId = '1234';
  const fragmentId = 'abcd';
  const testData = Buffer.from('Hello Test');

  test('writeFragmentData should store and read Buffer data', async () => {
    await writeFragmentData(ownerId, fragmentId, testData);
    const result = await readFragmentData(ownerId, fragmentId);
    expect(Buffer.compare(result, testData)).toBe(0);
  });

  test('readFragmentData should return undefined for non-existent data', async () => {
    const result = await readFragmentData(ownerId, 'doesnotexist');
    expect(result).toBe(undefined);
  });

  test('writeFragmentData should allow overwriting existing data', async () => {
    // Write initial data
    await writeFragmentData(ownerId, fragmentId, testData);

    // Write new data
    const newData = Buffer.from('New Data');
    await writeFragmentData(ownerId, fragmentId, newData);

    // Read and verify new data
    const result = await readFragmentData(ownerId, fragmentId);
    expect(Buffer.compare(result, newData)).toBe(0);
  });
});
