import sharp from 'sharp';

async function inspectFavicons() {
  const urls = [
    'https://jewellery-iota-olive.vercel.app/favicon.ico',
    'https://jewellery-iota-olive.vercel.app/favicon-32x32.png',
    'https://jewellery-iota-olive.vercel.app/logo-emblem.png'
  ];

  for (const url of urls) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    console.log(`URL: ${url}`);
    console.log(`Size: ${buf.length} bytes`);
    try {
      const meta = await sharp(buf).metadata();
      console.log(`Dimensions: ${meta.width}x${meta.height}, Format: ${meta.format}`);
    } catch (e) {
      console.log('Sharp error:', e.message);
    }
    console.log('---');
  }
}

inspectFavicons();
