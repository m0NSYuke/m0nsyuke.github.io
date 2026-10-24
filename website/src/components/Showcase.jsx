import {useEffect, useRef, useState} from 'react';
import {ArrowRight, ArrowUpRight, Pause, Play} from '@phosphor-icons/react';
import Reveal from './Reveal';
import {projectText, showcase} from '../lib/showcase';
import {useLang, useT} from '../lib/i18n';

const asset = name => `/assets/projects/${name}`;
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ProjectShot({name, alt = '', sizes, width, height, wide = true, priority = false}) {
  const set = format => (wide ? `${asset(`${name}-800.${format}`)} 800w, ${asset(`${name}-1600.${format}`)} 1600w` : asset(`${name}.${format}`));
  return <picture>
    <source type="image/avif" srcSet={set('avif')} sizes={wide ? sizes : undefined}/>
    <source type="image/webp" srcSet={set('webp')} sizes={wide ? sizes : undefined}/>
    <img src={wide ? asset(`${name}-1600.webp`) : asset(`${name}.webp`)} alt={alt} width={width} height={height} loading={priority ? 'eager' : 'lazy'} decoding="async"/>
  </picture>;
}

// Counts up once when it scrolls into view; strings (like a time) are shown as they are.
export function CountUp({value, suffix = ''}) {
  const ref = useRef(null);
  const numeric = typeof value === 'number';
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const element = ref.current;
    if (!numeric || !value || reducedMotion() || !('IntersectionObserver' in window)) return;
    if (element.getBoundingClientRect().top < innerHeight) return;
    setShown(0);
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = now => {
        const progress = Math.min(1, (now - start) / 1200);
        setShown(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, {rootMargin: '0px 0px -10% 0px'});
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [numeric, value]);
  return <span ref={ref} className="count-up">{shown}{suffix}</span>;
}

// Muted demo loop that plays only while on screen, with its own pause button.
export function DemoVideo({src, poster, label}) {
  const t = useT();
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const wanted = useRef(!reducedMotion());
  useEffect(() => {
    const video = ref.current;
    if (!video || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && wanted.current) video.play().catch(() => {});
      else video.pause();
    }, {threshold: 0.35});
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  const toggle = () => {
    const video = ref.current;
    wanted.current = video.paused;
    if (video.paused) video.play().catch(() => {}); else video.pause();
  };
  return <div className="demo-video">
    <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-label={label}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}/>
    <button type="button" className="icon-button demo-toggle" onClick={toggle} aria-label={playing ? t('projects.pause') : t('projects.play')}>
      {playing ? <Pause size={18} weight="fill" aria-hidden="true"/> : <Play size={18} weight="fill" aria-hidden="true"/>}
    </button>
  </div>;
}

// The prompts that started each project, typed one after another.
export function PromptTicker() {
  const t = useT();
  const prompts = t('projects.prompts');
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(() => (reducedMotion() ? Infinity : 0));
  const text = prompts[index % prompts.length];
  useEffect(() => {
    if (typed === Infinity) return;
    const done = typed >= text.length;
    const timer = setTimeout(() => {
      if (done) { setIndex(value => value + 1); setTyped(0); } else setTyped(value => value + 1);
    }, done ? 2600 : 42);
    return () => clearTimeout(timer);
  }, [typed, text]);
  return <p className="prompt-ticker">
    <span className="prompt-ticker-label">{t('projects.promptLabel')}</span>
    <span className="prompt-ticker-text" aria-hidden="true">{text.slice(0, typed)}<span className="prompt-ticker-caret"/></span>
    <span className="visually-hidden">{prompts.join(' / ')}</span>
  </p>;
}

// Home page teaser: one large card per project.
export function ProjectCards() {
  const lang = useLang(), t = useT();
  return <Reveal as="ul" stagger className="project-cards" role="list">
    {showcase.map((project, index) => {
      const text = projectText(project, lang);
      return <li key={project.id}>
        <a className="project-card" href={`#projects/${project.id}`}>
          <div className="project-card-media">
            <ProjectShot name={project.card(lang)} wide={false} width={740} height={project.id === 'soclook' ? 420 : 560}/>
          </div>
          <div className="project-card-body">
            <span className="project-card-kind">{String(index + 1).padStart(2, '0')} · {text.kind}</span>
            <h3 className="project-card-name">{project.name}</h3>
            <p className="project-card-tagline">{text.tagline}</p>
            <span className="project-card-more">{t('projects.more')}<ArrowRight size={16} aria-hidden="true"/></span>
          </div>
        </a>
      </li>;
    })}
  </Reveal>;
}

export function ProjectLinks({project, text}) {
  const t = useT();
  const external = project.live.startsWith('http') ? {target: '_blank', rel: 'noreferrer'} : {};
  return <div className="project-links">
    <a className="button button-primary" href={project.live} {...external}>{text.liveLabel}<ArrowUpRight size={18} aria-hidden="true"/></a>
    <a className="button button-secondary" href={project.repo} target="_blank" rel="noreferrer">{t('projects.source')}<ArrowUpRight size={16} aria-hidden="true"/></a>
    <span className="project-links-note">{text.liveNote}</span>
  </div>;
}
