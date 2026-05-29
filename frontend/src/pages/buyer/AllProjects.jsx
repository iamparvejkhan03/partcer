import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Plus,
    Edit,
    Trash2,
    PauseCircle,
    PlayCircle,
    Copy,
    Eye,
    MoreVertical,
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
    Users,
    MessageCircle,
    UserCheck,
    UserX,
    DollarSign,
    Briefcase,
    FileText,
    Award,
    ThumbsUp,
    ThumbsDown,
    Send,
    Mail,
    Phone,
    MapPin,
    Globe,
    ChevronRight,
    ChevronLeft,
    X,
    Wrench,
    Tag
} from "lucide-react";
import { BuyerSidebar, BuyerHeader, BuyerContainer, StartChatButton } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { dummyUserImg } from '../../assets';

const AllProjects = () => {
    const [projects, setProjects] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showProposalsModal, setShowProposalsModal] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [dateRange, setDateRange] = useState('30');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);
    const [stats, setStats] = useState({
        active: 0,
        completed: 0,
        cancelled: 0,
        draft: 0,
        pending: 0,
        totalProposals: 0,
        totalSpent: 0,
        totalViews: 0
    });

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Helper functions for display
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

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get tab from URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['active', 'pending', 'completed', 'draft', 'cancelled'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Fetch projects on mount
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/v1/projects/buyer/me');

            if (response.data.success) {
                const { projects: fetchedProjects, stats: fetchedStats } = response.data.data;
                setAllProjects(fetchedProjects || []);
                setStats(fetchedStats || {
                    active: 0,
                    completed: 0,
                    cancelled: 0,
                    draft: 0,
                    pending: 0,
                    totalProposals: 0,
                    totalSpent: 0
                });
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load projects');
            setAllProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectProposals = async (projectId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/projects/${projectId}/proposals`);
            if (response.data.success) {
                return response.data.data;
            }
            return { proposals: [], stats: {} };
        } catch (error) {
            console.error('Error fetching proposals:', error);
            return { proposals: [], stats: {} };
        }
    };

    const handleDelete = async () => {
        if (!selectedProject) return;

        try {
            await axiosInstance.delete(`/api/v1/projects/${selectedProject._id}`);
            toast.success('Project deleted successfully');
            setShowDeleteModal(false);
            setSelectedProject(null);
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to delete project';
            toast.error(errorMessage);
        }
    };

    const handleStatusChange = async (projectId, newStatus) => {
        try {
            await axiosInstance.post(`/api/v1/projects/${projectId}/complete`);
            toast.success(`Project has been marked as completed and will be removed from browse projects page.`);
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to update project status';
            toast.error(errorMessage);
        }
    };

    const handleProposalAction = async (projectId, proposalId, status, message = '') => {
        try {
            await axiosInstance.patch(`/api/v1/projects/${projectId}/proposals/${proposalId}`, {
                status,
                message
            });

            const actionMessages = {
                accepted: 'Proposal accepted successfully',
                rejected: 'Proposal rejected successfully'
            };

            toast.success(actionMessages[status] || 'Action completed');
            setShowOfferModal(false);
            setSelectedProposal(null);

            if (showProposalsModal && selectedProject) {
                const { proposals, stats } = await fetchProjectProposals(selectedProject._id);
                setSelectedProject({
                    ...selectedProject,
                    proposalsList: proposals,
                    proposalsCount: stats?.total || proposals.length
                });
            }

            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to process proposal';
            toast.error(errorMessage);
        }
    };

    const handleViewProposals = async (project) => {
        setSelectedProject(project);
        setShowProposalsModal(true);

        const { proposals, stats } = await fetchProjectProposals(project._id);
        setSelectedProject({
            ...project,
            proposalsList: proposals,
            proposalsCount: stats?.total || proposals.length,
            pendingCount: stats?.pending || 0,
            acceptedCount: stats?.accepted || 0,
            rejectedCount: stats?.rejected || 0
        });
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRefresh = () => {
        fetchProjects();
        toast.success('Projects refreshed');
    };

    // Local Filtering
    useEffect(() => {
        let filtered = [...allProjects];

        if (activeTab !== 'all') {
            filtered = filtered.filter(project =>
                project.status?.toLowerCase() === activeTab.toLowerCase()
            );
        }

        if (searchTerm.trim()) {
            filtered = filtered.filter(project =>
                project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.subCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.service?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (dateRange !== 'all') {
            const date = new Date();
            date.setDate(date.getDate() - parseInt(dateRange));
            filtered = filtered.filter(project =>
                new Date(project.createdAt) >= date
            );
        }

        setProjects(filtered);
        setTotalProjects(filtered.length);
        setCurrentPage(1);
    }, [activeTab, searchTerm, dateRange, allProjects]);

    const tabs = [
        { id: 'active', label: 'ACTIVE', count: stats.active, icon: Clock },
        { id: 'pending', label: 'PENDING', count: stats.pending, icon: AlertCircle },
        { id: 'completed', label: 'COMPLETED', count: stats.completed, icon: CheckCircle },
        { id: 'draft', label: 'DRAFT', count: stats.draft, icon: FileText },
        { id: 'cancelled', label: 'CANCELLED', count: stats.cancelled, icon: XCircle }
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: Clock },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Approval', icon: AlertCircle },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: CheckCircle },
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft', icon: FileText },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: XCircle },
            filled: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Filled', icon: UserCheck }
        };

        const config = statusConfig[status] || statusConfig.draft;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    const getProposalStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle }
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const paginatedProjects = projects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading && projects.length === 0) {
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Projects</h1>
                            <p className="text-gray-600 mt-1">Manage your projects and review mentor expressions of interest</p>
                        </div>
                        <div className='flex items-center gap-2 mt-4 md:mt-0'>
                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            <Link
                                to="/buyer/projects/create"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                            >
                                <Plus size={18} />
                                Post Project
                            </Link>
                        </div>
                    </div>

                    {/* Stats Summary - Updated for new model */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Briefcase size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">All Projects</p>
                                    <p className="text-xl font-bold">{stats.active}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-xl font-bold">{stats.completed}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Users size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Interested</p>
                                    <p className="text-xl font-bold">{stats.totalProposals}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Eye size={20} className="text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Views</p>
                                    <p className="text-xl font-bold">{stats.totalViews}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    {/* <div className="mb-6 overflow-x-auto pb-2">
                        <div className="flex gap-2 min-w-max">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'bg-primary text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                                    </button>
                                );
                            })}
                        </div>
                    </div> */}

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search projects by title, category, or service..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        {/* <div className="flex gap-2">
                            <select
                                value={dateRange}
                                onChange={(e) => {
                                    setDateRange(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                                <option value="all">All time</option>
                            </select>
                        </div> */}
                    </div>

                    {/* Projects List - Desktop */}
                    <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            PROJECT
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SERVICE / PERIOD
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            INTERESTED
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            POSTED
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            STATUS
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {projects.length > 0 ? (
                                        paginatedProjects.map((project) => (
                                            <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs text-gray-500">
                                                                    {project.category?.name || project.category} • {project.subCategory?.name || project.subCategory}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-medium text-gray-900 mb-1">
                                                                {project.title}
                                                            </h3>
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {project.skills?.slice(0, 3).map((skill, idx) => (
                                                                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                                        {typeof skill === 'string' ? skill : skill.name}
                                                                    </span>
                                                                ))}
                                                                {project.skills?.length > 3 && (
                                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                                        +{project.skills.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div>
                                                        <span className="font-medium text-gray-900 block">
                                                            {project.service || 'N/A'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {getPeriodLabel(project.period)} · {getDurationLabel(project.period, project.duration)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-medium text-gray-900">
                                                            {project.proposalsCount || 0}
                                                        </span>
                                                        {project.pendingCount > 0 && (
                                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                                {project.pendingCount} pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(project.createdAt)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {getStatusBadge(project.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* Mark as Completed Button - Only show for active or filled projects */}
                                                        {(project.status === 'active' || project.status === 'filled') && (
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('Mark this project as completed? This action cannot be undone.')) {
                                                                        handleStatusChange(project._id, 'completed');
                                                                    }
                                                                }}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Mark as Completed"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                        )}

                                                        {/* View Interested Mentors Button */}
                                                        <button
                                                            onClick={() => handleViewProposals(project)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View Interested Mentors"
                                                            disabled={project.proposalsCount === 0}
                                                        >
                                                            <Users size={18} className={project.proposalsCount === 0 ? 'opacity-50' : ''} />
                                                        </button>

                                                        {/* Edit Button */}
                                                        <Link
                                                            to={`/buyer/projects/edit/${project._id}`}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Edit Project"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProject(project);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Project"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>

                                                        {/* View Details Button */}
                                                        <Link
                                                            to={`/project/${project._id}`}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                        <Briefcase size={24} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No {activeTab} projects found</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm ? 'Try adjusting your search' : 'Post your first project to get started'}
                                                    </p>
                                                    {!searchTerm && (
                                                        <Link
                                                            to="/buyer/projects/create"
                                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                        >
                                                            <Plus size={16} />
                                                            Post a Project
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
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProjects)} of {totalProjects} projects
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
                        {projects.length > 0 ? (
                            paginatedProjects.map((project) => (
                                <div key={project._id} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900 flex-1">{project.title}</h3>
                                        {getStatusBadge(project.status)}
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs text-gray-500">{project.category?.name || project.category}</span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">{project.subCategory?.name || project.subCategory}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Service</p>
                                            <p className="font-medium text-gray-900 text-sm">{project.service || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Period / Duration</p>
                                            <p className="text-sm text-gray-600">
                                                {getPeriodLabel(project.period)} · {getDurationLabel(project.period, project.duration)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Interested</p>
                                            <div className="flex items-center gap-1">
                                                <p className="font-medium text-gray-900">{project.proposalsCount || 0}</p>
                                                {project.pendingCount > 0 && (
                                                    <span className="text-xs text-green-600">({project.pendingCount} new)</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Posted</p>
                                            <p className="text-sm text-gray-600">{formatDate(project.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {project.skills?.slice(0, 3).map((skill, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                {typeof skill === 'string' ? skill : skill.name}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3">
                                        <div className="flex gap-2">
                                            {/* Mark as Completed Button - Only show for active or filled projects */}
                                            {(project.status === 'active' || project.status === 'filled') && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Mark this project as completed? This action cannot be undone.')) {
                                                            handleStatusChange(project._id, 'completed');
                                                        }
                                                    }}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Mark as Completed"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}

                                            {/* View Interested Mentors Button */}
                                            <button
                                                onClick={() => handleViewProposals(project)}
                                                className={`p-2 rounded-lg transition-colors ${project.proposalsCount > 0
                                                    ? 'text-blue-600 hover:bg-blue-50'
                                                    : 'text-gray-400 cursor-not-allowed'
                                                    }`}
                                                disabled={project.proposalsCount === 0}
                                            >
                                                <Users size={18} />
                                            </button>

                                            {/* Edit Button */}
                                            <Link
                                                to={`/buyer/projects/edit/${project._id}`}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                            >
                                                <Edit size={18} />
                                            </Link>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            {/* View Details Button */}
                                            <Link
                                                to={`/project/${project._id}`}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No {activeTab} projects found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {searchTerm ? 'Try adjusting your search' : 'Post your first project to get started'}
                                </p>
                                {!searchTerm && (
                                    <Link
                                        to="/buyer/projects/create"
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    >
                                        <Plus size={16} />
                                        Post a Project
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </BuyerContainer>
            </div>

            {/* Proposals/Interested Mentors Modal */}
            {showProposalsModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Interested Mentors</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedProject.title}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowProposalsModal(false);
                                    setSelectedProject(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Summary Stats */}
                            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Total Interested</p>
                                    <p className="text-xl font-bold">{selectedProject.proposalsList?.length || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Pending</p>
                                    <p className="text-xl font-bold text-yellow-600">
                                        {selectedProject.proposalsList?.filter(p => p.status === 'pending').length || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Accepted</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {selectedProject.proposalsList?.filter(p => p.status === 'accepted').length || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Rejected</p>
                                    <p className="text-xl font-bold text-red-600">
                                        {selectedProject.proposalsList?.filter(p => p.status === 'rejected').length || 0}
                                    </p>
                                </div>
                            </div> */}

                            {/* Proposals List */}
                            <div className="space-y-4">
                                {selectedProject.proposalsList && selectedProject.proposalsList.length > 0 ? (
                                    selectedProject.proposalsList.map((proposal) => (
                                        <div key={proposal._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                {/* Avatar & Basic Info */}
                                                <div className="flex items-start gap-3 md:w-1/3">
                                                    <img
                                                        src={proposal.freelancerAvatar || dummyUserImg}
                                                        alt={proposal.freelancerName}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{proposal.freelancerName}</h4>
                                                        <p className="text-sm text-gray-600">{proposal.freelancer?.title || 'Mentor'}</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <div className="flex">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        size={12}
                                                                        className={star <= Math.round(proposal.freelancer?.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-gray-500">({proposal.freelancer?.reviewCount || 0})</span>
                                                        </div>
                                                        {/* <div className="flex items-center gap-2 mt-2">
                                                            {getProposalStatusBadge(proposal.status)}
                                                        </div> */}
                                                    </div>
                                                </div>

                                                {/* Proposal Details */}
                                                <div className="md:w-2/3 space-y-3">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Applied:</span>
                                                            <span className="ml-1 font-medium">{formatDate(proposal.createdAt)}</span>
                                                        </div>
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
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-gray-700 line-clamp-3">{proposal.proposal}</p>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                                                        <button
                                                            onClick={() => window.open(`/freelancer/${proposal.freelancer?._id}`, '_blank')}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                        >
                                                            <Eye size={14} />
                                                            View Profile
                                                        </button>

                                                        {/* {proposal.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedProposal(proposal);
                                                                        setShowOfferModal(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                                >
                                                                    <ThumbsUp size={14} />
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm(`Are you sure you want to reject ${proposal.freelancerName}'s proposal?`)) {
                                                                            handleProposalAction(
                                                                                selectedProject._id,
                                                                                proposal._id,
                                                                                'rejected',
                                                                                'Thank you for your interest, but we have decided to move forward with other candidates.'
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                                >
                                                                    <ThumbsDown size={14} />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )} */}
                                                        {/* {proposal.status === 'accepted' && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded">
                                                                <CheckCircle size={14} />
                                                                Accepted
                                                            </span>
                                                        )}
                                                        {proposal.status === 'rejected' && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-500 rounded">
                                                                <XCircle size={14} />
                                                                Rejected
                                                            </span>
                                                        )} */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No interested mentors yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Check back later for expressions of interest</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Accept/Hire Modal */}
            {showOfferModal && selectedProposal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Accept Proposal</h3>
                            <button
                                onClick={() => {
                                    setShowOfferModal(false);
                                    setSelectedProposal(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <img
                                    src={selectedProposal.freelancerAvatar || dummyUserImg}
                                    alt={selectedProposal.freelancerName}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900">{selectedProposal.freelancerName}</h4>
                                    <p className="text-sm text-gray-600">{selectedProposal.freelancer?.title || 'Mentor'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    className={star <= Math.round(selectedProposal.freelancer?.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">{selectedProposal.freelancer?.rating || 0} ({selectedProposal.freelancer?.reviewCount || 0} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h5 className="font-medium text-gray-700 mb-3">Proposal Details</h5>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Period:</span>
                                        <p className="font-semibold text-gray-900 capitalize">{getPeriodLabel(selectedProposal.selectedPeriod)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Duration:</span>
                                        <p className="font-semibold text-gray-900 capitalize">{selectedProposal.selectedDuration === 'standard' ? 'Standard (2-3 hrs)' : 'Full day (6-8 hrs)'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Service:</span>
                                        <p className="font-semibold text-gray-900">{selectedProposal.selectedService}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Applied:</span>
                                        <p className="font-semibold text-gray-900">{formatDate(selectedProposal.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message to Mentor
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Let them know why you're accepting their proposal..."
                                    defaultValue="Congratulations! We are impressed with your proposal and would like to move forward with you for this project. Let's discuss the next steps."
                                ></textarea>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowOfferModal(false);
                                        setSelectedProposal(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const message = document.querySelector('textarea')?.value || '';
                                        handleProposalAction(selectedProject._id, selectedProposal._id, 'accepted', message);
                                    }}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                >
                                    Confirm Accept
                                </button>
                            </div>
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

export default AllProjects;