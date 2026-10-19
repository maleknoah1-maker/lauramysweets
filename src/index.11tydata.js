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
  eleventyComputed: {
    preloadImage: async () => {
      const meta = await Image(HERO, { widths: [360, 720, 1200], formats: ["webp"], outputDir: "_site/img/", urlPath: "/img/" });
      return meta.webp.find((s) => s.width >= 360).url;
    },
    ogImageUrl: async () => {
      const meta = await Image(HERO, { widths: [360, 720, 1200], formats: ["webp"], outputDir: "_site/img/", urlPath: "/img/" });
      return meta.webp[meta.webp.length - 1].url;
    },
  },
};
