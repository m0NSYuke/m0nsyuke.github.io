import {ArrowUpRight, BookOpen, Copy, EnvelopeSimple, GithubLogo, Rss} from '@phosphor-icons/react';
import Logo from '../components/Logo';
import Reveal from '../components/Reveal';
import {copyText} from '../components/Toast';
import {articles, directions, INTRO, noteCount, RSS_URL, settings} from '../lib/site';

export default function About() {
  const education = [settings.university, settings.major].filter(Boolean).join(' · ');
  return <div className="container page about">
    <header className="about-hero">
      <div className="about-mark" aria-hidden="true"><Logo size={160}/></div>
      <div>
        <h1 className="page-title" tabIndex={-1}>关于我</h1>
        <p className="about-name">m0NSYuke</p>
        <p className="about-intro">{INTRO}</p>
        <p className="about-bio">{settings.bio}</p>
      </div>
    </header>

    <Reveal as="section" className="about-section" aria-labelledby="interests-title">
      <h2 id="interests-title" className="about-heading">研究兴趣</h2>
      <ul className="interest-list" role="list">
        {directions.map(direction => <li key={direction.tag}>
          <a href={`#notes/${encodeURIComponent(direction.tag)}`}>
            <strong>{direction.tag}</strong>
            <span>{direction.description}</span>
            <small>{noteCount(articles.filter(item => item.tag === direction.tag).length)}</small>
          </a>
        </li>)}
      </ul>
    </Reveal>

    {education && <Reveal as="section" className="about-section" aria-labelledby="education-title">
      <h2 id="education-title" className="about-heading">教育经历</h2>
      <dl className="facts">
        <div><dt>学校</dt><dd>{settings.university}</dd></div>
        {settings.major && <div><dt>专业</dt><dd>{settings.major}</dd></div>}
        {settings.educationPeriod && <div><dt>时间</dt><dd>{settings.educationPeriod}</dd></div>}
      </dl>
    </Reveal>}

    <Reveal as="section" className="about-section" aria-labelledby="contact-title">
      <h2 id="contact-title" className="about-heading">联系方式</h2>
      <p className="about-contact-note">欢迎交流论文、实验或任何还没有答案的问题。</p>
      <ul className="contact-row" role="list">
        {settings.email && <li className="contact-email">
          <a className="button button-secondary" href={`mailto:${settings.email}`}><EnvelopeSimple size={18} aria-hidden="true"/>{settings.email}</a>
          <button type="button" className="button button-secondary icon-only" onClick={() => copyText(settings.email, '邮箱已复制')} aria-label="复制邮箱地址"><Copy size={18} aria-hidden="true"/></button>
        </li>}
        {settings.github && <li><a className="button button-secondary" href={settings.github} target="_blank" rel="noreferrer"><GithubLogo size={18} aria-hidden="true"/>GitHub<ArrowUpRight size={14} aria-hidden="true"/></a></li>}
        {settings.xiaohongshu && <li><a className="button button-secondary" href={settings.xiaohongshu} target="_blank" rel="noreferrer"><BookOpen size={18} aria-hidden="true"/>小红书<ArrowUpRight size={14} aria-hidden="true"/></a></li>}
        <li><a className="button button-secondary" href={RSS_URL} target="_blank" rel="noreferrer"><Rss size={18} aria-hidden="true"/>RSS 订阅</a></li>
      </ul>
    </Reveal>
  </div>;
}
