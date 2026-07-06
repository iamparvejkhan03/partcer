import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Info, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../hooks/useCurrency';
import {
    loadRazorpayScript,
    createOrder,
    verifyPayment,
    initiateRazorpayPayment
} from '../services/paymentService.js';

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [processing, setProcessing] = useState(false);

    // Get identifiers from URL parameters (NOT prices)
    const mentorId = searchParams.get('mentorId');
    const serviceType = searchParams.get('serviceType');
    const periodKey = searchParams.get('period'); // 'per_day', 'weekly', 'monthly'
    const durationKey = searchParams.get('duration'); // 'standard', 'full_day'
    const userType = user?.userType || 'buyer';
    const isAgency = userType === 'agency';

    const { convertPrice, getCurrencySymbol, rates, currency } = useCurrency();

    // ============ PRICING DATA (Same as PricingSection) ============
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
            partnerFeePercentage = 7;
            partnerFee = Math.round((mentorFee * partnerFeePercentage) / 100);
            learnerPays = mentorFee + partnerFee;
        } else {
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

    // Get the base pricing based on period and duration keys
    const basePricing = pricingData[periodKey]?.[durationKey];
    const currentPricing = basePricing ? calculateFees(basePricing.mentorFee) : null;

    // Format currency
    const formatCurrency = (amount) => {
        return `${getCurrencySymbol()}${convertPrice(amount).toLocaleString()}`;
    };

    // Handle back button
    const handleBack = () => {
        navigate(-1);
    };

    // Handle payment
    const handlePayment = async () => {
        if (!user) {
            toast.error('Please login to book a session');
            return;
        }

        if (user.userType !== 'buyer' && user.userType !== 'agency') {
            toast.error('Only students & agencies can book sessions');
            return;
        }

        if (!currentPricing) {
            toast.error('Invalid pricing configuration');
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

            // 3. Create order on backend
            const orderData = {
                serviceType: serviceType,
                period: basePricing.periodLabel,
                duration: basePricing.duration,
                mentorId: mentorId,
                studentPaidAmount: amountToSend,
                studentCurrency: studentCurrency,
                exchangeRateUsed: exchangeRate,
                originalINRAmount: currentPricing.learnerPays,
                mentorFeeINR: currentPricing.mentorFee,
                partnerFeeINR: currentPricing.partnerFee,
                userType: user.userType,
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
                description: `${serviceType} - ${basePricing.periodLabel} (${basePricing.duration})`,
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
                    navigate(`/${user.userType}/orders/${verifyResponse.data.order._id}`);
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

    // If no pricing data, show error
    if (!currentPricing || !basePricing) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Selection</h2>
                    <p className="text-gray-500 mb-4">Please go back and select a valid plan.</p>
                    <button
                        onClick={handleBack}
                        className="text-primary hover:underline"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/5 to-transparent px-6 py-4 border-b border-gray-200 flex items-center justify-start gap-5">
                        {/* Back Button */}
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Order Summary</h1>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Account Type Badge */}
                        <div className="flex items-center justify-between bg-blue-100 text-blue-500 py-2 px-4 rounded-md">
                            <div>
                                <p className="text-sm">Account: {isAgency ? 'Agency' : 'Student/Learner'}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${isAgency ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                                Service Fee: +{isAgency ? '7%' : '30%'}
                            </div>
                        </div>

                        {/* Plan Details */}
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Plan Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Plan</span>
                                    <span className="font-medium text-gray-900">{basePricing.periodLabel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-medium text-gray-900">{basePricing.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Service</span>
                                    <span className="font-medium text-gray-900">{serviceType}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Price Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Mentor Fee</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(currentPricing.mentorFee)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Platform Fee (+{currentPricing.partnerFeePercentage}%)
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(currentPricing.partnerFee)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-lg font-semibold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatCurrency(currentPricing.learnerPays)}
                                    </span>
                                </div>
                                {currency === 'INR' ? (
                                    <div className="text-right text-xs text-gray-400">
                                        ~${(currentPricing.learnerPays * rates.USD).toFixed(2).toLocaleString('en-US')} USD
                                    </div>
                                ) : (
                                    <div className="text-right text-xs text-gray-400">
                                        ~₹{currentPricing.learnerPays.toLocaleString('en-IN')} INR
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Button */}
                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Pay Now via Razorpay
                                    <span className="text-sm opacity-80">
                                        ({formatCurrency(currentPricing.learnerPays)})
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;