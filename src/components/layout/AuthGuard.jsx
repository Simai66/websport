import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthGuard({ children, requiredRole }) {
    const { isAuthenticated, isAdmin, isOwner, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role requirement
    if (requiredRole === 'admin' && !isAdmin) {
        return <Navigate to="/" replace />;
    }
    if (requiredRole === 'owner' && !isOwner) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
