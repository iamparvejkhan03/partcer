import React, { useState } from 'react';
import { Calendar, Clock, Briefcase, ChevronDown, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
    loadRazorpayScript,
    createOrder,
    verifyPayment,
    initiateRazorpayPayment
} from '../services/paymentService.js';
import { useCurrency } from '../hooks/useCurrency';

const PricingSection = ({ freelancerName, freelancerId, freelancerEmail }) => {
    const { user } = useAuth();
    const [selectedPeriod, setSelectedPeriod] = useState('per_day');
    const [selectedDuration, setSelectedDuration] = useState('standard');
    const [selectedService, setSelectedService] = useState('Job Support (Mentoring)');
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Get user type for pricing
    const userType = user?.userType || 'buyer';
    const isAgency = userType === 'agency';

    // Pricing data (mentor fee only - base prices)
    const pricingData = {
        per_day: {
            standard: {
                mentorFee: 1000,
                duration: "Standard (2-3 hrs)",
                periodLabel: "Per day"
            },
            full_day: {
                mentorFee: 2000,
                duration: "Full day (6-8 hrs)",
                periodLabel: "Per day"
            }
        },
        weekly: {
            standard: {
                mentorFee: 7500,
                duration: "Standard (2-3 hrs/day) · min 5 sessions",
                periodLabel: "Weekly"
            },
            full_day: {
                mentorFee: 15000,
                duration: "Full day (6-8 hrs) · min 5 sessions",
                periodLabel: "Weekly"
            }
        },
        monthly: {
            standard: {
                mentorFee: 30000,
                duration: "Standard (2-3 hrs/day) · min 21 sessions",
                periodLabel: "Monthly"
            },
            full_day: {
                mentorFee: 60000,
                duration: "Full day (6-8 hrs) · min 21 sessions",
                periodLabel: "Monthly"
            }
        }
    };

    // Calculate fees based on user type
    const calculateFees = (mentorFee) => {
        let partnerFeePercentage;
        let partnerFee;
        let learnerPays;

        if (isAgency) {
            // Agency: 7% fee
            partnerFeePercentage = 7;
            partnerFee = Math.round((mentorFee * partnerFeePercentage) / 100);
            learnerPays = mentorFee + partnerFee;
        } else {
            // Buyer/Student: 30% fee
            partnerFeePercentage = 30;
            partnerFee = Math.round((mentorFee * partnerFeePercentage) / 100);
            learnerPays = mentorFee + partnerFee;
        }

        return {
            mentorFee,
            partnerFee,
            partnerFeePercentage,
            learnerPays,
            isAgency
        };
    };

    const services = [
        { name: "Job Support (Mentoring)" },
        { name: "Skill Training" },
        { name: "Mock Interview Support" }
    ];

    const periods = [
        { id: 'per_day', label: 'Per day', icon: Clock },
        { id: 'weekly', label: 'Weekly', icon: Briefcase },
        { id: 'monthly', label: 'Monthly', icon: Calendar }
    ];

    const getDurationOptions = () => {
        return [
            { id: 'standard', label: 'Standard (2-3 hrs)' },
            { id: 'full_day', label: 'Full day (6-8 hrs)' }
        ];
    };

    const durationOptions = getDurationOptions();
    const basePricing = pricingData[selectedPeriod]?.[selectedDuration];
    const currentPricing = basePricing ? calculateFees(basePricing.mentorFee) : null;

    const { convertPrice, getCurrencySymbol, loading, rates, currency } = useCurrency();

    const handlePayment = async () => {
        if (!user) {
            toast.error('Please login to book a session');
            return;
        }

        if (user.userType !== 'buyer' && user.userType !== 'agency') {
            toast.error('Only students & agencies can book sessions');
            return;
        }

        setProcessing(true);

        try {
            // 1. Load Razorpay script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error('Failed to load payment gateway. Please try again.');
                setProcessing(false);
                return;
            }

            // 2. Determine which currency to use based on user's preference
            const useUSD = currency === 'USD';

            // Get the amount in the correct currency
            let amountToSend;
            let studentCurrency;
            let exchangeRate = null;

            if (useUSD) {
                amountToSend = convertPrice(currentPricing.learnerPays);
                studentCurrency = "USD";
                exchangeRate = rates.USD;
                exchangeRate = parseFloat((1 / rates.USD).toFixed(2));
            } else {
                amountToSend = currentPricing.learnerPays;
                studentCurrency = "INR";
                exchangeRate = null;
            }

            // 3. Create order on backend with currency info
            const orderData = {
                serviceType: selectedService,
                period: basePricing.periodLabel,
                duration: basePricing.duration,
                mentorId: freelancerId,
                studentPaidAmount: amountToSend,
                studentCurrency: studentCurrency,
                exchangeRateUsed: exchangeRate,
                originalINRAmount: currentPricing.learnerPays,
                mentorFeeINR: currentPricing.mentorFee,
                partnerFeeINR: currentPricing.partnerFee,
                userType: user.userType, // Send user type to backend
            };

            const response = await createOrder(orderData);

            if (!response.success) {
                throw new Error(response.message || 'Failed to create order');
            }

            const {
                razorpayOrderId,
                razorpayKeyId,
                amount,
                currency: razorpayCurrency
            } = response.data;

            // 4. Initialize Razorpay payment
            const paymentResponse = await initiateRazorpayPayment({
                keyId: razorpayKeyId,
                orderId: razorpayOrderId,
                amount: amount,
                currency: razorpayCurrency,
                description: `${selectedService} - ${basePricing.periodLabel} (${basePricing.duration})`,
                prefill: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    contact: user.phone || '',
                },
                theme: {
                    color: '#6366f1',
                },
            });

            // 5. Verify payment
            const verificationData = {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
            };

            const verifyResponse = await verifyPayment(verificationData);

            if (verifyResponse.success) {
                toast.success('Payment successful! Your booking has been confirmed.');
                setTimeout(() => {
                    window.location.href = `/buyer/orders/${verifyResponse.data.order._id}`;
                }, 2000);
            } else {
                throw new Error(verifyResponse.message || 'Payment verification failed');
            }

        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (!currentPricing) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary/5 to-transparent px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Select a Plan & Service</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Period and Duration determine the price — select any service you need
                        </p>
                    </div>
                    {/* <div className={`px-3 py-1 rounded-full text-xs font-medium ${isAgency ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isAgency ? '🤝 Agency Pricing (7% fee)' : '🎓 Student Pricing (30% fee)'}
                    </div> */}
                </div>
            </div>

            <div className="p-6">
                {/* Period Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Period
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {periods.map((period) => {
                            const Icon = period.icon;
                            const isSelected = selectedPeriod === period.id;
                            return (
                                <button
                                    key={period.id}
                                    onClick={() => {
                                        setSelectedPeriod(period.id);
                                        setSelectedDuration('standard');
                                    }}
                                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isSelected
                                        ? 'bg-primary text-white border-primary shadow-md'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-primary/5'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium text-sm">{period.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Duration Selection */}
                {durationOptions.length > 0 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Duration
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {durationOptions.map((duration) => (
                                <button
                                    key={duration.id}
                                    onClick={() => setSelectedDuration(duration.id)}
                                    className={`px-4 py-2 rounded-lg border transition-all duration-200 ${selectedDuration === duration.id
                                        ? 'bg-primary text-white border-primary shadow-md'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-primary/5'
                                        }`}
                                >
                                    <span className="text-sm">{duration.label}</span>
                                </button>
                            ))}
                        </div>
                        {selectedPeriod === 'weekly' && (
                            <p className="text-xs text-gray-500 mt-2">
                                ⓘ Minimum 5 sessions required for weekly plan
                            </p>
                        )}
                        {selectedPeriod === 'monthly' && (
                            <p className="text-xs text-gray-500 mt-2">
                                ⓘ Minimum 21 sessions required for monthly plan
                            </p>
                        )}
                    </div>
                )}

                {/* Service Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Service
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                            className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent flex justify-between items-center"
                        >
                            <span>{selectedService}</span>
                            <ChevronDown size={18} className={`transform transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showServiceDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                                {services.map((service, index) => (
                                    <div
                                        key={index}
                                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${selectedService === service.name ? 'bg-primary/5 text-primary' : ''
                                            }`}
                                        onClick={() => {
                                            setSelectedService(service.name);
                                            setShowServiceDropdown(false);
                                        }}
                                    >
                                        {service.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Price Breakdown Table */}
                {currentPricing && (
                    <div className="mb-6">
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                Period & Duration
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                Service
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                Mentor Fee
                                            </th>
                                            {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                Platform Fee ({currentPricing.partnerFeePercentage}%)
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                Total You Pay
                                            </th> */}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        <tr className="bg-white">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                <div className="font-medium">
                                                    {basePricing.periodLabel}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {basePricing.duration}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {selectedService}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {getCurrencySymbol()}{convertPrice(currentPricing.mentorFee).toLocaleString()}
                                                </div>
                                                {currency === 'INR' ? (
                                                    <div className="text-xs text-gray-500">
                                                        ~${(currentPricing.mentorFee * rates.USD).toFixed(2).toLocaleString('en-US')}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500">
                                                        ~₹{currentPricing.mentorFee.toLocaleString('en-IN')}
                                                    </div>
                                                )}
                                            </td>
                                            {/* <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {getCurrencySymbol()}{convertPrice(currentPricing.partnerFee).toLocaleString()}
                                                </div>
                                                {currency === 'INR' ? (
                                                    <div className="text-xs text-gray-500">
                                                        ~${(currentPricing.partnerFee * rates.USD).toFixed(2).toLocaleString('en-US')}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500">
                                                        ~₹{currentPricing.partnerFee.toLocaleString('en-IN')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-bold text-primary">
                                                    {getCurrencySymbol()}{convertPrice(currentPricing.learnerPays).toLocaleString()}
                                                </div>
                                                {currency === 'INR' ? (
                                                    <div className="text-xs text-gray-500">
                                                        ~${(currentPricing.learnerPays * rates.USD).toFixed(2).toLocaleString('en-US')}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500">
                                                        ~₹{currentPricing.learnerPays.toLocaleString('en-IN')}
                                                    </div>
                                                )}
                                            </td> */}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-blue-100 text-blue-700 rounded-lg mt-3 text-sm">
                            <Info size={14} />
                            Final amount shown at checkout.
                        </div>
                    </div>
                )}

                {/* Book Now Button */}
                <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {processing ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 size={20} className="animate-spin" />
                            Processing...
                        </div>
                    ) : (
                        `Book Now & Pay ${getCurrencySymbol()}${convertPrice(currentPricing.learnerPays).toLocaleString()}`
                    )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                    * Secure payment via Razorpay. Prices in USD, INR shown for reference.
                    {isAgency ? ' Agencies enjoy lower platform fees (7%).' : ' Students can update their currency preference at any time from their profile settings.'}
                    <br />
                </p>
            </div>
        </div>
    );
};

export default PricingSection;