import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'icons');
const svgPath = path.join(PUBLIC_DIR, 'FinalAppLogo.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

const match = svgContent.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
if (match && match[1]) {
    const base64Data = match[1];
    fs.writeFileSync(path.join(PUBLIC_DIR, 'extracted.png'), Buffer.from(base64Data, 'base64'));
    console.log('Extracted PNG successfully.');
} else {
    console.log('No base64 found.');
}
