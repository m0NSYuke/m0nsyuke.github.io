import {lazy, Suspense, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {ArrowRight} from '@phosphor-icons/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Search from './components/Search';
import {Toaster} from './components/Toast';
import Home from './pages/Home';
import Notes from './pages/Notes';
import About from './pages/About';
import {articleHref, items, loadFullContent, projects, settings} from './lib/site';
import {PAGES_MODE} from './api';

const Article = lazy(() => import('./pages/Article'));
// Opening straight onto an article: fetch its body alongside the article code, not after it.
if (/^#(article|project|log)\//.test(window.location.hash)) loadFullContent().catch(() => {});
const Lab = lazy(() => import('./pages/Lab'));
const Workbench = lazy(() => (PAGES_MODE ? import('./pages/Workbench') : import('./Admin')));

const DESCRIPTION = 'm0NSYuke 的学习笔记：VLA、WAM 与视频生成。四川大学自动化专业，研究具身智能与视频生成。';
const parse = () => {
  const route = decodeURIComponent(window.location.hash.slice(1)) || 'home';
  const [page, id, section] = route.split('/');
  return {route, page: page || 'home', id, section};
};

function setMeta(name, content, attribute = 'name') {
  let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, name); document.head.append(tag); }
  tag.setAttribute('content', content);
}

function describe({page, id}) {
  const item = items.find(entry => entry.id === id);
  if (item && ['article', 'project', 'log'].includes(page)) return {title: item.title, description: item.summary};
  return ({
    home: {title: 'm0NSYuke · 从理解到行动', description: DESCRIPTION},
    notes: {title: id ? `${id} 笔记` : '知识与笔记', description: 'VLA、WAM 与视频生成方向的基础知识和技术笔记。'},
    lab: {title: '实验室', description: '可以直接上手的参数曲面实验。'},
    about: {title: '关于我', description: settings.bio},
    works: {title: '作品', description: '项目整理中。'},
    admin: {title: '内容管理', description: DESCRIPTION},
  })[page] || {title: '页面不存在', description: DESCRIPTION};
}

function NotFound({title = '这里还没有内容。'}) {
  return <div className="container page empty-page">
    <h1 className="page-title" tabIndex={-1}>{title}</h1>
    <p className="page-lede">链接可能已经失效，或者内容还没有发布。</p>
    <div className="button-row"><a className="button button-primary" href="#notes">阅读笔记<ArrowRight size={18} aria-hidden="true"/></a><a className="button button-secondary" href="#">回到首页</a></div>
  </div>;
}

function Works() {
  if (!projects.length) return <div className="container page empty-page">
    <h1 className="page-title" tabIndex={-1}>作品</h1>
    <p className="page-lede">项目还在整理。现在可以先去实验室玩一个参数曲面，或者读读笔记。</p>
    <div className="button-row"><a className="button button-primary" href="#lab">打开实验室<ArrowRight size={18} aria-hidden="true"/></a><a className="button button-secondary" href="#notes">阅读笔记</a></div>
  </div>;
  return <div className="container page">
    <header className="page-head"><h1 className="page-title" tabIndex={-1}>作品</h1></header>
    <ul className="note-list" role="list">{projects.map(item => <li key={item.id}><a className="note-row" href={articleHref(item)}><div className="note-body"><h2 className="note-title">{item.title}</h2><p className="note-summary">{item.summary}</p></div></a></li>)}</ul>
  </div>;
}

function Page({location}) {
  const {page, id, section} = location;
  if (page === 'home') return <Home/>;
  if (page === 'notes') return <Notes topic={id || '全部'}/>;
  if (page === 'about') return <About/>;
  if (page === 'lab') return <Lab/>;
  if (page === 'works') return <Works/>;
  if (page === 'admin') return <Workbench onUpdated={() => {}}/>;
  if (['article', 'project', 'log'].includes(page)) {
    const item = items.find(entry => entry.id === id && entry.kind === page);
    return item ? <Article key={item.id} item={item} section={section}/> : <NotFound title="这篇内容还没有发布。"/>;
  }
  return <NotFound/>;
}

export function App() {
  const [location, setLocation] = useState(parse);
  const [search, setSearch] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const searchRef = useRef(null), mainRef = useRef(null), previousPage = useRef(null);
  const pageKey = location.page === 'notes' ? 'notes' : `${location.page}/${location.id || ''}`;

  useEffect(() => {
    const change = () => setLocation(parse());
    let pending = '';
    const keys = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearch(open => !open); return; }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === '/') { event.preventDefault(); setSearch(true); return; }
      // Maintainers: press g then a to open the content page.
      if (pending === 'g' && event.key === 'a') { window.location.hash = 'admin'; pending = ''; return; }
      pending = event.key === 'g' ? 'g' : '';
    };
    window.addEventListener('hashchange', change);
    window.addEventListener('keydown', keys);
    return () => { window.removeEventListener('hashchange', change); window.removeEventListener('keydown', keys); };
  }, []);

  // Content switches immediately; the CSS entrance animation is only an enhancement.
  useLayoutEffect(() => {
    const {title, description} = describe(location);
    document.title = location.page === 'home' ? title : `${title} · m0NSYuke`;
    setMeta('description', description);
    setMeta('og:title', document.title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('robots', location.page === 'admin' ? 'noindex' : 'index,follow');
    const samePage = previousPage.current === pageKey;
    const firstLoad = previousPage.current === null;
    previousPage.current = pageKey;
    if (samePage) return;
    if (!location.section) window.scrollTo({top: 0, behavior: 'instant'});
    if (firstLoad) return;
    setAnnouncement(document.title);
    // Lazy pages mount a moment later; wait briefly for their heading.
    let tries = 0, frame = 0;
    const focusHeading = () => {
      const heading = mainRef.current?.querySelector('h1');
      if (heading) heading.focus({preventScroll: true});
      else if (tries++ < 60) frame = requestAnimationFrame(focusHeading);
    };
    frame = requestAnimationFrame(focusHeading);
    return () => cancelAnimationFrame(frame);
  }, [location, pageKey]);

  return <>
    <a href="#main" className="skip-link" onClick={event => { event.preventDefault(); const heading = mainRef.current?.querySelector('h1'); (heading || mainRef.current)?.focus(); heading?.scrollIntoView({block: 'center'}); }}>跳到主要内容</a>
    <Header route={location.route} onSearch={() => setSearch(true)} searchRef={searchRef}/>
    <main id="main" ref={mainRef} tabIndex={-1}>
      <div className="page-transition" key={pageKey}>
        <Suspense fallback={<div className="container page page-loading" role="status">正在加载…</div>}>
          <Page location={location}/>
        </Suspense>
      </div>
    </main>
    <Footer/>
    <Search open={search} onClose={() => setSearch(false)} triggerRef={searchRef}/>
    <Toaster/>
    <p className="visually-hidden" aria-live="polite" aria-atomic="true">{announcement}</p>
  </>;
}
