import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image, File, Mic, Video } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const MessageInput = ({ onSendMessage, onTyping }) => {
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const { user } = useAuth();

    // Handle typing indicator
    useEffect(() => {
        if (message.trim()) {
            if (!isTyping) {
                setIsTyping(true);
                onTyping(true);
            }

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                onTyping(false);
            }, 2000);
        } else {
            if (isTyping) {
                setIsTyping(false);
                onTyping(false);
            }
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [message, onTyping]);

    const handleSend = () => {
        if (message.trim() || attachments.length > 0) {
            onSendMessage(message, attachments);
            setMessage('');
            setAttachments([]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        // Validate file size (10MB max)
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        const validFiles = files.filter(file => file.size <= MAX_SIZE);

        if (validFiles.length !== files.length) {
            toast.error('Some files exceed the 10MB limit and were skipped');
        }

        if (validFiles.length === 0) return;

        setUploading(true);

        try {
            const uploadPromises = validFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('messageAttachment', file);

                const { data } = await axios.post(
                    `${import.meta.env.VITE_DOMAIN_URL}/api/v1/chat/upload`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                return data.data;
            });

            const uploadedFiles = await Promise.all(uploadPromises);
            setAttachments(prev => [...prev, ...uploadedFiles]);
            toast.success('Files uploaded successfully');
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Failed to upload files');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white border-t border-gray-200 p-4">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {attachments.map((attachment, index) => (
                        <div
                            key={index}
                            className="relative group bg-gray-100 rounded-lg p-2 pr-8 flex items-center space-x-2"
                        >
                            {attachment.fileType === 'image' ? (
                                <Image size={16} className="text-primary" />
                            ) : (
                                <File size={16} className="text-gray-500" />
                            )}
                            <span className="text-sm text-gray-700 max-w-[150px] truncate">
                                {attachment.fileName}
                            </span>
                            <button
                                onClick={() => removeAttachment(index)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={14} className="text-gray-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="flex flex-col md:flex-row items-end md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full">
                <div className="flex-1 w-full bg-gray-100 rounded-2xl px-4 py-2">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        className="w-full bg-transparent outline-none resize-none max-h-32 text-gray-900 placeholder-gray-400 text-base sm:text-sm"
                        rows="1"
                        style={{ minHeight: '40px' }}
                    />

                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        className="hidden"
                    />
                </div>

                <div className="flex items-center justify-end space-x-1 w-full sm:w-auto">
                    {/* Attachment Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-3 sm:p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Paperclip size={22} className="text-gray-500" />
                    </button>

                    {/* Voice Message Button (Future feature) */}
                    {/* <button className="p-3 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Video size={24} className="text-gray-500" />
                    </button> */}

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={(!message.trim() && attachments.length === 0) || uploading}
                        className="p-3 sm:p-3 bg-primary hover:bg-primary/90 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={22} className="" />
                    </button>
                </div>
            </div>

            {/* Uploading Indicator */}
            {uploading && (
                <div className="mt-2 text-sm text-primary animate-pulse">
                    Uploading files...
                </div>
            )}
        </div>
    );
};

export default MessageInput;