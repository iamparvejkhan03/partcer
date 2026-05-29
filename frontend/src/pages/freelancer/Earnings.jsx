import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    DollarSign,
    TrendingUp,
    Wallet,
    CreditCard,
    Calendar,
    Download,
    Filter,
    Search,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Banknote,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    XCircle,
    ShoppingBag,
    Award,
    FileText,
    User,
    Star,
    Info
} from "lucide-react";
import { FreelancerSidebar, FreelancerHeader, FreelancerContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const Earnings = () => {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const navigate = useNavigate();

    // State for earnings summary
    const [summary, setSummary] = useState({
        lifetimeEarnings: 0,
        thisMonth: 0,
        pendingClearance: 0,
        avgOrderValue: 0,
        totalTransactions: 0,
        thisWeek: 0,
        highestEarning: 0,
        averageProcessingTime: '2-3 days'
    });

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            setLoading(true);

            // Fetch transactions
            const transactionsResponse = await axiosInstance.get('/api/v1/freelancer/earnings/transactions');

            if (transactionsResponse.data?.data) {
                const { transactions, summary, monthlyBreakdown } = transactionsResponse.data.data;

                setTransactions(transactions);

                // Update summary with real data
                setSummary({
                    lifetimeEarnings: summary.lifetimeEarnings || 0,
                    thisMonth: summary.thisMonth || 0,
                    pendingClearance: summary.pendingClearance || 0,
                    avgOrderValue: summary.avgOrderValue || 0,
                    totalTransactions: summary.totalTransactions || 0,
                    thisWeek: summary.thisWeek || 0,
                    highestEarning: summary.highestEarning || 0,
                    averageProcessingTime: summary.averageProcessingTime || '2-3 days'
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching earnings transactions:', error);
            toast.error(error.response?.data?.message || 'Failed to load earnings data');
            setLoading(false);
        }
    };

    const calculateSummary = (transactionsData) => {
        const clearedTransactions = transactionsData.filter(t => t.status === 'cleared');
        const paidTransactions = transactionsData.filter(t => t.status === 'paid');
        const pendingTransactions = transactionsData.filter(t => t.status === 'pending');

        const lifetimeEarnings = clearedTransactions.reduce((sum, t) => sum + t.netEarnings, 0);

        // This month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthTransactions = clearedTransactions.filter(t => new Date(t.date) >= startOfMonth);
        const thisMonthEarnings = thisMonthTransactions.reduce((sum, t) => sum + t.netEarnings, 0);

        // This week
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const thisWeekTransactions = clearedTransactions.filter(t => new Date(t.date) >= startOfWeek);
        const thisWeekEarnings = thisWeekTransactions.reduce((sum, t) => sum + t.netEarnings, 0);

        // Pending clearance
        const pendingClearance = paidTransactions.reduce((sum, t) => sum + t.netEarnings, 0);

        // Average order value
        const avgOrderValue = clearedTransactions.length > 0
            ? lifetimeEarnings / clearedTransactions.length
            : 0;

        // Highest earning order
        const highestEarning = clearedTransactions.length > 0
            ? Math.max(...clearedTransactions.map(t => t.netEarnings))
            : 0;

        setSummary({
            lifetimeEarnings,
            thisMonth: thisMonthEarnings,
            pendingClearance,
            avgOrderValue,
            totalTransactions: transactionsData.length,
            thisWeek: thisWeekEarnings,
            highestEarning,
            averageProcessingTime: '2-3 days'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            // cleared: {
            //     label: 'Cleared',
            //     bg: 'bg-green-100',
            //     text: 'text-green-700',
            //     icon: CheckCircle,
            //     description: 'Funds available in your account'
            // },
            paid: {
                label: 'Paid',
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                icon: DollarSign,
                description: 'Payment received, clearing in progress'
            },
            pending: {
                label: 'Pending',
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                icon: Clock,
                description: 'Awaiting payment from student'
            },
            // on_hold: {
            //     label: 'On Hold',
            //     bg: 'bg-orange-100',
            //     text: 'text-orange-700',
            //     icon: AlertCircle,
            //     description: 'Payment temporarily on hold'
            // },
            cancelled: {
                label: 'Cancelled',
                bg: 'bg-red-100',
                text: 'text-red-700',
                icon: XCircle,
                description: 'Transaction cancelled'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const getOrderTypeBadge = (type) => {
        const typeConfig = {
            service: { label: 'Service', icon: ShoppingBag, bg: 'bg-purple-100', text: 'text-purple-700' },
            custom_offer: { label: 'Custom Offer', icon: Award, bg: 'bg-indigo-100', text: 'text-indigo-700' },
            project: { label: 'Project', icon: FileText, bg: 'bg-orange-100', text: 'text-orange-700' }
        };

        const config = typeConfig[type] || typeConfig.service;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'paypal':
                return <Banknote size={16} className="text-blue-600" />;
            case 'bank_transfer':
                return <DollarSign size={16} className="text-green-600" />;
            case 'credit_card':
                return <CreditCard size={16} className="text-purple-600" />;
            default:
                return <DollarSign size={16} className="text-gray-600" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatCompactCurrency = (amount) => {
        if (amount >= 1000) {
            return '₹' + (amount / 1000).toFixed(1) + 'K';
        }
        return '₹' + amount.toFixed(0);
    };

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                transaction.id.toLowerCase().includes(term) ||
                transaction.customer.name.toLowerCase().includes(term) ||
                transaction.service.title.toLowerCase().includes(term);
            if (!matchesSearch) return false;
        }

        if (statusFilter !== 'all' && transaction.status !== statusFilter) return false;

        if (typeFilter !== 'all' && transaction.service.type !== typeFilter) return false;

        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const transactionDate = new Date(transaction.date);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            if (transactionDate < cutoff) return false;
        }

        return true;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <FreelancerSidebar />
                <div className="w-full relative">
                    <FreelancerHeader />
                    <FreelancerContainer>
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Earnings</h1>
                            <p className="text-gray-600 mt-1">Track your income from orders and projects</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                            <button
                                onClick={() => fetchEarnings()}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-5 rounded-xl shadow-lg">
                            <p className="text-sm text-white/80 mb-1">Lifetime Earnings</p>
                            <p className="text-2xl font-bold">{formatCompactCurrency(summary.lifetimeEarnings)}</p>
                            <p className="text-xs text-white/60 mt-2">After fees</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-sm text-gray-600">This Month</p>
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{formatCompactCurrency(summary.thisMonth)}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs">
                                <ArrowUpRight size={12} className="text-green-500" />
                                <span className="text-gray-500">vs last month</span>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Pending</p>
                            <p className="text-xl font-bold text-gray-900">{formatCompactCurrency(summary.pendingClearance)}</p>
                            <p className="text-xs text-gray-500 mt-2">Est.: 2-3 days</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Avg. Order Value</p>
                            <p className="text-xl font-bold text-gray-900">{formatCompactCurrency(summary.avgOrderValue)}</p>
                            <p className="text-xs text-gray-500 mt-2">{summary.totalTransactions} total transactions</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by order ID, student name, service..."
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
                                    {/* <option value="cleared">Cleared</option> */}
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    {/* <option value="on_hold">On Hold</option> */}
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {/* <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[140px]"
                                >
                                    <option value="all">All Types</option>
                                    <option value="service">Services</option>
                                    <option value="custom_offer">Custom Offers</option>
                                    <option value="project">Projects</option>
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
                                </select> */}
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentTransactions.length > 0 ? (
                                        currentTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-gray-900">{formatDate(transaction.date)}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-bold text-green-600">{formatCurrency(transaction.netEarnings)}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(transaction.status)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTransaction(transaction);
                                                            setShowTransactionModal(true);
                                                        }}
                                                        className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Info size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => navigate(`/freelancer/orders/${transaction.orderId}`)}
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
                                            <td colSpan={10} className="px-4 py-8 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                        <DollarSign size={24} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No transactions found</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateRange !== 'all'
                                                            ? 'Try adjusting your filters'
                                                            : 'You haven\'t received any earnings yet'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredTransactions.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                                                onClick={() => setCurrentPage(pageNum)}
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
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="w-8 h-8 rounded-lg hover:bg-gray-100"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">This Week</p>
                            <p className="text-lg font-bold text-gray-900">{formatCompactCurrency(summary.thisWeek)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">Highest Earning Order</p>
                            <p className="text-lg font-bold text-gray-900">{formatCompactCurrency(summary.highestEarning)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">Avg. Processing Time</p>
                            <p className="text-lg font-bold text-gray-900">{summary.averageProcessingTime}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600">Total Transactions</p>
                            <p className="text-lg font-bold text-gray-900">{summary.totalTransactions}</p>
                        </div>
                    </div>
                </FreelancerContainer>
            </div>

            {/* Transaction Details Modal */}
            {showTransactionModal && selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
                                <p className="text-sm text-gray-600 mt-1">{selectedTransaction.id}</p>
                            </div>
                            <button
                                onClick={() => setShowTransactionModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status and Amount */}
                            <div className="flex justify-between items-center">
                                <div>{getStatusBadge(selectedTransaction.status)}</div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Net Earnings</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedTransaction.netEarnings)}</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <User size={16} />
                                    Student Information
                                </h4>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={selectedTransaction.customer.avatar}
                                        alt={selectedTransaction.customer.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium flex items-center gap-1">
                                            {selectedTransaction.customer.name}
                                            {selectedTransaction.customer.isVerified && (
                                                <span className="text-blue-500 text-xs">✓ Verified</span>
                                            )}
                                        </p>
                                        {/* <p className="text-sm text-gray-600">{selectedTransaction.customer.email}</p> */}
                                        <p className="text-sm text-gray-600">{selectedTransaction.customer.location}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <ShoppingBag size={16} />
                                    Order Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Order ID</span>
                                        <span className="font-medium">{selectedTransaction.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Service</span>
                                        <span className="font-medium">{selectedTransaction.service.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Package</span>
                                        <span className="font-medium">{selectedTransaction.service.package}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Type</span>
                                        <span>{getOrderTypeBadge(selectedTransaction.service.type)}</span>
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
                                        <span className="text-sm text-gray-600">Order Amount</span>
                                        <span className="font-medium">{formatCurrency(selectedTransaction.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Platform Fee</span>
                                        <span className="font-medium text-red-600">-{formatCurrency(selectedTransaction.fee)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="font-medium">Net Earnings</span>
                                        <span className="font-bold text-green-600">{formatCurrency(selectedTransaction.netEarnings)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Timeline */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Clock size={16} />
                                    Timeline
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Transaction Date</span>
                                        <span className="font-medium">{formatDate(selectedTransaction.date)}</span>
                                    </div>
                                    {selectedTransaction.processedDate && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Processed Date</span>
                                            <span className="font-medium">{formatDate(selectedTransaction.processedDate)}</span>
                                        </div>
                                    )}
                                    {selectedTransaction.clearingDate && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Cleared Date</span>
                                            <span className="font-medium">{formatDate(selectedTransaction.clearingDate)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Payment Method</span>
                                        <div className="flex items-center gap-2">
                                            {getPaymentMethodIcon(selectedTransaction.paymentMethod)}
                                            <span className="capitalize">{selectedTransaction.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hold Reason if applicable */}
                            {selectedTransaction.status === 'on_hold' && selectedTransaction.holdReason && (
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <p className="text-sm text-orange-700">
                                        <strong>Hold Reason:</strong> {selectedTransaction.holdReason}
                                    </p>
                                </div>
                            )}

                            {/* Cancellation Reason if applicable */}
                            {selectedTransaction.status === 'cancelled' && selectedTransaction.cancellationReason && (
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <strong>Cancellation Reason:</strong> {selectedTransaction.cancellationReason}
                                    </p>
                                </div>
                            )}

                            {/* Invoice Number */}
                            {/* <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <FileText size={16} />
                                    Invoice
                                </h4>
                                <p className="text-sm">Invoice #{selectedTransaction.invoice}</p>
                            </div> */}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                {/* <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Download Invoice
                                </button> */}
                                <Link
                                    to={`/freelancer/orders/${selectedTransaction.id}`}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-center"
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

export default Earnings;