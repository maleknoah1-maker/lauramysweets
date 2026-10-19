import Image from "@11ty/eleventy-img";

const HERO = "src/images/originals/three-tier-painted-flower-cake.webp";

export default {
  hero: {
    main: {
      src: "/images/originals/three-tier-painted-flower-cake.webp",
      alt: "Three-tier white buttercream cake with hand-painted spring flowers",
    },
    circle: {
      src: "/images/originals/pink-vintage-birthday-cake.webp",
      alt: "Pink and white vintage-style birthday cake with a gold Happy Birthday topper",
    },
    rect: {
      src: "/images/originals/black-white-striped-wedding-cake.webp",
      alt: "Four-tier black and white striped wedding cake with cascading sugar flowers",
    },
  },
  // Must match the hero <img> sizes exactly, or the browser downloads the photo twice.
  preloadSizes: "(min-width: 1024px) 350px, 270px",
  eleventyComputed: {
    preloadSrcset: async () => {
      const meta = await Image(HERO, { widths: [360, 540, 720, 1200, "auto"], formats: ["webp"], outputDir: "_site/img/", urlPath: "/img/" });
      return meta.webp.map((s) => `${s.url} ${s.width}w`).join(", ");
    },
  },
};
