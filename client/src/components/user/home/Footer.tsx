import React from "react";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    ChevronRight,
    ChevronLeft,
    ExternalLink,
} from "lucide-react";

const Footer: React.FC = () => {
    const { t, locale } = useTranslations();
    const { theme } = useTheme();
    const isRtl = locale === "ar";
    const isDark = theme === "dark";
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-gray-900 text-gray-300" dir={isRtl ? "rtl" : "ltr"}>
            <div className="pt-16 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Logo & About */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="flex items-center mb-5">
                                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                                    {isRtl ? 'بوكلى' : 'Bookly'}
                                </span>
                            </div>

                            <p className="mb-4 text-gray-400 text-sm">
                                {t("footer.about")}
                            </p>

                            <div className="flex space-x-4 rtl:space-x-reverse mt-6">
                                <a
                                    href="#"
                                    aria-label="Facebook"
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-purple-600 transition-colors"
                                >
                                    <Facebook size={18} />
                                </a>
                                <a
                                    href="#"
                                    aria-label="Twitter"
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-purple-600 transition-colors"
                                >
                                    <Twitter size={18} />
                                </a>
                                <a
                                    href="#"
                                    aria-label="Instagram"
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-purple-600 transition-colors"
                                >
                                    <Instagram size={18} />
                                </a>
                                <a
                                    href="#"
                                    aria-label="LinkedIn"
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-purple-600 transition-colors"
                                >
                                    <Linkedin size={18} />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-white">
                                {t("footer.quickLinks")}
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/" className="inline-flex items-center hover:text-purple-400 transition-colors">
                                        {isRtl ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                        {t("footer.links.home")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/events" className="inline-flex items-center hover:text-purple-400 transition-colors">
                                        {isRtl ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                        {t("footer.links.events")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/venues" className="inline-flex items-center hover:text-purple-400 transition-colors">
                                        {isRtl ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                        {t("footer.links.venues")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="inline-flex items-center hover:text-purple-400 transition-colors">
                                        {isRtl ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                        {t("footer.links.about")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="inline-flex items-center hover:text-purple-400 transition-colors">
                                        {isRtl ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                        {t("footer.links.contact")}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* User Account */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-white">
                                {t("footer.userAccount")}
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/login" className="inline-flex items-center hover:text-purple-400 transition-colors">
                                        {isRtl ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                        {t("footer.links.login")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/register" className="inline-flex items-center hover:text-purple-400 transition-colors">
                                        {isRtl ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                        {t("footer.links.register")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/profile" className="inline-flex items-center hover:text-purple-400 transition-colors">
                                        {isRtl ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                        {t("footer.links.profile")}
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/my-bookings" className="inline-flex items-center hover:text-purple-400 transition-colors">
                                        {isRtl ? <ChevronLeft className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                        {t("footer.links.bookings")}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact & Language */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-white">
                                {t("footer.contact")}
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <Mail className={`h-5 w-5 mt-0.5 ${isRtl ? 'ml-3' : 'mr-3'} text-purple-500`} />
                                    <span>info@bookly.com</span>
                                </li>
                                <li className="flex items-start">
                                    <Phone className={`h-5 w-5 mt-0.5 ${isRtl ? 'ml-3' : 'mr-3'} text-purple-500`} />
                                    <span>+1 (800) 123-4567</span>
                                </li>
                                <li className="flex items-start">
                                    <MapPin className={`h-5 w-5 mt-0.5 ${isRtl ? 'ml-3' : 'mr-3'} text-purple-500`} />
                                    <span>{t("footer.address")}</span>
                                </li>
                            </ul>


                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-6 md:mb-0">
                            <h3 className="text-lg font-semibold text-white mb-1">
                                {t("footer.newsletter.title")}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {t("footer.newsletter.subtitle")}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder={t("footer.newsletter.placeholder")}
                                className={`px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isRtl ? 'text-right' : 'text-left'}`}
                            />
                            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                                {t("footer.newsletter.button")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="text-center md:text-left text-sm text-gray-400 mb-4 md:mb-0">
                            <span>© {currentYear} Bookly. </span>
                            <span>{t("footer.copyright")}</span>
                        </div>
                        <div className="flex justify-center md:justify-end space-x-6 rtl:space-x-reverse">
                            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                                {t("footer.links.terms")}
                            </Link>
                            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                                {t("footer.links.privacy")}
                            </Link>
                            <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                                {t("footer.links.faq")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;