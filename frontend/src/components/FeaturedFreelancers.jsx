import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, X, ChevronDown, Check } from 'lucide-react';
import { Container, Subheading, Heading, HeadingDescription } from '../components';
import FreelancerProfileCard from '../components/FreelancerProfileCard';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

// Services Select Component (similar to your profile page)
const ServicesFilter = ({ selectedServices, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    // Available services - you can fetch from API or use static list
    const allServices = [
        "Job Support (Mentoring)",
        "Skill Training",
        "Mock Interview Support"
    ];

    const filteredServices = allServices.filter(service =>
        service.toLowerCase().includes(search.toLowerCase())
    );

    const toggleService = (service) => {
        if (selectedServices.includes(service)) {
            onChange(selectedServices.filter(s => s !== service));
        } else {
            onChange([...selectedServices, service]);
        }
        setIsOpen(false)
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Service
            </label>

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
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
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

            {selectedServices?.length > 0 && <div className="flex flex-wrap gap-2 my-2 min-h-[32px]">
                {selectedServices.map((service, index) => (
                    <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
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
            </div>}
        </div>
    );
};

// Categories Select Component (similar to your profile page)
const CategoriesFilter = ({ selectedCategories, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);
    const [allCategories, setAllCategories] = useState([]);


    // Fetch skill suggestions from your API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/categories/public/parents');
                if (response.data.success) {
                    setAllCategories(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();

    }, []);

    const filteredCategories = allCategories.filter(category =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleCategory = (category) => {
        if (selectedCategories.includes(category)) {
            onChange(selectedCategories.filter(c => c !== category));
        } else {
            onChange([...selectedCategories, category]);
        }
        setIsOpen(false)
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent flex justify-between items-center"
            >
                <span className="text-gray-500">Select Categories</span>
                <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b sticky top-0 bg-white z-10">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="py-1">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category, index) => (
                                <div
                                    key={index}
                                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${selectedCategories.includes(category?.name) ? 'bg-blue-50' : ''}`}
                                    onClick={() => toggleCategory(category?.name)}
                                >
                                    <span>{category?.name}</span>
                                    {selectedCategories.includes(category?.name) && (
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
    );
};

// Skills Filter Component (with chips that add on Enter or Search button click)
const SkillsFilter = ({ selectedSkills, onChange }) => {
    const [skillInput, setSkillInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch skill suggestions from your API
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/v1/skills/public');
                if (response.data?.success) {
                    setSuggestions(Array.isArray(response.data.data) ? response.data.data.map(s => s.name) : []);
                }
            } catch (error) {
                console.error('Error fetching skills:', error);
                // Fallback skills
                setSuggestions([
                    "Python", "JavaScript", "React", "Node.js", "Java", "SQL",
                    "AWS", "Docker", "Kubernetes", "MongoDB", "PostgreSQL",
                    "TypeScript", "Angular", "Vue.js", "Django", "Flask",
                    "Spring Boot", "C++", "C#", "PHP", "Ruby on Rails"
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);

    // Filter suggestions based on input
    const getFilteredSuggestions = () => {
        if (!skillInput.trim()) return [];
        return suggestions.filter(skill =>
            skill.toLowerCase().includes(skillInput.toLowerCase()) &&
            !selectedSkills.includes(skill)
        );
    };

    const addSkill = (skill) => {
        const trimmedSkill = skill.trim();
        if (trimmedSkill && !selectedSkills.includes(trimmedSkill)) {
            onChange([...selectedSkills, trimmedSkill]);
        }
        setSkillInput("");
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (skillInput.trim()) {
                addSkill(skillInput);
            }
        }
    };

    const handleSearchClick = () => {
        if (skillInput.trim()) {
            addSkill(skillInput);
        }
    };

    const removeSkill = (skillToRemove) => {
        onChange(selectedSkills.filter(skill => skill !== skillToRemove));
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Skill
            </label>

            {/* Input with Search Button */}
            <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => {
                            setSkillInput(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Type a skill and press Enter or click Search..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && skillInput.trim() && getFilteredSuggestions().length > 0 && (
                        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            <div className="py-1">
                                {getFilteredSuggestions().map((skill, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => addSkill(skill)}
                                    >
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleSearchClick}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <Search size={16} />
                    Search
                </button>
            </div>
        </div>
    );
};

// Active Filters Component
const ActiveFilters = ({ filters, onRemove, onClearAll }) => {
    const { searchQuery, services, skills, categories } = filters;
    const hasActiveFilters = searchQuery || services.length > 0 || skills.length > 0 || categories.length > 0;

    if (!hasActiveFilters) return null;

    return (
        <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                        <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            <span>Search: "{searchQuery}"</span>
                            <button
                                onClick={() => onRemove('search')}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {services.map((service, index) => (
                        <div key={`service-${index}`} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            <span>{service}</span>
                            <button
                                onClick={() => onRemove('service', service)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {skills.map((skill, index) => (
                        <div key={`skill-${index}`} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            <span>{skill}</span>
                            <button
                                onClick={() => onRemove('skill', skill)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {categories.map((category, index) => (
                        <div key={`category-${index}`} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            <span>{category}</span>
                            <button
                                onClick={() => onRemove('category', category)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={onClearAll}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Clear all
                </button>
            </div>
        </div>
    );
};

const FeaturedFreelancers = () => {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchFreelancers = async () => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams();
            params.append('limit', '10');
            params.append('sortBy', 'rating');
            params.append('sortOrder', 'desc');

            // Add search query
            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }

            // Add services filter (using skills array since services are part of skills in your model)
            if (selectedServices.length > 0) {
                selectedServices.forEach(service => {
                    params.append('service', service);
                });
            }

            // Add categories filter (using selectedCategories array)
            if (selectedCategories.length > 0) {
                selectedCategories.forEach(category => {
                    params.append('category', category);
                });
            }

            // Add skills filter
            if (selectedSkills.length > 0) {
                selectedSkills.forEach(skill => {
                    params.append('skill', skill);
                });
            }

            const response = await axiosInstance.get(`/api/v1/users/freelancers/search?${params.toString()}`);

            if (response.data?.success) {
                setFreelancers(response.data.data.freelancers || []);
            }
        } catch (error) {
            console.error('Error fetching mentors:', error);
            toast.error('Failed to load mentors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFreelancers();
    }, [debouncedSearch, selectedServices, selectedCategories, selectedSkills]);

    const handleRemoveFilter = (type, value) => {
        if (type === 'search') {
            setSearchQuery('');
            setDebouncedSearch('');
        } else if (type === 'service') {
            setSelectedServices(selectedServices.filter(s => s !== value));
        } else if (type === 'skill') {
            setSelectedSkills(selectedSkills.filter(s => s !== value));
        } else if (type === 'category') {
            setSelectedCategories(selectedCategories.filter(c => c !== value));
        }
    };

    const handleClearAllFilters = () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setSelectedServices([]);
        setSelectedSkills([]);
        setSelectedCategories([]);
    };

    const hasActiveFilters = searchQuery || selectedServices.length > 0 || selectedSkills.length > 0 || selectedCategories.length > 0;

    if (loading && freelancers.length === 0) {
        return (
            <Container className="pt-8">
                <Subheading content="Skill-Based Approach" />
                <Heading content="Learn from Industry Experts" />
                <HeadingDescription content="Browse our pool of talented mentors offering job training across tech roles. Find the perfect expert for your specific career goals." />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
                        </div>
                    ))}
                </div>
            </Container>
        );
    }

    return (
        <Container className="pt-8">
            <Subheading content="Skill-Based Approach" />
            <Heading content="Learn from Industry Experts" />
            <HeadingDescription content="Browse our pool of talented mentors offering job training across tech roles. Find the perfect expert for your specific career goals." />

            {/* Search and Filters Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 my-5">
                {/* Search Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Mentors
                    </label>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by mentor name, skill, description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ServicesFilter
                        selectedServices={selectedServices}
                        onChange={setSelectedServices}
                    />
                    <CategoriesFilter
                        selectedCategories={selectedCategories}
                        onChange={setSelectedCategories}
                    />
                    <SkillsFilter
                        selectedSkills={selectedSkills}
                        onChange={setSelectedSkills}
                    />
                </div>

                {/* Active Filters */}
                <ActiveFilters
                    filters={{
                        searchQuery,
                        services: selectedServices,
                        skills: selectedSkills,
                        categories: selectedCategories
                    }}
                    onRemove={handleRemoveFilter}
                    onClearAll={handleClearAllFilters}
                />
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{freelancers.length}</span> mentors
                    {hasActiveFilters && " matching your filters"}
                </p>
            </div>

            {/* Mentors Grid */}
            {freelancers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 py-4">
                    {freelancers.map((freelancer) => (
                        <FreelancerProfileCard key={freelancer._id} freelancer={freelancer} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No mentors found matching your criteria.</p>
                    <button
                        onClick={handleClearAllFilters}
                        className="mt-4 text-primary hover:text-primary-dark font-medium"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Explore More Button */}
            {freelancers.length > 0 && (
                <div className="flex justify-center mt-8">
                    <Link
                        to="/freelancers"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark hover:shadow-lg transition-all duration-300 group"
                    >
                        <span>Explore More</span>
                        <ChevronRight
                            size={20}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </Link>
                </div>
            )}
        </Container>
    );
};

export default FeaturedFreelancers;