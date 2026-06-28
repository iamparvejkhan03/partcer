import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, Award } from 'lucide-react';
import { Container } from '../components';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login, user, setUser } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if(user?.userType === 'freelancer') {
                navigate('/projects');
            } else if(user?.userType === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/freelancers');
            }
        }
    }, [user, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const loginHandler = async (data) => {
        setIsLoading(true);

        try {
            // Prepare registration payload
            const loginPayload = {
                email: data.email.trim().toLowerCase(),
                password: data.password,
                rememberMe
            };

            const response = await axiosInstance.post('/api/v1/users/login', loginPayload);

            if (response.data?.success) {
                const { accessToken, refreshToken, user: userData } = response.data.data;

                // Store tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Store user info
                const userInfo = {
                    _id: userData._id,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    userType: userData.userType,
                    phone: userData.phone,
                    isVerified: userData.isVerified,
                    isActive: userData.isActive,
                    profileImage: userData.profileImage,
                    country: userData.country,
                    displayName: userData.displayName,
                    isAgency: userData.isAgency,
                    agencyName: userData.agencyName,
                };

                localStorage.setItem('user', JSON.stringify(userInfo));

                setUser(userInfo);

                toast.success(response.data.message || 'Login successful!');

                const redirectPath = userData.userType === 'freelancer'
                    ? '/freelancer/profile/settings'
                    : userData.userType === 'admin'
                        ? '/admin/dashboard'
                        : '/freelancers';

                navigate(redirectPath);
            }
        } catch (error) {
            console.error('Login error full details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config,
                request: error.request
            });

            // Clear any existing tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            // Show error message
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-16 flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10">
            <Container>
                <div className="w-full max-w-lg">

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Welcome Section */}
                        <div className="text-center mb-5">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                Welcome <span className="text-primary">Back</span>
                            </h1>
                            <p className="text-gray-600">
                                Please enter your email & password to access your account!
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(loginHandler)} className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address',
                                            },
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="you@example.com"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters',
                                            },
                                        })}
                                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.password ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="sr-only"
                                            disabled={isLoading}
                                        />
                                        <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${rememberMe ? 'bg-primary border-primary' : 'border-gray-300'
                                            }`}>
                                            {rememberMe && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-700">Remember Me</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign in</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/register/user"
                                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        {/* Security Note */}
                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Shield size={18} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">Secure Login</h4>
                                    <p className="text-xs text-gray-600">
                                        Your connection is encrypted and secure. We never store your password in plain text.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Login;