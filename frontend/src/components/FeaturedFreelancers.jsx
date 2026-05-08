import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Container, Subheading, Heading, HeadingDescription } from '../components';
import FreelancerProfileCard from '../components/FreelancerProfileCard';
import axiosInstance from '../utils/axiosInstance';

const FeaturedFreelancers = () => {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFreelancers = async () => {
            try {
                setLoading(true);
                // Fetch 8 freelancers, sorted by rating and most hired
                const response = await axiosInstance.get('/api/v1/users/freelancers/search?limit=8&sortBy=rating&sortOrder=desc');

                if (response.data?.success) {
                    setFreelancers(response.data.data.freelancers || []);
                }
            } catch (error) {
                console.error('Error fetching freelancers:', error);
                // Optionally show a toast or fallback UI
            } finally {
                setLoading(false);
            }
        };

        fetchFreelancers();
    }, []);

    if (loading) {
        return (
            <Container className="pt-8">
                <Subheading content="Skill-Based Approach" />
                <Heading content="Learn from Industry Experts" />
                <HeadingDescription content="Browse our pool of talented mentors offering job training across tech roles. Find the perfect expert for your specific career goals." />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded-lg mt-4"></div>
                        </div>
                    ))}
                </div>
            </Container>
        );
    }

    return (
        <Container className="pt-8">
            <Subheading content="Skill-Based Approach" />
            <Heading content="Learn from Industry Experts" />
            <HeadingDescription content="Browse our pool of talented mentors offering job training across tech roles. Find the perfect expert for your specific career goals." />

            {freelancers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
                    {freelancers.map((freelancer) => (
                        <FreelancerProfileCard key={freelancer._id} freelancer={freelancer} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">No mentors available at the moment.</p>
                </div>
            )}

            <div className="flex justify-center mt-2">
                <Link
                    to="/freelancers"
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

export default FeaturedFreelancers;