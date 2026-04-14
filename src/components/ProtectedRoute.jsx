import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './StatusComponents';

export function ProtectedRoute({ children }) {
  const { session, isAdmin } = useAuth();
  if (session === undefined) return <LoadingSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h2>Access Denied</h2>
      <p style={{ color: '#666' }}>You do not have admin privileges.</p>
    </div>
  );
  return children;
}
