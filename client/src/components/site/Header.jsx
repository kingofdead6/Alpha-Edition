import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useTheme } from '../../lib/theme.jsx';
import { useReadingList } from '../../lib/readingList.jsx';
import Icon, { GrassMark } from '../Icon.jsx';

/** In-page anchor on the home page, router link everywhere else */
export function SectionLink({ id, className, children, onClick }) {
  const { pathname } = useLocation();
  if (pathname === '/') return <a href={`#${id}`} className={className} onClick={onClick}>{children}</a>;
  return <Link to={`/#${id}`} className={className} onClick={onClick}>{children}</Link>;
}

export const PAGES = [
  ['/books', 'nav.catalogue'],
  ['/authors', 'nav.authors'],
  ['/about', 'nav.about'],
  ['/submit', 'nav.submit'],
  ['/contact', 'nav.contact'],
];

export function ThemeButton({ className = '' }) {
  const { t } = useLang();
  const { mode, cycle } = useTheme();
  const icon = mode === 'dark' ? 'moon' : mode === 'light' ? 'sun' : 'monitor';
  return (
    <button
      type="button"
      onClick={cycle}
      className={`grid h-9 w-9 place-items-center rounded-sm border border-line text-ink transition-colors hover:border-ink ${className}`}
      aria-label={`${t('nav.theme.label')}: ${t(`nav.theme.${mode}`)}`}
      title={t(`nav.theme.${mode}`)}
    >
      <Icon name={icon} size={17} />
    </button>
  );
}

export function LangButton({ className = '' }) {
  const { t, other, toggle } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      lang={other}
      className={`inline-flex h-9 items-center gap-2 rounded-sm border border-line px-3 text-[14px] font-medium text-ink transition-colors hover:border-ink ${className}`}
      aria-label={t('nav.switchLangLabel')}
    >
      <Icon name="globe" size={16} />
      <span className={other === 'ar' ? "font-['IBM_Plex_Sans_Arabic']" : "font-['Hanken_Grotesk']"}>{t('nav.switchLang')}</span>
    </button>
  );
}

export default function Header() {
  const { t } = useLang();
  const { items, setOpen, pulse } = useReadingList();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!pulse) return undefined;
    setBump(true);
    const id = setTimeout(() => setBump(false), 520);
    return () => clearTimeout(id);
  }, [pulse]);

  useEffect(() => setMenu(false), [pathname]);

  return (
    <header
      className={`site-head sticky z-50 border-b transition-colors ${scrolled ? 'border-line' : 'border-transparent'}`}
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="wrap flex items-center gap-4 py-3.5 lg:gap-6">
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap font-display text-[22px] no-underline" aria-label={t('nav.home')}>
          <GrassMark className="h-7 w-7 text-cloth" />
          <span>
            {t('brand.first')} <em className="text-cloth">{t('brand.second')}</em>
          </span>
        </Link>

        <nav className="ms-auto hidden gap-6 lg:flex xl:gap-7" aria-label="Main">
          {PAGES.map(([to, key]) => (
            <NavLink key={to} to={to} className="navlink text-[15px] font-medium text-muted transition-colors hover:text-ink">
              {t(key)}
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <LangButton className="hidden sm:inline-flex" />
          <ThemeButton className="hidden sm:grid" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-line px-2.5 text-[14px] font-medium text-ink transition-colors hover:border-ink"
            aria-label={t('nav.readingList')}
          >
            <Icon name="bookmark" size={16} />
            <span className="hidden md:inline">{t('nav.readingList')}</span>
            <b className={`min-w-[20px] rounded-sm bg-ink px-1.5 py-0.5 text-center font-mono text-[12px] font-medium tabular-nums text-paper ${bump ? 'bump' : ''}`}>
              {items.length}
            </b>
          </button>
          <Link to="/submit" className="btn btn-sm hidden md:inline-flex">
            {t('nav.submitCta')} <span className="arr">→</span>
          </Link>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-sm border border-line lg:hidden"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? t('nav.close') : t('nav.menu')}
            onClick={() => setMenu((m) => !m)}
          >
            <Icon name={menu ? 'x' : 'menu'} />
          </button>
        </div>
      </div>

      {menu && (
        <div id="mobile-menu" className="menu-panel border-t border-line bg-paper lg:hidden">
          <nav className="wrap flex flex-col py-3" aria-label="Main">
            {PAGES.map(([to, key]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenu(false)}
                className={({ isActive }) => `flex items-center justify-between border-b border-line py-3.5 font-display text-2xl last:border-0 ${isActive ? 'text-cloth' : ''}`}
              >
                {t(key)}
                <Icon name="chevron" size={18} className="text-muted rtl:rotate-180" />
              </NavLink>
            ))}
            <div className="flex gap-2 pb-2 pt-4 sm:hidden">
              <LangButton />
              <ThemeButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
