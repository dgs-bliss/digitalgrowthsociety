# TinaCMS Permalink / URL Field

Added `permalink` fields to blog/page Tina collections and helper functions in `src/lib/permalinks.ts`.

Use in frontend links:

```astro
import { getBlogPermalink, getPagePermalink } from '../lib/permalinks';
<a href={getBlogPermalink(post)}>{post.title}</a>
```

For the actual post/page route file, Astro must generate static paths from the custom permalink. In a catch-all route, use:

```ts
import { slugFromPermalink } from '../../lib/permalinks';

return posts.map((post) => ({
  params: { slug: slugFromPermalink(post.permalink) || post._sys.filename },
  props: { post },
}));
```

If your route is `src/pages/blog/[slug].astro`, custom URLs outside `/blog/...` require changing it to a catch-all route. Send that route file if you want me to patch the exact route safely.
