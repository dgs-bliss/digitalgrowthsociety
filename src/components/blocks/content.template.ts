import type { Template } from 'tinacms';

export const contentBlockSchema: Template = {
	name: 'content',
	label: 'Content',
	fields: [
		{ type: 'rich-text', label: 'Body', name: 'body' },
	],
	ui: {
		defaultItem: {},
	},
};
