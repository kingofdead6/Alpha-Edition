import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../../lib/i18n.jsx';
import { prefersReducedMotion, useMediaQuery } from '../../lib/util.js';
import Icon from '../Icon.jsx';

const TURN_MS = 800;

/** Splits a sample into pages: paragraphs are kept whole where possible */
function paginate(text, budget) {
  const paras = String(text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const pages = [];
  let cur = [];
  let len = 0;
  const flush = () => { if (cur.length) pages.push(cur); cur = []; len = 0; };
  paras.forEach((p) => {
    if (p.length > budget * 1.25) {
      // long paragraph: break on sentence ends
      const sentences = p.match(/[^.!?؟…]+[.!?؟…]+["»”']?\s*|[^.!?؟…]+$/g) || [p];
      let chunk = '';
      sentences.forEach((s) => {
        if ((chunk + s).length > budget && chunk) { flush(); pages.push([chunk.trim()]); chunk = ''; }
        chunk += s;
      });
      if (chunk.trim()) { if (len + chunk.length > budget) flush(); cur.push(chunk.trim()); len += chunk.length; }
      return;
    }
    if (len + p.length > budget && cur.length) flush();
    cur.push(p);
    len += p.length;
  });
  flush();
  return pages;
}

function Page({ paras, folio, head, side, single, onClick }) {
  return (
    <div className={`leaf-page ${single ? 'single' : side} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <p className="running-head">{head}</p>
      {paras ? (
        <div className="page-text">
          {paras.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      ) : null}
      <span className="folio">{folio}</span>
    </div>
  );
}

export default function Reader({ book }) {
  const { t, pick, lang, fmtNum } = useLang();
  const wide = useMediaQuery('(min-width: 768px)');
  const per = wide ? 2 : 1;
  const pages = useMemo(() => paginate(pick(book.sample), lang === 'ar' ? 470 : 560), [book.sample, pick, lang]);
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(null); // { dir: 'fwd' | 'back', go: bool }
  const timer = useRef();
  const box = useRef(null);

  useEffect(() => { setIndex(0); setTurn(null); }, [lang, per]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const n = pages.length;
  const canNext = index + per < n;
  const canPrev = index > 0;
  const title = pick(book.title);
  const author = pick(book.author?.name);
  // Book convention: author on the left-hand (verso) page, title on the right-hand (recto)
  const head = (i) => (i % 2 === 0 ? title : author);
  const folio = (i) => fmtNum(i + 1);
  const pageAt = (i) => (i >= 0 && i < n ? pages[i] : null);

  const flip = useCallback((dir) => {
    if (turn) return;
    if (dir === 'fwd' && !canNext) return;
    if (dir === 'back' && !canPrev) return;
    const target = dir === 'fwd' ? index + per : Math.max(0, index - per);
    if (prefersReducedMotion() || (!wide && dir === 'back')) { setIndex(target); return; }
    setTurn({ dir, go: false, target });
    requestAnimationFrame(() => requestAnimationFrame(() => setTurn((s) => s && { ...s, go: true })));
    timer.current = setTimeout(() => { setIndex(target); setTurn(null); }, TURN_MS + 40);
  }, [turn, canNext, canPrev, index, per, wide]);

  const onKey = (e) => {
    const rtl = lang === 'ar';
    if (e.key === 'ArrowRight') { e.preventDefault(); flip(rtl ? 'back' : 'fwd'); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); flip(rtl ? 'fwd' : 'back'); }
  };

  if (!n) return null;

  // What sits underneath while a leaf is turning
  let startI = index;
  let endI = index + 1;
  if (turn?.dir === 'fwd') endI = index + 3;
  if (turn?.dir === 'back') startI = index - 2;

  return (
    <section className="section scroll-mt-16 bg-paper2" id="reader" aria-labelledby="reader-title">
      <div className="wrap">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t('reader.eyebrow')}</p>
            <h2 id="reader-title" className="mt-3 text-[clamp(2rem,4vw,3.2rem)]">{t('reader.title')}</h2>
          </div>
          <p className="text-[14px] text-muted">{t('reader.hint')}</p>
        </div>

        <div
          ref={box}
          className="reader-book mx-auto max-w-[980px] outline-none"
          tabIndex={0}
          onKeyDown={onKey}
          role="group"
          aria-roledescription="book"
          aria-label={title}
          style={{ '--turn': `${TURN_MS}ms` }}
        >
          <div
            className={`spread rounded shadow-[0_30px_60px_-28px_rgb(var(--shadow)/.55)] ${wide ? 'grid-cols-2' : 'grid-cols-1'}`}
            lang={lang}
          >
            {wide ? (
              <>
                <Page paras={pageAt(startI)} folio={pageAt(startI) ? folio(startI) : ''} head={head(startI)} side="start" onClick={() => flip('back')} />
                <Page paras={pageAt(endI)} folio={pageAt(endI) ? folio(endI) : ''} head={head(endI)} side="end" onClick={() => flip('fwd')} />
                {turn && (
                  <div className={`leaf ${turn.dir} ${turn.go ? 'go' : ''}`} aria-hidden="true">
                    {turn.dir === 'fwd' ? (
                      <>
                        <div className="face front"><Page paras={pageAt(index + 1)} folio={folio(index + 1)} head={head(index + 1)} side="end" /><span className="shade" /></div>
                        <div className="face back"><Page paras={pageAt(index + 2)} folio={pageAt(index + 2) ? folio(index + 2) : ''} head={head(index + 2)} side="start" /></div>
                      </>
                    ) : (
                      <>
                        <div className="face front"><Page paras={pageAt(index)} folio={folio(index)} head={head(index)} side="start" /><span className="shade" /></div>
                        <div className="face back"><Page paras={pageAt(index - 1)} folio={folio(index - 1)} head={head(index - 1)} side="end" /></div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <Page key={index} paras={pageAt(turn ? index + 1 : index)} folio={folio(turn ? index + 1 : index)} head={head(index)} single onClick={() => flip('fwd')} />
                {turn && (
                  <div className={`leaf fwd single-leaf ${turn.go ? 'go' : ''}`} aria-hidden="true">
                    <div className="face front"><Page paras={pageAt(index)} folio={folio(index)} head={head(index)} single /><span className="shade" /></div>
                    <div className="face back"><div className="leaf-page single" /></div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => flip('back')} disabled={!canPrev || Boolean(turn)} aria-label={t('reader.prev')}>
              <Icon name="arrow" size={16} className="rotate-180 rtl:rotate-0" /> <span className="hidden sm:inline">{t('reader.prev')}</span>
            </button>
            <p className="text-center font-mono text-[13px] tabular-nums text-muted" aria-live="polite">
              {!canNext && index + per >= n && n > per ? t('reader.end') : per === 2 && pageAt(index + 1)
                ? t('reader.pages', { a: fmtNum(index + 1), b: fmtNum(Math.min(index + 2, n)), n: fmtNum(n) })
                : t('reader.page', { a: fmtNum(index + 1), n: fmtNum(n) })}
            </p>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => flip('fwd')} disabled={!canNext || Boolean(turn)} aria-label={t('reader.next')}>
              <span className="hidden sm:inline">{t('reader.next')}</span> <Icon name="arrow" size={16} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
