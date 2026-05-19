import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { LanguagesSelect, RTE } from '../../components';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Globe,
    Briefcase,
    DollarSign,
    Star,
    Award,
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
    GraduationCap,
    Calendar,
    Building,
    FileText,
    Plus,
    Trash2,
    RefreshCw,
    Eye,
    EyeOff,
    Lock,
    Smartphone,
    Laptop,
    Tablet,
    CreditCard,
    Edit
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

// Experience Modal Component
const ExperienceModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        defaultValues: initialData || {
            jobTitle: "",
            companyName: "",
            location: "",
            startDate: "",
            endDate: "",
            description: "",
            current: false
        }
    });

    const onSubmit = (data) => {
        onSave(data);
        reset();
        onClose();
    };

    const watchCurrent = watch && watch('current');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {initialData ? "Edit Experience" : "Add Experience"}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    {...register("jobTitle", { required: "Job title is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., Senior Developer"
                                />
                                {errors.jobTitle && (
                                    <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    {...register("companyName", { required: "Company name is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., Google, Microsoft"
                                />
                                {errors.companyName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    {...register("location")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., New York, NY"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        {...register("startDate", { required: "Start date is required" })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.startDate && (
                                        <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        {...register("endDate")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        disabled={watchCurrent}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    {...register("current")}
                                    id="current"
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="current" className="ml-2 text-sm text-gray-700">
                                    I currently work here
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    {...register("description")}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Describe your responsibilities and achievements..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
                                >
                                    Save Experience
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Education Modal Component
const EducationModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        defaultValues: initialData || {
            degreeTitle: "",
            instituteName: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            description: "",
            current: false
        }
    });

    const onSubmit = (data) => {
        onSave(data);
        reset();
        onClose();
    };

    const watchCurrent = watch && watch('current');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {initialData ? "Edit Education" : "Add Education"}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Degree Title *
                                </label>
                                <input
                                    type="text"
                                    {...register("degreeTitle", { required: "Degree title is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., Bachelor of Science"
                                />
                                {errors.degreeTitle && (
                                    <p className="mt-1 text-sm text-red-600">{errors.degreeTitle.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Institute Name *
                                </label>
                                <input
                                    type="text"
                                    {...register("instituteName", { required: "Institute name is required" })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., Stanford University"
                                />
                                {errors.instituteName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.instituteName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Field of Study
                                </label>
                                <input
                                    type="text"
                                    {...register("fieldOfStudy")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., Computer Science"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        {...register("startDate", { required: "Start date is required" })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    {errors.startDate && (
                                        <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        {...register("endDate")}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        disabled={watchCurrent}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    {...register("current")}
                                    id="currentEdu"
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="currentEdu" className="ml-2 text-sm text-gray-700">
                                    I am currently studying here
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    {...register("description")}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Add any additional details..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
                                >
                                    Save Education
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

const EditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userRole, setUserRole] = useState('freelancer'); // 'freelancer' or 'buyer'
    const [profileImage, setProfileImage] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [educations, setEducations] = useState([]);
    const [skillsList, setSkillsList] = useState([]);
    const [experienceModalOpen, setExperienceModalOpen] = useState(false);
    const [educationModalOpen, setEducationModalOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState(null);
    const [editingEducation, setEditingEducation] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors }
    } = useForm({
        defaultValues: {
            // Common fields
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            gender: "",
            tagline: "",
            bio: "",
            country: "",
            city: "",
            address: "",
            postalCode: "",

            // Freelancer specific
            freelancerType: "independent",
            englishLevel: "conversational",
            // hourlyRate: "",
            skills: [],
            languages: [],

            // Buyer specific
            companyName: "",
            notificationPreferences: {
                email: true,
                sms: false,
                push: true
            },

            // Account info
            status: "active",
            isVerified: false,
            role: "freelancer"
        }
    });

    const userRoleWatch = watch('role');

    useEffect(() => {
        fetchUserData();
        fetchSkillsList();
    }, [userId]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/admin/users/${userId}`);

            if (response.data.success) {
                const userData = response.data.data;

                // Set form values
                Object.keys(userData).forEach(key => {
                    if (key !== 'experience' && key !== 'education' && key !== 'skills' && key !== 'languages') {
                        setValue(key, userData[key]);
                    }
                });

                setValue('userType', userData.userType);
                setUserRole(userData.userType || 'freelancer');
                setSelectedSkills(userData.skills || []);
                setSelectedLanguages(userData.languages || []);
                setExperiences(userData.experience || []);
                setEducations(userData.education || []);
                setProfileImage(userData.profileImage || "");
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error(error?.response?.data?.message || 'Failed to load user data');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const fetchSkillsList = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/skills');
            if (response.data.success) {
                setSkillsList(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching skills:', error);
            // Fallback to mock data if API fails
            setSkillsList([
                { _id: 'react', name: 'React.js' },
                { _id: 'node', name: 'Node.js' },
                { _id: 'python', name: 'Python' },
                // ... rest of skills
            ]);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should not exceed 5MB");
                return;
            }
            setImageFile(file); // Store the file for upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result); // For preview
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExperienceSave = (data) => {
        if (editingExperience) {
            setExperiences(experiences.map(exp =>
                exp.id === editingExperience.id ? { ...data, id: exp.id } : exp
            ));
            setEditingExperience(null);
        } else {
            setExperiences([...experiences, { ...data, id: Date.now() }]);
        }
    };

    const handleEducationSave = (data) => {
        if (editingEducation) {
            setEducations(educations.map(edu =>
                edu.id === editingEducation.id ? { ...data, id: edu.id } : edu
            ));
            setEditingEducation(null);
        } else {
            setEducations([...educations, { ...data, id: Date.now() }]);
        }
    };

    const handleDeleteExperience = (id) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
    };

    const handleDeleteEducation = (id) => {
        setEducations(educations.filter(edu => edu.id !== id));
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);

            const formData = new FormData();

            // Create a copy of data without twoFactorAuth
            const { twoFactorAuth, ...dataWithout2FA } = data;

            // Add skills, languages, experiences, educations to dataWithout2FA
            dataWithout2FA.skills = selectedSkills;
            dataWithout2FA.languages = selectedLanguages;
            dataWithout2FA.experiences = experiences;
            dataWithout2FA.educations = educations;

            // Append all form fields
            Object.keys(dataWithout2FA).forEach(key => {
                if (dataWithout2FA[key] !== undefined && dataWithout2FA[key] !== null) {
                    if (typeof dataWithout2FA[key] === 'object') {
                        formData.append(key, JSON.stringify(dataWithout2FA[key]));
                    } else {
                        formData.append(key, dataWithout2FA[key]);
                    }
                }
            });

            // Append image if changed
            if (imageFile) {
                formData.append('profileImage', imageFile);
            }

            const response = await axiosInstance.put(`/api/v1/admin/users/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success('User updated successfully!');
                navigate('/admin/users/all');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error(error?.response?.data?.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'contact', label: 'Contact & Location', icon: MapPin },
        { id: 'professional', label: 'Professional Details', icon: Briefcase },
        { id: 'experience', label: 'Experience', icon: GraduationCap },
        { id: 'education', label: 'Education', icon: FileText },
        { id: 'account', label: 'Account Settings', icon: Shield }
    ];

    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
        { value: "prefer-not-to-say", label: "Prefer not to say" }
    ];

    const englishLevels = [
        { value: "basic", label: "Basic" },
        { value: "conversational", label: "Conversational" },
        { value: "fluent", label: "Fluent" },
        { value: "native", label: "Native/Bilingual" }
    ];

    const freelancerTypes = [
        { value: "independent", label: "Independent Mentor" },
        { value: "agency", label: "Agency" }
    ];

    const countries = [
        "United States", "United Kingdom", "Canada", "Australia", "India",
        "Germany", "France", "Singapore", "Japan", "Brazil", "Italy",
        "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "UAE"
    ];

    const statusOptions = [
        { value: "active", label: "Active", icon: CheckCircle, color: "text-green-600" },
        { value: "pending", label: "Pending", icon: Clock, color: "text-yellow-600" },
        { value: "suspended", label: "Suspended", icon: AlertCircle, color: "text-orange-600" },
        { value: "banned", label: "Banned", icon: XCircle, color: "text-red-600" }
    ];

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
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit User</h1>
                                <p className="text-gray-600 mt-1">User ID: {userId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <button
                                onClick={() => navigate('/admin/users')}
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

                    {/* Role Badge & Status */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Role:</span>
                            <select
                                {...register('userType')}
                                onChange={(e) => setUserRole(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="freelancer">Mentor</option>
                                <option value="buyer">Student</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Status:</span>
                            <select
                                {...register('status')}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Verification:</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('isVerified')}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span className="text-sm">Verified</span>
                            </label>
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

                                {/* Profile Image */}
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                                            {profileImage ? (
                                                <img
                                                    src={profileImage}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User size={32} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 bg-white border border-gray-300 hover:border-primary hover:bg-primary hover:text-white text-gray-600 p-2 rounded-lg shadow-md cursor-pointer transition-all">
                                            <Camera size={16} />
                                            <input
                                                id="profile-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Profile Photo</p>
                                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                                    </div>
                                </div>

                                {/* Name Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('firstName', { required: 'First name is required' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {errors.firstName && (
                                            <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('lastName', { required: 'Last name is required' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {errors.lastName && (
                                            <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Tagline & Gender */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tagline
                                        </label>
                                        <input
                                            type="text"
                                            {...register('tagline')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="e.g., Senior Full Stack Developer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender
                                        </label>
                                        <select
                                            {...register('gender')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            {genderOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        {...register("bio")}
                                        rows={4}
                                        placeholder="Tell us a little about yourself..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tab: Contact & Location */}
                        {activeTab === 'contact' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Location</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                {...register('email', { required: 'Email is required' })}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                {...register('phone')}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Country
                                        </label>
                                        <select
                                            {...register('country')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="">Select country</option>
                                            {countries.map(country => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            {...register('city')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="e.g., New York"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        {...register('address')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Street address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        {...register('postalCode')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="e.g., 10001"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tab: Professional Details */}
                        {activeTab === 'professional' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>

                                {/* Role-specific fields */}
                                {userRole === 'freelancer' ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Mentor Type
                                                </label>
                                                <select
                                                    {...register('freelancerType')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                >
                                                    {freelancerTypes.map(type => (
                                                        <option key={type.value} value={type.value}>{type.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    English Level
                                                </label>
                                                <select
                                                    {...register('englishLevel')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                >
                                                    {englishLevels.map(level => (
                                                        <option key={level.value} value={level.value}>{level.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hourly Rate (USD)
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="number"
                                                    {...register('hourlyRate')}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="e.g., 50"
                                                />
                                            </div>
                                        </div> */}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Skills
                                            </label>
                                            <SkillsSelect
                                                selectedSkills={selectedSkills}
                                                onChange={setSelectedSkills}
                                                skillsList={skillsList}
                                            />
                                        </div>
                                    </>
                                ) : userRole === 'buyer' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                {...register('companyName')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="e.g., TechFund Inc."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                English Level
                                            </label>
                                            <select
                                                {...register('englishLevel')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                {englishLevels.map(level => (
                                                    <option key={level.value} value={level.value}>{level.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : null}

                                {/* Languages (common for both) */}
                                <div>
                                    <LanguagesSelect
                                        selectedLanguages={selectedLanguages}
                                        onChange={setSelectedLanguages}
                                    />
                                </div>

                                {/* Notification Preferences (for buyers) */}
                                {/* {userRole === 'buyer' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notification Preferences
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    {...register('notificationPreferences.email')}
                                                    className="w-4 h-4 text-primary rounded border-gray-300"
                                                />
                                                <span className="text-sm">Email notifications</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    {...register('notificationPreferences.sms')}
                                                    className="w-4 h-4 text-primary rounded border-gray-300"
                                                />
                                                <span className="text-sm">SMS notifications</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    {...register('notificationPreferences.push')}
                                                    className="w-4 h-4 text-primary rounded border-gray-300"
                                                />
                                                <span className="text-sm">Push notifications</span>
                                            </label>
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        )}

                        {/* Tab: Experience */}
                        {activeTab === 'experience' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingExperience(null);
                                            setExperienceModalOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                                    >
                                        <Plus size={16} />
                                        Add Experience
                                    </button>
                                </div>

                                {experiences.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <Briefcase size={40} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-500">No experience added yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {experiences.map((exp) => (
                                            <div key={exp._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{exp.jobTitle}</h3>
                                                        <p className="text-sm text-gray-600">{exp.companyName}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {exp.startDate} - {exp.endDate || 'Present'}
                                                        </p>
                                                        {exp.description && (
                                                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingExperience(exp);
                                                                setExperienceModalOpen(true);
                                                            }}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteExperience(exp.id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Education */}
                        {activeTab === 'education' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingEducation(null);
                                            setEducationModalOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                                    >
                                        <Plus size={16} />
                                        Add Education
                                    </button>
                                </div>

                                {educations.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <GraduationCap size={40} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-500">No education added yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {educations.map((edu) => (
                                            <div key={edu._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{edu.degreeTitle}</h3>
                                                        <p className="text-sm text-gray-600">{edu.instituteName}</p>
                                                        {edu.fieldOfStudy && (
                                                            <p className="text-xs text-gray-500">{edu.fieldOfStudy}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {edu.startDate} - {edu.endDate || 'Present'}
                                                        </p>
                                                        {edu.description && (
                                                            <p className="text-sm text-gray-700 mt-2">{edu.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingEducation(edu);
                                                                setEducationModalOpen(true);
                                                            }}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteEducation(edu.id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Account Settings */}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-yellow-800">Admin Actions</p>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Changes made here will affect the user's account immediately.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                placeholder="Leave blank to keep current"
                                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                <EyeOff size={18} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current password</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="password"
                                                placeholder="Confirm new password"
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Account Statistics</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Member Since</p>
                                            <p className="font-medium">Jan 15, 2024</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500">Last Login</p>
                                            <p className="font-medium">Feb 23, 2025</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="font-medium text-red-600 mb-3">Danger Zone</h3>
                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                        >
                                            Suspend User Account
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Experience Modal */}
                    <ExperienceModal
                        isOpen={experienceModalOpen}
                        onClose={() => {
                            setExperienceModalOpen(false);
                            setEditingExperience(null);
                        }}
                        onSave={handleExperienceSave}
                        initialData={editingExperience}
                    />

                    {/* Education Modal */}
                    <EducationModal
                        isOpen={educationModalOpen}
                        onClose={() => {
                            setEducationModalOpen(false);
                            setEditingEducation(null);
                        }}
                        onSave={handleEducationSave}
                        initialData={editingEducation}
                    />
                </AdminContainer>
            </div>
        </section>
    );
};

export default EditUser;