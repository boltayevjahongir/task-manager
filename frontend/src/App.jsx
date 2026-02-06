import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PendingPage from './pages/PendingPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import UsersPage from './pages/UsersPage';
import Layout from './components/layout/Layout';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'admin' ? '/dashboard' : '/tasks'} />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to={user.role === 'admin' ? '/dashboard' : '/tasks'} />} />
      <Route path="/pending" element={<PendingPage />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/dashboard' : '/tasks') : '/login'} />} />
    </Routes>
  );
}
