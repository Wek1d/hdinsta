import { getManual, setManual } from '../fetchers/proxyPool.js';
export function bindInput(onSubmit, onProxy) {
  const q = document.getElementById('q');
  document.getElementById('form').onsubmit = (e) => { e.preventDefault(); onSubmit(q.value); };
  const pin = document.getElementById('pin'); pin.value = getManual();
  document.getElementById('pform').onsubmit = (e) => { e.preventDefault(); setManual(pin.value.trim()); onProxy(q.value); };
  q.addEventListener('paste', () => setTimeout(() => q.value.includes('instagram.com') && onSubmit(q.value), 0));
}
