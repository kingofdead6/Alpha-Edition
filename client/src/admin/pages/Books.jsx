import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { api, errorText } from '../../lib/api.js';
import BookCover from '../../components/BookCover.jsx';
import Icon from '../../components/Icon.jsx';
import { ConfirmButton, Empty, ErrorBox, Loading, PageHeader, StatusPill } from '../ui.jsx';

export default function Books() {
  const { t, pick, fmtDate } = useLang();
  const toast = useToast();
  const [books, setBooks] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(() => {
    setError(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);
    api(`/admin/books?${params}`).then((d) => setBooks(d.books)).catch(setError);
  }, [q, status]);

  useEffect(() => {
    const id = setTimeout(load, 220);
    return () => clearTimeout(id);
  }, [load]);

  const remove = async (b) => {
    try {
      await api(`/admin/books/${b._id}`, { method: 'DELETE' });
      setBooks((list) => list.filter((x) => x._id !== b._id));
      toast(t('admin.common.deleted'));
    } catch (err) {
      toast(errorText(err, t));
    }
  };

  return (
    <>
      <PageHeader
        title={t('admin.books.title')}
        actions={<Link to="/admin/books/new" className="btn btn-sm"><Icon name="plus" size={15} /> {t('admin.books.add')}</Link>}
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">{t('admin.books.search')}</span>
          <Icon name="search" size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
          <input id="books-q" type="search" className="input ps-9" placeholder={t('admin.books.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="flex gap-1.5" role="group" aria-label={t('admin.common.status')}>
          {['', 'published', 'draft'].map((s) => (
            <button key={s || 'all'} type="button" className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s ? t(`admin.common.${s}`) : t('admin.common.all')}
            </button>
          ))}
        </div>
      </div>

      <ErrorBox error={error} onRetry={load} />
      {!books && !error && <Loading />}
      {books && books.length === 0 && (
        <Empty action={!q && !status && <Link to="/admin/books/new" className="btn btn-sm">{t('admin.books.add')}</Link>}>
          {q || status ? t('admin.books.noMatch') : t('admin.books.empty')}
        </Empty>
      )}

      {books && books.length > 0 && (
        <div className="card divide-y divide-line">
          {books.map((b) => (
            <div key={b._id} className="flex flex-wrap items-center gap-4 p-3 sm:flex-nowrap sm:p-4">
              <Link to={`/admin/books/${b._id}`} className="relative block aspect-[2/3] w-12 flex-none overflow-hidden rounded-sm shadow-sm">
                <BookCover book={b} size="w_120" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/admin/books/${b._id}`} className="block truncate font-display text-lg hover:text-cloth">{pick(b.title)}</Link>
                <p className="truncate text-[13.5px] text-muted">
                  {b.title?.en && b.title?.ar && <span lang="ar" dir="rtl" className="me-2">{b.title.ar}</span>}
                  {pick(b.author?.name)} · {t(`cats.${b.category}`)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {b.featured && <span className="pill bg-gilt/20 text-gilt"><Icon name="star" size={12} /> {t('admin.books.featured')}</span>}
                {b.newRelease && <span className="pill bg-proof/10 text-proof">{t('admin.books.newRelease')}</span>}
                <StatusPill status={b.status} label={t(`admin.common.${b.status}`)} />
              </div>
              <span className="hidden w-28 text-end text-[12.5px] text-muted md:block">{fmtDate(b.updatedAt, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <div className="flex gap-1.5">
                <Link to={`/admin/books/${b._id}`} className="btn btn-quiet btn-xs"><Icon name="edit" size={14} /> {t('admin.common.edit')}</Link>
                <ConfirmButton onConfirm={() => remove(b)} label={t('admin.common.delete')}><span className="sr-only">{t('admin.common.delete')}</span></ConfirmButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
