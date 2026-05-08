import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, Search, Plus, LogIn, LayoutDashboard } from 'lucide-react';
import Container from './Container';
import MegaMenu from './MegaMenu';
import { useAuth } from "../contexts/AuthContext";
import { usePopUp } from "../contexts/PopUpContextProvider";
import MegaMenuDesktop from './MegaMenuDesktop';
import MegaMenuMobile from './MegaMenuMobile';
import { logo, userTypes } from '../assets';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
    const [showMega, setShowMega] = useState(false);
    const navigate = useNavigate();

    const location = useLocation();
    const { pathname } = location;
    const { user } = useAuth();
    const { openPopup } = usePopUp();

    /* Scroll handling */
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);

        setScrolled(pathname !== '/');
        if (pathname === '/') window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    /* Close menus on route change */
    useEffect(() => {
        setMobileOpen(false);
        setShowMega(false);
    }, [location.pathname]);

    return (
        <>
            {/* Header */}
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300
        ${scrolled
                        ? 'bg-gradient-to-r from-gray-900 to-gray-950 backdrop-blur shadow-lg'
                        : 'bg-transparent'
                    }`}
            >
                <Container className="py-3">
                    <div className="flex h-16 items-center justify-between">

                        {/* Logo */}
                        <Link to="/">
                            <img src={logo} alt="Partcer Logo" className="h-10 md:h-12 z-10" />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-8">
                            <NavLink to="/" className="text-white/90 hover:text-white">
                                Home
                            </NavLink>

                            {/* Mega Menu (Desktop) */}
                            <div
                                className="relative"
                                onMouseEnter={() => setShowMega(true)}
                                onMouseLeave={() => setShowMega(false)}
                            >
                                <button className="flex items-center gap-1 text-white/90 hover:text-white font-medium">
                                    Find By Categories
                                    <ChevronDown size={16} />
                                </button>

                                {showMega && (
                                    <div className="absolute left-1/2 top-full -translate-x-1/3 pt-4">
                                        <MegaMenuDesktop />
                                    </div>
                                )}
                            </div>

                            <NavLink to="/freelancers" className="text-white/90 hover:text-white">
                                Search {userTypes?.freelancer}
                            </NavLink>

                            <NavLink to="/services" className="text-white/90 hover:text-white">
                                Search Services
                            </NavLink>

                            <NavLink to="/projects" className="text-white/90 hover:text-white">
                                Search Projects
                            </NavLink>
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-4">
                            <button onClick={() => openPopup('searchForm')}>
                                <Search size={20} className="text-white cursor-pointer" />
                            </button>

                            {user ? (
                                <button
                                    className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md cursor-pointer hover:bg-primary/90 transition"
                                    onClick={() => navigate(`/${user.userType}/dashboard`)}
                                >
                                    <LayoutDashboard size={20} />
                                    Dashboard
                                </button>
                            ) : (
                                <button
                                    className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md cursor-pointer hover:bg-primary/90 transition"
                                    onClick={() => {
                                        navigate('/login');
                                        setMobileOpen(false);
                                    }}
                                >
                                    <LogIn size={20} />
                                    Log In
                                </button>
                            )}
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex lg:hidden items-center gap-4">
                            {user ? (
                                <button
                                    className="text-white"
                                    onClick={() => navigate(`/${user.userType}/dashboard`)}
                                >
                                    <LayoutDashboard size={22} />
                                </button>
                            ) : (
                                <button
                                    className="text-white text-lg"
                                    onClick={() => {
                                        navigate('/login');
                                        setMobileOpen(false);
                                    }}
                                >
                                    Log In
                                </button>
                            )}

                            <button
                                className="text-white bg-primary p-2.5 rounded-lg"
                                onClick={() => setMobileOpen(prev => !prev)}
                            >
                                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>

                    </div>
                </Container>
            </header>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Menu */}
            <div
                className={`fixed top-20 left-0 right-0 z-50 lg:hidden bg-white
          transition-all duration-300 ease-in-out rounded-b-xl
          ${mobileOpen
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-4 pointer-events-none'
                    }`}
            >
                <div className="max-h-[calc(100vh-64px)] overflow-y-auto px-6 py-6 space-y-6">

                    <NavLink to="/" className="block text-base text-gray-800 font-normal border-b pb-3">
                        Home
                    </NavLink>

                    {/* Accordion */}
                    <button
                        onClick={() => setMobileCategoriesOpen(prev => !prev)}
                        className="w-full flex items-center justify-between text-base text-gray-800 font-normal pb-3 border-b"
                    >
                        Find By Categories
                        <ChevronDown
                            className={`transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <div
                        className={`overflow-hidden transition-all duration-300
    ${mobileCategoriesOpen ? 'max-h-full opacity-100' : 'hidden max-h-0 opacity-0'}
  `}
                    >
                        <div className={`${mobileCategoriesOpen ? 'block pt-4' : 'hidden'}`}>
                            <MegaMenuMobile />
                        </div>
                    </div>


                    <NavLink to="/freelancers" className="block text-base text-gray-800 font-normal border-b pb-3">
                        Search {userTypes?.freelancer}
                    </NavLink>

                    <NavLink to="/services" className="block text-base text-gray-800 font-normal border-b pb-3">
                        Search Services
                    </NavLink>

                    <NavLink to="/projects" className="block text-base text-gray-800 font-normal border-b pb-3">
                        Search Projects
                    </NavLink>

                    {user ? (
                        user.userType === 'freelancer' ? (
                            <Link
                                to="/freelancer/services/create"
                                className="block bg-primary hover:bg-primary-dark text-white text-center py-3 rounded-lg"
                            >
                                Post a service
                            </Link>
                        ) : user.userType === 'buyer' ? (
                            <Link
                                to="/buyer/projects/create"
                                className="block bg-primary hover:bg-primary-dark text-white text-center py-3 rounded-lg"
                            >
                                Post a project
                            </Link>
                        ) : null
                    ) : (
                        <button
                            onClick={() => {
                                navigate('/login');
                                setMobileOpen(false);
                            }}
                            className="block bg-primary hover:bg-primary-dark text-white text-center py-3 rounded-lg w-full"
                        >
                            Log In
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Header;