import {ArrowRight, ArrowUpRight} from '@phosphor-icons/react';
import Picture from './Picture';
import Reveal from './Reveal';
import {articleHref, articles, chapterHref, chapters, directions, formatDate, readingMinutes, settings} from '../lib/site';
import {chapterLabel, directionDescription, directionName, noteSummary, noteTitle, tagLabel, useLang, useT} from '../lib/i18n';

export function TagPill({tag}) {
  const lang = useLang();
  return <span className="tag-pill">{tagLabel(tag, lang)}</span>;
}

export function NoteMeta({item}) {
  const t = useT();
  return <p className="note-meta">
    <time dateTime={item.date}>{formatDate(item.date)}</time>
    <span aria-hidden="true">·</span>
    <span>{t('note.minutes', readingMinutes(item))}</span>
  </p>;
}

// Editorial card: image, tag and date, serif title, two-line summary.
export function NoteCard({item, headingLevel: Heading = 'h3'}) {
  const lang = useLang(), t = useT();
  return <a className="note-card" href={articleHref(item)}>
    <div className="note-card-media">
      <Picture file={item.image} sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw" width={480} height={300}/>
    </div>
    <div className="note-card-body">
      <div className="note-card-top"><TagPill tag={item.tag}/><span>{t(`section.${item.section}`)}</span></div>
      <Heading className="note-card-title">{noteTitle(item, lang)}</Heading>
      <p className="note-card-summary">{noteSummary(item, lang)}</p>
      <div className="note-card-foot"><NoteMeta item={item}/><span className="note-card-read">{t('note.read')}<ArrowUpRight size={16} aria-hidden="true"/></span></div>
    </div>
  </a>;
}

export function NoteGrid({notes, headingLevel, listRef}) {
  return <Reveal as="ul" stagger className="note-grid" role="list" ref={listRef}>
    {notes.map(item => <li key={item.id} data-id={item.id}><NoteCard item={item} headingLevel={headingLevel}/></li>)}
  </Reveal>;
}

export function DirectionCards({headingLevel: Heading = 'h3'}) {
  const lang = useLang(), t = useT();
  return <Reveal as="ul" stagger className="direction-cards" role="list">
    {directions.map((direction, index) => {
      const count = articles.filter(item => item.tag === direction.tag).length;
      return <li key={direction.tag}>
        <a className="direction-card" href={`#notes/${encodeURIComponent(direction.tag)}`}>
          <span className="direction-index">{String(index + 1).padStart(2, '0')}</span>
          <Heading className="direction-tag">{tagLabel(direction.tag, lang)}</Heading>
          <span className="direction-name">{directionName(direction, lang)}</span>
          <p>{directionDescription(direction, lang)}</p>
          <span className="direction-count">{t('notes.count', count)}<ArrowRight size={16} aria-hidden="true"/></span>
        </a>
      </li>;
    })}
  </Reveal>;
}

// Each direction is a line that starts at its learning framework; the stops are the chapters
// to be written. Lines draw themselves in and a light travels along them.
export function KnowledgeMap() {
  const lang = useLang(), t = useT();
  const rows = directions.map(direction => ({direction, stops: chapters().filter(chapter => chapter.direction === direction)})).filter(row => row.stops.length);
  if (!rows.length) return null;
  return <section className="knowledge-map" aria-labelledby="map-title">
    <Reveal className="section-head">
      <h2 id="map-title" className="section-title">{t('map.title')}</h2>
      <p className="section-lede">{t('map.lede')}</p>
    </Reveal>
    <Reveal as="ol" stagger className="map-lines" role="list">
      {rows.map(({direction, stops}) => <li key={direction.tag} className="map-line">
        <a className="map-origin" href={articleHref(stops[0].item)}>
          <span className="map-origin-dot" aria-hidden="true"/>
          <span className="map-origin-tag">{tagLabel(direction.tag, lang)}</span>
          <span className="map-origin-label">{t('map.framework')}</span>
        </a>
        <div className="map-track">
          <span className="map-rail" aria-hidden="true"><span className="map-pulse"/></span>
          <ol className="map-stops" role="list">
            {stops.map((stop, index) => <li key={stop.name} style={{'--s': index}}>
              <a className="map-stop" href={chapterHref(stop.item, stop.name)}>
                <span className="map-stop-dot" aria-hidden="true"/>
                <span className="map-stop-label">{chapterLabel(stop.name, lang)}</span>
              </a>
            </li>)}
          </ol>
        </div>
      </li>)}
    </Reveal>
  </section>;
}

// Two rows of chapter links drifting in opposite directions; hover or focus pauses them.
export function ChapterStream() {
  const lang = useLang(), t = useT();
  const all = chapters();
  if (!all.length) return null;
  const half = Math.ceil(all.length / 2);
  const rows = [all.slice(0, half), all.slice(half).concat(all.slice(0, Math.max(0, half - (all.length - half))))];
  const chip = (chapter, copy) => <li key={`${chapter.item.id}-${chapter.name}-${copy}`} aria-hidden={copy > 0 || undefined}>
    <a className="stream-chip" href={chapterHref(chapter.item, chapter.name)} tabIndex={copy > 0 ? -1 : undefined}>
      <span className="stream-tag">{tagLabel(chapter.direction.tag, lang)}</span>{chapterLabel(chapter.name, lang)}<ArrowUpRight size={14} aria-hidden="true"/>
    </a>
  </li>;
  return <section className="chapter-stream" aria-labelledby="stream-title">
    <Reveal className="section-head">
      <h2 id="stream-title" className="section-title">{t('notes.explore')}</h2>
      <p className="section-lede">{t('notes.exploreLede')}</p>
    </Reveal>
    <Reveal className="stream-rows">
      {rows.map((row, index) => <div key={index} className={`stream-row ${index ? 'reverse' : ''}`}>
        {/* Four copies, shifted by one copy per loop, so the row never runs out at any width. */}
        <ul role="list" className="stream-track">{[0, 1, 2, 3].flatMap(copy => row.map(chapter => chip(chapter, copy)))}</ul>
      </div>)}
    </Reveal>
  </section>;
}

// Vertical timeline used on the home page and the about page.
export function Timeline() {
  const t = useT();
  const launched = articles.reduce((min, item) => (item.date < min ? item.date : min), articles[0]?.date || '');
  const entries = [
    settings.university && {label: t('timeline.study'), title: t('timeline.studyText', settings)},
    {label: t('timeline.focus'), title: t('timeline.focusText'), tags: directions.map(direction => direction.tag)},
    launched && {label: formatDate(launched).slice(0, 7), title: t('timeline.launch'), text: t('timeline.launchText', articles.filter(item => item.section === 'foundation').length)},
    chapters().length && {label: t('timeline.next'), title: t('timeline.nextText', chapters().length), next: true},
  ].filter(Boolean);
  return <Reveal as="ol" stagger className="timeline" role="list">
    {entries.map(entry => <li key={entry.title} className={`timeline-item ${entry.next ? 'is-next' : ''}`}>
      <span className="timeline-dot" aria-hidden="true"/>
      <span className="timeline-label">{entry.label}</span>
      <p className="timeline-title">{entry.title}</p>
      {entry.text && <p className="timeline-text">{entry.text}</p>}
      {entry.tags && <ul className="timeline-tags" role="list">{entry.tags.map(tag => <li key={tag}><TagPill tag={tag}/></li>)}</ul>}
    </li>)}
  </Reveal>;
}
