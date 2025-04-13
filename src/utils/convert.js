// src/utils/convert.js
const markdown = require('markdown-it')();
const logger = require('../logger');

/**
 * Convert a fragment's data from one type to another
 *
 * @param {Buffer} data - the fragment data (as a Buffer)
 * @param {string} fromType - the content type of the data
 * @param {string} toType - the content type to convert to
 * @returns {Buffer} - the converted data
 * @throws {Error} - if conversion is not supported
 */
function convert(data, fromType, toType) {
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
