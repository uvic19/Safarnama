import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'icons');
const RES_DIR = path.join(process.cwd(), 'app', 'src', 'main', 'res');

async function processIcon() {
    try {
        const inputPng = path.join(PUBLIC_DIR, 'FinalApp.png');

        // Sizes for standard Android legacy icons
        const sizes = {
            'mipmap-mdpi': 48,
            'mipmap-hdpi': 72,
            'mipmap-xhdpi': 96,
            'mipmap-xxhdpi': 144,
            'mipmap-xxxhdpi': 192
        };

        // Resize and copy directly to Android res folders
        for (const [folder, size] of Object.entries(sizes)) {
            const destDir = path.join(RES_DIR, folder);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            
            await sharp(inputPng)
                .resize(size, size)
                .png()
                .toFile(path.join(destDir, 'ic_launcher.png'));
                
            // Also save as ic_maskable.png just in case some other tool references it
            await sharp(inputPng)
                .resize(size, size)
                .png()
                .toFile(path.join(destDir, 'ic_maskable.png'));
                
            console.log(`Generated ${size}x${size} for ${folder}`);
        }

        // Overwrite the PWA icons as well
        await sharp(inputPng).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
        await sharp(inputPng).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
        await sharp(inputPng).resize(144, 144).png().toFile(path.join(PUBLIC_DIR, 'icon-144.png'));
        await sharp(inputPng).resize(96, 96).png().toFile(path.join(PUBLIC_DIR, 'icon-96.png'));
        await sharp(inputPng).resize(72, 72).png().toFile(path.join(PUBLIC_DIR, 'icon-72.png'));
        await sharp(inputPng).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'icon-maskable-512.png'));
        
        // **CRITICAL FIX**: Delete the adaptive icon configuration so Android doesn't mess with padding!
        const anydpiDir = path.join(RES_DIR, 'mipmap-anydpi-v26');
        if (fs.existsSync(anydpiDir)) {
            fs.rmSync(anydpiDir, { recursive: true, force: true });
            console.log('Deleted mipmap-anydpi-v26 to disable Android automatic padding!');
        }

        console.log('Successfully applied raw PNG icons exactly as provided!');
    } catch (err) {
        console.error('Error:', err);
    }
}

processIcon();
