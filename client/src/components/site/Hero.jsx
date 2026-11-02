import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../lib/i18n.jsx';
import { prefersReducedMotion } from '../../lib/util.js';
import BookCover from '../BookCover.jsx';
import { SectionLink } from './Header.jsx';

const SPINE_LAYOUT = [
  { w: '86%', x: '-6px', r: '-1deg', d: '.5s' },
  { w: '97%', x: '10px', r: '1.2deg', d: '.38s' },
  { w: '84%', x: '-14px', r: '-.6deg', d: '.26s' },
  { w: '93%', x: '4px', r: '.5deg', d: '.14s' },
];

function Epigraph({ text, play }) {
  const [shown, setShown] = useState(play ? '' : text);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!play) { setShown(text); return undefined; }
    let i = 0;
    let id;
    setShown('');
    setTyping(true);
    const step = () => {
      i += 1;
      setShown(text.slice(0, i));
      if (i < text.length) id = setTimeout(step, 36 + Math.random() * 42);
      else id = setTimeout(() => setTyping(false), 1600);
    };
    id = setTimeout(step, 900);
    return () => clearTimeout(id);
  }, [text, play]);
  return (
    <span className="epi">
      {shown}
      {typing && <span className="caret" />}
    </span>
  );
}

function HeroBook({ book }) {
  const { t, pick, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const scene = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) { setOpen(true); return undefined; }
    const id = setTimeout(() => { setOpen(true); setTyped(true); }, 1700);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = scene.current;
    if (!el || prefersReducedMotion()) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', (((e.clientX - r.left) / r.width) - 0.5) * 2);
      el.style.setProperty('--py', (((e.clientY - r.top) / r.height) - 0.5) * 2);
    };
    const leave = () => { el.style.setProperty('--px', 0); el.style.setProperty('--py', 0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, []);

  const title = pick(book.title);
  const year = book.publishedAt ? new Date(book.publishedAt).getFullYear() : new Date().getFullYear();

  return (
    <div className="hero-scene min-w-0" ref={scene}>
      <div className="stack" aria-hidden="true">
        {book.spines.map((s, i) => (
          <div
            key={s.slug}
            className="spine"
            style={{ '--w': SPINE_LAYOUT[i].w, '--x': SPINE_LAYOUT[i].x, '--r': SPINE_LAYOUT[i].r, '--d': SPINE_LAYOUT[i].d, '--sbg': s.cover?.bg, '--sfg': s.cover?.fg }}
          >
            <b>{pick(s.title)}</b>
            <i>{pick(s.author?.name).split(' ').slice(-1)[0]}</i>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`hero-book ${open ? 'is-open' : ''}`}
        aria-pressed={open}
        aria-label={open ? t('hero.close', { title }) : t('hero.open', { title })}
        onClick={() => { setOpen((o) => !o); setTyped(true); }}
      >
        <span className="hb-float"><span className="hb-inner">
          <span className="hb-pages">
            <span className="tp-house">{t('brand.name')}</span>
            <span className="flex flex-col items-center gap-[3.5cqi]">
              <span className="tp-title">{title}</span>
              <span className="tp-sub">{t(`catSingular.${book.category}`)}</span>
              <span className="tp-rule" />
              <span className="tp-author">{pick(book.author?.name)}</span>
            </span>
            <span className="tp-place">{t('brand.place')} · {year}</span>
          </span>
          <span className="hb-cover">
            <span className="hb-front"><BookCover book={book} lang={lang} /></span>
            <span className="hb-inside">
              <Epigraph key={lang} text={pick(book.excerpt) || title} play={typed && !prefersReducedMotion()} />
              <span className="epi-src">— {pick(book.author?.name)}</span>
              <span className="ex-libris">{t('hero.exLibris')}</span>
            </span>
          </span>
        </span></span>
      </button>
      <p className="absolute inset-x-0 -bottom-1.5 text-center font-mono text-[12px] uppercase tracking-[var(--track)] text-muted fade-up" style={{ '--d': '3s' }}>
        {t('hero.hint')}
      </p>
    </div>
  );
}

function HeroScenePlaceholder() {
  return (
    <div className="hero-scene min-w-0" aria-hidden="true">
      <div className="absolute bottom-[172px] left-1/2 h-[var(--bh)] w-[var(--bw)] -translate-x-1/2 skeleton" />
      <div className="stack">
        {SPINE_LAYOUT.map((s, i) => (
          <div key={i} className="mb-0 h-[38px] skeleton" style={{ width: s.w }} />
        ))}
      </div>
    </div>
  );
}

export default function Hero({ books, settings, loading }) {
  const { t, fmtDate, fmtNum } = useLang();

  const featured = books.find((b) => b.featured) || books[0];
  const spines = books.filter((b) => b !== featured).slice(0, 4);
  const now = Date.now();
  const upcoming = books
    .filter((b) => b.publishedAt && new Date(b.publishedAt).getTime() >= now)
    .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))[0];
  const rp = settings?.readingPeriod;
  const since = settings?.stats?.sinceYear || 1999;
  const perYear = settings?.stats?.perYear || 16;

  return (
    <section className="overflow-x-clip pb-[clamp(48px,7vw,96px)] pt-[clamp(36px,6vw,80px)]">
      <div className="wrap grid items-center gap-[clamp(24px,4vw,64px)] lg:grid-cols-[1.08fr_.92fr]">
        <div className="min-w-0">
          <p className="eyebrow flex flex-wrap items-center gap-2.5">
            <span className="dot" aria-hidden="true" />
            {t('hero.eyebrow', { year: since })}
          </p>
          <h1 className="hero-title mb-[26px] mt-[22px]">
            <span className="line"><span>{t('hero.line1')}</span></span>
            <span className="line">
              <span>
                <span className="proofed">
                  {t('hero.proofed')}
                  <svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
                    <path pathLength="1" d="M24,62 C 10,30 70,8 130,10 C 196,12 204,62 160,84 C 112,104 30,96 16,64 C 8,44 40,22 74,16" />
                  </svg>
                  <span className="stet" aria-hidden="true">{t('hero.stet')}</span>
                </span>
                {t('hero.after')}
              </span>
            </span>
            <span className="line"><span><em className="font-normal text-cloth">{t('hero.em')}</em>{t('hero.rest')}</span></span>
          </h1>
          <p className="fade-up max-w-[52ch] text-[clamp(17px,1.5vw,19px)] text-muted" style={{ '--d': '.5s' }}>
            {t('hero.ledeA')}
            <strong className="font-semibold text-ink">{t('hero.ledeStrong', { n: fmtNum(perYear) })}</strong>
            {t('hero.ledeB')}
          </p>
          <div className="fade-up mt-[30px] flex flex-wrap gap-3" style={{ '--d': '.65s' }}>
            <SectionLink id="catalogue" className="btn">{t('hero.ctaPrimary')} <span className="arr">→</span></SectionLink>
            <SectionLink id="submit" className="btn btn-ghost">{t('hero.ctaSecondary')}</SectionLink>
          </div>
          <dl className="fade-up mt-10 flex flex-wrap gap-x-10 gap-y-3 border-t border-line pt-5" style={{ '--d': '.8s' }}>
            <div>
              <dt className="label">{t('hero.nextRelease')}</dt>
              <dd className="mt-1 font-display text-xl">
                {upcoming ? fmtDate(upcoming.publishedAt) : loading ? <span className="inline-block h-5 w-36 skeleton" /> : '—'}
              </dd>
            </div>
            <div>
              <dt className="label">{t('hero.readingPeriod')}</dt>
              <dd className="mt-1 font-display text-xl">
                {!rp ? (loading ? <span className="inline-block h-5 w-36 skeleton" /> : '—')
                  : rp.isOpen ? (rp.endsAt ? t('hero.openUntil', { date: fmtDate(rp.endsAt) }) : t('hero.openNow'))
                    : t('hero.closed')}
              </dd>
            </div>
          </dl>
        </div>

        {featured ? <HeroBook key={featured.slug} book={{ ...featured, spines }} /> : <HeroScenePlaceholder />}
      </div>
    </section>
  );
}
