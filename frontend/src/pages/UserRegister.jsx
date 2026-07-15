import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    Briefcase,
    UserCircle,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Shield,
    Award,
    Phone,
    ChevronDown
} from 'lucide-react';
import { Container } from '../components';
import axiosInstance from '../utils/axiosInstanceOld';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import useCountryStates from '../hooks/useCountryStates';
import { userTypes } from '../assets';

function UserRegister() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userType, setUserType] = useState('freelancer');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { setUser, user } = useAuth();
    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);

    // Fetch countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            setCountries(await countriesAPI());
        };
        fetchCountries();
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            // navigate(`/${user.userType}/dashboard`);
            navigate(`/${user.userType}/profile/settings`);
        }
    }, [user, navigate]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue
    } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            country: '',
            userType: 'freelancer'
        },
    });

    const password = watch('password');

    // Handle validation errors with useEffect
    useEffect(() => {
        if (errors.confirmPassword) {
            toast.error(errors.confirmPassword.message);
        }
    }, [errors.confirmPassword]);

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: 'No password', color: 'bg-gray-200' };

        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.match(/[a-z]+/)) strength += 1;
        if (password.match(/[A-Z]+/)) strength += 1;
        if (password.match(/[0-9]+/)) strength += 1;
        if (password.match(/[@$#&!%*?&]+/)) strength += 1;

        return {
            strength,
            label: strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong',
            color: strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'
        };
    };

    const passwordStrength = getPasswordStrength(password);

    // Update form value when userType changes
    const handleUserTypeChange = (type) => {
        setUserType(type);
        setValue('userType', type);
    };

    const registerationHandler = async (data) => {
        setIsLoading(true);

        try {
            // Prepare registration payload
            const registrationPayload = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email.toLowerCase(),
                phone: data.phone,
                password: data.password,
                country: countries.find(c => c.code === data.country)?.name || data.country,
                userType: data.userType,
                agreeTerms: agreeTerms
            };

            // Send registration request using axiosInstance
            const response = await axiosInstance.post('/api/v1/users/register', registrationPayload);

            if (response.data.success) {
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
                };

                localStorage.setItem('user', JSON.stringify(userInfo));
                setUser(userInfo);

                toast.success(response.data.message || 'Registration successful! Please verify your email.');

                // Redirect based on user type
                const redirectPath = userData.userType === 'freelancer'
                    ? '/freelancer/profile/settings' : userData.userType === 'agency'
                        ? '/agency/profile/settings' : '/buyer/profile/settings';
                navigate(redirectPath);
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error?.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <Container>
                <div className="max-w-2xl mx-auto">
                    {/* Welcome Section */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award size={32} className="text-primary" />
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            Join <span className="text-primary">Partcer</span>
                        </h1>
                        <p className="text-gray-600">
                            We are delighted to welcome you as a member of our freelance marketplace for job training and support!
                        </p>
                    </div>

                    {/* Registration Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
                        <form onSubmit={handleSubmit(registerationHandler)} className="space-y-6">
                            {/* Name Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-primary">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="firstName"
                                            type="text"
                                            {...register('firstName', {
                                                required: 'First name is required',
                                                minLength: {
                                                    value: 2,
                                                    message: 'First name must be at least 2 characters',
                                                },
                                            })}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {errors.firstName.message}
                                        </p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name (optional)
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="lastName"
                                            type="text"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {errors.lastName.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address <span className="text-primary">*</span>
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
                                                    message: 'Please enter a valid email address',
                                                },
                                            })}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number <span className="text-primary">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="phone"
                                            type="tel"
                                            {...register('phone', {
                                                required: 'Phone number is required',
                                                pattern: {
                                                    value: /^[\d+\s()-]{10,15}$/,
                                                    message: 'Please enter a valid phone number'
                                                }
                                            })}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.phone ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password <span className="text-primary">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters',
                                            },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                message: 'Password must contain uppercase, lowercase, number and special character',
                                            },
                                        })}
                                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors ${errors.password ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Create a strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="mt-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${passwordStrength.strength <= 2 ? 'text-red-600' :
                                                passwordStrength.strength <= 4 ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>
                                                {passwordStrength.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle size={12} className={password?.length >= 8 ? 'text-green-500' : 'text-gray-300'} />
                                                <span className={password?.length >= 8 ? 'text-gray-700' : 'text-gray-400'}>
                                                    At least 8 characters
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle size={12} className={password?.match(/[A-Z]/) ? 'text-green-500' : 'text-gray-300'} />
                                                <span className={password?.match(/[A-Z]/) ? 'text-gray-700' : 'text-gray-400'}>
                                                    One uppercase letter
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle size={12} className={password?.match(/[a-z]/) ? 'text-green-500' : 'text-gray-300'} />
                                                <span className={password?.match(/[a-z]/) ? 'text-gray-700' : 'text-gray-400'}>
                                                    One lowercase letter
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle size={12} className={password?.match(/[0-9]/) ? 'text-green-500' : 'text-gray-300'} />
                                                <span className={password?.match(/[0-9]/) ? 'text-gray-700' : 'text-gray-400'}>
                                                    One number
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CheckCircle size={12} className={password?.match(/[@$!%*?&]/) ? 'text-green-500' : 'text-gray-300'} />
                                                <span className={password?.match(/[@$!%*?&]/) ? 'text-gray-700' : 'text-gray-400'}>
                                                    One special character
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className={`${errors.confirmPassword && 'mb-3'}`}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={20} className="text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('confirmPassword', {
                                            required: 'Please confirm your password',
                                            validate: value => value === password || 'Passwords do not match'
                                        })}
                                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Re-enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1 absolute">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Country */}
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                    Country of Residence <span className="text-primary">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="country"
                                        {...register('country', { required: 'Country is required' })}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors appearance-none ${errors.country ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select your country</option>
                                        {countries.map(country => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                {errors.country && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.country.message}
                                    </p>
                                )}
                            </div>

                            {/* User Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    I want to join as <span className="text-primary">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Freelancer Option */}
                                    <label
                                        className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${userType === 'freelancer'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value="freelancer"
                                            checked={userType === 'freelancer'}
                                            onChange={() => handleUserTypeChange('freelancer')}
                                            className="sr-only"
                                        />
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${userType === 'freelancer' ? 'bg-primary' : 'bg-gray-100'
                                            }`}>
                                            <UserCircle className={`w-6 h-6 ${userType === 'freelancer' ? 'text-white' : 'text-gray-500'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${userType === 'freelancer' ? 'text-primary' : 'text-gray-700'
                                                }`}>
                                                {userTypes.freelancer}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                I want to offer my skills & services
                                            </p>
                                        </div>
                                    </label>

                                    {/* Buyer Option */}
                                    <label
                                        className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${userType === 'buyer'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value="buyer"
                                            checked={userType === 'buyer'}
                                            onChange={() => handleUserTypeChange('buyer')}
                                            className="sr-only"
                                        />
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${userType === 'buyer' ? 'bg-primary' : 'bg-gray-100'
                                            }`}>
                                            <Briefcase className={`w-6 h-6 ${userType === 'buyer' ? 'text-white' : 'text-gray-500'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${userType === 'buyer' ? 'text-primary' : 'text-gray-700'
                                                }`}>
                                                {userTypes.buyer}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                I want to hire talent & get support
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className="relative mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${agreeTerms ? 'bg-primary border-primary' : 'border-gray-300'
                                            }`}>
                                            {agreeTerms && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        I have read and agree to the{' '}
                                        <Link to="/terms-conditions" className="text-primary hover:text-primary/80 font-medium">
                                            Terms & Conditions
                                        </Link>{' '}
                                        and{' '}
                                        <Link to="/privacy-policy" className="text-primary hover:text-primary/80 font-medium">
                                            Privacy Policy
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !agreeTerms}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>

                        {/* Security Note */}
                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Shield size={18} className="text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">Your security matters</h4>
                                    <p className="text-xs text-gray-600">
                                        We use industry-standard encryption to protect your data. Your password is securely hashed and never stored in plain text.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default UserRegister;