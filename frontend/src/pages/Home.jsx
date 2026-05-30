import { BuyerProjectCard, CallToAction, Container, FreelancerProfileCard, Heading, HeadingDescription, Hero, LoadingSpinner, ServiceCard, Subheading } from "../components";
import Marquee from "react-fast-marquee";
import { volkswagen, ford, bmw, hyundai, kia, mercedes, skoda, volvo, audi, renault, tesla, lamborghini } from "../assets";
import { lazy, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Check, ChevronRight, CloudLightningIcon, Code, Focus, ThumbsUp } from "lucide-react";
import { usePopUp } from "../contexts/PopUpContextProvider";
import { Suspense } from "react";

const trustedBrands = [
    {
        src: bmw,
        alt: 'BMW'
    },
    {
        src: hyundai,
        alt: 'Hyundai'
    },
    {
        src: volvo,
        alt: 'Volvo'
    },
    {
        src: audi,
        alt: 'Audi'
    },
    {
        src: volkswagen,
        alt: 'Volkswagen'
    },
    {
        src: ford,
        alt: 'Ford'
    },
    {
        src: kia,
        alt: 'Kia'
    },
    {
        src: mercedes,
        alt: 'Mercedes'
    },
    {
        src: skoda,
        alt: 'Skoda'
    },
    {
        src: renault,
        alt: 'Renault'
    },
    {
        src: tesla,
        alt: 'Tesla'
    },
    {
        src: lamborghini,
        alt: 'Lamborghini'
    },
];

const featuresData = [
    {
        icon: <BadgeCheck className="text-white size-8" />,
        title: "Real-World Expertise",
        description: "Learn from pros currently working in top tech companies.",
    },
    {
        icon: <Focus className="text-white size-8" />,
        title: "Focused 1:1 Attention",
        description: "Personalized guidance that group classes can't provide.",
    },
    {
        icon: <Code className="text-white size-8" />,
        title: "Practical Skill Building",
        description: "Hands-on experience with real projects and mocks.",
    },
];

const CategoryCarousel = lazy(() => import("../components/CategoryCarousel"));
const FAQSection = lazy(() => import("../components/FAQSection"));
// const FeaturedServices = lazy(() => import("../components/FeaturedServices"));
const FeaturedFreelancers = lazy(() => import("../components/FeaturedFreelancers"));

function Home() {
    const [loading, setLoading] = useState(false);
    const { closePopup } = usePopUp();

    return (
        <>
            <Hero closePopup={closePopup} />

            {/* Brands Marquee Section */}
            <Container>
                <Marquee speed={50} gradient={false}>
                    <div className="flex gap-8 w-full my-14 mr-8">
                        {
                            trustedBrands.map(brand => (
                                <div key={brand.alt} className="flex items-center justify-center border rounded-lg shadow hover:shadow-lg transition-all border-slate-200 p-4 md:p-5">
                                    <img src={brand.src} alt={brand.alt} className="h-7 sm:h-7 md:h-8 lg:h-9 xl:h-10" />
                                </div>
                            ))
                        }
                    </div>
                </Marquee>
            </Container>

            {/* Categories Carousel Section */}
            <Container>
                <Subheading content={'Tech-Focused Categories'} />
                <Heading content={'Unlock Your Career Potential'} />
                <HeadingDescription content={'Explore expert-led training and support services. From coding mentorship to interview prep, find the right mentors to guide you.'} />

                <CategoryCarousel />
            </Container>

            {/* Services Section */}
            {/* <Suspense fallback={<LoadingSpinner height={`725px`} />}>
                <FeaturedServices />
            </Suspense> */}

            {/* Freelancers Section */}
            <Suspense fallback={<LoadingSpinner height={`725px`} />}>
                <FeaturedFreelancers />
            </Suspense> 

            {/* Features Section */}
            <Container className="mt-8 mb-8">
                <div className="w-full flex flex-col items-center justify-center text-center">
                    <Subheading content={'More Than Just a Marketplace'} />
                    <Heading content={'Why Mentors & Students Trust Us'} className="text-black" />
                    <HeadingDescription content={"India's most supportive marketplace for job training. Here's what makes us different."} className="text-" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-center gap-6 md:gap-4 mt-10">
                    {featuresData.map((feature, index) => {
                        const [ref, setRef] = useState(null);
                        const [visible, setVisible] = useState(false);

                        useEffect(() => {
                            const observer = new IntersectionObserver(
                                ([entry]) => setVisible(entry.isIntersecting),
                                { threshold: 0.3 }
                            );

                            if (ref) observer.observe(ref);
                            return () => observer.disconnect();
                        }, [ref]);

                        return (
                            <div
                                key={index}
                                ref={setRef}
                                className={`transition-all duration-700 ${visible
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-12"
                                    } ${index === 1 ? 'p-px rounded-[13px] bg-gradient-to-br from-primary to-primary-dark' : ''}`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                            >
                                <div className={`p-6 rounded-xl space-y-4 border bg-gradient-to-r from-gray-800 to-gray-950 backdrop-blur shadow-lg w-full h-full transition-transform duration-300 hover:scale-105 hover:-translate-y-1`}>
                                    <div className="relative inline-flex items-center justify-center mb-2">
                                        <div className="absolute w-16 h-16 bg-primary/20 rounded-2xl blur-xl opacity-60"></div>
                                        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-base font-medium text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-400 line-clamp-2 pb-4">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Container>

            {/* FAQs Section */}
            <FAQSection />

            {/* CTA Section */}
            <CallToAction />
        </>
    )
}

export default Home;