import {useEffect, useRef} from 'react';

// Content is always rendered visible. Only elements that start below the fold get a
// short rise-in, triggered 10% of a viewport before they arrive, so a fast scroll
// never lands on an empty screen.
export default function Reveal({as: Component = 'div', className = '', children, delay = 0, ...props}) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (element.getBoundingClientRect().top < innerHeight * 1.1) return;
    element.classList.add('reveal');
    if (delay) element.style.setProperty('--reveal-delay', `${delay}ms`);
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      element.classList.add('is-visible');
      observer.disconnect();
    }, {rootMargin: '0px 0px 10% 0px'});
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);
  return <Component ref={ref} className={className} {...props}>{children}</Component>;
}
