import {ArrowUpRight, BookOpen, Copy, GithubLogo, Rss} from '@phosphor-icons/react';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';
import {TagPill, Timeline} from '../components/Notes';
import {copyText} from '../components/Toast';
import {articles, directions, RSS_URL, settings} from '../lib/site';
import {bioText, directionDescription, directionName, tagLabel, useLang, useT} from '../lib/i18n';

export default function About() {
  const lang = useLang(), t = useT();
  return <div className="container page about">
    <header className="about-hero">
      <div className="about-copy">
        <p className="eyebrow">{t('about.eyebrow')}</p>
        <h1 className="about-title" tabIndex={-1}>{t('about.hello')}</h1>
        <p className="about-intro">{t('about.intro')}</p>
        <p className="about-bio">{bioText(settings, lang)}</p>
      </div>
      <div className="about-mark" aria-hidden="true">
        <span className="about-orbit"/>
        <span className="about-orbit about-orbit-2"/>
        <Logo size={120}/>
      </div>
    </header>

    <section className="about-block" aria-labelledby="interests-title">
      <Reveal className="about-block-head"><h2 id="interests-title" className="section-title">{t('about.interests')}</h2></Reveal>
      <Reveal as="ul" stagger className="interest-list" role="list">
        {directions.map((direction, index) => {
          const count = articles.filter(item => item.tag === direction.tag).length;
          return <li key={direction.tag}>
            <a className="interest" href={`#notes/${encodeURIComponent(direction.tag)}`}>
              <span className="interest-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="interest-tag">{tagLabel(direction.tag, lang)}</span>
              <span className="interest-copy">
                <strong>{directionName(direction, lang)}</strong>
                <span>{directionDescription(direction, lang)}</span>
              </span>
              <span className="interest-count">{t('notes.count', count)}<ArrowUpRight size={18} aria-hidden="true"/></span>
            </a>
          </li>;
        })}
      </Reveal>
    </section>

    <section className="about-block about-path" aria-labelledby="path-title">
      <Reveal className="about-block-head"><h2 id="path-title" className="section-title">{t('about.path')}</h2></Reveal>
      <Timeline/>
    </section>

    <section className="about-block about-contact" aria-labelledby="contact-title">
      <Reveal className="contact-card">
        <h2 id="contact-title" className="contact-title">{t('about.contact')}</h2>
        <p className="contact-lede">{t('about.contactLede')}</p>
        {settings.email && <div className="contact-email">
          <a href={`mailto:${settings.email}`}>{settings.email}</a>
          <button type="button" className="button button-secondary icon-only" onClick={() => copyText(settings.email, t('about.emailCopied'))} aria-label={t('about.copyEmail')}><Copy size={18} aria-hidden="true"/></button>
        </div>}
        <ul className="contact-row" role="list">
          {settings.github && <li><a className="button button-secondary" href={settings.github} target="_blank" rel="noreferrer"><GithubLogo size={18} aria-hidden="true"/>GitHub<ArrowUpRight size={14} aria-hidden="true"/></a></li>}
          {settings.xiaohongshu && <li><a className="button button-secondary" href={settings.xiaohongshu} target="_blank" rel="noreferrer"><BookOpen size={18} aria-hidden="true"/>{t('about.xhs')}<ArrowUpRight size={14} aria-hidden="true"/></a></li>}
          <li><a className="button button-secondary" href={RSS_URL} target="_blank" rel="noreferrer"><Rss size={18} aria-hidden="true"/>{t('about.rss')}</a></li>
        </ul>
        <ul className="contact-tags" role="list" aria-hidden="true">{directions.map(direction => <li key={direction.tag}><TagPill tag={direction.tag}/></li>)}</ul>
      </Reveal>
    </section>
  </div>;
}
