// src/utils/convert.js
const markdown = require('markdown-it')();
const sharp = require('sharp');
const yaml = require('js-yaml');
const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * Convert a fragment's data from one type to another
 *
 * @param {Buffer} data - the fragment data (as a Buffer)
 * @param {string} fromType - the content type of the data
 * @param {string} toType - the content type to convert to
 * @returns {Buffer} - the converted data
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

  // Text conversions

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
    const text = html.replace(/<[^>]*>/g, '');
    return Buffer.from(text);
  }

  // JSON conversions

  // JSON to YAML
  if (baseFromType === 'application/json' && baseToType === 'application/yaml') {
    try {
      const jsonData = JSON.parse(data.toString());
      const yamlData = yaml.dump(jsonData);
      return Buffer.from(yamlData);
    } catch (err) {
      throw new Error(`Unable to convert JSON to YAML: ${err.message}`);
    }
  }

  // JSON to plain text
  if (baseFromType === 'application/json' && baseToType === 'text/plain') {
    return data; // JSON is already text
  }

  // YAML conversions

  // YAML to JSON
  if (baseFromType === 'application/yaml' && baseToType === 'application/json') {
    try {
      const yamlData = yaml.load(data.toString());
      const jsonData = JSON.stringify(yamlData, null, 2);
      return Buffer.from(jsonData);
    } catch (err) {
      throw new Error(`Unable to convert YAML to JSON: ${err.message}`);
    }
  }

  // YAML to plain text
  if (baseFromType === 'application/yaml' && baseToType === 'text/plain') {
    return data; // YAML is already text
  }

  // CSV conversions

  // CSV to JSON
  if (baseFromType === 'text/csv' && baseToType === 'application/json') {
    try {
      return new Promise((resolve, reject) => {
        const results = [];
        const csvStream = Readable.from(data.toString())
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('error', (error) => reject(new Error(`CSV parsing error: ${error.message}`)))
          .on('end', () => {
            resolve(Buffer.from(JSON.stringify(results)));
          });
      });
    } catch (err) {
      throw new Error(`Unable to convert CSV to JSON: ${err.message}`);
    }
  }

  // CSV to plain text
  if (baseFromType === 'text/csv' && baseToType === 'text/plain') {
    return data; // CSV is already text
  }

  // Image conversions
  if (baseFromType.startsWith('image/') && baseToType.startsWith('image/')) {
    try {
      let sharpImage = sharp(data);

      // Convert to the appropriate format
      switch (baseToType) {
        case 'image/png':
          sharpImage = sharpImage.png();
          break;
        case 'image/jpeg':
          sharpImage = sharpImage.jpeg();
          break;
        case 'image/webp':
          sharpImage = sharpImage.webp();
          break;
        case 'image/avif':
          sharpImage = sharpImage.avif();
          break;
        case 'image/gif':
          sharpImage = sharpImage.gif();
          break;
        default:
          throw new Error(`Unsupported output image format: ${baseToType}`);
      }

      // Get the buffer
      return await sharpImage.toBuffer();
    } catch (err) {
      throw new Error(`Image conversion error: ${err.message}`);
    }
  }

  // If we don't know how to convert between these types, throw
  throw new Error(`Unsupported conversion from ${fromType} to ${toType}`);
}

module.exports = convert;
