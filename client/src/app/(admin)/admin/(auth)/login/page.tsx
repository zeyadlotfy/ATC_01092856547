/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "@/hooks/useTranslations";
import { setCookie } from "cookies-next";
import { motion } from "framer-motion";
import { BACKEND_URL } from "@/lib/constants/backend";
import { useRouter } from "next/navigation";
import { getLoggedInAdmin } from "@/lib/backend/admin/getLoggedInAdmin";

const AdminLogin = () => {
    const { t, locale, isLoaded } = useTranslations();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState("light");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme("dark");
            document.documentElement.classList.add("dark");
        }
    }, []);

    useEffect(() => {
        isLoggedInAdmin();
    }, []);

    const isLoggedInAdmin = async () => {
        const admin = await getLoggedInAdmin();
        if (admin) {
            router.push("/admin/dashboard");
        }
    };

    const handleLanguageChange = () => {
        const newLocale = locale === "ar" ? "en" : "ar";
        setCookie("locale", newLocale);
        window.location.reload();
    };

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark");
    };

    const handleLogin = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error(t("login.validation.allFields"));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error(t("login.validation.validEmail"));
            return;
        }

        setLoading(true);
        try {

            const response = await axios.post(`${BACKEND_URL}/auth/login`, {
                email,
                password
            });

            if (response.status === 200 && response.data.user.role == "ADMIN") {

                toast.success(t("login.success"));
                setCookie("accessTokenAdmin", response.data.accessToken)
                setCookie("refreshTokenAdmin", response.data.refreshToken)
                router.push("/admin/dashboard");

            }
            else {
                toast.error(t("login.error.default"));
            }
        } catch (e) {
            toast.error(t("login.error.default"));
        }
        finally {
            setLoading(false);
        }
    };

    if (!isLoaded) return null;

    return (
        <div
            className={`min-h-screen flex flex-col items-center justify-center 
        ${theme === "dark" ? "dark bg-gray-900" : "bg-gradient-to-br from-purple-50 via-white to-purple-50"}`}
            dir={locale === "ar" ? "rtl" : "ltr"}
        >
            <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-purple-200 dark:bg-purple-900 opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-200 dark:bg-indigo-900 opacity-20 blur-3xl"></div>
            </div>

            <div className="absolute top-4 right-4 left-4 flex justify-between z-10">
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={toggleTheme}
                    className={`p-3 rounded-full hover:bg-white/20 transition-colors 
            ${theme === "dark" ? "text-yellow-200" : "text-gray-700"}`}
                    aria-label={theme === "dark" ? t("common.theme.light") : t("common.theme.dark")}
                >
                    {theme === "dark" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </motion.button>

                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={handleLanguageChange}
                    className={`px-4 py-2 rounded-full text-sm font-medium
            ${theme === "dark"
                            ? "bg-purple-900/30 text-purple-200 hover:bg-purple-800/50"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200"} 
            transition-all shadow-md`}
                >
                    {t("common.switchLanguage")}
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <div className={`p-8 rounded-2xl shadow-2xl backdrop-blur-sm
          ${theme === "dark"
                        ? "bg-gray-800/70 text-white border border-gray-700"
                        : "bg-white/80 text-gray-900 border border-purple-100"}`}
                >
                    <motion.div
                        className="flex justify-center mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400">
                            {t("login.title")}
                        </h2>
                        <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                            {t("login.subtitle")}
                        </p>
                    </motion.div>

                    <motion.form
                        className="mt-8 space-y-6"
                        onSubmit={handleLogin}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="space-y-4">
                            <div className="relative">
                                <label htmlFor="email-address" className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                    {t("login.email")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`pl-10 pr-3 py-3 w-full rounded-xl border-0 outline-none ring-1 ring-inset text-sm leading-6 
                      ${theme === "dark"
                                                ? "bg-gray-700/50 text-white ring-gray-600 placeholder-gray-400 focus:ring-purple-500"
                                                : "bg-white/60 text-gray-900 ring-gray-200 placeholder-gray-400 focus:ring-purple-500"} 
                      focus:ring-2 transition-all duration-200`}
                                        placeholder={t("login.emailPlaceholder")}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label htmlFor="password" className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                    {t("login.password")}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`pl-10 pr-12 py-3 w-full rounded-xl border-0 outline-none ring-1 ring-inset text-sm leading-6
                      ${theme === "dark"
                                                ? "bg-gray-700/50 text-white ring-gray-600 placeholder-gray-400 focus:ring-purple-500"
                                                : "bg-white/60 text-gray-900 ring-gray-200 placeholder-gray-400 focus:ring-purple-500"} 
                      focus:ring-2 transition-all duration-200`}
                                        placeholder={t("login.passwordPlaceholder")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"} hover:text-purple-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"} hover:text-purple-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div>
                            <motion.button
                                type="submit"
                                disabled={loading}
                                className={`relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-xl text-white 
                  ${loading
                                        ? "bg-purple-500 opacity-70 cursor-not-allowed"
                                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg transition-all duration-300`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : t("login.loginButton")}
                            </motion.button>
                        </div>
                    </motion.form>



                </div>
            </motion.div>



            <ToastContainer
                position={locale === "ar" ? "top-left" : "top-right"}
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={locale === "ar"}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme}
            />
        </div>
    );
};

export default AdminLogin;