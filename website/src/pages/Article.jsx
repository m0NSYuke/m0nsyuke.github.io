import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, CaretDown} from '@phosphor-icons/react';
import '@fontsource/newsreader/latin-500.css';
import '../styles/article.css';
import {NoteRow, TagPill} from '../components/Notes';
import {copyText} from '../components/Toast';
import {articleHref, articles, formatDate, loadFullContent, readingMinutes, sectionLabel, SITE_URL} from '../lib/site';
import {renderArticle} from '../lib/markdown';

function useReadingProgress(ref) {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const total = rect.height - innerHeight * .6;
      const value = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      document.documentElement.style.setProperty('--reading-progress', value.toFixed(4));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); document.documentElement.style.removeProperty('--reading-progress'); };
  }, [ref]);
}

function useActiveHeading(container, headings) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!headings.length || !container.current) return;
    const elements = headings.map(heading => container.current.querySelector(`#${CSS.escape(heading.id)}`)).filter(Boolean);
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id));
      const first = elements.find(element => visible.has(element.id));
      if (first) setActive(first.id);
      else {
        const above = elements.filter(element => element.getBoundingClientRect().top < 120);
        setActive(above.length ? above[above.length - 1].id : elements[0].id);
      }
    }, {rootMargin: '-80px 0px -60% 0px'});
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);
  return active;
}

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (!element) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({behavior: reduced ? 'instant' : 'smooth', block: 'start'});
  element.setAttribute('tabindex', '-1');
  element.focus({preventScroll: true});
}

function Toc({item, headings, active, mobile = false}) {
  const links = headings.map(heading => <li key={heading.id} className={`toc-level-${heading.level}`}>
    <a href={`#${item.kind}/${item.id}/${heading.id}`} aria-current={active === heading.id ? 'location' : undefined} onClick={event => {
      event.preventDefault();
      history.replaceState(null, '', `#${item.kind}/${item.id}/${heading.id}`);
      scrollToSection(heading.id);
      if (mobile) event.currentTarget.closest('details')?.removeAttribute('open');
    }}>{heading.text}</a>
  </li>);
  if (mobile) return <details className="toc-mobile"><summary>目录<CaretDown size={16} aria-hidden="true"/></summary><nav aria-label="文章目录"><ol role="list">{links}</ol></nav></details>;
  return <nav className="toc" aria-label="文章目录"><p className="toc-title">本页目录</p><ol role="list">{links}</ol></nav>;
}

export default function Article({item, section}) {
  const [state, setState] = useState({status: 'loading', html: '', headings: []});
  const articleRef = useRef(null), bodyRef = useRef(null);
  useReadingProgress(articleRef);
  const active = useActiveHeading(bodyRef, state.headings);

  useEffect(() => {
    let cancelled = false;
    setState({status: 'loading', html: '', headings: []});
    loadFullContent()
      .then(data => data.items.find(entry => entry.id === item.id))
      .then(full => renderArticle(full || item))
      .then(result => { if (!cancelled) setState({status: 'ready', ...result}); })
      .catch(error => { if (!cancelled) setState({status: 'error', html: '', headings: [], error: error.message}); });
    return () => { cancelled = true; };
  }, [item.id]);

  useEffect(() => {
    if (state.status === 'ready' && section) requestAnimationFrame(() => scrollToSection(section));
  }, [state.status, section]);

  // Copy buttons and heading anchors inside the rendered Markdown.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const click = event => {
      const copy = event.target.closest('.copy-code');
      if (copy) {
        const code = copy.closest('.code-block').querySelector('code').innerText;
        copyText(code, '代码已复制');
        copy.textContent = '已复制';
        clearTimeout(copy.timer);
        copy.timer = setTimeout(() => { copy.textContent = '复制'; }, 1500);
        return;
      }
      const anchor = event.target.closest('.heading-anchor');
      if (anchor) {
        event.preventDefault();
        const hash = anchor.getAttribute('href');
        history.replaceState(null, '', hash);
        copyText(`${SITE_URL}/${hash}`, '小节链接已复制');
        scrollToSection(anchor.dataset.anchor);
      }
    };
    body.addEventListener('click', click);
    return () => body.removeEventListener('click', click);
  }, [state.html]);

  const ordered = useMemo(() => [...articles].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)), []);
  const index = ordered.findIndex(entry => entry.id === item.id);
  const previous = ordered[index - 1], next = ordered[index + 1];
  const related = articles.filter(entry => entry.tag === item.tag && entry.id !== item.id).slice(0, 3);
  const others = related.length ? related : articles.filter(entry => entry.id !== item.id && entry !== previous && entry !== next).slice(0, 2);

  return <div className="article-page">
    <div className="reading-progress" aria-hidden="true"/>
    <article className="container article" ref={articleRef} aria-labelledby="article-title">
      <a className="back-link" href="#notes"><ArrowLeft size={18} aria-hidden="true"/>全部笔记</a>
      <header className="article-head">
        <div className="article-meta">
          <TagPill>{item.tag}</TagPill>
          <span>{sectionLabel(item.section)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={item.date}>{formatDate(item.date)}</time>
          <span aria-hidden="true">·</span>
          <span>约 {readingMinutes(item)} 分钟</span>
          {item.updated && <><span aria-hidden="true">·</span><span>更新于 <time dateTime={item.updated}>{formatDate(item.updated)}</time></span></>}
        </div>
        <h1 id="article-title" className="article-title" tabIndex={-1}>{item.title}</h1>
        <p className="article-lede">{item.summary}</p>
        {item.sample && <p className="status-label"><span aria-hidden="true">🌱</span>持续更新中</p>}
      </header>
      <div className="article-layout">
        <div className="article-main">
          {state.headings.length > 1 && <Toc item={item} headings={state.headings} active={active} mobile/>}
          {state.status === 'loading' && <div className="prose-skeleton" role="status"><span className="visually-hidden">正在加载正文</span><i/><i/><i/><i/></div>}
          {state.status === 'error' && <p className="notice" role="alert">{state.error}</p>}
          <div className="prose" ref={bodyRef} dangerouslySetInnerHTML={{__html: state.html}}/>
        </div>
        {state.headings.length > 1 && <aside className="article-aside"><Toc item={item} headings={state.headings} active={active}/></aside>}
      </div>
      <nav className="article-pager" aria-label="上一篇和下一篇">
        {previous ? <a className="pager-link" href={articleHref(previous)}><span><ArrowLeft size={16} aria-hidden="true"/>上一篇</span><strong>{previous.title}</strong></a> : <span/>}
        {next ? <a className="pager-link next" href={articleHref(next)}><span>下一篇<ArrowRight size={16} aria-hidden="true"/></span><strong>{next.title}</strong></a> : <span/>}
      </nav>
      {others.length > 0 && <section className="related" aria-labelledby="related-title">
        <h2 id="related-title" className="related-title">{related.length ? `更多 ${item.tag} 笔记` : '其他方向的笔记'}</h2>
        <ul className="note-list" role="list">{others.map(entry => <li key={entry.id}><NoteRow item={entry}/></li>)}</ul>
      </section>}
    </article>
  </div>;
}
