import {useEffect, useRef, useState} from 'react';
import {Pause, Play, ArrowCounterClockwise} from '@phosphor-icons/react';
import '../styles/lab.css';

const DEFAULTS = {amplitude: .65, frequency: 2, speed: .25};
const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#d9a95f';

function Experiment() {
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mount = useRef(null), parameters = useRef({...DEFAULTS, paused: reduced}), rotate = useRef(null);
  const [state, setState] = useState(parameters.current), [error, setError] = useState('');
  function update(patch) { const value = {...parameters.current, ...patch}; parameters.current = value; setState(value); }
  useEffect(() => {
    // three.js loads after the page text has rendered, so it never delays the first paint.
    let disposed = false, cleanup;
    const load = () => import('../lib/lab-scene')
      .then(({startScene}) => { if (!disposed) cleanup = startScene({host: mount.current, parameters, rotate, reduced, accent, onError: setError, onSlow: () => update({paused: true})}); })
      .catch(() => setError('实验没有加载成功。刷新页面再试一次。'));
    const idle = window.requestIdleCallback ? requestIdleCallback(load, {timeout: 1200}) : setTimeout(load, 200);
    return () => { disposed = true; (window.cancelIdleCallback || clearTimeout)(idle); cleanup?.(); };
  }, []);
  const keydown = event => {
    const step = .12, map = {ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step]};
    if (!map[event.key]) return;
    event.preventDefault();
    rotate.current?.(...map[event.key]);
  };
  return <section className="live-lab" aria-labelledby="experiment-title">
    <div className="lab-canvas" ref={mount} tabIndex={0} role="application" aria-label="实时参数曲面。用方向键旋转视角，或用鼠标拖动、滚轮缩放。" onKeyDown={keydown}>
      {error && <p role="status">{error}</p>}
      <span className="lab-help">拖动或用方向键旋转 · 滚轮缩放</span>
    </div>
    <div className="lab-controls">
      <h2 id="experiment-title" className="lab-title">给想法一个形状</h2>
      <p>改变参数，观察一个简单的公式如何变成可见的结构。</p>
      {[['amplitude', '波幅', 0, 1.5, .05], ['frequency', '频率', .5, 4, .1], ['speed', '速度', 0, 1, .05]].map(([key, label, min, max, step]) => <div key={key} className="range">
        <label htmlFor={`range-${key}`}>{label}</label>
        <output htmlFor={`range-${key}`}>{state[key].toFixed(2)}</output>
        <input id={`range-${key}`} type="range" min={min} max={max} step={step} value={state[key]} onChange={event => update({[key]: Number(event.target.value)})}/>
      </div>)}
      <div className="button-row">
        <button type="button" className="button button-secondary" onClick={() => update({paused: !state.paused})}>{state.paused ? <Play size={16} aria-hidden="true"/> : <Pause size={16} aria-hidden="true"/>}{state.paused ? '继续' : '暂停'}</button>
        <button type="button" className="button button-text" onClick={() => update({...DEFAULTS, paused: reduced})}><ArrowCounterClockwise size={16} aria-hidden="true"/>重置参数</button>
      </div>
    </div>
  </section>;
}

export default function Lab() {
  return <div className="container page">
    <header className="page-head">
      <h1 className="page-title" tabIndex={-1}>实验室</h1>
      <p className="page-lede">把一个参数改变，看看会发生什么。这里放可以直接上手的小实验，作品整理好后也会放在这里。</p>
    </header>
    <Experiment/>
  </div>;
}
