// 站点全局配置：改这里即可调整站名、导航、分类与评论。

export const SITE = {
  title: "ChingYuan'Blog",
  tagline: '交易 · 读书 · 随笔',
  description:
    "ChingYuan'Blog —— 清远先生的个人博客，记录交易复盘、分享历史与哲学，缠论学习笔记以及日常随笔。",
  author: '清远先生',
  lang: 'zh-CN',
  url: 'https://yabin01.github.io',
  email: 'yabinliu1997@gmail.com', // 选填，留空则不显示
};

// 顶部导航。href 使用站点内路径。
export const NAV: { label: string; href: string }[] = [
  { label: '首页', href: '/' },
  { label: '交易', href: '/category/trading' },
  { label: '读书', href: '/category/reading' },
  { label: '随笔', href: '/category/essays' },
  { label: '标签', href: '/tags' },
  { label: '归档', href: '/archive' },
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
// 已启用：repoId / categoryId 已填好（2026-08-19）。
// 注意：仅当 COMMENTS.provider 为 'giscus' 时生效，作为 Twikoo 未就绪前的兜底。
export const GISCUS = {
  repo: 'yabin01/yabin01.github.io',
  repoId: 'R_kgDOTmFjkw',
  category: 'Announcements',
  categoryId: 'DIC_kwDOTmFjk84DDsRG',
  enabled: true,
};

// 评论系统总开关。
// provider: 'twikoo' 用 Twikoo（支持匿名，无需登录）；'giscus' 走 GitHub Discussions；'none' 关闭。
// 只要 twikoo.envId 为空，会自动回退到 Giscus，站点不会出现坏掉的评论区。
export const COMMENTS = {
  provider: 'twikoo' as 'twikoo' | 'giscus' | 'none',
  twikoo: {
    // Twikoo 后端：Netlify 云函数 + MongoDB Atlas（2026-09-11 部署完成）
    // ⚠️ 必须是完整的函数地址。Twikoo 前端对 http(s):// 开头的 envId 会直接 POST，
    //    不会自动补路径（已在 twikoo.min.js 中确认，"netlify" 字样出现 0 次）。
    envId: 'https://chingyuan-comments.netlify.app/.netlify/functions/twikoo',
    lang: 'zh-CN',
    // 前端脚本已自托管到 /vendor/twikoo.min.js，避免 jsDelivr 在国内被墙
    script: '/vendor/twikoo.min.js',
  },
};
