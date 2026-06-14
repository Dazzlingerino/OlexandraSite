# Олександра Кривонос — сайт-візитівка

Mobile-first лендінг для психолога. Чистий HTML5, CSS3, Vanilla JS — готовий до безкоштовного хостингу на GitHub Pages.

## Структура

```
index.html      — розмітка сторінки
style.css       — стилі (Mobile-First)
script.js       — логіка (меню, каруселі, анімації)
assets/img/     — оптимізовані зображення для вебу
```

## Локальний перегляд

```bash
python3 -m http.server 8080
```

Відкрийте http://localhost:8080

## Деплой на GitHub Pages

1. Створіть репозиторій на GitHub
2. Завантажте файли:
   ```bash
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. У Settings → Pages → Source: **Deploy from branch** → `main` → `/ (root)`
4. Сайт буде доступний за адресою `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## Заміна посилань на соцмережі

У `index.html` знайдіть плейсхолдери (клас `social-icon--placeholder`) та замініть `href`:

- Instagram: `https://instagram.com/YOUR_USERNAME`
- TikTok: `https://tiktok.com/@YOUR_USERNAME`
- Threads: `https://threads.net/@YOUR_USERNAME`

Telegram вже активний: `https://t.me/sasha_krvns`

## Заміна фото

Оригінали зберігаються в `my_photos/`, `documents/`, `my_feedbacks/`.
Веб-копії — в `assets/img/`. Щоб оновити:

```bash
sips -Z 1600 my_photos/3.jpeg --out assets/img/hero.jpg
sips -Z 1600 my_photos/2.jpeg --out assets/img/about.jpg
```
