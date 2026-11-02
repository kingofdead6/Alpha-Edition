import { useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import Hero from '../components/site/Hero.jsx';
import Ticker from '../components/site/Ticker.jsx';
import Catalogue from '../components/site/Catalogue.jsx';
import { AuthorSpotlight, Numbers, Process } from '../components/site/Sections.jsx';
import Submit from '../components/site/Submit.jsx';

export default function Home() {
  const { data, loading, error, reload } = useOutletContext();
  const { hash } = useLocation();
  const books = data?.books || [];
  const settings = data?.settings;

  // Arriving from another page with #section: scroll once the content exists
  useEffect(() => {
    if (!hash || loading) return;
    const el = document.getElementById(hash.slice(1));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [hash, loading]);

  return (
    <>
      <Hero books={books} settings={settings} loading={loading} />
      <Ticker books={books} />
      <Catalogue books={books} loading={loading} error={error} onRetry={reload} />
      <Process />
      <Numbers stats={settings?.stats} />
      <AuthorSpotlight author={data?.author} books={books} />
      <Submit settings={settings} />
    </>
  );
}
