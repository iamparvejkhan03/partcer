import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit,
    Trash2,
    PauseCircle,
    PlayCircle,
    Copy,
    Eye,
    Search,
    Filter,
    ChevronDown,
    Star,
    Eye as ViewIcon,
    MousePointer,
    ShoppingBag,
    XCircle,
    AlertCircle,
    Clock,
    CheckCircle,
    Download,
    TrendingUp,
    Calendar,
    RefreshCw,
    Loader,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { FreelancerSidebar, FreelancerHeader, FreelancerContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const AllServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('published');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedService, setSelectedService] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [dateRange, setDateRange] = useState('90');
    const [stats, setStats] = useState({
        published: 0,
        pending: 0,
        draft: 0,
        paused: 0,
        totalViews: 0,
        totalClicks: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [performance, setPerformance] = useState([]);
    const [selectedChartMetric, setSelectedChartMetric] = useState('clicks');

    const navigate = useNavigate();

    // Fetch services on mount and when dependencies change
    useEffect(() => {
        fetchServices();
    }, [activeTab, pagination?.page]); // Refetch when tab or page changes

    const fetchServices = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                status: activeTab === 'active' ? 'published' : activeTab,
                page: pagination.page || 1,
                limit: pagination.limit || 12,
                ...(searchTerm && { search: searchTerm })
            });

            const response = await axiosInstance.get(`/api/v1/services/seller/me?${params.toString()}`);

            if (response.data?.success) {
                setServices(response.data.data.services);
                setStats(response.data.data.stats);
                setPerformance(response.data.data.performance || []);
                setPagination(prev => ({
                    page: response.data?.data?.pagination?.page ?? prev.page,
                    limit: response.data?.data?.pagination?.limit ?? prev.limit,
                    total: response.data?.data?.pagination?.total ?? prev.total,
                    pages: response.data?.data?.pagination?.pages ?? prev.pages,
                }));
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                setPagination(prev => ({ ...prev, page: 1 }));
                fetchServices();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Clear search and refetch
    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchServices();
    };

    const handleStatusChange = async (serviceId, newStatus) => {
        try {
            await axiosInstance.patch(`/api/v1/services/${serviceId}/status`, { status: newStatus });

            // Update local state
            setServices(services.map(service =>
                service._id === serviceId ? { ...service, status: newStatus } : service
            ));

            // Update stats
            setStats(prev => ({
                ...prev,
                [activeTab]: Math.max(0, prev[activeTab] - 1),
                [newStatus]: (prev[newStatus] || 0) + 1
            }));

            toast.success(`Service ${newStatus === 'published' ? 'activated' : 'paused'} successfully`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update service status');
        }
    };

    const handleDelete = async () => {
        if (!selectedService) return;

        try {
            await axiosInstance.delete(`/api/v1/services/${selectedService._id}`);

            // Update local state
            setServices(services.filter(s => s._id !== selectedService._id));

            // Update stats
            setStats(prev => ({
                ...prev,
                [selectedService.status]: Math.max(0, prev[selectedService.status] - 1)
            }));

            toast.success('Service deleted successfully');
            setShowDeleteModal(false);
            setSelectedService(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete service');
        }
    };

    const handleToggleLive = async (serviceId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'published' ? 'paused' : 'published';
            await axiosInstance.patch(`/api/v1/services/${serviceId}/status`, { status: newStatus });

            setServices(services.map(service =>
                service._id === serviceId ? { ...service, status: newStatus } : service
            ));

            toast.success(`Service is now ${newStatus === 'published' ? 'live' : 'paused'}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update service status');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const tabs = [
        { id: 'published', label: 'PUBLISHED', count: stats.published || 0 },
        { id: 'pending', label: 'PENDING APPROVAL', count: stats.pending || 0 },
        { id: 'draft', label: 'DRAFT', count: stats.draft || 0 },
        { id: 'paused', label: 'PAUSED', count: stats.paused || 0 }
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Published' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Approval' },
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
            paused: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Paused' }
        };

        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const getCTR = (service) => {
        if (!service.impressions || service.impressions === 0) return 0;
        return ((service.clicks || 0) / service.impressions * 100).toFixed(1);
    };

    const getConversionRate = (service) => {
        if (!service.clicks || service.clicks === 0) return 0;
        return ((service.totalOrders || 0) / service.clicks * 100).toFixed(1);
    };

    if (loading && services.length === 0) {
        return (
            <section className="flex min-h-screen">
                <FreelancerSidebar />
                <div className="w-full relative">
                    <FreelancerHeader />
                    <FreelancerContainer>
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-12 h-12 animate-spin text-primary" />
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Services</h1>
                            <p className="text-gray-600 mt-1">Manage your services and track performance</p>
                        </div>
                        <div className='flex items-center gap-2 mt-4 md:mt-0'>
                            <button
                                onClick={fetchServices}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            <Link
                                to="/freelancer/services/create"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                            >
                                <Plus size={18} />
                                Create Service
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 overflow-x-auto pb-2">
                        <div className="flex gap-2 min-w-max">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {tab.label} {tab.count > 0 && `(${tab.count})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle size={18} />
                                </button>
                            )}
                        </div>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Eye size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Views</p>
                                    <p className="text-xl font-bold">{formatNumber(stats.totalViews)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <MousePointer size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Clicks</p>
                                    <p className="text-xl font-bold">{formatNumber(stats.totalClicks)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <ShoppingBag size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-xl font-bold">{stats.totalOrders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <TrendingUp size={20} className="text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Revenue</p>
                                    <p className="text-xl font-bold">${formatNumber(stats.totalRevenue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SERVICE
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            IMPRESSIONS
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            CLICKS (CTR)
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ORDERS (CONV.)
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            REVENUE
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {services.length > 0 ? (
                                        services.map((service) => (
                                            <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                            {service.gallery?.[0]?.url ? (
                                                                <img
                                                                    src={service.gallery[0].url}
                                                                    alt={service.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    No image
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs text-gray-500">
                                                                    {service.category?.name || 'Uncategorized'}
                                                                    {service.subCategory && ` • ${service.subCategory.name}`}
                                                                </span>
                                                                {getStatusBadge(service.status)}
                                                            </div>
                                                            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                                                {service.title}
                                                            </h3>

                                                            {/* Rating */}
                                                            {service.rating > 0 ? (
                                                                <div className="flex items-center gap-1 mb-2">
                                                                    <div className="flex">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <Star
                                                                                key={star}
                                                                                size={14}
                                                                                className={star <= Math.round(service.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-xs text-gray-600">
                                                                        ({service.reviewCount || 0})
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="mb-2">
                                                                    <span className="text-xs text-gray-400">No reviews yet</span>
                                                                </div>
                                                            )}

                                                            {/* Action Buttons */}
                                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                <Link
                                                                    to={`/service/${service._id}`}
                                                                    target="_blank"
                                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                                >
                                                                    <Eye size={14} />
                                                                    PREVIEW
                                                                </Link>
                                                                <Link
                                                                    to={`/freelancer/services/edit/${service?._id}`}
                                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                                >
                                                                    <Edit size={14} />
                                                                    EDIT
                                                                </Link>
                                                                {service.status === 'published' ? (
                                                                    <button
                                                                        onClick={() => handleStatusChange(service._id, 'paused')}
                                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                                                    >
                                                                        <PauseCircle size={14} />
                                                                        PAUSE
                                                                    </button>
                                                                ) : service.status === 'paused' ? (
                                                                    <button
                                                                        onClick={() => handleStatusChange(service._id, 'published')}
                                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                                    >
                                                                        <PlayCircle size={14} />
                                                                        ACTIVATE
                                                                    </button>
                                                                ) : null}
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedService(service);
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    DELETE
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-medium">{formatNumber(service.impressions || service.views)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div>
                                                        <span className="font-medium">{service.clicks || 0}</span>
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            ({getCTR(service)}%)
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div>
                                                        <span className="font-medium">{service.totalOrders || 0}</span>
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            ({getConversionRate(service)}%)
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-medium">${service.totalRevenue || 0}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                        <Search size={24} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No {activeTab} services found</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm ? 'Try adjusting your search' : 'Create your first service to get started'}
                                                    </p>
                                                    {!searchTerm && (
                                                        <Link
                                                            to="/freelancer/services/create"
                                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                        >
                                                            <Plus size={16} />
                                                            Create Your First Service
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} services
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="px-4 py-2 bg-primary text-white rounded-lg">
                                        {pagination.page}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Performance Chart */}
                    {performance.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">LAST {dateRange} DAYS PERFORMANCE</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedChartMetric('views')}
                                        className={`px-3 py-1 text-sm rounded transition-colors ${selectedChartMetric === 'views'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        Views
                                    </button>
                                    <button
                                        onClick={() => setSelectedChartMetric('clicks')}
                                        className={`px-3 py-1 text-sm rounded transition-colors ${selectedChartMetric === 'clicks'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        Clicks
                                    </button>
                                    <button
                                        onClick={() => setSelectedChartMetric('orders')}
                                        className={`px-3 py-1 text-sm rounded transition-colors ${selectedChartMetric === 'orders'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        Orders
                                    </button>
                                </div>
                            </div>
                            <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                                <p className="text-gray-400">Performance chart will be implemented with a charting library</p>
                            </div>
                        </div>
                    )}
                </FreelancerContainer>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Service</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{selectedService.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AllServices;