# LoveMyA — подарок для Telegram Mini App ♥

## Настройка текста

Всё в `js/config.js`:
- `yourName` — подпись
- `galleryTitle` — заголовок галереи
- `letterTexts` — варианты открытки (случайный)
- `photos` — пути и подписи к фото

**После правок** увеличь число в `js/config-loader.js` → `CACHE_BUST` (сейчас `7`), иначе браузер может показать старый текст.

## GitHub Pages

1. Создай репозиторий **LoveMyA** на [github.com/new](https://github.com/new)
2. В папке проекта:

```bash
git remote add origin https://github.com/ТВОЙ_НИК/LoveMyA.git
git branch -M main
git push -u origin main
```

3. GitHub → репозиторий → **Settings** → **Pages**
4. Source: **Deploy from a branch** → branch **main** → folder **/ (root)** → Save
5. Через 1–2 минуты сайт: `https://ТВОЙ_НИК.github.io/LoveMyA/`

## Telegram Mini App

1. Открой [@BotFather](https://t.me/BotFather)
2. `/newbot` — создай бота (если ещё нет)
3. `/newapp` — выбери бота
4. Название и описание — любые
5. **Photo** — по желанию
6. **Web App URL**: `https://ТВОЙ_НИК.github.io/LoveMyA/`
7. Short name — латиницей, например `lovemya`
8. Готово — открой апп через меню бота или ссылку `https://t.me/ИМЯ_БОТА/lovemya`

## Фото

Положи файлы в `photos/` (01.jpg … 05.jpg) и сделай `git push` снова.

## Локально

```bash
npx serve . -p 3456
```

Открой http://localhost:3456 и обнови с **Ctrl+Shift+R**.
