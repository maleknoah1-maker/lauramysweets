import Image from "@11ty/eleventy-img";
import path from "node:path";
import { buildSchema } from "./src/_config/schema.js";

const PLACEHOLDER = /\[\[PLACEHOLDER:[^\]]*\]\]/;

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// CMS stores "/images/originals/x.webp"; the file lives in src/.
const sourcePath = (src) => path.join("src", src.replace(/^\//, ""));

async function imageHtml(src, alt, sizes = "100vw", attrs = {}) {
  if (!alt) throw new Error(`Missing alt text for ${src}`);
  const metadata = await Image(sourcePath(src), {
    widths: [360, 540, 720, 1200, "auto"],
    formats: ["webp"],
    outputDir: "_site/img/",
    urlPath: "/img/",
  });
  const { eager, ...rest } = attrs;
  return Image.generateHTML(metadata, {
    alt,
    sizes,
    loading: eager ? "eager" : "lazy",
    decoding: eager ? "sync" : "async",
    ...(eager ? { fetchpriority: "high" } : {}),
    ...rest,
  });
}

// Sprinkles in the side margins only, never behind text. Same seed, same layout on every build.
function sprinkleHtml(seed = "s", count = 8, opts = {}) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const colors = ["md", "bl", "ro", "md", "ro"];
  const top = opts.top ?? 4;
  const bottom = opts.bottom ?? 96;
  const spans = [];
  for (let i = 0; i < count; i++) {
    const side = i % 2 ? "right" : "left";
    const y = (top + ((bottom - top) * (i + rand() * 0.9)) / count).toFixed(1);
    const dot = rand() < 0.2;
    const shape = dot ? "d" : rand() < 0.3 ? "p s" : "p";
    const c = colors[Math.floor(rand() * colors.length)];
    // Wide screens: anywhere in the margin outside the 1200px content column.
    const f = (0.12 + rand() * 0.6).toFixed(2);
    const rot = Math.round(rand() * 150 - 75);
    spans.push(
      `<span class="${shape} ${c} wide" style="${side}:calc((100% - 1200px) / 2 * ${f});top:${y}%${dot ? "" : `;transform:rotate(${rot}deg)`}"></span>`
    );
    // Narrow screens: hugging the edge, tilted gently so it stays inside the 16px gutter.
    if (i < (opts.narrow ?? Math.ceil(count * 0.6))) {
      const nRot = Math.round(rand() * 24 - 12);
      spans.push(
        `<span class="${shape} ${c} narrow" style="${side}:${(1 + rand() * 3).toFixed(0)}px;top:${y}%${dot ? "" : `;transform:rotate(${nRot}deg)`}"></span>`
      );
    }
  }
  return `<div class="sprinkles" aria-hidden="true">${spans.join("")}</div>`;
}

export default function (eleventyConfig) {
  eleventyConfig.addShortcode("sprinkles", sprinkleHtml);
  eleventyConfig.addShortcode("schema", function () {
    return buildSchema(this.ctx);
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicons": "/" });
  // Originals stay reachable at the paths the CMS writes (used in structured data).
  eleventyConfig.addPassthroughCopy({ "src/images/originals": "images/originals" });

  // Self-hosted fonts, Latin subset only.
  const fonts = {
    "dm-serif-display/files/dm-serif-display-latin-400-normal.woff2": "dm-serif-display-400.woff2",
    "dm-serif-display/files/dm-serif-display-latin-400-italic.woff2": "dm-serif-display-400-italic.woff2",
    "nunito-sans/files/nunito-sans-latin-400-normal.woff2": "nunito-sans-400.woff2",
    "nunito-sans/files/nunito-sans-latin-600-normal.woff2": "nunito-sans-600.woff2",
    "nunito-sans/files/nunito-sans-latin-700-normal.woff2": "nunito-sans-700.woff2",
    "allura/files/allura-latin-400-normal.woff2": "allura-400.woff2",
  };
  for (const [from, to] of Object.entries(fonts)) {
    eleventyConfig.addPassthroughCopy({ [`node_modules/@fontsource/${from}`]: `assets/fonts/${to}` });
  }

  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addAsyncShortcode("image", imageHtml);

  // URL of a single size, for preloads and social images.
  eleventyConfig.addAsyncShortcode("imageUrl", async (src, width = 720) => {
    const metadata = await Image(sourcePath(src), {
      widths: [360, 540, 720, 1200, "auto"],
      formats: ["webp"],
      outputDir: "_site/img/",
      urlPath: "/img/",
    });
    const sizes = metadata.webp;
    return (sizes.find((s) => s.width >= width) || sizes[sizes.length - 1]).url;
  });

  // Shows any [[PLACEHOLDER: ...]] as a highlighted mark so none slip through unnoticed.
  eleventyConfig.addFilter("ph", (value) => {
    if (value == null) return "";
    return escapeHtml(value).replace(/\[\[PLACEHOLDER:[^\]]*\]\]/g, (m) => `<mark class="ph">${m}</mark>`);
  });
  eleventyConfig.addFilter("isPlaceholder", (value) => PLACEHOLDER.test(String(value ?? "")));

  eleventyConfig.addFilter("money", (n) => {
    if (typeof n !== "number") return n;
    return "$" + (Number.isInteger(n) ? n : n.toFixed(2));
  });

  eleventyConfig.addFilter("where", (arr, key, value) => (arr || []).filter((x) => x[key] === value));

  eleventyConfig.addFilter("seasonalByStatus", (pages, status) =>
    (pages || []).filter((p) => (p.data.status || "off-season") === status).sort((a, b) => a.data.title.localeCompare(b.data.title))
  );

  // When a holiday page is "on", the Holiday nav item becomes a menu that lists it.
  eleventyConfig.addFilter("withHoliday", (items, seasonal) => {
    const on = (seasonal || []).filter((p) => p.data.status === "on");
    if (!on.length) return items;
    return items.map((item) =>
      item.url === "/holiday/"
        ? { label: item.label, children: [...on.map((p) => ({ label: `${p.data.title} pre-orders`, url: p.url })), { label: "All holiday treats", url: "/holiday/" }] }
        : item
    );
  });

  // Plain-text outputs (llms.txt, robots.txt) shouldn't carry HTML entities.
  eleventyConfig.addTransform("plainText", function (content) {
    if (!(this.page.outputPath || "").endsWith(".txt")) return content;
    return content
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\n{3,}/g, "\n\n");
  });

  // Indexable pages only: no noindex pages, redirect stubs or the 404.
  eleventyConfig.addFilter("sitemapPages", (all) =>
    all
      .filter((p) => p.url && p.url.endsWith("/") && !p.data.noindex && !p.data.redirectTo)
      .sort((a, b) => a.url.localeCompare(b.url))
  );

  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("longDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );

  eleventyConfig.addFilter("rating", (n) => Number(n).toFixed(1));

  eleventyConfig.addFilter("faqsFor", (faqs, page) => faqs.filter((f) => (f.pages || []).includes(page)));

  eleventyConfig.addFilter("digits", (s) => String(s).replace(/\D/g, ""));

  eleventyConfig.addGlobalData("build", { version: Date.now().toString(36), year: new Date().getFullYear() });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
