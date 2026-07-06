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
    X
} from "lucide-react";
import { AgencySidebar, AgencyHeader, AgencyContainer, StartChatButton } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { dummyUserImg } from '../../assets';

const AllProjects = () => {
    const [projects, setProjects] = useState([]);
    const [allProjects, setAllProjects] = useState([]); // For local filtering
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
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
        totalApplicants: 0,
        totalSpent: 0,
        totalViews: 0,
        totalProposals: 0
    });

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get tab from URL or default to active
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['active', 'pending', 'completed', 'draft', 'cancelled'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Fetch projects on mount, tab change, page change, or search
    useEffect(() => {
        fetchProjects();
    }, []);

    // Debounce search
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         if (searchTerm) {
    //             setCurrentPage(1);
    //             fetchProjects();
    //         }
    //     }, 500);

    //     return () => clearTimeout(timer);
    // }, [searchTerm]);

    const fetchProjects = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams();
            // params.append('status', activeTab);
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);

            // if (searchTerm) {
            //     params.append('search', searchTerm);
            // }

            if (dateRange !== 'all') {
                const date = new Date();
                date.setDate(date.getDate() - parseInt(dateRange));
                params.append('fromDate', date.toISOString());
            }

            const response = await axiosInstance.get(`/api/v1/projects/buyer/me?${params.toString()}`);

            if (response.data.success) {
                const { projects: fetchedProjects, stats: fetchedStats, pagination } = response.data.data;

                // setProjects(fetchedProjects || []);
                setAllProjects(fetchedProjects || []);
                setStats(fetchedStats || {
                    active: 0,
                    completed: 0,
                    cancelled: 0,
                    draft: 0,
                    pending: 0,
                    totalApplicants: 0,
                    totalSpent: 0
                });

                if (pagination) {
                    setTotalPages(pagination.pages);
                    setTotalProjects(pagination.total);
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load projects');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTotalPages(Math.ceil(projects.length / itemsPerPage));
    }, [projects]);

    const fetchProjectApplicants = async (projectId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/projects/${projectId}/applicants`);

            if (response.data.success) {
                return response.data.data;
            }
            return { applicants: [], stats: {} };
        } catch (error) {
            console.error('Error fetching applicants:', error);
            toast.error('Failed to load applicants');
            return { applicants: [], stats: {} };
        }
    };

    const handleDelete = async () => {
        if (!selectedProject) return;

        try {
            await axiosInstance.delete(`/api/v1/projects/${selectedProject._id}`);

            toast.success('Project deleted successfully');
            setShowDeleteModal(false);
            setSelectedProject(null);

            // Refresh projects
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to delete project';
            toast.error(errorMessage);
        }
    };

    const handleStatusChange = async (projectId, newStatus) => {
        try {
            await axiosInstance.patch(`/api/v1/projects/${projectId}/status`, { status: newStatus });

            toast.success(`Project status updated to ${newStatus}`);

            // Refresh projects
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to update project status';
            toast.error(errorMessage);
        }
    };

    const handleApplicantAction = async (projectId, applicantId, action, message = '') => {
        try {
            await axiosInstance.patch(`/api/v1/projects/${projectId}/applicants/${applicantId}`, {
                action,
                message
            });

            const actionMessages = {
                shortlisted: 'Applicant shortlisted successfully',
                hired: 'Applicant hired successfully',
                rejected: 'Application rejected successfully'
            };

            toast.success(actionMessages[action] || 'Action completed');
            setShowOfferModal(false);
            setSelectedApplicant(null);

            // Refresh applicants if modal is open
            if (showApplicantsModal && selectedProject) {
                const { applicants, stats } = await fetchProjectApplicants(selectedProject._id);
                setSelectedProject({
                    ...selectedProject,
                    applicantsList: applicants,
                    applicantsCount: stats?.total || applicants.length,
                    unreadApplications: stats?.pending || 0
                });
            }

            // Refresh projects list
            fetchProjects();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to process applicant';
            toast.error(errorMessage);
        }
    };

    const handleMessageApplicant = (applicant) => {
        navigate(`/agency/messages?user=${applicant.freelancer?._id || applicant._id}`);
    };

    const handleViewProfile = (applicant) => {
        navigate(`/freelancer/${applicant.freelancer || applicant._id}`);
    };

    const handleDuplicate = async (project) => {
        try {
            await axiosInstance.post(`/api/v1/projects/${project._id}/duplicate`);

            toast.success('Project duplicated successfully');
            fetchProjects(); // Refresh list
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to duplicate project';
            toast.error(errorMessage);
        }
    };

    const handleViewApplicants = async (project) => {
        setSelectedProject(project);
        setShowApplicantsModal(true);

        // Fetch applicants for this project
        const { applicants, stats } = await fetchProjectApplicants(project._id);
        setSelectedProject({
            ...project,
            applicantsList: applicants,
            applicantsCount: stats?.total || applicants.length,
            unreadApplications: stats?.pending || 0
        });
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setCurrentPage(1);
        // setSearchParams({ tab: tabId });
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRefresh = () => {
        fetchProjects();
        toast.success('Projects refreshed');
    };

    const tabs = [
        { id: 'active', label: 'ACTIVE', count: stats.active, icon: Clock },
        { id: 'pending', label: 'PENDING', count: stats.pending, icon: AlertCircle },
        { id: 'completed', label: 'COMPLETED', count: stats.completed, icon: CheckCircle },
        { id: 'draft', label: 'DRAFT', count: stats.draft, icon: FileText },
        { id: 'cancelled', label: 'CANCELLED', count: stats.cancelled, icon: XCircle }
    ];

    // Local Filtering
    useEffect(() => {
        let filtered = [...allProjects];

        // 🔹 Filter by tab (status)
        if (activeTab !== 'all') {
            filtered = filtered.filter(project =>
                project.status?.toLowerCase() === activeTab.toLowerCase()
            );
        }


        // Filter by search
        if (searchTerm.trim()) {
            filtered = filtered.filter(project =>
                project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.subCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by date
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: Clock },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Approval', icon: AlertCircle },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: CheckCircle },
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft', icon: FileText },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: XCircle }
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

    const getApplicantStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            shortlisted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Shortlisted', icon: UserCheck },
            hired: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hired', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: UserX }
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

    const formatCurrency = (amount) => {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const paginatedProjects = projects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading && projects.length === 0) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AgencySidebar />
                <div className="w-full relative">
                    <AgencyHeader />
                    <AgencyContainer>
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    </AgencyContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AgencySidebar />
            <div className="w-full relative">
                <AgencyHeader />
                <AgencyContainer>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Projects</h1>
                            <p className="text-gray-600 mt-1">Manage your projects and review mentor applications</p>
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
                                to="/agency/projects/create"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                            >
                                <Plus size={18} />
                                Post Project
                            </Link>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Briefcase size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Active Projects</p>
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
                                    <p className="text-sm text-gray-600">Total Applicants</p>
                                    <p className="text-xl font-bold">{stats.totalApplicants}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <DollarSign size={20} className="text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Spent</p>
                                    <p className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 overflow-x-auto pb-2">
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
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
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
                        </div>
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
                                            BUDGET
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            APPLICANTS
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            DEADLINE
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
                                    {

                                        projects.length > 0 ? (
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
                                                        <span className="font-bold text-gray-900">
                                                            {formatCurrency(project.budget)}
                                                        </span>
                                                        <span className="text-xs text-gray-500 block">
                                                            {project.projectType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-medium text-gray-900">
                                                                {project.applicantsCount || 0}
                                                            </span>
                                                            {project.unreadApplications > 0 && (
                                                                <span className="text-xs text-green-600 flex items-center gap-1">
                                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                                    {project.unreadApplications} new
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm text-gray-600">
                                                            {formatDate(project.deadline)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getStatusBadge(project.status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleViewApplicants(project)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="View Applicants"
                                                                disabled={project.applicantsCount === 0}
                                                            >
                                                                <Users size={18} className={project.applicantsCount === 0 ? 'opacity-50' : ''} />
                                                            </button>
                                                            <Link
                                                                to={`/agency/projects/edit/${project._id}`}
                                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Edit Project"
                                                            >
                                                                <Edit size={18} />
                                                            </Link>
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
                                                            {searchTerm ? 'Try adjusting your search' : `Post your first project to get started`}
                                                        </p>
                                                        {!searchTerm && (
                                                            <Link
                                                                to="/agency/projects/create"
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
                                            <p className="text-xs text-gray-500">Budget</p>
                                            <p className="font-bold text-gray-900">{formatCurrency(project.budget)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Applicants</p>
                                            <div className="flex items-center gap-1">
                                                <p className="font-medium text-gray-900">{project.applicantsCount || 0}</p>
                                                {project.unreadApplications > 0 && (
                                                    <span className="text-xs text-green-600">({project.unreadApplications} new)</span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Deadline</p>
                                            <p className="text-sm text-gray-600">{formatDate(project.deadline)}</p>
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
                                            <button
                                                onClick={() => handleViewApplicants(project)}
                                                className={`p-2 rounded-lg transition-colors ${project.applicantsCount > 0
                                                    ? 'text-blue-600 hover:bg-blue-50'
                                                    : 'text-gray-400 cursor-not-allowed'
                                                    }`}
                                                disabled={project.applicantsCount === 0}
                                            >
                                                <Users size={18} />
                                            </button>
                                            <Link
                                                to={`/agency/projects/edit/${project._id}`}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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
                                        to="/agency/projects/create"
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
                </AgencyContainer>
            </div>

            {/* Applicants Modal */}
            {showApplicantsModal && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Applicants for Project</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedProject.title}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowApplicantsModal(false);
                                    setSelectedProject(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Total Applicants</p>
                                    <p className="text-xl font-bold">{selectedProject.applicantsList?.length || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Shortlisted</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {selectedProject.applicantsList?.filter(a => a.status === 'shortlisted').length || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Hired</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {selectedProject.applicantsList?.filter(a => a.status === 'hired').length || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">New</p>
                                    <p className="text-xl font-bold text-yellow-600">
                                        {selectedProject.applicantsList?.filter(a => a.status === 'pending').length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Applicants List */}
                            <div className="space-y-4">
                                {selectedProject.applicantsList && selectedProject.applicantsList.length > 0 ? (
                                    selectedProject.applicantsList.map((applicant) => (
                                        <div key={applicant._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                {/* Avatar & Basic Info */}
                                                <div className="flex items-start gap-3 md:w-1/3">
                                                    <img
                                                        src={applicant?.profileImage || dummyUserImg}
                                                        alt={applicant.name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-gray-900">{applicant.name}</h4>
                                                            {applicant.verified && (
                                                                <CheckCircle size={14} className="text-green-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600">{applicant.title}</p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <div className="flex">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        size={12}
                                                                        className={star <= Math.round(applicant.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-gray-500">({applicant.reviews})</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {getApplicantStatusBadge(applicant.status)}
                                                        </div>
                                                        <StartChatButton userId={applicant?.freelancer} userName={applicant?.name} />
                                                    </div>
                                                </div>

                                                {/* Proposal Details */}
                                                <div className="md:w-2/3 space-y-3">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Applied:</span>
                                                            <span className="ml-1 font-medium">{formatDate(applicant.appliedDate)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Proposed:</span>
                                                            <span className="ml-1 font-medium">{formatCurrency(applicant.proposedBudget)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Timeline:</span>
                                                            <span className="ml-1">{applicant.proposedTimeline}</span>
                                                        </div>
                                                        {/* <div>
                                                            <span className="text-gray-500">Rate:</span>
                                                            <span className="ml-1">{formatCurrency(applicant.hourlyRate)}/hr</span>
                                                        </div> */}
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-gray-700 line-clamp-2">{applicant.coverLetter}</p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {applicant.skills?.slice(0, 5).map((skill, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                                {typeof skill === 'string' ? skill : skill.name}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                                                        <button
                                                            onClick={() => handleViewProfile(applicant)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                        >
                                                            <Eye size={14} />
                                                            View Profile
                                                        </button>
                                                        {/* <button
                                                            onClick={() => handleMessageApplicant(applicant)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                        >
                                                            <MessageCircle size={14} />
                                                            Message
                                                        </button> */}
                                                        {applicant.status === 'pending' && (
                                                            <>
                                                                {/* Shortlist button */}
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedApplicant(applicant);
                                                                        setShowOfferModal(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                                >
                                                                    <ThumbsUp size={14} />
                                                                    Shortlist
                                                                </button>

                                                                {/* Reject button */}
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm(`Are you sure you want to reject ${applicant.name}'s application?`)) {
                                                                            handleApplicantAction(
                                                                                selectedProject._id,
                                                                                applicant._id,
                                                                                'rejected',
                                                                                'Thank you for your application, but we have decided to move forward with other candidates.'
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                                >
                                                                    <ThumbsDown size={14} />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {applicant.status === 'shortlisted' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedApplicant(applicant);
                                                                        setShowOfferModal(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                                >
                                                                    <CheckCircle size={14} />
                                                                    Hire
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApplicantAction(selectedProject._id, applicant._id, 'rejected', 'After review, we decided to go with another candidate')}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                                >
                                                                    <XCircle size={14} />
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {applicant.status === 'hired' && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded">
                                                                <CheckCircle size={14} />
                                                                Hired
                                                            </span>
                                                        )}
                                                        {applicant.status === 'rejected' && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-500 rounded">
                                                                <UserX size={14} />
                                                                Rejected
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Response Message */}
                                                    {applicant.response && (
                                                        <div className={`mt-2 p-2 rounded text-sm ${applicant.response.type === 'hired' ? 'bg-green-50 text-green-700' :
                                                            applicant.response.type === 'rejected' ? 'bg-red-50 text-red-700' :
                                                                'bg-blue-50 text-blue-700'
                                                            }`}>
                                                            <p className="font-medium">Response sent:</p>
                                                            <p>{applicant.response.message}</p>
                                                            <p className="text-xs mt-1">{formatDate(applicant.response.date)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">No applicants yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Check back later for proposals</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Offer/Hire Modal */}
            {showOfferModal && selectedApplicant && selectedProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                {selectedApplicant.status === 'shortlisted' ? 'Hire Mentor' : 'Shortlist Mentor'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowOfferModal(false);
                                    setSelectedApplicant(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <img
                                    src={selectedApplicant.avatar || selectedApplicant.freelancer?.profileImage || dummyUserImg}
                                    alt={selectedApplicant.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900">{selectedApplicant.name}</h4>
                                    <p className="text-sm text-gray-600">{selectedApplicant.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    className={star <= Math.round(selectedApplicant.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">{selectedApplicant.rating} ({selectedApplicant.reviews} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h5 className="font-medium text-gray-700 mb-3">Proposal Details</h5>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Proposed Budget:</span>
                                        <p className="font-semibold text-gray-900">{formatCurrency(selectedApplicant.proposedBudget)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Timeline:</span>
                                        <p className="font-semibold text-gray-900">{selectedApplicant.proposedTimeline}</p>
                                    </div>
                                    {/* <div>
                                        <span className="text-gray-500">Hourly Rate:</span>
                                        <p className="font-semibold text-gray-900">{formatCurrency(selectedApplicant.hourlyRate)}/hr</p>
                                    </div> */}
                                    <div>
                                        <span className="text-gray-500">Experience:</span>
                                        <p className="font-semibold text-gray-900 capitalize">{selectedApplicant.level}</p>
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
                                    placeholder={selectedApplicant.status === 'shortlisted'
                                        ? "Send a hiring message to the mentor..."
                                        : "Let them know why you're shortlisting them..."}
                                    defaultValue={selectedApplicant.status === 'shortlisted'
                                        ? "Congratulations! We would like to hire you for this project. Let's discuss the next steps."
                                        : "We were impressed by your proposal and would like to shortlist you for this project. We'll be in touch soon."}
                                ></textarea>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowOfferModal(false);
                                        setSelectedApplicant(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const message = document.querySelector('textarea').value;
                                        const action = selectedApplicant.status === 'shortlisted' ? 'hired' : 'shortlisted';
                                        handleApplicantAction(selectedProject._id, selectedApplicant._id, action, message);
                                    }}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                >
                                    {selectedApplicant.status === 'shortlisted' ? 'Confirm Hire' : 'Confirm Shortlist'}
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