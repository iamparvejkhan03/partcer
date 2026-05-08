import { Link, useNavigate } from 'react-router-dom';
import Container from './Container';
import { banner } from '../assets';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Search, X, ExternalLink } from "lucide-react";

const Hero = ({closePopup}) => {
    const searchForm = useForm({
        defaultValues: {
            search: '',
            type: 'Service',
        }
    });
    const navigate = useNavigate();
    const [type, setType] = useState(['Mentor', 'Service', 'Project']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const popularSearches = [
        'Developer',
        'Web',
        'iOS',
        'PHP',
        'MERN',
    ];


    const handleSearchForm = (searchData) => {
        try {
            const params = new URLSearchParams();

            if (searchData.search) {
                params.append('search', searchData.search);
            }

            if (searchData.type) {
                if (searchData.type === 'Mentor') {
                    // params.append('type', 'freelancer');
                    navigate(`/freelancers?${params.toString()}`);
                } else if (searchData.type === 'Service') {
                    navigate(`/services?${params.toString()}`);
                } else if (searchData.type === 'Project') {
                    navigate(`/projects?${params.toString()}`);
                }
            }

            // Navigate to auctions page with query parameters
            // navigate(`/auctions?${params.toString()}`);
            closePopup('searchForm');
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <section className="relative min-h-[100vh] md:min-h-[100vh] flex items-center justify-start bg-black overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={banner} // put your image in public folder
                    alt="Talent Marketplace"
                    className="w-full h-full object-cover object-center sm:object-left"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
            </div>

            {/* Content */}
            <Container className="relative z-10 mt-20 sm:mt-0 md:mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">

                    {/* Left Content */}
                    <div className="text-white max-w-full md:max-w-xl">
                        <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-relaxed text-center md:text-left">
                            Learn from{' '}
                            <span className="text-primary">Those Who</span>{' '}
                            {/* Business */}Made It
                        </h1>

                        <p className="mt-6 text-gray-300 text-xl text-center md:text-left">
                            Connect with expert Indian mentors for 1:1 training and career support. Mentors with real experience, here to train and support you.
                        </p>

                        {/* Buttons */}
                        {/* <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <Link
                                to="/search-task"
                                className="inline-flex items-center justify-center px-7 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition w-full sm:w-auto"
                            >
                                Get Started
                            </Link>

                            <Link
                                to="/search-freelancer"
                                className="inline-flex items-center gap-2 px-7 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition w-full sm:w-auto justify-center"
                            >
                                Learn More
                                <ExternalLink size={16} />
                            </Link>
                        </div> */}

                        <form
                            onSubmit={searchForm.handleSubmit(handleSearchForm)}
                            className="w-full mt-10"
                        >
                            <div className="bg-white rounded-2xl sm:rounded-full shadow-md max-w-4xl mx-auto p-3 sm:p-0">

                                <div className="flex flex-col sm:flex-row sm:items-center overflow-hidden">

                                    {/* Search Input */}
                                    <div className="flex-1 px-4 sm:px-5">
                                        <input
                                            type="text"
                                            id="search"
                                            placeholder="Search"
                                            className="w-full py-3 sm:py-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                                            {...searchForm.register('search')}
                                        />
                                    </div>

                                    {/* Divider (desktop only) */}
                                    <div className="hidden sm:block h-8 w-px bg-gray-200" />

                                    {/* Type Select */}
                                    <div className="px-4 sm:px-4 border-t sm:border-t-0 sm:border-none border-gray-200">
                                        <select
                                            id="type"
                                            className="w-full py-3 sm:py-4 text-base text-gray-600 bg-transparent focus:outline-none cursor-pointer"
                                            {...searchForm.register('type')}
                                            disabled={loading}
                                        >
                                            <option value="">Type</option>
                                            {loading ? (
                                                <option disabled>Loading...</option>
                                            ) : error ? (
                                                <option disabled>Error</option>
                                            ) : (
                                                type
                                                    .filter(
                                                        (type) =>
                                                            type?.toLowerCase() !== 'explore' &&
                                                            !type.isExplore
                                                    )
                                                    .map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))
                                            )}
                                        </select>
                                    </div>

                                    {/* Search Button */}
                                    <div className="px-2 sm:px-0">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full sm:w-auto bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-full mt-2 sm:mt-2 sm:m-2 flex items-center justify-center gap-2 hover:bg-primary-dark transition disabled:opacity-50"
                                        >
                                            <Search size={18} />
                                            <span className="text-sm">
                                                {loading ? 'Loading...' : 'Search'}
                                            </span>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </form>


                        <div className="max-w-4xl mx-auto mt-6">
                            <div className="flex flex-wrap items-center gap-3">

                                <span className="text-sm text-white/80 font-medium">
                                    Popular Searches:
                                </span>

                                {popularSearches.map((item, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => searchForm.setValue('search', item)}
                                        className=" px-4 py-1.5 text-sm text-white bg-white/10 border border-white/20 rounded-full backdrop-blur-sm hover:bg-white/20 transition"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* Right Side Spacer (image already covers this area) */}
                    <div className="hidden lg:block" />
                </div>
            </Container>
        </section>
    );
};

export default Hero;