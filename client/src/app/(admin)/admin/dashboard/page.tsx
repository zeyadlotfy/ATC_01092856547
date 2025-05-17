"use client";
import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    MapPin,
    Tag,
    TrendingUp,
    Activity,
    Clock,
    BookOpen,
    BarChart2,
    DollarSign
} from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/constants/backend';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { getLoggedInAdmin } from '@/lib/backend/admin/getLoggedInAdmin';
import { getCookie } from 'cookies-next';

type Admin = {
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
};
// Updated DashboardStats interface to match the backend response
interface DashboardStats {
    totalUsers: number;
    totalEvents: number;
    totalVenues: number;
    totalCategories: number;
    totalTags: number;
    totalBookings: number;
    activeUsers: number;
}

const AdminDashboard = () => {
    const { t, locale } = useTranslations();
    const { theme } = useTheme();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalEvents: 0,
        totalVenues: 0,
        totalCategories: 0,
        totalTags: 0,
        totalBookings: 0,
        activeUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [admin, setAdmin] = useState<Admin | null>(null);

    const isRtl = locale === 'ar';
    const isDark = theme === 'dark';

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };
    useEffect(() => {
        let mounted = true;

        const checkAdmin = async () => {
            try {
                const res = await getLoggedInAdmin();

                if (!mounted) return;

                if (res) {
                    setAdmin(res);
                    // Now that we have admin credentials, fetch the stats
                    fetchDashboardStats();
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
    const fetchDashboardStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const accessTokenAdmin = getCookie("accessTokenAdmin");

            const response = await axios.get(`${BACKEND_URL}/users/admin/stats`, {
                headers: {
                    Authorization: `Bearer ${accessTokenAdmin}`,
                }
            })
            if (response.status === 200) {
                setStats(response.data);
            } else {
                setError("Failed to load dashboard data");
            }
            setLoading(false);


        } catch (error) {
            console.error("Error fetching dashboard statistics:", error);
            setError("Failed to load dashboard data");
            setLoading(false);
        }
    };
    // Function to render stat cards
    const renderStatCard = (
        title: string,
        value: number | string,
        icon: React.ReactNode,
        color: string,
        onClick?: () => void
    ) => {
        return (
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 cursor-pointer transition-all duration-300 border-b-4 ${color}`}
                onClick={onClick}
            >
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {typeof value === 'number' && title.toLowerCase().includes('revenue')
                                ? `$${value.toLocaleString()}`
                                : value.toLocaleString()}
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('-500', '-100')} ${color.replace('border', 'text')}`}>
                        {icon}
                    </div>
                </div>
            </motion.div>
        );
    };

    // Greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('admin.dashboard.goodMorning');
        if (hour < 18) return t('admin.dashboard.goodAfternoon');
        return t('admin.dashboard.goodEvening');
    };

    // Current date formatted
    const getCurrentDate = () => {
        return new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-6 h-full flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-32 p-6">
                                <div className="flex justify-between">
                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 h-full flex flex-col items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="text-center">
                    <Activity className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('admin.dashboard.errorTitle')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {t('admin.dashboard.errorDescription')}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {t('common.refresh')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 h-full flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Dashboard Header */}
            <div className="mb-8">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-gray-900 dark:text-white"
                >
                    {getGreeting()}, {admin?.firstName} {admin?.lastName}!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600 dark:text-gray-400 mt-2"
                >
                    {getCurrentDate()} | {t('admin.dashboard.welcome')}
                </motion.p>
            </div>

            {/* Quick Stats Overview */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
                {renderStatCard(
                    t('admin.dashboard.totalUsers'),
                    stats.totalUsers,
                    <Users className="h-6 w-6" />,
                    'border-blue-500',
                    () => router.push('/admin/dashboard/users')
                )}

                {renderStatCard(
                    t('admin.dashboard.totalEvents'),
                    stats.totalEvents,
                    <Calendar className="h-6 w-6" />,
                    'border-purple-500',
                    () => router.push('/admin/dashboard/events')
                )}

                {renderStatCard(
                    t('admin.dashboard.totalVenues'),
                    stats.totalVenues,
                    <MapPin className="h-6 w-6" />,
                    'border-green-500',
                    () => router.push('/admin/dashboard/venues')
                )}

                {renderStatCard(
                    t('admin.dashboard.totalBookings'),
                    stats.totalBookings,
                    <BookOpen className="h-6 w-6" />,
                    'border-amber-500',
                    () => router.push('/admin/dashboard/bookings')
                )}
            </motion.div>

            {/* Second Row Stats */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{ delayChildren: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
                {renderStatCard(
                    t('admin.dashboard.activeUsers'),
                    stats.activeUsers,
                    <Activity className="h-6 w-6" />,
                    'border-teal-500'
                )}

                {renderStatCard(
                    t('admin.dashboard.categories'),
                    stats.totalCategories,
                    <Tag className="h-6 w-6" />,
                    'border-rose-500',
                    () => router.push('/admin/dashboard/categories')
                )}

                {renderStatCard(
                    t('admin.dashboard.tags'),
                    stats.totalTags,
                    <Tag className="h-6 w-6" />,
                    'border-indigo-500',
                    () => router.push('/admin/dashboard/tags')
                )}
            </motion.div>

            {/* System Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('admin.dashboard.systemStatus')}
                    </h2>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full dark:bg-green-900 dark:text-green-200">
                        {t('admin.dashboard.allSystemsOperational')}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">{t('admin.dashboard.apiStatus')}</span>
                    </div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">{t('admin.dashboard.databaseStatus')}</span>
                    </div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">{t('admin.dashboard.storageStatus')}</span>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-6"
            >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('admin.dashboard.quickActions')}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => router.push('/admin/events/add')}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all hover:bg-indigo-50 dark:hover:bg-gray-700"
                    >
                        <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('admin.dashboard.addEvent')}
                        </span>
                    </button>

                    <button
                        onClick={() => router.push('/admin/users/add')}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all hover:bg-indigo-50 dark:hover:bg-gray-700"
                    >
                        <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('admin.dashboard.addUser')}
                        </span>
                    </button>

                    <button
                        onClick={() => router.push('/admin/venues/add')}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all hover:bg-indigo-50 dark:hover:bg-gray-700"
                    >
                        <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('admin.dashboard.addVenue')}
                        </span>
                    </button>

                    <button
                        onClick={() => router.push('/admin/bookings')}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all hover:bg-indigo-50 dark:hover:bg-gray-700"
                    >
                        <BarChart2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('admin.dashboard.viewReports')}
                        </span>
                    </button>
                </div>
            </motion.div> */}
        </div>
    );
};

export default AdminDashboard;