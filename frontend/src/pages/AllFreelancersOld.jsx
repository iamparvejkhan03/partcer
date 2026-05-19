import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, Grid, List, ChevronDown, Filter } from "lucide-react";
import { Container } from "../components";
import { FreelancerProfileCard } from "../components";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import useCountryStates from "../hooks/useCountryStates";
import toast from "react-hot-toast";

// Static filter data (languages only - kept static)
const filterData = {
    freelancerTypes: [
        { id: 39, value: "agency", label: "Agency" },
        { id: 69, value: "independent", label: "Independent" }
    ],
    englishLevels: [
        { id: 48, value: "basic", label: "Basic" },
        { id: 54, value: "conversational", label: "Conversational" },
        { id: 62, value: "fluent", label: "Fluent" },
        { id: 63, value: "native", label: "Native" }
    ],
    languages: [
        { id: 49, value: "English", label: "English" },
        { id: 59, value: "Spanish", label: "Spanish" },
        { id: 61, value: "French", label: "French" },
        { id: 63, value: "German", label: "German" },
        { id: 65, value: "Italian", label: "Italian" },
        { id: 70, value: "Portuguese", label: "Portuguese" },
        { id: 71, value: "Dutch", label: "Dutch" },
        { id: 72, value: "Russian", label: "Russian" },
        { id: 73, value: "Japanese", label: "Japanese" },
        { id: 74, value: "Korean", label: "Korean" },
        { id: 75, value: "Chinese", label: "Chinese" },
        { id: 76, value: "Arabic", label: "Arabic" },
        { id: 77, value: "Hindi", label: "Hindi" }
    ]
};

// FiltersSection Component (same as before, just using the filterData prop)
const FiltersSection = ({
    filters,
    handleFilterChange,
    handleCheckboxChange,
    resetFilters,
    toggleFilterSection,
    activeFilterSections,
    setShowMobileFilters,
    selectedSkills,
    selectedServices,
    selectedLanguages,
    setSelectedSkills,
    setSelectedServices,
    setSelectedLanguages,
    countries,
    skillsList,
    servicesList,
    filterData
}) => {
    const toggleSkill = (skillValue) => {
        setSelectedSkills(prev =>
            prev.includes(skillValue)
                ? prev.filter(s => s !== skillValue)
                : [...prev, skillValue]
        );
    };

    const toggleService = (serviceValue) => {
        setSelectedServices(prev =>
            prev.includes(serviceValue)
                ? prev.filter(s => s !== serviceValue)
                : [...prev, serviceValue]
        );
    };

    const toggleLanguage = (languageValue) => {
        setSelectedLanguages(prev =>
            prev.includes(languageValue)
                ? prev.filter(l => l !== languageValue)
                : [...prev, languageValue]
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
                        Narrow your search
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Start your search"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={filters.search}
                            onChange={handleFilterChange}
                            name="search"
                        />
                    </div>
                </div>

                {/* Freelancer Type */}
                <div>
                    <button
                        onClick={() => toggleFilterSection('freelancerType')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Mentor Type</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.freelancerType ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-2 ${activeFilterSections.freelancerType ? 'block' : 'hidden'}`}>
                        {filterData.freelancerTypes.map(type => (
                            <label key={type.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="freelancer_type"
                                    value={type.value}
                                    checked={filters.freelancer_type?.includes(type.value)}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-gray-600">{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* English Level */}
                <div>
                    <button
                        onClick={() => toggleFilterSection('englishLevel')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>English Level</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.englishLevel ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-2 ${activeFilterSections.englishLevel ? 'block' : 'hidden'}`}>
                        {filterData.englishLevels.map(level => (
                            <label key={level.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="english_level"
                                    value={level.value}
                                    checked={filters.english_level?.includes(level.value)}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-gray-600">{level.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Country - Dynamic from hook */}
                {/* <div>
                    <button
                        onClick={() => toggleFilterSection('country')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Country</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.country ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`${activeFilterSections.country ? 'block' : 'hidden'}`}>
                        <select
                            name="country"
                            value={filters.country}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Countries</option>
                            {countries.map(country => (
                                <option key={country.code} value={country.name}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div> */}

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

                {/* Services - Dynamic from API */}
                <div>
                    <button
                        onClick={() => toggleFilterSection('services')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Services</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.services ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-2 max-h-48 overflow-y-auto ${activeFilterSections.services ? 'block' : 'hidden'}`}>
                        {servicesList.map(service => (
                            <label key={service.name} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedServices.includes(service.name)}
                                    onChange={() => toggleService(service.name)}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-gray-600">{service.name}</span>
                            </label>
                        ))}
                        {servicesList.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">Showing {servicesList.length} of {servicesList.length} services</p>
                        )}
                    </div>
                </div>

                {/* Languages - Static */}
                <div>
                    <button
                        onClick={() => toggleFilterSection('languages')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Languages</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.languages ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-2 max-h-48 overflow-y-auto ${activeFilterSections.languages ? 'block' : 'hidden'}`}>
                        {filterData.languages.map(language => (
                            <label key={language.id} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedLanguages.includes(language.value)}
                                    onChange={() => toggleLanguage(language.value)}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-gray-600">{language.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Hourly Rate */}
                {/* <div>
                    <button
                        onClick={() => toggleFilterSection('hourlyRate')}
                        className="flex items-center justify-between w-full text-left font-medium text-gray-700 mb-3"
                    >
                        <span>Hourly rate</span>
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${activeFilterSections.hourlyRate ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div className={`space-y-3 ${activeFilterSections.hourlyRate ? 'block' : 'hidden'}`}>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                min="0"
                                name="min_price"
                                value={filters.min_price}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <span className="self-center text-gray-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                min="0"
                                name="max_price"
                                value={filters.max_price}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                </div> */}
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
                        setSelectedServices([]);
                        setSelectedLanguages([]);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Clear all filters
                </button>
            </div>
        </div>
    );
};

function AllFreelancers() {
    const [filters, setFilters] = useState({
        search: "",
        freelancer_type: [],
        english_level: [],
        country: "",
        min_price: "",
        max_price: ""
    });

    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [sortBy, setSortBy] = useState("newest");
    const [allFreelancers, setAllFreelancers] = useState([]);
    const [filteredFreelancers, setFilteredFreelancers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeFilterSections, setActiveFilterSections] = useState({});
    const [viewMode, setViewMode] = useState("grid");

    // Dynamic data from hooks/API
    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [skillsList, setSkillsList] = useState([]);
    const [servicesList, setServicesList] = useState([{ name: "Job Support (Mentoring)" }, { name: "Skill Training" }, { name: "Mock Interview Support" }]);

    const [searchParams] = useSearchParams(); // Only reading, not setting

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            const countriesData = await countriesAPI();
            setCountries(countriesData);
        };
        fetchCountries();
    }, []);

    // Fetch skills from API
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/skills/public');
                if (response.data.success) {
                    setSkillsList(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching skills:', error);
                // Fallback to empty array
                setSkillsList([]);
            }
        };
        fetchSkills();
    }, []);

    // Main filter function - client-side only
    const filterFreelancers = useCallback((freelancers) => {
        return freelancers.filter(freelancer => {
            // 1. Search filter
            if (filters.search && filters.search.trim() !== "") {
                const searchTerm = filters.search.toLowerCase().trim();
                const fullName = `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.toLowerCase();
                const searchString = `
                    ${fullName}
                    ${freelancer.tagline || ''}
                    ${freelancer.bio || ''}
                    ${freelancer.country || ''}
                    ${freelancer.city || ''}
                    ${(freelancer.skills || []).join(' ')}
                    ${(freelancer.services || []).join(' ')}
                `.toLowerCase();

                if (!searchString.includes(searchTerm)) {
                    return false;
                }
            }

            // 2. Freelancer type filter
            if (filters.freelancer_type.length > 0) {
                const freelancerType = (freelancer.freelancerType || '').toLowerCase();
                const hasMatch = filters.freelancer_type.some(type =>
                    type.toLowerCase() === freelancerType
                );

                if (!hasMatch) {
                    return false;
                }
            }

            // 3. English level filter
            if (filters.english_level.length > 0) {
                if (!filters.english_level.includes(freelancer.englishLevel)) {
                    return false;
                }
            }

            // 4. Country filter - FIXED: direct match with freelancer.country
            if (filters.country && filters.country.trim() !== "") {
                if (freelancer.country !== filters.country) {
                    return false;
                }
            }

            // 5. Skills filter - FIXED: proper matching
            if (selectedSkills.length > 0) {
                const hasMatchingSkill = selectedSkills.some(selectedSkill => {
                    const selectedSkillLower = selectedSkill.toLowerCase();
                    return (freelancer.skills || []).some(freelancerSkill =>
                        freelancerSkill.toLowerCase() === selectedSkillLower
                    );
                });
                if (!hasMatchingSkill) return false;
            }

            // 5. Services filter - FIXED: proper matching
            if (selectedServices.length > 0) {
                const hasMatchingService = selectedServices.some(selectedService => {
                    const selectedServiceLower = selectedService.toLowerCase();
                    return (freelancer.services || []).some(freelancerService =>
                        freelancerService.toLowerCase() === selectedServiceLower
                    );
                });
                if (!hasMatchingService) return false;
            }

            // 6. Languages filter - FIXED: proper matching
            if (selectedLanguages.length > 0) {
                const hasMatchingLanguage = selectedLanguages.some(selectedLang => {
                    const selectedLangLower = selectedLang.toLowerCase();
                    return (freelancer.languages || []).some(freelancerLang =>
                        freelancerLang.toLowerCase() === selectedLangLower
                    );
                });
                if (!hasMatchingLanguage) return false;
            }

            // 6. Languages filter - FIXED: proper matching
            if (selectedLanguages.length > 0) {
                const hasMatchingLanguage = selectedLanguages.some(selectedLang => {
                    const selectedLangLower = selectedLang.toLowerCase();
                    return (freelancer.languages || []).some(freelancerLang =>
                        freelancerLang.toLowerCase() === selectedLangLower
                    );
                });
                if (!hasMatchingLanguage) return false;
            }

            // 7. Hourly rate filter
            if (filters.min_price || filters.max_price) {
                const rate = freelancer.hourlyRate || 0;
                if (filters.min_price && rate < parseInt(filters.min_price)) {
                    return false;
                }
                if (filters.max_price && rate > parseInt(filters.max_price)) {
                    return false;
                }
            }

            return true;
        });
    }, [filters, selectedSkills, selectedServices, selectedLanguages]);

    // Sort function
    const sortFreelancers = useCallback((freelancers) => {
        const sorted = [...freelancers];

        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'price-low':
                return sorted.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
            case 'price-high':
                return sorted.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
            case 'rating-high':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'hired-high':
                return sorted.sort((a, b) => (b.hired || 0) - (a.hired || 0));
            default:
                return sorted;
        }
    }, [sortBy]);

    // Fetch freelancers on mount (only once)
    useEffect(() => {
        fetchFreelancers();
    }, []);

    const fetchFreelancers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(); 
            params.append('page', 1);
            params.append('limit', 50); // Fetch more for client-side filtering

            const response = await axiosInstance.get(`/api/v1/users/freelancers/search?${params}`);

            if (response.data.success) {
                const { freelancers, pagination } = response.data.data;
                setAllFreelancers(freelancers);
                setFilteredFreelancers(freelancers);
                setTotalPages(pagination.pages);
            }
        } catch (error) {
            console.error('Error fetching freelancers:', error);
            toast.error('Failed to load freelancers');
        } finally {
            setLoading(false);
        }
    };

    // Apply filters and sorting whenever dependencies change (client-side only)
    useEffect(() => {
        if (allFreelancers.length > 0) {
            const filtered = filterFreelancers(allFreelancers);
            const sorted = sortFreelancers(filtered);
            setFilteredFreelancers(sorted);
            setCurrentPage(1); // Reset to first page when filters change
        }
    }, [allFreelancers, filterFreelancers, sortFreelancers]);

    // Handle search from URL on initial load (if any)
    useEffect(() => {
        const searchFromURL = searchParams.get('search');
        if (searchFromURL) {
            setFilters(prev => ({
                ...prev,
                search: searchFromURL
            }));
        }
    }, []); // Only runs once on mount

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
            freelancer_type: [],
            english_level: [],
            country: "",
            min_price: "",
            max_price: ""
        });
        setSelectedSkills([]);
        setSelectedServices([]);
        setSelectedLanguages([]);
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
    const currentFreelancers = filteredFreelancers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages_count = Math.ceil(filteredFreelancers.length / itemsPerPage);

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        // { value: "price-high", label: "Price: High to Low" },
        // { value: "price-low", label: "Price: Low to High" },
        // { value: "rating-high", label: "Rating: High to Low" },
        // { value: "hired-high", label: "Most Hired" }
    ];

    return (
        <Container>
            <div className="min-h-screen pt-24 md:pt-32 pb-16 bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-6 md:py-8">
                    <div className="container mx-auto">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Search Mentor</h1>
                        <p className="text-gray-600 mt-2">
                            {loading ? "Loading mentors..." : `${filteredFreelancers.length} mentor(s) found`}
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
                                selectedServices={selectedServices}
                                selectedLanguages={selectedLanguages}
                                setSelectedSkills={setSelectedSkills}
                                setSelectedServices={setSelectedServices}
                                setSelectedLanguages={setSelectedLanguages}
                                countries={countries}
                                skillsList={skillsList}
                                servicesList={servicesList}
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
                                        placeholder="Start your search"
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
                                    {loading ? "Loading..." : `Showing ${currentFreelancers.length} of ${filteredFreelancers.length} mentors`}
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

                            {/* Freelancers Grid/List */}
                            {loading ? (
                                // Loading Skeleton (keep as is)
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : currentFreelancers.length > 0 ? (
                                <>
                                    {viewMode === "grid" ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
                                            {currentFreelancers.map(freelancer => (
                                                <FreelancerProfileCard key={freelancer._id} freelancer={freelancer} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {currentFreelancers.map(freelancer => (
                                                <div key={freelancer._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                    <FreelancerProfileCard freelancer={freelancer} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {totalPages_count > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-8">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="px-3 py-1">
                                                Page {currentPage} of {totalPages_count}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages_count))}
                                                disabled={currentPage === totalPages_count}
                                                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 md:py-12">
                                    <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-medium text-gray-700 mb-2">No mentors found</h3>
                                    <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
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
                                selectedServices={selectedServices}
                                selectedLanguages={selectedLanguages}
                                setSelectedSkills={setSelectedSkills}
                                setSelectedServices={setSelectedServices}
                                setSelectedLanguages={setSelectedLanguages}
                                countries={countries}
                                skillsList={skillsList}
                                servicesList={servicesList}
                                filterData={filterData}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default AllFreelancers;