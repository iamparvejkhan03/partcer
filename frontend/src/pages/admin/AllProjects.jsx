import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Briefcase,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Star,
    Users,
    TrendingUp,
    PauseCircle,
    PlayCircle,
    Award,
    FileText,
    Calendar,
    Layers,
    FolderOpen,
    UserCheck,
    UserX,
    X,
    Loader,
    Wrench,
    Tag
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { userTypes } from '../../assets';

const AllProjects = () => {
    const [projects, setProjects] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [showProposalsModal, setShowProposalsModal] = useState(false);
    const [proposals, setProposals] = useState([]);
    const [loadingProposals, setLoadingProposals] = useState(false);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        draft: 0,
        filled: 0,
        totalProposals: 0,
        totalViews: 0
    });

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Helper functions for new model
    const getPeriodLabel = (period) => {
        const map = {
            one_time: 'One-time',
            per_day: 'Per day',
            weekly: 'Weekly',
            monthly: 'Monthly'
        };
        return map[period] || period;
    };

    const getDurationLabel = (period, duration) => {
        if (period === 'one_time') return 'Single session';
        if (duration === 'standard') return 'Standard (2-3 hrs)';
        return 'Full day (6-8 hrs)';
    };

    const getServiceDisplay = (service) => {
        return service || 'N/A';
    };

    // Get page from URL
    useEffect(() => {
        const page = searchParams.get('page');
        if (page) {
            setCurrentPage(parseInt(page));
        }
    }, [searchParams]);

    // Fetch projects on mount
    useEffect(() => {
        fetchProjects();
        fetchCategories();
    }, []);

    // Fetch projects when pagination changes
    useEffect(() => {
        if (!loading) {
            fetchProjects();
        }
    }, [currentPage]);

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

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);

            const response = await axiosInstance.get(`/api/v1/projects/admin/all?${params.toString()}`);

            if (response.data.success) {
                const { projects: fetchedProjects, stats: fetchedStats, pagination } = response.data.data;

                setProjects(fetchedProjects || []);
                setAllProjects(fetchedProjects || []);

                const statsData = fetchedStats || [];
                const calculatedStats = {
                    total: pagination?.total || 0,
                    active: statsData.find(s => s._id === 'active')?.count || 0,
                    pending: statsData.find(s => s._id === 'pending')?.count || 0,
                    completed: statsData.find(s => s._id === 'completed')?.count || 0,
                    cancelled: statsData.find(s => s._id === 'cancelled')?.count || 0,
                    draft: statsData.find(s => s._id === 'draft')?.count || 0,
                    filled: statsData.find(s => s._id === 'filled')?.count || 0,
                    totalProposals: statsData.reduce((sum, s) => sum + (s.totalProposals || 0), 0),
                    totalViews: statsData.reduce((sum, s) => sum + (s.totalViews || 0), 0)
                };
                setStats(calculatedStats);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load projects');
            setProjects([]);
            setAllProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/categories/public/parents');
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProjectProposals = async (projectId) => {
        try {
            setLoadingProposals(true);
            const response = await axiosInstance.get(`/api/v1/projects/admin/${projectId}/proposals`);

            if (response.data.success) {
                setProposals(response.data.data?.proposals || []);
            }
        } catch (error) {
            console.error('Error fetching proposals:', error);
            toast.error('Failed to load proposals');
            setProposals([]);
        } finally {
            setLoadingProposals(false);
        }
    };

    const handleApproveProject = async (projectId) => {
        try {
            await axiosInstance.patch(`/api/v1/projects/admin/${projectId}/status`, {
                status: 'active'
            });
            toast.success('Project approved successfully');
            setShowApproveModal(false);
            setSelectedProject(null);
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to approve project';
            toast.error(errorMessage);
        }
    };

    const handleRejectProject = async (projectId, reason) => {
        try {
            await axiosInstance.patch(`/api/v1/projects/admin/${projectId}/status`, {
                status: 'rejected',
                cancellationReason: reason
            });
            toast.success('Project rejected');
            setShowRejectModal(false);
            setSelectedProject(null);
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to reject project';
            toast.error(errorMessage);
        }
    };

    const handleSuspendProject = async (projectId) => {
        try {
            await axiosInstance.patch(`/api/v1/projects/admin/${projectId}/status`, {
                status: 'suspended'
            });
            toast.success('Project suspended');
            setOpenActionMenu(null);
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to suspend project';
            toast.error(errorMessage);
        }
    };

    const handleActivateProject = async (projectId) => {
        try {
            await axiosInstance.patch(`/api/v1/projects/admin/${projectId}/status`, {
                status: 'active'
            });
            toast.success('Project activated');
            setOpenActionMenu(null);
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to activate project';
            toast.error(errorMessage);
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            await axiosInstance.delete(`/api/v1/projects/admin/${projectId}`);
            toast.success('Project deleted successfully');
            setShowDeleteModal(false);
            setSelectedProject(null);
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to delete project';
            toast.error(errorMessage);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: CheckCircle },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: CheckCircle },
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft', icon: FileText },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: XCircle },
            suspended: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Suspended', icon: PauseCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle },
            filled: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Filled', icon: UserCheck }
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

    // Local filtering
    const getFilteredProjects = () => {
        let filtered = [...projects];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(project =>
                project.title?.toLowerCase().includes(term) ||
                project.buyer?.displayName?.toLowerCase().includes(term) ||
                project.buyer?.firstName?.toLowerCase().includes(term) ||
                project.buyer?.lastName?.toLowerCase().includes(term) ||
                project.category?.name?.toLowerCase().includes(term) ||
                project.service?.toLowerCase().includes(term) ||
                project.skills?.some(skill =>
                    typeof skill === 'string'
                        ? skill.toLowerCase().includes(term)
                        : skill.name?.toLowerCase().includes(term)
                )
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(project => project.status === statusFilter);
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(project =>
                project.category?._id === categoryFilter ||
                project.category === categoryFilter
            );
        }

        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            filtered = filtered.filter(project => new Date(project.createdAt) >= cutoff);
        }

        return filtered;
    };

    const filteredProjects = getFilteredProjects();
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

    const handleViewProject = (project) => {
        setSelectedProject(project);
        setShowProjectModal(true);
    };

    const handleViewProposals = async (project) => {
        setSelectedProject(project);
        setShowProposalsModal(true);
        await fetchProjectProposals(project._id);
    };

    const handleEditProject = (projectId) => {
        navigate(`/admin/projects/edit/${projectId}`);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        setSearchParams({ page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRefresh = () => {
        fetchProjects();
        toast.success('Projects refreshed');
    };

    if (loading && projects.length === 0) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center h-64">
                            <Loader className="animate-spin h-12 w-12 text-primary" />
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
                    <div className="w-full max-w-full">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Project Management</h1>
                                <p className="text-gray-600 mt-1">Manage and monitor all platform projects</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw size={18} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
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

                        {/* Stats Cards - Updated for new model */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Briefcase size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Total Projects</p>
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
                                        <p className="text-xs text-gray-600">Active</p>
                                        <p className="text-xl font-bold">{stats.active}</p>
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
                                        <Users size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Interested</p>
                                        <p className="text-xl font-bold">{stats.totalProposals}</p>
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
                                        placeholder="Search by title, student, service, skills..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {/* <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="draft">Draft</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="filled">Filled</option>
                                        <option value="rejected">Rejected</option>
                                    </select> */}
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => {
                                            setCategoryFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[150px]"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Projects Table - Desktop */}
                        <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[300px]">Project</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[180px]">{userTypes?.buyer}</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[140px]">Service / Period</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Interested</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Posted</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[100px]">Status</th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-[120px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredProjects.length > 0 ? (
                                            filteredProjects.map((project) => (
                                                <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                                {project.gallery?.[0]?.url ? (
                                                                    <img
                                                                        src={project.gallery[0].url}
                                                                        alt={project.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                                        <Briefcase size={20} className="text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="max-w-[250px]">
                                                                <div className="font-medium text-gray-900 line-clamp-2 text-sm">
                                                                    {project.title}
                                                                </div>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {project.skills?.slice(0, 2).map((skill, idx) => (
                                                                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                                            {typeof skill === 'string' ? skill : skill.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {project.buyer?.profileImage ? (
                                                                <img
                                                                    src={project.buyer.profileImage}
                                                                    alt={project.buyer.displayName || ` ${userTypes?.buyer}`}
                                                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                                    <Users size={14} className="text-gray-500" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-medium text-gray-900 flex items-center gap-1 text-sm">
                                                                    {project.buyer?.displayName ||
                                                                        `${project.buyer?.firstName || ''} ${project.buyer?.lastName || ''}`.trim() ||
                                                                        'N/A'}
                                                                    {project.buyer?.isVerified && (
                                                                        <CheckCircle size={12} className="text-blue-500" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{getServiceDisplay(project.service)}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {getPeriodLabel(project.period)} · {getDurationLabel(project.period, project.duration)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                                                                <Users size={12} className="flex-shrink-0" />
                                                                <span>{project.proposalsCount || 0} interested</span>
                                                            </div>
                                                            {/* {project.proposals?.filter(p => p.status === 'pending').length > 0 && (
                                                                <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                                                                    <Clock size={12} className="flex-shrink-0 text-yellow-600" />
                                                                    <span>{project.proposals.filter(p => p.status === 'pending').length} pending</span>
                                                                </div>
                                                            )} */}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm text-gray-600">
                                                            {formatDate(project.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {getStatusBadge(project.status)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleViewProject(project)}
                                                                className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                                title="View Details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditProject(project._id)}
                                                                className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                                title="Edit Project"
                                                            >
                                                                <Edit size={16} />
                                                            </button>

                                                            {/* Three Dots Dropdown */}
                                                            <div className="relative" data-action-menu>
                                                                <button
                                                                    onClick={() => setOpenActionMenu(openActionMenu === project._id ? null : project._id)}
                                                                    className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                                    title="More Actions"
                                                                >
                                                                    <MoreVertical size={16} />
                                                                </button>

                                                                {openActionMenu === project._id && (
                                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                                        {project.status === 'pending' && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedProject(project);
                                                                                        setShowApproveModal(true);
                                                                                        setOpenActionMenu(null);
                                                                                    }}
                                                                                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                                                                >
                                                                                    <CheckCircle size={14} />
                                                                                    Approve
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedProject(project);
                                                                                        setShowRejectModal(true);
                                                                                        setOpenActionMenu(null);
                                                                                    }}
                                                                                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                                                                                >
                                                                                    <XCircle size={14} />
                                                                                    Reject
                                                                                </button>
                                                                                <hr className="my-1 border-gray-200" />
                                                                            </>
                                                                        )}

                                                                        {/* {project.status === 'active' && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedProject(project);
                                                                                        setShowSuspendModal(true);
                                                                                        setOpenActionMenu(null);
                                                                                    }}
                                                                                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                                                                                >
                                                                                    <PauseCircle size={14} />
                                                                                    Suspend
                                                                                </button>
                                                                                <hr className="my-1 border-gray-200" />
                                                                            </>
                                                                        )} */}

                                                                        {project.status === 'suspended' && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    handleActivateProject(project._id);
                                                                                }}
                                                                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                                                            >
                                                                                <PlayCircle size={14} />
                                                                                Activate
                                                                            </button>
                                                                        )}

                                                                        <button
                                                                            onClick={() => navigate(`/project/${project._id}`)}
                                                                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                        >
                                                                            <FolderOpen size={14} />
                                                                            View Project
                                                                        </button>

                                                                        <button
                                                                            onClick={() => handleViewProposals(project)}
                                                                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                        >
                                                                            <Users size={14} />
                                                                            View Interested
                                                                        </button>

                                                                        <hr className="my-1 border-gray-200" />

                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedProject(project);
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
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <Briefcase size={40} className="text-gray-300 mb-3" />
                                                        <p className="text-gray-500 font-medium">No projects found</p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            {searchTerm ? 'Try adjusting your search' : 'No projects match the selected filters'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {filteredProjects.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm text-gray-500">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-sm">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Projects List - Mobile */}
                        <div className="md:hidden space-y-4 mb-6">
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map((project) => (
                                    <div key={project._id} className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex gap-3 mb-3">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                {project.gallery?.[0]?.url ? (
                                                    <img
                                                        src={project.gallery[0].url}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <Briefcase size={24} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">{project.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getStatusBadge(project.status)}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {project.buyer?.profileImage ? (
                                                        <img
                                                            src={project.buyer.profileImage}
                                                            alt={project.buyer.displayName || ` ${userTypes?.buyer}`}
                                                            className="w-4 h-4 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <Users size={8} className="text-gray-500" />
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-gray-600">
                                                        {project.buyer?.displayName ||
                                                            `${project.buyer?.firstName || ''} ${project.buyer?.lastName || ''}`.trim() ||
                                                            'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                            <div>
                                                <span className="text-gray-500">Service:</span>
                                                <span className="ml-1 font-medium">{getServiceDisplay(project.service)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Period:</span>
                                                <span className="ml-1">{getPeriodLabel(project.period)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Interested:</span>
                                                <span className="ml-1">{project.proposalsCount || 0}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Posted:</span>
                                                <span className="ml-1">{formatDate(project.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {project.skills?.slice(0, 3).map((skill, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                    {typeof skill === 'string' ? skill : skill.name}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between border-t pt-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewProject(project)}
                                                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditProject(project._id)}
                                                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenActionMenu(openActionMenu === project._id ? null : project._id)}
                                                        className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {openActionMenu === project._id && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                            {project.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedProject(project);
                                                                            setShowApproveModal(true);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                                                    >
                                                                        <CheckCircle size={14} />
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedProject(project);
                                                                            setShowRejectModal(true);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                                                                    >
                                                                        <XCircle size={14} />
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => navigate(`/project/${project._id}`)}
                                                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <FolderOpen size={14} />
                                                                View Project
                                                            </button>
                                                            <button
                                                                onClick={() => handleViewProposals(project)}
                                                                className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Users size={14} />
                                                                View Interested
                                                            </button>
                                                            <hr className="my-1 border-gray-200" />
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedProject(project);
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
                                            <span className="text-xs text-gray-400">
                                                ID: {project._id.slice(-6)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                    <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No projects found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {searchTerm ? 'Try adjusting your search' : 'No projects match the selected filters'}
                                    </p>
                                </div>
                            )}

                            {/* Mobile Pagination */}
                            {filteredProjects.length > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </AdminContainer>
            </div>

            {/* Project Details Modal - Updated for new model */}
            {showProjectModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Project Details</h3>
                                <p className="text-sm text-gray-500 mt-1">ID: {selectedProject._id}</p>
                            </div>
                            <button
                                onClick={() => setShowProjectModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Project Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {selectedProject.gallery?.[0]?.url ? (
                                        <img
                                            src={selectedProject.gallery[0].url}
                                            alt={selectedProject.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <Briefcase size={30} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-gray-900">{selectedProject.title}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        {getStatusBadge(selectedProject.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h5 className="font-medium text-gray-700 mb-2">Description</h5>
                                <div
                                    className="prose max-w-none text-gray-700 text-sm"
                                    dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                                />
                            </div>

                            {/* Buyer Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Users size={16} />
                                    {userTypes?.buyer} Information
                                </h4>
                                <div className="flex items-start gap-3">
                                    {selectedProject.buyer?.profileImage ? (
                                        <img
                                            src={selectedProject.buyer.profileImage}
                                            alt={selectedProject.buyer.displayName || ` ${userTypes?.buyer}`}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <Users size={20} className="text-gray-500" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">
                                                {selectedProject.buyer?.displayName ||
                                                    `${selectedProject.buyer?.firstName || ''} ${selectedProject.buyer?.lastName || ''}`.trim() ||
                                                    'N/A'}
                                            </p>
                                            {selectedProject.buyer?.isVerified && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        {selectedProject.buyer?.email && (
                                            <p className="text-sm text-gray-600">{selectedProject.buyer.email}</p>
                                        )}
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        className={star <= Math.round(selectedProject.buyer.rating || 0)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium">{selectedProject.buyer.rating || 0}</span>
                                            <span className="text-xs text-gray-500">({selectedProject.buyer.reviewCount || 0} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Details Grid - Updated */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Category</p>
                                    <p className="font-medium">{selectedProject.category?.name || selectedProject.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Service</p>
                                    <p className="font-medium">{getServiceDisplay(selectedProject.service)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Period</p>
                                    <p className="font-medium">{getPeriodLabel(selectedProject.period)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Duration</p>
                                    <p className="font-medium">{getDurationLabel(selectedProject.period, selectedProject.duration)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Created</p>
                                    <p className="font-medium">{formatDateTime(selectedProject.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Last Updated</p>
                                    <p className="font-medium">{formatDateTime(selectedProject.updatedAt)}</p>
                                </div>
                            </div>

                            {/* Skills */}
                            {selectedProject.skills && selectedProject.skills.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Skills Required</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.skills.map((skill, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                {typeof skill === 'string' ? skill : skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Info */}
                            {selectedProject.additionalInfo && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Additional Information</p>
                                    <p className="text-sm text-gray-700">{selectedProject.additionalInfo}</p>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <TrendingUp size={16} />
                                    Project Statistics
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Views</p>
                                        <p className="font-medium">{formatNumber(selectedProject.views)}</p>
                                    </div>
                                    {/* <div>
                                        <p className="text-xs text-gray-500">Saves</p>
                                        <p className="font-medium">{selectedProject.saves || 0}</p>
                                    </div> */}
                                    <div>
                                        <p className="text-xs text-gray-500">Interested</p>
                                        <p className="font-medium">{selectedProject.proposalsCount || 0}</p>
                                    </div>
                                    {/* <div>
                                        <p className="text-xs text-gray-500">Accepted</p>
                                        <p className="font-medium">{selectedProject.proposals?.filter(p => p.status === 'accepted').length || 0}</p>
                                    </div> */}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4">
                                <button
                                    onClick={() => handleEditProject(selectedProject._id)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <Edit size={18} />
                                    Edit Project
                                </button>
                                <button
                                    onClick={() => {
                                        setShowProjectModal(false);
                                        handleViewProposals(selectedProject);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <Users size={18} />
                                    View Interested
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Proposals/Interested Modal - Updated */}
            {showProposalsModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Interested Mentors</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedProject.title}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowProposalsModal(false);
                                    setProposals([]);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {loadingProposals ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader className="animate-spin h-8 w-8 text-primary" />
                                </div>
                            ) : (
                                <>
                                    {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Total Interested</p>
                                            <p className="text-xl font-bold">{proposals.length}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Pending</p>
                                            <p className="text-xl font-bold text-yellow-600">
                                                {proposals.filter(p => p.status === 'pending').length}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Accepted</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {proposals.filter(p => p.status === 'accepted').length}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Rejected</p>
                                            <p className="text-xl font-bold text-red-600">
                                                {proposals.filter(p => p.status === 'rejected').length}
                                            </p>
                                        </div>
                                    </div> */}

                                    {proposals.length > 0 ? (
                                        <div className="space-y-4">
                                            {proposals.map((proposal) => (
                                                <div key={proposal._id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                        <div className="flex items-start gap-3 md:w-1/3">
                                                            {proposal.freelancerAvatar ? (
                                                                <img
                                                                    src={proposal.freelancerAvatar}
                                                                    alt={proposal.freelancerName}
                                                                    className="w-12 h-12 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <Users size={20} className="text-gray-500" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{proposal.freelancerName}</h4>
                                                                <p className="text-sm text-gray-600">{proposal.freelancer?.title || 'Mentor'}</p>
                                                                <div className="flex items-center gap-1 mt-1">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        className={star <= Math.round(proposal.freelancer.rating || 0)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium">{proposal.freelancer.rating || 0}</span>
                                            <span className="text-xs text-gray-500">({proposal.freelancer.reviewCount || 0} reviews)</span>
                                        </div>
                                                                {/* <div className="mt-1">
                                                                    {proposal.status === 'pending' && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                                            Pending
                                                                        </span>
                                                                    )}
                                                                    {proposal.status === 'accepted' && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                                            Accepted
                                                                        </span>
                                                                    )}
                                                                    {proposal.status === 'rejected' && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                                                            Rejected
                                                                        </span>
                                                                    )}
                                                                </div> */}
                                                            </div>
                                                        </div>

                                                        <div className="md:w-2/3 space-y-2">
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">Period:</span>
                                                                    <span className="ml-1 font-medium capitalize">{getPeriodLabel(proposal.selectedPeriod)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Duration:</span>
                                                                    <span className="ml-1">{proposal.selectedDuration === 'standard' ? 'Standard' : 'Full day'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Service:</span>
                                                                    <span className="ml-1">{proposal.selectedService}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Applied:</span>
                                                                    <span className="ml-1">{formatDate(proposal.createdAt)}</span>
                                                                </div>
                                                            </div>

                                                            <p className="text-sm text-gray-700 line-clamp-3">
                                                                {proposal.proposal}
                                                            </p>

                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => navigate(`/freelancer/${proposal.freelancer?._id}`)}
                                                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                                >
                                                                    View Profile
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">No interested mentors yet</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals for Approve, Reject, Suspend, Delete remain the same */}
            {/* Approve Confirmation Modal */}
            {showApproveModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Project</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to approve "{selectedProject.title}"? This project will become active and visible to mentors.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedProject(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleApproveProject(selectedProject._id)}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {showRejectModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Project</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to reject "{selectedProject.title}"?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for rejection
                            </label>
                            <textarea
                                id="rejectReason"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Provide feedback to the student..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedProject(null);
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
                                    handleRejectProject(selectedProject._id, reason);
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Confirmation Modal */}
            {showSuspendModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Suspend Project</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to suspend "{selectedProject.title}"? This will hide it from mentors.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setSelectedProject(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleSuspendProject(selectedProject._id);
                                    setShowSuspendModal(false);
                                }}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                            >
                                Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Project</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{selectedProject.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedProject(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteProject(selectedProject._id)}
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

export default AllProjects;