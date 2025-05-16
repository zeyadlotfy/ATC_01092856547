"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BACKEND_URL } from "@/lib/constants/backend";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";
import {
    User,
    Mail,
    Calendar,
    Globe,
    Shield,
    LogOut,
    Check,
    Upload,
    Camera,
    Loader2,
    X,
    ChevronDown,
    Settings,
    Edit,
    Key,
    Clock,
    Save
} from "lucide-react";

interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "USER" | "ADMIN" | "ORGANIZER";
    isActive: boolean;
    profileImageUrl: string | null;
    language: string;
    createdAt: string;
    updatedAt: string;
}

const ProfilePage = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const { t, locale } = useTranslations();


    const fileInputRef = useRef<HTMLInputElement>(null);


    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);


    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
    });


    const isRtl = locale === "ar";
    const isDark = theme === "dark";

    useEffect(() => {
        fetchUserProfile();
    }, []);


    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);

        try {
            const accessToken = getCookie("accessToken");

            if (!accessToken) {
                toast.error(t("profile.unauthorized"));
                router.push("/login");
                return;
            }

            const response = await axios.get(`${BACKEND_URL}/users/profile`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.status === 200) {
                setUser(response.data);
                setEditForm({
                    firstName: response.data.firstName || "",
                    lastName: response.data.lastName || "",
                });
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setError("Failed to fetch user profile");
            toast.error(t("profile.errorFetching"));
            setLoading(false);
        }
    };


    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];


        if (file.size > 5 * 1024 * 1024) {
            toast.error(t("profile.fileTooLarge"));
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error(t("profile.invalidFileType"));
            return;
        }


        await uploadAvatar(file);
    };


    const uploadAvatar = async (file: File) => {
        setUploadingAvatar(true);

        try {
            const accessToken = getCookie("accessToken");

            if (!accessToken) {
                toast.error(t("profile.unauthorized"));
                return;
            }

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await axios.patch(
                `${BACKEND_URL}/users/profile/avatar`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200) {
                toast.success(t("profile.avatarUpdated"));

                await fetchUserProfile();
            }

            setUploadingAvatar(false);
        } catch (error) {
            console.error("Error uploading avatar:", error);
            toast.error(t("profile.avatarUpdateFailed"));
            setUploadingAvatar(false);
        }
    };


    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return t("profile.notAvailable");

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return t("profile.notAvailable");
            }
            return new Date(dateString)
        } catch (error) {
            console.error("Date formatting error:", error);
            return t("profile.notAvailable");
        }
    };

    const changeLanguage = async (newLanguage: string) => {
        try {
            if (typeof t === "function" && typeof (t as any).setLocale === "function") {
                (t as any).setLocale(newLanguage);
            }
            setShowLanguageMenu(false);


            if (user) {
                const accessToken = getCookie("accessToken");

                if (!accessToken) return;

                await axios.patch(
                    `${BACKEND_URL}/users/profile`,
                    { language: newLanguage },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Error updating language preference:", error);
        }
    };


    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const accessToken = getCookie("accessToken");

            if (!accessToken) {
                toast.error(t("profile.unauthorized"));
                return;
            }

            const response = await axios.patch(
                `${BACKEND_URL}/users/profile`,
                editForm,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            if (response.status === 200) {
                toast.success(t("profile.profileUpdated"));
                setUser(prev => prev ? { ...prev, ...editForm } : null);
                setIsEditingProfile(false);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(t("profile.updateFailed"));
        }
    };


    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };


    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            case "ORGANIZER":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            default:
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        }
    };


    const handleLogout = () => {

        document.cookie = "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";


        router.push('/login');
        toast.info(t("profile.loggedOut"));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center" dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 relative">
                        <div className="w-full h-full rounded-full border-4 border-purple-600/30"></div>
                        <div className="w-full h-full absolute top-0 left-0 rounded-full border-t-4 border-r-4 border-purple-600 animate-spin"></div>
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{t("profile.loading")}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t("profile.error")}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{t("profile.errorDescription")}</p>
                        <button
                            onClick={() => fetchUserProfile()}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            {t("profile.tryAgain")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                            <User className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t("profile.noUser")}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{t("profile.loginRequired")}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            {t("profile.goToLogin")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={isRtl ? "rtl" : "ltr"}>
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 h-48 md:h-64">
                        <div className="absolute inset-0 overflow-hidden opacity-10">
                            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white rounded-full"></div>
                            <div className="absolute -top-16 -left-16 w-96 h-96 bg-white rounded-full"></div>
                        </div>
                    </div>

                    <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="relative -mt-16 flex justify-center sm:-mt-24">
                            <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {user.profileImageUrl ? (
                                    <Image
                                        src={user.profileImageUrl}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 8rem, 10rem"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-500">
                                        <User className="h-16 w-16 text-white" />
                                    </div>
                                )}

                                <button
                                    onClick={triggerFileInput}
                                    disabled={uploadingAvatar}
                                    className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-md transition-colors"
                                    aria-label={t("profile.updateAvatar")}
                                >
                                    {uploadingAvatar ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Camera className="h-5 w-5" />
                                    )}
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <AnimatePresence mode="wait">
                                {isEditingProfile ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <form onSubmit={handleProfileUpdate} className="max-w-md mx-auto">
                                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                                {t("profile.editProfile")}
                                            </h2>

                                            <div className="space-y-4 mb-6">
                                                <div>
                                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        {t("profile.firstName")}
                                                    </label>
                                                    <input
                                                        id="firstName"
                                                        name="firstName"
                                                        type="text"
                                                        value={editForm.firstName}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        {t("profile.lastName")}
                                                    </label>
                                                    <input
                                                        id="lastName"
                                                        name="lastName"
                                                        type="text"
                                                        value={editForm.lastName}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-3 justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingProfile(false)}
                                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    {t("profile.cancel")}
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <Save className="h-4 w-4" />
                                                    {t("profile.saveChanges")}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {user.firstName} {user.lastName}
                                        </h1>

                                        <div className="mt-1 flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                                            <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-center space-x-2 rtl:space-x-reverse">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                                                <Shield className="w-3 h-3 mr-1" />
                                                {user.role}
                                            </span>

                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                <Check className="w-3 h-3 mr-1" />
                                                {user.isActive ? t("profile.active") : t("profile.inactive")}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => setIsEditingProfile(true)}
                                            className="mt-4 inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-colors"
                                        >
                                            <Edit className="w-4 h-4 mr-1.5" />
                                            {t("profile.edit")}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {t("profile.accountInfo")}
                                    </h3>
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {t("profile.memberSince")}
                                        </div>
                                        <div className="flex items-center mt-1 text-gray-700 dark:text-gray-300">
                                            <Calendar className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                                            {String(formatDate(user.createdAt))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {t("profile.lastUpdate")}
                                        </div>
                                        <div className="flex items-center mt-1 text-gray-700 dark:text-gray-300">
                                            <Clock className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" />
                                            {String(formatDate(user.updatedAt))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {t("profile.language")}
                                    </h3>
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {t("profile.currentLanguage")}
                                        </div>
                                        <div className="mt-1">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        {locale === 'ar' ? (
                                                            <>
                                                                <span className="mr-2 text-lg">🇸🇦</span>
                                                                <span>العربية</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="mr-2 text-lg">🇺🇸</span>
                                                                <span>English</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>

                                                {showLanguageMenu && (
                                                    <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                                                        <button
                                                            onClick={() => changeLanguage('en')}
                                                            className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${locale === 'en' ? 'bg-gray-100 dark:bg-gray-600 font-medium' : ''
                                                                }`}
                                                        >
                                                            <span className="mr-2 text-lg">🇺🇸</span>
                                                            <span>English</span>

                                                            {locale === 'en' && (
                                                                <Check className="ml-auto w-4 h-4 text-green-500" />
                                                            )}
                                                        </button>

                                                        <button
                                                            onClick={() => changeLanguage('ar')}
                                                            className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${locale === 'ar' ? 'bg-gray-100 dark:bg-gray-600 font-medium' : ''
                                                                }`}
                                                        >
                                                            <span className="mr-2 text-lg">🇸🇦</span>
                                                            <span>العربية</span>

                                                            {locale === 'ar' && (
                                                                <Check className="ml-auto w-4 h-4 text-green-500" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Security */}
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {t("profile.security")}
                                    </h3>
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <button
                                        onClick={() => router.push('/change-password')}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                                    >
                                        {t("profile.changePassword")}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {t("profile.actions")}
                                    </h3>
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                        <Settings className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-800/30 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 mr-1.5" />
                                        {t("profile.logout")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;