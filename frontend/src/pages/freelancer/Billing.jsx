import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    CreditCard,
    Building,
    MapPin,
    Mail,
    Phone,
    User,
    Globe,
    Lock,
    Check,
    X,
    Plus,
    Download,
    Shield,
    Wallet,
    Banknote,
    Calendar,
    AlertCircle,
    Loader2
} from "lucide-react";
import { Container, FreelancerContainer, FreelancerHeader, FreelancerSidebar } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import useCountryStates from "../../hooks/useCountryStates";

// Add this near the top of your component, after the imports
const AddCardModal = ({ isOpen, onClose, onAddCard }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        // Mock card data - In real app, this would be handled by payment gateway (Stripe, etc.)
        const newCard = {
            id: Date.now(),
            type: data.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
            last4: data.cardNumber.slice(-4),
            name: data.cardholderName,
            expiry: `${data.expiryMonth}/${data.expiryYear.slice(-2)}`,
            isDefault: false
        };
        onAddCard(newCard);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Card</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Cardholder Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cardholder Name *
                                </label>
                                <input
                                    type="text"
                                    {...register("cardholderName", { required: "Cardholder name is required" })}
                                    placeholder="Name on card"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                {errors.cardholderName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cardholderName.message}</p>
                                )}
                            </div>

                            {/* Card Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Card Number *
                                </label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        {...register("cardNumber", {
                                            required: "Card number is required",
                                            pattern: {
                                                value: /^[0-9]{16}$/,
                                                message: "Enter a valid 16-digit card number"
                                            }
                                        })}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength={16}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                {errors.cardNumber && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                                )}
                            </div>

                            {/* Expiry and CVV */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiry Date *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            {...register("expiryMonth", { required: "Month is required" })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="">MM</option>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            {...register("expiryYear", { required: "Year is required" })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="">YYYY</option>
                                            {Array.from({ length: 10 }, (_, i) => {
                                                const year = new Date().getFullYear() + i;
                                                return <option key={year} value={year}>{year}</option>;
                                            })}
                                        </select>
                                    </div>
                                    {(errors.expiryMonth || errors.expiryYear) && (
                                        <p className="mt-1 text-sm text-red-600">Expiry date is required</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CVV *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            {...register("cvv", {
                                                required: "CVV is required",
                                                pattern: {
                                                    value: /^[0-9]{3,4}$/,
                                                    message: "Enter a valid CVV"
                                                }
                                            })}
                                            placeholder="123"
                                            maxLength={4}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                    {errors.cvv && (
                                        <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Set as Default */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("setAsDefault")}
                                    id="setAsDefault"
                                    className="w-4 h-4 text-primary rounded border-gray-300"
                                />
                                <label htmlFor="setAsDefault" className="text-sm text-gray-700">
                                    Set as default withdrawal method
                                </label>
                            </div>

                            {/* Security Note */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Shield size={16} className="text-gray-500 mt-0.5" />
                                    <p className="text-xs text-gray-600">
                                        Your card details are securely encrypted and never stored on our servers.
                                        We use industry-standard security measures to protect your information.
                                    </p>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
                                >
                                    Add Card
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

function Billing() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("billing");
    const [selectedWithdrawalMethod, setSelectedWithdrawalMethod] = useState("upi");
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [cards, setCards] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [countriesList, setCountriesList] = useState([]);

    const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            companyName: "",
            country: "",
            city: "",
            address: "",
            postalCode: "",
            email: "",
            phone: "",

            // UPI
            upiId: "",

            // PayPal
            paypalEmail: "",

            // Payoneer
            payoneerEmail: "",

            // Bank Details
            bankAccountTitle: "",
            bankAccountNumber: "",
            bankName: "",
            bankRoutingNumber: "",
            bankIban: "",
            bankBic: "",
        }
    });

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            const countriesData = await countriesAPI();
            setCountries(countriesData);
            setCountriesList(countriesData.map(c => c.name));
        };
        fetchCountries();
    }, []);

    // Fetch user data and payment methods
    useEffect(() => {
        if (user) {
            // Populate user billing info
            setValue("firstName", user.firstName || "");
            setValue("lastName", user.lastName || "");
            setValue("email", user.email || "");
            setValue("phone", user.phone || "");
            setValue("country", user.country || "");
            setValue("city", user.city || "");
            setValue("address", user.address || "");
            setValue("postalCode", user.postalCode || "");
            setValue("companyName", user.companyName || "");

            // Fetch payment methods
            fetchPaymentMethods();
        }
    }, [user]);

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/v1/payment-details');
            if (response.data.success) {
                setPaymentMethods(response.data.data);

                // Populate form with existing data if any
                response.data.data.forEach(method => {
                    if (method.paypalEmail) {
                        setValue("paypalEmail", method.paypalEmail);
                        if (method.isDefault) setSelectedWithdrawalMethod("paypal");
                    }
                    if (method.payoneerEmail) {
                        setValue("payoneerEmail", method.payoneerEmail);
                        if (method.isDefault) setSelectedWithdrawalMethod("payoneer");
                    }
                    if (method.upiId) {
                        setValue("upiId", method.upiId);
                        if (method.isDefault) setSelectedWithdrawalMethod("upi");
                    }
                    if (method.bankDetails?.accountNumber) {
                        setValue("bankAccountTitle", method.bankDetails.accountTitle || "");
                        setValue("bankAccountNumber", method.bankDetails.accountNumber || "");
                        setValue("bankName", method.bankDetails.bankName || "");
                        setValue("bankRoutingNumber", method.bankDetails.routingNumber || "");
                        setValue("bankIban", method.bankDetails.iban || "");
                        setValue("bankBic", method.bankDetails.bic || "");
                        if (method.isDefault) setSelectedWithdrawalMethod("bank");
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            toast.error('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const onSubmitBilling = async (data) => {
        setSubmitting(true);
        try {
            // Update user profile with billing info
            const formData = new FormData();
            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            formData.append('phone', data.phone);
            formData.append('country', data.country);
            formData.append('city', data.city);
            formData.append('address', data.address);
            formData.append('postalCode', data.postalCode);
            formData.append('companyName', data.companyName);

            const response = await axiosInstance.put('/api/v1/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success('Billing details updated successfully!');
            }
        } catch (error) {
            console.error('Error updating billing details:', error);
            toast.error(error?.response?.data?.message || 'Failed to update billing details');
        } finally {
            setSubmitting(false);
        }
    };

    const onSubmitWithdrawal = async (data) => {
        setSubmitting(true);
        try {
            let response;

            if (selectedWithdrawalMethod === "paypal") {
                response = await axiosInstance.post('/api/v1/payment-details/paypal', {
                    paypalEmail: data.paypalEmail,
                    isDefault: true
                });
            } else if (selectedWithdrawalMethod === "upi") {
                response = await axiosInstance.post('/api/v1/payment-details/upi', {
                    upiId: data.upiId,
                    isDefault: true
                });
            } else if (selectedWithdrawalMethod === "payoneer") {
                response = await axiosInstance.post('/api/v1/payment-details/payoneer', {
                    payoneerEmail: data.payoneerEmail,
                    isDefault: true
                });
            } else if (selectedWithdrawalMethod === "bank") {
                response = await axiosInstance.post('/api/v1/payment-details/bank', {
                    accountTitle: data.bankAccountTitle,
                    accountNumber: data.bankAccountNumber,
                    bankName: data.bankName,
                    routingNumber: data.bankRoutingNumber,
                    iban: data.bankIban,
                    bic: data.bankBic,
                    isDefault: true
                });
            }

            if (response?.data?.success) {
                toast.success('Withdrawal method saved successfully!');
                await fetchPaymentMethods(); // Refresh payment methods
            }
        } catch (error) {
            console.error('Error saving withdrawal method:', error);
            toast.error(error?.response?.data?.message || 'Failed to save withdrawal method');
        } finally {
            setSubmitting(false);
        }
    };

    // Combined submit handler for the main form
    const onSubmit = async (data) => {
        if (activeTab === "billing") {
            await onSubmitBilling(data);
        } else if (activeTab === "withdrawal") {
            await onSubmitWithdrawal(data);
        }
    };

    // Update the handleAddCard function
    const handleAddCard = () => {
        setIsAddingCard(true);
    };

    // Add this function to handle adding a new card
    const handleAddNewCard = (newCard) => {
        setCards([...cards, newCard]);
        setIsAddingCard(false);
        toast.success('Card added successfully!');
    };

    const handleSetDefaultCard = (cardId) => {
        setCards(cards.map(card => ({
            ...card,
            isDefault: card.id === cardId
        })));
        toast.success('Default card updated');
    };

    const handleRemoveCard = (cardId) => {
        setCards(cards.filter(card => card.id !== cardId));
        toast.success('Card removed successfully');
    };

    const tabs = [
        { id: "billing", label: "Billing Details", icon: <User size={18} /> },
        { id: "withdrawal", label: "Withdrawal Methods", icon: <CreditCard size={18} /> },
        // { id: "plan", label: "Subscription Plan", icon: <Shield size={18} /> },
    ];

    const withdrawalMethods = [
        { id: "upi", label: "Setup UPI Account", icon: "UPI", description: "Receive payments via UPI" },
        // { id: "paypal", label: "Setup PayPal Account", icon: "PayPal", description: "Receive payments via PayPal" },
        // { id: "payoneer", label: "Setup Payoneer Account", icon: "Payoneer", description: "Receive payments via Payoneer" },
        // { id: "bank", label: "Setup Bank Account", icon: <Banknote size={20} />, description: "Direct bank transfer" },
    ];

    const currentPlan = {
        name: "Basic Plan",
        daysLeft: 20,
        features: ["Up to 5 active projects", "Basic support", "3% platform fee"],
        price: "$29/month",
        nextBilling: "March 10, 2024"
    };

    if (loading) {
        return (
            <section className="flex min-h-screen">
                <FreelancerSidebar />
                <div className="w-full relative">
                    <FreelancerHeader />
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <FreelancerSidebar />

            <div className="w-full relative">
                <FreelancerHeader />

                <FreelancerContainer>
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 py-6 md:py-8 mt-20 md:mt-0">
                        <div className="container mx-auto px-4 md:px-0">
                            <div className="flex items-center justify-between flex-wrap gap-y-3">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                        <CreditCard size={28} className="text-primary" />
                                        Billing Information
                                    </h1>
                                    <p className="text-gray-600 mt-2">
                                        Manage your billing details, withdrawal methods, and subscription plan
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    form="billing-form"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={20} />
                                            Save All Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="container mx-auto py-6 md:py-8 px-4 md:px-0">
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <form id="billing-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* Billing Details Tab */}
                            {activeTab === "billing" && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <User size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">Billing Details</h2>
                                                <p className="text-gray-600 text-sm">Update your personal billing information</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* First Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("firstName", { required: "First name is required" })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                                )}
                                            </div>

                                            {/* Last Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("lastName", { required: "Last name is required" })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                                                )}
                                            </div>

                                            {/* Company Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Company Name
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("companyName")}
                                                    placeholder="Enter your company title"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>

                                            {/* Country */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Country *
                                                </label>
                                                <select
                                                    {...register("country", { required: "Country is required" })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                >
                                                    <option value="">Choose country</option>
                                                    {countriesList.map(country => (
                                                        <option key={country} value={country}>{country}</option>
                                                    ))}
                                                </select>
                                                {errors.country && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                                                )}
                                            </div>

                                            {/* City */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("city", { required: "City is required" })}
                                                    placeholder="Enter city"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.city && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                                                )}
                                            </div>

                                            {/* Postal Code */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Postal Code *
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("postalCode", { required: "Postal code is required" })}
                                                    placeholder="Enter postal code"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.postalCode && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                                                )}
                                            </div>

                                            {/* Address - Full width */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Address *
                                                </label>
                                                <textarea
                                                    {...register("address", { required: "Address is required" })}
                                                    placeholder="Enter your complete address"
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.address && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                                )}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email *
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="email"
                                                        {...register("email", {
                                                            required: "Email is required",
                                                            pattern: {
                                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                message: "Invalid email address"
                                                            }
                                                        })}
                                                        placeholder="Enter email address"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone *
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="tel"
                                                        {...register("phone", {
                                                            required: "Phone is required",
                                                            pattern: {
                                                                value: /^[0-9\-+() ]{10,15}$/,
                                                                message: "Invalid phone number"
                                                            }
                                                        })}
                                                        placeholder="Enter phone number"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Withdrawal Methods Tab */}
                            {activeTab === "withdrawal" && (
                                <div className="space-y-8">
                                    {/* Withdrawal Methods Selection */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6 md:p-8">
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Wallet size={20} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900">Payouts Method</h2>
                                                    <p className="text-gray-600 text-sm">
                                                        Choose withdrawal method to receive your earned amount. Leaving this empty may cause withdrawal delays.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-6">
                                                {withdrawalMethods.map((method) => (
                                                    <label
                                                        key={method.id}
                                                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${selectedWithdrawalMethod === method.id
                                                            ? "border-primary bg-primary/5"
                                                            : "border-gray-200 hover:border-gray-300"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-lg ${selectedWithdrawalMethod === method.id ? "bg-primary text-white" : "bg-gray-100"}`}>
                                                                {typeof method.icon === 'string' ? (
                                                                    <span className="font-semibold">{method.icon}</span>
                                                                ) : (
                                                                    method.icon
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{method.label}</div>
                                                                <div className="text-sm text-gray-500">{method.description}</div>
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="paymentMethod"
                                                            value={method.id}
                                                            checked={selectedWithdrawalMethod === method.id}
                                                            onChange={() => setSelectedWithdrawalMethod(method.id)}
                                                            className="w-4 h-4 text-primary"
                                                        />
                                                    </label>
                                                ))}
                                            </div>

                                            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                                                    <div className="text-sm text-blue-800">
                                                        <p className="font-medium">Important:</p>
                                                        <p className="mt-1">For further information, read our <a href="#" className="underline hover:text-blue-900">Terms and Conditions</a> and Privacy Policy.</p>
                                                    </div>
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>

                                    {/* Selected Withdrawal Method Form */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6 md:p-8">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                                {selectedWithdrawalMethod === "upi" && "UPI Setup"}
                                                {selectedWithdrawalMethod === "paypal" && "PayPal Account Setup"}
                                                {selectedWithdrawalMethod === "payoneer" && "Payoneer Account Setup"}
                                                {selectedWithdrawalMethod === "bank" && "Bank Account Details"}
                                            </h3>

                                            {selectedWithdrawalMethod === "paypal" && (
                                                <div className="max-w-md">
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            PayPal Email Address *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            {...register("paypalEmail", {
                                                                required: "PayPal email is required",
                                                                pattern: {
                                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                    message: "Invalid email address"
                                                                }
                                                            })}
                                                            placeholder="Enter your PayPal email"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        {errors.paypalEmail && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.paypalEmail.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Ensure this email is associated with an active PayPal account.
                                                    </div>
                                                </div>
                                            )}

                                            {selectedWithdrawalMethod === "upi" && (
                                                <div className="max-w-md">
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            UPI ID *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            {...register("upiId", {
                                                                required: "UPI ID is required"
                                                            })}
                                                            placeholder="Enter your UPI ID"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        {errors.upiId && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.upiId.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Ensure this ID is associated with an active UPI account.
                                                    </div>
                                                </div>
                                            )}

                                            {selectedWithdrawalMethod === "payoneer" && (
                                                <div className="max-w-md">
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Payoneer Email Address *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            {...register("payoneerEmail", {
                                                                required: "Payoneer email is required",
                                                                pattern: {
                                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                                    message: "Invalid email address"
                                                                }
                                                            })}
                                                            placeholder="Enter your Payoneer email"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        {errors.payoneerEmail && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.payoneerEmail.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Ensure this email is associated with an active Payoneer account.
                                                    </div>
                                                </div>
                                            )}

                                            {selectedWithdrawalMethod === "bank" && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Bank Account Title *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            {...register("bankAccountTitle", { required: "Account title is required" })}
                                                            placeholder="Account holder name"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        {errors.bankAccountTitle && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.bankAccountTitle.message}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Bank Account Number *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            {...register("bankAccountNumber", { required: "Account number is required" })}
                                                            placeholder="Enter account number"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        {errors.bankAccountNumber && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.bankAccountNumber.message}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Bank Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            {...register("bankName", { required: "Bank name is required" })}
                                                            placeholder="Enter bank name"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        {errors.bankName && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Routing Number *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            {...register("bankRoutingNumber", { required: "Routing number is required" })}
                                                            placeholder="Enter routing number"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        {errors.bankRoutingNumber && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.bankRoutingNumber.message}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            IBAN (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            {...register("bankIban")}
                                                            placeholder="Enter IBAN"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            BIC/SWIFT (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            {...register("bankBic")}
                                                            placeholder="Enter BIC/SWIFT code"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Withdrawal Method Action Buttons */}
                                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <Loader2 size={18} className="animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        "Save Withdrawal Method"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Saved Cards Section - Commented as requested */}
                                    {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6 md:p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Saved Cards</h3>
                                                    <p className="text-gray-600 text-sm">Cards saved for subscription payments</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingCard(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                                                >
                                                    <Plus size={18} />
                                                    Add New Card
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {cards.map((card) => (
                                                    <div
                                                        key={card.id}
                                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-lg ${card.type === 'visa' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                                                {card.type === 'visa' ? 'VISA' : 'MC'}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{card.name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {card.type === 'visa' ? 'Visa' : 'Mastercard'} •••• {card.last4}
                                                                    {card.isDefault && (
                                                                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                                                            Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-400">Expires {card.expiry}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {!card.isDefault && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSetDefaultCard(card.id)}
                                                                    className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded"
                                                                >
                                                                    Set as default
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveCard(card.id)}
                                                                className="p-2 text-gray-400 hover:text-red-600"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {cards.length === 0 && (
                                                    <div className="text-center py-8">
                                                        <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                                                        <h4 className="text-lg font-medium text-gray-700 mb-2">No cards saved</h4>
                                                        <p className="text-gray-500">Add a card to make subscription payments easier</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div> */}
                                </div>
                            )}

                            {/* Subscription Plan Tab - Commented as requested */}
                            {/* {activeTab === "plan" && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Shield size={20} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">Subscription Plan</h2>
                                                <p className="text-gray-600 text-sm">Manage your membership and billing cycle</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2">
                                                <div className="bg-gradient-to-r from-primary to-primary/90 rounded-xl p-6 text-white">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                                        <div>
                                                            <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <Calendar size={18} />
                                                                <span>Next billing: {currentPlan.nextBilling}</span>
                                                            </div>
                                                            <div className="text-3xl font-bold mb-2">{currentPlan.price}</div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mb-6">
                                                        {currentPlan.features.map((feature, index) => (
                                                            <div key={index} className="flex items-center gap-2">
                                                                <Check size={16} />
                                                                <span>{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <button
                                                            type="button"
                                                            className="px-4 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100"
                                                        >
                                                            Upgrade Plan
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="px-4 py-2 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10"
                                                        >
                                                            Change Payment Method
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h4>
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-medium text-gray-900">February 2025</span>
                                                            <span className="font-semibold">$29.00</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">Paid on Feb 10, 2025</div>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-medium text-gray-900">January 2025</span>
                                                            <span className="font-semibold">$29.00</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">Paid on Jan 10, 2025</div>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-medium text-gray-900">December 2024</span>
                                                            <span className="font-semibold">$29.00</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">Paid on Dec 10, 2024</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
                                                >
                                                    <Download size={16} />
                                                    Download All
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-8 p-4 bg-red-50 rounded-lg">
                                            <h4 className="font-medium text-red-800 mb-2">Cancel Subscription</h4>
                                            <p className="text-sm text-red-600 mb-3">
                                                Once you cancel, you'll lose access to premium features at the end of your billing cycle.
                                            </p>
                                            <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100">
                                                Cancel Subscription
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )} */}
                        </form>
                    </div>

                    {/* Add Card Modal */}
                    <AddCardModal
                        isOpen={isAddingCard}
                        onClose={() => setIsAddingCard(false)}
                        onAddCard={handleAddNewCard}
                    />
                </FreelancerContainer>
            </div>
        </section>
    );
}

export default Billing;