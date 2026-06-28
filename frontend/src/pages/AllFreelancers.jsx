import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Filter, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Container, FreelancerProfileCard } from "../components";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

function AllFreelancers() {
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        subCategory: "",
        service: "all",
        skills: []
    });

    const [allFreelancers, setAllFreelancers] = useState([]);
    const [filteredFreelancers, setFilteredFreelancers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [skillsList, setSkillsList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const [isSkillsOpen, setIsSkillsOpen] = useState(false);
const [skillsSearch, setSkillsSearch] = useState("");

const filteredSkills = useMemo(() => {
    return skillsList.filter(skill =>
        skill.name.toLowerCase().includes(skillsSearch.toLowerCase())
    );
}, [skillsList, skillsSearch]);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const searchFromURL = searchParams.get('search');
        const categoryFromURL = searchParams.get('category');
        const serviceFromURL = searchParams.get('service');
        if (searchFromURL) {
            setFilters(prev => ({
                ...prev,
                search: searchFromURL
            }));
        }
        if (categoryFromURL) {
            setFilters(prev => ({
                ...prev,
                category: decodeURIComponent(categoryFromURL)
            }));
        }
        if (serviceFromURL) {
            setFilters(prev => ({
                ...prev,
                service: serviceFromURL
            }));
        }
    }, [searchParams]);

    // Normalize category from URL to match exact casing
    useEffect(() => {
        const categoryFromURL = searchParams.get('category');
        if (categoryFromURL && categories.length > 0) {
            // Find the category with case-insensitive match
            const matchedCategory = categories.find(
                cat => cat.name.toLowerCase() === categoryFromURL.toLowerCase()
            );

            if (matchedCategory && filters.category !== matchedCategory.name) {
                setFilters(prev => ({
                    ...prev,
                    category: matchedCategory.name
                }));
            }
        }
    }, [searchParams, categories, filters.category]);

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
        fetchSkills();
    }, []);

    // Fetch freelancers on mount
    useEffect(() => {
        fetchFreelancers();
    }, []);

    // Fetch subcategories when category changes
    // useEffect(() => {
    //     if (filters.category) {
    //         fetchSubCategories(filters.category);
    //     } else {
    //         setSubCategories([]);
    //     }
    // }, [filters.category]);

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

    // const fetchSubCategories = async (categoryId) => {
    //     try {
    //         const response = await axiosInstance.get(`/api/v1/categories/public/${categoryId}/subcategories`);
    //         if (response.data?.success) {
    //             setSubCategories(response.data.data?.subcategories || []);
    //         } else {
    //             setSubCategories([]);
    //         }
    //     } catch (error) {
    //         setSubCategories([]);
    //     }
    // };

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

    const fetchFreelancers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/users/freelancers/search?page=1&limit=100`);

            if (response.data.success) {
                const { freelancers } = response.data.data;
                setAllFreelancers(freelancers);
                setFilteredFreelancers(freelancers);
            }
        } catch (error) {
            console.error('Error fetching freelancers:', error);
            toast.error('Failed to load mentors');
        } finally {
            setLoading(false);
        }
    };

    // Filter freelancers
    const filterFreelancers = useCallback(() => {
        let filtered = [...allFreelancers];

        // Search filter
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(freelancer =>
                `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.toLowerCase().includes(searchTerm) ||
                freelancer.tagline?.toLowerCase().includes(searchTerm) ||
                freelancer.bio?.toLowerCase().includes(searchTerm) ||
                freelancer.skills?.some(skill => skill.toLowerCase().includes(searchTerm)) ||
                freelancer.services?.some(service => service.toLowerCase().includes(searchTerm)) ||
                freelancer.country?.toLowerCase().includes(searchTerm)
            );
        }

        // Category filter
        // if (filters.category) {
        //     filtered = filtered.filter(freelancer =>
        //         freelancer.category?._id === filters.category ||
        //         freelancer.category === filters.category ||
        //         freelancer.primaryCategory?._id === filters.category
        //     );
        // }

        // Category filter
        // if (filters.category) {
        //     filtered = filtered.filter(freelancer => {
        //         const freelancerCategories = (freelancer.categories || []).map(c =>
        //             typeof c === 'string' ? c : c.name
        //         );
        //         return freelancerCategories.includes(filters.category);
        //     });
        // }

        // Category filter - Improved version
        if (filters.category) {
            filtered = filtered.filter(freelancer => {
                const freelancerCategories = (freelancer.categories || []).map(c => {
                    // Handle different possible formats
                    if (typeof c === 'string') return c;
                    if (c.name) return c.name;
                    if (c.categoryName) return c.categoryName;
                    return '';
                });

                // Case-insensitive comparison
                return freelancerCategories.some(cat =>
                    cat.toLowerCase() === filters.category.toLowerCase()
                );
            });
        }

        // SubCategory filter
        if (filters.subCategory) {
            filtered = filtered.filter(freelancer =>
                freelancer.subCategory?._id === filters.subCategory ||
                freelancer.subCategory === filters.subCategory ||
                freelancer.primarySubCategory?._id === filters.subCategory
            );
        }

        // Service filter
        if (filters.service !== "all") {
            filtered = filtered.filter(freelancer => {
                const services = freelancer.services || [];
                return services.includes(filters.service);
            });
        }

        // Skills filter
        if (filters.skills.length > 0) {
            filtered = filtered.filter(freelancer => {
                const freelancerSkills = (freelancer.skills || []).map(s =>
                    typeof s === 'string' ? s : s.name
                );
                return filters.skills.some(skill => freelancerSkills.includes(skill));
            });
        }

        setFilteredFreelancers(filtered);
        setCurrentPage(1);
    }, [allFreelancers, filters]);

    useEffect(() => {
        filterFreelancers();
    }, [filterFreelancers]);

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
            skills: []
        });
        navigate('/freelancers');
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFreelancers = filteredFreelancers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage);

    const serviceOptions = [
        { value: "all", label: "All services" },
        { value: "Job Support (Mentoring)", label: "Job Support" },
        { value: "Skill Training", label: "Skill Training" },
        { value: "Mock Interview Support", label: "Mock Interview" }
    ];

    return (
        <Container>
            <div className="min-h-screen pt-24 md:pt-32 pb-16 bg-gray-50">
                {/* Main Content */}
                <div className="container mx-auto py-6 md:py-8 md:px-0">
                    {/* All Mentors Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">All Mentors</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {loading ? "Loading mentors..." : `${filteredFreelancers.length} mentor(s) found`}
                        </p>
                    </div>

                    {/* Top Filters Bar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 mb-6">
                        {/* Search Row */}
                        {/* <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search mentors by name, tagline, or bio..."
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div> */}

                        {/* Filter Row */}
                        <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                            <div className="relative md:col-span-3">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search mentors by name, tagline, or bio..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            {/* Category Select */}
                            <div className="relative md:col-span-3">
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        // <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* SubCategory Select */}
                            {/* <select
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
                            </select> */}

                            {/* Service Select */}
                            <div className="relative md:col-span-2">
                                <select
                                    name="service"
                                    value={filters.service}
                                    onChange={handleFilterChange}
                                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white w-full"
                                >
                                    {serviceOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Skills Select - Multi-select Dropdown */}
<div className="relative md:col-span-2">
    <button
        type="button"
        onClick={() => setIsSkillsOpen(!isSkillsOpen)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white flex justify-between items-center hover:border-gray-400 transition-colors"
    >
        <span className={filters.skills.length > 0 ? "text-gray-900" : "text-gray-500"}>
            {filters.skills.length > 0
                ? `${filters.skills.length} skill${filters.skills.length > 1 ? "s" : ""} selected`
                : "Select Skills"}
        </span>
        <ChevronDown size={16} className={`transform transition-transform ${isSkillsOpen ? "rotate-180" : ""}`} />
    </button>

    {isSkillsOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div className="p-2 border-b sticky top-0 bg-white">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search skills..."
                        className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                        value={skillsSearch}
                        onChange={(e) => setSkillsSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
            <div className="py-1">
                {/* Select All / Deselect All */}
                {filteredSkills.length > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            if (filters.skills.length === filteredSkills.length) {
                                // Deselect all filtered skills
                                const filteredSkillNames = filteredSkills.map(s => s.name);
                                setFilters(prev => ({
                                    ...prev,
                                    skills: prev.skills.filter(s => !filteredSkillNames.includes(s))
                                }));
                            } else {
                                // Select all filtered skills
                                const allSkillNames = filteredSkills.map(s => s.name);
                                const uniqueSkills = [...new Set([...filters.skills, ...allSkillNames])];
                                setFilters(prev => ({
                                    ...prev,
                                    skills: uniqueSkills
                                }));
                            }
                            setSkillsSearch("");
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-primary border-b border-gray-100"
                    >
                        {filters.skills.length === filteredSkills.length && filteredSkills.length > 0 
                            ? "Deselect All" 
                            : "Select All"}
                    </button>
                )}
                
                {filteredSkills.length > 0 ? (
                    filteredSkills.map((skill) => (
                        <label
                            key={skill._id}
                            className={`w-full px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50 ${
                                filters.skills.includes(skill.name) ? "bg-primary/5" : ""
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={filters.skills.includes(skill.name)}
                                onChange={() => toggleSkill(skill.name)}
                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                            <span className="flex-1">{skill.name}</span>
                            {filters.skills.includes(skill.name) && (
                                <Check size={16} className="text-primary" />
                            )}
                        </label>
                    ))
                ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No skills found</div>
                )}
            </div>
        </div>
    )}
</div>
                        </div>

                        {/* Active Filters Tags */}
                        {(filters.category || filters.subCategory || filters.service !== "all" || filters.skills.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                {/* Clear Filters Button */}
                                {(filters.category || filters.subCategory || filters.service !== "all" || filters.skills.length > 0 || filters.search) && (
                                    <button
                                        onClick={resetFilters}
                                        className="px-3 py-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                        Clear all
                                    </button>
                                )}

                                {filters.category && categories.find(c => c.name === filters.category) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                        Category: {categories.find(c => c.name === filters.category)?.name || filters.category}
                                        <button onClick={() => setFilters(prev => ({ ...prev, category: "" }))} className="hover:text-blue-900">
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.subCategory && subCategories.find(s => s._id === filters.subCategory) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                        Subcategory: {subCategories.find(s => s._id === filters.subCategory)?.name}
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
                            {loading ? "Loading..." : `Showing ${currentFreelancers.length} of ${filteredFreelancers.length} mentors`}
                        </p>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <SlidersHorizontal size={18} />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Mentors Grid */}
                    {loading ? (
                        // Loading Skeleton - Grid layout
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : currentFreelancers.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                                {currentFreelancers.map(freelancer => (
                                    <FreelancerProfileCard key={freelancer._id} freelancer={freelancer} />
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
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No mentors found</h3>
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
                                    {/* Search */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                        <input
                                            type="text"
                                            name="search"
                                            placeholder="Search mentors..."
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>

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
                                                <option key={cat.name} value={cat.name}>{cat.name}</option>
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
                                                <option key={sub.name} value={sub.name}>{sub.name}</option>
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

                                    {/* Skills */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                            {skillsList.map(skill => (
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

                                {/* Reset Button */}
                                <div className="mt-3">
                                    <button
                                        onClick={() => {
                                            resetFilters();
                                            setShowMobileFilters(false);
                                        }}
                                        className="w-full py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700"
                                    >
                                        Reset Filters
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

export default AllFreelancers;