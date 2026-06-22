// Генерує полегшені, адаптивні версії картинок із майстрів у assets/img/_originals.
// Для кожного зображення створює кілька розмірів у WebP (легкий формат) +
// JPEG-фолбек. HTML підключає їх через <picture> + srcset/sizes, тож браузер
// сам обирає потрібний розмір під ширину екрана та щільність пікселів.
//
// Запуск:  npm run optimize:images

import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.resolve(__dirname, "../assets/img");
const SRC_DIR = path.join(IMG_DIR, "_originals");

// Набори ширин (px) під кожен тип зображення — від найменшої (мобілка)
// до найбільшої (десктоп / retina). Ширини більші за оригінал пропускаються.
// WebP генерується для всіх ширин (його розуміють усі сучасні браузери),
// а важчий JPEG — лише в одній ширині (fallback) як <img src> для древніх браузерів.
const GROUPS = [
  { match: /^hero\b/,   widths: [480, 768, 1035],       fallback: 768, webpQuality: 78 },
  { match: /^about\b/,  widths: [480, 768, 1080],       fallback: 768, webpQuality: 76 },
  { match: /^footer\b/, widths: [160, 320, 480],        fallback: 320, webpQuality: 80 },
  { match: /^edu-/,     widths: [400, 700, 1000, 1300], fallback: 700, webpQuality: 80 },
  { match: /^review-/,  widths: [480, 800, 1284],       fallback: 800, webpQuality: 80 },
];

const JPEG_QUALITY = 80;

function groupFor(name) {
  return GROUPS.find((g) => g.match.test(name));
}

async function run() {
  if (!existsSync(SRC_DIR)) {
    console.error(`Не знайдено теку з оригіналами: ${SRC_DIR}`);
    process.exit(1);
  }
  await mkdir(IMG_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  let generated = 0;

  for (const file of files) {
    const group = groupFor(file);
    if (!group) {
      console.log(`пропущено (немає групи): ${file}`);
      continue;
    }

    const srcPath = path.join(SRC_DIR, file);
    const base = file.replace(/\.[^.]+$/, "");
    const meta = await sharp(srcPath).metadata();
    const maxW = meta.width ?? Infinity;

    // Ширини, що не перевищують оригінал; гарантуємо хоча б один (capped) розмір.
    let widths = group.widths.filter((w) => w <= maxW);
    if (widths.length === 0) widths = [Math.min(group.widths[0], maxW)];
    if (!widths.includes(Math.min(maxW, group.widths.at(-1)))) {
      const capped = Math.min(maxW, group.widths.at(-1));
      if (!group.widths.some((w) => w <= maxW && w >= capped)) widths.push(capped);
    }

    const fallbackW = Math.min(group.fallback, maxW, widths.at(-1));

    for (const w of widths) {
      const pipeline = sharp(srcPath).resize({ width: w, withoutEnlargement: true });

      await pipeline
        .clone()
        .webp({ quality: group.webpQuality })
        .toFile(path.join(IMG_DIR, `${base}-${w}.webp`));
      generated += 1;

      if (w === fallbackW) {
        await pipeline
          .clone()
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
          .toFile(path.join(IMG_DIR, `${base}-${w}.jpg`));
        generated += 1;
      }
    }
    console.log(`✓ ${file} → webp[${widths.join(", ")}] + jpg[${fallbackW}]`);
  }

  console.log(`\nГотово. Згенеровано файлів: ${generated}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
