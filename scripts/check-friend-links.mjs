import { writeFileSync } from 'node:fs';
import { friends } from '../src/data/friends.ts';

const TIMEOUT_MS = 10_000;
const USER_AGENT =
  'Mozilla/5.0 (compatible; FriendLinkChecker/1.0; +https://github.com/alfacococo/Blog)';
const REPORT_PATH = 'friend-link-report.json';

async function fetchOnce(url, method) {
  return fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'User-Agent': USER_AGENT },
  });
}

// 有些服务器（尤其是 Vercel/Cloudflare 之类）对 HEAD 请求支持得不好，
// 先试 HEAD，不行的话（包括直接抛错的情况）再退回 GET 兜底一次，
// 避免只是"这台服务器不支持 HEAD"就被误判成链接失效。
async function checkUrl(url) {
  try {
    let res = await fetchOnce(url, 'HEAD');
    if (!res.ok) res = await fetchOnce(url, 'GET');
    return { ok: res.ok, status: res.status };
  } catch {
    try {
      const res = await fetchOnce(url, 'GET');
      return { ok: res.ok, status: res.status };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
}

const results = await Promise.all(
  friends.map(async (friend) => ({
    name: friend.name,
    url: friend.url,
    ...(await checkUrl(friend.url)),
  })),
);

const failures = results.filter((r) => !r.ok);

for (const r of results) {
  if (r.ok) {
    console.log(`✓ ${r.name} (${r.url}) — ${r.status}`);
  } else {
    console.log(`✗ ${r.name} (${r.url}) — ${r.error ?? `HTTP ${r.status}`}`);
  }
}

console.log('');
if (failures.length === 0) {
  console.log(`全部 ${results.length} 个友链均可访问。`);
} else {
  console.log(
    `${results.length} 个友链中有 ${failures.length} 个可能无法访问，建议联系对方确认最新地址：`,
  );
  for (const f of failures) {
    console.log(`  - ${f.name} ${f.url}`);
  }
}

// 这条检查本质是"提醒"而不是"拦截"：外部网站是否可访问不受我们控制，
// 网络抖动或对方服务器临时故障都很常见，不应该因此让 npm run verify /
// CI 失败。真正的脚本错误（比如 friends.ts 读取失败）会在上面直接抛出，
// 不会被这里的兜底逻辑吞掉。
writeFileSync(
  REPORT_PATH,
  JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2),
);
