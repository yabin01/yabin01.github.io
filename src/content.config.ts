import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  // Astro 5 内容层：从 src/content/posts 下加载所有 .md
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullish().default(''),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['交易', '读书', '随笔']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

// 缠论原文：从《教你炒股票108课》按课拆出的原文，独立于个人文章流。
// 故意不塞进 posts —— 108 篇是文献库性质，混进去会把首页/归档/RSS 全刷成课程。
const chanlun = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/chanlun' }),
  schema: z.object({
    title: z.string(),
    lesson: z.number(),
    volume: z.string().default('上册'),
    pubDate: z.coerce.date(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, chanlun };
