import { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Send, MessageSquare, AlertCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstanceOld';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ProgressBar from '../ProgressBar';

const SessionTab = ({ orderId, userType, order }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expandedSessions, setExpandedSessions] = useState({});
    const [rejectFeedback, setRejectFeedback] = useState({});
    const [rejectingSession, setRejectingSession] = useState(null);
    const [resubmitting, setResubmitting] = useState(null);
    const [downloading, setDownloading] = useState(false);

    const reportRef = useRef(null);

    const isMentor = userType === 'freelancer';
    const isStudent = userType === 'buyer' || userType === 'agency';

    useEffect(() => {
        fetchSessions();
    }, [orderId]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/sessions/orders/${orderId}/sessions`);
            if (response.data?.success) {
                setSessions(response.data.data.sessions);
                setStats(response.data.data.stats);

                // Auto-expand submitted sessions for student
                if (isStudent) {
                    const expanded = {};
                    response.data.data.sessions.forEach(s => {
                        if (s.status === 'submitted') {
                            expanded[s._id] = true;
                        }
                    });
                    setExpandedSessions(expanded);
                }
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
            toast.error('No sessions found. Make sure an order is selected from right panel.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitSession = async () => {
        if (!description.trim() || description.trim().length < 10) {
            toast.error('Please provide session details (minimum 10 characters)');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axiosInstance.post(
                `/api/v1/sessions/orders/${orderId}/sessions/submit`,
                { description: description.trim() }
            );

            if (response.data?.success) {
                toast.success(response.data.message);
                setDescription('');
                await fetchSessions();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit session');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResubmitSession = async (sessionId) => {
        const session = sessions.find(s => s._id === sessionId);
        if (!session) return;

        // Use prompt to get updated description
        const newDescription = session.description;
        if (newDescription === null) return;
        if (newDescription.trim().length < 10) {
            toast.error('Please provide session details (minimum 10 characters)');
            return;
        }

        setResubmitting(sessionId);
        try {
            const response = await axiosInstance.put(
                `/api/v1/sessions/sessions/${sessionId}/resubmit`,
                { description: newDescription.trim() }
            );

            if (response.data?.success) {
                toast.success(response.data.message);
                await fetchSessions();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resubmit session');
        } finally {
            setResubmitting(null);
        }
    };

    const handleApproveSession = async (sessionId) => {
        try {
            const response = await axiosInstance.put(
                `/api/v1/sessions/sessions/${sessionId}/approve`
            );

            if (response.data?.success) {
                toast.success(response.data.message);
                await fetchSessions();

                if (response.data.data.allSessionsApproved) {
                    toast.success('🎉 All sessions approved! The mentor can now mark the order as delivered.');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve session');
        }
    };

    const handleRejectSession = async (sessionId) => {
        const feedback = rejectFeedback[sessionId];
        if (!feedback || feedback.trim().length < 5) {
            toast.error('Please provide feedback (minimum 5 characters)');
            return;
        }

        setRejectingSession(sessionId);
        try {
            const response = await axiosInstance.put(
                `/api/v1/sessions/sessions/${sessionId}/reject`,
                { feedback: feedback.trim() }
            );

            if (response.data?.success) {
                toast.success(response.data.message);
                setRejectFeedback(prev => ({ ...prev, [sessionId]: '' }));
                await fetchSessions();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject session');
        } finally {
            setRejectingSession(null);
        }
    };

    const toggleExpand = (sessionId) => {
        setExpandedSessions(prev => ({
            ...prev,
            [sessionId]: !prev[sessionId]
        }));
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { label: 'Pending', color: 'bg-amber-100 text-amber-600', icon: Clock },
            submitted: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-700', icon: Send },
            approved: { label: 'Approved ✅', color: 'bg-green-100 text-green-700', icon: CheckCircle },
            rejected: { label: 'Rejected ❌', color: 'bg-red-100 text-red-700', icon: XCircle },
        };
        const cfg = config[status] || config.pending;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    const getStatusText = (status) => {
        const map = {
            pending: 'Pending',
            submitted: 'Submitted',
            approved: 'Approved',
            rejected: 'Rejected',
        };
        return map[status] || status;
    };

    const getStatusIcon = (status) => {
        if (status === 'approved') return '✅';
        if (status === 'rejected') return '❌';
        return '⬜';
    };

    const canSubmitSession = () => {
        if (!isMentor) return false;
        if (!stats) return false;

        const hasPending = stats.pending > 0;
        const hasRejected = stats.rejected > 0;
        const allApproved = stats.allApproved;

        if (hasPending) return true;
        if (allApproved) return false;
        if (hasRejected) return false;

        return false;
    };

    const getNextSessionNumber = () => {
        if (!stats) return null;
        const pendingSessions = sessions.filter(s => s.status === 'pending');
        if (pendingSessions.length > 0) {
            return pendingSessions[0].sessionNumber;
        }
        return null;
    };

    // ==================== PDF DOWNLOAD FUNCTION ====================
    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        setDownloading(true);
        try {
            const element = reportRef.current;

            // Wait for fonts to load
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 794, // A4 width in pixels at 96dpi
                height: element.scrollHeight,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [794, 1123], // A4 size
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Session_Report_${order?.orderId || 'order'}.pdf`);

            toast.success('Report downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate report. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDateLong = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 space-y-6">
            {/* Progress Overview */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                    <p className="font-medium">Session Progress</p>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading || sessions.length === 0}
                        className="bg-black text-white py-1.5 px-3 rounded-md hover:bg-gray-800 hover:cursor-pointer flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Download size={14} />
                        )}
                        {downloading ? 'Generating...' : 'Download Sessions'}
                    </button>
                </div>

                <ProgressBar total={stats?.total} approved={stats?.approved} />

                {/* {stats && (
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                            Approved: {stats.approved}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
                            Pending: {stats.pending}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                            Rejected: {stats.rejected}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-gray-300 rounded-full inline-block"></span>
                            Submitted: {stats.submitted}
                        </span>
                        
                    </div>
                )} */}
                
                <span className="ml-auto font-medium text-xs">
                            {stats?.approved}/{stats?.total} sessions approved
                        </span>
            </div>

            {/* Mentor: Submit Session */}
            {isMentor && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Send size={16} />
                        Mark Session as Completed
                    </h3>

                    {stats?.allApproved ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-green-700">✅ All sessions have been approved!</p>
                            <p className="text-xs text-green-600 mt-1">You can now mark the order as delivered.</p>
                        </div>
                    ) : stats?.rejected > 0 ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700 flex items-center gap-2">
                                <AlertCircle size={16} />
                                Some sessions were rejected. Please resubmit them.
                            </p>
                        </div>
                    ) : stats?.pending === 0 && stats?.submitted === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-500">All sessions completed. Wait for student approval.</p>
                        </div>
                    ) : canSubmitSession() ? (
                        <>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Session {getNextSessionNumber()} - What did you cover?
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Describe what was covered in this session..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-400 mt-1">{description.length}/500 characters</p>
                            </div>
                            <button
                                onClick={handleSubmitSession}
                                disabled={submitting || !description.trim()}
                                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Send size={16} />
                                )}
                                Submit for Approval
                            </button>
                        </>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-500">No pending sessions to submit.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Sessions List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900">Session History</h3>
                </div>

                {sessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                        <p>No sessions yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {sessions.map((session) => {
                            const isExpanded = expandedSessions[session._id] || false;
                            const isSubmitted = session.status === 'submitted';
                            const isRejected = session.status === 'rejected';
                            const isApproved = session.status === 'approved';

                            return (
                                <div key={session._id} className="p-4">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleExpand(session._id)}
                                    >
                                        <div className="flex items-center flex-wrap gap-3">
                                            <span className="font-medium text-gray-900">
                                                Session {session.sessionNumber}
                                            </span>
                                            {getStatusBadge(session.status)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                                {session.submittedAt ? formatDate(session.submittedAt) : '-'}
                                            </span>
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-3 space-y-3">
                                            {session.description && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Session Notes</p>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                        {session.description}
                                                    </p>
                                                </div>
                                            )}

                                            {isRejected && session.studentFeedback && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Student Feedback</p>
                                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                                        {session.studentFeedback}
                                                    </p>
                                                </div>
                                            )}

                                            {isStudent && isSubmitted && (
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleApproveSession(session._id)}
                                                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const textarea = document.getElementById(`reject-${session._id}`);
                                                                if (textarea) textarea.focus();
                                                            }}
                                                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center justify-center gap-2"
                                                        >
                                                            <XCircle size={16} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <textarea
                                                            id={`reject-${session._id}`}
                                                            value={rejectFeedback[session._id] || ''}
                                                            onChange={(e) => setRejectFeedback(prev => ({
                                                                ...prev,
                                                                [session._id]: e.target.value
                                                            }))}
                                                            placeholder="Explain why you're rejecting this session..."
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                                                            rows={2}
                                                        />
                                                        <div className="flex justify-end mt-2">
                                                            <button
                                                                onClick={() => handleRejectSession(session._id)}
                                                                disabled={rejectingSession === session._id}
                                                                className="px-4 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium disabled:opacity-50"
                                                            >
                                                                {rejectingSession === session._id ? 'Submitting...' : 'Submit Rejection'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {isMentor && isRejected && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <p className="text-sm text-red-700 mb-2">This session was rejected. Please update and resubmit.</p>
                                                    <button
                                                        onClick={() => handleResubmitSession(session._id)}
                                                        disabled={resubmitting === session._id}
                                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center gap-2"
                                                    >
                                                        {resubmitting === session._id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        ) : (
                                                            <Send size={14} />
                                                        )}
                                                        Resubmit Session
                                                    </button>
                                                </div>
                                            )}

                                            {isMentor && isApproved && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                                                    <p className="text-sm text-green-700">✅ Approved by student</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* All Sessions Approved Message */}
            {stats?.allApproved && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-800">All Sessions Completed!</h4>
                    <p className="text-sm text-green-700">
                        All {stats.total} sessions have been approved.
                        {isMentor && ' You can now mark the order as delivered.'}
                        {isStudent && ' The mentor will now mark the order as delivered.'}
                    </p>
                </div>
            )}

            {/* Hidden PDF Report Template */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', zIndex: -1 }}>
                <div ref={reportRef} className="bg-white p-8" style={{ width: '794px', fontFamily: 'Arial, sans-serif' }}>
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-gray-300 pb-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Partcer</h1>
                            <p className="text-xs text-gray-500">partcer.com</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Session Report</p>
                            <p className="text-xs text-gray-500">Confidential · For review only</p>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-500">BOOKING ID</p>
                            <p className="font-medium text-gray-900">#{order?.orderId || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">GENERATED ON</p>
                            <p className="font-medium text-gray-900">{formatDateLong(new Date())}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">MENTOR</p>
                            <p className="font-medium text-gray-900">
                                {order?.mentorId?.firstName || ''} {order?.mentorId?.lastName || ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">BOOKING DATE</p>
                            <p className="font-medium text-gray-900">{formatDateLong(order?.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">LEARNER</p>
                            <p className="font-medium text-gray-900">
                                {order?.studentId?.firstName || ''} {order?.studentId?.lastName || ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">TOTAL SESSIONS</p>
                            <p className="font-medium text-gray-900">{sessions.length} sessions</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">PLAN</p>
                            <p className="font-medium text-gray-900">{order?.period || 'N/A'} · {order?.duration || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">SERVICE</p>
                            <p className="font-medium text-gray-900">{order?.serviceType || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Session Progress */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Session Progress</p>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <span>✅ Approved: {stats?.approved || 0}</span>
                            <span>⬜ Pending: {stats?.pending || 0}</span>
                            <span>❌ Rejected: {stats?.rejected || 0}</span>
                        </div>
                    </div>

                    {/* Sessions Table */}
                    <div className="mb-4">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-left p-2 border border-gray-300 text-xs font-semibold text-gray-700">#</th>
                                    <th className="text-left p-2 border border-gray-300 text-xs font-semibold text-gray-700">Session</th>
                                    <th className="text-left p-2 border border-gray-300 text-xs font-semibold text-gray-700">Date</th>
                                    <th className="text-left p-2 border border-gray-300 text-xs font-semibold text-gray-700">Status</th>
                                    <th className="text-left p-2 border border-gray-300 text-xs font-semibold text-gray-700">Session Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr key={session._id}>
                                        <td className="p-2 border border-gray-300 text-xs">{session.sessionNumber}</td>
                                        <td className="p-2 border border-gray-300 text-xs">Session {session.sessionNumber}</td>
                                        <td className="p-2 border border-gray-300 text-xs">
                                            {session.submittedAt ? formatDate(session.submittedAt) : '-'}
                                        </td>
                                        <td className="p-2 border border-gray-300 text-xs">
                                            {getStatusIcon(session.status)} {getStatusText(session.status)}
                                        </td>
                                        <td className="p-2 border border-gray-300 text-xs max-w-[200px]">
                                            {session.description || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pending Session Note */}
                    {stats?.pending > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-yellow-800">
                                Session {getNextSessionNumber()} is pending student approval. Count will update once approved.
                            </p>
                        </div>
                    )}

                    {/* Acknowledgement */}
                    <div className="border-t border-gray-300 pt-4 mt-4">
                        <p className="text-xs text-gray-600 mb-3">
                            <strong>Acknowledgement</strong><br />
                            This report is auto-generated by Partcer. Sessions marked Approved have been confirmed by the learner.
                        </p>
                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">Mentor Signature</p>
                                <p className="font-medium text-gray-900">
                                    {order?.mentorId?.firstName || ''} {order?.mentorId?.lastName || ''}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Learner Signature</p>
                                <p className="font-medium text-gray-900">
                                    {order?.studentId?.firstName || ''} {order?.studentId?.lastName || ''}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Date: {formatDateLong(new Date())}</p>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-300 pt-2 mt-4 text-center">
                        <p className="text-xs text-gray-400">partcer.com</p>
                        <p className="text-xs text-gray-400">This document is system-generated and valid without physical signature.</p>
                        <p className="text-xs text-gray-400">Page 1 of 1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionTab;