import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstanceOld';

const StartChatButton = ({ userId, userName }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleStartChat = async () => {
        if (!user) {
            toast.error('Please login to start a conversation');
            return;
        }

        try {
            // First, create or get conversation via API
            const { data } = await axiosInstance.post('/api/v1/chat/conversation', { 
                userId: userId 
            });
            
            // Navigate to chat with the user ID
            navigate(`/${user?.userType}/chat?user=${userId}`);
            
            toast.success(`Starting conversation with ${userName}`);
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error(error.response?.data?.message || 'Failed to start conversation');
        }
    };

    return (
        <button
            onClick={handleStartChat}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 justify-center"
        >
            <MessageSquare size={18} />
            <span>Message</span>
        </button>
    );
};

export default StartChatButton;