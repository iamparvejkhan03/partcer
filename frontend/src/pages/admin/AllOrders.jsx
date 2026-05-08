import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    Search,
    Filter,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    DollarSign,
    Users,
    Star,
    TrendingUp,
    Download,
    Plus,
    Copy,
    PauseCircle,
    PlayCircle,
    Shield,
    Ban,
    Award,
    MessageSquare,
    FileText,
    Calendar,
    MapPin,
    User,
    Briefcase,
    CreditCard,
    HelpCircle,
    Flag,
    RotateCcw,
    X,
    Loader,
    ChevronDown,
    Check,
    Send,
    Package,
    Truck,
    ThumbsUp
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { format } from 'date-fns';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        active: 0,
        pending: 0,
        cancelled: 0,
        disputed: 0,
        refunded: 0,
        totalRevenue: 0,
        platformFees: 0,
        avgOrderValue: 0,
        totalOrders: 0
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Modal states
    const [newStatus, setNewStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [disputeResolution, setDisputeResolution] = useState('');
    const [disputeMessage, setDisputeMessage] = useState('');
    const [flagType, setFlagType] = useState('');
    const [flagReason, setFlagReason] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [processingAction, setProcessingAction] = useState(false);

    const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
    const [newPaymentStatus, setNewPaymentStatus] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [paymentStatusReason, setPaymentStatusReason] = useState('');

    const navigate = useNavigate();

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

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(order => order.orderType === typeFilter);
        }

        // Payment filter
        if (paymentFilter !== 'all') {
            filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
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
                order.buyer?.name?.toLowerCase().includes(term) ||
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

    }, [statusFilter, typeFilter, paymentFilter, dateRange, searchTerm, allOrders, itemsPerPage]);

    // Click outside handler for dropdown menus
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('[data-action-menu]')) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get('/api/v1/orders/admin/all');

            if (response.data?.success) {
                const { orders: fetchedOrders } = response.data.data;

                const enhancedOrders = fetchedOrders.map(order => ({
                    ...order,
                    buyer: {
                        id: order.buyer?._id,
                        name: order.buyer?.displayName || `${order.buyer?.firstName || ''} ${order.buyer?.lastName || ''}`.trim(),
                        avatar: order.buyer?.profileImage || 'https://via.placeholder.com/40',
                        email: order.buyer?.email,
                        location: order.buyer?.country || 'Remote',
                        verified: order.buyer?.isVerified || false
                    },
                    seller: {
                        id: order.seller?._id,
                        name: order.seller?.displayName || `${order.seller?.firstName || ''} ${order.seller?.lastName || ''}`.trim(),
                        avatar: order.seller?.profileImage || 'https://via.placeholder.com/40',
                        email: order.seller?.email,
                        location: order.seller?.country || 'Remote',
                        verified: order.seller?.isVerified || false,
                        level: order.seller?.freelancerType || 'standard'
                    },
                    service: {
                        id: order.service?._id,
                        title: order.details?.title || 'Service',
                        category: order.service?.category?.name || order.details?.category?.name || 'Category',
                        package: order.details?.package?.name || 'Standard'
                    },
                    amount: order.pricing?.subtotal || 0,
                    fee: order.pricing?.platformFee || 0,
                    netAmount: order.pricing?.sellerEarnings || 0,
                    status: order.status,
                    paymentStatus: order.payment?.status || 'unpaid',
                    paymentMethod: order.payment?.method || null,
                    orderType: order.orderType,
                    createdAt: order.createdAt,
                    deliveredAt: order.timeline?.deliveredAt,
                    completedAt: order.timeline?.completedAt,
                    deadline: order.timeline?.deadline,
                    cancelledAt: order.timeline?.cancelledAt,
                    disputes: order.dispute ? 1 : 0,
                    disputeReason: order.dispute?.reason,
                    disputeStatus: order.dispute?.status,
                    refundStatus: order.refund?.status,
                    refundAmount: order.refund?.amount,
                    refundDate: order.refund?.processedAt,
                    cancellationReason: order.timeline?.cancelledAt ? order.cancellationReason : null,
                    rating: order.review?.rating,
                    review: order.review?.comment,
                    adminNotes: order.adminNotes || [],
                    flags: order.flags || []
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

    const handleUpdatePaymentStatus = async () => {
        if (!newPaymentStatus) {
            toast.error('Please select a payment status');
            return;
        }

        try {
            setProcessingAction(true);
            const response = await axiosInstance.patch(
                `/api/v1/orders/admin/${selectedOrder._id}/payment-status`,
                {
                    paymentStatus: newPaymentStatus,
                    transactionId: transactionId || undefined,
                    reason: paymentStatusReason
                }
            );

            if (response.data?.success) {
                toast.success(`Payment status updated to ${newPaymentStatus}`);
                setShowPaymentStatusModal(false);
                setNewPaymentStatus('');
                setTransactionId('');
                setPaymentStatusReason('');
                fetchOrders();
                setSelectedOrder(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update payment status');
        } finally {
            setProcessingAction(false);
        }
    };

    const calculateStats = (ordersData) => {
        const completed = ordersData.filter(o => o.status === 'completed');
        const active = ordersData.filter(o => o.status === 'active');
        const disputed = ordersData.filter(o => o.status === 'disputed');
        const refunded = ordersData.filter(o => o.refundStatus === 'completed');

        const stats = {
            total: ordersData.length,
            completed: completed.length,
            active: active.length,
            pending: ordersData.filter(o => o.status === 'pending').length,
            cancelled: ordersData.filter(o => o.status === 'cancelled').length,
            disputed: disputed.length,
            refunded: refunded.length,
            totalRevenue: completed.reduce((sum, o) => sum + (o.amount || 0), 0),
            platformFees: ordersData.reduce((sum, o) => sum + (o.fee || 0), 0),
            avgOrderValue: completed.length > 0
                ? completed.reduce((sum, o) => sum + (o.amount || 0), 0) / completed.length
                : 0,
            totalOrders: ordersData.length
        };
        setStats(stats);
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: RefreshCw },
            delivered: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Delivered', icon: Package },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: CheckCircle },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: XCircle },
            disputed: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Disputed', icon: Flag },
            refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Refunded', icon: DollarSign },
            expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expired', icon: Clock },
            suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspended', icon: Ban }
        };
        const badge = config[status] || config.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon size={12} />
                {badge.label}
            </span>
        );
    };

    const getPaymentStatusBadge = (paymentStatus) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
            paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
            held: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Held' },
            refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Refunded' },
            failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' }
        };
        const badge = config[paymentStatus] || config.pending;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getOrderTypeBadge = (type) => {
        const config = {
            service: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Service' },
            custom_offer: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Custom Offer' },
            project: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Project' }
        };
        const badge = config[type] || config.service;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
        } catch {
            return 'N/A';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const handleUpdateStatus = async () => {
        if (!newStatus) {
            toast.error('Please select a status');
            return;
        }

        try {
            setProcessingAction(true);
            const response = await axiosInstance.patch(`/api/v1/orders/admin/${selectedOrder._id}/status`, {
                status: newStatus,
                reason: statusReason
            });

            if (response.data?.success) {
                toast.success(`Order status updated to ${newStatus}`);
                setShowStatusModal(false);
                setNewStatus('');
                setStatusReason('');
                fetchOrders();
                setSelectedOrder(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleProcessRefund = async () => {
        if (!refundReason) {
            toast.error('Please provide a reason for refund');
            return;
        }

        try {
            setProcessingAction(true);
            const response = await axiosInstance.post(`/api/v1/orders/admin/${selectedOrder._id}/refund`, {
                amount: refundAmount || selectedOrder.amount,
                reason: refundReason,
                method: 'original'
            });

            if (response.data?.success) {
                toast.success('Refund processed successfully');
                setShowRefundModal(false);
                setRefundAmount('');
                setRefundReason('');
                fetchOrders();
                setSelectedOrder(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process refund');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleResolveDispute = async () => {
        if (!disputeResolution) {
            toast.error('Please select a resolution');
            return;
        }

        try {
            setProcessingAction(true);
            const response = await axiosInstance.post(`/api/v1/orders/admin/${selectedOrder._id}/dispute/resolve`, {
                resolution: disputeResolution,
                message: disputeMessage,
                refundAmount: disputeResolution === 'partial_refund' ? parseFloat(refundAmount) : undefined
            });

            if (response.data?.success) {
                toast.success('Dispute resolved successfully');
                setShowDisputeModal(false);
                setDisputeResolution('');
                setDisputeMessage('');
                setRefundAmount('');
                fetchOrders();
                setSelectedOrder(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resolve dispute');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleFlagOrder = async () => {
        if (!flagType || !flagReason) {
            toast.error('Please select flag type and provide reason');
            return;
        }

        try {
            setProcessingAction(true);
            const response = await axiosInstance.post(`/api/v1/orders/admin/${selectedOrder._id}/flag`, {
                type: flagType,
                reason: flagReason
            });

            if (response.data?.success) {
                toast.success('Order flagged successfully');
                setShowFlagModal(false);
                setFlagType('');
                setFlagReason('');
                fetchOrders();
                setSelectedOrder(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to flag order');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleAddNote = async () => {
        if (!adminNote.trim()) {
            toast.error('Please enter a note');
            return;
        }

        try {
            setProcessingAction(true);
            const response = await axiosInstance.post(`/api/v1/orders/admin/${selectedOrder._id}/notes`, {
                note: adminNote
            });

            if (response.data?.success) {
                toast.success('Note added successfully');
                setShowNoteModal(false);
                setAdminNote('');
                fetchOrders();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add note');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleDeleteOrder = async () => {
        try {
            setProcessingAction(true);
            const response = await axiosInstance.delete(`/api/v1/orders/admin/${selectedOrder._id}`);

            if (response.data?.success) {
                toast.success('Order deleted successfully');
                setShowDeleteModal(false);
                fetchOrders();
                setSelectedOrder(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete order');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleViewBuyer = (buyerId) => {
        navigate(`/admin/users/${buyerId}`);
    };

    const handleViewSeller = (sellerId) => {
        navigate(`/admin/users/${sellerId}`);
    };

    const handleRefresh = () => {
        fetchOrders();
        toast.success('Orders refreshed');
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-12 h-12 animate-spin text-primary" />
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="w-full max-w-full overflow-x-hidden">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Management</h1>
                                <p className="text-gray-600 mt-1">Manage and monitor all platform orders</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-600 flex items-center gap-1"
                                    title="Refresh"
                                >
                                    <RefreshCw size={18} />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <ShoppingBag size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Total Orders</p>
                                        <p className="text-xl font-bold">{stats.total}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Completed</p>
                                        <p className="text-xl font-bold">{stats.completed}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <RefreshCw size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Active</p>
                                        <p className="text-xl font-bold">{stats.active}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Clock size={20} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Pending</p>
                                        <p className="text-xl font-bold">{stats.pending}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Flag size={20} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Disputed</p>
                                        <p className="text-xl font-bold">{stats.disputed}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <DollarSign size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Order Value</p>
                                        <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
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
                                        placeholder="Search by order ID, buyer, seller, service..."
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
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="disputed">Disputed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => {
                                            setTypeFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="service">Service</option>
                                        <option value="custom_offer">Custom Offer</option>
                                        <option value="project">Project</option>
                                    </select>
                                    <select
                                        value={paymentFilter}
                                        onChange={(e) => {
                                            setPaymentFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                    >
                                        <option value="all">All Payments</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="paid">Paid</option>
                                        <option value="held">Held</option>
                                        <option value="refunded">Refunded</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Orders Table - Desktop */}
                        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th> */}
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentOrders.length > 0 ? (
                                            currentOrders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                    {/* <td className="px-4 py-3">
                                                        <div>
                                                            <div className="font-medium text-gray-900 text-xs">{order.orderId}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {formatDate(order.createdAt)}
                                                            </div>
                                                            <div className="mt-0.5">{getOrderTypeBadge(order.orderType)}</div>
                                                        </div>
                                                    </td> */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={order.buyer.avatar}
                                                                alt={order.buyer.name}
                                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/32'; }}
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900 text-base flex items-center gap-1">
                                                                    <span className="truncate max-w-[100px]">{order.buyer.name}</span>
                                                                    {order.buyer.verified && (
                                                                        <CheckCircle size={12} className="text-blue-500" />
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 truncate max-w-[100px]">{order.buyer.location}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={order.seller.avatar}
                                                                alt={order.seller.name}
                                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/32'; }}
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900 text-base flex items-center gap-1">
                                                                    <span className="truncate max-w-[100px]"><Link to={`/freelancer/${order?.seller?.id}`}>{order.seller.name}</Link></span>
                                                                    {order.seller.verified && (
                                                                        <CheckCircle size={12} className="text-blue-500" />
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 truncate max-w-[100px]">{order.seller.location}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-900 line-clamp-2">{order.service.title}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{order.service.category}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-gray-900 text-sm">{formatCurrency(order.amount)}</div>
                                                        {/* <div className="text-xs text-gray-500">Fee: {formatCurrency(order.fee)}</div> */}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(order.status)}
                                                        {order.disputes > 0 && (
                                                            <div className="text-xs text-red-600 mt-0.5 flex items-center gap-0.5">
                                                                <Flag size={8} />
                                                                {order.disputes}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getPaymentStatusBadge(order.paymentStatus)}
                                                        {order.refundStatus === 'completed' && (
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                Refunded: {formatCurrency(order.refundAmount)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-0.5">
                                                            <button
                                                                onClick={() => handleViewOrder(order)}
                                                                className="p-1 text-gray-600 hover:text-primary hover:bg-gray-100 rounded"
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>

                                                            {/* Three Dots Dropdown */}
                                                            <div className="relative" data-action-menu>
                                                                <button
                                                                    onClick={() => setOpenActionMenu(openActionMenu === order._id ? null : order._id)}
                                                                    className="p-1 text-gray-600 hover:text-primary hover:bg-gray-100 rounded"
                                                                    title="More Actions"
                                                                >
                                                                    <MoreVertical size={18} />
                                                                </button>

                                                                {openActionMenu === order._id && (
                                                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedOrder(order);
                                                                                setShowPaymentStatusModal(true);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-2 py-1.5 text-left text-xs text-green-600 hover:bg-green-50 flex items-center gap-1"
                                                                        >
                                                                            <CreditCard size={12} />
                                                                            Update Payment Status
                                                                        </button>
                                                                        {/* <button
                                                                            onClick={() => {
                                                                                handleViewBuyer(order.buyer.id);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                                                        >
                                                                            <Users size={12} />
                                                                            View Buyer
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                handleViewSeller(order.seller.id);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                                                        >
                                                                            <Briefcase size={12} />
                                                                            View Seller
                                                                        </button> */}

                                                                        <hr className="my-1 border-gray-200" />

                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedOrder(order);
                                                                                setShowStatusModal(true);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-2 py-1.5 text-left text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                                                                        >
                                                                            <RefreshCw size={12} />
                                                                            Update Status
                                                                        </button>

                                                                        {order.status === 'disputed' && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedOrder(order);
                                                                                    setShowDisputeModal(true);
                                                                                    setOpenActionMenu(null);
                                                                                }}
                                                                                className="w-full px-2 py-1.5 text-left text-xs text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                                                                            >
                                                                                <Flag size={12} />
                                                                                Resolve Dispute
                                                                            </button>
                                                                        )}

                                                                        {order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedOrder(order);
                                                                                    setShowRefundModal(true);
                                                                                    setOpenActionMenu(null);
                                                                                }}
                                                                                className="w-full px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1"
                                                                            >
                                                                                <RotateCcw size={12} />
                                                                                Process Refund
                                                                            </button>
                                                                        )}

                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedOrder(order);
                                                                                setShowFlagModal(true);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-2 py-1.5 text-left text-xs text-orange-600 hover:bg-orange-50 flex items-center gap-1"
                                                                        >
                                                                            <Flag size={12} />
                                                                            Flag Order
                                                                        </button>

                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedOrder(order);
                                                                                setShowNoteModal(true);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-2 py-1.5 text-left text-xs text-green-600 hover:bg-green-50 flex items-center gap-1"
                                                                        >
                                                                            <FileText size={12} />
                                                                            Add Note
                                                                        </button>

                                                                        <hr className="my-1 border-gray-200" />

                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedOrder(order);
                                                                                setShowDeleteModal(true);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                            Delete Order
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
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
                                                            {searchTerm ? 'Try adjusting your search' : 'No orders match the selected filters'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Orders List - Mobile */}
                        <div className="md:hidden space-y-4 mb-6">
                            {currentOrders.length > 0 ? (
                                currentOrders.map((order) => (
                                    <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs font-medium text-gray-500">{order.orderId}</span>
                                                <h3 className="font-medium text-gray-900 text-sm mt-1">{order.service.title}</h3>
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                            <div>
                                                <span className="text-gray-500">Buyer:</span>
                                                <span className="ml-1 font-medium">{order.buyer.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Seller:</span>
                                                <span className="ml-1 font-medium">{order.seller.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="ml-1 font-bold">{formatCurrency(order.amount)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Payment:</span>
                                                <span className="ml-1">{getPaymentStatusBadge(order.paymentStatus)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t pt-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {/* Three Dots Dropdown - Mobile */}
                                                <div className="relative" data-action-menu>
                                                    <button
                                                        onClick={() => setOpenActionMenu(openActionMenu === order._id ? null : order._id)}
                                                        className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {openActionMenu === order._id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                            <button
                                                                onClick={() => handleViewBuyer(order.buyer.id)}
                                                                className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Users size={14} />
                                                                View Buyer
                                                            </button>
                                                            <button
                                                                onClick={() => handleViewSeller(order.seller.id)}
                                                                className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Briefcase size={14} />
                                                                View Seller
                                                            </button>

                                                            <hr className="my-1 border-gray-200" />

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowStatusModal(true);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                                            >
                                                                <RefreshCw size={14} />
                                                                Update Status
                                                            </button>

                                                            {order.status === 'disputed' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOrder(order);
                                                                        setShowDisputeModal(true);
                                                                        setOpenActionMenu(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-xs text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                                                                >
                                                                    <Flag size={14} />
                                                                    Resolve Dispute
                                                                </button>
                                                            )}

                                                            {order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedOrder(order);
                                                                        setShowRefundModal(true);
                                                                        setOpenActionMenu(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    <RotateCcw size={14} />
                                                                    Process Refund
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowFlagModal(true);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-xs text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                                                            >
                                                                <Flag size={14} />
                                                                Flag Order
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowNoteModal(true);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-xs text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                            >
                                                                <FileText size={14} />
                                                                Add Note
                                                            </button>

                                                            <hr className="my-1 border-gray-200" />

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setShowDeleteModal(true);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} />
                                                                Delete Order
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(order.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                    <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No orders found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {searchTerm ? 'Try adjusting your search' : 'No orders match the selected filters'}
                                    </p>
                                </div>
                            )}

                            {/* Mobile Pagination */}
                            {orders.length > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Desktop Pagination */}
                        {orders.length > 0 && (
                            <div className="hidden md:flex px-6 py-4 border-t border-gray-200 items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, orders.length)} of {orders.length} entries
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

                        {/* Order Statistics Summary */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-blue-600" />
                                    Order Performance
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Completion Rate</span>
                                        <span className="font-medium text-gray-900">
                                            {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg. Order Value</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(stats.avgOrderValue)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Dispute Rate</span>
                                        <span className="font-medium text-orange-600">
                                            {stats.total > 0 ? ((stats.disputed / stats.total) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} className="text-green-600" />
                                    Financial Summary
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Platform Fees</span>
                                        <span className="font-medium text-green-600">{formatCurrency(stats.platformFees)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Refunded Amount</span>
                                        <span className="font-medium text-red-600">
                                            {formatCurrency(orders.filter(o => o.refundStatus === 'completed').reduce((sum, o) => sum + (o.refundAmount || 0), 0))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Held Payments</span>
                                        <span className="font-medium text-orange-600">
                                            {formatCurrency(orders.filter(o => o.paymentStatus === 'held').reduce((sum, o) => sum + o.amount, 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <Flag size={16} className="text-orange-600" />
                                    Disputes & Issues
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Open Disputes</span>
                                        <span className="font-medium text-orange-600">{stats.disputed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Flagged Orders</span>
                                        <span className="font-medium text-orange-600">
                                            {orders.filter(o => o.flags?.length > 0).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Admin Notes</span>
                                        <span className="font-medium text-gray-900">
                                            {orders.filter(o => o.adminNotes?.length > 0).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </AdminContainer>
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Order ID: {selectedOrder.orderId}</p>
                            </div>
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Order Status */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-col items-start gap-2">
                                    <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
                                        Order Status:
                                        <span>{getStatusBadge(selectedOrder.status)}</span>
                                    </div>
                                    <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
                                        Payment Status:
                                        <span>{getPaymentStatusBadge(selectedOrder.paymentStatus)}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Created: {formatDate(selectedOrder.createdAt)}
                                </div>
                            </div>

                            {/* Buyer & Seller Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Users size={16} />
                                        Buyer Information
                                    </h4>
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={selectedOrder.buyer.avatar}
                                            alt={selectedOrder.buyer.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                                        />
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <p className="font-medium text-gray-900">{selectedOrder.buyer.name}</p>
                                                {selectedOrder.buyer.verified && (
                                                    <CheckCircle size={14} className="text-blue-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{selectedOrder.buyer.email}</p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <MapPin size={10} />
                                                {selectedOrder.buyer.location}
                                            </p>
                                            {/* <button
                                                onClick={() => handleViewBuyer(selectedOrder.buyer.id)}
                                                className="mt-2 text-xs text-primary hover:text-primary-dark"
                                            >
                                                View Profile →
                                            </button> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Briefcase size={16} />
                                        Seller Information
                                    </h4>
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={selectedOrder.seller.avatar}
                                            alt={selectedOrder.seller.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                                        />
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <p className="font-medium text-gray-900">{selectedOrder.seller.name}</p>
                                                {selectedOrder.seller.verified && (
                                                    <CheckCircle size={14} className="text-blue-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{selectedOrder.seller.email}</p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <MapPin size={10} />
                                                {selectedOrder.seller.location}
                                            </p>
                                            {/* <button
                                                onClick={() => handleViewSeller(selectedOrder.seller.id)}
                                                className="mt-2 text-xs text-primary hover:text-primary-dark"
                                            >
                                                View Profile →
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <ShoppingBag size={16} />
                                    Service Details
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{selectedOrder.service.title}</p>
                                        <p className="text-xs text-gray-600">{selectedOrder.service.category} • {selectedOrder.service.package}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Order Type</p>
                                            <p className="text-sm font-medium">{getOrderTypeBadge(selectedOrder.orderType)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Payment Method</p>
                                            <p className="text-sm font-medium capitalize">{selectedOrder.paymentMethod?.replace('_', ' ') || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <DollarSign size={16} />
                                    Financial Details
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Order Amount</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(selectedOrder.amount)}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Platform Fee</span>
                                        <span className="font-medium text-red-600">-{formatCurrency(selectedOrder.fee)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-sm font-medium text-gray-700">Net Amount</span>
                                        <span className="font-bold text-green-600">{formatCurrency(selectedOrder.netAmount)}</span>
                                    </div> */}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Clock size={16} />
                                    Timeline
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Order Placed</span>
                                        <span className="text-sm font-medium">{formatDate(selectedOrder.createdAt)}</span>
                                    </div>
                                    {selectedOrder.deliveredAt && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Delivered</span>
                                            <span className="text-sm font-medium">{formatDate(selectedOrder.deliveredAt)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.completedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Completed</span>
                                            <span className="text-sm font-medium">{formatDate(selectedOrder.completedAt)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.deadline && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Deadline</span>
                                            <span className="text-sm font-medium">{formatDate(selectedOrder.deadline)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.cancelledAt && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Cancelled</span>
                                            <span className="text-sm font-medium">{formatDate(selectedOrder.cancelledAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dispute Info */}
                            {selectedOrder.status === 'disputed' && selectedOrder.disputeReason && (
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Flag size={16} className="text-orange-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-orange-800">Dispute Details</p>
                                            <p className="text-sm text-orange-700 mt-1">
                                                <span className="font-medium">Reason:</span> {selectedOrder.disputeReason}
                                            </p>
                                            <p className="text-xs text-orange-600 mt-1">
                                                Opened: {formatDate(selectedOrder.disputeOpenedAt)} • Status: {selectedOrder.disputeStatus}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cancellation Info */}
                            {selectedOrder.status === 'cancelled' && selectedOrder.cancellationReason && (
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <span className="font-medium">Cancellation Reason:</span> {selectedOrder.cancellationReason}
                                    </p>
                                    {selectedOrder.refundDate && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Refunded on {formatDate(selectedOrder.refundDate)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Admin Notes */}
                            {selectedOrder.adminNotes?.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <FileText size={16} />
                                        Admin Notes
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedOrder.adminNotes.map((note, idx) => (
                                            <div key={idx} className="p-2 bg-white rounded border">
                                                <p className="text-sm text-gray-700">{note.note}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Added on {formatDate(note.addedAt)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Flags */}
                            {selectedOrder.flags?.length > 0 && (
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Flag size={16} className="text-orange-600" />
                                        Flags
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedOrder.flags.map((flag, idx) => (
                                            <div key={idx} className="p-2 bg-white rounded border border-orange-200">
                                                <p className="text-sm font-medium text-orange-800">{flag.type}</p>
                                                <p className="text-sm text-gray-700">{flag.reason}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Flagged on {formatDate(flag.flaggedAt)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Review */}
                            {selectedOrder.rating && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                        Review
                                    </h4>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    className={star <= selectedOrder.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600">{selectedOrder.rating} out of 5</span>
                                    </div>
                                    <p className="text-sm text-gray-700 italic">"{selectedOrder.review}"</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowOrderModal(false);
                                        setShowStatusModal(true);
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={18} />
                                    Update Status
                                </button>
                                {selectedOrder.status === 'disputed' && (
                                    <button
                                        onClick={() => {
                                            setShowOrderModal(false);
                                            setShowDisputeModal(true);
                                        }}
                                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                                    >
                                        <Flag size={18} />
                                        Resolve Dispute
                                    </button>
                                )}
                                {selectedOrder.paymentStatus === 'paid' && selectedOrder.status !== 'cancelled' && (
                                    <button
                                        onClick={() => {
                                            setShowOrderModal(false);
                                            setShowRefundModal(true);
                                        }}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                    >
                                        <RotateCcw size={18} />
                                        Process Refund
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowOrderModal(false);
                                        setShowNoteModal(true);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <FileText size={18} />
                                    Add Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Status Modal */}
            {showPaymentStatusModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Update Payment Status</h3>
                            <button
                                onClick={() => {
                                    setShowPaymentStatusModal(false);
                                    setNewPaymentStatus('');
                                    setTransactionId('');
                                    setPaymentStatusReason('');
                                    setSelectedOrder(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Order ID: {selectedOrder.orderId}<br />
                            Current Status: <span className="font-medium">{selectedOrder.paymentStatus}</span>
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Payment Status *
                            </label>
                            <select
                                value={newPaymentStatus}
                                onChange={(e) => setNewPaymentStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Select status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="paid">Paid</option>
                                <option value="held">Held</option>
                                <option value="refunded">Refunded</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g., PAY-1234567890"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason (Optional)
                            </label>
                            <textarea
                                value={paymentStatusReason}
                                onChange={(e) => setPaymentStatusReason(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Reason for status change..."
                            />
                        </div>

                        <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                            <p className="text-xs text-yellow-700 flex items-start gap-2">
                                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                                <span>
                                    Changing payment status will affect order processing and notifications to both buyer and seller.
                                </span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPaymentStatusModal(false);
                                    setNewPaymentStatus('');
                                    setTransactionId('');
                                    setPaymentStatusReason('');
                                    setSelectedOrder(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePaymentStatus}
                                disabled={!newPaymentStatus || processingAction}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {processingAction ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {
                showStatusModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Update Order Status</h3>
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setNewStatus('');
                                        setStatusReason('');
                                        setSelectedOrder(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Status *
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Select status</option>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="disputed">Disputed</option>
                                    <option value="refunded">Refunded</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={statusReason}
                                    onChange={(e) => setStatusReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Provide reason for status change..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setNewStatus('');
                                        setStatusReason('');
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={!newStatus || processingAction}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {processingAction ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Refund Modal */}
            {
                showRefundModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Process Refund</h3>
                                <button
                                    onClick={() => {
                                        setShowRefundModal(false);
                                        setRefundAmount('');
                                        setRefundReason('');
                                        setSelectedOrder(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Process a refund for order "{selectedOrder.orderId}"
                            </p>

                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Order Amount:</span>
                                    <span className="font-medium">{formatCurrency(selectedOrder.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Platform Fee:</span>
                                    <span className="font-medium">{formatCurrency(selectedOrder.fee)}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refund Amount (Optional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        placeholder={`Full amount: ${selectedOrder.amount}`}
                                        min="0"
                                        max={selectedOrder.amount}
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Leave empty for full refund</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for refund *
                                </label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter reason for refund..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRefundModal(false);
                                        setRefundAmount('');
                                        setRefundReason('');
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProcessRefund}
                                    disabled={!refundReason || processingAction}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processingAction ? 'Processing...' : 'Process Refund'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Dispute Resolution Modal */}
            {
                showDisputeModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Resolve Dispute</h3>
                                <button
                                    onClick={() => {
                                        setShowDisputeModal(false);
                                        setDisputeResolution('');
                                        setDisputeMessage('');
                                        setRefundAmount('');
                                        setSelectedOrder(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Order ID: {selectedOrder.orderId}
                            </p>

                            <div className="bg-orange-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-orange-700">
                                    <span className="font-medium">Dispute Reason:</span> {selectedOrder.disputeReason}
                                </p>
                            </div>

                            <div className="space-y-3 mb-4">
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="resolution"
                                        value="refund_buyer"
                                        onChange={(e) => setDisputeResolution(e.target.value)}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">Full Refund to Buyer</span>
                                        <p className="text-xs text-gray-500">Release payment back to buyer</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="resolution"
                                        value="release_seller"
                                        onChange={(e) => setDisputeResolution(e.target.value)}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">Release to Seller</span>
                                        <p className="text-xs text-gray-500">Release payment to seller</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="resolution"
                                        value="partial_refund"
                                        onChange={(e) => setDisputeResolution(e.target.value)}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">Partial Refund</span>
                                        <p className="text-xs text-gray-500">Split payment between both parties</p>
                                    </div>
                                </label>
                            </div>

                            {disputeResolution === 'partial_refund' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Refund Amount *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={refundAmount}
                                            onChange={(e) => setRefundAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            min="0"
                                            max={selectedOrder.amount}
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Resolution Message
                                </label>
                                <textarea
                                    value={disputeMessage}
                                    onChange={(e) => setDisputeMessage(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Add a message about the resolution..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDisputeModal(false);
                                        setDisputeResolution('');
                                        setDisputeMessage('');
                                        setRefundAmount('');
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResolveDispute}
                                    disabled={!disputeResolution || processingAction || (disputeResolution === 'partial_refund' && !refundAmount)}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {processingAction ? 'Resolving...' : 'Resolve Dispute'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Flag Order Modal */}
            {
                showFlagModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Flag Order</h3>
                                <button
                                    onClick={() => {
                                        setShowFlagModal(false);
                                        setFlagType('');
                                        setFlagReason('');
                                        setSelectedOrder(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Flag this order for review or violation.
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Flag Type *
                                </label>
                                <select
                                    value={flagType}
                                    onChange={(e) => setFlagType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Select type</option>
                                    <option value="suspicious">Suspicious Activity</option>
                                    <option value="high_risk">High Risk</option>
                                    <option value="violation">Terms Violation</option>
                                    <option value="fraud">Potential Fraud</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason *
                                </label>
                                <textarea
                                    value={flagReason}
                                    onChange={(e) => setFlagReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Provide detailed reason for flagging..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowFlagModal(false);
                                        setFlagType('');
                                        setFlagReason('');
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFlagOrder}
                                    disabled={!flagType || !flagReason || processingAction}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                >
                                    {processingAction ? 'Flagging...' : 'Flag Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Note Modal */}
            {
                showNoteModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Add Admin Note</h3>
                                <button
                                    onClick={() => {
                                        setShowNoteModal(false);
                                        setAdminNote('');
                                        setSelectedOrder(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Add a private note about this order (only visible to admins).
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note *
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter your note..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowNoteModal(false);
                                        setAdminNote('');
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddNote}
                                    disabled={!adminNote.trim() || processingAction}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {processingAction ? 'Adding...' : 'Add Note'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Delete Order</h3>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4 text-red-600 bg-red-50 p-3 rounded-lg">
                                    <AlertCircle size={20} />
                                    <p className="text-sm font-medium">This action cannot be undone</p>
                                </div>

                                <p className="text-gray-700 mb-4">
                                    Are you sure you want to permanently delete order <span className="font-mono font-medium">{selectedOrder.orderId}</span>?
                                </p>

                                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                    <p className="text-gray-600">This will:</p>
                                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                                        <li>Remove all order data from database</li>
                                        <li>Delete all associated files from storage</li>
                                        <li>Remove any reviews associated with this order</li>
                                        <li>This action is irreversible</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteOrder}
                                    disabled={processingAction}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processingAction ? 'Deleting...' : 'Delete Permanently'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </section >
    );
};

export default Orders;