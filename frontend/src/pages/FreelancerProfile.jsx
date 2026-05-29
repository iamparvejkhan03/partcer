import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    MapPin,
    Briefcase,
    Calendar,
    ChevronRight,
    Star,
    Mail,
    Phone,
    Globe,
    Award,
    BookOpen,
    CheckCircle,
    Clock,
    DollarSign,
    Users,
    ThumbsUp,
    MessageCircle,
    Share2,
    Bookmark,
    Flag,
    ExternalLink,
    Building,
    GraduationCap,
    Languages,
    Wrench,
    Heart,
    Download
} from "lucide-react";
import { Container, StartChatButton, PricingSection } from "../components";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { dummyUserImg } from "../assets";
import { useAuth } from "../contexts/AuthContext";

const FreelancerProfile = () => {
    const { freelancerId } = useParams();
    const [freelancer, setFreelancer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("about");
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [portfolioLoading, setPortfolioLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [ratingStats, setRatingStats] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    const { user } = useAuth();

    const fetchPortfolioItems = async () => {
        if (!freelancerId) return;

        try {
            setPortfolioLoading(true);
            const response = await axiosInstance.get(`/api/v1/portfolio/public/${freelancerId}`);

            if (response.data.success) {
                setPortfolioItems(response.data.data.portfolios);
            }
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            // Don't show toast error, just show empty state
        } finally {
            setPortfolioLoading(false);
        }
    };

    const fetchFreelancerReviews = async () => {
        if (!freelancerId) return;

        try {
            setReviewsLoading(true);
            // const response = await axiosInstance.get(`/api/v1/reviews/user/${freelancerId}?role=freelancer&limit=20`);
            const response = await axiosInstance.get(`/api/v1/reviews/user/${freelancerId}?role=mentor&limit=20`);

            if (response.data.success) {
                setReviews(response.data.data.reviews || []);
                setRatingStats(response.data.data.stats);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Call it when component mounts or freelancerId changes
    useEffect(() => {
        if (freelancerId) {
            fetchFreelancerProfile();
            fetchPortfolioItems();
            fetchFreelancerReviews();
        }
    }, [freelancerId]);

    const fetchFreelancerProfile = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/users/freelancers/${freelancerId}`);

            if (response.data.success) {
                setFreelancer(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching freelancer profile:', error);
            toast.error('Failed to load freelancer profile');
        } finally {
            setLoading(false);
        }
    };

    const handleHelpful = async (reviewId) => {
        try {
            const response = await axiosInstance.post(`/api/v1/reviews/${reviewId}/helpful`);
            if (response.data.success) {
                // Update the review in state
                setReviews(reviews.map(review =>
                    review._id === reviewId ? response.data.data : review
                ));
                toast.success('Marked as helpful');
            }
        } catch (error) {
            console.error('Error marking helpful:', error);
            toast.error(error.response?.data?.message || 'Failed to mark as helpful');
        }
    };

    const handleUnhelpful = async (reviewId) => {
        try {
            const response = await axiosInstance.delete(`/api/v1/reviews/${reviewId}/helpful`);
            if (response.data.success) {
                setReviews(reviews.map(review =>
                    review._id === reviewId ? response.data.data : review
                ));
                toast.success('Removed helpful mark');
            }
        } catch (error) {
            console.error('Error removing helpful:', error);
            toast.error(error.response?.data?.message || 'Failed to remove helpful mark');
        }
    };

    const handleReportReview = async () => {
        if (!reportReason) {
            toast.error('Please select a reason');
            return;
        }

        try {
            setSubmittingReport(true);
            const response = await axiosInstance.post(`/api/v1/reviews/${selectedReview._id}/flag`, {
                reason: reportReason,
                description: reportDescription
            });

            if (response.data.success) {
                toast.success('Review reported successfully');
                setShowReportModal(false);
                setSelectedReview(null);
                setReportReason('');
                setReportDescription('');
            }
        } catch (error) {
            console.error('Error reporting review:', error);
            toast.error(error.response?.data?.message || 'Failed to report review');
        } finally {
            setSubmittingReport(false);
        }
    };

    if (loading) {
        return (
            <Container>
                <div className="min-h-screen pt-32 pb-16">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </Container>
        );
    }

    if (!freelancer) {
        return (
            <Container>
                <div className="min-h-screen pt-32 pb-16">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Mentor not found</h2>
                    </div>
                </div>
            </Container>
        );
    }

    const fullName = `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim();
    const location = [freelancer.city, freelancer.country].filter(Boolean).join(', ');
    const experience = freelancer.experience?.length || 0;
    const experienceText = experience > 0 ? `${experience}+ years` : 'Entry level';

    // Calculate rating from reviews if available
    const calculateRating = () => {
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            return (sum / reviews.length).toFixed(1);
        }
        if (ratingStats?.averageRating) {
            return ratingStats.averageRating.toFixed(1);
        }
        return freelancer.rating?.toFixed(1) || "0.0";
    };

    const displayRating = calculateRating();
    const reviewCount = reviews.length || ratingStats?.totalReviews || freelancer.reviewCount || 0;

    const hired = freelancer.hired || 0;
    const projectsCompleted = freelancer.projectsCompleted || 0;

    return (
        <Container>
            <div className="min-h-screen pt-32 md:pt-32 pb-16 bg-gray-50">
                <div className="max-w-7xl mx-auto">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                                {/* Profile Header */}
                                <div className="p-6 text-center border-b border-gray-100">
                                    <div className="relative inline-block">
                                        <img
                                            src={freelancer.profileImage || dummyUserImg}
                                            alt={fullName}
                                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                                        />
                                        {freelancer.isVerified && (
                                            <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-full">
                                                <CheckCircle size={16} />
                                            </div>
                                        )}
                                    </div>

                                    <h1 className="text-2xl font-bold text-gray-900 mt-4">{fullName}</h1>
                                    <p className="text-gray-600 mt-1">{freelancer.tagline || 'Not Provided'}</p>

                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{displayRating}</span>
                                        <span className="text-gray-500">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                                    </div>

                                    <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={16} className="text-gray-400" />
                                            <span>{location || 'Location not specified'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Briefcase size={16} className="text-gray-400" />
                                            <span>{experienceText}</span>
                                        </div>
                                    </div>

                                    {/* Availability Badge */}
                                    <div className="mt-4">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            <Clock size={14} />
                                            Available for job
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                {/* <div className="p-6 border-b border-gray-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-900">{projectsCompleted}</div>
                                            <div className="text-sm text-gray-500">Projects</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-900">{hired}</div>
                                            <div className="text-sm text-gray-500">Hired</div>
                                        </div>
                                    </div>
                                </div> */}

                                <div className="p-6 border-b border-gray-100">
                                    <div className="space-y-4">
                                        {/* Freelancer Type */}
                                        <div className="flex items-start gap-3">
                                            <Briefcase size={18} className="text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Mentor type</p>
                                                <p className="text-gray-900 capitalize">{freelancer.freelancerType || 'Independent'}</p>
                                            </div>
                                        </div>

                                        {/* Languages */}
                                        {freelancer.languages?.length > 0 && (
                                            <div className="flex items-start gap-3">
                                                <Languages size={18} className="text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Languages</p>
                                                    <p className="text-gray-900">{freelancer.languages.join(', ')}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* English Level */}
                                        {freelancer.englishLevel && (
                                            <div className="flex items-start gap-3">
                                                <Globe size={18} className="text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500">English level</p>
                                                    <p className="text-gray-900 capitalize">{freelancer.englishLevel}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Skills */}
                                {freelancer.skills?.length > 0 && (
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Wrench size={16} />
                                            Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {freelancer.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="p-6">
                                    {/* <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg mb-3 flex items-center justify-center gap-2">
                                        <MessageCircle size={18} />
                                        Message Me
                                    </button> */}
                                    {/* <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                                        <Heart size={18} />
                                        Save to favorites
                                    </button> */}
                                    <StartChatButton userId={freelancer?._id} userName={freelancer?.displayName || freelancer?.firstName} />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Main Content */}
                        <div className="lg:col-span-2">
                            {/* Pricing Section */}
                            <PricingSection
                                freelancerName={fullName}
                                freelancerId={freelancer?._id}
                                freelancerEmail={freelancer?.email}
                            />
                            {/* Tabs */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab("about")}
                                        className={`flex-1 py-4 px-6 text-sm font-medium ${activeTab === "about"
                                            ? "text-primary border-b-2 border-primary"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        About Me
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("reviews")}
                                        className={`flex-1 py-4 px-6 text-sm font-medium ${activeTab === "reviews"
                                            ? "text-primary border-b-2 border-primary"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        Reviews
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("portfolio")}
                                        className={`flex-1 py-4 px-6 text-sm font-medium ${activeTab === "portfolio"
                                            ? "text-primary border-b-2 border-primary"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        Portfolio
                                    </button>
                                </div>

                                {/* About Tab */}
                                {activeTab === "about" && (
                                    <div className="p-6">
                                        {/* About Me */}
                                        <div className="mb-8">
                                            <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
                                            <p className="text-gray-600 leading-relaxed">
                                                {freelancer.bio || `Not Provided`}
                                            </p>
                                        </div>

                                        {/* Experience */}
                                        {freelancer.experience?.length > 0 && (
                                            <div className="mb-8">
                                                <h2 className="text-xl font-bold text-gray-900 mb-4">Work Experience</h2>
                                                {freelancer.experience.map((exp, index) => (
                                                    <div key={index} className="mb-6">
                                                        <h3 className="font-semibold text-gray-900">{exp.jobTitle}</h3>
                                                        <p className="text-gray-600">{exp.companyName} • {exp.location}</p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
                                                        </p>
                                                        <p className="text-gray-600 mt-2">{exp.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Education */}
                                        {freelancer.education?.length > 0 && (
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
                                                {freelancer.education.map((edu, index) => (
                                                    <div key={index} className="mb-4">
                                                        <h3 className="font-semibold text-gray-900">{edu.degreeTitle}</h3>
                                                        <p className="text-gray-600">{edu.instituteName}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : new Date(edu.endDate).getFullYear()}
                                                        </p>
                                                        <p className="text-sm mt-2 text-gray-600">
                                                            {edu?.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Portfolio Tab */}
                                {activeTab === "portfolio" && (
                                    <div className="p-6">
                                        {portfolioLoading ? (
                                            <div className="flex justify-center items-center h-64">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            </div>
                                        ) : portfolioItems.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {portfolioItems.map((item) => (
                                                    <div key={item._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                                        <div className="relative h-48 overflow-hidden">
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="p-4">
                                                            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                                            {item.tags && item.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mb-3">
                                                                    {item.tags.map((tag, idx) => (
                                                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {item.link && (
                                                                <a
                                                                    href={item.link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium"
                                                                >
                                                                    View Project <ExternalLink size={14} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                                <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
                                                <h3 className="text-lg font-medium text-gray-700 mb-2">No portfolio items yet</h3>
                                                <p className="text-sm text-gray-500">This mentor hasn't added any portfolio items.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reviews Tab */}
                                {activeTab === "reviews" && (
                                    <div className="p-6">
                                        {/* Rating Summary */}
                                        <div className="flex items-start gap-8 mb-8 p-6 bg-gray-50 rounded-xl">
                                            <div className="text-center">
                                                <div className="text-5xl font-bold text-gray-900">{displayRating}</div>
                                                <div className="flex items-center justify-center gap-1 mt-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={20}
                                                            className={i < Math.round(parseFloat(displayRating))
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{reviewCount} reviews</p>
                                            </div>

                                            {/* Rating Distribution - calculate from reviews if needed */}
                                            <div className="flex-1 space-y-2">
                                                {[5, 4, 3, 2, 1].map((star) => {
                                                    // Calculate count from reviews array if ratingStats not available
                                                    let count = ratingStats?.ratingDistribution?.[star] ||
                                                        reviews.filter(r => Math.floor(r.rating) === star).length || 0;
                                                    const total = reviewCount || 1;
                                                    const percentage = (count / total) * 100;

                                                    return (
                                                        <div key={star} className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600 w-8">{star} star</span>
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-yellow-400 rounded-full"
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm text-gray-500 w-12">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Review List */}
                                        <div className="space-y-6">
                                            {reviewsLoading ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                </div>
                                            ) : reviews.length > 0 ? (
                                                reviews.map((review) => (
                                                    <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                                                        <div className="flex items-center gap-4">
                                                            <img
                                                                src={review.reviewer?.profileImage || dummyUserImg}
                                                                alt={review.reviewer?.displayName}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex gap-2 items-center">
                                                                        <h4 className="font-semibold text-gray-900">
                                                                            {review.reviewer?.displayName || `${review.reviewer?.firstName} ${review.reviewer?.lastName}`}
                                                                        </h4>

                                                                        <p className="text-xs text-gray-500 mt-1">{new Date(review.createdAt).toLocaleDateString('en-US', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}</p>
                                                                        {/* <p className="text-xs text-gray-500">
                                                                            {review.revieweRole === 'buyer' ? 'Student' : 'Mentor'} 
                                                                            
                                                                            • {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                                                year: 'numeric',
                                                                                month: 'short',
                                                                                day: 'numeric'
                                                                            })}
                                                                        </p> */}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                size={14}
                                                                                className={i < review.rating
                                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                                    : 'text-gray-300'
                                                                                }
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <p className="text-gray-600 mt-2">{review.comment}</p>

                                                                {/* Response from freelancer */}
                                                                {review.response?.comment && (
                                                                    <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/30">
                                                                        <p className="text-sm text-gray-500 mb-1">Response from {fullName}:</p>
                                                                        <p className="text-gray-700 text-sm">{review.response.comment}</p>
                                                                        {review.response.isEdited && (
                                                                            <p className="text-xs text-gray-400 mt-1">(edited)</p>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Actions */}
                                                                {/* <div className="flex items-center gap-4 mt-3">
                                                                    <button
                                                                        onClick={() => review.helpful?.users?.includes(user?._id)
                                                                            ? handleUnhelpful(review._id)
                                                                            : handleHelpful(review._id)
                                                                        }
                                                                        className={`flex items-center gap-1 text-xs ${review.helpful?.users?.includes(user?._id)
                                                                            ? 'text-primary'
                                                                            : 'text-gray-500 hover:text-primary'
                                                                            }`}
                                                                    >
                                                                        <ThumbsUp size={14} />
                                                                        Helpful ({review.helpful?.count || 0})
                                                                    </button>

                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedReview(review);
                                                                            setShowReportModal(true);
                                                                        }}
                                                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
                                                                    >
                                                                        <Flag size={14} />
                                                                        Report
                                                                    </button>

                                                                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                                        <CheckCircle size={12} />
                                                                        Verified Purchase
                                                                    </span>
                                                                </div> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg p-8 text-center">
                                                    <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h3>
                                                    <p className="text-sm text-gray-500">This mentor hasn't received any reviews.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Report Review Modal */}
            {showReportModal && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Report Review</h3>
                        <p className="text-gray-600 mb-4">
                            Help us maintain a trustworthy community by reporting inappropriate content.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason *
                                </label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select a reason</option>
                                    <option value="inappropriate">Inappropriate content</option>
                                    <option value="spam">Spam</option>
                                    <option value="fake">Fake review</option>
                                    <option value="offensive">Offensive language</option>
                                    <option value="conflict_of_interest">Conflict of interest</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Details (Optional)
                                </label>
                                <textarea
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="Please provide more details..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setSelectedReview(null);
                                    setReportReason('');
                                    setReportDescription('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReportReview}
                                disabled={submittingReport || !reportReason}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {submittingReport ? 'Reporting...' : 'Report Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default FreelancerProfile;