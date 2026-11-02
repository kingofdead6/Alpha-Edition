import { useLang } from '../lib/i18n.jsx';
import en from '../i18n/en.js';
import ar from '../i18n/ar.js';
import { cld } from '../lib/util.js';

const HOUSE = { en: en.brand.name, ar: ar.brand.name };

/**
 * A book cover: either an uploaded image or a cover drawn in CSS from a motif and three colours.
 * `lang` forces a language (the admin previews both); otherwise the site language is used.
 */
export default function BookCover({ book, lang: forced, className = '', viewName, size = 'w_700' }) {
  const { lang: siteLang } = useLang();
  const lang = forced || siteLang;
  const c = book?.cover || {};
  const style = {
    '--cbg': c.bg || '#1D3A5F',
    '--cfg': c.fg || '#F2E6CC',
    '--cac': c.accent || '#E1A24A',
    ...(viewName ? { viewTransitionName: viewName } : {}),
  };
  const title = book?.title?.[lang] || book?.title?.en || book?.title?.ar || '';
  const author = book?.author?.name?.[lang] || book?.author?.name?.en || book?.author?.name?.ar || '';

  if (c.mode === 'image' && c.image?.url) {
    return (
      <span className={`cover ${className}`} style={style} lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <img className="cover-img" src={cld(c.image.url, `f_auto,q_auto,${size}`)} alt="" loading="lazy" decoding="async" />
      </span>
    );
  }

  return (
    <span className={`cover m-${c.motif || 'dunes'} ${className}`} style={style} lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <span className="cv-house">{HOUSE[lang]}</span>
      <span className="cv-motif" />
      <span className="cv-title">{title}</span>
      <span className="cv-author">{author}</span>
    </span>
  );
}
