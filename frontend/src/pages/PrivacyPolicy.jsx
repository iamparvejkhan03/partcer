import { Link } from "react-router-dom";
import { Container } from "../components";

const PrivacyPolicy = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-IN', {
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

                            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Booking & Transaction Data</h3>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li>Booking requests, schedules, and session details</li>
                                <li>Communication records with students/mentors</li>
                                <li>Payment and transaction history</li>
                                <li>Reviews, ratings, and feedback</li>
                            </ul>

                            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Technical & Usage Data</h3>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li>IP address, device type, browser information</li>
                                <li>Platform usage patterns and session analytics</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-3">We process your information for:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Platform operation, account management, and authentication</li>
                                <li>Matching mentors with appropriate students</li>
                                <li>Facilitating chats and file sharing</li>
                                <li>Processing payments and payouts</li>
                                <li>Sending booking updates, booking confirmations, and reminders</li>
                                <li>Providing customer support and resolving disputes</li>
                                <li>Improving platform features and user experience</li>
                                <li>Preventing fraud, spam, and security breaches</li>
                                <li>Complying with legal obligations</li>
                                <li>Analysing usage patterns to enhance our services</li>
                            </ul>
                        </div>

                        {/* Section 3 - Legal Basis under Indian DPDPA */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Legal Basis for Processing (Indian Law)</h2>
                            <p className="text-gray-700 mb-3">Under the Digital Personal Data Protection Act, 2023 (DPDPA) and the Information Technology Act, 2000, we process your personal data based on:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Consent:</strong> Where you have explicitly agreed to processing (e.g., for optional features or marketing).</li>
                                <li><strong>Contractual Necessity:</strong> To fulfil our service agreement with you (e.g., matching mentors with students, processing payments).</li>
                                <li><strong>Legal Obligation:</strong> To comply with Indian laws, such as tax, anti-fraud, or court orders.</li>
                                <li><strong>Legitimate Uses:</strong> As permitted under Section 7 of the DPDPA, including fraud prevention, platform security, and credit scoring.</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded mt-3">
                                <p className="text-gray-600 text-sm">
                                    We do not process sensitive personal data (e.g., biometrics, health, sexual orientation) unless you provide explicit consent and we have additional safeguards in place.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Information Sharing</h2>
                            <p className="text-gray-700 mb-3">We may share your information with:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Other Users:</strong> Limited profile information necessary to facilitate mentorship/consulting.</li>
                                <li><strong>Payment Processors:</strong> For transaction processing (e.g., RazorPay).</li>
                                <li><strong>Service Providers:</strong> Cloud hosting, analytics, customer support tools (all contractually bound to protect your data).</li>
                                <li><strong>Legal Authorities:</strong> When required by Indian law or to protect our rights, users, or public safety.</li>
                                <li><strong>Business Partners:</strong> In case of mergers, acquisitions, or asset sales, with notice to you.</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded mt-3">
                                <p className="text-gray-600 text-sm">
                                    We never sell your personal data. Sharing is limited to what's necessary for platform operation or required by law.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
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

                        {/* Section 6 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies & Tracking</h2>
                            <p className="text-gray-700 mb-3">
                                We use cookies and similar technologies for:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Essential platform functionality and authentication</li>
                                <li>Remembering preferences and settings</li>
                                <li>Analytics to improve user experience</li>
                                <li>Marketing and advertising (with your consent where required)</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                You can manage cookies through your browser settings. Some features may not work
                                properly if cookies are disabled.
                            </p>
                        </div>

                        {/* Section 7 - Your Rights under Indian Law (DPDPA) */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Data Protection Rights (India)</h2>
                            <p className="text-gray-700 mb-3">Under the Digital Personal Data Protection Act, 2023, you have the following rights:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Right to Access:</strong> Request a summary of your personal data we hold and the processing activities.</li>
                                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete personal data.</li>
                                <li><strong>Right to Erasure:</strong> Request deletion of your personal data when it is no longer necessary or you withdraw consent (subject to legal exceptions).</li>
                                <li><strong>Right to Object:</strong> Object to processing based on legitimate uses or direct marketing.</li>
                                <li><strong>Right to Withdraw Consent:</strong> Withdraw any consent you previously gave, without affecting the lawfulness of processing before withdrawal.</li>
                                <li><strong>Right to Nominate:</strong> Nominate another person to exercise your rights in case of death or incapacity.</li>
                                <li><strong>Right to Grieve:</strong> File a complaint with the Data Protection Board of India if you believe your rights are violated.</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                To exercise these rights, contact our Grievance Officer at <strong>admin@partcer.com</strong>.
                                We may need to verify your identity before processing requests. We aim to respond within 30 days.
                            </p>
                        </div>

                        {/* Section 8 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Data Retention</h2>
                            <p className="text-gray-700 mb-3">We retain information for different periods:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Account Data:</strong> While account is active + 2 years after closure, or as required by law.</li>
                                <li><strong>Transaction Records:</strong> 7 years for financial and tax compliance (under Indian tax laws).</li>
                                <li><strong>Communications:</strong> 2 years for customer service reference, after which they are anonymized.</li>
                                <li><strong>Analytics Data:</strong> Aggregated and anonymized after 3 years.</li>
                                <li><strong>Legal Requirements:</strong> As required by Indian laws (e.g., IT Act, Companies Act).</li>
                            </ul>
                        </div>

                        {/* Section 9 - International Data Transfers (India perspective) */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. International Data Transfers</h2>
                            <p className="text-gray-700 mb-3">
                                As a platform serving users globally, your data may be transferred outside India to trusted service providers (e.g., cloud hosting, analytics).
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Primary data storage is in India (using servers located in India).</li>
                                <li>Some third-party services (e.g., payment gateways, support tools) may process data in other countries (e.g., USA, Singapore).</li>
                                <li>We ensure such transfers comply with the DPDPA, using standard contractual clauses or other approved mechanisms.</li>
                                <li>We obtain your consent where required for such transfers.</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                You may request details of the safeguards used for international data transfers by contacting us.
                            </p>
                        </div>

                        {/* Section 10 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Children's Privacy</h2>
                            <p className="text-gray-700">
                                Our platform is not intended for users under 18 years old. We do not knowingly
                                collect personal information from children. If we become aware of such collection,
                                we will take steps to delete the information. Parents or legal guardians may contact us to report any such instance.
                            </p>
                        </div>

                        {/* Section 11 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Third-Party Services</h2>
                            <p className="text-gray-700 mb-3">
                                Our platform integrates with third-party services, each with their own privacy policies:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Payment processors (RazorPay)</li>
                                <li>Analytics and monitoring tools (e.g., Google Analytics)</li>
                                <li>Cloud storage and hosting services (e.g., AWS, DigitalOcean)</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                We encourage you to review their policies. We are not responsible for their data practices.
                            </p>
                        </div>

                        {/* Section 12 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Grievance Officer (as per IT Rules, 2011)</h2>
                            <p className="text-gray-700 mb-3">
                                In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, we have appointed a Grievance Officer to address your concerns:
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 text-sm mb-1"><strong>Name:</strong>Manoj Prabakar</p>
                                <p className="text-gray-700 text-sm mb-1"><strong>Email:</strong> <a href="mailto:admin@partcer.com" className="text-blue-600 hover:underline">admin@partcer.com</a> (please mention “Grievance” in subject line)</p>
                                <p className="text-gray-700 text-sm mb-1"><strong>Response Time:</strong> Within 48 hours of receipt, and redressal within 30 days.</p>
                            </div>
                        </div>

                        {/* Section 13 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                            <p className="text-gray-700 mb-4">
                                For general privacy questions or to exercise your data protection rights:
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">Partcer.com</p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Email: <a href="mailto:admin@partcer.com" className="text-blue-600 hover:underline break-all">admin@partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Website: <a href="https://partcer.com" className="text-blue-600 hover:underline break-all">https://partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm">
                                    We aim to respond to privacy inquiries within 14 days.
                                </p>
                            </div>
                        </div>

                        {/* Footer Note - Governing Law and Jurisdiction */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                This Privacy Policy is governed by the laws of <strong>India</strong>. Any disputes arising under or in connection with this policy shall be subject to the exclusive jurisdiction of the courts of <strong>India</strong>.
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