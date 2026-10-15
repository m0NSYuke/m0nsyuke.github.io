import {useLayoutEffect, useRef} from 'react';
import {NoteRow, Roadmap} from '../components/Notes';
import {articles, directions} from '../lib/site';

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
      if (!from) element.animate([{opacity: 0}, {opacity: 1}], {duration: 250, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)'});
      else if (from.top !== now.top) element.animate([{transform: `translateY(${from.top - now.top}px)`}, {transform: 'none'}], {duration: 400, easing: 'cubic-bezier(0.2, 0, 0, 1)'});
    }
  }, [key]);
  return snapshot;
}

export default function Notes({topic}) {
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
      <h1 className="page-title" tabIndex={-1}>知识与笔记</h1>
      <p className="page-lede">VLA、WAM 与视频生成。基础知识是地图，技术笔记是走过的路。</p>
    </header>
    <div className="segmented" role="radiogroup" aria-label="按方向筛选" onKeyDown={keydown}>
      {FILTERS.map(tag => {
        const count = tag === '全部' ? articles.length : articles.filter(item => item.tag === tag).length;
        return <button key={tag} type="button" role="radio" data-tag={tag} aria-checked={filter === tag} tabIndex={filter === tag ? 0 : -1} onClick={() => select(tag)}>
          {tag}<span className="segmented-count">{count}</span>
        </button>;
      })}
    </div>
    <p className="visually-hidden" aria-live="polite">{filter === '全部' ? `全部 ${data.length} 篇笔记` : `${filter}：${data.length} 篇笔记`}</p>
    {data.length ? <ul className="note-list note-list-large" role="list" ref={listRef}>
      {data.map(item => <li key={item.id} data-id={item.id}><NoteRow item={item} headingLevel="h2"/></li>)}
    </ul> : <div className="empty-note"><p>这个方向的第一篇笔记还在写。</p></div>}
    <Roadmap tag={filter}/>
  </div>;
}
