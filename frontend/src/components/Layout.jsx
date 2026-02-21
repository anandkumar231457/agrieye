import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider } from './Toast';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Camera,
    ShieldAlert,
    Calendar,
    Menu,
    X,
    Leaf,
    User,
    LogOut,
    Languages
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
        { path: '/monitoring', label: t('sidebar.monitoring'), icon: Camera },
        { path: '/severity', label: t('sidebar.severity') || 'Risk Analysis', icon: ShieldAlert },
        { path: '/schedule', label: t('sidebar.history'), icon: Calendar },
    ];

    return (
        <ToastProvider>
            <div className="min-h-screen bg-[#F5F7F6] font-inter text-gray-900">
                {/* Desktop Minimal Sidebar */}
                <aside className="fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col z-40">
                    {/* Logo */}
                    <div className="p-8 pb-12">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-3 rounded-2xl">
                                <Leaf className="w-6 h-6 text-brand-main" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-900">AgriEye</span>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Enterprise AI</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-6">
                        <p className="px-4 text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-4">
                            Core Platform
                        </p>
                        <div className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link key={item.path} to={item.path}>
                                        <motion.div
                                            whileHover={{ x: 2 }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-green-50 text-brand-main'
                                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-main' : ''}`} />
                                            <span className={`font-semibold text-sm ${isActive ? 'text-brand-main' : ''}`}>
                                                {item.label}
                                            </span>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* User Profile */}
                    <div className="p-6 border-t border-gray-100">
                        <Link to="/profile" className="block mb-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                {user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full border-2 border-green-100"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        View Profile
                                    </p>
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-semibold">{t('sidebar.logout')}</span>
                        </button>
                    </div>

                    {/* Language Switcher */}
                    <div className="p-6 border-t border-gray-100">
                        <p className="px-4 text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">
                            {t('common.language')}
                        </p>
                        <div className="flex gap-2 px-4">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={`px-2 py-1 rounded text-xs font-bold ${i18n.language === 'en' ? 'bg-brand-main text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('hi')}
                                className={`px-2 py-1 rounded text-xs font-bold ${i18n.language === 'hi' ? 'bg-brand-main text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                HI
                            </button>
                            <button
                                onClick={() => changeLanguage('pa')}
                                className={`px-2 py-1 rounded text-xs font-bold ${i18n.language === 'pa' ? 'bg-brand-main text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                PA
                            </button>
                            <button
                                onClick={() => changeLanguage('ta')}
                                className={`px-2 py-1 rounded text-xs font-bold ${i18n.language === 'ta' ? 'bg-brand-main text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                TA
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Mobile Header */}
                <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 lg:hidden z-50 px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-xl">
                            <Leaf className="w-5 h-5 text-brand-main" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">AgriEye</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </header>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -300 }}
                            className="fixed inset-0 bg-white z-40 lg:hidden pt-16"
                        >
                            <nav className="p-6">
                                <p className="px-4 text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-4">
                                    Core Platform
                                </p>
                                <div className="space-y-1">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                                        ? 'bg-green-50 text-brand-main'
                                                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-main' : ''}`} />
                                                    <span className={`font-semibold text-sm ${isActive ? 'text-brand-main' : ''}`}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="p-6 lg:p-12"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </ToastProvider>
    );
};

export default Layout;
