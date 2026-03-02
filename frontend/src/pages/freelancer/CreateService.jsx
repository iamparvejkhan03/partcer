import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    FileText,
    Tag,
    Package,
    Image as ImageIcon,
    Video,
    HelpCircle,
    ArrowLeft,
    ArrowRight,
    X,
    Plus,
    MapPin,
    Clock,
    DollarSign,
    Star,
    Upload,
    CheckCircle,
    Settings,
    Grid,
    Link as LinkIcon
} from "lucide-react";
import { RTE, Container, FreelancerSidebar, FreelancerHeader, FreelancerContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import useCountryStates from '../../hooks/useCountryStates';

const CreateService = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [packages, setPackages] = useState([
        {
            title: 'Basic',
            description: 'Basic service package',
            deliveryTime: 3,
            price: 50,
            isFeatured: true,
            revisions: 0, // 0 means unlimited
            features: [],
            featureInput: ''
        }
    ]);
    const [extraOffers, setExtraOffers] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);

    // Fetch countries on component mount - use useCallback for the fetch function
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                const data = await countriesAPI();
                // Sort countries alphabetically by name
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

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        getValues,
        control,
        formState: { errors }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            title: '',
            category: '',
            subCategory: '',
            location: 'remote',
            description: '',
            videoLink: '',
            requirements: ''
        }
    });

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (selectedCategory) {
            fetchSubCategories(selectedCategory);
        }
    }, [selectedCategory]);

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, [galleryPreviews]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            // Use the public endpoint for parent categories
            const response = await axiosInstance.get('/api/v1/categories/public/parents');

            if (response.data.success) {
                // Make sure we're setting an array
                const categoriesData = response.data.data || [];
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            toast.error('Failed to load categories');
            setCategories([]); // Set empty array on error
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            setSubCategories([]);

            const response = await axiosInstance.get(`/api/v1/categories/public/${categoryId}/subcategories`);

            if (response.data?.success) {
                // Your API returns { parent, subcategories } structure
                const subCats = response.data.data?.subcategories || [];
                setSubCategories(Array.isArray(subCats) ? subCats : []);
            } else {
                console.log('Success false, setting empty array');
                setSubCategories([]);
            }
        } catch (err) {
            console.error('Error fetching subcategories:', err);
            console.log('Error response:', err.response?.data);
            console.log('Error status:', err.response?.status);
            setSubCategories([]);

            if (err.response?.status !== 404) {
                toast.error('Failed to load subcategories');
            }
        }
    };

    const nextStep = async () => {
        let isValid = true;

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        if (step === 1) {
            // Validate basic info
            const fieldsToValidate = ['title', 'category', 'description'];
            isValid = await trigger(fieldsToValidate);

            if (!selectedCategory) {
                toast.error('Please select a category');
                isValid = false;
            }

            // Validate title length
            const title = getValues('title');
            if (title && title.length < 10) {
                toast.error('Title must be at least 10 characters');
                isValid = false;
            }
        }

        if (step === 2) {
            // Validate packages
            if (packages.length === 0) {
                toast.error('Please add at least one service package');
                isValid = false;
            } else {
                // Validate each package
                for (let i = 0; i < packages.length; i++) {
                    const pkg = packages[i];
                    if (!pkg.title || !pkg.description || !pkg.deliveryTime || !pkg.price) {
                        toast.error(`Please fill all required fields in package ${i + 1}`);
                        isValid = false;
                        break;
                    }
                    if (pkg.price < 0) {
                        toast.error(`Package ${i + 1} price cannot be negative`);
                        isValid = false;
                        break;
                    }
                }

                // Check for duplicate package titles
                const titles = packages.map(p => p.title.toLowerCase());
                if (new Set(titles).size !== titles.length) {
                    toast.error('Package titles must be unique');
                    isValid = false;
                }

                // Check featured packages
                const featuredCount = packages.filter(p => p.isFeatured).length;
                if (featuredCount > 1) {
                    toast.error('Only one package can be featured');
                    isValid = false;
                }
            }
        }

        if (step === 3) {
            // Validate gallery if images are uploaded
            if (galleryImages.length === 0) {
                toast.error('Please add at least one gallery image');
                isValid = false;
            }

            // Validate video link if provided
            const videoLink = getValues('videoLink');
            if (videoLink) {
                const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
                if (!youtubeRegex.test(videoLink)) {
                    toast.error('Please enter a valid YouTube URL');
                    isValid = false;
                }
            }

            // Validate tags
            if (selectedTags.length === 0) {
                toast.error('Please add at least one tag');
                isValid = false;
            }
            if (selectedTags.length > 5) {
                toast.error('Maximum 5 tags allowed');
                isValid = false;
            }
        }

        if (!isValid) {
            return;
        }

        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleGalleryUpload = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            toast.error('Only JPG, PNG, GIF, and WebP images are allowed');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
            toast.error('Each image must be less than 5MB');
            return;
        }

        // Limit to 10 images
        if (galleryImages.length + files.length > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }

        // Create preview URLs
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setGalleryPreviews([...galleryPreviews, ...newPreviews]);
        setGalleryImages([...galleryImages, ...files]);
    };

    const removeGalleryImage = (index) => {
        // Revoke the preview URL to free memory
        URL.revokeObjectURL(galleryPreviews[index]);

        const newImages = [...galleryImages];
        const newPreviews = [...galleryPreviews];
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        setGalleryImages(newImages);
        setGalleryPreviews(newPreviews);
    };

    const addPackage = () => {
        if (packages.length >= 3) {
            toast.error('Maximum 3 packages allowed');
            return;
        }

        const packageNames = ['Standard', 'Premium', 'Deluxe'];
        const newPackage = {
            title: packageNames[packages.length] || `Package ${packages.length + 1}`,
            description: '',
            deliveryTime: 3,
            price: 0,
            isFeatured: false,
            revisions: 0,
            features: [],
            featureInput: ''
        };
        setPackages([...packages, newPackage]);
    };

    const updatePackage = (index, field, value) => {
        const updatedPackages = [...packages];
        updatedPackages[index] = {
            ...updatedPackages[index],
            [field]: value
        };

        // If this package is marked as featured, unfeature others
        if (field === 'isFeatured' && value) {
            updatedPackages.forEach((pkg, i) => {
                if (i !== index) {
                    updatedPackages[i].isFeatured = false;
                }
            });
        }

        setPackages(updatedPackages);
    };

    const addPackageFeature = (index) => {
        const pkg = packages[index];
        if (pkg.featureInput && pkg.featureInput.trim()) {
            const updatedPackages = [...packages];
            const newFeatures = [...(updatedPackages[index].features || []), pkg.featureInput.trim()];
            updatedPackages[index] = {
                ...updatedPackages[index],
                features: newFeatures,
                featureInput: ''
            };
            setPackages(updatedPackages);
        }
    };

    const removePackageFeature = (pkgIndex, featureIndex) => {
        const updatedPackages = [...packages];
        const newFeatures = updatedPackages[pkgIndex].features.filter((_, i) => i !== featureIndex);
        updatedPackages[pkgIndex] = {
            ...updatedPackages[pkgIndex],
            features: newFeatures
        };
        setPackages(updatedPackages);
    };

    const removePackage = (index) => {
        if (packages.length === 1) {
            toast.error('At least one package is required');
            return;
        }
        setPackages(packages.filter((_, i) => i !== index));
    };

    const addExtraOffer = () => {
        const newOffer = {
            title: '',
            description: '',
            price: 0,
            deliveryTime: 1
        };
        setExtraOffers([...extraOffers, newOffer]);
    };

    const updateExtraOffer = (index, field, value) => {
        const updatedOffers = [...extraOffers];
        updatedOffers[index] = {
            ...updatedOffers[index],
            [field]: value
        };
        setExtraOffers(updatedOffers);
    };

    const removeExtraOffer = (index) => {
        setExtraOffers(extraOffers.filter((_, i) => i !== index));
    };

    const addFaq = () => {
        const newFaq = {
            question: '',
            answer: ''
        };
        setFaqs([...faqs, newFaq]);
    };

    const updateFaq = (index, field, value) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index] = {
            ...updatedFaqs[index],
            [field]: value
        };
        setFaqs(updatedFaqs);
    };

    const removeFaq = (index) => {
        setFaqs(faqs.filter((_, i) => i !== index));
    };

    const addTag = (tag) => {
        if (!tag || tag.trim() === '') return;

        if (selectedTags.length >= 5) {
            toast.error('Maximum 5 tags allowed');
            return;
        }

        // Check for duplicates (case insensitive)
        if (selectedTags.some(s => s.toLowerCase() === tag.toLowerCase())) {
            toast.error('Tag already added');
            return;
        }

        setSelectedTags([...selectedTags, tag.trim()]);
    };

    const removeTag = (index) => {
        setSelectedTags(selectedTags.filter((_, i) => i !== index));
    };

    const createServiceHandler = async (formData) => {
        try {
            setIsLoading(true);

            // Prepare the data
            const serviceData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                subCategory: formData.subCategory || undefined,
                location: formData.location || 'remote',
                videoLink: formData.videoLink || '',
                requirements: formData.requirements || '',
                tags: selectedTags,
                packages: packages.map(pkg => ({
                    title: pkg.title,
                    description: pkg.description,
                    price: Number(pkg.price),
                    deliveryTime: Number(pkg.deliveryTime),
                    revisions: pkg.revisions ? Number(pkg.revisions) : 0,
                    features: pkg.features || [],
                    isFeatured: pkg.isFeatured || false
                })),
                extraOffers: extraOffers.map(offer => ({
                    title: offer.title,
                    description: offer.description || '',
                    price: Number(offer.price),
                    deliveryTime: Number(offer.deliveryTime)
                })),
                faqs: faqs.map(faq => ({
                    question: faq.question,
                    answer: faq.answer
                }))
            };

            // Create FormData for file uploads
            const formDataObj = new FormData();
            formDataObj.append('data', JSON.stringify(serviceData));

            // Append gallery images
            galleryImages.forEach((image) => {
                formDataObj.append('gallery', image);
            });

            const response = await axiosInstance.post('/api/v1/services', formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                toast.success('Service created successfully!');

                // Redirect based on action
                if (formData.action === 'publish') {
                    navigate('/freelancer/services/all');
                } else {
                    navigate('/freelancer/services/all');
                }
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to create service';
            toast.error(errorMessage);
            console.error('Create service error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveAsDraft = async () => {
        // Get current form values
        const formData = getValues();

        try {
            setIsLoading(true);

            const serviceData = {
                title: formData.title || 'Untitled Service',
                description: formData.description || '',
                category: formData.category || null,
                subCategory: formData.subCategory || undefined,
                location: formData.location || 'remote',
                videoLink: formData.videoLink || '',
                requirements: formData.requirements || '',
                tags: selectedTags,
                packages: packages.map(pkg => ({
                    title: pkg.title,
                    description: pkg.description,
                    price: Number(pkg.price),
                    deliveryTime: Number(pkg.deliveryTime),
                    revisions: pkg.revisions ? Number(pkg.revisions) : 0,
                    features: pkg.features || [],
                    isFeatured: pkg.isFeatured || false
                })),
                extraOffers: extraOffers.map(offer => ({
                    title: offer.title,
                    description: offer.description || '',
                    price: Number(offer.price),
                    deliveryTime: Number(offer.deliveryTime)
                })),
                faqs: faqs.map(faq => ({
                    question: faq.question,
                    answer: faq.answer
                }))
            };

            const formDataObj = new FormData();
            formDataObj.append('data', JSON.stringify(serviceData));

            galleryImages.forEach((image) => {
                formDataObj.append('gallery', image);
            });

            const response = await axiosInstance.post('/api/v1/services', formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                toast.success('Service saved as draft!');
                navigate('/seller/services/drafts');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to save draft';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { number: 1, label: 'Basic Info', icon: FileText },
        { number: 2, label: 'Pricing', icon: DollarSign },
        { number: 3, label: 'Gallery & FAQ', icon: ImageIcon }
    ];

    return (
        <section className="flex min-h-screen bg-gray-50">
            <FreelancerSidebar />
            <div className="flex-1">
                <FreelancerHeader />
                <FreelancerContainer>
                    {/* Header */}
                    <div className="mb-8 mt-20 md:mt-0">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Create New Service
                        </h1>
                        <p className="text-gray-600">
                            Offer your skills and services to clients worldwide
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

                    <form onSubmit={handleSubmit(createServiceHandler)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

                        {/* Step 1: Basic Information */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <FileText className="mr-2" size={24} />
                                        Service Information
                                    </h2>

                                    {/* Title */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Title *
                                        </label>
                                        <input
                                            {...register('title', {
                                                required: 'Title is required',
                                                minLength: {
                                                    value: 10,
                                                    message: 'Title must be at least 10 characters'
                                                },
                                                maxLength: {
                                                    value: 200,
                                                    message: 'Title cannot exceed 200 characters'
                                                }
                                            })}
                                            type="text"
                                            placeholder="e.g., I will design professional website UI/UX"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Describe your service clearly and attractively (10-200 characters)
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
                                                <option value="">Select Category</option>
                                                {Array.isArray(categories) && categories.map((category) => (
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
                                                Sub-category
                                            </label>
                                            <select
                                                {...register('subCategory')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={!selectedCategory || subCategories.length === 0}
                                            >
                                                <option value="">Select Sub-category</option>
                                                {subCategories.map((subCategory) => (
                                                    <option key={subCategory._id} value={subCategory._id}>
                                                        {subCategory.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Location
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <select
                                                {...register('location')}
                                                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={loadingCountries}
                                            >
                                                <option value="remote">🌍 Remote (Worldwide)</option>
                                                <optgroup label="Popular Countries">
                                                    <option value="US">🇺🇸 United States</option>
                                                    <option value="GB">🇬🇧 United Kingdom</option>
                                                    <option value="CA">🇨🇦 Canada</option>
                                                    <option value="AU">🇦🇺 Australia</option>
                                                    <option value="IN">🇮🇳 India</option>
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
                                    </div>

                                    {/* Description */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Description *
                                        </label>
                                        <RTE
                                            name="description"
                                            control={control}
                                            label="Description:"
                                            defaultValue={getValues('description') || ''}
                                            placeholder="Describe your service in detail. What will the client get? What makes you the best choice?"
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tags (Max 5) *
                                        </label>

                                        {/* Tag Input Field */}
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                placeholder="Type a tag and press Enter or comma"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ',') {
                                                        e.preventDefault();
                                                        addTag(e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                disabled={!selectedCategory}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Press Enter or comma to add tags. You can add up to 5 tags.
                                            </p>
                                        </div>

                                        {/* Selected tags Display */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {selectedTags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-sm"
                                                >
                                                    <Tag size={14} />
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(index)}
                                                        className="ml-1 hover:text-red-200"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Requirements */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Client Requirements
                                        </label>
                                        <textarea
                                            {...register('requirements')}
                                            rows={4}
                                            placeholder="What information or materials do you need from the client to get started?"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Optional: Specify what you need from clients before starting
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Pricing & Packages */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <DollarSign className="mr-2" size={24} />
                                        Pricing & Packages
                                    </h2>

                                    {/* Service Packages */}
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Service Packages *
                                            </label>
                                            {packages.length < 3 && (
                                                <button
                                                    type="button"
                                                    onClick={addPackage}
                                                    className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium"
                                                >
                                                    <Plus size={16} />
                                                    Add Package
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            {packages.map((pkg, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-6">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg font-semibold text-gray-900">
                                                                Package {index + 1}
                                                            </span>
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pkg.isFeatured}
                                                                    onChange={(e) => updatePackage(index, 'isFeatured', e.target.checked)}
                                                                    className="mr-2"
                                                                />
                                                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                                                    <Star size={14} className={pkg.isFeatured ? 'text-yellow-500' : 'text-gray-400'} />
                                                                    Featured Package
                                                                </span>
                                                            </label>
                                                        </div>
                                                        {packages.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removePackage(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X size={20} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Package Title *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={pkg.title}
                                                                onChange={(e) => updatePackage(index, 'title', e.target.value)}
                                                                placeholder="e.g., Basic, Standard, Premium"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Price ($) *
                                                            </label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                                <input
                                                                    type="number"
                                                                    value={pkg.price}
                                                                    onChange={(e) => updatePackage(index, 'price', parseFloat(e.target.value) || 0)}
                                                                    min="0"
                                                                    step="0.01"
                                                                    className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Delivery Time (Days) *
                                                            </label>
                                                            <div className="relative">
                                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                                <input
                                                                    type="number"
                                                                    value={pkg.deliveryTime}
                                                                    onChange={(e) => updatePackage(index, 'deliveryTime', parseInt(e.target.value) || 1)}
                                                                    min="1"
                                                                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Number of Revisions
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={pkg.revisions}
                                                                onChange={(e) => updatePackage(index, 'revisions', parseInt(e.target.value) || 0)}
                                                                min="0"
                                                                placeholder="0 = Unlimited"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">Enter 0 for unlimited revisions</p>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Description *
                                                        </label>
                                                        <textarea
                                                            value={pkg.description}
                                                            onChange={(e) => updatePackage(index, 'description', e.target.value)}
                                                            rows={3}
                                                            placeholder="What's included in this package?"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Features
                                                        </label>

                                                        {/* Features Input with Add Button */}
                                                        <div className="mb-3">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={pkg.featureInput || ''}
                                                                    onChange={(e) => updatePackage(index, 'featureInput', e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addPackageFeature(index);
                                                                        }
                                                                    }}
                                                                    placeholder="Add a feature and press Enter"
                                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addPackageFeature(index)}
                                                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Features List */}
                                                        {pkg.features && pkg.features.length > 0 && (
                                                            <div className="space-y-2">
                                                                {pkg.features.map((feature, featureIndex) => (
                                                                    <div key={featureIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                                        <div className="flex items-center gap-2">
                                                                            <CheckCircle size={16} className="text-green-500" />
                                                                            <span>{feature}</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removePackageFeature(index, featureIndex)}
                                                                            className="text-red-500 hover:text-red-700"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Feature Suggestions */}
                                                        <div className="mt-3">
                                                            <p className="text-xs text-gray-500 mb-2">Common features:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {['Source Files', 'Responsive Design', 'Unlimited Revisions', 'Fast Delivery', 'SEO Optimized', 'Mobile Friendly']
                                                                    .filter(f => !pkg.features?.includes(f))
                                                                    .map((suggestion) => (
                                                                        <button
                                                                            type="button"
                                                                            key={suggestion}
                                                                            onClick={() => {
                                                                                const updatedPackages = [...packages];
                                                                                const newFeatures = [...(updatedPackages[index].features || []), suggestion];
                                                                                updatedPackages[index] = {
                                                                                    ...updatedPackages[index],
                                                                                    features: newFeatures
                                                                                };
                                                                                setPackages(updatedPackages);
                                                                            }}
                                                                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                                                                        >
                                                                            + {suggestion}
                                                                        </button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Extra Offers */}
                                    {/* <div className="mb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Extra Offers & Add-ons
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addExtraOffer}
                                                className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium"
                                            >
                                                <Plus size={16} />
                                                Add Extra Offer
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {extraOffers.map((offer, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="font-medium">Extra Offer {index + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExtraOffer(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <input
                                                            type="text"
                                                            value={offer.title}
                                                            onChange={(e) => updateExtraOffer(index, 'title', e.target.value)}
                                                            placeholder="Offer title"
                                                            className="px-3 py-2 border border-gray-300 rounded"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={offer.description}
                                                            onChange={(e) => updateExtraOffer(index, 'description', e.target.value)}
                                                            placeholder="Description"
                                                            className="px-3 py-2 border border-gray-300 rounded"
                                                        />
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                            <input
                                                                type="number"
                                                                value={offer.price}
                                                                onChange={(e) => updateExtraOffer(index, 'price', parseFloat(e.target.value) || 0)}
                                                                placeholder="Price"
                                                                min="0"
                                                                step="0.01"
                                                                className="w-full pl-8 px-3 py-2 border border-gray-300 rounded"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <label className="block text-sm text-gray-600 mb-1">
                                                            Delivery Time (Days)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={offer.deliveryTime}
                                                            onChange={(e) => updateExtraOffer(index, 'deliveryTime', parseInt(e.target.value) || 1)}
                                                            min="1"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {extraOffers.length === 0 && (
                                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                                <Package className="mx-auto text-gray-300 mb-2" size={32} />
                                                <p className="text-gray-500">No extra offers added</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Add optional services clients can purchase
                                                </p>
                                            </div>
                                        )}
                                    </div> */}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Gallery & FAQ */}
                        {step === 3 && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <Grid className="mr-2" size={24} />
                                        Gallery & FAQ
                                    </h2>

                                    {/* Gallery */}
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-gray-700 mb-4">
                                            Gallery Images (Max 10) *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleGalleryUpload}
                                                className="hidden"
                                                id="gallery-upload"
                                            />
                                            <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center">
                                                <Upload size={48} className="text-gray-400 mb-3" />
                                                <p className="text-gray-600 mb-2">
                                                    Drag & drop images or click to browse
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Upload high-quality images showcasing your work
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Supported formats: JPG, PNG, GIF, WebP • Max 5MB each
                                                </p>
                                            </label>
                                        </div>

                                        {galleryImages.length > 0 && (
                                            <div className="mt-6">
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                    {galleryPreviews.map((preview, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={preview}
                                                                alt={`Gallery ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeGalleryImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                            {index === 0 && (
                                                                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs text-center py-1 rounded-b-lg">
                                                                    Main Image
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    First image will be used as the main thumbnail
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Video Link */}
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Video Link (Optional)
                                        </label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                {...register('videoLink', {
                                                    pattern: {
                                                        value: /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                                                        message: 'Please enter a valid YouTube URL'
                                                    }
                                                })}
                                                type="url"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                        {errors.videoLink && (
                                            <p className="text-red-500 text-sm mt-1">{errors.videoLink.message}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Add a YouTube video showcasing your work or skills
                                        </p>
                                    </div>

                                    {/* FAQ */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Frequently Asked Questions
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addFaq}
                                                className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium"
                                            >
                                                <Plus size={16} />
                                                Add FAQ
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {faqs.map((faq, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="font-medium">FAQ {index + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFaq(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Question
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={faq.question}
                                                                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                                placeholder="What clients usually ask?"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Answer
                                                            </label>
                                                            <textarea
                                                                value={faq.answer}
                                                                onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                                                rows={2}
                                                                placeholder="Provide a clear and helpful answer"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {faqs.length === 0 && (
                                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                                <HelpCircle className="mx-auto text-gray-300 mb-2" size={32} />
                                                <p className="text-gray-500">No FAQs added yet</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Add common questions to help clients understand your service better
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-8 border-t border-gray-200">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    <ArrowLeft size={18} />
                                    Previous
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                                >
                                    Continue
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    {/* <button
                                        type="button"
                                        onClick={saveAsDraft}
                                        disabled={isLoading}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                    >
                                        Save as Draft
                                    </button> */}
                                    <button
                                        type="submit"
                                        name="action"
                                        value="publish"
                                        disabled={isLoading}
                                        className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                                Publishing...
                                            </span>
                                        ) : (
                                            'Publish Service'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Tips Section */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                            <Settings size={18} />
                            Tips for Success
                        </h3>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                            <li>Use clear, high-quality images that showcase your work</li>
                            <li>Write a detailed description with what clients will receive</li>
                            <li>Price your services competitively based on your experience</li>
                            <li>Set realistic delivery times to avoid delays</li>
                            <li>Add relevant tags to help clients find your service</li>
                            <li>The first image will be used as the main thumbnail</li>
                        </ul>
                    </div>
                </FreelancerContainer>
            </div>
        </section>
    );
};

export default CreateService;