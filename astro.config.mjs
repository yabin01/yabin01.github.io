// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 用户/组织页：仓库名恰好是 username.github.io，因此 base 为 '/'，无需子路径。
export default defineConfig({
  site: 'https://yabin01.github.io',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
