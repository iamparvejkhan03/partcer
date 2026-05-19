import { Link } from "react-router-dom";
import { Container } from "../components";

const PrivacyPolicy = () => {
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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
                    <p className="text-gray-600 mb-6">Partcer.com | Last Updated: {formattedDate}</p>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-blue-800 font-semibold mb-2">FREELANCE MARKETPLACE PLATFORM</p>
                        <p className="text-blue-700 text-sm">
                            Partcer.com is a platform connecting tech professionals with students for job support, 
                            training, and consulting services. This policy explains how we handle your information.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-8">
                            <p className="text-gray-700 mb-4">
                                <strong>Partcer.com</strong> ("we", "our", "us") is committed to protecting 
                                and respecting your privacy. This Privacy Policy explains how we collect, use, and 
                                safeguard your information when you use our freelance marketplace platform for 
                                tech job support, training, and consulting services.
                            </p>
                            <p className="text-gray-700">
                                By registering for, accessing, or using the Platform, you agree to this Privacy Policy.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                            
                            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Account & Profile Information</h3>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li>Full name, email address, and contact details</li>
                                <li>Profile photo and biographical information</li>
                                <li>Professional credentials, skills, and experience</li>
                                <li>Educational background and certifications</li>
                                <li>Payment information and payout details for mentors</li>
                            </ul>
                            
                            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Service & Transaction Data</h3>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li>Service listings, descriptions, and pricing</li>
                                <li>Booking requests, schedules, and session details</li>
                                <li>Communication records with students/mentors</li>
                                <li>Payment and transaction history</li>
                                <li>Reviews, ratings, and feedback</li>
                                <li>Video session recordings (with consent)</li>
                            </ul>
                            
                            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Technical & Usage Data</h3>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li>IP address, device type, browser information</li>
                                <li>Platform usage patterns and session analytics</li>
                                <li>Cookies and similar tracking technologies</li>
                                <li>Video call quality and connection data</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-3">We process your information for:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Platform operation, account management, and authentication</li>
                                <li>Matching mentors with appropriate students</li>
                                <li>Facilitating video calls, chat, and file sharing</li>
                                <li>Processing payments and payouts</li>
                                <li>Sending service updates, booking confirmations, and reminders</li>
                                <li>Providing customer support and resolving disputes</li>
                                <li>Improving platform features and user experience</li>
                                <li>Preventing fraud, spam, and security breaches</li>
                                <li>Complying with legal obligations</li>
                                <li>Analysing usage patterns to enhance our services</li>
                                <li>Promoting relevant services (opt-out available)</li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Legal Basis for Processing</h2>
                            <p className="text-gray-700 mb-3">Under UK data protection law, we process based on:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Contractual Necessity:</strong> To fulfil service agreements between users</li>
                                <li><strong>Legitimate Interests:</strong> To operate our marketplace effectively</li>
                                <li><strong>Consent:</strong> For marketing communications and session recordings</li>
                                <li><strong>Legal Obligation:</strong> To comply with UK laws and regulations</li>
                            </ul>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Information Sharing</h2>
                            <p className="text-gray-700 mb-3">We may share your information with:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Other Users:</strong> Limited profile info for service matching</li>
                                <li><strong>Payment Processors:</strong> For transaction processing (e.g., Stripe, PayPal)</li>
                                <li><strong>Service Providers:</strong> Cloud hosting, analytics, customer support</li>
                                <li><strong>Video Call Providers:</strong> For video session infrastructure</li>
                                <li><strong>Legal Authorities:</strong> When required by law or to protect rights</li>
                                <li><strong>Business Partners:</strong> In case of mergers or acquisitions</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded mt-3">
                                <p className="text-gray-600 text-sm">
                                    We never sell your personal data. Sharing is limited to what's necessary 
                                    for platform operation or required by law.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Video Session Recordings</h2>
                            <p className="text-gray-700 mb-3">Important information about session recordings:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Sessions may be recorded for quality assurance and dispute resolution</li>
                                <li>Both parties will be notified before recording starts</li>
                                <li>Recordings are stored securely with limited access</li>
                                <li>Users can opt-out of recordings for specific sessions</li>
                                <li>Recordings are typically deleted after 90 days</li>
                                <li>Educational content may be anonymized and used for training</li>
                            </ul>
                        </div>

                        {/* Section 6 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Security</h2>
                            <p className="text-gray-700 mb-3">We implement security measures including:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>End-to-end encryption for sensitive communications</li>
                                <li>SSL/TLS encryption for all data transmission</li>
                                <li>Secure server infrastructure with regular updates</li>
                                <li>Multi-factor authentication options</li>
                                <li>Regular security audits and penetration testing</li>
                                <li>Employee training on data protection</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-600 text-sm">
                                    While we implement robust security measures, no internet transmission is 100% secure. 
                                    We recommend using strong passwords and enabling additional security features.
                                </p>
                            </div>
                        </div>

                        {/* Section 7 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Cookies & Tracking</h2>
                            <p className="text-gray-700 mb-3">
                                We use cookies and similar technologies for:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Essential platform functionality and authentication</li>
                                <li>Remembering preferences and settings</li>
                                <li>Analytics to improve user experience</li>
                                <li>Marketing and advertising (with consent)</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                You can manage cookies through your browser settings. Some features may not work 
                                properly if cookies are disabled.
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Data Protection Rights (UK)</h2>
                            <p className="text-gray-700 mb-3">Under UK GDPR, you have the right to:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Access:</strong> Request copies of your personal data</li>
                                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                                <li><strong>Erasure:</strong> Request deletion under certain conditions</li>
                                <li><strong>Restriction:</strong> Limit processing of your data</li>
                                <li><strong>Objection:</strong> Object to certain types of processing</li>
                                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                To exercise these rights, contact us at admin@partcer.com. We may need to verify 
                                your identity before processing requests.
                            </p>
                        </div>

                        {/* Section 9 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Data Retention</h2>
                            <p className="text-gray-700 mb-3">We retain information for different periods:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Account Data:</strong> While account is active + 2 years after closure</li>
                                <li><strong>Transaction Records:</strong> 7 years for financial compliance</li>
                                <li><strong>Session Recordings:</strong> Typically 90 days (longer if needed for disputes)</li>
                                <li><strong>Communications:</strong> 2 years for customer service reference</li>
                                <li><strong>Analytics Data:</strong> Aggregated and anonymized after 3 years</li>
                                <li><strong>Legal Requirements:</strong> As required by applicable laws</li>
                            </ul>
                        </div>

                        {/* Section 10 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. International Data Transfers</h2>
                            <p className="text-gray-700 mb-3">
                                As a global platform, your data may be processed outside the UK:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Primary processing occurs in UK/EEA data centers</li>
                                <li>Some service providers may process data in other countries</li>
                                <li>We use standard contractual clauses for international transfers</li>
                                <li>We ensure adequate protection as required by UK GDPR</li>
                            </ul>
                        </div>

                        {/* Section 11 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Children's Privacy</h2>
                            <p className="text-gray-700">
                                Our platform is not intended for users under 18 years old. We do not knowingly 
                                collect personal information from children. If we become aware of such collection, 
                                we will take steps to delete the information.
                            </p>
                        </div>

                        {/* Section 12 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Third-Party Services</h2>
                            <p className="text-gray-700 mb-3">
                                Our platform integrates with third-party services:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Payment processors (Stripe, PayPal)</li>
                                <li>Video conferencing infrastructure</li>
                                <li>Analytics and monitoring tools</li>
                                <li>Cloud storage and hosting services</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                These services have their own privacy policies. We encourage you to review them.
                            </p>
                        </div>

                        {/* Section 13 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Policy Updates</h2>
                            <p className="text-gray-700 mb-3">
                                We may update this policy periodically to reflect:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Changes in our services or platform features</li>
                                <li>Legal or regulatory requirements</li>
                                <li>Security or privacy best practices</li>
                                <li>User feedback and industry standards</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                Material changes will be communicated via email or platform notification. 
                                The "Last Updated" date indicates when revisions were made.
                            </p>
                        </div>

                        {/* Section 14 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
                            <p className="text-gray-700 mb-4">
                                For questions about this policy or to exercise your data protection rights:
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">Partcer.com</p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Data Protection Officer: admin@partcer.com
                                </p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Email: <a href="mailto:admin@partcer.com" className="text-blue-600 hover:underline break-all">admin@partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Website: <a href="https://partcer.com" className="text-blue-600 hover:underline break-all">https://partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm">
                                    Response Time: We aim to respond to privacy inquiries within 14 days
                                </p>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                This Privacy Policy is governed by the laws of England and Wales. Any disputes 
                                will be subject to the exclusive jurisdiction of the courts of England and Wales.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-3">
                            <Link 
                                to="/terms-conditions" 
                                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors"
                            >
                                Terms & Conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default PrivacyPolicy;