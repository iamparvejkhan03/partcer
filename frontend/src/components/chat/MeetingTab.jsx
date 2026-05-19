// components/chat/MeetingTab.jsx
import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Video, Edit2, Save, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const videoApps = [
    { name: 'Google Meet', icon: '🎥', color: 'bg-blue-50 text-blue-600', placeholder: 'meet.google.com/xxx-xxxx-xxx' },
    { name: 'Zoom', icon: '📹', color: 'bg-indigo-50 text-indigo-600', placeholder: 'zoom.us/j/123456789' },
    { name: 'Microsoft Teams', icon: '💼', color: 'bg-purple-50 text-purple-600', placeholder: 'teams.microsoft.com/l/meetup-join/...' },
    { name: 'Jitsi Meet', icon: '🔓', color: 'bg-green-50 text-green-600', placeholder: 'meet.jit.si/your-room-name' },
    { name: 'Whereby', icon: '🌐', color: 'bg-orange-50 text-orange-600', placeholder: 'whereby.com/your-room-name' },
    { name: 'Zoho Meeting', icon: '📊', color: 'bg-red-50 text-red-600', placeholder: 'meetings.zoho.com/...' },
    { name: 'Other', icon: '🔗', color: 'bg-gray-50 text-gray-600', placeholder: 'Enter your meeting link...' },
];

const MeetingTab = ({ conversationId, userType }) => {
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [editData, setEditData] = useState({
        meetingLink: '',
        meetingId: '',
        passcode: '',
        platform: 'Google Meet',
        isPermanent: false
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchMeetingDetails();
    }, [conversationId]);

    const fetchMeetingDetails = async () => {
        try {
            const response = await axiosInstance.get(`/api/v1/chat/conversations/${conversationId}/meeting`);
            if (response.data?.success && response.data.data) {
                setMeeting(response.data.data);
                setEditData(response.data.data);
            } else {
                // No meeting exists yet
                setMeeting(null);
            }
        } catch (error) {
            console.error('Error fetching meeting:', error);
            // If 404 or no meeting found, just set meeting to null
            if (error.response?.status === 404) {
                setMeeting(null);
            } else {
                toast.error('Failed to load meeting details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMeeting = async () => {
        if (!editData.meetingLink.trim()) {
            toast.error('Please enter a meeting link');
            return;
        }

        setIsCreating(true);
        try {
            const response = await axiosInstance.post(`/api/v1/chat/conversations/${conversationId}/meeting`, {
                meetingLink: editData.meetingLink,
                meetingId: editData.meetingId,
                passcode: editData.passcode,
                platform: editData.platform,
                isPermanent: editData.isPermanent
            });

            if (response.data?.success) {
                setMeeting(response.data.data);
                setIsEditing(false);
                setIsCreating(false);
                toast.success('Meeting details saved successfully!');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            toast.error(error.response?.data?.message || 'Failed to save meeting details');
            setIsCreating(false);
        }
    };

    const handleUpdateMeeting = async () => {
        if (!editData.meetingLink.trim()) {
            toast.error('Please enter a meeting link');
            return;
        }

        setIsCreating(true);
        try {
            const response = await axiosInstance.put(`/api/v1/chat/meetings/${meeting._id}`, {
                meetingLink: editData.meetingLink,
                meetingId: editData.meetingId,
                passcode: editData.passcode,
                platform: editData.platform,
                isPermanent: editData.isPermanent
            });

            if (response.data?.success) {
                setMeeting(response.data.data);
                setIsEditing(false);
                toast.success('Meeting details updated successfully!');
            }
        } catch (error) {
            console.error('Error updating meeting:', error);
            toast.error(error.response?.data?.message || 'Failed to update meeting details');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(`${field} copied!`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleJoinMeeting = () => {
        if (meeting?.meetingLink) {
            let link = meeting.meetingLink;
            if (!link.startsWith('http') && !link.startsWith('https')) {
                link = `https://${link}`;
            }
            window.open(link, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show create meeting form if no meeting exists
    if (!meeting && !isEditing) {
        return (
            <div className="h-full overflow-y-auto p-6">
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video size={32} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Meeting Setup Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {userType === 'freelancer'
                            ? "Add your meeting details so students can join your sessions"
                            : "The mentor hasn't set up a meeting link yet"}
                    </p>
                    {userType === 'freelancer' && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 inline-flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Meeting Details
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 space-y-6">
            {/* Suggested Video Apps */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Video size={16} />
                    Select Video App
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {videoApps.map((app) => (
                        <button
                            key={app.name}
                            onClick={() => {
                                if (isEditing) {
                                    setEditData({ ...editData, platform: app.name });
                                }
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-all ${editData.platform === app.name && isEditing
                                    ? 'bg-primary text-white'
                                    : editData.platform === app.name
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                } ${!isEditing && 'cursor-default'}`}
                            disabled={!isEditing}
                        >
                            <span className="text-xl">{app.icon}</span>
                            <span className="text-sm">{app.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Meeting Details Form */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Meeting Details</h3>
                    {userType === 'freelancer' && !isEditing && (
                        <button
                            onClick={() => {
                                setIsEditing(true);
                                setEditData(meeting);
                            }}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Edit2 size={14} className="text-gray-500" />
                        </button>
                    )}
                    {isEditing && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    if (meeting) {
                                        setEditData(meeting);
                                    } else {
                                        setEditData({
                                            meetingLink: '',
                                            meetingId: '',
                                            passcode: '',
                                            platform: 'Google Meet',
                                            isPermanent: false
                                        });
                                    }
                                }}
                                className="p-1 hover:bg-gray-200 rounded-lg"
                                disabled={isCreating}
                            >
                                <X size={14} className="text-red-500" />
                            </button>
                            <button
                                onClick={meeting ? handleUpdateMeeting : handleCreateMeeting}
                                className="p-1 hover:bg-gray-200 rounded-lg"
                                disabled={isCreating}
                            >
                                <Save size={14} className="text-green-500" />
                            </button>
                        </div>
                    )}
                </div>

                {meeting && !isEditing && (
                    <p className="text-xs text-yellow-600">
                        Last updated: {new Date(meeting.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(meeting.lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}

                {/* Meeting Link */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">
                        MEETING LINK {!isEditing && meeting?.meetingLink && '· Tap to copy'}
                    </label>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.meetingLink || ''}
                                onChange={(e) => setEditData({ ...editData, meetingLink: e.target.value })}
                                placeholder={videoApps.find(app => app.name === editData.platform)?.placeholder || "Enter meeting link"}
                                className="flex-1 text-sm text-primary bg-transparent outline-none"
                                autoFocus
                            />
                        ) : (
                            <code
                                className="text-sm text-primary break-all cursor-pointer hover:underline"
                                onClick={() => handleCopy(meeting?.meetingLink, 'Link')}
                            >
                                {meeting?.meetingLink || 'Not set'}
                            </code>
                        )}
                        {!isEditing && meeting?.meetingLink && (
                            <button
                                onClick={() => handleCopy(meeting?.meetingLink, 'Link')}
                                className="ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                            >
                                {copiedField === 'Link' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Meeting ID */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">
                        MEETING ID (optional)
                    </label>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.meetingId || ''}
                                onChange={(e) => setEditData({ ...editData, meetingId: e.target.value })}
                                placeholder="e.g., 123 456 7890"
                                className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
                            />
                        ) : (
                            <code className="text-sm text-gray-700">{meeting?.meetingId || 'Not set'}</code>
                        )}
                        {!isEditing && meeting?.meetingId && (
                            <button
                                onClick={() => handleCopy(meeting?.meetingId, 'ID')}
                                className="ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                            >
                                {copiedField === 'ID' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Passcode */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">
                        PASSCODE (optional)
                    </label>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.passcode || ''}
                                onChange={(e) => setEditData({ ...editData, passcode: e.target.value })}
                                placeholder="e.g., 123456 or abc123"
                                className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
                            />
                        ) : (
                            <code className="text-sm text-gray-700">{meeting?.passcode || 'Not set'}</code>
                        )}
                        {!isEditing && meeting?.passcode && (
                            <button
                                onClick={() => handleCopy(meeting?.passcode, 'Passcode')}
                                className="ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                            >
                                {copiedField === 'Passcode' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Permanent Link Option */}
                {isEditing && (
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={editData.isPermanent}
                            onChange={(e) => setEditData({ ...editData, isPermanent: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-600">Permanent link — same every session. No resharing needed.</span>
                    </label>
                )}

                {meeting?.isPermanent && !isEditing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                        <p className="text-xs text-blue-700">✓ This is a permanent meeting link (same for all sessions)</p>
                    </div>
                )}

                {/* Join Button */}
                {meeting?.meetingLink && !isEditing && (
                    <button
                        onClick={handleJoinMeeting}
                        className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={16} />
                        Join Meeting
                    </button>
                )}

                {/* Help Text for Mentor */}
                {userType === 'freelancer' && isEditing && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                        <p className="text-xs text-yellow-800">
                            💡 Tip: You can add any meeting link from Google Meet, Zoom, Teams, or any other platform you prefer.
                            Your students will see this link and can join directly.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingTab;