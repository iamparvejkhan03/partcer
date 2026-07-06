import { useState, useEffect } from 'react';
import { X, Star, Edit3, Info, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../hooks/useCurrency';

// Pricing data mapping
const PRICING_DATA = {
    // one_time: {
    //     standard: {
    //         mentorFee: 1000,
    //         partnerFee: 300,
    //         learnerPays: 1300,
    //         durationLabel: "Single session",
    //         periodLabel: "One-time"
    //     }
    // },
    per_day: {
        standard: {
            mentorFee: 1000,
            partnerFee: 200,
            learnerPays: 1200,
            durationLabel: "Standard (2-3 hrs)",
            periodLabel: "Per day"
        },
        full_day: {
            mentorFee: 2000,
            partnerFee: 300,
            learnerPays: 2300,
            durationLabel: "Full day (6-8 hrs)",
            periodLabel: "Per day"
        }
    },
    weekly: {
        standard: {
            mentorFee: 7500,
            partnerFee: 500,
            learnerPays: 8000,
            durationLabel: "Standard (2-3 hrs/day) · min 5 sessions",
            periodLabel: "Weekly"
        },
        full_day: {
            mentorFee: 15000,
            partnerFee: 1000,
            learnerPays: 16000,
            durationLabel: "Full day (6-8 hrs) · min 5 sessions",
            periodLabel: "Weekly"
        }
    },
    monthly: {
        standard: {
            mentorFee: 30000,
            partnerFee: 2000,
            learnerPays: 32000,
            durationLabel: "Standard (2-3 hrs/day) · min 21 sessions",
            periodLabel: "Monthly"
        },
        full_day: {
            mentorFee: 60000,
            partnerFee: 3000,
            learnerPays: 63000,
            durationLabel: "Full day (6-8 hrs) · min 21 sessions",
            periodLabel: "Monthly"
        }
    }
};

const PERIODS = [
    // { id: 'one_time', label: 'One-time' },
    { id: 'per_day', label: 'Per day' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' }
];

const DURATIONS = {
    // one_time: [{ id: 'standard', label: 'Single Session' }],
    per_day: [
        { id: 'standard', label: 'Standard (2-3 hrs)' },
        { id: 'full_day', label: 'Full day (6-8 hrs)' }
    ],
    weekly: [
        { id: 'standard', label: 'Standard (2-3 hrs/day)' },
        { id: 'full_day', label: 'Full day (6-8 hrs/day)' }
    ],
    monthly: [
        { id: 'standard', label: 'Standard (2-3 hrs/day)' },
        { id: 'full_day', label: 'Full day (6-8 hrs/day)' }
    ]
};

const SERVICES = [
    { id: 'Job Support (Mentoring)', label: 'Job Support (Mentoring)' },
    { id: 'Skill Training', label: 'Skill Training' },
    { id: 'Mock Interview Support', label: 'Mock Interview Support' }
];

const ExpressInterestModal = ({ isOpen, onClose, projectDetails, onSubmit, isSubmitting }) => {
    const { user } = useAuth();
    const { convertPrice, getCurrencySymbol, loading, currency } = useCurrency();

    const [proposal, setProposal] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState(projectDetails?.period || 'weekly');
    const [selectedDuration, setSelectedDuration] = useState(projectDetails?.duration || 'standard');
    const [selectedService, setSelectedService] = useState(projectDetails?.service || 'Skill Training');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const navigate = useNavigate();

    // Reset form when modal opens or project changes
    useEffect(() => {
        if (isOpen && projectDetails) {
            setSelectedPeriod(projectDetails.period || 'weekly');
            setSelectedDuration(projectDetails.duration || 'standard');
            setSelectedService(projectDetails.service || 'Skill Training');
            setProposal('');
        }
    }, [isOpen, projectDetails]);

    if (!isOpen) return null;

    // Get current pricing
    const currentPricing = PRICING_DATA[selectedPeriod]?.[selectedDuration];

    // Format currency (USD)
    const formatUSD = (inr) => {
        const usd = Math.round(inr / 81.5);
        return `$${usd}`;
    };

    // Format INR
    const formatINR = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const handleSubmit = () => {
        if (!proposal.trim()) {
            toast.error('Please enter a short proposal');
            return;
        }

        if (proposal.length > 500) {
            toast.error('Proposal cannot exceed 500 characters');
            return;
        }

        onSubmit({
            proposal,
            period: selectedPeriod,
            duration: selectedDuration,
            service: selectedService
        });
    };

    // Get period display label
    const getPeriodLabel = (periodId) => {
        const period = PERIODS.find(p => p.id === periodId);
        return period?.label || periodId;
    };

    // Get duration display text
    const getDurationDisplayText = () => {
        // if (selectedPeriod === 'one_time') return 'Single session';
        if (selectedDuration === 'standard') return 'Standard (2-3 hrs)';
        return 'Full day (6-8 hrs)';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Express Interest</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Project Info */}
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            {projectDetails?.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                {projectDetails?.category?.name || 'Category'}
                            </span>
                            {projectDetails?.subCategory?.name && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                    {projectDetails.subCategory.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Your Profile Section */}
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Your Profile</h4>
                            <button
                                onClick={() => navigate("/freelancer/profile/settings")}
                                className="text-primary text-sm flex items-center gap-1 hover:underline"
                            >
                                <Edit3 size={14} />
                                Edit Profile
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt={user?.displayName || user?.firstName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-primary font-semibold text-lg">
                                        {(user?.firstName?.[0] || user?.displayName?.[0] || 'U')}
                                    </span>
                                )}
                            </div>

                            {/* Profile Info */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900">
                                        {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Mentor'}
                                    </p>
                                    {user?.isVerified && (
                                        <CheckCircle size={14} className="text-blue-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                    <span className="text-gray-600">{user?.tagline || 'Data Engineer'}</span>
                                    <span className="text-gray-300 mx-1">•</span>
                                    <div className="flex items-center gap-0.5">
                                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                        <span className="font-medium text-gray-700">{user?.rating || 4.9}</span>
                                        <span className="text-gray-500 ml-0.5">({user?.reviewCount || 38} reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Profile Section (expandable) */}
                        {showEditProfile && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-3">Edit profile information</p>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Display Name"
                                        defaultValue={user?.displayName || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Title / Role"
                                        defaultValue={user?.title || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Short Proposal */}
                    <div className="p-5 border-b border-gray-100">
                        <label className="block font-medium text-gray-900 mb-2">
                            Short Proposal <span className="text-gray-400 text-sm font-normal">(max 500 characters)</span>
                        </label>
                        <textarea
                            value={proposal}
                            onChange={(e) => setProposal(e.target.value.slice(0, 500))}
                            rows={4}
                            placeholder="I have 6 years of experience of working with...."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                        <div className="text-right text-sm text-gray-400 mt-1">
                            {proposal.length} / 500
                        </div>
                    </div>

                    {/* Period, Duration, Service Selection */}
                    <div className="p-5 border-b border-gray-100">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {/* Period Dropdown */}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Period</label>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => {
                                        setSelectedPeriod(e.target.value);
                                        // Reset duration to first option of new period
                                        const newDuration = DURATIONS[e.target.value][0]?.id || 'standard';
                                        setSelectedDuration(newDuration);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {PERIODS.map(period => (
                                        <option key={period.id} value={period.id}>
                                            {period.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Duration Dropdown */}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Duration</label>
                                <select
                                    value={selectedDuration}
                                    onChange={(e) => setSelectedDuration(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {DURATIONS[selectedPeriod]?.map(duration => (
                                        <option key={duration.id} value={duration.id}>
                                            {duration.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Service Dropdown */}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Service</label>
                                <select
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {SERVICES.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Pricing Card - Green background as in image */}
                        {currentPricing && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <Info size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-green-800">
                                            Your rate: <span className="font-semibold">{getPeriodLabel(selectedPeriod)}</span> -
                                            <span className="font-semibold"> {getDurationDisplayText()}</span>
                                            {selectedPeriod !== 'one_time' && (selectedDuration === 'standard' || selectedDuration === 'full_day') && ' — '} 
                                            {currency == 'USD' ? <span className="font-semibold text-green-900">
                                                You get {getCurrencySymbol()}{convertPrice(currentPricing.mentorFee).toLocaleString('en-US', { style: 'currency', currency: currency })}
                                            </span> : <span className="font-semibold text-green-900">
                                                You get {getCurrencySymbol()}{(currentPricing.mentorFee).toLocaleString()}
                                            </span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 p-5">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Interest'}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpressInterestModal;