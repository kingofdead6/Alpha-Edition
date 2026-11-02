import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { api, errorText, fieldErrors } from '../../lib/api.js';
import Icon from '../../components/Icon.jsx';
import { BiField, Card, ConfirmButton, ErrorBox, ImageUpload, Loading, PageHeader, SaveBar, Toggle } from '../ui.jsx';

const blank = () => ({
  name: { en: '', ar: '' },
  bio: { en: '', ar: '' },
  quote: { en: '', ar: '' },
  note: { en: '', ar: '' },
  photo: null,
  featured: false,
  status: 'published',
});

const toForm = (a) => {
  const f = blank();
  return {
    name: { ...f.name, ...a.name },
    bio: { ...f.bio, ...a.bio },
    quote: { ...f.quote, ...a.quote },
    note: { ...f.note, ...a.note },
    photo: a.photo || null,
    featured: Boolean(a.featured),
    status: a.status || 'published',
  };
};

export default function AuthorEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { t, pick } = useLang();
  const toast = useToast();
  const [form, setForm] = useState(isNew ? blank : null);
  const [initial, setInitial] = useState(isNew ? JSON.stringify(blank()) : null);
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api(`/admin/authors/${id}`)
      .then((d) => { const f = toForm(d.author); setForm(f); setInitial(JSON.stringify(f)); })
      .catch(setLoadError);
  }, [id, isNew]);

  const dirty = useMemo(() => form && initial && JSON.stringify(form) !== initial, [form, initial]);

  if (loadError) return <ErrorBox error={loadError} />;
  if (!form) return <Loading />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSaveError('');
    try {
      const d = isNew
        ? await api('/admin/authors', { method: 'POST', body: form })
        : await api(`/admin/authors/${id}`, { method: 'PUT', body: form });
      const f = toForm(d.author);
      setForm(f);
      setInitial(JSON.stringify(f));
      toast(isNew ? t('admin.authors.created') : t('admin.common.saved'));
      if (isNew) navigate(`/admin/authors/${d.author._id}`, { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err, t));
      setSaveError(err.code === 'validation' ? t('admin.common.fix') : errorText(err, t));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api(`/admin/authors/${id}`, { method: 'DELETE' });
      toast(t('admin.common.deleted'));
      navigate('/admin/authors');
    } catch (err) {
      toast(errorText(err, t));
    }
  };

  return (
    <form onSubmit={save} noValidate>
      <Link to="/admin/authors" className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-ink">
        <Icon name="arrow" size={15} className="rotate-180 rtl:rotate-0" /> {t('admin.authors.title')}
      </Link>
      <PageHeader
        title={isNew ? t('admin.authors.newTitle') : pick(form.name) || t('admin.authors.editTitle')}
        actions={!isNew && <ConfirmButton onConfirm={remove} className="btn btn-danger btn-sm" label={t('admin.common.delete')}>{t('admin.common.delete')}</ConfirmButton>}
      />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <div className="grid gap-6">
            <BiField name="name" required label={t('admin.authors.fields.name')} value={form.name} onChange={(v) => set('name', v)} errors={errors} />
            <BiField name="bio" multiline rows={5} label={t('admin.authors.fields.bio')} value={form.bio} onChange={(v) => set('bio', v)} errors={errors} />
            <BiField name="quote" multiline rows={2} label={t('admin.authors.fields.quote')} hint={t('admin.authors.fields.quoteHint')} value={form.quote} onChange={(v) => set('quote', v)} errors={errors} />
            <BiField name="note" label={t('admin.authors.fields.note')} hint={t('admin.authors.fields.noteHint')} value={form.note} onChange={(v) => set('note', v)} errors={errors} />
          </div>
        </Card>
        <div className="grid gap-5 lg:sticky lg:top-6">
          <Card title={t('admin.authors.fields.photo')}>
            <ImageUpload kind="authors" aspect="aspect-square" round value={form.photo} onChange={(photo) => set('photo', photo)} />
          </Card>
          <Card title={t('admin.common.status')}>
            <div className="grid gap-4">
              <div className="flex gap-1.5" role="radiogroup" aria-label={t('admin.common.status')}>
                {['draft', 'published'].map((s) => (
                  <button key={s} type="button" role="radio" aria-checked={form.status === s} aria-pressed={form.status === s} className="chip flex-1 justify-center" onClick={() => set('status', s)}>
                    {t(`admin.common.${s}`)}
                  </button>
                ))}
              </div>
              <Toggle id="a-featured" checked={form.featured} onChange={(v) => set('featured', v)} label={t('admin.authors.fields.featured')} hint={t('admin.authors.fields.featuredHint')} />
            </div>
          </Card>
        </div>
      </div>
      <SaveBar saving={saving} dirty={dirty} error={saveError} onCancel={() => navigate('/admin/authors')} />
    </form>
  );
}
