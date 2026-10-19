export default {
  layout: "layouts/post.njk",
  tags: ["posts"],
  crumbs: ["blog"],
  ogType: "article",
  author: "Laura Malek",
  eleventyComputed: {
    permalink: (data) => `/blog/${data.page.fileSlug}/`,
    crumbLabel: (data) => data.headline || data.title,
  },
};
