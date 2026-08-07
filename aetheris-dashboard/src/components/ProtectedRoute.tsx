import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // Simple check for token in localStorage. Adjust according to actual backend response
  const isAuthenticated = localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
