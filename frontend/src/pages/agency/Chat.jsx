import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { AgencyContainer, AgencyHeader, AgencySidebar, AgencyOrderSummaryCard, ResolutionPanel } from '../../components';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import { MessageSquare, Package, ChevronLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { formatOrderPrice } from '../../utils/currencyHelpers';

const AgencyChat = () => {
    const [searchParams] = useSearchParams();
    const receiverId = searchParams.get('user');
    const { socket, isConnected, onlineUsers } = useSocket();
    const { user } = useAuth();
    const { markMessagesAsRead } = useNotifications();

    // State for conversations
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for right panel - Orders
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [currentOrderDetails, setCurrentOrderDetails] = useState(null);
    const [currentOrderSessionStats, setCurrentOrderSessionStats] = useState(null);
    const [currentOrderSessions, setCurrentOrderSessions] = useState(null);
    const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

    // Mobile states
    // const [showMobileList, setShowMobileList] = useState(false);
    const [showMobileList, setShowMobileList] = useState(() => {
        // If there's a user in URL, show chat; otherwise show list
        const urlUserId = new URLSearchParams(window.location.search).get('user');
        return !urlUserId; // true if no user in URL
    });
    const [showMobileRightPanel, setShowMobileRightPanel] = useState(false);

    // Add these states with your other states
    const [showResolution, setShowResolution] = useState(false);
    const [showOrderHistory, setShowOrderHistory] = useState(false);

    // Refs
    const isInitialLoad = useRef(true);

    // Mark messages as read when page loads
    useEffect(() => {
        markMessagesAsRead();
    }, []);

    // Load conversations
    useEffect(() => {
        if (socket && isConnected) {
            setLoading(true);
            socket.emit('conversations:get');

            socket.on('conversations:list', (convs) => {
                setConversations(convs);
                setLoading(false);

                // Auto-select conversation from URL or first one
                if (isInitialLoad.current && convs.length > 0) {
                    isInitialLoad.current = false;
                    const urlUserId = searchParams.get('user');

                    if (urlUserId) {
                        const conv = convs.find(c =>
                            c.participants.some(p => p._id === urlUserId)
                        );
                        if (conv) {
                            setSelectedConversation(conv);
                            setShowMobileList(false);
                            const otherUser = conv.participants.find(
                                p => p._id !== user._id
                            );
                            if (otherUser) {
                                fetchUserOrders(otherUser._id);
                            }
                        }
                    }
                }
            });

            socket.on('conversation:updated', (updatedConv) => {
                setConversations(prev => {
                    const filtered = prev.filter(c => c._id !== updatedConv._id);
                    return [updatedConv, ...filtered];
                });
            });

            return () => {
                socket.off('conversations:list');
                socket.off('conversation:updated');
            };
        }
    }, [socket, isConnected]);

    // Load messages when conversation selected
    useEffect(() => {
        if (socket && isConnected && selectedConversation) {
            setMessages([]);

            // Get other participant
            const otherParticipant = selectedConversation.participants.find(
                p => p._id !== user._id
            );

            // Fetch orders for this user
            if (otherParticipant) {
                fetchUserOrders(otherParticipant._id);
            }

            socket.emit('messages:get', {
                conversationId: selectedConversation._id
            });

            const handleMessagesList = ({ conversationId, messages: msgs }) => {
                if (conversationId === selectedConversation._id) {
                    setMessages(msgs);
                    // Mark messages as read
                    socket.emit('messages:read', { conversationId });
                }
            };

            const handleMessageSent = (newMessage) => {
                if (newMessage.conversation === selectedConversation._id) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === newMessage._id)) return prev;
                        return [...prev, newMessage];
                    });
                }
            };

            const handleMessageReceived = (newMessage) => {
                if (newMessage.conversation === selectedConversation._id) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === newMessage._id)) return prev;
                        return [...prev, newMessage];
                    });
                    socket.emit('messages:read', {
                        conversationId: selectedConversation._id
                    });
                }
            };

            const handleMessagesRead = ({ conversationId, readerId }) => {
                if (conversationId === selectedConversation._id) {
                    setMessages(prev => prev.map(msg =>
                        msg.receiver?._id === readerId
                            ? { ...msg, status: 'read' }
                            : msg
                    ));
                }
            };

            socket.on('messages:list', handleMessagesList);
            socket.on('message:sent', handleMessageSent);
            socket.on('message:received', handleMessageReceived);
            socket.on('messages:read', handleMessagesRead);

            return () => {
                socket.off('messages:list', handleMessagesList);
                socket.off('message:sent', handleMessageSent);
                socket.off('message:received', handleMessageReceived);
                socket.off('messages:read', handleMessagesRead);
            };
        }
    }, [socket, isConnected, selectedConversation]);

    // Fetch orders for a specific user
    const fetchUserOrders = async (userId) => {
        if (!userId) return;

        try {
            setOrdersLoading(true);
            const response = await axiosInstance.get(
                `/api/v1/payments/history/${user._id}/${userId}`
            );

            if (response.data?.success) {
                setOrders(response.data.data.orders || []);
                // Auto-select first order if available
                // if (response.data.data?.orders?.length > 0) {
                //     handleSelectOrder(response.data.data.orders[0]);
                // } else {
                //     setSelectedOrder(null);
                //     setShowOrderSummary(false);
                // }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Handle selecting a conversation
    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setShowMobileList(false);

        // Close the right panel on mobile when selecting a new conversation
    setShowMobileRightPanel(false);
    setShowOrderSummary(false);

        const otherParticipant = conversation.participants.find(
            p => p._id !== user._id
        );

        if (otherParticipant) {
            // Update URL without reload
            const newUrl = `/${user?.userType}/chat?user=${otherParticipant._id}`;
            window.history.pushState({}, '', newUrl);

            // Fetch orders for this user
            fetchUserOrders(otherParticipant._id);
        }
    };

    // Handle selecting an order from the list
    const handleSelectOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderSummary(true);
        setShowMobileRightPanel(true);
        fetchOrderDetails(order._id);
    };

    // Fetch detailed order info
    const fetchOrderDetails = async (orderId) => {
        try {
            setOrderDetailsLoading(true);
            const response = await axiosInstance.get(
                `/api/v1/payments/status/${orderId}`
            );

            if (response.data?.success) {
                setCurrentOrderDetails(response.data.data.order);
                setCurrentOrderSessionStats(response.data.data.sessionStats);
                setCurrentOrderSessions(response.data.data.sessions);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to load order details');
        } finally {
            setOrderDetailsLoading(false);
        }
    };

    // Handle sending message
    const handleSendMessage = (content, attachments = []) => {
        if (!selectedConversation) return;

        const receiverId = selectedConversation.participants.find(
            p => p._id !== user._id
        )?._id;

        if (receiverId) {
            socket.emit('message:send', {
                receiverId,
                content,
                attachments
            });
        }
    };

    // Handle typing
    const handleTyping = (isTyping) => {
        if (!selectedConversation) return;

        const receiverId = selectedConversation.participants.find(
            p => p._id !== user._id
        )?._id;

        if (receiverId) {
            if (isTyping) {
                socket.emit('typing:start', { receiverId });
            } else {
                socket.emit('typing:stop', { receiverId });
            }
        }
    };

    const handleBackToOrdersList = () => {
        setShowOrderSummary(false);
        setSelectedOrder(null);
        setCurrentOrderDetails(null);
        setCurrentOrderSessionStats(null);
        setCurrentOrderSessions(null);
        setShowMobileRightPanel(false);
        setShowResolution(false);  // Add this
        setShowOrderHistory(false); // Add this

        const otherParticipant = selectedConversation?.participants.find(
            p => p._id !== user._id
        );
        // if (otherParticipant) {
        //     fetchUserOrders(otherParticipant._id);
        // }
    };

    // Handle order action (complete, review, etc.)
    const handleOrderAction = () => {
        // Refresh order details after action
        if (selectedOrder) {
            fetchOrderDetails(selectedOrder._id);
        }
        // Also refresh orders list
        const otherParticipant = selectedConversation?.participants.find(
            p => p._id !== user._id
        );
        // if (otherParticipant) {
        //     fetchUserOrders(otherParticipant._id);
        // }
    };

    // Get other participant from conversation
    const getOtherParticipant = () => {
        if (!selectedConversation) return null;
        return selectedConversation.participants.find(
            p => p._id !== user._id
        );
    };

    const otherUser = getOtherParticipant();

    // Show order details button on mobile
    const handleShowOrderDetails = () => {
        setShowMobileRightPanel(true);
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AgencySidebar />
            <div className="flex-1">
                <AgencyHeader />
                <AgencyContainer>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 h-[calc(100vh-150px)] mt-20 md:mt-5">
                        {/* Three Column Layout */}
                        <div className="flex h-full">
                            {/* Left Column - Conversation List (25%) */}
                            <div className={`${showMobileList ? 'block' : 'hidden'
                                } md:block max-w-full md:max-w-56 lg:max-w-64 border-r border-gray-200 bg-white absolute md:relative z-20 max-h-full overflow-auto`}>
                                <ConversationList
                                    conversations={conversations}
                                    selectedConversation={selectedConversation}
                                    onSelectConversation={handleSelectConversation}
                                    onlineUsers={onlineUsers}
                                    currentUser={user}
                                    loading={loading}
                                    onClose={() => setShowMobileList(false)}
                                />
                            </div>

                            {/* Middle Column - Chat Window (50%) */}
                            <div className={`flex-1 flex flex-col bg-gray-50 ${showMobileList ? 'hidden md:flex' : 'flex'
                                } ${showMobileRightPanel ? 'md:flex-1' : 'flex-1'}`}>
                                {selectedConversation ? (
                                    <ChatWindow
                                        conversation={selectedConversation}
                                        messages={messages}
                                        currentUser={user}
                                        onSendMessage={handleSendMessage}
                                        onTyping={handleTyping}
                                        onlineUsers={onlineUsers}
                                        onBack={() => {
                                            setShowMobileList(true);
                                            setShowMobileRightPanel(false);
                                        }}
                                        onShowOrderDetails={handleShowOrderDetails}
                                        orderId={selectedOrder?._id}
                                        orderDetails={currentOrderDetails}
                                        sessionStats={currentOrderSessionStats}
                                        sessions={currentOrderSessions}
                                    />
                                ) : (
                                    <div className="flex-1 flex items-center justify-center p-4">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <MessageSquare size={32} className="text-primary" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                No conversation selected
                                            </h3>
                                            <p className="text-gray-500">
                                                Select a conversation to start chatting
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Orders (25%) */}
                            <div className={`${showMobileRightPanel ? 'block' : 'hidden'
                                } lg:block max-w-full md:max-w-64 lg:max-w-80 border-l border-gray-200 bg-white absolute md:relative z-20 max-h-full overflow-y-auto`}>
                                {/* Mobile Close Button */}
                                <div className="lg:hidden sticky top-0 bg-white z-10 p-3 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900">Order Details</h3>
                                    <button
                                        onClick={() => setShowMobileRightPanel(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {!selectedConversation ? (
                                    <div className="p-6 text-center">
                                        <Package size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">Select a conversation to view orders</p>
                                    </div>
                                ) : ordersLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <Package size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className='text-gray-600 font-medium'>No orders yet</p>
                                        <p className="text-gray-500 text-sm">Book a mentor to see your order details here.</p>
                                    </div>
                                ) : showResolution ? (
                                    // Resolution Center View
                                    <div className="py-4 px-2">
                                        <button
                                            onClick={() => {
                                                setShowResolution(false);
                                                // Refresh orders list
                                                const otherParticipant = selectedConversation?.participants.find(
                                                    p => p._id !== user._id
                                                );
                                                if (otherParticipant) {
                                                    fetchUserOrders(otherParticipant._id);
                                                }
                                            }}
                                            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                            <span className="text-sm font-medium">Back to Orders</span>
                                        </button>
                                        <ResolutionPanel
                                            order={currentOrderDetails || selectedOrder}
                                            onBack={() => {
                                                setShowResolution(false);
                                                // Refresh orders list
                                                const otherParticipant = selectedConversation?.participants.find(
                                                    p => p._id !== user._id
                                                );
                                                if (otherParticipant) {
                                                    fetchUserOrders(otherParticipant._id);
                                                }
                                            }}
                                        />
                                    </div>
                                ) : showOrderSummary && selectedOrder ? (
                                    // Order Summary View
                                    <div className="py-4 px-2">
                                        <button
                                            onClick={handleBackToOrdersList}
                                            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                            <span className="text-sm font-medium">Back to Orders</span>
                                        </button>

                                        {orderDetailsLoading ? (
                                            <div className="flex justify-center items-center h-32">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            </div>
                                        ) : currentOrderDetails ? (
                                            <AgencyOrderSummaryCard
                                                order={currentOrderDetails}
                                                sessionStats={currentOrderSessionStats}
                                                sessions={currentOrderSessions}
                                                user={user}
                                                onAction={handleOrderAction}
                                                onRefresh={() => fetchOrderDetails(selectedOrder._id)}
                                                onShowResolution={() => {
                                                    setShowResolution(true);
                                                    setShowOrderSummary(false);
                                                }}
                                            />
                                        ) : (
                                            <p className="text-gray-500 text-center">Unable to load order details</p>
                                        )}
                                    </div>
                                ) : (
                                    // Orders List View
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Package size={18} />
                                            Orders with {otherUser?.firstName}
                                        </h3>
                                        <div className="space-y-2">
                                            {orders?.map((order) => (
                                                <button
                                                    key={order._id}
                                                    onClick={() => handleSelectOrder(order)}
                                                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {order.serviceType}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {order.orderId?.slice(-8)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-primary">
                                                                {formatOrderPrice(order).formatted}
                                                            </p>
                                                            {/* <span className={`text-xs px-2 py-0.5 rounded-full ${order.deliveryStatus === 'completed'
                                                                ? 'bg-green-100 text-green-700'
                                                                : order.deliveryStatus === 'delivered'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {order.deliveryStatus || 'Pending'}
                                                            </span> */}
                                                        </div>
                                                    </div>
                                                    <div className="mt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.orderStatus === 'confirmed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : order.orderStatus === 'completed'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {order.orderStatus || 'Pending'}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </AgencyContainer>
            </div>
        </section>
    );
};

export default AgencyChat;