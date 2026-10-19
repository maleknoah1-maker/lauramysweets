// Builds the favicon set, a square logo and the default social sharing image.
// Run once (or after replacing the logo): node tools/make-icons.mjs
// [[PLACEHOLDER: swap src/favicons/favicon.svg for Laura's real logo, then re-run]]
import fs from "node:fs";
import sharp from "sharp";

const out = "src/favicons";
const svg = fs.readFileSync(`${out}/favicon.svg`);

const pngs = {};
for (const size of [16, 32, 48, 180, 192, 512]) {
  pngs[size] = await sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();
}
fs.writeFileSync(`${out}/favicon-32.png`, pngs[32]);
fs.writeFileSync(`${out}/apple-touch-icon.png`, pngs[180]);
fs.writeFileSync(`${out}/icon-192.png`, pngs[192]);
fs.writeFileSync(`${out}/icon-512.png`, pngs[512]);
fs.writeFileSync(`${out}/logo.png`, pngs[512]);

// favicon.ico holding 16, 32 and 48 px PNGs
const sizes = [16, 32, 48];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = [];
for (const s of sizes) {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[s].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[s].length;
  entries.push(e);
}
fs.writeFileSync(`${out}/favicon.ico`, Buffer.concat([header, ...entries, ...sizes.map((s) => pngs[s])]));

fs.writeFileSync(
  `${out}/site.webmanifest`,
  JSON.stringify(
    {
      name: "Laura, My Sweets",
      short_name: "Laura, My Sweets",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: "#FBF7F4",
      background_color: "#FBF7F4",
      display: "browser",
    },
    null,
    2
  ) + "\n"
);

// Social sharing image, 1200x630: the painted-flower cake on the cream background.
const cake = await sharp("src/images/originals/three-tier-painted-flower-cake.webp")
  .resize({ height: 590, fit: "inside" })
  .toBuffer();
const meta = await sharp(cake).metadata();
const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#FBF7F4"/>
  <circle cx="1010" cy="560" r="230" fill="#C2EAE2"/>
  <circle cx="160" cy="80" r="150" fill="#F4E6E8"/>
  <text x="70" y="250" font-family="Georgia, serif" font-size="66" fill="#292325">Laura, My Sweets</text>
  <text x="72" y="320" font-family="Georgia, serif" font-style="italic" font-size="36" fill="#A8737C">Custom cakes, made from scratch.</text>
  <text x="72" y="380" font-family="Arial, sans-serif" font-size="28" fill="#403637">Coopersburg, PA · Lehigh Valley</text>
</svg>`);
await sharp(label)
  .composite([{ input: cake, left: 1200 - meta.width - 70, top: Math.round((630 - meta.height) / 2) }])
  .jpeg({ quality: 86 })
  .toFile("src/assets/og-image.jpg");

console.log("icons, logo, manifest and og-image.jpg written");
