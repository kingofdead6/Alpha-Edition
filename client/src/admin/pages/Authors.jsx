import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { api, errorText } from '../../lib/api.js';
import { cld, initials } from '../../lib/util.js';
import Icon from '../../components/Icon.jsx';
import { ConfirmButton, Empty, ErrorBox, Loading, PageHeader, StatusPill } from '../ui.jsx';

export default function Authors() {
  const { t, pick, fmtNum } = useLang();
  const toast = useToast();
  const [authors, setAuthors] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    setError(null);
    api(`/admin/authors${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`).then((d) => setAuthors(d.authors)).catch(setError);
  }, [q]);

  useEffect(() => {
    const id = setTimeout(load, 220);
    return () => clearTimeout(id);
  }, [load]);

  const remove = async (a) => {
    try {
      await api(`/admin/authors/${a._id}`, { method: 'DELETE' });
      setAuthors((list) => list.filter((x) => x._id !== a._id));
      toast(t('admin.common.deleted'));
    } catch (err) {
      toast(errorText(err, t));
    }
  };

  return (
    <>
      <PageHeader title={t('admin.authors.title')} actions={<Link to="/admin/authors/new" className="btn btn-sm"><Icon name="plus" size={15} /> {t('admin.authors.add')}</Link>} />
      <label className="relative mb-5 block max-w-md">
        <span className="sr-only">{t('admin.authors.search')}</span>
        <Icon name="search" size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
        <input id="authors-q" type="search" className="input ps-9" placeholder={t('admin.authors.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      <ErrorBox error={error} onRetry={load} />
      {!authors && !error && <Loading />}
      {authors && authors.length === 0 && <Empty action={<Link to="/admin/authors/new" className="btn btn-sm">{t('admin.authors.add')}</Link>}>{t('admin.authors.empty')}</Empty>}

      {authors && authors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {authors.map((a) => (
            <div key={a._id} className="card flex items-center gap-4 p-4">
              <Link to={`/admin/authors/${a._id}`} className="grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-full bg-cloth font-display text-lg text-clothink">
                {a.photo?.url ? <img src={cld(a.photo.url, 'f_auto,q_auto,w_120,h_120,c_fill,g_face')} alt="" className="h-full w-full object-cover" /> : initials(pick(a.name))}
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/admin/authors/${a._id}`} className="block truncate font-display text-lg hover:text-cloth">{pick(a.name)}</Link>
                <p className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
                  {t('admin.authors.books', { n: fmtNum(a.bookCount) })}
                  {a.featured && <span className="pill bg-gilt/20 text-gilt">{t('admin.authors.residence')}</span>}
                  {a.status === 'draft' && <StatusPill status="draft" label={t('admin.common.draft')} />}
                </p>
              </div>
              <ConfirmButton onConfirm={() => remove(a)} label={t('admin.common.delete')}><span className="sr-only">{t('admin.common.delete')}</span></ConfirmButton>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
