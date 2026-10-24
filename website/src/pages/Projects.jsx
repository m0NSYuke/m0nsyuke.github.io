import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowUp, CaretUp} from '@phosphor-icons/react';
import Reveal from '../components/Reveal';
import {NoteGrid} from '../components/Notes';
import {CountUp, DemoVideo, ProjectLinks, ProjectShot, PromptTicker} from '../components/Showcase';
import {projectText, showcase} from '../lib/showcase';
import {projects} from '../lib/site';
import {useLang, useT} from '../lib/i18n';

function BrowserFrame({url, children}) {
  return <div className="browser-frame">
    <div className="browser-bar" aria-hidden="true"><i/><i/><i/><span>{url}</span></div>
    <div className="browser-view">{children}</div>
  </div>;
}

// Code → 3D: the stages the in-browser interpreter runs, lit one after another.
function Pipeline({steps, label}) {
  return <Reveal as="ol" stagger className="pipeline" role="list" aria-label={label} style={{'--steps': steps.length}}>
    {steps.map((step, index) => <li key={step} style={{'--n': index}}><span className="pipeline-chip">{step}</span></li>)}
  </Reveal>;
}

// The weekly loop: a progress line runs through the five steps and lights each in turn.
function Workflow({steps, label}) {
  return <Reveal as="ol" stagger className="workflow" role="list" aria-label={label} style={{'--steps': steps.length}}>
    {steps.map(([title, text], index) => <li key={title} className="workflow-step" style={{'--n': index}}>
      <span className="workflow-dot" aria-hidden="true"/>
      <span className="workflow-index">{String(index + 1).padStart(2, '0')}</span>
      <h4 className="workflow-title">{title}</h4>
      <p>{text}</p>
    </li>)}
  </Reveal>;
}

// The parts of one project story the contents rail can jump to.
function storyParts(project, lang, t) {
  const text = projectText(project, lang);
  const how = text.pipeline ? text.extraTitle || t('projects.howAtlas') : text.steps ? t('projects.howSoclook') : null;
  return [['demo', t('projects.tocDemo')], ['intro', t('projects.tocIntro')], ...(how ? [['how', how]] : [])];
}

const partId = (project, key) => `project-${project}-${key}`;

// Which project and part sit under the reading line (35% down the viewport), and how far through it we are.
function useReadingPosition(entries, railRef) {
  const [position, setPosition] = useState({project: null, part: null, past: false});
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = innerHeight * 0.35;
      let project = null, part = null, progress = 0;
      for (const {id, parts} of entries) {
        const box = document.getElementById(`project-${id}`)?.getBoundingClientRect();
        if (!box || box.top > line) continue;
        project = box.bottom > line ? id : null;
        progress = Math.min(1, Math.max(0, (line - box.top) / box.height));
        part = parts.filter(key => document.getElementById(partId(id, key))?.getBoundingClientRect().top <= line).pop() || parts[0];
      }
      const more = document.getElementById('projects-more')?.getBoundingClientRect();
      if (more && more.top <= line) project = 'more';
      const first = document.getElementById(`project-${entries[0]?.id}`)?.getBoundingClientRect();
      const past = !!first && first.top <= innerHeight * 0.6;
      // Progress changes every frame; write it straight to the rail instead of re-rendering.
      railRef.current?.style.setProperty('--progress', project === 'more' ? 1 : progress);
      setPosition(prev => prev.project === project && prev.part === part && prev.past === past ? prev : {project, part, past});
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', schedule, {passive: true});
    addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); };
  }, [entries, railRef]);
  return position;
}

function ProjectToc() {
  const lang = useLang(), t = useT();
  const railRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [entries] = useState(() => showcase.map(project => ({id: project.id, parts: storyParts(project, 'zh', t).map(([key]) => key)})));
  const {project: current, part, past} = useReadingPosition(entries, railRef);
  useEffect(() => {
    if (!open) return;
    const close = event => {
      if (event.type === 'keydown' ? event.key === 'Escape' : !railRef.current?.parentElement.contains(event.target)) setOpen(false);
    };
    addEventListener('keydown', close);
    addEventListener('pointerdown', close);
    return () => { removeEventListener('keydown', close); removeEventListener('pointerdown', close); };
  }, [open]);
  // Scroll in place; the hash records the project without re-routing the page.
  const go = (targetId, project) => event => {
    event.preventDefault();
    setOpen(false);
    document.getElementById(targetId)?.scrollIntoView({behavior: reducedMotionScroll(), block: 'start'});
    if (project) history.replaceState(null, '', `#projects/${project}`);
  };
  const currentIndex = showcase.findIndex(project => project.id === current);
  const currentName = current === 'more' ? t('projects.others') : showcase[currentIndex]?.name || t('projects.index');
  // Portalled: the page transition's transform would otherwise pin the rail to the page, not the viewport.
  return createPortal(<div className="project-toc-wrap" data-past={past || undefined} data-open={open || undefined}>
    <button type="button" className="project-toc-toggle" aria-expanded={open} aria-controls="project-toc" onClick={() => setOpen(value => !value)}>
      <span className="project-toc-index">{currentIndex >= 0 ? String(currentIndex + 1).padStart(2, '0') : '··'}</span>
      <span className="project-toc-toggle-name">{currentName}</span>
      <CaretUp size={14} aria-hidden="true"/>
    </button>
    <nav id="project-toc" className="project-toc" aria-label={t('projects.index')} ref={railRef}>
      <p className="project-toc-title">{t('projects.index')}</p>
      <ol role="list" className="project-toc-list">
        {showcase.map(project => {
          const active = current === project.id;
          const parts = storyParts(project, lang, t);
          const reached = parts.findIndex(([key]) => key === part);
          return <li key={project.id} className="project-toc-item" data-active={active || undefined}>
            <a href={`#projects/${project.id}`} aria-current={active ? 'location' : undefined} onClick={go(`project-${project.id}`, project.id)}>
              <span className="project-toc-bar" aria-hidden="true"/>
              <span className="project-toc-name">{project.name}</span>
            </a>
            <div className="project-toc-parts" inert={!active}>
              <ol role="list">
                {parts.map(([key, label], partIndex) => <li key={key} data-reached={(active && partIndex <= reached) || undefined}>
                  <a href={`#projects/${project.id}`} aria-current={active && key === part ? 'location' : undefined} onClick={go(partId(project.id, key), project.id)}>{label}</a>
                </li>)}
              </ol>
            </div>
          </li>;
        })}
        {projects.length > 0 && <li className="project-toc-item" data-active={current === 'more' || undefined}>
          <a href="#projects" aria-current={current === 'more' ? 'location' : undefined} onClick={go('projects-more')}>
            <span className="project-toc-bar" aria-hidden="true"/>
            <span className="project-toc-name">{t('projects.others')}</span>
          </a>
        </li>}
      </ol>
      <a className="project-toc-top" href="#projects" onClick={event => { event.preventDefault(); setOpen(false); scrollTo({top: 0, behavior: reducedMotionScroll()}); }}>
        <ArrowUp size={14} aria-hidden="true"/>{t('projects.top')}
      </a>
    </nav>
  </div>, document.body);
}

function ProjectStory({project, index}) {
  const lang = useLang(), t = useT();
  const text = projectText(project, lang);
  const headingId = `${project.id}-title`;
  const url = project.frameUrl || (project.live.startsWith('http') ? project.live.replace(/^https:\/\//, '').replace(/\/$/, '') : `m0nsyuke.github.io${project.live.replace(/\/$/, '')}`);
  return <section id={`project-${project.id}`} className="project-story" aria-labelledby={headingId}>
    <div className="container">
      <Reveal className="project-head">
        <p className="eyebrow">{String(index + 1).padStart(2, '0')} · {text.kind}</p>
        <h2 id={headingId} className="project-name">{project.name}</h2>
        <p className="project-tagline">{text.tagline}</p>
      </Reveal>
      <div id={`project-${project.id}-demo`} className="project-stage">
        <BrowserFrame url={url}>
          {project.video
            ? <DemoVideo src={`/assets/projects/${project.video}`} poster={`/assets/projects/${project.image(lang)}-1600.webp`} label={t('projects.videoLabel', project.name)}/>
            : <ProjectShot name={project.image(lang)} alt={t('projects.shotLabel', project.name)} sizes="(min-width: 1248px) 1152px, 94vw" width={1600} height={960}/>}
        </BrowserFrame>
      </div>
      <div id={`project-${project.id}-intro`} className="project-grid">
        <Reveal className="project-copy">
          <p className="project-summary">{text.summary}</p>
          <p className="project-body">{text.body}</p>
          <ProjectLinks project={project} text={text}/>
          <ul className="project-tags" role="list" aria-label={t('projects.stack')}>{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
        </Reveal>
        <Reveal as="ul" stagger className="project-stats" role="list">
          {text.stats.map(([value, suffix, label]) => <li key={label}>
            <strong><CountUp value={value} suffix={suffix}/></strong>
            <span>{label}</span>
          </li>)}
        </Reveal>
      </div>
      {text.pipeline && <div id={`project-${project.id}-how`} className="project-extra">
        <Reveal className="project-extra-head"><h3 className="project-extra-title">{text.extraTitle || t('projects.howAtlas')}</h3></Reveal>
        <Pipeline steps={text.pipeline} label={text.extraTitle || t('projects.howAtlas')}/>
        <Reveal as="ul" stagger className="feature-list" role="list">
          {text.features.map(([title, body], featureIndex) => <li key={title}>
            <span className="feature-index">{String(featureIndex + 1).padStart(2, '0')}</span>
            <h4 className="feature-title">{title}</h4>
            <p>{body}</p>
          </li>)}
        </Reveal>
      </div>}
      {text.steps && <div id={`project-${project.id}-how`} className="project-extra">
        <Reveal className="project-extra-head"><h3 className="project-extra-title">{t('projects.howSoclook')}</h3></Reveal>
        <Workflow steps={text.steps} label={t('projects.howSoclook')}/>
      </div>}
    </div>
  </section>;
}

export default function Projects({focus}) {
  const t = useT();
  useEffect(() => {
    if (!focus) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(`project-${focus}`);
      if (!target) return;
      target.scrollIntoView({behavior: reducedMotionScroll(), block: 'start'});
    });
    return () => cancelAnimationFrame(frame);
  }, [focus]);
  return <div className="projects-page">
    <header className="container page projects-hero">
      <p className="eyebrow">Vibe coding</p>
      <h1 className="page-title projects-title" tabIndex={-1}>{t('projects.title')}</h1>
      <p className="page-lede">{t('projects.lede')}</p>
      <PromptTicker/>
      <nav className="projects-index" aria-label={t('projects.index')}>
        {showcase.map((project, index) => <a key={project.id} href={`#projects/${project.id}`}>
          <span>{String(index + 1).padStart(2, '0')}</span>{project.name}
        </a>)}
      </nav>
    </header>
    <ProjectToc/>
    {showcase.map((project, index) => <ProjectStory key={project.id} project={project} index={index}/>)}
    {projects.length > 0 && <section id="projects-more" className="container section projects-more" aria-labelledby="more-projects">
      <Reveal className="section-head"><h2 id="more-projects" className="section-title">{t('projects.others')}</h2></Reveal>
      <NoteGrid notes={projects}/>
    </section>}
  </div>;
}

const reducedMotionScroll = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');
