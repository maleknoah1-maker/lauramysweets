# lauramysweets.com

Website for **Laura, My Sweets**, a licensed and insured custom cake home bakery in Coopersburg, PA. Static site built with [Eleventy](https://www.11ty.dev/) 3, hosted on GitHub Pages, and edited by Laura through [Pages CMS](https://pagescms.org).

- **Laura:** see [EDITING-GUIDE.md](EDITING-GUIDE.md)
- **Going live:** see [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md)
- **Missing info:** see [PLACEHOLDERS.md](PLACEHOLDERS.md)

## Working on it

```bash
npm install
npm start          # dev server at http://localhost:8080 with live reload
npm run build      # builds into _site/
node tools/check-site.mjs      # schema, titles, descriptions, alt text, em dashes
node tools/serve.mjs 8090      # serves _site the way GitHub Pages does (for Lighthouse)
node tools/screenshot.mjs /menu/ menu-390 390    # screenshot through headless Edge
node tools/make-icons.mjs      # rebuild favicons, logo and share image from src/favicons/favicon.svg
```

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and deploys to Pages. Pages CMS saves also commit to `main`.

## How it's organized

- `src/_data/*.json`: every editable fact and price. Templates never hard-code a price.
  - `settings.json`: business info · `booking.json`: blocked dates · `banner.json`: announcement bar
  - `menu.json` · `flavors.json` · `quickOrder.json` · `classes.json` · `gallery.json` · `reviews.json` · `faqs.json`
  - `site.json`: domain, Formspree IDs, GA4 ID (not in the dashboard)
  - `computed.js`: derived values (lowest prices, cutoff schedule, phone link)
- `src/seasonal/*.md`: holiday pages (Pages CMS collection), live at `/holiday/<slug>/`
- `src/pages/`, `src/blog/`, `src/index.njk`: pages
- `src/_includes/`: layouts (`base`, `page`, `service`, `seasonal`, `post`) and partials
- `src/_config/schema.js`: JSON-LD built from the data files
- `.pages.yml`: the Pages CMS dashboard. Each section edits one whole file and defines every key in it, so a save can't drop values.

## Rules for content

- Never invent facts, reviews, prices or policies. Unknowns are `[[PLACEHOLDER: ...]]`, shown highlighted on the site and listed in PLACEHOLDERS.md.
- No em dashes in customer-facing copy.
- Never publish the street address.
