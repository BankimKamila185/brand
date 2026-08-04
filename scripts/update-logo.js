import fs from "fs";
import path from "path";
import sharp from "sharp";

const files = fs.readdirSync(".");
const svgFileName = files.find((f) => f.includes("Screenshot") && f.endsWith(".svg"));
if (!svgFileName) {
  console.error("SVG file not found!");
  process.exit(1);
}

let svgRaw = fs.readFileSync(svgFileName, "utf8");

// Remove the solid white background rectangle to make SVG transparent
const transparentSvg = svgRaw.replace(
  '<path fill="white" transform="translate(-68 -83)" d="M0 0L486 0L486 473.479L486 483.769L486 664L0 664L0 0Z"/>',
  ""
);

const svgBuffer = Buffer.from(transparentSvg);

async function generateIcons() {
  console.log("Generating transparent, high-res logo & favicons from SVG...");

  // Write transparent SVGs
  fs.writeFileSync(path.resolve("public/logo.svg"), transparentSvg);
  fs.writeFileSync(path.resolve("public/icon.svg"), transparentSvg);
  fs.writeFileSync(path.resolve("src/app/icon.svg"), transparentSvg);

  // Generate 512x512 PNG with tight trim and 10% padding
  const trimmedBuffer = await sharp(svgBuffer)
    .trim()
    .toBuffer();

  const png512 = await sharp(trimmedBuffer)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  fs.writeFileSync(path.resolve("public/icon.png"), png512);
  fs.writeFileSync(path.resolve("public/icon-512.png"), png512);
  fs.writeFileSync(path.resolve("public/seo-logo.png"), png512);
  fs.writeFileSync(path.resolve("src/app/icon.png"), png512);

  // Generate 192x192 PNG
  const png192 = await sharp(trimmedBuffer)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve("public/icon-192.png"), png192);

  // Generate 180x180 Apple Touch Icon
  const applePng = await sharp(trimmedBuffer)
    .resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve("public/apple-icon.png"), applePng);
  fs.writeFileSync(path.resolve("src/app/apple-icon.png"), applePng);

  // Generate 48x48 Favicon ICO
  const favIco = await sharp(trimmedBuffer)
    .resize(48, 48, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.resolve("public/favicon.ico"), favIco);
  fs.writeFileSync(path.resolve("src/app/favicon.ico"), favIco);

  console.log("✅ Transparent logo & favicons generated successfully!");
}

generateIcons().catch(console.error);
