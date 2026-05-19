import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
    FileText,
    Tag,
    Wrench,
    ArrowLeft,
    ArrowRight,
    X,
    ChevronDown,
    Check,
    Search,
    Briefcase,
    Calendar,
    Clock,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { BuyerSidebar, BuyerHeader, BuyerContainer } from "../../components";

// Period options
const PERIODS = [
    { id: "one_time", label: "One-time", icon: Calendar, description: "Single session" },
    { id: "per_day", label: "Per day", icon: Clock, description: "Daily sessions" },
    { id: "weekly", label: "Weekly", icon: Briefcase, description: "Weekly commitment" },
    { id: "monthly", label: "Monthly", icon: Calendar, description: "Monthly commitment" },
];

// Duration options (dynamic based on period)
const DURATION_OPTIONS = {
    one_time: [{ id: "standard", label: "Single session", description: "One-time session" }],
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
    { id: "Job Support (Mentoring)", label: "Job Support (Mentoring)", description: "Get hands-on support for your job tasks" },
    { id: "Skill Training", label: "Skill Training", description: "Learn new skills from industry experts" },
    { id: "Mock Interview Support", label: "Mock Interview Support", description: "Prepare for job interviews" },
];

// Skills Multi-select Component
const SkillsSelect = ({ selectedSkills, onChange, skillsList, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

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
            {/* Selected skills chips */}
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

            {/* Dropdown trigger */}
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

            {/* Dropdown menu */}
            {isOpen && !isLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b sticky top-0 bg-white">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search skills..."
                                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
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
                                    {selectedSkills.includes(skill.name) && <Check size={16} className="text-primary" />}
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

const CreateProject = () => {
    const [isLoading, setIsLoading] = useState(false);
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

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setValue,
        trigger,
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

    const createProjectHandler = async (formData) => {
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
            const projectData = {
                title: formData.title,
                category: formData.category,
                subCategory: formData.subCategory || undefined,
                description: formData.description,
                period: selectedPeriod,
                duration: selectedDuration,
                service: selectedService,
                skills: selectedSkills,
            };

            const response = await axiosInstance.post("/api/v1/projects", projectData);

            if (response.data.success) {
                toast.success("Project posted successfully!");
                navigate("/buyer/projects/all");
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Failed to create project";
            toast.error(errorMessage);
            console.error("Create project error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <BuyerSidebar />
            <div className="w-full relative">
                <BuyerHeader />
                <BuyerContainer>
                    {/* Header */}
                    <div className="mb-8 mt-20 md:mt-0">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Post a Project
                        </h1>
                        <p className="text-gray-600">
                            Mentors will browse and express interest in your project
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(createProjectHandler)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
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
                            <Dropdown
                                label="Period"
                                value={selectedPeriod}
                                options={PERIODS}
                                onChange={(value) => {
                                    setSelectedPeriod(value);
                                    const firstDuration = DURATION_OPTIONS[value][0].id;
                                    setSelectedDuration(firstDuration);
                                }}
                            />

                            <Dropdown
                                label="Duration"
                                value={selectedDuration}
                                options={DURATION_OPTIONS[selectedPeriod] || []}
                                onChange={setSelectedDuration}
                            />

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
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Select skills that match your project requirements (max 10)
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                        Posting...
                                    </span>
                                ) : (
                                    "Post Project"
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
                            <li>Respond to mentor proposals promptly</li>
                        </ul>
                    </div> */}
                </BuyerContainer>
            </div>
        </section>
    );
};

export default CreateProject;