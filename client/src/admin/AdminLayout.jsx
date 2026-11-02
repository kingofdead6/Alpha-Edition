import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { useAuth } from '../lib/auth.jsx';
import Icon, { GrassMark } from '../components/Icon.jsx';
import { LangButton, ThemeButton } from '../components/site/Header.jsx';

const NAV = [
  ['', 'grid', 'dashboard'],
  ['books', 'book', 'books'],
  ['authors', 'user', 'authors'],
  ['submissions', 'inbox', 'submissions'],
  ['subscribers', 'mail', 'subscribers'],
  ['settings', 'settings', 'settings'],
];

export default function AdminLayout() {
  const { t } = useLang();
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const prev = document.title;
    document.title = `${t('admin.title')} · ${t('brand.name')}`;
    return () => { document.title = prev; };
  }, [t]);

  const nav = (
    <nav className="grid gap-0.5" aria-label={t('admin.title')}>
      {NAV.map(([to, icon, key]) => (
        <NavLink
          key={key}
          to={`/admin${to ? `/${to}` : ''}`}
          end={!to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded px-3 py-2.5 text-[14.5px] transition-colors ${isActive ? 'bg-ink text-paper' : 'text-muted hover:bg-ink/5 hover:text-ink'}`
          }
        >
          <Icon name={icon} size={18} />
          {t(`admin.nav.${key}`)}
        </NavLink>
      ))}
    </nav>
  );

  const brand = (
    <Link to="/admin" className="flex items-center gap-2 font-display text-xl">
      <GrassMark className="h-6 w-6 text-cloth" />
      <span>{t('brand.name')}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-paper2/60 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-e border-line bg-paper px-4 py-6 lg:flex">
        <div className="px-2">{brand}</div>
        {nav}
        <div className="mt-auto grid gap-3 border-t border-line px-2 pt-4">
          <p className="truncate text-[13px] text-muted">{admin?.email}</p>
          <div className="flex flex-wrap gap-2">
            <LangButton />
            <ThemeButton />
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[14px] text-muted hover:text-ink">
            <Icon name="external" size={16} /> {t('admin.viewSite')}
          </a>
          <button type="button" onClick={logout} className="flex items-center gap-2 text-[14px] text-muted hover:text-proof">
            <Icon name="logout" size={16} className="rtl:rotate-180" /> {t('admin.signOut')}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky z-30 flex items-center justify-between border-b border-line bg-paper px-4 py-3 lg:hidden" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        {brand}
        <button type="button" className="grid h-9 w-9 place-items-center rounded-sm border border-line" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t('nav.menu')}>
          <Icon name={open ? 'x' : 'menu'} />
        </button>
      </header>
      {open && (
        <div className="menu-panel sticky top-[61px] z-20 grid gap-4 border-b border-line bg-paper p-4 lg:hidden">
          {nav}
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <LangButton />
            <ThemeButton />
            <a href="/" target="_blank" rel="noreferrer" className="btn btn-quiet btn-xs"><Icon name="external" size={14} /> {t('admin.viewSite')}</a>
            <button type="button" onClick={logout} className="btn btn-quiet btn-xs"><Icon name="logout" size={14} /> {t('admin.signOut')}</button>
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-7 sm:px-8 sm:py-9">
        <div key={pathname} className="page-in mx-auto max-w-[1180px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
