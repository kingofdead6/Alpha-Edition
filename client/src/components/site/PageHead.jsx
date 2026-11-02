import { Link } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { cld, initials } from '../../lib/util.js';

/** Opening block for inner pages: a breadcrumb, eyebrow, display title and lede */
export default function PageHead({ crumb, eyebrow, title, em, lede, children, className = '' }) {
  const { t } = useLang();
  return (
    <header className={`wrap pb-[clamp(40px,6vw,72px)] pt-[clamp(28px,4vw,52px)] ${className}`}>
      <nav aria-label="Breadcrumb" className="mb-[clamp(28px,4vw,48px)] flex items-center gap-2 font-mono text-[12px] uppercase tracking-[var(--track)] text-muted">
        <Link to="/" className="hover:text-ink">{t('pages.home')}</Link>
        <span aria-hidden="true" className="text-proof">/</span>
        <span aria-current="page" className="text-ink">{crumb}</span>
      </nav>
      <div className="grid items-end gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="eyebrow fade-up">{eyebrow}</p>
          <h1 className="page-title fade-up mt-4" style={{ '--d': '80ms' }}>
            {title}{em && <em className="text-cloth">{em}</em>}
          </h1>
        </div>
        {(lede || children) && (
          <div className="fade-up min-w-0 lg:pb-3" style={{ '--d': '160ms' }}>
            {lede && <p className="max-w-[48ch] text-lg text-muted">{lede}</p>}
            {children}
          </div>
        )}
      </div>
    </header>
  );
}

/** A round portrait: the uploaded photo, or the author's initials on bookcloth */
export function Portrait({ author, px = 160, className = '' }) {
  const { pick, lang } = useLang();
  return (
    <div className={`grid flex-none place-items-center overflow-hidden rounded-full bg-cloth font-display text-clothink ${className}`}>
      {author.photo?.url ? (
        <img src={cld(author.photo.url, `f_auto,q_auto,w_${px * 2},h_${px * 2},c_fill,g_face`)} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className={lang === 'en' ? 'italic' : ''}>{initials(pick(author.name))}</span>
      )}
    </div>
  );
}
