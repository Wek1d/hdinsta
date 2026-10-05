// Katman 4: mirror siteler. Çalışmayan site için diziden satırı sil, yenisini ekle.
import { viaProxy } from './proxyPool.js';
const og = (h, p) => (h.match(new RegExp(`<meta[^>]+property="og:${p}"[^>]+content="([^"]+)"`)) || [])[1]?.replace(/&amp;/g, '&');

const POST_MIRRORS = [
  (sc) => `https://d.ddinstagram.com/p/${sc}`,
  (sc) => `https://www.ddinstagram.com/p/${sc}`,
];
// Profil mirror'ları: [url, görsel regex'i]
const USER_MIRRORS = [
  [(u) => `https://www.picuki.com/profile/${u}`, /<img[^>]+class="post-image"[^>]+src="([^"]+)"/g],
  [(u) => `https://imginn.com/${u}/`, /<img[^>]+(?:data-)?src="(https:\/\/[^"]*cdninstagram[^"]*)"/g],
];

export async function mirrorPost(sc) {
  for (const m of POST_MIRRORS) {
    try {
      const h = await viaProxy(m(sc));
      const v = og(h, 'video'), i = og(h, 'image');
      if (v) return [{ type: 'video', url: v }];
      if (i) return [{ type: 'image', url: i }];
    } catch (e) { console.warn('[mirror]', e.message); }
  }
  return [];
}

export async function mirrorProfile(user) {
  for (const [mk, re] of USER_MIRRORS) {
    try {
      const h = await viaProxy(mk(user));
      const urls = [...new Set([...h.matchAll(re)].map((m) => m[1].replace(/&amp;/g, '&')))];
      if (urls.length) return urls.slice(0, 12).map((url) => ({ type: 'image', url }));
    } catch (e) { console.warn('[mirror]', e.message); }
  }
  return [];
}
