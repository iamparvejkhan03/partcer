import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstanceOld';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setUser(null);
                return null;
            }

            const { data } = await axiosInstance.get('/api/v1/users/me');
            if (data?.success) {
                const userData = data.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            // If token is invalid/expired, clear storage
            if (error?.response?.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setUser(null);
            }
            return null;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('accessToken');

            if (storedUser && token) {
                // Set cached user immediately
                setUser(JSON.parse(storedUser));
                // Fetch fresh data in background
                await fetchCurrentUser();
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (loginData) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_DOMAIN_URL}/api/v1/users/login`, {
                email: loginData.email.toLowerCase(),
                password: loginData.password
            });

            if (data && data.success) {
                const userInfo = data.data.user;
                const accessToken = data.data.accessToken;
                const refreshToken = data.data.refreshToken;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(userInfo));

                setUser(userInfo);

                return { success: true, message: data.message, userType: userInfo.userType }
            }
        } catch (error) {
            toast.error(error?.response?.data?.message);
            console.log(error);
            return { success: false, error: error?.response?.data?.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const updateUserData = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        setUser,
        loading,
        setLoading,
        login,
        logout,
        fetchCurrentUser,
        updateUserData,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};