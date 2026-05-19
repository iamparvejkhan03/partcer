import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Heading, HeadingDescription, Subheading } from '../components';
import BuyerProjectCard from '../components/BuyerProjectCard';
import ExpressInterestModal from '../components/freelancer/ExpressInterestModal';
import {
    Heart,
    Share2,
    Star,
    Calendar,
    FileText,
    Clock,
    Eye,
    DollarSign,
    Users,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    ArrowRight,
    Download,
    Bookmark,
    UserCheck,
    Filter,
    Loader,
    X,
    FolderOpen,
    Tag,
    Wrench,
    Info,
    Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

const ProjectDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [similarProjects, setSimilarProjects] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showAllAbout, setShowAllAbout] = useState(false);
    const [applicants, setApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [applicantFilter, setApplicantFilter] = useState('all');
    const [applicantSearch, setApplicantSearch] = useState('');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showExpressModal, setShowExpressModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [userProposal, setUserProposal] = useState(null);

    // Period and display mappings
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

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    useEffect(() => {
        if (project && isAuthenticated) {
            // Check if user has already applied
            if (user?.userType === 'freelancer' && project.proposals) {
                const userApplication = project.proposals.find(p => p.freelancer === user?._id);
                const applied = !!userApplication;
                setHasApplied(applied);
                if (userApplication) {
                    setUserProposal({
                        ...userApplication,
                        selectedPeriod: userApplication.selectedPeriod || project.period,
                        selectedDuration: userApplication.selectedDuration || project.duration,
                        selectedService: userApplication.selectedService || project.service
                    });
                }
            }

            // Check if user is the project owner
            if (user?.userType === 'buyer' && project.buyer?._id === user?._id) {
                setIsOwner(true);
            }

            if (user?.userType === 'admin') {
                setIsAdmin(true);
            }
        }
    }, [project, isAuthenticated, user]);

    // Filter applicants based on status and search
    useEffect(() => {
        if (applicants.length > 0) {
            let filtered = [...applicants];

            if (applicantFilter !== 'all') {
                filtered = filtered.filter(a => a.status === applicantFilter);
            }

            if (applicantSearch.trim()) {
                const searchTerm = applicantSearch.toLowerCase();
                filtered = filtered.filter(a =>
                    a.freelancerName?.toLowerCase().includes(searchTerm) ||
                    a.proposal?.toLowerCase().includes(searchTerm)
                );
            }

            setFilteredApplicants(filtered);
        }
    }, [applicantFilter, applicantSearch, applicants]);

    const handleViewMyProposal = () => {
        setShowProposalModal(true);
    };

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get(`/api/v1/projects/${projectId}`);

            if (response.data.success) {
                const projectData = response.data.data;
                setProject(projectData);
                setSimilarProjects(projectData.similar || []);

                // If user is the buyer, fetch applicants/proposals
                if (isAuthenticated && user?.userType === 'buyer' && projectData.buyer?._id === user?._id) {
                    fetchApplicants(projectData._id);
                }
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            if (error.response?.status === 404) {
                toast.error('Project not found');
                navigate('/projects');
            } else {
                toast.error('Failed to load project details');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async (projectId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/projects/${projectId}/proposals`);
            if (response.data.success) {
                const proposalsData = response.data.data?.proposals || [];
                setApplicants(proposalsData);
                setFilteredApplicants(proposalsData);
            }
        } catch (error) {
            console.error('Error fetching proposals:', error);
        }
    };

    const handleSaveProject = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to save projects');
            navigate('/login');
            return;
        }

        if (user?.userType !== 'freelancer') {
            toast.error('Only freelancers can save projects');
            return;
        }

        try {
            if (isSaved) {
                await axiosInstance.delete(`/api/v1/projects/${project._id}/save`);
                setIsSaved(false);
                toast.success('Project removed from saved');
            } else {
                await axiosInstance.post(`/api/v1/projects/${project._id}/save`);
                setIsSaved(true);
                toast.success('Project saved successfully');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to save project';
            toast.error(errorMessage);
        }
    };

    const handleShareProject = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    const handleEditProject = () => {
        navigate(`/buyer/projects/edit/${project._id}`);
    };

    const handleExpressInterest = async (data) => {
        try {
            setApplying(true);

            const response = await axiosInstance.post(`/api/v1/projects/${project._id}/apply`, {
                proposal: data.proposal,
                period: data.period,
                duration: data.duration,
                service: data.service
            });

            if (response.data.success) {
                toast.success('Interest expressed successfully!');
                setShowExpressModal(false);
                setHasApplied(true);
                fetchProjectDetails();
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to submit interest';
            toast.error(errorMessage);
        } finally {
            setApplying(false);
        }
    };

    const handleViewApplicantProfile = (applicantId) => {
        navigate(`/freelancer/${applicantId}`);
    };

    const handleMessageApplicant = (applicantId) => {
        navigate(`/messages?user=${applicantId}`);
    };

    const handleShortlistApplicant = async (proposalId) => {
        try {
            await axiosInstance.patch(
                `/api/v1/projects/${project._id}/proposals/${proposalId}`,
                { status: 'accepted' }
            );
            toast.success('Applicant shortlisted');
            fetchApplicants(project._id);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to shortlist applicant';
            toast.error(errorMessage);
        }
    };

    const handleRejectApplicant = async (proposalId) => {
        try {
            await axiosInstance.patch(
                `/api/v1/projects/${project._id}/proposals/${proposalId}`,
                { status: 'rejected' }
            );
            toast.success('Application rejected');
            fetchApplicants(project._id);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to reject applicant';
            toast.error(errorMessage);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
        };
        const badge = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-gray-50">
                <Container>
                    <div className="flex justify-center items-center h-64">
                        <Loader className="animate-spin h-12 w-12 text-primary" />
                    </div>
                </Container>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-gray-50">
                <Container>
                    <div className="text-center py-12">
                        <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
                        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
                        <Link
                            to="/projects"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        >
                            <ArrowRight size={18} />
                            Browse Projects
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-gray-50">
            {/* Breadcrumb Header */}
            <div className="bg-white border-b border-gray-200">
                <Container>
                    <div className="py-4">
                        <nav className="flex items-center space-x-2 text-sm text-gray-600">
                            <Link to="/" className="hover:text-primary transition-colors">
                                Home
                            </Link>
                            <span className="text-gray-400">›</span>
                            <Link to="/projects" className="hover:text-primary transition-colors">
                                Projects
                            </Link>
                            <span className="text-gray-400">›</span>
                            <span className="text-primary font-medium line-clamp-1">{project.title}</span>
                        </nav>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Project Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {project.title}
                                </h1>
                                <div className="flex items-center gap-2">
                                    {/* {!isOwner && user?.userType === 'freelancer' && (
                                        <button
                                            onClick={handleSaveProject}
                                            className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                            title="Save project"
                                        >
                                            <Bookmark size={20} className={isSaved ? 'fill-primary text-primary' : 'text-gray-600'} />
                                        </button>
                                    )} */}
                                    <button
                                        onClick={handleShareProject}
                                        className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        title="Share"
                                    >
                                        <Share2 size={20} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Category & Subcategory Pills */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.category && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        <Tag size={14} />
                                        {typeof project.category === 'object' ? project.category.name : project.category}
                                    </span>
                                )}
                                {project.subCategory && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        <FolderOpen size={14} />
                                        {typeof project.subCategory === 'object' ? project.subCategory.name : project.subCategory}
                                    </span>
                                )}
                            </div>

                            {/* Project Stats */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-1.5">
                                    <Eye size={16} className="text-gray-400" />
                                    <span>{project.views || 0} views</span>
                                </div>
                                {/* <div className="flex items-center gap-1.5">
                                    <Bookmark size={16} className="text-gray-400" />
                                    <span>{project.saves || 0} saves</span>
                                </div> */}
                                <div className="flex items-center gap-1.5">
                                    <Users size={16} className="text-gray-400" />
                                    <span>{project.proposalsCount || 0} interested</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>Posted {formatDate(project.createdAt)}</span>
                                </div>
                            </div>

                            {/* Key Details Grid - Updated for new model */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Service</p>
                                    <p className="font-semibold text-gray-900">{project.service || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Period</p>
                                    <p className="font-semibold text-gray-900">{getPeriodLabel(project.period)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                                    <p className="font-semibold text-gray-900">
                                        {project.durationDisplay || getDurationLabel(project.period, project.duration)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Project Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h2>
                            <div className="prose max-w-none text-gray-700">
                                <div
                                    className="whitespace-pre-line"
                                    dangerouslySetInnerHTML={{
                                        __html: showFullDescription
                                            ? project.description
                                            : project.description?.substring(0, 500) + (project.description?.length > 500 ? '...' : '')
                                    }}
                                />
                                {project.description?.length > 500 && (
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="text-primary hover:text-primary-dark font-medium mt-2"
                                    >
                                        {showFullDescription ? 'Read Less' : 'Read More'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Skills Required */}
                        {project.skills && project.skills.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Wrench size={18} />
                                    Skills Required
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {project.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                                        >
                                            {typeof skill === 'string' ? skill : skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        {project.additionalInfo && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                                <div className="whitespace-pre-line text-gray-700">
                                    {project.additionalInfo}
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        {project.attachments && project.attachments.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
                                <div className="space-y-3">
                                    {project.attachments.map((file, index) => (
                                        <a
                                            key={index}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={18} className="text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-700">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <Download size={18} className="text-gray-400" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Buyer/Client Card */}
                        {project.buyer && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        {project.buyer.profileImage ? (
                                            <img
                                                src={project.buyer.profileImage}
                                                loading='lazy'
                                                alt={project.buyer.displayName || project.buyer.firstName}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                                <Users size={24} className="text-gray-500" />
                                            </div>
                                        )}
                                        {project.buyer.isVerified && (
                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                                                <CheckCircle size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900">
                                                {project.buyer.displayName ||
                                                    `${project.buyer.firstName || ''} ${project.buyer.lastName || ''}`.trim() ||
                                                    'Student'}
                                            </h3>
                                            {project.buyer.isVerified && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        {project.buyer.companyName && (
                                            <p className="text-sm text-gray-600">{project.buyer.companyName}</p>
                                        )}
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        className={star <= Math.round(project.buyer.rating || 0)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium">{project.buyer.rating || 0}</span>
                                            <span className="text-xs text-gray-500">({project.buyer.reviewCount || 0} reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    {project.buyer.country && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Location</span>
                                            <span className="font-medium text-gray-900">{project.buyer.country}</span>
                                        </div>
                                    )}
                                    {project.buyer.createdAt && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Member Since</span>
                                            <span className="font-medium text-gray-900">{formatDate(project.buyer.createdAt)}</span>
                                        </div>
                                    )}
                                    {/* <div className="flex justify-between">
                                        <span className="text-gray-600">Total Projects</span>
                                        <span className="font-medium text-gray-900">{project.buyer.projectsPosted || 0}</span>
                                    </div> */}
                                </div>

                                {project.buyer.bio && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-700 mb-2">
                                            {showAllAbout ? project.buyer.bio : `${project.buyer.bio.substring(0, 100)}${project.buyer.bio.length > 100 ? '...' : ''}`}
                                        </p>
                                        {project.buyer.bio.length > 100 && (
                                            <button
                                                onClick={() => setShowAllAbout(!showAllAbout)}
                                                className="text-primary hover:text-primary-dark text-sm font-medium"
                                            >
                                                {showAllAbout ? 'Read Less' : 'Read More'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-6 space-y-3">
                                    {isOwner ? (
                                        <>
                                            <button
                                                onClick={handleEditProject}
                                                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FileText size={18} />
                                                Edit Project
                                            </button>
                                            <Link
                                                to={`/buyer/projects/all`}
                                                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FolderOpen size={18} />
                                                View All Projects
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            {isAuthenticated && user?.userType === 'freelancer' ? (
                                                hasApplied ? (
                                                    // Show "View Your Proposal" button instead of Express Interest
                                                    <button
                                                        onClick={handleViewMyProposal}
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <FileText size={18} />
                                                        View Your Proposal
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowExpressModal(true)}
                                                        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Briefcase size={18} />
                                                        Express Interest
                                                    </button>
                                                )
                                            ) : isAuthenticated && user?.userType === 'buyer' ? (
                                                <Link
                                                    to={`/buyer/projects/edit/${project._id}`}
                                                    className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FileText size={18} />
                                                    Edit Project
                                                </Link>
                                            ) : isAuthenticated && user?.userType === 'admin' ? (
                                                <>
                                                    <Link
                                                        to={`/admin/projects/edit/${project._id}`}
                                                        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <FileText size={18} />
                                                        Edit Project
                                                    </Link>
                                                    <Link
                                                        to={`/admin/projects/all`}
                                                        className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <FolderOpen size={18} />
                                                        View All Projects
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <Link
                                                        to="/login"
                                                        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Briefcase size={18} />
                                                        Login to Express Interest
                                                    </Link>
                                                    <p className="text-xs text-center text-gray-500">
                                                        Don't have an account?{' '}
                                                        <Link to="/register" className="text-primary hover:underline">
                                                            Sign up
                                                        </Link>
                                                    </p>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Project Timeline */}
                        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Posted</span>
                                    <span className="font-medium text-gray-900">{formatDate(project.createdAt)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Service</span>
                                    <span className="font-medium text-gray-900">{project.service || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Period</span>
                                    <span className="font-medium text-gray-900 capitalize">{getPeriodLabel(project.period)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Duration</span>
                                    <span className="font-medium text-gray-900">
                                        {project.durationDisplay || getDurationLabel(project.period, project.duration)}
                                    </span>
                                </div>
                                {project.deadline && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Application Deadline</span>
                                        <span className="font-medium text-gray-900">{formatDate(project.deadline)}</span>
                                    </div>
                                )}
                            </div>
                        </div> */}

                        {/* Project Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Project Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Users size={20} className="mx-auto text-primary mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{project.proposalsCount || 0}</p>
                                    <p className="text-xs text-gray-600">Interested</p>
                                </div>
                                {/* <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <UserCheck size={20} className="mx-auto text-green-600 mb-2" />{console.log(project)}
                                    <p className="text-2xl font-bold text-gray-900">{project.shortlistedCount || 0}</p>
                                    <p className="text-xs text-gray-600">Shortlisted</p>
                                </div> */}
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Eye size={20} className="mx-auto text-blue-600 mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{project.views || 0}</p>
                                    <p className="text-xs text-gray-600">Total Views</p>
                                </div>
                                {/* <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Bookmark size={20} className="mx-auto text-purple-600 mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{project.saves || 0}</p>
                                    <p className="text-xs text-gray-600">Saves</p>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interested Mentors Section - Only visible to buyer who owns the project */}
                {isOwner && applicants.length > 0 && (
                    <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Interested Mentors</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {project.title} • {applicants.length} mentor{applicants.length !== 1 ? 's' : ''} interested
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Search */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search mentors..."
                                            value={applicantSearch}
                                            onChange={(e) => setApplicantSearch(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
                                        />
                                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>

                                    {/* Filter Dropdown */}
                                    {/* <div className="relative">
                                        <button
                                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 bg-white"
                                        >
                                            <Filter size={18} className="text-gray-600" />
                                            <span>
                                                {applicantFilter === 'all' && 'All'}
                                                {applicantFilter === 'pending' && 'Pending'}
                                                {applicantFilter === 'accepted' && 'Accepted'}
                                                {applicantFilter === 'rejected' && 'Rejected'}
                                            </span>
                                        </button>

                                        {showFilterDropdown && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                <div className="py-1">
                                                    {['all', 'pending', 'accepted', 'rejected'].map((filter) => (
                                                        <button
                                                            key={filter}
                                                            onClick={() => {
                                                                setApplicantFilter(filter);
                                                                setShowFilterDropdown(false);
                                                            }}
                                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm capitalize"
                                                        >
                                                            {filter === 'all' ? 'All' : filter}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        {/* Mentors List - New Card Design */}
                        <div className="divide-y divide-gray-100">
                            {filteredApplicants.length > 0 ? (
                                filteredApplicants.map((proposal) => {
                                    // Calculate pricing based on selected period and duration
                                    const getPricing = () => {
                                        const period = proposal.selectedPeriod || project.period;
                                        const duration = proposal.selectedDuration || project.duration;

                                        const pricingMap = {
                                            one_time: { standard: 1300 },
                                            per_day: { standard: 1200, full_day: 2300 },
                                            weekly: { standard: 8000, full_day: 16000 },
                                            monthly: { standard: 32000, full_day: 63000 }
                                        };

                                        const amount = pricingMap[period]?.[duration] || 8000;
                                        return `₹${amount.toLocaleString('en-IN')}`;
                                    };

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
                                        if (period === 'one_time') return 'Single Session';
                                        if (duration === 'standard') return 'Standard (2-3 hrs/day)';
                                        return 'Full day (6-8 hrs)';
                                    };

                                    const periodLabel = getPeriodLabel(proposal.selectedPeriod || project.period);
                                    const durationLabel = getDurationLabel(proposal.selectedDuration || project.duration, proposal.selectedPeriod || project.period);
                                    const pricing = getPricing();

                                    return (
                                        <div key={proposal?._id} className="p-5 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                {/* Avatar - Left */}
                                                <div className="flex-shrink-0">
                                                    {proposal.freelancerAvatar ? (
                                                        <img
                                                            src={proposal.freelancerAvatar}
                                                            alt={proposal.freelancerName}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-primary font-semibold text-lg">
                                                                {proposal.freelancerName?.charAt(0) || 'M'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content - Middle */}
                                                <div className="flex-1">
                                                    {/* Name and Title Row */}
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-gray-900 text-lg">
                                                            {proposal.freelancerName}
                                                        </h3>
                                                        <span className="text-gray-400 text-sm">•</span>
                                                        <p className="text-sm text-gray-600">
                                                            {proposal.freelancer?.title || 'Data Engineer'} · {proposal.freelancer?.skills?.slice(0, 2).join(' · ') || 'Streaming/Kafka'}
                                                        </p>
                                                    </div>

                                                    {/* Experience and Rating */}
                                                    <div className="flex items-center gap-1 mb-3">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    size={14}
                                                                    className={star <= Math.round(proposal?.freelancer?.rating || 0)
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300'
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-medium">{proposal?.freelancer?.rating || 0}</span>
                                                        <span className="text-xs text-gray-500">({proposal?.freelancer?.reviewCount || 0} reviews)</span>
                                                    </div>

                                                    {/* Proposal Preview */}
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                        {proposal.proposal}
                                                    </p>

                                                    {/* Period, Duration, Price Row */}
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-gray-700 font-medium">
                                                            {periodLabel}{durationLabel ? ` · ${durationLabel}` : ''}
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-primary font-semibold">
                                                            {pricing}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions - Right */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <button
                                                        onClick={() => handleViewApplicantProfile(proposal.freelancer?._id)}
                                                        className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                                                    >
                                                        View Profile
                                                        <ArrowRight size={14} />
                                                    </button>

                                                    {/* {proposal.status === 'pending' && (
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => handleShortlistApplicant(proposal._id)}
                                                                className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectApplicant(proposal._id)}
                                                                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )} */}

                                                    {/* {proposal.status === 'accepted' && (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg">
                                                            <CheckCircle size={14} />
                                                            Accepted
                                                        </span>
                                                    )}

                                                    {proposal.status === 'rejected' && (
                                                        <span className="inline-flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg">
                                                            Rejected
                                                        </span>
                                                    )} */}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center">
                                    <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No interested mentors found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {applicantSearch ? 'Try adjusting your search' : 'Check back later for expressions of interest'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer Note */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-500">
                                View a mentor profile to see their full details and book from the pricing table.
                            </p>
                        </div>
                    </div>
                )}

                {/* Similar Projects */}
                {similarProjects.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <Subheading content={'Explore More'} />
                                <Heading content={'Similar Projects'} />
                                <HeadingDescription content={'Check out these related projects that might interest you'} />
                            </div>
                            <Link
                                to="/projects"
                                className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
                            >
                                View All Projects
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {similarProjects.map((similarProject) => (
                                <BuyerProjectCard key={similarProject._id} project={similarProject} />
                            ))}
                        </div>
                    </div>
                )}

                {/* View My Proposal Modal */}
                {showProposalModal && userProposal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setShowProposalModal(false)} />

                        <div className="relative min-h-screen flex items-center justify-center p-4">
                            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-auto">
                                {/* Header */}
                                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-900">Your Proposal</h2>
                                    <button
                                        onClick={() => setShowProposalModal(false)}
                                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                {/* Project Info */}
                                <div className="p-5 border-b border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {project?.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project?.category && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                                {typeof project.category === 'object' ? project.category.name : project.category}
                                            </span>
                                        )}
                                        {project?.subCategory && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                                {typeof project.subCategory === 'object' ? project.subCategory.name : project.subCategory}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Proposal Content */}
                                <div className="p-5 space-y-4">
                                    {/* Selected Options */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Your Selected Options</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {/* Period */}
                                            {userProposal?.selectedPeriod && (
                                                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium capitalize">
                                                    {userProposal.selectedPeriod === 'one_time' ? 'One-time' :
                                                        userProposal.selectedPeriod === 'per_day' ? 'Per day' :
                                                            userProposal.selectedPeriod === 'weekly' ? 'Weekly' : 'Monthly'}
                                                </span>
                                            )}

                                            {/* Duration */}
                                            {userProposal?.selectedDuration && (
                                                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                                    {userProposal.selectedDuration === 'standard'
                                                        ? (userProposal.selectedPeriod === 'one_time' ? 'Single session' : 'Standard (2-3 hrs)')
                                                        : 'Full day (6-8 hrs)'}
                                                </span>
                                            )}

                                            {/* Service */}
                                            {userProposal?.selectedService && (
                                                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                                    {userProposal.selectedService}
                                                </span>
                                            )}
                                        </div>

                                        {/* Fallback message if no options are selected */}
                                        {(!userProposal?.selectedPeriod && !userProposal?.selectedDuration && !userProposal?.selectedService) && (
                                            <div className="flex flex-wrap gap-3">
                                                {/* Show project defaults as fallback */}
                                                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium capitalize">
                                                    {project?.period === 'one_time' ? 'One-time' :
                                                        project?.period === 'per_day' ? 'Per day' :
                                                            project?.period === 'weekly' ? 'Weekly' : 'Monthly'}
                                                </span>
                                                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                                    {project?.duration === 'standard'
                                                        ? (project?.period === 'one_time' ? 'Single session' : 'Standard (2-3 hrs)')
                                                        : 'Full day (6-8 hrs)'}
                                                </span>
                                                <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                                    {project?.service}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-2 w-full">
                                                    Using project defaults (you selected the same options as the project)
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Proposal Text */}
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Your Proposal</h4>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-gray-700 whitespace-pre-line">
                                                {userProposal.proposal}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    {/* <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                            ${userProposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              userProposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'}">
                                            {userProposal.status === 'pending' && '⏳ Pending Review'}
                                            {userProposal.status === 'accepted' && '✓ Accepted'}
                                            {userProposal.status === 'rejected' && '✗ Rejected'}
                                        </div>
                                        {userProposal.status === 'rejected' && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Your proposal was not selected. Feel free to explore other projects.
                                            </p>
                                        )}
                                        {userProposal.status === 'accepted' && (
                                            <p className="text-sm text-green-600 mt-2">
                                                Congratulations! The buyer has accepted your proposal.
                                            </p>
                                        )}
                                    </div> */}

                                    {/* Applied Date */}
                                    <div className="pt-2">
                                        <p className="text-xs text-gray-400">
                                            Applied on {formatDate(userProposal.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <div className="p-5 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowProposalModal(false)}
                                        className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Express Interest Modal */}
                <ExpressInterestModal
                    isOpen={showExpressModal}
                    onClose={() => setShowExpressModal(false)}
                    projectDetails={project}
                    onSubmit={handleExpressInterest}
                    isSubmitting={applying}
                />
            </Container>
        </div>
    );
};

export default ProjectDetails;