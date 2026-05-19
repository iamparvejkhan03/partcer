import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ApplyProjectModal, Container, Heading, HeadingDescription, Subheading } from '../components';
import BuyerProjectCard from '../components/BuyerProjectCard';
import {
    Heart,
    Share2,
    Star,
    MapPin,
    Calendar,
    FileText,
    Home,
    Clock,
    Eye,
    DollarSign,
    Users,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Search,
    CheckCircle,
    ArrowRight,
    Download,
    Mail,
    Phone,
    Globe,
    Award,
    ThumbsUp,
    MessageCircle,
    Shield,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    Bookmark,
    UserCheck,
    UserX,
    Filter,
    Loader,
    X,
    FolderOpen
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
    const [activeSlide, setActiveSlide] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showAllAbout, setShowAllAbout] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [applicantFilter, setApplicantFilter] = useState('all');
    const [applicantSearch, setApplicantSearch] = useState('');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    useEffect(() => {
        if (project && isAuthenticated) {
            // Check if user has already applied
            if (user?.userType === 'freelancer' && project.applicants) {
                const applied = project.applicants.some(a => a.freelancer?._id === user?._id);
                setHasApplied(applied);
            }

            // Check if user is the project owner
            if (user?.userType === 'buyer' && project.buyer?._id === user?._id) {
                setIsOwner(true);
            }

            if (user?.userType === 'admin') {
                setIsAdmin(true);
            }
        }
    }, [project, isAuthenticated, user, user?.userType]);

    // Filter applicants based on status and search
    useEffect(() => {
        if (applicants.length > 0) {
            let filtered = [...applicants];

            // Filter by status
            if (applicantFilter !== 'all') {
                filtered = filtered.filter(a => a.status === applicantFilter);
            }

            // Filter by search
            if (applicantSearch.trim()) {
                const searchTerm = applicantSearch.toLowerCase();
                filtered = filtered.filter(a =>
                    a.name?.toLowerCase().includes(searchTerm) ||
                    a.title?.toLowerCase().includes(searchTerm) ||
                    a.skills?.some(s => typeof s === 'string'
                        ? s.toLowerCase().includes(searchTerm)
                        : s.name?.toLowerCase().includes(searchTerm)
                    )
                );
            }

            setFilteredApplicants(filtered);
        }
    }, [applicantFilter, applicantSearch, applicants]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);

            // Use optional auth for project views
            const response = await axiosInstance.get(`/api/v1/projects/${projectId}`, {
                headers: isAuthenticated ? {} : { 'Authorization': undefined }
            });

            if (response.data.success) {
                const { project: projectData, similar } = response.data.data;
                setProject(projectData);
                setSimilarProjects(similar || []);

                // Set gallery images
                if (projectData.gallery && projectData.gallery.length > 0) {
                    setActiveSlide(0);
                }

                // Check if project is saved by current user
                if (isAuthenticated && user?.userType === 'freelancer') {
                    // You would need an endpoint to check if project is saved
                    // For now, we'll assume it's not saved
                    setIsSaved(false);
                }

                // If user is the buyer, fetch applicants
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
            const response = await axiosInstance.get(`/api/v1/projects/${projectId}/applicants`);

            if (response.data.success) {
                const applicantsData = response.data.data?.applicants || [];
                setApplicants(applicantsData);
                setFilteredApplicants(applicantsData);
            }
        } catch (error) {
            console.error('Error fetching applicants:', error);
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

    const handleContactBuyer = () => {
        if (!isAuthenticated) {
            toast.error('Please login to contact the buyer');
            navigate('/login');
            return;
        }
        navigate(`/messages?user=${project.buyer._id}`);
    };

    const handleEditProject = () => {
        navigate(`/buyer/projects/edit/${project._id}`);
    };

    const handleViewApplicantProfile = (applicantId) => {
        navigate(`/freelancer/profile/${applicantId}`);
    };

    const handleMessageApplicant = (applicantId) => {
        navigate(`/messages?user=${applicantId}`);
    };

    const handleShortlistApplicant = async (applicantId) => {
        try {
            await axiosInstance.patch(
                `/api/v1/projects/${project._id}/applicants/${applicantId}`,
                { action: 'shortlisted', message: 'You have been shortlisted for this project!' }
            );

            toast.success('Applicant shortlisted');
            // Refresh applicants
            fetchApplicants(project._id);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to shortlist applicant';
            toast.error(errorMessage);
        }
    };

    const handleRejectApplicant = async (applicantId) => {
        try {
            await axiosInstance.patch(
                `/api/v1/projects/${project._id}/applicants/${applicantId}`,
                {
                    action: 'rejected',
                    message: 'Thank you for your application, but we have decided to move forward with other candidates.'
                }
            );

            toast.success('Application rejected');
            // Refresh applicants
            fetchApplicants(project._id);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to reject applicant';
            toast.error(errorMessage);
        }
    };

    const handleHireApplicant = async (applicantId) => {
        try {
            await axiosInstance.patch(
                `/api/v1/projects/${project._id}/applicants/${applicantId}`,
                {
                    action: 'hired',
                    message: 'Congratulations! We would like to hire you for this project.'
                }
            );

            toast.success('Applicant hired successfully');
            // Refresh applicants
            fetchApplicants(project._id);
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to hire applicant';
            toast.error(errorMessage);
        }
    };

    const handleApplySubmit = async (applicationData) => {
        if (!isAuthenticated) {
            toast.error('Please login to apply');
            navigate('/login');
            return;
        }

        try {
            setApplying(true);

            const formData = new FormData();
            formData.append('coverLetter', applicationData.coverLetter);
            formData.append('proposedBudget', applicationData.proposedBudget);
            formData.append('proposedTimeline', applicationData.proposedTimeline);

            if (applicationData.skills) {
                formData.append('skills', JSON.stringify(applicationData.skills));
            }

            // Append attachments
            if (applicationData.attachments && applicationData.attachments.length > 0) {
                applicationData.attachments.forEach(file => {
                    formData.append('attachments', file);
                });
            }

            await axiosInstance.post(`/api/v1/projects/${project._id}/apply`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            toast.success('Application submitted successfully!');
            setShowApplyModal(false);
            setHasApplied(true);

            // Refresh project data to update applicant count
            fetchProjectDetails();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to submit application';
            toast.error(errorMessage);
        } finally {
            setApplying(false);
        }
    };

    const handlePrevSlide = () => {
        if (project?.gallery) {
            setActiveSlide(prev => (prev === 0 ? project.gallery.length - 1 : prev - 1));
        }
    };

    const handleNextSlide = () => {
        if (project?.gallery) {
            setActiveSlide(prev => (prev === project.gallery.length - 1 ? 0 : prev + 1));
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            shortlisted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Shortlisted' },
            hired: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hired' },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
        };
        const badge = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
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

    const budgetDisplay = () => {
        if (project.projectType === 'fixed') {
            if (project.minBudget && project.maxBudget) {
                return `${formatCurrency(project.minBudget)} - ${formatCurrency(project.maxBudget)}`;
            }
            return formatCurrency(project.budget);
        } else {
            return `${formatCurrency(project.hourlyRate)}/hr (est. ${project.estimatedHours} hrs)`;
        }
    };

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
                                    {!isOwner && user?.userType === 'freelancer' && (
                                        <button
                                            onClick={handleSaveProject}
                                            className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                            title="Save project"
                                        >
                                            <Bookmark size={20} className={isSaved ? 'fill-primary text-primary' : 'text-gray-600'} />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleShareProject}
                                        className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        title="Share"
                                    >
                                        <Share2 size={20} className="text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Project Stats */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-1.5">
                                    <Eye size={16} className="text-gray-400" />
                                    <span>{project.views || 0} views</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Bookmark size={16} className="text-gray-400" />
                                    <span>{project.saves || 0} saves</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users size={16} className="text-gray-400" />
                                    <span>{project.applicantsCount || 0} applicants</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>Posted {formatDate(project.createdAt)}</span>
                                </div>
                            </div>

                            {/* Key Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Budget</p>
                                    <p className="font-semibold text-gray-900">
                                        {budgetDisplay()}
                                    </p>
                                </div>
                                {/* <div>
                                    <p className="text-xs text-gray-500 mb-1">Location</p>
                                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                                        <MapPin size={14} className="text-gray-400" />
                                        {project.location || 'Remote'}
                                    </p>
                                </div> */}
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                                    <p className="font-semibold text-gray-900 capitalize">{project.experienceLevel}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                                    <p className="font-semibold text-gray-900">{project.duration}</p>
                                </div>
                            </div>
                        </div>

                        {/* Image Gallery */}
                        {project.gallery && project.gallery.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Gallery</h2>
                                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                                    <div className="relative h-64 md:h-96">
                                        <img
                                            src={project.gallery[activeSlide]?.url}
                                            loading='lazy'
                                            alt={`Project image ${activeSlide + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {project.gallery.length > 1 && (
                                            <>
                                                <button
                                                    onClick={handlePrevSlide}
                                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button
                                                    onClick={handleNextSlide}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Thumbnails */}
                                    {project.gallery.length > 1 && (
                                        <div className="flex gap-2 p-4 overflow-x-auto">
                                            {project.gallery.map((img, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setActiveSlide(index)}
                                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeSlide === index ? 'border-primary' : 'border-transparent'
                                                        }`}
                                                >
                                                    <img
                                                        src={img.url}
                                                        loading='lazy'
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills Required</h2>
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

                        {/* Requirements */}
                        {project.requirements && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-line text-gray-700">
                                        {project.requirements}
                                    </div>
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
                                    {project.buyer.location && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Location</span>
                                            <span className="font-medium text-gray-900">{project.buyer.location}</span>
                                        </div>
                                    )}
                                    {project.buyer.createdAt && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Member Since</span>
                                            <span className="font-medium text-gray-900">{formatDate(project.buyer.createdAt)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Projects</span>
                                        <span className="font-medium text-gray-900">{project.buyer.projectsPosted || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Spent</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(project.buyer.totalSpent || 0)}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                        <span className="text-gray-600">Response Rate</span>
                                        <span className="font-medium text-gray-900">{project.buyer.responseRate || '100%'}</span>
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
                                                View Project
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            {isAuthenticated && user?.userType === 'freelancer' ? (
                                                hasApplied ? (
                                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                                        <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
                                                        <p className="text-sm font-medium text-green-800">Application Submitted</p>
                                                        <p className="text-xs text-green-600 mt-1">You've already applied to this project</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setShowApplyModal(true)}
                                                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Briefcase size={18} />
                                                            Apply for this Project
                                                        </button>
                                                        {/* <button
                                                            onClick={handleContactBuyer}
                                                            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Mail size={18} />
                                                            Contact Buyer
                                                        </button> */}
                                                    </>
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
                                                        View Project
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <Link
                                                        to="/login"
                                                        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Briefcase size={18} />
                                                        Login to Apply
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Project Timeline</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Posted</span>
                                    <span className="font-medium text-gray-900">{formatDate(project.createdAt)}</span>
                                </div>
                                {project.deadline && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Deadline for applications</span>
                                        <span className="font-medium text-gray-900">{formatDate(project.deadline)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Expected duration</span>
                                    <span className="font-medium text-gray-900">{project.duration}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Experience level</span>
                                    <span className="font-medium text-gray-900 capitalize">{project.experienceLevel}</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Project Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Users size={20} className="mx-auto text-primary mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{project.applicantsCount || 0}</p>
                                    <p className="text-xs text-gray-600">Total Applicants</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <UserCheck size={20} className="mx-auto text-green-600 mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{project.shortlistedCount || 0}</p>
                                    <p className="text-xs text-gray-600">Shortlisted</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Eye size={20} className="mx-auto text-blue-600 mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{project.views || 0}</p>
                                    <p className="text-xs text-gray-600">Total Views</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <Bookmark size={20} className="mx-auto text-purple-600 mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{project.saves || 0}</p>
                                    <p className="text-xs text-gray-600">Saves</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applicants Section - Only visible to buyer who owns the project */}
                {isOwner && applicants.length > 0 && (
                    <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Applicants ({applicants.length})</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Review and manage mentor applications
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search applicants..."
                                            value={applicantSearch}
                                            onChange={(e) => setApplicantSearch(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-64"
                                        />
                                    </div>

                                    {/* Filter Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 bg-white"
                                        >
                                            <Filter size={18} className="text-gray-600" />
                                            <span>
                                                {applicantFilter === 'all' && 'All Applicants'}
                                                {applicantFilter === 'pending' && 'Pending'}
                                                {applicantFilter === 'shortlisted' && 'Shortlisted'}
                                                {applicantFilter === 'hired' && 'Hired'}
                                                {applicantFilter === 'rejected' && 'Rejected'}
                                            </span>
                                        </button>

                                        {showFilterDropdown && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => {
                                                            setApplicantFilter('all');
                                                            setShowFilterDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                                    >
                                                        All Applicants
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setApplicantFilter('pending');
                                                            setShowFilterDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                                    >
                                                        Pending
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setApplicantFilter('shortlisted');
                                                            setShowFilterDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                                    >
                                                        Shortlisted
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setApplicantFilter('hired');
                                                            setShowFilterDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                                    >
                                                        Hired
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setApplicantFilter('rejected');
                                                            setShowFilterDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                                                    >
                                                        Rejected
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applicants List */}
                        <div className="divide-y divide-gray-200">
                            {filteredApplicants.length > 0 ? (
                                filteredApplicants.map((applicant) => (
                                    <div key={applicant._id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                            {/* Left - Avatar & Basic Info */}
                                            <div className="flex items-start gap-4 lg:w-1/3">
                                                {applicant.avatar || applicant.freelancer?.profileImage ? (
                                                    <img
                                                        src={applicant.avatar || applicant.freelancer?.profileImage}
                                                        alt={applicant.name}
                                                        loading='lazy'
                                                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                        <Users size={20} className="text-gray-500" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-semibold text-gray-900">{applicant.name}</h3>
                                                        {applicant.verified && (
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                                Verified
                                                            </span>
                                                        )}
                                                        {getStatusBadge(applicant.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{applicant.title}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                            <span className="font-medium">{applicant.rating || 0}</span>
                                                            <span className="text-gray-500">({applicant.reviews || 0})</span>
                                                        </div>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-gray-600">{applicant.location}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {(applicant.skills || []).slice(0, 3).map((skill, idx) => (
                                                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                                {typeof skill === 'string' ? skill : skill.name}
                                                            </span>
                                                        ))}
                                                        {(applicant.skills || []).length > 3 && (
                                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                                +{(applicant.skills || []).length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Middle - Proposal Details */}
                                            <div className="lg:w-1/3 space-y-2">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Proposed Budget</p>
                                                        <p className="font-semibold text-gray-900">{formatCurrency(applicant.proposedBudget)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Timeline</p>
                                                        <p className="font-semibold text-gray-900">{applicant.proposedTimeline || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Hourly Rate</p>
                                                        <p className="font-semibold text-gray-900">{formatCurrency(applicant.hourlyRate)}/hr</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Applied</p>
                                                        <p className="font-semibold text-gray-900">{formatDate(applicant.appliedDate)}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700 line-clamp-2 mt-2">
                                                    {applicant.coverLetter}
                                                </p>
                                            </div>

                                            {/* Right - Actions */}
                                            <div className="lg:w-1/3 flex flex-row lg:flex-col items-center lg:items-stretch gap-2 justify-end">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewApplicantProfile(applicant.freelancer?._id || applicant._id)}
                                                        className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                                                    >
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => handleMessageApplicant(applicant.freelancer?._id || applicant._id)}
                                                        className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                    >
                                                        Message
                                                    </button>
                                                </div>
                                                {applicant.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleShortlistApplicant(applicant._id)}
                                                            className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                        >
                                                            Shortlist
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectApplicant(applicant._id)}
                                                            className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {applicant.status === 'shortlisted' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleHireApplicant(applicant._id)}
                                                            className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                                        >
                                                            Hire
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectApplicant(applicant._id)}
                                                            className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {applicant.status === 'hired' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => navigate(`/contracts/${project._id}`)}
                                                            className="flex-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                                        >
                                                            View Contract
                                                        </button>
                                                    </div>
                                                )}
                                                {applicant.status === 'rejected' && (
                                                    <div className="text-sm text-gray-500 text-center py-2">
                                                        Application rejected
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No applicants found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {applicantSearch ? 'Try adjusting your search' : 'Check back later for applications'}
                                    </p>
                                </div>
                            )}
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
                            {similarProjects.map((project) => (
                                <BuyerProjectCard key={project._id} project={project} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Apply Modal */}
                <ApplyProjectModal
                    isOpen={showApplyModal}
                    onClose={() => setShowApplyModal(false)}
                    projectDetails={project}
                    onSubmit={handleApplySubmit}
                    isSubmitting={applying}
                />
            </Container>
        </div>
    );
};

export default ProjectDetails;