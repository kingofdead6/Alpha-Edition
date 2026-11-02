import { Link, useOutletContext } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { useToast } from '../lib/toast.jsx';
import { usePageTitle } from '../lib/util.js';
import PageHead from '../components/site/PageHead.jsx';
import Reveal from '../components/Reveal.jsx';
import Icon from '../components/Icon.jsx';

function Desk({ title, text, email, delay }) {
  const { t } = useLang();
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast(t('contact.copied', { email }));
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <Reveal delay={delay} className="grid content-start gap-3 border-t border-ink pt-6">
      <h2 className="text-[clamp(1.5rem,2.2vw,1.9rem)]">{title}</h2>
      <p className="text-[15px] text-muted">{text}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <a href={`mailto:${email}`} dir="ltr" className="font-mono text-[14px] underline decoration-line underline-offset-4 hover:decoration-proof">{email}</a>
        <button type="button" onClick={copy} className="grid h-7 w-7 place-items-center rounded-sm text-muted hover:text-ink" aria-label={`${t('contact.copy')} ${email}`}>
          <Icon name="copy" size={15} />
        </button>
      </div>
    </Reveal>
  );
}

export default function ContactPage() {
  const { data } = useOutletContext();
  const { t, pick } = useLang();
  const settings = data?.settings;
  const main = settings?.contactEmail || 'hello@editions-alfa.com';
  const domain = main.split('@')[1] || 'editions-alfa.com';
  usePageTitle(t('nav.contact'), t('brand.name'));

  const desks = [
    ['general', main],
    ['press', `press@${domain}`],
    ['rights', `rights@${domain}`],
    ['bookshops', `orders@${domain}`],
  ];

  return (
    <>
      <PageHead crumb={t('nav.contact')} eyebrow={t('contact.eyebrow')} title={t('contact.title')} em={t('contact.titleEm')} lede={t('contact.lede')} />

      <section className="wrap pb-[clamp(72px,10vw,136px)]">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {desks.map(([k, email], i) => (
            <Desk key={k} title={t(`contact.${k}`)} text={t(`contact.${k}Text`)} email={email} delay={i * 80} />
          ))}
        </div>
      </section>

      <section className="section bg-paper2">
        <div className="wrap grid items-center gap-[clamp(32px,6vw,90px)] lg:grid-cols-[1fr_1fr]">
          {/* A street plate, the way Algiers marks its streets */}
          <Reveal className="mx-auto w-full max-w-[460px]" aria-hidden="true">
            <div className="rotate-[-2deg] rounded-[14px] border-[3px] border-[#F4F1E6] bg-[#1F4E8C] p-2 shadow-[0_24px_50px_-24px_rgb(var(--shadow)/.6)] rtl:rotate-[2deg]">
              <div className="grid gap-2 rounded-[9px] border-2 border-[#F4F1E6] px-6 py-7 text-center text-[#F4F1E6]">
                <span className="font-mono text-[12px] uppercase tracking-[.2em] opacity-80">{t('brand.name')}</span>
                <span className="font-display text-[clamp(1.6rem,3.2vw,2.3rem)] leading-tight">{pick(settings?.address) || '12 rue des Libraires, Algiers Centre'}</span>
                <span className="font-['Amiri'] text-[1.35rem] opacity-90" lang="ar">شارع الكتبيين</span>
              </div>
            </div>
          </Reveal>

          <div className="min-w-0">
            <Reveal as="p" className="eyebrow">{t('brand.place')}</Reveal>
            <Reveal as="h2" delay={80} className="mb-8 mt-3.5 text-[clamp(2.2rem,4.6vw,3.6rem)]">{t('contact.visit')}</Reveal>
            <Reveal delay={160}>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-8 gap-y-3 border-t border-line pt-5 text-[15px]">
                <dt className="label pt-0.5">{t('admin.settings.address')}</dt>
                <dd>{pick(settings?.address) || '12 rue des Libraires, Algiers Centre'}</dd>
                <dt className="label pt-0.5">{t('contact.hours')}</dt>
                <dd>{pick(settings?.hours) || 'Tue – Sat, 10:00 – 19:00'}</dd>
                {settings?.phone && (
                  <>
                    <dt className="label pt-0.5">{t('contact.phone')}</dt>
                    <dd><a href={`tel:${settings.phone.replace(/\s+/g, '')}`} dir="ltr" className="tabular-nums hover:underline">{settings.phone}</a></dd>
                  </>
                )}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <Reveal className="wrap">
          <div className="grid items-center gap-6 rounded border border-dashed border-proof p-[clamp(24px,4vw,44px)] md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <h2 className="text-[clamp(1.8rem,3vw,2.4rem)]">{t('contact.manuscripts')}</h2>
              <p className="mt-2 max-w-[56ch] text-muted">{t('contact.manuscriptsText')}</p>
            </div>
            <Link to="/submit" className="btn justify-self-start">{t('contact.toSubmit')} <span className="arr">→</span></Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
