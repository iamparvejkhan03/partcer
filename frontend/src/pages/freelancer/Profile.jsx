import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, set } from "react-hook-form";
import { Editor } from "@tinymce/tinymce-react";
import { FreelancerContainer, FreelancerHeader, FreelancerSidebar, RTE } from "../../components";
import {
    User,
    Camera,
    Globe,
    Briefcase,
    GraduationCap,
    DollarSign,
    X,
    Plus,
    Trash2,
    ChevronDown,
    Check,
    Upload,
    Save,
    Eye,
    Search,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Award
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import useCountryStates from "../../hooks/useCountryStates";

// Experience Modal Component
const ExperienceModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || {
            jobTitle: "",
            companyName: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: ""
        }
    });

    const [isCurrent, setIsCurrent] = useState(initialData?.current || false);

    useEffect(() => {
        if (initialData) {
            reset(initialData);
            setIsCurrent(initialData.current || false);
        } else {
            reset({
                jobTitle: "",
                companyName: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                description: ""
            });
            setIsCurrent(false);
        }
    }, [initialData, reset, isOpen]);

    const onSubmit = (data) => {
        onSave({ ...data, current: isCurrent });
        onClose();
    };

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
                                    placeholder="Add job title"
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
                                    placeholder="Add company name"
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
                                    placeholder="Select location"
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
                                        disabled={isCurrent}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${isCurrent ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="current"
                                    checked={isCurrent}
                                    onChange={(e) => setIsCurrent(e.target.checked)}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="current" className="text-sm text-gray-700">
                                    I currently work here
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Add description"
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
                                    Save & Update
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
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: initialData || {
            degreeTitle: "",
            instituteName: "",
            startDate: "",
            endDate: "",
            current: false,
            description: ""
        }
    });

    const [isCurrent, setIsCurrent] = useState(initialData?.current || false);

    useEffect(() => {
        if (initialData) {
            reset(initialData);
            setIsCurrent(initialData.current || false);
        } else {
            reset({
                degreeTitle: "",
                instituteName: "",
                startDate: "",
                endDate: "",
                current: false,
                description: ""
            });
            setIsCurrent(false);
        }
    }, [initialData, reset, isOpen]);

    const onSubmit = (data) => {
        onSave({ ...data, current: isCurrent });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto mt-20 md:mt-0">
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
                                    placeholder="Add degree title"
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
                                    placeholder="Add institute name"
                                />
                                {errors.instituteName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.instituteName.message}</p>
                                )}
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
                                        disabled={isCurrent}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${isCurrent ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="current"
                                    checked={isCurrent}
                                    onChange={(e) => setIsCurrent(e.target.checked)}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="current" className="text-sm text-gray-700">
                                    I currently study here
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Add description"
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
                                    Save & Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Multi-select Skills Component
const SkillsSelect = ({ selectedSkills, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);
    const [skills, setSkills] = useState([]);
    const [loadingSkills, setLoadingSkills] = useState(false);

    // Fetch skills
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                setLoadingSkills(true);
                const response = await axiosInstance.get('/api/v1/skills/public');
                if (response.data?.success) {
                    setSkills(Array.isArray(response.data.data) ? response.data.data : []);
                }
            } catch (error) {
                console.error('Error fetching skills:', error);
                toast.error('Failed to load skills');
            } finally {
                setLoadingSkills(false);
            }
        };
        fetchSkills();
    }, []);

    const allSkills = skills.map(skill => skill.name);

    const filteredSkills = allSkills.filter(skill =>
        skill.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSkill = (skill) => {
        if (selectedSkills.includes(skill)) {
            onChange(selectedSkills.filter(s => s !== skill));
        } else {
            // Add check for maximum 10 skills
            if (selectedSkills.length >= 10) {
                toast.error("You can select a maximum of 10 skills");
                return;
            }
            onChange([...selectedSkills, skill]);
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
            <div className="flex justify-start gap-5 items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <span className={`text-xs ${selectedSkills.length >= 10 ? 'text-red-500' : 'text-gray-500'}`}>
                    {selectedSkills.length}/10 selected
                </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[4px]">
                {selectedSkills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        <span>{skill}</span>
                        <button
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent flex justify-between items-center"
                >
                    <span className="text-gray-500">Select skills</span>
                    <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                            <input
                                type="text"
                                placeholder="Search skills..."
                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="py-1">
                            {filteredSkills.length > 0 ? (
                                filteredSkills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${selectedSkills.includes(skill) ? 'bg-blue-50' : ''}`}
                                        onClick={() => toggleSkill(skill)}
                                    >
                                        <span>{skill}</span>
                                        {selectedSkills.includes(skill) && (
                                            <Check size={16} className="text-primary" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-gray-500 text-center">
                                    No skills found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Multi-select Categories Component
const CategoriesSelect = ({ selectedCategories, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await axiosInstance.get('/api/v1/categories/public/parents');
                if (response.data?.success) {
                    setCategories(Array.isArray(response.data.data) ? response.data.data : []);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const allCategories = categories.map(category => category.name);

    const filteredCategories = allCategories.filter(category =>
        category.toLowerCase().includes(search.toLowerCase())
    );

    const toggleCategory = (category) => {
        if (selectedCategories.includes(category)) {
            onChange(selectedCategories.filter(c => c !== category));
        } else {
            // Add check for maximum 10 categories
            if (selectedCategories.length >= 10) {
                toast.error("You can select a maximum of 10 categories");
                return;
            }
            onChange([...selectedCategories, category]);
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
            <div className="flex justify-start gap-5 items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Categories</label>
                <span className={`text-xs ${selectedCategories.length >= 10 ? 'text-red-500' : 'text-gray-500'}`}>
                    {selectedCategories.length}/10 selected
                </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[4px]">
                {selectedCategories.map((category, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        <span>{category}</span>
                        <button
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent flex justify-between items-center"
                >
                    <span className="text-gray-500">Select categories</span>
                    <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                            <input
                                type="text"
                                placeholder="Search categories..."
                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="py-1">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category, index) => (
                                    <div
                                        key={index}
                                        className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${selectedCategories.includes(category) ? 'bg-blue-50' : ''}`}
                                        onClick={() => toggleCategory(category)}
                                    >
                                        <span>{category}</span>
                                        {selectedCategories.includes(category) && (
                                            <Check size={16} className="text-primary" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-gray-500 text-center">
                                    No categories found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Languages Select Component
const LanguagesSelect = ({ selectedLanguages, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    const allLanguages = [
        "English", "Spanish", "French", "German", "Italian", "Portuguese",
        "Dutch", "Russian", "Japanese", "Korean", "Chinese", "Arabic",
        "Hindi", "Bengali", "Urdu", "Turkish", "Vietnamese", "Thai",
        "Greek", "Polish", "Swedish", "Norwegian", "Danish", "Finnish"
    ];

    const filteredLanguages = allLanguages.filter(lang =>
        lang.toLowerCase().includes(search.toLowerCase())
    );

    const toggleLanguage = (language) => {
        if (selectedLanguages.includes(language)) {
            onChange(selectedLanguages.filter(l => l !== language));
        } else {
            onChange([...selectedLanguages, language]);
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages I Speak</label>

            <div className="flex flex-wrap gap-2 mb-2 min-h-[4px]">
                {selectedLanguages.map((lang, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        <span>{lang}</span>
                        <button
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent flex justify-between items-center"
            >
                <span className="text-gray-500">Select languages</span>
                <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b sticky top-0 bg-white z-10">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search languages..."
                                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="py-1">
                        {filteredLanguages.length > 0 ? (
                            filteredLanguages.map((lang, index) => (
                                <div
                                    key={index}
                                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${selectedLanguages.includes(lang) ? 'bg-blue-50' : ''}`}
                                    onClick={() => toggleLanguage(lang)}
                                >
                                    <span>{lang}</span>
                                    {selectedLanguages.includes(lang) && (
                                        <Check size={16} className="text-primary" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-gray-500 text-center">
                                No languages found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Multi-select Services Component
const ServiceSelect = ({ selectedServices, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);
    const [services, setServices] = useState([{ name: "Job Support (Mentoring)" }, { name: "Skill Training" }, { name: "Mock Interview Support" }]);
    const [loadingServices, setLoadingServices] = useState(false);

    // Fetch services
    // useEffect(() => {
    //     const fetchServices = async () => {
    //         try {
    //             setLoadingServices(true);
    //             const response = await axiosInstance.get('/api/v1/services/public');
    //             if (response.data?.success) {
    //                 setServices(Array.isArray(response.data.data) ? response.data.data : []);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching services:', error);
    //             toast.error('Failed to load services');
    //         } finally {
    //             setLoadingServices(false);
    //         }
    //     };
    //     fetchServices();
    // }, []);

    const allServices = services.map(service => service.name);

    const filteredServices = allServices.filter(service =>
        service?.toLowerCase().includes(search?.toLowerCase())
    );

    const toggleService = (service) => {
        if (selectedServices.includes(service)) {
            onChange(selectedServices.filter(s => s !== service));
        } else {
            onChange([...selectedServices, service]);
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[4px]">
                {selectedServices.map((service, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        <span>{service}</span>
                        <button
                            type="button"
                            onClick={() => toggleService(service)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent flex justify-between items-center"
                >
                    <span className="text-gray-500">Select services</span>
                    <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        <div className="p-2 border-b sticky top-0 bg-white z-10">
                            <input
                                type="text"
                                placeholder="Search services..."
                                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="py-1">
                            {filteredServices.length > 0 ? (
                                filteredServices.map((service, index) => (
                                    <div
                                        key={index}
                                        className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${selectedServices.includes(service) ? 'bg-blue-50' : ''}`}
                                        onClick={() => toggleService(service)}
                                    >
                                        <span>{service}</span>
                                        {selectedServices.includes(service) && (
                                            <Check size={16} className="text-primary" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-gray-500 text-center">
                                    No services found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Component
function Profile() {
    const { user, updateUserData, fetchCurrentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [profileImage, setProfileImage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    const [experienceModalOpen, setExperienceModalOpen] = useState(false);
    const [educationModalOpen, setEducationModalOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState(null);
    const [editingEducation, setEditingEducation] = useState(null);
    const [experiences, setExperiences] = useState([]);
    const [educations, setEducations] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [countriesList, setCountriesList] = useState([]);

    const { register, handleSubmit, control, setValue, watch, formState: { errors }, reset } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            gender: "",
            tagline: "",
            bio: "",
            country: "",
            freelancerType: "",
            englishLevel: "",
            hourlyRate: "",
            skills: [],
            categories: [],
            services: [],
            languages: []
        }
    });

    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
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

    // Fetch countries on mount
    // useEffect(() => {
    //     const fetchCountries = async () => {
    //         const countriesData = await countriesAPI();
    //         setCountries(countriesData);
    //         setCountriesList(countriesData.map(c => c.name));
    //     };
    //     fetchCountries();
    // }, []);

    // Fetch fresh user data on mount
    useEffect(() => {
        const loadUserData = async () => {
            if (user && !initialFetchDone) {
                try {
                    const freshUserData = await fetchCurrentUser();
                    if (freshUserData) {
                        populateFormFields(freshUserData);
                    }
                } catch (error) {
                    console.error('Failed to fetch fresh user data:', error);
                    if (user) {
                        populateFormFields(user);
                    }
                } finally {
                    setInitialFetchDone(true);
                }
            } else if (user) {
                populateFormFields(user);
            }
        };

        loadUserData();
    }, [user, initialFetchDone]);

    const populateFormFields = (userData) => {
        // Basic info
        setValue("firstName", userData.firstName || "");
        setValue("lastName", userData.lastName || "");
        setValue("email", userData.email || "");
        setValue("phoneNumber", userData.phone || "");
        setValue("tagline", userData.tagline || "");
        setValue("bio", userData.bio || "");
        setValue("country", userData.country || "");

        // Freelancer specific
        setValue("freelancerType", userData.freelancerType || "independent");

        if (userData.englishLevel) {
            setValue("englishLevel", userData.englishLevel);
        }

        if (userData.gender) {
            setValue("gender", userData.gender);
        }

        setValue("hourlyRate", userData.hourlyRate || "");

        // Arrays
        setSelectedSkills(userData.skills || []);
        setValue("skills", userData.skills || []);

        setSelectedCategories(userData.categories || []);
        setValue("categories", userData.categories || []);

        setSelectedServices(userData.services || []);
        setValue("services", userData.services || []);

        setSelectedLanguages(userData.languages || []);
        setValue("languages", userData.languages || []);

        // Experience and Education
        setExperiences(userData.experience || []);
        setEducations(userData.education || []);

        // Profile image
        setProfileImage(userData.profileImage || "");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should not be more than 5MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExperienceSave = async (data) => {
        try {
            let response;
            if (editingExperience) {
                // Update existing experience
                response = await axiosInstance.patch(`/api/v1/users/experience/${editingExperience._id}`, data);
            } else {
                // Add new experience
                response = await axiosInstance.post('/api/v1/users/experience', data);
            }

            if (response.data.success) {
                // Refresh user data
                const freshUser = await fetchCurrentUser();
                if (freshUser) {
                    setExperiences(freshUser.experience || []);
                }
                toast.success(editingExperience ? 'Experience updated successfully!' : 'Experience added successfully!');
            }
        } catch (error) {
            console.error('Experience save error:', error);
            toast.error(error?.response?.data?.message || 'Failed to save experience');
        }
    };

    const handleEducationSave = async (data) => {
        try {
            let response;
            if (editingEducation) {
                // Update existing education
                response = await axiosInstance.patch(`/api/v1/users/education/${editingEducation._id}`, data);
            } else {
                // Add new education
                response = await axiosInstance.post('/api/v1/users/education', data);
            }

            if (response.data.success) {
                // Refresh user data
                const freshUser = await fetchCurrentUser();
                if (freshUser) {
                    setEducations(freshUser.education || []);
                }
                toast.success(editingEducation ? 'Education updated successfully!' : 'Education added successfully!');
            }
        } catch (error) {
            console.error('Education save error:', error);
            toast.error(error?.response?.data?.message || 'Failed to save education');
        }
    };

    const handleDeleteExperience = async (id) => {
        if (window.confirm('Are you sure you want to delete this experience?')) {
            try {
                const response = await axiosInstance.delete(`/api/v1/users/experience/${id}`);
                if (response.data.success) {
                    const freshUser = await fetchCurrentUser();
                    if (freshUser) {
                        setExperiences(freshUser.experience || []);
                    }
                    toast.success('Experience deleted successfully!');
                }
            } catch (error) {
                console.error('Delete experience error:', error);
                toast.error(error?.response?.data?.message || 'Failed to delete experience');
            }
        }
    };

    const handleDeleteEducation = async (id) => {
        if (window.confirm('Are you sure you want to delete this education?')) {
            try {
                const response = await axiosInstance.delete(`/api/v1/users/education/${id}`);
                if (response.data.success) {
                    const freshUser = await fetchCurrentUser();
                    if (freshUser) {
                        setEducations(freshUser.education || []);
                    }
                    toast.success('Education deleted successfully!');
                }
            } catch (error) {
                console.error('Delete education error:', error);
                toast.error(error?.response?.data?.message || 'Failed to delete education');
            }
        }
    };

    const handleEditExperience = (experience) => {
        setEditingExperience(experience);
        setExperienceModalOpen(true);
    };

    const handleEditEducation = (education) => {
        setEditingEducation(education);
        setEducationModalOpen(true);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Append basic fields
            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            formData.append('phone', data.phoneNumber || '');
            formData.append('gender', data.gender || '');
            formData.append('tagline', data.tagline || '');
            formData.append('bio', data.bio || '');
            formData.append('country', data.country || '');

            // Append freelancer specific fields
            formData.append('freelancerType', data.freelancerType);
            formData.append('englishLevel', data.englishLevel);
            formData.append('hourlyRate', data.hourlyRate);

            // Append arrays as JSON strings
            formData.append('skills', JSON.stringify(selectedSkills));
            formData.append('categories', JSON.stringify(selectedCategories));
            formData.append('services', JSON.stringify(selectedServices));
            formData.append('languages', JSON.stringify(selectedLanguages));

            // Append image if changed
            if (imageFile) {
                formData.append('profileImage', imageFile);
            }

            const response = await axiosInstance.put('/api/v1/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const updatedUser = response.data.data;

                // Update user in context
                updateUserData(updatedUser);

                // Refresh form with updated data
                populateFormFields(updatedUser);

                toast.success('Profile updated successfully!');

                // Clear image file after successful upload
                if (imageFile) {
                    setImageFile(null);
                }
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error?.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <FreelancerSidebar />

            <div className="w-full relative">
                <FreelancerHeader />

                <FreelancerContainer>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mt-20 md:mt-0">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-200 px-6 py-8">
                            <div className="max-w-full mx-auto">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    {/* Profile Section */}
                                    <div className="flex items-start gap-5">
                                        <div className="relative">
                                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-1.5 shadow-sm">
                                                {profileImage ? (
                                                    <img
                                                        src={profileImage}
                                                        alt="Profile"
                                                        className="h-full w-full rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200">
                                                        <User size={32} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 bg-white border border-gray-300 hover:border-primary hover:bg-primary hover:text-white text-gray-600 p-2 rounded-lg shadow-md cursor-pointer transition-all duration-200">
                                                {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                                <input
                                                    id="profile-upload"
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                    disabled={uploadingImage}
                                                />
                                            </label>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-col items-start gap-3">
                                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center gap-1">
                                                    <Award size={12} />
                                                    Mentor
                                                </span>
                                                <h1 className="text-2xl font-bold text-gray-900">Mentor Profile Settings</h1>
                                            </div>
                                            <p className="text-gray-600">
                                                Complete your profile to increase your visibility and get more opportunities
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <button
                                            type="submit"
                                            form="profile-form"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
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
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="py-4 md:p-8">
                            <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
                                {/* Basic Information Section */}
                                <div className="bg-gray-50 px-6 mb-8 rounded-xl">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                        <User size={20} />
                                        Basic Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                {...register("firstName", { required: "First name is required" })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            {errors.firstName && (
                                                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                {...register("lastName", { required: "Last name is required" })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            {errors.lastName && (
                                                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                                            )}
                                        </div>

                                        {/* Email Field - Disabled */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="email"
                                                    {...register("email")}
                                                    disabled
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="tel"
                                                    {...register("phoneNumber")}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        {/* Gender Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gender
                                            </label>
                                            <select
                                                {...register("gender")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent capitalize"
                                            >
                                                <option value="">Select Gender</option>
                                                {genderOptions.map(option => (
                                                    <option key={option.value} value={option.value} className="capitalize">
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Tagline
                                            </label>
                                            <input
                                                type="text"
                                                {...register("tagline")}
                                                placeholder="Add your professional tagline"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>

                                        {/* Bio - Textarea */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                {...register("bio")}
                                                rows={4}
                                                placeholder="Tell us about yourself..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Details Section */}
                                <div className="bg-gray-50 px-6 mb-8 rounded-xl">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                        <Briefcase size={20} />
                                        Professional Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Country
                                            </label>
                                            <select
                                                {...register("country")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select Country</option>
                                                {countriesList.map(country => (
                                                    <option key={country} value={country}>{country}</option>
                                                ))}
                                            </select>
                                        </div> */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Freelancer Type
                                            </label>
                                            <select
                                                {...register("freelancerType")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select Mentor Type</option>
                                                {freelancerTypes.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                English Level
                                            </label>
                                            <select
                                                {...register("englishLevel")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select English Level</option>
                                                {englishLevels.map(level => (
                                                    <option key={level.value} value={level.value}>{level.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hourly Rate ($)
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="number"
                                                    {...register("hourlyRate", { min: 0 })}
                                                    placeholder="Enter hourly rate"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                        </div> */}
                                    </div>

                                    {/* Categories */}
                                    <div className="mt-6">
                                        <Controller
                                            name="categories"
                                            control={control}
                                            render={({ field }) => (
                                                <CategoriesSelect
                                                    selectedCategories={selectedCategories}
                                                    onChange={(categories) => {
                                                        setSelectedCategories(categories);
                                                        field.onChange(categories);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Skills */}
                                    <div className="mt-6">
                                        <Controller
                                            name="skills"
                                            control={control}
                                            render={({ field }) => (
                                                <SkillsSelect
                                                    selectedSkills={selectedSkills}
                                                    onChange={(skills) => {
                                                        setSelectedSkills(skills);
                                                        field.onChange(skills);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Services */}
                                    <div className="mt-6">
                                        <Controller
                                            name="services"
                                            control={control}
                                            render={({ field }) => (
                                                <ServiceSelect
                                                    selectedServices={selectedServices}
                                                    onChange={(services) => {
                                                        setSelectedServices(services);
                                                        field.onChange(services);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Languages */}
                                    <div className="mt-6">
                                        <Controller
                                            name="languages"
                                            control={control}
                                            render={({ field }) => (
                                                <LanguagesSelect
                                                    selectedLanguages={selectedLanguages}
                                                    onChange={(languages) => {
                                                        setSelectedLanguages(languages);
                                                        field.onChange(languages);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-center justify-end mt-5 gap-3">
                                        <button
                                            type="submit"
                                            form="profile-form"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
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

                                {/* Experience Section */}
                                <div className="bg-gray-50 px-6 mb-8 rounded-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                            <Briefcase size={20} />
                                            Experience Details
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingExperience(null);
                                                setExperienceModalOpen(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                        >
                                            <Plus size={18} />
                                            Add New
                                        </button>
                                    </div>

                                    {experiences.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No experience added yet</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {experiences.map((exp) => (
                                                <div key={exp._id} className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{exp.jobTitle}</h3>
                                                            <p className="text-gray-600">{exp.companyName} {exp.location && `• ${exp.location}`}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ''}
                                                            </p>
                                                            {exp.description && (
                                                                <p className="mt-2 text-gray-600 text-sm">{exp.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditExperience(exp)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteExperience(exp._id)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Education Section */}
                                <div className="bg-gray-50 px-6 mb-8 rounded-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                            <GraduationCap size={20} />
                                            Educational Details
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingEducation(null);
                                                setEducationModalOpen(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                        >
                                            <Plus size={18} />
                                            Add New
                                        </button>
                                    </div>

                                    {educations.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No education added yet</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {educations.map((edu) => (
                                                <div key={edu._id} className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{edu.degreeTitle}</h3>
                                                            <p className="text-gray-600">{edu.instituteName}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {new Date(edu.startDate).toLocaleDateString()} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ''}
                                                            </p>
                                                            {edu.description && (
                                                                <p className="mt-2 text-gray-600 text-sm">{edu.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditEducation(edu)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteEducation(edu._id)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </FreelancerContainer>
            </div>

            {/* Modals */}
            <ExperienceModal
                isOpen={experienceModalOpen}
                onClose={() => {
                    setExperienceModalOpen(false);
                    setEditingExperience(null);
                }}
                onSave={handleExperienceSave}
                initialData={editingExperience}
            />

            <EducationModal
                isOpen={educationModalOpen}
                onClose={() => {
                    setEducationModalOpen(false);
                    setEditingEducation(null);
                }}
                onSave={handleEducationSave}
                initialData={editingEducation}
            />
        </section>
    );
}

export default Profile;