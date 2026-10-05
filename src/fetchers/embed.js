// Katman 2: /embed/captioned/ HTML'ini parse et; medya URL'leri JSON içinde gömülü gelir.
import { viaProxy } from './proxyPool.js';
const un = (s) => { try { return JSON.parse(`"${s}"`); } catch { return s; } };

export async function embedPost(sc) {
  const h = await viaProxy(`https://www.instagram.com/p/${sc}/embed/captioned/`);
  const v = h.match(/"video_url":"([^"]+)"/);
  if (v) return [{ type: 'video', url: un(v[1]) }];
  const urls = new Set([...h.matchAll(/"display_url":"([^"]+)"/g)].map((m) => un(m[1])));
  if (!urls.size) {
    const m = h.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/);
    if (m) urls.add(m[1].replace(/&amp;/g, '&'));
  }
  return [...urls].map((url) => ({ type: 'image', url }));
}
