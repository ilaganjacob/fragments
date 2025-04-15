// src/utils/convert.js
const markdown = require('markdown-it')();
const sharp = require('sharp');
const yaml = require('js-yaml');
const csv = require('csv-parser');
const { Readable } = require('stream');
const logger = require('../logger');

/**
 * Convert a fragment's data from one type to another
 *
 * @param {Buffer} data - the fragment data (as a Buffer)
 * @param {string} fromType - the content type of the data
 * @param {string} toType - the content type to convert to
 * @returns {Buffer|Promise<Buffer>} - the converted data or a Promise resolving to the converted data
 * @throws {Error} if conversion is not supported
 */
async function convert(data, fromType, toType) {
  // If types are the same, no conversion needed
  if (fromType === toType) {
    return data;
  }

  // Get the base MIME type without any encoding information
  const getBaseType = (type) => type.split(';')[0].trim();
  const baseFromType = getBaseType(fromType);
  const baseToType = getBaseType(toType);

  logger.debug({ baseFromType, baseToType, dataSize: data.length }, 'Converting between types');

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
      // Simple HTML tag stripper, could be enhanced with a proper HTML parser
      const text = html.replace(/<[^>]*>|<[^>]*\/>/g, '');
      return Buffer.from(text);
    }

    // JSON CONVERSIONS

    // JSON to YAML
    if (baseFromType === 'application/json' && baseToType === 'application/yaml') {
      try {
        const jsonData = JSON.parse(data.toString());
        const yamlData = yaml.dump(jsonData);
        return Buffer.from(yamlData);
      } catch (err) {
        logger.error({ err }, 'Error converting JSON to YAML');
        throw new Error(`Unable to convert JSON to YAML: ${err.message}`);
      }
    }

    // JSON to plain text
    if (baseFromType === 'application/json' && baseToType === 'text/plain') {
      return data; // JSON is already text
    }

    // YAML CONVERSIONS

    // YAML to JSON
    if (baseFromType === 'application/yaml' && baseToType === 'application/json') {
      try {
        const yamlData = yaml.load(data.toString());
        const jsonData = JSON.stringify(yamlData, null, 2);
        return Buffer.from(jsonData);
      } catch (err) {
        logger.error({ err }, 'Error converting YAML to JSON');
        throw new Error(`Unable to convert YAML to JSON: ${err.message}`);
      }
    }

    // YAML to plain text
    if (baseFromType === 'application/yaml' && baseToType === 'text/plain') {
      return data; // YAML is already text
    }

    // CSV CONVERSIONS

    // CSV to JSON
    if (baseFromType === 'text/csv' && baseToType === 'application/json') {
      try {
        return new Promise((resolve, reject) => {
          const results = [];
          Readable.from(data.toString())
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('error', (error) => {
              logger.error({ error }, 'Error parsing CSV');
              reject(new Error(`CSV parsing error: ${error.message}`));
            })
            .on('end', () => {
              resolve(Buffer.from(JSON.stringify(results)));
            });
        });
      } catch (err) {
        logger.error({ err }, 'Error converting CSV to JSON');
        throw new Error(`Unable to convert CSV to JSON: ${err.message}`);
      }
    }

    // CSV to plain text
    if (baseFromType === 'text/csv' && baseToType === 'text/plain') {
      return data; // CSV is already text
    }

    // IMAGE CONVERSIONS
    if (baseFromType.startsWith('image/') && baseToType.startsWith('image/')) {
      try {
        logger.debug({ fromType: baseFromType, toType: baseToType }, 'Starting image conversion');
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
            logger.warn({ toType: baseToType }, 'Unsupported output image format');
            throw new Error(`Unsupported output image format: ${baseToType}`);
        }
      } catch (err) {
        logger.error({ err, fromType: baseFromType, toType: baseToType }, 'Image conversion error');
        throw new Error(`Image conversion error: ${err.message}`);
      }
    }

    // If we don't know how to convert between these types, throw
    logger.warn(
      { fromType: baseFromType, toType: baseToType },
      'Unsupported conversion between types'
    );
    throw new Error(`Unsupported conversion from ${fromType} to ${toType}`);
  } catch (err) {
    // Log the error with context for easier debugging
    logger.error(
      {
        err,
        fromType,
        toType,
        dataSize: data.length,
      },
      'Conversion error'
    );
    throw err;
  }
}

module.exports = convert;
