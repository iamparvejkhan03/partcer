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
    Calendar,
    AlertCircle,
    ShoppingBag,
    DollarSign,
    FileText,
    Clock,
    ChevronRight,
    Receipt,
    Smartphone,
    Laptop,
    Loader2
} from "lucide-react";
import { AgencyContainer, AgencyHeader, AgencySidebar } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import useCountryStates from "../../hooks/useCountryStates";

// Add Card Modal (kept as is)
const AddCardModal = ({ isOpen, onClose, onAddCard }) => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        const newCard = {
            id: Date.now(),
            type: data.cardNumber.startsWith('4') ? 'visa' :
                data.cardNumber.startsWith('5') ? 'mastercard' :
                    data.cardNumber.startsWith('3') ? 'amex' : 'visa',
            last4: data.cardNumber.slice(-4),
            name: data.cardholderName,
            expiry: `${data.expiryMonth}/${data.expiryYear.slice(-2)}`,
            isDefault: data.setAsDefault || false
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

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register("setAsDefault")}
                                    id="setAsDefault"
                                    className="w-4 h-4 text-primary rounded border-gray-300"
                                />
                                <label htmlFor="setAsDefault" className="text-sm text-gray-700">
                                    Set as default payment method
                                </label>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Shield size={16} className="text-gray-500 mt-0.5" />
                                    <p className="text-xs text-gray-600">
                                        Your card details are securely encrypted and never stored on our servers.
                                        We use industry-standard security measures to protect your information.
                                    </p>
                                </div>
                            </div>

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
    const { user, updateUserData, fetchCurrentUser } = useAuth();
    const [activeTab, setActiveTab] = useState("billing");
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [countriesList, setCountriesList] = useState([]);

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            agencyName: "",
            country: "",
            city: "",
            address: "",
            postalCode: "",
            email: "",
            phone: "",
        }
    });

    // Mock transaction history (keeping as is)
    const transactions = [
        { id: "ORD-2246872", date: "2025-05-19", service: "Website UI/UX Design", amount: 500, status: "completed", paymentMethod: "Visa •••• 1568" },
        { id: "ORD-9519785", date: "2025-05-18", service: "E-commerce Development", amount: 200, status: "completed", paymentMethod: "Mastercard •••• 4321" },
        { id: "ORD-9854988", date: "2025-05-17", service: "Mobile App UI/UX Design", amount: 200, status: "pending", paymentMethod: "Visa •••• 1568" },
        { id: "ORD-3365479", date: "2025-05-16", service: "Logo Design Package", amount: 80, status: "completed", paymentMethod: "PayPal" },
        { id: "ORD-7891389", date: "2025-05-15", service: "SEO Optimization Service", amount: 45, status: "completed", paymentMethod: "Visa •••• 1568" },
    ];

    const currentPlan = {
        name: "Basic Plan",
        price: "$29/month",
        nextBilling: "March 10, 2025",
        paymentMethod: "Visa •••• 1568",
        features: [
            "Access to all services",
            "Basic support",
            "5% platform fee",
            "Standard delivery times"
        ]
    };

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            const countriesData = await countriesAPI();
            setCountries(countriesData);
            setCountriesList(countriesData.map(c => c.name));
        };
        fetchCountries();
    }, []);

    // Fetch fresh user data on mount
    useEffect(() => {
        const loadUserData = async () => {
            if (user && !initialFetchDone) {
                try {
                    const freshUserData = await fetchCurrentUser();
                    if (freshUserData) {
                        populateFormFields(freshUserData);
                    }
                } catch (error) {
                    console.error('Failed to fetch fresh user data:', error);
                    if (user) {
                        populateFormFields(user);
                    }
                } finally {
                    setInitialFetchDone(true);
                }
            } else if (user) {
                populateFormFields(user);
            }
        };

        loadUserData();
    }, [user, initialFetchDone]);

    const populateFormFields = (userData) => {
        setValue("firstName", userData.firstName || "");
        setValue("lastName", userData.lastName || "");
        setValue("agencyName", userData.agencyName || "");
        setValue("country", userData.country || "");
        setValue("city", userData.city || "");
        setValue("address", userData.address || "");
        setValue("postalCode", userData.postalCode || "");
        setValue("email", userData.email || "");
        setValue("phone", userData.phone || "");
    };

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const formData = new FormData();

            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            formData.append('phone', data.phone);
            formData.append('country', data.country);
            formData.append('city', data.city);
            formData.append('address', data.address);
            formData.append('postalCode', data.postalCode);

            // For agency, we can also update agencyName
            if (data.agencyName) {
                formData.append('agencyName', data.agencyName);
            }

            const response = await axiosInstance.put('/api/v1/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const updatedUser = response.data.data;
                updateUserData(updatedUser);
                toast.success('Billing information updated successfully!');
            }
        } catch (error) {
            console.error('Error updating billing details:', error);
            toast.error(error?.response?.data?.message || 'Failed to update billing details');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddNewCard = (newCard) => {
        setCards([...cards, newCard]);
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
        { id: "billing", label: "Billing Details", icon: <User size={18} />, mobileLabel: "Details" },
        // { id: "payment", label: "Payment Methods", icon: <CreditCard size={18} />, mobileLabel: "Payment" },
        // { id: "transactions", label: "Transaction History", icon: <Receipt size={18} />, mobileLabel: "History" },
        // { id: "plan", label: "Subscription Plan", icon: <Shield size={18} />, mobileLabel: "Plan" },
    ];

    if (!initialFetchDone) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AgencySidebar />
                <div className="w-full relative">
                    <AgencyHeader />
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AgencySidebar />

            <div className="w-full relative">
                <AgencyHeader />

                <AgencyContainer>
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 py-6 md:py-8 px-4 md:px-0 mt-20 md:mt-0">
                        <div className="container mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                        <CreditCard size={28} className="text-primary" />
                                        Billing & Payments
                                    </h1>
                                    <p className="text-gray-600 mt-2">
                                        Manage your billing information
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    form="billing-form"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={20} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="container mx-auto py-6 md:py-8 px-4 md:px-0">
                        {/* Tabs - Mobile Responsive */}
                        <div className="flex flex-nowrap overflow-x-auto md:flex-wrap gap-2 mb-8 pb-2 md:pb-0 scrollbar-hide">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 md:px-5 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.mobileLabel}</span>
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
                                                <p className="text-gray-600 text-sm">Update your billing address and contact information</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("firstName")}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.firstName && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("lastName")}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.lastName && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Company Name
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("agencyName")}
                                                    placeholder="Enter company name"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Country
                                                </label>
                                                <select
                                                    {...register("country")}
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

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("city")}
                                                    placeholder="Enter city"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.city && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Postal Code
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("postalCode")}
                                                    placeholder="Enter postal code"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.postalCode && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                                                )}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Address
                                                </label>
                                                <textarea
                                                    {...register("address")}
                                                    placeholder="Enter your complete address"
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                {errors.address && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                                )}
                                            </div>

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

                                            {/* <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tax ID / VAT Number (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("taxId")}
                                                    placeholder="Enter tax ID if applicable"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div> */}
                                        </div>

                                        <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    "Update Billing Details"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Methods Tab - Commented as requested */}
                            {/* {activeTab === "payment" && (
                                <div className="space-y-8">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-6 md:p-8">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                                                    <p className="text-gray-600 text-sm">Cards saved for making payments</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddingCard(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium w-full sm:w-auto justify-center"
                                                >
                                                    <Plus size={18} />
                                                    Add New Card
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {cards.map((card) => (
                                                    <div
                                                        key={card.id}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 gap-4"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-lg ${
                                                                card.type === 'visa' ? 'bg-blue-100 text-blue-800' : 
                                                                card.type === 'mastercard' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-purple-100 text-purple-800'
                                                            }`}>
                                                                {card.type === 'visa' ? 'VISA' : 
                                                                 card.type === 'mastercard' ? 'MC' : 'AMEX'}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{card.name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {card.type === 'visa' ? 'Visa' : 
                                                                     card.type === 'mastercard' ? 'Mastercard' : 'American Express'} •••• {card.last4}
                                                                    {card.isDefault && (
                                                                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                                                            Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-400">Expires {card.expiry}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-14 sm:ml-0">
                                                            {!card.isDefault && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSetDefaultCard(card.id)}
                                                                    className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded"
                                                                >
                                                                    Set default
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
                                                        <p className="text-gray-500">Add a card to make payments faster</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <Shield size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div className="text-sm text-blue-800">
                                                        <p className="font-medium">Secure Payments:</p>
                                                        <p className="mt-1">All transactions are encrypted and secure. We never store your full card details.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )} */}

                            {/* Transaction History Tab - Commented as requested */}
                            {/* {activeTab === "transactions" && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Receipt size={20} className="text-green-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
                                                <p className="text-gray-600 text-sm">View all your payments and downloads receipts</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Total Spent</p>
                                                <p className="text-2xl font-bold text-gray-900">$1,025</p>
                                                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Transactions</p>
                                                <p className="text-2xl font-bold text-gray-900">24</p>
                                                <p className="text-xs text-gray-500 mt-1">All time</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Avg. Order Value</p>
                                                <p className="text-2xl font-bold text-gray-900">$187</p>
                                                <p className="text-xs text-gray-500 mt-1">Per transaction</p>
                                            </div>
                                        </div>

                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {transactions.map((tx) => (
                                                        <tr key={tx.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.id}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">{tx.date}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">{tx.service}</td>
                                                            <td className="px-4 py-3 text-sm font-bold text-gray-900">${tx.amount}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {tx.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">{tx.paymentMethod}</td>
                                                            <td className="px-4 py-3">
                                                                <button className="text-primary hover:text-primary-dark">
                                                                    <Download size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="md:hidden space-y-4">
                                            {transactions.map((tx) => (
                                                <div key={tx.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-medium text-gray-500">{tx.id}</span>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {tx.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-medium text-gray-900 mb-2">{tx.service}</h4>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm text-gray-500">{tx.date}</span>
                                                        <span className="font-bold text-gray-900">${tx.amount}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500">{tx.paymentMethod}</span>
                                                        <button className="text-primary hover:text-primary-dark flex items-center gap-1 text-sm">
                                                            <Download size={16} />
                                                            Receipt
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 text-center">
                                            <button className="text-primary hover:text-primary-dark font-medium flex items-center gap-1 mx-auto">
                                                View All Transactions
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )} */}

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
                                                            <p className="text-white/80">Payment method: {currentPlan.paymentMethod}</p>
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
                </AgencyContainer>
            </div>
        </section>
    );
}

export default Billing;