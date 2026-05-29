import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    Plus,
    Minus,
    ArrowUpRight,
    ArrowDownRight,
    Banknote,
    Landmark,
    Smartphone,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    XCircle,
    HelpCircle,
    Award,
    PieChart,
    BarChart3
} from "lucide-react";
import { FreelancerSidebar, FreelancerHeader, FreelancerContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const Withdrawals = () => {
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState('upi');
    const [withdrawNote, setWithdrawNote] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [savedUpiId, setSavedUpiId] = useState("");

    // State for earnings data
    const [earnings, setEarnings] = useState({
        totalEarned: 0,
        totalWithdrawn: 0,
        available: 0,
        pending: 0,
        clearing: 0,
        lifetimeBalance: 0,
        thisMonth: 0,
        lastMonth: 0,
        avgOrderValue: 0,
        totalOrders: 0,
        completedOrders: 0,
        cancellationRate: 0
    });

    // State for withdrawal history
    const [withdrawalHistory, setWithdrawalHistory] = useState([]);

    const completedWithdrawals = withdrawalHistory.filter(w => w.status === 'completed');
    const totalWithdrawnAmount = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const avgWithdrawal = totalWithdrawnAmount / (completedWithdrawals.length || 1);

    // Filter withdrawal history
    const filteredHistory = withdrawalHistory.filter(withdrawal => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                withdrawal.id.toLowerCase().includes(term) ||
                withdrawal.method.toLowerCase().includes(term) ||
                withdrawal.amount == term ||
                withdrawal.orderId.toLowerCase().includes(term) ||
                withdrawal.notes?.toLowerCase().includes(term);
            if (!matchesSearch) return false;
        }

        if (statusFilter !== 'all' && withdrawal.status !== statusFilter) return false;

        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const withdrawalDate = new Date(withdrawal.date);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            if (withdrawalDate < cutoff) return false;
        }

        return true;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHistory = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    useEffect(() => {
        fetchEarningsData();
    }, []);

    const fetchEarningsData = async () => {
        try {
            setLoading(true);

            // Fetch earnings summary
            const earningsResponse = await axiosInstance.get('/api/v1/withdrawals/earnings');

            // Fetch withdrawal history
            const historyResponse = await axiosInstance.get('/api/v1/withdrawals/history');

            const paymentResponse = await axiosInstance.get('/api/v1/payment-details');
            const upiMethod = paymentResponse.data.data.find(p => p.upiId);
            if (upiMethod) setSavedUpiId(upiMethod.upiId);

            if (earningsResponse.data?.data) {
                const earningsData = earningsResponse.data.data;
                setEarnings(earningsData);
            }

            if (historyResponse.data?.data?.withdrawals) {
                setWithdrawalHistory(historyResponse.data.data.withdrawals);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching earnings:', error);
            toast.error(error.response?.data?.message || 'Failed to load earnings data');
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);

        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amount > earnings.available) {
            toast.error(`You can only withdraw up to ${formatCurrency(earnings.available)}`);
            return;
        }

        if (amount < 10) {
            toast.error('Minimum withdrawal amount is 10');
            return;
        }

        try {
            const response = await axiosInstance.post('/api/v1/withdrawals/request', {
                amount,
                method: withdrawMethod,
                notes: withdrawNote
            });

            if (response.data?.success) {
                toast.success(`Withdrawal request of ${formatCurrency(amount)} submitted successfully!`);
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                setWithdrawNote('');
                fetchEarningsData(); // Refresh data
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process withdrawal');
        }
    };

    const handleCancelWithdrawal = async (withdrawalId) => {
        try {
            const response = await axiosInstance.post(`/api/v1/withdrawals/${withdrawalId}/cancel`);

            if (response.data?.success) {
                toast.success(`Withdrawal request cancelled successfully!`);
                setShowWithdrawModal(false);
                fetchEarningsData(); // Refresh data
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process withdrawal');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: {
                label: 'Completed',
                bg: 'bg-green-100',
                text: 'text-green-700',
                icon: CheckCircle,
                description: 'Funds transferred successfully'
            },
            pending: {
                label: 'Pending',
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                icon: Clock,
                description: 'Awaiting processing'
            },
            clearing: {
                label: 'Clearing',
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                icon: RefreshCw,
                description: 'Funds are being cleared'
            },
            cancelled: {
                label: 'Cancelled',
                bg: 'bg-red-100',
                text: 'text-red-700',
                icon: XCircle,
                description: 'Withdrawal cancelled'
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

    const getMethodIcon = (method) => {
        switch (method) {
            case 'paypal':
                return <Banknote size={16} className="text-blue-600" />;
            case 'bank_transfer':
                return <Landmark size={16} className="text-green-600" />;
            case 'credit_card':
                return <CreditCard size={16} className="text-purple-600" />;
            case 'mobile_money':
                return <Smartphone size={16} className="text-orange-600" />;
            default:
                return <Banknote size={16} className="text-gray-600" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Withdrawals</h1>
                            <p className="text-gray-600 mt-1">Track your income and manage withdrawals</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                            <button
                                onClick={() => fetchEarningsData()}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-xl shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Wallet size={24} />
                                </div>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Available Now</span>
                            </div>
                            <p className="text-3xl font-bold mb-1">{formatCurrency(earnings.available)}</p>
                            <p className="text-sm text-white/80">Ready to withdraw</p>
                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                disabled={earnings.available < 10}
                                className="mt-4 w-full bg-white text-primary py-2 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Withdraw Funds
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <TrendingUp size={20} className="text-blue-600" />
                                </div>
                                <span className="text-xs text-gray-500">Lifetime</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(earnings.totalEarned)}</p>
                            <p className="text-sm text-gray-600">Total Earned</p>
                            {/* <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                                <span className="text-gray-500">This Month</span>
                                <span className="font-medium text-green-600">+{formatCompactCurrency(earnings.thisMonth)}</span>
                            </div> */}
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CreditCard size={20} className="text-purple-600" />
                                </div>
                                <span className="text-xs text-gray-500">Withdrawn</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(earnings.totalWithdrawn)}</p>
                            <p className="text-sm text-gray-600">Total Withdrawn</p>
                            {/* <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                                <span className="text-gray-500">All Time</span>
                                <span className="font-medium text-green-600">98%</span>
                            </div> */}
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock size={20} className="text-yellow-600" />
                                </div>
                                <span className="text-xs text-gray-500">In Progress</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(earnings.pending + earnings.clearing)}</p>
                            <p className="text-sm text-gray-600">Pending + Clearing</p>
                            {/* <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Pending</span>
                                    <p className="font-medium">{formatCompactCurrency(earnings.pending)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Clearing</span>
                                    <p className="font-medium">{formatCompactCurrency(earnings.clearing)}</p>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                            <p className="text-xl font-bold text-gray-900">{earnings.totalOrders}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs">
                                <CheckCircle size={12} className="text-green-500" />
                                <span className="text-gray-600">{earnings.completedOrders} completed</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Avg. Order Value</p>
                            <p className="text-xl font-bold text-gray-900">{formatCompactCurrency(earnings.avgOrderValue)}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs">
                                <ArrowUpRight size={12} className="text-green-500" />
                                <span className="text-gray-600">+12% vs last month</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Cancellation Rate</p>
                            <p className="text-xl font-bold text-gray-900">{earnings.cancellationRate}%</p>
                            <div className="flex items-center gap-1 mt-2 text-xs">
                                <ArrowDownRight size={12} className="text-red-500" />
                                <span className="text-gray-600">-2% vs last month</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Last Month</p>
                            <p className="text-xl font-bold text-gray-900">{formatCompactCurrency(earnings.lastMonth)}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs">
                                <TrendingUp size={12} className="text-green-500" />
                                <span className="text-gray-600">+30% growth</span>
                            </div>
                        </div>
                    </div> */}

                    {/* Earnings Chart Placeholder */}
                    {/* <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Earnings Overview</h3>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Weekly</button>
                                <button className="px-3 py-1 text-sm bg-primary text-white rounded">Monthly</button>
                                <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Yearly</button>
                            </div>
                        </div>
                        <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-400">Earnings chart will appear here</p>
                                <p className="text-xs text-gray-300 mt-1">Integration with charting library</p>
                            </div>
                        </div>
                    </div> */}

                    {/* Withdrawals History - Full Table with Pagination */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Withdrawal History</h3>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search withdrawals..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="clearing">Clearing</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {/* <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                >
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="365">Last year</option>
                                    <option value="all">All time</option>
                                </select> */}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Withdrawal ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentHistory.length > 0 ? (
                                        currentHistory.map((withdrawal) => (
                                            <tr key={withdrawal.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{formatDate(withdrawal.date)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{withdrawal.id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{formatCurrency(withdrawal.amount)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {getMethodIcon(withdrawal.method)}
                                                        <span className="text-sm uppercase">{withdrawal.method.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(withdrawal.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setSelectedWithdrawal(withdrawal)}
                                                        className="text-primary hover:text-primary-dark text-sm font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No withdrawals found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredHistory.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length} entries
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
                </FreelancerContainer>
            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
                            <button
                                onClick={() => setShowWithdrawModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            {/* <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Available Balance</span>
                                    <span className="font-bold text-primary">{formatCurrency(earnings.available)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Minimum withdrawal</span>
                                    <span className="font-medium">₹10.00</span>
                                </div>
                            </div> */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount to Withdraw *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="10"
                                        max={earnings.available}
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                {withdrawAmount && parseFloat(withdrawAmount) > earnings.available && (
                                    <p className="text-red-500 text-sm mt-1">
                                        Amount exceeds available balance
                                    </p>
                                )}
                                {withdrawAmount && parseFloat(withdrawAmount) < 10 && (
                                    <p className="text-red-500 text-sm mt-1">
                                        Minimum withdrawal amount is ₹10
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Withdrawal Method
                                </label>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Smartphone size={18} className="text-primary" />
                                        <span className="font-medium">UPI</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Funds will be sent to: <strong>{savedUpiId || "Loading..."}</strong>
                                    </p>
                                </div>
                            </div>

                            {withdrawMethod === 'paypal' && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        Funds will be sent to: <strong>paypal@mentor.com</strong>
                                    </p>
                                </div>
                            )}

                            {withdrawMethod === 'bank_transfer' && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        Bank Account: <strong>Chase Bank •••• 1234</strong>
                                    </p>
                                </div>
                            )}

                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={withdrawNote}
                                    onChange={(e) => setWithdrawNote(e.target.value)}
                                    rows={3}
                                    placeholder="Add any notes about this withdrawal"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div> */}

                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <p className="text-xs text-yellow-700">
                                    <strong>Note:</strong> Withdrawals are processed within 1-3 business days.
                                    Funds will move from Available to Clearing status until processed.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowWithdrawModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={!withdrawAmount || parseFloat(withdrawAmount) < 10 || parseFloat(withdrawAmount) > earnings.available}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawal Details Modal */}
            {selectedWithdrawal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Withdrawal Details</h3>
                            <button
                                onClick={() => setSelectedWithdrawal(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Withdrawal ID</p>
                                    <p className="font-medium">{selectedWithdrawal.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="font-bold text-primary">{formatCurrency(selectedWithdrawal.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date Requested</p>
                                    <p className="font-medium">{formatDate(selectedWithdrawal.date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Method</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getMethodIcon(selectedWithdrawal.method)}
                                        <span className="uppercase">{selectedWithdrawal.method.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Account</p>
                                    <p className="font-medium">{selectedWithdrawal.methodDetails}</p>
                                </div>
                                {selectedWithdrawal.processedDate && (
                                    <div>
                                        <p className="text-sm text-gray-500">Processed Date</p>
                                        <p className="font-medium">{formatDate(selectedWithdrawal.processedDate)}</p>
                                    </div>
                                )}
                                {selectedWithdrawal.transactionId && (
                                    <div>
                                        <p className="text-sm text-gray-500">Transaction ID</p>
                                        <p className="font-medium">{selectedWithdrawal.transactionId}</p>
                                    </div>
                                )}
                            </div>

                            {/* {selectedWithdrawal.orderId && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Associated Orders</p>
                                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedWithdrawal.orderId}</p>
                                </div>
                            )} */}

                            {selectedWithdrawal.notes && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Admin Notes</p>
                                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedWithdrawal.notes}</p>
                                </div>
                            )}

                            {selectedWithdrawal.cancellationReason && (
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <strong>Cancellation Reason:</strong> {selectedWithdrawal.cancellationReason}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setSelectedWithdrawal(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                {/* {selectedWithdrawal.status === 'completed' && (
                                    <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                                        Download Receipt
                                    </button>
                                )} */}
                                {selectedWithdrawal.status === 'pending' && (
                                    <button onClick={() => handleCancelWithdrawal(selectedWithdrawal?._id)} className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                                        Cancel Request
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Withdrawals;