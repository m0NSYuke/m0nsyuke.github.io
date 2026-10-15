import {useEffect, useRef, useState} from 'react';
import {ArrowRight, ArrowUpRight} from '@phosphor-icons/react';
import HomeRipple from '../components/HomeRipple';
import Picture from '../components/Picture';
import Reveal from '../components/Reveal';
import {DirectionCards, NoteRow, Roadmap} from '../components/Notes';
import {articles, INTRO, settings} from '../lib/site';

const LINES = [['cmd', 'whoami'], ['out', 'm0NSYuke / learning in public'], ['cmd', 'open ./knowledge']];

// Types once per browser session; otherwise (and with reduced motion) shows the full text.
function Terminal() {
  const [typed, setTyped] = useState(() => {
    try { return sessionStorage.getItem('terminal-typed') ? Infinity : 0; } catch { return Infinity; }
  });
  const total = LINES.reduce((sum, [, text]) => sum + text.length, 0);
  useEffect(() => {
    if (typed >= total) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setTyped(Infinity); return; }
    const timer = setTimeout(() => setTyped(value => value + 1), typed === 0 ? 500 : 38);
    if (typed + 1 >= total) try { sessionStorage.setItem('terminal-typed', '1'); } catch {}
    return () => clearTimeout(timer);
  }, [typed, total]);
  let remaining = typed;
  return <div className="terminal" aria-label="终端：whoami，输出 m0NSYuke / learning in public；open ./knowledge" role="img">
    {LINES.map(([kind, text], index) => {
      const shown = text.slice(0, Math.max(0, remaining));
      remaining -= text.length;
      return <p key={index} className={kind} aria-hidden="true">{kind === 'cmd' && <span className="prompt">&gt; </span>}{shown}<span className="ghost">{text.slice(shown.length)}</span></p>;
    })}
    <span className="terminal-caret" aria-hidden="true"/>
  </div>;
}

function HeroArt() {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    const move = event => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)));
        const y = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)));
        element.style.setProperty('--px', `${(x * 6).toFixed(2)}px`);
        element.style.setProperty('--py', `${(y * 6).toFixed(2)}px`);
      });
    };
    window.addEventListener('pointermove', move, {passive: true});
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointermove', move); };
  }, []);
  return <div className="hero-art" ref={ref}>
    <div className="hero-art-inner">
      <Picture file="hero-sculpture.png" alt="" priority sizes="(min-width: 1200px) 420px, (min-width: 768px) 36vw, 42vw" width={560} height={560}/>
    </div>
    <span className="art-coordinate" aria-hidden="true">x: idea<br/>y: code<br/>z: reality</span>
  </div>;
}

function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <HomeRipple/>
    <div className="container">
      <h1 id="hero-title" className="wordmark">m0NSYuke</h1>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-tagline">从理解到行动</p>
          <p className="hero-intro">{INTRO}</p>
          <ul className="hero-topics" role="list" aria-label="研究方向">{settings.description.split(/\s*[·|]\s*/).filter(Boolean).map(topic => <li key={topic}>{topic}</li>)}</ul>
          <div className="button-row">
            <a className="button button-primary" href="#notes">阅读笔记<ArrowRight size={18} aria-hidden="true"/></a>
            <a className="button button-secondary" href="#about">关于我</a>
          </div>
        </div>
        <Terminal/>
        <HeroArt/>
      </div>
    </div>
  </section>;
}

export default function Home() {
  return <>
    <Hero/>
    <section className="section container" aria-labelledby="directions-title">
      <Reveal className="section-head">
        <h2 id="directions-title" className="section-title">研究方向</h2>
        <p className="section-lede">三个方向，各自从一份学习框架开始。</p>
      </Reveal>
      <Reveal>
        <a className="feature-banner" href="#notes" aria-label="查看全部研究方向的笔记">
          <Picture file="featured-morph.png" alt="" sizes="(min-width: 1296px) 1200px, calc(100vw - 2 * var(--gutter))" width={1200} height={466}/>
        </a>
      </Reveal>
      <Reveal><DirectionCards/></Reveal>
    </section>
    <section className="section container home-notes" aria-labelledby="notes-title">
      <Reveal className="section-head">
        <h2 id="notes-title" className="section-title">最新笔记</h2>
        <a className="text-link" href="#notes">全部笔记<ArrowUpRight size={16} aria-hidden="true"/></a>
      </Reveal>
      <Reveal as="ul" className="note-list" role="list">
        {articles.slice(0, 3).map(item => <li key={item.id}><NoteRow item={item}/></li>)}
      </Reveal>
      <Reveal><Roadmap/></Reveal>
    </section>
    <section className="section container home-about" aria-labelledby="about-title">
      <Reveal className="home-about-inner">
        <h2 id="about-title" className="section-title">关于我</h2>
        <div>
          <p className="home-about-bio">{settings.bio}</p>
          <p className="home-about-facts">{[settings.university, settings.major].filter(Boolean).join(' · ')}</p>
          <a className="button button-secondary" href="#about">关于我<ArrowRight size={18} aria-hidden="true"/></a>
        </div>
      </Reveal>
    </section>
  </>;
}
