// JSON-LD for every page, built from the same data files Laura edits.
// Placeholders never go into structured data: anything still marked [[PLACEHOLDER]] is left out.

const PH = /\[\[PLACEHOLDER/;
const isReal = (v) => v != null && v !== "" && !PH.test(String(v));
const SERVICE_PAGES = {
  "birthday-cakes": { name: "Custom birthday cakes", sections: ["cakes", "cupcakes"] },
  "smash-cakes": { name: "First birthday and smash cakes", sections: ["cakes", "cupcakes"] },
  "wedding-cakes": { name: "Wedding and special event cakes", sections: ["cakes", "other"] },
  "cupcakes-cake-pops": { name: "Cupcakes, cake pops and dessert treats", sections: ["cupcakes", "cakePops", "other"] },
  menu: { name: "Custom cakes and desserts", sections: ["cakes", "cupcakes", "cakePops", "other"] },
};
// Pages that show an FAQ section, and which FAQs (by page key) they show.
const FAQ_PAGES = new Set(["home", "birthday-cakes", "smash-cakes", "wedding-cakes", "cupcakes-cake-pops", "menu", "about", "order", "quick-order", "classes", "policies"]);

function offer(item, menuSection) {
  const unit = item.unit === "dozen" ? " (per dozen)" : item.unit === "each" ? " (each)" : "";
  const o = {
    "@type": "Offer",
    name: item.name + unit,
    priceCurrency: "USD",
    itemOffered: { "@type": "Product", name: item.name, category: menuSection },
  };
  if (item.priceMax) {
    o.priceSpecification = { "@type": "PriceSpecification", minPrice: item.price, maxPrice: item.priceMax, priceCurrency: "USD" };
  } else if (item.from || item.plus) {
    o.priceSpecification = { "@type": "PriceSpecification", minPrice: item.price, priceCurrency: "USD" };
  } else {
    o.price = item.price;
  }
  return o;
}

const SECTION_LABELS = { cakes: "Cakes", cupcakes: "Cupcakes", cakePops: "Cake pops", other: "Other treats" };

function catalog(menu, sections, name) {
  return {
    "@type": "OfferCatalog",
    name,
    itemListElement: sections.map((s) => ({
      "@type": "OfferCatalog",
      name: SECTION_LABELS[s],
      itemListElement: menu[s].items.map((i) => offer(i, SECTION_LABELS[s])),
    })),
  };
}

function quickCatalog(quickOrder, computed) {
  return {
    "@type": "OfferCatalog",
    name: "Quick Order cakes",
    itemListElement: computed.quickAvailable.flatMap((d) =>
      quickOrder.sizes.map((sz, i) => ({
        "@type": "Offer",
        name: `${d.name}, ${sz.label} (serves ${sz.serves})`,
        price: i === 0 ? d.price6 : d.price8,
        priceCurrency: "USD",
        itemOffered: { "@type": "Product", name: `${d.name} cake`, description: d.description },
      }))
    ),
  };
}

export function buildSchema(ctx) {
  const { settings: s, site, menu, quickOrder, faqs, classes, computed, pages, page } = ctx;
  const url = site.url + page.url;
  const bakeryId = site.url + "/#bakery";
  const isHome = page.url === "/";
  const key = isHome ? "home" : ctx.key;
  const graph = [];

  const address = {
    "@type": "PostalAddress",
    addressLocality: s.city,
    addressRegion: s.region,
    postalCode: s.zip,
    addressCountry: "US",
  };
  const areaServed = s.serviceArea.map((t) => ({ "@type": "City", name: `${t}, ${s.region}` }));
  const provider = { "@type": "Bakery", "@id": bakeryId, name: s.name, url: site.url + "/" };

  if (isHome) {
    const allPrices = ["cakes", "cupcakes", "cakePops", "other"].flatMap((k) => menu[k].items.filter((i) => i.unit !== "each").map((i) => i.price));
    const sameAs = [s.social.facebook, s.social.instagram, s.google.profileUrl].filter(isReal);
    graph.push({
      "@type": "Bakery",
      "@id": bakeryId,
      name: s.name,
      url: site.url + "/",
      telephone: computed.tel,
      email: s.email,
      logo: site.url + "/logo.png",
      image: [
        site.url + "/assets/og-image.jpg",
        ...ctx.gallery.filter((g) => g.featured).map((g) => site.url + g.image),
      ],
      description: `Licensed and insured home bakery in ${s.city}, ${s.region}, making custom cakes, cupcakes and cake pops to order since ${s.since}.`,
      priceRange: `$${Math.min(...allPrices)}-$${Math.max(...allPrices)}+`,
      address,
      areaServed,
      sameAs,
      foundingDate: String(s.since),
      founder: { "@type": "Person", name: s.owner },
      paymentAccepted: s.payments.join(", "),
      currenciesAccepted: "USD",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Cakes and desserts",
        itemListElement: [catalog(menu, ["cakes", "cupcakes", "cakePops", "other"], "Custom orders"), quickCatalog(quickOrder, computed)],
      },
      ...(isReal(s.hours) ? { openingHours: s.hours } : {}),
    });
    graph.push({ "@type": "WebSite", "@id": site.url + "/#website", name: s.name, url: site.url + "/", publisher: { "@id": bakeryId } });
  }

  // Breadcrumbs on every page but the homepage
  if (!isHome) {
    const trail = [{ name: "Home", item: site.url + "/" }];
    for (const c of ctx.crumbs || []) {
      const p = pages[c] || c;
      trail.push({ name: p.label, item: site.url + p.url });
    }
    trail.push({ name: ctx.crumbLabel || (key && pages[key] ? pages[key].label : ctx.title), item: url });
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: t.item })),
    });
  }

  // Service pages
  if (SERVICE_PAGES[key]) {
    const sp = SERVICE_PAGES[key];
    graph.push({
      "@type": "Service",
      name: sp.name,
      serviceType: sp.name,
      url,
      description: ctx.description,
      provider,
      areaServed,
      hasOfferCatalog: catalog(menu, sp.sections, sp.name),
    });
  }
  if (key === "quick-order") {
    graph.push({
      "@type": "Service",
      name: "Quick Order cakes",
      serviceType: "Set-design cakes with 5 days' notice",
      url,
      description: ctx.description,
      provider,
      areaServed,
      hasOfferCatalog: quickCatalog(quickOrder, computed),
    });
  }

  // Blog posts
  if (ctx.tags && ctx.tags.includes("posts")) {
    const date = new Date(page.date).toISOString().slice(0, 10);
    graph.push({
      "@type": "BlogPosting",
      headline: ctx.headline,
      description: ctx.description,
      datePublished: date,
      dateModified: date,
      author: { "@type": "Person", name: ctx.author || s.owner },
      publisher: { "@type": "Organization", "@id": bakeryId, name: s.name, logo: { "@type": "ImageObject", url: site.url + "/logo.png" } },
      image: site.url + "/assets/og-image.jpg",
      mainEntityOfPage: url,
    });
  }

  // Classes: one Event per upcoming session, only while classes are on
  if (key === "classes" && classes.on) {
    const today = new Date().toISOString().slice(0, 10);
    for (const ses of classes.sessions || []) {
      if (!ses.date || ses.date < today) continue;
      const price = isReal(classes.price) && String(classes.price).match(/\$?(\d+(?:\.\d{2})?)/);
      graph.push({
        "@type": "Event",
        name: ses.title,
        startDate: ses.date,
        ...(ses.endDate ? { endDate: ses.endDate } : {}),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Place", name: s.name, address },
        organizer: provider,
        ...(isReal(classes.description) ? { description: classes.description } : {}),
        ...(price
          ? {
              offers: {
                "@type": "Offer",
                price: Number(price[1]),
                priceCurrency: "USD",
                url,
                availability: ses.status === "full" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
              },
            }
          : {}),
      });
    }
  }

  // FAQPage: exactly the questions shown on this page, minus any placeholder answers
  let shown = [];
  if (key === "faq") shown = faqs;
  else if (ctx.tags && ctx.tags.includes("posts")) shown = ctx.faqs_post || [];
  else if (FAQ_PAGES.has(key)) shown = faqs.filter((f) => (f.pages || []).includes(key));
  const real = shown.filter((f) => isReal(f.q) && isReal(f.a));
  if (real.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: real.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

  if (!graph.length) return "";
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}
