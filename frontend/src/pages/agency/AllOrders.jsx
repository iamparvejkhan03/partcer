import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Download,
    Eye,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Calendar,
    DollarSign,
    User,
    FileText,
    ShoppingBag,
    MessageCircle,
    Star,
    RefreshCw,
    HelpCircle,
    Download as ExportIcon,
    Package,
    Truck,
    RotateCcw,
    ThumbsUp,
    LineChart,
    CheckSquare,
    Hourglass,
    Paperclip,
    Loader,
    ChevronRight as ChevronRightIcon,
    TrendingUp,
    Award,
    Info
} from "lucide-react";
import { AgencySidebar, AgencyHeader, AgencyContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderReviews, setOrderReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
        delivered: 0,
        totalSpent: 0
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    const navigate = useNavigate();
    const { user } = useAuth();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [isCancelLoading, setIsCancelLoading] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelReasonOther, setCancelReasonOther] = useState('');

    // Fetch orders on mount
    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders locally when filters change
    useEffect(() => {
        if (allOrders.length === 0) return;

        let filtered = [...allOrders];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Date range filter
        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            filtered = filtered.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= cutoffDate;
            });
        }

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.orderId?.toLowerCase().includes(term) ||
                order.seller?.name?.toLowerCase().includes(term) ||
                order.details?.title?.toLowerCase().includes(term)
            );
        }

        setOrders(filtered);
        setCurrentPage(1);
        calculateStats(filtered);
        setPagination(prev => ({
            ...prev,
            page: 1,
            total: filtered.length,
            pages: Math.ceil(filtered.length / itemsPerPage)
        }));

    }, [statusFilter, dateRange, searchTerm, allOrders, itemsPerPage]);

    // Handle click outside for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.relative')) {
                setSelectedOrderId(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get('/api/v1/orders?role=buyer');

            if (response.data?.success) {
                const { orders: fetchedOrders } = response.data.data;

                const enhancedOrders = fetchedOrders.map(order => ({
                    ...order,
                    seller: {
                        ...order.seller,
                        name: order.seller?.displayName || `${order.seller?.firstName || ''} ${order.seller?.lastName || ''}`.trim(),
                        avatar: order.seller?.profileImage || 'https://via.placeholder.com/40',
                        email: order.seller?.email,
                        location: order.seller?.country || 'Remote',
                        isVerified: order.seller?.isVerified || false,
                        responseTime: order.seller?.responseTime || '< 1 hour',
                        completedOrders: order.seller?.completedOrders || 0
                    },
                    service: {
                        id: order.service?._id,
                        title: order.details?.title || 'Service',
                        category: order.service?.category?.name || order.details?.category?.name || 'Category',
                        subcategory: order.service?.subCategory?.name || order.details?.subCategory?.name || '',
                        image: order.service?.gallery?.find(img => img.isMain)?.url ||
                            order.service?.gallery?.[0]?.url ||
                            'https://via.placeholder.com/80x60',
                        package: order.details?.package?.name || 'Standard',
                        features: order.details?.package?.features || []
                    },
                    total: order.pricing?.total || 0,
                    status: order.status,
                    paymentStatus: order.payment?.status || 'pending',
                    paymentMethod: order.payment?.method || null,
                    orderType: order.orderType,
                    expectedDelivery: order.timeline?.deadline,
                    actualDelivery: order.timeline?.deliveredAt,
                    requirements: order.details?.requirements || '',
                    hasReview: order.review ? true : false,
                    rating: order.review?.rating || 0,
                    review: order.review?.comment || '',
                    revisions: order.delivery?.revisions?.used || 0,
                    messages: order.recentMessages?.length || 0,
                    files: order.delivery?.current?.attachments || order.delivery?.history?.flatMap(d => d.attachments) || [],
                    cancellationReason: order.timeline?.cancelledAt ? 'Order cancelled' : null
                }));

                setAllOrders(enhancedOrders);
                setOrders(enhancedOrders);
                calculateStats(enhancedOrders);
                setPagination({
                    page: 1,
                    limit: itemsPerPage,
                    total: enhancedOrders.length,
                    pages: Math.ceil(enhancedOrders.length / itemsPerPage)
                });
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderReviews = async (orderId) => {
        try {
            setLoadingReviews(true);
            const response = await axiosInstance.get(`/api/v1/reviews/order/${orderId}`);

            if (response.data?.success) {
                setOrderReviews(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setOrderReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleCancelOrderWithModal = async () => {
        const effectiveCancelReason = cancelReason === 'Other' ? cancelReasonOther : cancelReason;

        if (!effectiveCancelReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            setIsCancelLoading(true);
            const response = await axiosInstance.post(`/api/v1/orders/${cancellingOrderId}/cancel`, {
                reason: effectiveCancelReason
            });

            if (response.data?.success) {
                toast.success('Order cancelled successfully');
                setShowCancelModal(false);
                setCancelReason('');
                setCancelReasonOther('');
                setCancellingOrderId(null);
                fetchOrders();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setIsCancelLoading(false);
        }
    };

    const calculateStats = (ordersData) => {
        const stats = {
            total: ordersData.length,
            active: ordersData.filter(o => o.status === 'active').length,
            delivered: ordersData.filter(o => o.status === 'delivered').length,
            completed: ordersData.filter(o => o.status === 'completed').length,
            cancelled: ordersData.filter(o => o.status === 'cancelled').length,
            pending: ordersData.filter(o => o.status === 'pending').length,
            totalSpent: ordersData
                .filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'completed')
                .reduce((sum, o) => sum + (o.total || 0), 0)
        };
        setStats(stats);
    };

    const statusConfig = {
        pending: {
            label: 'Pending',
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            icon: AlertCircle,
            description: 'Awaiting seller confirmation'
        },
        active: {
            label: 'In Progress',
            bg: 'bg-green-100',
            text: 'text-green-700',
            icon: Clock,
            description: 'Mentor is working on your order'
        },
        delivered: {
            label: 'Delivered',
            bg: 'bg-purple-100',
            text: 'text-purple-700',
            icon: Package,
            description: 'Order has been delivered, pending your review'
        },
        completed: {
            label: 'Completed',
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            icon: CheckCircle,
            description: 'Order successfully completed'
        },
        cancelled: {
            label: 'Cancelled',
            bg: 'bg-red-100',
            text: 'text-red-700',
            icon: XCircle,
            description: 'Order was cancelled'
        },
        disputed: {
            label: 'Disputed',
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            icon: AlertCircle,
            description: 'Order has a dispute'
        },
        refunded: {
            label: 'Refunded',
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            icon: DollarSign,
            description: 'Order was refunded'
        }
    };

    const paymentStatusConfig = {
        pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        processing: { label: 'Processing', bg: 'bg-blue-100', text: 'text-blue-700' },
        paid: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700' },
        held: { label: 'Held', bg: 'bg-orange-100', text: 'text-orange-700' },
        refunded: { label: 'Refunded', bg: 'bg-gray-100', text: 'text-gray-700' },
        failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700' }
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus) => {
        const config = paymentStatusConfig[paymentStatus] || paymentStatusConfig.pending;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    const handleViewOrder = async (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
        await fetchOrderReviews(order._id);
    };

    const handleDeliveredConfirm = async (orderId) => {
        try {
            const response = await axiosInstance.post(`/api/v1/orders/${orderId}/approve`);

            if (response.data?.success) {
                toast.success('Order marked as completed! Don\'t forget to leave a review.');
                fetchOrders();
                setShowOrderDetails(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm order');
        }
    };

    const handleRequestModification = async (orderId) => {
        try {
            // This would open a revision modal
            navigate(`/agency/orders/${orderId}`);
        } catch (error) {
            toast.error('Failed to send request');
        }
    };

    const handleSubmitReview = async () => {
        if (!reviewData.comment.trim()) {
            toast.error('Please write a review comment');
            return;
        }

        try {
            const response = await axiosInstance.post(`/api/v1/reviews/order/${selectedOrder._id}`, {
                rating: reviewData.rating,
                comment: reviewData.comment,
                reviewerRole: 'buyer'
            });

            if (response.data?.success) {
                toast.success('Review submitted successfully!');
                setShowReviewModal(false);
                setReviewData({ rating: 5, comment: '' });
                fetchOrders();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                const response = await axiosInstance.post(`/api/v1/orders/${orderId}/cancel`, {
                    reason: 'Cancelled by student'
                });

                if (response.data?.success) {
                    toast.success('Order cancelled successfully');
                    fetchOrders();
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to cancel order');
            }
        }
    };

    const handleRefresh = () => {
        fetchOrders();
        toast.success('Orders refreshed');
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getDeliveryStatus = (expectedDelivery, actualDelivery) => {
        if (!expectedDelivery || !actualDelivery) return null;

        const expected = new Date(expectedDelivery);
        const actual = new Date(actualDelivery);

        if (actual < expected) {
            return { text: 'Early', color: 'text-green-600', icon: ThumbsUp };
        } else if (actual > expected) {
            return { text: 'Late', color: 'text-red-600', icon: AlertCircle };
        } else {
            return { text: 'On Time', color: 'text-blue-600', icon: CheckCircle };
        }
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AgencySidebar />
                <div className="w-full relative">
                    <AgencyHeader />
                    <AgencyContainer>
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-12 h-12 animate-spin text-primary" />
                        </div>
                    </AgencyContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AgencySidebar />
            <div className="w-full relative">
                <AgencyHeader />
                <AgencyContainer>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-gray-600 mt-1">Track and manage all your purchases</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </button>
                            <Link
                                to="/services"
                                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                            >
                                <ShoppingBag size={18} />
                                Browse Services
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ShoppingBag size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <LineChart size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">In Progress</p>
                                    <p className="text-2xl text-green-600 font-bold">{stats.active}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Package size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Delivered</p>
                                    <p className="text-2xl text-purple-600 font-bold">{stats.delivered}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CheckSquare size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-2xl text-blue-600 font-bold">{stats.completed}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                    <DollarSign size={20} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Spent</p>
                                    <p className="text-2xl text-teal-600 font-bold">{formatCurrency(stats.totalSpent)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by order ID, seller, service..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[140px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="active">In Progress</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[140px]"
                                >
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="365">Last year</option>
                                    <option value="all">All time</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table - Mobile Friendly */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        {/* Mobile View */}
                        <div className="block md:hidden">
                            {currentOrders.length > 0 ? (
                                currentOrders.map((order) => (
                                    <div key={order._id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-medium text-gray-900 line-clamp-2">{order.service?.title}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{order.orderId}</p>
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <img
                                                src={order.seller?.avatar}
                                                alt={order.seller?.name}
                                                className="w-6 h-6 rounded-full object-cover"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/24'; }}
                                            />
                                            <span className="text-sm text-gray-600">{order.seller?.name}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="ml-1 font-medium">{formatCurrency(order.total)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Delivery:</span>
                                                <span className="ml-1">{formatDate(order.expectedDelivery)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <Link
                                                    to={`/agency/chat?user=${order?.seller?._id}`}
                                                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg relative"
                                                >
                                                    <MessageCircle size={18} />
                                                    {order.messages > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                            {order.messages}
                                                        </span>
                                                    )}
                                                </Link>
                                            </div>
                                            {order.status === 'delivered' && !order.hasReview && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowReviewModal(true);
                                                    }}
                                                    className="text-xs bg-primary text-white px-3 py-1 rounded-lg"
                                                >
                                                    Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No orders found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'You haven\'t placed any orders yet'}
                                    </p>
                                    {!searchTerm && statusFilter === 'all' && (
                                        <Link
                                            to="/services"
                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                        >
                                            Browse Services
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order</th> */}
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentOrders.length > 0 ? (
                                        currentOrders.map((order) => {
                                            const deliveryStatus = getDeliveryStatus(order.expectedDelivery, order.actualDelivery);

                                            return (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    {/* <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                                                        <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                                                    </td> */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={order.seller?.avatar}
                                                                alt={order.seller?.name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/32'; }}
                                                            />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                                                    <Link to={`/freelancer/${order.seller._id}`}>{order.seller?.name}</Link>
                                                                    {order.seller?.isVerified && (
                                                                        <CheckCircle size={12} className="text-blue-500" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs">
                                                        <div className="text-sm text-gray-900 line-clamp-2"><Link to={`/service/${order.service.id}`}>{order.service?.title}</Link></div>
                                                        <div className="text-xs text-gray-500 mt-1">{order.service?.package}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{formatCurrency(order.total)}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{getPaymentBadge(order.paymentStatus)}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{formatDate(order.expectedDelivery)}</div>
                                                        {order.actualDelivery && (
                                                            <div className={`text-xs flex items-center gap-1 mt-1 ${deliveryStatus?.color}`}>
                                                                {deliveryStatus?.icon && <deliveryStatus.icon size={12} />}
                                                                <span>Delivered: {formatDate(order.actualDelivery)}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(order.status)}
                                                        {order.revisions > 0 && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {order.revisions} revision{order.revisions > 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setSelectedOrderId(order._id === selectedOrderId ? null : order._id)}
                                                                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Actions"
                                                            >
                                                                <MoreVertical size={18} />
                                                            </button>

                                                            {/* Dropdown Menu */}
                                                            {selectedOrderId === order._id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                                                    <button
                                                                        onClick={() => {
                                                                            handleViewOrder(order);
                                                                            setSelectedOrderId(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                                    >
                                                                        <Info size={16} />
                                                                        View Details
                                                                    </button>

                                                                    <Link
                                                                        to={`/agency/orders/${order._id}`}
                                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                                    >
                                                                        <Eye size={16} />
                                                                        View Order
                                                                    </Link>

                                                                    {order.status === 'delivered' && !order.hasReview && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedOrder(order);
                                                                                setShowReviewModal(true);
                                                                                setSelectedOrderId(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                                        >
                                                                            <Star size={16} />
                                                                            Leave Review
                                                                        </button>
                                                                    )}

                                                                    {order.status === 'active' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                handleRequestModification(order._id);
                                                                                setSelectedOrderId(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                                        >
                                                                            <RotateCcw size={16} />
                                                                            Request Changes
                                                                        </button>
                                                                    )}

                                                                    {order.status === 'pending' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setCancellingOrderId(order._id);
                                                                                setShowCancelModal(true);
                                                                                setSelectedOrderId(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                        >
                                                                            <XCircle size={16} />
                                                                            Cancel Order
                                                                        </button>
                                                                    )}

                                                                    {order.files && order.files.length > 0 && (
                                                                        <button
                                                                            onClick={() => {
                                                                                // Handle download all files
                                                                                setSelectedOrderId(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                                        >
                                                                            <Download size={16} />
                                                                            Download Files
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <ShoppingBag size={40} className="text-gray-300 mb-3" />
                                                    <p className="text-gray-500 font-medium">No orders found</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm || statusFilter !== 'all'
                                                            ? 'Try adjusting your filters'
                                                            : 'You haven\'t placed any orders yet'}
                                                    </p>
                                                    {!searchTerm && statusFilter === 'all' && (
                                                        <Link
                                                            to="/services"
                                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                        >
                                                            Browse Services
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {orders.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, orders.length)} of {orders.length} orders
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-8 h-8 rounded-lg ${currentPage === pageNum
                                                    ? 'bg-primary text-white'
                                                    : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <>
                                            <span>...</span>
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                className="w-8 h-8 rounded-lg hover:bg-gray-100"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </AgencyContainer>
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                <p className="text-sm text-gray-500">{selectedOrder.orderId}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowOrderDetails(false);
                                    setSelectedOrder(null);
                                    setOrderReviews([]);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status and Delivery */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex flex-col items-start gap-2">
                                    <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
                                        Order Status:
                                        <span>{getStatusBadge(selectedOrder.status)}</span>
                                    </div>
                                    <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
                                        Payment Status:
                                        <span>{getPaymentBadge(selectedOrder.paymentStatus)}</span>
                                    </div>
                                </div>
                                {selectedOrder.status === 'delivered' && (
                                    <button
                                        onClick={() => handleDeliveredConfirm(selectedOrder._id)}
                                        className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Confirm Delivery
                                    </button>
                                )}
                            </div>

                            {/* Seller Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <User size={16} />
                                    Mentor Information
                                </h4>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={selectedOrder.seller?.avatar}
                                        alt={selectedOrder.seller?.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium flex items-center gap-1">
                                            {selectedOrder.seller?.name}
                                            {selectedOrder.seller?.isVerified && (
                                                <CheckCircle size={14} className="text-blue-500" />
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600">{selectedOrder.seller?.location}</p>
                                        {/* <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Response Time</span>
                                                <p className="font-medium">{selectedOrder.seller?.responseTime}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Completed Orders</span>
                                                {console.log(selectedOrder.seller)}
                                                <p className="font-medium">{selectedOrder.seller?.completedOrders}+</p>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <ShoppingBag size={16} />
                                    Service Details
                                </h4>
                                <div className="flex gap-3">
                                    <img
                                        src={selectedOrder.service?.image}
                                        alt={selectedOrder.service?.title}
                                        className="w-16 h-16 rounded object-cover"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/64'; }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{selectedOrder.service?.title}</p>
                                        <p className="text-sm text-gray-600">{selectedOrder.service?.category} • {selectedOrder.service?.package}</p>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {selectedOrder.service?.features?.map((feature, idx) => (
                                                <span key={idx} className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements */}
                            {selectedOrder.requirements && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <FileText size={16} />
                                        Your Requirements
                                    </h4>
                                    <p className="text-gray-700 whitespace-pre-line">{selectedOrder.requirements}</p>
                                </div>
                            )}

                            {/* Delivery Timeline */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Truck size={16} />
                                    Delivery Timeline
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Order Placed</span>
                                        <span className="font-medium">{formatDateTime(selectedOrder.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Expected Delivery</span>
                                        <span className="font-medium">{formatDateTime(selectedOrder.expectedDelivery)}</span>
                                    </div>
                                    {selectedOrder.actualDelivery && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Actual Delivery</span>
                                            <span className="font-medium text-green-600">{formatDateTime(selectedOrder.actualDelivery)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Delivered Files */}
                            {selectedOrder.files && selectedOrder.files.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Package size={16} />
                                        Delivered Files
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedOrder.files.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                                                <div className="flex items-center gap-2">
                                                    {file.type?.startsWith('image/') ? (
                                                        <img src={file.url} alt={file.name} className="w-8 h-8 object-cover rounded" />
                                                    ) : (
                                                        <FileText size={16} className="text-gray-400" />
                                                    )}
                                                    <span className="text-sm">{file.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        ({((file.size || 0) / 1024 / 1024).toFixed(1)} MB)
                                                    </span>
                                                </div>
                                                <a
                                                    href={file.url}
                                                    download
                                                    className="p-1 text-primary hover:bg-primary/10 rounded"
                                                >
                                                    <Download size={16} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <DollarSign size={16} />
                                    Payment Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Amount</span>
                                        <span className="font-bold">{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Payment Status</span>
                                        <span>{getPaymentBadge(selectedOrder.paymentStatus)}</span>
                                    </div>
                                    {selectedOrder.paymentMethod && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Payment Method</span>
                                            <span className="font-medium capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            {orderReviews.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Star size={16} className="fill-yellow-400" />
                                        Reviews
                                    </h4>
                                    <div className="space-y-4">
                                        {orderReviews.map((review) => (
                                            <div key={review._id} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                                                <div className="flex items-start gap-3 mb-2">
                                                    <img
                                                        src={review.reviewer?.profileImage || 'https://via.placeholder.com/32'}
                                                        alt={review.reviewer?.displayName}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium text-sm">
                                                                {review.reviewer?.displayName || `${review.reviewer?.firstName} ${review.reviewer?.lastName}`}
                                                            </p>
                                                            <div className="flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        size={12}
                                                                        className={star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {review.reviewerRole === 'buyer' ? 'Student' : review.reviewerRole === 'agency' ? 'Agency' : 'Mentor'} • {formatDateTime(review.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Review Section - User's own review */}
                            {selectedOrder.hasReview && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Star size={16} className="fill-yellow-400" />
                                        Your Review
                                    </h4>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    className={star <= (selectedOrder.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 italic">"{selectedOrder.review}"</p>
                                </div>
                            )}

                            {/* Cancellation Reason */}
                            {selectedOrder.status === 'cancelled' && selectedOrder.cancellationReason && (
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <strong>Cancellation Reason:</strong> {selectedOrder.cancellationReason}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Link
                                    to={`/agency/chat?user=${selectedOrder?.seller?._id}`}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                                >
                                    Message Mentor
                                </Link>
                                <Link
                                    to={`/agency/orders/${selectedOrder._id}`}
                                    target="_blank"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                                >
                                    View Order
                                </Link>
                                {selectedOrder.status === 'active' && (
                                    <Link
                                        to={`/agency/orders/${selectedOrder._id}`}
                                        className="flex-1 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-center"
                                    >
                                        Request Changes
                                    </Link>
                                )}
                                {selectedOrder.status === 'delivered' && !selectedOrder.hasReview && (
                                    <button
                                        onClick={() => {
                                            setShowReviewModal(true);
                                            setShowOrderDetails(false);
                                        }}
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    >
                                        Leave a Review
                                    </button>
                                )}
                                {selectedOrder?.status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            setCancellingOrderId(selectedOrder._id);
                                            setShowCancelModal(true);
                                            setShowOrderDetails(false);
                                        }}
                                        className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Leave a Review</h3>
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setReviewData({ rating: 5, comment: '' });
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
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowReviewModal(false);
                                        setReviewData({ rating: 5, comment: '' });
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

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setCancelReasonOther('');
                                    setCancellingOrderId(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for cancellation *
                            </label>
                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
                            >
                                <option value="">Select a reason</option>
                                <option value="Changed my mind">Changed my mind</option>
                                <option value="Found better option">Found better option</option>
                                <option value="Mentor unresponsive">Mentor unresponsive</option>
                                <option value="Order taking too long">Order taking too long</option>
                                <option value="Incorrect service ordered">Incorrect service ordered</option>
                                <option value="Other">Other</option>
                            </select>

                            {cancelReason === 'Other' && (
                                <textarea
                                    value={cancelReasonOther}
                                    onChange={(e) => setCancelReasonOther(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Please provide details..."
                                />
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                    setCancellingOrder(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleCancelOrderWithModal}
                                disabled={
                                    !cancelReason.trim() ||
                                    (cancelReason === 'Other' && !cancelReasonOther.trim()) ||
                                    isCancelLoading
                                }
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCancelLoading ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AllOrders;