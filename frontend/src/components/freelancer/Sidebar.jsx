import {
    LayoutDashboard,
    LogOut,
    Gavel,
    Award,
    TrendingUp,
    User,
    X,
    Menu,
    Bell,
    Plus,
    CreditCard,
    ChevronDown,
    Settings,
    Briefcase,
    FileText,
    Shield,
    Folder,
    FileCheck,
    DollarSign,
    Users,
    MessageSquare,
    HelpCircle,
    BanknoteArrowDown,
    BriefcaseBusiness,
    FolderOpen,
    Search,
    Headphones,
    FolderCheck
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { logo } from "../../assets";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

// Define all navigation items with support for dropdowns
const navigationItems = [
    // {
    //     type: 'link',
    //     name: 'Dashboard',
    //     path: '/freelancer/dashboard',
    //     icon: <LayoutDashboard size={20} />
    // },
    {
        type: 'link',
        name: 'Message',
        path: '/freelancer/chat',
        icon: <MessageSquare size={20} />
    },
    // {
    //     type: 'dropdown',
    //     name: 'Services',
    //     icon: <Briefcase size={20} />,
    //     isOpen: false,
    //     subItems: [
    //         { name: 'All Services', path: '/freelancer/services/all', icon: <BriefcaseBusiness size={18} /> },
    //         { name: 'Create Service', path: '/freelancer/services/create', icon: <Plus size={18} /> },
    //         // { name: 'Active Services', path: '/freelancer/services/active', icon: <Folder size={18} /> },
    //         // { name: 'Sold Services', path: '/freelancer/services/sold', icon: <Award size={18} /> },
    //         // { name: 'Draft Services', path: '/freelancer/services/draft', icon: <FileCheck size={18} /> },
    //     ]
    // },
    {
        type: 'dropdown',
        name: 'Projects',
        icon: <FolderOpen size={20} />,
        isOpen: false,
        subItems: [
            { name: 'Browse Projects', path: '/projects', icon: <Search size={18} /> },
            { name: 'Applied Project', path: '/freelancer/projects/applied', icon: <FolderCheck size={18} /> },
        ]
    },
    {
        type: 'link',
        name: 'Orders',
        path: '/freelancer/orders/all',
        icon: <TrendingUp size={20} />
    },
    {
        type: 'dropdown',
        name: 'Finance',
        icon: <CreditCard size={20} />,
        isOpen: false,
        subItems: [
            // { name: 'Billing', path: '/freelancer/finance/billing', icon: <CreditCard size={18} /> },
            // { name: 'Transactions', path: '/freelancer/finance/transactions', icon: <DollarSign size={18} /> },
            { name: 'Earnings', path: '/freelancer/finance/earnings', icon: <DollarSign size={18} /> },
            { name: 'Withdrawals', path: '/freelancer/finance/withdrawals', icon: <BanknoteArrowDown size={18} /> },
        ]
    },
    {
        type: 'dropdown',
        name: 'Profile',
        icon: <User size={20} />,
        isOpen: false,
        subItems: [
            { name: 'Profile Settings', path: '/freelancer/profile/settings', icon: <Settings size={18} /> },
            { name: 'Manage Portfolio', path: '/freelancer/profile/portfolio', icon: <Briefcase size={18} /> },
            { name: 'Billing Information', path: '/freelancer/profile/billing', icon: <CreditCard size={18} /> },
            { name: 'Account Settings', path: '/freelancer/profile/account', icon: <Shield size={18} /> },
        ]
    },
    // {
    //     type: 'dropdown',
    //     name: 'Clients',
    //     icon: <Users size={20} />,
    //     isOpen: false,
    //     subItems: [
    //         { name: 'All Clients', path: '/freelancer/clients/all', icon: <Users size={18} /> },
    //         { name: 'Active Projects', path: '/freelancer/clients/active', icon: <Briefcase size={18} /> },
    //         { name: 'Reviews', path: '/freelancer/clients/reviews', icon: <Award size={18} /> },
    //     ]
    // },
    // {
    //     type: 'dropdown',
    //     name: 'Support',
    //     icon: <HelpCircle size={20} />,
    //     isOpen: false,
    //     subItems: [
    //         { name: 'Help Center', path: '/freelancer/support/help', icon: <HelpCircle size={18} /> },
    //         { name: 'Messages', path: '/freelancer/support/messages', icon: <MessageSquare size={18} /> },
    //         { name: 'Tickets', path: '/freelancer/support/tickets', icon: <FileText size={18} /> },
    //     ]
    // },
    // {
    //     type: 'link',
    //     name: 'Notifications',
    //     path: '/freelancer/notifications',
    //     icon: <Bell size={20} />
    // },
    {
        type: 'link',
        name: 'Support',
        path: '/contact',
        icon: <Headphones size={20} />
    },
];

function Sidebar() {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [openDropdowns, setOpenDropdowns] = useState({});

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scrolling when sidebar is open on mobile
    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isMobile]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    const toggleDropdown = (dropdownName) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdownName]: !prev[dropdownName]
        }));
    };

    // Close dropdowns on mobile when sidebar closes
    useEffect(() => {
        if (!isOpen && isMobile) {
            setOpenDropdowns({});
        }
    }, [isOpen, isMobile]);

    // Check if any child link is active for dropdown parent highlighting
    const isDropdownActive = (subItems) => {
        return subItems.some(item =>
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/')
        );
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={toggleSidebar}
                className={`md:hidden ${isOpen && isMobile ? 'hidden' : 'fixed'} top-4 left-4 z-30 sm:z-40 p-2 rounded-md bg-gradient-to-r from-gray-800 to-gray-950 text-white`}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative w-64 bg-gradient-to-b from-gray-900 to-gray-950 text-white h-screen md:h-auto md:min-h-screen overflow-y-auto p-4 flex flex-col z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo/Brand */}
                <div className="px-4 mb-8 flex items-center justify-between pb-2">
                    <Link to={'/'}>
                        <img src={logo} className="h-10" alt="logo" />
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <ul className="space-y-1">
                        {navigationItems.map((item, index) => {
                            if (item.type === 'link') {
                                return (
                                    <li key={index}>
                                        <NavLink
                                            to={item.path}
                                            onClick={() => isMobile && setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center p-3 rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-white text-black shadow-lg'
                                                    : 'text-white hover:bg-white hover:text-black'
                                                }`
                                            }
                                        >
                                            <span className="mr-3">{item.icon}</span>
                                            <span>{item.name}</span>
                                        </NavLink>
                                    </li>
                                );
                            }

                            if (item.type === 'dropdown') {
                                const isActive = isDropdownActive(item.subItems);
                                const isOpen = openDropdowns[item.name] || false;

                                return (
                                    <li key={index}>
                                        <div className="relative">
                                            {/* Dropdown Trigger */}
                                            <button
                                                onClick={() => toggleDropdown(item.name)}
                                                className={`flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200 ${isActive || isOpen ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`}
                                            >
                                                <div className="flex items-center">
                                                    <span className="mr-3">{item.icon}</span>
                                                    <span>{item.name}</span>
                                                </div>
                                                <ChevronDown
                                                    size={16}
                                                    className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>

                                            {/* Dropdown Menu */}
                                            <div className={`
                                                overflow-hidden transition-all duration-200 ease-in-out
                                                ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                            `}>
                                                <div className="ml-2 mt-1 space-y-1 border-l-2 border-white/20 pl-2">
                                                    {item.subItems.map((subItem, subIndex) => (
                                                        <NavLink
                                                            key={subIndex}
                                                            to={subItem.path}
                                                            onClick={() => {
                                                                if (isMobile) setIsOpen(false);
                                                            }}
                                                            className={({ isActive }) =>
                                                                `flex items-center p-2 rounded transition-all duration-200 ${isActive
                                                                    ? 'text-white bg-white/20'
                                                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                                                }`
                                                            }
                                                        >
                                                            <span className="mr-2">{subItem.icon}</span>
                                                            <span className="text-sm">{subItem.name}</span>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            }

                            return null;
                        })}

                        {/* Log Out - Always at bottom */}
                        <li className="mt-8 pt-4 border-t border-white/20">
                            <button
                                onClick={logout}
                                className="flex items-center w-full p-3 rounded-lg text-white hover:bg-red-600 transition-all duration-200"
                            >
                                <LogOut size={20} className="mr-3" />
                                <span>Log Out</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
}

export default Sidebar;