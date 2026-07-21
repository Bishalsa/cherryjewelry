import sharp from "sharp";
import fs from "fs";
import path from "path";

const srcPath = "C:\\Users\\bisha\\.gemini\\antigravity-ide\\brain\\18f1e36e-c295-4f3d-a830-1ef31b4350bd\\media__1784668171193.jpg";
const publicDir = "c:\\Users\\bisha\\OneDrive\\Desktop\\jewellery\\public";
const appDir = "c:\\Users\\bisha\\OneDrive\\Desktop\\jewellery\\src\\app";

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

async function generateBrandAssets() {
  console.log("Processing official Cherry Jewelry logo from:", srcPath);

  const metadata = await sharp(srcPath).metadata();
  console.log(`Source dimensions: ${metadata.width}x${metadata.height}`);
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  // 1. Copy & process primary logo PNG
  await sharp(srcPath)
    .resize(800, 800, { fit: "contain", background: { r: 253, g: 248, b: 246, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, "logo.png"));
  console.log("Created public/logo.png");

  // 2. Extract emblem crop (the C-J heart cherry mark) for high legibility at small sizes
  const cropLeft = Math.round(width * 0.22);
  const cropTop = Math.round(height * 0.12);
  const cropWidth = Math.round(width * 0.56);
  const cropHeight = Math.round(height * 0.54);

  const emblemBuffer = await sharp(srcPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .toBuffer();

  await sharp(emblemBuffer)
    .resize(512, 512, { fit: "contain" })
    .png()
    .toFile(path.join(publicDir, "logo-emblem.png"));
  console.log("Created public/logo-emblem.png");

  // 3. Generate Android Chrome 512x512
  await sharp(srcPath)
    .resize(512, 512, { fit: "cover" })
    .png()
    .toFile(path.join(publicDir, "android-chrome-512x512.png"));
  console.log("Created public/android-chrome-512x512.png");

  // 4. Generate Android Chrome 192x192
  await sharp(srcPath)
    .resize(192, 192, { fit: "cover" })
    .png()
    .toFile(path.join(publicDir, "android-chrome-192x192.png"));
  console.log("Created public/android-chrome-192x192.png");

  // 5. Generate Apple Touch Icon 180x180
  await sharp(srcPath)
    .resize(180, 180, { fit: "cover" })
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  await sharp(srcPath)
    .resize(180, 180, { fit: "cover" })
    .png()
    .toFile(path.join(appDir, "apple-icon.png"));
  console.log("Created public/apple-touch-icon.png & src/app/apple-icon.png");

  // 6. Generate mstile 150x150
  await sharp(srcPath)
    .resize(150, 150, { fit: "cover" })
    .png()
    .toFile(path.join(publicDir, "mstile-150x150.png"));
  console.log("Created public/mstile-150x150.png");

  // 7. Generate favicon-32x32.png
  await sharp(emblemBuffer)
    .resize(32, 32, { fit: "contain" })
    .png()
    .toFile(path.join(publicDir, "favicon-32x32.png"));
  await sharp(emblemBuffer)
    .resize(32, 32, { fit: "contain" })
    .png()
    .toFile(path.join(appDir, "icon.png"));
  console.log("Created public/favicon-32x32.png & src/app/icon.png");

  // 8. Generate favicon-16x16.png
  await sharp(emblemBuffer)
    .resize(16, 16, { fit: "contain" })
    .png()
    .toFile(path.join(publicDir, "favicon-16x16.png"));
  console.log("Created public/favicon-16x16.png");

  // 9. Generate favicon.ico (Overwrite both public/favicon.ico and src/app/favicon.ico!)
  await sharp(emblemBuffer)
    .resize(32, 32, { fit: "contain" })
    .png()
    .toFile(path.join(publicDir, "favicon.ico"));
  await sharp(emblemBuffer)
    .resize(32, 32, { fit: "contain" })
    .png()
    .toFile(path.join(appDir, "favicon.ico"));
  console.log("Created & overwrote public/favicon.ico AND src/app/favicon.ico");

  // 10. Generate Open Graph Image (1200x630)
  const ogCanvas = sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 254, g: 240, b: 233, alpha: 1 },
    },
  });

  const logoResizedForOG = await sharp(srcPath)
    .resize(540, 540, { fit: "contain" })
    .toBuffer();

  const ogTextSvg = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="1160" height="590" rx="16" fill="none" stroke="rgba(183,110,121,0.25)" stroke-width="2"/>
    </svg>
  `);

  await ogCanvas
    .composite([
      { input: ogTextSvg, top: 0, left: 0 },
      { input: logoResizedForOG, top: 45, left: 330 },
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(publicDir, "og-image.jpg"));

  await sharp(path.join(publicDir, "og-image.jpg"))
    .toFile(path.join(appDir, "opengraph-image.jpg"));
  console.log("Created public/og-image.jpg & src/app/opengraph-image.jpg");

  // 11. Generate safari-pinned-tab.svg & mask-icon.svg
  const svgMaskContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#5C2248">
  <path d="M50 15 C30 15 15 30 15 50 C15 70 30 85 50 85 C65 85 78 74 83 60 C80 64 74 67 67 67 C53 67 42 56 42 42 C42 32 48 24 57 20 C55 17 53 15 50 15 Z M60 25 C65 25 70 28 73 33 C77 28 82 25 87 25 C94 25 99 31 99 38 C99 49 85 60 73 68 C61 60 47 49 47 38 C47 31 52 25 60 25 Z"/>
</svg>`;

  fs.writeFileSync(path.join(publicDir, "safari-pinned-tab.svg"), svgMaskContent);
  fs.writeFileSync(path.join(publicDir, "mask-icon.svg"), svgMaskContent);
  console.log("Created safari-pinned-tab.svg & mask-icon.svg");

  console.log("All brand assets successfully updated in public/ and src/app/!");
}

generateBrandAssets().catch((err) => {
  console.error("Error generating brand assets:", err);
  process.exit(1);
});
