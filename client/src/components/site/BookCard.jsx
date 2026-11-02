import { useRef } from 'react';
import { useLang } from '../../lib/i18n.jsx';
import { useReadingList } from '../../lib/readingList.jsx';
import { useToast } from '../../lib/toast.jsx';
import { formatPrice, prefersReducedMotion, useTransitionNavigate } from '../../lib/util.js';
import BookCover from '../BookCover.jsx';
import Icon from '../Icon.jsx';

const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function BookmarkButton({ book, className = '' }) {
  const { t, pick } = useLang();
  const list = useReadingList();
  const toast = useToast();
  const on = list.has(book.slug);
  const title = pick(book.title);
  return (
    <button
      type="button"
      className={`grid h-8 w-8 place-items-center rounded-sm transition-colors ${on ? 'text-proof' : 'text-muted hover:text-ink'} ${className}`}
      aria-pressed={on}
      aria-label={on ? t('list.toggleRemove', { title }) : t('list.toggleAdd', { title })}
      onClick={(e) => {
        e.preventDefault();
        const added = list.toggle(book);
        toast(added ? t('list.added', { title }) : t('list.removed', { title }));
      }}
    >
      <Icon name="bookmark" size={18} fill={on ? 'currentColor' : 'none'} />
    </button>
  );
}

export default function BookCard({ book, className = '', style }) {
  const { t, pick, lang, fmtNum } = useLang();
  const go = useTransitionNavigate();
  const tilt = useRef(null);
  const href = `/books/${book.slug}`;

  const onMove = (e) => {
    if (!finePointer() || prefersReducedMotion() || !tilt.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.current.style.setProperty('--ty', `${x * 16}deg`);
    tilt.current.style.setProperty('--tx', `${-y * 10}deg`);
  };
  const onLeave = () => {
    tilt.current?.style.removeProperty('--ty');
    tilt.current?.style.removeProperty('--tx');
  };

  return (
    <article className={`flex min-w-0 flex-col gap-[18px] ${className}`} style={style}>
      <a
        href={href}
        className="bc-hit"
        aria-label={t('catalogue.details', { title: pick(book.title) })}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          go(href);
        }}
      >
        <div className="bc-3d" ref={tilt}>
          <div className="bc-pages" />
          <BookCover book={book} viewName={`cover-${book.slug}`} size="w_500" />
          {book.newRelease && <span className="badge">{t('catalogue.new')}</span>}
        </div>
      </a>
      <div className="grid gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="label pt-1.5">
            {t(`cats.${book.category}`)}{book.pages ? ` · ${t('catalogue.pp', { n: fmtNum(book.pages) })}` : ''}
          </p>
          <BookmarkButton book={book} className="-me-1.5 -mt-0.5" />
        </div>
        <h3 className="text-[clamp(1.15rem,1.6vw,1.4rem)]">{pick(book.title)}</h3>
        <p className="text-[15px] text-muted">
          {pick(book.author?.name)}
          {pick(book.translator) ? ` · ${t('catalogue.tr', { name: pick(book.translator) })}` : ''}
        </p>
        <p className="mt-1 font-mono text-[14px] tabular-nums">{formatPrice(book.price, { lang, fmtNum })}</p>
      </div>
    </article>
  );
}
