import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Users, Clock, Briefcase, ChevronRight, Bookmark } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

const ProjectCard = ({ project, onSaveToggle }) => {
    const { user, isAuthenticated, userType } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(project?.isSaved || false);

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

    // Format budget display
    const formatBudget = () => {
        if (project.projectType === 'fixed') {
            if (project.minBudget && project.maxBudget) {
                return `$${project.minBudget.toLocaleString()} - $${project.maxBudget.toLocaleString()}`;
            }
            return `$${project.budget?.toLocaleString() || 0}`;
        } else {
            return `$${project.hourlyRate || 0}/hr (est. ${project.estimatedHours || 0} hrs)`;
        }
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
        const diffYears = Math.floor(diffDays / 365);

        if (diffMins < 1) return 'Posted just now';
        if (diffMins < 60) return `Posted ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `Posted ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `Posted ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffWeeks < 4) return `Posted ${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        if (diffMonths < 12) return `Posted ${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        return `Posted ${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 w-full max-w-full mx-auto hover:border-primary/20 cursor-pointer">
                <div className="p-6 md:p-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 md:mb-6">
                        {/* User Image and Content */}
                        <div className="flex items-start gap-4 w-full">
                            <img
                                src={getBuyerAvatar()}
                                alt={getBuyerName()}
                                loading='lazy'
                                className='h-14 w-14 md:h-16 md:w-16 rounded-lg object-cover flex-shrink-0'
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-lg md:text-xl font-medium text-gray-900 leading-tight">
                                        {project.title || 'Untitled Project'}
                                    </h2>
                                    {isBuyerVerified() && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            Verified
                                        </span>
                                    )}
                                </div>

                                {/* Desktop Stats */}
                                <div className="hidden md:flex items-center gap-4 text-gray-500 mt-2">
                                    {/* <div className="flex items-center gap-2">
                                        <MapPin size={18} />
                                        <span className="font-base">{project.location || 'Remote'}</span>
                                    </div> */}
                                    {/* <div className="text-gray-400">•</div> */}
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={18} />
                                        <span className="font-base">{formatBudget()}</span>
                                    </div>
                                    <div className="text-gray-400">•</div>
                                    <div className="flex items-center gap-2">
                                        <Users size={18} />
                                        <span className="font-base">{project.applicantsCount || 0} Applicant{(project.applicantsCount || 0) !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bookmark Button - Desktop */}
                        {userType === 'freelancer' && (
                            <button 
                                onClick={handleSaveToggle}
                                disabled={isSaving}
                                className='p-3 hidden md:block rounded-lg cursor-pointer transition-all bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 self-start md:self-auto mt-2 md:mt-0 disabled:opacity-50'
                            >
                                <Bookmark size={20} className={isSaved ? 'fill-primary text-primary' : ''} />
                            </button>
                        )}
                    </div>

                    {/* Mobile Stats */}
                    <div className="flex flex-wrap gap-3 md:hidden text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className='flex-shrink-0' />
                            <span className="text-sm">{project.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className='flex-shrink-0' />
                            <span className="text-sm">{formatBudget()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={16} className='flex-shrink-0' />
                            <span className="text-sm">{project.applicantsCount || 0} Applicant{(project.applicantsCount || 0) !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 leading-relaxed mb-6 line-clamp-2">
                        {project.description?.replace(/<[^>]*>/g, '') || 'No description provided'}
                    </p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {(project.skills || []).slice(0, 4).map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {typeof skill === 'string' ? skill : skill.name}
                                </span>
                            ))}
                            {(project.skills || []).length > 4 && (
                                <span className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium">
                                    +{(project.skills || []).length - 4}
                                </span>
                            )}
                        </div>

                        {/* Posted Time */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                            <Clock size={16} className="text-gray-400 flex-shrink-0" />
                            <span>{formatPostedTime()}</span>
                        </div>

                        {/* Bookmark Button - Mobile */}
                        {userType === 'freelancer' && (
                            <button 
                                onClick={handleSaveToggle}
                                disabled={isSaving}
                                className='p-3 md:hidden rounded-lg cursor-pointer transition-all bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 disabled:opacity-50'
                            >
                                <Bookmark size={20} className={isSaved ? 'fill-primary text-primary' : ''} />
                            </button>
                        )}
                    </div>

                    {/* Footer with View Project Button - Hidden as per original comment */}
                    {/* <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Briefcase size={18} className="text-gray-500" />
                                <span className="text-sm">Project by {isBuyerVerified() ? 'Verified Client' : 'Client'}</span>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg group">
                            <span>View Project</span>
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div> */}
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;