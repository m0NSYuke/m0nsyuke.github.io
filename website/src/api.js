export const API = import.meta.env.VITE_API_BASE || '';
export const PAGES_MODE = import.meta.env.VITE_CONTENT_MODE === 'pages';
export const REPOSITORY = import.meta.env.VITE_SITE_REPOSITORY || '';
export const RSS_URL = PAGES_MODE ? `${import.meta.env.BASE_URL}rss.xml` : `${API}/api/rss`;
export const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
export async function request(path, options = {}) {
  if (PAGES_MODE && (path !== '/api/content' || (options.method && options.method !== 'GET'))) throw new Error('内容通过 GitHub 仓库更新。');
  const url = PAGES_MODE ? `${import.meta.env.BASE_URL}data/content.json` : API + path;
  const res = await fetch(url, PAGES_MODE ? {cache:'no-cache'} : { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  let data;
  try { data = await res.json(); } catch { throw new Error('内容服务暂时没有响应，请稍后重试。'); }
  if (!res.ok) throw new Error(data.error || '加载失败，请重试。');
  return data;
}
