import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { BuyerContainer, BuyerHeader, BuyerSidebar } from '../../components';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import { Menu, MessageSquare } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

const Chat = () => {
    const [searchParams] = useSearchParams();
    const receiverId = searchParams.get('user');
    const { socket, isConnected, onlineUsers } = useSocket();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileList, setShowMobileList] = useState(false);
    const navigate = useNavigate();
    const { markMessagesAsRead } = useNotifications();

    // useEffect to mark as read when page loads
    useEffect(() => {
        markMessagesAsRead();
    }, []);

    // Auto-start conversation with user from URL
    useEffect(() => {
        if (receiverId && socket && isConnected && conversations.length > 0) {
            const existingConv = conversations.find(conv =>
                conv.participants.some(p => p._id === receiverId)
            );

            if (existingConv) {
                setSelectedConversation(existingConv);
                setShowMobileList(false);
            }
            // Don't send any message - just wait for user to send first message
        }
    }, [receiverId, socket, isConnected, conversations]);

    useEffect(() => {
        const initializeChat = async () => {
            const urlUserId = searchParams.get('user');

            if (urlUserId && conversations.length > 0 && !selectedConversation) {
                // Find conversation with this user
                const conversation = conversations.find(conv =>
                    conv.participants.some(p => p._id === urlUserId)
                );

                if (conversation) {
                    setSelectedConversation(conversation);
                    setShowMobileList(false);
                }
            }
        };

        initializeChat();
    }, [searchParams, conversations, selectedConversation]);

    // Load conversations
    useEffect(() => {
        if (socket && isConnected) {
            setLoading(true);
            socket.emit('conversations:get');

            socket.on('conversations:list', (convs) => {
                setConversations(convs);
                setLoading(false);
            });

            socket.on('conversation:updated', (updatedConv) => {
                setConversations(prev => {
                    const filtered = prev.filter(c => c._id !== updatedConv._id);
                    return [updatedConv, ...filtered];
                });
            });
        }

        return () => {
            if (socket) {
                socket.off('conversations:list');
                socket.off('conversation:updated');
            }
        };
    }, [socket, isConnected]);

    // Load messages when conversation selected
    useEffect(() => {
        if (socket && isConnected && selectedConversation) {
            setMessages([]);

            socket.emit('messages:get', {
                conversationId: selectedConversation._id
            });

            socket.on('messages:list', ({ conversationId, messages: msgs }) => {
                if (conversationId === selectedConversation._id) {
                    setMessages(msgs);
                }
            });

            socket.on('message:sent', (newMessage) => {
                if (newMessage.conversation === selectedConversation._id) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === newMessage._id)) return prev;
                        return [...prev, newMessage];
                    });
                }
            });

            socket.on('message:received', (newMessage) => {
                if (newMessage.conversation === selectedConversation._id) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === newMessage._id)) return prev;
                        return [...prev, newMessage];
                    });
                    socket.emit('messages:read', { conversationId: selectedConversation._id });
                }
            });

            socket.on('messages:read', ({ conversationId, readerId }) => {
                if (conversationId === selectedConversation._id) {
                    setMessages(prev => prev.map(msg =>
                        msg.receiver?._id === readerId
                            ? { ...msg, status: 'read' }
                            : msg
                    ));
                }
            });

            return () => {
                socket.off('messages:list');
                socket.off('message:sent');
                socket.off('message:received');
                socket.off('messages:read');
            };
        }
    }, [socket, isConnected, selectedConversation]);

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setShowMobileList(false);

        const otherParticipant = conversation.participants.find(
            p => p._id !== user._id
        );

        if (otherParticipant) {
            navigate(`/${user?.userType}/chat?user=${otherParticipant._id}`, { replace: true });
        }
    };

    useEffect(() => {
        const urlUserId = searchParams.get('user');

        if (urlUserId && conversations.length > 0 && !selectedConversation) {
            const conversation = conversations.find(conv =>
                conv.participants.some(p => p._id === urlUserId)
            );

            if (conversation) {
                setSelectedConversation(conversation);
                setShowMobileList(false);
            }
        }
    }, [searchParams, conversations, selectedConversation]);

    const handleSendMessage = (content, attachments = []) => {
        if (!selectedConversation) return;

        const receiverId = selectedConversation.participants.find(
            p => p._id !== user._id
        )?._id;

        socket.emit('message:send', {
            receiverId,
            content,
            attachments: attachments
        });
    };

    const handleTyping = (isTyping) => {
        if (!selectedConversation) return;

        const receiverId = selectedConversation.participants.find(
            p => p._id !== user._id
        )?._id;

        if (isTyping) {
            socket.emit('typing:start', { receiverId });
        } else {
            socket.emit('typing:stop', { receiverId });
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <BuyerSidebar />
            <div className="flex-1">
                <BuyerHeader />
                <BuyerContainer>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 h-[calc(100vh-150px)] mt-20 md:mt-5 relative">
                        <div className="flex h-full">
                            {/* Mobile Toggle Button - Only shows when list is hidden */}
                            {!showMobileList && (
                                <button
                                    onClick={() => setShowMobileList(true)}
                                    className="md:hidden absolute top-4 left-4 z-20 bg-primary text-white p-2 rounded-lg shadow-lg"
                                >
                                    <Menu size={20} />
                                </button>
                            )}

                            {/* Conversation List */}
                            <div className={`${showMobileList ? 'block' : 'hidden'
                                } md:block w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white absolute md:relative z-10 h-full`}>
                                <ConversationList
                                    conversations={conversations}
                                    selectedConversation={selectedConversation}
                                    onSelectConversation={handleSelectConversation}
                                    onlineUsers={onlineUsers}
                                    currentUser={user}
                                    loading={loading}
                                    onClose={() => setShowMobileList(false)}
                                />
                            </div>

                            {/* Chat Window */}
                            <div className={`flex-1 flex flex-col bg-gray-50 ${showMobileList ? 'hidden md:flex' : 'flex'
                                }`}>
                                {selectedConversation ? (
                                    <ChatWindow
                                        conversation={selectedConversation}
                                        messages={messages}
                                        currentUser={user}
                                        onSendMessage={handleSendMessage}
                                        onTyping={handleTyping}
                                        onlineUsers={onlineUsers}
                                        onBack={() => setShowMobileList(true)}
                                    />
                                ) : (
                                    <div className="flex-1 flex items-center justify-center p-4">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <MessageSquare size={32} className="text-primary" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                No conversation selected
                                            </h3>
                                            <p className="text-gray-500 mb-4">
                                                Tap the message icon to select a conversation
                                            </p>
                                            <button
                                                onClick={() => setShowMobileList(true)}
                                                className="md:hidden bg-primary text-white px-4 py-2 rounded-lg"
                                            >
                                                View Conversations
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </BuyerContainer>
            </div>
        </section>
    );
};

export default Chat;