// test-convert.js
const sharp = require('sharp');

// Small 1x1 transparent PNG
const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

async function testConvert() {
  try {
    console.log('Converting PNG to JPEG...');
    const jpegBuffer = await sharp(pngBuffer).jpeg().toBuffer();
    console.log('Success! JPEG size:', jpegBuffer.length);
  } catch (err) {
    console.error('Conversion failed:', err);
  }
}

testConvert();
