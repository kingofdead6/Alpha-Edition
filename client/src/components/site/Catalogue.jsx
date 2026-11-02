import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { errorText } from '../../lib/api.js';
import { prefersReducedMotion } from '../../lib/util.js';
import Reveal from '../Reveal.jsx';
import Icon from '../Icon.jsx';
import BookCard from './BookCard.jsx';

const CATS = ['all', 'fiction', 'essays', 'poetry', 'translation'];

function Skeletons() {
  return Array.from({ length: 8 }, (_, i) => (
    <div key={i} className="flex flex-col gap-4" aria-hidden="true">
      <div className="aspect-[2/3] skeleton" />
      <div className="h-3 w-1/2 skeleton" />
      <div className="h-5 w-3/4 skeleton" />
    </div>
  ));
}

/** On the home page this is a section; with `page` it is the /books page and keeps the collection in the URL */
export default function Catalogue({ books, loading, error, onRetry, page = false }) {
  const { t, pick, fmtNum, lang } = useLang();
  const [params, setParams] = useSearchParams();
  const urlCat = page && CATS.includes(params.get('cat')) ? params.get('cat') : 'all';
  const [cat, setCatState] = useState(urlCat);
  useEffect(() => { if (page) setCatState(urlCat); }, [page, urlCat]);
  const setCat = (c) => {
    setCatState(c);
    if (page) setParams(c === 'all' ? {} : { cat: c }, { replace: true });
  };
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = books.filter((b) => {
      if (cat !== 'all' && b.category !== cat) return false;
      if (!needle) return true;
      const hay = [b.title?.en, b.title?.ar, b.author?.name?.en, b.author?.name?.ar, b.translator?.en, b.translator?.ar, b.isbn]
        .filter(Boolean).join(' ').toLowerCase();
      return hay.includes(needle);
    });
    const collator = new Intl.Collator(lang);
    if (sort === 'title') list.sort((a, b) => collator.compare(pick(a.title), pick(b.title)));
    else if (sort === 'price') list.sort((a, b) => (a.price?.dzd || 0) - (b.price?.dzd || 0));
    else list.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
    return list;
  }, [books, cat, q, sort, lang, pick]);

  // Animate the shelf when the filter changes: old cards fall away, new ones rise in
  const key = filtered.map((b) => b.slug).join('|');
  const [shown, setShown] = useState(filtered);
  const [phase, setPhase] = useState('rest');
  const [gen, setGen] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    // First render and first data arrival show the shelf as it is, with no animation
    if (first.current || !shown.length || prefersReducedMotion()) {
      first.current = false;
      setShown(filtered);
      return undefined;
    }
    setPhase('leave');
    const id = setTimeout(() => { setShown(filtered); setGen((g) => g + 1); setPhase('enter'); }, 220);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const keep = new Set(filtered.map((b) => b.slug));
  const count = (c) => (c === 'all' ? books.length : books.filter((b) => b.category === c).length);

  return (
    <section className={`scroll-mt-16 ${page ? 'pb-[clamp(72px,10vw,136px)] pt-[clamp(32px,5vw,64px)]' : 'section'}`} id="catalogue">
      <div className="wrap">
        <div className="mb-[clamp(32px,5vw,56px)] grid items-end gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <Reveal as="p" className="eyebrow">{t('catalogue.eyebrow')}</Reveal>
            <Reveal as={page ? 'h1' : 'h2'} delay={80} className={`mt-3.5 ${page ? 'page-title' : 'text-[clamp(2.2rem,4.6vw,3.8rem)]'}`}>
              {t('catalogue.title', { n: fmtNum(books.length) })}
              <em className="text-cloth">{t('catalogue.titleEm')}</em>
            </Reveal>
          </div>
          <Reveal delay={160} className="flex min-w-0 flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('catalogue.filter')}>
              {CATS.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {t(`cats.${c}`)} <span>{fmtNum(count(c))}</span>
                </button>
              ))}
            </div>
            <div className="flex w-full flex-wrap gap-3 lg:w-auto">
              <label className="relative flex min-w-0 flex-1 items-center lg:w-64 lg:flex-none">
                <Icon name="search" size={16} className="pointer-events-none absolute start-0 text-muted" />
                <span className="sr-only">{t('catalogue.search')}</span>
                <input id="cat-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('catalogue.search')} className="field-line ps-6 text-[15px]" />
              </label>
              <label className="flex items-center gap-2 text-[14px] text-muted">
                <span className="sr-only">{t('catalogue.sort.label')}</span>
                <select id="cat-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="field-line w-auto cursor-pointer pe-2 text-[14px] text-ink">
                  {['newest', 'title', 'price'].map((s) => <option key={s} value={s}>{t(`catalogue.sort.${s}`)}</option>)}
                </select>
              </label>
            </div>
          </Reveal>
        </div>

        {error && !books.length ? (
          <div className="flex flex-col items-start gap-4 border-y border-line py-10">
            <p className="font-display text-2xl">{t('catalogue.error')}</p>
            <p className="text-muted">{errorText(error, t)}</p>
            <button type="button" className="btn btn-sm" onClick={onRetry}>{t('catalogue.retry')}</button>
          </div>
        ) : !loading && !books.length ? (
          <p className="border-y border-line py-10 text-muted">{t('catalogue.none')}</p>
        ) : (
          <>
            <div key={gen} className="grid grid-cols-2 gap-x-[clamp(18px,3vw,40px)] gap-y-[clamp(28px,4vw,48px)] sm:grid-cols-[repeat(auto-fill,minmax(196px,1fr))]">
              {loading && !books.length ? <Skeletons /> : shown.map((b, i) => (
                <BookCard
                  key={b.slug}
                  book={b}
                  className={phase === 'leave' && !keep.has(b.slug) ? 'card-leave' : phase === 'enter' ? 'card-enter' : ''}
                  style={{ '--i': `${i * 60}ms` }}
                />
              ))}
            </div>
            {!loading && q && !filtered.length && phase !== 'leave' && (
              <div className="flex flex-wrap items-center gap-4 border-y border-line py-8">
                <p className="text-muted">{t('catalogue.empty', { q })}</p>
                <button type="button" className="btn btn-quiet btn-sm" onClick={() => setQ('')}>{t('catalogue.clear')}</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
