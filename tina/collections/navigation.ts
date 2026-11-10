import type { Collection } from "tinacms";

export const NavigationCollection: Collection = {
  name: "navigation",
  label: "Navigation",
  path: "src/content/navigation",
  format: "json",
  fields: [
    { name: "title", label: "Navigation Name", type: "string", isTitle: true, required: true },
    {
      name: "items",
      label: "Navigation Items",
      type: "object",
      list: true,
      ui: { itemProps: (item) => ({ label: item?.label || "Menu item" }) },
      fields: [
        { name: "label", label: "Label", type: "string", required: true },
        { name: "href", label: "URL", type: "string", required: true },
        {
          name: "children",
          label: "Submenu Items",
          type: "object",
          list: true,
          ui: { itemProps: (item) => ({ label: item?.label || "Submenu item" }) },
          fields: [
            { name: "label", label: "Label", type: "string", required: true },
            { name: "href", label: "URL", type: "string", required: true },
          ],
        },
      ],
    },
  ],
};