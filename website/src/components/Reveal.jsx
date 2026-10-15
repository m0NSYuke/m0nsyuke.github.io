import {useEffect, useRef} from 'react';

// Content rises into place as it scrolls into view. Anything already on the first screen renders
// as is, so nothing visible on load is ever hidden. With `stagger`, direct children follow one another.
export default function Reveal({as: Component = 'div', className = '', children, delay = 0, stagger = false, ref: outerRef, ...props}) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (element.getBoundingClientRect().top < innerHeight * 0.92) return;
    element.classList.add(stagger ? 'reveal-stagger' : 'reveal');
    if (stagger) [...element.children].forEach((child, index) => child.style.setProperty('--i', index));
    if (delay) element.style.setProperty('--reveal-delay', `${delay}ms`);
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      element.classList.add('is-visible');
      observer.disconnect();
    }, {rootMargin: '0px 0px -8% 0px'});
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, stagger]);
  const setRef = node => { ref.current = node; if (typeof outerRef === 'function') outerRef(node); else if (outerRef) outerRef.current = node; };
  return <Component ref={setRef} className={className} {...props}>{children}</Component>;
}
