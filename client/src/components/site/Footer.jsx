import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { api, errorText } from '../../lib/api.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Wordmark() {
  const { t, lang } = useLang();
  // Arabic letters must stay joined, so Arabic animates word by word
  const pieces = lang === 'ar'
    ? [t('brand.first'), ' ', t('brand.second')]
    : [...t('brand.first'), ' ', ...t('brand.second')];
  const firstLen = lang === 'ar' ? 1 : t('brand.first').length;
  return (
    <div className="wordmark mt-[clamp(48px,7vw,90px)]" aria-hidden="true">
      {pieces.map((c, i) => (
        <span key={i} className={i > firstLen ? 'text-cloth' : ''}>{c}</span>
      ))}
    </div>
  );
}

export default function Footer({ settings }) {
  const { t, pick, lang } = useLang();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const mailRef = useRef(null);
  const contact = settings?.contactEmail || 'hello@editions-alfa.com';
  const year = new Date().getFullYear();

  const subscribe = async (e) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) return toast(t('footer.badEmail'));
    setBusy(true);
    try {
      await api('/public/subscribers', { method: 'POST', body: { email: email.trim(), lang } });
      toast(t('footer.subscribed'));
      setEmail('');
    } catch (err) {
      toast(errorText(err, t));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    const select = () => {
      const r = document.createRange();
      r.selectNodeContents(mailRef.current);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      toast(t('footer.selected'));
    };
    try {
      await navigator.clipboard.writeText(contact);
      toast(t('footer.copied'));
    } catch {
      select();
    }
  };

  return (
    <footer className="bg-ink pb-8 pt-[clamp(56px,8vw,96px)] text-paper">
      <div className="wrap">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_.7fr_.7fr]">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <h4 className="mb-3.5 font-mono text-[12px] font-medium uppercase tracking-[var(--track)] opacity-60">{t('footer.letter')}</h4>
            <p className="max-w-[44ch] text-[15px] opacity-85">{t('footer.letterText')}</p>
            <form className="mt-[18px] flex flex-wrap gap-2" onSubmit={subscribe} noValidate>
              <label htmlFor="n-email" className="sr-only">{t('footer.emailLabel')}</label>
              <input
                id="n-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.emailPh')}
                className="min-w-0 flex-[1_1_200px] rounded-sm border border-paper/30 bg-transparent px-4 py-3 text-[15px] text-paper placeholder:text-paper/50 focus:border-paper focus:outline-none"
              />
              <button type="submit" className="btn border-paper bg-paper text-ink [--fill:rgb(var(--proof))] hover:border-proof hover:text-page" disabled={busy}>
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
          <div>
            <h4 className="mb-3.5 font-mono text-[12px] font-medium uppercase tracking-[var(--track)] opacity-60">{t('footer.visit')}</h4>
            <ul className="grid gap-2 text-[15px] opacity-85">
              <li>{pick(settings?.address) || '12 rue des Libraires, Algiers'}</li>
              <li>{pick(settings?.hours) || 'Tue – Sat, 10:00 – 19:00'}</li>
              {settings?.phone && <li dir="ltr" className="text-start">{settings.phone}</li>}
              <li className="mt-1 flex flex-wrap items-center gap-2.5">
                <code ref={mailRef} dir="ltr" className="select-all font-mono text-[14px]">{contact}</code>
                <button type="button" onClick={copy} className="rounded-sm border border-paper/30 px-2 py-1 font-mono text-[12px] hover:border-paper">{t('footer.copy')}</button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3.5 font-mono text-[12px] font-medium uppercase tracking-[var(--track)] opacity-60">{t('footer.read')}</h4>
            <ul className="grid gap-2 text-[15px]">
              <li><Link to="/books" className="opacity-85 hover:underline hover:opacity-100">{t('nav.catalogue')}</Link></li>
              {['fiction', 'essays', 'poetry', 'translation'].map((c) => (
                <li key={c}><Link to={`/books?cat=${c}`} className="opacity-85 hover:underline hover:opacity-100">{t(`cats.${c}`)}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3.5 font-mono text-[12px] font-medium uppercase tracking-[var(--track)] opacity-60">{t('footer.house')}</h4>
            <ul className="grid gap-2 text-[15px]">
              {['about', 'authors', 'submit', 'contact'].map((id) => (
                <li key={id}><Link to={`/${id}`} className="opacity-85 hover:underline hover:opacity-100">{t(`nav.${id}`)}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <Wordmark />
        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-paper/20 pt-5 font-mono text-[12px] leading-relaxed opacity-60">
          <span>{t('footer.colophon')}</span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/privacy" className="hover:underline">{t('nav.privacy')}</Link>
            <Link to="/terms" className="hover:underline">{t('nav.terms')}</Link>
            <Link to="/admin" className="hover:underline">{t('footer.staff')}</Link>
            <span>{t('footer.rights', { year })}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
