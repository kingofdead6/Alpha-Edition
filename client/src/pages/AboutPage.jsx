import { Link, useOutletContext } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { usePageTitle } from '../lib/util.js';
import PageHead from '../components/site/PageHead.jsx';
import { Numbers, Process } from '../components/site/Sections.jsx';
import Reveal from '../components/Reveal.jsx';
import { GrassMark } from '../components/Icon.jsx';

const NUMERALS = ['I', 'II', 'III'];

export default function AboutPage() {
  const { data } = useOutletContext();
  const { t } = useLang();
  const stats = data?.settings?.stats;
  usePageTitle(t('nav.about'), t('brand.name'));

  return (
    <>
      <PageHead
        crumb={t('nav.about')}
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
        em={t('about.titleEm')}
        lede={t('about.lede', { year: stats?.sinceYear || 1999 })}
      />

      {/* Principles */}
      <section className="wrap pb-[clamp(72px,10vw,136px)]">
        <Reveal as="p" className="eyebrow mb-8">{t('about.principlesEyebrow')}</Reveal>
        <ol className="grid list-none gap-10 p-0 md:grid-cols-3">
          {t('about.principles').map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 90} className="grid content-start gap-3 border-t border-ink pt-6">
              <span className="font-display text-4xl italic text-proof" aria-hidden="true">{NUMERALS[i]}</span>
              <h2 className="text-[clamp(1.5rem,2.2vw,1.9rem)]">{p.title}</h2>
              <p className="text-[15px] text-muted">{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* The paper */}
      <section className="section relative overflow-hidden bg-cloth text-clothink">
        <GrassMark className="pointer-events-none absolute -bottom-16 end-[-6%] h-[min(560px,90vw)] w-[min(560px,90vw)] opacity-[.09]" />
        <div className="wrap relative grid items-end gap-[clamp(32px,6vw,90px)] lg:grid-cols-[1.1fr_.9fr]">
          <div className="min-w-0">
            <Reveal as="p" className="font-mono text-[12px] uppercase tracking-[var(--track)] opacity-70">{t('about.paper.eyebrow')}</Reveal>
            <Reveal as="h2" delay={80} className="mb-6 mt-3.5 text-[clamp(2.4rem,5vw,4.2rem)] italic">{t('about.paper.title')}</Reveal>
            <Reveal as="p" delay={160} className="max-w-[56ch] text-[18px] leading-relaxed opacity-90">{t('about.paper.text')}</Reveal>
          </div>
          <dl className="grid gap-6">
            {t('about.paper.facts').map(([k, v], i) => (
              <Reveal key={k} delay={200 + i * 90} className="flex items-baseline justify-between gap-6 border-t border-clothink/30 pt-4">
                <dt className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-none tabular-nums">{k}</dt>
                <dd className="text-end text-[15px] opacity-80">{v}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <Process />
      <Numbers stats={stats} />

      {/* Places */}
      <section className="section bg-paper2">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">{t('about.places.eyebrow')}</Reveal>
          <Reveal as="h2" delay={80} className="mb-12 mt-3.5 text-[clamp(2.2rem,4.6vw,3.8rem)]">{t('about.places.title')}</Reveal>
          <div className="grid gap-10 md:grid-cols-2">
            {t('about.places.list').map((p, i) => (
              <Reveal key={p.city} delay={i * 90} className="grid content-start gap-3 border-t border-ink pt-6">
                <h3 className="text-[clamp(2rem,3.6vw,3rem)]">{p.city}</h3>
                <p className="max-w-[44ch] text-muted">{p.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200} className="mt-14">
            <Link to="/contact" className="btn">{t('about.cta')} <span className="arr">→</span></Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
