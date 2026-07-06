import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
    Search,
    ShoppingBag,
    Eye,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    Calendar,
    User,
    Loader,
    Star,
    MessageCircle,
    CreditCard,
    Package,
    Info
} from "lucide-react";
import { AgencySidebar, AgencyHeader, AgencyContainer, ProgressBar } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { useCurrency } from '../../hooks/useCurrency';
import { formatOrderPrice } from '../../utils/currencyHelpers';

const NewAllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        failed: 0,
        totalSpent: 0
    });

    const { user } = useAuth();
    const navigate = useNavigate();
    const { convertPrice, getCurrencySymbol, rates, currency } = useCurrency();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get(`/api/v1/payments/user/${user?._id}`);

            if (response.data?.success) {
                const fetchedOrders = response.data.data.orders || [];
                setOrders(fetchedOrders);
                calculateStats(fetchedOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (ordersData) => {
        const stats = {
            total: ordersData.length,
            paid: ordersData.filter(o => o.paymentStatus === 'paid').length,
            pending: ordersData.filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'created').length,
            failed: ordersData.filter(o => o.paymentStatus === 'failed').length,
            totalSpent: ordersData
                .filter(o => o.paymentStatus === 'paid')
                .reduce((sum, o) => sum + (o.amount || 0), 0)
        };
        setStats(stats);
    };

    const handleMessage = (order) => {
        navigate(`/agency/chat?user=${order?.mentorId?._id}`);
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        // Status filter
        if (statusFilter !== 'all' && order.paymentStatus !== statusFilter) {
            return false;
        }

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            const mentorName = `${order.mentorId?.firstName || ''} ${order.mentorId?.lastName || ''}`.toLowerCase();
            return (
                order.orderId?.toLowerCase().includes(term) ||
                mentorName.includes(term) ||
                order.serviceType?.toLowerCase().includes(term)
            );
        }

        return true;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRefresh = () => {
        fetchOrders();
        toast.success('Orders refreshed');
    };

    const handleCompleteOrder = async (orderId) => {
        try {
            const response = await axiosInstance.post(`/api/v1/payments/orders/${orderId}/complete`);

            if (response.data?.success) {
                toast.success('Order marked as completed!');
                fetchOrders();
                setShowOrderDetails(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete order');
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

    const getPaymentStatusBadge = (status) => {
        const config = {
            paid: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            created: { label: 'Initiated', bg: 'bg-blue-100', text: 'text-blue-700', icon: CreditCard },
            failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            refunded: { label: 'Refunded', bg: 'bg-gray-100', text: 'text-gray-700', icon: RefreshCw }
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

    const deliveryStatusConfig = {
        pending: { label: 'Not Delivered', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
        delivered: { label: 'Delivered', bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
        completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle }
    };

    const getDeliveryStatusBadge = (status) => {
        const config = deliveryStatusConfig[status] || deliveryStatusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
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
                            <p className="text-gray-600 mt-1">Track and manage your bookings</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </button>
                            {/* <Link
                                to="/services"
                                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                            >
                                <ShoppingBag size={18} />
                                Browse Services
                            </Link> */}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                                    <CheckCircle size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Paid Orders</p>
                                    <p className="text-2xl text-green-600 font-bold">{stats.paid}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock size={20} className="text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-2xl text-yellow-600 font-bold">{stats.pending}</p>
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
                                    <p className="text-2xl text-teal-600 font-bold">{getCurrencySymbol()}{convertPrice(stats.totalSpent)}</p>
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
                                    placeholder="Search by order ID, mentor name, service..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            {/* <div className="flex flex-wrap gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[140px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div> */}
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        {/* Mobile View */}
                        <div className="block md:hidden">
                            {currentOrders.length > 0 ? (
                                currentOrders.map((order) => (
                                    <div key={order._id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{order.serviceType}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{order.orderId}</p>
                                            </div>
                                            {getPaymentStatusBadge(order.paymentStatus)}
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <img
                                                src={order.mentorId?.profileImage || 'https://via.placeholder.com/32'}
                                                alt={order.mentorId?.firstName}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                            <span className="text-sm text-gray-600">
                                                {order.mentorId?.firstName} {order.mentorId?.lastName}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">Amount:</span>
                                                {/* <span className="ml-1 font-medium">{formatCurrency(order.amount)}</span> */}
                                                <span className="ml-1 font-medium">{formatOrderPrice(order).formatted}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Date:</span>
                                                <span className="ml-1">{formatDate(order.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="relative flex items-center max-w-full w-full bg-gray-500/80 h-4 rounded-md">
                                            <div className="bg-green-600 h-4 rounded-md" style={{ width: `${Math.ceil((order?.sessionStats?.approved / order?.sessionStats?.total) * 100)}%` }} />
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-normal text-white">
                                                {order.sessionStats?.approved} / {order.sessionStats?.total}
                                            </span>
                                        </div>
                                        <span className="mt-1 flex items-center justify-center text-xs font-normal">
                                            {order.sessionStats?.approved} of {order.sessionStats?.total} session completed
                                        </span>
                                        </div>

                                        {/* <button
                                            onClick={() => handleViewOrder(order)}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-primary border border-primary/20 rounded-lg hover:bg-primary/5"
                                        >
                                            <Eye size={16} />
                                            View Details
                                        </button> */}

                                        <button
                                                onClick={() => handleMessage(order)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full"
                                            >
                                                <MessageCircle size={16} />
                                                Message
                                            </button>
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
                                </div>
                            )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
                                        {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Service</th> */}
                                        {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Period</th> */}
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                        {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th> */}
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                        {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th> */}
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentOrders.length > 0 ? (
                                        currentOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={order.mentorId?.profileImage || 'https://via.placeholder.com/32'}
                                                            alt={order.mentorId?.firstName}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {order.mentorId?.firstName} {order.mentorId?.lastName}
                                                            </div>
                                                            <Link
                                                                to={`/freelancer/${order.mentorId?._id}`}
                                                                className="text-xs text-primary hover:underline"
                                                            >
                                                                View Profile
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{order.serviceType}</div>
                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{order.duration}</div>
                                                </td> */}
                                                {/* <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{order.period}</div>
                                                </td> */}
                                                <td className="px-6 py-4">
                                                    {/* <div className="font-bold text-gray-900">{formatCurrency(order.amount)}</div> */}
                                                    <div className="font-normal  text-sm text-gray-900">{formatOrderPrice(order).formatted}</div>
                                                    {/* <div className="text-xs text-gray-500">Mentor: {formatOrderPrice(order).formatted}</div> */}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getPaymentStatusBadge(order.paymentStatus)}
                                                    {/* {order.paymentCompletedAt && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {formatDate(order.paymentCompletedAt)}
                                                        </div>
                                                    )} */}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="relative flex items-center max-w-full w-full bg-gray-500/80 h-4 rounded-md">
                                                        <div className="bg-green-600 h-4 rounded-md" style={{ width: `${Math.ceil((order?.sessionStats?.approved / order?.sessionStats?.total) * 100)}%` }} />
                                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-normal text-white">
                                                            {order.sessionStats?.approved} / {order.sessionStats?.total}
                                                        </span>
                                                    </div>
                                                    <span className="mt-1 flex items-center justify-center text-xs font-normal">
                                                        {order.sessionStats?.approved} of {order.sessionStats?.total} session completed
                                                    </span>
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    {order.deliveryStatus === 'delivered' ? (
                                                        <div className="space-y-1">
                                                            {getDeliveryStatusBadge(order.deliveryStatus)}
                                                            <button
                                                                onClick={() => {
                                                                    handleCompleteOrder(order._id);
                                                                }}
                                                                className="mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded block"
                                                            >
                                                                Complete Order
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        getDeliveryStatusBadge(order.deliveryStatus || 'pending')
                                                    )}
                                                </td> */}
                                                <td className="px-6 py-4">
                                                    {getOrderStatusBadge(order.orderStatus || 'pending')}
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                                                </td> */}
                                                <td className="px-6 py-4">
                                                    {/* <button
                                                        onClick={() => navigate(`/agency/orders/${order._id}`)}
                                                        className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button> */}

                                                    <button
                                                        onClick={() => handleViewOrder(order)}
                                                        className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Info size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <ShoppingBag size={40} className="text-gray-300 mb-3" />
                                                    <p className="text-gray-500 font-medium">No orders found</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm || statusFilter !== 'all'
                                                            ? 'Try adjusting your filters'
                                                            : 'You haven\'t placed any orders yet'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredOrders.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
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
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                <p className="text-sm text-gray-500 font-mono">{selectedOrder.orderId}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowOrderDetails(false);
                                    setSelectedOrder(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div className="flex flex-wrap justify-between items-center gap-4">
                                <div className="flex gap-2">
                                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                                    {getOrderStatusBadge(selectedOrder.orderStatus)}
                                </div>
                                {selectedOrder.paymentCompletedAt && (
                                    <div className="text-sm text-gray-500">
                                        Paid on {formatDateTime(selectedOrder.paymentCompletedAt)}
                                    </div>
                                )}
                            </div>

                            {/* Mentor Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <User size={16} />
                                    Mentor Information
                                </h4>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={selectedOrder.mentorId?.profileImage || 'https://via.placeholder.com/48'}
                                        alt={selectedOrder.mentorId?.firstName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {selectedOrder.mentorId?.firstName} {selectedOrder.mentorId?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">{selectedOrder.mentorId?.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Link
                                                to={`/freelancer/${selectedOrder.mentorId?._id}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                View Profile
                                            </Link>
                                            <Link
                                                to={`/agency/orders/${selectedOrder?._id}`}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Send Message
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Package size={16} />
                                    Service Details
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service Type:</span>
                                        <span className="font-medium">{selectedOrder.serviceType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Period:</span>
                                        <span className="font-medium">{selectedOrder.period}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{selectedOrder.duration}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Breakdown */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <DollarSign size={16} />
                                    Payment Breakdown
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mentor Fee:</span>
                                        <span className="font-medium">{getCurrencySymbol()}{convertPrice(selectedOrder.mentorFee)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Partcer Fee:</span>
                                        <span className="font-medium">{getCurrencySymbol()}{convertPrice(selectedOrder.partnerFee)}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-900">Total Paid:</span>
                                            <span className="font-bold text-primary text-lg">{getCurrencySymbol()}{convertPrice(selectedOrder.amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <CreditCard size={16} />
                                    Payment Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Razorpay Order ID:</span>
                                        <span className="font-mono text-sm">{selectedOrder.razorpayOrderId}</span>
                                    </div>
                                    {selectedOrder.razorpayPaymentId && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Razorpay Payment ID:</span>
                                            <span className="font-mono text-sm">{selectedOrder.razorpayPaymentId}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order Date:</span>
                                        <span>{formatDateTime(selectedOrder.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Existing Review - Show if student already reviewed */}
                            {selectedOrder.studentReviewed && selectedOrder.studentReview && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Star size={16} className="" />
                                        Your Review
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    className={star <= selectedOrder.studentReview.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                    }
                                                />
                                            ))}
                                            <span className="ml-2 text-sm text-gray-600">
                                                {formatDate(selectedOrder.studentReview.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm">
                                            {selectedOrder.studentReview.comment}
                                        </p>
                                        {selectedOrder.studentReview.privateFeedback && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">Private feedback:</span> {selectedOrder.studentReview.privateFeedback}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Existing Review - Show if mentor already reviewed */}
                            {selectedOrder.mentorReviewed && selectedOrder.mentorReview && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Star size={16} className="" />
                                        Mentor Review
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    className={star <= selectedOrder.mentorReview.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                    }
                                                />
                                            ))}
                                            <span className="ml-2 text-sm text-gray-600">
                                                {formatDate(selectedOrder.mentorReview.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm">
                                            {selectedOrder.mentorReview.comment}
                                        </p>
                                        {selectedOrder.mentorReview.privateFeedback && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">Private feedback:</span> {selectedOrder.mentorReview.privateFeedback}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Link
                                    to={`/agency/chat?user=${selectedOrder?.mentorId?._id}`}
                                    // to={`/agency/chat?user=${selectedOrder.mentorId?._id}`}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={16} />
                                    Message Mentor
                                </Link>
                                {selectedOrder.deliveryStatus === 'delivered' && !selectedOrder.completed && (
                                    <button
                                        onClick={() => handleCompleteOrder(selectedOrder._id)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        Confirm & Complete Order
                                    </button>
                                )}
                                {selectedOrder.orderStatus === 'completed' && !selectedOrder.studentReviewed && (
                                    <button
                                        onClick={() => {
                                            setShowReviewModal(true);
                                            setShowOrderDetails(false);
                                        }}
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center justify-center gap-2"
                                    >
                                        <Star size={16} />
                                        Leave Review
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
        </section>
    );
};

export default NewAllOrders;