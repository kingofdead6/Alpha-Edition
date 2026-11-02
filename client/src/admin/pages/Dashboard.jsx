import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { api } from '../../lib/api.js';
import Icon from '../../components/Icon.jsx';
import { Card, ErrorBox, Loading, PageHeader, StatusPill } from '../ui.jsx';

const PIPE = ['new', 'reading', 'shortlisted', 'accepted', 'declined'];
const PIPE_COLOR = { new: 'bg-info', reading: 'bg-warn', shortlisted: 'bg-gilt', accepted: 'bg-ok', declined: 'bg-proof' };

function Tile({ label, value, sub, to, icon }) {
  const { fmtNum } = useLang();
  return (
    <Link to={to} className="card group grid content-start gap-2 p-5 transition-colors hover:border-ink">
      <span className="flex items-center justify-between text-[13.5px] text-muted">
        {label}
        <Icon name={icon} size={18} className="text-muted transition-colors group-hover:text-cloth" />
      </span>
      <b className="font-display text-[2.6rem] font-normal leading-none tabular-nums">{fmtNum(value)}</b>
      {sub && <span className="text-[13px] text-muted">{sub}</span>}
    </Link>
  );
}

export default function Dashboard() {
  const { t, fmtNum, fmtDate } = useLang();
  const { admin } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    api('/admin/stats').then(setData).catch(setError);
  }, []);
  useEffect(load, [load]);

  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!data) return <Loading />;

  const s = data.submissions;
  const max = Math.max(1, ...s.months.map((m) => m.count));
  const pipeTotal = Math.max(1, s.total);
  const catMax = Math.max(1, ...Object.values(data.categories));

  return (
    <>
      <PageHeader
        title={t('admin.dashboard.title')}
        sub={t('admin.dashboard.hello', { name: admin?.name || admin?.email })}
        actions={<>
          <Link to="/admin/books/new" className="btn btn-sm"><Icon name="plus" size={15} /> {t('admin.dashboard.addBook')}</Link>
          <Link to="/admin/authors/new" className="btn btn-quiet btn-sm"><Icon name="plus" size={15} /> {t('admin.dashboard.addAuthor')}</Link>
        </>}
      />

      {!data.uploadsEnabled && (
        <p className="mb-6 rounded border border-warn/40 bg-warn/10 px-4 py-3 text-[14px] text-warn">{t('admin.dashboard.uploadsOff')}</p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile to="/admin/books" icon="book" label={t('admin.dashboard.books')} value={data.books.published + data.books.drafts} sub={t('admin.dashboard.booksSub', { p: fmtNum(data.books.published), d: fmtNum(data.books.drafts) })} />
        <Tile to="/admin/authors" icon="user" label={t('admin.dashboard.authors')} value={data.authors} />
        <Tile to="/admin/submissions" icon="inbox" label={t('admin.dashboard.newSubs')} value={s.byStatus.new} sub={t('admin.dashboard.ofTotal', { n: fmtNum(s.total) })} />
        <Tile to="/admin/subscribers" icon="mail" label={t('admin.dashboard.subscribers')} value={data.subscribers.total} sub={t('admin.dashboard.last30', { n: fmtNum(data.subscribers.last30) })} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card title={t('admin.dashboard.pipeline')}>
          <div className="flex h-3 overflow-hidden rounded-full bg-line/60" role="img" aria-label={PIPE.map((p) => `${t(`admin.submissions.statuses.${p}`)} ${s.byStatus[p]}`).join(', ')}>
            {PIPE.map((p) => s.byStatus[p] > 0 && (
              <span key={p} className={`${PIPE_COLOR[p]} h-full`} style={{ width: `${(s.byStatus[p] / pipeTotal) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {PIPE.map((p) => (
              <li key={p} className="flex items-center gap-2 text-[14px]">
                <span className={`h-2.5 w-2.5 rounded-full ${PIPE_COLOR[p]}`} />
                <span className="text-muted">{t(`admin.submissions.statuses.${p}`)}</span>
                <b className="ms-auto font-mono text-[13px] font-medium tabular-nums">{fmtNum(s.byStatus[p])}</b>
              </li>
            ))}
          </ul>

          <h3 className="mb-3 mt-7 font-body text-[14px] font-semibold tracking-normal">{t('admin.dashboard.perMonth')}</h3>
          <div className="relative flex h-40 items-end gap-3 border-b border-line">
            <span className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-line/80" />
            <span className="absolute -top-2.5 end-0 bg-paper ps-1 font-mono text-[11px] text-muted">{fmtNum(max)}</span>
            {s.months.map((m, i) => (
              <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="font-mono text-[11px] tabular-nums text-muted">{m.count ? fmtNum(m.count) : ''}</span>
                <span
                  className={`bar-grow w-full max-w-[44px] rounded-t-sm ${i === s.months.length - 1 ? 'bg-proof' : 'bg-cloth/70'}`}
                  style={{ height: `${(m.count / max) * 100}%`, minHeight: m.count ? 3 : 0, '--d': `${i * 70}ms` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            {s.months.map((m) => (
              <span key={m.month} className="flex-1 text-center font-mono text-[11px] text-muted">
                {fmtDate(new Date(Number(m.month.slice(0, 4)), Number(m.month.slice(5, 7)) - 1, 1), { month: 'short' })}
              </span>
            ))}
          </div>
        </Card>

        <div className="grid content-start gap-4">
          <Card title={t('admin.dashboard.recent')} actions={<Link to="/admin/submissions" className="text-[13px] text-muted hover:text-ink">{t('admin.dashboard.viewAll')}</Link>}>
            {s.recent.length === 0 ? <p className="text-[14px] text-muted">{t('admin.dashboard.none')}</p> : (
              <ul className="divide-y divide-line">
                {s.recent.map((r) => (
                  <li key={r._id}>
                    <Link to={`/admin/submissions?open=${r._id}`} className="flex items-center gap-3 py-2.5 hover:text-cloth">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-medium">{r.title}</span>
                        <span className="block truncate text-[13px] text-muted">{r.name} · {fmtDate(r.createdAt, { day: 'numeric', month: 'short' })}</span>
                      </span>
                      <StatusPill status={r.status} label={t(`admin.submissions.statuses.${r.status}`)} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={t('admin.dashboard.byCategory')}>
            <ul className="grid gap-2.5">
              {['fiction', 'essays', 'poetry', 'translation'].map((c) => (
                <li key={c} className="grid grid-cols-[90px_minmax(0,1fr)_32px] items-center gap-3 text-[14px]">
                  <span className="text-muted">{t(`cats.${c}`)}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-line/50">
                    <span className="block h-full rounded-full bg-cloth" style={{ width: `${((data.categories[c] || 0) / catMax) * 100}%` }} />
                  </span>
                  <b className="text-end font-mono text-[13px] font-medium tabular-nums">{fmtNum(data.categories[c] || 0)}</b>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
