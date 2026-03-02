import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Heading, HeadingDescription, LoadingSpinner, StartChatButton, Subheading } from '../components';
import ServiceCard from '../components/ServiceCard';
import {
    Heart,
    Share2,
    Star,
    MapPin,
    Calendar,
    FileText,
    Home,
    Clock,
    Cloud,
    Eye,
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    CornerUpLeft,
    Search,
    CheckCircle,
    Video,
    ArrowRight,
    RefreshCw,
    TrendingUp,
    Gift,
    CreditCard,
    ChevronUp,
    ChevronDown,
    Loader,
    AlertCircle,
    User,
    MessageCircle,
    LinkIcon,
    Wrench,
    MessageSquare,
    Facebook,
    Twitter,
    Linkedin,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../utils/axiosInstance'
import toast from 'react-hot-toast';
import { dummyUserImg } from '../assets';
import { lazy } from 'react';
import { Suspense } from 'react';

const YouTubeEmbed = lazy(() => import('../components/YouTubeEmbed'));

const ServiceDetails = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();

    // State
    const [service, setService] = useState(null);
    const [similarServices, setSimilarServices] = useState([]);
    const [sellerServices, setSellerServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI State
    const [isSaved, setIsSaved] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [showAllAbout, setShowAllAbout] = useState(false);
    const [activePackage, setActivePackage] = useState(0); // Index of selected package
    const [openFaq, setOpenFaq] = useState(null);
    const [reviewSort, setReviewSort] = useState('mostRecent');
    const [reviewSearch, setReviewSearch] = useState('');
    const [showReviewSort, setShowReviewSort] = useState(false);
    const [selectedExtra, setSelectedExtra] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // Fetch service details
    useEffect(() => {
        if (serviceId) {
            fetchServiceDetails();
        }
    }, [serviceId]);

    // Fetch seller services when service loads
    useEffect(() => {
        if (service?.seller?._id) {
            fetchSellerServices(service.seller._id);
        }
    }, [service?.seller?._id]);

    const fetchServiceDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get(`/api/v1/services/${serviceId}`);

            if (response.data?.success) {
                setService(response.data.data.service);
                setSimilarServices(response.data.data.similar || []);

                // Find featured package or default to first
                const featuredIndex = response.data.data.service.packages?.findIndex(p => p.isFeatured);
                setActivePackage(featuredIndex !== -1 ? featuredIndex : 0);
            } else {
                setError('Service not found');
            }
        } catch (err) {
            console.error('Error fetching service:', err);
            if (err.response?.status === 404) {
                setError('Service not found');
            } else {
                setError('Failed to load service details');
            }
            toast.error('Failed to load service details');
        } finally {
            setLoading(false);
        }
    };

    const fetchSellerServices = async (sellerId) => {
        try {
            const response = await axiosInstance.get(`/api/v1/services?seller=${sellerId}&limit=4`);

            if (response.data?.success) {
                // Filter out current service
                const otherServices = response.data.data.services.filter(
                    s => s._id !== service?._id
                );
                setSellerServices(otherServices);
            }
        } catch (err) {
            console.error('Error fetching seller services:', err);
        }
    };

    const handleSaveService = async () => {
        if (!service) return;

        try {
            if (isSaved) {
                await axiosInstance.delete(`/api/v1/services/${service._id}/save`);
                toast.success('Removed from wishlist');
            } else {
                await axiosInstance.post(`/api/v1/services/${service._id}/save`);
                toast.success('Added to wishlist');
            }
            setIsSaved(!isSaved);
        } catch (err) {
            toast.error('Failed to update wishlist');
        }
    };

    // Extract YouTube ID from URL
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const youtubeVideoId = getYouTubeId(service?.videoLink);

    const handleShare = async (platform) => {
        const url = window.location.href;
        const title = service?.title || 'Check out this service';

        let shareUrl = '';
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'pinterest':
                shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`;
                break;
            default:
                // Copy to clipboard
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }

        // Track share
        try {
            await axiosInstance.post(`/api/v1/services/${service._id}/shares`);
        } catch (err) {
            console.error('Error tracking share:', err);
        }
    };

    const handleHireMe = () => {
        if (!service) return;

        toast.error('Please connect your payment gateway.');
        return;

        // Navigate to checkout with selected package and extras
        navigate('/checkout', {
            state: {
                service: service._id,
                package: activePackage,
                extras: selectedExtra
            }
        });
    };

    const handleContactSeller = () => {
        if (!service?.seller) return;
        navigate(`/messages/new?user=${service.seller._id}&service=${service._id}`);
    };

    const handleViewProfile = () => {
        if (!service?.seller) return;
        navigate(`/freelancer/${service.seller._id}`);
    };

    const getSortedReviews = () => {
        if (!service?.reviews) return [];

        let sortedReviews = [...service.reviews];

        switch (reviewSort) {
            case 'mostRecent':
                sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'highestRating':
                sortedReviews.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowestRating':
                sortedReviews.sort((a, b) => a.rating - b.rating);
                break;
            default:
                sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Filter by search if search term exists
        if (reviewSearch.trim()) {
            const searchTerm = reviewSearch.toLowerCase();
            sortedReviews = sortedReviews.filter(review =>
                review.user?.name?.toLowerCase().includes(searchTerm) ||
                review.comment?.toLowerCase().includes(searchTerm) ||
                review.content?.toLowerCase().includes(searchTerm)
            );
        }

        return sortedReviews;
    };

    const handlePrevSlide = () => {
        if (!service?.gallery?.length) return;
        setActiveSlide(prev => (prev === 0 ? service.gallery.length - 1 : prev - 1));
    };

    const handleNextSlide = () => {
        if (!service?.gallery?.length) return;
        setActiveSlide(prev => (prev === service.gallery.length - 1 ? 0 : prev + 1));
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' year' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' month' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' day' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hour' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minute' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';

        return Math.floor(seconds) + ' second' + (Math.floor(seconds) > 1 ? 's' : '') + ' ago';
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Loading service details...</p>
                </div>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The service you\'re looking for doesn\'t exist.'}</p>
                    <Link
                        to="/services"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        <ArrowRight size={18} />
                        Browse Services
                    </Link>
                </div>
            </div>
        );
    }

    const totalStarRatings = Object.values(service.ratingDistribution || {}).reduce((a, b) => a + b, 0);
    const mainImage = service.gallery?.find(img => img.isMain) || service.gallery?.[0];
    const packageImages = {
        basic: "https://find.raretalancer.online/wp-content/uploads/2024/09/Basic.png",
        standard: "https://find.raretalancer.online/wp-content/uploads/2024/09/Standard-300x300-1.png",
        premium: "https://find.raretalancer.online/wp-content/uploads/2024/09/Premium-300x300-1.png"
    };

    return (
        <div className="min-h-screen pt-20 pb-16">
            {/* Breadcrumb Header */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                <Container>
                    <div className="py-6">
                        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                            <Link to="/" className="hover:text-primary transition-colors">
                                Home
                            </Link>
                            <span className="text-gray-400">›</span>
                            <Link to="/services" className="hover:text-primary transition-colors">
                                Services
                            </Link>
                            <span className="text-gray-400">›</span>
                            <span className="text-primary font-medium truncate max-w-xs">
                                {service.title}
                            </span>
                        </nav>

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                                    {service.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < Math.floor(service.rating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-gray-300'
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <span className="font-medium text-gray-900">
                                            {service.rating?.toFixed(1)}
                                        </span>
                                        <span className="text-gray-600">
                                            ({service.reviewCount || 0} Reviews)
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FileText size={16} />
                                        <span>{service.ordersInQueue || 0} Orders in Queue</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <ShoppingCart size={16} />
                                        <span>{service.totalSales || 0} Sales</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Eye size={16} />
                                        <span>{service.views || 0} Views</span>
                                    </div>

                                    {service.location && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin size={16} />
                                            <span>{service.location === 'remote' ? 'Remote' : service.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                                <button
                                    onClick={handleSaveService}
                                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Heart
                                        size={18}
                                        className={isSaved ? 'fill-primary text-primary' : 'text-gray-600'}
                                    />
                                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    <span className="text-gray-600 hidden sm:block">Share:</span>
                                    <div className="flex items-center gap-2">
                                        {['facebook', 'twitter', 'linkedin', 'copy'].map((platform) => (
                                            <button
                                                key={platform}
                                                onClick={() => handleShare(platform)}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                                title={`Share on ${platform}`}
                                            >
                                                {platform === 'copy' ? (
                                                    <LinkIcon size={18} />
                                                ) : platform === 'facebook' ? (
                                                    <Facebook size={18} />
                                                ) : platform === 'twitter' ? (
                                                    <Twitter size={18} />
                                                ) : platform === 'linkedin' ? (
                                                    <Linkedin size={18} />
                                                ) : (
                                                    <Share2 size={18} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2">
                        {/* Image Slider */}
                        {service.gallery?.length > 0 && (
                            <div className="relative rounded-xl overflow-hidden bg-gray-100">
                                <div className="relative h-64 md:h-[450px]">
                                    <img
                                        src={service.gallery[activeSlide]?.url}
                                        alt={`${service.title} - Image ${activeSlide + 1}`}
                                        className="w-full h-full object-cover"
                                    />

                                    {service.gallery.length > 1 && (
                                        <>
                                            <button
                                                onClick={handlePrevSlide}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button
                                                onClick={handleNextSlide}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Thumbnails */}
                        {service.gallery.length > 1 && (
                            <div className="flex gap-2 py-4 overflow-x-auto">
                                {service.gallery.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveSlide(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeSlide === index ? 'border-primary' : 'border-transparent'
                                            }`}
                                    >
                                        <img
                                            src={img.url}
                                            loading='lazy'
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* About This Service */}
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About this Service</h2>
                            <div
                                className="prose max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: service.description }}
                            />
                        </div>

                        {/* Video section */}
                        {youtubeVideoId && (
                            <>
                                <div className="mt-8" />
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Video Look</h3>
                                    <Suspense fallback={<LoadingSpinner />}>
                                        <YouTubeEmbed videoId={youtubeVideoId} title={service?.title || 'service video'} />
                                    </Suspense>
                                </div>
                            </>
                        )}

                        {/* Why Work With Me - From Seller Bio */}
                        {service.seller?.bio && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Why Work With Me</h2>
                                <p className="text-gray-700 mb-4">
                                    {showAllAbout ? service.seller.bio : `${service.seller.bio.substring(0, 300)}...`}
                                </p>
                                {service.seller.bio.length > 300 && (
                                    <button
                                        onClick={() => setShowAllAbout(!showAllAbout)}
                                        className="text-primary hover:text-primary/80 font-medium"
                                    >
                                        {showAllAbout ? 'Read Less' : 'Read More'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Extra Offers/Additional Services */}
                        {service.extraOffers?.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Services</h2>
                                <div className="space-y-4">
                                    {service.extraOffers.map((offer, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900 mb-1">{offer.title}</h3>
                                                    {offer.description && (
                                                        <p className="text-gray-600 text-sm">{offer.description}</p>
                                                    )}
                                                    {offer.deliveryTime && (
                                                        <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                                                            <Clock size={12} />
                                                            Delivery in {offer.deliveryTime} day{offer.deliveryTime > 1 ? 's' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="sm:text-right">
                                                    <span className="text-lg font-bold text-primary">
                                                        ${offer.price.toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedExtra(prev =>
                                                                prev.includes(index)
                                                                    ? prev.filter(i => i !== index)
                                                                    : [...prev, index]
                                                            );
                                                        }}
                                                        className={`block mt-2 text-sm font-medium ${selectedExtra.includes(index)
                                                            ? 'text-green-600'
                                                            : 'text-primary hover:text-primary/80'
                                                            }`}
                                                    >
                                                        {selectedExtra.includes(index) ? 'Added ✓' : 'Add to order'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills/Tags */}
                        {service.skills?.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills & Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {service.skills.map((skill, index) => (
                                        <Link
                                            key={index}
                                            to={`/services?skill=${encodeURIComponent(skill)}`}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 text-sm rounded-full transition-colors"
                                        >
                                            {skill}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FAQs */}
                        {service.faqs?.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {service.faqs.map((faq, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                                            >
                                                <span className="font-medium text-gray-900">{faq.question}</span>
                                                {openFaq === index ? (
                                                    <ChevronUp size={18} className="text-gray-500" />
                                                ) : (
                                                    <ChevronDown size={18} className="text-gray-500" />
                                                )}
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                    }`}
                                            >
                                                <div className="px-4 py-3 bg-white border-t border-gray-200">
                                                    <p className="text-gray-700">{faq.answer}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Requirements */}
                        {service.requirements && (
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                                <div className="bg-gray-50 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-line">{service.requirements}</p>
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="mt-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Reviews ({service.reviewCount || 0})
                                </h2>
                                {service.reviewCount > 0 && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowReviewSort(!showReviewSort)}
                                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
                                        >
                                            <span className="font-medium">
                                                {reviewSort === 'mostRecent' && 'Most Recent'}
                                                {reviewSort === 'oldest' && 'Oldest First'}
                                                {reviewSort === 'highestRating' && 'Highest Rating'}
                                                {reviewSort === 'lowestRating' && 'Lowest Rating'}
                                            </span>
                                            <ChevronDown size={16} className={`transition-transform ${showReviewSort ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showReviewSort && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                                <div className="p-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Search reviews..."
                                                        value={reviewSearch}
                                                        onChange={(e) => setReviewSearch(e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>
                                                <div className="border-t border-gray-200 py-1">
                                                    {['mostRecent', 'oldest', 'highestRating', 'lowestRating'].map((sort) => (
                                                        <button
                                                            key={sort}
                                                            onClick={() => {
                                                                setReviewSort(sort);
                                                                setShowReviewSort(false);
                                                            }}
                                                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm ${reviewSort === sort ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                                                                }`}
                                                        >
                                                            {sort === 'mostRecent' && 'Most Recent'}
                                                            {sort === 'oldest' && 'Oldest First'}
                                                            {sort === 'highestRating' && 'Highest Rating'}
                                                            {sort === 'lowestRating' && 'Lowest Rating'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Ratings Summary */}
                            {service.reviewCount > 0 && service.ratingDistribution && (
                                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            {[5, 4, 3, 2, 1].map((stars) => {
                                                const count = service.ratingDistribution[stars] || 0;
                                                const percentage = totalStarRatings > 0 ? (count / totalStarRatings) * 100 : 0;

                                                return (
                                                    <div key={stars} className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 w-16">
                                                            <span className="text-sm text-gray-600">{stars} Star</span>
                                                        </div>
                                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-amber-400 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-600 w-10 text-right">
                                                            {count}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="bg-white rounded-lg p-6 text-center">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                Customer Reviews
                                            </h3>
                                            <div className="text-4xl font-bold text-gray-900 mb-2">
                                                {service.rating?.toFixed(1)} / 5.0
                                            </div>
                                            <div className="flex justify-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={20}
                                                        className={i < Math.floor(service.rating)
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-gray-300'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-gray-600">
                                                Based on {service.reviewCount} {service.reviewCount === 1 ? 'Review' : 'Reviews'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            {service.reviews?.length > 0 ? (
                                <div className="space-y-6">
                                    {getSortedReviews().map((review, index) => (
                                        <div key={review._id || index} className="border-b border-gray-200 pb-6 last:border-b-0">
                                            <div className="flex items-start gap-4 mb-4">
                                                <img
                                                    src={review.user?.avatar || '/default-avatar.png'}
                                                    loading='lazy'
                                                    alt={review.user?.name || 'User'}
                                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/48';
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                        <h4 className="font-medium text-gray-900">
                                                            {review.user?.name || 'Anonymous'}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        size={14}
                                                                        className={i < review.rating
                                                                            ? 'fill-amber-400 text-amber-400'
                                                                            : 'text-gray-300'
                                                                        }
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-gray-600">
                                                                {timeAgo(review.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-sm font-medium text-gray-700 mb-1">{review.comment}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-700 mb-4">{review.content}</p>
                                            <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                                                <CornerUpLeft size={16} />
                                                <span>Reply</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">No reviews yet</p>
                                    <p className="text-sm text-gray-500 mt-1">Be the first to review this service</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Package Selection */}
                        <div className="bg-white border border-gray-200 shadow rounded-xl p-6">
                            <div className="mb-6">
                                {/* Package Tabs */}
                                <div className="border-b border-gray-200 mb-6">
                                    <div className="flex justify-between space-x-4 overflow-x-auto pb-1">
                                        {service.packages?.map((pkg, index) => (
                                            <button
                                                key={index}
                                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activePackage === index
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                                    }`}
                                                onClick={() => setActivePackage(index)}
                                            >
                                                {pkg.title}
                                                {/* {pkg.isFeatured && (
                                                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                        Featured
                                                    </span>
                                                )} */}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Package Content */}
                                {service.packages?.map((pkg, index) => (
                                    <div key={index} className={activePackage === index ? 'block' : 'hidden'}>
                                        <div className="text-center mb-6">
                                            <div className="mb-4">
                                                <img
                                                    src={packageImages[pkg.title.toLowerCase()] || packageImages.basic}
                                                    alt={pkg.title}
                                                    loading='lazy'
                                                    className="w-16 h-16 mx-auto"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <h5 className="text-lg font-semibold text-gray-900 mb-1">{pkg.title}</h5>
                                                <h3 className="text-3xl font-bold text-gray-900">${pkg.price.toFixed(2)}</h3>
                                            </div>
                                            <p className="text-gray-600 mb-4">{pkg.description}</p>
                                            <div className="flex items-center justify-center gap-2 text-gray-700 mb-4">
                                                <Clock size={18} className="text-primary" />
                                                <span className="font-medium">Delivery:</span>
                                                <span className="font-semibold">
                                                    {pkg.deliveryTime} Day{pkg.deliveryTime > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            {pkg.revisions > 0 && (
                                                <p className="text-sm text-gray-600">
                                                    {pkg.revisions === 0 ? 'Unlimited revisions' : `${pkg.revisions} revision${pkg.revisions > 1 ? 's' : ''} included`}
                                                </p>
                                            )}
                                        </div>

                                        {/* Package Features */}
                                        {pkg.features?.length > 0 && (
                                            <div className="mb-6">
                                                <h6 className="font-medium text-gray-900 mb-3">What's included:</h6>
                                                <ul className="space-y-2">
                                                    {pkg.features.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                            <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Hire Button */}
                                        <button
                                            onClick={handleHireMe}
                                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                                        >
                                            Continue with {pkg.title} Package
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Package Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <ShoppingCart size={20} className="text-purple-600" />
                                    </div>
                                    <h6 className="font-bold text-gray-900 text-lg">{service.totalSales || 0}</h6>
                                    <span className="text-xs text-gray-600">Sales</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Star size={20} className="text-orange-600" />
                                    </div>
                                    <h6 className="font-bold text-gray-900 text-lg">
                                        {service.rating?.toFixed(1) || '0.0'}
                                    </h6>
                                    <span className="text-xs text-gray-600">Rating</span>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Clock size={20} className="text-green-600" />
                                    </div>
                                    <h6 className="font-bold text-gray-900 text-lg">
                                        {service.packages?.[activePackage]?.deliveryTime || 1}d
                                    </h6>
                                    <span className="text-xs text-gray-600">Delivery</span>
                                </div>
                            </div>
                        </div>

                        {/* Seller Profile */}
                        {service.seller && (
                            <div className="bg-white border border-gray-200 shadow rounded-xl p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img
                                            src={service.seller.profileImage || dummyUserImg}
                                            alt={service.seller.displayName || service.seller.firstName}
                                            loading='lazy'
                                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/64';
                                            }}
                                        />
                                        {service.seller.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">
                                            {service.seller.displayName || service.seller.firstName}
                                        </h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={i < (service.seller.rating || 0)
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-gray-300'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium">
                                                {service.seller.rating?.toFixed(1) || '0.0'}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                ({service.seller.reviewCount || 0})
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    {service.seller.country && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">From</span>
                                            <span className="font-medium text-gray-900">{service?.seller?.country}</span>
                                        </div>
                                    )}
                                    {service.seller.createdAt && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Member Since</span>
                                            <span className="font-medium text-gray-900">
                                                {formatDate(service.seller.createdAt)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Freelancer Type</span>
                                        <span className="font-medium text-gray-900 capitalize">{service?.seller?.freelancerType || 'Indpendent'}</span>
                                    </div>

                                    {service.seller.languages?.length > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Speaks</span>
                                            <span className="font-medium text-gray-900">
                                                {service.seller.languages.join(', ')}
                                            </span>
                                        </div>
                                    )}
                                    {service.seller.englishLevel && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">English Level</span>
                                            <span className="font-medium text-gray-900 capitalize">
                                                {service.seller.englishLevel}
                                            </span>
                                        </div>
                                    )}
                                    {service.seller.avgResponseTime && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Avg Response Time</span>
                                            <span className="font-medium text-gray-900">{service.seller.avgResponseTime}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h5 className="font-medium text-gray-900 mb-2">About</h5>
                                    <p className="text-gray-600 text-sm line-clamp-3">
                                        {service.seller.bio || 'No bio provided.'}
                                    </p>
                                    {service.seller.bio?.length > 150 && (
                                        <Link
                                            to={`/freelancer/${service.seller._id}`}
                                            className="text-primary hover:text-primary/80 text-sm font-medium mt-2 inline-block"
                                        >
                                            View Full Profile
                                        </Link>
                                    )}
                                </div>

                                {/* <button
                                    onClick={handleContactSeller}
                                    className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 justify-center"
                                >
                                    <MessageSquare size={20} />
                                    <span>Message Me</span>
                                </button> */}
                                <StartChatButton userId={service?.seller?._id} userName={service?.seller?.displayName || service?.seller?.firstName} />

                                <button
                                    onClick={handleViewProfile}
                                    className="w-full mt-3 bg-white hover:bg-orange-50 text-orange-500 border border-orange-500 font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center gap-1 justify-center"
                                >
                                    <User size={20} />
                                    <span>View Profile</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* More from this seller */}
                {sellerServices.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <Subheading content={`More from ${service.seller?.displayName || service.seller?.name}`} />
                                <Heading content="Other Services" />
                                <HeadingDescription content="Check out more services from this freelancer" />
                            </div>
                            <Link
                                to={`/services?search=${service.seller?.displayName || service.seller?.name}`}
                                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                            >
                                View All
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {sellerServices.map((service) => (
                                <ServiceCard key={service._id} service={service} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Similar Services */}
                {similarServices.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <Subheading content="You might also like" />
                                <Heading content="Similar Services" />
                                <HeadingDescription content="Discover other services that might interest you" />
                            </div>
                            <Link
                                to={`/services?category=${service.category?.slug}`}
                                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                            >
                                Browse Category
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {similarServices.map((service) => (
                                <ServiceCard key={service._id} service={service} />
                            ))}
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default ServiceDetails;