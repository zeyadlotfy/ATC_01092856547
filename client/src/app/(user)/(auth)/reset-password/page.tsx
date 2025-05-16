"use client"
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { KeyRound, ArrowLeft, Mail, CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslations } from '@/hooks/useTranslations';
import booklyLogo from '../../../favicon.ico';
import { BACKEND_URL } from '@/lib/constants/backend';
import { getLoggedInUser } from '@/lib/backend/user/getLoggedInUser';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { t, locale, isLoaded } = useTranslations();
    const isRtl = locale === 'ar';

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);


    useEffect(() => {
        const checkLoggedInStatus = async () => {
            const user = await getLoggedInUser();
            if (user) {
                router.push("/");
            }
        };

        checkLoggedInStatus();
    }, [router]);

    const handleOtpChange = (index: number, value: string) => {

        const digitsOnly = value.replace(/\D/g, '');

        if (digitsOnly.length > 1) {

            const digits = digitsOnly.split('').slice(0, 6);
            const newOtp = [...otp];

            digits.forEach((digit, i) => {
                if (i < 6) {
                    newOtp[i] = digit;
                }
            });

            setOtp(newOtp);


            if (digits.length >= 6) {
                document.getElementById(`otp-5`)?.focus();
            } else {

                const focusIndex = Math.min(digits.length, 5);
                document.getElementById(`otp-${focusIndex}`)?.focus();
            }
        } else {

            if (digitsOnly && /^\d$/.test(digitsOnly)) {
                const newOtp = [...otp];
                newOtp[index] = digitsOnly;
                setOtp(newOtp);


                if (index < 5) {
                    setTimeout(() => {
                        document.getElementById(`otp-${index + 1}`)?.focus();
                    }, 10);
                }
            } else if (value === '') {

                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };


    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Backspace':

                if (otp[index] === '' && index > 0) {
                    document.getElementById(`otp-${index - 1}`)?.focus();


                    const newOtp = [...otp];
                    newOtp[index - 1] = '';
                    setOtp(newOtp);
                } else {

                    const newOtp = [...otp];
                    newOtp[index] = '';
                    setOtp(newOtp);
                }
                break;
            case 'ArrowLeft':
                if (index > 0) {
                    document.getElementById(`otp-${index - 1}`)?.focus();
                }
                break;
            case 'ArrowRight':
                if (index < 5) {
                    document.getElementById(`otp-${index + 1}`)?.focus();
                }
                break;
            default:

                break;
        }
    };


    const validate = () => {
        if (!email) {
            setError(t('user.resetPassword.emailRequired'));
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('user.resetPassword.emailInvalid'));
            return false;
        }

        const otpString = otp.join('');
        if (otpString.length !== 6 || !/^\d+$/.test(otpString)) {
            setError(t('user.resetPassword.invalidOtp'));
            return false;
        }

        if (!newPassword) {
            setError(t('user.resetPassword.passwordRequired'));
            return false;
        }

        if (newPassword.length < 8) {
            setError(t('user.resetPassword.passwordTooShort'));
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError(t('user.resetPassword.passwordsDoNotMatch'));
            return false;
        }

        return true;
    };


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validate()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/auth/reset-password`, {
                email,
                otp: otp.join(''),
                newPassword
            });

            if (response.status === 200 || response.status === 201) {
                setSuccess(true);
                toast.success(t('user.resetPassword.successMessage'));


                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(t('user.resetPassword.resetError'));
                toast.error(t('user.resetPassword.resetError'));
            }
        } catch (err: any) {
            console.error('Password reset error:', err);

            if (err.response?.status === 400) {

                setError(t('user.resetPassword.invalidOtp'));
                toast.error(t('user.resetPassword.invalidOtp'));
            } else if (err.response?.status === 404) {

                setError(t('user.resetPassword.emailNotFound'));
                toast.error(t('user.resetPassword.emailNotFound'));
            } else {
                setError(t('user.resetPassword.serverError'));
                toast.error(t('user.resetPassword.serverError'));
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
                    {t('user.resetPassword.title')}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('user.resetPassword.subtitle')}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {success ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                                {t('user.resetPassword.successTitle')}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {t('user.resetPassword.successDescription')}
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/login"
                                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-300"
                                >
                                    {t('user.resetPassword.goToLogin')}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300 rounded-md p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('user.resetPassword.email')}
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
                                        placeholder={t('user.resetPassword.emailPlaceholder')}
                                        dir="ltr"
                                    />
                                </div>
                            </div>


                            {/* OTP Input */}
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('user.resetPassword.otpCode')}
                                </label>
                                <div className="mt-3 flex justify-center space-x-2 rtl:space-x-reverse">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={(e) => {
                                                e.preventDefault();
                                                const pastedData = e.clipboardData.getData('text');
                                                handleOtpChange(index, pastedData);
                                            }}
                                            className="w-12 h-12 text-center text-xl font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                            autoComplete="one-time-code"
                                            inputMode="numeric"
                                            pattern="\d*"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('user.resetPassword.newPassword')}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockKeyhole className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="new-password"
                                        name="new-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={`appearance-none block w-full ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                        placeholder={t('user.resetPassword.newPasswordPlaceholder')}
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
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {t('user.resetPassword.passwordRequirements')}
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('user.resetPassword.confirmPassword')}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockKeyhole className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`appearance-none block w-full ${isRtl ? 'pr-3 pl-10' : 'pl-10 pr-3'} py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                        placeholder={t('user.resetPassword.confirmPasswordPlaceholder')}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" aria-hidden="true" />
                                            ) : (
                                                <Eye className="h-5 w-5" aria-hidden="true" />
                                            )}
                                        </button>
                                    </div>
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
                                            <KeyRound className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                            {t('user.resetPassword.resetButton')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <Link href="/" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                    <ArrowLeft className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {t('user.resetPassword.backToHome')}
                </Link>
            </div>
        </div>
    );
}