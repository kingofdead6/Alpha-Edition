import { useLang } from '../../lib/i18n.jsx';

export default function Ticker({ books }) {
  const { t, pick } = useLang();
  if (!books.length) return <div className="h-[52px] bg-cloth" aria-hidden="true" />;

  const group = (hidden) => (
    <div className="flex items-center gap-9 whitespace-nowrap pe-9 font-mono text-[13px] tracking-[.05em]" aria-hidden={hidden || undefined}>
      {books.map((b) => (
        <span key={b.slug} className="flex items-center gap-9">
          <span className="font-display text-lg italic tracking-normal">{pick(b.title)}</span>
          <span>{pick(b.author?.name)}</span>
          {b.isbn && <span dir="ltr">ISBN {b.isbn}</span>}
          <span className="text-lg text-[rgb(var(--orn))]" aria-hidden="true">❧</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="ticker overflow-hidden bg-cloth py-[15px] text-clothink" aria-label={t('ticker.label')}>
      <div className="ticker-track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
