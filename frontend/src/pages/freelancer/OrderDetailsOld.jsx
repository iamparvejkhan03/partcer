import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    Clock,
    Calendar,
    DollarSign,
    User,
    MessageCircle,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Upload,
    ChevronRight,
    Star,
    Send,
    Paperclip,
    MoreVertical,
    Flag,
    HelpCircle,
    Loader,
    Check,
    Copy,
    ExternalLink,
    Package,
    Truck,
    Home,
    Phone,
    Mail,
    MapPin,
    Award,
    Shield,
    RefreshCw,
    ArrowLeft,
    Eye,
    Plus,
    Trash2,
    MessagesSquare,
    ThumbsUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Header } from '../../components';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { otherData } from '../../assets';

const FreelancerOrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requirements');
    const [reviewData, setReviewData] = useState({
        rating: 0,
        comment: '',
        privateFeedback: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Delivery state
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [deliveryFiles, setDeliveryFiles] = useState([]);
    const [deliveryPreviews, setDeliveryPreviews] = useState([]);
    const [submittingDelivery, setSubmittingDelivery] = useState(false);
    const [showDeliveryForm, setShowDeliveryForm] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);

    // Revision state
    const [revisionRequest, setRevisionRequest] = useState('');
    const [revisionFiles, setRevisionFiles] = useState([]);
    const [revisionPreviews, setRevisionPreviews] = useState([]);
    const [submittingRevision, setSubmittingRevision] = useState(false);
    const [showRevisionForm, setShowRevisionForm] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    // Cancellation
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Dispute
    const [disputeData, setDisputeData] = useState({
        reason: '',
        description: '',
        files: []
    });
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [disputing, setDisputing] = useState(false);

    const [orderReviews, setOrderReviews] = useState([]);

    // Fetch order details
    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
            fetchOrderReviews();
        }
    }, [orderId]);

    // Cleanup preview URLs
    useEffect(() => {
        return () => {
            deliveryPreviews.forEach(preview => URL.revokeObjectURL(preview));
            revisionPreviews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, [deliveryPreviews, revisionPreviews]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/orders/${orderId}`);

            if (response.data?.success) {
                setOrder(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            toast.error('Failed to load order details');
            navigate('/freelancer/orders');
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async () => {
        if (reviewData.rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!reviewData.comment || reviewData.comment.length < 10) {
            toast.error('Please write a review with at least 10 characters');
            return;
        }

        try {
            setSubmittingReview(true);

            // Use the new review endpoint
            const response = await axiosInstance.post(`/api/v1/reviews/order/${orderId}`, {
                rating: reviewData.rating,
                comment: reviewData.comment,
                privateFeedback: reviewData.privateFeedback || ''
            });

            if (response.data?.success) {
                toast.success('Review submitted successfully');
                setShowReviewForm(false);
                setReviewData({ rating: 0, comment: '', privateFeedback: '' });

                // Refresh order details to show the review
                fetchOrderDetails();

                // Also fetch the order reviews to display them
                fetchOrderReviews();
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const fetchOrderReviews = async () => {
        try {
            const response = await axiosInstance.get(`/api/v1/reviews/order/${orderId}`);

            if (response.data?.success) {
                setOrderReviews(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching order reviews:', err);
            // Don't show toast for this as it's not critical
        }
    };

    const handleDeliveryUpload = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/zip', 'application/x-zip-compressed'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            toast.error('Only images, PDF, and ZIP files are allowed');
            return;
        }

        // Validate file size (max 50MB for deliverables)
        const maxSize = 50 * 1024 * 1024;
        const oversizedFiles = files.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
            toast.error('Each file must be less than 50MB');
            return;
        }

        // Limit to 5 files
        if (deliveryFiles.length + files.length > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }

        // Create preview URLs for images
        const newPreviews = files.map(file => {
            if (file.type.startsWith('image/')) {
                return URL.createObjectURL(file);
            }
            return null;
        });

        setDeliveryPreviews([...deliveryPreviews, ...newPreviews]);
        setDeliveryFiles([...deliveryFiles, ...files]);
    };

    const removeDeliveryFile = (index) => {
        if (deliveryPreviews[index]) {
            URL.revokeObjectURL(deliveryPreviews[index]);
        }
        const newFiles = [...deliveryFiles];
        const newPreviews = [...deliveryPreviews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setDeliveryFiles(newFiles);
        setDeliveryPreviews(newPreviews);
    };

    const handleRevisionUpload = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            toast.error('Only images and PDF files are allowed');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        const oversizedFiles = files.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
            toast.error('Each file must be less than 10MB');
            return;
        }

        // Limit to 3 files
        if (revisionFiles.length + files.length > 3) {
            toast.error('Maximum 3 files allowed');
            return;
        }

        // Create preview URLs for images
        const newPreviews = files.map(file => {
            if (file.type.startsWith('image/')) {
                return URL.createObjectURL(file);
            }
            return null;
        });

        setRevisionPreviews([...revisionPreviews, ...newPreviews]);
        setRevisionFiles([...revisionFiles, ...files]);
    };

    const removeRevisionFile = (index) => {
        if (revisionPreviews[index]) {
            URL.revokeObjectURL(revisionPreviews[index]);
        }
        const newFiles = [...revisionFiles];
        const newPreviews = [...revisionPreviews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setRevisionFiles(newFiles);
        setRevisionPreviews(newPreviews);
    };

    const submitDelivery = async () => {
        if (!deliveryMessage.trim() && deliveryFiles.length === 0) {
            toast.error('Please provide a message or upload files');
            return;
        }

        try {
            setSubmittingDelivery(true);

            const formData = new FormData();
            formData.append('message', deliveryMessage);

            deliveryFiles.forEach(file => {
                formData.append('attachments', file);
            });

            const response = await axiosInstance.post(
                `/api/v1/orders/${orderId}/deliver`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data?.success) {
                toast.success('Delivery submitted successfully');
                setShowDeliveryForm(false);
                setDeliveryMessage('');
                setDeliveryFiles([]);
                setDeliveryPreviews([]);
                fetchOrderDetails();
            }
        } catch (err) {
            console.error('Error submitting delivery:', err);
            toast.error(err.response?.data?.message || 'Failed to submit delivery');
        } finally {
            setSubmittingDelivery(false);
        }
    };

    const handleStartOrder = async () => {
        try {
            const response = await axiosInstance.patch(`/api/v1/orders/${orderId}/status`, {
                status: 'active'
            });

            if (response.data?.success) {
                toast.success('Order started successfully');
                fetchOrderDetails();
            }
        } catch (err) {
            console.error('Error starting order:', err);
            toast.error(err.response?.data?.message || 'Failed to start order');
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            setCancelling(true);

            const response = await axiosInstance.post(`/api/v1/orders/${orderId}/cancel`, {
                reason: cancelReason
            });

            if (response.data?.success) {
                toast.success('Order cancelled successfully');
                setShowCancelModal(false);
                fetchOrderDetails();
            }
        } catch (err) {
            console.error('Error cancelling order:', err);
            toast.error(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const handleOpenDispute = async () => {
        if (!disputeData.reason || !disputeData.description) {
            toast.error('Please provide reason and description');
            return;
        }

        try {
            setDisputing(true);

            const formData = new FormData();
            formData.append('reason', disputeData.reason);
            formData.append('description', disputeData.description);

            disputeData.files.forEach(file => {
                formData.append('attachments', file);
            });

            const response = await axiosInstance.post(
                `/api/v1/orders/${orderId}/dispute`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data?.success) {
                toast.success('Dispute opened successfully');
                setShowDisputeModal(false);
                fetchOrderDetails();
            }
        } catch (err) {
            console.error('Error opening dispute:', err);
            toast.error(err.response?.data?.message || 'Failed to open dispute');
        } finally {
            setDisputing(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'MMM d, yyyy • h:mm a');
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock },
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active', icon: RefreshCw },
            delivered: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Delivered', icon: Package },
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: CheckCircle },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: XCircle },
            disputed: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Disputed', icon: Flag },
            refunded: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Refunded', icon: DollarSign }
        };
        const badge = config[status] || config.pending;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon size={12} />
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
                    <Link
                        to="/freelancer/orders"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        View My Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-16 bg-gray-50">
            <Header />
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <Container>
                    <div className="py-5">
                        <nav className="flex items-center text-sm text-gray-600">
                            <Link to="/" className="hover:text-primary">Home</Link>
                            <ChevronRight size={14} className="mx-2" />
                            <Link to="/freelancer/dashboard" className="hover:text-primary">Dashboard</Link>
                            <ChevronRight size={14} className="mx-2" />
                            <Link to="/freelancer/orders" className="hover:text-primary">My Orders</Link>
                            <ChevronRight size={14} className="mx-2" />
                            <span className="text-primary font-medium">{order.orderId}</span>
                        </nav>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Order Details
                                </h1>
                                {getStatusBadge(order.status)}
                            </div>
                            <p className="text-gray-600">
                                Order ID: <span className="font-mono">{order.orderId}</span> •
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <Link
                            to="/freelancer/orders"
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                            <ArrowLeft size={16} />
                            Back to Orders
                        </Link>
                    </div>

                    {/* Order Progress */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Truck size={20} className="text-primary" />
                            Order Progress
                        </h2>
                        <div className="relative">
                            {/* Progress Line */}
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
                            <div
                                className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                                style={{
                                    width: order.status === 'pending' ? '0%' :
                                        order.status === 'active' ? '33%' :
                                            order.status === 'delivered' ? '66%' :
                                                order.status === 'completed' ? '100%' : '0%'
                                }}
                            ></div>

                            {/* Steps */}
                            <div className="relative flex justify-between">
                                <div className="text-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${['pending', 'active', 'delivered', 'completed'].includes(order.status)
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        <Clock size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">Pending</span>
                                </div>
                                <div className="text-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${['active', 'delivered', 'completed'].includes(order.status)
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        <RefreshCw size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">Active</span>
                                </div>
                                <div className="text-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${['delivered', 'completed'].includes(order.status)
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        <Package size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">Delivered</span>
                                </div>
                                <div className="text-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${order.status === 'completed'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        <CheckCircle size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6 overflow-x-auto">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'details'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Order Details
                            </button>
                            <button
                                onClick={() => setActiveTab('requirements')}
                                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'requirements'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Order Requirements
                            </button>
                            <button
                                onClick={() => setActiveTab('deliveries')}
                                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'deliveries'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Deliveries
                            </button>
                            {/* <button
                                onClick={() => setActiveTab('messages')}
                                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'messages'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Messages
                            </button> */}

                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'reviews'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Reviews
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Details Tab */}
                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    {/* Service Info */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <ShoppingBag size={18} className="text-primary" />
                                            Service Details
                                        </h3>
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={order.service?.gallery?.[0]?.url || '/default-service.jpg'}
                                                alt={order.details?.title}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 mb-1">
                                                    <Link to={`/service/${order.service?.id}`}>{order.details?.title}</Link>
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {order.details?.package?.name} Package
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {order.timeline?.deadline ? 'Due ' + formatDate(order.timeline.deadline) : 'No deadline'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign size={12} />
                                                        ${order.pricing?.total?.toFixed(2)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <RefreshCw size={12} />
                                                        {order.details?.package?.revisions > 0 ? `${order.details.package.revisions} Revisions` : 'No Revisions'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Package Features */}
                                        {order.details?.package?.features?.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <h5 className="text-sm font-medium text-gray-900 mb-2">What's included:</h5>
                                                <ul className="grid grid-cols-2 gap-2">
                                                    {order.details.package.features.map((feature, idx) => (
                                                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                                            <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Client Info */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <User size={18} className="text-primary" />
                                            Client Information
                                        </h3>
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={order.buyer?.profileImage || '/default-avatar.png'}
                                                alt={order.buyer?.displayName}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">
                                                    {order.buyer?.displayName || `${order.buyer?.firstName} ${order.buyer?.lastName}`}
                                                </h4>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                                        <Mail size={14} />
                                                        {order.buyer?.email}
                                                    </p>
                                                    {order.buyer?.phone && (
                                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                                            <Phone size={14} />
                                                            {order.buyer?.phone}
                                                        </p>
                                                    )}
                                                    {(order.buyer?.country || order.buyer?.city) && (
                                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                                            <MapPin size={14} />
                                                            {[order.buyer?.city, order.buyer?.country].filter(Boolean).join(', ')}
                                                        </p>
                                                    )}

                                                </div>
                                                <div className="mt-3 flex items-start justify-start flex-wrap sm:flex-nowrap gap-2">
                                                    <Link
                                                        to={`/${user?.userType}/chat?user=${order?.buyer?._id}`}
                                                        className="w-auto bg-primary hover:bg-primary/90 text-white border border-orange-500 font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center gap-1 justify-center"
                                                    >
                                                        <MessagesSquare size={20} />
                                                        <span>Message</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Calendar size={18} className="text-primary" />
                                            Order Timeline
                                        </h3>
                                        <div className="space-y-4">
                                            {order.timeline?.orderedAt && (
                                                <div className="flex gap-3">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Order Placed</p>
                                                        <p className="text-sm text-gray-600">{formatDate(order.timeline.orderedAt)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {order.timeline?.startedAt && (
                                                <div className="flex gap-3">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Order Started</p>
                                                        <p className="text-sm text-gray-600">{formatDate(order.timeline.startedAt)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {order.timeline?.deliveredAt && (
                                                <div className="flex gap-3">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Delivered</p>
                                                        <p className="text-sm text-gray-600">{formatDate(order.timeline.deliveredAt)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {order.timeline?.completedAt && (
                                                <div className="flex gap-3">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Completed</p>
                                                        <p className="text-sm text-gray-600">{formatDate(order.timeline.completedAt)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {order.timeline?.deadline && (
                                                <div className="flex gap-3">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-orange-500"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Deadline</p>
                                                        <p className="text-sm text-gray-600">{formatDate(order.timeline.deadline)}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Requirements Tab */}
                            {activeTab === 'requirements' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText size={18} className="text-primary" />
                                        Client Requirements
                                    </h3>

                                    {order.requirements?.status === 'submitted' || order.requirements?.text || order.requirements?.attachments?.length > 0 ? (
                                        <div>
                                            {/* Requirements Text */}
                                            {order.requirements?.text && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-gray-700 whitespace-pre-line">{order.requirements.text}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Attachments */}
                                            {order.requirements?.attachments?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                                                    <div className="space-y-2">
                                                        {order.requirements.attachments.map((file, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                                            >
                                                                <Paperclip size={16} className="text-gray-500 group-hover:text-primary" />
                                                                <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                                                                <span className="text-xs text-gray-400">
                                                                    {(file.size / 1024).toFixed(1)} KB
                                                                </span>
                                                                <Download size={14} className="text-gray-400 group-hover:text-primary" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Submitted Date */}
                                            {order.requirements?.submittedAt && (
                                                <p className="text-xs text-gray-500 mt-4">
                                                    Submitted on {formatDate(order.requirements.submittedAt)}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-600">No requirements submitted yet</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                The client hasn't provided any requirements.
                                            </p>
                                        </div>
                                    )}

                                    {order.status === 'pending' && (
                                        <button
                                            onClick={handleStartOrder}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-5"
                                        >
                                            Start Order
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Deliveries Tab */}
                            {activeTab === 'deliveries' && (
                                <div className="space-y-4">
                                    {/* Combine current delivery (if exists) with history */}
                                    {(() => {
                                        // Create an array of all deliveries (current + history)
                                        const allDeliveries = [];

                                        // Add current delivery first if it exists
                                        if (order.delivery?.current) {
                                            allDeliveries.push({
                                                ...order.delivery.current,
                                                isCurrent: true
                                            });
                                        }

                                        // Add history deliveries
                                        if (order.delivery?.history?.length > 0) {
                                            allDeliveries.push(...order.delivery.history.map(d => ({
                                                ...d,
                                                isCurrent: false
                                            })));
                                        }

                                        return allDeliveries.length > 0 ? (
                                            allDeliveries.reverse().map((delivery, index) => (
                                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {delivery.isCurrent && (
                                                                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                                        Latest
                                                                    </span>
                                                                )}
                                                                {delivery.isRevision && (
                                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                                        Revision
                                                                    </span>
                                                                )}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                Submitted on {formatDate(delivery.submittedAt)}
                                                            </p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${delivery.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            delivery.status === 'revision_requested' ? 'bg-yellow-100 text-yellow-700' :
                                                                delivery.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    delivery.status === 'pending_review' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {delivery.status === 'pending_review' ? 'Pending Review' :
                                                                delivery.status === 'revision_requested' ? 'Revisions Requested' :
                                                                    delivery.status}
                                                        </span>
                                                    </div>

                                                    {delivery.message && (
                                                        <p className="text-gray-700 mb-3">{delivery.message}</p>
                                                    )}

                                                    {delivery.attachments?.length > 0 && (
                                                        <div className="mb-3">
                                                            <h5 className="text-sm font-medium text-gray-900 mb-2">Attachments</h5>
                                                            <div className="space-y-2">
                                                                {delivery.attachments.map((file, idx) => (
                                                                    <a
                                                                        key={idx}
                                                                        href={file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        <Paperclip size={16} className="text-gray-500" />
                                                                        <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                                                                        <Download size={14} className="text-gray-400" />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Client Feedback */}
                                                    {delivery.feedback && (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                            <p className="text-xs text-gray-500 mb-1">Client Feedback:</p>
                                                            <p className="text-sm text-gray-700">{delivery.feedback}</p>
                                                        </div>
                                                    )}

                                                    {/* Revision Request Action */}
                                                    {/* {delivery.status === 'revision_requested' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDelivery(delivery);
                                                                setShowDeliveryModal(true);
                                                            }}
                                                            className="mt-4 w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg text-sm"
                                                        >
                                                            Deliver Again
                                                        </button>
                                                    )} */}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">No Deliveries Yet</h3>
                                                <p className="text-gray-600 mb-4">
                                                    You haven't delivered anything for this order yet.
                                                </p>
                                                {order.status === 'active' && (
                                                    <button
                                                        onClick={() => setShowDeliveryModal(true)}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                                    >
                                                        <Plus size={18} />
                                                        Deliver Order
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Delivery Form */}
                                    {showDeliveryForm && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold text-gray-900">Submit Delivery</h3>
                                                <button
                                                    onClick={() => setShowDeliveryForm(false)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>

                                            <textarea
                                                value={deliveryMessage}
                                                onChange={(e) => setDeliveryMessage(e.target.value)}
                                                rows={4}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
                                                placeholder="Describe what you've delivered..."
                                            />

                                            {/* File Upload */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Attachments (Optional)
                                                </label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleDeliveryUpload}
                                                        className="hidden"
                                                        id="delivery-upload"
                                                    />
                                                    <label htmlFor="delivery-upload" className="cursor-pointer">
                                                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                                        <p className="text-sm text-gray-600">
                                                            Click to upload or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Max 5 files • Images, PDF, ZIP (50MB each)
                                                        </p>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* File Previews */}
                                            {deliveryFiles.length > 0 && (
                                                <div className="mb-4 space-y-2">
                                                    {deliveryFiles.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                {deliveryPreviews[index] ? (
                                                                    <img
                                                                        src={deliveryPreviews[index]}
                                                                        alt="preview"
                                                                        className="w-10 h-10 object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <Paperclip size={20} className="text-gray-400" />
                                                                )}
                                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => removeDeliveryFile(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                onClick={submitDelivery}
                                                disabled={submittingDelivery}
                                                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {submittingDelivery ? (
                                                    <>
                                                        <Loader className="animate-spin" size={18} />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={18} />
                                                        Submit Delivery
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Messages Tab */}
                            {activeTab === 'messages' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="text-center py-12">
                                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">Messages</h3>
                                        <p className="text-gray-600 mb-4">
                                            Chat with the client about this order
                                        </p>
                                        <Link
                                            to={`/messages?order=${order._id}`}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                        >
                                            <MessageCircle size={18} />
                                            Go to Messages
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Reviews Section  */}
                            {activeTab === 'reviews' && orderReviews?.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Star size={18} className="text-primary" />
                                        Reviews
                                    </h3>

                                    <div className="space-y-4">
                                        {orderReviews.map((review) => (
                                            <div key={review._id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                                {/* Review Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={review.reviewer?.profileImage || '/default-avatar.png'}
                                                            alt={review.reviewer?.displayName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {review.reviewer?.displayName || `${review.reviewer?.firstName} ${review.reviewer?.lastName}`}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {review.reviewerRole === 'buyer' ? 'Student' : 'Mentor'} • {formatDate(review.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={16}
                                                                className={star <= review.rating
                                                                    ? 'fill-amber-400 text-amber-400'
                                                                    : 'text-gray-300'
                                                                }
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Review Comment */}
                                                <p className="text-gray-700 mb-3">{review.comment}</p>

                                                {/* Private Feedback (only visible to the recipient) */}
                                                {review.privateFeedback && (
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-xs text-gray-500 mb-1">Private Feedback:</p>
                                                        <p className="text-sm text-gray-600">{review.privateFeedback}</p>
                                                    </div>
                                                )}

                                                {/* Order Context */}
                                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Package size={12} />
                                                        {review.orderContext?.packageName} Package
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign size={12} />
                                                        ${review.orderContext?.packagePrice}
                                                    </span>
                                                </div>

                                                {/* Helpful Button */}
                                                {/* <button
                                                    onClick={() => handleHelpful(review._id)}
                                                    className="mt-3 text-xs text-gray-500 hover:text-primary flex items-center gap-1"
                                                >
                                                    <ThumbsUp size={14} />
                                                    Helpful ({review.helpful?.count || 0})
                                                </button> */}

                                                {/* Verified Purchase Badge */}
                                                <div className="mt-2 inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                    <CheckCircle size={12} />
                                                    Verified
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

                                {/* Price Breakdown */}
                                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">${order.pricing?.subtotal?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Platform Fee</span>
                                        <span className="font-medium">-${order.pricing?.platformFee?.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-medium text-gray-900">Your Earnings</span>
                                    <span className="text-2xl font-bold text-primary">${order.pricing?.sellerEarnings?.toFixed(2)}</span>
                                </div>

                                {/* Payment Status */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Payment Status</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Status</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment?.status === 'paid' ? 'bg-green-100 text-green-700' :
                                            order.payment?.status === 'held' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.payment?.status}
                                        </span>
                                    </div>
                                    {order.payment?.method && (
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-gray-600">Method</span>
                                            <span className="text-sm font-medium capitalize">
                                                {order.payment.method.replace('_', ' ')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Revisions Info */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Revisions</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Used / Allowed</span>
                                        <span className="font-medium">
                                            {order.delivery?.revisions?.used || 0} / {order.delivery?.revisions?.allowed || 2}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{
                                                width: `${((order.delivery?.revisions?.used || 0) / (order.delivery?.revisions?.allowed || 2)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    {order.status === 'pending' && order?.requirements?.status !== 'pending' && (
                                        <button
                                            onClick={handleStartOrder}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                        >
                                            Start Order
                                        </button>
                                    )}

                                    {order.status === 'active' && (
                                        <>
                                            <button
                                                onClick={() => setShowDeliveryModal(true)}
                                                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                            >
                                                Deliver Order
                                            </button>
                                            <button
                                                onClick={() => setShowCancelModal(true)}
                                                className="w-full border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors"
                                            >
                                                Cancel Order
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'delivered' && (
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-xs text-blue-700 flex items-start gap-2">
                                                <Clock size={14} className="flex-shrink-0 mt-0.5" />
                                                <span>Waiting for client to review your delivery.</span>
                                            </p>
                                        </div>
                                    )}

                                    {(order.status === 'active' || order.status === 'delivered') && (
                                        <button
                                            onClick={() => setShowDisputeModal(true)}
                                            className="w-full border border-orange-300 text-orange-600 hover:bg-orange-50 font-medium py-3 px-4 rounded-lg transition-colors"
                                        >
                                            Open Dispute
                                        </button>
                                    )}

                                    {order.status === 'completed' && (
                                        (() => {
                                            // Check if current user has already reviewed
                                            const hasReviewed = orderReviews?.some(
                                                review => review.reviewer?._id === user?._id
                                            );

                                            return !hasReviewed ? (
                                                <button
                                                    onClick={() => setShowReviewForm(true)}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                                >
                                                    Leave a Review
                                                </button>
                                            ) : (
                                                <div className="p-3 bg-green-50 rounded-lg">
                                                    <p className="text-xs text-green-700 flex items-start gap-2">
                                                        <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                                                        <span>You've already reviewed this order.</span>
                                                    </p>
                                                </div>
                                            );
                                        })()
                                    )}

                                    {order.status === 'disputed' && (
                                        <div className="p-3 bg-orange-50 rounded-lg">
                                            <p className="text-xs text-orange-700 flex items-start gap-2">
                                                <Flag size={14} className="flex-shrink-0 mt-0.5" />
                                                <span>Dispute is under review. We'll get back to you within 48 hours.</span>
                                            </p>
                                        </div>
                                    )}

                                    {order.status === 'completed' && (
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-xs text-green-700 flex items-start gap-2">
                                                <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                                                <span>Order completed successfully! Payment will be released soon.</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Need Help */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-start gap-2">
                                        <HelpCircle size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-600">
                                                Need help with this order? Contact our support team.
                                            </p>
                                            <a
                                                href={`mailto:${otherData?.email}`}
                                                className="text-xs text-primary hover:underline mt-1 inline-block"
                                            >
                                                {otherData?.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Order</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for cancellation *
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Please provide a reason..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery Modal */}
            {showDeliveryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Deliver Order</h3>
                            <button
                                onClick={() => {
                                    setShowDeliveryModal(false);
                                    setDeliveryMessage('');
                                    setDeliveryFiles([]);
                                    setDeliveryPreviews([]);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <textarea
                            value={deliveryMessage}
                            onChange={(e) => setDeliveryMessage(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
                            placeholder="Describe what you've delivered..."
                        />

                        {/* File Upload */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attachments (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleDeliveryUpload}
                                    className="hidden"
                                    id="delivery-modal-upload"
                                />
                                <label htmlFor="delivery-modal-upload" className="cursor-pointer">
                                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                    <p className="text-sm text-gray-600">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max 5 files • Images, PDF, ZIP (50MB each)
                                    </p>
                                </label>
                            </div>
                        </div>

                        {/* File Previews */}
                        {deliveryFiles.length > 0 && (
                            <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
                                {deliveryFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {deliveryPreviews[index] ? (
                                                <img
                                                    src={deliveryPreviews[index]}
                                                    alt="preview"
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            ) : (
                                                <Paperclip size={20} className="text-gray-400" />
                                            )}
                                            <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeDeliveryFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeliveryModal(false);
                                    setDeliveryMessage('');
                                    setDeliveryFiles([]);
                                    setDeliveryPreviews([]);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await submitDelivery();
                                    setShowDeliveryModal(false);
                                }}
                                disabled={submittingDelivery}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submittingDelivery ? (
                                    <>
                                        <Loader className="animate-spin" size={18} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Delivery
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form Modal */}
            {showReviewForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Leave a Review</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating *
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
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-gray-300'
                                            }
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Public Review *
                            </label>
                            <textarea
                                value={reviewData.comment}
                                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="Share your experience with this freelancer..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Private Feedback (Optional)
                            </label>
                            <textarea
                                value={reviewData.privateFeedback}
                                onChange={(e) => setReviewData({ ...reviewData, privateFeedback: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="Any private feedback for the platform?"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReviewForm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitReview}
                                disabled={submittingReview}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispute Modal */}
            {showDisputeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Open Dispute</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide details about the issue.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason *
                                </label>
                                <select
                                    value={disputeData.reason}
                                    onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select reason</option>
                                    <option value="unresponsive">Client unresponsive</option>
                                    <option value="scope_changes">Constant scope changes</option>
                                    <option value="harassment">Harassment or abuse</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={disputeData.description}
                                    onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="Describe the issue in detail..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowDisputeModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleOpenDispute}
                                disabled={disputing}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                {disputing ? 'Opening...' : 'Open Dispute'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FreelancerOrderDetails;