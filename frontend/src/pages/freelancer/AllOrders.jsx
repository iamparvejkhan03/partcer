import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Download,
    Plus,
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
    TrendingUp,
    Download as ExportIcon,
    RefreshCw,
    HelpCircle,
    Send,
    Award,
    Loader,
    Info,
    Paperclip
} from "lucide-react";
import { FreelancerSidebar, FreelancerHeader, FreelancerContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]); // Original unfiltered orders
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [orderReviews, setOrderReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
        totalRevenue: 0,
        avgOrderValue: 0
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Replace currentOrders with this:
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch orders on component mount and when filters change
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get(`/api/v1/orders?role=seller`);

            if (response.data?.success) {
                const { orders } = response.data.data;

                const enhancedOrders = orders.map(order => ({
                    ...order,
                    customer: {
                        name: order.buyer?.displayName || `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.trim(),
                        avatar: order.buyer?.profileImage || 'https://via.placeholder.com/40',
                        email: order.buyer?.email,
                        location: order.buyer?.country || 'Remote',
                        isVerified: order.buyer?.isVerified || false
                    },
                    service: {
                        id: order.service?._id,
                        title: order.details?.title || order.service?.title || 'Service',
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
                    deliveryDate: order.timeline?.deadline,
                    completedDate: order.timeline?.completedAt,
                    requirements: order?.requirements || '',
                    hasReview: false,
                    revisions: order.delivery?.revisions?.used || 0,
                    messages: order.recentMessages?.length || 0
                }));

                setAllOrders(enhancedOrders);
                setOrders(enhancedOrders);
                setStats(calculateLocalStats(enhancedOrders));
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

    const calculateLocalStats = (ordersData) => {
        const completed = ordersData.filter(o => o.status === 'completed');
        const active = ordersData.filter(o => o.status === 'active');

        return {
            total: ordersData.length,
            active: active.length,
            completed: completed.length,
            cancelled: ordersData.filter(o => o.status === 'cancelled').length,
            pending: ordersData.filter(o => o.status === 'pending').length,
            revenue: completed.reduce((sum, o) => sum + (o.pricing?.total || 0), 0),
            avgOrderValue: completed.length > 0
                ? completed.reduce((sum, o) => sum + (o.pricing?.total || 0), 0) / completed.length
                : 0
        };
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

    const statusConfig = {
        pending: {
            label: 'Pending',
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            icon: Clock,
            description: 'Awaiting payment or confirmation'
        },
        active: {
            label: 'Active',
            bg: 'bg-green-100',
            text: 'text-green-700',
            icon: RefreshCw,
            description: 'Order is in progress'
        },
        delivered: {
            label: 'Delivered',
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            icon: Send,
            description: 'Order delivered, awaiting review'
        },
        completed: {
            label: 'Completed',
            bg: 'bg-green-100',
            text: 'text-green-700',
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
            bg: 'bg-purple-100',
            text: 'text-purple-700',
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

    const orderTypeConfig = {
        service: { label: 'Service', icon: ShoppingBag, bg: 'bg-purple-100', text: 'text-purple-700' },
        custom_offer: { label: 'Custom Offer', icon: Award, bg: 'bg-indigo-100', text: 'text-indigo-700' },
        project: { label: 'Project', icon: FileText, bg: 'bg-orange-100', text: 'text-orange-700' }
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

    const getOrderTypeBadge = (type) => {
        const config = orderTypeConfig[type] || orderTypeConfig.service;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
        } catch {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Filter orders locally when filters change
    useEffect(() => {
        if (allOrders.length === 0) return;

        let filtered = [...allOrders];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(order => order.orderType === typeFilter);
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
                order.customer?.name?.toLowerCase().includes(term) ||
                order.service?.title?.toLowerCase().includes(term)
            );
        }

        // Update orders and pagination
        setOrders(filtered);
        setCurrentPage(1);
        setPagination(prev => ({
            ...prev,
            page: 1,
            total: filtered.length,
            pages: Math.ceil(filtered.length / itemsPerPage)
        }));

    }, [statusFilter, typeFilter, dateRange, searchTerm, allOrders, itemsPerPage]);

    const handleViewOrder = async (order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
        await fetchOrderReviews(order._id);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await axiosInstance.patch(`/api/v1/orders/${orderId}/status`, {
                status: newStatus
            });

            if (response.data?.success) {
                toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
                fetchOrders(); // Refresh the list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const handleDeliverOrder = async (orderId) => {
        try {
            // This would typically open a delivery modal
            // For now, we'll just navigate to the order details page
            navigate(`/freelancer/orders/${orderId}`);
        } catch (error) {
            toast.error('Failed to deliver order');
        }
    };

    const handleMessage = (order) => {
        navigate(`/freelancer/chat?user=${order?.buyer?._id}`);
    };

    const handleRefresh = async () => {
        await fetchOrders();
        toast.success('Orders refreshed');
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <FreelancerSidebar />
                <div className="w-full relative">
                    <FreelancerHeader />
                    <FreelancerContainer>
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-12 h-12 animate-spin text-primary" />
                        </div>
                    </FreelancerContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <FreelancerSidebar />
            <div className="w-full relative">
                <FreelancerHeader />
                <FreelancerContainer>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders</h1>
                            <p className="text-gray-600 mt-1">Manage and track all your client orders</p>
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
                                to="/freelancer/services/create"
                                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                            >
                                <Plus size={18} />
                                Create Service
                            </Link> */}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ShoppingBag size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <RefreshCw size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active</p>
                                    <p className="text-2xl font-bold">{stats.active}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CheckCircle size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold">{stats.completed}</p>
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
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <DollarSign size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
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
                                    placeholder="Search by order ID, customer, service..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[140px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="disputed">Disputed</option>
                                </select>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => {
                                        setTypeFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[140px]"
                                >
                                    <option value="all">All Types</option>
                                    <option value="service">Services</option>
                                    <option value="custom_offer">Custom Offers</option>
                                    <option value="project">Projects</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order Details
                                        </th> */}
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <img
                                                            src={order.service?.image}
                                                            alt={order.service?.title}
                                                            className="w-16 h-12 rounded object-cover"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/80x60';
                                                            }}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                                                                {order.service?.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {order.service?.package}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={order.customer?.avatar}
                                                            alt={order.customer?.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/32';
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900 text-sm flex items-center gap-1">
                                                                {order.customer?.name}
                                                                {order.customer?.isVerified && (
                                                                    <CheckCircle size={12} className="text-blue-500" />
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{order.customer?.location}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="text-xs">
                                                            <span className="text-gray-500">Order ID:</span>
                                                            <span className="ml-1 font-mono text-gray-900">{order.orderId}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            <span>Ordered:</span>
                                                            <span className="ml-1">{formatDate(order.createdAt)}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            <span>Deadline:</span>
                                                            <span className="ml-1">{formatDate(order.deliveryDate)}</span>
                                                        </div>
                                                        <div className="mt-1">
                                                            {getOrderTypeBadge(order.orderType)}
                                                        </div>
                                                    </div>
                                                </td> */}
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">${order.total?.toFixed(2)}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {getPaymentBadge(order.paymentStatus)}
                                                    </div>
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
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewOrder(order)}
                                                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Info size={18} />
                                                        </button>
                                                        <Link
                                                            to={`/freelancer/orders/${order._id}`}
                                                            target="_blank"
                                                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        {order.status === 'pending' && order.paymentStatus === 'paid' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order._id, 'active')}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Start Order"
                                                            >
                                                                <RefreshCw size={18} />
                                                            </button>
                                                        )}
                                                        {order.status === 'active' && (
                                                            <button
                                                                onClick={() => handleDeliverOrder(order)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Deliver Order"
                                                            >
                                                                <Send size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleMessage(order)}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative"
                                                            title="Messages"
                                                        >
                                                            <MessageCircle size={18} />
                                                            {order.messages > 0 && (
                                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                                    {order.messages}
                                                                </span>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                        <ShoppingBag size={24} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No orders found</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                                            ? 'Try adjusting your filters'
                                                            : 'You haven\'t received any orders yet'}
                                                    </p>
                                                    {/* {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                                                        <Link
                                                            to="/freelancer/services/create"
                                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                        >
                                                            <Plus size={18} />
                                                            Create Your First Service
                                                        </Link>
                                                    )} */}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.total > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                        let pageNum;
                                        if (pagination.pages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= pagination.pages - 2) {
                                            pageNum = pagination.pages - 4 + i;
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
                                    {pagination.pages > 5 && currentPage < pagination.pages - 2 && (
                                        <>
                                            <span>...</span>
                                            <button
                                                onClick={() => handlePageChange(pagination.pages)}
                                                className="w-8 h-8 rounded-lg hover:bg-gray-100"
                                            >
                                                {pagination.pages}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === pagination.pages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <TrendingUp size={18} className="text-primary" />
                                Performance
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Avg. Order Value</span>
                                    <span className="font-medium">{formatCurrency(stats.avgOrderValue)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Completion Rate</span>
                                    <span className="font-medium">
                                        {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Active Orders</span>
                                    <span className="font-medium">{stats.active}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Award size={18} className="text-primary" />
                                Reviews
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            // Get seller's rating from user object (you'll need to fetch this)
                                            const sellerRating = user?.rating || 0;
                                            const filled = star <= Math.round(sellerRating);
                                            const partial = star - 0.5 <= sellerRating && sellerRating < star;

                                            return (
                                                <div key={star} className="relative">
                                                    <Star
                                                        size={16}
                                                        className={filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                    />
                                                    {partial && (
                                                        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                                                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <span className="font-medium">{user?.rating?.toFixed(1) || '0.0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Reviews</span>
                                    <span className="font-medium">{user?.reviewCount || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Completed Orders</span>
                                    <span className="font-medium">{stats.completed}</span>
                                </div>
                                {user?.reviewCount > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <Link
                                            to="/freelancer/reviews"
                                            className="text-xs text-primary hover:underline flex items-center justify-between"
                                        >
                                            View all reviews
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </FreelancerContainer>
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Order ID: {selectedOrder.orderId}</p>
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
                            {/* Order Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-500">Order Date</p>
                                    <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                                </div>
                                <div>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <User size={16} />
                                    Customer Information
                                </h4>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={selectedOrder.customer?.avatar}
                                        alt={selectedOrder.customer?.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/48';
                                        }}
                                    />
                                    <div>
                                        <p className="font-medium flex items-center gap-1">
                                            {selectedOrder.customer?.name}
                                            {selectedOrder.customer?.isVerified && (
                                                <CheckCircle size={14} className="text-blue-500" />
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600">{selectedOrder.customer?.email}</p>
                                        <p className="text-sm text-gray-600">{selectedOrder.customer?.location}</p>
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
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/64';
                                        }}
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
                            {(selectedOrder.requirements?.text || selectedOrder.requirements?.attachments?.length > 0) && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <FileText size={16} />
                                        Order Requirements
                                        {selectedOrder.requirements?.status && (
                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${selectedOrder.requirements.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    selectedOrder.requirements.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {selectedOrder.requirements.status}
                                            </span>
                                        )}
                                    </h4>

                                    {/* Requirements Text */}
                                    {selectedOrder.requirements?.text && (
                                        <div className="mb-4">
                                            <p className="text-gray-700 whitespace-pre-line">{selectedOrder.requirements.text}</p>
                                        </div>
                                    )}

                                    {/* Attachments */}
                                    {selectedOrder.requirements?.attachments?.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                                <Paperclip size={14} />
                                                Attachments ({selectedOrder.requirements.attachments.length})
                                            </h5>
                                            <div className="space-y-2">
                                                {selectedOrder.requirements.attachments.map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                                    >
                                                        {file.type?.startsWith('image/') ? (
                                                            <img
                                                                src={file.url}
                                                                alt={file.name}
                                                                className="w-8 h-8 object-cover rounded"
                                                            />
                                                        ) : (
                                                            <FileText size={16} className="text-gray-500" />
                                                        )}
                                                        <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {(file.size / 1024).toFixed(1)} KB
                                                        </span>
                                                        <Download size={14} className="text-gray-400 hover:text-primary" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Submitted Date */}
                                    {selectedOrder.requirements?.submittedAt && (
                                        <p className="text-xs text-gray-500 mt-3">
                                            Submitted on {formatDate(selectedOrder.requirements.submittedAt)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Clock size={16} />
                                    Timeline
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Order Date</span>
                                        <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Delivery Date</span>
                                        <span className="font-medium">{formatDate(selectedOrder.deliveryDate)}</span>
                                    </div>
                                    {selectedOrder.completedDate && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Completed Date</span>
                                            <span className="font-medium">{formatDate(selectedOrder.completedDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <DollarSign size={16} />
                                    Payment Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(selectedOrder.pricing?.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Platform Fee</span>
                                        <span className="font-medium text-green-600">-{formatCurrency(selectedOrder.pricing?.platformFee)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="font-medium">Your Earnings</span>
                                        <span className="font-bold text-primary">{formatCurrency(selectedOrder.pricing?.sellerEarnings)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Payment Status</span>
                                        <span>{getPaymentBadge(selectedOrder.paymentStatus)}</span>
                                    </div>
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
                                                            {review.reviewerRole === 'buyer' ? 'Buyer' : 'Freelancer'} • {formatDate(review.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700">{review.comment}</p>
                                                {review.response?.comment && (
                                                    <div className="mt-2 ml-6 p-2 bg-white rounded-lg">
                                                        <p className="text-xs text-gray-500 mb-1">Your Response:</p>
                                                        <p className="text-sm text-gray-700">{review.response.comment}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                {selectedOrder.status === 'pending' && selectedOrder.paymentStatus === 'paid' && (
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(selectedOrder._id, 'active');
                                            setShowOrderDetails(false);
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Start Order
                                    </button>
                                )}
                                {selectedOrder.status === 'active' && (
                                    <button
                                        onClick={() => {
                                            handleDeliverOrder(selectedOrder);
                                            setShowOrderDetails(false);
                                        }}
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    >
                                        Deliver Order
                                    </button>
                                )}
                                <button
                                    onClick={() => handleMessage(selectedOrder)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                                >
                                    Message Client
                                </button>
                                <Link
                                    to={`/freelancer/orders/${selectedOrder._id}`}
                                    target="_blank"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                                >
                                    View Order
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AllOrders;