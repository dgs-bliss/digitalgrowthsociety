import type { TinaField } from 'tinacms';

type PermalinkKind = 'blog' | 'page';

export function slugifyPermalink(value?: string | null): string {
  if (!value || typeof value !== 'string') return '';
  let input = value.trim().toLowerCase();
  if (!input) return '';
  if (input.startsWith('http://') || input.startsWith('https://')) {
    input = input.split('/').slice(3).join('/');
  }
  input = input.split('?')[0].split('#')[0].replace(/\\/g, '/');
  input = input.replace(/^\/+|\/+$/g, '');
  if (input.startsWith('blog/')) input = input.slice(5);
  return input
    .split('/')
    .map((part) => part.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('/');
}

export function permalinkField(kind: PermalinkKind): TinaField {
  return {
    name: 'permalink',
    label: 'Permalink / URL Slug',
    type: 'string',
    description: kind === 'blog'
      ? 'Type the blog URL slug only, for example: my-custom-post. Dashes are allowed. Do not include /blog/.'
      : 'Type the page URL slug only, for example: about-us. Dashes are allowed.',
  } as TinaField;
}
