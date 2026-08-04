import fs from "fs";
import path from "path";
import sharp from "sharp";

const svgPath = path.resolve(
  "/Users/bankimkamila/Tevar/Screenshot 2026-07-03 at 8.50.02\u202FPM (1).svg"
);

const svgBuffer = fs.readFileSync(svgPath);

async function generateIcons() {
  console.log("Generating high-res logo & favicons from SVG...");

  // Copy SVG to target locations
  fs.writeFileSync(path.resolve("public/logo.svg"), svgBuffer);
  fs.writeFileSync(path.resolve("public/icon.svg"), svgBuffer);
  fs.writeFileSync(path.resolve("src/app/icon.svg"), svgBuffer);

  // Generate 512x512 PNG
  const png512 = await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toBuffer();

  fs.writeFileSync(path.resolve("public/icon.png"), png512);
  fs.writeFileSync(path.resolve("public/icon-512.png"), png512);
  fs.writeFileSync(path.resolve("public/seo-logo.png"), png512);
  fs.writeFileSync(path.resolve("src/app/icon.png"), png512);

  // Generate 192x192 PNG
  const png192 = await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve("public/icon-192.png"), png192);

  // Generate 180x180 Apple Touch Icon
  const applePng = await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve("public/apple-icon.png"), applePng);
  fs.writeFileSync(path.resolve("src/app/apple-icon.png"), applePng);

  // Generate 48x48 Favicon ICO
  const favIco = await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve("public/favicon.ico"), favIco);
  fs.writeFileSync(path.resolve("src/app/favicon.ico"), favIco);

  console.log("✅ All logo and favicon files updated successfully!");
}

generateIcons().catch(console.error);
