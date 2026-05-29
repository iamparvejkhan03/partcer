import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    DollarSign,
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
    Users,
    Download,
    Plus,
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
    Banknote,
    Landmark,
    Smartphone,
    Wallet,
    X
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { dummyUserImg } from '../../assets';

const Withdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const actionMenuRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        rejected: 0,
        totalAmount: 0,
        completedAmount: 0,
        pendingAmount: 0,
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchWithdrawals();
    }, []);

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

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/v1/withdrawals/admin/all');

            if (response.data?.data?.withdrawals) {
                const formattedWithdrawals = response.data.data.withdrawals.map(w => ({
                    id: w.withdrawalId,
                    freelancer: {
                        id: w.freelancerId?._id || w.freelancerId,
                        name: w.freelancerId?.displayName || `${w.freelancerId?.firstName || ''} ${w.freelancerId?.lastName || ''}`.trim() || 'Unknown',
                        avatar: w.freelancerId?.profileImage || dummyUserImg,
                        email: w.freelancerId?.email || '',
                        location: w.freelancerId?.country || 'Not specified',
                        verified: w.freelancerId?.isVerified || false,
                        level: w.freelancerId?.freelancerType || 'freelancer',
                        balance: 0 // Fetch separately or calculate
                    },
                    amount: w.amount,
                    fee: 0, // Platform fee - calculate from order if needed
                    netAmount: w.amount,
                    method: w.method,
                    methodDetails: w.methodDetails,
                    status: w.status,
                    requestedAt: w.createdAt,
                    processedAt: w.processedDate,
                    transactionId: w.transactionId,
                    notes: w.notes,
                    rejectionReason: w.cancellationReason
                }));

                setWithdrawals(formattedWithdrawals);
                calculateStats(formattedWithdrawals);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            toast.error(error.response?.data?.message || 'Failed to load withdrawal requests');
            setLoading(false);
        }
    };

    const calculateStats = (withdrawalsData) => {
        const pending = withdrawalsData.filter(w => w.status === 'pending');
        const clearing = withdrawalsData.filter(w => w.status === 'clearing');
        const completed = withdrawalsData.filter(w => w.status === 'completed');

        const stats = {
            total: withdrawalsData.length,
            pending: pending.length,
            clearing: clearing.length,
            completed: completed.length,
            rejected: withdrawalsData.filter(w => w.status === 'cancelled').length,
            totalAmount: withdrawalsData.reduce((sum, w) => sum + w.amount, 0),
            completedAmount: completed.reduce((sum, w) => sum + w.amount, 0),
            pendingAmount: [...pending, ...clearing].reduce((sum, w) => sum + w.amount, 0),
        };
        setStats(stats);
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            clearing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Clearing', icon: RotateCcw },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: CheckCircle },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle }
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

    const getMethodIcon = (method) => {
        switch (method) {
            case 'paypal':
                return <Banknote size={14} className="text-blue-600" />;
            case 'bank_transfer':
                return <Landmark size={14} className="text-green-600" />;
            case 'payoneer':
                return <CreditCard size={14} className="text-purple-600" />;
            case 'mobile_money':
                return <Smartphone size={14} className="text-orange-600" />;
            case 'upi':
                return <Banknote size={14} className="text-orange-600" />;
            default:
                return <DollarSign size={14} className="text-gray-600" />;
        }
    };

    const getMethodBadge = (method) => {
        const config = {
            paypal: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'PayPal' },
            bank_transfer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Bank Transfer' },
            payoneer: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Payoneer' },
            mobile_money: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Mobile Money' },
            upi: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'UPI' }
        };
        const badge = config[method] || { bg: 'bg-gray-100', text: 'text-gray-700', label: method };
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {getMethodIcon(method)}
                {badge.label}
            </span>
        );
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
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
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

    const handleViewWithdrawal = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setShowWithdrawalModal(true);
    };

    const handleProcessWithdrawal = async (withdrawalId) => {
        try {
            await axiosInstance.patch(`/api/v1/withdrawals/admin/${withdrawalId}/process`, {
                status: "clearing"
            });

            toast.success('Withdrawal marked as processing');
            fetchWithdrawals(); // Refresh
            setShowProcessModal(false);
            setSelectedWithdrawal(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update withdrawal status');
        }
    };

    const handleCompleteWithdrawal = async (withdrawalId, transactionId) => {
        try {
            await axiosInstance.patch(`/api/v1/withdrawals/admin/${withdrawalId}/process`, {
                status: "completed",
                transactionId: transactionId
            });

            toast.success('Withdrawal completed successfully');
            fetchWithdrawals(); // Refresh
            setShowProcessModal(false);
            setSelectedWithdrawal(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete withdrawal');
        }
    };

    const handleRejectWithdrawal = async (withdrawalId, reason) => {
        try {
            await axiosInstance.patch(`/api/v1/withdrawals/admin/${withdrawalId}/process`, {
                status: "cancelled",
                notes: reason
            });

            toast.success('Withdrawal rejected');
            fetchWithdrawals(); // Refresh
            setShowRejectModal(false);
            setSelectedWithdrawal(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject withdrawal');
        }
    };

    const handleViewFreelancer = (freelancerId) => {
        navigate(`/freelancer/${freelancerId}`);
    };

    const filteredWithdrawals = withdrawals.filter(withdrawal => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matches =
                withdrawal.id.toLowerCase().includes(term) ||
                withdrawal.method.toLowerCase().includes(term) ||
                withdrawal.amount == term ||
                withdrawal.freelancer.name.toLowerCase().includes(term) ||
                withdrawal.freelancer.email.toLowerCase().includes(term) ||
                withdrawal.transactionId?.toLowerCase().includes(term);
            if (!matches) return false;
        }

        if (statusFilter !== 'all' && withdrawal.status !== statusFilter) return false;
        if (methodFilter !== 'all' && withdrawal.method !== methodFilter) return false;

        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const requestDate = new Date(withdrawal.requestedAt);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            if (requestDate < cutoff) return false;
        }

        return true;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentWithdrawals = filteredWithdrawals.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
                                <p className="text-gray-600 mt-1">Manage and process mentor withdrawal requests</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <button
                                    onClick={() => fetchWithdrawals()}
                                    className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-600 flex items-center gap-1"
                                    title="Refresh"
                                >
                                    <RefreshCw size={18} className="text-gray-600" />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Wallet size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Total Requests</p>
                                        <p className="text-xl font-bold">{stats.total}</p>
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
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <RotateCcw size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Processing</p>
                                        <p className="text-xl font-bold">{stats.clearing}</p>
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
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <DollarSign size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Total Paid</p>
                                        <p className="text-xl font-bold">{formatCurrency(stats.completedAmount)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <DollarSign size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Total Amount</p>
                                        <p className="text-xl font-bold">{formatCurrency(stats.totalAmount)}</p>
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
                                        placeholder="Search by ID, mentor, email, transaction ID..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]">
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="clearing">Clearing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Rejected</option>
                                    </select>
                                    {/* <select
                                        value={methodFilter}
                                        onChange={(e) => {
                                            setMethodFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                    >
                                        <option value="all">All Methods</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="payoneer">Payoneer</option>
                                        <option value="mobile_money">Mobile Money</option>
                                    </select> */}
                                    {/* <select
                                        value={dateRange}
                                        onChange={(e) => {
                                            setDateRange(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
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

                        {/* Withdrawals Table - Desktop */}
                        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[160px]">Mentor</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Method</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[130px]">Requested</th>
                                            {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[130px]">Processed</th> */}
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[90px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentWithdrawals.length > 0 ? (
                                            currentWithdrawals.map((withdrawal) => (
                                                <tr key={withdrawal.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <img
                                                                src={withdrawal.freelancer.avatar}
                                                                alt={withdrawal.freelancer.name}
                                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900 text-base flex items-center gap-0.5">
                                                                    <span className="truncate max-w-[150px]">{withdrawal.freelancer.name}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-500 truncate max-w-[150px]">{withdrawal.freelancer.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-gray-900 text-sm">{formatCurrency(withdrawal.amount)}</div>
                                                        <div className="text-xs text-gray-500">Fee: {formatCurrency(withdrawal.fee)}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getMethodBadge(withdrawal.method)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(withdrawal.status)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-900 whitespace-nowrap">{formatDate(withdrawal.requestedAt)}</div>
                                                    </td>
                                                    {/* <td className="px-4 py-3">
                                                        <div className="text-xs text-gray-900 whitespace-nowrap">
                                                            {withdrawal.processedAt ? formatDate(withdrawal.processedAt) : '—'}
                                                        </div>
                                                    </td> */}
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-0.5">
                                                            <button
                                                                onClick={() => handleViewWithdrawal(withdrawal)}
                                                                className="p-1 text-gray-600 hover:text-primary hover:bg-gray-100 rounded"
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>

                                                            {/* Three Dots Dropdown */}
                                                            <div className="relative" data-action-menu>
                                                                <button
                                                                    onClick={() => setOpenActionMenu(openActionMenu === withdrawal.id ? null : withdrawal.id)}
                                                                    className="p-1 text-gray-600 hover:text-primary hover:bg-gray-100 rounded"
                                                                    title="More Actions"
                                                                >
                                                                    <MoreVertical size={18} />
                                                                </button>

                                                                {openActionMenu === withdrawal.id && (
                                                                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                                        <button
                                                                            onClick={() => {
                                                                                handleViewFreelancer(withdrawal.freelancer.id);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-4 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                                                        >
                                                                            <Users size={12} />
                                                                            View Mentor
                                                                        </button>

                                                                        {(withdrawal.status === 'pending') && (
                                                                            <>
                                                                                <hr className="my-1 border-gray-200" />
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedWithdrawal(withdrawal);
                                                                                        setShowProcessModal(true);
                                                                                        setOpenActionMenu(null);
                                                                                    }}
                                                                                    className="w-full px-4 py-1.5 text-left text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                                                                                >
                                                                                    <RotateCcw size={12} />
                                                                                    Mark as Clearing
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedWithdrawal(withdrawal);
                                                                                        setShowRejectModal(true);
                                                                                        setOpenActionMenu(null);
                                                                                    }}
                                                                                    className="w-full px-4 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1"
                                                                                >
                                                                                    <XCircle size={12} />
                                                                                    Reject
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        {(withdrawal.status === 'clearing') && (
                                                                            <>
                                                                                <hr className="my-1 border-gray-200" />
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedWithdrawal(withdrawal);
                                                                                        setShowCompleteModal(true);
                                                                                        setOpenActionMenu(null);
                                                                                    }}
                                                                                    className="w-full px-4 py-1.5 text-left text-xs text-green-600 hover:bg-green-50 flex items-center gap-1"
                                                                                >
                                                                                    <CheckCircle size={12} />
                                                                                    Mark as Completed
                                                                                </button>
                                                                            </>
                                                                        )}
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
                                                        <DollarSign size={40} className="text-gray-300 mb-3" />
                                                        <p className="text-gray-500 font-medium">No withdrawal requests found</p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            {searchTerm ? 'Try adjusting your search' : 'No requests match the selected filters'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Withdrawals List - Mobile */}
                        <div className="md:hidden space-y-4 mb-6">
                            {currentWithdrawals.length > 0 ? (
                                currentWithdrawals.map((withdrawal) => (
                                    <div key={withdrawal.id} className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs font-medium text-gray-500">{withdrawal.id}</span>
                                                <h3 className="font-medium text-gray-900 text-sm mt-1">{withdrawal.freelancer.name}</h3>
                                            </div>
                                            {getStatusBadge(withdrawal.status)}
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <img
                                                src={withdrawal.freelancer.avatar}
                                                alt={withdrawal.freelancer.name}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                            <span className="text-xs text-gray-600 truncate">{withdrawal.freelancer.email}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                            <div>
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="ml-1 font-bold">{formatCurrency(withdrawal.amount)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Method:</span>
                                                <span className="ml-1">{getMethodBadge(withdrawal.method)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Requested:</span>
                                                <span className="ml-1">{formatDate(withdrawal.requestedAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t pt-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewWithdrawal(withdrawal)}
                                                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {/* Three Dots Dropdown - Mobile */}
                                                <div className="relative" data-action-menu>
                                                    <button
                                                        onClick={() => setOpenActionMenu(openActionMenu === withdrawal.id ? null : withdrawal.id)}
                                                        className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {openActionMenu === withdrawal.id && (
                                                        <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                            <button
                                                                onClick={() => {
                                                                    handleViewFreelancer(withdrawal.freelancer.id);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                                                            >
                                                                <Users size={12} />
                                                                View Mentor
                                                            </button>

                                                            {(withdrawal.status === 'pending') && (
                                                                <>
                                                                    <hr className="my-1 border-gray-200" />
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedWithdrawal(withdrawal);
                                                                            setShowProcessModal(true);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="w-full px-4 py-1.5 text-left text-xs text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                                                                    >
                                                                        <RotateCcw size={12} />
                                                                        Mark as Clearing
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedWithdrawal(withdrawal);
                                                                            setShowRejectModal(true);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="w-full px-4 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-1"
                                                                    >
                                                                        <XCircle size={12} />
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(withdrawal.status === 'clearing') && (
                                                                <>
                                                                    <hr className="my-1 border-gray-200" />
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedWithdrawal(withdrawal);
                                                                            setShowCompleteModal(true);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="w-full px-4 py-1.5 text-left text-xs text-green-600 hover:bg-green-50 flex items-center gap-1"
                                                                    >
                                                                        <CheckCircle size={12} />
                                                                        Mark as Completed
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {withdrawal.transactionId || 'No TXN'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                    <DollarSign size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No withdrawal requests found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {searchTerm ? 'Try adjusting your search' : 'No requests match the selected filters'}
                                    </p>
                                </div>
                            )}

                            {/* Mobile Pagination */}
                            {filteredWithdrawals.length > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Withdrawal Statistics Summary */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <Clock size={16} className="text-yellow-600" />
                                    Pending Processing
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Pending Requests</span>
                                        <span className="font-medium text-gray-900">{stats.pending}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Processing</span>
                                        <span className="font-medium text-blue-600">{stats.clearing}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Pending Amount</span>
                                        <span className="font-medium text-yellow-600">{formatCurrency(stats.pendingAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-600" />
                                    Completed
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Completed</span>
                                        <span className="font-medium text-green-600">{stats.completed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Amount</span>
                                        <span className="font-medium text-green-600">{formatCurrency(stats.completedAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg. Processing</span>
                                        <span className="font-medium text-gray-900">1.5 days</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <DollarSign size={16} className="text-purple-600" />
                                    Financial Summary
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Total Requested</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(stats.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg. Request</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(stats.totalAmount / stats.total || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </AdminContainer>
            </div>

            {showCompleteModal && selectedWithdrawal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Withdrawal</h3>
                        <p className="text-gray-600 mb-4">Request ID: {selectedWithdrawal.id}</p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction ID
                            </label>
                            <input
                                type="text"
                                id="completeTransactionId"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter transaction ID"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCompleteModal(false);
                                    setSelectedWithdrawal(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const transactionId = document.getElementById('completeTransactionId')?.value;
                                    handleCompleteWithdrawal(selectedWithdrawal.id, transactionId);
                                }}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawal Details Modal */}
            {showWithdrawalModal && selectedWithdrawal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Withdrawal Details</h3>
                                <p className="text-sm text-gray-500 mt-1">Request ID: {selectedWithdrawal.id}</p>
                            </div>
                            <button
                                onClick={() => setShowWithdrawalModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(selectedWithdrawal.status)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Requested: {formatDate(selectedWithdrawal.requestedAt)}
                                </div>
                            </div>

                            {/* Freelancer Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Users size={16} />
                                    Mentor Information
                                </h4>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={selectedWithdrawal.freelancer.avatar}
                                        alt={selectedWithdrawal.freelancer.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <p className="font-medium text-gray-900">{selectedWithdrawal.freelancer.name}</p>
                                            {selectedWithdrawal.freelancer.verified && (
                                                <span className="text-blue-500 text-xs">✓</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{selectedWithdrawal.freelancer.email}</p>
                                        {/* <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <MapPin size={10} />
                                            {selectedWithdrawal.freelancer.location} • Level: {selectedWithdrawal.freelancer.level}
                                        </p> */}
                                        {/* <p className="text-xs text-gray-600 mt-1">
                                            Available Balance: {formatCurrency(selectedWithdrawal.freelancer.balance)}
                                            {console.log(selectedWithdrawal.freelancer)}
                                        </p> */}
                                        <button
                                            onClick={() => {
                                                setShowWithdrawalModal(false);
                                                handleViewFreelancer(selectedWithdrawal.freelancer.id);
                                            }}
                                            className="mt-2 text-xs text-primary hover:text-primary-dark"
                                        >
                                            View Profile →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Withdrawal Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <DollarSign size={16} />
                                    Withdrawal Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Amount Requested</p>
                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedWithdrawal.amount)}</p>
                                    </div>
                                    {/* <div>
                                        <p className="text-xs text-gray-500">Platform Fee</p>
                                        <p className="text-sm text-red-600">-{formatCurrency(selectedWithdrawal.fee)}</p>
                                    </div> */}
                                    {/* <div>
                                        <p className="text-xs text-gray-500">Net Amount</p>
                                        <p className="text-sm font-medium text-green-600">{formatCurrency(selectedWithdrawal.netAmount)}</p>
                                    </div> */}
                                    <div>
                                        <p className="text-xs text-gray-500">Payment Method</p>
                                        <div className="mt-1">{getMethodBadge(selectedWithdrawal.method)}</div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs text-gray-500">Payment Method Details</p>
                                    <p className="text-sm font-medium mt-1">{selectedWithdrawal.methodDetails}</p>
                                </div>
                            </div>

                            {/* Transaction Info */}
                            {(selectedWithdrawal.status === 'completed' || selectedWithdrawal.status === 'processing') && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <CreditCard size={16} />
                                        Transaction Information
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedWithdrawal.transactionId && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Transaction ID</span>
                                                <span className="text-sm font-medium">{selectedWithdrawal.transactionId}</span>
                                            </div>
                                        )}
                                        {selectedWithdrawal.processedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Processed Date</span>
                                                <span className="text-sm font-medium">{formatDate(selectedWithdrawal.processedAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {selectedWithdrawal.status === 'rejected' && selectedWithdrawal.rejectionReason && (
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <span className="font-medium">Rejection Reason:</span> {selectedWithdrawal.rejectionReason}
                                    </p>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedWithdrawal.notes && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2 text-sm">Notes</h4>
                                    <p className="text-sm text-gray-700">{selectedWithdrawal.notes}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4">
                                {(selectedWithdrawal.status === 'pending') && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowWithdrawalModal(false);
                                                setShowProcessModal(true);
                                            }}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw size={18} />
                                            Mark as Clearing
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowWithdrawalModal(false);
                                                setShowRejectModal(true);
                                            }}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                        >
                                            <X size={18} />
                                            Reject
                                        </button>
                                    </>
                                )}

                                {(selectedWithdrawal.status === 'clearing') && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowWithdrawalModal(false);
                                                setShowCompleteModal(true);
                                            }}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            Mark as Completed
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowWithdrawalModal(false);
                                                setShowRejectModal(true);
                                            }}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                        >
                                            <X size={18} />
                                            Reject
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => {
                                        setShowWithdrawalModal(false);
                                        handleViewFreelancer(selectedWithdrawal.freelancer.id);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <Users size={18} />
                                    View Mentor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Process Withdrawal Modal */}
            {showProcessModal && selectedWithdrawal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Process Withdrawal</h3>
                        <p className="text-gray-600 mb-4">
                            Request ID: {selectedWithdrawal.id}
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Amount:</span>
                                <span className="font-bold">{formatCurrency(selectedWithdrawal.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Method:</span>
                                <span>{getMethodBadge(selectedWithdrawal.method)}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t">
                                <p className="text-xs text-gray-500">Account:</p>
                                <p className="text-sm font-medium">{selectedWithdrawal.methodDetails}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="transactionId"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter external transaction ID"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        id="markComplete"
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm text-gray-700">Mark as completed immediately</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowProcessModal(false);
                                    setSelectedWithdrawal(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const transactionId = document.getElementById('transactionId')?.value;
                                    const markComplete = document.getElementById('markComplete')?.checked;

                                    if (markComplete) {
                                        handleCompleteWithdrawal(selectedWithdrawal.id, transactionId);
                                    } else {
                                        handleProcessWithdrawal(selectedWithdrawal.id);
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                            >
                                Process
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Withdrawal Modal */}
            {showRejectModal && selectedWithdrawal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Withdrawal</h3>
                        <p className="text-gray-600 mb-4">
                            Request ID: {selectedWithdrawal.id}
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for rejection
                            </label>
                            <textarea
                                id="rejectReason"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Explain why this withdrawal is being rejected..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedWithdrawal(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const reason = document.getElementById('rejectReason').value;
                                    if (!reason) {
                                        toast.error('Please provide a reason');
                                        return;
                                    }
                                    handleRejectWithdrawal(selectedWithdrawal.id, reason);
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Withdrawals;