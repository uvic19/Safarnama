import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'icons');
const RES_DIR = path.join(process.cwd(), 'app', 'src', 'main', 'res');

function copyIcon(sourceName, destFolder, destName) {
  const src = path.join(PUBLIC_DIR, sourceName);
  const destDirPath = path.join(RES_DIR, destFolder);
  const dest = path.join(destDirPath, destName);
  
  if (fs.existsSync(src)) {
    if (!fs.existsSync(destDirPath)) {
        fs.mkdirSync(destDirPath, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Copied ${sourceName} -> ${destFolder}/${destName}`);
  } else {
    console.warn(`Warning: ${src} not found`);
  }
}

try {
  // Regular icons
  copyIcon('icon-72.png', 'mipmap-hdpi', 'ic_launcher.png');
  copyIcon('icon-96.png', 'mipmap-xhdpi', 'ic_launcher.png');
  copyIcon('icon-144.png', 'mipmap-xxhdpi', 'ic_launcher.png');
  copyIcon('icon-192.png', 'mipmap-xxxhdpi', 'ic_launcher.png');

  // Maskable icons
  copyIcon('icon-maskable-512.png', 'mipmap-anydpi-v26', 'ic_maskable.png'); // usually bubblewrap creates xml here, but let's just copy the pngs where they exist
  
  // It's safer to just overwrite the maskable ones in the specific density folders if they exist
  // We only generated maskable 192, let's copy it everywhere just to be safe, Android scales down fine
  copyIcon('icon-maskable-192.png', 'mipmap-xxxhdpi', 'ic_maskable.png');
  copyIcon('icon-maskable-192.png', 'mipmap-xxhdpi', 'ic_maskable.png');
  copyIcon('icon-maskable-192.png', 'mipmap-xhdpi', 'ic_maskable.png');
  copyIcon('icon-maskable-192.png', 'mipmap-hdpi', 'ic_maskable.png');
  
  console.log('Successfully synced icons to Android project!');
} catch (error) {
  console.error('Error syncing icons:', error);
}
