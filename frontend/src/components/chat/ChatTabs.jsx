import { useState } from 'react';
import { MessageCircle, Video, FolderOpen, Bookmark } from 'lucide-react';

const ChatTabs = ({ activeTab, onTabChange, children }) => {
    const tabs = [
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'meeting', label: 'Meeting', icon: Video },
        { id: 'resources', label: 'Resources', icon: FolderOpen },
        { id: 'saved', label: 'Saved', icon: Bookmark },
    ];

    // Find the active tab's content
    const activeContent = Array.isArray(children) 
        ? children.find(child => child?.props?.tabId === activeTab)
        : children;

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-gray-200 bg-white">
                <div className="flex px-4 space-x-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-3 text-sm font-medium
                                    transition-all duration-200 relative
                                    ${isActive
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                {activeContent}
            </div>
        </div>
    );
};

export default ChatTabs;