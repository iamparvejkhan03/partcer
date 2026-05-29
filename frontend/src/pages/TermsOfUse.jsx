import { Link } from "react-router-dom";
import { Container } from "../components";

const TermsOfUse = () => {
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

                        {/* Section 3 - Intermediary Role with Safe Harbour */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Our Role as Intermediary & Safe Harbour Protection</h2>
                            <p className="text-gray-700 mb-3">Partcer.com acts solely as an <strong>intermediary</strong> under the Information Technology Act, 2000 and the Intermediary Guidelines and Digital Media Ethics Code Rules, 2021. We:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5 mb-3">
                                <li>Provide a neutral platform connecting Mentors and Customers</li>
                                <li>Process payments for completed services</li>
                                <li>Do not create, verify, or endorse any user content or service quality</li>
                                <li>Do not have actual knowledge of infringing or unlawful content unless properly notified</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 text-sm">
                                    <strong>Important:</strong> Partcer is not a party to any service agreement between Mentors and Customers.
                                    We are not liable for the quality, safety, legality, or delivery of any services offered.
                                    Our liability is limited as per Section 79 of the IT Act, 2000, provided we comply with the
                                    Intermediary Guidelines.
                                </p>
                            </div>
                        </div>

                        {/* Section 4 - Prohibited Content (Intermediary Rules) */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Prohibited Content (As per Intermediary Guidelines, 2021)</h2>
                            <p className="text-gray-700 mb-3">Users shall not host, display, upload, modify, publish, transmit, store, update or share any information that:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Belongs to another person and to which the user does not have any right</li>
                                <li>Is defamatory, obscene, pornographic, paedophilic, invasive of another's privacy, hateful, or racially/ethnically objectionable</li>
                                <li>Harasses or advocates harassment of another person</li>
                                <li>Promotes illegal activity or provides instructional information about illegal activities</li>
                                <li>Contains software viruses or any other computer code designed to interrupt, destroy or limit the functionality of any computer resource</li>
                                <li>Threatens the unity, integrity, defence, security or sovereignty of India, friendly relations with foreign states, or public order</li>
                                <li>Impersonates another person or entity</li>
                                <li>Circumvents our payment system or attempts to transact outside the platform</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                We reserve the right to remove any content that violates these prohibitions and to suspend or terminate user accounts without prior notice.
                            </p>
                        </div>

                        {/* Section 5 - Service Booking & Payment */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Service Booking & Payment</h2>
                            <div className="bg-blue-50 p-4 rounded mb-3">
                                <p className="text-blue-700 font-semibold mb-2">BOOKING TERMS</p>
                                <ul className="text-blue-700 space-y-1 list-disc pl-5">
                                    <li>All bookings require upfront payment or deposit</li>
                                    <li>Cancellations must be made at least 24 hours before the session</li>
                                    <li>Late cancellations (less than 24 hours) may incur a 50% cancellation fee payable to the Mentor</li>
                                    <li>No-shows will be charged the full session amount</li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 6 - Payment Terms */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Payment Terms</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Multiple payment methods accepted (credit card, debit card, UPI, net banking, RazorPay, etc.)</li>
                                <li>Mentors receive payment after successful service completion and any applicable customer approval period (up to 7 days)</li>
                                <li>Partcer retains a service fee (currently 10-20% of transaction value, as shown at checkout)</li>
                                <li>Payouts to Mentors are processed weekly via RazorPay or bank transfer</li>
                                <li>Refunds are handled as per our Refund Policy (available on request or in separate document)</li>
                            </ul>
                        </div>

                        {/* Section 7 - Service Delivery & Recording Consent */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Service Delivery & Session Recordings</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>All sessions are conducted via video calls (Zoom, Microsoft Teams, Zoho Meeting, Google Meet, or similar)</li>
                                <li>Chat and file sharing features are provided within the platform</li>
                                <li>Both parties should test connectivity before sessions</li>
                            </ul>
                            <div className="bg-yellow-50 p-4 rounded mt-3">
                                <p className="font-semibold text-gray-800 mb-2">Session Recording Consent (as per DPDPA 2023)</p>
                                <p className="text-gray-700 text-sm mb-2">
                                    We may record sessions only for quality assurance, training, or dispute resolution purposes.
                                    <strong>We will obtain your explicit, separate consent before recording any session.</strong>
                                    You may withdraw consent at any time before or during the session. Recordings are stored
                                    securely for a maximum of 30 days, after which they are permanently deleted unless required
                                    for an active dispute. No recording will be shared with third parties except as required by law.
                                </p>
                                <p className="text-gray-600 text-sm">
                                    If you do not consent to recording, the session will not be recorded, and this will not affect service delivery.
                                </p>
                            </div>
                        </div>

                        {/* Section 8 - Quality & Professional Standards */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Quality & Professional Standards</h2>
                            <div className="bg-green-50 p-4 rounded mb-3">
                                <p className="text-gray-800 font-bold text-center mb-2">PROFESSIONAL CONDUCT EXPECTED</p>
                                <div className="text-center space-y-1">
                                    <p className="text-gray-700">Mentors must deliver services as described in their profile</p>
                                    <p className="text-gray-700">Customers must provide clear requirements and timely feedback</p>
                                    <p className="text-gray-700">Both parties must maintain professional, respectful behaviour at all times</p>
                                    <p className="text-gray-700">Harassment, discrimination, or abusive language will result in immediate account termination</p>
                                </div>
                            </div>
                            <p className="text-gray-700">
                                Mentors are solely responsible for the quality of their services. Partcer provides a rating and review system to help maintain quality standards, but does not guarantee outcomes.
                            </p>
                        </div>

                        {/* Section 9 - Intellectual Property */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Intellectual Property</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Mentors retain ownership of their teaching materials, code, and content shared during sessions</li>
                                <li>Customers own the results of work done specifically for them (e.g., custom code, written solutions)</li>
                                <li>Partcer's platform design, logos, branding, and underlying software are our intellectual property</li>
                                <li>No unauthorized copying, scraping, or distribution of platform content or user profiles</li>
                                <li>Users grant Partcer a limited license to display profile information and session details for platform operation</li>
                            </ul>
                        </div>

                        {/* Section 10 - Dispute Resolution */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Dispute Resolution</h2>
                            <div className="bg-gray-50 p-4 rounded mb-3">
                                <p className="text-gray-700 font-bold mb-2">DISPUTE PROCESS</p>
                                <ol className="text-gray-700 space-y-2 list-decimal pl-5">
                                    <li><strong>Direct Resolution:</strong> Mentors and Customers must first attempt to resolve any dispute directly within 7 days of the issue arising.</li>
                                    <li><strong>Escalation to Partcer:</strong> If direct resolution fails, either party may request assistance from Partcer by emailing <a href="mailto:disputes@partcer.com" className="text-blue-600">disputes@partcer.com</a>. Partcer will facilitate communication but does not act as a mediator or arbitrator.</li>
                                    <li><strong>Escrow/Refund Decision:</strong> For payment disputes, Partcer may, in its sole discretion, release funds or issue refunds based on session evidence, chat logs, and platform data.</li>
                                    <li><strong>Legal Action:</strong> Either party retains the right to pursue legal action in the competent courts of India. Partcer is not a party to any such litigation.</li>
                                </ol>
                                <p className="text-gray-600 text-sm mt-3">
                                    <strong>Limitation:</strong> Partcer's involvement is limited to facilitating communication and making payment decisions. We do not guarantee any outcome.
                                </p>
                            </div>
                        </div>

                        {/* Section 11 - User Conduct */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. User Conduct & Prohibited Activities</h2>
                            <p className="text-gray-700 mb-2">Users must not:</p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Share login credentials or allow others to access their account</li>
                                <li>Circumvent our payment system (e.g., transacting outside the platform to avoid fees)</li>
                                <li>Engage in harassment, discrimination, threats, or abusive language</li>
                                <li>Share inappropriate, offensive, or illegal content (see Section 4)</li>
                                <li>Attempt to reverse-engineer, scrape, or copy platform code or data</li>
                                <li>Violate any applicable Indian laws or regulations</li>
                                <li>Impersonate another person or entity</li>
                                <li>Post fake reviews or manipulate ratings</li>
                            </ul>
                        </div>

                        {/* Section 12 - Limitation of Liability (with exception for fraud/gross negligence) */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Limitation of Liability</h2>
                            <p className="text-gray-700 mb-2">
                                To the maximum extent permitted by the Indian Contract Act, 1872 and the IT Act, 2000, Partcer's liability is limited as follows:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Direct damages:</strong> Limited to the amount paid by the Customer for the specific service in dispute.</li>
                                <li><strong>Indirect damages:</strong> We are not liable for any indirect, incidental, special, consequential, or punitive damages (including lost profits, data loss, or business interruption).</li>
                                <li><strong>Mentor services:</strong> We are not responsible for the performance, quality, or outcomes of any Mentor's services.</li>
                                <li><strong>Technical issues:</strong> We are not liable for technical failures beyond our reasonable control (e.g., internet outages, third-party video platform failures).</li>
                            </ul>
                            <div className="bg-red-50 p-4 rounded mt-3">
                                <p className="text-red-700 text-sm">
                                    <strong>Exception:</strong> Nothing in these Terms excludes or limits our liability for fraud, gross negligence, wilful misconduct, or death/personal injury caused by our negligence.
                                </p>
                            </div>
                        </div>

                        {/* Section 13 - Privacy & Data Protection (aligned with DPDPA) */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Privacy & Data Protection</h2>
                            <p className="text-gray-700 mb-2">
                                We collect, use, and protect your personal data in accordance with our <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> and the Digital Personal Data Protection Act, 2023 (DPDPA). Key points include:
                            </p>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>We collect account information, session details, payment data, and usage analytics</li>
                                <li>Your data is processed based on consent, contract necessity, legal obligation, or legitimate uses as defined under DPDPA</li>
                                <li>You have the right to access, correct, erase, and withdraw consent, as well as nominate a representative</li>
                                <li>Session recordings are stored only with explicit consent and deleted after 30 days</li>
                                <li>Data may be transferred outside India only with appropriate safeguards under DPDPA</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-3">
                                For any privacy-related complaints, contact our Grievance Officer (see Section 15 below).
                            </p>
                        </div>

                        {/* Section 14 - Intermediary Compliance & Grievance Officer */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Intermediary Compliance & Grievance Officer (IT Rules, 2021)</h2>
                            <p className="text-gray-700 mb-3">
                                Partcer.com complies with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
                                We have appointed a Grievance Officer to address complaints and report unlawful content:
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-800 font-semibold">Grievance Officer Details:</p>
                                <p className="text-gray-700 text-sm mt-1"><strong>Name:</strong>Manoj Prabakar</p>
                                <p className="text-gray-700 text-sm"><strong>Email:</strong> <a href="mailto:grievance@partcer.com" className="text-blue-600 hover:underline">grievance@partcer.com</a> (or admin@partcer.com with subject "Grievance")</p>
                                <p className="text-gray-700 text-sm"><strong>Response Time:</strong> Acknowledgment within 24 hours; redressal within 30 days</p>
                            </div>
                            <p className="text-gray-600 text-sm mt-3">
                                To report any content that violates Section 4 (Prohibited Content), please email our Grievance Officer.
                                Upon receiving a valid complaint or court order, we will remove or disable access to the content within 36 hours.
                            </p>
                        </div>

                        {/* Section 15 - Modifications to Terms */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">15. Modifications & Updates</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>We may update these Terms at any time by posting the revised version on our website</li>
                                <li>For material changes (e.g., payment terms, liability limits), we will notify you via email or platform notification at least 14 days in advance</li>
                                <li>Your continued use of the platform after the effective date constitutes acceptance of the updated Terms</li>
                                <li>If you do not agree with the changes, you may terminate your account before the effective date</li>
                            </ul>
                        </div>

                        {/* Section 16 - Governing Law & Jurisdiction */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">16. Governing Law & Jurisdiction</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Governing Law:</strong> These Terms are governed by the laws of India, including the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and the Indian Contract Act, 1872.</li>
                                <li><strong>Jurisdiction:</strong> Any disputes arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts.</li>
                                <li><strong>International Users:</strong> If you access the platform from outside India, you are responsible for compliance with your local laws. Indian law governs regardless of your location.</li>
                            </ul>
                        </div>

                        {/* Section 17 - Contact Information */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-semibold text-gray-900 mb-2">Partcer.com</p>
                                <p className="text-gray-700 text-sm mb-1">
                                    General Inquiries: <a href="mailto:admin@partcer.com" className="text-blue-600 hover:underline break-all">admin@partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Disputes: <a href="mailto:disputes@partcer.com" className="text-blue-600 hover:underline">disputes@partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Grievance Officer: <a href="mailto:grievance@partcer.com" className="text-blue-600 hover:underline">grievance@partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm mb-1">
                                    Website: <a href="https://partcer.com" className="text-blue-600 hover:underline break-all">https://partcer.com</a>
                                </p>
                                <p className="text-gray-700 text-sm">
                                    Support Hours: Monday-Friday, 9 AM - 6 PM IST
                                </p>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                These Terms were last updated on {formattedDate}. By using Partcer, you acknowledge that you have read, understood,
                                and agree to be bound by these Terms. If you do not agree, please discontinue use of the platform immediately.
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