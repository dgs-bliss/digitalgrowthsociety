import type { Template } from 'tinacms';
import type { FeatureItem } from '../../lib/data';

export const featuresBlockSchema: Template = {
	name: 'features',
	label: 'Features',
	fields: [
		{ type: 'string', label: 'Title', name: 'title' },
		{ type: 'string', label: 'Description', name: 'description' },
		{
			type: 'object', label: 'Feature Items', name: 'items', list: true,
			ui: { itemProps: (i: FeatureItem) => ({ label: i?.title ?? '' }), defaultItem: { title: "Here's a feature", icon: 'edit' } },
			fields: [
				{ type: 'string', label: 'Icon (Tabler name)', name: 'icon' },
				{ type: 'string', label: 'Title', name: 'title' },
				{ type: 'rich-text', label: 'Text', name: 'text' },
			],
		},
	],
	ui: {
		defaultItem: {
			title: 'Built to cover your needs',
			description: 'Everything you need to build content-driven sites.',
			items: [
				{ title: 'Visual editing', icon: 'edit' },
				{ title: 'Composable blocks', icon: 'layout-grid' },
				{ title: 'Git-backed', icon: 'brand-git' },
			],
		},
	},
};
