const textFields = [
  { name: 'key', label: 'Field Key', type: 'string', required: true, ui: { component: 'hidden' } },
  { name: 'value', label: 'Text', type: 'string', ui: { component: 'textarea' } },
];
const imageFields = [
  { name: 'key', label: 'Field Key', type: 'string', required: true, ui: { component: 'hidden' } },
  { name: 'image', label: 'Image', type: 'image' },
  { name: 'alt', label: 'Alt Text', type: 'string' },
];
const linkFields = [
  { name: 'key', label: 'Field Key', type: 'string', required: true, ui: { component: 'hidden' } },
  { name: 'url', label: 'URL / Anchor', type: 'string' },
];

function section(name: string, label: string) {
  return {
    type: 'object', name, label,
    fields: [
      { type: 'object', list: true, name: 'texts', label: 'Text Content', ui: { itemProps: (item: any) => ({ label: item?.value || 'Text' }) }, fields: textFields },
      { type: 'object', list: true, name: 'images', label: 'Images', ui: { itemProps: (item: any) => ({ label: item?.alt || 'Image' }) }, fields: imageFields },
      { type: 'object', list: true, name: 'links', label: 'Links', ui: { itemProps: (item: any) => ({ label: item?.url || 'Link' }) }, fields: linkFields },
    ],
  };
}

export const homepageTemplateBlockSchema = {
  name: 'homepageTemplate',
  label: 'Homepage — DGS Distinguished Dozen',
  fields: [
    {
      type: 'object',
      name: 'sourceContent',
      label: 'Homepage Sections',
      fields: [
    section("hero", "Hero"),
    section("stats", "Stats"),
    section("friday", "Friday Call"),
    section("mission", "Mission and Values"),
    section("topics", "On the Table"),
    section("members", "Members"),
    section("network", "Wider Network"),
    section("retreat", "Annual Retreat"),
    section("path", "Path to a Seat"),
    section("apply", "Application"),
    section("faq", "Questions")
      ],
    },
  ],
};
