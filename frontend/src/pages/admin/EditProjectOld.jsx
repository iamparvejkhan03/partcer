import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { RTE } from '../../components';
import {
    Briefcase,
    Save,
    X,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Shield,
    Upload,
    Camera,
    ChevronDown,
    Search,
    Check,
    Wrench,
    DollarSign,
    MapPin,
    Globe,
    Tag,
    Layers,
    Eye,
    Edit,
    Trash2,
    Award,
    Users,
    Star,
    TrendingUp,
    Eye as ViewIcon,
    MessageSquare,
    Ban,
    RefreshCw,
    Plus,
    FileText,
    Calendar,
    HelpCircle,
    PauseCircle,
    PlayCircle,
    Flag,
    UserCheck,
    UserX,
    Paperclip,
    Download,
    Loader
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import useCountryStates from '../../hooks/useCountryStates';

// Skills Multi-select Component
const SkillsSelect = ({ selectedSkills, onChange, skillsList }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    const filteredSkills = skillsList.filter(skill =>
        skill.name.toLowerCase().includes(search.toLowerCase()) &&
        !selectedSkills.includes(skill.name)
    );

    const toggleSkill = (skillName) => {
        if (selectedSkills.includes(skillName)) {
            onChange(selectedSkills.filter(name => name !== skillName));
        } else {
            if (selectedSkills.length >= 15) {
                toast.error('Maximum 15 skills allowed');
                return;
            }
            onChange([...selectedSkills, skillName]);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected skills chips */}
            {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map((skillName) => {
                        const skill = skillsList.find(s => s.name === skillName);
                        return skill ? (
                            <div key={skill._id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-sm">
                                <Wrench size={14} />
                                {skill.name}
                                <button
                                    type="button"
                                    onClick={() => toggleSkill(skill.name)}
                                    className="ml-1 hover:text-red-200"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : null;
                    })}
                </div>
            )}

            {/* Dropdown trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent flex justify-between items-center"
            >
                <span className={selectedSkills.length > 0 ? "text-gray-900" : "text-gray-500"}>
                    {selectedSkills.length > 0
                        ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`
                        : "Click to select skills"}
                </span>
                <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b sticky top-0 bg-white">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search skills..."
                                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="py-1">
                        {filteredSkills.length > 0 ? (
                            filteredSkills.map((skill) => (
                                <button
                                    type="button"
                                    key={skill._id}
                                    onClick={() => toggleSkill(skill.name)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                                >
                                    <span>{skill.name}</span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                                No skills found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const EditProject = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [skillsList, setSkillsList] = useState([]);
    const [isSkillsOpen, setIsSkillsOpen] = useState(false);
    const [skillSearch, setSkillSearch] = useState('');
    const skillsDropdownRef = useRef(null);
    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [removedAttachments, setRemovedAttachments] = useState([]);
    const [projectType, setProjectType] = useState('fixed');
    const [experienceLevel, setExperienceLevel] = useState('intermediate');
    const [duration, setDuration] = useState('1-3 months');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [buyerInfo, setBuyerInfo] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [moderationNotes, setModerationNotes] = useState('');
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const [loadingSkills, setLoadingSkills] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const actionMenuRef = useRef(null);
    const [pendingSubCategory, setPendingSubCategory] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        getValues,
        reset,
        control,
        formState: { errors }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            title: '',
            category: '',
            subCategory: '',
            description: '',
            budget: '',
            minBudget: '',
            maxBudget: '',
            hourlyRate: '',
            estimatedHours: '',
            location: '',
            requirements: '',
            additionalInfo: '',
            duration: '1-3 months',
            experienceLevel: 'intermediate',
            projectType: 'fixed',
            status: 'pending',
            verification: 'unverified',
            featured: false,
            rejectionReason: '',
            moderationNotes: ''
        }
    });

    const statusWatch = watch('status');
    const verificationWatch = watch('verification');
    const featuredWatch = watch('featured');
    const projectTypeWatch = watch('projectType');

    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);

    // Fetch countries on component mount - use useCallback for the fetch function
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                const data = await countriesAPI();
                // Sort countries alphabetically by name
                const sortedCountries = data.sort((a, b) => a.name.localeCompare(b.name));
                setCountries(sortedCountries);
            } catch (error) {
                console.error('Error fetching countries:', error);
                toast.error('Failed to load countries');
            } finally {
                setLoadingCountries(false);
            }
        };

        fetchCountries();
    }, []);

    // Click outside handler for dropdown menus
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
                setOpenActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Click outside handler for skills dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(event.target)) {
                setIsSkillsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchProjectData();
        fetchSkillsList();
        fetchCategories();
    }, [projectId]);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (selectedCategory) {
            fetchSubCategories(selectedCategory);
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await axiosInstance.get('/api/v1/categories/public/parents');

            if (response.data.success) {
                const categoriesData = response.data.data || [];
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            toast.error('Failed to load categories');
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchSkillsList = async () => {
        try {
            setLoadingSkills(true);
            const response = await axiosInstance.get('/api/v1/skills/public');

            if (response.data.success) {
                setSkillsList(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching skills:', err);
            toast.error('Failed to load skills');
            setSkillsList([]);
        } finally {
            setLoadingSkills(false);
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/categories/public/${categoryId}/subcategories`);

            if (response.data?.success) {
                const subCats = response.data.data?.subcategories || [];
                setSubCategories(Array.isArray(subCats) ? subCats : []);
            } else {
                setSubCategories([]);
            }
        } catch (err) {
            console.error('Error fetching subcategories:', err);
            setSubCategories([]);
        }
    };

    const fetchProjectData = async () => {
        try {
            setLoading(true);

            // Fetch project details
            const response = await axiosInstance.get(`/api/v1/projects/admin/${projectId}/edit`);

            if (response.data.success) {
                const project = response.data.data;

                // Set form values
                reset({
                    title: project.title || '',
                    category: project.category?._id || '',
                    subCategory: project.subCategory?._id || '',
                    description: project.description || '',
                    budget: project.budget || '',
                    minBudget: project.minBudget || '',
                    maxBudget: project.maxBudget || '',
                    hourlyRate: project.hourlyRate || '',
                    estimatedHours: project.estimatedHours || '',
                    location: project.location || 'India',
                    requirements: project.requirements || '',
                    additionalInfo: project.additionalInfo || '',
                    duration: project.duration || '1-3 months',
                    experienceLevel: project.experienceLevel || 'intermediate',
                    projectType: project.projectType || 'fixed',
                    status: project.status || 'pending',
                    verification: project.verification || 'unverified',
                    featured: project.featured || false,
                    rejectionReason: project.rejectionReason || '',
                    moderationNotes: ''
                });

                // Set category for subcategory loading
                if (project.category?._id) {
                    setSelectedCategory(project.category._id);
                }

                setPendingSubCategory(project.subCategory?._id || project.subCategory || '');

                // Set project type
                setProjectType(project.projectType || 'fixed');

                // Set experience level
                setExperienceLevel(project.experienceLevel || 'intermediate');

                // Set duration
                setDuration(project.duration || '1-3 months');

                // Set skills (using skill IDs)
                const skillIds = project.skills?.map(skill =>
                    typeof skill === 'string' ? skill : skill._id
                ) || [];
                setSelectedSkills(skillIds);

                // Set existing attachments
                if (project.attachments && project.attachments.length > 0) {
                    setExistingAttachments(project.attachments);
                }

                // Set buyer info
                if (project.buyer) {
                    setBuyerInfo(project.buyer);
                }

                // Fetch applicants for this project
                fetchProjectApplicants(project._id);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            toast.error('Failed to load project data');
            navigate('/admin/projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (pendingSubCategory && subCategories.length > 0) {
            setValue('subCategory', pendingSubCategory);
            setPendingSubCategory(''); // Clear after setting
        }
    }, [subCategories, pendingSubCategory, setValue]);

    const fetchProjectApplicants = async (projectId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/projects/admin/${projectId}/applicants`);

            if (response.data.success) {
                setApplicants(response.data.data?.applicants || []);
            }
        } catch (error) {
            console.error('Error fetching applicants:', error);
            setApplicants([]);
        }
    };

    const handleAttachmentUpload = (e) => {
        const files = Array.from(e.target.files);
        const totalFiles = existingAttachments.length + attachments.length + files.length;

        if (totalFiles > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }

        // Check file size (max 10MB each)
        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 10MB limit`);
                return false;
            }
            return true;
        });

        // Check file types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'application/zip'
        ];

        const typeValidFiles = validFiles.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`${file.name} is not a supported file type`);
                return false;
            }
            return true;
        });

        setAttachments([...attachments, ...typeValidFiles]);
    };

    const removeExistingAttachment = (index) => {
        const attachmentToRemove = existingAttachments[index];
        if (attachmentToRemove.publicId) {
            setRemovedAttachments([...removedAttachments, attachmentToRemove.publicId]);
        } else if (attachmentToRemove._id) {
            setRemovedAttachments([...removedAttachments, attachmentToRemove._id]);
        }
        setExistingAttachments(existingAttachments.filter((_, i) => i !== index));
    };

    const removeNewAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const toggleSkill = (skillId) => {
        if (selectedSkills.includes(skillId)) {
            setSelectedSkills(selectedSkills.filter(id => id !== skillId));
        } else {
            if (selectedSkills.length >= 15) {
                toast.error('Maximum 15 skills allowed');
                return;
            }
            setSelectedSkills([...selectedSkills, skillId]);
        }
    };

    const handleApproveProject = () => {
        setValue('status', 'active');
        setValue('verification', 'verified');
        setValue('rejectionReason', '');
        toast.success('Project approved');
    };

    const handleRejectProject = () => {
        setValue('status', 'rejected');
        setValue('verification', 'rejected');
        toast.success('Project rejected');
    };

    const handleSuspendProject = () => {
        setValue('status', 'suspended');
        toast.success('Project suspended');
    };

    const handleActivateProject = () => {
        setValue('status', 'active');
        toast.success('Project activated');
    };

    const handleFeatureProject = () => {
        setValue('featured', !featuredWatch);
        toast.success(featuredWatch ? 'Featured status removed' : 'Project marked as featured');
    };

    const handleViewBuyer = (buyerId) => {
        navigate(`/admin/users/${buyerId}`);
    };

    const handleViewApplicant = (applicantId) => {
        navigate(`/admin/users/${applicantId}`);
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);

            // Prepare data matching your controller's expected structure
            const projectData = {
                title: data.title,
                description: data.description,
                category: data.category,
                subCategory: data.subCategory || undefined,
                skills: selectedSkills,
                experienceLevel: experienceLevel,
                location: data.location || 'remote',
                projectType: projectType,
                budget: projectType === 'fixed' ? Number(data.budget) : null,
                minBudget: projectType === 'fixed' ? Number(data.minBudget) : null,
                maxBudget: projectType === 'fixed' ? Number(data.maxBudget) : null,
                hourlyRate: projectType === 'hourly' ? Number(data.hourlyRate) : null,
                estimatedHours: projectType === 'hourly' ? Number(data.estimatedHours) : null,
                duration: duration,
                additionalInfo: data.additionalInfo || '',
                requirements: data.requirements || '',
                status: data.status,
                verification: data.verification,
                featured: data.featured,
                rejectionReason: data.rejectionReason || '',
                removedAttachments: removedAttachments,
                moderationNotes: moderationNotes
            };

            // Create FormData for file uploads
            const formDataObj = new FormData();
            formDataObj.append('data', JSON.stringify(projectData));

            // Append new attachments
            attachments.forEach((file) => {
                formDataObj.append('attachments', file);
            });

            // Use the admin update endpoint
            await axiosInstance.put(`/api/v1/projects/admin/${projectId}`, formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            toast.success('Project updated successfully!');
            navigate('/admin/projects/all');
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to update project';
            toast.error(errorMessage);
            console.error('Update project error:', error);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
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
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: CheckCircle },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed', icon: CheckCircle },
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft', icon: FileText },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: XCircle },
            suspended: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Suspended', icon: PauseCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle }
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

    const getVerificationBadge = (verification) => {
        const config = {
            verified: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Verified', icon: CheckCircle },
            unverified: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unverified', icon: HelpCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle }
        };
        const badge = config[verification] || config.unverified;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon size={12} />
                {badge.label}
            </span>
        );
    };

    const getApplicantStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            shortlisted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Shortlisted', icon: UserCheck },
            hired: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hired', icon: CheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: UserX }
        };
        const badge = config[status] || config.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon size={10} />
                {badge.label}
            </span>
        );
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: FileText },
        { id: 'budget', label: 'Budget & Timeline', icon: DollarSign },
        { id: 'requirements', label: 'Requirements', icon: Paperclip },
        { id: 'moderation', label: 'Moderation', icon: Shield },
        { id: 'buyer', label: 'Student Info', icon: Users },
        { id: 'applicants', label: 'Applicants', icon: UserCheck },
    ];

    const durationOptions = [
        'Less than 1 week',
        '1-2 weeks',
        '2-4 weeks',
        '1-3 months',
        '3-6 months',
        'More than 6 months'
    ];

    const experienceOptions = [
        { value: 'entry', label: 'Entry Level' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'expert', label: 'Expert' }
    ];

    const locations = [
        'Remote (Worldwide)',
        'United States',
        'United Kingdom',
        'Canada',
        'Australia',
        'India',
        'Europe',
        'Asia',
        'Africa',
        'South America'
    ];

    if (loading) {
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
                    <div className="w-full max-w-full overflow-x-hidden">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/admin/projects')}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Project</h1>
                                    <p className="text-gray-600 mt-1">Project ID: {projectId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <button
                                    onClick={() => navigate('/admin/projects')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Project Status Bar */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        {getStatusBadge(statusWatch)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Verification:</span>
                                        {getVerificationBadge(verificationWatch)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Featured:</span>
                                        {featuredWatch ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                <Award size={12} />
                                                Featured
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                Not Featured
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {statusWatch === 'pending' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleApproveProject}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                            >
                                                <CheckCircle size={14} />
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRejectProject}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                            >
                                                <XCircle size={14} />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {statusWatch === 'active' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleFeatureProject}
                                                className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${featuredWatch
                                                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                                    }`}
                                            >
                                                <Award size={14} />
                                                {featuredWatch ? 'Remove Featured' : 'Mark Featured'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSuspendProject}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                                            >
                                                <PauseCircle size={14} />
                                                Suspend
                                            </button>
                                        </>
                                    )}
                                    {statusWatch === 'suspended' && (
                                        <button
                                            type="button"
                                            onClick={handleActivateProject}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                        >
                                            <PlayCircle size={14} />
                                            Activate
                                        </button>
                                    )}
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
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.id
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                        >
                                            <Icon size={16} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">

                            {/* Tab: Basic Info */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Title *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('title', { required: 'Title is required' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                                        )}
                                    </div>

                                    {/* Category & Subcategory */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category *
                                            </label>
                                            <select
                                                {...register('category', { required: 'Category is required' })}
                                                onChange={(e) => {
                                                    const categoryId = e.target.value;
                                                    setSelectedCategory(categoryId);
                                                    setValue('category', categoryId);
                                                    setValue('subCategory', '');

                                                    if (categoryId) {
                                                        fetchSubCategories(categoryId);
                                                    } else {
                                                        setSubCategories([]);
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={loadingCategories}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((category) => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.category && (
                                                <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Subcategory
                                            </label>
                                            <select
                                                {...register('subCategory')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={!selectedCategory || subCategories.length === 0}
                                            >
                                                <option value="">Select Subcategory</option>
                                                {subCategories.map((sub) => (
                                                    <option key={sub._id} value={sub._id}>
                                                        {sub.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    {/* <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Location
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <select
                                                {...register('location')}
                                                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={loadingCountries}
                                            >
                                                <option value="remote">🌍 Remote (Worldwide)</option>
                                                <optgroup label="Popular Countries">
                                                    <option value="US">🇺🇸 United States</option>
                                                    <option value="GB">🇬🇧 United Kingdom</option>
                                                    <option value="CA">🇨🇦 Canada</option>
                                                    <option value="AU">🇦🇺 Australia</option>
                                                    <option value="IN">🇮🇳 India</option>
                                                </optgroup>

                                                {countries.length > 0 && (
                                                    <optgroup label="All Countries">
                                                        {countries.map((country) => (
                                                            <option key={country.code} value={country.name}>
                                                                {country.flag} {country.name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}

                                                {loadingCountries && (
                                                    <option disabled>Loading countries...</option>
                                                )}
                                            </select>

                                            {loadingCountries && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div> */}

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description *
                                        </label>
                                        <RTE
                                            name="description"
                                            control={control}
                                            label="Description"
                                            defaultValue={getValues('description') || ''}
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                                        )}
                                    </div>

                                    {/* Skills Required */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Skills Required
                                        </label>

                                        <SkillsSelect
                                                selectedSkills={selectedSkills}
                                                onChange={setSelectedSkills}
                                                skillsList={skillsList}
                                            />
                                    </div>
                                </div>
                            )}

                            {/* Tab: Budget & Timeline */}
                            {activeTab === 'budget' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget & Timeline</h2>

                                    {/* Project Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Type
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    {...register('projectType')}
                                                    value="fixed"
                                                    onChange={(e) => {
                                                        setProjectType(e.target.value);
                                                        setValue('projectType', 'fixed');
                                                    }}
                                                    className="w-4 h-4 text-primary"
                                                    checked={projectTypeWatch === 'fixed'}
                                                />
                                                <span className="text-sm">Fixed Price</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    {...register('projectType')}
                                                    value="hourly"
                                                    onChange={(e) => {
                                                        setProjectType(e.target.value);
                                                        setValue('projectType', 'hourly');
                                                    }}
                                                    className="w-4 h-4 text-primary"
                                                    checked={projectTypeWatch === 'hourly'}
                                                />
                                                <span className="text-sm">Hourly Rate</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Fixed Price Budget */}
                                    {projectTypeWatch === 'fixed' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Budget ($)
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        type="number"
                                                        {...register('budget')}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Minimum Budget ($)
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        type="number"
                                                        {...register('minBudget')}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Maximum Budget ($)
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        type="number"
                                                        {...register('maxBudget')}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hourly Rate */}
                                    {projectTypeWatch === 'hourly' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Hourly Rate ($)
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        type="number"
                                                        {...register('hourlyRate')}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Estimated Hours
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('estimatedHours')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Duration & Experience */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Expected Duration
                                            </label>
                                            <select
                                                {...register('duration')}
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                {durationOptions.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Experience Level
                                            </label>
                                            <select
                                                {...register('experienceLevel')}
                                                value={experienceLevel}
                                                onChange={(e) => setExperienceLevel(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                {experienceOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Requirements */}
                            {activeTab === 'requirements' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Attachments</h2>

                                    {/* Requirements */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Specific Requirements
                                        </label>
                                        <textarea
                                            {...register('requirements')}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="List specific requirements, technical specifications, etc."
                                        />
                                    </div>

                                    {/* Additional Info */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Additional Information
                                        </label>
                                        <textarea
                                            {...register('additionalInfo')}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Any other details about the project"
                                        />
                                    </div>

                                    {/* Attachments */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Attachments (Max 5 files, 10MB each)
                                        </label>

                                        {/* Existing Attachments */}
                                        {existingAttachments.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-600 mb-2">Current Files:</p>
                                                <div className="space-y-2">
                                                    {existingAttachments.map((file, index) => (
                                                        <div key={file._id || index} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-200">
                                                            <div className="flex items-center gap-2">
                                                                <Paperclip size={14} className="text-blue-600" />
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-700">{file.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Size unknown'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExistingAttachment(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Area */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleAttachmentUpload}
                                                className="hidden"
                                                id="attachments-upload"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                                            />
                                            <label htmlFor="attachments-upload" className="cursor-pointer flex flex-col items-center">
                                                <Upload size={24} className="text-gray-400 mb-1" />
                                                <p className="text-xs text-gray-600 mb-1">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PDF, DOC, DOCX, JPG, PNG, ZIP (Max 10MB)
                                                </p>
                                            </label>
                                        </div>

                                        {/* New Files Preview */}
                                        {attachments.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-600 mb-2">New Files:</p>
                                                <div className="space-y-2">
                                                    {attachments.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <Paperclip size={14} className="text-gray-400" />
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-700">{file.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeNewAttachment(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab: Moderation */}
                            {activeTab === 'moderation' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Moderation Controls</h2>

                                    {/* Status Controls */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-gray-900 mb-3 text-sm">Project Status</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            <label className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${statusWatch === 'active' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    {...register('status')}
                                                    value="active"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <CheckCircle size={16} className={`mx-auto mb-1 ${statusWatch === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                                                    <span className={`text-xs font-medium ${statusWatch === 'active' ? 'text-green-600' : 'text-gray-600'}`}>Active</span>
                                                </div>
                                            </label>
                                            <label className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${statusWatch === 'pending' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    {...register('status')}
                                                    value="pending"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <Clock size={16} className={`mx-auto mb-1 ${statusWatch === 'pending' ? 'text-yellow-600' : 'text-gray-400'}`} />
                                                    <span className={`text-xs font-medium ${statusWatch === 'pending' ? 'text-yellow-600' : 'text-gray-600'}`}>Pending</span>
                                                </div>
                                            </label>
                                            <label className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${statusWatch === 'suspended' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    {...register('status')}
                                                    value="suspended"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <PauseCircle size={16} className={`mx-auto mb-1 ${statusWatch === 'suspended' ? 'text-orange-600' : 'text-gray-400'}`} />
                                                    <span className={`text-xs font-medium ${statusWatch === 'suspended' ? 'text-orange-600' : 'text-gray-600'}`}>Suspended</span>
                                                </div>
                                            </label>
                                            <label className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${statusWatch === 'completed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    {...register('status')}
                                                    value="completed"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <CheckCircle size={16} className={`mx-auto mb-1 ${statusWatch === 'completed' ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    <span className={`text-xs font-medium ${statusWatch === 'completed' ? 'text-blue-600' : 'text-gray-600'}`}>Completed</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Verification Status */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-gray-900 mb-3 text-sm">Verification Status</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            <label className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${verificationWatch === 'verified' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    {...register('verification')}
                                                    value="verified"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <CheckCircle size={16} className={`mx-auto mb-1 ${verificationWatch === 'verified' ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    <span className={`text-xs font-medium ${verificationWatch === 'verified' ? 'text-blue-600' : 'text-gray-600'}`}>Verified</span>
                                                </div>
                                            </label>
                                            <label className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${verificationWatch === 'unverified' ? 'border-gray-500 bg-gray-100' : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    {...register('verification')}
                                                    value="unverified"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <HelpCircle size={16} className={`mx-auto mb-1 ${verificationWatch === 'unverified' ? 'text-gray-600' : 'text-gray-400'}`} />
                                                    <span className={`text-xs font-medium ${verificationWatch === 'unverified' ? 'text-gray-600' : 'text-gray-600'}`}>Unverified</span>
                                                </div>
                                            </label>
                                            <label className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${verificationWatch === 'rejected' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    {...register('verification')}
                                                    value="rejected"
                                                    className="hidden"
                                                />
                                                <div className="text-center">
                                                    <XCircle size={16} className={`mx-auto mb-1 ${verificationWatch === 'rejected' ? 'text-red-600' : 'text-gray-400'}`} />
                                                    <span className={`text-xs font-medium ${verificationWatch === 'rejected' ? 'text-red-600' : 'text-gray-600'}`}>Rejected</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Featured Toggle */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900 text-sm">Featured Project</h3>
                                                <p className="text-xs text-gray-500 mt-1">Mark this project as featured to highlight it in search results</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    {...register('featured')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Rejection Reason */}
                                    {statusWatch === 'rejected' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Rejection Reason
                                            </label>
                                            <textarea
                                                {...register('rejectionReason')}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Explain why this project was rejected..."
                                            />
                                        </div>
                                    )}

                                    {/* Moderation Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Moderation Notes (Internal)
                                        </label>
                                        <textarea
                                            value={moderationNotes}
                                            onChange={(e) => setModerationNotes(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Add internal notes for other admins..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">These notes are only visible to admins</p>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Buyer Info */}
                            {activeTab === 'buyer' && buyerInfo && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            {buyerInfo.profileImage ? (
                                                <img
                                                    src={buyerInfo.profileImage}
                                                    alt={buyerInfo.displayName || buyerInfo.firstName}
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <Users size={24} className="text-gray-500" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {buyerInfo.displayName || `${buyerInfo.firstName || ''} ${buyerInfo.lastName || ''}`.trim() || 'N/A'}
                                                    </h3>
                                                    {buyerInfo.isVerified && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                                                            <CheckCircle size={10} />
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                                {buyerInfo.email && (
                                                    <p className="text-sm text-gray-600 mt-0.5">{buyerInfo.email}</p>
                                                )}
                                                {buyerInfo.location && (
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        {buyerInfo.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                            <div className="bg-white p-2 rounded-lg">
                                                <p className="text-xs text-gray-500">Rating</p>
                                                <p className="font-medium text-sm flex items-center gap-1">
                                                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                    {buyerInfo.rating || 0}
                                                </p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg">
                                                <p className="text-xs text-gray-500">Projects</p>
                                                <p className="font-medium text-sm">{buyerInfo.projectsPosted || 0}</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg">
                                                <p className="text-xs text-gray-500">Member Since</p>
                                                <p className="font-medium text-sm">
                                                    {buyerInfo.createdAt ? new Date(buyerInfo.createdAt).getFullYear() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg">
                                                <p className="text-xs text-gray-500">User Type</p>
                                                <p className="font-medium text-sm capitalize">{buyerInfo.userType || 'Student'}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={() => handleViewBuyer(buyerInfo._id)}
                                                className="flex-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center justify-center gap-1"
                                            >
                                                <Eye size={18} />
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Applicants */}
                            {activeTab === 'applicants' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Applicants ({applicants.length})</h2>

                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">Total Applicants</p>
                                            <p className="text-lg font-bold">{applicants.length}</p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">Shortlisted</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {applicants.filter(a => a.status === 'shortlisted').length}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">Hired</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {applicants.filter(a => a.status === 'hired').length}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-lg">
                                            <p className="text-xs text-gray-500">Pending</p>
                                            <p className="text-lg font-bold text-yellow-600">
                                                {applicants.filter(a => a.status === 'pending').length}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Applicants List */}
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {applicants.length > 0 ? (
                                            applicants.map((applicant) => (
                                                <div key={applicant._id} className="border border-gray-200 rounded-lg p-3">
                                                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                                                        <div className="flex items-start gap-2 md:w-1/3">
                                                            {applicant.avatar || applicant.freelancer?.profileImage ? (
                                                                <img
                                                                    src={applicant.avatar || applicant.freelancer?.profileImage}
                                                                    alt={applicant.name}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <Users size={16} className="text-gray-500" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="flex items-center gap-1">
                                                                    <h4 className="font-medium text-sm text-gray-900">{applicant.name}</h4>
                                                                    {applicant.verified && (
                                                                        <span className="text-blue-500 text-xs">✓</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-600">{applicant.title}</p>
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                                    <span className="text-xs font-medium">{applicant.rating || 0}</span>
                                                                    <span className="text-xs text-gray-500">({applicant.reviews || 0})</span>
                                                                </div>
                                                                {getApplicantStatusBadge(applicant.status)}
                                                            </div>
                                                        </div>

                                                        <div className="md:w-2/3 space-y-1">
                                                            <div className="grid grid-cols-2 gap-1 text-xs">
                                                                <div>
                                                                    <span className="text-gray-500">Proposed:</span>
                                                                    <span className="ml-1 font-medium">{formatCurrency(applicant.proposedBudget)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Timeline:</span>
                                                                    <span className="ml-1">{applicant.proposedTimeline || 'N/A'}</span>
                                                                </div>
                                                            </div>

                                                            <p className="text-xs text-gray-700 line-clamp-2">
                                                                {applicant.coverLetter}
                                                            </p>

                                                            <div className="flex gap-1 mt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleViewApplicant(applicant.freelancer?._id || applicant._id)}
                                                                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                                >
                                                                    View Profile
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                <Users size={32} className="mx-auto text-gray-300 mb-2" />
                                                <p className="text-gray-500 text-sm">No applicants yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
};

export default EditProject;