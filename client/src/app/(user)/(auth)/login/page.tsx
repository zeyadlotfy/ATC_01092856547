"use client"
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Eye, EyeOff, ArrowLeft, Mail, LockKeyhole } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCookie } from 'cookies-next';
import { useTranslations } from '@/hooks/useTranslations';
import booklyLogo from '../../../favicon.ico';
import { BACKEND_URL } from '@/lib/constants/backend';
import { getLoggedInUser } from '@/lib/backend/user/getLoggedInUser';

export default function LoginPage() {
    const router = useRouter();
    const { t, locale, isLoaded } = useTranslations();
    const isRtl = locale === 'ar';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/auth/login`, {
                email,
                password,
            });

            if (response.status === 200) {
                const { accessToken, refreshToken } = response.data;


                setCookie('accessToken', accessToken);
                setCookie('refreshToken', refreshToken);


                window.dispatchEvent(new Event('user-login-success'));

                toast.success(t('user.login.loginSuccess'));
                router.push('/');
            } else {
                setError(t('user.login.invalidCredentials'));
                toast.error(t('user.login.invalidCredentials'));
            }
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.response?.status === 401) {
                setError(t('user.login.invalidCredentials'));
                toast.error(t('user.login.invalidCredentials'));
            } else {
                setError(t('user.login.serverError'));
                toast.error(t('user.login.serverError'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedInUser();
    }, []);

    const isLoggedInUser = async () => {
        const user = await getLoggedInUser();
        if (user) {
            router.push("/");
        }
    };


    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Link href="/" className="flex items-center group">
                        <Image
                            src={booklyLogo}
                            alt="Bookly Logo"
                            className="h-12 w-12 rounded-full transition-all duration-500 transform group-hover:scale-110"
                            width={48}
                            height={48}
                        />
                        <span className={`text-2xl font-bold text-purple-600 dark:text-purple-400 transition-transform duration-500 transform group-hover:scale-110 ${isRtl ? 'mr-2' : 'ml-2'}`}>
                            {isRtl ? 'بوكلى' : 'Bookly'}
                        </span>
                    </Link>
                </div>

                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    {t('user.login.title')}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('user.login.subtitle')}{' '}
                    <Link href="/register" className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300">
                        {t('user.login.registerHere')}
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300 rounded-md p-3 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('user.login.email')}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`appearance-none block w-full ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                    placeholder={t('user.login.emailPlaceholder')}
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('user.login.password')}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockKeyhole className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`appearance-none block w-full ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                    placeholder={t('user.login.passwordPlaceholder')}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <Eye className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember_me"
                                    name="remember_me"
                                    type="checkbox"
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                    {t('user.login.rememberMe')}
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300">
                                    {t('user.login.forgotPassword')}
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <LogIn className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                        {t('user.login.loginButton')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>


                </div>
            </div>

            <div className="mt-8">
                <Link href="/" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                    <ArrowLeft className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {t('user.login.backToHome')}
                </Link>
            </div>
        </div>
    );
}