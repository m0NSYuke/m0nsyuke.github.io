import {useEffect, useId, useRef, useState} from 'react';
import {ArrowRight, MagnifyingGlass, X} from '@phosphor-icons/react';
import {articleHref, directions, items, loadFullContent, sectionLabel} from '../lib/site';

const CLOSE_MS = 150;

function highlight(text, query) {
  if (!query) return text;
  const lower = text.toLowerCase(), needle = query.toLowerCase(), parts = [];
  let start = 0, index;
  while ((index = lower.indexOf(needle, start)) !== -1) {
    parts.push(text.slice(start, index), <mark key={index}>{text.slice(index, index + needle.length)}</mark>);
    start = index + needle.length;
  }
  parts.push(text.slice(start));
  return parts;
}

// Short excerpt around the first match in the body, so body-only hits are explained.
function excerpt(body, query) {
  const index = body.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return '';
  const clean = body.replace(/[#>*`_\-]+/g, ' ');
  const at = clean.toLowerCase().indexOf(query.toLowerCase());
  return (at > 24 ? '…' : '') + clean.slice(Math.max(0, at - 24), at + query.length + 40).replace(/\s+/g, ' ').trim() + '…';
}

export default function Search({open, onClose, triggerRef}) {
  const dialog = useRef(null), input = useRef(null), returnFocus = useRef(null);
  const [query, setQuery] = useState(''), [active, setActive] = useState(0), [bodies, setBodies] = useState({}), [closing, setClosing] = useState(false);
  const listId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (open && !element.open) {
      returnFocus.current = document.activeElement;
      setQuery(''); setActive(0); setClosing(false);
      element.showModal();
      document.documentElement.classList.add('scroll-locked');
      input.current?.focus();
      loadFullContent().then(data => setBodies(Object.fromEntries(data.items.map(item => [item.id, item.body])))).catch(() => {});
    } else if (!open && element.open) {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      setClosing(true);
      const timer = setTimeout(() => {
        element.close();
        setClosing(false);
        document.documentElement.classList.remove('scroll-locked');
        const target = returnFocus.current?.isConnected ? returnFocus.current : triggerRef.current;
        target?.focus({preventScroll: true});
      }, reduced ? 0 : CLOSE_MS);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const normalized = query.trim();
  const results = normalized ? items.map(item => {
    const haystack = `${item.title} ${item.summary} ${item.tag}`.toLowerCase();
    const body = bodies[item.id] || '';
    const inMeta = haystack.includes(normalized.toLowerCase());
    const inBody = !inMeta && body.toLowerCase().includes(normalized.toLowerCase());
    return inMeta || inBody ? {item, snippet: inBody ? excerpt(body, normalized) : ''} : null;
  }).filter(Boolean).slice(0, 8) : [];
  const visit = item => { window.location.hash = articleHref(item).slice(1); onClose(); };
  const keydown = event => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(value => (value + 1) % results.length); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(value => (value - 1 + results.length) % results.length); }
    else if (event.key === 'Enter') { event.preventDefault(); visit(results[Math.min(active, results.length - 1)].item); }
  };
  useEffect(() => { setActive(0); }, [normalized]);
  useEffect(() => { document.getElementById(`${listId}-${active}`)?.scrollIntoView({block: 'nearest'}); }, [active]);

  return <dialog ref={dialog} className={`search-dialog ${closing ? 'is-closing' : ''}`} aria-modal="true" aria-labelledby="search-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="search-panel">
      <h2 id="search-title" className="visually-hidden">搜索网站</h2>
      <div className="search-field">
        <MagnifyingGlass size={20} aria-hidden="true"/>
        <input ref={input} type="search" role="combobox" aria-expanded={results.length > 0} aria-controls={listId} aria-activedescendant={results.length ? `${listId}-${active}` : undefined} aria-autocomplete="list" aria-label="搜索笔记" placeholder="搜索笔记、方向或关键词" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={keydown} autoComplete="off" spellCheck="false"/>
        <button type="button" className="icon-button" onClick={onClose} aria-label="关闭搜索"><X size={20} aria-hidden="true"/></button>
      </div>
      <div className="search-body">
        {normalized && results.length > 0 && <>
          <p className="search-label" aria-live="polite">{results.length} 条结果</p>
          <ul id={listId} role="listbox" aria-label="搜索结果" className="search-results">
            {results.map(({item, snippet}, index) => <li key={item.id} id={`${listId}-${index}`} role="option" aria-selected={index === active} className="search-result" onClick={() => visit(item)} onMouseMove={() => setActive(index)}>
              <span className="search-result-meta">{item.tag} · {sectionLabel(item.section)}</span>
              <span className="search-result-title">{highlight(item.title, normalized)}</span>
              <span className="search-result-summary">{highlight(snippet || item.summary, normalized)}</span>
            </li>)}
          </ul>
        </>}
        {normalized && !results.length && <div className="search-empty">
          <p className="search-empty-title" aria-live="polite">没有找到「{normalized}」</p>
          <p>试试按研究方向浏览：</p>
        </div>}
        {(!normalized || !results.length) && <ul className="search-directions" role="list">
          {directions.map(direction => <li key={direction.tag}><a href={`#notes/${encodeURIComponent(direction.tag)}`} onClick={onClose}><strong>{direction.tag}</strong><span>{direction.name}</span><ArrowRight size={16} aria-hidden="true"/></a></li>)}
        </ul>}
      </div>
      <footer className="search-foot" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span><kbd>Esc</kbd> 关闭</span>
      </footer>
    </div>
  </dialog>;
}
