import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import en from '../i18n/en.js';
import ar from '../i18n/ar.js';

const dicts = { en, ar };
const LangContext = createContext(null);

function initialLang() {
  const attr = document.documentElement.lang;
  if (attr === 'ar' || attr === 'en') return attr;
  return 'en';
}

const lookup = (key, dict) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('alfa-lang', lang);
    } catch {
      /* storage blocked */
    }
  }, [lang]);

  /** Switch language with a cross-fade where the browser supports view transitions */
  const setLang = useCallback((next) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) return setLangState(next);
    document.startViewTransition(() => flushSync(() => setLangState(next)));
  }, []);

  const value = useMemo(() => {
    const dict = dicts[lang];
    const t = (key, vars) => {
      let v = lookup(key, dict);
      if (v == null) v = lookup(key, en);
      if (v == null) return key;
      if (typeof v === 'string' && vars) v = v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
      return v;
    };
    /** Picks the current language from an { en, ar } field, falling back to the other one */
    const pick = (obj) => {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      return obj[lang] || obj[lang === 'ar' ? 'en' : 'ar'] || '';
    };
    /** Which language pick() actually returned — used to set lang/dir on mixed content */
    const pickLang = (obj) => (obj && !obj[lang] && obj[lang === 'ar' ? 'en' : 'ar'] ? (lang === 'ar' ? 'en' : 'ar') : lang);
    // ar-DZ gives Algerian month names (جانفي، فيفري…) and Latin digits
    const locale = lang === 'ar' ? 'ar-DZ' : 'en-GB';
    const fmtDate = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
      d ? new Intl.DateTimeFormat(locale, opts).format(new Date(d)) : '';
    const fmtNum = (n) => new Intl.NumberFormat(locale).format(Number(n) || 0);
    return {
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      other: lang === 'ar' ? 'en' : 'ar',
      setLang,
      toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'),
      t,
      pick,
      pickLang,
      fmtDate,
      fmtNum,
      locale,
    };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
