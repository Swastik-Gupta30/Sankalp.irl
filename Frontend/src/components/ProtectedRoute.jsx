import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // While context is verifying localStorage token
    if (loading) {
        return (
            <div className="flex-1 bg-slate-950 flex flex-col justify-center items-center h-screen">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-slate-400 mt-4 font-medium">Verifying session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in, but wrong role type for this route
        return (
            <div className="flex-1 bg-slate-950 flex flex-col justify-center items-center h-screen px-4 text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold">!</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-slate-400 max-w-md">You do not have the required permissions to view this dashboard. Please verify your role.</p>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
