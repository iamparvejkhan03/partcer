import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
    Phone,
    Mail,
    Facebook,
    Linkedin,
    Youtube,
    Twitter,
    Dribbble,
    ChevronRight,
    Download,
    MapPin,
    Clock
} from 'lucide-react';
import Container from './Container';
import { logo, otherData } from '../assets';

const Footer = () => {
    const usefulLinks = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "FAQs", path: "/faqs" },
        { name: "All Mentors", path: "/freelancers" },
        // { name: "Search Services", path: "/services" },
        { name: "Find Projects", path: "/projects" },
    ];

    const footerLinks = [
        { text: "Terms & Conditions", path: "/terms-conditions" },
        { text: "Privacy Policy", path: "/privacy-policy" },
    ];

    const socialLinks = [
        { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
        { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
        { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
        { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
        { icon: Dribbble, href: "https://dribbble.com", label: "Dribbble" }
    ];

    return (
        <footer className="bg-gradient-to-r from-gray-900 to-gray-950 text-gray-300 pb-12 lg:pb-16 pt-20 lg:pt-24">
            {/* Main Footer */}
            <div className="pb-12 lg:pb-16">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* Logo & Description */}
                        <div className="space-y-6">
                            <Link to="/">
                                <img src={logo} alt="Partcer Logo" className="h-12 md:h-14 z-10" />
                            </Link>

                            <p className="text-gray-400 max-w-md">
                                Partcer helps you in connecting with experienced mentors who offer personalized coaching, practical feedback, and real-world insights to help you succeed in tech.
                            </p>

                            {/* App Download Buttons */}
                            {/* <div className="space-y-3">
                                <p className="text-gray-400 text-sm">Download our app</p>
                                <div className="flex flex-row flex-wrap gap-3">
                                    <Link
                                        to="#"
                                        className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 py-3 transition-colors w-48"
                                    >
                                        <Download size={18} />
                                        <div className="text-left">
                                            <div className="text-xs text-gray-400">Get it on</div>
                                            <div className="font-semibold text-white">App Store</div>
                                        </div>
                                    </Link>
                                    <Link
                                        to="#"
                                        className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 py-3 transition-colors w-48"
                                    >
                                        <Download size={18} />
                                        <div className="text-left">
                                            <div className="text-xs text-gray-400">Get it on</div>
                                            <div className="font-semibold text-white">Google Play</div>
                                        </div>
                                    </Link>
                                </div>
                            </div> */}
                        </div>

                        {/* Useful links Section */}
                        <div className="lg:pl-10">
                            <h3 className="text-white text-xl font-semibold mb-6">Useful Links</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {usefulLinks.map((link, index) => (
                                    <NavLink
                                        key={index}
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 py-2 text-gray-400 hover:text-primary transition-colors group ${isActive ? 'text-primary' : ''}`
                                        }
                                    >
                                        {/* <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                                        <span>{link.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="lg:pl-10">
                            <h3 className="text-white text-lg font-semibold mb-6">Feel Free To Share Your Question</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gray-900 rounded-lg">
                                        <Phone className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <Link
                                            to={`tel:${otherData?.phone}`}
                                            className="text-white hover:text-primary transition-colors block text-lg font-medium"
                                        >
                                            {otherData?.phone}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                                            <Clock size={14} />
                                            <span>Mon to Sun 9am - 11pm</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gray-900 rounded-lg">
                                        <Mail className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <Link
                                            to={`mailto:${otherData?.email}`}
                                            className="text-white hover:text-primary transition-colors block text-lg font-medium"
                                        >
                                            {otherData?.email}
                                        </Link>
                                        <p className="text-sm text-gray-400 mt-1">24/7 Email Support</p>
                                    </div>
                                </div>

                                {/* <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-900 rounded-lg">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">123 Business Street</p>
                    <p className="text-sm text-gray-400 mt-1">New York, NY 10001</p>
                  </div>
                </div> */}
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Copyright & Bottom Bar */}
            <div className="py-6 bg-gray-50/5 rounded-2xl mx-5 md:mx-16 lg:mx-24 xl:mx-28">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                        {/* Copyright & Links - All in one line */}
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            {/* Links */}
                            <div className="flex items-center flex-wrap justify-center gap-6">
                                {footerLinks.map((link, index) => (
                                    <NavLink
                                        key={index}
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `text-gray-400 hover:text-white transition-colors ${isActive ? 'text-primary' : ''}`
                                        }
                                    >
                                        {link.text}
                                    </NavLink>
                                ))}
                            </div>

                            {/* Copyright Text - On same line after links */}
                            <span className="text-gray-400">
                                Copyright © All rights reserved. {new Date().getFullYear()}
                            </span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-gray-900 hover:bg-primary rounded-lg transition-colors group"
                                    aria-label={social.label}
                                >
                                    <social.icon
                                        size={18}
                                        className="text-gray-400 group-hover:text-white transition-colors"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                </Container>
            </div>
        </footer>
    );
};

export default Footer;