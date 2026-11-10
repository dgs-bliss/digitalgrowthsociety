import type { TinaField } from "tinacms";

export const seoFields: TinaField = {
  name: "seo",
  label: "SEO",
  description: "Search and social sharing settings for this content. Leave fields blank to use sensible fallbacks.",
  type: "object",
  fields: [
    {
      name: "metaTitle",
      label: "Meta Title",
      type: "string",
      description: "Browser/search title. Falls back to the page or post title when blank.",
    },
    {
      name: "metaDescription",
      label: "Meta Description",
      type: "string",
      description: "Search result and social preview description. Falls back to the post description or site default when blank.",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "ogTitle",
      label: "Social Share Title",
      type: "string",
      description: "Open Graph/Twitter title. Falls back to Meta Title when blank.",
    },
    {
      name: "ogDescription",
      label: "Social Share Description",
      type: "string",
      description: "Open Graph/Twitter description. Falls back to Meta Description when blank.",
      ui: {
        component: "textarea",
      },
    },
    {
      name: "ogImage",
      label: "Social Share Image",
      type: "image",
      description: "Image used when sharing on social platforms. Falls back to the post hero image or default image when blank.",
    },
    {
      name: "canonicalUrl",
      label: "Canonical URL",
      type: "string",
      description: "Optional canonical URL. Leave blank to use the current page URL.",
    },
    {
      name: "noindex",
      label: "No Index",
      type: "boolean",
      description: "Ask search engines not to index this page/post.",
    },
    {
      name: "nofollow",
      label: "No Follow",
      type: "boolean",
      description: "Ask search engines not to follow links on this page/post.",
    },
  ],
};
