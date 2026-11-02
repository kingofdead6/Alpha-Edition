import { useOutletContext } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { usePageTitle } from '../lib/util.js';
import Submit from '../components/site/Submit.jsx';
import Reveal from '../components/Reveal.jsx';
import Icon from '../components/Icon.jsx';

export function Faq({ items }) {
  return (
    <div className="faq border-b border-line">
      {items.map((f, i) => (
        <Reveal as="details" key={f.q} delay={Math.min(i, 4) * 60} className="border-t border-line">
          <summary className="flex items-center justify-between gap-6 py-5 font-display text-[clamp(1.2rem,1.9vw,1.5rem)] leading-snug transition-colors hover:text-cloth">
            {f.q}
            <Icon name="plus" size={20} className="plus text-muted" />
          </summary>
          <p className="answer max-w-[62ch] pb-6 text-muted">{f.a}</p>
        </Reveal>
      ))}
    </div>
  );
}

export default function SubmitPage() {
  const { data } = useOutletContext();
  const { t } = useLang();
  usePageTitle(t('nav.submit'), t('brand.name'));

  return (
    <>
      <Submit settings={data?.settings} page />

      <section className="section bg-paper2">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">{t('submitPage.stepsEyebrow')}</Reveal>
          <ol className="mt-8 grid list-none gap-8 p-0 md:grid-cols-3">
            {t('submitPage.steps').map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 90} className="grid content-start gap-2 border-t border-ink pt-5">
                <span className="font-mono text-[12px] tracking-[.1em] text-proof">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="text-2xl">{s.title}</h2>
                <p className="text-[15px] text-muted">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid gap-[clamp(32px,6vw,90px)] lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Reveal as="p" className="eyebrow">{t('submitPage.faqEyebrow')}</Reveal>
            <Reveal as="h2" delay={80} className="mt-3.5 text-[clamp(2.2rem,4.6vw,3.8rem)]">{t('submitPage.faqTitle')}</Reveal>
          </div>
          <Faq items={t('submitPage.faq')} />
        </div>
      </section>
    </>
  );
}
