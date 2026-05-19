import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import {
    Briefcase,
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
    Star,
    DollarSign,
    Users,
    ShoppingBag,
    TrendingUp,
    Eye as ViewIcon,
    Download,
    Plus,
    Copy,
    PauseCircle,
    PlayCircle,
    Shield,
    ShieldOff,
    Ban,
    Award,
    MessageSquare,
    FileText,
    Calendar,
    MapPin,
    Globe,
    Tag,
    Layers,
    FolderOpen,
    CheckSquare,
    XSquare,
    HelpCircle,
    Loader
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { dummyUserImg } from '../../assets';

const Services = () => {
    const [services, setServices] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [verificationFilter, setVerificationFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedService, setSelectedService] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const actionMenuRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        draft: 0,
        rejected: 0,
        featured: 0,
        reported: 0,
        categories: 0,
        totalRevenue: 0,
        totalOrders: 0,
        avgRating: 0
    });

    const navigate = useNavigate();

    // Fetch services on mount only
    useEffect(() => {
        fetchServices();
        fetchCategories();
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

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/categories/public/parents');
            if (response.data?.success) {
                setCategories(Array.isArray(response.data.data) ? response.data.data : []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/v1/services/admin/all?limit=100');

            if (response.data?.success) {
                const servicesData = response.data.data.services || [];
                setAllServices(servicesData);
                setServices(servicesData);
                calculateStats(servicesData);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleViewService = (service) => {
        setSelectedService(service);
        setShowServiceModal(true);
    };

    const calculateStats = (servicesData) => {
        const active = servicesData.filter(s => s.status === 'published');
        const featured = servicesData.filter(s => s.featured === true);
        const reported = servicesData.filter(s => (s.reports || 0) > 0);

        const stats = {
            total: servicesData.length,
            active: servicesData.filter(s => s.status === 'published').length,
            pending: servicesData.filter(s => s.status === 'pending').length,
            draft: servicesData.filter(s => s.status === 'draft').length,
            rejected: servicesData.filter(s => s.status === 'rejected').length,
            featured: featured.length,
            reported: reported.length,
            categories: [...new Set(servicesData.map(s => s.category?.name || s.category))].length,
            totalRevenue: active.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
            totalOrders: active.reduce((sum, s) => sum + (s.totalOrders || 0), 0),
            avgRating: active.length > 0
                ? (active.reduce((sum, s) => sum + (s.rating || 0), 0) / active.length).toFixed(1)
                : 0
        };
        setStats(stats);
    };

    const getStatusBadge = (status) => {
        const config = {
            published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: CheckCircle },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft', icon: FileText },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle },
            paused: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Paused', icon: PauseCircle }
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

    const getSellerLevelBadge = (level) => {
        const config = {
            top_rated: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Top Rated', icon: Award },
            level_2: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Level 2', icon: Star },
            level_1: { bg: 'bg-green-100', text: 'text-green-700', label: 'Level 1', icon: TrendingUp },
            new: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'New', icon: Users }
        };
        const badge = config[level] || config.new;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon size={10} />
                {badge.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
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

    const handleApproveService = async (serviceId) => {
        try {
            await axiosInstance.patch(`/api/v1/services/admin/${serviceId}/status`, {
                status: 'published'
            });

            setAllServices(prev => prev.map(service =>
                service._id === serviceId
                    ? { ...service, status: 'published' }
                    : service
            ));

            // Re-filter and calculate stats
            const updatedServices = allServices.map(service =>
                service._id === serviceId ? { ...service, status: 'published' } : service
            );
            filterServicesLocally(updatedServices);
            calculateStats(updatedServices);

            toast.success('Service approved successfully');
            setShowApproveModal(false);
            setSelectedService(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve service');
        }
    };

    const handleRejectService = async (serviceId, reason) => {
        if (!reason.trim()) {
            toast.error('Please provide a reason');
            return;
        }

        try {
            await axiosInstance.patch(`/api/v1/services/admin/${serviceId}/status`, {
                status: 'rejected',
                rejectionReason: reason
            });

            setAllServices(prev => prev.map(service =>
                service._id === serviceId
                    ? { ...service, status: 'rejected', rejectionReason: reason }
                    : service
            ));

            // Re-filter and calculate stats
            const updatedServices = allServices.map(service =>
                service._id === serviceId ? { ...service, status: 'rejected' } : service
            );
            filterServicesLocally(updatedServices);
            calculateStats(updatedServices);

            toast.success('Service rejected');
            setShowRejectModal(false);
            setSelectedService(null);
            setRejectReason('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject service');
        }
    };

    const handleFeatureService = async (serviceId) => {
        try {
            const service = allServices.find(s => s._id === serviceId);
            const newFeaturedStatus = !service.featured;

            await axiosInstance.patch(`/api/v1/services/admin/${serviceId}/status`, {
                featured: newFeaturedStatus
            });

            setAllServices(prev => prev.map(service =>
                service._id === serviceId
                    ? { ...service, featured: newFeaturedStatus }
                    : service
            ));

            // Re-filter and calculate stats
            const updatedServices = allServices.map(service =>
                service._id === serviceId ? { ...service, featured: newFeaturedStatus } : service
            );
            filterServicesLocally(updatedServices);
            calculateStats(updatedServices);

            toast.success(`Service ${newFeaturedStatus ? 'featured' : 'unfeatured'} successfully`);
            setShowFeatureModal(false);
            setSelectedService(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update featured status');
        }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            await axiosInstance.delete(`/api/v1/services/admin/${serviceId}`);

            const updatedServices = allServices.filter(service => service._id !== serviceId);
            setAllServices(updatedServices);
            filterServicesLocally(updatedServices);
            calculateStats(updatedServices);

            toast.success('Service deleted successfully');
            setShowDeleteModal(false);
            setSelectedService(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete service');
        }
    };

    const handleSuspendService = async (serviceId) => {
        try {
            await axiosInstance.patch(`/api/v1/services/admin/${serviceId}/status`, {
                status: 'paused'
            });

            setAllServices(prev => prev.map(service =>
                service._id === serviceId
                    ? { ...service, status: 'paused' }
                    : service
            ));

            // Re-filter and calculate stats
            const updatedServices = allServices.map(service =>
                service._id === serviceId ? { ...service, status: 'paused' } : service
            );
            filterServicesLocally(updatedServices);
            calculateStats(updatedServices);

            toast.success('Service suspended');
            setOpenActionMenu(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to suspend service');
        }
    };

    const handleActivateService = async (serviceId) => {
        try {
            await axiosInstance.patch(`/api/v1/services/admin/${serviceId}/status`, {
                status: 'published'
            });

            setAllServices(prev => prev.map(service =>
                service._id === serviceId
                    ? { ...service, status: 'published' }
                    : service
            ));

            // Re-filter and calculate stats
            const updatedServices = allServices.map(service =>
                service._id === serviceId ? { ...service, status: 'published' } : service
            );
            filterServicesLocally(updatedServices);
            calculateStats(updatedServices);

            toast.success('Service activated');
            setOpenActionMenu(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to activate service');
        }
    };

    const filterServicesLocally = (servicesToFilter = allServices) => {
        const filtered = servicesToFilter.filter(service => {
            // Search filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const matches =
                    (service.title || '').toLowerCase().includes(term) ||
                    (service.seller?.displayName || service.seller?.name || '').toLowerCase().includes(term) ||
                    (service.category?.name || service.category || '').toLowerCase().includes(term) ||
                    (service.tags || []).some(tag => tag.toLowerCase().includes(term));
                if (!matches) return false;
            }

            // Status filter
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && service.status !== 'published') return false;
                if (statusFilter === 'pending' && service.status !== 'pending') return false;
                if (statusFilter === 'draft' && service.status !== 'draft') return false;
                if (statusFilter === 'rejected' && service.status !== 'rejected') return false;
                if (statusFilter === 'paused' && service.status !== 'paused') return false;
            }

            // Category filter
            if (categoryFilter !== 'all') {
                const categoryName = service.category?.name || service.category;
                if (categoryName !== categoryFilter) return false;
            }

            // Date range filter
            if (dateRange !== 'all') {
                const days = parseInt(dateRange);
                const serviceDate = new Date(service.createdAt);
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - days);
                if (serviceDate < cutoff) return false;
            }

            return true;
        });

        setServices(filtered);
        setCurrentPage(1);
    };

    // Apply filters when any filter changes
    useEffect(() => {
        if (allServices.length > 0) {
            filterServicesLocally();
        }
    }, [searchTerm, statusFilter, categoryFilter, dateRange]);

    // Get unique categories for filter
    const categoryOptions = [...new Set(allServices.map(s => s.category?.name || s.category).filter(Boolean))];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentServices = services.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(services.length / itemsPerPage);

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
            <div className="w-full relative max-w-full overflow-x-hidden">
                <AdminHeader />
                <AdminContainer>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Service Management</h1>
                            <p className="text-gray-600 mt-1">Manage and monitor all platform services</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => fetchServices()}
                                className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw size={18} className="text-gray-600" />
                            </button>
                            <button
                                onClick={() => navigate('/admin/categories')}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Layers size={18} />
                                Categories
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Briefcase size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Total Services</p>
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
                                    <p className="text-xs text-gray-600">Active</p>
                                    <p className="text-xl font-bold">{stats.active}</p>
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
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Award size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Featured</p>
                                    <p className="text-xl font-bold">{stats.featured}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertCircle size={20} className="text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Reported</p>
                                    <p className="text-xl font-bold">{stats.reported}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <DollarSign size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Revenue</p>
                                    <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
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
                                    placeholder="Search by title, mentor, category, tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="draft">Draft</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="paused">Paused</option>
                                </select>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[150px]"
                                >
                                    <option value="all">All Categories</option>
                                    {categoryOptions.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                >
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="365">Last year</option>
                                    <option value="all">All time</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Services Table - Desktop */}
                    <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-[300px]">Service</th>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-[200px]">Mentor</th>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-[180px]">Category</th>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Price</th>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">Status</th>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-[150px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentServices.length > 0 ? (
                                        currentServices.map((service) => (
                                            <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                            {service.gallery && service.gallery.length > 0 ? (
                                                                <img
                                                                    src={service.gallery[0].url}
                                                                    alt={service.title}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                    <Briefcase size={20} className="text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="max-w-[200px]">
                                                            <div className="font-medium text-gray-900 line-clamp-2 text-sm">
                                                                {service.title}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {service.featured && (
                                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                                                                        <Award size={10} />
                                                                        Featured
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={service.seller?.profileImage || dummyUserImg}
                                                            alt={service.seller?.displayName || service.seller?.name || 'Mentor'}
                                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                            onError={(e) => e.target.src = dummyUserImg}
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900 flex items-center gap-1 text-sm">
                                                                {service.seller?.displayName || service.seller?.name || 'Unknown'}
                                                            </div>
                                                            {/* {service.seller?.freelancerType && getSellerLevelBadge(service.seller.freelancerType)} */}
                                                            {
                                                                service?.seller?.email && <p className='text-gray-500 text-xs'>{service?.seller?.email}</p>
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <div className="text-sm text-gray-900">{service.category?.name || service.category}</div>
                                                        {service.subCategory && (
                                                            <div className="text-xs text-gray-500">{service.subCategory?.name || service.subCategory}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-bold text-gray-900">
                                                        {service.packages && service.packages.length > 0
                                                            ? formatCurrency(Math.min(...service.packages.map(p => p.price)))
                                                            : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getStatusBadge(service.status)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleViewService(service)}
                                                            className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                            title="View Service"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/admin/services/edit/${service._id}`)}
                                                            className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                            title="Edit Service"
                                                        >
                                                            <Edit size={16} />
                                                        </button>

                                                        {/* Three Dots Dropdown */}
                                                        <div className="relative" data-action-menu>
                                                            <button
                                                                onClick={() => setOpenActionMenu(openActionMenu === service._id ? null : service._id)}
                                                                className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                                title="More Actions"
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>

                                                            {openActionMenu === service._id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                                    {service.status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedService(service);
                                                                                    setShowApproveModal(true);
                                                                                    setOpenActionMenu(null);
                                                                                }}
                                                                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                                                            >
                                                                                <CheckCircle size={14} />
                                                                                Approve Service
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedService(service);
                                                                                    setShowRejectModal(true);
                                                                                    setOpenActionMenu(null);
                                                                                }}
                                                                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                                                                            >
                                                                                <XCircle size={14} />
                                                                                Reject Service
                                                                            </button>
                                                                            <hr className="my-1 border-gray-200" />
                                                                        </>
                                                                    )}

                                                                    {service.status === 'published' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedService(service);
                                                                                    setShowFeatureModal(true);
                                                                                    setOpenActionMenu(null);
                                                                                }}
                                                                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                                                            >
                                                                                <Award size={14} />
                                                                                {service.featured ? 'Remove Featured' : 'Mark Featured'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleSuspendService(service._id)}
                                                                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                                                                            >
                                                                                <PauseCircle size={14} />
                                                                                Suspend
                                                                            </button>
                                                                            <hr className="my-1 border-gray-200" />
                                                                        </>
                                                                    )}

                                                                    {service.status === 'paused' && (
                                                                        <button
                                                                            onClick={() => handleActivateService(service._id)}
                                                                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                                                        >
                                                                            <PlayCircle size={14} />
                                                                            Activate
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        onClick={() => navigate(`/freelancer/${service.seller?._id}`)}
                                                                        className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                    >
                                                                        <Users size={14} />
                                                                        View Mentor
                                                                    </button>

                                                                    <hr className="my-1 border-gray-200" />

                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedService(service);
                                                                            setShowDeleteModal(true);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Briefcase size={40} className="text-gray-300 mb-3" />
                                                    <p className="text-gray-500 font-medium">No services found</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm ? 'Try adjusting your search' : 'No services match the selected filters'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {services.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, services.length)} of {services.length} services
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
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

                    {/* Services List - Mobile */}
                    <div className="md:hidden space-y-4 mb-6">
                        {currentServices.length > 0 ? (
                            currentServices.map((service) => (
                                <div key={service._id} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                            {service.gallery && service.gallery.length > 0 ? (
                                                <img
                                                    src={service.gallery[0].url}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                    <Briefcase size={20} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 line-clamp-2">{service.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {service.featured && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Award size={10} />
                                                        Featured
                                                    </span>
                                                )}
                                                {getStatusBadge(service.status)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <img
                                            src={service.seller?.profileImage || 'https://via.placeholder.com/24'}
                                            alt={service.seller?.displayName || 'Mentor'}
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                        <span className="text-sm font-medium">{service.seller?.displayName || service.seller?.name || 'Unknown'}</span>
                                        {service.seller?.freelancerType && getSellerLevelBadge(service.seller.freelancerType)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Category:</span>
                                            <span className="ml-1 text-gray-900">{service.category?.name || service.category}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Price:</span>
                                            <span className="ml-1 font-bold text-gray-900">
                                                {service.packages ? formatCurrency(Math.min(...service.packages.map(p => p.price))) : 'N/A'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Rating:</span>
                                            <span className="ml-1 flex items-center gap-1">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                {service.rating || 0} ({service.reviewCount || 0})
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Orders:</span>
                                            <span className="ml-1">{service.totalOrders || 0}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewService(service)}
                                                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/services/edit/${service._id}`)}
                                                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                            >
                                                <Edit size={18} />
                                            </button>

                                            {/* Three Dots Dropdown - Mobile */}
                                            <div className="relative" data-action-menu>
                                                <button
                                                    onClick={() => setOpenActionMenu(openActionMenu === service._id ? null : service._id)}
                                                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {openActionMenu === service._id && (
                                                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                        {service.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedService(service);
                                                                        setShowApproveModal(true);
                                                                        setOpenActionMenu(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    Approve Service
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedService(service);
                                                                        setShowRejectModal(true);
                                                                        setOpenActionMenu(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                                                                >
                                                                    <XCircle size={16} />
                                                                    Reject Service
                                                                </button>
                                                                <hr className="my-1 border-gray-200" />
                                                            </>
                                                        )}

                                                        {service.status === 'published' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedService(service);
                                                                        setShowFeatureModal(true);
                                                                        setOpenActionMenu(null);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                                                                >
                                                                    <Award size={16} />
                                                                    {service.featured ? 'Remove Featured' : 'Mark as Featured'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSuspendService(service._id)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                                                                >
                                                                    <PauseCircle size={16} />
                                                                    Suspend Service
                                                                </button>
                                                                <hr className="my-1 border-gray-200" />
                                                            </>
                                                        )}

                                                        {service.status === 'paused' && (
                                                            <button
                                                                onClick={() => handleActivateService(service._id)}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                                            >
                                                                <PlayCircle size={16} />
                                                                Activate Service
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => navigate(`/admin/users/${service.seller?._id}`)}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <Users size={16} />
                                                            View Mentor
                                                        </button>

                                                        <hr className="my-1 border-gray-200" />

                                                        <button
                                                            onClick={() => {
                                                                setSelectedService(service);
                                                                setShowDeleteModal(true);
                                                                setOpenActionMenu(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={16} />
                                                            Delete Service
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            ID: {service._id?.substring(0, 8)}...
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No services found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {searchTerm ? 'Try adjusting your search' : 'No services match the selected filters'}
                                </p>
                            </div>
                        )}

                        {/* Mobile Pagination */}
                        {services.length > 0 && (
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

                    {/* Service Statistics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Layers size={16} className="text-primary" />
                                Categories
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Categories</span>
                                    <span className="font-medium text-gray-900">{stats.categories}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Most Popular</span>
                                    <span className="font-medium text-gray-900">
                                        {categoryOptions[0] || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Average Price</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(allServices.reduce((sum, s) => {
                                            const minPrice = s.packages ? Math.min(...s.packages.map(p => p.price)) : 0;
                                            return sum + minPrice;
                                        }, 0) / (allServices.length || 1))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <ShoppingBag size={16} className="text-green-600" />
                                Orders & Revenue
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Orders</span>
                                    <span className="font-medium text-gray-900">{stats.totalOrders}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Revenue</span>
                                    <span className="font-medium text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Avg. Order Value</span>
                                    <span className="font-medium text-gray-900">
                                        {stats.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : '$0'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Star size={16} className="text-yellow-600" />
                                Ratings
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Average Rating</span>
                                    <span className="font-medium text-yellow-600 flex items-center gap-1">
                                        <Star size={14} className="fill-yellow-400" />
                                        {stats.avgRating}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Reviews</span>
                                    <span className="font-medium text-gray-900">
                                        {allServices.reduce((sum, s) => sum + (s.reviewCount || 0), 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">5-Star Services</span>
                                    <span className="font-medium text-gray-900">
                                        {allServices.filter(s => (s.rating || 0) >= 4.5).length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-600" />
                                Moderation
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Pending Review</span>
                                    <span className="font-medium text-yellow-600">{stats.pending}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Reported</span>
                                    <span className="font-medium text-red-600">{stats.reported}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Rejected</span>
                                    <span className="font-medium text-gray-600">{stats.rejected}</span>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </AdminContainer>
            </div>

            {/* Service Details Modal */}
            {showServiceModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Service Details</h3>
                                <p className="text-sm text-gray-500 mt-1">ID: {selectedService._id}</p>
                            </div>
                            <button
                                onClick={() => setShowServiceModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Service Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {selectedService.gallery && selectedService.gallery.length > 0 ? (
                                        <img
                                            src={selectedService.gallery[0].url}
                                            alt={selectedService.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <Briefcase size={30} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-lg font-bold text-gray-900">{selectedService.title}</h4>
                                        {selectedService.featured && (
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                                                <Award size={12} />
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-3 prose prose-lg">{selectedService.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {getStatusBadge(selectedService.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Seller Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Users size={16} />
                                    Seller Information
                                </h4>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={selectedService.seller?.profileImage || dummyUserImg}
                                        alt={selectedService.seller?.displayName || 'Mentor'}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/48'}
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">{selectedService.seller?.displayName || selectedService.seller?.firstName || 'Unknown'}</p>
                                            {selectedService.seller?.freelancerType && <p className='bg-green-100 py-1 px-2 rounded-full capitalize text-xs'>{selectedService.seller.freelancerType}</p>}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">Member since: {formatDate(selectedService.seller?.createdAt)}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => navigate(`/freelancer/${selectedService.seller?._id}`)}
                                                className="text-sm text-primary hover:text-primary-dark"
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Category</p>
                                    <p className="font-medium">{selectedService.category?.name || selectedService.category} {selectedService.subCategory && `• ${selectedService.subCategory.name || selectedService.subCategory}`}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Price Range</p>
                                    <p className="font-medium text-primary">
                                        {selectedService.packages ? formatCurrency(Math.min(...selectedService.packages.map(p => p.price))) : 'N/A'} - {selectedService.packages ? formatCurrency(Math.max(...selectedService.packages.map(p => p.price))) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Created</p>
                                    <p className="font-medium">{formatDateTime(selectedService.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Last Updated</p>
                                    <p className="font-medium">{formatDateTime(selectedService.updatedAt)}</p>
                                </div>
                            </div>

                            {/* Performance Stats */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <TrendingUp size={16} />
                                    Performance Metrics
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Rating</p>
                                        <p className="font-medium flex items-center gap-1">
                                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                            {selectedService.rating || 0} ({selectedService.reviewCount || 0})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Orders</p>
                                        <p className="font-medium">{selectedService.totalOrders || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Revenue</p>
                                        <p className="font-medium text-green-600">{formatCurrency(selectedService.totalRevenue || 0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Views</p>
                                        <p className="font-medium">{formatNumber(selectedService.views || 0)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            {selectedService.tags && selectedService.tags.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedService.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {selectedService.status === 'rejected' && selectedService.rejectionReason && (
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <span className="font-medium">Rejection Reason:</span> {selectedService.rejectionReason}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        window.open(`/service/${selectedService.slug}`, '_blank');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <Eye size={18} />
                                    View Service
                                </button>
                                <button
                                    onClick={() => {
                                        setShowServiceModal(false);
                                        navigate(`/admin/services/edit/${selectedService._id}`);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <Edit size={18} />
                                    Edit Service
                                </button>
                                {selectedService.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowServiceModal(false);
                                                setShowApproveModal(true);
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowServiceModal(false);
                                                setShowRejectModal(true);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Confirmation Modal */}
            {showApproveModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Service</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to approve "{selectedService.title}"? This service will become active and visible to students.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedService(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleApproveService(selectedService._id)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {showRejectModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Service</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to reject "{selectedService.title}"?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for rejection
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Provide feedback to the mentor..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedService(null);
                                    setRejectReason('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRejectService(selectedService._id, rejectReason)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feature/Unfeature Modal */}
            {showFeatureModal && selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {selectedService.featured ? 'Remove Featured Status' : 'Mark as Featured'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {selectedService.featured
                                ? `Are you sure you want to remove featured status from "${selectedService.title}"?`
                                : `Are you sure you want to mark "${selectedService.title}" as featured? This will highlight the service.`}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowFeatureModal(false);
                                    setSelectedService(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleFeatureService(selectedService._id)}
                                className={`flex-1 px-4 py-2 text-white rounded-lg ${selectedService.featured
                                    ? 'bg-gray-600 hover:bg-gray-700'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                            >
                                {selectedService.featured ? 'Remove Featured' : 'Mark Featured'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedService(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteService(selectedService._id)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default Services;