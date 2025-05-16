"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Bell, Menu, X, LogIn, UserPlus, Calendar, Ticket } from 'lucide-react';
import booklyLogo from '../../../../app/favicon.ico';
import Image from 'next/image';
import { getLoggedInUser } from '@/lib/backend/user/getLoggedInUser';
import { useTranslations } from '@/hooks/useTranslations';
import { getCookie, setCookie } from 'cookies-next';
import UserDropdown from './UserDropdown';

export default function Navbar() {
    const router = useRouter();
    const { t, locale, isLoaded } = useTranslations();
    const isRtl = locale === 'ar';

    const [theme, setTheme] = useState('light');
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);


    const toggleLanguage = () => {
        const newLocale = locale === 'en' ? 'ar' : 'en';


        setCookie('locale', newLocale, { maxAge: 365 * 24 * 60 * 60 });


        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLocale;


        window.location.reload();
    };


    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', newTheme);
    };


    const checkLoginStatus = async () => {
        try {
            const userData = await getLoggedInUser();
            if (userData) {
                setIsLoggedIn(true);
                setUser(userData);
            } else {
                setIsLoggedIn(false);
                setUser(null);
            }
        } catch (error) {
            console.error("Error checking login status:", error);
            setIsLoggedIn(false);
            setUser(null);
        }
    };


    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') ||
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

            setTheme(savedTheme);

            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            }

            checkLoginStatus();


            const handleLoginSuccess = () => {
                checkLoginStatus();
            };

            const handleLogoutSuccess = () => {
                setIsLoggedIn(false);
                setUser(null);
            };

            window.addEventListener('user-login-success', handleLoginSuccess);
            window.addEventListener('user-logout-success', handleLogoutSuccess);


            return () => {
                window.removeEventListener('user-login-success', handleLoginSuccess);
                window.removeEventListener('user-logout-success', handleLogoutSuccess);
            };
        }
    }, []);


    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    useEffect(() => {
        if (isLoaded) {
            document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
            document.documentElement.lang = locale;
        }
    }, [isLoaded, isRtl, locale]);


    if (!isLoaded) {
        return (
            <div className="h-16 bg-white dark:bg-gray-900 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
                    <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <nav
            className={`sticky top-0 w-full z-50 transition-all duration-500 font-sans
                ${isScrolled
                    ? 'bg-white dark:bg-gray-900 shadow-lg translate-y-0'
                    : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'}`}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-between w-full">
                        {/* Logo on the right (for RTL) or left (for LTR) */}
                        <div className="flex-shrink-0 flex items-center group">
                            <Link href="/" className="flex items-center">
                                <Image
                                    src={booklyLogo}
                                    alt="Bookly Logo"
                                    className="h-10 w-10 rounded-full transition-all duration-500 transform group-hover:scale-110 hover:shadow-lg"
                                    width={40}
                                    height={40}
                                />
                                <span className={`text-2xl font-bold text-purple-600 dark:text-purple-400 transition-transform duration-500 transform group-hover:scale-110 ${isRtl ? 'mr-2' : 'ml-2'}`}>
                                    {isRtl ? 'بوكلى' : 'Bookly'}
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center">
                            <Link
                                href="/events"
                                className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ${isRtl ? 'ml-4' : 'mr-4'}`}
                            >
                                {t('user.navbar.events')}
                            </Link>

                            <Link
                                href="/venues"
                                className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ${isRtl ? 'ml-4' : 'mr-4'}`}
                            >
                                {t('user.navbar.venues')}
                            </Link>
                            {isLoggedIn && (
                                <Link
                                    href="/my-bookings"
                                    className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ${isRtl ? 'ml-4' : 'mr-4'}`}
                                >
                                    {t('user.navbar.myBookings')}
                                </Link>
                            )}
                        </div>

                        {/* Right Side Items (Theme toggle, auth buttons) */}
                        <div className="flex items-center">
                            {/* Language Switch - Modified to use direct cookie approach */}
                            <button
                                onClick={toggleLanguage}
                                className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ${isRtl ? 'ml-4' : 'mr-4'}`}
                            >
                                {locale === 'en' ? 'العربية' : 'English'}
                            </button>

                            {/* Theme toggle with enhanced animation */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 group"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? (
                                    <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200 transition-all duration-500" />
                                ) : (
                                    <Sun className="h-5 w-5 text-amber-400 transition-all duration-500 group-hover:animate-spin" />
                                )}
                            </button>

                            {/* Conditional rendering based on auth state */}
                            {isLoggedIn ? (
                                <div className={`flex items-center ${isRtl ? 'mr-4' : 'ml-4'}`}>
                                    {/* Notifications button with animation */}
                                    <button
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 relative hover:scale-110 mx-2"
                                        aria-label="Notifications"
                                    >
                                        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 bg-red-500 animate-ping"></span>
                                    </button>

                                    {/* User profile dropdown */}
                                    <UserDropdown user={user} />
                                </div>
                            ) : (

                                <div className={`flex items-center ${isRtl ? 'mr-4' : 'ml-4'}`}>
                                    {/* Login Button */}
                                    <Link href="/login" className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md">
                                        <LogIn className="h-4 w-4" />
                                        <span>{t('user.navbar.login')}</span>
                                    </Link>

                                    {/* Spacer div that works in both RTL and LTR */}
                                    <div className="w-3"></div>

                                    {/* Register Button */}
                                    <Link href="/register" className="flex items-center gap-1 px-4 py-2 border-2 border-purple-500 text-purple-600 dark:text-purple-400 dark:border-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-md">
                                        <UserPlus className="h-4 w-4" />
                                        <span>{t('user.navbar.register')}</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex md:hidden items-center justify-between w-full">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>

                        {/* Logo (centered) with enhanced animation */}
                        <div className="flex-shrink-0 flex items-center group">
                            <Link href="/" className="flex items-center">
                                <Image
                                    src={booklyLogo}
                                    alt="Bookly Logo"
                                    className="h-8 w-8 rounded-full transition-all duration-500 transform group-hover:rotate-12"
                                    width={32}
                                    height={32}
                                />
                                <span className={`text-xl font-bold text-purple-600 dark:text-purple-400 transition-all duration-300 ${isRtl ? 'mr-1' : 'ml-1'}`}>
                                    {isRtl ? 'بوكلى' : 'Bookly'}
                                </span>
                            </Link>
                        </div>

                        {/* Theme toggle and user icon */}
                        <div className="flex items-center">
                            {/* Theme toggle (left side for RTL) with enhanced animation */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 group"
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? (
                                    <Moon className="h-5 w-5 text-gray-700 dark:text-gray-200 transition-all duration-500" />
                                ) : (
                                    <Sun className="h-5 w-5 text-amber-400 transition-all duration-500 group-hover:animate-spin" />
                                )}
                            </button>

                            {/* User Icon for Mobile */}
                            {isLoggedIn ? (
                                <div className={`${isRtl ? 'mr-2' : 'ml-2'}`}>
                                    <UserDropdown user={user} isMobile={true} />
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className={`p-2 text-purple-600 dark:text-purple-400 transition-all duration-300 transform hover:scale-110 ${isRtl ? 'mr-2' : 'ml-2'}`}
                                >
                                    <LogIn className="h-5 w-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile menu, show/hide based on menu state */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg rounded-b-lg transition-all duration-300 transform origin-top">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link
                                href="/events"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="flex items-center">
                                    <Calendar className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                    {t('user.navbar.events')}
                                </div>
                            </Link>

                            <Link
                                href="/venues"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="flex items-center">
                                    <svg className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6z" clipRule="evenodd" />
                                    </svg>
                                    {t('user.navbar.venues')}
                                </div>
                            </Link>
                            {isLoggedIn && (
                                <Link
                                    href="/my-bookings"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <div className="flex items-center">
                                        <svg className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        {t('user.navbar.myBookings')}
                                    </div>
                                </Link>
                            )}

                            {/* Language switcher - Modified to use direct cookie approach */}
                            <button
                                onClick={() => {
                                    toggleLanguage();
                                    setMobileMenuOpen(false);
                                }}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                            >
                                <div className="flex items-center">
                                    <svg className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.027 7.232A9.97 9.97 0 010 10c0 .98.143 1.938.41 2.834l3.666-5.498a.75.75 0 00-.049-.104zm3.184-4.96A9.932 9.932 0 0110 1c2.138 0 4.15.68 5.789 1.842l-8.578-.57zM10 3c-1.683 0-3.293.346-4.754.966l1.ceee2-2.851A7.97 7.97 0 0110 3zm3.931 1.547l5.358 1.113A9.93 9.93 0 0120 10c0 .923-.126 1.817-.357 2.667l-5.528-1.276a.75.75 0 01-.422-.31L13.931 4.547zm-1.233 8.34l-1.732 4.02A9.956 9.956 0 0110 19a9.937 9.937 0 01-5.944-1.969l6.642-4.144zm-8.46-5.124L1.831 13.23A10.051 10.051 0 010 10c0-1.348.267-2.636.748-3.815l3.49-.422zM10 19a9.94 9.94 0 01-6.71-2.62l7.143-4.059A.75.75 0 0110 13a.75.75 0 01.567-1.679l4.872 1.53c.138.452.204.935.189 1.429L12.15 17.985A9.944 9.944 0 0110 19z" clipRule="evenodd" />
                                    </svg>
                                    {locale === 'en' ? 'العربية' : 'English'}
                                </div>
                            </button>

                            {/* Auth buttons for mobile */}
                            {!isLoggedIn && (
                                <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-2">
                                        <Link
                                            href="/login"
                                            className="w-full flex items-center justify-center  px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {t('user.navbar.login')}
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-base font-medium text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {t('user.navbar.register')}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}