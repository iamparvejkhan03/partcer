import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, Send, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const ResolutionPanel = ({ order, onBack }) => {
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [complaint, setComplaint] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [resolutionStatus, setResolutionStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const issueTypes = [
        {
            id: 'session_not_happened',
            label: 'Session did not happen — mentor was unavailable',
            color: 'text-orange-600',
            icon: '⏰'
        },
        {
            id: 'mentor_not_responding',
            label: 'Mentor not responding — no reply for 48+ hours',
            color: 'text-red-600',
            icon: '💬'
        },
        {
            id: 'service_not_as_described',
            label: 'Service not as described — does not match the plan',
            color: 'text-yellow-600',
            icon: '📋'
        },
        {
            id: 'request_refund',
            label: 'Request a refund',
            color: 'text-red-600',
            icon: '💰',
            isRed: true
        }
    ];

    useEffect(() => {
        checkExistingResolution();
    }, [order]);

    const checkExistingResolution = async () => {
        try {
            const response = await axiosInstance.get(`/api/v1/resolution/orders/${order._id}/status`);
            if (response.data?.success && response.data.data) {
                setResolutionStatus(response.data.data);
            }
        } catch (error) {
            console.error('Error checking resolution:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedIssue) {
            toast.error('Please select an issue type');
            return;
        }

        if (complaint.length < 10) {
            toast.error('Please describe your issue in at least 10 characters');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axiosInstance.post(`/api/v1/resolution/orders/${order._id}/complaint`, {
                issueType: selectedIssue,
                complaint: complaint
            });

            if (response.data?.success) {
                setSubmitted(true);
                toast.success('Complaint submitted successfully!');
                // Send email notification to admin is handled by backend
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);
            toast.error(error.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
            in_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
            resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: '✅' },
            rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '❌' },
            refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-800', icon: '💰' }
        };
        return statusConfig[status] || statusConfig.pending;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    // Show resolution status if already submitted
    if (resolutionStatus && resolutionStatus.status !== 'resolved' && resolutionStatus.status !== 'rejected') {
        const status = getStatusBadge(resolutionStatus.status);
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h3 className="font-semibold text-gray-900">Resolution Center</h3>
                </div>

                <div className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${status.color.replace('text', 'bg').replace('800', '100')} mb-4`}>
                        <span className="text-2xl">{status.icon}</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Complaint Submitted</h4>
                    <p className="text-gray-600 mb-4">
                        Your complaint has been submitted and is currently {status.label.toLowerCase()}.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                        <p className="text-sm text-gray-500 mb-2">Issue Type:</p>
                        <p className="text-sm font-medium text-gray-900 mb-3">{resolutionStatus.issueTypeDisplay}</p>
                        <p className="text-sm text-gray-500 mb-2">Your Complaint:</p>
                        <p className="text-sm text-gray-700">{resolutionStatus.complaint}</p>
                        {resolutionStatus.adminNotes && (
                            <>
                                <p className="text-sm text-gray-500 mt-3 mb-2">Admin Response:</p>
                                <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">{resolutionStatus.adminNotes}</p>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Back to Order
                    </button>
                </div>
            </div>
        );
    }

    // Show success screen after submission
    if (submitted) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h3 className="font-semibold text-gray-900">Resolution Center</h3>
                </div>

                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Complaint Submitted Successfully</h4>
                    <p className="text-gray-600 mb-2">
                        Your complaint for order <span className="font-mono font-medium">{order.orderId}</span> has been received.
                    </p>
                    {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
                        <div className="flex items-center gap-2 justify-center mb-2">
                            <Mail size={16} className="text-blue-600" />
                            <p className="text-sm font-medium text-blue-900">Email Sent to admin@partcer.com</p>
                        </div>
                        <p className="text-xs text-blue-700">Our team responds within 24 hours.</p>
                    </div> */}
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Back to Order
                    </button>
                </div>
            </div>
        );
    }

    // Complaint form
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h3 className="font-semibold text-gray-900">Resolution Center</h3>
            </div>

            <div className="p-6">
                {/* Order Reference */}
                <div className="mb-6 pb-4 border-b border-gray-100 flex items-center gap-2 justify-between flex-wrap">
                    <p className="text-xs text-gray-500">Order #{order.orderId}</p>
                    <p className="text-xs text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>

                {/* Issue Type Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        SELECT ISSUE TYPE
                    </label>
                    <div className="space-y-2">
                        {issueTypes.map((issue) => (
                            <label
                                key={issue.id}
                                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${selectedIssue === issue.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                    } ${issue.isRed && selectedIssue === issue.id ? 'border-red-500 bg-red-50' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="issueType"
                                    value={issue.id}
                                    checked={selectedIssue === issue.id}
                                    onChange={() => setSelectedIssue(issue.id)}
                                    className="mt-1 mr-3 text-primary focus:ring-primary"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{issue.icon}</span>
                                        <span className={`text-sm ${issue.isRed && selectedIssue === issue.id ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                                            {issue.label}
                                        </span>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Complaint Textarea */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        YOUR COMPLAINT
                    </label>
                    <textarea
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                        placeholder="Describe your issue in detail..."
                        rows={5}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                    <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-400">
                            {complaint.length}/500 characters
                        </p>
                        {complaint.length > 0 && complaint.length < 10 && (
                            <p className="text-xs text-orange-500">
                                Minimum 10 characters required
                            </p>
                        )}
                    </div>
                </div>

                {/* Info Box */}
                {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Mail size={14} className="text-blue-600" />
                        <p className="text-xs font-medium text-blue-900">Email Sent to admin@partcer.com</p>
                    </div>
                    <p className="text-xs text-blue-700">Team responds within 24 hours.</p>
                </div> */}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!selectedIssue || complaint.length < 10 || submitting}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <Send size={16} />
                            Submit complaint
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ResolutionPanel;