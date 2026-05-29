import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Container, Subheading, Heading, HeadingDescription } from '../components';
import ServiceCard from '../components/ServiceCard';
import axiosInstance from '../utils/axiosInstanceOld';

const FeaturedServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                // Fetch 8 services, sorted by rating and views
                const response = await axiosInstance.get('/api/v1/services?limit=8&sortBy=rating&sortOrder=desc');

                if (response.data?.success) {
                    setServices(response.data.data.services || []);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                // Optionally show a toast or fallback UI
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    if (loading) {
        return (
            <Container className="pt-8">
                <Subheading content="Tech-Focused Services" />
                <Heading content="Get Hired with Expert Help" />
                <HeadingDescription content="Find freelance experts who provide hands-on training and personalized support. Discover services designed to help you grow and succeed." />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </Container>
        );
    }

    return (
        <Container className="pt-8">
            <Subheading content="Tech-Focused Services" />
            <Heading content="Get Hired with Expert Help" />
            <HeadingDescription content="Find freelance experts who provide hands-on training and personalized support. Discover services designed to help you grow and succeed." />

            {services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
                    {services.map((service) => (
                        <ServiceCard key={service._id} service={service} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">No services available at the moment.</p>
                </div>
            )}

            <div className="flex justify-center mt-2">
                <Link
                    to="/services"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark hover:shadow-lg transition-all duration-300 group"
                >
                    <span>Explore More</span>
                    <ChevronRight
                        size={20}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </Link>
            </div>
        </Container>
    );
};

export default FeaturedServices;