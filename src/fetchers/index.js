// Fallback orkestratörü. Zincirden adım eklemek/çıkarmak için aşağıdaki dizileri düzenle.
// Her adım bir fonksiyon: id -> [{type,url,width?,height?}]. Boş dönerse ya da hata fırlatırsa sıradaki denenir.
// Proxy rotasyonu (katman 5) ve manuel proxy (katman 6) proxyPool.js içinde, her adımın altında çalışır.
import { graphqlPost, graphqlProfile } from './graphql.js';
import { embedPost } from './embed.js';
import { mirrorPost, mirrorProfile } from './mirror.js';

const CHAIN = {
  post: [['graphql', graphqlPost], ['embed', embedPost], ['mirror', mirrorPost]],
  user: [['profile', graphqlProfile], ['mirror', mirrorProfile]],
};

export function parse(s) {
  s = s.trim();
  const p = s.match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/([\w-]+)/i);
  if (p) return { kind: 'post', id: p[1] };
  const u = s.replace(/^@/, '').match(/^(?:https?:\/\/(?:www\.)?instagram\.com\/)?([\w.]{1,30})\/?(?:\?.*)?$/i);
  return u ? { kind: 'user', id: u[1] } : null;
}

export async function fetchMedia(input) {
  const t = parse(input);
  if (!t) throw new Error('Geçersiz giriş');
  for (const [name, fn] of CHAIN[t.kind]) {
    try {
      const items = await fn(t.id);
      if (items.length) { console.info('[chain] başarılı:', name); return { ...t, items }; }
      console.warn('[chain] boş:', name);
    } catch (e) { console.warn('[chain] hata:', name, e.message); }
  }
  throw new Error('NEED_PROXY');
}
