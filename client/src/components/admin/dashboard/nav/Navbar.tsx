"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { setCookie, getCookie } from "cookies-next";
import { getLoggedInAdmin, logout } from "@/lib/backend/admin/getLoggedInAdmin";
import { useTranslations } from "@/hooks/useTranslations";
import Image from "next/image";
import logo from "../../../../app/favicon.ico";
import { BookUserIcon, ChartScatter, Home, ScreenShare } from "lucide-react";

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const BooksIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);



type Admin = {
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
};

const AdminNavbar = () => {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const { t, locale } = useTranslations();

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        let mounted = true;

        const checkAdmin = async () => {
            try {
                const res = await getLoggedInAdmin();

                if (!mounted) return;

                if (res) {
                    setAdmin(res);
                    setLoading(false);
                } else {
                    router.push('/admin/login');
                }
            } catch (error) {
                if (mounted) {
                    router.push('/admin/login');
                }
            }
        };

        checkAdmin();

        const tokenCheckInterval = setInterval(() => {
            if (mounted) {
                checkAdmin();
            }
        }, 5 * 60 * 1000);

        return () => {
            mounted = false;
            clearInterval(tokenCheckInterval);
        };
    }, [router]);


    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLanguageChange = () => {
        const newLocale = locale === "en" ? "ar" : "en";
        setCookie("locale", newLocale);
        window.location.reload();
    };

    const handleLogout = async () => {
        await logout();
        router.push('/admin/login');
    };

    const navItems = [
        { name: t("navigation.dashboard"), href: "/admin/dashboard", icon: <HomeIcon /> },
        { name: t("navigation.users"), href: "/admin/dashboard/users", icon: <UsersIcon /> },
        { name: t("navigation.events"), href: "/admin/dashboard/events", icon: <ScreenShare /> },
        { name: t("navigation.categories"), href: "/admin/dashboard/categories", icon: <ChartScatter /> },
        { name: t("navigation.tags"), href: "/admin/dashboard/tags", icon: <BooksIcon /> },
        { name: t("navigation.venues"), href: "/admin/dashboard/venues", icon: <Home /> },
        { name: t("navigation.bookings"), href: "/admin/dashboard/bookings", icon: <BookUserIcon /> },
        { name: t("navigation.settings"), href: "/admin/dashboard/settings", icon: <SettingsIcon /> },
    ];

    const isRtl = locale === "ar";

    return (
        <>
            <button
                onClick={toggleSidebar}
                className={`lg:hidden fixed z-50 top-4 ${isRtl ? "right-4" : "left-4"} p-2 rounded-md 
                ${theme === "dark"
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-white text-gray-800 hover:bg-gray-100"} 
                transition-colors shadow-md`}
                aria-label="Toggle menu"
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <div
                className={`fixed inset-y-0 ${isRtl ? "right-0" : "left-0"} w-64 
                ${theme === "dark" ? "bg-gray-900" : "bg-white"} 
                shadow-xl transition-transform duration-300 ease-in-out transform z-40 
                ${isOpen || window.innerWidth >= 1024 ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"} 
                lg:translate-x-0`}
            >
                <div className="h-full flex flex-col justify-between">
                    <div className="p-5">
                        <div className="flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="flex items-center"
                            >
                                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg ml-3 mr-3">
                                    <Image src={logo} alt="Logo" width={40} height={40} className="rounded-full" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    {locale === "ar" ? "بوكلى" : "Bookly"}
                                </h1>
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex-1 px-4 py-6 overflow-y-auto">
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname === item.href
                                        ? `${theme === "dark" ? "bg-purple-900/40 text-purple-200" : "bg-purple-100 text-purple-700"}`
                                        : `${theme === "dark" ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"}`
                                        }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className={`p-4 border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
                        <div className={`p-3 rounded-lg mb-4 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                            <div className="flex items-center">
                                <div className="relative">
                                    {admin && admin.avatarUrl ? (
                                        <img
                                            src={admin.avatarUrl}
                                            alt={admin.firstName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {admin ? (
                                                    <>
                                                        {admin.firstName?.charAt(0).toUpperCase()}{admin.lastName?.charAt(0).toUpperCase()}
                                                    </>
                                                ) : null}
                                            </span>
                                        </div>
                                    )}
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></span>
                                </div>
                                <div className="ml-3 mr-3">
                                    <p className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                        {admin ? `${admin.firstName} ${admin.lastName}` : ""}
                                    </p>
                                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                        {admin ? admin.email : ""}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg flex items-center justify-center
                                ${theme === "dark"
                                        ? "bg-gray-800 text-yellow-200 hover:bg-gray-700"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"} 
                                transition-colors`}
                                aria-label={theme === "dark" ? t("common.theme.light") : t("common.theme.dark")}
                                title={theme === "dark" ? t("common.theme.light") : t("common.theme.dark")}
                            >
                                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                            </button>

                            <button
                                onClick={handleLanguageChange}
                                className={`p-2 rounded-lg flex items-center justify-center text-sm font-medium
                                ${theme === "dark"
                                        ? "bg-gray-800 text-purple-200 hover:bg-gray-700"
                                        : "bg-gray-100 text-purple-700 hover:bg-gray-200"} 
                                transition-colors`}
                                title={t("common.switchLanguage")}
                            >
                                {locale === "en" ? "عربي" : "EN"}
                            </button>

                            <button
                                onClick={handleLogout}
                                className={`p-2 rounded-lg flex items-center justify-center
                                ${theme === "dark"
                                        ? "bg-gray-800 text-red-300 hover:bg-gray-700"
                                        : "bg-gray-100 text-red-600 hover:bg-gray-200"} 
                                transition-colors`}
                                title={t("common.logout")}
                            >
                                <LogoutIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};

export default AdminNavbar;