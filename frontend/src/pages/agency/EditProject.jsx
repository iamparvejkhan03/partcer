import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
    FileText,
    Wrench,
    ArrowLeft,
    X,
    ChevronDown,
    Check,
    Search,
    Briefcase,
    Calendar,
    Clock,
    AlertCircle,
    Save,
    Trash2,
    Loader2,
    Plus
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { AgencySidebar, AgencyHeader, AgencyContainer, RTE } from "../../components";

// Period options
const PERIODS = [
    // { id: "one_time", label: "One-time", icon: Calendar, description: "Single session" },
    { id: "per_day", label: "Per day", icon: Clock, description: "Daily sessions" },
    { id: "weekly", label: "Weekly", icon: Briefcase, description: "Weekly commitment" },
    { id: "monthly", label: "Monthly", icon: Calendar, description: "Monthly commitment" },
];

// Duration options (dynamic based on period)
const DURATION_OPTIONS = {
    // one_time: [{ id: "standard", label: "Single session", description: "One-time session" }],
    per_day: [
        { id: "standard", label: "Standard", description: "2-3 hours per day" },
        { id: "full_day", label: "Full day", description: "6-8 hours per day" },
    ],
    weekly: [
        { id: "standard", label: "Standard", description: "2-3 hours/day · min 5 sessions" },
        { id: "full_day", label: "Full day", description: "6-8 hours/day · min 5 sessions" },
    ],
    monthly: [
        { id: "standard", label: "Standard", description: "2-3 hours/day · min 21 sessions" },
        { id: "full_day", label: "Full day", description: "6-8 hours/day · min 21 sessions" },
    ],
};

// Service options
const SERVICES = [
    { id: "Job Support (Mentoring)", label: "Job Support (Mentoring)" },
    { id: "Skill Training", label: "Skill Training" },
    { id: "Mock Interview Support", label: "Mock Interview Support" },
];

// Skills Multi-select Component
const SkillsSelect = ({ selectedSkills, onChange, skillsList, isLoading, onAddSkill }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [isAddingSkill, setIsAddingSkill] = useState(false);
    const dropdownRef = useRef(null);

    // Check if search term exists in skills list (case insensitive)
    const isSkillInList = skillsList.some(
        (skill) => skill.name.toLowerCase() === search.toLowerCase()
    );

    const filteredSkills = skillsList.filter(
        (skill) =>
            skill.name.toLowerCase().includes(search.toLowerCase()) &&
            !selectedSkills.includes(skill.name)
    );

    const toggleSkill = (skillName) => {
        if (selectedSkills.includes(skillName)) {
            onChange(selectedSkills.filter((name) => name !== skillName));
        } else {
            if (selectedSkills.length >= 10) {
                toast.error("Maximum 10 skills allowed");
                return;
            }
            onChange([...selectedSkills, skillName]);
        }
    };

    const handleAddNewSkill = async () => {
        const trimmedSkill = search.trim();

        // Validate skill name
        if (!trimmedSkill) {
            toast.error("Please enter a skill name");
            return;
        }

        if (trimmedSkill.length < 2) {
            toast.error("Skill name must be at least 2 characters");
            return;
        }

        if (selectedSkills.length >= 10) {
            toast.error("Maximum 10 skills allowed");
            return;
        }

        // Check if skill already exists in the list (case insensitive)
        if (isSkillInList) {
            toast.error("This skill already exists in the list");
            return;
        }

        // Check if already selected
        if (selectedSkills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase())) {
            toast.error("This skill is already selected");
            return;
        }

        try {
            setIsAddingSkill(true);
            // Call the parent function to add the skill
            if (onAddSkill) {
                await onAddSkill(trimmedSkill);
                // Add the skill to selected skills
                onChange([...selectedSkills, trimmedSkill]);
                // Clear search and close dropdown
                setSearch("");
                setIsOpen(false);
                toast.success(`"${trimmedSkill}" added successfully`);
            }
        } catch (error) {
            console.error('Error adding skill:', error);
            toast.error(error?.response?.data?.message || 'Failed to add skill');
        } finally {
            setIsAddingSkill(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map((skillName) => (
                        <div
                            key={skillName}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                        >
                            <Wrench size={14} />
                            {skillName}
                            <button
                                type="button"
                                onClick={() => toggleSkill(skillName)}
                                className="ml-1 hover:text-red-500"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent flex justify-between items-center hover:border-gray-400 transition-colors"
            >
                <span className={selectedSkills.length > 0 ? "text-gray-900" : "text-gray-500"}>
                    {selectedSkills.length > 0
                        ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""} selected`
                        : isLoading ? "Loading skills..." : "Select skills required for this project"}
                </span>
                <ChevronDown size={16} className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && !isLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b sticky top-0 bg-white">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search or type new skill..."
                                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && search.trim() && !isSkillInList) {
                                        e.preventDefault();
                                        handleAddNewSkill();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="py-1">
                        {/* Add new skill option */}
                        {search.trim() && !isSkillInList && selectedSkills.length < 10 && (
                            <button
                                type="button"
                                onClick={handleAddNewSkill}
                                disabled={isAddingSkill}
                                className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center justify-between border-b border-dashed border-gray-200"
                            >
                                <div className="flex items-center">
                                    <Plus size={16} className="text-green-600 mr-2" />
                                    <span className="text-gray-700">
                                        Add new skill: <strong>"{search.trim()}"</strong>
                                    </span>
                                </div>
                                {isAddingSkill ? (
                                    <span className="text-sm text-gray-500">Adding...</span>
                                ) : (
                                    <span className="text-xs text-green-600">Press Enter or click to add</span>
                                )}
                            </button>
                        )}

                        {search.trim() && isSkillInList && (
                            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                                Skill already exists in the list
                            </div>
                        )}

                        {filteredSkills.length > 0 ? (
                            filteredSkills.map((skill) => (
                                <button
                                    type="button"
                                    key={skill._id}
                                    onClick={() => toggleSkill(skill.name)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                                >
                                    <span>{skill.name}</span>
                                    {selectedSkills.includes(skill.name) && <Check size={16} className="text-primary" />}
                                </button>
                            ))
                        ) : (
                            !search.trim() && (
                                <div className="px-4 py-2 text-sm text-gray-500">Type to search or add new skills</div>
                            )
                        )}

                        {selectedSkills.length >= 10 && search.trim() && !isSkillInList && (
                            <div className="px-4 py-2 text-red-500 text-sm text-center border-t border-red-100">
                                Maximum 10 skills reached
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Custom Dropdown Component
const Dropdown = ({ label, value, options, onChange, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} *
            </label>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg bg-white flex justify-between items-center transition-colors ${!disabled ? "hover:border-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent" : "bg-gray-50 cursor-not-allowed"
                    }`}
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
                            onClick={() => {
                                onChange(option.id);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between transition-colors ${value === option.id ? "bg-primary/5 text-primary" : ""
                                }`}
                        >
                            <div>
                                <div className="font-medium text-sm">{option.label}</div>
                                {option.description && (
                                    <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                                )}
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
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [loadingSkills, setLoadingSkills] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [subCategories, setSubCategories] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState("weekly");
    const [selectedDuration, setSelectedDuration] = useState("standard");
    const [selectedService, setSelectedService] = useState("Skill Training");
    const [projectData, setProjectData] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            title: "",
            category: "",
            subCategory: "",
            description: "",
        },
    });

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
        fetchSkills();
    }, []);

    // Fetch project data
    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
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
            const response = await axiosInstance.get("/api/v1/categories/public/parents");
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            toast.error("Failed to load categories");
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchSkills = async () => {
        try {
            setLoadingSkills(true);
            const response = await axiosInstance.get("/api/v1/skills/public");
            if (response.data.success) {
                setSkills(response.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching skills:", err);
            toast.error("Failed to load skills");
        } finally {
            setLoadingSkills(false);
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
            console.error("Error fetching subcategories:", err);
            setSubCategories([]);
        }
    };

    const fetchProject = async () => {
        try {
            setIsFetching(true);
            const response = await axiosInstance.get(`/api/v1/projects/${projectId}`);

            if (response.data.success) {
                const project = response.data.data;
                setProjectData(project);

                // Set form values
                setValue("title", project.title);
                setValue("description", project.description);

                // Set category
                if (project.category?._id) {
                    setSelectedCategory(project.category._id);
                    setValue("category", project.category._id);
                } else if (typeof project.category === 'string') {
                    setSelectedCategory(project.category);
                    setValue("category", project.category);
                }

                // Set subcategory
                if (project.subCategory) {
                    const subCatId = typeof project.subCategory === 'object' ? project.subCategory._id : project.subCategory;
                    setValue("subCategory", subCatId);
                }

                // Set skills
                setSelectedSkills(project.skills || []);

                // Set period, duration, service
                setSelectedPeriod(project.period || "weekly");
                setSelectedDuration(project.duration || "standard");
                setSelectedService(project.service || "Skill Training");
            }
        } catch (error) {
            console.error("Error fetching project:", error);
            toast.error(error?.response?.data?.message || "Failed to load project");
            navigate("/agency/projects/all");
        } finally {
            setIsFetching(false);
        }
    };

    // Add this useEffect to set subcategory after category and subcategories are ready
    useEffect(() => {
        const setSubCategoryValue = async () => {
            if (selectedCategory && projectData?.subCategory) {
                // Fetch subcategories if not already loaded
                if (subCategories.length === 0) {
                    await fetchSubCategories(selectedCategory);
                }
                // Set the subcategory value
                const subCategoryId = typeof projectData.subCategory === 'object'
                    ? projectData.subCategory?._id
                    : projectData.subCategory;
                if (subCategoryId) {
                    setValue("subCategory", subCategoryId);
                }
            }
        };

        setSubCategoryValue();
    }, [selectedCategory, projectData]); // Run when category or projectData changes

    const updateProjectHandler = async (formData) => {
        // Validation
        if (selectedSkills.length === 0) {
            toast.error("Please select at least one skill");
            return;
        }

        if (!selectedPeriod) {
            toast.error("Please select a period");
            return;
        }

        if (!selectedDuration) {
            toast.error("Please select a duration");
            return;
        }

        if (!selectedService) {
            toast.error("Please select a service");
            return;
        }

        setIsLoading(true);

        try {
            const updateData = {
                title: formData.title,
                category: formData.category,
                subCategory: formData.subCategory || undefined,
                description: formData.description,
                period: selectedPeriod,
                duration: selectedDuration,
                service: selectedService,
                skills: selectedSkills,
            };

            const response = await axiosInstance.put(`/api/v1/projects/${projectId}`, updateData);

            if (response.data.success) {
                toast.success("Project updated successfully!");
                navigate("/agency/projects/all");
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Failed to update project";
            toast.error(errorMessage);
            console.error("Update project error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        setIsDeleting(true);
        try {
            const response = await axiosInstance.delete(`/api/v1/projects/${projectId}`);
            if (response.data.success) {
                toast.success("Project deleted successfully");
                navigate("/agency/projects/all");
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Failed to delete project";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (isFetching) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AgencySidebar />
                <div className="w-full relative">
                    <AgencyHeader />
                    <AgencyContainer>
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <div className="text-center">
                                <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                                <p className="text-gray-500">Loading project...</p>
                            </div>
                        </div>
                    </AgencyContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AgencySidebar />
            <div className="w-full relative">
                <AgencyHeader />
                <AgencyContainer>
                    {/* Header */}
                    <div className="mb-8 mt-20 md:mt-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <button
                                    onClick={() => navigate("/agency/projects/all")}
                                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                    Back to Projects
                                </button>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    Edit Project
                                </h1>
                                <p className="text-gray-600">
                                    Update your project details to attract the right mentors
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                                Delete Project
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(updateProjectHandler)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                        {/* Project Title */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Title *
                            </label>
                            <input
                                {...register("title", {
                                    required: "Project title is required",
                                    minLength: { value: 10, message: "Title must be at least 10 characters" },
                                    maxLength: { value: 150, message: "Title must be less than 150 characters" },
                                })}
                                type="text"
                                placeholder="e.g., Build a real-time data pipeline using Apache Kafka"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Be specific and clear about what you need help with
                            </p>
                        </div>

                        {/* Category & Subcategory */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    {...register("category", { required: "Category is required" })}
                                    onChange={(e) => {
                                        const categoryId = e.target.value;
                                        setSelectedCategory(categoryId);
                                        setValue("category", categoryId);
                                        setValue("subCategory", "");
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subcategory (Optional)
                                </label>
                                <select
                                    {...register("subCategory")}
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
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Description *
                            </label>
                            <textarea
                                {...register("description", {
                                    required: "Description is required",
                                    minLength: { value: 50, message: "Description must be at least 50 characters" },
                                })}
                                rows={6}
                                placeholder="Describe your project in detail. What are you trying to achieve? What kind of help do you need?"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Provide as much detail as possible to attract the right mentors
                            </p>
                        </div>

                        {/* Period, Duration, Service - Dropdowns in a row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Period Dropdown */}
                            <Dropdown
                                label="Period"
                                value={selectedPeriod}
                                options={PERIODS}
                                onChange={(value) => {
                                    setSelectedPeriod(value);
                                    // Reset duration to the first option of the new period
                                    const firstDuration = DURATION_OPTIONS[value][0].id;
                                    setSelectedDuration(firstDuration);
                                }}
                            />

                            {/* Duration Dropdown */}
                            <Dropdown
                                label="Duration"
                                value={selectedDuration}
                                options={DURATION_OPTIONS[selectedPeriod] || []}
                                onChange={setSelectedDuration}
                            />

                            {/* Service Dropdown */}
                            <Dropdown
                                label="Service"
                                value={selectedService}
                                options={SERVICES}
                                onChange={setSelectedService}
                            />
                        </div>

                        {/* Skills Required */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Skills Required *
                            </label>
                            <SkillsSelect
                                selectedSkills={selectedSkills}
                                onChange={setSelectedSkills}
                                skillsList={skills}
                                isLoading={loadingSkills}
                                onAddSkill={async (skillName) => {
                                    // API call to add skill to database
                                    const response = await axiosInstance.post('/api/v1/skills', {
                                        name: skillName,
                                        isActive: true
                                    });
                                    if (response.data?.success) {
                                        // Optionally refresh the skills list
                                        // You can fetch the updated list or just add it to the existing list
                                        setSkills(prev => [...prev, { _id: response.data.data._id, name: skillName }]);
                                        return response.data.data;
                                    }
                                    throw new Error('Failed to add skill');
                                }}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Select skills that match your project requirements (max 10)
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate("/agency/projects/all")}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Tips Section */}
                    {/* <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100">
                        <h3 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                            <AlertCircle size={18} />
                            Tips for Getting Great Mentors
                        </h3>
                        <ul className="text-sm text-blue-700 space-y-1.5 list-disc pl-5">
                            <li>Be detailed about your project requirements and goals</li>
                            <li>Select the most relevant skills to attract the right mentors</li>
                            <li>Choose realistic period and duration for your project</li>
                            <li>Specify your learning objectives clearly in the description</li>
                            <li>Update your project regularly to keep it active</li>
                        </ul>
                    </div> */}
                </AgencyContainer>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Project</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this project? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProject}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Project"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default EditProject;