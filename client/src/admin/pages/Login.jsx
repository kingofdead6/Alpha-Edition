import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { errorText } from '../../lib/api.js';
import { GrassMark } from '../../components/Icon.jsx';
import { LangButton, ThemeButton } from '../../components/site/Header.jsx';
import BookCover from '../../components/BookCover.jsx';

const DEMO = { title: { en: 'The Ledger', ar: 'الدفتر' }, author: { name: { en: 'Éditions Alfa', ar: 'منشورات ألفا' } }, cover: { motif: 'tiles', bg: '#1E4636', fg: '#EADFC2', accent: '#D7B15B' } };

export default function Login() {
  const { t } = useLang();
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (admin) return <Navigate to={location.state?.from || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(errorText(err, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden place-items-center overflow-hidden bg-cloth lg:grid" aria-hidden="true">
        <div className="relative aspect-[2/3] w-[260px] -rotate-6 shadow-[30px_40px_60px_-20px_rgba(0,0,0,.5)]" style={{ animation: 'rise 1s var(--ease) both' }}>
          <BookCover book={DEMO} />
        </div>
        <p className="absolute bottom-8 start-8 font-hand text-3xl text-[rgb(var(--orn))]">{t('hero.exLibris')}</p>
      </div>
      <div className="flex flex-col px-[max(16px,env(safe-area-inset-left,0px))] py-8 sm:px-12">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-display text-xl"><GrassMark className="h-6 w-6 text-cloth" /> {t('brand.name')}</Link>
          <div className="flex gap-2"><LangButton /><ThemeButton /></div>
        </div>
        <form onSubmit={submit} className="page-in mx-auto my-auto grid w-full max-w-[380px] gap-5 py-12" noValidate>
          <div>
            <h1 className="text-4xl">{t('admin.signInTitle')}</h1>
            <p className="mt-2 text-muted">{t('admin.signInText')}</p>
          </div>
          <label className="grid gap-1.5" htmlFor="login-email">
            <span className="text-[13.5px] font-medium">{t('admin.email')}</span>
            <input id="login-email" type="email" dir="ltr" autoComplete="username" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="grid gap-1.5" htmlFor="login-password">
            <span className="text-[13.5px] font-medium">{t('admin.password')}</span>
            <input id="login-password" type="password" dir="ltr" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="rounded border border-proof/40 bg-proof/5 px-3 py-2 text-[14px] text-proof" role="alert">{error}</p>}
          <button type="submit" className="btn" disabled={busy || !email || !password}>{busy ? t('admin.signingIn') : t('admin.signIn')}</button>
        </form>
      </div>
    </div>
  );
}
