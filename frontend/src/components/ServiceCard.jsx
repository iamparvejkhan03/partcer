import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const ServiceCard = ({ service }) => {
    const [isSaved, setIsSaved] = useState(service.isSaved || false);
    const [isSaving, setIsSaving] = useState(false);

    const toggleSave = async () => {
        try {
            setIsSaving(true);

            if (isSaved) {
                await axiosInstance.delete(`/api/v1/services/${service._id}/save`);
                toast.success('Removed from wishlist');
            } else {
                await axiosInstance.post(`/api/v1/services/${service._id}/save`);
                toast.success('Added to wishlist');
            }

            setIsSaved(!isSaved);
        } catch (error) {
            console.error('Error toggling save:', error);
            toast.error(error.response?.data?.message || 'Failed to update wishlist');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate minimum price from packages
    const getMinPrice = () => {
        if (!service.packages || service.packages.length === 0) return 0;
        return Math.min(...service.packages.map(p => p.price));
    };

    // Get main image
    const getMainImage = () => {
        if (service.gallery && service.gallery.length > 0) {
            const mainImage = service.gallery.find(img => img.isMain);
            return mainImage?.url || service.gallery[0]?.url;
        }
        return 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg'; // Fallback image
    };

    // Format location
    const getLocation = () => {
        if (service.location === 'remote') return 'Remote';
        if (service.location) return service.location;
        return 'Worldwide';
    };

    // Get seller name
    const getSellerName = () => {
        if (service.seller?.displayName) return service.seller.displayName;
        if (service.seller?.firstName && service.seller?.lastName) {
            return `${service.seller.firstName} ${service.seller.lastName}`;
        }
        return 'Mentor';
    };

    // Get seller profile image
    const getSellerImage = () => {
        return service.seller?.profileImage || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg';
    };

    // Get seller slug
    const getSellerSlug = () => {
        return service.seller?._id || 'freelancer';
    };

    return (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20 flex flex-col h-full">
            {/* Image Section */}
            <div className="relative overflow-hidden p-1">
                <Link to={`/service/${service._id}`}>
                    <img
                        src={getMainImage()}
                        alt={service.title}
                        className="w-full rounded-xl h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg';
                        }}
                    />
                </Link>

                {/* Save Button */}
                <button
                    onClick={toggleSave}
                    disabled={isSaving}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={isSaved ? "Remove from saved items" : "Save to favorites"}
                >
                    <Heart
                        size={20}
                        className={isSaved ? "fill-primary text-primary" : "text-gray-600 hover:text-primary"}
                    />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Freelancer Info */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                        <img
                            src={getSellerImage()}
                            alt={getSellerName()}
                            loading='lazy'
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                            onError={(e) => {
                                e.target.src = 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg';
                            }}
                        />
                        {/* Online Status Indicator */}
                        {service.seller?.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-1">
                            <Link
                                to={`/freelancer/${getSellerSlug()}`}
                                className="font-medium text-gray-900 hover:text-primary transition-colors text-base"
                            >
                                {getSellerName()}
                            </Link>
                            {service.seller?.isVerified && (
                                <CheckCircle size={14} className="text-blue-500 fill-blue-50" />
                            )}
                        </div>
                        {/* <p className="text-xs text-gray-500 capitalize">
                            {service.seller?.isOnline ? 'Online' : 'Offline'}
                        </p> */}
                        <p className="text-xs text-gray-500 capitalize">
                            {service.seller?.tagline && service.seller?.tagline}
                        </p>
                    </div>
                </div>

                {/* Service Title */}
                <Link
                    to={`/service/${service._id}`}
                    className="block mb-3 group/title"
                >
                    <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 min-h-[44px] group-hover/title:text-primary transition-colors">
                        {service.title}
                    </h3>
                </Link>

                {/* Rating & Location */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <div className="flex items-center justify-center gap-1">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{service.rating > 0 ? service.rating.toFixed(1) : '0.0'}</span>
                                <span className="text-gray-500">({service.reviewCount} reviews)</span>
                            </div>
                            {/* <span className="text-sm font-medium text-gray-700">
                                {service.rating > 0 ? service.rating.toFixed(1) : 'New'}
                            </span> */}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <MapPin size={16} />
                        <span>{getLocation()}</span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Starting from</p>
                            <p className="text-xl font-bold text-primary">
                                ${getMinPrice().toFixed(2)}
                            </p>
                        </div>
                        <Link
                            to={`/service/${service._id}`}
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm transition-colors hover:shadow-md"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;