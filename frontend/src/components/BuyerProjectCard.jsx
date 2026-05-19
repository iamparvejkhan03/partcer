import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ChevronRight, Bookmark } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import ExpressInterestModal from '../components/freelancer/ExpressInterestModal';

const ProjectCard = ({ project, onSaveToggle, onRefresh }) => {
    const { user, isAuthenticated, userType } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(project?.isSaved || false);
    const [showExpressModal, setShowExpressModal] = useState(false);
    const [hasApplied, setHasApplied] = useState(project?.hasApplied || false);

    // Helper functions for new model
    const getPeriodLabel = (period) => {
        const map = {
            one_time: 'One-time',
            per_day: 'Per day',
            weekly: 'Weekly',
            monthly: 'Monthly'
        };
        return map[period] || period;
    };

    const getDurationLabel = (period, duration) => {
        if (period === 'one_time') return 'Single session';
        if (duration === 'standard') return 'Standard (2-3 hrs)';
        return 'Full day (6-8 hrs)';
    };

    const handleSaveToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to save projects');
            return;
        }

        if (userType !== 'freelancer') {
            toast.error('Only mentors can save projects');
            return;
        }

        try {
            setIsSaving(true);

            if (isSaved) {
                await axiosInstance.delete(`/api/v1/projects/${project._id}/save`);
                setIsSaved(false);
                toast.success('Project removed from saved');
            } else {
                await axiosInstance.post(`/api/v1/projects/${project._id}/save`);
                setIsSaved(true);
                toast.success('Project saved successfully');
            }

            if (onSaveToggle) {
                onSaveToggle(project._id, !isSaved);
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to save project';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExpressInterest = async (data) => {
        try {
            const response = await axiosInstance.post(`/api/v1/projects/${project._id}/apply`, {
                proposal: data.proposal,
                period: data.period,
                duration: data.duration,
                service: data.service
            });

            if (response.data.success) {
                toast.success('Interest expressed successfully!');
                setShowExpressModal(false);
                setHasApplied(true);
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to submit interest';
            toast.error(errorMessage);
        }
    };

    const handleExpressClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to express interest');
            return;
        }

        if (userType !== 'freelancer') {
            toast.error('Only mentors can express interest');
            return;
        }

        setShowExpressModal(true);
    };

    // Format posted time
    const formatPostedTime = () => {
        if (!project.createdAt) return 'Recently';

        const now = new Date();
        const posted = new Date(project.createdAt);
        const diffMs = now - posted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        return 'a long time ago';
    };

    // Get buyer name
    const getBuyerName = () => {
        if (!project.buyer) return 'Client';
        return project.buyer.displayName ||
            `${project.buyer.firstName || ''} ${project.buyer.lastName || ''}`.trim() ||
            'Client';
    };

    // Get buyer avatar
    const getBuyerAvatar = () => {
        return project.buyer?.profileImage ||
            'https://images.pexels.com/photos/27523254/pexels-photo-27523254.jpeg';
    };

    // Check if buyer is verified
    const isBuyerVerified = () => {
        return project.buyer?.isVerified || false;
    };

    return (
        <Link to={`/project/${project._id}`} className="block">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 w-full hover:border-primary/30 cursor-pointer">
                <div className="p-5 md:p-6">
                    {/* Header Section - Title and Bookmark */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight line-clamp-1">
                                {project.title || 'Untitled Project'}
                            </h2>
                        </div>

                        {/* Bookmark Button */}
                        {userType === 'freelancer' && (
                            <button
                                onClick={handleSaveToggle}
                                disabled={isSaving}
                                className='p-2 rounded-lg cursor-pointer transition-all bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 flex-shrink-0 disabled:opacity-50'
                            >
                                <Bookmark size={18} className={isSaved ? 'fill-primary text-primary' : ''} />
                            </button>
                        )}
                    </div>

                    {/* Buyer Info and Posted Time */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <img
                                src={getBuyerAvatar()}
                                alt={getBuyerName()}
                                loading='lazy'
                                className='h-5 w-5 rounded-full object-cover'
                            />
                            <span className="text-sm text-gray-600">
                                by {getBuyerName()}
                            </span>
                            {isBuyerVerified() && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>{formatPostedTime()}</span>
                        </div>
                    </div>

                    {/* Category and Subcategory Pills - Blue and Purple */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {project.category && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {typeof project.category === 'object' ? project.category.name : project.category}
                            </span>
                        )}
                        {project.subCategory && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {typeof project.subCategory === 'object' ? project.subCategory.name : project.subCategory}
                            </span>
                        )}
                    </div>

                    {/* Period, Duration, Service Row */}
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                        <span className="text-gray-700 font-medium">
                            {getPeriodLabel(project.period)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">
                            {getDurationLabel(project.period, project.duration)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">
                            {project.service || 'Skill Training'}
                        </span>
                    </div>

                    {/* Skills Pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(project.skills || []).slice(0, 3).map((skill, index) => (
                            <span
                                key={index}
                                className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                            >
                                {typeof skill === 'string' ? skill : skill.name}
                            </span>
                        ))}
                        {(project.skills || []).length > 3 && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                +{(project.skills || []).length - 3}
                            </span>
                        )}
                    </div>

                    {/* Interested Count and Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                            <Users size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {project.proposalsCount || 0} mentor{(project.proposalsCount || 0) !== 1 ? 's' : ''} interested
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <p
                                // to={`/project/${project._id}`}
                                // onClick={(e) => e.stopPropagation()}
                                className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                            >
                                View full project
                                <ChevronRight size={14} />
                            </p>

                            {userType === 'freelancer' && !hasApplied && (
                                <button
                                    onClick={handleExpressClick}
                                    className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Express Interest
                                </button>
                            )}

                            {userType === 'freelancer' && hasApplied && (
                                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                                    Interest Sent
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Express Interest Modal */}
            <ExpressInterestModal
                isOpen={showExpressModal}
                onClose={() => setShowExpressModal(false)}
                projectDetails={project}
                onSubmit={handleExpressInterest}
                isSubmitting={false}
            />
        </Link>
    );
};

export default ProjectCard;