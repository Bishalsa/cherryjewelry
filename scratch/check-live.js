async function checkLive() {
  try {
    const iconRes = await fetch('https://jewellery-iota-olive.vercel.app/favicon.ico');
    console.log('favicon.ico Status:', iconRes.status);
    console.log('favicon.ico Content-Type:', iconRes.headers.get('content-type'));
    console.log('favicon.ico Content-Length:', iconRes.headers.get('content-length'));

    const htmlRes = await fetch('https://jewellery-iota-olive.vercel.app/');
    const html = await htmlRes.text();
    const iconMatches = html.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*>/gi);
    console.log('\nIcon tags in HTML:\n', iconMatches);
  } catch (err) {
    console.error('Error fetching live site:', err);
  }
}

checkLive();
