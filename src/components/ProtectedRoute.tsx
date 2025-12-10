import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowed: 'pro' | 'student';
}

export default function ProtectedRoute({ children, allowed }: ProtectedRouteProps) {
    const { role, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to correct login based on path
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin" state={{ from: location }} replace />;
        }
        return <Navigate to="/login/aluno" state={{ from: location }} replace />;
    }

    if (role !== allowed) {
        // Redirect to correct dashboard if logged in but wrong role
        if (role === 'pro') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'student') return <Navigate to="/app" replace />;
    }

    return <>{children}</>;
}

