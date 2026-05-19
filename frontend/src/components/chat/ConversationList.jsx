import { useState, useMemo } from 'react';
import { Avatar } from '../../components';
import { Search, X, Clock, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({
    conversations,
    selectedConversation,
    onSelectConversation,
    onlineUsers,
    currentUser,
    loading,
    onClose
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = useMemo(() => {
        if (!searchTerm.trim()) return conversations;

        return conversations.filter(conv => {
            const otherParticipant = conv.participants.find(
                p => p._id !== currentUser._id
            );
            return otherParticipant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                otherParticipant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [conversations, searchTerm, currentUser]);

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p._id !== currentUser._id);
    };

    const getUnreadCount = (conversation) => {
        return conversation.unreadCount?.[currentUser._id] || 0;
    };

    const getLastMessageStatus = (conversation) => {
        if (!conversation.lastMessage) return null;

        if (conversation.lastMessage.sender === currentUser._id) {
            switch (conversation.lastMessage.status) {
                case 'read':
                    return <CheckCheck size={16} className="text-blue-500" />;
                case 'delivered':
                    return <CheckCheck size={16} className="text-gray-400" />;
                default:
                    return <Check size={16} className="text-gray-400" />;
            }
        }
        return null;
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="flex-1 p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No conversations yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Start chatting with mentors or students
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredConversations.map(conversation => {
                            const otherParticipant = getOtherParticipant(conversation);
                            const isOnline = onlineUsers.includes(otherParticipant?._id);
                            const unreadCount = getUnreadCount(conversation);
                            const isSelected = selectedConversation?._id === conversation._id;

                            return (
                                <button
                                    key={conversation._id}
                                    onClick={() => onSelectConversation(conversation)}
                                    className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left ${isSelected ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Avatar
                                            src={otherParticipant?.profileImage}
                                            name={`${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                                            size="md"
                                        />
                                        {isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {otherParticipant?.firstName} {otherParticipant?.lastName}
                                            </h3>
                                            {conversation.lastMessage && (
                                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                    {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0 flex items-center space-x-1">
                                                {getLastMessageStatus(conversation)}
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conversation.lastMessage?.content || (
                                                        <span className="text-primary">Start messaging...</span>
                                                    )}
                                                </p>
                                            </div>
                                            {unreadCount > 0 && (
                                                <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary rounded-full text-white text-xs flex items-center justify-center">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;