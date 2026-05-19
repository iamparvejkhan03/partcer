import { useState } from 'react';
import { Container, Heading, HeadingDescription, Subheading } from './';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

function FAQSection() {
    const [activeIndex, setActiveIndex] = useState(1);

    const faqs = [
    {
        question: "How do I find the right trainer for my career goals?",
        answer: "Browse mentor profiles, check their expertise areas, and use filters to find trainers who specialize in your specific tech stack or career stage."
    },
    {
        question: "How do training sessions work?",
        answer: "Sessions are conducted 1:1 via video call. You can choose from mock interviews, resume reviews, coding mentorship, or career coaching—all tailored to your needs."
    },
    {
        question: "How do I become a mentor on this platform?",
        answer: "Sign up, complete your profile with your tech expertise and experience, and get verified. You can start offering job training services to students."
    },
    {
        question: "Is my personal information secure?",
        answer: "Absolutely. We use industry-standard encryption and never share your personal details with third parties without your consent."
    },
    {
        question: "How can I attract more students?",
        answer: "Keep your profile updated, respond quickly to inquiries, deliver high-quality services."
    }
];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="mt-16 bg-white">
            <Container>
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Left Column */}
                    <div className="lg:w-1/2 wow fadeInUp">
                        <div className="wr-content-box-wrapper mb-8">
                            <Subheading content={'Talk to support'} />
                            <Heading content={'Frequently Asked Questions'} />
                            <HeadingDescription content={'Find answers to your questions instantly. Need more guidance? Dive into our extensive documentation for all your queries.'} />
                        </div>

                        <div className="wr-button-wrapper">
                            <Link to="/contact" className="wr-btn wr-primary-btn inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
                                <span>Contact Our Team</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column - Accordion */}
                    <div className="lg:w-1/2 wow fadeInUp">
                        <div className="wr-advanced-accordion-wrapper space-y-3">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className={`wr-advanced-accordion-item border border-gray-200 rounded-lg overflow-hidden transition-all ${activeIndex === index ? 'border-primary-light shadow-sm' : ''
                                        }`}
                                >
                                    <button
                                        className="wr-advanced-accordion-header w-full px-6 py-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleAccordion(index)}
                                    >
                                        <h4 className="wr-title text-lg text-left font-medium text-gray-900 pr-4">
                                            {faq.question}
                                        </h4>
                                        <i className={`wr-icon-plus transition-transform duration-300 ${activeIndex === index ? 'rotate-45' : ''
                                            }`}>
                                            <Plus size={16} className='text-gray-600' />
                                        </i>
                                    </button>

                                    <div
                                        className={`wr-advanced-accordion-content px-6 overflow-hidden transition-all duration-300 ${activeIndex === index
                                            ? 'max-h-96 pb-4 opacity-100'
                                            : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="py-2">
                                            <p className="text-gray-600">{faq.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default FAQSection;