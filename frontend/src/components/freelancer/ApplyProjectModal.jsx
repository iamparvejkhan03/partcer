import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    X,
    Upload,
    Paperclip,
    DollarSign,
    Clock,
    Calendar,
    FileText,
    CheckCircle,
    AlertCircle,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Trash2,
    Plus,
    Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstanceOld';
import { useAuth } from '../../contexts/AuthContext';

const ApplyProjectModal = ({ isOpen, onClose, projectId, projectDetails, onSubmit }) => {
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [showTips, setShowTips] = useState(true);
    const [proposalType, setProposalType] = useState('standard');
    const [projectData, setProjectData] = useState(projectDetails || null);
    const [loadingProject, setLoadingProject] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [initialProjectData] = useState(projectDetails || null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors },
        reset,
        getValues
    } = useForm({
        defaultValues: {
            coverLetter: '',
            proposedBudget: projectDetails?.budget || '',
            proposedTimeline: '',
            experience: '',
            relevantWork: '',
            questions: '',
            agreeTerms: false,
            skills: []
        }
    });

    const proposedBudget = watch('proposedBudget');
    const proposedTimeline = watch('proposedTimeline');

    // Fetch project details if not provided
    useEffect(() => {
        if (isOpen && !projectDetails && projectId) {
            fetchProjectDetails();
        }
    }, [isOpen, projectId, projectDetails]);

    // Reset form when modal closes
    // useEffect(() => {
    //     if (!isOpen) {
    //         reset();
    //         setStep(1);
    //         setAttachments([]);
    //         setProposalType('standard');
    //         setShowTips(true);
    //     }
    // }, [isOpen, reset]);

    const fetchProjectDetails = async () => {
        try {
            setLoadingProject(true);
            const response = await axiosInstance.get(`/api/v1/projects/${projectId}`);

            if (response.data.success) {
                const project = response.data.data.project;
                setProjectData(project);

                // Set default budget based on project type
                if (project.projectType === 'fixed') {
                    setValue('proposedBudget', project.budget || project.minBudget || '');
                } else {
                    setValue('proposedBudget', project.hourlyRate || '');
                }
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
            toast.error('Failed to load project details');
            onClose();
        } finally {
            setLoadingProject(false);
        }
    };

    const steps = [
        { number: 1, label: 'Proposal', icon: FileText },
        { number: 2, label: 'Budget & Timeline', icon: DollarSign },
        { number: 3, label: 'Review', icon: CheckCircle }
    ];

    const nextStep = async () => {
        let isValid = true;

        if (step === 1) {
            isValid = await trigger(['coverLetter', 'experience']);
        }
        if (step === 2) {
            isValid = await trigger(['proposedBudget', 'proposedTimeline']);
        }

        if (isValid && step < 3) {
            setStep((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAttachmentUpload = (e) => {
        const files = Array.from(e.target.files);

        // Check file count
        if (attachments.length + files.length > 3) {
            toast.error('Maximum 3 files allowed');
            return;
        }

        // Check file size (max 5MB)
        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 5MB limit`);
                return false;
            }
            return true;
        });

        // Check file types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'application/zip',
            'application/x-zip-compressed'
        ];

        const typeValidFiles = validFiles.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                toast.error(`${file.name} is not a supported file type`);
                return false;
            }
            return true;
        });

        setAttachments([...attachments, ...typeValidFiles]);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (isOpen && !projectDetails && projectId && !projectData) {
            fetchProjectDetails();
        }
    }, [isOpen, projectId, projectDetails, projectData]);

    const handleClose = () => {
        reset();
        setStep(1);
        setAttachments([]);
        setProposalType('standard');
        onClose();
    };

    const onSubmitApplication = async (data) => {
        if (hasSubmitted) return;

        if (!isAuthenticated) {
            toast.error('Please login to apply');
            onClose();
            return;
        }

        if (user.userType !== 'freelancer') {
            toast.error('Only mentors can apply to projects');
            onClose();
            return;
        }

        try {
            setIsSubmitting(true);

            // Create FormData for file uploads
            const formData = new FormData();

            // Add all form fields
            formData.append('coverLetter', data.coverLetter);
            formData.append('proposedBudget', data.proposedBudget);
            formData.append('proposedTimeline', data.proposedTimeline);

            if (data.experience) {
                formData.append('experience', data.experience);
            }

            if (data.relevantWork) {
                formData.append('relevantWork', data.relevantWork);
            }

            if (data.questions) {
                formData.append('questions', data.questions);
            }

            // Send skills as JSON string if needed
            if (user?.skills && user.skills.length > 0) {
                formData.append('skills', JSON.stringify(user.skills));
            }

            // Add attachments as files - NOT as JSON
            attachments.forEach((file) => {
                formData.append('projectAttachments', file);
            });

            // Use projectId from props or from fetched data
            const targetProjectId = projectId || projectData?._id;

            if (!targetProjectId) {
                toast.error('Project ID not found');
                return;
            }

            const response = await axiosInstance.post(
                `/api/v1/projects/${targetProjectId}/apply`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.data.success) {
                toast.success('Application submitted successfully!');

                // Call onSubmit callback if provided
                if (onSubmit) {
                    onSubmit(response.data.data);
                }

                handleClose();
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to submit application';
            toast.error(errorMessage);
            console.error('Application submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '$0';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal Panel */}
                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Apply for Project</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {loadingProject ? 'Loading...' : (projectData?.title || projectDetails?.title)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {loadingProject ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    ) : (
                        <>
                            {/* Progress Steps */}
                            <div className="px-6 pt-6 pb-2">
                                <div className="flex items-center justify-between mb-6">
                                    {steps.map((stepItem) => (
                                        <div key={stepItem.number} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                                                ${step >= stepItem.number
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-gray-300 bg-white text-gray-400'
                                                }`}
                                            >
                                                {step > stepItem.number ? (
                                                    <CheckCircle size={18} />
                                                ) : (
                                                    <stepItem.icon size={18} />
                                                )}
                                            </div>
                                            <span className={`text-xs mt-2 font-medium ${step >= stepItem.number ? 'text-primary' : 'text-gray-500'
                                                }`}>
                                                {stepItem.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="relative">
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
                                    <div
                                        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
                                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmitApplication)} className="px-6 pb-6">
                                {/* Step 1: Cover Letter & Experience */}
                                {step === 1 && (
                                    <div className="space-y-6 mt-6">
                                        {/* Project Summary Card */}
                                        {(projectData || projectDetails) && (
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-2">Project Summary</h4>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Budget:</span>
                                                        <p className="font-medium text-gray-900">
                                                            {projectData?.projectType === 'fixed'
                                                                ? formatCurrency(projectData?.budget || projectData?.minBudget)
                                                                : `${formatCurrency(projectData?.hourlyRate)}/hr`
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Duration:</span>
                                                        <p className="font-medium text-gray-900">{projectData?.duration || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Experience:</span>
                                                        <p className="font-medium text-gray-900 capitalize">{projectData?.experienceLevel || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Applicants:</span>
                                                        <p className="font-medium text-gray-900">{projectData?.applicantsCount || 0}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Posted:</span>
                                                        <p className="font-medium text-gray-900">{formatDate(projectData?.createdAt)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Deadline:</span>
                                                        <p className="font-medium text-gray-900">{formatDate(projectData?.deadline)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cover Letter */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Cover Letter <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                {...register('coverLetter', {
                                                    required: 'Cover letter is required',
                                                    minLength: { value: 50, message: 'Cover letter must be at least 50 characters' }
                                                })}
                                                rows={6}
                                                placeholder="Introduce yourself and explain why you're the best fit for this project. Highlight your relevant experience and skills."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            {errors.coverLetter && (
                                                <p className="text-red-500 text-sm mt-1">{errors.coverLetter.message}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Minimum 50 characters. Be specific and professional.
                                            </p>
                                        </div>

                                        {/* Relevant Experience */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Relevant Experience <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                {...register('experience', {
                                                    required: 'Please describe your relevant experience',
                                                    minLength: { value: 50, message: 'Please provide more details' }
                                                })}
                                                rows={4}
                                                placeholder="Describe your experience with similar projects, technologies, or industries."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            {errors.experience && (
                                                <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                                            )}
                                        </div>

                                        {/* Portfolio/Links */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Portfolio or Relevant Work (Optional)
                                            </label>
                                            <textarea
                                                {...register('relevantWork')}
                                                rows={3}
                                                placeholder="Share links to your portfolio, GitHub, or similar projects you've worked on."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>

                                        {/* Attachments */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Attachments (Max 3 files, 5MB each)
                                            </label>

                                            {/* Upload Area */}
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleAttachmentUpload}
                                                    className="hidden"
                                                    id="application-attachments"
                                                    accept=".pdf,.doc,.docx,.jpg,.png,.zip"
                                                />
                                                <label
                                                    htmlFor="application-attachments"
                                                    className="cursor-pointer flex flex-col items-center"
                                                >
                                                    <Upload size={32} className="text-gray-400 mb-2" />
                                                    <p className="text-gray-600 mb-1">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PDF, DOC, DOCX, JPG, PNG, ZIP (max 5MB each)
                                                    </p>
                                                </label>
                                            </div>

                                            {/* File List */}
                                            {attachments.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {attachments.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <Paperclip size={16} className="text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                                                    <p className="text-xs text-gray-500">                                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAttachment(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Budget & Timeline */}
                                {step === 2 && (
                                    <div className="space-y-6 mt-6">
                                        {/* Proposal Type Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                How would you like to propose?
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <label
                                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${proposalType === 'standard'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="proposalType"
                                                        value="standard"
                                                        checked={proposalType === 'standard'}
                                                        onChange={(e) => setProposalType(e.target.value)}
                                                        className="hidden"
                                                    />
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${proposalType === 'standard'
                                                            ? 'border-primary bg-primary'
                                                            : 'border-gray-300'
                                                            }`}>
                                                            {proposalType === 'standard' && (
                                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">Standard Proposal</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Propose within the client's budget range
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>

                                                <label
                                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${proposalType === 'custom'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="proposalType"
                                                        value="custom"
                                                        checked={proposalType === 'custom'}
                                                        onChange={(e) => setProposalType(e.target.value)}
                                                        className="hidden"
                                                    />
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${proposalType === 'custom'
                                                            ? 'border-primary bg-primary'
                                                            : 'border-gray-300'
                                                            }`}>
                                                            {proposalType === 'custom' && (
                                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">Custom Proposal</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Suggest your own budget and timeline
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Budget */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {proposalType === 'standard' ? 'Proposed Budget' : 'Your Proposed Budget'} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                                <input
                                                    type="number"
                                                    {...register('proposedBudget', {
                                                        required: 'Budget is required',
                                                        min: { value: 10, message: 'Minimum budget is $10' }
                                                    })}
                                                    placeholder="Enter amount"
                                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                            {errors.proposedBudget && (
                                                <p className="text-red-500 text-sm mt-1">{errors.proposedBudget.message}</p>
                                            )}
                                            {(projectData || projectDetails) && proposalType === 'standard' && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {projectData?.projectType === 'fixed'
                                                        ? `Client's budget: ${formatCurrency(projectData?.budget || projectData?.minBudget)}`
                                                        : `Client's hourly rate: ${formatCurrency(projectData?.hourlyRate)}/hr`
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Timeline */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Proposed Timeline <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    {...register('proposedTimeline', {
                                                        required: 'Timeline is required',
                                                        pattern: {
                                                            value: /^[0-9]+(\s*-\s*[0-9]+)?\s*(days|weeks|months|day|week|month)/i,
                                                            message: 'Please specify timeline (e.g., "2 weeks", "1-2 months")'
                                                        }
                                                    })}
                                                    placeholder="e.g., 2 weeks, 1-2 months"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                            {errors.proposedTimeline && (
                                                <p className="text-red-500 text-sm mt-1">{errors.proposedTimeline.message}</p>
                                            )}
                                            {(projectData || projectDetails) && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Client expects project duration: {projectData?.duration || 'N/A'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Questions for Client */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Questions for the Client (Optional)
                                            </label>
                                            <textarea
                                                {...register('questions')}
                                                rows={3}
                                                placeholder="Do you have any questions about the project requirements, scope, or expectations?"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Review & Submit */}
                                {step === 3 && (
                                    <div className="space-y-6 mt-6">
                                        {/* Success Tips */}
                                        {showTips && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <HelpCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-blue-800 mb-1">Tips for a successful application</h4>
                                                        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4">
                                                            <li>Tailor your proposal to the specific project requirements</li>
                                                            <li>Highlight relevant experience and past similar work</li>
                                                            <li>Be clear about your availability and timeline</li>
                                                            <li>Proofread your cover letter for errors</li>
                                                        </ul>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowTips(false)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Application Summary */}
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                            <h4 className="font-medium text-gray-900">Review Your Application</h4>

                                            {/* Cover Letter Preview */}
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Cover Letter</p>
                                                <p className="text-sm text-gray-700 line-clamp-3">{watch('coverLetter')}</p>
                                            </div>

                                            {/* Experience Preview */}
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Relevant Experience</p>
                                                <p className="text-sm text-gray-700 line-clamp-2">{watch('experience')}</p>
                                            </div>

                                            {/* Budget & Timeline */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Proposed Budget</p>
                                                    <p className="font-semibold text-gray-900">{formatCurrency(proposedBudget)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Proposed Timeline</p>
                                                    <p className="font-semibold text-gray-900">{proposedTimeline}</p>
                                                </div>
                                            </div>

                                            {/* Questions */}
                                            {watch('questions') && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Questions for Client</p>
                                                    <p className="text-sm text-gray-700 line-clamp-2">{watch('questions')}</p>
                                                </div>
                                            )}

                                            {/* Attachments */}
                                            {attachments.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Attachments ({attachments.length})</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {attachments.map((file, index) => (
                                                            <span key={index} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                                                {file.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Terms Agreement */}
                                        <div>
                                            <label className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    {...register('agreeTerms', { required: 'You must agree to the terms' })}
                                                    className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-600">
                                                    I confirm that all information provided is accurate and I have the skills and experience required for this project. I agree to the platform's terms of service and will communicate professionally throughout the project.
                                                </span>
                                            </label>
                                            {errors.agreeTerms && (
                                                <p className="text-red-500 text-sm mt-1">{errors.agreeTerms.message}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
                                    {step > 1 ? (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            ← Previous
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {step < 3 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                                        >
                                            Continue →
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Application'
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplyProjectModal;