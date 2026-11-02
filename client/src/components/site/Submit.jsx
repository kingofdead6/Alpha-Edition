import { useRef, useState } from 'react';
import { useLang } from '../../lib/i18n.jsx';
import { api, errorText } from '../../lib/api.js';
import { wordCount } from '../../lib/util.js';
import Reveal from '../Reveal.jsx';

const EMPTY = { name: '', email: '', title: '', category: '', language: 'en', words: '', synopsis: '', agree: false, website: '' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_FILE = 10 * 1024 * 1024;

function Field({ id, label, error, full, children }) {
  return (
    <div className={`grid min-w-0 gap-1.5 ${full ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && <p className="text-[13px] text-[#C2321C]" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

export default function Submit({ settings, page = false }) {
  const { t, fmtDate, fmtNum, lang } = useLang();
  const [form, setForm] = useState(() => ({ ...EMPTY, language: lang === 'ar' ? 'ar' : 'en' }));
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [drag, setDrag] = useState(false);
  const fileInput = useRef(null);

  const rp = settings?.readingPeriod;
  const closed = settings && !rp?.isOpen;
  const words = wordCount(form.synopsis);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const pickFile = (f) => {
    if (!f) return setFile(null);
    if (f.size > MAX_FILE) { setErrors((e) => ({ ...e, file: t('errors.file_too_large') })); return null; }
    if (!/\.(pdf|docx?)$/i.test(f.name)) { setErrors((e) => ({ ...e, file: t('errors.bad_file_type') })); return null; }
    setErrors((e) => ({ ...e, file: undefined }));
    return setFile(f);
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = t('submit.errors.name');
    if (!EMAIL.test(form.email.trim())) e.email = t('submit.errors.email');
    if (!form.title.trim()) e.title = t('submit.errors.title');
    if (!form.category) e.category = t('submit.errors.category');
    if (form.synopsis.trim().length < 20) e.synopsis = t('submit.errors.synopsis');
    else if (words > 300) e.synopsis = t('submit.errors.synopsisLong');
    if (!form.agree) e.agree = t('submit.errors.agree');
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setMessage(t('submit.errors.fix'));
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    setMessage('');
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, typeof v === 'boolean' ? String(v) : v));
    body.append('siteLang', lang);
    if (file) body.append('file', file);
    try {
      const d = await api('/public/submissions', { method: 'POST', body });
      setReference(d.reference);
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setMessage(errorText(err, t));
    }
  };

  const reset = () => {
    setForm({ ...EMPTY, language: lang === 'ar' ? 'ar' : 'en' });
    setFile(null);
    setErrors({});
    setMessage('');
    setStatus('idle');
  };

  const inv = (k) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `f-${k}-err` } : {});

  return (
    <section className={`scroll-mt-16 ${page ? 'pb-[clamp(56px,8vw,110px)] pt-[clamp(32px,5vw,64px)]' : 'section'}`} id="submit">
      <div className="wrap grid items-start gap-[clamp(32px,6vw,90px)] lg:grid-cols-[.9fr_1.1fr]">
        <div className="min-w-0">
          <Reveal as="p" className="eyebrow">{t('submit.eyebrow')}</Reveal>
          <Reveal as={page ? 'h1' : 'h2'} delay={80} className="mb-5 mt-3.5 text-[clamp(2.2rem,4.6vw,3.8rem)]">
            {t('submit.title')}<em className="text-cloth">{t('submit.titleEm')}</em>
          </Reveal>
          <Reveal as="p" delay={160} className="max-w-[46ch] text-muted">{t('submit.text')}</Reveal>
          <Reveal as="ul" delay={240} className="mt-7 grid list-none gap-3.5 p-0">
            {t('submit.rules').map((r) => (
              <li key={r} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2 text-[15px]">
                <span className="font-display text-lg font-semibold leading-[1.3] text-proof" aria-hidden="true">¶</span>
                {r}
              </li>
            ))}
          </Reveal>
          {rp?.isOpen && (
            <Reveal as="p" delay={320} className="mt-7 inline-flex items-center gap-2.5 rounded-sm border border-dashed border-proof px-3.5 py-2.5 font-mono text-[13px] text-proof">
              {rp.endsAt ? t('submit.window', { date: fmtDate(rp.endsAt) }) : t('submit.windowOpen')}
            </Reveal>
          )}
        </div>

        <Reveal delay={120} className="form-card relative rounded p-[clamp(22px,4vw,40px)] shadow-[0_1px_2px_rgb(var(--shadow)/.12),0_30px_60px_-30px_rgb(var(--shadow)/.4)]">
          {closed ? (
            <div className="relative grid gap-3 py-8 text-center">
              <h3 className="text-3xl">{t('submit.closedTitle')}</h3>
              <p className="mx-auto max-w-[42ch] text-[#5a5f57]">{t('submit.closedText')}</p>
            </div>
          ) : status === 'done' ? (
            <div className="relative grid justify-items-center gap-3.5 px-2.5 py-8 text-center">
              <span className="stamp">{t('submit.stamp')}</span>
              <h3 className="text-3xl">{t('submit.thanks')}</h3>
              <p className="max-w-[40ch] text-[#5a5f57]">{t('submit.thanksText')}</p>
              <p className="font-mono text-[15px] font-medium" dir="ltr">{t('submit.reference', { ref: reference })}</p>
              <button type="button" className="btn btn-ghost" onClick={reset}>{t('submit.again')}</button>
            </div>
          ) : (
            <form className="relative grid gap-[18px] sm:grid-cols-2" onSubmit={onSubmit} noValidate>
              <Field id="f-name" label={t('submit.fields.name')} error={errors.name}>
                <input id="f-name" className="field-line" value={form.name} onChange={set('name')} autoComplete="name" {...inv('name')} />
              </Field>
              <Field id="f-email" label={t('submit.fields.email')} error={errors.email}>
                <input id="f-email" type="email" dir="ltr" className="field-line text-start" value={form.email} onChange={set('email')} autoComplete="email" {...inv('email')} />
              </Field>
              <Field id="f-title" label={t('submit.fields.title')} error={errors.title}>
                <input id="f-title" className="field-line" value={form.title} onChange={set('title')} {...inv('title')} />
              </Field>
              <Field id="f-category" label={t('submit.fields.category')} error={errors.category}>
                <select id="f-category" className="field-line" value={form.category} onChange={set('category')} {...inv('category')}>
                  <option value="">{t('submit.fields.choose')}</option>
                  {['fiction', 'essays', 'poetry', 'translation'].map((c) => <option key={c} value={c}>{t(`cats.${c}`)}</option>)}
                </select>
              </Field>
              <Field id="f-language" label={t('submit.fields.language')}>
                <select id="f-language" className="field-line" value={form.language} onChange={set('language')}>
                  {['ar', 'fr', 'en', 'tzm'].map((l) => <option key={l} value={l}>{t(`langs.${l}`)}</option>)}
                </select>
              </Field>
              <Field id="f-words" label={t('submit.fields.words')}>
                <input id="f-words" type="number" min="1000" step="1000" inputMode="numeric" dir="ltr" className="field-line text-start" placeholder={t('submit.fields.wordsPh')} value={form.words} onChange={set('words')} />
              </Field>
              <Field id="f-synopsis" label={t('submit.fields.synopsis')} error={errors.synopsis} full>
                <textarea id="f-synopsis" rows={5} className="field-line min-h-[110px] resize-y" value={form.synopsis} onChange={set('synopsis')} maxLength={2400} {...inv('synopsis')} />
                <small className={`justify-self-end font-mono text-[12px] tabular-nums ${words > 300 ? 'text-[#C2321C]' : 'text-[#6b6f66]'}`}>
                  {t('submit.fields.count', { n: fmtNum(words) })}
                </small>
              </Field>

              {/* Honeypot: hidden from people, tempting to bots */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="f-website">Website</label>
                <input id="f-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
              </div>

              <div
                className={`relative flex flex-wrap items-center gap-2.5 rounded-sm border-[1.5px] border-dashed p-3.5 text-[14px] transition-colors sm:col-span-2 ${drag ? 'border-[#C2321C] bg-[#C2321C]/5' : 'border-[#b9bdb3]'}`}
                onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
                onDrop={(e) => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }}
              >
                <input ref={fileInput} id="f-file" type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => pickFile(e.target.files[0])} />
                <label htmlFor="f-file" className="cursor-pointer font-semibold underline underline-offset-4">{t('submit.fields.file')}</label>
                <span className="min-w-0 break-words text-[#6b6f66]">
                  {file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB` : t('submit.fields.fileHint')}
                </span>
                {file && (
                  <button type="button" className="ms-auto text-[13px] underline" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ''; }}>
                    ×
                  </button>
                )}
                {errors.file && <p className="w-full text-[13px] text-[#C2321C]">{errors.file}</p>}
              </div>

              <div className="grid gap-1 sm:col-span-2">
                <label htmlFor="f-agree" className="flex items-start gap-2.5 text-[15px]">
                  <input id="f-agree" type="checkbox" className="mt-1 h-[18px] w-[18px] flex-none accent-[#1E4636]" checked={form.agree} onChange={set('agree')} {...inv('agree')} />
                  {t('submit.fields.agree')}
                </label>
                {errors.agree && <p className="text-[13px] text-[#C2321C]" id="f-agree-err">{errors.agree}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <button className="btn" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? t('submit.sending') : <>{t('submit.send')} <span className="arr">→</span></>}
                </button>
                {message && <p className="text-[14px] text-[#C2321C]" role="alert">{message}</p>}
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
