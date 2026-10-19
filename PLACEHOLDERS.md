# Placeholders still to fill

Everything on the site marked `[[PLACEHOLDER: ...]]` is listed here. On the live site each one shows as a **yellow highlight**, so nothing missing can slip through unnoticed. None of them ever goes into Google's structured data.

**Where to fix it:**
- **Dashboard** means Laura (or Noah) can change it in Pages CMS. No code needed.
- **Code** means Noah edits the file in the repo.

To find any that are left: `grep -rn "PLACEHOLDER" src` (or search the built site for yellow highlights).

---

## 1. Facts to get from Laura

| What | Where it shows | Where to fix |
|---|---|---|
| Hours (Google currently lists 8 AM to 7 PM daily, appointment required) | Footer on every page; added to Google data once real | Dashboard → Business info → Contact & details → **Hours** |
| How far ahead to order custom cakes | Order page, wedding page, how-it-works, FAQ, policies, blog post | Dashboard → Business info → **How far ahead to order custom cakes** |
| Custom order payment: deposit or full, and when due | Order page, how-it-works, FAQ, policies | Dashboard → Business info → **Custom order payment terms** |
| Reply time ("Laura will reply within ...") | Order page, how-it-works, policies, thank-you page | Dashboard → Business info → **How quickly you reply** |
| Delivery distance and fees | Order form, wedding page, how-it-works, FAQ, policies | Dashboard → Business info → **Delivery details** |
| Fondant: toppers and decorations only, or full fondant-covered cakes? | FAQ, buttercream vs. fondant post | Dashboard → Business info → **Fondant details**, and Dashboard → FAQs ("Do you do fondant?") |
| Allergy, nut and gluten-free policy | FAQ, order page, policies | Dashboard → FAQs (allergies question), and Code: `src/pages/policies.njk` |
| Change and cancellation policy | Policies page | Code: `src/pages/policies.njk` |
| How the pickup address is shared with customers | Policies page | Code: `src/pages/policies.njk` |
| Smash cake size and price (plus details like dye-free or low-sugar, if any) | Smash cakes page, homepage card, smash cake blog post | Code: `src/pages/smash-cakes.njk`, `src/index.njk`, `src/blog/what-is-a-smash-cake.md`. **Better:** add smash cakes to the menu in the dashboard, then I'll wire the price in from there |
| Whether Laura holds a date before the design is final | Blog post: how far in advance | Code: `src/blog/how-far-in-advance-to-order-a-custom-cake.md` |
| Wording on matching inspiration photos | FAQ | Dashboard → FAQs ("Can you match an inspiration photo?") |
| Laura's story in her own words | Homepage About section, About page | Code: `src/index.njk`, `src/pages/about.njk` |

## 2. Classes and camp (Dashboard → Classes & camp)

Description, ages, class size, location note, price, sessions, and what kids make and learn (that last one is on the off-season page: `src/pages/classes.njk`). Classes are switched **off** for now, so the page shows the "Get notified about the next classes" form.

## 3. Thanksgiving page (Dashboard → Holiday & seasonal pages → Thanksgiving)

Intro, pickup dates, pre-order deadline, and the three treats (name, description, price, photo). The page is **off-season** for now, showing a waitlist. When Laura announces her Thanksgiving menu, she fills these in and switches Status to "On".

## 4. Photos and branding

| What | Where | How to fix |
|---|---|---|
| **Logo files** | Header badge, favicon, Google data | Noah: replace `src/favicons/favicon.svg` (or add a PNG), then run `node tools/make-icons.mjs` to rebuild every icon and the share image |
| **Owner photo** | Homepage About section, About page | Upload it, then I'll swap it in (`src/index.njk`, `src/pages/about.njk`) |
| **Full photo library, sorted by category** | Gallery, category pages, homepage | Dashboard → Gallery → add each photo with a category and a description |
| Smash cake photo, cupcakes/cake pops photo | Homepage category cards | Code: `src/index.njk` (point the card at a gallery photo) |
| Photos of all 6 Quick Order designs | Quick Order page, homepage preview | Dashboard → Quick Order cakes → each design → **Photo** and **Describe the photo** |
| Higher-resolution originals | Everywhere | The three photos on the site now are only 584 to 690px wide (from Wix). Originals at 1500px+ will look sharper |
| Her two menu images | Reference only | Never received. Not needed: every price came from the brief |

## 5. Google

| What | Where to fix |
|---|---|
| Real Google reviews, pasted word for word (none written or paraphrased) | Dashboard → Reviews |
| Link to her Google reviews | Dashboard → Business info → Google reviews |
| "Leave a review" link | Dashboard → Business info → Google reviews |
| Google Business Profile URL (goes into `sameAs` in the structured data once real) | Dashboard → Business info → Google reviews |
| Rating and review count | Dashboard → Business info → Google reviews (currently 5.0 from 18; update as reviews come in) |

## 6. Accounts and setup (Noah, see LAUNCH-CHECKLIST.md)

| What | Where to fix |
|---|---|
| 4 Formspree form IDs: custom order, Quick Order, classes, seasonal waitlist | Code: `src/_data/site.json`. Until set, forms say "This form isn't connected yet" and point people to text or call |
| GA4 measurement ID | Code: `src/_data/site.json`. Analytics stays off until it's set |
| **Photo uploads on the order form need a paid Formspree plan.** For now the form says "Text your inspiration photos to (484) 293-1329" | Decide on a plan; then I'll add an upload field |
| Online payment for Quick Order (future) | Her current process stays: invoice within 24 hours |
| Privacy policy effective date | Code: `src/pages/privacy.njk` at launch |
