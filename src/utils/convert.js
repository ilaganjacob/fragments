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

  // Get the base MIME type without any encoding information
  const getBaseType = (type) => type.split(';')[0].trim().toLowerCase();
  const baseFromType = getBaseType(fromType);
  const baseToType = getBaseType(toType);

  try {
    // TEXT CONVERSIONS

    // Markdown to HTML
    if (baseFromType === 'text/markdown' && baseToType === 'text/html') {
      const markdownText = data.toString();
      const html = markdown.render(markdownText);
      return Buffer.from(html);
    }

    // Markdown to plain text (just use as is)
    if (baseFromType === 'text/markdown' && baseToType === 'text/plain') {
      return data;
    }

    // HTML to plain text (remove HTML tags)
    if (baseFromType === 'text/html' && baseToType === 'text/plain') {
      const html = data.toString();
      // Simple HTML tag stripper
      const text = html.replace(/<[^>]*>/g, '');
      return Buffer.from(text);
    }

    // JSON to plain text (already text, so pass through)
    if (baseFromType === 'application/json' && baseToType === 'text/plain') {
      return data;
    }

    // CSV to plain text (already text, so pass through)
    if (baseFromType === 'text/csv' && baseToType === 'text/plain') {
      return data;
    }

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

    // If we get here, the conversion is not supported
    throw new Error('Unsupported conversion');
  } catch (err) {
    // If it's our own error message, re-throw it
    if (err.message === 'Unsupported conversion') {
      throw err;
    }

    // For all other errors, wrap with a more generic message
    logger.error({ err, fromType, toType }, 'Error during conversion');
    throw new Error('Unsupported conversion');
  }
}

module.exports = convert;
