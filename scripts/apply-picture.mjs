// Одноразовий трансформер index.html: замінює <img src="assets/img/NAME.jpg" ...>
// на адаптивний <picture> з WebP-srcset по брейкпойнтах + JPEG-фолбек.
// Безпечний до повторного запуску: працює лише з «голими» іменами (NAME.jpg),
// яких після першого прогону вже немає (залишаються лише NAME-{w}.jpg/webp).
//
// Запуск:  node scripts/apply-picture.mjs

import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMG_DIR = path.join(ROOT, "assets/img");
const HTML = path.join(ROOT, "index.html");

const GROUPS = [
  { match: /^hero$/,        fallback: 768, sizes: "100vw" },
  { match: /^about$/,       fallback: 768, sizes: "(min-width: 768px) 540px, 92vw" },
  { match: /^footer$/,      fallback: 320, sizes: "160px" },
  { match: /^edu-\d+$/,     fallback: 700, sizes: "(min-width: 1024px) 480px, (min-width: 768px) 60vw, 90vw" },
  { match: /^review-\d+$/,  fallback: 800, sizes: "(min-width: 1024px) 460px, (min-width: 768px) 56vw, 88vw" },
];

function groupFor(base) {
  return GROUPS.find((g) => g.match.test(base));
}

const files = await readdir(IMG_DIR);

function webpWidthsFor(base) {
  const re = new RegExp(`^${base.replace(/[-]/g, "\\-")}-(\\d+)\\.webp$`);
  return files
    .map((f) => f.match(re))
    .filter(Boolean)
    .map((m) => Number(m[1]))
    .sort((a, b) => a - b);
}

// Парсимо атрибути img у key->value (значення в подвійних лапках).
function parseAttrs(tag) {
  const attrs = {};
  const re = /([a-zA-Z][\w:-]*)(?:="([^"]*)")?/g;
  let m;
  // пропускаємо лідируючий "img"
  const body = tag.replace(/^<img\s*/i, "").replace(/\/?>$/, "");
  while ((m = re.exec(body))) {
    if (!m[1]) continue;
    attrs[m[1].toLowerCase()] = m[2] ?? "";
  }
  return attrs;
}

let html = await readFile(HTML, "utf8");
let count = 0;

html = html.replace(/<img\b[^>]*>/g, (tag) => {
  const attrs = parseAttrs(tag);
  const src = attrs.src || "";
  const m = src.match(/^assets\/img\/([\w-]+)\.jpe?g$/);
  if (!m) return tag; // не наша картинка (фавікони, вже трансформовані тощо)
  const base = m[1];
  const group = groupFor(base);
  if (!group) return tag;

  const widths = webpWidthsFor(base);
  if (widths.length === 0) return tag;

  const fallbackW = Math.min(group.fallback, widths.at(-1));
  const indent = "  ".repeat(6);

  const webpSrcset = widths.map((w) => `assets/img/${base}-${w}.webp ${w}w`).join(", ");

  // Перебудовуємо <img>: міняємо src на jpg-фолбек, додаємо sizes; решта атрибутів — як були.
  attrs.src = `assets/img/${base}-${fallbackW}.jpg`;
  attrs.sizes = group.sizes;

  // Порядок атрибутів: src, srcset(немає в img — webp у source), sizes, потім решта.
  const ORDER = ["src", "sizes", "alt", "width", "height", "class", "loading", "fetchpriority", "decoding"];
  const keys = [
    ...ORDER.filter((k) => k in attrs),
    ...Object.keys(attrs).filter((k) => !ORDER.includes(k)),
  ];
  const imgAttrs = keys
    .map((k) => (attrs[k] === "" ? k : `${k}="${attrs[k]}"`))
    .join(" ");

  count += 1;
  return (
    `<picture>\n` +
    `${indent}  <source type="image/webp" srcset="${webpSrcset}" sizes="${group.sizes}">\n` +
    `${indent}  <img ${imgAttrs}>\n` +
    `${indent}</picture>`
  );
});

await writeFile(HTML, html, "utf8");
console.log(`Трансформовано <img> → <picture>: ${count}`);
