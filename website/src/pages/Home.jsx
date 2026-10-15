import {useEffect, useRef, useState} from 'react';
import {ArrowRight, ArrowUpRight} from '@phosphor-icons/react';
import Morph from '../components/Morph';
import Picture from '../components/Picture';
import Reveal from '../components/Reveal';
import {DirectionCards, KnowledgeMap, NoteGrid, TagPill, Timeline} from '../components/Notes';
import {articles, directions} from '../lib/site';
import {useT} from '../lib/i18n';

const LINES = [['cmd', 'whoami'], ['out', 'm0NSYuke / learning in public'], ['cmd', 'open ./knowledge']];

// Types once per browser session; otherwise (and with reduced motion) shows the full text.
function Terminal() {
  const t = useT();
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
  return <div className="terminal" aria-label={t('terminal.label')} role="img">
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
  const t = useT();
  return <section className="hero" aria-labelledby="hero-title">
    <div className="container">
      <h1 id="hero-title" className="wordmark">m0NSYuke</h1>
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="hero-tagline">{t('tagline')}</p>
          <ul className="hero-topics" role="list" aria-label={t('hero.topics')}>{directions.map(direction => <li key={direction.tag}><TagPill tag={direction.tag}/></li>)}</ul>
          <div className="button-row">
            <a className="button button-primary" href="#notes">{t('hero.read')}<ArrowRight size={18} aria-hidden="true"/></a>
            <a className="button button-secondary" href="#about">{t('hero.about')}</a>
          </div>
        </div>
        <Terminal/>
        <HeroArt/>
      </div>
    </div>
  </section>;
}

export default function Home() {
  const t = useT();
  return <>
    <Hero/>
    <section className="section container" aria-labelledby="directions-title">
      <Reveal className="section-head">
        <h2 id="directions-title" className="section-title">{t('home.directions')}</h2>
        <p className="section-lede">{t('home.directionsLede')}</p>
      </Reveal>
      <Reveal><Morph/></Reveal>
      <DirectionCards/>
    </section>
    <section className="section container" aria-labelledby="notes-title">
      <Reveal className="section-head section-head-row">
        <h2 id="notes-title" className="section-title">{t('home.latest')}</h2>
        <a className="text-link" href="#notes">{t('home.allNotes')}<ArrowUpRight size={16} aria-hidden="true"/></a>
      </Reveal>
      <NoteGrid notes={articles.slice(0, 3)}/>
    </section>
    <div className="section container"><KnowledgeMap/></div>
    <section className="section container home-about" aria-labelledby="about-title">
      <Reveal className="home-about-head">
        <h2 id="about-title" className="section-title">{t('home.about')}</h2>
        <p className="section-lede">{t('home.aboutLede')}</p>
        <a className="button button-secondary" href="#about">{t('hero.about')}<ArrowRight size={18} aria-hidden="true"/></a>
      </Reveal>
      <Timeline/>
    </section>
  </>;
}
