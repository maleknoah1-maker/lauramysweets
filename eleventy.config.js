import Image from "@11ty/eleventy-img";
import path from "node:path";

const PLACEHOLDER = /\[\[PLACEHOLDER:[^\]]*\]\]/;

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// CMS stores "/images/originals/x.webp"; the file lives in src/.
const sourcePath = (src) => path.join("src", src.replace(/^\//, ""));

async function imageHtml(src, alt, sizes = "100vw", attrs = {}) {
  if (!alt) throw new Error(`Missing alt text for ${src}`);
  const metadata = await Image(sourcePath(src), {
    widths: [360, 720, 1200],
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

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/favicons": "/" });

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
      widths: [360, 720, 1200],
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
