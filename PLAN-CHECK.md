# Step 1 plan check: lauramysweets.com rebuild

Checked against current docs on 2026-10-18: Eleventy (stable v3.1.7; v4 is still alpha and renamed "Build Awesome"), Pages CMS configuration docs, GitHub Pages custom domain docs, Formspree plans.

---

## 1. Repo structure

```
lauramysweets/
├─ .github/workflows/deploy.yml     # build Eleventy, upload artifact, deploy to Pages on push to main
├─ .pages.yml                       # Pages CMS dashboard config
├─ eleventy.config.js               # ESM config, Nunjucks, image shortcode, filters, collections
├─ package.json                     # @11ty/eleventy ^3.1, @11ty/eleventy-img
├─ PLACEHOLDERS.md  EDITING-GUIDE.md  LAUNCH-CHECKLIST.md  README.md
└─ src/
   ├─ _data/
   │  ├─ settings.json  menu.json  flavors.json  quick-order.json
   │  ├─ classes.json   gallery.json  reviews.json  faqs.json
   │  ├─ redirects.json             # old Wix paths (mine, not in the dashboard)
   │  └─ computed.js                # derived values: lowest Quick Order price, "from" prices, etc.
   ├─ _includes/
   │  ├─ layouts/base.njk  page.njk  service.njk  post.njk  seasonal.njk
   │  ├─ partials/  header, footer, announcement, action-bar, breadcrumbs, faq, reviews,
   │  │             gallery-grid, price-table, how-it-works, cta, sprinkles
   │  └─ schema/    bakery, website, faqpage, breadcrumbs, service, blogposting, event
   ├─ assets/css/site.css  assets/js/site.js  assets/js/forms.js  assets/fonts/ (self-hosted subsets)
   ├─ images/originals/             # CMS uploads land here; eleventy-img outputs WebP 360/720/1200
   ├─ seasonal/thanksgiving.md      # Pages CMS collection
   ├─ blog/*.md                     # 4 posts
   ├─ pages/  index, birthday-cakes, smash-cakes, wedding-cakes, cupcakes-cake-pops,
   │          quick-order, menu, gallery, classes, holiday, order, about, faq,
   │          policies, privacy, 404, thanks
   ├─ redirects.njk                 # paginates redirects.json into stub pages
   ├─ sitemap.xml.njk  robots.txt.njk  llms.txt.njk
   └─ favicons/                     # 16/32/48/180/192/512 + site.webmanifest
```

## 2. `.pages.yml` outline

```yaml
media:
  input: src/images/originals
  output: /images/originals

settings:
  commit: { identity: user }        # commits show Laura's name

content:
  - { name: settings, label: Business info,           type: file, path: src/_data/settings.json, format: json }
  - { name: banner,   label: Announcement banner,     type: file, path: src/_data/settings.json, format: json }  # banner fields only
  - { name: menu,     label: Prices & menu,           type: file, path: src/_data/menu.json, format: json }
  - { name: flavors,  label: Flavors,                 type: file, path: src/_data/flavors.json, format: json }
  - { name: quick,    label: Quick Order cakes,       type: file, path: src/_data/quick-order.json, format: json }
  - { name: seasonal, label: Holiday & seasonal pages, type: collection, path: src/seasonal,
      format: yaml-frontmatter, filename: "{fields.slug}.md", operations: { delete: false } }
  - { name: classes,  label: Classes & camp,          type: file, path: src/_data/classes.json, format: json }
  - { name: gallery,  label: Gallery,                 type: file, path: src/_data/gallery.json, format: json, list: true }
  - { name: reviews,  label: Reviews,                 type: file, path: src/_data/reviews.json, format: json, list: true }
  - { name: faqs,     label: FAQs,                    type: file, path: src/_data/faqs.json, format: json, list: true }
```

Guard rails: `required: true` on every field the templates need, `type: number` for prices, `select` for category, size, status, season color and FAQ page placement, `boolean` for on/off switches, `date` for deadlines and blockouts, `pattern` on alt text (at least 15 characters) and the slug (lowercase letters and dashes). Seasonal pages cannot be deleted from the dashboard, only switched to off-season, which protects their URLs. Every field gets plain-English help text, for example "Price for the 6 inch size (numbers only)."

## 3. Data file schemas

Prices are numbers. "From" and "+" are display flags, so the page and the schema both read one value.

```jsonc
// settings.json
{ "name": "Laura, My Sweets", "owner": "Laura Malek", "since": 2009,
  "phone": "(484) 293-1329", "phoneE164": "+14842931329", "email": "lauramysweets@gmail.com",
  "city": "Coopersburg", "region": "PA", "zip": "18036",
  "serviceArea": ["Coopersburg", "Center Valley", ...19 towns],
  "hours": "[[PLACEHOLDER: hours]]", "payments": ["Check", "Debit card", "Amex", "Discover", "Mastercard", "Visa"],
  "pickup": true, "pickupWindows": ["9 to 11 AM", "4 to 6 PM"],
  "delivery": true, "deliveryNote": "[[PLACEHOLDER: delivery distance and fees]]",
  "fondantNote": "...", "leadTime": "...", "paymentTerms": "...", "replyTime": "...",
  "google": { "rating": 5.0, "count": 18, "reviewsUrl": "[[PLACEHOLDER]]", "profileUrl": "[[PLACEHOLDER]]" },
  "social": { "facebook": "https://facebook.com/lauramysweets", "instagram": "https://instagram.com/lauramysweets" },
  "banner": { "on": true, "text": "Thanksgiving pre-orders open soon.", "linkText": "Join the list", "link": "/holiday/thanksgiving/" },
  "blockouts": [ { "start": "2026-12-24", "end": "2026-12-26", "note": "Christmas" } ],
  "formspree": { "order": "[[PLACEHOLDER]]", "quick": "...", "classes": "...", "waitlist": "..." },
  "ga4": "[[PLACEHOLDER: GA4 measurement ID]]" }

// menu.json
{ "cakes":     [ { "size": "6 inch", "serves": 12, "price": 55, "plus": true }, ... ],
  "tieredNote": "Contact for sizing and pricing",
  "cupcakes":  { "minimum": "1 dozen per flavor", "items": [ { "name": "Basic icing swirl or sprinkles", "price": 33, "unit": "dozen", "from": false }, ... ] },
  "cakePops":  { "minimum": "...", "note": "Vanilla or chocolate, individually wrapped", "items": [ ... ] },
  "other":     [ { "name": "Dessert shooters", "price": 40, "unit": "dozen", "from": true, "minimum": "2 dozen per flavor" }, ... ] }
// Fondant toppers ($0.75 to $6 each) get "priceMax": 6

// flavors.json
{ "cake": [ { "name": "Marble", "cupcakes": false }, { "name": "Vanilla", "cupcakes": true }, ... ],
  "fillings": ["Strawberry", ...], "buttercreamFillings": ["Chocolate", ...],
  "rules": "Single-tier cakes get 1 cake flavor and 1 filling...", "shooters": ["Strawberry Cheesecake", ...] }

// quick-order.json
{ "noticeDays": 5, "cutoffTime": "11:00",
  "sizes": [ { "key": "6", "label": "6 inch", "serves": 12 }, { "key": "8", "label": "8 inch", "serves": 20 } ],
  "rules": ["Full payment at time of order...", "Designs are exactly as shown; colors can be changed."],
  "topper": { "name": "Happy Birthday topper", "price": 3 },
  "designs": [ { "name": "Textured Buttercream", "description": "...", "price6": 65, "price8": 95,
                 "photo": "...", "alt": "...", "available": true,
                 "flavorChoice": ["Vanilla", "Chocolate"], "fillingChoice": true, "accentColors": 2 }, ... ] }

// src/seasonal/thanksgiving.md (front matter)
{ "title": "Thanksgiving", "slug": "thanksgiving", "status": "off-season", "accent": "autumn",
  "intro": "...", "deadline": "2026-11-20", "pickupDates": ["..."],
  "items": [ { "name": "...", "description": "...", "price": 0, "photo": "...", "alt": "..." } ] }

// classes.json
{ "on": false, "description": "...", "ages": "...", "size": "...", "location": "...", "price": null,
  "sessions": [ { "title": "...", "date": "2027-07-12", "endDate": "...", "time": "...", "spots": 8, "status": "open|full|waitlist" } ] }

// gallery.json (list)
[ { "image": "/images/originals/three-tier-painted-flowers.jpg", "alt": "...", "category": "Wedding & Events", "featured": true } ]

// reviews.json (list, empty for now)
[ { "name": "", "date": "", "stars": 5, "text": "", "featured": false } ]

// faqs.json (list)
[ { "q": "...", "a": "...", "pages": ["home", "faq", "birthday-cakes"] } ]
```

## 4. What I'd change, and why

1. **Laura doesn't need a GitHub account.** Pages CMS now invites "collaborators" by email. They can edit content and media but can't touch `.pages.yml`. The repo lives under your GitHub account, you install the Pages CMS app on it, and you invite her email. That's easier for her and removes a launch step.
2. **Drop `aggregateRating` from the JSON-LD.** Google's review-snippet rules don't allow marking up ratings collected on another site, and self-serving ratings on a LocalBusiness aren't shown anyway. The visible "5.0 on Google · 18 reviews" link stays everywhere. The playbook site did this, but here it's a manual-action risk with no upside.
3. **The `CNAME` file does nothing with an Actions deploy.** GitHub's docs say it's ignored. The custom domain is set in repo Settings → Pages, after you verify the domain on your GitHub account. I'll put that in the launch checklist.
4. **Formspree free allows 50 submissions a month across all four forms**, with no file uploads. A busy holiday month plus spam could hit that. Budget for the Personal plan (about $10/month billed yearly) at launch, or start free and watch the count.
5. **Store the Quick Order cutoff as a rule, not a table.** Every row of her schedule is "5 days before pickup, by 11 AM." I'll store `noticeDays: 5` and `cutoffTime: 11:00` and generate both the displayed table and the date-picker logic from them, so they can never disagree. If she changes notice to 6 days, both update together.
6. **Date picker:** a phone's built-in date input can't grey out individual days. Plan: set the earliest allowed date (calculated in the browser, Eastern time), reject blockout dates the moment they're picked with a clear message, and list the blocked dates under the field. It's accessible, works on every phone, and needs no calendar library.
7. **Only 6 of the 10 redirect pages are needed.** `/menu`, `/gallery`, `/birthday-cakes` and `/wedding-cakes` already exist at the new paths. GitHub Pages adds the trailing slash on its own with a real 301, which is better than a meta refresh. Stubs go at `/general-5/`, `/order-now/`, `/holiday-specials/`, `/special-event/`, `/cupcakes-cakepops-1/` and `/contact/`, and they work with or without the slash.
8. **Add an allergy FAQ** ("Can you accommodate allergies or gluten-free?") as a placeholder. Her menu includes peanut butter, Nutella, Oreo and cookie dough, and allergies are one of the first things bakery customers ask about. I won't write the answer.
9. **Add a review-request link.** Add a "Leave a Google review" short link in settings, plus a one-line text she can send after pickups. Reviews drove the playbook site's ranking, and at 18 reviews this is the cheapest growth lever. Off-site, it goes in the launch checklist.
10. **Leave `openingHours` out of the schema until hours are confirmed.** A placeholder can't go in structured data.
11. **Small mockup fixes:** on desktop the script label wraps and leaves "PA" alone on its own line, so I'll fit it on one line or balance the wrap. The mockup also loads Fraunces, which isn't used, so I'll drop it. Fonts get self-hosted (Latin subsets only), which saves the Google Fonts round trip and helps Lighthouse.
12. **Stay on Eleventy 3.x** (3.1.7). Version 4 is still alpha.

## 5. Blockers before step 2

- **Node.js isn't installed on this PC** (and neither is the GitHub CLI). Eleventy needs Node 18+. I can install Node LTS with `winget` if you OK it.
- **Project folder and repo:** this session is in a temporary folder. Pick a real folder, and tell me which GitHub account owns the repo.
- **Photos:** you meant to attach photos, but they didn't come through. I pulled the three hero photos out of the mockup file, but they're about 600 to 700px wide JPEGs. That's fine for the 360 and 720px versions but soft at 1200px, so originals are needed. Her two menu images also weren't attached. That's fine, since the build prompt already has every price.
