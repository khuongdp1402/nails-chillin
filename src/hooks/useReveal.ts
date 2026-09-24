import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export function useReveal<T extends HTMLElement>(delayMs = 0): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${delayMs}ms`);
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('is-visible');
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);

  return ref as RefObject<T>;
}
