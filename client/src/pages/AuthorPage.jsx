import { Link, useParams } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { useAuthor } from '../lib/siteData.js';
import { usePageTitle } from '../lib/util.js';
import { Portrait } from '../components/site/PageHead.jsx';
import BookCard from '../components/site/BookCard.jsx';
import Reveal from '../components/Reveal.jsx';
import Icon from '../components/Icon.jsx';
import NotFound from './NotFound.jsx';

export default function AuthorPage() {
  const { slug } = useParams();
  const { t, pick, lang } = useLang();
  const { data, error } = useAuthor(slug);
  const author = data?.author;
  const books = data?.books || [];
  usePageTitle(author ? pick(author.name) : '', t('brand.name'));

  if (error?.status === 404) return <NotFound message={t('authorPage.notFound')} />;
  if (!author) {
    return (
      <div className="wrap grid gap-10 py-20 md:grid-cols-[auto_minmax(0,1fr)]" aria-busy="true">
        <div className="h-56 w-56 rounded-full skeleton" />
        <div className="grid content-start gap-4">
          <div className="h-3 w-40 skeleton" />
          <div className="h-14 w-2/3 skeleton" />
          <div className="h-24 w-full skeleton" />
          <p className="text-muted">{t('authorPage.loading')}</p>
        </div>
      </div>
    );
  }

  const name = pick(author.name);
  const withSample = books.find((b) => b.hasSample);

  return (
    <>
      <section className="pb-[clamp(56px,8vw,100px)] pt-[clamp(24px,4vw,48px)]">
        <div className="wrap">
          <Link to="/authors" className="mb-10 inline-flex items-center gap-2 text-[15px] text-muted hover:text-ink">
            <Icon name="arrow" size={16} className="rotate-180 rtl:rotate-0" /> {t('authorPage.back')}
          </Link>
          <div className="grid items-start gap-[clamp(32px,6vw,90px)] md:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)]">
            <div className="seal relative mx-auto aspect-square w-[min(320px,72vw)]" aria-hidden="true">
              {author.featured && (
                <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full">
                  <defs>
                    <path id="author-seal" d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" />
                  </defs>
                  <circle cx="150" cy="150" r="140" />
                  <text key={lang}><textPath href="#author-seal">{t('author.seal', { year: new Date().getFullYear() }).repeat(2)}</textPath></text>
                </svg>
              )}
              <Portrait
                author={author}
                px={320}
                className={`absolute text-[clamp(3.5rem,9vw,6rem)] shadow-[inset_0_0_0_6px_rgb(var(--cloth)),inset_0_0_0_7px_rgb(var(--cloth-ink)/.4)] ${author.featured ? 'inset-[22%]' : 'inset-[6%]'}`}
              />
            </div>

            <div className="page-in min-w-0">
              <p className="eyebrow">{author.featured ? t('author.eyebrow') : t('authorsPage.eyebrow')}</p>
              <h1 className="page-title mt-4">{name}</h1>
              {pick(author.note) && (
                <p className="mt-5 inline-flex items-center gap-2.5 rounded-sm border border-dashed border-proof px-3.5 py-2 font-mono text-[13px] text-proof">
                  <span className="dot" aria-hidden="true" /> {pick(author.note)}
                </p>
              )}
              {pick(author.bio) && <p className="mt-7 max-w-[58ch] text-[18px] leading-relaxed">{pick(author.bio)}</p>}
              {pick(author.quote) && (
                <blockquote className={`quote mt-10 max-w-[30ch] font-display text-[clamp(1.5rem,2.8vw,2.2rem)] ${lang === 'ar' ? 'leading-[1.6]' : 'italic leading-[1.25]'}`}>
                  {pick(author.quote)}
                </blockquote>
              )}
              {withSample && (
                <Link to={`/books/${withSample.slug}#reader`} className="btn btn-ghost mt-9">
                  {t('authorPage.readExcerpt')} <span className="arr">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-paper2">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">{t('authorPage.books')}</Reveal>
          <Reveal as="h2" delay={80} className="mb-10 mt-3.5 text-[clamp(2rem,4vw,3.2rem)]">{name}</Reveal>
          {books.length ? (
            <div className="grid grid-cols-2 gap-x-[clamp(18px,3vw,40px)] gap-y-10 sm:grid-cols-[repeat(auto-fill,minmax(196px,1fr))]">
              {books.map((b) => <BookCard key={b.slug} book={b} />)}
            </div>
          ) : (
            <p className="border-y border-line py-10 text-muted">{t('authorPage.none')}</p>
          )}
        </div>
      </section>
    </>
  );
}
