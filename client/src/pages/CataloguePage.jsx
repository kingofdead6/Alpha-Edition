import { useOutletContext } from 'react-router-dom';
import { useLang } from '../lib/i18n.jsx';
import { usePageTitle } from '../lib/util.js';
import Catalogue from '../components/site/Catalogue.jsx';
import Ticker from '../components/site/Ticker.jsx';

export default function CataloguePage() {
  const { data, loading, error, reload } = useOutletContext();
  const { t } = useLang();
  const books = data?.books || [];
  usePageTitle(t('pages.catalogue'), t('brand.name'));

  return (
    <>
      <Catalogue books={books} loading={loading} error={error} onRetry={reload} page />
      <Ticker books={books} />
    </>
  );
}
