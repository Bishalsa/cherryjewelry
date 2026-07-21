import sharp from "sharp";
import fs from "fs";
import path from "path";

const srcPath = "C:\\Users\\bisha\\.gemini\\antigravity-ide\\brain\\18f1e36e-c295-4f3d-a830-1ef31b4350bd\\media__1784668171193.jpg";
const publicDir = "c:\\Users\\bisha\\OneDrive\\Desktop\\jewellery\\public";
const appDir = "c:\\Users\\bisha\\OneDrive\\Desktop\\jewellery\\src\\app";

function createIcoFromPngs(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const directorySize = 16 * numImages;
  
  let currentOffset = headerSize + directorySize;
  const dirEntries = [];

  for (const item of pngBuffers) {
    const dataSize = item.buffer.length;
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp (32-bit RGBA)
    entry.writeUInt32LE(dataSize, 8);
    entry.writeUInt32LE(currentOffset, 12);
    
    dirEntries.push(entry);
    currentOffset += dataSize;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type 1 = ICO
  header.writeUInt16LE(numImages, 4);

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

async function buildRealIco() {
  const metadata = await sharp(srcPath).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  const cropLeft = Math.round(width * 0.22);
  const cropTop = Math.round(height * 0.12);
  const cropWidth = Math.round(width * 0.56);
  const cropHeight = Math.round(height * 0.54);

  // Extract emblem and ensure RGBA 32-bit format for Turbopack compatibility
  const emblemBuffer = await sharp(srcPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .ensureAlpha()
    .png()
    .toBuffer();

  const buf16 = await sharp(emblemBuffer)
    .resize(16, 16, { fit: "contain" })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();

  const buf32 = await sharp(emblemBuffer)
    .resize(32, 32, { fit: "contain" })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();

  const buf48 = await sharp(emblemBuffer)
    .resize(48, 48, { fit: "contain" })
    .ensureAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();

  const icoBuffer = createIcoFromPngs([
    { width: 16, height: 16, buffer: buf16 },
    { width: 32, height: 32, buffer: buf32 },
    { width: 48, height: 48, buffer: buf48 },
  ]);

  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(appDir, "favicon.ico"), icoBuffer);

  console.log(`Created RGBA ICO file (${icoBuffer.length} bytes) for Turbopack & Next.js 16!`);
}

buildRealIco().catch(err => {
  console.error("Error building real ICO:", err);
  process.exit(1);
});
