import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useReadingList } from '../../lib/readingList.jsx';
import { formatPrice } from '../../lib/util.js';
import BookCover from '../BookCover.jsx';
import Icon from '../Icon.jsx';
import { SectionLink } from './Header.jsx';

export default function ReadingListDrawer() {
  const { t, pick, lang, fmtNum } = useLang();
  const { items, open, setOpen, remove } = useReadingList();
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    panel.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, setOpen]);

  const total = items.reduce((acc, b) => ({ dzd: acc.dzd + (b.price?.dzd || 0), eur: acc.eur + (b.price?.eur || 0) }), { dzd: 0, eur: 0 });

  return (
    <>
      <div className={`scrim fixed inset-0 z-[80] bg-[rgb(10_16_13/.5)] backdrop-blur-[3px] ${open ? 'open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        ref={panel}
        tabIndex={-1}
        className={`drawer fixed bottom-0 end-0 top-0 z-[85] flex w-[min(420px,100%)] flex-col bg-paper shadow-[0_0_60px_rgb(var(--shadow)/.35)] outline-none ${open ? 'open' : ''}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label={t('list.title')}
        aria-hidden={!open}
        inert={open ? undefined : ''}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="text-3xl">{t('list.title')}</h2>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-ink" onClick={() => setOpen(false)} aria-label={t('nav.close')}>
            <Icon name="x" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-3 px-6">
            <Icon name="bookmark" size={32} className="text-proof" />
            <p className="font-display text-2xl">{t('list.empty')}</p>
            <p className="text-muted">{t('list.emptyHint')}</p>
            <SectionLink id="catalogue" className="btn btn-sm mt-2" onClick={() => setOpen(false)}>{t('list.browse')}</SectionLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((b) => (
                <li key={b.slug} className="flex items-center gap-4 py-4">
                  <Link to={`/books/${b.slug}`} onClick={() => setOpen(false)} className="relative block aspect-[2/3] w-14 flex-none overflow-hidden rounded-sm shadow">
                    <BookCover book={b} size="w_160" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/books/${b.slug}`} onClick={() => setOpen(false)} className="font-display text-lg leading-tight hover:underline">{pick(b.title)}</Link>
                    <p className="text-[14px] text-muted">{pick(b.author?.name)}</p>
                    <p className="font-mono text-[13px] tabular-nums">{formatPrice(b.price, { lang, fmtNum })}</p>
                  </div>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-sm text-muted hover:text-proof" onClick={() => remove(b.slug)} aria-label={t('list.remove', { title: pick(b.title) })}>
                    <Icon name="trash" size={17} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="label">{t('list.total')}</span>
                <span className="font-display text-2xl tabular-nums">{formatPrice(total, { lang, fmtNum })}</span>
              </div>
              <p className="mt-2 text-[13px] text-muted">{t('list.note')}</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
