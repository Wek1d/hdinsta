import './styles.css';
import { fetchMedia } from './fetchers/index.js';
import { bindInput } from './ui/input.js';
import { render, saveAll } from './ui/cards.js';
import { toast } from './ui/toast.js';

const $ = (id) => document.getElementById(id);
let current;

const root = document.documentElement;
root.dataset.theme = localStorage.getItem('hdinsta.theme') || 'dark';
$('theme').onclick = () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('hdinsta.theme', root.dataset.theme);
};

async function run(value) {
  if (!value.trim()) return;
  $('status').textContent = 'yükleniyor...';
  $('proxybox').hidden = true; $('bar').hidden = true; $('grid').innerHTML = '';
  try {
    current = await fetchMedia(value);
    render($('grid'), current);
    $('count').textContent = `${current.items.length} medya`;
    $('bar').hidden = current.items.length < 2;
    $('status').textContent = '';
  } catch (e) {
    $('status').textContent = '';
    if (e.message === 'NEED_PROXY') $('proxybox').hidden = false;
    else toast(e.message);
  }
}

bindInput(run, run);
$('all').onclick = () => current && saveAll(current.items, current.id);
