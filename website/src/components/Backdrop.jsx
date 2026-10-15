import {useEffect, useRef} from 'react';
import {onThemeChange} from '../lib/theme';

// A slow field of contour lines behind every page, drawn by one WebGL fragment shader.
// It drifts with time, shifts as the page scrolls and bends a little around the pointer.
// Still frame with reduced motion or software rendering; nothing at all without WebGL2.
const VERTEX = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uScroll;
uniform vec2 uPointer;
uniform vec3 uColor;
uniform float uAlpha;
out vec4 outColor;

vec3 hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dot(hash3(i), f), dot(hash3(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), u.x),
                 mix(dot(hash3(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), dot(hash3(i + vec3(1, 1, 0)), f - vec3(1, 1, 0)), u.x), u.y),
             mix(mix(dot(hash3(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), dot(hash3(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), u.x),
                 mix(dot(hash3(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), dot(hash3(i + vec3(1, 1, 1)), f - vec3(1, 1, 1)), u.x), u.y), u.z);
}
float field(vec2 p, float t) {
  return noise(vec3(p * 0.9, t)) + 0.45 * noise(vec3(p * 2.1 + 3.7, t * 1.3));
}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  vec2 p = uv * 1.35 + vec2(0.0, uScroll);
  vec2 toPointer = uv - uPointer;
  float lens = exp(-dot(toPointer, toPointer) * 14.0);
  float height = field(p, uTime * 0.035) + lens * 0.18;
  float level = height * 9.0;
  float distanceToLine = abs(fract(level) - 0.5);
  float width = fwidth(level);
  float line = 1.0 - smoothstep(width * 0.6, width * 1.6, 0.5 - distanceToLine);
  float major = 1.0 - step(0.5, mod(floor(level + 0.5), 4.0));
  float weight = mix(0.38, 1.0, major) * (0.75 + lens * 0.6);
  // Quieter at the top so the header and hero copy stay calm.
  float fade = mix(0.55, 1.0, smoothstep(1.0, 0.35, gl_FragCoord.y / uResolution.y));
  outColor = vec4(uColor, line * weight * fade * uAlpha);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

function start(canvas, state) {
  const gl = canvas.getContext('webgl2', {alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: 'low-power'});
  if (!gl) return null;
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const uniform = name => gl.getUniformLocation(program, name);
  const u = {resolution: uniform('uResolution'), time: uniform('uTime'), scroll: uniform('uScroll'), pointer: uniform('uPointer'), color: uniform('uColor'), alpha: uniform('uAlpha')};

  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const software = /swiftshader|llvmpipe|software/i.test(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '');
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => software || reducedQuery.matches;

  let frame = 0, last = 0, elapsed = Math.random() * 60, width = 0, height = 0;
  const pointer = {x: 0.5, y: 0.5, tx: 0.5, ty: 0.5};
  const theme = () => {
    const style = getComputedStyle(document.documentElement);
    const rgb = style.getPropertyValue('--color-art-line').trim().split(/\s+/).map(Number);
    gl.uniform3f(u.color, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
    gl.uniform1f(u.alpha, Number(style.getPropertyValue('--backdrop-alpha')) || 0.5);
  };
  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 2) >= 2 ? 1 : 0.75;
    width = Math.round(innerWidth * scale); height = Math.round(innerHeight * scale);
    canvas.width = width; canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(u.resolution, width, height);
  };
  const draw = () => {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(u.time, elapsed);
    gl.uniform1f(u.scroll, scrollY / Math.max(innerHeight, 1) * 0.22);
    gl.uniform2f(u.pointer, pointer.x * width / height, pointer.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const tick = now => {
    frame = 0;
    if (document.hidden || state.paused) return;
    if (now - last >= 33) {
      elapsed += Math.min(now - last, 100) / 1000;
      last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      draw();
    }
    schedule();
  };
  const schedule = () => { if (!frame && !still() && !state.paused) frame = requestAnimationFrame(tick); };
  const redraw = () => { if (still()) draw(); else schedule(); };
  const onPointer = event => { pointer.tx = event.clientX / innerWidth; pointer.ty = 1 - event.clientY / innerHeight; };
  const onResize = () => { resize(); draw(); };
  const onVisible = () => { if (!document.hidden) { last = performance.now(); schedule(); } };

  resize(); theme(); draw();
  canvas.classList.add('is-ready');
  schedule();
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', redraw, {passive: true});
  window.addEventListener('pointermove', onPointer, {passive: true});
  document.addEventListener('visibilitychange', onVisible);
  reducedQuery.addEventListener?.('change', redraw);
  const stopTheme = onThemeChange(() => { theme(); draw(); });
  state.resume = () => { last = performance.now(); schedule(); };
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', redraw);
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisible);
    reducedQuery.removeEventListener?.('change', redraw);
    stopTheme();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

// `paused` hides and stops it, for pages that bring their own canvas (the lab).
export default function Backdrop({paused = false}) {
  const ref = useRef(null), state = useRef({paused});
  useEffect(() => {
    state.current.paused = paused;
    if (!paused) state.current.resume?.();
  }, [paused]);
  useEffect(() => {
    let stop, idle;
    // Starts after the page has painted, so it never competes with the first screen.
    const begin = () => { try { stop = start(ref.current, state.current); } catch { stop = null; } };
    idle = window.requestIdleCallback ? requestIdleCallback(begin, {timeout: 1500}) : setTimeout(begin, 300);
    return () => { (window.cancelIdleCallback || clearTimeout)(idle); stop?.(); };
  }, []);
  return <canvas ref={ref} className={`backdrop ${paused ? 'is-paused' : ''}`} aria-hidden="true"/>;
}
