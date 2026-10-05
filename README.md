# hdinsta
Tamamen tarayıcıda çalışan Instagram medya indirici. Backend yok, analytics yok.

## Kurulum
```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)
1. `git init && git add . && git commit -m "init"`
2. `git remote add origin https://github.com/Wek1d/hdinsta.git && git push -u origin main`
3. Repo → Settings → Pages → Source: **GitHub Actions**.
4. Her `main` push'unda `.github/workflows/deploy.yml` siteyi yayınlar: https://wek1d.github.io/hdinsta/

## Fallback zinciri
`src/fetchers/index.js` içindeki `CHAIN` dizisi sırayı belirler (gönderi: graphql → embed → mirror, profil: `__a=1` → mirror).
- Proxy ekle/çıkar: `src/fetchers/proxyPool.js` → `POOL`
- Mirror ekle/çıkar: `src/fetchers/mirror.js` → `POST_MIRRORS` / `USER_MIRRORS`
- Hepsi düşerse UI manuel proxy alanı açar; değer localStorage'da `hdinsta.proxy` anahtarında saklanır. `{url}` yer tutucusu kodlanmış hedef URL ile değişir.
- Loglar sadece console'da (`[chain]`, `[proxy]`, `[mirror]`).
