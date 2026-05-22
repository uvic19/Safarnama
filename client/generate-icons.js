import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'icons');

async function generateIcons() {
  try {
    const inputSvg = path.join(PUBLIC_DIR, 'FinalAppLogo.svg');
    
    // 1. App Icon
    await sharp(inputSvg).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
    await sharp(inputSvg).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
    await sharp(inputSvg).resize(144, 144).png().toFile(path.join(PUBLIC_DIR, 'icon-144.png'));
    await sharp(inputSvg).resize(96, 96).png().toFile(path.join(PUBLIC_DIR, 'icon-96.png'));
    await sharp(inputSvg).resize(72, 72).png().toFile(path.join(PUBLIC_DIR, 'icon-72.png'));

    // 2. Maskable / Splash Screen
    await sharp(inputSvg).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'icon-maskable-512.png'));
    await sharp(inputSvg).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, 'icon-maskable-192.png'));

    console.log('Successfully generated original PNG icons!');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
