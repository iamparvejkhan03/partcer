import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, Search, Plus, LogIn, LayoutDashboard, User, Settings, LogOut, Briefcase, FileText, ShoppingBag, Calendar, CreditCard, Star, HelpCircle, BanknoteArrowDown, BanknoteArrowUp, Users, MessageSquare } from 'lucide-react';
import Container from './Container';
import MegaMenu from './MegaMenu';
import { useAuth } from "../contexts/AuthContext";
import { usePopUp } from "../contexts/PopUpContextProvider";
import MegaMenuDesktop from './MegaMenuDesktop';
import MegaMenuMobile from './MegaMenuMobile';
import { dummyUserImg, logo, userTypes } from '../assets';
import { useNotifications } from '../contexts/NotificationContext';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
    const [showMega, setShowMega] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [mobileProfileMenuOpen, setMobileProfileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const { unreadMessages, unreadOrders, markMessagesAsRead, markOrdersAsViewed } = useNotifications();

    const location = useLocation();
    const { pathname } = location;
    const { user, logout } = useAuth();
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
        setProfileDropdownOpen(false);
        setMobileProfileMenuOpen(false);
    }, [location.pathname]);

    /* Close dropdown when clicking outside */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setProfileDropdownOpen(false);
        setMobileProfileMenuOpen(false);
    };

    // Buyer Menu Items
    const buyerMenuItems = [
        // {
        //     label: 'Dashboard',
        //     icon: <LayoutDashboard size={18} />,
        //     path: '/buyer/dashboard',
        //     onClick: () => navigate('/buyer/dashboard')
        // },
        {
            label: 'My Projects',
            icon: <FileText size={18} />,
            path: '/buyer/projects/all',
            onClick: () => navigate('/buyer/projects/all')
        },
        {
            label: 'My Orders',
            icon: <ShoppingBag size={18} />,
            path: '/buyer/orders',
            onClick: () => navigate('/buyer/orders')
        },
        {
            label: 'Post a Project',
            icon: <Plus size={18} />,
            path: '/buyer/projects/create',
            onClick: () => navigate('/buyer/projects/create')
        },
        {
            label: 'Profile Settings',
            icon: <Settings size={18} />,
            path: '/buyer/profile/settings',
            onClick: () => navigate('/buyer/profile/settings')
        },
        {
            label: 'Help & Support',
            icon: <HelpCircle size={18} />,
            path: '/contact',
            onClick: () => navigate('/contact')
        },
        {
            label: 'Logout',
            icon: <LogOut size={18} />,
            onClick: handleLogout,
            isLogout: true
        }
    ];

    // Freelancer Menu Items
    const freelancerMenuItems = [
        // {
        //     label: 'Dashboard',
        //     icon: <LayoutDashboard size={18} />,
        //     path: '/freelancer/dashboard',
        //     onClick: () => navigate('/freelancer/dashboard')
        // },
        // {
        //     label: 'My Services',
        //     icon: <Briefcase size={18} />,
        //     path: '/freelancer/services',
        //     onClick: () => navigate('/freelancer/services')
        // },
        // {
        //     label: 'Post a Service',
        //     icon: <Plus size={18} />,
        //     path: '/freelancer/services/create',
        //     onClick: () => navigate('/freelancer/services/create')
        // },
        {
            label: 'My Orders',
            icon: <ShoppingBag size={18} />,
            path: '/freelancer/orders/all',
            onClick: () => navigate('/freelancer/orders/all')
        },
        {
            label: 'Applied Projects',
            icon: <Briefcase size={18} />,
            path: '/freelancer/projects/applied',
            onClick: () => navigate('/freelancer/projects/applied')
        },
        {
            label: 'Earnings',
            icon: <BanknoteArrowUp size={18} />,
            path: '/freelancer/finance/earnings',
            onClick: () => navigate('/freelancer/finance/earnings')
        },
        {
            label: 'Withdrawals',
            icon: <BanknoteArrowDown size={18} />,
            path: '/freelancer/finance/withdrawals',
            onClick: () => navigate('/freelancer/finance/withdrawals')
        },
        {
            label: 'Profile Settings',
            icon: <Settings size={18} />,
            path: '/freelancer/profile/settings',
            onClick: () => navigate('/freelancer/profile/settings')
        },
        {
            label: 'Help & Support',
            icon: <HelpCircle size={18} />,
            path: '/contact',
            onClick: () => navigate('/contact')
        },
        {
            label: 'Logout',
            icon: <LogOut size={18} />,
            onClick: handleLogout,
            isLogout: true
        }
    ];

    // Freelancer Menu Items
    const adminMenuItems = [
        {
            label: 'Dashboard',
            icon: <LayoutDashboard size={18} />,
            path: '/admin/dashboard',
            onClick: () => navigate('/admin/dashboard')
        },
        {
            label: 'Users',
            icon: <Users size={18} />,
            path: '/admin/users',
            onClick: () => navigate('/admin/users')
        },
        {
            label: 'Orders',
            icon: <ShoppingBag size={18} />,
            path: '/admin/orders',
            onClick: () => navigate('/admin/orders')
        },
        {
            label: 'Projects',
            icon: <Briefcase size={18} />,
            path: '/admin/projects',
            onClick: () => navigate('/admin/projects')
        },
        {
            label: 'Withdrawals',
            icon: <BanknoteArrowDown size={18} />,
            path: '/admin/withdrawals',
            onClick: () => navigate('/admin/withdrawals')
        },
        {
            label: 'Profile Settings',
            icon: <Settings size={18} />,
            path: '/admin/profile',
            onClick: () => navigate('/admin/profile')
        },
        {
            label: 'Resolution Center',
            icon: <HelpCircle size={18} />,
            path: '/admin/resolutions',
            onClick: () => navigate('/admin/resolutions')
        },
        {
            label: 'Logout',
            icon: <LogOut size={18} />,
            onClick: handleLogout,
            isLogout: true
        }
    ];

    const menuItems = user?.userType === 'buyer' ? buyerMenuItems : user?.userType === 'freelancer' ? freelancerMenuItems : adminMenuItems;

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

                        {/* Desktop Nav for Non-Logged-In Users */}
                        {!user && <nav className="hidden lg:flex items-center gap-8">
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

                            <NavLink to="/projects" className="text-white/90 hover:text-white">
                                Search Projects
                            </NavLink>
                        </nav>}

                        {/* Desktop Nav for Logged-In Users */}
                        {user && <nav className="hidden lg:flex items-center gap-8">
                            {user && user?.userType == 'buyer' && (
                                <>
                                    <NavLink to="/" className="text-white/90 hover:text-white">
                                        Home
                                    </NavLink>
                                    <NavLink to="/freelancers" className="text-white/90 hover:text-white">
                                        Search {userTypes?.freelancer}
                                    </NavLink>
                                    <NavLink to="/buyer/projects/all" className="text-white/90 hover:text-white">
                                        My Projects
                                    </NavLink>
                                    {/* <NavLink to="/buyer/orders" className="text-white/90 hover:text-white">
                                        My Orders
                                    </NavLink> */}
                                </>
                            )}
                            {user && user?.userType == 'freelancer' && (
                                <>
                                    <NavLink to="/projects" className="text-white/90 hover:text-white">
                                        Search Projects
                                    </NavLink>
                                    <NavLink to="/freelancer/projects/applied" className="text-white/90 hover:text-white">
                                        Applied Projects
                                    </NavLink>
                                    {/* <NavLink to="/freelancer/services" className="text-white/90 hover:text-white">
                                        My Services
                                    </NavLink> */}
                                    {/* <NavLink to="/freelancer/orders/all" className="text-white/90 hover:text-white">
                                        My Orders
                                    </NavLink> */}
                                </>
                            )}
                            {user && user?.userType == 'admin' && (
                                <>
                                    <NavLink to="/admin/dashboard" className="text-white/90 hover:text-white">
                                        Dashboard
                                    </NavLink>
                                    <NavLink to="/admin/users" className="text-white/90 hover:text-white">
                                        Users
                                    </NavLink>
                                    <NavLink to="/admin/projects" className="text-white/90 hover:text-white">
                                        Projects
                                    </NavLink>
                                    <NavLink to="/admin/orders" className="text-white/90 hover:text-white">
                                        Orders
                                    </NavLink>
                                </>
                            )}
                        </nav>}

                        {/* Desktop Actions for non-logged-in users */}
                        {!user && <div className="hidden lg:flex items-center gap-4">
                            <button onClick={() => openPopup('searchForm')}>
                                <Search size={20} className="text-white cursor-pointer" />
                            </button>
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
                        </div>}

                        {/* Desktop Actions for logged-in users */}
                        {user && <div className="hidden lg:flex items-center gap-4 relative" ref={dropdownRef}>
                            {/* Update the order button */}
                            <button
                                onClick={() => {
                                    markOrdersAsViewed(); // Mark as viewed when navigating
                                    navigate(user?.userType == 'buyer' ? '/buyer/orders' : '/freelancer/orders/all');
                                }}
                                className='text-white relative'
                            >
                                <ShoppingBag />
                                {unreadOrders > 0 && (
                                    <div className="absolute -top-2 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500">
                                        <p className="text-xs text-white font-semibold">
                                            {unreadOrders > 9 ? '9+' : unreadOrders}
                                        </p>
                                    </div>
                                )}
                            </button>

                            {/* Update the message button */ }
                            <button
                                onClick={() => {
                                    markMessagesAsRead(); // Mark as read when navigating
                                    navigate(`/${user?.userType}/chat`);
                                }}
                                className='text-white relative'
                            >
                                <MessageSquare />
                                {unreadMessages > 0 && (
                                    <div className="absolute -top-2 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500">
                                        <p className="text-xs text-white font-semibold">
                                            {unreadMessages > 9 ? '9+' : unreadMessages}
                                        </p>
                                    </div>
                                )}
                            </button>

                            {user && user?.userType == 'buyer' && (
                                <Link to="/buyer/projects/create" className="flex items-center gap-2 text-black cursor-pointer transition bg-white px-3 py-2.5 rounded-md text-sm font-medium hover:bg-white/90">
                                    <Plus size={20} strokeWidth={2.5} className="text-black cursor-pointer" />
                                    <span>Post Project</span>
                                </Link>
                            )}
                            {/* {user && user?.userType == 'freelancer' && (
                                <Link to="/freelancer/services/create" className="flex items-center gap-2 text-white cursor-pointer transition">
                                    <Plus size={20} className="text-white cursor-pointer" />
                                    <span>Post Service</span>
                                </Link>
                            )} */}

                            <button
                                className="flex items-center gap-2 text-white text-sm font-medium bg-primary px-3 py-1.5 rounded-md hover:bg-primary-dark cursor-pointer focus:outline-none"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            >
                                <img
                                    src={user?.profileImage || dummyUserImg}
                                    alt={user?.firstName}
                                    className='h-7 w-7 object-cover rounded-full '
                                />
                                <div className='flex items-center gap-2'>
                                    <span className='text-white'>My Profile</span>
                                    <ChevronDown size={20} strokeWidth={3} className={`transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {profileDropdownOpen && (
                                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        {/* <p className="text-xs text-primary mt-1 capitalize">{user?.userType}</p> */}
                                    </div>
                                    <div className="py-2">
                                        {menuItems.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    item.onClick();
                                                    setProfileDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${item.isLogout
                                                    ? 'text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>}

                        {/* Mobile Actions */}
                        <div className="flex lg:hidden items-center gap-4">
                            {user ? (
                                <button
                                    className="text-white"
                                    onClick={() => setMobileProfileMenuOpen(!mobileProfileMenuOpen)}
                                >
                                    <img
                                        src={user?.profileImage || dummyUserImg}
                                        alt={user?.firstName}
                                        className='h-8 w-8 object-cover rounded-full border-2 border-white/20'
                                    />
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

                    {/* User Info Section for Mobile */}
                    {user && (
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                            <img
                                src={user?.profileImage || dummyUserImg}
                                alt={user?.firstName}
                                className='h-12 w-12 object-cover rounded-full'
                            />
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                                <p className="text-xs text-primary mt-0.5 capitalize">{user?.userType == 'freelancer' ? 'Mentor' : user?.userType == 'admin' ? 'Admin' : 'Student'}</p>
                            </div>
                        </div>
                    )}

                    {!user && (
                        <NavLink to="/" className="block text-base text-gray-800 font-normal border-b pb-3">
                            Home
                        </NavLink>
                    )}

                    {/* Accordion - Only show for non-logged-in users or if needed */}
                    {!user && (
                        <>
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
                        </>
                    )}

                    {/* Mobile Menu Items for Logged-in Users */}
                    {user && (
                        <div className="space-y-2">
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        item.onClick();
                                        setMobileOpen(false);
                                        setMobileProfileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-colors ${item.isLogout
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-gray-800 hover:bg-gray-100'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Mobile Menu Items for Non-Logged-in Users */}
                    {!user && (
                        <>
                            <NavLink to="/freelancers" className="block text-base text-gray-800 font-normal border-b pb-3">
                                Search {userTypes?.freelancer}
                            </NavLink>

                            <NavLink to="/projects" className="block text-base text-gray-800 font-normal border-b pb-3">
                                Search Projects
                            </NavLink>
                        </>
                    )}

                    {/* Post Button for Mobile */}
                    {user && (
                        user.userType === 'freelancer' ? (
                            <Link
                                to="/freelancer/services/create"
                                onClick={() => setMobileOpen(false)}
                                className="block bg-primary hover:bg-primary-dark text-white text-center py-3 rounded-lg"
                            >
                                Post a service
                            </Link>
                        ) : user.userType === 'buyer' ? (
                            <Link
                                to="/buyer/projects/create"
                                onClick={() => setMobileOpen(false)}
                                className="block bg-primary hover:bg-primary-dark text-white text-center py-3 rounded-lg"
                            >
                                Post a project
                            </Link>
                        ) : null
                    )}

                    {!user && (
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

            {/* Mobile Profile Menu Overlay (Separate from main mobile menu) */}
            {mobileProfileMenuOpen && user && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-45 lg:hidden"
                        onClick={() => setMobileProfileMenuOpen(false)}
                    />
                    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-2xl animate-slide-up">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user?.profileImage || dummyUserImg}
                                        alt={user?.firstName}
                                        className='h-12 w-12 object-cover rounded-full'
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMobileProfileMenuOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {menuItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            item.onClick();
                                            setMobileProfileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-colors ${item.isLogout
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-gray-800 hover:bg-gray-100'
                                            }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Header;