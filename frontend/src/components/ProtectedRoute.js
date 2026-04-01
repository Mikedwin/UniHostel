import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, role }) => {
    const location = useLocation();
    const { user, authLoading } = useAuth();

    if (authLoading) {
        return <LoadingSpinner message="Checking your session..." />;
    }

    if (!user) {
        const loginPath = role === 'manager' ? '/manager-login' : role === 'student' ? '/student-login' : '/login';
        return <Navigate to={loginPath} replace state={{ from: location }} />;
    }
    if (role && user.role !== role) return <Navigate to="/" />;
    
    return children;
};

export default ProtectedRoute;
