import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLang } from '../../lib/i18n.jsx';
import { useToast } from '../../lib/toast.jsx';
import { api, errorText, fieldErrors } from '../../lib/api.js';
import { isbnValid } from '../../lib/util.js';
import BookCover from '../../components/BookCover.jsx';
import Icon from '../../components/Icon.jsx';
import { BiField, Card, ConfirmButton, ErrorBox, Field, ImageUpload, Loading, PageHeader, SaveBar, Toggle } from '../ui.jsx';

const MOTIFS = ['dunes', 'grid', 'rain', 'tiles', 'moon', 'rings', 'sun', 'stripes'];
const CATS = ['fiction', 'essays', 'poetry', 'translation'];
const SOURCE_LANGS = ['ar', 'fr', 'en', 'tzm', 'es', 'it', 'de', 'pt', 'tr', 'fa', 'ru', 'ja'];
const PALETTES = [
  { bg: '#1D3A5F', fg: '#F2E6CC', accent: '#E1A24A' },
  { bg: '#7A2E2A', fg: '#F6E7D8', accent: '#D9925B' },
  { bg: '#2F4F46', fg: '#EAF0E6', accent: '#9CC5B0' },
  { bg: '#14171F', fg: '#F0EDE5', accent: '#F2C14E' },
  { bg: '#E8E2D3', fg: '#1E1E1E', accent: '#C2321C' },
  { bg: '#F2C14E', fg: '#1B2A3A', accent: '#D2462F' },
  { bg: '#3C5A3A', fg: '#F3EBD7', accent: '#C9B27C' },
  { bg: '#D9E3E8', fg: '#1A2C3A', accent: '#2E6F95' },
];

const blank = () => ({
  title: { en: '', ar: '' },
  author: '',
  translator: { en: '', ar: '' },
  translatedFrom: '',
  category: 'fiction',
  synopsis: { en: '', ar: '' },
  excerpt: { en: '', ar: '' },
  sample: { en: '', ar: '' },
  pages: '',
  format: '13.5 × 21 cm',
  price: { dzd: '', eur: '' },
  isbn: '',
  publishedAt: '',
  cover: { mode: 'generated', image: null, motif: 'dunes', ...PALETTES[0] },
  newRelease: false,
  featured: false,
  status: 'draft',
});

/** Shape a stored book into form state */
function toForm(b) {
  const f = blank();
  return {
    ...f,
    ...b,
    author: b.author?._id || b.author || '',
    translator: { ...f.translator, ...b.translator },
    synopsis: { ...f.synopsis, ...b.synopsis },
    excerpt: { ...f.excerpt, ...b.excerpt },
    sample: { ...f.sample, ...b.sample },
    price: { dzd: b.price?.dzd ?? '', eur: b.price?.eur ?? '' },
    pages: b.pages ?? '',
    publishedAt: b.publishedAt ? String(b.publishedAt).slice(0, 10) : '',
    cover: { ...f.cover, ...b.cover },
  };
}

function toPayload(f) {
  const { _id, slug, createdAt, updatedAt, __v, ...rest } = f;
  return {
    ...rest,
    pages: f.pages === '' ? 0 : Number(f.pages),
    price: { dzd: f.price.dzd === '' ? 0 : Number(f.price.dzd), eur: f.price.eur === '' ? 0 : Number(f.price.eur) },
    publishedAt: f.publishedAt || null,
  };
}

function ColorInput({ id, label, value, onChange }) {
  return (
    <label htmlFor={id} className="grid gap-1.5">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="flex items-center gap-2 rounded border border-line bg-paper p-1.5 pe-2">
        <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-8 w-10 cursor-pointer rounded-sm border-0 bg-transparent p-0" />
        <span className="font-mono text-[13px] uppercase" dir="ltr">{value}</span>
      </span>
    </label>
  );
}

export default function BookEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { t, pick } = useLang();
  const toast = useToast();
  const [form, setForm] = useState(isNew ? blank : null);
  const [initial, setInitial] = useState(null);
  const [slug, setSlug] = useState('');
  const [authors, setAuthors] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/admin/authors').then((d) => setAuthors(d.authors)).catch(() => {});
    if (isNew) { setInitial(JSON.stringify(blank())); return; }
    api(`/admin/books/${id}`)
      .then((d) => { const f = toForm(d.book); setForm(f); setInitial(JSON.stringify(f)); setSlug(d.book.slug); })
      .catch(setLoadError);
  }, [id, isNew]);

  const dirty = useMemo(() => form && initial && JSON.stringify(form) !== initial, [form, initial]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (loadError) return <ErrorBox error={loadError} />;
  if (!form) return <Loading />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setCover = (patch) => setForm((f) => ({ ...f, cover: { ...f.cover, ...patch } }));
  const authorObj = authors.find((a) => a._id === form.author);
  const preview = { ...form, author: authorObj ? { name: authorObj.name } : { name: { en: '', ar: '' } } };
  const isbnState = form.isbn ? (isbnValid(form.isbn) ? 'ok' : 'bad') : null;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSaveError('');
    try {
      const body = toPayload(form);
      const d = isNew
        ? await api('/admin/books', { method: 'POST', body })
        : await api(`/admin/books/${id}`, { method: 'PUT', body });
      const f = toForm(d.book);
      setForm(f);
      setInitial(JSON.stringify(f));
      setSlug(d.book.slug);
      toast(isNew ? t('admin.books.created') : t('admin.common.saved'));
      if (isNew) navigate(`/admin/books/${d.book._id}`, { replace: true });
    } catch (err) {
      setErrors(fieldErrors(err, t));
      setSaveError(err.code === 'validation' ? t('admin.common.fix') : errorText(err, t));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    await api(`/admin/books/${id}`, { method: 'DELETE' });
    toast(t('admin.common.deleted'));
    navigate('/admin/books');
  };

  return (
    <form onSubmit={save} noValidate>
      <Link to="/admin/books" className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-ink">
        <Icon name="arrow" size={15} className="rotate-180 rtl:rotate-0" /> {t('admin.books.title')}
      </Link>
      <PageHeader
        title={isNew ? t('admin.books.newTitle') : pick(form.title) || t('admin.books.editTitle')}
        actions={!isNew && <>
          {form.status === 'published' && slug && (
            <a href={`/books/${slug}`} target="_blank" rel="noreferrer" className="btn btn-quiet btn-sm"><Icon name="external" size={15} /> {t('admin.books.view')}</a>
          )}
          <ConfirmButton onConfirm={remove} className="btn btn-danger btn-sm" label={t('admin.common.delete')}>{t('admin.common.delete')}</ConfirmButton>
        </>}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-5">
          <Card title={t('admin.books.sections.basics')}>
            <div className="grid gap-5">
              <BiField name="title" label={t('admin.books.fields.title')} required value={form.title} onChange={(v) => set('title', v)} errors={errors} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('admin.books.fields.author')} htmlFor="b-author" error={errors.author}
                  hint={<Link to="/admin/authors/new" className="underline">{t('admin.books.fields.newAuthor')}</Link>}>
                  <select id="b-author" className="input" value={form.author} onChange={(e) => set('author', e.target.value)} aria-invalid={Boolean(errors.author) || undefined}>
                    <option value="">{t('admin.books.fields.chooseAuthor')}</option>
                    {authors.map((a) => <option key={a._id} value={a._id}>{pick(a.name)}</option>)}
                  </select>
                </Field>
                <Field label={t('admin.books.fields.category')} htmlFor="b-cat">
                  <select id="b-cat" className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                    {CATS.map((c) => <option key={c} value={c}>{t(`cats.${c}`)}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <BiField name="translator" label={t('admin.books.fields.translator')} value={form.translator} onChange={(v) => set('translator', v)} errors={errors} />
                <Field label={t('admin.books.fields.translatedFrom')} htmlFor="b-from" className="sm:pt-[30px]">
                  <select id="b-from" className="input" value={form.translatedFrom} onChange={(e) => set('translatedFrom', e.target.value)}>
                    <option value="">{t('admin.books.fields.none')}</option>
                    {SOURCE_LANGS.map((l) => <option key={l} value={l}>{t(`langs.${l}`)}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Field label={t('admin.books.fields.pages')} htmlFor="b-pages" error={errors.pages}>
                  <input id="b-pages" type="number" min="0" className="input" dir="ltr" value={form.pages} onChange={(e) => set('pages', e.target.value)} />
                </Field>
                <Field label={t('admin.books.fields.format')} htmlFor="b-format">
                  <input id="b-format" className="input" dir="ltr" value={form.format} onChange={(e) => set('format', e.target.value)} />
                </Field>
                <Field label={t('admin.books.fields.priceDzd')} htmlFor="b-dzd" error={errors['price.dzd']}>
                  <input id="b-dzd" type="number" min="0" step="50" className="input" dir="ltr" value={form.price.dzd} onChange={(e) => set('price', { ...form.price, dzd: e.target.value })} />
                </Field>
                <Field label={t('admin.books.fields.priceEur')} htmlFor="b-eur" error={errors['price.eur']}>
                  <input id="b-eur" type="number" min="0" step="0.5" className="input" dir="ltr" value={form.price.eur} onChange={(e) => set('price', { ...form.price, eur: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('admin.books.fields.isbn')} htmlFor="b-isbn" error={errors.isbn}
                  hint={isbnState && <span className={isbnState === 'ok' ? 'text-ok' : 'text-warn'}>{isbnState === 'ok' ? '✓ ' : '! '}{t(isbnState === 'ok' ? 'admin.books.fields.isbnValid' : 'admin.books.fields.isbnInvalid')}</span>}>
                  <input id="b-isbn" className="input font-mono" dir="ltr" placeholder="978-9947-…" value={form.isbn} onChange={(e) => set('isbn', e.target.value)} />
                </Field>
                <Field label={t('admin.books.fields.publishedAt')} htmlFor="b-date" error={errors.publishedAt}>
                  <input id="b-date" type="date" className="input" dir="ltr" value={form.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} />
                </Field>
              </div>
            </div>
          </Card>

          <Card title={t('admin.books.sections.texts')}>
            <div className="grid gap-6">
              <BiField name="synopsis" multiline rows={4} label={t('admin.books.fields.synopsis')} value={form.synopsis} onChange={(v) => set('synopsis', v)} errors={errors} />
              <BiField name="excerpt" multiline rows={2} label={t('admin.books.fields.excerpt')} hint={t('admin.books.fields.excerptHint')} value={form.excerpt} onChange={(v) => set('excerpt', v)} errors={errors} />
              <BiField name="sample" multiline rows={12} label={t('admin.books.fields.sample')} hint={t('admin.books.fields.sampleHint')} value={form.sample} onChange={(v) => set('sample', v)} errors={errors} />
            </div>
          </Card>

          <Card title={t('admin.books.sections.cover')}>
            <div className="grid gap-5">
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('admin.books.cover.mode')}>
                {['generated', 'image'].map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={form.cover.mode === m} className="chip" aria-pressed={form.cover.mode === m} onClick={() => setCover({ mode: m })}>
                    {t(`admin.books.cover.${m}`)}
                  </button>
                ))}
              </div>
              {form.cover.mode === 'image' ? (
                <ImageUpload kind="covers" value={form.cover.image} onChange={(image) => setCover({ image })} />
              ) : (
                <>
                  <div>
                    <p className="mb-2 text-[13.5px] font-medium">{t('admin.books.cover.motif')}</p>
                    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
                      {MOTIFS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCover({ motif: m })}
                          aria-pressed={form.cover.motif === m}
                          className={`group grid gap-1.5 rounded p-1 text-center transition-colors ${form.cover.motif === m ? 'bg-ink/10 ring-2 ring-cloth' : 'hover:bg-ink/5'}`}
                        >
                          <span className="relative block aspect-[2/3] overflow-hidden rounded-sm">
                            <BookCover book={{ ...preview, title: { en: '', ar: '' }, author: null, cover: { ...form.cover, mode: 'generated', motif: m } }} />
                          </span>
                          <span className="truncate text-[11.5px] text-muted">{t(`admin.books.motifs.${m}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[13.5px] font-medium">{t('admin.books.cover.presets')}</p>
                    <div className="flex flex-wrap gap-2">
                      {PALETTES.map((p) => (
                        <button key={p.bg} type="button" onClick={() => setCover(p)} className="flex overflow-hidden rounded-full border border-line transition-transform hover:scale-110" aria-label={`${p.bg} ${p.fg} ${p.accent}`}>
                          {[p.bg, p.accent, p.fg].map((c) => <span key={c} className="h-7 w-4" style={{ background: c }} />)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ColorInput id="c-bg" label={t('admin.books.cover.bg')} value={form.cover.bg} onChange={(bg) => setCover({ bg })} />
                    <ColorInput id="c-fg" label={t('admin.books.cover.fg')} value={form.cover.fg} onChange={(fg) => setCover({ fg })} />
                    <ColorInput id="c-ac" label={t('admin.books.cover.accent')} value={form.cover.accent} onChange={(accent) => setCover({ accent })} />
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-5 xl:sticky xl:top-6">
          <Card title={t('admin.books.sections.publishing')}>
            <div className="grid gap-4">
              <div className="flex gap-1.5" role="radiogroup" aria-label={t('admin.common.status')}>
                {['draft', 'published'].map((s) => (
                  <button key={s} type="button" role="radio" aria-checked={form.status === s} aria-pressed={form.status === s} className="chip flex-1 justify-center" onClick={() => set('status', s)}>
                    {t(`admin.common.${s}`)}
                  </button>
                ))}
              </div>
              <Toggle id="b-new" checked={form.newRelease} onChange={(v) => set('newRelease', v)} label={t('admin.books.fields.newRelease')} />
              <Toggle id="b-featured" checked={form.featured} onChange={(v) => set('featured', v)} label={t('admin.books.fields.featured')} hint={t('admin.books.fields.featuredHint')} />
            </div>
          </Card>
          <Card title={t('admin.books.cover.preview')}>
            <div className="grid grid-cols-2 gap-4">
              {['en', 'ar'].map((l) => (
                <div key={l} className="grid gap-2">
                  <span className="relative block aspect-[2/3] overflow-hidden rounded-sm shadow-[0_12px_24px_-12px_rgb(var(--shadow)/.5)]">
                    <BookCover book={preview} lang={l} />
                  </span>
                  <span className="text-center font-mono text-[11px] uppercase text-muted">{l}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <SaveBar saving={saving} dirty={dirty} error={saveError} onCancel={() => navigate('/admin/books')} />
    </form>
  );
}
