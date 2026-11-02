import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SiteLayout from './pages/SiteLayout.jsx';
import Home from './pages/Home.jsx';
import BookPage from './pages/BookPage.jsx';
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
        <Route path="books/:slug" element={<BookPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
