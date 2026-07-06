import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Shield,
    Lock,
    Bell,
    Eye,
    EyeOff,
    Check,
    X,
    Save,
    User,
    Mail,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle
} from "lucide-react";
import { Container, AgencyContainer, AgencyHeader, AgencySidebar } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function AccountSettings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            emailNotifications: true,
            projectNotifications: true,
            marketingEmails: false
        }
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const newPassword = watch("newPassword");

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: 'No password', color: 'bg-gray-200', message: 'Enter a password', checks: {} };

        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[@$!%*?&#]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        let label, color, message;
        if (score <= 2) {
            label = 'Weak';
            color = 'bg-red-500';
            message = 'Password is too weak';
        } else if (score <= 4) {
            label = 'Medium';
            color = 'bg-yellow-500';
            message = 'Password could be stronger';
        } else {
            label = 'Strong';
            color = 'bg-green-500';
            message = 'Strong password';
        }

        return { score, label, color, message, checks };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setSuccessMessage("");

        try {
            const response = await axiosInstance.post('/api/v1/users/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            if (response.data.success) {
                toast.success('Password changed successfully!');
                setSuccessMessage("Your password has been updated successfully!");
                // Reset form
                reset({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    emailNotifications: true,
                    projectNotifications: true,
                    marketingEmails: false
                });
            }
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error?.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.")) {
            setIsDeleting(true);
            try {
                const response = await axiosInstance.delete('/api/v1/users/account');
                
                if (response.data.success) {
                    toast.success('Your account has been deleted successfully');
                    logout();
                    navigate('/');
                }
            } catch (error) {
                console.error('Account deletion error:', error);
                toast.error(error?.response?.data?.message || 'Failed to delete account');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AgencySidebar />

            <div className="w-full relative">
                <AgencyHeader />
                <AgencyContainer>
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 py-6 md:py-8 mt-20 md:mt-0">
                        <div className="container mx-auto px-4 md:px-0">
                            <div className="flex items-center justify-start">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                        <Shield size={28} className="text-primary" />
                                        Account Settings
                                    </h1>
                                    <p className="text-gray-600 mt-2">
                                        Manage your password and privacy
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="container mx-auto py-6 md:py-8 px-4 md:px-0">
                        <form id="account-settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* Success Message */}
                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Check size={20} />
                                        <span>{successMessage}</span>
                                    </div>
                                </div>
                            )}

                            {/* Change Password Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Lock size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                                            <p className="text-gray-600 text-sm">Update your account password</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    {...register("currentPassword", {
                                                        required: "Current password is required",
                                                        minLength: {
                                                            value: 6,
                                                            message: "Password must be at least 6 characters"
                                                        }
                                                    })}
                                                    placeholder="Enter your current password"
                                                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {errors.currentPassword && (
                                                <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                                            )}
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    {...register("newPassword", {
                                                        required: "New password is required",
                                                        minLength: {
                                                            value: 8,
                                                            message: "Password must be at least 8 characters"
                                                        },
                                                        pattern: {
                                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                                            message: "Password must contain uppercase, lowercase, and numbers"
                                                        }
                                                    })}
                                                    placeholder="Enter new password"
                                                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {errors.newPassword && (
                                                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                                            )}

                                            {/* Password Strength Indicator */}
                                            {newPassword && (
                                                <div className="mt-4 space-y-3">
                                                    {/* Strength Bar */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-gray-600">Password Strength</span>
                                                            <span className={`text-xs font-medium ${
                                                                passwordStrength.score <= 2 ? 'text-red-600' :
                                                                passwordStrength.score <= 4 ? 'text-yellow-600' :
                                                                'text-green-600'
                                                            }`}>
                                                                {passwordStrength.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1 h-2">
                                                            {[1, 2, 3, 4, 5].map((segment) => (
                                                                <div
                                                                    key={segment}
                                                                    className={`flex-1 rounded-full transition-all duration-300 ${
                                                                        segment <= passwordStrength.score
                                                                            ? passwordStrength.color
                                                                            : 'bg-gray-200'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {passwordStrength.message}
                                                        </p>
                                                    </div>

                                                    {/* Password Requirements Checklist */}
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <div className="flex items-center gap-2">
                                                                {passwordStrength.checks.length ? (
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                ) : (
                                                                    <XCircle size={14} className="text-gray-300" />
                                                                )}
                                                                <span className={`text-xs ${passwordStrength.checks.length ? 'text-gray-700' : 'text-gray-400'}`}>
                                                                    At least 8 characters
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {passwordStrength.checks.uppercase ? (
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                ) : (
                                                                    <XCircle size={14} className="text-gray-300" />
                                                                )}
                                                                <span className={`text-xs ${passwordStrength.checks.uppercase ? 'text-gray-700' : 'text-gray-400'}`}>
                                                                    One uppercase letter
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {passwordStrength.checks.lowercase ? (
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                ) : (
                                                                    <XCircle size={14} className="text-gray-300" />
                                                                )}
                                                                <span className={`text-xs ${passwordStrength.checks.lowercase ? 'text-gray-700' : 'text-gray-400'}`}>
                                                                    One lowercase letter
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {passwordStrength.checks.number ? (
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                ) : (
                                                                    <XCircle size={14} className="text-gray-300" />
                                                                )}
                                                                <span className={`text-xs ${passwordStrength.checks.number ? 'text-gray-700' : 'text-gray-400'}`}>
                                                                    One number
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 sm:col-span-2">
                                                                {passwordStrength.checks.special ? (
                                                                    <CheckCircle size={14} className="text-green-500" />
                                                                ) : (
                                                                    <XCircle size={14} className="text-gray-300" />
                                                                )}
                                                                <span className={`text-xs ${passwordStrength.checks.special ? 'text-gray-700' : 'text-gray-400'}`}>
                                                                    One special character (@$!%*?&#)
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Retype Password *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    {...register("confirmPassword", {
                                                        required: "Please confirm your password",
                                                        validate: value => value === newPassword || "Passwords do not match"
                                                    })}
                                                    placeholder="Retype your new password"
                                                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                            )}
                                        </div>

                                        {/* Password Update Button */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    "Update Password"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy & Notification Section - Commented as requested */}
                            {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Bell size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Privacy & Notification</h2>
                                            <p className="text-gray-600 text-sm">Control your privacy and notification settings</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                                            <div className="space-y-4">
                                                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Mail size={18} className="text-green-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">Email Notifications</div>
                                                            <div className="text-sm text-gray-500">Receive updates about your account via email</div>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            {...register("emailNotifications")}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </div>
                                                </label>

                                                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-purple-100 rounded-lg">
                                                            <Bell size={18} className="text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">Project Updates</div>
                                                            <div className="text-sm text-gray-500">Get notified about new projects and bids</div>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            {...register("projectNotifications")}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </div>
                                                </label>

                                                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-orange-100 rounded-lg">
                                                            <Mail size={18} className="text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">Marketing Emails</div>
                                                            <div className="text-sm text-gray-500">Receive newsletters and promotional offers</div>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            {...register("marketingEmails")}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <button
                                                type="submit"
                                                name="update-privacy"
                                                disabled={isLoading}
                                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? "Updating..." : "Update Privacy Settings"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

                            {/* Account Actions Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-900">Delete Account</div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Permanently delete your account and all associated data
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={isDeleting}
                                                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    onClick={handleDeleteAccount}
                                                >
                                                    {isDeleting ? (
                                                        <>
                                                            <Loader2 size={16} className="animate-spin" />
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        "Delete Account"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </AgencyContainer>
            </div>
        </section>
    );
}

export default AccountSettings;