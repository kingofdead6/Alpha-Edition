import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { api, errorText, fieldErrors } from '../../lib/api.js';
import { BiField, Card, ErrorBox, Field, Loading, PageHeader, SaveBar, Toggle } from '../ui.jsx';

const toForm = (s) => ({
  contactEmail: s.contactEmail || '',
  phone: s.phone || '',
  address: { en: s.address?.en || '', ar: s.address?.ar || '' },
  hours: { en: s.hours?.en || '', ar: s.hours?.ar || '' },
  readingPeriod: { isOpen: Boolean(s.readingPeriod?.isOpen), endsAt: s.readingPeriod?.endsAt ? String(s.readingPeriod.endsAt).slice(0, 10) : '' },
  stats: { ...s.stats },
});

export default function Settings() {
  const { t } = useLang();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [initial, setInitial] = useState('');
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/admin/settings')
      .then((d) => { const f = toForm(d.settings); setForm(f); setInitial(JSON.stringify(f)); })
      .catch(setError);
  }, []);

  const dirty = useMemo(() => form && JSON.stringify(form) !== initial, [form, initial]);
  if (error) return <ErrorBox error={error} />;
  if (!form) return <Loading />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setStat = (k, v) => setForm((f) => ({ ...f, stats: { ...f.stats, [k]: v } }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSaveError('');
    try {
      const body = { ...form, readingPeriod: { ...form.readingPeriod, endsAt: form.readingPeriod.endsAt ? `${form.readingPeriod.endsAt}T23:59:00` : null } };
      const d = await api('/admin/settings', { method: 'PUT', body });
      const f = toForm(d.settings);
      setForm(f);
      setInitial(JSON.stringify(f));
      toast(t('admin.settings.saved'));
    } catch (err) {
      setErrors(fieldErrors(err, t));
      setSaveError(err.code === 'validation' ? t('admin.common.fix') : errorText(err, t));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} noValidate>
      <PageHeader title={t('admin.settings.title')} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={t('admin.settings.contact')} className="lg:col-span-2">
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('admin.settings.contactEmail')} htmlFor="s-email" error={errors.contactEmail}>
                <input id="s-email" type="email" dir="ltr" className="input" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} aria-invalid={Boolean(errors.contactEmail) || undefined} />
              </Field>
              <Field label={t('admin.settings.phone')} htmlFor="s-phone">
                <input id="s-phone" dir="ltr" className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </Field>
            </div>
            <BiField name="address" label={t('admin.settings.address')} value={form.address} onChange={(v) => set('address', v)} errors={errors} />
            <BiField name="hours" label={t('admin.settings.hours')} value={form.hours} onChange={(v) => set('hours', v)} errors={errors} />
          </div>
        </Card>
        <Card title={t('admin.settings.reading')}>
          <div className="grid gap-5">
            <Toggle id="s-open" checked={form.readingPeriod.isOpen} onChange={(v) => set('readingPeriod', { ...form.readingPeriod, isOpen: v })} label={t('admin.settings.isOpen')} hint={t('admin.settings.readingHint')} />
            <Field label={t('admin.settings.endsAt')} htmlFor="s-ends">
              <input id="s-ends" type="date" dir="ltr" className="input max-w-[220px]" value={form.readingPeriod.endsAt} onChange={(e) => set('readingPeriod', { ...form.readingPeriod, endsAt: e.target.value })} />
            </Field>
          </div>
        </Card>
        <Card title={t('admin.settings.stats')}>
          <div className="grid grid-cols-2 gap-4">
            {['titlesInPrint', 'languages', 'perYear', 'sinceYear'].map((k) => (
              <Field key={k} label={t(`admin.settings.${k}`)} htmlFor={`s-${k}`} error={errors[`stats.${k}`]}>
                <input id={`s-${k}`} type="number" dir="ltr" className="input" value={form.stats[k] ?? ''} onChange={(e) => setStat(k, e.target.value)} />
              </Field>
            ))}
          </div>
        </Card>
      </div>
      <SaveBar saving={saving} dirty={dirty} error={saveError} />
    </form>
  );
}
