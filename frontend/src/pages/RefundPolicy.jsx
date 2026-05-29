import { Link } from "react-router-dom";
import { Container } from "../components";

const RefundPolicy = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <section className="pt-28 pb-16 bg-white">
            <Container>
                <div className="max-w-full mx-auto mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Refund & Cancellation Policy</h1>
                    <p className="text-gray-600 mb-6">Partcer.com | Last Updated: {formattedDate}</p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-blue-800 font-semibold mb-2">FREELANCE MARKETPLACE PLATFORM</p>
                        <p className="text-blue-700 text-sm">
                            This Refund Policy applies to all services booked through Partcer.com between Customers (students) and Mentors (tech professionals).
                            It forms part of our Terms & Conditions.
                        </p>
                    </div>
                </div>

                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Introduction */}
                        <div className="mb-4">
                            <p className="text-gray-700">
                                Partcer.com is an intermediary platform. We hold payments received from Customers until a service is delivered and accepted.
                                Funds are then credited to the Mentor's platform account, from which they may request withdrawal.
                                By booking a service, you agree to these refund terms.
                            </p>
                        </div>

                        {/* Section 1: Service Types Covered */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Services Covered by This Policy</h2>
                            <p className="text-gray-700 mb-2">This policy applies to all service offerings on Partcer, including:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li><strong>Skill Training</strong> – Technical upskilling sessions</li>
                                <li><strong>Job Mentoring</strong> – Career guidance, interview prep, resume review</li>
                                <li><strong>Mock Interview Support</strong> – Simulated technical/HR interviews</li>
                            </ul>
                            <p className="text-gray-700 mt-2">Each service may be booked as:</p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li><strong>One-time session</strong> – Single session of any duration</li>
                                <li><strong>Daily / Weekly / Monthly packages</strong> – Multiple sessions over a period</li>
                                <li><strong>Full-day session</strong> – 6–8 hours continuous engagement</li>
                                <li><strong>Standard session</strong> – 2–3 hours</li>
                                <li><strong>Single session</strong> – Variable duration as agreed</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-2">
                                For weekly packages: minimum 5 sessions per week.<br />
                                For monthly packages: includes 21 sessions (or as specified at booking).
                            </p>
                        </div>

                        {/* Section 2: Customer Cancellations */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Customer-Initiated Cancellations (Before Session)</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>More than 24 hours before scheduled start:</strong> Full refund (100% of amount paid) to original payment method.</li>
                                <li><strong>Between 24 hours and 1 hour before start:</strong> 50% refund. The remaining 50% is credited to the Mentor as compensation for reserved time.</li>
                                <li><strong>Less than 1 hour before start or no-show:</strong> No refund. Full amount is credited to the Mentor.</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-2">
                                To cancel, go to <strong>Order Details</strong> → <strong>Resolution Center</strong> → Request Cancellation.
                            </p>
                        </div>

                        {/* Section 3: Mentor Cancellations */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Mentor-Initiated Cancellations</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Customer receives a <strong>full refund</strong> within 5–7 business days.</li>
                                <li>Partcer may offer a discount coupon (e.g., 10% off next booking) as a goodwill gesture.</li>
                                <li>Repeated cancellations by a Mentor may lead to account suspension or removal.</li>
                            </ul>
                        </div>

                        {/* Section 4: Quality-Related Refunds (Dissatisfaction) */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Refunds for Poor Quality / Unresolved Issues</h2>
                            <p className="text-gray-700 mb-2">
                                If a Customer is dissatisfied with a completed session, they may request a refund within <strong>7 days</strong> of the session's end time.
                            </p>
                            <div className="bg-yellow-50 p-4 rounded mt-2">
                                <p className="font-semibold text-gray-800">Valid grounds for refund:</p>
                                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                                    <li>Mentor did not deliver the agreed scope (e.g., wrong topic, incomplete coverage).</li>
                                    <li>Mentor was unprofessional, abusive, or violated platform policies.</li>
                                    <li>Technical issues entirely on Mentor's side prevented session delivery (e.g., Mentor no-show, equipment failure).</li>
                                    <li>Evidence of false claims or misrepresentation in the Mentor's profile.</li>
                                </ul>
                                <p className="font-semibold text-gray-800 mt-3">Not grounds for refund:</p>
                                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                                    <li>Customer changed mind after session.</li>
                                    <li>Customer did not achieve desired learning outcome despite Mentor's genuine effort.</li>
                                    <li>Customer's own technical issues (e.g., poor internet, hardware problems).</li>
                                </ul>
                            </div>
                            <p className="text-gray-700 mt-3">
                                <strong>How to request:</strong> Go to <strong>Order Details</strong> → <strong>Resolution Center</strong> → Select reason → Provide explanation.
                            </p>
                            <p className="text-gray-600 text-sm mt-2">
                                Partcer will review all available information (user inputs, evidence, session logs, feedback from both parties) and make a decision within <strong>7 business days</strong>.
                                The decision is final and binding.
                            </p>
                        </div>

                        {/* Section 5: Multi-Session Packages & Subscriptions */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Refunds for Packages (Daily/Weekly/Monthly)</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Unused packages</strong> (no session attended): Full refund within 14 days of purchase.</li>
                                <li><strong>Partially used packages:</strong> Refund on a pro-rata basis at the single-session rate, minus a 10% administrative fee.</li>
                                <li><strong>Weekly packages (min 5 sessions):</strong> If you cancel after 1–2 sessions, refund for remaining sessions minus admin fee.</li>
                                <li><strong>Monthly packages (21 sessions):</strong> Refund for unused sessions only if requested within 7 days of the first session; after that, no refund for the current month.</li>
                                <li><strong>Subscription (recurring):</strong> You may cancel future billing at any time. Current billing period fees are non-refundable.</li>
                            </ul>
                        </div>

                        {/* Section 6: Non-Refundable Items */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Non-Refundable Items & Situations</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Platform service fees (Partcer's commission) – non-refundable unless the entire transaction is refunded.</li>
                                <li>Partial session already delivered (e.g., customer leaves 30 minutes into a 60-minute session).</li>
                                <li>Late cancellations or no-shows per Section 2.</li>
                                <li>Services explicitly marked "non-refundable" at booking (e.g., deeply discounted trial sessions).</li>
                                <li>Any refund request submitted after 7 days from session completion.</li>
                            </ul>
                        </div>

                        {/* Section 7: Refund Process & Timing */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. How Refunds Are Processed</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li>Approved refunds are processed within <strong>5–7 business days</strong> from the date of approval.</li>
                                <li>Refunds are issued to the <strong>original payment method</strong> (credit card, UPI, net banking, etc.).</li>
                                <li>Depending on your bank, additional 3–10 business days may be needed for the credit to appear.</li>
                                <li>If the original payment method is unavailable, Partcer will issue a credit to your platform wallet or request alternative bank details.</li>
                            </ul>
                            <div className="bg-gray-50 p-4 rounded mt-3">
                                <p className="text-gray-700 text-sm">
                                    <strong>Note on Mentor payouts:</strong> Partcer holds the payment until the Customer accepts delivery.
                                    Only after acceptance do funds become available in the Mentor's account. Mentors may then request withdrawal,
                                    which takes 2–3 business days to process. If a refund is approved after funds have already been paid to the Mentor,
                                    Partcer will recover the amount from the Mentor's future earnings or invoice the Mentor directly.
                                </p>
                            </div>
                        </div>

                        {/* Section 8: Chargebacks */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Chargebacks & Bank Disputes</h2>
                            <p className="text-gray-700">
                                If you file a chargeback with your bank before contacting Partcer's Resolution Center, your account may be suspended until the chargeback is resolved.
                                We encourage you to first use our refund request process. Partcer reserves the right to dispute chargebacks that we determine to be invalid under this policy.
                            </p>
                        </div>

                        {/* Section 9: Force Majeure */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. No Refund for Force Majeure</h2>
                            <p className="text-gray-700">
                                Partcer is not liable for refunds due to events beyond our reasonable control (natural disasters, internet outages, war, government actions, pandemics).
                                However, we will make reasonable efforts to reschedule sessions or provide credits in such cases.
                            </p>
                        </div>

                        {/* Section 10: Escalation to Grievance Officer */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Escalation & Grievance Redressal</h2>
                            <p className="text-gray-700 mb-2">
                                If you disagree with a refund decision from the Resolution Center, you may escalate to our Grievance Officer:
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 text-sm">
                                    <strong>Grievance Officer:</strong>Manoj Prabakar<br />
                                    <strong>Email:</strong> grievance@partcer.com (or admin@partcer.com with subject "Grievance - Refund")<br />
                                    <strong>Response:</strong> Acknowledgment within 24 hours; final resolution within 15 business days.
                                </p>
                            </div>
                        </div>

                        {/* Section 11: Policy Updates */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Updates to This Policy</h2>
                            <p className="text-gray-700">
                                We may update this Refund Policy from time to time. The latest version will be posted here with the "Last Updated" date.
                                Material changes will be notified via email or platform notification at least 7 days in advance.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                This Refund Policy is governed by the laws of India. Any disputes arising under this policy shall be subject to the exclusive jurisdiction of the courts in India.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-3">
                            <Link to="/terms-conditions" className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors">Terms & Conditions</Link>
                            <Link to="/privacy-policy" className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default RefundPolicy;