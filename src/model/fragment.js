// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // Throwing errors to ensure attributes are given
    if (!ownerId || !type) {
      throw new Error('Missing ownerId & type');
    }

    // parse type to get object with type,
    const obj = contentType.parse(type);
    if (!Fragment.isSupportedType(obj.type)) {
      throw new Error(`type ${obj.type} is not supported`);
    }
    if (!type) {
      throw new Error('Missing type ');
    }

    if (typeof size !== 'number' || size < 0) {
      throw new Error('size must be a non-negative number');
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    if (!expand) {
      return fragments;
    }
    return fragments.map((fragment) => new Fragment(fragment));
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // TODO
    // TIP: make sure you properly re-create a full Fragment instance after getting from db.
    const fragment = await readFragment(ownerId, id);
    // Check if it exists, helpful error message
    if (!fragment) {
      throw new Error(`Fragment ${id} does not exist`);
    }
    // Create fragment from readFragment's result
    return new Fragment(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  async save() {
    // Update the updated attribute
    this.updated = new Date().toISOString();
    await writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    // TIP: make sure you update the metadata whenever you change the data, so they match
    // Update relevant fields
    this.size = data.length;
    this.updated = new Date().toISOString();

    // Run these promises in parallel since they don't depend on each other
    await Promise.all([
      // Save the fragment data
      writeFragmentData(this.ownerId, this.id, data),
      // Save the updated metadata
      this.save(),
    ]);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.includes('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // Start with the base format (the fragment's own type)
    const baseFormat = [this.mimeType];

    // For text/markdown, allow conversion to HTML and plain text
    if (this.mimeType === 'text/markdown') {
      return [...baseFormat, 'text/html', 'text/plain'];
    }

    // For text/html, allow conversion to plain text
    if (this.mimeType === 'text/html') {
      return [...baseFormat, 'text/plain'];
    }

    // For text/plain, return only plain text
    if (this.mimeType === 'text/plain') {
      return baseFormat;
    }

    // For text/csv, allow conversion to JSON and plain text
    if (this.mimeType === 'text/csv') {
      return [...baseFormat, 'application/json', 'text/plain'];
    }

    // For application/json, allow conversion to text, YAML
    if (this.mimeType === 'application/json') {
      return [...baseFormat, 'text/plain', 'application/yaml'];
    }

    // For application/yaml, allow conversion to text and JSON
    if (this.mimeType === 'application/yaml') {
      return [...baseFormat, 'text/plain', 'application/json'];
    }

    // For image types, allow conversion to all other image formats
    if (this.mimeType.startsWith('image/')) {
      return [
        this.mimeType,
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
        'image/avif',
      ].filter((type) => type !== this.mimeType);
    }

    // Default to just the original format
    return baseFormat;
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);

    // Text types (text/*)
    if (type.startsWith('text/')) {
      return true;
    }

    // Application types
    if (type === 'application/json' || type === 'application/yaml') {
      return true;
    }
    // Image types
    if (
      type === 'image/png' ||
      type === 'image/jpeg' ||
      type === 'image/webp' ||
      type === 'image/avif' ||
      type === 'image/gif'
    ) {
      return true;
    }
    return false;
  }
}

module.exports.Fragment = Fragment;
