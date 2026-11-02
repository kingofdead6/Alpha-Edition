import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Adds a Cloudinary transformation (resize, auto format) to an upload URL */
export function cld(url, transform = 'f_auto,q_auto,w_800') {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
}

export function formatPrice(price, { lang, fmtNum }) {
  if (!price) return '';
  const parts = [];
  if (price.dzd) parts.push(`${fmtNum(price.dzd)} ${lang === 'ar' ? 'دج' : 'DA'}`);
  if (price.eur) parts.push(`€${fmtNum(price.eur)}`);
  return parts.join(' · ');
}

export function isbnValid(raw) {
  const d = String(raw || '').replace(/[^0-9]/g, '');
  if (d.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(d[i]) * (i % 2 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === Number(d[12]);
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join(' ');
}

export const wordCount = (s) => (String(s || '').trim() ? String(s).trim().split(/\s+/).length : 0);

/** Navigate with a View Transition so a cover can morph into the next page */
export function useTransitionNavigate() {
  const navigate = useNavigate();
  return useCallback(
    (to, opts) => {
      if (!document.startViewTransition || prefersReducedMotion()) return navigate(to, opts);
      document.startViewTransition(() => {
        flushSync(() => navigate(to, opts));
      });
    },
    [navigate]
  );
}

/** Sets the tab title for a page, restoring the site name on the way out */
export function usePageTitle(title, brand) {
  useEffect(() => {
    if (title) document.title = `${title} · ${brand}`;
    return () => { document.title = 'Éditions Alfa · منشورات ألفا'; };
  }, [title, brand]);
}

export function useMediaQuery(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/**
 * Animates an element in when it scrolls into view.
 * Anything already on screen at load stays put, so the page is complete at rest.
 */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return undefined;
    if (el.getBoundingClientRect().top < window.innerHeight) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add('reveal-in');
        io.disconnect();
      },
      // fire just before the element scrolls in, so it never flashes at rest first
      { rootMargin: '0px 0px 8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Counts up from 0 when the element is revealed (only if it started below the fold) */
export function useCountUp(end, duration = 1500) {
  const ref = useRef(null);
  const [value, setValue] = useState(end);
  useEffect(() => {
    setValue(end);
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return undefined;
    if (el.getBoundingClientRect().top < window.innerHeight) return undefined;
    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / duration);
        setValue(Math.round(end * (1 - (1 - p) ** 3)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      setValue(0);
      raf = requestAnimationFrame(step);
    }, { rootMargin: '0px 0px 8% 0px' });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, duration]);
  return [ref, value];
}
