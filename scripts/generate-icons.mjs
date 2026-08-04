import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'icon.svg');

const svgBuffer = readFileSync(svgPath);

async function generate() {
  // favicon.ico → 48x48 PNG
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(join(publicDir, 'favicon.ico'));
  console.log('✓ favicon.ico (48x48)');

  // favicon-96x96.png → 96x96
  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile(join(publicDir, 'favicon-96x96.png'));
  console.log('✓ favicon-96x96.png (96x96)');

  // apple-touch-icon.png & apple-icon.png → 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-icon.png'));
  console.log('✓ apple-touch-icon.png & apple-icon.png (180x180)');

  // icon.png, web-app-manifest-512x512.png, seo-logo.png → 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'icon.png'));
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'seo-logo.png'));
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'web-app-manifest-512x512.png'));
  console.log('✓ 512x512 PNGs (icon, seo-logo, web-app-manifest)');

  // icon-192.png & web-app-manifest-192x192.png → 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'icon-192.png'));
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'web-app-manifest-192x192.png'));
  console.log('✓ 192x192 PNGs');

  console.log('\nAll RealFaviconGenerator compliant icons generated successfully!');
}

generate().catch(console.error);
