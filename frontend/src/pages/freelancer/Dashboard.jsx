import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    TrendingUp, Award, DollarSign, Clock, Eye, 
    ShoppingBag, CheckCircle, XCircle, Users,
    MessageCircle, Star, Calendar, ArrowRight,
    RefreshCw, AlertCircle, Wallet, CreditCard,
    BarChart3, PieChart, Briefcase
} from "lucide-react";
import { FreelancerSidebar, FreelancerHeader, FreelancerContainer, StatCard } from "../../components";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentMessages, setRecentMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // In production: const { data } = await axiosInstance.get('/api/v1/freelancer/dashboard');
            
            // Mock data for testing
            const mockStats = {
                totalRevenue: 0,
                thisMonthRevenue: 0,
                pendingPayouts: 0,
                activeOrders: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                totalOrders: 0,
                successRate: 0,
                avgResponseTime: '0',
                avgRating: 0,
                totalReviews: 0,
                profileViews: 0,
                totalClients: 0,
                returningClients: 0
            };

            const mockRecentOrders = [
                {
                    id: 'ORD-2246872',
                    title: 'Professional Website UI/UX Design',
                    client: 'Amina Al-Farooqi',
                    amount: 500,
                    status: 'completed',
                    date: '2025-05-19'
                },
                {
                    id: 'ORD-9519785',
                    title: 'Custom E-commerce Development',
                    client: 'Kenji Nakamura',
                    amount: 200,
                    status: 'active',
                    date: '2025-05-18'
                },
                {
                    id: 'ORD-9854988',
                    title: 'Mobile App UI/UX Design',
                    client: 'Amirul Hassan',
                    amount: 200,
                    status: 'completed',
                    date: '2025-05-17'
                },
                {
                    id: 'ORD-3365479',
                    title: 'Logo Design Package',
                    client: 'Farah Nabila',
                    amount: 80,
                    status: 'pending',
                    date: '2025-05-16'
                },
                {
                    id: 'ORD-7891389',
                    title: 'SEO Optimization Service',
                    client: 'Layla Zahra',
                    amount: 45,
                    status: 'completed',
                    date: '2025-05-15'
                }
            ];

            const mockRecentMessages = [
                {
                    id: 1,
                    client: 'Amina Al-Farooqi',
                    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                    message: 'Thanks for the great work! When can we start phase 2?',
                    time: '5 min ago',
                    unread: true
                },
                {
                    id: 2,
                    client: 'Kenji Nakamura',
                    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                    message: 'Can we schedule a quick call to discuss revisions?',
                    time: '2 hours ago',
                    unread: false
                },
                {
                    id: 3,
                    client: 'Amirul Hassan',
                    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
                    message: 'The design looks perfect! Just one small change...',
                    time: '1 day ago',
                    unread: false
                }
            ];

            setStats(mockStats);
            setRecentOrders(mockRecentOrders);
            setRecentMessages(mockRecentMessages);
            setLoading(false);

        } catch (err) {
            console.error('Fetch dashboard error:', err);
            toast.error('Failed to load dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const statsData = [
        {
            title: "Total Revenue",
            value: stats?.totalRevenue?.toLocaleString(),
            change: "Lifetime Earnings",
            icon: <DollarSign size={24} />,
            trend: "up",
            currency: "$"
        },
        {
            title: "This Month",
            value: stats?.thisMonthRevenue?.toLocaleString(),
            change: `+${stats?.thisMonthRevenue ? Math.round((stats.thisMonthRevenue/stats.totalRevenue)*100) : 0}% of total`,
            icon: <Calendar size={24} />,
            trend: "up",
            currency: "$"
        },
        {
            title: "Active Orders",
            value: stats?.activeOrders,
            change: "In Progress",
            icon: <Clock size={24} />,
            trend: "up"
        },
        {
            title: "Completed Orders",
            value: stats?.completedOrders,
            change: `${stats?.successRate}% Success Rate`,
            icon: <CheckCircle size={24} />,
            trend: "up"
        },
        {
            title: "Pending Payouts",
            value: stats?.pendingPayouts?.toLocaleString(),
            change: "Awaiting Clearance",
            icon: <Wallet size={24} />,
            trend: "up",
            currency: "$"
        },
        {
            title: "Avg. Rating",
            value: stats?.avgRating,
            change: `${stats?.totalReviews} Reviews`,
            icon: <Star size={24} />,
            trend: "up",
            suffix: "/5"
        },
        {
            title: "Total Clients",
            value: stats?.totalClients,
            change: `${stats?.returningClients} Returning`,
            icon: <Users size={24} />,
            trend: "up"
        },
        {
            title: "Profile Views",
            value: stats?.profileViews?.toLocaleString(),
            change: "Last 30 days",
            icon: <Eye size={24} />,
            trend: "up"
        },
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-700' },
            completed: { label: 'Completed', bg: 'bg-blue-100', text: 'text-blue-700' },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
            cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
                            <p className="text-gray-600 mt-1">Welcome back! Here's your performance overview.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                            <button
                                onClick={fetchDashboardData}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statsData.map(stat => (
                            <StatCard key={stat.title} {...stat} />
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Recent Orders */}
                        {/* <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <ShoppingBag size={18} className="text-primary" />
                                    Recent Orders
                                </h3>
                                <Link 
                                    to="/freelancer/orders" 
                                    className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                                >
                                    View All <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-gray-500">{order.id}</span>
                                                    {getStatusBadge(order.status)}
                                                </div>
                                                <h4 className="font-medium text-gray-900 mb-1">{order.title}</h4>
                                                <p className="text-sm text-gray-600">Client: {order.client}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">${order.amount}</p>
                                                <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Recent Messages */}
                            {/* <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <MessageCircle size={18} className="text-primary" />
                                        Recent Messages
                                    </h3>
                                    <Link 
                                        to="/messages" 
                                        className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                                    >
                                        View All <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {recentMessages.map((msg) => (
                                        <div key={msg.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex gap-3">
                                                <img 
                                                    src={msg.avatar} 
                                                    alt={msg.client}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-gray-900 truncate">
                                                            {msg.client}
                                                        </h4>
                                                        <span className="text-xs text-gray-500">{msg.time}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                                                    {msg.unread && (
                                                        <span className="inline-block mt-1 w-2 h-2 bg-primary rounded-full"></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div> */}

                            {/* Quick Stats */}
                            {/* <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChart3 size={18} className="text-primary" />
                                    Quick Insights
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Avg. Response Time</span>
                                        <span className="font-medium text-gray-900">{stats.avgResponseTime}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Completed Orders</span>
                                        <span className="font-medium text-gray-900">{stats.completedOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Active Orders</span>
                                        <span className="font-medium text-green-600">{stats.activeOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Cancelled Orders</span>
                                        <span className="font-medium text-red-600">{stats.cancelledOrders}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">Success Rate</span>
                                            <span className="text-lg font-bold text-primary">{stats.successRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Bottom Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link 
                            to="/freelancer/services/create" 
                            className="bg-gradient-to-br from-primary to-primary-dark text-white p-5 rounded-xl hover:shadow-lg transition-shadow"
                        >
                            <Briefcase size={24} className="mb-3" />
                            <h4 className="font-semibold mb-1">Create New Service</h4>
                            <p className="text-sm text-white/80">List a new service for clients</p>
                        </Link>
                        <Link 
                            to="/freelancer/finance/withdrawals" 
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <DollarSign size={24} className="text-green-600 mb-3" />
                            <h4 className="font-semibold text-gray-900 mb-1">View All Services</h4>
                            <p className="text-sm text-gray-600">Check all the services you created</p>
                        </Link>
                        <Link 
                            to="/freelancer/orders/all" 
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <TrendingUp size={24} className="text-blue-600 mb-3" />
                            <h4 className="font-semibold text-gray-900 mb-1">View Orders</h4>
                            <p className="text-sm text-gray-600">Track your performance</p>
                        </Link>
                        <Link 
                            to="/freelancer/profile/settings" 
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <Eye size={24} className="text-purple-600 mb-3" />
                            <h4 className="font-semibold text-gray-900 mb-1">View Profile</h4>
                            <p className="text-sm text-gray-600">{stats.profileViews} views</p>
                        </Link>
                    </div>
                </FreelancerContainer>
            </div>
        </section>
    );
};

export default Dashboard;