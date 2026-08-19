// 站点全局配置：改这里即可调整站名、导航、分类与评论。

export const SITE = {
  title: '清远先生',
  tagline: '交易 · 读书 · 随笔',
  description:
    '刘亚斌（清远先生）的个人博客，记录数字货币交易、历史与哲学读书，以及日常随笔。',
  author: '清远先生',
  lang: 'zh-CN',
  url: 'https://yabin01.github.io',
  email: '', // 选填，留空则不显示
};

// 顶部导航。href 使用站点内路径。
export const NAV: { label: string; href: string }[] = [
  { label: '首页', href: '/' },
  { label: '交易', href: '/category/trading' },
  { label: '读书', href: '/category/reading' },
  { label: '随笔', href: '/category/essays' },
  { label: '关于', href: '/about' },
];

// 分类：key 是文章 frontmatter 里的 category 值（中文），slug 用于 URL（英文，更干净）。
export const CATEGORY_META: Record<
  string,
  { slug: string; label: string; desc: string }
> = {
  交易: {
    slug: 'trading',
    label: '交易',
    desc: '数字货币、缠论与市场思考。',
  },
  读书: {
    slug: 'reading',
    label: '读书',
    desc: '历史与哲学阅读笔记。',
  },
  随笔: {
    slug: 'essays',
    label: '随笔',
    desc: '日常随想与杂记。',
  },
};

// Giscus 评论（基于 GitHub Discussions，免后端）。
// 启用步骤：
//   1. 在仓库开启 Discussions（Settings → General → Features）。
//   2. 安装 Giscus App：https://github.com/apps/giscus
//   3. 到 https://giscus.app 生成配置，把 repoId / categoryId 填进来。
//   4. 把 enabled 改为 true。
export const GISCUS = {
  repo: 'yabin01/yabin01.github.io',
  repoId: '', // 在 giscus.app 生成后填入
  category: 'Announcements',
  categoryId: '', // 在 giscus.app 生成后填入
  enabled: false, // 填好上面两项后改为 true
};
