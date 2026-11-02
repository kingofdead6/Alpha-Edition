import { Link } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { useAuthors } from '../lib/siteData.js';
import { errorText } from '../lib/api.js';
import { usePageTitle } from '../lib/util.js';
import PageHead, { Portrait } from '../components/site/PageHead.jsx';
import Reveal from '../components/Reveal.jsx';

function AuthorCard({ author, index }) {
  const { t, pick, fmtNum } = useLang();
  const count = author.books === 1 ? t('authorsPage.book') : author.books ? t('authorsPage.books', { n: fmtNum(author.books) }) : t('authorsPage.noBooks');
  return (
    <Reveal as="li" delay={(index % 3) * 80} className="min-w-0">
      <Link to={`/authors/${author.slug}`} className="author-card group grid h-full content-start gap-5 border-t border-ink pt-6">
        <div className="flex items-start justify-between gap-4">
          <Portrait author={author} px={96} className="portrait h-24 w-24 text-3xl" />
          {author.featured && (
            <span className="rounded-sm border border-dashed border-proof px-2 py-1 font-mono text-[11px] uppercase tracking-[.08em] text-proof">
              {t('authorsPage.residence')}
            </span>
          )}
        </div>
        <div className="grid gap-1.5">
          <p className="label">{count}</p>
          <h2 className="text-[clamp(1.6rem,2.4vw,2.1rem)] transition-colors group-hover:text-cloth">{pick(author.name)}</h2>
          {pick(author.bio) && <p className="line-clamp-3 max-w-[44ch] text-[15px] text-muted">{pick(author.bio)}</p>}
        </div>
      </Link>
    </Reveal>
  );
}

export default function AuthorsPage() {
  const { t } = useLang();
  const { data, error } = useAuthors();
  const authors = data?.authors || [];
  usePageTitle(t('nav.authors'), t('brand.name'));

  return (
    <>
      <PageHead crumb={t('nav.authors')} eyebrow={t('authorsPage.eyebrow')} title={t('authorsPage.title')} em={t('authorsPage.titleEm')} lede={t('authorsPage.lede')} />
      <section className="wrap pb-[clamp(72px,10vw,136px)]">
        {error && !data ? (
          <div className="grid justify-items-start gap-3 border-y border-line py-10">
            <p className="font-display text-2xl">{t('authorsPage.error')}</p>
            <p className="text-muted">{errorText(error, t)}</p>
          </div>
        ) : !data ? (
          <ul className="grid list-none gap-x-10 gap-y-14 p-0 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="grid gap-4 border-t border-line pt-6">
                <div className="h-24 w-24 rounded-full skeleton" />
                <div className="h-3 w-20 skeleton" />
                <div className="h-7 w-2/3 skeleton" />
                <div className="h-12 w-full skeleton" />
              </li>
            ))}
          </ul>
        ) : !authors.length ? (
          <p className="border-y border-line py-10 text-muted">{t('authorsPage.empty')}</p>
        ) : (
          <ul className="grid list-none gap-x-10 gap-y-14 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((a, i) => <AuthorCard key={a.slug} author={a} index={i} />)}
          </ul>
        )}
      </section>
    </>
  );
}
