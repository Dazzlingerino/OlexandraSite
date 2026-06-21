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

## Посилання на соцмережі (активні)

- Telegram: `https://t.me/sasha_krvns`
- Instagram: `https://www.instagram.com/sasha_krvns`
- TikTok: `https://www.tiktok.com/@sasha_krvns`

## Заміна фото

Оригінали зберігаються в `my_photos/`, `documents/`, `my_feedbacks/` (не потрапляють у репозиторій — див. `.gitignore`).
Веб-копії — в `assets/img/`. Щоб оновити:

```bash
# Три фото експертки
sips -Z 1600 my_photos/3.jpeg --out assets/img/hero.jpg     # шапка / Hero
sips -Z 1600 my_photos/2.jpeg --out assets/img/about.jpg    # блок «Про мене» (друге фото, fade-in)
sips -Z 1200 my_photos/4.jpeg --out assets/img/footer.jpg   # підвал (третє фото)

# 10 сертифікатів каруселі (edu-1 … edu-10)
sips -Z 1300 "documents/<файл>.jpeg" --out assets/img/edu-1.jpg
```

## Відгуки

Відгуки оформлені як текстові картки (карусель) з нейтральними емодзі-аватарами —
без імен та фото клієнтів задля конфіденційності. Текст редагується безпосередньо
в `index.html` у блоці `#reviews`.
