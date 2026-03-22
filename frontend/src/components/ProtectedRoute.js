import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, role }) => {
    const { user, authLoading } = useAuth();

    if (authLoading) {
        return <LoadingSpinner message="Checking your session..." />;
    }

    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    
    return children;
};

export default ProtectedRoute;
