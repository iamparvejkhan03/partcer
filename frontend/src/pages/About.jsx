import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Heading, HeadingDescription, Subheading } from '../components';
import {
    Star,
    MapPin,
    Mail,
    Youtube,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    ChevronLeft,
    ChevronRight,
    Award,
    BookOpen,
    Globe,
    Users,
    Target,
    Heart,
    Shield,
    Zap,
    TrendingUp,
    Clock,
    CheckCircle,
    Play,
    Quote,
} from 'lucide-react';
import { aboutUs, dummyUserImg, otherData } from '../assets';

const About = () => {
    const [activeVideo, setActiveVideo] = useState(false);
    const [activeTab, setActiveTab] = useState('story');

    // Company stats
    const stats = [
        { label: 'Job Seekers Trained', value: '10,000+', icon: Users },
        { label: 'Expert Mentors', value: '500+', icon: Award },
        { label: 'Hours of Training', value: '5,000+', icon: Clock },
        { label: 'Success Rate', value: '95%', icon: TrendingUp },
    ];

    // Core values
    const coreValues = [
        {
            title: 'Quality Training',
            description: 'We believe in delivering the highest quality mentorship. Every mentor on our platform is vetted for real industry experience.',
            icon: Award,
            color: 'bg-purple-100 text-purple-600',
        },
        {
            title: 'Accessibility',
            description: `Career support should be within reach for everyone. That's why we offer flexible options with services and projects.`,
            icon: Globe,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Empowerment',
            description: 'We aim to empower our learners, giving them the confidence, skills, and guidance to communicate effectively, and thrive in their tech careers.',
            icon: Zap,
            color: 'bg-orange-100 text-orange-600',
        },
        {
            title: 'Growth',
            description: 'Continuous improvement is at the heart of what we do—for both our learners and our platform. We evolve with industry trends.',
            icon: TrendingUp,
            color: 'bg-green-100 text-green-600',
        },
    ];

    // Team members
    const teamMembers = [
        {
            name: 'Manoj Prabakar',
            role: 'CEO & Founder',
            image: 'https://find.raretalancer.online/wp-content/uploads/2024/09/=ETNyQTMe5VeltmY05lX3VmYzlGdl1SM3IjN3YDN3QDM.png',
            bio: 'Passionate mentor with a vision to make career support accessible to all.',
        },
        {
            name: 'Sarah Johnson',
            role: 'Head of Marketing',
            image: 'https://find.raretalancer.online/wp-content/uploads/2024/09/=ETNyQTMe5VeltmY05lX3VmYzlGdl1SM3IjN3YDN3QDM.png',
            bio: 'Experienced mentor dedicated to creating effective learning materials.',
        },
        {
            name: 'Michael Chen',
            role: 'Lead Mentor',
            image: 'https://find.raretalancer.online/wp-content/uploads/2024/09/=ETNyQTMe5VeltmY05lX3VmYzlGdl1SM3IjN3YDN3QDM.png',
            bio: 'An instructor with 8+ years of training experience.',
        },
    ];

    // Company milestones
    const milestones = [
        { year: '2025', event: 'Partcer Founded', description: 'Started with a vision to connect learners with freelance experts.' },
        { year: '2025', event: 'First Trainers Onboarded', description: 'Welcomed our first vetted freelance mentors.' },
        { year: '2025', event: 'First Learners Served', description: 'Helped our first job seekers get career support.' },
        { year: '2026', event: 'Platform Launch', description: 'Officially launched our full platform experience.' },
        { year: '2026', event: 'Expanded Tech Categories', description: 'Added data science, cloud, and more.' }
    ];

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
                            <span className="text-primary font-medium">About Us</span>
                        </nav>

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                                    Discover the Story Behind <span className="text-primary">Partcer</span>
                                </h1>
                                <p className="text-gray-600 max-w-2xl">
                                    Experience how we connect job seekers with expert mentors who provide personalized training and career support.
                                </p>
                            </div>

                            {/* Rating */}
                            <div className="flex flex-col items-start lg:items-end">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={18}
                                                className={i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-semibold text-gray-900">4.8</span>
                                </div>
                                <span className="text-sm text-gray-600">Based on 2,500+ reviews</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                {/* Hero Video Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mt-8">
                    {/* Left Content */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-12 h-0.5 bg-primary" />
                            <span className="text-primary font-medium uppercase tracking-wider text-sm">Our Story</span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                            Empowering Careers Through <span className="text-primary">Expert Guidance</span>
                        </h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Partcer was founded with a clear vision: to bridge the gap between job seekers and their dream careers. We created a platform that connects ambitious professionals with experienced mentors and industry experts—for personalized 1:1 training, accessible anytime from anywhere.
                        </p>

                        {/* Founder Quote */}
                        <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-primary mb-6">
                            <Quote size={24} className="text-primary mb-3" />
                            <p className="text-lg font-medium text-gray-900 mb-3">
                                "Our platform empowers learners to master the skills they need to land their dream jobs. There's nothing better than helping someone grow, gain confidence, and succeed in their career."
                            </p>
                            <div className="flex items-center gap-3">
                                <img
                                    src={dummyUserImg}
                                    loading='lazy'
                                    alt="Manoj Prabakar"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <h5 className="font-semibold text-gray-900">Manoj Prabakar</h5>
                                    <p className="text-sm text-gray-500">Founder of Partcer</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin size={20} className="text-primary" />
                                </div>
                                <div>
                                    <div>
                                        <p className="text-sm text-gray-600">{otherData?.address}</p>
                                        <p className="text-sm text-gray-500">Support available 24/7</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Mail size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{otherData?.email}</p>
                                    <p className="text-sm text-gray-500">Support available 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Video */}
                    <div className="h-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[600px] rounded-xl overflow-hidden">
                        <img src={aboutUs} loading='lazy' alt="about us" className='h-full object-cover w-full' />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Icon size={24} className="text-primary" />
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-sm text-gray-600">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Core Values Section */}
                <div className="mt-14">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-12 h-0.5 bg-primary" />
                            <span className="text-primary font-medium uppercase tracking-wider text-sm">Our Values</span>
                            <div className="w-12 h-0.5 bg-primary" />
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            What We Stand For
                        </h2>
                        <p className="text-gray-600">
                            Our core values guide everything we do, from how we onboard trainers to how we support learners on their career journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coreValues.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                                    <div className={`w-12 h-12 rounded-lg ${value.color} flex items-center justify-center mb-4`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mission/Vision Tabs */}
                <div className="mt-14">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('story')}
                                className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${activeTab === 'story'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Our Story
                            </button>
                            <button
                                onClick={() => setActiveTab('mission')}
                                className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${activeTab === 'mission'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Our Mission
                            </button>
                            <button
                                onClick={() => setActiveTab('whatwedo')}
                                className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${activeTab === 'whatwedo'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                What We Do
                            </button>
                        </div>

                        <div className="p-8">
                            {activeTab === 'story' && (
                                <div className="animate-fadeIn">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Our Journey</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Partcer was founded with a clear vision: to bridge the gap between classroom learning and real-world job success. As founders, we saw too many talented individuals struggle with interviews, rejections, and self-doubt—not because they lacked potential, but because they lacked the right guidance. Recognizing these challenges, we created a platform that connects job seekers with skilled freelance mentors for personalized, one-on-one training sessions, accessible anytime from the comfort of their homes.
                                    </p>
                                </div>
                            )}

                            {activeTab === 'mission' && (
                                <div className="animate-fadeIn">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        At Partcer, our mission is to empower job seekers by connecting them with expert freelance trainers who provide personalized guidance, practical skills, and unwavering support. We strive to create an environment where learners can thrive—building confidence, mastering technical abilities, and succeeding in their personal and professional careers.
                                    </p>
                                </div>
                            )}

                            {activeTab === 'whatwedo' && (
                                <div className="animate-fadeIn">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">What We Do</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        We simplify career growth. Partcer connects job seekers with vetted freelance trainers who provide 1:1 guidance—from technical mentoring to interview preparation. Our platform handles scheduling, payments, and communication seamlessly, so you can focus entirely on learning and leveling up.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timeline/Milestones */}
                <div className="mt-14">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-12 h-0.5 bg-primary" />
                            <span className="text-primary font-medium uppercase tracking-wider text-sm">Our Journey</span>
                            <div className="w-12 h-0.5 bg-primary" />
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Company Milestones
                        </h2>
                        <p className="text-gray-600">
                            Key moments that shaped our path to becoming a leading English learning platform.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-0 lg:left-1/2 transform lg:-translate-x-1/2 w-0.5 h-full bg-primary/20" />

                        <div className="space-y-8">
                            {milestones.map((milestone, index) => (
                                <div key={index} className={`relative flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-start lg:items-center gap-8`}>
                                    {/* Timeline Dot */}
                                    <div className="absolute left-0 lg:left-1/2 transform lg:-translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white shadow" />

                                    {/* Content */}
                                    <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                                            <span className="text-primary font-bold text-xl">{milestone.year}</span>
                                            <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2">{milestone.event}</h3>
                                            <p className="text-gray-600 text-sm">{milestone.description}</p>
                                        </div>
                                    </div>

                                    {/* Empty space for alternating layout */}
                                    <div className="hidden lg:block lg:w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                {/* <div className="mt-14">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-12 h-0.5 bg-primary" />
                            <span className="text-primary font-medium uppercase tracking-wider text-sm">Our Team</span>
                            <div className="w-12 h-0.5 bg-primary" />
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Meet The Experts
                        </h2>
                        <p className="text-gray-600">
                            Passionate educators dedicated to helping you achieve English fluency.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                                <Facebook size={14} />
                                            </button>
                                            <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                                <Twitter size={14} />
                                            </button>
                                            <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                                <Linkedin size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
                                    <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                                    <p className="text-gray-600 text-sm">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
            </Container>
        </div>
    );
};

export default About;