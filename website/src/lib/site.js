import index from '../generated-content.json';
import images from '../generated-images.json';

export const BASE = import.meta.env.BASE_URL;
export const REPOSITORY = import.meta.env.VITE_SITE_REPOSITORY || '';
export const SITE_URL = 'https://m0nsyuke.github.io';
export const RSS_URL = `${BASE}rss.xml`;
export const CONTENT_URL = `${BASE}data/content.json`;
export const INTRO = '四川大学自动化专业，研究具身智能与视频生成。';
export const ROADMAP_UNTIL = 6;

export const settings = index.settings;
export const items = index.items;
export const articles = items.filter(item => item.kind === 'article');
export const projects = items.filter(item => item.kind === 'project');

export const directions = [
  {tag: 'VLA', name: '感知，理解，行动', description: '视觉、语言与动作，从基础概念走向模型阅读。'},
  {tag: 'WAM', name: '在预测中寻找行动', description: '围绕模型定义、状态表示与训练评估，连接问题与笔记。'},
  {tag: '视频生成', name: '让时间拥有形状', description: '从图像生成到时序与运动，记录论文和实践中的理解。'},
];

export const sectionLabel = section => (section === 'foundation' ? '基础知识' : '技术博客');
export const formatDate = date => date.replaceAll('-', '.');
export const noteCount = count => `${count} 篇笔记`;
// About 400 Chinese characters a minute; never report less than one minute.
export const readingMinutes = item => Math.max(1, Math.round((item.chars || 0) / 400));
export const articleHref = item => `#${item.kind}/${item.id}`;

const imageName = file => (file || '').replace(/\.png$/, '');
export function imageSources(file, fallback = 'note-wave.png') {
  const name = imageName(file) || imageName(fallback);
  const meta = images[name];
  if (!meta) return null;
  const set = ext => meta.widths.map(width => `${BASE}assets/img/${name}-${width}.${ext} ${width}w`).join(', ');
  const largest = meta.widths[meta.widths.length - 1];
  return {
    avif: set('avif'),
    webp: set('webp'),
    src: `${BASE}assets/img/${name}-${largest}.webp`,
    ratio: meta.width / meta.height,
  };
}

let contentPromise;
// Full content (with Markdown bodies) is only needed by the article page and search.
export function loadFullContent() {
  contentPromise ||= fetch(CONTENT_URL).then(response => {
    if (!response.ok) throw new Error('内容暂时无法加载，请刷新重试。');
    return response.json();
  }).catch(error => {
    contentPromise = undefined;
    throw error;
  });
  return contentPromise;
}

export const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgentData?.platform || navigator.platform || '');
