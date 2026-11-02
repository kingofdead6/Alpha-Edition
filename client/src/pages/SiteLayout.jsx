import { Outlet } from 'react-router-dom';
import { useHomeData } from '../lib/siteData.js';
import Header from '../components/site/Header.jsx';
import Ribbon from '../components/site/Ribbon.jsx';
import Footer from '../components/site/Footer.jsx';
import ReadingListDrawer from '../components/site/ReadingListDrawer.jsx';

export default function SiteLayout() {
  const home = useHomeData();
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
