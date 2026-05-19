import { Avatar } from '../../components';
import { format } from 'date-fns';
import {
    Check,
    CheckCheck,
    Download,
    FileText,
    Image,
    Video,
    File,
    X,
    Bookmark,
    BookmarkCheck
} from 'lucide-react';
import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const MessageBubble = ({ message, isOwn, showAvatar, sender, onMessageSaved }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isSaved, setIsSaved] = useState(message.savedBy?.includes(sender?._id) || false);
    const [saving, setSaving] = useState(false);

    const handleSaveMessage = async () => {
        setSaving(true);
        try {
            if (isSaved) {
                await axiosInstance.delete(`/api/v1/chat/messages/${message._id}/save`);
                setIsSaved(false);
                toast.success('Message removed from saved');
            } else {
                await axiosInstance.post(`/api/v1/chat/messages/${message._id}/save`);
                setIsSaved(true);
                toast.success('Message saved');
            }
            if (onMessageSaved) onMessageSaved();
        } catch (error) {
            console.error('Error saving message:', error);
            toast.error('Failed to save message');
        } finally {
            setSaving(false);
        }
    };

    const getStatusIcon = () => {
        if (isOwn) {
            switch (message.status) {
                case 'read':
                    return <CheckCheck size={14} className="text-blue-500" />;
                case 'delivered':
                    return <CheckCheck size={14} className="text-gray-400" />;
                default:
                    return <Check size={14} className="text-gray-400" />;
            }
        }
        return null;
    };

    const renderAttachment = (attachment) => {
        switch (attachment.fileType) {
            case 'image':
                return (
                    <div className="relative group">
                        {!imageLoaded && !imageError && (
                            <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg" />
                        )}
                        <img
                            src={attachment.url}
                            alt={attachment.fileName}
                            className={`max-w-full max-h-96 rounded-lg cursor-pointer transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            onClick={() => window.open(attachment.url, '_blank')}
                        />
                        {imageError && (
                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                <X size={24} className="text-gray-400" />
                                <span className="text-sm text-gray-500 ml-2">Failed to load image</span>
                            </div>
                        )}
                        <a
                            href={attachment.url}
                            download={attachment.fileName}
                            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Download size={16} />
                        </a>
                    </div>
                );

            case 'video':
                return (
                    <video
                        src={attachment.url}
                        controls
                        className="max-w-full max-h-96 rounded-lg"
                    >
                        Your browser does not support the video tag.
                    </video>
                );

            case 'document':
                return (
                    <a
                        href={attachment.url}
                        download={attachment.fileName}
                        className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <FileText size={24} className="text-primary" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                                {(attachment.fileSize / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <Download size={16} className="text-gray-500" />
                    </a>
                );

            default:
                return (
                    <a
                        href={attachment.url}
                        download={attachment.fileName}
                        className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <File size={24} className="text-gray-500" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                                {(attachment.fileSize / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <Download size={16} className="text-gray-500" />
                    </a>
                );
        }
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {showAvatar && !isOwn && (
                    <div className="flex-shrink-0 mr-2">
                        <Avatar
                            src={sender.profileImage}
                            name={`${sender.firstName} ${sender.lastName}`}
                            size="sm"
                        />
                    </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    {/* Sender Name (for group chats) */}
                    {showAvatar && !isOwn && (
                        <span className="text-xs text-gray-500 mb-1 ml-2">
                            {sender.firstName} {sender.lastName}
                        </span>
                    )}

                    {/* Message Bubble */}
                    <div
                        className={`rounded-2xl px-4 py-2 ${isOwn
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                            }`}
                    >
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                            <div className="space-y-2 mb-2">
                                {message.attachments.map((attachment, index) => (
                                    <div key={index}>
                                        {attachment.fileType === 'image' ? (
                                            <img
                                                src={attachment.url}
                                                alt={attachment.fileName}
                                                className="max-w-full max-h-64 rounded-lg cursor-pointer"
                                                onClick={() => window.open(attachment.url, '_blank')}
                                            />
                                        ) : (
                                            <a
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-2 p-2 bg-transparent rounded-lg hover:bg-orange-400"
                                            >
                                                <FileText size={20} />
                                                <span className="text-sm truncate">{attachment.fileName}</span>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Message Text */}
                        {message.content && (
                            <p className="whitespace-pre-wrap break-words">
                                {message.content}
                            </p>
                        )}
                    </div>

                    {/* Timestamp, Status, and Save Button */}
                    <div className={`flex items-center gap-2 mt-1 text-xs ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className={isOwn ? 'text-white/60' : 'text-gray-400'}>
                            {format(new Date(message.createdAt), 'h:mm a')}
                        </span>
                        {isOwn && message.status === 'read' && (
                            <span className="text-blue-500 text-xs">✓✓</span>
                        )}

                        {/* Save button for all messages */}
                        <button
                            onClick={handleSaveMessage}
                            disabled={saving}
                            className="hover:opacity-70 transition-opacity"
                        >
                            {isSaved ? (
                                <BookmarkCheck size={12} className="text-primary" />
                            ) : (
                                <Bookmark size={12} className="text-gray-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;