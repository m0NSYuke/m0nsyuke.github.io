import {useEffect, useRef, useState} from 'react';
import {Pause, Play} from '@phosphor-icons/react';
import {onThemeChange} from '../lib/theme';
import {useT} from '../lib/i18n';

// One wireframe that evolves from a cube, through a twist and a disturbance, into a rolling surface,
// the same sequence the old static banner showed side by side. Drawn with Canvas 2D.
// The shape is a lofted grid: square rings stacked along the height, joined by vertical lines.
// Every stage maps the same (s, y) grid, so the cube can twist, ripple and finally unroll into a surface.
const RINGS = 11, COLUMNS = 32, RING_STEPS = 128, COLUMN_STEPS = 40;
const HOLD = 1500, MOVE = 1700;

const smooth = t => t * t * (3 - 2 * t);

// s runs once around the square (0..1), y from bottom to top (-1..1).
function stagePoint(stage, s, y) {
  const side = Math.min(3, Math.floor(s * 4)), f = s * 4 - side;
  let [x, z] = [[1, -1 + 2 * f], [1 - 2 * f, 1], [-1, 1 - 2 * f], [-1 + 2 * f, -1]][side];
  if (stage === 0) return [x * 0.8, y * 0.8, z * 0.8];
  if (stage === 1 || stage === 2) {
    const angle = y * 1.15, pinch = 1 - 0.38 * (1 - y * y);
    const c = Math.cos(angle), n = Math.sin(angle);
    [x, z] = [(x * c - z * n) * pinch, (x * n + z * c) * pinch];
    if (stage === 1) return [x * 0.8, y * 0.95, z * 0.8];
    const a = s * Math.PI * 2;
    const k = 1 + 0.2 * (0.6 * Math.sin(3 * a + 1.6 * y) * Math.cos(2.2 * y) + 0.4 * Math.sin(5 * a - 2.4 * y + 1));
    return [x * 0.8 * k, y * (0.95 + 0.06 * Math.sin(4 * a)), z * 0.8 * k];
  }
  const px = (s - 0.5) * 3.6, pz = -y * 1.2;
  const py = 0.62 * Math.exp(-((px - 0.6) ** 2 + (pz + 0.1) ** 2) / 0.36)
    + 0.42 * Math.exp(-((px + 0.85) ** 2 + (pz - 0.35) ** 2) / 0.5)
    + 0.07 * Math.sin(2.6 * px) * Math.cos(2.2 * pz) - 0.3;
  return [px, py, pz];
}

function lines() {
  const out = [];
  for (let r = 0; r < RINGS; r++) {
    const y = -1 + 2 * r / (RINGS - 1), line = [];
    for (let i = 0; i <= RING_STEPS; i++) line.push([i / RING_STEPS, y]);
    out.push(line);
  }
  // Column 0 and column COLUMNS meet while the shape is closed and become the two edges of the surface.
  for (let c = 0; c <= COLUMNS; c++) {
    const line = [];
    for (let i = 0; i <= COLUMN_STEPS; i++) line.push([c / COLUMNS, -1 + 2 * i / COLUMN_STEPS]);
    out.push(line);
  }
  return out;
}

export default function Morph() {
  const t = useT();
  const stages = t('morph.stages');
  const canvas = useRef(null), api = useRef(null);
  const [stage, setStage] = useState(0), [playing, setPlaying] = useState(true);
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const element = canvas.current, context = element.getContext('2d');
    const grid = lines().map(line => line.map(([u, v]) => [0, 1, 2, 3].map(stage => stagePoint(stage, u, v))));
    let width = 0, height = 0, ratio = 1, frame = 0, visible = false, color = '217 169 95', light = false;
    let value = 0, target = 0, auto = !reduced, nextAt = performance.now() + HOLD, yaw = -0.6, last = performance.now();
    const pointer = {x: 0, tx: 0};

    const theme = () => {
      const style = getComputedStyle(document.documentElement);
      color = style.getPropertyValue('--color-art-line').trim();
      light = style.colorScheme === 'light' || style.getPropertyValue('color-scheme').includes('light');
    };
    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = element.clientWidth; height = element.clientHeight;
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio);
    };
    const draw = () => {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const k = Math.min(3, Math.floor(value)), f = smooth(value - k), next = Math.min(3, k + 1);
      const tilt = -0.42, cy = Math.cos(yaw + pointer.x * 0.35), sy = Math.sin(yaw + pointer.x * 0.35), ct = Math.cos(tilt), st = Math.sin(tilt);
      const scale = Math.min(width * 0.21, height * 0.34), cx = width / 2, cyScreen = height / 2 + height * 0.02;
      // Blueprint guides
      context.lineWidth = 1;
      context.strokeStyle = `rgb(${color} / ${light ? 0.28 : 0.22})`;
      context.beginPath();
      context.moveTo(width * 0.04, cyScreen); context.lineTo(width * 0.96, cyScreen);
      context.moveTo(cx, height * 0.06); context.lineTo(cx, height * 0.94);
      context.stroke();
      context.setLineDash([3, 6]);
      context.beginPath();
      context.ellipse(cx, cyScreen, scale * 2.1, scale * 0.62, 0, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = `rgb(${color} / 0.7)`;
      for (const x of [width * 0.04, width * 0.96, cx - scale * 2.1, cx + scale * 2.1]) { context.beginPath(); context.arc(x, cyScreen, 2, 0, Math.PI * 2); context.fill(); }
      // Wireframe, bucketed by depth so nearer lines read brighter.
      const buckets = [new Path2D(), new Path2D(), new Path2D()];
      for (const line of grid) {
        let depth = 0, first = true;
        const path = new Path2D();
        for (const points of line) {
          const p = points[k], q = points[next];
          const x = p[0] + (q[0] - p[0]) * f, y = p[1] + (q[1] - p[1]) * f, z = p[2] + (q[2] - p[2]) * f;
          const rx = x * cy - z * sy, rz = x * sy + z * cy;
          const ry = y * ct - rz * st, rz2 = y * st + rz * ct;
          const perspective = 3.6 / (rz2 + 4.6);
          const X = cx + rx * scale * perspective, Y = cyScreen - ry * scale * perspective;
          depth += rz2;
          if (first) { path.moveTo(X, Y); first = false; } else path.lineTo(X, Y);
        }
        depth /= line.length;
        buckets[depth < -0.35 ? 2 : depth < 0.35 ? 1 : 0].addPath(path);
      }
      const alphas = light ? [0.32, 0.55, 0.85] : [0.22, 0.45, 0.85];
      buckets.forEach((path, index) => { context.strokeStyle = `rgb(${color} / ${alphas[index]})`; context.lineWidth = index === 2 ? 1.1 : 0.8; context.stroke(path); });
    };
    const tick = now => {
      frame = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(now - last, 64); last = now;
      if (auto && now >= nextAt) {
        target = target >= 3 ? 0 : target + 1;
        setStage(target);
        nextAt = now + HOLD + MOVE * (target === 0 ? 1.6 : 1);
      }
      const speed = (target === 0 && value > 1 ? 1.6 : 1) * dt / MOVE;
      value = value < target ? Math.min(target, value + speed * Math.max(1, target - value)) : Math.max(target, value - speed * Math.max(1, value - target));
      if (!reduced) yaw += dt * 0.00016;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const run = () => { if (!frame && visible && !reduced) { last = performance.now(); frame = requestAnimationFrame(tick); } };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) run(); });
    observer.observe(element);
    const sizeObserver = new ResizeObserver(() => { resize(); draw(); });
    sizeObserver.observe(element);
    const move = event => { const rect = element.getBoundingClientRect(); pointer.tx = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)); };
    window.addEventListener('pointermove', move, {passive: true});
    const stopTheme = onThemeChange(() => { theme(); draw(); });
    theme(); resize(); draw();
    api.current = {
      go(index) { target = index; if (reduced) { value = index; draw(); } nextAt = performance.now() + HOLD * 4; setStage(index); run(); },
      play(on) { auto = on && !reduced; nextAt = performance.now() + HOLD; run(); },
    };
    return () => { cancelAnimationFrame(frame); observer.disconnect(); sizeObserver.disconnect(); window.removeEventListener('pointermove', move); stopTheme(); };
  }, []);

  useEffect(() => { if (reduced) setPlaying(false); }, []);
  const toggle = () => { api.current?.play(!playing); setPlaying(!playing); };

  return <figure className="morph">
    <canvas ref={canvas} className="morph-canvas" role="img" aria-label={t('morph.label')}/>
    <figcaption className="morph-bar">
      <ol className="morph-stages" role="list" style={{'--progress': stage / (stages.length - 1)}}>
        {stages.map((label, index) => <li key={label}>
          <button type="button" aria-pressed={stage === index} onClick={() => api.current?.go(index)}>
            <span className="morph-index">{String(index + 1).padStart(2, '0')}</span>{label}
          </button>
        </li>)}
      </ol>
      {!reduced && <button type="button" className="icon-button morph-toggle" onClick={toggle} aria-label={playing ? t('morph.pause') : t('morph.play')}>
        {playing ? <Pause size={18} aria-hidden="true"/> : <Play size={18} aria-hidden="true"/>}
      </button>}
    </figcaption>
  </figure>;
}
