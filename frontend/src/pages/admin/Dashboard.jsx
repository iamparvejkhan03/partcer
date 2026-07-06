import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  LoadingSpinner, 
  AdminContainer, 
  AdminHeader, 
  AdminSidebar 
} from "../../components";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  ShoppingBag,
  Star,
  Clock,
  CheckCircle,
  UserCheck,
  UserX,
  Activity,
  Award,
  Settings,
  MessageSquare,
  Shield,
  FileText,
  CreditCard,
  Handshake,
  UserCircle,
  BanknoteArrowDown,
  Building
} from "lucide-react";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    users: {},
    services: {},
    orders: {},
    reviews: {},
    transactions: {}
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/v1/dashboard/admin');
      if (data.success) {
        setDashboardData(data.data);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard stats error:", error);
      toast.error("Error loading dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Build stats cards from real data
  const statsCards = [
    {
      title: "Total Users",
      value: formatNumber(dashboardData.users?.total),
      change: `+${dashboardData.users?.newToday || 0} today`,
      icon: <Users size={24} />,
      trend: "up",
      description: "All registered users"
    },
    {
      title: "Mentors",
      value: formatNumber(dashboardData.users?.freelancers),
      change: `${dashboardData.users?.active || 0} active`,
      icon: <UserCheck size={24} />,
      trend: "up",
      description: "Service providers"
    },
    {
      title: "Students",
      value: formatNumber(dashboardData.users?.buyers),
      change: `${dashboardData.users?.newThisWeek || 0} this week`,
      icon: <ShoppingBag size={24} />,
      trend: "up",
      description: "Service buyers"
    },
    {
      title: "Agencies",
      value: formatNumber(dashboardData.users?.agencies),
      change: `${dashboardData.users?.newThisWeek || 0} this week`,
      icon: <Building size={24} />,
      trend: "up",
      description: "Service agencies"
    },
    {
      title: "Active Users",
      value: formatNumber(dashboardData.users?.active),
      change: `${dashboardData.users?.inactive || 0} inactive`,
      icon: <Activity size={24} />,
      trend: "up",
      description: "Currently active"
    },
    {
      title: "Total Orders",
      value: formatNumber(dashboardData.orders?.total),
      change: `${dashboardData.orders?.completed || 0} completed`,
      icon: <ShoppingBag size={24} />,
      trend: "up",
      description: "All-time orders"
    },
    {
      title: "Completed Orders",
      value: formatNumber(dashboardData.orders?.completed),
      change: `${dashboardData.orders?.inProgress || 0} in progress`,
      icon: <CheckCircle size={24} />,
      trend: "up",
      description: "Successfully delivered"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardData.orders?.totalRevenue),
      change: `This month: ${formatCurrency(dashboardData.orders?.revenueThisMonth)}`,
      icon: <DollarSign size={24} />,
      trend: "up",
      description: "Platform revenue"
    },
    {
      title: "Avg. Order Value",
      value: formatCurrency(dashboardData.orders?.averageOrderValue),
      change: "Per transaction",
      icon: <TrendingUp size={24} />,
      trend: "up",
      description: "Average sale amount"
    },
    {
      title: "Total Reviews",
      value: formatNumber(dashboardData.reviews?.total),
      change: `⭐ ${(dashboardData.reviews?.averageRating || 0).toFixed(1)} avg rating`,
      icon: <Star size={24} />,
      trend: "up",
      description: "User feedback"
    },
    {
      title: "Pending Payouts",
      value: (dashboardData.transactions?.pendingPayouts),
      change: "To be processed",
      icon: <CreditCard size={24} />,
      trend: "down",
      description: "Awaiting withdrawal"
    },
    {
      title: "Total Withdrawn",
      value: formatCurrency(dashboardData.transactions?.totalWithdrawn),
      change: "All-time payouts",
      icon: <Handshake size={24} />,
      trend: "up",
      description: "Paid to freelancers"
    },
    {
      title: "Pending Users",
      value: formatNumber(dashboardData.users?.pendingVerifications),
      change: "ID/email checks",
      icon: <Shield size={24} />,
      trend: "down",
      description: "Awaiting verification"
    }
  ];

  // Get top category from services data
  const topCategory = dashboardData.services?.topCategories?.[0];
  
  // Get monthly revenue trend for the highlight section
  const monthlyTrend = dashboardData.orders?.monthlyTrend || [];
  const latestMonth = monthlyTrend[0];
  const revenueChange = latestMonth 
    ? ((latestMonth.revenue - (monthlyTrend[1]?.revenue || 0)) / (monthlyTrend[1]?.revenue || 1)) * 100 
    : 0;

  return (
    <section className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="w-full relative">
        <AdminHeader />
        <AdminContainer>
          <div className="max-w-full pt-16 pb-7 md:pt-0">
            <div className="flex items-center gap-3 mb-2">
              <Activity size={32} className="text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h2>
            </div>
            <p className="text-gray-600">Monitor platform performance and manage operations</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                        <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        stat.trend === 'up' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {stat.icon}
                      </div>
                    </div>
                    {/* {stat.change && (
                      <p className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </p>
                    )} */}
                  </div>
                ))}
              </div>

              {/* Highlight Section: Top Category or Revenue Growth */}
              {topCategory && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-200 mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={20} className="text-primary" />
                        <h3 className="text-lg font-semibold text-gray-900">Most Popular Category</h3>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {topCategory._id}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {topCategory.count} active services · {((topCategory.count / dashboardData.services?.total) * 100).toFixed(1)}% of all services
                      </p>
                    </div>
                    <div className="hidden md:block bg-primary/10 p-3 rounded-lg">
                      <Award size={32} className="text-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Trend Highlight (optional) */}
              {latestMonth && revenueChange !== 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-200 mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={20} className="text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(latestMonth.revenue)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {latestMonth._id} · {revenueChange > 0 ? '+' : ''}{revenueChange.toFixed(1)}% from previous month
                      </p>
                    </div>
                    <div className="hidden md:block bg-green-100 p-3 rounded-lg">
                      <DollarSign size={32} className="text-green-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-8 mb-16">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Link 
                      to="/admin/users/all" 
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors group"
                    >
                      <Users size={24} className="mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-blue-800">User Management</p>
                    </Link>
                    
                    <Link 
                      to="/admin/orders" 
                      className="bg-green-50 border border-green-200 rounded-lg p-4 text-center hover:bg-green-100 transition-colors group"
                    >
                      <ShoppingBag size={24} className="mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-green-800">Order Oversight</p>
                    </Link>
                    <Link 
                      to="/admin/projects/all" 
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center hover:bg-yellow-100 transition-colors group"
                    >
                      <Briefcase size={24} className="mx-auto mb-2 text-yellow-600 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-yellow-800">Project Management</p>
                    </Link>
                    <Link 
                      to="/admin/transactions" 
                      className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center hover:bg-indigo-100 transition-colors group"
                    >
                      <DollarSign size={24} className="mx-auto mb-2 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-indigo-800">Transactions</p>
                    </Link>
                    <Link 
                      to="/admin/withdrawals" 
                      className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center hover:bg-indigo-100 transition-colors group"
                    >
                      <BanknoteArrowDown size={24} className="mx-auto mb-2 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-indigo-800">Withdrawals</p>
                    </Link>
                    <Link 
                      to="/admin/profile" 
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors group"
                    >
                      <UserCircle size={24} className="mx-auto mb-2 text-gray-600 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium text-gray-800">Profile Settings</p>
                    </Link>
                  </div>
                </div>

                {/* Platform Health / Recent Activity Summary */}
                {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="text-gray-600">Completion Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {dashboardData.orders?.total 
                            ? ((dashboardData.orders.completed / dashboardData.orders.total) * 100).toFixed(1)
                            : 0}%
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${dashboardData.orders?.total 
                              ? (dashboardData.orders.completed / dashboardData.orders.total) * 100 
                              : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="text-gray-600">User Verification Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {dashboardData.users?.total 
                            ? (((dashboardData.users.total - dashboardData.users.pendingVerifications) / dashboardData.users.total) * 100).toFixed(1)
                            : 0}%
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${dashboardData.users?.total 
                              ? ((dashboardData.users.total - dashboardData.users.pendingVerifications) / dashboardData.users.total) * 100 
                              : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="text-gray-600">Avg Response Time</span>
                      <span className="font-semibold text-gray-900">2.5 hrs</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-600">Active Users %</span>
                      <span className="font-semibold text-gray-900">
                        {dashboardData.users?.total 
                          ? ((dashboardData.users.active / dashboardData.users.total) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div> */}
              </div>
            </>
          )}
        </AdminContainer>
      </div>
    </section>
  );
};

export default Dashboard;