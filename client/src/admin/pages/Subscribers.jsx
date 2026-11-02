import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { api, errorText } from '../../lib/api.js';
import Icon from '../../components/Icon.jsx';
import { ConfirmButton, Empty, ErrorBox, Loading, PageHeader } from '../ui.jsx';

export default function Subscribers() {
  const { t, fmtDate, fmtNum } = useLang();
  const toast = useToast();
  const [list, setList] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    setError(null);
    api('/admin/subscribers').then((d) => setList(d.subscribers)).catch(setError);
  }, []);
  useEffect(load, [load]);

  const shown = useMemo(() => (list || []).filter((s) => s.email.includes(q.trim().toLowerCase())), [list, q]);

  const exportCsv = () => {
    const rows = [['email', 'language', 'joined'], ...(list || []).map((s) => [s.email, s.lang, new Date(s.createdAt).toISOString()])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `editions-alfa-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const remove = async (s) => {
    try {
      await api(`/admin/subscribers/${s._id}`, { method: 'DELETE' });
      setList((l) => l.filter((x) => x._id !== s._id));
      toast(t('admin.subscribers.removed'));
    } catch (err) {
      toast(errorText(err, t));
    }
  };

  return (
    <>
      <PageHeader
        title={t('admin.subscribers.title')}
        sub={list && t('admin.subscribers.count', { n: fmtNum(list.length) })}
        actions={list?.length > 0 && <button type="button" className="btn btn-quiet btn-sm" onClick={exportCsv}><Icon name="download" size={15} /> {t('admin.subscribers.export')}</button>}
      />
      <ErrorBox error={error} onRetry={load} />
      {!list && !error && <Loading />}
      {list && list.length === 0 && <Empty>{t('admin.subscribers.empty')}</Empty>}
      {list && list.length > 0 && (
        <>
          <label className="relative mb-5 block max-w-md">
            <span className="sr-only">{t('admin.subscribers.search')}</span>
            <Icon name="search" size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
            <input id="subscribers-q" type="search" dir="ltr" className="input ps-9" placeholder={t('admin.subscribers.search')} value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[520px] text-[14.5px]">
              <thead>
                <tr className="border-b border-line text-start">
                  <th className="label px-4 py-3 text-start font-medium">{t('admin.email')}</th>
                  <th className="label px-4 py-3 text-start font-medium">{t('admin.subscribers.lang')}</th>
                  <th className="label px-4 py-3 text-start font-medium">{t('admin.subscribers.joined')}</th>
                  <th className="px-4 py-3"><span className="sr-only">{t('admin.common.delete')}</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((s) => (
                  <tr key={s._id}>
                    <td className="px-4 py-2.5 font-mono text-[13.5px]" dir="ltr">{s.email}</td>
                    <td className="px-4 py-2.5">{t(`langs.${s.lang}`)}</td>
                    <td className="px-4 py-2.5 tabular-nums text-muted">{fmtDate(s.createdAt)}</td>
                    <td className="px-4 py-2.5 text-end"><ConfirmButton onConfirm={() => remove(s)} label={t('admin.common.delete')}><span className="sr-only">{t('admin.common.delete')}</span></ConfirmButton></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
