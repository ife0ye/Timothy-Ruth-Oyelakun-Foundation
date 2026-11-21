import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);

  return matches;
}

/**
 * Start and end states for content that rises into place. Written as full transform strings rather
 * than Motion's x/y shorthands so the browser runs them off the main thread and they stay smooth
 * while the page is still loading. Motion's reduced-motion setting only covers the shorthands, so
 * visitors who ask for less motion are given a plain fade here instead.
 */
export function useRise(distance: string) {
  const reduce = useReducedMotion();
  return {
    from: { opacity: 0, transform: `translateY(${reduce ? '0px' : distance})` },
    to: { opacity: 1, transform: 'translateY(0px)' },
  };
}

export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');
