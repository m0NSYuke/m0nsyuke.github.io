// Chinese / English interface strings and English versions of the published notes' metadata.
// Note bodies stay in Chinese; content.json is unchanged.
import {useSyncExternalStore} from 'react';

const KEY = 'lang';
const listeners = new Set();

function initial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {}
  return /^zh/i.test(navigator.language || 'zh') ? 'zh' : 'en';
}

let current = typeof window === 'undefined' ? 'zh' : initial();

export const getLang = () => current;
export function setLang(lang) {
  if (lang === current) return;
  current = lang;
  try { localStorage.setItem(KEY, lang); } catch {}
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  listeners.forEach(listener => listener());
}
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export const useLang = () => useSyncExternalStore(subscribe, getLang, getLang);

const strings = {
  zh: {
    skip: '跳到主要内容',
    loading: '正在加载…',
    'nav.home': '首页', 'nav.notes': '知识与笔记', 'nav.lab': '实验室', 'nav.about': '关于',
    'nav.main': '主导航', 'nav.menu': '菜单', 'nav.openMenu': '打开菜单', 'nav.closeMenu': '关闭菜单',
    'search.button': '搜索', 'search.aria': key => `搜索网站（${key}）`,
    'theme.group': '颜色模式', 'theme.system': '跟随系统', 'theme.light': '浅色', 'theme.dark': '深色',
    'lang.switch': 'Switch to English', 'lang.short': 'EN', 'lang.name': 'English',
    tagline: '从理解到行动',
    'hero.topics': '研究方向', 'hero.read': '阅读笔记', 'hero.about': '关于我',
    'terminal.label': '终端：whoami，输出 m0NSYuke / learning in public；open ./knowledge',
    'home.directions': '研究方向', 'home.directionsLede': '从规则的结构出发，经过扭转与扰动，最后长成一张会起伏的曲面。三个方向，也是这样一点点展开的。',
    'home.latest': '最新笔记', 'home.allNotes': '全部笔记',
    'home.about': '关于我', 'home.aboutLede': '一条还很短、正在延长的时间线。',
    'morph.label': '形态演变：从立方体到曲面',
    'morph.stages': ['结构', '扭转', '扰动', '曲面'],
    'morph.play': '播放演变', 'morph.pause': '暂停演变',
    'map.title': '研究地图', 'map.lede': '每条线从一份学习框架出发，沿途的站点是接下来要写的章节。点任意一站，直接读到那一节。',
    'map.origin': '起点', 'map.framework': '学习框架',
    'timeline.study': '求学', 'timeline.studyText': (s) => `${s.university} · ${s.major}专业`,
    'timeline.focus': '方向', 'timeline.focusText': '具身智能与视频生成',
    'timeline.launch': '网站上线', 'timeline.launchText': n => `写下 VLA、WAM 与视频生成的 ${n} 份学习框架`,
    'timeline.next': '下一步', 'timeline.nextText': n => `沿着研究地图，补全 ${n} 个章节`,
    'notes.title': '知识与笔记', 'notes.lede': 'VLA、WAM 与视频生成。基础知识是地图，技术笔记是走过的路。',
    'notes.filter': '按方向筛选', 'notes.all': '全部',
    'notes.count': n => `${n} 篇笔记`, 'notes.live': (tag, n) => tag ? `${tag}：${n} 篇笔记` : `全部 ${n} 篇笔记`,
    'notes.empty': '这个方向的第一篇笔记还在写。',
    'notes.explore': '沿着章节继续读', 'notes.exploreLede': '所有方向的章节都在这里流动。悬停暂停，点一个就跳到那一节。',
    'note.minutes': n => `${n} 分钟`, 'note.read': '阅读',
    'section.foundation': '基础知识', 'section.blog': '技术博客',
    'about.eyebrow': '关于', 'about.title': '关于我', 'about.hello': '你好，我是 m0NSYuke。',
    'about.intro': '四川大学自动化专业，研究具身智能与视频生成。',
    'about.interests': '研究兴趣', 'about.path': '经历', 'about.contact': '一起聊聊',
    'about.contactLede': '欢迎交流论文、实验，或者任何还没有答案的问题。',
    'about.copyEmail': '复制邮箱地址', 'about.emailCopied': '邮箱已复制', 'about.rss': 'RSS 订阅', 'about.xhs': '小红书',
    'footer.line': '保持好奇，继续构建。', 'footer.explore': '浏览', 'footer.follow': '关注', 'footer.mail': '邮件',
    'search.title': '搜索网站', 'search.input': '搜索笔记', 'search.placeholder': '搜索笔记、方向或关键词', 'search.close': '关闭搜索',
    'search.count': n => `${n} 条结果`, 'search.results': '搜索结果', 'search.none': q => `没有找到「${q}」`,
    'search.browse': '试试按研究方向浏览：', 'search.select': '选择', 'search.open': '打开', 'search.esc': '关闭',
    'article.all': '全部笔记', 'article.minutes': n => `约 ${n} 分钟`, 'article.updated': '更新于', 'article.growing': '持续更新中',
    'article.toc': '目录', 'article.tocTitle': '本页目录', 'article.tocLabel': '文章目录', 'article.loading': '正在加载正文',
    'article.pager': '上一篇和下一篇', 'article.prev': '上一篇', 'article.next': '下一篇',
    'article.moreTag': tag => `更多 ${tag} 笔记`, 'article.others': '其他方向的笔记',
    'article.copied': '代码已复制', 'article.copiedShort': '已复制', 'article.copy': '复制', 'article.linkCopied': '小节链接已复制',
    'article.anchor': text => `复制「${text}」的链接`, 'article.footnotes': '脚注', 'article.backref': '回到正文',
    'article.onlyZh': '', 'article.table': '表格',
    'article.loadError': '内容暂时无法加载，请刷新重试。',
    'lab.title': '实验室', 'lab.lede': '把一个参数改变，看看会发生什么。这里放可以直接上手的小实验，作品整理好后也会放在这里。',
    'lab.heading': '给想法一个形状', 'lab.desc': '改变参数，观察一个简单的公式如何变成可见的结构。',
    'lab.canvas': '实时参数曲面。用方向键旋转视角，或用鼠标拖动、滚轮缩放。', 'lab.help': '拖动或用方向键旋转 · 滚轮缩放',
    'lab.amplitude': '波幅', 'lab.frequency': '频率', 'lab.speed': '速度', 'lab.resume': '继续', 'lab.pause': '暂停', 'lab.reset': '重置参数',
    'lab.noWebgl': '当前设备无法使用 WebGL。你仍然可以浏览笔记。', 'lab.failed': '实验没有加载成功。刷新页面再试一次。',
    'works.title': '作品', 'works.empty': '项目还在整理。现在可以先去实验室玩一个参数曲面，或者读读笔记。', 'works.lab': '打开实验室',
    'notFound.title': '这里还没有内容。', 'notFound.article': '这篇内容还没有发布。', 'notFound.text': '链接可能已经失效，或者内容还没有发布。', 'notFound.home': '回到首页',
    'meta.home': 'm0NSYuke · 从理解到行动', 'meta.description': 'm0NSYuke 的学习笔记：VLA、WAM 与视频生成。四川大学自动化专业，研究具身智能与视频生成。',
    'meta.notes': '知识与笔记', 'meta.notesDescription': 'VLA、WAM 与视频生成方向的基础知识和技术笔记。',
    'meta.lab': '实验室', 'meta.labDescription': '可以直接上手的参数曲面实验。', 'meta.about': '关于我', 'meta.works': '作品', 'meta.admin': '内容管理', 'meta.missing': '页面不存在',
    copied: '已复制',
  },
  en: {
    skip: 'Skip to main content',
    loading: 'Loading…',
    'nav.home': 'Home', 'nav.notes': 'Notes', 'nav.lab': 'Lab', 'nav.about': 'About',
    'nav.main': 'Main', 'nav.menu': 'Menu', 'nav.openMenu': 'Open menu', 'nav.closeMenu': 'Close menu',
    'search.button': 'Search', 'search.aria': key => `Search the site (${key})`,
    'theme.group': 'Color mode', 'theme.system': 'System', 'theme.light': 'Light', 'theme.dark': 'Dark',
    'lang.switch': '切换到中文', 'lang.short': '中', 'lang.name': '中文',
    tagline: 'From understanding to action',
    'hero.topics': 'Research areas', 'hero.read': 'Read the notes', 'hero.about': 'About me',
    'terminal.label': 'Terminal: whoami prints m0NSYuke / learning in public; open ./knowledge',
    'home.directions': 'Research areas', 'home.directionsLede': 'Start from a regular structure, twist it, disturb it, and it grows into a rolling surface. The three areas unfold the same way, one step at a time.',
    'home.latest': 'Latest notes', 'home.allNotes': 'All notes',
    'home.about': 'About me', 'home.aboutLede': 'A short timeline that is still growing.',
    'morph.label': 'Form study: from a cube to a surface',
    'morph.stages': ['Structure', 'Twist', 'Noise', 'Surface'],
    'morph.play': 'Play the morph', 'morph.pause': 'Pause the morph',
    'map.title': 'Research map', 'map.lede': 'Each line starts from a learning framework; the stops along it are the chapters still to be written. Pick any stop to jump to that section.',
    'map.origin': 'Start', 'map.framework': 'Framework',
    'timeline.study': 'Study', 'timeline.studyText': () => 'Sichuan University · Automation',
    'timeline.focus': 'Focus', 'timeline.focusText': 'Embodied AI and video generation',
    'timeline.launch': 'Site launched', 'timeline.launchText': n => `Wrote ${n} learning frameworks for VLA, WAM and video generation`,
    'timeline.next': 'Next', 'timeline.nextText': n => `Fill in the ${n} chapters on the research map`,
    'notes.title': 'Notes', 'notes.lede': 'VLA, WAM and video generation. The fundamentals are the map; the technical notes are the road travelled.',
    'notes.filter': 'Filter by area', 'notes.all': 'All',
    'notes.count': n => `${n} ${n === 1 ? 'note' : 'notes'}`, 'notes.live': (tag, n) => tag ? `${tag}: ${n} ${n === 1 ? 'note' : 'notes'}` : `All ${n} notes`,
    'notes.empty': 'The first note in this area is still being written.',
    'notes.explore': 'Keep reading by chapter', 'notes.exploreLede': 'Chapters from every area drift by here. Hover to pause; pick one to jump straight to it.',
    'note.minutes': n => `${n} min read`, 'note.read': 'Read',
    'section.foundation': 'Fundamentals', 'section.blog': 'Blog',
    'about.eyebrow': 'About', 'about.title': 'About me', 'about.hello': 'Hi, I’m m0NSYuke.',
    'about.intro': 'I study Automation at Sichuan University and research embodied AI and video generation.',
    'about.interests': 'Research interests', 'about.path': 'Path', 'about.contact': 'Let’s talk',
    'about.contactLede': 'Happy to discuss papers, experiments, or any question that does not have an answer yet.',
    'about.copyEmail': 'Copy email address', 'about.emailCopied': 'Email copied', 'about.rss': 'RSS feed', 'about.xhs': 'Xiaohongshu',
    'footer.line': 'Stay curious. Keep building.', 'footer.explore': 'Explore', 'footer.follow': 'Follow', 'footer.mail': 'Email',
    'search.title': 'Search the site', 'search.input': 'Search notes', 'search.placeholder': 'Search notes, areas or keywords', 'search.close': 'Close search',
    'search.count': n => `${n} ${n === 1 ? 'result' : 'results'}`, 'search.results': 'Search results', 'search.none': q => `Nothing found for “${q}”`,
    'search.browse': 'Try browsing by area:', 'search.select': 'Select', 'search.open': 'Open', 'search.esc': 'Close',
    'article.all': 'All notes', 'article.minutes': n => `${n} min read`, 'article.updated': 'Updated', 'article.growing': 'Growing note',
    'article.toc': 'Contents', 'article.tocTitle': 'On this page', 'article.tocLabel': 'Table of contents', 'article.loading': 'Loading the note',
    'article.pager': 'Previous and next notes', 'article.prev': 'Previous', 'article.next': 'Next',
    'article.moreTag': tag => `More ${tag} notes`, 'article.others': 'Notes from other areas',
    'article.copied': 'Code copied', 'article.copiedShort': 'Copied', 'article.copy': 'Copy', 'article.linkCopied': 'Section link copied',
    'article.anchor': text => `Copy link to “${text}”`, 'article.footnotes': 'Footnotes', 'article.backref': 'Back to text',
    'article.onlyZh': 'This note is written in Chinese.', 'article.table': 'Table',
    'article.loadError': 'The content could not be loaded. Refresh to try again.',
    'lab.title': 'Lab', 'lab.lede': 'Change one parameter and see what happens. Small hands-on experiments live here, and finished projects will too.',
    'lab.heading': 'Give an idea a shape', 'lab.desc': 'Adjust the parameters and watch a simple formula become a visible structure.',
    'lab.canvas': 'Live parametric surface. Rotate with the arrow keys, drag with the mouse, scroll to zoom.', 'lab.help': 'Drag or use arrow keys to rotate · scroll to zoom',
    'lab.amplitude': 'Amplitude', 'lab.frequency': 'Frequency', 'lab.speed': 'Speed', 'lab.resume': 'Resume', 'lab.pause': 'Pause', 'lab.reset': 'Reset',
    'lab.noWebgl': 'This device cannot run WebGL. You can still read the notes.', 'lab.failed': 'The experiment did not load. Refresh the page to try again.',
    'works.title': 'Projects', 'works.empty': 'Projects are still being put together. Meanwhile, play with a surface in the lab or read the notes.', 'works.lab': 'Open the lab',
    'notFound.title': 'Nothing here yet.', 'notFound.article': 'This note has not been published.', 'notFound.text': 'The link may be outdated, or the content is not published yet.', 'notFound.home': 'Back to home',
    'meta.home': 'm0NSYuke · From understanding to action', 'meta.description': 'Notes by m0NSYuke on VLA, WAM and video generation: embodied AI and video generation research at Sichuan University.',
    'meta.notes': 'Notes', 'meta.notesDescription': 'Fundamentals and technical notes on VLA, WAM and video generation.',
    'meta.lab': 'Lab', 'meta.labDescription': 'A hands-on parametric surface experiment.', 'meta.about': 'About me', 'meta.works': 'Projects', 'meta.admin': 'Content', 'meta.missing': 'Page not found',
    copied: 'Copied',
  },
};

export function translate(lang, key, ...args) {
  const value = strings[lang][key] ?? strings.zh[key] ?? key;
  return typeof value === 'function' ? value(...args) : value;
}
export function useT() {
  const lang = useLang();
  return (key, ...args) => translate(lang, key, ...args);
}
export const t = (key, ...args) => translate(current, key, ...args);

// English metadata for the published notes, tags and chapters. Missing entries fall back to Chinese.
const notes = {
  'video-foundations': {title: 'Video generation: understanding time and motion', summary: 'From image representations to temporal modeling: a learning path for reading papers and putting them into practice.'},
  'vla-foundations': {title: 'VLA: from perception to action', summary: 'Following the thread of vision, language and action to build my own map of the fundamentals.'},
  'wam-foundations': {title: 'WAM: connecting prediction and action', summary: 'Questions about state, action and prediction around the WAM models I study.'},
};
const tags = {'视频生成': 'Video generation'};
const chapters = {
  '基础准备': 'Foundations', '模型阅读': 'Reading models', '数据与评估': 'Data and evaluation',
  '问题定义': 'Problem definition', '表示与建模': 'Representation and modeling', '训练与验证': 'Training and validation',
  '图像与生成基础': 'Image and generation basics', '时序与运动': 'Time and motion', '论文与实践': 'Papers and practice',
};
const directionText = {
  VLA: {name: 'Perceive, understand, act', description: 'Vision, language and action, from basic concepts to reading models.'},
  WAM: {name: 'Finding action in prediction', description: 'Model definitions, state representations, training and evaluation, linking questions to notes.'},
  '视频生成': {name: 'Giving time a shape', description: 'From image generation to time and motion, notes from papers and practice.'},
};

export const noteTitle = (item, lang) => (lang === 'en' && notes[item.id]?.title) || item.title;
export const noteSummary = (item, lang) => (lang === 'en' && notes[item.id]?.summary) || item.summary;
export const tagLabel = (tag, lang) => (lang === 'en' && tags[tag]) || tag;
export const chapterLabel = (name, lang) => (lang === 'en' && chapters[name]) || name;
export const directionName = (direction, lang) => (lang === 'en' && directionText[direction.tag]?.name) || direction.name;
export const directionDescription = (direction, lang) => (lang === 'en' && directionText[direction.tag]?.description) || direction.description;
export const bioText = (settings, lang) => lang === 'en'
  ? 'I focus on VLA, WAM and video generation. Here I collect the fundamentals, the questions that come up while reading, and technical notes as they take shape.'
  : settings.bio;

// Every string the display serif can render, so the build can subset the font to it.
export function serifText() {
  const values = [];
  const walk = value => {
    if (typeof value === 'string') values.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (typeof value === 'function') { try { walk(value(0, 0)); walk(value({university: '', major: ''})); } catch {} }
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(strings); walk(notes); walk(tags); walk(chapters); walk(directionText);
  return values.join('');
}
