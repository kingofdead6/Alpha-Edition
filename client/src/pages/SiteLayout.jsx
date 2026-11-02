import { useLayoutEffect } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { useHomeData } from '../lib/siteData.js';
import Header from '../components/site/Header.jsx';
import Ribbon from '../components/site/Ribbon.jsx';
import Footer from '../components/site/Footer.jsx';
import ReadingListDrawer from '../components/site/ReadingListDrawer.jsx';

/** New pages open at the top; back/forward keeps the browser's own scroll position */
function useScrollReset() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  useLayoutEffect(() => {
    if (navType !== 'POP' && !hash) window.scrollTo({ top: 0, behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
}

export default function SiteLayout() {
  const home = useHomeData();
  useScrollReset();
  return (
    <>
      <Ribbon />
      <Header />
      <main id="top">
        <Outlet context={home} />
      </main>
      <Footer settings={home.data?.settings} />
      <ReadingListDrawer />
    </>
  );
}
