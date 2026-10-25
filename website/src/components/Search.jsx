import {useEffect, useId, useRef, useState} from 'react';
import {ArrowRight, MagnifyingGlass, X} from '@phosphor-icons/react';
import {articleHref, directions, ideas, items, loadFullContent} from '../lib/site';
import {directionName, noteSummary, noteTitle, tagLabel, useLang, useT} from '../lib/i18n';

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
  const lang = useLang(), t = useT();
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
  const needle = normalized.toLowerCase();
  // Articles and idea notes in one list: {key, href, meta, title, summary}.
  const results = normalized ? [...items.map(item => {
    const haystack = `${item.title} ${item.summary} ${item.tag} ${noteTitle(item, lang)} ${noteSummary(item, lang)} ${tagLabel(item.tag, lang)}`.toLowerCase();
    const body = bodies[item.id] || '';
    const inMeta = haystack.includes(needle);
    const inBody = !inMeta && body.toLowerCase().includes(needle);
    return inMeta || inBody ? {key: item.id, href: articleHref(item), meta: `${tagLabel(item.tag, lang)} · ${t(`section.${item.section}`)}`, title: noteTitle(item, lang), summary: inBody ? excerpt(body, normalized) : noteSummary(item, lang)} : null;
  }), ...ideas.map(idea => {
    const inMeta = `${idea.title} ${idea.tags.join(' ')}`.toLowerCase().includes(needle);
    if (!inMeta && !idea.body.toLowerCase().includes(needle)) return null;
    return {key: `idea-${idea.id}`, href: `#ideas/${idea.id}`, meta: `${t('nav.ideas')} · ${t(`ideas.status.${idea.status}`)}`, title: idea.title, summary: excerpt(idea.body, normalized) || idea.body.replace(/[#*`>_\-]+/g, ' ').replace(/\s+/g, ' ').slice(0, 80)};
  })].filter(Boolean).slice(0, 8) : [];
  const visit = result => { window.location.hash = result.href.slice(1); onClose(); };
  const keydown = event => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(value => (value + 1) % results.length); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(value => (value - 1 + results.length) % results.length); }
    else if (event.key === 'Enter') { event.preventDefault(); visit(results[Math.min(active, results.length - 1)]); }
  };
  useEffect(() => { setActive(0); }, [normalized]);
  useEffect(() => { document.getElementById(`${listId}-${active}`)?.scrollIntoView({block: 'nearest'}); }, [active]);

  return <dialog ref={dialog} className={`search-dialog ${closing ? 'is-closing' : ''}`} aria-modal="true" aria-labelledby="search-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="search-panel">
      <h2 id="search-title" className="visually-hidden">{t('search.title')}</h2>
      <div className="search-field">
        <MagnifyingGlass size={20} aria-hidden="true"/>
        <input ref={input} type="search" role="combobox" aria-expanded={results.length > 0} aria-controls={listId} aria-activedescendant={results.length ? `${listId}-${active}` : undefined} aria-autocomplete="list" aria-label={t('search.input')} placeholder={t('search.placeholder')} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={keydown} autoComplete="off" spellCheck="false"/>
        <button type="button" className="icon-button" onClick={onClose} aria-label={t('search.close')}><X size={20} aria-hidden="true"/></button>
      </div>
      <div className="search-body">
        {normalized && results.length > 0 && <>
          <p className="search-label" aria-live="polite">{t('search.count', results.length)}</p>
          <ul id={listId} role="listbox" aria-label={t('search.results')} className="search-results">
            {results.map((result, index) => <li key={result.key} id={`${listId}-${index}`} role="option" aria-selected={index === active} className="search-result" onClick={() => visit(result)} onMouseMove={() => setActive(index)}>
              <span className="search-result-meta">{result.meta}</span>
              <span className="search-result-title">{highlight(result.title, normalized)}</span>
              <span className="search-result-summary">{highlight(result.summary, normalized)}</span>
            </li>)}
          </ul>
        </>}
        {normalized && !results.length && <div className="search-empty">
          <p className="search-empty-title" aria-live="polite">{t('search.none', normalized)}</p>
          <p>{t('search.browse')}</p>
        </div>}
        {(!normalized || !results.length) && <ul className="search-directions" role="list">
          {directions.map(direction => <li key={direction.tag}><a href={`#notes/${encodeURIComponent(direction.tag)}`} onClick={onClose}><strong>{tagLabel(direction.tag, lang)}</strong><span>{directionName(direction, lang)}</span><ArrowRight size={16} aria-hidden="true"/></a></li>)}
        </ul>}
      </div>
      <footer className="search-foot" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> {t('search.select')}</span><span><kbd>Enter</kbd> {t('search.open')}</span><span><kbd>Esc</kbd> {t('search.esc')}</span>
      </footer>
    </div>
  </dialog>;
}
