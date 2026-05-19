// components/chat/SavedTab.jsx
import { useState, useEffect } from 'react';
import { Bookmark, MessageCircle, FileText, Image, Video, File, Trash2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const SavedTab = ({ conversationId, currentUser }) => {
    const [savedMessages, setSavedMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unsavingId, setUnsavingId] = useState(null);

    useEffect(() => {
        fetchSavedMessages();
    }, [conversationId]);

    const fetchSavedMessages = async () => {
        try {
            const response = await axiosInstance.get(`/api/v1/chat/saved-messages?conversationId=${conversationId}`);
            if (response.data?.success) {
                setSavedMessages(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching saved messages:', error);
            toast.error('Failed to load saved messages');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (messageId) => {
        setUnsavingId(messageId);
        try {
            const response = await axiosInstance.delete(`/api/v1/chat/messages/${messageId}/save`);
            if (response.data?.success) {
                setSavedMessages(prev => prev.filter(msg => msg.messageId !== messageId));
                toast.success('Message removed from saved');
            }
        } catch (error) {
            console.error('Error unsaving message:', error);
            toast.error('Failed to unsave message');
        } finally {
            setUnsavingId(null);
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType === 'image') return <Image size={16} className="text-blue-500" />;
        if (fileType === 'video') return <Video size={16} className="text-purple-500" />;
        if (fileType === 'document') return <FileText size={16} className="text-orange-500" />;
        return <File size={16} className="text-gray-500" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 space-y-4">
            {savedMessages.length === 0 ? (
                <div className="text-center py-10">
                    <Bookmark size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No saved messages yet</p>
                    <p className="text-sm text-gray-400">Click the bookmark icon on messages to save them here</p>
                </div>
            ) : (
                savedMessages.map((saved) => (
                    <div key={saved._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <img
                                    src={saved.sender?.profileImage || 'https://via.placeholder.com/32'}
                                    alt={saved.sender?.firstName}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {saved.sender?.firstName} {saved.sender?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar size={10} />
                                        {format(new Date(saved.savedAt), 'MMM d, yyyy • h:mm a')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleUnsave(saved.messageId)}
                                disabled={unsavingId === saved.messageId}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 size={16} className="text-red-500" />
                            </button>
                        </div>

                        {saved.messageContent && (
                            <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded-lg">
                                {saved.messageContent}
                            </p>
                        )}

                        {saved.messageAttachments && saved.messageAttachments.length > 0 && (
                            <div className="space-y-2">
                                {saved.messageAttachments.map((attachment, idx) => (
                                    <a
                                        key={idx}
                                        href={attachment.url}
                                        download={attachment.fileName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {getFileIcon(attachment.fileType)}
                                        <span className="text-sm text-gray-700 flex-1 truncate">{attachment.fileName}</span>
                                        <span className="text-xs text-gray-400">
                                            {(attachment.fileSize / 1024).toFixed(1)} KB
                                        </span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default SavedTab;