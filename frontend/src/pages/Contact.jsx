import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components';
import {
    MapPin,
    Mail,
    Phone,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Linkedin,
    Send,
    CheckCircle,
    Clock,
    MessageCircle,
    Globe,
    Building,
    Users,
    Briefcase,
    Watch,
    Star,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { otherData } from '../assets';
import axiosInstance from '../utils/axiosInstanceOld';
import toast from 'react-hot-toast';

const Contact = () => {
    const [sending, setSending] = useState(false);
    const [userType, setUserType] = useState('freelancer');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            userType: 'freelancer',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        }
    });

    // Contact information
    const contactInfo = [
        {
            icon: Building,
            title: 'Office Address',
            locations: [
                {
                    country: 'India',
                    flag: 'https://flagcdn.com/w40/in.png',
                    address: 'India',
                },
            ],
            color: 'bg-purple-100 text-purple-600',
        },
        {
            icon: Mail,
            title: 'Email Us',
            description: "We're committed to prompt responses and strive to address all inquiries within 24 hours.",
            emails: ['admin@partcer.com'],
            color: 'bg-blue-100 text-blue-600',
        },
        {
            icon: Phone,
            title: 'WhatsApp Us',
            description: 'Feel free to send us a message, and we\'ll be happy to assist you promptly.',
            phones: ['+91 1234 567890'],
            color: 'bg-green-100 text-green-600',
        },
    ];

    // Social media links
    const socialLinks = [
        { icon: Facebook, url: 'https://www.facebook.com', label: 'Facebook' },
        { icon: Twitter, url: 'https://x.com/', label: 'Twitter' },
        { icon: Instagram, url: 'https://www.instagram.com', label: 'Instagram' },
        { icon: Youtube, url: 'https://www.youtube.com', label: 'YouTube' },
        { icon: Linkedin, url: 'https://www.linkedin.com', label: 'LinkedIn' },
    ];

    // FAQ data
    const faqs = [
        {
            question: 'How quickly do you respond to inquiries?',
            answer: 'We strive to respond to all inquiries within 24 hours during business days. For urgent matters, we recommend using our WhatsApp contact for faster response.',
        },
        {
            question: 'Do you offer support on weekends?',
            answer: 'Yes, our support team is available on Saturdays from 10 AM to 6 PM. For Sunday inquiries, we will respond on Monday.',
        },
        {
            question: 'Can I get help finding the right mentor?',
            answer: 'Absolutely! Contact us and we\'ll personally help you browse mentors, understand their expertise, and find the perfect match for your career goals.',
        }
    ];

    const onSubmit = async (data) => {
        try {
            setSending(true);

            // Combine first + last name into one 'name' field
            const payload = {
                name: `${data.firstName} ${data.lastName}`.trim(),
                email: data.email,
                phone: data.phone || '',
                userType: data.userType,
                message: `${data.subject}\n\n${data.message}`,
            };

            const { data: response } = await axiosInstance.post('/api/v1/contact/submit', payload);

            if (response?.success) {
                toast.success(response.message || 'Message sent successfully!');
                reset();
                setSending(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(response.message || 'Failed to send message');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-16">

            {/* Breadcrumb Header */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                <Container>
                    <div className="py-6">
                        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                            <Link to="/" className="hover:text-primary transition-colors">
                                Home
                            </Link>
                            <span className="text-gray-400">›</span>
                            <span className="text-primary font-medium">Contact Us</span>
                        </nav>

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                                    Get in Touch with <span className="text-primary">Partcer</span>
                                </h1>
                                <p className="text-gray-600 max-w-2xl">
                                    Have questions about our job training/support or freelance opportunities? We're here to help you succeed. Contact us anytime!
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-orange-400 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} fill='orange' size={18} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-600">4.8 (2.5k+ reviews)</span>
                                </div>
                                <div className="h-8 w-px bg-gray-300" />
                                <div className="text-center">
                                    <span className="text-sm text-gray-600">Response Time</span>
                                    <div className="flex items-center gap-1 text-primary font-medium">
                                        <Clock size={16} />
                                        <span>&lt; 24 hrs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                {/* Contact Form Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Left Column - Contact Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-12 h-0.5 bg-primary" />
                            <span className="text-primary font-medium uppercase tracking-wider text-sm">Contact Info</span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                            Let's Start a <span className="text-primary">Conversation</span>
                        </h2>

                        <p className="text-gray-600 mb-8 leading-relaxed">
                            You can reach us anytime via{' '}
                            <Link to={`mailto:${otherData?.email}`} className="text-black hover:underline font-medium">
                                {otherData?.email}
                            </Link>
                        </p>

                        {/* Contact Cards */}
                        <div className="space-y-6">
                            {contactInfo.map((info, index) => {
                                const Icon = info.icon;
                                return (
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-lg ${info.color} flex items-center justify-center flex-shrink-0`}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>

                                                {info.locations ? (
                                                    <div className="space-y-3">
                                                        {info.locations.map((loc, idx) => (
                                                            <div key={idx} className="flex items-center gap-2">
                                                                <img
                                                                    src={loc.flag}
                                                                    loading='lazy'
                                                                    alt={loc.country}
                                                                    className="w-5 h-5 rounded-sm object-cover mt-1"
                                                                />
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-900">{loc.country}:</span>
                                                                    <p className="text-sm text-gray-600">{loc.address}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : info.emails ? (
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                                                        <div className="space-y-2">
                                                            {info.emails.map((email, idx) => (
                                                                <Link
                                                                    key={idx}
                                                                    to={`mailto:${email}`}
                                                                    className="flex items-center gap-2 text-black hover:underline text-sm"
                                                                >
                                                                    <Mail size={14} />
                                                                    {email}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : info.phones ? (
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                                                        <div className="space-y-2">
                                                            {info.phones.map((phone, idx) => (
                                                                <Link
                                                                    key={idx}
                                                                    to={`https://wa.me/${phone.replace(/\D/g, '')}`}
                                                                    target="_blank"
                                                                    className="flex items-center gap-2 text-black hover:underline text-sm"
                                                                >
                                                                    <Phone size={14} />
                                                                    {phone}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Social Media */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us On</h3>
                            <div className="flex flex-wrap items-center gap-3">
                                {socialLinks.map((social, index) => {
                                    const Icon = social.icon;
                                    return (
                                        <Link
                                            key={index}
                                            to={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 group"
                                            aria-label={social.label}
                                        >
                                            <Icon size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Contact Form */}
                    <div>
                        <div className="bg-white border border-gray-200 shadow rounded-xl p-6 lg:p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1 h-6 bg-primary rounded-full" />
                                <h3 className="text-xl font-bold text-gray-900">Send us a Message</h3>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name <span className="text-primary">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            {...register('firstName', { required: 'First name is required' })}
                                            className={`w-full px-4 py-3 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                                            placeholder="John"
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            {...register('lastName')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address <span className="text-primary">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address',
                                            },
                                        })}
                                        className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                                        placeholder="john.doe@example.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium leading-none text-gray-700 flex items-center gap-2">
                                        <Users size={20} />
                                        <span>I am a</span>
                                    </label>

                                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-3 my-2">
                                        <label className={`flex items-center gap-5 border py-3 px-5 rounded cursor-pointer transition-all ${userType === 'freelancer' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type="radio"
                                                value="freelancer"
                                                hidden
                                                {...register('userType', { required: false })}
                                                onChange={(e) => setUserType(e.target.value)}
                                            />
                                            <Briefcase size={40} className={`flex-shrink-0 p-2 rounded transition-all ${userType === 'freelancer' ? 'bg-primary text-white' : 'bg-gray-200 text-black'}`} />
                                            <div>
                                                <p className="text-sm font-semibold">I'm a Mentor</p>
                                                <p className="text-sm text-gray-600">I want to teach and share my knowledge</p>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-5 border py-3 px-5 rounded cursor-pointer transition-all ${userType === 'buyer' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input
                                                type="radio"
                                                value="buyer"
                                                hidden
                                                {...register('userType', { required: false })}
                                                onChange={(e) => setUserType(e.target.value)}
                                            />
                                            <Users size={40} className={`flex-shrink-0 p-2 rounded transition-all ${userType === 'buyer' ? 'bg-primary text-white' : 'bg-gray-200 text-black'}`} />
                                            <div>
                                                <p className="text-sm font-semibold">I'm a Student</p>
                                                <p className="text-sm text-gray-600">I want to hire a mentor</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject <span className="text-primary">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('subject', { required: 'Subject is required' })}
                                        className={`w-full px-4 py-3 border ${errors.subject ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`}
                                        placeholder="How can we help you?"
                                    />
                                    {errors.subject && (
                                        <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message <span className="text-primary">*</span>
                                    </label>
                                    <textarea
                                        {...register('message', { required: 'Message is required' })}
                                        rows={5}
                                        className={`w-full px-4 py-3 border ${errors.message ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors resize-none`}
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                    {errors.message && (
                                        <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                    {sending ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-14">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-12 h-0.5 bg-primary" />
                            <span className="text-primary font-medium uppercase tracking-wider text-sm">FAQ</span>
                            <div className="w-12 h-0.5 bg-primary" />
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-600">
                            Find quick answers to common questions about contacting us and our support process.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <MessageCircle size={20} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map Section */}
                {/* <div className="mt-14">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <Globe size={18} className="text-primary" />
                            <span className="font-medium text-gray-700">Our Locations</span>
                        </div>
                        <div className="h-80 w-full bg-gray-100 flex items-center justify-center">
                            <div className="text-center">
                                <MapPin size={40} className="text-primary mx-auto mb-3" />
                                <p className="text-gray-600">Interactive map will be integrated here</p>
                                <p className="text-sm text-gray-500">India | UAE | Coming Soon to More Countries</p>
                            </div>
                        </div>
                    </div>
                </div> */}
            </Container>
        </div>
    );
};

export default Contact;