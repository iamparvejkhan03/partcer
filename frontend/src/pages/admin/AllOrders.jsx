import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingBag,
    Eye,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Loader,
    User,
    Package,
    CreditCard,
    Calendar,
    TrendingUp,
    Users
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { format } from 'date-fns';

const NewOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        paid: 0,
        pending: 0,
        failed: 0,
        totalRevenue: 0,
        totalMentorEarnings: 0,
        totalPlatformFees: 0
    });

    // Fetch orders
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            // Fetch all orders from your payment orders endpoint
            const response = await axiosInstance.get('/api/v1/payments/admin/orders');

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
        const paidOrders = ordersData.filter(o => o.paymentStatus === 'paid');

        const stats = {
            total: ordersData.length,
            paid: paidOrders.length,
            pending: ordersData.filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'created').length,
            failed: ordersData.filter(o => o.paymentStatus === 'failed').length,
            totalRevenue: paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
            totalMentorEarnings: paidOrders.reduce((sum, o) => sum + (o.mentorFee || 0), 0),
            totalPlatformFees: paidOrders.reduce((sum, o) => sum + (o.partnerFee || 0), 0)
        };
        setStats(stats);
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        if (paymentStatusFilter !== 'all' && order.paymentStatus !== paymentStatusFilter) {
            return false;
        }
        if (orderStatusFilter !== 'all' && order.orderStatus !== orderStatusFilter) {
            return false;
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            const studentName = `${order.studentId?.firstName || ''} ${order.studentId?.lastName || ''}`.toLowerCase();
            const mentorName = `${order.mentorId?.firstName || ''} ${order.mentorId?.lastName || ''}`.toLowerCase();
            return (
                order.orderId?.toLowerCase().includes(term) ||
                studentName.includes(term) ||
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
            confirmed: { label: 'Confirmed', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
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

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

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
                                <p className="text-gray-600 mt-1">Manage and monitor all platform orders (Razorpay Integration)</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-600 flex items-center gap-1"
                                >
                                    <RefreshCw size={18} />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
                                        <p className="text-xs text-gray-600">Paid</p>
                                        <p className="text-xl font-bold text-green-600">{stats.paid}</p>
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
                                        <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <DollarSign size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Total Revenue</p>
                                        <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-100 rounded-lg">
                                        <TrendingUp size={20} className="text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Mentor Earnings</p>
                                        <p className="text-lg font-bold text-teal-600">{formatCurrency(stats.totalMentorEarnings)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Users size={20} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Platform Fees</p>
                                        <p className="text-lg font-bold text-orange-600">{formatCurrency(stats.totalPlatformFees)}</p>
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
                                        placeholder="Search by order ID, student name, mentor name, service..."
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
                                        value={paymentStatusFilter}
                                        onChange={(e) => {
                                            setPaymentStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                    >
                                        <option value="all">All Payment Status</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="created">Initiated</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                    <select
                                        value={orderStatusFilter}
                                        onChange={(e) => {
                                            setOrderStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                    >
                                        <option value="all">All Order Status</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="completed">Completed</option>
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
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor Fee</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform Fee</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentOrders.length > 0 ? (
                                            currentOrders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-mono text-gray-900">{order.orderId?.slice(-12)}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={order.studentId?.profileImage || 'https://via.placeholder.com/32'}
                                                                alt={order.studentId?.firstName}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {order.studentId?.firstName} {order.studentId?.lastName}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{order.studentId?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
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
                                                                <div className="text-xs text-gray-500">{order.mentorId?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-900">{order.serviceType}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{order.period} • {order.duration?.split('·')[0]}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-gray-900 text-sm">{formatCurrency(order.amount)}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-green-600 font-medium">{formatCurrency(order.mentorFee)}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-orange-600">{formatCurrency(order.partnerFee)}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getPaymentStatusBadge(order.paymentStatus)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getOrderStatusBadge(order.orderStatus)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleViewOrder(order)}
                                                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={11} className="px-6 py-12 text-center">
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
                                                <span className="text-xs font-mono text-gray-500">{order.orderId?.slice(-12)}</span>
                                                <h3 className="font-medium text-gray-900 text-sm mt-1">{order.serviceType}</h3>
                                            </div>
                                            {getPaymentStatusBadge(order.paymentStatus)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                            <div>
                                                <span className="text-gray-500">Student:</span>
                                                <span className="ml-1 font-medium">{order.studentId?.firstName} {order.studentId?.lastName}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Mentor:</span>
                                                <span className="ml-1 font-medium">{order.mentorId?.firstName} {order.mentorId?.lastName}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="ml-1 font-bold">{formatCurrency(order.amount)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Mentor Fee:</span>
                                                <span className="ml-1 text-green-600">{formatCurrency(order.mentorFee)}</span>
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
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredOrders.length > 0 && (
                            <div className="hidden md:flex px-6 py-4 border-t border-gray-200 items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} entries
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
                </AdminContainer>
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                <p className="text-sm text-gray-500 font-mono">Order ID: {selectedOrder.orderId}</p>
                            </div>
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Badges */}
                            <div className="flex flex-wrap gap-3">
                                {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                                {getOrderStatusBadge(selectedOrder.orderStatus)}
                            </div>

                            {/* Student & Mentor Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <User size={16} />
                                        Student Information
                                    </h4>
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={selectedOrder.studentId?.profileImage || 'https://via.placeholder.com/48'}
                                            alt={selectedOrder.studentId?.firstName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {selectedOrder.studentId?.firstName} {selectedOrder.studentId?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">{selectedOrder.studentId?.email}</p>
                                            <Link
                                                to={`/admin/users/${selectedOrder.studentId?._id}`}
                                                className="text-xs text-primary hover:underline mt-1 inline-block"
                                            >
                                                View Profile →
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Briefcase size={16} />
                                        Mentor Information
                                    </h4>
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={selectedOrder.mentorId?.profileImage || 'https://via.placeholder.com/48'}
                                            alt={selectedOrder.mentorId?.firstName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {selectedOrder.mentorId?.firstName} {selectedOrder.mentorId?.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">{selectedOrder.mentorId?.email}</p>
                                            <Link
                                                to={`/admin/users/${selectedOrder.mentorId?._id}`}
                                                className="text-xs text-primary hover:underline mt-1 inline-block"
                                            >
                                                View Profile →
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
                                        <span className="text-gray-600">Student Paid:</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(selectedOrder.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mentor Earnings:</span>
                                        <span className="font-medium text-green-600">{formatCurrency(selectedOrder.mentorFee)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Platform Fee:</span>
                                        <span className="font-medium text-orange-600">{formatCurrency(selectedOrder.partnerFee)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
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
                                    {selectedOrder.paymentCompletedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Completed:</span>
                                            <span>{formatDateTime(selectedOrder.paymentCompletedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default NewOrders;