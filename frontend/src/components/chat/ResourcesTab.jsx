// components/chat/ResourcesTab.jsx
import { useState, useEffect } from 'react';
import { Download, FileText, Image, Video, File, Calendar, User, Search, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const ResourcesTab = ({ conversationId }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchResources();
    }, [conversationId]);

    const fetchResources = async () => {
        try {
            const response = await axiosInstance.get(`/api/v1/chat/conversations/${conversationId}/resources`);
            if (response.data?.success) {
                setResources(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType === 'image') return <Image size={20} className="text-blue-500" />;
        if (fileType === 'video') return <Video size={20} className="text-purple-500" />;
        if (fileType === 'document') return <FileText size={20} className="text-orange-500" />;
        return <File size={20} className="text-gray-500" />;
    };

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.attachments[0]?.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || resource.attachments[0]?.fileType === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <div className="flex gap-2 mt-3">
                    {['all', 'image', 'document', 'video'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${filterType === type
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resources List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredResources.length === 0 ? (
                    <div className="text-center py-10">
                        <FolderOpen size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No resources shared yet</p>
                        <p className="text-sm text-gray-400">Resources shared by mentor will appear here</p>
                    </div>
                ) : (
                    filteredResources.map((resource) => (
                        <div key={resource._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={resource.sender?.profileImage || 'https://via.placeholder.com/32'}
                                        alt={resource.sender?.firstName}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {resource.sender?.firstName} {resource.sender?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {format(new Date(resource.createdAt), 'MMM d, yyyy • h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {resource.content && (
                                <p className="text-sm text-gray-700 mb-3">{resource.content}</p>
                            )}

                            <div className="space-y-2">
                                {resource.attachments.map((attachment, idx) => (
                                    <a
                                        key={idx}
                                        href={attachment.url}
                                        download={attachment.fileName}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(attachment.fileType)}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                                                    {attachment.fileName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(attachment.fileSize / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <Download size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ResourcesTab;