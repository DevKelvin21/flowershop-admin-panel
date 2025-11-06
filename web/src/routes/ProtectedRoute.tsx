import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/index';

type ProtectedRouteProps = {
    children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth(authService);

    if (loading) {
        return <LoadingSpinner />;
    }

    // Redirect to login if not authenticated
    // 'replace' means it replaces current history entry instead of adding a new one
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
}

