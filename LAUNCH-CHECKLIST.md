# Launch checklist (for Noah)

Do these in order. Each step says how to confirm it worked before you move on. **Don't cancel anything at Wix until the very last section.**

Repo: `maleknoah1-maker/lauramysweets` · Work branch: `build/site-rebuild` · Live branch: `main`

---

## 1. Fill in what you can before launch

- [ ] Go through **PLACEHOLDERS.md** with Laura. The site can launch with some yellow highlights, but get at least these: hours, lead time, payment terms, reply time, delivery details, and the allergy answer.
- [ ] If you have her logo, replace `src/favicons/favicon.svg` and run `node tools/make-icons.mjs`.
- [ ] Run the checks locally: `npm run build`, then `node tools/check-site.mjs` should say **No problems found**.

## 2. Formspree (forms)

- [ ] Create a Formspree account, with notification emails going to **lauramysweets@gmail.com**. Laura can own the account; you can be added as a team member.
- [ ] Create 4 forms: **Custom order**, **Quick Order**, **Class sign-ups**, **Seasonal waitlist**.
- [ ] Copy each form's ID (the part after `formspree.io/f/`) into `src/_data/site.json`, replacing the four `[[PLACEHOLDER: Formspree form ID ...]]` values.
- [ ] In each form's settings, restrict submissions to `lauramysweets.com` once the domain is live.
- [ ] Decide on a plan. The free plan allows **50 submissions a month across all four forms** and no file uploads. The Personal plan (about $10/month billed yearly) raises the limit. If you add photo uploads later, check which plan includes them; until then the form tells people to text inspiration photos.
- [ ] After launch, submit each form once with test details and confirm the email arrives at lauramysweets@gmail.com and the site lands on the thank-you page.

## 3. Google Analytics 4

- [ ] In analytics.google.com, create a property for **Laura, My Sweets** with a Web data stream for `https://lauramysweets.com`.
- [ ] Copy the Measurement ID (`G-XXXXXXX`) into `src/_data/site.json` as `ga4`.
- [ ] After launch, open `https://lauramysweets.com/?notrack=1` once in **each browser** on your devices and Laura's. That stops your own visits from being counted (`?notrack=0` turns tracking back on).
- [ ] In a normal browser where notrack is off, click the phone and text buttons, the Quick Order links, and submit a test form. Then in GA4 → Admin → Events, mark these as **key events** (each one only appears after it has fired once):
  - `form_submit` (has a `form_name` parameter)
  - `phone_click`
  - `text_click`
  - `quick_order_click`

## 4. Merge and turn on GitHub Pages

- [ ] Open a pull request from `build/site-rebuild` into `main`, review it, and merge.
- [ ] Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions.**
- [ ] Repo → **Actions**: the **Deploy site** workflow should run and finish green. The site is now live at `https://maleknoah1-maker.github.io/lauramysweets/`. That preview address will look broken (missing styles, since the site expects to live at the domain root). That's fine; it works once the custom domain is set below.

## 5. Point lauramysweets.com at GitHub Pages (Wix DNS)

The domain is registered at Wix and its name servers can't be changed, so you edit DNS records inside Wix.

**a. Verify the domain with GitHub first** (prevents domain takeover):
- [ ] GitHub → your profile **Settings → Pages → Add a domain** → `lauramysweets.com`. GitHub shows a **TXT** record (host like `_github-pages-challenge-maleknoah1-maker`).
- [ ] Add that TXT record in Wix (below), then click **Verify** in GitHub.

**b. Edit records in Wix:** Wix → **Domains** → lauramysweets.com → **⋯ Domain Actions → Manage DNS Records**.
- [ ] **A records** for the root (`@` / lauramysweets.com). Replace Wix's A record with these four:
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```
- [ ] **AAAA records** (optional, for IPv6). Keep the A records too.
  ```
  2606:50c0:8000::153
  2606:50c0:8001::153
  2606:50c0:8002::153
  2606:50c0:8003::153
  ```
- [ ] **CNAME** for `www` → `maleknoah1-maker.github.io` (no repo name).
- [ ] **Delete** the old Wix A and www CNAME records so they don't conflict. Leave any **MX** records alone (they handle email if any is set up on the domain) and leave the verification TXT record in place.
- [ ] If Wix won't let you edit the A/www records because the domain is still connected to the Wix site, disconnect the domain from the site in Wix first (Domains → domain → Domain Actions). The domain stays registered to you either way.

Wix's guide: [Connecting a Wix domain to an external site](https://support.wix.com/en/article/connecting-a-wix-domain-to-an-external-site). DNS changes can take up to 24 hours.

**c. Tell GitHub about the domain:**
- [ ] Repo → **Settings → Pages → Custom domain** → `lauramysweets.com` → **Save**. Wait for the DNS check to pass. With an Actions deploy, GitHub ignores any `CNAME` file; this setting is what counts.
- [ ] Once it's available (can take up to 24 hours), tick **Enforce HTTPS**.
- [ ] Confirm: `https://lauramysweets.com` and `https://www.lauramysweets.com` both load the new site with a padlock, and `http://` redirects to `https://`.
- [ ] Spot-check the old Wix links: `/order-now`, `/contact`, `/general-5`, `/special-event`, `/cupcakes-cakepops-1`, `/holiday-specials` should land on the new pages. `/menu`, `/gallery`, `/birthday-cakes` and `/wedding-cakes` should open directly.

## 6. Pages CMS for Laura

- [ ] In Pages CMS, open lauramysweets on the **main** branch from now on (edits saved on main go live).
- [ ] **Collaborators** → invite **lauramysweets@gmail.com**. She signs in with her email; she doesn't need a GitHub account.
- [ ] Walk Laura through **EDITING-GUIDE.md**. Have her change something small (like the banner text), save, and watch it go live about a minute later.

## 7. Search Console

- [ ] In her **existing** Search Console property, go to **Sitemaps** and submit `https://lauramysweets.com/sitemap.xml`.
- [ ] **URL Inspection** → request indexing for the homepage, `/birthday-cakes/`, `/wedding-cakes/`, `/quick-order/` and `/menu/`.
- [ ] Run Google's [Rich Results Test](https://search.google.com/test/rich-results) on the homepage, `/birthday-cakes/` and `/blog/cake-size-guide/`. Expect Breadcrumb, FAQ and Article results to be detected.
- [ ] Check back in a week: Pages → Indexed should be climbing, and the old Wix URLs should drop out on their own.

## 8. Google Business Profile (once verified)

- [ ] **Website:** `https://lauramysweets.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
- [ ] **Menu link:** `https://lauramysweets.com/menu/`
- [ ] **Appointment / order link:** `https://lauramysweets.com/order/`
- [ ] The service area towns should match the site's footer exactly (they already match the current profile).
- [ ] Copy the profile URL, reviews link and "write a review" link into the dashboard: **Business info → Google reviews**. That also adds the profile to the site's structured data.
- [ ] Give Laura the review link to text happy customers after pickup.

## 9. Wix: only after everything above is confirmed

Wait until the new site has been live on HTTPS for at least a week, forms and analytics are confirmed working, and Search Console has read the sitemap.

- [ ] In Wix → **Domains**, confirm the domain's own subscription has **auto-renew turned on**, and check its renewal date. If the domain came free with a yearly Premium plan, it renews separately at the domain price after that first year.
- [ ] Cancel the **Premium site plan** only (Wix → Subscriptions → the site plan → cancel auto-renew). **Do not cancel the domain subscription.** Domain and site plan are billed separately; cancelling the plan detaches the domain from the Wix site but leaves it registered to Laura. Since the domain already points at GitHub, the live site isn't affected. Wix's terms can change, so read the cancellation screen carefully before confirming.
- [ ] After cancelling, re-check `https://lauramysweets.com` and the DNS records in Wix are unchanged.
- [ ] Optional, later: transfer the domain to another registrar (for example Cloudflare or Porkbun) so it no longer depends on a Wix account.
