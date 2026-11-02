import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

/*
 * The home payload is cached for the session so that returning to the home page
 * renders at once (and the browser can restore scroll), and so book pages can
 * draw their cover immediately for the view transition.
 */
let homeCache = null;
const bookCache = new Map();

export const cachedBook = (slug) => bookCache.get(slug) || null;

export function useHomeData() {
  const [data, setData] = useState(homeCache);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!homeCache);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api('/public/home')
      .then((d) => {
        homeCache = d;
        d.books.forEach((b) => bookCache.set(b.slug, { ...bookCache.get(b.slug), ...b }));
        setData(d);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, reload: load };
}

export function useBook(slug) {
  const [state, setState] = useState(() => ({ book: cachedBook(slug), related: [], error: null, full: false }));

  useEffect(() => {
    let alive = true;
    setState((s) => ({ book: cachedBook(slug) || (s.book?.slug === slug ? s.book : null), related: [], error: null, full: false }));
    api(`/public/books/${encodeURIComponent(slug)}`)
      .then((d) => {
        if (!alive) return;
        bookCache.set(slug, d.book);
        d.related.forEach((b) => !bookCache.has(b.slug) && bookCache.set(b.slug, b));
        setState({ book: d.book, related: d.related, error: null, full: true });
      })
      .catch((err) => alive && setState((s) => ({ ...s, error: err, full: true })));
    return () => {
      alive = false;
    };
  }, [slug]);

  return state;
}

/** Fetches a public endpoint once per session; revisiting the page renders from cache */
const pageCache = new Map();
export function useCachedApi(path) {
  const [state, setState] = useState(() => ({ data: pageCache.get(path) || null, error: null }));

  useEffect(() => {
    let alive = true;
    setState({ data: pageCache.get(path) || null, error: null });
    api(path)
      .then((d) => {
        pageCache.set(path, d);
        if (alive) setState({ data: d, error: null });
      })
      .catch((err) => alive && setState((s) => ({ ...s, error: err })));
    return () => {
      alive = false;
    };
  }, [path]);

  return state;
}

export const useAuthors = () => useCachedApi('/public/authors');
export const useAuthor = (slug) => useCachedApi(`/public/authors/${encodeURIComponent(slug)}`);

export function getSettings() {
  return homeCache?.settings || null;
}
