// Checks the built site: JSON-LD validity and required fields (per Google's structured data
// rules), FAQPage questions match visible FAQs, no placeholders in schema, SEO tags, em dashes.
// Usage: npx @11ty/eleventy && node tools/check-site.mjs
import fs from "node:fs";
import path from "node:path";

const root = "_site";
const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".html")) files.push(p);
  }
})(root);

const problems = [];
const counts = {};
const need = (cond, file, msg) => { if (!cond) problems.push(`${file}: ${msg}`); };
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");

const titles = new Map();
for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const html = fs.readFileSync(file, "utf8");
  const isRedirect = /http-equiv="refresh"/.test(html);

  // SEO basics on real pages
  if (!isRedirect) {
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
    need(title, rel, "missing <title>");
    need(title.length <= 70, rel, `title is ${title.length} chars: ${title}`);
    if (titles.has(title)) problems.push(`${rel}: duplicate title with ${titles.get(title)}`);
    titles.set(title, rel);
    const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
    need(desc.length >= 70 && desc.length <= 170, rel, `description is ${desc.length} chars`);
    need((html.match(/<h1[\s>]/g) || []).length === 1, rel, "should have exactly one <h1>");
    need(/<link rel="canonical" href="https:\/\/lauramysweets\.com[^"]*"/.test(html), rel, "missing canonical");
    need(/property="og:image"/.test(html), rel, "missing og:image");
    const imgs = html.match(/<img [^>]*>/g) || [];
    for (const img of imgs) need(/ alt="[^"]{5,}"/.test(img), rel, `image without real alt text: ${img.slice(0, 80)}`);
    need(!/—/.test(text(html)), rel, "em dash in visible copy");
  }

  // Structured data
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const b of blocks) {
    let data;
    try { data = JSON.parse(b[1]); } catch (e) { problems.push(`${rel}: JSON-LD does not parse (${e.message})`); continue; }
    need(!/PLACEHOLDER/.test(b[1]), rel, "placeholder text inside JSON-LD");
    for (const n of data["@graph"] || [data]) {
      const t = n["@type"];
      counts[t] = (counts[t] || 0) + 1;
      if (t === "Bakery") {
        for (const k of ["name", "address", "telephone", "url", "image", "priceRange", "areaServed"]) need(n[k], rel, `Bakery missing ${k}`);
        need(n.address && n.address.addressLocality && n.address.postalCode && !n.address.streetAddress, rel, "Bakery address should be town + ZIP, no street");
      }
      if (t === "BreadcrumbList") {
        n.itemListElement.forEach((li, i) => need(li.position === i + 1 && li.name && /^https:\/\//.test(li.item), rel, `breadcrumb item ${i + 1} incomplete`));
      }
      if (t === "FAQPage") {
        const visible = text(html);
        for (const q of n.mainEntity) {
          need(q.name && q.acceptedAnswer && q.acceptedAnswer.text, rel, "FAQ question missing name or answer");
          need(visible.includes(q.name.replace(/&/g, "&amp;")) || visible.includes(q.name), rel, `FAQ in schema but not on page: ${q.name}`);
        }
      }
      if (t === "BlogPosting") {
        for (const k of ["headline", "image", "datePublished", "author", "publisher"]) need(n[k], rel, `BlogPosting missing ${k}`);
        need(n.headline.length <= 110, rel, "BlogPosting headline over 110 chars");
      }
      if (t === "Event") for (const k of ["name", "startDate", "location"]) need(n[k], rel, `Event missing ${k}`);
      if (t === "Service") need(n.provider && n.hasOfferCatalog, rel, "Service missing provider or offers");
      // every Offer anywhere has a price and currency
      JSON.stringify(n, (k, v) => {
        if (v && v["@type"] === "Offer") {
          need(v.priceCurrency === "USD", rel, `Offer without USD currency: ${v.name}`);
          need(typeof v.price === "number" || (v.priceSpecification && typeof v.priceSpecification.minPrice === "number"), rel, `Offer without a numeric price: ${v.name}`);
        }
        return v;
      });
    }
  }
}

console.log(`Checked ${files.length} HTML files. Schema nodes:`, counts);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(" - " + p);
  process.exit(1);
} else {
  console.log("No problems found.");
}
