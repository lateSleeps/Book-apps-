'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to track a CSS media query.
 * Returns true if the query matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Returns true when viewport is wider than 430px (desktop) */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 431px)');
}
