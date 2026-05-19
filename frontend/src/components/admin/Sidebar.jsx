import {
    LayoutDashboard,
    LogOut,
    Users,
    Briefcase,
    DollarSign,
    ShoppingBag,
    FileText,
    Shield,
    Settings,
    MessageSquare,
    HelpCircle,
    Bell,
    ChevronDown,
    X,
    Menu,
    BarChart3,
    PieChart,
    Activity,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Award,
    Flag,
    UserCheck,
    UserX,
    CreditCard,
    TrendingUp,
    Globe,
    Mail,
    Database,
    Server,
    ShieldAlert,
    Eye,
    Trash2,
    Edit,
    Plus,
    FolderOpen,
    RotateCcw,
    Tags,
    User,
    MapPin,
    Wrench
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { logo } from "../../assets";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

// Define navigation items for admin
const navigationItems = [
    {
        type: 'link',
        name: 'Dashboard',
        path: '/admin/dashboard',
        icon: <LayoutDashboard size={20} />
    },
    {
        type: 'link',
        name: 'Users',
        path: '/admin/users/all',
        icon: <Users size={20} />
    },
    // {
    //     type: 'link',
    //     name: 'Services',
    //     path: '/admin/services/all',
    //     icon: <Briefcase size={20} />
    // },
    {
        type: 'link',
        name: 'Projects',
        path: '/admin/projects/all',
        icon: <FolderOpen size={20} />
    },
    // {
    //     type: 'dropdown',
    //     name: 'Orders',
    //     icon: <DollarSign size={20} />,
    //     isOpen: false,
    //     subItems: [
    //         { name: 'All Orders', path: '/admin/orders', icon: <ShoppingBag size={18} /> },
    //         // { name: 'Transactions', path: '/admin/transactions', icon: <CreditCard size={18} /> },
    //         // { name: 'Withdrawals', path: '/admin/withdrawals', icon: <DollarSign size={18} /> },
    //         // { name: 'Platform Fees', path: '/admin/fees', icon: <TrendingUp size={18} /> },
    //         // { name: 'Disputes', path: '/admin/disputes', icon: <AlertCircle size={18} /> },
    //         // { name: 'Refunds', path: '/admin/refunds', icon: <RotateCcw size={18} /> },
    //     ]
    // },
    {
        type: 'link',
        name: 'Orders',
        path: '/admin/orders',
        icon: <ShoppingBag size={20} />
    },
    {
        type: 'link',
        name: 'Transactions',
        path: '/admin/transactions',
        icon: <CreditCard size={20} />
    },
    {
        type: 'link',
        name: 'Resolution Center',
        path: '/admin/resolutions',
        icon: <AlertCircle size={20} />
    },
    {
        type: 'link',
        name: 'Withdrawals',
        path: '/admin/withdrawals',
        icon: <DollarSign size={20} />
    },
    {
        type: 'link',
        name: 'Categories',
        path: '/admin/categories',
        icon: <Tags size={20} />
    },
    {
        type: 'link',
        name: 'Skills',
        path: '/admin/skills',
        icon: <Wrench size={20} />
    },
    // {
    //     type: 'dropdown',
    //     name: 'Analytics',
    //     icon: <BarChart3 size={20} />,
    //     isOpen: false,
    //     subItems: [
    //         { name: 'Overview', path: '/admin/analytics/overview', icon: <PieChart size={18} /> },
    //         { name: 'User Analytics', path: '/admin/analytics/users', icon: <Users size={18} /> },
    //         { name: 'Revenue Reports', path: '/admin/analytics/revenue', icon: <DollarSign size={18} /> },
    //         { name: 'Service Analytics', path: '/admin/analytics/services', icon: <Briefcase size={18} /> },
    //         { name: 'Growth Metrics', path: '/admin/analytics/growth', icon: <TrendingUp size={18} /> },
    //     ]
    // },
    // {
    //     type: 'dropdown',
    //     name: 'Moderation',
    //     icon: <Shield size={20} />,
    //     isOpen: false,
    //     subItems: [
    //         { name: 'Reported Content', path: '/admin/moderation/reported', icon: <Flag size={18} /> },
    //         { name: 'Reviews', path: '/admin/moderation/reviews', icon: <MessageSquare size={18} /> },
    //         { name: 'Messages', path: '/admin/moderation/messages', icon: <MessageSquare size={18} /> },
    //         { name: 'Flagged Users', path: '/admin/moderation/users', icon: <ShieldAlert size={18} /> },
    //     ]
    // },
    // {
    //     type: 'dropdown',
    //     name: 'Support',
    //     icon: <HelpCircle size={20} />,
    //     isOpen: false,
    //     subItems: [
    //         { name: 'Tickets', path: '/admin/support/tickets', icon: <Mail size={18} /> },
    //         { name: 'Disputes', path: '/admin/support/disputes', icon: <AlertCircle size={18} /> },
    //         { name: 'FAQs', path: '/admin/support/faqs', icon: <HelpCircle size={18} /> },
    //         { name: 'Announcements', path: '/admin/support/announcements', icon: <Bell size={18} /> },
    //     ]
    // },
    // {
    //     type: 'dropdown',
    //     name: 'Settings',
    //     icon: <Settings size={20} />,
    //     isOpen: false,
    //     subItems: [
    //         { name: 'General Settings', path: '/admin/settings/general', icon: <Settings size={18} /> },
    //         { name: 'Platform Settings', path: '/admin/settings/platform', icon: <Globe size={18} /> },
    //         { name: 'Payment Settings', path: '/admin/settings/payments', icon: <CreditCard size={18} /> },
    //         { name: 'Email Templates', path: '/admin/settings/email', icon: <Mail size={18} /> },
    //         { name: 'API Settings', path: '/admin/settings/api', icon: <Server size={18} /> },
    //         { name: 'Database', path: '/admin/settings/database', icon: <Database size={18} /> },
    //         { name: 'Security', path: '/admin/settings/security', icon: <Shield size={18} /> },
    //     ]
    // },
    // {
    //     type: 'link',
    //     name: 'Notifications',
    //     path: '/admin/notifications',
    //     icon: <Bell size={20} />
    // },
    {
        type: 'link',
        name: 'Profile',
        path: '/admin/profile',
        icon: <User size={20} />
    },
];

function Sidebar() {
    const { logout } = useAuth();
    const location = useLocation();
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

    // Close dropdowns on mobile when sidebar closes
    useEffect(() => {
        if (!isOpen && isMobile) {
            setOpenDropdowns({});
        }
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
                        <img src={logo} className="h-12" alt="logo" />
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Admin Badge */}
                <div className="mb-6 p-4 rounded-lg border-b border-white/20 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Shield size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-black">Admin Portal</p>
                            <p className="text-xs text-black">Super Admin</p>
                        </div>
                    </div>
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