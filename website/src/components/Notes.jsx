import {ArrowRight, ArrowUpRight} from '@phosphor-icons/react';
import Picture from './Picture';
import {articleHref, articles, directions, formatDate, noteCount, readingMinutes, ROADMAP_UNTIL, sectionLabel} from '../lib/site';

export function TagPill({children}) {
  return <span className="tag-pill">{children}</span>;
}

export function NoteMeta({item}) {
  return <p className="note-meta">
    <time dateTime={item.date}>{formatDate(item.date)}</time>
    <span aria-hidden="true">·</span>
    <span>{readingMinutes(item)} 分钟</span>
    <span aria-hidden="true">·</span>
    <span>{sectionLabel(item.section)}</span>
  </p>;
}

export function NoteRow({item, headingLevel: Heading = 'h3'}) {
  return <a className="note-row" href={articleHref(item)}>
    <Picture className="note-thumb" file={item.image} sizes="80px" width={80} height={80}/>
    <div className="note-body">
      <TagPill>{item.tag}</TagPill>
      <Heading className="note-title">{item.title}</Heading>
      <p className="note-summary">{item.summary}</p>
      <NoteMeta item={item}/>
    </div>
    <ArrowUpRight className="note-arrow" size={20} aria-hidden="true"/>
  </a>;
}

export function DirectionCards({headingLevel: Heading = 'h3'}) {
  return <ul className="direction-cards" role="list">
    {directions.map(direction => {
      const count = articles.filter(item => item.tag === direction.tag).length;
      return <li key={direction.tag}>
        <a className="direction-card" href={`#notes/${encodeURIComponent(direction.tag)}`}>
          <span className="direction-name">{direction.name}</span>
          <Heading className="direction-tag">{direction.tag}</Heading>
          <p>{direction.description}</p>
          <span className="direction-count">{noteCount(count)}<ArrowRight size={16} aria-hidden="true"/></span>
          <ArrowUpRight className="card-arrow" size={22} aria-hidden="true"/>
        </a>
      </li>;
    })}
  </ul>;
}

// While the archive is small, show what each direction will cover next instead of filler.
export function Roadmap({tag = '全部'}) {
  if (articles.length >= ROADMAP_UNTIL) return null;
  const rows = directions.filter(direction => tag === '全部' || direction.tag === tag).map(direction => {
    const framework = articles.find(item => item.tag === direction.tag && item.section === 'foundation');
    return {direction, framework, next: framework?.sections || []};
  });
  return <section className="roadmap" aria-labelledby="roadmap-title">
    <div className="roadmap-head">
      <h2 id="roadmap-title" className="roadmap-title">正在写的内容</h2>
      <p>网站刚开始搭建，目前只有 {articles.length} 篇笔记。每个方向先写好了学习框架，下面是接下来要逐节补上的部分。</p>
    </div>
    <ol className="roadmap-list" role="list">
      {rows.map(({direction, framework, next}) => <li key={direction.tag}>
        <TagPill>{direction.tag}</TagPill>
        <ul role="list">{next.map(section => <li key={section}><span className="roadmap-dot" aria-hidden="true"/>{section}</li>)}</ul>
        {framework && <a className="text-link" href={articleHref(framework)}>查看学习框架<ArrowRight size={16} aria-hidden="true"/></a>}
      </li>)}
    </ol>
  </section>;
}
