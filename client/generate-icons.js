import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SIZES = [72, 96, 128, 144, 192, 512];
const SOURCE_IMAGE = path.join(process.cwd(), 'public', 'icons', 'logo.png');
const OUT_DIR = path.join(process.cwd(), 'public', 'icons');

async function generateIcons() {
  try {
    const exists = await fs.access(SOURCE_IMAGE).then(() => true).catch(() => false);
    if (!exists) {
      console.error('Source image not found:', SOURCE_IMAGE);
      process.exit(1);
    }

    for (const size of SIZES) {
      await sharp(SOURCE_IMAGE)
        .resize(size, size)
        .toFile(path.join(OUT_DIR, `icon-${size}.png`));
      
      // Also create maskable versions (same for now, as padding can be added if needed, but we'll use raw icon)
      if (size === 192 || size === 512) {
        await sharp(SOURCE_IMAGE)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 9, g: 9, b: 11, alpha: 1 } // #09090B
          })
          .toFile(path.join(OUT_DIR, `icon-maskable-${size}.png`));
      }
      console.log(`Generated ${size}x${size} icons`);
    }

    console.log('Successfully generated all icons!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
