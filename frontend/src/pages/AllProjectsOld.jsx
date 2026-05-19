import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, Grid, List, ChevronDown, Filter } from "lucide-react";
import { Container } from "../components";
import { BuyerProjectCard } from "../components"; // Make sure this path is correct
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import useCountryStates from "../hooks/useCountryStates";
import toast from "react-hot-toast";

// FiltersSection Component for Projects
const FiltersSection = ({
    filters,
    handleFilterChange,
    handleCheckboxChange,
    resetFilters,
    toggleFilterSection,
    activeFilterSections,
    setShowMobileFilters,
    selectedSkills,
    setSelectedSkills,
    selectedCategories,
    setSelectedCategories,
    countries,
    categories,
    skillsList,
    filterData
}) => {
    const toggleSkill = (skillValue) => {
        setSelectedSkills(prev =>
            prev.includes(skillValue)
                ? prev.filter(s => s !== skillValue)
                : [...prev, skillValue]
        );
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 h-fit">
            <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-6">
                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Projects
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="What project are you looking for?"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={filters.search}
                            onChange={handleFilterChange}
                            name="search"
                        />
                    </div>
                </div>

                {/* Categories - Dynamic from API */}
                <div>
                    <button
                        onClick={() => toggleFilterSection('categories')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Categories</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.categories ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-2 max-h-48 overflow-y-auto ${activeFilterSections.categories ? 'block' : 'hidden'}`}>
                        {categories.slice(0, 6).map(category => (
                            <label key={category._id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category._id)}
                                    onChange={() => toggleCategory(category._id)}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-gray-600">{category.name}</span>
                            </label>
                        ))}
                        {categories.length > 6 && (
                            <p className="text-xs text-gray-500 mt-1">Showing 6 of {categories.length} categories</p>
                        )}
                    </div>
                </div>

                {/* Skills - Dynamic from API */}
                <div>
                    <button
                        onClick={() => toggleFilterSection('skills')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Skills</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.skills ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-2 max-h-48 overflow-y-auto ${activeFilterSections.skills ? 'block' : 'hidden'}`}>
                        {skillsList.map(skill => (
                            <label key={skill._id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedSkills.includes(skill.name)}
                                    onChange={() => toggleSkill(skill.name)}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-gray-600">{skill.name}</span>
                            </label>
                        ))}
                        {skillsList.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">Showing {skillsList.length} of {skillsList.length} skills</p>
                        )}
                    </div>
                </div>

                {/* Project Type - Static */}
                {/* <div>
                    <button
                        onClick={() => toggleFilterSection('projectType')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Project Type</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.projectType ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-2 ${activeFilterSections.projectType ? 'block' : 'hidden'}`}>
                        {filterData.projectTypes.map(type => (
                            <label key={type.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="project_type"
                                    value={type.value}
                                    checked={filters.project_type?.includes(type.value)}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-gray-600">{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div> */}

                {/* Location - Dynamic from hook */}
                <div>
                    <button
                        onClick={() => toggleFilterSection('location')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Location</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.location ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`${activeFilterSections.location ? 'block' : 'hidden'}`}>
                        <select
                            name="location"
                            value={filters.location}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Any Location</option>
                            <option value="remote">🌍 Remote (Worldwide)</option>
                            {countries.map(country => (
                                <option key={country.code} value={country.name}>
                                    {country.flag} {country.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Experience Level - Static */}
                {/* <div>
                    <button
                        onClick={() => toggleFilterSection('experience')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Experience Level</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.experience ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-2 ${activeFilterSections.experience ? 'block' : 'hidden'}`}>
                        {filterData.experienceLevels.map(level => (
                            <label key={level.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="experience_level"
                                    value={level.value}
                                    checked={filters.experience_level?.includes(level.value)}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-gray-600">{level.label}</span>
                            </label>
                        ))}
                    </div>
                </div> */}

                {/* Duration - Static */}
                <div>
                    <button
                        onClick={() => toggleFilterSection('duration')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Project Duration</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.duration ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-2 ${activeFilterSections.duration ? 'block' : 'hidden'}`}>
                        {filterData.durations.map(duration => (
                            <label key={duration.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="duration"
                                    value={duration.value}
                                    checked={filters.duration?.includes(duration.value)}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-gray-600">{duration.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Budget Range */}
                <div>
                    <button
                        onClick={() => toggleFilterSection('budget')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Budget Range</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.budget ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-3 ${activeFilterSections.budget ? 'block' : 'hidden'}`}>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                min="0"
                                name="min_budget"
                                value={filters.min_budget}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <span className="self-center text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                min="0"
                                name="max_budget"
                                value={filters.max_budget}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col gap-3 mt-8">
                <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
                >
                    Apply Filters
                </button>
                <button
                    onClick={() => {
                        resetFilters();
                        setSelectedSkills([]);
                        setSelectedCategories([]);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Clear all filters
                </button>
            </div>
        </div>
    );
};

function AllProjects() {
    const [filters, setFilters] = useState({
        search: "",
        project_type: [],
        location: "",
        experience_level: [],
        duration: [],
        min_budget: "",
        max_budget: ""
    });

    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState("newest");
    const [allProjects, setAllProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeFilterSections, setActiveFilterSections] = useState({
        categories: false,
        skills: false,
        projectType: false,
        location: false,
        experience: false,
        duration: false,
        budget: false
    });
    const [viewMode, setViewMode] = useState("list");
    const [searchParams] = useSearchParams();

    // Dynamic data from hooks/API
    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [skillsList, setSkillsList] = useState([]);
    const [categories, setCategories] = useState([]);

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Static filter data
    const filterData = {
        projectTypes: [
            { id: 21, value: "fixed", label: "Fixed Price" },
            { id: 22, value: "hourly", label: "Hourly" }
        ],
        experienceLevels: [
            { id: 31, value: "entry", label: "Entry Level" },
            { id: 32, value: "intermediate", label: "Intermediate" },
            { id: 33, value: "expert", label: "Expert" }
        ],
        durations: [
            { id: 41, value: "Less than 1 week", label: "Less than 1 week" },
            { id: 42, value: "1-2 weeks", label: "1-2 weeks" },
            { id: 43, value: "2-4 weeks", label: "2-4 weeks" },
            { id: 44, value: "1-3 months", label: "1-3 months" },
            { id: 45, value: "3-6 months", label: "3-6 months" },
            { id: 46, value: "More than 6 months", label: "More than 6 months" }
        ]
    };

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            const countriesData = await countriesAPI();
            setCountries(countriesData);
        };
        fetchCountries();
    }, []);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/categories/public/parents');
                if (response.data.success) {
                    setCategories(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    // Fetch skills from API
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/skills/public');
                if (response.data.success) {
                    setSkillsList(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching skills:', error);
                setSkillsList([]);
            }
        };
        fetchSkills();
    }, []);

    // Fetch projects on mount (only once)
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', 1);
            params.append('limit', 50); // Fetch more for client-side filtering
            params.append('status', 'active'); // Only show active projects

            const response = await axiosInstance.get(`/api/v1/projects?${params}`);

            if (response.data.success) {
                const { projects, pagination } = response.data.data;
                setAllProjects(projects);
                setFilteredProjects(projects);
                setTotalPages(pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    // Main filter function - client-side only
    const filterProjects = useCallback((projects) => {
        return projects.filter(project => {
            // 1. Search filter
            if (filters.search && filters.search.trim() !== "") {
                const searchTerm = filters.search.toLowerCase().trim();
                const searchString = `
                    ${project.title || ''} 
                    ${project.description || ''}
                    ${project.location || ''}
                    ${project.buyer?.displayName || project.buyer?.firstName || ''}
                    ${(project.skills || []).map(s => typeof s === 'string' ? s : s.name).join(' ')}
                `.toLowerCase();

                if (!searchString.includes(searchTerm)) {
                    return false;
                }
            }

            // 2. Categories filter
            if (selectedCategories.length > 0) {
                const projectCategoryId = typeof project.category === 'string'
                    ? project.category
                    : project.category?._id;

                if (!selectedCategories.includes(projectCategoryId)) {
                    return false;
                }
            }

            // 3. Skills filter
            if (selectedSkills.length > 0) {
                const projectSkillIds = (project.skills || []).map(skill =>
                    typeof skill === 'string' ? skill : skill._id
                );

                const hasMatchingSkill = selectedSkills.some(skillId =>
                    projectSkillIds.includes(skillId)
                );

                if (!hasMatchingSkill) return false;
            }

            // 4. Location filter
            if (filters.location && filters.location.trim() !== "") {
                if (filters.location === "remote") {
                    if (project.location?.toLowerCase() !== "remote" && project.location?.toLowerCase() !== "") {
                        return false;
                    }
                } else if (project.location !== filters.location) {
                    return false;
                }
            }

            // 5. Project type filter
            if (filters.project_type.length > 0) {
                if (!filters.project_type.includes(project.projectType)) {
                    return false;
                }
            }

            // 6. Experience level filter
            if (filters.experience_level.length > 0) {
                if (!filters.experience_level.includes(project.experienceLevel)) {
                    return false;
                }
            }

            // 7. Duration filter
            if (filters.duration.length > 0) {
                if (!filters.duration.includes(project.duration)) {
                    return false;
                }
            }

            // 8. Budget filter
            if (filters.min_budget || filters.max_budget) {
                const projectBudget = project.budget || 0;

                if (filters.min_budget && projectBudget < parseFloat(filters.min_budget)) {
                    return false;
                }

                if (filters.max_budget && projectBudget > parseFloat(filters.max_budget)) {
                    return false;
                }
            }

            return true;
        });
    }, [filters, selectedSkills, selectedCategories]);

    // Sort function
    const sortProjects = useCallback((projects) => {
        const sorted = [...projects];

        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'budget-high':
                return sorted.sort((a, b) => (b.budget || 0) - (a.budget || 0));
            case 'budget-low':
                return sorted.sort((a, b) => (a.budget || 0) - (b.budget || 0));
            case 'applicants-low':
                return sorted.sort((a, b) => (a.applicantsCount || 0) - (b.applicantsCount || 0));
            case 'applicants-high':
                return sorted.sort((a, b) => (b.applicantsCount || 0) - (a.applicantsCount || 0));
            default:
                return sorted;
        }
    }, [sortBy]);

    // Apply filters and sorting whenever dependencies change (client-side only)
    useEffect(() => {
        if (allProjects.length > 0) {
            const filtered = filterProjects(allProjects);
            const sorted = sortProjects(filtered);
            setFilteredProjects(sorted);
            setCurrentPage(1); // Reset to first page when filters change
        }
    }, [allProjects, filterProjects, sortProjects]);

    // Handle search from URL on initial load (if any)
    useEffect(() => {
        const searchFromURL = searchParams.get('search');
        const categorySlugFromURL = searchParams.get('category');

        if (searchFromURL) {
            setFilters(prev => ({
                ...prev,
                search: searchFromURL
            }));
        }

        if (categorySlugFromURL && categories.length > 0) {
            // Find category by slug to get its ID
            const category = categories.find(c => c.slug === categorySlugFromURL);
            if (category) {
                setSelectedCategories([category._id]);
            }
        }
    }, [searchParams, categories]); // Now depends on both searchParams and categories

    // Filter change handlers - NO URL updates
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target;
        setFilters(prev => {
            const currentArray = prev[name] || [];
            if (checked) {
                return { ...prev, [name]: [...currentArray, value] };
            } else {
                return { ...prev, [name]: currentArray.filter(item => item !== value) };
            }
        });
    };

    const resetFilters = () => {
        setFilters({
            search: "",
            project_type: [],
            location: "",
            experience_level: [],
            duration: [],
            min_budget: "",
            max_budget: ""
        });
        setSelectedSkills([]);
        setSelectedCategories([]);
        setSortBy("newest");
    };

    const toggleFilterSection = (section) => {
        setActiveFilterSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages_count = Math.ceil(filteredProjects.length / itemsPerPage);

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "budget-high", label: "Budget: High to Low" },
        { value: "budget-low", label: "Budget: Low to High" },
        { value: "applicants-low", label: "Fewest Applicants" },
        { value: "applicants-high", label: "Most Applicants" }
    ];

    const formatBudget = (project) => {
        if (project.projectType === 'fixed') {
            if (project.minBudget && project.maxBudget) {
                return `$${project.minBudget.toLocaleString()} - $${project.maxBudget.toLocaleString()}`;
            }
            return `$${project.budget?.toLocaleString() || 0}`;
        } else {
            return `$${project.hourlyRate || 0}/hr`;
        }
    };

    return (
        <Container>
            <div className="min-h-screen pt-24 md:pt-32 pb-16 bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-6 md:py-8">
                    <div className="container mx-auto">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Projects</h1>
                        <p className="text-gray-600 mt-2">
                            {loading ? "Loading projects..." : `${filteredProjects.length} projects available`}
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto py-6 md:py-8 px-4 md:px-0">
                    <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                        {/* Filters Sidebar */}
                        <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
                            <FiltersSection
                                filters={filters}
                                handleFilterChange={handleFilterChange}
                                handleCheckboxChange={handleCheckboxChange}
                                resetFilters={resetFilters}
                                toggleFilterSection={toggleFilterSection}
                                activeFilterSections={activeFilterSections}
                                setShowMobileFilters={setShowMobileFilters}
                                selectedSkills={selectedSkills}
                                selectedCategories={selectedCategories}
                                setSelectedSkills={setSelectedSkills}
                                setSelectedCategories={setSelectedCategories}
                                countries={countries}
                                categories={categories}
                                skillsList={skillsList}
                                filterData={filterData}
                            />
                        </div>

                        {/* Content Area */}
                        <div className="w-full lg:w-3/4 xl:w-4/5">
                            {/* Mobile Filter Toggle */}
                            <div className="flex flex-col md:flex-row gap-4 mb-6 lg:hidden">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                        name="search"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 md:w-auto font-medium"
                                >
                                    <SlidersHorizontal size={20} />
                                    <span>Filters</span>
                                </button>
                            </div>

                            {/* Results Count and Sort */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
                                <p className="text-gray-600 text-sm md:text-base">
                                    {loading ? "Loading..." : `Showing ${currentProjects.length} of ${filteredProjects.length} projects`}
                                </p>

                                <div className="flex items-center gap-3">
                                    {/* View Mode Toggle */}
                                    {/* <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={`p-1.5 md:p-2 rounded transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                            title="Grid View"
                                        >
                                            <Grid size={16} className={viewMode === "grid" ? "text-primary" : "text-gray-500"} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={`p-1.5 md:p-2 rounded transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                            title="List View"
                                        >
                                            <List size={16} className={viewMode === "list" ? "text-primary" : "text-gray-500"} />
                                        </button>
                                    </div> */}

                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 text-sm hidden md:inline">Sort by:</span>
                                        <select
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                            onChange={handleSortChange}
                                            value={sortBy}
                                        >
                                            {sortOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Projects Grid/List */}
                            {loading ? (
                                // Loading Skeleton
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                                                <div className="flex-1">
                                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
                                                <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
                                                <div className="h-8 bg-gray-200 rounded-lg w-16"></div>
                                            </div>
                                            <div className="h-12 bg-gray-200 rounded-lg"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : currentProjects.length > 0 ? (
                                <>
                                    {viewMode === "grid" ? (
                                        // Grid View - 2 columns on desktop
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {currentProjects.map(project => (
                                                <BuyerProjectCard
                                                    key={project._id}
                                                    project={project}
                                                    budget={formatBudget(project)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        // List View - Full width
                                        <div className="space-y-6">
                                            {currentProjects.map(project => (
                                                <BuyerProjectCard
                                                    key={project._id}
                                                    project={project}
                                                    budget={formatBudget(project)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {totalPages_count > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-8">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-3 py-1">
                                                Page {currentPage} of {totalPages_count}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages_count))}
                                                disabled={currentPage === totalPages_count}
                                                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 md:py-12">
                                    <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-medium text-gray-700 mb-2">No projects found</h3>
                                    <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filters Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)}></div>
                        <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white overflow-y-auto p-4 md:p-6">
                            <FiltersSection
                                filters={filters}
                                handleFilterChange={handleFilterChange}
                                handleCheckboxChange={handleCheckboxChange}
                                resetFilters={resetFilters}
                                toggleFilterSection={toggleFilterSection}
                                activeFilterSections={activeFilterSections}
                                setShowMobileFilters={setShowMobileFilters}
                                selectedSkills={selectedSkills}
                                selectedCategories={selectedCategories}
                                setSelectedSkills={setSelectedSkills}
                                setSelectedCategories={setSelectedCategories}
                                countries={countries}
                                categories={categories}
                                skillsList={skillsList}
                                filterData={filterData}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default AllProjects;