import { Link } from "react-router-dom";
import { Container } from "../components";

const ShippingPolicy = () => {
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
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Shipping Policy</h1>
                    <p className="text-gray-600 mb-6">Partcer.com | Last Updated: {formattedDate}</p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-blue-800 font-semibold mb-2">DIGITAL SERVICES ONLY – NO PHYSICAL SHIPPING</p>
                        <p className="text-blue-700 text-sm">
                            Partcer.com is an online marketplace for tech mentorship, training, and consulting services.
                            We do not sell or ship any physical products.
                        </p>
                    </div>
                </div>

                <div className="max-w-full mx-auto">
                    <div className="space-y-8">
                        {/* Section 1 */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Nature of Our Business</h2>
                            <p className="text-gray-700 mb-2">
                                Partcer.com connects students and professionals with tech mentors for:
                            </p>
                            <ul className="text-gray-700 space-y-1 list-disc pl-5">
                                <li>Skill training sessions</li>
                                <li>Job mentoring and career guidance</li>
                                <li>Mock interview support</li>
                                <li>Technical consulting and job support</li>
                            </ul>
                            <p className="text-gray-700 mt-2">
                                All services are delivered <strong>online</strong> via video calls (Zoom, Microsoft Teams, Google Meet, etc.)
                                and through our platform's chat and file-sharing features. No physical goods, documents, or products are shipped to any address.
                            </p>
                        </div>

                        {/* Section 2 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. No Physical Shipping</h2>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-800 font-semibold">Partcer.com does not ship any physical items.</p>
                                <p className="text-gray-700 mt-2">
                                    Because we provide only digital services, there are no:
                                </p>
                                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-700">
                                    <li>Shipping addresses</li>
                                    <li>Courier or postal deliveries</li>
                                    <li>Physical product packaging</li>
                                    <li>Delivery timeframes or tracking numbers</li>
                                </ul>
                                <p className="text-gray-700 mt-2">
                                    Your booked session is considered "delivered" when the virtual meeting takes place as scheduled,
                                    and when any agreed-upon digital materials (notes, code snippets, recordings) are shared via the platform.
                                </p>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How "Delivery" Works for Services</h2>
                            <ul className="text-gray-700 space-y-2 list-disc pl-5">
                                <li><strong>Sessions:</strong> Delivered live at the scheduled date and time via video call.</li>
                                <li><strong>Digital materials:</strong> Shared through platform chat, email, or file uploads – no physical shipment.</li>
                            </ul>
                            <p className="text-gray-600 text-sm mt-2">
                                For cancellation, refund, or non-delivery issues, please refer to our <Link to="/refund-policy" className="text-blue-600 hover:underline">Refund & Cancellation Policy</Link>.
                            </p>
                        </div>

                        {/* Section 4 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Why This Policy Exists</h2>
                            <p className="text-gray-700">
                                Payment gateway (RazorPay) often requires a "Shipping Policy" for all businesses.
                                This document fulfills that requirement by clarifying that Partcer.com deals exclusively in digital services
                                and does not engage in the shipping of physical goods. No shipping charges apply to any transaction on our platform.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact for Delivery-Related Issues</h2>
                            <p className="text-gray-700 mb-2">
                                If you believe a service was not delivered as described (e.g., mentor did not show up, session was cut short),
                                please contact us immediately:
                            </p>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-700 text-sm">
                                    <strong>Email:</strong> <a href="mailto:admin@partcer.com" className="text-blue-600 hover:underline">admin@partcer.com</a><br />
                                    <strong>Resolution Center:</strong> Available from your Order Details page<br />
                                    <strong>Response Time:</strong> Within 24 hours
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-6 mt-8">
                            <p className="text-gray-500 text-sm">
                                This Shipping Policy is governed by the laws of India. Since no physical shipping occurs,
                                delivery disputes are resolved under our Terms & Conditions and Refund Policy.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 pt-8 border-t">
                        <div className="flex flex-wrap gap-3">
                            <Link to="/terms-conditions" className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium">Terms & Conditions</Link>
                            <Link to="/privacy-policy" className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium">Privacy Policy</Link>
                            <Link to="/refund-policy" className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium">Refund Policy</Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default ShippingPolicy;