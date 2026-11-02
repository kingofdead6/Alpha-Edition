import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ListContext = createContext(null);
const KEY = 'alfa-list';

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((b) => b && b.slug) : [];
  } catch {
    return [];
  }
}

/** Keeps just enough of each book to draw the drawer without a request */
const slim = (b) => ({ slug: b.slug, title: b.title, author: b.author ? { name: b.author.name } : null, cover: b.cover, price: b.price });

export function ReadingListProvider({ children }) {
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage blocked */
    }
  }, [items]);

  const has = useCallback((slug) => items.some((b) => b.slug === slug), [items]);

  /** Returns true when the book was added */
  const toggle = useCallback(
    (book) => {
      const present = items.some((b) => b.slug === book.slug);
      setItems((prev) => (present ? prev.filter((b) => b.slug !== book.slug) : [...prev, slim(book)]));
      setPulse((p) => p + 1);
      return !present;
    },
    [items]
  );

  const remove = useCallback((slug) => setItems((prev) => prev.filter((b) => b.slug !== slug)), []);

  const value = useMemo(() => ({ items, has, toggle, remove, open, setOpen, pulse }), [items, has, toggle, remove, open, pulse]);
  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}

export const useReadingList = () => useContext(ListContext);
