// Every holiday page lives at /holiday/<slug>/ forever. Off-season pages stay live (never noindex).
export default {
  layout: "layouts/seasonal.njk",
  tags: ["seasonal"],
  crumbs: ["holiday"],
  scripts: ["forms"],
  related: ["holiday", "cupcakes-cake-pops", "order"],
  eleventyComputed: {
    permalink: (data) => `/holiday/${data.slug || data.page.fileSlug}/`,
    key: (data) => `holiday-${data.slug || data.page.fileSlug}`,
    crumbLabel: (data) => data.title,
    heading: (data) => `${data.title} <em>treats.</em>`,
    label: (data) => (data.status === "on" ? "Now taking pre-orders" : "Back next season"),
    lede: (data) => data.intro,
    pageTitle: (data) => `${data.title} Desserts in Coopersburg, PA | Laura, My Sweets`,
    description: (data) =>
      data.status === "on"
        ? `Pre-order ${data.title} cakes and desserts from Laura, My Sweets in Coopersburg, PA. Pickup or delivery for Lehigh Valley families.`
        : `${data.title} cakes and desserts from Laura, My Sweets in Coopersburg, PA are back next season. Join the list to hear when pre-orders open.`,
  },
};
