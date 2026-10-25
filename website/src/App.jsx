import {lazy, Suspense, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {ArrowRight} from '@phosphor-icons/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Backdrop from './components/Backdrop';
import Search from './components/Search';
import {Toaster} from './components/Toast';
import Home from './pages/Home';
import Notes from './pages/Notes';
import About from './pages/About';
import {items, loadFullContent, settings} from './lib/site';
import {bioText, noteSummary, noteTitle, tagLabel, translate, useLang, useT} from './lib/i18n';
import {PAGES_MODE} from './api';

const Article = lazy(() => import('./pages/Article'));
// Opening straight onto an article: fetch its body alongside the article code, not after it.
if (/^#(article|project|log)\//.test(window.location.hash)) loadFullContent().catch(() => {});
const Lab = lazy(() => import('./pages/Lab'));
const Projects = lazy(() => import('./pages/Projects'));
const Ideas = lazy(() => import('./pages/Ideas'));
const Workbench = lazy(() => (PAGES_MODE ? import('./pages/Workbench') : import('./Admin')));

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

function describe({page, id}, lang) {
  const t = (key, ...args) => translate(lang, key, ...args);
  const description = t('meta.description');
  const item = items.find(entry => entry.id === id);
  if (item && ['article', 'project', 'log'].includes(page)) return {title: noteTitle(item, lang), description: noteSummary(item, lang)};
  return ({
    home: {title: t('meta.home'), description},
    notes: {title: id ? `${tagLabel(id, lang)} · ${t('meta.notes')}` : t('meta.notes'), description: t('meta.notesDescription')},
    lab: {title: t('meta.lab'), description: t('meta.labDescription')},
    about: {title: t('meta.about'), description: bioText(settings, lang)},
    projects: {title: t('meta.projects'), description: t('meta.projectsDescription')},
    ideas: {title: t('meta.ideas'), description: t('meta.ideasDescription')},
    works: {title: t('meta.projects'), description: t('meta.projectsDescription')},
    admin: {title: t('meta.admin'), description},
  })[page] || {title: t('meta.missing'), description};
}

function NotFound({article = false}) {
  const t = useT();
  return <div className="container page empty-page">
    <h1 className="page-title" tabIndex={-1}>{t(article ? 'notFound.article' : 'notFound.title')}</h1>
    <p className="page-lede">{t('notFound.text')}</p>
    <div className="button-row"><a className="button button-primary" href="#notes">{t('hero.read')}<ArrowRight size={18} aria-hidden="true"/></a><a className="button button-secondary" href="#">{t('notFound.home')}</a></div>
  </div>;
}

function Page({location}) {
  const {page, id, section} = location;
  if (page === 'home') return <Home/>;
  if (page === 'notes') return <Notes topic={id || '全部'}/>;
  if (page === 'about') return <About/>;
  if (page === 'lab') return <Lab/>;
  if (page === 'projects' || page === 'works') return <Projects focus={page === 'projects' ? id : undefined}/>;
  if (page === 'ideas') return <Ideas focus={id}/>;
  if (page === 'admin') return <Workbench onUpdated={() => {}}/>;
  if (['article', 'project', 'log'].includes(page)) {
    const item = items.find(entry => entry.id === id && entry.kind === page);
    return item ? <Article key={item.id} item={item} section={section}/> : <NotFound article/>;
  }
  return <NotFound/>;
}

export function App() {
  const [location, setLocation] = useState(parse);
  const lang = useLang(), t = useT();
  const [search, setSearch] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const searchRef = useRef(null), mainRef = useRef(null), previousPage = useRef(null);
  const pageKey = ['notes', 'projects'].includes(location.page) ? location.page : `${location.page}/${location.id || ''}`;

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
    const {title, description} = describe(location, lang);
    document.title = location.page === 'home' ? title : `${title} · m0NSYuke`;
    setMeta('description', description);
    setMeta('og:title', document.title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('robots', location.page === 'admin' ? 'noindex' : 'index,follow');
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
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
  }, [location, pageKey, lang]);

  return <>
    <Backdrop paused={location.page === 'lab' || location.page === 'admin'}/>
    <a href="#main" className="skip-link" onClick={event => { event.preventDefault(); const heading = mainRef.current?.querySelector('h1'); (heading || mainRef.current)?.focus(); heading?.scrollIntoView({block: 'center'}); }}>{t('skip')}</a>
    <Header route={location.route} onSearch={() => setSearch(true)} searchRef={searchRef}/>
    <main id="main" ref={mainRef} tabIndex={-1}>
      <div className="page-transition" key={pageKey}>
        <Suspense fallback={<div className="container page page-loading" role="status">{t('loading')}</div>}>
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
