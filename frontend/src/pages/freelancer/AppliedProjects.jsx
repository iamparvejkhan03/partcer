import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Briefcase,
    Search,
    Filter,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Calendar,
    User,
    Star,
    MessageCircle,
    TrendingUp,
    Wallet,
    FileText,
    ChevronDown,
    ArrowUpRight,
    Building2,
    MapPin,
    Clock as ClockIcon,
    Tag
} from "lucide-react";
import { FreelancerSidebar, FreelancerHeader, FreelancerContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const AppliedProjects = () => {
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0
    });

    // Helper functions
    const getPeriodLabel = (period) => {
        const map = {
            one_time: 'One-time',
            per_day: 'Per day',
            weekly: 'Weekly',
            monthly: 'Monthly'
        };
        return map[period] || period;
    };

    const getDurationLabel = (duration, period) => {
        if (period === 'one_time') return 'Single session';
        if (duration === 'standard') return 'Standard (2-3 hrs)';
        return 'Full day (6-8 hrs)';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                label: 'Active',
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                icon: Clock,
                description: 'Awaiting buyer\'s response'
            },
            completed: {
                label: 'Completed',
                bg: 'bg-green-100',
                text: 'text-green-700',
                icon: CheckCircle,
                description: 'Buyer has marked proposal as completed'
            },
            rejected: {
                label: 'Rejected',
                bg: 'bg-red-100',
                text: 'text-red-700',
                icon: XCircle,
                description: 'Buyer has declined your proposal'
            },
            filled: {
                label: 'Filled',
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                icon: AlertCircle,
                description: 'Buyer has more proposals to review'
            }
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

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/v1/projects/applications/me');

            if (response.data.success) {
                const { applications: apps, stats: appStats } = response.data.data;
                setApplications(apps || []);
                setStats(appStats || {
                    total: 0,
                    pending: 0,
                    accepted: 0,
                    rejected: 0,
                    withdrawn: 0
                });
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error(error.response?.data?.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // Filter applications
    useEffect(() => {
        let filtered = [...applications];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.proposalStatus === statusFilter);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(app =>
                app.projectTitle?.toLowerCase().includes(term) ||
                app.projectCategory?.toLowerCase().includes(term) ||
                app.proposal?.toLowerCase().includes(term)
            );
        }

        // Filter by date range
        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filtered = filtered.filter(app => new Date(app.appliedAt) >= cutoffDate);
        }

        setFilteredApplications(filtered);
        setCurrentPage(1);
    }, [applications, statusFilter, searchTerm, dateRange]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApplications = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

    const handleRefresh = () => {
        fetchApplications();
        toast.success('Applications refreshed');
    };

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setShowDetailsModal(true);
    };

    const handleWithdrawApplication = async (applicationId, projectId) => {
        if (!window.confirm('Are you sure you want to withdraw your application? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/api/v1/projects/${projectId}/application`);

            if (response.data.success) {
                toast.success('Application withdrawn successfully');
                fetchApplications(); // Refresh the list
                setShowDetailsModal(false);
                setSelectedApplication(null);
            }
        } catch (error) {
            console.error('Error withdrawing application:', error);
            toast.error(error.response?.data?.message || 'Failed to withdraw application');
        }
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Applications</h1>
                            <p className="text-gray-600 mt-1">Track and manage your project proposals</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={18} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Briefcase size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Applications</p>
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
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-xl font-bold">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Accepted</p>
                                    <p className="text-xl font-bold">{stats.accepted}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <XCircle size={20} className="text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Rejected</p>
                                    <p className="text-xl font-bold">{stats.rejected}</p>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by project title, category, or proposal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        {/* <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="withdrawn">Withdrawn</option>
                            </select>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
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

                    {/* Applications Table - Desktop */}
                    <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            PROJECT
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SERVICE / PERIOD
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            APPLIED ON
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            PROJECT STATUS
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentApplications.length > 0 ? (
                                        currentApplications.map((application) => (
                                            <tr key={application.projectId} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 mb-1">
                                                            {application.projectTitle}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-1">
                                                            <span className="text-xs text-gray-500">
                                                                {application.projectCategory}
                                                            </span>
                                                            {application.projectSubCategory && (
                                                                <>
                                                                    <span className="text-xs text-gray-300">•</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {application.projectSubCategory}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {application.projectSkills?.slice(0, 2).map((skill, idx) => (
                                                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {application.projectSkills?.length > 2 && (
                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                                    +{application.projectSkills.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{application.selectedService || application.projectService}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {getPeriodLabel(application.selectedPeriod || application.projectPeriod)} ·
                                                            {getDurationLabel(application.selectedDuration || application.projectDuration, application.selectedPeriod || application.projectPeriod)}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600">
                                                        {formatDate(application.appliedAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(application.projectStatus)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(application)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        {/* {application.proposalStatus === 'pending' && (
                                                            <button
                                                                onClick={() => handleWithdrawApplication(application.projectId, application.projectId)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Withdraw Application"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        )} */}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr key={1}>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                                                        <Briefcase size={24} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No applications found</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm ? 'Try adjusting your search' : 'Browse projects and express your interest'}
                                                    </p>
                                                    {!searchTerm && statusFilter === 'all' && (
                                                        <Link
                                                            to="/projects"
                                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                                        >
                                                            <Briefcase size={16} />
                                                            Browse Projects
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
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} applications
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

                    {/* Applications List - Mobile */}
                    <div className="md:hidden space-y-4 mb-6">
                        {currentApplications.length > 0 ? (
                            currentApplications.map((application) => (
                                <div key={application.projectId} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900 flex-1">{application.projectTitle}</h3>
                                        {getStatusBadge(application.projectStatus)}
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs text-gray-500">{application.projectCategory}</span>
                                        {application.projectSubCategory && (
                                            <>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">{application.projectSubCategory}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Service</p>
                                            <p className="text-sm font-medium text-gray-900">{application.selectedService || application.projectService}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Period / Duration</p>
                                            <p className="text-sm text-gray-600">
                                                {getPeriodLabel(application.selectedPeriod || application.projectPeriod)} ·
                                                {getDurationLabel(application.selectedDuration || application.projectDuration, application.selectedPeriod || application.projectPeriod)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Applied On</p>
                                            <p className="text-sm text-gray-600">{formatDate(application.appliedAt)}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {application.projectSkills?.slice(0, 3).map((skill, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewDetails(application)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {application.proposalStatus === 'pending' && (
                                                <button
                                                    onClick={() => handleWithdrawApplication(application.projectId, application.projectId)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No applications found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {searchTerm ? 'Try adjusting your search' : 'Browse projects and express your interest'}
                                </p>
                                {!searchTerm && statusFilter === 'all' && (
                                    <Link
                                        to="/projects"
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    >
                                        <Briefcase size={16} />
                                        Browse Projects
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
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
                </FreelancerContainer>
            </div>

            {/* Application Details Modal */}
            {showDetailsModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedApplication(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Project Info */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Project</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                        {selectedApplication.projectTitle}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="px-2 py-1 bg-white rounded text-xs text-gray-600">
                                            {selectedApplication.projectCategory}
                                        </span>
                                        {selectedApplication.projectSubCategory && (
                                            <span className="px-2 py-1 bg-white rounded text-xs text-gray-600">
                                                {selectedApplication.projectSubCategory}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {selectedApplication.projectDescription}
                                    </p>
                                    <Link
                                        to={`/project/${selectedApplication.projectId}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1 text-primary text-sm mt-2 hover:underline"
                                    >
                                        View Full Project
                                        <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                            </div>

                            {/* Your Selected Options */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Your Selected Options</h4>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium capitalize">
                                        {getPeriodLabel(selectedApplication.selectedPeriod || selectedApplication.projectPeriod)}
                                    </span>
                                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                        {getDurationLabel(selectedApplication.selectedDuration || selectedApplication.projectDuration, selectedApplication.selectedPeriod || selectedApplication.projectPeriod)}
                                    </span>
                                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                        {selectedApplication.selectedService || selectedApplication.projectService}
                                    </span>
                                </div>
                            </div>

                            {/* Your Proposal */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Your Proposal</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {selectedApplication.proposal}
                                    </p>
                                </div>
                            </div>

                            {/* Application Timeline */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Application Timeline</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Applied on</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatDateTime(selectedApplication.appliedAt)}
                                        </span>
                                    </div>
                                    {selectedApplication.updatedAt && selectedApplication.updatedAt !== selectedApplication.appliedAt && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Last updated</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatDateTime(selectedApplication.updatedAt)}
                                            </span>
                                        </div>
                                    )}
                                    {selectedApplication.proposalStatus === 'accepted' && selectedApplication.acceptedAt && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Accepted on</span>
                                            <span className="text-sm font-medium text-green-600">
                                                {formatDateTime(selectedApplication.acceptedAt)}
                                            </span>
                                        </div>
                                    )}
                                    {selectedApplication.proposalStatus === 'rejected' && selectedApplication.rejectedAt && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Rejected on</span>
                                            <span className="text-sm font-medium text-red-600">
                                                {formatDateTime(selectedApplication.rejectedAt)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Client Info */}
                            {selectedApplication.client && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Client Information</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            {selectedApplication.client.avatar ? (
                                                <img
                                                    src={selectedApplication.client.avatar}
                                                    alt={selectedApplication.client.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <User size={18} className="text-gray-500" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedApplication.client.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={12}
                                                                className={star <= Math.round(selectedApplication.client.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500">({selectedApplication.client.reviews || 0} reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedApplication.client.verified && (
                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                <CheckCircle size={12} />
                                                Verified Client
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Response Message (if any) */}
                            {selectedApplication.response?.message && (
                                <div className={`p-4 rounded-lg ${selectedApplication.proposalStatus === 'accepted' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <p className={`text-sm font-medium mb-1 ${selectedApplication.proposalStatus === 'accepted' ? 'text-green-800' : 'text-red-800'}`}>
                                        {selectedApplication.proposalStatus === 'accepted' ? 'Accepted Message' : 'Rejection Reason'}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        {selectedApplication.response.message}
                                    </p>
                                    {selectedApplication.response.date && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Sent on {formatDateTime(selectedApplication.response.date)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                {/* {selectedApplication.proposalStatus === 'pending' && (
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleWithdrawApplication(selectedApplication.projectId, selectedApplication.projectId);
                                        }}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Withdraw Application
                                    </button>
                                )} */}
                                <Link
                                    to={`/project/${selectedApplication.projectId}`}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-center"
                                >
                                    View Project
                                </Link>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setSelectedApplication(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AppliedProjects;