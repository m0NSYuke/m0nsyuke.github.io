import {useEffect} from 'react';
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

function ProjectStory({project, index}) {
  const lang = useLang(), t = useT();
  const text = projectText(project, lang);
  const headingId = `${project.id}-title`;
  const url = project.live.startsWith('http') ? project.live.replace(/^https:\/\//, '').replace(/\/$/, '') : `m0nsyuke.github.io${project.live.replace(/\/$/, '')}`;
  return <section id={`project-${project.id}`} className="project-story" aria-labelledby={headingId}>
    <div className="container">
      <Reveal className="project-head">
        <p className="eyebrow">{String(index + 1).padStart(2, '0')} · {text.kind}</p>
        <h2 id={headingId} className="project-name">{project.name}</h2>
        <p className="project-tagline">{text.tagline}</p>
      </Reveal>
      <div className="project-stage">
        <BrowserFrame url={url}>
          {project.video
            ? <DemoVideo src={`/assets/projects/${project.video}`} poster={`/assets/projects/${project.image(lang)}-1600.webp`} label={t('projects.videoLabel', project.name)}/>
            : <ProjectShot name={project.image(lang)} alt={t('projects.shotLabel', project.name)} sizes="(min-width: 1248px) 1152px, 94vw" width={1600} height={960}/>}
        </BrowserFrame>
      </div>
      <div className="project-grid">
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
      {text.pipeline && <div className="project-extra">
        <Reveal className="project-extra-head"><h3 className="project-extra-title">{t('projects.howAtlas')}</h3></Reveal>
        <Pipeline steps={text.pipeline} label={t('projects.howAtlas')}/>
        <Reveal as="ul" stagger className="feature-list" role="list">
          {text.features.map(([title, body], featureIndex) => <li key={title}>
            <span className="feature-index">{String(featureIndex + 1).padStart(2, '0')}</span>
            <h4 className="feature-title">{title}</h4>
            <p>{body}</p>
          </li>)}
        </Reveal>
      </div>}
      {text.steps && <div className="project-extra">
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
    {showcase.map((project, index) => <ProjectStory key={project.id} project={project} index={index}/>)}
    {projects.length > 0 && <section className="container section" aria-labelledby="more-projects">
      <Reveal className="section-head"><h2 id="more-projects" className="section-title">{t('projects.others')}</h2></Reveal>
      <NoteGrid notes={projects}/>
    </section>}
  </div>;
}

const reducedMotionScroll = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');
