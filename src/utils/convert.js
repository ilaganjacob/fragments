// src/utils/convert.js
const markdown = require('markdown-it')();
const logger = require('../logger');
const sharp = require('sharp');
/**
 * Convert a fragment's data from one type to another
 *
 * @param {Buffer} data - the fragment data (as a Buffer)
 * @param {string} fromType - the content type of the data
 * @param {string} toType - the content type to convert to
 * @returns {Buffer} - the converted data
 * @throws {Error} - if conversion is not supported
 */
async function convert(data, fromType, toType) {
  // If types are the same, no conversion needed
  if (fromType === toType) {
    return data;
  }

  // Get base types without encoding info
  const baseFromType = fromType.split(';')[0].trim();
  const baseToType = toType.split(';')[0].trim();

  // Handle image conversions
  if (baseFromType.startsWith('image/') && baseToType.startsWith('image/')) {
    try {
      let sharpImage = sharp(data);

      // Convert to the appropriate format
      switch (baseToType) {
        case 'image/png':
          return await sharpImage.png().toBuffer();
        case 'image/jpeg':
          return await sharpImage.jpeg().toBuffer();
        case 'image/webp':
          return await sharpImage.webp().toBuffer();
        case 'image/avif':
          return await sharpImage.avif().toBuffer();
        case 'image/gif':
          return await sharpImage.gif().toBuffer();
        default:
          throw new Error(`Unsupported output image format: ${baseToType}`);
      }
    } catch (err) {
      throw new Error(`Image conversion error: ${err.message}`);
    }
  }
}
module.exports = convert;
