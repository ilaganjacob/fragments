const validateKey = (key) => typeof key === 'string';

class MemoryDB {
  constructor() {
    /** @type {Record<string, any>} */
    this.db = {};
  }

  /**
   * Gets a value for the given primaryKey and secondaryKey
   * @param {string} primaryKey
   * @param {string} secondaryKey
   * @returns{Promise<any>}
   */
  get(primaryKey, secondaryKey) {
    if (!(validateKey(primaryKey) && validateKey(secondaryKey))) {
      throw new Error(
        `primaryKey and secondaryKey strings are required, got primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`
      );
    }
    const db = this.db;
    const value = db[primaryKey] && db[primaryKey][secondaryKey];
    return Promise.resolve(value);
  }

  /**
   *  Puts a value into the given primaryKey and secondaryKey
   */
}
