import { Link } from "react-router-dom";
import { Container } from "../components";

const TermsOfUse = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>
                {/* Header */}
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms & Conditions</h1>
                    <p className="text-gray-600 mb-6">Partcer.com | Last Updated: {formattedDate}</p>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-blue-800 font-semibold mb-2">FREELANCE MARKETPLACE PLATFORM</p>
                        <p className="text-blue-700 text-sm">
                            Partcer.com is a platform connecting tech professionals with clients for job support, 
                            training, and consulting services via video calls. By using Partcer, you agree to these 
                            Terms of Use and our community guidelines.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>Partcer.com</strong> ("we", "our", "us") operates an online marketplace 
                                connecting tech professionals ("Mentors") with clients ("Customers") for 
                                job support, training, and consulting services delivered via video calls. 
                                These Terms of Use ("Terms") govern your access to and use of our website, 
                                platform, and services.
                            </p>
                            <p className="text-gray-700">
                                By registering for, accessing, or using the Platform, you agree to be bound by these Terms.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Platform Overview</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Partcer.com is a freelance marketplace for tech services</li>
                                <li>Services include job support, technical training, code review, and consulting</li>
                                <li>All services are delivered remotely via video calls</li>
                                <li>Both individual professionals and teams can offer services</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Account Registration</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Registration is free for both Mentors and Customers</li>
                                <li>Mentors must verify their skills and experience</li>
                                <li>Users must be at least 18 years old</li>
                                <li>One account per person - no shared accounts allowed</li>
                                <li>We may suspend or terminate accounts for violations</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Our Role as Intermediary</h2>
                            <p className="text-gray-700 mb-3">Partcer.com acts as:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>A platform connecting Mentors and Customers</li>
                                <li>A payment processor for completed services</li>
                                <li>A dispute resolution mediator when needed</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 font-semibold">
                                    Partcer is not a party to the service agreements between Mentors and Customers.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Service Booking & Payment</h2>
                            <div className="bg-blue-50 p-4 rounded mb-3">
                                <p className="text-blue-700 font-semibold mb-2">BOOKING TERMS</p>
                                <ul className="text-blue-700 space-y-1">
                                    <li>• All bookings require upfront payment or deposit</li>
                                    <li>• Cancellations must be made at least 24 hours before the session</li>
                                    <li>• Late cancellations may incur fees</li>
                                    <li>• Rescheduling is free if done 12+ hours in advance</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Payment Terms</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Multiple payment methods accepted (credit card, PayPal, etc.)</li>
                                <li>Mentors receive payment after successful service completion</li>
                                <li>Partcer retains a service fee (typically 10-20% of transaction)</li>
                                <li>Payouts to Mentors are processed weekly</li>
                                <li>Refunds are handled according to our Refund Policy</li>
                            </ul>
                        </div>

                        {/* Section 6 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Service Delivery</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>All sessions are conducted via video calls on our platform</li>
                                <li>Session recordings may be saved for quality assurance</li>
                                <li>Screen sharing capabilities are available</li>
                                <li>Chat and file sharing features are provided</li>
                                <li>Both parties should test connectivity before sessions</li>
                            </ul>
                        </div>

                        {/* Section 7 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Quality & Professional Standards</h2>
                            <div className="bg-yellow-50 p-4 rounded mb-3">
                                <p className="text-gray-800 font-bold text-center mb-2">PROFESSIONAL CONDUCT EXPECTED</p>
                                <div className="text-center space-y-1">
                                    <p className="text-gray-700">Mentors must deliver services as described</p>
                                    <p className="text-gray-700">Customers must provide clear requirements</p>
                                    <p className="text-gray-700">Both parties must maintain professional behavior</p>
                                </div>
                            </div>
                            <p className="text-gray-700">
                                Mentors are responsible for the quality of their services. 
                                Partcer provides a rating system to help maintain quality standards.
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Mentors retain ownership of their materials and content</li>
                                <li>Customers own the results of work done for them</li>
                                <li>Partcer's platform, design, and branding are our intellectual property</li>
                                <li>No unauthorized copying or distribution of platform content</li>
                            </ul>
                        </div>

                        {/* Section 9 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Dispute Resolution</h2>
                            <div className="bg-gray-50 p-4 rounded mb-3">
                                <p className="text-gray-700 font-bold text-center mb-2">DISPUTE PROCESS</p>
                                <p className="text-gray-700 text-sm text-center">
                                    Disputes should first be resolved directly between parties. 
                                    If unresolved, Partcer will mediate according to our Dispute Resolution Policy.
                                </p>
                            </div>
                        </div>

                        {/* Section 10 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. User Conduct & Prohibited Activities</h2>
                            <p className="text-gray-700 mb-2">Users must not:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Share login credentials or accounts</li>
                                <li>Circumvent our payment system</li>
                                <li>Engage in harassment or discrimination</li>
                                <li>Share inappropriate or offensive content</li>
                                <li>Attempt to reverse-engineer our platform</li>
                                <li>Violate any applicable laws or regulations</li>
                            </ul>
                        </div>

                        {/* Section 11 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Limitation of Liability</h2>
                            <p className="text-gray-700 mb-2">
                                To the maximum extent permitted by law, Partcer's liability is limited to:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Direct damages up to the amount paid for the service in question</li>
                                <li>We are not liable for indirect, incidental, or consequential damages</li>
                                <li>We are not responsible for Mentor performance issues</li>
                                <li>We are not liable for technical issues beyond our reasonable control</li>
                            </ul>
                        </div>

                        {/* Section 12 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Privacy & Data Protection</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>We collect and process data according to our Privacy Policy</li>
                                <li>Users consent to data collection for platform operation</li>
                                <li>Session recordings may be stored for quality and dispute resolution</li>
                                <li>We implement reasonable security measures</li>
                            </ul>
                        </div>

                        {/* Section 13 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Modifications & Updates</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>We may update these Terms at any time</li>
                                <li>Users will be notified of significant changes</li>
                                <li>Continued use constitutes acceptance of updated Terms</li>
                                <li>Major changes may allow users to terminate their accounts</li>
                            </ul>
                        </div>

                        {/* Section 14 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Governing Law & Jurisdiction</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>These Terms are governed by English law</li>
                                <li>Any disputes will be resolved in English courts</li>
                                <li>International users are responsible for compliance with local laws</li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">Partcer.com</p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Email: <a href="mailto:admin@partcer.com" className="text-blue-600 hover:underline break-all">admin@partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Website: <a href="https://partcer.com" className="text-blue-600 hover:underline break-all">https://partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm">
                                    Support Hours: Monday-Friday, 9 AM - 6 PM GMT
                                </p>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                These Terms were last updated on {formattedDate}. We may update these Terms at any time. 
                                Continued use constitutes acceptance of modified Terms.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-3">
                            <Link 
                                to="/privacy-policy" 
                                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default TermsOfUse;