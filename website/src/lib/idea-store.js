// Writing idea notes from the site itself: drafts (text and pasted images) stay in
// this browser's IndexedDB until published; publishing commits the Markdown file and
// its images to the site repository in one commit, which redeploys the site.
import {REPOSITORY} from './site';

const DB = 'm0-ideas', TOKEN_KEY = 'm0.ideas.githubToken';
const IDEAS_DIR = 'website/content/ideas', MEDIA_DIR = 'website/public';
export const MEDIA_PREFIX = '/ideas-media/';

// --- IndexedDB: two stores, drafts (by key) and media (blob by site path).
let opened;
function db() {
  opened ||= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => { request.result.createObjectStore('drafts'); request.result.createObjectStore('media'); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return opened;
}
async function run(store, mode, action) {
  const tx = (await db()).transaction(store, mode);
  const request = action(tx.objectStore(store));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
}
export const getDraft = key => run('drafts', 'readonly', store => store.get(key));
export const putDraft = (key, value) => run('drafts', 'readwrite', store => store.put(value, key));
export const deleteDraft = key => run('drafts', 'readwrite', store => store.delete(key));
export const getMedia = path => run('media', 'readonly', store => store.get(path));
export const putMedia = (path, blob) => run('media', 'readwrite', store => store.put(blob, path));
export const deleteMedia = paths => run('media', 'readwrite', store => paths.forEach(path => store.delete(path)));

// --- Pasted images: scaled to at most 1600 px and re-encoded, so the repository stays small.
export async function compressImage(file) {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return {blob: file, ext: file.type === 'image/gif' ? 'gif' : 'svg'};
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.86));
  // Browsers without WebP encoding hand back PNG; keep whichever is smaller.
  const best = blob && blob.size < file.size ? blob : file;
  const ext = best.type === 'image/webp' ? 'webp' : best.type === 'image/png' ? 'png' : 'jpg';
  return {blob: best, ext};
}
export const mediaPath = (ideaId, ext) => `${MEDIA_PREFIX}${ideaId}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${ext}`;
export const mediaIn = markdown => [...new Set(markdown.match(/\/ideas-media\/[a-z0-9-]+\/[a-z0-9]+\.(?:webp|png|jpe?g|gif|svg)/g) || [])];

// --- The idea file: a few header lines, then Markdown.
export function ideaFile({title, date, tags, status}, body) {
  const line = value => String(value).replace(/[\r\n]+/g, ' ').trim();
  return `---\ntitle: ${line(title)}\ndate: ${date}\n${tags.length ? `tags: ${tags.map(line).join(', ')}\n` : ''}status: ${status}\n---\n${body.trim()}\n`;
}
export function parseIdeaFile(source) {
  const match = source.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const meta = Object.fromEntries(match[1].split('\n').filter(Boolean).map(line => [line.slice(0, line.indexOf(':')).trim(), line.slice(line.indexOf(':') + 1).trim()]));
  return {title: meta.title || '', date: meta.date || '', tags: (meta.tags || '').split(/[,，]/).map(tag => tag.trim()).filter(Boolean), status: meta.status || '萌芽', sample: meta.sample === 'true', body: match[2].trim()};
}

// --- GitHub: a fine-grained token limited to this repository (Contents: read and write).
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
export const forgetToken = () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ } };
export const hasToken = () => Boolean(getToken());

async function gh(path, {token = getToken(), method = 'GET', body} = {}) {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}${path}`, {
    method,
    headers: {Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(body ? {'Content-Type': 'application/json'} : {})},
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (response.status === 404 && method === 'GET' && path.startsWith('/contents/')) return null;
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    const error = new Error(response.status === 401 ? '令牌无效或已过期，请重新连接。' : response.status === 403 || response.status === 404 ? '令牌没有这个仓库的写入权限。' : detail.message || `GitHub 返回 ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

export async function connect(token) {
  const repo = await gh('', {token: token.trim()});
  if (!repo.permissions?.push) throw new Error('这个令牌只能读取仓库，请给 Contents 选择 Read and write。');
  try { localStorage.setItem(TOKEN_KEY, token.trim()); } catch { throw new Error('浏览器禁止保存数据，无法记住连接。'); }
  return repo;
}

const base64 = async blob => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};
const utf8Base64 = text => base64(new Blob([text]));

// The current file straight from the repository, so edits start from the latest text
// even before the site has redeployed.
export async function loadIdea(id) {
  const file = await gh(`/contents/${IDEAS_DIR}/${id}.md?ref=main`);
  if (!file) return null;
  const bytes = Uint8Array.from(atob(file.content.replace(/\n/g, '')), c => c.charCodeAt(0));
  return parseIdeaFile(new TextDecoder().decode(bytes));
}

// One commit: the idea file, new images, and removal of images no longer used.
export async function publish({id, file, images = [], removed = [], remove = false, message}) {
  for (let attempt = 0; ; attempt++) {
    const ref = await gh('/git/ref/heads/main');
    const head = await gh(`/git/commits/${ref.object.sha}`);
    const tree = [];
    if (remove) tree.push({path: `${IDEAS_DIR}/${id}.md`, mode: '100644', type: 'blob', sha: null});
    else {
      const blob = await gh('/git/blobs', {method: 'POST', body: {content: await utf8Base64(file), encoding: 'base64'}});
      tree.push({path: `${IDEAS_DIR}/${id}.md`, mode: '100644', type: 'blob', sha: blob.sha});
    }
    for (const {path, blob} of images) {
      const uploaded = await gh('/git/blobs', {method: 'POST', body: {content: await base64(blob), encoding: 'base64'}});
      tree.push({path: `${MEDIA_DIR}${path}`, mode: '100644', type: 'blob', sha: uploaded.sha});
    }
    for (const path of removed) tree.push({path: `${MEDIA_DIR}${path}`, mode: '100644', type: 'blob', sha: null});
    const nextTree = await gh('/git/trees', {method: 'POST', body: {base_tree: head.tree.sha, tree}});
    const commit = await gh('/git/commits', {method: 'POST', body: {message, tree: nextTree.sha, parents: [ref.object.sha]}});
    try {
      await gh('/git/refs/heads/main', {method: 'PATCH', body: {sha: commit.sha}});
      return commit;
    } catch (error) {
      // Someone pushed in between: rebuild on the new head once.
      if (error.status !== 422 || attempt > 0) throw error;
    }
  }
}
