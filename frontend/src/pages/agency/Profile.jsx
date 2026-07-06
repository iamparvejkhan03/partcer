import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { AgencyContainer, AgencyHeader, AgencySidebar, LanguagesSelect, RTE } from "../../components";
import {
    User,
    Camera,
    Globe,
    Briefcase,
    DollarSign,
    X,
    Plus,
    Trash2,
    ChevronDown,
    Check,
    Upload,
    Save,
    Eye,
    Search,
    MapPin,
    Phone,
    Mail,
    Heart,
    ShoppingBag,
    CreditCard,
    Bell,
    Loader2
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import useCountryStates from "../../hooks/useCountryStates";

// Main Component
function Profile() {
    const { user, updateUserData, fetchCurrentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [profileImage, setProfileImage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [initialFetchDone, setInitialFetchDone] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState([]);

    const countriesAPI = useCountryStates();
    const [countries, setCountries] = useState([]);
    const [countriesList, setCountriesList] = useState([]);

    const { register, handleSubmit, control, setValue, watch, formState: { errors }, reset } = useForm({
        defaultValues: {
            agencyName: "",
            email: "",
            phoneNumber: "",
            gender: "",
            tagline: "",
            bio: "",
            country: "",
            currencyPreference: "",
            englishLevel: "",
            languages: [],
            notificationPreferences: {
                email: true,
                sms: false,
                push: true
            }
        }
    });

    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
    ];

    const englishLevels = [
        { value: "basic", label: "Basic" },
        { value: "conversational", label: "Conversational" },
        { value: "fluent", label: "Fluent" },
        { value: "native", label: "Native/Bilingual" }
    ];

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            const countriesData = await countriesAPI();
            setCountries(countriesData);
            setCountriesList(countriesData.map(c => c.name));
        };
        fetchCountries();
    }, []);

    // Fetch fresh user data on mount
    useEffect(() => {
        const loadUserData = async () => {
            if (user && !initialFetchDone) {
                try {
                    const freshUserData = await fetchCurrentUser();
                    if (freshUserData) {
                        populateFormFields(freshUserData);
                    }
                } catch (error) {
                    console.error('Failed to fetch fresh user data:', error);
                    if (user) {
                        populateFormFields(user);
                    }
                } finally {
                    setInitialFetchDone(true);
                }
            } else if (user) {
                populateFormFields(user);
            }
        };

        loadUserData();
    }, [user, initialFetchDone]);

    const populateFormFields = (userData) => {
        // Basic info
        setValue("agencyName", userData.agencyName || "");
        setValue("email", userData.email || "");
        setValue("phoneNumber", userData.phone || "");
        setValue("tagline", userData.tagline || "");
        setValue("bio", userData.bio || "");
        setValue("country", userData.country || "");
        setValue("currencyPreference", userData.currencyPreference || "");

        if(userData.englishLevel){
            setValue("englishLevel", userData.englishLevel);
        }

        if(userData.gender){
            setValue("gender", userData.gender);
        }

        // Notification preferences
        if (userData.notificationPreferences) {
            setValue("notificationPreferences", userData.notificationPreferences);
        }

        // Languages
        setSelectedLanguages(userData.languages || []);
        setValue("languages", userData.languages || []);

        // Profile image
        setProfileImage(userData.profileImage || "");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should not be more than 5MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Append basic fields
            formData.append('agencyName', data.agencyName);
            formData.append('phone', data.phoneNumber || '');
            formData.append('gender', data.gender || '');
            formData.append('tagline', data.tagline || '');
            formData.append('bio', data.bio || '');
            formData.append('country', data.country || '');
            formData.append('currencyPreference', data.currencyPreference || '');
            formData.append('englishLevel', data.englishLevel || '');

            // Append languages as JSON string
            formData.append('languages', JSON.stringify(selectedLanguages));

            // Append notification preferences as JSON string
            if (data.notificationPreferences) {
                formData.append('notificationPreferences', JSON.stringify(data.notificationPreferences));
            }

            // Append image if changed
            if (imageFile) {
                formData.append('profileImage', imageFile);
            }

            const response = await axiosInstance.put('/api/v1/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const updatedUser = response.data.data;

                // Update user in context
                updateUserData(updatedUser);

                // Refresh form with updated data
                populateFormFields(updatedUser);

                toast.success('Profile updated successfully!');

                // Clear image file after successful upload
                if (imageFile) {
                    setImageFile(null);
                }
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error?.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!initialFetchDone) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AgencySidebar />
                <div className="w-full relative">
                    <AgencyHeader />
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AgencySidebar />

            <div className="w-full relative">
                <AgencyHeader />

                <AgencyContainer>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-20 md:mt-0">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-200 px-6 py-8">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    {/* Profile Section */}
                                    <div className="flex items-start gap-5">
                                        <div className="relative">
                                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-1.5 shadow-sm">
                                                {profileImage ? (
                                                    <img
                                                        src={profileImage}
                                                        alt="Profile"
                                                        className="h-full w-full rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200">
                                                        <User size={32} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 bg-white border border-gray-300 hover:border-primary hover:bg-primary hover:text-white text-gray-600 p-2 rounded-lg shadow-md cursor-pointer transition-all duration-200">
                                                {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                                <input
                                                    id="profile-upload"
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                    disabled={uploadingImage}
                                                />
                                            </label>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-col items-start gap-3">
                                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                                    Agency
                                                </span>
                                                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                                            </div>
                                            <p className="text-gray-600">
                                                Manage your agency information
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <button
                                            type="submit"
                                            form="agency-profile-form"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Form */}
                        <div className="py-4 md:p-8">
                            <form id="agency-profile-form" onSubmit={handleSubmit(onSubmit)}>
                                {/* Basic Information Section */}
                                <div className="bg-gray-50 px-6 rounded-xl mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                        <User size={20} />
                                        Basic Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Agency Name *
                                            </label>
                                            <input
                                                type="text"
                                                {...register("agencyName", { required: "Agency name is required" })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            {errors.agencyName && (
                                                <p className="mt-1 text-sm text-red-600">{errors.agencyName.message}</p>
                                            )}
                                        </div>

                                        {/* Email Field - Disabled */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="email"
                                                    {...register("email")}
                                                    disabled
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number Field */}
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="tel"
                                                    {...register("phoneNumber")}
                                                    placeholder="(555) 123-4567"
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        {/* Gender Field */}
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Gender
                                            </label>
                                            <select
                                                {...register("gender")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select Gender</option>
                                                {genderOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div> */}

                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tagline
                                            </label>
                                            <input
                                                type="text"
                                                {...register("tagline")}
                                                placeholder="e.g., Tech Enthusiast & Business Owner"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                {...register("bio")}
                                                rows={4}
                                                placeholder="Tell us a little about yourself..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Country & Language Section */}
                                <div className="bg-gray-50 px-6 rounded-xl mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                        <Globe size={20} />
                                        Country & Language
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Country
                                            </label>
                                            <select
                                                {...register("country")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select Country</option>
                                                {countriesList.map(country => (
                                                    <option key={country} value={country}>{country}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                English Level
                                            </label>
                                            <select
                                                {...register("englishLevel")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select English Level</option>
                                                {englishLevels.map(level => (
                                                    <option key={level.value} value={level.value}>{level.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-1">
                                            <LanguagesSelect
                                                selectedLanguages={selectedLanguages}
                                                onChange={setSelectedLanguages}
                                            />
                                        </div>

                                        {/* Currency Preference */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Currency Preference
                                            </label>
                                            <select
                                                {...register("currencyPreference")}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="INR">INR</option>
                                                <option value="USD">USD</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Save & Update Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </AgencyContainer>
            </div>
        </section>
    );
}

export default Profile;