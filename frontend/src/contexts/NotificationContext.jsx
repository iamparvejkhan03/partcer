import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { socket } = useSocket();

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadOrders, setUnreadOrders] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch initial counts
    const fetchUnreadCounts = async () => {
        if (!isAuthenticated || !user) return;

        try {
            setLoading(true);
            const [messagesRes, ordersRes] = await Promise.all([
                axiosInstance.get('/api/v1/chat/unread/count'),
                axiosInstance.get('/api/v1/payments/unread/count')
            ]);

            if (messagesRes.data?.success) {
                setUnreadMessages(messagesRes.data.data.count);
            }
            if (ordersRes.data?.success) {
                setUnreadOrders(ordersRes.data.data.count);
            }
        } catch (error) {
            console.error('Error fetching unread counts:', error);
        } finally {
            setLoading(false);
        }
    };

    /// Mark messages as read (when visiting chat page)
    const markMessagesAsRead = async () => {
        try {
            // Call the API to mark all messages as read on the backend
            await axiosInstance.put('/api/v1/chat/mark-all-read');
            // Reset local state
            setUnreadMessages(0);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Mark orders as viewed (when visiting orders page)
    const markOrdersAsViewed = async () => {
        try {
            await axiosInstance.put('/api/v1/payments/mark-viewed');
            setUnreadOrders(0);
        } catch (error) {
            console.error('Error marking orders as viewed:', error);
        }
    };

    // Increment message count (on new message)
    const incrementMessages = () => {
        setUnreadMessages(prev => prev + 1);
    };

    // Increment order count (on new order)
    const incrementOrders = () => {
        setUnreadOrders(prev => prev + 1);
    };

    // Reset counts
    const resetAllCounts = () => {
        setUnreadMessages(0);
        setUnreadOrders(0);
    };

    // Socket listeners
    useEffect(() => {
        if (!socket || !isAuthenticated) return;

        // Listen for new messages
        socket.on('message:received', (message) => {
            if (message.receiver?._id === user?._id) {
                incrementMessages();
            }
        });

        // Listen for new orders
        socket.on('order:new', (data) => {
            if (data.mentorId === user?._id) {
                incrementOrders();
            }
        });

        // Listen for message count updates
        socket.on('messages:count:update', (data) => {
            setUnreadMessages(data.count);
        });

        // Listen for order count updates
        socket.on('orders:count:update', (data) => {
            setUnreadOrders(data.count);
        });

        // Cleanup
        return () => {
            socket.off('message:received');
            socket.off('order:new');
            socket.off('messages:count:update');
            socket.off('orders:count:update');
        };
    }, [socket, user, isAuthenticated]);

    // Fetch counts on auth change
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchUnreadCounts();
        } else {
            resetAllCounts();
        }
    }, [isAuthenticated, user]);

    const value = {
        unreadMessages,
        unreadOrders,
        loading,
        fetchUnreadCounts,
        markMessagesAsRead,
        markOrdersAsViewed,
        incrementMessages,
        incrementOrders,
        resetAllCounts
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};