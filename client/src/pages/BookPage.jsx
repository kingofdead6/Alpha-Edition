import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { useBook } from '../lib/siteData.js';
import { useReadingList } from '../lib/readingList.jsx';
import { useToast } from '../lib/toast.jsx';
import { cld, formatPrice, initials, prefersReducedMotion } from '../lib/util.js';
import BookCover from '../components/BookCover.jsx';
import BookCard from '../components/site/BookCard.jsx';
import Reader from '../components/site/Reader.jsx';
import Icon from '../components/Icon.jsx';
import NotFound from './NotFound.jsx';

function Specs({ book }) {
  const { t, fmtDate, fmtNum } = useLang();
  const rows = [
    ['pages', book.pages ? fmtNum(book.pages) : null],
    ['format', book.format],
    ['binding', t('book.binding')],
    ['paper', t('book.paper')],
    ['isbn', book.isbn ? <span dir="ltr">{book.isbn}</span> : null],
    ['published', book.publishedAt ? fmtDate(book.publishedAt) : null],
  ].filter(([, v]) => v);
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 border-t border-line pt-5 text-[15px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="label pt-0.5">{t(`book.specs.${k}`)}</dt>
          <dd className="tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function BookPage() {
  const { slug } = useParams();
  const { hash } = useLocation();
  const { t, pick, lang, fmtDate, fmtNum } = useLang();
  const { book, related, error, full } = useBook(slug);
  const list = useReadingList();
  const toast = useToast();
  const tilt = useRef(null);

  // Runs inside the view transition's flushSync, so the new page is captured at the top
  useLayoutEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (hash === '#reader' && full) document.getElementById('reader')?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, full]);

  useEffect(() => {
    if (book) document.title = `${pick(book.title)} · ${t('brand.name')}`;
    return () => { document.title = 'Éditions Alfa · منشورات ألفا'; };
  }, [book, pick, t]);

  if (error?.status === 404) return <NotFound message={t('book.notFound')} />;
  if (!book) {
    return (
      <div className="wrap grid gap-10 py-20 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]" aria-busy="true">
        <div className="mx-auto aspect-[2/3] w-[min(340px,70vw)] skeleton" />
        <div className="grid content-start gap-4">
          <div className="h-3 w-40 skeleton" />
          <div className="h-14 w-3/4 skeleton" />
          <div className="h-5 w-1/3 skeleton" />
          <div className="h-24 w-full skeleton" />
          <p className="text-muted">{t('book.loading')}</p>
        </div>
      </div>
    );
  }

  const title = pick(book.title);
  const onList = list.has(book.slug);
  const upcoming = book.publishedAt && new Date(book.publishedAt) > new Date();
  const translator = pick(book.translator);
  const onMove = (e) => {
    if (prefersReducedMotion() || !tilt.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    tilt.current.style.setProperty('--ty', `${((e.clientX - r.left) / r.width - 0.5) * 18}deg`);
    tilt.current.style.setProperty('--tx', `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`);
  };

  return (
    <>
      <section className="pb-[clamp(56px,8vw,110px)] pt-[clamp(24px,4vw,48px)]">
        <div className="wrap">
          <Link to="/books" className="mb-8 inline-flex items-center gap-2 text-[15px] text-muted hover:text-ink">
            <Icon name="arrow" size={16} className="rotate-180 rtl:rotate-0" /> {t('book.back')}
          </Link>
          <div className="grid items-start gap-[clamp(32px,6vw,90px)] md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
            <div className="md:sticky md:top-28" onPointerMove={onMove} onPointerLeave={() => { tilt.current?.style.removeProperty('--tx'); tilt.current?.style.removeProperty('--ty'); }}>
              <div className="bc-hit mx-auto w-[min(360px,72vw)] cursor-default">
                <div className="bc-3d" ref={tilt}>
                  <div className="bc-pages" style={{ transform: 'translateZ(-2px) translate(10px, -6px)' }} />
                  <BookCover book={book} viewName={`cover-${book.slug}`} size="w_900" className="shadow-[16px_30px_50px_-18px_rgb(var(--shadow)/.55)]" />
                  {book.newRelease && <span className="badge">{t('catalogue.new')}</span>}
                </div>
              </div>
            </div>

            <div className="page-in min-w-0">
              <p className="eyebrow">
                {t(`cats.${book.category}`)} · {book.publishedAt ? t(upcoming ? 'book.coming' : 'book.published', { date: fmtDate(book.publishedAt) }) : ''}
              </p>
              <h1 className="mb-3 mt-4 text-[clamp(2.6rem,6vw,5rem)]">{title}</h1>
              <p className="text-lg text-muted">
                {book.author?.slug
                  ? <Link to={`/authors/${book.author.slug}`} className="underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-proof">{pick(book.author.name)}</Link>
                  : pick(book.author?.name)}
                {translator && (
                  <span className="block text-[15px]">
                    {book.translatedFrom
                      ? t('book.translatedFrom', { lang: t(`langs.${book.translatedFrom}`), name: translator })
                      : t('book.translatedBy', { name: translator })}
                  </span>
                )}
              </p>

              {pick(book.synopsis) && <p className="mt-7 max-w-[60ch] text-[18px] leading-relaxed">{pick(book.synopsis)}</p>}
              {pick(book.excerpt) && (
                <blockquote className="my-8 max-w-[52ch] border-s-2 border-proof ps-5 font-display text-[1.45rem] leading-snug">
                  <span className={lang === 'en' ? 'italic' : ''}>{pick(book.excerpt)}</span>
                </blockquote>
              )}

              <div className="mb-8 flex flex-wrap items-center gap-4">
                <span className="font-display text-3xl tabular-nums">{formatPrice(book.price, { lang, fmtNum })}</span>
                <button
                  type="button"
                  className={`btn ${onList ? 'btn-ghost' : ''}`}
                  aria-pressed={onList}
                  onClick={() => {
                    const added = list.toggle(book);
                    toast(added ? t('list.added', { title }) : t('list.removed', { title }));
                  }}
                >
                  <Icon name="bookmark" size={16} fill={onList ? 'currentColor' : 'none'} />
                  {onList ? t('book.added') : t('book.add')}
                </button>
                {book.hasSample && (
                  <a href="#reader" className="btn btn-quiet">{t('book.lookInside')} <span className="arr">→</span></a>
                )}
              </div>

              <Specs book={book} />

              {book.author?.bio && pick(book.author.bio) && (
                <div className="mt-10 flex gap-5 border-t border-line pt-8">
                  <div className="grid h-16 w-16 flex-none place-items-center overflow-hidden rounded-full bg-cloth font-display text-xl text-clothink">
                    {book.author.photo?.url
                      ? <img src={cld(book.author.photo.url, 'f_auto,q_auto,w_160,h_160,c_fill,g_face')} alt="" className="h-full w-full object-cover" />
                      : initials(pick(book.author.name))}
                  </div>
                  <div className="min-w-0">
                    <p className="label">{t('book.aboutAuthor')}</p>
                    <p className="mt-2 max-w-[56ch] text-muted">{pick(book.author.bio)}</p>
                    <Link to={`/authors/${book.author.slug}`} className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-medium hover:text-cloth">
                      {pick(book.author.name)} <Icon name="arrow" size={15} className="rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {book.sample && <Reader book={book} />}

      {related.length > 0 && (
        <section className="section">
          <div className="wrap">
            <p className="eyebrow">{t('book.more')}</p>
            <div className="mt-8 grid grid-cols-2 gap-x-[clamp(18px,3vw,40px)] gap-y-10 sm:grid-cols-[repeat(auto-fill,minmax(196px,1fr))]">
              {related.map((b) => <BookCard key={b.slug} book={b} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
