import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { usePageTitle } from '../lib/util.js';
import PageHead from '../components/site/PageHead.jsx';

const UPDATED = '2026-11-02';

/** Privacy policy and terms: one long text with a contents list that follows your place */
export default function LegalPage({ kind }) {
  const { data } = useOutletContext();
  const { t, fmtDate } = useLang();
  const doc = t(`legal.${kind}`);
  const contact = data?.settings?.contactEmail || 'hello@editions-alfa.com';
  const [active, setActive] = useState(0);
  usePageTitle(doc.title, t('brand.name'));

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const els = doc.sections.map((_, i) => document.getElementById(`${kind}-${i}`)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(Number(hit.target.id.split('-').pop()));
      },
      { rootMargin: '-20% 0px -65% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [kind, doc.sections]);

  const jump = (i) => (e) => {
    e.preventDefault();
    document.getElementById(`${kind}-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(i);
  };

  return (
    <>
      <PageHead crumb={doc.title} eyebrow={t('legal.updated', { date: fmtDate(UPDATED) })} title={doc.title} lede={doc.lede} />
      <section className="wrap grid gap-12 pb-[clamp(72px,10vw,136px)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label={t('legal.onThisPage')} className="toc hidden self-start lg:sticky lg:top-28 lg:block">
          <p className="label mb-4">{t('legal.onThisPage')}</p>
          <ol className="grid list-none gap-1 p-0">
            {doc.sections.map((s, i) => (
              <li key={s.h}>
                <a
                  href={`#${kind}-${i}`}
                  onClick={jump(i)}
                  aria-current={active === i ? 'true' : undefined}
                  className="block border-s-2 border-transparent py-1.5 ps-3 text-[14px] text-muted transition-colors hover:text-ink"
                >
                  {s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal page-in min-w-0 border-t border-line">
          {doc.sections.map((s, i) => (
            <div key={s.h} id={`${kind}-${i}`} className="scroll-mt-24">
              <h2>
                <span className="me-3 font-mono text-[13px] text-proof">{String(i + 1).padStart(2, '0')}</span>
                {s.h}
              </h2>
              {s.p.map((p) => <p key={p}>{p}</p>)}
              {s.list && <ul>{s.list.map((li) => <li key={li}>{li}</li>)}</ul>}
            </div>
          ))}
          <p className="mt-14 border-t border-line pt-6">
            <a href={`mailto:${contact}`} dir="ltr" className="font-mono text-[15px] text-ink underline decoration-line underline-offset-4 hover:decoration-proof">{contact}</a>
          </p>
        </article>
      </section>
    </>
  );
}
