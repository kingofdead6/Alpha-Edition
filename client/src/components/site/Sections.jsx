import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { cld, initials, useCountUp } from '../../lib/util.js';
import Reveal from '../Reveal.jsx';

/* ---------- How a book is made: a timeline that fills as you scroll ---------- */
export function Process() {
  const { t } = useLang();
  const list = useRef(null);
  const steps = t('process.steps');

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = list.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
      el.style.setProperty('--p', p.toFixed(3));
      [...el.children].forEach((s, i, all) => s.classList.toggle('on', p > 0 && p >= i / (all.length - 1) - 0.02));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="section scroll-mt-16 bg-paper2" id="process">
      <div className="wrap">
        <div className="mb-[clamp(36px,5vw,60px)]">
          <Reveal as="p" className="eyebrow">{t('process.eyebrow')}</Reveal>
          <Reveal as="h2" delay={80} className="mt-3.5 max-w-[22ch] text-[clamp(2.2rem,4.6vw,3.8rem)]">
            {t('process.title')}<em className="text-cloth">{t('process.titleEm')}</em>
          </Reveal>
        </div>
        <ol ref={list} className="steps grid list-none gap-[30px] p-0 lg:grid-cols-6 lg:gap-6">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 80} className="step min-w-0">
              <span className="font-mono text-[12px] tracking-[.1em] text-muted">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mb-2 mt-2.5 text-2xl">{s.title}</h3>
              <p className="text-[15px] text-muted">{s.text}</p>
              <span className="mt-3 inline-block font-mono text-[12px] text-gilt">{s.dur}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Numbers ---------- */
function Num({ value, label, delay }) {
  const { fmtNum } = useLang();
  const [ref, v] = useCountUp(value);
  return (
    <Reveal delay={delay} className="grid content-start gap-2 border-t border-ink pt-[18px]">
      <b ref={ref} className="font-display text-[clamp(3rem,6vw,5rem)] font-normal leading-[.95] tracking-[-.02em] tabular-nums">{fmtNum(v)}</b>
      <span className="max-w-[24ch] text-[15px] text-muted">{label}</span>
    </Reveal>
  );
}

export function Numbers({ stats }) {
  const { t } = useLang();
  const s = stats || { titlesInPrint: 184, languages: 19, perYear: 16, sinceYear: 1999 };
  const years = new Date().getFullYear() - (s.sinceYear || 1999);
  return (
    <section className="section">
      <div className="wrap grid grid-cols-2 gap-8 lg:grid-cols-4">
        <Num value={s.titlesInPrint} label={t('numbers.titles')} delay={0} />
        <Num value={s.languages} label={t('numbers.languages')} delay={90} />
        <Num value={s.perYear} label={t('numbers.perYear')} delay={180} />
        <Num value={years} label={t('numbers.years')} delay={270} />
      </div>
    </section>
  );
}

/* ---------- Author in residence ---------- */
export function AuthorSpotlight({ author, books }) {
  const { t, pick, lang } = useLang();
  if (!author) return null;
  const theirBook = books.find((b) => b.author?.id === author.id);
  const name = pick(author.name);
  const ring = t('author.seal', { year: new Date().getFullYear() });

  return (
    <section className="section scroll-mt-16 overflow-x-clip bg-paper2" id="authors">
      <div className="wrap grid items-center gap-[clamp(32px,6vw,90px)] md:grid-cols-[.8fr_1.2fr]">
        <Reveal className="seal relative mx-auto aspect-square w-[min(340px,80vw)]" aria-hidden="true">
          <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full">
            <defs>
              <path id="seal-circle" d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" />
            </defs>
            <circle cx="150" cy="150" r="140" />
            <text key={lang}><textPath href="#seal-circle">{ring}{ring}</textPath></text>
          </svg>
          <div className="absolute inset-[22%] grid place-items-center overflow-hidden rounded-full bg-cloth font-display text-[clamp(3.5rem,9vw,6rem)] text-clothink shadow-[inset_0_0_0_6px_rgb(var(--cloth)),inset_0_0_0_7px_rgb(var(--cloth-ink)/.4)]">
            {author.photo?.url ? (
              <img src={cld(author.photo.url, 'f_auto,q_auto,w_400,h_400,c_fill,g_face')} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className={lang === 'en' ? 'italic' : ''}>{initials(name)}</span>
            )}
          </div>
        </Reveal>
        <div className="min-w-0">
          <Reveal as="p" className="eyebrow">{t('author.eyebrow')}</Reveal>
          <Reveal as="p" delay={80} className={`quote mb-[26px] mt-[18px] font-display text-[clamp(1.7rem,3.4vw,2.8rem)] [text-wrap:balance] ${lang === 'ar' ? 'leading-[1.6]' : 'italic leading-[1.2]'}`}>
            {pick(author.quote)}
          </Reveal>
          <Reveal delay={160} className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1.5">
            <b className="font-semibold">{name}</b>
            <span className="text-[15px] text-muted">
              {theirBook && <>{t('author.of', { title: pick(theirBook.title) })} · </>}
              {pick(author.note)}
            </span>
          </Reveal>
          {theirBook && (
            <Reveal delay={240} className="mt-[30px]">
              <Link to={`/books/${theirBook.slug}#reader`} className="btn btn-ghost">{t('author.cta')} <span className="arr">→</span></Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
