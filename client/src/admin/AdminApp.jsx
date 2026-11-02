import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import AdminLayout from './AdminLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import BookEditor from './pages/BookEditor.jsx';
import Authors from './pages/Authors.jsx';
import AuthorEditor from './pages/AuthorEditor.jsx';
import Submissions from './pages/Submissions.jsx';
import Subscribers from './pages/Subscribers.jsx';
import Settings from './pages/Settings.jsx';
import { Loading } from './ui.jsx';

function RequireAuth({ children }) {
  const { admin, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div className="wrap"><Loading /></div>;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="books/new" element={<BookEditor />} />
        <Route path="books/:id" element={<BookEditor />} />
        <Route path="authors" element={<Authors />} />
        <Route path="authors/new" element={<AuthorEditor />} />
        <Route path="authors/:id" element={<AuthorEditor />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="subscribers" element={<Subscribers />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
