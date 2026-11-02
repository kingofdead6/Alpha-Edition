import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SiteLayout from './pages/SiteLayout.jsx';
import Home from './pages/Home.jsx';
import BookPage from './pages/BookPage.jsx';
import CataloguePage from './pages/CataloguePage.jsx';
import AuthorsPage from './pages/AuthorsPage.jsx';
import AuthorPage from './pages/AuthorPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import SubmitPage from './pages/SubmitPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LegalPage from './pages/LegalPage.jsx';
import NotFound from './pages/NotFound.jsx';

// The admin panel is loaded only when someone opens /admin
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function Loading() {
  return <div className="grid min-h-screen place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-cloth" /></div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<Suspense fallback={<Loading />}><AdminApp /></Suspense>} />
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="books" element={<CataloguePage />} />
        <Route path="books/:slug" element={<BookPage />} />
        <Route path="authors" element={<AuthorsPage />} />
        <Route path="authors/:slug" element={<AuthorPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="submit" element={<SubmitPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<LegalPage kind="privacy" key="privacy" />} />
        <Route path="terms" element={<LegalPage kind="terms" key="terms" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
