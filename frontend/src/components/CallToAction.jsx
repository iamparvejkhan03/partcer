import React from 'react';
import { Link } from 'react-router-dom';
import Subheading from './Subheading';
import Heading from './Heading';
import { ChevronRight } from 'lucide-react';
import Container from './Container';
import { useAuth } from '../contexts/AuthContext';

const CallToAction = () => {
    const { user } = useAuth();
    return (
        <Container className="py-12 bg-gradient-to-r from-gray-950 to-gray-900 text-white rounded-3xl shadow-lg overflow-hidden mx-5 md:mx-16 lg:mx-24 xl:mx-28 translate-y-14">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

                    {/* Left Content */}
                    <div className="lg:w-1/2">
                        <div className="space-y-4">
                            <Subheading content={'Ready to Get Started?'} />

                            <Heading content={`Find the Expert for Your Needs`} />

                            <div className="wr-description text-gray-300 text-lg max-w-2xl">
                                <p>
                                    Login now to search mentors and begin your journey.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:w-1/2">
                        <div className="flex flex-col items-start lg:items-end space-y-4">
                            <div className=''>
                                <Link
                                    to={`${user?.userType === 'buyer' ? '/services' : user?.userType === 'freelancer' ? '/projects' : '/login'}`}
                                    className="wr-btn wr-primary-btn group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105"
                                >
                                    <span className="text-lg">Get Started Now</span>
                                    <ChevronRight />
                                </Link>
                            </div>

                            <div className="wr-button-description text-gray-400 text-sm lg:text-right">
                                <p>Post your project, compare proposals, and hire with confidence.</p>
                            </div>
                        </div>
                    </div>
                </div>
        </Container>
    );
};

export default CallToAction;