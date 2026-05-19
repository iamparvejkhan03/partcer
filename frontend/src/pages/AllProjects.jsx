import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "../components";
import ProjectCard from "../components/BuyerProjectCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

function AllProjects() {
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        subCategory: "",
        service: "all",
        period: "all",
        skills: []
    });

    const [allProjects, setAllProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [skillsList, setSkillsList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const searchFromURL = searchParams.get('search');
        const categoryFromURL = searchParams.get('category');
        const subCategoryFromURL = searchParams.get('subCategory');
        const serviceFromURL = searchParams.get('service');
        const periodFromURL = searchParams.get('period');

        if (searchFromURL) {
            setFilters(prev => ({ ...prev, search: decodeURIComponent(searchFromURL) }));
        }
        if (categoryFromURL) {
            setFilters(prev => ({ ...prev, category: decodeURIComponent(categoryFromURL) }));
        }
        if (subCategoryFromURL) {
            setFilters(prev => ({ ...prev, subCategory: decodeURIComponent(subCategoryFromURL) }));
        }
        if (serviceFromURL) {
            setFilters(prev => ({ ...prev, service: decodeURIComponent(serviceFromURL) }));
        }
        if (periodFromURL) {
            setFilters(prev => ({ ...prev, period: decodeURIComponent(periodFromURL) }));
        }
    }, [searchParams]);

    // Normalize category from URL to match exact ID
    useEffect(() => {
        const categoryFromURL = searchParams.get('category');
        if (categoryFromURL && categories.length > 0) {
            // Find the category with matching ID (since categories use _id)
            const matchedCategory = categories.find(
                cat => cat._id === categoryFromURL || cat.name.toLowerCase() === decodeURIComponent(categoryFromURL).toLowerCase()
            );

            if (matchedCategory && filters.category !== matchedCategory._id) {
                setFilters(prev => ({
                    ...prev,
                    category: matchedCategory._id
                }));
            }
        }
    }, [searchParams, categories, filters.category]);

    // Normalize subcategory from URL
    useEffect(() => {
        const subCategoryFromURL = searchParams.get('subCategory');
        if (subCategoryFromURL && subCategories.length > 0) {
            const matchedSubCategory = subCategories.find(
                sub => sub._id === subCategoryFromURL || sub.name.toLowerCase() === decodeURIComponent(subCategoryFromURL).toLowerCase()
            );

            if (matchedSubCategory && filters.subCategory !== matchedSubCategory._id) {
                setFilters(prev => ({
                    ...prev,
                    subCategory: matchedSubCategory._id
                }));
            }
        }
    }, [searchParams, subCategories]);

    // Helper functions for new model
    const getPeriodLabel = (period) => {
        const map = {
            one_time: 'One-time',
            per_day: 'Per day',
            weekly: 'Weekly',
            monthly: 'Monthly'
        };
        return map[period] || period;
    };

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
        fetchSkills();
    }, []);

    // Fetch projects on mount
    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (filters.category && filters.category !== "") {
            fetchSubCategories(filters.category);
        } else {
            setSubCategories([]);
        }
    }, [filters.category]);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/categories/public/parents');
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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
        } catch (error) {
            setSubCategories([]);
        }
    };

    const fetchSkills = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/skills/public');
            if (response.data.success) {
                setSkillsList(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/projects?status=active&limit=100`);

            if (response.data.success) {
                const { projects } = response.data.data;
                setAllProjects(projects);
                setFilteredProjects(projects);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    // Filter projects
    const filterProjects = useCallback(() => {
        let filtered = [...allProjects];

        // Search filter
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(project =>
                project.title?.toLowerCase().includes(searchTerm) ||
                project.description?.toLowerCase().includes(searchTerm) ||
                project.service?.toLowerCase().includes(searchTerm) ||
                project.skills?.some(skill => skill.toLowerCase().includes(searchTerm)) ||
                project.buyer?.displayName?.toLowerCase().includes(searchTerm)
            );
        }

        // Category filter - handle both ID and name
        if (filters.category) {
            filtered = filtered.filter(project => {
                const projectCategoryId = project.category?._id || project.category;
                const projectCategoryName = project.category?.name || '';

                return projectCategoryId === filters.category ||
                    projectCategoryName.toLowerCase() === decodeURIComponent(filters.category).toLowerCase();
            });
        }

        // SubCategory filter
        if (filters.subCategory) {
            filtered = filtered.filter(project => {
                const projectSubCategoryId = project.subCategory?._id || project.subCategory;
                const projectSubCategoryName = project.subCategory?.name || '';

                return projectSubCategoryId === filters.subCategory ||
                    projectSubCategoryName.toLowerCase() === decodeURIComponent(filters.subCategory).toLowerCase();
            });
        }

        // Service filter
        if (filters.service !== "all") {
            filtered = filtered.filter(project => project.service === filters.service);
        }

        // Period filter
        if (filters.period !== "all") {
            filtered = filtered.filter(project => project.period === filters.period);
        }

        // Skills filter
        if (filters.skills.length > 0) {
            filtered = filtered.filter(project => {
                const projectSkills = (project.skills || []).map(s =>
                    typeof s === 'string' ? s : s.name
                );
                return filters.skills.some(skill => projectSkills.includes(skill));
            });
        }

        setFilteredProjects(filtered);
        setCurrentPage(1);
    }, [allProjects, filters]);

    useEffect(() => {
        filterProjects();
    }, [filterProjects]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const toggleSkill = (skillName) => {
        setFilters(prev => ({
            ...prev,
            skills: prev.skills.includes(skillName)
                ? prev.skills.filter(s => s !== skillName)
                : [...prev.skills, skillName]
        }));
    };

    const clearSkillFilter = (skillName) => {
        setFilters(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillName)
        }));
    };

    const navigate = useNavigate();

    const resetFilters = () => {
        setFilters({
            search: "",
            category: "",
            subCategory: "",
            service: "all",
            period: "all",
            skills: []
        });
        
        navigate('/projects', { replace: true });
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

    const serviceOptions = [
        { value: "all", label: "All services" },
        { value: "Job Support (Mentoring)", label: "Job Support" },
        { value: "Skill Training", label: "Skill Training" },
        { value: "Mock Interview Support", label: "Mock Interview" }
    ];

    const periodOptions = [
        { value: "all", label: "All periods" },
        { value: "one_time", label: "One-time" },
        { value: "per_day", label: "Per day" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" }
    ];

    return (
        <Container>
            <div className="min-h-screen pt-24 md:pt-32 pb-16 bg-gray-50">
                {/* Hero Section with Stats */}
                {/* <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-200 px-4 md:px-8 py-8 md:py-12">
                    <div className="container mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Find Your Perfect Mentor
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Connect with expert Indian mentors for 1:1 training and career support.
                                Mentors with real experience, here to train and support you.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
                                <div className="text-sm text-gray-600">Expert Mentors</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-primary">12K+</div>
                                <div className="text-sm text-gray-600">Sessions Done</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-primary">98%</div>
                                <div className="text-sm text-gray-600">Satisfaction</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-primary">18</div>
                                <div className="text-sm text-gray-600">IT Categories</div>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Main Content */}
                <div className="container mx-auto py-6 md:py-8 md:px-0">

                    {/* All Projects Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">All Projects</h2>
                        <p className="text-gray-500 text-sm mt-1">All projects posted by learners — latest first</p>
                    </div>

                    {/* Top Filters Bar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-6">
                        {/* Search Row */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search projects by title, description, or student name..."
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Filter Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {/* Category Select */}
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                            >
                                <option value="">Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>

                            {/* SubCategory Select */}
                            <select
                                name="subCategory"
                                value={filters.subCategory}
                                onChange={handleFilterChange}
                                disabled={!filters.category || subCategories.length === 0}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Subcategory</option>
                                {subCategories.map(sub => (
                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                ))}
                            </select>

                            {/* Service Select */}
                            <select
                                name="service"
                                value={filters.service}
                                onChange={handleFilterChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                            >
                                {serviceOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            {/* Period Select */}
                            <select
                                name="period"
                                value={filters.period}
                                onChange={handleFilterChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                            >
                                {periodOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Active Filters Tags */}
                        {(filters.category || filters.subCategory || filters.service !== "all" || filters.period !== "all" || filters.skills.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                {/* Clear Filters Button */}
                                {(filters.category || filters.subCategory || filters.service !== "all" || filters.period !== "all" || filters.skills.length > 0 || filters.search) && (
                                    <button
                                        onClick={resetFilters}
                                        className="px-3 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                        Clear all
                                    </button>
                                )}

                                {filters.category && categories.find(c => c._id === filters.category) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        Category: {categories.find(c => c._id === filters.category)?.name || filters.category}
                                        <button onClick={() => setFilters(prev => ({ ...prev, category: "" }))} className="hover:text-blue-900">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.subCategory && subCategories.find(s => s._id === filters.subCategory) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                        Subcategory: {subCategories.find(s => s._id === filters.subCategory)?.name || filters.subCategory}
                                        <button onClick={() => setFilters(prev => ({ ...prev, subCategory: "" }))} className="hover:text-purple-900">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.service !== "all" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                        Service: {serviceOptions.find(s => s.value === filters.service)?.label}
                                        <button onClick={() => setFilters(prev => ({ ...prev, service: "all" }))} className="hover:text-green-900">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.period !== "all" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                        Period: {periodOptions.find(p => p.value === filters.period)?.label}
                                        <button onClick={() => setFilters(prev => ({ ...prev, period: "all" }))} className="hover:text-orange-900">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.skills.map(skill => (
                                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                        {skill}
                                        <button onClick={() => clearSkillFilter(skill)} className="hover:text-gray-900">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Results Count and Mobile Filter Toggle */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
                        <p className="text-gray-600 text-sm">
                            {loading ? "Loading..." : `Showing ${currentProjects.length} of ${filteredProjects.length} projects`}
                        </p>

                        {/* Mobile Filter Toggle */}
                        {/* <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <SlidersHorizontal size={18} />
                            <span>Filters</span>
                        </button> */}
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                        // Loading Skeleton - Grid layout
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                    <div className="flex gap-2 mb-4">
                                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    </div>
                                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                                </div>
                            ))}
                        </div>
                    ) : currentProjects.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                                {currentProjects.map(project => (
                                    <ProjectCard key={project._id} project={project} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="px-3 py-1 text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No projects found</h3>
                            <p className="text-gray-500 text-sm">Try adjusting your filters to find what you're looking for.</p>
                            <button
                                onClick={resetFilters}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Filters Modal */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
                        <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white overflow-y-auto">
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold">Filters</h3>
                                    <button onClick={() => setShowMobileFilters(false)} className="p-1">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Mobile Filter Options */}
                                <div className="space-y-5">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select
                                            name="category"
                                            value={filters.category}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Subcategory */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                                        <select
                                            name="subCategory"
                                            value={filters.subCategory}
                                            onChange={handleFilterChange}
                                            disabled={!filters.category}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                                        >
                                            <option value="">All Subcategories</option>
                                            {subCategories.map(sub => (
                                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Service */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                                        <select
                                            name="service"
                                            value={filters.service}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            {serviceOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Period */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                                        <select
                                            name="period"
                                            value={filters.period}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            {periodOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                            {skillsList.slice(0, 15).map(skill => (
                                                <label key={skill._id} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.skills.includes(skill.name)}
                                                        onChange={() => toggleSkill(skill.name)}
                                                        className="w-4 h-4 text-primary rounded"
                                                    />
                                                    <span className="text-sm">{skill.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowMobileFilters(false)}
                                        className="w-full py-2.5 bg-primary text-white rounded-lg font-medium"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default AllProjects;