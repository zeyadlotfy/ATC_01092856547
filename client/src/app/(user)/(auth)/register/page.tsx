"use client"
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserPlus, Eye, EyeOff, ArrowLeft, Mail, LockKeyhole, User } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setCookie } from 'cookies-next';
import { useTranslations } from '@/hooks/useTranslations';
import booklyLogo from '../../../favicon.ico';
import { BACKEND_URL } from '@/lib/constants/backend';
import { getLoggedInUser } from '@/lib/backend/user/getLoggedInUser';

export default function RegisterPage() {
    const router = useRouter();
    const { t, locale, isLoaded } = useTranslations();
    const isRtl = locale === 'ar';

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
    }>({});

    const validate = () => {
        const newErrors: any = {};
        let isValid = true;

        if (!firstName.trim()) {
            newErrors.firstName = t('user.register.firstNameRequired');
            isValid = false;
        }

        if (!lastName.trim()) {
            newErrors.lastName = t('user.register.lastNameRequired');
            isValid = false;
        }

        if (!email) {
            newErrors.email = t('user.register.emailRequired');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = t('user.register.emailInvalid');
            isValid = false;
        }

        if (!password) {
            newErrors.password = t('user.register.passwordRequired');
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = t('user.register.passwordTooShort');
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setErrors({});

        if (!validate()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/auth/register`, {
                firstName,
                lastName,
                email,
                password,
            });

            if (response.status === 201) {
                toast.success(t('user.register.registerSuccess'));
                router.push('/verify-email');
            }
            else {
                setError(t('user.register.registerError'));
                toast.error(t('user.register.registerError'));
            }
        } catch (err: any) {
            console.error('Registration error:', err);

            if (err.response?.status === 409) {
                setError(t('user.register.emailAlreadyExists'));
                toast.error(t('user.register.emailAlreadyExists'));
            } else if (err.response?.data?.errors) {

                const serverErrors = err.response.data.errors;
                const fieldErrors: any = {};

                serverErrors.forEach((error: any) => {
                    if (error.field === 'email') fieldErrors.email = error.message;
                    if (error.field === 'password') fieldErrors.password = error.message;
                    if (error.field === 'firstName') fieldErrors.firstName = error.message;
                    if (error.field === 'lastName') fieldErrors.lastName = error.message;
                });

                setErrors(fieldErrors);
            } else {
                setError(t('user.register.serverError'));
                toast.error(t('user.register.serverError'));
            }
        } finally {
            setIsLoading(false);
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
                    {t('user.register.title')}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('user.register.subtitle')}{' '}
                    <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300">
                        {t('user.register.loginHere')}
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

                        {/* First Name */}
                        <div>
                            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('user.register.firstName')}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="first-name"
                                    name="first-name"
                                    type="text"
                                    autoComplete="given-name"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className={`appearance-none block w-full ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} py-2 border ${errors.firstName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                    placeholder={t('user.register.firstNamePlaceholder')}
                                />
                            </div>
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('user.register.lastName')}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="last-name"
                                    name="last-name"
                                    type="text"
                                    autoComplete="family-name"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className={`appearance-none block w-full ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} py-2 border ${errors.lastName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                    placeholder={t('user.register.lastNamePlaceholder')}
                                />
                            </div>
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('user.register.email')}
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
                                    className={`appearance-none block w-full ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} py-2 border ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                    placeholder={t('user.register.emailPlaceholder')}
                                    dir="ltr"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('user.register.password')}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockKeyhole className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`appearance-none block w-full ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} py-2 border ${errors.password ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                    placeholder={t('user.register.passwordPlaceholder')}
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
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {t('user.register.passwordRequirements')}
                            </p>
                        </div>

                        {/* Terms of Service */}
                        <div className="flex items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className={`${isRtl ? 'mr-2' : 'ml-2'} block text-sm text-gray-900 dark:text-gray-300`}>
                                {t('user.register.agreeToTerms')}{' '}
                                <Link href="/terms" className="text-purple-600 hover:text-purple-500 dark:text-purple-400">
                                    {t('user.register.termsOfService')}
                                </Link>
                            </label>
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
                                        <UserPlus className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                        {t('user.register.registerButton')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                                    {t('user.register.orContinueWith')}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                            >
                                <span className="sr-only">Sign up with Google</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12.545 12.151c0 .866-.563 1.599-1.348 1.856v-3.712c.785.257 1.348.99 1.348 1.856zm-.702-3.267v1.06c-.179-.052-.367-.085-.572-.085-1.105 0-2.002.9-2.002 2.007s.896 2.007 2.002 2.007c.205 0 .393-.033.572-.085v1.06c-.183.042-.376.064-.572.064-1.682 0-3.045-1.367-3.045-3.046s1.363-3.046 3.045-3.046c.196 0 .389.022.572.064zm6.229 1.691l-1.369-.79v-.002L12 7.582v10.836l4.703-2.199 1.369-.79z" />
                                    <path d="M20.345 14.355c0-.169-.032-.331-.091-.482l-3.064-5.321c-.288-.5-.822-.809-1.397-.809H8.207c-.575 0-1.109.309-1.397.809L3.746 13.873c-.059.151-.091.313-.091.482v3.09c0 .74.596 1.337 1.335 1.337h14.02c.739 0 1.335-.597 1.335-1.337v-3.09z" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                            >
                                <span className="sr-only">Sign up with Facebook</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                    <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <Link href="/" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                    <ArrowLeft className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {t('user.register.backToHome')}
                </Link>
            </div>
        </div>
    );
}