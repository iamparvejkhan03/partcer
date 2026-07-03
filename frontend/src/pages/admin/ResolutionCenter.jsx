import { useState, useEffect } from 'react';
import {
    AlertCircle,
    Eye,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    Loader,
    User,
    Package,
    Calendar,
    MessageSquare,
    Flag,
    Mail,
    Send,
    Edit,
    Save,
    X,
    Filter,
    TrendingUp,
    Users,
    DollarSign,
    AlertTriangle,
    FileText,
    ExternalLink,
    Image as ImageIcon
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { format } from 'date-fns';

const ResolutionCenter = () => {
    const [resolutions, setResolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedResolution, setSelectedResolution] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        in_review: 0,
        resolved: 0,
        rejected: 0,
        refunded: 0
    });
    const [updateData, setUpdateData] = useState({
        status: '',
        adminNotes: '',
        resolution: '',
        refundAmount: '',
        updateOrderStatus: false,
        orderStatusUpdate: {
            paymentStatus: '',
            orderStatus: ''
        }
    });

    // Fetch resolutions
    useEffect(() => {
        fetchResolutions();
        fetchStats();
    }, []);

    const fetchResolutions = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/v1/resolution/admin/resolutions');

            if (response.data?.success) {
                setResolutions(response.data.data.resolutions || []);
            }
        } catch (error) {
            console.error('Error fetching resolutions:', error);
            toast.error('Failed to load resolutions');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/resolution/admin/stats');
            if (response.data?.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleUpdateResolution = async () => {
        if (!selectedResolution) return;

        setUpdating(true);
        try {
            const response = await axiosInstance.put(
                `/api/v1/resolution/admin/resolutions/${selectedResolution._id}`,
                updateData
            );

            if (response.data?.success) {
                toast.success('Resolution updated successfully');
                setShowUpdateModal(false);
                setUpdateData({
                    status: '',
                    adminNotes: '',
                    resolution: '',
                    refundAmount: ''
                });
                fetchResolutions();
                fetchStats();
                if (showDetailsModal) {
                    const updatedResolution = response.data.data;
                    setSelectedResolution(updatedResolution);
                }
            }
        } catch (error) {
            console.error('Error updating resolution:', error);
            toast.error(error.response?.data?.message || 'Failed to update resolution');
        } finally {
            setUpdating(false);
        }
    };

    // Filter resolutions
    const filteredResolutions = resolutions.filter(resolution => {
        if (statusFilter !== 'all' && resolution.status !== statusFilter) {
            return false;
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            return (
                resolution.orderNumber?.toLowerCase().includes(term) ||
                resolution.issueTypeDisplay?.toLowerCase().includes(term) ||
                resolution.complaint?.toLowerCase().includes(term) ||
                resolution.userId?.firstName?.toLowerCase().includes(term) ||
                resolution.userId?.lastName?.toLowerCase().includes(term) ||
                resolution.mentorId?.firstName?.toLowerCase().includes(term) ||
                resolution.mentorId?.lastName?.toLowerCase().includes(term)
            );
        }
        return true;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentResolutions = filteredResolutions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredResolutions.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRefresh = () => {
        fetchResolutions();
        fetchStats();
        toast.success('Resolutions refreshed');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return '—';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        try {
            return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
        } catch {
            return '—';
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            in_review: { label: 'Under Review', bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle },
            resolved: { label: 'Resolved', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            refunded: { label: 'Refunded', bg: 'bg-purple-100', text: 'text-purple-700', icon: DollarSign }
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    const handleViewDetails = (resolution) => {
        setSelectedResolution(resolution);
        setShowDetailsModal(true);
    };

    const handleOpenUpdateModal = (resolution) => {
        setSelectedResolution(resolution);
        setUpdateData({
            status: resolution.status,
            adminNotes: resolution.adminNotes || '',
            resolution: resolution.resolution || '',
            refundAmount: resolution.refundAmount || resolution.orderId?.amount || ''
        });
        setShowUpdateModal(true);
    };

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
            <div className="flex-1 min-w-0 overflow-x-auto relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="w-full max-w-full overflow-x-hidden">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Resolution Center</h1>
                                <p className="text-gray-600 mt-1">Manage and respond to user complaints</p>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-600 flex items-center gap-1"
                                >
                                    <RefreshCw size={18} />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Flag size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Total Complaints</p>
                                        <p className="text-xl font-bold">{stats.total || 0}</p>
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
                                        <p className="text-xl font-bold text-yellow-600">{stats.pending || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <AlertCircle size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Under Review</p>
                                        <p className="text-xl font-bold text-blue-600">{stats.in_review || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Resolved</p>
                                        <p className="text-xl font-bold text-green-600">{stats.resolved || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <XCircle size={20} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Rejected</p>
                                        <p className="text-xl font-bold text-red-600">{stats.rejected || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <DollarSign size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Refunded</p>
                                        <p className="text-xl font-bold text-purple-600">{stats.refunded || 0}</p>
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
                                        placeholder="Search by order ID, issue type, complaint text..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[150px]"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="in_review">Under Review</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Resolutions Table */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
                                            {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Type</th> */}
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentResolutions.length > 0 ? (
                                            currentResolutions.map((resolution) => (
                                                <tr key={resolution._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-mono text-gray-900">{resolution.orderNumber}</div>
                                                        <div className="text-xs text-gray-500">{formatDate(resolution.createdAt)}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={resolution.userId?.profileImage || 'https://via.placeholder.com/32'}
                                                                alt={resolution.userId?.firstName}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {resolution.userId?.firstName} {resolution.userId?.lastName}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{resolution.userId?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={resolution.mentorId?.profileImage || 'https://via.placeholder.com/32'}
                                                                alt={resolution.mentorId?.firstName}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {resolution.mentorId?.firstName} {resolution.mentorId?.lastName}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{resolution.mentorId?.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-900 max-w-xs truncate" title={resolution.issueTypeDisplay}>
                                                            {resolution.issueTypeDisplay}
                                                        </div>
                                                    </td> */}
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(resolution.status)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm text-gray-500">{formatDate(resolution.createdAt)}</div>
                                                        <div className="text-xs text-gray-400">{format(new Date(resolution.createdAt), 'h:mm a')}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleViewDetails(resolution)}
                                                                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenUpdateModal(resolution)}
                                                                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Update Status"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <Flag size={40} className="text-gray-300 mb-3" />
                                                        <p className="text-gray-500 font-medium">No complaints found</p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            {searchTerm ? 'Try adjusting your search' : 'No complaints match the selected filters'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {filteredResolutions.length > 0 && (
                            <div className="flex px-6 py-4 border-t border-gray-200 items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredResolutions.length)} of {filteredResolutions.length} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-8 h-8 rounded-lg ${currentPage === pageNum
                                                    ? 'bg-primary text-white'
                                                    : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
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
                </AdminContainer>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedResolution && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Complaint Details</h3>
                                <p className="text-sm text-gray-500">Order: {selectedResolution.orderNumber}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div className="flex justify-start gap-2 items-center">
                                <span className="text-sm font-medium text-gray-600">Status:</span>
                                {getStatusBadge(selectedResolution.status)}
                            </div>

                            {/* Student Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <User size={16} />
                                    Student Information
                                </h4>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={selectedResolution.userId?.profileImage || 'https://via.placeholder.com/48'}
                                        alt={selectedResolution.userId?.firstName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {selectedResolution.userId?.firstName} {selectedResolution.userId?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">{selectedResolution.userId?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mentor Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Users size={16} />
                                    Mentor Information
                                </h4>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={selectedResolution.mentorId?.profileImage || 'https://via.placeholder.com/48'}
                                        alt={selectedResolution.mentorId?.firstName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {selectedResolution.mentorId?.firstName} {selectedResolution.mentorId?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">{selectedResolution.mentorId?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Issue Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Flag size={16} />
                                    Issue Details
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Issue Type</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedResolution.issueTypeDisplay}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Complaint</p>
                                        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">{selectedResolution.complaint}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Submitted On</p>
                                        <p className="text-sm text-gray-700">{formatDateTime(selectedResolution.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            {selectedResolution.attachments && selectedResolution.attachments.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <FileText size={16} />
                                        Attachments ({selectedResolution.attachments.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedResolution.attachments.map((attachment, index) => (
                                            <a
                                                key={index}
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-primary transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {attachment.fileType === 'image' ? (
                                                        <ImageIcon size={18} className="text-blue-500" />
                                                    ) : attachment.fileType === 'pdf' ? (
                                                        <FileText size={18} className="text-red-500" />
                                                    ) : (
                                                        <FileText size={18} className="text-gray-500" />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                                                            {attachment.fileName}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {attachment.fileType} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                        View
                                                    </span>
                                                    <ExternalLink size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Response (if any) */}
                            {(selectedResolution.adminNotes || selectedResolution.resolution) && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <MessageSquare size={16} />
                                        Admin Response
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedResolution.adminNotes && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Admin Notes</p>
                                                <p className="text-sm text-gray-700">{selectedResolution.adminNotes}</p>
                                            </div>
                                        )}
                                        {selectedResolution.resolution && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Resolution</p>
                                                <p className="text-sm text-gray-700">{selectedResolution.resolution}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        handleOpenUpdateModal(selectedResolution);
                                    }}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                                >
                                    <Edit size={16} />
                                    Update Status
                                </button>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {showUpdateModal && selectedResolution && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-900">Update Complaint Status</h3>
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Status Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={updateData.status}
                                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_review">Under Review</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="rejected">Rejected</option>
                                    {/* <option value="refunded">Refunded</option> */}
                                </select>
                            </div>

                            {/* Refund Amount (shown only if status is refunded) */}
                            {/* {updateData.status === 'refunded' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Refund Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={selectedResolution?.orderId?.amount}
                                        // value={updateData.refundAmount}
                                        // onChange={(e) => setUpdateData({ ...updateData, refundAmount: e.target.value })}
                                        onChange={(e) => setUpdateData({ ...updateData, refundAmount: selectedResolution?.orderId?.amount })}
                                        placeholder="Enter refund amount"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            )} */}

                            {/* Admin Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Notes (Internal)
                                </label>
                                <textarea
                                    value={updateData.adminNotes}
                                    onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                                    rows={3}
                                    placeholder="Add internal notes about this complaint..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            {/* Resolution Message (shown to user) */}
                            {(updateData.status === 'resolved' || updateData.status === 'rejected') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Resolution Message (Sent to User)
                                    </label>
                                    <textarea
                                        value={updateData.resolution}
                                        onChange={(e) => setUpdateData({ ...updateData, resolution: e.target.value })}
                                        rows={3}
                                        placeholder="Explain the resolution or rejection reason to the user..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            )}

                            {/* Order Status Update Section */}
                            <div className="border-t border-gray-200 pt-4 mt-2">
                                <label className="flex items-center gap-2 mb-3">
                                    <input
                                        type="checkbox"
                                        checked={updateData.updateOrderStatus}
                                        onChange={(e) => setUpdateData({ ...updateData, updateOrderStatus: e.target.checked })}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Also update order status</span>
                                </label>

                                {updateData.updateOrderStatus && (
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                        <h4 className="text-sm font-medium text-gray-800">Order Status Updates</h4>

                                        {/* Quick Action Buttons */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setUpdateData({
                                                    ...updateData,
                                                    orderStatusUpdate: {
                                                        paymentStatus: "refunded",
                                                        orderStatus: "cancelled"
                                                    }
                                                })}
                                                className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                Process Refund
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUpdateData({
                                                    ...updateData,
                                                    orderStatusUpdate: {
                                                        paymentStatus: updateData.status === "refunded" ? "refunded" : "paid",
                                                        orderStatus: "cancelled"
                                                    }
                                                })}
                                                className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                                            >
                                                Cancel Order
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUpdateData({
                                                    ...updateData,
                                                    orderStatusUpdate: {
                                                        paymentStatus: "paid",
                                                        orderStatus: "completed"
                                                    }
                                                })}
                                                className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                Mark Completed
                                            </button>
                                        </div>

                                        {/* Manual Status Selectors */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Payment Status
                                                </label>
                                                <select
                                                    value={updateData.orderStatusUpdate?.paymentStatus || ''}
                                                    onChange={(e) => setUpdateData({
                                                        ...updateData,
                                                        orderStatusUpdate: {
                                                            ...updateData.orderStatusUpdate,
                                                            paymentStatus: e.target.value
                                                        }
                                                    })}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="">No change</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="refunded">Refunded</option>
                                                    <option value="failed">Failed</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Order Status
                                                </label>
                                                <select
                                                    value={updateData.orderStatusUpdate?.orderStatus || ''}
                                                    onChange={(e) => setUpdateData({
                                                        ...updateData,
                                                        orderStatusUpdate: {
                                                            ...updateData.orderStatusUpdate,
                                                            orderStatus: e.target.value
                                                        }
                                                    })}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="">No change</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Refund Amount (shown if refund selected) */}
                                        {updateData.orderStatusUpdate?.paymentStatus === 'refunded' && (
                                            <div>
                                                {/* <label className="block text-xs font-medium text-gray-600 mb-1">
                                                    Refund Amount (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    // value={updateData.refundAmount}
                                                    value={selectedResolution?.orderId?.amount}
                                                    // onChange={(e) => setUpdateData({ ...updateData, refundAmount: e.target.value })}
                                                    onChange={(e) => setUpdateData({ ...updateData, refundAmount: selectedResolution?.orderId?.amount })}
                                                    placeholder={`Max: ₹${selectedResolution?.orderId?.amount || 0}`}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                /> */}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Order amount: ₹{selectedResolution?.orderId?.amount || 0}
                                                </p>
                                            </div>
                                        )}

                                        {/* Warning for refund */}
                                        {updateData.orderStatusUpdate?.paymentStatus === 'refunded' && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                                <p className="text-xs text-yellow-800 flex items-center gap-1">
                                                    <AlertTriangle size={12} />
                                                    This will mark the order as refunded.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowUpdateModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateResolution}
                                disabled={updating}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {updating ? (
                                    <Loader size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Update
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ResolutionCenter;