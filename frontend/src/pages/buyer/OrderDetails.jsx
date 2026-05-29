import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { BuyerContainer, BuyerHeader, BuyerSidebar, OrderHistoryPanel, ResolutionPanel } from '../../components';
import {
    Calendar,
    DollarSign,
    User,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    MessageCircle,
    Phone,
    Mail,
    MapPin,
    Download,
    FileText,
    Paperclip,
    Send,
    MoreVertical,
    ChevronDown,
    Star,
    Flag,
    ThumbsUp,
    BookmarkCheck,
    Bookmark,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { format } from 'date-fns';
import ChatTabs from '../../components/chat/ChatTabs';
import MeetingTab from '../../components/chat/MeetingTab';
import ResourcesTab from '../../components/chat/ResourcesTab';
import SavedTab from '../../components/chat/SavedTab';
import MessageInput from '../../components/chat/MessageInput';
import { dummyUserImg } from '../../assets';
import { useCurrency } from '../../hooks/useCurrency';
import { formatOrderPrice } from '../../utils/currencyHelpers';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { socket, isConnected, onlineUsers } = useSocket();
    const { user } = useAuth();
    const { convertPrice, getCurrencySymbol, rates, currency } = useCurrency();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [messageLoading, setMessageLoading] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [deliveryAttachments, setDeliveryAttachments] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [conversations, setConversations] = useState([]); // Add this to track conversations
    const [activeTab, setActiveTab] = useState('chat');

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const [savedMessages, setSavedMessages] = useState(new Set()); // Track saved message IDs
    const [savingMessageId, setSavingMessageId] = useState(null); // Track which message is being saved

    const hasUserReviewed = user?.userType === 'buyer'
        ? order?.studentReviewed
        : order?.mentorReviewed;

    const [showResolution, setShowResolution] = useState(false);
    const [showOrderHistory, setShowOrderHistory] = useState(false);

    const [mentorReview, setMentorReview] = useState(null);
    const [studentReview, setStudentReview] = useState(null);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Save or unsave a message
    const handleSaveMessage = async (messageId, isCurrentlySaved) => {
        setSavingMessageId(messageId);
        try {
            if (isCurrentlySaved) {
                // Unsave message
                await axiosInstance.delete(`/api/v1/chat/messages/${messageId}/save`);
                setSavedMessages(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(messageId);
                    return newSet;
                });
                toast.success('Message removed from saved');
            } else {
                // Save message
                await axiosInstance.post(`/api/v1/chat/messages/${messageId}/save`);
                setSavedMessages(prev => new Set([...prev, messageId]));
                toast.success('Message saved');
            }
        } catch (error) {
            console.error('Error saving message:', error);
            toast.error(error.response?.data?.message || 'Failed to save message');
        } finally {
            setSavingMessageId(null);
        }
    };

    // Load saved messages for this conversation
    const loadSavedMessages = async () => {
        try {
            const response = await axiosInstance.get(`/api/v1/chat/saved-messages?conversationId=${conversation?._id}`);
            if (response.data?.success) {
                const savedIds = new Set(response.data.data.map(msg => msg.messageId));
                setSavedMessages(savedIds);
            }
        } catch (error) {
            console.error('Error loading saved messages:', error);
        }
    };

    // Load saved messages when conversation is selected
    useEffect(() => {
        if (conversation?._id) {
            loadSavedMessages();
        }
    }, [conversation?._id]);

    // Fetch order details
    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    // Initialize socket listeners for messages (similar to Chat page)
    useEffect(() => {
        if (!socket || !isConnected || !conversation) return;

        const conversationId = conversation._id;

        // Load messages when conversation is selected
        setMessages([]);
        setMessageLoading(true);

        socket.emit('messages:get', { conversationId });

        const handleMessagesList = ({ conversationId: convId, messages: msgs }) => {
            if (convId === conversationId) {
                setMessages(msgs);
                setMessageLoading(false);
                // Mark messages as read
                socket.emit('messages:read', { conversationId });
            }
        };

        const handleMessageSent = (newMessage) => {
            if (newMessage.conversation === conversationId) {
                setMessages(prev => {
                    if (prev.some(m => m._id === newMessage._id)) return prev;
                    return [...prev, newMessage];
                });
            }
        };

        const handleMessageReceived = (newMessage) => {
            if (newMessage.conversation === conversationId) {
                setMessages(prev => {
                    if (prev.some(m => m._id === newMessage._id)) return prev;
                    return [...prev, newMessage];
                });
                // Mark as read when receiving new message
                socket.emit('messages:read', { conversationId });
            }
        };

        const handleMessagesRead = ({ conversationId: convId, readerId }) => {
            if (convId === conversationId) {
                setMessages(prev => prev.map(msg =>
                    msg.receiver?._id === readerId
                        ? { ...msg, status: 'read' }
                        : msg
                ));
            }
        };

        const handleTypingStart = ({ userId, conversationId: convId }) => {
            if (convId === conversationId && userId !== user._id) {
                setOtherUserTyping(true);
            }
        };

        const handleTypingStop = ({ userId, conversationId: convId }) => {
            if (convId === conversationId && userId !== user._id) {
                setOtherUserTyping(false);
            }
        };

        socket.on('messages:list', handleMessagesList);
        socket.on('message:sent', handleMessageSent);
        socket.on('message:received', handleMessageReceived);
        socket.on('messages:read', handleMessagesRead);
        socket.on('typing:start', handleTypingStart);
        socket.on('typing:stop', handleTypingStop);

        return () => {
            socket.off('messages:list', handleMessagesList);
            socket.off('message:sent', handleMessageSent);
            socket.off('message:received', handleMessageReceived);
            socket.off('messages:read', handleMessagesRead);
            socket.off('typing:start', handleTypingStart);
            socket.off('typing:stop', handleTypingStop);
        };
    }, [socket, isConnected, conversation, user._id]);

    // Load conversations and find/create conversation with mentor
    useEffect(() => {
        if (!socket || !isConnected || !order) return;

        const mentorId = order.mentorId?._id;
        if (!mentorId) return;

        // First, load all conversations
        setLoading(true);
        socket.emit('conversations:get');

        const handleConversationsList = (convs) => {
            setConversations(convs);

            // Check if conversation with mentor exists
            const existingConv = convs.find(conv =>
                conv.participants.some(p => p._id === mentorId)
            );

            if (existingConv) {
                setConversation(existingConv);
            } else {
                // Create new conversation
                socket.emit('conversation:getOrCreate', { receiverId: mentorId });
            }
            setLoading(false);
        };

        const handleConversationCreated = (conv) => {
            setConversation(conv);
            // Refresh conversations list
            socket.emit('conversations:get');
        };

        const handleConversationExists = (conv) => {
            setConversation(conv);
        };

        socket.on('conversations:list', handleConversationsList);
        socket.on('conversation:created', handleConversationCreated);
        socket.on('conversation:exists', handleConversationExists);

        return () => {
            socket.off('conversations:list', handleConversationsList);
            socket.off('conversation:created', handleConversationCreated);
            socket.off('conversation:exists', handleConversationExists);
        };
    }, [socket, isConnected, order]);

    useEffect(() => {
        const fetchOrderReviews = async () => {
            if (!order || order.deliveryStatus !== 'completed') return;
            if (user?.userType !== 'buyer') return; // student = buyer

            setLoadingReviews(true);
            try {
                const response = await axiosInstance.get(`/api/v1/reviews/order/${orderId}`);

                if (response.data?.success && Array.isArray(response.data.data)) {
                    const reviews = response.data.data;

                    // Student's own review (reviewer is the student)
                    const myReview = reviews.find(r => r.reviewer?._id === user._id);
                    setStudentReview(myReview || null);

                    const mentorReviewData = reviews.find(r =>
                        r.reviewerRole === 'mentor' && r.reviewee?._id === user._id
                    );
                    setMentorReview(mentorReviewData || null);
                }
            } catch (error) {
                console.error('Error fetching order reviews:', error);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchOrderReviews();
    }, [order, orderId, user]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/payments/status/${orderId}`);

            if (response.data?.success) {
                setOrder(response.data.data.order);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (content, attachments = []) => {
        if (!conversation) return;

        const receiverId = order.mentorId?._id;

        socket.emit('message:send', {
            receiverId,
            content,
            attachments: attachments  // These are already uploaded from MessageInput
        });
    };

    useEffect(() => {
        return () => {
            attachments.forEach(attachment => {
                if (attachment.preview) {
                    URL.revokeObjectURL(attachment.preview);
                }
            });
        };
    }, [attachments]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const maxSize = 5 * 1024 * 1024; // 5MB limit

        for (const file of files) {
            if (file.size > maxSize) {
                toast.error(`${file.name} is too large (max 5MB)`);
                continue;
            }

            // Store the file object directly
            validFiles.push({
                file: file,  // Keep the actual File object
                name: file.name,
                type: file.type,
                size: file.size
            });
        }

        setAttachments(prev => [...prev, ...validFiles]);

        // Clear the input
        e.target.value = '';
    };

    // ✅ Correct - receives boolean for typing state
    const handleTyping = (isTyping) => {
        if (!conversation) return;

        const receiverId = order.mentorId?._id;

        if (isTyping) {
            socket.emit('typing:start', { receiverId });
        } else {
            socket.emit('typing:stop', { receiverId });
        }
    };

    const handleCompleteOrder = async () => {
        try {
            const response = await axiosInstance.post(`/api/v1/payments/orders/${orderId}/complete`);

            if (response.data?.success) {
                toast.success('Order marked as completed!');
                fetchOrderDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete order');
        }
    };

    const handleSubmitReview = async () => {
        if (!reviewData.comment.trim()) {
            toast.error('Please write a review comment');
            return;
        }

        try {
            const response = await axiosInstance.post(`/api/v1/reviews/order/${orderId}`, {
                rating: reviewData.rating,
                comment: reviewData.comment,
                privateFeedback: reviewData.privateFeedback || "" // Optional
                // DO NOT send reviewerRole - backend determines it automatically
            });

            if (response.data?.success) {
                toast.success('Review submitted successfully!');
                setShowReviewModal(false);
                setReviewData({ rating: 5, comment: '', privateFeedback: '' });
                fetchOrderDetails(); // Refresh to update order status
            }
        } catch (error) {
            console.error('Review submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return '—';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        try {
            return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
        } catch {
            return '—';
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            paid: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            refunded: { label: 'Refunded', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    const getOrderStatusBadge = (status) => {
        const config = {
            confirmed: { label: 'Running', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            completed: { label: 'Completed', bg: 'bg-blue-100', text: 'text-blue-700', icon: Package }
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    const getDeliveryStatusBadge = (status) => {
        const config = {
            pending: { label: 'Not Delivered', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            delivered: { label: 'Delivered', bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
            completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle }
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [messages, activeTab]);

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <BuyerSidebar />
                <div className="w-full relative">
                    <BuyerHeader />
                    <BuyerContainer>
                        <div className="flex justify-center items-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    </BuyerContainer>
                </div>
            </section>
        );
    }

    if (!order) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <BuyerSidebar />
                <div className="w-full relative">
                    <BuyerHeader />
                    <BuyerContainer>
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
                            <button
                                onClick={() => navigate('/buyer/orders')}
                                className="mt-4 text-primary hover:underline"
                            >
                                Back to Orders
                            </button>
                        </div>
                    </BuyerContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <BuyerSidebar />
            <div className="w-full relative">
                <BuyerHeader />
                <BuyerContainer>
                    <div className="mt-20 md:mt-5">
                        {/* Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate('/buyer/orders')}
                                className="text-primary hover:underline mb-2 inline-block"
                            >
                                ← Back to Orders
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                            <p className="text-gray-500 text-sm mt-1">Order ID: {order.orderId}</p>
                        </div>

                        {/* Two Column Layout */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left Column - Chat (2/3) */}
                            <div className="lg:w-2/3">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-180px)] flex flex-col">
                                    <ChatTabs activeTab={activeTab} onTabChange={setActiveTab}>
                                        {activeTab === 'chat' && (
                                            <div className="flex flex-col h-full">
                                                {/* Chat Header */}
                                                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={order.mentorId?.profileImage || dummyUserImg}
                                                            alt={order.mentorId?.firstName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {order.mentorId?.firstName} {order.mentorId?.lastName}
                                                            </h3>
                                                            <p className="text-xs text-gray-500">
                                                                {onlineUsers?.includes(order.mentorId?._id) ? 'Online' : 'Offline'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {order.serviceType}
                                                    </div>
                                                </div>

                                                {/* Messages Container */}
                                                <div
                                                    id="chat-messages-container"
                                                    className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50"
                                                >
                                                    {messageLoading ? (
                                                        <div className="flex justify-center py-10">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                        </div>
                                                    ) : messages.length === 0 ? (
                                                        <div className="text-center py-20">
                                                            <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                                                            <p className="text-gray-500">No messages yet</p>
                                                            <p className="text-sm text-gray-400">Start a conversation with your mentor</p>
                                                        </div>
                                                    ) : (
                                                        // Group messages by date
                                                        (() => {
                                                            const groupedMessages = messages.reduce((groups, message) => {
                                                                const date = format(new Date(message.createdAt), 'MMMM d, yyyy');
                                                                if (!groups[date]) {
                                                                    groups[date] = [];
                                                                }
                                                                groups[date].push(message);
                                                                return groups;
                                                            }, {});

                                                            return Object.entries(groupedMessages).map(([date, dateMessages]) => (
                                                                <div key={date} className="space-y-4">
                                                                    {/* Date Divider */}
                                                                    <div className="flex justify-center">
                                                                        <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                                                                            {date}
                                                                        </span>
                                                                    </div>

                                                                    {/* Messages for this date */}
                                                                    {dateMessages.map((msg, idx) => {
                                                                        const isSender = msg.sender?._id === user._id;
                                                                        const showAvatar = idx === 0 ||
                                                                            dateMessages[idx - 1].sender?._id !== msg.sender?._id;
                                                                        const isMessageSaved = savedMessages.has(msg._id);
                                                                        const isSaving = savingMessageId === msg._id;

                                                                        return (
                                                                            <div
                                                                                key={msg._id || idx}
                                                                                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                                                                            >
                                                                                <div className={`flex max-w-[70%] ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                                    {/* Avatar for non-own messages */}
                                                                                    {!isSender && showAvatar && (
                                                                                        <div className="flex-shrink-0 mr-2">
                                                                                            <img
                                                                                                src={msg.sender?.profileImage || dummyUserImg}
                                                                                                alt={msg.sender?.firstName}
                                                                                                className="w-8 h-8 rounded-full object-cover"
                                                                                            />
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Message Bubble */}
                                                                                    <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                                                                                        {/* Sender Name */}
                                                                                        {!isSender && showAvatar && (
                                                                                            <span className="text-xs text-gray-500 mb-1 ml-2">
                                                                                                {msg.sender?.firstName} {msg.sender?.lastName}
                                                                                            </span>
                                                                                        )}

                                                                                        <div
                                                                                            className={`rounded-2xl px-4 py-2 ${isSender
                                                                                                ? 'bg-primary text-white rounded-br-none'
                                                                                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                                                                                                }`}
                                                                                        >
                                                                                            {/* Attachments */}
                                                                                            {msg.attachments && msg.attachments.length > 0 && (
                                                                                                <div className="space-y-2 mb-2">
                                                                                                    {msg.attachments.map((attachment, i) => {
                                                                                                        if (attachment.fileType === 'image') {
                                                                                                            return (
                                                                                                                <div key={i} className="relative group">
                                                                                                                    <img
                                                                                                                        src={attachment.url}
                                                                                                                        alt={attachment.fileName}
                                                                                                                        className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                                                                        onClick={() => window.open(attachment.url, '_blank')}
                                                                                                                    />
                                                                                                                    <a
                                                                                                                        href={attachment.url}
                                                                                                                        download={attachment.fileName}
                                                                                                                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                                                    >
                                                                                                                        <Download size={16} />
                                                                                                                    </a>
                                                                                                                </div>
                                                                                                            );
                                                                                                        } else {
                                                                                                            return (
                                                                                                                <a
                                                                                                                    key={i}
                                                                                                                    href={attachment.url}
                                                                                                                    download={attachment.fileName}
                                                                                                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isSender
                                                                                                                        ? 'bg-white/20 hover:bg-white/30'
                                                                                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                                                                                        }`}
                                                                                                                >
                                                                                                                    <FileText size={24} className={isSender ? 'text-white' : 'text-primary'} />
                                                                                                                    <div className="flex-1 min-w-0">
                                                                                                                        <p className={`text-sm font-medium truncate ${isSender ? 'text-white' : 'text-gray-900'}`}>
                                                                                                                            {attachment.fileName}
                                                                                                                        </p>
                                                                                                                        <p className={`text-xs ${isSender ? 'text-white/60' : 'text-gray-500'}`}>
                                                                                                                            {(attachment.fileSize / 1024).toFixed(1)} KB
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                    <Download size={16} className={isSender ? 'text-white/60' : 'text-gray-500'} />
                                                                                                                </a>
                                                                                                            );
                                                                                                        }
                                                                                                    })}
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Message Text */}
                                                                                            {msg.content && (
                                                                                                <p className="whitespace-pre-wrap break-words">
                                                                                                    {msg.content}
                                                                                                </p>
                                                                                            )}
                                                                                        </div>

                                                                                        {/* Timestamp, Status, and Save Button */}
                                                                                        <div className={`flex items-center gap-2 mt-1 text-xs ${isSender ? 'justify-end' : 'justify-start'}`}>
                                                                                            <span className={isSender ? 'text-white/60' : 'text-gray-400'}>
                                                                                                {format(new Date(msg.createdAt), 'h:mm a')}
                                                                                            </span>
                                                                                            {isSender && msg.status === 'read' && (
                                                                                                <span className="text-blue-500 text-xs">✓✓</span>
                                                                                            )}
                                                                                            {isSender && msg.status === 'delivered' && (
                                                                                                <span className="text-gray-400 text-xs">✓✓</span>
                                                                                            )}
                                                                                            {isSender && msg.status === 'sent' && (
                                                                                                <span className="text-gray-400 text-xs">✓</span>
                                                                                            )}

                                                                                            {/* Save Button */}
                                                                                            <button
                                                                                                onClick={() => handleSaveMessage(msg._id, isMessageSaved)}
                                                                                                disabled={isSaving}
                                                                                                className="hover:opacity-70 transition-opacity p-1 rounded hover:bg-gray-200"
                                                                                                title={isMessageSaved ? "Unsave message" : "Save message"}
                                                                                            >
                                                                                                {isSaving ? (
                                                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                                                                                ) : isMessageSaved ? (
                                                                                                    <BookmarkCheck size={12} className="text-primary" />
                                                                                                ) : (
                                                                                                    <Bookmark size={12} className={isSender ? 'text-gray-900/60' : 'text-gray-900'} />
                                                                                                )}
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Empty div for spacing when no avatar on own messages */}
                                                                                    {isSender && <div className="w-8 ml-2" />}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ));
                                                        })()
                                                    )}
                                                    <div ref={messagesEndRef} />
                                                </div>

                                                {/* Message Input - Use the same component as Chat page */}
                                                <MessageInput
                                                    onSendMessage={handleSendMessage}
                                                    onTyping={handleTyping}
                                                />
                                            </div>
                                        )}

                                        {activeTab === 'meeting' && (
                                            <MeetingTab conversationId={conversation?._id} userType={user?.userType} />
                                        )}

                                        {activeTab === 'resources' && (
                                            <ResourcesTab conversationId={conversation?._id} />
                                        )}

                                        {activeTab === 'saved' && (
                                            <SavedTab conversationId={conversation?._id} currentUser={user} />
                                        )}
                                    </ChatTabs>
                                </div>
                            </div>

                            {/* Right Column - Order Info (1/3) */}
                            <div className="lg:w-1/3 space-y-4">
                                {!showResolution && !showOrderHistory ? (
                                    <>
                                        {/* Order Summary Card */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
                                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <Package size={18} />
                                                    Order Summary
                                                </h3>
                                            </div>

                                            <div className="p-4 space-y-4">
                                                {/* Booking Info */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Booking ID</p>
                                                        <p className="text-sm font-mono font-medium">{order.orderId?.slice(-12)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Booking Date</p>
                                                        <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                                                    </div>
                                                </div>

                                                {/* Mentor & Student */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <User size={18} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Mentor</p>
                                                            <p className="font-medium text-gray-900">
                                                                {order.mentorId?.firstName} {order.mentorId?.lastName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                            <User size={18} className="text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Student</p>
                                                            <p className="font-medium text-gray-900">
                                                                {order.studentId?.firstName} {order.studentId?.lastName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Plan Details */}
                                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Plan</span>
                                                        <span className="text-sm font-medium">{order.period} · {order.duration?.split('·')[0]}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Service</span>
                                                        <span className="text-sm font-medium">{order.serviceType}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t pt-2">
                                                        <span className="text-sm font-semibold text-gray-900">Amount</span>
                                                        {/* <span className="text-lg font-bold text-primary">
                                                            {formatCurrency(order.amount)} <span className="text-xs">(~${(order.amount / 81.5).toFixed(0)})</span>
                                                        </span> */}

                                                        <span className="text-lg font-bold text-primary">
                                                            {formatOrderPrice(order).formatted} {currency == 'USD' && <span className="text-xs">(~₹{(order.amount).toFixed(0)})</span>}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Status Badges */}
                                                <div className="flex flex-col gap-2">
                                                    <span className='text-sm text-gray-600 flex items-center gap-1'>Payment: {getStatusBadge(order.paymentStatus)}</span>
                                                    <span className='text-sm text-gray-600 flex items-center gap-1'>Order: {getOrderStatusBadge(order.orderStatus || 'pending')}</span>
                                                    <span className='text-sm text-gray-600 flex items-center gap-1'>Delivery: {getDeliveryStatusBadge(order.deliveryStatus || 'pending')}</span>
                                                </div>

                                                {/* Action Buttons & Reviews for Student */}
                                                <div className="space-y-2">
                                                    {/* Confirm & Complete Order (only when delivered but not completed) */}
                                                    {order.deliveryStatus === 'delivered' && order.orderStatus !== 'completed' && (
                                                        <button
                                                            onClick={handleCompleteOrder}
                                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                                        >
                                                            Confirm & Complete Order
                                                        </button>
                                                    )}

                                                    {/* Order Completed Section */}
                                                    {order.deliveryStatus === 'completed' && (
                                                        <>
                                                            {/* Show loading state if fetching reviews */}
                                                            {loadingReviews ? (
                                                                <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-center">
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {/* Student's own review (of the mentor) */}
                                                                    {!hasUserReviewed ? (
                                                                        <button
                                                                            onClick={() => setShowReviewModal(true)}
                                                                            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                                                                        >
                                                                            Leave a Review for Mentor
                                                                        </button>
                                                                    ) : studentReview ? (
                                                                        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <h4 className="font-medium text-gray-900">Your Review (for Mentor)</h4>
                                                                                <span className="text-xs text-gray-500">
                                                                                    {studentReview.createdAt ? format(new Date(studentReview.createdAt), 'MMM d, yyyy') : ''}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                                    <Star
                                                                                        key={star}
                                                                                        size={16}
                                                                                        className={star <= (studentReview.rating || 0)
                                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                                            : "text-gray-300"}
                                                                                    />
                                                                                ))}
                                                                                <span className="ml-2 text-sm text-gray-600">
                                                                                    {studentReview.rating}.0 / 5
                                                                                </span>
                                                                            </div>
                                                                            {studentReview.comment && (
                                                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                                                    {studentReview.comment}
                                                                                </p>
                                                                            )}
                                                                            <div className="text-xs text-green-600 flex items-center gap-1">
                                                                                <CheckCircle size={12} />
                                                                                Your review submitted
                                                                            </div>
                                                                        </div>
                                                                    ) : null}

                                                                    {/* Mentor's review (of the student) - visible to student */}
                                                                    {mentorReview ? (
                                                                        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <h4 className="font-medium text-gray-900">Mentor's Review (of you)</h4>
                                                                                <span className="text-xs text-gray-500">
                                                                                    {mentorReview.createdAt ? format(new Date(mentorReview.createdAt), 'MMM d, yyyy') : ''}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                                    <Star
                                                                                        key={star}
                                                                                        size={16}
                                                                                        className={star <= (mentorReview.rating || 0)
                                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                                            : "text-gray-300"}
                                                                                    />
                                                                                ))}
                                                                                <span className="ml-2 text-sm text-gray-600">
                                                                                    {mentorReview.rating}.0 / 5
                                                                                </span>
                                                                            </div>
                                                                            {mentorReview.comment && (
                                                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                                                    {mentorReview.comment}
                                                                                </p>
                                                                            )}
                                                                            <div className="text-xs text-blue-600 flex items-center gap-1">
                                                                                <ThumbsUp size={12} />
                                                                                Feedback from mentor
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                                                            <p className="text-sm text-gray-500">Mentor hasn't left a review yet.</p>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Order History Button */}
                                                    <button
                                                        onClick={() => setShowOrderHistory(true)}
                                                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
                                                    >
                                                        <Package size={16} />
                                                        Order History
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Need Help Card */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-2">Need help?</h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Having an issue with this order?
                                                </p>
                                                <button onClick={() => setShowResolution(true)} className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium">
                                                    Resolution Center
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : showResolution ? (
                                    <ResolutionPanel
                                        order={order}
                                        onBack={() => setShowResolution(false)}
                                    />
                                ) : showOrderHistory ? (
                                    <OrderHistoryPanel
                                        userId1={user._id}
                                        userId2={user.userType === 'buyer' ? order.mentorId._id : order.studentId._id}
                                        userType={user.userType}
                                        onBack={() => setShowOrderHistory(false)}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </BuyerContainer>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Leave a Review</h3>
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setReviewData({ rating: 5, comment: '', privateFeedback: '' });
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                size={24}
                                                className={star <= reviewData.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Review
                                </label>
                                <textarea
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    rows={4}
                                    placeholder="Share your experience with this mentor..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Private Feedback (Optional - only visible to admin)
                                </label>
                                <textarea
                                    value={reviewData.privateFeedback || ''}
                                    onChange={(e) => setReviewData({ ...reviewData, privateFeedback: e.target.value })}
                                    rows={2}
                                    placeholder="Any additional feedback for the platform admins..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div> */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowReviewModal(false);
                                        setReviewData({ rating: 5, comment: '', privateFeedback: '' });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default OrderDetails;