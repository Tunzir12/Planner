import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './privateRoute';

export default function SessionRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return currentUser ? <Outlet /> : <Navigate to='/' replace />;
}
