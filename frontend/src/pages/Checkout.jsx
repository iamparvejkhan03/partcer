import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    ShoppingBag,
    Shield,
    Truck,
    CreditCard,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Lock,
    HelpCircle,
    Copy,
    Check,
    ExternalLink,
    DollarSign,
    Clock,
    Star,
    User,
    MapPin,
    Phone,
    Mail,
    Home,
    ChevronRight,
    Loader
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Container, Subheading, Heading, HeadingDescription } from '../components';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { otherData } from '../assets';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [service, setService] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [copiedField, setCopiedField] = useState(null);

    // Payment methods
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

    // Billing same as profile
    const [sameAsProfile, setSameAsProfile] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            country: '',
            postalCode: '',
            notes: ''
        }
    });

    // Get service data from location state
    useEffect(() => {
        const state = location.state;
        if (!state?.serviceId || state.packageIndex === undefined) {
            toast.error('No service selected');
            navigate('/services');
            return;
        }

        fetchServiceDetails(state.serviceId, state.packageIndex);
    }, [location, navigate]);

    // Set user data in form
    useEffect(() => {
        if (user && sameAsProfile) {
            setValue('fullName', user.displayName || `${user.firstName} ${user.lastName}`.trim());
            setValue('email', user.email);
            setValue('phone', user.phone || '');
            setValue('address', user.address || '');
            setValue('city', user.city || '');
            setValue('country', user.country || '');
            setValue('postalCode', user.postalCode || '');
        } else {
            reset({
                fullName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                country: '',
                postalCode: '',
                notes: ''
            });
        }
    }, [user, sameAsProfile, setValue]);

    const fetchServiceDetails = async (serviceId, packageIndex) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/services/${serviceId}`);

            if (response.data?.success) {
                const serviceData = response.data.data.service;
                setService(serviceData);

                // Get selected package
                const pkg = serviceData.packages?.[packageIndex];
                if (!pkg) {
                    toast.error('Package not found');
                    navigate('/services');
                    return;
                }
                setSelectedPackage({ ...pkg, index: packageIndex });

                // Get extras from state if any
                if (location.state?.extras) {
                    setSelectedExtras(location.state.extras);
                }
            }
        } catch (err) {
            console.error('Error fetching service:', err);
            toast.error('Failed to load service details');
            navigate('/services');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = () => {
        if (!selectedPackage) return { subtotal: 0, platformFee: 0, total: 0 };

        const packagePrice = selectedPackage.price;
        const extrasTotal = selectedExtras.reduce((sum, index) => {
            const extra = service?.extraOffers?.[index];
            return sum + (extra?.price || 0);
        }, 0);

        const subtotal = packagePrice + extrasTotal;
        const platformFee = subtotal * 0.1; // 10% platform fee
        const total = subtotal + platformFee;

        return {
            subtotal,
            platformFee,
            total,
            sellerEarnings: subtotal - platformFee
        };
    };

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
        toast.success('Copied to clipboard!');
    };

    const onSubmit = async (formData) => {
        try {
            setPlacingOrder(true);

            const totals = calculateTotals();

            // Prepare order data
            const orderData = {
                type: 'service',
                serviceId: service?._id,
                packageDetails: {
                    title: selectedPackage.title,
                    price: selectedPackage.price,
                    deliveryTime: selectedPackage.deliveryTime,
                    features: selectedPackage.features,
                    requirements: formData.notes || '',
                    revisions: selectedPackage.revisions || 0
                },
                billingInfo: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    country: formData.country,
                    postalCode: formData.postalCode
                },
                paymentMethod,
                notes: formData.notes,
                subtotal: totals.subtotal,
                platformFee: totals.platformFee,
                total: totals.total
            };

            // Create order
            const response = await axiosInstance.post('/api/v1/orders', orderData);

            const order = response.data.data;
            setCreatedOrder(order);
            setOrderPlaced(true);
            toast.success('Order placed successfully. Please submit the order requirements!');

            // Redirect based on user type
            if (user?.userType === 'buyer') {
                navigate(`/buyer/orders/${order._id}`);
            } else {
                // Fallback - should always be buyer, but just in case
                navigate(`/buyers/orders`);
            }
        } catch (err) {
            console.error('Error placing order:', err);
            const errorMessage = err.response?.data?.message || 'Failed to place order';
            toast.error(errorMessage);
        } finally {
            setPlacingOrder(false);
        }
    };

    const handleViewOrders = () => {
        navigate('/buyer/orders');
    };

    const handleBrowseServices = () => {
        navigate('/services');
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (!service || !selectedPackage) {
        return (
            <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">Unable to load checkout information</p>
                    <Link
                        to="/services"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Browse Services
                    </Link>
                </div>
            </div>
        );
    }

    const totals = calculateTotals();

    // Order Placed Success View
    if (orderPlaced && createdOrder) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-gray-50">
                <Container>
                    <div className="max-w-2xl mx-auto">
                        {/* Success Message */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Order Placed Successfully!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Your order has been placed and is pending admin approval.
                            </p>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                                    <span className="font-medium text-gray-900">Order ID</span>
                                    <span className="text-primary font-mono">{createdOrder.orderId}</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service</span>
                                        <span className="font-medium text-gray-900">{service.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Package</span>
                                        <span className="font-medium text-gray-900">{selectedPackage.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Amount</span>
                                        <span className="font-bold text-primary">${totals.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status</span>
                                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                            Pending Approval
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Instructions */}
                            <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left border border-blue-100">
                                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <CreditCard size={18} />
                                    Payment Instructions
                                </h3>
                                <p className="text-sm text-blue-800 mb-4">
                                    Please complete your payment using one of the methods below.
                                    Your order will be processed once payment is confirmed by admin.
                                </p>

                                {/* Bank Transfer Details */}
                                <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-600">🏦</span>
                                        </div>
                                        <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                                    </div>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Bank Name</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-gray-900">Global Trust Bank</span>
                                                <button
                                                    onClick={() => handleCopy('Global Trust Bank', 'bankName')}
                                                    className="text-gray-400 hover:text-primary"
                                                >
                                                    {copiedField === 'bankName' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Account Name</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-gray-900">Freelance Platform Inc.</span>
                                                <button
                                                    onClick={() => handleCopy('Freelance Platform Inc.', 'accountName')}
                                                    className="text-gray-400 hover:text-primary"
                                                >
                                                    {copiedField === 'accountName' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Account Number</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-gray-900">1234 5678 9012 3456</span>
                                                <button
                                                    onClick={() => handleCopy('1234567890123456', 'accountNumber')}
                                                    className="text-gray-400 hover:text-primary"
                                                >
                                                    {copiedField === 'accountNumber' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Routing Number</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-gray-900">021000021</span>
                                                <button
                                                    onClick={() => handleCopy('021000021', 'routing')}
                                                    className="text-gray-400 hover:text-primary"
                                                >
                                                    {copiedField === 'routing' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">SWIFT/BIC</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-gray-900">GTBUSA33</span>
                                                <button
                                                    onClick={() => handleCopy('GTBUSA33', 'swift')}
                                                    className="text-gray-400 hover:text-primary"
                                                >
                                                    {copiedField === 'swift' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Amount to Pay</span>
                                            <span className="font-bold text-primary">${totals.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* PayPal Details */}
                                <div className="bg-white rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-600">🅿️</span>
                                        </div>
                                        <h4 className="font-medium text-gray-900">PayPal</h4>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">PayPal Email</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-gray-900">payments@freelanceplatform.com</span>
                                                <button
                                                    onClick={() => handleCopy('payments@freelanceplatform.com', 'paypal')}
                                                    className="text-gray-400 hover:text-primary"
                                                >
                                                    {copiedField === 'paypal' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Amount to Send</span>
                                            <span className="font-bold text-primary">${totals.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-blue-700 mt-3">
                                    After making payment, please send the transaction ID to admin@platform.com
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleViewOrders}
                                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                                >
                                    View My Orders
                                </button>
                                <button
                                    onClick={handleBrowseServices}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Browse More Services
                                </button>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-start gap-3">
                                <HelpCircle className="text-gray-400 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Need help with your order? Contact our support team at{' '}
                                        <a href={`mailto:${otherData?.email}`} className="text-primary hover:underline">
                                            {otherData?.email}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    // Checkout Form View
    return (
        <div className="min-h-screen pt-20 pb-16 bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <Container>
                    <div className="py-5">
                        <nav className="flex items-center text-sm text-gray-600">
                            <Link to="/" className="hover:text-primary">Home</Link>
                            <ChevronRight size={14} className="mx-2" />
                            <Link to="/services" className="hover:text-primary">Services</Link>
                            <ChevronRight size={14} className="mx-2" />
                            <Link to={`/services/${service._id}`} className="hover:text-primary truncate max-w-[200px]">
                                {service.title}
                            </Link>
                            <ChevronRight size={14} className="mx-2" />
                            <span className="text-primary font-medium">Checkout</span>
                        </nav>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="max-w-full mx-auto">
                    {/* Header */}
                    <div className="my-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Complete Your Order
                        </h1>
                        <p className="text-gray-600">
                            You're just a few steps away from hiring {service.seller?.displayName || service.seller?.firstName}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Billing Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Billing Information */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User size={20} className="text-primary" />
                                        Billing Information
                                    </h2>

                                    {/* Use Profile Data Checkbox */}
                                    {user && (
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={sameAsProfile}
                                                    onChange={(e) => setSameAsProfile(e.target.checked)}
                                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    Use my profile information
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                {...register('fullName', { required: 'Full name is required' })}
                                                type="text"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="John Doe"
                                            />
                                            {errors.fullName && (
                                                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Email */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email *
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        {...register('email', {
                                                            required: 'Email is required',
                                                            pattern: {
                                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                                message: 'Invalid email address'
                                                            }
                                                        })}
                                                        type="email"
                                                        className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="john@example.com"
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone *
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        {...register('phone', { required: 'Phone number is required' })}
                                                        type="tel"
                                                        className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="+1 234 567 8900"
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address *
                                            </label>
                                            <div className="relative">
                                                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    {...register('address', { required: 'Address is required' })}
                                                    type="text"
                                                    className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="123 Main St"
                                                />
                                            </div>
                                            {errors.address && (
                                                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {/* City */}
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    City *
                                                </label>
                                                <input
                                                    {...register('city', { required: 'City is required' })}
                                                    type="text"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="New York"
                                                />
                                                {errors.city && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                                                )}
                                            </div>

                                            {/* Country */}
                                            <div className="col-span-2 md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Country *
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        {...register('country', { required: 'Country is required' })}
                                                        type="text"
                                                        className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="United States"
                                                    />
                                                </div>
                                                {errors.country && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
                                                )}
                                            </div>

                                            {/* Postal Code */}
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Postal Code *
                                                </label>
                                                <input
                                                    {...register('postalCode', { required: 'Postal code is required' })}
                                                    type="text"
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    placeholder="10001"
                                                />
                                                {errors.postalCode && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Notes */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <ShoppingBag size={20} className="text-primary" />
                                        Order Notes (Optional)
                                    </h2>
                                    <textarea
                                        {...register('notes')}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Any special requirements or instructions for the mentor?"
                                    />
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <CreditCard size={20} className="text-primary" />
                                        Payment Method
                                    </h2>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="bank_transfer"
                                                checked={paymentMethod === 'bank_transfer'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-900">Bank Transfer</span>
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                        Recommended
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Pay directly from your bank account. You'll receive bank details after placing order.
                                                </p>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="paypal"
                                                checked={paymentMethod === 'paypal'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-gray-900">PayPal</span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Pay using your PayPal account or credit card via PayPal.
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-blue-700 flex items-start gap-2">
                                            <Shield size={14} className="flex-shrink-0 mt-0.5" />
                                            <span>
                                                Your payment is secure. Funds will be held securely until you approve the work.
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button - Mobile */}
                                <div className="lg:hidden">
                                    <button
                                        type="submit"
                                        disabled={placingOrder}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {placingOrder ? (
                                            <>
                                                <Loader className="animate-spin" size={18} />
                                                Placing Order...
                                            </>
                                        ) : (
                                            <>
                                                Place Order
                                                <Lock size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Order Summary
                                </h2>

                                {/* Service Info */}
                                <div className="flex items-start gap-3 pb-4 mb-4 border-b border-gray-200">
                                    <img
                                        src={service.gallery?.[0]?.url || '/default-service.jpg'}
                                        alt={service.title}
                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div>
                                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                                            {service.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            by {service.seller?.displayName || service.seller?.firstName}
                                        </p>
                                    </div>
                                </div>

                                {/* Selected Package */}
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Package:</span>
                                            <span className="ml-2 font-medium text-gray-900">{selectedPackage.title}</span>
                                        </div>
                                        <span className="font-bold text-primary">${selectedPackage.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {selectedPackage.deliveryTime} day delivery
                                        </span>
                                        {selectedPackage.revisions > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span role="img" aria-label="revisions">🔄</span>
                                                {selectedPackage.revisions} revisions
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Extras */}
                                {selectedExtras.length > 0 && (
                                    <div className="mb-4 pb-4 border-b border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Extras Added:</h3>
                                        <div className="space-y-2">
                                            {selectedExtras.map((index) => {
                                                const extra = service.extraOffers?.[index];
                                                if (!extra) return null;
                                                return (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <span className="text-gray-600">{extra.title}</span>
                                                        <span className="font-medium">+${extra.price.toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Price Breakdown */}
                                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-1">
                                            Platform Fee (10%)
                                            <span className="relative group">
                                                <HelpCircle size={12} className="text-gray-400 cursor-help" />
                                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    Helps us run the platform
                                                </span>
                                            </span>
                                        </span>
                                        <span className="font-medium">${totals.platformFee.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-medium text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-primary">${totals.total.toFixed(2)}</span>
                                </div>

                                {/* What's Included */}
                                {selectedPackage.features?.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">What's included:</h3>
                                        <ul className="space-y-1">
                                            {selectedPackage.features.map((feature, idx) => (
                                                <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                                    <CheckCircle size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Submit Button - Desktop */}
                                <button
                                    type="submit"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={placingOrder}
                                    className="hidden lg:flex w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2"
                                >
                                    {placingOrder ? (
                                        <>
                                            <Loader className="animate-spin" size={18} />
                                            Placing Order...
                                        </>
                                    ) : (
                                        <>
                                            Place Order
                                            <Lock size={18} />
                                        </>
                                    )}
                                </button>

                                {/* Security Badge */}
                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                    <Shield size={14} />
                                    <span>Secure checkout</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <Lock size={14} />
                                    <span>SSL encrypted</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Checkout;