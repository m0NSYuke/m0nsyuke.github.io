import {useEffect, useState} from 'react';
import {LinkSimple} from '@phosphor-icons/react';
import '../styles/article.css';
import '../styles/ideas.css';
import {copyText} from '../components/Toast';
import {IDEA_STATUSES, SITE_URL, formatDate, ideas} from '../lib/site';
import {renderArticle} from '../lib/markdown';
import {useT} from '../lib/i18n';

const FILTERS = ['all', ...IDEA_STATUSES];
const TAGS = [...new Set(ideas.flatMap(idea => idea.tags))];

// Bodies are rendered once with the article pipeline (KaTeX and code only load when used).
function useRendered() {
  const [html, setHtml] = useState({});
  useEffect(() => {
    let live = true;
    Promise.all(ideas.map(idea => renderArticle({...idea, kind: 'ideas'}).then(({html}) => [idea.id, html])))
      .then(entries => { if (live) setHtml(Object.fromEntries(entries)); })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  return html;
}

function Idea({idea, html, focused}) {
  const t = useT();
  return <li className="idea" id={`idea-${idea.id}`} data-status={idea.status} data-focused={focused || undefined}>
    <span className="idea-dot" aria-hidden="true"/>
    <article aria-labelledby={`idea-${idea.id}-title`}>
      <p className="idea-meta">
        <time dateTime={idea.date}>{formatDate(idea.date)}</time>
        <span className="idea-status">{t(`ideas.status.${idea.status}`)}</span>
        {idea.sample && <span className="idea-sample">{t('ideas.sample')}</span>}
      </p>
      <h3 id={`idea-${idea.id}-title`} className="idea-title">
        <a href={`#ideas/${idea.id}`}>{idea.title}</a>
        <button type="button" className="icon-button idea-link" aria-label={t('ideas.link')} title={t('ideas.link')} onClick={() => copyText(`${SITE_URL}/#ideas/${idea.id}`, t('ideas.copied'))}>
          <LinkSimple size={16} aria-hidden="true"/>
        </button>
      </h3>
      {html
        ? <div className="prose idea-body" dangerouslySetInnerHTML={{__html: html}}/>
        : <p className="idea-body idea-body-plain">{idea.body.replace(/[#*`>_]/g, '').slice(0, 280)}</p>}
      {idea.tags.length > 0 && <ul className="idea-tags" role="list">{idea.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
    </article>
  </li>;
}

export default function Ideas({focus}) {
  const t = useT();
  const html = useRendered();
  const [status, setStatus] = useState('all'), [tag, setTag] = useState(null);
  const shown = ideas.filter(idea => (status === 'all' || idea.status === status) && (!tag || idea.tags.includes(tag)));
  // Group the stream by month, newest first.
  const months = [];
  for (const idea of shown) {
    const key = idea.date.slice(0, 7);
    if (months.at(-1)?.key !== key) months.push({key, ideas: []});
    months.at(-1).ideas.push(idea);
  }
  useEffect(() => {
    if (!focus) return;
    setStatus('all'); setTag(null);
    const frame = requestAnimationFrame(() => document.getElementById(`idea-${focus}`)?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center'}));
    return () => cancelAnimationFrame(frame);
  }, [focus]);
  const keydown = event => {
    const index = FILTERS.indexOf(status);
    const next = {ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: FILTERS.length - 1}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const value = FILTERS[(next + FILTERS.length) % FILTERS.length];
    setStatus(value);
    const group = event.currentTarget;
    requestAnimationFrame(() => group.querySelector(`[data-status="${value}"]`)?.focus());
  };
  return <div className="container page ideas-page">
    <header className="page-head">
      <p className="eyebrow">{t('ideas.eyebrow')}</p>
      <h1 className="page-title" tabIndex={-1}>{t('ideas.title')}</h1>
      <p className="page-lede">{t('ideas.lede')}</p>
    </header>
    <div className="ideas-filters">
      <div className="segmented" role="radiogroup" aria-label={t('ideas.filter')} onKeyDown={keydown}>
        {FILTERS.map(value => {
          const count = value === 'all' ? ideas.length : ideas.filter(idea => idea.status === value).length;
          return <button key={value} type="button" role="radio" data-status={value} aria-checked={status === value} tabIndex={status === value ? 0 : -1} onClick={() => setStatus(value)}>
            {value !== 'all' && <span className="idea-swatch" data-status={value} aria-hidden="true"/>}
            {value === 'all' ? t('ideas.all') : t(`ideas.status.${value}`)}<span className="segmented-count">{count}</span>
          </button>;
        })}
      </div>
      {TAGS.length > 1 && <ul className="idea-tag-filter" role="list" aria-label={t('ideas.tags')}>
        {TAGS.map(value => <li key={value}><button type="button" aria-pressed={tag === value} onClick={() => setTag(tag === value ? null : value)}>{value}</button></li>)}
      </ul>}
    </div>
    <p className="visually-hidden" aria-live="polite">{t('ideas.live', shown.length)}</p>
    {months.length ? <ol className="idea-stream" role="list">
      {months.map(month => <li key={month.key} className="idea-month">
        <h2 className="idea-month-title">{t('ideas.month', ...month.key.split('-'))}</h2>
        <ol role="list">{month.ideas.map(idea => <Idea key={idea.id} idea={idea} html={html[idea.id]} focused={focus === idea.id}/>)}</ol>
      </li>)}
    </ol> : <div className="empty-note"><p>{t('ideas.empty')}</p></div>}
  </div>;
}
