# 清远先生 · 个人博客

基于 [Astro](https://astro.build) 构建的极简留白风格博客，部署于 GitHub Pages（`yabin01.github.io`）。

- 写作：Markdown，放在 `src/content/posts/`
- 分类：交易 / 读书 / 随笔（在文章 frontmatter 的 `category` 指定）
- 部署：推送到 `main` 分支，GitHub Actions 自动构建并发布到 Pages
- 评论：Giscus（基于 GitHub Discussions，可选项）

## 本地预览

```bash
npm install
npm run dev      # 本地开发，默认 http://localhost:4321
npm run build    # 产出静态文件到 dist/
npm run preview  # 本地预览构建结果
```

> 需要 Node 22+。

## 写一篇新文章

在 `src/content/posts/` 下新建一个 `.md` 文件，例如 `my-post.md`：

```markdown
---
title: 文章标题
description: 一句话摘要，会显示在列表和 SEO 描述里
pubDate: 2026-08-19
updatedDate: 2026-08-20   # 可选
category: 交易            # 交易 / 读书 / 随笔 三选一
tags: ["缠论", "复盘"]     # 可选
draft: false              # true 表示草稿，不会被发布
---

正文用 Markdown 写即可……
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 标题 |
| `description` | 是 | 摘要 |
| `pubDate` | 是 | 发布日期 `YYYY-MM-DD` |
| `updatedDate` | 否 | 更新日期 |
| `category` | 是 | `交易` / `读书` / `随笔` |
| `tags` | 否 | 标签数组 |
| `draft` | 否 | 设为 `true` 则不发布 |

文章 URL 为 `/posts/<文件名>/`（不含 `.md`）。保存后本地会热更新。

## 修改站名、导航、分类

编辑 `src/consts.ts`：

- `SITE`：站名、标语、描述、作者
- `NAV`：顶部导航项
- `CATEGORY_META`：分类的中文名、英文 slug（用于 URL）、描述
- `GISCUS`：评论配置

## 部署到 GitHub Pages

1. 把本项目推送到 `yabin01/yabin01.github.io` 仓库的 `main` 分支。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 推送后，Actions 会自动构建部署。首次部署完成后，访问 `https://yabin01.github.io`。

> 因为这是用户/组织页（`username.github.io`），已配置 `base: '/'`，无需子路径。

## 开启评论（Giscus，可选）

1. 仓库开启 **Settings → General → Features → Discussions**。
2. 安装 [Giscus App](https://github.com/apps/giscus)。
3. 到 [giscus.app](https://giscus.app) 生成配置，复制 `data-repo-id` 与 `data-category-id`。
4. 把这两个值填进 `src/consts.ts` 的 `GISCUS.repoId` / `GISCUS.categoryId`，并把 `GISCUS.enabled` 改为 `true`。
5. 重新构建部署。

## 目录结构

```
src/
  consts.ts              # 全站配置
  content.config.ts      # 文章集合定义
  content/posts/         # 你的文章（Markdown）
  layouts/BaseLayout.astro
  components/            # Header / Footer / PostCard / Giscus 等
  pages/
    index.astro         # 首页
    about.astro         # 关于
    posts/[...slug].astro  # 文章页
    category/[slug].astro # 分类页
    rss.xml.js          # RSS 订阅
  styles/global.css     # 主题样式
.github/workflows/deploy.yml  # 自动部署
public/favicon.svg
```
