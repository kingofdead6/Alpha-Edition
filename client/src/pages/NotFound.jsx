import { Link } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';

export default function NotFound({ message }) {
  const { t } = useLang();
  return (
    <section className="wrap grid min-h-[60vh] content-center gap-5 py-24">
      <p className="font-hand text-4xl text-proof">{t('hero.stet')}?</p>
      <h1 className="max-w-[18ch] text-[clamp(2.4rem,6vw,4.6rem)]">{t('notFound.title')}</h1>
      <p className="max-w-[48ch] text-lg text-muted">{message || t('notFound.text')}</p>
      <Link to="/" className="btn mt-2 justify-self-start">{t('notFound.home')} <span className="arr">→</span></Link>
    </section>
  );
}
