import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, getUserRole, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    const userRole = getUserRole();
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        return <Navigate to={`/${userRole}/dashboard`} replace />;
    }

    return children;
};

export default ProtectedRoute;
