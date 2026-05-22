import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'icons');

async function generatePaddedIcon(inputFile, outputFile, size) {
  // Android adaptive icons require the logo to be within the inner 66% of the image.
  const safeSize = Math.round(size * 0.66);
  const padding = Math.round((size - safeSize) / 2);
  const actualSize = size - (padding * 2); // Ensure it adds up perfectly to 'size'

  await sharp(inputFile)
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

async function generateIcons() {
  try {
    const inputSvg = path.join(PUBLIC_DIR, 'FinalAppLogo.svg');
    
    // 1. App Icon
    await generatePaddedIcon(inputSvg, path.join(PUBLIC_DIR, 'icon-512.png'), 512);
    await generatePaddedIcon(inputSvg, path.join(PUBLIC_DIR, 'icon-192.png'), 192);
    await generatePaddedIcon(inputSvg, path.join(PUBLIC_DIR, 'icon-144.png'), 144);
    await generatePaddedIcon(inputSvg, path.join(PUBLIC_DIR, 'icon-96.png'), 96);
    await generatePaddedIcon(inputSvg, path.join(PUBLIC_DIR, 'icon-72.png'), 72);

    // 2. Maskable / Splash Screen
    await generatePaddedIcon(inputSvg, path.join(PUBLIC_DIR, 'icon-maskable-512.png'), 512);
    await generatePaddedIcon(inputSvg, path.join(PUBLIC_DIR, 'icon-maskable-192.png'), 192);

    console.log('Successfully generated PNG icons with PERFECT Android padding!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
