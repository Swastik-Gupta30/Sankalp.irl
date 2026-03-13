import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Create the Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load session from localStorage on app start
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Generic Login Function
    const login = async (roleEndpoint, credentials) => {
        try {
            // roleEndpoint example: "/auth/user/login" or "/auth/admin/login"
            const response = await api.post(roleEndpoint, credentials);
            
            const { token, ...userData } = response.data;
            // The userData is nested under admin/staff/user depending on role
            const userObj = userData.admin || userData.staff || userData.user;
            
            // Add the exact role for easy checking later
            if(roleEndpoint.includes('admin')) userObj.role = 'admin';
            else if(roleEndpoint.includes('ward')) userObj.role = 'ward_staff';
            else userObj.role = 'user';

            // Store in state
            setToken(token);
            setUser(userObj);

            // Persist
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userObj));

            return { success: true, user: userObj };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, message };
        }
    };

    // Generic Signup Function
    const signup = async (roleEndpoint, userData) => {
        try {
            // roleEndpoint example: "/auth/user/register"
            const response = await api.post(roleEndpoint, userData);
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, message };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
