import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    TrendingUp, Award, DollarSign, Clock, Eye,
    ShoppingBag, CheckCircle, XCircle, Heart,
    MessageCircle, Star, Calendar, ArrowRight,
    RefreshCw, AlertCircle, CreditCard, MapPin,
    Package, Truck, RotateCcw, HelpCircle
} from "lucide-react";
import { BuyerSidebar, BuyerHeader, BuyerContainer, StatCard } from "../../components";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [recentOrders, setRecentOrders] = useState([]);
    const [recommendedServices, setRecommendedServices] = useState([]);
    const [recentMessages, setRecentMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // In production: const { data } = await axiosInstance.get('/api/v1/buyer/dashboard');
            
            // Mock data for testing
            const mockStats = {
                totalSpent: 0,
                thisMonthSpent: 0,
                activeOrders: 0,
                completedOrders: 0,
                pendingOrders: 0,
                totalOrders: 0,
                savedServices: 0,
                totalReviews: 0,
                avgRatingGiven: 0,
                messagesUnread: 0,
                watchlistItems: 0,
                orderSuccessRate: 0
            };

            const mockRecentOrders = [
                {
                    id: 'ORD-2246872',
                    title: 'Professional Website UI/UX Design',
                    seller: 'Amina Al-Farooqi',
                    sellerAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                    amount: 500,
                    status: 'completed',
                    date: '2025-05-19',
                    deliveryDate: '2025-05-20'
                },
                {
                    id: 'ORD-9519785',
                    title: 'Custom E-commerce Development',
                    seller: 'Kenji Nakamura',
                    sellerAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                    amount: 200,
                    status: 'active',
                    date: '2025-05-18',
                    deliveryDate: '2025-05-25'
                },
                {
                    id: 'ORD-9854988',
                    title: 'Mobile App UI/UX Design',
                    seller: 'Amirul Hassan',
                    sellerAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
                    amount: 200,
                    status: 'completed',
                    date: '2025-05-17',
                    deliveryDate: '2025-05-19'
                },
                {
                    id: 'ORD-3365479',
                    title: 'Logo Design Package',
                    seller: 'Farah Nabila',
                    sellerAvatar: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg',
                    amount: 80,
                    status: 'pending',
                    date: '2025-05-16',
                    deliveryDate: '2025-05-23'
                },
                {
                    id: 'ORD-7891389',
                    title: 'SEO Optimization Service',
                    seller: 'Layla Zahra',
                    sellerAvatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg',
                    amount: 45,
                    status: 'completed',
                    date: '2025-05-15',
                    deliveryDate: '2025-05-17'
                }
            ];

            const mockRecentMessages = [
                {
                    id: 1,
                    seller: 'Amina Al-Farooqi',
                    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                    message: 'Your website design is ready for review!',
                    time: '30 min ago',
                    unread: true,
                    orderId: 'ORD-2246872'
                },
                {
                    id: 2,
                    seller: 'Kenji Nakamura',
                    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                    message: 'I need some clarification on the payment gateway',
                    time: '5 hours ago',
                    unread: false,
                    orderId: 'ORD-9519785'
                },
                {
                    id: 3,
                    seller: 'Farah Nabila',
                    avatar: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg',
                    message: 'Thank you for the order! I\'ll start working on it today.',
                    time: '2 days ago',
                    unread: false,
                    orderId: 'ORD-3365479'
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
            title: "Total Spent",
            value: stats?.totalSpent?.toLocaleString(),
            change: "Lifetime Orders",
            icon: <DollarSign size={24} />,
            trend: "up",
            currency: "$"
        },
        {
            title: "This Month",
            value: stats?.thisMonthSpent?.toLocaleString(),
            change: `${stats?.thisMonthSpent ? Math.round((stats.thisMonthSpent/stats.totalSpent)*100) : 0}% of total`,
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
            title: "Completed",
            value: stats?.completedOrders,
            change: `${stats?.orderSuccessRate}% Success Rate`,
            icon: <CheckCircle size={24} />,
            trend: "up"
        },
        {
            title: "Pending Orders",
            value: stats?.pendingOrders,
            change: "Awaiting Confirmation",
            icon: <AlertCircle size={24} />,
            trend: "up"
        },
        {
            title: "Saved Services",
            value: stats?.savedServices,
            change: "In Your Watchlist",
            icon: <Heart size={24} />,
            trend: "up"
        },
        {
            title: "Reviews Given",
            value: stats?.totalReviews,
            change: `${stats?.avgRatingGiven} Avg. Rating`,
            icon: <Star size={24} />,
            trend: "up"
        },
        {
            title: "Unread Messages",
            value: stats?.messagesUnread,
            change: "Awaiting Reply",
            icon: <MessageCircle size={24} />,
            trend: stats?.messagesUnread > 0 ? "up" : "down"
        },
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-700' },
            completed: { label: 'Completed', bg: 'bg-blue-100', text: 'text-blue-700' },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700' },
            cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
            delivered: { label: 'Delivered', bg: 'bg-purple-100', text: 'text-purple-700' }
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
                <BuyerSidebar />
                <div className="w-full relative">
                    <BuyerHeader />
                    <BuyerContainer>
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    </BuyerContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <BuyerSidebar />
            <div className="w-full relative">
                <BuyerHeader />
                <BuyerContainer>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
                            <p className="text-gray-600 mt-1">Track your orders and discover new services.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                            <Link
                                to="/services"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                <ShoppingBag size={18} />
                                Browse Services
                            </Link>
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
                                    <Package size={18} className="text-primary" />
                                    Recent Orders
                                </h3>
                                <Link 
                                    to="/buyer/orders" 
                                    className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                                >
                                    View All <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex gap-3">
                                            <img 
                                                src={order.sellerAvatar} 
                                                alt={order.seller}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium text-gray-500">{order.id}</span>
                                                            {getStatusBadge(order.status)}
                                                        </div>
                                                        <h4 className="font-medium text-gray-900 mb-1">{order.title}</h4>
                                                        <p className="text-sm text-gray-600">Seller: {order.seller}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">${order.amount}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Del: {order.deliveryDate}</p>
                                                    </div>
                                                </div>
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
                                        Messages
                                        {stats.messagesUnread > 0 && (
                                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {stats.messagesUnread}
                                            </span>
                                        )}
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
                                                    alt={msg.seller}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {msg.seller}
                                                                {msg.unread && (
                                                                    <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                                                                )}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">Order: {msg.orderId}</p>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{msg.time}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate mt-1">{msg.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div> */}

                            {/* Order Status Summary */}
                            {/* <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Truck size={18} className="text-primary" />
                                    Order Status
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Active Orders</span>
                                        <span className="font-medium text-green-600">{stats.activeOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Completed</span>
                                        <span className="font-medium text-blue-600">{stats.completedOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Pending</span>
                                        <span className="font-medium text-yellow-600">{stats.pendingOrders}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">Total Orders</span>
                                            <span className="text-lg font-bold text-gray-900">{stats.totalOrders}</span>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link 
                            to="/buyer/orders" 
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <Package size={24} className="text-blue-600 mb-3" />
                            <h4 className="font-semibold text-gray-900 mb-1">View Orders</h4>
                            <p className="text-sm text-gray-600">{stats.activeOrders} active orders</p>
                        </Link>
                        <Link 
                            to="/watchlist" 
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <Heart size={24} className="text-red-500 mb-3" />
                            <h4 className="font-semibold text-gray-900 mb-1">Projects</h4>
                            <p className="text-sm text-gray-600">{stats.watchlistItems} posted projects</p>
                        </Link>
                        <Link 
                            to="/messages" 
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <MessageCircle size={24} className="text-green-600 mb-3" />
                            <h4 className="font-semibold text-gray-900 mb-1">Messages</h4>
                            <p className="text-sm text-gray-600">{stats.messagesUnread} unread</p>
                        </Link>
                        <Link 
                            to="/buyer/profile/settings"
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <Eye size={24} className="text-yellow-500 mb-3" />
                            <h4 className="font-semibold text-gray-900 mb-1">View Profile</h4>
                            <p className="text-sm text-gray-600">{stats.profileViews || 0} views</p>
                        </Link>
                    </div>
                </BuyerContainer>
            </div>
        </section>
    );
};

export default Dashboard;