// tests/unit/convert.test.js

const convert = require('../../src/utils/convert');

describe('convert utility', () => {
  test('returns original data if source and target types are the same', () => {
    const data = Buffer.from('test');
    const result = convert(data, 'text/plain', 'text/plain');
    expect(result).toBe(data);
  });

  test('converts markdown to HTML', () => {
    const markdown = '# Heading\n\nThis is **bold**';
    const data = Buffer.from(markdown);
    const result = convert(data, 'text/markdown', 'text/html');

    // Check that result is a Buffer
    expect(Buffer.isBuffer(result)).toBe(true);

    // Convert to string for comparison
    const html = result.toString();

    // Check for expected HTML elements
    expect(html).toContain('<h1>');
    expect(html).toContain('Heading');
    expect(html).toContain('<strong>bold</strong>');
  });

  test('converts markdown to plain text', () => {
    const markdown = '# Heading\n\nThis is **bold**';
    const data = Buffer.from(markdown);
    const result = convert(data, 'text/markdown', 'text/plain');

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toEqual(markdown);
  });

  test('converts HTML to plain text', () => {
    const html = '<h1>Title</h1><p>This is <strong>important</strong>.</p>';
    const data = Buffer.from(html);
    const result = convert(data, 'text/html', 'text/plain');

    expect(Buffer.isBuffer(result)).toBe(true);
    const text = result.toString();
    expect(text).not.toContain('<h1>');
    expect(text).toContain('Title');
    expect(text).toContain('This is important');
  });

  test('converts JSON to plain text', () => {
    const json = JSON.stringify({ key: 'value' });
    const data = Buffer.from(json);
    const result = convert(data, 'application/json', 'text/plain');

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toEqual(json);
  });

  test('throws error for unsupported conversion', () => {
    const data = Buffer.from('test');
    expect(() => convert(data, 'text/plain', 'image/png')).toThrow('Unsupported conversion');
  });
});
