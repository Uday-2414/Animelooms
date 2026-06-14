async function test() {
  try {
    const res = await fetch('https://api.jikan.moe/v4/anime/52991/full');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Title:', data.data?.title_english || data.data?.title);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
