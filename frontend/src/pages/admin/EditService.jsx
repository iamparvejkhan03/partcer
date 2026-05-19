import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { RTE } from '../../components';
import {
    Briefcase,
    Save,
    X,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Shield,
    Upload,
    Camera,
    ChevronDown,
    Search,
    Check,
    Wrench,
    DollarSign,
    MapPin,
    Globe,
    Tag,
    Layers,
    Eye,
    Edit,
    Trash2,
    Award,
    Users,
    Star,
    TrendingUp,
    Eye as ViewIcon,
    MessageSquare,
    Ban,
    RefreshCw,
    Plus,
    Copy,
    FileText,
    Calendar,
    HelpCircle,
    PauseCircle,
    PlayCircle,
    Flag,
    ShieldAlert,
    Loader
} from "lucide-react";
import { AdminSidebar, AdminHeader, AdminContainer } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import useCountryStates from '../../hooks/useCountryStates';
import { dummyUserImg } from '../../assets';

const EditService = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [selectedTags, setSelectedTags] = useState([]);
    const [packages, setPackages] = useState([]);
    const [extraOffers, setExtraOffers] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
    const [existingGalleryImages, setExistingGalleryImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [moderationNotes, setModerationNotes] = useState('');
    const [stats, setStats] = useState({
        views: 0,
        clicks: 0,
        orders: 0,
        revenue: 0,
        rating: 0,
        reviews: 0,
        reports: 0
    });
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

    const {
        register,
        handleSubmit,
        watch,
        setValue,
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
            location: '',
            description: '',
            videoLink: '',
            requirements: '',
            status: 'pending',
            featured: false,
            rejectionReason: ''
        }
    });

    const statusWatch = watch('status');
    const featuredWatch = watch('featured');

    useEffect(() => {
        fetchServiceData();
        fetchCategories();
        fetchTags();
    }, [serviceId]);

    const fetchServiceData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/services/admin/${serviceId}/edit`);

            if (response.data?.success) {
                const service = response.data.data;

                // Set form values
                reset({
                    title: service.title,
                    category: service.category?._id || service.category,
                    subCategory: service.subCategory?._id || service.subCategory || '',
                    location: service.location || 'remote',
                    description: service.description,
                    videoLink: service.videoLink || '',
                    requirements: service.requirements || '',
                    status: service.status,
                    featured: service.featured || false,
                    rejectionReason: service.rejectionReason || ''
                });

                setSelectedCategory(service.category?._id || service.category);
                setSelectedTags(service.tags || []);
                setPackages(service.packages?.map(pkg => ({ ...pkg, featureInput: '' })) || []);
                setExtraOffers(service.extraOffers || []);
                setFaqs(service.faqs || []);
                setExistingGalleryImages(service.gallery?.map(img => ({
                    ...img,
                    id: img._id || img.publicId || Math.random(),
                    isExisting: true
                })) || []);
                setSellerInfo(service.seller);

                setStats({
                    views: service.views || 0,
                    clicks: service.clicks || 0,
                    orders: service.totalOrders || 0,
                    revenue: service.totalRevenue || 0,
                    rating: service.rating || 0,
                    reviews: service.reviewCount || 0,
                    reports: service.reports || 0
                });

                // Fetch subcategories if category exists
                if (service.category?._id || service.category) {
                    fetchSubCategories(service.category?._id || service.category);
                }
            }
        } catch (error) {
            console.error('Error fetching service:', error);
            toast.error(error.response?.data?.message || 'Failed to load service data');
            navigate('/admin/services');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/categories/public/parents');
            if (response.data?.success) {
                setCategories(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/skills/public');
            if (response.data?.success) {
                setTags(response.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching tags:', err);
        }
    };

    const fetchSubCategories = async (categoryId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/categories/public/${categoryId}/subcategories`);
            if (response.data?.success) {
                const subCats = response.data.data?.subcategories || response.data.data || [];
                setSubCategories(Array.isArray(subCats) ? subCats : []);

                // Set subcategory value after options are loaded
                const currentSubCat = getValues('subCategory');
                if (currentSubCat) {
                    setTimeout(() => {
                        setValue('subCategory', currentSubCat);
                    }, 100);
                }
            }
        } catch (err) {
            console.error('Error fetching subcategories:', err);
            setSubCategories([]);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingGalleryImages.length + galleryImages.length + files.length;

        if (totalImages > 10) {
            toast.error('Maximum 10 images allowed');
            return;
        }

        // Validate file types and size
        const validFiles = files.filter(file => {
            const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
            if (!isValidType) toast.error(`${file.name} is not a valid image type`);
            if (!isValidSize) toast.error(`${file.name} exceeds 5MB`);
            return isValidType && isValidSize;
        });

        setGalleryImages([...galleryImages, ...validFiles]);
    };

    const removeExistingImage = (index) => {
        const imageToRemove = existingGalleryImages[index];
        setRemovedImages([...removedImages, imageToRemove._id || imageToRemove.publicId]);
        setExistingGalleryImages(existingGalleryImages.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setGalleryImages(galleryImages.filter((_, i) => i !== index));
    };

    const addPackage = () => {
        if (packages.length >= 3) {
            toast.error('Maximum 3 packages allowed');
            return;
        }
        const newPackage = {
            id: Date.now(),
            title: '',
            description: '',
            deliveryTime: 3,
            price: 0,
            isFeatured: false,
            features: [],
            revisions: 0,
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

        if (field === 'isFeatured' && value) {
            updatedPackages.forEach((pkg, i) => {
                if (i !== index) {
                    pkg.isFeatured = false;
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
        updatedPackages[pkgIndex].features = updatedPackages[pkgIndex].features.filter((_, i) => i !== featureIndex);
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
            id: Date.now(),
            title: '',
            description: '',
            price: 0,
            deliveryTime: 1
        };
        setExtraOffers([...extraOffers, newOffer]);
    };

    const updateExtraOffer = (index, field, value) => {
        const updatedOffers = [...extraOffers];
        updatedOffers[index][field] = value;
        setExtraOffers(updatedOffers);
    };

    const removeExtraOffer = (index) => {
        setExtraOffers(extraOffers.filter((_, i) => i !== index));
    };

    const addFaq = () => {
        const newFaq = {
            id: Date.now(),
            question: '',
            answer: ''
        };
        setFaqs([...faqs, newFaq]);
    };

    const updateFaq = (index, field, value) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index][field] = value;
        setFaqs(updatedFaqs);
    };

    const removeFaq = (index) => {
        setFaqs(faqs.filter((_, i) => i !== index));
    };

    const toggleTag = (tagName) => {
        if (selectedTags.includes(tagName)) {
            setSelectedTags(selectedTags.filter(t => t !== tagName));
        } else {
            if (selectedTags.length >= 10) {
                toast.error('Maximum 10 tags allowed');
                return;
            }
            setSelectedTags([...selectedTags, tagName]);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await axiosInstance.patch(`/api/v1/services/admin/${serviceId}/status`, {
                status: newStatus
            });
            setValue('status', newStatus);
            toast.success(`Service status updated to ${newStatus}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleFeaturedToggle = async () => {
        try {
            const newFeatured = !featuredWatch;
            await axiosInstance.patch(`/api/v1/services/admin/${serviceId}/status`, {
                featured: newFeatured
            });
            setValue('featured', newFeatured);
            toast.success(newFeatured ? 'Service marked as featured' : 'Featured status removed');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update featured status');
        }
    };

    const onSubmit = async (data) => {
        try {
            setSaving(true);

            const serviceData = {
                title: data.title,
                description: data.description,
                category: data.category,
                subCategory: data.subCategory || undefined,
                location: data.location,
                videoLink: data.videoLink || '',
                requirements: data.requirements || '',
                tags: selectedTags,
                packages: packages.map(({ id, featureInput, ...pkg }) => ({
                    ...pkg,
                    price: Number(pkg.price),
                    deliveryTime: Number(pkg.deliveryTime),
                    revisions: pkg.revisions ? Number(pkg.revisions) : 0
                })),
                extraOffers: extraOffers.map(({ id, ...offer }) => ({
                    ...offer,
                    price: Number(offer.price),
                    deliveryTime: Number(offer.deliveryTime)
                })),
                faqs: faqs.map(({ id, ...faq }) => faq),
                removedImages,
                status: data.status,
                featured: data.featured,
                rejectionReason: data.rejectionReason || ''
            };

            const formDataObj = new FormData();
            formDataObj.append('data', JSON.stringify(serviceData));

            galleryImages.forEach((image) => {
                formDataObj.append('gallery', image);
            });

            await axiosInstance.put(`/api/v1/services/admin/${serviceId}`, formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Service updated successfully!');
            navigate('/admin/services/all');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update service');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const getStatusBadge = (status) => {
        const config = {
            published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: CheckCircle },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft', icon: FileText },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle },
            paused: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Paused', icon: PauseCircle }
        };
        const badge = config[status] || config.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon size={12} />
                {badge.label}
            </span>
        );
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: FileText },
        { id: 'pricing', label: 'Pricing', icon: DollarSign },
        { id: 'gallery', label: 'Gallery & FAQ', icon: Eye },
        { id: 'moderation', label: 'Moderation', icon: Shield },
        { id: 'seller', label: 'Mentor Info', icon: Users },
    ];

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center h-64">
                            <Loader className="w-12 h-12 animate-spin text-primary" />
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="w-full max-w-full overflow-x-hidden">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 mt-20 md:mt-0">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/admin/services')}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Service</h1>
                                    <p className="text-gray-600 mt-1">Service ID: {serviceId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <button
                                    onClick={() => navigate('/admin/services')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw size={18} className="animate-spin" />
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

                        {/* Service Status Bar */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        {getStatusBadge(statusWatch)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Featured:</span>
                                        {featuredWatch ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                <Award size={12} />
                                                Featured
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                Not Featured
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {statusWatch === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange('published')}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                            >
                                                <CheckCircle size={14} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange('rejected')}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                            >
                                                <XCircle size={14} />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {statusWatch === 'published' && (
                                        <>
                                            <button
                                                onClick={handleFeaturedToggle}
                                                className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${featuredWatch
                                                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                                    }`}
                                            >
                                                <Award size={14} />
                                                {featuredWatch ? 'Remove Featured' : 'Mark Featured'}
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange('paused')}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                                            >
                                                <PauseCircle size={14} />
                                                Suspend
                                            </button>
                                        </>
                                    )}
                                    {statusWatch === 'paused' && (
                                        <button
                                            onClick={() => handleStatusChange('published')}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                        >
                                            <PlayCircle size={14} />
                                            Activate
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-500">Views</p>
                                <p className="text-xl font-bold">{formatNumber(stats.views)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-500">Orders</p>
                                <p className="text-xl font-bold">{stats.orders}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-500">Revenue</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-500">Rating</p>
                                <p className="text-xl font-bold flex items-center gap-1">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    {stats.rating} ({stats.reviews})
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="mb-6 overflow-x-auto pb-2">
                            <div className="flex gap-2 min-w-max">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.id
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                        >
                                            <Icon size={16} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">

                            {/* Tab: Basic Info */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Service Title *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('title', { required: 'Title is required' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                                        )}
                                    </div>

                                    {/* Category & Subcategory */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map((category) => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.category && (
                                                <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Sub-category
                                            </label>
                                            <select
                                                {...register('subCategory')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description *
                                        </label>
                                        <RTE
                                            name="description"
                                            control={control}
                                            label="Description"
                                            defaultValue={getValues('description') || ''}
                                        />
                                        {errors.description && (
                                            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tags (Max 10)
                                        </label>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                placeholder="Type a tag and press Enter"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const tag = e.target.value.trim();
                                                        if (tag && selectedTags.length < 10) {
                                                            if (!selectedTags.includes(tag)) {
                                                                setSelectedTags([...selectedTags, tag]);
                                                            }
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-sm"
                                                >
                                                    <Tag size={12} />
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedTags(selectedTags.filter((_, i) => i !== index))}
                                                        className="ml-1 hover:text-red-200"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Requirements */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Client Requirements
                                        </label>
                                        <textarea
                                            {...register('requirements')}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="What information does the client need to provide?"
                                        />
                                    </div>

                                    {/* Video Link */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Video Link (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            {...register('videoLink')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab: Pricing */}
                            {activeTab === 'pricing' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Packages</h2>

                                    {/* Service Packages */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Service Packages *
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addPackage}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                                            >
                                                <Plus size={14} />
                                                Add Package
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {packages.map((pkg, index) => (
                                                <div key={pkg._id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-medium text-gray-900">
                                                                Package {index + 1}
                                                            </span>
                                                            <label className="flex items-center gap-1 text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={pkg.isFeatured}
                                                                    onChange={(e) => updatePackage(index, 'isFeatured', e.target.checked)}
                                                                    className="w-4 h-4 text-primary rounded"
                                                                />
                                                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                    <Star size={12} />
                                                                    Featured
                                                                </span>
                                                            </label>
                                                        </div>
                                                        {packages.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removePackage(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                        <input
                                                            type="text"
                                                            value={pkg.title}
                                                            onChange={(e) => updatePackage(index, 'title', e.target.value)}
                                                            placeholder="Package Title"
                                                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                                                        />
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                            <input
                                                                type="number"
                                                                value={pkg.price}
                                                                onChange={(e) => updatePackage(index, 'price', parseFloat(e.target.value) || 0)}
                                                                placeholder="Price"
                                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                        <div className="relative">
                                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                                            <input
                                                                type="number"
                                                                value={pkg.deliveryTime}
                                                                onChange={(e) => updatePackage(index, 'deliveryTime', parseInt(e.target.value) || 1)}
                                                                placeholder="Delivery Time (days)"
                                                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm"
                                                            />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={pkg.revisions || ''}
                                                            onChange={(e) => updatePackage(index, 'revisions', parseInt(e.target.value) || 0)}
                                                            placeholder="Revisions (0 = unlimited)"
                                                            className="px-3 py-2 border border-gray-300 rounded text-sm"
                                                        />
                                                    </div>

                                                    <textarea
                                                        value={pkg.description}
                                                        onChange={(e) => updatePackage(index, 'description', e.target.value)}
                                                        rows={2}
                                                        placeholder="Package description"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
                                                    />

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                                            Features
                                                        </label>
                                                        <div className="flex gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                value={pkg.featureInput || ''}
                                                                onChange={(e) => {
                                                                    const updatedPackages = [...packages];
                                                                    updatedPackages[index].featureInput = e.target.value;
                                                                    setPackages(updatedPackages);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && pkg.featureInput?.trim()) {
                                                                        e.preventDefault();
                                                                        addPackageFeature(index);
                                                                    }
                                                                }}
                                                                placeholder="Add a feature"
                                                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => addPackageFeature(index)}
                                                                className="px-3 py-1.5 bg-primary text-white rounded text-sm"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                        {pkg.features && pkg.features.length > 0 && (
                                                            <div className="space-y-1">
                                                                {pkg.features.map((feature, featureIndex) => (
                                                                    <div key={featureIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                                        <span className="text-sm">{feature}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removePackageFeature(index, featureIndex)}
                                                                            className="text-red-500 hover:text-red-700"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Extra Offers */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Extra Offers & Add-ons
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addExtraOffer}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                                            >
                                                <Plus size={14} />
                                                Add Extra Offer
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {extraOffers.map((offer, index) => (
                                                <div key={offer._id} className="border border-gray-200 rounded-lg p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-sm font-medium">Extra Offer {index + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExtraOffer(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                        <input
                                                            type="text"
                                                            value={offer.title}
                                                            onChange={(e) => updateExtraOffer(index, 'title', e.target.value)}
                                                            placeholder="Title"
                                                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={offer.description}
                                                            onChange={(e) => updateExtraOffer(index, 'description', e.target.value)}
                                                            placeholder="Description"
                                                            className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                        />
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                                            <input
                                                                type="number"
                                                                value={offer.price}
                                                                onChange={(e) => updateExtraOffer(index, 'price', parseFloat(e.target.value) || 0)}
                                                                placeholder="Price"
                                                                className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Gallery & FAQ */}
                            {activeTab === 'gallery' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Gallery & FAQ</h2>

                                    {/* Gallery */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gallery Images (Max 10)
                                        </label>

                                        {/* Existing Images */}
                                        {existingGalleryImages.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {existingGalleryImages.map((image, index) => (
                                                        <div key={image._id || index} className="relative group">
                                                            <img
                                                                src={image.url}
                                                                alt={`Gallery ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExistingImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                            <div className="absolute bottom-0 left-0 right-0 bg-blue-500 bg-opacity-70 text-white text-xs px-2 py-1 rounded-b-lg">
                                                                Existing
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Area */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="gallery-upload"
                                            />
                                            <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center">
                                                <Upload size={32} className="text-gray-400 mb-2" />
                                                <p className="text-gray-600 mb-1">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    JPG, PNG, GIF, WebP • Max 5MB each
                                                </p>
                                            </label>
                                        </div>

                                        {/* New Images Preview */}
                                        {galleryImages.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600 mb-2">New Images:</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {galleryImages.map((image, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={URL.createObjectURL(image)}
                                                                alt={`New ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeNewImage(index)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                            <div className="absolute bottom-0 left-0 right-0 bg-green-500 bg-opacity-70 text-white text-xs px-2 py-1 rounded-b-lg">
                                                                New
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* FAQs */}
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Frequently Asked Questions
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addFaq}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                                            >
                                                <Plus size={14} />
                                                Add FAQ
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {faqs.map((faq, index) => (
                                                <div key={faq._id} className="border border-gray-200 rounded-lg p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-sm font-medium">FAQ {index + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFaq(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={faq.question}
                                                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                                            placeholder="Question"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                                        />
                                                        <textarea
                                                            value={faq.answer}
                                                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                                            rows={2}
                                                            placeholder="Answer"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {faqs.length === 0 && (
                                            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                                                <HelpCircle className="mx-auto text-gray-300 mb-2" size={32} />
                                                <p className="text-gray-500">No FAQs added yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab: Moderation */}
                            {activeTab === 'moderation' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Moderation Controls</h2>

                                    {/* Status Controls */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-gray-900 mb-3">Service Status</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['published', 'pending', 'paused', 'rejected'].map((status) => (
                                                <label
                                                    key={status}
                                                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${statusWatch === status
                                                        ? status === 'published' ? 'border-green-500 bg-green-50'
                                                            : status === 'pending' ? 'border-yellow-500 bg-yellow-50'
                                                                : status === 'paused' ? 'border-orange-500 bg-orange-50'
                                                                    : status === 'rejected' ? 'border-red-500 bg-red-50'
                                                                        : 'border-primary bg-primary/5'
                                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        {...register('status')}
                                                        value={status}
                                                        className="hidden"
                                                        onChange={(e) => handleStatusChange(e.target.value)}
                                                    />
                                                    <div className="text-center capitalize">
                                                        {status === 'published' && <CheckCircle size={20} className={`mx-auto mb-1 ${statusWatch === status ? 'text-green-600' : 'text-gray-400'}`} />}
                                                        {status === 'pending' && <Clock size={20} className={`mx-auto mb-1 ${statusWatch === status ? 'text-yellow-600' : 'text-gray-400'}`} />}
                                                        {status === 'paused' && <PauseCircle size={20} className={`mx-auto mb-1 ${statusWatch === status ? 'text-orange-600' : 'text-gray-400'}`} />}
                                                        {status === 'rejected' && <XCircle size={20} className={`mx-auto mb-1 ${statusWatch === status ? 'text-red-600' : 'text-gray-400'}`} />}
                                                        <span className={`text-sm font-medium ${statusWatch === status
                                                            ? status === 'published' ? 'text-green-600'
                                                                : status === 'pending' ? 'text-yellow-600'
                                                                    : status === 'paused' ? 'text-orange-600'
                                                                        : status === 'rejected' ? 'text-red-600'
                                                                            : 'text-primary'
                                                            : 'text-gray-600'
                                                            }`}>
                                                            {status}
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Featured Toggle */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900">Featured Service</h3>
                                                <p className="text-sm text-gray-500 mt-1">Mark this service as featured to highlight it in search results</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={featuredWatch}
                                                    onChange={handleFeaturedToggle}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Rejection Reason */}
                                    {statusWatch === 'rejected' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Rejection Reason
                                            </label>
                                            <textarea
                                                {...register('rejectionReason')}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Explain why this service was rejected..."
                                            />
                                        </div>
                                    )}

                                    {/* Moderation Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Moderation Notes (Internal)
                                        </label>
                                        <textarea
                                            value={moderationNotes}
                                            onChange={(e) => setModerationNotes(e.target.value)}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="Add internal notes for other admins..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">These notes are only visible to admins</p>
                                    </div>

                                    {/* Reports Section */}
                                    {stats.reports > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <Flag size={18} className="text-red-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-red-800">Service Reported</h4>
                                                    <p className="text-sm text-red-600 mt-1">
                                                        This service has {stats.reports} report(s). Review carefully before taking action.
                                                    </p>
                                                    <button className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium">
                                                        View Reports
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab: Seller Info */}
                            {activeTab === 'seller' && sellerInfo && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Mentor Information</h2>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={sellerInfo.profileImage || dummyUserImg}
                                                alt={sellerInfo.displayName || sellerInfo.firstName}
                                                className="w-20 h-20 rounded-full object-cover"
                                                onError={(e) => e.target.src = dummyUserImg}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {sellerInfo.displayName || `${sellerInfo.firstName} ${sellerInfo.lastName}`}
                                                    </h3>
                                                    {sellerInfo?.isVerified && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                                                            <CheckCircle size={12} />
                                                            Verified
                                                        </span>
                                                    )}
                                                    {sellerInfo.freelancerType && (
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                            {sellerInfo.freelancerType.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-sm mt-1">{sellerInfo.email}</p>
                                                {sellerInfo.location && (
                                                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {sellerInfo.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div className="bg-white p-3 rounded-lg">
                                                <p className="text-xs text-gray-500">Rating</p>
                                                <p className="font-medium flex items-center gap-1">
                                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                    {sellerInfo.rating || 0} ({sellerInfo.reviewCount || 0})
                                                </p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg">
                                                <p className="text-xs text-gray-500">Total Services</p>
                                                <p className="font-medium">{sellerInfo.totalServices || 0}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg">
                                                <p className="text-xs text-gray-500">Total Earnings</p>
                                                <p className="font-medium text-green-600">{formatCurrency(sellerInfo.totalRevenue || 0)}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg">
                                                <p className="text-xs text-gray-500">Member Since</p>
                                                <p className="font-medium">{formatDate(sellerInfo?.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => navigate(`/freelancer/${sellerInfo._id}`)}
                                                className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm flex items-center justify-center gap-2"
                                            >
                                                <Eye size={14} />
                                                View Full Profile
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/messages?user=${sellerInfo._id}`)}
                                                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare size={14} />
                                                Message Mentor
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
};

export default EditService;