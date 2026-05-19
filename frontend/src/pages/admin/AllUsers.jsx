import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    UserPlus,
    UserCheck,
    UserX,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    Shield,
    ShieldOff,
    Mail,
    Phone,
    MapPin,
    Calendar,
    DollarSign,
    Briefcase,
    ShoppingBag,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Download,
    Ban,
    Award,
    MessageSquare,
    Activity,
    TrendingUp,
    TrendingDown,
    X
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { dummyUserImg, userTypes } from '../../assets';
import { useCallback } from 'react';

const AllUsers = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verificationFilter, setVerificationFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const actionMenuRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        suspended: 0,
        banned: 0,
        pending: 0,
        freelancers: 0,
        buyers: 0,
        admins: 0,
        verified: 0,
        unverified: 0,
        newToday: 0,
        newThisWeek: 0,
        newThisMonth: 0
    });

    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('[data-action-menu]')) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: currentPage,
                limit: itemsPerPage
            });

            const response = await axiosInstance.get(`/api/v1/admin/users?${params}`);

            if (response.data.success) {
                const { users, pagination } = response.data.data;
                setAllUsers(users);
                setFilteredUsers(users); // Initialize filtered users
                setTotalPages(pagination.pages);
                setTotalUsers(pagination.total);

                fetchStats();
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/admin/users/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Filter function that runs on every filter change
    const applyFilters = useCallback(() => {
        let filtered = [...allUsers];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.firstName?.toLowerCase().includes(term) ||
                user.lastName?.toLowerCase().includes(term) ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user.country?.toLowerCase().includes(term) ||
                user.city?.toLowerCase().includes(term) ||
                user.companyName?.toLowerCase().includes(term) ||
                user.phone?.includes(term)
            );
        }

        // Apply role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.userType === roleFilter);
        }

        // Apply status filter (based on isActive)
        if (statusFilter !== 'all') {
            if (statusFilter === 'active') {
                filtered = filtered.filter(user => user.status === 'active');
            } else if (statusFilter === 'inactive') {
                filtered = filtered.filter(user => user.status === 'inactive');
            } else if (statusFilter === 'banned') {
                filtered = filtered.filter(user => user.status === 'banned');
            } else if (statusFilter === 'suspended') {
                filtered = filtered.filter(user => user.status === 'suspended');
            }
        }

        // Apply verification filter
        if (verificationFilter === 'verified') {
            filtered = filtered.filter(user => user.isVerified === true);
        } else if (verificationFilter === 'unverified') {
            filtered = filtered.filter(user => user.isVerified === false);
        }

        // Apply date range filter
        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            filtered = filtered.filter(user =>
                new Date(user.createdAt) >= cutoffDate
            );
        }

        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [allUsers, searchTerm, roleFilter, statusFilter, verificationFilter, dateRange]);

    // Apply filters whenever any filter changes
    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleRoleFilterChange = (value) => {
        setRoleFilter(value);
    };

    const getRoleBadge = (role) => {
        const config = {
            admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin', icon: Shield },
            freelancer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Mentor', icon: Briefcase },
            buyer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Student', icon: ShoppingBag }
        };
        const badge = config[role] || config.buyer;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon size={12} />
                {badge.label}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: CheckCircle },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            suspended: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Suspended', icon: AlertCircle },
            banned: { bg: 'bg-red-100', text: 'text-red-700', label: 'Banned', icon: Ban }
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

    const getVerificationBadge = (verified) => {
        return verified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <CheckCircle size={12} />
                Verified
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                <XCircle size={12} />
                Unverified
            </span>
        );
    };

    const formatDate = (dateString) => {
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
        }).format(amount);
    };

    const handleSuspendUser = async (userId, reason) => {
        try {
            const response = await axiosInstance.post(`/api/v1/admin/users/${userId}/suspend`, { reason });

            if (response.data.success) {
                const updatedUser = response.data.data; // Get the updated user from response

                // Update allUsers with the complete updated user object
                const updatedAllUsers = allUsers.map(user =>
                    user._id === userId ? updatedUser : user
                );
                setAllUsers(updatedAllUsers);

                // Update filteredUsers with the complete updated user object
                const updatedFilteredUsers = filteredUsers.map(user =>
                    user._id === userId ? updatedUser : user
                );
                setFilteredUsers(updatedFilteredUsers);

                fetchStats();
                toast.success('User suspended successfully');
                setShowSuspendModal(false);
                setSelectedUser(null);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to suspend user');
        }
    };

    const handleBanUser = async (userId, reason) => {
        try {
            const response = await axiosInstance.post(`/api/v1/admin/users/${userId}/ban`, { reason });

            if (response.data.success) {
                const updatedUser = response.data.data; // Get the updated user from response

                // Update allUsers with the complete updated user object
                const updatedAllUsers = allUsers.map(user =>
                    user._id === userId ? updatedUser : user
                );
                setAllUsers(updatedAllUsers);

                // Update filteredUsers with the complete updated user object
                const updatedFilteredUsers = filteredUsers.map(user =>
                    user._id === userId ? updatedUser : user
                );
                setFilteredUsers(updatedFilteredUsers);

                fetchStats();
                toast.success('User banned successfully');
                setShowDeleteModal(false);
                setSelectedUser(null);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to ban user');
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            const response = await axiosInstance.post(`/api/v1/admin/users/${userId}/activate`);

            if (response.data.success) {
                const updatedUser = response.data.data; // Get the updated user from response

                // Update allUsers with the complete updated user object
                const updatedAllUsers = allUsers.map(user =>
                    user._id === userId ? updatedUser : user
                );
                setAllUsers(updatedAllUsers);

                // Update filteredUsers with the complete updated user object
                const updatedFilteredUsers = filteredUsers.map(user =>
                    user._id === userId ? updatedUser : user
                );
                setFilteredUsers(updatedFilteredUsers);

                fetchStats();
                toast.success('User activated successfully');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to activate user');
        }
    };

    const handleVerifyUser = async (userId) => {
        try {
            const response = await axiosInstance.post(`/api/v1/admin/users/${userId}/verify`);

            if (response.data.success) {
                const updatedUser = response.data.data; // Get the updated user from response

                // Update allUsers with the complete updated user object
                const updatedAllUsers = allUsers.map(user =>
                    user._id === userId ? updatedUser : user
                );
                setAllUsers(updatedAllUsers);

                // Update filteredUsers with the complete updated user object
                const updatedFilteredUsers = filteredUsers.map(user =>
                    user._id === userId ? updatedUser : user
                );
                setFilteredUsers(updatedFilteredUsers);

                fetchStats();
                toast.success('User verified successfully');
                setShowVerifyModal(false);
                setSelectedUser(null);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to verify user');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await axiosInstance.delete(`/api/v1/admin/users/${userId}`);

            if (response.data.success) {
                // Remove from allUsers
                const updatedAllUsers = allUsers.filter(user => user._id !== userId);
                setAllUsers(updatedAllUsers);

                // Remove from filteredUsers
                const updatedFilteredUsers = filteredUsers.filter(user => user._id !== userId);
                setFilteredUsers(updatedFilteredUsers);

                fetchStats();
                toast.success('User deleted successfully');
                setShowDeleteModal(false);
                setSelectedUser(null);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleSendMessage = (userId) => {
        navigate(`/admin/messages?user=${userId}`);
    };

    const handleViewMore = (userId) => {
        navigate(`/freelancer/${userId}`);
    };

    const handleViewProfile = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    const handleEditUser = (userId) => {
        navigate(`/admin/users/edit/${userId}`);
    };

    // const filteredUsers = users.filter(user => {
    //     if (searchTerm) {
    //         const term = searchTerm.toLowerCase();
    //         const matches =
    //             user.displayName.toLowerCase().includes(term) ||
    //             user.email.toLowerCase().includes(term) ||
    //             user?.country?.toLowerCase().includes(term) ||
    //             user.company?.toLowerCase().includes(term) ||
    //             user.phone?.includes(term);
    //         if (!matches) return false;
    //     }

    //     if (roleFilter !== 'all' && user?.userType !== roleFilter) return false;
    //     if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    //     if (verificationFilter === 'verified' && !user?.isVerified) return false;
    //     if (verificationFilter === 'unverified' && user?.isVerified) return false;

    //     if (dateRange !== 'all') {
    //         const days = parseInt(dateRange);
    //         const userDate = new Date(user?.createdAt);
    //         const cutoff = new Date();
    //         cutoff.setDate(cutoff.getDate() - days);
    //         if (userDate < cutoff) return false;
    //     }

    //     return true;
    // });

    // Pagination

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    // const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => fetchUsers()}
                                className="p-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-600 flex items-center gap-1"
                                title="Refresh"
                            >
                                <RefreshCw size={18} className="" />
                                <span>Refresh</span>
                            </button>
                            {/* <button
                                onClick={() => navigate('/admin/users/create')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                            >
                                <UserPlus size={18} />
                                Add New User
                            </button> */}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Total Users</p>
                                    <p className="text-xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <UserCheck size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Active</p>
                                    <p className="text-xl font-bold">{stats.active}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Briefcase size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Mentors</p>
                                    <p className="text-xl font-bold">{stats.freelancers}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <ShoppingBag size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Students</p>
                                    <p className="text-xl font-bold">{stats.buyers}</p>
                                </div>
                            </div>
                        </div>
                        {/* <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock size={20} className="text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Pending</p>
                                    <p className="text-xl font-bold">{stats.pending}</p>
                                </div>
                            </div>
                        </div> */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Ban size={20} className="text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Banned</p>
                                    <p className="text-xl font-bold">{stats.banned}</p>
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
                                    placeholder="Search by name, email, location, company..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        // No API call, just local filtering via useEffect
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => handleRoleFilterChange(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="freelancer">Mentor</option>
                                    <option value="buyer">Student</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        // No API call
                                    }}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="banned">Banned</option>
                                </select>
                                <select
                                    value={verificationFilter}
                                    onChange={(e) => {
                                        setVerificationFilter(e.target.value);
                                        // No API call
                                    }}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                >
                                    <option value="all">All Verification</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                                {/* <select
                                    value={dateRange}
                                    onChange={(e) => {
                                        setDateRange(e.target.value);
                                        // No API call
                                    }}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white min-w-[130px]"
                                >
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                    <option value="365">Last year</option>
                                    <option value="all">All time</option>
                                </select> */}
                            </div>
                        </div>
                    </div>

                    {/* Users Table - Desktop */}
                    <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Verification</th> */}
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user?._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.profileImage || dummyUserImg}
                                                            alt={user.firstName + ' ' + user.lastName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                            {user.badges && user.badges.length > 0 && (
                                                                <div className="flex gap-1 mt-1">
                                                                    {user.badges.includes('top_rated') && (
                                                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                                                                            Top Rated
                                                                        </span>
                                                                    )}
                                                                    {user.badges.includes('admin') && (
                                                                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                                                                            Admin
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getRoleBadge(user?.userType)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(user?.status)}
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    {getVerificationBadge(user?.isVerified)}
                                                </td> */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <MapPin size={14} className="text-gray-400" />
                                                        {user?.country || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <div>{formatDate(user?.createdAt)}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowUserModal(true);
                                                            }}
                                                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditUser(user?._id)}
                                                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                            title="Edit User"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        {/* <button
                                                            onClick={() => handleSendMessage(user?._id)}
                                                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                            title="Send Message"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button> */}

                                                        {/* Three Dots Dropdown */}
                                                        <div className="relative" data-action-menu>
                                                            <button
                                                                onClick={() => setOpenActionMenu(openActionMenu === user?._id ? null : user?._id)}
                                                                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                                title="More Actions"
                                                            >
                                                                <MoreVertical size={18} />
                                                            </button>

                                                            {/* Dropdown Menu */}
                                                            {openActionMenu === user?._id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                                    {!user?.isVerified && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedUser(user);
                                                                                setShowVerifyModal(true);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                                                                        >
                                                                            <CheckCircle size={16} />
                                                                            Verify User
                                                                        </button>
                                                                    )}

                                                                    {user.status === 'active' && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedUser(user);
                                                                                setShowSuspendModal(true);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                                                                        >
                                                                            <Ban size={16} />
                                                                            Suspend User
                                                                        </button>
                                                                    )}

                                                                    {(user.status === 'suspended' || user.status === 'banned') && (
                                                                        <button
                                                                            onClick={() => {
                                                                                handleActivateUser(user?._id);
                                                                                setOpenActionMenu(null);
                                                                            }}
                                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                                                        >
                                                                            <CheckCircle size={16} />
                                                                            Activate User
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedUser(user);
                                                                            setShowDeleteModal(true);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                        Ban User
                                                                    </button>

                                                                    {/* <hr className="my-1 border-gray-200" /> */}

                                                                    {/* <button
                                                                        onClick={() => {
                                                                            // Handle view reports
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                    >
                                                                        <AlertCircle size={16} />
                                                                        View Reports ({user.reports || 0})
                                                                    </button> */}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Users size={40} className="text-gray-300 mb-3" />
                                                    <p className="text-gray-500 font-medium">No users found</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm ? 'Try adjusting your search' : 'No users match the selected filters'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredUsers.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
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

                    {/* Users List - Mobile */}
                    <div className="md:hidden space-y-4 mb-6">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <div key={user?._id} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <img
                                            src={user.profileImage || dummyUserImg}
                                            alt={user.firstName + ' ' + user.lastName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium text-gray-900">{user.name}</h3>
                                                <div className="flex gap-1">
                                                    {getRoleBadge(user?.userType)}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getStatusBadge(user?.status)}
                                                {/* {getVerificationBadge(user?.isVerified)} */}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Location:</span>
                                            <span className="ml-1 text-gray-900">{user?.country || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Joined:</span>
                                            <span className="ml-1 text-gray-900">{formatDate(user?.createdAt)}</span>
                                        </div>
                                        {user?.userType === 'freelancer' && (
                                            <>
                                                <div>
                                                    <span className="text-gray-500">Earnings:</span>
                                                    <span className="ml-1 font-medium text-green-600">{formatCurrency(user.earnings)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Rating:</span>
                                                    <span className="ml-1 flex items-center gap-1">
                                                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                        {user.rating}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        {user?.userType === 'buyer' && (
                                            <>
                                                <div>
                                                    <span className="text-gray-500">Spent:</span>
                                                    <span className="ml-1 font-medium text-blue-600">{formatCurrency(user.spent)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Projects:</span>
                                                    <span className="ml-1">{user.projectsPosted}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowUserModal(true);
                                                }}
                                                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEditUser(user?._id)}
                                                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {/* <button
                                                onClick={() => handleSendMessage(user?._id)}
                                                className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                            >
                                                <MessageSquare size={18} />
                                            </button> */}

                                            {/* Three Dots Dropdown - Mobile */}
                                            <div className="relative" data-action-menu>
                                                <button
                                                    onClick={() => setOpenActionMenu(openActionMenu === user?._id ? null : user?._id)}
                                                    className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {/* Dropdown Menu - Position adjusted for mobile */}
                                                {openActionMenu === user?._id && (
                                                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                        {!user?.isVerified && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowVerifyModal(true);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                                                            >
                                                                <CheckCircle size={16} />
                                                                Verify User
                                                            </button>
                                                        )}

                                                        {user.status === 'active' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowSuspendModal(true);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                                                            >
                                                                <Ban size={16} />
                                                                Suspend User
                                                            </button>
                                                        )}

                                                        {user.status === 'suspended' && (
                                                            <button
                                                                onClick={() => {
                                                                    handleActivateUser(user?._id);
                                                                    setOpenActionMenu(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                                                            >
                                                                <CheckCircle size={16} />
                                                                Activate User
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowDeleteModal(true);
                                                                setOpenActionMenu(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={16} />
                                                            Ban User
                                                        </button>

                                                        {/* <hr className="my-1 border-gray-200" /> */}

                                                        {/* <button
                                                            onClick={() => {
                                                                // Handle view reports
                                                                setOpenActionMenu(null);
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <AlertCircle size={16} />
                                                            View Reports ({user.reports || 0})
                                                        </button> */}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            ID: {user?._id}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                <Users size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No users found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {searchTerm ? 'Try adjusting your search' : 'No users match the selected filters'}
                                </p>
                            </div>
                        )}

                        {/* Mobile Pagination */}
                        {filteredUsers.length > 0 && (
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

                    {/* User Statistics Summary */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Activity size={16} className="text-primary" />
                                New Users
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Today</span>
                                    <span className="font-medium text-gray-900">{stats.newToday}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">This Week</span>
                                    <span className="font-medium text-gray-900">{stats.newThisWeek}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">This Month</span>
                                    <span className="font-medium text-gray-900">{stats.newThisMonth}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-600" />
                                Verification
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Verified</span>
                                    <span className="font-medium text-green-600">{stats?.verified}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Unverified</span>
                                    <span className="font-medium text-gray-600">{stats.unverified}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Verification Rate</span>
                                    <span className="font-medium text-blue-600">
                                        {((stats?.verified / stats.total) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <AlertCircle size={16} className="text-orange-600" />
                                Issues
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Suspended</span>
                                    <span className="font-medium text-orange-600">{stats.suspended}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Banned</span>
                                    <span className="font-medium text-red-600">{stats.banned}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Pending</span>
                                    <span className="font-medium text-yellow-600">{stats.pending}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <TrendingUp size={16} className="text-purple-600" />
                                Platform Users
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Active Users</span>
                                    <span className="font-medium text-green-600">{stats.active}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Freelancers</span>
                                    <span className="font-medium text-purple-600">{stats.freelancers}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Buyers</span>
                                    <span className="font-medium text-blue-600">{stats.buyers}</span>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </AdminContainer>
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                                <p className="text-sm text-gray-500 mt-1">User ID: {selectedUser?._id}</p>
                            </div>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="flex items-start gap-4">
                                <img
                                    src={selectedUser.profileImage || dummyUserImg}
                                    alt={selectedUser.firstName + ' ' + selectedUser.lastName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xl font-bold text-gray-900">{selectedUser.name}</h4>
                                        {selectedUser.badges?.includes('top_rated') && (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                Top Rated
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {getRoleBadge(selectedUser?.userType)}
                                        {getStatusBadge(selectedUser?.status)}
                                        {getVerificationBadge(selectedUser?.isVerified)}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Mail size={16} />
                                    Contact Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-gray-900">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="text-gray-900">{selectedUser.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Location</p>
                                        <p className="text-gray-900 flex items-center gap-1">
                                            <MapPin size={14} className="text-gray-400" />
                                            {selectedUser?.country || 'N/A'}
                                        </p>
                                    </div>
                                    {selectedUser.company && (
                                        <div>
                                            <p className="text-xs text-gray-500">Company</p>
                                            <p className="text-gray-900">{selectedUser.company}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Stats */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Activity size={16} />
                                    Account Statistics
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Joined</p>
                                        <p className="font-medium">{formatDate(selectedUser?.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Last Active</p>
                                        <p className="font-medium">{formatDate(selectedUser.lastLogin || selectedUser.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Role-specific Stats */}
                            {selectedUser?.userType === 'freelancer' && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Briefcase size={16} />
                                        Mentor Statistics
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Earnings</p>
                                            <p className="font-medium text-green-600">{formatCurrency(selectedUser.earnings)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Projects Completed</p>
                                            <p className="font-medium">{selectedUser.projectsCompleted}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Active Services</p>
                                            <p className="font-medium">{selectedUser.servicesActive}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Rating</p>
                                            <p className="font-medium flex items-center gap-1">
                                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                {selectedUser.rating} ({selectedUser.reviews} reviews)
                                            </p>
                                        </div>
                                    </div>
                                    {selectedUser.skills && selectedUser.skills.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 mb-2">Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUser.skills.map((skill, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-white text-gray-700 text-xs rounded border border-gray-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedUser?.userType === 'buyer' && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <ShoppingBag size={16} />
                                        {userTypes?.buyer} Statistics
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Total Spent</p>
                                            <p className="font-medium text-blue-600">{formatCurrency(selectedUser.spent)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Projects Posted</p>
                                            <p className="font-medium">{selectedUser.projectsPosted}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Rating</p>
                                            <p className="font-medium flex items-center gap-1">
                                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                {selectedUser.rating} ({selectedUser.reviews} reviews)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Issue Details */}
                            {selectedUser.status === 'suspended' && selectedUser.suspensionReason && (
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <p className="text-sm text-orange-700">
                                        <span className="font-medium">Suspension Reason:</span> {selectedUser.suspensionReason}
                                    </p>
                                </div>
                            )}

                            {selectedUser.status === 'banned' && selectedUser.banReason && (
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <p className="text-sm text-red-700">
                                        <span className="font-medium">Ban Reason:</span> {selectedUser.banReason}
                                    </p>
                                </div>
                            )}

                            {selectedUser.reports > 0 && (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-sm text-yellow-700">
                                        <span className="font-medium">Reports:</span> {selectedUser.reports} reports • {selectedUser.warnings} warnings
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4">
                                <button
                                    onClick={() => handleEditUser(selectedUser?._id)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <Edit size={18} />
                                    Edit User
                                </button>
                                <button
                                    onClick={() => handleViewMore(selectedUser?._id)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                >
                                    <Eye size={18} />
                                    View More
                                </button>
                                {!selectedUser?.isVerified && (
                                    <button
                                        onClick={() => {
                                            setShowUserModal(false);
                                            setShowVerifyModal(true);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Verify
                                    </button>
                                )}
                                {selectedUser.status === 'active' && (
                                    <button
                                        onClick={() => {
                                            setShowUserModal(false);
                                            setShowSuspendModal(true);
                                        }}
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
                                    >
                                        <Ban size={18} />
                                        Suspend
                                    </button>
                                )}
                                {selectedUser.status === 'suspended' && (
                                    <button
                                        onClick={() => handleActivateUser(selectedUser?._id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Activate
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowUserModal(false);
                                        setShowDeleteModal(true);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Verify Confirmation Modal */}
            {showVerifyModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Verify User</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to verify "{selectedUser?.firstName + " " + selectedUser?.lastName}"? This will mark their account as verified.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowVerifyModal(false);
                                    setSelectedUser(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleVerifyUser(selectedUser?._id)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Verify User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Confirmation Modal */}
            {showSuspendModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Suspend User</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to suspend "{selectedUser?.firstName + " " + selectedUser?.lastName}"?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for suspension
                            </label>
                            <textarea
                                id="suspendReason"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter reason for suspension..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setSelectedUser(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const reason = document.getElementById('suspendReason').value;
                                    if (!reason) {
                                        toast.error('Please provide a reason');
                                        return;
                                    }
                                    handleSuspendUser(selectedUser?._id, reason);
                                }}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                            >
                                Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete/Ban Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Ban User</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to ban "{selectedUser?.firstName + " " + selectedUser?.lastName}"? This action cannot be undone.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for banning
                            </label>
                            <textarea
                                id="banReason"
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter reason for banning..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedUser(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const reason = document.getElementById('banReason').value;
                                    if (!reason) {
                                        toast.error('Please provide a reason');
                                        return;
                                    }
                                    handleBanUser(selectedUser?._id, reason);
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Ban User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AllUsers;