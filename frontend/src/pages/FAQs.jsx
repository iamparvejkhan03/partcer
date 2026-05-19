import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components';
import {
    HelpCircle,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Mail,
    Phone,
    Users,
    BookOpen,
    CreditCard,
    Video,
    Award,
    Clock,
    Headphones,
    UserPlus,
    Briefcase,
    Code,
    FileText,
    Star,
    Calendar,
    Shield,
    DollarSign,
} from 'lucide-react';
import { otherData } from '../assets';

const Faqs = () => {
    const [openFaq, setOpenFaq] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    // FAQ Categories
    const categories = [
        { id: 'all', name: 'All Questions', icon: HelpCircle, count: 32 },
        { id: 'getting-started', name: 'Getting Started', icon: UserPlus, count: 4 },
        { id: 'students', name: 'For Students', icon: Users, count: 6 },
        { id: 'mentors', name: 'For Mentors', icon: Briefcase, count: 6 },
        // { id: 'services', name: 'Services & Delivery', icon: Video, count: 5 },
        { id: 'payments', name: 'Payments & Pricing', icon: DollarSign, count: 4 },
        { id: 'account', name: 'Account & Security', icon: Shield, count: 4 },
        { id: 'support', name: 'Support & Help', icon: Headphones, count: 3 },
    ];

    // FAQ Items organized by category
    const faqItems = [
        // Getting Started
        {
            id: 1,
            category: 'getting-started',
            question: "What is Partcer?",
            answer: "Partcer is a freelance marketplace specifically designed for job training and career support. We connect learners with experienced freelance trainers who offer services like mock interviews, resume reviews, coding mentorship, portfolio building, and career coaching."
        },
        {
            id: 2,
            category: 'getting-started',
            question: "How do I get started as a student?",
            answer: "Simply sign up for free, browse through our pool of freelance trainers, use filters to find experts in your specific needs, review their profiles and place an order for the service you need."
        },
        {
            id: 3,
            category: 'getting-started',
            question: "How do I get started as a mentor?",
            answer: "Sign up, create your mentor profile, showcase your expertise and experience, create gigs for the training services you offer, and start receiving orders."
        },
        {
            id: 4,
            category: 'getting-started',
            question: "Is there any registration fee?",
            answer: "No, registration is completely free for both students and mentors. You only pay when you purchase a service, and mentors only pay a small commission when they complete an order."
        },

        // For students
        {
            id: 5,
            category: 'students',
            question: "How do I find the right mentor for my needs?",
            answer: "Use our search and filter options to find mentors by category, skills, price, delivery time, and ratings. Read reviews from previous students and check their portfolio samples before placing an order."
        },
        {
            id: 6,
            category: 'students',
            question: "Can I communicate with a mentor before ordering?",
            answer: "Yes! You can use our messaging system to ask questions, discuss your requirements, and clarify any doubts before placing an order. This helps ensure the mentor understands your needs."
        },
        // {
        //     id: 7,
        //     category: 'students',
        //     question: "What if I'm not satisfied with the service?",
        //     answer: "Your satisfaction matters. If the delivered work doesn't meet the requirements, you can request revisions. Most mentors offer free revisions as part of their service."
        // },
        {
            id: 8,
            category: 'students',
            question: "How do I know if a mentor is qualified?",
            answer: "Check their profile for experience, education, certifications, and work history. Many mentors also include portfolio samples."
        },
        // {
        //     id: 9,
        //     category: 'students',
        //     question: "Can I request custom requirements not listed in their gig?",
        //     answer: "Absolutely! Message the mentor directly with your specific needs. Many are happy to create custom offers tailored to your requirements."
        // },
        // {
        //     id: 10,
        //     category: 'students',
        //     question: "What types of training services can I find?",
        //     answer: "You can find services including mock interviews, resume writing and review, LinkedIn profile optimization, coding mentorship, portfolio reviews, career coaching, salary negotiation guidance, and more."
        // },

        // For mentors (Freelance Trainers)
        {
            id: 11,
            category: 'mentors',
            question: "How do I become a mentor on your platform?",
            answer: "Sign up, complete your profile with your professional experience and expertise, and create gigs describing the training services you offer. This is how you can start receiving orders."
        },
        {
            id: 12,
            category: 'mentors',
            question: "What services can I offer?",
            answer: "You can offer any job training and support service related to tech- coding mentorship, portfolio building, career coaching, interview preparation, and more."
        },
        {
            id: 13,
            category: 'mentors',
            question: "How much commission does the platform charge?",
            answer: "We charge a competitive service fee on each completed order. This fee helps us maintain the platform and provide support to both students and mentors."
        },
        {
            id: 14,
            category: 'mentors',
            question: "How do I get paid?",
            answer: "Payments are processed securely through our platform. Funds are released to you after order completion. You can withdraw your earnings via bank transfer, or other available methods."
        },
        {
            id: 15,
            category: 'mentors',
            question: "How can I attract more students?",
            answer: "Create detailed descriptions with clear deliverables, use relevant keywords, add portfolio samples, respond quickly to inquiries, and deliver high-quality work on time."
        },
        // {
        //     id: 16,
        //     category: 'mentors',
        //     question: "Can I offer packages for different budgets?",
        //     answer: "Yes! You can create multiple packages (basic, standard, premium) with different price points and deliverables to cater to various student needs and budgets."
        // },

        // Services & Delivery
        // {
        //     id: 17,
        //     category: 'services',
        //     question: "How do I place an order for a service?",
        //     answer: "Browse mentor gigs, select the service you need, choose any applicable extras or packages, complete the payment, and you're all set. The mentor will begin working on your order."
        // },
        // {
        //     id: 18,
        //     category: 'services',
        //     question: "What is the typical delivery time?",
        //     answer: "Delivery times vary by mentor and service type. Each gig displays the estimated delivery time. Some services may be delivered within 24 hours, while others may take a few days."
        // },
        // {
        //     id: 19,
        //     category: 'services',
        //     question: "Can I request revisions?",
        //     answer: "Yes, most mentors include revisions in their service. The number of revisions is usually specified in the gig description. Use the revision request feature if you need changes."
        // },
        // {
        //     id: 20,
        //     category: 'services',
        //     question: "How do I deliver my work as a mentor?",
        //     answer: "Once you've completed the service, upload the deliverables through our platform. The student will be notified and can approve, or request revisions."
        // },
        // {
        //     id: 21,
        //     category: 'services',
        //     question: "What if the mentor doesn't deliver on time?",
        //     answer: "If an order is late, you can cancel it or extend the delivery time in agreement with the mentor. Our support team can assist if there are disputes."
        // },

        // Payments & Pricing
        {
            id: 22,
            category: 'payments',
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, debit cards, UPI, Google Pay, PhonePe, and other popular digital payment methods. All payments are processed securely."
        },
        {
            id: 23,
            category: 'payments',
            question: "Is my payment secure?",
            answer: "Absolutely! Payments are held securely until you confirm that the service is completed satisfactorily. This protects both students and mentors."
        },
        {
            id: 24,
            category: 'payments',
            question: "Do you offer refunds?",
            answer: "If a service isn't delivered as described, you can open a dispute, and we'll help resolve the issue. Refunds are processed based on our dispute resolution policy."
        },
        {
            id: 25,
            category: 'payments',
            question: "Are there any hidden fees?",
            answer: "No hidden fees! The price you see at checkout is what you pay. Mentors see their earnings after our transparent commission is deducted."
        },

        // Account & Security
        {
            id: 26,
            category: 'account',
            question: "How do I update my profile?",
            answer: "Log into your account, go to your dashboard, and click on 'Profile Settings' to update your information, profile picture, and preferences."
        },
        {
            id: 27,
            category: 'account',
            question: "Is my personal information safe?",
            answer: "Yes, we use industry-standard encryption and security measures to protect your personal information and ensure your privacy."
        },
        {
            id: 28,
            category: 'account',
            question: "Can I delete my account?",
            answer: "Yes, you can request account deletion by contacting our support team. Please note that this action is irreversible."
        },
        // {
        //     id: 29,
        //     category: 'account',
        //     question: "How do I verify my identity as a mentor?",
        //     answer: "Go to your mentor settings and follow the verification process. You'll need to provide valid ID proof and possibly a selfie for verification."
        // },

        // Support & Help
        {
            id: 30,
            category: 'support',
            question: "How quickly do you respond to inquiries?",
            answer: "We strive to respond to all inquiries within 24 hours during business days. For urgent matters, use WhatsApp for faster response."
        },
        {
            id: 31,
            category: 'support',
            question: "Do you offer support on weekends?",
            answer: "Yes, our support team is available on Saturdays from 10 AM to 6 PM. Sunday inquiries are answered on Monday."
        },
        {
            id: 32,
            category: 'support',
            question: "How can I contact support?",
            answer: "You can reach us through email, phone, or WhatsApp. Visit our 'Contact Us' page for complete details and response times."
        },
    ];

    // Filter FAQs based on selected category
    const filteredFaqs = activeCategory === 'all'
        ? faqItems
        : faqItems.filter(faq => faq.category === activeCategory);

    // Get category count
    const getCategoryCount = (categoryId) => {
        if (categoryId === 'all') return faqItems.length;
        return faqItems.filter(faq => faq.category === categoryId).length;
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
                            <span className="text-primary font-medium">FAQs</span>
                        </nav>

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                                    Frequently Asked <span className="text-primary">Questions</span>
                                </h1>
                                <p className="text-gray-600 max-w-2xl">
                                    Find answers to commonly asked questions about our job training marketplace,
                                    booking sessions, payments, and more. Can't find what you're
                                    looking for? Feel free to contact our support team.
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <HelpCircle size={32} className="text-primary mx-auto mb-2" />
                                    <span className="text-2xl font-bold text-gray-900">{faqItems.length}+</span>
                                    <p className="text-sm text-gray-600">Questions</p>
                                </div>
                                <div className="h-12 w-px bg-gray-300" />
                                <div className="text-center">
                                    <Headphones size={32} className="text-primary mx-auto mb-2" />
                                    <span className="text-2xl font-bold text-gray-900">24/7</span>
                                    <p className="text-sm text-gray-600">Support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                    {/* Sidebar - Categories */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-24">
                            <h3 className="font-semibold text-gray-900 mb-4 px-2">Categories</h3>
                            <div className="space-y-1">
                                {categories.map((category) => {
                                    const Icon = category.icon;
                                    const count = getCategoryCount(category.id);

                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setActiveCategory(category.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${activeCategory === category.id
                                                ? 'bg-primary text-white'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={18} />
                                                <span>{category.name}</span>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === category.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Quick Contact */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3 px-2">Quick Help</h4>
                                <div className="space-y-2 px-2">
                                    <Link to={`mailto:${otherData?.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                                        <Mail size={16} />
                                        <span>Email Support</span>
                                    </Link>
                                    <Link to={`tel:${otherData?.phone}`} target="_blank" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                                        <Phone size={16} />
                                        <span>Phone</span>
                                    </Link>
                                    <Link to="/contact" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
                                        <MessageCircle size={16} />
                                        <span>Contact Page</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - FAQs */}
                    <div className="lg:col-span-9">
                        {/* Category Title */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {categories.find(c => c.id === activeCategory)?.name}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {filteredFaqs.length} questions found
                            </p>
                        </div>

                        {/* FAQs List */}
                        <div className="space-y-3">
                            {filteredFaqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-900 flex-1">
                                            {faq.question}
                                        </span>
                                        <span className="text-primary flex-shrink-0">
                                            {openFaq === faq.id ? (
                                                <ChevronUp size={20} />
                                            ) : (
                                                <ChevronDown size={20} />
                                            )}
                                        </span>
                                    </button>

                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${openFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="px-6 pb-4 text-gray-600 border-t border-gray-200 pt-4">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* No Results */}
                            {filteredFaqs.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <HelpCircle size={48} className="text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">No questions found in this category.</p>
                                </div>
                            )}
                        </div>

                        {/* Still Have Questions Section */}
                        <div className="mt-10 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-8 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Still have a question?
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                We're here to help! Whether you're a learner or a freelance trainer, our team is ready to assist you.
                            </p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300"
                            >
                                <MessageCircle size={18} />
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Faqs;