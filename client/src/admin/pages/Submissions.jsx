import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { api, errorText } from '../../lib/api.js';
import Icon from '../../components/Icon.jsx';
import { Card, ConfirmButton, Empty, ErrorBox, Loading, PageHeader, StatusPill } from '../ui.jsx';

const STATUSES = ['new', 'reading', 'shortlisted', 'accepted', 'declined'];

function Detail({ id, onChanged, onDeleted, onClose }) {
  const { t, fmtDate, fmtNum } = useLang();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setData(null);
    setError(null);
    api(`/admin/submissions/${id}`)
      .then((d) => { setData(d); setNotes(d.submission.notes || ''); })
      .catch(setError);
  }, [id]);

  const patch = async (body, message) => {
    setBusy(true);
    try {
      const d = await api(`/admin/submissions/${id}`, { method: 'PATCH', body });
      setData((x) => ({ ...x, submission: d.submission }));
      onChanged(d.submission);
      toast(message);
    } catch (err) {
      toast(errorText(err, t));
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorBox error={error} />;
  if (!data) return <Loading />;
  const s = data.submission;

  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[12px] text-muted" dir="ltr">{s.reference}</p>
          <h2 className="mt-1 text-[1.8rem]">{s.title}</h2>
          <p className="text-muted">
            {s.name} · <span dir="ltr">{s.email}</span>
          </p>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 flex-none place-items-center rounded-full border border-line hover:border-ink lg:hidden" aria-label={t('nav.close')}>
          <Icon name="x" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('admin.common.status')}>
        {STATUSES.map((st) => (
          <button
            key={st}
            type="button"
            role="radio"
            aria-checked={s.status === st}
            aria-pressed={s.status === st}
            disabled={busy}
            className="chip"
            onClick={() => s.status !== st && patch({ status: st }, t('admin.submissions.moved', { status: t(`admin.submissions.statuses.${st}`) }))}
          >
            {t(`admin.submissions.statuses.${st}`)}
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-line py-4 text-[14px] sm:grid-cols-4">
        <div><dt className="label">{t('admin.submissions.category')}</dt><dd className="mt-1">{t(`cats.${s.category}`)}</dd></div>
        <div><dt className="label">{t('admin.submissions.language')}</dt><dd className="mt-1">{t(`langs.${s.language}`)}</dd></div>
        <div><dt className="label">{t('admin.submissions.words', { n: '' }).trim() || 'Words'}</dt><dd className="mt-1 tabular-nums">{s.words ? fmtNum(s.words) : '—'}</dd></div>
        <div><dt className="label">{t('admin.submissions.received', { date: '' }).trim()}</dt><dd className="mt-1">{fmtDate(s.createdAt)}</dd></div>
      </dl>

      <div>
        <p className="label mb-2">{t('admin.submissions.synopsis')}</p>
        <p className="whitespace-pre-line leading-relaxed" dir="auto">{s.synopsis}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded border border-line p-3">
        <Icon name="file" size={20} className="text-muted" />
        {s.file ? (
          <>
            <span className="min-w-0 flex-1 truncate text-[14px]">{s.file.name} · {(s.file.bytes / 1024 / 1024).toFixed(1)} MB</span>
            {data.fileUrl && <a href={data.fileUrl} target="_blank" rel="noreferrer" className="btn btn-quiet btn-xs"><Icon name="download" size={14} /> {t('admin.submissions.download')}</a>}
          </>
        ) : <span className="text-[14px] text-muted">{t('admin.submissions.noFile')}</span>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="sub-notes" className="label">{t('admin.submissions.notes')}</label>
        <textarea id="sub-notes" rows={4} className="input" placeholder={t('admin.submissions.notesPh')} value={notes} onChange={(e) => setNotes(e.target.value)} dir="auto" />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm" disabled={busy || notes === (s.notes || '')} onClick={() => patch({ notes }, t('admin.common.saved'))}>
            {t('admin.submissions.saveNotes')}
          </button>
          <a href={`mailto:${s.email}?subject=${encodeURIComponent(`${s.reference} · ${s.title}`)}`} className="btn btn-quiet btn-sm"><Icon name="mail" size={15} /> {t('admin.submissions.reply')}</a>
          <ConfirmButton className="btn btn-danger btn-sm ms-auto" label={t('admin.common.delete')} onConfirm={async () => {
            try {
              await api(`/admin/submissions/${id}`, { method: 'DELETE' });
              toast(t('admin.common.deleted'));
              onDeleted(id);
            } catch (err) { toast(errorText(err, t)); }
          }}>{t('admin.common.delete')}</ConfirmButton>
        </div>
      </div>
      <p className="text-[12.5px] text-muted">{t('admin.submissions.siteLang', { lang: t(`langs.${s.siteLang}`) })}</p>
    </div>
  );
}

export default function Submissions() {
  const { t, fmtDate, fmtNum } = useLang();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const openId = params.get('open');

  const load = useCallback(() => {
    setError(null);
    const p = new URLSearchParams({ page: String(page) });
    if (status) p.set('status', status);
    if (q.trim()) p.set('q', q.trim());
    api(`/admin/submissions?${p}`).then(setData).catch(setError);
  }, [status, q, page]);

  useEffect(() => {
    const id = setTimeout(load, 200);
    return () => clearTimeout(id);
  }, [load]);

  const open = (id) => setParams(id ? { open: id } : {}, { replace: true });
  const total = data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <>
      <PageHeader title={t('admin.submissions.title')} />
      <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label={t('admin.common.status')}>
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} type="button" className="chip" aria-pressed={status === s} onClick={() => { setStatus(s); setPage(1); }}>
            {s ? t(`admin.submissions.statuses.${s}`) : t('admin.common.all')}
            <span>{fmtNum(s ? data?.counts?.[s] || 0 : total)}</span>
          </button>
        ))}
      </div>
      <label className="relative mb-5 block max-w-lg">
        <span className="sr-only">{t('admin.submissions.search')}</span>
        <Icon name="search" size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
        <input id="subs-q" type="search" className="input ps-9" placeholder={t('admin.submissions.search')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </label>

      <ErrorBox error={error} onRetry={load} />
      {!data && !error && <Loading />}

      {data && (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
          <div className={`min-w-0 ${openId ? 'hidden lg:block' : ''}`}>
            {data.items.length === 0 ? <Empty>{t('admin.submissions.empty')}</Empty> : (
              <div className="card divide-y divide-line">
                {data.items.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => open(s._id)}
                    className={`flex w-full items-center gap-3 p-4 text-start transition-colors hover:bg-ink/5 ${openId === s._id ? 'bg-ink/5' : ''}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{s.title}</span>
                      <span className="block truncate text-[13px] text-muted">
                        {s.name} · {t(`cats.${s.category}`)} · {fmtDate(s.createdAt, { day: 'numeric', month: 'short' })}
                        {s.file && ' · '}{s.file && <Icon name="file" size={12} className="inline" />}
                      </span>
                    </span>
                    <StatusPill status={s.status} label={t(`admin.submissions.statuses.${s.status}`)} />
                  </button>
                ))}
              </div>
            )}
            {data.pages > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3 text-[14px]">
                <button type="button" className="btn btn-quiet btn-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('admin.submissions.prev')}</button>
                <span className="text-muted">{t('admin.submissions.pageOf', { p: fmtNum(page), n: fmtNum(data.pages) })}</span>
                <button type="button" className="btn btn-quiet btn-xs" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>{t('admin.submissions.next')}</button>
              </div>
            )}
          </div>
          <div className={`min-w-0 lg:sticky lg:top-6 ${openId ? '' : 'hidden lg:block'}`}>
            {openId ? (
              <Card>
                <Detail
                  key={openId}
                  id={openId}
                  onClose={() => open(null)}
                  onChanged={(sub) => setData((d) => ({ ...d, items: d.items.map((x) => (x._id === sub._id ? { ...x, status: sub.status } : x)) }))}
                  onDeleted={() => { open(null); load(); }}
                />
              </Card>
            ) : (
              <div className="grid place-items-center rounded border border-dashed border-line px-6 py-20 text-muted">
                <Icon name="inbox" size={28} />
                <p className="mt-3">{t('admin.submissions.select')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
