import { useState, useEffect, useRef } from 'react';
import { useKeenSlider } from 'keen-slider/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../utils/axiosInstanceOld';
import 'keen-slider/keen-slider.min.css';

const CategoryCarousel = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [sliderRef, instanceRef] = useKeenSlider({
        initial: 0,
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
        created() {
            setLoaded(true);
        },
        slides: {
            perView: 1,
            spacing: 15,
        },
        breakpoints: {
            '(min-width: 640px)': {
                slides: {
                    perView: 2,
                    spacing: 15,
                },
            },
            '(min-width: 768px)': {
                slides: {
                    perView: 3,
                    spacing: 15,
                },
            },
            '(min-width: 1024px)': {
                slides: {
                    perView: 4,
                    spacing: 15,
                },
            },
        },
        loop: true,
        drag: true,
        mode: 'snap',
        rubberband: false,
    });

    // Fetch categories from database
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                // Fetch parent categories with images
                const response = await axiosInstance.get('/api/v1/categories/public/parents');

                if (response.data.success) {
                    // Map the response to match your component's expected format
                    const formattedCategories = response.data.data.map((cat, index) => ({
                        id: cat._id || index,
                        name: cat.name,
                        count: cat.freelancerCount || 0,
                        image: cat.image?.url || 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800&auto=format&fit=crop', // fallback image
                        slug: cat.slug
                    }));

                    setCategories(formattedCategories);
                } else {
                    // Fallback to empty array if no data
                    setCategories([]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Autoplay effect
    useEffect(() => {
        if (!instanceRef.current || categories.length === 0) return;

        const interval = setInterval(() => {
            instanceRef.current?.next();
        }, 4000);

        return () => clearInterval(interval);
    }, [instanceRef, categories.length]);

    if (loading) {
        return (
            <div className="relative py-8">
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="relative py-8">
                <div className="text-center text-gray-500 h-96 flex items-center justify-center">
                    No categories found
                </div>
            </div>
        );
    }

    return (
        <div className="relative py-8">
            {/* Navigation buttons */}
            {loaded && instanceRef.current && categories.length > 4 && (
                <div className="absolute top-1/2 left-0 right-0 -translate-y-full z-10 flex justify-between pointer-events-none">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            instanceRef.current?.prev();
                        }}
                        className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg ml-4 pointer-events-auto transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous categories"
                        disabled={currentSlide === 0}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            instanceRef.current?.next();
                        }}
                        className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg mr-4 pointer-events-auto transition-transform hover:scale-105"
                        aria-label="Next categories"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}

            {/* Keen Slider */}
            <div ref={sliderRef} className="keen-slider">
                {categories.map((category) => (
                    <div key={category.id} className="keen-slider__slide px-2">
                        <div className="relative h-96 rounded-xl overflow-hidden group cursor-pointer">
                            {/* Background image with overlay */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 rounded-xl"
                                style={{ backgroundImage: `url(${category.image})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent rounded-xl" />
                            </div>

                            {/* Category content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 rounded-xl">
                                <span className="text-white/90 text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit mb-2">
                                    {category.count} mentor{category.count !== 1 ? 's' : ''}
                                </span>
                                <h3 className="text-white text-xl font-semibold mb-2">
                                    <Link
                                        to={`/freelancers?category=${encodeURIComponent(category.name)}`}
                                        className="hover:text-primary-light transition-colors"
                                    >
                                        {category.name}
                                    </Link>
                                </h3>

                                {/* Explore button */}
                                <Link
                                    to={`/freelancers?category=${encodeURIComponent(category.name)}`}
                                    className="text-white/90 hover:text-white text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    Explore mentors
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom pagination dots - only show if we have slides */}
            {loaded && instanceRef.current && categories.length > 4 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({
                        length: instanceRef.current.track.details.slides.length
                    }).map((_, idx) => (
                        <button
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === idx
                                    ? 'bg-primary w-6'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            onClick={() => {
                                instanceRef.current?.moveToIdx(idx);
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryCarousel;