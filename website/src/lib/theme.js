// Theme preference: 'system' | 'light' | 'dark'. The inline script in index.html applies
// the stored choice before first paint; this module keeps it in sync afterwards.
const KEY = 'theme';
const listeners = new Set();

export function getPreference() {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function resolvedTheme() {
  const preference = getPreference();
  if (preference !== 'system') return preference;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function apply(preference) {
  const root = document.documentElement;
  if (preference === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', preference);
  try {
    if (preference === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, preference);
  } catch {}
  listeners.forEach(listener => listener());
}

// Circular reveal from the control that triggered the change, when supported.
export function setPreference(preference, origin) {
  const before = resolvedTheme();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const after = preference === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : preference;
  if (!document.startViewTransition || reduced || before === after || !origin) {
    apply(preference);
    return;
  }
  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const transition = document.startViewTransition(() => apply(preference));
  transition.ready.then(() => {
    document.documentElement.animate(
      {clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]},
      {duration: 400, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)', pseudoElement: '::view-transition-new(root)'},
    );
  }).catch(() => {});
}

export function onThemeChange(listener) {
  listeners.add(listener);
  const media = matchMedia('(prefers-color-scheme: light)');
  media.addEventListener('change', listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', listener);
  };
}
