// components/chat/MeetingTab.jsx
import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Video, Edit2, Save, X, Plus, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstanceOld';

const videoApps = [
    { name: 'Google Meet', icon: '🎥', color: 'bg-blue-50 text-blue-600' },
    { name: 'Zoom', icon: '📹', color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Microsoft Teams', icon: '💼', color: 'bg-purple-50 text-purple-600' },
    { name: 'Jitsi Meet', icon: '🔓', color: 'bg-green-50 text-green-600' },
    { name: 'Whereby', icon: '🌐', color: 'bg-orange-50 text-orange-600' },
    { name: 'Zoho Meeting', icon: '📊', color: 'bg-red-50 text-red-600' },
];

const MeetingTab = ({ conversationId, userType }) => {
    const [meetings, setMeetings] = useState([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editData, setEditData] = useState({
        meetingName: '',
        meetingLink: '',
        meetingId: '',
        passcode: '',
        platform: 'Google Meet',
        isPermanent: false
    });

    // Check if user is a mentor/freelancer
    const isMentor = userType === 'freelancer' || userType === 'mentor';

    useEffect(() => {
        fetchAllMeetings();
    }, [conversationId]);

    const fetchAllMeetings = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/v1/chat/conversations/${conversationId}/meetings`);
            if (response.data?.success) {
                setMeetings(response.data.data || []);
                if (response.data.data?.length > 0) {
                    setSelectedMeetingId(response.data.data[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
            if (error.response?.status === 404) {
                setMeetings([]);
            } else {
                toast.error('Failed to load meetings');
            }
        } finally {
            setLoading(false);
        }
    };

    const getSelectedMeeting = () => {
        return meetings.find(m => m._id === selectedMeetingId);
    };

    const handleCreateMeeting = async () => {
        if (!editData.meetingLink.trim()) {
            toast.error('Please enter a meeting link');
            return;
        }
        if (!editData.meetingName.trim()) {
            toast.error('Please enter a meeting name');
            return;
        }

        setIsCreating(true);
        try {
            const response = await axiosInstance.post(`/api/v1/chat/conversations/${conversationId}/meeting`, {
                meetingName: editData.meetingName,
                meetingLink: editData.meetingLink,
                meetingId: editData.meetingId,
                passcode: editData.passcode,
                platform: editData.platform,
                isPermanent: editData.isPermanent
            });

            if (response.data?.success) {
                await fetchAllMeetings();
                setIsEditing(false);
                setEditData({
                    meetingName: '',
                    meetingLink: '',
                    meetingId: '',
                    passcode: '',
                    platform: 'Google Meet',
                    isPermanent: false
                });
                toast.success('Meeting saved successfully!');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            toast.error(error.response?.data?.message || 'Failed to save meeting');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateMeeting = async () => {
        if (!editData.meetingLink.trim()) {
            toast.error('Please enter a meeting link');
            return;
        }
        if (!editData.meetingName.trim()) {
            toast.error('Please enter a meeting name');
            return;
        }

        setIsEditing(true);
        try {
            const response = await axiosInstance.put(`/api/v1/chat/meetings/${editData._id}`, {
                meetingName: editData.meetingName,
                meetingLink: editData.meetingLink,
                meetingId: editData.meetingId,
                passcode: editData.passcode,
                platform: editData.platform,
                isPermanent: editData.isPermanent
            });

            if (response.data?.success) {
                await fetchAllMeetings();
                setIsEditing(false);
                toast.success('Meeting updated successfully!');
            }
        } catch (error) {
            console.error('Error updating meeting:', error);
            toast.error(error.response?.data?.message || 'Failed to update meeting');
        } finally {
            setIsEditing(false);
        }
    };

    const handleDeleteMeeting = async (meetingId) => {
        if (!confirm('Are you sure you want to delete this meeting?')) return;

        try {
            await axiosInstance.delete(`/api/v1/chat/meetings/${meetingId}`);
            await fetchAllMeetings();
            toast.success('Meeting deleted successfully!');
        } catch (error) {
            console.error('Error deleting meeting:', error);
            toast.error('Failed to delete meeting');
        }
    };

    const handleCopy = (text, field) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success(`${field} copied!`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCopyMeetingDetails = () => {
        const meeting = getSelectedMeeting();
        if (!meeting) return;

        let copyText = `Hi! Here are my meeting details for our session:\n\n`;
        copyText += `**Meeting Name:** ${meeting.meetingName || 'Not set'}\n`;
        copyText += `**Meeting Link:** ${meeting.meetingLink || 'Not set'}\n`;
        if (meeting.meetingId) copyText += `**Meeting ID:** ${meeting.meetingId}\n`;
        if (meeting.passcode) copyText += `**Passcode:** ${meeting.passcode}\n`;
        copyText += `\nSee you at the session! 🎯`;

        navigator.clipboard.writeText(copyText);
        toast.success('Meeting details copied to clipboard!');
    };

    const handleJoinMeeting = () => {
        const meeting = getSelectedMeeting();
        if (meeting?.meetingLink) {
            let link = meeting.meetingLink;
            if (!link.startsWith('http://') && !link.startsWith('https://')) {
                link = `https://${link}`;
            }
            window.open(link, '_blank');
        }
    };

    const handleEditMeeting = (meeting) => {
        setEditData(meeting);
        setIsEditing(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 space-y-6">
            {/* Recommended Video Apps - Just for display */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recommended Video Apps</h3>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                    {videoApps.map((app) => (
                        <div
                            key={app.name}
                            className={`flex items-center gap-2 p-2 rounded-lg ${app.color} border border-transparent`}
                        >
                            <span className="text-xl">{app.icon}</span>
                            <span className="text-xs font-medium">{app.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save a Meeting Section - Always visible for mentor */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Video size={16} />
                        Save a Meeting
                    </h3>
                    {isMentor && !isEditing && (
                        <button
                            onClick={() => {
                                setIsEditing(true);
                                setEditData({
                                    meetingName: '',
                                    meetingLink: '',
                                    meetingId: '',
                                    passcode: '',
                                    platform: 'Google Meet',
                                    isPermanent: false
                                });
                            }}
                            className="bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded-md flex items-center text-sm gap-2"
                        >
                            <Plus size={16} />
                            <span>New Meeting</span>
                        </button>
                    )}
                </div>

                {/* Show form when isEditing is true */}
                {isEditing ? (
                    <div className="space-y-4">
                        {/* Meeting App Dropdown */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">
                                Meeting App
                            </label>
                            <select
                                value={editData.platform}
                                onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            >
                                {videoApps.map((app) => (
                                    <option key={app.name} value={app.name}>{app.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Meeting Name */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">
                                Meeting Name *
                            </label>
                            <input
                                type="text"
                                value={editData.meetingName || ''}
                                onChange={(e) => setEditData({ ...editData, meetingName: e.target.value })}
                                placeholder="e.g., Weekly Student Session"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Meeting Link */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">
                                Meeting Link *
                            </label>
                            <input
                                type="text"
                                value={editData.meetingLink || ''}
                                onChange={(e) => setEditData({ ...editData, meetingLink: e.target.value })}
                                placeholder={`${editData.platform} link`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Meeting ID (optional) */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">
                                Meeting ID <span className="text-gray-400">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={editData.meetingId || ''}
                                onChange={(e) => setEditData({ ...editData, meetingId: e.target.value })}
                                placeholder="e.g., 123 456 7890"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Passcode (optional) */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">
                                Passcode <span className="text-gray-400">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={editData.passcode || ''}
                                onChange={(e) => setEditData({ ...editData, passcode: e.target.value })}
                                placeholder="e.g., abc123"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Permanent Link Option */}
                        {/* <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editData.isPermanent}
                                onChange={(e) => setEditData({ ...editData, isPermanent: e.target.checked })}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-600">Permanent link — same every session</span>
                        </label> */}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditData({
                                        meetingName: '',
                                        meetingLink: '',
                                        meetingId: '',
                                        passcode: '',
                                        platform: 'Google Meet',
                                        isPermanent: false
                                    });
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                                disabled={isCreating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editData._id ? handleUpdateMeeting : handleCreateMeeting}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm flex items-center justify-center gap-2"
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Save size={16} />
                                )}
                                {editData._id ? 'Update Meeting' : 'Save Meeting'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // Show message when not editing and no meetings exist
                    meetings.length === 0 && isMentor && (
                        <div className="text-center py-6 text-gray-500">
                            <p className="text-sm">No meetings saved yet.</p>
                            <p className="text-xs">Click "New Meeting" to add one.</p>
                        </div>
                    )
                )}

                {/* Show existing meetings summary when not editing */}
                {!isEditing && meetings.length > 0 && (
                    <div className="text-sm text-gray-500">
                        {meetings.length} meeting{meetings.length > 1 ? 's' : ''} saved
                    </div>
                )}

                {/* For learners/students - show message if no meetings */}
                {!isMentor && meetings.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                        <p className="text-sm">No meeting details have been set up yet.</p>
                        <p className="text-xs">The mentor will add meeting details soon.</p>
                    </div>
                )}
            </div>

            {/* Saved Meetings Section */}
            {meetings.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Video size={16} />
                        Saved Meetings
                    </h3>

                    {/* Meeting Selector Dropdown */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">
                            Select Saved Meeting
                        </label>
                        <div className="relative">
                            <select
                                value={selectedMeetingId || ''}
                                onChange={(e) => setSelectedMeetingId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none"
                            >
                                {meetings.map((meeting) => (
                                    <option key={meeting._id} value={meeting._id}>
                                        {meeting.meetingName || 'Unnamed Meeting'}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Selected Meeting Details */}
                    {getSelectedMeeting() && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-900">
                                    {getSelectedMeeting().meetingName || 'Unnamed Meeting'}
                                </h4>
                                {isMentor && !isEditing && (
                                    <div className="flex gap-1">
                                        {/* <button
                                            onClick={() => handleEditMeeting(getSelectedMeeting())}
                                            className="p-1 hover:bg-gray-200 rounded"
                                        >
                                            <Edit2 size={14} className="text-gray-500" />
                                        </button> */}
                                        <button
                                            onClick={() => handleDeleteMeeting(getSelectedMeeting()._id)}
                                            className="p-1 hover:bg-red-100 rounded"
                                        >
                                            <Trash2 size={14} className="text-red-500" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Meeting Link */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500">Meeting Link</label>
                                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                    <code className="text-sm text-primary break-all cursor-pointer hover:underline flex-1">
                                        {getSelectedMeeting().meetingLink || 'Not set'}
                                    </code>
                                    <button
                                        onClick={() => handleCopy(getSelectedMeeting().meetingLink, 'Link')}
                                        className="ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                                    >
                                        {copiedField === 'Link' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>

                            {/* Meeting ID (if exists) */}
                            {getSelectedMeeting().meetingId && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500">Meeting ID</label>
                                    <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                        <code className="text-sm text-gray-700 flex-1">{getSelectedMeeting().meetingId}</code>
                                        <button
                                            onClick={() => handleCopy(getSelectedMeeting().meetingId, 'ID')}
                                            className="ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                                        >
                                            {copiedField === 'ID' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Passcode (if exists) */}
                            {getSelectedMeeting().passcode && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500">Passcode</label>
                                    <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                        <code className="text-sm text-gray-700 flex-1">{getSelectedMeeting().passcode}</code>
                                        <button
                                            onClick={() => handleCopy(getSelectedMeeting().passcode, 'Passcode')}
                                            className="ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                                        >
                                            {copiedField === 'Passcode' ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Permanent badge */}
                            {getSelectedMeeting().isPermanent && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                                    <p className="text-xs text-blue-700">✓ Permanent meeting link</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    onClick={handleJoinMeeting}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={16} />
                                    Join Meeting
                                </button>
                                <button
                                    onClick={handleCopyMeetingDetails}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                                >
                                    <Copy size={16} />
                                    Copy Meeting Details
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MeetingTab;