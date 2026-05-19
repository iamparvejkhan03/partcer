import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { RTE, AdminSidebar, AdminHeader, AdminContainer } from '../../components';
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
    ChevronDown,
    Search,
    Check,
    Wrench,
    Users,
    Star,
    Eye,
    RefreshCw,
    FileText,
    Calendar,
    HelpCircle,
    PauseCircle,
    PlayCircle,
    UserCheck,
    UserX,
    Paperclip,
    Loader,
    Award,
    MapPin,
    Tag
} from "lucide-react";
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

// Period options
const PERIODS = [
    { id: "one_time", label: "One-time", description: "Single session" },
    { id: "per_day", label: "Per day", description: "Daily sessions" },
    { id: "weekly", label: "Weekly", description: "Weekly commitment" },
    { id: "monthly", label: "Monthly", description: "Monthly commitment" },
];

// Duration options
const DURATION_OPTIONS = {
    one_time: [{ id: "standard", label: "Single session" }],
    per_day: [
        { id: "standard", label: "Standard (2-3 hrs)" },
        { id: "full_day", label: "Full day (6-8 hrs)" },
    ],
    weekly: [
        { id: "standard", label: "Standard (2-3 hrs/day)" },
        { id: "full_day", label: "Full day (6-8 hrs/day)" },
    ],
    monthly: [
        { id: "standard", label: "Standard (2-3 hrs/day)" },
        { id: "full_day", label: "Full day (6-8 hrs/day)" },
    ],
};

// Service options
const SERVICES = [
    { id: "Job Support (Mentoring)", label: "Job Support (Mentoring)" },
    { id: "Skill Training", label: "Skill Training" },
    { id: "Mock Interview Support", label: "Mock Interview Support" },
];

// Skills Multi-select Component
const SkillsSelect = ({ selectedSkills, onChange, skillsList }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    const filteredSkills = skillsList.filter(skill =>
        skill.name.toLowerCase().includes(search.toLowerCase()) &&
        !selectedSkills.includes(skill._id)
    );

    const toggleSkill = (skillId, skillName) => {
        if (selectedSkills.includes(skillId)) {
            onChange(selectedSkills.filter(id => id !== skillId));
        } else {
            if (selectedSkills.length >= 10) {
                toast.error('Maximum 10 skills allowed');
                return;
            }
            onChange([...selectedSkills, skillId]);
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
            {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map((skillId) => {
                        const skill = skillsList.find(s => s._id === skillId);
                        return skill ? (
                            <div key={skill._id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-sm">
                                <Wrench size={14} />
                                {skill.name}
                                <button type="button" onClick={() => toggleSkill(skill._id, skill.name)} className="ml-1 hover:text-red-200">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : null;
                    })}
                </div>
            )}

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
                                    key={skill._id}
                                    type="button"
                                    onClick={() => toggleSkill(skill._id, skill.name)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                                >
                                    <span>{skill.name}</span>
                                    {selectedSkills.includes(skill._id) && <Check size={16} className="text-primary" />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No skills found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Dropdown Component
const Dropdown = ({ label, value, options, onChange, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg bg-white flex justify-between items-center ${!disabled ? "hover:border-gray-400" : "bg-gray-50 cursor-not-allowed"}`}
                disabled={disabled}
            >
                <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
                    {selectedOption?.label || `Select ${label.toLowerCase()}`}
                </span>
                <ChevronDown size={16} className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && !disabled && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => { onChange(option.id); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between ${value === option.id ? "bg-primary/5 text-primary" : ""}`}
                        >
                            <div>
                                <div className="font-medium text-sm">{option.label}</div>
                                {option.description && <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>}
                            </div>
                            {value === option.id && <Check size={16} className="text-primary" />}
                        </button>
                    ))}
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
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [pendingSubCategory, setPendingSubCategory] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');
    const [selectedDuration, setSelectedDuration] = useState('standard');
    const [selectedService, setSelectedService] = useState('Skill Training');
    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [removedAttachments, setRemovedAttachments] = useState([]);
    const [buyerInfo, setBuyerInfo] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [moderationNotes, setModerationNotes] = useState('');
    const [loadingSkills, setLoadingSkills] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        control,
        watch,
        formState: { errors }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            title: '',
            category: '',
            subCategory: '',
            description: '',
            additionalInfo: '',
            requirements: '',
            status: 'pending',
            featured: false,
            rejectionReason: ''
        }
    });

    const statusWatch = watch('status');
    const featuredWatch = watch('featured');

    // Helper functions
    const getPeriodLabel = (period) => {
        const map = { one_time: 'One-time', per_day: 'Per day', weekly: 'Weekly', monthly: 'Monthly' };
        return map[period] || period;
    };

    const getDurationLabel = (period, duration) => {
        if (period === 'one_time') return 'Single session';
        if (duration === 'standard') return 'Standard (2-3 hrs)';
        return 'Full day (6-8 hrs)';
    };

    useEffect(() => {
        fetchProjectData();
        fetchSkillsList();
        fetchCategories();
    }, [projectId]);

    useEffect(() => {
        if (selectedCategory) {
            fetchSubCategories(selectedCategory);
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (pendingSubCategory && subCategories.length > 0) {
            setValue('subCategory', pendingSubCategory);
            setPendingSubCategory('');
        }
    }, [subCategories, pendingSubCategory]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await axiosInstance.get('/api/v1/categories/public/parents');
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/categories/public/${categoryId}/subcategories`);
            if (response.data?.success) {
                setSubCategories(response.data.data?.subcategories || []);
            } else {
                setSubCategories([]);
            }
        } catch (err) {
            setSubCategories([]);
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
        } finally {
            setLoadingSkills(false);
        }
    };

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/projects/admin/${projectId}/edit`);

            if (response.data.success) {
                const project = response.data.data;

                // Set form values
                setValue('title', project.title || '');
                setValue('description', project.description || '');
                setValue('additionalInfo', project.additionalInfo || '');
                setValue('requirements', project.requirements || '');
                setValue('status', project.status || 'pending');
                setValue('featured', project.featured || false);
                setValue('rejectionReason', project.cancellationReason || '');

                // Set category
                if (project.category?._id) {
                    setSelectedCategory(project.category._id);
                    setValue('category', project.category._id);
                }

                // Set subcategory
                if (project.subCategory?._id) {
                    setPendingSubCategory(project.subCategory._id);
                }

                // Set period, duration, service
                setSelectedPeriod(project.period || 'weekly');
                setSelectedDuration(project.duration || 'standard');
                setSelectedService(project.service || 'Skill Training');

                // Set skills
                const skillIds = project.skills?.map(skill => typeof skill === 'string' ? skill : skill._id) || [];
                setSelectedSkills(skillIds);

                // Set attachments
                if (project.attachments?.length > 0) {
                    setExistingAttachments(project.attachments);
                }

                // Set buyer info
                if (project.buyer) {
                    setBuyerInfo(project.buyer);
                }

                // Fetch proposals
                if (project.proposals?.length) {
                    setProposals(project.proposals);
                } else {
                    fetchProjectProposals(project._id);
                }
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            toast.error('Failed to load project data');
            navigate('/admin/projects');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectProposals = async (projectId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/projects/${projectId}/proposals`);
            if (response.data.success) {
                setProposals(response.data.data?.proposals || []);
            }
        } catch (error) {
            console.error('Error fetching proposals:', error);
        }
    };

    const handleAttachmentUpload = (e) => {
        const files = Array.from(e.target.files);
        const totalFiles = existingAttachments.length + attachments.length + files.length;

        if (totalFiles > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 10MB limit`);
                return false;
            }
            return true;
        });

        setAttachments([...attachments, ...validFiles]);
    };

    const removeExistingAttachment = (index) => {
        const attachment = existingAttachments[index];
        if (attachment.publicId) {
            setRemovedAttachments([...removedAttachments, attachment.publicId]);
        }
        setExistingAttachments(existingAttachments.filter((_, i) => i !== index));
    };

    const removeNewAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleApprove = () => {
        setValue('status', 'active');
        setValue('rejectionReason', '');
        toast.success('Project approved');
    };

    const handleReject = () => {
        setValue('status', 'rejected');
        toast.success('Project rejected');
    };

    const handleSuspend = () => {
        setValue('status', 'suspended');
        toast.success('Project suspended');
    };

    const handleActivate = () => {
        setValue('status', 'active');
        toast.success('Project activated');
    };

    const handleFeature = () => {
        setValue('featured', !featuredWatch);
        toast.success(featuredWatch ? 'Featured removed' : 'Project featured');
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);

            const projectData = {
                title: data.title,
                description: data.description,
                category: data.category,
                subCategory: data.subCategory || undefined,
                skills: selectedSkills,
                period: selectedPeriod,
                duration: selectedDuration,
                service: selectedService,
                additionalInfo: data.additionalInfo || '',
                requirements: data.requirements || '',
                status: data.status,
                featured: data.featured,
                cancellationReason: data.rejectionReason || '',
                removedAttachments: removedAttachments,
                moderationNotes: moderationNotes
            };

            const formDataObj = new FormData();
            formDataObj.append('data', JSON.stringify(projectData));

            attachments.forEach((file) => {
                formDataObj.append('attachments', file);
            });

            await axiosInstance.put(`/api/v1/projects/admin/${projectId}`, formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Project updated successfully!');
            navigate('/admin/projects');
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to update project';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
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
                <Icon size={12} /> {badge.label}
            </span>
        );
    };

    const getProposalStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
        };
        const badge = config[status] || config.pending;
        return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: FileText },
        // { id: 'requirements', label: 'Requirements', icon: Paperclip },
        // { id: 'moderation', label: 'Moderation', icon: Shield },
        { id: 'buyer', label: 'Student', icon: Users },
        { id: 'proposals', label: 'Proposals', icon: UserCheck },
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
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/admin/projects')} className="p-2 hover:bg-gray-200 rounded-lg">
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Project</h1>
                                <p className="text-gray-600 mt-1">ID: {projectId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <button onClick={() => navigate('/admin/projects')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleSubmit(onSubmit)} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
                                {saving ? <><RefreshCw size={18} className="animate-spin" /> Saving...</> : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Status:</span> {getStatusBadge(statusWatch)}
                                </div>
                                {/* <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Featured:</span>
                                    {featuredWatch ?
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"><Award size={12} /> Featured</span> :
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Not Featured</span>
                                    }
                                </div> */}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {statusWatch === 'pending' && (
                                    <>
                                        <button onClick={handleApprove} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm"><CheckCircle size={14} /> Approve</button>
                                        <button onClick={handleReject} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm"><XCircle size={14} /> Reject</button>
                                    </>
                                )}
                                {/* {statusWatch === 'active' && (
                                    <>
                                        <button onClick={handleFeature} className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${featuredWatch ? 'bg-gray-600 text-white' : 'bg-purple-600 text-white'}`}>
                                            <Award size={14} /> {featuredWatch ? 'Remove Featured' : 'Mark Featured'}
                                        </button>
                                        <button onClick={handleSuspend} className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm"><PauseCircle size={14} /> Suspend</button>
                                    </>
                                )} */}
                                {statusWatch === 'suspended' && (
                                    <button onClick={handleActivate} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm"><PlayCircle size={14} /> Activate</button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 overflow-x-auto pb-2">
                        <div className="flex gap-2 min-w-max">
                            {tabs.map((tab) => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                                    <tab.icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

                        {/* Tab: Basic Info */}
                        {activeTab === 'basic' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                                    <input type="text" {...register('title', { required: 'Title is required' })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                                </div>

                                {/* Category & Subcategory */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                        <select {...register('category', { required: 'Category is required' })} onChange={(e) => { setSelectedCategory(e.target.value); setValue('category', e.target.value); setValue('subCategory', ''); }} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg">
                                            <option value="">Select Category</option>
                                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                        <select {...register('subCategory')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" disabled={!selectedCategory || subCategories.length === 0}>
                                            <option value="">Select Subcategory</option>
                                            {subCategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                    <RTE name="description" control={control} defaultValue={getValues('description') || ''} />
                                </div>

                                {/* Period, Duration, Service Dropdowns */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Dropdown label="Period" value={selectedPeriod} options={PERIODS} onChange={(val) => { setSelectedPeriod(val); setSelectedDuration(DURATION_OPTIONS[val][0].id); }} />
                                    <Dropdown label="Duration" value={selectedDuration} options={DURATION_OPTIONS[selectedPeriod] || []} onChange={setSelectedDuration} />
                                    <Dropdown label="Service" value={selectedService} options={SERVICES} onChange={setSelectedService} />
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required</label>
                                    <SkillsSelect selectedSkills={selectedSkills} onChange={setSelectedSkills} skillsList={skillsList} />
                                </div>
                            </div>
                        )}

                        {/* Tab: Requirements */}
                        {activeTab === 'requirements' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900">Requirements & Attachments</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specific Requirements</label>
                                    <textarea {...register('requirements')} rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="List specific requirements..." />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                                    <textarea {...register('additionalInfo')} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="Any other details..." />
                                </div>

                                {/* Attachments */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Max 5 files, 10MB each)</label>
                                    {existingAttachments.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-600 mb-2">Current Files:</p>
                                            <div className="space-y-2">
                                                {existingAttachments.map((file, idx) => (
                                                    <div key={file._id || idx} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                                                        <div className="flex items-center gap-2"><Paperclip size={14} className="text-blue-600" /><span className="text-sm">{file.name}</span></div>
                                                        <button type="button" onClick={() => removeExistingAttachment(idx)} className="text-red-500"><X size={14} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input type="file" multiple onChange={handleAttachmentUpload} className="hidden" id="attachments-upload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" />
                                        <label htmlFor="attachments-upload" className="cursor-pointer flex flex-col items-center">
                                            <Upload size={24} className="text-gray-400 mb-1" />
                                            <p className="text-sm text-gray-600">Click to upload files</p>
                                            <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG, ZIP (Max 10MB)</p>
                                        </label>
                                    </div>
                                    {attachments.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-600 mb-2">New Files:</p>
                                            {attachments.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-1">
                                                    <span className="text-sm">{file.name}</span>
                                                    <button type="button" onClick={() => removeNewAttachment(idx)} className="text-red-500"><X size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab: Moderation */}
                        {activeTab === 'moderation' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900">Moderation</h2>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['active', 'pending', 'suspended', 'completed'].map(status => (
                                        <label key={status} className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer ${statusWatch === status ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                                            <input type="radio" {...register('status')} value={status} className="hidden" />
                                            <span className="text-sm capitalize">{status}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div><h3 className="font-medium">Featured Project</h3><p className="text-xs text-gray-500">Highlight in search results</p></div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register('featured')} className="sr-only peer" />
                                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                {statusWatch === 'rejected' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                                        <textarea {...register('rejectionReason')} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="Why was this project rejected?" />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Moderation Notes (Internal)</label>
                                    <textarea value={moderationNotes} onChange={(e) => setModerationNotes(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg" placeholder="Internal notes for admins..." />
                                </div>
                            </div>
                        )}

                        {/* Tab: Buyer Info */}
                        {activeTab === 'buyer' && buyerInfo && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-4">
                                        {buyerInfo.profileImage ? <img src={buyerInfo.profileImage} className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center"><Users size={24} className="text-gray-500" /></div>}
                                        <div>
                                            <h3 className="text-lg font-bold">{buyerInfo.displayName || `${buyerInfo.firstName || ''} ${buyerInfo.lastName || ''}`.trim()}</h3>
                                            <p className="text-sm text-gray-600">{buyerInfo.email}</p>
                                            <div className="flex items-center gap-2 mt-1"><Star size={14} className="fill-yellow-400" /> {buyerInfo.rating || 0} ({buyerInfo?.reviewCount || 0} reviews)</div>
                                        </div>
                                    </div>
                                    {/* <button type="button" onClick={() => navigate(`/admin/users/${buyerInfo._id}`)} className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm">View Full Profile</button> */}
                                </div>
                            </div>
                        )}

                        {/* Tab: Proposals */}
                        {activeTab === 'proposals' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900">Proposals ({proposals.length})</h2>
                                {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold">{proposals.length}</p></div>
                                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-bold text-yellow-600">{proposals.filter(p => p.status === 'pending').length}</p></div>
                                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Accepted</p><p className="text-xl font-bold text-green-600">{proposals.filter(p => p.status === 'accepted').length}</p></div>
                                    <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Rejected</p><p className="text-xl font-bold text-red-600">{proposals.filter(p => p.status === 'rejected').length}</p></div>
                                </div> */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {proposals.length > 0 ? proposals.map(proposal => (
                                        <div key={proposal._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    {proposal.freelancerAvatar ? <img src={proposal.freelancerAvatar} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><Users size={16} /></div>}
                                                    <div><h4 className="font-medium">{proposal.freelancerName}</h4><p className="text-xs text-gray-500">Applied {formatDate(proposal.createdAt)}</p></div>
                                                </div>
                                                {/* {getProposalStatusBadge(proposal.status)} */}
                                            </div>
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700">{proposal.proposal}</p>
                                            </div>
                                            {proposal.selectedPeriod && (
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded">Period: {getPeriodLabel(proposal.selectedPeriod)}</span>
                                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded">Duration: {proposal.selectedDuration === 'standard' ? 'Standard' : 'Full day'}</span>
                                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded">Service: {proposal.selectedService}</span>
                                                </div>
                                            )}
                                        </div>
                                    )) : <div className="text-center py-8 bg-gray-50 rounded-lg"><Users size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500">No proposals yet</p></div>}
                                </div>
                            </div>
                        )}
                    </form>
                </AdminContainer>
            </div>
        </section>
    );
};

export default EditProject;