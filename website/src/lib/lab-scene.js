// The lab's WebGL scene. Loaded on demand so three.js never blocks the page's first paint.
import {Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Spherical, Vector3, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {onThemeChange} from './theme';

export function startScene({host, parameters, rotate, reduced, accent, onError, onSlow}) {
  let renderer;
  try { renderer = new WebGLRenderer({antialias: window.devicePixelRatio < 1.5, alpha: true, powerPreference: 'low-power'}); } catch { onError(); return undefined; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  // Software rendering (no GPU) would keep the CPU busy, so the surface starts still there.
  const gl = renderer.getContext(), info = gl.getExtension('WEBGL_debug_renderer_info');
  const software = /swiftshader|llvmpipe|software/i.test(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '');
  if (software) { renderer.setPixelRatio(1); onSlow(); }
  host.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene(), camera = new PerspectiveCamera(40, 1, .1, 100);
  camera.position.set(5, 4, 6);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reduced; controls.enablePan = false; controls.minDistance = 4; controls.maxDistance = 14;
  const geometry = new PlaneGeometry(5, 5, 44, 44);
  geometry.rotateX(-Math.PI / 2);
  const material = new MeshBasicMaterial({color: accent(), wireframe: true, transparent: true, opacity: .85});
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
  const original = new Float32Array(geometry.attributes.position.array);
  let frame, visible = true, time = 0, last = performance.now(), previous = null, dirty = true, cost = 0, slow = software;
  rotate.current = (azimuth, polar) => {
    const offset = camera.position.clone().sub(controls.target), spherical = new Spherical().setFromVector3(offset);
    spherical.theta += azimuth; spherical.phi = Math.min(Math.PI - .2, Math.max(.2, spherical.phi + polar));
    camera.position.copy(controls.target).add(new Vector3().setFromSpherical(spherical));
    camera.lookAt(controls.target); dirty = true;
  };
  const stopTheme = onThemeChange(() => { material.color.set(accent()); dirty = true; });
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; });
  observer.observe(host);
  const resize = new ResizeObserver(() => { const width = host.clientWidth, height = host.clientHeight; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); dirty = true; });
  resize.observe(host);
  function render(now) {
    frame = requestAnimationFrame(render);
    const interval = now - last, dt = Math.min(interval / 1000, .05); last = now;
    if (!visible || document.hidden) return;
    // Frame-to-frame time includes GPU work; if it stays slow, stop the auto-animation.
    if (!slow && (cost = cost * .8 + Math.min(interval, 100) * .2) > 40) { slow = true; renderer.setPixelRatio(1); onSlow(); }
    const p = parameters.current, animate = !p.paused && p.speed > 0, moved = controls.update();
    if (!animate && p === previous && !moved && !dirty) return;
    if (animate) time += dt * p.speed;
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = original[i * 3], z = original[i * 3 + 2];
      position.setY(i, Math.sin(x * p.frequency + time) * Math.cos(z * p.frequency - time) * p.amplitude);
    }
    position.needsUpdate = true;
    if (!p.paused) mesh.rotation.y = time * .18;
    renderer.render(scene, camera);
    previous = p; dirty = false;
  }
  frame = requestAnimationFrame(render);
  return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); stopTheme(); controls.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove(); };
}
