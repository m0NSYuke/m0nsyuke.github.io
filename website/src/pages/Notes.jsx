import {useLayoutEffect, useRef} from 'react';
import {ChapterStream, NoteGrid} from '../components/Notes';
import {articles, directions} from '../lib/site';
import {tagLabel, useLang, useT} from '../lib/i18n';

const FILTERS = ['全部', ...directions.map(direction => direction.tag)];

// FLIP: snapshot row positions before the filter changes, animate from them after.
function useFlip(listRef, key) {
  const positions = useRef(new Map());
  const snapshot = () => {
    const list = listRef.current;
    positions.current = new Map(list ? [...list.children].map(element => [element.dataset.id, element.getBoundingClientRect()]) : []);
  };
  useLayoutEffect(() => {
    const list = listRef.current, before = positions.current;
    positions.current = new Map();
    if (!list || !before.size || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (const element of list.children) {
      if (!element.animate) continue;
      const from = before.get(element.dataset.id), now = element.getBoundingClientRect();
      if (!from) element.animate([{opacity: 0, transform: 'scale(0.96)'}, {opacity: 1, transform: 'none'}], {duration: 400, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)'});
      else if (from.top !== now.top || from.left !== now.left) element.animate([{transform: `translate(${from.left - now.left}px, ${from.top - now.top}px)`}, {transform: 'none'}], {duration: 400, easing: 'cubic-bezier(0.2, 0, 0, 1)'});
    }
  }, [key]);
  return snapshot;
}

export default function Notes({topic}) {
  const lang = useLang(), t = useT();
  const filter = FILTERS.includes(topic) ? topic : '全部';
  const listRef = useRef(null);
  const data = articles.filter(item => filter === '全部' || item.tag === filter);
  const snapshot = useFlip(listRef, filter);
  const select = tag => { snapshot(); window.location.hash = tag === '全部' ? 'notes' : `notes/${encodeURIComponent(tag)}`; };
  const keydown = event => {
    const index = FILTERS.indexOf(filter);
    const next = {ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: FILTERS.length - 1}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const group = event.currentTarget;
    const tag = FILTERS[(next + FILTERS.length) % FILTERS.length];
    select(tag);
    requestAnimationFrame(() => group.querySelector(`[data-tag="${tag}"]`)?.focus());
  };
  return <div className="container page">
    <header className="page-head">
      <h1 className="page-title" tabIndex={-1}>{t('notes.title')}</h1>
      <p className="page-lede">{t('notes.lede')}</p>
    </header>
    <div className="segmented" role="radiogroup" aria-label={t('notes.filter')} onKeyDown={keydown}>
      {FILTERS.map(tag => {
        const count = tag === '全部' ? articles.length : articles.filter(item => item.tag === tag).length;
        return <button key={tag} type="button" role="radio" data-tag={tag} aria-checked={filter === tag} tabIndex={filter === tag ? 0 : -1} onClick={() => select(tag)}>
          {tag === '全部' ? t('notes.all') : tagLabel(tag, lang)}<span className="segmented-count">{count}</span>
        </button>;
      })}
    </div>
    <p className="visually-hidden" aria-live="polite">{t('notes.live', filter === '全部' ? '' : tagLabel(filter, lang), data.length)}</p>
    {data.length ? <NoteGrid notes={data} headingLevel="h2" listRef={listRef}/> : <div className="empty-note"><p>{t('notes.empty')}</p></div>}
    <div className="section"><ChapterStream/></div>
  </div>;
}
