import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    DollarSign,
    ShoppingBag,
    TrendingUp,
    TrendingDown,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    MessageSquare,
    Shield,
    Settings,
    Download,
    Calendar,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    MoreVertical,
    UserCheck,
    UserX,
    FileText,
    CreditCard,
    Activity,
    PieChart,
    BarChart3,
    Globe,
    Mail,
    Phone,
    MapPin,
    Award,
    ThumbsUp,
    ThumbsDown,
    HelpCircle
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30');
    const [activeTab, setActiveTab] = useState('overview');
    const [recentActivity, setRecentActivity] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFreelancers: 0,
        totalBuyers: 0,
        activeUsers: 0,
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalServices: 0,
        activeServices: 0,
        totalRevenue: 0,
        platformFees: 0,
        pendingPayouts: 0,
        totalOrders: 0,
        completedOrders: 0,
        disputes: 0,
        resolutionRate: 0,
        avgResponseTime: '2.5 hrs',
        userGrowth: 0,
        revenueGrowth: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Mock data for testing
            const mockStats = {
                totalUsers: 4,
                totalFreelancers: 2,
                totalBuyers: 1,
                activeUsers: 4,
                newUsersToday: 3,
                totalProjects: 2,
                activeProjects: 1,
                completedProjects: 0,
                cancelledProjects: 0,
                totalServices: 4,
                activeServices: 4,
                pendingServices: 0,
                deniedServices: 0,
                totalRevenue: 0,
                platformFees: 0,
                pendingPayouts: 0,
                totalOrders: 0,
                completedOrders: 0,
                pendingOrders: 0,
                cancelledOrders: 0,
                disputes: 0,
                resolvedDisputes: 0,
                resolutionRate: 0,
                avgResponseTime: '0',
                userGrowth: 0,
                revenueGrowth: 0,
                activeSessions: 0,
                bounceRate: 0,
                avgSessionDuration: '0'
            };

            const mockRecentActivity = [
                {
                    id: 1,
                    type: 'user_registration',
                    user: 'John Doe',
                    role: 'freelancer',
                    timestamp: '2025-02-23T09:30:00',
                    description: 'New freelancer registered'
                },
                {
                    id: 2,
                    type: 'service_approval',
                    service: 'Professional Website Design',
                    user: 'Sarah Johnson',
                    timestamp: '2025-02-23T08:45:00',
                    description: 'Service approved'
                },
                {
                    id: 3,
                    type: 'project_completed',
                    project: 'E-commerce Development',
                    user: 'Michael Chen',
                    amount: 2500,
                    timestamp: '2025-02-23T07:20:00',
                    description: 'Project completed successfully'
                },
                {
                    id: 4,
                    type: 'dispute_opened',
                    project: 'Logo Design Package',
                    user: 'Emma Wilson',
                    timestamp: '2025-02-22T16:30:00',
                    description: 'New dispute opened'
                },
                {
                    id: 5,
                    type: 'withdrawal_request',
                    user: 'David Kim',
                    amount: 1200,
                    timestamp: '2025-02-22T14:15:00',
                    description: 'Withdrawal request submitted'
                },
                {
                    id: 6,
                    type: 'user_verification',
                    user: 'Priya Patel',
                    timestamp: '2025-02-22T11:40:00',
                    description: 'User verification completed'
                }
            ];

            const mockPendingApprovals = [
                {
                    id: 1,
                    type: 'service',
                    title: 'I will develop custom blockchain application',
                    user: 'Alex Thompson',
                    userAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                    submittedAt: '2025-02-23T10:30:00',
                    category: 'Development',
                    price: 5000
                },
                {
                    id: 2,
                    type: 'service',
                    title: 'Professional video editing for YouTube',
                    user: 'Maria Garcia',
                    userAvatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg',
                    submittedAt: '2025-02-23T09:15:00',
                    category: 'Video & Animation',
                    price: 350
                },
                {
                    id: 3,
                    type: 'project',
                    title: 'Need mobile app for fitness tracking',
                    user: 'James Wilson',
                    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
                    submittedAt: '2025-02-23T08:45:00',
                    category: 'Mobile Development',
                    budget: 8000
                },
                {
                    id: 4,
                    type: 'verification',
                    title: 'Identity verification request',
                    user: 'Sarah Johnson',
                    userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                    submittedAt: '2025-02-22T16:20:00',
                    documents: ['passport.jpg', 'utility-bill.pdf']
                },
                {
                    id: 5,
                    type: 'withdrawal',
                    title: 'Withdrawal request',
                    user: 'Michael Chen',
                    userAvatar: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg',
                    submittedAt: '2025-02-22T14:30:00',
                    amount: 2500,
                    method: 'PayPal'
                }
            ];

            const mockRecentUsers = [
                {
                    id: 1,
                    name: 'Sarah Johnson',
                    email: 'sarah.j@example.com',
                    role: 'freelancer',
                    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                    joinedAt: '2025-02-23T10:30:00',
                    status: 'active',
                    verified: true,
                    location: 'United States',
                    earnings: 12500
                },
                {
                    id: 2,
                    name: 'Michael Chen',
                    email: 'michael.c@example.com',
                    role: 'buyer',
                    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                    joinedAt: '2025-02-23T09:15:00',
                    status: 'active',
                    verified: true,
                    location: 'Singapore',
                    spent: 8750
                },
                {
                    id: 3,
                    name: 'Priya Patel',
                    email: 'priya.p@example.com',
                    role: 'freelancer',
                    avatar: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg',
                    joinedAt: '2025-02-23T08:45:00',
                    status: 'pending',
                    verified: false,
                    location: 'India',
                    earnings: 0
                },
                {
                    id: 4,
                    name: 'James Wilson',
                    email: 'james.w@example.com',
                    role: 'buyer',
                    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
                    joinedAt: '2025-02-22T16:20:00',
                    status: 'active',
                    verified: true,
                    location: 'United Kingdom',
                    spent: 3400
                },
                {
                    id: 5,
                    name: 'Emma Wilson',
                    email: 'emma.w@example.com',
                    role: 'freelancer',
                    avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg',
                    joinedAt: '2025-02-22T14:30:00',
                    status: 'suspended',
                    verified: true,
                    location: 'Australia',
                    earnings: 8900
                }
            ];

            const mockRecentTransactions = [
                {
                    id: 'TXN-12345',
                    date: '2025-02-23T10:30:00',
                    user: 'Sarah Johnson',
                    userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                    type: 'service_payment',
                    amount: 500,
                    fee: 50,
                    status: 'completed',
                    project: 'Website Design'
                },
                {
                    id: 'TXN-12346',
                    date: '2025-02-23T09:45:00',
                    user: 'Michael Chen',
                    userAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                    type: 'project_payment',
                    amount: 2500,
                    fee: 250,
                    status: 'completed',
                    project: 'E-commerce Development'
                },
                {
                    id: 'TXN-12347',
                    date: '2025-02-23T08:20:00',
                    user: 'James Wilson',
                    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
                    type: 'withdrawal',
                    amount: 1200,
                    fee: 12,
                    status: 'pending',
                    project: null
                },
                {
                    id: 'TXN-12348',
                    date: '2025-02-22T16:15:00',
                    user: 'Priya Patel',
                    userAvatar: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg',
                    type: 'refund',
                    amount: 150,
                    fee: -15,
                    status: 'completed',
                    project: 'Logo Design'
                },
                {
                    id: 'TXN-12349',
                    date: '2025-02-22T14:30:00',
                    user: 'Emma Wilson',
                    userAvatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg',
                    type: 'service_payment',
                    amount: 800,
                    fee: 80,
                    status: 'completed',
                    project: 'SEO Optimization'
                }
            ];

            setStats(mockStats);
            setRecentActivity(mockRecentActivity);
            setPendingApprovals(mockPendingApprovals);
            setRecentUsers(mockRecentUsers);
            setRecentTransactions(mockRecentTransactions);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }
    };

    const getActivityIcon = (type) => {
        switch(type) {
            case 'user_registration':
                return <UserCheck size={16} className="text-green-600" />;
            case 'service_approval':
                return <CheckCircle size={16} className="text-blue-600" />;
            case 'project_completed':
                return <Briefcase size={16} className="text-purple-600" />;
            case 'dispute_opened':
                return <AlertCircle size={16} className="text-red-600" />;
            case 'withdrawal_request':
                return <DollarSign size={16} className="text-yellow-600" />;
            case 'user_verification':
                return <Shield size={16} className="text-green-600" />;
            default:
                return <Activity size={16} className="text-gray-600" />;
        }
    };

    const getTransactionStatusBadge = (status) => {
        const config = {
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
            refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Refunded' }
        };
        const badge = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getUserRoleBadge = (role) => {
        const config = {
            admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
            freelancer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Freelancer' },
            buyer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Buyer' }
        };
        const badge = config[role] || config.buyer;
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getUserStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            suspended: { bg: 'bg-red-100', text: 'text-red-700', label: 'Suspended' },
            banned: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Banned' }
        };
        const badge = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

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
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-1">Monitor platform performance and manage operations</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                                <option value="all">All time</option>
                            </select>
                            <button
                                onClick={() => fetchDashboardData()}
                                className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw size={18} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
                                    <div className="flex items-center gap-1 mt-2 text-xs">
                                        <TrendingUp size={12} className="text-green-600" />
                                        <span className="text-green-600 font-medium">+{stats.userGrowth}%</span>
                                        <span className="text-gray-500">vs last month</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users size={20} className="text-blue-600" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-3 text-xs text-gray-600">
                                <span>👤 {formatNumber(stats.totalFreelancers)} Freelancers</span>
                                <span>🛒 {formatNumber(stats.totalBuyers)} Buyers</span>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                                    <div className="flex items-center gap-1 mt-2 text-xs">
                                        <TrendingUp size={12} className="text-green-600" />
                                        <span className="text-green-600 font-medium">+{stats.revenueGrowth}%</span>
                                        <span className="text-gray-500">vs last month</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <DollarSign size={20} className="text-green-600" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-3 text-xs text-gray-600">
                                <span>💰 Fees: {formatCurrency(stats.platformFees)}</span>
                                <span>⏳ Pending: {formatCurrency(stats.pendingPayouts)}</span>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Projects & Services</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalProjects + stats.totalServices)}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Briefcase size={20} className="text-purple-600" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                <div>
                                    <span className="text-gray-500">Projects:</span>
                                    <span className="ml-1 font-medium">{stats.totalProjects}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Services:</span>
                                    <span className="ml-1 font-medium">{stats.totalServices}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Active:</span>
                                    <span className="ml-1 text-green-600">{stats.activeProjects + stats.activeServices}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Pending:</span>
                                    <span className="ml-1 text-yellow-600">{stats.pendingServices}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Orders & Disputes</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalOrders)}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <ShoppingBag size={20} className="text-orange-600" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                <div>
                                    <span className="text-gray-500">Completed:</span>
                                    <span className="ml-1 text-green-600">{stats.completedOrders}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Pending:</span>
                                    <span className="ml-1 text-yellow-600">{stats.pendingOrders}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Disputes:</span>
                                    <span className="ml-1 text-red-600">{stats.disputes}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Resolution:</span>
                                    <span className="ml-1 font-medium">{stats.resolutionRate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Pending Approvals */}
                        {/* <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Clock size={18} className="text-yellow-600" />
                                    Pending Approvals
                                    {pendingApprovals.length > 0 && (
                                        <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                            {pendingApprovals.length} new
                                        </span>
                                    )}
                                </h3>
                                <Link 
                                    to="/admin/approvals" 
                                    className="text-sm text-primary hover:text-primary-dark"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                {pendingApprovals.map((item) => (
                                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={item.userAvatar}
                                                alt={item.user}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.user}</p>
                                                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
                                                            {item.title}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(item.submittedAt)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                                        item.type === 'service' ? 'bg-blue-100 text-blue-700' :
                                                        item.type === 'project' ? 'bg-purple-100 text-purple-700' :
                                                        item.type === 'verification' ? 'bg-green-100 text-green-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                    </span>
                                                    {item.price && (
                                                        <span className="text-xs text-gray-600">
                                                            {formatCurrency(item.price)}
                                                        </span>
                                                    )}
                                                    {item.budget && (
                                                        <span className="text-xs text-gray-600">
                                                            Budget: {formatCurrency(item.budget)}
                                                        </span>
                                                    )}
                                                    {item.amount && (
                                                        <span className="text-xs text-gray-600">
                                                            Amount: {formatCurrency(item.amount)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                                                        Approve
                                                    </button>
                                                    <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                                                        Reject
                                                    </button>
                                                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        {/* Recent Activity */}
                        {/* <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Activity size={18} className="text-primary" />
                                    Recent Activity
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">{activity.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(activity.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div> */}
                    </div>

                    {/* Recent Users Table */}
                    {/* <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users size={18} className="text-primary" />
                                Recent Users
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                                    />
                                </div>
                                <Link 
                                    to="/admin/users" 
                                    className="text-sm text-primary hover:text-primary-dark"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900 flex items-center gap-1">
                                                            {user.name}
                                                            {user.verified && (
                                                                <span className="text-blue-500 text-xs">✓</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getUserRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getUserStatusBadge(user.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    {user.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(user.joinedAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-1 text-gray-600 hover:text-primary hover:bg-gray-100 rounded">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="p-1 text-gray-600 hover:text-primary hover:bg-gray-100 rounded">
                                                        <MessageSquare size={16} />
                                                    </button>
                                                    <button className="p-1 text-gray-600 hover:text-primary hover:bg-gray-100 rounded">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div> */}

                    {/* Recent Transactions */}
                    {/* <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <DollarSign size={18} className="text-green-600" />
                                Recent Transactions
                            </h3>
                            <Link 
                                to="/admin/transactions" 
                                className="text-sm text-primary hover:text-primary-dark"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">{tx.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={tx.userAvatar}
                                                        alt={tx.user}
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                    <span className="text-sm text-gray-900">{tx.user}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm capitalize text-gray-600">
                                                    {tx.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">{formatCurrency(tx.amount)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{formatCurrency(tx.fee)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getTransactionStatusBadge(tx.status)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(tx.date)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div> */}

                    {/* Quick Actions & Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-5 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80">Active Users</p>
                                    <p className="text-xl font-bold">{formatNumber(stats.activeUsers)}</p>
                                </div>
                            </div>
                            <div className="text-sm text-white/80">
                                <span className="text-white font-medium">{stats.newUsersToday}</span> new today
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Activity size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Sessions</p>
                                    <p className="text-xl font-bold text-gray-900">{formatNumber(stats.activeSessions)}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                Avg. duration: {stats.avgSessionDuration}
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Globe size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Bounce Rate</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.bounceRate}%</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {stats.bounceRate < 35 ? 'Good' : 'Needs improvement'}
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Clock size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Avg Response</p>
                                    <p className="text-xl font-bold text-gray-900">{stats.avgResponseTime}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                Support team response time
                            </div>
                        </div>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
};

export default Dashboard;