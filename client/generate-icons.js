import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'icons');
const extractedPng = path.join(PUBLIC_DIR, 'extracted.png');

async function createPerfectIcon(size, paddingScale = 1) {
  // We want the logo to be 64% of the container size (Android adaptive icon safe zone)
  const safeSize = Math.round(size * 0.64 * paddingScale);
  const padding = Math.round((size - safeSize) / 2);
  const actualSize = size - (padding * 2);

  return sharp(extractedPng)
    // The extracted PNG might be black (the SVG inverted it). Let's force it to be white.
    .tint({ r: 255, g: 255, b: 255 }) // This might not work if it's already white, but let's just make sure it's white.
    // Actually, a better way to force white on a transparent PNG is to use a white rect and composite with 'in'
    .resize(actualSize, actualSize)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: '#09090B'
    })
    .png()
    .toBuffer();
}

async function forceWhiteForeground() {
  // First let's make a solid white version of extracted.png
  const metadata = await sharp(extractedPng).metadata();
  const whiteLayer = await sharp({
    create: {
      width: metadata.width,
      height: metadata.height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer();

  const whiteCompassBuffer = await sharp(extractedPng)
    .composite([{ input: whiteLayer, blend: 'in' }])
    .png()
    .toBuffer();
    
  return whiteCompassBuffer;
}

async function generateIcons() {
  try {
    const whiteCompass = await forceWhiteForeground();

    async function buildIcon(outputFile, size, paddingScale = 1) {
      const safeSize = Math.round(size * 0.64 * paddingScale);
      const padding = Math.round((size - safeSize) / 2);
      const actualSize = size - (padding * 2);

      await sharp(whiteCompass)
        .resize(actualSize, actualSize)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: '#09090B'
        })
        .png()
        .toFile(outputFile);
    }

    // Normal Icons (Bubblewrap will add 8.5dp padding, which is ~15% extra padding, so we should make our logo slightly LARGER here so it doesn't become too small!)
    // Wait, if Bubblewrap adds padding, the logo is shrunk. 
    // Android safe zone is normally 66%. Bubblewrap's XML shrinks the WHOLE image by ~15%.
    // So if we make the compass fill 75% of the image, Bubblewrap will shrink it to ~64%, which is PERFECT.
    const PADDING_SCALE = 1.15; // Make the compass larger so it survives Bubblewrap's shrinking

    await buildIcon(path.join(PUBLIC_DIR, 'icon-512.png'), 512, PADDING_SCALE);
    await buildIcon(path.join(PUBLIC_DIR, 'icon-192.png'), 192, PADDING_SCALE);
    await buildIcon(path.join(PUBLIC_DIR, 'icon-144.png'), 144, PADDING_SCALE);
    await buildIcon(path.join(PUBLIC_DIR, 'icon-96.png'), 96, PADDING_SCALE);
    await buildIcon(path.join(PUBLIC_DIR, 'icon-72.png'), 72, PADDING_SCALE);

    await buildIcon(path.join(PUBLIC_DIR, 'icon-maskable-512.png'), 512, PADDING_SCALE);
    await buildIcon(path.join(PUBLIC_DIR, 'icon-maskable-192.png'), 192, PADDING_SCALE);

    console.log('Successfully generated rock-solid RAW PNG icons!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
