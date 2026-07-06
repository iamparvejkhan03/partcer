import { useState, useEffect } from 'react';
import {
    Package, User, DollarSign, Clock, CheckCircle, XCircle,
    Star, ThumbsUp, Calendar, MessageCircle, Flag,
    ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { useCurrency } from '../../hooks/useCurrency';
import { formatOrderPrice } from '../../utils/currencyHelpers';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../ProgressBar';

const AgencyOrderSummaryCard = ({ order, sessionStats, sessions, user, onAction, onRefresh, onShowResolution }) => {
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [mentorReview, setMentorReview] = useState(null);
    const [studentReview, setStudentReview] = useState(null);
    const { convertPrice, getCurrencySymbol, currency } = useCurrency();
    const navigate = useNavigate();

    const hasUserReviewed = (user?.userType === 'buyer' || user?.userType === 'agency')
        ? order?.studentReviewed
        : order?.mentorReviewed;

    useEffect(() => {
        if (order?.deliveryStatus === 'completed') {
            fetchOrderReviews();
        }
    }, [order]);

    const fetchOrderReviews = async () => {
        if (!order) return;
        setLoadingReviews(true);
        try {
            const response = await axiosInstance.get(`/api/v1/reviews/order/${order._id}`);
            if (response.data?.success && Array.isArray(response.data.data)) {
                const reviews = response.data.data;
                // Student's own review
                const myReview = reviews.find(r => r.reviewer?._id === user._id);
                setStudentReview(myReview || null);
                // Mentor's review
                const mentorReviewData = reviews.find(r =>
                    r.reviewerRole === 'mentor' && r.reviewee?._id === user._id
                );
                setMentorReview(mentorReviewData || null);
            }
        } catch (error) {
            console.error('Error fetching order reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleCompleteOrder = async () => {
        try {
            const response = await axiosInstance.post(`/api/v1/payments/orders/${order._id}/complete`);
            if (response.data?.success) {
                toast.success('Order completed successfully!');
                setShowCompleteModal(false);
                if (onAction) onAction();
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete order');
        }
    };

    const handleSubmitReview = async () => {
        if (!reviewData.comment.trim()) {
            toast.error('Please write a review comment');
            return;
        }

        try {
            const response = await axiosInstance.post(`/api/v1/reviews/order/${order._id}`, {
                rating: reviewData.rating,
                comment: reviewData.comment,
                privateFeedback: reviewData.privateFeedback || ""
            });

            if (response.data?.success) {
                toast.success('Review submitted successfully!');
                setShowReviewModal(false);
                setReviewData({ rating: 5, comment: '', privateFeedback: '' });
                if (onAction) onAction();
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            console.error('Review submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return '—';
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            paid: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            failed: { label: 'Failed', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            refunded: { label: 'Refunded', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    const getOrderStatusBadge = (status) => {
        const config = {
            confirmed: { label: 'Running', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
            completed: { label: 'Completed', bg: 'bg-blue-100', text: 'text-blue-700', icon: Package }
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    const getDeliveryStatusBadge = (status) => {
        const config = {
            pending: { label: 'Not Delivered', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
            delivered: { label: 'Delivered', bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
            completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle }
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Package size={18} />
                        Order Summary
                    </h3>
                </div>

                <div className="p-4 space-y-4">
                    {/* Booking Info */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500">Booking ID</p>
                            <p className="text-sm font-mono font-medium">{order.orderId?.slice(-12)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Booking Date</p>
                            <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                    </div>

                    {/* Mentor & Student */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Mentor</p>
                                <p className="font-medium text-gray-900">
                                    {order.mentorId?.firstName} {order.mentorId?.lastName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <User size={18} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Student</p>
                                <p className="font-medium text-gray-900">
                                    {order.studentId?.firstName} {order.studentId?.lastName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Plan Details */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Plan</span>
                            <span className="text-sm font-medium">{order.period} · {order.duration?.split('·')[0]}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Service</span>
                            <span className="text-sm font-medium">{order.serviceType}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-sm font-semibold text-gray-900">Amount</span>
                            <span className="text-lg font-bold text-primary">
                                {formatOrderPrice(order).formatted}
                            </span>
                        </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="bg-gray-50">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <p className="font-medium text-gray-600">Session Progress</p>
                        </div>

                        <ProgressBar total={sessionStats?.total} approved={sessionStats?.approved} />
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-col gap-2">
                        <span className='text-sm text-gray-600 flex items-center gap-1'>Payment: {getStatusBadge(order.paymentStatus)}</span>
                        <span className='text-sm text-gray-600 flex items-center gap-1'>Order: {getOrderStatusBadge(order.orderStatus || 'pending')}</span>
                        <span className='text-sm text-gray-600 flex items-center gap-1'>Delivery: {getDeliveryStatusBadge(order.deliveryStatus || 'pending')}</span>
                    </div>

                    {/* Action Buttons & Reviews for Student */}
                    <div className="space-y-2">
                        {/* Confirm & Complete Order */}
                        {order.deliveryStatus === 'delivered' && order.orderStatus !== 'completed' && (
                            <button
                                onClick={() => setShowCompleteModal(true)}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} />
                                Confirm & Complete Order
                            </button>
                        )}

                        {/* Order Completed Section */}
                        {order.deliveryStatus === 'completed' && (
                            <>
                                {loadingReviews ? (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Student's own review (of the mentor) */}
                                        {!hasUserReviewed ? (
                                            <button
                                                onClick={() => setShowReviewModal(true)}
                                                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
                                            >
                                                <Star size={16} />
                                                Leave a Review for Mentor
                                            </button>
                                        ) : studentReview ? (
                                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900">Your Review (for Mentor)</h4>
                                                    <span className="text-xs text-gray-500">
                                                        {studentReview.createdAt ? format(new Date(studentReview.createdAt), 'MMM d, yyyy') : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={16}
                                                            className={star <= (studentReview.rating || 0)
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"}
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {studentReview.rating}.0 / 5
                                                    </span>
                                                </div>
                                                {studentReview.comment && (
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                        {studentReview.comment}
                                                    </p>
                                                )}
                                                <div className="text-xs text-green-600 flex items-center gap-1">
                                                    <CheckCircle size={12} />
                                                    Your review submitted
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Mentor's review (of the student) */}
                                        {mentorReview ? (
                                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900">Mentor's Review (of you)</h4>
                                                    <span className="text-xs text-gray-500">
                                                        {mentorReview.createdAt ? format(new Date(mentorReview.createdAt), 'MMM d, yyyy') : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={16}
                                                            className={star <= (mentorReview.rating || 0)
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"}
                                                        />
                                                    ))}
                                                    <span className="ml-2 text-sm text-gray-600">
                                                        {mentorReview.rating}.0 / 5
                                                    </span>
                                                </div>
                                                {mentorReview.comment && (
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                        {mentorReview.comment}
                                                    </p>
                                                )}
                                                <div className="text-xs text-blue-600 flex items-center gap-1">
                                                    <ThumbsUp size={12} />
                                                    Feedback from mentor
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                                <p className="text-sm text-gray-500">Mentor hasn't left a review yet.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        <button onClick={() => navigate(`/freelancer/${order?.mentorId?._id}`)} className='bg-blue-950 text-white py-2 px-4 rounded-md w-full flex items-center gap-2 justify-center text-sm'><span>Book This Mentor Again</span> <ArrowRight size={14} /></button>
                    </div>

                    {/* Need Help Card */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-4">
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Flag size={18} className="text-red-500" />
                                Need help?
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Having an issue with this order?
                            </p>
                            <button
                                onClick={onShowResolution}
                                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Flag size={16} />
                                Resolution Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complete Order Confirmation Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Confirm Order Completion</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600">
                                Are you sure you want to mark this order as completed? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => setShowCompleteModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteOrder}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Yes, Complete Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Leave a Review</h3>
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setReviewData({ rating: 5, comment: '', privateFeedback: '' });
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                size={24}
                                                className={star <= reviewData.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Review
                                </label>
                                <textarea
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    rows={4}
                                    placeholder="Share your experience with this mentor..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowReviewModal(false);
                                        setReviewData({ rating: 5, comment: '', privateFeedback: '' });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgencyOrderSummaryCard;