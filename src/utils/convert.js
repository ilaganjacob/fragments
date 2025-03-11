// Update your convert.js file with this improved implementation

const markdown = require('markdown-it')();

function convert(data, fromType, toType) {
  // If types are the same, no conversion needed
  if (fromType === toType) {
    return data;
  }

  // Convert markdown to HTML
  if (fromType === 'text/markdown' && toType === 'text/html') {
    const markdownText = data.toString();
    const html = markdown.render(markdownText);
    return Buffer.from(html);
  }

  // Convert markdown to plain text (just remove markdown syntax)
  if (fromType === 'text/markdown' && toType === 'text/plain') {
    const markdownText = data.toString();
    return Buffer.from(markdownText);
  }

  // Convert HTML to plain text (remove HTML tags)
  if (fromType === 'text/html' && toType === 'text/plain') {
    const html = data.toString();
    const text = html.replace(/<[^>]*>/g, '');
    return Buffer.from(text);
  }

  // Convert JSON to plain text
  if (fromType === 'application/json' && toType === 'text/plain') {
    const json = data.toString();
    return Buffer.from(json);
  }

  // If we don't know how to convert between these types, throw
  throw new Error(`Unsupported conversion from ${fromType} to ${toType}`);
}

module.exports = convert;
