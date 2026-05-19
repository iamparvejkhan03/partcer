import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText,
    DollarSign,
    Paperclip,
    ArrowLeft,
    ArrowRight,
    X,
    Clock,
    Calendar,
    Globe,
    Upload,
    CheckCircle,
    Wrench,
    ChevronDown,
    Check,
    Search,
    AlertCircle,
    Loader
} from "lucide-react";
import { RTE, BuyerSidebar, BuyerHeader, BuyerContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import useCountryStates from '../../hooks/useCountryStates';

// Skills Multi-select Component (reused from CreateProject)
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
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingSkills, setLoadingSkills] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [removedAttachments, setRemovedAttachments] = useState([]);
    const [projectType, setProjectType] = useState('fixed');
    const [experienceLevel, setExperienceLevel] = useState('entry');
    const [duration, setDuration] = useState('1-3 months');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subCategories, setSubCategories] = useState([]);
    const [pendingSubCategory, setPendingSubCategory] = useState('');

    // Countries API
    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');

    const { projectId } = useParams(); // Changed from projectSlug to match route param
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
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
            hourlyRate: '',
            estimatedHours: '',
            location: '',
            requirements: '',
            additionalInfo: '',
            duration: '1-3 months',
            experienceLevel: 'entry',
            projectType: 'fixed'
        }
    });

    // Fetch countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                const data = await countriesAPI();
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

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch skills when component mounts
    useEffect(() => {
        fetchSkills();
    }, []);

    // Fetch skills when category changes
    useEffect(() => {
        if (selectedCategory) {
            fetchSkillsByCategory(selectedCategory);
        }
    }, [selectedCategory]);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (selectedCategory) {
            fetchSubCategories(selectedCategory);
        }
    }, [selectedCategory]);

    // Fetch project data
    useEffect(() => {
        if (projectId) {
            fetchProjectData();
        }
    }, [projectId]);

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

    const fetchSkills = async () => {
        try {
            setLoadingSkills(true);
            const response = await axiosInstance.get('/api/v1/skills/public');

            if (response.data.success) {
                setSkills(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching skills:', err);
            toast.error('Failed to load skills');
            setSkills([]);
        } finally {
            setLoadingSkills(false);
        }
    };

    const fetchSkillsByCategory = async (categoryId) => {
        try {
            setLoadingSkills(true);
            const response = await axiosInstance.get(`/api/v1/skills/public/by-category/${categoryId}`);

            if (response.data.success) {
                setSkills(response.data.data?.skills || []);
            }
        } catch (err) {
            console.error('Error fetching skills by category:', err);
            fetchSkills();
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
            setIsLoading(true);
            // Use the correct endpoint from your routes
            const response = await axiosInstance.get(`/api/v1/projects/${projectId}`);

            if (response.data.success) {
                const project = response.data.data.project;

                // Set form values
                reset({
                    title: project.title || '',
                    category: project.category?._id || '',
                    subCategory: project.subCategory?._id || '',
                    description: project.description || '',
                    budget: project.budget || '',
                    hourlyRate: project.hourlyRate || '',
                    estimatedHours: project.estimatedHours || '',
                    location: project.location || 'remote',
                    requirements: project.requirements || '',
                    additionalInfo: project.additionalInfo || '',
                    duration: project.duration || '1-3 months',
                    experienceLevel: project.experienceLevel || 'entry',
                    projectType: project.projectType || 'fixed'
                });

                // Set category for subcategory loading
                if (project.category?._id) {
                    setSelectedCategory(project.category._id);
                }
                setPendingSubCategory(project.subCategory?._id || project.subCategory || '');

                // Set project type
                setProjectType(project.projectType || 'fixed');

                // Set experience level
                setExperienceLevel(project.experienceLevel || 'entry');

                // Set duration
                setDuration(project.duration || '1-3 months');

                // Set location
                setSelectedCountry(project.location || '');

                // Set skills (using skill IDs)
                setSelectedSkills(project.skills || []);

                // Set existing attachments
                if (project.attachments && project.attachments.length > 0) {
                    setExistingAttachments(project.attachments);
                }
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            toast.error('Failed to load project data');
            navigate('/buyer/projects/all');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (pendingSubCategory && subCategories.length > 0) {
            setValue('subCategory', pendingSubCategory);
            setPendingSubCategory(''); // Clear after setting
        }
    }, [subCategories, pendingSubCategory, setValue]);

    const nextStep = async () => {
        let isValid = true;

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        if (step === 1) {
            const fieldsToValidate = ['title', 'category', 'description'];
            isValid = await trigger(fieldsToValidate);

            if (!selectedCategory) {
                toast.error('Please select a category');
                isValid = false;
            }

            if (selectedSkills.length === 0) {
                toast.error('Please select at least one skill required for your project');
                isValid = false;
            }

            const title = getValues('title');
            if (title && title.length < 10) {
                toast.error('Title must be at least 10 characters');
                isValid = false;
            }
        }

        if (step === 2) {
            if (projectType === 'fixed') {
                const fieldsToValidate = ['budget'];
                isValid = await trigger(fieldsToValidate);

                const budget = parseFloat(getValues('budget'));
                if (budget < 10) {
                    toast.error('Minimum budget should be at least $10');
                    isValid = false;
                }
            } else {
                const fieldsToValidate = ['hourlyRate', 'estimatedHours'];
                isValid = await trigger(fieldsToValidate);

                const hourlyRate = parseFloat(getValues('hourlyRate'));
                if (hourlyRate < 5) {
                    toast.error('Minimum hourly rate should be at least $5');
                    isValid = false;
                }
            }
        }

        if (!isValid) return;

        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
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
        }
        setExistingAttachments(existingAttachments.filter((_, i) => i !== index));
    };

    const removeNewAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const updateProjectHandler = async (formData) => {
        try {
            setIsSubmitting(true);

            // Prepare data matching your controller's expected structure
            const projectData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                subCategory: formData.subCategory || undefined,
                skills: selectedSkills,
                experienceLevel: experienceLevel,
                location: formData.location || 'remote',
                projectType: projectType,
                budget: projectType === 'fixed' ? Number(formData.budget) : null,
                hourlyRate: projectType === 'hourly' ? Number(formData.hourlyRate) : null,
                estimatedHours: projectType === 'hourly' ? Number(formData.estimatedHours) : null,
                duration: duration,
                additionalInfo: formData.additionalInfo || '',
                requirements: formData.requirements || '',
                removedAttachments: removedAttachments
            };

            // Create FormData for file uploads
            const formDataObj = new FormData();
            formDataObj.append('data', JSON.stringify(projectData));

            // Append new attachments
            attachments.forEach((file) => {
                formDataObj.append('projectAttachments', file);
            });

            // Use the correct endpoint from your routes (using slug)
            const response = await axiosInstance.put(`/api/v1/projects/${projectId}`, formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                toast.success('Project updated successfully!');
                navigate('/buyer/projects/all');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to update project';
            toast.error(errorMessage);
            console.error('Update project error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { number: 1, label: 'Project Details', icon: FileText },
        { number: 2, label: 'Budget & Timeline', icon: DollarSign },
        { number: 3, label: 'Requirements', icon: Paperclip }
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
        { value: 'entry', label: 'Entry Level', description: 'Budget friendly, less experience' },
        { value: 'intermediate', label: 'Intermediate', description: 'Good balance of cost and skill' },
        { value: 'expert', label: 'Expert', description: 'Higher cost, top-tier professionals' }
    ];

    if (isLoading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <BuyerSidebar />
                <div className="w-full relative">
                    <BuyerHeader />
                    <BuyerContainer>
                        <div className="flex flex-col justify-center items-center h-64">
                            <Loader className="animate-spin h-12 w-12 text-primary mb-4" />
                            <p className="text-gray-600">Loading project details...</p>
                        </div>
                    </BuyerContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <BuyerSidebar />
            <div className="w-full relative">
                <BuyerHeader />
                <BuyerContainer>
                    {/* Header */}
                    <div className="mb-8 mt-20 md:mt-0">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Edit Project
                        </h1>
                        <p className="text-gray-600">
                            Update your project details and requirements
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            {steps.map((stepItem) => (
                                <div key={stepItem.number} className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 
                                        ${step >= stepItem.number ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
                                        {step > stepItem.number ? (
                                            <CheckCircle size={20} />
                                        ) : (
                                            <stepItem.icon size={20} />
                                        )}
                                    </div>
                                    <span className={`text-sm mt-2 font-medium ${step >= stepItem.number ? 'text-primary' : 'text-gray-500'}`}>
                                        {stepItem.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Progress Line */}
                        <div className="relative">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
                            <div
                                className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
                                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(updateProjectHandler)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">

                        {/* Step 1: Project Details */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <FileText className="mr-2" size={24} />
                                        Project Details
                                    </h2>

                                    {/* Project Title */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Title *
                                        </label>
                                        <input
                                            {...register('title', {
                                                required: 'Project title is required',
                                                minLength: { value: 10, message: 'Title must be at least 10 characters' },
                                                maxLength: { value: 150, message: 'Title must be less than 150 characters' }
                                            })}
                                            type="text"
                                            placeholder="e.g., Need a professional e-commerce website with payment integration"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Be specific and clear about what you need
                                        </p>
                                    </div>

                                    {/* Category & Subcategory */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={loadingCategories}
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map((category) => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.category && (
                                                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                                            )}
                                        </div>

                                        {/* Subcategory */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subcategory (Optional)
                                            </label>
                                            <select
                                                {...register('subCategory')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={!selectedCategory || subCategories.length === 0}
                                            >
                                                <option value="">Select a subcategory</option>
                                                {subCategories.map((subCategory) => (
                                                    <option key={subCategory._id} value={subCategory._id}>
                                                        {subCategory.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Project Description */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project Description *
                                        </label>
                                        <RTE
                                            name="description"
                                            control={control}
                                            label="Description:"
                                            defaultValue={getValues('description') || ''}
                                            placeholder="Describe your project in detail. What are you trying to achieve? What are the key deliverables? Do you have any specific requirements?"
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                        )}
                                    </div>

                                    {/* Skills Required */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Skills Required * (Max 15)
                                        </label>

                                        <SkillsSelect
                                            selectedSkills={selectedSkills}
                                            onChange={setSelectedSkills}
                                            skillsList={skills}
                                        />

                                        {selectedSkills.length === 0 && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Select skills that match your project requirements
                                            </p>
                                        )}
                                    </div>

                                    {/* Experience Level */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Preferred Mentor Experience Level *
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {experienceOptions.map((option) => (
                                                <label
                                                    key={option.value}
                                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${experienceLevel === option.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="experienceLevel"
                                                        value={option.value}
                                                        checked={experienceLevel === option.value}
                                                        onChange={(e) => setExperienceLevel(e.target.value)}
                                                        className="hidden"
                                                    />
                                                    <div className="flex items-start gap-2">
                                                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${experienceLevel === option.value
                                                            ? 'border-primary bg-primary'
                                                            : 'border-gray-300'
                                                            }`}>
                                                            {experienceLevel === option.value && (
                                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{option.label}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location Preference */}
                                    {/* <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred Mentor Location
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <select
                                                {...register('location')}
                                                value={selectedCountry}
                                                onChange={(e) => setSelectedCountry(e.target.value)}
                                                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={loadingCountries}
                                            >
                                                <option value="">Anywhere (Worldwide)</option>
                                                <optgroup label="Popular Locations">
                                                    <option value="remote">🌍 Remote (Worldwide)</option>
                                                    <option value="United States">🇺🇸 United States</option>
                                                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                                                    <option value="Canada">🇨🇦 Canada</option>
                                                    <option value="Australia">🇦🇺 Australia</option>
                                                    <option value="India">🇮🇳 India</option>
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
                                        <p className="text-xs text-gray-500 mt-1">
                                            Leave empty if you're open to mentors from anywhere
                                        </p>
                                    </div> */}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Budget & Timeline */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <DollarSign className="mr-2" size={24} />
                                        Budget & Timeline
                                    </h2>

                                    {/* Project Type */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            How do you want to pay? *
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label
                                                className={`border rounded-lg p-4 cursor-pointer transition-all ${projectType === 'fixed'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="projectType"
                                                    value="fixed"
                                                    checked={projectType === 'fixed'}
                                                    onChange={(e) => setProjectType(e.target.value)}
                                                    className="hidden"
                                                />
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${projectType === 'fixed'
                                                        ? 'border-primary bg-primary'
                                                        : 'border-gray-300'
                                                        }`}>
                                                        {projectType === 'fixed' && (
                                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Fixed Price</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Pay a fixed amount for the entire project
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>

                                            <label
                                                className={`border rounded-lg p-4 cursor-pointer transition-all ${projectType === 'hourly'
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="projectType"
                                                    value="hourly"
                                                    checked={projectType === 'hourly'}
                                                    onChange={(e) => setProjectType(e.target.value)}
                                                    className="hidden"
                                                />
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${projectType === 'hourly'
                                                        ? 'border-primary bg-primary'
                                                        : 'border-gray-300'
                                                        }`}>
                                                        {projectType === 'hourly' && (
                                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Hourly Rate</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Pay based on hours worked
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Fixed Price Budget */}
                                    {projectType === 'fixed' && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Your Budget ($) *
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="number"
                                                    {...register('budget', {
                                                        required: 'Budget is required',
                                                        min: { value: 10, message: 'Minimum budget is $10' }
                                                    })}
                                                    placeholder="e.g., 500"
                                                    min="10"
                                                    step="10"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                            {errors.budget && (
                                                <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Set a realistic budget to attract quality mentors
                                            </p>
                                        </div>
                                    )}

                                    {/* Hourly Rate */}
                                    {projectType === 'hourly' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Hourly Rate ($) *
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="number"
                                                        {...register('hourlyRate', {
                                                            required: 'Hourly rate is required',
                                                            min: { value: 5, message: 'Minimum hourly rate is $5' }
                                                        })}
                                                        placeholder="e.g., 25"
                                                        min="5"
                                                        step="5"
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>
                                                {errors.hourlyRate && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.hourlyRate.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Estimated Hours *
                                                </label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="number"
                                                        {...register('estimatedHours', {
                                                            required: 'Estimated hours is required',
                                                            min: { value: 1, message: 'Minimum 1 hour' }
                                                        })}
                                                        placeholder="e.g., 40"
                                                        min="1"
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>
                                                {errors.estimatedHours && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.estimatedHours.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Project Duration */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Expected Project Duration *
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                {...register('duration', { required: 'Duration is required' })}
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                {durationOptions.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.duration && (
                                            <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                                        )}
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Additional Information (Optional)
                                        </label>
                                        <textarea
                                            {...register('additionalInfo')}
                                            rows={4}
                                            placeholder="Any other details about budget, payment schedule, or timeline?"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Requirements & Attachments */}
                        {step === 3 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <Paperclip className="mr-2" size={24} />
                                        Requirements & Attachments
                                    </h2>

                                    {/* Specific Requirements */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Specific Requirements
                                        </label>
                                        <textarea
                                            {...register('requirements')}
                                            rows={5}
                                            placeholder="List any specific requirements, technical specifications, or expectations you have for this project..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Be specific about what you need - this helps mentors understand your project better
                                        </p>
                                    </div>

                                    {/* Attachments */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-4">
                                            Attachments (Max 5 files, 10MB each)
                                        </label>

                                        {/* Existing Attachments */}
                                        {existingAttachments.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Files:</h4>
                                                <div className="space-y-2">
                                                    {existingAttachments.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <Paperclip size={16} className="text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExistingAttachment(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* New Attachments Upload */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleAttachmentUpload}
                                                className="hidden"
                                                id="attachments-upload"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                                            />
                                            <label htmlFor="attachments-upload" className="cursor-pointer flex flex-col items-center">
                                                <Upload size={48} className="text-gray-400 mb-3" />
                                                <p className="text-gray-600 mb-2">
                                                    Drag & drop files or click to browse
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Upload briefs, design files, documents, or any reference materials
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP • Max 10MB each
                                                </p>
                                            </label>
                                        </div>

                                        {/* New Attachments Preview */}
                                        {attachments.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">New Files to Upload:</h4>
                                                <div className="space-y-2">
                                                    {attachments.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <Paperclip size={16} className="text-blue-400" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
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
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Status Info */}
                                    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-blue-800 mb-1">Project Visibility</h4>
                                                <p className="text-sm text-blue-700">
                                                    Your project will remain in its current status after update.
                                                    {getValues('status') === 'draft' && ' You can publish it from the projects list page.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Terms Checkbox */}
                                    <div className="mb-6">
                                        <label className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                required
                                                className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            <span className="text-sm text-gray-600">
                                                I confirm that the updated information is accurate and complies with the platform's terms of service.
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between pt-8 border-t border-gray-200 gap-4">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium order-2 sm:order-1"
                                >
                                    <ArrowLeft size={18} />
                                    Previous
                                </button>
                            ) : (
                                <div className="order-2 sm:order-1"></div>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium order-1 sm:order-2"
                                >
                                    Continue
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/buyer/projects/all')}
                                        className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                                Updating...
                                            </span>
                                        ) : (
                                            'Update Project'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Tips Section */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                            <AlertCircle size={18} />
                            Tips for Updating Your Project
                        </h3>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                            <li>Review your project details carefully before updating</li>
                            <li>Adding more details can attract better qualified mentors</li>
                            <li>Update your budget if the project scope has changed</li>
                            <li>Adding new attachments provides more context for mentors</li>
                            <li>Your project will maintain its current status after update</li>
                        </ul>
                    </div>
                </BuyerContainer>
            </div>
        </section>
    );
};

export default EditProject;