"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logout } from '@/lib/backend/user/getLoggedInUser';
import { useTranslations } from '@/hooks/useTranslations';
import { ChevronDown, User, Calendar, Settings, LogOut } from 'lucide-react';
import defaultAvatar from '../../../../app/favicon.ico';

interface UserDropdownProps {
    user: any;
    isMobile?: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, isMobile = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t, locale } = useTranslations();
    const isRtl = locale === 'ar';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();

    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center ${isMobile ? '' : 'space-x-2'} ${isRtl && !isMobile ? 'space-x-reverse' : ''} focus:outline-none`}
            >
                <div className="relative">
                    <Image
                        src={user.imageUrl || defaultAvatar}
                        alt="User avatar"
                        className={`rounded-full ${isMobile ? 'h-8 w-8' : 'h-9 w-9'} object-cover border-2 border-purple-500 hover:border-purple-600 transition-all duration-300 hover:scale-105`}
                        width={36}
                        height={36}
                    />
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 bg-green-500"></span>
                </div>
                {!isMobile && (
                    <>
                        <span className={`${isRtl ? 'mr-2' : 'ml-2'} text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-300`}>
                            {user.name || user.email?.split('@')[0]}
                        </span>
                        <ChevronDown
                            className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''
                                }`}
                        />
                    </>
                )}
            </button>

            {isOpen && (
                <div
                    className={`absolute ${isRtl ? 'right-0' : 'left-0'} mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 transition-all duration-300 ease-in-out`}
                >
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                        onClick={() => setIsOpen(false)}
                    >
                        <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        {t('user.dropdown.profile')}
                    </Link>
                    <Link
                        href="/my-bookings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                        onClick={() => setIsOpen(false)}
                    >
                        <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        {t('user.dropdown.myBookings')}
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                    >
                        <LogOut className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        {t('user.dropdown.logout')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;