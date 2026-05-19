import { useState, useEffect } from 'react';
import {
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Loader,
    Eye,
    Calendar,
    TrendingUp,
    Filter,
    Download,
    CreditCard,
    Banknote,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    X,
    ShoppingBag
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { format } from 'date-fns';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [summary, setSummary] = useState({
        totalAmount: 0,
        totalCount: 0,
        avgAmount: 0
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    // Fetch transactions
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);

            // Don't send filters to API - just fetch all
            const response = await axiosInstance.get(`/api/v1/payments/admin/transactions?limit=1000`);

            if (response.data?.success) {
                const fetchedTransactions = response.data.data.transactions;
                setAllTransactions(fetchedTransactions);
                setTransactions(fetchedTransactions);
                setSummary(response.data.data.summary);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchTransactions();
        toast.success('Transactions refreshed');
    };

    useEffect(() => {
        if (allTransactions.length === 0) return;

        let filtered = [...allTransactions];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(transaction => transaction.status === statusFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(transaction => transaction.transactionType === typeFilter);
        }

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(transaction =>
                transaction.razorpayOrderId?.toLowerCase().includes(term) ||
                transaction.amount == term ||
                transaction.razorpayPaymentId?.toLowerCase().includes(term) ||
                transaction.bankReference?.toLowerCase().includes(term) ||
                transaction.orderId?.orderId?.toLowerCase().includes(term)
            );
        }

        setTransactions(filtered);
        setCurrentPage(1);

        // Update pagination locally
        setPagination(prev => ({
            ...prev,
            page: 1,
            total: filtered.length,
            pages: Math.ceil(filtered.length / itemsPerPage)
        }));

    }, [statusFilter, typeFilter, searchTerm, allTransactions, itemsPerPage]);

    const handleViewTransaction = async (transaction) => {
        try {
            const response = await axiosInstance.get(`/api/v1/payments/admin/transactions/${transaction._id}`);
            if (response.data?.success) {
                setSelectedTransaction(response.data.data.transaction);
                setShowTransactionModal(true);
            }
        } catch (error) {
            toast.error('Failed to load transaction details');
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
            success: { label: 'Success', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            initiated: { label: 'Initiated', bg: 'bg-blue-100', text: 'text-blue-700', icon: CreditCard }
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

    const getTypeBadge = (type) => {
        const config = {
            payment: { label: 'Payment', bg: 'bg-green-100', text: 'text-green-700', icon: CreditCard },
            refund: { label: 'Refund', bg: 'bg-orange-100', text: 'text-orange-700', icon: ArrowUpRight },
            capture: { label: 'Capture', bg: 'bg-blue-100', text: 'text-blue-700', icon: Banknote }
        };
        const cfg = config[type] || config.payment;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    if (loading && transactions.length === 0) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 min-w-0">
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
            <div className="flex-1 min-w-0 overflow-x-auto">
                <AdminHeader />
                <AdminContainer>
                    <div className="w-full">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transactions</h1>
                                <p className="text-gray-600 mt-1">View and manage all payment transactions</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Transactions</p>
                                        <p className="text-2xl font-bold">{summary.totalCount}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <CreditCard size={24} className="text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Volume</p>
                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalAmount)}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <DollarSign size={24} className="text-green-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Average Transaction</p>
                                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.avgAmount)}</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <TrendingUp size={24} className="text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* Filters */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by Order ID, Payment ID, or Reference..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="success">Success</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    {/* <select
                                        value={typeFilter}
                                        onChange={(e) => {
                                            setTypeFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="payment">Payment</option>
                                        <option value="refund">Refund</option>
                                        <option value="capture">Capture</option>
                                    </select> */}
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th> */}
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentTransactions.length > 0 ? (
                                            currentTransactions.map((transaction) => (
                                                <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-900">{formatDateTime(transaction.createdAt)}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-mono text-gray-900">{transaction.razorpayPaymentId?.slice(-12) || transaction._id?.slice(-12)}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getTypeBadge(transaction.transactionType)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-mono text-gray-600">{transaction.orderId?._id || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className={`font-bold ${transaction.transactionType === 'refund' ? 'text-red-600' : 'text-green-600'}`}>
                                                            {transaction.transactionType === 'refund' ? '-' : ''}{formatCurrency(transaction.amount)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(transaction.status)}
                                                    </td>
                                                    {/* <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-600 capitalize">{transaction.paymentMethod || 'N/A'}</div>
                                                    </td> */}
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleViewTransaction(transaction)}
                                                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <CreditCard size={40} className="text-gray-300 mb-3" />
                                                        <p className="text-gray-500 font-medium">No transactions found</p>
                                                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
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
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, transactions.length)} of {transactions.length} entries
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                            let pageNum;
                                            if (pagination.pages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.page >= pagination.pages - 2) {
                                                pageNum = pagination.pages - 4 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-8 h-8 rounded-lg ${pagination.page === pageNum
                                                        ? 'bg-primary text-white'
                                                        : 'hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </AdminContainer>
            </div>

            {/* Transaction Details Modal */}
            {showTransactionModal && selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Transaction ID: {selectedTransaction._id?.slice(-12)}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowTransactionModal(false);
                                    setSelectedTransaction(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Badges */}
                            <div className="flex gap-2">
                                {getStatusBadge(selectedTransaction.status)}
                                {getTypeBadge(selectedTransaction.transactionType)}
                            </div>

                            {/* Transaction Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <CreditCard size={16} />
                                    Transaction Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount:</span>
                                        <span className={`font-bold ${selectedTransaction.transactionType === 'refund' ? 'text-red-600' : 'text-green-600'}`}>
                                            {selectedTransaction.transactionType === 'refund' ? '-' : ''}{formatCurrency(selectedTransaction.amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span>{getStatusBadge(selectedTransaction.status)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span>{getTypeBadge(selectedTransaction.transactionType)}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="capitalize">{selectedTransaction.paymentMethod || 'N/A'}</span>
                                    </div> */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date & Time:</span>
                                        <span>{formatDateTime(selectedTransaction.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Gateway Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Banknote size={16} />
                                    Payment Gateway Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Razorpay Order ID:</span>
                                        <span className="font-mono text-sm">{selectedTransaction.razorpayOrderId || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Razorpay Payment ID:</span>
                                        <span className="font-mono text-sm">{selectedTransaction.razorpayPaymentId || 'N/A'}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                        <span className="text-gray-600">Bank Reference:</span>
                                        <span className="font-mono text-sm">{selectedTransaction.bankReference || 'N/A'}</span>
                                    </div> */}
                                </div>
                            </div>

                            {/* Order Info */}
                            {selectedTransaction.orderId && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <ShoppingBag size={16} />
                                        Order Information
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Order ID:</span>
                                            <span className="font-mono text-sm">{selectedTransaction.orderId?._id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Service:</span>
                                            <span>{selectedTransaction.orderId.serviceType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Order Amount:</span>
                                            <span>{formatCurrency(selectedTransaction.orderId.amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Info */}
                            {selectedTransaction.errorMessage && (
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle size={16} className="text-red-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-red-800">Error Details</p>
                                            <p className="text-sm text-red-700 mt-1">{selectedTransaction.errorMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Transactions;