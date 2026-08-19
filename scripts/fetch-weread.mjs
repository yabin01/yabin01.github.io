// 微信读书书架同步脚本
// 用法: node scripts/fetch-weread.mjs <WEREAD_API_KEY>
// 拉取书架笔记本、每本书的划线与想法、阅读统计，写入 src/data/bookshelf.json

import { writeFileSync } from 'node:fs';

const KEY = process.argv[2] || process.env.WEREAD_API_KEY;
if (!KEY) {
  console.error('缺少 API Key：node scripts/fetch-weread.mjs wrk-xxxx');
  process.exit(1);
}

const GATEWAY = 'https://i.weread.qq.com/api/agent/gateway';
const SKILL_VERSION = '1.0.4';

async function call(api_name, params = {}) {
  const res = await fetch(GATEWAY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ api_name, skill_version: SKILL_VERSION, ...params }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${api_name} HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${api_name} 非 JSON 响应: ${text.slice(0, 200)}`);
  }
  if (json.errCode && json.errCode !== 0 && json.errCode !== -2012) {
    throw new Error(`${api_name} errCode=${json.errCode} ${json.errMsg || ''}`);
  }
  return json.data ?? json;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. 笔记本概览（分页）
async function fetchNotebooks() {
  const books = [];
  let lastSort;
  let total = 0;
  for (let page = 0; page < 50; page++) {
    const params = { count: 20 };
    if (lastSort !== undefined) params.lastSort = lastSort;
    const data = await call('/user/notebooks', params);
    total = data.totalBookCount ?? total;
    const list = data.books || [];
    books.push(...list);
    if (data.hasMore === 1 && list.length > 0) {
      lastSort = list[list.length - 1].sort;
    } else {
      break;
    }
    await sleep(300);
  }
  return { books, total };
}

// 2. 单本划线
async function fetchBookmarks(bookId) {
  try {
    const data = await call('/book/bookmarklist', { bookId });
    const chapters = new Map((data.chapters || []).map((c) => [c.chapterUid, c.title]));
    const items = (data.updated || [])
      .filter((b) => b.type !== 0)
      .map((b) => ({
        chapter: chapters.get(b.chapterUid) || '',
        text: b.markText || '',
        createTime: b.createTime || 0,
      }))
      .sort((a, b) => (a.createTime || 0) - (b.createTime || 0));
    return items;
  } catch (e) {
    console.warn(`  划线拉取失败 ${bookId}: ${e.message}`);
    return [];
  }
}

// 3. 单本想法（synckey 分页）
async function fetchReviews(bookId) {
  const items = [];
  let synckey = 0;
  for (let page = 0; page < 30; page++) {
    try {
      const data = await call('/review/list/mine', { bookid: bookId, synckey, count: 20 });
      const list = data.reviews || [];
      for (const r of list) {
        const rv = r.review || r;
        items.push({
          abstract: rv.abstract || '',
          content: rv.content || '',
          createTime: rv.createTime || 0,
        });
      }
      if (data.hasMore === 1 && data.synckey && data.synckey !== synckey) {
        synckey = data.synckey;
      } else {
        break;
      }
      await sleep(250);
    } catch (e) {
      console.warn(`  想法拉取失败 ${bookId}: ${e.message}`);
      break;
    }
  }
  return items.sort((a, b) => (a.createTime || 0) - (b.createTime || 0));
}

// 4. 阅读统计（readTimes 按年（时间戳键）记录秒数，汇总为分钟）
async function fetchReadData() {
  try {
    const data = await call('/readdata/detail', { mode: 'overall' });
    const times = data?.readTimes || {};
    const totalSeconds = Object.values(times).reduce((s, v) => s + (Number(v) || 0), 0);
    const readMinutes = Math.round(totalSeconds / 60);
    const days = data?.totalReadDays ?? data?.readDays ?? 0;
    return { readMinutes, readDays: days, readTimes: times };
  } catch (e) {
    console.warn(`阅读统计拉取失败: ${e.message}`);
    return { readMinutes: 0, readDays: 0, readTimes: {} };
  }
}

// 5. 当月每日阅读时长（mode=monthly 返回本月每天秒数，key=当天 0 点时间戳）
async function fetchDailyRead() {
  try {
    const data = await call('/readdata/detail', { mode: 'monthly' });
    const times = data?.readTimes || {};
    return times;
  } catch (e) {
    console.warn(`每日阅读统计拉取失败: ${e.message}`);
    return {};
  }
}

async function main() {
  console.log('== 拉取笔记本概览 ==');
  const { books: notebooks, total } = await fetchNotebooks();
  console.log(`有笔记的书 ${notebooks.length} 本（totalBookCount=${total}）`);

  const { readMinutes, readDays, readTimes } = await fetchReadData();
  const dailyReadTimes = await fetchDailyRead();

  const books = [];
  let totalHighlights = 0;
  let totalThoughts = 0;
  let finished = 0;

  for (const nb of notebooks) {
    const info = nb.book || {};
    const bookId = nb.bookId;
    console.log(`- 《${info.title}》 划线${nb.noteCount} 想法${nb.reviewCount}`);
    const [highlights, thoughts] = await Promise.all([fetchBookmarks(bookId), fetchReviews(bookId)]);
    totalHighlights += highlights.length;
    totalThoughts += thoughts.length;
    if (nb.markedStatus === 1) finished++;
    // 最近阅读时间：取该书所有划线和想法 createTime 的最大值（无则 0）
    const maxTs = (arr) => arr.reduce((m, x) => Math.max(m, x.createTime || 0), 0);
    const lastReadAt = Math.max(maxTs(highlights), maxTs(thoughts));
    books.push({
      bookId,
      title: info.title || '未命名',
      author: (info.author || '').replace(/^[^：]*:/, ''),
      cover: info.cover || '',
      finished: nb.markedStatus === 1,
      progress: Math.round((nb.readingProgress || 0) * 100),
      highlightCount: nb.noteCount ?? highlights.length,
      thoughtCount: nb.reviewCount ?? thoughts.length,
      lastReadAt,
      highlights,
      thoughts,
    });
    await sleep(400);
  }

  const now = new Date();
  const updated = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const result = {
    updated,
    stats: {
      totalBooks: books.length,
      finishedBooks: finished,
      highlights: totalHighlights,
      thoughts: totalThoughts,
      readMinutes,
      readDays,
      yearlyReadTimes: readTimes, // 按年秒数，key=年份时间戳
      dailyReadTimes, // 当月每日秒数，key=当天 0 点时间戳
    },
    books: books.sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0)),
  };

  writeFileSync(new URL('../src/data/weread.json', import.meta.url), JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n== 完成 == 书${result.stats.totalBooks} 划线${totalHighlights} 想法${totalThoughts}`);
  console.log('已写入 src/data/weread.json');
}

main().catch((e) => {
  console.error('同步失败:', e.message);
  process.exit(1);
});
