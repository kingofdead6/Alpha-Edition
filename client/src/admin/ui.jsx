import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lib/i18n.jsx';
import { api, errorText } from '../lib/api.js';
import { cld } from '../lib/util.js';
import Icon from '../components/Icon.jsx';

export function PageHeader({ title, sub, actions }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.9rem,3.4vw,2.6rem)]">{title}</h1>
        {sub && <p className="mt-1 text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className = '' }) {
  return (
    <section className={`card min-w-0 p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-body text-[15px] font-semibold tracking-normal">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, error, htmlFor, children, className = '' }) {
  return (
    <div className={`grid min-w-0 content-start gap-1.5 ${className}`}>
      {label && <label htmlFor={htmlFor} className="text-[13.5px] font-medium text-ink">{label}</label>}
      {children}
      {hint && !error && <p className="text-[12.5px] leading-snug text-muted">{hint}</p>}
      {error && <p className="text-[12.5px] text-proof">{error}</p>}
    </div>
  );
}

/** One input per language, side by side, the Arabic one right-to-left */
export function BiField({ label, hint, value = {}, onChange, errors = {}, name, multiline, rows = 4, required }) {
  const { t } = useLang();
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <fieldset className="grid min-w-0 gap-1.5">
      <legend className="mb-1.5 text-[13.5px] font-medium">
        {label}{required && <span className="text-proof"> *</span>}
      </legend>
      <div className="grid gap-3 md:grid-cols-2">
        {['en', 'ar'].map((l) => (
          <label key={l} className="grid min-w-0 gap-1">
            <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
              <span className={`rounded-sm px-1.5 py-0.5 ${l === 'ar' ? 'bg-cloth/15 text-cloth' : 'bg-ink/10'}`}>{l.toUpperCase()}</span>
              {t(`admin.common.${l}`)}
            </span>
            <Tag
              id={`${name}-${l}`}
              className="input"
              dir={l === 'ar' ? 'rtl' : 'ltr'}
              lang={l}
              rows={multiline ? rows : undefined}
              value={value?.[l] || ''}
              aria-invalid={Boolean(errors[`${name}.${l}`] || errors[name]) || undefined}
              style={l === 'ar' ? { fontFamily: "'IBM Plex Sans Arabic', sans-serif" } : { fontFamily: "'Hanken Grotesk', sans-serif" }}
              onChange={(e) => onChange({ ...value, [l]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {hint && <p className="text-[12.5px] leading-snug text-muted">{hint}</p>}
      {(errors[name] || errors[`${name}.en`]) && <p className="text-[12.5px] text-proof">{errors[name] || errors[`${name}.en`]}</p>}
    </fieldset>
  );
}

export function Toggle({ id, checked, onChange, label, hint }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex flex-none">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-cloth peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-proof" />
        <span className="absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
      <span className="grid gap-0.5">
        <span className="text-[14.5px] font-medium">{label}</span>
        {hint && <span className="text-[12.5px] text-muted">{hint}</span>}
      </span>
    </label>
  );
}

const STATUS_TONE = {
  published: 'bg-ok/15 text-ok',
  draft: 'bg-ink/10 text-muted',
  new: 'bg-info/15 text-info',
  reading: 'bg-warn/15 text-warn',
  shortlisted: 'bg-gilt/20 text-gilt',
  accepted: 'bg-ok/15 text-ok',
  declined: 'bg-proof/10 text-proof',
};

export function StatusPill({ status, label }) {
  return <span className={`pill ${STATUS_TONE[status] || 'bg-ink/10 text-muted'}`}>{label}</span>;
}

/** Two-step delete: first click arms, second click confirms */
export function ConfirmButton({ onConfirm, children, className = 'btn btn-danger btn-xs', label }) {
  const { t } = useLang();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const id = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <button
      type="button"
      className={`${className} ${armed ? '!bg-proof !text-page' : ''}`}
      disabled={busy}
      aria-label={armed ? t('admin.common.confirmDelete') : label}
      onClick={async () => {
        if (!armed) return setArmed(true);
        setBusy(true);
        try { await onConfirm(); } finally { setBusy(false); setArmed(false); }
      }}
    >
      <Icon name="trash" size={15} />
      {armed ? t('admin.common.confirmDelete') : children}
    </button>
  );
}

export function Spinner({ className = '' }) {
  return <div className={`h-6 w-6 animate-spin rounded-full border-2 border-line border-t-cloth ${className}`} />;
}

export function Loading() {
  const { t } = useLang();
  return <div className="flex items-center gap-3 py-16 text-muted"><Spinner /> {t('admin.common.loading')}</div>;
}

export function ErrorBox({ error, onRetry }) {
  const { t } = useLang();
  if (!error) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded border border-proof/40 bg-proof/5 px-4 py-3 text-[14px] text-proof" role="alert">
      <span className="flex-1">{errorText(error, t)}</span>
      {onRetry && <button type="button" className="btn btn-quiet btn-xs" onClick={onRetry}>{t('admin.common.retry')}</button>}
    </div>
  );
}

export function Empty({ children, action }) {
  return (
    <div className="grid justify-items-start gap-3 rounded border border-dashed border-line px-6 py-12 text-muted">
      <Icon name="feather" size={26} className="text-gilt" />
      <p>{children}</p>
      {action}
    </div>
  );
}

/** Uploads one image to Cloudinary through the API and returns { url, publicId } */
export function ImageUpload({ value, onChange, kind, aspect = 'aspect-[2/3]', round }) {
  const { t } = useLang();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);
  const sessionUploads = useRef(new Set());

  const discard = (media) => {
    // Only delete images uploaded in this session and not yet saved anywhere
    if (media?.publicId && sessionUploads.current.has(media.publicId)) {
      api('/admin/uploads', { method: 'DELETE', body: { publicId: media.publicId } }).catch(() => {});
      sessionUploads.current.delete(media.publicId);
    }
  };

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append('kind', kind);
    body.append('image', file);
    try {
      const { media } = await api('/admin/uploads', { method: 'POST', body });
      discard(value);
      sessionUploads.current.add(media.publicId);
      onChange(media);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="grid gap-2">
      <div
        className={`relative grid w-full max-w-[220px] place-items-center overflow-hidden border-2 border-dashed transition-colors ${aspect} ${round ? 'rounded-full' : 'rounded'} ${drag ? 'border-cloth bg-cloth/5' : 'border-line'}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]); }}
      >
        {value?.url ? (
          <img src={cld(value.url, 'f_auto,q_auto,w_440')} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <Icon name="upload" size={26} className="text-muted" />
        )}
        {busy && <div className="absolute inset-0 grid place-items-center bg-paper/70"><Spinner /></div>}
      </div>
      <div className="flex flex-wrap gap-2">
        <input ref={input} id={`upload-${kind}`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => upload(e.target.files[0])} />
        <label htmlFor={`upload-${kind}`} className="btn btn-quiet btn-xs cursor-pointer">
          <Icon name="upload" size={14} /> {busy ? t('admin.upload.uploading') : value?.url ? t('admin.upload.replace') : t('admin.upload.choose')}
        </label>
        {value?.url && (
          <button type="button" className="btn btn-quiet btn-xs" onClick={() => { discard(value); onChange(null); }}>
            {t('admin.upload.remove')}
          </button>
        )}
      </div>
      <p className="text-[12px] text-muted">{t('admin.upload.hint')}</p>
      {error && <p className="text-[12.5px] text-proof">{errorText(error, t)}</p>}
    </div>
  );
}

/** Sticky save bar at the bottom of editors */
export function SaveBar({ saving, dirty, onCancel, error }) {
  const { t } = useLang();
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-sm" disabled={saving}>
          <Icon name="check" size={15} /> {saving ? t('admin.common.saving') : t('admin.common.save')}
        </button>
        {onCancel && <button type="button" className="btn btn-quiet btn-sm" onClick={onCancel}>{t('admin.common.cancel')}</button>}
        {dirty && !error && <span className="text-[13px] text-warn">● {t('admin.common.unsaved')}</span>}
        {error && <span className="text-[13px] text-proof">{error}</span>}
      </div>
    </div>
  );
}
