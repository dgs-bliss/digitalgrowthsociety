import CodeBlock from './CodeBlock.astro';
import YouTubeEmbed from './YouTubeEmbed.astro';
import RichImage from './RichImage.astro';

export const mdxComponents = {
  YouTubeEmbed,
  code_block: CodeBlock,
  img: RichImage,
  image: RichImage,
};
