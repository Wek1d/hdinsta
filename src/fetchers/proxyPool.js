// Public CORS proxy havuzu. Proxy eklemek/çıkarmak için POOL dizisini düzenle.
// Her giriş: hedef URL -> proxy'li URL. Sırayla denenir, biri çalışınca durur.
const KEY = 'hdinsta.proxy';
export const getManual = () => localStorage.getItem(KEY) || '';
export const setManual = (v) => (v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY));

const POOL = [
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://cors.eu.org/${u}`,
  (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
  (u) => `https://proxy.cors.sh/${u}`,
];

export function proxies() {
  const m = getManual();
  // Kullanıcının manuel proxy'si (6. katman) varsa en başa alınır.
  const manual = m ? [(u) => (m.includes('{url}') ? m.replace('{url}', encodeURIComponent(u)) : m + u)] : [];
  return [...manual, ...POOL];
}

export async function viaProxy(url, { as = 'text', timeout = 12000 } = {}) {
  let last;
  for (const p of proxies()) {
    const target = p(url);
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), timeout);
      const r = await fetch(target, { signal: c.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const v = await r[as]();
      if (as === 'text' && v.length < 50) throw new Error('boş yanıt');
      return v;
    } catch (e) {
      last = e;
      console.warn('[proxy] başarısız:', target, e.message);
    }
  }
  throw last || new Error('tüm proxyler başarısız');
}
