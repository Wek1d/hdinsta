import { viaProxy } from '../fetchers/proxyPool.js';
import { toast } from './toast.js';

// Blob -> a.download. Önce doğrudan, olmazsa proxy üzerinden; ikisi de olmazsa yeni sekmede açar.
export async function save(url, name) {
  let blob;
  try {
    const r = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!r.ok) throw 0;
    blob = await r.blob();
  } catch {
    try { blob = await viaProxy(url, { as: 'blob', timeout: 30000 }); }
    catch { window.open(url, '_blank', 'noopener'); throw new Error('İndirme doğrudan açıldı'); }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

const fname = (it, i, id) => `hdinsta_${id}_${i + 1}.${it.type === 'video' ? 'mp4' : 'jpg'}`;

export function render(grid, { items, id }) {
  grid.innerHTML = '';
  items.forEach((it, i) => {
    const c = document.createElement('article');
    const m = document.createElement(it.type === 'video' ? 'video' : 'img');
    m.src = it.url; m.referrerPolicy = 'no-referrer';
    if (it.type === 'video') { m.muted = true; m.preload = 'metadata'; m.controls = true; }
    const meta = document.createElement('div');
    const dim = it.width ? `${it.width}×${it.height}` : 'orijinal';
    meta.innerHTML = `<span>${it.type === 'video' ? '▶ video' : '▣ foto'} · ${dim}</span>`;
    const b = document.createElement('button'); b.textContent = 'İndir';
    b.onclick = () => save(it.url, fname(it, i, id)).catch((e) => toast(e.message));
    meta.append(b); c.append(m, meta); grid.append(c);
  });
}

// Sıralı toplu indirme (aynı anda tek dosya).
export async function saveAll(items, id) {
  for (let i = 0; i < items.length; i++) {
    try { await save(items[i].url, fname(items[i], i, id)); } catch (e) { toast(e.message); }
    await new Promise((r) => setTimeout(r, 400));
  }
}
